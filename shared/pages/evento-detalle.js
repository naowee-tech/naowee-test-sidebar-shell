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
import { openPhaseModal } from './phase-modal.js';

/* Mock fases por id de evento — fallback a un set genérico de 4 fases.
   El estado de cada fase determina el render del stepper (done/active/
   pending) — replica el reference Figma del Master SUID para evt-001. */
const PHASES_BY_EVENT = {
  'evt-001': [
    { nombre:'Municipal',     descripcion:'Fase municipal — instituciones educativas', fechaInicio:'12/01/2026', fechaCierre:'02/02/2026', tieneCupos:'Sí', tieneInscripciones:'Sí', necesitaDocumentos:'Sí', estado:'done' },
    { nombre:'Departamental', descripcion:'Clasifican los mejores 8 por categoría',     fechaInicio:'09/02/2026', fechaCierre:'23/02/2026', tieneCupos:'Sí', tieneInscripciones:'No', necesitaDocumentos:'Sí', estado:'active' },
    { nombre:'Regional',      descripcion:'4 regiones — sede rotativa',                  fechaInicio:'02/03/2026', fechaCierre:'15/03/2026', tieneCupos:'No', tieneInscripciones:'No', necesitaDocumentos:'Sí', estado:'pending' },
    { nombre:'Nacional',      descripcion:'Final nacional — sede Bogotá',                fechaInicio:'25/03/2026', fechaCierre:'05/04/2026', tieneCupos:'No', tieneInscripciones:'No', necesitaDocumentos:'Sí', estado:'pending' }
  ]
};

const STATE_LABEL = {
  'creado':    'Creado',
  'en-curso':  'En curso',
  'publicado': 'Publicado',
  'terminado': 'Terminado'
};

/* Mapeo a las clases del DS (naowee-badge --quiet) */
const STATE_BADGE_CLS = {
  'creado':    'naowee-badge naowee-badge--positive naowee-badge--quiet',
  'en-curso':  'naowee-badge naowee-badge--caution naowee-badge--quiet',
  'publicado': 'naowee-badge naowee-badge--informative naowee-badge--quiet',
  'terminado': 'naowee-badge naowee-badge--neutral naowee-badge--quiet'
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

/* Iniciales del evento para el avatar — toma la primera letra de las
   primeras dos palabras alfanuméricas (ignora 2026, "de", etc). Ej:
   "Juegos Intercolegiados 2026" → "JI". */
function getInitials(name) {
  if (!name) return '·';
  const STOP = new Set(['de','la','el','los','las','y','del','en']);
  const words = String(name)
    .split(/\s+/)
    .filter(w => /[a-záéíóúñ]/i.test(w) && !STOP.has(w.toLowerCase()))
    .slice(0, 2);
  return words.map(w => w[0].toUpperCase()).join('') || name[0].toUpperCase();
}

/* Tipo de deporte derivado de las categorías. En el modelo actual no
   hay un campo "deporte"; usamos el conteo de categorías como proxy. */
function getSportType(event) {
  const n = (event.categorias || []).length;
  if (n >= 3) return 'Multideporte';
  if (n === 2) return 'Multicategoría';
  return 'Deporte único';
}

/* "DD/MM/AAAA" o "DD, mmm, AAAA" → "DD Mmm." (ej: "12 Ene.") para el
   stepper de fases. Si no parsea, devuelve el string original. */
function shortPhaseDate(s) {
  if (!s) return '';
  const dmy = String(s).match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmy) {
    const m = parseInt(dmy[2], 10);
    if (m >= 1 && m <= 12) return `${parseInt(dmy[1])} ${MES_ABBR[m - 1]}.`;
  }
  const wordly = String(s).match(/^(\d{1,2}),\s*([a-z]{3,4}),?\s*\d{4}$/i);
  if (wordly) {
    const idx = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
      .indexOf(wordly[2].toLowerCase().slice(0, 3));
    if (idx >= 0) return `${parseInt(wordly[1])} ${MES_ABBR[idx]}.`;
  }
  return s;
}

/* Render del stepper DS para las fases. Mapping de estados:
     - done    → naowee-stepper__step--done   + "Completada"
     - active  → naowee-stepper__step--active + "En curso"
     - pending → sin modificador               (sin badge)
   El step activo se determina por el estado o, si ninguno está active,
   por el primer step pending. Click en cualquier step navega a su
   contenido en el body. */
function renderPhaseStepper(phases, activeIdx) {
  return `
    <ol class="naowee-stepper naowee-stepper--pulse evd-phase-stepper" id="evdPhaseStepper">
      ${phases.map((p, i) => {
        const isDone   = p.estado === 'done';
        const isActive = !isDone && (i === activeIdx);
        const cls = ['naowee-stepper__step', 'evd-phase-step'];
        if (isDone)   cls.push('naowee-stepper__step--done');
        if (isActive) cls.push('naowee-stepper__step--active');
        const connectorCls = isDone
          ? 'naowee-stepper__connector naowee-stepper__connector--done'
          : 'naowee-stepper__connector';
        const numberContent = isDone
          ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>'
          : (i + 1);
        let badge = '';
        if (isDone)   badge = '<span class="naowee-badge naowee-badge--positive naowee-badge--quiet evd-phase-step__badge">Completada</span>';
        if (isActive) badge = '<span class="naowee-badge naowee-badge--caution naowee-badge--quiet evd-phase-step__badge">En curso</span>';
        const dateRange = `${shortPhaseDate(p.fechaInicio)} &bull; ${shortPhaseDate(p.fechaCierre)}`;
        return `
          <li class="${cls.join(' ')}" role="button" tabindex="0" data-phase="${i}">
            <span class="naowee-stepper__number">${numberContent}</span>
            ${i < phases.length - 1 ? `<span class="${connectorCls}"></span>` : ''}
            <div class="evd-phase-step__info">
              <span class="naowee-stepper__label">${escapeHtml(p.nombre)}</span>
              <span class="evd-phase-step__date">${dateRange}</span>
              ${badge}
            </div>
          </li>
        `;
      }).join('')}
    </ol>
  `;
}

/* DD/MM/AAAA → "DD, Mmm de YYYY" (ej: "02, Abr de 2026"). Si no parsea,
   devuelve el string original tal cual. */
const MES_ABBR = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
function formatPhaseDate(s) {
  if (!s || typeof s !== 'string') return s;
  const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (!m) return s;
  const dd = m[1].padStart(2, '0');
  const mm = parseInt(m[2], 10);
  if (mm < 1 || mm > 12) return s;
  return `${dd}, ${MES_ABBR[mm - 1]} de ${m[3]}`;
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
  /* event.status ya viene como uno de los 4 estados oficiales:
     creado | en-curso | publicado | terminado */
  const badgeState = event.status;

  rootEl.innerHTML = renderShell(event, phases, badgeState);
  bindEvents(rootEl, event, phases, badgeState);
}

function renderShell(event, phases, badgeState) {
  const badgeCls = STATE_BADGE_CLS[badgeState] || STATE_BADGE_CLS.creado;
  const initials = getInitials(event.name);
  const sportType = getSportType(event);
  const cats = (event.categorias || []).map(escapeHtml).join(' &middot; ');
  const dateRange = `${escapeHtml(event.start)} &mdash; ${escapeHtml(event.end)}`;
  return `
    <div class="evd-page">

      <!-- HEADER CARD: hero (id + title + subtitle + actions) + KPIs strip -->
      <section class="evd-header-card">
        <div class="evd-hero">
          <button class="naowee-btn naowee-btn--icon naowee-btn--mute evd-back" type="button" id="evdBack" aria-label="Volver al listado">
            ${chevronLeftIcon()}
          </button>
          <div class="evd-hero__avatar" aria-hidden="true">${escapeHtml(initials)}</div>
          <div class="evd-hero__main">
            <div class="evd-hero__title-row">
              <h1 class="evd-title">${escapeHtml(event.name)}</h1>
              <span class="${badgeCls}" id="evdStatusBadge">${STATE_LABEL[badgeState] || badgeState}</span>
            </div>
            <p class="evd-hero__subtitle">
              <span class="evd-hero__type">${escapeHtml(sportType)}</span>
              ${cats ? `<span class="evd-hero__sep">&bull;</span><span>${cats}</span>` : ''}
              <span class="evd-hero__sep">&bull;</span>
              <span>${dateRange}</span>
            </p>
          </div>
          <div class="evd-hero__actions">
            <button class="naowee-btn naowee-btn--mute naowee-btn--small" type="button" data-action="edit-event">
              ${editIcon()}<span>Editar evento</span>
            </button>
            <button class="naowee-btn naowee-btn--mute naowee-btn--small" type="button" data-action="catalog">
              ${catalogIcon()}<span>Cat&aacute;logo deportivo</span>
            </button>
          </div>
        </div>

        <div class="evd-kpis">
          <div class="evd-kpi">
            <span class="evd-kpi__value">${formatNumber(event.participants ?? 0)}</span>
            <span class="evd-kpi__label">Participantes</span>
          </div>
          <span class="evd-kpi__sep" aria-hidden="true"></span>
          <div class="evd-kpi">
            <span class="evd-kpi__value">${formatNumber(event.competencias ?? 0)}</span>
            <span class="evd-kpi__label">Competencias</span>
          </div>
          <span class="evd-kpi__sep" aria-hidden="true"></span>
          <div class="evd-kpi">
            <span class="evd-kpi__value">${formatNumber(event.eventos ?? 0)}</span>
            <span class="evd-kpi__label">Eventos</span>
          </div>
          <span class="evd-kpi__sep" aria-hidden="true"></span>
          <div class="evd-kpi">
            <span class="evd-kpi__value">${event.fases ?? phases.length}</span>
            <span class="evd-kpi__label">Fases</span>
          </div>
        </div>
      </section>

      <!-- PHASE CARD: header (titulo + Agregar fase) + stepper DS + body -->
      <div class="evd-phase-card">
        <div class="evd-phase-card__header">
          <h2 class="evd-section__title">Fases del juego</h2>
          <button class="naowee-btn naowee-btn--loud" type="button" data-action="add-phase">
            ${plusIcon()}<span>Agregar fase</span>
          </button>
        </div>
        <div class="evd-phase-stepper-wrap">
          ${renderPhaseStepper(phases, computeInitialActive(phases))}
        </div>

        <div class="evd-phase-body">
          <div class="evd-phase-body__head">
            <h3 class="evd-phase-body__title">Datos de la fase</h3>
            <div class="naowee-table-card__row-actions evd-actions" id="evdActions">
              <button class="naowee-btn naowee-btn--mute evd-actions__trigger" type="button" aria-haspopup="menu" aria-expanded="false">
                <span>Acciones</span>
                ${chevronDownIcon()}
              </button>
              <div class="naowee-table-card__row-actions-menu" role="menu">
                <button class="naowee-table-card__row-actions-item" type="button" role="menuitem" data-act="phase-edit">
                  <span class="naowee-table-card__row-actions-item-icon">${editIcon()}</span>
                  <span>Editar</span>
                </button>
                <button class="naowee-table-card__row-actions-item naowee-table-card__row-actions-item--danger" type="button" role="menuitem" data-act="phase-delete">
                  <span class="naowee-table-card__row-actions-item-icon">${trashIcon()}</span>
                  <span>Borrar fase</span>
                </button>
                <button class="naowee-table-card__row-actions-item" type="button" role="menuitem" data-act="phase-doc">
                  <span class="naowee-table-card__row-actions-item-icon">${docIcon()}</span>
                  <span>Crear proceso documental</span>
                </button>
              </div>
            </div>
          </div>

          <div class="evd-fields" id="evdPhaseFields">
            ${renderPhaseFields(phases[computeInitialActive(phases)])}
          </div>
        </div>
      </div>

    </div>
  `;
}

/* Determina qué step debe arrancar seleccionado: la fase con estado
   'active', y si no hay → primera 'pending', y si no hay → última 'done'. */
function computeInitialActive(phases) {
  const active = phases.findIndex(p => p.estado === 'active');
  if (active >= 0) return active;
  const pending = phases.findIndex(p => p.estado === 'pending');
  if (pending >= 0) return pending;
  return phases.length - 1;
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
      <span class="evd-field__value evd-field__value--icon">${calendarIcon()}<span>${escapeHtml(formatPhaseDate(phase.fechaInicio))}</span></span>
    </div>
    <div class="evd-field">
      <span class="evd-field__label">Fecha de cierre</span>
      <span class="evd-field__value evd-field__value--icon">${calendarIcon()}<span>${escapeHtml(formatPhaseDate(phase.fechaCierre))}</span></span>
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

  /* Phase stepper — click en cualquier step navega a su contenido */
  rootEl.querySelectorAll('#evdPhaseStepper .evd-phase-step').forEach((step) => {
    step.addEventListener('click', () => {
      const idx = Number(step.getAttribute('data-phase'));
      rootEl.querySelectorAll('#evdPhaseStepper .evd-phase-step').forEach((s) => s.classList.remove('is-selected'));
      step.classList.add('is-selected');
      const fields = rootEl.querySelector('#evdPhaseFields');
      if (fields && phases[idx]) fields.innerHTML = renderPhaseFields(phases[idx]);
    });
  });

  /* Acciones — patrón DS naowee-table-card__row-actions */
  const actions = rootEl.querySelector('#evdActions');
  const trigger = actions?.querySelector('.evd-actions__trigger');
  trigger?.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = actions.classList.toggle('is-open');
    trigger.setAttribute('aria-expanded', String(isOpen));
  });
  actions?.querySelectorAll('.naowee-table-card__row-actions-item').forEach((item) => {
    item.addEventListener('click', () => {
      actions.classList.remove('is-open');
      trigger?.setAttribute('aria-expanded', 'false');
      console.info('[evento-detalle] phase action:', item.getAttribute('data-act'));
    });
  });
  document.addEventListener('click', (e) => {
    if (actions && !actions.contains(e.target)) {
      actions.classList.remove('is-open');
      trigger?.setAttribute('aria-expanded', 'false');
    }
  });

  /* + Agregar fase → modal create */
  rootEl.querySelector('[data-action="add-phase"]')?.addEventListener('click', () => {
    openPhaseModal({
      mode: 'create',
      eventBounds: { start: event.start, end: event.end },
      onSave: (newPhase) => {
        const list = ensurePhaseArray(event.id, phases);
        list.push(newPhase);
        rerenderPhases(rootEl, event, list);
      }
    });
  });

  /* Editar fase / Borrar fase / Crear proceso documental */
  rootEl.querySelectorAll('[data-act="phase-edit"], [data-act="phase-delete"], [data-act="phase-doc"]').forEach((item) => {
    item.addEventListener('click', () => {
      const list = ensurePhaseArray(event.id, phases);
      const idx = getActivePhaseIndex(rootEl);
      const current = list[idx];
      const act = item.getAttribute('data-act');
      if (act === 'phase-edit' && current) {
        openPhaseModal({
          mode: 'edit',
          phase: current,
          eventBounds: { start: event.start, end: event.end },
          onSave: (updated) => {
            list[idx] = { ...current, ...updated };
            rerenderPhases(rootEl, event, list);
          }
        });
      }
      if (act === 'phase-delete' && current) {
        confirmDeletePhase(rootEl, event, list, idx, current);
      }
      if (act === 'phase-doc') {
        console.info('[evento-detalle] crear proceso documental — pendiente de gate documentación activa');
      }
    });
  });

  /* Stub actions sin modal aún */
  rootEl.querySelectorAll('[data-action="edit-event"], [data-action="catalog"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      console.info('[evento-detalle] action:', btn.dataset.action, 'event:', event.id);
    });
  });

}

/* ─── Mutación de fases (in-memory) ───────────────────────────────── */
/* Asegura que PHASES_BY_EVENT[id] sea un array editable. Si el evento
   estaba usando el fallback genérico, lo materializa para poder mutar. */
function ensurePhaseArray(eventId, current) {
  if (!PHASES_BY_EVENT[eventId]) PHASES_BY_EVENT[eventId] = [...current];
  return PHASES_BY_EVENT[eventId];
}

/* Re-render de la sección de fases sin reconstruir todo el shell. Mantiene
   el step actualmente seleccionado dentro de los límites del nuevo array. */
function rerenderPhases(rootEl, event, phases) {
  const card = rootEl.querySelector('.evd-phase-card');
  if (!card) return;
  const stepperWrap = card.querySelector('.evd-phase-stepper-wrap');
  const fields = card.querySelector('#evdPhaseFields');
  const activeIdx = Math.max(0, Math.min(getActivePhaseIndex(rootEl), phases.length - 1));
  stepperWrap.innerHTML = renderPhaseStepper(phases, activeIdx);
  if (phases[activeIdx]) fields.innerHTML = renderPhaseFields(phases[activeIdx]);
  /* Re-bind step click handlers — los DOM nodes son nuevos */
  rootEl.querySelectorAll('#evdPhaseStepper .evd-phase-step').forEach((step) => {
    step.addEventListener('click', () => {
      const idx = Number(step.getAttribute('data-phase'));
      rootEl.querySelectorAll('#evdPhaseStepper .evd-phase-step').forEach((s) => s.classList.remove('is-selected'));
      step.classList.add('is-selected');
      if (phases[idx]) fields.innerHTML = renderPhaseFields(phases[idx]);
    });
  });
}

/* Devuelve el índice del step actualmente seleccionado por el usuario.
   Prioriza .is-selected (click manual); si no, cae al --active del DS;
   si no hay activo, retorna el primer pending o 0. */
function getActivePhaseIndex(rootEl) {
  const selected = rootEl.querySelector('#evdPhaseStepper .evd-phase-step.is-selected');
  if (selected) return Number(selected.getAttribute('data-phase'));
  const active = rootEl.querySelector('#evdPhaseStepper .naowee-stepper__step--active');
  if (active) return Number(active.getAttribute('data-phase'));
  return 0;
}

/* Confirm destructivo + soft-delete + toast undo 20s — replica la
   misma UX del Eliminar evento pero scope-ado a fases. */
const PHASE_UNDO_MS = 20000;
function confirmDeletePhase(rootEl, event, list, idx, phase) {
  const overlay = document.createElement('div');
  overlay.className = 'naowee-modal-overlay open ev-delete-overlay';
  overlay.innerHTML = `
    <div class="naowee-modal" role="dialog" aria-modal="true">
      <div class="naowee-modal__header">
        <div class="naowee-modal__title-group">
          <h2 class="naowee-modal__title">Borrar fase</h2>
          <p class="naowee-modal__subtitle">Esta acci&oacute;n no se puede deshacer una vez transcurridos 20 segundos.</p>
        </div>
        <button type="button" class="naowee-modal__dismiss" aria-label="Cerrar" data-dlg-cancel>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="naowee-modal__body">
        <p>Est&aacute;s a punto de borrar la fase <strong>${escapeHtml(phase.nombre)}</strong> del evento <strong>${escapeHtml(event.name)}</strong>.</p>
        <p>Tendr&aacute;s 20 segundos para deshacer la acci&oacute;n desde la notificaci&oacute;n.</p>
      </div>
      <div class="naowee-modal__footer">
        <button type="button" class="naowee-btn naowee-btn--mute" data-dlg-cancel>Cancelar</button>
        <button type="button" class="naowee-btn naowee-btn--loud ev-btn--danger" data-dlg-confirm>Borrar fase</button>
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
    const removed = list.splice(idx, 1)[0];
    rerenderPhases(rootEl, event, list);
    showPhaseUndoToast(rootEl, event, list, idx, removed);
  });
}

function showPhaseUndoToast(rootEl, event, list, originalIdx, phase) {
  document.querySelectorAll('.ev-undo-toast').forEach((t) => t.remove());
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
        <span class="naowee-message__title">Fase eliminada exitosamente</span>
        <button type="button" class="naowee-message__dismiss" aria-label="Cerrar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <p class="naowee-message__text">${escapeHtml(phase.nombre)} fue removida de las fases. Tienes 20 segundos para deshacer esta acci&oacute;n.</p>
      <div class="ev-undo-toast__action">
        <button type="button" class="naowee-btn naowee-btn--quiet naowee-btn--small ev-undo-toast__undo">Deshacer</button>
      </div>
      <span class="ev-undo-toast__progress" aria-hidden="true"></span>
    </div>
  `;
  document.body.appendChild(wrap);
  requestAnimationFrame(() => wrap.classList.add('ev-undo-toast--show'));
  let timer = null;
  const dismiss = () => {
    wrap.classList.remove('ev-undo-toast--show');
    setTimeout(() => wrap.remove(), 220);
    if (timer) clearTimeout(timer);
  };
  wrap.querySelector('.naowee-message__dismiss').addEventListener('click', dismiss);
  wrap.querySelector('.ev-undo-toast__undo').addEventListener('click', () => {
    list.splice(Math.min(originalIdx, list.length), 0, phase);
    rerenderPhases(rootEl, event, list);
    dismiss();
  });
  timer = setTimeout(dismiss, PHASE_UNDO_MS);
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
