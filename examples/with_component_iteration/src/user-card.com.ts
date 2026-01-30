// ITERATION 2: This .com.ts reads attributes and creates structure with nested components
// It passes data to child components that will be processed in iteration 3

const name = com.getAttribute("name") || "Unknown User";
const role = com.getAttribute("role") || "user";
const engagement = com.getAttribute("engagement") || "0";
const status = com.getAttribute("status") || "away";
const hoursAgo = com.getAttribute("hours-ago") || "0";

// TypeScript logic: format role display
const roleLabels = {
  admin: "👑 Admin",
  moderator: "🛡️ Moderator",
  user: "👤 User",
};

const roleDisplay = roleLabels[role] || roleLabels["user"];

com.innerHTML = `
  <div style="border: 2px solid #3498db; border-radius: 8px; padding: 1rem; background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
      <status-badge status="${status}" hours-ago="${hoursAgo}"></status-badge>
      <div style="flex: 1;">
        <h3 style="margin: 0; font-size: 1.1rem; color: #2c3e50;">${name}</h3>
        <div style="font-size: 0.85rem; color: #7f8c8d;">${roleDisplay}</div>
      </div>
    </div>
    <engagement-meter engagement="${engagement}"></engagement-meter>
    <div style="margin-top: 0.5rem; font-size: 0.75rem; color: #95a5a6;">
      🔄 Iteration 2: user-card.com.ts passes data to nested components
    </div>
  </div>
`;
