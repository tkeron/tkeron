// Client-side TypeScript - runs in the browser
let clickCount = 0;

const button = document.getElementById("increment") as HTMLButtonElement;
const countDisplay = document.getElementById("count") as HTMLSpanElement;

button.addEventListener("click", () => {
  clickCount++;
  countDisplay.textContent = clickCount.toString();
});
