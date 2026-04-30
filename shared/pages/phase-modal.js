/**
 * Phase Modal — Agregar / Editar fase del evento.
 *
 * Replica los patrones del wizard de Crear evento (event-create-modal.js):
 *   - Datepicker DS naowee-datepicker--compact en popover (no native date)
 *   - Sedes: dropdown DS multiple con search interno + tags accent
 *   - Delegaciones: dropdown DS single-select
 *   - Footer con botones full-width (flex:1) — Cancelar (ghost/link) + CTA loud
 *
 * Spec visual: imagen del usuario (modal vertical compacto, ~520px ancho).
 *
 * API:
 *   openPhaseModal({ mode, phase, eventBounds, onSave, onCancel })
 *     - mode: 'create' | 'edit'
 *     - phase: data inicial (solo edit)
 *     - eventBounds: { start, end } en formato 'DD, mmm, AAAA' o 'DD/MM/AAAA'
 *       — se usan como hard min/max del datepicker
 *     - onSave(phaseData): callback con la fase normalizada al confirmar
 *     - onCancel(): opcional
 */
import { SEDES_CATALOG, DELEGACIONES_CATALOG } from './event-create-modal.js';

/* ─── Catálogos / locales ──────────────────────────────────────────── */
const MONTHS_SHORT = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const MONTHS_LONG  = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const WEEKDAYS     = ['L','M','X','J','V','S','D'];
const MES_FROM_ABBR = { ene:1, feb:2, mar:3, abr:4, may:5, jun:6, jul:7, ago:8, sep:9, oct:10, nov:11, dic:12 };

/* ─── Helpers de fecha ─────────────────────────────────────────────── */
/* "DD/MM/AAAA" o "DD, mmm, AAAA" → "AAAA-MM-DD" para el state interno. */
function toIsoDate(s) {
  if (!s || typeof s !== 'string') return '';
  const dmy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmy) return `${dmy[3]}-${String(dmy[2]).padStart(2,'0')}-${String(dmy[1]).padStart(2,'0')}`;
  const wordly = s.match(/^(\d{1,2}),\s*([a-zñáéíóú]{3,4}),?\s*(\d{4})$/i);
  if (wordly) {
    const m = MES_FROM_ABBR[wordly[2].toLowerCase().slice(0,3)];
    if (m) return `${wordly[3]}-${String(m).padStart(2,'0')}-${String(wordly[1]).padStart(2,'0')}`;
  }
  return '';
}
function toDmyDate(iso) {
  if (!iso) return '';
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : '';
}
/* "AAAA-MM-DD" → "DD mmm AAAA" para mostrar al usuario en el input readonly. */
function formatHumanFromIso(iso) {
  if (!iso) return '';
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return '';
  return `${Number(m[3])} ${MONTHS_SHORT[Number(m[2]) - 1]} ${m[1]}`;
}
function toIso(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function sameDay(a, b) {
  return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function escapeHtml(str) {
  return String(str ?? '')
    .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
    .replaceAll('"','&quot;').replaceAll("'",'&#39;');
}

/* ─── Render del modal ─────────────────────────────────────────────── */
export function openPhaseModal({ mode = 'create', phase = {}, eventBounds = {}, onSave, onCancel } = {}) {
  const state = {
    nombre:        phase.nombre        ?? '',
    descripcion:   phase.descripcion   ?? '',
    fechaInicioIso: toIsoDate(phase.fechaInicio),
    fechaCierreIso: toIsoDate(phase.fechaCierre),
    sedes:         Array.isArray(phase.sedes) ? [...phase.sedes] : [],
    sedesSearch:   '',
    delegaciones:  phase.delegaciones  ?? '',
    tieneCupos:    phase.tieneCupos === true || phase.tieneCupos === 'Sí',
    cargueDocs:    phase.cargueDocs === true || phase.necesitaDocumentos === 'Sí'
  };
  const errors = {};
  const eventMin = toIsoDate(eventBounds.start);
  const eventMax = toIsoDate(eventBounds.end);

  const overlay = document.createElement('div');
  overlay.className = 'naowee-modal-overlay open phase-modal-overlay';
  overlay.innerHTML = renderShell(state, errors, mode, eventMin, eventMax);
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  const close = () => {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    /* Eliminar cualquier popover de datepicker huérfano del body */
    document.querySelectorAll('.phase-modal__dp-popover').forEach(p => p.remove());
    setTimeout(() => overlay.remove(), 200);
  };

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) { close(); onCancel?.(); }
  });

  bindEvents(overlay, state, errors, { mode, eventMin, eventMax, onSave, onCancel, close });
}

function renderShell(s, errors, mode, eventMin, eventMax) {
  const title  = mode === 'edit' ? 'Editar fase' : 'Agregar fase';
  const ctaTxt = mode === 'edit' ? 'Guardar cambios' : 'Agregar fase';
  return `
    <div class="naowee-modal phase-modal" role="dialog" aria-modal="true" aria-labelledby="phaseModalTitle">
      <div class="naowee-modal__header">
        <div class="naowee-modal__title-group">
          <h2 id="phaseModalTitle" class="naowee-modal__title">${title}</h2>
        </div>
        <button type="button" class="naowee-modal__dismiss" aria-label="Cerrar" data-pm-cancel>${closeIcon()}</button>
      </div>

      <div class="naowee-modal__body phase-modal__body">
        ${textfield('nombre', 'Nombre de la fase', s.nombre, { required:true, placeholder:'Nombre de la fase', error:errors.nombre })}

        ${checkboxField('cupos', 'Cupos', s.tieneCupos)}

        ${textareaField('descripcion', 'Descripción de la fase', s.descripcion, 'Ingresa una descripción para esta fase')}

        <div class="phase-modal__row-2">
          ${dpField('fechaInicio', 'Fecha de inicio', s.fechaInicioIso, { required:true, error:errors.fechaInicio })}
          ${dpField('fechaCierre', 'Fecha de cierre', s.fechaCierreIso, { required:true, error:errors.fechaCierre })}
        </div>

        ${sedesDropdown(s.sedes, s.sedesSearch)}

        ${delegacionesDropdown(s.delegaciones, errors.delegaciones)}

        ${checkboxField('cargueDocs', 'Cargue de documentos', s.cargueDocs, { info:'Activa el cargue de documentación obligatoria para esta fase.' })}
      </div>

      <footer class="naowee-modal__footer phase-modal__footer">
        <button type="button" class="naowee-btn naowee-btn--link naowee-btn--medium" data-pm-cancel>Cancelar</button>
        <button type="button" class="naowee-btn naowee-btn--loud naowee-btn--medium" data-pm-confirm>${ctaTxt}</button>
      </footer>
    </div>
  `;
}

/* ─── Field renderers ──────────────────────────────────────────────── */
function textfield(name, label, value, { required, placeholder, error } = {}) {
  return `
    <div class="naowee-textfield ${error ? 'naowee-textfield--error' : ''}" data-field="${name}">
      <label class="naowee-textfield__label ${required ? 'naowee-textfield__label--required' : ''}">${escapeHtml(label)}</label>
      <div class="naowee-textfield__input-wrap">
        <input type="text" class="naowee-textfield__input" name="${name}" placeholder="${escapeHtml(placeholder || '')}" value="${escapeHtml(value)}" />
      </div>
      ${error ? `<p class="naowee-helper naowee-helper--negative">${escapeHtml(error)}</p>` : ''}
    </div>
  `;
}

function textareaField(name, label, value, placeholder) {
  return `
    <div class="naowee-textfield naowee-textfield--textarea" data-field="${name}">
      <label class="naowee-textfield__label">${escapeHtml(label)}</label>
      <div class="naowee-textfield__input-wrap">
        <textarea class="naowee-textfield__input" name="${name}" rows="3" placeholder="${escapeHtml(placeholder || '')}">${escapeHtml(value)}</textarea>
      </div>
    </div>
  `;
}

/* Datepicker DS — readonly text input + calendar icon suffix. El popup
   se inyecta al body en el wire (escapa el overflow del modal__body). */
function dpField(name, label, isoValue, { required, error } = {}) {
  const display = formatHumanFromIso(isoValue);
  return `
    <div class="naowee-textfield has-datepicker ${error ? 'naowee-textfield--error' : ''}" data-field="${name}" data-pm-datepicker>
      <label class="naowee-textfield__label ${required ? 'naowee-textfield__label--required' : ''}">${escapeHtml(label)}</label>
      <div class="naowee-textfield__input-wrap">
        <input type="text" class="naowee-textfield__input phase-modal__dp-input" name="${name}"
               readonly placeholder="dd mmm aaaa"
               value="${escapeHtml(display)}" data-iso="${escapeHtml(isoValue || '')}" />
        <span class="naowee-textfield__suffix">${calendarIcon()}</span>
      </div>
      ${error ? `<p class="naowee-helper naowee-helper--negative">${escapeHtml(error)}</p>` : ''}
    </div>
  `;
}

function checkboxField(name, label, checked, { info } = {}) {
  return `
    <label class="naowee-checkbox ${checked ? 'naowee-checkbox--checked' : ''} phase-modal__check" data-field="${name}">
      <input type="checkbox" class="naowee-checkbox__input" hidden ${checked ? 'checked' : ''} />
      <span class="naowee-checkbox__box">
        ${checked ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
      </span>
      <span class="naowee-checkbox__label">${escapeHtml(label)}</span>
      ${info ? `<span class="phase-modal__info" title="${escapeHtml(info)}" aria-label="${escapeHtml(info)}">${infoIcon()}</span>` : ''}
    </label>
  `;
}

/* Sedes — DS naowee-dropdown--multiple con tags accent + search interno.
   Replica el patrón de event-create-modal.js#renderPhaseSedesDropdown. */
function sedesDropdown(selected, search) {
  return `
    <div class="naowee-dropdown naowee-dropdown--multiple phase-modal__dd" data-dd="sedes">
      <label class="naowee-dropdown__label">Sedes</label>
      <div class="naowee-dropdown__trigger" tabindex="0">
        ${sedesTriggerContent(selected)}
        <div class="naowee-dropdown__controls">
          <span class="naowee-dropdown__chevron">${chevronDown()}</span>
        </div>
      </div>
      <div class="naowee-dropdown__menu phase-modal__dd-menu" role="listbox">
        <div class="phase-modal__dd-search">
          <span class="phase-modal__dd-search-icon">${searchIcon()}</span>
          <input type="text" class="phase-modal__dd-search-input" placeholder="Buscar..." data-sedes-search value="${escapeHtml(search || '')}" />
        </div>
        <div class="phase-modal__dd-list" data-sedes-list>
          ${sedesOptions(selected, search || '')}
        </div>
      </div>
    </div>
  `;
}

function sedesTriggerContent(sedes) {
  if (!sedes || sedes.length === 0) {
    return `<span class="naowee-dropdown__placeholder">Seleccionar sede(s)</span>`;
  }
  if (sedes.length > 3) {
    return `
      <span class="naowee-dropdown__tags">
        <span class="naowee-tag naowee-tag--accent naowee-tag--small">
          ${sedes.length} sedes seleccionadas
          <span class="naowee-tag__active-area" data-remove-all-sedes>
            <span class="naowee-tag__close">${closeIconSmall()}</span>
          </span>
        </span>
      </span>
    `;
  }
  return `
    <span class="naowee-dropdown__tags">
      ${sedes.map(s => `
        <span class="naowee-tag naowee-tag--accent naowee-tag--small">
          ${escapeHtml(s)}
          <span class="naowee-tag__active-area" data-remove-sede="${escapeHtml(s)}">
            <span class="naowee-tag__close">${closeIconSmall()}</span>
          </span>
        </span>
      `).join('')}
    </span>
  `;
}

function sedesOptions(selected, search) {
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const q = norm((search || '').trim());
  const filtered = q ? SEDES_CATALOG.filter(s => norm(s).includes(q)) : SEDES_CATALOG;
  if (!filtered.length) {
    return `<div class="phase-modal__dd-empty">No se encontraron sedes</div>`;
  }
  return filtered.map(s => {
    const isSel = selected.includes(s);
    return `
      <div class="naowee-dropdown__option ${isSel ? 'naowee-dropdown__option--selected' : ''}" data-sede="${escapeHtml(s)}">
        <span class="naowee-dropdown__option-check">${isSel ? checkIcon() : ''}</span>
        <span>${escapeHtml(s)}</span>
      </div>
    `;
  }).join('');
}

function delegacionesDropdown(selected, error) {
  return `
    <div class="naowee-dropdown ${error ? 'naowee-dropdown--error' : ''} phase-modal__dd" data-dd="delegaciones">
      <label class="naowee-dropdown__label naowee-dropdown__label--required">Catálogo global de delegaciones</label>
      <div class="naowee-dropdown__trigger" tabindex="0">
        <span class="${selected ? 'naowee-dropdown__value' : 'naowee-dropdown__placeholder'}">${escapeHtml(selected || 'Seleccionar...')}</span>
        <div class="naowee-dropdown__controls">
          <span class="naowee-dropdown__chevron">${chevronDown()}</span>
        </div>
      </div>
      <div class="naowee-dropdown__menu phase-modal__dd-menu">
        <div class="phase-modal__dd-list">
          ${DELEGACIONES_CATALOG.map(d => `
            <div class="naowee-dropdown__option ${selected === d ? 'naowee-dropdown__option--selected' : ''}" data-deleg="${escapeHtml(d)}">
              <span class="naowee-dropdown__option-check">${selected === d ? checkIcon() : ''}</span>
              <span>${escapeHtml(d)}</span>
            </div>
          `).join('')}
        </div>
      </div>
      ${error ? `<p class="naowee-helper naowee-helper--negative">${escapeHtml(error)}</p>` : ''}
    </div>
  `;
}

/* ─── Bindings ─────────────────────────────────────────────────────── */
function bindEvents(overlay, state, errors, ctx) {
  /* Cancelar / dismiss */
  overlay.querySelectorAll('[data-pm-cancel]').forEach((b) => {
    b.addEventListener('click', () => { ctx.close(); ctx.onCancel?.(); });
  });

  /* Texto / textarea */
  overlay.querySelectorAll('input[name="nombre"]').forEach((el) => {
    el.addEventListener('input', () => { state.nombre = el.value; });
  });
  overlay.querySelectorAll('textarea[name="descripcion"]').forEach((el) => {
    el.addEventListener('input', () => { state.descripcion = el.value; });
  });

  /* Checkboxes */
  overlay.querySelectorAll('.phase-modal__check').forEach((label) => {
    label.addEventListener('click', (e) => {
      e.preventDefault();
      const field = label.getAttribute('data-field');
      if (field === 'cupos')      state.tieneCupos = !state.tieneCupos;
      if (field === 'cargueDocs') state.cargueDocs = !state.cargueDocs;
      const checked = field === 'cupos' ? state.tieneCupos : state.cargueDocs;
      label.classList.toggle('naowee-checkbox--checked', checked);
      const box = label.querySelector('.naowee-checkbox__box');
      box.innerHTML = checked
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
        : '';
    });
  });

  /* Datepickers (DS naowee-datepicker en popover) */
  overlay.querySelectorAll('[data-pm-datepicker]').forEach((field) => {
    wirePmDatepicker(field, overlay, state, errors, ctx);
  });

  /* Sedes (multi-select con search) */
  wireSedesDropdown(overlay, state, errors);

  /* Delegaciones (single-select) */
  wireDelegacionesDropdown(overlay, state, errors);

  /* Click-out cierra dropdowns abiertos del modal (no afecta a popovers
     de datepicker — tienen su propio handler via document). */
  overlay.addEventListener('click', (e) => {
    if (!e.target.closest('.naowee-dropdown')) {
      overlay.querySelectorAll('.phase-modal__dd.is-open').forEach((o) => o.classList.remove('is-open'));
    }
  });

  /* Confirm */
  overlay.querySelector('[data-pm-confirm]').addEventListener('click', () => {
    const newErrors = validate(state, ctx.eventMin, ctx.eventMax);
    if (Object.keys(newErrors).length) {
      Object.assign(errors, newErrors);
      paintErrors(overlay, errors);
      return;
    }
    ctx.onSave?.(serializePhase(state));
    ctx.close();
  });
}

function wireSedesDropdown(overlay, state, errors) {
  const dd = overlay.querySelector('[data-dd="sedes"]');
  if (!dd) return;
  const trigger = dd.querySelector('.naowee-dropdown__trigger');
  const menu    = dd.querySelector('.phase-modal__dd-menu');
  const list    = dd.querySelector('[data-sedes-list]');
  const search  = dd.querySelector('[data-sedes-search]');

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const willOpen = !dd.classList.contains('is-open');
    overlay.querySelectorAll('.phase-modal__dd.is-open').forEach(o => o.classList.remove('is-open'));
    if (willOpen) {
      dd.classList.add('is-open');
      setTimeout(() => search.focus(), 50);
    }
  });
  /* Search adentro del menu */
  search.addEventListener('input', () => {
    state.sedesSearch = search.value;
    list.innerHTML = sedesOptions(state.sedes, state.sedesSearch);
  });
  /* Click en option (delegado) — toggle selection */
  list.addEventListener('click', (e) => {
    const opt = e.target.closest('[data-sede]');
    if (!opt) return;
    e.stopPropagation();
    const value = opt.getAttribute('data-sede');
    if (state.sedes.includes(value)) state.sedes = state.sedes.filter(v => v !== value);
    else state.sedes.push(value);
    /* Re-render option list (preserva search) y trigger content */
    list.innerHTML = sedesOptions(state.sedes, state.sedesSearch);
    repaintSedesTrigger(dd, state);
  });
  /* Tag close (remove individual / remove all) */
  trigger.addEventListener('click', (e) => {
    const removeOne = e.target.closest('[data-remove-sede]');
    const removeAll = e.target.closest('[data-remove-all-sedes]');
    if (removeOne) {
      e.stopPropagation();
      const value = removeOne.getAttribute('data-remove-sede');
      state.sedes = state.sedes.filter(v => v !== value);
      list.innerHTML = sedesOptions(state.sedes, state.sedesSearch);
      repaintSedesTrigger(dd, state);
    } else if (removeAll) {
      e.stopPropagation();
      state.sedes = [];
      list.innerHTML = sedesOptions(state.sedes, state.sedesSearch);
      repaintSedesTrigger(dd, state);
    }
  }, true);
}

function repaintSedesTrigger(dd, state) {
  const trigger = dd.querySelector('.naowee-dropdown__trigger');
  /* Reemplazar el contenido del trigger preservando el chevron control */
  const oldContent = trigger.querySelector('.naowee-dropdown__placeholder, .naowee-dropdown__tags');
  if (oldContent) oldContent.remove();
  trigger.insertAdjacentHTML('afterbegin', sedesTriggerContent(state.sedes));
}

function wireDelegacionesDropdown(overlay, state, errors) {
  const dd = overlay.querySelector('[data-dd="delegaciones"]');
  if (!dd) return;
  const trigger = dd.querySelector('.naowee-dropdown__trigger');
  const menu    = dd.querySelector('.phase-modal__dd-menu');

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const willOpen = !dd.classList.contains('is-open');
    overlay.querySelectorAll('.phase-modal__dd.is-open').forEach(o => o.classList.remove('is-open'));
    if (willOpen) dd.classList.add('is-open');
  });
  menu.addEventListener('click', (e) => {
    const opt = e.target.closest('[data-deleg]');
    if (!opt) return;
    e.stopPropagation();
    state.delegaciones = opt.getAttribute('data-deleg');
    menu.querySelectorAll('.naowee-dropdown__option').forEach(o => {
      const sel = o.getAttribute('data-deleg') === state.delegaciones;
      o.classList.toggle('naowee-dropdown__option--selected', sel);
      const check = o.querySelector('.naowee-dropdown__option-check');
      if (check) check.innerHTML = sel ? checkIcon() : '';
    });
    const valEl = trigger.querySelector('.naowee-dropdown__placeholder, .naowee-dropdown__value');
    if (valEl) {
      valEl.className = 'naowee-dropdown__value';
      valEl.textContent = state.delegaciones;
    }
    dd.classList.remove('is-open');
    dd.classList.remove('naowee-dropdown--error');
    dd.querySelector('.naowee-helper--negative')?.remove();
    delete errors.delegaciones;
  });
}

/* ─── Datepicker compacto (DS naowee-datepicker en popover) ────────── */
function wirePmDatepicker(field, overlay, state, errors, ctx) {
  const input = field.querySelector('input');
  const fieldName = field.getAttribute('data-field');

  /* Crear popover (uno por field). Se inyecta al body para que escape
     el clip del modal__body. position:fixed reposicionado al abrir. */
  const pop = document.createElement('div');
  pop.className = 'naowee-datepicker naowee-datepicker--compact phase-modal__dp-popover';
  document.body.appendChild(pop);

  let viewYear, viewMonth;
  let selected = null;

  const refreshFromState = () => {
    const iso = state[fieldName + 'Iso'];
    if (iso) {
      const [y, m, d] = iso.split('-').map(Number);
      selected = new Date(y, m - 1, d);
      viewYear = y; viewMonth = m - 1;
      return;
    }
    selected = null;
    /* Sin selección: arrancamos en el mes con días válidos para no
       abrir un calendario completamente disabled. Prioridad:
         1) fechaInicioIso ya seleccionada (cuando estamos en cierre)
         2) eventMin (inicio del evento)
         3) hoy */
    let baseIso = null;
    if (fieldName === 'fechaCierre' && state.fechaInicioIso) baseIso = state.fechaInicioIso;
    else if (ctx.eventMin) baseIso = ctx.eventMin;
    if (baseIso) {
      const [y, m] = baseIso.split('-').map(Number);
      viewYear = y; viewMonth = m - 1;
    } else {
      const today = new Date();
      viewYear = today.getFullYear();
      viewMonth = today.getMonth();
    }
  };
  refreshFromState();

  function computeBounds() {
    /* Hard min/max:
       - eventMin/eventMax → fechas del evento (siempre)
       - fechaInicio (si existe y este es fechaCierre) → no permitir < inicio */
    const parseIso = (iso) => {
      if (!iso) return null;
      const [y, m, d] = iso.split('-').map(Number);
      return new Date(y, m - 1, d);
    };
    let pairMin = null, pairMax = null;
    if (fieldName === 'fechaCierre' && state.fechaInicioIso) {
      pairMin = parseIso(state.fechaInicioIso);
    }
    if (fieldName === 'fechaInicio' && state.fechaCierreIso) {
      pairMax = parseIso(state.fechaCierreIso);
    }
    return {
      outerMin: parseIso(ctx.eventMin),
      outerMax: parseIso(ctx.eventMax),
      pairMin, pairMax
    };
  }

  function render() {
    pop.innerHTML = `
      <div class="naowee-datepicker__calendar">
        <div class="naowee-datepicker__header">
          <div class="naowee-datepicker__month-selector">
            <span class="naowee-datepicker__month">${MONTHS_LONG[viewMonth]} ${viewYear}</span>
          </div>
          <div class="naowee-datepicker__controls">
            <button class="naowee-datepicker__nav" data-nav="-1" type="button" aria-label="Mes anterior">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button class="naowee-datepicker__nav" data-nav="1" type="button" aria-label="Mes siguiente">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>
        <div class="naowee-datepicker__content">
          <div class="naowee-datepicker__week">
            ${WEEKDAYS.map(w => `<span class="naowee-datepicker__weekday">${w}</span>`).join('')}
          </div>
          <div data-weeks></div>
        </div>
      </div>
    `;
    const weeksWrap = pop.querySelector('[data-weeks]');
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const startWeekday = (firstOfMonth.getDay() + 6) % 7;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrev = new Date(viewYear, viewMonth, 0).getDate();
    const today = new Date();
    const cells = [];
    for (let i = startWeekday - 1; i >= 0; i--) {
      cells.push({ day: daysInPrev - i, muted: true, d: new Date(viewYear, viewMonth - 1, daysInPrev - i) });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push({ day: i, muted: false, d: new Date(viewYear, viewMonth, i) });
    }
    while (cells.length % 7 !== 0) {
      const d = cells.length - (startWeekday + daysInMonth) + 1;
      cells.push({ day: d, muted: true, d: new Date(viewYear, viewMonth + 1, d) });
    }
    const { outerMin, outerMax, pairMin, pairMax } = computeBounds();
    const weeks = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    weeks.forEach(week => {
      const weekEl = document.createElement('div');
      weekEl.className = 'naowee-datepicker__week';
      week.forEach(c => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'naowee-datepicker__day';
        if (c.muted) b.classList.add('naowee-datepicker__day--other-month');
        if (sameDay(c.d, today)) b.classList.add('naowee-datepicker__day--today');
        if (selected && sameDay(c.d, selected)) b.classList.add('naowee-datepicker__day--selected');
        const outOfRange = (
          (outerMin && c.d < outerMin) ||
          (outerMax && c.d > outerMax) ||
          (pairMin && c.d < pairMin) ||
          (pairMax && c.d > pairMax)
        );
        if (outOfRange) {
          b.classList.add('naowee-datepicker__day--disabled');
          b.disabled = true;
        }
        b.textContent = c.day;
        b.addEventListener('click', (e) => {
          e.stopPropagation();
          if (outOfRange) return;
          selected = c.d;
          viewYear = c.d.getFullYear();
          viewMonth = c.d.getMonth();
          const iso = toIso(c.d);
          input.value = formatHumanFromIso(iso);
          input.dataset.iso = iso;
          state[fieldName + 'Iso'] = iso;
          /* Limpiar error visual del field */
          field.classList.remove('naowee-textfield--error');
          field.querySelector('.naowee-helper--negative')?.remove();
          delete errors[fieldName];
          pop.classList.remove('naowee-datepicker--open');
        });
        weekEl.appendChild(b);
      });
      weeksWrap.appendChild(weekEl);
    });
    pop.querySelectorAll('[data-nav]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const dir = Number(btn.getAttribute('data-nav'));
        viewMonth += dir;
        if (viewMonth < 0)  { viewMonth = 11; viewYear--; }
        if (viewMonth > 11) { viewMonth = 0;  viewYear++; }
        render();
      });
    });
  }

  function position() {
    const r = field.getBoundingClientRect();
    pop.style.position = 'fixed';
    pop.style.top  = `${r.bottom + 6}px`;
    pop.style.left = `${r.left}px`;
    pop.style.zIndex = '1200';
  }

  field.addEventListener('click', (e) => {
    e.stopPropagation();
    /* Cerrar otros popovers */
    document.querySelectorAll('.phase-modal__dp-popover.naowee-datepicker--open').forEach(p => {
      if (p !== pop) p.classList.remove('naowee-datepicker--open');
    });
    /* Refresh state in case the pair date was just set */
    refreshFromState();
    position();
    render();
    pop.classList.add('naowee-datepicker--open');
  });
  document.addEventListener('click', (e) => {
    if (!pop.contains(e.target) && !field.contains(e.target)) {
      pop.classList.remove('naowee-datepicker--open');
    }
  });
  window.addEventListener('resize', position);
  window.addEventListener('scroll', position, true);
}

/* ─── Validación ──────────────────────────────────────────────────── */
function validate(s, eventMin, eventMax) {
  const errs = {};
  if (!s.nombre.trim())       errs.nombre = 'Nombre obligatorio';
  if (!s.fechaInicioIso)      errs.fechaInicio = 'Selecciona fecha';
  if (!s.fechaCierreIso)      errs.fechaCierre = 'Selecciona fecha';
  if (s.fechaInicioIso && s.fechaCierreIso && s.fechaCierreIso < s.fechaInicioIso) {
    errs.fechaCierre = 'No puede ser anterior al inicio';
  }
  if (eventMin && s.fechaInicioIso && s.fechaInicioIso < eventMin) {
    errs.fechaInicio = 'Anterior al inicio del evento';
  }
  if (eventMax && s.fechaCierreIso && s.fechaCierreIso > eventMax) {
    errs.fechaCierre = 'Posterior al fin del evento';
  }
  if (!s.delegaciones) errs.delegaciones = 'Selecciona un nivel';
  return errs;
}

function paintErrors(overlay, errors) {
  ['nombre','fechaInicio','fechaCierre'].forEach((f) => {
    const wrap = overlay.querySelector(`[data-field="${f}"]`);
    if (!wrap) return;
    wrap.classList.toggle('naowee-textfield--error', !!errors[f]);
    wrap.querySelector('.naowee-helper--negative')?.remove();
    if (errors[f]) {
      const p = document.createElement('p');
      p.className = 'naowee-helper naowee-helper--negative';
      p.textContent = errors[f];
      wrap.appendChild(p);
    }
  });
  const ddDel = overlay.querySelector('[data-dd="delegaciones"]');
  if (ddDel) {
    ddDel.classList.toggle('naowee-dropdown--error', !!errors.delegaciones);
    ddDel.querySelector('.naowee-helper--negative')?.remove();
    if (errors.delegaciones) {
      const p = document.createElement('p');
      p.className = 'naowee-helper naowee-helper--negative';
      p.textContent = errors.delegaciones;
      ddDel.appendChild(p);
    }
  }
}

function serializePhase(s) {
  return {
    nombre: s.nombre.trim(),
    descripcion: s.descripcion.trim(),
    fechaInicio: toDmyDate(s.fechaInicioIso),
    fechaCierre: toDmyDate(s.fechaCierreIso),
    sedes: [...s.sedes],
    delegaciones: s.delegaciones,
    tieneCupos: s.tieneCupos ? 'Sí' : 'No',
    tieneInscripciones: 'No',
    necesitaDocumentos: s.cargueDocs ? 'Sí' : 'No',
    cargueDocs: s.cargueDocs,
    estado: 'pending'
  };
}

/* ─── Iconos inline ───────────────────────────────────────────────── */
function closeIcon()      { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'; }
function closeIconSmall() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" width="12" height="12"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'; }
function chevronDown()    { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><polyline points="6 9 12 15 18 9"/></svg>'; }
function checkIcon()      { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>'; }
function calendarIcon()   { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><rect x="3" y="5" width="18" height="16" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="16" y1="3" x2="16" y2="7"/></svg>'; }
function searchIcon()     { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>'; }
function infoIcon()       { return '<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm.5 15h-1v-6h1zm0-8h-1V8h1z"/></svg>'; }
