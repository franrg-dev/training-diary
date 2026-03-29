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

/**
 * Subsección Medidas Corporales.
 * Pantallas: 'ver' | 'formulario' | 'historial'
 */
export default function MedidasCorporales({ tituloDropdown }) {
  const hoy = new Date()
  const { medidas, cargando, medidaPorMes, crear, actualizar } = useMedidas()

  const [anio, setAnio]       = useState(hoy.getFullYear())
  const [mes, setMes]         = useState(hoy.getMonth())
  const [pantalla, setPantalla] = useState('ver')        // 'ver' | 'formulario' | 'historial'
  const [campoActivo, setCampoActivo] = useState(null)   // { id, label } para historial

  const medidaActual  = medidaPorMes(anio, mes)
  const ant           = mesAnterior(anio, mes)
  const medidaAnterior = medidaPorMes(ant.anio, ant.mes)

  // Límite superior: mes actual
  const esHoy = anio === hoy.getFullYear() && mes === hoy.getMonth()

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

  // Construir registros de historial para un campo: array { fecha, valor } ASC
  function registrosParaCampo(campoId) {
    return medidas
      .filter(m => m[campoId] > 0)
      .map(m => ({ fecha: m.fecha, valor: m[campoId] }))
  }

  // ── Pantalla: formulario ──────────────────────────────────────────────────
  if (pantalla === 'formulario') {
    return (
      <div className="contenido-principal-inner">
        <div style={{ padding: '0 0 0' }}>
          <div style={{ padding: '16px 16px 0' }}>{tituloDropdown}</div>
        </div>
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
        <div style={{ padding: '16px 16px 0' }}>{tituloDropdown}</div>
        <HistorialMedida
          campoLabel={campoActivo.label}
          registros={registrosParaCampo(campoActivo.id)}
          onVolver={() => setPantalla('ver')}
        />
      </div>
    )
  }

  // ── Pantalla: ver (principal) ─────────────────────────────────────────────
  return (
    <div style={{ padding: '0 16px 32px' }}>

      {/* SelectorSeccion */}
      <div style={{ padding: '16px 0 20px' }}>{tituloDropdown}</div>

      {/* Navegador de mes */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <button
          onClick={irMesAnterior}
          style={{ background: 'none', border: 'none', color: '#f97316', cursor: 'pointer', padding: '8px', fontSize: '20px', lineHeight: 1 }}
        >
          ‹
        </button>
        <p style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: 'var(--color-texto)' }}>
          {MESES[mes]} {anio}
        </p>
        <button
          onClick={irMesSiguiente}
          style={{ background: 'none', border: 'none', color: esHoy ? 'var(--color-texto-inactivo)' : '#f97316', cursor: esHoy ? 'default' : 'pointer', padding: '8px', fontSize: '20px', lineHeight: 1 }}
          disabled={esHoy}
        >
          ›
        </button>
      </div>

      {cargando && (
        <p style={{ textAlign: 'center', color: 'var(--color-texto-secundario)', marginTop: '40px' }}>
          Cargando…
        </p>
      )}

      {/* Sin datos para este mes */}
      {!cargando && !medidaActual && (
        <div style={{ backgroundColor: 'var(--color-superficie)', borderRadius: '20px', padding: '32px 20px', textAlign: 'center' }}>
          <p style={{ margin: '0 0 6px', fontSize: '32px' }}>📏</p>
          <p style={{ margin: '0 0 4px', fontWeight: '700', color: 'var(--color-texto)', fontSize: '16px' }}>
            Sin medidas este mes
          </p>
          <p style={{ margin: '0 0 20px', fontSize: '14px', color: 'var(--color-texto-secundario)' }}>
            Registra tus medidas del 1 de {MESES[mes].toLowerCase()}
          </p>
          <button
            onClick={() => setPantalla('formulario')}
            style={{ padding: '14px 28px', backgroundColor: '#f97316', border: 'none', borderRadius: '14px', color: '#fff', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}
          >
            + Añadir medidas del mes
          </button>
        </div>
      )}

      {/* Con datos */}
      {!cargando && medidaActual && (
        <div style={{ backgroundColor: 'var(--color-superficie)', borderRadius: '20px', overflow: 'hidden' }}>

          {/* Cabecera tarjeta */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 12px', borderBottom: '1px solid var(--color-borde)' }}>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: 'var(--color-texto-secundario)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Medidas del mes
            </p>
            <button
              onClick={() => setPantalla('formulario')}
              style={{ background: 'none', border: 'none', color: '#f97316', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
              title="Editar"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
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
                  padding: '14px 16px',
                  background: 'none',
                  border: 'none',
                  borderBottom: i < CAMPOS_MEDIDAS.length - 1 ? '1px solid var(--color-borde)' : 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                {/* Nombre */}
                <span style={{ fontSize: '15px', color: 'var(--color-texto)', fontWeight: '500', flex: 1 }}>
                  {campo.label}
                </span>

                {/* Valor + diff */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {diff !== null && (
                    <span style={{ fontSize: '12px', fontWeight: '600', color: colorDiff(diff), minWidth: '30px', textAlign: 'right' }}>
                      {textoDiff(diff)}
                    </span>
                  )}
                  <span style={{ fontSize: '16px', fontWeight: '700', color: vacio ? 'var(--color-texto-inactivo)' : '#f97316', minWidth: '36px', textAlign: 'right' }}>
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
