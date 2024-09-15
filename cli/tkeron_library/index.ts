export * from "./element";
import { tk } from "./element";
import { settings } from "./settings";

/**
 * @param css {string} css code to append in style element
 */
export const addCss = (css: string) => {
  tk({ tag: "style" }).setHtml(css).appendIn.head;
};

export const addCssReset = () => {
  addCss(`
      * {
        box-sizing: border-box;
        position: relative;
        min-width: 0;
      }

      body {
        min-height: 100dvh;
      }

      h1, h2, h3, h4 {
        text-wrap: balance;
      }

      p {
        text-wrap: pretty;
      }
`);
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
