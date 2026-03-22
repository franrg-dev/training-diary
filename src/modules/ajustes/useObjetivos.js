const CLAVE_LS = 'objetivos'

const DEFAULTS = {
  kcalDiferencia:  0,      // kcal netas diarias objetivo
  proteinas:       0,      // g/día
  carbohidratos:   0,      // g/día
  grasas:          0,      // g/día
  pasos:           0,      // pasos/día
  agua:            0,      // litros/día
  pesoObjetivo:    '',     // kg
  pesoObjetivoTipo: 'perder', // 'perder' | 'ganar'
}

export function getObjetivos() {
  try {
    const raw = localStorage.getItem(CLAVE_LS)
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS }
  } catch {
    return { ...DEFAULTS }
  }
}

export function setObjetivos(objetivos) {
  localStorage.setItem(CLAVE_LS, JSON.stringify(objetivos))
}
