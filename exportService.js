function downloadJSON() {
    const data = loadResult();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `assessment-${data.score}.json`;
    a.click();
}

function downloadHTML() {
    const data = loadResult();

    const html = `
    <html>
    <body>
    <h1>${data.repo}</h1>
    <h2>Score: ${data.score}/100</h2>
    <p>${data.summary}</p>

    <h3>Details</h3>
    ${data.checks.map(c => `
        <p>${c.label}: ${c.score}/${c.max}<br>${c.rationale}</p>
    `).join("")}

    <h3>Fixes</h3>
    ${data.fixes.map(f => `<p>${f.task} (${f.impact})</p>`).join("")}

    </body>
    </html>
    `;

    const blob = new Blob([html], { type: "text/html" });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `assessment-${data.score}.html`;
    a.click();
}
