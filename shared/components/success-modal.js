/**
 * naowee-success-modal — receta DS reutilizable
 *
 * Modal de confirmación post-acción con check verde animado y confetti
 * opcional. Adaptado de la receta de naowee-test-incentivos/programa-wizard
 * para vivir en el design system local.
 *
 * Uso:
 *   import { openSuccessModal } from './shared/components/success-modal.js';
 *
 *   const ref = openSuccessModal({
 *     title: '¡Evento creado exitosamente!',
 *     body:  'El evento <strong>Copa 2026</strong> ha sido creado.',
 *     note:  'Se enviará un email de bienvenida el día...',  // opcional
 *     stats: [                                                // opcional
 *       { variant: 'accent', icon: '<svg.../>', label: 'Deportes',  value: '12' },
 *       { variant: 'informative', icon: '<svg.../>', label: 'Fases', value: '3'  },
 *       { variant: 'positive', icon: '<svg.../>', label: 'Vigencia', value: '01 abr → 09 abr' }
 *     ],
 *     primary: {                                              // opcional
 *       label: 'Ver evento',
 *       icon:  '<svg.../>',
 *       onClick: () => navigateTo('/eventos/123')
 *     },
 *     secondary: {                                            // opcional
 *       label: 'Crear otro',
 *       onClick: () => openCreateEventModal()
 *     },
 *     confetti: true,                                         // default true
 *     onClose: () => {}                                       // opcional
 *   });
 *
 *   ref.close();   // dismiss programático
 *
 * El CSS (shared/components/success-modal.css) debe estar cargado en la
 * página. La animación respeta prefers-reduced-motion.
 */

const CONFETTI_COLORS = ['#FF7500', '#d74009', '#1f8923', '#1f78d1', '#ffbf75', '#ffffff'];
const CONFETTI_PIECES = 42;

function closeIcon() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
}

function checkIcon() {
  return '<svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
}

function escapeHtml(str) {
  return String(str ?? '')
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

/* Las opciones `body` y `note` admiten HTML porque son comúnmente
   strings con un <strong>highlight</strong> inline. Si querés HTML
   safe, escapá el contenido antes de pasarlo al constructor. */
export function openSuccessModal(opts = {}) {
  const {
    title = '¡Operación exitosa!',
    body = '',
    note = '',
    stats = [],
    primary = null,
    secondary = null,
    confetti = true,
    variant = 'positive',
    onClose = null
  } = opts;

  /* Defensa contra doble apertura */
  document.querySelectorAll('.naowee-success-modal-overlay').forEach(o => o.remove());

  const overlay = document.createElement('div');
  overlay.className = 'naowee-success-modal-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'naoweeSuccessTitle');

  const modalCls = ['naowee-success-modal'];
  if (variant && variant !== 'positive') {
    modalCls.push(`naowee-success-modal--${variant}`);
  }

  const statsHtml = stats.length > 0 ? `
    <div class="naowee-success-modal__stats naowee-success-modal__stats--${stats.length}">
      ${stats.map(s => `
        <div class="naowee-success-modal__stat">
          <span class="naowee-success-modal__stat-ico" data-variant="${escapeHtml(s.variant || 'neutral')}">
            ${s.icon || ''}
          </span>
          <span class="naowee-success-modal__stat-label">
            <span class="naowee-success-modal__stat-dot"></span>${escapeHtml(s.label || '')}
          </span>
          <span class="naowee-success-modal__stat-value">${escapeHtml(s.value || '—')}</span>
        </div>
      `).join('')}
    </div>
  ` : '';

  const actionsHtml = (primary || secondary) ? `
    <div class="naowee-success-modal__actions">
      ${secondary ? `
        <button type="button" class="naowee-btn naowee-btn--quiet naowee-btn--medium" data-success-secondary>
          ${escapeHtml(secondary.label || 'Cancelar')}
        </button>
      ` : ''}
      ${primary ? `
        <button type="button" class="naowee-btn naowee-btn--loud naowee-btn--medium" data-success-primary>
          ${escapeHtml(primary.label || 'Aceptar')}
          ${primary.icon || ''}
        </button>
      ` : ''}
    </div>
  ` : '';

  overlay.innerHTML = `
    <div class="${modalCls.join(' ')}" role="document">
      <button type="button" class="naowee-success-modal__close" data-success-close aria-label="Cerrar">
        ${closeIcon()}
      </button>

      ${confetti ? '<div class="naowee-success-modal__confetti" data-success-confetti aria-hidden="true"></div>' : ''}

      <div class="naowee-success-modal__hero">
        <div class="naowee-success-modal__ico">${checkIcon()}</div>
      </div>

      <h2 class="naowee-success-modal__title" id="naoweeSuccessTitle">${escapeHtml(title)}</h2>
      ${body ? `<p class="naowee-success-modal__body">${body}</p>` : ''}
      ${note ? `<p class="naowee-success-modal__note">${note}</p>` : ''}

      ${statsHtml}
      ${actionsHtml}
    </div>
  `;

  document.body.appendChild(overlay);
  /* Lock scroll del body — restoremos al cerrar (si no hay otros modales
     abiertos del DS que también lo necesitan). */
  const prevOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';

  if (confetti) {
    seedConfetti(overlay.querySelector('[data-success-confetti]'));
  }
  /* rAF para que el class .open agarre el frame y dispare las animations */
  requestAnimationFrame(() => overlay.classList.add('open'));

  let closed = false;
  function close() {
    if (closed) return;
    closed = true;
    overlay.classList.remove('open');
    setTimeout(() => {
      overlay.remove();
      /* Restablecer overflow solo si no hay otro modal del DS abierto. */
      if (!document.querySelector('.naowee-modal-overlay.open, .naowee-success-modal-overlay.open')) {
        document.body.style.overflow = prevOverflow;
      }
    }, 200);
    document.removeEventListener('keydown', onEsc);
    if (typeof onClose === 'function') onClose();
  }

  /* Click outside cierra */
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
  /* Botones */
  overlay.querySelector('[data-success-close]')?.addEventListener('click', close);
  overlay.querySelector('[data-success-primary]')?.addEventListener('click', () => {
    if (primary && typeof primary.onClick === 'function') primary.onClick();
    close();
  });
  overlay.querySelector('[data-success-secondary]')?.addEventListener('click', () => {
    if (secondary && typeof secondary.onClick === 'function') secondary.onClick();
    close();
  });
  /* Esc */
  function onEsc(e) {
    if (e.key === 'Escape') close();
  }
  document.addEventListener('keydown', onEsc);

  return { close };
}

/* Genera 42 partículas con paleta mixta, distribuidas randomly en X,
   con delay y duración variable. Solo se llama si confetti:true.
   Pattern exacto del wizard de programa-incentivos. */
function seedConfetti(root) {
  if (!root) return;
  root.innerHTML = '';
  for (let i = 0; i < CONFETTI_PIECES; i++) {
    const p = document.createElement('span');
    p.className = 'naowee-success-modal__confetti-piece';
    p.style.left = (Math.random() * 100) + '%';
    p.style.background = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    p.style.animationDelay = (Math.random() * 0.6).toFixed(2) + 's';
    p.style.animationDuration = (1.8 + Math.random() * 1.4).toFixed(2) + 's';
    p.style.borderRadius = Math.random() > 0.5 ? '2px' : '50%';
    root.appendChild(p);
  }
}
