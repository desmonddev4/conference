/* ==========================================================================
   NST Register · Sidebar
   Renders the navigation and carries its own styles, so it looks right
   on every page without depending on base.css or glass.css.
   All rules are scoped under #sidebar, which also makes them win over
   any older sidebar rules left in other stylesheets.
   ========================================================================== */

/* --------------------------------------------------------------------------
   Embedded styles
   -------------------------------------------------------------------------- */
const SIDEBAR_STYLE_ID = "sidebar-styles";

const SIDEBAR_CSS = `
/* Container: frosted glass with soft colour glows */
#sidebar .sidebar-inner {
  position: fixed;
  z-index: 5;
  top: 0;
  bottom: 0;
  left: 0;
  box-sizing: border-box;
  width: 252px;
  display: flex;
  flex-direction: column;
  padding: 27px 17px 15px;
  overflow-x: hidden;
  overflow-y: auto;
  font-family: 'DM Sans', system-ui, sans-serif;
  background-color: rgba(211, 221, 255, 0.74);
  background-image:
    radial-gradient(240px circle at 0% 0%, rgba(77, 124, 255, 0.3), transparent 70%),
    radial-gradient(260px circle at 100% 100%, rgba(122, 77, 255, 0.24), transparent 70%);
  -webkit-backdrop-filter: blur(22px) saturate(170%);
          backdrop-filter: blur(22px) saturate(170%);
  border-right: 1px solid rgba(255, 255, 255, 0.78);
  box-shadow: 8px 0 40px rgba(31, 50, 140, 0.06);
  scrollbar-width: none;
}

#sidebar .sidebar-inner::-webkit-scrollbar {
  display: none;
}

/* Brand */
#sidebar .brand {
  display: inline-flex;
  align-items: center;
  margin: 0 8px 30px;
  color: #18213f;
  text-decoration: none;
}

#sidebar .brand-logo {
  display: block;
  flex: none;
  width: 37px;
  height: 37px;
  margin-right: 8px;
  border-radius: 50%;
  background: #fff;
  object-fit: contain;
  box-shadow: 0 4px 12px rgba(31, 50, 140, 0.16);
  transition: transform 0.3s cubic-bezier(0.2, 0.7, 0.2, 1);
}

#sidebar .brand:hover .brand-logo {
  transform: rotate(-8deg) scale(1.06);
}

#sidebar .brand-name {
  font: 800 19px 'Manrope', sans-serif;
  letter-spacing: 0.4px;
  color: #18213f;
}

/* Event card */
#sidebar .event-card {
  display: flex;
  align-items: center;
  margin: 0 2px 28px;
  padding: 12px 10px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  background: rgba(201, 214, 255, 0.62);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.85);
}

#sidebar .event-icon {
  display: grid;
  place-items: center;
  width: 31px;
  height: 31px;
  margin-right: 10px;
  border-radius: 9px;
  background: linear-gradient(135deg, rgba(77, 124, 255, 0.2), rgba(25, 198, 235, 0.25));
  color: #1457e8;
  font-size: 17px;
}

#sidebar .event-card > div:nth-child(2) {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 3px;
}

#sidebar .event-card > div:nth-child(2) span {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #8892ad;
}

#sidebar .event-card strong {
  font: 600 12px 'DM Sans', sans-serif;
  color: #18213f;
}

#sidebar .event-chevron {
  font-size: 17px;
  color: #8892ad;
}

/* Navigation */
#sidebar .nav-label {
  display: block;
  margin-bottom: 9px;
  padding-left: 12px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.2px;
  color: #8892ad;
}

#sidebar .side-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

#sidebar .nav-link {
  display: flex;
  align-items: center;
  gap: 11px;
  height: 42px;
  padding: 0 11px;
  border-radius: 10px;
  color: #5d6a86;
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  transition: background 0.2s cubic-bezier(0.2, 0.7, 0.2, 1), color 0.2s, transform 0.2s cubic-bezier(0.2, 0.7, 0.2, 1);
}

#sidebar .nav-icon {
  width: 20px;
  text-align: center;
  font-size: 17px;
  color: #7783a0;
  transition: transform 0.2s cubic-bezier(0.2, 0.7, 0.2, 1), color 0.2s;
}

#sidebar .nav-plus {
  margin-left: auto;
  font-size: 17px;
}

#sidebar .nav-link:hover {
  background: rgba(212, 222, 255, 0.78);
  color: #2349c4;
  transform: translateX(2px);
}

#sidebar .nav-link:hover .nav-icon {
  transform: scale(1.12);
  color: #2349c4;
}

#sidebar .nav-link.active {
  background: linear-gradient(135deg, rgba(77, 124, 255, 0.28), rgba(122, 77, 255, 0.22));
  box-shadow: inset 0 0 0 1px rgba(77, 124, 255, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.7);
  color: #2349c4;
  font-weight: 600;
}

#sidebar .nav-link.active .nav-icon {
  color: #1d60d8;
}

/* Bottom: help chip and profile */
#sidebar .sidebar-bottom {
  margin-top: auto;
}

#sidebar .sidebar-help {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 1px 14px;
  padding: 11px 9px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  background: rgba(207, 218, 255, 0.66);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.85);
}

#sidebar .help-icon {
  display: grid;
  place-items: center;
  width: 23px;
  height: 23px;
  border-radius: 50%;
  background: rgba(77, 124, 255, 0.16);
  color: #315bd9;
  font-size: 12px;
}

#sidebar .sidebar-help > div {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 3px;
}

#sidebar .sidebar-help strong {
  font: 600 11px 'DM Sans', sans-serif;
  color: #18213f;
}

#sidebar .sidebar-help small {
  font-size: 10px;
  color: #76809b;
}

#sidebar .sidebar-help > span:last-child {
  color: #8892ad;
}

#sidebar .sidebar-profile {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 14px 2px 1px;
  border-top: 1px solid rgba(31, 50, 140, 0.08);
}

#sidebar .avatar {
  display: grid;
  flex: none;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3f78f2, #7a4dff);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(63, 90, 230, 0.3);
}

#sidebar .profile-copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

#sidebar .profile-copy strong {
  overflow: hidden;
  font: 600 12px 'DM Sans', sans-serif;
  color: #18213f;
  text-overflow: ellipsis;
  white-space: nowrap;
}

#sidebar .profile-copy small {
  font-size: 10px;
  color: #76809b;
}

#sidebar .logout-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  width: 100%;
  min-height: 42px;
  margin-top: 12px;
  padding: 0 13px;
  border: 1px solid rgba(191, 69, 83, 0.16);
  border-radius: 10px;
  background: rgba(255, 247, 248, 0.72);
  color: #a43e50;
  font: 600 12px 'DM Sans', sans-serif;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.2s cubic-bezier(0.2, 0.7, 0.2, 1), box-shadow 0.2s;
}

#sidebar .logout-button:hover {
  border-color: rgba(191, 69, 83, 0.28);
  background: #fff0f1;
  color: #8e3042;
  box-shadow: 0 5px 14px rgba(164, 62, 80, 0.09);
  transform: translateY(-1px);
}

#sidebar .logout-button:disabled {
  opacity: 0.65;
  cursor: wait;
  transform: none;
}

#sidebar .logout-icon {
  width: 16px;
  height: 16px;
  flex: none;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* Keyboard focus */
#sidebar a:focus-visible,
#sidebar button:focus-visible {
  outline: 2px solid #4d7cff;
  outline-offset: 2px;
}

/* Medium screens: narrower sidebar */
@media (max-width: 1050px) {
  #sidebar .sidebar-inner {
    width: 220px;
  }
}

/* Phones: the sidebar becomes a bottom navigation bar */
@media (max-width: 720px) {
  #sidebar .sidebar-inner {
    flex-direction: row;
    align-items: center;
    top: auto;
    right: 0;
    width: auto;
    height: 57px;
    padding: 0 8px;
    gap: 4px;
    overflow: visible;
    border-right: 0;
    border-top: 1px solid rgba(255, 255, 255, 0.78);
    box-shadow: 0 -8px 30px rgba(31, 50, 140, 0.08);
  }

  #sidebar .sidebar-inner > .brand,
  #sidebar .event-card,
  #sidebar .nav-label,
  #sidebar .sidebar-bottom {
    display: none;
  }

  #sidebar .side-nav {
    flex: 1;
    min-width: 0;
    flex-direction: row;
    justify-content: space-around;
    gap: 2px;
    height: 100%;
  }

  #sidebar .nav-link {
    flex: 1;
    flex-direction: column;
    justify-content: center;
    gap: 1px;
    height: 46px;
    padding: 3px;
    font-size: 9px;
  }

  #sidebar .nav-link:hover {
    transform: none;
  }

  #sidebar .nav-icon {
    font-size: 16px;
  }

  #sidebar .nav-plus {
    display: none;
  }

  #sidebar .logout-button {
    width: 42px;
    min-width: 42px;
    min-height: 42px;
    margin: 0;
    padding: 0;
    border-color: transparent;
    background: rgba(255, 247, 248, 0.86);
  }

  #sidebar .logout-button span {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
}

/* Fallback when backdrop-filter is not supported */
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  #sidebar .sidebar-inner {
    background-color: rgba(205, 216, 255, 0.96);
  }
}

@media (prefers-reduced-motion: reduce) {
  #sidebar .nav-link,
  #sidebar .nav-icon,
  #sidebar .brand-logo,
  #sidebar .logout-button {
    transition: none;
  }

  #sidebar .nav-link:hover,
  #sidebar .nav-link:hover .nav-icon,
  #sidebar .brand:hover .brand-logo,
  #sidebar .logout-button:hover {
    transform: none;
  }
}
`;

// Adds the styles once, before the sidebar content appears.
function injectSidebarStyles() {
  if (document.getElementById(SIDEBAR_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = SIDEBAR_STYLE_ID;
  style.textContent = SIDEBAR_CSS;
  document.head.appendChild(style);
}


/* --------------------------------------------------------------------------
   Sidebar rendering
   -------------------------------------------------------------------------- */
(async function renderSidebar() {
  const host = document.getElementById("sidebar");
  if (!host) return;

  injectSidebarStyles();

  const current = location.pathname.replace(/\/$/, "") || "/";

  try {
    const user = await GatherAPI.request("/api/auth/me/");
    window.gatherUser = user;

    const links = user.is_admin
      ? [
          ["/admin/dashboard/", "◫", "Admin overview"],
          ["/admin/team/", "♙", "Team accounts"],
          ["/admin/logs/", "◷", "Activity logs"],
          ["/attendees/", "♧", "Attendees"],
          ["/revenue/", "₵", "Revenue"],
          ["/register/", "＋", "Register attendee"],
        ]
      : [
          ["/", "◫", "Overview"],
          ["/register/", "＋", "Register attendee"],
          ["/attendees/", "♧", "Attendees"],
          ["/revenue/", "₵", "Revenue"],
        ];

    const home = user.is_admin ? "/admin/dashboard/" : "/";

    const navLinks = links.map(([href, icon, label]) => {
      const isActive = current === (href.replace(/\/$/, "") || "/");
      return `
        <a href="${href}" class="nav-link ${isActive ? "active" : ""}"${isActive ? ' aria-current="page"' : ""}>
          <span class="nav-icon">${icon}</span>
          <span>${label}</span>
          ${href === "/register/" ? "<span class='nav-plus'>+</span>" : ""}
        </a>`;
    }).join("");

    host.innerHTML = `
      <div class="sidebar-inner">
        <a class="brand" href="${home}">
          <img class="brand-logo" src="/asset/NST%20LOGO.png" alt="NST Register logo">
          <span class="brand-name">NST Register</span>
        </a>

        <div class="event-card">
          <div class="event-icon">✳</div>
          <div>
            <span>${user.is_admin ? "ADMIN WORKSPACE" : "ACTIVE EVENT"}</span>
            <strong>Conference</strong>
          </div>
          <span class="event-chevron">⌄</span>
        </div>

        <span class="nav-label">${user.is_admin ? "ADMINISTRATION" : "WORKSPACE"}</span>
        <nav class="side-nav" aria-label="Main">${navLinks}</nav>

        <div class="sidebar-bottom">
          <div class="sidebar-help">
            <span class="help-icon">?</span>
            <div>
              <strong>Need a hand?</strong>
              <small>Your event team is here.</small>
            </div>
            <span>→</span>
          </div>

          <div class="sidebar-profile">
            <div class="avatar">${GatherAPI.initials(user.display_name)}</div>
            <div class="profile-copy">
              <strong>${escapeHTML(user.display_name)}</strong>
              <small>${user.is_admin ? "Administrator" : "Front desk"} · ID ${user.id}</small>
            </div>
          </div>
        </div>

        <button id="logout-button" class="logout-button" type="button" title="Sign out of NST Register" aria-label="Sign out of NST Register">
          <svg class="logout-icon" viewBox="0 0 20 20" aria-hidden="true"><path d="M8 3H4.5A1.5 1.5 0 0 0 3 4.5v11A1.5 1.5 0 0 0 4.5 17H8"/><path d="M11 6l4 4-4 4M7 10h8"/></svg>
          <span>Sign out</span>
        </button>
      </div>`;

    document.getElementById("logout-button").addEventListener("click", async event => {
      const button = event.currentTarget;
      button.disabled = true;
      button.querySelector("span").textContent = "Signing out...";
      try {
        await GatherAPI.request("/api/auth/logout/", { method: "POST" });
      } finally {
        location.href = "/login/";
      }
    });
  } catch (_) {
    location.href = "/login/";
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[char]));
  }
})();
