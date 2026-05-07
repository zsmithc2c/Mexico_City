/**
 * Rasterize SVG icons → PNGs for iOS / Android home-screen install.
 * Run with: node scripts/generate-icons.mjs
 *
 * Outputs are committed to /public so the build does not depend on sharp.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const HERE = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(HERE, '..', 'public');

const TARGETS = [
  { src: 'icon.svg', out: 'apple-touch-icon.png', size: 180 },
  { src: 'icon.svg', out: 'icon-192.png', size: 192 },
  { src: 'icon.svg', out: 'icon-512.png', size: 512 },
  { src: 'icon-maskable.svg', out: 'icon-512-maskable.png', size: 512 }
];

await mkdir(PUBLIC_DIR, { recursive: true });

for (const { src, out, size } of TARGETS) {
  const svg = await readFile(join(PUBLIC_DIR, src));
  const buf = await sharp(svg, { density: 384 })
    .resize(size, size, { fit: 'cover' })
    .png({ compressionLevel: 9 })
    .toBuffer();
  await writeFile(join(PUBLIC_DIR, out), buf);
  console.log(`✓ ${out}  (${size}×${size}, ${(buf.length / 1024).toFixed(1)} KB)`);
}
