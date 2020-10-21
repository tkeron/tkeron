import { tkeron as t } from "./tkeron";
import back from "./comps/backComp";
import anim from "./comps/anim";

export default [
    anim,
    t({ type: "h1" }).setValue("Welcome to tkeron! "),
    back
];


