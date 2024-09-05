export * from "./element";
import { tk } from "./element";
import { settings } from "./settings";

/**
 * @param css {string} css code to append in style element
 */
export const addCss = (css: string) => {
  tk({ tag: "style" });
};

/**
 * Run on document load to render elements waiting for body element.
 */
document.addEventListener("DOMContentLoaded", () => {
  settings.loaded = true;
  for (const fn of settings.runOnLoad) {
    fn();
  }
});
