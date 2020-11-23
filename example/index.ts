import { tkeron as t } from "./tkeron";
import { front } from "./comps/frontComp";
import { resources } from "./resources";


front().appendIn("body");

t({ type: "img" }).css(`
    width: 100px;
`)
    .addAttribute("alt", "tkeron logo")
    .addAttribute("src", resources.ico_skcustker.url)
    .appendIn("body");



    