import { useState, useMemo } from 'react'
import { COLORES_GRUPO } from '../ejercicios/coloresGrupo'
import { IconoEjercicio } from '../ejercicios/iconosEjercicio'

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
      <span style={{ fontSize: '16px', fontWeight: '700', color: '#f5f5f5' }}>{titulo}</span>
      <div style={{ flex: 1, height: '1px', backgroundColor: '#2e2e2e', marginLeft: '6px' }} />
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
  // — Fuerza —
  const [sesionId, setSesionId]           = useState(entrada?.sesionId || null)
  const [ejerciciosDia, setEjerciciosDia] = useState(() => entrada?.ejerciciosDia || [])
  const [selectorSesionAbierto, setSelectorSesionAbierto] = useState(false)
  const [selectorFuerzaAbierto, setSelectorFuerzaAbierto] = useState(false)
  const [busquedaFuerza, setBusquedaFuerza]               = useState('')

  // — Notas generales —
  const [notasEntrenamiento, setNotasEntrenamiento] = useState(entrada?.notasEntrenamiento || '')

  // — Cardio —
  const [ejerciciosCardio, setEjerciciosCardio]           = useState(() => entrada?.ejerciciosCardio || [])
  const [selectorCardioAbierto, setSelectorCardioAbierto] = useState(false)
  const [busquedaCardio, setBusquedaCardio]               = useState('')

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
        <p style={{ flex: 1, margin: 0, fontSize: '15px', fontWeight: '700', color: '#f5f5f5', textAlign: 'center' }}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', backgroundColor: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: '10px', marginBottom: '12px' }}>
          <span style={{ flex: 1, color: '#f5f5f5', fontSize: '14px', fontWeight: '600' }}>{sesionSeleccionada.nombre}</span>
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
                  <span style={{ fontSize: '14px', color: '#f5f5f5', fontWeight: '600' }}>{s.nombre}</span>
                  {s.descripcion && <span style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{s.descripcion}</span>}
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
              <IconoEjercicio grupos={ej.gruposMuscular} grupoPrincipal={ej.grupoPrincipal} size={18} />
              <span style={{ flex: 1, fontWeight: '600', color: '#f5f5f5', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ej.nombre}</span>
              <button onClick={() => setEjerciciosDia(p => p.filter((_, i) => i !== idx))} style={estiloX}>×</button>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input type="number" inputMode="decimal" placeholder={item._sugerenciaPeso || '0'}
                value={item.peso} onChange={e => actualizarFuerza(idx, 'peso', e.target.value)}
                style={{ ...estiloInputBase, flex: 1, textAlign: 'center', fontSize: '20px', fontWeight: '700', color: '#f97316' }} />
              <button type="button" onClick={() => actualizarFuerza(idx, 'unidad', item.unidad === 'kg' ? 'lb' : 'kg')}
                style={{ padding: '10px 12px', backgroundColor: '#242424', border: '1px solid #2e2e2e', borderRadius: '8px', color: '#a1a1a1', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
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
                <span style={{ color: (item.sensaciones || '').length > 130 ? '#f97316' : '#4b5563' }}>{(item.sensaciones || '').length}/150</span>
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

      {ejerciciosCardio.map((item, idx) => {
        const ej = mapaEjercicios[item.ejercicioId]
        if (!ej) return null
        return (
          <div key={idx} style={estiloCardEjercicio}>
            {/* Cabecera: icono + nombre + quitar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <IconoEjercicio grupos={ej.gruposMuscular} grupoPrincipal={ej.grupoPrincipal} size={18} />
              <span style={{ flex: 1, fontWeight: '600', color: '#f5f5f5', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ej.nombre}</span>
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
                <span style={{ color: (item.sensaciones || '').length > 220 ? '#f97316' : '#4b5563' }}>{(item.sensaciones || '').length}/250</span>
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
          <span style={{ fontSize: '10px', color: notasEntrenamiento.length > 550 ? '#f97316' : '#4b5563' }}>{notasEntrenamiento.length}/600</span>
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

// ─── Selector de ejercicio ────────────────────────────────────────────────

function SelectorEjercicio({ candidatos, busqueda, onBusqueda, onSeleccionar, ultimosPesos, vacio }) {
  return (
    <div style={{ ...estiloListaSelector, marginTop: '8px' }}>
      <div style={{ padding: '8px', borderBottom: '1px solid #2e2e2e' }}>
        <input type="search" placeholder="Buscar…" value={busqueda} onChange={e => onBusqueda(e.target.value)} autoFocus
          style={{ width: '100%', padding: '8px 10px', backgroundColor: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: '8px', color: '#f5f5f5', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }} />
      </div>
      <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
        {candidatos.length === 0
          ? <p style={estiloVacio}>{vacio}</p>
          : candidatos.map(ej => {
              const u = ultimosPesos[ej.id]
              return (
                <button key={ej.id} type="button" onClick={() => onSeleccionar(ej.id)} style={estiloItemSelector}>
                  <IconoEjercicio grupos={ej.gruposMuscular} grupoPrincipal={ej.grupoPrincipal} size={18} />
                  <span style={{ flex: 1, fontSize: '14px', color: '#f5f5f5', textAlign: 'left' }}>{ej.nombre}</span>
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
  return { background: 'none', border: 'none', color: dis ? '#6b7280' : '#f97316', fontSize: '14px', fontWeight: '600', cursor: dis ? 'default' : 'pointer', padding: 0, whiteSpace: 'nowrap' }
}

const estiloLabel        = { display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '500', color: '#a1a1a1', textTransform: 'uppercase', letterSpacing: '0.05em' }
const estiloLabelPequeno = { display: 'block', marginBottom: '4px', fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }
const estiloInputBase    = { width: '100%', padding: '10px', backgroundColor: '#1e1e1e', border: '1px solid #2e2e2e', borderRadius: '8px', color: '#f5f5f5', fontSize: '14px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }
const estiloBotonDash    = { width: '100%', padding: '10px', backgroundColor: 'transparent', border: '1px dashed #2e2e2e', borderRadius: '10px', color: '#6b7280', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '8px' }
const estiloCardEjercicio = { backgroundColor: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: '10px', padding: '12px', marginBottom: '8px' }
const estiloX            = { background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '20px', padding: 0, lineHeight: 1, flexShrink: 0 }
const estiloListaSelector = { backgroundColor: '#111', border: '1px solid #2e2e2e', borderRadius: '12px', overflow: 'hidden' }
const estiloItemSelector  = { display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '11px 14px', backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #1a1a1a', cursor: 'pointer', textAlign: 'left' }
const estiloVacio        = { margin: 0, padding: '18px', textAlign: 'center', color: '#6b7280', fontSize: '13px' }
const estiloSufijo       = { position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px', color: '#4b5563', pointerEvents: 'none' }
