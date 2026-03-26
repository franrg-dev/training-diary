import { useState, useEffect, useMemo } from 'react'
import { hoyISO, formatearFechaLarga, habitoAparece, toISO } from './habitosUtils'
import { TIPOS_HABITO } from './tiposHabito'
import IconoTipo from './IconoTipo'
import ModalCalendario from './ModalCalendario'

/**
 * Vista "Hoy": lista de hábitos del día con checkboxes.
 * Incluye navegación entre días y filtros por tipo/etiqueta.
 *
 * Props:
 *   habitos, etiquetas: datos de los hooks del módulo
 *   fecha: YYYY-MM-DD del día visualizado (gestionado en PaginaHabitos)
 *   onCambiarFecha(ISO): callback para cambiar el día
 *   tituloDropdown: ReactNode (SelectorSeccion)
 *   toggleCompletado(habitoId, fecha): callback
 *   estaCompletado(habitoId): boolean
 */
export default function HabitosDia({
  habitos,
  etiquetas,
  fecha,
  onCambiarFecha,
  tituloDropdown,
  toggleCompletado,
  estaCompletado,
}) {
  const [modalCalendario, setModalCalendario] = useState(false)
  const [filtroTipo,      setFiltroTipo]      = useState(null)
  const [filtroEtiqueta,  setFiltroEtiqueta]  = useState(null)

  const hoy   = hoyISO()
  const esHoy = fecha === hoy

  // Resetear filtros al cambiar de fecha
  useEffect(() => {
    setFiltroTipo(null)
    setFiltroEtiqueta(null)
  }, [fecha])

  function irDia(delta) {
    const [anio, mes, dia] = fecha.split('-').map(Number)
    const d = new Date(anio, mes - 1, dia)
    d.setDate(d.getDate() + delta)
    onCambiarFecha(toISO(d))
  }

  // Mes/año del día actual (para abrir el calendario en el mes correcto)
  const { mesModal, anioModal } = useMemo(() => {
    const [anio, mes] = fecha.split('-').map(Number)
    return { mesModal: mes - 1, anioModal: anio }
  }, [fecha])

  // Hábitos que aparecen en esta fecha
  const habitosDelDia = useMemo(
    () => habitos.filter(h => habitoAparece(h, fecha)),
    [habitos, fecha]
  )

  // Tipos únicos presentes
  const tiposPresentes = useMemo(() => {
    const set = new Set(habitosDelDia.map(h => h.tipo))
    return TIPOS_HABITO.filter(t => set.has(t.id))
  }, [habitosDelDia])

  // Etiquetas con hábitos asignados para este día
  const etiquetasPresentes = useMemo(() => {
    const ids = new Set(habitosDelDia.flatMap(h => h.etiquetas || []))
    return etiquetas.filter(e => ids.has(e.id))
  }, [habitosDelDia, etiquetas])

  // Aplicar filtros
  const habitosFiltrados = useMemo(() => {
    return habitosDelDia.filter(h => {
      if (filtroTipo     && h.tipo !== filtroTipo)                         return false
      if (filtroEtiqueta && !(h.etiquetas || []).includes(filtroEtiqueta)) return false
      return true
    })
  }, [habitosDelDia, filtroTipo, filtroEtiqueta])

  const mapaEtiquetas = useMemo(() => {
    const m = {}
    for (const e of etiquetas) m[e.id] = e
    return m
  }, [etiquetas])

  const completados = habitosDelDia.filter(h => estaCompletado(h.id)).length
  const total       = habitosDelDia.length

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      {/* Cabecera */}
      <div style={{ padding: '20px 16px 0' }}>
        {/* Fila 1: selector + Hoy + icono calendario */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <div style={{ flex: 1 }}>
            {tituloDropdown}
          </div>
          {!esHoy && (
            <button
              onClick={() => onCambiarFecha(hoy)}
              style={{
                padding: '5px 12px', borderRadius: '20px',
                backgroundColor: 'transparent',
                border: '1px solid var(--color-borde)',
                color: 'var(--color-texto-secundario)',
                fontSize: '13px', fontWeight: '500', cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Hoy
            </button>
          )}
          <button
            onClick={() => setModalCalendario(true)}
            style={{
              width: '34px', height: '34px', borderRadius: '10px',
              backgroundColor: 'var(--color-superficie)',
              border: '1px solid var(--color-borde)',
              color: 'var(--color-texto-secundario)',
              cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              padding: 0, flexShrink: 0,
            }}
            aria-label="Abrir calendario"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="16" y1="2" x2="16" y2="6" />
            </svg>
          </button>
        </div>

        {/* Fila 2: < fecha > */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '14px' }}>
          <button onClick={() => irDia(-1)} style={estiloNavDia} aria-label="Día anterior">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span style={{ flex: 1, textAlign: 'center', fontSize: '13px', fontWeight: '500', color: esHoy ? '#f97316' : 'var(--color-texto)' }}>
            {formatearFechaLarga(fecha)}
          </span>
          <button onClick={() => irDia(1)} style={estiloNavDia} aria-label="Día siguiente">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Progreso del día (si hay hábitos) */}
        {total > 0 && (
          <div style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', color: 'var(--color-texto-secundario)' }}>
                {completados} de {total} completados
              </span>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#f97316' }}>
                {Math.round((completados / total) * 100)}%
              </span>
            </div>
            <div style={{ height: '4px', backgroundColor: 'var(--color-borde)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${(completados / total) * 100}%`,
                backgroundColor: completados === total ? '#22c55e' : '#f97316',
                borderRadius: '2px',
                transition: 'width 0.3s ease',
              }} />
            </div>
          </div>
        )}

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
        {habitosFiltrados.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '60px', color: 'var(--color-texto-secundario)' }}>
            <p style={{ fontSize: '40px', margin: '0 0 12px' }}>
              {total === 0 ? '📋' : '🔍'}
            </p>
            <p style={{ margin: 0, fontSize: '15px' }}>
              {total === 0 ? 'No hay hábitos para este día' : 'Sin resultados para el filtro activo'}
            </p>
          </div>
        ) : (
          habitosFiltrados.map(habito => (
            <TarjetaHabitoDia
              key={habito.id}
              habito={habito}
              completado={estaCompletado(habito.id)}
              onToggle={() => toggleCompletado(habito.id, fecha)}
              mapaEtiquetas={mapaEtiquetas}
            />
          ))
        )}
      </div>

      {/* Modal calendario */}
      {modalCalendario && (
        <ModalCalendario
          fechaSeleccionada={fecha}
          mesInicial={mesModal}
          anioInicial={anioModal}
          onSeleccionarDia={(iso) => {
            onCambiarFecha(iso)
            setModalCalendario(false)
          }}
          onCerrar={() => setModalCalendario(false)}
          titulo="Navegar a fecha"
        />
      )}
    </div>
  )
}

function TarjetaHabitoDia({ habito, completado, onToggle, mapaEtiquetas }) {
  const tipo = TIPOS_HABITO.find(t => t.id === habito.tipo) ?? TIPOS_HABITO[TIPOS_HABITO.length - 1]
  const etiquetasHabito = (habito.etiquetas || [])
    .map(id => mapaEtiquetas[id])
    .filter(Boolean)

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: '14px',
        padding: '14px', marginBottom: '8px',
        backgroundColor: 'var(--color-superficie)',
        border: `1px solid ${completado ? tipo.color + '44' : 'var(--color-borde)'}`,
        borderRadius: '12px',
        opacity: completado ? 0.7 : 1,
        transition: 'opacity 0.2s, border-color 0.2s',
      }}
    >
      {/* Checkbox */}
      <button
        onClick={onToggle}
        style={{
          width: '26px', height: '26px', borderRadius: '8px',
          backgroundColor: completado ? '#22c55e' : 'transparent',
          border: `2px solid ${completado ? '#22c55e' : 'var(--color-borde)'}`,
          cursor: 'pointer', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 0, transition: 'background-color 0.2s, border-color 0.2s',
        }}
        aria-label={completado ? 'Marcar como pendiente' : 'Marcar como completado'}
      >
        {completado && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </button>

      {/* Icono tipo */}
      <div style={{
        width: '38px', height: '38px', borderRadius: '10px',
        backgroundColor: tipo.color + '22',
        border: `1px solid ${tipo.color}44`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <IconoTipo tipo={habito.tipo} size={18} />
      </div>

      {/* Texto */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: '0 0 3px', fontWeight: '600', fontSize: '15px',
          color: 'var(--color-texto)',
          textDecoration: completado ? 'line-through' : 'none',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {habito.titulo}
        </p>
        {etiquetasHabito.length > 0 && (
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {etiquetasHabito.map(e => (
              <span key={e.id} style={{
                fontSize: '11px', padding: '1px 7px', borderRadius: '20px',
                border: `1px solid ${e.color}`,
                backgroundColor: e.color + '22',
                color: e.color, fontWeight: '500',
              }}>
                {e.nombre}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
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

const estiloNavDia = {
  background: 'none', border: 'none',
  color: 'var(--color-texto-secundario)',
  cursor: 'pointer', padding: '6px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexShrink: 0,
}
