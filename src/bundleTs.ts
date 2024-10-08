import { normalize } from "path";
import { fileExists } from "./fileExist";
import { build } from "esbuild";
import { buildLoaders } from "./buildLoaders";
import { readFile, unlink } from "fs/promises";

export const bundleTs = async (
  file: string,
  outfile: string,
  minify = true,
  deleteOutfile = false,
) => {
  if (!file) throw "file must be defined";
  if (!outfile) throw "outfile must be defined";
  file = normalize(file);
  const exist = await fileExists(file);
  if (!exist) throw `file ${file} doesn't exist`;
  const minifySyntax = minify;
  const minifyWhitespace = minify;
  const buildResult = await build({
    entryPoints: [file],
    outfile,
    bundle: true,
    minifySyntax,
    minifyWhitespace,
    loader: buildLoaders,
  });
  if (buildResult.errors.length) throw buildResult.errors;
  const tsResult = await readFile(outfile, { encoding: "utf-8" });
  if (deleteOutfile) await unlink(outfile);
  return tsResult;
};
