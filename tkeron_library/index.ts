export * from "./element";
import { tk } from "./element";
import { settings } from "./settings";

/**
 * @param css {string} css code to append in style element
 */
export const addCss = (css: string) => {
  tk({ tag: "style" }).setHtml(css).appendIn.head;
};

/**
 * 
 * @param fn any sync or async function that will be called in web browser
 * 
 * @example 
 * ```typescript
 * const div = tk.addClass("my-component");
 * // I want this component to change its background to orange when user clicks on it.
 * const setBgOrange = () => {
 *    const div = tk.from(".my-component");
 *    div.htmlElement.addEventListener("click", () => {
 *      div.htmlElement.style.background = "#f60";
 *    });
 * };
 * addScript(setBgOrange);
 * ```
 */
export const addScript = (fn: CallableFunction) => {
  tk("script").setHtml(`
    (${fn})();
      `).appendIn.body;
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
