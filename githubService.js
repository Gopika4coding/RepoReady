const API = "https://api.github.com/repos";

async function fetchRepo(repo) {
    const res = await fetch(`${API}/${repo}`);
    if (!res.ok) throw new Error("Repository not found");
    return res.json();
}

async function fetchReadme(repo) {
    try {
        const res = await fetch(`${API}/${repo}/readme`);
        if (!res.ok) return "";
        const data = await res.json();
        return atob(data.content);
    } catch {
        return "";
    }
}

async function fetchTree(repo) {
    try {
        const res = await fetch(`${API}/${repo}/git/trees/HEAD?recursive=1`);
        if (!res.ok) return [];
        const data = await res.json();
        return data.tree || [];
    } catch {
        return [];
    }
}
