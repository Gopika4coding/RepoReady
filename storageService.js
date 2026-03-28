function saveResult(data) {
    localStorage.setItem("lastRepo", JSON.stringify(data));
}

function loadResult() {
    return JSON.parse(localStorage.getItem("lastRepo"));
}
