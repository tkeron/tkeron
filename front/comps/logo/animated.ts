import { image, imageType } from "@comps/std/image";
import ico from "./skcustker.gif";


export const staticLogo = () => {
    const com = image("animated tkeron icon", "auto", "60px", { url: ico, type: imageType.gif });
    return com;
};
