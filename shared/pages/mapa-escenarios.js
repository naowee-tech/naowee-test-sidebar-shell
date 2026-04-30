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

/* ─── Colores por tipo de scenario (pins + carrousel) ──────────── */
const TIPO_COLORS = {
  'Cancha múltiple':    '#2563eb',
  'Estadio':            '#16a34a',
  'Coliseo':            '#a855f7',
  'Piscina':            '#06b6d4',
  'Pista atlética':     '#e11d48',
  'Gimnasio':           '#f59e0b',
  'Complejo deportivo': '#0ea5e9',
  'Otro':               '#6b7280'
};

/* ─── Fotos reales por tipo (Unsplash) ──────────────────────────
   Cada tipo tiene 3 photo IDs de Unsplash que matchean el tipo de
   escenario deportivo. La primera es la "hero" del banner, las 3
   se usan como thumbs en el photo-grid del primer tab.
   Format: photo-{id} → usado como
   https://images.unsplash.com/photo-{id}?w=600&h=400&fit=crop&q=80 */
const TIPO_PHOTOS = {
  'Cancha múltiple': [
    '1546519638-68e109498ffc',   // basketball court outdoor
    '1518091043644-c1d4457512c6', // basketball indoor
    '1574623452334-1e0ac2b3ccb4'  // sports court
  ],
  'Estadio': [
    '1459865264687-595d652de67e', // soccer stadium aerial
    '1518621012420-8ab10887ce2a', // football stadium
    '1577471488278-16eec37ffcc2'  // stadium night
  ],
  'Coliseo': [
    '1577075940232-1db6eb50745a', // arena
    '1565299624946-b28f40a0ae38', // indoor coliseum
    '1571092049816-1d5547728432'  // sports arena interior
  ],
  'Piscina': [
    '1576431260969-3a55f1a72c93', // olympic pool
    '1530549387789-4c1017266635', // swimming pool
    '1532274402911-5a369e4c4bb5'  // pool aerial
  ],
  'Pista atlética': [
    '1517649763962-0c623066013b', // running track
    '1559066653-edfd1e6d0f56',    // athletic field
    '1565992441121-4367c2967103'  // track stadium
  ],
  'Gimnasio': [
    '1534438327276-14e5300c3a48', // gym weights
    '1540497077202-7c8a3999166f', // gym indoor
    '1571902943202-507ec2618e8f'  // fitness center
  ],
  'Complejo deportivo': [
    '1574629810360-7efbbe195018', // sports complex
    '1571019613454-1cb2f99b2d8b', // multi-sport facility
    '1518091043644-c1d4457512c6'  // sports center
  ],
  'Otro': [
    '1517649763962-0c623066013b',
    '1574629810360-7efbbe195018',
    '1571902943202-507ec2618e8f'
  ]
};

function tipoPhotoUrl(tipo, idx, w = 600, h = 400) {
  const photos = TIPO_PHOTOS[tipo] || TIPO_PHOTOS['Otro'];
  const id = photos[idx % photos.length];
  return `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&q=80`;
}

/* ─── Ciudades principales (top deptos con sus capitales + alternas) ── */
const CITIES = [
  { name:'Bogotá',         depto:'Bogotá D.C.',       lat: 4.7110, lon:-74.0721, weight:1.00 },
  { name:'Medellín',       depto:'Antioquia',         lat: 6.2442, lon:-75.5812, weight:0.55 },
  { name:'Envigado',       depto:'Antioquia',         lat: 6.1753, lon:-75.5916, weight:0.15 },
  { name:'Bello',          depto:'Antioquia',         lat: 6.3373, lon:-75.5540, weight:0.15 },
  { name:'Rionegro',       depto:'Antioquia',         lat: 6.1553, lon:-75.3732, weight:0.15 },
  { name:'Cali',           depto:'Valle del Cauca',   lat: 3.4516, lon:-76.5320, weight:0.60 },
  { name:'Palmira',        depto:'Valle del Cauca',   lat: 3.5394, lon:-76.3036, weight:0.20 },
  { name:'Buenaventura',   depto:'Valle del Cauca',   lat: 3.8801, lon:-77.0317, weight:0.20 },
  { name:'Barranquilla',   depto:'Atlántico',         lat:10.9639, lon:-74.7964, weight:0.75 },
  { name:'Soledad',        depto:'Atlántico',         lat:10.9174, lon:-74.7641, weight:0.25 },
  { name:'Bucaramanga',    depto:'Santander',         lat: 7.1193, lon:-73.1227, weight:0.55 },
  { name:'Floridablanca',  depto:'Santander',         lat: 7.0655, lon:-73.0883, weight:0.25 },
  { name:'Barrancabermeja',depto:'Santander',         lat: 7.0653, lon:-73.8547, weight:0.20 },
  { name:'Soacha',         depto:'Cundinamarca',      lat: 4.5793, lon:-74.2168, weight:0.40 },
  { name:'Zipaquirá',      depto:'Cundinamarca',      lat: 5.0268, lon:-74.0090, weight:0.30 },
  { name:'Chía',           depto:'Cundinamarca',      lat: 4.8619, lon:-74.0582, weight:0.30 },
  { name:'Cartagena',      depto:'Bolívar',           lat:10.3910, lon:-75.4794, weight:0.85 },
  { name:'Magangué',       depto:'Bolívar',           lat: 9.2417, lon:-74.7539, weight:0.15 },
  { name:'Montería',       depto:'Córdoba',           lat: 8.7479, lon:-75.8814, weight:0.80 },
  { name:'Lorica',         depto:'Córdoba',           lat: 9.2397, lon:-75.8147, weight:0.20 },
  { name:'Pasto',          depto:'Nariño',            lat: 1.2136, lon:-77.2811, weight:0.70 },
  { name:'Tumaco',         depto:'Nariño',            lat: 1.7988, lon:-78.7639, weight:0.30 },
  { name:'Tunja',          depto:'Boyacá',            lat: 5.5446, lon:-73.3572, weight:0.55 },
  { name:'Duitama',        depto:'Boyacá',            lat: 5.8251, lon:-73.0324, weight:0.25 },
  { name:'Sogamoso',       depto:'Boyacá',            lat: 5.7146, lon:-72.9343, weight:0.20 },
  { name:'Cúcuta',         depto:'Norte de Santander',lat: 7.8939, lon:-72.5078, weight:0.80 },
  { name:'Ocaña',          depto:'Norte de Santander',lat: 8.2369, lon:-73.3561, weight:0.20 },
  { name:'Ibagué',         depto:'Tolima',            lat: 4.4389, lon:-75.2322, weight:0.75 },
  { name:'Espinal',        depto:'Tolima',            lat: 4.1533, lon:-74.8833, weight:0.25 },
  { name:'Santa Marta',    depto:'Magdalena',         lat:11.2408, lon:-74.1990, weight:0.85 },
  { name:'Valledupar',     depto:'Cesar',             lat:10.4631, lon:-73.2532, weight:0.90 },
  { name:'Manizales',      depto:'Caldas',            lat: 5.0703, lon:-75.5138, weight:0.85 },
  { name:'Neiva',          depto:'Huila',             lat: 2.9345, lon:-75.2809, weight:0.85 },
  { name:'Pereira',        depto:'Risaralda',         lat: 4.8133, lon:-75.6961, weight:0.80 },
  { name:'Dosquebradas',   depto:'Risaralda',         lat: 4.8339, lon:-75.6686, weight:0.20 },
  { name:'Villavicencio',  depto:'Meta',              lat: 4.1420, lon:-73.6266, weight:0.85 },
  { name:'Riohacha',       depto:'La Guajira',        lat:11.5444, lon:-72.9072, weight:0.70 },
  { name:'Sincelejo',      depto:'Sucre',             lat: 9.2950, lon:-75.3978, weight:0.95 },
  { name:'Popayán',        depto:'Cauca',             lat: 2.4448, lon:-76.6147, weight:0.90 },
  { name:'Quibdó',         depto:'Chocó',             lat: 5.6947, lon:-76.6610, weight:1.00 },
  { name:'Armenia',        depto:'Quindío',           lat: 4.5339, lon:-75.6811, weight:1.00 },
  { name:'Yopal',          depto:'Casanare',          lat: 5.3378, lon:-72.3959, weight:1.00 },
  { name:'Mocoa',          depto:'Putumayo',          lat: 1.1520, lon:-76.6479, weight:1.00 },
  { name:'Florencia',      depto:'Caquetá',           lat: 1.6144, lon:-75.6062, weight:1.00 },
  { name:'Arauca',         depto:'Arauca',            lat: 7.0900, lon:-70.7617, weight:1.00 },
  { name:'San José del Guaviare', depto:'Guaviare',   lat: 2.5710, lon:-72.6412, weight:1.00 },
  { name:'Puerto Carreño', depto:'Vichada',           lat: 6.1897, lon:-67.4859, weight:1.00 },
  { name:'Leticia',        depto:'Amazonas',          lat:-4.2150, lon:-69.9406, weight:1.00 },
  { name:'Inírida',        depto:'Guainía',           lat: 3.8653, lon:-67.9239, weight:1.00 },
  { name:'Mitú',           depto:'Vaupés',            lat: 1.2538, lon:-70.2339, weight:1.00 },
  { name:'San Andrés',     depto:'San Andrés y Providencia', lat:12.5847, lon:-81.7006, weight:1.00 }
];

/* ─── Mock scenarios generation (PRNG determinístico) ─────────── */
const NOMBRE_PREFIX = {
  'Cancha múltiple':    ['Polideportivo', 'Cancha', 'Centro Deportivo'],
  'Estadio':            ['Estadio', 'Coliseo Cubierto'],
  'Coliseo':            ['Coliseo', 'Polideportivo Mayor'],
  'Piscina':            ['Complejo Acuático', 'Piscina Olímpica', 'Centro Acuático'],
  'Pista atlética':     ['Pista Atlética', 'Estadio de Atletismo'],
  'Gimnasio':           ['Gimnasio', 'Sala de Gimnasia'],
  'Complejo deportivo': ['Villa Olímpica', 'Complejo Deportivo', 'Unidad Deportiva'],
  'Otro':               ['Centro Recreativo', 'Parque Polideportivo']
};
const APELLIDOS = ['Mutis','Bolívar','Santander','Galán','Caldas','Núñez','Reyes','Pardo','Gaitán','Uribe','Rojas','Suárez','Lozano','Mora','Cárdenas','Mendoza','Zúñiga','Ramírez','Quintero','Vargas','Espinosa','Salgado'];
const ESTADOS_CONSERVACION = ['Excelente', 'Bueno', 'Regular'];
const CAPACIDAD_RANGE = {
  'Cancha múltiple':    [200, 1500],
  'Estadio':            [10000, 50000],
  'Coliseo':            [3000, 18000],
  'Piscina':            [500, 4000],
  'Pista atlética':     [3000, 15000],
  'Gimnasio':           [100, 800],
  'Complejo deportivo': [2000, 15000],
  'Otro':               [200, 3000]
};

function prng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 0x100000000; };
}
function generateEscenarios() {
  const rng = prng(42);
  const out = [];
  const totalDeclared = Object.values(DEPTO_DATA).reduce((a, b) => a + b.total, 0);
  const deptoTargets = {};
  Object.entries(DEPTO_DATA).forEach(([d, base]) => {
    /* Cap total mock = 200 escenarios para que el render sea liviano */
    deptoTargets[d] = Math.max(1, Math.round(base.total / totalDeclared * 200));
  });
  let id = 1;
  Object.entries(deptoTargets).forEach(([depto, count]) => {
    const cities = CITIES.filter(c => c.depto === depto);
    if (cities.length === 0) return;
    const totalW = cities.reduce((s, c) => s + c.weight, 0);
    const carBudget = DEPTO_DATA[depto].car;
    let carsAssigned = 0;
    for (let i = 0; i < count; i++) {
      let roll = rng() * totalW;
      let city = cities[0];
      for (const c of cities) { roll -= c.weight; if (roll <= 0) { city = c; break; } }
      let tr = rng();
      let tipo = 'Cancha múltiple';
      let acc = 0;
      for (const [t, w] of Object.entries(TIPO_WEIGHTS)) {
        acc += w;
        if (tr <= acc) { tipo = t; break; }
      }
      const carEligible = carsAssigned < carBudget &&
        ['Coliseo', 'Piscina', 'Pista atlética', 'Complejo deportivo'].includes(tipo);
      const car = carEligible && rng() < 0.45;
      if (car) carsAssigned++;
      const lat = city.lat + (rng() - 0.5) * 0.06;
      const lon = city.lon + (rng() - 0.5) * 0.06;
      const pref = NOMBRE_PREFIX[tipo] || ['Escenario'];
      const nombre = `${pref[Math.floor(rng() * pref.length)]} ${APELLIDOS[Math.floor(rng() * APELLIDOS.length)]}`;
      const cRange = CAPACIDAD_RANGE[tipo] || [200, 2000];
      const cap = Math.round((cRange[0] + rng() * (cRange[1] - cRange[0])) / 50) * 50;
      const anioBase = 1970 + Math.floor(Math.pow(rng(), 0.6) * 53);
      const edad = 2026 - anioBase;
      let estIdx = 0;
      if (edad > 40) estIdx = 2;
      else if (edad > 20) estIdx = rng() < 0.5 ? 1 : 2;
      else estIdx = rng() < 0.7 ? 0 : 1;
      out.push({
        id: id++, nombre, tipo, car,
        depto, cityName: city.name, lat, lon,
        anioConstruccion: anioBase,
        capacidad: cap,
        estado: ESTADOS_CONSERVACION[estIdx]
      });
    }
  });
  return out;
}
let ESCENARIOS = []; /* lazy-init en el primer renderMapa */

/* ─── Proyección lat/lon → SVG (700×700) ──────────────────────── */
const CO_BBOX = { latMin:-4.5, latMax:13.0, lonMin:-82.0, lonMax:-66.5 };
function projectLL(lat, lon) {
  return {
    x: (lon - CO_BBOX.lonMin) / (CO_BBOX.lonMax - CO_BBOX.lonMin) * SVG_W,
    y: (CO_BBOX.latMax - lat) / (CO_BBOX.latMax - CO_BBOX.latMin) * SVG_H
  };
}
const DEPTO_CENTROID = {};
function computeDeptoCentroids() {
  Object.values(DEPTO_NAMES).forEach(d => {
    const b = bboxForDepto(d);
    if (b) DEPTO_CENTROID[d] = { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  });
}
/* Calibrar el pin de la ciudad por el centroide real del depto:
   la capital se ancla al centroide y las hermanas conservan offset relativo. */
function projectCityPin(city) {
  const c = DEPTO_CENTROID[city.depto];
  if (!c) return projectLL(city.lat, city.lon);
  const siblings = CITIES.filter(x => x.depto === city.depto);
  const capital = siblings.reduce((a, b) => b.weight > a.weight ? b : a, siblings[0]);
  const capRaw = projectLL(capital.lat, capital.lon);
  const dx = c.x - capRaw.x;
  const dy = c.y - capRaw.y;
  const raw = projectLL(city.lat, city.lon);
  return { x: raw.x + dx, y: raw.y + dy };
}

/* SVG coords → pixel coords del stage (compensa viewBox actual) */
function svgToPixel(svgX, svgY) {
  const stage = document.getElementById('meStage');
  const svg = document.querySelector('#meMapContainer svg');
  if (!stage || !svg) return { x: 0, y: 0 };
  const stageRect = stage.getBoundingClientRect();
  const svgRect = svg.getBoundingClientRect();
  const v = _state.viewBox;
  const sx = svgRect.width / v.w;
  const sy = svgRect.height / v.h;
  return {
    x: (svgRect.left - stageRect.left) + (svgX - v.x) * sx,
    y: (svgRect.top  - stageRect.top)  + (svgY - v.y) * sy
  };
}

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
  /* Multi-select: arrays vacíos = "todos pasan". Cada filter dropdown
     se vuelve checkbox-list y el usuario puede tildar varios valores. */
  region: [],
  tipo: [],
  estado: [],
  car: 'all',
  /* Nav state machine:
     - country: mapa entero coroplético, sin city pins
     - depto: zoom into depto SVG, city pins overlay visible
     - depto + zoomedCity: sub-zoom centrado en una ciudad para
       separar pins solapados (1er click); 2do click ya entra a city
     - city: switch to Leaflet con tiles reales + scenario pins */
  nav: { level: 'country', depto: null, city: null, zoomedCity: null },
  viewBox: { x: 0, y: 0, w: SVG_W, h: SVG_H },
  vbAnimId: null,
  selectedDepto: null,
  selectedScenarioId: null,    /* id del scenario seleccionado para side panel */
  svgLoaded: false,
  /* Leaflet city map */
  leafletMap: null,
  leafletMarkers: []
};

/* ─── Render principal ─────────────────────────────────────────── */
export function renderMapaEscenariosPage(pageEl) {
  pageEl.classList.remove('um-page');
  pageEl.classList.remove('sd-page');
  pageEl.classList.add('me-page');
  /* Lazy-init de scenarios mock (PRNG determinístico, mismo set entre renders) */
  if (ESCENARIOS.length === 0) ESCENARIOS = generateEscenarios();
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
            <!-- Layer 1+2: SVG choropleth + city pins overlay -->
            <div class="me-map-layer" id="meSvgLayer">
              <div id="meMapContainer" class="me-map-container"></div>
              <div class="me-pin-layer" id="mePinLayer"></div>
            </div>
            <!-- Layer 3: Leaflet con tiles reales (city level) -->
            <div class="me-map-layer me-map-layer--hidden" id="meLeafletLayer" aria-hidden="true">
              <div id="meLeafletMap" class="me-leaflet-map"></div>
            </div>
            <!-- Zoom controls (solo en niveles SVG) -->
            <div class="me-zoom" id="meZoom">
              <button type="button" class="me-zoom__btn" data-zoom="in" aria-label="Acercar">${plusIcon()}</button>
              <button type="button" class="me-zoom__btn" data-zoom="out" aria-label="Alejar">${minusIcon()}</button>
            </div>
            <!-- Floating tooltip (depto hover) -->
            <div class="me-tooltip" id="meTooltip" role="tooltip" aria-hidden="true"></div>
            <!-- Mini-popover (scenario click en city level) -->
            <div class="me-popover" id="mePopover" hidden></div>
          </div>
        </div>

        <!-- Side panel: aside dinámico. Por default muestra rank card.
             Al seleccionar un scenario, swap a la ficha completa con
             carrousel + tabs Información general / Documentación / Historial. -->
        <aside class="me-aside" id="meAside">
          ${renderAsideContent()}
        </aside>
      </div>
    </div>
  `;
}

function renderBreadcrumb() {
  const lvl = _state.nav.level;
  /* DS naowee-breadcrumb — sin custom styling. El DS maneja:
     - __item: text-primary, hover underline (no background pill)
     - __sep: chevron 16px, text-secondary
     - __current: text-accent, no cursor */
  const sep = `<span class="naowee-breadcrumb__sep">${chevronRight()}</span>`;
  const zoomedCity = _state.nav.zoomedCity;
  return `
    <nav class="naowee-breadcrumb me-breadcrumb" aria-label="Navegación del mapa">
      ${lvl === 'country'
        ? `<span class="naowee-breadcrumb__current">Colombia</span>`
        : lvl === 'depto' && zoomedCity
          ? /* Sub-zoom dentro de un depto: Colombia > Depto > Cerca de City */
            `<a class="naowee-breadcrumb__item" data-bc="country">Colombia</a>
             ${sep}
             <a class="naowee-breadcrumb__item" data-bc="depto">${escapeHtml(_state.nav.depto)}</a>
             ${sep}
             <span class="naowee-breadcrumb__current">Cerca de ${escapeHtml(zoomedCity)}</span>`
        : lvl === 'depto'
          ? `<a class="naowee-breadcrumb__item" data-bc="country">Colombia</a>
             ${sep}
             <span class="naowee-breadcrumb__current">${escapeHtml(_state.nav.depto)}</span>`
          : /* city level (Leaflet) */
            `<a class="naowee-breadcrumb__item" data-bc="country">Colombia</a>
             ${sep}
             <a class="naowee-breadcrumb__item" data-bc="depto">${escapeHtml(_state.nav.depto)}</a>
             ${sep}
             <span class="naowee-breadcrumb__current">${escapeHtml(_state.nav.city)}</span>`}
    </nav>
  `;
}

/* Aside dinámico: rank card por default, ficha completa de scenario
   cuando hay uno seleccionado. */
function renderAsideContent() {
  if (_state.selectedScenarioId) {
    const esc = ESCENARIOS.find(e => e.id === _state.selectedScenarioId);
    if (esc) return renderScenarioDetailPanel(esc);
  }
  return `
    <div class="me-rank">
      ${renderRankCard()}
      ${renderLegend()}
    </div>
  `;
}

function renderFilterToolbar() {
  const hasActive = !!(
    _state.search ||
    _state.region.length > 0 ||
    _state.tipo.length > 0 ||
    _state.estado.length > 0 ||
    _state.car !== 'all'
  );
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

function renderFilterDD(field, label, options, selectedValues) {
  const sel = Array.isArray(selectedValues) ? selectedValues : [];
  /* Multi-select display:
     - 0 seleccionados → label del filtro (ej "Tipo")
     - 1 seleccionado → ese valor único (truncado con ellipsis si largo)
     - 2+ seleccionados → "N seleccionados" */
  let display = label;
  if (sel.length === 1) display = sel[0];
  else if (sel.length > 1) display = `${sel.length} seleccionados`;
  const isActive = sel.length > 0;
  return `
    <div class="naowee-filter-dropdown me-dd" data-dd="${field}">
      <button type="button" class="naowee-filter-dropdown__trigger ${isActive ? 'me-dd__trigger--active' : ''}" data-dd-trigger="${field}">
        <span class="me-dd__trigger-label">${display}</span>
        <span class="naowee-filter-dropdown__chev">${chevronDown()}</span>
      </button>
      <div class="naowee-filter-dropdown__menu" data-dd-menu="${field}">
        ${options.map(opt => {
          const isSelected = sel.includes(opt);
          return `
            <button type="button"
                    class="naowee-filter-dropdown__option me-dd__opt-multi ${isSelected ? 'me-dd__opt-multi--selected' : ''}"
                    data-dd-val="${escapeHtml(opt)}" data-dd-field="${field}"
                    aria-selected="${isSelected}">
              <span class="me-dd__opt-check">${isSelected ? checkIcon() : ''}</span>
              <span>${opt}</span>
            </button>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function renderEstadoFilterDD() {
  const sel = _state.estado;  /* array */
  /* Estados visibles (excluimos "todos los estados" del menu — un array
     vacío representa "todos"). */
  const opts = ESTADOS.filter(e => e.code !== 'todos');
  let display = 'Estado';
  if (sel.length === 1) {
    const e = opts.find(x => x.code === sel[0]);
    display = e ? e.label : sel[0];
  } else if (sel.length > 1) {
    display = `${sel.length} seleccionados`;
  }
  const isActive = sel.length > 0;
  return `
    <div class="naowee-filter-dropdown me-dd" data-dd="estado">
      <button type="button" class="naowee-filter-dropdown__trigger ${isActive ? 'me-dd__trigger--active' : ''}" data-dd-trigger="estado">
        <span class="me-dd__trigger-label">${display}</span>
        <span class="naowee-filter-dropdown__chev">${chevronDown()}</span>
      </button>
      <div class="naowee-filter-dropdown__menu" data-dd-menu="estado">
        ${opts.map(e => {
          const isSelected = sel.includes(e.code);
          return `
            <button type="button"
                    class="naowee-filter-dropdown__option me-dd__opt-multi ${isSelected ? 'me-dd__opt-multi--selected' : ''}"
                    data-dd-val="${e.code}" data-dd-field="estado"
                    aria-selected="${isSelected}">
              <span class="me-dd__opt-check">${isSelected ? checkIcon() : ''}</span>
              ${e.dot ? `<span class="me-dd__dot" style="background:${e.dot}"></span>` : ''}
              <span>${e.label}</span>
            </button>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function renderActiveChips() {
  /* Multi-select: un chip por cada valor seleccionado, así el usuario
     puede quitarlos individualmente. data-chip-remove encodea el
     campo + valor con formato "field:value" para chips multi, "field"
     simple para search/car. */
  const chips = [];
  if (_state.search) chips.push({ label: `"${_state.search}"`, removeKey: 'search' });
  _state.region.forEach(v => chips.push({ label: `Región: ${v}`, removeKey: `region:${v}` }));
  _state.tipo.forEach(v => chips.push({ label: `Tipo: ${v}`, removeKey: `tipo:${v}` }));
  _state.estado.forEach(code => {
    const e = ESTADOS.find(x => x.code === code);
    chips.push({ label: `Estado: ${e?.label || code}`, removeKey: `estado:${code}`, dot: e?.dot });
  });
  if (_state.car === 'only') chips.push({ label: 'Solo CAR', removeKey: 'car' });
  if (chips.length === 0) return '';
  return `
    <div class="me-toolbar__chips">
      ${chips.map(c => `
        <span class="naowee-tag naowee-tag--accent naowee-tag--small me-chip">
          ${c.dot ? `<span class="me-chip__dot" style="background:${c.dot}"></span>` : ''}
          ${escapeHtml(c.label)}
          <span class="naowee-tag__active-area" data-chip-remove="${escapeHtml(c.removeKey)}">
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
      if (_state.region.length > 0 && !_state.region.includes(d.region)) return false;
      if (_state.car === 'only' && d.car === 0) return false;
      return true;
    })
    .map(([name, d]) => ({ name, ...d }));
}
/* Multi-select: array vacío = pasa todo. Si hay valores, debe matchear
   alguno (OR semantics). */
function passesRegion(deptoName) {
  if (_state.region.length === 0) return true;
  const r = DEPTO_DATA[deptoName]?.region;
  return r && _state.region.includes(r);
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
      computeDeptoCentroids();      /* para projectCityPin posterior */
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

function animateViewBoxTo(target, duration = 700) {
  if (_state.vbAnimId) cancelAnimationFrame(_state.vbAnimId);
  const start = { ..._state.viewBox };
  const t0 = performance.now();
  /* Easing cubic-bezier(0.16, 1, 0.3, 1) — "out-expo" smooth para zoom
     de mapa. Más natural que power-3 ease-out (mismo curve que Apple). */
  const ease = t => 1 - Math.pow(1 - t, 4);
  function step() {
    const t = Math.min(1, (performance.now() - t0) / duration);
    const k = ease(t);
    _state.viewBox.x = start.x + (target.x - start.x) * k;
    _state.viewBox.y = start.y + (target.y - start.y) * k;
    _state.viewBox.w = start.w + (target.w - start.w) * k;
    _state.viewBox.h = start.h + (target.h - start.h) * k;
    applyViewBox();
    if (t < 1) _state.vbAnimId = requestAnimationFrame(step);
    else _state.vbAnimId = null;
  }
  /* requestAnimationFrame en vez de setTimeout(step, 16) → sync con
     display refresh rate, sin tearing ni stuttering. */
  _state.vbAnimId = requestAnimationFrame(step);
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
  _state.nav.city = null;
  _state.nav.zoomedCity = null;       /* reset sub-zoom al cambiar de depto */
  _state.selectedScenarioId = null;
  hideLeafletLayer();
  showSvgLayer();
  applyChoroplethColors();
  animateViewBoxTo(target, 700);
  paintBreadcrumb();
  paintAside();
  /* Renderizar city pins después de que la animación termine */
  setTimeout(renderCityPins, 720);
  /* También en cada step para que sigan al viewBox */
  scheduleRenderPinsDuringAnim();
}

/* Render pins en cada paso de la animación del viewBox así siguen el zoom */
function scheduleRenderPinsDuringAnim() {
  let lastT = 0;
  const tick = () => {
    if (!_state.vbAnimId) return;
    const now = performance.now();
    if (now - lastT > 50) {
      renderCityPins();
      lastT = now;
    }
    requestAnimationFrame(tick);
  };
  tick();
}

function resetZoom() {
  _state.nav.level = 'country';
  _state.nav.depto = null;
  _state.nav.city = null;
  _state.nav.zoomedCity = null;
  _state.selectedScenarioId = null;
  hideLeafletLayer();
  showSvgLayer();
  applyChoroplethColors();
  clearCityPins();
  animateViewBoxTo(adjustVbToStage(0, 0, SVG_W, SVG_H), 600);
  paintBreadcrumb();
  paintAside();
}

/* ─── Layer toggle (SVG vs Leaflet) ────────────────────────── */
function showSvgLayer() {
  const root = _state.rootEl;
  if (!root) return;
  root.querySelector('#meSvgLayer')?.classList.remove('me-map-layer--hidden');
  root.querySelector('#meLeafletLayer')?.classList.add('me-map-layer--hidden');
  /* `.me-zoom` siempre visible — funciona para SVG y Leaflet (ver bindZoomEvents). */
}
function hideSvgLayer() {
  const root = _state.rootEl;
  if (!root) return;
  root.querySelector('#meSvgLayer')?.classList.add('me-map-layer--hidden');
}
function showLeafletLayer() {
  const root = _state.rootEl;
  if (!root) return;
  root.querySelector('#meLeafletLayer')?.classList.remove('me-map-layer--hidden');
  root.querySelector('#meSvgLayer')?.classList.add('me-map-layer--hidden');
}
function hideLeafletLayer() {
  const root = _state.rootEl;
  if (!root) return;
  root.querySelector('#meLeafletLayer')?.classList.add('me-map-layer--hidden');
}

/* ─── City pins overlay (depto level) ──────────────────────── */
function clearCityPins() {
  const layer = _state.rootEl?.querySelector('#mePinLayer');
  if (layer) layer.innerHTML = '';
}

function renderCityPins() {
  if (_state.nav.level !== 'depto') return;
  const layer = _state.rootEl?.querySelector('#mePinLayer');
  if (!layer) return;
  const cities = CITIES.filter(c => c.depto === _state.nav.depto);
  const html = cities.map(city => {
    const escs = ESCENARIOS.filter(e => e.cityName === city.name && passesScenarioFilters(e));
    if (escs.length === 0) return '';
    const hasCar = escs.some(e => e.car);
    const tipoCount = {};
    escs.forEach(e => { tipoCount[e.tipo] = (tipoCount[e.tipo] || 0) + 1; });
    const dominant = Object.entries(tipoCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Otro';
    const tColor = TIPO_COLORS[dominant] || '#6b7280';
    const svg = projectCityPin(city);
    const pos = svgToPixel(svg.x, svg.y);
    /* Pulse + ring extra cuando este pin es el zoomedCity (1er click)
       — invita al segundo click para entrar al city level (Leaflet). */
    const isZoomed = _state.nav.zoomedCity === city.name;
    return `
      <button type="button" class="me-cluster-pin ${isZoomed ? 'me-cluster-pin--zoomed' : ''}" style="
        left:${pos.x}px;
        top:${pos.y}px;
        --tipo-color:${tColor};
      " data-city="${escapeHtml(city.name)}" title="${city.name}: ${escs.length} escenarios">
        <span class="me-cluster-pin__count">${escs.length}</span>
        <span class="me-cluster-pin__sep"></span>
        <span class="me-cluster-pin__label">${city.name}</span>
        ${hasCar ? `<span class="me-cluster-pin__car">${starIcon()}</span>` : ''}
      </button>
    `;
  }).filter(Boolean).join('');
  layer.innerHTML = html;
  layer.querySelectorAll('[data-city]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const cityName = btn.getAttribute('data-city');
      const city = CITIES.find(c => c.name === cityName && c.depto === _state.nav.depto);
      if (city) tryEnterCity(city);
    });
  });
}

/* Two-click pattern: si esta city ya está sub-zoomed → entra a Leaflet.
   Si es el primer click → sub-zoom para separar pins solapados. */
function tryEnterCity(city) {
  if (_state.nav.zoomedCity === city.name) {
    enterCity(city);
    return;
  }
  _state.nav.zoomedCity = city.name;
  zoomToCityVicinity(city);
  /* Re-render pins durante la animación así el --zoomed pulse aparece */
  scheduleRenderPinsDuringAnim();
  /* Update breadcrumb a "Colombia > [Depto] > Cerca de [City]" */
  paintBreadcrumb();
}

/* Sub-zoom centrado en la city con radio ~0.25° (~28km) — suficiente
   para separar visualmente las cities cercanas pero todavía mostrando
   la silueta del depto alrededor. */
function zoomToCityVicinity(city) {
  const RADIUS = 0.25;
  const center = projectCityPin(city);
  const tl = projectLL(city.lat + RADIUS, city.lon - RADIUS);
  const br = projectLL(city.lat - RADIUS, city.lon + RADIUS);
  const w = br.x - tl.x;
  const h = br.y - tl.y;
  animateViewBoxTo(adjustVbToStage(
    center.x - w / 2,
    center.y - h / 2,
    w, h
  ), 700);
}

/* ─── City level (Leaflet) ─────────────────────────────────── */
function enterCity(city) {
  _state.nav.level = 'city';
  _state.nav.city = city.name;
  _state.nav.zoomedCity = null;       /* ya estamos al nivel city, no aplica */
  _state.selectedScenarioId = null;
  clearCityPins();
  hideSvgLayer();
  showLeafletLayer();
  initLeafletCity(city);
  paintBreadcrumb();
  paintAside();
}

function initLeafletCity(city) {
  if (typeof window.L === 'undefined') {
    setTimeout(() => initLeafletCity(city), 50);
    return;
  }
  /* Limpiar instancia previa si existe */
  if (_state.leafletMap) {
    try { _state.leafletMap.remove(); } catch (_) { /* swallow */ }
    _state.leafletMap = null;
    _state.leafletMarkers = [];
  }
  const mapEl = document.getElementById('meLeafletMap');
  if (!mapEl) return;
  /* zoomControl:false → desactivamos los +/- nativos de Leaflet (top-left)
     porque ya tenemos `.me-zoom` custom que funciona para SVG y Leaflet.
     Tener ambos producía dos pares de botones apilados en la misma esquina. */
  const map = window.L.map(mapEl, { zoomControl: false, attributionControl: true })
    .setView([city.lat, city.lon], 14);
  window.L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    subdomains: 'abcd',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
  }).addTo(map);
  _state.leafletMap = map;
  setTimeout(() => map.invalidateSize(), 220);
  paintScenarioMarkers();
}

/* Scenario markers (Leaflet) — pin estilizado por tipo */
function paintScenarioMarkers() {
  if (!_state.leafletMap || !window.L) return;
  _state.leafletMarkers.forEach(m => _state.leafletMap.removeLayer(m));
  _state.leafletMarkers = [];

  const escs = ESCENARIOS.filter(e =>
    e.cityName === _state.nav.city &&
    passesScenarioFilters(e)
  );

  escs.forEach(esc => {
    const color = TIPO_COLORS[esc.tipo] || '#6b7280';
    const isSelected = _state.selectedScenarioId === esc.id;
    /* Pin con fondo colored, ícono blanco del tipo. CAR = star amarilla overlay. */
    const html = `
      <div class="me-scn-pin ${isSelected ? 'me-scn-pin--selected' : ''}" style="--tipo-color:${color}">
        <div class="me-scn-pin__bubble">
          <span class="me-scn-pin__icon">${TIPO_ICONS[esc.tipo] || ''}</span>
          ${esc.car ? `<span class="me-scn-pin__car">${starIconFilled()}</span>` : ''}
        </div>
        <div class="me-scn-pin__tail"></div>
      </div>
    `;
    const icon = window.L.divIcon({
      className: '',
      html,
      iconSize: [40, 50],
      iconAnchor: [20, 50]
    });
    const marker = window.L.marker([esc.lat, esc.lon], { icon, riseOnHover: true })
      .addTo(_state.leafletMap);
    marker.on('click', () => {
      _state.selectedScenarioId = esc.id;
      paintScenarioMarkers();         /* re-paint para actualizar selected state */
      showScenarioPopover(esc);
      /* No mostramos el side panel aún — esperamos al click "Ver perfil completo" */
    });
    _state.leafletMarkers.push(marker);
  });
}

/* ─── Scenario popover (mini card on click) ────────────────── */
function showScenarioPopover(esc) {
  const root = _state.rootEl;
  if (!root) return;
  const pop = root.querySelector('#mePopover');
  if (!pop) return;
  const stage = root.querySelector('#meStage');
  const stageRect = stage.getBoundingClientRect();
  /* Convertir lat/lon a pixel del stage usando Leaflet */
  if (!_state.leafletMap) return;
  const point = _state.leafletMap.latLngToContainerPoint([esc.lat, esc.lon]);
  const px = point.x;
  const py = point.y;
  /* Popover layout — pattern del reference:
     - Icon colored + título + tipo (mismo color del icon, no opaco
       como cyan random) + CAR badge a la derecha
     - Grid 2×2 con labels muted (#9ca0b8) tipo modal section divider
     - CTA "Ver perfil completo" cream con hover */
  pop.innerHTML = `
    <div class="me-popover__head">
      <div class="me-popover__icon" style="--tipo-color:${TIPO_COLORS[esc.tipo] || '#6b7280'}">
        ${TIPO_ICONS[esc.tipo] || ''}
      </div>
      <div class="me-popover__titles">
        <div class="me-popover__title">${escapeHtml(esc.nombre)}</div>
        <div class="me-popover__sub">
          <span class="me-popover__tipo" style="color:${TIPO_COLORS[esc.tipo] || '#6b7280'}">${esc.tipo}</span>
          ${esc.car ? `<span class="me-popover__car"><span class="me-popover__car-star">★</span> CAR</span>` : ''}
        </div>
      </div>
      <button type="button" class="me-popover__close" data-pop-close aria-label="Cerrar">${closeIcon()}</button>
    </div>
    <div class="me-popover__grid">
      <div>
        <div class="me-popover__label">AÑO</div>
        <div class="me-popover__val">${esc.anioConstruccion}</div>
      </div>
      <div>
        <div class="me-popover__label">CAPACIDAD</div>
        <div class="me-popover__val">${formatNum(esc.capacidad)}</div>
      </div>
      <div>
        <div class="me-popover__label">ESTADO</div>
        <div class="me-popover__val">
          <span class="me-popover__estado-dot" style="background:${estadoColor(esc.estado)}"></span>
          ${esc.estado}
        </div>
      </div>
      <div>
        <div class="me-popover__label">MUNICIPIO</div>
        <div class="me-popover__val">${esc.cityName}</div>
      </div>
    </div>
    <button type="button" class="me-popover__cta" data-pop-detail>Ver perfil completo</button>
  `;
  pop.style.left = `${Math.max(8, px - 165)}px`;
  pop.style.top = `${Math.max(8, py - 290)}px`;
  pop.hidden = false;
  pop.querySelector('[data-pop-close]')?.addEventListener('click', () => hideScenarioPopover());
  pop.querySelector('[data-pop-detail]')?.addEventListener('click', () => {
    hideScenarioPopover();
    paintAside();              /* renderiza el side panel detallado */
  });
}
function hideScenarioPopover() {
  const pop = _state.rootEl?.querySelector('#mePopover');
  if (pop) pop.hidden = true;
}
function estadoColor(estado) {
  if (estado === 'Excelente') return '#1f8923';
  if (estado === 'Bueno')     return '#22c55e';
  if (estado === 'Regular')   return '#f59e0b';
  return '#9e0015';
}

/* ─── Side panel detallado ──────────────────────────────────── */
function renderScenarioDetailPanel(esc) {
  return `
    <div class="me-detail">
      <button type="button" class="me-detail__close" data-detail-close aria-label="Cerrar ficha">${closeIcon()}</button>

      <!-- Banner: foto hero estática (sin nav, sin dots). El carrousel
           navegable vive en la sección de thumbnails dentro del primer
           tab — patrón Airbnb (hero arriba + galería navegable abajo).
           onerror fallback al gradient con --tipo-color si Unsplash falla. -->
      <div class="me-detail__carrousel" style="--tipo-color:${TIPO_COLORS[esc.tipo]}">
        <img class="me-detail__photo-img"
             src="${tipoPhotoUrl(esc.tipo, 0, 600, 360)}"
             alt="${escapeHtml(esc.tipo)}"
             onerror="this.style.display='none';this.parentElement.classList.add('me-detail__carrousel--fallback')" />
      </div>

      <div class="me-detail__head">
        <span class="me-detail__tipo-badge" style="--tipo-color:${TIPO_COLORS[esc.tipo]}">
          ${TIPO_ICONS[esc.tipo] || ''} ${esc.tipo}
        </span>
        <h2 class="me-detail__name">${escapeHtml(esc.nombre)}</h2>
        <div class="me-detail__location">
          ${esc.cityName}, ${esc.depto}
          ${esc.car ? `<span class="me-detail__car-badge">★ CAR</span>` : ''}
        </div>
      </div>

      <!-- Tabs Información general / Documentación / Historial — DS naowee-tabs.
           Versión simple del DS (igual al playground): naowee-tabs +
           naowee-tab + naowee-tab--selected. El underline pipe activo lo
           maneja el ::after del DS — no necesitamos --animated ni
           __indicator. -->
      <div class="naowee-tabs naowee-tabs--proportional me-detail__tabs">
        <button type="button" class="naowee-tab naowee-tab--selected" data-tab="info">Información general</button>
        <button type="button" class="naowee-tab" data-tab="docs">Documentación</button>
        <button type="button" class="naowee-tab" data-tab="hist">Historial</button>
      </div>

      <div class="me-detail__tab-content" data-tab-content="info">
        <!-- Galería navegable de thumbs: 3 slides full-width con prev/next
             overlay. Cada slide es una foto del tipo de escenario; los
             dots indican la posición. Patrón Airbnb (gallery con nav). -->
        <div class="me-detail__photo-gallery" data-car-root>
          <div class="me-detail__gallery-track" data-car-track>
            ${[0, 1, 2].map(i => `
              <div class="me-detail__gallery-slide" style="--tipo-color:${TIPO_COLORS[esc.tipo]}">
                <img src="${tipoPhotoUrl(esc.tipo, i, 600, 360)}" alt="${escapeHtml(esc.tipo)} — foto ${i + 1}"
                     onerror="this.style.display='none';this.parentElement.classList.add('me-detail__gallery-slide--fallback')" />
              </div>
            `).join('')}
          </div>
          <button type="button" class="me-detail__car-nav me-detail__car-nav--prev" data-car-prev aria-label="Foto anterior">
            ${chevronLeftIcon()}
          </button>
          <button type="button" class="me-detail__car-nav me-detail__car-nav--next" data-car-next aria-label="Foto siguiente">
            ${chevronRightIcon()}
          </button>
          <div class="me-detail__car-dots" role="tablist" aria-label="Paginación de fotos">
            ${[0, 1, 2].map(i => `
              <button type="button" class="me-detail__car-dot ${i === 0 ? 'me-detail__car-dot--active' : ''}"
                      data-car-dot="${i}" role="tab" aria-label="Ir a foto ${i + 1}"></button>
            `).join('')}
          </div>
        </div>

        <div class="me-detail__section">DATOS DE PRE-VALIDACIÓN</div>
        <dl class="me-detail__dl">
          <dt>Nombre del escenario</dt><dd>${escapeHtml(esc.nombre)}</dd>
          <dt>Departamento</dt><dd>${esc.depto}</dd>
          <dt>Municipio</dt><dd>${esc.cityName}</dd>
          <dt>Año de construcción</dt><dd>${esc.anioConstruccion}</dd>
          <dt>Capacidad</dt><dd>${formatNum(esc.capacidad)} personas</dd>
          <dt>Estado de conservación</dt>
          <dd>
            <span class="me-popover__estado-dot" style="background:${estadoColor(esc.estado)}"></span>
            ${esc.estado}
          </dd>
          <dt>Centro de Alto Rendimiento</dt><dd>${esc.car ? 'Sí' : 'No'}</dd>
        </dl>
      </div>

      <div class="me-detail__tab-content" data-tab-content="docs" hidden>
        <div class="me-detail__empty">
          <div class="me-detail__empty-icon">${docIcon()}</div>
          <div class="me-detail__empty-title">Documentación pendiente</div>
          <div class="me-detail__empty-desc">Acta de recepción, certificado catastral, planos arquitectónicos.</div>
        </div>
      </div>

      <div class="me-detail__tab-content" data-tab-content="hist" hidden>
        <ul class="me-detail__timeline">
          <li class="me-detail__tl-item">
            <span class="me-detail__tl-dot me-detail__tl-dot--positive"></span>
            <div>
              <div class="me-detail__tl-date">Abr. 24, 2026</div>
              <div class="me-detail__tl-text">Inspección anual aprobada</div>
            </div>
          </li>
          <li class="me-detail__tl-item">
            <span class="me-detail__tl-dot me-detail__tl-dot--neutral"></span>
            <div>
              <div class="me-detail__tl-date">Feb. 12, 2025</div>
              <div class="me-detail__tl-text">Renovación de iluminación LED</div>
            </div>
          </li>
          <li class="me-detail__tl-item">
            <span class="me-detail__tl-dot me-detail__tl-dot--neutral"></span>
            <div>
              <div class="me-detail__tl-date">${esc.anioConstruccion}</div>
              <div class="me-detail__tl-text">Construcción inicial</div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  `;
}

/* ─── Filtros para scenarios (tipo + car + estado) ─────────── */
function passesScenarioFilters(esc) {
  if (_state.tipo.length > 0 && !_state.tipo.includes(esc.tipo)) return false;
  if (_state.car === 'only' && !esc.car) return false;
  /* Estado del scenario es de mock (excelente/bueno/regular), no de
     workflow (activo/revision/borrador/rechazado). El filtro 'estado'
     del toolbar opera a nivel depto solamente — los scenarios siempre
     pasan ese check. */
  return true;
}

/* ─── Iconos de soporte para detail panel ──────────────────── */
function starIcon()       { return '<svg viewBox="0 0 24 24" fill="#fbbf24" stroke="#f59e0b" stroke-width="1.5"><polygon points="12 2 15 9 22 10 17 15 18 22 12 19 6 22 7 15 2 10 9 9"/></svg>'; }
/* Estrella sutil para CAR badge — solo fill amarillo claro, sin stroke
   muy contrastado, así el badge se siente accent ligero, no llamativo. */
function starIconFilled() { return '<svg viewBox="0 0 24 24" fill="#a16207" stroke="none"><polygon points="12 2 15 9 22 10 17 15 18 22 12 19 6 22 7 15 2 10 9 9"/></svg>'; }
function docIcon()        { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 13h6"/><path d="M9 17h6"/></svg>'; }

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

/* Update quirúrgico de la fila de chips + reset button disabled state.
   Usado por handlers que NO deben repintar el row de filtros (para no
   destruir animaciones CSS in-flight, ej: segment pill slide). */
function paintToolbarChipsAndReset(pageEl) {
  const toolbar = pageEl.querySelector('.me-toolbar');
  if (!toolbar) return;
  const hasActive = !!(_state.search || _state.region || _state.tipo || _state.estado !== 'todos' || _state.car !== 'all');
  /* Reset button enabled */
  const reset = toolbar.querySelector('#meReset');
  if (reset) {
    if (hasActive) reset.removeAttribute('disabled');
    else reset.setAttribute('disabled', 'true');
  }
  /* Chips row: remove if no active filters, replace if active */
  const existingChips = toolbar.querySelector('.me-toolbar__chips');
  if (existingChips) existingChips.remove();
  if (hasActive) {
    const chipsHtml = renderActiveChips();
    toolbar.insertAdjacentHTML('beforeend', chipsHtml);
    /* Re-bind chip remove handlers (mismo handler que en bindToolbarEvents) */
    toolbar.querySelectorAll('[data-chip-remove]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const key = el.getAttribute('data-chip-remove');
        if (key === 'search') {
          _state.search = '';
        } else if (key === 'car') {
          _state.car = 'all';
        } else if (key.includes(':')) {
          const [field, ...valParts] = key.split(':');
          const val = valParts.join(':');
          if (Array.isArray(_state[field])) {
            _state[field] = _state[field].filter(v => v !== val);
          }
        }
        paintToolbar();
        applyChoroplethColors();
        paintRankCard();
        paintMapOverlays();
      });
    });
  }
}

/* Update quirúrgico del display del trigger del dropdown de un field
   (sin paintToolbar — eso cerraría el menu). Usa la misma lógica que
   renderFilterDD para calcular el display, y actualiza solo el span
   .me-dd__trigger-label. */
function paintTriggerDisplay(pageEl, field) {
  const dd = pageEl.querySelector(`[data-dd="${field}"]`);
  if (!dd) return;
  const trigger = dd.querySelector('.naowee-filter-dropdown__trigger');
  const label = trigger?.querySelector('.me-dd__trigger-label');
  if (!trigger || !label) return;
  const sel = _state[field] || [];
  let display;
  if (field === 'estado') {
    if (sel.length === 0)      display = 'Estado';
    else if (sel.length === 1) {
      const e = ESTADOS.find(x => x.code === sel[0]);
      display = e ? e.label : sel[0];
    } else                     display = `${sel.length} seleccionados`;
  } else {
    const fieldLabel = field === 'region' ? 'Región' : field === 'tipo' ? 'Tipo' : field;
    if (sel.length === 0)      display = fieldLabel;
    else if (sel.length === 1) display = sel[0];
    else                       display = `${sel.length} seleccionados`;
  }
  label.textContent = display;
  trigger.classList.toggle('me-dd__trigger--active', sel.length > 0);
}
function paintRankCard() {
  /* Compatibility shim: ahora se llama paintAside (puede mostrar rank
     o detail panel según _state.selectedScenarioId) */
  paintAside();
}

/* Re-render del aside: rank card por default, ficha de scenario si hay
   uno seleccionado vía "Ver perfil completo". */
function paintAside() {
  const aside = _state.rootEl?.querySelector('#meAside');
  if (!aside) return;
  aside.innerHTML = renderAsideContent();
  if (_state.selectedScenarioId) {
    bindDetailPanelEvents(_state.rootEl);
  } else {
    bindRankEvents(_state.rootEl);
  }
}

function bindDetailPanelEvents(pageEl) {
  pageEl.querySelector('[data-detail-close]')?.addEventListener('click', () => {
    _state.selectedScenarioId = null;
    paintAside();
    paintScenarioMarkers();    /* Quitar el ring de selected del marker */
  });
  /* Tabs DS simple — solo toggle de naowee-tab--selected. El underline
     pipe activo lo maneja el ::after del DS automáticamente. */
  pageEl.querySelectorAll('[data-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');
      pageEl.querySelectorAll('[data-tab]').forEach(t => {
        t.classList.toggle('naowee-tab--selected', t === tab);
      });
      pageEl.querySelectorAll('[data-tab-content]').forEach(c => {
        c.hidden = c.getAttribute('data-tab-content') !== target;
      });
    });
  });
  /* Carrousel: 3 slides en el track, prev/next + dots. El track usa
     translateX(-100% × idx) para mostrar el slide activo. State local
     vive en el dataset del root del carrousel — no se persiste. */
  const carRoot = pageEl.querySelector('[data-car-root]');
  if (carRoot) {
    const track = carRoot.querySelector('[data-car-track]');
    const dots = carRoot.querySelectorAll('[data-car-dot]');
    const total = dots.length;
    const setSlide = (idx) => {
      const next = ((idx % total) + total) % total;
      carRoot.dataset.carIdx = String(next);
      track.style.transform = `translateX(-${next * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('me-detail__car-dot--active', i === next));
    };
    carRoot.dataset.carIdx = '0';
    carRoot.querySelector('[data-car-prev]')?.addEventListener('click', () => {
      setSlide(parseInt(carRoot.dataset.carIdx || '0', 10) - 1);
    });
    carRoot.querySelector('[data-car-next]')?.addEventListener('click', () => {
      setSlide(parseInt(carRoot.dataset.carIdx || '0', 10) + 1);
    });
    dots.forEach((d, i) => {
      d.addEventListener('click', () => setSlide(i));
    });
  }
}
/* Re-render de city pins (depto level) o scenario markers (city level)
   según el nav state actual. Llamado después de cualquier cambio de
   filtros (tipo, region, car, etc) para que los overlays se actualicen
   sin tocar la base del mapa. */
function paintMapOverlays() {
  if (_state.nav.level === 'depto') renderCityPins();
  else if (_state.nav.level === 'city') paintScenarioMarkers();
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
      paintMapOverlays();
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
  /* Multi-select: click en option toggle add/remove SIN cerrar el menu */
  pageEl.querySelectorAll('[data-dd-val]').forEach(opt => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      const field = opt.getAttribute('data-dd-field');
      const val = opt.getAttribute('data-dd-val');
      const arr = _state[field];
      const idx = arr.indexOf(val);
      if (idx >= 0) arr.splice(idx, 1);
      else          arr.push(val);
      /* Update visual del check + selected state quirúrgicamente,
         sin paintToolbar() que cerraría el menu. */
      const isSelected = idx < 0;
      opt.classList.toggle('me-dd__opt-multi--selected', isSelected);
      opt.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      const check = opt.querySelector('.me-dd__opt-check');
      if (check) check.innerHTML = isSelected ? checkIcon() : '';
      /* Update display del trigger + chips + map overlays */
      paintTriggerDisplay(pageEl, field);
      paintToolbarChipsAndReset(pageEl);
      applyChoroplethColors();
      paintRankCard();
      paintMapOverlays();
    });
  });
  document.addEventListener('click', () => {
    pageEl.querySelectorAll('.naowee-filter-dropdown.is-open').forEach(d => d.classList.remove('is-open'));
  });

  pageEl.querySelectorAll('[data-car]').forEach(btn => {
    btn.addEventListener('click', () => {
      const newCar = btn.getAttribute('data-car');
      _state.car = newCar;
      /* Update active state IN PLACE — NO paintToolbar (recrea el DOM y
         destruye la animación CSS del pill). En su lugar:
         - Toggle clases del segment
         - Animate el pill via positionSegmentPill(animate=true)
         - Update quirúrgico de chips row + reset button disabled */
      const seg = pageEl.querySelector('.me-car-segment');
      if (seg) {
        seg.querySelectorAll('[data-car]').forEach(b => {
          const active = b.getAttribute('data-car') === newCar;
          b.classList.toggle('naowee-segment__item--active', active);
          b.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        positionSegmentPill(pageEl, true);
      }
      paintToolbarChipsAndReset(pageEl);
      applyChoroplethColors();
      paintRankCard();
      paintMapOverlays();
    });
  });

  pageEl.querySelector('#meReset')?.addEventListener('click', () => {
    _state.search = '';
    _state.region = [];
    _state.tipo = [];
    _state.estado = [];
    _state.car = 'all';
    _state.selectedDepto = null;
    paintToolbar();
    applyChoroplethColors();
    paintRankCard();
    paintMapOverlays();
  });

  /* Chip remove: clave puede ser "search", "car", o "field:value"
     (multi-select) → quita ese valor específico del array. */
  pageEl.querySelectorAll('[data-chip-remove]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const key = el.getAttribute('data-chip-remove');
      if (key === 'search') {
        _state.search = '';
      } else if (key === 'car') {
        _state.car = 'all';
      } else if (key.includes(':')) {
        const [field, ...valParts] = key.split(':');
        const val = valParts.join(':');
        if (Array.isArray(_state[field])) {
          _state[field] = _state[field].filter(v => v !== val);
        }
      }
      paintToolbar();
      applyChoroplethColors();
      paintRankCard();
      paintMapOverlays();
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
      /* En city level Leaflet está activo → delegamos zoom al map nativo.
         En depto/country el SVG está activo → zoom manual del viewBox. */
      if (_state.nav.level === 'city' && _state.leafletMap) {
        if (dir === 'in') _state.leafletMap.zoomIn();
        else _state.leafletMap.zoomOut();
        return;
      }
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
      else if (lvl === 'depto' && _state.nav.depto) {
        /* Volver al depto desde city level */
        const deptoName = _state.nav.depto;
        zoomToDepto(deptoName);
      }
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
function checkIcon()     { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'; }
function chevronRight()  { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"/></svg>'; }
function chevronLeftIcon() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>'; }
function chevronRightIcon(){ return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>'; }
function plusIcon()      { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>'; }
function minusIcon()     { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>'; }
