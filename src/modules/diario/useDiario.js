import { useState, useEffect, useCallback } from 'react'
import db from '../../db/database'

/**
 * Hook CRUD para la tabla diario.
 *
 * Cada entrada almacena:
 *   — Fuerza:    sesionId, ejerciciosDia[]
 *   — Cardio:    ejerciciosCardio[]
 *   — General:   nutrición, actividad, hábitos, sueño, esfuerzo, composición corporal
 *
 * Efecto lateral: al guardar, los ejercicios de fuerza con peso > 0 crean/actualizan
 * entradas en la tabla registro (sincronización automática de progresión).
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

  const entradasDelMes = useCallback((anio, mes) => {
    const prefijo = `${anio}-${String(mes + 1).padStart(2, '0')}`
    return entradas.filter(e => e.fecha.startsWith(prefijo))
  }, [entradas])

  const entradaPorFecha = useCallback((fecha) => {
    return entradas.find(e => e.fecha === fecha) || null
  }, [entradas])

  // Sync automático a registro para ejercicios de fuerza con peso registrado
  async function syncRegistro(ejerciciosDia, ejerciciosCardio, fecha) {
    // Fuerza: sincroniza peso
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
            id:          crypto.randomUUID(),
            ejercicioId: ej.ejercicioId,
            fecha,
            peso:        Number(ej.peso),
            unidad:      ej.unidad || 'kg',
            notas:       '',
          })
        }
      }
    }
    // Cardio: sincroniza duracion / ritmo / volumen
    for (const ej of (ejerciciosCardio || [])) {
      if (ej.duracion || ej.ritmo || ej.volumen) {
        const existente = await db.registro
          .where('ejercicioId').equals(ej.ejercicioId)
          .filter(r => r.fecha === fecha)
          .first()
        const campos = {
          duracion: ej.duracion || '',
          ritmo:    ej.ritmo    || '',
          volumen:  ej.volumen  || '',
          modo:     ej.modo     || 'km',
        }
        if (existente) {
          await db.registro.update(existente.id, campos)
        } else {
          await db.registro.add({
            id:          crypto.randomUUID(),
            ejercicioId: ej.ejercicioId,
            fecha,
            notas:       '',
            ...campos,
          })
        }
      }
    }
  }

  function normalizarDatos(datos) {
    return {
      fecha:                datos.fecha,
      sesionId:             datos.sesionId || null,
      // Fuerza
      ejerciciosDia:        datos.ejerciciosDia        || [],
      // Cardio
      ejerciciosCardio:     datos.ejerciciosCardio     || [],
      // Nutrición
      kcalConsumidas:       Number(datos.kcalConsumidas)  || 0,
      proteinas:            Number(datos.proteinas)        || 0,
      carbohidratos:        Number(datos.carbohidratos)    || 0,
      grasas:               Number(datos.grasas)           || 0,
      // Actividad
      kcalQuemadas:         Number(datos.kcalQuemadas)     || 0,
      metabolismoBasal:     Number(datos.metabolismoBasal) || 0,
      pasos:                Number(datos.pasos)            || 0,
      // Hábitos
      movilidad:            datos.movilidad               ?? false,
      core:                 datos.core                    ?? false,
      agua:                 Number(datos.agua)            || 0,
      // Sueño
      suenoHoras:           Number(datos.suenoHoras)       || 0,
      suenoHoraAcostarse:   datos.suenoHoraAcostarse      || '',
      suenoCalidad:         Number(datos.suenoCalidad)     || 0,
      // Esfuerzo
      esfuerzo:             Number(datos.esfuerzo)         || 0,
      // Composición corporal
      horaPesaje:           datos.horaPesaje               || '',
      bascula:              datos.bascula                  || '',
      peso:                 Number(datos.peso)             || 0,
      imc:                  Number(datos.imc)              || 0,
      grasaPorcentaje:      Number(datos.grasaPorcentaje)  || 0,
      grasaVisceral:        Number(datos.grasaVisceral)    || 0,
      musculo:              Number(datos.musculo)           || 0,
      masaOsea:             Number(datos.masaOsea)         || 0,
      edadCorporal:         Number(datos.edadCorporal)     || 0,
    }
  }

  const crear = useCallback(async (datos) => {
    const id = await db.diario.add({ id: crypto.randomUUID(), ...normalizarDatos(datos) })
    await syncRegistro(datos.ejerciciosDia, datos.ejerciciosCardio, datos.fecha)
    await cargar()
    return id
  }, [cargar])

  const actualizar = useCallback(async (id, datos) => {
    const campos = normalizarDatos(datos)
    delete campos.fecha // fecha no se actualiza (es la clave de negocio)
    await db.diario.update(id, campos)
    await syncRegistro(datos.ejerciciosDia, datos.ejerciciosCardio, datos.fecha)
    await cargar()
  }, [cargar])

  const eliminar = useCallback(async (id) => {
    await db.diario.delete(id)
    await cargar()
  }, [cargar])

  return { entradas, cargando, entradasDelMes, entradaPorFecha, crear, actualizar, eliminar }
}
