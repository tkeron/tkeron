import { JSDOM } from "jsdom";


export const getDocument = (html: string) => {
    const { window, serialize } = new JSDOM(
        html,
        { runScripts: "dangerously" }
    );
    const document = window.document;
    return { document, serialize, window };
};
