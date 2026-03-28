const input = document.getElementById("repoInput");
const btn = document.getElementById("assessBtn");
const resultDiv = document.getElementById("result");
const loading = document.getElementById("loading");

const CACHE_KEY = "repoready_cache";

// EVENTS
btn.addEventListener("click", handleAssessment);
input.addEventListener("keypress", e => {
    if (e.key === "Enter") handleAssessment();
});

// PARSE ANY GITHUB URL
function extractRepo(input) {
    input = input.trim();

    // Remove .git
    input = input.replace(".git", "");

    // If full URL
    if (input.includes("github.com")) {
        const parts = input.split("github.com/")[1].split("/");
        return {
            owner: parts[0],
            repo: parts[1]
        };
    }

    // If owner/repo
    const parts = input.split("/");
    if (parts.length === 2) {
        return { owner: parts[0], repo: parts[1] };
    }

    return null;
}

// CACHE
function getCache() {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
}

function setCache(key, data) {
    const cache = getCache();
    cache[key] = { data, time: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

// LOADING
function showLoading(state) {
    loading.classList.toggle("hidden", !state);
    btn.disabled = state;
}

// ERROR
function showError(msg) {
    resultDiv.innerHTML = `<div class="result-card error">❌ ${msg}</div>`;
}

// MAIN
async function handleAssessment() {
    const parsed = extractRepo(input.value);

    if (!parsed) {
        showError("Invalid GitHub URL or format");
        return;
    }

    const { owner, repo } = parsed;
    const key = `${owner}/${repo}`;

    const cache = getCache();
    if (cache[key]) {
        render(cache[key].data);
        alert("Loaded from cache ⚡");
        return;
    }

    showLoading(true);

    try {
        const data = await assessRepository(owner, repo);
        render(data);
        setCache(key, data);
    } catch (err) {
        showError(err.message);
    } finally {
        showLoading(false);
    }
}

// FETCH
async function assessRepository(owner, repo) {
    const base = `https://api.github.com/repos/${owner}/${repo}`;

    const [repoRes, readmeRes, tagsRes] = await Promise.all([
        fetch(base),
        fetch(`${base}/readme`).catch(() => null),
        fetch(`${base}/tags`).catch(() => null)
    ]);

    if (!repoRes.ok) {
        throw new Error("Repository not found or API error");
    }

    const repoData = await repoRes.json();

    let readme = "";
    if (readmeRes && readmeRes.ok) {
        const data = await readmeRes.json();
        readme = atob(data.content);
    }

    let tags = [];
    if (tagsRes && tagsRes.ok) {
        tags = await tagsRes.json();
    }

    const score = calculateScore(repoData, readme, tags);

    return {
        name: repoData.full_name,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        issues: repoData.open_issues,
        score
    };
}

// SCORE
function calculateScore(repo, readme, tags) {
    let score = 0;

    if (repo.stargazers_count > 1000) score += 30;
    if (repo.forks_count > 100) score += 20;
    if (repo.open_issues < 50) score += 10;

    if (/install|usage|setup/i.test(readme)) score += 20;
    if (tags.length > 0) score += 20;

    return Math.min(score, 100);
}

// AI INSIGHT
function generateInsight(score) {
    if (score >= 80) return "🚀 Excellent: Research-ready";
    if (score >= 60) return "⚠️ Good: Minor improvements needed";
    if (score >= 40) return "❗ Fair: Needs work";
    return "🚨 Poor: Not research-ready";
}

// RENDER
function render(data) {
    resultDiv.innerHTML = `
        <div class="result-card">
            <h2>${data.name}</h2>

            <p>⭐ Stars: ${data.stars}</p>
            <p>🍴 Forks: ${data.forks}</p>
            <p>🐛 Issues: ${data.issues}</p>

            <h3>Score: ${data.score}/100</h3>

            <div class="progress-bar">
                <div class="progress-fill" style="width:${data.score}%"></div>
            </div>

            <div class="ai">${generateInsight(data.score)}</div>
        </div>
    `;
}
