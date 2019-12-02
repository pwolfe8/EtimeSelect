// on extension update to 6.9.3 wipe stored saved data due to major bug last time
chrome.runtime.onInstalled.addListener((details) => {
    const currentVersion = chrome.runtime.getManifest().version
    const previousVersion = details.previousVersion
    const reason = details.reason
    console.log('Previous Version: ${previousVersion }')
    console.log('Current Version: ${currentVersion }')
    switch (reason) {
       case 'update':
          console.log('User has updated their extension.')
          if (currentVersion == '6.9.3') {
            console.log("Wiping Old Saved Data!!");
            chrome.storage.sync.clear();
          }
          break;
       default:   
          break;
    }
 })
