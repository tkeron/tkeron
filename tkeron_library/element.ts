import { appendIn } from "./appendIn";
import { setAttribute } from "./setAttribute";
import { setHtml, setText } from "./setHtml_setText";
import { addClass, removeClass } from "./addClass_removeClass";
import { addChilds } from "./addChilds";

export interface TkeronElement {
  htmlElement: HTMLElement;
  appendIn: {
    body: TkeronElement;
    head: TkeronElement;
    element: (querySelector: string) => TkeronElement;
  };
  setHtml: (html: string) => TkeronElement;
  setText: (text: string) => TkeronElement;
  setAttribute: (attribute: string, value: string) => TkeronElement;
  addClass: (...className) => TkeronElement;
  removeClass: (...className) => TkeronElement;
  childs: TkeronElement[];
  addChilds: (...childs: TkeronElement[]) => TkeronElement;
}

export interface TkeronElementArguments {
  tag: string;
  childs: TkeronElement[];
}

export type TkeronElementConstructor = (
  args?: Partial<TkeronElementArguments> | string
) => TkeronElement;

export type TkeronElementAuto = TkeronElement & TkeronElementConstructor;

export const tk = <TkeronElementAuto>((
  tagOrArgs?: Partial<TkeronElementArguments> | string
): TkeronElement => {
  if (!tagOrArgs) tagOrArgs = {};

  let { tag, childs } = typeof tagOrArgs === "object" ? tagOrArgs : <any>{};

  if (typeof tagOrArgs === "string") tag = tagOrArgs;

  if (!tag) tag = "div";

  const com = <TkeronElement>{
    htmlElement: document.createElement(tag),
    childs: childs || [],
  };

  //init chaining methods
  appendIn(com);
  setHtml(com);
  setText(com);
  setAttribute(com);
  addClass(com);
  removeClass(com);
  addChilds(com);

  if (childs)
    for (const child of childs) {
      com.childs.push(child);
      com.htmlElement.appendChild(child.htmlElement);
    }

  return com;
});

for (const attribute of [
  "htmlElement",
  "appendIn",
  "setHtml",
  "setText",
  "setAttribute",
  "addClass",
  "removeClass",
  "childs",
  "addChilds"
]) {
  Object.defineProperty(tk, attribute, {
    get() {
      return tk()[attribute];
    },
  });
}
