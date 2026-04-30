/**
 * Mapa de escenarios — vista coroplética con zoom-into-depto.
 * Replica la UX de:
 *   https://naowee-tech.github.io/naowee-test-escenarios/escenario-13-mapa.html
 *
 * Features:
 * - SVG choropleth de Colombia (shared/colombia-hc.svg) con viewBox dinámico
 * - Click en depto → animación viewBox (vector puro, zero pixelado) + breadcrumb
 * - Click en "Colombia" del breadcrumb → reset al país
 * - Tooltip dark con title, región, total grande y top tipos de escenario
 * - Filtros: searchbox + región + tipo + estado + segment CAR + reset
 * - Active chips con DS naowee-tag
 * - Rank card con barras animadas + leyenda de intensidad
 *
 * Componentes DS: naowee-searchbox, naowee-filter-dropdown, naowee-segment,
 * naowee-tag, naowee-helper.
 */

/* ─── DEPTO_NAMES: SVG path id → nombre del depto ───────────────── */
const DEPTO_NAMES = {
  'CO.AM':'Amazonas','CO.AN':'Antioquia','CO.AR':'Arauca','CO.AT':'Atlántico',
  'CO.BL':'Bolívar','CO.BY':'Boyacá','CO.CL':'Caldas','CO.CQ':'Caquetá',
  'CO.CS':'Casanare','CO.CA':'Cauca','CO.CE':'Cesar','CO.CH':'Chocó',
  'CO.CO':'Córdoba','CO.CU':'Cundinamarca','CO.GN':'Guainía','CO.GV':'Guaviare',
  'CO.HU':'Huila','CO.LG':'La Guajira','CO.MA':'Magdalena','CO.ME':'Meta',
  'CO.NA':'Nariño','CO.NS':'Norte de Santander','CO.PU':'Putumayo','CO.QD':'Quindío',
  'CO.RI':'Risaralda','CO.SA':'San Andrés y Providencia','CO.ST':'Santander',
  'CO.SU':'Sucre','CO.TO':'Tolima','CO.VC':'Valle del Cauca','CO.VP':'Vaupés',
  'CO.VD':'Vichada',
  'CO.1136':'Bogotá D.C.',
  'CO.3653':'San Andrés y Providencia'
};

/* ─── Datos: totales + CAR + región por depto ───────────────────── */
const DEPTO_DATA = {
  'Bogotá D.C.':              { total:2900, car:18, region:'Andina' },
  'Antioquia':                { total:2400, car:12, region:'Andina' },
  'Valle del Cauca':          { total:1900, car: 9, region:'Pacífica' },
  'Atlántico':                { total:1600, car: 5, region:'Caribe' },
  'Santander':                { total:1200, car: 4, region:'Andina' },
  'Cundinamarca':             { total:1200, car: 6, region:'Andina' },
  'Bolívar':                  { total: 980, car: 2, region:'Caribe' },
  'Córdoba':                  { total: 870, car: 1, region:'Caribe' },
  'Nariño':                   { total: 820, car: 2, region:'Pacífica' },
  'Boyacá':                   { total: 780, car: 2, region:'Andina' },
  'Norte de Santander':       { total: 720, car: 1, region:'Andina' },
  'Tolima':                   { total: 640, car: 1, region:'Andina' },
  'Magdalena':                { total: 610, car: 1, region:'Caribe' },
  'Cesar':                    { total: 560, car: 0, region:'Caribe' },
  'Caldas':                   { total: 540, car: 2, region:'Andina' },
  'Huila':                    { total: 500, car: 1, region:'Andina' },
  'Risaralda':                { total: 480, car: 2, region:'Andina' },
  'Meta':                     { total: 420, car: 1, region:'Orinoquía' },
  'La Guajira':               { total: 380, car: 0, region:'Caribe' },
  'Sucre':                    { total: 360, car: 0, region:'Caribe' },
  'Cauca':                    { total: 340, car: 1, region:'Pacífica' },
  'Chocó':                    { total: 280, car: 0, region:'Pacífica' },
  'Quindío':                  { total: 260, car: 1, region:'Andina' },
  'Casanare':                 { total: 220, car: 0, region:'Orinoquía' },
  'Putumayo':                 { total: 180, car: 0, region:'Amazonía' },
  'Caquetá':                  { total: 160, car: 0, region:'Amazonía' },
  'Arauca':                   { total: 140, car: 0, region:'Orinoquía' },
  'San Andrés y Providencia': { total: 120, car: 0, region:'Insular' },
  'Guaviare':                 { total:  90, car: 0, region:'Amazonía' },
  'Vichada':                  { total:  80, car: 0, region:'Orinoquía' },
  'Amazonas':                 { total:  70, car: 0, region:'Amazonía' },
  'Guainía':                  { total:  45, car: 0, region:'Amazonía' },
  'Vaupés':                   { total:  40, car: 0, region:'Amazonía' }
};

/* ─── TIPO weights + breakdown determinístico por depto ────────── */
const TIPO_WEIGHTS = {
  'Cancha múltiple':    0.34,
  'Estadio':            0.06,
  'Coliseo':            0.10,
  'Piscina':            0.05,
  'Pista atlética':     0.02,
  'Gimnasio':           0.14,
  'Complejo deportivo': 0.11,
  'Otro':               0.18
};
const TIPO_KEYS = Object.keys(TIPO_WEIGHTS);
function hashStr(s){ let h = 2166136261; for(let i=0;i<s.length;i++){ h ^= s.charCodeAt(i); h = (h*16777619)>>>0 } return h }
function deptoTipos(name) {
  const data = DEPTO_DATA[name];
  if (!data) return [];
  const seed = hashStr(name);
  const result = TIPO_KEYS.map((tipo, idx) => {
    const j = 1 + (((seed >> (idx*3)) & 0xff) / 255 - 0.5) * 0.6;
    const raw = Math.round(data.total * (TIPO_WEIGHTS[tipo] || 0) * j);
    return { tipo, count: Math.max(0, raw) };
  });
  return result.sort((a, b) => b.count - a.count);
}

/* Iconos minúsculos por tipo para el tooltip */
const TIPO_ICONS = {
  'Cancha múltiple':    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="M12 5v14M3 12h18"/><circle cx="12" cy="12" r="2"/></svg>',
  'Estadio':            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="12" rx="9" ry="6"/><path d="M12 6v12M3 12h18"/><circle cx="12" cy="12" r="1.2"/></svg>',
  'Coliseo':            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="10" rx="9" ry="3"/><path d="M3 10v7c0 1.7 4 3 9 3s9-1.3 9-3v-7"/><path d="M7 10.5V19M12 10.5V20M17 10.5V19"/></svg>',
  'Piscina':            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 17c1.5-1 3-1 4.5 0S9.5 18 11 17s3-1 4.5 0 3 1 4.5 0 2-1 2-1"/><path d="M2 12c1.5-1 3-1 4.5 0S9.5 13 11 12s3-1 4.5 0 3 1 4.5 0 2-1 2-1"/><path d="M6 12V6a2 2 0 0 1 2-2h1M16 12V6a2 2 0 0 0-2-2h-1"/></svg>',
  'Pista atlética':     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="7" width="19" height="10" rx="5"/><rect x="5.5" y="10" width="13" height="4" rx="2"/></svg>',
  'Gimnasio':           '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="9" width="3" height="6" rx="1"/><rect x="18.5" y="9" width="3" height="6" rx="1"/><rect x="6" y="7" width="3" height="10" rx="1"/><rect x="15" y="7" width="3" height="10" rx="1"/><path d="M9 12h6"/></svg>',
  'Complejo deportivo': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="6" height="9"/><rect x="9" y="6" width="6" height="14"/><rect x="15" y="9" width="6" height="11"/></svg>',
  'Otro':               '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/></svg>'
};

const REGIONS = ['Andina', 'Caribe', 'Pacífica', 'Orinoquía', 'Amazonía', 'Insular'];
const ESTADOS = [
  { code:'todos',     label:'Todos los estados', dot:null },
  { code:'activo',    label:'Activo',            dot:'#1f8923' },
  { code:'revision',  label:'En revisión',       dot:'#d74009' },
  { code:'borrador',  label:'Borrador',          dot:'#8788ab' },
  { code:'rechazado', label:'Rechazado',         dot:'#9e0015' }
];

/* SVG canvas size (after we set viewBox manually) */
const SVG_W = 700, SVG_H = 700;

/* ─── Estado de página ─────────────────────────────────────────── */
const _state = {
  rootEl: null,
  search: '',
  region: null,
  tipo: null,
  estado: 'todos',
  car: 'all',
  /* Nav state machine: country (mapa entero) | depto (zoom in) */
  nav: { level: 'country', depto: null },
  viewBox: { x: 0, y: 0, w: SVG_W, h: SVG_H },
  vbAnimId: null,
  selectedDepto: null,
  svgLoaded: false
};

/* ─── Render principal ─────────────────────────────────────────── */
export function renderMapaEscenariosPage(pageEl) {
  pageEl.classList.remove('um-page');
  pageEl.classList.remove('sd-page');
  pageEl.classList.add('me-page');
  pageEl.innerHTML = renderShell();
  _state.rootEl = pageEl;
  bindEvents(pageEl);
  loadSvgMap();
}

function renderShell() {
  return `
    <div class="me-page-head">
      <h1>Mapa de Escenarios por Departamento</h1>
      <p>Cantidad de escenarios deportivos registrados en el territorio nacional</p>
    </div>

    <div class="me-canvas">
      ${renderFilterToolbar()}

      <div class="me-body">
        <div class="me-map-col">
          ${renderBreadcrumb()}
          <div class="me-stage" id="meStage">
            <div class="me-skeleton" id="meSkeleton">
              <div class="me-skeleton__shape"></div>
              <div class="me-skeleton__hint">Cargando mapa…</div>
            </div>
            <div id="meMapContainer" class="me-map-container"></div>
            <div class="me-zoom" id="meZoom">
              <button type="button" class="me-zoom__btn" data-zoom="in" aria-label="Acercar">${plusIcon()}</button>
              <button type="button" class="me-zoom__btn" data-zoom="out" aria-label="Alejar">${minusIcon()}</button>
            </div>
            <div class="me-tooltip" id="meTooltip" role="tooltip" aria-hidden="true"></div>
          </div>
        </div>

        <aside class="me-rank">
          ${renderRankCard()}
          ${renderLegend()}
        </aside>
      </div>
    </div>
  `;
}

function renderBreadcrumb() {
  const isCountry = _state.nav.level === 'country';
  return `
    <nav class="me-breadcrumb" aria-label="Navegación del mapa">
      ${isCountry
        ? `<span class="me-breadcrumb__current">Colombia</span>`
        : `<button type="button" class="me-breadcrumb__link" data-bc="country">Colombia</button>
           <span class="me-breadcrumb__sep">${chevronRight()}</span>
           <span class="me-breadcrumb__current">${escapeHtml(_state.nav.depto)}</span>`}
    </nav>
  `;
}

function renderFilterToolbar() {
  const hasActive = !!(_state.search || _state.region || _state.tipo || _state.estado !== 'todos' || _state.car !== 'all');
  return `
    <div class="me-toolbar">
      <div class="me-toolbar__row">
        <div class="naowee-searchbox naowee-searchbox--small me-search ${_state.search ? 'naowee-searchbox--has-value' : ''}">
          <div class="naowee-searchbox__input-wrap">
            <span class="naowee-searchbox__icon">${searchIcon()}</span>
            <input type="text" class="naowee-searchbox__input"
                   id="meSearch"
                   placeholder="Buscar departamento o ciudad…"
                   value="${escapeHtml(_state.search)}"
                   autocomplete="off" />
            ${_state.search ? `<button class="naowee-searchbox__clear" type="button" aria-label="Limpiar" id="meSearchClear">${closeIcon()}</button>` : ''}
          </div>
        </div>

        ${renderFilterDD('region', 'Región', REGIONS, _state.region)}
        ${renderFilterDD('tipo', 'Tipo', TIPO_KEYS, _state.tipo)}
        ${renderEstadoFilterDD()}

        <div class="naowee-segment naowee-segment--small me-car-segment" role="tablist">
          <span class="naowee-segment__pill naowee-segment__pill--no-anim" aria-hidden="true"></span>
          <button type="button"
                  class="naowee-segment__item ${_state.car === 'all' ? 'naowee-segment__item--active' : ''}"
                  data-car="all" role="tab" aria-selected="${_state.car === 'all'}">Todos</button>
          <button type="button"
                  class="naowee-segment__item ${_state.car === 'only' ? 'naowee-segment__item--active' : ''}"
                  data-car="only" role="tab" aria-selected="${_state.car === 'only'}">Solo CAR</button>
        </div>

        <button type="button" class="me-filter-reset" id="meReset" ${hasActive ? '' : 'disabled'}>
          Limpiar filtros
        </button>
      </div>

      ${hasActive ? renderActiveChips() : ''}
    </div>
  `;
}

function renderFilterDD(field, label, options, value) {
  const display = value || label;
  return `
    <div class="naowee-filter-dropdown me-dd" data-dd="${field}">
      <button type="button" class="naowee-filter-dropdown__trigger ${value ? 'me-dd__trigger--active' : ''}" data-dd-trigger="${field}">
        <span>${display}</span>
        <span class="naowee-filter-dropdown__chev">${chevronDown()}</span>
      </button>
      <div class="naowee-filter-dropdown__menu" data-dd-menu="${field}">
        ${value ? `<button type="button" class="naowee-filter-dropdown__option me-dd__opt-clear" data-dd-clear="${field}">— Limpiar —</button>` : ''}
        ${options.map(opt => `
          <button type="button" class="naowee-filter-dropdown__option"
                  data-dd-val="${escapeHtml(opt)}" data-dd-field="${field}"
                  aria-selected="${opt === value}">
            ${opt}
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

function renderEstadoFilterDD() {
  const current = ESTADOS.find(e => e.code === _state.estado) || ESTADOS[0];
  const display = current.code === 'todos' ? 'Estado' : current.label;
  return `
    <div class="naowee-filter-dropdown me-dd" data-dd="estado">
      <button type="button" class="naowee-filter-dropdown__trigger ${_state.estado !== 'todos' ? 'me-dd__trigger--active' : ''}" data-dd-trigger="estado">
        <span>${display}</span>
        <span class="naowee-filter-dropdown__chev">${chevronDown()}</span>
      </button>
      <div class="naowee-filter-dropdown__menu" data-dd-menu="estado">
        ${ESTADOS.map(e => `
          <button type="button" class="naowee-filter-dropdown__option me-estado-opt"
                  data-dd-val="${e.code}" data-dd-field="estado"
                  aria-selected="${e.code === _state.estado}">
            ${e.dot
              ? `<span class="me-dd__dot" style="background:${e.dot}"></span>`
              : `<span class="me-dd__dot me-dd__dot--ph"></span>`}
            ${e.label}
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

function renderActiveChips() {
  const chips = [];
  if (_state.search)              chips.push({ label: `"${_state.search}"`, key: 'search' });
  if (_state.region)              chips.push({ label: `Región: ${_state.region}`, key: 'region' });
  if (_state.tipo)                chips.push({ label: `Tipo: ${_state.tipo}`, key: 'tipo' });
  if (_state.estado !== 'todos')  {
    const e = ESTADOS.find(x => x.code === _state.estado);
    chips.push({ label: `Estado: ${e?.label || _state.estado}`, key: 'estado', dot: e?.dot });
  }
  if (_state.car === 'only')      chips.push({ label: 'Solo CAR', key: 'car' });
  if (chips.length === 0) return '';
  return `
    <div class="me-toolbar__chips">
      ${chips.map(c => `
        <span class="naowee-tag naowee-tag--accent naowee-tag--small me-chip">
          ${c.dot ? `<span class="me-chip__dot" style="background:${c.dot}"></span>` : ''}
          ${escapeHtml(c.label)}
          <span class="naowee-tag__active-area" data-chip-remove="${c.key}">
            <span class="naowee-tag__close">${closeIconSmall()}</span>
          </span>
        </span>
      `).join('')}
    </div>
  `;
}

function renderRankCard() {
  const filtered = filteredDeptos();
  const top = [...filtered].sort((a, b) => b.total - a.total).slice(0, 10);
  const max = top[0]?.total || 1;
  return `
    <div class="me-rank__card">
      <div class="me-rank__title">Top departamentos</div>
      ${top.length === 0 ? `
        <div class="me-rank__empty">No hay departamentos con los filtros actuales.</div>
      ` : top.map((d, i) => {
        const pct = (d.total / max * 100).toFixed(1);
        const isSelected = _state.nav.depto === d.name || _state.selectedDepto === d.name;
        return `
          <div class="me-rank__row ${isSelected ? 'me-rank__row--active' : ''}" data-rank-depto="${escapeHtml(d.name)}">
            <div class="me-rank__idx">${i + 1}</div>
            <div class="me-rank__body">
              <div class="me-rank__name-line">
                <span class="me-rank__name">${d.name}</span>
                ${d.car > 0 ? `<span class="me-rank__car-dot" title="${d.car} CAR">CAR</span>` : ''}
              </div>
              <div class="me-rank__bar">
                <div class="me-rank__bar-fill" style="--bar-pct:${pct}%; --bar-delay:${i * 40}ms"></div>
              </div>
            </div>
            <div class="me-rank__value">${formatShort(d.total)}</div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderLegend() {
  return `
    <div class="me-legend">
      <div class="me-legend__title">Intensidad</div>
      <div class="me-legend__gradient"></div>
      <div class="me-legend__ticks">
        <span>Bajo</span><span>Medio</span><span>Alto</span>
      </div>
      <div class="me-legend__row">
        <span class="me-legend__sin-datos"></span>
        Sin datos o fuera del filtro
      </div>
      <div class="me-legend__row">
        <span class="me-rank__car-dot">CAR</span>
        Tiene Centro(s) de Alto Rendimiento
      </div>
    </div>
  `;
}

/* ─── Filtrado ─────────────────────────────────────────────────── */
function filteredDeptos() {
  return Object.entries(DEPTO_DATA)
    .filter(([name, d]) => {
      if (!passesSearch(name)) return false;
      if (_state.region && d.region !== _state.region) return false;
      if (_state.car === 'only' && d.car === 0) return false;
      return true;
    })
    .map(([name, d]) => ({ name, ...d }));
}
function passesRegion(deptoName) {
  return !_state.region || (DEPTO_DATA[deptoName]?.region === _state.region);
}
function passesCar(deptoName) {
  if (_state.car !== 'only') return true;
  return (DEPTO_DATA[deptoName]?.car || 0) > 0;
}
function passesSearch(deptoName) {
  const q = _state.search.trim().toLowerCase();
  if (!q) return true;
  const region = DEPTO_DATA[deptoName]?.region || '';
  return deptoName.toLowerCase().includes(q) || region.toLowerCase().includes(q);
}

/* ─── SVG choropleth: cargar Colombia ──────────────────────────── */
function loadSvgMap() {
  const container = document.getElementById('meMapContainer');
  const skel = document.getElementById('meSkeleton');
  if (!container) return;

  fetch('shared/colombia-hc.svg')
    .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
    .then(svgText => {
      container.innerHTML = svgText;
      _state.svgLoaded = true;
      normalizeSvg(container);
      injectScopedSvgStyles();
      applyChoroplethColors();
      bindSvgEvents(container);
      if (skel) {
        skel.classList.add('me-skeleton--fading');
        setTimeout(() => skel.remove(), 380);
      }
    })
    .catch(err => {
      console.error('[mapa] error cargando colombia-hc.svg:', err);
      if (skel) {
        skel.querySelector('.me-skeleton__hint').textContent = 'No se pudo cargar el mapa.';
      }
    });
}

/* Setea viewBox + preserveAspectRatio, remueve width/height fijos y
   limpia el texto "Highsoft" del SVG base. */
function normalizeSvg(container) {
  const svg = container.querySelector('svg');
  if (!svg) return;
  svg.setAttribute('viewBox', `0 0 ${SVG_W} ${SVG_H}`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.removeAttribute('width');
  svg.removeAttribute('height');
  svg.querySelectorAll('text').forEach(t => {
    if (/highsoft/i.test(t.textContent)) t.remove();
  });
  _state.viewBox = { x: 0, y: 0, w: SVG_W, h: SVG_H };
}

function injectScopedSvgStyles() {
  if (document.getElementById('meSvgScopedStyles')) return;
  const style = document.createElement('style');
  style.id = 'meSvgScopedStyles';
  style.textContent = `
    .me-map-container svg{ width:100%; height:100%; display:block; }
    .me-map-container svg path{
      stroke:#fff; stroke-width:0.6;
      transition: fill .25s ease, filter .35s cubic-bezier(.4,0,.2,1), stroke-width .25s;
      vector-effect: non-scaling-stroke;
    }
    .me-map-container svg path[id^="CO"]:hover,
    .me-map-container svg path[id^="CO"].me-path--active{
      cursor:pointer;
      filter: brightness(1.05) drop-shadow(0 2px 6px rgba(0,0,0,.18));
    }
    .me-map-container svg path[id^="CO"].me-path--depto-active{
      filter: drop-shadow(0 3px 0 rgba(0,0,0,.18))
              drop-shadow(0 5px 0 rgba(0,0,0,.12))
              drop-shadow(0 7px 6px rgba(0,0,0,.18));
      stroke:#ffffff; stroke-width:2.4;
    }
  `;
  document.head.appendChild(style);
}

/* heatColor: idéntico al reference (escala discreta de 7 stops) */
function heatColor(value, max) {
  if (!max || value === 0) return '#e7e9f3';
  const r = value / max;
  if (r >= 0.80) return '#d74009';
  if (r >= 0.55) return '#ef7a3c';
  if (r >= 0.35) return '#f59456';
  if (r >= 0.20) return '#faaf72';
  if (r >= 0.10) return '#fcc693';
  if (r >= 0.05) return '#fddbb4';
  return '#fee8cd';
}

function applyChoroplethColors() {
  if (!_state.svgLoaded) return;
  const container = document.getElementById('meMapContainer');
  if (!container) return;

  let max = 0;
  Object.keys(DEPTO_DATA).forEach(name => {
    if (!passesRegion(name) || !passesCar(name) || !passesSearch(name)) return;
    max = Math.max(max, DEPTO_DATA[name].total);
  });

  /* Foco en depto activo: los demás se grisean, solo el activo conserva color */
  const focused = _state.nav.level === 'depto' ? _state.nav.depto : null;

  Object.entries(DEPTO_NAMES).forEach(([id, name]) => {
    const data = DEPTO_DATA[name];
    /* Inside an attribute selector value, no escaping needed (the dots
       in IDs like "CO.CO" or "CO.1136" are treated literally). Using
       CSS.escape here would prepend backslashes that don't get stripped
       inside quoted values, breaking the selector. */
    const paths = container.querySelectorAll(`path[id="${id}"]`);
    let fill;
    if (!data) {
      fill = '#ecedf5';
    } else if (focused) {
      fill = (name === focused) ? heatColor(data.total, max) : '#ffffff';
    } else if (!passesRegion(name) || !passesCar(name) || !passesSearch(name)) {
      fill = '#ecedf5';
    } else {
      fill = heatColor(data.total, max);
    }
    paths.forEach(p => {
      p.style.fill = fill;
      p.classList.toggle('me-path--depto-active', name === focused);
      p.classList.toggle('me-path--selected', _state.selectedDepto === name);
    });
  });
}

function cssEscape(s) {
  if (typeof CSS !== 'undefined' && CSS.escape) return CSS.escape(s);
  return s.replace(/([^\w-])/g, '\\$1');
}

/* ─── viewBox zoom (vector animado) ──────────────────────────── */
function applyViewBox() {
  const svg = document.querySelector('#meMapContainer svg');
  if (!svg) return;
  const v = _state.viewBox;
  svg.setAttribute('viewBox', `${v.x} ${v.y} ${v.w} ${v.h}`);
}

function animateViewBoxTo(target, duration = 600) {
  if (_state.vbAnimId) clearTimeout(_state.vbAnimId);
  const start = { ..._state.viewBox };
  const t0 = performance.now();
  const ease = t => 1 - Math.pow(1 - t, 3);
  function step() {
    const t = Math.min(1, (performance.now() - t0) / duration);
    const k = ease(t);
    _state.viewBox.x = start.x + (target.x - start.x) * k;
    _state.viewBox.y = start.y + (target.y - start.y) * k;
    _state.viewBox.w = start.w + (target.w - start.w) * k;
    _state.viewBox.h = start.h + (target.h - start.h) * k;
    applyViewBox();
    if (t < 1) _state.vbAnimId = setTimeout(step, 16);
    else _state.vbAnimId = null;
  }
  step();
}

/* Ajusta un viewBox a la relación de aspecto del stage para evitar letterboxing */
function adjustVbToStage(x, y, w, h) {
  const stage = document.getElementById('meStage');
  if (!stage) return { x, y, w, h };
  const ratio = stage.clientWidth / stage.clientHeight;
  const vRatio = w / h;
  if (vRatio > ratio) {
    const newH = w / ratio;
    return { x, y: y - (newH - h) / 2, w, h: newH };
  } else {
    const newW = h * ratio;
    return { x: x - (newW - w) / 2, y, w: newW, h };
  }
}

function bboxForDepto(deptoName) {
  const container = document.getElementById('meMapContainer');
  let combined = null;
  Object.entries(DEPTO_NAMES).forEach(([id, d]) => {
    if (d !== deptoName) return;
    const p = container.querySelector(`path[id="${id}"]`);
    if (!p) return;
    const b = p.getBBox();
    if (!combined) combined = { x: b.x, y: b.y, x2: b.x + b.width, y2: b.y + b.height };
    else {
      combined.x = Math.min(combined.x, b.x);
      combined.y = Math.min(combined.y, b.y);
      combined.x2 = Math.max(combined.x2, b.x + b.width);
      combined.y2 = Math.max(combined.y2, b.y + b.height);
    }
  });
  if (!combined) return null;
  return {
    x: combined.x,
    y: combined.y,
    width:  combined.x2 - combined.x,
    height: combined.y2 - combined.y
  };
}

function zoomToDepto(deptoName) {
  const bbox = bboxForDepto(deptoName);
  if (!bbox) return;
  /* Padding 10% — zoom apretado para que el depto se sienta protagonista
     pero sin tocar los bordes del stage. */
  const pad = 0.10;
  const padX = bbox.width * pad;
  const padY = bbox.height * pad;
  const target = adjustVbToStage(
    bbox.x - padX,
    bbox.y - padY,
    bbox.width + padX * 2,
    bbox.height + padY * 2
  );
  _state.nav.level = 'depto';
  _state.nav.depto = deptoName;
  applyChoroplethColors();
  animateViewBoxTo(target, 700);
  paintBreadcrumb();
  paintRankCard();
}

function resetZoom() {
  _state.nav.level = 'country';
  _state.nav.depto = null;
  applyChoroplethColors();
  animateViewBoxTo(adjustVbToStage(0, 0, SVG_W, SVG_H), 600);
  paintBreadcrumb();
  paintRankCard();
}

/* ─── SVG events (hover + click) ──────────────────────────────── */
function bindSvgEvents(container) {
  const tooltip = document.getElementById('meTooltip');
  let activePath = null;

  container.addEventListener('mouseover', (e) => {
    const path = e.target.closest('path[id]');
    if (!path) return;
    const name = DEPTO_NAMES[path.id];
    if (!name || !DEPTO_DATA[name]) return;
    if (activePath && activePath !== path) activePath.classList.remove('me-path--active');
    path.classList.add('me-path--active');
    activePath = path;
    showTooltip(e.clientX, e.clientY, name);
  });
  container.addEventListener('mousemove', (e) => {
    if (tooltip.classList.contains('me-tooltip--visible')) {
      positionTooltip(e.clientX, e.clientY);
    }
  });
  container.addEventListener('mouseleave', () => {
    hideTooltip();
    if (activePath) {
      activePath.classList.remove('me-path--active');
      activePath = null;
    }
  });
  container.addEventListener('click', (e) => {
    const path = e.target.closest('path[id]');
    if (!path) return;
    const name = DEPTO_NAMES[path.id];
    if (!name || !DEPTO_DATA[name]) return;
    /* Zoom desde nivel país O navegar a otro depto si ya estamos zoomeados */
    if (_state.nav.level === 'country' || _state.nav.depto !== name) {
      zoomToDepto(name);
    }
  });
}

function showTooltip(x, y, deptoName) {
  const tooltip = document.getElementById('meTooltip');
  if (!tooltip) return;
  const d = DEPTO_DATA[deptoName];
  if (!d) return;
  const tipos = deptoTipos(deptoName).slice(0, 3);
  tooltip.innerHTML = `
    <div class="me-tooltip__title">${deptoName}</div>
    <div class="me-tooltip__region">REGIÓN ${d.region.toUpperCase()}</div>
    <div class="me-tooltip__big">
      <span class="me-tooltip__big-label">Escenarios registrados</span>
      <span class="me-tooltip__big-value">${formatNum(d.total)}</span>
    </div>
    <div class="me-tooltip__section-title">TOP TIPOS DE ESCENARIO</div>
    ${tipos.map(t => `
      <div class="me-tooltip__row">
        <span class="me-tooltip__row-icon">${TIPO_ICONS[t.tipo] || ''}</span>
        <span class="me-tooltip__row-label">${t.tipo}</span>
        <span class="me-tooltip__row-value">${formatNum(t.count)}</span>
      </div>
    `).join('')}
    <div class="me-tooltip__footer">
      ${chevronRight()}
      Clic para ver el listado
    </div>
  `;
  tooltip.classList.add('me-tooltip--visible');
  positionTooltip(x, y);
}
function positionTooltip(x, y) {
  const tooltip = document.getElementById('meTooltip');
  if (!tooltip) return;
  const offset = 14;
  const rect = tooltip.getBoundingClientRect();
  let nx = x + offset;
  let ny = y + offset;
  if (nx + rect.width > window.innerWidth - 12)  nx = x - rect.width  - offset;
  if (ny + rect.height > window.innerHeight - 12) ny = y - rect.height - offset;
  tooltip.style.left = `${Math.max(8, nx)}px`;
  tooltip.style.top  = `${Math.max(8, ny)}px`;
}
function hideTooltip() {
  const tooltip = document.getElementById('meTooltip');
  if (tooltip) tooltip.classList.remove('me-tooltip--visible');
}

/* ─── Repaint helpers ────────────────────────────────────────── */
function paintToolbar() {
  const tb = _state.rootEl?.querySelector('.me-toolbar');
  if (tb) {
    tb.outerHTML = renderFilterToolbar();
    bindToolbarEvents(_state.rootEl);
    /* Re-posicionar pill después del repaint */
    requestAnimationFrame(() => positionSegmentPill(_state.rootEl, false));
  }
}
function paintRankCard() {
  const aside = _state.rootEl?.querySelector('.me-rank');
  if (aside) {
    aside.innerHTML = renderRankCard() + renderLegend();
    bindRankEvents(_state.rootEl);
  }
}
function paintBreadcrumb() {
  const bc = _state.rootEl?.querySelector('.me-breadcrumb');
  if (bc) {
    bc.outerHTML = renderBreadcrumb();
    bindBreadcrumbEvents(_state.rootEl);
  }
}

/* ─── Bind events ──────────────────────────────────────────── */
function bindEvents(pageEl) {
  bindToolbarEvents(pageEl);
  bindRankEvents(pageEl);
  bindZoomEvents(pageEl);
  bindBreadcrumbEvents(pageEl);
  /* Posicionar el pill del segment después del primer paint */
  requestAnimationFrame(() => positionSegmentPill(pageEl, false));

  /* Re-posicionar pill en resize (cambia el layout y por ende el x del item) */
  if (!window._meSegResizeBound) {
    window._meSegResizeBound = true;
    window.addEventListener('resize', () => {
      if (_state.rootEl) positionSegmentPill(_state.rootEl, false);
    });
  }
}

/* DS naowee-segment requiere JS para posicionar el pill (background
   blanco con border accent) sobre el item activo. Calcula el offset
   left + width del item activo dentro del segment y los aplica como
   inline styles + CSS variable. */
function positionSegmentPill(pageEl, animate = true) {
  const seg = pageEl.querySelector('.me-car-segment');
  if (!seg) return;
  const pill = seg.querySelector('.naowee-segment__pill');
  const active = seg.querySelector('.naowee-segment__item--active');
  if (!pill || !active) return;
  const segRect = seg.getBoundingClientRect();
  const actRect = active.getBoundingClientRect();
  const segStyle = getComputedStyle(seg);
  const borderL = parseFloat(segStyle.borderLeftWidth) || 0;
  const x = actRect.left - segRect.left - borderL;
  if (animate) {
    pill.classList.remove('naowee-segment__pill--no-anim');
    pill.style.setProperty('--segment-pill-x', x + 'px');
    pill.style.width = actRect.width + 'px';
  } else {
    pill.classList.add('naowee-segment__pill--no-anim');
    pill.style.setProperty('--segment-pill-x', x + 'px');
    pill.style.width = actRect.width + 'px';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      pill.classList.remove('naowee-segment__pill--no-anim');
    }));
  }
}

function bindToolbarEvents(pageEl) {
  const input = pageEl.querySelector('#meSearch');
  if (input) {
    input.addEventListener('input', (e) => {
      _state.search = e.target.value;
      paintToolbar();
      applyChoroplethColors();
      paintRankCard();
      pageEl.querySelector('#meSearch')?.focus();
    });
  }
  pageEl.querySelector('#meSearchClear')?.addEventListener('click', () => {
    _state.search = '';
    paintToolbar();
    applyChoroplethColors();
    paintRankCard();
  });

  pageEl.querySelectorAll('[data-dd-trigger]').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const dd = trigger.closest('.naowee-filter-dropdown');
      pageEl.querySelectorAll('.naowee-filter-dropdown.is-open').forEach(other => {
        if (other !== dd) other.classList.remove('is-open');
      });
      dd.classList.toggle('is-open');
    });
  });
  pageEl.querySelectorAll('[data-dd-val]').forEach(opt => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      const field = opt.getAttribute('data-dd-field');
      const val = opt.getAttribute('data-dd-val');
      _state[field] = val;
      paintToolbar();
      applyChoroplethColors();
      paintRankCard();
    });
  });
  pageEl.querySelectorAll('[data-dd-clear]').forEach(opt => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      const field = opt.getAttribute('data-dd-clear');
      _state[field] = field === 'estado' ? 'todos' : null;
      paintToolbar();
      applyChoroplethColors();
      paintRankCard();
    });
  });
  document.addEventListener('click', () => {
    pageEl.querySelectorAll('.naowee-filter-dropdown.is-open').forEach(d => d.classList.remove('is-open'));
  });

  pageEl.querySelectorAll('[data-car]').forEach(btn => {
    btn.addEventListener('click', () => {
      const newCar = btn.getAttribute('data-car');
      /* Update active state IN PLACE primero (sin repaint) para que el
         pill animate suavemente al nuevo item. Luego applyChoroplethColors
         y rank card sin tocar el toolbar. */
      _state.car = newCar;
      const seg = pageEl.querySelector('.me-car-segment');
      if (seg) {
        seg.querySelectorAll('[data-car]').forEach(b => {
          const active = b.getAttribute('data-car') === newCar;
          b.classList.toggle('naowee-segment__item--active', active);
          b.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        positionSegmentPill(pageEl, true);
      }
      /* Update reset button enabled state + active chips fila sin tocar el row */
      paintToolbar();
      applyChoroplethColors();
      paintRankCard();
    });
  });

  pageEl.querySelector('#meReset')?.addEventListener('click', () => {
    _state.search = '';
    _state.region = null;
    _state.tipo = null;
    _state.estado = 'todos';
    _state.car = 'all';
    _state.selectedDepto = null;
    paintToolbar();
    applyChoroplethColors();
    paintRankCard();
  });

  pageEl.querySelectorAll('[data-chip-remove]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const key = el.getAttribute('data-chip-remove');
      if (key === 'search')      _state.search = '';
      else if (key === 'estado') _state.estado = 'todos';
      else if (key === 'car')    _state.car = 'all';
      else                       _state[key] = null;
      paintToolbar();
      applyChoroplethColors();
      paintRankCard();
    });
  });
}

function bindRankEvents(pageEl) {
  pageEl.querySelectorAll('[data-rank-depto]').forEach(row => {
    row.addEventListener('click', () => {
      const name = row.getAttribute('data-rank-depto');
      if (_state.nav.level === 'country') {
        zoomToDepto(name);
      } else if (_state.nav.depto !== name) {
        zoomToDepto(name);
      }
    });
  });
}

function bindZoomEvents(pageEl) {
  pageEl.querySelectorAll('[data-zoom]').forEach(btn => {
    btn.addEventListener('click', () => {
      const dir = btn.getAttribute('data-zoom');
      /* Zoom in/out manual: factor 1.25× sobre el centro del viewBox */
      const vb = _state.viewBox;
      const factor = dir === 'in' ? 1 / 1.25 : 1.25;
      const newW = vb.w * factor;
      const newH = vb.h * factor;
      const target = {
        x: vb.x + (vb.w - newW) / 2,
        y: vb.y + (vb.h - newH) / 2,
        w: newW,
        h: newH
      };
      animateViewBoxTo(target, 350);
    });
  });
}

function bindBreadcrumbEvents(pageEl) {
  pageEl.querySelectorAll('[data-bc]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const lvl = btn.getAttribute('data-bc');
      if (lvl === 'country') resetZoom();
    });
  });
}

/* ─── Helpers ──────────────────────────────────────────────── */
function formatNum(n) { return n.toLocaleString('es-CO'); }
function formatShort(n) {
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'k';
  return String(n);
}
function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

/* ─── Iconos ──────────────────────────────────────────────── */
function searchIcon()    { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>'; }
function closeIcon()     { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'; }
function closeIconSmall(){ return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'; }
function chevronDown()   { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>'; }
function chevronRight()  { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"/></svg>'; }
function plusIcon()      { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>'; }
function minusIcon()     { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>'; }
