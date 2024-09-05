import { TkeronElement } from "./element";

export const setAttribute = (com: TkeronElement) => {
  com.setAttribute = (attribute, value) => {
    com.htmlElement.setAttribute(attribute, value);
    return com;
  };
};
