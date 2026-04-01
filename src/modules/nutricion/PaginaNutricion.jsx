import { useState } from 'react'
import SelectorSeccion from '../../components/SelectorSeccion'
import NutricionDia     from './NutricionDia'
import NutricionComidas from './NutricionComidas'

const OPCIONES_SECCION = [
  { id: 'dia',     label: 'Día'     },
  { id: 'comidas', label: 'Comidas' },
]

export default function PaginaNutricion() {
  const [seccion, setSeccion] = useState('dia')

  const selector = (
    <SelectorSeccion
      opciones={OPCIONES_SECCION}
      activa={seccion}
      onChange={setSeccion}
    />
  )

  if (seccion === 'dia') {
    return (
      <div className="contenido-principal">
        <NutricionDia tituloDropdown={selector} />
      </div>
    )
  }

  if (seccion === 'comidas') {
    return (
      <div className="contenido-principal">
        <NutricionComidas tituloDropdown={selector} />
      </div>
    )
  }

  return null
}
