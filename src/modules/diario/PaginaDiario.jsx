import { useState } from 'react'
import { useDiario }               from './useDiario'
import { useEjercicios }           from '../ejercicios/useEjercicios'
import { useSesiones }             from '../sesiones/useSesiones'
import { useRegistro }             from '../registro/useRegistro'
import CalendarioDiario            from './CalendarioDiario'
import DetalleEntrenamiento        from './DetalleEntrenamiento'
import DetalleDia                  from './DetalleDia'
import FormularioDatosGenerales    from './FormularioDatosGenerales'
import FormularioEntrenamiento     from './FormularioEntrenamiento'

/**
 * Módulo Diario — Controlador de navegación interna.
 * Máquina de estados: 'calendario' | 'verEntrenamiento' | 'verDia' | 'editarDatos' | 'editarEntrenamiento'
 */
export default function PaginaDiario() {
  const { cargando, entradas, entradasDelMes, entradaPorFecha, crear, actualizar } = useDiario()
  const { ejercicios }         = useEjercicios()
  const { sesiones }           = useSesiones()
  const { ultimoPorEjercicio, registrosPorEjercicio } = useRegistro()

  const hoy = new Date()
  const [mesVisualizado, setMesVisualizado]       = useState(hoy.getMonth())
  const [anioVisualizado, setAnioVisualizado]     = useState(hoy.getFullYear())
  const [pantalla, setPantalla]                   = useState('calendario')
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null)
  const [entradaActiva, setEntradaActiva]         = useState(null)

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
    setEntradaActiva(entradaPorFecha(fecha) || null)
    setPantalla('verEntrenamiento')
  }

  function handleSeleccionarEntrenamiento(fecha) {
    setFechaSeleccionada(fecha)
    setEntradaActiva(entradaPorFecha(fecha) || null)
    setPantalla('editarEntrenamiento')
  }

  function irACalendario() {
    setPantalla('calendario')
    setFechaSeleccionada(null)
    setEntradaActiva(null)
  }

  function handleCambiarDia(delta) {
    const [anio, mes, dia] = fechaSeleccionada.split('-').map(Number)
    const d = new Date(anio, mes - 1, dia + delta)
    const nuevaFecha = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    setFechaSeleccionada(nuevaFecha)
    setEntradaActiva(entradaPorFecha(nuevaFecha) || null)
  }

  async function handleGuardarDatos(nuevosDatos) {
    const fusion = {
      fecha:            fechaSeleccionada,
      sesionId:         entradaActiva?.sesionId         || null,
      ejerciciosDia:    entradaActiva?.ejerciciosDia    || [],
      ejerciciosCardio: entradaActiva?.ejerciciosCardio || [],
      ...nuevosDatos,
    }
    if (entradaActiva?.id) {
      await actualizar(entradaActiva.id, fusion)
      setEntradaActiva(prev => ({ ...prev, ...nuevosDatos }))
    } else {
      const id = await crear(fusion)
      setEntradaActiva({ id, ...fusion })
    }
    setPantalla('verEntrenamiento')
  }

  async function handleGuardarEntrenamiento(nuevosDatos) {
    const fusion = {
      fecha: fechaSeleccionada,
      ...entradaActiva,
      ...nuevosDatos,
    }
    if (entradaActiva?.id) {
      await actualizar(entradaActiva.id, fusion)
      setEntradaActiva({ ...fusion })
    } else {
      const id = await crear(fusion)
      setEntradaActiva({ id, ...fusion })
    }
    setPantalla('verEntrenamiento')
  }

  const entradasMes = entradasDelMes(anioVisualizado, mesVisualizado)

  return (
    <div className="contenido-principal">
      {pantalla === 'calendario' && !cargando && (
        <CalendarioDiario
          entradasDelMes={entradasMes}
          todasEntradas={entradas}
          mesVisualizado={mesVisualizado}
          anioVisualizado={anioVisualizado}
          onCambiarMes={handleCambiarMes}
          onSeleccionarDia={handleSeleccionarDia}
          onSeleccionarEntrenamiento={handleSeleccionarEntrenamiento}
          sesiones={sesiones}
        />
      )}

      {pantalla === 'verEntrenamiento' && fechaSeleccionada && (
        <DetalleEntrenamiento
          fecha={fechaSeleccionada}
          entrada={entradaActiva}
          ejercicios={ejercicios}
          sesiones={sesiones}
          registrosPorEjercicio={registrosPorEjercicio}
          onEditarDatos={() => setPantalla('editarDatos')}
          onEditarEntrenamiento={() => setPantalla('editarEntrenamiento')}
          onVolver={irACalendario}
          onCambiarDia={handleCambiarDia}
        />
      )}

      {pantalla === 'editarDatos' && fechaSeleccionada && (
        <FormularioDatosGenerales
          fecha={fechaSeleccionada}
          entrada={entradaActiva}
          onGuardar={handleGuardarDatos}
          onCancelar={() => setPantalla('verEntrenamiento')}
        />
      )}

      {pantalla === 'editarEntrenamiento' && fechaSeleccionada && (
        <FormularioEntrenamiento
          fecha={fechaSeleccionada}
          entrada={entradaActiva}
          ejercicios={ejercicios}
          sesiones={sesiones}
          ultimoPorEjercicio={ultimoPorEjercicio}
          onGuardar={handleGuardarEntrenamiento}
          onCancelar={irACalendario}
        />
      )}
    </div>
  )
}
