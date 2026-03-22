import { useState, useCallback } from 'react'
import { HashRouter as BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import NavBar             from './components/NavBar'
import PaginaHubEjercicios from './modules/ejercicios/PaginaHubEjercicios'
import PaginaSesiones     from './modules/sesiones/PaginaSesiones'
import PaginaDiario       from './modules/diario/PaginaDiario'
import PaginaRegistro     from './modules/registro/PaginaRegistro'
import PaginaNutricion    from './modules/nutricion/PaginaNutricion'
import PaginaSuplementos  from './modules/suplementos/PaginaSuplementos'
import PaginaAjustes      from './modules/ajustes/PaginaAjustes'
import { NavResetContext } from './context/NavResetContext'

/**
 * Componente raíz de la app.
 * Configura el router y la estructura de navegación:
 *   - Las rutas hijas comparten el layout con la NavBar inferior fija.
 *   - La ruta raíz "/" redirige automáticamente a "/diario".
 *   - NavResetContext permite al NavBar forzar el remonte de una sección
 *     (cancelando cualquier edición en curso) al pulsar su icono.
 */
export default function App() {
  const [claves, setClaves] = useState({})

  const resetSeccion = useCallback((ruta) => {
    setClaves(prev => ({ ...prev, [ruta]: (prev[ruta] || 0) + 1 }))
  }, [])

  function k(ruta) { return claves[ruta] || 0 }

  return (
    <NavResetContext.Provider value={{ resetSeccion }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/diario" replace />} />

          <Route path="/ejercicios"  element={<PaginaHubEjercicios key={k('/ejercicios')}  />} />
          <Route path="/sesiones"    element={<PaginaSesiones      key={k('/sesiones')}    />} />
          <Route path="/registro"    element={<PaginaRegistro      key={k('/registro')}    />} />
          <Route path="/diario"      element={<PaginaDiario        key={k('/diario')}      />} />
          <Route path="/nutricion"   element={<PaginaNutricion     key={k('/nutricion')}   />} />
          <Route path="/suplementos" element={<PaginaSuplementos   key={k('/suplementos')} />} />
          <Route path="/ajustes"     element={<PaginaAjustes       key={k('/ajustes')}     />} />

          <Route path="*" element={<Navigate to="/diario" replace />} />
        </Routes>

        <NavBar />
      </BrowserRouter>
    </NavResetContext.Provider>
  )
}
