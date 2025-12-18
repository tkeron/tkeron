// Use TypeScript logic to generate content
const items = ["TypeScript", "HTML", "CSS", "JavaScript"];

const listItems = items
  .map((item, index) => `<li><strong>${index + 1}.</strong> ${item}</li>`)
  .join("\n    ");

com.innerHTML = `
  <div style="margin: 20px 0;">
    <h2>Technologies:</h2>
    <ul style="list-style: none; padding: 0;">
      ${listItems}
    </ul>
  </div>
`;
