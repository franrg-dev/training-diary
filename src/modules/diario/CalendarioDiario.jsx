import { useMemo } from 'react'

const DIAS_SEMANA  = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const NOMBRES_MES  = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const DIAS_CORTOS  = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

/**
 * Calendario mensual interactivo del módulo Diario.
 * Muestra puntos naranjas en los días con entrada registrada.
 */
export default function CalendarioDiario({
  entradasDelMes,
  mesVisualizado,
  anioVisualizado,
  onCambiarMes,
  onSeleccionarDia,
}) {
  const hoy = new Date()
  const esHoyMes = anioVisualizado === hoy.getFullYear() && mesVisualizado === hoy.getMonth()

  // Celdas del calendario: null = celda vacía, número = día del mes
  const celdas = useMemo(() => {
    const primerDia  = new Date(anioVisualizado, mesVisualizado, 1).getDay()
    const offset     = primerDia === 0 ? 6 : primerDia - 1   // Semana empieza en lunes
    const diasEnMes  = new Date(anioVisualizado, mesVisualizado + 1, 0).getDate()
    return [...Array(offset).fill(null), ...Array.from({ length: diasEnMes }, (_, i) => i + 1)]
  }, [anioVisualizado, mesVisualizado])

  // Set de fechas con entrada para consultas O(1)
  const fechasConEntrada = useMemo(() => {
    const set = new Set()
    for (const e of entradasDelMes) set.add(e.fecha)
    return set
  }, [entradasDelMes])

  function getFechaStr(dia) {
    return `${anioVisualizado}-${String(mesVisualizado + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
  }

  return (
    <div>
      {/* — Cabecera con navegación de mes — */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 16px 16px' }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#f5f5f5' }}>Diario</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button onClick={() => onCambiarMes(-1)} style={estiloNavMes} aria-label="Mes anterior">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#f5f5f5', minWidth: '140px', textAlign: 'center' }}>
            {NOMBRES_MES[mesVisualizado]} {anioVisualizado}
          </span>
          <button onClick={() => onCambiarMes(1)} style={estiloNavMes} aria-label="Mes siguiente">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* — Grid del calendario — */}
      <div style={{ padding: '0 12px' }}>
        {/* Cabecera días de la semana */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '2px' }}>
          {DIAS_SEMANA.map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: '12px', color: '#6b7280', fontWeight: '600', padding: '4px 0' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Celdas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
          {celdas.map((dia, idx) => {
            if (!dia) return <div key={idx} style={{ minHeight: '44px' }} />
            const fechaStr    = getFechaStr(dia)
            const esHoy       = esHoyMes && dia === hoy.getDate()
            const tieneEntrada = fechasConEntrada.has(fechaStr)
            return (
              <button
                key={idx}
                onClick={() => onSeleccionarDia(fechaStr)}
                style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: '3px',
                  padding: '6px 2px', minHeight: '44px',
                  borderRadius: '10px', border: 'none',
                  backgroundColor: esHoy ? '#f97316' : 'transparent',
                  cursor: 'pointer',
                }}
              >
                <span style={{
                  fontSize: '15px',
                  fontWeight: esHoy ? '700' : '400',
                  color: esHoy ? '#fff' : '#f5f5f5',
                  lineHeight: 1,
                }}>
                  {dia}
                </span>
                {/* Punto indicador */}
                <div style={{
                  width: '5px', height: '5px', borderRadius: '50%',
                  backgroundColor: tieneEntrada && !esHoy ? '#f97316' : 'transparent',
                }} />
              </button>
            )
          })}
        </div>
      </div>

      {/* — Lista de entrenamientos del mes — */}
      <div style={{ padding: '20px 16px 0' }}>
        <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#6b7280', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {entradasDelMes.length > 0
            ? `${entradasDelMes.length} entrenamiento${entradasDelMes.length !== 1 ? 's' : ''} este mes`
            : 'Sin entrenamientos este mes'}
        </p>

        {entradasDelMes.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <p style={{ fontSize: '48px', margin: '0 0 16px' }}>📅</p>
            <p style={{ margin: '0 0 6px', fontWeight: '600', color: '#f5f5f5', fontSize: '17px' }}>
              Sin entrenamientos registrados
            </p>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
              Toca un día del calendario para añadir uno
            </p>
          </div>
        )}

        {entradasDelMes
          .slice()
          .sort((a, b) => b.fecha.localeCompare(a.fecha))
          .map(entrada => (
            <button
              key={entrada.id}
              onClick={() => onSeleccionarDia(entrada.fecha)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                width: '100%', padding: '12px 14px', marginBottom: '8px',
                backgroundColor: '#1a1a1a', border: '1px solid #2e2e2e',
                borderRadius: '12px', cursor: 'pointer', textAlign: 'left',
              }}
            >
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                backgroundColor: '#f9731622', border: '1px solid #f9731644',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, fontWeight: '700', fontSize: '15px', color: '#f97316',
              }}>
                {parseInt(entrada.fecha.split('-')[2], 10)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: '0 0 2px', fontWeight: '600', color: '#f5f5f5', fontSize: '14px' }}>
                  {formatearFechaEntrada(entrada.fecha)}
                </p>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '13px' }}>
                  {(entrada.ejerciciosDia || []).length} ejercicio{(entrada.ejerciciosDia || []).length !== 1 ? 's' : ''}
                </p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2e2e2e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          ))}
      </div>
    </div>
  )
}

function formatearFechaEntrada(fechaStr) {
  const [anio, mes, dia] = fechaStr.split('-').map(Number)
  const d = new Date(anio, mes - 1, dia)
  return `${DIAS_CORTOS[d.getDay()]}, ${dia} ${MESES_CORTOS[mes - 1]}`
}

const estiloNavMes = {
  background: 'none', border: 'none', color: '#f97316',
  cursor: 'pointer', padding: '6px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}
