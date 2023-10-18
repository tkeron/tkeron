import { red } from "colorette";
import { mkdir, writeFile } from "fs/promises";
import { basename, dirname, join } from "path";
import { validItems, componentItem, pageItem } from "./generateItems";
import { getOptions } from "./getOptions";

export const cmdGenerate = async (item: string, path: string) => {
  const { sourceDir } = getOptions();
  const name = basename(path);
  if (!validItems.includes(item)) {
    console["log"](red(`item "${item}" does not exist`));
    return;
  }
  if (item === "component" || item === "c") {
    const { css, ts } = componentItem(name);
    if (path.slice(0, 2) !== "./") path = join("comps", path);
    const tsFilePath = join(sourceDir, path, `${name}.ts`);
    const cssFilePath = join(sourceDir, path, `${name}.css`);
    const tsDir = dirname(tsFilePath);
    await mkdir(tsDir, { recursive: true });
    await writeFile(tsFilePath, ts, { encoding: "utf-8" });
    await writeFile(cssFilePath, css, { encoding: "utf-8" });
  }
  if (item === "page" || item === "p") {
    const { css, ts, back, html } = pageItem(name);
    const tsFilePath = join(sourceDir, `${path}.page.ts`);
    const cssFilePath = join(sourceDir, `${path}.page.css`);
    const htmlFilePath = join(sourceDir, `${path}.page.html`);
    const backFilePath = join(sourceDir, `${path}.back.ts`);
    const tsDir = dirname(tsFilePath);
    await mkdir(tsDir, { recursive: true });
    await writeFile(tsFilePath, ts, { encoding: "utf-8" });
    await writeFile(cssFilePath, css, { encoding: "utf-8" });
    await writeFile(htmlFilePath, html, { encoding: "utf-8" });
    await writeFile(backFilePath, back, { encoding: "utf-8" });
  }
};
