
export interface tkeronOptions {
  type?: string;
  value?: string;
}

export interface Component {
  readonly id: string;

  value: string;
  setValue(v: string): Component;

  readonly parent: Component | null;
  _setParent(c: Component | null): Component;
  childs: Component[];
  add(...c: Component[]): Component;
  remove(c: Component): Component;

  renderIn(query: string | HTMLElement): Component;
  appendIn(query: string | HTMLElement): Component;

  getHTMLElement(f: (el: HTMLElement) => void): Component;
  getHTML(): string;

  readonly classList: string[];
  addClass(cls: string): Component;
  removeClass(cls: string): Component;

  readonly attributes: any;
  addAttribute(attr: string, value: string): Component;
  removeAttribute(attr: string, value: string): Component;

  getElement(): HTMLElement;

  css(css: string): Component;

  on(f: (_com: Component, _el: HTMLElement) => void): Component;
}

//@ts-ignore
const toHexString = (bytes: Uint8Array): string => bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "");
const rnds = (n: number): string => toHexString(crypto.getRandomValues(new Uint8Array(n))).slice(0, n);
const IDs: string[] = [];
const getID = (): string => {
  const id = "tk_" + rnds(20);
  //@ts-ignore
  if (IDs.includes(id)) {
    return getID();
  }
  return id;
};

export const tkeron = (opt?: tkeronOptions): Component => {
  if (!opt) opt = { type: "div" };
  const valueProp: boolean = [
    "input",
    "textarea"
  ].some(n => {
    if ("type" in (opt as any)) return (opt as any).type === n;
  });
  const el = document.createElement(opt.type || "div");
  const priv: {
    parent: Component | null,
    childs: Component[]
  } = {
    parent: null,
    childs: []
  };
  const com: Component = {
    id: getID(),
    parent: priv.parent,
    _setParent: (c: Component | null) => {
      priv.parent = c;
      return com;
    },
    value: "",
    setValue: (v: string) => {
      com.value = v;
      return com;
    },
    childs: priv.childs,
    add: (...c: Component[]) => {
      c.forEach(_ => {
        _._setParent(com);
        priv.childs.push(_);
        _.getHTMLElement((ele) => {
          el.appendChild(ele);
        });
      });
      return com;
    },
    remove: (c: Component) => {
      c._setParent(null);
      priv.childs = priv.childs.filter(_c => {
        if (_c.id === c.id) return false;
        return true;
      });
      c.getHTMLElement(_el => {
        el.removeChild(_el);
      });
      return com;
    },
    renderIn: (query: string | HTMLElement) => {
      if (typeof query === "string") {
        const domel = document.querySelector(query);
        if (!domel) {
          setTimeout(() => {
            com.renderIn(query);
          }, 0);
          return com;
        }
        domel.innerHTML = "";
        domel.appendChild(el);
        return com;
      }
      (query as HTMLElement).innerHTML = "";
      (query as HTMLElement).appendChild(el);
      return com;
    },
    appendIn: (query: string | HTMLElement) => {
      if (typeof query === "string") {
        const domel = document.querySelector(query);
        if (!domel) {
          setTimeout(() => {
            com.appendIn(query);
          }, 0);
          return com;
        }
        domel.appendChild(el);
        return com;
      }
      (query as HTMLElement).appendChild(el);
      return com;
    },
    getHTMLElement: (f) => {
      f(el);
      return com;
    },
    getHTML: () => {
      return el.outerHTML;
    },
    classList: [],
    addClass: (cls: string) => {
      el.classList.add(cls);
      return com;
    },
    removeClass: (cls: string) => {
      el.classList.remove(cls);
      return com;
    },
    attributes: {},
    addAttribute: (attr: string, value: string) => {
      el.setAttribute(attr, value);
      return com;
    },
    removeAttribute: (attr: string) => {
      el.removeAttribute(attr);
      return com;
    },
    getElement: () => {
      return el;
    },
    css: (css: string) => {
      tkeron.css(com.id, `#${com.id} {${css}}`);
      com.addAttribute("id", com.id);
      return com;
    },
    on: (f) => {
      f(com, el);
      return com;
    }
  };

  Object.defineProperty(com, "attributes", {
    get() {
      return el.attributes;
    }
  });
  Object.defineProperty(com, "value", {
    get() {
      if ({ valueProp, opt }) {
        //@ts-ignore
        return el.value;
      }
      return el.innerHTML;
    },
    set(v: string) {
      if (valueProp) {
        //@ts-ignore
        el.value = v;
        return true;
      }
      priv.childs.forEach(c => c._setParent(null));
      priv.childs.length = 0;
      el.innerHTML = v;
      return true;
    }
  });
  Object.defineProperty(com, "classList", {
    get() {
      //@ts-ignore
      return Array.from(el.classList);
    }
  });

  if (typeof opt.value !== "undefined") com.setValue(opt.value);

  return com;
};

tkeron.css = (name: string, cssText: string) => {
  const selctr = `style[name=${name}]`;
  const cstyle = document.head.querySelector(selctr);
  if (cstyle) {
    cstyle.innerHTML = cssText;
    return;
  }
  const style = document.createElement("style");
  style.setAttribute("name", name);
  style.innerHTML = cssText;
  //@ts-ignore
  style.selctr = selctr;

  document.head.appendChild(style);
};

const Channels: any = {};

interface tkeronChannel {
  name: string;
  postMessage(msg?: any): void;
  close(): void;
  open(): void;
  onMessage: (msg: any) => void;
}

tkeron.channel = (channel: string) => {
  if (!(channel in Channels)) Channels[channel] = {} as any;
  const chid = `ch${Object.keys(Channels[channel]).length}`;
  let closed = 0;
  const ch: tkeronChannel = {
    name: channel,
    open: () => {
      Channels[channel][chid] = ch;
      closed = 0;
    },
    postMessage: (msg: any) => {
      if (closed) return;
      for (const k in Channels[channel]) {
        if (k === chid) continue;
        Channels[channel][k].onMessage(msg);
      }
    },
    close: () => {
      closed = 1;
      delete Channels[channel][chid];
    },
    onMessage: (msg: any) => { },
  };
  Channels[channel][chid] = ch;
  return ch;
};

export const version = "1.3.1";