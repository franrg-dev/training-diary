import { useState } from 'react'
import { GRUPOS_MUSCULARES } from '../../db/database'
import { COLORES_GRUPO, capitalizarGrupo } from './coloresGrupo'

/**
 * Formulario de creación y edición de ejercicios.
 * Los grupos musculares son multi-selección: un ejercicio puede trabajar varios grupos.
 *
 * @param {object|null} ejercicio        - null para crear nuevo; objeto para editar
 * @param {object[]}    todosEjercicios  - Lista completa para el selector de sustitutos
 * @param {Function}    onGuardar        - Callback async (datos) => void
 * @param {Function}    onCancelar       - Callback para volver sin guardar
 */
export default function FormularioEjercicio({ ejercicio, todosEjercicios, onGuardar, onCancelar }) {
  const esNuevo = !ejercicio

  // Estado del formulario inicializado con los datos del ejercicio (o vacío)
  const [campos, setCampos] = useState(() => {
    const grupos = ejercicio?.gruposMuscular || []
    return {
      nombre:         ejercicio?.nombre         || '',
      gruposMuscular: grupos,
      // grupoPrincipal: por defecto el primero del array (o el guardado previamente)
      grupoPrincipal: ejercicio?.grupoPrincipal || grupos[0] || '',
      series:         ejercicio?.series         || '',
      repeticiones:   ejercicio?.repeticiones   || '',
      ejecucion:      ejercicio?.ejecucion      || '',
      sustitutos:     ejercicio?.sustitutos     || [],
    }
  })
  const [errores, setErrores]                 = useState({})
  const [guardando, setGuardando]             = useState(false)
  const [selectorAbierto, setSelectorAbierto] = useState(false)
  const [busquedaSust, setBusquedaSust]       = useState('')

  // Actualiza un campo escalar del formulario y limpia su error
  function actualizarCampo(campo, valor) {
    setCampos(prev => ({ ...prev, [campo]: valor }))
    if (errores[campo]) setErrores(prev => ({ ...prev, [campo]: null }))
  }

  // Alterna un grupo muscular en la selección múltiple.
  // Si se elimina el grupo principal, asigna automáticamente el primero que quede.
  function toggleGrupo(grupo) {
    setCampos(prev => {
      const yaSeleccionado = prev.gruposMuscular.includes(grupo)
      const nuevosGrupos   = yaSeleccionado
        ? prev.gruposMuscular.filter(g => g !== grupo)
        : [...prev.gruposMuscular, grupo]

      // Recalcular grupoPrincipal si el que se elimina era el principal
      let nuevoPrincipal = prev.grupoPrincipal
      if (yaSeleccionado && prev.grupoPrincipal === grupo) {
        nuevoPrincipal = nuevosGrupos[0] || ''
      }
      // Si se añade el primero, asignarlo como principal automáticamente
      if (!yaSeleccionado && nuevosGrupos.length === 1) {
        nuevoPrincipal = grupo
      }

      return { ...prev, gruposMuscular: nuevosGrupos, grupoPrincipal: nuevoPrincipal }
    })
    if (errores.gruposMuscular) setErrores(prev => ({ ...prev, gruposMuscular: null }))
  }

  // Alterna un ejercicio en la lista de sustitutos
  function toggleSustituto(id) {
    setCampos(prev => ({
      ...prev,
      sustitutos: prev.sustitutos.includes(id)
        ? prev.sustitutos.filter(s => s !== id)
        : [...prev.sustitutos, id],
    }))
  }

  // Valida los campos requeridos
  function validar() {
    const nuevosErrores = {}
    if (!campos.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio'
    }
    if (campos.gruposMuscular.length === 0) {
      nuevosErrores.gruposMuscular = 'Selecciona al menos un grupo muscular'
    }
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

  // Ejercicios disponibles como sustitutos (todos excepto el que se está editando)
  const candidatosSustitutos = todosEjercicios.filter(ej => ej.id !== ejercicio?.id)

  // Filtrados por búsqueda dentro del selector
  const candidatosFiltrados = candidatosSustitutos.filter(ej =>
    ej.nombre.toLowerCase().includes(busquedaSust.toLowerCase())
  )

  // Objetos de los sustitutos seleccionados actualmente
  const sustitutosSeleccionados = todosEjercicios.filter(ej =>
    campos.sustitutos.includes(ej.id)
  )

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
          {esNuevo ? 'Nuevo ejercicio' : 'Editar ejercicio'}
        </h2>
        <button
          onClick={handleGuardar}
          disabled={guardando}
          style={{
            background: 'none', border: 'none',
            color: guardando ? '#6b7280' : '#f97316',
            fontSize: '15px', fontWeight: '600', cursor: guardando ? 'default' : 'pointer', padding: 0,
          }}
        >
          {guardando ? 'Guardando…' : 'Guardar'}
        </button>
      </div>

      {/* — Campo: Nombre — */}
      <Campo etiqueta="Nombre" error={errores.nombre} requerido>
        <input
          type="text"
          value={campos.nombre}
          onChange={e => actualizarCampo('nombre', e.target.value)}
          placeholder="Ej: Peso muerto"
          style={estiloInput(!!errores.nombre)}
          autoFocus={esNuevo}
        />
      </Campo>

      {/* — Campo: Grupos musculares (multi-selección) — */}
      <Campo
        etiqueta={`Grupos musculares${campos.gruposMuscular.length > 0 ? ` (${campos.gruposMuscular.length})` : ''}`}
        error={errores.gruposMuscular}
        requerido
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
          {GRUPOS_MUSCULARES.map(grupo => {
            const activo  = campos.gruposMuscular.includes(grupo)
            const colores = COLORES_GRUPO[grupo] || {}
            return (
              <button
                key={grupo}
                type="button"
                onClick={() => toggleGrupo(grupo)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '20px',
                  border: `1px solid ${activo ? colores.border : '#2e2e2e'}`,
                  backgroundColor: activo ? colores.bg : 'transparent',
                  color: activo ? colores.texto : '#6b7280',
                  fontSize: '14px',
                  fontWeight: activo ? '600' : '400',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  // Borde extra cuando está activo para que destaque más
                  boxShadow: activo ? `0 0 0 1px ${colores.border}` : 'none',
                }}
              >
                <span>{colores.emoji}</span>
                {capitalizarGrupo(grupo)}
                {activo && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      </Campo>

      {/* — Grupo principal (solo si hay 2 o más grupos seleccionados) — */}
      {campos.gruposMuscular.length >= 2 && (
        <Campo etiqueta="Grupo principal">
          <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#6b7280', lineHeight: '1.5' }}>
            Elige qué grupo representa visualmente a este ejercicio (icono y color en la lista).
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {campos.gruposMuscular.map(grupo => {
              const esPrincipal = campos.grupoPrincipal === grupo
              const colores     = COLORES_GRUPO[grupo] || {}
              return (
                <button
                  key={grupo}
                  type="button"
                  onClick={() => actualizarCampo('grupoPrincipal', grupo)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '20px',
                    border: `1px solid ${esPrincipal ? colores.border : '#2e2e2e'}`,
                    backgroundColor: esPrincipal ? colores.bg : 'transparent',
                    color: esPrincipal ? colores.texto : '#6b7280',
                    fontSize: '14px',
                    fontWeight: esPrincipal ? '600' : '400',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: esPrincipal ? `0 0 0 1px ${colores.border}` : 'none',
                  }}
                >
                  <span>{colores.emoji}</span>
                  {capitalizarGrupo(grupo)}
                  {/* Estrella para indicar cuál es el principal */}
                  {esPrincipal && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
        </Campo>
      )}

      {/* — Campos: Series y Repeticiones (en fila) — */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <Campo etiqueta="Series" style={{ flex: 1 }}>
          <input
            type="number"
            inputMode="numeric"
            value={campos.series}
            onChange={e => actualizarCampo('series', e.target.value)}
            placeholder="3"
            min="0"
            max="99"
            style={{ ...estiloInput(), textAlign: 'center', fontSize: '18px' }}
          />
        </Campo>
        <Campo etiqueta="Repeticiones" style={{ flex: 1 }}>
          <input
            type="text"
            inputMode="text"
            value={campos.repeticiones}
            onChange={e => actualizarCampo('repeticiones', e.target.value)}
            placeholder="8–12"
            style={{ ...estiloInput(), textAlign: 'center', fontSize: '18px' }}
          />
        </Campo>
      </div>

      {/* — Campo: Ejecución — */}
      <Campo etiqueta="Descripción de ejecución">
        <textarea
          value={campos.ejecucion}
          onChange={e => actualizarCampo('ejecucion', e.target.value)}
          placeholder="Describe la técnica correcta: posición inicial, recorrido, puntos clave…"
          rows={5}
          style={{ ...estiloInput(), resize: 'vertical', minHeight: '110px', lineHeight: '1.6' }}
        />
      </Campo>

      {/* — Campo: Sustitutos — */}
      <Campo etiqueta={`Ejercicios sustitutos${campos.sustitutos.length > 0 ? ` (${campos.sustitutos.length})` : ''}`}>

        {/* Chips de sustitutos ya seleccionados */}
        {sustitutosSeleccionados.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
            {sustitutosSeleccionados.map(ej => {
              // Usamos el primer grupo para el color del chip
              const primerGrupo = (ej.gruposMuscular || [])[0]
              const c = COLORES_GRUPO[primerGrupo] || COLORES_GRUPO.core
              return (
                <div
                  key={ej.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '5px 10px 5px 8px',
                    backgroundColor: c.bg,
                    border: `1px solid ${c.border}`,
                    borderRadius: '20px',
                  }}
                >
                  <span style={{ fontSize: '13px' }}>{c.emoji}</span>
                  <span style={{ fontSize: '13px', color: c.texto }}>{ej.nombre}</span>
                  <button
                    type="button"
                    onClick={() => toggleSustituto(ej.id)}
                    style={{
                      background: 'none', border: 'none', color: c.texto,
                      cursor: 'pointer', padding: '0', fontSize: '16px',
                      lineHeight: 1, marginLeft: '2px',
                    }}
                    aria-label={`Quitar ${ej.nombre}`}
                  >×</button>
                </div>
              )
            })}
          </div>
        )}

        {/* Botón para abrir/cerrar el selector */}
        {candidatosSustitutos.length > 0 && (
          <button
            type="button"
            onClick={() => { setSelectorAbierto(o => !o); setBusquedaSust('') }}
            style={{
              width: '100%', padding: '10px',
              backgroundColor: 'transparent', border: '1px dashed #2e2e2e',
              borderRadius: '10px', color: '#6b7280', fontSize: '14px',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '6px',
            }}
          >
            <span style={{ fontSize: '16px', lineHeight: 1 }}>{selectorAbierto ? '−' : '+'}</span>
            {selectorAbierto ? 'Cerrar selector' : 'Añadir sustituto'}
          </button>
        )}

        {/* Panel selector de sustitutos */}
        {selectorAbierto && (
          <div style={{ marginTop: '8px', backgroundColor: '#111', border: '1px solid #2e2e2e', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '10px', borderBottom: '1px solid #2e2e2e' }}>
              <input
                type="search"
                placeholder="Buscar…"
                value={busquedaSust}
                onChange={e => setBusquedaSust(e.target.value)}
                style={{ ...estiloInput(), padding: '8px 12px', fontSize: '14px' }}
                autoFocus
              />
            </div>
            <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
              {candidatosFiltrados.length === 0 ? (
                <p style={{ margin: 0, padding: '20px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
                  Sin resultados
                </p>
              ) : (
                candidatosFiltrados.map(ej => {
                  const seleccionado = campos.sustitutos.includes(ej.id)
                  const primerGrupo  = (ej.gruposMuscular || [])[0]
                  const c = COLORES_GRUPO[primerGrupo] || COLORES_GRUPO.core
                  // Emojis de todos los grupos del ejercicio candidato
                  const emojis = (ej.gruposMuscular || []).map(g => COLORES_GRUPO[g]?.emoji).filter(Boolean).join(' ')
                  return (
                    <button
                      key={ej.id}
                      type="button"
                      onClick={() => toggleSustituto(ej.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        width: '100%', padding: '12px 14px',
                        backgroundColor: seleccionado ? '#f9731610' : 'transparent',
                        border: 'none', borderBottom: '1px solid #1a1a1a',
                        cursor: 'pointer', textAlign: 'left',
                      }}
                    >
                      <span style={{ fontSize: '16px', flexShrink: 0 }}>{emojis || c.emoji}</span>
                      <span style={{ flex: 1, fontSize: '14px', color: '#f5f5f5' }}>{ej.nombre}</span>
                      <span style={{ fontSize: '11px', color: '#6b7280', flexShrink: 0 }}>
                        {(ej.gruposMuscular || []).map(capitalizarGrupo).join(', ')}
                      </span>
                      <div
                        style={{
                          width: '20px', height: '20px', borderRadius: '6px', flexShrink: 0,
                          border: `2px solid ${seleccionado ? '#f97316' : '#2e2e2e'}`,
                          backgroundColor: seleccionado ? '#f97316' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        {seleccionado && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>
        )}

        {candidatosSustitutos.length === 0 && (
          <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: '13px' }}>
            Añade más ejercicios al catálogo para poder asignar sustitutos.
          </p>
        )}
      </Campo>
    </div>
  )
}

// — Componentes auxiliares —

function Campo({ etiqueta, error, requerido, children, style }) {
  return (
    <div style={{ marginBottom: '20px', ...style }}>
      <label style={{
        display: 'block', marginBottom: '8px',
        fontSize: '13px', fontWeight: '500', color: '#a1a1a1',
        textTransform: 'uppercase', letterSpacing: '0.05em',
      }}>
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
