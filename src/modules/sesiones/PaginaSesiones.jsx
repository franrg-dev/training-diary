import { useState } from 'react'
import { useSesiones }    from './useSesiones'
import { useEjercicios }  from '../ejercicios/useEjercicios'
import ListaSesiones      from './ListaSesiones'
import DetalleSesion      from './DetalleSesion'
import FormularioSesion   from './FormularioSesion'

/**
 * Módulo Sesiones — Controlador de navegación interna.
 * Flujo: Lista → Detalle → Formulario (editar) | Lista → Formulario (nuevo)
 */
export default function PaginaSesiones({ embebido = false, tituloDropdown = null }) {
  const { sesiones, cargando, crear, actualizar, eliminar } = useSesiones()
  const { ejercicios } = useEjercicios()

  const [pantalla, setPantalla]         = useState('lista')
  const [sesionActiva, setSesionActiva] = useState(null)
  const [modoFormulario, setModoFormulario] = useState('nuevo')

  function irADetalle(s)          { setSesionActiva(s); setPantalla('detalle') }
  function irAFormularioNuevo()   { setSesionActiva(null); setModoFormulario('nuevo'); setPantalla('formulario') }
  function irAFormularioEditar()  { setModoFormulario('editar'); setPantalla('formulario') }
  function irALista()             { setPantalla('lista'); setSesionActiva(null) }

  async function handleGuardar(datos) {
    if (modoFormulario === 'nuevo') {
      await crear(datos)
    } else {
      await actualizar(sesionActiva.id, datos)
      setSesionActiva(prev => ({ ...prev, ...datos }))
    }
    irALista()
  }

  async function handleEliminar() {
    await eliminar(sesionActiva.id)
    irALista()
  }

  const contenido = (
    <>
      {pantalla === 'lista' && (
        <ListaSesiones
          sesiones={sesiones}
          cargando={cargando}
          ejercicios={ejercicios}
          onSeleccionar={irADetalle}
          onNuevo={irAFormularioNuevo}
          tituloDropdown={tituloDropdown}
        />
      )}

      {pantalla === 'detalle' && sesionActiva && (
        <DetalleSesion
          sesion={sesionActiva}
          ejercicios={ejercicios}
          onEditar={irAFormularioEditar}
          onEliminar={handleEliminar}
          onVolver={irALista}
        />
      )}

      {pantalla === 'formulario' && (
        <FormularioSesion
          sesion={modoFormulario === 'editar' ? sesionActiva : null}
          ejercicios={ejercicios}
          onGuardar={handleGuardar}
          onCancelar={modoFormulario === 'editar' ? () => setPantalla('detalle') : irALista}
        />
      )}
    </>
  )

  return embebido ? contenido : <div className="contenido-principal">{contenido}</div>
}
