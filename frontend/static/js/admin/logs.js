let currentPage = 1;
let searchTimer = null;
let lastLogSignature = "";

const logsRows = document.getElementById("logs-rows");

async function loadLogs(page = 1, background = false) {
  currentPage = page;
  if (!background) logsRows.innerHTML = '<tr><td colspan="5" class="logs-empty">Loading activity...</td></tr>';
  const params = new URLSearchParams({ page: String(page) });
  const query = document.getElementById("log-search").value.trim();
  const action = document.getElementById("log-action").value;
  if (query) params.set("q", query);
  if (action) params.set("action", action);

  try {
    const result = await GatherAPI.request(`/api/audit-logs/?${params}`, { background });
    document.getElementById("logs-total").textContent = result.total.toLocaleString("en-GH");
    document.getElementById("logs-page-summary").textContent = result.total
      ? `Showing ${(result.page - 1) * 50 + 1}–${Math.min(result.page * 50, result.total)} of ${result.total} actions`
      : "No activity matches these filters";
    document.getElementById("logs-previous").disabled = result.page <= 1;
    document.getElementById("logs-next").disabled = result.page >= result.pages;
    const signature = JSON.stringify(result.logs);
    if (signature !== lastLogSignature) {
      lastLogSignature = signature;
      logsRows.innerHTML = result.logs.length
        ? result.logs.map(renderLog).join("")
        : '<tr><td colspan="5" class="logs-empty">No registration activity has been recorded yet.</td></tr>';
    }
  } catch (error) {
    if (background) return;
    document.getElementById("logs-total").textContent = "—";
    document.getElementById("logs-page-summary").textContent = "Activity could not be loaded";
    document.getElementById("logs-previous").disabled = true;
    document.getElementById("logs-next").disabled = true;
    const text = error.message.toLowerCase().includes("administrator")
      ? "Administrator access is required to view activity logs."
      : error.message;
    logsRows.innerHTML = `<tr><td colspan="5" class="logs-empty">${escapeHTML(text)}</td></tr>`;
  }
}

function renderLog(log) {
  const attendeePhone = log.attendee_phone_number ? `<span>${escapeHTML(log.attendee_phone_number)}</span>` : "";
  const actorRole = log.actor_is_admin ? "Administrator" : "Front desk";
  const actionLabel = { created: "Created", updated: "Edited", deleted: "Deleted" }[log.action] || log.action_display;
  return `<tr>
    <td><span class="log-action ${escapeHTML(log.action)}">${escapeHTML(actionLabel)}</span></td>
    <td><div class="log-attendee"><strong>${escapeHTML(log.attendee_name)}</strong><span>${attendeePhone} · #${String(log.attendee_id).padStart(4, "0")}</span></div></td>
    <td><div class="log-details">${renderDetails(log)}</div></td>
    <td><div class="log-actor"><strong>${escapeHTML(log.actor_display_name || log.actor_username)}</strong><span>${actorRole} · @${escapeHTML(log.actor_username)}</span></div></td>
    <td class="log-time">${formatTimestamp(log.created_at)}</td>
  </tr>`;
}

function renderDetails(log) {
  if (log.action === "created") {
    return `<span>Registration recorded for <strong>${GatherAPI.money(log.attendee_amount_paid, 2)}</strong> via ${escapeHTML(paymentLabel(log.attendee_payment_method))}.</span>`;
  }
  if (log.action === "deleted") {
    return `<span>Registration removed. The audit record retains the <strong>${GatherAPI.money(log.attendee_amount_paid, 2)}</strong> payment and ${escapeHTML(paymentLabel(log.attendee_payment_method))} details.</span>`;
  }
  const changes = log.details?.changes || {};
  const labels = { name: "Name", phone_number: "Phone number", payment_method: "Payment method" };
  const lines = Object.entries(changes).map(([field, values]) => {
    const oldValue = field === "payment_method" ? paymentLabel(values.old) : values.old;
    const newValue = field === "payment_method" ? paymentLabel(values.new) : values.new;
    return `<span><strong>${labels[field] || escapeHTML(field)}:</strong> ${escapeHTML(oldValue)} <span aria-hidden="true">→</span> ${escapeHTML(newValue)}</span>`;
  });
  return lines.length ? lines.join("") : "<span>Attendee details updated.</span>";
}

function paymentLabel(method) {
  return method === "momo" ? "Mobile money" : method === "cash" ? "Cash" : "Unknown";
}

function formatTimestamp(value) {
  return new Intl.DateTimeFormat("en-GH", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

document.getElementById("log-search").addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => loadLogs(1), 220);
});
document.getElementById("log-action").addEventListener("change", () => loadLogs(1));
document.getElementById("logs-previous").addEventListener("click", () => loadLogs(currentPage - 1));
document.getElementById("logs-next").addEventListener("click", () => loadLogs(currentPage + 1));

loadLogs().then(() => window.NSTRefresh.every(() => loadLogs(currentPage, true)));
