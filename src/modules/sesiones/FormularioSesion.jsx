import { useState, useMemo } from 'react'
import { COLORES_GRUPO, capitalizarGrupo } from '../ejercicios/coloresGrupo'
import { IconoEjercicio } from '../ejercicios/iconosEjercicio'

/**
 * Formulario de creación/edición de sesiones.
 * Permite gestionar la lista de ejercicios con series/reps y reordenarlos.
 */
export default function FormularioSesion({ sesion, ejercicios, onGuardar, onCancelar }) {
  const esNuevo = !sesion

  const [campos, setCampos] = useState(() => ({
    nombre:      sesion?.nombre      || '',
    descripcion: sesion?.descripcion || '',
    // ejercicios: [{ ejercicioId, orden, series, repeticiones }]
    ejercicios:  sesion?.ejercicios  || [],
  }))
  const [errores, setErrores]             = useState({})
  const [guardando, setGuardando]         = useState(false)
  const [selectorAbierto, setSelectorAbierto] = useState(false)
  const [busquedaEj, setBusquedaEj]       = useState('')

  const mapaEjercicios = useMemo(
    () => Object.fromEntries(ejercicios.map(e => [e.id, e])),
    [ejercicios]
  )

  function actualizarCampo(campo, valor) {
    setCampos(prev => ({ ...prev, [campo]: valor }))
    if (errores[campo]) setErrores(prev => ({ ...prev, [campo]: null }))
  }

  function actualizarEjercicio(idx, campo, valor) {
    setCampos(prev => ({
      ...prev,
      ejercicios: prev.ejercicios.map((e, i) => i === idx ? { ...e, [campo]: valor } : e),
    }))
  }

  function moverEjercicio(idx, dir) {
    setCampos(prev => {
      const lista = [...prev.ejercicios]
      const nuevoIdx = idx + dir
      if (nuevoIdx < 0 || nuevoIdx >= lista.length) return prev
      ;[lista[idx], lista[nuevoIdx]] = [lista[nuevoIdx], lista[idx]]
      return { ...prev, ejercicios: lista.map((e, i) => ({ ...e, orden: i + 1 })) }
    })
  }

  function quitarEjercicio(idx) {
    setCampos(prev => ({
      ...prev,
      ejercicios: prev.ejercicios.filter((_, i) => i !== idx).map((e, i) => ({ ...e, orden: i + 1 })),
    }))
  }

  function añadirEjercicio(ej) {
    if (campos.ejercicios.some(e => e.ejercicioId === ej.id)) return
    setCampos(prev => ({
      ...prev,
      ejercicios: [...prev.ejercicios, {
        ejercicioId:  ej.id,
        orden:        prev.ejercicios.length + 1,
        series:       String(ej.series || ''),
        repeticiones: String(ej.repeticiones || ''),
      }],
    }))
    setSelectorAbierto(false)
  }

  // Ejercicios candidatos: no están ya en la sesión y coinciden con la búsqueda
  const candidatos = useMemo(() => {
    const idsEnSesion = new Set(campos.ejercicios.map(e => e.ejercicioId))
    return ejercicios.filter(ej =>
      !idsEnSesion.has(ej.id) &&
      ej.nombre.toLowerCase().includes(busquedaEj.toLowerCase())
    )
  }, [ejercicios, campos.ejercicios, busquedaEj])

  function validar() {
    const nuevosErrores = {}
    if (!campos.nombre.trim()) nuevosErrores.nombre = 'El nombre es obligatorio'
    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  async function handleGuardar() {
    if (!validar()) return
    setGuardando(true)
    try {
      await onGuardar(campos)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div style={{ padding: '0 16px 32px' }}>

      {/* — Cabecera — */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0 24px' }}>
        <button
          onClick={onCancelar}
          style={{ background: 'none', border: 'none', color: '#f97316', fontSize: '15px', cursor: 'pointer', padding: 0 }}
        >
          Cancelar
        </button>
        <h2 style={{ margin: 0, fontSize: '17px', fontWeight: '600', color: '#f5f5f5' }}>
          {esNuevo ? 'Nueva sesión' : 'Editar sesión'}
        </h2>
        <button
          onClick={handleGuardar}
          disabled={guardando}
          style={{ background: 'none', border: 'none', color: guardando ? '#6b7280' : '#f97316', fontSize: '15px', fontWeight: '600', cursor: guardando ? 'default' : 'pointer', padding: 0 }}
        >
          {guardando ? 'Guardando…' : 'Guardar'}
        </button>
      </div>

      {/* — Nombre — */}
      <Campo etiqueta="Nombre" error={errores.nombre} requerido>
        <input
          type="text"
          value={campos.nombre}
          onChange={e => actualizarCampo('nombre', e.target.value)}
          placeholder="Ej: Push — Pecho y Tríceps"
          style={estiloInput(!!errores.nombre)}
          autoFocus={esNuevo}
        />
      </Campo>

      {/* — Descripción — */}
      <Campo etiqueta="Descripción">
        <input
          type="text"
          value={campos.descripcion}
          onChange={e => actualizarCampo('descripcion', e.target.value)}
          placeholder="Ej: Día de empuje — pecho, hombros y tríceps"
          style={estiloInput()}
        />
      </Campo>

      {/* — Ejercicios de la sesión — */}
      <Campo etiqueta={`Ejercicios de la sesión${campos.ejercicios.length > 0 ? ` (${campos.ejercicios.length})` : ''}`}>
        {campos.ejercicios.map((item, idx) => {
          const ej = mapaEjercicios[item.ejercicioId]
          if (!ej) return null
          const colores = COLORES_GRUPO[ej.grupoPrincipal || (ej.gruposMuscular || [])[0]] || COLORES_GRUPO.core
          return (
            <div key={idx} style={{ backgroundColor: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: '12px', padding: '12px', marginBottom: '8px' }}>
              {/* Nombre + controles de orden */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <IconoEjercicio grupos={ej.gruposMuscular} grupoPrincipal={ej.grupoPrincipal} size={18} />
                <span style={{ flex: 1, fontWeight: '600', color: '#f5f5f5', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {ej.nombre}
                </span>
                <button type="button" onClick={() => moverEjercicio(idx, -1)} disabled={idx === 0} style={estiloBotonOrden(idx === 0)}>↑</button>
                <button type="button" onClick={() => moverEjercicio(idx, 1)} disabled={idx === campos.ejercicios.length - 1} style={estiloBotonOrden(idx === campos.ejercicios.length - 1)}>↓</button>
                <button type="button" onClick={() => quitarEjercicio(idx)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '18px', padding: '0 0 0 4px', lineHeight: 1 }}>×</button>
              </div>
              {/* Series y repeticiones */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ flex: 1 }}>
                  <label style={estiloLabelPequeno}>Series</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="3"
                    value={item.series}
                    onChange={e => actualizarEjercicio(idx, 'series', e.target.value)}
                    style={estiloInputPequeno}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={estiloLabelPequeno}>Reps</label>
                  <input
                    type="text"
                    placeholder="8–12"
                    value={item.repeticiones}
                    onChange={e => actualizarEjercicio(idx, 'repeticiones', e.target.value)}
                    style={estiloInputPequeno}
                  />
                </div>
              </div>
            </div>
          )
        })}

        {/* Botón abrir selector */}
        <button
          type="button"
          onClick={() => { setSelectorAbierto(o => !o); setBusquedaEj('') }}
          style={estiloBotonDasheado}
        >
          <span style={{ fontSize: '16px', lineHeight: 1 }}>{selectorAbierto ? '−' : '+'}</span>
          {selectorAbierto ? 'Cerrar selector' : 'Añadir ejercicio'}
        </button>

        {/* Panel de búsqueda de ejercicios */}
        {selectorAbierto && (
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
              {candidatos.length === 0 ? (
                <p style={{ margin: 0, padding: '20px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
                  {ejercicios.length === 0 ? 'Añade ejercicios al catálogo primero' : 'Sin resultados'}
                </p>
              ) : (
                candidatos.map(ej => {
                  const colores = COLORES_GRUPO[ej.grupoPrincipal || (ej.gruposMuscular || [])[0]] || COLORES_GRUPO.core
                  return (
                    <button
                      key={ej.id}
                      type="button"
                      onClick={() => añadirEjercicio(ej)}
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 14px', backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #1a1a1a', cursor: 'pointer', textAlign: 'left' }}
                    >
                      <IconoEjercicio grupos={ej.gruposMuscular} grupoPrincipal={ej.grupoPrincipal} size={18} />
                      <span style={{ flex: 1, fontSize: '14px', color: '#f5f5f5' }}>{ej.nombre}</span>
                      <span style={{ fontSize: '11px', color: '#6b7280', flexShrink: 0 }}>
                        {(ej.gruposMuscular || []).map(capitalizarGrupo).join(', ')}
                      </span>
                    </button>
                  )
                })
              )}
            </div>
          </div>
        )}
      </Campo>
    </div>
  )
}

// — Auxiliares —

function Campo({ etiqueta, error, requerido, children }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '500', color: '#a1a1a1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {etiqueta}{requerido && <span style={{ color: '#f97316', marginLeft: '3px' }}>*</span>}
      </label>
      {children}
      {error && <p style={{ margin: '6px 0 0', color: '#f87171', fontSize: '13px' }}>{error}</p>}
    </div>
  )
}

function estiloInput(conError = false) {
  return {
    width: '100%', padding: '12px',
    backgroundColor: '#1a1a1a',
    border: `1px solid ${conError ? '#f87171' : '#2e2e2e'}`,
    borderRadius: '10px', color: '#f5f5f5',
    fontSize: '15px', outline: 'none', fontFamily: 'inherit',
  }
}

function estiloBotonOrden(deshabilitado) {
  return {
    background: 'none', border: '1px solid #2e2e2e', borderRadius: '6px',
    color: deshabilitado ? '#3a3a3a' : '#6b7280',
    cursor: deshabilitado ? 'default' : 'pointer',
    width: '24px', height: '24px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '13px', padding: 0, flexShrink: 0,
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
  width: '100%', padding: '8px 10px', textAlign: 'center',
  backgroundColor: '#242424', border: '1px solid #2e2e2e',
  borderRadius: '8px', color: '#f5f5f5',
  fontSize: '14px', outline: 'none', fontFamily: 'inherit',
}

const estiloLabelPequeno = {
  display: 'block', marginBottom: '4px',
  fontSize: '11px', color: '#6b7280',
  textTransform: 'uppercase', letterSpacing: '0.05em',
}
