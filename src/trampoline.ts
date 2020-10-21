
export const trampoline = (fn: any, ...ini: any[]) => {
    let res = fn(...ini);
    while (typeof res === "function") {
        res = res();
    }
    return res;
};


