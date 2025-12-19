const regions = ["North", "South", "East", "West"];
const totalSales = 176000;
const avgPerRegion = totalSales / regions.length;

const regionCards = regions.map(region => 
  `<div style="background: #f8f9fa; padding: 0.75rem; border-radius: 4px; text-align: center;">
    <strong>${region}</strong>
    <div style="font-size: 0.875rem; color: #666; margin-top: 0.25rem;">
      ~$${avgPerRegion.toLocaleString()}
    </div>
  </div>`
).join('');

com.innerHTML = `
  <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 1.5rem; border-radius: 12px; margin: 1rem 0;">
    <h4>💰 Sales Summary</h4>
    <p style="margin: 0.5rem 0;">Total Regional Sales: $${totalSales.toLocaleString()}</p>
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; margin-top: 1rem;">
      ${regionCards}
    </div>
  </div>
`;
