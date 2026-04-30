/**
 * User Management Page — Gestión de usuarios.
 * Container card (tablet pattern) con tabs (Persona Natural / Organización) +
 * toolbar (search + tipo de doc + roles + paginación) + tabla + 3-dots menu.
 *
 * Patrones del DS portados desde naowee-test-incentivos (cod-table, toolbar-dd,
 * naowee-searchbox--pill, naowee-pagination, cod-state-pill, rev-history-btn).
 *
 * Render parcial: paint() rerenders solo la parte que cambia.
 *   - paintTable() → solo tabla + sección de paginación (al tipear search)
 *   - paintFull()  → todo (tab change, dropdown filter change)
 * Esto garantiza que el search no pierda focus al tipear.
 */
import { getIcon } from '../menu-data.js';

/* ─── Catálogos ───────────────────────────────────────────────────── */
const DOC_TYPES = [
  { code: 'all',  label: 'Todos los tipos' },
  { code: 'CC',   label: 'Cédula de ciudadanía (CC)' },
  { code: 'TI',   label: 'Tarjeta de identidad (TI)' },
  { code: 'CE',   label: 'Cédula de extranjería (CE)' },
  { code: 'PA',   label: 'Pasaporte (PA)' },
  { code: 'PEP',  label: 'Permiso especial de permanencia (PEP)' },
  { code: 'PPT',  label: 'Permiso por protección temporal (PPT)' },
  { code: 'RC',   label: 'Registro Civil (RC)' }
];
const NIT_TYPE  = { code: 'NIT',  label: 'NIT (Organizaciones)' };

const ROLES_PERSONA = [
  { code: 'all',                   label: 'Todos los roles' },
  { code: 'Deportista',            label: 'Deportista' },
  { code: 'Personal deportivo',    label: 'Personal deportivo' },
  { code: 'Acudiente legal',       label: 'Padre/Tutor' },
  { code: 'Operador',              label: 'Operador' },
  { code: 'Digitador',             label: 'Digitador' },
  { code: 'Coordinador',           label: 'Coordinador' },
  { code: 'Desconocido',           label: 'Desconocido' }
];
const ROLES_ORG = [
  { code: 'all',                   label: 'Todos los roles' },
  { code: 'Gestor organización',   label: 'Gestor organización' },
  { code: 'Federación',            label: 'Federación' },
  { code: 'Liga',                  label: 'Liga' },
  { code: 'Club',                  label: 'Club' }
];

/* ─── Datos mock ─────────────────────────────────────────────────── */
const PERSONAS_NATURALES = [
  { name:'Juan Camilo Pérez Dolores',  email:'wydoka@example.com',          docType:'CC', docNum:'686482',         minor:true,  role:'Personal deportivo', status:'active' },
  { name:'Lasa Olas',                  email:'as3a@gmail.com',              docType:'CC', docNum:'43634636',       minor:false, role:'Personal deportivo', status:'active' },
  { name:'Datas Asas',                 email:'fas@gmail.com',               docType:'TI', docNum:'34636734634',    minor:true,  role:'Deportista',         status:'active' },
  { name:'Jose López',                 email:'alopezdev+digitador@naowee.com', docType:'CC', docNum:'1044123123123', minor:false, role:'Desconocido',     status:'active' },
  { name:'Emmanuel Rueda Zuleta',      email:'zyudmar1231211@gmail.com',    docType:'TI', docNum:'103591679113213', minor:true,  role:'Deportista',         status:'active' },
  { name:'Alejandro Sanz',             email:'snaz@gmail.com',              docType:'CC', docNum:'767567654',      minor:false, role:'Personal deportivo', status:'active' },
  { name:'Loquesea Loquese',           email:'loque@gmail.com',             docType:'TI', docNum:'746775656766',   minor:true,  role:'Deportista',         status:'active' },
  { name:'Asistente Pruebas',          email:'asis@gmail.com',              docType:'CC', docNum:'234254345435',   minor:false, role:'Personal deportivo', status:'active' },
  { name:'Omar Ajakjkks',              email:'oaaa@gmail.com',              docType:'TI', docNum:'67567654757',    minor:true,  role:'Deportista',         status:'active' },
  { name:'Valentina Ortiz Castaño',    email:'valentina.ortiz@gmail.com',   docType:'TI', docNum:'1093745621',     minor:true,  role:'Deportista',         status:'active' },
  { name:'Camila Vélez Rivera',        email:'camila.velez@mindeporte.gov.co', docType:'CC', docNum:'52941283',     minor:false, role:'Personal deportivo', status:'active' },
  { name:'Diego Torres Mejía',         email:'diego.torres@mindeporte.gov.co', docType:'CC', docNum:'1014762839',   minor:false, role:'Digitador',          status:'active' },
  { name:'María Castillo Ramírez',     email:'maria.castillo@mindeporte.gov.co', docType:'CC', docNum:'52183947',  minor:false, role:'Coordinador',        status:'active' },
  { name:'Sofía Rodríguez León',       email:'sofia.rodriguez@mindeporte.gov.co', docType:'CC', docNum:'80124673', minor:false, role:'Personal deportivo', status:'active' },
  { name:'Carlos Méndez Pinilla',      email:'carlos.mendez@mindeporte.gov.co', docType:'CC', docNum:'79584213',   minor:false, role:'Personal deportivo', status:'active' },
  { name:'Laura Martínez Cano',        email:'laura.martinez@mindeporte.gov.co', docType:'CC', docNum:'1019283746', minor:false, role:'Personal deportivo', status:'active' },
  { name:'Andrés Gómez Salazar',       email:'andres.gomez@mindeporte.gov.co', docType:'CC', docNum:'80354712',     minor:false, role:'Personal deportivo', status:'active' },
  { name:'Felipe Ríos Quintero',       email:'felipe.rios@mindeporte.gov.co', docType:'CC', docNum:'1023948571',    minor:false, role:'Personal deportivo', status:'pending' },
  { name:'Patricia López Henao',       email:'patricia.lopez@gmail.com',     docType:'CC', docNum:'52647183',       minor:false, role:'Acudiente legal',    status:'active' },
  { name:'Lucía Herrera Bermúdez',     email:'lucia.herrera@mindeporte.gov.co', docType:'CC', docNum:'1018572934',  minor:false, role:'Operador',          status:'active' },
  { name:'Miguel Quintero Vargas',     email:'miguel.quintero@mindeporte.gov.co', docType:'CC', docNum:'80194673',  minor:false, role:'Personal deportivo', status:'active' },
  { name:'Ana Salazar Buitrago',       email:'ana.salazar@mindeporte.gov.co', docType:'CC', docNum:'52938174',      minor:false, role:'Personal deportivo', status:'active' },
  { name:'Santiago Acosta Pinto',      email:'santiago.acosta@gmail.com',    docType:'CC', docNum:'1098572463',     minor:false, role:'Deportista',         status:'active' },
  { name:'Mariana Pinzón Sierra',      email:'mariana.pinzon@gmail.com',     docType:'TI', docNum:'1147382641',     minor:true,  role:'Deportista',         status:'active' },
  { name:'Sebastián Rojas Murillo',    email:'sebas.rojas@gmail.com',        docType:'CC', docNum:'1019472638',     minor:false, role:'Deportista',         status:'inactive' },
  { name:'Isabella Cárdenas Patiño',   email:'isabella.cardenas@gmail.com',  docType:'TI', docNum:'1198472635',     minor:true,  role:'Deportista',         status:'active' },
  { name:'Mateo Echeverri Galindo',    email:'mateo.echeverri@gmail.com',    docType:'TI', docNum:'1184729364',     minor:true,  role:'Deportista',         status:'pending' },
  { name:'Lucía Bedoya Aguirre',       email:'lucia.bedoya@gmail.com',       docType:'CE', docNum:'XR9847261',      minor:false, role:'Personal deportivo', status:'active' },
  { name:'Ricardo Botero Vásquez',     email:'ricardo.botero@gmail.com',     docType:'PA', docNum:'AB1029384',      minor:false, role:'Personal deportivo', status:'active' },
  { name:'Tomás Restrepo Lozano',      email:'tomas.restrepo@gmail.com',     docType:'TI', docNum:'1192847362',     minor:true,  role:'Deportista',         status:'active' },
  { name:'Julieta Gómez Ardila',       email:'julieta.gomez@gmail.com',      docType:'CC', docNum:'1098473625',     minor:false, role:'Acudiente legal',    status:'active' },
  { name:'Ernesto Torres Marín',       email:'ernesto.torres@mindeporte.gov.co', docType:'CC', docNum:'80372841',   minor:false, role:'Coordinador',        status:'active' }
];

const ORGANIZACIONES = [
  { name:'Federación Colombiana de Atletismo', email:'contacto@fedeatletismo.org.co',     docType:'NIT', docNum:'860015432-1', minor:false, role:'Federación',         status:'active' },
  { name:'Liga de Atletismo de Antioquia',     email:'liga@atletismoantioquia.org.co',    docType:'NIT', docNum:'811029384-7', minor:false, role:'Liga',               status:'active' },
  { name:'Liga BetPlay Dimayor',               email:'admin@dimayor.com.co',              docType:'NIT', docNum:'860501234-2', minor:false, role:'Liga',               status:'active' },
  { name:'Club Deportivo Country',             email:'soporte@clubcountry.com',           docType:'NIT', docNum:'830201845-8', minor:false, role:'Club',               status:'active' },
  { name:'Club El Rancho',                     email:'admin@elrancho.com.co',             docType:'NIT', docNum:'860592741-6', minor:false, role:'Club',               status:'active' },
  { name:'IDRD Bogotá',                        email:'contacto@idrd.gov.co',              docType:'NIT', docNum:'899999061-9', minor:false, role:'Gestor organización', status:'active' },
  { name:'Universidad de los Andes',           email:'deportes@uniandes.edu.co',          docType:'NIT', docNum:'860007301-9', minor:false, role:'Gestor organización', status:'active' },
  { name:'Federación Col. de Fútbol',          email:'admin@fcf.com.co',                  docType:'NIT', docNum:'860024612-1', minor:false, role:'Federación',         status:'active' },
  { name:'Liga de Natación Cundinamarca',      email:'liga@natacioncundi.org.co',         docType:'NIT', docNum:'830472618-3', minor:false, role:'Liga',               status:'pending' },
  { name:'Club Bicentenario',                  email:'admin@bicentenario.org.co',         docType:'NIT', docNum:'811384726-4', minor:false, role:'Club',               status:'active' },
  { name:'Liga de Tenis de Antioquia',         email:'contacto@tenisantioquia.org.co',    docType:'NIT', docNum:'811647382-9', minor:false, role:'Liga',               status:'active' },
  { name:'Club El Nogal',                      email:'admin@clubnogal.com',               docType:'NIT', docNum:'860573821-5', minor:false, role:'Club',               status:'inactive' },
  { name:'Federación de Ciclismo',             email:'admin@fedeciclismo.org.co',         docType:'NIT', docNum:'860394827-6', minor:false, role:'Federación',         status:'active' },
  { name:'Inder Medellín',                     email:'contacto@inder.gov.co',             docType:'NIT', docNum:'890981137-8', minor:false, role:'Gestor organización', status:'active' },
  { name:'Liga de Boxeo Bogotá',               email:'liga@boxeobogota.org.co',           docType:'NIT', docNum:'830627194-2', minor:false, role:'Liga',               status:'active' }
];

/* ─── Estado ───────────────────────────────────────────────────────── */
const _state = {
  rootEl: null,
  tab: 'persona',           // 'persona' | 'organizacion'
  search: '',
  docTypeFilter: 'all',
  roleFilter: 'all',
  page: 1,
  pageSize: 15
};

/* ─── Helpers ──────────────────────────────────────────────────────── */
const dataset    = () => _state.tab === 'persona' ? PERSONAS_NATURALES : ORGANIZACIONES;
const docTypes   = () => _state.tab === 'persona' ? DOC_TYPES : [{ code:'all', label:'Todos los tipos' }, NIT_TYPE];
const rolesList  = () => _state.tab === 'persona' ? ROLES_PERSONA : ROLES_ORG;

function getFiltered() {
  const q = _state.search.trim().toLowerCase();
  return dataset().filter((u) => {
    if (q && !u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q) && !u.docNum.toLowerCase().includes(q)) return false;
    if (_state.docTypeFilter !== 'all' && u.docType !== _state.docTypeFilter) return false;
    if (_state.roleFilter !== 'all' && u.role !== _state.roleFilter) return false;
    return true;
  });
}
function getTotalPages(filtered) {
  return Math.max(1, Math.ceil(filtered.length / _state.pageSize));
}

/* ─── Render principal ─────────────────────────────────────────────── */
export function renderUserManagementPage(rootEl) {
  _state.rootEl = rootEl;
  _state.tab = 'persona';
  _state.search = '';
  _state.docTypeFilter = 'all';
  _state.roleFilter = 'all';
  _state.page = 1;
  paintFull();

  /* Click-out global cierra dropdowns y action menus + resetea ddSearch.
     Lo agregamos UNA vez al document para que sobreviva re-renders. */
  if (!document._umClickOutBound) {
    document.addEventListener('click', () => {
      document.querySelectorAll('.um-dropdown.is-open').forEach((el) => el.classList.remove('is-open'));
      document.querySelectorAll('.um-actions.is-open').forEach((el) => el.classList.remove('is-open'));
    });
    document._umClickOutBound = true;
  }

  /* Re-posicionar indicator del tab al hacer resize */
  if (!window._umResizeBound) {
    window.addEventListener('resize', () => {
      if (_state.rootEl?.isConnected) updateTabIndicator();
    });
    window._umResizeBound = true;
  }
}

/* Render completo (tab change, dropdown filter change) */
function paintFull() {
  const filtered = getFiltered();
  const totalPages = getTotalPages(filtered);
  if (_state.page > totalPages) _state.page = totalPages;

  _state.rootEl.innerHTML = `
    <div class="um-page">
      <div class="um-page__header">
        <h1>Gestión de usuarios</h1>
        <p>Administra los usuarios y sus roles en el sistema</p>
      </div>

      <div class="um-card">
        ${renderTabs()}
        <div class="um-toolbar" id="umToolbar">
          ${renderToolbarLeft()}
          <div class="naowee-pagination naowee-pagination--small" id="umPagination">
            ${renderPagination(filtered.length, totalPages)}
          </div>
        </div>
        <div class="um-table-wrap" id="umTableWrap">
          ${filtered.length === 0 ? renderEmpty() : renderTable(filtered)}
        </div>
      </div>
    </div>
  `;

  bindAllEvents();
  /* Posicionar el indicator del tab activo (necesita el DOM ya pintado) */
  requestAnimationFrame(updateTabIndicator);
}

/* Render parcial — solo tabla + paginación (al tipear search) */
function paintTableOnly() {
  const filtered = getFiltered();
  const totalPages = getTotalPages(filtered);
  if (_state.page > totalPages) _state.page = totalPages;

  const tableWrap = _state.rootEl.querySelector('#umTableWrap');
  const pagination = _state.rootEl.querySelector('#umPagination');
  if (tableWrap) {
    tableWrap.innerHTML = filtered.length === 0 ? renderEmpty() : renderTable(filtered);
    bindTableEvents();
  }
  if (pagination) {
    pagination.innerHTML = renderPagination(filtered.length, totalPages);
    bindPaginationEvents();
  }
}

/* ─── Render: tabs (DS oficial naowee-tabs--animated) ───────────── */
function renderTabs() {
  return `
    <div class="naowee-tabs naowee-tabs--animated um-tabs" id="umTabs" role="tablist">
      <button class="naowee-tab ${_state.tab === 'persona' ? 'naowee-tab--selected' : ''}"
              data-tab="persona" role="tab" type="button"
              aria-selected="${_state.tab === 'persona'}">
        Persona Natural
      </button>
      <button class="naowee-tab ${_state.tab === 'organizacion' ? 'naowee-tab--selected' : ''}"
              data-tab="organizacion" role="tab" type="button"
              aria-selected="${_state.tab === 'organizacion'}">
        Organización
      </button>
      <span class="naowee-tabs__indicator" id="umTabsIndicator"></span>
    </div>
  `;
}

/* Posiciona el indicator del DS debajo del tab activo.
   Patrón oficial: getBoundingClientRect del tab activo → translateX + width. */
function updateTabIndicator() {
  const tabs = _state.rootEl.querySelector('#umTabs');
  const ind = _state.rootEl.querySelector('#umTabsIndicator');
  if (!tabs || !ind) return;
  const active = tabs.querySelector('.naowee-tab--selected');
  if (!active) return;
  const tRect = tabs.getBoundingClientRect();
  const aRect = active.getBoundingClientRect();
  const left = aRect.left - tRect.left + tabs.scrollLeft;
  ind.style.transform = `translateX(${left}px)`;
  ind.style.width = `${aRect.width}px`;
}

/* ─── Render: toolbar (search + dropdowns) ─────────────────────────── */
function renderToolbarLeft() {
  const docOpts = docTypes();
  const roleOpts = rolesList();
  const hasSearch = _state.search.length > 0;

  return `
    <div class="um-toolbar__left">
      <label class="um-search ${hasSearch ? 'has-value' : ''}">
        <span class="um-search__icon">${searchIcon()}</span>
        <input type="text" class="um-search__input" id="umSearch"
               placeholder="Buscar por documento o correo"
               value="${escapeHtml(_state.search)}" />
        <button class="um-search__clear" type="button" id="umSearchClear" aria-label="Limpiar búsqueda">
          ${closeIcon()}
        </button>
      </label>

      ${renderDropdown('docType', 'Tipo de documento', docOpts, _state.docTypeFilter)}
      ${renderDropdown('role', 'Filtrar por Roles', roleOpts, _state.roleFilter)}
    </div>
  `;
}

/* Dropdown simple (sin search interno) — solo lista de opciones */
function renderDropdown(ddType, placeholder, options, selectedCode) {
  const current = options.find((o) => o.code === selectedCode) || options[0];
  const triggerLabel = selectedCode === 'all' ? placeholder : current.label;

  return `
    <div class="um-dropdown" data-dd-type="${ddType}">
      <button class="um-dropdown__trigger" type="button">
        <span>${escapeHtml(triggerLabel)}</span>
        <span class="um-dropdown__chev">${getIcon('chevron')}</span>
      </button>
      <div class="um-dropdown__menu">
        ${options.map((o) => `
          <button type="button" class="um-dropdown__opt"
                  data-dd="${ddType}" data-value="${o.code}"
                  aria-selected="${o.code === selectedCode}">
            <span>${escapeHtml(o.label)}</span>
            <span class="um-dropdown__opt-check">${getIcon('check')}</span>
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

/* ─── Render: paginación (DS oficial naowee-pagination) ───────────── */
function renderPagination(totalFiltered, totalPages) {
  return `
    <div class="naowee-pagination__pages">
      <span class="naowee-pagination__label">Página</span>
      <input type="number" class="naowee-pagination__input" id="umPageInput"
             min="1" max="${totalPages}" value="${_state.page}" />
      <span class="naowee-pagination__total">de <strong>${totalPages}</strong></span>
    </div>
    <div class="naowee-pagination__controls">
      <button class="naowee-pagination__btn" id="umPrev" ${_state.page === 1 ? 'disabled' : ''} aria-label="Página anterior">
        ${chevronLeft()}
      </button>
      <button class="naowee-pagination__btn" id="umNext" ${_state.page >= totalPages ? 'disabled' : ''} aria-label="Página siguiente">
        ${chevronRight()}
      </button>
    </div>
  `;
}

/* ─── Render: tabla ───────────────────────────────────────────────── */
function renderTable(filtered) {
  const isPersona = _state.tab === 'persona';
  const start = (_state.page - 1) * _state.pageSize;
  const rows = filtered.slice(start, start + _state.pageSize);

  return `
    <table class="um-table">
      <thead>
        <tr>
          <th>${isPersona ? 'Nombre' : 'Razón social'}</th>
          <th>Correo</th>
          <th>Tipo de doc.</th>
          <th>Número de Documento</th>
          ${isPersona ? '<th>Menor de edad</th>' : '<th>Tipo</th>'}
          <th>Roles</th>
          <th>Estatus</th>
          <th class="um-th-actions"></th>
        </tr>
      </thead>
      <tbody>
        ${rows.map((u, idx) => `
          <tr>
            <td class="um-td-name">${escapeHtml(u.name)}</td>
            <td class="um-td-email">${escapeHtml(u.email)}</td>
            <td class="um-td-doc-type">${u.docType}</td>
            <td class="um-td-doc-num">${u.docNum}</td>
            <td>${isPersona ? (u.minor ? 'Sí' : 'No') : u.role}</td>
            <td>${escapeHtml(u.role)}</td>
            <td>${renderBadge(u.status)}</td>
            <td class="um-cell-actions">
              <div class="um-actions" data-row="${idx}">
                <button class="naowee-btn naowee-btn--icon naowee-btn--mute naowee-btn--small um-actions__trigger" type="button" aria-label="Acciones">
                  ${dotsIcon()}
                </button>
                <div class="um-actions__menu">
                  <button class="um-actions__item" data-act="view">
                    <span class="um-actions__item-icon">${getIcon('user')}</span> Ver perfil
                  </button>
                  <button class="um-actions__item" data-act="edit">
                    <span class="um-actions__item-icon">${editIcon()}</span> Editar
                  </button>
                  <button class="um-actions__item" data-act="role">
                    <span class="um-actions__item-icon">${getIcon('shield')}</span> Cambiar rol
                  </button>
                  <button class="um-actions__item um-actions__item--danger" data-act="deactivate">
                    <span class="um-actions__item-icon">${getIcon('logout')}</span> Desactivar
                  </button>
                </div>
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

/* Badges del DS oficial — naowee-badge variants quiet (tinted) */
function renderBadge(status) {
  const map = {
    active:   { cls: 'naowee-badge naowee-badge--positive naowee-badge--quiet', label: 'Activo' },
    pending:  { cls: 'naowee-badge naowee-badge--caution naowee-badge--quiet',  label: 'Pendiente' },
    inactive: { cls: 'naowee-badge naowee-badge--neutral naowee-badge--quiet',  label: 'Inactivo' }
  };
  const m = map[status] || map.inactive;
  return `<span class="${m.cls}">${m.label}</span>`;
}

function renderEmpty() {
  return `
    <div class="um-empty">
      <h3>Sin resultados</h3>
      <p>Prueba a limpiar los filtros o cambiar la búsqueda.</p>
    </div>
  `;
}

/* ─── Eventos ──────────────────────────────────────────────────────── */
function bindAllEvents() {
  bindTabsEvents();
  bindToolbarEvents();
  bindPaginationEvents();
  bindTableEvents();
}

function bindTabsEvents() {
  /* Selector: .naowee-tab[data-tab] — DS class después de migración */
  _state.rootEl.querySelectorAll('.naowee-tab[data-tab]').forEach((t) => {
    t.addEventListener('click', () => {
      const tab = t.getAttribute('data-tab');
      if (tab === _state.tab) return;
      _state.tab = tab;
      _state.search = '';
      _state.docTypeFilter = 'all';
      _state.roleFilter = 'all';
      _state.page = 1;
      paintFull();
    });
  });
}

function bindToolbarEvents() {
  /* Search input — re-render parcial (mantiene focus) */
  const searchInput = _state.rootEl.querySelector('#umSearch');
  const searchWrap = searchInput?.closest('.um-search');
  searchInput?.addEventListener('input', (e) => {
    _state.search = e.target.value;
    _state.page = 1;
    /* Actualizamos solo la clase has-value y la tabla — NO regeneramos el input */
    if (searchWrap) searchWrap.classList.toggle('has-value', _state.search.length > 0);
    paintTableOnly();
    /* El input mantiene focus porque NO fue rerenderizado */
  });

  /* Clear button del search */
  const clearBtn = _state.rootEl.querySelector('#umSearchClear');
  clearBtn?.addEventListener('click', () => {
    _state.search = '';
    _state.page = 1;
    if (searchInput) searchInput.value = '';
    if (searchWrap) searchWrap.classList.remove('has-value');
    paintTableOnly();
    searchInput?.focus();
  });

  /* Dropdown trigger toggle */
  _state.rootEl.querySelectorAll('.um-dropdown').forEach((dd) => {
    const trigger = dd.querySelector('.um-dropdown__trigger');
    trigger?.addEventListener('click', (e) => {
      e.stopPropagation();
      _state.rootEl.querySelectorAll('.um-dropdown.is-open').forEach((other) => {
        if (other !== dd) other.classList.remove('is-open');
      });
      dd.classList.toggle('is-open');
    });
  });

  /* Dropdown options */
  _state.rootEl.querySelectorAll('.um-dropdown__opt').forEach((opt) => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      const ddType = opt.getAttribute('data-dd');
      const value = opt.getAttribute('data-value');
      if (ddType === 'docType') _state.docTypeFilter = value;
      if (ddType === 'role')    _state.roleFilter = value;
      _state.page = 1;
      paintFull();
    });
  });
}

function bindPaginationEvents() {
  const pageInput = _state.rootEl.querySelector('#umPageInput');
  pageInput?.addEventListener('change', () => {
    const total = getTotalPages(getFiltered());
    let val = parseInt(pageInput.value, 10);
    if (isNaN(val) || val < 1) val = 1;
    if (val > total) val = total;
    _state.page = val;
    paintTableOnly();
  });
  pageInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') pageInput.blur();
  });

  _state.rootEl.querySelector('#umPrev')?.addEventListener('click', () => {
    if (_state.page > 1) { _state.page -= 1; paintTableOnly(); }
  });
  _state.rootEl.querySelector('#umNext')?.addEventListener('click', () => {
    const total = getTotalPages(getFiltered());
    if (_state.page < total) { _state.page += 1; paintTableOnly(); }
  });
}

function bindTableEvents() {
  /* Action menus (3-dots) */
  _state.rootEl.querySelectorAll('.um-actions').forEach((actions) => {
    const trigger = actions.querySelector('.um-actions__trigger');
    trigger?.addEventListener('click', (e) => {
      e.stopPropagation();
      _state.rootEl.querySelectorAll('.um-actions.is-open').forEach((other) => {
        if (other !== actions) other.classList.remove('is-open');
      });
      actions.classList.toggle('is-open');
    });
  });
  _state.rootEl.querySelectorAll('.um-actions__item').forEach((item) => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const act = item.getAttribute('data-act');
      const row = item.closest('.um-actions').getAttribute('data-row');
      console.info(`[user-management] action=${act} row=${row}`);
      item.closest('.um-actions').classList.remove('is-open');
    });
  });
}

/* ─── Iconos inline ────────────────────────────────────────────────── */
function searchIcon() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>';
}
function closeIcon() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
}
function chevronLeft() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>';
}
function chevronRight() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';
}
function dotsIcon() {
  return '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/></svg>';
}
function editIcon() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
