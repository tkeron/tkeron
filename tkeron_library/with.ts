import { TkeronElement } from "./element";
import { settings } from "./settings";

export const with_ = (com: TkeronElement) => {
  com.with = (fn) => {
    if (settings.loaded) fn(com);
    settings.runOnLoad.push(() => fn(com));

    return com;
  };

  return com;
};
