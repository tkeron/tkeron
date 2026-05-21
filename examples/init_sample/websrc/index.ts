// Client-side TypeScript — only fills data into already existing nodes.
let clickCount = 0;

const button = document.getElementById("increment");
const countDisplay = document.getElementById("count");

if (button && countDisplay) {
  button.addEventListener("click", () => {
    clickCount++;
    countDisplay.textContent = clickCount.toString();
  });
}
