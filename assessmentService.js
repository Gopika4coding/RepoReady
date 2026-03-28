function detectProjectType(tree) {
    const paths = tree.map(f => f.path.toLowerCase());

    if (paths.some(p => p.endsWith(".ipynb") || p.endsWith(".r"))) return "Data Science";
    if (paths.some(p => p.includes("setup.py") || p.includes("pyproject.toml"))) return "Library";
    if (paths.some(p => p.includes("package.json"))) return "Application";

    return "General";
}

// ---------- README ----------
function scoreReadme(readme) {
    if (!readme) return { score: 0, max: 30, rationale: "No README found." };

    let score = 0;

    if (readme.length > 200) score += 10;
    if (/install/i.test(readme)) score += 10;
    if (/usage|run/i.test(readme)) score += 10;

    let rationale = "README analyzed: ";
    rationale += score === 30
        ? "Comprehensive documentation present."
        : "Partial documentation. Missing some sections.";

    return { score, max: 30, rationale };
}

// ---------- LICENSE ----------
function scoreLicense(tree) {
    const has = tree.some(f => f.path.toLowerCase().includes("license"));

    return {
        score: has ? 15 : 0,
        max: 15,
        rationale: has ? "License file detected." : "No license found."
    };
}

// ---------- TESTS ----------
function scoreTests(tree, type) {
    const has = tree.some(f => f.path.toLowerCase().includes("test"));

    let score = has ? 12 : 0;

    if (type === "Library" && has) score = 20;
    if (type === "Data Science" && has) score = 10;

    return {
        score,
        max: 20,
        rationale: has ? "Test files detected." : "No testing infrastructure found."
    };
}

// ---------- CI ----------
function scoreCI(tree) {
    const has = tree.some(f => f.path.includes(".github/workflows"));

    return {
        score: has ? 10 : 0,
        max: 10,
        rationale: has ? "CI/CD pipeline detected." : "No CI/CD setup found."
    };
}

// ---------- CITATION ----------
function scoreCitation(tree) {
    const has = tree.some(f => f.path.toLowerCase().includes("citation"));

    return {
        score: has ? 10 : 0,
        max: 10,
        rationale: has ? "Citation file present." : "No CITATION.cff found."
    };
}

// ---------- CODE QUALITY ----------
function scoreQuality(tree) {
    const has = tree.some(f =>
        f.path.includes(".prettierrc") ||
        f.path.includes(".eslintrc") ||
        f.path.includes("flake8") ||
        f.path.includes("black")
    );

    return {
        score: has ? 15 : 0,
        max: 15,
        rationale: has ? "Code formatting tools detected." : "No formatting/linting config found."
    };
}

// ---------- MAIN ----------
function assess(repoData, readme, tree) {

    const type = detectProjectType(tree);

    const checks = [
        { label: "README Quality", ...scoreReadme(readme) },
        { label: "License", ...scoreLicense(tree) },
        { label: "Tests", ...scoreTests(tree, type) },
        { label: "CI/CD", ...scoreCI(tree) },
        { label: "Versioning & Citation", ...scoreCitation(tree) },
        { label: "Code Quality", ...scoreQuality(tree) }
    ];

    const total = checks.reduce((sum, c) => sum + c.score, 0);

    return {
        repo: repoData.full_name,
        type,
        score: total,
        checks,
        summary: generateSummary(total),
        fixes: generateFixes(checks)
    };
}

// ---------- SUMMARY ----------
function generateSummary(score) {
    if (score >= 80) return "Highly research-ready repository with strong engineering practices.";
    if (score >= 50) return "Moderately ready but missing key research components.";
    return "Not research-ready. Critical improvements required.";
}

// ---------- FIXES ----------
function generateFixes(checks) {
    return checks
        .filter(c => c.score < c.max)
        .map(c => ({
            task: `Improve ${c.label}`,
            impact: c.max >= 20 ? "HIGH" : c.max >= 10 ? "MEDIUM" : "LOW"
        }));
}
