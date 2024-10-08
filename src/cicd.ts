import { join } from "path";
import { libFiles } from "./libFiles.ts";
import { copyFile } from "./copyFile.js";

(async () => {
  const copiedFiles = [];
  for (const file of libFiles) {
    copiedFiles.push(copyFile(join("src", file), join("distFiles", file)));
  }

  await Promise.all(copiedFiles);
})();
