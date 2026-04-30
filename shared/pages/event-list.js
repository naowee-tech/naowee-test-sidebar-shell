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
  { code: 'all',       label: 'Todos los estados' },
  { code: 'creado',    label: 'Creado' },
  { code: 'en-curso',  label: 'En curso' },
  { code: 'publicado', label: 'Publicado' },
  { code: 'terminado', label: 'Terminado' }
];
const FECHAS = [
  { code: 'all',     label: 'Todas las fechas' },
  { code: 'hoy',     label: 'Hoy' },
  { code: 'semana',  label: 'Esta semana' },
  { code: 'mes',     label: 'Este mes' },
  { code: 'año',     label: 'Este año' }
];

/* ─── Datos mock ─────────────────────────────────────────────────────
   Reemplazado 2026-04-30: nombres realistas tipo Mindeporte / Comité
   Olímpico Colombiano, datos coherentes (categorías, cierre inscripciones,
   sede y categorías) que alimentan la vista de detalle (evento-detalle.js).
   `id` se usa como query param en perfil.html?active=evento-detalle&id=…
   ──────────────────────────────────────────────────────────────────── */
export const EVENTS = [
  { id:'evt-001', name:'Juegos Intercolegiados 2026',          start:'12, ene, 2026',  end:'20, feb, 2026',  cierre:'20, feb, 2026',  participants:8420,  status:'en-curso',   categorias:['Infantil','Pre juvenil','Juvenil'],  fases:4, eventos:10, competencias:657, sede:'Nacional' },
  { id:'evt-002', name:'Festival Nacional Atletismo Sub-18',    start:'10, mar, 2026',  end:'14, mar, 2026',  cierre:'1, mar, 2026',   participants:540,   status:'creado',     categorias:['Sub-18'],                            fases:2, eventos:5,  competencias:48,  sede:'Cali' },
  { id:'evt-003', name:'Copa Bolivariana de Natación',          start:'5, may, 2026',   end:'12, may, 2026',  cierre:'15, abr, 2026',  participants:1280,  status:'en-curso',   categorias:['Mayores'],                           fases:3, eventos:8,  competencias:86,  sede:'Cartagena' },
  { id:'evt-004', name:'Liga Profesional Femenina de Fútbol',   start:'1, abr, 2026',   end:'30, oct, 2026',  cierre:'25, mar, 2026',  participants:432,   status:'en-curso',   categorias:['Mayores'],                           fases:3, eventos:18, competencias:182, sede:'Multisede' },
  { id:'evt-005', name:'Juegos Departamentales Atlántico',      start:'18, may, 2026',  end:'7, jun, 2026',   cierre:'10, may, 2026',  participants:2120,  status:'creado',     categorias:['Sub-15','Sub-18','Mayores'],         fases:3, eventos:12, competencias:212, sede:'Barranquilla' },
  { id:'evt-006', name:'Torneo Internacional Béisbol Sub-23',   start:'2, jun, 2026',   end:'14, jun, 2026',  cierre:'20, may, 2026',  participants:312,   status:'en-curso',   categorias:['Sub-23'],                            fases:2, eventos:6,  competencias:54,  sede:'Cartagena' },
  { id:'evt-007', name:'Copa Tejo Federación 2026',             start:'15, mar, 2026',  end:'30, mar, 2026',  cierre:'5, mar, 2026',   participants:184,   status:'creado',     categorias:['Mayores','Veteranos'],               fases:2, eventos:4,  competencias:24,  sede:'Tunja' },
  { id:'evt-008', name:'Liga Departamental Voleibol Cundinamarca', start:'1, mar, 2026', end:'15, jul, 2026', cierre:'15, feb, 2026', participants:768,   status:'terminado',  categorias:['Juvenil','Mayores'],                 fases:3, eventos:10, competencias:120, sede:'Bogotá' },
  { id:'evt-009', name:'Campeonato Nacional Patinaje Carreras', start:'8, abr, 2026',   end:'12, abr, 2026',  cierre:'25, mar, 2026',  participants:412,   status:'creado',     categorias:['Sub-13','Sub-15','Sub-18','Mayores'],fases:2, eventos:5,  competencias:42,  sede:'Pereira' },
  { id:'evt-010', name:'Copa Antioquia de Ciclismo de Ruta',    start:'4, may, 2026',   end:'10, may, 2026',  cierre:'20, abr, 2026',  participants:284,   status:'publicado',  categorias:['Sub-23','Mayores'],                  fases:2, eventos:4,  competencias:28,  sede:'Medellín' },
  { id:'evt-011', name:'Torneo Élite Boxeo Pacífico',           start:'20, mar, 2026',  end:'25, mar, 2026',  cierre:'10, mar, 2026',  participants:96,    status:'creado',     categorias:['Juvenil','Mayores'],                 fases:2, eventos:3,  competencias:18,  sede:'Buenaventura' },
  { id:'evt-012', name:'Copa Federación Bádminton 2026',        start:'12, mar, 2026',  end:'18, mar, 2026',  cierre:'25, feb, 2026',  participants:148,   status:'en-curso',   categorias:['Sub-15','Sub-18','Mayores'],         fases:2, eventos:4,  competencias:36,  sede:'Bucaramanga' },
  { id:'evt-013', name:'Festival Atletismo Antioquia',          start:'10, abr, 2026',  end:'15, abr, 2026',  cierre:'30, mar, 2026',  participants:680,   status:'terminado', categorias:['Infantil','Sub-15','Sub-18'],        fases:1, eventos:1,  competencias:32,  sede:'Medellín' },
  { id:'evt-014', name:'Selectivo Nacional Karate Sub-15',      start:'25, mar, 2026',  end:'28, mar, 2026',  cierre:'15, mar, 2026',  participants:172,   status:'terminado', categorias:['Sub-15'],                            fases:1, eventos:1,  competencias:14,  sede:'Pereira' },
  { id:'evt-015', name:'Campeonato Distrital Bogotá Multideporte', start:'20, mar, 2026', end:'5, abr, 2026', cierre:'10, mar, 2026', participants:1340, status:'terminado', categorias:['Pre juvenil','Juvenil'],             fases:2, eventos:8,  competencias:96,  sede:'Bogotá' },
  { id:'evt-016', name:'Liga Empresarial Naowee 2026',          start:'15, mar, 2026',  end:'15, dic, 2026',  cierre:'1, mar, 2026',   participants:312,   status:'publicado',  categorias:['Empresarial'],                       fases:2, eventos:6,  competencias:48,  sede:'Bogotá' },
  { id:'evt-017', name:'Torneo Veteranos +50 Naowee',           start:'10, mar, 2026',  end:'10, mar, 2026',  cierre:'1, mar, 2026',   participants:64,    status:'terminado', categorias:['Veteranos'],                         fases:1, eventos:1,  competencias:8,   sede:'Cali' },
  { id:'evt-018', name:'Copa Universitaria Pacífico',           start:'5, mar, 2026',   end:'30, jun, 2026',  cierre:'20, feb, 2026',  participants:920,   status:'publicado',  categorias:['Universitaria'],                     fases:3, eventos:12, competencias:140, sede:'Cali' },
  { id:'evt-019', name:'Liga Cricket Colombia 2026',            start:'1, abr, 2026',   end:'30, may, 2026',  cierre:'15, mar, 2026',  participants:84,    status:'publicado',  categorias:['Mayores'],                           fases:2, eventos:3,  competencias:18,  sede:'Bogotá' },
  { id:'evt-020', name:'Torneo Sóftbol Femenino Caribe',        start:'15, mar, 2026',  end:'10, abr, 2026',  cierre:'1, mar, 2026',   participants:148,   status:'publicado',  categorias:['Mayores'],                           fases:1, eventos:1,  competencias:12,  sede:'Santa Marta' }
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

/* Set de IDs marcados como "deleted" mientras corre el undo de 20s. Si
   el usuario no deshace, al expirar el toast el id sale de aquí y se
   borra definitivamente del array EVENTS. Mientras esté aquí, la fila
   no aparece en la lista filtrada. */
const _pendingDeletes = new Set();

/* ─── Helpers ──────────────────────────────────────────────────────── */
function getFiltered() {
  const q = _state.search.trim().toLowerCase();
  return EVENTS.filter((e) => {
    if (_pendingDeletes.has(e.id)) return false;
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
        <button class="naowee-btn naowee-btn--loud naowee-btn--large" id="evBtnCreate" type="button">
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
              <td class="naowee-table__cell-name">
                ${isOpenable(e.status)
                  ? `<a class="ev-name-link" data-nav-id="${e.id}">${escapeHtml(e.name)}</a>`
                  : escapeHtml(e.name)}
              </td>
              <td class="naowee-table__cell-muted">${e.start}</td>
              <td class="naowee-table__cell-muted">${e.end}</td>
              <td><span class="ev-participants">${getIcon('user')}<span>${e.participants.toLocaleString('es-CO')}</span></span></td>
              <td>${renderBadge(e.status)}</td>
              <td style="text-align:right">
                <div class="naowee-table-card__row-actions" data-row="${absoluteIdx}">
                  <button class="naowee-btn naowee-btn--icon naowee-btn--mute naowee-btn--small" type="button" aria-label="Acciones">
                    ${dotsIcon()}
                  </button>
                  <div class="naowee-table-card__row-actions-menu">
                    <button class="naowee-table-card__row-actions-item" data-act="view" data-event-id="${e.id}">
                      <span class="naowee-table-card__row-actions-item-icon">${getIcon('user')}</span> Ver detalles
                    </button>
                    ${e.status === 'creado' ? `
                    <button class="naowee-table-card__row-actions-item" data-act="publish">
                      <span class="naowee-table-card__row-actions-item-icon">${publishIcon()}</span> Publicar
                    </button>` : ''}
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

/* Los 4 estados del SUID — cualquiera abre el detalle (la vista soporta
   los 4 badges). Mantengo el helper por si más adelante hay un estado
   "borrador" o similar que sí deba bloquearse. */
function isOpenable(status) {
  return status === 'creado'
      || status === 'en-curso'
      || status === 'publicado'
      || status === 'terminado';
}

/* Navega al detalle conservando role en la querystring (perfil.html?role=…). */
function navigateToEvent(id) {
  const url = new URL(window.location.href);
  url.searchParams.set('active', 'evento-detalle');
  url.searchParams.set('id', id);
  window.location.href = url.toString();
}

/* ─── Eliminar evento — confirm + soft-delete + undo toast ─────────── */
const UNDO_WINDOW_MS = 20000;

/* Modal de confirmación destructiva. Usa el componente DS naowee-modal
   con un footer de 2 botones: Cancelar (mute) + Eliminar (loud + ev-btn--danger
   que pinta el bg en rojo usando los tokens negative del DS). */
function openDeleteEventDialog(ev) {
  const overlay = document.createElement('div');
  overlay.className = 'naowee-modal-overlay open ev-delete-overlay';
  overlay.innerHTML = `
    <div class="naowee-modal" role="dialog" aria-modal="true" aria-labelledby="evDelTitle">
      <div class="naowee-modal__header">
        <div class="naowee-modal__title-group">
          <h2 id="evDelTitle" class="naowee-modal__title">Eliminar evento</h2>
          <p class="naowee-modal__subtitle">Esta acci&oacute;n no se puede deshacer una vez transcurridos 20 segundos.</p>
        </div>
        <button type="button" class="naowee-modal__dismiss" aria-label="Cerrar" data-dlg-cancel>${closeIcon()}</button>
      </div>
      <div class="naowee-modal__body">
        <p>Est&aacute;s a punto de eliminar el evento <strong>${escapeHtml(ev.name)}</strong>.</p>
        <p>Toda su informaci&oacute;n &mdash; fases, competencias, participantes inscritos &mdash; quedar&aacute; oculta inmediatamente. Tendr&aacute;s 20 segundos para deshacer la acci&oacute;n desde la notificaci&oacute;n.</p>
      </div>
      <div class="naowee-modal__footer">
        <button type="button" class="naowee-btn naowee-btn--mute" data-dlg-cancel>Cancelar</button>
        <button type="button" class="naowee-btn naowee-btn--loud ev-btn--danger" data-dlg-confirm>
          ${trashIcon()}<span>Eliminar evento</span>
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  const close = () => {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => overlay.remove(), 200);
  };
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  overlay.querySelectorAll('[data-dlg-cancel]').forEach((b) => b.addEventListener('click', close));
  overlay.querySelector('[data-dlg-confirm]').addEventListener('click', () => {
    close();
    softDeleteEvent(ev);
  });
}

/* Marca el evento como pendiente de eliminación, repinta la lista y
   muestra el toast con undo. Si pasan 20s sin deshacer, lo borramos
   definitivamente del array EVENTS. */
function softDeleteEvent(ev) {
  _pendingDeletes.add(ev.id);
  paintFull();
  showUndoToast(ev);
}

let _undoToastTimer = null;
function showUndoToast(ev) {
  /* Solo permitimos un toast a la vez para no apilar undos. */
  document.querySelectorAll('.ev-undo-toast').forEach((t) => t.remove());
  if (_undoToastTimer) { clearTimeout(_undoToastTimer); _undoToastTimer = null; }

  const wrap = document.createElement('div');
  wrap.className = 'ev-undo-toast';
  wrap.innerHTML = `
    <div class="naowee-message naowee-message--positive">
      <div class="naowee-message__header">
        <span class="naowee-message__icon">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 8l1.6 1.6L10.5 6.5" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        <span class="naowee-message__title">Evento eliminado exitosamente</span>
        <button type="button" class="naowee-message__dismiss" aria-label="Cerrar">${closeIcon(20)}</button>
      </div>
      <p class="naowee-message__text">${escapeHtml(ev.name)} fue removido del listado. Tienes 20 segundos para deshacer esta acci&oacute;n.</p>
      <div class="ev-undo-toast__action">
        <button type="button" class="naowee-btn naowee-btn--quiet naowee-btn--small ev-undo-toast__undo">Deshacer</button>
      </div>
      <span class="ev-undo-toast__progress" aria-hidden="true"></span>
    </div>
  `;
  document.body.appendChild(wrap);
  requestAnimationFrame(() => wrap.classList.add('ev-undo-toast--show'));

  const dismiss = () => {
    wrap.classList.remove('ev-undo-toast--show');
    setTimeout(() => wrap.remove(), 220);
    if (_undoToastTimer) { clearTimeout(_undoToastTimer); _undoToastTimer = null; }
  };
  wrap.querySelector('.naowee-message__dismiss').addEventListener('click', dismiss);
  wrap.querySelector('.ev-undo-toast__undo').addEventListener('click', () => {
    _pendingDeletes.delete(ev.id);
    paintFull();
    dismiss();
  });

  _undoToastTimer = setTimeout(() => {
    /* Tiempo agotado: borramos el evento del array. */
    if (_pendingDeletes.has(ev.id)) {
      _pendingDeletes.delete(ev.id);
      const idx = EVENTS.findIndex((e) => e.id === ev.id);
      if (idx >= 0) EVENTS.splice(idx, 1);
    }
    dismiss();
  }, UNDO_WINDOW_MS);
}

/* ─── Publicar evento — confirm dialog + status creado → publicado ── */
/* El dialog explica las consecuencias irreversibles: visibilidad para
   delegaciones/coordinadores, congelamiento de fechas/reglas/cupos, y
   que cualquier cambio post-publicación pasa por soporte. Replica el
   spec del screenshot de Figma. */
function openPublishEventDialog(ev) {
  const overlay = document.createElement('div');
  overlay.className = 'naowee-modal-overlay open ev-publish-overlay';
  overlay.innerHTML = `
    <div class="naowee-modal ev-publish-modal" role="dialog" aria-modal="true" aria-labelledby="evPubTitle">
      <div class="naowee-modal__header ev-publish-modal__header">
        <div class="naowee-modal__title-group">
          <h2 id="evPubTitle" class="naowee-modal__title ev-publish-modal__title">Publicar evento</h2>
        </div>
        <button type="button" class="naowee-modal__dismiss" aria-label="Cerrar" data-dlg-cancel>${closeIcon()}</button>
      </div>
      <div class="naowee-modal__body ev-publish-modal__body">
        <p class="ev-publish-modal__lead">
          Est&aacute;s a punto de publicar el evento <strong>${escapeHtml(ev.name)}</strong>
        </p>
        <p class="ev-publish-modal__lead">&iquest;Quieres publicar este evento ahora?</p>

        <div class="naowee-message naowee-message--caution ev-publish-modal__warning">
          <div class="naowee-message__header">
            <span class="naowee-message__icon">${warningIcon()}</span>
            <p class="naowee-message__text">Despu&eacute;s de publicar, cualquier cambio deber&aacute; ser gestionado por el equipo de soporte.</p>
          </div>
        </div>

        <ul class="ev-publish-modal__checks">
          <li class="ev-publish-modal__check">
            <span class="ev-publish-modal__check-icon">${circleCheckIcon()}</span>
            <span>El evento quedar&aacute; visible para las delegaciones y coordinadores habilitados.</span>
          </li>
          <li class="ev-publish-modal__check">
            <span class="ev-publish-modal__check-icon">${circleCheckIcon()}</span>
            <span>Se aplicar&aacute;n las fechas, reglas, cupos y configuraciones que definiste. <strong>No vas a poder editar este evento desde la plataforma.</strong></span>
          </li>
        </ul>

        <div class="ev-publish-modal__help">
          <h4 class="ev-publish-modal__help-title">${chatIcon()} &iquest;NECESITAS AYUDA?</h4>
          <p>Si necesitas modificar algo despu&eacute;s de publicar, contacta a soporte indicando el nombre del evento y el cambio que requieres.</p>
          <a class="ev-publish-modal__email" href="mailto:soporte@naowee.com">soporte@naowee.com</a>
        </div>
      </div>
      <div class="naowee-modal__footer naowee-modal__footer--spread">
        <button type="button" class="naowee-btn naowee-btn--link" data-dlg-cancel>Cancelar</button>
        <button type="button" class="naowee-btn naowee-btn--loud" data-dlg-confirm>S&iacute;, publicar evento</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  const close = () => {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => overlay.remove(), 200);
  };
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  overlay.querySelectorAll('[data-dlg-cancel]').forEach((b) => b.addEventListener('click', close));
  overlay.querySelector('[data-dlg-confirm]').addEventListener('click', () => {
    close();
    publishEvent(ev);
  });
}

function publishEvent(ev) {
  /* Cambio de estado in-memory + repaint. En backend real esto sería
     un PATCH /events/:id { status: 'publicado' }. */
  ev.status = 'publicado';
  paintFull();
  showPublishToast(ev);
}

function showPublishToast(ev) {
  document.querySelectorAll('.ev-undo-toast').forEach((t) => t.remove());
  const wrap = document.createElement('div');
  wrap.className = 'ev-undo-toast ev-undo-toast--no-progress';
  wrap.innerHTML = `
    <div class="naowee-message naowee-message--positive">
      <div class="naowee-message__header">
        <span class="naowee-message__icon">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 8l1.6 1.6L10.5 6.5" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        <span class="naowee-message__title">Evento publicado</span>
        <button type="button" class="naowee-message__dismiss" aria-label="Cerrar">${closeIcon(20)}</button>
      </div>
      <p class="naowee-message__text">${escapeHtml(ev.name)} ya est&aacute; visible para las delegaciones y coordinadores habilitados.</p>
    </div>
  `;
  document.body.appendChild(wrap);
  requestAnimationFrame(() => wrap.classList.add('ev-undo-toast--show'));
  const dismiss = () => {
    wrap.classList.remove('ev-undo-toast--show');
    setTimeout(() => wrap.remove(), 220);
  };
  wrap.querySelector('.naowee-message__dismiss').addEventListener('click', dismiss);
  setTimeout(dismiss, 4500);
}

function renderBadge(status) {
  const map = {
    'creado':    { cls: 'naowee-badge naowee-badge--positive naowee-badge--quiet',    label: 'Creado'    },
    'en-curso':  { cls: 'naowee-badge naowee-badge--caution naowee-badge--quiet',     label: 'En curso'  },
    'publicado': { cls: 'naowee-badge naowee-badge--informative naowee-badge--quiet', label: 'Publicado' },
    'terminado': { cls: 'naowee-badge naowee-badge--neutral naowee-badge--quiet',     label: 'Terminado' }
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
      const wrap = item.closest('.naowee-table-card__row-actions');
      const row = wrap.getAttribute('data-row');
      const eventId = item.getAttribute('data-event-id');
      wrap.classList.remove('is-open');
      if (act === 'view' && eventId) {
        navigateToEvent(eventId);
        return;
      }
      if (act === 'delete') {
        const ev = EVENTS[Number(row)];
        if (ev) openDeleteEventDialog(ev);
        return;
      }
      if (act === 'publish') {
        const ev = EVENTS[Number(row)];
        if (ev) openPublishEventDialog(ev);
        return;
      }
      console.info(`[event-list] action=${act} row=${row}`);
    });
  });

  /* Click en el nombre del evento (cuando es openable) → navega al detalle */
  _state.rootEl.querySelectorAll('.ev-name-link[data-nav-id]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navigateToEvent(link.getAttribute('data-nav-id'));
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
function publishIcon()     { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>'; }
function warningIcon()     { return '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><line x1="8" y1="4" x2="8" y2="9" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/><circle cx="8" cy="11.6" r="1" fill="#fff"/></svg>'; }
function circleCheckIcon() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="8 12 11 15 16 9"/></svg>'; }
function chatIcon()        { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><path d="M3 12a8 8 0 0 1 8-8h0a8 8 0 0 1 8 8v0a8 8 0 0 1-8 8H7l-4 3z"/></svg>'; }

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}
