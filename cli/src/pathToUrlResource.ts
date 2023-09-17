import { pathToFileURL } from "url";


export const pathToUrlResource = (path: string, base: string) => {
    base = pathToFileURL(base).href;
    const url = pathToFileURL(path).href.replace(base, "");
    const resource = url.slice(1).replace(/\//g, "__").replace(/\W/g, "_");
    return { url, resource };
};

