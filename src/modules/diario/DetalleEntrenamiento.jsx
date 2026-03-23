import { useMemo, useState } from 'react'
import { COLORES_GRUPO } from '../ejercicios/coloresGrupo'
import { IconoEjercicio } from '../ejercicios/iconosEjercicio'
import { getObjetivos } from '../ajustes/useObjetivos'

function formatearSueno(minutos) {
  const m = parseInt(minutos, 10) || 0
  return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`
}

const ROJO    = '#f87171'
const NARANJA = '#f97316'
const VERDE   = '#4ade80'

function calcularEstadoKcal(dif, objetivo) {
  if (objetivo < 0) {
    if (dif > 0)         return { color: ROJO,    progreso: 1 }
    if (dif <= objetivo) return { color: VERDE,   progreso: 1 }
    return { color: NARANJA, progreso: dif / objetivo }
  }
  if (objetivo === 0) {
    const abs = Math.abs(dif)
    const color = abs <= 100 ? VERDE : abs <= 300 ? NARANJA : ROJO
    return { color, progreso: Math.min(abs / 300, 1) }
  }
  if (dif < 0)           return { color: ROJO,    progreso: 1 }
  if (dif >= objetivo)   return { color: VERDE,   progreso: 1 }
  return { color: NARANJA, progreso: dif / objetivo }
}

const DIAS_CORTOS  = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB']
const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function formatearFechaCorta(fechaStr) {
  const [anio, mes, dia] = fechaStr.split('-').map(Number)
  const d = new Date(anio, mes - 1, dia)
  return `${DIAS_CORTOS[d.getDay()]}, ${dia}/${MESES_CORTOS[mes - 1]}/${anio}`
}

// ─── Valor lateral (izquierda/derecha) ───────────────────────────────────

function ValorLateral({ valor, label, color }) {
  const vacio = !valor || Number(valor) === 0
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '72px', gap: '4px' }}>
      <p style={{ margin: 0, fontSize: '9px', color: 'var(--color-texto-secundario)', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'center' }}>{label}</p>
      <p style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: vacio ? 'var(--color-texto-inactivo)' : color, lineHeight: 1 }}>
        {vacio ? '—' : valor}
      </p>
      <p style={{ margin: 0, fontSize: '10px', color: 'var(--color-texto-secundario)' }}>kcal</p>
    </div>
  )
}

// ─── Anillo central (diferencia) ─────────────────────────────────────────

function AnilloCentro({ valor, objetivo }) {
  const r    = 44
  const circ = 2 * Math.PI * r

  const tieneDatos    = valor !== null
  const tieneObjetivo = objetivo !== 0 && objetivo != null

  let arcColor = 'var(--color-texto-inactivo)'
  let progreso = 0

  if (tieneDatos && tieneObjetivo) {
    const estado = calcularEstadoKcal(valor, Number(objetivo))
    arcColor = estado.color
    progreso = Math.max(0, Math.min(1, estado.progreso))
  }

  const texto = valor === null ? '—' : valor > 0 ? `+${valor}` : String(valor)
  const colorTexto = tieneDatos && tieneObjetivo ? arcColor : 'var(--color-texto-inactivo)'

  return (
    <div style={{ position: 'relative', width: '106px', height: '106px', flexShrink: 0 }}>
      <svg width="106" height="106" viewBox="0 0 106 106" style={{ display: 'block' }}>
        {/* Pista */}
        <circle cx="53" cy="53" r={r} fill="none" stroke="rgba(150,150,150,0.15)" strokeWidth="8" />
        {/* Arco de progreso — dinámico según objetivo */}
        {progreso > 0 && (
          <circle cx="53" cy="53" r={r} fill="none"
            stroke={arcColor} strokeWidth="8"
            strokeDasharray={`${progreso * circ} ${(1 - progreso) * circ}`}
            strokeDashoffset="0"
            transform="rotate(-90 53 53)"
          />
        )}
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ margin: 0, fontSize: texto.length > 4 ? '17px' : '21px', fontWeight: '800', color: colorTexto, lineHeight: 1 }}>
          {texto}
        </p>
        <p style={{ margin: '2px 0 0', fontSize: '9px', color: 'var(--color-texto-secundario)' }}>kcal</p>
      </div>
    </div>
  )
}

// ─── Pill de macro ────────────────────────────────────────────────────────

function PillMacro({ label, valor, color, objetivo, display }) {
  const vacio        = !valor || Number(valor) === 0
  const tieneObjetivo = objetivo > 0
  const pct          = tieneObjetivo ? Math.min((Number(valor) / objetivo) * 100, 100) : 0
  const sobre        = tieneObjetivo && Number(valor) > objetivo
  const textoValor   = display ? display(Number(valor), vacio) : vacio ? '—' : `${valor}g`

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
      padding: '10px 6px', backgroundColor: 'var(--color-fondo)', borderRadius: '12px',
    }}>
      <p style={{ margin: 0, fontSize: '10px', color: 'var(--color-texto-secundario)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </p>
      <p style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: vacio ? 'var(--color-texto-inactivo)' : 'var(--color-texto)' }}>
        {textoValor}
      </p>
      {/* Barra de progreso */}
      <div style={{ width: 'calc(100% - 12px)', display: 'flex', alignItems: 'center', gap: '3px' }}>
        <div style={{ flex: 1, height: '4px', backgroundColor: 'var(--color-borde)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: tieneObjetivo ? `${pct}%` : vacio ? '0%' : '100%',
            backgroundColor: color,
            borderRadius: '2px',
          }} />
        </div>
        {sobre && (
          <svg width="8" height="8" viewBox="0 0 8 8" style={{ flexShrink: 0 }}>
            <path d="M4 0.5 L7.5 7.5 L0.5 7.5 Z" fill={color} />
          </svg>
        )}
      </div>
    </div>
  )
}

// ─── Fila de stat ─────────────────────────────────────────────────────────

function StatFila({ icono, label, valor, sufijo, naranja = false }) {
  const vacio = !valor || Number(valor) === 0 || valor === ''
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid var(--color-borde)' }}>
      <span style={{ fontSize: '20px', width: '28px', textAlign: 'center', flexShrink: 0 }}>{icono}</span>
      <span style={{ flex: 1, fontSize: '14px', color: 'var(--color-texto-secundario)' }}>{label}</span>
      <span style={{ fontSize: '16px', fontWeight: '700', color: vacio ? 'var(--color-texto-inactivo)' : naranja ? '#f97316' : 'var(--color-texto)' }}>
        {vacio ? '—' : valor}{!vacio && sufijo ? <span style={{ fontSize: '11px', color: 'var(--color-texto-secundario)', marginLeft: '2px' }}>{sufijo}</span> : null}
      </span>
    </div>
  )
}

// ─── Chip de hábito ───────────────────────────────────────────────────────

function ChipHabito({ label, activo }) {
  return (
    <div style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
      padding: '10px 12px', borderRadius: '12px',
      backgroundColor: activo ? '#f9731622' : 'var(--color-fondo)',
      border: `1px solid ${activo ? '#f9731666' : 'var(--color-borde)'}`,
    }}>
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: activo ? '#f97316' : 'var(--color-texto-inactivo)', flexShrink: 0 }} />
      <span style={{ fontSize: '12px', fontWeight: '600', color: activo ? '#f97316' : 'var(--color-texto-secundario)' }}>{label}</span>
    </div>
  )
}

// ─── Celda de composición corporal ───────────────────────────────────────

function CeldaCorporal({ label, valor, sufijo }) {
  const vacio = valor === '' || valor === null || valor === undefined || valor === 0 || valor === '0'
  return (
    <div style={{ backgroundColor: 'var(--color-fondo)', borderRadius: '12px', padding: '12px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <p style={{ margin: '0 0 3px', fontSize: '10px', color: 'var(--color-texto-secundario)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
      <p style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: vacio ? 'var(--color-texto-inactivo)' : 'var(--color-texto)', lineHeight: 1 }}>
        {vacio ? '—' : valor}{!vacio && sufijo ? <span style={{ fontSize: '10px', color: 'var(--color-texto-secundario)', marginLeft: '2px' }}>{sufijo}</span> : null}
      </p>
    </div>
  )
}

// ─── Icono de tendencia ───────────────────────────────────────────────────

function IconoTendencia({ tendencia }) {
  if (!tendencia) return null
  if (tendencia === 'sube') return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#86efac" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 16 12 8 6 16" />
    </svg>
  )
  if (tendencia === 'baja') return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fca5a5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 8 12 16 18 8" />
    </svg>
  )
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fde047" strokeWidth="2.5" strokeLinecap="round">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

// ─── Icono editar ─────────────────────────────────────────────────────────

function IconoEditar({ size = 20 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 -960 960 960" fill="currentColor">
      <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h357l-80 80H200v560h560v-278l80-80v358q0 33-23.5 56.5T760-120H200Zm280-360ZM360-360v-170l367-367q12-12 27-18t30-6q16 0 30.5 6t26.5 18l56 57q11 12 17 26.5t6 29.5q0 15-5.5 29.5T897-728L530-360H360Zm481-424-56-56 56 56ZM440-440h56l232-232-28-28-29-28-231 231v57Zm260-260-29-28 29 28 28 28-28-28Z"/>
    </svg>
  )
}

// ─── Celda de dato general de entrenamiento ───────────────────────────────

function CeldaGeneral({ label, valor, sufijo, naranja = false }) {
  const [tooltip, setTooltip] = useState(false)
  const vacio = !valor || valor === 0 || valor === ''

  function handleClick() {
    setTooltip(true)
    setTimeout(() => setTooltip(false), 2000)
  }

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'relative',
        backgroundColor: 'var(--color-fondo)',
        borderRadius: '8px',
        padding: '5px 8px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'default', userSelect: 'none',
      }}
    >
      {tooltip && (
        <div style={{
          position: 'absolute',
          bottom: 'calc(100% + 7px)',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#f97316',
          borderRadius: '6px',
          padding: '4px 9px',
          fontSize: '11px', fontWeight: '700',
          color: '#fff',
          whiteSpace: 'nowrap',
          zIndex: 20,
          pointerEvents: 'none',
        }}>
          {label}
          <div style={{
            position: 'absolute', bottom: '-4px', left: '50%', transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '4px solid transparent', borderRight: '4px solid transparent',
            borderTop: '4px solid #f97316',
          }} />
        </div>
      )}
      <p style={{
        margin: 0, fontSize: '13px', fontWeight: '700', lineHeight: 1,
        color: vacio ? 'var(--color-texto-inactivo)' : naranja ? '#f97316' : 'var(--color-texto)',
      }}>
        {vacio ? '—' : `${valor}${sufijo ? `\u00a0${sufijo}` : ''}`}
      </p>
    </div>
  )
}

// ─── Cabecera de sección ──────────────────────────────────────────────────

function TituloSeccion({ titulo, botonLabel, onBoton }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
      <p style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: 'var(--color-texto)' }}>{titulo}</p>
      <div style={{ flex: 1 }} />
      {onBoton && (
        <button onClick={onBoton} style={{ background: 'none', border: 'none', color: '#f97316', fontSize: '13px', fontWeight: '600', cursor: 'pointer', padding: 0 }}>
          {botonLabel}
        </button>
      )}
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────

/**
 * Vista completa de un día: datos generales + entrenamiento (solo lectura).
 */
export default function DetalleEntrenamiento({
  fecha,
  entrada,
  ejercicios,
  sesiones,
  registrosPorEjercicio,
  onEditarDatos,
  onEditarEntrenamiento,
  onVolver,
  onCambiarDia,
}) {
  const mapaEjercicios = useMemo(
    () => Object.fromEntries((ejercicios || []).map(e => [e.id, e])),
    [ejercicios]
  )

  const mapaSesiones = useMemo(() => {
    const m = {}
    for (const s of (sesiones || [])) m[s.id] = s
    return m
  }, [sesiones])

  // Precalcular tendencia para cada ejercicio de fuerza
  const tendencias = useMemo(() => {
    const t = {}
    for (const item of (entrada?.ejerciciosDia || [])) {
      const pesoActual = Number(item.peso)
      if (!pesoActual) { t[item.ejercicioId] = null; continue }
      const historial = registrosPorEjercicio(item.ejercicioId)
      const anterior  = historial.filter(r => r.fecha < fecha).pop()
      if (!anterior) { t[item.ejercicioId] = null; continue }
      const diff = pesoActual - anterior.peso
      t[item.ejercicioId] = diff > 0 ? 'sube' : diff < 0 ? 'baja' : 'igual'
    }
    return t
  }, [entrada, fecha, registrosPorEjercicio])

  const [expandido, setExpandido]           = useState(null)  // índice fuerza
  const [expandidoCardio, setExpandidoCardio] = useState(null) // índice cardio

  const e = entrada || {}

  const tieneEntrenamiento = entrada && (
    entrada.sesionId ||
    (entrada.ejerciciosDia   || []).length > 0 ||
    (entrada.ejerciciosCardio || []).length > 0
  )

  const sesion           = entrada?.sesionId ? mapaSesiones[entrada.sesionId] : null
  const ejerciciosDia    = entrada?.ejerciciosDia    || []
  const ejerciciosCardio = entrada?.ejerciciosCardio || []

  const objetivos = getObjetivos()
  const c = Number(e.kcalConsumidas)   || 0
  const q = Number(e.kcalQuemadas)     || 0
  const b = Number(e.metabolismoBasal) || 0
  const difKcal = (c || q || b) ? c - q - b : null

  return (
    <div style={{ padding: '0 16px 40px' }}>

      {/* ─ Cabecera ─ */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px 0 20px', gap: '6px' }}>
        <button
          onClick={onVolver}
          style={{ background: 'none', border: 'none', color: '#f97316', fontSize: '14px', fontWeight: '600', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Diario
        </button>

        {/* Fecha con navegación */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <button
            onClick={() => onCambiarDia(-1)}
            style={{ backgroundColor: 'var(--color-superficie)', border: '1px solid var(--color-borde)', borderRadius: '8px', color: '#f97316', cursor: 'pointer', padding: '6px 8px', display: 'flex', alignItems: 'center' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: 'var(--color-texto)', whiteSpace: 'nowrap' }}>
            {formatearFechaCorta(fecha)}
          </p>
          <button
            onClick={() => onCambiarDia(1)}
            style={{ backgroundColor: 'var(--color-superficie)', border: '1px solid var(--color-borde)', borderRadius: '8px', color: '#f97316', cursor: 'pointer', padding: '6px 8px', display: 'flex', alignItems: 'center' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        <button
          onClick={onEditarDatos}
          style={{ background: 'none', border: 'none', color: '#f97316', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', flexShrink: 0 }}
        >
          <IconoEditar />
        </button>
      </div>

      {/* ══════════════════════════════════════════════
          SUEÑO
      ══════════════════════════════════════════════ */}
      <div style={{ backgroundColor: 'var(--color-superficie)', borderRadius: '20px', padding: '20px', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Dato principal: horas de sueño */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-fondo)', borderRadius: '16px', padding: '16px 20px', minWidth: '100px' }}>
            <span style={{ fontSize: '28px', lineHeight: 1, marginBottom: '4px' }}>🌙</span>
            <p style={{ margin: '4px 0 2px', fontSize: '30px', fontWeight: '800', color: e.suenoMinutos > 0 ? 'var(--color-texto)' : 'var(--color-texto-inactivo)', lineHeight: 1 }}>
              {e.suenoMinutos > 0 ? formatearSueno(e.suenoMinutos) : '—'}
            </p>
            <p style={{ margin: 0, fontSize: '11px', color: 'var(--color-texto-secundario)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>horas</p>
          </div>
          {/* Datos secundarios */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <p style={{ margin: '0 0 2px', fontSize: '10px', color: 'var(--color-texto-secundario)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Acostarse</p>
              <p style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: e.suenoHoraAcostarse ? 'var(--color-texto)' : 'var(--color-texto-inactivo)' }}>
                {e.suenoHoraAcostarse || '—'}
              </p>
            </div>
            <div style={{ height: '1px', backgroundColor: 'var(--color-borde)' }} />
            <div>
              <p style={{ margin: '0 0 2px', fontSize: '10px', color: 'var(--color-texto-secundario)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Puntuación</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <p style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: e.suenoCalidad > 0 ? '#f97316' : 'var(--color-texto-inactivo)' }}>
                  {e.suenoCalidad > 0 ? e.suenoCalidad : '—'}
                </p>
                {e.suenoCalidad > 0 && <span style={{ fontSize: '12px', color: 'var(--color-texto-secundario)' }}>/100</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          NUTRICIÓN
      ══════════════════════════════════════════════ */}
      <div style={{ backgroundColor: 'var(--color-superficie)', borderRadius: '20px', padding: '20px', marginBottom: '12px' }}>

        {/* MB centrado en texto pequeño */}
        {e.metabolismoBasal > 0 && (
          <p style={{ margin: '0 0 14px', textAlign: 'center', fontSize: '12px', color: 'var(--color-texto-secundario)' }}>
            MB: <span style={{ color: 'var(--color-texto-secundario)', fontWeight: '600' }}>{e.metabolismoBasal} kcal</span>
          </p>
        )}
        {!e.metabolismoBasal && (
          <p style={{ margin: '0 0 14px', textAlign: 'center', fontSize: '12px', color: 'var(--color-texto-inactivo)' }}>MB: —</p>
        )}

        {/* Tres anillos: Quemadas | Diferencia | Consumidas */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <ValorLateral valor={e.kcalQuemadas  || 0} label="Quemadas"   color="#ef4444" />
          <AnilloCentro valor={difKcal} objetivo={objetivos.kcalDiferencia} />
          <ValorLateral valor={e.kcalConsumidas || 0} label="Consumidas" color="#3b82f6" />
        </div>

        {/* Macros */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <PillMacro label="Proteínas" valor={e.proteinas}     color="#f97316" objetivo={objetivos.proteinas}     />
          <PillMacro label="Carbos"    valor={e.carbohidratos} color="#3b82f6" objetivo={objetivos.carbohidratos} />
          <PillMacro label="Grasas"    valor={e.grasas}        color="#a855f7" objetivo={objetivos.grasas}        />
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          ACTIVIDAD Y HÁBITOS
      ══════════════════════════════════════════════ */}
      <div style={{ backgroundColor: 'var(--color-superficie)', borderRadius: '20px', padding: '20px', marginBottom: '12px' }}>
        {/* Pasos y Agua con barra de progreso */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
          <PillMacro
            label="Pasos" valor={e.pasos || 0} color="#22c55e"
            objetivo={objetivos.pasos}
            display={(v, vacio) => vacio ? '—' : v.toLocaleString('es')}
          />
          <PillMacro
            label="Agua" valor={e.agua || 0} color="#38bdf8"
            objetivo={objetivos.agua}
            display={(v, vacio) => vacio ? '—' : `${Number(v).toFixed(1)} L`}
          />
        </div>
        <div style={{ margin: '0 -4px' }}>
          <StatFila icono="💥" label="Esfuerzo percibido" valor={e.esfuerzo > 0 ? e.esfuerzo : null} sufijo="%" naranja={e.esfuerzo > 0} />
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
          <ChipHabito label="Movilidad" activo={!!e.movilidad} />
          <ChipHabito label="Core"      activo={!!e.core} />
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          COMPOSICIÓN CORPORAL
      ══════════════════════════════════════════════ */}
      <div style={{ backgroundColor: 'var(--color-superficie)', borderRadius: '20px', padding: '20px', marginBottom: '12px' }}>

        {/* Báscula y hora — texto centrado, sin celda */}
        <p style={{ margin: '0 0 12px', textAlign: 'center', fontSize: '12px', color: 'var(--color-texto-secundario)' }}>
          {(e.bascula || e.horaPesaje)
            ? <>
                {e.bascula   && <span style={{ color: 'var(--color-texto-secundario)', fontWeight: '600' }}>{e.bascula}</span>}
                {e.bascula && e.horaPesaje && ' · '}
                {e.horaPesaje && <span style={{ color: 'var(--color-texto-secundario)', fontWeight: '600' }}>{e.horaPesaje}</span>}
              </>
            : <span style={{ color: 'var(--color-texto-inactivo)' }}>—</span>
          }
        </p>

        {/* Fila 2-3: Peso (span 2 rows, cuadrado) | IMC / EC */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
          {/* Peso — naranja, span 2 filas */}
          <div style={{
            gridRow: 'span 2',
            backgroundColor: 'var(--color-fondo)', borderRadius: '14px',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 10px',
          }}>
            <p style={{ margin: 0, fontSize: '10px', color: 'var(--color-texto-secundario)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Peso</p>
            <p style={{ margin: 0, fontSize: '44px', fontWeight: '800', color: e.peso > 0 ? '#f97316' : 'var(--color-texto-inactivo)', lineHeight: 1 }}>
              {e.peso > 0 ? e.peso : '—'}
            </p>
            <p style={{ margin: 0, fontSize: '10px', color: e.peso > 0 ? 'var(--color-texto-secundario)' : 'transparent' }}>kg</p>
          </div>

          <CeldaCorporal label="IMC"          valor={e.imc} />
          <CeldaCorporal label="Edad Corporal" valor={e.edadCorporal} />
        </div>

        {/* Fila 4-5: %Grasa | G.Visceral / Músculo | Masa Ósea */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <CeldaCorporal label="% Grasa"    valor={e.grasaPorcentaje} sufijo="%" />
          <CeldaCorporal label="G.Visceral" valor={e.grasaVisceral} />
          <CeldaCorporal label="Músculo"    valor={e.musculo}         sufijo="kg" />
          <CeldaCorporal label="Masa Ósea"  valor={e.masaOsea}        sufijo="kg" />
        </div>

      </div>

      {/* ══════════════════════════════════════════════
          ENTRENAMIENTO
      ══════════════════════════════════════════════ */}
      <div style={{ backgroundColor: 'var(--color-superficie)', borderRadius: '20px', padding: '20px', marginBottom: '12px' }}>
        {/* Sin entrenamiento */}
        {!tieneEntrenamiento && (
          <button
            onClick={onEditarEntrenamiento}
            style={{ width: '100%', padding: '16px', backgroundColor: 'transparent', border: '1px dashed var(--color-texto-inactivo)', borderRadius: '14px', color: 'var(--color-texto-secundario)', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <span style={{ fontSize: '20px' }}>＋</span>
            Añadir entrenamiento
          </button>
        )}

        {/* Sesión + botón editar */}
        {tieneEntrenamiento && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: sesion ? '10px' : '0' }}>
            {sesion && (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: '#f9731611', border: '1px solid #f9731633', borderRadius: '12px' }}>
                <span style={{ fontSize: '16px' }}>📋</span>
                <p style={{ margin: 0, fontWeight: '700', color: '#f97316', fontSize: '14px' }}>{sesion.nombre}</p>
              </div>
            )}
            <button
              onClick={onEditarEntrenamiento}
              style={{ background: 'none', border: 'none', color: '#f97316', cursor: 'pointer', padding: 0, flexShrink: 0, display: 'flex', alignItems: 'center' }}
            >
              <IconoEditar />
            </button>
          </div>
        )}

        {/* Fuerza */}
        {ejerciciosDia.length > 0 && (
          <>
            <p style={{ margin: '4px 0 8px', fontSize: '11px', fontWeight: '700', color: 'var(--color-texto-secundario)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>💪 Fuerza</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '8px' }}>
              <CeldaGeneral label="Lugar"    valor={e.fuerzaLugar}        naranja={!!e.fuerzaLugar} />
              <CeldaGeneral label="Hora"     valor={e.fuerzaHoraInicio} />
              <CeldaGeneral label="Duración" valor={e.fuerzaDuracion > 0 ? e.fuerzaDuracion : ''} sufijo="min" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '10px' }}>
              <CeldaGeneral label="KCal"           valor={e.fuerzaKcalQuemadas > 0 ? e.fuerzaKcalQuemadas : ''}     sufijo="kcal" />
              <CeldaGeneral label="Ritmo Cardíaco" valor={e.fuerzaFrecuenciaCardiaca > 0 ? e.fuerzaFrecuenciaCardiaca : ''} sufijo="lpm" />
            </div>
            {ejerciciosDia.map((item, idx) => {
              const ej  = mapaEjercicios[item.ejercicioId]
              if (!ej) return null
              const tendencia  = tendencias[item.ejercicioId]
              const abierto    = expandido === idx
              const tieneNota  = item.sensaciones?.trim()
              return (
                <div key={idx} style={{ backgroundColor: 'var(--color-fondo)', borderRadius: '14px', marginBottom: '6px', overflow: 'hidden' }}>
                  {/* Fila principal — clicable si tiene sensaciones */}
                  <div
                    onClick={() => tieneNota && setExpandido(abierto ? null : idx)}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', cursor: tieneNota ? 'pointer' : 'default' }}
                  >
                    <IconoEjercicio grupos={ej.gruposMuscular} grupoPrincipal={ej.grupoPrincipal} size={20} />
                    <p style={{ margin: 0, flex: 1, fontWeight: '600', color: 'var(--color-texto)', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ej.nombre}
                    </p>
                    {Number(item.peso) > 0 && (
                      <p style={{ margin: 0, fontWeight: '800', color: '#f97316', fontSize: '17px', flexShrink: 0, lineHeight: 1 }}>
                        {item.peso}
                        <span style={{ fontSize: '10px', fontWeight: '500', color: 'var(--color-texto-secundario)', marginLeft: '2px' }}>{item.unidad || 'kg'}</span>
                      </p>
                    )}
                    <IconoTendencia tendencia={tendencia} />
                  </div>
                  {/* Sensaciones expandidas */}
                  {abierto && tieneNota && (
                    <div style={{ padding: '0 14px 12px', borderTop: '1px solid var(--color-borde)' }}>
                      <p style={{ margin: '10px 0 0', fontSize: '13px', color: 'var(--color-texto-secundario)', lineHeight: '1.6' }}>
                        {item.sensaciones}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </>
        )}

        {/* Cardio */}
        {ejerciciosCardio.length > 0 && (
          <>
            <p style={{ margin: ejerciciosDia.length > 0 ? '12px 0 8px' : '4px 0 8px', fontSize: '11px', fontWeight: '700', color: 'var(--color-texto-secundario)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>🏃 Cardio</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '10px' }}>
              <CeldaGeneral label="Hora"           valor={e.cardioHoraInicio} />
              <CeldaGeneral label="KCal"           valor={e.cardioKcalQuemadas > 0 ? e.cardioKcalQuemadas : ''}         sufijo="kcal" />
              <CeldaGeneral label="Ritmo Cardíaco" valor={e.cardioFrecuenciaCardiaca > 0 ? e.cardioFrecuenciaCardiaca : ''} sufijo="lpm" />
            </div>
            {ejerciciosCardio.map((item, idx) => {
              const ej = mapaEjercicios[item.ejercicioId]
              if (!ej) return null
              const esVeces   = item.modo === 'veces'
              const abierto   = expandidoCardio === idx
              const tieneNota = item.sensaciones?.trim()
              const metricas  = [
                Number(item.duracion) > 0 ? { valor: item.duracion, unidad: 'min'                       } : null,
                item.ritmo            ?     { valor: item.ritmo,    unidad: esVeces ? 'rp/m' : 'km/h'  } : null,
                Number(item.volumen)  > 0 ? { valor: item.volumen,  unidad: esVeces ? 'rp'   : 'km'    } : null,
              ].filter(Boolean)
              return (
                <div key={idx} style={{ backgroundColor: 'var(--color-fondo)', borderRadius: '14px', marginBottom: '6px', overflow: 'hidden' }}>
                  <div
                    onClick={() => tieneNota && setExpandidoCardio(abierto ? null : idx)}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', cursor: tieneNota ? 'pointer' : 'default' }}
                  >
                    <IconoEjercicio grupos={ej.gruposMuscular} grupoPrincipal={ej.grupoPrincipal} size={20} />
                    <p style={{ margin: 0, flex: 1, fontWeight: '600', color: 'var(--color-texto)', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ej.nombre}
                    </p>
                    {metricas.map((m, i) => (
                      <p key={i} style={{ margin: 0, fontWeight: '800', color: '#f97316', fontSize: '15px', flexShrink: 0, lineHeight: 1 }}>
                        {m.valor}<span style={{ fontSize: '10px', fontWeight: '500', color: 'var(--color-texto-secundario)', marginLeft: '2px' }}>{m.unidad}</span>
                      </p>
                    ))}
                  </div>
                  {abierto && tieneNota && (
                    <div style={{ padding: '0 14px 12px', borderTop: '1px solid var(--color-borde)' }}>
                      <p style={{ margin: '10px 0 0', fontSize: '13px', color: 'var(--color-texto-secundario)', lineHeight: '1.6' }}>
                        {item.sensaciones}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </>
        )}

        {/* Notas generales del entrenamiento */}
        {e.notasEntrenamiento && (
          <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--color-borde)' }}>
            <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: '700', color: 'var(--color-texto-secundario)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>💬 Sensaciones generales</p>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-texto-secundario)', lineHeight: '1.6' }}>{e.notasEntrenamiento}</p>
          </div>
        )}
      </div>

    </div>
  )
}
