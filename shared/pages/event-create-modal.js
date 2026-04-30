/**
 * Create Event Modal — wizard de 4 pasos.
 * Refactorizado para usar componentes del DS oficial:
 *   - naowee-modal-overlay + naowee-modal (con --fixed-header --fixed-footer)
 *   - naowee-modal__header / __title-group / __title / __subtitle / __dismiss
 *   - naowee-stepper + __step + __step--active + __number + __label + __connector
 *   - naowee-modal__body
 *   - naowee-textfield + __label (--required) + __input-wrap + __input + __suffix
 *   - naowee-textfield--textarea (para descripción)
 *   - naowee-dropdown (para categoría)
 *   - naowee-input-stepper (para "¿cuántas fases tiene?")
 *   - naowee-btn (mute/loud) en el footer
 *
 * Patrón validado en naowee-test-incentivos/shared/programa-wizard.html
 */

const TOTAL_STEPS = 4;
const STEP_LABELS = ['Datos básicos', 'Cupos', 'Documentos', 'Resumen'];

const _modalState = {
  el: null,
  step: 1,
  data: {
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    category: '',
    phases: 1,
    inscStart: '',
    inscEnd: ''
  }
};

export function openCreateEventModal() {
  if (_modalState.el) return;
  _modalState.step = 1;
  _modalState.data = {
    name:'', description:'', startDate:'', endDate:'',
    category:'', phases:1, inscStart:'', inscEnd:''
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
    document.body.style.overflow = '';
  }, 180);
}

function repaint() {
  if (!_modalState.el) return;
  _modalState.el.innerHTML = renderModal();
  bindModalEvents();
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
    <ol class="naowee-stepper ev-modal__stepper">
      ${STEP_LABELS.map((label, i) => {
        const stepNum = i + 1;
        const cls = ['naowee-stepper__step'];
        if (stepNum === _modalState.step) cls.push('naowee-stepper__step--active');
        if (stepNum < _modalState.step)  cls.push('naowee-stepper__step--done');
        return `
          <li class="${cls.join(' ')}" data-step="${stepNum}">
            <span class="naowee-stepper__number">${stepNum}</span>
            <span class="naowee-stepper__label">${label}</span>
            ${stepNum < TOTAL_STEPS ? '<span class="naowee-stepper__connector"></span>' : ''}
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
  return `
    <div class="ev-form">
      <!-- Nombre del evento (textfield required) -->
      <div class="naowee-textfield">
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
        ${requiredHelper()}
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

      <!-- Fechas inicio/fin (date pickers nativos del browser) -->
      <div class="ev-grid-2">
        ${renderDatepicker('evStartDate', 'Fecha de inicio del evento', true, d.startDate, 'startDate')}
        ${renderDatepicker('evEndDate',   'Fecha final del evento',     true, d.endDate,   'endDate')}
      </div>

      <!-- Sección CATEGORÍAS -->
      <div class="ev-form-section">CATEGORÍAS</div>

      <!-- Categoría (dropdown DS) -->
      <div class="naowee-dropdown" id="evCategoryDD">
        <label class="naowee-dropdown__label naowee-dropdown__label--required">Categoría</label>
        <div class="naowee-dropdown__trigger" tabindex="0">
          <span class="${d.category ? 'naowee-dropdown__value' : 'naowee-dropdown__placeholder'}">
            ${d.category || 'Ej. Juvenil, Prejuvenil, Infantil'}
          </span>
          <div class="naowee-dropdown__controls">
            <span class="naowee-dropdown__chevron">${chevronDown()}</span>
          </div>
        </div>
        <div class="naowee-dropdown__menu" role="listbox">
          ${['Infantil', 'Prejuvenil', 'Juvenil', 'Sub-23', 'Mayores', 'Master', 'Veteranos'].map((c) => `
            <div class="naowee-dropdown__option" data-val="${c}">${c}</div>
          `).join('')}
        </div>
        ${requiredHelper()}
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

      <!-- Fechas inscripciones (grid 2 cols) -->
      <div class="ev-grid-2">
        ${renderDatepicker('evInscStart', 'Fecha inicio de inscripciones', false, d.inscStart, 'inscStart')}
        ${renderDatepicker('evInscEnd',   'Fecha fin de inscripciones',    true,  d.inscEnd,   'inscEnd')}
      </div>
    </div>
  `;
}

/* Helper de "Este campo es obligatorio" — patrón del DS naowee-helper */
function requiredHelper() {
  return `
    <div class="naowee-helper">
      <div class="naowee-helper__text">Este campo es obligatorio</div>
    </div>
  `;
}

/* Date picker — usa input type=date nativo (calendar del SO),
   wrappeado en .naowee-textfield del DS con suffix de calendario.
   Click en el suffix abre el picker nativo. */
function renderDatepicker(id, label, required, value, fieldName) {
  return `
    <div class="naowee-textfield has-datepicker">
      <label class="naowee-textfield__label ${required ? 'naowee-textfield__label--required' : ''}" for="${id}">
        ${label}
      </label>
      <div class="naowee-textfield__input-wrap">
        <input class="naowee-textfield__input ev-date-input" type="date" id="${id}"
               value="${value}"
               data-field="${fieldName}" />
        <span class="naowee-textfield__suffix ev-date-suffix" data-date-trigger="${id}">${calendarIcon()}</span>
      </div>
      ${required ? requiredHelper() : ''}
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
      if (act === 'prev')   { if (_modalState.step > 1)            { _modalState.step -= 1; repaint(); } return; }
      if (act === 'next')   { if (_modalState.step < TOTAL_STEPS)  { _modalState.step += 1; repaint(); } return; }
      if (act === 'finish') {
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
        repaint();
      }
    });
  });

  /* Form fields (sync con state) */
  overlay.querySelectorAll('[data-field]').forEach((input) => {
    input.addEventListener('input', (e) => {
      _modalState.data[input.getAttribute('data-field')] = e.target.value;
    });
  });

  /* Counter de fases (input-stepper) — update QUIRÚRGICO sin repaint
     full para evitar flicker visual del modal. Solo actualiza el valor
     y el disabled state del botón −. */
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

  /* Click en suffix de los date pickers → abre el picker nativo */
  overlay.querySelectorAll('[data-date-trigger]').forEach((suffix) => {
    suffix.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetId = suffix.getAttribute('data-date-trigger');
      const input = overlay.querySelector('#' + targetId);
      if (input?.showPicker) input.showPicker();
      else input?.focus();
    });
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
      e.stopPropagation();
      const opening = !dropdown.classList.contains('naowee-dropdown--open');
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

    dropdown.querySelectorAll('.naowee-dropdown__option').forEach((opt) => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        _modalState.data.category = opt.getAttribute('data-val');
        dropdown.classList.remove('naowee-dropdown--open');
        /* Update quirúrgico del placeholder/value sin full repaint */
        const ph = dropdown.querySelector('.naowee-dropdown__placeholder, .naowee-dropdown__value');
        if (ph) {
          ph.textContent = _modalState.data.category;
          ph.classList.remove('naowee-dropdown__placeholder');
          ph.classList.add('naowee-dropdown__value');
        }
      });
    });
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

/* ─── Iconos inline ────────────────────────────────────────────────── */
function closeIcon()    { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'; }
function calendarIcon() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>'; }
function chevronDown()  { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>'; }
function plusIcon()     { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>'; }
function minusIcon()    { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>'; }

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}
