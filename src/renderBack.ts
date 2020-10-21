import crypto from "crypto";

const toHexString = (bytes: Uint8Array): string =>
    bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "");
const rnds = (n: number): string => {
    return toHexString(crypto.randomBytes(n)).slice(0, n);
};
const IDs: string[] = [];
const getID = (): string => {
    const id = "tknode_" + rnds(20);
    if (IDs.includes(id)) {
        return getID();
    }
    return id;
};

const singles = ["area", "base", "basefont", "br", "col", "embed", "frame", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"];
const valueProps = ["button", "data", "input", "li", "option", "output", "param", "select", "textarea"];

const getHTMLElement = (tag: string) => {
    const valueProp: boolean = valueProps.some(n => tag === n);
    const single: boolean = singles.some(n => tag === n);
    const priv = {
        childs: [] as any,
        value: ""
    };

    const el = {
        _id: getID(),
        tagName: tag,
        appendChild: (node: any) => {
            priv.childs.push(node);
        },
        removeChild: (node: any) => {
            priv.childs = priv.childs.filter((ch: any) => ch._id !== node._id);
        },
        value: "",
        innerHTML: "",
        outerHTML: "",
        attributes: {} as any,
        classList: [] as string[],
        setAttribute: (attr: string, value: string) => {
            el.attributes[attr] = value;
        },
        querySelector: (selectors: string) => {
            const ele = (priv.childs as Array<any>).filter(e => {
                if ("selctr" in e) {
                    if (e.selctr === selectors) return true;
                }
            });
            if (ele.length) return ele[0];
            return null;
        }
    };
    Object.defineProperty(el.classList, "add", {
        get() {
            return (cl: string) => {
                if (el.classList.includes(cl)) return;
                el.classList.push(cl);
                el.attributes.class = el.classList.join(" ");
            };
        }
    });
    Object.defineProperty(el.classList, "remove", {
        get() {
            return (cl: string) => {
                el.classList = el.classList.filter(c => c !== cl);
                el.attributes.class = el.classList.join(" ");
            };
        }
    });

    const getOuter = () => {
        const attrs = Object.keys(el.attributes).sort((a, b) => a === b ? 0 : a > b ? -1 : 1).reduce((p, c) => {
            p = ` ${c}=\"${el.attributes[c]}\"` + p;
            return p;
        }, "");
        return single ? `<${tag}${attrs}>` : `<${tag}${attrs}>${el.innerHTML}</${tag}>`;
    };

    Object.defineProperty(el, "innerHTML", {
        get() {
            if (valueProp) return el.value;
            let s = el.value;
            priv.childs.forEach((_e: any) => {
                s += _e.outerHTML;
            });
            return s;
        },
        set(v: string) {
            priv.childs = [];
            el.value = v;
            return true;
        }
    });

    Object.defineProperty(el, "value", {
        get() {
            return priv.value;
        },
        set(v: any) {
            priv.value = v;
            if (valueProp) {
                el.attributes.value = v;
            }
            return true;
        }
    });

    Object.defineProperty(el, "outerHTML", {
        get() {
            return getOuter();
        }
    });

    return el;
};


//@ts-ignore
globalThis["document"] = {
    //@ts-ignore
    createElement: (tag: string) => {
        return getHTMLElement(tag);
    },
    //@ts-ignore
    head: getHTMLElement("head"),
    //@ts-ignore
    body: getHTMLElement("body"),
    querySelector: (selectors: string) => {
        const h = document.head.querySelector(selectors);
        if (h) return h;
        return document.body.querySelector(selectors);
    }
};

//@ts-ignore
globalThis["crypto"] = {
    //@ts-ignore
    getRandomValues: (l: Uint8Array): Uint8Array => {
        return crypto.randomBytes(l.length);
    }
};


