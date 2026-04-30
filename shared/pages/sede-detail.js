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
  /* returnTo: ruta a la que vuelve el botón "Regresar a la lista".
     Por default es 'sedes-lista' (admin); el revisor pasa 'docs' para
     volver al dashboard de revisión. */
  returnTo: 'sedes-lista',
  galleryIdx: 0
};

/**
 * @param {HTMLElement} pageEl
 * @param {Object} opts { code, status, returnTo }
 */
export function renderSedeDetailPage(pageEl, opts = {}) {
  pageEl.classList.remove('um-page');
  pageEl.classList.remove('me-page');
  pageEl.classList.add('sd-page');
  _state.rootEl = pageEl;
  _state.sedeCode = opts.code;
  _state.sedeStatus = opts.status || 'activo';
  _state.returnTo = opts.returnTo || 'sedes-lista';
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

      <!-- Photo gallery: strip de thumbnails (6 visibles a la vez).
           Click en cualquier thumb abre el lightbox modal con prev/next. -->
      <div class="sd-detail__gallery">
        <div class="sd-detail__gallery-track" id="sdGalleryTrack">
          ${GALLERY_PHOTOS.map((id, i) => `
            <button type="button" class="sd-detail__gallery-thumb" data-photo-idx="${i}" aria-label="Ver foto ${i + 1}">
              <img src="https://images.unsplash.com/photo-${id}?w=400&h=300&fit=crop&q=80" alt="Foto ${i + 1}" loading="lazy" />
            </button>
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
            <button type="button" class="sd-detail__gallery-dot ${i === 0 ? 'sd-detail__gallery-dot--active' : ''}" data-gallery-dot="${i}" aria-label="Ir a página ${i + 1}"></button>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

/* ─── Lightbox modal (full-screen photo viewer) ──────────────── */
function openLightbox(startIdx = 0) {
  /* Si ya hay un lightbox abierto, lo removemos primero */
  closeLightbox();
  const overlay = document.createElement('div');
  overlay.className = 'sd-lightbox';
  overlay.innerHTML = renderLightbox(startIdx);
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';
  bindLightboxEvents(overlay);
  /* Animación de entrada */
  requestAnimationFrame(() => overlay.classList.add('sd-lightbox--open'));
}

function closeLightbox() {
  const overlay = document.querySelector('.sd-lightbox');
  if (!overlay) return;
  overlay.classList.remove('sd-lightbox--open');
  setTimeout(() => {
    overlay.remove();
    document.body.style.overflow = '';
  }, 200);
}

function renderLightbox(idx) {
  const photoId = GALLERY_PHOTOS[idx];
  return `
    <button type="button" class="sd-lightbox__close" data-lb-close aria-label="Cerrar">
      ${closeIcon()}
    </button>
    <button type="button" class="sd-lightbox__nav sd-lightbox__nav--prev" data-lb-nav="prev" aria-label="Anterior">
      ${chevronLeft()}
    </button>
    <div class="sd-lightbox__main">
      <img class="sd-lightbox__img" data-lb-img
           src="https://images.unsplash.com/photo-${photoId}?w=1600&h=1000&fit=crop&q=85"
           alt="Foto ${idx + 1}" />
    </div>
    <button type="button" class="sd-lightbox__nav sd-lightbox__nav--next" data-lb-nav="next" aria-label="Siguiente">
      ${chevronRight()}
    </button>
    <div class="sd-lightbox__strip" data-lb-strip>
      ${GALLERY_PHOTOS.map((id, i) => `
        <button type="button" class="sd-lightbox__strip-thumb ${i === idx ? 'sd-lightbox__strip-thumb--active' : ''}" data-lb-thumb="${i}">
          <img src="https://images.unsplash.com/photo-${id}?w=200&h=140&fit=crop&q=80" alt="" />
        </button>
      `).join('')}
    </div>
    <div class="sd-lightbox__counter" data-lb-counter>${idx + 1} / ${GALLERY_PHOTOS.length}</div>
  `;
}

function bindLightboxEvents(overlay) {
  let currentIdx = parseInt(
    overlay.querySelector('[data-lb-thumb].sd-lightbox__strip-thumb--active')?.getAttribute('data-lb-thumb') || '0',
    10
  );

  const updateLightbox = (idx) => {
    currentIdx = (idx + GALLERY_PHOTOS.length) % GALLERY_PHOTOS.length;
    const photoId = GALLERY_PHOTOS[currentIdx];
    const img = overlay.querySelector('[data-lb-img]');
    if (img) img.src = `https://images.unsplash.com/photo-${photoId}?w=1600&h=1000&fit=crop&q=85`;
    overlay.querySelectorAll('[data-lb-thumb]').forEach(t => {
      const isActive = parseInt(t.getAttribute('data-lb-thumb'), 10) === currentIdx;
      t.classList.toggle('sd-lightbox__strip-thumb--active', isActive);
      if (isActive) t.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    });
    const counter = overlay.querySelector('[data-lb-counter]');
    if (counter) counter.textContent = `${currentIdx + 1} / ${GALLERY_PHOTOS.length}`;
  };

  /* Close: click en backdrop, X button, o ESC */
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeLightbox();
  });
  overlay.querySelector('[data-lb-close]')?.addEventListener('click', closeLightbox);

  /* Prev/next nav */
  overlay.querySelectorAll('[data-lb-nav]').forEach(btn => {
    btn.addEventListener('click', () => {
      const dir = btn.getAttribute('data-lb-nav');
      updateLightbox(currentIdx + (dir === 'next' ? 1 : -1));
    });
  });

  /* Click en thumbnail strip → ir a esa foto */
  overlay.querySelectorAll('[data-lb-thumb]').forEach(thumb => {
    thumb.addEventListener('click', () => {
      const idx = parseInt(thumb.getAttribute('data-lb-thumb'), 10);
      updateLightbox(idx);
    });
  });

  /* Keyboard nav: ESC, ←/→ */
  if (!document._sdLightboxKeyBound) {
    document._sdLightboxKeyBound = true;
    document.addEventListener('keydown', (e) => {
      const open = document.querySelector('.sd-lightbox');
      if (!open) return;
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        /* Re-bind nav handlers — no podemos reusar updateLightbox del closure
           anterior, así que disparamos los buttons de nav. */
        const dir = e.key === 'ArrowRight' ? 'next' : 'prev';
        open.querySelector(`[data-lb-nav="${dir}"]`)?.click();
      }
    });
  }
}

/* ─── Status banner (revision/rechazado) — usa DS naowee-message ──
   Layout pattern del reference: hero-card con title+ID arriba,
   message banner full-width abajo. */
function renderStatusBanner(sede, status) {
  const isRevision = status === 'revision';
  const messageVariant = isRevision ? 'caution' : 'negative';
  const title = isRevision ? 'Registro en revisión' : 'Registro rechazado';
  const text = isRevision
    ? `Enviado el ${sede.enviadoEl || '—'}. Pendiente de validación por el revisor.`
    : `Reenviado el ${sede.enviadoEl || '—'}. Corrige las observaciones y reenvía.`;
  return `
    <div class="sd-detail__hero-card">
      <div class="sd-detail__hero-row">
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
      </div>

      <!-- DS naowee-message --caution / --negative -->
      <div class="naowee-message naowee-message--${messageVariant} sd-detail__msg">
        <div class="naowee-message__header">
          <div class="naowee-message__icon">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="8" y1="4" x2="8" y2="8"/>
              <line x1="8" y1="11" x2="8" y2="11.01"/>
            </svg>
          </div>
          <div class="naowee-message__title">${title}</div>
        </div>
        <p class="naowee-message__text">${text}</p>
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

/* ─── Tab: Documentación ──────────────────────────────────
   Layout 2-col del reference escenario-09: tabla a la izquierda,
   preview del documento a la derecha con toolbar (zoom +/-, download). */

/* Mock docs por status. Cuando es activo todos están aprobados;
   en revision/rechazado algunos están en revisión y otros no
   cargados (faltan por subir).
   Cada doc tiene type (jpg/pdf) que controla el icono y el preview. */
function getDocsForSede(status) {
  const allActivo = [
    { name: 'Foto frontal general',  type: 'jpg', estado: 'Aprobado',  fecha: '17 de abr de 2026', preview: '1577223625816-7546f13df25d' },
    { name: 'Foto panoramica',       type: 'jpg', estado: 'Aprobado',  fecha: '17 de abr de 2026', preview: '1540747913346-19e32dc3e97e' },
    { name: 'Fotos instalaciones',   type: 'jpg', estado: 'Aprobado',  fecha: '18 de abr de 2026', preview: '1574629810360-7efbbe195018' },
    { name: 'Plano del escenario',   type: 'pdf', estado: 'Aprobado',  fecha: '18 de abr de 2026', preview: null },
    { name: 'Plano de localizacion', type: 'pdf', estado: 'Aprobado',  fecha: '18 de abr de 2026', preview: null },
    { name: 'Documento de propiedad',type: 'pdf', estado: 'Aprobado',  fecha: '18 de abr de 2026', preview: null },
    { name: 'Concepto bomberos',     type: 'pdf', estado: 'Aprobado',  fecha: '18 de abr de 2026', preview: null },
    { name: 'Concepto salud',        type: 'pdf', estado: 'Aprobado',  fecha: '18 de abr de 2026', preview: null }
  ];
  if (status === 'activo') return allActivo;
  /* Revision/Rechazado: algunos en revisión, otros faltan por subir */
  return [
    { name: 'Foto frontal general',  type: 'jpg', estado: 'En revisión', fecha: '17 de abr de 2026', preview: '1577223625816-7546f13df25d' },
    { name: 'Foto panoramica',       type: 'jpg', estado: 'En revisión', fecha: '17 de abr de 2026', preview: '1540747913346-19e32dc3e97e' },
    { name: 'Fotos instalaciones',   type: 'jpg', estado: 'No cargado',  fecha: null,                preview: null },
    { name: 'Plano del escenario',   type: 'pdf', estado: 'En revisión', fecha: '18 de abr de 2026', preview: null },
    { name: 'Plano de localizacion', type: 'pdf', estado: 'No cargado',  fecha: null,                preview: null },
    { name: 'Documento de propiedad',type: 'pdf', estado: 'En revisión', fecha: '18 de abr de 2026', preview: null },
    { name: 'Concepto bomberos',     type: 'pdf', estado: 'No cargado',  fecha: null,                preview: null },
    { name: 'Concepto salud',        type: 'pdf', estado: 'No cargado',  fecha: null,                preview: null }
  ];
}

function renderDocsPanel(sede) {
  const docs = getDocsForSede(_state.sedeStatus);
  /* Default selection: el primer doc que tenga preview (si hay), sino el primero */
  const defaultIdx = docs.findIndex(d => d.estado !== 'No cargado');
  const selectedIdx = defaultIdx >= 0 ? defaultIdx : 0;
  return `
    <div class="sd-detail__docs">
      <!-- Left: tabla de documentos -->
      <div class="sd-detail__docs-table-wrap">
        <div class="sd-detail__docs-header">
          <h3 class="sd-detail__docs-title">Fotografías del escenario</h3>
          <div class="sd-detail__docs-fecha">
            <span>Fecha de captura<span class="sd-detail__docs-fecha-req">*</span></span>
            ${calendarMiniIcon()}
            <span class="sd-detail__docs-fecha-val">--</span>
          </div>
        </div>

        <table class="sd-detail__doc-table">
          <thead>
            <tr>
              <th>Documento</th>
              <th class="sd-detail__doc-th-estado">Estado</th>
              <th class="sd-detail__doc-th-fecha">Fecha de cargue</th>
              <th class="sd-detail__doc-th-action">Acción</th>
            </tr>
          </thead>
          <tbody>
            ${docs.map((doc, i) => renderDocRow(doc, i, i === selectedIdx)).join('')}
          </tbody>
        </table>
      </div>

      <!-- Vertical divider -->
      <div class="sd-detail__docs-divider"></div>

      <!-- Right: preview panel -->
      <div class="sd-detail__doc-preview-wrap">
        <h3 class="sd-detail__doc-preview-title" data-doc-preview-title>${escapeHtml(docs[selectedIdx]?.name || 'Selecciona un documento')}</h3>
        <div class="sd-detail__doc-preview" data-doc-preview>
          <div class="sd-detail__doc-preview-toolbar">
            <button type="button" class="sd-detail__doc-preview-btn" data-zoom="in" aria-label="Acercar">${zoomInIcon()}</button>
            <button type="button" class="sd-detail__doc-preview-btn" data-zoom="out" aria-label="Alejar">${zoomOutIcon()}</button>
            <button type="button" class="sd-detail__doc-preview-btn" data-doc-download aria-label="Descargar">${downloadIcon()}</button>
          </div>
          <div class="sd-detail__doc-preview-body" data-doc-preview-body>
            ${renderDocPreview(docs[selectedIdx])}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderDocRow(doc, idx, isSelected) {
  const fileIcon = doc.type === 'pdf' ? pdfFileIcon() : jpgFileIcon();
  const estadoMeta = getEstadoBadge(doc.estado);
  const isNoCargado = doc.estado === 'No cargado';
  return `
    <tr class="sd-detail__doc-row ${isSelected ? 'sd-detail__doc-row--selected' : ''}"
        data-doc-idx="${idx}"
        ${isNoCargado ? 'data-doc-no-cargado="true"' : ''}>
      <td>
        <div class="sd-detail__doc-name">
          ${fileIcon}
          ${escapeHtml(doc.name)}
        </div>
      </td>
      <td class="sd-detail__doc-td-estado">
        <span class="naowee-badge naowee-badge--quiet naowee-badge--${estadoMeta.variant}">
          ${estadoMeta.label}
        </span>
      </td>
      <td class="sd-detail__doc-td-fecha">${doc.fecha || ''}</td>
      <td class="sd-detail__doc-td-action">
        ${isNoCargado
          ? `<button type="button" class="sd-detail__doc-subir" data-doc-subir>
               ${uploadIcon()} Subir
             </button>`
          : ''}
      </td>
    </tr>
  `;
}

function getEstadoBadge(estado) {
  if (estado === 'Aprobado')   return { label: 'Aprobado',    variant: 'positive' };
  if (estado === 'En revisión') return { label: 'En revisión', variant: 'caution' };
  if (estado === 'No cargado')  return { label: 'No cargado',  variant: 'neutral' };
  return { label: estado, variant: 'neutral' };
}

/* Renderiza el contenido del preview según el tipo del doc.
   - jpg: <img> de Unsplash (mismo pattern del banner)
   - pdf: placeholder card con icon + label "Vista previa de PDF" */
function renderDocPreview(doc) {
  if (!doc) {
    return `
      <div class="sd-detail__doc-preview-empty">
        ${imageIcon()}
        <div>Selecciona un documento</div>
      </div>
    `;
  }
  if (doc.estado === 'No cargado') {
    return `
      <div class="sd-detail__doc-preview-empty">
        ${docIcon()}
        <div>Documento aún no cargado</div>
        <div class="sd-detail__doc-preview-empty-sub">Haz click en "Subir" para agregarlo</div>
      </div>
    `;
  }
  if (doc.type === 'jpg' && doc.preview) {
    return `
      <img class="sd-detail__doc-preview-img" data-doc-img
           src="https://images.unsplash.com/photo-${doc.preview}?w=900&h=600&fit=crop&q=85"
           alt="${escapeHtml(doc.name)}" />
    `;
  }
  /* PDF placeholder */
  return `
    <div class="sd-detail__doc-preview-pdf">
      <div class="sd-detail__doc-preview-pdf-icon">${pdfFileIcon()}</div>
      <div class="sd-detail__doc-preview-pdf-name">${escapeHtml(doc.name)}.pdf</div>
      <div class="sd-detail__doc-preview-pdf-sub">Vista previa de PDF — descarga para ver el contenido completo</div>
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
  /* Back link → preserva role actual + va al returnTo configurado.
     Reviewer vuelve a 'docs' (dashboard de revisión), admin vuelve
     a 'sedes-lista'. */
  pageEl.querySelector('[data-back]')?.addEventListener('click', () => {
    const params = new URLSearchParams(window.location.search);
    params.set('active', _state.returnTo);
    params.delete('code');
    params.delete('status');
    window.location.search = '?' + params.toString();
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

  /* Galería: prev/next desplazan el strip (1 thumb a la vez) */
  pageEl.querySelectorAll('[data-gallery]').forEach(btn => {
    btn.addEventListener('click', () => {
      const dir = btn.getAttribute('data-gallery');
      const track = pageEl.querySelector('#sdGalleryTrack');
      if (!track) return;
      const thumb = track.querySelector('.sd-detail__gallery-thumb');
      if (!thumb) return;
      const thumbWidth = thumb.getBoundingClientRect().width + 12;  /* gap inclusivo */
      track.scrollBy({ left: dir === 'next' ? thumbWidth * 2 : -thumbWidth * 2, behavior: 'smooth' });
    });
  });

  /* Click en thumbnail → abrir lightbox modal */
  pageEl.querySelectorAll('[data-photo-idx]').forEach(thumb => {
    thumb.addEventListener('click', () => {
      const idx = parseInt(thumb.getAttribute('data-photo-idx'), 10);
      openLightbox(idx);
    });
  });

  /* Dots → scroll a la foto correspondiente */
  pageEl.querySelectorAll('[data-gallery-dot]').forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.getAttribute('data-gallery-dot'), 10);
      const track = pageEl.querySelector('#sdGalleryTrack');
      const target = track?.querySelector(`[data-photo-idx="${idx}"]`);
      if (target) target.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
      pageEl.querySelectorAll('[data-gallery-dot]').forEach((d, i) => {
        d.classList.toggle('sd-detail__gallery-dot--active', i === idx);
      });
    });
  });

  /* "Corregir y reenviar" → abre modal con datos actuales */
  pageEl.querySelector('[data-edit-rejected]')?.addEventListener('click', () => {
    openCreateSedeModal();
  });

  /* Documentación tab events */
  bindDocsEvents(pageEl);
}

function bindDocsEvents(pageEl) {
  const docs = getDocsForSede(_state.sedeStatus);

  /* Click en row del doc → seleccionar y mostrar preview */
  pageEl.querySelectorAll('[data-doc-idx]').forEach(row => {
    row.addEventListener('click', (e) => {
      /* No-op si el click fue en el botón "Subir" — ese tiene su propio handler */
      if (e.target.closest('[data-doc-subir]')) return;
      const idx = parseInt(row.getAttribute('data-doc-idx'), 10);
      const doc = docs[idx];
      if (!doc) return;
      /* Update selected state quirúrgicamente */
      pageEl.querySelectorAll('[data-doc-idx]').forEach(r => {
        r.classList.toggle('sd-detail__doc-row--selected', r === row);
      });
      /* Update preview title + body */
      const titleEl = pageEl.querySelector('[data-doc-preview-title]');
      const bodyEl = pageEl.querySelector('[data-doc-preview-body]');
      if (titleEl) titleEl.textContent = doc.name;
      if (bodyEl) bodyEl.innerHTML = renderDocPreview(doc);
      /* Reset zoom level cuando cambias de doc */
      _state.docZoom = 1;
      const img = pageEl.querySelector('[data-doc-img]');
      if (img) img.style.transform = `scale(1)`;
    });
  });

  /* Zoom in / out */
  pageEl.querySelectorAll('[data-zoom]').forEach(btn => {
    btn.addEventListener('click', () => {
      const dir = btn.getAttribute('data-zoom');
      _state.docZoom = _state.docZoom || 1;
      if (dir === 'in')  _state.docZoom = Math.min(3,    _state.docZoom * 1.25);
      if (dir === 'out') _state.docZoom = Math.max(0.5,  _state.docZoom / 1.25);
      const img = pageEl.querySelector('[data-doc-img]');
      if (img) img.style.transform = `scale(${_state.docZoom})`;
    });
  });

  /* Download button (preview-only — no real download) */
  pageEl.querySelector('[data-doc-download]')?.addEventListener('click', () => {
    flashDocAction(pageEl, 'Descarga iniciada (preview only)');
  });

  /* Subir → flash de feedback (preview-only) */
  pageEl.querySelectorAll('[data-doc-subir]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      flashDocAction(pageEl, 'Selector de archivo (preview only)');
    });
  });
}

/* Toast feedback temporal en el preview body */
function flashDocAction(pageEl, message) {
  const body = pageEl.querySelector('[data-doc-preview-body]');
  if (!body) return;
  let toast = body.querySelector('.sd-detail__doc-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'sd-detail__doc-toast';
    body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('sd-detail__doc-toast--show');
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => toast.classList.remove('sd-detail__doc-toast--show'), 2000);
}

/* ─── Helpers ────────────────────────────────────────────── */
function escapeHtml(str) {
  return String(str ?? '—')
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

function arrowLeftIcon() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7M19 12H5"/></svg>'; }
function closeIcon()     { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'; }
function chevronLeft()   { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>'; }
function chevronRight()  { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>'; }
function clockIcon()     { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'; }
function alertIcon()     { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'; }
function editIcon()      { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>'; }
function docIcon()       { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>'; }
function downloadIcon()  { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'; }
function uploadIcon()    { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>'; }
function zoomInIcon()    { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>'; }
function zoomOutIcon()   { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>'; }
function calendarMiniIcon() { return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>'; }
function imageIcon()     { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:48px;height:48px;opacity:.4"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>'; }
/* Mini badges JPG/PDF para la columna Documento */
function jpgFileIcon()   { return '<span class="sd-detail__file-badge sd-detail__file-badge--jpg">JPG</span>'; }
function pdfFileIcon()   { return '<span class="sd-detail__file-badge sd-detail__file-badge--pdf">PDF</span>'; }
