import os from "os";
import fs from "fs";
import { join, basename, normalize } from "path";
import { getOpts, tkeronOpts } from "./getOpts";
import gcc from "./gcc";
import { getArg } from "./getArg";
import { minify_html, minify_js } from "./minify";
import { exec } from "./exec";
import "./renderBack";
import { ts2mjs } from "./ts2js";
import { Component } from "./tkeron";
import { getCode } from "./getCode";
import { log } from "./log";
import { rnds } from "./rnd";
import { winPath } from "./winPath";
import { toBrowserModule } from "./toBrowserModule";
import { tscpath } from "./tscpath";
import { cleanResources } from "./resources";

const tmpp = join(os.tmpdir(), "tkeron-" + rnds(10));

const getSourceFiles = (dir: string): string[] => {
    const files = fs.readdirSync(dir, { encoding: "utf-8" });
    return files.filter(f => f.match(/.html$/i)).map(f => f.replace(/.html$/i, ""));
};

const buildFile = async (fileName: string, sourceDir: string): Promise<string | undefined> => {
    const fromFile = join(sourceDir, `/${fileName}.ts`);
    if (!fs.existsSync(fromFile)) return undefined;
    const outfile = join(tmpp, `/tkeron-${fileName}-Bundle.js`);
    await exec(`node ${tscpath} --module AMD --strict true --lib ES2015,dom  --target ES5 --skipLibCheck --esModuleInterop true --moduleResolution Classic --outFile ${outfile} ${fromFile}`)
        .catch((_err) => {
            throw Error(`¡Error!` + JSON.stringify(_err));
        });
    const fini = `import fs from "fs";
    const modules = [];
    const define = (module, args, fn) => {
        args = args.map(q => "exports");
        args[0] = "null";
        modules.push( \`(\${fn})(\${args.join(", ")});\` );
    };
    `;
    const bundlepostp = join(tmpp, `/tkeron-${fileName}-BundlePost.js`).replace(/\\/g, "\\\\");
    const ffin = `

    const awge = \`
    var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {     function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }     return new (P || (P = Promise))(function (resolve, reject) {         function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }         function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }         function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }         step((generator = generator.apply(thisArg, _arguments || [])).next());     }); };
    var __generator = (this && this.__generator) || function (thisArg, body) {     var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;     return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;     function verb(n) { return function (v) { return step([n, v]); }; }     function step(op) {         if (f) throw new TypeError("Generator is already executing.");         while (_) try {             if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;             if (y = 0, t) op = [op[0] & 2, t.value];             switch (op[0]) {                 case 0: case 1: t = op; break;                 case 4: _.label++; return { value: op[1], done: false };                 case 5: _.label++; y = op[1]; op = [0]; continue;                 case 7: op = _.ops.pop(); _.trys.pop(); continue;                 default:                     if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }                     if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }                     if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }                     if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }                     if (t[2]) _.ops.pop();                     _.trys.pop(); continue;             }             op = body.call(thisArg, _);         } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }         if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };     } };
    var __importDefault = (this && this.__importDefault) || function (mod) {    return (mod && mod.__esModule) ? mod : { "default": mod };};    
    var __spreadArrays = (this && this.__spreadArrays) || function () { for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length; for (var r = Array(s), k = 0, i = 0; i < il; i++)        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)            r[k] = a[j]; return r; };
    \`;
    let res = \`\${awge}const exports = {};\n\`;
    
    modules.forEach(m => {
        res += m + \"\\n\";
    });
    fs.writeFileSync("${bundlepostp}", res);
    `;
    const bundleFile = fini + fs.readFileSync(outfile) + ffin;
    const bundlePrep = join(tmpp, `/tkeron-${fileName}-BundlePre.mjs`);
    fs.writeFileSync(bundlePrep, bundleFile);

    await exec(`node ${bundlePrep}`)
        .catch((err) => {
            throw Error("Error executing bundle pre:  " + JSON.stringify(err));
        });

    const jsResP = join(tmpp, `/tkeron-${fileName}-BundlePost.js`);
    const jsRes = fs.readFileSync(jsResP, { encoding: "utf-8" });
    return jsRes;
};

const buildModules = async (files: string[], opts: tkeronOpts) => {
    const ofls = files.map(f => `/${f}.dm.ts`);
    const filesp = files.map(f => join(opts.sourceDir, `/${f}.dm.ts`));
    const rfiles: any = {};
    for (const i in filesp) {
        const f = filesp[i];
        const r = await toBrowserModule(f, opts.outputDir);
        if (r) rfiles[files[i]] = ofls[i].replace(/ts$/, "js");
    }
    return rfiles;
};

const renderBack = async (dirs: tkeronOpts, files: string[]): Promise<any> => {
    const tscj = join(dirs.sourceDir, "/tsconfig.json");
    const tmppfront = join(tmpp, "/front").replace(/\\/g, "\\\\");
    fs.writeFileSync(tscj, `
{
    "compilerOptions": {
        "module": "ESNext",
        "outDir": "${tmppfront}",
        "sourceMap": false,
        "strict": true,
        "target": "es2017",
        "esModuleInterop": true,
        "moduleResolution": "Node",
        "declaration": false,
        "skipLibCheck": true
    },
    "compileOnSave": true,
}`, { encoding: "utf-8" });
    const srcdir = join(dirs.sourceDir);
    await exec(`node ${tscpath} -p ${srcdir}`)
        .catch((_err) => {
            throw Error(`¡Error!` + JSON.stringify(_err));
        });

    fs.unlinkSync(tscj);


    const tmp = join(tmpp, "/front");
    ts2mjs(tmp);


    const res: any = {};
    for (const i in files) {
        res[files[i]] = "";
        const file = join(tmpp, "/front", `/${files[i]}.b.mjs`);
        if (!fs.existsSync(file)) continue;
        const nrm = winPath(file);
        const com = await import(nrm).catch(_e => log("error in import", _e)).then(m => {
            if (Array.isArray(m.default)) return m.default;
            return [m.default];
        });
        if (!com) continue;

        const html = (com as Component[]).reduce((p, c) => {
            if (!c) return p;
            if (!("getHTML" in c)) return p;
            p += c.getHTML();
            return p;
        }, "");
        const css = document.head.innerHTML;
        document.head.innerHTML = "";
        res[files[i]] = [html, css];
    }

    const opts = getOpts();

    //@ts-ignore
    const files2move = globalThis.tkeron_resources || {};

    const sttc = fs.readdirSync(opts.staticDir, { encoding: "utf-8" }).map(d => `/${d}`);
    const htmls = files.map(f => join(opts.sourceDir, `${f}.html`));
    htmls.forEach(f => {
        const fc = fs.readFileSync(f, { encoding: "utf-8" });
        sttc.forEach(s => {
            if (fc.includes(s)) {
                files2move[s.replace(/^\//, "").replace(/\W/g, "_")] = s.replace(/^\//, "");
            }
        });
    });

    return res;
};

export const runBuild = async () => {
    log("building...");
    fs.mkdirSync(tmpp, { recursive: true });
    const gccok = getArg("gcc");
    const minify = getArg("min");

    const hotrestart = getArg("hotrestart");
    const hotrestartjs = getCode("simpleHotRestart.js");

    const opts = getOpts();
    if (!fs.existsSync(opts.outputDir)) {
        fs.mkdirSync(opts.outputDir, { recursive: true });
    }
    const srcFiles = getSourceFiles(opts.sourceDir);

    const mods = await buildModules(srcFiles, opts);

    const rb = await renderBack(opts, srcFiles);

    for (const i in srcFiles) {
        const f = srcFiles[i];
        let js = await buildFile(f, opts.sourceDir).catch(_e => {
            log(`Error building js:\n\n${_e}\n\n`);
            return undefined;
        });
        const srcp = join(opts.sourceDir, `/${f}.html`);
        let html = fs.readFileSync(srcp, { encoding: "utf-8" });


        const cssfilename = join(opts.sourceDir, `/${f}.css`);
        if (fs.existsSync(cssfilename)) {
            const css = fs.readFileSync(cssfilename, { encoding: "utf-8" });
            html = html.replace(/\<\/head\>/, `<style>\n${css}\n</style></head>`);
        }
        const backCss = rb[f][1];
        html = backCss ? html.replace(/\<\/head\>/, `${backCss}</head>`) : html;

        if (hotrestart) js = `${hotrestartjs}\n\n${js ? js : ""}`;

        if (js) {
            js = `(() => {${js}})();`;
        }

        if (js) js = await cleanResources(js);

        if (minify && !gccok && js) js = minify_js(js);
        if (gccok && js) js = await gcc(js);

        html = js ? html.replace(/\<\/head\>/, `<script>${js}</script></head>`) : html;
        html = rb[f] ? html.replace(/\<\/body\>/, `${rb[f][0]}</body>`) : html;

        if (Object.keys(mods).length && typeof mods[f] === "string") {
            const cb = `?cb=${(new Date()).getTime()}`;
            html = html.replace(/\<\/head\>/, `<script type="module" defer src="${mods[f].replace(/^\//, "")}${cb}"></script>`);
        }

        if (minify) html = minify_html(html);
        const outpt = join(opts.outputDir, `/${f}.html`);
        fs.writeFileSync(outpt, html);
    }

    fs.rmdirSync(tmpp, { recursive: true });

    const compdate = new Date().getTime();
    const cpd = join(opts.outputDir, "/compdate.txt");
    fs.writeFileSync(cpd, `compilation date: ${compdate}`, { encoding: "utf-8" });


    //move resources
    //@ts-ignore
    if (typeof globalThis.tkeron_resources !== "undefined") {
        //@ts-ignore
        const files2move = globalThis.tkeron_resources;
        Object.values(files2move).forEach(f => {
            const orig = join(opts.staticDir, (f as string));
            const dest = join(opts.outputDir, (f as string));
            const file = basename(dest);
            const ldir = normalize(dest.slice(0, dest.length - file.length));
            if (!fs.existsSync(ldir)) fs.mkdirSync(ldir, { recursive: true });
            fs.copyFileSync(orig, dest);
        });
    }


    log("site built...");
};

export const doc = `
    build [OPTIONS]       Transpile the code from sourceDir ("front" by 
                          default) to outputDir ("web" by default).
        OPTIONS
        min               Minify the output html code
        gcc               Compile the js code with Google Closure Compiler
        hotrestart        Inject a simple js to restart page on changes. By
                          default used on "tkeron dev"
`;



