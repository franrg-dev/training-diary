/**
 * Paleta de colores y emojis para cada grupo muscular.
 * Se usa en tarjetas, badges y el formulario.
 */
export const COLORES_GRUPO = {
  pecho:    { bg: '#E5393522', border: '#E5393566', texto: '#E53935', iconoColor: '#E53935' },
  espalda:  { bg: '#1E88E522', border: '#1E88E566', texto: '#1E88E5', iconoColor: '#1E88E5' },
  hombro:   { bg: '#FB8C0022', border: '#FB8C0066', texto: '#FB8C00', iconoColor: '#FB8C00' },
  bíceps:   { bg: '#FDD83522', border: '#FDD83566', texto: '#FDD835', iconoColor: '#FDD835' },
  tríceps:  { bg: '#8E24AA22', border: '#8E24AA66', texto: '#8E24AA', iconoColor: '#8E24AA' },
  pierna:   { bg: '#43A04722', border: '#43A04766', texto: '#43A047', iconoColor: '#43A047' },
  core:     { bg: '#6D4C4122', border: '#6D4C4166', texto: '#6D4C41', iconoColor: '#6D4C41' },
  cardio:   { bg: '#00ACC122', border: '#00ACC166', texto: '#00ACC1', iconoColor: '#00ACC1' },
}

/**
 * Convierte el identificador de grupo a texto con mayúscula inicial.
 * Ej: 'bíceps' → 'Bíceps'
 */
export function capitalizarGrupo(grupo) {
  if (!grupo) return ''
  return grupo.charAt(0).toUpperCase() + grupo.slice(1)
}
