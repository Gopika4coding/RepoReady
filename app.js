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
        document.getElementById("result").innerHTML =
            `<p class="error">${e.message}</p>`;
    }

    document.getElementById("loading").classList.add("hidden");
}

function render(data) {

    let html = `
    <div class="result-card">
    <h2>${data.score}/100</h2>
    <p>${data.summary}</p>
    <p><strong>Project Type:</strong> ${data.type}</p>
    `;

    data.checks.forEach(c => {
        html += `
        <div class="check ${c.score === c.max ? "pass" : "fail"}">
            <strong>${c.label}</strong> (${c.score}/${c.max})<br>
            <small>${c.rationale}</small>
        </div>`;
    });

    html += `<h3>Fix Checklist</h3>`;

    data.fixes.forEach(f => {
        html += `
        <div class="fix ${f.impact.toLowerCase()}">
            ${f.task} (${f.impact})
        </div>`;
    });

    html += `</div>`;

    document.getElementById("result").innerHTML = html;
    document.getElementById("actions").classList.remove("hidden");
}

window.onload = () => {
    const last = loadResult();
    if (last) {
        document.getElementById("restore").innerHTML =
            `<button onclick='render(${JSON.stringify(last)})'>Load Last Assessment</button>`;
    }
};
