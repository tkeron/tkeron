import fs from "fs";
import { join } from 'path';
import { getFilesRecursive } from "./getFilesRecursive";


const filePathToRes = (fp: string) => {
    let ext = fp.match(/\.(\w+)$/);
    const res = `${ext ? ext[1] : "noExt"}_${fp.replace(/\.(\w+)$/, "").match(/\w*/g)?.join("")}`;
    return res;
};

export const createResourcesFile = (srcDir: string, staticDir: string) => {
    const res: any = {};
    const rscs = getFilesRecursive(staticDir, "*");
    const odps: string[] = [];
    rscs.forEach(r => {
        const f = r.slice(staticDir.length).replace(/\\/g, "/");
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
        export const resources = ${JSON.stringify(res)};
        const r0 = JSON.parse(JSON.stringify(resources));
        \n${odps.join("\n")} 
    `;
    const srcrs = join(srcDir, "resources.ts");
    fs.writeFileSync(srcrs, rf, { encoding: "utf-8" });

};


