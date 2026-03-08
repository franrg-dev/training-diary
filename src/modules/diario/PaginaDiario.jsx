import { useState } from 'react'
import { useDiario }     from './useDiario'
import { useEjercicios } from '../ejercicios/useEjercicios'
import { useSesiones }   from '../sesiones/useSesiones'
import { useRegistro }   from '../registro/useRegistro'
import CalendarioDiario  from './CalendarioDiario'
import DetalleDia        from './DetalleDia'
import FormularioDia     from './FormularioDia'

/**
 * Módulo Diario — Controlador de navegación interna.
 * Flujo: Calendario → Detalle (día con entrada) | Calendario → Formulario (día vacío)
 *        Detalle → Formulario (editar)
 */
export default function PaginaDiario() {
  const { entradas, cargando, entradasDelMes, entradaPorFecha, crear, actualizar, eliminar } = useDiario()
  const { ejercicios } = useEjercicios()
  const { sesiones }   = useSesiones()
  const { ultimoPorEjercicio } = useRegistro()

  const hoy = new Date()
  const [mesVisualizado, setMesVisualizado]   = useState(hoy.getMonth())
  const [anioVisualizado, setAnioVisualizado] = useState(hoy.getFullYear())
  const [pantalla, setPantalla]               = useState('calendario')
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null)
  const [entradaActiva, setEntradaActiva]     = useState(null)

  function handleCambiarMes(delta) {
    setMesVisualizado(prev => {
      const nuevoMes = prev + delta
      if (nuevoMes < 0)  { setAnioVisualizado(a => a - 1); return 11 }
      if (nuevoMes > 11) { setAnioVisualizado(a => a + 1); return 0  }
      return nuevoMes
    })
  }

  function handleSeleccionarDia(fecha) {
    setFechaSeleccionada(fecha)
    const entrada = entradaPorFecha(fecha)
    if (entrada) {
      setEntradaActiva(entrada)
      setPantalla('detalle')
    } else {
      setEntradaActiva(null)
      setPantalla('formulario')
    }
  }

  function irACalendario() {
    setPantalla('calendario')
    setFechaSeleccionada(null)
    setEntradaActiva(null)
  }

  async function handleGuardar(datos) {
    if (entradaActiva) {
      await actualizar(entradaActiva.id, datos)
    } else {
      await crear(datos)
    }
    irACalendario()
  }

  async function handleEliminar() {
    await eliminar(entradaActiva.id)
    irACalendario()
  }

  const entradasMes = entradasDelMes(anioVisualizado, mesVisualizado)

  return (
    <div className="contenido-principal">
      {pantalla === 'calendario' && !cargando && (
        <CalendarioDiario
          entradasDelMes={entradasMes}
          mesVisualizado={mesVisualizado}
          anioVisualizado={anioVisualizado}
          onCambiarMes={handleCambiarMes}
          onSeleccionarDia={handleSeleccionarDia}
        />
      )}

      {pantalla === 'detalle' && entradaActiva && (
        <DetalleDia
          entrada={entradaActiva}
          ejercicios={ejercicios}
          sesiones={sesiones}
          onEditar={() => setPantalla('formulario')}
          onEliminar={handleEliminar}
          onVolver={irACalendario}
        />
      )}

      {pantalla === 'formulario' && fechaSeleccionada && (
        <FormularioDia
          fecha={fechaSeleccionada}
          entrada={entradaActiva}
          ejercicios={ejercicios}
          sesiones={sesiones}
          ultimoPorEjercicio={ultimoPorEjercicio}
          onGuardar={handleGuardar}
          onCancelar={entradaActiva ? () => setPantalla('detalle') : irACalendario}
        />
      )}
    </div>
  )
}
