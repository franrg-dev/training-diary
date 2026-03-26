import { useState, useEffect, useCallback } from 'react'
import db from '../../db/database'
import { hoyISO } from './habitosUtils'

/**
 * Hook CRUD para la tabla habitos.
 * Patrón idéntico a useEjercicios.js.
 */
export function useHabitos() {
  const [habitos, setHabitos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const cargar = useCallback(async () => {
    try {
      const lista = await db.habitos.orderBy('titulo').toArray()
      setHabitos(lista)
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const crear = useCallback(async (datos) => {
    await db.habitos.add({
      titulo:      datos.titulo.trim(),
      descripcion: datos.descripcion?.trim() || '',
      tipo:        datos.tipo || 'otros',
      etiquetas:   datos.etiquetas || [],
      fechaInicio: datos.fechaInicio || hoyISO(),
      repeticion:  datos.repeticion || { tipo: 'ninguna', finTipo: 'nunca' },
    })
    await cargar()
  }, [cargar])

  const actualizar = useCallback(async (id, datos) => {
    await db.habitos.update(id, {
      titulo:      datos.titulo.trim(),
      descripcion: datos.descripcion?.trim() || '',
      tipo:        datos.tipo || 'otros',
      etiquetas:   datos.etiquetas || [],
      fechaInicio: datos.fechaInicio,
      repeticion:  datos.repeticion || { tipo: 'ninguna', finTipo: 'nunca' },
    })
    await cargar()
  }, [cargar])

  const eliminar = useCallback(async (id) => {
    await db.transaction('rw', db.habitos, db.completadosHabito, async () => {
      await db.completadosHabito.where('habitoId').equals(id).delete()
      await db.habitos.delete(id)
    })
    await cargar()
  }, [cargar])

  return { habitos, cargando, error, crear, actualizar, eliminar }
}
