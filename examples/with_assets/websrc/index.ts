// Simple click counter
let clickCount = 0;

const button = document.querySelector("button") as HTMLButtonElement;
const heading = document.querySelector("h1") as HTMLHeadingElement;

button.addEventListener("click", () => {
  clickCount++;
  heading.textContent = `Clicks: ${clickCount}`;
});
