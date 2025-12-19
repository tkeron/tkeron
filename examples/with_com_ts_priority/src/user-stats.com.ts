const stats = {
  total: 1000,
  active: 750,
  pending: 250
};

com.innerHTML = `
  <div style="background: #3498db; color: white; padding: 1rem; border-radius: 8px;">
    <h3>User Statistics (Root)</h3>
    <p>Total: ${stats.total}</p>
    <p>Active: ${stats.active}</p>
    <p>Pending: ${stats.pending}</p>
  </div>
`;
