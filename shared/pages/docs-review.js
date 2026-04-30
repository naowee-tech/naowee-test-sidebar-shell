/**
 * Reviewer Dashboard — Documentos pendientes (rol DOCUMENTATION_REVIEWER)
 * Replica de:
 *   https://naowee-tech.github.io/naowee-test-escenarios/escenario-11-revisor-dashboard.html
 *
 * Composición:
 * - Page header: "Documentos pendientes" / "Monitoreo y control de documentación"
 * - Toolbar: searchbox + Estados filter + paginación
 * - Bulk actions row (visible cuando hay selecciones):
 *     "X seleccionados" + "Aprobar seleccionados" (verde) + "Rechazar seleccionados" (rojo)
 * - Tabla 7 cols:
 *     checkbox | Escenario | ID único | CAR | Estado | Última actualización | acciones (3-dots)
 * - Per-row 3-dots menu: "Ver detalle" + "Aceptar" + "Rechazar" (estos 2 solo si "Por revisar")
 * - Aprobar dialog: card centered con icon verde + confirmación
 * - Rechazar dialog: card con textarea para motivo + validación
 * - Toast naowee-message al completar acción
 */

const ESTADOS = [
  { code: 'todos',       label: 'Todos los estados', dot: null },
  { code: 'por-revisar', label: 'Por revisar',       dot: '#d74009' },
  { code: 'activo',      label: 'Activo',            dot: '#1f8923' },
  { code: 'rechazado',   label: 'Rechazado',         dot: '#9e0015' }
];

const ESTADO_BADGE = {
  'por-revisar': { label: 'Por revisar', variant: 'caution' },
  'activo':      { label: 'Activo',      variant: 'positive' },
  'rechazado':   { label: 'Rechazado',   variant: 'negative' }
};

/* Mock data: 12 escenarios en distintos estados de revisión */
const REVIEW_QUEUE = [
  { id: 1,  name: 'Centro deportivo Miramar',     code: '1000020202', car: 'Sí', status: 'por-revisar', updated: 'Abr. 24, 2026 6:43 AM', updatedBy: 'De Juan Hernandez Granados' },
  { id: 2,  name: 'Estadio Atanasio Girardot',    code: '1000070707', car: 'Sí', status: 'por-revisar', updated: 'Abr. 22, 2026 8:30 AM', updatedBy: 'De Juan Hernandez Granados' },
  { id: 3,  name: 'Coliseo Bicentenario',         code: '1000090909', car: 'No', status: 'por-revisar', updated: 'Abr. 20, 2026 11:15 AM', updatedBy: 'De Juan Hernandez Granados' },
  { id: 4,  name: 'Polideportivo Las Margaritas', code: '1000101010', car: 'No', status: 'por-revisar', updated: 'Abr. 18, 2026 3:22 PM', updatedBy: 'De Juan Hernandez Granados' },
  { id: 5,  name: 'Cancha sintética El Poblado',  code: '1000080808', car: 'No', status: 'por-revisar', updated: 'Abr. 17, 2026 10:05 AM', updatedBy: 'De Juan Hernandez Granados' },
  { id: 6,  name: 'Centro Acuático Salitre',      code: '1000111111', car: 'Sí', status: 'por-revisar', updated: 'Abr. 16, 2026 9:48 AM', updatedBy: 'De Juan Hernandez Granados' },
  { id: 7,  name: 'Centro deportivo Sur',         code: '1000040404', car: 'No', status: 'rechazado',   updated: 'Abr. 14, 2026 9:43 AM', updatedBy: 'De Juan Hernandez Granados' },
  { id: 8,  name: 'Centro deportivo Norte',       code: '1000030303', car: 'Sí', status: 'activo',      updated: 'Abr. 09, 2026 9:43 AM', updatedBy: 'De Juan Hernandez Granados' },
  { id: 9,  name: 'Polideportivo La Floresta',    code: '1000050505', car: 'No', status: 'activo',      updated: 'Abr. 02, 2026 11:20 AM', updatedBy: 'De Juan Hernandez Granados' },
  { id: 10, name: 'Coliseo Iván de Bedout',       code: '1000060606', car: 'Sí', status: 'activo',      updated: 'Mar. 28, 2026 4:15 PM', updatedBy: 'De Juan Hernandez Granados' },
  { id: 11, name: 'Pista Atlética Distrital',     code: '1000121212', car: 'Sí', status: 'rechazado',   updated: 'Mar. 25, 2026 2:30 PM', updatedBy: 'De Juan Hernandez Granados' },
  { id: 12, name: 'Gimnasio Municipal Centro',    code: '1000131313', car: 'No', status: 'por-revisar', updated: 'Mar. 22, 2026 10:00 AM', updatedBy: 'De Juan Hernandez Granados' }
];

const _state = {
  rootEl: null,
  search: '',
  estado: 'todos',
  selected: new Set(),     /* Set de ids de filas seleccionadas */
  page: 1,
  perPage: 10,
  rowMenuOpenId: null
};

export function renderDocsReviewPage(pageEl) {
  pageEl.classList.remove('um-page');
  pageEl.classList.remove('me-page');
  pageEl.classList.add('sd-page');     /* reuso del layout full-width del sandbox */
  _state.rootEl = pageEl;
  _state.selected = new Set();
  pageEl.innerHTML = renderShell();
  bindEvents(pageEl);
}

function renderShell() {
  return `
    <div class="naowee-page-header ev-page-header">
      <div class="ev-page-header__text">
        <h1 class="naowee-page-header__title">Documentos pendientes</h1>
        <p class="naowee-page-header__subtitle">Monitoreo y control de documentación</p>
      </div>
    </div>

    <div class="naowee-table-card dr-card">
      ${renderToolbar()}
      ${renderBulkActions()}
      <div class="naowee-table-card__table-wrap">
        ${renderTable()}
      </div>
    </div>
  `;
}

function renderToolbar() {
  return `
    <div class="naowee-table-card__toolbar">
      <div class="naowee-table-card__toolbar-left">
        ${renderSearchbox()}
        ${renderEstadoFilter()}
      </div>
      <div class="naowee-table-card__toolbar-right">
        ${renderPagination()}
      </div>
    </div>
  `;
}

function renderSearchbox() {
  const hasValue = _state.search.length > 0;
  return `
    <div class="naowee-searchbox naowee-searchbox--small ${hasValue ? 'naowee-searchbox--has-value' : ''}">
      <div class="naowee-searchbox__input-wrap">
        <span class="naowee-searchbox__icon">${searchIcon()}</span>
        <input type="text" class="naowee-searchbox__input"
               placeholder="Buscar escenario o ID"
               value="${escapeHtml(_state.search)}"
               id="drSearch" />
        ${hasValue ? `<button class="naowee-searchbox__clear" type="button" aria-label="Limpiar" id="drSearchClear">${closeIcon()}</button>` : ''}
      </div>
    </div>
  `;
}

function renderEstadoFilter() {
  const current = ESTADOS.find(e => e.code === _state.estado) || ESTADOS[0];
  return `
    <div class="naowee-filter-dropdown" id="drEstadosDD">
      <button class="naowee-filter-dropdown__trigger" type="button">
        <span>${current.code === 'todos' ? 'Estado: Todos' : current.label}</span>
        <span class="naowee-filter-dropdown__chev">${chevronDown()}</span>
      </button>
      <div class="naowee-filter-dropdown__menu" role="listbox">
        ${ESTADOS.map(e => `
          <button type="button" class="naowee-filter-dropdown__option"
                  data-val="${e.code}" role="option"
                  aria-selected="${e.code === _state.estado ? 'true' : 'false'}">
            ${e.dot ? `<span class="dr-dot" style="background:${e.dot}"></span>` : ''}
            <span>${e.label}</span>
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

function renderPagination() {
  const filtered = filterRows();
  const totalPages = Math.max(1, Math.ceil(filtered.length / _state.perPage));
  return `
    <div class="naowee-pagination naowee-pagination--small">
      <div class="naowee-pagination__pages">
        <span class="naowee-pagination__label">Página</span>
        <input type="text" class="naowee-pagination__input" id="drPgInput" value="${_state.page}" />
        <span class="naowee-pagination__total">de <strong>${totalPages}</strong></span>
      </div>
      <div class="naowee-pagination__controls">
        <button class="naowee-pagination__btn" type="button" data-pg="prev" ${_state.page <= 1 ? 'disabled' : ''} aria-label="Anterior">${chevronLeft()}</button>
        <button class="naowee-pagination__btn" type="button" data-pg="next" ${_state.page >= totalPages ? 'disabled' : ''} aria-label="Siguiente">${chevronRight()}</button>
      </div>
    </div>
  `;
}

function renderBulkActions() {
  const count = _state.selected.size;
  if (count === 0) return '<div class="dr-bulk-actions" hidden></div>';
  return `
    <div class="dr-bulk-actions">
      <span class="dr-bulk-actions__count">${count} seleccionados</span>
      <button class="naowee-btn naowee-btn--mute naowee-btn--small dr-bulk-approve" type="button" data-bulk="approve">
        ${checkIcon()}
        Aprobar seleccionados
      </button>
      <button class="naowee-btn naowee-btn--mute naowee-btn--small dr-bulk-reject" type="button" data-bulk="reject">
        ${closeIcon()}
        Rechazar seleccionados
      </button>
    </div>
  `;
}

function renderTable() {
  const filtered = filterRows();
  const start = (_state.page - 1) * _state.perPage;
  const pageRows = filtered.slice(start, start + _state.perPage);

  if (filtered.length === 0) {
    return `
      <div class="naowee-empty-state">
        <div class="naowee-empty-state__title">No hay registros con los filtros actuales</div>
        <div class="naowee-empty-state__desc">Ajustá los filtros o limpialos para ver toda la cola.</div>
      </div>
    `;
  }

  /* checkAll: marcado si TODAS las filas visibles que sean "por-revisar"
     están en _state.selected. */
  const reviewable = pageRows.filter(r => r.status === 'por-revisar');
  const allChecked = reviewable.length > 0 && reviewable.every(r => _state.selected.has(r.id));
  const someChecked = reviewable.some(r => _state.selected.has(r.id));

  return `
    <table class="naowee-table naowee-table--in-card dr-table">
      <thead>
        <tr>
          <th class="dr-th-check">
            ${renderCheckbox(allChecked, someChecked && !allChecked, 'checkAll')}
          </th>
          <th>Escenario o sede</th>
          <th>ID único</th>
          <th>CAR</th>
          <th>Estado</th>
          <th>Última actualización</th>
          <th class="dr-th-actions"></th>
        </tr>
      </thead>
      <tbody>
        ${pageRows.map(renderRow).join('')}
      </tbody>
    </table>
  `;
}

function renderRow(row) {
  const meta = ESTADO_BADGE[row.status] || { label: row.status, variant: 'neutral' };
  const isReviewable = row.status === 'por-revisar';
  const isChecked = _state.selected.has(row.id);
  const isMenuOpen = _state.rowMenuOpenId === row.id;
  return `
    <tr class="dr-row ${isChecked ? 'dr-row--selected' : ''}" data-row-id="${row.id}">
      <td class="dr-td-check">
        ${isReviewable
          ? renderCheckbox(isChecked, false, `row-${row.id}`)
          : '<div class="dr-check-spacer"></div>'}
      </td>
      <td><div class="dr-cell-name">${escapeHtml(row.name)}</div></td>
      <td><div class="dr-cell-code">${row.code}</div></td>
      <td><div class="dr-cell-car">${row.car}</div></td>
      <td>
        <span class="naowee-badge naowee-badge--quiet naowee-badge--${meta.variant}">
          ${meta.label}
        </span>
      </td>
      <td>
        <div class="dr-cell-modified">
          <span class="dr-cell-modified__date">${row.updated}</span>
          <span class="dr-cell-modified__user">${row.updatedBy}</span>
        </div>
      </td>
      <td class="dr-td-actions">
        <div class="dr-row-menu ${isMenuOpen ? 'dr-row-menu--open' : ''}" data-row-menu="${row.id}">
          <button type="button" class="naowee-btn naowee-btn--mute naowee-btn--icon naowee-btn--small dr-row-menu__trigger" data-menu-trigger="${row.id}" aria-label="Acciones">
            ${dotsVerticalIcon()}
          </button>
          <div class="dr-row-menu__dropdown" data-menu-dropdown="${row.id}">
            <button type="button" class="dr-row-menu__item" data-action="view" data-row="${row.id}">
              ${eyeIcon()} Ver detalle
            </button>
            ${isReviewable ? `
              <button type="button" class="dr-row-menu__item dr-row-menu__item--positive" data-action="approve" data-row="${row.id}">
                ${checkIcon()} Aceptar
              </button>
              <button type="button" class="dr-row-menu__item dr-row-menu__item--negative" data-action="reject" data-row="${row.id}">
                ${closeIcon()} Rechazar
              </button>
            ` : ''}
          </div>
        </div>
      </td>
    </tr>
  `;
}

function renderCheckbox(checked, indeterminate, id) {
  const cls = ['naowee-checkbox'];
  if (checked) cls.push('naowee-checkbox--checked');
  if (indeterminate) cls.push('naowee-checkbox--indeterminate');
  return `
    <div class="${cls.join(' ')}" tabindex="0" role="checkbox"
         aria-checked="${indeterminate ? 'mixed' : checked}"
         data-checkbox="${id}">
      <div class="naowee-checkbox__box">
        ${checked && !indeterminate
          ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
          : (indeterminate ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="6" y1="12" x2="18" y2="12"/></svg>' : '')}
      </div>
    </div>
  `;
}

/* ─── Filtrado ───────────────────────────────────────────────── */
function filterRows() {
  const q = _state.search.trim().toLowerCase();
  return REVIEW_QUEUE.filter(row => {
    if (_state.estado !== 'todos' && row.status !== _state.estado) return false;
    if (q && !row.name.toLowerCase().includes(q) && !row.code.includes(q)) return false;
    return true;
  });
}

/* ─── Repaints quirúrgicos ───────────────────────────────────── */
function paintTableOnly() {
  const wrap = _state.rootEl.querySelector('.naowee-table-card__table-wrap');
  if (wrap) wrap.innerHTML = renderTable();
  const pgRight = _state.rootEl.querySelector('.naowee-table-card__toolbar-right');
  if (pgRight) pgRight.innerHTML = renderPagination();
  bindTableEvents(_state.rootEl);
  bindPaginationEvents(_state.rootEl);
}
function paintBulkOnly() {
  const old = _state.rootEl.querySelector('.dr-bulk-actions');
  if (old) old.outerHTML = renderBulkActions();
  bindBulkEvents(_state.rootEl);
}
function paintToolbarOnly() {
  const tb = _state.rootEl.querySelector('.naowee-table-card__toolbar');
  if (tb) tb.outerHTML = renderToolbar();
  bindToolbarEvents(_state.rootEl);
}

/* ─── Bind events ────────────────────────────────────────────── */
function bindEvents(pageEl) {
  bindToolbarEvents(pageEl);
  bindTableEvents(pageEl);
  bindBulkEvents(pageEl);
  bindPaginationEvents(pageEl);
  /* Click outside cierra row menus */
  document.addEventListener('click', (e) => {
    if (!e.target.closest('[data-row-menu]')) {
      _state.rowMenuOpenId = null;
      pageEl.querySelectorAll('.dr-row-menu--open').forEach(m => m.classList.remove('dr-row-menu--open'));
    }
  });
}

function bindToolbarEvents(pageEl) {
  const input = pageEl.querySelector('#drSearch');
  if (input) {
    input.addEventListener('input', (e) => {
      _state.search = e.target.value;
      _state.page = 1;
      paintTableOnly();
      const sb = pageEl.querySelector('.naowee-searchbox');
      sb?.classList.toggle('naowee-searchbox--has-value', !!_state.search);
      const wrap = pageEl.querySelector('.naowee-searchbox__input-wrap');
      let clearBtn = wrap?.querySelector('.naowee-searchbox__clear');
      if (_state.search && !clearBtn) {
        wrap.insertAdjacentHTML('beforeend', `<button class="naowee-searchbox__clear" type="button" id="drSearchClear">${closeIcon()}</button>`);
        wrap.querySelector('#drSearchClear').addEventListener('click', () => { _state.search = ''; paintToolbarOnly(); paintTableOnly(); });
      } else if (!_state.search && clearBtn) {
        clearBtn.remove();
      }
    });
  }
  pageEl.querySelector('#drSearchClear')?.addEventListener('click', () => { _state.search = ''; paintToolbarOnly(); paintTableOnly(); });

  /* Estado dropdown DS */
  const dd = pageEl.querySelector('#drEstadosDD');
  if (dd) {
    const trigger = dd.querySelector('.naowee-filter-dropdown__trigger');
    trigger?.addEventListener('click', (e) => {
      e.stopPropagation();
      pageEl.querySelectorAll('.naowee-filter-dropdown.is-open').forEach(o => { if (o !== dd) o.classList.remove('is-open'); });
      dd.classList.toggle('is-open');
    });
    dd.querySelectorAll('[data-val]').forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        _state.estado = opt.getAttribute('data-val');
        _state.page = 1;
        dd.classList.remove('is-open');
        paintToolbarOnly();
        paintTableOnly();
      });
    });
    document.addEventListener('click', () => dd.classList.remove('is-open'));
  }
}

function bindTableEvents(pageEl) {
  /* Check all */
  pageEl.querySelector('[data-checkbox="checkAll"]')?.addEventListener('click', () => {
    const visible = filterRows().slice((_state.page - 1) * _state.perPage, _state.page * _state.perPage);
    const reviewable = visible.filter(r => r.status === 'por-revisar');
    const allChecked = reviewable.length > 0 && reviewable.every(r => _state.selected.has(r.id));
    if (allChecked) {
      reviewable.forEach(r => _state.selected.delete(r.id));
    } else {
      reviewable.forEach(r => _state.selected.add(r.id));
    }
    paintTableOnly();
    paintBulkOnly();
  });

  /* Per-row checkboxes */
  pageEl.querySelectorAll('[data-checkbox^="row-"]').forEach(cb => {
    cb.addEventListener('click', () => {
      const id = parseInt(cb.getAttribute('data-checkbox').replace('row-', ''), 10);
      if (_state.selected.has(id)) _state.selected.delete(id);
      else _state.selected.add(id);
      paintTableOnly();
      paintBulkOnly();
    });
  });

  /* Row menu trigger (3-dots) */
  pageEl.querySelectorAll('[data-menu-trigger]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(btn.getAttribute('data-menu-trigger'), 10);
      _state.rowMenuOpenId = (_state.rowMenuOpenId === id) ? null : id;
      pageEl.querySelectorAll('.dr-row-menu').forEach(m => {
        const mId = parseInt(m.getAttribute('data-row-menu'), 10);
        m.classList.toggle('dr-row-menu--open', mId === _state.rowMenuOpenId);
      });
    });
  });

  /* Row menu actions */
  pageEl.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const action = btn.getAttribute('data-action');
      const rowId = parseInt(btn.getAttribute('data-row'), 10);
      const row = REVIEW_QUEUE.find(r => r.id === rowId);
      if (!row) return;
      _state.rowMenuOpenId = null;
      pageEl.querySelectorAll('.dr-row-menu--open').forEach(m => m.classList.remove('dr-row-menu--open'));
      if (action === 'view')    navigateToDetail(row);
      if (action === 'approve') openApproveDialog([rowId]);
      if (action === 'reject')  openRejectDialog([rowId]);
    });
  });
}

function bindBulkEvents(pageEl) {
  pageEl.querySelectorAll('[data-bulk]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.getAttribute('data-bulk');
      const ids = Array.from(_state.selected);
      if (ids.length === 0) return;
      if (action === 'approve') openApproveDialog(ids);
      if (action === 'reject')  openRejectDialog(ids);
    });
  });
}

function bindPaginationEvents(pageEl) {
  pageEl.querySelectorAll('[data-pg]').forEach(btn => {
    btn.addEventListener('click', () => {
      const dir = btn.getAttribute('data-pg');
      const totalPages = Math.max(1, Math.ceil(filterRows().length / _state.perPage));
      if (dir === 'prev' && _state.page > 1) _state.page -= 1;
      if (dir === 'next' && _state.page < totalPages) _state.page += 1;
      paintTableOnly();
    });
  });
}

/* ─── Approve / Reject dialogs ─────────────────────────────── */
function openApproveDialog(ids) {
  const overlay = document.createElement('div');
  overlay.className = 'dr-dialog-overlay';
  overlay.innerHTML = `
    <div class="dr-dialog">
      <div class="dr-dialog__icon dr-dialog__icon--positive">
        ${checkIcon(36)}
      </div>
      <h3 class="dr-dialog__title">Aprobar registro${ids.length > 1 ? 's' : ''}</h3>
      <p class="dr-dialog__text">Estás a punto de aprobar ${ids.length === 1 ? 'este registro' : `${ids.length} registros`}.</p>
      <p class="dr-dialog__sub">Una vez aprobado${ids.length > 1 ? 's' : ''}, el estado cambiará a "Activo" y ${ids.length === 1 ? 'el escenario quedará habilitado' : 'los escenarios quedarán habilitados'} en el sistema. ¿Deseas continuar?</p>
      <div class="dr-dialog__footer">
        <button type="button" class="naowee-btn naowee-btn--link dr-dialog__cancel" data-dlg-cancel>Cancelar</button>
        <button type="button" class="naowee-btn naowee-btn--loud dr-dialog__confirm--positive" data-dlg-confirm>
          ${checkIcon()} Confirmar aprobación
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => overlay.classList.add('dr-dialog-overlay--open'));
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeDialog(overlay); });
  overlay.querySelector('[data-dlg-cancel]').addEventListener('click', () => closeDialog(overlay));
  overlay.querySelector('[data-dlg-confirm]').addEventListener('click', () => {
    ids.forEach(id => {
      const row = REVIEW_QUEUE.find(r => r.id === id);
      if (row) row.status = 'activo';
      _state.selected.delete(id);
    });
    closeDialog(overlay);
    paintTableOnly();
    paintBulkOnly();
    showToast('positive', `${ids.length === 1 ? 'Registro aprobado' : `${ids.length} registros aprobados`}`,
              `${ids.length === 1 ? 'El escenario está activo' : 'Los escenarios están activos'} en el sistema.`);
  });
}

function openRejectDialog(ids) {
  const overlay = document.createElement('div');
  overlay.className = 'dr-dialog-overlay';
  overlay.innerHTML = `
    <div class="dr-dialog">
      <div class="dr-dialog__icon dr-dialog__icon--negative">
        ${closeIcon(36)}
      </div>
      <h3 class="dr-dialog__title">Rechazar registro${ids.length > 1 ? 's' : ''}</h3>
      <p class="dr-dialog__sub">El gestor recibirá la observación para corregir los datos. Sin un motivo claro, el flujo se traba.</p>
      <div class="naowee-textfield naowee-textfield--textarea dr-dialog__field" data-field-wrap="motivo">
        <label class="naowee-textfield__label naowee-textfield__label--required">Motivo del rechazo</label>
        <div class="naowee-textfield__input-wrap">
          <textarea class="naowee-textfield__input" rows="4" maxlength="500" id="drRejectMotivo"
                    placeholder="Ej: la documentación no cumple con los requisitos. El acta de recepción debe estar firmada por el representante legal..."></textarea>
        </div>
      </div>
      <div class="dr-dialog__footer">
        <button type="button" class="naowee-btn naowee-btn--link dr-dialog__cancel" data-dlg-cancel>Cancelar</button>
        <button type="button" class="naowee-btn naowee-btn--loud dr-dialog__confirm--negative" data-dlg-confirm disabled>
          ${closeIcon()} Confirmar rechazo
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => overlay.classList.add('dr-dialog-overlay--open'));
  const textarea = overlay.querySelector('#drRejectMotivo');
  const confirm = overlay.querySelector('[data-dlg-confirm]');
  textarea.addEventListener('input', () => {
    confirm.disabled = textarea.value.trim().length < 10;
  });
  textarea.focus();
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeDialog(overlay); });
  overlay.querySelector('[data-dlg-cancel]').addEventListener('click', () => closeDialog(overlay));
  confirm.addEventListener('click', () => {
    if (confirm.disabled) return;
    ids.forEach(id => {
      const row = REVIEW_QUEUE.find(r => r.id === id);
      if (row) {
        row.status = 'rechazado';
        row.notaRechazo = textarea.value.trim();
      }
      _state.selected.delete(id);
    });
    closeDialog(overlay);
    paintTableOnly();
    paintBulkOnly();
    showToast('negative', `${ids.length === 1 ? 'Registro rechazado' : `${ids.length} registros rechazados`}`,
              'Se notificó al gestor con la observación.');
  });
}

function closeDialog(overlay) {
  overlay.classList.remove('dr-dialog-overlay--open');
  setTimeout(() => {
    overlay.remove();
    if (!document.querySelector('.dr-dialog-overlay')) document.body.style.overflow = '';
  }, 200);
}

/* ─── Toast (DS naowee-message) ──────────────────────────────
   Iconos del badge: idénticos al pattern del playground#message
   - positive: check pequeño 16×16 con stroke blanco
   - negative: minus horizontal 16×16 con stroke blanco
   El círculo verde/rojo viene del .__icon background (DS handles). */
function showToast(variant, title, body) {
  document.querySelectorAll('.dr-toast').forEach(t => t.remove());
  const wrap = document.createElement('div');
  wrap.className = 'dr-toast';
  const badgeIcons = {
    positive: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 8l1.6 1.6L10.5 6.5" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>',
    negative: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M5 8h6" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></svg>'
  };
  wrap.innerHTML = `
    <div class="naowee-message naowee-message--${variant}">
      <div class="naowee-message__header">
        <span class="naowee-message__icon">${badgeIcons[variant] || badgeIcons.positive}</span>
        <div class="dr-toast__body">
          <div class="naowee-message__title">${escapeHtml(title)}</div>
          <p class="naowee-message__text">${escapeHtml(body)}</p>
        </div>
        <button type="button" class="dr-toast__dismiss" aria-label="Cerrar">${closeIcon()}</button>
      </div>
    </div>
  `;
  document.body.appendChild(wrap);
  requestAnimationFrame(() => wrap.classList.add('dr-toast--show'));
  const dismiss = () => {
    wrap.classList.remove('dr-toast--show');
    setTimeout(() => wrap.remove(), 250);
  };
  wrap.querySelector('.dr-toast__dismiss').addEventListener('click', dismiss);
  setTimeout(dismiss, 4500);
}

function navigateToDetail(row) {
  const params = new URLSearchParams(window.location.search);
  params.set('active', 'sede-detail');
  params.set('code', row.code);
  /* Mapear estado de revisor → estado del detail */
  const detailStatus =
    row.status === 'por-revisar' ? 'revision' :
    row.status === 'rechazado'   ? 'rechazado' : 'activo';
  params.set('status', detailStatus);
  window.location.search = '?' + params.toString();
}

/* ─── Iconos ──────────────────────────────────────────────── */
function searchIcon()  { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>'; }
function closeIcon(size = 16) { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="width:${size}px;height:${size}px"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`; }
function checkIcon(size = 16) { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width:${size}px;height:${size}px"><polyline points="20 6 9 17 4 12"/></svg>`; }
function chevronDown() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>'; }
function chevronLeft() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>'; }
function chevronRight(){ return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>'; }
function dotsVerticalIcon(){ return '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>'; }
function eyeIcon()     { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>'; }

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}
