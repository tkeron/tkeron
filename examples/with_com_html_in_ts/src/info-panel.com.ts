const title = com.getAttribute("data-title") || "Info";
const titleEl = com.querySelector(".title");
if (titleEl) titleEl.textContent = title;
