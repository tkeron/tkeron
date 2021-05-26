import { readJsonFile } from "./readJsonFile";

export interface tkeronOpts {
    sourceDir: string;
    outputDir: string;
};

export const getOptions = (): tkeronOpts => {
    const jsonOpt = readJsonFile("tkeron.json") as tkeronOpts;
    const defaultOpt: tkeronOpts = {
        sourceDir: "front",
        outputDir: "web",
    };
    if (!jsonOpt) return defaultOpt;
    Object.keys(defaultOpt).forEach(key => {
        if (key in jsonOpt) (defaultOpt as any)[key] = (jsonOpt as any)[key];
    });
    return defaultOpt;
};


