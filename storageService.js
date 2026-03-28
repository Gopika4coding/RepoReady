function saveResult(data) {
    localStorage.setItem("lastAssessment", JSON.stringify(data));
}

function loadResult() {
    return JSON.parse(localStorage.getItem("lastAssessment"));
}
