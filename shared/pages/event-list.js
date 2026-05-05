/**
 * Event List — IFRAME PORTAL EDITION
 *
 * v2.0.0 (2026-05-05+): este módulo ya NO renderiza el listado de eventos
 * localmente. Monta un <iframe> apuntando al portal del repo
 * `naowee-test-digitacion`:
 *
 *   /naowee-test-digitacion/eventos-portal.html
 *
 * Esto unifica la experiencia "Eventos" entre los repos: roles
 * EVENT_MANAGER / EVENT_COORDINATOR / ADMIN / ROOT ven exactamente lo
 * mismo que la demo standalone de digitación, sin duplicar código.
 *
 * Las sub-navegaciones (evento-detalle, stepper de nueva competencia,
 * lista de competencias, detalle, preview) viven dentro del iframe.
 */

const PORTAL_PATH = '/naowee-test-digitacion/eventos-portal.html';
const PORTAL_LOCAL_BASE = 'http://localhost:4800';
const PORTAL_PROD_BASE = 'https://naowee-tech.github.io';

function resolvePortalUrl() {
  const host = window.location.hostname;
  const isLocal = host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0';
  if (isLocal) return PORTAL_LOCAL_BASE + '/eventos-portal.html';
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
