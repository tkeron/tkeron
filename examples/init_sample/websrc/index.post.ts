// Post-render — runs at build time, AFTER components are resolved.
// Perfect for filling nodes that live inside components, plus final DOM
// rewrites such as rel="noopener" hardening.
import {
  getRandomQuote,
  getBuildMetadata,
  getCryptoPrices,
  escapeHtml,
} from "./utils/api-service";

const externalLinks = document.querySelectorAll('a[target="_blank"]');
externalLinks.forEach((link) => {
  link.setAttribute("rel", "noopener noreferrer");
});

const buildTimeElement = document.getElementById("build-time");
if (buildTimeElement) {
  buildTimeElement.innerHTML = `<strong>${escapeHtml(new Date().toLocaleString())}</strong>`;
}

const [quote, metadata, prices] = await Promise.all([
  getRandomQuote(),
  Promise.resolve(getBuildMetadata()),
  getCryptoPrices(),
]);

const quoteElement = document.getElementById("pre-rendered-quote");
if (quoteElement) {
  quoteElement.innerHTML = `
    <blockquote>
      <p>"${escapeHtml(quote.quote)}"</p>
      <footer>— ${escapeHtml(quote.author)}</footer>
    </blockquote>
  `;
}

const metadataElement = document.getElementById("build-metadata");
if (metadataElement) {
  metadataElement.innerHTML = `
    <small>
      Built: ${escapeHtml(metadata.timestamp)} |
      tkeron: ${escapeHtml(metadata.tkeron)} |
      Runtime: ${escapeHtml(metadata.runtime)} |
      Platform: ${escapeHtml(metadata.platform)}
    </small>
  `;
}

const cryptoPricesElement = document.getElementById("crypto-prices");
if (cryptoPricesElement) {
  cryptoPricesElement.innerHTML = prices
    .map((crypto) => {
      const positive = crypto.price_change_percentage_24h >= 0;
      const changeColor = positive ? "#10b981" : "#ef4444";
      const changeSymbol = positive ? "▲" : "▼";
      return `
        <div class="crypto-card">
          <div class="crypto-header">
            <span class="crypto-name">${escapeHtml(crypto.name)}</span>
            <span class="crypto-symbol">${escapeHtml(crypto.symbol.toUpperCase())}</span>
          </div>
          <div class="crypto-price">$${crypto.current_price.toLocaleString()}</div>
          <div class="crypto-change" style="color: ${changeColor}">
            ${changeSymbol} ${Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
          </div>
        </div>
      `;
    })
    .join("");
}
