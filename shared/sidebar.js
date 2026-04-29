/**
 * Sidebar render + interactions.
 * Toma un roleCode (?role=...) y renderiza el sidebar correspondiente.
 *
 * Markup portado 1:1 desde naowee-test-incentivos:
 * - Sidebar con logos reales (Ministerio + separator + SUID)
 * - Burger button a la izquierda con rotación 180° en collapsed
 * - Header con profile-switcher (user-chip "Phil" estilo: avatar+dot+nombre+rol+chevron)
 * - Dropdown del profile-switcher con la lista de los roles disponibles
 */
import { ROLES, getMenuForRole, getIcon } from './menu-data.js';

const COLLAPSED_KEY = 'naowee-sidebar-collapsed';

export function mountSidebar({ rootEl, roleCode, activeId }) {
  const role = ROLES[roleCode] || ROLES.ATHLETE;
  const sections = getMenuForRole(role.code);
  const isCollapsed = localStorage.getItem(COLLAPSED_KEY) === '1';

  rootEl.innerHTML = renderSidebar({ sections, activeId, isCollapsed });
  bindSidebarEvents(rootEl);
  return { role, sections };
}

function renderSidebar({ sections, activeId, isCollapsed }) {
  return `
    <aside class="sidebar ${isCollapsed ? 'collapsed' : ''}" id="naoweeSidebar">
      <div class="sidebar-logo">
        <button class="burger-btn" id="sidebarToggle" aria-label="Colapsar menú">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="#282834" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
        </button>
        <img src="shared/logos/ministerio.svg" alt="Ministerio del Deporte" class="sb-logo-img"/>
        <div class="logo-sep"></div>
        <img src="shared/logos/suid.png" alt="SUID" class="sb-logo-img"/>
      </div>

      <nav class="sidebar-nav" role="navigation" aria-label="Menú principal">
        ${sections.map((s) => renderSection(s, activeId)).join('')}
      </nav>

      <div class="sidebar-bottom">
        <div class="nav-row" data-action="logout">
          <div class="icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B5B9D4" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/>
            </svg>
          </div>
          <span class="lbl">Cerrar sesión</span>
        </div>
      </div>
    </aside>
  `;
}

function renderSection(section, activeId) {
  const itemsHtml = section.items.map((item) => renderItem(item, activeId)).join('');
  if (!section.section) return itemsHtml;
  return `
    <div class="nav-section">${section.section}</div>
    ${itemsHtml}
  `;
}

function renderItem(item, activeId) {
  const isActive = item.id === activeId;
  const hasChildren = item.children && item.children.length > 0;
  const childActive = hasChildren && item.children.some((c) => c.id === activeId);
  const expanded = childActive;

  return `
    <div class="nav-row ${isActive ? 'active' : ''} ${expanded ? 'expanded' : ''}"
         data-id="${item.id}"
         data-route="${item.route || ''}">
      ${isActive ? '<div class="active-bar"></div>' : ''}
      <div class="icon">${getIcon(item.icon)}</div>
      <span class="lbl">${item.label}</span>
      ${hasChildren ? `<span class="nav-arrow">${getIcon('chevron')}</span>` : ''}
    </div>
    ${hasChildren ? renderChildren(item.children, activeId) : ''}
  `;
}

function renderChildren(children, activeId) {
  return `
    <div class="sub-nav">
      ${children.map((c) => `
        <div class="sub-row ${c.id === activeId ? 'active' : ''}"
             data-id="${c.id}"
             data-route="${c.route || ''}">
          <span class="lbl">${c.label}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function bindSidebarEvents(rootEl) {
  const sidebar = rootEl.querySelector('.sidebar');
  const toggle = rootEl.querySelector('#sidebarToggle');

  if (toggle) {
    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      const collapsed = sidebar.classList.contains('collapsed');
      localStorage.setItem(COLLAPSED_KEY, collapsed ? '1' : '0');
    });
  }

  // Toggle expansion of items with children
  rootEl.querySelectorAll('.nav-row').forEach((row) => {
    row.addEventListener('click', (e) => {
      if (sidebar.classList.contains('collapsed')) return;
      const next = row.nextElementSibling;
      const hasChildren = next && next.classList.contains('sub-nav');
      if (!hasChildren) return;
      e.preventDefault();
      e.stopPropagation();
      row.classList.toggle('expanded');
    });
  });
}

/* ─── Header user-chip ("Phil") ───────────────────────────────────────
   Replica el patrón de incentivos: avatar circular + dot verde + nombre + rol + chevron.
   El chevron abre un dropdown con los demás roles para cambiar de perfil rápido.
   ─────────────────────────────────────────────────────────────────── */
export function mountHeader({ headerEl, role }) {
  const initials = (role.userName || role.label)
    .split(/\s+/).filter(Boolean).slice(0, 2)
    .map((w) => w[0]).join('').toUpperCase();

  const ddItems = Object.values(ROLES).map((r) => `
    <a class="profile-dd__item ${r.code === role.code ? 'active' : ''}"
       href="perfil.html?role=${r.code}">
      <span class="ava-ring" style="width:28px;height:28px;font-size:11px;background:${r.color}22;color:${r.color}">
        ${(r.userName || r.label).split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
      </span>
      <div class="role-meta">
        <span>${r.userName || r.label}</span>
        <small>${r.label}</small>
      </div>
    </a>
  `).join('');

  headerEl.innerHTML = `
    <div class="profile-switcher" id="profileSwitcher">
      <div class="user-chip" id="userChipTrigger">
        <div class="ava">
          <div class="ava-ring" style="background:${role.color}22;color:${role.color}">${initials}</div>
          <div class="ava-dot"></div>
        </div>
        <div class="user-info">
          <span class="user-name">${role.userName || role.label}</span>
          <span class="user-role">${role.label}</span>
        </div>
        <button class="user-chip__chevron" type="button" aria-label="Cambiar de rol">
          ${getIcon('chevron')}
        </button>
      </div>
      <div class="profile-dd" role="menu">
        <div class="profile-dd__label">Cambiar de rol (preview)</div>
        ${ddItems}
      </div>
    </div>
  `;

  bindHeaderEvents(headerEl);
}

function bindHeaderEvents(headerEl) {
  const switcher = headerEl.querySelector('#profileSwitcher');
  const trigger = headerEl.querySelector('#userChipTrigger');
  if (!switcher || !trigger) return;

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    switcher.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!switcher.contains(e.target)) switcher.classList.remove('open');
  });
}

/* ─── Helpers ────────────────────────────────────────────────────────── */
export function getRoleFromQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get('role') || 'ATHLETE';
}
