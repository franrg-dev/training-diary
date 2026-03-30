import { useState, useMemo, useCallback } from 'react'
import { TIPOS_HABITO } from './tiposHabito'
import IconoTipo from './IconoTipo'

/**
 * Lista de todos los hábitos con filtros por tipo y etiqueta.
 */
export default function ListaHabitos({
  habitos,
  etiquetas,
  cargando,
  onSeleccionar,
  onNuevo,
  tituloDropdown = null,
}) {
  const [filtroTipo, setFiltroTipo]         = useState(null)
  const [filtroEtiqueta, setFiltroEtiqueta] = useState(null)
  const [busqueda, setBusqueda]             = useState('')

  // Tipos presentes en el catálogo (solo se muestran si hay >1)
  const tiposPresentes = useMemo(() => {
    const set = new Set(habitos.map(h => h.tipo))
    return TIPOS_HABITO.filter(t => set.has(t.id))
  }, [habitos])

  // Etiquetas que están asignadas a al menos un hábito
  const etiquetasPresentes = useMemo(() => {
    const ids = new Set(habitos.flatMap(h => h.etiquetas || []))
    return etiquetas.filter(e => ids.has(e.id))
  }, [habitos, etiquetas])

  const habitosFiltrados = useMemo(() => {
    return habitos.filter(h => {
      if (filtroTipo     && h.tipo !== filtroTipo)                         return false
      if (filtroEtiqueta && !(h.etiquetas || []).includes(filtroEtiqueta)) return false
      if (busqueda       && !h.titulo.toLowerCase().includes(busqueda.toLowerCase())) return false
      return true
    })
  }, [habitos, filtroTipo, filtroEtiqueta, busqueda])

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      {/* Cabecera */}
      <div style={{ padding: '20px 16px 0' }}>
        {/* Fila 1: selector solo */}
        <div style={{ marginBottom: '12px' }}>
          {tituloDropdown ?? (
            <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0, color: 'var(--color-texto)' }}>Hábitos</h1>
          )}
        </div>

        {/* Fila 2: buscador + botón añadir */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <svg
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-texto-secundario)', pointerEvents: 'none' }}
              width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              placeholder="Buscar hábito…"
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
            aria-label="Nuevo hábito"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>

        {/* Chips de filtro */}
        {(tiposPresentes.length > 1 || etiquetasPresentes.length > 0) && (
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', scrollbarWidth: 'none' }}>
            {tiposPresentes.length > 1 && tiposPresentes.map(tipo => (
              <ChipFiltro
                key={tipo.id}
                label={tipo.label}
                color={tipo.color}
                activo={filtroTipo === tipo.id}
                onClick={() => setFiltroTipo(filtroTipo === tipo.id ? null : tipo.id)}
              />
            ))}
            {etiquetasPresentes.map(etiqueta => (
              <ChipFiltro
                key={etiqueta.id}
                label={etiqueta.nombre}
                color={etiqueta.color}
                activo={filtroEtiqueta === etiqueta.id}
                onClick={() => setFiltroEtiqueta(filtroEtiqueta === etiqueta.id ? null : etiqueta.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lista */}
      <div style={{ padding: '0 16px' }}>
        {cargando ? (
          <p style={{ color: 'var(--color-texto-secundario)', textAlign: 'center', marginTop: '40px' }}>Cargando…</p>
        ) : habitosFiltrados.length === 0 ? (
          <EstadoVacio hayHabitos={habitos.length > 0} onNuevo={onNuevo} />
        ) : (
          habitosFiltrados.map(h => (
            <TarjetaHabito key={h.id} habito={h} etiquetas={etiquetas} onClick={() => onSeleccionar(h)} />
          ))
        )}
      </div>
    </div>
  )
}

function TarjetaHabito({ habito, etiquetas, onClick }) {
  const tipo = TIPOS_HABITO.find(t => t.id === habito.tipo) ?? TIPOS_HABITO[TIPOS_HABITO.length - 1]
  const rep  = habito.repeticion || {}

  function textoRepeticion() {
    if (!rep.tipo || rep.tipo === 'ninguna') return 'Una vez'
    if (rep.tipo === 'diaria')   return 'Diaria'
    if (rep.tipo === 'semanal')  return `Semanal · ${(rep.diasSemana || []).length} día${(rep.diasSemana || []).length !== 1 ? 's' : ''}`
    if (rep.tipo === 'mensual')  return `Mensual · ${(rep.diasMes || []).length} día${(rep.diasMes || []).length !== 1 ? 's' : ''}`
    return '—'
  }

  const etiquetasHabito = (habito.etiquetas || [])
    .map(id => etiquetas.find(e => e.id === id))
    .filter(Boolean)

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '14px',
        width: '100%', padding: '14px', marginBottom: '10px',
        backgroundColor: 'var(--color-superficie)',
        border: '1px solid var(--color-borde)',
        borderRadius: '20px', boxShadow: 'var(--sombra-1)', cursor: 'pointer', textAlign: 'left',
      }}
    >
      <div style={{
        width: '42px', height: '42px', borderRadius: '14px',
        backgroundColor: tipo.color + '22',
        border: `1px solid ${tipo.color}44`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <IconoTipo tipo={habito.tipo} size={20} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: '0 0 3px', fontWeight: '600', color: 'var(--color-texto)', fontSize: '15px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {habito.titulo}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', color: tipo.color, fontWeight: '500' }}>
            {textoRepeticion()}
          </span>
          {etiquetasHabito.map(e => (
            <span key={e.id} style={{
              fontSize: '11px', padding: '1px 7px',
              borderRadius: '20px',
              border: `1px solid ${e.color}`,
              backgroundColor: e.color + '22',
              color: e.color, fontWeight: '500',
            }}>
              {e.nombre}
            </span>
          ))}
        </div>
      </div>

      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-borde)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  )
}

function ChipFiltro({ label, color, activo, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        flexShrink: 0,
        padding: '6px 14px',
        borderRadius: '20px',
        border: `1px solid ${activo ? color : 'var(--color-borde)'}`,
        backgroundColor: activo ? color + '22' : 'transparent',
        color: activo ? color : 'var(--color-texto-secundario)',
        fontSize: '13px', fontWeight: activo ? '600' : '400',
        cursor: 'pointer', whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  )
}

function EstadoVacio({ hayHabitos, onNuevo }) {
  if (hayHabitos) {
    return (
      <div style={{ textAlign: 'center', marginTop: '60px', color: 'var(--color-texto-secundario)' }}>
        <p style={{ fontSize: '40px', margin: '0 0 12px' }}>🔍</p>
        <p style={{ margin: 0, fontWeight: '600' }}>Sin resultados</p>
        <p style={{ margin: 0, fontSize: '14px' }}>Prueba con otro filtro</p>
      </div>
    )
  }
  return (
    <div style={{ textAlign: 'center', marginTop: '60px' }}>
      <p style={{ fontSize: '48px', margin: '0 0 16px' }}>✅</p>
      <p style={{ margin: '0 0 6px', fontWeight: '600', color: 'var(--color-texto)', fontSize: '17px' }}>
        Sin hábitos todavía
      </p>
      <p style={{ margin: '0 0 24px', color: 'var(--color-texto-secundario)', fontSize: '14px' }}>
        Crea tu primer hábito para empezar
      </p>
      <button onClick={onNuevo} className="app-btn-acento">
        Añadir hábito
      </button>
    </div>
  )
}
