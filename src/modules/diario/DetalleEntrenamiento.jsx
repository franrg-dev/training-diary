import { useMemo, useState } from 'react'
import { COLORES_GRUPO } from '../ejercicios/coloresGrupo'
import { IconoEjercicio } from '../ejercicios/iconosEjercicio'

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
      <p style={{ margin: 0, fontSize: '9px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'center' }}>{label}</p>
      <p style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: vacio ? '#374151' : color, lineHeight: 1 }}>
        {vacio ? '—' : valor}
      </p>
      <p style={{ margin: 0, fontSize: '10px', color: '#6b7280' }}>kcal</p>
    </div>
  )
}

// ─── Anillo central (diferencia) ─────────────────────────────────────────

function AnilloCentro({ valor }) {
  const r    = 44
  const circ = 2 * Math.PI * r
  const arc  = circ * 0.82
  const esPos = valor !== null && valor > 0
  const esNeg = valor !== null && valor < 0
  const color = esPos ? '#f97316' : esNeg ? '#3b82f6' : '#374151'
  const glow  = valor !== null ? `drop-shadow(0 0 8px ${color}70)` : 'none'
  const texto = valor === null ? '—' : valor > 0 ? `+${valor}` : String(valor)

  return (
    <div style={{ position: 'relative', width: '106px', height: '106px', flexShrink: 0 }}>
      <svg width="106" height="106" viewBox="0 0 106 106" style={{ display: 'block' }}>
        <circle cx="53" cy="53" r={r} fill="none" stroke="#222" strokeWidth="8" />
        <circle cx="53" cy="53" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${arc} ${circ - arc}`}
          strokeDashoffset={circ * 0.09}
          transform="rotate(-90 53 53)"
          style={{ filter: glow }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ margin: 0, fontSize: texto.length > 4 ? '17px' : '21px', fontWeight: '800', color: valor !== null ? color : '#374151', lineHeight: 1 }}>
          {texto}
        </p>
        <p style={{ margin: '2px 0 0', fontSize: '9px', color: '#6b7280' }}>kcal</p>
      </div>
    </div>
  )
}

// ─── Pill de macro ────────────────────────────────────────────────────────

function PillMacro({ label, valor, color }) {
  const vacio = !valor || Number(valor) === 0
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
      padding: '10px 6px', backgroundColor: '#111', borderRadius: '12px',
    }}>
      <p style={{ margin: 0, fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </p>
      <p style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: vacio ? '#374151' : '#f5f5f5' }}>
        {vacio ? '—' : `${valor}g`}
      </p>
      <div style={{ width: '28px', height: '4px', borderRadius: '2px', backgroundColor: vacio ? '#2e2e2e' : color }} />
    </div>
  )
}

// ─── Fila de stat ─────────────────────────────────────────────────────────

function StatFila({ icono, label, valor, sufijo, naranja = false }) {
  const vacio = !valor || Number(valor) === 0 || valor === ''
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid #1f1f1f' }}>
      <span style={{ fontSize: '20px', width: '28px', textAlign: 'center', flexShrink: 0 }}>{icono}</span>
      <span style={{ flex: 1, fontSize: '14px', color: '#a1a1a1' }}>{label}</span>
      <span style={{ fontSize: '16px', fontWeight: '700', color: vacio ? '#374151' : naranja ? '#f97316' : '#f5f5f5' }}>
        {vacio ? '—' : valor}{!vacio && sufijo ? <span style={{ fontSize: '11px', color: '#6b7280', marginLeft: '2px' }}>{sufijo}</span> : null}
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
      backgroundColor: activo ? '#f9731622' : '#111',
      border: `1px solid ${activo ? '#f9731666' : '#2e2e2e'}`,
    }}>
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: activo ? '#f97316' : '#374151', flexShrink: 0 }} />
      <span style={{ fontSize: '12px', fontWeight: '600', color: activo ? '#f97316' : '#6b7280' }}>{label}</span>
    </div>
  )
}

// ─── Celda de composición corporal ───────────────────────────────────────

function CeldaCorporal({ label, valor, sufijo }) {
  const vacio = valor === '' || valor === null || valor === undefined || valor === 0 || valor === '0'
  return (
    <div style={{ backgroundColor: '#111', borderRadius: '12px', padding: '12px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <p style={{ margin: '0 0 3px', fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
      <p style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: vacio ? '#374151' : '#f5f5f5', lineHeight: 1 }}>
        {vacio ? '—' : valor}{!vacio && sufijo ? <span style={{ fontSize: '10px', color: '#6b7280', marginLeft: '2px' }}>{sufijo}</span> : null}
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

// ─── Cabecera de sección ──────────────────────────────────────────────────

function TituloSeccion({ titulo, botonLabel, onBoton }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
      <p style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#f5f5f5' }}>{titulo}</p>
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

  const c = Number(e.kcalConsumidas)   || 0
  const q = Number(e.kcalQuemadas)     || 0
  const b = Number(e.metabolismoBasal) || 0
  const difKcal = (c || q || b) ? c - q - b : null

  const tieneNutricion = e.kcalConsumidas || e.proteinas || e.carbohidratos || e.grasas

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
            style={{ backgroundColor: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: '8px', color: '#f97316', cursor: 'pointer', padding: '6px 8px', display: 'flex', alignItems: 'center' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#f5f5f5', whiteSpace: 'nowrap' }}>
            {formatearFechaCorta(fecha)}
          </p>
          <button
            onClick={() => onCambiarDia(1)}
            style={{ backgroundColor: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: '8px', color: '#f97316', cursor: 'pointer', padding: '6px 8px', display: 'flex', alignItems: 'center' }}
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
      <div style={{ backgroundColor: '#1a1a1a', borderRadius: '20px', padding: '20px', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Dato principal: horas de sueño */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111', borderRadius: '16px', padding: '16px 20px', minWidth: '100px' }}>
            <span style={{ fontSize: '28px', lineHeight: 1, marginBottom: '4px' }}>🌙</span>
            <p style={{ margin: '4px 0 2px', fontSize: '30px', fontWeight: '800', color: e.suenoHoras > 0 ? '#f5f5f5' : '#374151', lineHeight: 1 }}>
              {e.suenoHoras > 0 ? e.suenoHoras : '—'}
            </p>
            <p style={{ margin: 0, fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>horas</p>
          </div>
          {/* Datos secundarios */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <p style={{ margin: '0 0 2px', fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Acostarse</p>
              <p style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: e.suenoHoraAcostarse ? '#f5f5f5' : '#374151' }}>
                {e.suenoHoraAcostarse || '—'}
              </p>
            </div>
            <div style={{ height: '1px', backgroundColor: '#2a2a2a' }} />
            <div>
              <p style={{ margin: '0 0 2px', fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Puntuación</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <p style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: e.suenoCalidad > 0 ? '#f97316' : '#374151' }}>
                  {e.suenoCalidad > 0 ? e.suenoCalidad : '—'}
                </p>
                {e.suenoCalidad > 0 && <span style={{ fontSize: '12px', color: '#6b7280' }}>/10</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          NUTRICIÓN
      ══════════════════════════════════════════════ */}
      <div style={{ backgroundColor: '#1a1a1a', borderRadius: '20px', padding: '20px', marginBottom: '12px' }}>

        {/* MB centrado en texto pequeño */}
        {e.metabolismoBasal > 0 && (
          <p style={{ margin: '0 0 14px', textAlign: 'center', fontSize: '12px', color: '#6b7280' }}>
            MB: <span style={{ color: '#a1a1a1', fontWeight: '600' }}>{e.metabolismoBasal} kcal</span>
          </p>
        )}
        {!e.metabolismoBasal && (
          <p style={{ margin: '0 0 14px', textAlign: 'center', fontSize: '12px', color: '#374151' }}>MB: —</p>
        )}

        {/* Tres anillos: Quemadas | Diferencia | Consumidas */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <ValorLateral valor={e.kcalQuemadas  || 0} label="Quemadas"   color="#ef4444" />
          <AnilloCentro valor={difKcal} />
          <ValorLateral valor={e.kcalConsumidas || 0} label="Consumidas" color="#3b82f6" />
        </div>

        {/* Macros */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <PillMacro label="Proteínas" valor={e.proteinas}     color="#f97316" />
          <PillMacro label="Carbos"    valor={e.carbohidratos} color="#3b82f6" />
          <PillMacro label="Grasas"    valor={e.grasas}        color="#a855f7" />
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          ACTIVIDAD Y HÁBITOS
      ══════════════════════════════════════════════ */}
      <div style={{ backgroundColor: '#1a1a1a', borderRadius: '20px', padding: '20px', marginBottom: '12px' }}>
        <div style={{ margin: '0 -4px' }}>
          <StatFila icono="👟" label="Pasos"              valor={e.pasos > 0 ? e.pasos.toLocaleString('es') : null} />
          <StatFila icono="💧" label="Agua"               valor={e.agua > 0 ? e.agua : null}        sufijo="L" />
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
      <div style={{ backgroundColor: '#1a1a1a', borderRadius: '20px', padding: '20px', marginBottom: '12px' }}>

        {/* Báscula y hora — texto centrado, sin celda */}
        <p style={{ margin: '0 0 12px', textAlign: 'center', fontSize: '12px', color: '#6b7280' }}>
          {(e.bascula || e.horaPesaje)
            ? <>
                {e.bascula   && <span style={{ color: '#a1a1a1', fontWeight: '600' }}>{e.bascula}</span>}
                {e.bascula && e.horaPesaje && ' · '}
                {e.horaPesaje && <span style={{ color: '#a1a1a1', fontWeight: '600' }}>{e.horaPesaje}</span>}
              </>
            : <span style={{ color: '#374151' }}>—</span>
          }
        </p>

        {/* Fila 2-3: Peso (span 2 rows, cuadrado) | IMC / EC */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
          {/* Peso — naranja, span 2 filas */}
          <div style={{
            gridRow: 'span 2',
            backgroundColor: '#111', borderRadius: '14px',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 10px',
          }}>
            <p style={{ margin: 0, fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Peso</p>
            <p style={{ margin: 0, fontSize: '44px', fontWeight: '800', color: e.peso > 0 ? '#f97316' : '#374151', lineHeight: 1 }}>
              {e.peso > 0 ? e.peso : '—'}
            </p>
            <p style={{ margin: 0, fontSize: '10px', color: e.peso > 0 ? '#6b7280' : 'transparent' }}>kg</p>
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
      <div style={{ backgroundColor: '#1a1a1a', borderRadius: '20px', padding: '20px', marginBottom: '12px' }}>
        {/* Sin entrenamiento */}
        {!tieneEntrenamiento && (
          <button
            onClick={onEditarEntrenamiento}
            style={{ width: '100%', padding: '16px', backgroundColor: 'transparent', border: '1px dashed #374151', borderRadius: '14px', color: '#6b7280', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
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
            <p style={{ margin: '4px 0 8px', fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em' }}>💪 Fuerza</p>
            {ejerciciosDia.map((item, idx) => {
              const ej  = mapaEjercicios[item.ejercicioId]
              if (!ej) return null
              const tendencia  = tendencias[item.ejercicioId]
              const abierto    = expandido === idx
              const tieneNota  = item.sensaciones?.trim()
              return (
                <div key={idx} style={{ backgroundColor: '#111', borderRadius: '14px', marginBottom: '6px', overflow: 'hidden' }}>
                  {/* Fila principal — clicable si tiene sensaciones */}
                  <div
                    onClick={() => tieneNota && setExpandido(abierto ? null : idx)}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', cursor: tieneNota ? 'pointer' : 'default' }}
                  >
                    <IconoEjercicio grupos={ej.gruposMuscular} grupoPrincipal={ej.grupoPrincipal} size={20} />
                    <p style={{ margin: 0, flex: 1, fontWeight: '600', color: '#f5f5f5', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ej.nombre}
                    </p>
                    {Number(item.peso) > 0 && (
                      <p style={{ margin: 0, fontWeight: '800', color: '#f97316', fontSize: '17px', flexShrink: 0, lineHeight: 1 }}>
                        {item.peso}
                        <span style={{ fontSize: '10px', fontWeight: '500', color: '#6b7280', marginLeft: '2px' }}>{item.unidad || 'kg'}</span>
                      </p>
                    )}
                    <IconoTendencia tendencia={tendencia} />
                  </div>
                  {/* Sensaciones expandidas */}
                  {abierto && tieneNota && (
                    <div style={{ padding: '0 14px 12px', borderTop: '1px solid #1f1f1f' }}>
                      <p style={{ margin: '10px 0 0', fontSize: '13px', color: '#a1a1a1', lineHeight: '1.6' }}>
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
            <p style={{ margin: ejerciciosDia.length > 0 ? '12px 0 8px' : '4px 0 8px', fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em' }}>🏃 Cardio</p>
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
                <div key={idx} style={{ backgroundColor: '#111', borderRadius: '14px', marginBottom: '6px', overflow: 'hidden' }}>
                  <div
                    onClick={() => tieneNota && setExpandidoCardio(abierto ? null : idx)}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', cursor: tieneNota ? 'pointer' : 'default' }}
                  >
                    <IconoEjercicio grupos={ej.gruposMuscular} grupoPrincipal={ej.grupoPrincipal} size={20} />
                    <p style={{ margin: 0, flex: 1, fontWeight: '600', color: '#f5f5f5', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ej.nombre}
                    </p>
                    {metricas.map((m, i) => (
                      <p key={i} style={{ margin: 0, fontWeight: '800', color: '#f97316', fontSize: '15px', flexShrink: 0, lineHeight: 1 }}>
                        {m.valor}<span style={{ fontSize: '10px', fontWeight: '500', color: '#6b7280', marginLeft: '2px' }}>{m.unidad}</span>
                      </p>
                    ))}
                  </div>
                  {abierto && tieneNota && (
                    <div style={{ padding: '0 14px 12px', borderTop: '1px solid #1f1f1f' }}>
                      <p style={{ margin: '10px 0 0', fontSize: '13px', color: '#a1a1a1', lineHeight: '1.6' }}>
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
          <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #1f1f1f' }}>
            <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em' }}>💬 Sensaciones generales</p>
            <p style={{ margin: 0, fontSize: '13px', color: '#a1a1a1', lineHeight: '1.6' }}>{e.notasEntrenamiento}</p>
          </div>
        )}
      </div>

    </div>
  )
}
