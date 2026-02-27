const name = com.getAttribute("data-name") || "Unknown";
const role = com.getAttribute("data-role") || "N/A";

const nameEl = com.querySelector(".name");
const roleEl = com.querySelector(".role");

if (nameEl) nameEl.textContent = name;
if (roleEl) roleEl.textContent = `Role: ${role}`;
