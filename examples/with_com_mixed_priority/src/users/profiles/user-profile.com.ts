const user = {
  name: "Jane Doe",
  email: "jane@example.com",
  role: "Administrator",
  joined: "January 2024",
  avatar: "👩‍💼",
};

com.innerHTML = `
  <div style="border: 3px solid #11998e; padding: 1.5rem; margin: 1rem 0; border-radius: 12px;">
    <div style="display: flex; align-items: center; gap: 1rem;">
      <div style="font-size: 4rem;">${user.avatar}</div>
      <div>
        <h3 style="margin: 0;">${user.name}</h3>
        <p style="margin: 0.25rem 0; color: #666;">${user.email}</p>
        <p style="margin: 0.25rem 0; font-size: 0.875rem;">
          <strong>${user.role}</strong> • Joined ${user.joined}
        </p>
      </div>
    </div>
    <profile-actions></profile-actions>
  </div>
`;
