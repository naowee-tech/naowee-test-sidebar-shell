/**
 * Sidebar render + interactions.
 * Toma un roleCode (?role=...) y renderiza el sidebar correspondiente.
 */
import { ROLES, getMenuForRole, getIcon } from './menu-data.js';

const COLLAPSED_KEY = 'naowee-sidebar-collapsed';

export function mountSidebar({ rootEl, roleCode, activeId }) {
  const role = ROLES[roleCode] || ROLES.ATHLETE;
  const sections = getMenuForRole(role.code);

  const isCollapsed = localStorage.getItem(COLLAPSED_KEY) === '1';

  rootEl.innerHTML = renderSidebar({ role, sections, activeId, isCollapsed });
  bindEvents(rootEl);
  return { role, sections };
}

function renderSidebar({ role, sections, activeId, isCollapsed }) {
  return `
    <aside class="sidebar ${isCollapsed ? 'collapsed' : ''}" id="naoweeSidebar">
      <div class="sidebar-logo">
        <div class="sidebar-logo__icon">S</div>
        <div class="sidebar-logo__brand">
          <span class="sidebar-logo__title">SUID</span>
          <span class="sidebar-logo__sub">Sistema Único de Información del Deporte</span>
        </div>
        <button class="sidebar-logo__toggle" id="sidebarToggle" aria-label="Colapsar menú">
          ${getIcon('burger')}
        </button>
      </div>

      <nav class="sidebar-nav" role="navigation" aria-label="Menú principal">
        ${sections.map((s) => renderSection(s, activeId)).join('')}
      </nav>

      <div class="sidebar-bottom">
        <div class="nav-row" data-action="logout">
          <span class="icon">${getIcon('logout')}</span>
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
      ${isActive ? '<span class="active-bar" aria-hidden="true"></span>' : ''}
      <span class="icon">${getIcon(item.icon)}</span>
      <span class="lbl">${item.label}</span>
      ${hasChildren ? `<span class="chevron">${getIcon('chevron')}</span>` : ''}
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

function bindEvents(rootEl) {
  const sidebar = rootEl.querySelector('.sidebar');
  const toggle = rootEl.querySelector('#sidebarToggle');

  if (toggle) {
    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      const collapsed = sidebar.classList.contains('collapsed');
      localStorage.setItem(COLLAPSED_KEY, collapsed ? '1' : '0');
    });
  }

  // Expand/collapse parent items with children
  rootEl.querySelectorAll('.nav-row').forEach((row) => {
    row.addEventListener('click', (e) => {
      // If sidebar is collapsed, ignore expansion (icon-only mode)
      if (sidebar.classList.contains('collapsed')) return;

      const next = row.nextElementSibling;
      const hasChildren = next && next.classList.contains('sub-nav');
      if (!hasChildren) return;

      // Don't navigate when toggling expansion — only toggle
      e.preventDefault();
      e.stopPropagation();
      row.classList.toggle('expanded');
    });
  });
}

/* ─── Header user-chip helper ────────────────────────────────────────── */
export function mountHeader({ headerEl, role, breadcrumb }) {
  const initials = role.label
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  headerEl.innerHTML = `
    <div class="top-header__breadcrumb">
      <strong>Inicio</strong>
      <span class="top-header__breadcrumb-sep">›</span>
      <span>${breadcrumb || 'Vista del rol'}</span>
      <span class="preview-badge" style="background:${role.color}22;color:${role.color}">
        ${role.label}
      </span>
    </div>

    <div class="user-chip">
      <span class="user-chip__avatar" style="background:${role.color}22;color:${role.color}">
        ${initials}
      </span>
      <span class="user-chip__chevron">
        ${getIcon('chevron')}
      </span>
    </div>
  `;
}

/* ─── Role selector (for index page) ─────────────────────────────────── */
export function getRoleFromQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get('role') || 'ATHLETE';
}
