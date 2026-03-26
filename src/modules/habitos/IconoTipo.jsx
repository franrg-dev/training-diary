import { TIPOS_HABITO } from './tiposHabito'

/**
 * Renderiza el icono SVG inline de un tipo de hábito.
 * Props:
 *   tipo — id del tipo (string)
 *   size — tamaño en px (default 20)
 *   color — color del fill (default: el color del tipo, o 'currentColor')
 */
export default function IconoTipo({ tipo, size = 20, color }) {
  const def = TIPOS_HABITO.find(t => t.id === tipo) ?? TIPOS_HABITO[TIPOS_HABITO.length - 1]
  const fill = color ?? def.color

  return (
    <svg
      width={size}
      height={size}
      viewBox={def.viewBox}
      fill={fill}
      aria-hidden="true"
    >
      <path d={def.svgPath} />
    </svg>
  )
}
