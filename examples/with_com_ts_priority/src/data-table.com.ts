const data = [
  { id: 1, name: "Item A", value: 100 },
  { id: 2, name: "Item B", value: 200 },
  { id: 3, name: "Item C", value: 300 }
];

const rows = data.map(item => 
  `<tr><td>${item.id}</td><td>${item.name}</td><td>${item.value}</td></tr>`
).join('');

com.innerHTML = `
  <div style="border: 2px solid #3498db; padding: 1rem; margin: 1rem 0;">
    <h4>Data Table (Root)</h4>
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="background: #ecf0f1;">
          <th style="padding: 0.5rem; border: 1px solid #bdc3c7;">ID</th>
          <th style="padding: 0.5rem; border: 1px solid #bdc3c7;">Name</th>
          <th style="padding: 0.5rem; border: 1px solid #bdc3c7;">Value</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>
`;
