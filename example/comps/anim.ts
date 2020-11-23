import { tkeron as t } from "../tkeron";
import { resources } from "../resources";


export const anim = () => t({ type: "img" })
    .addAttribute("src", resources.gif_skcustker.url)
    .addAttribute("alt", "tkeron animated logo skcustker");

