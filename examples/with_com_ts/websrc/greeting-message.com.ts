// Simple component with attribute access
const name = com.getAttribute("data-name") || "Friend";
const currentYear = new Date().getFullYear();

com.innerHTML = `
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
              color: white; 
              padding: 24px; 
              border-radius: 12px;
              margin: 20px 0;
              text-align: center;">
    <h2>Hello, ${name}!</h2>
    <p>Welcome to tkeron TypeScript components</p>
    <small>© ${currentYear}</small>
  </div>
`;
