import { useState, useEffect, useRef } from 'react'
import { formatearFechaLarga } from '../habitos/habitosUtils'
import ModalCalendario from '../habitos/ModalCalendario'
import { useDiario } from '../diario/useDiario'
import { getObjetivos } from '../ajustes/useObjetivos'

function toFechaStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const hoyStr = toFechaStr(new Date())

// ─── Helpers kcal ─────────────────────────────────────────────────────────

const ROJO  = 'var(--color-peligro)'
const AMBAR = 'var(--color-acento-2)'
const VERDE = 'var(--color-exito)'

function calcularEstadoKcal(valor, objetivo) {
  if (!objetivo || objetivo === 0) return { color: ROJO, progreso: 0 }
  const pct = (valor / objetivo) * 100
  if (pct <= 0) return { color: ROJO, progreso: 0 }
  const progreso = Math.min(pct / 100, 1)
  let color
  if (pct < 75 || pct > 125)                                      color = ROJO
  else if ((pct >= 75 && pct < 90) || (pct > 110 && pct <= 125)) color = AMBAR
  else                                                              color = VERDE
  return { color, progreso }
}

// ─── ValorLateral ─────────────────────────────────────────────────────────

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

// ─── AnilloCentro ─────────────────────────────────────────────────────────

function AnilloCentro({ valor, objetivo, size = 230 }) {
  const cx   = size / 2
  const r    = size / 2.4
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
  const texto = String(v)
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

// ─── CeldaMacro ───────────────────────────────────────────────────────────

function CeldaMacro({ label, valor, sufijo, objetivo, barColor }) {
  const v   = Number(valor) || 0
  const pct = objetivo > 0 ? Math.min((v / objetivo) * 100, 100) : 0
  return (
    <div style={{
      backgroundColor: 'var(--color-superficie-2)',
      border: '1px solid var(--color-borde)',
      borderRadius: '14px',
      padding: '12px 10px',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: '6px',
    }}>
      <p style={{ margin: 0, fontSize: '11px', fontWeight: '600', color: 'var(--color-texto-terciario)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>{label}</p>
      <p style={{ margin: 0, fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px', lineHeight: 1, color: 'var(--color-texto)' }}>
        {v}{sufijo}
      </p>
      <div className="app-progress-track" style={{ width: '100%' }}>
        <div className="app-progress-fill" style={{ width: `${pct}%`, background: barColor }} />
      </div>
    </div>
  )
}

// ─── IconoPill ────────────────────────────────────────────────────────────

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

// ─── TarjetaNutricion ─────────────────────────────────────────────────────

const GAP_COLUMNAS = 12

function TarjetaNutricion({ e, objetivos }) {
  const refRow    = useRef(null)
  const refMacros = useRef(null)
  const [sizeAnillo, setSizeAnillo] = useState(150)

  useEffect(() => {
    const row    = refRow.current
    const macros = refMacros.current
    if (!row || !macros) return
    function calcular() {
      const anchoIzq = row.offsetWidth - macros.offsetWidth - GAP_COLUMNAS
      setSizeAnillo(Math.min(anchoIzq, macros.offsetHeight))
    }
    const ro = new ResizeObserver(calcular)
    ro.observe(row)
    ro.observe(macros)
    calcular()
    return () => ro.disconnect()
  }, [])

  return (
    <div className="app-tarjeta" style={{ marginBottom: '12px' }}>
      <div ref={refRow} style={{ display: 'flex', alignItems: 'flex-start', gap: `${GAP_COLUMNAS}px` }}>

        {/* Columna izquierda: título + anillo */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <IconoPill pillBg="rgba(100, 40, 110, 0.15)">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#8A4A9A">
                <path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z"/>
              </svg>
            </IconoPill>
            <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: 'var(--color-texto-secundario)' }}>Total</p>
          </div>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <AnilloCentro valor={Number(e.kcalConsumidas) || 0} objetivo={objetivos.kcalNutricion} size={sizeAnillo} />
          </div>
        </div>

        {/* Columna derecha: macros apilados */}
        <div ref={refMacros} style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '110px', flexShrink: 0 }}>
          <CeldaMacro label="Proteínas" valor={e.proteinas}    sufijo="g" objetivo={objetivos.proteinas}     barColor="var(--color-acento)" />
          <CeldaMacro label="Carbos"   valor={e.carbohidratos} sufijo="g" objetivo={objetivos.carbohidratos} barColor="#3b82f6"             />
          <CeldaMacro label="Grasas"   valor={e.grasas}        sufijo="g" objetivo={objetivos.grasas}        barColor="#a855f7"             />
        </div>

      </div>
    </div>
  )
}

// ─── NutricionDia ─────────────────────────────────────────────────────────

export default function NutricionDia({ tituloDropdown }) {
  const [fecha, setFecha]                     = useState(hoyStr)
  const [modalCalendario, setModalCalendario] = useState(false)

  const { entradaPorFecha } = useDiario()

  const esHoy = fecha === hoyStr

  function handleCambiarDia(delta) {
    const [anio, mes, dia] = fecha.split('-').map(Number)
    const d = new Date(anio, mes - 1, dia + delta)
    setFecha(toFechaStr(d))
  }

  const entrada   = entradaPorFecha(fecha) || {}
  const objetivos = getObjetivos()

  return (
    <div style={{ padding: '20px 16px 0' }}>

      {/* Fila 1: selector */}
      <div style={{ marginBottom: '12px' }}>
        {tituloDropdown}
      </div>

      {/* Fila 2: < fecha > Hoy CAL */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <button onClick={() => handleCambiarDia(-1)} className="app-btn-nav" aria-label="Día anterior">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <p style={{ flex: 1, margin: 0, textAlign: 'center', fontSize: '14px', fontWeight: '600', color: esHoy ? 'var(--color-acento)' : 'var(--color-texto)' }}>
          {formatearFechaLarga(fecha)}
        </p>
        <button onClick={() => handleCambiarDia(1)} className="app-btn-nav" aria-label="Día siguiente">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
        {!esHoy && (
          <button
            onClick={() => setFecha(hoyStr)}
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
      </div>

      {modalCalendario && (
        <ModalCalendario
          fechaSeleccionada={fecha}
          mesInicial={Number(fecha.split('-')[1]) - 1}
          anioInicial={Number(fecha.split('-')[0])}
          onSeleccionarDia={(iso) => { setFecha(iso); setModalCalendario(false) }}
          onCerrar={() => setModalCalendario(false)}
          titulo="Navegar a fecha"
        />
      )}

      {/* Tarjeta nutrición */}
      <TarjetaNutricion e={entrada} objetivos={objetivos} />

    </div>
  )
}
