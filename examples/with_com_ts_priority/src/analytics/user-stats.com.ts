const stats = {
  total: 5000,
  active: 4200,
  premium: 800,
  growth: "+15%",
};

com.innerHTML = `
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <h3>📊 Analytics User Stats (Local Override)</h3>
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-top: 1rem;">
      <div>
        <strong>Total Users:</strong> ${stats.total}
      </div>
      <div>
        <strong>Active:</strong> ${stats.active}
      </div>
      <div>
        <strong>Premium:</strong> ${stats.premium}
      </div>
      <div>
        <strong>Growth:</strong> ${stats.growth}
      </div>
    </div>
  </div>
`;
