/**
 * Genera los iconos PNG de la PWA a partir del logo original.
 * Uso: node generate-icons.mjs
 */
import sharp from 'sharp'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Usar el logo original si existe; si no, el SVG de fallback
const logoPath = '/home/fran/images/logo2.png'
const svgPath  = join(__dirname, 'public/icons/icon.svg')
const src      = existsSync(logoPath) ? logoPath : svgPath

console.log(`Fuente: ${src}`)

const icons = [
  { out: 'public/icons/icon-192.png',   size: 192 },
  { out: 'public/icons/icon-512.png',   size: 512 },
  { out: 'public/apple-touch-icon.png', size: 180 },
]

for (const { out, size } of icons) {
  await sharp(src)
    .resize(size, size)
    .png({ quality: 95 })
    .toFile(join(__dirname, out))
  console.log(`✓ ${out} (${size}×${size})`)
}

console.log('Iconos generados correctamente.')
