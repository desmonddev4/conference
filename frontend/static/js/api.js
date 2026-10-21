const GatherAPI = (() => {
  const apiBase = (window.GATHER_API_URL || "").replace(/\/$/, "");
  let csrfToken = "";
  const apiUrl = path => `${apiBase}${path}`;
  const ensureCsrf = async () => {
    if (!csrfToken) {
      const response = await fetch(apiUrl("/api/auth/csrf/"), { credentials: "include" });
      const data = await response.json();
      csrfToken = data.csrfToken;
    }
    return csrfToken;
  };
  async function request(url, options = {}) {
    const { background = false, ...fetchOptions } = options;
    const finishLoading = !background && window.NSTLoader ? window.NSTLoader.beginRequest() : () => {};
    try {
      const method = (fetchOptions.method || "GET").toUpperCase();
      const headers = { ...(fetchOptions.headers || {}) };
      if (fetchOptions.body && typeof fetchOptions.body !== "string") {
        headers["Content-Type"] = "application/json";
        fetchOptions.body = JSON.stringify(fetchOptions.body);
      }
      if (!["GET", "HEAD", "OPTIONS"].includes(method)) headers["X-CSRFToken"] = await ensureCsrf();
      const response = await fetch(apiUrl(url), { ...fetchOptions, method, headers, credentials: "include", cache: fetchOptions.cache || "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 401 && !location.pathname.startsWith("/login")) location.href = "/login/";
        throw new Error(data.error || "Something went wrong. Please try again.");
      }
      return data;
    } finally {
      finishLoading();
    }
  }
  const money = (amount, decimals = 0) => `GH\u20B5 ${Number(amount || 0).toLocaleString("en-GH", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
  const initials = name => (name || "?").split(/[\s.@_-]+/).filter(Boolean).slice(0, 2).map(part => part[0].toUpperCase()).join("");
  const date = value => new Intl.DateTimeFormat("en-GH", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
  return { request, money, initials, date };
})();

window.NSTRefresh = {
  every(callback, interval = 15000) {
    let active = true;
    let inFlight = false;
    const refresh = async () => {
      if (!active || inFlight || document.visibilityState !== "visible") return;
      inFlight = true;
      try { await callback(); } catch (_) { /* Keep the current view if a background refresh fails. */ }
      finally { inFlight = false; }
    };
    const onVisibilityChange = () => { if (document.visibilityState === "visible") refresh(); };
    const timer = setInterval(refresh, interval);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      active = false;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  },
};
