import { writeFile } from "fs/promises";
import { getOptions } from "./getOptions";


export const createTsConfigFile = async () => {
    const { sourceDir } = getOptions();
    const data = `{
    "compilerOptions": {
        "experimentalDecorators": true,
        "module": "ESNext",
        "target": "es2017",
        "esModuleInterop": true,
        "moduleResolution": "Node",
        "declaration": false,
        "skipLibCheck": true,
        "baseUrl": "${sourceDir}",
        "paths": {
            "@tkeron": [
                "tklibs/mod"
            ],
            "@comps/*": [
                "comps/*"
            ]
        }
    },
    "compileOnSave": true,
    "lib": [
        "dom",
        "es2015",
        "esnext.asynciterable"
    ]
}`;
    await writeFile("tsconfig.json", data, { encoding: "utf-8" });
};