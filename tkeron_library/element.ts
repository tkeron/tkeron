import { appendIn } from "./appendIn";
import { setAttribute } from "./setAttribute";
import { setHtml, setText } from "./setHtml_setText";
import { addClass, removeClass } from "./addClass_removeClass";
import { addChilds } from "./addChilds";
import { from } from "./from";

export interface TkeronElement {
  htmlElement: HTMLElement | Element;
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
  from: (querySelector: string) => TkeronElement;
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
  if (!childs) childs = [];

  const com = <TkeronElement>{
    childs,
    htmlElement: document.createElement(tag),
  };

  //init chaining methods
  appendIn(com);
  setHtml(com);
  setText(com);
  setAttribute(com);
  addClass(com);
  removeClass(com);
  addChilds(com);
  from(com);

  if (childs)
    for (const child of childs) {
      // com.childs.push(child);
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
  "addChilds",
  "from"
]) {
  Object.defineProperty(tk, attribute, {
    get() {
      return tk()[attribute];
    },
  });
}
