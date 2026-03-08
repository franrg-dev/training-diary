import { useState, useEffect, useCallback } from 'react'
import db from '../../db/database'

/**
 * Hook CRUD para la tabla diario.
 * Cada entrada: { fecha (YYYY-MM-DD), sesionId, ejerciciosDia[], sensacionesGenerales, notas }
 * ejerciciosDia item: { ejercicioId, series, repeticiones, peso, unidad, sensaciones }
 *
 * Efecto lateral: al guardar, los ejercicios con peso > 0 crean/actualizan
 * entradas en la tabla registro (sincronización automática).
 */
export function useDiario() {
  const [entradas, setEntradas] = useState([])
  const [cargando, setCargando] = useState(true)

  const cargar = useCallback(async () => {
    try {
      const lista = await db.diario.orderBy('fecha').reverse().toArray()
      setEntradas(lista)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  // Entradas del mes indicado (mes = 0–11 en JS)
  const entradasDelMes = useCallback((anio, mes) => {
    const prefijo = `${anio}-${String(mes + 1).padStart(2, '0')}`
    return entradas.filter(e => e.fecha.startsWith(prefijo))
  }, [entradas])

  // Entrada exacta por fecha string YYYY-MM-DD
  const entradaPorFecha = useCallback((fecha) => {
    return entradas.find(e => e.fecha === fecha) || null
  }, [entradas])

  // Sync automático a registro para los ejercicios con peso registrado
  async function syncRegistro(ejerciciosDia, fecha) {
    for (const ej of (ejerciciosDia || [])) {
      if (Number(ej.peso) > 0) {
        const existente = await db.registro
          .where('ejercicioId').equals(ej.ejercicioId)
          .filter(r => r.fecha === fecha)
          .first()
        if (existente) {
          await db.registro.update(existente.id, { peso: Number(ej.peso), unidad: ej.unidad || 'kg' })
        } else {
          await db.registro.add({
            ejercicioId: ej.ejercicioId,
            fecha,
            peso:   Number(ej.peso),
            unidad: ej.unidad || 'kg',
            notas:  '',
          })
        }
      }
    }
  }

  const crear = useCallback(async (datos) => {
    const id = await db.diario.add({
      fecha:                datos.fecha,
      sesionId:             datos.sesionId || null,
      ejerciciosDia:        datos.ejerciciosDia || [],
      sensacionesGenerales: datos.sensacionesGenerales?.trim() || '',
      notas:                datos.notas?.trim() || '',
    })
    await syncRegistro(datos.ejerciciosDia, datos.fecha)
    await cargar()
    return id
  }, [cargar])

  const actualizar = useCallback(async (id, datos) => {
    await db.diario.update(id, {
      sesionId:             datos.sesionId || null,
      ejerciciosDia:        datos.ejerciciosDia || [],
      sensacionesGenerales: datos.sensacionesGenerales?.trim() || '',
      notas:                datos.notas?.trim() || '',
    })
    await syncRegistro(datos.ejerciciosDia, datos.fecha)
    await cargar()
  }, [cargar])

  // Eliminar entrada del diario (el registro de pesos se conserva)
  const eliminar = useCallback(async (id) => {
    await db.diario.delete(id)
    await cargar()
  }, [cargar])

  return { entradas, cargando, entradasDelMes, entradaPorFecha, crear, actualizar, eliminar }
}
