import { image, imageType } from "../image";
import skcustker from "./skcustker.gif";

export const logo = () => {
    const com = image("tkeron animated logo", "50px", "50px", { url: skcustker, type: imageType.gif });

    return com;
};
