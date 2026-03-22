import { useState, useEffect, useCallback } from 'react'
import db from '../../db/database'

/**
 * Hook que encapsula todas las operaciones CRUD sobre la tabla ejercicios.
 * Recarga la lista automáticamente tras cada operación de escritura.
 */
export function useEjercicios() {
  const [ejercicios, setEjercicios] = useState([])
  const [cargando, setCargando]   = useState(true)
  const [error, setError]         = useState(null)

  // Carga todos los ejercicios ordenados por nombre
  const cargar = useCallback(async () => {
    try {
      const lista = await db.ejercicios.orderBy('nombre').toArray()
      setEjercicios(lista)
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  // Sincroniza la relación bidireccional de sustitutos dentro de una transacción.
  // añadidos/eliminados son los ids respecto al estado anterior.
  async function _sincronizarBidireccional(id, añadidos, eliminados) {
    for (const susId of añadidos) {
      const sus = await db.ejercicios.get(susId)
      if (sus && !(sus.sustitutos || []).includes(id)) {
        await db.ejercicios.update(susId, { sustitutos: [...(sus.sustitutos || []), id] })
      }
    }
    for (const susId of eliminados) {
      const sus = await db.ejercicios.get(susId)
      if (sus) {
        await db.ejercicios.update(susId, { sustitutos: (sus.sustitutos || []).filter(s => s !== id) })
      }
    }
  }

  // Crea un nuevo ejercicio y devuelve su id generado
  const crear = useCallback(async (datos) => {
    const grupos = datos.gruposMuscular || []
    const nuevoId = crypto.randomUUID()
    const sustitutos = datos.sustitutos || []

    await db.transaction('rw', db.ejercicios, async () => {
      await db.ejercicios.add({
        id:              nuevoId,
        nombre:          datos.nombre.trim(),
        gruposMuscular:  grupos,
        grupoPrincipal:  datos.grupoPrincipal || grupos[0] || '',
        series:          Number(datos.series) || 0,
        repeticiones:    datos.repeticiones.trim(),
        ejecucion:       datos.ejecucion.trim(),
        sustitutos,
        modo:            grupos.includes('cardio') ? (datos.modo || 'km') : undefined,
      })
      await _sincronizarBidireccional(nuevoId, sustitutos, [])
    })

    await cargar()
    return nuevoId
  }, [cargar])

  // Actualiza un ejercicio existente por id
  const actualizar = useCallback(async (id, datos) => {
    const grupos = datos.gruposMuscular || []
    const nuevosSustitutos = datos.sustitutos || []

    await db.transaction('rw', db.ejercicios, async () => {
      const actual = await db.ejercicios.get(id)
      const anteriorSustitutos = actual?.sustitutos || []

      const añadidos  = nuevosSustitutos.filter(s => !anteriorSustitutos.includes(s))
      const eliminados = anteriorSustitutos.filter(s => !nuevosSustitutos.includes(s))

      await db.ejercicios.update(id, {
        nombre:          datos.nombre.trim(),
        gruposMuscular:  grupos,
        grupoPrincipal:  datos.grupoPrincipal || grupos[0] || '',
        series:          Number(datos.series) || 0,
        repeticiones:    datos.repeticiones.trim(),
        ejecucion:       datos.ejecucion.trim(),
        sustitutos:      nuevosSustitutos,
        modo:            grupos.includes('cardio') ? (datos.modo || 'km') : undefined,
      })

      await _sincronizarBidireccional(id, añadidos, eliminados)
    })

    await cargar()
  }, [cargar])

  // Elimina un ejercicio por id y limpia referencias en sustitutos de otros
  const eliminar = useCallback(async (id) => {
    await db.transaction('rw', db.ejercicios, async () => {
      // Quitar este ejercicio de la lista de sustitutos de otros ejercicios
      const conEsteComoSustituto = await db.ejercicios
        .filter(ej => Array.isArray(ej.sustitutos) && ej.sustitutos.includes(id))
        .toArray()

      for (const ej of conEsteComoSustituto) {
        await db.ejercicios.update(ej.id, {
          sustitutos: ej.sustitutos.filter(s => s !== id),
        })
      }

      await db.ejercicios.delete(id)
    })
    await cargar()
  }, [cargar])

  return { ejercicios, cargando, error, crear, actualizar, eliminar }
}
