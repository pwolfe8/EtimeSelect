
function clearSavedData() {
    // TODO: add warning button before wiping

    // clear sync storage
    console.log("Wiping All Saved Data!!");
    chrome.storage.sync.clear();
};

document.getElementById('clearCacheButton').addEventListener('click', clearSavedData);
