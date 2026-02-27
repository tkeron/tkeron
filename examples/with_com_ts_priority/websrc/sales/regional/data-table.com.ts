const regionalData = [
  { region: "North", sales: 45000, orders: 123 },
  { region: "South", sales: 38000, orders: 98 },
  { region: "East", sales: 52000, orders: 145 },
  { region: "West", sales: 41000, orders: 110 },
];

const rows = regionalData
  .map(
    (item) =>
      `<tr style="border-bottom: 1px solid #ecf0f1;">
    <td style="padding: 0.75rem;">${item.region}</td>
    <td style="padding: 0.75rem;">$${item.sales.toLocaleString()}</td>
    <td style="padding: 0.75rem;">${item.orders}</td>
  </tr>`,
  )
  .join("");

com.innerHTML = `
  <div style="border: 3px solid #e74c3c; padding: 1rem; margin: 1rem 0; border-radius: 8px;">
    <h4>🌍 Regional Data Table (Deep Local Override)</h4>
    <p style="color: #666; font-size: 0.875rem;">This component is from sales/regional/ directory</p>
    <table style="width: 100%; border-collapse: collapse; margin-top: 1rem;">
      <thead>
        <tr style="background: #e74c3c; color: white;">
          <th style="padding: 0.75rem; text-align: left;">Region</th>
          <th style="padding: 0.75rem; text-align: left;">Sales</th>
          <th style="padding: 0.75rem; text-align: left;">Orders</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>
`;
