import { COLORES_GRUPO } from './coloresGrupo'

export function SvgCardio({ size = 20, color }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size}
      viewBox="0 -960 960 960" fill={color}>
      <path d="M520-40v-240l-84-80-40 176-276-56 16-80 192 40 64-324-72 28v136h-80v-188l158-68q35-15 51.5-19.5T480-720q21 0 39 11t29 29l40 64q26 42 70.5 69T760-520v80q-66 0-123.5-27.5T540-540l-24 120 84 80v300h-80Zm-36.5-723.5Q460-787 460-820t23.5-56.5Q507-900 540-900t56.5 23.5Q620-853 620-820t-23.5 56.5Q573-740 540-740t-56.5-23.5Z"/>
    </svg>
  )
}

export function SvgMancuerna({ size = 20, color }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size}
      viewBox="0 -960 960 960" fill={color}>
      <path d="m826-585-56-56 30-31-128-128-31 30-57-57 30-31q23-23 57-22.5t57 23.5l129 129q23 23 23 56.5T857-615l-31 30ZM346-104q-23 23-56.5 23T233-104L104-233q-23-23-23-56.5t23-56.5l30-30 57 57-31 30 129 129 30-31 57 57-30 30Zm397-336 57-57-303-303-57 57 303 303ZM463-160l57-58-302-302-58 57 303 303Zm-6-234 110-109-64-64-109 110 63 63Zm63 290q-23 23-57 23t-57-23L104-406q-23-23-23-57t23-57l57-57q23-23 56.5-23t56.5 23l63 63 110-110-63-62q-23-23-23-57t23-57l57-57q23-23 56.5-23t56.5 23l303 303q23 23 23 56.5T857-441l-57 57q-23 23-57 23t-57-23l-62-63-110 110 63 63q23 23 23 56.5T577-161l-57 57Z"/>
    </svg>
  )
}

/**
 * Devuelve el icono correcto según si el ejercicio es cardio o no.
 */
export function IconoEjercicio({ grupos = [], grupoPrincipal, size = 20 }) {
  const esCardio = grupos.includes('cardio')
  const grupo    = grupoPrincipal || grupos[0] || 'core'
  const col      = COLORES_GRUPO[grupo] || COLORES_GRUPO.core

  if (esCardio) return <SvgCardio   size={size} color={col.iconoColor} />
  return              <SvgMancuerna size={size} color={col.iconoColor} />
}
