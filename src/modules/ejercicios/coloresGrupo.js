/**
 * Paleta de colores y emojis para cada grupo muscular.
 * Se usa en tarjetas, badges y el formulario.
 */
export const COLORES_GRUPO = {
  pecho:    { bg: '#3b1d8a22', border: '#7c3aed66', texto: '#a78bfa', emoji: '🫁' },
  espalda:  { bg: '#0e374422', border: '#0891b266', texto: '#22d3ee', emoji: '🔙' },
  hombro:   { bg: '#2d1b6922', border: '#6d28d966', texto: '#c4b5fd', emoji: '🔺' },
  bíceps:   { bg: '#1e3a8a22', border: '#2563eb66', texto: '#60a5fa', emoji: '💪' },
  tríceps:  { bg: '#1e1b4b22', border: '#4338ca66', texto: '#818cf8', emoji: '🔻' },
  pierna:   { bg: '#064e3b22', border: '#05966966', texto: '#34d399', emoji: '🦵' },
  core:     { bg: '#78350f22', border: '#d9740666', texto: '#fbbf24', emoji: '⚡' },
  cardio:   { bg: '#7f1d1d22', border: '#dc262666', texto: '#f87171', emoji: '❤️' },
}

/**
 * Convierte el identificador de grupo a texto con mayúscula inicial.
 * Ej: 'bíceps' → 'Bíceps'
 */
export function capitalizarGrupo(grupo) {
  if (!grupo) return ''
  return grupo.charAt(0).toUpperCase() + grupo.slice(1)
}
