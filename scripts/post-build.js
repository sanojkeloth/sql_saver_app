import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const distDir = join(rootDir, 'dist');

// Copy manifest.json to dist
console.log('Copying manifest.json...');
copyFileSync(
  join(rootDir, 'public', 'manifest.json'),
  join(distDir, 'manifest.json')
);

// Create icons directory
const iconsDir = join(distDir, 'icons');
if (!existsSync(iconsDir)) {
  mkdirSync(iconsDir, { recursive: true });
}

console.log('Build complete! Extension is ready in the dist/ folder.');
console.log('\nTo load in Chrome:');
console.log('1. Go to chrome://extensions/');
console.log('2. Enable "Developer mode"');
console.log('3. Click "Load unpacked"');
console.log('4. Select the dist/ folder');
