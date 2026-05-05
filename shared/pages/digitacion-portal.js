/**
 * Digitación — IFRAME PORTAL EDITION
 *
 * Las 3 vistas del módulo de digitación (Mi digitación, Digitadores,
 * Coordinadores) se montan como iframes apuntando al repo
 * `naowee-test-digitacion`. Las sub-navegaciones internas (dashboard,
 * eventos, evento-detalle, lista, detalle, stepper, preview) viven
 * dentro del iframe — el shell sólo provee el frame.
 *
 * Garantiza paridad 100% con el módulo de digitación. Cualquier ajuste
 * futuro allá se sincroniza automáticamente acá.
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
  mountPortal(pageEl, 'mi-digitacion-portal', 'Mi digitación');
}

export function renderDigitadoresPage(pageEl) {
  mountPortal(pageEl, 'digitadores-portal', 'Digitadores');
}

export function renderCoordinadoresPage(pageEl) {
  mountPortal(pageEl, 'coordinadores-portal', 'Coordinadores');
}

/**
 * Inicio del rol DIGITIZER (Digitador) — embebe el dashboard
 * personal del digitador (estadísticas + historial de competencias).
 */
export function renderDigitadorInicioPage(pageEl) {
  mountPortal(pageEl, 'dashboard-portal', 'Inicio digitador');
}

/**
 * Vista "Competencias" — listado completo de competencias deportivas
 * (la página /lista.html del repo digitación). Lo ven los roles
 * EVENT_COORDINATOR / EVENT_MANAGER / ADMIN / ROOT.
 */
export function renderCompetenciasPage(pageEl) {
  mountPortal(pageEl, 'lista-portal', 'Competencias');
}
