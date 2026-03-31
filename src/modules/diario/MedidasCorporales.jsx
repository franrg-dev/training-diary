import { useState } from 'react'
import { useMedidas, CAMPOS_MEDIDAS } from './useMedidas'
import FormularioMedidas from './FormularioMedidas'
import HistorialMedida from './HistorialMedida'

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function mesAnterior(anio, mes) {
  if (mes === 0) return { anio: anio - 1, mes: 11 }
  return { anio, mes: mes - 1 }
}

function colorDiff(diff) {
  if (diff > 0) return '#4ade80'
  if (diff < 0) return '#f87171'
  return 'var(--color-texto-inactivo)'
}

function textoDiff(diff) {
  if (diff > 0) return `+${diff}`
  if (diff < 0) return String(diff)
  return '='
}

function IconoPill({ children, pillBg }) {
  return (
    <div style={{
      width: '40px', height: '40px', borderRadius: '50%',
      backgroundColor: pillBg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      {children}
    </div>
  )
}

function IconoEditar({ size = 20 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 -960 960 960" fill="currentColor">
      <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h357l-80 80H200v560h560v-278l80-80v358q0 33-23.5 56.5T760-120H200Zm280-360ZM360-360v-170l367-367q12-12 27-18t30-6q16 0 30.5 6t26.5 18l56 57q11 12 17 26.5t6 29.5q0 15-5.5 29.5T897-728L530-360H360Zm481-424-56-56 56 56ZM440-440h56l232-232-28-28-29-28-231 231v57Zm260-260-29-28 29 28 28 28-28-28Z"/>
    </svg>
  )
}

/**
 * Subsección Medidas Corporales.
 * Pantallas: 'ver' | 'formulario' | 'historial'
 */
export default function MedidasCorporales({ tituloDropdown }) {
  const hoy = new Date()
  const { medidas, cargando, medidaPorMes, crear, actualizar } = useMedidas()

  const [anio, setAnio]         = useState(hoy.getFullYear())
  const [mes, setMes]           = useState(hoy.getMonth())
  const [pantalla, setPantalla] = useState('ver')
  const [campoActivo, setCampoActivo] = useState(null)

  const medidaActual   = medidaPorMes(anio, mes)
  const ant            = mesAnterior(anio, mes)
  const medidaAnterior = medidaPorMes(ant.anio, ant.mes)
  const esHoy          = anio === hoy.getFullYear() && mes === hoy.getMonth()

  function irMesSiguiente() {
    if (esHoy) return
    if (mes === 11) { setAnio(a => a + 1); setMes(0) }
    else setMes(m => m + 1)
  }

  function irMesAnterior() {
    if (mes === 0) { setAnio(a => a - 1); setMes(11) }
    else setMes(m => m - 1)
  }

  async function handleGuardar(valores) {
    if (medidaActual?.id) {
      await actualizar(medidaActual.id, valores)
    } else {
      await crear(anio, mes, valores)
    }
    setPantalla('ver')
  }

  function abrirHistorial(campo) {
    setCampoActivo(campo)
    setPantalla('historial')
  }

  function registrosParaCampo(campoId) {
    return medidas
      .filter(m => m[campoId] > 0)
      .map(m => ({ fecha: m.fecha, valor: m[campoId] }))
  }

  // ── Pantalla: formulario ──────────────────────────────────────────────────
  if (pantalla === 'formulario') {
    return (
      <div className="contenido-principal-inner">
        <div style={{ padding: '20px 16px 0', marginBottom: '12px' }}>{tituloDropdown}</div>
        <FormularioMedidas
          anio={anio}
          mes={mes}
          medidaExistente={medidaActual}
          medidaAnterior={medidaAnterior}
          onGuardar={handleGuardar}
          onCancelar={() => setPantalla('ver')}
        />
      </div>
    )
  }

  // ── Pantalla: historial ───────────────────────────────────────────────────
  if (pantalla === 'historial' && campoActivo) {
    return (
      <div className="contenido-principal-inner">
        <div style={{ padding: '20px 16px 0', marginBottom: '12px' }}>{tituloDropdown}</div>
        <HistorialMedida
          campoLabel={campoActivo.label}
          registros={registrosParaCampo(campoActivo.id)}
          onVolver={() => setPantalla('ver')}
        />
      </div>
    )
  }

  // ── Pantalla: ver ─────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '0 16px 32px' }}>

      {/* SelectorSeccion */}
      <div style={{ padding: '20px 0 12px' }}>{tituloDropdown}</div>

      {/* Navegador de mes */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <button onClick={irMesAnterior} className="app-btn-nav" aria-label="Mes anterior">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <p style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: 'var(--color-texto)' }}>
          {MESES[mes]} {anio}
        </p>
        <button
          onClick={irMesSiguiente}
          className="app-btn-nav"
          disabled={esHoy}
          aria-label="Mes siguiente"
          style={{ opacity: esHoy ? 0.4 : 1, cursor: esHoy ? 'default' : 'pointer' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {cargando && (
        <p style={{ textAlign: 'center', color: 'var(--color-texto-secundario)', marginTop: '40px' }}>
          Cargando…
        </p>
      )}

      {/* Sin datos */}
      {!cargando && !medidaActual && (
        <div className="app-tarjeta" style={{ textAlign: 'center', padding: '32px 20px' }}>
          <IconoPill pillBg="rgba(60, 90, 110, 0.15)">
            <svg width="22" height="22" viewBox="0 -960 960 960" fill="#5A7A8C">
              <path d="M343.5-743.5Q320-767 320-800t23.5-56.5Q367-880 400-880t56.5 23.5Q480-833 480-800t-23.5 56.5Q433-720 400-720t-56.5-23.5ZM731-269q29-29 29-71t-29-71q-29-29-71-29t-71 29q-29 29-29 71t29 71q29 29 71 29t71-29ZM864-80 756-188q-22 14-46 21t-50 7q-75 0-127.5-52.5T480-340q0-75 52.5-127.5T660-520q75 0 127.5 52.5T840-340q0 26-7 50t-21 46l108 108-56 56Zm-424 0v-121q15 24 35.5 44t44.5 36v41h-80Zm-160 0v-520q-61-5-121-14.5T40-640l20-80q84 23 168.5 31.5T400-680q87 0 171.5-8.5T740-720l20 80q-59 16-119 25.5T520-600v41q-54 35-87 92.5T400-340v10q0 5 1 10h-41v240h-80Z"/>
            </svg>
          </IconoPill>
          <p style={{ margin: '16px 0 4px', fontWeight: '700', color: 'var(--color-texto)', fontSize: '16px' }}>
            Sin medidas este mes
          </p>
          <p style={{ margin: '0 0 20px', fontSize: '14px', color: 'var(--color-texto-secundario)' }}>
            Registra tus medidas del 1 de {MESES[mes].toLowerCase()}
          </p>
          <button onClick={() => setPantalla('formulario')} className="app-btn-acento">
            + Añadir medidas del mes
          </button>
        </div>
      )}

      {/* Con datos */}
      {!cargando && medidaActual && (
        <div className="app-tarjeta" style={{ padding: '18px 18px 8px' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ width: '32px' }} />
            <IconoPill pillBg="rgba(60, 90, 110, 0.15)">
              <svg width="22" height="22" viewBox="0 -960 960 960" fill="#5A7A8C">
                <path d="M343.5-743.5Q320-767 320-800t23.5-56.5Q367-880 400-880t56.5 23.5Q480-833 480-800t-23.5 56.5Q433-720 400-720t-56.5-23.5ZM731-269q29-29 29-71t-29-71q-29-29-71-29t-71 29q-29 29-29 71t29 71q29 29 71 29t71-29ZM864-80 756-188q-22 14-46 21t-50 7q-75 0-127.5-52.5T480-340q0-75 52.5-127.5T660-520q75 0 127.5 52.5T840-340q0 26-7 50t-21 46l108 108-56 56Zm-424 0v-121q15 24 35.5 44t44.5 36v41h-80Zm-160 0v-520q-61-5-121-14.5T40-640l20-80q84 23 168.5 31.5T400-680q87 0 171.5-8.5T740-720l20 80q-59 16-119 25.5T520-600v41q-54 35-87 92.5T400-340v10q0 5 1 10h-41v240h-80Z"/>
              </svg>
            </IconoPill>
            <button
              onClick={() => setPantalla('formulario')}
              style={{ background: 'none', border: 'none', color: 'var(--color-acento)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
            >
              <IconoEditar size={18} />
            </button>
          </div>

          {/* Lista de medidas */}
          {CAMPOS_MEDIDAS.map((campo, i) => {
            const valor    = medidaActual[campo.id]
            const vacio    = !valor || valor === 0
            const anterior = medidaAnterior?.[campo.id]
            const diff     = (!vacio && anterior && anterior > 0) ? (valor - anterior) : null

            return (
              <button
                key={campo.id}
                onClick={() => abrirHistorial(campo)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '13px 0',
                  background: 'none',
                  border: 'none',
                  borderBottom: i < CAMPOS_MEDIDAS.length - 1 ? '1px solid var(--color-borde)' : 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: '15px', color: 'var(--color-texto)', fontWeight: '500', flex: 1 }}>
                  {campo.label}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {diff !== null && (
                    <span style={{ fontSize: '12px', fontWeight: '600', color: colorDiff(diff), minWidth: '30px', textAlign: 'right' }}>
                      {textoDiff(diff)}
                    </span>
                  )}
                  <span style={{ fontSize: '16px', fontWeight: '700', color: vacio ? 'var(--color-texto-inactivo)' : 'var(--color-acento)', minWidth: '36px', textAlign: 'right' }}>
                    {vacio ? '—' : valor}
                  </span>
                  {!vacio && (
                    <span style={{ fontSize: '12px', color: 'var(--color-texto-secundario)', minWidth: '20px' }}>cm</span>
                  )}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-texto-inactivo)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
