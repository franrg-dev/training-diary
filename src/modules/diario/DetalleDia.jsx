import { getObjetivos } from '../ajustes/useObjetivos'

const DIAS_LARGO  = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const MESES_LARGO = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                     'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

function formatearFechaLarga(fechaStr) {
  const [anio, mes, dia] = fechaStr.split('-').map(Number)
  const d = new Date(anio, mes - 1, dia)
  return `${DIAS_LARGO[d.getDay()]}, ${dia} de ${MESES_LARGO[mes - 1]} de ${anio}`
}

// ─── Subsección ───────────────────────────────────────────────────────────

function SubSeccion({ titulo }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '16px 0 10px' }}>
      <p style={{ margin: 0, fontSize: '11px', fontWeight: '600', color: 'var(--color-texto-secundario)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {titulo}
      </p>
      <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-borde)' }} />
    </div>
  )
}

// ─── Campo de lectura ─────────────────────────────────────────────────────

function Campo({ label, valor, sufijo, naranja = false }) {
  const vacio = valor === '' || valor === null || valor === undefined || valor === 0 || valor === '0' || valor === false
  return (
    <div>
      <p style={{ margin: '0 0 3px', fontSize: '10px', color: 'var(--color-texto-secundario)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </p>
      <p style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: vacio ? 'var(--color-texto-inactivo)' : naranja ? '#f97316' : 'var(--color-texto)' }}>
        {vacio ? '—' : `${valor}${sufijo ? `\u00a0${sufijo}` : ''}`}
      </p>
    </div>
  )
}

// ─── Indicador booleano ───────────────────────────────────────────────────

function CampoCheck({ label, valor }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
      <p style={{ margin: 0, fontSize: '10px', color: 'var(--color-texto-secundario)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </p>
      <div style={{
        width: '20px', height: '20px', borderRadius: '5px',
        backgroundColor: valor ? '#f97316' : 'var(--color-superficie)',
        border: `2px solid ${valor ? '#f97316' : 'var(--color-texto-inactivo)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {valor && (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
    </div>
  )
}

// ─── Grids ────────────────────────────────────────────────────────────────

function Grid2({ children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
      {children}
    </div>
  )
}

function Grid3({ children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '8px' }}>
      {children}
    </div>
  )
}


// ─── Indicador circular KCal ──────────────────────────────────────────────

const ROJO    = '#f87171'
const NARANJA = '#f97316'
const VERDE   = '#4ade80'

function calcularEstadoKcal(dif, objetivo) {
  if (objetivo < 0) {
    if (dif > 0)           return { color: ROJO,    progreso: 1 }
    if (dif <= objetivo)   return { color: VERDE,   progreso: 1 }
    return { color: NARANJA, progreso: dif / objetivo } // ambos neg → 0..1
  }
  if (objetivo === 0) {
    const abs = Math.abs(dif)
    const color = abs <= 100 ? VERDE : abs <= 300 ? NARANJA : ROJO
    return { color, progreso: Math.min(abs / 300, 1) }
  }
  // objetivo > 0
  if (dif < 0)             return { color: ROJO,    progreso: 1 }
  if (dif >= objetivo)     return { color: VERDE,   progreso: 1 }
  return { color: NARANJA, progreso: dif / objetivo }
}

function IndicadorKcal({ difKcal, objetivo }) {
  const tieneObjetivo = objetivo !== 0 && objetivo != null
  const tieneDatos    = difKcal !== '' && difKcal != null

  let arcColor = null
  let progreso = 0
  let valColor = 'var(--color-texto-inactivo)'

  if (tieneDatos) {
    valColor = 'var(--color-texto)'
    if (tieneObjetivo) {
      const estado = calcularEstadoKcal(Number(difKcal), Number(objetivo))
      arcColor = estado.color
      progreso = Math.max(0, Math.min(1, estado.progreso))
      valColor = estado.color
    }
  }

  const signo = tieneDatos && Number(difKcal) > 0 ? '+' : ''
  const texto = tieneDatos ? `${signo}${difKcal}` : '—'

  // conic-gradient: empieza desde arriba (-90deg), rellena en sentido horario
  const PISTA = 'rgba(120,120,128,0.2)'
  const grados = progreso * 360
  const gradiente = arcColor && progreso > 0
    ? `conic-gradient(from -90deg, ${arcColor} ${grados}deg, ${PISTA} ${grados}deg)`
    : PISTA

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '14px',
      backgroundColor: 'var(--color-superficie-2)',
      border: '1px solid var(--color-borde)',
      borderRadius: '12px', padding: '12px 14px', marginBottom: '8px',
    }}>
      {/* Anillo — conic-gradient exterior + hueco interior del mismo color que la tarjeta */}
      <div style={{
        width: 54, height: 54, borderRadius: '50%',
        background: gradiente,
        flexShrink: 0, position: 'relative',
      }}>
        <div style={{
          position: 'absolute', top: 6, left: 6, right: 6, bottom: 6,
          borderRadius: '50%',
          backgroundColor: 'var(--color-superficie-2)',
        }} />
      </div>

      <div style={{ flex: 1 }}>
        <p style={{ margin: '0 0 2px', fontSize: '10px', color: 'var(--color-texto-secundario)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Dif. KCal
        </p>
        <p style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: valColor, lineHeight: 1 }}>
          {texto}{tieneDatos && <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--color-texto-secundario)' }}> kcal</span>}
        </p>
        {tieneObjetivo && tieneDatos && (
          <p style={{ margin: '3px 0 0', fontSize: '11px', color: 'var(--color-texto-secundario)' }}>
            Objetivo: {Number(objetivo) > 0 ? `+${objetivo}` : objetivo} kcal
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Barra de progreso ─────────────────────────────────────────────────────

function BarraProgreso({ icono, label, valor, objetivo, formato, objetivoFormato }) {
  const pct     = objetivo > 0 ? Math.min((valor / objetivo) * 100, 100) : 0
  const completo = valor >= objetivo
  const fmtVal  = formato ? formato(valor) : valor
  const fmtObj  = objetivoFormato ? objetivoFormato(objetivo) : objetivo

  return (
    <div style={{
      backgroundColor: 'var(--color-superficie-2)',
      border: `1px solid ${completo ? '#f9731666' : 'var(--color-borde)'}`,
      borderRadius: '12px',
      padding: '12px 14px',
      marginBottom: '8px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '16px', lineHeight: 1 }}>{icono}</span>
          <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-texto-secundario)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {label}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
          <span style={{ fontSize: '16px', fontWeight: '700', color: completo ? '#f97316' : 'var(--color-texto)' }}>
            {fmtVal}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--color-texto-secundario)' }}>
            / {fmtObj}
          </span>
        </div>
      </div>
      {/* Barra */}
      <div style={{ height: '6px', backgroundColor: 'var(--color-borde)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          backgroundColor: completo ? '#f97316' : '#f9731688',
          borderRadius: '3px',
          transition: 'width 0.3s ease',
        }} />
      </div>
      {pct > 0 && (
        <p style={{ margin: '5px 0 0', fontSize: '11px', color: 'var(--color-texto-secundario)', textAlign: 'right' }}>
          {Math.round(pct)}%{completo ? ' ✓' : ''}
        </p>
      )}
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────

/**
 * Vista de datos generales de un día (solo lectura).
 * entrada puede ser null si el día no tiene datos registrados.
 */
export default function DetalleDia({ fecha, entrada, onEditar, onVolver }) {
  const e = entrada || {}
  const objetivos = getObjetivos()

  // Diferencia kcal calculada
  const c = Number(e.kcalConsumidas)   || 0
  const q = Number(e.kcalQuemadas)     || 0
  const b = Number(e.metabolismoBasal) || 0
  const difKcal = (c || q || b) ? c - q - b : ''

  return (
    <div style={{ padding: '0 16px 40px' }}>

      {/* ─ Cabecera ─ */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px 0 6px', gap: '8px' }}>
        <button
          onClick={onVolver}
          style={{ background: 'none', border: 'none', color: '#f97316', fontSize: '14px', fontWeight: '600', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Entrenamiento
        </button>
        <div style={{ flex: 1 }} />
        <button
          onClick={onEditar}
          style={{ background: 'none', border: '1px solid #f97316', color: '#f97316', fontSize: '13px', fontWeight: '600', cursor: 'pointer', padding: '6px 14px', borderRadius: '8px' }}
        >
          Editar
        </button>
      </div>

      <h1 style={{ margin: '0 0 20px', fontSize: '20px', fontWeight: '700', color: 'var(--color-texto)' }}>
        {formatearFechaLarga(fecha)}
      </h1>

      {/* ══════════════════════════════════════════════
          DATOS GENERALES — LECTURA
      ══════════════════════════════════════════════ */}

      {/* Fila 1: Sueño | Acostarse | Puntuación */}
      <Grid3>
        <Campo label="Sueño" valor={e.suenoHoras} sufijo="h" />
        <Campo label="Acostarse" valor={e.suenoHoraAcostarse} />
        <Campo label="Puntuación" valor={e.suenoCalidad} />
      </Grid3>

      {/* Fila 2: %Esfuerzo | KCal Quemadas */}
      <Grid2>
        <Campo label="% Esfuerzo" valor={e.esfuerzo} sufijo="%" naranja={!!(e.esfuerzo)} />
        <Campo label="KCal Quemadas" valor={e.kcalQuemadas} sufijo="kcal" />
      </Grid2>

      {/* Fila 3: MB | KCal Consumidas */}
      <Grid2>
        <Campo label="MB" valor={e.metabolismoBasal} sufijo="kcal" />
        <Campo label="KCal Consumidas" valor={e.kcalConsumidas} sufijo="kcal" />
      </Grid2>

      {/* Indicador circular Dif.KCal */}
      <IndicadorKcal difKcal={difKcal} objetivo={objetivos.kcalDiferencia} />

      {/* Fila 4: Pr | Ch | Gr */}
      <Grid3>
        <Campo label="Pr" valor={e.proteinas} sufijo="g" />
        <Campo label="Ch" valor={e.carbohidratos} sufijo="g" />
        <Campo label="Gr" valor={e.grasas} sufijo="g" />
      </Grid3>

      {/* Fila 5: Movilidad | Core + barras de pasos y agua */}
      <Grid2>
        <CampoCheck label="Movilidad" valor={!!e.movilidad} />
        <CampoCheck label="Core" valor={!!e.core} />
      </Grid2>

      {/* Pasos — barra de progreso si hay objetivo */}
      {objetivos.pasos > 0
        ? <BarraProgreso
            icono="👟"
            label="Pasos"
            valor={Number(e.pasos) || 0}
            objetivo={objetivos.pasos}
            formato={v => v.toLocaleString('es')}
          />
        : <div style={{ marginBottom: '8px' }}><Campo label="Pasos" valor={e.pasos} /></div>
      }

      {/* Agua — barra de progreso si hay objetivo */}
      {objetivos.agua > 0
        ? <BarraProgreso
            icono="💧"
            label="Agua"
            valor={Number(e.agua) || 0}
            objetivo={objetivos.agua}
            formato={v => `${v.toFixed(1)} L`}
            objetivoFormato={v => `${v} L`}
          />
        : <div style={{ marginBottom: '8px' }}><Campo label="Agua" valor={e.agua} sufijo="L" /></div>
      }

      {/* ── Valores Corporales ── */}
      <SubSeccion titulo="Valores Corporales" />

      {/* Fila 6: Hora pesaje | Báscula */}
      <Grid2>
        <Campo label="Hora pesaje" valor={e.horaPesaje} />
        <Campo label="Báscula" valor={e.bascula} />
      </Grid2>

      {/* Fila 7: Peso | %Grasa | Músculo */}
      <Grid3>
        <Campo label="Peso" valor={e.peso} sufijo="kg" naranja={!!(e.peso)} />
        <Campo label="% Grasa" valor={e.grasaPorcentaje} sufijo="%" />
        <Campo label="Músculo" valor={e.musculo} sufijo="kg" />
      </Grid3>

      {/* Fila 8: IMC | G.Visceral | Masa Ósea */}
      <Grid3>
        <Campo label="IMC" valor={e.imc} />
        <Campo label="G.Visceral" valor={e.grasaVisceral} />
        <Campo label="Masa Ósea" valor={e.masaOsea} sufijo="kg" />
      </Grid3>

      {/* Fila 9: Edad Corporal */}
      <div style={{ maxWidth: '130px', marginBottom: '8px' }}>
        <Campo label="Edad Corporal" valor={e.edadCorporal} />
      </div>

    </div>
  )
}
