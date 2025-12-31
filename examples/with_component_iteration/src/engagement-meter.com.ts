// ITERATION 3: This .com.ts processes <engagement-meter> and performs CALCULATIONS
// Real TypeScript processing: percentage calculations, conditional rendering

const engagement = parseInt(com.getAttribute('engagement') || '0');

// TypeScript calculations and logic
const percentage = Math.min(100, Math.max(0, engagement));
const level = percentage >= 75 ? 'high' : percentage >= 40 ? 'medium' : 'low';

// Conditional color based on calculated level
const colors = {
  high: { bar: '#27ae60', bg: '#d5f4e6', text: '#27ae60' },
  medium: { bar: '#f39c12', bg: '#fef5e7', text: '#f39c12' },
  low: { bar: '#e74c3c', bg: '#fadbd8', text: '#e74c3c' }
};

const color = colors[level];

// TypeScript string manipulation and template generation
const label = level === 'high' ? '🔥 Active' : level === 'medium' ? '📊 Moderate' : '💤 Low';

com.innerHTML = `
  <div style="margin: 0.5rem 0;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
      <span style="font-size: 0.75rem; font-weight: 600; color: ${color.text};">${label}</span>
      <span style="font-size: 0.75rem; color: #7f8c8d;">${percentage}%</span>
    </div>
    <div style="width: 100%; height: 6px; background: ${color.bg}; border-radius: 3px; overflow: hidden;">
      <div style="width: ${percentage}%; height: 100%; background: ${color.bar}; transition: width 0.3s;"></div>
    </div>
  </div>
`;
