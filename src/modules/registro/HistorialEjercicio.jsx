import { useState } from 'react'
import { COLORES_GRUPO, capitalizarGrupo } from '../ejercicios/coloresGrupo'

const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function formatearDiaMes(fechaStr) {
  const [, mes, dia] = fechaStr.split('-').map(Number)
  return `${dia}/${mes}`
}

function formatearFecha(fechaStr) {
  const [anio, mes, dia] = fechaStr.split('-').map(Number)
  return `${dia} ${MESES_CORTOS[mes - 1]} ${anio}`
}

/**
 * Historial de pesos de un ejercicio con gráfico de barras CSS.
 * Permite añadir nuevas entradas y eliminar las existentes.
 */
export default function HistorialEjercicio({ ejercicio, registros, onVolver, onEliminarRegistro, onCrearRegistro }) {
  const [confirmarBorrarId, setConfirmarBorrarId]   = useState(null)
  const [mostrandoFormAnadir, setMostrandoFormAnadir] = useState(false)
  const [nuevoRegistro, setNuevoRegistro]           = useState({
    fecha:  new Date().toISOString().slice(0, 10),
    peso:   '',
    unidad: 'kg',
    notas:  '',
  })
  const [guardando, setGuardando] = useState(false)

  const colores = COLORES_GRUPO[ejercicio.grupoPrincipal || (ejercicio.gruposMuscular || [])[0]] || COLORES_GRUPO.core

  // Últimas 10 entradas para el gráfico (registros ya vienen ASC por fecha)
  const entradasGrafico = registros.slice(-10)
  const maxPeso = Math.max(...entradasGrafico.map(r => r.peso), 1)

  async function handleEliminar(id) {
    await onEliminarRegistro(id)
    setConfirmarBorrarId(null)
  }

  async function handleGuardarNuevo() {
    if (!nuevoRegistro.peso) return
    setGuardando(true)
    try {
      await onCrearRegistro({
        ejercicioId: ejercicio.id,
        fecha:       nuevoRegistro.fecha,
        peso:        Number(nuevoRegistro.peso),
        unidad:      nuevoRegistro.unidad,
        notas:       nuevoRegistro.notas,
      })
      setMostrandoFormAnadir(false)
      setNuevoRegistro({ fecha: new Date().toISOString().slice(0, 10), peso: '', unidad: 'kg', notas: '' })
    } finally {
      setGuardando(false)
    }
  }

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
        <div style={{ width: '50px', height: '50px', borderRadius: '12px', backgroundColor: colores.bg, border: `1px solid ${colores.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
          {colores.emoji}
        </div>
        <div>
          <h1 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: '700', color: '#f5f5f5' }}>
            {ejercicio.nombre}
          </h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {(ejercicio.gruposMuscular || []).map(grupo => {
              const c = COLORES_GRUPO[grupo] || COLORES_GRUPO.core
              return (
                <span key={grupo} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '20px', backgroundColor: c.bg, border: `1px solid ${c.border}`, color: c.texto, fontSize: '12px', fontWeight: '600' }}>
                  {c.emoji} {capitalizarGrupo(grupo)}
                </span>
              )
            })}
          </div>
        </div>
      </div>

      {/* — Gráfico de barras CSS (últimas 10 entradas) — */}
      {entradasGrafico.length > 0 && (
        <div className="app-card" style={{ marginBottom: '16px' }}>
          <p style={estiloSeccion}>Evolución de peso</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '80px' }}>
            {entradasGrafico.map((r, i) => {
              const esUltima = i === entradasGrafico.length - 1
              const altPct   = Math.max((r.peso / maxPeso) * 100, 4)
              return (
                <div key={r.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', height: '100%', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '9px', color: esUltima ? '#f97316' : '#6b7280', fontWeight: esUltima ? '700' : '400', whiteSpace: 'nowrap' }}>
                    {r.peso}
                  </span>
                  <div style={{ width: '100%', height: `${altPct}%`, backgroundColor: esUltima ? '#f97316' : '#2e2e2e', borderRadius: '3px 3px 0 0' }} />
                </div>
              )
            })}
          </div>
          {/* Fechas abreviadas bajo las barras */}
          <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
            {entradasGrafico.map((r, i) => (
              <div key={r.id} style={{ flex: 1, textAlign: 'center', fontSize: '9px', color: i === entradasGrafico.length - 1 ? '#f97316' : '#4b5563', overflow: 'hidden' }}>
                {formatearDiaMes(r.fecha)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* — Estado vacío — */}
      {registros.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: '8px', marginBottom: '20px' }}>
          <p style={{ fontSize: '40px', margin: '0 0 12px' }}>📊</p>
          <p style={{ margin: '0 0 4px', fontWeight: '600', color: '#a1a1a1' }}>Sin datos de progreso</p>
          <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Añade tu primer registro de peso</p>
        </div>
      )}

      {/* — Botón añadir entrada — */}
      <button
        type="button"
        onClick={() => setMostrandoFormAnadir(o => !o)}
        style={{
          width: '100%', padding: '12px', marginBottom: '16px',
          backgroundColor: mostrandoFormAnadir ? '#1a1a1a' : '#f97316',
          border: mostrandoFormAnadir ? '1px solid #2e2e2e' : 'none',
          borderRadius: '12px',
          color: mostrandoFormAnadir ? '#a1a1a1' : '#fff',
          fontSize: '15px', fontWeight: '600', cursor: 'pointer',
        }}
      >
        {mostrandoFormAnadir ? 'Cancelar' : '+ Añadir entrada'}
      </button>

      {/* — Formulario inline de nueva entrada — */}
      {mostrandoFormAnadir && (
        <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={estiloLabelPequeno}>Fecha</label>
              <input
                type="date"
                value={nuevoRegistro.fecha}
                onChange={e => setNuevoRegistro(prev => ({ ...prev, fecha: e.target.value }))}
                style={estiloInputPequeno}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={estiloLabelPequeno}>Peso</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="80"
                  value={nuevoRegistro.peso}
                  onChange={e => setNuevoRegistro(prev => ({ ...prev, peso: e.target.value }))}
                  style={{ ...estiloInputPequeno, flex: 1, textAlign: 'center' }}
                />
                <button
                  type="button"
                  onClick={() => setNuevoRegistro(prev => ({ ...prev, unidad: prev.unidad === 'kg' ? 'lb' : 'kg' }))}
                  style={{ padding: '8px 10px', backgroundColor: '#242424', border: '1px solid #2e2e2e', borderRadius: '6px', color: '#a1a1a1', fontSize: '12px', fontWeight: '600', cursor: 'pointer', flexShrink: 0 }}
                >
                  {nuevoRegistro.unidad}
                </button>
              </div>
            </div>
          </div>
          <textarea
            placeholder="Notas (opcional)"
            value={nuevoRegistro.notas}
            onChange={e => setNuevoRegistro(prev => ({ ...prev, notas: e.target.value }))}
            rows={2}
            style={{ ...estiloInputPequeno, resize: 'none', marginBottom: '10px', lineHeight: '1.5' }}
          />
          <button
            onClick={handleGuardarNuevo}
            disabled={!nuevoRegistro.peso || guardando}
            style={{
              width: '100%', padding: '10px',
              backgroundColor: (!nuevoRegistro.peso || guardando) ? '#2e2e2e' : '#f97316',
              border: 'none', borderRadius: '8px',
              color: (!nuevoRegistro.peso || guardando) ? '#6b7280' : '#fff',
              fontSize: '14px', fontWeight: '600',
              cursor: (!nuevoRegistro.peso || guardando) ? 'default' : 'pointer',
            }}
          >
            {guardando ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      )}

      {/* — Lista de entradas — */}
      {registros.length > 0 && (
        <div className="app-card">
          <p style={estiloSeccion}>Historial ({registros.length} entrada{registros.length !== 1 ? 's' : ''})</p>
          {registros.slice().reverse().map((r, i) => (
            <div
              key={r.id}
              style={{
                borderBottom: i < registros.length - 1 ? '1px solid #2e2e2e' : 'none',
                paddingBottom: i < registros.length - 1 ? '12px' : 0,
                marginBottom:  i < registros.length - 1 ? '12px' : 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 3px', fontSize: '13px', color: '#6b7280' }}>
                    {formatearFecha(r.fecha)}
                  </p>
                  <div>
                    <span style={{ fontSize: '20px', fontWeight: '700', color: '#f97316' }}>{r.peso}</span>
                    <span style={{ fontSize: '13px', color: '#6b7280', marginLeft: '3px' }}>{r.unidad}</span>
                  </div>
                </div>
                <button
                  onClick={() => setConfirmarBorrarId(confirmarBorrarId === r.id ? null : r.id)}
                  style={{ background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer', padding: '4px', fontSize: '16px', lineHeight: 1 }}
                >×</button>
              </div>
              {r.notas && (
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b7280', fontStyle: 'italic' }}>
                  {r.notas}
                </p>
              )}
              {/* Confirmación de borrado inline */}
              {confirmarBorrarId === r.id && (
                <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setConfirmarBorrarId(null)}
                    style={{ flex: 1, padding: '8px', backgroundColor: 'transparent', border: '1px solid #2e2e2e', borderRadius: '8px', color: '#a1a1a1', fontSize: '13px', cursor: 'pointer' }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleEliminar(r.id)}
                    style={{ flex: 1, padding: '8px', backgroundColor: '#dc2626', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const estiloSeccion      = { margin: '0 0 12px', fontSize: '12px', color: '#6b7280', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.06em' }
const estiloInputPequeno = { width: '100%', padding: '8px 10px', backgroundColor: '#242424', border: '1px solid #2e2e2e', borderRadius: '8px', color: '#f5f5f5', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }
const estiloLabelPequeno = { display: 'block', marginBottom: '4px', fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }
