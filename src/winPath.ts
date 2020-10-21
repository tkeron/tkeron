
export const winPath = (path: string) => {
    const wp = path.match(/^\w\:\\/g);
    if (wp) {
        path = path.replace(/\\/g, "/");
        path = `file:///${path}`;
    }
    return path;
};