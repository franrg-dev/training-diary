import { useState } from 'react'

/**
 * Selector de subsección — Liquid Glass iOS 26, paleta cian/lima.
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
          cursor: 'pointer', color: 'var(--color-texto)',
          fontSize: '28px', fontWeight: '700',
          lineHeight: 1.08, letterSpacing: '-0.5px',
          fontFamily: 'inherit',
        }}
      >
        {actual.label}
        <svg
          width="19" height="19" viewBox="0 0 24 24" fill="none"
          stroke="var(--color-acento)" strokeWidth="2.8"
          strokeLinecap="round" strokeLinejoin="round"
          style={{
            marginTop: '4px', flexShrink: 0,
            transform: abierto ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: `transform var(--t-spring) var(--ease-spring)`,
            filter: 'drop-shadow(0 0 4px rgba(0, 255, 255, 0.45))',
          }}
        >
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {/* — Menú Liquid Glass — */}
      {abierto && (
        <>
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
              minWidth: '200px',
              backgroundColor: 'var(--glass-bg)',
              backdropFilter: 'blur(40px) saturate(200%)',
              WebkitBackdropFilter: 'blur(40px) saturate(200%)',
              border: '1px solid var(--glass-borde)',
              borderRadius: '20px',
              boxShadow: 'var(--glass-sombra)',
              overflow: 'hidden',
              animation: 'fadeScaleIn 0.24s cubic-bezier(0.34, 1.56, 0.64, 1)',
              transformOrigin: 'top left',
            }}
          >
            {opciones.map((op, i) => (
              <button
                key={op.id}
                onClick={() => { onChange(op.id); setAbierto(false) }}
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: '14px',
                  backgroundColor: op.id === activa
                    ? 'rgba(0, 255, 255, 0.10)'
                    : 'transparent',
                  border: 'none',
                  borderTop: i > 0 ? '1px solid var(--color-borde)' : 'none',
                  textAlign: 'left',
                  color: op.id === activa ? 'var(--color-acento)' : 'var(--color-texto)',
                  fontSize: '16px',
                  fontWeight: op.id === activa ? '600' : '400',
                  fontFamily: 'inherit',
                  letterSpacing: '-0.015em',
                  cursor: 'pointer',
                  transition: 'background-color 0.12s',
                }}
              >
                {op.label}
                {op.id === activa && (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke="var(--color-acento)" strokeWidth="2.8"
                    strokeLinecap="round" strokeLinejoin="round"
                    style={{ flexShrink: 0 }}
                  >
                    <polyline points="20 6 9 17 4 12"/>
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
