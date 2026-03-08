import { useState } from 'react'
import { COLORES_GRUPO } from '../ejercicios/coloresGrupo'

const DIAS_LARGO  = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const MESES_LARGO = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                     'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

function formatearFechaLarga(fechaStr) {
  const [anio, mes, dia] = fechaStr.split('-').map(Number)
  const d = new Date(anio, mes - 1, dia)
  return `${DIAS_LARGO[d.getDay()]}, ${dia} de ${MESES_LARGO[mes - 1]} de ${anio}`
}

/**
 * Vista de detalle de una entrada del diario.
 * Muestra ejercicios, pesos, sensaciones y notas del día.
 */
export default function DetalleDia({ entrada, ejercicios, sesiones, onEditar, onEliminar, onVolver }) {
  const [confirmarBorrar, setConfirmarBorrar] = useState(false)
  const [eliminando, setEliminando]           = useState(false)

  const mapaEjercicios = Object.fromEntries(ejercicios.map(e => [e.id, e]))
  const sesion         = sesiones.find(s => s.id === entrada.sesionId)

  async function handleEliminar() {
    setEliminando(true)
    await onEliminar()
  }

  return (
    <div style={{ padding: '0 16px 16px' }}>

      {/* — Cabecera — */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px 0 20px' }}>
        <button
          onClick={onVolver}
          style={{ background: 'none', border: 'none', color: '#f97316', fontSize: '15px', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Diario
        </button>
      </div>

      <h1 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: '700', color: '#f5f5f5' }}>
        {formatearFechaLarga(entrada.fecha)}
      </h1>
      {sesion && (
        <p style={{ margin: '0 0 20px', color: '#6b7280', fontSize: '14px' }}>
          Sesión: <span style={{ color: '#f97316', fontWeight: '600' }}>{sesion.nombre}</span>
        </p>
      )}
      {!sesion && <div style={{ marginBottom: '20px' }} />}

      {/* — Ejercicios del día — */}
      {(entrada.ejerciciosDia || []).length > 0 && (
        <div className="app-card" style={{ marginBottom: '12px' }}>
          <p style={estiloSeccion}>Ejercicios</p>
          {(entrada.ejerciciosDia || []).map((item, i) => {
            const ej = mapaEjercicios[item.ejercicioId]
            if (!ej) return null
            const colores = COLORES_GRUPO[ej.grupoPrincipal || (ej.gruposMuscular || [])[0]] || COLORES_GRUPO.core
            const esUltimo = i === entrada.ejerciciosDia.length - 1
            return (
              <div
                key={i}
                style={{
                  paddingBottom: esUltimo ? 0 : '14px',
                  marginBottom:  esUltimo ? 0 : '14px',
                  borderBottom:  esUltimo ? 'none' : '1px solid #2e2e2e',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '18px' }}>{colores.emoji}</span>
                  <span style={{ fontWeight: '600', color: '#f5f5f5', fontSize: '15px' }}>{ej.nombre}</span>
                </div>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: item.sensaciones ? '6px' : 0 }}>
                  {Number(item.peso) > 0 && (
                    <div>
                      <span style={{ fontSize: '22px', fontWeight: '700', color: '#f97316' }}>{item.peso}</span>
                      <span style={{ fontSize: '13px', color: '#6b7280', marginLeft: '3px' }}>{item.unidad || 'kg'}</span>
                    </div>
                  )}
                  {(item.series || item.repeticiones) && (
                    <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '2px' }}>
                      <span style={{ fontSize: '14px', color: '#a1a1a1' }}>
                        {item.series || '—'} × {item.repeticiones || '—'}
                      </span>
                    </div>
                  )}
                </div>
                {item.sensaciones && (
                  <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', fontStyle: 'italic' }}>
                    {item.sensaciones}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* — Sensaciones generales — */}
      {entrada.sensacionesGenerales && (
        <div className="app-card" style={{ marginBottom: '12px' }}>
          <p style={estiloSeccion}>Sensaciones generales</p>
          <p style={{ margin: 0, color: '#d1d5db', fontSize: '15px', lineHeight: '1.6' }}>
            {entrada.sensacionesGenerales}
          </p>
        </div>
      )}

      {/* — Notas — */}
      {entrada.notas && (
        <div className="app-card" style={{ marginBottom: '12px' }}>
          <p style={estiloSeccion}>Notas</p>
          <p style={{ margin: 0, color: '#d1d5db', fontSize: '15px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
            {entrada.notas}
          </p>
        </div>
      )}

      {/* — Acciones — */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
        <button onClick={onEditar} style={estiloBotonEditar}>Editar</button>
        <button onClick={() => setConfirmarBorrar(true)} style={estiloBotonEliminar}>Eliminar</button>
      </div>

      {/* — Confirmación de borrado inline — */}
      {confirmarBorrar && (
        <div style={{ marginTop: '12px', padding: '16px', backgroundColor: '#1a1a1a', border: '1px solid #dc262644', borderRadius: '12px' }}>
          <p style={{ margin: '0 0 14px', color: '#f5f5f5', fontSize: '15px', fontWeight: '500' }}>
            ¿Eliminar este entrenamiento?
          </p>
          <p style={{ margin: '0 0 16px', color: '#a1a1a1', fontSize: '13px', lineHeight: '1.5' }}>
            Los datos del historial de pesos no se borrarán. Esta acción no se puede deshacer.
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setConfirmarBorrar(false)} disabled={eliminando} style={{ flex: 1, padding: '11px', backgroundColor: 'transparent', border: '1px solid #2e2e2e', borderRadius: '10px', color: '#a1a1a1', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
              Cancelar
            </button>
            <button onClick={handleEliminar} disabled={eliminando} style={{ flex: 1, padding: '11px', backgroundColor: '#dc2626', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: eliminando ? 'default' : 'pointer', opacity: eliminando ? 0.6 : 1 }}>
              {eliminando ? 'Eliminando…' : 'Eliminar'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const estiloSeccion     = { margin: '0 0 10px', fontSize: '12px', color: '#6b7280', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.06em' }
const estiloBotonEditar  = { flex: 1, padding: '13px', backgroundColor: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: '12px', color: '#f5f5f5', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }
const estiloBotonEliminar = { flex: 1, padding: '13px', backgroundColor: '#7f1d1d22', border: '1px solid #dc262644', borderRadius: '12px', color: '#f87171', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }
