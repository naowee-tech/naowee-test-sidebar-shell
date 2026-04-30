/**
 * Event List Page — Listado de eventos.
 * Replica https://dev-sports.naoweesuite.com/home/events.
 *
 * Composición:
 * - .naowee-page-header (con botón "Crear nuevo evento" alineado derecha)
 * - .naowee-table-card SIN tabs
 * - Toolbar: search + filtros Estados + Fechas + paginación
 * - Tabla con checkboxes para selección múltiple
 * - Estados como naowee-badge (positive=Creado, negative=En curso, neutral=Finalizado)
 *
 * Datos mock realistas. Lógica preview-only.
 */
import { getIcon } from '../menu-data.js';
import { openCreateEventModal } from './event-create-modal.js';

/* ─── Catálogos ───────────────────────────────────────────────────── */
const ESTADOS = [
  { code: 'all',        label: 'Todos los estados' },
  { code: 'creado',     label: 'Creado' },
  { code: 'en-curso',   label: 'En curso' },
  { code: 'finalizado', label: 'Finalizado' },
  { code: 'cancelado',  label: 'Cancelado' }
];
const FECHAS = [
  { code: 'all',     label: 'Todas las fechas' },
  { code: 'hoy',     label: 'Hoy' },
  { code: 'semana',  label: 'Esta semana' },
  { code: 'mes',     label: 'Este mes' },
  { code: 'año',     label: 'Este año' }
];

/* ─── Datos mock ─────────────────────────────────────────────────── */
const EVENTS = [
  { name:'Padasdasd',                                start:'28, abr, 2026',  end:'25, jun, 2026',  participants:0,  status:'creado' },
  { name:'Fase inicial',                             start:'27, abr, 2026',  end:'31, dic, 2026',  participants:0,  status:'en-curso' },
  { name:'27 de Abril',                              start:'27, abr, 2026',  end:'31, oct, 2027',  participants:0,  status:'en-curso' },
  { name:'Juegos Intercolegiados 2026 — Pruebas',    start:'24, abr, 2026',  end:'31, dic, 2026',  participants:0,  status:'en-curso' },
  { name:'Evento de Juanisa',                        start:'22, abr, 2026',  end:'30, sept, 2026', participants:0,  status:'en-curso' },
  { name:'Evento de pruebas',                        start:'22, abr, 2026',  end:'30, nov, 2026',  participants:0,  status:'en-curso' },
  { name:'Event 22',                                 start:'22, abr, 2026',  end:'27, abr, 2026',  participants:0,  status:'creado' },
  { name:'Event 21',                                 start:'21, abr, 2026',  end:'6, may, 2026',   participants:0,  status:'en-curso' },
  { name:'PruebaDocProm 2',                          start:'20, abr, 2026',  end:'25, jun, 2026',  participants:0,  status:'en-curso' },
  { name:'PruebaPromProcDoc',                        start:'20, abr, 2026',  end:'29, may, 2026',  participants:0,  status:'creado' },
  { name:'Copa BetPlay 2026',                        start:'15, abr, 2026',  end:'15, jul, 2026',  participants:128, status:'en-curso' },
  { name:'Liga Profesional Femenina',                start:'12, abr, 2026',  end:'30, oct, 2026',  participants:64,  status:'en-curso' },
  { name:'Festival Atletismo Antioquia',             start:'10, abr, 2026',  end:'15, abr, 2026',  participants:240, status:'finalizado' },
  { name:'Torneo Apertura Liga Antioqueña',          start:'5, abr, 2026',   end:'30, sept, 2026', participants:96,  status:'en-curso' },
  { name:'Copa Federación de Atletismo',             start:'1, abr, 2026',   end:'15, abr, 2026',  participants:180, status:'finalizado' },
  { name:'Selectivo Nacional Sub-15',                start:'25, mar, 2026',  end:'10, abr, 2026',  participants:72,  status:'finalizado' },
  { name:'Campeonato Distrital Bogotá',              start:'20, mar, 2026',  end:'5, abr, 2026',   participants:144, status:'finalizado' },
  { name:'Liga Empresarial 2026',                    start:'15, mar, 2026',  end:'15, dic, 2026',  participants:48,  status:'en-curso' },
  { name:'Torneo Veteranos Naowee',                  start:'10, mar, 2026',  end:'10, mar, 2026',  participants:32,  status:'finalizado' },
  { name:'Copa Universitaria',                       start:'5, mar, 2026',   end:'30, jun, 2026',  participants:200, status:'en-curso' }
];

/* ─── Estado ───────────────────────────────────────────────────────── */
const _state = {
  rootEl: null,
  search: '',
  estadoFilter: 'all',
  fechaFilter: 'all',
  page: 1,
  pageSize: 10,
  selected: new Set()
};

/* ─── Helpers ──────────────────────────────────────────────────────── */
function getFiltered() {
  const q = _state.search.trim().toLowerCase();
  return EVENTS.filter((e) => {
    if (q && !e.name.toLowerCase().includes(q)) return false;
    if (_state.estadoFilter !== 'all' && e.status !== _state.estadoFilter) return false;
    return true;
  });
}
function getTotalPages(filtered) {
  return Math.max(1, Math.ceil(filtered.length / _state.pageSize));
}

/* ─── Render principal ─────────────────────────────────────────────── */
export function renderEventListPage(rootEl) {
  _state.rootEl = rootEl;
  _state.search = '';
  _state.estadoFilter = 'all';
  _state.fechaFilter = 'all';
  _state.page = 1;
  _state.selected = new Set();
  paintFull();

  if (!document._evClickOutBound) {
    document.addEventListener('click', () => {
      document.querySelectorAll('.naowee-filter-dropdown.is-open').forEach((el) => el.classList.remove('is-open'));
      document.querySelectorAll('.naowee-table-card__row-actions.is-open').forEach((el) => el.classList.remove('is-open'));
    });
    document._evClickOutBound = true;
  }
}

function paintFull() {
  const filtered = getFiltered();
  const totalPages = getTotalPages(filtered);
  if (_state.page > totalPages) _state.page = totalPages;

  _state.rootEl.innerHTML = `
    <div class="um-page">
      <header class="naowee-page-header ev-page-header">
        <div class="ev-page-header__text">
          <h1 class="naowee-page-header__title">Listado de eventos</h1>
          <p class="naowee-page-header__subtitle">Monitoreo y control de cupos</p>
        </div>
        <button class="naowee-btn naowee-btn--loud naowee-btn--small" id="evBtnCreate" type="button">
          <span class="ev-btn-icon">${userPlusIcon()}</span>
          Crear nuevo evento
        </button>
      </header>

      <div class="naowee-table-card">
        <div class="naowee-table-card__toolbar" id="evToolbar">
          ${renderToolbarLeft()}
          <div class="naowee-pagination naowee-pagination--small" id="evPagination">
            ${renderPagination(filtered.length, totalPages)}
          </div>
        </div>
        <div class="naowee-table-card__table-wrap" id="evTableWrap">
          ${filtered.length === 0 ? renderEmpty() : renderTable(filtered)}
        </div>
      </div>
    </div>
  `;

  bindAllEvents();
}

function paintTableOnly() {
  const filtered = getFiltered();
  const totalPages = getTotalPages(filtered);
  if (_state.page > totalPages) _state.page = totalPages;

  const tableWrap = _state.rootEl.querySelector('#evTableWrap');
  const pagination = _state.rootEl.querySelector('#evPagination');
  if (tableWrap) {
    tableWrap.innerHTML = filtered.length === 0 ? renderEmpty() : renderTable(filtered);
    bindTableEvents();
  }
  if (pagination) {
    pagination.innerHTML = renderPagination(filtered.length, totalPages);
    bindPaginationEvents();
  }
}

/* ─── Render: toolbar (search + filtros) ───────────────────────────── */
function renderToolbarLeft() {
  const hasSearch = _state.search.length > 0;
  return `
    <div class="naowee-table-card__toolbar-left">
      <div class="naowee-searchbox naowee-searchbox--small ${hasSearch ? 'naowee-searchbox--has-value' : ''}" style="width:280px">
        <div class="naowee-searchbox__input-wrap">
          <span class="naowee-searchbox__icon">${searchIcon()}</span>
          <input type="text" class="naowee-searchbox__input" id="evSearch"
                 placeholder="Buscar nombre del evento"
                 value="${escapeHtml(_state.search)}" />
          <button class="naowee-searchbox__clear" type="button" id="evSearchClear" aria-label="Limpiar búsqueda">
            ${closeIcon()}
          </button>
        </div>
      </div>

      ${renderDropdown('estado', 'Estados', ESTADOS, _state.estadoFilter)}
      ${renderDropdown('fecha', 'Fechas', FECHAS, _state.fechaFilter)}
    </div>
  `;
}

function renderDropdown(ddType, placeholder, options, selectedCode) {
  const current = options.find((o) => o.code === selectedCode) || options[0];
  const triggerLabel = selectedCode === 'all' ? placeholder : current.label;
  return `
    <div class="naowee-filter-dropdown" data-dd-type="${ddType}">
      <button class="naowee-filter-dropdown__trigger" type="button">
        <span>${escapeHtml(triggerLabel)}</span>
        <span class="naowee-filter-dropdown__chev">${getIcon('chevron')}</span>
      </button>
      <div class="naowee-filter-dropdown__menu">
        ${options.map((o) => `
          <button type="button" class="naowee-filter-dropdown__option"
                  data-dd="${ddType}" data-value="${o.code}"
                  aria-selected="${o.code === selectedCode}">
            <span>${escapeHtml(o.label)}</span>
            <span class="naowee-filter-dropdown__option-check">${getIcon('check')}</span>
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

/* ─── Render: paginación ──────────────────────────────────────────── */
function renderPagination(totalFiltered, totalPages) {
  return `
    <div class="naowee-pagination__pages">
      <span class="naowee-pagination__label">Página</span>
      <input type="number" class="naowee-pagination__input" id="evPageInput"
             min="1" max="${totalPages}" value="${_state.page}" />
      <span class="naowee-pagination__total">de <strong>${totalPages}</strong></span>
    </div>
    <div class="naowee-pagination__controls">
      <button class="naowee-pagination__btn" id="evPrev" ${_state.page === 1 ? 'disabled' : ''} aria-label="Anterior">
        ${chevronLeft()}
      </button>
      <button class="naowee-pagination__btn" id="evNext" ${_state.page >= totalPages ? 'disabled' : ''} aria-label="Siguiente">
        ${chevronRight()}
      </button>
    </div>
  `;
}

/* ─── Render: tabla ───────────────────────────────────────────────── */
function renderTable(filtered) {
  const start = (_state.page - 1) * _state.pageSize;
  const rows = filtered.slice(start, start + _state.pageSize);
  const allSelected = rows.length > 0 && rows.every((_, idx) => _state.selected.has(start + idx));
  const someSelected = rows.some((_, idx) => _state.selected.has(start + idx)) && !allSelected;

  return `
    <table class="naowee-table--in-card ev-table">
      <thead>
        <tr>
          <th class="ev-th-check">
            ${renderCheckbox('evCheckAll', allSelected, someSelected)}
          </th>
          <th>Nombre del evento</th>
          <th>Fecha de inicio</th>
          <th>Fecha final</th>
          <th>Total participantes</th>
          <th>Estado</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${rows.map((e, idx) => {
          const absoluteIdx = start + idx;
          const isChecked = _state.selected.has(absoluteIdx);
          return `
            <tr class="${isChecked ? 'ev-row-checked' : ''}">
              <td class="ev-td-check">
                ${renderCheckbox(`evCheck-${absoluteIdx}`, isChecked, false, absoluteIdx)}
              </td>
              <td class="naowee-table__cell-name">${escapeHtml(e.name)}</td>
              <td class="naowee-table__cell-muted">${e.start}</td>
              <td class="naowee-table__cell-muted">${e.end}</td>
              <td>${e.participants}</td>
              <td>${renderBadge(e.status)}</td>
              <td style="text-align:right">
                <div class="naowee-table-card__row-actions" data-row="${absoluteIdx}">
                  <button class="naowee-btn naowee-btn--icon naowee-btn--mute naowee-btn--small" type="button" aria-label="Acciones">
                    ${dotsIcon()}
                  </button>
                  <div class="naowee-table-card__row-actions-menu">
                    <button class="naowee-table-card__row-actions-item" data-act="view">
                      <span class="naowee-table-card__row-actions-item-icon">${getIcon('user')}</span> Ver detalles
                    </button>
                    <button class="naowee-table-card__row-actions-item" data-act="edit">
                      <span class="naowee-table-card__row-actions-item-icon">${editIcon()}</span> Editar
                    </button>
                    <button class="naowee-table-card__row-actions-item" data-act="duplicate">
                      <span class="naowee-table-card__row-actions-item-icon">${copyIcon()}</span> Duplicar
                    </button>
                    <button class="naowee-table-card__row-actions-item naowee-table-card__row-actions-item--danger" data-act="delete">
                      <span class="naowee-table-card__row-actions-item-icon">${trashIcon()}</span> Eliminar
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}

function renderCheckbox(id, checked, indeterminate, rowIdx) {
  const cls = `naowee-checkbox ${checked ? 'naowee-checkbox--checked' : ''} ${indeterminate ? 'naowee-checkbox--indeterminate' : ''}`;
  const dataRow = rowIdx !== undefined ? `data-row="${rowIdx}"` : '';
  return `
    <label class="${cls}" ${id === 'evCheckAll' ? 'data-check-all="true"' : dataRow}>
      <input type="checkbox" class="naowee-checkbox__input" ${checked ? 'checked' : ''} hidden />
      <span class="naowee-checkbox__box">
        ${checked ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
        ${indeterminate ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="6" y1="12" x2="18" y2="12"/></svg>' : ''}
      </span>
    </label>
  `;
}

function renderBadge(status) {
  const map = {
    'creado':     { cls: 'naowee-badge naowee-badge--positive naowee-badge--quiet', label: 'Creado' },
    'en-curso':   { cls: 'naowee-badge naowee-badge--negative naowee-badge--quiet', label: 'En curso' },
    'finalizado': { cls: 'naowee-badge naowee-badge--neutral naowee-badge--quiet',  label: 'Finalizado' },
    'cancelado':  { cls: 'naowee-badge naowee-badge--neutral naowee-badge--quiet',  label: 'Cancelado' }
  };
  const m = map[status] || map['creado'];
  return `<span class="${m.cls}">${m.label}</span>`;
}

function renderEmpty() {
  return `
    <div class="naowee-empty-state">
      <span class="naowee-empty-state__icon">${searchEmptyIcon()}</span>
      <h3 class="naowee-empty-state__title">Sin resultados</h3>
      <p class="naowee-empty-state__description">Prueba a limpiar los filtros o crear un nuevo evento.</p>
    </div>
  `;
}

/* ─── Eventos ──────────────────────────────────────────────────────── */
function bindAllEvents() {
  bindCreateButton();
  bindToolbarEvents();
  bindPaginationEvents();
  bindTableEvents();
}

function bindCreateButton() {
  _state.rootEl.querySelector('#evBtnCreate')?.addEventListener('click', () => {
    openCreateEventModal();
  });
}

function bindToolbarEvents() {
  const searchInput = _state.rootEl.querySelector('#evSearch');
  const searchWrap = searchInput?.closest('.naowee-searchbox');
  searchInput?.addEventListener('input', (e) => {
    _state.search = e.target.value;
    _state.page = 1;
    if (searchWrap) searchWrap.classList.toggle('naowee-searchbox--has-value', _state.search.length > 0);
    paintTableOnly();
  });

  const clearBtn = _state.rootEl.querySelector('#evSearchClear');
  clearBtn?.addEventListener('click', () => {
    _state.search = '';
    _state.page = 1;
    if (searchInput) searchInput.value = '';
    if (searchWrap) searchWrap.classList.remove('naowee-searchbox--has-value');
    paintTableOnly();
    searchInput?.focus();
  });

  _state.rootEl.querySelectorAll('.naowee-filter-dropdown').forEach((dd) => {
    const trigger = dd.querySelector('.naowee-filter-dropdown__trigger');
    trigger?.addEventListener('click', (e) => {
      e.stopPropagation();
      _state.rootEl.querySelectorAll('.naowee-filter-dropdown.is-open').forEach((other) => {
        if (other !== dd) other.classList.remove('is-open');
      });
      dd.classList.toggle('is-open');
    });
  });

  _state.rootEl.querySelectorAll('.naowee-filter-dropdown__option').forEach((opt) => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      const ddType = opt.getAttribute('data-dd');
      const value = opt.getAttribute('data-value');
      if (ddType === 'estado') _state.estadoFilter = value;
      if (ddType === 'fecha')  _state.fechaFilter = value;
      _state.page = 1;
      paintFull();
    });
  });
}

function bindPaginationEvents() {
  const pageInput = _state.rootEl.querySelector('#evPageInput');
  pageInput?.addEventListener('change', () => {
    const total = getTotalPages(getFiltered());
    let val = parseInt(pageInput.value, 10);
    if (isNaN(val) || val < 1) val = 1;
    if (val > total) val = total;
    _state.page = val;
    paintTableOnly();
  });
  pageInput?.addEventListener('keydown', (e) => { if (e.key === 'Enter') pageInput.blur(); });
  _state.rootEl.querySelector('#evPrev')?.addEventListener('click', () => {
    if (_state.page > 1) { _state.page -= 1; paintTableOnly(); }
  });
  _state.rootEl.querySelector('#evNext')?.addEventListener('click', () => {
    const total = getTotalPages(getFiltered());
    if (_state.page < total) { _state.page += 1; paintTableOnly(); }
  });
}

function bindTableEvents() {
  /* Checkbox check-all */
  const checkAll = _state.rootEl.querySelector('[data-check-all="true"]');
  checkAll?.addEventListener('click', (e) => {
    e.preventDefault();
    const filtered = getFiltered();
    const start = (_state.page - 1) * _state.pageSize;
    const rows = filtered.slice(start, start + _state.pageSize);
    const allSelected = rows.length > 0 && rows.every((_, idx) => _state.selected.has(start + idx));
    rows.forEach((_, idx) => {
      const absIdx = start + idx;
      if (allSelected) _state.selected.delete(absIdx);
      else _state.selected.add(absIdx);
    });
    paintTableOnly();
  });

  /* Checkbox per row */
  _state.rootEl.querySelectorAll('.naowee-checkbox[data-row]').forEach((cb) => {
    cb.addEventListener('click', (e) => {
      e.preventDefault();
      const rowIdx = parseInt(cb.getAttribute('data-row'), 10);
      if (_state.selected.has(rowIdx)) _state.selected.delete(rowIdx);
      else _state.selected.add(rowIdx);
      paintTableOnly();
    });
  });

  /* Action menus */
  _state.rootEl.querySelectorAll('.naowee-table-card__row-actions').forEach((actions) => {
    const trigger = actions.querySelector('button');
    trigger?.addEventListener('click', (e) => {
      e.stopPropagation();
      _state.rootEl.querySelectorAll('.naowee-table-card__row-actions.is-open').forEach((other) => {
        if (other !== actions) other.classList.remove('is-open');
      });
      actions.classList.toggle('is-open');
    });
  });
  _state.rootEl.querySelectorAll('.naowee-table-card__row-actions-item').forEach((item) => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const act = item.getAttribute('data-act');
      const row = item.closest('.naowee-table-card__row-actions').getAttribute('data-row');
      console.info(`[event-list] action=${act} row=${row}`);
      item.closest('.naowee-table-card__row-actions').classList.remove('is-open');
    });
  });
}

/* ─── Iconos inline ────────────────────────────────────────────────── */
function searchIcon()      { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>'; }
function searchEmptyIcon() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/><line x1="8" y1="11" x2="14" y2="11"/></svg>'; }
function closeIcon()       { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'; }
function chevronLeft()     { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>'; }
function chevronRight()    { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>'; }
function dotsIcon()        { return '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/></svg>'; }
function editIcon()        { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>'; }
function copyIcon()        { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>'; }
function trashIcon()       { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>'; }
function userPlusIcon()    { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/></svg>'; }

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}
