import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { bundleTs } from "./bundleTs";
import { fileExists } from "./fileExist";
import { injectCode } from "./injectCode";

export interface buildFrontOptions {
  html: string;
  tsFile: string;
  outTsFile: string;
  outHtmlFile: string;
  hotRestart?: boolean;
  scriptId: string;
  minify?: boolean;
}

export const buildFront = async (options: buildFrontOptions) => {
  const { hotRestart, outHtmlFile, scriptId, tsFile, outTsFile, minify } =
    options;
  let { html } = options;
  const outHtmlDir = dirname(outHtmlFile);
  if (hotRestart === true) {
    const code = await bundleTs(
      join(__dirname, "..", "distFiles", "simpleHotRestart.ts"),
      "shr.js",
      true,
      true
    );
    html = injectCode(html, code, "tkeron_simple_hot_restart");
  }
  if (await fileExists(tsFile)) {
    const tsCode = await bundleTs(tsFile, outTsFile, minify);
    await unlink(outTsFile);
    if (tsCode.trim() !== "") html = injectCode(html, tsCode, scriptId);
  }
  await mkdir(outHtmlDir, { recursive: true });
  await writeFile(outHtmlFile, html, { encoding: "utf-8" });

  return html;
};
