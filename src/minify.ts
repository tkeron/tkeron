export const minify_js = (jscode: string): string => {
    return jscode
        .replace(/\/\/.*\n/g, "")
        .replace(/\s+/g, " ")
        .replace(/\s;/g, ";")
        .split("\/*")
        .map((_) => _.slice(_.indexOf("*/") + 2))
        .join("")
        .replace(/\s+/g, " ")
        ;
};

export const minify_css = (csscode: string): string => {
    return csscode
        .replace(/\s+/g, " ")
        .split("\/*")
        .map((_) => _.slice(_.indexOf("*/") + 2))
        .join("")
        .replace(/\s+/g, " ")
        ;
};

export const minify_html = (htmlcode: string): string => {
    return htmlcode
        .replace(/\/\/.*\n/g, "")
        .replace(/\s+/g, " ");
};

