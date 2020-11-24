import fs from "fs";
import gcc from "./gcc";
import { getArg } from "./getArg";
import { minify_js, minify_css } from "./minify";
import { test } from "./unitTest";
import { tkeron } from "./tkeron";
import "./renderBack";
import { getImports } from "./imports";
import { anyEquals } from "./anyEquals";
import { getFilesRecursive } from "./getFilesRecursive";
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { copyDir } from "./copyDir";
import { getRecursiveDirs } from "./getRecursiveDirs";
import { createResourcesFile } from "./resources";
import { runInit } from "./init";
import { strictRightCoincidence } from "./stringCompare";
import { runBuild } from "./build";
import { channel } from "./channel";


const __dirname = dirname(fileURLToPath(import.meta.url));

(async () => {


    await test("channel send and receive", async () => {
        const ch1a = channel("1");
        const ch1b = channel("1");
        const res: any[] = [];
        ch1a.onMessage((msg) => {
            res.push(`a ${msg}`);
        });
        ch1b.postMessage("hi");
        return (
            res.length === 1 &&
            res.join("") === "a hi"
        );
    });

    await test("channel not same receiver", async () => {
        const ch1a = channel("1");
        const res: any[] = [];
        ch1a.onMessage((msg) => {
            res.push({ to: "a", msg });
        });
        ch1a.postMessage({ from: "a", message: "ok" });
        return res.length === 0;
    });

    await test("channel receive correct n times", async () => {
        const ch1a = channel("1");
        const ch1b = channel("1");
        const res: any[] = [];
        ch1a.onMessage((msg) => res.push(`a ${msg}`));
        ch1b.onMessage((msg) => res.push(`b ${msg}`));
        ch1a.postMessage(1);
        ch1a.postMessage(2);
        ch1b.postMessage(3);
        ch1a.postMessage(4);
        return (
            res.length === 4 &&
            res.filter(m => m.match(/^b/)).length === 3
        );
    });

    await test("channel close must not receive", async () => {
        const ch1a = channel("1");
        const ch1b = channel("1");
        const res: any[] = [];
        ch1a.onMessage((msg) => res.push(`a ${msg}`));
        ch1b.onMessage((msg) => res.push(`b ${msg}`));
        ch1a.postMessage(1);
        ch1b.postMessage(1);
        const r1 = res.sort().join("|");
        ch1a.close();
        ch1a.postMessage(2);
        ch1b.postMessage(2);
        const r2 = res.sort().join("|");
        return r1 === r2;
    });

    await test("channel reopened must receive", async () => {
        const ch1a = channel("1");
        const ch1b = channel("1");
        const res: any[] = [];
        ch1a.onMessage((msg) => res.push(`a ${msg}`));
        ch1b.onMessage((msg) => res.push(`b ${msg}`));
        ch1a.postMessage(1);
        ch1b.postMessage(1);
        const r1 = res.sort().join("|");
        ch1a.close();
        ch1a.postMessage(2);
        ch1b.postMessage(2);
        const r2 = res.sort().join("|");
        return r1 === r2;
    });

    await test("getArg", async () => {
        const argv = [
            "dsa",
            "-a",
            "gfd",
            "asda",
            "--wq",
            "ty",
            "gfh",
            "cdfa",
            "-q",
            "q23e",
            "poi=qwerty",
            "azx",
        ];
        const res: any = {
            t1: getArg("-a", argv),
            t2: getArg("asda", argv),
            t3: getArg("--wq", argv),
            t4: getArg("cxz", argv),
            t5: getArg("-q", argv),
            t6: getArg("azx", argv),
            t7: getArg("poi", argv)
        };
        const ex: any = {
            t1: "gfd",
            t2: "asda",
            t3: "ty",
            t4: undefined,
            t5: "q23e",
            t6: "azx",
            t7: "qwerty"
        };
        const ok = Object.keys(ex).map((e: string) => {
            return [e, res[e] === ex[e]];
        });
        return !ok.some(q => !q[1]);
    });

    await test("minify js", async () => {
        const jscode = `   const x =  "asdf"  ;

        //this is a js code to minify...
          cons${""}ole.log(x);
        /*
            this is a multiline comment...
        */
        const y  =  \`\${x}-qwerty\`  ; 
          cons${""}ole.log(y) ; 
    `;
        const ex = `const x = "asdf"; cons${""}ole.log(x); const y = \`\${x}-qwerty\`; cons${""}ole.log(y); `;
        const res = minify_js(jscode);
        return res === ex;
    });

    await test("minify css", async () => {
        const csscode = `
    .button:hover {
        box-shadow: -3px 3px 3px #000;
        /* width: 320px;    height: 50px; */
        text-shadow: -1px 1px 1px #000;
    }
    
    .scroll_down {
        width: 100%;
        height: 0px;
        z-index: 1;
        overflow: visible;
        cursor: pointer;
        /* width: 320px;
        height: 50px; */
    }
    `;
        const ex = `.button:hover { box-shadow: -3px 3px 3px #000; text-shadow: -1px 1px 1px #000; } .scroll_down { width: 100%; height: 0px; z-index: 1; overflow: visible; cursor: pointer; } `;
        const res = minify_css(csscode);
        return res === ex;
    });

    await test("gcc", async () => {
        const jscode = `
            const qwe = "this constant will be a var...";
            cons${""}ole.log(qwe);
        `;
        const res = await gcc(jscode);
        const ex = `var qwe="this constant will be a var...";cons${""}ole.log(qwe);`;
        return res === ex;
    });

    await test("imports", async () => {
        const inp = `
        import { box } from "./comps/box"${""};
        import resources from "./resources"${""};
        import fs from "fs"${""};
        import { tkeron as t } from "./tkeron.js"${""};
        import "./tkeron2"${""};
        import "./tkeron3.js"${""};

        const value = "Tkeron is a microframework for develop web user interfaces.";
        
        export default [
            box().setValue("This is a backend source component... 1"),
            box().setValue("This is a backend source component... 2")
                .addClass("second"),
            box().setValue("This is a backend source component... 3"),
            t({ type: "img" }).addAttribute("src", resources.png_skcustker.url)
        ];
        `;
        const res = getImports(inp);

        const exp = [
            {
                imprt: 'import { box } from "./comps/box"' + ';',
                file: './comps/box'
            },
            {
                imprt: 'import resources from "./resources"' + ';',
                file: './resources'
            },
            { imprt: 'import fs from "fs"' + ';', file: 'fs' },
            {
                imprt: 'import { tkeron as t } from "./tkeron.js"' + ';',
                file: './tkeron.js'
            },
            { imprt: 'import "./tkeron2"' + ';', file: './tkeron2' },
            { imprt: 'import "./tkeron3.js"' + ';', file: './tkeron3.js' }
        ];

        return anyEquals(res, exp);
    });

    await test("tkeron render back", async () => {
        const res = [];
        const c1 = tkeron().setValue("comp 1...")
            .addAttribute("xyz", "attr 1...")
            .addAttribute("qwe", "attr 2...")
            ;
        const ex1 = `<div qwe="attr 2..." xyz="attr 1...">comp 1...</div>`;
        res.push([c1.getHTML() === ex1, c1.getHTML(), ex1]);
        const c2 = tkeron({ type: "input" }).setValue("comp 2...");
        const ex2 = `<input value="comp 2...">`;
        res.push([c2.getHTML() === ex2, c2.getHTML(), ex2]);
        const c3 = tkeron().setValue("comp 3...")
            .addClass("class_1")
            .addClass("class_2")
            .addClass("class_3")
            .addClass("del_class");
        c3.removeClass("del_class");
        const ex3 = `<div class="class_1 class_2 class_3">comp 3...</div>`;
        res.push([c3.getHTML() === ex3, c3.getHTML(), ex3]);
        c3.add(c2);
        const ex4 = `<div class="class_1 class_2 class_3">comp 3...<input value="comp 2..."></div>`;
        res.push([c3.getHTML() === ex4, c3.getHTML(), ex4]);
        c1.add(c3);
        const ex5 = `<div qwe="attr 2..." xyz="attr 1...">comp 1...<div class="class_1 class_2 class_3">comp 3...<input value="comp 2..."></div></div>`;
        res.push([c1.getHTML() === ex5, c1.getHTML(), ex5]);
        c2.addClass("qwerty").addClass("class2");
        const ex6 = `<div qwe="attr 2..." xyz="attr 1...">comp 1...<div class="class_1 class_2 class_3">comp 3...<input class="qwerty class2" value="comp 2..."></div></div>`;
        res.push([c1.getHTML() === ex6, c1.getHTML(), ex6]);
        c3.add(
            tkeron().setValue("sub1"),
            tkeron().setValue("sub2")
        );
        const ex7 = `<div class="class_1 class_2 class_3">comp 3...<input class="qwerty class2" value="comp 2..."><div>sub1</div><div>sub2</div></div>`;
        res.push([c3.getHTML() === ex7, c3.getHTML(), ex7]);
        return !res.some(r => !r[0]);
    });

    await test("copyDir", async () => {
        const from = join(__dirname, `../_test/movedir/from`);
        const to = join(__dirname, `../_test/movedir/to`);
        fs.rmdirSync(to, { recursive: true });
        fs.mkdirSync(to, { recursive: true });
        copyDir(from, to);
        const getfl = (path: string, fpath: string) => fpath.slice(path.length);
        const dirs0 = getRecursiveDirs(from).map(d => getfl(from, d));
        const files0 = getFilesRecursive(from, "*").map(d => getfl(from, d));
        const dirs1 = getRecursiveDirs(to).map(d => getfl(to, d));
        const files1 = getFilesRecursive(to, "*").map(d => getfl(to, d));
        return (dirs0.sort().join("") === dirs1.sort().join("")) && (files0.sort().join("") === files1.sort().join(""));
    });

    await test("copyDir example", async () => {
        const from = join(__dirname, `../_test/movedir/example`);
        const to = join(__dirname, `../_test/movedir/to`);
        fs.rmdirSync(to, { recursive: true });
        fs.mkdirSync(to, { recursive: true });
        copyDir(from, to);
        const getfl = (path: string, fpath: string) => fpath.slice(path.length);
        const dirs0 = getRecursiveDirs(from).map(d => getfl(from, d));
        const files0 = getFilesRecursive(from, "*").map(d => getfl(from, d));
        const dirs1 = getRecursiveDirs(to).map(d => getfl(to, d));
        const files1 = getFilesRecursive(to, "*").map(d => getfl(to, d));
        return (dirs0.sort().join("") === dirs1.sort().join("")) && (files0.sort().join("") === files1.sort().join(""));
    });

    await test("create resources file", async () => {
        const src = join(__dirname, "../_test/resources/front");
        const stt = join(__dirname, "../_test/resources/static");
        const out = join(__dirname, "../_test/resources/web");
        const expPath = join(__dirname, "../_test/resources/resources.ts");
        const resPath = join(__dirname, "../_test/resources/front/resources.ts");
        createResourcesFile(src, stt);
        const expCont = fs.readFileSync(expPath, { encoding: "utf-8" }).replace(/\r/g, "");
        const resCont = fs.readFileSync(resPath, { encoding: "utf-8" }).replace(/\r/g, "");
        //@ts-ignore
        globalThis.argv = ["", "", `source=${src}`, `static=${stt}`, `output=${out}`];
        return expCont === resCont;
    });

    await test("init", async () => {
        const src = join(__dirname, "../example");
        const stt = join(__dirname, "../static");
        const out = join(__dirname, "../web");
        //@ts-ignore
        globalThis.argv = ["", "", `source=${src}`, `static=${stt}`, `output=${out}`, "init"];
        await runInit();
        const otk = join(__dirname, "./tkeron.ts");
        const otkc = fs.readFileSync(otk, { encoding: "utf-8" });
        const rtk = join(src, "tkeron.ts");
        const rtkc = fs.readFileSync(rtk, { encoding: "utf-8" });
        return otkc === rtkc;
    });

    await test("init example", async () => {
        const fex = join(__dirname, "../_test/example");
        fs.rmdirSync(fex, { recursive: true });
        fs.mkdirSync(fex, { recursive: true });
        const src = join(__dirname, "../_test/example/front");
        const stt = join(__dirname, "../_test/example/static");
        const out = join(__dirname, "../_test/example/web");
        //@ts-ignore
        globalThis.argv = ["", "", `source=${src}`, `static=${stt}`, `output=${out}`, "init", "example"];
        await runInit();
        //@ts-ignore
        globalThis.argv = ["", ""];
        const exa = join(__dirname, "../example");
        const exaFiles = getFilesRecursive(exa, "*").map(f => f.slice(exa.length)).sort().join("");
        const srcFiles = getFilesRecursive(src, "*").map(f => f.slice(src.length)).sort().join("");
        return exaFiles === srcFiles;
    });

    await test("tkeron option value", async () => {
        const exp = "inner HTML value";
        const c = tkeron({ value: exp });
        const res = c.getElement().innerHTML;
        return exp === res;
    });

    await test("tkeron component css", async () => {
        const css = `
                color: #fff;
                background: #000;
        `.replace(/\n/g, " ").replace(/\s+/g, " ");
        const c = tkeron();
        const exp = `<style name="${c.id}">#${c.id} { color: #fff; background: #000; }</style>`;
        c.css(css);
        const res = document.head.innerHTML;
        return exp === res;
    });

    await test("tkeron add", async () => {
        const c1 = tkeron();
        const c2 = tkeron();
        const c3 = tkeron();
        c3.add(c1, c2);
        const exp = [c1.id, c2.id].sort().join("");
        const res = c3.childs.map(c => c.id).sort().join("");
        return exp === res;
    });

    await test("strictRightCoincidence", async () => {
        const test = [
            { s1: "ldi hi hsasdf", s2: "i hsasdf", exp: 8 },
            { s1: "asd fasdf fda", s2: "fdsaf asdf", exp: 0 },
            { s1: "asdasd", s2: "asdasd", exp: 6 },
            { s1: "asd f", s2: "fds asd f", exp: 5 },
            { s1: "vsfdgfdg dfg hdfgh", s2: "sfdgfdg dfg hzfgh", exp: 3 },
            { s1: "i hsasdf", s2: "ldi hi hsasdf", exp: 8 },
            { s1: "fdsaf asdf", s2: "asd fasdf fda", exp: 0 },
            { s1: "asdasd", s2: "asdasd", exp: 6 },
            { s1: "fds asd f", s2: "asd f", exp: 5 },
            { s1: "sfdgfdg dfg hzfgh", s2: "vsfdgfdg dfg hdfgh", exp: 3 },
        ]
            .map((t) => {
                (t as any).res = strictRightCoincidence(t.s1, t.s2);
                (t as any).ok = (t as any).res === t.exp;
                return t;
            });
        return test.reduce((p, c) => {
            if (!(c as any).ok) p = false;
            return p;
        }, true as any);
    });

    await test("tkeron build", async () => {
        const src = join(__dirname, "../_test/build/front");
        const stt = join(__dirname, "../_test/build/static");
        const out = join(__dirname, "../_test/build/web");
        const exp = join(__dirname, "../_test/build/exp");
        fs.rmdirSync(out, { recursive: true });
        //@ts-ignore
        globalThis.argv = ["", "", `source=${src}`, `static=${stt}`, `output=${out}`];
        await runBuild();
        const expFiles = getFilesRecursive(exp, "*").sort().map(f => f.slice(exp.length)).join("");
        const outFiles = getFilesRecursive(out, "*").sort().map(f => f.slice(out.length)).join("");
        return expFiles === outFiles;
    });

})();



