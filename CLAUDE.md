# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Diario de Entrenamiento** is a personal training diary app for tracking exercises, sessions, and progress. It's a PWA built with React + Vite, styled with Tailwind CSS v4, and uses Dexie.js (IndexedDB) with optional cloud sync via Dexie Cloud.

**Key features:**
- CRUD management for exercises, sessions, daily logs, and weight tracking
- Cross-device data synchronization with Dexie Cloud (optional login)
- Offline-first PWA with service worker precaching
- Mobile-friendly UI with fixed bottom navbar (iOS safe areas supported)
- All UI text and code in Spanish

## Quick Start

```bash
# Install dependencies (Node v24+ required, managed via nvm in ~/.nvm)
npm install

# Start dev server (accessible via localhost:5173 from Chrome on Windows/WSL2)
npm run dev

# Build for production (deploys to GitHub Pages at /training-diary/ subpath)
npm run build

# Preview production build locally
npm run preview

# Lint code
npm run lint
```

## Tech Stack

- **React 19** + **Vite 7** (with HMR)
- **Tailwind CSS v4** (@tailwindcss/vite plugin, no tailwind.config.js)
- **Dexie v4** (IndexedDB ORM) + **dexie-cloud-addon** for sync
- **React Router v7** (HashRouter for GitHub Pages)
- **vite-plugin-pwa** (Workbox, service worker, offline support)

## Directory Structure

```
src/
├── App.jsx                           # Router setup + layout
├── main.jsx                          # React entry point
├── index.css                         # Global styles + Tailwind import + CSS variables
├── db/database.js                    # Dexie schema, GRUPOS_MUSCULARES constants
├── components/
│   └── NavBar.jsx                    # Fixed bottom navbar + Sync button panel
└── modules/
    ├── ejercicios/                   # Exercise CRUD
    │   ├── useEjercicios.js          # Hook: crear/actualizar/eliminar exercises
    │   ├── PaginaEjercicios.jsx      # Page controller (lista/detalle/formulario states)
    │   ├── ListaEjercicios.jsx       # Exercise list with search + group filter
    │   ├── DetalleEjercicio.jsx      # Exercise detail view + inline delete
    │   ├── FormularioEjercicio.jsx   # Create/edit form + substitute selector
    │   └── coloresGrupo.js           # COLORES_GRUPO constants + capitalizarGrupo()
    │
    ├── sesiones/                     # Session CRUD
    │   ├── useSesiones.js            # Hook: CRUD operations
    │   ├── PaginaSesiones.jsx        # Page controller
    │   ├── ListaSesiones.jsx         # Session list
    │   ├── DetalleSesion.jsx         # Session detail
    │   └── FormularioSesion.jsx      # Create/edit form with exercise ordering
    │
    ├── diario/                       # Daily log + automatic weight sync
    │   ├── useDiario.js              # Hook: CRUD + auto-sync to registro when peso > 0
    │   ├── PaginaDiario.jsx          # Page controller
    │   ├── CalendarioDiario.jsx      # Month grid calendar with day markers
    │   ├── DetalleDia.jsx            # Daily log view
    │   └── FormularioDia.jsx         # Create/edit with session selector + weight suggestions
    │
    └── registro/                     # Weight/performance tracking
        ├── useRegistro.js            # Hook: CRUD + ultimoPorEjercicio() + registrosPorEjercicio()
        ├── PaginaRegistro.jsx        # Page controller
        ├── ListaRegistro.jsx         # Exercises with latest weight + quick-add
        └── HistorialEjercicio.jsx    # CSS bar chart of last 10 entries + inline add form
```

## Architecture & Key Patterns

### Module Structure

Each major feature is a **module** in `src/modules/{nombre}/`. Modules follow this pattern:

1. **Hook** (`use{Nombre}.js`) — Encapsulates Dexie CRUD + state management
   - Exports: `{ datos, cargando, error, crear, actualizar, eliminar, ...custom }`
   - Auto-reloads list after write operations
   - Handles transactions for complex deletes (e.g., cleaning up references)

2. **Page** (`Pagina{Nombre}.jsx`) — Navigation controller
   - Manages screen state: `'lista' | 'detalle' | 'formulario'`
   - Uses module hook + local state for active item
   - Passes callbacks down to subcomponents
   - Returns JSX wrapped in `<div className="contenido-principal">`

3. **Subcomponents** — Single responsibility views
   - `Lista{Nombre}.jsx` — List view, search, filters
   - `Detalle{Nombre}.jsx` — Single item view, actions
   - `Formulario{Nombre}.jsx` — Create/edit form

### Navigation Patterns

Routes are defined in `App.jsx`. HashRouter is used (for GitHub Pages subpath `/training-diary/`).

**Page order in navbar:** Diario | Ejercicios | Sesiones | Registro | Sync

**Default route:** `/` → redirects to `/diario`

### State Management

- **Hooks for DB state** — Each module has a `use{Nombre}` hook that manages Dexie calls
- **Local component state** — Screens, form data, UI state
- **No global context** — Simple, clear data flow

### Data Dependencies

Cross-module dependencies exist (documented in hooks):
- `PaginaDiario` imports: useEjercicios, useSesiones, useDiario, useRegistro
- `PaginaSesiones` imports: useEjercicios, useSesiones
- `PaginaRegistro` imports: useEjercicios, useRegistro

## Database Schema (Dexie v4)

```javascript
db.version(3).stores({
  ejercicios: '@id, nombre, *gruposMuscular',  // UUID + multi-entry index for groups
  sesiones:   '@id, nombre',
  diario:     '@id, fecha, sesionId',
  registro:   '@id, ejercicioId, fecha',
})
```

### Table Details

**ejercicios** (v3 with UUID):
```javascript
{
  id,                    // @id (UUID)
  nombre,                // string, indexed
  gruposMuscular,        // array of strings from GRUPOS_MUSCULARES
  grupoPrincipal,        // string (icon/color representative)
  series,                // number
  repeticiones,          // string (e.g., "8-12")
  ejecucion,             // string (notes)
  sustitutos,            // array of exercise IDs
}
```

**sesiones**:
```javascript
{
  id,           // @id (UUID)
  nombre,       // string
  descripcion,  // string (optional)
  ejercicios: [
    { ejercicioId, orden, series, repeticiones },
    ...
  ]
}
```

**diario**:
```javascript
{
  id,        // @id (UUID)
  fecha,     // YYYY-MM-DD string, indexed
  sesionId,  // reference to sesiones.id
  notas,     // string (optional)
}
```

**registro** (auto-synced from diario when peso > 0):
```javascript
{
  id,          // @id (UUID)
  ejercicioId, // reference to ejercicios.id
  fecha,       // YYYY-MM-DD string
  peso,        // number
  unidad,      // 'kg' | 'lb'
}
```

**Schema versions:**
- v1: Original `grupoMuscular` as string
- v2: Upgrade to `gruposMuscular` array with multi-entry index
- v3: Switch to `@id` (UUID) from `++id` for cloud sync support

## Styling & Design

- **CSS Framework:** Tailwind CSS v4 (via @tailwindcss/vite plugin)
- **No tailwind.config.js** — Config via CSS variables in `:root`
- **Color scheme:** Dark mode by default, orange accent (#f97316)
- **CSS custom properties:**
  ```css
  :root {
    --altura-navbar: 70px;
    --color-primary: #f97316;     /* orange accent */
    --color-bg: #0f0f0f;          /* dark bg */
    --color-border: #2e2e2e;      /* borders */
    --safe-area-bottom: env(safe-area-inset-bottom);
  }
  ```
- **Layout:** `.contenido-principal` class handles scroll area + navbar padding

**iOS Support:**
- `viewport-fit=cover` for notch handling
- `safe-area-inset-*` for iPhone home indicator
- App icon 192px & 512px in `/public/icons/`

## PWA & Offline

**vite-plugin-pwa** configuration:
- **Service Worker:** Enabled in dev (`devOptions.enabled: true`) for offline testing
- **Precache:** All `.js`, `.css`, `.html`, `.png`, `.svg`, `.woff2` files
- **Runtime caching:** Google Fonts (CacheFirst, 1-year expiration)
- **Manifest:** `display: standalone`, `orientation: portrait`, all icons defined
- **GitHub Pages:** Base path `/training-diary/`, scope/start_url adjusted for production

Build output includes `sw.js` (service worker) + `manifest.webmanifest`.

## Key Conventions

### Naming
- **PascalCase** for components
- **camelCase** for functions, variables, hooks
- **SCREAMING_SNAKE_CASE** for constants
- **All Spanish** — variables, comments, UI text

### Color System
Module `src/modules/ejercicios/coloresGrupo.js` exports `COLORES_GRUPO`:
```javascript
COLORES_GRUPO = {
  pecho:   { bg: '...', border: '...', text: '...', emoji: '🤸' },
  espalda: { ... },
  // etc.
}
```
Used in list filters and exercise cards for visual grouping.

### Forms
- Controlled inputs with `useState`
- Inline validation (no separate validation library)
- Submit on Enter key where appropriate
- Cancel returns to previous view (not always list)

### Hooks Pattern
All hooks follow this shape:
```javascript
export function use{Nombre}() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => { /* ... */ }, [])
  const create = useCallback(async (data) => { /* ... */ }, [load])
  const update = useCallback(async (id, data) => { /* ... */ }, [load])
  const delete = useCallback(async (id) => { /* ... */ }, [load])

  useEffect(() => { load() }, [load])
  return { data, loading, error, create, update, delete }
}
```

## Dexie Cloud Integration

**Setup:**
- Dexie Cloud URL injected as `VITE_DEXIE_URL` environment variable (not hardcoded)
- `requireAuth: false` — App works offline; sync requires optional login
- `db.cloud.currentUser.subscribe()` and `db.cloud.syncState.subscribe()` for UI reactivity

**Sync flow:**
- Email + OTP login in NavBar's Sync panel
- `db.cloud.login({ email, grant_type: 'otp', otp })`
- `db.cloud.logout()` to sign out
- State visible in navbar (green dot = synced, orange dot = syncing, gray = offline)

**Important:** Local data (with `++id`) won't sync to cloud. New records get `@id` UUIDs automatically.

## Common Development Tasks

### Add a new field to an exercise
1. Update `src/modules/ejercicios/useEjercicios.js` — `crear()` and `actualizar()` handle the field
2. Update `src/modules/ejercicios/FormularioEjercicio.jsx` — add input for the field
3. Update `src/modules/ejercicios/DetalleEjercicio.jsx` — display the field
4. No DB migration needed if you're just adding a field (Dexie is schemaless for non-indexed fields)

### Add a new muscle group
1. Add string to `GRUPOS_MUSCULARES` in `src/db/database.js`
2. Add color definition to `COLORES_GRUPO` in `src/modules/ejercicios/coloresGrupo.js`
3. No schema change needed (already uses `*gruposMuscular` multi-entry index)

### Create a new module
1. Create `src/modules/{nombre}/`
2. Add `use{Nombre}.js` hook with CRUD operations
3. Add `Pagina{Nombre}.jsx` page controller
4. Add list/detail/form subcomponents
5. Add route in `App.jsx`
6. Add NavLink in `NavBar.jsx`
7. Implement navigation state machine in page component

### Modify Dexie schema
1. Add new `db.version(N)` block in `src/db/database.js`
2. If renaming/restructuring data, write `.upgrade()` transaction
3. Old versions coexist in code; Dexie handles migration on first run
4. Test with a fresh IndexedDB (clear browser storage)

## Testing & Debugging

- **Browser DevTools:** Open to inspect IndexedDB (Application > Storage > IndexedDB)
- **Service Worker:** Check in Application > Service Workers
- **Offline mode:** DevTools > Network > Offline checkbox
- **ESLint:** `npm run lint` (basic rules, no TypeScript)

## Build & Deployment

- **GitHub Pages:** Deployed to `https://username.github.io/training-diary/`
- **Base path:** Set to `/training-diary/` in production via `vite.config.js`
- **PWA:** Manifests & SW auto-generated by Workbox
- **Icons:** Must be in `/public/icons/` (referenced in manifest)

## Important Notes

1. **No test framework** currently; focus on manual testing + UI validation
2. **Dexie Cloud is optional** — app is fully functional offline
3. **GitHub Pages compatibility** — uses HashRouter (routes as hash fragments)
4. **iOS safe areas** — navbar respects `env(safe-area-inset-bottom)`
5. **Single responsibility modules** — avoid cross-module state mutations
6. **Transactions for integrity** — use `db.transaction()` for multi-table updates (see delete in useEjercicios)
