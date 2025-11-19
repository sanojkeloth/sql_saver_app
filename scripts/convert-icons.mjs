import { Resvg } from '@resvg/resvg-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [16, 32, 48, 128];
const iconsDir = path.join(__dirname, '../public/icons');

console.log('Converting SVG icons to PNG...\n');

sizes.forEach(size => {
  const svgPath = path.join(iconsDir, `icon-${size}.svg`);
  const pngPath = path.join(iconsDir, `icon-${size}.png`);

  try {
    // Read SVG file
    const svg = fs.readFileSync(svgPath, 'utf8');

    // Convert to PNG
    const resvg = new Resvg(svg, {
      fitTo: {
        mode: 'width',
        value: size,
      },
    });

    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    // Write PNG file
    fs.writeFileSync(pngPath, pngBuffer);

    console.log(`✓ Created icon-${size}.png`);
  } catch (error) {
    console.error(`✗ Error converting icon-${size}.svg:`, error.message);
  }
});

console.log('\n✓ All icons converted successfully!');
