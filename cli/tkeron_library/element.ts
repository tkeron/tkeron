import { appendIn } from "./appendIn";
import { setAttribute } from "./setAttribute";
import { setHtml, setText } from "./setHtml_setText";

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
}

export interface TkeronElementArguments {
  tag: string;
  childs: TkeronElement[];
}

export const tk = (
  args?: Partial<TkeronElementArguments> | string
): TkeronElement => {
  if (!args) args = {};

  let { tag, childs } = typeof args === "object" ? args : <any>{};

  if (typeof args === "string") tag = args;

  if (!tag) tag = "div";

  const com = <TkeronElement>{
    htmlElement: document.createElement(tag),
  };

  //init chaining methods
  appendIn(com);
  setHtml(com);
  setText(com);
  setAttribute(com);

  if (childs)
    for (const child of childs) {
      com.htmlElement.appendChild(child.htmlElement);
    }

  return com;
};
