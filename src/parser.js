import TurndownService from "turndown";
import sanitize from "sanitize-filename";

var responseSelector = "div.markdown.prose:last-of-type";
var promptSelector = "div.text-base div.flex-col:not(:has(*))";
var myName = "Me";

var parser = new DOMParser();
var doc = null;

var turndownSettings = {
    codeBlockStyle: "fenced",
    bulletListMarker: "-",
    headingStyle: "atx"
};

var turndownService = new TurndownService(turndownSettings);


function parse_prompt(message) {
    return Array(message.textContent);
};

function parse_response(message) {
    let children = message.querySelectorAll(`${responseSelector} > *`);
    // console.log(message);
    let responses = new Array();
    for (let i = 0; i < children.length; i++) {
        if (children[i].tagName === "PRE") {
            // remove span elements, which are used for syntax highlighting
            let code = children[i].querySelector("code");
            code.querySelectorAll("span").forEach((span) => span.replaceWith(span.textContent));
            code.classList.remove(...code.classList);
            // extract the code blocks and wrap around a simpler PRE that removes
            // site specific formatting
            let prewrap = document.createElement("pre");
            prewrap.append(children[i].querySelector("code"));

            responses.push(turndownService.turndown(prewrap.outerHTML));
        }
        else {
            responses.push(turndownService.turndown(children[i]));
        }
    }

    return responses;
}

function parse_message(message) {
    if (message.matches(responseSelector)) {
        return { "ChatGPT": parse_response(message) };
    }
    else if (message.matches(promptSelector)) {
        return { [myName]: parse_prompt(message) };
    }
    else {
        return null;
    }
}

if (turndownService.codeBlockStyle === "indented") {
    codeBlockRule = {
        filter: turndownService.options.rules.indentedCodeBlock.filter,
        replacement: turndownService.options.rules.indentedCodeBlock.replacement,
        options: turndownService.options
    };
}


var doc = parser.parseFromString(document.documentElement.outerHTML, "text/html");

var conversation = doc.getElementsByTagName("main")[0];
var messages = conversation.querySelectorAll(`*:is(${responseSelector},${promptSelector})`);

var now = new Date();
var data = {
    title: doc.querySelector("head > title").textContent,
    date: now.toString(),
    length: messages.length,
    conversation: new Array()
};
messages.forEach((message) => data.conversation.push(parse_message(message)));

var blob = new Blob([JSON.stringify(data)], { type: "text/plain" });
console.log(data);
chrome.runtime.sendMessage({ type: "parse", returnCode: 0, url: URL.createObjectURL(blob), filename: sanitize(`${data.title}.json`) });
