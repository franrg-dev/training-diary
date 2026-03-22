import { useState } from 'react'
import { COLORES_GRUPO } from '../ejercicios/coloresGrupo'
import { IconoEjercicio } from '../ejercicios/iconosEjercicio'

/**
 * Vista de detalle de una sesión de entrenamiento.
 * Lista los ejercicios con su volumen (series × reps).
 */
export default function DetalleSesion({ sesion, ejercicios, onEditar, onEliminar, onVolver }) {
  const [confirmarBorrar, setConfirmarBorrar] = useState(false)
  const [eliminando, setEliminando]           = useState(false)

  const mapaEjercicios = Object.fromEntries(ejercicios.map(e => [e.id, e]))

  async function handleEliminar() {
    setEliminando(true)
    await onEliminar()
  }

  return (
    <div style={{ padding: '0 16px 16px' }}>

      {/* — Cabecera — */}
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
          Sesiones
        </button>
      </div>

      <h1 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: '700', color: 'var(--color-texto)' }}>
        {sesion.nombre}
      </h1>
      {sesion.descripcion && (
        <p style={{ margin: '0 0 20px', color: 'var(--color-texto-secundario)', fontSize: '14px', lineHeight: '1.6' }}>
          {sesion.descripcion}
        </p>
      )}
      {!sesion.descripcion && <div style={{ marginBottom: '20px' }} />}

      {/* — Lista de ejercicios — */}
      {(sesion.ejercicios || []).length > 0 ? (
        <div className="app-card" style={{ marginBottom: '12px' }}>
          <p style={estiloSeccion}>Ejercicios ({sesion.ejercicios.length})</p>
          {sesion.ejercicios.map((item, i) => {
            const ej = mapaEjercicios[item.ejercicioId]
            if (!ej) return null
            const colores = COLORES_GRUPO[ej.grupoPrincipal || (ej.gruposMuscular || [])[0]] || COLORES_GRUPO.core
            return (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px 0',
                  borderBottom: i < sesion.ejercicios.length - 1 ? '1px solid var(--color-borde)' : 'none',
                }}
              >
                <IconoEjercicio grupos={ej.gruposMuscular} grupoPrincipal={ej.grupoPrincipal} size={18} />
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
        <div className="app-card" style={{ marginBottom: '12px', textAlign: 'center' }}>
          <p style={{ margin: 0, color: 'var(--color-texto-secundario)', fontSize: '14px' }}>Sin ejercicios en esta sesión</p>
        </div>
      )}

      {/* — Acciones — */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
        <button onClick={onEditar} style={estiloBotonEditar}>Editar</button>
        <button onClick={() => setConfirmarBorrar(true)} style={estiloBotonEliminar}>Eliminar</button>
      </div>

      {/* — Confirmación de borrado inline — */}
      {confirmarBorrar && (
        <div style={{ marginTop: '12px', padding: '16px', backgroundColor: 'var(--color-superficie)', border: '1px solid #dc262644', borderRadius: '12px' }}>
          <p style={{ margin: '0 0 14px', color: 'var(--color-texto)', fontSize: '15px', fontWeight: '500' }}>
            ¿Eliminar <strong>{sesion.nombre}</strong>?
          </p>
          <p style={{ margin: '0 0 16px', color: 'var(--color-texto-secundario)', fontSize: '13px', lineHeight: '1.5' }}>
            Se eliminará la plantilla. Los entrenamientos del diario que la usaban no se verán afectados.
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setConfirmarBorrar(false)}
              disabled={eliminando}
              style={{ flex: 1, padding: '11px', backgroundColor: 'transparent', border: '1px solid var(--color-borde)', borderRadius: '10px', color: 'var(--color-texto-secundario)', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
            >
              Cancelar
            </button>
            <button
              onClick={handleEliminar}
              disabled={eliminando}
              style={{ flex: 1, padding: '11px', backgroundColor: '#dc2626', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: eliminando ? 'default' : 'pointer', opacity: eliminando ? 0.6 : 1 }}
            >
              {eliminando ? 'Eliminando…' : 'Eliminar'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const estiloSeccion    = { margin: '0 0 10px', fontSize: '12px', color: 'var(--color-texto-secundario)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.06em' }
const estiloBotonEditar  = { flex: 1, padding: '13px', backgroundColor: 'var(--color-superficie)', border: '1px solid var(--color-borde)', borderRadius: '12px', color: 'var(--color-texto)', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }
const estiloBotonEliminar = { flex: 1, padding: '13px', backgroundColor: '#7f1d1d22', border: '1px solid #dc262644', borderRadius: '12px', color: '#f87171', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }
