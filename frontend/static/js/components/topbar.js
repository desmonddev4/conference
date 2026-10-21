/* ==========================================================================
   NST Register · Top bar
   Renders the top bar and carries its own styles, so it looks right on
   every page without depending on base.css or glass.css.
   All rules are scoped under #topbar, which also makes them win over
   any older top bar rules left in other stylesheets.
   ========================================================================== */

/* --------------------------------------------------------------------------
   Embedded styles
   -------------------------------------------------------------------------- */
const TOPBAR_STYLE_ID = "topbar-styles";

const TOPBAR_CSS = `
/* Keep the header host sticky for the full height of the main page. */
#topbar {
  position: sticky;
  top: 0;
  z-index: 20;
}

/* Bar: frosted glass */
#topbar .topbar-inner {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 65px;
  padding: 0 53px;
  font-family: 'DM Sans', system-ui, sans-serif;
  background-color: rgba(242, 245, 255, 0.94);
  background-image: linear-gradient(90deg, rgba(77, 124, 255, 0.1), rgba(122, 77, 255, 0.06) 45%, rgba(25, 198, 235, 0.1));
  -webkit-backdrop-filter: blur(18px) saturate(160%);
          backdrop-filter: blur(18px) saturate(160%);
  border-bottom: 1px solid rgba(220, 227, 248, 0.9);
  box-shadow: 0 8px 30px rgba(31, 50, 140, 0.08);
}

/* Left: product name */
#topbar .topbar-date {
  display: flex;
  align-items: center;
  font-size: 12px;
  font-weight: 500;
  color: #5d6a86;
}

#topbar .topbar-spark {
  background: linear-gradient(135deg, #3f78f2, #19c6eb);
  -webkit-background-clip: text;
          background-clip: text;
  color: transparent;
  font-size: 14px;
}

/* Right: signed-in user as a glass chip */
#topbar .topbar-user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 5px 4px 14px;
  border: 1px solid rgba(255, 255, 255, 0.85);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.55);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9), 0 4px 14px rgba(31, 50, 140, 0.06);
  color: #3d4a6a;
  font-size: 11px;
  font-weight: 500;
  transition: background 0.25s cubic-bezier(0.2, 0.7, 0.2, 1), box-shadow 0.25s cubic-bezier(0.2, 0.7, 0.2, 1);
}

#topbar .topbar-user:hover {
  background: rgba(255, 255, 255, 0.82);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.95), 0 8px 20px rgba(52, 70, 210, 0.12);
}

/* Online status dot with a soft pulse */
#topbar .online-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #19c6eb;
  box-shadow: 0 0 0 0 rgba(25, 198, 235, 0.55);
  animation: topbar-pulse 2.4s ease-out infinite;
}

@keyframes topbar-pulse {
  0%   { box-shadow: 0 0 0 0 rgba(25, 198, 235, 0.55); }
  70%  { box-shadow: 0 0 0 7px rgba(25, 198, 235, 0); }
  100% { box-shadow: 0 0 0 0 rgba(25, 198, 235, 0); }
}

#topbar .topbar-divider {
  width: 1px;
  height: 17px;
  margin: 0 2px;
  background: rgba(31, 50, 140, 0.14);
}

#topbar .topbar-id {
  font-size: 10px;
  color: #76809b;
}

#topbar .avatar {
  display: grid;
  flex: none;
  place-items: center;
  width: 27px;
  height: 27px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3f78f2, #7a4dff);
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(63, 90, 230, 0.3);
}

/* Medium screens */
@media (max-width: 1050px) {
  #topbar .topbar-inner {
    padding: 0 30px;
  }
}

/* Phones: keep only the dot and the avatar in the chip */
@media (max-width: 720px) {
  #topbar .topbar-inner {
    height: 55px;
    padding: 0 17px;
  }

  #topbar .topbar-date {
    font-size: 11px;
  }

  #topbar .topbar-user {
    gap: 8px;
    padding-left: 10px;
  }

  #topbar .topbar-user > span:nth-child(2),
  #topbar .topbar-divider,
  #topbar .topbar-id {
    display: none;
  }
}

/* Fallback when backdrop-filter is not supported */
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  #topbar .topbar-inner {
    background-color: rgba(242, 245, 255, 0.98);
  }
}

@media (prefers-reduced-motion: reduce) {
  #topbar .online-dot {
    animation: none;
  }

  #topbar .topbar-user {
    transition: none;
  }
}
`;

// Adds the styles once, before the top bar content appears.
function injectTopbarStyles() {
  if (document.getElementById(TOPBAR_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = TOPBAR_STYLE_ID;
  style.textContent = TOPBAR_CSS;
  document.head.appendChild(style);
}


/* --------------------------------------------------------------------------
   Top bar rendering
   -------------------------------------------------------------------------- */
(async function renderTopbar() {
  const host = document.getElementById("topbar");
  if (!host) return;

  injectTopbarStyles();

  try {
    const user = window.gatherUser || await GatherAPI.request("/api/auth/me/");

    host.innerHTML = `
      <div class="topbar-inner">
        <div class="topbar-date">
          <span class="topbar-spark">✳</span> &nbsp; NST Register
        </div>
        <div class="topbar-user">
          <span class="online-dot"></span>
          <span>${escapeHTML(user.display_name)}</span>
          <span class="topbar-divider"></span>
          <span class="topbar-id">ID ${user.id}</span>
          <span class="avatar avatar-small">${GatherAPI.initials(user.display_name)}</span>
        </div>
      </div>`;
  } catch (_) {
    location.href = "/login/";
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[char]));
  }
})();
