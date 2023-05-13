const DEFAULT_OPTIONS = {
    exportType: "md",
    headerStyle: "atx",
    codeBlockStyle: "```",
    bulletListMarker: "-",
    strongDelimiter: "**",
    emDelimiter: "_"
}

function get_options() {
    var options = {
        exportType: document.getElementById("exportType").value,
        headerStyle: document.getElementById("headerStyle").value,
        codeBlockStyle: document.getElementById("codeBlockStyle").value,
        bulletListMarker: document.getElementById("bulletListMarker").value,
        strongDelimiter: document.getElementById("strongDelimiter").value,
        emDelimiter: document.getElementById("emDelimiter").value
    }
    return options;
}

function set_options(options) {
    document.getElementById("exportType").value = options.exportType;
    document.getElementById("headerStyle").value = options.headerStyle;
    document.getElementById("codeBlockStyle").value = options.codeBlockStyle;
    document.getElementById("bulletListMarker").value = options.bulletListMarker;
    document.getElementById("strongDelimiter").value = options.strongDelimiter;
    document.getElementById("emDelimiter").value = options.emDelimiter;
}

function load_options() {
    chrome.storage.local.get({ options: DEFAULT_OPTIONS }, (items) => {
        set_options(items.options)
    })
}

function save_options(options) {
    chrome.storage.local.set({ "options": options });
}

async function getCurrentTab() {
    let [tab] = await chrome.tabs.query({ currentWindow: true, active: true });
    return tab;
}

function dispatch_parser(options) {
    getCurrentTab().then((tab) => {
        let target = { tabId: tab.id };
        chrome.tabs.sendMessage(tab.id, { type: "export", options: options });
    });
}

document.getElementById("exportType").addEventListener("change", () => { save_options(get_options()) })
document.getElementById("headerStyle").addEventListener("change", () => { save_options(get_options()) })
document.getElementById("codeBlockStyle").addEventListener("change", () => { save_options(get_options()) })
document.getElementById("bulletListMarker").addEventListener("change", () => { save_options(get_options()) })
document.getElementById("strongDelimiter").addEventListener("change", () => { save_options(get_options()) })
document.getElementById("emDelimiter").addEventListener("change", () => { save_options(get_options()) })


var exportBtn = document.getElementById("exportButton");
exportBtn.addEventListener("click", () => {
    let options = get_options()
    window.close();
    dispatch_parser(options)
});

var redirectBtn = document.getElementById("redirectButton");
redirectBtn.addEventListener("click", () => {
    chrome.tabs.create({ url: 'https://chat.openai.com' })
})

// change popup display depending on the URL of the current tab
// this is a workaround since chrome.action.openPopup() is current only supported in 
// the development build
function page_setup() {
    getCurrentTab().then((tab) => {
        const pattern = new RegExp("^.*\/\/chat.openai.com")
        // popup opened while chat.openai is opened in current active tab
        if (pattern.test(tab.url)) {
            document.getElementById("redirectPage").hidden = true
            document.getElementById("exportPage").hidden = false;
            load_options()
        }
        // otherwise, offer redirection
        else {
            document.getElementById("redirectPage").hidden = false;
            document.getElementById("exportPage").hidden = true;

        }
    })
}

window.onload = page_setup