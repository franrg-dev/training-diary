import { useState, useEffect } from 'react'
import SelectorSeccion      from '../../components/SelectorSeccion'
import { useHabitos }           from './useHabitos'
import { useEtiquetasHabito }   from './useEtiquetasHabito'
import { useCompletadosHabito } from './useCompletadosHabito'
import { hoyISO }               from './habitosUtils'
import HabitosDia       from './HabitosDia'
import ListaHabitos     from './ListaHabitos'
import DetalleHabito    from './DetalleHabito'
import FormularioHabito from './FormularioHabito'
import ListaEtiquetas   from './ListaEtiquetas'
import FormularioEtiqueta from './FormularioEtiqueta'

const OPCIONES_SECCION = [
  { id: 'hoy',      label: 'Hoy'      },
  { id: 'habitos',  label: 'Hábitos'  },
  { id: 'etiquetas', label: 'Etiquetas' },
]

/**
 * Hub principal del módulo Hábitos.
 * Gestiona toda la navegación y estado de sus tres secciones.
 */
export default function PaginaHabitos() {
  // — Hooks de datos —
  const { habitos,   cargando: cargandoH,  crear: crearH,  actualizar: actualizarH, eliminar: eliminarH  } = useHabitos()
  const { etiquetas, cargando: cargandoE,  crear: crearE,  actualizar: actualizarE, eliminar: eliminarE  } = useEtiquetasHabito()
  const {
    cargarParaFecha, toggleCompletado, toggleSubhabito,
    estaCompletado, subhabitosCompletadosDeHabito, puedeMarcarsePrincipal,
  } = useCompletadosHabito()

  // — Sección activa —
  const [seccion, setSeccion] = useState('hoy')

  // — Fecha del día visualizado (sección Hoy) —
  const [fechaSeleccionada, setFechaSeleccionada] = useState(hoyISO)

  // Recargar completados cada vez que cambia la fecha o la sección hoy
  useEffect(() => {
    if (seccion === 'hoy') {
      cargarParaFecha(fechaSeleccionada)
    }
  }, [fechaSeleccionada, seccion, cargarParaFecha])

  // — Navegación hábitos —
  const [pantallaH,  setPantallaH]  = useState('lista') // 'lista' | 'detalle' | 'formulario'
  const [habitoActivo, setHabitoActivo] = useState(null)
  const [modoH, setModoH] = useState('nuevo') // 'nuevo' | 'editar'

  // — Navegación etiquetas —
  const [pantallaE, setPantallaE] = useState('lista') // 'lista' | 'formulario'
  const [etiquetaActiva, setEtiquetaActiva] = useState(null)
  const [modoE, setModoE] = useState('nuevo') // 'nuevo' | 'editar'

  // — Cambio de sección —
  function cambiarSeccion(id) {
    setSeccion(id)
    // Resetear sub-navegaciones al cambiar de sección
    setPantallaH('lista')
    setPantallaE('lista')
  }

  // — Operaciones hábitos —
  async function handleGuardarHabito(datos) {
    if (modoH === 'nuevo') {
      await crearH(datos)
      setPantallaH('lista')
    } else {
      await actualizarH(habitoActivo.id, datos)
      setHabitoActivo(prev => ({ ...prev, ...datos }))
      setPantallaH('detalle')
    }
  }

  async function handleEliminarHabito() {
    await eliminarH(habitoActivo.id)
    setPantallaH('lista')
    setHabitoActivo(null)
  }

  // — Operaciones etiquetas —
  async function handleGuardarEtiqueta(datos) {
    if (modoE === 'nuevo') {
      await crearE(datos)
    } else {
      await actualizarE(etiquetaActiva.id, datos)
    }
    setPantallaE('lista')
    setEtiquetaActiva(null)
  }

  async function handleEliminarEtiqueta(id) {
    await eliminarE(id)
  }

  // — SelectorSeccion (dropdown) —
  const selector = (
    <SelectorSeccion
      opciones={OPCIONES_SECCION}
      activa={seccion}
      onChange={cambiarSeccion}
    />
  )

  // — Render por sección —

  if (seccion === 'hoy') {
    return (
      <div className="contenido-principal">
        <HabitosDia
          habitos={habitos}
          etiquetas={etiquetas}
          fecha={fechaSeleccionada}
          onCambiarFecha={(iso) => setFechaSeleccionada(iso)}
          tituloDropdown={selector}
          toggleCompletado={toggleCompletado}
          estaCompletado={estaCompletado}
          subhabitosCompletadosDeHabito={subhabitosCompletadosDeHabito}
          onToggleSubhabito={toggleSubhabito}
          puedeMarcarsePrincipal={puedeMarcarsePrincipal}
        />
      </div>
    )
  }

  if (seccion === 'habitos') {
    if (pantallaH === 'lista') {
      return (
        <div className="contenido-principal">
          <ListaHabitos
            habitos={habitos}
            etiquetas={etiquetas}
            cargando={cargandoH}
            onSeleccionar={(h) => { setHabitoActivo(h); setPantallaH('detalle') }}
            onNuevo={() => { setHabitoActivo(null); setModoH('nuevo'); setPantallaH('formulario') }}
            tituloDropdown={selector}
          />
        </div>
      )
    }
    if (pantallaH === 'detalle' && habitoActivo) {
      return (
        <div className="contenido-principal">
          <DetalleHabito
            habito={habitoActivo}
            etiquetas={etiquetas}
            onEditar={() => { setModoH('editar'); setPantallaH('formulario') }}
            onEliminar={handleEliminarHabito}
            onVolver={() => { setPantallaH('lista'); setHabitoActivo(null) }}
          />
        </div>
      )
    }
    if (pantallaH === 'formulario') {
      return (
        <div className="contenido-principal">
          <FormularioHabito
            habito={modoH === 'editar' ? habitoActivo : null}
            etiquetas={etiquetas}
            onGuardar={handleGuardarHabito}
            onCancelar={() => setPantallaH(modoH === 'editar' ? 'detalle' : 'lista')}
          />
        </div>
      )
    }
  }

  if (seccion === 'etiquetas') {
    if (pantallaE === 'lista') {
      return (
        <div className="contenido-principal">
          <ListaEtiquetas
            etiquetas={etiquetas}
            habitos={habitos}
            cargando={cargandoE}
            onNueva={() => { setEtiquetaActiva(null); setModoE('nuevo'); setPantallaE('formulario') }}
            onEditar={(e) => { setEtiquetaActiva(e); setModoE('editar'); setPantallaE('formulario') }}
            tituloDropdown={selector}
          />
        </div>
      )
    }
    if (pantallaE === 'formulario') {
      return (
        <div className="contenido-principal">
          <FormularioEtiqueta
            etiqueta={modoE === 'editar' ? etiquetaActiva : null}
            onGuardar={handleGuardarEtiqueta}
            onCancelar={() => { setPantallaE('lista'); setEtiquetaActiva(null) }}
          />
        </div>
      )
    }
  }

  return null
}
