const CLAVE = 'lugares_entrenamiento'

export function getLugares() {
  try { return JSON.parse(localStorage.getItem(CLAVE)) || [] } catch { return [] }
}

export function setLugares(lugares) {
  localStorage.setItem(CLAVE, JSON.stringify(lugares))
}
