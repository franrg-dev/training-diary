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
      <p style={{ margin: 0, fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {titulo}
      </p>
      <div style={{ flex: 1, height: '1px', backgroundColor: '#2e2e2e' }} />
    </div>
  )
}

// ─── Campo de lectura ─────────────────────────────────────────────────────

function Campo({ label, valor, sufijo, naranja = false }) {
  const vacio = valor === '' || valor === null || valor === undefined || valor === 0 || valor === '0' || valor === false
  return (
    <div>
      <p style={{ margin: '0 0 3px', fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </p>
      <p style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: vacio ? '#374151' : naranja ? '#f97316' : '#f5f5f5' }}>
        {vacio ? '—' : `${valor}${sufijo ? `\u00a0${sufijo}` : ''}`}
      </p>
    </div>
  )
}

// ─── Indicador booleano ───────────────────────────────────────────────────

function CampoCheck({ label, valor }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
      <p style={{ margin: 0, fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </p>
      <div style={{
        width: '20px', height: '20px', borderRadius: '5px',
        backgroundColor: valor ? '#f97316' : '#1e1e1e',
        border: `2px solid ${valor ? '#f97316' : '#374151'}`,
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

function Grid4({ children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px', marginBottom: '8px' }}>
      {children}
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

      <h1 style={{ margin: '0 0 20px', fontSize: '20px', fontWeight: '700', color: '#f5f5f5' }}>
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

      {/* Fila 4: Dif.KCal | Pr | Ch | Gr */}
      <Grid4>
        <Campo label="Dif.KCal" valor={difKcal} sufijo="kcal" naranja={difKcal !== '' && difKcal > 0} />
        <Campo label="Pr" valor={e.proteinas} sufijo="g" />
        <Campo label="Ch" valor={e.carbohidratos} sufijo="g" />
        <Campo label="Gr" valor={e.grasas} sufijo="g" />
      </Grid4>

      {/* Fila 5: Pasos | Movilidad | Core | Agua */}
      <Grid4>
        <Campo label="Pasos" valor={e.pasos} />
        <CampoCheck label="Movilidad" valor={!!e.movilidad} />
        <CampoCheck label="Core" valor={!!e.core} />
        <Campo label="Agua" valor={e.agua} sufijo="L" />
      </Grid4>

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
