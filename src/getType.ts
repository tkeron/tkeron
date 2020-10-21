
export const getType = (o: any) => {
    if (typeof o === "string") return typeof o;
    if (typeof o === "number") return typeof o;
    if (typeof o === "function") return typeof o;
    if (typeof o === "boolean") return typeof o;
    if (typeof o === "bigint") return typeof o;
    if (typeof o === "symbol") return typeof o;
    if (typeof o === "undefined") return typeof o;
    if (Array.isArray(o)) return "array";
    return "object";
};
