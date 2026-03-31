import { useState, useMemo } from 'react'
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
  const [busqueda, setBusqueda]   = useState('')

  function habitosDeLaEtiqueta(etiquetaId) {
    return habitos.filter(h => (h.etiquetas || []).includes(etiquetaId))
  }

  const etiquetasFiltradas = useMemo(() =>
    etiquetas.filter(e => e.nombre.toLowerCase().includes(busqueda.toLowerCase())),
    [etiquetas, busqueda]
  )

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      {/* Cabecera */}
      <div style={{ padding: '20px 16px 0' }}>
        {/* Fila 1: selector */}
        <div style={{ marginBottom: '12px' }}>
          {tituloDropdown ?? (
            <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0, color: 'var(--color-texto)' }}>Etiquetas</h1>
          )}
        </div>

        {/* Fila 2: buscador + botón añadir */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <svg
              style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-texto-secundario)', pointerEvents: 'none' }}
              width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              placeholder="Buscar etiqueta…"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="app-input"
              style={{ padding: '12px 36px 12px 40px' }}
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda('')}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-texto-secundario)', cursor: 'pointer', fontSize: '18px', padding: 0 }}
              >×</button>
            )}
          </div>
          <button
            onClick={onNueva}
            style={{
              width: '40px', height: '40px', borderRadius: '12px',
              backgroundColor: 'var(--color-acento)', border: 'none',
              color: 'var(--color-btn-acento-texto)',
              cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: 0,
            }}
            aria-label="Nueva etiqueta"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
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
          etiquetasFiltradas.map(etiqueta => {
            const habsEtiqueta = habitosDeLaEtiqueta(etiqueta.id)
            const abierta = expandida === etiqueta.id
            return (
              <div key={etiqueta.id} style={{ marginBottom: '8px' }}>
                {/* Cabecera acordeón */}
                <button
                  onClick={() => setExpandida(abierta ? null : etiqueta.id)}
                  className="app-tarjeta"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    width: '100%', cursor: 'pointer', textAlign: 'left',
                    borderColor: abierta ? etiqueta.color + '66' : undefined,
                    borderRadius: abierta ? 'var(--radio-xl) var(--radio-xl) 0 0' : undefined,
                    marginBottom: 0,
                  }}
                >
                  {/* Swatch */}
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
                  <span style={{
                    flexShrink: 0, padding: '2px 10px',
                    backgroundColor: 'var(--color-acento-suave)', border: '1px solid var(--color-borde-fuerte)',
                    borderRadius: '20px', color: 'var(--color-acento)', fontSize: '12px', fontWeight: '600',
                  }}>
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

                {/* Contenido expandido */}
                {abierta && (
                  <div style={{
                    backgroundColor: 'var(--color-superficie)',
                    border: `1px solid ${etiqueta.color + '44'}`,
                    borderTop: 'none',
                    borderRadius: '0 0 var(--radio-xl) var(--radio-xl)',
                    boxShadow: 'var(--sombra-1)',
                    overflow: 'hidden',
                  }}>
                    {/* Botón editar etiqueta */}
                    <button
                      onClick={() => onEditar(etiqueta)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        width: '100%', padding: '10px 16px',
                        backgroundColor: 'transparent', border: 'none',
                        borderBottom: '1px solid var(--color-borde)',
                        cursor: 'pointer', textAlign: 'left',
                        color: 'var(--color-acento)', fontSize: '13px', fontWeight: '500',
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Editar etiqueta
                    </button>

                    {habsEtiqueta.length === 0 ? (
                      <p style={{ margin: 0, padding: '12px 16px', fontSize: '14px', color: 'var(--color-texto-secundario)' }}>
                        Sin hábitos con esta etiqueta
                      </p>
                    ) : (
                      habsEtiqueta.map((h, idx) => (
                        <div
                          key={h.id}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '10px 16px',
                            borderBottom: idx < habsEtiqueta.length - 1 ? '1px solid var(--color-borde)' : 'none',
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
    <div className="app-empty-state">
      <p className="app-empty-icon">🏷️</p>
      <p className="app-empty-title">Sin etiquetas</p>
      <p className="app-empty-text">Crea etiquetas para organizar tus hábitos</p>
      <button onClick={onNueva} className="app-btn-acento" style={{ marginTop: '8px' }}>
        Añadir etiqueta
      </button>
    </div>
  )
}
