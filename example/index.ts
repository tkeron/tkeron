import { tkeron as t } from "./tkeron";
import { front } from "./comps/frontComp";
import { resources } from "./resources";
import {anim} from "./comps/anim";

front().appendIn("body");

t({ type: "img" }).css(`
    width: 100px;
`)
    .addAttribute("alt", "tkeron logo")
    .addAttribute("src", resources.ico_skcustker.url)
    .appendIn("body");


anim().appendIn("body");