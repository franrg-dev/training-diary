import { useState } from 'react'
import SelectorSeccion             from '../../components/SelectorSeccion'
import { useDiario }               from './useDiario'
import { useEjercicios }           from '../ejercicios/useEjercicios'
import { useSesiones }             from '../sesiones/useSesiones'
import { useRegistro }             from '../registro/useRegistro'
import CalendarioDiario            from './CalendarioDiario'
import DetalleEntrenamiento        from './DetalleEntrenamiento'
import FormularioDatosGenerales    from './FormularioDatosGenerales'
import FormularioEntrenamiento     from './FormularioEntrenamiento'
import MedidasCorporales           from './MedidasCorporales'

const OPCIONES_SECCION = [
  { id: 'diario',   label: 'Diario'            },
  { id: 'medidas',  label: 'Medidas Corporales' },
  { id: 'calendario', label: 'Calendario'       },
]

function toFechaStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * Módulo Diario — Hub con tres subsecciones.
 * Secciones: 'diario' | 'medidas' | 'calendario'
 * Pantallas dentro de 'diario': 'ver' | 'editarDatos' | 'editarEntrenamiento'
 */
export default function PaginaDiario() {
  const { cargando, entradas, entradasDelMes, entradaPorFecha, mbEfectivoPorFecha, crear, actualizar } = useDiario()
  const { ejercicios }         = useEjercicios()
  const { sesiones }           = useSesiones()
  const { ultimoPorEjercicio, registrosPorEjercicio } = useRegistro()

  const hoy = new Date()
  const hoyStr = toFechaStr(hoy)

  // — Sección activa —
  const [seccion, setSeccion] = useState('diario')

  // — Subsección Diario —
  const [fechaSeleccionada, setFechaSeleccionada] = useState(hoyStr)
  const [entradaActiva, setEntradaActiva]         = useState(() => entradaPorFecha(hoyStr) || null)
  const [pantallaDiario, setPantallaDiario]       = useState('ver') // 'ver' | 'editarDatos' | 'editarEntrenamiento'

  // — Subsección Calendario —
  const [mesVisualizado, setMesVisualizado]   = useState(hoy.getMonth())
  const [anioVisualizado, setAnioVisualizado] = useState(hoy.getFullYear())

  // — Cambio de sección vía selector —
  function cambiarSeccion(id) {
    setSeccion(id)
    if (id === 'diario') setPantallaDiario('ver')
  }

  // — Navegación de mes —
  function handleCambiarMes(delta) {
    setMesVisualizado(prev => {
      const nuevoMes = prev + delta
      if (nuevoMes < 0)  { setAnioVisualizado(a => a - 1); return 11 }
      if (nuevoMes > 11) { setAnioVisualizado(a => a + 1); return 0  }
      return nuevoMes
    })
  }

  // — Seleccionar día desde el calendario → ir a subsección Diario —
  function handleSeleccionarDia(fecha) {
    setFechaSeleccionada(fecha)
    setEntradaActiva(entradaPorFecha(fecha) || null)
    setPantallaDiario('ver')
    setSeccion('diario')
  }

  // — Click en entrenamiento de la lista → ir directo a editar —
  function handleSeleccionarEntrenamiento(fecha) {
    setFechaSeleccionada(fecha)
    setEntradaActiva(entradaPorFecha(fecha) || null)
    setPantallaDiario('editarEntrenamiento')
    setSeccion('diario')
  }

  // — Navegar día anterior / siguiente —
  function handleCambiarDia(delta) {
    const [anio, mes, dia] = fechaSeleccionada.split('-').map(Number)
    const d = new Date(anio, mes - 1, dia + delta)
    const nuevaFecha = toFechaStr(d)
    setFechaSeleccionada(nuevaFecha)
    setEntradaActiva(entradaPorFecha(nuevaFecha) || null)
  }

  // — Navegar a fecha absoluta (desde modal calendario) —
  function handleIrAFecha(fecha) {
    setFechaSeleccionada(fecha)
    setEntradaActiva(entradaPorFecha(fecha) || null)
  }

  // — Guardar datos generales —
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
    setPantallaDiario('ver')
  }

  // — Guardar entrenamiento —
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
    setPantallaDiario('ver')
  }

  const entradasMes = entradasDelMes(anioVisualizado, mesVisualizado)
  const mbEfectivo  = mbEfectivoPorFecha(fechaSeleccionada)

  const selector = (
    <SelectorSeccion
      opciones={OPCIONES_SECCION}
      activa={seccion}
      onChange={cambiarSeccion}
    />
  )

  return (
    <div className="contenido-principal">

      {/* — Subsección: Diario — */}
      {seccion === 'diario' && !cargando && pantallaDiario === 'ver' && (
        <DetalleEntrenamiento
          fecha={fechaSeleccionada}
          entrada={entradaActiva}
          ejercicios={ejercicios}
          sesiones={sesiones}
          registrosPorEjercicio={registrosPorEjercicio}
          mbEfectivo={mbEfectivo}
          tituloDropdown={selector}
          onEditarDatos={() => setPantallaDiario('editarDatos')}
          onEditarEntrenamiento={() => setPantallaDiario('editarEntrenamiento')}
          onCambiarDia={handleCambiarDia}
          onIrAFecha={handleIrAFecha}
          onIrAMedidas={() => cambiarSeccion('medidas')}
        />
      )}

      {seccion === 'diario' && pantallaDiario === 'editarDatos' && (
        <FormularioDatosGenerales
          fecha={fechaSeleccionada}
          entrada={entradaActiva}
          mbHeredado={mbEfectivo}
          onGuardar={handleGuardarDatos}
          onCancelar={() => setPantallaDiario('ver')}
        />
      )}

      {seccion === 'diario' && pantallaDiario === 'editarEntrenamiento' && (
        <FormularioEntrenamiento
          fecha={fechaSeleccionada}
          entrada={entradaActiva}
          ejercicios={ejercicios}
          sesiones={sesiones}
          ultimoPorEjercicio={ultimoPorEjercicio}
          onGuardar={handleGuardarEntrenamiento}
          onCancelar={() => setPantallaDiario('ver')}
        />
      )}

      {/* — Subsección: Medidas Corporales — */}
      {seccion === 'medidas' && (
        <MedidasCorporales tituloDropdown={selector} />
      )}

      {/* — Subsección: Calendario — */}
      {seccion === 'calendario' && !cargando && (
        <CalendarioDiario
          entradasDelMes={entradasMes}
          todasEntradas={entradas}
          mesVisualizado={mesVisualizado}
          anioVisualizado={anioVisualizado}
          onCambiarMes={handleCambiarMes}
          onSeleccionarDia={handleSeleccionarDia}
          onSeleccionarEntrenamiento={handleSeleccionarEntrenamiento}
          sesiones={sesiones}
          tituloDropdown={selector}
        />
      )}

    </div>
  )
}
