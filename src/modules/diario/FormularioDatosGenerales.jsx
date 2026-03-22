import { useState, useMemo } from 'react'

const DIAS_LARGO  = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const MESES_LARGO = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                     'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

function formatearFechaLarga(fechaStr) {
  const [anio, mes, dia] = fechaStr.split('-').map(Number)
  const d = new Date(anio, mes - 1, dia)
  return `${DIAS_LARGO[d.getDay()]}, ${dia} de ${MESES_LARGO[mes - 1]}`
}

// ─── Input horas + minutos (ej. duración sueño) ───────────────────────────
// Almacena como "7.5" (horas decimales) para compatibilidad con el resto

function InputHorasMin({ value, onChange }) {
  // Convertir valor decimal a hh/mm internos
  const totalMin = Math.round((parseFloat(value) || 0) * 60)
  const hhInicial = value ? String(Math.floor(totalMin / 60)) : ''
  const mmInicial = value ? String(totalMin % 60).padStart(2, '0') : ''

  const [hh, setHh] = useState(hhInicial)
  const [mm, setMm] = useState(mmInicial)

  function emitir(nuevaHh, nuevaMm) {
    const h = parseInt(nuevaHh, 10) || 0
    const m = parseInt(nuevaMm,  10) || 0
    if (nuevaHh === '' && nuevaMm === '') { onChange(''); return }
    onChange(String(Math.round((h + m / 60) * 100) / 100))
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <div style={{ position: 'relative', flex: 1 }}>
        <input
          type="number" inputMode="numeric" placeholder="0" min="0" max="23"
          value={hh}
          onChange={e => { setHh(e.target.value); emitir(e.target.value, mm) }}
          style={{ ...estiloInputBase, textAlign: 'center', paddingRight: '18px' }}
        />
        <span style={{ ...estiloSufijo }}>h</span>
      </div>
      <div style={{ position: 'relative', flex: 1 }}>
        <input
          type="number" inputMode="numeric" placeholder="00" min="0" max="59"
          value={mm}
          onChange={e => { setMm(e.target.value); emitir(hh, e.target.value) }}
          style={{ ...estiloInputBase, textAlign: 'center', paddingRight: '22px' }}
        />
        <span style={{ ...estiloSufijo }}>min</span>
      </div>
    </div>
  )
}

// ─── Input hora (selector nativo 24h) ────────────────────────────────────

function InputHora({ value, onChange }) {
  return (
    <input
      type="time"
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      style={{ ...estiloInputBase, textAlign: 'center', colorScheme: 'dark' }}
    />
  )
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

// ─── Input numérico compacto ──────────────────────────────────────────────

function InputNum({ label, placeholder = '0', value, onChange, sufijo, readOnly = false, highlight = false, min }) {
  return (
    <div>
      <label style={estiloLabelPequeno}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type="number"
          inputMode="decimal"
          placeholder={placeholder}
          value={value}
          min={min}
          onChange={e => onChange && onChange(e.target.value)}
          readOnly={readOnly}
          style={{
            ...estiloInputBase,
            textAlign: 'center',
            color: readOnly ? '#4b5563' : highlight ? '#f97316' : '#f5f5f5',
            backgroundColor: readOnly ? '#111' : '#1e1e1e',
            paddingRight: sufijo ? '30px' : '10px',
            fontWeight: highlight ? '700' : '400',
          }}
        />
        {sufijo && <span style={estiloSufijo}>{sufijo}</span>}
      </div>
    </div>
  )
}

// ─── Checkbox compacto (para filas de 4 columnas) ────────────────────────

function CheckCompact({ label, checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        width: '100%', padding: '9px 4px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '5px',
        backgroundColor: checked ? '#f9731622' : '#1e1e1e',
        border: `1px solid ${checked ? '#f97316' : '#2e2e2e'}`,
        borderRadius: '8px', cursor: 'pointer',
        color: checked ? '#f97316' : '#6b7280',
        transition: 'all 0.15s',
      }}
    >
      <div style={{
        width: '16px', height: '16px', borderRadius: '4px', flexShrink: 0,
        backgroundColor: checked ? '#f97316' : 'transparent',
        border: `2px solid ${checked ? '#f97316' : '#4b5563'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {checked && (
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span style={{ fontSize: '10px', fontWeight: checked ? '600' : '400', textTransform: 'uppercase', letterSpacing: '0.03em', lineHeight: 1 }}>{label}</span>
    </button>
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

export default function FormularioDatosGenerales({
  fecha,
  entrada,
  onGuardar,
  onCancelar,
}) {
  // — Nutrición —
  const [kcalConsumidas, setKcalConsumidas] = useState(entrada?.kcalConsumidas || '')
  const [proteinas, setProteinas]           = useState(entrada?.proteinas      || '')
  const [carbohidratos, setCarbohidratos]   = useState(entrada?.carbohidratos  || '')
  const [grasas, setGrasas]                 = useState(entrada?.grasas         || '')

  // — Actividad —
  const [kcalQuemadas, setKcalQuemadas]         = useState(entrada?.kcalQuemadas    || '')
  const [metabolismoBasal, setMetabolismoBasal] = useState(entrada?.metabolismoBasal || '')
  const [pasos, setPasos]                       = useState(entrada?.pasos           || '')

  // — Hábitos —
  const [movilidad, setMovilidad] = useState(entrada?.movilidad ?? false)
  const [core, setCore]           = useState(entrada?.core      ?? false)
  const [agua, setAgua]           = useState(entrada?.agua      || '')

  // — Sueño —
  const [suenoHoras, setSuenoHoras]                 = useState(entrada?.suenoHoras         || '')
  const [suenoHoraAcostarse, setSuenoHoraAcostarse] = useState(entrada?.suenoHoraAcostarse || '')
  const [suenoCalidad, setSuenoCalidad]             = useState(entrada?.suenoCalidad       || '')

  // — Esfuerzo —
  const [esfuerzo, setEsfuerzo] = useState(entrada?.esfuerzo || '')

  // — Composición corporal —
  const [horaPesaje, setHoraPesaje]           = useState(entrada?.horaPesaje      || '')
  const [bascula, setBascula]                 = useState(entrada?.bascula         || '')
  const [peso, setPeso]                       = useState(entrada?.peso            || '')
  const [imc, setImc]                         = useState(entrada?.imc             || '')
  const [grasaPorcentaje, setGrasaPorcentaje] = useState(entrada?.grasaPorcentaje || '')
  const [grasaVisceral, setGrasaVisceral]     = useState(entrada?.grasaVisceral   || '')
  const [musculo, setMusculo]                 = useState(entrada?.musculo         || '')
  const [masaOsea, setMasaOsea]               = useState(entrada?.masaOsea        || '')
  const [edadCorporal, setEdadCorporal]       = useState(entrada?.edadCorporal    || '')

  const [guardando, setGuardando] = useState(false)
  const [errorMsg,  setErrorMsg]  = useState(null)

  // Diferencia kcal (auto)
  const diferenciaKcal = useMemo(() => {
    const c = Number(kcalConsumidas)   || 0
    const q = Number(kcalQuemadas)     || 0
    const b = Number(metabolismoBasal) || 0
    return (c || q || b) ? c - q - b : ''
  }, [kcalConsumidas, kcalQuemadas, metabolismoBasal])

  async function handleGuardar() {
    setGuardando(true)
    setErrorMsg(null)
    try {
      await onGuardar({
        kcalConsumidas, proteinas, carbohidratos, grasas,
        kcalQuemadas, metabolismoBasal, pasos,
        movilidad, core, agua,
        suenoHoras, suenoHoraAcostarse, suenoCalidad,
        esfuerzo,
        horaPesaje, bascula,
        peso, imc, grasaPorcentaje, grasaVisceral, musculo, masaOsea, edadCorporal,
      })
    } catch (err) {
      console.error('Error al guardar datos:', err)
      setErrorMsg(err?.message || String(err) || 'Error desconocido')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div style={{ padding: '0 16px 40px' }}>

      {/* ─ Cabecera ─ */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px 0 20px', gap: '8px' }}>
        <button
          onClick={onCancelar}
          style={{ background: 'none', border: 'none', color: '#f97316', fontSize: '14px', fontWeight: '600', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Volver
        </button>
        <p style={{ flex: 1, margin: 0, fontSize: '15px', fontWeight: '700', color: '#f5f5f5', textAlign: 'center' }}>
          {formatearFechaLarga(fecha)}
        </p>
        <div style={{ width: '52px' }} />
      </div>

      {/* ══════════════════════════════════════════════
          DATOS GENERALES
      ══════════════════════════════════════════════ */}

      {/* Fila 1: Sueño horas+min | Puntuación */}
      <Grid2>
        <div>
          <label style={estiloLabelPequeno}>Sueño</label>
          <InputHorasMin value={suenoHoras} onChange={setSuenoHoras} />
        </div>
        <InputNum label="Puntuación" placeholder="8" value={suenoCalidad} onChange={setSuenoCalidad} />
      </Grid2>

      {/* Fila 2: Acostarse */}
      <div style={{ marginBottom: '8px' }}>
        <label style={estiloLabelPequeno}>Acostarse</label>
        <InputHora value={suenoHoraAcostarse} onChange={setSuenoHoraAcostarse} />
      </div>

      {/* Fila 2: %Esfuerzo | KCal Quemadas */}
      <Grid2>
        <InputNum label="% Esfuerzo" placeholder="70" value={esfuerzo} onChange={setEsfuerzo} sufijo="%" highlight={!!esfuerzo} />
        <InputNum label="KCal Quemadas" value={kcalQuemadas} onChange={setKcalQuemadas} sufijo="kcal" />
      </Grid2>

      {/* Fila 3: MB | KCal Consumidas */}
      <Grid2>
        <InputNum label="MB" placeholder="0" value={metabolismoBasal} onChange={setMetabolismoBasal} sufijo="kcal" />
        <InputNum label="KCal Consumidas" value={kcalConsumidas} onChange={setKcalConsumidas} sufijo="kcal" />
      </Grid2>

      {/* Fila 4: Dif.KCal | Pr | Ch | Gr */}
      <Grid4>
        <InputNum label="Dif.KCal" value={diferenciaKcal} readOnly
          highlight={diferenciaKcal !== '' && diferenciaKcal > 0} sufijo="kcal" />
        <InputNum label="Pr" placeholder="0" value={proteinas} onChange={setProteinas} sufijo="g" />
        <InputNum label="Ch" placeholder="0" value={carbohidratos} onChange={setCarbohidratos} sufijo="g" />
        <InputNum label="Gr" placeholder="0" value={grasas} onChange={setGrasas} sufijo="g" />
      </Grid4>

      {/* Fila 5: Pasos | Movilidad | Core | Agua */}
      <Grid4>
        <InputNum label="Pasos" placeholder="0" value={pasos} onChange={setPasos} />
        <CheckCompact label="Movilidad" checked={movilidad} onChange={setMovilidad} />
        <CheckCompact label="Core" checked={core} onChange={setCore} />
        <InputNum label="Agua" placeholder="0.0" value={agua} onChange={setAgua} sufijo="L" />
      </Grid4>

      {/* ── Valores Corporales ── */}
      <SubSeccion titulo="Valores Corporales" />

      {/* Fila 6: Hora pesaje | Báscula */}
      <Grid2>
        <div>
          <label style={estiloLabelPequeno}>Hora pesaje</label>
          <InputHora value={horaPesaje} onChange={setHoraPesaje} />
        </div>
        <div>
          <label style={estiloLabelPequeno}>Báscula</label>
          <select value={bascula} onChange={e => setBascula(e.target.value)}
            style={{ ...estiloInputBase, color: bascula ? '#f5f5f5' : '#4b5563' }}>
            <option value="">—</option>
            <option value="B.Valencia">B.Valencia</option>
            <option value="B.Jumilla">B.Jumilla</option>
          </select>
        </div>
      </Grid2>

      {/* Fila 7: Peso | %Grasa | Músculo */}
      <Grid3>
        <InputNum label="Peso" placeholder="70.0" value={peso} onChange={setPeso} sufijo="kg" highlight={!!peso} min={0} />
        <InputNum label="% Grasa" placeholder="15.0" value={grasaPorcentaje} onChange={setGrasaPorcentaje} sufijo="%" min={0} />
        <InputNum label="Músculo" placeholder="55.0" value={musculo} onChange={setMusculo} sufijo="kg" min={0} />
      </Grid3>

      {/* Fila 8: IMC | Grasa Visceral | Masa Ósea */}
      <Grid3>
        <InputNum label="IMC" placeholder="22.5" value={imc} onChange={setImc} min={0} />
        <InputNum label="G.Visceral" placeholder="5" value={grasaVisceral} onChange={setGrasaVisceral} min={0} />
        <InputNum label="Masa Ósea" placeholder="3.0" value={masaOsea} onChange={setMasaOsea} sufijo="kg" min={0} />
      </Grid3>

      {/* Fila 9: Edad Corporal */}
      <div style={{ maxWidth: '130px', marginBottom: '24px' }}>
        <InputNum label="Edad Corporal" placeholder="25" value={edadCorporal} onChange={setEdadCorporal} min={0} />
      </div>

      {/* Error */}
      {errorMsg && (
        <div style={{ backgroundColor: '#7f1d1d', border: '1px solid #ef4444', borderRadius: '10px', padding: '12px 14px', marginBottom: '12px' }}>
          <p style={{ margin: 0, fontSize: '13px', color: '#fca5a5', fontWeight: '600' }}>Error al guardar:</p>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#fca5a5' }}>{errorMsg}</p>
        </div>
      )}

      {/* Botón guardar */}
      <button
        type="button"
        onClick={handleGuardar}
        disabled={guardando}
        style={{
          width: '100%', padding: '14px',
          backgroundColor: guardando ? '#374151' : '#f97316',
          color: '#fff', fontWeight: '700', fontSize: '16px',
          border: 'none', borderRadius: '12px', cursor: guardando ? 'default' : 'pointer',
        }}
      >
        {guardando ? 'Guardando…' : 'Guardar'}
      </button>

    </div>
  )
}

// ─── Estilos ─────────────────────────────────────────────────────────────

function estiloAccion(dis) {
  return { background: 'none', border: 'none', color: dis ? '#6b7280' : '#f97316', fontSize: '14px', fontWeight: '600', cursor: dis ? 'default' : 'pointer', padding: 0, whiteSpace: 'nowrap' }
}

const estiloLabelPequeno = { display: 'block', marginBottom: '4px', fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }
const estiloInputBase    = { width: '100%', padding: '10px', backgroundColor: '#1e1e1e', border: '1px solid #2e2e2e', borderRadius: '8px', color: '#f5f5f5', fontSize: '14px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }
const estiloSufijo       = { position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px', color: '#4b5563', pointerEvents: 'none' }
