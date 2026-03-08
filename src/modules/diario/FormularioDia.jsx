import { useState, useMemo } from 'react'
import { COLORES_GRUPO, capitalizarGrupo } from '../ejercicios/coloresGrupo'

const DIAS_LARGO  = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const MESES_LARGO = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                     'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

function formatearFechaLarga(fechaStr) {
  const [anio, mes, dia] = fechaStr.split('-').map(Number)
  const d = new Date(anio, mes - 1, dia)
  return `${DIAS_LARGO[d.getDay()]}, ${dia} de ${MESES_LARGO[mes - 1]} de ${anio}`
}

/**
 * Formulario de creación/edición de una entrada del diario.
 * Permite seleccionar sesión, gestionar ejercicios con pesos y añadir notas.
 */
export default function FormularioDia({
  fecha,
  entrada,
  ejercicios,
  sesiones,
  ultimoPorEjercicio,
  onGuardar,
  onCancelar,
}) {
  const [sesionId, setSesionId]                     = useState(entrada?.sesionId || null)
  const [ejerciciosDia, setEjerciciosDia]           = useState(() => entrada?.ejerciciosDia || [])
  const [sensacionesGenerales, setSensacionesGenerales] = useState(entrada?.sensacionesGenerales || '')
  const [notas, setNotas]                           = useState(entrada?.notas || '')
  const [guardando, setGuardando]                   = useState(false)
  const [selectorSesionAbierto, setSelectorSesionAbierto]     = useState(false)
  const [selectorEjercicioAbierto, setSelectorEjercicioAbierto] = useState(false)
  const [busquedaEj, setBusquedaEj]                 = useState('')

  const mapaEjercicios = useMemo(
    () => Object.fromEntries(ejercicios.map(e => [e.id, e])),
    [ejercicios]
  )

  // Último peso conocido por ejercicioId (para sugerencias)
  const ultimosPesos = useMemo(() => {
    const mapa = {}
    for (const ej of ejercicios) {
      const ultimo = ultimoPorEjercicio(ej.id)
      if (ultimo) mapa[ej.id] = ultimo
    }
    return mapa
  }, [ejercicios, ultimoPorEjercicio])

  function crearItemEjercicio(ejercicioId) {
    const ultimo = ultimosPesos[ejercicioId]
    return {
      ejercicioId,
      series:          '',
      repeticiones:    '',
      peso:            ultimo ? String(ultimo.peso) : '',
      unidad:          ultimo ? ultimo.unidad : 'kg',
      sensaciones:     '',
      _sugerenciaPeso: ultimo ? `${ultimo.peso} ${ultimo.unidad}` : null,
    }
  }

  function seleccionarSesion(sesion) {
    setSesionId(sesion.id)
    setSelectorSesionAbierto(false)
    // Poblar ejerciciosDia con los ejercicios de la sesión
    const nuevosEjs = (sesion.ejercicios || []).map(item => ({
      ...crearItemEjercicio(item.ejercicioId),
      series:       item.series || '',
      repeticiones: item.repeticiones || '',
    }))
    setEjerciciosDia(nuevosEjs)
  }

  function quitarSesion() {
    setSesionId(null)
  }

  function añadirEjercicio(ejId) {
    if (ejerciciosDia.some(e => e.ejercicioId === ejId)) return
    setEjerciciosDia(prev => [...prev, crearItemEjercicio(ejId)])
    setSelectorEjercicioAbierto(false)
  }

  function actualizarEjercicio(idx, campo, valor) {
    setEjerciciosDia(prev => prev.map((e, i) => i === idx ? { ...e, [campo]: valor } : e))
  }

  function quitarEjercicio(idx) {
    setEjerciciosDia(prev => prev.filter((_, i) => i !== idx))
  }

  // Ejercicios no añadidos aún y que coinciden con la búsqueda
  const candidatosEjercicio = useMemo(() => {
    const idsYaEnDia = new Set(ejerciciosDia.map(e => e.ejercicioId))
    return ejercicios.filter(ej =>
      !idsYaEnDia.has(ej.id) &&
      ej.nombre.toLowerCase().includes(busquedaEj.toLowerCase())
    )
  }, [ejercicios, ejerciciosDia, busquedaEj])

  async function handleGuardar() {
    setGuardando(true)
    try {
      await onGuardar({
        fecha,
        sesionId,
        // Limpiar campo interno _sugerenciaPeso antes de guardar
        ejerciciosDia: ejerciciosDia.map(({ _sugerenciaPeso, ...resto }) => ({
          ...resto,
          peso:         Number(resto.peso) || 0,
          series:       String(resto.series),
          repeticiones: String(resto.repeticiones),
        })),
        sensacionesGenerales,
        notas,
      })
    } finally {
      setGuardando(false)
    }
  }

  const sesionSeleccionada = sesiones.find(s => s.id === sesionId)

  return (
    <div style={{ padding: '0 16px 32px' }}>

      {/* — Cabecera — */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0 16px' }}>
        <button onClick={onCancelar} style={estiloAccion(false)}>Cancelar</button>
        <h2 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#a1a1a1', textAlign: 'center', flex: 1, padding: '0 8px' }}>
          {formatearFechaLarga(fecha)}
        </h2>
        <button onClick={handleGuardar} disabled={guardando} style={estiloAccion(guardando)}>
          {guardando ? 'Guardando…' : 'Guardar'}
        </button>
      </div>

      {/* — Sesión — */}
      <Campo etiqueta="Sesión">
        {sesionSeleccionada ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', backgroundColor: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: '10px' }}>
            <span style={{ flex: 1, color: '#f5f5f5', fontSize: '15px', fontWeight: '600' }}>
              {sesionSeleccionada.nombre}
            </span>
            <button onClick={quitarSesion} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '20px', padding: 0, lineHeight: 1 }}>×</button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setSelectorSesionAbierto(o => !o)}
            style={estiloBotonDasheado}
          >
            <span style={{ fontSize: '16px', lineHeight: 1 }}>{selectorSesionAbierto ? '−' : '+'}</span>
            {selectorSesionAbierto ? 'Cerrar' : 'Seleccionar sesión (opcional)'}
          </button>
        )}
        {selectorSesionAbierto && !sesionSeleccionada && (
          <div style={{ marginTop: '8px', backgroundColor: '#111', border: '1px solid #2e2e2e', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
              {sesiones.length === 0 ? (
                <p style={{ margin: 0, padding: '20px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
                  Sin sesiones creadas
                </p>
              ) : (
                sesiones.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => seleccionarSesion(s)}
                    style={{ display: 'flex', flexDirection: 'column', width: '100%', padding: '12px 14px', backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #1a1a1a', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <span style={{ fontSize: '14px', color: '#f5f5f5', fontWeight: '600' }}>{s.nombre}</span>
                    {s.descripcion && (
                      <span style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{s.descripcion}</span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </Campo>

      {/* — Ejercicios del día — */}
      <Campo etiqueta={`Ejercicios${ejerciciosDia.length > 0 ? ` (${ejerciciosDia.length})` : ''}`}>
        {ejerciciosDia.map((item, idx) => {
          const ej = mapaEjercicios[item.ejercicioId]
          if (!ej) return null
          const colores = COLORES_GRUPO[ej.grupoPrincipal || (ej.gruposMuscular || [])[0]] || COLORES_GRUPO.core
          return (
            <div key={idx} style={{ backgroundColor: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: '12px', padding: '12px', marginBottom: '8px' }}>
              {/* Nombre + quitar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span style={{ fontSize: '16px' }}>{colores.emoji}</span>
                <span style={{ flex: 1, fontWeight: '600', color: '#f5f5f5', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {ej.nombre}
                </span>
                <button onClick={() => quitarEjercicio(idx)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '20px', padding: 0, lineHeight: 1 }}>×</button>
              </div>

              {/* Peso + toggle unidad */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder={item._sugerenciaPeso ? `Ej: ${item._sugerenciaPeso}` : '0'}
                  value={item.peso}
                  onChange={e => actualizarEjercicio(idx, 'peso', e.target.value)}
                  style={{ ...estiloInputPequeno, flex: 1, textAlign: 'center', fontSize: '20px', fontWeight: '700', color: '#f97316' }}
                />
                <button
                  type="button"
                  onClick={() => actualizarEjercicio(idx, 'unidad', item.unidad === 'kg' ? 'lb' : 'kg')}
                  style={{ padding: '10px 14px', backgroundColor: '#242424', border: '1px solid #2e2e2e', borderRadius: '8px', color: '#a1a1a1', fontSize: '13px', fontWeight: '600', cursor: 'pointer', flexShrink: 0 }}
                >
                  {item.unidad || 'kg'}
                </button>
              </div>

              {/* Series y repeticiones */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <div style={{ flex: 1 }}>
                  <label style={estiloLabelPequeno}>Series</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="3"
                    value={item.series}
                    onChange={e => actualizarEjercicio(idx, 'series', e.target.value)}
                    style={{ ...estiloInputPequeno, textAlign: 'center' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={estiloLabelPequeno}>Reps</label>
                  <input
                    type="text"
                    placeholder="8–12"
                    value={item.repeticiones}
                    onChange={e => actualizarEjercicio(idx, 'repeticiones', e.target.value)}
                    style={{ ...estiloInputPequeno, textAlign: 'center' }}
                  />
                </div>
              </div>

              {/* Sensaciones del ejercicio */}
              <textarea
                placeholder="Sensaciones…"
                value={item.sensaciones}
                onChange={e => actualizarEjercicio(idx, 'sensaciones', e.target.value)}
                rows={2}
                style={{ ...estiloInputPequeno, resize: 'none', lineHeight: '1.5' }}
              />
            </div>
          )
        })}

        {/* Botón añadir ejercicio */}
        <button
          type="button"
          onClick={() => { setSelectorEjercicioAbierto(o => !o); setBusquedaEj('') }}
          style={estiloBotonDasheado}
        >
          <span style={{ fontSize: '16px', lineHeight: 1 }}>{selectorEjercicioAbierto ? '−' : '+'}</span>
          {selectorEjercicioAbierto ? 'Cerrar' : 'Añadir ejercicio'}
        </button>

        {selectorEjercicioAbierto && (
          <div style={{ marginTop: '8px', backgroundColor: '#111', border: '1px solid #2e2e2e', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '10px', borderBottom: '1px solid #2e2e2e' }}>
              <input
                type="search"
                placeholder="Buscar ejercicio…"
                value={busquedaEj}
                onChange={e => setBusquedaEj(e.target.value)}
                autoFocus
                style={{ width: '100%', padding: '8px 12px', backgroundColor: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: '8px', color: '#f5f5f5', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }}
              />
            </div>
            <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
              {candidatosEjercicio.length === 0 ? (
                <p style={{ margin: 0, padding: '20px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
                  {ejercicios.length === 0 ? 'Añade ejercicios al catálogo primero' : 'Sin resultados'}
                </p>
              ) : (
                candidatosEjercicio.map(ej => {
                  const colores = COLORES_GRUPO[ej.grupoPrincipal || (ej.gruposMuscular || [])[0]] || COLORES_GRUPO.core
                  const ultimo  = ultimosPesos[ej.id]
                  return (
                    <button
                      key={ej.id}
                      type="button"
                      onClick={() => añadirEjercicio(ej.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px 14px', backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #1a1a1a', cursor: 'pointer', textAlign: 'left' }}
                    >
                      <span style={{ fontSize: '16px' }}>{colores.emoji}</span>
                      <span style={{ flex: 1, fontSize: '14px', color: '#f5f5f5' }}>{ej.nombre}</span>
                      {ultimo && (
                        <span style={{ fontSize: '12px', color: '#f97316', flexShrink: 0 }}>
                          {ultimo.peso} {ultimo.unidad}
                        </span>
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </div>
        )}
      </Campo>

      {/* — Sensaciones generales — */}
      <Campo etiqueta="Sensaciones generales">
        <textarea
          placeholder="¿Cómo te has sentido hoy?"
          value={sensacionesGenerales}
          onChange={e => setSensacionesGenerales(e.target.value)}
          rows={3}
          style={{ width: '100%', padding: '12px', backgroundColor: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: '10px', color: '#f5f5f5', fontSize: '15px', outline: 'none', fontFamily: 'inherit', resize: 'vertical', minHeight: '80px', lineHeight: '1.6' }}
        />
      </Campo>

      {/* — Notas — */}
      <Campo etiqueta="Notas">
        <textarea
          placeholder="Notas adicionales…"
          value={notas}
          onChange={e => setNotas(e.target.value)}
          rows={3}
          style={{ width: '100%', padding: '12px', backgroundColor: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: '10px', color: '#f5f5f5', fontSize: '15px', outline: 'none', fontFamily: 'inherit', resize: 'vertical', minHeight: '80px', lineHeight: '1.6' }}
        />
      </Campo>
    </div>
  )
}

// — Auxiliares —

function Campo({ etiqueta, children }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '500', color: '#a1a1a1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {etiqueta}
      </label>
      {children}
    </div>
  )
}

function estiloAccion(deshabilitado) {
  return {
    background: 'none', border: 'none',
    color: deshabilitado ? '#6b7280' : '#f97316',
    fontSize: '15px', fontWeight: '600',
    cursor: deshabilitado ? 'default' : 'pointer', padding: 0,
  }
}

const estiloBotonDasheado = {
  width: '100%', padding: '10px',
  backgroundColor: 'transparent', border: '1px dashed #2e2e2e',
  borderRadius: '10px', color: '#6b7280', fontSize: '14px',
  cursor: 'pointer', display: 'flex', alignItems: 'center',
  justifyContent: 'center', gap: '6px',
}

const estiloInputPequeno = {
  width: '100%', padding: '10px 12px',
  backgroundColor: '#242424', border: '1px solid #2e2e2e',
  borderRadius: '8px', color: '#f5f5f5',
  fontSize: '14px', outline: 'none', fontFamily: 'inherit',
}

const estiloLabelPequeno = {
  display: 'block', marginBottom: '4px',
  fontSize: '11px', color: '#6b7280',
  textTransform: 'uppercase', letterSpacing: '0.05em',
}
