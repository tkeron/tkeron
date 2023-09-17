import { DOMWindow } from "jsdom";
import { getType } from "../getType";

const allowed = ["Int8Array", "Int16Array", "Int32Array", "Uint8Array", "Uint16Array", "Uint32Array", "Float32Array", "Float64Array", "Uint8ClampedArray"];
const allowedMax = [2 ** 8, 2 ** 16, 2 ** 32, 2 ** 8, 2 ** 16, 2 ** 32, 2 ** 32, 2 ** 64, 2 ** 8];


export const getRandomValues = (a: Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array | Uint32Array | Float32Array | Float64Array | Uint8ClampedArray) => {
    const type = getType(a);
    if (!allowed.includes(type)) throw DOMException.NOT_SUPPORTED_ERR;
    const length = (Array.from(a)).length;
    if (length > (2 ** 16)) throw DOMException.QUOTA_EXCEEDED_ERR;
    const max = allowedMax[allowed.indexOf(type)];
    return a.map(() => Math.random() * max);
};


export const ext_crypto = (window: DOMWindow) => {
    //@ts-ignore
    window.crypto = { getRandomValues };
};

