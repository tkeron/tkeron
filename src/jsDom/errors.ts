import { DOMWindow } from "jsdom";
import { getType } from "../getType";

const writeErrorElement = (message: string, document: Document) => {
    if (!document.head.querySelector(".tkeron_back_logs_css")) {
        const css = document.createElement("style");
        css.classList.add("tkeron_back_logs_css");
        css.innerHTML = `
            .tkeron_back_logs {
                font-family: consolas;
                position: fixed;
                top: 10px;
                left: 10px;
                color: #fa69;
                font-weight: bold;
            }
            .tkeron_error {
                background: #0009;
                padding: 20px;
            }
            .tkeron_log {
                background: #0009;
                padding: 20px;
                color: #fff9;
            }
        `;
        document.head.appendChild(css);
        const div = document.createElement("tkeron_back_logs");
        div.innerHTML = "TKERON BACK LOGS:";
        div.classList.add("tkeron_back_logs");
        document.body.appendChild(div);
    }
    const container = document.body.querySelector(".tkeron_back_logs");
    const div = document.createElement("div");
    div.classList.add("tkeron_error");
    div.innerHTML = message;
    container.appendChild(div);
};

export const ext_errors = (window: DOMWindow) => window.addEventListener("error", () => { });

export const handleJsDomError = (errors: Error[], document: Document) => {
    for (const e of errors) {

        const { message, detail } = e as any;
        if (!detail) {
            console["log"](message);
            writeErrorElement(message, document);
            continue;
        }
        const { stack } = detail as { stack: string };
        if (!stack) {
            console["log"](message);
            writeErrorElement(message, document);
            continue;
        }

        let msg = stack.split(/\n\s*at\s*/)![0];

        console["log"](msg);

        msg = msg
            .replace(/\n/g, "<br>")
            .replace(/\s/g, "&nbsp;")
            .replace(/\t/g, "&nbsp;".repeat(4))
            ;

        writeErrorElement(msg, document);
    }
};
