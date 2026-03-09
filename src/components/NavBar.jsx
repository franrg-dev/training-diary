import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import db from '../db/database'

/**
 * Barra de navegación inferior fija estilo app nativa móvil.
 * Incluye las 4 secciones principales + botón de sincronización con Dexie Cloud.
 */

const secciones = [
  { ruta: '/diario',    etiqueta: 'Diario',     icono: IconoDiario    },
  { ruta: '/ejercicios', etiqueta: 'Ejercicios', icono: IconoEjercicios },
  { ruta: '/sesiones',  etiqueta: 'Sesiones',   icono: IconoSesiones  },
  { ruta: '/registro',  etiqueta: 'Registro',   icono: IconoRegistro  },
]

export default function NavBar() {
  return (
    <>
      <nav
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
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
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: '3px', padding: '10px 4px',
              textDecoration: 'none',
              color: isActive ? '#f97316' : '#6b7280',
              transition: 'color 0.15s',
            })}
          >
            {({ isActive }) => (
              <>
                <Icono activo={isActive} />
                <span style={{ fontSize: '10px', fontWeight: isActive ? '600' : '400', letterSpacing: '0.01em' }}>
                  {etiqueta}
                </span>
              </>
            )}
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
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: '3px', padding: '10px 4px',
          background: 'none', border: 'none',
          color: abierto ? '#f97316' : colorNube,
          cursor: 'pointer', transition: 'color 0.15s',
        }}
      >
        <IconoCloud sincronizando={sincronizando} />
        <span style={{ fontSize: '10px', fontWeight: abierto ? '600' : '400', letterSpacing: '0.01em' }}>
          Sync
        </span>
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

function IconoEjercicios({ activo }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={activo ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
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
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M7 8h10M7 12h10M7 16h6" />
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

function IconoRegistro({ activo }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={activo ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="20" x2="21" y2="20" />
      <rect x="4" y="13" width="4" height="7" rx="1" />
      <rect x="10" y="8" width="4" height="12" rx="1" />
      <rect x="16" y="4" width="4" height="16" rx="1" />
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
