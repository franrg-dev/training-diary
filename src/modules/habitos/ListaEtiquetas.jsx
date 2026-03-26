import { useState } from 'react'
import IconoTipo from './IconoTipo'

/**
 * Lista de etiquetas de hábito.
 * Al pulsar una etiqueta se expanden los hábitos que la tienen.
 */
export default function ListaEtiquetas({
  etiquetas,
  habitos,
  cargando,
  onNueva,
  onEditar,
  tituloDropdown = null,
}) {
  const [expandida, setExpandida] = useState(null)

  function habitosDeLaEtiqueta(etiquetaId) {
    return habitos.filter(h => (h.etiquetas || []).includes(etiquetaId))
  }

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      {/* Cabecera */}
      <div style={{ padding: '20px 16px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
          <div>
            {tituloDropdown ?? (
              <h1 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 2px', color: 'var(--color-texto)' }}>
                Etiquetas
              </h1>
            )}
            <p style={{ margin: 0, color: 'var(--color-texto-secundario)', fontSize: '14px' }}>
              {etiquetas.length} etiqueta{etiquetas.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onNueva}
            style={{
              width: '40px', height: '40px', borderRadius: '12px',
              backgroundColor: '#f97316', border: 'none', color: '#fff',
              cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              padding: 0,
            }}
            aria-label="Nueva etiqueta"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Lista */}
      <div style={{ padding: '0 16px' }}>
        {cargando ? (
          <p style={{ color: 'var(--color-texto-secundario)', textAlign: 'center', marginTop: '40px' }}>Cargando…</p>
        ) : etiquetas.length === 0 ? (
          <EstadoVacio onNueva={onNueva} />
        ) : (
          etiquetas.map(etiqueta => {
            const habsEtiqueta = habitosDeLaEtiqueta(etiqueta.id)
            const abierta = expandida === etiqueta.id
            return (
              <div key={etiqueta.id} style={{ marginBottom: '8px' }}>
                <button
                  onClick={() => setExpandida(abierta ? null : etiqueta.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    width: '100%', padding: '14px',
                    backgroundColor: 'var(--color-superficie)',
                    border: `1px solid ${abierta ? etiqueta.color + '66' : 'var(--color-borde)'}`,
                    borderRadius: abierta ? '12px 12px 0 0' : '12px',
                    cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  {/* Swatch de color */}
                  <div style={{
                    width: '14px', height: '14px', borderRadius: '50%',
                    backgroundColor: etiqueta.color, flexShrink: 0,
                  }} />
                  <span style={{
                    flex: 1, fontWeight: '600', fontSize: '15px', color: 'var(--color-texto)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {etiqueta.nombre}
                  </span>
                  <span style={{ fontSize: '13px', color: 'var(--color-texto-secundario)', flexShrink: 0 }}>
                    {habsEtiqueta.length}
                  </span>
                  <svg
                    width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="var(--color-texto-secundario)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                    style={{ transition: 'transform 0.2s', transform: abierta ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {abierta && (
                  <div style={{
                    backgroundColor: 'var(--color-superficie)',
                    border: `1px solid ${etiqueta.color + '44'}`,
                    borderTop: 'none',
                    borderRadius: '0 0 12px 12px',
                    overflow: 'hidden',
                  }}>
                    {/* Botón editar etiqueta */}
                    <button
                      onClick={() => onEditar(etiqueta)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        width: '100%', padding: '10px 14px',
                        backgroundColor: 'transparent', border: 'none',
                        borderBottom: '1px solid var(--color-borde)',
                        cursor: 'pointer', textAlign: 'left',
                        color: '#f97316', fontSize: '13px', fontWeight: '500',
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Editar etiqueta
                    </button>

                    {habsEtiqueta.length === 0 ? (
                      <p style={{ margin: 0, padding: '12px 14px', fontSize: '14px', color: 'var(--color-texto-secundario)' }}>
                        Sin hábitos con esta etiqueta
                      </p>
                    ) : (
                      habsEtiqueta.map(h => (
                        <div
                          key={h.id}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '10px 14px',
                            borderBottom: '1px solid var(--color-borde)',
                          }}
                        >
                          <IconoTipo tipo={h.tipo} size={16} />
                          <span style={{ fontSize: '14px', color: 'var(--color-texto)' }}>{h.titulo}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

function EstadoVacio({ onNueva }) {
  return (
    <div style={{ textAlign: 'center', marginTop: '60px' }}>
      <p style={{ fontSize: '48px', margin: '0 0 16px' }}>🏷️</p>
      <p style={{ margin: '0 0 6px', fontWeight: '600', color: 'var(--color-texto)', fontSize: '17px' }}>
        Sin etiquetas
      </p>
      <p style={{ margin: '0 0 24px', color: 'var(--color-texto-secundario)', fontSize: '14px' }}>
        Crea etiquetas para organizar tus hábitos
      </p>
      <button onClick={onNueva} className="app-btn-acento">
        Añadir etiqueta
      </button>
    </div>
  )
}
