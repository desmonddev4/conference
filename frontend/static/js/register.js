document.getElementById("registration-form").addEventListener("submit", async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector("button[type=submit]");
  const message = document.getElementById("form-message");
  message.textContent = ""; message.className = ""; button.disabled = true; button.textContent = "Saving registration…";
  const phone = document.getElementById("phone").value.trim();
  const fullPhone = phone.startsWith("+") ? phone : `+233${phone.replace(/^0/, "")}`;
  try {
    const result = await GatherAPI.request("/api/attendees/", { method: "POST", body: { name: document.getElementById("name").value.trim(), phone_number: fullPhone, payment_method: form.querySelector("input[name=payment_method]:checked")?.value } });
    message.textContent = `${result.attendee.name} registered successfully.`; message.className = "success-message";
    form.reset();
    setTimeout(() => { location.href = "/attendees/"; }, 900);
  } catch (error) { message.textContent = error.message; message.className = "error-message"; button.disabled = false; button.innerHTML = 'Complete registration <span>→</span>'; }
});
