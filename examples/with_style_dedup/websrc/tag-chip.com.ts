const label = com.getAttribute("label") || "tag";

com.innerHTML = `
  <style>
    .tag-chip {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 0.2rem 0.65rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 600;
      margin: 0.2rem;
      font-family: monospace;
      letter-spacing: 0.02em;
    }
  </style>
  <span class="tag-chip">${label}</span>
`;
