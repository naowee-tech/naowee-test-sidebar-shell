/**
 * Create Event Modal — wizard de 4 pasos.
 * Refactorizado para usar componentes del DS oficial:
 *   - naowee-modal-overlay + naowee-modal (con --fixed-header --fixed-footer)
 *   - naowee-modal__header / __title-group / __title / __subtitle / __dismiss
 *   - naowee-stepper + __step + __step--active + __number + __label + __connector
 *   - naowee-modal__body
 *   - naowee-textfield + __label (--required) + __input-wrap + __input + __suffix
 *   - naowee-textfield--textarea (para descripción)
 *   - naowee-textfield--error / naowee-dropdown--error  (estado validación)
 *   - naowee-helper--negative (mensaje de error obligatorio)
 *   - naowee-dropdown (para categoría)
 *   - naowee-input-stepper (para "¿cuántas fases tiene?")
 *   - naowee-btn (mute/loud) en el footer
 *
 * Validación lazy: los helpers "Este campo es obligatorio" solo aparecen
 * cuando el usuario intenta avanzar (botón Siguiente) sin completar campos
 * required. Idéntico al pattern de naowee-test-incentivos/programa-wizard.
 *
 * Datepicker: custom calendar popup con position:fixed para escapar el
 * overflow del modal__body. Mismo pattern que programa-wizard.js.
 */

import { openSuccessModal } from '../components/success-modal.js';

const TOTAL_STEPS = 4;
const STEP_LABELS = ['Datos básicos', 'Deportes', 'Fases', 'Pruebas'];

const MONTHS_LONG  = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const MONTHS_SHORT = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const WEEKDAYS     = ['L','M','X','J','V','S','D'];

const CATEGORIES = ['Infantil', 'Prejuvenil', 'Juvenil', 'Sub-23', 'Mayores', 'Master', 'Veteranos'];

/* Catálogo de deportes — derivado de digitacion/shared.js (SPORTS_DB).
   Lista única por label, alfabéticamente ordenada. Si en el futuro se
   conecta al backend de naowee-tech/parametrizacion-deportes, este array
   se reemplaza por un fetch + cache. */
const SPORTS_CATALOG = [
  'Actividades Subacuáticas','Ajedrez Integrado','Arquería','Atletismo',
  'Baloncesto','Baloncesto 3x3','Balonmano','Balonmano Playa','Biatlón',
  'Billar','Bobsleigh','Boccia','Bowling','Boxeo','Breaking','Bádminton',
  'Béisbol','Béisbol 5','Canotaje','Ciclismo','Combinada nórdica','Cricket',
  'Curling','Disco Volador','Duatlón','Ecuestre','Escalada deportiva',
  'Esgrima','Esport','Esquí','Esquí Náutico','Festivales Escolares',
  'Fútbol','Fútbol 7','Fútbol Playa','Fútbol Sala','Fútbol Salón',
  'Gimnasia','Golf','Hapkido','Hockey','Hockey Césped','Hockey Hielo',
  'Hockey Sala','Jiujitsu','Judo','Karate Do','Kickboxing',
  'Levantamiento de Pesas','Lucha','Luge','Marcha Atlética','Mini Baloncesto',
  'Mini Fútbol','Mini Fútbol Sala','Mini Voleibol','Natación','Orientación',
  'Padel','Para Atletismo','Para Bádminton','Para Cycling','Para Natación',
  'Para Orientación','Para Tenis De Mesa','Parkour','Patinaje',
  'Patinaje Artístico','Pelota Vasca','Pentatlón Moderno','Pesca Deportiva',
  'Porrismo','Powerlifting','Remo','Rugby','Rugby Sevens','Sambo',
  'Skateboarding','Skeleton','Snowboard','Softbol','Squash','Taekwondo',
  'Tejo','Tenis Campo','Tenis Campo Dobles','Tenis Mesa','Tenis Mesa Dobles',
  'Tenis Mesa Equipos','Tiro Deportivo','Triatlón','Vela','Voleibol',
  'Waterpolo','Waterpolo Playa','Wushu'
];

/* Sedes mock — replicaría el catálogo real del módulo de Sedes (RUE).
   Se conecta al backend cuando el módulo /api/sedes esté disponible. */
const SEDES_CATALOG = [
  'Centro Acuático Salitre',
  'Centro deportivo Miramar',
  'Centro deportivo Norte',
  'Centro deportivo Sur',
  'Coliseo Bicentenario',
  'Coliseo Iván de Bedout',
  'Estadio Atanasio Girardot',
  'Polideportivo La Floresta',
  'Polideportivo Las Margaritas',
  'Polideportivo Salgado',
  'Polideportivo Vargas'
];

/* Catálogo global de delegaciones — niveles de organización del modelo
   Naowee (ver dev-sports.naoweesuite.com). El usuario elige UN nivel
   por fase y luego selecciona los items concretos del nivel escogido. */
const DELEGACIONES_CATALOG = [
  'Países',
  'Departamentos',
  'Municipios',
  'Clubes',
  'Instituciones'
];

/* Items concretos por nivel de delegación. Mocks listos para reemplazar
   por fetch al backend (`/api/delegaciones?level=...`) cuando el módulo
   se integre. Países = LATAM + CO ext, Departamentos = 33 deptos CO,
   Municipios = capitales y ciudades intermedias CO, Clubes = primera
   división colombiana, Instituciones = entes deportivos colombianos. */
const DELEGACION_ITEMS_BY_LEVEL = {
  'Países': [
    'Argentina','Bolivia','Brasil','Chile','Colombia','Costa Rica','Cuba',
    'Ecuador','El Salvador','España','Estados Unidos','Guatemala','Honduras',
    'México','Nicaragua','Panamá','Paraguay','Perú','Portugal','Puerto Rico',
    'República Dominicana','Uruguay','Venezuela'
  ],
  'Departamentos': [
    'Amazonas','Antioquia','Arauca','Atlántico','Bogotá D.C.','Bolívar',
    'Boyacá','Caldas','Caquetá','Casanare','Cauca','Cesar','Chocó','Córdoba',
    'Cundinamarca','Guainía','Guaviare','Huila','La Guajira','Magdalena',
    'Meta','Nariño','Norte de Santander','Putumayo','Quindío','Risaralda',
    'San Andrés y Providencia','Santander','Sucre','Tolima','Valle del Cauca',
    'Vaupés','Vichada'
  ],
  'Municipios': [
    'Armenia','Barranquilla','Bogotá','Bucaramanga','Cali','Cartagena',
    'Cúcuta','Florencia','Ibagué','Inírida','Leticia','Manizales','Medellín',
    'Mitú','Mocoa','Montería','Neiva','Pasto','Pereira','Popayán','Puerto Carreño',
    'Quibdó','Riohacha','Rionegro','San Andrés','San José del Guaviare',
    'Santa Marta','Sincelejo','Tunja','Valledupar','Villavicencio','Yopal'
  ],
  'Clubes': [
    'Alianza Petrolera','América de Cali','Atlético Bucaramanga','Atlético Huila',
    'Atlético Junior','Atlético Nacional','Boyacá Chicó','Cúcuta Deportivo',
    'Deportes Quindío','Deportes Tolima','Deportivo Cali','Deportivo Pasto',
    'Deportivo Pereira','Envigado FC','Independiente Medellín','Independiente Santa Fe',
    'Jaguares de Córdoba','La Equidad','Llaneros FC','Millonarios FC',
    'Once Caldas','Orsomarso SC','Patriotas Boyacá','Real Cartagena',
    'Rionegro Águilas','Unión Magdalena'
  ],
  'Instituciones': [
    'Comité Olímpico Colombiano (COC)',
    'Comité Paralímpico Colombiano (CPC)',
    'COLDEPORTES',
    'Federación Colombiana de Atletismo',
    'Federación Colombiana de Baloncesto',
    'Federación Colombiana de Fútbol',
    'Federación Colombiana de Natación',
    'Federación Colombiana de Tenis',
    'Federación Colombiana de Voleibol',
    'IDRD — Instituto Distrital de Recreación y Deporte (Bogotá)',
    'IMRD Municipal',
    'INDEPORTES Antioquia',
    'INDEPORTES Atlántico',
    'INDEPORTES Boyacá',
    'INDER Medellín',
    'Liga Antioqueña de Atletismo',
    'Liga Antioqueña de Baloncesto',
    'Liga Antioqueña de Fútbol',
    'Ministerio del Deporte de Colombia'
  ]
};

/* Escenarios por sede — catálogo derivado del módulo de Sedes/RUE.
   Cuando el módulo se conecte al backend, este map se reemplaza por
   un fetch GET /api/sedes/{id}/escenarios. */
const ESCENARIOS_BY_SEDE = {
  'Centro Acuático Salitre':     ['Piscina Olímpica', 'Piscina Recreativa', 'Sauna principal'],
  'Centro deportivo Miramar':    ['Cancha de tenis 1', 'Cancha de tenis 2', 'Gimnasio multifuncional'],
  'Centro deportivo Norte':      ['Pista atlética 400m', 'Cancha de fútbol 11', 'Coliseo cubierto'],
  'Centro deportivo Sur':        ['Cancha sintética', 'Cancha de baloncesto', 'Cancha de voleibol'],
  'Coliseo Bicentenario':        ['Pista central', 'Sala de pesas', 'Cancha auxiliar'],
  'Coliseo Iván de Bedout':      ['Cancha principal', 'Cancha auxiliar', 'Sala de calentamiento'],
  'Estadio Atanasio Girardot':   ['Cancha principal', 'Cancha auxiliar 1', 'Cancha auxiliar 2', 'Pista atlética'],
  'Polideportivo La Floresta':   ['Cancha múltiple 1', 'Cancha múltiple 2', 'Pista de patinaje'],
  'Polideportivo Las Margaritas':['Cancha cubierta', 'Cancha al aire libre', 'Sala de combate'],
  'Polideportivo Salgado':       ['Cancha múltiple', 'Sala de tenis de mesa', 'Sala de gimnasia'],
  'Polideportivo Vargas':        ['Cancha 1 de Vargas', 'Cancha 2 de Vargas', 'Piscina Vargas']
};

/* ─── Catálogo de pruebas por deporte (paso 4) ────────────────────
   Mock derivado de digitacion/shared.js (SPORTS_DB). Cada deporte
   tiene 0..N pruebas en cada uno de los 3 tipos:
     individual   → tab "Individual"
     conjunto     → tab "De conjunto"
     paradeporte  → tab "Paradeportes"
   La etiqueta del prueba es la misma del backend (ej: "Competencia
   Ajedrez Activo", "Bala 7.26 Kg", etc.). Cuando un deporte no tiene
   pruebas detalladas en el catálogo, se aplica `defaultPruebasFor()`. */
const SPORT_PRUEBAS = {
  'Ajedrez Integrado': {
    individual: ['Competencia Ajedrez Activo', 'Competencia Ajedrez Blitz', 'Competencia Ajedrez Clásico'],
    conjunto:   ['Competencia Ajedrez Activo Equipos', 'Competencia Ajedrez Blitz Equipos', 'Competencia Ajedrez Clásico Equipos']
  },
  'Atletismo': {
    individual: [
      'Altura','Bala 3 Kg','Bala 4 Kg','Bala 5 Kg','Bala 7.26 Kg',
      'Con Pértiga','Disco 1 Kg','Disco 1.5 Kg','Disco 2 Kg','Jabalina 600 g',
      'Jabalina 700 g','Jabalina 800 g','Largo','Triple Salto',
      '60m Vallas','100m Vallas','110m Vallas','400m Vallas','Marcha 5km','Marcha 10km',
      '60m Planos','100m Planos','200m Planos','400m Planos','800m Planos',
      '1500m Planos','3000m Planos','5000m Planos','10000m Planos',
      '4x100m Relevos','4x400m Relevos','Maratón','Media Maratón'
    ]
  },
  'Baloncesto':     { conjunto: ['Competencia Baloncesto 5x5'] },
  'Baloncesto 3x3': { conjunto: ['Competencia Baloncesto 3x3'] },
  'Balonmano':      { conjunto: ['Competencia Balonmano Pista'] },
  'Balonmano Playa':{ conjunto: ['Competencia Balonmano Playa'] },
  'Bádminton':      { individual: ['Competencia Bádminton Singles'], conjunto: ['Competencia Bádminton Dobles'] },
  'Béisbol':        { conjunto: ['Competencia Béisbol Tradicional'] },
  'Béisbol 5':      { conjunto: ['Competencia Beisbol 5'] },
  'Boccia': {
    individual:  ['BC1', 'BC2', 'BC3', 'BC4'],
    conjunto:    ['BC3 Parejas', 'BC4 Parejas'],
    paradeporte: ['BC1', 'BC2', 'BC3', 'BC4', 'BC3 Parejas', 'BC4 Parejas']
  },
  'Bobsleigh':      { conjunto: ['Bobsleigh Doble', 'Bobsleigh Cuádruple'] },
  'Boxeo':          { individual: ['Mosca 51kg','Pluma 57kg','Ligero 60kg','Welter 67kg','Mediano 75kg','Pesado 91kg'] },
  'Cricket':        { conjunto: ['Partido de Prueba','Partido Internacional de Un Día','Partido Twenty20','Partido Lista A','Partido de Primera Clase'] },
  'Curling':        { conjunto: ['Competencia de Curling','Curling Dobles'] },
  'Disco Volador':  { conjunto: ['Competencia de Disco Volador Ultimate','Competencia de Disco Volador Ultimate Playa'] },
  'Esgrima':        { individual: ['Florete','Espada','Sable'], conjunto: ['Florete por Equipos','Espada por Equipos','Sable por Equipos'] },
  'Fútbol':         { conjunto: ['Competencia de Fútbol 11'] },
  'Fútbol 7':       { conjunto: ['Competencia de Fútbol 7'] },
  'Fútbol Playa':   { conjunto: ['Competencia de Fútbol Playa'] },
  'Fútbol Sala':    { conjunto: ['Competencia de Fútbol Sala'] },
  'Fútbol Salón':   { conjunto: ['Competencia de Fútbol Salón'] },
  'Gimnasia':       { individual: ['Suelo','Caballo con Arzones','Anillas','Salto','Barras Paralelas','Barra Fija','Barras Asimétricas','Barra de Equilibrio'] },
  'Hockey':         { conjunto: ['Partido (11 vs 11)'] },
  'Hockey Césped':  { conjunto: ['Partido (11 vs 11)'] },
  'Hockey Hielo':   { conjunto: ['Partido (6 vs 6)'] },
  'Hockey Sala':    { conjunto: ['Partido (5 vs 5)'] },
  'Judo':           { individual: ['Competencia Shiai'] },
  'Karate Do':      { individual: ['Competencia Kumite','Competencia Kata'] },
  'Levantamiento de Pesas': { individual: ['Arranque','Envión','Total Olímpico'] },
  'Lucha':          { individual: ['Lucha Libre','Lucha Grecorromana'] },
  'Mini Baloncesto':  { conjunto: ['Competencia Mini Baloncesto'] },
  'Mini Fútbol':      { conjunto: ['Competencia de Minifutbol'] },
  'Mini Fútbol Sala': { conjunto: ['Competencia Mini Fútbol Sala'] },
  'Mini Voleibol':    { conjunto: ['Competencia de Minivoleibol'] },
  'Natación':       { individual: ['Libre 50m','Libre 100m','Libre 200m','Libre 400m','Libre 800m','Libre 1500m','Espalda 50m','Espalda 100m','Espalda 200m','Pecho 50m','Pecho 100m','Pecho 200m','Mariposa 50m','Mariposa 100m','Mariposa 200m','Combinado Individual 200m','Combinado Individual 400m'] },
  'Padel':          { conjunto: ['Competencia Padel Dobles'] },
  'Para Atletismo': { paradeporte: ['100m T11','100m T44','200m T44','400m T44','800m T54','1500m T54','Maratón T54','Bala F32','Bala F33','Bala F34','Disco F37','Salto Largo T44'] },
  'Para Bádminton': { paradeporte: ['Singles WH1','Singles WH2','Dobles WH1-WH2'] },
  'Para Cycling':   { paradeporte: ['Ruta C1','Ruta C2','Pista B','Tándem'] },
  'Para Natación':  { paradeporte: ['Libre 50m S1','Libre 50m S2','Libre 100m S5','Espalda 100m S6','Pecho 100m SB7','Mariposa 100m S8','Combinado 200m SM10'] },
  'Para Orientación':  { paradeporte: ['Pre-O','Trail-O Sprint','Trail-O Largo'] },
  'Para Tenis De Mesa':{ paradeporte: ['Singles Clase 1-5 (Silla)','Singles Clase 6-10 (Pie)','Dobles Mixtos'] },
  'Patinaje':       { individual: ['100m','200m','500m','1000m','3000m','5000m','10000m','Maratón','Patinaje Artístico Libre'] },
  'Patinaje Artístico': { individual: ['Programa Corto','Programa Libre','Danza','Parejas'] },
  'Porrismo':       { conjunto: ['Competencia Porrismo Cheer','Competencia Porrismo Pom','Competencia Porrismo Hip Hop'] },
  'Remo':           { conjunto: ['Competencia Single Scull','Competencia Doble Scull','Competencia Cuádruple Scull','Competencia Dos sin timonel','Competencia Cuatro sin timonel','Competencia Ocho con timonel'] },
  'Rugby':          { conjunto: ['Competencia de Rugby Union'] },
  'Rugby Sevens':   { conjunto: ['Competencia de Rugby Sevens'] },
  'Softbol':        { conjunto: ['Competencia Sóftbol Lanzamiento Rápido'] },
  'Taekwondo':      { conjunto: ['Competencia Kyorugi','Competencia Poomsae'] },
  'Tenis Campo':    { individual: ['Competencia Tenis Campo'] },
  'Tenis Campo Dobles': { conjunto: ['Competencia Tenis Campo Dobles'] },
  'Tenis Mesa':     { individual: ['Competencia Tenis de Mesa'] },
  'Tenis Mesa Dobles':  { conjunto: ['Competencia Tenis de Mesa Dobles'] },
  'Tenis Mesa Equipos': { conjunto: ['Competencia Tenis de Mesa Equipos'] },
  'Triatlón':       { individual: ['Sprint','Olímpico','Media Distancia','Larga Distancia'] },
  'Voleibol':       { conjunto: ['Competencia de Voleibol'] },
  'Waterpolo':      { conjunto: ['Competencia de Waterpolo Piscina'] },
  'Waterpolo Playa':{ conjunto: ['Competencia de Waterpolo Playa'] }
};

const SEXOS_OPTIONS = ['Hombre', 'Mujer', 'Mixto'];

/* Emojis por deporte — derivados de SPORTS_DB. Aparecen antes del nombre
   en la tabla del paso 4 para identificación visual rápida. Fallback 🏅
   para deportes sin entrada (manteniendo consistencia visual). */
const SPORT_EMOJIS = {
  'Actividades Subacuáticas':'🤿', 'Ajedrez Integrado':'♟', 'Arquería':'🏹',
  'Atletismo':'🏃', 'Baloncesto':'🏀', 'Baloncesto 3x3':'🏀', 'Balonmano':'🤾',
  'Balonmano Playa':'🤾', 'Biatlón':'⛷️', 'Billar':'🎱', 'Bobsleigh':'🛷',
  'Boccia':'🎱', 'Bowling':'🎳', 'Boxeo':'🥊', 'Breaking':'💃', 'Bádminton':'🏸',
  'Béisbol':'⚾', 'Béisbol 5':'⚾', 'Canotaje':'🛶', 'Ciclismo':'🚴',
  'Combinada nórdica':'⛷️', 'Cricket':'🏏', 'Curling':'🥌', 'Disco Volador':'🥏',
  'Duatlón':'🏃', 'Ecuestre':'🐎', 'Escalada deportiva':'🧗', 'Esgrima':'🤺',
  'Esport':'🎮', 'Esquí':'⛷️', 'Esquí Náutico':'🎿', 'Festivales Escolares':'🎪',
  'Fútbol':'⚽', 'Fútbol 7':'⚽', 'Fútbol Playa':'⚽', 'Fútbol Sala':'⚽',
  'Fútbol Salón':'⚽', 'Gimnasia':'🤸', 'Golf':'⛳', 'Hapkido':'🥋',
  'Hockey':'🏑', 'Hockey Césped':'🏑', 'Hockey Hielo':'🏒', 'Hockey Sala':'🏑',
  'Jiujitsu':'🥋', 'Judo':'🥋', 'Karate Do':'🥋', 'Kickboxing':'🥊',
  'Levantamiento de Pesas':'🏋️', 'Lucha':'🤼', 'Luge':'🛷', 'Marcha Atlética':'🚶',
  'Mini Baloncesto':'🏀', 'Mini Fútbol':'⚽', 'Mini Fútbol Sala':'⚽',
  'Mini Voleibol':'🏐', 'Natación':'🏊', 'Orientación':'🧭', 'Padel':'🎾',
  'Para Atletismo':'🏃', 'Para Bádminton':'🏸', 'Para Cycling':'🚴',
  'Para Natación':'🏊', 'Para Orientación':'🧭', 'Para Tenis De Mesa':'🏓',
  'Parkour':'🏃', 'Patinaje':'⛸️', 'Patinaje Artístico':'⛸️',
  'Pelota Vasca':'🎾', 'Pentatlón Moderno':'🏅', 'Pesca Deportiva':'🎣',
  'Porrismo':'📣', 'Powerlifting':'🏋️', 'Remo':'🚣', 'Rugby':'🏉',
  'Rugby Sevens':'🏉', 'Sambo':'🤼', 'Skateboarding':'🛹', 'Skeleton':'🛷',
  'Snowboard':'🏂', 'Softbol':'🥎', 'Squash':'🟡', 'Taekwondo':'🥋',
  'Tejo':'🎯', 'Tenis Campo':'🎾', 'Tenis Campo Dobles':'🎾',
  'Tenis Mesa':'🏓', 'Tenis Mesa Dobles':'🏓', 'Tenis Mesa Equipos':'🏓',
  'Tiro Deportivo':'🎯', 'Triatlón':'🏊', 'Vela':'⛵', 'Voleibol':'🏐',
  'Waterpolo':'🤽', 'Waterpolo Playa':'🤽', 'Wushu':'🥋'
};
function sportEmoji(sport) { return SPORT_EMOJIS[sport] || '🏅'; }

/* Resuelve las pruebas de un deporte. Si está en SPORT_PRUEBAS, devuelve
   esa estructura. Si no, infiere de la convención de nombres:
     - Sport con prefijo "Para "  → paradeporte: ['Competencia X']
     - Sport con sufijo "Equipos" → conjunto:    ['Competencia X']
     - Cualquier otro             → individual:  ['Competencia X']
   Esto da un fallback útil para los ~40 deportes sin pruebas detalladas
   en el mock — funcionan, son seleccionables, y cuando se conecte el
   backend la data real reemplaza este fallback. */
function getSportPruebas(sport) {
  if (SPORT_PRUEBAS[sport]) return SPORT_PRUEBAS[sport];
  if (sport.startsWith('Para ')) {
    return { paradeporte: [`Competencia ${sport}`] };
  }
  if (/Equipos$|Dobles$/.test(sport)) {
    return { conjunto: [`Competencia ${sport}`] };
  }
  return { individual: [`Competencia ${sport}`] };
}

/* Modelo de una fase (paso 3). El array data.phases mantiene N de éstos. */
function emptyPhase() {
  return {
    name: '',
    hasCupos: false,
    modalidad: '',          /* 'manual' | 'puntaje' */
    description: '',
    startDate: '',          /* ISO yyyy-mm-dd */
    endDate: '',
    sedes: [],              /* multi-select */
    escenarios: [],         /* multi-select dinámico — depende de las sedes */
    delegaciones: '',       /* single-select del NIVEL de delegación */
    delegacionesItems: [],  /* multi-select dinámico — items del nivel escogido */
    requireDocs: false
  };
}

const _modalState = {
  el: null,
  step: 1,
  /* errores por campo — solo se setean tras submit attempt fallido */
  errors: {},
  data: {
    name: '',
    description: '',
    startDate: '',  /* ISO yyyy-mm-dd */
    endDate: '',
    categories: [], /* multi-select array */
    phases: [emptyPhase()], /* array de fases (objetos) — paso 3 */
    inscStart: '',  /* auto-igual a startDate, locked */
    inscEnd: '',
    sports: [],     /* paso 2 — multi-select del catálogo deportivo */
    /* Paso 4: matriz de modalidades. Key compuesta "sport::prueba::categoria"
       → { enabled, sexos[] }. Una entrada por celda activable de la tabla.
       Una celda está enabled si el usuario tildó su checkbox; sexos
       contiene los valores escogidos del dropdown adjacente. */
    modalidades: {}
  },
  /* Estado UI no persistido — search del dropdown de deportes,
     fase activa del paso 3, query del search de sedes/delegaciones. */
  ui: {
    sportsSearch: '',
    activePhase: 0,
    sedesSearch: '',
    escenariosSearch: '',
    delegSearch: '',
    delegItemsSearch: '',
    /* Paso 4 */
    modActiveTab: 'individual',         /* individual | conjunto | paradeporte */
    modSearch: '',                       /* search "Buscar prueba" */
    modDeporteFilter: 'Todos',           /* filtro single-select del header */
    modCollapsed: {},                    /* sport name → bool (true = colapsado) */
    modSexoOpenKey: null                 /* clave de la celda con dropdown sexo abierto */
  }
};

export function openCreateEventModal() {
  if (_modalState.el) return;
  _modalState.step = 1;
  _modalState.errors = {};
  _modalState.data = {
    name:'', description:'', startDate:'', endDate:'',
    categories:[], phases:[emptyPhase()], inscStart:'', inscEnd:'',
    sports:[], modalidades:{}
  };
  _modalState.ui = {
    sportsSearch:'', activePhase:0,
    sedesSearch:'', escenariosSearch:'', delegSearch:'', delegItemsSearch:'',
    modActiveTab:'individual', modSearch:'', modDeporteFilter:'Todos',
    modCollapsed:{}, modSexoOpenKey:null
  };

  const overlay = document.createElement('div');
  overlay.className = 'naowee-modal-overlay open ev-modal-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.innerHTML = renderModal();
  document.body.appendChild(overlay);
  _modalState.el = overlay;

  bindModalEvents();
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  if (!_modalState.el) return;
  _modalState.el.classList.add('ev-modal-closing');
  setTimeout(() => {
    _modalState.el?.remove();
    _modalState.el = null;
    /* Limpiar cualquier popup de datepicker huérfano que haya quedado
       inyectado al body (el popup vive fuera del overlay para escapar el
       overflow del modal, así que no se elimina con .remove() del overlay) */
    document.querySelectorAll('.naowee-datepicker--popover').forEach(p => p.remove());
    document.body.style.overflow = '';
  }, 180);
}

function repaint() {
  if (!_modalState.el) return;
  /* Eliminar popups de datepicker antes de re-renderizar — innerHTML
     no los limpia porque viven adjuntos al body. */
  document.querySelectorAll('.naowee-datepicker--popover').forEach(p => p.remove());
  /* Surgical: solo reemplazamos el INNER del .naowee-modal — no el
     .naowee-modal-overlay ni el .naowee-modal mismos. Esto evita que
     animation:scaleIn (.3s) se re-dispare en cada step transition / "+"
     / cambio de tab — que era lo que el usuario veía como "flash". */
  const modal = _modalState.el.querySelector('.naowee-modal');
  if (!modal) {
    /* Fallback: si por alguna razón no existe el wrapper, volvemos al
       full re-render para no romper el modal. */
    _modalState.el.innerHTML = renderModal();
  } else {
    /* Step 4 necesita más ancho para la tabla de modalidades — toggle
       de la clase `ev-modal--wide` en `.naowee-modal`, que CSS anima. */
    modal.classList.toggle('ev-modal--wide', _modalState.step === 4);
    modal.innerHTML = renderModalInner();
  }
  bindModalEvents();
}

/* ─── Validación por paso ──────────────────────────────────────────── */
function validateStep(step) {
  const errors = {};
  const d = _modalState.data;
  if (step === 1) {
    if (!d.name.trim())              errors.name = true;
    if (!d.startDate)                errors.startDate = true;
    if (!d.endDate)                  errors.endDate = true;
    if (!d.categories || !d.categories.length) errors.categories = true;
    if (!d.inscEnd)                  errors.inscEnd = true;

    /* Rango "event": fin >= inicio */
    if (d.startDate && d.endDate && d.endDate < d.startDate) {
      errors.endDate = 'La fecha final no puede ser anterior a la fecha de inicio.';
    }
    /* Rango "inscriptions": fin >= inicio */
    if (d.inscStart && d.inscEnd && d.inscEnd < d.inscStart) {
      errors.inscEnd = 'La fecha fin de inscripciones no puede ser anterior a la fecha de inicio.';
    }
  }
  if (step === 2) {
    /* Mensaje custom alineado al copy del backend de dev-sports. */
    if (!d.sports || !d.sports.length) {
      errors.sports = 'Selecciona al menos un deporte';
    }
  }
  if (step === 3) {
    /* Validamos SOLO la fase activa — es la que el usuario está viendo.
       Si hay errores en otras fases, el "Siguiente" igualmente las
       chequea cuando el usuario las activa via tab. Decisión UX: fail
       fast en la fase visible, no mostrar errores escondidos en otras
       tabs (sería confuso). */
    const i = _modalState.ui.activePhase;
    const ph = d.phases[i];
    if (!ph) return errors;
    if (!ph.name || !ph.name.trim()) errors[`phases.${i}.name`] = true;
    if (!ph.startDate)               errors[`phases.${i}.startDate`] = true;
    if (!ph.endDate)                 errors[`phases.${i}.endDate`] = true;
    if (!ph.sedes || !ph.sedes.length) errors[`phases.${i}.sedes`] = 'Selecciona al menos una sede';
    if (!ph.delegaciones)            errors[`phases.${i}.delegaciones`] = true;
    /* Si el nivel está elegido, hay que seleccionar al menos un item del
       catálogo (depto/club/etc.). Sin items, la fase no tiene a quién
       asignar resultados — bloqueante. */
    if (ph.delegaciones && (!ph.delegacionesItems || !ph.delegacionesItems.length)) {
      errors[`phases.${i}.delegacionesItems`] = `Selecciona al menos un ${ph.delegaciones.toLowerCase().replace(/s$/, '')}`;
    }

    /* Constraints de fecha — defensa-en-profundidad además del disable
       en el calendar. Un usuario podría pre-cargar fechas y luego cambiar
       las del evento, dejando phase fechas inválidas. */
    const outerMin = phaseOuterMin();   /* max(event.startDate, inscEnd) */
    const outerMax = phaseOuterMax();   /* event.endDate */
    if (ph.startDate && ph.endDate && ph.endDate < ph.startDate) {
      errors[`phases.${i}.endDate`] = 'La fecha de cierre no puede ser anterior a la de inicio.';
    }
    if (outerMax && ph.endDate && ph.endDate > outerMax) {
      errors[`phases.${i}.endDate`] = 'La fecha de cierre no puede ser posterior al fin del evento.';
    }
    if (outerMin && ph.endDate && ph.endDate < outerMin) {
      errors[`phases.${i}.endDate`] = 'La fecha de cierre no puede ser anterior al fin de las inscripciones.';
    }
    if (outerMin && ph.startDate && ph.startDate < outerMin) {
      errors[`phases.${i}.startDate`] = 'La fecha de inicio no puede ser anterior al fin de las inscripciones.';
    }
    if (outerMax && ph.startDate && ph.startDate > outerMax) {
      errors[`phases.${i}.startDate`] = 'La fecha de inicio no puede ser posterior al fin del evento.';
    }
  }
  if (step === 4) {
    /* Al menos una celda enabled con sexos no vacíos. Sin esto, el evento
       no tiene pruebas activas — no se puede crear. */
    const enabledKeys = Object.keys(d.modalidades || {}).filter(k => {
      const cell = d.modalidades[k];
      return cell && cell.enabled && cell.sexos && cell.sexos.length > 0;
    });
    if (!enabledKeys.length) {
      errors.modalidades = 'Activá al menos una prueba con su sexo (Hombre / Mujer / Mixto).';
    }
  }
  return errors;
}

/* ─── Modal shell (DS components) ─────────────────────────────────── */
/* Split: renderModal() pinta UNA sola vez al abrir (incluye .naowee-modal
   con el animation:scaleIn). renderModalInner() pinta lo que cambia
   entre steps — header, stepper, body, footer. repaint() reemplaza solo
   este inner para evitar que la animación scaleIn se re-dispare. */
function renderModal() {
  return `
    <div class="naowee-modal naowee-modal--fixed-header naowee-modal--fixed-footer ev-modal" role="document">
      ${renderModalInner()}
    </div>
  `;
}

function renderModalInner() {
  return `
    <header class="naowee-modal__header">
      <div class="naowee-modal__title-group">
        <h2 class="naowee-modal__title">Crear nuevo evento</h2>
        <div class="naowee-modal__subtitle">Completá los datos del evento. Podés guardar y retomar después.</div>
      </div>
      <button class="naowee-modal__dismiss" type="button" data-act="close" aria-label="Cerrar">
        ${closeIcon()}
      </button>
    </header>

    ${renderStepper()}

    <div class="naowee-modal__body ev-modal__body">
      ${renderStep(_modalState.step)}
    </div>

    <footer class="naowee-modal__footer ev-modal__footer">
      <button class="naowee-btn naowee-btn--mute naowee-btn--medium" type="button" data-act="${_modalState.step === 1 ? 'close' : 'prev'}">
        ${_modalState.step === 1 ? 'Cancelar' : 'Anterior'}
      </button>
      <button class="naowee-btn naowee-btn--loud naowee-btn--medium" type="button" data-act="${_modalState.step === TOTAL_STEPS ? 'finish' : 'next'}">
        ${_modalState.step === TOTAL_STEPS ? 'Crear evento' : 'Siguiente'}
      </button>
    </footer>
  `;
}

function renderStepper() {
  return `
    <ol class="naowee-stepper naowee-stepper--pulse naowee-stepper--distributed ev-modal__stepper">
      ${STEP_LABELS.map((label, i) => {
        const stepNum = i + 1;
        const cls = ['naowee-stepper__step'];
        if (stepNum === _modalState.step) cls.push('naowee-stepper__step--active');
        if (stepNum < _modalState.step)  cls.push('naowee-stepper__step--done');
        const connectorCls = stepNum < _modalState.step
          ? 'naowee-stepper__connector naowee-stepper__connector--done'
          : 'naowee-stepper__connector';
        return `
          <li class="${cls.join(' ')}" data-step="${stepNum}">
            <span class="naowee-stepper__number">${stepNum}</span>
            <span class="naowee-stepper__label">${label}</span>
            ${stepNum < TOTAL_STEPS ? `<span class="${connectorCls}"></span>` : ''}
          </li>
        `;
      }).join('')}
    </ol>
  `;
}

/* ─── Steps ────────────────────────────────────────────────────────── */
function renderStep(step) {
  if (step === 1) return renderStep1();
  if (step === 2) return renderStep2();
  if (step === 3) return renderStep3();
  if (step === 4) return renderStep4();
  return '';
}

function renderStep1() {
  const d = _modalState.data;
  const e = _modalState.errors;
  return `
    <div class="ev-form">
      <!-- Nombre del evento (textfield required) -->
      <div class="naowee-textfield ${e.name ? 'naowee-textfield--error' : ''}" data-field-wrap="name">
        <label class="naowee-textfield__label naowee-textfield__label--required" for="evName">
          Nombre del evento
        </label>
        <div class="naowee-textfield__input-wrap">
          <input class="naowee-textfield__input" type="text" id="evName"
                 placeholder="Nombre del evento"
                 value="${escapeHtml(d.name)}"
                 data-field="name"
                 maxlength="120" />
        </div>
        ${e.name ? errorHelper() : ''}
      </div>

      <!-- Descripción del evento (textarea) -->
      <div class="naowee-textfield naowee-textfield--textarea">
        <label class="naowee-textfield__label" for="evDescription">Descripción del evento</label>
        <div class="naowee-textfield__input-wrap">
          <textarea class="naowee-textfield__input" id="evDescription"
                    rows="3" maxlength="300"
                    data-field="description">${escapeHtml(d.description)}</textarea>
        </div>
      </div>

      <!-- Fechas inicio/fin (custom DS datepicker, rango "event") -->
      <div class="ev-grid-2">
        ${renderDatepicker('evStartDate', 'Fecha de inicio del evento', true, d.startDate, 'startDate', e.startDate, { range:'from', rangeName:'event' })}
        ${renderDatepicker('evEndDate',   'Fecha final del evento',     true, d.endDate,   'endDate',   e.endDate,   { range:'to',   rangeName:'event' })}
      </div>

      <!-- Sección CATEGORÍAS -->
      <div class="ev-form-section">CATEGORÍAS</div>

      <!-- Categoría (dropdown DS multi-select con tags + option-checks) -->
      <div class="naowee-dropdown naowee-dropdown--multiple ${e.categories ? 'naowee-dropdown--error' : ''}"
           id="evCategoryDD"
           data-field-wrap="categories">
        <label class="naowee-dropdown__label naowee-dropdown__label--required">Categoría</label>
        <div class="naowee-dropdown__trigger" tabindex="0">
          ${renderCategoryTriggerContent(d.categories)}
          <div class="naowee-dropdown__controls">
            <span class="naowee-dropdown__chevron">${chevronDown()}</span>
          </div>
        </div>
        <div class="naowee-dropdown__menu" role="listbox">
          ${CATEGORIES.map((c) => {
            const isSel = d.categories.includes(c);
            return `
              <div class="naowee-dropdown__option ${isSel ? 'naowee-dropdown__option--selected' : ''}"
                   data-val="${c}">
                <span class="naowee-dropdown__option-check">${isSel ? checkIcon() : ''}</span>
                <span>${c}</span>
              </div>
            `;
          }).join('')}
        </div>
        ${e.categories ? errorHelper() : ''}
      </div>

      <!-- Cuántas fases tiene? (input-stepper DS).
           Modifica la longitud del array data.phases — cada fase nueva se
           inicializa con emptyPhase() y se configura en el paso 3. -->
      <div class="naowee-input-stepper" id="evPhasesStepper">
        <label class="naowee-textfield__label">¿Cuántas fases tiene?</label>
        <div class="naowee-input-stepper__content">
          <div class="naowee-input-stepper__input">
            <button type="button" class="naowee-input-stepper__btn"
                    data-counter="dec"
                    ${d.phases.length <= 1 ? 'disabled' : ''}>${minusIcon()}</button>
            <span class="naowee-input-stepper__value" id="evPhasesValue">${d.phases.length}</span>
            <button type="button" class="naowee-input-stepper__btn"
                    data-counter="inc">${plusIcon()}</button>
          </div>
        </div>
      </div>

      <!-- Sección INSCRIPCIONES -->
      <div class="ev-form-section">INSCRIPCIONES</div>

      <!-- Fechas inscripciones (rango "inscriptions").
           inscStart está LOCKED al startDate del evento — se auto-rellena
           y el field se deshabilita. Si el usuario quiere cambiar la fecha
           de inicio de inscripciones, debe primero modificar la fecha de
           inicio del evento. -->
      <div class="ev-grid-2">
        ${renderDatepicker('evInscStart', 'Fecha inicio de inscripciones', false, d.startDate, 'inscStart', false,    { range:'from', rangeName:'inscriptions', locked:true, lockHint:'Igual a la fecha de inicio del evento' })}
        ${renderDatepicker('evInscEnd',   'Fecha fin de inscripciones',    true,  d.inscEnd,   'inscEnd',   e.inscEnd, { range:'to',   rangeName:'inscriptions' })}
      </div>
    </div>
  `;
}

/* ─── Step 2: Asignar deportes ─────────────────────────────────────
   - Banner de aviso (DS naowee-message --caution): "Una vez creado…"
   - Multi-select dropdown del catálogo deportivo:
     · Search input dentro del menú
     · Toggle "Seleccionar todos / Deseleccionar todos" al pie
     · Empty state "No se encontraron deportes" cuando search no matchea
   - Validación: al menos un deporte → mensaje "Selecciona al menos un deporte" */
function renderStep2() {
  const d = _modalState.data;
  const e = _modalState.errors;
  return `
    <div class="ev-form">
      <h3 class="ev-step2__title">Asignar deportes</h3>

      <div class="naowee-message naowee-message--caution ev-step2__notice">
        <div class="naowee-message__header">
          <span class="naowee-message__icon">${cautionBadgeIcon()}</span>
          <span class="naowee-message__body">Una vez creado el evento no se podrán modificar los deportes seleccionados.</span>
        </div>
      </div>

      <div class="naowee-dropdown naowee-dropdown--multiple ${e.sports ? 'naowee-dropdown--error' : ''}"
           id="evSportsDD"
           data-field-wrap="sports">
        <label class="naowee-dropdown__label naowee-dropdown__label--required">Deportes</label>
        <div class="naowee-dropdown__trigger" tabindex="0">
          ${renderSportsTriggerContent(d.sports)}
          <div class="naowee-dropdown__controls">
            <span class="naowee-dropdown__chevron">${chevronDown()}</span>
          </div>
        </div>
        <div class="naowee-dropdown__menu ev-sports-menu" role="listbox">
          <div class="ev-sports-menu__search">
            <span class="ev-sports-menu__search-icon">${searchIcon()}</span>
            <input type="text" class="ev-sports-menu__search-input"
                   placeholder="Buscar..." data-sports-search
                   value="${escapeHtml(_modalState.ui.sportsSearch || '')}" />
          </div>
          <div class="ev-sports-menu__list" data-sports-list>
            ${renderSportsOptions(d.sports, _modalState.ui.sportsSearch || '')}
          </div>
          <button type="button" class="ev-sports-menu__toggle-all" data-sports-toggle-all>
            ${sportsToggleAllLabel(d.sports)}
          </button>
        </div>
        ${e.sports ? errorHelper(typeof e.sports === 'string' ? e.sports : 'Selecciona al menos un deporte') : ''}
      </div>
    </div>
  `;
}

/* Trigger content del dropdown de deportes:
   - 0 seleccionados        → placeholder
   - 1..LIMIT (4)           → tags individuales removibles
   - LIMIT+1..N-1           → un solo pill "N deportes seleccionados ×"
                              (evita el "muro de tags" al deseleccionar
                              uno cuando "todos" estaba activo). El X
                              limpia toda la selección de una.
   - TODOS (N)              → un solo pill "Todos los deportes ×"

   Los pills consolidados (subset+ y todos) usan ambos el mismo data-attr
   `data-remove-all-sports` — el handler único limpia _modalState.data.sports
   y vuelve al placeholder. Para deselección granular hay que abrir el
   menú (mismo pattern que Linear, Asana, etc). */
const SPORTS_TAGS_LIMIT = 4;

function renderSportsTriggerContent(sports) {
  if (!sports || sports.length === 0) {
    return `<span class="naowee-dropdown__placeholder">Catálogo del deporte completo</span>`;
  }
  const total = SPORTS_CATALOG.length;
  /* Pill consolidado: "Todos" o "N deportes seleccionados". Ambos casos
     comparten markup — solo cambia el texto. */
  if (sports.length === total || sports.length > SPORTS_TAGS_LIMIT) {
    const label = sports.length === total
      ? 'Todos los deportes'
      : `${sports.length} deportes seleccionados`;
    return `
      <span class="naowee-dropdown__tags">
        <span class="naowee-tag naowee-tag--accent naowee-tag--small" data-tag="__bulk">
          ${label}
          <span class="naowee-tag__active-area" data-remove-all-sports>
            <span class="naowee-tag__close">${closeIconSmall()}</span>
          </span>
        </span>
      </span>
    `;
  }
  /* Selección chica → tags individuales removibles */
  return `
    <span class="naowee-dropdown__tags">
      ${sports.map((s) => `
        <span class="naowee-tag naowee-tag--accent naowee-tag--small" data-tag="${escapeHtml(s)}">
          ${escapeHtml(s)}
          <span class="naowee-tag__active-area" data-remove-sport="${escapeHtml(s)}">
            <span class="naowee-tag__close">${closeIconSmall()}</span>
          </span>
        </span>
      `).join('')}
    </span>
  `;
}

/* Render de la lista de opciones — filtrada por search (case + accent
   insensitive). Si no hay matches, devuelve el empty state inline. */
function renderSportsOptions(selected, search) {
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const q = norm(search.trim());
  const filtered = q
    ? SPORTS_CATALOG.filter(s => norm(s).includes(q))
    : SPORTS_CATALOG;
  if (!filtered.length) {
    return `<div class="ev-sports-menu__empty">No se encontraron deportes</div>`;
  }
  return filtered.map((s) => {
    const isSel = selected.includes(s);
    return `
      <div class="naowee-dropdown__option ${isSel ? 'naowee-dropdown__option--selected' : ''}"
           data-sport="${escapeHtml(s)}">
        <span class="naowee-dropdown__option-check">${isSel ? checkIcon() : ''}</span>
        <span>${escapeHtml(s)}</span>
      </div>
    `;
  }).join('');
}

/* Label del botón "Seleccionar/Deseleccionar todos" — depende del estado
   actual: si todos los del catálogo están seleccionados, ofrece
   "Deseleccionar todos"; en caso contrario, "Seleccionar todos". */
function sportsToggleAllLabel(selected) {
  return (selected && selected.length === SPORTS_CATALOG.length)
    ? 'Deseleccionar todos'
    : 'Seleccionar todos';
}

/* ─── Step 3: Fases del evento ─────────────────────────────────────
   Form por fase con tabs en la cabecera. Cada fase tiene su propio
   conjunto de campos (nombre, modalidad, fechas, sedes, delegaciones,
   docs). El array data.phases mantiene el state; ui.activePhase indica
   cuál se está editando. "+" agrega una fase vacía y la activa. */
function renderStep3() {
  const phases = _modalState.data.phases;
  const i = _modalState.ui.activePhase;
  const phase = phases[i] || phases[0];
  return `
    <div class="ev-form ev-step3">
      <h3 class="ev-step3__title">Fases del evento</h3>

      <div class="ev-phase-tabs" role="tablist" aria-label="Fases del evento">
        ${phases.map((_, idx) => `
          <div class="ev-phase-tab ${idx === i ? 'ev-phase-tab--active' : ''}"
               role="tab"
               aria-selected="${idx === i}">
            <button type="button" class="ev-phase-tab__main"
                    data-phase-tab="${idx}"
                    aria-label="Activar Fase ${idx + 1}">
              <span class="ev-phase-tab__num">${idx + 1}</span>
              <span class="ev-phase-tab__label">Fase</span>
            </button>
            ${phases.length > 1 ? `
              <button type="button"
                      class="ev-phase-tab__close ev-tooltip"
                      data-phase-remove="${idx}"
                      aria-label="Eliminar Fase ${idx + 1}"
                      data-tooltip="Eliminar fase">
                ${closeIconSmall()}
              </button>
            ` : ''}
          </div>
        `).join('')}
        <button type="button"
                class="naowee-btn naowee-btn--quiet naowee-btn--icon ev-phase-tab__add ev-tooltip"
                data-phase-add
                aria-label="Agregar fase"
                data-tooltip="Agregar fase">
          ${plusIcon()}
        </button>
      </div>

      ${renderPhaseForm(phase, i)}
    </div>
  `;
}

/* Bounds absolutos para las fechas de cualquier fase, derivados del
   evento (paso 1):
     outerMin = max(eventStart, inscEnd) — la fase arranca después de que
                cierren las inscripciones (y nunca antes del evento).
     outerMax = eventEnd                  — la fase termina dentro del
                rango del evento.
   Devuelven ISO o '' si la fecha del evento no está cargada.

   Defensa contra estado contradictorio: el paso 1 NO valida que
   inscEnd <= eventEnd. Si el usuario picó inscEnd > eventEnd, el max
   resultante quedaría POR ENCIMA del outerMax → calendar mata todos los
   días (cada uno cae fuera del rango imposible) y es imposible elegir
   fechas de fase. Cuando detectamos esa contradicción, descartamos
   inscEnd del cómputo del min (queda solo eventStart) — el calendar
   vuelve a ser usable y validateStep avisa del error si hay otra
   inconsistencia. */
function phaseOuterMin() {
  const d = _modalState.data;
  const eventStart = d.startDate || '';
  let inscEnd = d.inscEnd || '';
  if (inscEnd && d.endDate && inscEnd > d.endDate) {
    inscEnd = '';   /* contradiction → skip to keep calendar usable */
  }
  const candidates = [eventStart, inscEnd].filter(Boolean);
  if (!candidates.length) return '';
  return candidates.sort().pop();   /* ISO yyyy-mm-dd → string sort = chrono */
}
function phaseOuterMax() {
  return _modalState.data.endDate || '';
}

/* Formulario de una fase. Todos los data-field y data-field-wrap usan
   el path "phase.{i}.{field}" para identificar qué fase y qué campo
   estamos modificando — el handler central resuelve y escribe en
   data.phases[i][field]. */
function renderPhaseForm(phase, i) {
  const e = _modalState.errors;
  const fwrap = (name) => `phases.${i}.${name}`;
  return `
    <!-- Nombre de la fase (textfield required) -->
    <div class="naowee-textfield ${e[fwrap('name')] ? 'naowee-textfield--error' : ''}"
         data-field-wrap="${fwrap('name')}">
      <label class="naowee-textfield__label naowee-textfield__label--required">Nombre de la fase</label>
      <div class="naowee-textfield__input-wrap">
        <input class="naowee-textfield__input" type="text"
               placeholder="Nombre de la fase"
               value="${escapeHtml(phase.name)}"
               data-field="${fwrap('name')}"
               maxlength="120" />
      </div>
      ${e[fwrap('name')] ? errorHelper() : ''}
    </div>

    <!-- Cupos (checkbox toggle) -->
    <div class="ev-check-row" data-check-row="${fwrap('hasCupos')}">
      <span class="naowee-checkbox ${phase.hasCupos ? 'naowee-checkbox--checked' : ''}"
            data-field-toggle="${fwrap('hasCupos')}" tabindex="0" role="checkbox"
            aria-checked="${phase.hasCupos}">
        <span class="naowee-checkbox__box">
          ${phase.hasCupos ? checkIcon() : ''}
        </span>
      </span>
      <span class="ev-check-row__label">Cupos</span>
    </div>

    <!-- Modalidad de resultados (radio group) -->
    <div class="ev-radio-group">
      <label class="naowee-textfield__label">Modalidad de resultados</label>
      ${renderRadio(fwrap('modalidad'), 'manual', 'Manual', phase.modalidad === 'manual')}
      ${renderRadio(fwrap('modalidad'), 'puntaje', 'Por puntaje', phase.modalidad === 'puntaje')}
    </div>

    <!-- Descripción de la fase (textarea) -->
    <div class="naowee-textfield naowee-textfield--textarea">
      <label class="naowee-textfield__label">Descripción de la fase</label>
      <div class="naowee-textfield__input-wrap">
        <textarea class="naowee-textfield__input" rows="3" maxlength="500"
                  placeholder="Ingresa una descripción para esta fase"
                  data-field="${fwrap('description')}">${escapeHtml(phase.description)}</textarea>
      </div>
    </div>

    <!-- Fechas inicio / cierre (rango "phase{i}").
         Outer bounds:
           outerMin = max(eventStart, inscEnd) → la fase no puede empezar
                      antes de que se cierren las inscripciones del evento.
           outerMax = eventEnd                → la fase no puede terminar
                      después del fin del evento.
         Calculados en build-time del render — al cambiar las fechas del
         evento, el siguiente repaint() los recalcula. -->
    <div class="ev-grid-2">
      ${renderDatepicker(`evPhStart_${i}`, 'Fecha de inicio', true, phase.startDate, fwrap('startDate'), e[fwrap('startDate')], {
        range:'from', rangeName:`phase${i}`,
        outerMin: phaseOuterMin(),
        outerMax: phaseOuterMax()
      })}
      ${renderDatepicker(`evPhEnd_${i}`,   'Fecha de cierre', true, phase.endDate,   fwrap('endDate'),   e[fwrap('endDate')],   {
        range:'to',   rangeName:`phase${i}`,
        outerMin: phaseOuterMin(),
        outerMax: phaseOuterMax()
      })}
    </div>

    <!-- Sedes (multi-select dropdown) -->
    ${renderPhaseSedesDropdown(phase, i)}

    <!-- Escenarios (multi-select dinámico que aparece cuando hay sedes
         seleccionadas). Si hay 1 sede → lista plana. Si hay >1 sedes →
         agrupado por sede con headers. El render se actualiza vía
         repaintEscenariosBlock() al cambiar las sedes. -->
    <div data-escenarios-block="${i}">
      ${renderPhaseEscenariosDropdown(phase, i)}
    </div>

    <!-- Catálogo global de delegaciones (single-select del NIVEL) -->
    ${renderPhaseDelegacionesDropdown(phase, i, e[fwrap('delegaciones')])}

    <!-- Items del nivel (multi-select dinámico, aparece cuando se elige
         un nivel — Departamentos / Municipios / Clubes / Países / Instituciones).
         Cambiar el nivel limpia los items del nivel anterior. -->
    <div data-deleg-items-block="${i}">
      ${renderPhaseDelegacionesItemsDropdown(phase, i, e[fwrap('delegacionesItems')])}
    </div>

    <!-- Cargue de documentos (checkbox + info icon con tooltip).
         El (i) naranja muestra un tooltip oscuro al hover/focus indicando
         que activar este flag obliga a configurar la parametrización
         de los documentos en un paso posterior. -->
    <div class="ev-check-row" data-check-row="${fwrap('requireDocs')}">
      <span class="naowee-checkbox ${phase.requireDocs ? 'naowee-checkbox--checked' : ''}"
            data-field-toggle="${fwrap('requireDocs')}"
            tabindex="0" role="checkbox"
            aria-checked="${phase.requireDocs}">
        <span class="naowee-checkbox__box">
          ${phase.requireDocs ? checkIcon() : ''}
        </span>
      </span>
      <span class="ev-check-row__label">Cargue de documentos</span>
      <span class="ev-check-row__info ev-tooltip ev-tooltip--wide"
            tabindex="0"
            role="tooltip"
            aria-label="Más información"
            data-tooltip="Al marcarla, deberás configurar la parametrización de los documentos más adelante.">
        ${infoIcon()}
      </span>
    </div>
  `;
}

/* Radio button — pattern del DS naowee-radio. Click toggle del valor
   en el state path identificado por `name`. */
function renderRadio(name, value, label, checked) {
  return `
    <label class="naowee-radio ${checked ? 'naowee-radio--selected' : ''} ev-radio-row"
           data-field-radio="${name}" data-radio-value="${value}">
      <span class="naowee-radio__circle"></span>
      <span class="naowee-radio__label">${label}</span>
    </label>
  `;
}

/* Sedes multi-select (paso 3). Patrón equivalente al de Deportes pero
   sobre SEDES_CATALOG. State en data.phases[i].sedes. Search en vivo. */
function renderPhaseSedesDropdown(phase, i) {
  const fname = `phases.${i}.sedes`;
  const hasError = _modalState.errors[fname];
  return `
    <div class="naowee-dropdown naowee-dropdown--multiple ${hasError ? 'naowee-dropdown--error' : ''} ev-phase-dd"
         data-phase-sedes-dd="${i}"
         data-field-wrap="${fname}">
      <label class="naowee-dropdown__label naowee-dropdown__label--required">Sedes</label>
      <div class="naowee-dropdown__trigger" tabindex="0">
        ${renderSedesTriggerContent(phase.sedes)}
        <div class="naowee-dropdown__controls">
          <span class="naowee-dropdown__chevron">${chevronDown()}</span>
        </div>
      </div>
      <div class="naowee-dropdown__menu ev-sports-menu" role="listbox">
        <div class="ev-sports-menu__search">
          <span class="ev-sports-menu__search-icon">${searchIcon()}</span>
          <input type="text" class="ev-sports-menu__search-input"
                 placeholder="Buscar..." data-sedes-search
                 value="${escapeHtml(_modalState.ui.sedesSearch || '')}" />
        </div>
        <div class="ev-sports-menu__list" data-sedes-list>
          ${renderSedesOptions(phase.sedes, _modalState.ui.sedesSearch || '')}
        </div>
      </div>
      ${hasError ? errorHelper(typeof hasError === 'string' ? hasError : 'Este campo es obligatorio') : ''}
    </div>
  `;
}

function renderSedesTriggerContent(sedes) {
  if (!sedes || sedes.length === 0) {
    return `<span class="naowee-dropdown__placeholder">Seleccionar sede(s)</span>`;
  }
  if (sedes.length > 3) {
    return `
      <span class="naowee-dropdown__tags">
        <span class="naowee-tag naowee-tag--accent naowee-tag--small">
          ${sedes.length} sedes seleccionadas
          <span class="naowee-tag__active-area" data-remove-all-sedes>
            <span class="naowee-tag__close">${closeIconSmall()}</span>
          </span>
        </span>
      </span>
    `;
  }
  return `
    <span class="naowee-dropdown__tags">
      ${sedes.map(s => `
        <span class="naowee-tag naowee-tag--accent naowee-tag--small">
          ${escapeHtml(s)}
          <span class="naowee-tag__active-area" data-remove-sede="${escapeHtml(s)}">
            <span class="naowee-tag__close">${closeIconSmall()}</span>
          </span>
        </span>
      `).join('')}
    </span>
  `;
}

function renderSedesOptions(selected, search) {
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const q = norm((search || '').trim());
  const filtered = q ? SEDES_CATALOG.filter(s => norm(s).includes(q)) : SEDES_CATALOG;
  if (!filtered.length) {
    return `<div class="ev-sports-menu__empty">No se encontraron sedes</div>`;
  }
  return filtered.map(s => {
    const isSel = selected.includes(s);
    return `
      <div class="naowee-dropdown__option ${isSel ? 'naowee-dropdown__option--selected' : ''}"
           data-sede="${escapeHtml(s)}">
        <span class="naowee-dropdown__option-check">${isSel ? checkIcon() : ''}</span>
        <span>${escapeHtml(s)}</span>
      </div>
    `;
  }).join('');
}

/* ─── Escenarios (multi-select dinámico) ───────────────────────
   Se muestra solo cuando phase.sedes tiene al menos una sede.
   Las opciones provienen del map ESCENARIOS_BY_SEDE filtrado por
   las sedes activas. Si hay >1 sede → la lista del menú agrupa
   las opciones por sede con headers; con 1 sola sede → lista plana. */
function renderPhaseEscenariosDropdown(phase, i) {
  if (!phase.sedes || phase.sedes.length === 0) return '';
  const fname = `phases.${i}.escenarios`;
  return `
    <div class="naowee-dropdown naowee-dropdown--multiple ev-phase-dd"
         data-phase-esc-dd="${i}"
         data-field-wrap="${fname}">
      <label class="naowee-dropdown__label">Escenarios</label>
      <div class="naowee-dropdown__trigger" tabindex="0">
        ${renderEscenariosTriggerContent(phase.escenarios, phase.sedes)}
        <div class="naowee-dropdown__controls">
          <span class="naowee-dropdown__chevron">${chevronDown()}</span>
        </div>
      </div>
      <div class="naowee-dropdown__menu ev-sports-menu" role="listbox">
        <div class="ev-sports-menu__search">
          <span class="ev-sports-menu__search-icon">${searchIcon()}</span>
          <input type="text" class="ev-sports-menu__search-input"
                 placeholder="Buscar..." data-esc-search
                 value="${escapeHtml(_modalState.ui.escenariosSearch || '')}" />
        </div>
        <div class="ev-sports-menu__list" data-esc-list>
          ${renderEscenariosOptions(phase.escenarios, phase.sedes, _modalState.ui.escenariosSearch || '')}
        </div>
      </div>
    </div>
  `;
}

/* Trigger: misma lógica de pill consolidado que sedes — colapsa cuando
   la selección crece para no romper el layout. */
function renderEscenariosTriggerContent(escenarios, sedes) {
  if (!escenarios || escenarios.length === 0) {
    return `<span class="naowee-dropdown__placeholder">Seleccionar escenarios</span>`;
  }
  if (escenarios.length > 3) {
    return `
      <span class="naowee-dropdown__tags">
        <span class="naowee-tag naowee-tag--accent naowee-tag--small">
          ${escenarios.length} escenarios seleccionados
          <span class="naowee-tag__active-area" data-remove-all-esc>
            <span class="naowee-tag__close">${closeIconSmall()}</span>
          </span>
        </span>
      </span>
    `;
  }
  return `
    <span class="naowee-dropdown__tags">
      ${escenarios.map(esc => `
        <span class="naowee-tag naowee-tag--accent naowee-tag--small">
          ${escapeHtml(esc)}
          <span class="naowee-tag__active-area" data-remove-esc="${escapeHtml(esc)}">
            <span class="naowee-tag__close">${closeIconSmall()}</span>
          </span>
        </span>
      `).join('')}
    </span>
  `;
}

/* List render — dependiente de cuántas sedes hay seleccionadas.
   - 1 sede   → lista plana de los escenarios de esa sede
   - >1 sede  → secciones por sede con header (uppercase, gray) */
function renderEscenariosOptions(selected, sedes, search) {
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const q = norm((search || '').trim());
  const groupBy = (sede) => (ESCENARIOS_BY_SEDE[sede] || []).filter(e => !q || norm(e).includes(q));
  if (sedes.length === 1) {
    const list = groupBy(sedes[0]);
    if (!list.length) return `<div class="ev-sports-menu__empty">No se encontraron escenarios</div>`;
    return list.map(esc => optHtml(esc, selected.includes(esc))).join('');
  }
  /* Multi-sede → grupos */
  const sections = sedes.map(sede => {
    const list = groupBy(sede);
    if (!list.length) return '';
    return `
      <div class="ev-esc-group">
        <div class="ev-esc-group__header">${escapeHtml(sede)}</div>
        ${list.map(esc => optHtml(esc, selected.includes(esc))).join('')}
      </div>
    `;
  }).filter(Boolean);
  if (!sections.length) return `<div class="ev-sports-menu__empty">No se encontraron escenarios</div>`;
  return sections.join('');

  function optHtml(esc, isSel) {
    return `
      <div class="naowee-dropdown__option ${isSel ? 'naowee-dropdown__option--selected' : ''}"
           data-esc="${escapeHtml(esc)}">
        <span class="naowee-dropdown__option-check">${isSel ? checkIcon() : ''}</span>
        <span>${escapeHtml(esc)}</span>
      </div>
    `;
  }
}

/* Re-render del bloque de escenarios — llamado al cambiar las sedes.
   Mantiene el estado abierto cerrado (cierra el menú al re-pintar). */
function repaintEscenariosBlock(overlay, i) {
  const block = overlay.querySelector(`[data-escenarios-block="${i}"]`);
  if (!block) return;
  block.innerHTML = renderPhaseEscenariosDropdown(_modalState.data.phases[i], i);
  /* Después de pintar, re-bind solo del nuevo dropdown */
  bindPhaseEscenariosDropdown(overlay, i);
}

/* Delegaciones single-select (paso 3). Required. */
function renderPhaseDelegacionesDropdown(phase, i, hasError) {
  const fname = `phases.${i}.delegaciones`;
  return `
    <div class="naowee-dropdown ${hasError ? 'naowee-dropdown--error' : ''} ev-phase-dd"
         data-phase-deleg-dd="${i}"
         data-field-wrap="${fname}">
      <label class="naowee-dropdown__label naowee-dropdown__label--required">Catálogo global de delegaciones</label>
      <div class="naowee-dropdown__trigger" tabindex="0">
        ${phase.delegaciones
          ? `<span class="ev-dd-value">${escapeHtml(phase.delegaciones)}</span>`
          : `<span class="naowee-dropdown__placeholder">Seleccionar...</span>`}
        <div class="naowee-dropdown__controls">
          <span class="naowee-dropdown__chevron">${chevronDown()}</span>
        </div>
      </div>
      <div class="naowee-dropdown__menu ev-sports-menu" role="listbox">
        <div class="ev-sports-menu__search">
          <span class="ev-sports-menu__search-icon">${searchIcon()}</span>
          <input type="text" class="ev-sports-menu__search-input"
                 placeholder="Buscar..." data-deleg-search
                 value="${escapeHtml(_modalState.ui.delegSearch || '')}" />
        </div>
        <div class="ev-sports-menu__list" data-deleg-list>
          ${renderDelegacionesOptions(phase.delegaciones, _modalState.ui.delegSearch || '')}
        </div>
      </div>
      ${hasError ? errorHelper(typeof hasError === 'string' ? hasError : 'Este campo es obligatorio') : ''}
    </div>
  `;
}

function renderDelegacionesOptions(selected, search) {
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const q = norm((search || '').trim());
  const filtered = q ? DELEGACIONES_CATALOG.filter(s => norm(s).includes(q)) : DELEGACIONES_CATALOG;
  if (!filtered.length) {
    return `<div class="ev-sports-menu__empty">No se encontraron delegaciones</div>`;
  }
  return filtered.map(s => {
    const isSel = selected === s;
    return `
      <div class="naowee-dropdown__option ${isSel ? 'naowee-dropdown__option--selected' : ''}"
           data-deleg="${escapeHtml(s)}">
        <span class="naowee-dropdown__option-check">${isSel ? checkIcon() : ''}</span>
        <span>${escapeHtml(s)}</span>
      </div>
    `;
  }).join('');
}

/* ─── Items del nivel de delegación (multi-select dinámico) ──────
   Aparece cuando phase.delegaciones (nivel) está seleccionado. Pinta
   un dropdown de los items del nivel: si nivel="Departamentos" lista
   los 33 deptos, si nivel="Clubes" lista los clubes, etc. Cambiar de
   nivel limpia automáticamente los items del nivel anterior. */
function renderPhaseDelegacionesItemsDropdown(phase, i, hasError) {
  const level = phase.delegaciones;
  if (!level) return '';   /* sin nivel → no se muestra el campo */
  const fname = `phases.${i}.delegacionesItems`;
  const items = phase.delegacionesItems || [];
  /* Label dinámico: "Departamentos" / "Municipios" / etc. (el nivel
     escogido). Es el label del nuevo campo per dev-sports.naoweesuite.com. */
  const label = level;
  return `
    <div class="naowee-dropdown naowee-dropdown--multiple ${hasError ? 'naowee-dropdown--error' : ''} ev-phase-dd"
         data-phase-deleg-items-dd="${i}"
         data-field-wrap="${fname}">
      <label class="naowee-dropdown__label naowee-dropdown__label--required">${escapeHtml(label)}</label>
      <div class="naowee-dropdown__trigger" tabindex="0">
        ${renderDelegItemsTriggerContent(items, level)}
        <div class="naowee-dropdown__controls">
          <span class="naowee-dropdown__chevron">${chevronDown()}</span>
        </div>
      </div>
      <div class="naowee-dropdown__menu ev-sports-menu" role="listbox">
        <div class="ev-sports-menu__search">
          <span class="ev-sports-menu__search-icon">${searchIcon()}</span>
          <input type="text" class="ev-sports-menu__search-input"
                 placeholder="Buscar..." data-deleg-items-search
                 value="${escapeHtml(_modalState.ui.delegItemsSearch || '')}" />
        </div>
        <div class="ev-sports-menu__list" data-deleg-items-list>
          ${renderDelegItemsOptions(items, level, _modalState.ui.delegItemsSearch || '')}
        </div>
      </div>
      ${hasError ? errorHelper(typeof hasError === 'string' ? hasError : 'Selecciona al menos un item') : ''}
    </div>
  `;
}

/* Trigger del dropdown de items: placeholder dinámico con el nivel,
   tags individuales para selecciones chicas (≤3), pill consolidado
   "N items seleccionados" para selecciones grandes. */
function renderDelegItemsTriggerContent(items, level) {
  if (!items || items.length === 0) {
    /* Placeholder dinámico — usa el nivel en minúscula plural natural */
    const lvl = (level || '').toLowerCase();
    return `<span class="naowee-dropdown__placeholder">Seleccionar ${escapeHtml(lvl)}</span>`;
  }
  if (items.length > 3) {
    return `
      <span class="naowee-dropdown__tags">
        <span class="naowee-tag naowee-tag--accent naowee-tag--small">
          ${items.length} ${escapeHtml((level || '').toLowerCase())} seleccionados
          <span class="naowee-tag__active-area" data-remove-all-deleg-items>
            <span class="naowee-tag__close">${closeIconSmall()}</span>
          </span>
        </span>
      </span>
    `;
  }
  return `
    <span class="naowee-dropdown__tags">
      ${items.map(it => `
        <span class="naowee-tag naowee-tag--accent naowee-tag--small">
          ${escapeHtml(it)}
          <span class="naowee-tag__active-area" data-remove-deleg-item="${escapeHtml(it)}">
            <span class="naowee-tag__close">${closeIconSmall()}</span>
          </span>
        </span>
      `).join('')}
    </span>
  `;
}

function renderDelegItemsOptions(selected, level, search) {
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const q = norm((search || '').trim());
  const catalog = DELEGACION_ITEMS_BY_LEVEL[level] || [];
  const filtered = q ? catalog.filter(s => norm(s).includes(q)) : catalog;
  if (!filtered.length) {
    return `<div class="ev-sports-menu__empty">No se encontraron resultados</div>`;
  }
  return filtered.map(s => {
    const isSel = selected.includes(s);
    return `
      <div class="naowee-dropdown__option ${isSel ? 'naowee-dropdown__option--selected' : ''}"
           data-deleg-item="${escapeHtml(s)}">
        <span class="naowee-dropdown__option-check">${isSel ? checkIcon() : ''}</span>
        <span>${escapeHtml(s)}</span>
      </div>
    `;
  }).join('');
}

/* Re-render del bloque de items — llamado al cambiar el nivel de
   delegación (limpia y re-pinta el dropdown con el nuevo catálogo). */
function repaintDelegItemsBlock(overlay, i) {
  const block = overlay.querySelector(`[data-deleg-items-block="${i}"]`);
  if (!block) return;
  const ph = _modalState.data.phases[i];
  const errs = _modalState.errors;
  block.innerHTML = renderPhaseDelegacionesItemsDropdown(
    ph, i, errs[`phases.${i}.delegacionesItems`]
  );
  bindPhaseDelegacionesItemsDropdown(overlay, i);
}

/* Trigger content del dropdown de categorías. Mismo pattern de
   consolidación que sports/sedes/escenarios:
     0           → placeholder
     1..LIMIT(3) → tags individuales removibles
     LIMIT+1..N-1→ "X categorías seleccionadas ×"  (X borra todas)
     N (todas)   → "Todas las categorías ×"        (X borra todas)
   Threshold 3 (campo más angosto que sports/sedes que toleraban 4). */
const CATEGORIES_TAGS_LIMIT = 3;

function renderCategoryTriggerContent(categories) {
  if (!categories || categories.length === 0) {
    return `<span class="naowee-dropdown__placeholder">Seleccioná una o más categorías</span>`;
  }
  const total = CATEGORIES.length;
  if (categories.length === total || categories.length > CATEGORIES_TAGS_LIMIT) {
    const label = categories.length === total
      ? 'Todas las categorías'
      : `${categories.length} categorías seleccionadas`;
    return `
      <span class="naowee-dropdown__tags">
        <span class="naowee-tag naowee-tag--accent naowee-tag--small" data-tag="__bulk">
          ${label}
          <span class="naowee-tag__active-area" data-remove-all-categories>
            <span class="naowee-tag__close">${closeIconSmall()}</span>
          </span>
        </span>
      </span>
    `;
  }
  return `
    <span class="naowee-dropdown__tags">
      ${categories.map((c) => `
        <span class="naowee-tag naowee-tag--accent naowee-tag--small" data-tag="${c}">
          ${c}
          <span class="naowee-tag__active-area" data-remove-tag="${c}">
            <span class="naowee-tag__close">${closeIconSmall()}</span>
          </span>
        </span>
      `).join('')}
    </span>
  `;
}

/* Helper de error "Este campo es obligatorio" — DS naowee-helper--negative
   con badge rojo + ícono de exclamación (mismo SVG que programa-wizard). */
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

/* Helper-only HTML fragment (sin wrapper) — para inyectar dentro de un
   field existente cuando aplicamos error sin re-render. */
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

/* Date picker — input read-only con popup custom (DS-styled).
   Display: dd MMM yyyy (ej. "15 may 2026"). Storage: ISO yyyy-mm-dd.
   El popup se inyecta al body con position:fixed para escapar el modal scroll.

   Rango opcional vía rangeOpts:
     { range:'from'|'to', rangeName:'event'|'inscriptions' }
   El field "to" usa el "from" como minDate. Si después de elegir un "from"
   el "to" queda inválido, se limpia automáticamente con flash visual. */
function renderDatepicker(id, label, required, isoValue, fieldName, hasError, rangeOpts) {
  const display = isoValue ? formatHumanFromIso(isoValue) : '';
  /* Outer bounds absolutos — separados del rango from/to (que vincula
     dos fields del MISMO rangeName). Útil para constraints contra fechas
     externas (ej: phase.endDate ≤ event.endDate). */
  const outerMin = rangeOpts && rangeOpts.outerMin ? ` data-outer-min="${rangeOpts.outerMin}"` : '';
  const outerMax = rangeOpts && rangeOpts.outerMax ? ` data-outer-max="${rangeOpts.outerMax}"` : '';
  const rangeAttrs = rangeOpts
    ? `data-range="${rangeOpts.range}" data-range-name="${rangeOpts.rangeName}"${outerMin}${outerMax}`
    : '';
  /* Locked: el field está bloqueado por dependencia con otro field
     (ej: inscStart depende de startDate). Visualmente disabled, sin wire
     de calendar, con helper hint informativo. */
  const locked = !!(rangeOpts && rangeOpts.locked);
  const lockHint = (rangeOpts && rangeOpts.lockHint) || '';
  const wrapClasses = [
    'naowee-textfield',
    'has-datepicker',
    hasError ? 'naowee-textfield--error' : '',
    locked   ? 'naowee-textfield--disabled' : '',
    locked   ? 'ev-locked' : ''
  ].filter(Boolean).join(' ');

  return `
    <div class="${wrapClasses}"
         data-ev-datepicker
         data-field-wrap="${fieldName}"
         ${rangeAttrs}>
      <label class="naowee-textfield__label ${required ? 'naowee-textfield__label--required' : ''}" for="${id}">
        ${label}
      </label>
      <div class="naowee-textfield__input-wrap">
        <input class="naowee-textfield__input ev-date-input" type="text" id="${id}"
               readonly
               ${locked ? 'disabled' : ''}
               placeholder="dd mmm aaaa"
               value="${display}"
               data-iso="${isoValue || ''}"
               data-field="${fieldName}" />
        <span class="naowee-textfield__suffix ev-date-suffix">${locked ? lockIcon() : calendarIcon()}</span>
      </div>
      <div class="ev-range-helper" data-range-helper hidden></div>
      ${locked && lockHint ? `<div class="naowee-helper"><div class="naowee-helper__text ev-lock-hint">${lockHint}</div></div>` : ''}
      ${hasError ? errorHelper() : ''}
    </div>
  `;
}

/* ─── Step 4: Modalidades y Pruebas ─────────────────────────────
   Estructura:
     · Caution banner (mismo del paso 2 — re-enfatiza inmutabilidad post-creación)
     · Filter row: deporte single-select (default "Todos") + search "Buscar prueba"
     · Tabs: Individual / De conjunto / Paradeportes
     · Tabla con columnas dinámicas (las categorías del paso 1) + cada
       row tiene un checkbox + dropdown de Sexo por categoría
   La tabla agrupa pruebas por deporte, con headers colapsables. */
function renderStep4() {
  const d = _modalState.data;
  const u = _modalState.ui;
  /* Si no hay categorías ni deportes (raro — step 1/2 son required), dejá
     un mensaje guía. En condiciones normales la lista nunca llega vacía. */
  if (!d.sports.length || !d.categories.length) {
    return `
      <div class="ev-form ev-step4">
        <h3 class="ev-step4__title">Modalidades y Pruebas</h3>
        <p class="ev-step4__empty">Para configurar pruebas, primero seleccioná deportes (paso 2) y categorías (paso 1).</p>
      </div>
    `;
  }
  return `
    <div class="ev-form ev-step4">
      <h3 class="ev-step4__title">Modalidades y Pruebas</h3>

      <div class="naowee-message naowee-message--caution ev-step4__notice">
        <div class="naowee-message__header">
          <span class="naowee-message__icon">${cautionBadgeIcon()}</span>
          <span class="naowee-message__body">Una vez creado el evento no se podrán modificar los deportes seleccionados.</span>
        </div>
      </div>

      <!-- Filter row: deporte filter (left) + search prueba (right) -->
      <div class="ev-step4__filters">
        ${renderModDeporteFilter(d.sports, u.modDeporteFilter)}
        <div class="ev-step4__search ${u.modSearch ? 'ev-step4__search--has-value' : ''}">
          <span class="ev-step4__search-icon">${searchIcon()}</span>
          <input type="text" class="ev-step4__search-input"
                 placeholder="Buscar prueba" data-mod-search
                 value="${escapeHtml(u.modSearch || '')}" />
          <button type="button" class="ev-step4__search-clear"
                  data-mod-search-clear aria-label="Limpiar búsqueda">
            ${closeIconSmall()}
          </button>
        </div>
      </div>

      <!-- Tabs Individual / De conjunto / Paradeportes — DS naowee-tabs -->
      <div class="naowee-tabs naowee-tabs--proportional ev-step4__tabs">
        ${renderModTab('individual', 'Individual', u.modActiveTab)}
        ${renderModTab('conjunto', 'De conjunto', u.modActiveTab)}
        ${renderModTab('paradeporte', 'Paradeportes', u.modActiveTab)}
      </div>

      <!-- Tabla -->
      ${renderModTable(d, u)}
    </div>
  `;
}

function renderModTab(value, label, active) {
  const cls = ['naowee-tab'];
  if (value === active) cls.push('naowee-tab--selected');
  return `<button type="button" class="${cls.join(' ')}" data-mod-tab="${value}">${label}</button>`;
}

/* Filtro de deportes — single-select dropdown con opción "Todos" + el
   set de deportes que el usuario eligió en paso 2. Puerta de entrada
   para acotar la tabla a un deporte específico. */
function renderModDeporteFilter(sports, current) {
  const value = current || 'Todos';
  return `
    <div class="naowee-dropdown ev-step4__deporte-dd" data-mod-deporte-dd>
      <label class="naowee-dropdown__label">Deportes <span class="ev-required">*</span></label>
      <div class="naowee-dropdown__trigger" tabindex="0">
        <span class="ev-dd-value">${escapeHtml(value)}</span>
        <div class="naowee-dropdown__controls">
          <span class="naowee-dropdown__chevron">${chevronDown()}</span>
        </div>
      </div>
      <div class="naowee-dropdown__menu ev-sports-menu" role="listbox">
        <div class="ev-sports-menu__search">
          <span class="ev-sports-menu__search-icon">${searchIcon()}</span>
          <input type="text" class="ev-sports-menu__search-input"
                 placeholder="Buscar..." data-mod-deporte-search />
        </div>
        <div class="ev-sports-menu__list" data-mod-deporte-list>
          ${renderModDeporteOptions(sports, value, '')}
        </div>
      </div>
    </div>
  `;
}

function renderModDeporteOptions(sports, selected, search) {
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const q = norm((search || '').trim());
  const all = ['Todos', ...sports];
  const filtered = q ? all.filter(s => norm(s).includes(q)) : all;
  if (!filtered.length) {
    return `<div class="ev-sports-menu__empty">No se encontraron resultados</div>`;
  }
  return filtered.map(s => {
    const isSel = selected === s;
    return `
      <div class="naowee-dropdown__option ${isSel ? 'naowee-dropdown__option--selected' : ''}"
           data-mod-deporte="${escapeHtml(s)}">
        <span class="naowee-dropdown__option-check">${isSel ? checkIcon() : ''}</span>
        <span>${escapeHtml(s)}</span>
      </div>
    `;
  }).join('');
}

/* Renderiza la tabla del paso 4 según el tab activo + filtros. La data
   se construye filtrando los deportes seleccionados (paso 2) por:
     1) tab activo (individual / conjunto / paradeporte)
     2) deporte filter (Todos o uno específico)
     3) search "Buscar prueba"
   Los grupos vacíos por filtros se omiten. */
function renderModTable(d, u) {
  const cats = d.categories;
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const q = norm((u.modSearch || '').trim());
  /* Sources: si filter !== 'Todos', solo ese deporte. */
  const sportList = u.modDeporteFilter && u.modDeporteFilter !== 'Todos'
    ? d.sports.filter(s => s === u.modDeporteFilter)
    : d.sports.slice();

  /* Construye grupos { sport, pruebas } solo con pruebas del tab activo
     y que matcheen el search. */
  const groups = sportList.map((sport) => {
    const all = getSportPruebas(sport);
    const tabPruebas = all[u.modActiveTab] || [];
    const matched = q ? tabPruebas.filter(p => norm(p).includes(q)) : tabPruebas;
    return { sport, pruebas: matched };
  }).filter(g => g.pruebas.length > 0);

  if (!groups.length) {
    return `
      <div class="ev-step4__empty-table">
        <p>No hay pruebas que coincidan con los filtros actuales.</p>
      </div>
    `;
  }

  return `
    <div class="ev-mod-table" role="table">
      <div class="ev-mod-table__head" role="row">
        <div class="ev-mod-table__cell ev-mod-table__cell--name">Disciplinas</div>
        ${cats.map(c => `<div class="ev-mod-table__cell ev-mod-table__cell--cat">${escapeHtml(c)}</div>`).join('')}
      </div>
      ${groups.map(g => renderModSportGroup(g, cats, u)).join('')}
    </div>
  `;
}

function renderModSportGroup(group, cats, u) {
  const collapsed = !!u.modCollapsed[group.sport];
  return `
    <div class="ev-mod-group ${collapsed ? 'ev-mod-group--collapsed' : ''}">
      <button type="button" class="ev-mod-group__header" data-mod-collapse="${escapeHtml(group.sport)}">
        <span class="ev-mod-group__name">
          <span class="ev-mod-group__emoji" aria-hidden="true">${sportEmoji(group.sport)}</span>
          <span class="ev-mod-group__label">${escapeHtml(group.sport)}</span>
        </span>
        <span class="ev-mod-group__chevron">${chevronDown()}</span>
      </button>
      ${collapsed ? '' : `
        <div class="ev-mod-group__body">
          ${group.pruebas.map(p => renderModPruebaRow(group.sport, p, cats)).join('')}
        </div>
      `}
    </div>
  `;
}

function renderModPruebaRow(sport, prueba, cats) {
  return `
    <div class="ev-mod-row" role="row">
      <div class="ev-mod-table__cell ev-mod-table__cell--name">${escapeHtml(prueba)}</div>
      ${cats.map(cat => renderModCell(sport, prueba, cat)).join('')}
    </div>
  `;
}

function renderModCell(sport, prueba, cat) {
  const key = modKey(sport, prueba, cat);
  const cell = _modalState.data.modalidades[key];
  const enabled = !!(cell && cell.enabled);
  const sexos = (cell && cell.sexos) || [];
  const open = _modalState.ui.modSexoOpenKey === key;
  /* Label compacto del sexo — abreviaciones unidas con bullet:
     ['Hombre','Mujer'] → "H•M"   (caso default tras enable)
     ['Hombre']         → "H"
     ['Mujer']          → "M"
     ['Mixto']          → "Mx"
     [H,M,Mx]           → "H•M•Mx"
     []                 → "Sexo"  (placeholder, solo si enabled=false)
     Mantiene la fila compacta cuando hay 7+ categorías en columnas. */
  const label = sexos.length === 0 ? 'Sexo' : sexoLabel(sexos);
  return `
    <div class="ev-mod-table__cell ev-mod-table__cell--cat" data-mod-cell="${escapeHtml(key)}">
      <span class="naowee-checkbox ${enabled ? 'naowee-checkbox--checked' : ''}"
            data-mod-cell-toggle="${escapeHtml(key)}"
            tabindex="0" role="checkbox" aria-checked="${enabled}">
        <span class="naowee-checkbox__box">${enabled ? checkIcon() : ''}</span>
      </span>
      <button type="button" class="ev-mod-cell__sexo ${open ? 'ev-mod-cell__sexo--open' : ''}"
              data-mod-sexo-trigger="${escapeHtml(key)}"
              ${enabled ? '' : 'disabled'}>
        <span class="ev-mod-cell__sexo-label">${escapeHtml(label)}</span>
        <span class="ev-mod-cell__sexo-chevron">${chevronDown()}</span>
      </button>
      ${open ? `
        <div class="ev-mod-cell__sexo-menu" data-mod-sexo-menu="${escapeHtml(key)}">
          ${SEXOS_OPTIONS.map(s => `
            <label class="ev-mod-cell__sexo-opt" data-mod-sexo-opt="${escapeHtml(s)}">
              <span class="naowee-checkbox ${sexos.includes(s) ? 'naowee-checkbox--checked' : ''}">
                <span class="naowee-checkbox__box">${sexos.includes(s) ? checkIcon() : ''}</span>
              </span>
              <span class="ev-mod-cell__sexo-opt-label">${escapeHtml(s)}</span>
            </label>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

/* Genera la key compuesta para el map data.modalidades. Usa "::" como
   separador (improbable de aparecer en nombres de deporte/prueba/categoria). */
function modKey(sport, prueba, cat) {
  return `${sport}::${prueba}::${cat}`;
}

/* Abrevia los sexos seleccionados a un label compacto unido por bullet:
   Hombre→"H", Mujer→"M", Mixto→"Mx". Devuelve "" si vacío. */
function sexoLabel(sexos) {
  if (!sexos || !sexos.length) return '';
  return sexos.map(s => s === 'Hombre' ? 'H' : s === 'Mujer' ? 'M' : 'Mx').join('•');
}

/* Re-pinta solo la tabla del step 4 (no el filter row ni los tabs).
   Usado al toggle de checkbox/sexo, search input, deporte filter — para
   actualizar la grilla sin perder el foco del search. */
function repaintModTable() {
  const overlay = _modalState.el;
  if (!overlay) return;
  const wrap = overlay.querySelector('.ev-step4');
  if (!wrap) return;
  /* Reemplaza solo la tabla — preserva filters/tabs/title. */
  const old = wrap.querySelector('.ev-mod-table, .ev-step4__empty-table');
  if (!old) return;
  const tmp = document.createElement('div');
  tmp.innerHTML = renderModTable(_modalState.data, _modalState.ui);
  if (tmp.firstElementChild) old.replaceWith(tmp.firstElementChild);
}

function renderStepPlaceholder(title, description) {
  return `
    <div class="ev-step-placeholder">
      <h3>${title}</h3>
      <p>${description}</p>
      <p class="ev-step-placeholder__note">— Placeholder: contenido del paso por diseñar. —</p>
    </div>
  `;
}

/* ─── Eventos ──────────────────────────────────────────────────────── */
function bindModalEvents() {
  const overlay = _modalState.el;
  if (!overlay) return;

  /* Click en overlay (fuera del modal) cierra. Bind ONE-SHOT — el
     overlay sobrevive entre repaints, así que re-bind agregaría
     duplicados que dispararían closeModal múltiples veces. */
  if (!overlay._evOverlayClickBound) {
    overlay._evOverlayClickBound = true;
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
  }

  /* Botones de acción (header dismiss + footer) */
  overlay.querySelectorAll('[data-act]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const act = btn.getAttribute('data-act');
      if (act === 'close')  { closeModal(); return; }
      if (act === 'prev')   {
        if (_modalState.step > 1) {
          _modalState.step -= 1;
          _modalState.errors = {};
          repaint();
        }
        return;
      }
      if (act === 'next')   {
        const errors = validateStep(_modalState.step);
        if (Object.keys(errors).length > 0) {
          _modalState.errors = errors;
          showErrorsSurgically(errors);   /* sin repaint: shake + scroll */
          return;
        }
        if (_modalState.step < TOTAL_STEPS) {
          _modalState.step += 1;
          _modalState.errors = {};
          repaint();
        }
        return;
      }
      if (act === 'finish') {
        const errors = validateStep(_modalState.step);
        if (Object.keys(errors).length > 0) {
          _modalState.errors = errors;
          showErrorsSurgically(errors);
          return;
        }
        console.info('[event-create] finish — datos:', _modalState.data);
        /* Captura el snapshot ANTES de cerrar el modal — closeModal()
           limpia _modalState.data y luego no podríamos pintar el resumen. */
        const snapshot = {
          name: _modalState.data.name,
          startDate: _modalState.data.startDate,
          endDate: _modalState.data.endDate,
          inscEnd: _modalState.data.inscEnd,
          phases: _modalState.data.phases.length,
          sports: _modalState.data.sports.length
        };
        closeModal();
        /* Defer el success modal hasta que la animación de cierre del
           wizard complete (180ms) — evita que ambos modales se vean a
           la vez compitiendo por la atención. */
        setTimeout(() => showEventSuccessModal(snapshot), 200);
        return;
      }
    });
  });

  /* Click en step del stepper → ir a ese paso (solo si ya pasamos por él) */
  overlay.querySelectorAll('.naowee-stepper__step[data-step]').forEach((stepEl) => {
    stepEl.addEventListener('click', () => {
      const target = parseInt(stepEl.getAttribute('data-step'), 10);
      if (target < _modalState.step) {
        _modalState.step = target;
        _modalState.errors = {};
        repaint();
      }
    });
  });

  /* Form fields (sync con state). Al escribir, limpiamos el error de ese
     campo de forma quirúrgica (sin repaint) para no perder el foco.
     Soporta paths anidados: "phase.0.name" → data.phases[0].name. */
  overlay.querySelectorAll('[data-field]').forEach((input) => {
    input.addEventListener('input', (e) => {
      const fieldName = input.getAttribute('data-field');
      setDataPath(fieldName, e.target.value);
      clearFieldError(fieldName);
    });
  });

  /* Counter de fases (input-stepper) — update QUIRÚRGICO sin repaint.
     Mutamos el array data.phases: push(emptyPhase) al inc, pop() al dec.
     Si el usuario decrece, perdemos la última fase configurada — comportamiento
     consistente con el patrón de digitación (los datos se reescriben en step 3). */
  overlay.querySelectorAll('[data-counter]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const dir = btn.getAttribute('data-counter');
      const phases = _modalState.data.phases;
      if (dir === 'inc') phases.push(emptyPhase());
      if (dir === 'dec' && phases.length > 1) phases.pop();

      const valueEl = overlay.querySelector('#evPhasesValue');
      if (valueEl) valueEl.textContent = phases.length;
      const decBtn = overlay.querySelector('[data-counter="dec"]');
      if (decBtn) decBtn.disabled = phases.length <= 1;

      /* Si la fase activa del paso 3 quedó fuera de rango, resetear */
      if (_modalState.ui.activePhase >= phases.length) {
        _modalState.ui.activePhase = phases.length - 1;
      }
    });
  });

  /* Datepickers custom — uno por cada [data-ev-datepicker] */
  overlay.querySelectorAll('[data-ev-datepicker]').forEach((field) => {
    wireDatepicker(field, overlay);
  });

  /* Dropdown de categoría — abre con position:fixed para escapar el
     overflow del modal__body. Posición calculada con getBoundingClientRect. */
  const dropdown = overlay.querySelector('#evCategoryDD');
  if (dropdown) {
    const trigger = dropdown.querySelector('.naowee-dropdown__trigger');
    const menu = dropdown.querySelector('.naowee-dropdown__menu');

    const positionMenu = () => {
      if (!trigger || !menu) return;
      const rect = trigger.getBoundingClientRect();
      menu.style.position = 'fixed';
      menu.style.top = `${rect.bottom + 6}px`;
      menu.style.left = `${rect.left}px`;
      menu.style.width = `${rect.width}px`;
      menu.style.zIndex = '9999';
    };

    trigger?.addEventListener('click', (e) => {
      /* Si el click fue sobre el X (active-area) de un tag o el X del
         pill consolidado, NO toggleamos el dropdown — los handlers de
         remove-* se encargan de modificar la selección sin abrir/cerrar. */
      if (e.target.closest('[data-remove-tag]')) return;
      if (e.target.closest('[data-remove-all-categories]')) return;
      e.stopPropagation();
      const opening = !dropdown.classList.contains('naowee-dropdown--open');
      /* Cerrar otros datepickers abiertos */
      document.querySelectorAll('.naowee-datepicker--popover.naowee-datepicker--open')
        .forEach(p => p.classList.remove('naowee-datepicker--open'));
      dropdown.classList.toggle('naowee-dropdown--open');
      if (opening) positionMenu();
    });

    /* Re-position al scrollear el body del modal o resize */
    const body = overlay.querySelector('.naowee-modal__body');
    body?.addEventListener('scroll', () => {
      if (dropdown.classList.contains('naowee-dropdown--open')) positionMenu();
    });
    window.addEventListener('resize', () => {
      if (dropdown.classList.contains('naowee-dropdown--open')) positionMenu();
    });

    /* Multi-select: cada click toggle add/remove de la categoría.
       NO cierra el menú — el usuario puede seleccionar varias.
       Update quirúrgico del trigger + del check de la opción para no
       perder el estado abierto del menú. */
    dropdown.querySelectorAll('.naowee-dropdown__option').forEach((opt) => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        const val = opt.getAttribute('data-val');
        const categories = _modalState.data.categories;
        const idx = categories.indexOf(val);
        if (idx >= 0) categories.splice(idx, 1);
        else          categories.push(val);

        /* Update visual del check + selected state de la opción */
        const check = opt.querySelector('.naowee-dropdown__option-check');
        if (idx >= 0) {
          opt.classList.remove('naowee-dropdown__option--selected');
          if (check) check.innerHTML = '';
        } else {
          opt.classList.add('naowee-dropdown__option--selected');
          if (check) check.innerHTML = checkIcon();
        }

        /* Update visual del trigger (placeholder ↔ tags) */
        refreshCategoryTrigger(dropdown);
        clearFieldError('categories');
        /* Re-position por si los tags hicieron crecer el trigger */
        positionMenu();
      });
    });

    /* Click en X de un tag → quitar esa categoría sin abrir/cerrar el menú.
       Bind UNA sola vez por overlay (el modal se destruye y rebindea limpio
       la próxima vez) — evita stack de handlers entre repaints. */
    if (!overlay._evRemoveTagBound) {
      overlay._evRemoveTagBound = true;
      overlay.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('[data-remove-tag]');
        if (!removeBtn) return;
        /* StopPropagation aquí para que el document.click que cierra el
           dropdown NO se dispare cuando el usuario solo quería borrar un tag. */
        e.stopPropagation();
        e.preventDefault();
        const val = removeBtn.getAttribute('data-remove-tag');
        const categories = _modalState.data.categories;
        const idx = categories.indexOf(val);
        if (idx < 0) return;
        categories.splice(idx, 1);
        /* Sync option__check de esa categoría en el menú */
        const dd = overlay.querySelector('#evCategoryDD');
        if (dd) {
          const opt = dd.querySelector(`.naowee-dropdown__option[data-val="${val}"]`);
          if (opt) {
            opt.classList.remove('naowee-dropdown__option--selected');
            const ch = opt.querySelector('.naowee-dropdown__option-check');
            if (ch) ch.innerHTML = '';
          }
          refreshCategoryTrigger(dd);
          if (dd.classList.contains('naowee-dropdown--open')) {
            const t = dd.querySelector('.naowee-dropdown__trigger');
            const m = dd.querySelector('.naowee-dropdown__menu');
            if (t && m) {
              const r = t.getBoundingClientRect();
              m.style.position = 'fixed';
              m.style.top = `${r.bottom + 6}px`;
              m.style.left = `${r.left}px`;
              m.style.width = `${r.width}px`;
              m.style.zIndex = '9999';
            }
          }
        }
      });
    }

    /* Click en X del pill consolidado "Todas las categorías" / "X seleccionadas"
       → vacía toda la selección. Re-pinta menú options + trigger sin perder
       el estado abierto del menú. */
    if (!overlay._evRemoveAllCategoriesBound) {
      overlay._evRemoveAllCategoriesBound = true;
      overlay.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-remove-all-categories]');
        if (!btn) return;
        e.stopPropagation();
        e.preventDefault();
        _modalState.data.categories = [];
        const dd = overlay.querySelector('#evCategoryDD');
        if (!dd) return;
        /* Sync visual de todas las options (deselecciona todas) */
        dd.querySelectorAll('.naowee-dropdown__option').forEach((opt) => {
          opt.classList.remove('naowee-dropdown__option--selected');
          const ch = opt.querySelector('.naowee-dropdown__option-check');
          if (ch) ch.innerHTML = '';
        });
        refreshCategoryTrigger(dd);
        clearFieldError('categories');
      });
    }

    document.addEventListener('click', () => {
      dropdown.classList.remove('naowee-dropdown--open');
    });
  }

  /* ─── Dropdown de DEPORTES (paso 2) ───────────────────────────
     Mismo pattern que el de categorías, +:
       - search input filtra options en vivo (sin repaint del dropdown)
       - botón "Seleccionar/Deseleccionar todos" toggle masivo
       - empty state cuando search no matchea ningún deporte. */
  const ddSports = overlay.querySelector('#evSportsDD');
  if (ddSports) {
    const trigger = ddSports.querySelector('.naowee-dropdown__trigger');
    const menu = ddSports.querySelector('.naowee-dropdown__menu');

    const positionSportsMenu = () => {
      if (!trigger || !menu) return;
      const rect = trigger.getBoundingClientRect();
      menu.style.position = 'fixed';
      menu.style.top = `${rect.bottom + 6}px`;
      menu.style.left = `${rect.left}px`;
      menu.style.width = `${rect.width}px`;
      menu.style.zIndex = '9999';
    };

    trigger?.addEventListener('click', (e) => {
      /* Si el click fue sobre el X de un tag (individual o "todos"),
         dejá que el handler de remove se ejecute SIN abrir/cerrar el menú. */
      if (e.target.closest('[data-remove-sport]')) return;
      if (e.target.closest('[data-remove-all-sports]')) return;
      e.stopPropagation();
      const opening = !ddSports.classList.contains('naowee-dropdown--open');
      document.querySelectorAll('.naowee-datepicker--popover.naowee-datepicker--open')
        .forEach(p => p.classList.remove('naowee-datepicker--open'));
      ddSports.classList.toggle('naowee-dropdown--open');
      if (opening) {
        positionSportsMenu();
        /* Foco al search al abrir → flujo "abro y empiezo a tipear" */
        const sb = menu.querySelector('[data-sports-search]');
        sb?.focus();
      }
    });

    /* Stop propagation dentro del menú para que el click outside no lo
       cierre cuando el usuario interactúa con search/list/toggle. */
    menu?.addEventListener('click', (e) => e.stopPropagation());

    /* Search en vivo: filtra la lista sin tocar el resto del menú.
       Mantiene foco en el input (no hay repaint global). */
    const searchInput = menu?.querySelector('[data-sports-search]');
    const listEl = menu?.querySelector('[data-sports-list]');
    if (searchInput && listEl) {
      searchInput.addEventListener('input', () => {
        _modalState.ui.sportsSearch = searchInput.value;
        listEl.innerHTML = renderSportsOptions(
          _modalState.data.sports,
          _modalState.ui.sportsSearch
        );
      });
      /* Stop propagation del keydown — el Esc de la app cierra el modal,
         pero adentro del search queremos que Esc solo limpie la query. */
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          if (searchInput.value) {
            searchInput.value = '';
            _modalState.ui.sportsSearch = '';
            listEl.innerHTML = renderSportsOptions(_modalState.data.sports, '');
          }
        }
      });
    }

    /* Click en una opción del listado — toggle add/remove del deporte.
       Delegamos en el contenedor para que sirva incluso cuando la lista
       se re-renderiza por filtro de search. */
    listEl?.addEventListener('click', (e) => {
      const opt = e.target.closest('.naowee-dropdown__option[data-sport]');
      if (!opt) return;
      e.stopPropagation();
      const val = opt.getAttribute('data-sport');
      const sports = _modalState.data.sports;
      const idx = sports.indexOf(val);
      if (idx >= 0) sports.splice(idx, 1);
      else          sports.push(val);

      const check = opt.querySelector('.naowee-dropdown__option-check');
      if (idx >= 0) {
        opt.classList.remove('naowee-dropdown__option--selected');
        if (check) check.innerHTML = '';
      } else {
        opt.classList.add('naowee-dropdown__option--selected');
        if (check) check.innerHTML = checkIcon();
      }
      refreshSportsTrigger(ddSports);
      refreshSportsToggleAll(ddSports);
      clearFieldError('sports');
      positionSportsMenu();
    });

    /* "Seleccionar todos / Deseleccionar todos" — toggle masivo.
       Decision: si TODOS están seleccionados → deseleccionar todos.
       En cualquier otro caso → seleccionar todos (incluye selección parcial
       y selección vacía). UX: cerrar el menú al ejecutar la acción
       masiva — el usuario ya completó su intención de "seleccionar todos"
       y querer ver el trigger consolidado en "Todos los deportes". Para
       deselección granular, abre el menú de nuevo. */
    const toggleAllBtn = menu?.querySelector('[data-sports-toggle-all]');
    toggleAllBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      const all = SPORTS_CATALOG.length;
      if (_modalState.data.sports.length === all) {
        _modalState.data.sports = [];
      } else {
        _modalState.data.sports = SPORTS_CATALOG.slice();
      }
      /* Re-render solo del list (no perder el foco del search) */
      if (listEl) {
        listEl.innerHTML = renderSportsOptions(
          _modalState.data.sports,
          _modalState.ui.sportsSearch || ''
        );
      }
      refreshSportsTrigger(ddSports);
      refreshSportsToggleAll(ddSports);
      clearFieldError('sports');
      /* Cerrar el menú tras la acción masiva. */
      ddSports.classList.remove('naowee-dropdown--open');
    });

    /* Re-position al scrollear/resize */
    const bodyEl = overlay.querySelector('.naowee-modal__body');
    bodyEl?.addEventListener('scroll', () => {
      if (ddSports.classList.contains('naowee-dropdown--open')) positionSportsMenu();
    });
    window.addEventListener('resize', () => {
      if (ddSports.classList.contains('naowee-dropdown--open')) positionSportsMenu();
    });

    /* Click en X del tag → quitar deporte sin abrir/cerrar el menú. */
    if (!overlay._evRemoveSportBound) {
      overlay._evRemoveSportBound = true;
      overlay.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-remove-sport]');
        if (!btn) return;
        e.stopPropagation();
        e.preventDefault();
        const val = btn.getAttribute('data-remove-sport');
        const sports = _modalState.data.sports;
        const idx = sports.indexOf(val);
        if (idx < 0) return;
        sports.splice(idx, 1);
        const dd = overlay.querySelector('#evSportsDD');
        if (!dd) return;
        const opt = dd.querySelector(`.naowee-dropdown__option[data-sport="${CSS.escape(val)}"]`);
        if (opt) {
          opt.classList.remove('naowee-dropdown__option--selected');
          const ch = opt.querySelector('.naowee-dropdown__option-check');
          if (ch) ch.innerHTML = '';
        }
        refreshSportsTrigger(dd);
        refreshSportsToggleAll(dd);
        if (dd.classList.contains('naowee-dropdown--open')) positionSportsMenu();
      });
    }

    /* Click en X del pill consolidado "Todos los deportes" → vacía toda
       la selección de una. No re-renderea el menú entero, solo:
        · limpia el array
        · re-pinta el list (sincroniza checks)
        · refresca el trigger (placeholder) y el toggle-all label */
    if (!overlay._evRemoveAllSportsBound) {
      overlay._evRemoveAllSportsBound = true;
      overlay.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-remove-all-sports]');
        if (!btn) return;
        e.stopPropagation();
        e.preventDefault();
        _modalState.data.sports = [];
        const dd = overlay.querySelector('#evSportsDD');
        if (!dd) return;
        const list = dd.querySelector('[data-sports-list]');
        if (list) {
          list.innerHTML = renderSportsOptions(
            _modalState.data.sports,
            _modalState.ui.sportsSearch || ''
          );
        }
        refreshSportsTrigger(dd);
        refreshSportsToggleAll(dd);
        if (dd.classList.contains('naowee-dropdown--open')) positionSportsMenu();
      });
    }

    /* Click outside cierra (igual al de categorías) */
    document.addEventListener('click', () => {
      ddSports.classList.remove('naowee-dropdown--open');
    });
  }

  /* ─── Step 3: tabs de fases + add ─────────────────────────────── */
  overlay.querySelectorAll('[data-phase-tab]').forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = parseInt(tab.getAttribute('data-phase-tab'), 10);
      if (Number.isNaN(target)) return;
      _modalState.ui.activePhase = target;
      _modalState.errors = {};      /* limpiar errores al cambiar de fase */
      _modalState.ui.sedesSearch = '';
      _modalState.ui.delegSearch = '';
      repaint();
    });
  });
  overlay.querySelector('[data-phase-add]')?.addEventListener('click', () => {
    _modalState.data.phases.push(emptyPhase());
    _modalState.ui.activePhase = _modalState.data.phases.length - 1;
    _modalState.errors = {};
    _modalState.ui.sedesSearch = '';
    _modalState.ui.escenariosSearch = '';
    _modalState.ui.delegSearch = '';
    repaint();
  });

  /* Eliminar fase via X del pill — solo disponible cuando hay >1 fase
     (la lógica de render oculta el botón si phases.length === 1). */
  overlay.querySelectorAll('[data-phase-remove]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.getAttribute('data-phase-remove'), 10);
      if (Number.isNaN(idx)) return;
      const phases = _modalState.data.phases;
      if (phases.length <= 1) return;
      phases.splice(idx, 1);
      /* Ajustar activePhase:
         - Si eliminé la fase activa → activamos la del mismo índice
           (que ahora es la siguiente que quedó), o la última si era la
           cola de la lista.
         - Si eliminé una fase ANTES de la activa → restamos 1 al index
           activo para mantener la misma fase visible.
         - Si eliminé una fase DESPUÉS de la activa → activePhase queda
           igual (sigue apuntando a la misma). */
      const active = _modalState.ui.activePhase;
      if (idx === active) {
        _modalState.ui.activePhase = Math.min(active, phases.length - 1);
      } else if (idx < active) {
        _modalState.ui.activePhase = active - 1;
      }
      _modalState.errors = {};
      _modalState.ui.sedesSearch = '';
      _modalState.ui.escenariosSearch = '';
      _modalState.ui.delegSearch = '';
      repaint();
    });
  });

  /* Checkboxes (Cupos / Cargue de documentos) — toggle por path.
     Bind en la ROW para que el click sobre el texto o el ícono también
     toggle la selección (UX estándar). Excluimos clicks sobre el (i)
     informativo: ése solo muestra tooltip, no toggle. */
  overlay.querySelectorAll('[data-check-row]').forEach((row) => {
    const path = row.getAttribute('data-check-row');
    const cb = row.querySelector('[data-field-toggle]');
    if (!cb) return;
    const toggle = (e) => {
      if (e.target.closest('.ev-check-row__info')) return;  /* click en (i) → ignorar */
      e.preventDefault();
      const next = !getDataPath(path);
      setDataPath(path, next);
      cb.classList.toggle('naowee-checkbox--checked', next);
      cb.setAttribute('aria-checked', String(next));
      const box = cb.querySelector('.naowee-checkbox__box');
      if (box) box.innerHTML = next ? checkIcon() : '';
    };
    row.addEventListener('click', toggle);
    /* Accesibilidad: Space/Enter en el cb hace lo mismo */
    cb.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        toggle(e);
      }
    });
  });

  /* Radios (Modalidad de resultados) — selección exclusiva por grupo
     (mismo data-field-radio path) — toggle visual quirúrgico sin repaint. */
  overlay.querySelectorAll('[data-field-radio]').forEach((rad) => {
    rad.addEventListener('click', (e) => {
      e.preventDefault();
      const path = rad.getAttribute('data-field-radio');
      const value = rad.getAttribute('data-radio-value');
      setDataPath(path, value);
      overlay.querySelectorAll(`[data-field-radio="${path}"]`).forEach((r) => {
        r.classList.toggle('naowee-radio--selected', r === rad);
      });
    });
  });

  /* Sedes dropdown (multi-select). Una instancia por fase activa
     (porque el step solo renderiza la fase activa, no las inactivas). */
  bindPhaseSedesDropdown(overlay);

  /* Escenarios dropdown — solo presente cuando la fase tiene >=1 sede.
     El bloque se re-pinta cuando cambian las sedes. */
  bindPhaseEscenariosDropdown(overlay, _modalState.ui.activePhase);

  /* Delegaciones dropdown (single-select del nivel). */
  bindPhaseDelegacionesDropdown(overlay);

  /* Items del nivel (multi-select dinámico) — solo presente cuando
     phase.delegaciones tiene un nivel elegido. */
  bindPhaseDelegacionesItemsDropdown(overlay, _modalState.ui.activePhase);

  /* Step 4 — Modalidades y Pruebas */
  bindStep4(overlay);

  /* Esc cierra */
  if (!document._evModalEscBound) {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && _modalState.el) closeModal();
    });
    document._evModalEscBound = true;
  }
}

/* ─── Validación: aplicar errores sin repaint ──────────────────────── */
/* Para cada campo inválido:
   1) Inserta o reusa el helper--negative dentro del wrapper
   2) Aplica naowee-textfield--error / naowee-dropdown--error
   3) Scrollea suavemente el body del modal al primer inválido
   4) Aplica .ev-shake para el wiggle (re-trigger después del scroll para
      que la animación sea visible). */
function showErrorsSurgically(errors) {
  const overlay = _modalState.el;
  if (!overlay) return;

  const body = overlay.querySelector('.naowee-modal__body');
  let firstInvalid = null;

  Object.keys(errors).forEach((fieldName) => {
    const wrap = overlay.querySelector(`[data-field-wrap="${fieldName}"]`);
    if (!wrap) return;

    /* Aplicar clase de error según tipo de field */
    if (wrap.classList.contains('naowee-dropdown')) {
      wrap.classList.add('naowee-dropdown--error');
    } else {
      wrap.classList.add('naowee-textfield--error');
    }

    /* Insertar o actualizar helper. Si el valor de errors[field] es un
       string, lo usamos como mensaje custom (ej: rango inválido). */
    const msg = typeof errors[fieldName] === 'string' ? errors[fieldName] : undefined;
    let helper = wrap.querySelector('.naowee-helper--negative');
    if (!helper) {
      helper = document.createElement('div');
      helper.className = 'naowee-helper naowee-helper--negative';
      wrap.appendChild(helper);
    }
    helper.innerHTML = errorHelperInner(msg);

    if (!firstInvalid) firstInvalid = wrap;
  });

  /* Scroll suave dentro del body del modal al primer inválido */
  if (firstInvalid && body) {
    const bodyRect = body.getBoundingClientRect();
    const fieldRect = firstInvalid.getBoundingClientRect();
    const targetTop = body.scrollTop + (fieldRect.top - bodyRect.top) - 24;
    body.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
  }

  /* Re-disparar shake después del scroll (260ms) — así el wiggle
     se ve aún cuando el campo entró por scroll. */
  setTimeout(() => {
    Object.keys(errors).forEach((fieldName) => {
      const wrap = overlay.querySelector(`[data-field-wrap="${fieldName}"]`);
      if (!wrap) return;
      wrap.classList.remove('naowee-shake');
      void wrap.offsetWidth;        /* reflow para reiniciar animation */
      wrap.classList.add('naowee-shake');
      setTimeout(() => wrap.classList.remove('naowee-shake'), 500);
    });
  }, 260);
}

/* Refresca el trigger del dropdown de DEPORTES (placeholder ↔ tags)
   sin tocar el menú/search/list — preserva el estado abierto y el foco. */
function refreshSportsTrigger(dropdown) {
  const trigger = dropdown.querySelector('.naowee-dropdown__trigger');
  if (!trigger) return;
  const controls = trigger.querySelector('.naowee-dropdown__controls');
  Array.from(trigger.children).forEach((child) => {
    if (child !== controls) child.remove();
  });
  trigger.insertAdjacentHTML('afterbegin', renderSportsTriggerContent(_modalState.data.sports));
}

/* Refresca el label del botón "Seleccionar/Deseleccionar todos" según
   el estado actual de selección (sin re-render del menú completo). */
function refreshSportsToggleAll(dropdown) {
  const btn = dropdown.querySelector('[data-sports-toggle-all]');
  if (!btn) return;
  btn.textContent = sportsToggleAllLabel(_modalState.data.sports);
}

/* ─── Step 3: sedes (multi-select) dropdown wiring ────────────── */
function bindPhaseSedesDropdown(overlay) {
  const dd = overlay.querySelector('[data-phase-sedes-dd]');
  if (!dd) return;
  const i = parseInt(dd.getAttribute('data-phase-sedes-dd'), 10);
  const trigger = dd.querySelector('.naowee-dropdown__trigger');
  const menu = dd.querySelector('.naowee-dropdown__menu');
  const list = dd.querySelector('[data-sedes-list]');
  const search = dd.querySelector('[data-sedes-search]');

  const position = () => {
    if (!trigger || !menu) return;
    const r = trigger.getBoundingClientRect();
    menu.style.position = 'fixed';
    menu.style.top = `${r.bottom + 6}px`;
    menu.style.left = `${r.left}px`;
    menu.style.width = `${r.width}px`;
    menu.style.zIndex = '9999';
  };

  trigger?.addEventListener('click', (e) => {
    if (e.target.closest('[data-remove-sede]')) return;
    if (e.target.closest('[data-remove-all-sedes]')) return;
    e.stopPropagation();
    const opening = !dd.classList.contains('naowee-dropdown--open');
    closeOtherFloatables(dd);
    dd.classList.toggle('naowee-dropdown--open');
    if (opening) {
      position();
      search?.focus();
    }
  });
  menu?.addEventListener('click', (e) => e.stopPropagation());

  search?.addEventListener('input', () => {
    _modalState.ui.sedesSearch = search.value;
    if (list) {
      list.innerHTML = renderSedesOptions(
        _modalState.data.phases[i].sedes,
        _modalState.ui.sedesSearch
      );
    }
  });

  list?.addEventListener('click', (e) => {
    const opt = e.target.closest('.naowee-dropdown__option[data-sede]');
    if (!opt) return;
    e.stopPropagation();
    const val = opt.getAttribute('data-sede');
    const sedes = _modalState.data.phases[i].sedes;
    const idx = sedes.indexOf(val);
    if (idx >= 0) sedes.splice(idx, 1);
    else          sedes.push(val);
    /* Update visual del check + del trigger sin repaint global. */
    const check = opt.querySelector('.naowee-dropdown__option-check');
    if (idx >= 0) {
      opt.classList.remove('naowee-dropdown__option--selected');
      if (check) check.innerHTML = '';
    } else {
      opt.classList.add('naowee-dropdown__option--selected');
      if (check) check.innerHTML = checkIcon();
    }
    refreshSedesTrigger(dd, i);
    clearFieldError(`phases.${i}.sedes`);
    /* Cascada: prune escenarios sin sede activa + re-pintar el bloque. */
    pruneEscenariosForSedes(i);
    repaintEscenariosBlock(overlay, i);
    position();
  });

  /* Remove sede via tag X (delegado, una sola vez por overlay) */
  if (!overlay._evRemoveSedeBound) {
    overlay._evRemoveSedeBound = true;
    overlay.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-remove-sede]');
      if (!btn) return;
      e.stopPropagation();
      e.preventDefault();
      const ddEl = e.target.closest('[data-phase-sedes-dd]');
      if (!ddEl) return;
      const idx = parseInt(ddEl.getAttribute('data-phase-sedes-dd'), 10);
      const val = btn.getAttribute('data-remove-sede');
      const sedes = _modalState.data.phases[idx].sedes;
      const k = sedes.indexOf(val);
      if (k >= 0) sedes.splice(k, 1);
      const opt = ddEl.querySelector(`.naowee-dropdown__option[data-sede="${CSS.escape(val)}"]`);
      if (opt) {
        opt.classList.remove('naowee-dropdown__option--selected');
        const ch = opt.querySelector('.naowee-dropdown__option-check');
        if (ch) ch.innerHTML = '';
      }
      refreshSedesTrigger(ddEl, idx);
      pruneEscenariosForSedes(idx);
      repaintEscenariosBlock(overlay, idx);
    });
  }

  /* Remove all sedes (cuando hay >3 → pill consolidado) */
  if (!overlay._evRemoveAllSedesBound) {
    overlay._evRemoveAllSedesBound = true;
    overlay.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-remove-all-sedes]');
      if (!btn) return;
      e.stopPropagation();
      e.preventDefault();
      const ddEl = e.target.closest('[data-phase-sedes-dd]');
      if (!ddEl) return;
      const idx = parseInt(ddEl.getAttribute('data-phase-sedes-dd'), 10);
      _modalState.data.phases[idx].sedes = [];
      const list2 = ddEl.querySelector('[data-sedes-list]');
      if (list2) {
        list2.innerHTML = renderSedesOptions([], _modalState.ui.sedesSearch || '');
      }
      refreshSedesTrigger(ddEl, idx);
      /* Sin sedes → escenarios vacíos + bloque oculto. */
      _modalState.data.phases[idx].escenarios = [];
      repaintEscenariosBlock(overlay, idx);
    });
  }

  document.addEventListener('click', () => {
    dd.classList.remove('naowee-dropdown--open');
  });
}

/* Quita de phase.escenarios cualquier escenario cuya sede ya no esté
   seleccionada. Se llama después de cada cambio en phase.sedes para
   evitar estados inconsistentes (escenario marcado de una sede que ya
   no está en la fase). */
function pruneEscenariosForSedes(i) {
  const ph = _modalState.data.phases[i];
  if (!ph) return;
  const validSet = new Set();
  ph.sedes.forEach((sede) => {
    (ESCENARIOS_BY_SEDE[sede] || []).forEach((esc) => validSet.add(esc));
  });
  ph.escenarios = ph.escenarios.filter((esc) => validSet.has(esc));
}

function refreshSedesTrigger(dd, i) {
  const trigger = dd.querySelector('.naowee-dropdown__trigger');
  if (!trigger) return;
  const controls = trigger.querySelector('.naowee-dropdown__controls');
  Array.from(trigger.children).forEach((c) => { if (c !== controls) c.remove(); });
  trigger.insertAdjacentHTML('afterbegin',
    renderSedesTriggerContent(_modalState.data.phases[i].sedes));
}

/* ─── Step 3: escenarios (multi-select dinámico) wiring ───────── */
function bindPhaseEscenariosDropdown(overlay, idx) {
  const dd = overlay.querySelector(`[data-phase-esc-dd="${idx}"]`);
  if (!dd) return;   /* no hay sedes → block vacío, nada que bindear */
  const trigger = dd.querySelector('.naowee-dropdown__trigger');
  const menu = dd.querySelector('.naowee-dropdown__menu');
  const list = dd.querySelector('[data-esc-list]');
  const search = dd.querySelector('[data-esc-search]');

  const position = () => {
    if (!trigger || !menu) return;
    const r = trigger.getBoundingClientRect();
    menu.style.position = 'fixed';
    menu.style.top = `${r.bottom + 6}px`;
    menu.style.left = `${r.left}px`;
    menu.style.width = `${r.width}px`;
    menu.style.zIndex = '9999';
  };

  trigger?.addEventListener('click', (e) => {
    if (e.target.closest('[data-remove-esc]')) return;
    if (e.target.closest('[data-remove-all-esc]')) return;
    e.stopPropagation();
    const opening = !dd.classList.contains('naowee-dropdown--open');
    closeOtherFloatables(dd);
    dd.classList.toggle('naowee-dropdown--open');
    if (opening) {
      position();
      search?.focus();
    }
  });
  menu?.addEventListener('click', (e) => e.stopPropagation());

  search?.addEventListener('input', () => {
    _modalState.ui.escenariosSearch = search.value;
    if (list) {
      const ph = _modalState.data.phases[idx];
      list.innerHTML = renderEscenariosOptions(ph.escenarios, ph.sedes, _modalState.ui.escenariosSearch);
    }
  });

  list?.addEventListener('click', (e) => {
    const opt = e.target.closest('.naowee-dropdown__option[data-esc]');
    if (!opt) return;
    e.stopPropagation();
    const val = opt.getAttribute('data-esc');
    const ph = _modalState.data.phases[idx];
    const k = ph.escenarios.indexOf(val);
    if (k >= 0) ph.escenarios.splice(k, 1);
    else        ph.escenarios.push(val);
    const check = opt.querySelector('.naowee-dropdown__option-check');
    if (k >= 0) {
      opt.classList.remove('naowee-dropdown__option--selected');
      if (check) check.innerHTML = '';
    } else {
      opt.classList.add('naowee-dropdown__option--selected');
      if (check) check.innerHTML = checkIcon();
    }
    refreshEscenariosTrigger(dd, idx);
    position();
  });

  /* Remove tag X / pill consolidado X — delegado al overlay (one-shot bind) */
  if (!overlay._evRemoveEscBound) {
    overlay._evRemoveEscBound = true;
    overlay.addEventListener('click', (e) => {
      const single = e.target.closest('[data-remove-esc]');
      const all = e.target.closest('[data-remove-all-esc]');
      if (!single && !all) return;
      e.stopPropagation();
      e.preventDefault();
      const ddEl = e.target.closest('[data-phase-esc-dd]');
      if (!ddEl) return;
      const i = parseInt(ddEl.getAttribute('data-phase-esc-dd'), 10);
      const ph = _modalState.data.phases[i];
      if (single) {
        const val = single.getAttribute('data-remove-esc');
        const k = ph.escenarios.indexOf(val);
        if (k >= 0) ph.escenarios.splice(k, 1);
        const opt = ddEl.querySelector(`.naowee-dropdown__option[data-esc="${CSS.escape(val)}"]`);
        if (opt) {
          opt.classList.remove('naowee-dropdown__option--selected');
          const ch = opt.querySelector('.naowee-dropdown__option-check');
          if (ch) ch.innerHTML = '';
        }
      } else {
        ph.escenarios = [];
        const list2 = ddEl.querySelector('[data-esc-list]');
        if (list2) {
          list2.innerHTML = renderEscenariosOptions([], ph.sedes, _modalState.ui.escenariosSearch || '');
        }
      }
      refreshEscenariosTrigger(ddEl, i);
    });
  }

  document.addEventListener('click', () => {
    dd.classList.remove('naowee-dropdown--open');
  });
}

function refreshEscenariosTrigger(dd, idx) {
  const trigger = dd.querySelector('.naowee-dropdown__trigger');
  if (!trigger) return;
  const controls = trigger.querySelector('.naowee-dropdown__controls');
  Array.from(trigger.children).forEach((c) => { if (c !== controls) c.remove(); });
  const ph = _modalState.data.phases[idx];
  trigger.insertAdjacentHTML('afterbegin',
    renderEscenariosTriggerContent(ph.escenarios, ph.sedes));
}

/* ─── Step 3: delegaciones (single-select) dropdown wiring ────── */
function bindPhaseDelegacionesDropdown(overlay) {
  const dd = overlay.querySelector('[data-phase-deleg-dd]');
  if (!dd) return;
  const i = parseInt(dd.getAttribute('data-phase-deleg-dd'), 10);
  const trigger = dd.querySelector('.naowee-dropdown__trigger');
  const menu = dd.querySelector('.naowee-dropdown__menu');
  const list = dd.querySelector('[data-deleg-list]');
  const search = dd.querySelector('[data-deleg-search]');

  const position = () => {
    if (!trigger || !menu) return;
    const r = trigger.getBoundingClientRect();
    menu.style.position = 'fixed';
    menu.style.top = `${r.bottom + 6}px`;
    menu.style.left = `${r.left}px`;
    menu.style.width = `${r.width}px`;
    menu.style.zIndex = '9999';
  };

  trigger?.addEventListener('click', (e) => {
    e.stopPropagation();
    const opening = !dd.classList.contains('naowee-dropdown--open');
    closeOtherFloatables(dd);
    dd.classList.toggle('naowee-dropdown--open');
    if (opening) {
      position();
      search?.focus();
    }
  });
  menu?.addEventListener('click', (e) => e.stopPropagation());

  search?.addEventListener('input', () => {
    _modalState.ui.delegSearch = search.value;
    if (list) {
      list.innerHTML = renderDelegacionesOptions(
        _modalState.data.phases[i].delegaciones,
        _modalState.ui.delegSearch
      );
    }
  });

  list?.addEventListener('click', (e) => {
    const opt = e.target.closest('.naowee-dropdown__option[data-deleg]');
    if (!opt) return;
    e.stopPropagation();
    const val = opt.getAttribute('data-deleg');
    const ph = _modalState.data.phases[i];
    const previousLevel = ph.delegaciones;
    ph.delegaciones = val;
    /* Cambiar de nivel → limpiar items del nivel anterior (catálogo
       distinto, no se pueden migrar). */
    if (previousLevel !== val) {
      ph.delegacionesItems = [];
      _modalState.ui.delegItemsSearch = '';
      clearFieldError(`phases.${i}.delegacionesItems`);
    }
    /* Single-select → cerrar al elegir + pintar el trigger. */
    const trg = dd.querySelector('.naowee-dropdown__trigger');
    if (trg) {
      const controls = trg.querySelector('.naowee-dropdown__controls');
      Array.from(trg.children).forEach((c) => { if (c !== controls) c.remove(); });
      trg.insertAdjacentHTML('afterbegin', `<span class="ev-dd-value">${escapeHtml(val)}</span>`);
    }
    /* Sync visual de las options (deselecciona las demás, selecciona ésta) */
    if (list) {
      list.querySelectorAll('.naowee-dropdown__option').forEach((o) => {
        const isThis = o === opt;
        o.classList.toggle('naowee-dropdown__option--selected', isThis);
        const ch = o.querySelector('.naowee-dropdown__option-check');
        if (ch) ch.innerHTML = isThis ? checkIcon() : '';
      });
    }
    clearFieldError(`phases.${i}.delegaciones`);
    dd.classList.remove('naowee-dropdown--open');
    /* Re-pintar el bloque dinámico de items con el nuevo catálogo. */
    repaintDelegItemsBlock(overlay, i);
  });

  document.addEventListener('click', () => {
    dd.classList.remove('naowee-dropdown--open');
  });
}

/* ─── Step 3: items del nivel de delegación (multi-select) ───────
   Patrón equivalente a sedes/escenarios: search + multi-select +
   tags/pill consolidado. Cataloga via DELEGACION_ITEMS_BY_LEVEL[level]. */
function bindPhaseDelegacionesItemsDropdown(overlay, idx) {
  const dd = overlay.querySelector(`[data-phase-deleg-items-dd="${idx}"]`);
  if (!dd) return;
  const trigger = dd.querySelector('.naowee-dropdown__trigger');
  const menu = dd.querySelector('.naowee-dropdown__menu');
  const list = dd.querySelector('[data-deleg-items-list]');
  const search = dd.querySelector('[data-deleg-items-search]');

  const position = () => {
    if (!trigger || !menu) return;
    const r = trigger.getBoundingClientRect();
    menu.style.position = 'fixed';
    menu.style.top = `${r.bottom + 6}px`;
    menu.style.left = `${r.left}px`;
    menu.style.width = `${r.width}px`;
    menu.style.zIndex = '9999';
  };

  trigger?.addEventListener('click', (e) => {
    if (e.target.closest('[data-remove-deleg-item]')) return;
    if (e.target.closest('[data-remove-all-deleg-items]')) return;
    e.stopPropagation();
    const opening = !dd.classList.contains('naowee-dropdown--open');
    closeOtherFloatables(dd);
    dd.classList.toggle('naowee-dropdown--open');
    if (opening) {
      position();
      search?.focus();
    }
  });
  menu?.addEventListener('click', (e) => e.stopPropagation());

  search?.addEventListener('input', () => {
    _modalState.ui.delegItemsSearch = search.value;
    if (list) {
      const ph = _modalState.data.phases[idx];
      list.innerHTML = renderDelegItemsOptions(
        ph.delegacionesItems, ph.delegaciones, _modalState.ui.delegItemsSearch
      );
    }
  });

  list?.addEventListener('click', (e) => {
    const opt = e.target.closest('.naowee-dropdown__option[data-deleg-item]');
    if (!opt) return;
    e.stopPropagation();
    const val = opt.getAttribute('data-deleg-item');
    const ph = _modalState.data.phases[idx];
    const k = ph.delegacionesItems.indexOf(val);
    if (k >= 0) ph.delegacionesItems.splice(k, 1);
    else        ph.delegacionesItems.push(val);
    const check = opt.querySelector('.naowee-dropdown__option-check');
    if (k >= 0) {
      opt.classList.remove('naowee-dropdown__option--selected');
      if (check) check.innerHTML = '';
    } else {
      opt.classList.add('naowee-dropdown__option--selected');
      if (check) check.innerHTML = checkIcon();
    }
    refreshDelegItemsTrigger(dd, idx);
    clearFieldError(`phases.${idx}.delegacionesItems`);
    position();
  });

  /* Remove tag X / pill consolidado X — delegado one-shot por overlay */
  if (!overlay._evRemoveDelegItemBound) {
    overlay._evRemoveDelegItemBound = true;
    overlay.addEventListener('click', (e) => {
      const single = e.target.closest('[data-remove-deleg-item]');
      const all = e.target.closest('[data-remove-all-deleg-items]');
      if (!single && !all) return;
      e.stopPropagation();
      e.preventDefault();
      const ddEl = e.target.closest('[data-phase-deleg-items-dd]');
      if (!ddEl) return;
      const i = parseInt(ddEl.getAttribute('data-phase-deleg-items-dd'), 10);
      const ph = _modalState.data.phases[i];
      if (single) {
        const val = single.getAttribute('data-remove-deleg-item');
        const k = ph.delegacionesItems.indexOf(val);
        if (k >= 0) ph.delegacionesItems.splice(k, 1);
        const opt = ddEl.querySelector(`.naowee-dropdown__option[data-deleg-item="${CSS.escape(val)}"]`);
        if (opt) {
          opt.classList.remove('naowee-dropdown__option--selected');
          const ch = opt.querySelector('.naowee-dropdown__option-check');
          if (ch) ch.innerHTML = '';
        }
      } else {
        ph.delegacionesItems = [];
        const list2 = ddEl.querySelector('[data-deleg-items-list]');
        if (list2) {
          list2.innerHTML = renderDelegItemsOptions([], ph.delegaciones, _modalState.ui.delegItemsSearch || '');
        }
      }
      refreshDelegItemsTrigger(ddEl, i);
    });
  }

  document.addEventListener('click', () => {
    dd.classList.remove('naowee-dropdown--open');
  });
}

function refreshDelegItemsTrigger(dd, idx) {
  const trigger = dd.querySelector('.naowee-dropdown__trigger');
  if (!trigger) return;
  const controls = trigger.querySelector('.naowee-dropdown__controls');
  Array.from(trigger.children).forEach((c) => { if (c !== controls) c.remove(); });
  const ph = _modalState.data.phases[idx];
  trigger.insertAdjacentHTML('afterbegin',
    renderDelegItemsTriggerContent(ph.delegacionesItems, ph.delegaciones));
}

/* ─── Step 4: Modalidades y Pruebas — wiring ──────────────────── */
function bindStep4(overlay) {
  /* Tabs Individual / Conjunto / Paradeporte — switch del tab activo.
     Re-pintamos solo la tabla (no toda la pantalla) para preservar el
     foco del search "Buscar prueba" que acabamos de tipear.
     Bind directo a cada tab button (DOM nuevo en cada repaint). */
  overlay.querySelectorAll('[data-mod-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const v = btn.getAttribute('data-mod-tab');
      _modalState.ui.modActiveTab = v;
      _modalState.ui.modSexoOpenKey = null;
      overlay.querySelectorAll('[data-mod-tab]').forEach((t) => {
        t.classList.toggle('naowee-tab--selected', t === btn);
      });
      repaintModTable();
    });
  });

  /* Search "Buscar prueba" en vivo (DOM nuevo cada repaint, OK rebind).
     Toggle quirúrgico de la clase `--has-value` para mostrar/ocultar
     el botón clear sin re-renderizar todo el filter row (mantiene foco). */
  const searchInput = overlay.querySelector('[data-mod-search]');
  const searchWrap = overlay.querySelector('.ev-step4__search');
  searchInput?.addEventListener('input', () => {
    _modalState.ui.modSearch = searchInput.value;
    _modalState.ui.modSexoOpenKey = null;
    if (searchWrap) {
      searchWrap.classList.toggle('ev-step4__search--has-value', !!searchInput.value);
    }
    repaintModTable();
  });

  /* Clear button — limpia el search y hace foco al input para que el
     usuario pueda seguir tipeando sin tener que clickear de nuevo. */
  overlay.querySelector('[data-mod-search-clear]')?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!searchInput) return;
    searchInput.value = '';
    _modalState.ui.modSearch = '';
    if (searchWrap) searchWrap.classList.remove('ev-step4__search--has-value');
    searchInput.focus();
    repaintModTable();
  });

  /* Filtro de deporte (single-select dropdown — DOM nuevo cada repaint) */
  bindModDeporteFilter(overlay);

  /* ── Delegated handlers (overlay-level) — bind ONE-SHOT ──
     Los handlers escuchan en el overlay (que sobrevive el repaint),
     usan event delegation para captar clicks en elementos que se
     re-renderizan dentro de la tabla (que SÍ se renderiza nueva).
     Sin guard, cada repaint() agregaría duplicados al overlay. */
  if (overlay._evStep4DelegatedBound) return;
  overlay._evStep4DelegatedBound = true;

  /* Toggle de colapso de un grupo (sport header) */
  overlay.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-mod-collapse]');
    if (!btn) return;
    e.stopPropagation();
    const sport = btn.getAttribute('data-mod-collapse');
    _modalState.ui.modCollapsed[sport] = !_modalState.ui.modCollapsed[sport];
    _modalState.ui.modSexoOpenKey = null;
    repaintModTable();
  }, true);

  /* Checkbox de la celda → toggle enabled.
     Al ENABLE inicial (sin sexos previos), se setean ['Hombre','Mujer']
     por default — caso más común en el 90%+ de las pruebas (mixto se
     elige a mano cuando aplica). Si la celda ya tenía sexos guardados
     (re-enable después de un disable), se preservan en su lugar. */
  overlay.addEventListener('click', (e) => {
    const cb = e.target.closest('[data-mod-cell-toggle]');
    if (!cb) return;
    e.stopPropagation();
    e.preventDefault();
    const key = cb.getAttribute('data-mod-cell-toggle');
    const current = _modalState.data.modalidades[key];
    const next = !(current && current.enabled);
    if (next) {
      const priorSexos = (current && current.sexos && current.sexos.length)
        ? current.sexos
        : ['Hombre', 'Mujer'];
      _modalState.data.modalidades[key] = { enabled: true, sexos: priorSexos };
    } else {
      _modalState.data.modalidades[key] = { enabled: false, sexos: [] };
      if (_modalState.ui.modSexoOpenKey === key) _modalState.ui.modSexoOpenKey = null;
    }
    clearFieldError('modalidades');
    repaintModTable();
  });

  /* Trigger del sexo dropdown */
  overlay.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-mod-sexo-trigger]');
    if (!trigger) return;
    if (trigger.disabled) return;
    e.stopPropagation();
    const key = trigger.getAttribute('data-mod-sexo-trigger');
    _modalState.ui.modSexoOpenKey = (_modalState.ui.modSexoOpenKey === key) ? null : key;
    repaintModTable();
  });

  /* Opción del sexo dropdown — toggle multi-select */
  overlay.addEventListener('click', (e) => {
    const opt = e.target.closest('[data-mod-sexo-opt]');
    if (!opt) return;
    e.stopPropagation();
    e.preventDefault();
    const menu = opt.closest('[data-mod-sexo-menu]');
    if (!menu) return;
    const key = menu.getAttribute('data-mod-sexo-menu');
    const sexo = opt.getAttribute('data-mod-sexo-opt');
    const cell = _modalState.data.modalidades[key] || { enabled: true, sexos: [] };
    const idx = cell.sexos.indexOf(sexo);
    if (idx >= 0) cell.sexos.splice(idx, 1);
    else          cell.sexos.push(sexo);
    cell.enabled = true;
    _modalState.data.modalidades[key] = cell;
    clearFieldError('modalidades');
    repaintModTable();
  });

  /* Click outside del sexo menu cierra. Bind one-shot al document. */
  if (!document._evModSexoOutsideBound) {
    document._evModSexoOutsideBound = true;
    document.addEventListener('click', (e) => {
      if (!_modalState.el) return;
      if (_modalState.ui.modSexoOpenKey == null) return;
      if (e.target.closest('[data-mod-sexo-menu]')) return;
      if (e.target.closest('[data-mod-sexo-trigger]')) return;
      _modalState.ui.modSexoOpenKey = null;
      repaintModTable();
    });
  }
}

/* Single-select dropdown del filtro de deporte (paso 4). Mismo pattern
   que el delegaciones single-select pero filtrando solo entre los
   deportes que el usuario ya eligió en paso 2. */
function bindModDeporteFilter(overlay) {
  const dd = overlay.querySelector('[data-mod-deporte-dd]');
  if (!dd) return;
  const trigger = dd.querySelector('.naowee-dropdown__trigger');
  const menu = dd.querySelector('.naowee-dropdown__menu');
  const list = dd.querySelector('[data-mod-deporte-list]');
  const search = dd.querySelector('[data-mod-deporte-search]');

  const position = () => {
    if (!trigger || !menu) return;
    const r = trigger.getBoundingClientRect();
    menu.style.position = 'fixed';
    menu.style.top = `${r.bottom + 6}px`;
    menu.style.left = `${r.left}px`;
    menu.style.width = `${r.width}px`;
    menu.style.zIndex = '9999';
  };

  trigger?.addEventListener('click', (e) => {
    e.stopPropagation();
    const opening = !dd.classList.contains('naowee-dropdown--open');
    closeOtherFloatables(dd);
    dd.classList.toggle('naowee-dropdown--open');
    if (opening) {
      position();
      search?.focus();
    }
  });
  menu?.addEventListener('click', (e) => e.stopPropagation());

  search?.addEventListener('input', () => {
    if (list) {
      list.innerHTML = renderModDeporteOptions(
        _modalState.data.sports, _modalState.ui.modDeporteFilter, search.value
      );
    }
  });

  list?.addEventListener('click', (e) => {
    const opt = e.target.closest('.naowee-dropdown__option[data-mod-deporte]');
    if (!opt) return;
    e.stopPropagation();
    const val = opt.getAttribute('data-mod-deporte');
    _modalState.ui.modDeporteFilter = val;
    /* Repinta el trigger sin tocar el resto */
    const trg = dd.querySelector('.naowee-dropdown__trigger');
    if (trg) {
      const controls = trg.querySelector('.naowee-dropdown__controls');
      Array.from(trg.children).forEach((c) => { if (c !== controls) c.remove(); });
      trg.insertAdjacentHTML('afterbegin', `<span class="ev-dd-value">${escapeHtml(val)}</span>`);
    }
    dd.classList.remove('naowee-dropdown--open');
    repaintModTable();
  });

  document.addEventListener('click', () => {
    dd.classList.remove('naowee-dropdown--open');
  });
}

/* Cierra los demás dropdowns/datepickers floatables del overlay
   (excepto el que se está abriendo) — evita stacks de overlays. */
function closeOtherFloatables(except) {
  document.querySelectorAll('.naowee-datepicker--popover.naowee-datepicker--open')
    .forEach(p => p.classList.remove('naowee-datepicker--open'));
  document.querySelectorAll('.naowee-dropdown--open').forEach((d) => {
    if (d !== except) d.classList.remove('naowee-dropdown--open');
  });
}

/* Refresca el contenido del trigger del dropdown de categorías
   (placeholder ↔ tags) sin tocar el menu/options. */
function refreshCategoryTrigger(dropdown) {
  const trigger = dropdown.querySelector('.naowee-dropdown__trigger');
  if (!trigger) return;
  const controls = trigger.querySelector('.naowee-dropdown__controls');
  /* Quitar el contenido actual (placeholder o tags) — todo lo que NO sea
     el bloque de controls */
  Array.from(trigger.children).forEach((child) => {
    if (child !== controls) child.remove();
  });
  /* Insertar el nuevo contenido al inicio */
  trigger.insertAdjacentHTML('afterbegin', renderCategoryTriggerContent(_modalState.data.categories));
}

/* ─── Validación: clear surgical error de un campo ─────────────────── */
function clearFieldError(fieldName) {
  if (!_modalState.errors[fieldName]) return;
  delete _modalState.errors[fieldName];
  const overlay = _modalState.el;
  if (!overlay) return;
  const wrap = overlay.querySelector(`[data-field-wrap="${fieldName}"]`);
  if (wrap) {
    wrap.classList.remove('naowee-textfield--error');
    wrap.classList.remove('naowee-dropdown--error');
    const helper = wrap.querySelector('.naowee-helper--negative');
    if (helper) helper.remove();
  }
}

/* ─── Datepicker custom (DS-styled) ────────────────────────────────── */
function wireDatepicker(field, overlay) {
  if (field.dataset.evWired) return;
  field.dataset.evWired = '1';

  /* Locked: no instanciamos popup ni wire de click — el field está
     deshabilitado por dependencia con otro (ej: inscStart locked al
     startDate del evento). */
  if (field.classList.contains('ev-locked')) return;

  const input = field.querySelector('input');
  const wrap  = field.querySelector('.naowee-textfield__input-wrap');
  const fieldName = input.getAttribute('data-field');
  const rangeRole = field.dataset.range;        /* 'from' | 'to' | undefined */
  const rangeName = field.dataset.rangeName;    /* 'event' | 'inscriptions' */

  const initialIso = input.dataset.iso || '';
  let viewYear, viewMonth;
  let selected = null;
  if (initialIso) {
    const [yy, mm, dd] = initialIso.split('-').map(Number);
    selected = new Date(yy, mm - 1, dd);
    viewYear = yy; viewMonth = mm - 1;
  } else {
    const today = new Date();
    viewYear = today.getFullYear();
    viewMonth = today.getMonth();
  }

  /* Popup DS-oficial: naowee-datepicker--compact (266px / celdas 32×32)
     dentro de un wrapper --popover (position:fixed + elevación + open state).
     Se inyecta al body para escapar el overflow del modal__body. */
  const pop = document.createElement('div');
  pop.className = 'naowee-datepicker naowee-datepicker--compact naowee-datepicker--popover';
  document.body.appendChild(pop);

  /* Devuelve los límites min/max separados por origen:
       pairMin/pairMax → from/to del MISMO rangeName  (suaves)
       outerMin/outerMax → data-outer-min/max          (duros)
     Suaves: solo aplican como hard-disable cuando el role lo justifica
     (rangeRole='to' → pairMin sí). Duros: SIEMPRE deshabilitan días
     fuera del rango — sin importar el role. */
  function computeBounds() {
    const parseIso = (iso) => {
      if (!iso) return null;
      const [yy, mm, dd] = iso.split('-').map(Number);
      return new Date(yy, mm - 1, dd);
    };
    let pairMin = null, pairMax = null;
    if (rangeName) {
      if (rangeRole === 'to') {
        const fromField = overlay.querySelector(
          `[data-ev-datepicker][data-range="from"][data-range-name="${rangeName}"]`
        );
        const fromIso = fromField?.querySelector('input')?.dataset.iso;
        if (fromIso) pairMin = parseIso(fromIso);
      } else if (rangeRole === 'from') {
        const toField = overlay.querySelector(
          `[data-ev-datepicker][data-range="to"][data-range-name="${rangeName}"]`
        );
        const toIso = toField?.querySelector('input')?.dataset.iso;
        if (toIso) pairMax = parseIso(toIso);
      }
    }
    const outerMin = parseIso(field.dataset.outerMin);
    const outerMax = parseIso(field.dataset.outerMax);
    return { pairMin, pairMax, outerMin, outerMax };
  }

  function render() {
    /* Markup DS-oficial: __calendar > __header (month + nav controls) +
       __content (week de weekdays + N weeks de days). */
    pop.innerHTML = `
      <div class="naowee-datepicker__calendar">
        <div class="naowee-datepicker__header">
          <div class="naowee-datepicker__month-selector">
            <span class="naowee-datepicker__month">${MONTHS_LONG[viewMonth]} ${viewYear}</span>
          </div>
          <div class="naowee-datepicker__controls">
            <button class="naowee-datepicker__nav" data-nav="-1" type="button" aria-label="Mes anterior">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button class="naowee-datepicker__nav" data-nav="1" type="button" aria-label="Mes siguiente">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>
        <div class="naowee-datepicker__content">
          <div class="naowee-datepicker__week">
            ${WEEKDAYS.map(w => `<span class="naowee-datepicker__weekday">${w}</span>`).join('')}
          </div>
          <div data-weeks></div>
        </div>
      </div>
    `;
    const weeksWrap = pop.querySelector('[data-weeks]');
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const startWeekday = (firstOfMonth.getDay() + 6) % 7; /* lunes = 0 */
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrev = new Date(viewYear, viewMonth, 0).getDate();
    const today = new Date();
    const cells = [];
    for (let i = startWeekday - 1; i >= 0; i--) {
      cells.push({ day: daysInPrev - i, muted: true, d: new Date(viewYear, viewMonth - 1, daysInPrev - i) });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push({ day: i, muted: false, d: new Date(viewYear, viewMonth, i) });
    }
    while (cells.length % 7 !== 0) {
      const d = cells.length - (startWeekday + daysInMonth) + 1;
      cells.push({ day: d, muted: true, d: new Date(viewYear, viewMonth + 1, d) });
    }

    /* Bounds del rango (si aplica) — separados por origen */
    const { pairMin, pairMax, outerMin, outerMax } = computeBounds();

    /* Agrupar cells en weeks de 7 para el markup DS (__week > __day...) */
    const weeks = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

    weeks.forEach(week => {
      const weekEl = document.createElement('div');
      weekEl.className = 'naowee-datepicker__week';
      week.forEach(c => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'naowee-datepicker__day';
        if (c.muted) b.classList.add('naowee-datepicker__day--other-month');
        if (sameDay(c.d, today)) b.classList.add('naowee-datepicker__day--today');
        if (selected && sameDay(c.d, selected)) b.classList.add('naowee-datepicker__day--selected');

        /* Disable días fuera de rango:
           - pairMin solo aplica para role 'to' (existing behavior soft del 'from')
           - outerMin/outerMax aplican siempre (hard, vienen de fechas del evento) */
        const outOfRange = (
          (rangeRole === 'to' && pairMin && c.d < pairMin) ||
          (outerMin && c.d < outerMin) ||
          (outerMax && c.d > outerMax)
        );
        if (outOfRange) {
          b.classList.add('naowee-datepicker__day--disabled');
          b.disabled = true;
        }
        b.textContent = c.day;
        b.addEventListener('click', onDayClick.bind(null, c, outOfRange));
        weekEl.appendChild(b);
      });
      weeksWrap.appendChild(weekEl);
    });

    /* Handler factorizado para no duplicar lógica adentro del bucle */
    function onDayClick(c, outOfRange, e) {
      e.stopPropagation();
      if (outOfRange) return;
      selected = c.d;
      viewYear = c.d.getFullYear();
      viewMonth = c.d.getMonth();
      const iso = toIso(c.d);
      input.value = formatHumanFromIso(iso);
      input.dataset.iso = iso;
      setDataPath(fieldName, iso);   /* path-aware (paso 3 usa "phase.X.field") */
      pop.classList.remove('naowee-datepicker--open');
      clearFieldError(fieldName);

      /* Propagación startDate → inscStart (locked).
         La fecha de inicio de inscripciones está atada a la fecha de
         inicio del evento — cualquier cambio en startDate se replica
         quirúrgicamente al inscStart sin re-render. */
      if (fieldName === 'startDate') {
        _modalState.data.inscStart = iso;
        const inscStartWrap = overlay.querySelector('[data-field-wrap="inscStart"]');
        if (inscStartWrap) {
          const inscInput = inscStartWrap.querySelector('input');
          if (inscInput) {
            inscInput.value = formatHumanFromIso(iso);
            inscInput.dataset.iso = iso;
          }
        }
      }

      /* Si soy "from" y el "to" actual queda anterior, lo limpio
         con flash visual + helper temporal de aviso. */
      if (rangeRole === 'from' && rangeName) {
        const toField = overlay.querySelector(
          `[data-ev-datepicker][data-range="to"][data-range-name="${rangeName}"]`
        );
        const toInput = toField?.querySelector('input');
        const toIso = toInput?.dataset.iso;
        if (toIso) {
          const [ty, tm, td] = toIso.split('-').map(Number);
          const toDate = new Date(ty, tm - 1, td);
          if (toDate < c.d) {
            const toFieldName = toInput.getAttribute('data-field');
            toInput.value = '';
            toInput.dataset.iso = '';
            setDataPath(toFieldName, '');   /* path-aware */
            flashRangeWarning(toField,
              'Se limpió porque quedaba antes de la fecha de inicio.');
          }
        }
      }
    }

    pop.querySelectorAll('[data-nav]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const dir = +btn.dataset.nav;
        viewMonth += dir;
        if (viewMonth < 0)  { viewMonth = 11; viewYear--; }
        if (viewMonth > 11) { viewMonth = 0;  viewYear++; }
        render();
      });
    });
  }

  function positionPop() {
    const r = wrap.getBoundingClientRect();
    const desiredH = pop.offsetHeight || 320;
    const spaceBelow = window.innerHeight - r.bottom - 8;
    const openUp = spaceBelow < desiredH && r.top > desiredH;
    pop.style.left = `${r.left}px`;
    pop.style.width = `${Math.max(r.width, 260)}px`;
    pop.style.top = openUp ? `${r.top - 6 - desiredH}px` : `${r.bottom + 6}px`;
  }

  wrap.addEventListener('click', (e) => {
    e.stopPropagation();
    const wasOpen = pop.classList.contains('naowee-datepicker--open');
    /* Cerrar otros popups y dropdowns abiertos */
    document.querySelectorAll('.naowee-datepicker--popover.naowee-datepicker--open')
      .forEach(p => p.classList.remove('naowee-datepicker--open'));
    document.querySelectorAll('.naowee-dropdown--open')
      .forEach(d => d.classList.remove('naowee-dropdown--open'));
    if (!wasOpen) {
      if (selected) {
        viewYear = selected.getFullYear();
        viewMonth = selected.getMonth();
      }
      render();
      positionPop();
      pop.classList.add('naowee-datepicker--open');
    }
  });

  /* Re-position al scrollear/resize */
  const body = overlay.querySelector('.naowee-modal__body');
  body?.addEventListener('scroll', () => {
    if (pop.classList.contains('naowee-datepicker--open')) positionPop();
  }, true);
  window.addEventListener('resize', () => {
    if (pop.classList.contains('naowee-datepicker--open')) positionPop();
  });

  /* Click outside cierra */
  document.addEventListener('click', (ev) => {
    if (!field.contains(ev.target) && !pop.contains(ev.target)) {
      pop.classList.remove('naowee-datepicker--open');
    }
  });

  /* Cleanup centralizado: closeModal() recoge todos los .ev-dp del body
     cuando el modal se destruye. No necesitamos MutationObserver. */
}

/* Flash rojo + helper temporal cuando se limpia un "to" automáticamente
   por elegir un "from" posterior. Se autorrelee a los 2.8s. */
function flashRangeWarning(field, message) {
  if (!field) return;
  field.classList.add('ev-flash-error');
  const helper = field.querySelector('[data-range-helper]');
  if (helper) {
    helper.hidden = false;
    helper.textContent = message;
    helper.classList.add('ev-range-helper--warn');
  }
  setTimeout(() => {
    field.classList.remove('ev-flash-error');
    if (helper) {
      helper.hidden = true;
      helper.textContent = '';
      helper.classList.remove('ev-range-helper--warn');
    }
  }, 2800);
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function toIso(d) {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}
function formatHumanFromIso(iso) {
  if (!iso) return '';
  const [yy, mm, dd] = iso.split('-').map(Number);
  return `${String(dd).padStart(2,'0')} ${MONTHS_SHORT[mm-1]} ${yy}`;
}

/* ─── Iconos inline ────────────────────────────────────────────────── */
function closeIcon()      { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'; }
function closeIconSmall() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'; }
function checkIcon()      { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'; }
function calendarIcon() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>'; }
function lockIcon()     { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 1 1 8 0v4"/></svg>'; }
function chevronDown()  { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>'; }
function plusIcon()     { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>'; }
function minusIcon()    { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>'; }
function searchIcon()   { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>'; }
/* Badge del DS naowee-message--caution: círculo coloreado con "!" blanco
   adentro (mismo pattern que positive/negative del playground#message). */
function cautionBadgeIcon() { return '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M7 5h2v4H7z" fill="#fff"/><circle cx="8" cy="11" r="1" fill="#fff"/></svg>'; }
/* Info "i" — usado en checkbox "Cargue de documentos" del paso 3. */
function infoIcon() { return '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'; }

/* ─── Success Modal (post-create) ─────────────────────────────────
   Usa la receta `naowee-success-modal` del DS local
   (shared/components/success-modal.{js,css}). Acá solo armamos el
   payload con los datos del evento (nombre, conteo, vigencia) y los
   iconos del stats grid. Toda la mecánica de confetti + animación +
   dismiss vive en la receta — reusable para cualquier confirmación
   futura (escenario activado, programa creado, etc.). */
function showEventSuccessModal(snapshot) {
  const eventName = snapshot.name && snapshot.name.trim() ? snapshot.name : 'el evento';
  const inscEndHuman = snapshot.inscEnd ? formatHumanLong(snapshot.inscEnd) : '';
  const startHuman = snapshot.startDate ? formatHumanFromIso(snapshot.startDate) : '—';
  const endHuman   = snapshot.endDate   ? formatHumanFromIso(snapshot.endDate)   : '—';
  const vigencia = (snapshot.startDate && snapshot.endDate)
    ? `${startHuman} → ${endHuman}`
    : '—';
  const noteHtml = inscEndHuman
    ? `Se enviará un email de bienvenida y activación a todas las instituciones y delegados afiliados el día ${escapeHtml(inscEndHuman)}.`
    : '';

  openSuccessModal({
    title: '¡Evento creado exitosamente!',
    body:  `El evento <strong>${escapeHtml(eventName)}</strong> ha sido creado en la plataforma.`,
    note:  noteHtml,
    stats: [
      { variant: 'accent',      icon: trophyIcon(),   label: 'Deportes', value: String(snapshot.sports || 0) },
      { variant: 'informative', icon: layersIcon(),   label: 'Fases',    value: String(snapshot.phases || 0) },
      { variant: 'positive',    icon: calendarIcon(), label: 'Vigencia', value: vigencia }
    ],
    secondary: {
      label: 'Crear otro',
      onClick: () => setTimeout(() => openCreateEventModal(), 220)
    },
    primary: {
      label: 'Ver evento',
      icon:  chevronRightIcon()
      /* onClick: navegar al detalle cuando exista la pantalla. */
    },
    confetti: true
  });
}

/* Date helper: "30 de abril de 2026" para el subtítulo de notice */
function formatHumanLong(iso) {
  if (!iso) return '';
  const [yy, mm, dd] = iso.split('-').map(Number);
  return `${dd} de ${MONTHS_LONG[mm - 1]} de ${yy}`;
}

/* Iconos para los stats del success modal (consumidos por la receta) */
function trophyIcon() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4a2 2 0 0 1-2-2V5h4"/><path d="M18 9h2a2 2 0 0 0 2-2V5h-4"/><path d="M6 5h12v6a6 6 0 0 1-12 0V5z"/><path d="M9 19h6"/><path d="M12 15v4"/></svg>';
}
function layersIcon() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>';
}
function chevronRightIcon() {
  return '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"/></svg>';
}

/* ─── Path-aware state access ──────────────────────────────────────
   Soporta paths "a.b.c" o "phase.0.name" → resuelve nested + array
   indices. Usado por los handlers genéricos de input/datepicker para
   poder escribir en data.phases[i].field sin lógica especial. */
function setDataPath(path, value) {
  const parts = path.split('.');
  let obj = _modalState.data;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    obj = /^\d+$/.test(key) ? obj[+key] : obj[key];
  }
  const last = parts[parts.length - 1];
  if (/^\d+$/.test(last)) obj[+last] = value;
  else obj[last] = value;
}

function getDataPath(path) {
  const parts = path.split('.');
  let obj = _modalState.data;
  for (const key of parts) {
    if (obj == null) return undefined;
    obj = /^\d+$/.test(key) ? obj[+key] : obj[key];
  }
  return obj;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}
