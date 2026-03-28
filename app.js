function parseURL(input) {
    try {
        const url = new URL(input);
        const parts = url.pathname.split("/").filter(Boolean);
        return `${parts[0]}/${parts[1]}`;
    } catch {
        return input;
    }
}

async function startAssessment() {

    const input = document.getElementById("repoInput").value;
    const repo = parseURL(input);

    document.getElementById("loading").classList.remove("hidden");
    document.getElementById("result").innerHTML = "";

    try {
        const repoData = await fetchRepo(repo);
        const readme = await fetchReadme(repo);
        const tree = await fetchTree(repo);

        const result = assess(repoData, readme, tree);

        saveResult(result);
        render(result);

    } catch (e) {
        document.getElementById("result").innerHTML = `<p class="error">${e.message}</p>`;
    }

    document.getElementById("loading").classList.add("hidden");
}

function render(data) {

    let html = `
        <div class="result-card">
        <h2>Score: ${data.score}/100</h2>
        <p>${data.summary}</p>
    `;

    data.checks.forEach(c => {
        html += `
        <p>
        ${c.passed ? "✅" : "❌"} ${c.label} (${c.score}/${c.max})<br>
        <small>${c.rationale}</small>
        </p>`;
    });

    html += `<h3>Fix Checklist</h3>`;

    data.fixes.forEach(f => {
        html += `<p>⚠ ${f.task} (${f.impact})</p>`;
    });

    html += `</div>`;

    document.getElementById("result").innerHTML = html;
    document.getElementById("actions").classList.remove("hidden");
}

window.onload = () => {
    const last = loadResult();
    if (last) {
        document.getElementById("restore").innerHTML =
            `<button onclick='render(${JSON.stringify(last)})'>Load Last Report</button>`;
    }
};
