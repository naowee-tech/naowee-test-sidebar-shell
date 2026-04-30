/**
 * Sedes y escenarios — Listado.
 * Replica la experiencia de:
 *   https://naowee-tech.github.io/naowee-test-escenarios/escenario-08-dashboard.html?mode=multiple
 *
 * Composición DS:
 * - .naowee-page-header (con CTA "+ Registrar sede o escenario" derecha)
 * - .naowee-table-card SIN tabs
 * - Toolbar: searchbox + filtro "Estados" + paginación
 * - Tabla con columnas: Nombre / Código / CAR / Estado / Última modificación / acciones
 * - Estados como naowee-badge--quiet (positive=Activo, caution=En revisión,
 *   neutral=Borrador, negative=Rechazado)
 * - Acción por fila: ojo (ver) para Activo/En revisión, lápiz (editar) para
 *   Borrador/Rechazado.
 *
 * El click en "+ Registrar sede o escenario" abre el modal de pre-validación.
 */
import { getIcon } from '../menu-data.js';
import { openCreateSedeModal } from './sede-create-modal.js';

/* ─── Catálogo de estados (filter dropdown + badge mapping) ─────── */
const ESTADOS = [
  { code: 'all',       label: 'Todos los estados', dot: null },
  { code: 'borrador',  label: 'Borrador',          dot: '#8788ab' },
  { code: 'revision',  label: 'En revisión',       dot: '#d74009' },
  { code: 'activo',    label: 'Activo',            dot: '#1f8923' },
  { code: 'rechazado', label: 'Rechazado',         dot: '#9e0015' }
];

/* badge variant del DS por estado */
const ESTADO_BADGE = {
  borrador:  { label: 'Borrador',     variant: 'neutral' },
  revision:  { label: 'En revisión',  variant: 'caution' },
  activo:    { label: 'Activo',       variant: 'positive' },
  rechazado: { label: 'Rechazado',    variant: 'negative' }
};

/* ─── Datos mock realistas ───────────────────────────────────────── */
const SEDES = [
  { name: 'Centro deportivo Miramar', code: '1000020202', car: 'Sí', status: 'revision',
    modifiedDate: 'Abr. 24, 2026 6:43 AM', modifiedBy: 'De Juan Hernandez Granados' },
  { name: 'Centro deportivo Prado',   code: '10000101010', car: 'No', status: 'borrador',
    modifiedDate: 'Abr. 22, 2026 9:43 AM', modifiedBy: 'De Juan Hernandez Granados' },
  { name: 'Centro deportivo Sur',     code: '1000040404', car: 'No', status: 'rechazado',
    modifiedDate: 'Abr. 14, 2026 9:43 AM', modifiedBy: 'De Juan Hernandez Granados' },
  { name: 'Centro deportivo Norte',   code: '1000030303', car: 'Sí', status: 'activo',
    modifiedDate: 'Abr. 09, 2026 9:43 AM', modifiedBy: 'De Juan Hernandez Granados' },
  { name: 'Polideportivo La Floresta', code: '1000050505', car: 'No', status: 'activo',
    modifiedDate: 'Abr. 02, 2026 11:20 AM', modifiedBy: 'De Juan Hernandez Granados' },
  { name: 'Coliseo Iván de Bedout',   code: '1000060606', car: 'Sí', status: 'activo',
    modifiedDate: 'Mar. 28, 2026 4:15 PM', modifiedBy: 'De Juan Hernandez Granados' },
  { name: 'Estadio Atanasio Girardot', code: '1000070707', car: 'Sí', status: 'revision',
    modifiedDate: 'Mar. 22, 2026 8:30 AM', modifiedBy: 'De Juan Hernandez Granados' },
  { name: 'Cancha sintética El Poblado', code: '1000080808', car: 'No', status: 'borrador',
    modifiedDate: 'Mar. 18, 2026 2:50 PM', modifiedBy: 'De Juan Hernandez Granados' }
];

/* ─── Estado de página ───────────────────────────────────────────── */
const _state = {
  search: '',
  estado: 'all',
  page: 1,
  perPage: 8
};

/* ─── Render principal ───────────────────────────────────────────── */
export function renderSedesListPage(pageEl) {
  /* sd-page: layout específico que aprovecha todo el ancho disponible
     (sin max-width:1400px como .um-page). La tabla de sedes tiene 6
     columnas y el dato "Última modificación" es ancho — necesita más
     espacio horizontal para no verse cramped. */
  pageEl.classList.remove('um-page');
  pageEl.classList.add('sd-page');
  pageEl.innerHTML = renderShell();
  bindEvents(pageEl);
}

function renderShell() {
  return `
    <div class="naowee-page-header ev-page-header">
      <div class="ev-page-header__text">
        <h1 class="naowee-page-header__title">Sedes y escenarios</h1>
        <p class="naowee-page-header__subtitle">Registra y administra tus sedes y escenarios</p>
      </div>
      <button class="naowee-btn naowee-btn--loud naowee-btn--large" type="button" id="btnOpenRegSede">
        <span class="ev-btn-icon">${plusIcon()}</span>
        Registrar sede o escenario
      </button>
    </div>

    <div class="naowee-table-card">
      ${renderToolbar()}
      <div class="naowee-table-card__table-wrap">
        ${renderTable()}
      </div>
    </div>
  `;
}

function renderToolbar() {
  return `
    <div class="naowee-table-card__toolbar">
      <div class="naowee-table-card__toolbar-left">
        ${renderSearchbox()}
        ${renderEstadosFilter()}
      </div>
      <div class="naowee-table-card__toolbar-right">
        ${renderPagination()}
      </div>
    </div>
  `;
}

function renderSearchbox() {
  const hasValue = _state.search.length > 0;
  return `
    <div class="naowee-searchbox naowee-searchbox--small ${hasValue ? 'naowee-searchbox--has-value' : ''}">
      <div class="naowee-searchbox__input-wrap">
        <span class="naowee-searchbox__icon">${searchIcon()}</span>
        <input type="text" class="naowee-searchbox__input"
               placeholder="Buscar nombre de la sede o registro catastral"
               value="${escapeHtml(_state.search)}"
               id="sdSearch" />
        ${hasValue ? `<button class="naowee-searchbox__clear" type="button" aria-label="Limpiar" id="sdSearchClear">${closeIcon()}</button>` : ''}
      </div>
    </div>
  `;
}

function renderEstadosFilter() {
  const current = ESTADOS.find(e => e.code === _state.estado) || ESTADOS[0];
  return `
    <div class="naowee-filter-dropdown" id="sdEstadosDD">
      <button class="naowee-filter-dropdown__trigger" type="button">
        <span>${current.label === 'Todos los estados' ? 'Estados' : current.label}</span>
        <span class="naowee-filter-dropdown__chev">${chevronDown()}</span>
      </button>
      <div class="naowee-filter-dropdown__menu" role="listbox">
        ${ESTADOS.map(e => `
          <button type="button" class="naowee-filter-dropdown__option"
                  data-val="${e.code}" role="option"
                  aria-selected="${e.code === _state.estado ? 'true' : 'false'}">
            ${e.dot ? `<span class="sd-dot" style="background:${e.dot}"></span>` : ''}
            <span>${e.label}</span>
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

function renderPagination() {
  const filtered = filterRows();
  const totalPages = Math.max(1, Math.ceil(filtered.length / _state.perPage));
  const prevDisabled = _state.page <= 1 ? 'disabled' : '';
  const nextDisabled = _state.page >= totalPages ? 'disabled' : '';
  return `
    <div class="naowee-pagination naowee-pagination--small">
      <div class="naowee-pagination__pages">
        <span class="naowee-pagination__label">Página</span>
        <input type="text" class="naowee-pagination__input" id="sdPgInput" value="${_state.page}" />
        <span class="naowee-pagination__total">de <strong>${totalPages}</strong></span>
      </div>
      <div class="naowee-pagination__controls">
        <button class="naowee-pagination__btn" type="button" data-pg="prev" ${prevDisabled} aria-label="Anterior">${chevronLeft()}</button>
        <button class="naowee-pagination__btn" type="button" data-pg="next" ${nextDisabled} aria-label="Siguiente">${chevronRight()}</button>
      </div>
    </div>
  `;
}

function renderTable() {
  const filtered = filterRows();
  const start = (_state.page - 1) * _state.perPage;
  const pageRows = filtered.slice(start, start + _state.perPage);

  if (filtered.length === 0) {
    return renderEmptyState();
  }

  return `
    <table class="naowee-table naowee-table--in-card">
      <thead>
        <tr>
          <th>Nombre de la sede o escenario</th>
          <th>Código de la sede</th>
          <th>CAR</th>
          <th>Estado</th>
          <th>Última modificación</th>
          <th aria-label="Acciones" class="sd-th-actions"></th>
        </tr>
      </thead>
      <tbody>
        ${pageRows.map(renderRow).join('')}
      </tbody>
    </table>
  `;
}

function renderRow(row) {
  const meta = ESTADO_BADGE[row.status] || { label: row.status, variant: 'neutral' };
  const isEditable = (row.status === 'borrador' || row.status === 'rechazado');
  const icon = isEditable ? editIcon() : viewIcon();
  const label = isEditable ? 'Editar' : 'Ver detalle';
  return `
    <tr>
      <td><div class="sd-cell-name">${escapeHtml(row.name)}</div></td>
      <td><div class="sd-cell-code">${row.code}</div></td>
      <td><div class="sd-cell-car">${row.car}</div></td>
      <td>
        <span class="naowee-badge naowee-badge--quiet naowee-badge--${meta.variant}">
          ${meta.label}
        </span>
      </td>
      <td>
        <div class="sd-cell-modified">
          <span class="sd-cell-modified__date">${row.modifiedDate}</span>
          <span class="sd-cell-modified__user">${row.modifiedBy}</span>
        </div>
      </td>
      <td class="sd-td-actions">
        <button class="naowee-btn naowee-btn--mute naowee-btn--icon naowee-btn--small"
                type="button"
                aria-label="${label}"
                data-action="${isEditable ? 'edit' : 'view'}"
                data-sede-code="${row.code}"
                data-sede-status="${row.status}">
          ${icon}
        </button>
      </td>
    </tr>
  `;
}

function renderEmptyState() {
  return `
    <div class="naowee-empty-state">
      <div class="naowee-empty-state__title">Aún no hay sedes registradas</div>
      <div class="naowee-empty-state__desc">Registra una sede o escenario y completa el formulario con los datos correspondientes.</div>
      <button class="naowee-btn naowee-btn--loud naowee-btn--medium" type="button" id="btnEmptyRegSede">
        Registrar el primer escenario
      </button>
    </div>
  `;
}

/* ─── Filtrado + búsqueda ────────────────────────────────────────── */
function filterRows() {
  const q = _state.search.trim().toLowerCase();
  return SEDES.filter(s => {
    if (_state.estado !== 'all' && s.status !== _state.estado) return false;
    if (q && !s.name.toLowerCase().includes(q) && !s.code.includes(q)) return false;
    return true;
  });
}

/* ─── Repaint quirúrgico (search no pierde foco) ─────────────────── */
function paintTableOnly(pageEl) {
  const wrap = pageEl.querySelector('.naowee-table-card__table-wrap');
  if (wrap) wrap.innerHTML = renderTable();
  const pgWrap = pageEl.querySelector('.naowee-table-card__toolbar-right');
  if (pgWrap) pgWrap.innerHTML = renderPagination();
  bindTableEvents(pageEl);
  bindPaginationEvents(pageEl);
}

function paintToolbarOnly(pageEl) {
  const tb = pageEl.querySelector('.naowee-table-card__toolbar');
  if (tb) tb.outerHTML = renderToolbar();
  bindToolbarEvents(pageEl);
}

/* ─── Bind events ────────────────────────────────────────────────── */
function bindEvents(pageEl) {
  /* CTA principal del header — abre modal */
  pageEl.querySelector('#btnOpenRegSede')?.addEventListener('click', () => openCreateSedeModal());

  bindToolbarEvents(pageEl);
  bindTableEvents(pageEl);
  bindPaginationEvents(pageEl);
}

function bindToolbarEvents(pageEl) {
  /* Searchbox — input quirúrgico (no perder foco) */
  const searchInput = pageEl.querySelector('#sdSearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      _state.search = e.target.value;
      _state.page = 1;
      /* Re-render solo la tabla y el clear button del searchbox */
      paintTableOnly(pageEl);
      /* Toggle clase --has-value sin re-renderizar el input */
      const sb = pageEl.querySelector('.naowee-searchbox');
      if (sb) sb.classList.toggle('naowee-searchbox--has-value', !!_state.search);
      /* Renderizar/quitar el botón clear quirúrgicamente */
      const wrap = pageEl.querySelector('.naowee-searchbox__input-wrap');
      let clearBtn = wrap?.querySelector('.naowee-searchbox__clear');
      if (_state.search && !clearBtn) {
        wrap.insertAdjacentHTML('beforeend',
          `<button class="naowee-searchbox__clear" type="button" aria-label="Limpiar" id="sdSearchClear">${closeIcon()}</button>`);
        wrap.querySelector('#sdSearchClear').addEventListener('click', () => {
          _state.search = '';
          paintToolbarOnly(pageEl);
          paintTableOnly(pageEl);
          pageEl.querySelector('#sdSearch')?.focus();
        });
      } else if (!_state.search && clearBtn) {
        clearBtn.remove();
      }
    });
  }
  pageEl.querySelector('#sdSearchClear')?.addEventListener('click', () => {
    _state.search = '';
    paintToolbarOnly(pageEl);
    paintTableOnly(pageEl);
  });

  /* Filter dropdown Estados — usa .is-open (no --open) per DS conv */
  const dd = pageEl.querySelector('#sdEstadosDD');
  if (dd) {
    const trigger = dd.querySelector('.naowee-filter-dropdown__trigger');
    trigger?.addEventListener('click', (e) => {
      e.stopPropagation();
      /* Cerrar otros filter dropdowns */
      document.querySelectorAll('.naowee-filter-dropdown.is-open').forEach(other => {
        if (other !== dd) other.classList.remove('is-open');
      });
      dd.classList.toggle('is-open');
    });
    dd.querySelectorAll('.naowee-filter-dropdown__option').forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        _state.estado = opt.getAttribute('data-val');
        _state.page = 1;
        dd.classList.remove('is-open');
        paintToolbarOnly(pageEl);
        paintTableOnly(pageEl);
      });
    });
    document.addEventListener('click', () => {
      dd.classList.remove('is-open');
    });
  }
}

function bindTableEvents(pageEl) {
  pageEl.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.getAttribute('data-action');
      const code = btn.getAttribute('data-sede-code');
      const status = btn.getAttribute('data-sede-status');
      if (action === 'edit' && status === 'borrador') {
        /* Borrador: re-abrir el modal de registro con datos pre-llenados
           para que el usuario continúe el flujo. */
        openCreateSedeModal();
      } else if (action === 'edit' && status === 'rechazado') {
        /* Rechazado: navegar al detail con la nota del revisor visible
           y CTA "Corregir y reenviar". */
        navigateToDetail(code, status);
      } else if (action === 'view') {
        /* Activo o En revisión → navegar al detail (perfil completo) */
        navigateToDetail(code, status);
      }
    });
  });
  pageEl.querySelector('#btnEmptyRegSede')?.addEventListener('click', () => openCreateSedeModal());
}

/* Navega al detail page conservando role + agregando code y status.
   El handler de routing en perfil.html resuelve active=sede-detail. */
function navigateToDetail(code, status) {
  const params = new URLSearchParams(window.location.search);
  params.set('active', 'sede-detail');
  params.set('code', code);
  params.set('status', status);
  window.location.search = '?' + params.toString();
}

function bindPaginationEvents(pageEl) {
  pageEl.querySelectorAll('[data-pg]').forEach(btn => {
    btn.addEventListener('click', () => {
      const dir = btn.getAttribute('data-pg');
      const filtered = filterRows();
      const totalPages = Math.max(1, Math.ceil(filtered.length / _state.perPage));
      if (dir === 'prev' && _state.page > 1) _state.page -= 1;
      if (dir === 'next' && _state.page < totalPages) _state.page += 1;
      paintTableOnly(pageEl);
    });
  });
  pageEl.querySelector('#sdPgInput')?.addEventListener('change', (e) => {
    const filtered = filterRows();
    const totalPages = Math.max(1, Math.ceil(filtered.length / _state.perPage));
    let v = parseInt(e.target.value, 10) || 1;
    v = Math.min(Math.max(1, v), totalPages);
    _state.page = v;
    paintTableOnly(pageEl);
  });
}

/* ─── Iconos ──────────────────────────────────────────────────────── */
function plusIcon()       { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>'; }
function searchIcon()     { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>'; }
function closeIcon()      { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'; }
function chevronDown()    { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>'; }
function chevronLeft()    { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>'; }
function chevronRight()   { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>'; }
function editIcon()       { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>'; }
function viewIcon()       { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>'; }

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

/* Suppress unused-import lint */
void getIcon;
