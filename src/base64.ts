export const fromBase64 = (base64str: string): string => {
    const b = Buffer.from(base64str, "base64");
    return b.toString("utf-8");
};
export const toBase64 = (base64str: string): string => {
    const b = Buffer.from(base64str, "utf-8");
    return b.toString("base64");
};
