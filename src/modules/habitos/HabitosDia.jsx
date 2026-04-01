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
 *   subhabitosCompletadosDeHabito(habitoId): string[]
 *   onToggleSubhabito(habitoId, subhabitoId, fecha, habito): callback
 *   puedeMarcarsePrincipal(habito, subCompletados): boolean
 */
export default function HabitosDia({
  habitos,
  etiquetas,
  fecha,
  onCambiarFecha,
  tituloDropdown,
  toggleCompletado,
  estaCompletado,
  subhabitosCompletadosDeHabito,
  onToggleSubhabito,
  puedeMarcarsePrincipal,
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
        {/* Fila 1: selector */}
        <div style={{ marginBottom: '12px' }}>
          {tituloDropdown}
        </div>

        {/* Fila 2: < fecha | Calendario Editar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <button onClick={() => irDia(-1)} className="app-btn-nav" aria-label="Día anterior">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span style={{ flex: 1, textAlign: 'center', fontSize: '14px', fontWeight: '600', color: esHoy ? 'var(--color-acento)' : 'var(--color-texto)' }}>
            {formatearFechaLarga(fecha)}
          </span>
          <button
            onClick={() => setModalCalendario(true)}
            className="app-btn-nav"
            aria-label="Abrir calendario"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="16" y1="2" x2="16" y2="6" />
            </svg>
          </button>
          <button onClick={() => irDia(1)} className="app-btn-nav" aria-label="Día siguiente">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Progreso del día */}
        {total > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--color-texto-secundario)' }}>
                {completados} de {total} completados
              </span>
              <span style={{ fontSize: '14px', fontWeight: '800', letterSpacing: '-0.5px', color: completados === total ? 'var(--color-exito)' : 'var(--color-acento)' }}>
                {Math.round((completados / total) * 100)}%
              </span>
            </div>
            <div className="app-progress-track">
              <div className="app-progress-fill" style={{
                width: `${(completados / total) * 100}%`,
                background: completados === total
                  ? 'linear-gradient(90deg, #30D158, #26B049)'
                  : 'var(--gradiente-acento)',
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
          <div className="app-empty-state">
            <p className="app-empty-icon">{total === 0 ? '📋' : '🔍'}</p>
            <p className="app-empty-title">
              {total === 0 ? 'No hay hábitos para este día' : 'Sin resultados'}
            </p>
            {total > 0 && <p className="app-empty-text">Prueba con otro filtro</p>}
          </div>
        ) : (
          habitosFiltrados.map(habito => {
            const subCompletados = subhabitosCompletadosDeHabito(habito.id)
            return (
              <TarjetaHabitoDia
                key={habito.id}
                habito={habito}
                completado={estaCompletado(habito.id)}
                puedeMarcarse={puedeMarcarsePrincipal(habito, subCompletados)}
                subCompletados={subCompletados}
                onToggle={() => toggleCompletado(habito.id, fecha)}
                onToggleSubhabito={(subId) => onToggleSubhabito(habito.id, subId, fecha, habito)}
                mapaEtiquetas={mapaEtiquetas}
              />
            )
          })
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

function TarjetaHabitoDia({ habito, completado, puedeMarcarse, subCompletados, onToggle, onToggleSubhabito, mapaEtiquetas }) {
  const [expandido, setExpandido] = useState(false)
  const tipo = TIPOS_HABITO.find(t => t.id === habito.tipo) ?? TIPOS_HABITO[TIPOS_HABITO.length - 1]
  const etiquetasHabito = (habito.etiquetas || []).map(id => mapaEtiquetas[id]).filter(Boolean)
  const subhabitos = habito.subhabitos || []
  const tieneSubhabitos = subhabitos.length > 0

  const obligatorios = subhabitos.filter(s => s.obligatorio)
  const minimo = habito.subhabitosMinimo || 0
  const bloqueado = !puedeMarcarse && !completado

  return (
    <div style={{ marginBottom: '8px' }}>
      {/* Fila principal */}
      <div
        className="app-tarjeta"
        style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          borderColor: completado ? tipo.color + '55' : undefined,
          borderRadius: tieneSubhabitos && expandido ? 'var(--radio-xl) var(--radio-xl) 0 0' : undefined,
          opacity: completado ? 0.75 : 1,
          transition: 'opacity 0.2s, border-color 0.2s',
        }}
      >
        {/* Checkbox principal */}
        <button
          onClick={puedeMarcarse || completado ? onToggle : undefined}
          style={{
            width: '26px', height: '26px', borderRadius: '8px',
            backgroundColor: completado ? 'var(--color-exito)' : 'transparent',
            border: `2px solid ${completado ? 'var(--color-exito)' : 'var(--color-borde)'}`,
            cursor: (puedeMarcarse || completado) ? 'pointer' : 'not-allowed',
            flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 0, transition: 'background-color 0.2s, border-color 0.2s',
            opacity: bloqueado ? 0.4 : 1,
          }}
          aria-label={completado ? 'Marcar como pendiente' : 'Marcar como completado'}
        >
          {completado && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
          {bloqueado && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-texto-secundario)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          )}
        </button>

        {/* Icono tipo */}
        <div style={{
          width: '38px', height: '38px', borderRadius: '50%',
          backgroundColor: tipo.color + '22',
          border: `1px solid ${tipo.color}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <IconoTipo tipo={habito.tipo} size={17} />
        </div>

        {/* Texto */}
        <div
          style={{ flex: 1, minWidth: 0, cursor: tieneSubhabitos ? 'pointer' : 'default' }}
          onClick={tieneSubhabitos ? () => setExpandido(v => !v) : undefined}
        >
          <p style={{
            margin: '0 0 3px', fontWeight: '600', fontSize: '15px',
            color: 'var(--color-texto)',
            textDecoration: completado ? 'line-through' : 'none',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {habito.titulo}
          </p>
          {tieneSubhabitos && (
            <p style={{ margin: 0, fontSize: '11px', color: 'var(--color-texto-secundario)' }}>
              {subCompletados.length}/{subhabitos.length} subhábitos
              {(obligatorios.length > 0 || minimo > 0) && !puedeMarcarse && (
                <span style={{ color: 'var(--color-acento)' }}>
                  {' · '}
                  {obligatorios.length > 0 && minimo > 0
                    ? `${minimo} requeridos + obligatorios`
                    : obligatorios.length > 0
                    ? `${obligatorios.length} obligatorio${obligatorios.length > 1 ? 's' : ''}`
                    : `mín. ${minimo}`}
                </span>
              )}
            </p>
          )}
          {etiquetasHabito.length > 0 && (
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '3px' }}>
              {etiquetasHabito.map(e => (
                <span key={e.id} style={{
                  fontSize: '11px', padding: '1px 7px', borderRadius: '20px',
                  border: `1px solid ${e.color}`, backgroundColor: e.color + '22',
                  color: e.color, fontWeight: '500',
                }}>
                  {e.nombre}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Chevron expandir */}
        {tieneSubhabitos && (
          <button
            onClick={() => setExpandido(v => !v)}
            style={{
              background: 'none', border: 'none', padding: '4px',
              color: 'var(--color-texto-secundario)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'transform 0.2s',
              transform: expandido ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
            aria-label={expandido ? 'Ocultar subhábitos' : 'Ver subhábitos'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        )}
      </div>

      {/* Subhábitos expandidos */}
      {tieneSubhabitos && expandido && (
        <div style={{
          backgroundColor: 'var(--color-superficie)',
          border: `1px solid ${completado ? tipo.color + '44' : 'var(--color-borde)'}`,
          borderTop: '1px solid var(--color-borde)',
          borderRadius: '0 0 var(--radio-xl) var(--radio-xl)',
          boxShadow: 'var(--sombra-1)',
          padding: '4px 0',
        }}>
          {subhabitos.map((s, idx) => {
            const marcado = subCompletados.includes(s.id)
            return (
              <div
                key={s.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 14px 10px 54px',
                  borderTop: idx > 0 ? '1px solid var(--color-borde)' : 'none',
                }}
              >
                {/* Checkbox subhábito */}
                <button
                  onClick={() => onToggleSubhabito(s.id)}
                  style={{
                    width: '20px', height: '20px', borderRadius: '6px', flexShrink: 0,
                    backgroundColor: marcado ? 'var(--color-exito)' : 'transparent',
                    border: `2px solid ${marcado ? 'var(--color-exito)' : 'var(--color-borde)'}`,
                    cursor: 'pointer', padding: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background-color 0.15s, border-color 0.15s',
                  }}
                  aria-label={marcado ? 'Desmarcar' : 'Marcar'}
                >
                  {marcado && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>

                <span style={{
                  flex: 1, fontSize: '14px',
                  color: marcado ? 'var(--color-texto-secundario)' : 'var(--color-texto)',
                  textDecoration: marcado ? 'line-through' : 'none',
                }}>
                  {s.texto}
                  {s.obligatorio && (
                    <span style={{ color: 'var(--color-acento-2)', fontWeight: '700', marginLeft: '2px' }}>*</span>
                  )}
                </span>
              </div>
            )
          })}
        </div>
      )}
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
