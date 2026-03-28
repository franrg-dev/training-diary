import { useState, useCallback } from 'react'
import db from '../../db/database'

/**
 * Hook para gestionar los registros de completados de hábitos.
 *
 * Estructura de un registro:
 *   { id, habitoId, fecha, principalCompletado: bool, subhabitosCompletados: [id, ...] }
 *
 * Registros antiguos sin principalCompletado se tratan como completado = true.
 */
export function useCompletadosHabito() {
  const [completados, setCompletados] = useState([])
  const [fechaActiva, setFechaActiva] = useState(null)

  const cargarParaFecha = useCallback(async (fecha) => {
    try {
      const lista = await db.completadosHabito.where('fecha').equals(fecha).toArray()
      setCompletados(lista)
      setFechaActiva(fecha)
    } catch (e) {
      console.error('Error cargando completados:', e)
    }
  }, [])

  async function getRegistro(habitoId, fecha) {
    return db.completadosHabito
      .where('habitoId').equals(habitoId)
      .filter(c => c.fecha === fecha)
      .first()
  }

  async function recargar(fecha) {
    const lista = await db.completadosHabito.where('fecha').equals(fecha).toArray()
    setCompletados(lista)
  }

  /** Alterna el checkbox principal del hábito. */
  const toggleCompletado = useCallback(async (habitoId, fecha) => {
    const existente = await getRegistro(habitoId, fecha)

    if (existente) {
      const actualPrincipal = existente.principalCompletado ?? true
      const nuevoValor = !actualPrincipal
      const subs = existente.subhabitosCompletados || []

      if (!nuevoValor && subs.length === 0) {
        await db.completadosHabito.delete(existente.id)
      } else {
        await db.completadosHabito.update(existente.id, { principalCompletado: nuevoValor })
      }
    } else {
      await db.completadosHabito.add({
        habitoId, fecha,
        principalCompletado: true,
        subhabitosCompletados: [],
      })
    }

    if (fecha === fechaActiva) await recargar(fecha)
  }, [fechaActiva])

  /**
   * Alterna el checkbox de un subhábito.
   * Si se desmarca un subhábito obligatorio y el principal estaba marcado,
   * también desmarca el principal.
   */
  const toggleSubhabito = useCallback(async (habitoId, subhabitoId, fecha, habito) => {
    const existente = await getRegistro(habitoId, fecha)
    const actuales = existente?.subhabitosCompletados || []
    const estaChecked = actuales.includes(subhabitoId)

    const nuevasSubs = estaChecked
      ? actuales.filter(id => id !== subhabitoId)
      : [...actuales, subhabitoId]

    // Si se desmarca un subhábito obligatorio, desmarcar también el principal
    let principalActual = existente ? (existente.principalCompletado ?? true) : false
    if (estaChecked && principalActual) {
      const esObligatorio = (habito?.subhabitos || []).find(s => s.id === subhabitoId)?.obligatorio
      if (esObligatorio) principalActual = false
    }

    if (existente) {
      if (!principalActual && nuevasSubs.length === 0) {
        await db.completadosHabito.delete(existente.id)
      } else {
        await db.completadosHabito.update(existente.id, {
          subhabitosCompletados: nuevasSubs,
          principalCompletado: principalActual,
        })
      }
    } else if (nuevasSubs.length > 0) {
      await db.completadosHabito.add({
        habitoId, fecha,
        principalCompletado: false,
        subhabitosCompletados: nuevasSubs,
      })
    }

    if (fecha === fechaActiva) await recargar(fecha)
  }, [fechaActiva])

  /** true si el principal está marcado (compatibilidad con registros antiguos). */
  const estaCompletado = useCallback((habitoId) => {
    const registro = completados.find(c => c.habitoId === habitoId)
    if (!registro) return false
    return registro.principalCompletado ?? true
  }, [completados])

  /** IDs de subhábitos completados para un hábito en la fecha activa. */
  const subhabitosCompletadosDeHabito = useCallback((habitoId) => {
    return completados.find(c => c.habitoId === habitoId)?.subhabitosCompletados || []
  }, [completados])

  /**
   * true si el usuario puede marcar el principal.
   * Condiciones (ambas deben cumplirse si están configuradas):
   *   1. Todos los subhábitos marcados como obligatorio deben estar en subCompletados.
   *   2. El total de subCompletados debe ser >= habito.subhabitosMinimo (si > 0).
   */
  const puedeMarcarsePrincipal = useCallback((habito, subCompletados) => {
    const subhabitos = habito?.subhabitos || []

    // 1. Obligatorios individuales
    const obligatorios = subhabitos.filter(s => s.obligatorio)
    if (!obligatorios.every(s => subCompletados.includes(s.id))) return false

    // 2. Mínimo de subhábitos (cualquiera)
    const minimo = habito?.subhabitosMinimo || 0
    if (minimo > 0 && subCompletados.length < minimo) return false

    return true
  }, [])

  /** Cuenta cuántas veces se marcó el principal (para finTipo='veces'). */
  const contarCompletados = useCallback(async (habitoId) => {
    const todos = await db.completadosHabito.where('habitoId').equals(habitoId).toArray()
    return todos.filter(c => c.principalCompletado ?? true).length
  }, [])

  return {
    completados, cargarParaFecha,
    toggleCompletado, toggleSubhabito,
    estaCompletado, subhabitosCompletadosDeHabito, puedeMarcarsePrincipal,
    contarCompletados,
  }
}
