import Dexie from 'dexie'
import dexieCloud from 'dexie-cloud-addon'

// Instancia de la base de datos local (IndexedDB via Dexie + Cloud sync)
const db = new Dexie('DiarioEntrenamiento', { addons: [dexieCloud] })

/**
 * Esquema de la base de datos.
 *
 * Sintaxis Dexie para índices:
 *   ++id    → clave primaria autoincremental (solo local)
 *   @id     → clave primaria UUID generada en cliente (necesaria para sync cloud)
 *   nombre  → índice simple
 *   *array  → índice multi-entrada (para arrays)
 */

// v1: esquema original
db.version(1).stores({
  ejercicios: '++id, nombre, grupoMuscular',
  sesiones:   '++id, nombre',
  diario:     '++id, fecha, sesionId',
  registro:   '++id, ejercicioId, fecha',
})

// v2: grupoMuscular (string) → gruposMuscular (array con índice multi-entrada)
db.version(2).stores({
  ejercicios: '++id, nombre, *gruposMuscular',
  sesiones:   '++id, nombre',
  diario:     '++id, fecha, sesionId',
  registro:   '++id, ejercicioId, fecha',
}).upgrade(tx =>
  tx.ejercicios.toCollection().modify(ej => {
    if (typeof ej.grupoMuscular === 'string') {
      ej.gruposMuscular = [ej.grupoMuscular]
      delete ej.grupoMuscular
    } else if (!Array.isArray(ej.gruposMuscular)) {
      ej.gruposMuscular = []
    }
  })
)

// v3: @id en lugar de ++id para sincronización cross-device con Dexie Cloud.
// Los registros existentes (con id entero) se quedan locales; los nuevos
// reciben un UUID y se sincronizan automáticamente entre dispositivos.
db.version(3).stores({
  ejercicios: '@id, nombre, *gruposMuscular',
  sesiones:   '@id, nombre',
  diario:     '@id, fecha, sesionId',
  registro:   '@id, ejercicioId, fecha',
})

// v4: garantiza relaciones bidireccionales en sustitutos para datos existentes.
// Si A tiene B como sustituto pero B no tiene A, lo añade automáticamente.
db.version(4).stores({
  ejercicios: '@id, nombre, *gruposMuscular',
  sesiones:   '@id, nombre',
  diario:     '@id, fecha, sesionId',
  registro:   '@id, ejercicioId, fecha',
}).upgrade(async tx => {
  const todos = await tx.ejercicios.toArray()
  for (const ej of todos) {
    for (const susId of (ej.sustitutos || [])) {
      const sus = todos.find(e => e.id === susId)
      if (sus && !(sus.sustitutos || []).includes(ej.id)) {
        await tx.ejercicios.update(susId, {
          sustitutos: [...(sus.sustitutos || []), ej.id],
        })
      }
    }
  }
})

// v5: nuevas tablas para el módulo de Hábitos (@id = UUID para compatibilidad con dexie-cloud-addon)
db.version(5).stores({
  habitos:           '@id, titulo, tipo, *etiquetas, fechaInicio',
  etiquetasHabito:   '@id, nombre',
  completadosHabito: '@id, habitoId, fecha',
})

// v6: tabla de medidas corporales mensuales (fecha = YYYY-MM-01, siempre el día 1 del mes)
db.version(6).stores({
  medidas: '@id, fecha',
})

// Configuración del cloud (se activa solo cuando el usuario inicia sesión)
// La URL se inyecta como variable de entorno en build (VITE_DEXIE_URL)
db.cloud.configure({
  databaseUrl: import.meta.env.VITE_DEXIE_URL,
  requireAuth: false, // La app funciona sin login; con login los datos se sincronizan
})

/**
 * Tipos de grupos musculares permitidos.
 */
export const GRUPOS_MUSCULARES = [
  'pecho',
  'espalda',
  'hombro',
  'bíceps',
  'tríceps',
  'pierna',
  'core',
  'cardio',
]

/**
 * Unidades de peso disponibles
 */
export const UNIDADES_PESO = ['kg', 'lb']

export default db
