function loadProjectName() {
    chrome.storage.sync.get(null, function(result) {
        var projectVarKey = result.calledBy + '_customName';
        proj_num = result[projectVarKey];
        document.getElementById("project_settings_title").textContent += proj_num;
    });
}
function displayResult() {
    boxtext = document.getElementById("custom_name_text").textContent;
    document.getElementById("project_settings_title").innerHTML = "Project Settings for " + boxtext;
}
function saveNotes() {

}