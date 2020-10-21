export const formdata = (data: any): string => {
    return Object.keys(data).reduce((p, c) => {
        p += (p === "" ? "" : "&") + `${c}=${encodeURIComponent(data[c])}`;
        return p;
    }, "");
};

