function downloadJSON() {
    const data = loadResult();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "report.json";
    a.click();
}

function downloadHTML() {
    const data = loadResult();

    const html = `
    <html><body>
    <h1>Repo Report</h1>
    <h2>Score: ${data.score}</h2>
    <p>${data.summary}</p>
    </body></html>
    `;

    const blob = new Blob([html], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "report.html";
    a.click();
}
