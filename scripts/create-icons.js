import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const iconsDir = join(rootDir, 'public', 'icons');

if (!existsSync(iconsDir)) {
  mkdirSync(iconsDir, { recursive: true });
}

const sizes = [16, 32, 48, 128];

const createSVG = (size) => `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#5b5fff" rx="${size * 0.15}"/>
  <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="${size * 0.5}">SQL</text>
</svg>`;

sizes.forEach((size) => {
  const svg = createSVG(size);
  writeFileSync(join(iconsDir, `icon-${size}.svg`), svg);
  console.log(`✓ Created icon-${size}.svg`);
});

console.log('\nNote: SVG icons created. For production, convert these to PNG using:');
console.log('  - Online converter: https://svgtopng.com/');
console.log('  - CLI tool: npm install -g svgexport');
console.log('  - Or use design software like Figma, Sketch, etc.');
