const DIAS_SEMANA_CAP = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const MESES_ES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

/** Fecha de hoy en formato YYYY-MM-DD */
export function hoyISO() {
  const h = new Date()
  return toISO(h)
}

/** Convierte un objeto Date a YYYY-MM-DD */
export function toISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Formato largo: "Jueves, 26 de marzo de 2026" */
export function formatearFechaLarga(fechaISO) {
  const [anio, mes, dia] = fechaISO.split('-').map(Number)
  const d = new Date(anio, mes - 1, dia)
  return `${DIAS_SEMANA_CAP[d.getDay()]}, ${dia} de ${MESES_ES[mes - 1]} de ${anio}`
}

/**
 * Comprueba si una fecha es válida según el patrón de repetición.
 * No verifica fechaInicio ni fin — solo si el patrón lo permite.
 * Útil para el calendario del formulario (para deshabilitar días).
 */
export function esDiaValidoRepeticion(repeticion, fechaISO) {
  if (!repeticion || !repeticion.tipo || repeticion.tipo === 'ninguna') return true
  if (repeticion.tipo === 'diaria') return true
  if (repeticion.tipo === 'semanal') {
    const [anio, mes, dia] = fechaISO.split('-').map(Number)
    const d = new Date(anio, mes - 1, dia)
    return (repeticion.diasSemana || []).includes(d.getDay())
  }
  if (repeticion.tipo === 'mensual') {
    const dia = parseInt(fechaISO.split('-')[2], 10)
    return (repeticion.diasMes || []).includes(dia)
  }
  return true
}

/**
 * Determina si un hábito debe aparecer en una fecha dada.
 * numCompletados: veces completado (para finTipo='veces')
 */
export function habitoAparece(habito, fechaISO, numCompletados = 0) {
  if (!habito.fechaInicio) return false
  if (fechaISO < habito.fechaInicio) return false

  const rep = habito.repeticion || {}

  if (!rep.tipo || rep.tipo === 'ninguna') {
    return fechaISO === habito.fechaInicio
  }

  if (rep.finTipo === 'fecha' && rep.finFecha) {
    if (fechaISO > rep.finFecha) return false
  }
  if (rep.finTipo === 'veces' && rep.finVeces > 0) {
    if (numCompletados >= rep.finVeces) return false
  }

  return esDiaValidoRepeticion(rep, fechaISO)
}

/**
 * Dado un objeto repeticion y una fechaISO de referencia,
 * devuelve el día válido más cercano (busca hacia adelante, luego hacia atrás).
 */
export function snapAlDiaValido(repeticion, fechaISO) {
  if (esDiaValidoRepeticion(repeticion, fechaISO)) return fechaISO

  const [anio, mes, dia] = fechaISO.split('-').map(Number)
  const base = new Date(anio, mes - 1, dia)

  for (let delta = 1; delta <= 365; delta++) {
    const df = new Date(base)
    df.setDate(df.getDate() + delta)
    if (esDiaValidoRepeticion(repeticion, toISO(df))) return toISO(df)

    const db2 = new Date(base)
    db2.setDate(db2.getDate() - delta)
    if (esDiaValidoRepeticion(repeticion, toISO(db2))) return toISO(db2)
  }
  return fechaISO
}
