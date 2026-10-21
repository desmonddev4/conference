let lastRecentSignature = "";

async function refreshDashboard(background = false) {
  const summary = await GatherAPI.request("/api/overview/", { background });
  document.getElementById("total-revenue").textContent = GatherAPI.money(summary.total_revenue);
  document.getElementById("total-attendees").textContent = summary.total_attendees.toLocaleString();
  document.getElementById("today-attendees").textContent = summary.today_attendees.toLocaleString();
  const signature = JSON.stringify(summary.recent_attendees);
  if (signature === lastRecentSignature) return;
  lastRecentSignature = signature;
  const list = document.getElementById("recent-list");
  if (!summary.recent_attendees.length) {
    list.innerHTML = '<div class="dashboard-empty"><span>✳</span><strong>Your first registration is one click away.</strong><a class="text-link" href="/register/">Register an attendee →</a></div>';
    return;
  }
  list.innerHTML = summary.recent_attendees.map((person, index) => `<div class="recent-row"><div class="attendee-avatar avatar-tone-${index % 4}">${GatherAPI.initials(person.name)}</div><div class="recent-name"><strong>${escapeHTML(person.name)}</strong><span>${escapeHTML(person.phone_number)}</span></div><span class="payment-badge ${person.payment_method}">${person.payment_method === "momo" ? "◉" : "₵"} &nbsp;${person.payment_method_display}</span><strong class="recent-amount">${GatherAPI.money(person.amount_paid, 2)}</strong><span class="recent-date">${GatherAPI.date(person.registered_at)}</span></div>`).join("");
}

(async function loadDashboard() {
  let authorized = false;
  try {
    const user = await GatherAPI.request("/api/auth/me/");
    if (user.is_admin) { location.replace("/admin/dashboard/"); return; }
    authorized = true;
    document.getElementById("welcome-name").textContent = user.display_name.split(" ")[0];
    await refreshDashboard();
  } catch (error) {
    document.getElementById("recent-list").innerHTML = `<div class="loading">${escapeHTML(error.message)}</div>`;
  } finally {
    if (authorized) window.NSTRefresh.every(() => refreshDashboard(true));
  }
})();

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}
