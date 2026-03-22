import { NavLink, useNavigate } from 'react-router-dom'
import { useNavReset } from '../context/NavResetContext'

/**
 * Barra de navegación inferior fija estilo app nativa móvil.
 * Al pulsar cualquier icono: navega a la sección Y resetea su estado interno
 * (cancela ediciones en curso y vuelve a la vista por defecto).
 */

const seccionesLateral = [
  { ruta: '/suplementos', icono: IconoSuplemento },
  { ruta: '/ejercicios',  icono: IconoMancuerna  },
  { ruta: '/nutricion',   icono: IconoNutricion  },
  { ruta: '/ajustes',     icono: IconoAjustes    },
]

export default function NavBar() {
  const navigate = useNavigate()
  const { resetSeccion } = useNavReset()

  function handleNav(ruta) {
    resetSeccion(ruta)
    navigate(ruta)
  }

  return (
    <>
      <nav
        style={{
          position: 'absolute',
          bottom: 'calc(env(safe-area-inset-bottom) + 16px)',
          left: '16px',
          right: '16px',
          height: '64px',
          backgroundColor: 'var(--navbar-bg)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderRadius: '40px',
          border: '1px solid var(--navbar-borde)',
          boxShadow: 'var(--navbar-sombra)',
          display: 'flex',
          alignItems: 'center',
          zIndex: 100,
        }}
      >
        {/* Suplementos + Ejercicios */}
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
              color: isActive ? '#f97316' : 'var(--color-texto-secundario)',
              transition: 'color 0.15s',
            })}
          >
            <Icono />
          </NavLink>
        ))}

        {/* Diario — botón central destacado */}
        <NavLink
          to="/diario"
          onClick={() => resetSeccion('/diario')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            padding: '8px',
            textDecoration: 'none',
          }}
        >
          {({ isActive }) => (
            <div style={{
              width: '48px', height: '48px',
              borderRadius: '50%',
              backgroundColor: isActive ? '#ea6c10' : '#f97316',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white',
              boxShadow: '0 2px 14px rgba(249,115,22,0.5)',
              transition: 'background-color 0.15s',
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
              color: isActive ? '#f97316' : 'var(--color-texto-secundario)',
              transition: 'color 0.15s',
            })}
          >
            <Icono />
          </NavLink>
        ))}
      </nav>
    </>
  )
}

// — Iconos SVG —

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

function IconoSuplemento() {
  return (
    <svg width="24" height="24" viewBox="0 -960 960 960" fill="currentColor">
      <path d="M345-120q-94 0-159.5-65.5T120-345q0-45 17-86t49-73l270-270q32-32 73-49t86-17q94 0 159.5 65.5T840-615q0 45-17 86t-49 73L504-186q-32 32-73 49t-86 17Zm266-286 107-106q20-20 31-47t11-56q0-60-42.5-102.5T615-760q-29 0-56 11t-47 31L406-611l205 205ZM345-200q29 0 56-11t47-31l106-107-205-205-107 106q-20 20-31 47t-11 56q0 60 42.5 102.5T345-200Z"/>
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

