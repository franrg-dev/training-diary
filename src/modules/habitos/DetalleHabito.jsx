import { useState } from 'react'
import IconoTipo from './IconoTipo'
import { TIPOS_HABITO } from './tiposHabito'

const DIAS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

/**
 * Vista de detalle de un hábito con botones editar / eliminar.
 */
export default function DetalleHabito({ habito, etiquetas, onEditar, onEliminar, onVolver }) {
  const [confirmarEliminar, setConfirmarEliminar] = useState(false)

  const tipo = TIPOS_HABITO.find(t => t.id === habito.tipo) ?? TIPOS_HABITO[TIPOS_HABITO.length - 1]
  const rep  = habito.repeticion || {}

  const etiquetasHabito = (habito.etiquetas || [])
    .map(id => etiquetas.find(e => e.id === id))
    .filter(Boolean)

  function textoRepeticion() {
    if (!rep.tipo || rep.tipo === 'ninguna') return 'Una sola vez'
    if (rep.tipo === 'diaria')    return 'Diaria'
    if (rep.tipo === 'semanal') {
      const dias = (rep.diasSemana || []).map(d => DIAS_ES[d]).join(', ')
      return `Semanal (${dias || 'sin días'})`
    }
    if (rep.tipo === 'mensual') {
      const dias = (rep.diasMes || []).sort((a, b) => a - b).join(', ')
      return `Mensual (días ${dias || '—'})`
    }
    return '—'
  }

  function textoFin() {
    if (!rep.tipo || rep.tipo === 'ninguna') return null
    if (rep.finTipo === 'fecha' && rep.finFecha) return `Hasta ${rep.finFecha}`
    if (rep.finTipo === 'veces' && rep.finVeces) return `${rep.finVeces} veces`
    return 'Sin fin'
  }

  return (
    <div style={{ padding: '0 16px 16px' }}>

      {/* Cabecera */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px 0 20px' }}>
        <button
          onClick={onVolver}
          style={{ background: 'none', border: 'none', color: 'var(--color-acento)', fontSize: '15px', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Hábitos
        </button>
      </div>

      {/* Hero */}
      <div
        className="app-tarjeta"
        style={{ marginBottom: '12px', borderColor: tipo.color + '44' }}
      >
        {/* Tipo */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '14px',
          paddingBottom: '14px', marginBottom: '14px',
          borderBottom: '1px solid var(--color-borde)',
        }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            backgroundColor: tipo.color + '22',
            border: `1px solid ${tipo.color}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <IconoTipo tipo={habito.tipo} size={22} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: '0 0 3px', fontSize: '11px', color: tipo.color, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {tipo.label}
            </p>
            <p style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: 'var(--color-texto)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {habito.titulo}
            </p>
          </div>
          <button
            onClick={onEditar}
            style={{ background: 'none', border: 'none', color: 'var(--color-acento)', cursor: 'pointer', padding: '4px', fontSize: '14px', fontWeight: '500', flexShrink: 0 }}
          >
            Editar
          </button>
        </div>

        {/* Descripción */}
        {habito.descripcion && (
          <p style={{ margin: '0 0 14px', fontSize: '14px', color: 'var(--color-texto-secundario)', lineHeight: '1.6' }}>
            {habito.descripcion}
          </p>
        )}

        {/* Filas de detalle */}
        <FilaDetalle label="Repetición" valor={textoRepeticion()} />
        {textoFin() && <FilaDetalle label="Fin" valor={textoFin()} />}
        <FilaDetalle label="Inicio" valor={habito.fechaInicio} ultimo={!etiquetasHabito.length && !(habito.subhabitos || []).length} />

        {/* Etiquetas */}
        {etiquetasHabito.length > 0 && (
          <div style={{ paddingTop: '12px', marginTop: '2px', borderTop: '1px solid var(--color-borde)' }}>
            <p style={{ margin: '0 0 8px', fontSize: '11px', color: 'var(--color-texto-secundario)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Etiquetas
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {etiquetasHabito.map(e => (
                <span key={e.id} style={{
                  padding: '3px 10px', borderRadius: '20px',
                  border: `1px solid ${e.color}`,
                  backgroundColor: e.color + '22',
                  color: e.color,
                  fontSize: '12px', fontWeight: '600',
                }}>
                  {e.nombre}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Subhábitos */}
        {(habito.subhabitos || []).length > 0 && (
          <div style={{ paddingTop: '12px', marginTop: '12px', borderTop: '1px solid var(--color-borde)' }}>
            <p style={{ margin: '0 0 4px', fontSize: '11px', color: 'var(--color-texto-secundario)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Subhábitos
            </p>
            {habito.subhabitosMinimo > 0 && (
              <p style={{ margin: '0 0 8px', fontSize: '12px', color: 'var(--color-acento)' }}>
                Mínimo {habito.subhabitosMinimo} de {habito.subhabitos.length} para completar
              </p>
            )}
            {habito.subhabitos.map((s, idx) => (
              <div key={s.id} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 0',
                borderTop: idx > 0 ? '1px solid var(--color-borde)' : 'none',
              }}>
                <div style={{
                  width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
                  backgroundColor: s.obligatorio ? 'var(--color-acento)' : 'var(--color-borde)',
                }} />
                <span style={{ flex: 1, fontSize: '14px', color: 'var(--color-texto)' }}>{s.texto}</span>
                {s.obligatorio && (
                  <span style={{ fontSize: '11px', color: 'var(--color-acento)', fontWeight: '600' }}>Obligatorio</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Acciones */}
      {!confirmarEliminar ? (
        <button onClick={() => setConfirmarEliminar(true)} className="app-btn-peligro" style={{ width: '100%' }}>
          Eliminar hábito
        </button>
      ) : (
        <div className="app-tarjeta" style={{ borderColor: 'rgba(220,38,38,0.25)' }}>
          <p style={{ margin: '0 0 8px', color: 'var(--color-texto)', fontSize: '15px', fontWeight: '600' }}>
            ¿Eliminar <strong>{habito.titulo}</strong>?
          </p>
          <p style={{ margin: '0 0 16px', color: 'var(--color-texto-secundario)', fontSize: '13px', lineHeight: '1.5' }}>
            Se borrarán también todos sus registros de completado. Esta acción no se puede deshacer.
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setConfirmarEliminar(false)} className="app-btn-secundario" style={{ flex: 1 }}>
              Cancelar
            </button>
            <button onClick={onEliminar} className="app-btn-peligro" style={{ flex: 1 }}>
              Eliminar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function FilaDetalle({ label, valor, ultimo }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 0',
      borderTop: '1px solid var(--color-borde)',
      marginBottom: ultimo ? 0 : undefined,
    }}>
      <span style={{ fontSize: '13px', color: 'var(--color-texto-secundario)', fontWeight: '500' }}>
        {label}
      </span>
      <span style={{ fontSize: '14px', color: 'var(--color-texto)', fontWeight: '500', textAlign: 'right', maxWidth: '60%' }}>
        {valor}
      </span>
    </div>
  )
}
