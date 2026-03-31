import { useState, useMemo } from 'react'
import { GRUPOS_MUSCULARES } from '../../db/database'
import { COLORES_GRUPO, capitalizarGrupo } from './coloresGrupo'
import { IconoEjercicio } from './iconosEjercicio'

/**
 * Vista de lista del módulo Ejercicios.
 * Muestra todos los ejercicios con búsqueda por nombre y filtro por grupo muscular.
 */
export default function ListaEjercicios({ ejercicios, cargando, onSeleccionar, onNuevo, tituloDropdown = null }) {
  const [busqueda, setBusqueda]       = useState('')
  const [grupoFiltro, setGrupoFiltro] = useState(null) // null = todos

  // Filtra la lista según búsqueda y grupo seleccionado.
  // El filtro de grupo es inclusivo: muestra ejercicios que contengan ese grupo entre los suyos.
  const ejerciciosFiltrados = useMemo(() => {
    return ejercicios.filter(ej => {
      const coincideBusqueda = ej.nombre.toLowerCase().includes(busqueda.toLowerCase())
      const coincideGrupo    = grupoFiltro === null || (ej.gruposMuscular || []).includes(grupoFiltro)
      return coincideBusqueda && coincideGrupo
    })
  }, [ejercicios, busqueda, grupoFiltro])

  // Cuenta cuántos ejercicios pertenecen a cada grupo (un ejercicio puede sumar en varios)
  const conteoGrupos = useMemo(() => {
    const conteo = {}
    for (const ej of ejercicios) {
      for (const grupo of (ej.gruposMuscular || [])) {
        conteo[grupo] = (conteo[grupo] || 0) + 1
      }
    }
    return conteo
  }, [ejercicios])

  return (
    <div style={{ position: 'relative', height: '100%' }}>

      {/* — Cabecera — */}
      <div style={{ padding: '20px 16px 0' }}>
        {/* Fila 1: selector solo */}
        <div style={{ marginBottom: '12px' }}>
          {tituloDropdown ?? (
            <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0, color: 'var(--color-texto)' }}>Ejercicios</h1>
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
              placeholder="Buscar ejercicio…"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="app-input"
              style={{ padding: '12px 36px 12px 40px' }}
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda('')}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-texto-secundario)', cursor: 'pointer', fontSize: '18px', padding: 0, lineHeight: 1 }}
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
            aria-label="Nuevo ejercicio"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>

        {/* — Chips de filtro por grupo muscular — */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '12px',
            scrollbarWidth: 'none',
          }}
        >
          {/* Chip "Todos" */}
          <ChipGrupo
            etiqueta="Todos"
            activo={grupoFiltro === null}
            onClick={() => setGrupoFiltro(null)}
          />
          {/* Chips de cada grupo que tenga ejercicios */}
          {GRUPOS_MUSCULARES.map(grupo => (
            conteoGrupos[grupo] > 0 && (
              <ChipGrupo
                key={grupo}
                etiqueta={capitalizarGrupo(grupo)}
                activo={grupoFiltro === grupo}
                color={COLORES_GRUPO[grupo]?.texto}
                onClick={() => setGrupoFiltro(grupoFiltro === grupo ? null : grupo)}
              />
            )
          ))}
        </div>
      </div>

      {/* — Contenido de la lista — */}
      <div style={{ padding: '0 16px' }}>
        {cargando ? (
          <p style={{ color: 'var(--color-texto-secundario)', textAlign: 'center', marginTop: '40px' }}>Cargando…</p>
        ) : ejerciciosFiltrados.length === 0 ? (
          <EstadoVacio busqueda={busqueda} hayEjercicios={ejercicios.length > 0} onNuevo={onNuevo} />
        ) : (
          ejerciciosFiltrados.map(ej => (
            <TarjetaEjercicio key={ej.id} ejercicio={ej} onClick={() => onSeleccionar(ej)} />
          ))
        )}
      </div>
    </div>
  )
}

// — Componentes internos —

function ChipGrupo({ etiqueta, activo, color, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        flexShrink: 0,
        padding: '6px 14px',
        borderRadius: '20px',
        border: `1px solid ${activo ? (color || 'var(--color-acento)') : 'var(--color-borde)'}`,
        backgroundColor: activo ? (color ? color + '22' : 'rgba(0,191,255,0.13)') : 'transparent',
        color: activo ? (color || 'var(--color-acento)') : 'var(--color-texto-secundario)',
        fontSize: '13px',
        fontWeight: activo ? '600' : '400',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {etiqueta}
    </button>
  )
}

function TarjetaEjercicio({ ejercicio, onClick }) {
  const grupos  = ejercicio.gruposMuscular || []
  const primero = COLORES_GRUPO[ejercicio.grupoPrincipal || grupos[0]] || COLORES_GRUPO.core
  const resto   = grupos.slice(1).map(g => COLORES_GRUPO[g]).filter(Boolean)

  return (
    <button
      onClick={onClick}
      className="app-tarjeta"
      style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '100%', marginBottom: '10px', cursor: 'pointer', textAlign: 'left' }}
    >
      <div style={{
        width: '42px', height: '42px', borderRadius: '50%',
        backgroundColor: primero.bg, border: `1px solid ${primero.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <IconoEjercicio grupos={ejercicio.gruposMuscular} grupoPrincipal={ejercicio.grupoPrincipal} size={20} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: '0 0 4px', fontWeight: '600', color: 'var(--color-texto)', fontSize: '15px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {ejercicio.nombre}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: primero.texto, fontWeight: '500' }}>
            {capitalizarGrupo(grupos[0])}
          </span>
          {resto.map((c, i) => (
            <span key={i} style={{ fontSize: '11px', color: 'var(--color-texto-secundario)' }}>
              · <span style={{ color: c.texto }}>{capitalizarGrupo(grupos[i + 1])}</span>
            </span>
          ))}
          {ejercicio.series > 0 && (
            <span style={{ fontSize: '11px', color: 'var(--color-texto-inactivo)', marginLeft: '4px' }}>
              · {ejercicio.series}×{ejercicio.repeticiones || '—'}
            </span>
          )}
        </div>
      </div>

      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-borde)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  )
}

function EstadoVacio({ busqueda, hayEjercicios, onNuevo }) {
  if (busqueda || hayEjercicios) {
    // Búsqueda sin resultados
    return (
      <div style={{ textAlign: 'center', marginTop: '60px', color: 'var(--color-texto-secundario)' }}>
        <p style={{ fontSize: '40px', margin: '0 0 12px' }}>🔍</p>
        <p style={{ margin: '0 0 4px', fontWeight: '600', color: 'var(--color-texto-secundario)' }}>Sin resultados</p>
        <p style={{ margin: 0, fontSize: '14px' }}>Prueba con otro término o filtro</p>
      </div>
    )
  }

  // Catálogo vacío: primer uso
  return (
    <div style={{ textAlign: 'center', marginTop: '60px' }}>
      <p style={{ fontSize: '48px', margin: '0 0 16px' }}>🏋️</p>
      <p style={{ margin: '0 0 6px', fontWeight: '600', color: 'var(--color-texto)', fontSize: '17px' }}>
        Tu catálogo está vacío
      </p>
      <p style={{ margin: '0 0 24px', color: 'var(--color-texto-secundario)', fontSize: '14px' }}>
        Añade tu primer ejercicio para empezar
      </p>
      <button onClick={onNuevo} className="app-btn-acento">
        Añadir ejercicio
      </button>
    </div>
  )
}
