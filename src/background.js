chrome.action.onClicked.addListener(async (tab) => {
    chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["app.js"] }, (results) => {
        console.log(results);
    });
});
