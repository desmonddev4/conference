async function loadTeam() {
  try {
    const result = await GatherAPI.request("/api/team/");
    document.getElementById("team-count").textContent = result.users.length;
    document.getElementById("team-list").innerHTML = result.users.map((user, index) => `<div class="team-member"><span class="attendee-avatar avatar-tone-${index % 4}">${GatherAPI.initials(user.display_name)}</span><span class="team-member-copy"><strong>${escapeHTML(user.display_name)}</strong><small>@${escapeHTML(user.username)}</small></span><span class="role-pill ${user.is_admin ? "admin-role" : "staff-role"}">${user.is_admin ? "Administrator" : "Staff"}</span></div>`).join("");
  } catch (error) {
    if (error.message.includes("administrator")) { document.querySelector(".team-layout").innerHTML = '<section class="section-card no-access"><strong>Administrator access required</strong><p>Ask the account administrator to manage team accounts.</p><a class="text-link" href="/">Back to overview →</a></section>'; }
    else document.getElementById("team-list").innerHTML = `<div class="loading">${error.message}</div>`;
  }
}

document.getElementById("team-form").addEventListener("submit", async event => {
  event.preventDefault();
  const button = event.currentTarget.querySelector("button");
  const message = document.getElementById("team-message");
  button.disabled = true; button.textContent = "Creating account…"; message.textContent = "";
  try {
    await GatherAPI.request("/api/team/", { method: "POST", body: {
      first_name: document.getElementById("first-name").value.trim(),
      last_name: document.getElementById("last-name").value.trim(),
      username: document.getElementById("username").value.trim(),
      password: document.getElementById("password").value,
    }});
    event.currentTarget.reset(); message.textContent = "Team account created."; message.className = "success-message"; loadTeam();
  } catch (error) { message.textContent = error.message; message.className = "error-message"; }
  button.disabled = false; button.innerHTML = 'Create account <span>→</span>';
});
function escapeHTML(value) { return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char])); }
loadTeam();
