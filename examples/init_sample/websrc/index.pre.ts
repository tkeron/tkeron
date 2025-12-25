// Pre-rendering - runs at build time
// Demonstrates importing any TypeScript module for pre-rendering
import { getRandomQuote, getBuildMetadata } from './api-service';

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
        Built: ${new Date(metadata.timestamp).toLocaleString()} | 
        Node: ${metadata.nodeVersion} | 
        Platform: ${metadata.platform}
      </small>
    </div>
  `;
}


