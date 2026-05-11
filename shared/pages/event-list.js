/**
 * Event List — IFRAME EDITION (single source of truth)
 *
 * v2.1.0 (2026-05-11+): apunta al archivo standalone del repo
 * `naowee-test-digitacion`. Ya no se mantiene un `-portal.html`
 * separado — la propia página detecta que está en iframe vía
 * embed-mode.js y oculta su chrome (sidebar + header) por sí sola.
 *
 *   /naowee-test-digitacion/eventos.html
 *
 * Beneficio: cuando se refina la página standalone, el shell
 * muestra los mismos cambios automáticamente. Cero duplicación.
 *
 * Las sub-navegaciones (evento-detalle, stepper de nueva competencia,
 * lista de competencias, detalle, preview) viven dentro del iframe.
 */

const PORTAL_PATH = '/naowee-test-digitacion/eventos.html';
const PORTAL_LOCAL_BASE = 'http://localhost:4800';
const PORTAL_PROD_BASE = 'https://naowee-tech.github.io';

function resolvePortalUrl() {
  const host = window.location.hostname;
  const isLocal = host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0';
  if (isLocal) return PORTAL_LOCAL_BASE + '/eventos.html';
  return PORTAL_PROD_BASE + PORTAL_PATH;
}

export function renderEventListPage(pageEl) {
  if (!pageEl) return;
  pageEl.innerHTML = '';
  pageEl.classList.add('digitacion-portal-host');

  const iframe = document.createElement('iframe');
  iframe.className = 'digitacion-portal-iframe';
  iframe.src = resolvePortalUrl();
  iframe.title = 'Eventos';
  iframe.setAttribute('loading', 'eager');
  pageEl.appendChild(iframe);
}
