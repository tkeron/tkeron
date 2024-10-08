import { JSDOM } from "jsdom";
import { serializeDocument } from "../serializeDocument";

export const joinScript = (html: string) => {
  const { window } = new JSDOM(html);
  const { document } = window;
  let scriptValue = "";
  const scriptNodes = document.querySelectorAll("script");
  for (const script of scriptNodes) {
    if (script.src) continue;
    scriptValue += script.innerHTML;
    script.parentNode.removeChild(script);
  }
  if (scriptValue === "") return;
  const uniqueScript = document.createElement("script");
  uniqueScript.innerHTML = scriptValue;
  uniqueScript.classList.add("jsdom_unique_script");
  document.head.appendChild(uniqueScript);
  return serializeDocument(document);
};
