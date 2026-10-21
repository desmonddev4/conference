// Local development connects directly to Django. Vercel proxies /api/* to Render,
// so production uses same-origin requests and session cookies work reliably.
const isLocalNST = ["localhost", "127.0.0.1"].includes(window.location.hostname);
window.GATHER_API_URL = isLocalNST ? "http://localhost:8000" : "";
