import { useMemo, useState } from 'react'
import { getObjetivos } from '../ajustes/useObjetivos'

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
  tituloDropdown,
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
  const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`

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
      {/* — Título página — */}
      <div style={{ padding: '20px 16px 12px' }}>
        {tituloDropdown}
      </div>

      {/* — Card del calendario — */}
      <div style={{
        margin: '0 16px',
        backgroundColor: 'var(--color-superficie)',
        border: '1px solid var(--color-borde)',
        borderRadius: '24px',
        boxShadow: 'var(--sombra-1)',
        overflow: 'hidden',
      }}>
        {/* Navegación de mes dentro de la card */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 12px 10px',
          borderBottom: '1px solid var(--color-borde)',
        }}>
          <button onClick={() => onCambiarMes(-1)} className="app-btn-nav" style={{ width: '34px', height: '34px' }} aria-label="Mes anterior">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--color-texto)' }}>
            {NOMBRES_MES[mesVisualizado]} {anioVisualizado}
          </span>
          <button onClick={() => onCambiarMes(1)} className="app-btn-nav" style={{ width: '34px', height: '34px' }} aria-label="Mes siguiente">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Grid del calendario */}
        <div style={{ padding: '8px 8px 10px' }}>
          {/* Cabecera días de la semana */}
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
              const fechaStr     = getFechaStr(dia)
              const esHoy        = esHoyMes && dia === hoy.getDate()
              const tieneEntrada = fechasConEntrada.has(fechaStr)
              return (
                <button
                  key={idx}
                  onClick={() => onSeleccionarDia(fechaStr)}
                  style={{
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: '3px',
                    padding: '6px 2px', minHeight: '42px',
                    borderRadius: '10px', border: 'none',
                    backgroundColor: esHoy ? 'var(--color-acento)' : 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{
                    fontSize: '15px',
                    fontWeight: esHoy ? '700' : '400',
                    color: esHoy ? '#fff' : 'var(--color-texto)',
                    lineHeight: 1,
                  }}>
                    {dia}
                  </span>
                  <div style={{
                    width: '5px', height: '5px', borderRadius: '50%',
                    backgroundColor: tieneEntrada && !esHoy ? 'var(--color-acento)' : 'transparent',
                  }} />
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* — Tarjetas resumen del mes — */}
      <TarjetasResumenMes entradasDelMes={entradasDelMes} />

      {/* — Próximas sesiones (hoy + futuras) — */}
      <div style={{ padding: '20px 16px 0' }}>
        <p style={estiloSeccion}>
          {proximas.length > 0
            ? `${proximas.length} próximo${proximas.length !== 1 ? 's' : ''}`
            : 'Sin entrenamientos próximos'}
        </p>

        {proximas.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: '20px', marginBottom: '8px' }}>
            <p style={{ margin: 0, color: 'var(--color-texto-secundario)', fontSize: '14px' }}>
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
            <span style={{ fontSize: '13px', color: 'var(--color-texto-secundario)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em', flex: 1 }}>
              Historial · {historial.length} sesión{historial.length !== 1 ? 'es' : ''}
            </span>
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="var(--color-texto-secundario)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
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

// ─── Pill de icono (igual que en DetalleEntrenamiento) ────────────────────

function IconoPill({ children, pillBg }) {
  return (
    <div style={{
      width: '40px', height: '40px', borderRadius: '50%',
      backgroundColor: pillBg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      {children}
    </div>
  )
}

// ─── Tarjetas resumen del mes ─────────────────────────────────────────────

function TarjetasResumenMes({ entradasDelMes }) {
  const objetivos = useMemo(() => getObjetivos(), [])

  const stats = useMemo(() => {
    const entradas = entradasDelMes || []

    const conSueno = entradas.filter(e => e.suenoMinutos > 0)
    const promedioSuenoMin = conSueno.length > 0
      ? Math.round(conSueno.reduce((s, e) => s + Number(e.suenoMinutos), 0) / conSueno.length)
      : 0

    const conPasos = entradas.filter(e => e.pasos > 0)
    const promedioPasos = conPasos.length > 0
      ? Math.round(conPasos.reduce((s, e) => s + Number(e.pasos), 0) / conPasos.length)
      : 0

    const conPeso = entradas.filter(e => e.peso > 0).sort((a, b) => a.fecha.localeCompare(b.fecha))
    const primerPeso = conPeso.length > 0 ? Number(conPeso[0].peso) : null
    const ultimoPeso = conPeso.length > 1 ? Number(conPeso[conPeso.length - 1].peso) : null
    const difPeso    = primerPeso !== null && ultimoPeso !== null ? ultimoPeso - primerPeso : null

    return { promedioSuenoMin, promedioPasos, primerPeso, ultimoPeso, difPeso }
  }, [entradasDelMes])

  const h   = Math.floor(stats.promedioSuenoMin / 60)
  const min = stats.promedioSuenoMin % 60

  function colorDifPeso(dif) {
    if (dif === null) return 'var(--color-texto-inactivo)'
    const tipo = objetivos.pesoObjetivoTipo
    if (tipo === 'deficit') return dif < 0 ? 'var(--color-exito)' : '#ef4444'
    if (tipo === 'volumen') return dif > 0 ? 'var(--color-exito)' : '#ef4444'
    const abs = Math.abs(dif)
    if (abs <= 1) return 'var(--color-exito)'
    if (abs <= 2) return '#eab308'
    return '#ef4444'
  }

  return (
    <div style={{ padding: '12px 16px 0' }}>

      {/* Fila 1: Sueño | Pasos */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>

        {/* Sueño */}
        <div className="app-tarjeta">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <IconoPill pillBg="rgba(20, 80, 100, 0.18)">
              <svg width="22" height="22" viewBox="0 -960 960 960" fill="#2A7A8C">
                <path d="M600-640 480-760l120-120 120 120-120 120Zm200 120-80-80 80-80 80 80-80 80ZM483-80q-84 0-157.5-32t-128-86.5Q143-253 111-326.5T79-484q0-146 93-257.5T409-880q-18 99 11 193.5T520-521q71 71 165.5 100T879-410q-26 144-138 237T483-80Zm0-80q88 0 163-44t118-121q-86-8-163-43.5T463-465q-61-61-97-138t-43-163q-77 43-120.5 118.5T159-484q0 135 94.5 229.5T483-160Zm-20-305Z"/>
              </svg>
            </IconoPill>
            <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: 'var(--color-texto-secundario)' }}>Sueño</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: '2px', paddingRight: '4px' }}>
            <span style={{ fontSize: '30px', fontWeight: '800', letterSpacing: '-1px', color: 'var(--color-acento)', lineHeight: 1 }}>{h}</span>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-texto-secundario)', marginRight: '4px' }}>h</span>
            <span style={{ fontSize: '30px', fontWeight: '800', letterSpacing: '-1px', color: 'var(--color-acento)', lineHeight: 1 }}>{String(min).padStart(2, '0')}</span>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-texto-secundario)' }}>m</span>
          </div>
        </div>

        {/* Pasos */}
        <div className="app-tarjeta">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <IconoPill pillBg="rgba(150, 90, 10, 0.15)">
              <svg width="22" height="22" viewBox="0 -960 960 960" fill="#C4872A">
                <path d="M216-580q39 0 74 14t64 41l382 365h24q17 0 28.5-11.5T800-200q0-8-1.5-17T788-235L605-418l-71-214-74 18q-38 10-69-14t-31-63v-84l-28-14-154 206q-1 1-1 1.5t-1 1.5h40Zm0 80h-46q3 7 7.5 13t10.5 11l324 295q11 11 25 16t29 5h54L299-467q-17-17-38.5-25t-44.5-8ZM566-80q-30 0-57-11t-50-31L134-417q-46-42-51.5-103T114-631l154-206q17-23 45.5-30.5T368-861l28 14q21 11 32.5 30t11.5 42v84l74-19q30-8 58 7.5t38 44.5l65 196 170 170q20 20 27.5 43t7.5 49q0 50-35 85t-85 35H566Z"/>
              </svg>
            </IconoPill>
            <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: 'var(--color-texto-secundario)' }}>Pasos</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: '2px', paddingRight: '4px' }}>
            <span style={{ fontSize: '26px', fontWeight: '800', letterSpacing: '-1px', lineHeight: 1, color: 'var(--color-acento)' }}>
              {stats.promedioPasos.toLocaleString('es')}
            </span>
          </div>
        </div>
      </div>

      {/* Fila 2: Peso (Primero | Dif | Último) */}
      <div className="app-tarjeta" style={{ marginBottom: '0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <IconoPill pillBg="rgba(130, 55, 80, 0.15)">
            <svg width="22" height="22" viewBox="0 -960 960 960" fill="#A0506A">
              <path d="M80-120v-80h360v-447q-26-9-45-28t-28-45H240l120 280q0 50-41 85t-99 35q-58 0-99-35t-41-85l120-280h-80v-80h247q12-35 43-57.5t70-22.5q39 0 70 22.5t43 57.5h247v80h-80l120 280q0 50-41 85t-99 35q-58 0-99-35t-41-85l120-280H593q-9 26-28 45t-45 28v447h360v80H80Zm585-320h150l-75-174-75 174Zm-520 0h150l-75-174-75 174Zm335-280q17 0 28.5-11.5T520-760q0-17-11.5-28.5T480-800q-17 0-28.5 11.5T440-760q0 17 11.5 28.5T480-720Z"/>
            </svg>
          </IconoPill>
          <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: 'var(--color-texto-secundario)' }}>Peso</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          {[
            { label: 'Primero', valor: stats.primerPeso, color: 'var(--color-acento-2)' },
            { label: 'Dif',     valor: stats.difPeso,    color: colorDifPeso(stats.difPeso), prefix: stats.difPeso > 0 ? '+' : '' },
            { label: 'Último',  valor: stats.ultimoPeso, color: 'var(--color-acento-2)' },
          ].map(({ label, valor, color, prefix = '' }) => (
            <div key={label} style={{
              backgroundColor: 'var(--color-superficie-2)',
              border: '1px solid var(--color-borde)',
              borderRadius: '14px',
              padding: '10px 8px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
            }}>
              <p style={{ margin: 0, fontSize: '10px', fontWeight: '600', color: 'var(--color-texto-terciario)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
              <p style={{ margin: 0, fontSize: '17px', fontWeight: '800', letterSpacing: '-0.5px', lineHeight: 1, color: valor !== null ? color : 'var(--color-texto-inactivo)' }}>
                {valor !== null ? `${prefix}${valor.toFixed(2)}` : '—'}
                {valor !== null && <span style={{ fontSize: '10px', fontWeight: '500', color: 'var(--color-texto-terciario)', marginLeft: '2px' }}>kg</span>}
              </p>
            </div>
          ))}
        </div>
      </div>
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
        backgroundColor: 'var(--color-superficie)',
        border: `1px solid ${esHoy ? 'rgba(0,191,255,0.40)' : 'var(--color-borde)'}`,
        borderRadius: '16px', cursor: 'pointer', textAlign: 'left',
        boxShadow: 'var(--sombra-1)',
      }}
    >
      <div style={{
        width: '36px', height: '36px', borderRadius: '10px',
        backgroundColor: 'rgba(0,191,255,0.13)', border: '1px solid rgba(0,191,255,0.26)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, fontWeight: '700', fontSize: '15px', color: 'var(--color-acento)',
      }}>
        {parseInt(entrada.fecha.split('-')[2], 10)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: '0 0 2px', fontWeight: '600', color: 'var(--color-texto)', fontSize: '14px' }}>
          {esHoy ? 'Hoy' : formatearFechaEntrada(entrada.fecha)}
        </p>
        <p style={{ margin: 0, color: 'var(--color-texto-secundario)', fontSize: '13px' }}>
          {sesion ? <span style={{ color: 'var(--color-acento)' }}>{sesion.nombre}</span> : null}
          {sesion && (numFuerza > 0 || numCardio > 0) ? ' · ' : null}
          {numFuerza > 0 ? `${numFuerza} fuerza` : null}
          {numFuerza > 0 && numCardio > 0 ? ' · ' : null}
          {numCardio > 0 ? `${numCardio} cardio` : null}
          {!sesion && numFuerza === 0 && numCardio === 0 ? 'Entrenamiento' : null}
        </p>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-borde)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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


const estiloSeccion = {
  margin: '0 0 12px', fontSize: '13px', color: 'var(--color-texto-secundario)',
  fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em',
}
