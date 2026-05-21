const label = com.getAttribute("label") || "tag";
const span = com.querySelector(".tag-chip");
if (span) span.textContent = label;
