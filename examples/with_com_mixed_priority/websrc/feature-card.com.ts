const title = com.getAttribute("title") || "Default Feature";

com.innerHTML = `
  <div style="border: 2px solid #3498db; padding: 1.5rem; margin: 1rem 0; border-radius: 8px;">
    <h3>✨ ${title} (Root TS Component)</h3>
    <p>This is a dynamic TypeScript component from root</p>
    <ul>
      <li>Reads attributes</li>
      <li>Generates dynamic content</li>
      <li>Can use TypeScript logic</li>
    </ul>
  </div>
`;
