import { useState, useEffect, useCallback } from 'react'
import db from '../../db/database'

/**
 * Hook CRUD para la tabla registro.
 * Cada entrada: { ejercicioId, fecha (YYYY-MM-DD), peso, unidad, notas }
 */
export function useRegistro() {
  const [registros, setRegistros] = useState([])
  const [cargando, setCargando]   = useState(true)

  const cargar = useCallback(async () => {
    try {
      const lista = await db.registro.orderBy('fecha').toArray()
      setRegistros(lista)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  // Entradas de un ejercicio ordenadas por fecha ASC
  const registrosPorEjercicio = useCallback((ejercicioId) => {
    return registros
      .filter(r => r.ejercicioId === ejercicioId)
      .sort((a, b) => a.fecha.localeCompare(b.fecha))
  }, [registros])

  // Último registro de un ejercicio (el más reciente)
  const ultimoPorEjercicio = useCallback((ejercicioId) => {
    const todos = registros.filter(r => r.ejercicioId === ejercicioId)
    if (todos.length === 0) return null
    return todos.reduce((max, r) => r.fecha > max.fecha ? r : max, todos[0])
  }, [registros])

  const crear = useCallback(async (datos) => {
    const id = await db.registro.add({
      ejercicioId: datos.ejercicioId,
      fecha:       datos.fecha,
      peso:        Number(datos.peso) || 0,
      unidad:      datos.unidad || 'kg',
      notas:       datos.notas?.trim() || '',
    })
    await cargar()
    return id
  }, [cargar])

  // Crea o actualiza un registro para (ejercicioId, fecha) — usado desde el diario
  const upsertDesdeDiario = useCallback(async (ejercicioId, fecha, peso, unidad) => {
    const existente = await db.registro
      .where('ejercicioId').equals(ejercicioId)
      .filter(r => r.fecha === fecha)
      .first()
    if (existente) {
      await db.registro.update(existente.id, { peso: Number(peso), unidad })
    } else {
      await db.registro.add({ ejercicioId, fecha, peso: Number(peso), unidad, notas: '' })
    }
    await cargar()
  }, [cargar])

  const eliminar = useCallback(async (id) => {
    await db.registro.delete(id)
    await cargar()
  }, [cargar])

  return { registros, cargando, registrosPorEjercicio, ultimoPorEjercicio, crear, upsertDesdeDiario, eliminar }
}
