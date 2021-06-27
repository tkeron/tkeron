import { normalize } from "path";
import { fileExists } from "./fileExist";
import { build } from "esbuild";
import { buildLoaders } from "./buildLoaders";
import { readFile } from "fs/promises";

export const bundleTs = async (file: string, outfile: string) => {
    if (!file) throw "file must be defined";
    if (!outfile) throw "outfile must be defined";
    file = normalize(file);
    const exist = await fileExists(file);
    if (!exist) throw `file ${file} doesn't exist`;
    const buildResult = await build({
        entryPoints: [file],
        outfile,
        bundle: true,
        // metafile: true,
        minify: true,
        loader: buildLoaders,
    });
    if (buildResult.errors.length) throw buildResult.errors;
    const tsResult = await readFile(outfile, { encoding: "utf-8" });
    return tsResult;
};



