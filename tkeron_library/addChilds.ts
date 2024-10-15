import { TkeronElement } from "./element";

export const addChilds = (com: TkeronElement) => {
  com.addChilds = (...elements) => {
    for (const element of elements) {
      com.childs.push(element);
      com.htmlElement.appendChild(element.htmlElement);
    }

    return com;
  };
};
