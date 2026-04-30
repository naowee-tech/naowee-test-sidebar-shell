/**
 * Create Event Modal — wizard de 4 pasos.
 * Replica el modal del screenshot.
 *
 * Pasos:
 *   1. Datos básicos (campos del formulario inicial)
 *   2. Cupos (placeholder)
 *   3. Documentos (placeholder)
 *   4. Resumen (placeholder)
 *
 * Usa .naowee-modal-overlay + .naowee-modal del DS.
 * Mount on demand: openCreateEventModal() crea overlay en body.
 */

const TOTAL_STEPS = 4;
const STEP_TITLES = [
  'Datos básicos',
  'Cupos',
  'Documentos',
  'Resumen'
];

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
  if (_modalState.el) return; /* ya abierto */
  _modalState.step = 1;
  _modalState.data = {
    name:'', description:'', startDate:'', endDate:'',
    category:'', phases:1, inscStart:'', inscEnd:''
  };

  const overlay = document.createElement('div');
  overlay.className = 'naowee-modal-overlay open ev-modal-overlay';
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

function renderModal() {
  const step = _modalState.step;
  return `
    <div class="naowee-modal naowee-modal--scrollable ev-modal" role="dialog" aria-modal="true">
      <header class="ev-modal__header">
        <div class="ev-modal__step-info">
          <span class="ev-modal__step-counter">${step} de ${TOTAL_STEPS}</span>
          <h2 class="ev-modal__step-title">${STEP_TITLES[step - 1]}</h2>
        </div>
        <button class="ev-modal__close" type="button" aria-label="Cerrar" data-act="close">
          ${closeIcon()}
        </button>
      </header>

      <div class="ev-modal__body">
        ${renderStep(step)}
      </div>

      <footer class="ev-modal__footer">
        <button class="naowee-btn naowee-btn--mute naowee-btn--medium" type="button" data-act="${step === 1 ? 'close' : 'prev'}">
          ${step === 1 ? 'Cancelar' : 'Anterior'}
        </button>
        <button class="naowee-btn naowee-btn--loud naowee-btn--medium" type="button" data-act="${step === TOTAL_STEPS ? 'finish' : 'next'}">
          ${step === TOTAL_STEPS ? 'Crear evento' : 'Siguiente'}
        </button>
      </footer>
    </div>
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
      <div class="ev-form-field">
        <label class="ev-form-label" for="evName">Nombre del evento <span class="ev-form-required">*</span></label>
        <input type="text" class="ev-form-input" id="evName"
               placeholder="Nombre del evento"
               value="${escapeHtml(d.name)}" data-field="name" />
      </div>

      <div class="ev-form-field">
        <label class="ev-form-label" for="evDescription">Descripción del evento</label>
        <textarea class="ev-form-input ev-form-textarea" id="evDescription"
                  rows="3" data-field="description">${escapeHtml(d.description)}</textarea>
      </div>

      <div class="ev-form-row">
        <div class="ev-form-field">
          <label class="ev-form-label" for="evStartDate">Fecha de inicio del evento <span class="ev-form-required">*</span></label>
          <div class="ev-form-input-wrap">
            <span class="ev-form-input-icon">${calendarIcon()}</span>
            <input type="date" class="ev-form-input ev-form-input--with-icon" id="evStartDate"
                   value="${d.startDate}" data-field="startDate" />
          </div>
        </div>
        <div class="ev-form-field">
          <label class="ev-form-label" for="evEndDate">Fecha final del evento <span class="ev-form-required">*</span></label>
          <div class="ev-form-input-wrap">
            <span class="ev-form-input-icon">${calendarIcon()}</span>
            <input type="date" class="ev-form-input ev-form-input--with-icon" id="evEndDate"
                   value="${d.endDate}" data-field="endDate" />
          </div>
        </div>
      </div>

      <div class="ev-form-section">CATEGORÍAS</div>

      <div class="ev-form-field">
        <label class="ev-form-label" for="evCategory">Categoría <span class="ev-form-required">*</span></label>
        <div class="ev-form-input-wrap">
          <input type="text" class="ev-form-input ev-form-input--select" id="evCategory"
                 placeholder="Ej. Juvenil, Prejuvenil, Infantil"
                 value="${escapeHtml(d.category)}" data-field="category" />
          <span class="ev-form-input-suffix">${chevronDown()}</span>
        </div>
      </div>

      <div class="ev-form-field">
        <label class="ev-form-label">¿Cuántas fases tiene?</label>
        <div class="ev-counter">
          <button type="button" class="ev-counter__btn" data-counter="dec">−</button>
          <span class="ev-counter__value">${d.phases}</span>
          <button type="button" class="ev-counter__btn ev-counter__btn--add" data-counter="inc">+</button>
        </div>
      </div>

      <div class="ev-form-section">INSCRIPCIONES</div>

      <div class="ev-form-row">
        <div class="ev-form-field">
          <label class="ev-form-label" for="evInscStart">Fecha inicio de inscripciones</label>
          <div class="ev-form-input-wrap">
            <span class="ev-form-input-icon">${calendarIcon()}</span>
            <input type="date" class="ev-form-input ev-form-input--with-icon" id="evInscStart"
                   value="${d.inscStart}" data-field="inscStart" />
          </div>
        </div>
        <div class="ev-form-field">
          <label class="ev-form-label" for="evInscEnd">Fecha fin de inscripciones <span class="ev-form-required">*</span></label>
          <div class="ev-form-input-wrap">
            <span class="ev-form-input-icon">${calendarIcon()}</span>
            <input type="date" class="ev-form-input ev-form-input--with-icon" id="evInscEnd"
                   value="${d.inscEnd}" data-field="inscEnd" />
          </div>
        </div>
      </div>
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

  /* Botones de acción */
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

  /* Form fields (sync con state) */
  overlay.querySelectorAll('[data-field]').forEach((input) => {
    input.addEventListener('input', (e) => {
      _modalState.data[input.getAttribute('data-field')] = e.target.value;
    });
  });

  /* Counter de fases */
  overlay.querySelectorAll('[data-counter]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const dir = btn.getAttribute('data-counter');
      if (dir === 'inc') _modalState.data.phases += 1;
      if (dir === 'dec' && _modalState.data.phases > 1) _modalState.data.phases -= 1;
      repaint();
    });
  });

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
function calendarIcon() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>'; }
function chevronDown()  { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>'; }

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}
