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
    }
)