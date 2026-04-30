/**
 * Create Event Modal — wizard de 4 pasos.
 * Refactorizado para usar componentes del DS oficial:
 *   - naowee-modal-overlay + naowee-modal (con --fixed-header --fixed-footer)
 *   - naowee-modal__header / __title-group / __title / __subtitle / __dismiss
 *   - naowee-stepper + __step + __step--active + __number + __label + __connector
 *   - naowee-modal__body
 *   - naowee-textfield + __label (--required) + __input-wrap + __input + __suffix
 *   - naowee-textfield--textarea (para descripción)
 *   - naowee-textfield--error / naowee-dropdown--error  (estado validación)
 *   - naowee-helper--negative (mensaje de error obligatorio)
 *   - naowee-dropdown (para categoría)
 *   - naowee-input-stepper (para "¿cuántas fases tiene?")
 *   - naowee-btn (mute/loud) en el footer
 *
 * Validación lazy: los helpers "Este campo es obligatorio" solo aparecen
 * cuando el usuario intenta avanzar (botón Siguiente) sin completar campos
 * required. Idéntico al pattern de naowee-test-incentivos/programa-wizard.
 *
 * Datepicker: custom calendar popup con position:fixed para escapar el
 * overflow del modal__body. Mismo pattern que programa-wizard.js.
 */

const TOTAL_STEPS = 4;
const STEP_LABELS = ['Datos básicos', 'Cupos', 'Documentos', 'Resumen'];

const MONTHS_LONG  = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const MONTHS_SHORT = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const WEEKDAYS     = ['L','M','X','J','V','S','D'];

const CATEGORIES = ['Infantil', 'Prejuvenil', 'Juvenil', 'Sub-23', 'Mayores', 'Master', 'Veteranos'];

const _modalState = {
  el: null,
  step: 1,
  /* errores por campo — solo se setean tras submit attempt fallido */
  errors: {},
  data: {
    name: '',
    description: '',
    startDate: '',  /* ISO yyyy-mm-dd */
    endDate: '',
    categories: [], /* multi-select array */
    phases: 1,
    inscStart: '',  /* auto-igual a startDate, locked */
    inscEnd: ''
  }
};

export function openCreateEventModal() {
  if (_modalState.el) return;
  _modalState.step = 1;
  _modalState.errors = {};
  _modalState.data = {
    name:'', description:'', startDate:'', endDate:'',
    categories:[], phases:1, inscStart:'', inscEnd:''
  };

  const overlay = document.createElement('div');
  overlay.className = 'naowee-modal-overlay open ev-modal-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.innerHTML = renderModal();
  document.body.appendChild(overlay);
  _modalState.el = overlay;

  bindModalEvents();
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  if (!_modalState.el) return;
  _modalState.el.classList.add('ev-modal-closing');
  setTimeout(() => {
    _modalState.el?.remove();
    _modalState.el = null;
    /* Limpiar cualquier popup de datepicker huérfano que haya quedado
       inyectado al body (el popup vive fuera del overlay para escapar el
       overflow del modal, así que no se elimina con .remove() del overlay) */
    document.querySelectorAll('.naowee-datepicker--popover').forEach(p => p.remove());
    document.body.style.overflow = '';
  }, 180);
}

function repaint() {
  if (!_modalState.el) return;
  /* Eliminar popups de datepicker antes de re-renderizar — innerHTML del
     overlay no los limpia porque viven adjuntos al body. */
  document.querySelectorAll('.ev-dp').forEach(p => p.remove());
  _modalState.el.innerHTML = renderModal();
  bindModalEvents();
}

/* ─── Validación por paso ──────────────────────────────────────────── */
function validateStep(step) {
  const errors = {};
  const d = _modalState.data;
  if (step === 1) {
    if (!d.name.trim())              errors.name = true;
    if (!d.startDate)                errors.startDate = true;
    if (!d.endDate)                  errors.endDate = true;
    if (!d.categories || !d.categories.length) errors.categories = true;
    if (!d.inscEnd)                  errors.inscEnd = true;

    /* Rango "event": fin >= inicio */
    if (d.startDate && d.endDate && d.endDate < d.startDate) {
      errors.endDate = 'La fecha final no puede ser anterior a la fecha de inicio.';
    }
    /* Rango "inscriptions": fin >= inicio */
    if (d.inscStart && d.inscEnd && d.inscEnd < d.inscStart) {
      errors.inscEnd = 'La fecha fin de inscripciones no puede ser anterior a la fecha de inicio.';
    }
  }
  return errors;
}

/* ─── Modal shell (DS components) ─────────────────────────────────── */
function renderModal() {
  return `
    <div class="naowee-modal naowee-modal--fixed-header naowee-modal--fixed-footer ev-modal" role="document">
      <header class="naowee-modal__header">
        <div class="naowee-modal__title-group">
          <h2 class="naowee-modal__title">Crear nuevo evento</h2>
          <div class="naowee-modal__subtitle">Completá los datos del evento. Podés guardar y retomar después.</div>
        </div>
        <button class="naowee-modal__dismiss" type="button" data-act="close" aria-label="Cerrar">
          ${closeIcon()}
        </button>
      </header>

      ${renderStepper()}

      <div class="naowee-modal__body ev-modal__body">
        ${renderStep(_modalState.step)}
      </div>

      <footer class="naowee-modal__footer ev-modal__footer">
        <button class="naowee-btn naowee-btn--mute naowee-btn--medium" type="button" data-act="${_modalState.step === 1 ? 'close' : 'prev'}">
          ${_modalState.step === 1 ? 'Cancelar' : 'Anterior'}
        </button>
        <button class="naowee-btn naowee-btn--loud naowee-btn--medium" type="button" data-act="${_modalState.step === TOTAL_STEPS ? 'finish' : 'next'}">
          ${_modalState.step === TOTAL_STEPS ? 'Crear evento' : 'Siguiente'}
        </button>
      </footer>
    </div>
  `;
}

function renderStepper() {
  return `
    <ol class="naowee-stepper naowee-stepper--pulse naowee-stepper--distributed ev-modal__stepper">
      ${STEP_LABELS.map((label, i) => {
        const stepNum = i + 1;
        const cls = ['naowee-stepper__step'];
        if (stepNum === _modalState.step) cls.push('naowee-stepper__step--active');
        if (stepNum < _modalState.step)  cls.push('naowee-stepper__step--done');
        const connectorCls = stepNum < _modalState.step
          ? 'naowee-stepper__connector naowee-stepper__connector--done'
          : 'naowee-stepper__connector';
        return `
          <li class="${cls.join(' ')}" data-step="${stepNum}">
            <span class="naowee-stepper__number">${stepNum}</span>
            <span class="naowee-stepper__label">${label}</span>
            ${stepNum < TOTAL_STEPS ? `<span class="${connectorCls}"></span>` : ''}
          </li>
        `;
      }).join('')}
    </ol>
  `;
}

/* ─── Steps ────────────────────────────────────────────────────────── */
function renderStep(step) {
  if (step === 1) return renderStep1();
  if (step === 2) return renderStepPlaceholder('Cupos', 'Configurá los cupos por categoría y disciplina.');
  if (step === 3) return renderStepPlaceholder('Documentos', 'Adjuntá los documentos requeridos para los participantes.');
  if (step === 4) return renderStepPlaceholder('Resumen', 'Revisá la información del evento antes de crearlo.');
  return '';
}

function renderStep1() {
  const d = _modalState.data;
  const e = _modalState.errors;
  return `
    <div class="ev-form">
      <!-- Nombre del evento (textfield required) -->
      <div class="naowee-textfield ${e.name ? 'naowee-textfield--error' : ''}" data-field-wrap="name">
        <label class="naowee-textfield__label naowee-textfield__label--required" for="evName">
          Nombre del evento
        </label>
        <div class="naowee-textfield__input-wrap">
          <input class="naowee-textfield__input" type="text" id="evName"
                 placeholder="Nombre del evento"
                 value="${escapeHtml(d.name)}"
                 data-field="name"
                 maxlength="120" />
        </div>
        ${e.name ? errorHelper() : ''}
      </div>

      <!-- Descripción del evento (textarea) -->
      <div class="naowee-textfield naowee-textfield--textarea">
        <label class="naowee-textfield__label" for="evDescription">Descripción del evento</label>
        <div class="naowee-textfield__input-wrap">
          <textarea class="naowee-textfield__input" id="evDescription"
                    rows="3" maxlength="300"
                    data-field="description">${escapeHtml(d.description)}</textarea>
        </div>
      </div>

      <!-- Fechas inicio/fin (custom DS datepicker, rango "event") -->
      <div class="ev-grid-2">
        ${renderDatepicker('evStartDate', 'Fecha de inicio del evento', true, d.startDate, 'startDate', e.startDate, { range:'from', rangeName:'event' })}
        ${renderDatepicker('evEndDate',   'Fecha final del evento',     true, d.endDate,   'endDate',   e.endDate,   { range:'to',   rangeName:'event' })}
      </div>

      <!-- Sección CATEGORÍAS -->
      <div class="ev-form-section">CATEGORÍAS</div>

      <!-- Categoría (dropdown DS multi-select con tags + option-checks) -->
      <div class="naowee-dropdown naowee-dropdown--multiple ${e.categories ? 'naowee-dropdown--error' : ''}"
           id="evCategoryDD"
           data-field-wrap="categories">
        <label class="naowee-dropdown__label naowee-dropdown__label--required">Categoría</label>
        <div class="naowee-dropdown__trigger" tabindex="0">
          ${renderCategoryTriggerContent(d.categories)}
          <div class="naowee-dropdown__controls">
            <span class="naowee-dropdown__chevron">${chevronDown()}</span>
          </div>
        </div>
        <div class="naowee-dropdown__menu" role="listbox">
          ${CATEGORIES.map((c) => {
            const isSel = d.categories.includes(c);
            return `
              <div class="naowee-dropdown__option ${isSel ? 'naowee-dropdown__option--selected' : ''}"
                   data-val="${c}">
                <span class="naowee-dropdown__option-check">${isSel ? checkIcon() : ''}</span>
                <span>${c}</span>
              </div>
            `;
          }).join('')}
        </div>
        ${e.categories ? errorHelper() : ''}
      </div>

      <!-- Cuántas fases tiene? (input-stepper DS) -->
      <div class="naowee-input-stepper" id="evPhasesStepper">
        <label class="naowee-textfield__label">¿Cuántas fases tiene?</label>
        <div class="naowee-input-stepper__content">
          <div class="naowee-input-stepper__input">
            <button type="button" class="naowee-input-stepper__btn"
                    data-counter="dec"
                    ${d.phases <= 1 ? 'disabled' : ''}>${minusIcon()}</button>
            <span class="naowee-input-stepper__value" id="evPhasesValue">${d.phases}</span>
            <button type="button" class="naowee-input-stepper__btn"
                    data-counter="inc">${plusIcon()}</button>
          </div>
        </div>
      </div>

      <!-- Sección INSCRIPCIONES -->
      <div class="ev-form-section">INSCRIPCIONES</div>

      <!-- Fechas inscripciones (rango "inscriptions").
           inscStart está LOCKED al startDate del evento — se auto-rellena
           y el field se deshabilita. Si el usuario quiere cambiar la fecha
           de inicio de inscripciones, debe primero modificar la fecha de
           inicio del evento. -->
      <div class="ev-grid-2">
        ${renderDatepicker('evInscStart', 'Fecha inicio de inscripciones', false, d.startDate, 'inscStart', false,    { range:'from', rangeName:'inscriptions', locked:true, lockHint:'Igual a la fecha de inicio del evento' })}
        ${renderDatepicker('evInscEnd',   'Fecha fin de inscripciones',    true,  d.inscEnd,   'inscEnd',   e.inscEnd, { range:'to',   rangeName:'inscriptions' })}
      </div>
    </div>
  `;
}

/* Trigger content del dropdown de categorías:
   - Si no hay seleccionadas → placeholder
   - Si hay seleccionadas → tags pill (DS naowee-tag --accent --small) con
     active-area + close button. Click en X quita la categoría sin abrir
     el menú. */
function renderCategoryTriggerContent(categories) {
  if (!categories || categories.length === 0) {
    return `<span class="naowee-dropdown__placeholder">Seleccioná una o más categorías</span>`;
  }
  return `
    <span class="naowee-dropdown__tags">
      ${categories.map((c) => `
        <span class="naowee-tag naowee-tag--accent naowee-tag--small" data-tag="${c}">
          ${c}
          <span class="naowee-tag__active-area" data-remove-tag="${c}">
            <span class="naowee-tag__close">${closeIconSmall()}</span>
          </span>
        </span>
      `).join('')}
    </span>
  `;
}

/* Helper de error "Este campo es obligatorio" — DS naowee-helper--negative
   con badge rojo + ícono de exclamación (mismo SVG que programa-wizard). */
function errorHelper(text) {
  return `
    <div class="naowee-helper naowee-helper--negative">
      <div class="naowee-helper__badge">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <div class="naowee-helper__text">${text || 'Este campo es obligatorio'}</div>
    </div>
  `;
}

/* Helper-only HTML fragment (sin wrapper) — para inyectar dentro de un
   field existente cuando aplicamos error sin re-render. */
function errorHelperInner(text) {
  return `
    <div class="naowee-helper__badge">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    </div>
    <div class="naowee-helper__text">${text || 'Este campo es obligatorio'}</div>
  `;
}

/* Date picker — input read-only con popup custom (DS-styled).
   Display: dd MMM yyyy (ej. "15 may 2026"). Storage: ISO yyyy-mm-dd.
   El popup se inyecta al body con position:fixed para escapar el modal scroll.

   Rango opcional vía rangeOpts:
     { range:'from'|'to', rangeName:'event'|'inscriptions' }
   El field "to" usa el "from" como minDate. Si después de elegir un "from"
   el "to" queda inválido, se limpia automáticamente con flash visual. */
function renderDatepicker(id, label, required, isoValue, fieldName, hasError, rangeOpts) {
  const display = isoValue ? formatHumanFromIso(isoValue) : '';
  const rangeAttrs = rangeOpts
    ? `data-range="${rangeOpts.range}" data-range-name="${rangeOpts.rangeName}"`
    : '';
  /* Locked: el field está bloqueado por dependencia con otro field
     (ej: inscStart depende de startDate). Visualmente disabled, sin wire
     de calendar, con helper hint informativo. */
  const locked = !!(rangeOpts && rangeOpts.locked);
  const lockHint = (rangeOpts && rangeOpts.lockHint) || '';
  const wrapClasses = [
    'naowee-textfield',
    'has-datepicker',
    hasError ? 'naowee-textfield--error' : '',
    locked   ? 'naowee-textfield--disabled' : '',
    locked   ? 'ev-locked' : ''
  ].filter(Boolean).join(' ');

  return `
    <div class="${wrapClasses}"
         data-ev-datepicker
         data-field-wrap="${fieldName}"
         ${rangeAttrs}>
      <label class="naowee-textfield__label ${required ? 'naowee-textfield__label--required' : ''}" for="${id}">
        ${label}
      </label>
      <div class="naowee-textfield__input-wrap">
        <input class="naowee-textfield__input ev-date-input" type="text" id="${id}"
               readonly
               ${locked ? 'disabled' : ''}
               placeholder="dd mmm aaaa"
               value="${display}"
               data-iso="${isoValue || ''}"
               data-field="${fieldName}" />
        <span class="naowee-textfield__suffix ev-date-suffix">${locked ? lockIcon() : calendarIcon()}</span>
      </div>
      <div class="ev-range-helper" data-range-helper hidden></div>
      ${locked && lockHint ? `<div class="naowee-helper"><div class="naowee-helper__text ev-lock-hint">${lockHint}</div></div>` : ''}
      ${hasError ? errorHelper() : ''}
    </div>
  `;
}

function renderStepPlaceholder(title, description) {
  return `
    <div class="ev-step-placeholder">
      <h3>${title}</h3>
      <p>${description}</p>
      <p class="ev-step-placeholder__note">— Placeholder: contenido del paso por diseñar. —</p>
    </div>
  `;
}

/* ─── Eventos ──────────────────────────────────────────────────────── */
function bindModalEvents() {
  const overlay = _modalState.el;
  if (!overlay) return;

  /* Click en overlay (fuera del modal) cierra */
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  /* Botones de acción (header dismiss + footer) */
  overlay.querySelectorAll('[data-act]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const act = btn.getAttribute('data-act');
      if (act === 'close')  { closeModal(); return; }
      if (act === 'prev')   {
        if (_modalState.step > 1) {
          _modalState.step -= 1;
          _modalState.errors = {};
          repaint();
        }
        return;
      }
      if (act === 'next')   {
        const errors = validateStep(_modalState.step);
        if (Object.keys(errors).length > 0) {
          _modalState.errors = errors;
          showErrorsSurgically(errors);   /* sin repaint: shake + scroll */
          return;
        }
        if (_modalState.step < TOTAL_STEPS) {
          _modalState.step += 1;
          _modalState.errors = {};
          repaint();
        }
        return;
      }
      if (act === 'finish') {
        const errors = validateStep(_modalState.step);
        if (Object.keys(errors).length > 0) {
          _modalState.errors = errors;
          showErrorsSurgically(errors);
          return;
        }
        console.info('[event-create] finish — datos:', _modalState.data);
        alert('Evento creado (preview-only).');
        closeModal();
        return;
      }
    });
  });

  /* Click en step del stepper → ir a ese paso (solo si ya pasamos por él) */
  overlay.querySelectorAll('.naowee-stepper__step[data-step]').forEach((stepEl) => {
    stepEl.addEventListener('click', () => {
      const target = parseInt(stepEl.getAttribute('data-step'), 10);
      if (target < _modalState.step) {
        _modalState.step = target;
        _modalState.errors = {};
        repaint();
      }
    });
  });

  /* Form fields (sync con state). Al escribir, limpiamos el error de ese
     campo de forma quirúrgica (sin repaint) para no perder el foco. */
  overlay.querySelectorAll('[data-field]').forEach((input) => {
    input.addEventListener('input', (e) => {
      const fieldName = input.getAttribute('data-field');
      _modalState.data[fieldName] = e.target.value;
      clearFieldError(fieldName);
    });
  });

  /* Counter de fases (input-stepper) — update QUIRÚRGICO sin repaint. */
  overlay.querySelectorAll('[data-counter]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const dir = btn.getAttribute('data-counter');
      if (dir === 'inc') _modalState.data.phases += 1;
      if (dir === 'dec' && _modalState.data.phases > 1) _modalState.data.phases -= 1;

      const valueEl = overlay.querySelector('#evPhasesValue');
      if (valueEl) valueEl.textContent = _modalState.data.phases;
      const decBtn = overlay.querySelector('[data-counter="dec"]');
      if (decBtn) decBtn.disabled = _modalState.data.phases <= 1;
    });
  });

  /* Datepickers custom — uno por cada [data-ev-datepicker] */
  overlay.querySelectorAll('[data-ev-datepicker]').forEach((field) => {
    wireDatepicker(field, overlay);
  });

  /* Dropdown de categoría — abre con position:fixed para escapar el
     overflow del modal__body. Posición calculada con getBoundingClientRect. */
  const dropdown = overlay.querySelector('#evCategoryDD');
  if (dropdown) {
    const trigger = dropdown.querySelector('.naowee-dropdown__trigger');
    const menu = dropdown.querySelector('.naowee-dropdown__menu');

    const positionMenu = () => {
      if (!trigger || !menu) return;
      const rect = trigger.getBoundingClientRect();
      menu.style.position = 'fixed';
      menu.style.top = `${rect.bottom + 6}px`;
      menu.style.left = `${rect.left}px`;
      menu.style.width = `${rect.width}px`;
      menu.style.zIndex = '9999';
    };

    trigger?.addEventListener('click', (e) => {
      /* Si el click fue sobre el X (active-area) de un tag, NO toggleamos
         el dropdown — el handler de remove-tag se encarga de quitar la
         categoría sin abrir/cerrar el menú. */
      if (e.target.closest('[data-remove-tag]')) return;
      e.stopPropagation();
      const opening = !dropdown.classList.contains('naowee-dropdown--open');
      /* Cerrar otros datepickers abiertos */
      document.querySelectorAll('.naowee-datepicker--popover.naowee-datepicker--open')
        .forEach(p => p.classList.remove('naowee-datepicker--open'));
      dropdown.classList.toggle('naowee-dropdown--open');
      if (opening) positionMenu();
    });

    /* Re-position al scrollear el body del modal o resize */
    const body = overlay.querySelector('.naowee-modal__body');
    body?.addEventListener('scroll', () => {
      if (dropdown.classList.contains('naowee-dropdown--open')) positionMenu();
    });
    window.addEventListener('resize', () => {
      if (dropdown.classList.contains('naowee-dropdown--open')) positionMenu();
    });

    /* Multi-select: cada click toggle add/remove de la categoría.
       NO cierra el menú — el usuario puede seleccionar varias.
       Update quirúrgico del trigger + del check de la opción para no
       perder el estado abierto del menú. */
    dropdown.querySelectorAll('.naowee-dropdown__option').forEach((opt) => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        const val = opt.getAttribute('data-val');
        const categories = _modalState.data.categories;
        const idx = categories.indexOf(val);
        if (idx >= 0) categories.splice(idx, 1);
        else          categories.push(val);

        /* Update visual del check + selected state de la opción */
        const check = opt.querySelector('.naowee-dropdown__option-check');
        if (idx >= 0) {
          opt.classList.remove('naowee-dropdown__option--selected');
          if (check) check.innerHTML = '';
        } else {
          opt.classList.add('naowee-dropdown__option--selected');
          if (check) check.innerHTML = checkIcon();
        }

        /* Update visual del trigger (placeholder ↔ tags) */
        refreshCategoryTrigger(dropdown);
        clearFieldError('categories');
        /* Re-position por si los tags hicieron crecer el trigger */
        positionMenu();
      });
    });

    /* Click en X de un tag → quitar esa categoría sin abrir/cerrar el menú.
       Bind UNA sola vez por overlay (el modal se destruye y rebindea limpio
       la próxima vez) — evita stack de handlers entre repaints. */
    if (!overlay._evRemoveTagBound) {
      overlay._evRemoveTagBound = true;
      overlay.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('[data-remove-tag]');
        if (!removeBtn) return;
        /* StopPropagation aquí para que el document.click que cierra el
           dropdown NO se dispare cuando el usuario solo quería borrar un tag. */
        e.stopPropagation();
        e.preventDefault();
        const val = removeBtn.getAttribute('data-remove-tag');
        const categories = _modalState.data.categories;
        const idx = categories.indexOf(val);
        if (idx < 0) return;
        categories.splice(idx, 1);
        /* Sync option__check de esa categoría en el menú */
        const dd = overlay.querySelector('#evCategoryDD');
        if (dd) {
          const opt = dd.querySelector(`.naowee-dropdown__option[data-val="${val}"]`);
          if (opt) {
            opt.classList.remove('naowee-dropdown__option--selected');
            const ch = opt.querySelector('.naowee-dropdown__option-check');
            if (ch) ch.innerHTML = '';
          }
          refreshCategoryTrigger(dd);
          if (dd.classList.contains('naowee-dropdown--open')) {
            const t = dd.querySelector('.naowee-dropdown__trigger');
            const m = dd.querySelector('.naowee-dropdown__menu');
            if (t && m) {
              const r = t.getBoundingClientRect();
              m.style.position = 'fixed';
              m.style.top = `${r.bottom + 6}px`;
              m.style.left = `${r.left}px`;
              m.style.width = `${r.width}px`;
              m.style.zIndex = '9999';
            }
          }
        }
      });
    }

    document.addEventListener('click', () => {
      dropdown.classList.remove('naowee-dropdown--open');
    });
  }

  /* Esc cierra */
  if (!document._evModalEscBound) {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && _modalState.el) closeModal();
    });
    document._evModalEscBound = true;
  }
}

/* ─── Validación: aplicar errores sin repaint ──────────────────────── */
/* Para cada campo inválido:
   1) Inserta o reusa el helper--negative dentro del wrapper
   2) Aplica naowee-textfield--error / naowee-dropdown--error
   3) Scrollea suavemente el body del modal al primer inválido
   4) Aplica .ev-shake para el wiggle (re-trigger después del scroll para
      que la animación sea visible). */
function showErrorsSurgically(errors) {
  const overlay = _modalState.el;
  if (!overlay) return;

  const body = overlay.querySelector('.naowee-modal__body');
  let firstInvalid = null;

  Object.keys(errors).forEach((fieldName) => {
    const wrap = overlay.querySelector(`[data-field-wrap="${fieldName}"]`);
    if (!wrap) return;

    /* Aplicar clase de error según tipo de field */
    if (wrap.classList.contains('naowee-dropdown')) {
      wrap.classList.add('naowee-dropdown--error');
    } else {
      wrap.classList.add('naowee-textfield--error');
    }

    /* Insertar o actualizar helper. Si el valor de errors[field] es un
       string, lo usamos como mensaje custom (ej: rango inválido). */
    const msg = typeof errors[fieldName] === 'string' ? errors[fieldName] : undefined;
    let helper = wrap.querySelector('.naowee-helper--negative');
    if (!helper) {
      helper = document.createElement('div');
      helper.className = 'naowee-helper naowee-helper--negative';
      wrap.appendChild(helper);
    }
    helper.innerHTML = errorHelperInner(msg);

    if (!firstInvalid) firstInvalid = wrap;
  });

  /* Scroll suave dentro del body del modal al primer inválido */
  if (firstInvalid && body) {
    const bodyRect = body.getBoundingClientRect();
    const fieldRect = firstInvalid.getBoundingClientRect();
    const targetTop = body.scrollTop + (fieldRect.top - bodyRect.top) - 24;
    body.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
  }

  /* Re-disparar shake después del scroll (260ms) — así el wiggle
     se ve aún cuando el campo entró por scroll. */
  setTimeout(() => {
    Object.keys(errors).forEach((fieldName) => {
      const wrap = overlay.querySelector(`[data-field-wrap="${fieldName}"]`);
      if (!wrap) return;
      wrap.classList.remove('naowee-shake');
      void wrap.offsetWidth;        /* reflow para reiniciar animation */
      wrap.classList.add('naowee-shake');
      setTimeout(() => wrap.classList.remove('naowee-shake'), 500);
    });
  }, 260);
}

/* Refresca el contenido del trigger del dropdown de categorías
   (placeholder ↔ tags) sin tocar el menu/options. */
function refreshCategoryTrigger(dropdown) {
  const trigger = dropdown.querySelector('.naowee-dropdown__trigger');
  if (!trigger) return;
  const controls = trigger.querySelector('.naowee-dropdown__controls');
  /* Quitar el contenido actual (placeholder o tags) — todo lo que NO sea
     el bloque de controls */
  Array.from(trigger.children).forEach((child) => {
    if (child !== controls) child.remove();
  });
  /* Insertar el nuevo contenido al inicio */
  trigger.insertAdjacentHTML('afterbegin', renderCategoryTriggerContent(_modalState.data.categories));
}

/* ─── Validación: clear surgical error de un campo ─────────────────── */
function clearFieldError(fieldName) {
  if (!_modalState.errors[fieldName]) return;
  delete _modalState.errors[fieldName];
  const overlay = _modalState.el;
  if (!overlay) return;
  const wrap = overlay.querySelector(`[data-field-wrap="${fieldName}"]`);
  if (wrap) {
    wrap.classList.remove('naowee-textfield--error');
    wrap.classList.remove('naowee-dropdown--error');
    const helper = wrap.querySelector('.naowee-helper--negative');
    if (helper) helper.remove();
  }
}

/* ─── Datepicker custom (DS-styled) ────────────────────────────────── */
function wireDatepicker(field, overlay) {
  if (field.dataset.evWired) return;
  field.dataset.evWired = '1';

  /* Locked: no instanciamos popup ni wire de click — el field está
     deshabilitado por dependencia con otro (ej: inscStart locked al
     startDate del evento). */
  if (field.classList.contains('ev-locked')) return;

  const input = field.querySelector('input');
  const wrap  = field.querySelector('.naowee-textfield__input-wrap');
  const fieldName = input.getAttribute('data-field');
  const rangeRole = field.dataset.range;        /* 'from' | 'to' | undefined */
  const rangeName = field.dataset.rangeName;    /* 'event' | 'inscriptions' */

  const initialIso = input.dataset.iso || '';
  let viewYear, viewMonth;
  let selected = null;
  if (initialIso) {
    const [yy, mm, dd] = initialIso.split('-').map(Number);
    selected = new Date(yy, mm - 1, dd);
    viewYear = yy; viewMonth = mm - 1;
  } else {
    const today = new Date();
    viewYear = today.getFullYear();
    viewMonth = today.getMonth();
  }

  /* Popup DS-oficial: naowee-datepicker--compact (266px / celdas 32×32)
     dentro de un wrapper --popover (position:fixed + elevación + open state).
     Se inyecta al body para escapar el overflow del modal__body. */
  const pop = document.createElement('div');
  pop.className = 'naowee-datepicker naowee-datepicker--compact naowee-datepicker--popover';
  document.body.appendChild(pop);

  /* Devuelve los límites min/max según el rango configurado.
     - "to": minDate = el "from" del mismo rangeName (si existe)
     - "from": maxDate = el "to" del mismo rangeName (suave, no bloqueante) */
  function computeBounds() {
    let minDate = null, maxDate = null;
    if (!rangeName) return { minDate, maxDate };
    if (rangeRole === 'to') {
      const fromField = overlay.querySelector(
        `[data-ev-datepicker][data-range="from"][data-range-name="${rangeName}"]`
      );
      const fromIso = fromField?.querySelector('input')?.dataset.iso;
      if (fromIso) {
        const [fy, fm, fd] = fromIso.split('-').map(Number);
        minDate = new Date(fy, fm - 1, fd);
      }
    } else if (rangeRole === 'from') {
      const toField = overlay.querySelector(
        `[data-ev-datepicker][data-range="to"][data-range-name="${rangeName}"]`
      );
      const toIso = toField?.querySelector('input')?.dataset.iso;
      if (toIso) {
        const [ty, tm, td] = toIso.split('-').map(Number);
        maxDate = new Date(ty, tm - 1, td);
      }
    }
    return { minDate, maxDate };
  }

  function render() {
    /* Markup DS-oficial: __calendar > __header (month + nav controls) +
       __content (week de weekdays + N weeks de days). */
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
    const startWeekday = (firstOfMonth.getDay() + 6) % 7; /* lunes = 0 */
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

    /* Bounds del rango (si aplica) */
    const { minDate, maxDate } = computeBounds();

    /* Agrupar cells en weeks de 7 para el markup DS (__week > __day...) */
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

        /* Disable días fuera del rango (solo bloquea "to" antes del "from"
           — para "from" el max es soft, no bloqueante, lo dejamos clickeable) */
        const outOfRange = (rangeRole === 'to' && minDate && c.d < minDate);
        if (outOfRange) {
          b.classList.add('naowee-datepicker__day--disabled');
          b.disabled = true;
        }
        b.textContent = c.day;
        b.addEventListener('click', onDayClick.bind(null, c, outOfRange));
        weekEl.appendChild(b);
      });
      weeksWrap.appendChild(weekEl);
    });

    /* Handler factorizado para no duplicar lógica adentro del bucle */
    function onDayClick(c, outOfRange, e) {
      e.stopPropagation();
      if (outOfRange) return;
      selected = c.d;
      viewYear = c.d.getFullYear();
      viewMonth = c.d.getMonth();
      const iso = toIso(c.d);
      input.value = formatHumanFromIso(iso);
      input.dataset.iso = iso;
      _modalState.data[fieldName] = iso;
      pop.classList.remove('naowee-datepicker--open');
      clearFieldError(fieldName);

      /* Propagación startDate → inscStart (locked).
         La fecha de inicio de inscripciones está atada a la fecha de
         inicio del evento — cualquier cambio en startDate se replica
         quirúrgicamente al inscStart sin re-render. */
      if (fieldName === 'startDate') {
        _modalState.data.inscStart = iso;
        const inscStartWrap = overlay.querySelector('[data-field-wrap="inscStart"]');
        if (inscStartWrap) {
          const inscInput = inscStartWrap.querySelector('input');
          if (inscInput) {
            inscInput.value = formatHumanFromIso(iso);
            inscInput.dataset.iso = iso;
          }
        }
      }

      /* Si soy "from" y el "to" actual queda anterior, lo limpio
         con flash visual + helper temporal de aviso. */
      if (rangeRole === 'from' && rangeName) {
        const toField = overlay.querySelector(
          `[data-ev-datepicker][data-range="to"][data-range-name="${rangeName}"]`
        );
        const toInput = toField?.querySelector('input');
        const toIso = toInput?.dataset.iso;
        if (toIso) {
          const [ty, tm, td] = toIso.split('-').map(Number);
          const toDate = new Date(ty, tm - 1, td);
          if (toDate < c.d) {
            const toFieldName = toInput.getAttribute('data-field');
            toInput.value = '';
            toInput.dataset.iso = '';
            _modalState.data[toFieldName] = '';
            flashRangeWarning(toField,
              'Se limpió porque quedaba antes de la fecha de inicio.');
          }
        }
      }
    }

    pop.querySelectorAll('[data-nav]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const dir = +btn.dataset.nav;
        viewMonth += dir;
        if (viewMonth < 0)  { viewMonth = 11; viewYear--; }
        if (viewMonth > 11) { viewMonth = 0;  viewYear++; }
        render();
      });
    });
  }

  function positionPop() {
    const r = wrap.getBoundingClientRect();
    const desiredH = pop.offsetHeight || 320;
    const spaceBelow = window.innerHeight - r.bottom - 8;
    const openUp = spaceBelow < desiredH && r.top > desiredH;
    pop.style.left = `${r.left}px`;
    pop.style.width = `${Math.max(r.width, 260)}px`;
    pop.style.top = openUp ? `${r.top - 6 - desiredH}px` : `${r.bottom + 6}px`;
  }

  wrap.addEventListener('click', (e) => {
    e.stopPropagation();
    const wasOpen = pop.classList.contains('naowee-datepicker--open');
    /* Cerrar otros popups y dropdowns abiertos */
    document.querySelectorAll('.naowee-datepicker--popover.naowee-datepicker--open')
      .forEach(p => p.classList.remove('naowee-datepicker--open'));
    document.querySelectorAll('.naowee-dropdown--open')
      .forEach(d => d.classList.remove('naowee-dropdown--open'));
    if (!wasOpen) {
      if (selected) {
        viewYear = selected.getFullYear();
        viewMonth = selected.getMonth();
      }
      render();
      positionPop();
      pop.classList.add('naowee-datepicker--open');
    }
  });

  /* Re-position al scrollear/resize */
  const body = overlay.querySelector('.naowee-modal__body');
  body?.addEventListener('scroll', () => {
    if (pop.classList.contains('naowee-datepicker--open')) positionPop();
  }, true);
  window.addEventListener('resize', () => {
    if (pop.classList.contains('naowee-datepicker--open')) positionPop();
  });

  /* Click outside cierra */
  document.addEventListener('click', (ev) => {
    if (!field.contains(ev.target) && !pop.contains(ev.target)) {
      pop.classList.remove('naowee-datepicker--open');
    }
  });

  /* Cleanup centralizado: closeModal() recoge todos los .ev-dp del body
     cuando el modal se destruye. No necesitamos MutationObserver. */
}

/* Flash rojo + helper temporal cuando se limpia un "to" automáticamente
   por elegir un "from" posterior. Se autorrelee a los 2.8s. */
function flashRangeWarning(field, message) {
  if (!field) return;
  field.classList.add('ev-flash-error');
  const helper = field.querySelector('[data-range-helper]');
  if (helper) {
    helper.hidden = false;
    helper.textContent = message;
    helper.classList.add('ev-range-helper--warn');
  }
  setTimeout(() => {
    field.classList.remove('ev-flash-error');
    if (helper) {
      helper.hidden = true;
      helper.textContent = '';
      helper.classList.remove('ev-range-helper--warn');
    }
  }, 2800);
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function toIso(d) {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}
function formatHumanFromIso(iso) {
  if (!iso) return '';
  const [yy, mm, dd] = iso.split('-').map(Number);
  return `${String(dd).padStart(2,'0')} ${MONTHS_SHORT[mm-1]} ${yy}`;
}

/* ─── Iconos inline ────────────────────────────────────────────────── */
function closeIcon()      { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'; }
function closeIconSmall() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'; }
function checkIcon()      { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'; }
function calendarIcon() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>'; }
function lockIcon()     { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 1 1 8 0v4"/></svg>'; }
function chevronDown()  { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>'; }
function plusIcon()     { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>'; }
function minusIcon()    { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>'; }

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}
