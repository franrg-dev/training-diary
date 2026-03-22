import { useState } from 'react'
import { COLORES_GRUPO, capitalizarGrupo } from '../ejercicios/coloresGrupo'
import { IconoEjercicio } from '../ejercicios/iconosEjercicio'

const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function formatearDiaMes(fechaStr) {
  const [, mes, dia] = fechaStr.split('-').map(Number)
  return `${dia}/${mes}`
}

function formatearFecha(fechaStr) {
  const [anio, mes, dia] = fechaStr.split('-').map(Number)
  return `${dia} ${MESES_CORTOS[mes - 1]} ${anio}`
}

function GraficoLinea({ registros, color }) {
  const puntos = registros.slice(-10)
  if (puntos.length < 2) return null

  const pesos  = puntos.map(r => r.peso)
  const minP   = Math.min(...pesos)
  const maxP   = Math.max(...pesos)
  const rango  = maxP - minP || 1

  const W = 1000, H = 150, padX = 30, padTop = 30, padBot = 28
  const areaW = W - padX * 2
  const areaH = H - padTop - padBot

  const coords = puntos.map((r, i) => ({
    x: padX + (i / (puntos.length - 1)) * areaW,
    y: padTop + (1 - (r.peso - minP) / rango) * areaH,
    r,
  }))

  const polyline = coords.map(c => `${c.x},${c.y}`).join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block', overflow: 'visible' }}>
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity="0.8"
      />
      {coords.map((c, i) => {
        const esUltimo = i === coords.length - 1
        return (
          <g key={i}>
            <circle cx={c.x} cy={c.y} r={esUltimo ? 5 : 3.5} fill={color} />
            <text
              x={c.x} y={c.y - 10}
              textAnchor="middle"
              fontSize="24"
              fill={esUltimo ? color : 'var(--color-texto-secundario)'}
              fontWeight={esUltimo ? '700' : '400'}
            >
              {c.r.peso}
            </text>
            <text
              x={c.x} y={H - 4}
              textAnchor="middle"
              fontSize="22"
              fill={esUltimo ? color : 'var(--color-texto-inactivo)'}
            >
              {formatearDiaMes(c.r.fecha)}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/**
 * Historial de un ejercicio.
 * - Fuerza: gráfico de línea con el color del grupo muscular.
 * - Cardio: últimos valores registrados (duracion/ritmo/volumen), sin gráfico.
 */
export default function HistorialEjercicio({ ejercicio, registros, onVolver, onEliminarRegistro }) {
  const esCardio = (ejercicio.gruposMuscular || []).includes('cardio')

  const [confirmarBorrarId, setConfirmarBorrarId] = useState(null)

  const colores = COLORES_GRUPO[ejercicio.grupoPrincipal || (ejercicio.gruposMuscular || [])[0]] || COLORES_GRUPO.core

  async function handleEliminar(id) {
    await onEliminarRegistro(id)
    setConfirmarBorrarId(null)
  }

  // Últimas 3 entradas para cardio
  const ultimosCardio = registros.slice().reverse().slice(0, 3)

  return (
    <div style={{ padding: '0 16px 16px' }}>

      {/* — Cabecera — */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px 0 20px' }}>
        <button
          onClick={onVolver}
          style={{ background: 'none', border: 'none', color: '#f97316', fontSize: '15px', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Registro
        </button>
      </div>

      {/* — Hero del ejercicio — */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
        <div style={{ width: '50px', height: '50px', borderRadius: '12px', backgroundColor: colores.bg, border: `1px solid ${colores.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <IconoEjercicio grupos={ejercicio.gruposMuscular} grupoPrincipal={ejercicio.grupoPrincipal} size={26} />
        </div>
        <div>
          <h1 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: '700', color: 'var(--color-texto)' }}>
            {ejercicio.nombre}
          </h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {(ejercicio.gruposMuscular || []).map(grupo => {
              const c = COLORES_GRUPO[grupo] || COLORES_GRUPO.core
              return (
                <span key={grupo} style={{ padding: '3px 10px', borderRadius: '20px', backgroundColor: c.bg, border: `1px solid ${c.border}`, color: c.texto, fontSize: '12px', fontWeight: '600' }}>
                  {capitalizarGrupo(grupo)}
                </span>
              )
            })}
          </div>
        </div>
      </div>

      {/* — Gráfico de línea (solo fuerza, mínimo 2 puntos) — */}
      {!esCardio && registros.length >= 2 && (
        <div className="app-card" style={{ marginBottom: '16px' }}>
          <p style={estiloSeccion}>Evolución de peso</p>
          <GraficoLinea registros={registros} color={colores.texto} />
        </div>
      )}

      {/* — Últimos registros cardio — */}
      {esCardio && ultimosCardio.length > 0 && (
        <div className="app-card" style={{ marginBottom: '16px' }}>
          <p style={estiloSeccion}>Últimos registros</p>
          {ultimosCardio.map((r, i) => {
            const ritmoLabel   = r.modo === 'veces' ? 'Rp/m' : 'Km/h'
            const volumenLabel = r.modo === 'veces' ? 'Rp'   : 'Km'
            return (
              <div
                key={r.id}
                style={{ paddingBottom: i < ultimosCardio.length - 1 ? '10px' : 0, marginBottom: i < ultimosCardio.length - 1 ? '10px' : 0, borderBottom: i < ultimosCardio.length - 1 ? '1px solid var(--color-borde)' : 'none' }}
              >
                <p style={{ margin: '0 0 4px', fontSize: '12px', color: 'var(--color-texto-secundario)' }}>{formatearFecha(r.fecha)}</p>
                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                  {r.duracion && <span><span style={{ fontSize: '16px', fontWeight: '700', color: '#f97316' }}>{r.duracion}</span><span style={{ fontSize: '11px', color: 'var(--color-texto-secundario)', marginLeft: '3px' }}>min</span></span>}
                  {r.ritmo    && <span><span style={{ fontSize: '16px', fontWeight: '700', color: '#f97316' }}>{r.ritmo}</span><span style={{ fontSize: '11px', color: 'var(--color-texto-secundario)', marginLeft: '3px' }}>{ritmoLabel}</span></span>}
                  {r.volumen  && <span><span style={{ fontSize: '16px', fontWeight: '700', color: '#f97316' }}>{r.volumen}</span><span style={{ fontSize: '11px', color: 'var(--color-texto-secundario)', marginLeft: '3px' }}>{volumenLabel}</span></span>}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* — Estado vacío — */}
      {registros.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: '8px', marginBottom: '20px' }}>
          <p style={{ margin: '0 0 4px', fontWeight: '600', color: 'var(--color-texto-secundario)' }}>Sin datos de progreso</p>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-texto-secundario)' }}>Los registros se añaden desde el diario</p>
        </div>
      )}

      {/* — Historial completo — */}
      {registros.length > 0 && (
        <div className="app-card">
          <p style={estiloSeccion}>Historial ({registros.length} entrada{registros.length !== 1 ? 's' : ''})</p>
          {registros.slice().reverse().map((r, i) => (
            <div
              key={r.id}
              style={{ borderBottom: i < registros.length - 1 ? '1px solid var(--color-borde)' : 'none', paddingBottom: i < registros.length - 1 ? '12px' : 0, marginBottom: i < registros.length - 1 ? '12px' : 0 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 3px', fontSize: '13px', color: 'var(--color-texto-secundario)' }}>
                    {formatearFecha(r.fecha)}
                  </p>
                  {esCardio ? (
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {r.duracion && <span><span style={{ fontSize: '18px', fontWeight: '700', color: '#f97316' }}>{r.duracion}</span><span style={{ fontSize: '11px', color: 'var(--color-texto-secundario)', marginLeft: '2px' }}>min</span></span>}
                      {r.ritmo    && <span><span style={{ fontSize: '18px', fontWeight: '700', color: '#f97316' }}>{r.ritmo}</span><span style={{ fontSize: '11px', color: 'var(--color-texto-secundario)', marginLeft: '2px' }}>{r.modo === 'veces' ? 'Rp/m' : 'Km/h'}</span></span>}
                      {r.volumen  && <span><span style={{ fontSize: '18px', fontWeight: '700', color: '#f97316' }}>{r.volumen}</span><span style={{ fontSize: '11px', color: 'var(--color-texto-secundario)', marginLeft: '2px' }}>{r.modo === 'veces' ? 'Rp' : 'Km'}</span></span>}
                    </div>
                  ) : (
                    <div>
                      <span style={{ fontSize: '20px', fontWeight: '700', color: '#f97316' }}>{r.peso}</span>
                      <span style={{ fontSize: '13px', color: 'var(--color-texto-secundario)', marginLeft: '3px' }}>{r.unidad}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setConfirmarBorrarId(confirmarBorrarId === r.id ? null : r.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--color-texto-inactivo)', cursor: 'pointer', padding: '4px', fontSize: '16px', lineHeight: 1 }}
                >×</button>
              </div>
              {r.notas && (
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--color-texto-secundario)', fontStyle: 'italic' }}>{r.notas}</p>
              )}
              {confirmarBorrarId === r.id && (
                <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                  <button onClick={() => setConfirmarBorrarId(null)} style={{ flex: 1, padding: '8px', backgroundColor: 'transparent', border: '1px solid var(--color-borde)', borderRadius: '8px', color: 'var(--color-texto-secundario)', fontSize: '13px', cursor: 'pointer' }}>Cancelar</button>
                  <button onClick={() => handleEliminar(r.id)} style={{ flex: 1, padding: '8px', backgroundColor: '#dc2626', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Eliminar</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const estiloSeccion      = { margin: '0 0 12px', fontSize: '12px', color: 'var(--color-texto-secundario)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.06em' }
const estiloInputPequeno = { width: '100%', padding: '8px 10px', backgroundColor: 'var(--color-superficie-2)', border: '1px solid var(--color-borde)', borderRadius: '8px', color: 'var(--color-texto)', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }
const estiloLabelPequeno = { display: 'block', marginBottom: '4px', fontSize: '11px', color: 'var(--color-texto-secundario)', textTransform: 'uppercase', letterSpacing: '0.05em' }
