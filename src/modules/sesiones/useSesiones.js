import { useState, useEffect, useCallback } from 'react'
import db from '../../db/database'

/**
 * Hook CRUD para la tabla sesiones.
 * Cada sesión tiene: nombre, descripcion, ejercicios[]
 * donde cada item es { ejercicioId, orden, series, repeticiones }.
 */
export function useSesiones() {
  const [sesiones, setSesiones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError]       = useState(null)

  const cargar = useCallback(async () => {
    try {
      const lista = await db.sesiones.orderBy('nombre').toArray()
      setSesiones(lista)
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const crear = useCallback(async (datos) => {
    const id = await db.sesiones.add({
      nombre:      datos.nombre.trim(),
      descripcion: datos.descripcion?.trim() || '',
      ejercicios:  datos.ejercicios || [],
    })
    await cargar()
    return id
  }, [cargar])

  const actualizar = useCallback(async (id, datos) => {
    await db.sesiones.update(id, {
      nombre:      datos.nombre.trim(),
      descripcion: datos.descripcion?.trim() || '',
      ejercicios:  datos.ejercicios || [],
    })
    await cargar()
  }, [cargar])

  // Eliminar la sesión (sesionId huérfano en diario es inofensivo)
  const eliminar = useCallback(async (id) => {
    await db.sesiones.delete(id)
    await cargar()
  }, [cargar])

  return { sesiones, cargando, error, crear, actualizar, eliminar }
}
