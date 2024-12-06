import { TkeronElement } from "./element";
import { settings } from "./settings";


export const from = (com: TkeronElement) => {

  com.from = (querySelector) => {

    settings.runOnLoad.push(() => {

      com.htmlElement = <Element><unknown>null;
      com.childs = [];
      const element = document.querySelector(querySelector);
      if (!element) return com;
      com.htmlElement = element;

    });

    return com;
  };

};
