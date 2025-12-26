// Pre-rendering - runs at build time
// Demonstrates importing any TypeScript module for pre-rendering
import { getRandomQuote, getBuildMetadata, getCryptoPrices } from './api-service';

const buildTimeElement = document.getElementById('build-time');

if (buildTimeElement) {
  const now = new Date();
  buildTimeElement.innerHTML = `<strong>${now.toLocaleString()}</strong>`;
}

// Fetch data from external API at build time
const quoteElement = document.getElementById('pre-rendered-quote');
if (quoteElement) {
  const quote = await getRandomQuote();
  quoteElement.innerHTML = `
    <blockquote class="quote">
      <p>"${quote.quote}"</p>
      <footer>— ${quote.author}</footer>
    </blockquote>
  `;
}

// Add build metadata
const metadataElement = document.getElementById('build-metadata');
if (metadataElement) {
  const metadata = await getBuildMetadata();
  metadataElement.innerHTML = `
    <div class="metadata">
      <small>
        Built: ${metadata.timestamp} | 
        tkeron: ${metadata.tkeron} | 
        Runtime: ${metadata.runtime} | 
        Platform: ${metadata.platform}
      </small>
    </div>
  `;
}

// Fetch crypto prices at build time
const cryptoPricesElement = document.getElementById('crypto-prices');
if (cryptoPricesElement) {
  const prices = await getCryptoPrices();
  
  const pricesHtml = prices.map(crypto => {
    const changeColor = crypto.price_change_percentage_24h >= 0 ? '#10b981' : '#ef4444';
    const changeSymbol = crypto.price_change_percentage_24h >= 0 ? '▲' : '▼';
    
    return `
      <div class="crypto-card">
        <div class="crypto-header">
          <span class="crypto-name">${crypto.name}</span>
          <span class="crypto-symbol">${crypto.symbol.toUpperCase()}</span>
        </div>
        <div class="crypto-price">$${crypto.current_price.toLocaleString()}</div>
        <div class="crypto-change" style="color: ${changeColor}">
          ${changeSymbol} ${Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
        </div>
      </div>
    `;
  }).join('');
  
  cryptoPricesElement.innerHTML = pricesHtml;
}


