const API_BASE = "https://api.github.com/repos";

// 🔥 Extract owner/repo from ANY GitHub URL
function parseGitHubURL(input) {
    input = input.trim();

    if (!input.includes("github.com")) {
        return input; // already owner/repo
    }

    try {
        const url = new URL(input);
        const parts = url.pathname.split("/").filter(Boolean);

        // owner/repo always first 2 parts
        return `${parts[0]}/${parts[1]}`;
    } catch {
        return null;
    }
}

// 🔥 Timeout wrapper (fix infinite loading)
function fetchWithTimeout(url, timeout = 8000) {
    return Promise.race([
        fetch(url),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Request timeout")), timeout)
        )
    ]);
}

// 🔥 MAIN FUNCTION
async function startAssessment() {
    const input = document.getElementById("repoInput").value;
    const repo = parseGitHubURL(input);

    if (!repo) {
        showError("Invalid GitHub URL");
        return;
    }

    document.getElementById("loading").style.display = "block";
    document.getElementById("result").innerHTML = "";

    try {
        const data = await assessRepo(repo);
        renderResult(data);
    } catch (err) {
        showError(err.message);
    } finally {
        document.getElementById("loading").style.display = "none";
    }
}

// 🔥 CORE ANALYSIS (simplified + stable)
async function assessRepo(repo) {
    const res = await fetchWithTimeout(`${API_BASE}/${repo}`);

    if (!res.ok) {
        throw new Error("Repo not found / API error");
    }

    const repoData = await res.json();

    // README check
    let hasReadme = false;
    try {
        const readme = await fetchWithTimeout(`${API_BASE}/${repo}/readme`);
        hasReadme = readme.ok;
    } catch {}

    // LICENSE check
    let hasLicense = false;
    try {
        const lic = await fetchWithTimeout(`${API_BASE}/${repo}/license`);
        hasLicense = lic.ok;
    } catch {}

    // SCORE
    let score = 0;
    if (hasReadme) score += 40;
    if (hasLicense) score += 30;
    if (repoData.stargazers_count > 50) score += 30;

    return {
        name: repo,
        stars: repoData.stargazers_count,
        score,
        hasReadme,
        hasLicense
    };
}

// 🔥 RENDER
function renderResult(data) {
    document.getElementById("result").innerHTML = `
        <h2>${data.name}</h2>
        <p>⭐ Stars: ${data.stars}</p>
        <p>📄 README: ${data.hasReadme ? "Yes" : "No"}</p>
        <p>⚖️ License: ${data.hasLicense ? "Yes" : "No"}</p>
        <h3>Score: ${data.score}/100</h3>
    `;
}

// 🔥 ERROR
function showError(msg) {
    document.getElementById("result").innerHTML = `
        <p style="color:red;">❌ ${msg}</p>
    `;
}
