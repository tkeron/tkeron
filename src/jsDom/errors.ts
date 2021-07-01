import { DOMWindow } from "jsdom";
import { writeLogElement } from "./writeLogElement";


export const ext_errors = (window: DOMWindow) => window.addEventListener("error", () => { });

export const handleJsDomError = (errors: Error[], document: Document) => {
    for (const e of errors) {

        const { message, detail } = e as any;
        if (!detail) {
            console["log"](message);
            writeLogElement(message, document, "tkeron_error");
            continue;
        }
        const { stack } = detail as { stack: string };
        if (!stack) {
            console["log"](message);
            writeLogElement(message, document, "tkeron_error");
            continue;
        }

        let msg = stack.split(/\n\s*at\s*/)![0];

        console["log"](msg);

        msg = msg
            .replace(/\n/g, "<br>")
            .replace(/\s/g, "&nbsp;")
            .replace(/\t/g, "&nbsp;".repeat(4))
            ;

        writeLogElement(msg, document, "tkeron_error");
    }
};
