import { useState, useMemo } from 'react'

/**
 * Vista de lista del módulo Sesiones.
 * Búsqueda por nombre, tarjeta con badge de nº de ejercicios.
 */
export default function ListaSesiones({ sesiones, cargando, ejercicios, onSeleccionar, onNuevo, tituloDropdown = null }) {
  const [busqueda, setBusqueda] = useState('')

  const mapaEjercicios = useMemo(
    () => Object.fromEntries(ejercicios.map(e => [e.id, e])),
    [ejercicios]
  )

  const sesionesFiltradas = useMemo(() =>
    sesiones.filter(s => s.nombre.toLowerCase().includes(busqueda.toLowerCase())),
    [sesiones, busqueda]
  )

  return (
    <div>
      {/* — Cabecera — */}
      <div style={{ padding: '20px 16px 0' }}>
        {/* Fila 1: selector solo */}
        <div style={{ marginBottom: '12px' }}>
          {tituloDropdown ?? (
            <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0, color: 'var(--color-texto)' }}>Sesiones</h1>
          )}
        </div>

        {/* Fila 2: buscador + botón añadir */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
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
              placeholder="Buscar sesión…"
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
            onClick={onNuevo}
            style={{
              width: '40px', height: '40px', borderRadius: '12px',
              backgroundColor: 'var(--color-acento)', border: 'none', color: '#fff',
              cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: 0,
            }}
            aria-label="Nueva sesión"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
      </div>

      {/* — Lista — */}
      <div style={{ padding: '14px 16px 0' }}>
        {cargando ? (
          <p style={{ color: 'var(--color-texto-secundario)', textAlign: 'center', marginTop: '40px' }}>Cargando…</p>
        ) : sesionesFiltradas.length === 0 ? (
          <EstadoVacio busqueda={busqueda} haySesiones={sesiones.length > 0} onNuevo={onNuevo} />
        ) : (
          sesionesFiltradas.map(s => (
            <TarjetaSesion key={s.id} sesion={s} mapaEjercicios={mapaEjercicios} onClick={() => onSeleccionar(s)} />
          ))
        )}
      </div>
    </div>
  )
}

// — Componentes internos —

function TarjetaSesion({ sesion, mapaEjercicios, onClick }) {
  const numEjercicios = (sesion.ejercicios || []).length
  return (
    <button
      onClick={onClick}
      className="app-tarjeta"
      style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', marginBottom: '10px', cursor: 'pointer', textAlign: 'left' }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: '0 0 4px', fontWeight: '600', color: 'var(--color-texto)', fontSize: '15px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {sesion.nombre}
        </p>
        <p style={{ margin: 0, color: 'var(--color-texto-secundario)', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {sesion.descripcion || `${numEjercicios} ejercicio${numEjercicios !== 1 ? 's' : ''}`}
        </p>
      </div>
      <span style={{
        flexShrink: 0, padding: '3px 10px',
        backgroundColor: 'var(--color-acento-suave)', border: '1px solid var(--color-borde-fuerte)',
        borderRadius: '20px', color: 'var(--color-acento)', fontSize: '12px', fontWeight: '600',
      }}>
        {numEjercicios}
      </span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-borde)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  )
}

function EstadoVacio({ busqueda, haySesiones, onNuevo }) {
  if (busqueda || haySesiones) {
    return (
      <div style={{ textAlign: 'center', marginTop: '60px', color: 'var(--color-texto-secundario)' }}>
        <p style={{ fontSize: '40px', margin: '0 0 12px' }}>🔍</p>
        <p style={{ margin: '0 0 4px', fontWeight: '600', color: 'var(--color-texto-secundario)' }}>Sin resultados</p>
        <p style={{ margin: 0, fontSize: '14px' }}>Prueba con otro término</p>
      </div>
    )
  }
  return (
    <div style={{ textAlign: 'center', marginTop: '60px' }}>
      <p style={{ fontSize: '48px', margin: '0 0 16px' }}>📋</p>
      <p style={{ margin: '0 0 6px', fontWeight: '600', color: 'var(--color-texto)', fontSize: '17px' }}>
        Sin plantillas de sesión
      </p>
      <p style={{ margin: '0 0 24px', color: 'var(--color-texto-secundario)', fontSize: '14px' }}>
        Crea tu primera sesión de entrenamiento
      </p>
      <button onClick={onNuevo} className="app-btn-acento">
        Nueva sesión
      </button>
    </div>
  )
}
