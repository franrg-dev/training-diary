/**
 * Segmented control — píldora con tabs inline.
 * El tab activo tiene fondo sólido que "flota" sobre el track oscuro.
 *
 * Props:
 *   opciones  — [{ id: string, label: string }]
 *   activa    — id de la opción actualmente seleccionada
 *   onChange  — (id: string) => void
 */
export default function SelectorSeccion({ opciones, activa, onChange }) {
  return (
    <div className="app-segmented">
      {opciones.map(op => (
        <button
          key={op.id}
          onClick={() => onChange(op.id)}
          className={`app-segmented-tab${op.id === activa ? ' activo' : ''}`}
        >
          {op.label}
        </button>
      ))}
    </div>
  )
}
