document.getElementById("login-form").addEventListener("submit", async event => {
  event.preventDefault();
  const button = event.currentTarget.querySelector("button");
  const error = document.getElementById("form-error");
  error.textContent = "";
  button.disabled = true;
  button.innerHTML = "Signing in...";
  try {
    const user = await GatherAPI.request("/api/auth/login/", { method: "POST", body: { username: document.getElementById("username").value.trim(), password: document.getElementById("password").value } });
    location.href = user.is_admin ? "/admin/dashboard/" : "/";
  } catch (err) { error.textContent = err.message; button.disabled = false; button.innerHTML = "Sign in <span>&rarr;</span>"; }
});
