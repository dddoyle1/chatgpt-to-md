import TurndownService from "turndown";
import sanitize from "sanitize-filename";
import YAML from "yaml";

var responseSelector = "div.markdown.prose:last-of-type";
var promptSelector = "div.text-base div.flex-col:not(:has(*))";
var myName = "Me";
var authorHead = "###";

var parser = new DOMParser();

function parse_prompt(message, turndownService) {
    return Array(message.textContent);
};

function parse_response(message, turndownService) {
    let children = message.querySelectorAll(`${responseSelector} > *`);

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

function parse_message(message, turndownService) {
    if (message.matches(responseSelector)) {
        let parsed = parse_response(message, turndownService);
        return { author: "ChatGPT", messages: parsed, length: parsed.length };
    }
    else if (message.matches(promptSelector)) {
        let parsed = parse_prompt(message, turndownService);
        return { author: myName, messages: parsed, length: parsed.length };
    }
    else {
        return null;
    }
}

function export_as_json(meta, parsed_messages) {
    return JSON.stringify({
        meta,
        conversation: parsed_messages
    })
}

function export_as_md(meta, parsed_messages) {
    let yaml_doc = new YAML.Document();
    yaml_doc.contents = meta;

    let lines = new Array()
    for (let i = 0; i < parsed_messages.length; i++) {
        lines.push(`${authorHead} ${parsed_messages[i].author}`);
        parsed_messages[i].messages.forEach((m) => lines.push(m));
        lines.push('\n');
    }
    return "---\n" + yaml_doc.toString() + "---\n\n" + lines.join('\n');
}


function run_parser(options) {
    var turndownSettings = {
        bulletListMarker: options.bulletListMarker,
        headingStyle: options.headingStyle,
        strongDelimiter: options.strongDelimiter,
        emDelimiter: options.emDelimiter,
        codeBlockStyle: options.codeBlockStyle === "indented" ? options.codeBlockStyle : "fenced",
        fence: options.codeBlockStyle === "indented" ? null : options.codeBlockStyle
    }
    var exportTo = options.exportType;



    var turndownService = new TurndownService(turndownSettings);



    var doc = parser.parseFromString(document.documentElement.outerHTML, "text/html");

    var conversation = doc.getElementsByTagName("main")[0];
    var messages = conversation.querySelectorAll(`*:is(${responseSelector},${promptSelector})`);

    var now = new Date();
    var meta = {
        title: doc.querySelector("head > title").textContent,
        date: now.toString(),
        length: messages.length,
    };
    var parsed_messages = new Array();
    messages.forEach((message) => parsed_messages.push(parse_message(message, turndownService)));

    let blob = null;
    let filename = sanitize(meta.title)
    if (exportTo === "md") {
        blob = new Blob([export_as_md(meta, parsed_messages)], { type: "text/markdown" });
        filename = filename + ".md";
    }
    else if (exportTo == "json") {
        blob = new Blob([export_as_json(meta, parse_message)], { type: "application/json" });
        filename = filename + ".json";
    }
    else {
        console.error(`Unrecognized export type: ${exportTo}`);
    }

    chrome.runtime.sendMessage({ type: "writeFile", returnCode: 0, url: URL.createObjectURL(blob), filename: filename });
}

chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        run_parser(request.options)
    }
)