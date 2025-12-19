// This .com.ts should take priority over .com.html in the same directory
com.innerHTML = `
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; border-radius: 12px; text-align: center;">
    <h3>✅ TypeScript Component Wins!</h3>
    <p style="font-size: 1.125rem; margin: 1rem 0;">This proves .com.ts has priority over .com.html</p>
    <p style="font-size: 0.875rem; opacity: 0.9;">Both files exist in the same directory, but .com.ts is used</p>
  </div>
`;
