const chartType = com.getAttribute("type") || "line";

const dataPoints = [
  { label: "Mon", value: 120 },
  { label: "Tue", value: 200 },
  { label: "Wed", value: 150 },
  { label: "Thu", value: 300 },
  { label: "Fri", value: 250 },
];

const bars = dataPoints
  .map((point) => {
    const height = (point.value / 300) * 100;
    return `
    <div style="display: flex; flex-direction: column; align-items: center;">
      <div style="height: 150px; display: flex; align-items: flex-end;">
        <div style="width: 40px; height: ${height}%; background: #667eea;"></div>
      </div>
      <div style="margin-top: 0.5rem; font-size: 0.875rem;">${point.label}</div>
      <div style="font-size: 0.75rem; color: #666;">${point.value}</div>
    </div>
  `;
  })
  .join("");

com.innerHTML = `
  <div style="border: 3px solid #667eea; padding: 1rem; margin: 1rem 0; border-radius: 8px;">
    <h4>Chart Widget (${chartType})</h4>
    <p style="color: #666; font-size: 0.875rem;">This component only exists in analytics directory</p>
    <div style="display: flex; justify-content: space-around; margin-top: 1rem;">
      ${bars}
    </div>
  </div>
`;
