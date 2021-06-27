import { ConstructorOptions, JSDOM, VirtualConsole } from "jsdom";
import { ext_crypto } from "./jsDom/crypto";
import { ext_errors, handleJsDomError } from "./jsDom/errors";
import { handleLogs } from "./jsDom/logs";

export interface getDocumentOptions {
    ignoreConsoleLogs?: boolean;
    ignoreErrors?: boolean;
    constructorOptions?: ConstructorOptions;
}

export const getDocument = (html: string, options?: getDocumentOptions) => {
    if (!options) options = {} as any;
    const { constructorOptions } = options;
    let { ignoreConsoleLogs, ignoreErrors } = options;
    const virtualConsole = new VirtualConsole({ captureRejections: true });
    const jsDomErrors: Error[] = [];
    const logs = [];
    virtualConsole.on("jsdomError", e => jsDomErrors.push(e));
    virtualConsole.on("log", (e: any) => logs.push(e));
    if (html.trim() === "") html = `<!DOCTYPE html>\n<html lang="en">\n    <head>\n    <meta charset="UTF-8" />\n    <meta http-equiv="X-UA-Compatible" content="IE=edge" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>Document</title>\n    </head>\n    <body></body>\n</html>\n`;
    const { window } = new JSDOM(
        html,
        constructorOptions ||
        {
            resources: "usable",
            runScripts: "dangerously",
            virtualConsole,
            beforeParse: (window) => {
                ext_errors(window);
                ext_crypto(window);
            }
        }
    );
    const document = window.document;
    if (!ignoreErrors) handleJsDomError(jsDomErrors, document);
    if (!ignoreConsoleLogs) handleLogs(logs, document);
    return { document, window };
};
