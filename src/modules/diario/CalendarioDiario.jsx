import { useMemo, useState } from 'react'

const DIAS_SEMANA  = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const NOMBRES_MES  = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const DIAS_CORTOS  = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

/**
 * Calendario mensual interactivo del módulo Diario.
 * Muestra puntos naranjas en los días con entrada registrada.
 * La lista inferior solo muestra días con entrenamiento.
 */
export default function CalendarioDiario({
  entradasDelMes,
  todasEntradas,
  mesVisualizado,
  anioVisualizado,
  onCambiarMes,
  onSeleccionarDia,
  onSeleccionarEntrenamiento,
  sesiones,
}) {
  const hoy = new Date()
  const esHoyMes = anioVisualizado === hoy.getFullYear() && mesVisualizado === hoy.getMonth()
  const [historialAbierto, setHistorialAbierto] = useState(false)

  // Mapa de sesiones para buscar nombre por id
  const mapaSesiones = useMemo(() => {
    const m = {}
    for (const s of (sesiones || [])) m[s.id] = s
    return m
  }, [sesiones])

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

  // Fecha de hoy en YYYY-MM-DD
  const hoyStr = useMemo(() => {
    return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`
  }, [])

  // Todas las entradas con entrenamiento divididas en próximas e historial
  const { proximas, historial } = useMemo(() => {
    const conEntrenamiento = (todasEntradas || []).filter(e =>
      e.sesionId ||
      (e.ejerciciosDia || []).length > 0 ||
      (e.ejerciciosCardio || []).length > 0
    )
    const prox = conEntrenamiento
      .filter(e => e.fecha >= hoyStr)
      .sort((a, b) => a.fecha.localeCompare(b.fecha))
    const hist = conEntrenamiento
      .filter(e => e.fecha < hoyStr)
      .sort((a, b) => b.fecha.localeCompare(a.fecha))
    return { proximas: prox, historial: hist }
  }, [todasEntradas, hoyStr])

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

      {/* — Próximas sesiones (hoy + futuras) — */}
      <div style={{ padding: '20px 16px 0' }}>
        <p style={estiloSeccion}>
          {proximas.length > 0
            ? `${proximas.length} próximo${proximas.length !== 1 ? 's' : ''}`
            : 'Sin entrenamientos próximos'}
        </p>

        {proximas.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: '20px', marginBottom: '8px' }}>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
              Toca un día del calendario para registrar un entrenamiento
            </p>
          </div>
        )}

        {proximas.map(entrada => (
          <TarjetaEntrada
            key={entrada.id}
            entrada={entrada}
            hoyStr={hoyStr}
            mapaSesiones={mapaSesiones}
            onSeleccionar={onSeleccionarEntrenamiento}
          />
        ))}
      </div>

      {/* — Historial (pasadas, desplegable) — */}
      {historial.length > 0 && (
        <div style={{ padding: '16px 16px 0' }}>
          <button
            type="button"
            onClick={() => setHistorialAbierto(o => !o)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              width: '100%', padding: '10px 0', background: 'none', border: 'none',
              cursor: 'pointer', textAlign: 'left',
            }}
          >
            <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em', flex: 1 }}>
              Historial · {historial.length} sesión{historial.length !== 1 ? 'es' : ''}
            </span>
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="#6b7280" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
              style={{ transition: 'transform 0.2s', transform: historialAbierto ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {historialAbierto && (
            <div style={{ marginTop: '4px' }}>
              {historial.map(entrada => (
                <TarjetaEntrada
                  key={entrada.id}
                  entrada={entrada}
                  hoyStr={hoyStr}
                  mapaSesiones={mapaSesiones}
                  onSeleccionar={onSeleccionarEntrenamiento}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function TarjetaEntrada({ entrada, hoyStr, mapaSesiones, onSeleccionar }) {
  const sesion    = entrada.sesionId ? mapaSesiones[entrada.sesionId] : null
  const numFuerza = (entrada.ejerciciosDia    || []).length
  const numCardio = (entrada.ejerciciosCardio || []).length
  const esHoy     = entrada.fecha === hoyStr

  return (
    <button
      onClick={() => onSeleccionar(entrada.fecha)}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        width: '100%', padding: '12px 14px', marginBottom: '8px',
        backgroundColor: '#1a1a1a',
        border: `1px solid ${esHoy ? '#f9731666' : '#2e2e2e'}`,
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
          {esHoy ? 'Hoy' : formatearFechaEntrada(entrada.fecha)}
        </p>
        <p style={{ margin: 0, color: '#6b7280', fontSize: '13px' }}>
          {sesion ? <span style={{ color: '#f97316' }}>{sesion.nombre}</span> : null}
          {sesion && (numFuerza > 0 || numCardio > 0) ? ' · ' : null}
          {numFuerza > 0 ? `${numFuerza} fuerza` : null}
          {numFuerza > 0 && numCardio > 0 ? ' · ' : null}
          {numCardio > 0 ? `${numCardio} cardio` : null}
          {!sesion && numFuerza === 0 && numCardio === 0 ? 'Entrenamiento' : null}
        </p>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
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

const estiloSeccion = {
  margin: '0 0 12px', fontSize: '13px', color: '#6b7280',
  fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em',
}
