import Dexie from 'dexie'

// Instancia de la base de datos local (IndexedDB via Dexie)
const db = new Dexie('DiarioEntrenamiento')

/**
 * Definición del esquema de la base de datos.
 * El número de versión debe incrementarse cada vez que se modifique el esquema.
 *
 * Sintaxis Dexie para índices:
 *   ++id    → clave primaria autoincremental
 *   nombre  → índice simple
 *   *array  → índice multi-entrada (para arrays)
 */
// v1: esquema original (necesario para que Dexie gestione migraciones)
db.version(1).stores({
  ejercicios: '++id, nombre, grupoMuscular',
  sesiones:   '++id, nombre',
  diario:     '++id, fecha, sesionId',
  registro:   '++id, ejercicioId, fecha',
})

// v2: grupoMuscular (string) → gruposMuscular (array con índice multi-entrada)
// El prefijo * en *gruposMuscular permite consultar por cualquier valor del array.
db.version(2).stores({
  ejercicios: '++id, nombre, *gruposMuscular',
  sesiones:   '++id, nombre',
  diario:     '++id, fecha, sesionId',
  registro:   '++id, ejercicioId, fecha',
}).upgrade(tx =>
  // Convierte los registros existentes: string → array de un elemento
  tx.ejercicios.toCollection().modify(ej => {
    if (typeof ej.grupoMuscular === 'string') {
      ej.gruposMuscular = [ej.grupoMuscular]
      delete ej.grupoMuscular
    } else if (!Array.isArray(ej.gruposMuscular)) {
      ej.gruposMuscular = []
    }
  })
)

/**
 * Tipos de grupos musculares permitidos.
 * Usado para validar y mostrar opciones en la UI.
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
