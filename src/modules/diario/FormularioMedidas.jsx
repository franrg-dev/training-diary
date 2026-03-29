import { useState } from 'react'
import { CAMPOS_MEDIDAS } from './useMedidas'

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

export default function FormularioMedidas({ anio, mes, medidaExistente, medidaAnterior, onGuardar, onCancelar }) {
  const inicial = {}
  for (const campo of CAMPOS_MEDIDAS) {
    const v = medidaExistente?.[campo.id] ?? medidaAnterior?.[campo.id]
    inicial[campo.id] = v ? String(v) : ''
  }
  const [valores, setValores] = useState(inicial)

  function handleChange(id, raw) {
    // Acepta coma o punto como separador decimal (normaliza a punto)
    const normalizado = raw.replace(',', '.')
    const limpio = normalizado.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
    setValores(prev => ({ ...prev, [id]: limpio }))
  }

  function handleGuardar() {
    onGuardar(valores)
  }

  return (
    <div style={{ padding: '0 16px 32px' }}>
      {/* Cabecera */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0 20px' }}>
        <button
          onClick={onCancelar}
          style={{ background: 'none', border: 'none', color: '#f97316', fontSize: '15px', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Medidas
        </button>
        <p style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'var(--color-texto)' }}>
          {MESES[mes]} {anio}
        </p>
        <div style={{ width: '60px' }} />
      </div>

      {/* Campos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {CAMPOS_MEDIDAS.map(campo => (
          <div
            key={campo.id}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--color-superficie)', borderRadius: '14px', padding: '14px 16px' }}
          >
            <label style={{ fontSize: '15px', fontWeight: '600', color: 'var(--color-texto)' }}>
              {campo.label}
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="text"
                inputMode="decimal"
                placeholder="—"
                value={valores[campo.id]}
                onChange={e => handleChange(campo.id, e.target.value)}
                style={{
                  width: '80px',
                  padding: '8px 10px',
                  backgroundColor: 'var(--color-fondo)',
                  border: '1px solid var(--color-borde)',
                  borderRadius: '10px',
                  color: valores[campo.id] ? '#f97316' : 'var(--color-texto-secundario)',
                  fontSize: '16px',
                  fontWeight: '700',
                  textAlign: 'right',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
              <span style={{ fontSize: '13px', color: 'var(--color-texto-secundario)', minWidth: '20px' }}>cm</span>
            </div>
          </div>
        ))}
      </div>

      {/* Botones */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
        <button
          onClick={onCancelar}
          style={{ flex: 1, padding: '14px', backgroundColor: 'transparent', border: '1px solid var(--color-borde)', borderRadius: '14px', color: 'var(--color-texto-secundario)', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}
        >
          Cancelar
        </button>
        <button
          onClick={handleGuardar}
          style={{ flex: 2, padding: '14px', backgroundColor: '#f97316', border: 'none', borderRadius: '14px', color: '#fff', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}
        >
          Guardar
        </button>
      </div>
    </div>
  )
}
