import { Loader } from "esbuild";

export const buildLoaders = {
    ".jpg": "file" as Loader,
    ".png": "file" as Loader,
    ".gif": "file" as Loader,
    ".ico": "file" as Loader,
    ".webp": "file" as Loader,
    ".svg": "file" as Loader,
    ".html": "file" as Loader,
    ".js": "file" as Loader,
    ".css": "text" as Loader,
};

export const getExtModules = () => {
    let content = "";
    const exts = Object.keys(buildLoaders);
    for (const ext of exts) {
        content += `declare module '*${ext}';\n`;
    }
    return content;
};

