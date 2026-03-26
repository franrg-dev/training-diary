import { useState } from 'react'

const PALETA = [
  '#f97316', '#ef4444', '#eab308', '#22c55e',
  '#06b6d4', '#3b82f6', '#a855f7', '#ec4899',
]

/**
 * Formulario para crear o editar una etiqueta de hábito.
 */
export default function FormularioEtiqueta({ etiqueta = null, onGuardar, onCancelar }) {
  const [nombre, setNombre] = useState(etiqueta?.nombre || '')
  const [color, setColor]   = useState(etiqueta?.color || PALETA[0])

  function handleSubmit(e) {
    e.preventDefault()
    if (!nombre.trim()) return
    onGuardar({ nombre: nombre.trim(), color })
  }

  return (
    <div style={{ padding: '20px 16px' }}>
      {/* Cabecera */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
        <button onClick={onCancelar} style={estiloBotonVolver} aria-label="Cancelar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: 'var(--color-texto)' }}>
          {etiqueta ? 'Editar etiqueta' : 'Nueva etiqueta'}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Nombre */}
        <label style={estiloLabel}>Nombre</label>
        <input
          type="text"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          placeholder="Nombre de la etiqueta"
          maxLength={30}
          style={estiloInput}
          autoFocus
        />

        {/* Color */}
        <label style={{ ...estiloLabel, marginTop: '20px' }}>Color</label>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '32px' }}>
          {PALETA.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              style={{
                width: '36px', height: '36px', borderRadius: '50%',
                backgroundColor: c,
                border: color === c ? '3px solid var(--color-texto)' : '2px solid transparent',
                cursor: 'pointer',
                boxShadow: color === c ? `0 0 0 2px ${c}55` : 'none',
                transition: 'border 0.15s',
              }}
              aria-label={c}
            />
          ))}
        </div>

        {/* Preview */}
        <div style={{ marginBottom: '28px' }}>
          <span style={{
            display: 'inline-block',
            padding: '6px 14px',
            borderRadius: '20px',
            border: `1px solid ${color}`,
            backgroundColor: color + '22',
            color,
            fontSize: '13px',
            fontWeight: '600',
          }}>
            {nombre || 'Previsualización'}
          </span>
        </div>

        <button
          type="submit"
          disabled={!nombre.trim()}
          style={{
            width: '100%', padding: '14px', borderRadius: '14px',
            backgroundColor: nombre.trim() ? '#f97316' : 'var(--color-superficie)',
            border: nombre.trim() ? 'none' : '1px solid var(--color-borde)',
            color: nombre.trim() ? '#fff' : 'var(--color-texto-secundario)',
            fontSize: '16px', fontWeight: '600', cursor: nombre.trim() ? 'pointer' : 'default',
          }}
        >
          {etiqueta ? 'Guardar cambios' : 'Crear etiqueta'}
        </button>
      </form>
    </div>
  )
}

const estiloLabel = {
  display: 'block',
  fontSize: '13px',
  fontWeight: '600',
  color: 'var(--color-texto-secundario)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '8px',
}

const estiloInput = {
  width: '100%',
  padding: '12px 14px',
  backgroundColor: 'var(--color-superficie)',
  border: '1px solid var(--color-borde)',
  borderRadius: '12px',
  color: 'var(--color-texto)',
  fontSize: '16px',
  outline: 'none',
  boxSizing: 'border-box',
}

const estiloBotonVolver = {
  background: 'none', border: 'none', color: '#f97316',
  cursor: 'pointer', padding: '4px', display: 'flex',
  alignItems: 'center', justifyContent: 'center',
  flexShrink: 0,
}
