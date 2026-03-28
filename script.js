const input = document.getElementById("repoInput");
const btn = document.getElementById("assessBtn");
const resultDiv = document.getElementById("result");
const loading = document.getElementById("loading");

const CACHE_KEY = "repoready_cache";
const GITHUB_TOKEN = ""; // OPTIONAL (add your token here)

// EVENTS
btn.addEventListener("click", handleAssessment);
input.addEventListener("keypress", e => {
    if (e.key === "Enter") handleAssessment();
});

// LOADING
function showLoading(state) {
    loading.classList.toggle("hidden", !state);
    btn.disabled = state;
}

// ERROR
function showError(msg) {
    resultDiv.innerHTML = `<div class="result-card error">❌ ${msg}</div>`;
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

// MAIN FUNCTION
async function handleAssessment() {
    const value = input.value.trim();

    if (!value.includes("/")) {
        showError("Enter format: owner/repo");
        return;
    }

    const [owner, repo] = value.split("/");
    const cacheKey = `${owner}/${repo}`;

    const cache = getCache();
    if (cache[cacheKey]) {
        render(cache[cacheKey].data);
        alert("Loaded from cache ⚡");
        return;
    }

    showLoading(true);

    try {
        const data = await assessRepository(owner, repo);
        render(data);
        setCache(cacheKey, data);
    } catch (err) {
        showError(err.message);
    } finally {
        showLoading(false);
    }
}

// FETCH DATA
async function assessRepository(owner, repo) {
    const headers = {
        "Accept": "application/vnd.github+json"
    };

    if (GITHUB_TOKEN) {
        headers["Authorization"] = `token ${GITHUB_TOKEN}`;
    }

    const base = `https://api.github.com/repos/${owner}/${repo}`;

    const [repoRes, readmeRes, tagsRes] = await Promise.all([
        fetch(base, { headers }),
        fetch(`${base}/readme`, { headers }).catch(() => null),
        fetch(`${base}/tags`, { headers }).catch(() => null)
    ]);

    if (!repoRes.ok) {
        if (repoRes.status === 404) throw new Error("Repository not found");
        if (repoRes.status === 403) throw new Error("GitHub API rate limit hit");
        throw new Error("GitHub API error");
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

// SCORING LOGIC
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
    if (score >= 80) return "🚀 Excellent: Research-ready repository";
    if (score >= 60) return "⚠️ Good: Minor improvements needed";
    if (score >= 40) return "❗ Fair: Needs improvement";
    return "🚨 Poor: Not ready for research use";
}

// RENDER UI
function render(data) {
    resultDiv.innerHTML = `
        <div class="result-card">
            <h2>${data.name}</h2>

            <p>⭐ Stars: ${data.stars}</p>
            <p>🍴 Forks: ${data.forks}</p>
            <p>🐛 Issues: ${data.issues}</p>

            <div class="score">Score: ${data.score}/100</div>

            <div class="progress-bar">
                <div class="progress-fill" style="width:${data.score}%"></div>
            </div>

            <div class="ai">${generateInsight(data.score)}</div>
        </div>
    `;
}
