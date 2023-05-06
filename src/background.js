var tabId = null

chrome.runtime.onMessage.addListener(
    function (request, sender) {
        if (request.type === "writeFile" && request.returnCode === 0) {
            console.log(request)
            chrome.downloads.download({
                url: request.url,
                filename: request.filename,
                saveAs: true
            });
        }
        // else if (request.type === "export") {
        //     console.log(request);
        //     chrome.scripting.executeScript({ target: { tabId: tabId }, code: 'var options = ' + JSON.stringify(request.options) },
        //         () => chrome.scripting.executeScript({ target: { tabId: tabId }, files: ["app.js"] }, (results) => {
        //             console.log(results);
        //         })
        //     )

        // }
    }
)

chrome.action.onClicked.addListener(async (tab) => {
    chrome.action.openPopup();
});
