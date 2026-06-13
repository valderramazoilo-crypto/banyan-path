import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(root, 'IMAGENES')
const OUT = join(root, 'public', 'img')
mkdirSync(OUT, { recursive: true })

// map original filenames → clean web slugs (role / usage)
const map = [
  ['Generated Image March 16, 2026 - 4_24PM.jpg', 'housekeeper-portrait'], // hero portrait — green uniform, towels
  ['ChatGPT Image 8 may 2026, 04_12_45 p.m..png', 'housekeeping'], // room turndown
  ['ChatGPT Image May 12, 2026, 03_56_57 PM.png', 'front-desk'],
  ['ChatGPT Image May 12, 2026, 03_59_37 PM.png', 'culinary'],
  ['Generated Image March 16, 2026 - 4_38PM.jpg', 'bar'],
  ['ChatGPT Image May 12, 2026, 04_00_55 PM.png', 'recruitment'],
  ['Generated Image March 16, 2026 - 4_43PM.jpg', 'workplace'],
]

const widths = [800, 1400] // responsive sizes

for (const [file, slug] of map) {
  const input = join(SRC, file)
  for (const w of widths) {
    const suffix = w === 1400 ? '' : `-${w}`
    await sharp(input)
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(join(OUT, `${slug}${suffix}.webp`))
  }
  console.log(`✓ ${slug}`)
}
console.log('Done — optimized images in public/img')
