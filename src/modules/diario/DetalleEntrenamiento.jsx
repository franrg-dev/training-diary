import { useMemo, useState, useEffect } from 'react'
import { COLORES_GRUPO } from '../ejercicios/coloresGrupo'
import { IconoEjercicio } from '../ejercicios/iconosEjercicio'
import { getObjetivos } from '../ajustes/useObjetivos'
import ModalCalendario from '../habitos/ModalCalendario'
import { formatearFechaLarga } from '../habitos/habitosUtils'

function parseSueno(minutos) {
  const m = parseInt(minutos, 10) || 0
  return { h: Math.floor(m / 60), min: m % 60 }
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
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px', gap: '5px' }}>
      <p style={{ margin: 0, fontSize: '10px', color: 'var(--color-texto-secundario)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>{label}</p>
      <p style={{ margin: 0, fontSize: '28px', fontWeight: '800', letterSpacing: '-1px', color, lineHeight: 1 }}>
        {Number(valor) || 0}
      </p>
      <p style={{ margin: 0, fontSize: '10px', color: 'var(--color-texto-terciario)' }}>kcal</p>
    </div>
  )
}

// ─── Anillo central (diferencia) ─────────────────────────────────────────

function AnilloCentro({ valor, objetivo, size = 230 }) {
  const cx   = size / 2
  const r    = size / 2.4  // Proporción para mantener el grosor visual
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

  const v = valor ?? 0
  const texto = v > 0 ? `+${v}` : String(v)
  const colorTexto = tieneObjetivo ? arcColor : 'var(--color-texto-secundario)'

  return (
    <div style={{ position: 'relative', width: `${size}px`, height: `${size}px`, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="rgba(150,150,150,0.15)" strokeWidth="14" />
        {progreso > 0 && (
          <circle cx={cx} cy={cx} r={r} fill="none"
            stroke={arcColor} strokeWidth="14"
            strokeDasharray={`${progreso * circ} ${(1 - progreso) * circ}`}
            strokeDashoffset="0"
            transform={`rotate(-90 ${cx} ${cx})`}
          />
        )}
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ margin: 0, fontSize: texto.length > 4 ? '20px' : '26px', fontWeight: '800', color: colorTexto, lineHeight: 1 }}>
          {texto}
        </p>
        <p style={{ margin: '3px 0 0', fontSize: '11px', color: 'var(--color-texto-secundario)' }}>kcal</p>
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
  const v = valor !== '' && valor !== null && valor !== undefined ? valor : 0
  return (
    <div style={{ backgroundColor: 'var(--color-superficie-2)', border: '1px solid var(--color-borde)', borderRadius: '18px', padding: '14px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '5px' }}>
      <p style={{ margin: 0, fontSize: '10px', fontWeight: '600', color: 'var(--color-texto-terciario)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
      <p style={{ margin: 0, fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px', color: 'var(--color-texto)', lineHeight: 1 }}>
        {v}{sufijo ? <span style={{ fontSize: '10px', fontWeight: '500', color: 'var(--color-texto-terciario)', marginLeft: '2px' }}>{sufijo}</span> : null}
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

// ─── Pill de icono ────────────────────────────────────────────────────────

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

// ─── Tarjeta Sueño ────────────────────────────────────────────────────────

function TarjetaSueno({ e }) {
  const { h, min } = parseSueno(e.suenoMinutos)
  return (
    <div className="app-tarjeta" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
        <IconoPill pillBg="rgba(20, 80, 100, 0.18)">
          <svg width="22" height="22" viewBox="0 -960 960 960" fill="#2A7A8C">
            <path d="M600-640 480-760l120-120 120 120-120 120Zm200 120-80-80 80-80 80 80-80 80ZM483-80q-84 0-157.5-32t-128-86.5Q143-253 111-326.5T79-484q0-146 93-257.5T409-880q-18 99 11 193.5T520-521q71 71 165.5 100T879-410q-26 144-138 237T483-80Zm0-80q88 0 163-44t118-121q-86-8-163-43.5T463-465q-61-61-97-138t-43-163q-77 43-120.5 118.5T159-484q0 135 94.5 229.5T483-160Zm-20-305Z"/>
          </svg>
        </IconoPill>
        <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: 'var(--color-texto-secundario)' }}>Sueño</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: '2px', marginBottom: '14px', paddingRight: '4px' }}>
        <span style={{ fontSize: '30px', fontWeight: '800', letterSpacing: '-1px', color: 'var(--color-acento)', lineHeight: 1 }}>{h}</span>
        <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-texto-secundario)', marginRight: '4px' }}>h</span>
        <span style={{ fontSize: '30px', fontWeight: '800', letterSpacing: '-1px', color: 'var(--color-acento)', lineHeight: 1 }}>{String(min).padStart(2, '0')}</span>
        <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-texto-secundario)' }}>m</span>
      </div>
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
          <p style={{ margin: 0, fontSize: '10px', fontWeight: '600', color: 'var(--color-texto-terciario)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Acostarse</p>
          <p style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: e.suenoHoraAcostarse ? 'var(--color-texto)' : 'var(--color-texto-inactivo)' }}>
            {e.suenoHoraAcostarse || '—'}
          </p>
        </div>
        <div style={{ width: '1px', backgroundColor: 'var(--color-borde)', alignSelf: 'stretch' }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
          <p style={{ margin: 0, fontSize: '10px', fontWeight: '600', color: 'var(--color-texto-terciario)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Calidad</p>
          <p style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: e.suenoCalidad > 0 ? 'var(--color-acento)' : 'var(--color-texto-inactivo)' }}>
            {e.suenoCalidad > 0 ? e.suenoCalidad : '—'}
            {e.suenoCalidad > 0 && <span style={{ fontSize: '10px', color: 'var(--color-texto-terciario)', marginLeft: '1px' }}>/100</span>}
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Celda de macro/stat para la tarjeta Nutrición ───────────────────────

function CeldaMacro({ label, valor, sufijo, objetivo, barColor }) {
  const v   = Number(valor) || 0
  const pct = objetivo > 0 ? Math.min((v / objetivo) * 100, 100) : 0
  return (
    <div style={{
      backgroundColor: 'var(--color-superficie-2)',
      border: '1px solid var(--color-borde)',
      borderRadius: '14px',
      padding: '10px 8px',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: '6px',
    }}>
      <p style={{ margin: 0, fontSize: '10px', fontWeight: '600', color: 'var(--color-texto-terciario)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>{label}</p>
      <p style={{ margin: 0, fontSize: '17px', fontWeight: '800', letterSpacing: '-0.5px', lineHeight: 1, color: 'var(--color-texto)' }}>
        {v}{sufijo}
      </p>
      <div className="app-progress-track" style={{ width: '100%' }}>
        <div className="app-progress-fill" style={{ width: `${pct}%`, background: barColor }} />
      </div>
    </div>
  )
}

// ─── Tarjeta Nutrición ────────────────────────────────────────────────────

function TarjetaNutricion({ e, difKcal, objetivos, mb }) {
  const [sizeAnillo, setSizeAnillo] = useState(230)

  useEffect(() => {
    function calcularTamano() {
      // En móvil/tablet reducir tamaño para que los laterales quepan
      const w = window.innerWidth
      if (w < 480) {
        setSizeAnillo(140)
      } else if (w < 640) {
        setSizeAnillo(170)
      } else {
        setSizeAnillo(230)
      }
    }
    calcularTamano()
    window.addEventListener('resize', calcularTamano)
    return () => window.removeEventListener('resize', calcularTamano)
  }, [])

  return (
    <div className="app-tarjeta" style={{ marginBottom: '12px' }}>
      {/* Header — z-index alto para quedar siempre sobre el anillo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0', position: 'relative', zIndex: 2 }}>
        <IconoPill pillBg="rgba(100, 40, 110, 0.15)">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#8A4A9A">
            <path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z"/>
          </svg>
        </IconoPill>
        <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: 'var(--color-texto-secundario)' }}>Nutrición</p>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: 'rgba(22,28,24,0.05)', borderRadius: '20px', padding: '4px 10px' }}>
          <span style={{ fontSize: '10px', color: 'var(--color-texto-terciario)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>MB</span>
          <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-texto)' }}>{mb > 0 ? `${mb} kcal` : '0 kcal'}</span>
        </div>
      </div>

      {/* Quemadas | Anillo diferencia | Consumidas — overlap dinámico según tamaño */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: `${-Math.round(sizeAnillo * 0.2)}px`, marginBottom: '12px', position: 'relative', zIndex: 1 }}>
        <ValorLateral valor={e.kcalQuemadas  || 0} label="Quemadas"   color="#ef4444" />
        <AnilloCentro valor={difKcal} objetivo={objetivos.kcalDiferencia} size={sizeAnillo} />
        <ValorLateral valor={e.kcalConsumidas || 0} label="Consumidas" color="#3b82f6" />
      </div>

      {/* Celdas: Macros */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        <CeldaMacro label="Proteínas" valor={e.proteinas}    sufijo="g" objetivo={objetivos.proteinas}     barColor="var(--color-acento)"  />
        <CeldaMacro label="Carbos"   valor={e.carbohidratos} sufijo="g" objetivo={objetivos.carbohidratos} barColor="#3b82f6"              />
        <CeldaMacro label="Grasas"   valor={e.grasas}        sufijo="g" objetivo={objetivos.grasas}        barColor="#a855f7"              />
      </div>
    </div>
  )
}

// ─── Tarjeta Pasos ────────────────────────────────────────────────────────

function TarjetaPasos({ e, objetivos }) {
  const obj = objetivos?.pasos || 0
  const pct = obj > 0 ? Math.min((Number(e.pasos || 0) / obj) * 100, 100) : 0
  return (
    <div className="app-tarjeta" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
          <IconoPill pillBg="rgba(150, 90, 10, 0.15)">
            <svg width="22" height="22" viewBox="0 -960 960 960" fill="#C4872A">
              <path d="M216-580q39 0 74 14t64 41l382 365h24q17 0 28.5-11.5T800-200q0-8-1.5-17T788-235L605-418l-71-214-74 18q-38 10-69-14t-31-63v-84l-28-14-154 206q-1 1-1 1.5t-1 1.5h40Zm0 80h-46q3 7 7.5 13t10.5 11l324 295q11 11 25 16t29 5h54L299-467q-17-17-38.5-25t-44.5-8ZM566-80q-30 0-57-11t-50-31L134-417q-46-42-51.5-103T114-631l154-206q17-23 45.5-30.5T368-861l28 14q21 11 32.5 30t11.5 42v84l74-19q30-8 58 7.5t38 44.5l65 196 170 170q20 20 27.5 43t7.5 49q0 50-35 85t-85 35H566Z"/>
            </svg>
          </IconoPill>
          <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: 'var(--color-texto-secundario)' }}>Pasos</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: '2px', marginBottom: '14px', paddingRight: '4px' }}>
          <span style={{ fontSize: '26px', fontWeight: '800', letterSpacing: '-1px', lineHeight: 1, color: 'var(--color-acento)' }}>
            {Number(e.pasos || 0).toLocaleString('es')}
          </span>
        </div>
      </div>
      <div style={{ width: '100%', height: '8px', borderRadius: '4px', backgroundColor: 'rgba(150,90,10,0.12)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, borderRadius: '4px', background: '#C4872A', transition: 'width 0.4s ease' }} />
      </div>
    </div>
  )
}

// ─── Tarjeta Agua ─────────────────────────────────────────────────────────

function TarjetaAgua({ e, objetivos }) {
  const v = Number(e.agua) || 0
  const obj = objetivos?.agua || 0
  const pct = obj > 0 ? Math.min((v / obj) * 100, 100) : 0
  return (
    <div className="app-tarjeta" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
          <IconoPill pillBg="rgba(20, 60, 180, 0.15)">
            <svg width="22" height="22" viewBox="0 -960 960 960" fill="#2B6ED9">
              <path d="M491-200q12-1 20.5-9.5T520-230q0-14-9-22.5t-23-7.5q-41 3-87-22.5T343-375q-2-11-10.5-18t-19.5-7q-14 0-23 10.5t-6 24.5q17 91 80 130t127 35Zm-239.5 26Q160-268 160-408q0-100 79.5-217.5T480-880q161 137 240.5 254.5T800-408q0 140-91.5 234T480-80q-137 0-228.5-94ZM652-230.5Q720-301 720-408q0-73-60.5-165T480-774Q361-665 300.5-573T240-408q0 107 68 177.5T480-160q104 0 172-70.5ZM480-480Z"/>
            </svg>
          </IconoPill>
          <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: 'var(--color-texto-secundario)' }}>Agua</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: '2px', marginBottom: '14px', paddingRight: '4px' }}>
          <span style={{ fontSize: '30px', fontWeight: '800', letterSpacing: '-1px', lineHeight: 1, color: 'var(--color-acento)' }}>
            {v.toFixed(1)}
          </span>
          <span style={{ fontSize: '20px', fontWeight: '500', color: 'var(--color-texto-secundario)' }}>ℓ</span>
        </div>
      </div>
      <div style={{ width: '100%', height: '8px', borderRadius: '4px', backgroundColor: 'rgba(20,60,180,0.12)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, borderRadius: '4px', background: '#2B6ED9', transition: 'width 0.4s ease' }} />
      </div>
    </div>
  )
}

// ─── Tarjeta Esfuerzo ─────────────────────────────────────────────────────

function TarjetaEsfuerzo({ e }) {
  return (
    <div className="app-tarjeta">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
        <IconoPill pillBg="rgba(150, 35, 10, 0.15)">
          <svg width="22" height="22" viewBox="0 -960 960 960" fill="#E04818">
            <path d="M300-840q52 0 99 22t81 62q34-40 81-62t99-22q94 0 157 63t63 157q0 5-.5 10t-.5 10h-80q1-5 1-10v-10q0-60-40-100t-100-40q-47 0-87 26.5T518-666h-76q-15-41-55-67.5T300-760q-60 0-100 40t-40 100v10q0 5 1 10H81q0-5-.5-10t-.5-10q0-94 63-157t157-63Zm-88 480h112q32 31 70 67t86 79q48-43 86-79t70-67h113q-38 42-90 91T538-158l-58 52-58-52q-69-62-120.5-111T212-360Zm230 40q13 0 22.5-7.5T478-347l54-163 35 52q5 8 14 13t19 5h320v-80H623l-69-102q-6-9-15.5-13.5T518-640q-13 0-22.5 7.5T482-613l-54 162-34-51q-5-8-14-13t-19-5H40v80h297l69 102q6 9 15.5 13.5T442-320Zm38-167Z"/>
          </svg>
        </IconoPill>
        <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: 'var(--color-texto-secundario)' }}>Esfuerzo</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: '2px', paddingRight: '4px' }}>
        <span style={{ fontSize: '38px', fontWeight: '800', letterSpacing: '-1.5px', lineHeight: 1, color: 'var(--color-acento)' }}>
          {e.esfuerzo || 0}
        </span>
        <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-texto-secundario)' }}>%</span>
      </div>
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
  const difKcal = c - q - b

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
          FILA 1: SUEÑO + ESFUERZO
      ══════════════════════════════════════════════ */}
      <div className="app-tarjeta-grid">
        <TarjetaSueno e={e} />
        <TarjetaEsfuerzo e={e} />
      </div>

      {/* ══════════════════════════════════════════════
          FILA 2: NUTRICIÓN
      ══════════════════════════════════════════════ */}
      <TarjetaNutricion e={e} difKcal={difKcal} objetivos={objetivos} mb={b} />

      {/* ══════════════════════════════════════════════
          FILA 3: PASOS + AGUA
      ══════════════════════════════════════════════ */}
      <div className="app-tarjeta-grid">
        <TarjetaPasos e={e} objetivos={objetivos} />
        <TarjetaAgua  e={e} objetivos={objetivos} />
      </div>

      {/* Movilidad + Core */}
      <div className="app-tarjeta" style={{ display: 'flex', gap: '0', marginBottom: '14px', padding: '14px 18px' }}>
        <ChipHabito label="Movilidad" activo={!!e.movilidad} />
        <div style={{ width: '1px', backgroundColor: 'var(--color-borde)', alignSelf: 'stretch', margin: '0 12px' }} />
        <ChipHabito label="Core"      activo={!!e.core} />
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
          VALORES CORPORALES
      ══════════════════════════════════════════════ */}
      <div className="app-tarjeta" style={{ marginBottom: '14px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <IconoPill pillBg="rgba(130, 55, 80, 0.15)">
            <svg width="22" height="22" viewBox="0 -960 960 960" fill="#A0506A">
              <path d="M80-120v-80h360v-447q-26-9-45-28t-28-45H240l120 280q0 50-41 85t-99 35q-58 0-99-35t-41-85l120-280h-80v-80h247q12-35 43-57.5t70-22.5q39 0 70 22.5t43 57.5h247v80h-80l120 280q0 50-41 85t-99 35q-58 0-99-35t-41-85l120-280H593q-9 26-28 45t-45 28v447h360v80H80Zm585-320h150l-75-174-75 174Zm-520 0h150l-75-174-75 174Zm335-280q17 0 28.5-11.5T520-760q0-17-11.5-28.5T480-800q-17 0-28.5 11.5T440-760q0 17 11.5 28.5T480-720Z"/>
            </svg>
          </IconoPill>
          <p style={{ margin: 0, flex: 1, fontSize: '15px', fontWeight: '600', color: 'var(--color-texto-secundario)' }}>Valores Corporales</p>
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
          <div style={{
            gridRow: 'span 2',
            backgroundColor: 'var(--color-acento-2-suave)',
            border: '1px solid rgba(226,125,96,0.25)',
            borderRadius: '22px',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '20px 12px', gap: '6px',
          }}>
            <p className="app-stat-label">Peso</p>
            <p className="app-stat-number" style={{ color: 'var(--color-acento-2)' }}>
              {e.peso > 0 ? e.peso : 0}
            </p>
            <p className="app-stat-label" style={{ color: 'var(--color-texto-terciario)' }}>kg</p>
          </div>
          <CeldaCorporal label="IMC"           valor={e.imc} />
          <CeldaCorporal label="Edad Corporal" valor={e.edadCorporal} />
        </div>

        {/* Composición */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <CeldaCorporal label="% Grasa"     valor={e.grasaPorcentaje} sufijo="%" />
          <CeldaCorporal label="G. Visceral" valor={e.grasaVisceral} />
          <CeldaCorporal label="Músculo"     valor={e.musculo}         sufijo="kg" />
          <CeldaCorporal label="Masa Ósea"   valor={e.masaOsea}        sufijo="kg" />
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          ENTRENAMIENTO
      ══════════════════════════════════════════════ */}
      <div className="app-tarjeta" style={{ marginBottom: '14px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <IconoPill pillBg="rgba(226, 125, 96, 0.15)">
            <svg width="22" height="22" viewBox="0 -960 960 960" fill="#E27D60">
              <path d="m826-585-56-56 30-31-128-128-31 30-57-57 30-31q23-23 57-22.5t57 23.5l129 129q23 23 23 56.5T857-615l-31 30ZM346-104q-23 23-56.5 23T233-104L104-233q-23-23-23-56.5t23-56.5l30-30 57 57-31 30 129 129 30-31 57 57-30 30Zm397-336 57-57-303-303-57 57 303 303ZM463-160l57-58-302-302-58 57 303 303Zm-6-234 110-109-64-64-109 110 63 63Zm63 290q-23 23-57 23t-57-23L104-406q-23-23-23-57t23-57l57-57q23-23 56.5-23t56.5 23l63 63 110-110-63-62q-23-23-23-57t23-57l57-57q23-23 56.5-23t56.5 23l303 303q23 23 23 56.5T857-441l-57 57q-23 23-57 23t-57-23l-62-63-110 110 63 63q23 23 23 56.5T577-161l-57 57Z"/>
            </svg>
          </IconoPill>
          <p style={{ margin: 0, flex: 1, fontSize: '15px', fontWeight: '600', color: 'var(--color-texto-secundario)' }}>Entrenamiento</p>
          <button
            onClick={onEditarEntrenamiento}
            style={{ background: 'none', border: 'none', color: 'var(--color-acento)', cursor: 'pointer', padding: 0, flexShrink: 0, display: 'flex', alignItems: 'center' }}
          >
            <IconoEditar />
          </button>
        </div>

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

        {/* Sesión */}
        {tieneEntrenamiento && sesion && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', backgroundColor: 'var(--color-acento-suave)', border: '1px solid var(--color-borde-fuerte)', borderRadius: '18px', marginBottom: '12px' }}>
            <span style={{ fontSize: '16px' }}>📋</span>
            <p style={{ margin: 0, fontWeight: '700', color: 'var(--color-acento)', fontSize: '14px' }}>{sesion.nombre}</p>
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
