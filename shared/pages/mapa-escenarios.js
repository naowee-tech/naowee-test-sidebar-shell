/**
 * Mapa de escenarios — IFRAME PORTAL EDITION
 *
 * v2.0.0 (2026-05-04+): este módulo ya NO renderiza el mapa localmente.
 * Monta un <iframe> apuntando al portal del repo `naowee-test-escenarios`:
 *
 *   /naowee-test-escenarios/mapa-portal.html
 *
 * Esto garantiza paridad 100% con la versión refinada (v2.0.0) del mapa
 * de escenarios — cualquier ajuste futuro al mapa allá se sincroniza
 * automáticamente acá sin duplicar código.
 *
 * Como el mapa es read-only (no hay submit/close del lado del usuario),
 * no requiere postMessage handlers — el iframe simplemente vive dentro
 * de la región .page del shell.
 */

const PORTAL_PATH = '/naowee-test-escenarios/mapa-portal.html';
const PORTAL_LOCAL_BASE = 'http://localhost:4400';
const PORTAL_PROD_BASE = 'https://naowee-tech.github.io';

function resolvePortalUrl() {
  const host = window.location.hostname;
  const isLocal = host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0';
  if (isLocal) return PORTAL_LOCAL_BASE + '/mapa-portal.html';
  return PORTAL_PROD_BASE + PORTAL_PATH;
}

export function renderMapaEscenariosPage(pageEl) {
  if (!pageEl) return;

  // Limpiar y reemplazar el padding del .page para que el iframe ocupe
  // todo el área disponible (el portal ya trae sus propios paddings).
  pageEl.innerHTML = '';
  pageEl.classList.add('mapa-portal-host');

  const iframe = document.createElement('iframe');
  iframe.className = 'mapa-portal-iframe';
  iframe.src = resolvePortalUrl();
  iframe.title = 'Mapa de escenarios por departamento';
  iframe.setAttribute('loading', 'eager');
  pageEl.appendChild(iframe);
}
