const title = com.getAttribute("data-title") || "Info";
const rawItems = com.getAttribute("data-items") || "";
const items = rawItems
  .split(",")
  .map((s: string) => s.trim())
  .filter((s: string) => s.length > 0);

const titleEl = com.querySelector(".title");
if (titleEl) titleEl.textContent = title;

const itemsEl = com.querySelector(".items");
if (itemsEl) {
  itemsEl.innerHTML = items.map((item: string) => `<li>${item}</li>`).join("");
}
