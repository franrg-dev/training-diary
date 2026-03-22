import { useState } from 'react'
import PaginaEjercicios  from './PaginaEjercicios'
import PaginaSesiones    from '../sesiones/PaginaSesiones'
import PaginaRegistro    from '../registro/PaginaRegistro'
import SelectorSeccion   from '../../components/SelectorSeccion'

const OPCIONES = [
  { id: 'ejercicios', label: 'Ejercicios' },
  { id: 'sesiones',   label: 'Sesiones'   },
  { id: 'registro',   label: 'Registro'   },
]

/**
 * Hub que unifica Ejercicios, Sesiones y Registro bajo una sola sección
 * del menú inferior. El título es un desplegable para cambiar de subsección.
 */
export default function PaginaHubEjercicios() {
  const [seccion, setSeccion] = useState('ejercicios')

  const selector = <SelectorSeccion opciones={OPCIONES} activa={seccion} onChange={setSeccion} />

  return (
    <div className="contenido-principal">
      {seccion === 'ejercicios' && (
        <PaginaEjercicios embebido tituloDropdown={selector} />
      )}
      {seccion === 'sesiones' && (
        <PaginaSesiones embebido tituloDropdown={selector} />
      )}
      {seccion === 'registro' && (
        <PaginaRegistro embebido tituloDropdown={selector} />
      )}
    </div>
  )
}
