import { useState, useMemo } from 'react'
import { COLORES_GRUPO } from '../ejercicios/coloresGrupo'
import { IconoEjercicio } from '../ejercicios/iconosEjercicio'

const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function formatearFechaCorta(fechaStr) {
  const [anio, mes, dia] = fechaStr.split('-').map(Number)
  return `${dia} ${MESES_CORTOS[mes - 1]} ${anio}`
}

/**
 * Lista de ejercicios del catálogo con su último peso registrado.
 * Ejercicios con datos aparecen primero ordenados por fecha desc.
 */
export default function ListaRegistro({ ejercicios, registros, onSeleccionar, tituloDropdown = null }) {
  const [busqueda, setBusqueda] = useState('')

  // Último registro por ejercicioId
  const ultimosPorEjercicio = useMemo(() => {
    const mapa = {}
    for (const r of registros) {
      if (!mapa[r.ejercicioId] || r.fecha > mapa[r.ejercicioId].fecha) {
        mapa[r.ejercicioId] = r
      }
    }
    return mapa
  }, [registros])

  // Filtrar por búsqueda
  const ejerciciosFiltrados = useMemo(() =>
    ejercicios.filter(ej => ej.nombre.toLowerCase().includes(busqueda.toLowerCase())),
    [ejercicios, busqueda]
  )

  // Ordenar: con datos primero (desc por fecha), luego sin datos
  const ejerciciosOrdenados = useMemo(() => {
    const conDatos = ejerciciosFiltrados.filter(ej => ultimosPorEjercicio[ej.id])
    const sinDatos = ejerciciosFiltrados.filter(ej => !ultimosPorEjercicio[ej.id])
    conDatos.sort((a, b) => {
      const fa = ultimosPorEjercicio[a.id]?.fecha || ''
      const fb = ultimosPorEjercicio[b.id]?.fecha || ''
      return fb.localeCompare(fa)
    })
    return [...conDatos, ...sinDatos]
  }, [ejerciciosFiltrados, ultimosPorEjercicio])

  return (
    <div>
      {/* — Cabecera — */}
      <div style={{ padding: '20px 16px 0' }}>
        {tituloDropdown ?? (
          <h1 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 2px', color: '#f5f5f5' }}>Registro</h1>
        )}
        <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>Historial de progreso por ejercicio</p>
      </div>

      {/* — Buscador — */}
      <div style={{ padding: '14px 16px 0', position: 'relative' }}>
        <svg
          style={{ position: 'absolute', left: '28px', top: '50%', transform: 'translateY(-18%)', color: '#6b7280' }}
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="search"
          placeholder="Buscar ejercicio…"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{ width: '100%', padding: '10px 12px 10px 36px', backgroundColor: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: '10px', color: '#f5f5f5', fontSize: '15px', outline: 'none' }}
        />
        {busqueda && (
          <button
            onClick={() => setBusqueda('')}
            style={{ position: 'absolute', right: '28px', top: '50%', transform: 'translateY(-18%)', background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '18px', padding: 0 }}
          >×</button>
        )}
      </div>

      {/* — Lista — */}
      <div style={{ padding: '14px 16px 0' }}>
        {ejerciciosOrdenados.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '60px', color: '#6b7280' }}>
            <p style={{ fontSize: '40px', margin: '0 0 12px' }}>{busqueda ? '🔍' : '📊'}</p>
            <p style={{ margin: '0 0 4px', fontWeight: '600', color: '#a1a1a1' }}>
              {busqueda ? 'Sin resultados' : 'Sin ejercicios en el catálogo'}
            </p>
            <p style={{ margin: 0, fontSize: '14px' }}>
              {busqueda ? 'Prueba con otro término' : 'Añade ejercicios primero'}
            </p>
          </div>
        ) : (
          ejerciciosOrdenados.map(ej => {
            const ultimo  = ultimosPorEjercicio[ej.id]
            const colores = COLORES_GRUPO[ej.grupoPrincipal || (ej.gruposMuscular || [])[0]] || COLORES_GRUPO.core
            const esCardio = (ej.gruposMuscular || []).includes('cardio')
            return (
              <button
                key={ej.id}
                onClick={() => onSeleccionar(ej)}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '14px', marginBottom: '8px', backgroundColor: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: '12px', cursor: 'pointer', textAlign: 'left' }}
              >
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: colores.bg, border: `1px solid ${colores.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <IconoEjercicio grupos={ej.gruposMuscular} grupoPrincipal={ej.grupoPrincipal} size={20} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: '0 0 3px', fontWeight: '600', color: '#f5f5f5', fontSize: '15px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ej.nombre}
                  </p>
                  {ultimo ? (
                    <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                      {esCardio ? (
                        <>
                          {ultimo.duracion && <span style={{ color: '#f97316', fontWeight: '600' }}>{ultimo.duracion} min </span>}
                          {ultimo.ritmo    && <span style={{ color: '#f97316', fontWeight: '600' }}>{ultimo.ritmo} {ultimo.modo === 'veces' ? 'Rp/m' : 'Km/h'} </span>}
                          {ultimo.volumen  && <span style={{ color: '#f97316', fontWeight: '600' }}>{ultimo.volumen} {ultimo.modo === 'veces' ? 'Rp' : 'Km'} </span>}
                          · {formatearFechaCorta(ultimo.fecha)}
                        </>
                      ) : (
                        <>
                          <span style={{ color: '#f97316', fontWeight: '600' }}>{ultimo.peso} {ultimo.unidad}</span>
                          {' · '}{formatearFechaCorta(ultimo.fecha)}
                        </>
                      )}
                    </p>
                  ) : (
                    <p style={{ margin: 0, fontSize: '13px', color: '#4b5563' }}>Sin datos</p>
                  )}
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2e2e2e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
