import { NavLink } from 'react-router-dom'
import { useNavReset } from '../context/NavResetContext'

/**
 * Barra de navegación inferior — cápsula oscura sólida.
 * Activo: círculo claro envolviendo el icono (claymorphism).
 * Sin labels. Sin glassmorphism.
 */

const seccionesLateral = [
  { ruta: '/habitos',    icono: IconoHabitos   },
  { ruta: '/ejercicios', icono: IconoMancuerna },
  { ruta: '/nutricion',  icono: IconoNutricion },
  { ruta: '/ajustes',    icono: IconoAjustes   },
]

export default function NavBar() {
  const { resetSeccion } = useNavReset()

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        padding: '0 16px 16px',
        paddingBottom: 'max(16px, calc(10px + env(safe-area-inset-bottom, 0px)))',
        pointerEvents: 'none',
        zIndex: 100,
      }}
    >
      <nav
        style={{
          height: '64px',
          /* Fondo oscuro sólido — idéntico en claro y oscuro */
          backgroundColor: '#0A1929',
          borderRadius: '40px',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.40), 0 2px 8px rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          pointerEvents: 'auto',
        }}
      >
        {/* Hábitos + Ejercicios */}
        {seccionesLateral.slice(0, 2).map(({ ruta, icono: Icono }) => (
          <NavLink
            key={ruta}
            to={ruta}
            onClick={() => resetSeccion(ruta)}
            style={({ isActive }) => ({
              flex: 1,
              display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              padding: '10px',
              textDecoration: 'none',
            })}
          >
            {({ isActive }) => (
              <div style={{
                width: '40px', height: '40px',
                borderRadius: '50%',
                backgroundColor: isActive ? 'rgba(255,255,255,0.16)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.38)',
                transition: 'background-color 0.2s, color 0.2s',
              }}>
                <Icono activo={isActive} />
              </div>
            )}
          </NavLink>
        ))}

        {/* Diario — botón central */}
        <NavLink
          to="/diario"
          onClick={() => resetSeccion('/diario')}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', textDecoration: 'none' }}
        >
          {({ isActive }) => (
            <div style={{
              width: '46px', height: '46px',
              borderRadius: '50%',
              background: isActive
                ? 'linear-gradient(160deg, #00FFFF 0%, #00C0E0 100%)'
                : 'rgba(255,255,255,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: isActive ? '#0A1929' : 'rgba(255,255,255,0.55)',
              boxShadow: isActive ? '0 3px 14px rgba(0,200,220,0.50)' : 'none',
              transition: 'background 0.2s, box-shadow 0.2s, color 0.2s',
            }}>
              <IconoDiario activo={isActive} />
            </div>
          )}
        </NavLink>

        {/* Nutrición + Ajustes */}
        {seccionesLateral.slice(2).map(({ ruta, icono: Icono }) => (
          <NavLink
            key={ruta}
            to={ruta}
            onClick={() => resetSeccion(ruta)}
            style={({ isActive }) => ({
              flex: 1,
              display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              padding: '10px',
              textDecoration: 'none',
            })}
          >
            {({ isActive }) => (
              <div style={{
                width: '40px', height: '40px',
                borderRadius: '50%',
                backgroundColor: isActive ? 'rgba(255,255,255,0.16)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.38)',
                transition: 'background-color 0.2s, color 0.2s',
              }}>
                <Icono activo={isActive} />
              </div>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

/* ============================================================
   ICONOS ORIGINALES — Solo se modifican color y filtros
   ============================================================ */

function IconoMancuerna() {
  return (
    <svg width="24" height="24" viewBox="0 -960 960 960" fill="currentColor">
      <path d="m826-585-56-56 30-31-128-128-31 30-57-57 30-31q23-23 57-22.5t57 23.5l129 129q23 23 23 56.5T857-615l-31 30ZM346-104q-23 23-56.5 23T233-104L104-233q-23-23-23-56.5t23-56.5l30-30 57 57-31 30 129 129 30-31 57 57-30 30Zm397-336 57-57-303-303-57 57 303 303ZM463-160l57-58-302-302-58 57 303 303Zm-6-234 110-109-64-64-109 110 63 63Zm63 290q-23 23-57 23t-57-23L104-406q-23-23-23-57t23-57l57-57q23-23 56.5-23t56.5 23l63 63 110-110-63-62q-23-23-23-57t23-57l57-57q23-23 56.5-23t56.5 23l303 303q23 23 23 56.5T857-441l-57 57q-23 23-57 23t-57-23l-62-63-110 110 63 63q23 23 23 56.5T577-161l-57 57Z"/>
    </svg>
  )
}

function IconoNutricion() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z"/>
    </svg>
  )
}

function IconoHabitos() {
  return (
    <svg width="24" height="24" viewBox="0 -960 960 960" fill="currentColor">
      <path d="m424-296 282-282-56-56-226 226-114-114-56 56 170 170Zm56 216q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
    </svg>
  )
}

function IconoAjustes() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function IconoDiario({ activo }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={activo ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
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
