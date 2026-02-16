// TypeScript component - runs at build time with logic
const count = com.getAttribute("count") || "3";
const numCount = parseInt(count, 10);

// Generate list dynamically
const items = [];
for (let i = 1; i <= numCount; i++) {
  items.push(`<li>✓ Item ${i}</li>`);
}

com.innerHTML = `
  <div style="background: #f0fdf4; border-left: 3px solid #22c55e; padding: 0.75rem; border-radius: 4px;">
    <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.9rem; color: #166534;">
      ${items.join("")}
    </ul>
  </div>
`;
