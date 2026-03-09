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

// Configuración del cloud (se activa solo cuando el usuario inicia sesión)
db.cloud.configure({
  databaseUrl: 'https://zjtti7z2o.dexie.cloud',
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
