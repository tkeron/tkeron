import { dirname, normalize } from "path";
import { fileExists } from "./fileExist";
import { build } from "esbuild";
import { buildLoaders } from "./buildLoaders";

export const bundleTs = async (file: string, outfile: string) => {
    if (!file) throw "file must be defined";
    if (!outfile) throw "outfile must be defined";
    file = normalize(file);
    const exist = await fileExists(file);
    if (!exist) throw `file ${file} doesn't exist`;
    const outdir = dirname(outfile);
    return await build({
        entryPoints: [file],
        outfile,
        bundle: true,
        metafile: true,
        minify: true,
        loader: buildLoaders,
    });
};



