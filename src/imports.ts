
export const getImports = (txt: string) => {
    let res: ({ imprt: string, file: string })[] = [];
    const getimp = () => txt.match(/import.*\"(.*)\"\;/);
    let ok = getimp();
    while (ok) {
        const [imprt, file] = ok;
        res.push({ imprt, file });
        txt = txt.replace(imprt, "");
        ok = getimp();
    }
    return res;
};





