/**
 * Detalle / Perfil del escenario — vista unificada para los 3 estados:
 *   - activo: hero con galería de fotos + CTA "Solicitud de actualización"
 *   - revision: banner amarillo "En revisión" + tabs read-only
 *   - rechazado: banner rojo + nota del revisor + tabs read-only
 *
 * Replica de:
 *   https://naowee-tech.github.io/naowee-test-escenarios/escenario-10-perfil-activo.html
 *   https://naowee-tech.github.io/naowee-test-escenarios/escenario-09-detalle-revision.html
 *
 * El estado borrador NO usa esta vista — se abre el modal sede-create
 * en modo edición con los datos prellenados (handled en sedes-list.js).
 */
import { openCreateSedeModal } from './sede-create-modal.js';

/* Mock fields completos por sede — en producción vendrían del backend.
   Usamos el index de la fila como key. */
const SEDE_DETAILS = {
  /* Mapped por code (ID único de la sede) → datos completos */
  '1000020202': {  /* Centro deportivo Miramar — En revisión */
    nombre: 'Centro deportivo Miramar',
    departamento: 'Atlántico',
    municipio: 'Barranquilla',
    catastral: '080010101000000010901900000012',
    lat: '11.0035',
    lon: '-74.8147',
    direccion: 'Cl. 84 #43-15, Riomar',
    corregimiento: 'Riomar',
    zona: 'Urbana',
    entidad: 'Alcaldía de Barranquilla',
    propietario: 'Pública',
    administradora: 'IDRD Atlántico',
    tenencia: 'Propiedad propia',
    responsable: 'Carlos Pérez Mendoza',
    telefono: '3001234567',
    correo: 'carlos.perez@barranquilla.gov.co',
    tipoEscenario: 'Complejo deportivo',
    car: false,
    enviadoEl: 'Abr. 24, 2026'
  },
  '1000040404': {  /* Centro deportivo Sur — Rechazado */
    nombre: 'Centro deportivo Sur',
    departamento: 'Antioquia',
    municipio: 'Itagüí',
    catastral: '050010504000000020701800000045',
    lat: '6.1726',
    lon: '-75.6116',
    direccion: 'Cra. 50 #35-22, Centro',
    corregimiento: 'Centro',
    zona: 'Urbana',
    entidad: 'Alcaldía de Itagüí',
    propietario: 'Pública',
    administradora: 'INDER Itagüí',
    tenencia: 'Propiedad propia',
    responsable: 'María Gómez Ríos',
    telefono: '3007654321',
    correo: 'maria.gomez@itagui.gov.co',
    tipoEscenario: 'Cancha múltiple',
    car: false,
    enviadoEl: 'Abr. 14, 2026',
    notaRechazo: 'La documentación adjunta no cumple con los requisitos. El acta de recepción debe estar firmada por el representante legal de la entidad. Por favor adjuntar el documento corregido y reenviar para revisión.'
  },
  '1000030303': {  /* Centro deportivo Norte — Activo */
    nombre: 'Centro deportivo Norte',
    departamento: 'Antioquia',
    municipio: 'Medellín',
    catastral: '050010101000000005401200000089',
    lat: '6.2671',
    lon: '-75.5687',
    direccion: 'Cl. 45 #80-32, Belén',
    corregimiento: 'Belén',
    zona: 'Urbana',
    entidad: 'INDER Medellín',
    propietario: 'Pública',
    administradora: 'INDER Medellín',
    tenencia: 'Propiedad propia',
    responsable: 'Luis Restrepo Ortiz',
    telefono: '3009876543',
    correo: 'luis.restrepo@inder.gov.co',
    tipoEscenario: 'Complejo deportivo',
    car: true,
    activadoEl: 'Abr. 09, 2026'
  },
  '1000050505': {  /* Polideportivo La Floresta — Activo */
    nombre: 'Polideportivo La Floresta',
    departamento: 'Antioquia',
    municipio: 'Medellín',
    catastral: '050010505000000003201100000012',
    lat: '6.2566',
    lon: '-75.6017',
    direccion: 'Cra. 80 #36-15, La Floresta',
    corregimiento: 'La Floresta',
    zona: 'Urbana',
    entidad: 'INDER Medellín',
    propietario: 'Pública',
    administradora: 'INDER Medellín',
    tenencia: 'Propiedad propia',
    responsable: 'Andrea Vargas López',
    telefono: '3001112233',
    correo: 'andrea.vargas@inder.gov.co',
    tipoEscenario: 'Coliseo',
    car: false,
    activadoEl: 'Abr. 02, 2026'
  },
  '1000060606': {  /* Coliseo Iván de Bedout — Activo */
    nombre: 'Coliseo Iván de Bedout',
    departamento: 'Antioquia',
    municipio: 'Medellín',
    catastral: '050010606000000004801500000067',
    lat: '6.2487',
    lon: '-75.5775',
    direccion: 'Cl. 48 #73-25, Estadio',
    corregimiento: 'Estadio',
    zona: 'Urbana',
    entidad: 'INDER Medellín',
    propietario: 'Pública',
    administradora: 'INDER Medellín',
    tenencia: 'Propiedad propia',
    responsable: 'José Hernández Cárdenas',
    telefono: '3004445566',
    correo: 'jose.hernandez@inder.gov.co',
    tipoEscenario: 'Coliseo',
    car: true,
    activadoEl: 'Mar. 28, 2026'
  },
  '1000070707': {  /* Estadio Atanasio Girardot — En revisión */
    nombre: 'Estadio Atanasio Girardot',
    departamento: 'Antioquia',
    municipio: 'Medellín',
    catastral: '050010707000000005301600000034',
    lat: '6.2569',
    lon: '-75.5904',
    direccion: 'Cra. 74 #48-1, Estadio',
    corregimiento: 'Estadio',
    zona: 'Urbana',
    entidad: 'INDER Medellín',
    propietario: 'Pública',
    administradora: 'INDER Medellín',
    tenencia: 'Propiedad propia',
    responsable: 'Patricia Ríos Mejía',
    telefono: '3007778899',
    correo: 'patricia.rios@inder.gov.co',
    tipoEscenario: 'Estadio',
    car: true,
    enviadoEl: 'Mar. 22, 2026'
  }
};

/* Galería de fotos por tipo de escenario (Unsplash) */
const GALLERY_PHOTOS = [
  '1577223625816-7546f13df25d',
  '1540747913346-19e32dc3e97e',
  '1574629810360-7efbbe195018',
  '1546519638-68e109498ffc',
  '1459865264687-595d652de67e',
  '1431324155629-1a6deb1dec8d',
  '1551958219-acbc608c6377',
  '1517649763962-0c623066013b'
];

const _state = {
  rootEl: null,
  sedeCode: null,
  sedeStatus: null,
  galleryIdx: 0
};

/**
 * @param {HTMLElement} pageEl
 * @param {Object} opts { code, status }
 */
export function renderSedeDetailPage(pageEl, opts = {}) {
  pageEl.classList.remove('um-page');
  pageEl.classList.remove('me-page');
  pageEl.classList.add('sd-page');
  _state.rootEl = pageEl;
  _state.sedeCode = opts.code;
  _state.sedeStatus = opts.status || 'activo';
  _state.galleryIdx = 0;
  pageEl.innerHTML = renderShell();
  bindEvents(pageEl);
}

function getSede() {
  const data = SEDE_DETAILS[_state.sedeCode];
  if (!data) {
    /* Fallback default — sede no encontrada */
    return {
      nombre: 'Sede no encontrada',
      departamento: '—', municipio: '—', catastral: '—',
      lat: '—', lon: '—', direccion: '—', corregimiento: '—', zona: '—',
      entidad: '—', propietario: '—', administradora: '—', tenencia: '—',
      responsable: '—', telefono: '—', correo: '—',
      tipoEscenario: '—', car: false
    };
  }
  return data;
}

function renderShell() {
  const sede = getSede();
  const status = _state.sedeStatus;
  return `
    <div class="sd-detail">
      <!-- Back link -->
      <button type="button" class="sd-detail__back" data-back>
        ${arrowLeftIcon()}
        Regresar a la lista
      </button>

      ${status === 'activo'
        ? renderActiveHero(sede)
        : renderStatusBanner(sede, status)}

      <!-- Card unificada con tabs + content -->
      <div class="sd-detail__card">
        <!-- Tabs DS simple (mismo pattern del playground) -->
        <div class="naowee-tabs naowee-tabs--proportional sd-detail__tabs">
          <button type="button" class="naowee-tab naowee-tab--selected" data-tab="general">Información general</button>
          <button type="button" class="naowee-tab" data-tab="docs">Documentación</button>
          <button type="button" class="naowee-tab" data-tab="historial">Historial</button>
        </div>

        ${status === 'rechazado' ? renderRejectionNote(sede) : ''}

        <!-- Tab: Información general -->
        <div class="sd-detail__panel" data-tab-content="general">
          ${renderGeneralPanel(sede)}
        </div>

        <!-- Tab: Documentación -->
        <div class="sd-detail__panel" data-tab-content="docs" hidden>
          ${renderDocsPanel(sede)}
        </div>

        <!-- Tab: Historial -->
        <div class="sd-detail__panel" data-tab-content="historial" hidden>
          ${renderHistorialPanel(sede, status)}
        </div>
      </div>
    </div>
  `;
}

/* ─── Hero card (only para activo) ─────────────────────────────── */
function renderActiveHero(sede) {
  return `
    <div class="sd-detail__hero">
      <div class="sd-detail__hero-head">
        <div class="sd-detail__hero-info">
          <h1 class="sd-detail__hero-title">
            ${escapeHtml(sede.nombre)}
            ${sede.car ? `
              <span class="sd-detail__car-badge">
                <span class="sd-detail__car-star">★</span>
                Escenario CAR
              </span>
            ` : ''}
          </h1>
          <p class="sd-detail__hero-id">ID único: <strong>${_state.sedeCode}</strong></p>
        </div>
        <button type="button" class="naowee-btn naowee-btn--loud naowee-btn--large sd-detail__hero-cta">
          ${editIcon()}
          Solicitud de actualización de datos
        </button>
      </div>

      <!-- Photo gallery -->
      <div class="sd-detail__gallery">
        <div class="sd-detail__gallery-track" id="sdGalleryTrack">
          ${GALLERY_PHOTOS.map((id, i) => `
            <div class="sd-detail__gallery-item">
              <img src="https://images.unsplash.com/photo-${id}?w=600&h=320&fit=crop&q=80" alt="Foto ${i + 1}" />
            </div>
          `).join('')}
        </div>
        <button type="button" class="sd-detail__gallery-nav sd-detail__gallery-nav--prev" data-gallery="prev" aria-label="Anterior">
          ${chevronLeft()}
        </button>
        <button type="button" class="sd-detail__gallery-nav sd-detail__gallery-nav--next" data-gallery="next" aria-label="Siguiente">
          ${chevronRight()}
        </button>
        <div class="sd-detail__gallery-dots">
          ${GALLERY_PHOTOS.map((_, i) => `
            <button type="button" class="sd-detail__gallery-dot ${i === 0 ? 'sd-detail__gallery-dot--active' : ''}" data-gallery-dot="${i}"></button>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

/* ─── Status banner (revision/rechazado) ──────────────────────── */
function renderStatusBanner(sede, status) {
  const isRevision = status === 'revision';
  const isRechazado = status === 'rechazado';
  return `
    <div class="sd-detail__hero-simple">
      <div class="sd-detail__hero-info">
        <h1 class="sd-detail__hero-title">
          ${escapeHtml(sede.nombre)}
          ${sede.car ? `
            <span class="sd-detail__car-badge">
              <span class="sd-detail__car-star">★</span>
              Escenario CAR
            </span>
          ` : ''}
        </h1>
        <p class="sd-detail__hero-id">ID único: <strong>${_state.sedeCode}</strong></p>
      </div>
      <div class="sd-detail__status-banner ${isRevision ? 'sd-detail__status-banner--revision' : 'sd-detail__status-banner--rechazado'}">
        <div class="sd-detail__status-banner-icon">
          ${isRevision ? clockIcon() : alertIcon()}
        </div>
        <div class="sd-detail__status-banner-text">
          <div class="sd-detail__status-banner-title">
            ${isRevision ? 'Registro en revisión' : 'Registro rechazado'}
          </div>
          <div class="sd-detail__status-banner-sub">
            ${isRevision
              ? `Enviado el ${sede.enviadoEl || '—'}. Pendiente de validación por el revisor.`
              : `Reenviado el ${sede.enviadoEl || '—'}. Corrige las observaciones y reenvía.`}
          </div>
        </div>
      </div>
    </div>
  `;
}

/* ─── Rejection note (solo rechazado) ─────────────────────────── */
function renderRejectionNote(sede) {
  return `
    <div class="sd-detail__rejection">
      <div class="sd-detail__rejection-icon">${alertIcon()}</div>
      <div class="sd-detail__rejection-body">
        <div class="sd-detail__rejection-title">Observación del revisor</div>
        <p class="sd-detail__rejection-text">${escapeHtml(sede.notaRechazo || 'Sin observaciones específicas.')}</p>
        <button type="button" class="naowee-btn naowee-btn--loud naowee-btn--medium sd-detail__rejection-cta" data-edit-rejected>
          ${editIcon()}
          Corregir y reenviar
        </button>
      </div>
    </div>
  `;
}

/* ─── Tab: Información general ─────────────────────────────── */
function renderGeneralPanel(sede) {
  return `
    <!-- Datos de pre-validación -->
    <section class="sd-detail__section">
      <h3 class="sd-detail__section-title">Datos de pre-validación</h3>
      <div class="sd-detail__ro-grid">
        ${roField('Nombre del escenario', sede.nombre, true)}
        ${roField('Departamento', sede.departamento)}
        ${roField('Municipio', sede.municipio)}
        ${roField('Número de registro catastral', sede.catastral, true)}
        ${roField('Latitud', sede.lat)}
        ${roField('Longitud', sede.lon)}
        ${roField('Dirección', sede.direccion, true)}
        ${roField('Corregimiento', sede.corregimiento)}
        ${roField('Zona', sede.zona)}
      </div>
    </section>

    <!-- Datos de propiedad -->
    <section class="sd-detail__section">
      <h3 class="sd-detail__section-title">Datos de propiedad</h3>
      <div class="sd-detail__ro-grid">
        ${roField('Entidad propietaria', sede.entidad)}
        ${roField('Tipo de propietario', sede.propietario)}
        ${roField('Entidad administradora', sede.administradora)}
        ${roField('Tipo de tenencia', sede.tenencia)}
        ${roField('Responsable', sede.responsable, true)}
        ${roField('Teléfono', sede.telefono)}
        ${roField('Correo electrónico', sede.correo)}
      </div>
    </section>

    <!-- Datos deportivos -->
    <section class="sd-detail__section">
      <h3 class="sd-detail__section-title">Datos deportivos</h3>
      <div class="sd-detail__ro-grid">
        ${roField('Tipo de escenario', sede.tipoEscenario)}
        ${roField('Centro de Alto Rendimiento', sede.car ? 'Sí' : 'No')}
      </div>
    </section>
  `;
}

function roField(label, value, full = false) {
  return `
    <div class="sd-detail__ro-field ${full ? 'sd-detail__ro-field--full' : ''}">
      <span class="sd-detail__ro-label">${escapeHtml(label)}</span>
      <span class="sd-detail__ro-value">${escapeHtml(value)}</span>
    </div>
  `;
}

/* ─── Tab: Documentación ────────────────────────────────── */
function renderDocsPanel(sede) {
  const docs = [
    { name: 'Acta de recepción', estado: 'Aprobado', fecha: 'Mar. 15, 2026' },
    { name: 'Certificado catastral', estado: 'Aprobado', fecha: 'Mar. 18, 2026' },
    { name: 'Planos arquitectónicos', estado: 'Aprobado', fecha: 'Mar. 20, 2026' },
    { name: 'Licencia de construcción', estado: 'Aprobado', fecha: 'Mar. 22, 2026' },
    { name: 'Estudio de impacto', estado: 'Aprobado', fecha: 'Mar. 24, 2026' }
  ];
  return `
    <div class="sd-detail__docs">
      <div class="sd-detail__docs-header">
        <h3 class="sd-detail__section-title">Documentos cargados</h3>
        <span class="sd-detail__docs-count">${docs.length} documentos</span>
      </div>
      <table class="sd-detail__doc-table">
        <thead>
          <tr>
            <th>Documento</th>
            <th>Estado</th>
            <th>Fecha de cargue</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${docs.map(doc => `
            <tr>
              <td>
                <div class="sd-detail__doc-name">
                  ${docIcon()}
                  ${escapeHtml(doc.name)}
                </div>
              </td>
              <td>
                <span class="naowee-badge naowee-badge--quiet naowee-badge--positive">
                  ${doc.estado}
                </span>
              </td>
              <td>${doc.fecha}</td>
              <td class="sd-detail__doc-actions">
                <button type="button" class="naowee-btn naowee-btn--mute naowee-btn--icon naowee-btn--small" aria-label="Descargar">
                  ${downloadIcon()}
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

/* ─── Tab: Historial ────────────────────────────────────── */
function renderHistorialPanel(sede, status) {
  const events = [];
  if (status === 'activo') {
    events.push(
      { date: sede.activadoEl || 'Abr. 09, 2026', text: 'Escenario activado en el sistema', variant: 'positive' },
      { date: 'Mar. 26, 2026', text: 'Documentación aprobada por el revisor', variant: 'positive' },
      { date: 'Mar. 22, 2026', text: 'Registro enviado a revisión', variant: 'neutral' },
      { date: 'Mar. 18, 2026', text: 'Documentación cargada', variant: 'neutral' },
      { date: 'Mar. 15, 2026', text: 'Pre-validación completada', variant: 'neutral' }
    );
  } else if (status === 'revision') {
    events.push(
      { date: sede.enviadoEl || 'Abr. 24, 2026', text: 'Registro enviado a revisión — pendiente', variant: 'caution' },
      { date: 'Abr. 22, 2026', text: 'Documentación cargada', variant: 'neutral' },
      { date: 'Abr. 20, 2026', text: 'Pre-validación completada', variant: 'neutral' }
    );
  } else if (status === 'rechazado') {
    events.push(
      { date: sede.enviadoEl || 'Abr. 14, 2026', text: 'Registro rechazado por el revisor', variant: 'negative' },
      { date: 'Abr. 12, 2026', text: 'Registro enviado a revisión', variant: 'neutral' },
      { date: 'Abr. 10, 2026', text: 'Documentación cargada', variant: 'neutral' },
      { date: 'Abr. 08, 2026', text: 'Pre-validación completada', variant: 'neutral' }
    );
  }
  return `
    <ul class="sd-detail__timeline">
      ${events.map(e => `
        <li class="sd-detail__tl-item">
          <span class="sd-detail__tl-dot sd-detail__tl-dot--${e.variant}"></span>
          <div>
            <div class="sd-detail__tl-date">${e.date}</div>
            <div class="sd-detail__tl-text">${escapeHtml(e.text)}</div>
          </div>
        </li>
      `).join('')}
    </ul>
  `;
}

/* ─── Events ─────────────────────────────────────────────── */
function bindEvents(pageEl) {
  /* Back link → vuelve al listado */
  pageEl.querySelector('[data-back]')?.addEventListener('click', () => {
    window.location.search = '?role=ROOT&active=sedes-lista';
  });

  /* Tabs DS simple */
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

  /* Galería navegación (solo en activo) */
  pageEl.querySelectorAll('[data-gallery]').forEach(btn => {
    btn.addEventListener('click', () => {
      const dir = btn.getAttribute('data-gallery');
      const total = GALLERY_PHOTOS.length;
      _state.galleryIdx = dir === 'next'
        ? (_state.galleryIdx + 1) % total
        : (_state.galleryIdx - 1 + total) % total;
      updateGallery(pageEl);
    });
  });
  pageEl.querySelectorAll('[data-gallery-dot]').forEach(dot => {
    dot.addEventListener('click', () => {
      _state.galleryIdx = parseInt(dot.getAttribute('data-gallery-dot'), 10);
      updateGallery(pageEl);
    });
  });

  /* "Corregir y reenviar" → abre modal con datos actuales */
  pageEl.querySelector('[data-edit-rejected]')?.addEventListener('click', () => {
    openCreateSedeModal();
  });
}

function updateGallery(pageEl) {
  const track = pageEl.querySelector('#sdGalleryTrack');
  if (track) {
    track.style.transform = `translateX(-${_state.galleryIdx * 100}%)`;
  }
  pageEl.querySelectorAll('[data-gallery-dot]').forEach((dot, i) => {
    dot.classList.toggle('sd-detail__gallery-dot--active', i === _state.galleryIdx);
  });
}

/* ─── Helpers ────────────────────────────────────────────── */
function escapeHtml(str) {
  return String(str ?? '—')
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

function arrowLeftIcon() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7M19 12H5"/></svg>'; }
function chevronLeft()   { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>'; }
function chevronRight()  { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>'; }
function clockIcon()     { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'; }
function alertIcon()     { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'; }
function editIcon()      { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>'; }
function docIcon()       { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>'; }
function downloadIcon()  { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'; }
