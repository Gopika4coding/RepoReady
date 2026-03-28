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

// THEME TOGGLE
const themeSwitch = document.getElementById('themeSwitch');

if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
    themeSwitch.checked = true;
}

themeSwitch.addEventListener('change', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('theme',
        document.body.classList.contains('dark') ? 'dark' : 'light'
    );
});

// ABOUT MODAL
const aboutBtn = document.getElementById('aboutBtn');
const modal = document.getElementById('aboutModal');
const closeBtn = document.getElementById('closeAbout');

aboutBtn.onclick = () => modal.style.display = "block";
closeBtn.onclick = () => modal.style.display = "none";

window.onclick = (e) => {
    if (e.target === modal) modal.style.display = "none";
};
