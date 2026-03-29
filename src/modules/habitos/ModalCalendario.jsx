import { useMemo, useState } from 'react'

const DIAS_SEMANA  = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const NOMBRES_MES  = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

/**
 * Bottom-sheet modal con un calendario mensual interactivo.
 *
 * Props:
 *   fechaSeleccionada — YYYY-MM-DD actualmente seleccionada (se resalta)
 *   mesInicial, anioInicial — mes/año con el que abre el calendario
 *   onSeleccionarDia(fechaISO) — callback al seleccionar un día
 *   onCerrar — callback para cerrar el modal
 *   esDiaHabilitado(fechaISO) — función opcional; false = deshabilitar día (default: todos habilitados)
 *   titulo — título opcional en la cabecera del sheet
 */
export default function ModalCalendario({
  fechaSeleccionada,
  mesInicial,
  anioInicial,
  onSeleccionarDia,
  onCerrar,
  esDiaHabilitado,
  titulo,
}) {
  const [mes, setMes]   = useState(mesInicial ?? new Date().getMonth())
  const [anio, setAnio] = useState(anioInicial ?? new Date().getFullYear())

  const hoy = new Date()
  const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`

  const celdas = useMemo(() => {
    const primerDia = new Date(anio, mes, 1).getDay()
    const offset    = primerDia === 0 ? 6 : primerDia - 1
    const diasEnMes = new Date(anio, mes + 1, 0).getDate()
    return [...Array(offset).fill(null), ...Array.from({ length: diasEnMes }, (_, i) => i + 1)]
  }, [anio, mes])

  function cambiarMes(delta) {
    const d = new Date(anio, mes + delta, 1)
    setMes(d.getMonth())
    setAnio(d.getFullYear())
  }

  function getFechaStr(dia) {
    return `${anio}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onCerrar}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          backgroundColor: 'rgba(0,0,0,0.65)',
        }}
      />

      {/* Sheet */}
      <div
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          zIndex: 201,
          backgroundColor: 'var(--color-superficie)',
          borderRadius: '24px 24px 0 0',
          border: '1px solid var(--color-borde)',
          borderBottom: 'none',
          paddingBottom: 'env(safe-area-inset-bottom, 16px)',
          maxHeight: '85vh',
          overflowY: 'auto',
        }}
      >
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: '40px', height: '4px', borderRadius: '2px', backgroundColor: 'var(--color-borde)' }} />
        </div>

        {titulo && (
          <p style={{ margin: '4px 16px 8px', fontSize: '13px', fontWeight: '600', color: 'var(--color-texto-secundario)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {titulo}
          </p>
        )}

        {/* Cabecera mes */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '4px 12px 8px',
        }}>
          <button onClick={() => cambiarMes(-1)} style={estiloNavMes} aria-label="Mes anterior">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--color-texto)' }}>
            {NOMBRES_MES[mes]} {anio}
          </span>
          <button onClick={() => cambiarMes(1)} style={estiloNavMes} aria-label="Mes siguiente">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Grid */}
        <div style={{ padding: '0 8px 16px' }}>
          {/* Cabecera días */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '4px' }}>
            {DIAS_SEMANA.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: '11px', color: 'var(--color-texto-secundario)', fontWeight: '600', padding: '4px 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Celdas */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
            {celdas.map((dia, idx) => {
              if (!dia) return <div key={idx} style={{ minHeight: '42px' }} />
              const fechaStr   = getFechaStr(dia)
              const esHoy      = fechaStr === hoyStr
              const esSeleccion = fechaStr === fechaSeleccionada
              const habilitado = esDiaHabilitado ? esDiaHabilitado(fechaStr) : true

              return (
                <button
                  key={idx}
                  onClick={() => habilitado && onSeleccionarDia(fechaStr)}
                  disabled={!habilitado}
                  style={{
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: '3px',
                    padding: '6px 2px', minHeight: '42px',
                    borderRadius: '10px', border: 'none',
                    backgroundColor: esSeleccion ? 'var(--color-acento)' : esHoy ? 'rgba(0,191,255,0.13)' : 'transparent',
                    cursor: habilitado ? 'pointer' : 'default',
                    opacity: habilitado ? 1 : 0.25,
                  }}
                >
                  <span style={{
                    fontSize: '15px',
                    fontWeight: esSeleccion || esHoy ? '700' : '400',
                    color: esSeleccion ? '#fff' : esHoy ? 'var(--color-acento)' : 'var(--color-texto)',
                    lineHeight: 1,
                  }}>
                    {dia}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}

const estiloNavMes = {
  background: 'none', border: 'none', color: 'var(--color-acento)',
  cursor: 'pointer', padding: '6px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}
