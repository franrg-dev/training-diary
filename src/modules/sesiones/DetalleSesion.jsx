import { useState } from 'react'
import { COLORES_GRUPO } from '../ejercicios/coloresGrupo'
import { IconoEjercicio } from '../ejercicios/iconosEjercicio'

export default function DetalleSesion({ sesion, ejercicios, onEditar, onEliminar, onVolver }) {
  const [confirmarBorrar, setConfirmarBorrar] = useState(false)
  const [eliminando, setEliminando]           = useState(false)

  const mapaEjercicios = Object.fromEntries(ejercicios.map(e => [e.id, e]))

  async function handleEliminar() {
    setEliminando(true)
    await onEliminar()
  }

  const items = sesion.ejercicios || []

  return (
    <div style={{ padding: '0 16px 16px' }}>

      {/* — Cabecera — */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px 0 20px' }}>
        <button
          onClick={onVolver}
          style={{ background: 'none', border: 'none', color: 'var(--color-acento)', fontSize: '15px', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Sesiones
        </button>
      </div>

      {/* — Hero — */}
      <div className="app-tarjeta" style={{ marginBottom: '12px' }}>
        <h1 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: '700', color: 'var(--color-texto)' }}>
          {sesion.nombre}
        </h1>
        {sesion.descripcion && (
          <p style={{ margin: 0, color: 'var(--color-texto-secundario)', fontSize: '14px', lineHeight: '1.6' }}>
            {sesion.descripcion}
          </p>
        )}
      </div>

      {/* — Lista de ejercicios — */}
      {items.length > 0 ? (
        <div className="app-tarjeta" style={{ marginBottom: '12px', padding: '18px 18px 8px' }}>
          <p style={{ margin: '0 0 12px', fontSize: '11px', fontWeight: '700', color: 'var(--color-texto-secundario)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Ejercicios ({items.length})
          </p>
          {items.map((item, i) => {
            const ej = mapaEjercicios[item.ejercicioId]
            if (!ej) return null
            const colores = COLORES_GRUPO[ej.grupoPrincipal || (ej.gruposMuscular || [])[0]] || COLORES_GRUPO.core
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 0',
                borderBottom: i < items.length - 1 ? '1px solid var(--color-borde)' : 'none',
              }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  backgroundColor: colores.bg, border: `1px solid ${colores.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <IconoEjercicio grupos={ej.gruposMuscular} grupoPrincipal={ej.grupoPrincipal} size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: '600', color: 'var(--color-texto)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ej.nombre}
                  </p>
                  {(item.series || item.repeticiones) && (
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-texto-secundario)' }}>
                      {item.series || '—'} series × {item.repeticiones || '—'} reps
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="app-tarjeta" style={{ marginBottom: '12px', textAlign: 'center' }}>
          <p style={{ margin: 0, color: 'var(--color-texto-secundario)', fontSize: '14px' }}>Sin ejercicios en esta sesión</p>
        </div>
      )}

      {/* — Acciones — */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
        <button onClick={onEditar} className="app-btn-secundario" style={{ flex: 1 }}>Editar</button>
        <button onClick={() => setConfirmarBorrar(true)} className="app-btn-peligro" style={{ flex: 1 }}>Eliminar</button>
      </div>

      {/* — Confirmación de borrado — */}
      {confirmarBorrar && (
        <div className="app-tarjeta" style={{ marginTop: '12px', border: '1px solid rgba(220,38,38,0.25)' }}>
          <p style={{ margin: '0 0 8px', color: 'var(--color-texto)', fontSize: '15px', fontWeight: '600' }}>
            ¿Eliminar <strong>{sesion.nombre}</strong>?
          </p>
          <p style={{ margin: '0 0 16px', color: 'var(--color-texto-secundario)', fontSize: '13px', lineHeight: '1.5' }}>
            Se eliminará la plantilla. Los entrenamientos del diario que la usaban no se verán afectados.
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setConfirmarBorrar(false)} disabled={eliminando} className="app-btn-secundario" style={{ flex: 1 }}>
              Cancelar
            </button>
            <button onClick={handleEliminar} disabled={eliminando} className="app-btn-peligro" style={{ flex: 1, opacity: eliminando ? 0.6 : 1 }}>
              {eliminando ? 'Eliminando…' : 'Eliminar'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
