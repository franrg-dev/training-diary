import { useState, useEffect } from 'react'
import db from '../db/database'

/**
 * Botón flotante + panel de sincronización con Dexie Cloud.
 * Muestra el estado de sync y permite iniciar/cerrar sesión.
 */
export default function PanelSync() {
  const [usuario, setUsuario]     = useState(null)
  const [syncState, setSyncState] = useState(null)
  const [abierto, setAbierto]     = useState(false)
  const [email, setEmail]         = useState('')
  const [otp, setOtp]             = useState('')
  const [paso, setPaso]           = useState('email') // 'email' | 'otp'
  const [enviando, setEnviando]   = useState(false)
  const [error, setError]         = useState(null)

  useEffect(() => {
    const subUser = db.cloud.currentUser.subscribe(u => setUsuario(u))
    const subSync = db.cloud.syncState.subscribe(s => setSyncState(s))
    return () => { subUser.unsubscribe(); subSync.unsubscribe() }
  }, [])

  const estaLogueado  = usuario && !usuario.isLoggedIn === false && usuario.userId !== 'unauthorized'
  const sincronizando = syncState?.phase === 'pushing' || syncState?.phase === 'pulling'

  async function handleEnviarEmail() {
    if (!email.trim()) return
    setEnviando(true)
    setError(null)
    try {
      await db.cloud.login({ email: email.trim(), grant_type: 'otp' })
      setPaso('otp')
    } catch (e) {
      setError('Error al enviar el código. Comprueba el email.')
    } finally {
      setEnviando(false)
    }
  }

  async function handleVerificarOtp() {
    if (!otp.trim()) return
    setEnviando(true)
    setError(null)
    try {
      await db.cloud.login({ email: email.trim(), grant_type: 'otp', otp: otp.trim() })
      setAbierto(false)
      setPaso('email')
      setEmail('')
      setOtp('')
    } catch (e) {
      setError('Código incorrecto o expirado.')
    } finally {
      setEnviando(false)
    }
  }

  async function handleLogout() {
    await db.cloud.logout()
    setAbierto(false)
  }

  // Icono y color del indicador según estado
  function getIndicador() {
    if (sincronizando)  return { color: '#f97316', title: 'Sincronizando…' }
    if (estaLogueado)   return { color: '#22c55e', title: 'Sincronizado' }
    return { color: '#4b5563', title: 'Sin cuenta — datos solo locales' }
  }

  const { color, title } = getIndicador()

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setAbierto(o => !o)}
        title={title}
        style={{
          position: 'fixed',
          top: 'calc(env(safe-area-inset-top) + 12px)',
          right: '16px',
          zIndex: 200,
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          backgroundColor: '#1a1a1a',
          border: '1px solid #2e2e2e',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
        }}
      >
        <IconoCloud color={color} sincronizando={sincronizando} />
      </button>

      {/* Panel */}
      {abierto && (
        <>
          {/* Overlay */}
          <div
            onClick={() => setAbierto(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 300, backgroundColor: 'rgba(0,0,0,0.5)' }}
          />
          {/* Panel inferior */}
          <div style={{
            position: 'fixed',
            bottom: 'calc(env(safe-area-inset-bottom) + 80px)',
            left: '16px',
            right: '16px',
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
              <button onClick={() => setAbierto(false)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '20px', padding: 0, lineHeight: 1 }}>×</button>
            </div>

            {estaLogueado ? (
              // — Usuario logueado —
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
              // — Sin sesión —
              <div>
                <p style={{ margin: '0 0 16px', fontSize: '14px', color: '#a1a1a1', lineHeight: '1.6' }}>
                  Inicia sesión para sincronizar tus datos entre iPhone y ordenador. No necesitas contraseña — recibirás un código por email.
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

function IconoCloud({ color, sincronizando }) {
  return (
    <svg
      width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={sincronizando ? { animation: 'spin 1.5s linear infinite' } : {}}
    >
      {sincronizando ? (
        // Icono de carga circular
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      ) : (
        // Icono de nube
        <>
          <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
        </>
      )}
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
