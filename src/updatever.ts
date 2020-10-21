import process from "process";
import fs from "fs";
import { minify_js } from "./minify";
import crypto from "crypto";

const pkg = JSON.parse(fs.readFileSync("package.json", { encoding: "utf-8" }));
const [major, minor, patch] = pkg
    .version.split(".").map((s: string) => parseInt(s));

const { argv } = process;

const save = () => {
    fs.writeFileSync("package.json", JSON.stringify(pkg, null, "\t"), { encoding: "utf-8" });
};

(() => {
    const libtk: string = fs.readFileSync("./src/tkeron.ts", { encoding: "utf-8" });
    const libmin = minify_js(libtk).replace(/export const version.*;$/g, "");
    const libver = libtk.match(/\"(.*)\"\;$/);
    if (!libver) throw Error("Error in library version");
    const [major, minor, patch] = libver[1].split(".").map((s: string) => parseInt(s));

    const crhash = crypto.createHash("sha256");
    const hash = crhash.update(libmin).digest("hex");
    if (pkg.com_tkeron.lib_sha256 === hash) { return; }
    pkg.com_tkeron.lib_sha256 = hash;
    if (argv[3] && argv[3] === "major") {
        const v = `${major + 1}.0.0`;
        pkg.com_tkeron.lib_version = v;
        const tklib = libtk.replace(/\".*\"\;$/, `"${v}";`);
        fs.writeFileSync("./src/tkeron.ts", tklib, { encoding: "utf-8" });
        return;
    }
    if (argv[3] && argv[3] === "minor") {
        const v = `${major}.${minor + 1}.0`;
        pkg.com_tkeron.lib_version = v;
        const tklib = libtk.replace(/\".*\"\;$/, `"${v}";`);
        fs.writeFileSync("./src/tkeron.ts", tklib, { encoding: "utf-8" });
        return;
    }
    const v = `${major}.${minor}.${patch + 1}`;
    pkg.com_tkeron.lib_version = v;
    const tklib = libtk.replace(/\".*\"\;$/, `"${v}";`);
    fs.writeFileSync("./src/tkeron.ts", tklib, { encoding: "utf-8" });
})();

(() => {
    if (argv[2] && argv[2] === "major") {
        pkg.version = `${major + 1}.0.0`;
        save();
        return;
    }
    if (argv[2] && argv[2] === "minor") {
        pkg.version = `${major}.${minor + 1}.0`;
        save();
        return;
    }
    pkg.version = `${major}.${minor}.${patch + 1}`;
    save();
})();

