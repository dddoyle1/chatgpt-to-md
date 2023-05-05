chrome.runtime.onMessage.addListener(
    function (request, sender) {
        if (request.type === "parse" && request.returnCode === 0) {
            console.log(request)
            chrome.downloads.download({
                url: request.url,
                filename: request.filename,
                saveAs: true
            });
        }
    }
)

chrome.action.onClicked.addListener(async (tab) => {
    chrome.action.openPopup();
    // chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["app.js"] }, (results) => {
    //     console.log(results);
    //    });
});
