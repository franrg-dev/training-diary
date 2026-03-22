import { useState, useMemo } from 'react'
import { COLORES_GRUPO } from '../ejercicios/coloresGrupo'

const DIAS_LARGO  = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const MESES_LARGO = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                     'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

function formatearFechaLarga(fechaStr) {
  const [anio, mes, dia] = fechaStr.split('-').map(Number)
  const d = new Date(anio, mes - 1, dia)
  return `${DIAS_LARGO[d.getDay()]}, ${dia} de ${MESES_LARGO[mes - 1]}`
}

// ─── Cabecera de sección ─────────────────────────────────────────────────

function Seccion({ icono, titulo }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '24px 0 14px' }}>
      <span style={{ fontSize: '18px', lineHeight: 1 }}>{icono}</span>
      <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-texto)' }}>{titulo}</span>
      <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-borde)', marginLeft: '6px' }} />
    </div>
  )
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

// ─── Input numérico compacto ──────────────────────────────────────────────

function InputNum({ label, placeholder = '0', value, onChange, sufijo, readOnly = false, highlight = false }) {
  return (
    <div>
      <label style={estiloLabelPequeno}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type="number"
          inputMode="decimal"
          placeholder={placeholder}
          value={value}
          onChange={e => onChange && onChange(e.target.value)}
          readOnly={readOnly}
          style={{
            ...estiloInputBase,
            textAlign: 'center',
            color: readOnly ? 'var(--color-texto-inactivo)' : highlight ? '#f97316' : 'var(--color-texto)',
            backgroundColor: readOnly ? 'var(--color-fondo)' : 'var(--color-superficie)',
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
        backgroundColor: checked ? '#f9731622' : 'var(--color-superficie)',
        border: `1px solid ${checked ? '#f97316' : 'var(--color-borde)'}`,
        borderRadius: '8px', cursor: 'pointer',
        color: checked ? '#f97316' : 'var(--color-texto-secundario)',
        transition: 'all 0.15s',
      }}
    >
      <div style={{
        width: '16px', height: '16px', borderRadius: '4px', flexShrink: 0,
        backgroundColor: checked ? '#f97316' : 'transparent',
        border: `2px solid ${checked ? '#f97316' : 'var(--color-texto-inactivo)'}`,
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

export default function FormularioDia({
  fecha,
  entrada,
  ejercicios,
  sesiones,
  ultimoPorEjercicio,
  onGuardar,
  onCancelar,
  onEliminar,
}) {
  // — Fuerza —
  const [sesionId, setSesionId]           = useState(entrada?.sesionId || null)
  const [ejerciciosDia, setEjerciciosDia] = useState(() => entrada?.ejerciciosDia || [])
  const [selectorSesionAbierto, setSelectorSesionAbierto] = useState(false)
  const [selectorFuerzaAbierto, setSelectorFuerzaAbierto] = useState(false)
  const [busquedaFuerza, setBusquedaFuerza]               = useState('')

  // — Cardio —
  const [ejerciciosCardio, setEjerciciosCardio]           = useState(() => entrada?.ejerciciosCardio || [])
  const [selectorCardioAbierto, setSelectorCardioAbierto] = useState(false)
  const [busquedaCardio, setBusquedaCardio]               = useState('')

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
  const [suenoHoras, setSuenoHoras]                   = useState(entrada?.suenoHoras         || '')
  const [suenoHoraAcostarse, setSuenoHoraAcostarse]   = useState(entrada?.suenoHoraAcostarse || '')
  const [suenoCalidad, setSuenoCalidad]               = useState(entrada?.suenoCalidad       || '')

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

  const [guardando, setGuardando]             = useState(false)
  const [confirmarBorrar, setConfirmarBorrar] = useState(false)
  const [eliminando, setEliminando]           = useState(false)

  // Diferencia kcal (auto)
  const diferenciaKcal = useMemo(() => {
    const c = Number(kcalConsumidas)  || 0
    const q = Number(kcalQuemadas)    || 0
    const b = Number(metabolismoBasal) || 0
    return (c || q || b) ? c - q - b : ''
  }, [kcalConsumidas, kcalQuemadas, metabolismoBasal])

  // Mapas y candidatos
  const mapaEjercicios = useMemo(
    () => Object.fromEntries(ejercicios.map(e => [e.id, e])),
    [ejercicios]
  )

  const ultimosPesos = useMemo(() => {
    const mapa = {}
    for (const ej of ejercicios) {
      const u = ultimoPorEjercicio(ej.id)
      if (u) mapa[ej.id] = u
    }
    return mapa
  }, [ejercicios, ultimoPorEjercicio])

  const ejerciciosCardioDisponibles = useMemo(
    () => ejercicios.filter(e => (e.gruposMuscular || []).includes('cardio')),
    [ejercicios]
  )

  // ─ Fuerza helpers ─
  function crearItemFuerza(ejercicioId) {
    const u = ultimosPesos[ejercicioId]
    return { ejercicioId, series: '', repeticiones: '', peso: u ? String(u.peso) : '', unidad: u?.unidad || 'kg', sensaciones: '', _sugerenciaPeso: u ? `${u.peso} ${u.unidad}` : null }
  }

  function seleccionarSesion(sesion) {
    setSesionId(sesion.id)
    setSelectorSesionAbierto(false)
    setEjerciciosDia((sesion.ejercicios || []).map(item => ({
      ...crearItemFuerza(item.ejercicioId),
      series: item.series || '',
      repeticiones: item.repeticiones || '',
    })))
  }

  function añadirEjercicioFuerza(ejId) {
    if (ejerciciosDia.some(e => e.ejercicioId === ejId)) return
    setEjerciciosDia(prev => [...prev, crearItemFuerza(ejId)])
    setSelectorFuerzaAbierto(false)
    setBusquedaFuerza('')
  }

  function actualizarFuerza(idx, campo, valor) {
    setEjerciciosDia(prev => prev.map((e, i) => i === idx ? { ...e, [campo]: valor } : e))
  }

  // ─ Cardio helpers ─
  function añadirEjercicioCardio(ejId) {
    if (ejerciciosCardio.some(e => e.ejercicioId === ejId)) return
    setEjerciciosCardio(prev => [...prev, { ejercicioId: ejId, duracion: '', distancia: '', kcal: '' }])
    setSelectorCardioAbierto(false)
    setBusquedaCardio('')
  }

  function actualizarCardio(idx, campo, valor) {
    setEjerciciosCardio(prev => prev.map((e, i) => i === idx ? { ...e, [campo]: valor } : e))
  }

  const candidatosFuerza = useMemo(() => {
    const ids = new Set(ejerciciosDia.map(e => e.ejercicioId))
    return ejercicios.filter(e => !ids.has(e.id) && e.nombre.toLowerCase().includes(busquedaFuerza.toLowerCase()))
  }, [ejercicios, ejerciciosDia, busquedaFuerza])

  const candidatosCardio = useMemo(() => {
    const ids = new Set(ejerciciosCardio.map(e => e.ejercicioId))
    return ejerciciosCardioDisponibles.filter(
      e => !ids.has(e.id) && e.nombre.toLowerCase().includes(busquedaCardio.toLowerCase())
    )
  }, [ejerciciosCardioDisponibles, ejerciciosCardio, busquedaCardio])

  // ─ Guardar ─
  async function handleGuardar() {
    setGuardando(true)
    try {
      await onGuardar({
        fecha,
        sesionId,
        ejerciciosDia: ejerciciosDia.map(({ _sugerenciaPeso, ...r }) => ({
          ...r,
          peso:         Number(r.peso) || 0,
          series:       String(r.series),
          repeticiones: String(r.repeticiones),
        })),
        ejerciciosCardio: ejerciciosCardio.map(e => ({
          ...e,
          duracion:  Number(e.duracion)  || 0,
          distancia: Number(e.distancia) || 0,
          kcal:      Number(e.kcal)      || 0,
        })),
        kcalConsumidas, proteinas, carbohidratos, grasas,
        kcalQuemadas, metabolismoBasal, pasos,
        movilidad, core, agua,
        suenoHoras, suenoHoraAcostarse, suenoCalidad,
        esfuerzo,
        horaPesaje, bascula,
        peso, imc, grasaPorcentaje, grasaVisceral, musculo, masaOsea, edadCorporal,
      })
    } finally {
      setGuardando(false)
    }
  }

  async function handleEliminar() {
    setEliminando(true)
    await onEliminar()
  }

  const sesionSeleccionada = sesiones.find(s => s.id === sesionId)

  return (
    <div style={{ padding: '0 16px 40px' }}>

      {/* ─ Cabecera ─ */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '14px 0 4px', gap: '8px' }}>
        <button onClick={onCancelar} style={estiloAccion(false)}>← Volver</button>
        <span style={{ flex: 1, fontSize: '13px', fontWeight: '600', color: 'var(--color-texto-secundario)', textAlign: 'center' }}>
          {formatearFechaLarga(fecha)}
        </span>
        {entrada && (
          <button onClick={() => setConfirmarBorrar(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-texto-secundario)', padding: '4px', lineHeight: 1 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
            </svg>
          </button>
        )}
        <button onClick={handleGuardar} disabled={guardando} style={estiloAccion(guardando)}>
          {guardando ? 'Guardando…' : 'Guardar'}
        </button>
      </div>

      {/* ─ Confirmación de borrado ─ */}
      {confirmarBorrar && (
        <div style={{ margin: '10px 0', padding: '14px', backgroundColor: 'var(--color-superficie)', border: '1px solid #dc262644', borderRadius: '12px' }}>
          <p style={{ margin: '0 0 12px', color: 'var(--color-texto)', fontSize: '14px', fontWeight: '500' }}>¿Eliminar este día?</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setConfirmarBorrar(false)} style={{ flex: 1, padding: '10px', backgroundColor: 'transparent', border: '1px solid var(--color-borde)', borderRadius: '8px', color: 'var(--color-texto-secundario)', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Cancelar</button>
            <button onClick={handleEliminar} disabled={eliminando} style={{ flex: 1, padding: '10px', backgroundColor: '#dc2626', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer', opacity: eliminando ? 0.6 : 1 }}>
              {eliminando ? 'Eliminando…' : 'Eliminar'}
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          SECCIÓN 1 — DATOS GENERALES (sin título)
      ══════════════════════════════════════════════ */}

      {/* Fila 1: Sueño horas | Puntuación */}
      <Grid2>
        <InputNum label="Sueño" placeholder="7.5" value={suenoHoras} onChange={setSuenoHoras} sufijo="h" />
        <InputNum label="Puntuación" placeholder="80" value={suenoCalidad} onChange={setSuenoCalidad} />
      </Grid2>
      {/* Acostarse — fila sola */}
      <div style={{ marginBottom: '8px', maxWidth: '180px' }}>
        <label style={estiloLabelPequeno}>Acostarse</label>
        <input type="time" value={suenoHoraAcostarse} onChange={e => setSuenoHoraAcostarse(e.target.value)}
          style={{ ...estiloInputBase, textAlign: 'center', colorScheme: 'dark' }} />
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

      {/* Fila 6: Hora pesaje — fila sola */}
      <div style={{ marginBottom: '8px', maxWidth: '180px' }}>
        <label style={estiloLabelPequeno}>Hora pesaje</label>
        <input type="time" value={horaPesaje} onChange={e => setHoraPesaje(e.target.value)}
          style={{ ...estiloInputBase, textAlign: 'center', colorScheme: 'dark' }} />
      </div>
      {/* Báscula */}
      <div style={{ marginBottom: '8px' }}>
        <label style={estiloLabelPequeno}>Báscula</label>
        <select value={bascula} onChange={e => setBascula(e.target.value)}
          style={{ ...estiloInputBase, color: bascula ? 'var(--color-texto)' : 'var(--color-texto-inactivo)' }}>
          <option value="">—</option>
          <option value="B.Valencia">B.Valencia</option>
          <option value="B.Jumilla">B.Jumilla</option>
        </select>
      </div>

      {/* Fila 7: Peso | %Grasa | Músculo */}
      <Grid3>
        <InputNum label="Peso" placeholder="70.0" value={peso} onChange={setPeso} sufijo="kg" highlight={!!peso} />
        <InputNum label="% Grasa" placeholder="15.0" value={grasaPorcentaje} onChange={setGrasaPorcentaje} sufijo="%" />
        <InputNum label="Músculo" placeholder="55.0" value={musculo} onChange={setMusculo} sufijo="kg" />
      </Grid3>

      {/* Fila 8: IMC | Grasa Visceral | Masa Ósea */}
      <Grid3>
        <InputNum label="IMC" placeholder="22.5" value={imc} onChange={setImc} />
        <InputNum label="G.Visceral" placeholder="5" value={grasaVisceral} onChange={setGrasaVisceral} />
        <InputNum label="Masa Ósea" placeholder="3.0" value={masaOsea} onChange={setMasaOsea} sufijo="kg" />
      </Grid3>

      {/* Fila 9: Edad Corporal */}
      <div style={{ maxWidth: '130px', marginBottom: '8px' }}>
        <InputNum label="Edad Corporal" placeholder="25" value={edadCorporal} onChange={setEdadCorporal} />
      </div>

      {/* ══════════════════════════════════════════════
          SECCIÓN 2 — FUERZA
      ══════════════════════════════════════════════ */}
      <Seccion icono="💪" titulo="Fuerza" />

      <label style={estiloLabel}>Sesión</label>
      {sesionSeleccionada ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', backgroundColor: 'var(--color-superficie)', border: '1px solid var(--color-borde)', borderRadius: '10px', marginBottom: '12px' }}>
          <span style={{ flex: 1, color: 'var(--color-texto)', fontSize: '14px', fontWeight: '600' }}>{sesionSeleccionada.nombre}</span>
          <button onClick={() => setSesionId(null)} style={estiloX}>×</button>
        </div>
      ) : (
        <button type="button" onClick={() => setSelectorSesionAbierto(o => !o)} style={{ ...estiloBotonDash, marginBottom: '8px' }}>
          <span>{selectorSesionAbierto ? '−' : '+'}</span>
          {selectorSesionAbierto ? 'Cerrar' : 'Seleccionar sesión'}
        </button>
      )}
      {selectorSesionAbierto && !sesionSeleccionada && (
        <div style={{ ...estiloListaSelector, marginBottom: '12px' }}>
          {sesiones.length === 0
            ? <p style={estiloVacio}>Sin sesiones creadas</p>
            : sesiones.map(s => (
                <button key={s.id} type="button" onClick={() => seleccionarSesion(s)} style={estiloItemSelector}>
                  <span style={{ fontSize: '14px', color: 'var(--color-texto)', fontWeight: '600' }}>{s.nombre}</span>
                  {s.descripcion && <span style={{ fontSize: '12px', color: 'var(--color-texto-secundario)', marginTop: '2px' }}>{s.descripcion}</span>}
                </button>
              ))
          }
        </div>
      )}

      {ejerciciosDia.map((item, idx) => {
        const ej = mapaEjercicios[item.ejercicioId]
        if (!ej) return null
        const col = COLORES_GRUPO[ej.grupoPrincipal || (ej.gruposMuscular || [])[0]] || COLORES_GRUPO.core
        return (
          <div key={idx} style={estiloCardEjercicio}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{ fontSize: '15px' }}>{col.emoji}</span>
              <span style={{ flex: 1, fontWeight: '600', color: 'var(--color-texto)', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ej.nombre}</span>
              <button onClick={() => setEjerciciosDia(p => p.filter((_, i) => i !== idx))} style={estiloX}>×</button>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input type="number" inputMode="decimal" placeholder={item._sugerenciaPeso || '0'}
                value={item.peso} onChange={e => actualizarFuerza(idx, 'peso', e.target.value)}
                style={{ ...estiloInputBase, flex: 1, textAlign: 'center', fontSize: '20px', fontWeight: '700', color: '#f97316' }} />
              <button type="button" onClick={() => actualizarFuerza(idx, 'unidad', item.unidad === 'kg' ? 'lb' : 'kg')}
                style={{ padding: '10px 12px', backgroundColor: 'var(--color-superficie-2)', border: '1px solid var(--color-borde)', borderRadius: '8px', color: 'var(--color-texto-secundario)', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                {item.unidad || 'kg'}
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={estiloLabelPequeno}>Series</label>
                <input type="number" inputMode="numeric" placeholder="3" value={item.series}
                  onChange={e => actualizarFuerza(idx, 'series', e.target.value)}
                  style={{ ...estiloInputBase, textAlign: 'center' }} />
              </div>
              <div>
                <label style={estiloLabelPequeno}>Reps</label>
                <input type="text" placeholder="8–12" value={item.repeticiones}
                  onChange={e => actualizarFuerza(idx, 'repeticiones', e.target.value)}
                  style={{ ...estiloInputBase, textAlign: 'center' }} />
              </div>
            </div>
          </div>
        )
      })}

      <button type="button" onClick={() => { setSelectorFuerzaAbierto(o => !o); setBusquedaFuerza('') }} style={estiloBotonDash}>
        <span>{selectorFuerzaAbierto ? '−' : '+'}</span>
        {selectorFuerzaAbierto ? 'Cerrar' : 'Añadir ejercicio'}
      </button>
      {selectorFuerzaAbierto && (
        <SelectorEjercicio candidatos={candidatosFuerza} busqueda={busquedaFuerza} onBusqueda={setBusquedaFuerza}
          onSeleccionar={añadirEjercicioFuerza} ultimosPesos={ultimosPesos}
          vacio={ejercicios.length === 0 ? 'Añade ejercicios al catálogo primero' : 'Sin resultados'} />
      )}

      {/* ══════════════════════════════════════════════
          SECCIÓN 3 — CARDIO
      ══════════════════════════════════════════════ */}
      <Seccion icono="🏃" titulo="Cardio" />

      {ejerciciosCardio.map((item, idx) => {
        const ej = mapaEjercicios[item.ejercicioId]
        if (!ej) return null
        return (
          <div key={idx} style={estiloCardEjercicio}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{ fontSize: '15px' }}>🏃</span>
              <span style={{ flex: 1, fontWeight: '600', color: 'var(--color-texto)', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ej.nombre}</span>
              <button onClick={() => setEjerciciosCardio(p => p.filter((_, i) => i !== idx))} style={estiloX}>×</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              <div>
                <label style={estiloLabelPequeno}>Duración</label>
                <div style={{ position: 'relative' }}>
                  <input type="number" inputMode="numeric" placeholder="0" value={item.duracion}
                    onChange={e => actualizarCardio(idx, 'duracion', e.target.value)}
                    style={{ ...estiloInputBase, textAlign: 'center', paddingRight: '28px' }} />
                  <span style={estiloSufijo}>min</span>
                </div>
              </div>
              <div>
                <label style={estiloLabelPequeno}>Distancia</label>
                <div style={{ position: 'relative' }}>
                  <input type="number" inputMode="decimal" placeholder="0" value={item.distancia}
                    onChange={e => actualizarCardio(idx, 'distancia', e.target.value)}
                    style={{ ...estiloInputBase, textAlign: 'center', paddingRight: '24px' }} />
                  <span style={estiloSufijo}>km</span>
                </div>
              </div>
              <div>
                <label style={estiloLabelPequeno}>kcal</label>
                <input type="number" inputMode="numeric" placeholder="0" value={item.kcal}
                  onChange={e => actualizarCardio(idx, 'kcal', e.target.value)}
                  style={{ ...estiloInputBase, textAlign: 'center' }} />
              </div>
            </div>
          </div>
        )
      })}

      <button type="button" onClick={() => { setSelectorCardioAbierto(o => !o); setBusquedaCardio('') }} style={estiloBotonDash}>
        <span>{selectorCardioAbierto ? '−' : '+'}</span>
        {selectorCardioAbierto ? 'Cerrar' : 'Añadir actividad cardio'}
      </button>
      {selectorCardioAbierto && (
        <SelectorEjercicio candidatos={candidatosCardio} busqueda={busquedaCardio} onBusqueda={setBusquedaCardio}
          onSeleccionar={añadirEjercicioCardio} ultimosPesos={{}}
          vacio={ejerciciosCardioDisponibles.length === 0
            ? 'Añade ejercicios con grupo "cardio" al catálogo'
            : 'Sin resultados'} />
      )}

    </div>
  )
}

// ─── Selector de ejercicio ────────────────────────────────────────────────

function SelectorEjercicio({ candidatos, busqueda, onBusqueda, onSeleccionar, ultimosPesos, vacio }) {
  return (
    <div style={{ ...estiloListaSelector, marginTop: '8px' }}>
      <div style={{ padding: '8px', borderBottom: '1px solid var(--color-borde)' }}>
        <input type="search" placeholder="Buscar…" value={busqueda} onChange={e => onBusqueda(e.target.value)} autoFocus
          style={{ width: '100%', padding: '8px 10px', backgroundColor: 'var(--color-superficie)', border: '1px solid var(--color-borde)', borderRadius: '8px', color: 'var(--color-texto)', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }} />
      </div>
      <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
        {candidatos.length === 0
          ? <p style={estiloVacio}>{vacio}</p>
          : candidatos.map(ej => {
              const col = COLORES_GRUPO[ej.grupoPrincipal || (ej.gruposMuscular || [])[0]] || COLORES_GRUPO.core
              const u   = ultimosPesos[ej.id]
              return (
                <button key={ej.id} type="button" onClick={() => onSeleccionar(ej.id)} style={estiloItemSelector}>
                  <span style={{ fontSize: '15px' }}>{col.emoji}</span>
                  <span style={{ flex: 1, fontSize: '14px', color: 'var(--color-texto)', textAlign: 'left' }}>{ej.nombre}</span>
                  {u && <span style={{ fontSize: '12px', color: '#f97316', flexShrink: 0 }}>{u.peso} {u.unidad}</span>}
                </button>
              )
            })
        }
      </div>
    </div>
  )
}

// ─── Estilos ─────────────────────────────────────────────────────────────

function estiloAccion(dis) {
  return { background: 'none', border: 'none', color: dis ? 'var(--color-texto-secundario)' : '#f97316', fontSize: '14px', fontWeight: '600', cursor: dis ? 'default' : 'pointer', padding: 0, whiteSpace: 'nowrap' }
}

const estiloLabel        = { display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '500', color: 'var(--color-texto-secundario)', textTransform: 'uppercase', letterSpacing: '0.05em' }
const estiloLabelPequeno = { display: 'block', marginBottom: '4px', fontSize: '10px', color: 'var(--color-texto-secundario)', textTransform: 'uppercase', letterSpacing: '0.05em' }
const estiloInputBase    = { width: '100%', padding: '10px', backgroundColor: 'var(--color-superficie)', border: '1px solid var(--color-borde)', borderRadius: '8px', color: 'var(--color-texto)', fontSize: '14px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }
const estiloBotonDash    = { width: '100%', padding: '10px', backgroundColor: 'transparent', border: '1px dashed var(--color-borde)', borderRadius: '10px', color: 'var(--color-texto-secundario)', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '8px' }
const estiloCardEjercicio = { backgroundColor: 'var(--color-superficie)', border: '1px solid var(--color-borde)', borderRadius: '10px', padding: '12px', marginBottom: '8px' }
const estiloX            = { background: 'none', border: 'none', color: 'var(--color-texto-secundario)', cursor: 'pointer', fontSize: '20px', padding: 0, lineHeight: 1, flexShrink: 0 }
const estiloListaSelector = { backgroundColor: 'var(--color-fondo)', border: '1px solid var(--color-borde)', borderRadius: '12px', overflow: 'hidden' }
const estiloItemSelector  = { display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '11px 14px', backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid var(--color-superficie)', cursor: 'pointer', textAlign: 'left' }
const estiloVacio        = { margin: 0, padding: '18px', textAlign: 'center', color: 'var(--color-texto-secundario)', fontSize: '13px' }
const estiloSufijo       = { position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px', color: 'var(--color-texto-inactivo)', pointerEvents: 'none' }
