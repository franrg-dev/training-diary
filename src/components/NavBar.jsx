import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import db from '../db/database'

/**
 * Barra de navegación inferior fija estilo app nativa móvil.
 * Incluye las 4 secciones principales + botón de sincronización con Dexie Cloud.
 */

const seccionesLateral = [
  { ruta: '/suplementos', icono: IconoSuplemento },
  { ruta: '/ejercicios',  icono: IconoMancuerna  },
  { ruta: '/nutricion',   icono: IconoNutricion  },
]

export default function NavBar() {
  return (
    <>
      <nav
        style={{
          position: 'fixed',
          bottom: 'calc(env(safe-area-inset-bottom) + 12px)',
          left: '16px',
          right: '16px',
          height: '64px',
          backgroundColor: '#1a1a1a',
          borderRadius: '40px',
          border: '1px solid #2e2e2e',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          zIndex: 100,
        }}
      >
        {/* Ejercicios + Sesiones */}
        {seccionesLateral.slice(0, 2).map(({ ruta, icono: Icono }) => (
          <NavLink
            key={ruta}
            to={ruta}
            style={({ isActive }) => ({
              flex: 1,
              display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              padding: '10px',
              textDecoration: 'none',
              color: isActive ? '#f97316' : '#6b7280',
              transition: 'color 0.15s',
            })}
          >
            <Icono />
          </NavLink>
        ))}

        {/* Diario — botón central destacado */}
        <NavLink
          to="/diario"
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

        {/* Registro */}
        {seccionesLateral.slice(2).map(({ ruta, icono: Icono }) => (
          <NavLink
            key={ruta}
            to={ruta}
            style={({ isActive }) => ({
              flex: 1,
              display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              padding: '10px',
              textDecoration: 'none',
              color: isActive ? '#f97316' : '#6b7280',
              transition: 'color 0.15s',
            })}
          >
            <Icono />
          </NavLink>
        ))}

        {/* Botón de sincronización — 5ª pestaña */}
        <BotonSync />
      </nav>
    </>
  )
}

// — Botón sync + panel —

function BotonSync() {
  const [usuario, setUsuario]     = useState(null)
  const [syncState, setSyncState] = useState(null)
  const [abierto, setAbierto]     = useState(false)
  const [email, setEmail]         = useState('')
  const [otp, setOtp]             = useState('')
  const [paso, setPaso]           = useState('email')
  const [enviando, setEnviando]   = useState(false)
  const [error, setError]         = useState(null)

  useEffect(() => {
    const subUser = db.cloud.currentUser.subscribe(u => setUsuario(u))
    const subSync = db.cloud.syncState.subscribe(s => setSyncState(s))
    return () => { subUser.unsubscribe(); subSync.unsubscribe() }
  }, [])

  const estaLogueado  = usuario?.isLoggedIn === true
  const sincronizando = syncState?.phase === 'pushing' || syncState?.phase === 'pulling'
  const colorNube     = sincronizando ? '#f97316' : estaLogueado ? '#22c55e' : '#6b7280'

  async function handleEnviarEmail() {
    if (!email.trim()) return
    setEnviando(true); setError(null)
    try {
      await db.cloud.login({ email: email.trim(), grant_type: 'otp' })
      setPaso('otp')
    } catch {
      setError('Error al enviar el código. Comprueba el email.')
    } finally { setEnviando(false) }
  }

  async function handleVerificarOtp() {
    if (!otp.trim()) return
    setEnviando(true); setError(null)
    try {
      await db.cloud.login({ email: email.trim(), grant_type: 'otp', otp: otp.trim() })
      setAbierto(false); setPaso('email'); setEmail(''); setOtp('')
    } catch {
      setError('Código incorrecto o expirado.')
    } finally { setEnviando(false) }
  }

  async function handleLogout() {
    await db.cloud.logout()
    setAbierto(false)
  }

  function cerrar() {
    setAbierto(false); setError(null)
  }

  return (
    <>
      {/* Pestaña sync en la navbar */}
      <button
        onClick={() => setAbierto(o => !o)}
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          padding: '10px',
          background: 'none', border: 'none',
          color: abierto ? '#f97316' : colorNube,
          cursor: 'pointer', transition: 'color 0.15s',
        }}
      >
        <IconoCloud sincronizando={sincronizando} />
      </button>

      {/* Overlay + panel */}
      {abierto && (
        <>
          <div
            onClick={cerrar}
            style={{ position: 'fixed', inset: 0, zIndex: 300, backgroundColor: 'rgba(0,0,0,0.5)' }}
          />
          <div style={{
            position: 'fixed',
            bottom: 'calc(var(--altura-navbar) + env(safe-area-inset-bottom) + 8px)',
            left: '16px', right: '16px',
            zIndex: 400,
            backgroundColor: '#1a1a1a',
            border: '1px solid #2e2e2e',
            borderRadius: '16px',
            padding: '20px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#f5f5f5' }}>
                Sincronización
              </h3>
              <button onClick={cerrar} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '20px', padding: 0, lineHeight: 1 }}>×</button>
            </div>

            {estaLogueado ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', backgroundColor: '#242424', borderRadius: '10px', marginBottom: '16px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: sincronizando ? '#f97316' : '#22c55e', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: '0 0 2px', fontSize: '13px', color: '#f5f5f5', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {usuario.email}
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                      {sincronizando ? 'Sincronizando…' : 'Sincronizado'}
                    </p>
                  </div>
                </div>
                <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#6b7280', lineHeight: '1.5' }}>
                  Los datos se sincronizan automáticamente entre todos tus dispositivos.
                </p>
                <button
                  onClick={handleLogout}
                  style={{ width: '100%', padding: '11px', backgroundColor: 'transparent', border: '1px solid #dc262644', borderRadius: '10px', color: '#f87171', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <div>
                <p style={{ margin: '0 0 16px', fontSize: '14px', color: '#a1a1a1', lineHeight: '1.6' }}>
                  Inicia sesión para sincronizar tus datos entre iPhone y ordenador. Recibirás un código por email.
                </p>
                {paso === 'email' ? (
                  <>
                    <input
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError(null) }}
                      onKeyDown={e => e.key === 'Enter' && handleEnviarEmail()}
                      style={estiloInput}
                      autoFocus
                    />
                    {error && <p style={{ margin: '6px 0 0', color: '#f87171', fontSize: '13px' }}>{error}</p>}
                    <button
                      onClick={handleEnviarEmail}
                      disabled={!email.trim() || enviando}
                      style={{ ...estiloBotonPrimario, marginTop: '10px', opacity: (!email.trim() || enviando) ? 0.5 : 1 }}
                    >
                      {enviando ? 'Enviando…' : 'Enviar código'}
                    </button>
                  </>
                ) : (
                  <>
                    <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#6b7280' }}>
                      Código enviado a <strong style={{ color: '#f5f5f5' }}>{email}</strong>
                    </p>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Código OTP"
                      value={otp}
                      onChange={e => { setOtp(e.target.value); setError(null) }}
                      onKeyDown={e => e.key === 'Enter' && handleVerificarOtp()}
                      style={{ ...estiloInput, textAlign: 'center', letterSpacing: '0.15em', fontSize: '18px' }}
                      autoFocus
                    />
                    {error && <p style={{ margin: '6px 0 0', color: '#f87171', fontSize: '13px' }}>{error}</p>}
                    <button
                      onClick={handleVerificarOtp}
                      disabled={!otp.trim() || enviando}
                      style={{ ...estiloBotonPrimario, marginTop: '10px', opacity: (!otp.trim() || enviando) ? 0.5 : 1 }}
                    >
                      {enviando ? 'Verificando…' : 'Entrar'}
                    </button>
                    <button
                      onClick={() => { setPaso('email'); setOtp(''); setError(null) }}
                      style={{ width: '100%', padding: '10px', marginTop: '8px', backgroundColor: 'transparent', border: 'none', color: '#6b7280', fontSize: '13px', cursor: 'pointer' }}
                    >
                      Cambiar email
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </>
      )}
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

function IconoCloud({ sincronizando }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {sincronizando
        ? <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        : <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
      }
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


const estiloInput = {
  width: '100%', padding: '12px',
  backgroundColor: '#242424', border: '1px solid #2e2e2e',
  borderRadius: '10px', color: '#f5f5f5',
  fontSize: '15px', outline: 'none', fontFamily: 'inherit',
}

const estiloBotonPrimario = {
  width: '100%', padding: '12px',
  backgroundColor: '#f97316', border: 'none',
  borderRadius: '10px', color: '#fff',
  fontSize: '15px', fontWeight: '600', cursor: 'pointer',
}
