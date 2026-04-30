/* ═══════════════════════════════════════════════════════════════
   Footer flotante Naowee — animación scroll
   Patrón estandarizado en naowee-test-incentivos:
   - Scroll DOWN (avanzar leyendo) → footer aparece
   - Scroll UP (volver) → footer desaparece
   Threshold de 4px para evitar disparos por scroll inertia/trackpad jitter.
   Listener atado al scroll target principal (.page con overflow-y:auto del shell)
   con fallback a window por si se usa fuera del shell.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  function bind() {
    const footer = document.querySelector('.naowee-floating-footer');
    if (!footer) return;
    const page = document.querySelector('.page');
    const target = page || window;
    const getY = page
      ? () => page.scrollTop
      : () => window.scrollY || window.pageYOffset || 0;
    let lastY = getY();
    target.addEventListener('scroll', () => {
      const y = getY();
      const dy = y - lastY;
      if (Math.abs(dy) < 4) return;
      if (dy > 0) {
        footer.classList.remove('is-hidden');
      } else {
        footer.classList.add('is-hidden');
      }
      lastY = y;
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
})();
