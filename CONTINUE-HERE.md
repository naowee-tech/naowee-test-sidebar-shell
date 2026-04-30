# CONTINUE-HERE — Refinamiento detalle de evento (Master SUID)

**Sesión:** 2026-04-30 · `feat/evento-detalle-figma-layout`
**Origen Figma:** [Master SUID — node 9505:71950](https://www.figma.com/design/R6aqHQPtSrsq8clrMwHgIb/Master-SUID?node-id=9505-71950)
**URL local de prueba:** `http://localhost:4700/perfil.html?role=ROOT&active=eventos-lista`

---

## ¿Qué se entrega?

Vista de **detalle de evento** alineada 1:1 con el artboard Master SUID, conectada a la lista de eventos del shell. Se introducen 2 estados nuevos (`Publicado`, `Terminado`) además de los existentes `Creado` y `En curso`.

### Flujo end-to-end

1. Usuario abre `perfil.html?role=ROOT&active=eventos-lista`
2. La tabla muestra 20 eventos con datos coherentes (Mindeporte / Comité Olímpico). Solo los eventos `creado` o `en-curso` son **clickables** — el nombre aparece en `--accent` y enlaza al detalle.
3. Click en el nombre → `perfil.html?role=ROOT&active=evento-detalle&id=evt-XXX`
4. Detalle renderiza:
   - Title row: back + nombre + status badge + Editar evento + Catálogo deportivo
   - Stats bar gris (4 columnas: Fecha inicio · Fecha final · Categorías · Cierre inscripciones)
   - Métricas chip (Fases · Eventos · Competencias · Participantes)
   - Sección "Fases del juego" + botón loud "Agregar fase"
   - Tabs por fase con dot de estado (verde=activa · amarillo=pendiente · gris=cerrada)
   - "Datos de la fase" + split-button **Acciones** (Editar / Borrar fase / Crear proceso documental)
   - Campos read-only (Nombre, Descripción, Fechas, ¿Tiene cupos?, ¿Tiene inscripciones?, ¿Necesita documentos?)

---

## Archivos tocados (este repo)

| Archivo | Cambio |
|---|---|
| `shared/pages/event-list.js` | EVENTS reemplazados por 20 mocks realistas con `id`, `categorias`, `cierre`, `fases`, `eventos`, `competencias`, `sede`. Helper `isOpenable(status)` + `navigateToEvent(id)`. Click en nombre y en menú "Ver detalles" → navega al detalle. EVENTS exportado para reuso. |
| `shared/pages/event-list.css` | Estilo `.ev-name-link` (clickable accent + hover underline + focus ring). |
| `shared/pages/evento-detalle.js` | **NUEVO** — módulo de página con `renderEventoDetallePage(rootEl, { id })`. Lee EVENTS del list, mockea fases por evento, soporta 4 badges, split-button menú, dev state-picker fijo bottom-right. |
| `shared/pages/evento-detalle.css` | **NUEVO** — todos los estilos `.evd-*` (BEM-ish). Tokens locales con fallback al DS. Responsive < 900px. |
| `perfil.html` | Import + ruta `evento-detalle` que toma `?id=` de la querystring. Link al CSS nuevo. |

> El standalone `digitacion/evento-detalle.html` (en `douguizard/digitacion-ui-ux-demo`) se rehízo con el mismo layout pero como página independiente sin shell. Sirve como referencia visual offline.

---

## Tokens / Reglas de los 4 estados (badge superior)

| Estado | Background | Texto | Borde | Origen |
|---|---|---|---|---|
| `creado` | `#defade` | `#124515` | `#bdf5be` | Figma · `feedback-fill-positive-quiet` |
| `en-curso` | `#ffedc7` | `#7a3500` | `#ffbf75` | Figma · `feedback-fill-caution-quiet` |
| `publicado` | `#dee9ff` | `#1c2c8a` | `#c6d8ff` | DS · `blue-200` / `blue-700` |
| `terminado` | `#e7e9f3` | `#434565` | `#d0d4e6` | DS · `gray-200` / `gray-700` |

El **dev state-picker** (esquina inferior derecha) permite previsualizar los 4 estados sin tocar la data — solo para QA/diseño, hay que removerlo cuando esto pase a Angular.

---

## Pendientes / Próximos pasos

- [ ] **Reemplazar dev state-picker** por la transición real de estado en backend (Crear → Publicar → En curso → Terminar). Hoy es solo visual.
- [ ] **Wire del split-button "Acciones"**: hoy solo `console.info`. Falta integrar:
  - `Editar` → modal o pantalla de edición de la fase
  - `Borrar fase` → confirmación + delete
  - `Crear proceso documental` → flow del gestor de documentos
- [ ] **Botón "Editar evento"** y **"Catálogo deportivo"** son stubs (`console.info`). Falta navegación o modal.
- [ ] **"+ Agregar fase"** (loud naranja) — falta modal de creación de fase.
- [ ] **Métricas chip** (Fases / Eventos / Competencias / Participantes) son toggle visual. Falta filtrar el contenido inferior según la métrica seleccionada (o navegar a sub-vistas: `?active=evento-fases`, `?active=evento-competencias`, etc.).
- [ ] **Phase data** (`PHASES_BY_EVENT` en `evento-detalle.js`) está mockeado solo para `evt-001`. Falta:
  - Generar mocks de fases para los otros eventos `creado`/`en-curso` (evt-002 … evt-012)
  - O conectar a backend real
- [ ] **Estado del evento vs estado de la fase** — son dos cosas distintas. Hoy:
  - El badge superior usa el `status` del evento.
  - El dot del tab usa `phase.estado` (`active` / `pending` / `done`).
  - Validar con el equipo si la regla "evento Terminado → todas las fases done" debe forzarse.
- [ ] **Accesibilidad**: los tabs son `role="tablist"` pero falta `aria-controls`/`aria-selected` y manejo de `←/→` con teclado.
- [ ] **Mobile**: el state-picker se monta encima del footer flotante en < 900px. Mover a un toggle o esconder en mobile.
- [ ] **Versionar el DS** — el shell carga `naowee-design-system@v1.8.0`. Si la PR del badge `--informative--quiet` (azul Publicado) se mergeo en una v1.9.x, bumpear acá.

---

## Cómo correr local

```bash
# Desde el repo del shell
cd /ruta/a/naowee-test-sidebar-shell
python3 -m http.server 4700
# o cualquier static server en el puerto que prefieras

open "http://localhost:4700/perfil.html?role=ROOT&active=eventos-lista"
```

Eventos `creado` / `en-curso` (clickables): `evt-001` a `evt-012` aprox.
Eventos `finalizado` / `cancelado` (read-only en lista): `evt-013` a `evt-020`.

---

## Decisiones de diseño tomadas

1. **Solo `creado` y `en-curso` abren el detalle**. Razonado por el usuario en sesión: la pantalla "Master SUID" es para eventos en gestión, no para histórico. Los `finalizado`/`cancelado` se mantienen visibles en lista pero no son openables.
2. **`Terminado` se mapea desde `finalizado`**. La data del backend usa `finalizado`; el badge SUID dice `Terminado`. El mapeo está en `evento-detalle.js`:
   ```js
   const badgeState = initialState === 'finalizado' ? 'terminado' : initialState;
   ```
3. **`EVENTS` exportado desde `event-list.js`** para evitar duplicar datos en `evento-detalle.js`. Una sola fuente de verdad de mocks. Cuando esto entre a Angular, ambos consumirán el mismo service.
4. **Dev state-picker como `position: fixed`** — fuera del flujo del documento para no romper el layout pero accesible siempre durante QA.
5. **Sin `naowee-tabs` del DS** para los tabs de fase. La razón: necesitábamos el dot de estado a la derecha del label, y `naowee-tab__badge` está pensado como contador (texto). Implementé `.evd-phase-tab` ad-hoc que sí matchea el comp visual del Figma. Cuando el DS soporte `naowee-tab__dot`, migrar.

---

## Branch / PR

- Branch: `feat/evento-detalle-figma-layout`
- Base: `main` (o la que corresponda — verificar antes del PR)
- PR title: `feat(perfil): detalle de evento (Master SUID) + estados Publicado/Terminado`

---

## Contacto / handoff

- Mantenedor original: **Doug Vargas** (UX/UI Engineer)
- Reviewer sugerido: **Juan Manuel** (`juanMaAV92`) — repos `naowee-tech/*`
- Si rebotás algo del DS oficial: PR en `naowee-tech/naowee-design-system`
