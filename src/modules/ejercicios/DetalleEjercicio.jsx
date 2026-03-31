import { useState } from 'react'
import { COLORES_GRUPO, capitalizarGrupo } from './coloresGrupo'
import { IconoEjercicio } from './iconosEjercicio'

export default function DetalleEjercicio({ ejercicio, sustitutos, onEditar, onEliminar, onVolver }) {
  const [confirmarBorrar, setConfirmarBorrar] = useState(false)
  const [eliminando, setEliminando]           = useState(false)

  const grupos  = ejercicio.gruposMuscular || []
  const colores = COLORES_GRUPO[ejercicio.grupoPrincipal || grupos[0]] || COLORES_GRUPO.core

  async function handleEliminar() {
    setEliminando(true)
    await onEliminar()
  }

  return (
    <div style={{ padding: '0 16px 16px' }}>

      {/* — Cabecera con botón volver — */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 0 20px' }}>
        <button
          onClick={onVolver}
          style={{ background: 'none', border: 'none', color: 'var(--color-acento)', fontSize: '15px', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Ejercicios
        </button>
      </div>

      {/* — Hero — */}
      <div className="app-tarjeta" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '50%',
          backgroundColor: colores.bg, border: `1px solid ${colores.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <IconoEjercicio grupos={grupos} grupoPrincipal={ejercicio.grupoPrincipal} size={26} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: '700', color: 'var(--color-texto)' }}>
            {ejercicio.nombre}
          </h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {grupos.map(grupo => {
              const c = COLORES_GRUPO[grupo] || COLORES_GRUPO.core
              return (
                <span key={grupo} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  padding: '3px 10px', borderRadius: '20px',
                  backgroundColor: c.bg, border: `1px solid ${c.border}`,
                  color: c.texto, fontSize: '12px', fontWeight: '600',
                }}>
                  {c.emoji} {capitalizarGrupo(grupo)}
                </span>
              )
            })}
          </div>
        </div>
      </div>

      {/* — Modo cardio — */}
      {grupos.includes('cardio') && (
        <div className="app-tarjeta" style={{ marginBottom: '12px' }}>
          <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: '700', color: 'var(--color-texto-secundario)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Unidad de medida
          </p>
          <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: 'var(--color-acento)' }}>
            {ejercicio.modo === 'veces' ? 'Rp/m · Rp' : 'Km/h · Km'}
          </p>
        </div>
      )}

      {/* — Volumen — */}
      {(ejercicio.series > 0 || ejercicio.repeticiones) && (
        <div className="app-tarjeta" style={{ marginBottom: '12px' }}>
          <p style={{ margin: '0 0 12px', fontSize: '11px', fontWeight: '700', color: 'var(--color-texto-secundario)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Volumen de trabajo
          </p>
          <div style={{ display: 'flex', gap: '24px', justifyContent: 'center' }}>
            {ejercicio.series > 0 && (
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: '0 0 2px', fontSize: '28px', fontWeight: '800', color: 'var(--color-acento)', letterSpacing: '-1px', lineHeight: 1 }}>
                  {ejercicio.series}
                </p>
                <p style={{ margin: 0, fontSize: '11px', fontWeight: '600', color: 'var(--color-texto-terciario)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Series</p>
              </div>
            )}
            {ejercicio.repeticiones && (
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: '0 0 2px', fontSize: '28px', fontWeight: '800', color: 'var(--color-acento)', letterSpacing: '-1px', lineHeight: 1 }}>
                  {ejercicio.repeticiones}
                </p>
                <p style={{ margin: 0, fontSize: '11px', fontWeight: '600', color: 'var(--color-texto-terciario)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Repeticiones</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* — Ejecución — */}
      {ejercicio.ejecucion && (
        <div className="app-tarjeta" style={{ marginBottom: '12px' }}>
          <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: '700', color: 'var(--color-texto-secundario)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Ejecución
          </p>
          <p style={{ margin: 0, color: 'var(--color-texto)', fontSize: '15px', lineHeight: '1.65', whiteSpace: 'pre-wrap' }}>
            {ejercicio.ejecucion}
          </p>
        </div>
      )}

      {/* — Sustitutos — */}
      {sustitutos.length > 0 && (
        <div className="app-tarjeta" style={{ marginBottom: '12px', padding: '18px 18px 8px' }}>
          <p style={{ margin: '0 0 12px', fontSize: '11px', fontWeight: '700', color: 'var(--color-texto-secundario)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Ejercicios sustitutos
          </p>
          {sustitutos.map((sust, i) => {
            const gruposSust = sust.gruposMuscular || []
            const cPrimero   = COLORES_GRUPO[gruposSust[0]] || COLORES_GRUPO.core
            return (
              <div key={sust.id} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 0',
                borderBottom: i < sustitutos.length - 1 ? '1px solid var(--color-borde)' : 'none',
              }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  backgroundColor: cPrimero.bg, border: `1px solid ${cPrimero.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <IconoEjercicio grupos={gruposSust} grupoPrincipal={sust.grupoPrincipal} size={16} />
                </div>
                <span style={{ fontSize: '14px', color: 'var(--color-texto)', flex: 1, fontWeight: '500' }}>{sust.nombre}</span>
                <span style={{ fontSize: '11px', color: 'var(--color-texto-terciario)' }}>
                  {gruposSust.map(capitalizarGrupo).join(', ')}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* — Acciones — */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
        <button onClick={onEditar} className="app-btn-secundario" style={{ flex: 1 }}>Editar</button>
        <button onClick={() => setConfirmarBorrar(true)} className="app-btn-peligro" style={{ flex: 1 }}>Eliminar</button>
      </div>

      {/* — Confirmación de borrado — */}
      {confirmarBorrar && (
        <div className="app-tarjeta" style={{ marginTop: '12px', border: '1px solid rgba(220,38,38,0.25)' }}>
          <p style={{ margin: '0 0 8px', color: 'var(--color-texto)', fontSize: '15px', fontWeight: '600' }}>
            ¿Eliminar <strong>{ejercicio.nombre}</strong>?
          </p>
          <p style={{ margin: '0 0 16px', color: 'var(--color-texto-secundario)', fontSize: '13px', lineHeight: '1.5' }}>
            Se eliminará del catálogo y de la lista de sustitutos de otros ejercicios. Esta acción no se puede deshacer.
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setConfirmarBorrar(false)} disabled={eliminando} className="app-btn-secundario" style={{ flex: 1 }}>
              Cancelar
            </button>
            <button onClick={handleEliminar} disabled={eliminando} className="app-btn-peligro" style={{ flex: 1, opacity: eliminando ? 0.6 : 1 }}>
              {eliminando ? 'Eliminando…' : 'Eliminar'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
