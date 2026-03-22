import { useState, useMemo } from 'react'
import { COLORES_GRUPO } from '../ejercicios/coloresGrupo'
import { IconoEjercicio } from '../ejercicios/iconosEjercicio'
import { getLugares } from '../ajustes/useLugares'

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

// ─── Componente principal ─────────────────────────────────────────────────

export default function FormularioEntrenamiento({
  fecha,
  entrada,
  ejercicios,
  sesiones,
  ultimoPorEjercicio,
  onGuardar,
  onCancelar,
}) {
  const lugares = getLugares()

  // — Fuerza —
  const [sesionId, setSesionId]           = useState(entrada?.sesionId || null)
  const [ejerciciosDia, setEjerciciosDia] = useState(() => entrada?.ejerciciosDia || [])
  const [selectorSesionAbierto, setSelectorSesionAbierto] = useState(false)
  const [selectorFuerzaAbierto, setSelectorFuerzaAbierto] = useState(false)
  const [busquedaFuerza, setBusquedaFuerza]               = useState('')

  // — General Fuerza —
  const [fuerzaHoraInicio,       setFuerzaHoraInicio]       = useState(entrada?.fuerzaHoraInicio       || '')
  const [fuerzaDuracion,         setFuerzaDuracion]         = useState(entrada?.fuerzaDuracion         || '')
  const [fuerzaKcalQuemadas,     setFuerzaKcalQuemadas]     = useState(entrada?.fuerzaKcalQuemadas     || '')
  const [fuerzaFrecuenciaCardiaca, setFuerzaFrecuenciaCardiaca] = useState(entrada?.fuerzaFrecuenciaCardiaca || '')
  const [fuerzaLugar,            setFuerzaLugar]            = useState(entrada?.fuerzaLugar            || '')

  // — Notas generales —
  const [notasEntrenamiento, setNotasEntrenamiento] = useState(entrada?.notasEntrenamiento || '')

  // — Cardio —
  const [ejerciciosCardio, setEjerciciosCardio]           = useState(() => entrada?.ejerciciosCardio || [])
  const [selectorCardioAbierto, setSelectorCardioAbierto] = useState(false)
  const [busquedaCardio, setBusquedaCardio]               = useState('')

  // — General Cardio —
  const [cardioHoraInicio,         setCardioHoraInicio]         = useState(entrada?.cardioHoraInicio         || '')
  const [cardioKcalQuemadas,       setCardioKcalQuemadas]       = useState(entrada?.cardioKcalQuemadas       || '')
  const [cardioFrecuenciaCardiaca, setCardioFrecuenciaCardiaca] = useState(entrada?.cardioFrecuenciaCardiaca || '')

  const [idxSustituyendo, setIdxSustituyendo] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [errorMsg,  setErrorMsg]  = useState(null)

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
    const ej = mapaEjercicios[ejId]
    setEjerciciosCardio(prev => [...prev, { ejercicioId: ejId, modo: ej?.modo || 'km', duracion: '', ritmo: '', volumen: '', sensaciones: '' }])
    setSelectorCardioAbierto(false)
    setBusquedaCardio('')
  }

  function sustituirEjercicio(idx, nuevoId) {
    const actual = ejerciciosDia[idx]
    const u = ultimosPesos[nuevoId]
    setEjerciciosDia(prev => prev.map((e, i) => i !== idx ? e : {
      ...actual,
      ejercicioId:     nuevoId,
      peso:            u ? String(u.peso) : '',
      unidad:          u?.unidad || actual.unidad || 'kg',
      _sugerenciaPeso: u ? `${u.peso} ${u.unidad}` : null,
    }))
    setIdxSustituyendo(null)
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
    setErrorMsg(null)
    try {
      await onGuardar({
        sesionId,
        fuerzaHoraInicio, fuerzaDuracion: Number(fuerzaDuracion) || 0,
        fuerzaKcalQuemadas: Number(fuerzaKcalQuemadas) || 0,
        fuerzaFrecuenciaCardiaca: Number(fuerzaFrecuenciaCardiaca) || 0,
        fuerzaLugar,
        cardioHoraInicio,
        cardioKcalQuemadas: Number(cardioKcalQuemadas) || 0,
        cardioFrecuenciaCardiaca: Number(cardioFrecuenciaCardiaca) || 0,
        notasEntrenamiento: notasEntrenamiento.trim(),
        ejerciciosDia: ejerciciosDia.map(({ _sugerenciaPeso, ...r }) => ({
          ...r,
          peso:         Number(r.peso) || 0,
          series:       String(r.series),
          repeticiones: String(r.repeticiones),
        })),
        ejerciciosCardio: ejerciciosCardio.map(e => ({
          ejercicioId:  e.ejercicioId,
          modo:         e.modo || 'km',
          duracion:     Number(e.duracion) || 0,
          ritmo:        e.ritmo?.trim()    || '',
          volumen:      Number(e.volumen)  || 0,
          sensaciones:  e.sensaciones?.trim() || '',
        })),
      })
    } catch (err) {
      console.error('Error al guardar entrenamiento:', err)
      setErrorMsg(err?.message || String(err) || 'Error desconocido')
    } finally {
      setGuardando(false)
    }
  }

  const sesionSeleccionada = sesiones.find(s => s.id === sesionId)

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
        <p style={{ flex: 1, margin: 0, fontSize: '15px', fontWeight: '700', color: 'var(--color-texto)', textAlign: 'center' }}>
          {formatearFechaLarga(fecha)}
        </p>
        <div style={{ width: '52px' }} />
      </div>

      {/* ══════════════════════════════════════════════
          SECCIÓN — FUERZA
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

      {/* — Parámetros generales Fuerza — */}
      <div style={estiloCardEjercicio}>
        <p style={{ ...estiloLabel, marginBottom: '10px' }}>General</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
          <div style={{ minWidth: 0 }}>
            <label style={estiloLabelPequeno}>Hora inicio</label>
            <InputHora value={fuerzaHoraInicio} onChange={setFuerzaHoraInicio} />
          </div>
          <div style={{ position: 'relative' }}>
            <label style={estiloLabelPequeno}>Duración</label>
            <input type="number" inputMode="numeric" placeholder="60" min="0" value={fuerzaDuracion}
              onChange={e => setFuerzaDuracion(e.target.value)}
              style={{ ...estiloInputBase, textAlign: 'center', paddingRight: '32px' }} />
            <span style={estiloSufijo}>min</span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
          <div style={{ position: 'relative' }}>
            <label style={estiloLabelPequeno}>KCal quemadas</label>
            <input type="number" inputMode="numeric" placeholder="0" min="0" value={fuerzaKcalQuemadas}
              onChange={e => setFuerzaKcalQuemadas(e.target.value)}
              style={{ ...estiloInputBase, textAlign: 'center', paddingRight: '32px' }} />
            <span style={estiloSufijo}>kcal</span>
          </div>
          <div style={{ position: 'relative' }}>
            <label style={estiloLabelPequeno}>Ritmo Cardíaco</label>
            <input type="number" inputMode="numeric" placeholder="0" min="0" value={fuerzaFrecuenciaCardiaca}
              onChange={e => setFuerzaFrecuenciaCardiaca(e.target.value)}
              style={{ ...estiloInputBase, textAlign: 'center', paddingRight: '32px' }} />
            <span style={estiloSufijo}>lpm</span>
          </div>
        </div>
        <div>
          <label style={estiloLabelPequeno}>Lugar</label>
          <select value={fuerzaLugar} onChange={e => setFuerzaLugar(e.target.value)}
            style={{ ...estiloInputBase, color: fuerzaLugar ? 'var(--color-texto)' : 'var(--color-texto-secundario)' }}>
            <option value="">—</option>
            {lugares.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      {ejerciciosDia.map((item, idx) => {
        const ej = mapaEjercicios[item.ejercicioId]
        if (!ej) return null
        const col = COLORES_GRUPO[ej.grupoPrincipal || (ej.gruposMuscular || [])[0]] || COLORES_GRUPO.core
        return (
          <div key={idx} style={estiloCardEjercicio}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <IconoEjercicio grupos={ej.gruposMuscular} grupoPrincipal={ej.grupoPrincipal} size={18} />
              <span style={{ flex: 1, fontWeight: '600', color: 'var(--color-texto)', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ej.nombre}</span>
              {/* Botón sustituir */}
              <button
                type="button"
                onClick={() => setIdxSustituyendo(i => i === idx ? null : idx)}
                style={{ ...estiloX, color: idxSustituyendo === idx ? '#f97316' : 'var(--color-texto-secundario)' }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 5h10M9 2l3 3-3 3" />
                  <path d="M14 11H4M7 8l-3 3 3 3" />
                </svg>
              </button>
              <button onClick={() => setEjerciciosDia(p => p.filter((_, i) => i !== idx))} style={estiloX}>×</button>
            </div>
            {/* Panel de sustitutos */}
            {idxSustituyendo === idx && (
              <div style={{ marginBottom: '10px', backgroundColor: 'var(--color-fondo)', border: '1px solid var(--color-borde)', borderRadius: '8px', overflow: 'hidden' }}>
                {!(ej.sustitutos || []).length
                  ? <p style={{ margin: 0, padding: '12px', fontSize: '12px', color: 'var(--color-texto-secundario)', textAlign: 'center' }}>Sin sustitutos definidos para este ejercicio</p>
                  : (ej.sustitutos || []).map(susId => {
                      const sus = mapaEjercicios[susId]
                      if (!sus) return null
                      const u = ultimosPesos[susId]
                      return (
                        <button key={susId} type="button" onClick={() => sustituirEjercicio(idx, susId)}
                          style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '10px 12px', backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid var(--color-borde)', cursor: 'pointer', textAlign: 'left' }}>
                          <IconoEjercicio grupos={sus.gruposMuscular} grupoPrincipal={sus.grupoPrincipal} size={16} />
                          <span style={{ flex: 1, fontSize: '13px', color: 'var(--color-texto)' }}>{sus.nombre}</span>
                          {u && <span style={{ fontSize: '11px', color: '#f97316', flexShrink: 0 }}>{u.peso} {u.unidad}</span>}
                        </button>
                      )
                    })
                }
              </div>
            )}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input type="number" inputMode="decimal" placeholder={item._sugerenciaPeso || '0'}
                value={item.peso} onChange={e => actualizarFuerza(idx, 'peso', e.target.value)}
                style={{ ...estiloInputBase, flex: 1, textAlign: 'center', fontSize: '20px', fontWeight: '700', color: '#f97316' }} />
              <button type="button" onClick={() => actualizarFuerza(idx, 'unidad', item.unidad === 'kg' ? 'lb' : 'kg')}
                style={{ padding: '10px 12px', backgroundColor: 'var(--color-superficie-2)', border: '1px solid var(--color-borde)', borderRadius: '8px', color: 'var(--color-texto-secundario)', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                {item.unidad || 'kg'}
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
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
            <div>
              <label style={{ ...estiloLabelPequeno, display: 'flex', justifyContent: 'space-between' }}>
                <span>Sensaciones</span>
                <span style={{ color: (item.sensaciones || '').length > 130 ? '#f97316' : 'var(--color-texto-inactivo)' }}>{(item.sensaciones || '').length}/150</span>
              </label>
              <input type="text" placeholder="Cómo fue el ejercicio…" value={item.sensaciones || ''}
                maxLength={150}
                onChange={e => actualizarFuerza(idx, 'sensaciones', e.target.value)}
                style={{ ...estiloInputBase }} />
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
          SECCIÓN — CARDIO
      ══════════════════════════════════════════════ */}
      <Seccion icono="🏃" titulo="Cardio" />

      {/* — Parámetros generales Cardio — */}
      <div style={{ ...estiloCardEjercicio, marginTop: '4px' }}>
        <p style={{ ...estiloLabel, marginBottom: '10px' }}>General</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          <div style={{ minWidth: 0 }}>
            <label style={estiloLabelPequeno}>Hora inicio</label>
            <InputHora value={cardioHoraInicio} onChange={setCardioHoraInicio} />
          </div>
          <div style={{ position: 'relative' }}>
            <label style={estiloLabelPequeno}>KCal</label>
            <input type="number" inputMode="numeric" placeholder="0" min="0" value={cardioKcalQuemadas}
              onChange={e => setCardioKcalQuemadas(e.target.value)}
              style={{ ...estiloInputBase, textAlign: 'center', paddingRight: '32px' }} />
            <span style={estiloSufijo}>kcal</span>
          </div>
          <div style={{ position: 'relative' }}>
            <label style={estiloLabelPequeno}>Ritmo Cardíaco</label>
            <input type="number" inputMode="numeric" placeholder="0" min="0" value={cardioFrecuenciaCardiaca}
              onChange={e => setCardioFrecuenciaCardiaca(e.target.value)}
              style={{ ...estiloInputBase, textAlign: 'center', paddingRight: '32px' }} />
            <span style={estiloSufijo}>lpm</span>
          </div>
        </div>
      </div>

      {ejerciciosCardio.map((item, idx) => {
        const ej = mapaEjercicios[item.ejercicioId]
        if (!ej) return null
        return (
          <div key={idx} style={estiloCardEjercicio}>
            {/* Cabecera: icono + nombre + quitar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <IconoEjercicio grupos={ej.gruposMuscular} grupoPrincipal={ej.grupoPrincipal} size={18} />
              <span style={{ flex: 1, fontWeight: '600', color: 'var(--color-texto)', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ej.nombre}</span>
              <button onClick={() => setEjerciciosCardio(p => p.filter((_, i) => i !== idx))} style={estiloX}>×</button>
            </div>
            {/* Campos */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              <div>
                <label style={estiloLabelPequeno}>Duración</label>
                <div style={{ position: 'relative' }}>
                  <input type="number" inputMode="numeric" placeholder="0" min="0" value={item.duracion}
                    onChange={e => actualizarCardio(idx, 'duracion', e.target.value)}
                    style={{ ...estiloInputBase, textAlign: 'center', paddingRight: '28px' }} />
                  <span style={estiloSufijo}>min</span>
                </div>
              </div>
              <div>
                <label style={estiloLabelPequeno}>{item.modo === 'veces' ? 'Rp/m' : 'Km/h'}</label>
                <input type="text" placeholder="0" value={item.ritmo}
                  onChange={e => actualizarCardio(idx, 'ritmo', e.target.value)}
                  style={{ ...estiloInputBase, textAlign: 'center' }} />
              </div>
              <div>
                <label style={estiloLabelPequeno}>{item.modo === 'veces' ? 'Rp' : 'Km'}</label>
                <input type="number" inputMode="decimal" placeholder="0" min="0" value={item.volumen}
                  onChange={e => actualizarCardio(idx, 'volumen', e.target.value)}
                  style={{ ...estiloInputBase, textAlign: 'center' }} />
              </div>
            </div>
            <div style={{ marginTop: '8px' }}>
              <label style={{ ...estiloLabelPequeno, display: 'flex', justifyContent: 'space-between' }}>
                <span>Sensaciones</span>
                <span style={{ color: (item.sensaciones || '').length > 220 ? '#f97316' : 'var(--color-texto-inactivo)' }}>{(item.sensaciones || '').length}/250</span>
              </label>
              <input type="text" placeholder="Cómo fue la actividad…" value={item.sensaciones || ''}
                maxLength={250}
                onChange={e => actualizarCardio(idx, 'sensaciones', e.target.value)}
                style={{ ...estiloInputBase }} />
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

      {/* ══ Notas generales del entrenamiento ══ */}
      <Seccion icono="💬" titulo="Sensaciones generales" />
      <div style={{ marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '4px' }}>
          <span style={{ fontSize: '10px', color: notasEntrenamiento.length > 550 ? '#f97316' : 'var(--color-texto-inactivo)' }}>{notasEntrenamiento.length}/600</span>
        </div>
        <textarea
          placeholder="Sensaciones generales, observaciones del día…"
          value={notasEntrenamiento}
          maxLength={600}
          onChange={e => setNotasEntrenamiento(e.target.value)}
          rows={3}
          style={{ ...estiloInputBase, resize: 'vertical', minHeight: '80px', lineHeight: '1.6' }}
        />
      </div>

      {/* Error */}
      {errorMsg && (
        <div style={{ backgroundColor: '#7f1d1d', border: '1px solid #ef4444', borderRadius: '10px', padding: '12px 14px', marginTop: '16px', marginBottom: '8px' }}>
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
          width: '100%', padding: '14px', marginTop: '16px',
          backgroundColor: guardando ? 'var(--color-texto-inactivo)' : '#f97316',
          color: '#fff', fontWeight: '700', fontSize: '16px',
          border: 'none', borderRadius: '12px', cursor: guardando ? 'default' : 'pointer',
        }}
      >
        {guardando ? 'Guardando…' : 'Guardar'}
      </button>

    </div>
  )
}

// ─── Input hora ───────────────────────────────────────────────────────────

function InputHora({ value, onChange }) {
  return (
    <input type="time" value={value || ''} onChange={e => onChange(e.target.value)}
      style={{ ...estiloInputBase, textAlign: 'center', colorScheme: 'dark', paddingLeft: '4px', paddingRight: '4px', minWidth: 0, fontSize: '13px' }} />
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
              const u = ultimosPesos[ej.id]
              return (
                <button key={ej.id} type="button" onClick={() => onSeleccionar(ej.id)} style={estiloItemSelector}>
                  <IconoEjercicio grupos={ej.gruposMuscular} grupoPrincipal={ej.grupoPrincipal} size={18} />
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
