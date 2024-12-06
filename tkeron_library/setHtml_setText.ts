import { TkeronElement } from "./element";
import { settings } from "./settings";

export const setHtml = (com: TkeronElement) => {
  com.setHtml = (html) => {
    if (!settings.loaded) {
      settings.runOnLoad.push(() => com.htmlElement.innerHTML = html);
      return com;
    }
    com.htmlElement.innerHTML = html;
    return com;
  };
};

export const setText = (com: TkeronElement) => {
  com.setText = (text) => {
    if (!settings.loaded) {
      settings.runOnLoad.push(() => com.htmlElement.textContent = text);
      return com;
    }
    com.htmlElement.textContent = text;
    return com;
  };
};
