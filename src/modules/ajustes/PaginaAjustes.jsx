import { useState, useEffect } from 'react'
import db from '../../db/database'
import { getTema, setTema } from './useTema'
import { getObjetivos, setObjetivos } from './useObjetivos'
import { getLugares, setLugares } from './useLugares'

export default function PaginaAjustes() {
  return (
    <div className="contenido-principal">
      <div style={{ padding: '20px 16px 0' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--color-texto)', margin: '0 0 24px' }}>
          Ajustes
        </h1>

        <SeccionApariencia />
        <SeccionObjetivos />
        <SeccionLugares />
        <SeccionSincronizacion />
      </div>
    </div>
  )
}

// — Apariencia —

const OPCIONES_TEMA = [
  { valor: 'auto',   etiqueta: 'Automático', icono: IconoAuto   },
  { valor: 'oscuro', etiqueta: 'Oscuro',     icono: IconoOscuro },
  { valor: 'claro',  etiqueta: 'Claro',      icono: IconoClaro  },
]

function SeccionApariencia() {
  const [temaActual, setTemaActual] = useState(getTema)

  function handleCambiar(valor) {
    setTema(valor)
    setTemaActual(valor)
  }

  return (
    <section style={estiloSeccion}>
      <h2 style={estiloTituloSeccion}>Apariencia</h2>
      <div style={{ display: 'flex', gap: '8px' }}>
        {OPCIONES_TEMA.map(({ valor, etiqueta, icono: Icono }) => { // eslint-disable-line no-unused-vars
          const activo = temaActual === valor
          return (
            <button
              key={valor}
              onClick={() => handleCambiar(valor)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 8px',
                backgroundColor: activo ? 'var(--color-acento)' : 'var(--color-superficie-2)',
                border: `1px solid ${activo ? 'var(--color-acento)' : 'var(--color-borde)'}`,
                borderRadius: '12px',
                color: activo ? '#fff' : 'var(--color-texto-secundario)',
                fontSize: '12px',
                fontWeight: activo ? '600' : '400',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <Icono activo={activo} />
              {etiqueta}
            </button>
          )
        })}
      </div>
    </section>
  )
}

// — Objetivos —

const LABELS_DIRECCION = { deficit: 'Déficit', volumen: 'Volumen', mantenimiento: 'Mantenimiento' }

function SeccionObjetivos() {
  const [obj, setObj] = useState(getObjetivos)

  function actualizar(campo, valor) {
    const nuevo = { ...obj, [campo]: valor }
    setObj(nuevo)
    setObjetivos(nuevo)
  }

  function cambiarDireccion(tipo) {
    const cambios = { pesoObjetivoTipo: tipo }
    if (tipo === 'mantenimiento') {
      cambios.kcalDiferencia = 0
    } else if (tipo === 'deficit' && obj.kcalDiferencia > 0) {
      cambios.kcalDiferencia = -obj.kcalDiferencia
    } else if (tipo === 'volumen' && obj.kcalDiferencia < 0) {
      cambios.kcalDiferencia = -obj.kcalDiferencia
    }
    const nuevo = { ...obj, ...cambios }
    setObj(nuevo)
    setObjetivos(nuevo)
  }

  const esDeficit      = obj.pesoObjetivoTipo === 'deficit'
  const esMantenimiento = obj.pesoObjetivoTipo === 'mantenimiento'

  return (
    <section style={estiloSeccion}>
      <h2 style={estiloTituloSeccion}>Objetivos diarios</h2>

      {/* — Peso a largo plazo (arriba del todo) — */}
      <p style={estiloSubtitulo}>Peso a largo plazo</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
        <InputObjetivo
          label="Peso objetivo"
          sufijo="kg"
          value={obj.pesoObjetivo}
          onChange={v => actualizar('pesoObjetivo', v)}
          placeholder="70"
          decimal
        />
        <div>
          <p style={estiloLabelInput}>Dirección</p>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['deficit', 'volumen', 'mantenimiento'].map(tipo => (
              <button
                key={tipo}
                onClick={() => cambiarDireccion(tipo)}
                style={{
                  flex: 1,
                  padding: '10px 4px',
                  backgroundColor: obj.pesoObjetivoTipo === tipo ? 'var(--color-acento)' : 'var(--color-superficie-2)',
                  border: `1px solid ${obj.pesoObjetivoTipo === tipo ? 'var(--color-acento)' : 'var(--color-borde)'}`,
                  borderRadius: '8px',
                  color: obj.pesoObjetivoTipo === tipo ? '#fff' : 'var(--color-texto-secundario)',
                  fontSize: '11px',
                  fontWeight: obj.pesoObjetivoTipo === tipo ? '600' : '400',
                  cursor: 'pointer',
                }}
              >
                {LABELS_DIRECCION[tipo]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* — Nutrición — */}
      <p style={{ ...estiloSubtitulo, marginTop: '16px' }}>Nutrición</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
        <div>
          <p style={estiloLabelInput}>Dif. KCal</p>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            {esDeficit && (
              <span style={{
                position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
                fontSize: '14px', color: 'var(--color-texto-secundario)', pointerEvents: 'none', zIndex: 1,
              }}>−</span>
            )}
            <input
              type="number"
              inputMode="numeric"
              placeholder={esDeficit ? '500' : '300'}
              disabled={esMantenimiento}
              value={esMantenimiento ? 0 : (obj.kcalDiferencia ? Math.abs(obj.kcalDiferencia) : '')}
              min={0}
              step="1"
              onChange={e => {
                const raw = e.target.value
                if (raw === '') { actualizar('kcalDiferencia', 0); return }
                const num = parseInt(raw, 10)
                if (!isNaN(num)) actualizar('kcalDiferencia', esDeficit ? -Math.abs(num) : Math.abs(num))
              }}
              style={{
                width: '100%', padding: esDeficit ? '10px 36px 10px 22px' : '10px 36px 10px 10px',
                backgroundColor: esMantenimiento ? 'var(--color-superficie)' : 'var(--color-superficie-2)',
                border: '1px solid var(--color-borde)',
                borderRadius: '8px', color: esMantenimiento ? 'var(--color-texto-secundario)' : 'var(--color-texto)',
                fontSize: '14px', outline: 'none', fontFamily: 'inherit',
                boxSizing: 'border-box',
                opacity: esMantenimiento ? 0.5 : 1,
              }}
            />
            <span style={{
              position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
              fontSize: '10px', color: 'var(--color-texto-secundario)', pointerEvents: 'none',
            }}>kcal</span>
          </div>
        </div>
        <InputObjetivo
          label="Proteína"
          sufijo="g"
          value={obj.proteinas}
          onChange={v => actualizar('proteinas', v)}
          placeholder="150"
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
        <InputObjetivo
          label="Carbohidratos"
          sufijo="g"
          value={obj.carbohidratos}
          onChange={v => actualizar('carbohidratos', v)}
          placeholder="200"
        />
        <InputObjetivo
          label="Grasas"
          sufijo="g"
          value={obj.grasas}
          onChange={v => actualizar('grasas', v)}
          placeholder="60"
        />
      </div>

      {/* — Actividad — */}
      <p style={estiloSubtitulo}>Actividad</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
        <InputObjetivo
          label="Pasos"
          sufijo="pasos"
          value={obj.pasos}
          onChange={v => actualizar('pasos', v)}
          placeholder="10000"
        />
        <InputObjetivo
          label="Agua"
          sufijo="L"
          value={obj.agua}
          onChange={v => actualizar('agua', v)}
          placeholder="2.5"
          decimal
        />
      </div>
    </section>
  )
}

function InputObjetivo({ label, sufijo, value, onChange, placeholder, decimal = false }) {
  return (
    <div>
      <p style={estiloLabelInput}>{label}</p>
      <div style={{ position: 'relative' }}>
        <input
          type="number"
          inputMode={decimal ? 'decimal' : 'numeric'}
          placeholder={placeholder}
          value={value === 0 ? '' : value}
          min={0}
          step={decimal ? '0.1' : '1'}
          onChange={e => {
            const raw = e.target.value
            if (raw === '') { onChange(0); return }
            const num = decimal ? parseFloat(raw) : parseInt(raw, 10)
            if (!isNaN(num)) onChange(num)
          }}
          style={{
            width: '100%', padding: '10px 36px 10px 10px',
            backgroundColor: 'var(--color-superficie-2)',
            border: '1px solid var(--color-borde)',
            borderRadius: '8px', color: 'var(--color-texto)',
            fontSize: '14px', outline: 'none', fontFamily: 'inherit',
            boxSizing: 'border-box',
          }}
        />
        <span style={{
          position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
          fontSize: '10px', color: 'var(--color-texto-secundario)', pointerEvents: 'none',
        }}>
          {sufijo}
        </span>
      </div>
    </div>
  )
}

const estiloSubtitulo = {
  margin: '0 0 8px',
  fontSize: '12px',
  fontWeight: '600',
  color: 'var(--color-texto-secundario)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
}

const estiloLabelInput = {
  margin: '0 0 4px',
  fontSize: '11px',
  color: 'var(--color-texto-secundario)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

// — Lugares de entrenamiento —

function SeccionLugares() {
  const [lugares, setLugaresLocal] = useState(getLugares)
  const [nuevo, setNuevo]          = useState('')

  function añadir() {
    const nombre = nuevo.trim()
    if (!nombre || lugares.includes(nombre)) return
    const actualizados = [...lugares, nombre]
    setLugaresLocal(actualizados)
    setLugares(actualizados)
    setNuevo('')
  }

  function eliminar(nombre) {
    const actualizados = lugares.filter(l => l !== nombre)
    setLugaresLocal(actualizados)
    setLugares(actualizados)
  }

  return (
    <section style={estiloSeccion}>
      <h2 style={estiloTituloSeccion}>Lugares de entrenamiento</h2>
      <p style={{ margin: '0 0 14px', fontSize: '13px', color: 'var(--color-texto-secundario)', lineHeight: '1.5' }}>
        Los pesos registrados se asociarán al lugar donde entrenas.
      </p>

      {/* Lista de lugares */}
      {lugares.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
          {lugares.map(nombre => (
            <div key={nombre} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 14px',
              backgroundColor: 'var(--color-superficie-2)',
              border: '1px solid var(--color-borde)',
              borderRadius: '10px',
            }}>
              <span style={{ flex: 1, fontSize: '14px', color: 'var(--color-texto)', fontWeight: '500' }}>{nombre}</span>
              <button
                onClick={() => eliminar(nombre)}
                style={{ background: 'none', border: 'none', color: 'var(--color-texto-secundario)', cursor: 'pointer', fontSize: '18px', padding: 0, lineHeight: 1, flexShrink: 0 }}
              >×</button>
            </div>
          ))}
        </div>
      )}

      {/* Añadir nuevo */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          placeholder="Nombre del lugar…"
          value={nuevo}
          onChange={e => setNuevo(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && añadir()}
          style={{
            flex: 1, padding: '10px 12px',
            backgroundColor: 'var(--color-superficie-2)',
            border: '1px solid var(--color-borde)',
            borderRadius: '8px', color: 'var(--color-texto)',
            fontSize: '14px', outline: 'none', fontFamily: 'inherit',
          }}
        />
        <button
          onClick={añadir}
          disabled={!nuevo.trim()}
          style={{
            padding: '10px 16px',
            backgroundColor: nuevo.trim() ? 'var(--color-acento)' : 'var(--color-superficie-2)',
            border: '1px solid var(--color-borde)',
            borderRadius: '8px', color: nuevo.trim() ? '#fff' : 'var(--color-texto-secundario)',
            fontSize: '14px', fontWeight: '600', cursor: nuevo.trim() ? 'pointer' : 'default',
            transition: 'all 0.15s',
          }}
        >
          Añadir
        </button>
      </div>
    </section>
  )
}

// — Sincronización —

function SeccionSincronizacion() {
  const [usuario, setUsuario]     = useState(null)
  const [syncState, setSyncState] = useState(null)
  const [email, setEmail]         = useState('')
  const [otp, setOtp]             = useState('')
  const [paso, setPaso]           = useState('email')
  const [enviando, setEnviando]         = useState(false)
  const [error, setError]               = useState(null)
  const [forzandoSync, setForzandoSync] = useState(false)
  const [mensajeSync, setMensajeSync]   = useState(null)

  useEffect(() => {
    const subUser = db.cloud.currentUser.subscribe(u => setUsuario(u))
    const subSync = db.cloud.syncState.subscribe(s => setSyncState(s))
    return () => { subUser.unsubscribe(); subSync.unsubscribe() }
  }, [])

  // Sync automático al volver a primer plano + recarga para reflejar datos nuevos
  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === 'visible') {
        db.cloud.sync()
          .then(() => window.location.reload())
          .catch(() => {})
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  const estaLogueado  = usuario?.isLoggedIn === true
  const sincronizando = syncState?.phase === 'pushing' || syncState?.phase === 'pulling'
  const hayError      = syncState?.phase === 'error'
  const colorEstado   = hayError ? '#ef4444' : sincronizando ? 'var(--color-acento)' : estaLogueado ? 'var(--color-exito)' : 'var(--color-texto-secundario)'

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
      setPaso('email'); setEmail(''); setOtp('')
    } catch {
      setError('Código incorrecto o expirado.')
    } finally { setEnviando(false) }
  }

  async function handleLogout() {
    await db.cloud.logout()
  }

  async function handleForzarSync() {
    setForzandoSync(true)
    setMensajeSync(null)
    try {
      await db.cloud.sync()
      setMensajeSync('Sincronización completada')
    } catch (e) {
      setMensajeSync(`Error: ${e?.message || 'fallo al sincronizar'}`)
    } finally {
      setForzandoSync(false)
      setTimeout(() => setMensajeSync(null), 6000)
    }
  }

  async function handleHardRefresh() {
    setForzandoSync(true)
    setMensajeSync(null)
    try {
      await db.cloud.sync()
      window.location.reload()
    } catch (e) {
      setMensajeSync(`Error: ${e?.message || 'fallo al sincronizar'}`)
      setForzandoSync(false)
      setTimeout(() => setMensajeSync(null), 6000)
    }
  }

  return (
    <section style={estiloSeccion}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <IconoCloud sincronizando={sincronizando} color={colorEstado} />
        <h2 style={{ ...estiloTituloSeccion, margin: 0 }}>Sincronización</h2>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={estaLogueado && !forzandoSync && !sincronizando ? handleForzarSync : undefined}
            disabled={!estaLogueado || forzandoSync || sincronizando}
            title="Forzar sincronización"
            style={estiloBotonIcono(!estaLogueado || forzandoSync || sincronizando)}
          >
            <svg width="18" height="18" viewBox="0 -960 960 960" fill="currentColor"
              style={forzandoSync ? { animation: 'spin 1s linear infinite' } : {}}>
              <path d="M160-160v-80h109q-51-44-80-106t-29-134q0-112 68-197.5T400-790v84q-70 25-115 86.5T240-480q0 54 21.5 99.5T320-302v-98h80v240H160Zm440 0q-50 0-85-35t-35-85q0-48 33-82.5t81-36.5q17-36 50.5-58.5T720-480q53 0 91.5 34.5T858-360q42 0 72 29t30 70q0 42-29 71.5T860-160H600Zm116-360q-7-41-27-76t-49-62v98h-80v-240h240v80H691q43 38 70.5 89T797-520h-81ZM600-240h260q8 0 14-6t6-14q0-8-6-14t-14-6h-70v-50q0-29-20.5-49.5T720-400q-29 0-49.5 20.5T650-330v10h-50q-17 0-28.5 11.5T560-280q0 17 11.5 28.5T600-240Zm120-80Z"/>
            </svg>
          </button>
          <button
            onClick={!forzandoSync && !sincronizando ? handleHardRefresh : undefined}
            disabled={forzandoSync || sincronizando}
            title="Sincronizar y recargar"
            style={estiloBotonIcono(forzandoSync || sincronizando)}
          >
            <svg width="18" height="18" viewBox="0 -960 960 960" fill="currentColor">
              <path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v280h-80v-200H160v400h320v80H160ZM760 0q-73 0-127.5-45.5T564-160h62q13 44 49.5 72T760-60q58 0 99-41t41-99q0-58-41-99t-99-41q-29 0-54 10.5T662-300h58v60H560v-160h60v57q27-26 63-41.5t77-15.5q83 0 141.5 58.5T960-200q0 83-58.5 141.5T760 0Z"/>
            </svg>
          </button>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colorEstado }} />
        </div>
      </div>

      {estaLogueado ? (
        <div>
          <div style={{ padding: '12px', backgroundColor: 'var(--color-superficie-2)', borderRadius: '10px', marginBottom: '16px' }}>
            <p style={{ margin: '0 0 2px', fontSize: '13px', color: 'var(--color-texto)', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {usuario.email}
            </p>
            <p style={{ margin: 0, fontSize: '12px', color: hayError ? '#ef4444' : 'var(--color-texto-secundario)' }}>
              {hayError
                ? `Error: ${syncState?.error?.message || 'fallo de sincronización'}`
                : sincronizando
                ? 'Sincronizando…'
                : syncState?.phase === 'offline'
                ? 'Sin conexión'
                : syncState?.phase
                ? `Estado: ${syncState.phase}`
                : 'Sincronizado'}
            </p>
          </div>
          <p style={{ margin: '0 0 12px', fontSize: '13px', color: 'var(--color-texto-secundario)', lineHeight: '1.5' }}>
            Los datos se sincronizan automáticamente entre todos tus dispositivos.
          </p>
          {mensajeSync && (
            <p style={{ margin: '0 0 10px', fontSize: '12px', textAlign: 'center', color: mensajeSync.includes('Error') ? '#f87171' : 'var(--color-exito)' }}>
              {mensajeSync}
            </p>
          )}
          <button onClick={handleLogout} style={estiloBotonDestructivo}>
            Cerrar sesión
          </button>
        </div>
      ) : (
        <div>
          <p style={{ margin: '0 0 16px', fontSize: '14px', color: 'var(--color-texto-secundario)', lineHeight: '1.6' }}>
            Inicia sesión para sincronizar tus datos entre dispositivos. Recibirás un código por email.
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
              <p style={{ margin: '0 0 10px', fontSize: '13px', color: 'var(--color-texto-secundario)' }}>
                Código enviado a <strong style={{ color: 'var(--color-texto)' }}>{email}</strong>
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
                style={{ width: '100%', padding: '10px', marginTop: '8px', backgroundColor: 'transparent', border: 'none', color: 'var(--color-texto-secundario)', fontSize: '13px', cursor: 'pointer' }}
              >
                Cambiar email
              </button>
            </>
          )}
        </div>
      )}
    </section>
  )
}

// — Iconos —

function IconoAuto({ activo }) {
  const color = activo ? '#fff' : 'currentColor'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  )
}

function IconoOscuro({ activo }) {
  const color = activo ? '#fff' : 'currentColor'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

function IconoClaro({ activo }) {
  const color = activo ? '#fff' : 'currentColor'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}

function IconoCloud({ sincronizando, color }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {sincronizando
        ? <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        : <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
      }
    </svg>
  )
}

// — Estilos —

const estiloSeccion = {
  backgroundColor: 'var(--color-superficie)',
  border: '1px solid var(--color-borde)',
  borderRadius: '16px',
  padding: '20px',
  marginBottom: '16px',
}

const estiloTituloSeccion = {
  margin: '0 0 16px',
  fontSize: '16px',
  fontWeight: '600',
  color: 'var(--color-texto)',
}

const estiloInput = {
  width: '100%', padding: '12px',
  backgroundColor: 'var(--color-superficie-2)',
  border: '1px solid var(--color-borde)',
  borderRadius: '10px', color: 'var(--color-texto)',
  fontSize: '15px', outline: 'none', fontFamily: 'inherit',
  boxSizing: 'border-box',
}

const estiloBotonPrimario = {
  width: '100%', padding: '12px',
  backgroundColor: 'var(--color-acento)', border: 'none',
  borderRadius: '10px', color: '#fff',
  fontSize: '15px', fontWeight: '600', cursor: 'pointer',
}

function estiloBotonIcono(deshabilitado) {
  return {
    width: '30px', height: '30px', borderRadius: '8px', padding: 0,
    backgroundColor: 'var(--color-superficie-2)',
    border: '1px solid var(--color-borde)',
    color: 'var(--color-texto-secundario)',
    cursor: deshabilitado ? 'default' : 'pointer',
    opacity: deshabilitado ? 0.4 : 1,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  }
}

const estiloBotonDestructivo = {
  width: '100%', padding: '11px',
  backgroundColor: 'transparent', border: '1px solid #dc262644',
  borderRadius: '10px', color: '#f87171',
  fontSize: '14px', fontWeight: '600', cursor: 'pointer',
}
