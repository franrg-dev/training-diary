import { HashRouter as BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import NavBar from './components/NavBar'
import PanelSync from './components/PanelSync'
import PaginaEjercicios from './modules/ejercicios/PaginaEjercicios'
import PaginaSesiones from './modules/sesiones/PaginaSesiones'
import PaginaDiario from './modules/diario/PaginaDiario'
import PaginaRegistro from './modules/registro/PaginaRegistro'

/**
 * Componente raíz de la app.
 * Configura el router y la estructura de navegación:
 *   - Las rutas hijas comparten el layout con la NavBar inferior fija.
 *   - La ruta raíz "/" redirige automáticamente a "/diario".
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta raíz: redirige al diario por defecto */}
        <Route path="/" element={<Navigate to="/diario" replace />} />

        {/* Secciones principales */}
        <Route path="/ejercicios" element={<PaginaEjercicios />} />
        <Route path="/sesiones" element={<PaginaSesiones />} />
        <Route path="/diario" element={<PaginaDiario />} />
        <Route path="/registro" element={<PaginaRegistro />} />

        {/* Cualquier ruta desconocida vuelve al diario */}
        <Route path="*" element={<Navigate to="/diario" replace />} />
      </Routes>

      {/* Barra de navegación inferior compartida por todas las secciones */}
      <NavBar />

      {/* Botón flotante de sincronización con Dexie Cloud */}
      <PanelSync />
    </BrowserRouter>
  )
}
