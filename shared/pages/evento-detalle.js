/**
 * Evento — Detalle / Perfil del evento
 *
 * Layout 1:1 con el artboard "Master SUID" en Figma
 *   https://figma.com/design/R6aqHQPtSrsq8clrMwHgIb/Master-SUID?node-id=9505-71950
 *
 * Composición:
 *   - Title row: back arrow + nombre + status badge + Editar evento + Catálogo deportivo
 *   - Stats bar (gris): Fecha inicio | Fecha final | Categorías | Cierre inscripciones
 *   - Sección "Fases del juego" + botón loud "Agregar fase"
 *   - Phase tabs con dot de estado (verde=activa, amarillo=pendiente, gris=cerrada)
 *   - Datos de la fase (read-only) + Acciones split (Editar / Borrar / Crear proceso)
 *
 * Estados del evento soportados (badge superior):
 *   - creado     → positive/quiet (verde)
 *   - en-curso   → caution/quiet  (naranja)
 *   - publicado  → informative/quiet (azul)
 *   - terminado  → neutral/quiet  (gris)
 *
 * Solo los eventos con status `creado` o `en-curso` pueden abrir esta vista
 * desde la lista (event-list.js). Los demás muestran badge sin link.
 */
import { EVENTS } from './event-list.js';

/* Mock fases por id de evento — fallback a un set genérico de 4 fases */
const PHASES_BY_EVENT = {
  'evt-001': [
    { nombre:'Intercolegiados', descripcion:'Fase municipal — instituciones educativas', fechaInicio:'12/01/2026', fechaCierre:'02/02/2026', tieneCupos:'Sí', tieneInscripciones:'Sí', necesitaDocumentos:'Sí', estado:'active' },
    { nombre:'Departamental',   descripcion:'Clasifican los mejores 8 por categoría',     fechaInicio:'09/02/2026', fechaCierre:'23/02/2026', tieneCupos:'Sí', tieneInscripciones:'No', necesitaDocumentos:'Sí', estado:'pending' },
    { nombre:'Regionales',      descripcion:'4 regiones — sede rotativa',                  fechaInicio:'02/03/2026', fechaCierre:'15/03/2026', tieneCupos:'No', tieneInscripciones:'No', necesitaDocumentos:'Sí', estado:'pending' },
    { nombre:'Nacionales',      descripcion:'Final nacional — sede Bogotá',                fechaInicio:'25/03/2026', fechaCierre:'05/04/2026', tieneCupos:'No', tieneInscripciones:'No', necesitaDocumentos:'Sí', estado:'pending' }
  ]
};

const STATE_LABEL = {
  'creado':    'Creado',
  'en-curso':  'En curso',
  'publicado': 'Publicado',
  'terminado': 'Terminado'
};

function getEvent(id) {
  return EVENTS.find((e) => e.id === id);
}

function getPhases(id) {
  return PHASES_BY_EVENT[id] || [
    { nombre:'Fase 1', descripcion:'Fase inicial', fechaInicio:'—', fechaCierre:'—', tieneCupos:'—', tieneInscripciones:'—', necesitaDocumentos:'—', estado:'active' },
    { nombre:'Fase 2', descripcion:'Fase intermedia', fechaInicio:'—', fechaCierre:'—', tieneCupos:'—', tieneInscripciones:'—', necesitaDocumentos:'—', estado:'pending' }
  ];
}

function escapeHtml(str) {
  return String(str).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

function formatNumber(n) {
  return Number(n).toLocaleString('es-CO');
}

function navBackToList() {
  const url = new URL(window.location.href);
  url.searchParams.set('active', 'eventos-lista');
  url.searchParams.delete('id');
  window.location.href = url.toString();
}

/* ─── Render principal ────────────────────────────────────────────── */
export function renderEventoDetallePage(rootEl, { id } = {}) {
  const event = getEvent(id);

  if (!event) {
    rootEl.innerHTML = `
      <div class="page-placeholder">
        <h1>Evento no encontrado</h1>
        <p>El evento solicitado no existe o fue eliminado.</p>
        <button class="naowee-btn naowee-btn--quiet" type="button" id="evdBack">← Volver al listado</button>
      </div>
    `;
    rootEl.querySelector('#evdBack')?.addEventListener('click', navBackToList);
    return;
  }

  const phases = getPhases(event.id);
  /* Si el evento está terminado el badge inicial es "Terminado", si no usa el status del evento */
  const initialState = event.status; // creado | en-curso | finalizado | cancelado
  const badgeState = initialState === 'finalizado' ? 'terminado' : initialState;

  rootEl.innerHTML = renderShell(event, phases, badgeState);
  bindEvents(rootEl, event, phases, badgeState);
}

function renderShell(event, phases, badgeState) {
  return `
    <div class="evd-page">

      <!-- TITLE ROW -->
      <div class="evd-title-row">
        <div class="evd-title-left">
          <button class="evd-back" type="button" id="evdBack" aria-label="Volver al listado">
            ${chevronLeftIcon()}
          </button>
          <h1 class="evd-title">${escapeHtml(event.name)}</h1>
          <span class="evd-status evd-status--${badgeState}" id="evdStatusBadge">${STATE_LABEL[badgeState] || badgeState}</span>
        </div>
        <div class="evd-title-actions">
          <button class="naowee-btn naowee-btn--quiet" type="button" data-action="edit-event">
            ${editIcon()}<span>Editar evento</span>
          </button>
          <button class="naowee-btn naowee-btn--quiet" type="button" data-action="catalog">
            ${catalogIcon()}<span>Cat&aacute;logo deportivo</span>
          </button>
        </div>
      </div>

      <!-- STATS BAR -->
      <div class="evd-stats">
        <div class="evd-stat">
          <span class="evd-stat__label">Fecha de inicio</span>
          <span class="evd-stat__value">${escapeHtml(event.start)}</span>
        </div>
        <div class="evd-stat__divider"></div>
        <div class="evd-stat">
          <span class="evd-stat__label">Fecha final</span>
          <span class="evd-stat__value">${escapeHtml(event.end)}</span>
        </div>
        <div class="evd-stat__divider"></div>
        <div class="evd-stat">
          <span class="evd-stat__label">Categor&iacute;as</span>
          <span class="evd-stat__value">${(event.categorias || []).map(escapeHtml).join(' • ') || '—'}</span>
        </div>
        <div class="evd-stat__divider"></div>
        <div class="evd-stat">
          <span class="evd-stat__label">Cierre inscripciones</span>
          <span class="evd-stat__value">${escapeHtml(event.cierre || '—')}</span>
        </div>
      </div>

      <!-- METRIC STRIP (chips) -->
      <div class="evd-metrics">
        <button class="evd-metric is-active" type="button" data-metric="fases">
          ${phaseIcon()}<span class="evd-metric__label">Fases</span>
          <span class="evd-metric__count">${event.fases ?? phases.length}</span>
        </button>
        <button class="evd-metric" type="button" data-metric="eventos">
          ${eventIcon()}<span class="evd-metric__label">Eventos</span>
          <span class="evd-metric__count">${event.eventos ?? 0}</span>
        </button>
        <button class="evd-metric" type="button" data-metric="competencias">
          ${trophyIcon()}<span class="evd-metric__label">Competencias</span>
          <span class="evd-metric__count">${formatNumber(event.competencias ?? 0)}</span>
        </button>
        <button class="evd-metric" type="button" data-metric="participantes">
          ${peopleIcon()}<span class="evd-metric__label">Participantes</span>
          <span class="evd-metric__count">${formatNumber(event.participants ?? 0)}</span>
        </button>
      </div>

      <!-- FASES SECTION -->
      <div class="evd-section">
        <h2 class="evd-section__title">Fases del juego</h2>
        <button class="naowee-btn naowee-btn--loud" type="button" data-action="add-phase">
          ${plusIcon()}<span>Agregar fase</span>
        </button>
      </div>

      <!-- PHASE CARD -->
      <div class="evd-phase-card">
        <div class="evd-phase-tabs-wrap">
          <div class="evd-phase-tabs" role="tablist" id="evdPhaseTabs">
            ${phases.map((p, i) => `
              <button class="evd-phase-tab ${i === 0 ? 'is-selected' : ''}" role="tab" data-phase="${i}">
                <span>${escapeHtml(p.nombre)}</span>
                <span class="evd-phase-dot evd-phase-dot--${p.estado}" aria-label="${p.estado}"></span>
              </button>
            `).join('')}
          </div>
        </div>

        <div class="evd-phase-body">
          <div class="evd-phase-body__head">
            <h3 class="evd-phase-body__title">Datos de la fase</h3>
            <div class="evd-split" id="evdSplitActions">
              <button class="evd-split__main" type="button" data-action="phase-actions">
                <span>Acciones</span>
              </button>
              <button class="evd-split__caret" type="button" data-action="phase-actions" aria-label="Ver acciones">
                ${chevronDownIcon()}
              </button>
              <div class="evd-split__menu" role="menu">
                <button class="evd-split__item" type="button" role="menuitem" data-act="phase-edit">
                  ${editIcon()}<span>Editar</span>
                </button>
                <button class="evd-split__item" type="button" role="menuitem" data-act="phase-delete">
                  ${trashIcon()}<span>Borrar fase</span>
                </button>
                <button class="evd-split__item" type="button" role="menuitem" data-act="phase-doc">
                  ${docIcon()}<span>Crear proceso documental</span>
                </button>
              </div>
            </div>
          </div>

          <div class="evd-fields" id="evdPhaseFields">
            ${renderPhaseFields(phases[0])}
          </div>
        </div>
      </div>

      <!-- DEV STATE PICKER (preview de los 4 estados) -->
      <div class="evd-state-picker" role="group" aria-label="Estado del evento (vista previa)">
        <span class="evd-state-picker__label">Estado</span>
        <button type="button" data-state="creado" class="${badgeState === 'creado' ? 'is-active' : ''}">Creado</button>
        <button type="button" data-state="en-curso" class="${badgeState === 'en-curso' ? 'is-active' : ''}">En curso</button>
        <button type="button" data-state="publicado" class="${badgeState === 'publicado' ? 'is-active' : ''}">Publicado</button>
        <button type="button" data-state="terminado" class="${badgeState === 'terminado' ? 'is-active' : ''}">Terminado</button>
      </div>

    </div>
  `;
}

function renderPhaseFields(phase) {
  return `
    <div class="evd-field evd-field--full">
      <span class="evd-field__label">Nombre</span>
      <span class="evd-field__value">${escapeHtml(phase.nombre)}</span>
    </div>
    <div class="evd-field evd-field--full">
      <span class="evd-field__label">Descripci&oacute;n</span>
      <span class="evd-field__value">${escapeHtml(phase.descripcion)}</span>
    </div>
    <div class="evd-field">
      <span class="evd-field__label">Fecha de inicio</span>
      <span class="evd-field__value evd-field__value--icon">${calendarIcon()}<span>${escapeHtml(phase.fechaInicio)}</span></span>
    </div>
    <div class="evd-field">
      <span class="evd-field__label">Fecha de cierre</span>
      <span class="evd-field__value evd-field__value--icon">${calendarIcon()}<span>${escapeHtml(phase.fechaCierre)}</span></span>
    </div>
    <div class="evd-field">
      <span class="evd-field__label">&iquest;Tiene cupos?</span>
      <span class="evd-field__value">${escapeHtml(phase.tieneCupos)}</span>
    </div>
    <div class="evd-field">
      <span class="evd-field__label">&iquest;Tiene inscripciones?</span>
      <span class="evd-field__value">${escapeHtml(phase.tieneInscripciones)}</span>
    </div>
    <div class="evd-field">
      <span class="evd-field__label">&iquest;Necesita documentos?</span>
      <span class="evd-field__value">${escapeHtml(phase.necesitaDocumentos)}</span>
    </div>
  `;
}

/* ─── Bindings ────────────────────────────────────────────────────── */
function bindEvents(rootEl, event, phases, initialBadgeState) {
  /* Back */
  rootEl.querySelector('#evdBack')?.addEventListener('click', navBackToList);

  /* Phase tabs */
  rootEl.querySelectorAll('.evd-phase-tab').forEach((tab, idx) => {
    tab.addEventListener('click', () => {
      rootEl.querySelectorAll('.evd-phase-tab').forEach((t) => t.classList.remove('is-selected'));
      tab.classList.add('is-selected');
      const fields = rootEl.querySelector('#evdPhaseFields');
      if (fields) fields.innerHTML = renderPhaseFields(phases[idx]);
    });
  });

  /* Acciones split */
  const split = rootEl.querySelector('#evdSplitActions');
  split?.querySelectorAll('[data-action="phase-actions"]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      split.classList.toggle('is-open');
    });
  });
  split?.querySelectorAll('.evd-split__item').forEach((item) => {
    item.addEventListener('click', () => {
      split.classList.remove('is-open');
      console.info('[evento-detalle] phase action:', item.getAttribute('data-act'));
    });
  });
  document.addEventListener('click', (e) => {
    if (split && !split.contains(e.target)) split.classList.remove('is-open');
  });

  /* Dev state picker */
  rootEl.querySelectorAll('.evd-state-picker button').forEach((btn) => {
    btn.addEventListener('click', () => {
      const state = btn.dataset.state;
      const badge = rootEl.querySelector('#evdStatusBadge');
      if (badge) {
        badge.className = 'evd-status evd-status--' + state;
        badge.textContent = STATE_LABEL[state] || state;
      }
      rootEl.querySelectorAll('.evd-state-picker button').forEach((b) => {
        b.classList.toggle('is-active', b.dataset.state === state);
      });
    });
  });

  /* Stub actions (logs + reservados para integración) */
  rootEl.querySelectorAll('[data-action="edit-event"], [data-action="catalog"], [data-action="add-phase"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      console.info('[evento-detalle] action:', btn.dataset.action, 'event:', event.id);
    });
  });

  /* Metric chips */
  rootEl.querySelectorAll('.evd-metric').forEach((chip) => {
    chip.addEventListener('click', () => {
      rootEl.querySelectorAll('.evd-metric').forEach((c) => c.classList.remove('is-active'));
      chip.classList.add('is-active');
    });
  });
}

/* ─── Iconos inline ───────────────────────────────────────────────── */
function chevronLeftIcon() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><polyline points="15 18 9 12 15 6"/></svg>'; }
function chevronDownIcon() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><polyline points="6 9 12 15 18 9"/></svg>'; }
function plusIcon()        { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>'; }
function editIcon()        { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><path d="M11 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>'; }
function trashIcon()       { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>'; }
function docIcon()         { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="9 13 11 15 15 11"/></svg>'; }
function catalogIcon()     { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/><line x1="9" y1="9" x2="11" y2="9"/></svg>'; }
function calendarIcon()    { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><rect x="3" y="5" width="18" height="16" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="16" y1="3" x2="16" y2="7"/></svg>'; }
function phaseIcon()       { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>'; }
function eventIcon()       { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><rect x="3" y="4" width="18" height="17" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><polyline points="9 13 11 15 15 11"/></svg>'; }
function trophyIcon()      { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><path d="M8 4h8v6a4 4 0 1 1-8 0V4z"/><path d="M8 6H5a3 3 0 0 0 3 3M16 6h3a3 3 0 0 1-3 3"/><line x1="9" y1="19" x2="15" y2="19"/><line x1="12" y1="14" x2="12" y2="19"/></svg>'; }
function peopleIcon()      { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><circle cx="9" cy="8" r="3.5"/><path d="M3 19c0-3 2.5-5 6-5s6 2 6 5"/><circle cx="17" cy="9" r="2.5"/><path d="M15 19c0-2.5 1.5-4 4-4"/></svg>'; }
