// Pre-rendering - runs at build time
const buildTimeElement = document.getElementById('build-time');

if (buildTimeElement) {
  const now = new Date();
  buildTimeElement.innerHTML = `<strong>${now.toLocaleString()}</strong>`;
}


