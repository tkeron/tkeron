const stats = {
  users: 1523,
  revenue: 45230,
  growth: 23.5,
};

com.innerHTML = `
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1.5rem; border-radius: 12px; margin: 1rem 0;">
    <h3>📊 Dashboard Stats</h3>
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1rem;">
      <div style="text-align: center;">
        <div style="font-size: 2rem; font-weight: bold;">${stats.users}</div>
        <div style="font-size: 0.875rem; opacity: 0.9;">Total Users</div>
      </div>
      <div style="text-align: center;">
        <div style="font-size: 2rem; font-weight: bold;">$${stats.revenue.toLocaleString()}</div>
        <div style="font-size: 0.875rem; opacity: 0.9;">Revenue</div>
      </div>
      <div style="text-align: center;">
        <div style="font-size: 2rem; font-weight: bold;">${stats.growth}%</div>
        <div style="font-size: 0.875rem; opacity: 0.9;">Growth</div>
      </div>
    </div>
  </div>
`;
