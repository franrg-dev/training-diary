const MESES_CORTOS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

function formatearMesAnio(fechaStr) {
  const [anio, mes] = fechaStr.split('-').map(Number)
  return `${MESES_CORTOS[mes - 1]} ${anio}`
}

function formatearMesCorto(fechaStr) {
  const [anio, mes] = fechaStr.split('-').map(Number)
  return `${mes}/${String(anio).slice(2)}`
}

function GraficoLinea({ registros }) {
  const puntos = registros.slice(-10)
  if (puntos.length < 2) return null

  const valores = puntos.map(r => r.valor)
  const minV    = Math.min(...valores)
  const maxV    = Math.max(...valores)
  const rango   = maxV - minV || 1

  const W = 1000, H = 150, padX = 30, padTop = 30, padBot = 28
  const areaW = W - padX * 2
  const areaH = H - padTop - padBot

  const coords = puntos.map((r, i) => ({
    x: padX + (i / (puntos.length - 1)) * areaW,
    y: padTop + (1 - (r.valor - minV) / rango) * areaH,
    r,
  }))

  const polyline = coords.map(c => `${c.x},${c.y}`).join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block', overflow: 'visible' }}>
      <polyline
        points={polyline}
        fill="none"
        stroke="#f97316"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity="0.8"
      />
      {coords.map((c, i) => {
        const esUltimo = i === coords.length - 1
        return (
          <g key={i}>
            <circle cx={c.x} cy={c.y} r={esUltimo ? 5 : 3.5} fill="#f97316" />
            <text
              x={c.x} y={c.y - 10}
              textAnchor="middle"
              fontSize="24"
              fill={esUltimo ? 'var(--color-acento)' : 'var(--color-texto-secundario)'}
              fontWeight={esUltimo ? '700' : '400'}
            >
              {c.r.valor}
            </text>
            <text
              x={c.x} y={H - 4}
              textAnchor="middle"
              fontSize="22"
              fill={esUltimo ? 'var(--color-acento)' : 'var(--color-texto-inactivo)'}
            >
              {formatearMesCorto(c.r.fecha)}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/**
 * Historial de una medida corporal específica (e.g. Bíceps).
 * registros: array de { fecha: 'YYYY-MM-01', valor: number } ordenado ASC
 */
export default function HistorialMedida({ campoLabel, registros, onVolver }) {
  return (
    <div style={{ padding: '0 16px 16px' }}>

      {/* Cabecera */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px 0 20px' }}>
        <button
          onClick={onVolver}
          style={{ background: 'none', border: 'none', color: 'var(--color-acento)', fontSize: '15px', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Medidas
        </button>
      </div>

      {/* Hero */}
      <h1 style={{ margin: '0 0 24px', fontSize: '22px', fontWeight: '800', color: 'var(--color-texto)' }}>
        {campoLabel}
      </h1>

      {/* Gráfico */}
      {registros.length >= 2 && (
        <div className="app-card" style={{ marginBottom: '16px' }}>
          <p style={estiloSeccion}>Evolución</p>
          <GraficoLinea registros={registros} />
        </div>
      )}

      {/* Sin datos */}
      {registros.length === 0 && (
        <p style={{ textAlign: 'center', color: 'var(--color-texto-secundario)', marginTop: '40px' }}>
          Sin registros todavía
        </p>
      )}

      {/* Historial completo */}
      {registros.length > 0 && (
        <div className="app-card">
          <p style={estiloSeccion}>
            Historial ({registros.length} {registros.length === 1 ? 'entrada' : 'entradas'})
          </p>
          {registros.slice().reverse().map((r, i) => (
            <div
              key={r.fecha}
              style={{
                borderBottom: i < registros.length - 1 ? '1px solid var(--color-borde)' : 'none',
                paddingBottom: i < registros.length - 1 ? '12px' : 0,
                marginBottom: i < registros.length - 1 ? '12px' : 0,
              }}
            >
              <p style={{ margin: '0 0 3px', fontSize: '13px', color: 'var(--color-texto-secundario)' }}>
                {formatearMesAnio(r.fecha)}
              </p>
              <div>
                <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-acento)' }}>{r.valor}</span>
                <span style={{ fontSize: '13px', color: 'var(--color-texto-secundario)', marginLeft: '4px' }}>cm</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const estiloSeccion = { margin: '0 0 12px', fontSize: '12px', color: 'var(--color-texto-secundario)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.06em' }
