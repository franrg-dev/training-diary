import { useState } from 'react'
import { COLORES_GRUPO, capitalizarGrupo } from './coloresGrupo'

/**
 * Vista de detalle de un ejercicio.
 * Muestra todos sus campos y permite editarlo o eliminarlo.
 *
 * @param {object}   ejercicio   - El ejercicio a mostrar
 * @param {object[]} sustitutos  - Objetos ejercicio de los sustitutos (resueltos)
 * @param {Function} onEditar    - Callback para ir al formulario de edición
 * @param {Function} onEliminar  - Callback async para eliminar (ya confirmado)
 * @param {Function} onVolver    - Callback para volver a la lista
 */
export default function DetalleEjercicio({ ejercicio, sustitutos, onEditar, onEliminar, onVolver }) {
  const [confirmarBorrar, setConfirmarBorrar] = useState(false)
  const [eliminando, setEliminando]           = useState(false)

  const grupos  = ejercicio.gruposMuscular || []
  // El icono hero usa grupoPrincipal; si no hay, usa el primero del array
  const colores = COLORES_GRUPO[ejercicio.grupoPrincipal || grupos[0]] || COLORES_GRUPO.core

  async function handleEliminar() {
    setEliminando(true)
    await onEliminar()
    // onEliminar redirige a la lista, no hace falta resetear estado
  }

  return (
    <div style={{ padding: '0 16px 16px' }}>

      {/* — Cabecera con botón volver — */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 0 20px' }}>
        <button
          onClick={onVolver}
          style={{
            background: 'none', border: 'none', color: '#f97316',
            fontSize: '15px', cursor: 'pointer', padding: '0',
            display: 'flex', alignItems: 'center', gap: '4px',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Ejercicios
        </button>
      </div>

      {/* — Hero del ejercicio — */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <div
          style={{
            width: '56px', height: '56px', borderRadius: '14px',
            backgroundColor: colores.bg, border: `1px solid ${colores.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '26px', flexShrink: 0,
          }}
        >
          {colores.emoji}
        </div>
        <div>
          <h1 style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: '700', color: '#f5f5f5' }}>
            {ejercicio.nombre}
          </h1>
          {/* Un badge por cada grupo muscular */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {grupos.map(grupo => {
              const c = COLORES_GRUPO[grupo] || COLORES_GRUPO.core
              return (
                <span
                  key={grupo}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    padding: '3px 10px', borderRadius: '20px',
                    backgroundColor: c.bg, border: `1px solid ${c.border}`,
                    color: c.texto, fontSize: '12px', fontWeight: '600',
                  }}
                >
                  {c.emoji} {capitalizarGrupo(grupo)}
                </span>
              )
            })}
          </div>
        </div>
      </div>

      {/* — Volumen de trabajo — */}
      {(ejercicio.series > 0 || ejercicio.repeticiones) && (
        <div className="app-card" style={{ marginBottom: '12px' }}>
          <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#6b7280', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Volumen de trabajo
          </p>
          <div style={{ display: 'flex', gap: '16px' }}>
            {ejercicio.series > 0 && (
              <div>
                <p style={{ margin: '0 0 2px', fontSize: '24px', fontWeight: '700', color: '#f97316' }}>
                  {ejercicio.series}
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Series</p>
              </div>
            )}
            {ejercicio.repeticiones && (
              <div>
                <p style={{ margin: '0 0 2px', fontSize: '24px', fontWeight: '700', color: '#f97316' }}>
                  {ejercicio.repeticiones}
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Repeticiones</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* — Ejecución — */}
      {ejercicio.ejecucion && (
        <div className="app-card" style={{ marginBottom: '12px' }}>
          <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#6b7280', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Ejecución
          </p>
          <p style={{ margin: 0, color: '#d1d5db', fontSize: '15px', lineHeight: '1.65', whiteSpace: 'pre-wrap' }}>
            {ejercicio.ejecucion}
          </p>
        </div>
      )}

      {/* — Sustitutos — */}
      {sustitutos.length > 0 && (
        <div className="app-card" style={{ marginBottom: '12px' }}>
          <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#6b7280', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Ejercicios sustitutos
          </p>
          {sustitutos.map(sust => {
            const gruposSust  = sust.gruposMuscular || []
            const cPrimero    = COLORES_GRUPO[gruposSust[0]] || COLORES_GRUPO.core
            return (
              <div
                key={sust.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '8px 0', borderBottom: '1px solid #2e2e2e',
                }}
              >
                <span style={{ fontSize: '16px' }}>{cPrimero.emoji}</span>
                <span style={{ fontSize: '14px', color: '#f5f5f5', flex: 1 }}>{sust.nombre}</span>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                  {gruposSust.map(capitalizarGrupo).join(', ')}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* — Acciones — */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
        <button
          onClick={onEditar}
          style={{
            flex: 1,
            padding: '13px',
            backgroundColor: '#1a1a1a',
            border: '1px solid #2e2e2e',
            borderRadius: '12px',
            color: '#f5f5f5',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Editar
        </button>
        <button
          onClick={() => setConfirmarBorrar(true)}
          style={{
            flex: 1,
            padding: '13px',
            backgroundColor: '#7f1d1d22',
            border: '1px solid #dc262644',
            borderRadius: '12px',
            color: '#f87171',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Eliminar
        </button>
      </div>

      {/* — Confirmación de borrado inline — */}
      {confirmarBorrar && (
        <div
          style={{
            marginTop: '12px',
            padding: '16px',
            backgroundColor: '#1a1a1a',
            border: '1px solid #dc262644',
            borderRadius: '12px',
          }}
        >
          <p style={{ margin: '0 0 14px', color: '#f5f5f5', fontSize: '15px', fontWeight: '500' }}>
            ¿Eliminar <strong>{ejercicio.nombre}</strong>?
          </p>
          <p style={{ margin: '0 0 16px', color: '#a1a1a1', fontSize: '13px', lineHeight: '1.5' }}>
            Se eliminará del catálogo y de la lista de sustitutos de otros ejercicios. Esta acción no se puede deshacer.
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setConfirmarBorrar(false)}
              disabled={eliminando}
              style={{
                flex: 1, padding: '11px',
                backgroundColor: 'transparent', border: '1px solid #2e2e2e',
                borderRadius: '10px', color: '#a1a1a1', fontSize: '14px',
                fontWeight: '600', cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleEliminar}
              disabled={eliminando}
              style={{
                flex: 1, padding: '11px',
                backgroundColor: '#dc2626', border: 'none',
                borderRadius: '10px', color: '#fff', fontSize: '14px',
                fontWeight: '600', cursor: eliminando ? 'default' : 'pointer',
                opacity: eliminando ? 0.6 : 1,
              }}
            >
              {eliminando ? 'Eliminando…' : 'Eliminar'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
