// Access component attributes
const name = com.getAttribute("data-name") || "Unknown";
const role = com.getAttribute("data-role") || "N/A";
const age = com.getAttribute("data-age") || "N/A";

// Generate HTML dynamically
com.innerHTML = `
  <div style="border: 2px solid #333; border-radius: 8px; padding: 16px; margin: 16px 0; max-width: 300px;">
    <h3 style="margin-top: 0; color: #2563eb;">${name}</h3>
    <p><strong>Role:</strong> ${role}</p>
    <p><strong>Age:</strong> ${age}</p>
  </div>
`;
