import { useState, useCallback } from 'react'
import db from '../../db/database'

/**
 * Hook para gestionar los registros de completados de hábitos.
 * Carga los completados de una fecha concreta y permite hacer toggle.
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

  const toggleCompletado = useCallback(async (habitoId, fecha) => {
    const existente = await db.completadosHabito
      .where('habitoId').equals(habitoId)
      .filter(c => c.fecha === fecha)
      .first()

    if (existente) {
      await db.completadosHabito.delete(existente.id)
    } else {
      await db.completadosHabito.add({ habitoId, fecha })
    }

    if (fecha === fechaActiva) {
      const lista = await db.completadosHabito.where('fecha').equals(fecha).toArray()
      setCompletados(lista)
    }
  }, [fechaActiva])

  const estaCompletado = useCallback((habitoId) => {
    return completados.some(c => c.habitoId === habitoId)
  }, [completados])

  /** Cuenta cuántas veces se ha completado un hábito en total (para finTipo='veces') */
  const contarCompletados = useCallback(async (habitoId) => {
    return db.completadosHabito.where('habitoId').equals(habitoId).count()
  }, [])

  return { completados, cargarParaFecha, toggleCompletado, estaCompletado, contarCompletados }
}
