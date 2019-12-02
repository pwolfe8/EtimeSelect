
function clearSavedData() {
    // TODO: add warning button before wiping
    
    // if (confirm("This will wiped all project notes and custom names.\nAre you sure you want to do this?")){
        // clear sync storage
        console.log("Wiping All Saved Data!!");
        chrome.storage.sync.clear();
    // }

    
};

document.getElementById('clearCacheButton').addEventListener('click', clearSavedData);
