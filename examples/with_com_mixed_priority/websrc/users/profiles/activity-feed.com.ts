const activities = [
  { action: "Updated profile", time: "2 hours ago", icon: "✏️" },
  { action: "Posted a comment", time: "5 hours ago", icon: "💬" },
  { action: "Uploaded a file", time: "1 day ago", icon: "📁" },
  { action: "Joined the platform", time: "2 weeks ago", icon: "🎉" },
];

const items = activities
  .map(
    (act) => `
  <div style="padding: 1rem; border-bottom: 1px solid #ecf0f1; display: flex; align-items: center; gap: 1rem;">
    <div style="font-size: 1.5rem;">${act.icon}</div>
    <div style="flex: 1;">
      <strong>${act.action}</strong>
      <div style="font-size: 0.875rem; color: #666;">${act.time}</div>
    </div>
  </div>
`,
  )
  .join("");

com.innerHTML = `
  <div style="border: 2px solid #9b59b6; padding: 1rem; margin: 1rem 0; border-radius: 8px;">
    <h4>📋 Recent Activity (Local TS Component)</h4>
    <div style="margin-top: 1rem;">
      ${items}
    </div>
  </div>
`;
