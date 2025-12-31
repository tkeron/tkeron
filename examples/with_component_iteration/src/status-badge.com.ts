// ITERATION 3: This .com.ts processes <status-badge> and applies LOGIC based on status
// Real TypeScript processing: conditional styling, calculations

const status = com.getAttribute('status') || 'away';
const hoursAgo = parseInt(com.getAttribute('hours-ago') || '0');

// TypeScript logic: determine colors and icons based on status
const statusConfig = {
  online: { color: '#27ae60', bg: '#d5f4e6', icon: '🟢', text: 'Online' },
  recent: { color: '#f39c12', bg: '#fef5e7', icon: '🟡', text: `${hoursAgo}h ago` },
  away: { color: '#95a5a6', bg: '#ecf0f1', icon: '⚪', text: 'Away' }
};

const config = statusConfig[status] || statusConfig.away;

// Calculate urgency level (this is TypeScript processing)
const urgencyLevel = status === 'online' ? 'high' : status === 'recent' ? 'medium' : 'low';

com.innerHTML = `
  <div style="display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.25rem 0.5rem; background: ${config.bg}; border-radius: 12px; font-size: 0.75rem; font-weight: 600; color: ${config.color};" data-urgency="${urgencyLevel}">
    <span>${config.icon}</span>
    <span>${config.text}</span>
  </div>
`;
