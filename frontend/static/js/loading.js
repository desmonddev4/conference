(function installNstLoader() {
  const overlay = document.getElementById("global-loader");
  if (!overlay) return;

  let pendingRequests = 0;
  let pageLoaded = document.readyState === "complete";
  let showTimer = null;
  let hideTimer = null;
  let visibleSince = 0;
  const showDelay = 260;
  const minimumVisibleTime = 500;

  function show() {
    clearTimeout(hideTimer);
    if (overlay.classList.contains("is-active")) return;
    overlay.classList.add("is-active");
    overlay.setAttribute("aria-hidden", "false");
    visibleSince = Date.now();
  }

  function maybeHide() {
    if (!pageLoaded || pendingRequests > 0) return;
    clearTimeout(showTimer);
    const wait = overlay.classList.contains("is-active")
      ? Math.max(0, minimumVisibleTime - (Date.now() - visibleSince))
      : 0;
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      if (!pageLoaded || pendingRequests > 0) return;
      overlay.classList.remove("is-active");
      overlay.setAttribute("aria-hidden", "true");
    }, wait);
  }

  function scheduleShow(delay = showDelay) {
    clearTimeout(showTimer);
    if (!overlay.classList.contains("is-active")) showTimer = setTimeout(show, delay);
  }

  function beginRequest() {
    pendingRequests += 1;
    clearTimeout(hideTimer);
    scheduleShow();
    let finished = false;
    return function finishRequest() {
      if (finished) return;
      finished = true;
      pendingRequests = Math.max(0, pendingRequests - 1);
      maybeHide();
    };
  }

  window.NSTLoader = { beginRequest };

  if (!pageLoaded) {
    scheduleShow();
    window.addEventListener("load", () => {
      pageLoaded = true;
      maybeHide();
    }, { once: true });
  } else {
    maybeHide();
  }

  document.addEventListener("click", event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest("a[href]");
    if (!link || link.target || link.hasAttribute("download")) return;
    const destination = new URL(link.href, location.href);
    if (destination.origin !== location.origin || destination.pathname === location.pathname && destination.search === location.search) return;
    scheduleShow(180);
  });

  window.addEventListener("pageshow", event => {
    if (!event.persisted) return;
    pendingRequests = 0;
    pageLoaded = true;
    overlay.classList.remove("is-active");
    overlay.setAttribute("aria-hidden", "true");
  });
})();
