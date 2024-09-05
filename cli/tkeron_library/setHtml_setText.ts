import { TkeronElement } from "./element";

export const setHtml = (com: TkeronElement) => {
  com.setHtml = (html) => {
    com.htmlElement.innerHTML = html;
    return com;
  };
};

export const setText = (com: TkeronElement) => {
  com.setText = (text) => {
    com.htmlElement.innerHTML = text;
    return com;
  };
};
