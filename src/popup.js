function get_options() {
    var options = {
        exportType: document.getElementById("exportType").value,
        headerStyle: document.getElementById("headerStyle").value,
        codeBlockStyle: document.getElementById("codeBlockStyle").value,
        bulletListMarker: document.getElementById("bulletListMarker").value,
        strongDelimiter: document.getElementById("strongDelimiter").value,
        emDelimiter: document.getElementById("emDelimiter").value
    }
    console.log(options);
    //chrome.runtime.sendMessage({ type: "export", options: options });
    window.close();
    return options;
}

async function getCurrentTab() {
    let [tab] = await chrome.tabs.query({ currentWindow: true, active: true });
    return tab;
}

function dispatch_parser() {
    // chrome.storage.local.set({ options: get_options() },
    let options = get_options()

    getCurrentTab().then((tab) => {
        let target = { tabId: tab.id };
        chrome.scripting.executeScript(
            {
                target: target,
                files: ["app.js"]
            },
            () => {
                chrome.tabs.sendMessage(tab.id, { type: "export", options: options });
            }
        )
    });
}

var btn = document.getElementById("exportButton");
btn.addEventListener("click", dispatch_parser);