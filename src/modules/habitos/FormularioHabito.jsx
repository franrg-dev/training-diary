import { useState, useEffect, useMemo } from 'react'
import { TIPOS_HABITO } from './tiposHabito'
import IconoTipo from './IconoTipo'
import ModalCalendario from './ModalCalendario'
import { hoyISO, esDiaValidoRepeticion, snapAlDiaValido } from './habitosUtils'

const DIAS_SEMANA_LABELS  = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

/**
 * Formulario crear/editar hábito.
 * Props:
 *   habito      — null para crear, objeto para editar
 *   etiquetas   — array de etiquetas disponibles
 *   onGuardar(datos)
 *   onCancelar
 */
export default function FormularioHabito({ habito = null, etiquetas, onGuardar, onCancelar }) {
  const [tipo,               setTipo]               = useState(habito?.tipo               || 'otros')
  const [titulo,             setTitulo]             = useState(habito?.titulo              || '')
  const [descripcion,        setDescripcion]        = useState(habito?.descripcion         || '')
  const [etiquetasSel,       setEtiquetasSel]       = useState(habito?.etiquetas           || [])
  const [repeticionTipo,     setRepeticionTipo]     = useState(habito?.repeticion?.tipo    || 'ninguna')
  const [diasSemana,         setDiasSemana]         = useState(habito?.repeticion?.diasSemana || [])
  const [diasMes,            setDiasMes]            = useState(habito?.repeticion?.diasMes   || [])
  const [finTipo,            setFinTipo]            = useState(habito?.repeticion?.finTipo   || 'nunca')
  const [finFecha,           setFinFecha]           = useState(habito?.repeticion?.finFecha  || '')
  const [finVeces,           setFinVeces]           = useState(habito?.repeticion?.finVeces  || 1)
  const [fechaInicio,        setFechaInicio]        = useState(habito?.fechaInicio           || hoyISO())
  const [subhabitos,         setSubhabitos]         = useState(habito?.subhabitos || [])
  const [inputSubhabito,     setInputSubhabito]     = useState('')
  const [modalFechaInicio,   setModalFechaInicio]   = useState(false)
  const [modalFinFecha,      setModalFinFecha]      = useState(false)

  const repeticion = useMemo(() => ({
    tipo:       repeticionTipo,
    diasSemana: repeticionTipo === 'semanal'  ? diasSemana : undefined,
    diasMes:    repeticionTipo === 'mensual'  ? diasMes    : undefined,
    finTipo:    repeticionTipo !== 'ninguna'  ? finTipo    : 'nunca',
    finFecha:   finTipo === 'fecha'           ? finFecha   : undefined,
    finVeces:   finTipo === 'veces'           ? finVeces   : undefined,
  }), [repeticionTipo, diasSemana, diasMes, finTipo, finFecha, finVeces])

  // Auto-snap fechaInicio al cambiar configuración de repetición
  useEffect(() => {
    const nueva = snapAlDiaValido(repeticion, fechaInicio)
    if (nueva !== fechaInicio) setFechaInicio(nueva)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repeticionTipo, diasSemana, diasMes])

  function toggleDiaSemana(dia) {
    setDiasSemana(prev =>
      prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia]
    )
  }

  function toggleDiaMes(dia) {
    setDiasMes(prev =>
      prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia]
    )
  }

  function toggleEtiqueta(id) {
    setEtiquetasSel(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    )
  }

  function agregarSubhabito() {
    const texto = inputSubhabito.trim()
    if (!texto) return
    setSubhabitos(prev => [...prev, { id: crypto.randomUUID(), texto, obligatorio: false }])
    setInputSubhabito('')
  }

  function toggleObligatorio(id) {
    setSubhabitos(prev => {
      const nuevo = prev.map(s => s.id === id ? { ...s, obligatorio: !s.obligatorio } : s)
      if (nuevo.some(s => s.obligatorio)) setSubhabitosMinimo(0)
      return nuevo
    })
  }

  function eliminarSubhabito(id) {
    setSubhabitos(prev => prev.filter(s => s.id !== id))
  }

  function esDiaValido(fechaISO) {
    return esDiaValidoRepeticion(repeticion, fechaISO)
  }

  const mesInicioModal  = useMemo(() => parseInt(fechaInicio.split('-')[1], 10) - 1, [fechaInicio, modalFechaInicio]) // eslint-disable-line
  const anioInicioModal = useMemo(() => parseInt(fechaInicio.split('-')[0], 10),     [fechaInicio, modalFechaInicio]) // eslint-disable-line

  const [subhabitosMinimo, setSubhabitosMinimo] = useState(habito?.subhabitosMinimo || 0)
  const [guardando, setGuardando] = useState(false)
  const [errorGuardar, setErrorGuardar] = useState(null)

  const valido = titulo.trim().length > 0 && titulo.trim().length <= 50 &&
    (repeticionTipo !== 'semanal' || diasSemana.length > 0) &&
    (repeticionTipo !== 'mensual' || diasMes.length > 0)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!valido || guardando) return
    setGuardando(true)
    setErrorGuardar(null)
    try {
      await onGuardar({
        tipo,
        titulo:            titulo.trim(),
        descripcion:       descripcion.trim(),
        etiquetas:         etiquetasSel,
        fechaInicio,
        repeticion,
        subhabitos,
        subhabitosMinimo:  subhabitos.length > 0 ? subhabitosMinimo : 0,
      })
    } catch (err) {
      setErrorGuardar(err?.message || 'Error al guardar el hábito')
      setGuardando(false)
    }
  }

  return (
    <div style={{ padding: '20px 16px' }}>
      {/* Cabecera */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
        <button onClick={onCancelar} style={estiloBotonVolver} aria-label="Cancelar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: 'var(--color-texto)' }}>
          {habito ? 'Editar hábito' : 'Nuevo hábito'}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>

        {/* 1 — TIPO */}
        <SeccionLabel>Tipo</SeccionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '24px' }}>
          {TIPOS_HABITO.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTipo(t.id)}
              style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: '6px',
                padding: '10px 4px',
                borderRadius: '12px',
                backgroundColor: tipo === t.id ? t.color + '22' : 'var(--color-superficie)',
                border: `1px solid ${tipo === t.id ? t.color : 'var(--color-borde)'}`,
                cursor: 'pointer',
                transition: 'border-color 0.15s, background-color 0.15s',
              }}
            >
              <IconoTipo tipo={t.id} size={20} color={tipo === t.id ? t.color : 'var(--color-texto-secundario)'} />
              <span style={{
                fontSize: '10px', fontWeight: tipo === t.id ? '700' : '400',
                color: tipo === t.id ? t.color : 'var(--color-texto-secundario)',
                textAlign: 'center', lineHeight: 1.2,
              }}>
                {t.label}
              </span>
            </button>
          ))}
        </div>

        {/* 2 — TÍTULO */}
        <SeccionLabel>Título *</SeccionLabel>
        <div style={{ position: 'relative', marginBottom: '24px' }}>
          <input
            type="text"
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            placeholder="Nombre del hábito"
            maxLength={50}
            style={{
              ...estiloInput,
              borderColor: titulo.length > 50 ? '#ef4444' : 'var(--color-borde)',
              paddingRight: '56px',
            }}
            autoFocus
          />
          <span style={{
            position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
            fontSize: '12px', color: titulo.length > 45 ? '#ef4444' : 'var(--color-texto-secundario)',
          }}>
            {titulo.length}/50
          </span>
        </div>

        {/* 3 — DESCRIPCIÓN */}
        <SeccionLabel>Descripción (opcional)</SeccionLabel>
        <textarea
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          placeholder="Notas o descripción…"
          rows={2}
          style={{ ...estiloInput, resize: 'none', marginBottom: '24px', lineHeight: '1.5' }}
        />

        {/* 4 — ETIQUETAS */}
        {etiquetas.length > 0 && (
          <>
            <SeccionLabel>Etiquetas</SeccionLabel>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
              {etiquetas.map(e => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => toggleEtiqueta(e.id)}
                  style={{
                    padding: '6px 14px', borderRadius: '20px',
                    border: `1px solid ${etiquetasSel.includes(e.id) ? e.color : 'var(--color-borde)'}`,
                    backgroundColor: etiquetasSel.includes(e.id) ? e.color + '22' : 'transparent',
                    color: etiquetasSel.includes(e.id) ? e.color : 'var(--color-texto-secundario)',
                    fontSize: '13px', fontWeight: etiquetasSel.includes(e.id) ? '600' : '400',
                    cursor: 'pointer',
                  }}
                >
                  {e.nombre}
                </button>
              ))}
            </div>
          </>
        )}

        {/* 5 — REPETICIÓN */}
        <SeccionLabel>Repetición</SeccionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '16px' }}>
          {[
            { id: 'ninguna', label: 'No' },
            { id: 'diaria',  label: 'Diaria' },
            { id: 'semanal', label: 'Semanal' },
            { id: 'mensual', label: 'Mensual' },
          ].map(op => (
            <button
              key={op.id}
              type="button"
              onClick={() => setRepeticionTipo(op.id)}
              style={{
                padding: '10px 4px', borderRadius: '10px',
                backgroundColor: repeticionTipo === op.id ? 'rgba(0,191,255,0.13)' : 'var(--color-superficie)',
                border: `1px solid ${repeticionTipo === op.id ? 'var(--color-acento)' : 'var(--color-borde)'}`,
                color: repeticionTipo === op.id ? 'var(--color-acento)' : 'var(--color-texto-secundario)',
                fontSize: '13px', fontWeight: repeticionTipo === op.id ? '700' : '400',
                cursor: 'pointer',
              }}
            >
              {op.label}
            </button>
          ))}
        </div>

        {/* Días de la semana (semanal) */}
        {repeticionTipo === 'semanal' && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
              {DIAS_SEMANA_LABELS.map((d, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleDiaSemana(idx)}
                  style={{
                    padding: '8px 2px', borderRadius: '8px',
                    backgroundColor: diasSemana.includes(idx) ? 'var(--color-acento)' : 'var(--color-superficie)',
                    border: `1px solid ${diasSemana.includes(idx) ? 'var(--color-acento)' : 'var(--color-borde)'}`,
                    color: diasSemana.includes(idx) ? '#fff' : 'var(--color-texto-secundario)',
                    fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
            {diasSemana.length === 0 && (
              <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#ef4444' }}>
                Selecciona al menos un día
              </p>
            )}
          </div>
        )}

        {/* Días del mes (mensual) */}
        {repeticionTipo === 'mensual' && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
              {Array.from({ length: 31 }, (_, i) => i + 1).map(dia => (
                <button
                  key={dia}
                  type="button"
                  onClick={() => toggleDiaMes(dia)}
                  style={{
                    padding: '8px 2px', borderRadius: '8px',
                    backgroundColor: diasMes.includes(dia) ? 'var(--color-acento)' : 'var(--color-superficie)',
                    border: `1px solid ${diasMes.includes(dia) ? 'var(--color-acento)' : 'var(--color-borde)'}`,
                    color: diasMes.includes(dia) ? '#fff' : 'var(--color-texto-secundario)',
                    fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                  }}
                >
                  {dia}
                </button>
              ))}
            </div>
            {diasMes.length === 0 && (
              <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#ef4444' }}>
                Selecciona al menos un día
              </p>
            )}
          </div>
        )}

        {/* 6 — FIN DE REPETICIÓN (solo si no es 'ninguna') */}
        {repeticionTipo !== 'ninguna' && (
          <div style={{ marginBottom: '24px' }}>
            <SeccionLabel>Fin</SeccionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
              {[
                { id: 'nunca', label: 'Nunca' },
                { id: 'fecha', label: 'Fecha' },
                { id: 'veces', label: 'N veces' },
              ].map(op => (
                <button
                  key={op.id}
                  type="button"
                  onClick={() => setFinTipo(op.id)}
                  style={{
                    padding: '10px 4px', borderRadius: '10px',
                    backgroundColor: finTipo === op.id ? 'rgba(0,191,255,0.13)' : 'var(--color-superficie)',
                    border: `1px solid ${finTipo === op.id ? 'var(--color-acento)' : 'var(--color-borde)'}`,
                    color: finTipo === op.id ? 'var(--color-acento)' : 'var(--color-texto-secundario)',
                    fontSize: '13px', fontWeight: finTipo === op.id ? '700' : '400',
                    cursor: 'pointer',
                  }}
                >
                  {op.label}
                </button>
              ))}
            </div>

            {finTipo === 'fecha' && (
              <button
                type="button"
                onClick={() => setModalFinFecha(true)}
                style={estiloCampoFecha}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                </svg>
                <span>{finFecha || 'Seleccionar fecha de fin'}</span>
              </button>
            )}

            {finTipo === 'veces' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setFinVeces(v => Math.max(1, v - 1))}
                  style={estiloStepBtn}
                >−</button>
                <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-texto)', minWidth: '40px', textAlign: 'center' }}>
                  {finVeces}
                </span>
                <button
                  type="button"
                  onClick={() => setFinVeces(v => v + 1)}
                  style={estiloStepBtn}
                >+</button>
                <span style={{ fontSize: '14px', color: 'var(--color-texto-secundario)' }}>veces</span>
              </div>
            )}
          </div>
        )}

        {/* 7 — FECHA DE INICIO */}
        <SeccionLabel>Fecha de inicio</SeccionLabel>
        <button
          type="button"
          onClick={() => setModalFechaInicio(true)}
          style={{ ...estiloCampoFecha, marginBottom: '32px' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="16" y1="2" x2="16" y2="6" />
          </svg>
          <span>{fechaInicio}</span>
          {repeticionTipo !== 'ninguna' && repeticionTipo !== 'diaria' && (
            <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--color-texto-secundario)' }}>
              Solo días válidos
            </span>
          )}
        </button>

        {/* 8 — SUBHÁBITOS */}
        <SeccionLabel>Subhábitos (opcional)</SeccionLabel>
        <div style={{ marginBottom: '24px' }}>
          {/* Input para añadir */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: subhabitos.length > 0 ? '10px' : '0' }}>
            <input
              type="text"
              value={inputSubhabito}
              onChange={e => setInputSubhabito(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); agregarSubhabito() } }}
              placeholder="Nombre del subhábito…"
              maxLength={60}
              style={{ ...estiloInput, flex: 1, fontSize: '14px', padding: '10px 12px' }}
            />
            <button
              type="button"
              onClick={agregarSubhabito}
              disabled={!inputSubhabito.trim()}
              style={{
                padding: '10px 16px', borderRadius: '12px',
                backgroundColor: inputSubhabito.trim() ? 'var(--color-acento)' : 'var(--color-superficie)',
                border: inputSubhabito.trim() ? 'none' : '1px solid var(--color-borde)',
                color: inputSubhabito.trim() ? '#fff' : 'var(--color-texto-secundario)',
                fontSize: '14px', fontWeight: '600',
                cursor: inputSubhabito.trim() ? 'pointer' : 'default',
                flexShrink: 0,
              }}
            >
              Añadir
            </button>
          </div>

          {/* Lista de subhábitos */}
          {subhabitos.map(s => (
            <div key={s.id} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 12px', marginBottom: '6px',
              backgroundColor: 'var(--color-superficie)',
              border: '1px solid var(--color-borde)',
              borderRadius: '10px',
            }}>
              <span style={{ flex: 1, fontSize: '14px', color: 'var(--color-texto)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {s.texto}
              </span>
              {/* Toggle obligatorio */}
              <button
                type="button"
                onClick={() => toggleObligatorio(s.id)}
                style={{
                  padding: '4px 10px', borderRadius: '20px', flexShrink: 0,
                  border: `1px solid ${s.obligatorio ? 'var(--color-acento)' : 'var(--color-borde)'}`,
                  backgroundColor: s.obligatorio ? 'rgba(0,191,255,0.13)' : 'transparent',
                  color: s.obligatorio ? 'var(--color-acento)' : 'var(--color-texto-secundario)',
                  fontSize: '12px', fontWeight: s.obligatorio ? '600' : '400',
                  cursor: 'pointer',
                }}
              >
                {s.obligatorio ? 'Obligatorio' : 'Opcional'}
              </button>
              {/* Eliminar */}
              <button
                type="button"
                onClick={() => eliminarSubhabito(s.id)}
                style={{
                  width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
                  background: 'none', border: 'none',
                  color: 'var(--color-texto-secundario)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: 0,
                }}
                aria-label="Eliminar subhábito"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}

          {/* Mínimo para completar (solo si hay ≥2 subhábitos sin todos obligatorios) */}
          {subhabitos.length >= 2 && subhabitos.every(s => !s.obligatorio) && (
            <div style={{
              marginTop: '12px', padding: '12px',
              backgroundColor: 'var(--color-superficie)',
              border: '1px solid var(--color-borde)',
              borderRadius: '10px',
            }}>
              <p style={{ margin: '0 0 10px', fontSize: '12px', color: 'var(--color-texto-secundario)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Mínimo para completar
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button type="button" onClick={() => setSubhabitosMinimo(v => Math.max(0, v - 1))} style={estiloStepBtn}>−</button>
                <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-texto)', minWidth: '80px', textAlign: 'center' }}>
                  {subhabitosMinimo === 0 ? 'Sin mínimo' : `${subhabitosMinimo} de ${subhabitos.length}`}
                </span>
                <button type="button" onClick={() => setSubhabitosMinimo(v => Math.min(subhabitos.length, v + 1))} style={estiloStepBtn}>+</button>
              </div>
            </div>
          )}
        </div>

        {/* Guardar */}
        {errorGuardar && (
          <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#ef4444', textAlign: 'center' }}>
            {errorGuardar}
          </p>
        )}

        <button
          type="submit"
          disabled={!valido || guardando}
          style={{
            width: '100%', padding: '14px', borderRadius: '14px',
            backgroundColor: (valido && !guardando) ? 'var(--color-acento)' : 'var(--color-superficie)',
            border: (valido && !guardando) ? 'none' : '1px solid var(--color-borde)',
            color: (valido && !guardando) ? '#fff' : 'var(--color-texto-secundario)',
            fontSize: '16px', fontWeight: '600', cursor: (valido && !guardando) ? 'pointer' : 'default',
          }}
        >
          {guardando ? 'Guardando…' : (habito ? 'Guardar cambios' : 'Crear hábito')}
        </button>
      </form>

      {/* Modal fecha inicio */}
      {modalFechaInicio && (
        <ModalCalendario
          fechaSeleccionada={fechaInicio}
          mesInicial={mesInicioModal}
          anioInicial={anioInicioModal}
          onSeleccionarDia={(iso) => {
            setFechaInicio(iso)
            setModalFechaInicio(false)
          }}
          onCerrar={() => setModalFechaInicio(false)}
          esDiaHabilitado={esDiaValido}
          titulo="Fecha de inicio"
        />
      )}

      {/* Modal fecha fin */}
      {modalFinFecha && (
        <ModalCalendario
          fechaSeleccionada={finFecha || hoyISO()}
          mesInicial={finFecha ? parseInt(finFecha.split('-')[1], 10) - 1 : new Date().getMonth()}
          anioInicial={finFecha ? parseInt(finFecha.split('-')[0], 10) : new Date().getFullYear()}
          onSeleccionarDia={(iso) => {
            setFinFecha(iso)
            setModalFinFecha(false)
          }}
          onCerrar={() => setModalFinFecha(false)}
          titulo="Fecha de fin"
        />
      )}
    </div>
  )
}

function SeccionLabel({ children }) {
  return (
    <p style={{
      margin: '0 0 8px',
      fontSize: '13px', fontWeight: '600',
      color: 'var(--color-texto-secundario)',
      textTransform: 'uppercase', letterSpacing: '0.05em',
    }}>
      {children}
    </p>
  )
}

const estiloBotonVolver = {
  background: 'none', border: 'none', color: 'var(--color-acento)',
  cursor: 'pointer', padding: '4px', display: 'flex',
  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
}

const estiloInput = {
  width: '100%',
  padding: '12px 14px',
  backgroundColor: 'var(--color-superficie)',
  border: '1px solid var(--color-borde)',
  borderRadius: '12px',
  color: 'var(--color-texto)',
  fontSize: '16px',
  outline: 'none',
  boxSizing: 'border-box',
  display: 'block',
  marginBottom: '0',
}

const estiloCampoFecha = {
  display: 'flex', alignItems: 'center', gap: '10px',
  width: '100%', padding: '12px 14px',
  backgroundColor: 'var(--color-superficie)',
  border: '1px solid var(--color-borde)',
  borderRadius: '12px',
  color: 'var(--color-texto)',
  fontSize: '15px', cursor: 'pointer', textAlign: 'left',
  boxSizing: 'border-box',
}

const estiloStepBtn = {
  width: '36px', height: '36px', borderRadius: '10px',
  backgroundColor: 'var(--color-superficie)',
  border: '1px solid var(--color-borde)',
  color: 'var(--color-acento)', fontSize: '20px', fontWeight: '700',
  cursor: 'pointer', display: 'flex',
  alignItems: 'center', justifyContent: 'center', padding: 0,
}
