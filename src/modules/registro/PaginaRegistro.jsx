import { useState } from 'react'
import { useEjercicios } from '../ejercicios/useEjercicios'
import { useRegistro }   from './useRegistro'
import ListaRegistro     from './ListaRegistro'
import HistorialEjercicio from './HistorialEjercicio'

/**
 * Módulo Registro — Controlador de navegación interna.
 * Flujo: Lista → Historial del ejercicio seleccionado
 */
export default function PaginaRegistro() {
  const { ejercicios } = useEjercicios()
  const { registros, registrosPorEjercicio, crear, eliminar } = useRegistro()

  const [pantalla, setPantalla]             = useState('lista')
  const [ejercicioActivo, setEjercicioActivo] = useState(null)

  function irAHistorial(ej) {
    setEjercicioActivo(ej)
    setPantalla('historial')
  }

  function irALista() {
    setPantalla('lista')
    setEjercicioActivo(null)
  }

  const registrosDelEjercicio = ejercicioActivo
    ? registrosPorEjercicio(ejercicioActivo.id)
    : []

  return (
    <div className="contenido-principal">
      {pantalla === 'lista' && (
        <ListaRegistro
          ejercicios={ejercicios}
          registros={registros}
          onSeleccionar={irAHistorial}
        />
      )}

      {pantalla === 'historial' && ejercicioActivo && (
        <HistorialEjercicio
          ejercicio={ejercicioActivo}
          registros={registrosDelEjercicio}
          onVolver={irALista}
          onEliminarRegistro={eliminar}
          onCrearRegistro={crear}
        />
      )}
    </div>
  )
}
