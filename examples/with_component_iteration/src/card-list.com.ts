// ITERATION 1: This .com.ts fetches/processes data and generates dynamic content
// It simulates fetching user data and calculates statistics

const count = parseInt(com.getAttribute('count') || '5');

// Simulating data processing - real TS logic here
const users = [
  { name: 'Alice Johnson', role: 'admin', loginCount: 342, lastLogin: Date.now() - 2 * 60 * 60 * 1000 },
  { name: 'Bob Smith', role: 'user', loginCount: 128, lastLogin: Date.now() - 5 * 60 * 60 * 1000 },
  { name: 'Carol White', role: 'moderator', loginCount: 256, lastLogin: Date.now() - 1 * 60 * 60 * 1000 },
  { name: 'David Brown', role: 'user', loginCount: 89, lastLogin: Date.now() - 24 * 60 * 60 * 1000 },
  { name: 'Eve Davis', role: 'admin', loginCount: 512, lastLogin: Date.now() - 30 * 60 * 1000 }
];

// TypeScript processing: calculate engagement score
const processedUsers = users.slice(0, count).map(user => {
  const hoursAgo = Math.floor((Date.now() - user.lastLogin) / (1000 * 60 * 60));
  const engagementScore = Math.min(100, Math.floor((user.loginCount / 10) + (24 - Math.min(hoursAgo, 24)) * 2));
  
  return {
    ...user,
    hoursAgo,
    engagementScore,
    status: hoursAgo < 1 ? 'online' : hoursAgo < 24 ? 'recent' : 'away'
  };
});

// Generate <user-card> components with computed data
let html = '<div style="display: grid; gap: 1rem;">';

processedUsers.forEach(user => {
  // Each user-card will be processed by user-card.com.html (static template)
  html += `<user-card 
    name="${user.name}" 
    role="${user.role}" 
    engagement="${user.engagementScore}" 
    status="${user.status}"
    hours-ago="${user.hoursAgo}">
  </user-card>`;
});

html += '</div>';

com.innerHTML = html;
