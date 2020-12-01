
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
  setElement(el: HTMLElement): Component;

  css(css: string): Component;
  getCss(): string;

  on(f: (_com: Component, _el: HTMLElement) => void): Component;

  onRender(fn: () => void): Component;
  onAppend(fn: () => void): Component;
}

enum event {
  render,
  append
}
const handlers: any = {};
const addHandler = (id: string, event: event, fn: () => void) => {
  if (typeof handlers[event] === "undefined") handlers[event] = {} as any;
  if (typeof handlers[event][id] === "undefined") handlers[event][id] = [] as any[];
  handlers[event][id].push(fn);
};
const runHandlers = (id: string, event: event) => {
  if (typeof handlers[event] === "undefined") return;
  if (typeof handlers[event][id] === "undefined") return;
  handlers[event][id].forEach((fn: () => void) => fn());
};

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
  let el = document.createElement(opt.type || "div");
  const priv = {
    parent: {} as Component | null,
    childs: [] as Component[],
    css: ""
  };
  priv.parent = null;
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
          runHandlers(com.id, event.render);
          return com;
        }
        domel.innerHTML = "";
        domel.appendChild(el);
        runHandlers(com.id, event.render);
        return com;
      }
      (query as HTMLElement).innerHTML = "";
      (query as HTMLElement).appendChild(el);
      runHandlers(com.id, event.render);
      return com;
    },
    appendIn: (query: string | HTMLElement) => {
      if (typeof query === "string") {
        const domel = document.querySelector(query);
        if (!domel) {
          setTimeout(() => {
            com.appendIn(query);
          }, 0);
          runHandlers(com.id, event.append);
          return com;
        }
        domel.appendChild(el);
        runHandlers(com.id, event.append);
        return com;
      }
      (query as HTMLElement).appendChild(el);
      runHandlers(com.id, event.append);
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
    setElement: (ele: HTMLElement) => {
      if (!ele) throw Error("Component.setElement: Element must not be null.");
      el = ele;
      return com;
    },
    css: (css: string) => {
      priv.css = css;
      tkeron.css(com.id, `#${com.id} {${css}}`);
      com.addAttribute("id", com.id);
      return com;
    },
    getCss: () => priv.css,
    on: (f) => {
      f(com, el);
      return com;
    },
    onRender: (fn) => {
      addHandler(com.id, event.render, fn);
      return com;
    },
    onAppend: (fn) => {
      addHandler(com.id, event.append, fn);
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



export const version = "1.4.2";