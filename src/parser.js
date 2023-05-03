import TurndownService from "turndown";

function parse_prompt(message) {
    return Array(message.textContent);
};

function parse_response(message) {
    let children = message.querySelectorAll(`${response_selector} > *`);
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
    if (message.matches(response_selector)) {
        return parse_response(message);
    }
    else if (message.matches(prompt_selector)) {
        return parse_prompt(message);
    }
    else {
        return null;
    }
}


var response_selector = "div.markdown.prose:last-of-type";
var prompt_selector = "div.text-base div.flex-col:not(:has(*))";

var parser = new DOMParser();
var doc = null;

var turndownSettings = {
    codeBlockStyle: "fenced",
    bulletListMarker: "-",
    headingStyle: "atx"
};

var turndownService = new TurndownService(turndownSettings);
var codeBlockRule = {
    filter: turndownService.options.rules.fencedCodeBlock.filter,
    replacement: turndownService.options.rules.fencedCodeBlock.replacement,
    options: turndownService.options
};

// let pre = document.createElement("PRE")
// let code = document.createElement("CODE")
// code.textContent = 'fruits = ["apple", "banana", "cherry"]\n\nfor fruit in fruits:\n  print(fruit)'
// pre.appendChild(code)
// console.log(pre)
// console.log(pre.outerHTML)

// console.log(turndownService.turndown(pre))
//console.log(turndownService.turndown('<pre><code>fruits = \[\"apple\", \"banana\", \"cherry\"\]\n\nfor fruit in fruits\:\n print(fruit)</code></pre>'))

if (turndownService.codeBlockStyle === "indented") {
    codeBlockRule = {
        filter: turndownService.options.rules.indentedCodeBlock.filter,
        replacement: turndownService.options.rules.indentedCodeBlock.replacement,
        options: turndownService.options
    };
}


var doc = parser.parseFromString(document.documentElement.outerHTML, "text/html");

var conversation = doc.getElementsByTagName("main")[0];
var messages = conversation.querySelectorAll(`*:is(${response_selector},${prompt_selector})`);


var title = doc.querySelector("head > title").textContent;

for (let i = 0; i < messages.length; i++) {
    console.log(parse_message(messages[i]));
}

doc;
