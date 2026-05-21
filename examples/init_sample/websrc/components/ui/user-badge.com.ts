const count = com.getAttribute("count") || "3";
const numCount = parseInt(count, 10);

const items: string[] = [];
for (let i = 1; i <= numCount; i++) {
  items.push(`<li>✓ Item ${i}</li>`);
}

com.innerHTML = `
  <div class="user-badge">
    <ul>
      ${items.join("")}
    </ul>
  </div>
  <style>
    .user-badge {
      background: #f0fdf4;
      border-left: 3px solid #22c55e;
      padding: 0.75rem;
      border-radius: 4px;
    }
    .user-badge ul {
      list-style: none;
      padding: 0;
      margin: 0;
      font-size: 0.9rem;
      color: #166534;
    }
  </style>
`;
