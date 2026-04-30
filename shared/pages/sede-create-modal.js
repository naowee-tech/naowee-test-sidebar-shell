/**
 * Modal Registrar sede o escenario — Paso 1 (Datos de pre-validación).
 * Replica el flujo de:
 *   https://naowee-tech.github.io/naowee-test-escenarios/escenario-08-dashboard.html?mode=multiple
 *
 * Componentes DS (v1.8.0):
 *   - naowee-modal--fixed-header --fixed-footer
 *   - naowee-textfield + label--required + helper--negative
 *   - naowee-dropdown (departamento + municipio en cascada + zona)
 *   - naowee-btn (loud large en footer, quiet small en map actions)
 *   - naowee-shake utility para validación
 *
 * Mapa:
 *   - Leaflet 1.9.4 (cargado vía CDN en perfil.html)
 *   - Tiles CartoDB light_all (base casi blanca)
 *   - Filtro CSS adicional grayscale + brightness para acercarlo a un
 *     blanco aún más limpio
 *   - Marker draggable + click pick mode para ubicar el pin
 *   - "Marcar mi ubicación actual" usa navigator.geolocation
 *
 * Validación: lazy con helper--negative + shake + auto-scroll al primer
 * inválido (recipe del DS v1.8.0).
 */

const _modalState = {
  el: null,
  errors: {},
  map: null,
  marker: null,
  pickMode: false,
  data: {
    nombre: '',
    departamento: '',
    municipio: '',
    catastral: '',
    lat: '',
    lon: '',
    direccion: '',
    corregimiento: '',
    zona: ''
  }
};

/* Centro inicial: Puerto Colombia (igual que el referenciado) */
const DEFAULT_CENTER = [10.9878, -74.9547];
const DEFAULT_ZOOM = 16;

/* Mock departamentos + municipios (subset Colombia) */
const DEPARTAMENTOS = [
  { code: 'antioquia',     label: 'Antioquia' },
  { code: 'cundinamarca',  label: 'Cundinamarca' },
  { code: 'valle',         label: 'Valle del Cauca' },
  { code: 'atlantico',     label: 'Atlántico' },
  { code: 'santander',     label: 'Santander' }
];
const MUNICIPIOS_BY_DEPT = {
  antioquia:    ['Medellín', 'Bello', 'Envigado', 'Itagüí', 'Sabaneta', 'Rionegro', 'Salgar'],
  cundinamarca: ['Bogotá D.C.', 'Soacha', 'Chía', 'Zipaquirá', 'Funza', 'Mosquera'],
  valle:        ['Cali', 'Palmira', 'Buenaventura', 'Tuluá', 'Cartago'],
  atlantico:    ['Barranquilla', 'Soledad', 'Malambo', 'Sabanagrande', 'Puerto Colombia'],
  santander:    ['Bucaramanga', 'Floridablanca', 'Girón', 'Piedecuesta']
};
const ZONAS = ['Urbana', 'Rural', 'Centro'];

export function openCreateSedeModal() {
  if (_modalState.el) return;
  _modalState.errors = {};
  _modalState.map = null;
  _modalState.marker = null;
  _modalState.pickMode = false;
  _modalState.data = {
    nombre:'', departamento:'', municipio:'', catastral:'',
    lat:'', lon:'', direccion:'', corregimiento:'', zona:''
  };

  const overlay = document.createElement('div');
  overlay.className = 'naowee-modal-overlay open sd-modal-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.innerHTML = renderModal();
  document.body.appendChild(overlay);
  _modalState.el = overlay;

  bindModalEvents();
  initMap();
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  if (!_modalState.el) return;
  _modalState.el.classList.add('sd-modal-closing');
  /* Cleanup mapa Leaflet */
  if (_modalState.map) {
    try { _modalState.map.remove(); } catch (_) { /* swallow */ }
    _modalState.map = null;
    _modalState.marker = null;
  }
  setTimeout(() => {
    _modalState.el?.remove();
    _modalState.el = null;
    document.body.style.overflow = '';
  }, 180);
}

/* ─── Validación ─────────────────────────────────────────────────── */
function validate() {
  const errors = {};
  const d = _modalState.data;
  if (!d.nombre.trim() || d.nombre.trim().length < 5)        errors.nombre = true;
  if (!d.departamento)                                       errors.departamento = true;
  if (!d.municipio)                                          errors.municipio = true;
  if (!d.catastral.trim() || d.catastral.replace(/\D/g, '').length < 10) errors.catastral = true;

  /* Coordenadas: ambos required, dentro del rango Colombia (suave). */
  if (!d.lat || isNaN(parseFloat(d.lat))) errors.lat = true;
  if (!d.lon || isNaN(parseFloat(d.lon))) errors.lon = true;

  if (!d.direccion.trim() || d.direccion.trim().length < 5) errors.direccion = true;
  if (!d.zona)                                               errors.zona = true;
  return errors;
}

/* ─── Render ─────────────────────────────────────────────────────── */
function renderModal() {
  const d = _modalState.data;
  const e = _modalState.errors;
  return `
    <div class="naowee-modal naowee-modal--fixed-header naowee-modal--fixed-footer sd-modal" role="document">
      <header class="naowee-modal__header sd-modal__header">
        <div class="naowee-modal__title-group">
          <span class="sd-modal__step">0 de 2</span>
          <h2 class="naowee-modal__title">Datos de pre-validación</h2>
          <div class="naowee-modal__subtitle">Completa la información requerida para verificar la unicidad de la sede o escenario.</div>
        </div>
        <button class="naowee-modal__dismiss" type="button" data-act="close" aria-label="Cerrar">
          ${closeIcon()}
        </button>
      </header>

      <div class="naowee-modal__body sd-modal__body">

        <!-- ══ DATOS BÁSICOS ══ -->
        <div class="sd-form-section">DATOS BÁSICOS</div>

        <!-- Nombre del escenario -->
        <div class="naowee-textfield ${e.nombre ? 'naowee-textfield--error' : ''}" data-field-wrap="nombre">
          <label class="naowee-textfield__label naowee-textfield__label--required" for="sdNombre">
            Nombre del escenario
          </label>
          <div class="naowee-textfield__input-wrap">
            <input class="naowee-textfield__input" type="text" id="sdNombre"
                   placeholder="Centro deportivo Prado"
                   value="${escapeHtml(d.nombre)}"
                   data-field="nombre"
                   minlength="5" maxlength="120" autocomplete="off" />
          </div>
          ${e.nombre ? errorHelper('Debe tener al menos 5 caracteres.') : ''}
        </div>

        <!-- Departamento + Municipio (row) -->
        <div class="sd-grid-2">
          ${renderDepartamentoDropdown(d.departamento, e.departamento)}
          ${renderMunicipioDropdown(d.departamento, d.municipio, e.municipio)}
        </div>

        <!-- Número de registro catastral -->
        <div class="naowee-textfield ${e.catastral ? 'naowee-textfield--error' : ''}" data-field-wrap="catastral">
          <label class="naowee-textfield__label naowee-textfield__label--required" for="sdCatastral">
            Número de registro catastral
          </label>
          <div class="naowee-textfield__input-wrap">
            <input class="naowee-textfield__input" type="text" id="sdCatastral"
                   placeholder="080010101000000010901900000012"
                   value="${escapeHtml(d.catastral)}"
                   data-field="catastral"
                   inputmode="numeric" pattern="[0-9]*" maxlength="30" autocomplete="off" />
          </div>
          ${e.catastral ? errorHelper('Debe tener al menos 10 dígitos.') : ''}
        </div>

        <!-- ══ GEOREFERENCIACIÓN ══ -->
        <div class="sd-form-section">GEOREFERENCIACIÓN</div>

        <!-- Map (Leaflet) -->
        <div class="sd-map-wrap">
          <div id="sdMap" class="sd-map"></div>
        </div>

        <!-- Map action buttons -->
        <div class="sd-map-actions">
          <button class="naowee-btn naowee-btn--quiet naowee-btn--small" type="button" data-act="my-location">
            ${userPinIcon()}
            Marcar mi ubicación actual
          </button>
          <button class="naowee-btn naowee-btn--quiet naowee-btn--small" type="button" data-act="click-map" id="sdBtnClickMap">
            ${targetIcon()}
            Ubicarme en el mapa
          </button>
        </div>

        <!-- Latitud + Longitud (row) — markup portado 1:1 desde el
             reference escenario-08-dashboard.html (.reg-geofield).
             Tooltip custom inline (NO DS tooltip — el del DS no encaja
             porque tiene white-space:nowrap fijo y se enmascara dentro
             del modal scroll). -->
        <div class="sd-row">
          <div class="sd-geofield ${e.lat ? 'sd-geofield--error' : ''}" data-field-wrap="lat">
            <label class="sd-geofield__label" for="sdLat">
              Latitud<span class="sd-req">*</span>
              <span class="sd-geofield__tooltip">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="7"/><path d="M6 6a2 2 0 0 1 4 0c0 1.5-2 2-2 3M8 11v.5" stroke-linecap="round"/></svg>
                <span class="sd-geofield__tooltip-content">Formato decimal. Rango Colombia: -4.23 a 12.53</span>
              </span>
            </label>
            <input type="text" id="sdLat" class="sd-geofield__input"
                   placeholder="0.0000"
                   value="${escapeHtml(d.lat)}"
                   data-field="lat"
                   inputmode="decimal" autocomplete="off" />
            ${e.lat ? errorHelper('Latitud requerida (formato decimal).') : ''}
          </div>
          <div class="sd-geofield ${e.lon ? 'sd-geofield--error' : ''}" data-field-wrap="lon">
            <label class="sd-geofield__label" for="sdLon">
              Longitud<span class="sd-req">*</span>
              <span class="sd-geofield__tooltip">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="7"/><path d="M6 6a2 2 0 0 1 4 0c0 1.5-2 2-2 3M8 11v.5" stroke-linecap="round"/></svg>
                <span class="sd-geofield__tooltip-content">Formato decimal. Rango Colombia: -81.73 a -66.87</span>
              </span>
            </label>
            <input type="text" id="sdLon" class="sd-geofield__input"
                   placeholder="0.0000"
                   value="${escapeHtml(d.lon)}"
                   data-field="lon"
                   inputmode="decimal" autocomplete="off" />
            ${e.lon ? errorHelper('Longitud requerida (formato decimal).') : ''}
          </div>
        </div>

        <!-- Helper informativo: Google Maps link.
             Markup portado 1:1 del reference (.reg-helper) — flex inline,
             sin card background, badge azul mínimo de 12px, texto en
             text-secondary, strong en text-primary regular weight. -->
        <div class="sd-helper">
          <span class="sd-helper__badge">
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="6" y1="4" x2="6" y2="6"/>
              <line x1="6" y1="8" x2="6" y2="8.01"/>
            </svg>
          </span>
          <div class="sd-helper__text">
            <strong>¿Cómo obtener coordenadas desde Google Maps?</strong>
            Para el registro manual puede dirigirse a <a href="https://www.google.com/maps" target="_blank" rel="noopener">Google Maps.</a> Ubique el marcador en la ubicación correspondiente, haga clic derecho sobre el icono y seleccione la primera opción.
          </div>
        </div>

        <!-- Dirección del escenario -->
        <div class="naowee-textfield ${e.direccion ? 'naowee-textfield--error' : ''}" data-field-wrap="direccion">
          <label class="naowee-textfield__label naowee-textfield__label--required" for="sdDireccion">
            Dirección del escenario
          </label>
          <div class="naowee-textfield__input-wrap">
            <input class="naowee-textfield__input" type="text" id="sdDireccion"
                   placeholder="Cl. 6 #No. 16-95, Salgar"
                   value="${escapeHtml(d.direccion)}"
                   data-field="direccion"
                   minlength="5" maxlength="200" autocomplete="street-address" />
          </div>
          ${e.direccion ? errorHelper('Debe tener al menos 5 caracteres.') : ''}
        </div>

        <!-- Corregimiento + Zona (row) -->
        <div class="sd-grid-2">
          <div class="naowee-textfield" data-field-wrap="corregimiento">
            <label class="naowee-textfield__label" for="sdCorregimiento">
              Corregimiento/Vereda/Barrio
            </label>
            <div class="naowee-textfield__input-wrap">
              <input class="naowee-textfield__input" type="text" id="sdCorregimiento"
                     placeholder="Ej: Salgar"
                     value="${escapeHtml(d.corregimiento)}"
                     data-field="corregimiento"
                     maxlength="100" autocomplete="off" />
            </div>
          </div>
          ${renderZonaDropdown(d.zona, e.zona)}
        </div>

      </div>

      <footer class="naowee-modal__footer sd-modal__footer">
        <button class="naowee-btn naowee-btn--loud naowee-btn--large" type="button" data-act="validate">
          Validar y continuar
          ${arrowRightIcon()}
        </button>
      </footer>
    </div>
  `;
}

function renderDepartamentoDropdown(value, hasError) {
  const current = DEPARTAMENTOS.find(d => d.code === value);
  return `
    <div class="naowee-dropdown ${hasError ? 'naowee-dropdown--error' : ''}" id="sdDeptDD" data-field-wrap="departamento">
      <label class="naowee-dropdown__label naowee-dropdown__label--required">Departamento</label>
      <div class="naowee-dropdown__trigger" tabindex="0">
        <span class="${current ? 'naowee-dropdown__value' : 'naowee-dropdown__placeholder'}">
          ${current ? current.label : 'Selecciona departamento'}
        </span>
        <div class="naowee-dropdown__controls">
          <span class="naowee-dropdown__chevron">${chevronDown()}</span>
        </div>
      </div>
      <div class="naowee-dropdown__menu" role="listbox">
        ${DEPARTAMENTOS.map(d => `
          <div class="naowee-dropdown__option ${d.code === value ? 'naowee-dropdown__option--selected' : ''}" data-val="${d.code}">${d.label}</div>
        `).join('')}
      </div>
      ${hasError ? errorHelper() : ''}
    </div>
  `;
}

function renderMunicipioDropdown(deptValue, value, hasError) {
  const municipios = deptValue ? (MUNICIPIOS_BY_DEPT[deptValue] || []) : [];
  const isDisabled = !deptValue;
  return `
    <div class="naowee-dropdown ${hasError ? 'naowee-dropdown--error' : ''} ${isDisabled ? 'naowee-dropdown--disabled' : ''}" id="sdMpioDD" data-field-wrap="municipio">
      <label class="naowee-dropdown__label naowee-dropdown__label--required">Municipio</label>
      <div class="naowee-dropdown__trigger" tabindex="0" ${isDisabled ? 'aria-disabled="true"' : ''}>
        <span class="${value ? 'naowee-dropdown__value' : 'naowee-dropdown__placeholder'}">
          ${value || 'Selecciona municipio'}
        </span>
        <div class="naowee-dropdown__controls">
          <span class="naowee-dropdown__chevron">${chevronDown()}</span>
        </div>
      </div>
      <div class="naowee-dropdown__menu" role="listbox">
        ${municipios.map(m => `
          <div class="naowee-dropdown__option ${m === value ? 'naowee-dropdown__option--selected' : ''}" data-val="${escapeHtml(m)}">${m}</div>
        `).join('')}
      </div>
      ${hasError ? errorHelper() : ''}
    </div>
  `;
}

function renderZonaDropdown(value, hasError) {
  return `
    <div class="naowee-dropdown ${hasError ? 'naowee-dropdown--error' : ''}" id="sdZonaDD" data-field-wrap="zona">
      <label class="naowee-dropdown__label naowee-dropdown__label--required">Zona</label>
      <div class="naowee-dropdown__trigger" tabindex="0">
        <span class="${value ? 'naowee-dropdown__value' : 'naowee-dropdown__placeholder'}">
          ${value || 'Selecciona'}
        </span>
        <div class="naowee-dropdown__controls">
          <span class="naowee-dropdown__chevron">${chevronDown()}</span>
        </div>
      </div>
      <div class="naowee-dropdown__menu" role="listbox">
        ${ZONAS.map(z => `
          <div class="naowee-dropdown__option ${z === value ? 'naowee-dropdown__option--selected' : ''}" data-val="${z}">${z}</div>
        `).join('')}
      </div>
      ${hasError ? errorHelper() : ''}
    </div>
  `;
}

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

/* ─── Mapa Leaflet ────────────────────────────────────────────────── */
function initMap() {
  /* Espera a que Leaflet esté disponible (carga con defer) */
  if (typeof window.L === 'undefined') {
    setTimeout(initMap, 50);
    return;
  }
  const mapEl = document.getElementById('sdMap');
  if (!mapEl) return;

  const map = window.L.map(mapEl, { zoomControl: true, attributionControl: true })
    .setView(DEFAULT_CENTER, DEFAULT_ZOOM);

  /* Tiles CartoDB light_all — base muy clara, casi blanca */
  window.L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 20,
    subdomains: 'abcd',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
  }).addTo(map);

  /* Marker custom DS-styled (naranja accent), draggable */
  const markerIcon = window.L.divIcon({
    className: 'sd-map-marker',
    html: `
      <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.2 0 0 7.2 0 16c0 12 16 24 16 24s16-12 16-24C32 7.2 24.8 0 16 0z" fill="#d74009"/>
        <circle cx="16" cy="16" r="6" fill="#fff"/>
      </svg>
    `,
    iconSize: [32, 40],
    iconAnchor: [16, 40]
  });
  const marker = window.L.marker(DEFAULT_CENTER, { draggable: true, icon: markerIcon }).addTo(map);

  marker.on('dragend', (e) => {
    const { lat, lng } = e.target.getLatLng();
    updateCoords(lat, lng);
  });

  /* Pick mode: click en el mapa coloca el pin (cuando está activo) */
  map.on('click', (e) => {
    if (!_modalState.pickMode) return;
    marker.setLatLng(e.latlng);
    updateCoords(e.latlng.lat, e.latlng.lng);
    _modalState.pickMode = false;
    mapEl.style.cursor = '';
    const btn = document.getElementById('sdBtnClickMap');
    if (btn) btn.classList.remove('sd-btn-active');
  });

  _modalState.map = map;
  _modalState.marker = marker;

  /* Forzar recalc del tamaño cuando el modal termina de abrirse —
     Leaflet calcula el viewport en init, pero el modal aún tenía
     animation/transition, así que el tamaño puede salir mal. */
  setTimeout(() => map.invalidateSize(), 220);
}

/* Sync coords del marker → inputs Lat/Lon (state + DOM) */
function updateCoords(lat, lon) {
  const latStr = parseFloat(lat).toFixed(6);
  const lonStr = parseFloat(lon).toFixed(6);
  _modalState.data.lat = latStr;
  _modalState.data.lon = lonStr;
  const overlay = _modalState.el;
  if (!overlay) return;
  const latInput = overlay.querySelector('#sdLat');
  const lonInput = overlay.querySelector('#sdLon');
  if (latInput) latInput.value = latStr;
  if (lonInput) lonInput.value = lonStr;
  clearFieldError('lat');
  clearFieldError('lon');
}

/* "Marcar mi ubicación actual" — geolocation API */
function useCurrentLocation() {
  if (!navigator.geolocation) {
    flashMapAction('Geolocalización no disponible en este navegador');
    return;
  }
  flashMapAction('Solicitando tu ubicación…');
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      if (_modalState.map && _modalState.marker) {
        _modalState.marker.setLatLng([latitude, longitude]);
        _modalState.map.setView([latitude, longitude], 17, { animate: true });
        updateCoords(latitude, longitude);
        flashMapAction('Ubicación actual marcada');
      }
    },
    (err) => {
      flashMapAction(err.code === 1
        ? 'Permiso denegado para acceder a tu ubicación'
        : 'No se pudo obtener tu ubicación');
    },
    { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
  );
}

/* "Ubicarme en el mapa" — toggle pick mode (cursor crosshair) */
function togglePickMode() {
  _modalState.pickMode = !_modalState.pickMode;
  const overlay = _modalState.el;
  const mapEl = overlay?.querySelector('#sdMap');
  const btn = overlay?.querySelector('#sdBtnClickMap');
  if (mapEl) mapEl.style.cursor = _modalState.pickMode ? 'crosshair' : '';
  if (btn) btn.classList.toggle('sd-btn-active', _modalState.pickMode);
  flashMapAction(_modalState.pickMode
    ? 'Click en el mapa para colocar el pin'
    : 'Modo cancelado');
}

/* ─── Eventos ──────────────────────────────────────────────────────── */
function bindModalEvents() {
  const overlay = _modalState.el;
  if (!overlay) return;

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  /* Botones */
  overlay.querySelectorAll('[data-act]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const act = btn.getAttribute('data-act');
      if (act === 'close') { closeModal(); return; }
      if (act === 'validate') {
        const errors = validate();
        if (Object.keys(errors).length > 0) {
          _modalState.errors = errors;
          showErrorsSurgically(errors);
          return;
        }
        console.info('[sede-create] datos pre-validados:', _modalState.data);
        alert('Datos pre-validados. Aquí continuaría el paso 2 — Datos deportivos (pendiente).');
        closeModal();
        return;
      }
      if (act === 'my-location') { useCurrentLocation(); return; }
      if (act === 'click-map')   { togglePickMode();    return; }
    });
  });

  /* Form fields */
  overlay.querySelectorAll('[data-field]').forEach(input => {
    input.addEventListener('input', (e) => {
      const f = input.getAttribute('data-field');

      /* Catastral: solo dígitos. Cualquier carácter no-numérico se
         descarta en tiempo real. Preservar la posición del cursor para
         que el input no salte al final cuando el usuario edita en el
         medio del string. */
      if (f === 'catastral') {
        const cleaned = e.target.value.replace(/\D/g, '');
        if (cleaned !== e.target.value) {
          const pos = e.target.selectionStart - (e.target.value.length - cleaned.length);
          e.target.value = cleaned;
          try {
            e.target.setSelectionRange(Math.max(0, pos), Math.max(0, pos));
          } catch (_) { /* setSelectionRange not supported on some types */ }
        }
        _modalState.data[f] = cleaned;
      } else {
        _modalState.data[f] = e.target.value;
      }
      clearFieldError(f);
      /* Si editan Lat/Lon manualmente, sync el marker */
      if ((f === 'lat' || f === 'lon') && _modalState.marker) {
        const lat = parseFloat(_modalState.data.lat);
        const lon = parseFloat(_modalState.data.lon);
        if (!isNaN(lat) && !isNaN(lon)) {
          _modalState.marker.setLatLng([lat, lon]);
          if (_modalState.map) _modalState.map.panTo([lat, lon]);
        }
      }
    });
  });

  /* Catastral: bloquear keydown de teclas no-numéricas (mejora UX vs
     stripping post-paste; permite copy/paste pero filtra teclas). */
  const catastralInput = overlay.querySelector('#sdCatastral');
  if (catastralInput) {
    catastralInput.addEventListener('keydown', (e) => {
      /* Permitir teclas de control/navegación */
      const allowed = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab','Home','End','Enter'];
      if (allowed.includes(e.key)) return;
      if (e.metaKey || e.ctrlKey) return;       /* Cmd/Ctrl + A/C/V/X */
      if (!/^\d$/.test(e.key)) e.preventDefault(); /* Solo dígito 0-9 */
    });
  }

  /* Dropdowns */
  wireDeptDropdown(overlay);
  wireMpioDropdown(overlay);
  wireZonaDropdown(overlay);

  /* Esc cierra */
  if (!document._sdModalEscBound) {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && _modalState.el) closeModal();
    });
    document._sdModalEscBound = true;
  }
}

function wireDeptDropdown(overlay) {
  const dd = overlay.querySelector('#sdDeptDD');
  if (!dd) return;
  wireGenericDropdown(overlay, dd, (val) => {
    const prev = _modalState.data.departamento;
    _modalState.data.departamento = val;
    if (prev !== val) _modalState.data.municipio = '';
    clearFieldError('departamento');
    refreshDeptAndMpio(overlay);
  });
}

function wireMpioDropdown(overlay) {
  const dd = overlay.querySelector('#sdMpioDD');
  if (!dd) return;
  if (dd.classList.contains('naowee-dropdown--disabled')) return;
  wireGenericDropdown(overlay, dd, (val) => {
    _modalState.data.municipio = val;
    clearFieldError('municipio');
    /* Update quirúrgico del trigger value (no full refresh) */
    const ph = dd.querySelector('.naowee-dropdown__placeholder, .naowee-dropdown__value');
    if (ph) {
      ph.textContent = val;
      ph.classList.remove('naowee-dropdown__placeholder');
      ph.classList.add('naowee-dropdown__value');
    }
  });
}

function wireZonaDropdown(overlay) {
  const dd = overlay.querySelector('#sdZonaDD');
  if (!dd) return;
  wireGenericDropdown(overlay, dd, (val) => {
    _modalState.data.zona = val;
    clearFieldError('zona');
    const ph = dd.querySelector('.naowee-dropdown__placeholder, .naowee-dropdown__value');
    if (ph) {
      ph.textContent = val;
      ph.classList.remove('naowee-dropdown__placeholder');
      ph.classList.add('naowee-dropdown__value');
    }
  });
}

/* Wiring común para dropdowns con position:fixed (escapan modal scroll) */
function wireGenericDropdown(overlay, dd, onSelect) {
  const trigger = dd.querySelector('.naowee-dropdown__trigger');
  const menu = dd.querySelector('.naowee-dropdown__menu');
  if (!trigger || !menu) return;

  const positionMenu = () => {
    const rect = trigger.getBoundingClientRect();
    menu.style.position = 'fixed';
    menu.style.top = `${rect.bottom + 6}px`;
    menu.style.left = `${rect.left}px`;
    menu.style.width = `${rect.width}px`;
    menu.style.zIndex = '9999';
  };

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const opening = !dd.classList.contains('naowee-dropdown--open');
    /* Cerrar otros dropdowns abiertos */
    overlay.querySelectorAll('.naowee-dropdown--open').forEach(other => {
      if (other !== dd) other.classList.remove('naowee-dropdown--open');
    });
    dd.classList.toggle('naowee-dropdown--open');
    if (opening) positionMenu();
  });

  /* Re-position al scrollear el body del modal */
  const body = overlay.querySelector('.naowee-modal__body');
  body?.addEventListener('scroll', () => {
    if (dd.classList.contains('naowee-dropdown--open')) positionMenu();
  });
  window.addEventListener('resize', () => {
    if (dd.classList.contains('naowee-dropdown--open')) positionMenu();
  });

  dd.querySelectorAll('.naowee-dropdown__option').forEach(opt => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      const val = opt.getAttribute('data-val');
      dd.classList.remove('naowee-dropdown--open');
      onSelect(val);
    });
  });

  document.addEventListener('click', () => {
    dd.classList.remove('naowee-dropdown--open');
  });
}

/* Re-render quirúrgico de dept+mpio cuando cambia el dept */
function refreshDeptAndMpio(overlay) {
  const grid = overlay.querySelector('.sd-grid-2');
  if (!grid) return;
  const d = _modalState.data;
  const e = _modalState.errors;
  grid.innerHTML = `
    ${renderDepartamentoDropdown(d.departamento, e.departamento)}
    ${renderMunicipioDropdown(d.departamento, d.municipio, e.municipio)}
  `;
  wireDeptDropdown(overlay);
  wireMpioDropdown(overlay);
}

/* ─── Validación: surgical errors + shake + scroll ─────────────────── */
function showErrorsSurgically(errors) {
  const overlay = _modalState.el;
  if (!overlay) return;
  const body = overlay.querySelector('.naowee-modal__body');
  let firstInvalid = null;

  Object.keys(errors).forEach(fieldName => {
    const wrap = overlay.querySelector(`[data-field-wrap="${fieldName}"]`);
    if (!wrap) return;
    if (wrap.classList.contains('naowee-dropdown')) {
      wrap.classList.add('naowee-dropdown--error');
    } else if (wrap.classList.contains('sd-geofield')) {
      wrap.classList.add('sd-geofield--error');
    } else {
      wrap.classList.add('naowee-textfield--error');
    }
    let helper = wrap.querySelector('.naowee-helper--negative');
    if (!helper) {
      helper = document.createElement('div');
      helper.className = 'naowee-helper naowee-helper--negative';
      wrap.appendChild(helper);
    }
    const msg = typeof errors[fieldName] === 'string' ? errors[fieldName] : undefined;
    helper.innerHTML = errorHelperInner(msg);
    if (!firstInvalid) firstInvalid = wrap;
  });

  if (firstInvalid && body) {
    const bodyRect = body.getBoundingClientRect();
    const fieldRect = firstInvalid.getBoundingClientRect();
    const targetTop = body.scrollTop + (fieldRect.top - bodyRect.top) - 24;
    body.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
  }

  setTimeout(() => {
    Object.keys(errors).forEach(fieldName => {
      const wrap = overlay.querySelector(`[data-field-wrap="${fieldName}"]`);
      if (!wrap) return;
      wrap.classList.remove('naowee-shake');
      void wrap.offsetWidth;
      wrap.classList.add('naowee-shake');
      setTimeout(() => wrap.classList.remove('naowee-shake'), 500);
    });
  }, 260);
}

function clearFieldError(fieldName) {
  if (!_modalState.errors[fieldName]) return;
  delete _modalState.errors[fieldName];
  const overlay = _modalState.el;
  if (!overlay) return;
  const wrap = overlay.querySelector(`[data-field-wrap="${fieldName}"]`);
  if (wrap) {
    wrap.classList.remove('naowee-textfield--error');
    wrap.classList.remove('naowee-dropdown--error');
    wrap.classList.remove('sd-geofield--error');
    const helper = wrap.querySelector('.naowee-helper--negative');
    if (helper) helper.remove();
  }
}

function flashMapAction(message) {
  const overlay = _modalState.el;
  if (!overlay) return;
  const wrap = overlay.querySelector('.sd-map-wrap');
  if (!wrap) return;
  let toast = wrap.querySelector('.sd-map-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'sd-map-toast';
    wrap.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('sd-map-toast--show');
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => toast.classList.remove('sd-map-toast--show'), 2200);
}

/* ─── Iconos ──────────────────────────────────────────────────────── */
function closeIcon()      { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'; }
function chevronDown()    { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>'; }
function userPinIcon()    { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2"/><path d="M12 7v5M9 13l-2 8M15 13l2 8M9 10h6"/></svg>'; }
function targetIcon()     { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/></svg>'; }
function arrowRightIcon() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>'; }
function infoIcon()       { return '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="7"/><path d="M6 6a2 2 0 0 1 4 0c0 1.5-2 2-2 3M8 11v.5" stroke-linecap="round"/></svg>'; }

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}
