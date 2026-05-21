// Pre-render — runs at build time, BEFORE components are inlined.
// Use it for elements that exist directly in this page's HTML or for
// injecting custom elements that the component loop will then process.
import { getRandomQuote, escapeHtml } from "./utils/api-service";

const stamp = document.getElementById("build-stamp");
if (stamp) {
  stamp.setAttribute("content", new Date().toISOString());
}

const titleElement = document.querySelector("title");
if (titleElement) {
  const quote = await getRandomQuote();
  titleElement.textContent = `tkeron — ${escapeHtml(quote.author)}`;
}
