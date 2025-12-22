// Client-side TypeScript - runs in the browser
let count = 0;

const button = document.getElementById('increment') as HTMLButtonElement;
const countDisplay = document.getElementById('count') as HTMLSpanElement;

button.addEventListener('click', () => {
  count++;
  countDisplay.textContent = count.toString();
});
