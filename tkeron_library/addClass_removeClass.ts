import { TkeronElement } from "./element";

export const addClass = (com: TkeronElement) => {
  com.addClass = (...className) => {
    com.htmlElement.classList.add(...className);
    return com;
  };
};

export const removeClass = (com: TkeronElement) => {
  com.removeClass = (...className) => {
    com.htmlElement.classList.remove(...className);
    return com;
  };
};
