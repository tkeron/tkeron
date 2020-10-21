import { trampoline } from "./trampoline";

export const plainAny = (o: any) => {
    let res: any = [];
    Object.keys(o).sort().forEach(c => {
        if (typeof o[c] !== "object") res.push(`${c}_${o[c]}`);
        if (typeof o[c] === "object") {
            res.push(() => `${c}_${plainAny(o[c])}`);
        }
    });
    if (res.filter((r: any) => typeof r !== "string").length === 0) res = res.join("");
    return typeof res === "string" ? res : () => {
        return res.map((r: any) => {
            if (typeof r === "function") r = r();
            return r;
        }).join("");
    };
};

export const anyEquals = (o1: any, o2: any) => {
    const so1 = trampoline(plainAny, o1);
    const so2 = trampoline(plainAny, o2);
    return so1 === so2;
};
