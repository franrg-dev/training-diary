import { useState, useCallback, useEffect } from 'react'
import db from '../../db/database'

export const CAMPOS_MEDIDAS = [
  { id: 'cuello',     label: 'Cuello'     },
  { id: 'hombros',    label: 'Hombros'    },
  { id: 'biceps',     label: 'Bíceps'     },
  { id: 'antebrazo',  label: 'Antebrazo'  },
  { id: 'pectoral',   label: 'Pectoral'   },
  { id: 'cintura',    label: 'Cintura'    },
  { id: 'cadera',     label: 'Cadera'     },
  { id: 'gluteos',    label: 'Glúteos'    },
  { id: 'cuadriceps', label: 'Cuádriceps' },
  { id: 'gemelos',    label: 'Gemelos'    },
]

function fechaMes(anio, mes) {
  return `${anio}-${String(mes + 1).padStart(2, '0')}-01`
}

function normalizarCampos(datos) {
  const resultado = {}
  for (const campo of CAMPOS_MEDIDAS) {
    const v = datos[campo.id]
    const num = Number(v)
    resultado[campo.id] = v !== '' && v !== null && v !== undefined && !isNaN(num) ? Math.max(0, num) : 0
  }
  return resultado
}

export function useMedidas() {
  const [medidas, setMedidas]   = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError]       = useState(null)

  const cargar = useCallback(async () => {
    try {
      const datos = await db.medidas.orderBy('fecha').toArray()
      setMedidas(datos)
    } catch (e) {
      setError(e)
    } finally {
      setCargando(false)
    }
  }, [])

  const medidaPorMes = useCallback((anio, mes) => {
    const fecha = fechaMes(anio, mes)
    return medidas.find(m => m.fecha === fecha) || null
  }, [medidas])

  const crear = useCallback(async (anio, mes, datos) => {
    const nuevo = {
      fecha: fechaMes(anio, mes),
      ...normalizarCampos(datos),
    }
    await db.medidas.add(nuevo)
    await cargar()
  }, [cargar])

  const actualizar = useCallback(async (id, datos) => {
    await db.medidas.update(id, normalizarCampos(datos))
    await cargar()
  }, [cargar])

  const eliminar = useCallback(async (id) => {
    await db.medidas.delete(id)
    await cargar()
  }, [cargar])

  useEffect(() => { cargar() }, [cargar])

  return { medidas, cargando, error, medidaPorMes, crear, actualizar, eliminar }
}
