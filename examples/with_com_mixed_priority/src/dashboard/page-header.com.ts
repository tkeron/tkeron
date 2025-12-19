// This .com.ts takes priority over the root .com.html
com.innerHTML = `
  <header style="background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%); color: white; padding: 2rem; text-align: center;">
    <h2>🚀 Dashboard Header (Local TS Override)</h2>
    <p>This TypeScript component overrides the root HTML component!</p>
    <p style="font-size: 0.875rem; opacity: 0.9;">Priority: .com.ts > .com.html</p>
  </header>
`;
