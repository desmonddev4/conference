let attendees = [];
let editingAttendeeId = null;
let attendeeSignature = "";

const attendeeRows = document.getElementById("attendee-rows");
const editDialog = document.getElementById("attendee-edit-dialog");
const editForm = document.getElementById("attendee-edit-form");

async function loadAttendees(background = false) {
  if (background && editDialog.open) return;
  try {
    const data = await GatherAPI.request("/api/attendees/", { background });
    const signature = JSON.stringify(data.attendees);
    if (signature === attendeeSignature) return;
    attendeeSignature = signature;
    attendees = data.attendees;
    renderAttendees();
  } catch (error) {
    if (!background) attendeeRows.innerHTML = `<tr><td colspan="7" class="loading">${escapeHTML(error.message)}</td></tr>`;
  }
}

function renderAttendees() {
  const query = document.getElementById("attendee-search").value.trim().toLowerCase();
  const items = attendees.filter(item => item.name.toLowerCase().includes(query) || item.phone_number.toLowerCase().includes(query));
  document.getElementById("attendee-count").textContent = items.length;
  document.getElementById("table-summary").textContent = `Showing ${items.length} of ${attendees.length} attendee${attendees.length === 1 ? "" : "s"}`;
  attendeeRows.innerHTML = items.map((item, index) => `
    <tr>
      <td><div class="table-person"><span class="attendee-avatar avatar-tone-${index % 4}">${GatherAPI.initials(item.name)}</span><div><strong>${escapeHTML(item.name)}</strong><small>#${String(item.id).padStart(4, "0")}</small></div></div></td>
      <td class="phone-cell">${escapeHTML(item.phone_number)}</td>
      <td><span class="payment-badge ${item.payment_method}">${item.payment_method_display}</span></td>
      <td class="paid-cell">${GatherAPI.money(item.amount_paid, 2)}</td>
      <td class="registered-cell">${escapeHTML(item.registered_by)}</td>
      <td class="date-cell">${GatherAPI.date(item.registered_at)}</td>
      <td class="attendee-actions"><button type="button" class="row-action edit-action" data-action="edit" data-id="${item.id}">Edit</button><button type="button" class="row-action delete-action" data-action="delete" data-id="${item.id}">Delete</button></td>
    </tr>`).join("");
  document.getElementById("empty-state").hidden = items.length > 0;
  document.querySelector(".table-wrap").hidden = items.length === 0;
}

function openEditDialog(attendee) {
  editingAttendeeId = attendee.id;
  document.getElementById("edit-name").value = attendee.name;
  document.getElementById("edit-phone").value = attendee.phone_number;
  document.getElementById("edit-payment").value = attendee.payment_method;
  document.getElementById("edit-message").textContent = "";
  editDialog.showModal();
}

attendeeRows.addEventListener("click", async event => {
  const actionButton = event.target.closest("[data-action]");
  if (!actionButton) return;
  const attendee = attendees.find(item => item.id === Number(actionButton.dataset.id));
  if (!attendee) return;

  if (actionButton.dataset.action === "edit") {
    openEditDialog(attendee);
    return;
  }

  const confirmed = window.confirm(`Delete the registration for ${attendee.name}? The record will be removed and this action will be saved in the admin activity logs.`);
  if (!confirmed) return;
  actionButton.disabled = true;
  try {
    await GatherAPI.request(`/api/attendees/${attendee.id}/`, { method: "DELETE" });
    attendees = attendees.filter(item => item.id !== attendee.id);
    attendeeSignature = JSON.stringify(attendees);
    renderAttendees();
    showFeedback(`Registration for ${attendee.name} deleted. The admin activity log was updated.`, "success");
  } catch (error) {
    actionButton.disabled = false;
    showFeedback(error.message, "error");
  }
});

editForm.addEventListener("submit", async event => {
  event.preventDefault();
  const button = document.getElementById("save-attendee");
  const message = document.getElementById("edit-message");
  const attendee = attendees.find(item => item.id === editingAttendeeId);
  if (!attendee) return;
  button.disabled = true;
  button.textContent = "Saving...";
  message.textContent = "";
  try {
    const result = await GatherAPI.request(`/api/attendees/${attendee.id}/`, {
      method: "PATCH",
      body: {
        name: document.getElementById("edit-name").value.trim(),
        phone_number: document.getElementById("edit-phone").value.trim(),
        payment_method: document.getElementById("edit-payment").value,
      },
    });
    attendees = attendees.map(item => item.id === attendee.id ? result.attendee : item);
    attendeeSignature = JSON.stringify(attendees);
    renderAttendees();
    editDialog.close();
    showFeedback(result.changed ? "Attendee details updated and recorded in the admin activity log." : "No changes were made.", "success");
  } catch (error) {
    message.textContent = error.message;
  } finally {
    button.disabled = false;
    button.textContent = "Save changes";
  }
});

document.querySelectorAll("[data-close-dialog]").forEach(button => button.addEventListener("click", () => editDialog.close()));
document.getElementById("attendee-search").addEventListener("input", renderAttendees);

function showFeedback(message, kind) {
  const feedback = document.getElementById("attendee-feedback");
  feedback.textContent = message;
  feedback.className = `attendee-feedback ${kind}`;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

loadAttendees().then(() => window.NSTRefresh.every(() => loadAttendees(true)));
