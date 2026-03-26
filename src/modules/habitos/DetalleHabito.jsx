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
    <div style={{ padding: '20px 16px' }}>
      {/* Cabecera */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button onClick={onVolver} style={estiloBotonVolver} aria-label="Volver">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: 'var(--color-texto)', flex: 1 }}>
          {habito.titulo}
        </h1>
        <button
          onClick={onEditar}
          style={{
            background: 'none', border: 'none', color: '#f97316',
            cursor: 'pointer', padding: '4px',
            fontSize: '14px', fontWeight: '500',
          }}
        >
          Editar
        </button>
      </div>

      {/* Card principal */}
      <div style={{
        backgroundColor: 'var(--color-superficie)',
        border: `1px solid ${tipo.color}44`,
        borderRadius: '16px',
        overflow: 'hidden',
        marginBottom: '16px',
      }}>
        {/* Tipo */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '16px',
          borderBottom: '1px solid var(--color-borde)',
          backgroundColor: tipo.color + '11',
        }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            backgroundColor: tipo.color + '22',
            border: `1px solid ${tipo.color}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <IconoTipo tipo={habito.tipo} size={22} />
          </div>
          <div>
            <p style={{ margin: '0 0 2px', fontSize: '11px', color: tipo.color, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {tipo.label}
            </p>
            {habito.descripcion && (
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-texto-secundario)' }}>
                {habito.descripcion}
              </p>
            )}
          </div>
        </div>

        {/* Repetición */}
        <FilaDetalle label="Repetición" valor={textoRepeticion()} />
        {textoFin() && <FilaDetalle label="Fin" valor={textoFin()} />}
        <FilaDetalle label="Inicio" valor={habito.fechaInicio} />

        {/* Etiquetas */}
        {etiquetasHabito.length > 0 && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--color-borde)' }}>
            <p style={{ margin: '0 0 8px', fontSize: '11px', color: 'var(--color-texto-secundario)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Etiquetas
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {etiquetasHabito.map(e => (
                <span key={e.id} style={{
                  padding: '4px 12px', borderRadius: '20px',
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
      </div>

      {/* Eliminar */}
      {!confirmarEliminar ? (
        <button
          onClick={() => setConfirmarEliminar(true)}
          style={{
            width: '100%', padding: '14px', borderRadius: '14px',
            backgroundColor: 'transparent',
            border: '1px solid #ef444444',
            color: '#ef4444', fontSize: '15px', fontWeight: '500', cursor: 'pointer',
          }}
        >
          Eliminar hábito
        </button>
      ) : (
        <div style={{
          backgroundColor: '#ef444411',
          border: '1px solid #ef444444',
          borderRadius: '14px',
          padding: '16px',
          textAlign: 'center',
        }}>
          <p style={{ margin: '0 0 14px', color: 'var(--color-texto)', fontSize: '14px' }}>
            ¿Eliminar «{habito.titulo}»? Se borrarán también todos sus registros de completado.
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setConfirmarEliminar(false)}
              style={{ flex: 1, padding: '10px', borderRadius: '10px', backgroundColor: 'var(--color-superficie)', border: '1px solid var(--color-borde)', color: 'var(--color-texto)', fontSize: '14px', cursor: 'pointer' }}
            >
              Cancelar
            </button>
            <button
              onClick={onEliminar}
              style={{ flex: 1, padding: '10px', borderRadius: '10px', backgroundColor: '#ef4444', border: 'none', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
            >
              Eliminar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function FilaDetalle({ label, valor }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '12px 16px',
      borderTop: '1px solid var(--color-borde)',
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

const estiloBotonVolver = {
  background: 'none', border: 'none', color: '#f97316',
  cursor: 'pointer', padding: '4px', display: 'flex',
  alignItems: 'center', justifyContent: 'center',
  flexShrink: 0,
}
