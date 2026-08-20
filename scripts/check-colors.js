import fs from 'fs';
import path from 'path';

const ALLOWED_PALETTE = {
  '#D4AF37': 'SHINY GOLD',
  '#F2D675': 'GOLD HIGHLIGHT',
  '#F3E6D0': 'CREAMY BEIGE',
  '#D8BE99': 'WARM SAND',
  '#3A2116': 'DARK BROWN',
  '#21130D': 'RICH ESPRESSO',
  '#0B0A08': 'SOFT BLACK'
};

const hexRegex = /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/g;

function getFiles(dir, files = []) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist' && file !== '.git') {
        getFiles(fullPath, files);
      }
    } else if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.css')) {
      files.push(fullPath);
    }
  }
  return files;
}

const allFiles = getFiles('./src');
const foundColors = new Map();

for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  const matches = content.match(hexRegex);
  if (matches) {
    for (const m of matches) {
      const upper = m.toUpperCase();
      if (!foundColors.has(upper)) {
        foundColors.set(upper, []);
      }
      foundColors.get(upper).push(file);
    }
  }
}

console.log('--- FOUND COLORS IN SRC ---');
for (const [color, files] of foundColors.entries()) {
  const isAllowed = ALLOWED_PALETTE[color];
  console.log(color, isAllowed ? '==> PALETTE (' + isAllowed + ')' : '--> NON-PALETTE (in ' + files.length + ' files)');
}
