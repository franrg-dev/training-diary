import { useMemo, useState } from 'react'
import { COLORES_GRUPO } from '../ejercicios/coloresGrupo'
import { IconoEjercicio } from '../ejercicios/iconosEjercicio'
import { getObjetivos } from '../ajustes/useObjetivos'
import ModalCalendario from '../habitos/ModalCalendario'
import { formatearFechaLarga } from '../habitos/habitosUtils'

function formatearSueno(minutos) {
  const m = parseInt(minutos, 10) || 0
  return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`
}

const ROJO    = '#f87171'
const NARANJA = 'var(--color-acento)'
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

// ─── Título de tarjeta ────────────────────────────────────────────────────

function TituloCard({ icono, titulo }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '18px' }}>
      {icono && <span style={{ fontSize: '15px', lineHeight: 1 }}>{icono}</span>}
      <p style={{ margin: 0, fontSize: '11px', fontWeight: '700', color: 'var(--color-texto-secundario)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{titulo}</p>
    </div>
  )
}

// ─── Valor lateral (izquierda/derecha) ───────────────────────────────────

function ValorLateral({ valor, label, color }) {
  const vacio = !valor || Number(valor) === 0
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px', gap: '5px' }}>
      <p style={{ margin: 0, fontSize: '10px', color: 'var(--color-texto-secundario)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>{label}</p>
      <p style={{ margin: 0, fontSize: '28px', fontWeight: '800', letterSpacing: '-1px', color: vacio ? 'var(--color-texto-inactivo)' : color, lineHeight: 1 }}>
        {vacio ? '—' : valor}
      </p>
      <p style={{ margin: 0, fontSize: '10px', color: 'var(--color-texto-terciario)' }}>kcal</p>
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

// ─── Stat macro ───────────────────────────────────────────────────────────

function PillMacro({ label, valor, color, objetivo, display }) {
  const vacio         = !valor || Number(valor) === 0
  const tieneObjetivo = objetivo > 0
  const pct           = tieneObjetivo ? Math.min((Number(valor) / objetivo) * 100, 100) : 0
  const sobre         = tieneObjetivo && Number(valor) > objetivo
  const textoValor    = display ? display(Number(valor), vacio) : vacio ? '—' : `${valor}g`

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px',
      padding: '14px 8px', backgroundColor: 'var(--color-superficie-2)', borderRadius: '18px',
      border: '1px solid var(--color-borde)',
    }}>
      <p style={{ margin: 0, fontSize: '10px', fontWeight: '600', color: 'var(--color-texto-terciario)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </p>
      <p style={{ margin: 0, fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px', color: vacio ? 'var(--color-texto-inactivo)' : 'var(--color-texto)', lineHeight: 1 }}>
        {textoValor}
      </p>
      {/* Barra cápsula */}
      <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <div className="app-progress-track" style={{ flex: 1 }}>
          <div className="app-progress-fill" style={{
            width: tieneObjetivo ? `${pct}%` : vacio ? '0%' : '100%',
            background: color,
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
      <span style={{ fontSize: '16px', fontWeight: '700', color: vacio ? 'var(--color-texto-inactivo)' : naranja ? 'var(--color-acento)' : 'var(--color-texto)' }}>
        {vacio ? '—' : valor}{!vacio && sufijo ? <span style={{ fontSize: '11px', color: 'var(--color-texto-secundario)', marginLeft: '2px' }}>{sufijo}</span> : null}
      </span>
    </div>
  )
}

// ─── Chip de hábito ───────────────────────────────────────────────────────

function ChipHabito({ label, activo }) {
  return (
    <div style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
      padding: '13px 14px', borderRadius: '18px',
      backgroundColor: activo ? 'var(--color-acento-suave)' : 'var(--color-superficie-2)',
      border: `1px solid ${activo ? 'var(--color-borde-fuerte)' : 'var(--color-borde)'}`,
    }}>
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: activo ? 'var(--color-acento)' : 'var(--color-texto-inactivo)', flexShrink: 0 }} />
      <span style={{ fontSize: '13px', fontWeight: '600', color: activo ? 'var(--color-acento)' : 'var(--color-texto-secundario)' }}>{label}</span>
    </div>
  )
}

// ─── Celda de composición corporal ───────────────────────────────────────

function CeldaCorporal({ label, valor, sufijo }) {
  const vacio = valor === '' || valor === null || valor === undefined || valor === 0 || valor === '0'
  return (
    <div style={{ backgroundColor: 'var(--color-superficie-2)', border: '1px solid var(--color-borde)', borderRadius: '18px', padding: '14px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '5px' }}>
      <p style={{ margin: 0, fontSize: '10px', fontWeight: '600', color: 'var(--color-texto-terciario)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
      <p style={{ margin: 0, fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px', color: vacio ? 'var(--color-texto-inactivo)' : 'var(--color-texto)', lineHeight: 1 }}>
        {vacio ? '—' : valor}{!vacio && sufijo ? <span style={{ fontSize: '10px', fontWeight: '500', color: 'var(--color-texto-terciario)', marginLeft: '2px' }}>{sufijo}</span> : null}
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
  const vacio = !valor || valor === 0 || valor === ''
  return (
    <div style={{
      backgroundColor: 'var(--color-superficie-2)',
      border: '1px solid var(--color-borde)',
      borderRadius: '14px',
      padding: '10px 10px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
    }}>
      <p style={{ margin: 0, fontSize: '9px', fontWeight: '600', color: 'var(--color-texto-terciario)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center' }}>
        {label}
      </p>
      <p style={{
        margin: 0, fontSize: '16px', fontWeight: '800', letterSpacing: '-0.3px', lineHeight: 1,
        color: vacio ? 'var(--color-texto-inactivo)' : naranja ? 'var(--color-acento)' : 'var(--color-texto)',
      }}>
        {vacio ? '—' : valor}{!vacio && sufijo ? <span style={{ fontSize: '10px', fontWeight: '500', color: 'var(--color-texto-terciario)', marginLeft: '2px' }}>{sufijo}</span> : null}
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
        <button onClick={onBoton} style={{ background: 'none', border: 'none', color: 'var(--color-acento)', fontSize: '13px', fontWeight: '600', cursor: 'pointer', padding: 0 }}>
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
  mbEfectivo,
  onEditarDatos,
  onEditarEntrenamiento,
  tituloDropdown,
  onCambiarDia,
  onIrAFecha,
  onIrAMedidas,
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

  const esDia1 = fecha.endsWith('-01')

  const hoy = new Date()
  const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`
  const esHoy = fecha === hoyStr

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
  const [modalCalendario, setModalCalendario] = useState(false)

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
  const b = mbEfectivo || Number(e.metabolismoBasal) || 0
  const difKcal = (c || q || b) ? c - q - b : null

  return (
    <div style={{ padding: '0 16px 40px' }}>

      {/* ─ Cabecera ─ */}
      <div style={{ padding: '20px 0 0' }}>

        {/* Fila 1: selector solo */}
        <div style={{ marginBottom: '12px' }}>
          {tituloDropdown}
        </div>

        {/* Fila 2: < fecha > Hoy CAL Edit */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <button onClick={() => onCambiarDia(-1)} className="app-btn-nav" aria-label="Día anterior">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <p style={{ flex: 1, margin: 0, textAlign: 'center', fontSize: '14px', fontWeight: '600', color: esHoy ? 'var(--color-acento)' : 'var(--color-texto)' }}>
            {formatearFechaLarga(fecha)}
          </p>
          <button onClick={() => onCambiarDia(1)} className="app-btn-nav" aria-label="Día siguiente">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
          {!esHoy && (
            <button
              onClick={() => onIrAFecha(hoyStr)}
              style={{
                padding: '5px 12px', borderRadius: '20px',
                backgroundColor: 'transparent',
                border: '1px solid var(--color-borde)',
                color: 'var(--color-texto-secundario)',
                fontSize: '13px', fontWeight: '500', cursor: 'pointer',
                whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >
              Hoy
            </button>
          )}
          <button
            onClick={() => setModalCalendario(true)}
            className="app-btn-nav"
            aria-label="Abrir calendario"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="16" y1="2" x2="16" y2="6" />
            </svg>
          </button>
          <button
            onClick={onEditarDatos}
            className="app-btn-nav"
            style={{ color: 'var(--color-acento)' }}
          >
            <IconoEditar size={18} />
          </button>
        </div>
      </div>

      {modalCalendario && (
        <ModalCalendario
          fechaSeleccionada={fecha}
          mesInicial={Number(fecha.split('-')[1]) - 1}
          anioInicial={Number(fecha.split('-')[0])}
          onSeleccionarDia={(iso) => {
            onIrAFecha(iso)
            setModalCalendario(false)
          }}
          onCerrar={() => setModalCalendario(false)}
          titulo="Navegar a fecha"
        />
      )}

      {/* ══════════════════════════════════════════════
          SUEÑO
      ══════════════════════════════════════════════ */}
      <div className="app-card-elevada" style={{ marginBottom: '12px' }}>
        <TituloCard icono="🌙" titulo="Sueño" />
        {/* Número principal */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '5px', marginBottom: '16px' }}>
          <p className="app-stat-number" style={{ color: e.suenoMinutos > 0 ? 'var(--color-texto)' : 'var(--color-texto-inactivo)' }}>
            {e.suenoMinutos > 0 ? formatearSueno(e.suenoMinutos) : '—'}
          </p>
          {e.suenoMinutos > 0 && <p className="app-stat-label">h</p>}
        </div>
        {/* Split: Acostarse | Calidad */}
        <div className="app-split-grid">
          <div className="app-stat-card">
            <p className="app-stat-label">Acostarse</p>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px', color: e.suenoHoraAcostarse ? 'var(--color-texto)' : 'var(--color-texto-inactivo)', lineHeight: 1 }}>
              {e.suenoHoraAcostarse || '—'}
            </p>
          </div>
          <div className="app-stat-card">
            <p className="app-stat-label">Calidad</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px', color: e.suenoCalidad > 0 ? 'var(--color-acento)' : 'var(--color-texto-inactivo)', lineHeight: 1 }}>
                {e.suenoCalidad > 0 ? e.suenoCalidad : '—'}
              </p>
              {e.suenoCalidad > 0 && <p className="app-stat-label">/100</p>}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          NUTRICIÓN
      ══════════════════════════════════════════════ */}
      <div className="app-card-elevada" style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <span style={{ fontSize: '15px' }}>🥗</span>
            <p style={{ margin: 0, fontSize: '11px', fontWeight: '700', color: 'var(--color-texto-secundario)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Nutrición</p>
          </div>
          <div className="app-data-pill">
            <span style={{ fontSize: '10px' }}>MB</span>
            <span style={{ fontWeight: '700', color: b > 0 ? 'var(--color-texto)' : 'var(--color-texto-inactivo)' }}>{b > 0 ? `${b} kcal` : '—'}</span>
          </div>
        </div>
        {/* Quemadas | Anillo | Consumidas */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <ValorLateral valor={e.kcalQuemadas  || 0} label="Quemadas"   color="#ef4444" />
          <AnilloCentro valor={difKcal} objetivo={objetivos.kcalDiferencia} />
          <ValorLateral valor={e.kcalConsumidas || 0} label="Consumidas" color="#3b82f6" />
        </div>
        {/* Macros */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <PillMacro label="Proteínas" valor={e.proteinas}     color="var(--color-acento)"   objetivo={objetivos.proteinas}     />
          <PillMacro label="Carbos"    valor={e.carbohidratos} color="#3b82f6"               objetivo={objetivos.carbohidratos} />
          <PillMacro label="Grasas"    valor={e.grasas}        color="#a855f7"               objetivo={objetivos.grasas}        />
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          ACTIVIDAD Y HÁBITOS
      ══════════════════════════════════════════════ */}
      <div className="app-card-elevada" style={{ marginBottom: '12px' }}>
        <TituloCard icono="⚡" titulo="Actividad" />
        {/* Pasos | Agua */}
        <div className="app-split-grid" style={{ marginBottom: '12px' }}>
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
        {/* Esfuerzo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 4px', borderTop: '1px solid var(--color-borde)', borderBottom: '1px solid var(--color-borde)', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>💥</span>
            <span style={{ fontSize: '14px', color: 'var(--color-texto-secundario)' }}>Esfuerzo percibido</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
            <span style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px', color: e.esfuerzo > 0 ? 'var(--color-acento)' : 'var(--color-texto-inactivo)', lineHeight: 1 }}>
              {e.esfuerzo > 0 ? e.esfuerzo : '—'}
            </span>
            {e.esfuerzo > 0 && <span className="app-stat-label">%</span>}
          </div>
        </div>
        {/* Movilidad + Core */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <ChipHabito label="Movilidad" activo={!!e.movilidad} />
          <ChipHabito label="Core"      activo={!!e.core} />
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          BOTÓN TOMAR MEDIDAS (solo el día 1 de cada mes)
      ══════════════════════════════════════════════ */}
      {esDia1 && onIrAMedidas && (
        <button
          onClick={onIrAMedidas}
          className="app-btn-acento"
          style={{ width: '100%', marginBottom: '12px', gap: '10px', borderRadius: '22px', padding: '17px 24px' }}
        >
          <span style={{ fontSize: '18px' }}>📏</span>
          Tomar Medidas del Mes
        </button>
      )}

      {/* ══════════════════════════════════════════════
          COMPOSICIÓN CORPORAL
      ══════════════════════════════════════════════ */}
      <div className="app-card-elevada" style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <span style={{ fontSize: '15px' }}>⚖️</span>
            <p style={{ margin: 0, fontSize: '11px', fontWeight: '700', color: 'var(--color-texto-secundario)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Valores Corporales</p>
          </div>
          {(e.bascula || e.horaPesaje) && (
            <div className="app-data-pill">
              {e.bascula && <span style={{ fontWeight: '600' }}>{e.bascula}</span>}
              {e.bascula && e.horaPesaje && <span>·</span>}
              {e.horaPesaje && <span>{e.horaPesaje}</span>}
            </div>
          )}
        </div>

        {/* Peso hero + IMC/EC */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
          {/* Peso — hero a dos filas */}
          <div style={{
            gridRow: 'span 2',
            backgroundColor: 'var(--color-acento-suave)',
            border: '1px solid var(--color-borde-fuerte)',
            borderRadius: '22px',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '20px 12px', gap: '6px',
          }}>
            <p className="app-stat-label">Peso</p>
            <p className="app-stat-number" style={{ color: e.peso > 0 ? 'var(--color-acento)' : 'var(--color-texto-inactivo)' }}>
              {e.peso > 0 ? e.peso : '—'}
            </p>
            <p className="app-stat-label" style={{ color: e.peso > 0 ? 'var(--color-texto-terciario)' : 'transparent' }}>kg</p>
          </div>
          <CeldaCorporal label="IMC"           valor={e.imc} />
          <CeldaCorporal label="Edad Corporal" valor={e.edadCorporal} />
        </div>

        {/* Composición */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <CeldaCorporal label="% Grasa"    valor={e.grasaPorcentaje} sufijo="%" />
          <CeldaCorporal label="G. Visceral" valor={e.grasaVisceral} />
          <CeldaCorporal label="Músculo"    valor={e.musculo}         sufijo="kg" />
          <CeldaCorporal label="Masa Ósea"  valor={e.masaOsea}        sufijo="kg" />
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          ENTRENAMIENTO
      ══════════════════════════════════════════════ */}
      <div className="app-card-elevada" style={{ marginBottom: '12px' }}>
        <TituloCard icono="🏋️" titulo="Entrenamiento" />
        {/* Sin entrenamiento */}
        {!tieneEntrenamiento && (
          <button
            onClick={onEditarEntrenamiento}
            style={{ width: '100%', padding: '18px', backgroundColor: 'transparent', border: '1.5px dashed var(--color-borde-fuerte)', borderRadius: '20px', color: 'var(--color-texto-secundario)', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <span style={{ fontSize: '20px' }}>＋</span>
            Añadir entrenamiento
          </button>
        )}

        {/* Sesión + botón editar */}
        {tieneEntrenamiento && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: sesion ? '12px' : '0' }}>
            {sesion && (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', backgroundColor: 'var(--color-acento-suave)', border: '1px solid var(--color-borde-fuerte)', borderRadius: '18px' }}>
                <span style={{ fontSize: '16px' }}>📋</span>
                <p style={{ margin: 0, fontWeight: '700', color: 'var(--color-acento)', fontSize: '14px' }}>{sesion.nombre}</p>
              </div>
            )}
            <button
              onClick={onEditarEntrenamiento}
              style={{ background: 'none', border: 'none', color: 'var(--color-acento)', cursor: 'pointer', padding: 0, flexShrink: 0, display: 'flex', alignItems: 'center' }}
            >
              <IconoEditar />
            </button>
          </div>
        )}

        {/* Fuerza */}
        {ejerciciosDia.length > 0 && (
          <>
            <p style={{ margin: '4px 0 10px', fontSize: '11px', fontWeight: '700', color: 'var(--color-texto-secundario)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>💪 Fuerza</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '8px' }}>
              <CeldaGeneral label="Lugar"    valor={e.fuerzaLugar}        naranja={!!e.fuerzaLugar} />
              <CeldaGeneral label="Hora"     valor={e.fuerzaHoraInicio} />
              <CeldaGeneral label="Duración" valor={e.fuerzaDuracion > 0 ? e.fuerzaDuracion : ''} sufijo="min" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              <CeldaGeneral label="Kcal"          valor={e.fuerzaKcalQuemadas > 0 ? e.fuerzaKcalQuemadas : ''}         sufijo="kcal" />
              <CeldaGeneral label="Frec. Cardíaca" valor={e.fuerzaFrecuenciaCardiaca > 0 ? e.fuerzaFrecuenciaCardiaca : ''} sufijo="lpm" />
            </div>
            {ejerciciosDia.map((item, idx) => {
              const ej  = mapaEjercicios[item.ejercicioId]
              if (!ej) return null
              const tendencia  = tendencias[item.ejercicioId]
              const abierto    = expandido === idx
              const tieneNota  = item.sensaciones?.trim()
              return (
                <div key={idx} style={{ backgroundColor: 'var(--color-superficie-2)', border: '1px solid var(--color-borde)', borderRadius: '18px', marginBottom: '8px', overflow: 'hidden' }}>
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
                      <p style={{ margin: 0, fontWeight: '800', color: 'var(--color-acento)', fontSize: '17px', flexShrink: 0, lineHeight: 1 }}>
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
            <p style={{ margin: ejerciciosDia.length > 0 ? '14px 0 10px' : '4px 0 10px', fontSize: '11px', fontWeight: '700', color: 'var(--color-texto-secundario)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>🏃 Cardio</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              <CeldaGeneral label="Hora"           valor={e.cardioHoraInicio} />
              <CeldaGeneral label="Kcal"           valor={e.cardioKcalQuemadas > 0 ? e.cardioKcalQuemadas : ''}             sufijo="kcal" />
              <CeldaGeneral label="Frec. Cardíaca" valor={e.cardioFrecuenciaCardiaca > 0 ? e.cardioFrecuenciaCardiaca : ''} sufijo="lpm" />
            </div>
            {ejerciciosCardio.map((item, idx) => {
              const ej = mapaEjercicios[item.ejercicioId]
              if (!ej) return null
              const esVeces   = item.modo === 'veces'
              const abierto   = expandidoCardio === idx
              const tieneNota = item.sensaciones?.trim()
              const metricas  = [
                Number(item.duracion) > 0 ? { valor: item.duracion, unidad: 'min'                      } : null,
                item.ritmo            ?     { valor: item.ritmo,    unidad: esVeces ? 'rp/m' : 'km/h' } : null,
                Number(item.volumen)  > 0 ? { valor: item.volumen,  unidad: esVeces ? 'rp'   : 'km'   } : null,
              ].filter(Boolean)
              return (
                <div key={idx} style={{ backgroundColor: 'var(--color-superficie-2)', border: '1px solid var(--color-borde)', borderRadius: '18px', marginBottom: '8px', overflow: 'hidden' }}>
                  <div
                    onClick={() => tieneNota && setExpandidoCardio(abierto ? null : idx)}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', cursor: tieneNota ? 'pointer' : 'default' }}
                  >
                    <IconoEjercicio grupos={ej.gruposMuscular} grupoPrincipal={ej.grupoPrincipal} size={20} />
                    <p style={{ margin: 0, flex: 1, fontWeight: '600', color: 'var(--color-texto)', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ej.nombre}
                    </p>
                    {metricas.map((m, i) => (
                      <p key={i} style={{ margin: 0, fontWeight: '800', color: 'var(--color-acento)', fontSize: '15px', flexShrink: 0, lineHeight: 1 }}>
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
