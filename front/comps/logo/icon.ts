import { image, imageType } from "@comps/std/image";
import ico from "./skcustker.ico";


export const icon = () => {
    const com = image("static icon", "auto", "60px", { url: ico, type: imageType.ico });
    return com;
};

