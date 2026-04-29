# naowee-test-sidebar-shell

> Spec visual del **sidebar / shell** del portal Naowee (`suite-web-v2`).
>
> Aplica el patrón validado de [`naowee-test-incentivos`](https://github.com/naowee-tech/naowee-test-incentivos)
> al sidebar del portal: colapso suave Apple-style, fade escalonado de labels, hover/active
> como cuadrado del icono y barra naranja con animación de entrada.
>
> Esta es **spec visual mantenida por UX/UI**, no la implementación final del componente.
> El código real vive en [`@naowee-tech/suite-web-components`](https://github.com/naowee-tech/suite-web-components).

🌐 **Demo:** https://naowee-tech.github.io/naowee-test-sidebar-shell/

## Qué muestra

- **Selector de perfil** (`index.html`): tarjeta por cada rol del portal.
- **Vista por rol** (`perfil.html?role=...`): el sidebar real renderizado para ese rol,
  con la jerarquía de items que define la matriz oficial.

## Roles incluidos

| Código | Label |
|---|---|
| `ROOT` | Super Admin |
| `ADMIN` | Admin |
| `USER_MANAGER` | Gestor de usuarios |
| `EVENT_MANAGER` | Gestor de eventos |
| `EVENT_COORDINATOR` | Coordinador de competencias |
| `DIGITIZER` | Digitador |
| `DOCUMENTATION_MANAGER` | Gestor de documentos |
| `ATHLETE` | Deportista |
| `LEGAL_GUARDIAN` | Acudiente legal |
| `ORGANIZATION_MANAGER` | Gestor de organización |
| `SUPPORT_STAFF` | Operador (soporte) |
| `VENUE_SURVEYOR` | Levantador de escenarios |
| `VENUE_INSPECTOR` | Inspector de escenarios |

## Fuente de verdad

La estructura del menú por rol viene de:

📄 [`docs/architecture/role-menu-matrix.md`](https://github.com/naowee-tech/suite-web-v2/blob/develop/docs/architecture/role-menu-matrix.md) — en `suite-web-v2`.

Cualquier cambio en la matriz oficial se refleja acá actualizando `shared/menu-data.js`.

## Patrón visual aplicado

1. **Easing Apple-style** `cubic-bezier(.32, .72, 0, 1)` en 360ms para el ancho del sidebar
2. **Labels con fade escalonado**:
   - Al colapsar → opacity primero (140ms), luego ancho (300ms)
   - Al expandir → ancho primero (360ms), opacity con delay 180ms
3. **Hover/active en colapsado** = cuadrado 40×40 (radius 8px) vía `::before`, no full-width
4. **Barra naranja vertical** solo en expandido, animación de entrada `cubic-bezier(.16, 1, .3, 1)` 420ms
5. **Sub-items expandibles** con max-height transition

## Estructura

```
.
├── index.html              ← landing con selector de perfil
├── perfil.html             ← shell con sidebar dinámico (?role=...)
├── shared/
│   ├── tokens.css          ← design tokens Naowee
│   ├── shell.css           ← patrón sidebar completo
│   ├── menu-data.js        ← items por rol según matriz
│   └── sidebar.js          ← render dinámico + interacciones
└── README.md
```

## Cómo correr localmente

```bash
# Cualquier servidor estático
python3 -m http.server 8000
# o
npx serve .
```

Después abrir http://localhost:8000.

## Cómo agregar un rol nuevo

1. Editar `shared/menu-data.js`:
   - Agregar entry en `ROLES = { ... }`
   - Agregar entry en `MENU_BY_ROLE = { ... }` con su composición de secciones
2. Editar `index.html`:
   - Agregar el código del rol al array `order`
3. Commit + push — GitHub Pages re-deploy automático

## Repos relacionados

| Repo | Rol |
|---|---|
| [`suite-web-v2`](https://github.com/naowee-tech/suite-web-v2) | Portal Angular real (host de microfrontends) |
| [`suite-web-components`](https://github.com/naowee-tech/suite-web-components) | Componentes del DS — ahí vive `NsSidebarComponent` |
| [`suite-web-foundations`](https://github.com/naowee-tech/suite-web-foundations) | Tokens del DS |
| [`naowee-test-incentivos`](https://github.com/naowee-tech/naowee-test-incentivos) | De donde viene el patrón visual de sidebar |
| [`naowee-design-system`](https://github.com/naowee-tech/naowee-design-system) | Design system Naowee |

## Mantenedor

[@douguizard](https://github.com/douguizard) — UX/UI Engineer · Naowee.

Si trabajás en el DS y vas a portar este patrón al `NsSidebarComponent`, validá contra esta demo.
