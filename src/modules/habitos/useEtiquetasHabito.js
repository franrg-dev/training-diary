import { useState, useEffect, useCallback } from 'react'
import db from '../../db/database'

/**
 * Hook CRUD para la tabla etiquetasHabito.
 * Al eliminar una etiqueta, la limpia de todos los hábitos que la referencian.
 */
export function useEtiquetasHabito() {
  const [etiquetas, setEtiquetas] = useState([])
  const [cargando, setCargando]   = useState(true)
  const [error, setError]         = useState(null)

  const cargar = useCallback(async () => {
    try {
      const lista = await db.etiquetasHabito.orderBy('nombre').toArray()
      setEtiquetas(lista)
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const crear = useCallback(async (datos) => {
    await db.etiquetasHabito.add({
      nombre: datos.nombre.trim(),
      color:  datos.color || '#f97316',
    })
    await cargar()
  }, [cargar])

  const actualizar = useCallback(async (id, datos) => {
    await db.etiquetasHabito.update(id, {
      nombre: datos.nombre.trim(),
      color:  datos.color || '#f97316',
    })
    await cargar()
  }, [cargar])

  const eliminar = useCallback(async (id) => {
    await db.transaction('rw', db.etiquetasHabito, db.habitos, async () => {
      const habitosConEtiqueta = await db.habitos
        .filter(h => Array.isArray(h.etiquetas) && h.etiquetas.includes(id))
        .toArray()
      for (const h of habitosConEtiqueta) {
        await db.habitos.update(h.id, { etiquetas: h.etiquetas.filter(e => e !== id) })
      }
      await db.etiquetasHabito.delete(id)
    })
    await cargar()
  }, [cargar])

  return { etiquetas, cargando, error, crear, actualizar, eliminar }
}
