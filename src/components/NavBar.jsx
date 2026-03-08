import { NavLink } from 'react-router-dom'

/**
 * Barra de navegación inferior fija estilo app nativa móvil.
 * Respeta el safe area del iPhone (home indicator).
 * La sección activa se resalta en color naranja (#f97316).
 */

// Definición de las secciones de la app
const secciones = [
  {
    ruta: '/diario',
    etiqueta: 'Diario',
    icono: IconoDiario,
  },
  {
    ruta: '/ejercicios',
    etiqueta: 'Ejercicios',
    icono: IconoEjercicios,
  },
  {
    ruta: '/sesiones',
    etiqueta: 'Sesiones',
    icono: IconoSesiones,
  },
  {
    ruta: '/registro',
    etiqueta: 'Registro',
    icono: IconoRegistro,
  },
]

export default function NavBar() {
  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        // Altura fija más el safe area del iPhone
        paddingBottom: 'env(safe-area-inset-bottom)',
        backgroundColor: '#111111',
        borderTop: '1px solid #2e2e2e',
        display: 'flex',
        zIndex: 100,
      }}
    >
      {secciones.map(({ ruta, etiqueta, icono: Icono }) => (
        <NavLink
          key={ruta}
          to={ruta}
          style={({ isActive }) => ({
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            padding: '10px 4px',
            textDecoration: 'none',
            color: isActive ? '#f97316' : '#6b7280',
            transition: 'color 0.15s',
          })}
        >
          {({ isActive }) => (
            <>
              <Icono activo={isActive} />
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: isActive ? '600' : '400',
                  letterSpacing: '0.01em',
                }}
              >
                {etiqueta}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

// --- Iconos SVG inline ---

function IconoEjercicios({ activo }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={activo ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      {/* Icono de mancuerna */}
      <path d="M6 4v16" />
      <path d="M18 4v16" />
      <path d="M3 8h3M18 8h3M3 16h3M18 16h3" />
      <line x1="6" y1="12" x2="18" y2="12" />
    </svg>
  )
}

function IconoSesiones({ activo }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={activo ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      {/* Icono de lista con check */}
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M7 8h10M7 12h10M7 16h6" />
    </svg>
  )
}

function IconoDiario({ activo }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={activo ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      {/* Icono de calendario */}
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <circle cx="8" cy="14" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="14" r="1" fill="currentColor" stroke="none" />
      <circle cx="16" cy="14" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function IconoRegistro({ activo }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={activo ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      {/* Icono de gráfico de barras (progreso) */}
      <line x1="3" y1="20" x2="21" y2="20" />
      <rect x="4" y="13" width="4" height="7" rx="1" />
      <rect x="10" y="8" width="4" height="12" rx="1" />
      <rect x="16" y="4" width="4" height="16" rx="1" />
    </svg>
  )
}
