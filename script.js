async function handleAssessment(input) {
    if (!input) {
        showError('Please enter a repository URL');
        return;
    }

    let clean = input.trim();

    // Remove .git and trailing slash
    clean = clean.replace(/\.git$/, '').replace(/\/$/, '');

    // Extract owner/repo from ANY format
    let match = clean.match(/github\.com\/([^\/]+)\/([^\/]+)/);

    let owner, repo;

    if (match) {
        owner = match[1];
        repo = match[2];
    } else {
        const parts = clean.split('/');
        if (parts.length === 2) {
            owner = parts[0];
            repo = parts[1];
        } else {
            showError('Invalid GitHub URL');
            return;
        }
    }

    showLoading();

    try {
        const assessment = await assessRepository(owner, repo);
        renderResults(assessment);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(assessment));
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}
