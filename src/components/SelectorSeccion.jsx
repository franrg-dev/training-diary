import { useState } from 'react'

/**
 * Selector de subsección estilo iOS.
 * Muestra el nombre de la sección activa como título-botón;
 * al pulsarlo despliega un menú con la misma estética que la navbar inferior
 * (pill oscura, borde, sombra, dividers entre opciones, checkmark en la activa).
 *
 * Props:
 *   opciones  — [{ id: string, label: string }]
 *   activa    — id de la opción actualmente seleccionada
 *   onChange  — (id: string) => void
 */
export default function SelectorSeccion({ opciones, activa, onChange }) {
  const [abierto, setAbierto] = useState(false)
  const actual = opciones.find(o => o.id === activa) ?? opciones[0]

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>

      {/* — Título-botón — */}
      <button
        onClick={() => setAbierto(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          background: 'none', border: 'none', padding: 0,
          cursor: 'pointer', color: '#f5f5f5',
          fontSize: '28px', fontWeight: '700', lineHeight: 1,
        }}
      >
        {actual.label}
        <svg
          width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
          style={{
            marginTop: '3px',
            transform: abierto ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            color: '#f97316',
          }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* — Menú desplegable estilo iOS / navbar — */}
      {abierto && (
        <>
          {/* Backdrop invisible para cerrar al tocar fuera */}
          <div
            onClick={() => setAbierto(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 40 }}
          />

          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 10px)',
              left: 0,
              zIndex: 50,
              minWidth: '180px',
              backgroundColor: '#1a1a1a',
              border: '1px solid #2e2e2e',
              borderRadius: '20px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
              overflow: 'hidden',
              animation: 'fadeScaleIn 0.15s ease',
            }}
          >
            {opciones.map((op, i) => (
              <button
                key={op.id}
                onClick={() => { onChange(op.id); setAbierto(false) }}
                style={{
                  width: '100%',
                  padding: '15px 18px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: '12px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderTop: i > 0 ? '1px solid #2e2e2e' : 'none',
                  textAlign: 'left',
                  color: op.id === activa ? '#f97316' : '#f5f5f5',
                  fontSize: '16px',
                  fontWeight: op.id === activa ? '600' : '400',
                  cursor: 'pointer',
                  letterSpacing: '0.01em',
                }}
              >
                {op.label}
                {op.id === activa && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="#f97316" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round"
                    style={{ flexShrink: 0 }}
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
