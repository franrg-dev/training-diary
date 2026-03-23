const CLAVE_LS = 'objetivos'

const DEFAULTS = {
  kcalDiferencia:  0,      // kcal netas diarias objetivo
  proteinas:       0,      // g/día
  carbohidratos:   0,      // g/día
  grasas:          0,      // g/día
  pasos:           0,      // pasos/día
  agua:            0,      // litros/día
  pesoObjetivo:    '',     // kg
  pesoObjetivoTipo: 'deficit', // 'deficit' | 'volumen' | 'mantenimiento'
}

// Migración de valores antiguos
const MIGRACION_TIPO = { perder: 'deficit', ganar: 'volumen' }

export function getObjetivos() {
  try {
    const raw = localStorage.getItem(CLAVE_LS)
    const obj = raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS }
    if (MIGRACION_TIPO[obj.pesoObjetivoTipo]) {
      obj.pesoObjetivoTipo = MIGRACION_TIPO[obj.pesoObjetivoTipo]
      localStorage.setItem(CLAVE_LS, JSON.stringify(obj))
    }
    return obj
  } catch {
    return { ...DEFAULTS }
  }
}

export function setObjetivos(objetivos) {
  localStorage.setItem(CLAVE_LS, JSON.stringify(objetivos))
}
