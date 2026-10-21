let lastRecentSignature = "";

async function refreshAdminDashboard(background = false) {
  const [summary, revenue, team] = await Promise.all([
    GatherAPI.request("/api/overview/", { background }),
    GatherAPI.request("/api/revenue/", { background }),
    GatherAPI.request("/api/team/", { background }),
  ]);
  document.getElementById("admin-revenue").textContent = GatherAPI.money(summary.total_revenue, 2);
  document.getElementById("admin-attendees").textContent = summary.total_attendees.toLocaleString();
  document.getElementById("admin-today").textContent = summary.today_attendees.toLocaleString();
  document.getElementById("admin-team-count").textContent = team.users.length.toLocaleString();
  for (const method of ["momo", "cash"]) {
    const values = revenue.by_payment_method[method] || { count: 0, amount: "0.00" };
    document.getElementById(`admin-${method}-count`).textContent = `${values.count} payment${values.count === 1 ? "" : "s"}`;
    document.getElementById(`admin-${method}-total`).textContent = GatherAPI.money(values.amount, 2);
    document.getElementById(`admin-${method}-bar`).style.width = Number(summary.total_revenue) ? `${Number(values.amount) / Number(summary.total_revenue) * 100}%` : "0%";
  }
  const signature = JSON.stringify(summary.recent_attendees);
  if (signature === lastRecentSignature) return;
  lastRecentSignature = signature;
  const recent = document.getElementById("admin-recent-list");
  if (!summary.recent_attendees.length) {
    recent.innerHTML = '<div class="admin-empty">No registrations yet. <a class="text-link" href="/register/">Add the first attendee →</a></div>';
  } else {
    recent.innerHTML = summary.recent_attendees.map((person, index) => `<div class="admin-person"><span class="attendee-avatar avatar-tone-${index % 4}">${GatherAPI.initials(person.name)}</span><span class="admin-person-copy"><strong>${escapeHTML(person.name)}</strong><small>${escapeHTML(person.phone_number)}</small></span><span class="payment-badge ${person.payment_method}">${escapeHTML(person.payment_method_display)}</span><strong class="admin-person-amount">${GatherAPI.money(person.amount_paid, 2)}</strong></div>`).join("");
  }
}

(async function loadAdminDashboard() {
  let authorized = false;
  try {
    const user = await GatherAPI.request("/api/auth/me/");
    if (!user.is_admin) { location.replace("/"); return; }
    authorized = true;
    await refreshAdminDashboard();
  } catch (_) { /* Shared navigation handles expired sessions. */ }
  finally {
    if (authorized) window.NSTRefresh.every(() => refreshAdminDashboard(true));
  }
})();

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}
