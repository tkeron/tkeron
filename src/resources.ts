import fs from "fs";
import { type } from "os";
import { join } from 'path';
import { getFilesRecursive } from "./getFilesRecursive";


const filePathToRes = (fp: string) => {
    let ext = fp.match(/\.(\w+)$/);
    const res = `${ext ? ext[1] : "noExt"}_${fp.replace(/\.(\w+)$/, "").match(/[\w\_\s]*/g)?.join("").replace(/\s/g, "_")}`;
    return res;
};

export const createResourcesFile = (srcDir: string, staticDir: string) => {
    const res: any = {};
    const rscs = getFilesRecursive(staticDir, "*");
    const odps: string[] = [];
    rscs.forEach(r => {
        const f = r.slice(staticDir.length).replace(/\\/g, "/").replace(/^\//, "");
        const rfi = filePathToRes(f);
        res[rfi] = {
            url: f,
        };
        odps.push(`
            Object.defineProperty(resources.${rfi}, "url", {
                get() {
                    //@ts-ignore
                    globalThis.tkeron_resources.${rfi} = "${f}";
                    return r0.${rfi}.url;
                }
            });
       `);

    });
    const rf = `
        //@ts-ignore
        globalThis.tkeron_resources = {} as any;
        export const resources = ${JSON.stringify(res)};//end-of-tkeron-resources
        const r0 = JSON.parse(JSON.stringify(resources));
        \n${odps.join("\n")} 
        console${"."}log("-resources-end-");
    `;
    const srcrs = join(srcDir, "resources.ts");
    fs.writeFileSync(srcrs, rf, { encoding: "utf-8" });

};

export const cleanResources = async (js: string) => {
    //removes object property sets
    js = js.replace(/var\sr0\s\=.*console\.log\(\"\-resources\-end\-\"\)\;/ms, "");
    //removes global 
    js = js.replace(/\/{2}\@ts\-ignore\r{0,1}\n{0,1}\r{0,1}\s*globalThis\.tkeron\_resources\s\=\s\{\}\;/s, "");
    // get used resources
    // const used = js.match(/resources\.[\w\_\s]*\.url/g);
    let used = js.match(/resources\.([\w\_\s]*)\.url/g);
    if (used) {
        used = used.map(_ => {
            const res = _.match(/\.(.*)\./);
            if (res) return res[1];
            return _;
        });
    }
    //get complete resources object and replacing in code
    let resources: any = {};
    const rs = js.match(/exports\.resources\s\=\s\{\s.*\/\/end\-of\-tkeron\-resources/s);
    if (rs) {
        js = js.replace(/exports\.resources\s\=\s\{\s.*\/\/end\-of\-tkeron\-resources/s, "//-complete-resource-object-");
        const json = rs[0].match(/\{.*\}/s);
        if (json) resources = JSON.parse(json[0]);
    }
    //filter unused resources
    Object.keys(resources).forEach(k => {
        if (!used?.includes(k)) {
            delete resources[k];
        }
    });
    //substitute filtered resource object
    const exrs = `exports.resources = ${JSON.stringify(resources)};//filtered resources`;
    js = js.replace(/\/\/\-complete\-resource\-object\-/, exrs);
    //add resources to be moved
    //@ts-ignore
    if (typeof globalThis.tkeron_resources === "undefined") globalThis.tkeron_resources = {};
    Object.keys(resources).forEach(k => {
        //@ts-ignore
        if (Object.values(globalThis.tkeron_resources).includes(resources[k].url)) return;
        //@ts-ignore
        globalThis.tkeron_resources[k] = resources[k].url;
    });

    return js;
};

