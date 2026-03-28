function detectProjectType(tree) {
    const paths = tree.map(f => f.path.toLowerCase());

    if (paths.some(p => p.endsWith(".ipynb"))) return "Data Science";
    if (paths.some(p => p.includes("package.json"))) return "Application";
    if (paths.some(p => p.includes("setup.py") || p.includes("pyproject.toml"))) return "Library";

    return "General";
}

function checkFeature(condition, score, label, reasonPass, reasonFail) {
    return {
        label,
        passed: condition,
        score: condition ? score : 0,
        max: score,
        rationale: condition ? reasonPass : reasonFail
    };
}

function assess(repoData, readme, tree) {

    const checks = [];

    checks.push(checkFeature(
        readme.length > 200,
        30,
        "README Quality",
        "Good documentation present",
        "README missing or too short"
    ));

    checks.push(checkFeature(
        tree.some(f => f.path.toLowerCase().includes("license")),
        15,
        "License",
        "License detected",
        "No license found"
    ));

    checks.push(checkFeature(
        tree.some(f => f.path.toLowerCase().includes("test")),
        20,
        "Testing",
        "Test files present",
        "No testing detected"
    ));

    checks.push(checkFeature(
        tree.some(f => f.path.includes(".github/workflows")),
        10,
        "CI/CD",
        "Workflow detected",
        "No CI/CD setup"
    ));

    checks.push(checkFeature(
        tree.some(f => f.path.toLowerCase().includes("citation")),
        10,
        "Citation",
        "Citation file exists",
        "No citation file"
    ));

    checks.push(checkFeature(
        tree.some(f => f.path.includes(".prettierrc") || f.path.includes(".eslintrc")),
        15,
        "Code Quality",
        "Formatting configs found",
        "No formatting config"
    ));

    const total = checks.reduce((a, b) => a + b.score, 0);

    return {
        score: total,
        checks,
        summary: generateSummary(total),
        fixes: generateFixes(checks)
    };
}

function generateSummary(score) {
    if (score > 80) return "Excellent research-ready repository.";
    if (score > 50) return "Decent but needs improvements.";
    return "Not research-ready. Major improvements required.";
}

function generateFixes(checks) {
    return checks
        .filter(c => !c.passed)
        .map(c => ({
            task: c.label,
            impact: c.max >= 20 ? "HIGH" : c.max >= 10 ? "MEDIUM" : "LOW"
        }));
}
