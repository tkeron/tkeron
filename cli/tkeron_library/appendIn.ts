import { TkeronElement } from "./element";
import { settings } from "./settings";

export const appendIn = (com: TkeronElement) => {
  const appendInElement = (querySelector) => {
    const element = document.querySelector(querySelector);
    if (!element) return;
    element.appendChild(com.htmlElement);
  };

  com.appendIn = {
    body: <TkeronElement>{},
    head: <TkeronElement>{},
    element: (querySelector) => {
      if (!settings.loaded) {
        settings.runOnLoad.push(() => appendInElement(querySelector));
        return com;
      }
      appendInElement(querySelector);
      return com;
    },
  };

  Object.defineProperty(com.appendIn, "body", {
    get() {
      if (!settings.loaded) {
        settings.runOnLoad.push(() =>
          document.body.appendChild(com.htmlElement)
        );
        return com;
      }
      document.body.appendChild(com.htmlElement);
      return com;
    },
  });
  Object.defineProperty(com.appendIn, "head", {
    get() {
      if (!settings.loaded) {
        settings.runOnLoad.push(() =>
          document.head.appendChild(com.htmlElement)
        );
        return com;
      }
      document.head.appendChild(com.htmlElement);
      return com;
    },
  });
};
