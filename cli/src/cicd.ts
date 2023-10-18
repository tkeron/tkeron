import { copyFileSync } from "fs";
import { join } from "path";
import { libFiles } from "./libFiles.ts";

for (const file of libFiles) {
  copyFileSync(join("src", file), join("distFiles", file));
}
