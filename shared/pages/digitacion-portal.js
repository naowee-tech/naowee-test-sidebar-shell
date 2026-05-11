/**
 * Digitación — IFRAME EDITION (single source of truth)
 *
 * v2.1.0 (2026-05-11+): las vistas del módulo de digitación se montan
 * como iframes apuntando a los archivos standalone del repo
 * `naowee-test-digitacion`. Ya no se mantienen `-portal.html`
 * separados — cada página detecta que está en iframe vía
 * embed-mode.js y oculta su chrome (sidebar + header) por sí sola.
 *
 * Slugs:
 *   • mi-digitacion → digitador.html  (vista personal del digitador)
 *   • digitadores   → digitadores.html
 *   • coordinadores → coordinadores.html
 *   • dashboard     → dashboard.html  (inicio del rol DIGITIZER)
 *   • competencias  → lista.html
 *
 * Beneficio: cuando se refina una página standalone, el shell
 * muestra los mismos cambios automáticamente. Cero duplicación.
 *
 * Las sub-navegaciones internas (evento-detalle, stepper, detalle,
 * preview) viven dentro del iframe.
 */

const PORTAL_PATH = '/naowee-test-digitacion';
const PORTAL_LOCAL_BASE = 'http://localhost:4800';
const PORTAL_PROD_BASE = 'https://naowee-tech.github.io';

function resolvePortalUrl(slug) {
  const host = window.location.hostname;
  const isLocal = host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0';
  if (isLocal) return PORTAL_LOCAL_BASE + '/' + slug + '.html';
  return PORTAL_PROD_BASE + PORTAL_PATH + '/' + slug + '.html';
}

function mountPortal(pageEl, slug, title) {
  if (!pageEl) return;
  pageEl.innerHTML = '';
  pageEl.classList.add('digitacion-portal-host');

  const iframe = document.createElement('iframe');
  iframe.className = 'digitacion-portal-iframe';
  iframe.src = resolvePortalUrl(slug);
  iframe.title = title;
  iframe.setAttribute('loading', 'eager');
  pageEl.appendChild(iframe);
}

export function renderMiDigitacionPage(pageEl) {
  mountPortal(pageEl, 'digitador', 'Mi digitación');
}

export function renderDigitadoresPage(pageEl) {
  mountPortal(pageEl, 'digitadores', 'Digitadores');
}

export function renderCoordinadoresPage(pageEl) {
  mountPortal(pageEl, 'coordinadores', 'Coordinadores');
}

/**
 * Inicio del rol DIGITIZER (Digitador) — embebe el dashboard
 * personal del digitador (estadísticas + historial de competencias).
 */
export function renderDigitadorInicioPage(pageEl) {
  mountPortal(pageEl, 'dashboard', 'Inicio digitador');
}

/**
 * Vista "Competencias" — listado completo de competencias deportivas
 * (lista.html del repo digitación). Lo ven los roles
 * EVENT_COORDINATOR / EVENT_MANAGER / ADMIN / ROOT.
 */
export function renderCompetenciasPage(pageEl) {
  mountPortal(pageEl, 'lista', 'Competencias');
}
