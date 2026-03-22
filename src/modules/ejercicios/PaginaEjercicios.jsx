import { useState } from 'react'
import { useEjercicios } from './useEjercicios'
import ListaEjercicios    from './ListaEjercicios'
import DetalleEjercicio   from './DetalleEjercicio'
import FormularioEjercicio from './FormularioEjercicio'

/**
 * Módulo de Ejercicios — Controlador de navegación interna.
 *
 * Gestiona la vista activa (lista / detalle / formulario) y pasa
 * los callbacks de CRUD a los subcomponentes correspondientes.
 *
 * Flujo de navegación:
 *   Lista ──→ [tap ejercicio] ──→ Detalle ──→ [editar] ──→ Formulario (editar)
 *   Lista ──→ [botón +]       ──→ Formulario (nuevo)
 *   Formulario / Detalle ──→ [cancelar/volver] ──→ Lista
 */
export default function PaginaEjercicios({ embebido = false, tituloDropdown = null }) {
  const { ejercicios, cargando, crear, actualizar, eliminar } = useEjercicios()

  // pantalla: 'lista' | 'detalle' | 'formulario'
  const [pantalla, setPantalla]               = useState('lista')
  const [ejercicioActivo, setEjercicioActivo] = useState(null)
  const [modoFormulario, setModoFormulario]   = useState('nuevo') // 'nuevo' | 'editar'

  // — Navegación —

  function irADetalle(ej) {
    setEjercicioActivo(ej)
    setPantalla('detalle')
  }

  function irAFormularioNuevo() {
    setEjercicioActivo(null)
    setModoFormulario('nuevo')
    setPantalla('formulario')
  }

  function irAFormularioEditar() {
    setModoFormulario('editar')
    setPantalla('formulario')
  }

  function irALista() {
    setPantalla('lista')
    setEjercicioActivo(null)
  }

  // — Operaciones CRUD —

  async function handleGuardar(datos) {
    if (modoFormulario === 'nuevo') {
      await crear(datos)
      irALista()
    } else {
      await actualizar(ejercicioActivo.id, datos)
      // Actualizar la copia local para que el detalle la refleje
      setEjercicioActivo(prev => ({ ...prev, ...datos }))
      irALista()
    }
  }

  async function handleEliminar() {
    await eliminar(ejercicioActivo.id)
    irALista()
  }

  // — Sustitutos resueltos para la vista de detalle —
  const sustitutosResueltos = ejercicioActivo
    ? ejercicios.filter(ej => (ejercicioActivo.sustitutos || []).includes(ej.id))
    : []

  const contenido = (
    <>
      {pantalla === 'lista' && (
        <ListaEjercicios
          ejercicios={ejercicios}
          cargando={cargando}
          onSeleccionar={irADetalle}
          onNuevo={irAFormularioNuevo}
          tituloDropdown={tituloDropdown}
        />
      )}

      {pantalla === 'detalle' && ejercicioActivo && (
        <DetalleEjercicio
          ejercicio={ejercicioActivo}
          sustitutos={sustitutosResueltos}
          onEditar={irAFormularioEditar}
          onEliminar={handleEliminar}
          onVolver={irALista}
        />
      )}

      {pantalla === 'formulario' && (
        <FormularioEjercicio
          ejercicio={modoFormulario === 'editar' ? ejercicioActivo : null}
          todosEjercicios={ejercicios}
          onGuardar={handleGuardar}
          onCancelar={modoFormulario === 'editar' ? () => setPantalla('detalle') : irALista}
        />
      )}
    </>
  )

  return embebido ? contenido : <div className="contenido-principal">{contenido}</div>
}
