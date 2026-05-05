/**
 * Modal Registrar sede o escenario — IFRAME PORTAL EDITION
 *
 * v2.0.0 (2026-05-04+): este módulo ya NO renderiza el modal localmente.
 * En su lugar abre un overlay con un <iframe> apuntando al portal del
 * repo `naowee-test-escenarios`:
 *
 *   https://naowee-tech.github.io/naowee-test-escenarios/registrar-portal.html
 *
 * Esto garantiza paridad 100% con la versión refinada (v2.0.0) del modal
 * en escenarios — cualquier ajuste futuro al modal allá se sincroniza
 * automáticamente acá sin duplicar código.
 *
 * Comunicación parent ↔ iframe vía postMessage:
 *   ← `{ type:'naowee-sede:ready' }`           (iframe terminó de cargar)
 *   ← `{ type:'naowee-sede:close' }`           (usuario cerró el modal)
 *   ← `{ type:'naowee-sede:submit-success' }`  (registro enviado a revisión)
 *   → `{ type:'naowee-sede:force-close' }`     (parent fuerza cierre)
 *
 * El parent maneja el unmount del overlay y muestra un toast/refresh de
 * la lista de sedes en el evento submit-success.
 */

const PORTAL_PATH = '/naowee-test-escenarios/registrar-portal.html';
const PORTAL_LOCAL_BASE = 'http://localhost:4400';
const PORTAL_PROD_BASE = 'https://naowee-tech.github.io';

function resolvePortalUrl() {
  const host = window.location.hostname;
  const isLocal = host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0';
  if (isLocal) return PORTAL_LOCAL_BASE + '/registrar-portal.html';
  return PORTAL_PROD_BASE + PORTAL_PATH;
}

let _state = {
  overlay: null,
  iframe: null,
  messageHandler: null,
  onSubmitSuccess: null
};

export function openCreateSedeModal(opts) {
  if (_state.overlay) return; // ya abierto
  _state.onSubmitSuccess = opts && opts.onSubmitSuccess;

  const overlay = document.createElement('div');
  overlay.className = 'sede-portal-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Registrar sede o escenario');
  overlay.innerHTML = `
    <iframe
      class="sede-portal-iframe"
      src="${resolvePortalUrl()}"
      title="Registrar sede o escenario"
      allow="geolocation"
      loading="eager"
    ></iframe>
  `;

  // Block scroll del body mientras el modal está abierto
  document.body.style.overflow = 'hidden';
  document.body.appendChild(overlay);

  _state.overlay = overlay;
  _state.iframe = overlay.querySelector('iframe');

  // Listener de postMessage del iframe
  _state.messageHandler = (e) => {
    const msg = e.data;
    if (!msg || typeof msg !== 'object' || msg.source !== 'naowee-sede-portal') return;

    if (msg.type === 'close') {
      closeModal();
    } else if (msg.type === 'submit-success') {
      const cb = _state.onSubmitSuccess;
      closeModal();
      if (typeof cb === 'function') cb();
    }
  };
  window.addEventListener('message', _state.messageHandler);

  // ESC para cerrar (envía force-close al iframe)
  overlay.addEventListener('keydown', onOverlayKeydown);
  document.addEventListener('keydown', onDocKeydown);
}

function onDocKeydown(e) {
  if (e.key !== 'Escape' || !_state.overlay) return;
  // Delegar al portal — su flow tiene un dialog de "datos sin guardar".
  if (_state.iframe && _state.iframe.contentWindow) {
    _state.iframe.contentWindow.postMessage(
      { type: 'naowee-sede:force-close' },
      '*'
    );
  }
}

function onOverlayKeydown(e) {
  if (e.key === 'Escape') onDocKeydown(e);
}

function closeModal() {
  if (!_state.overlay) return;
  if (_state.messageHandler) {
    window.removeEventListener('message', _state.messageHandler);
    _state.messageHandler = null;
  }
  document.removeEventListener('keydown', onDocKeydown);
  _state.overlay.remove();
  _state.overlay = null;
  _state.iframe = null;
  _state.onSubmitSuccess = null;
  document.body.style.overflow = '';
}

// Backwards-compat: la API previa exportaba sólo `openCreateSedeModal`.
// Mantengo `closeCreateSedeModal` exportado por si alguien lo llama desde
// fuera (no era el caso al momento del port, pero es seguro tenerlo).
export function closeCreateSedeModal() {
  if (_state.iframe && _state.iframe.contentWindow) {
    _state.iframe.contentWindow.postMessage(
      { type: 'naowee-sede:force-close' },
      '*'
    );
  } else {
    closeModal();
  }
}
