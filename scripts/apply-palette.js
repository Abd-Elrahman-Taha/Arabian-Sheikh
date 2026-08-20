import fs from 'fs';
import path from 'path';

// OFFICIAL ARABIC LUXURY PALETTE (The only 7 allowed colors)
const PALETTE = {
  SHINY_GOLD: '#D4AF37',
  GOLD_HIGHLIGHT: '#F2D675',
  CREAMY_BEIGE: '#F3E6D0',
  WARM_SAND: '#D8BE99',
  DARK_BROWN: '#3A2116',
  RICH_ESPRESSO: '#21130D',
  SOFT_BLACK: '#0B0A08'
};

const COLOR_MAP = {
  // Whites / Creams -> CREAMY BEIGE (#F3E6D0)
  '#FFFFFF': '#F3E6D0',
  '#F8F5F0': '#F3E6D0',
  '#F5ECE3': '#F3E6D0',
  '#F4F1EA': '#F3E6D0',
  '#EADED2': '#F3E6D0',
  '#E5E0D8': '#F3E6D0',
  '#E8DACB': '#F3E6D0',
  '#FFFDF0': '#F3E6D0',
  '#FFF5EB': '#F3E6D0',
  '#FFF8E7': '#F3E6D0',
  '#FFFDF5': '#F3E6D0',
  '#FFFDF9': '#F3E6D0',
  '#F7EFE4': '#F3E6D0',
  '#F4ECE1': '#F3E6D0',
  '#F5EDE3': '#F3E6D0',
  '#E6D8C6': '#F3E6D0',
  '#FFF5E8': '#F3E6D0',

  // Gold Highlights / Light Gold / Badges -> GOLD HIGHLIGHT (#F2D675)
  '#E5C07B': '#F2D675',
  '#F8D188': '#F2D675',
  '#FFD799': '#F2D675',
  '#FFE2A8': '#F2D675',
  '#FFDF73': '#F2D675',
  '#FFE082': '#F2D675',
  '#FFE8A3': '#F2D675',
  '#F5D296': '#F2D675',
  '#FBE5B8': '#F2D675',
  '#FFC899': '#F2D675',
  '#E8C87A': '#F2D675',
  '#E6C587': '#F2D675',

  // Core Gold & Medium Gold -> SHINY GOLD (#D4AF37)
  '#D2A55F': '#D4AF37',
  '#C9A15C': '#D4AF37',
  '#C5A059': '#D4AF37',
  '#E0B978': '#D4AF37',
  '#E0BA78': '#D4AF37',
  '#D8A850': '#D4AF37',
  '#EBAA62': '#D4AF37',
  '#E39F54': '#D4AF37',
  '#E8D29F': '#D4AF37',
  '#C67A28': '#D4AF37',
  '#B87A28': '#D4AF37',
  '#C48A2C': '#D4AF37',
  '#E6BE8A': '#D4AF37',
  '#B8945A': '#D4AF37',
  '#A97B3F': '#D4AF37',

  // Muted Gold / Neutral Sand / Soft Borders / Secondary Text -> WARM SAND (#D8BE99)
  '#A69E94': '#D8BE99',
  '#8C6D37': '#D8BE99',
  '#8E8880': '#D8BE99',
  '#BFA893': '#D8BE99',
  '#C8C2BA': '#D8BE99',
  '#B9B3A8': '#D8BE99',
  '#D0C7B8': '#D8BE99',
  '#C0B08C': '#D8BE99',
  '#DFCAA0': '#D8BE99',
  '#9E4D1B': '#D8BE99',
  '#AD7743': '#D8BE99',
  '#C89662': '#D8BE99',
  '#DFB07E': '#D8BE99',
  '#EED2B3': '#D8BE99',
  '#C4925B': '#D8BE99',
  '#6F6258': '#D8BE99',
  '#8C6A32': '#D8BE99',

  // Dark Brown / Deep Terracotta / Cards / Dark buttons -> DARK BROWN (#3A2116)
  '#5D1D01': '#3A2116',
  '#80300D': '#3A2116',
  '#B45625': '#3A2116',
  '#5C3D28': '#3A2116',
  '#4A2B11': '#3A2116',
  '#362214': '#3A2116',
  '#3D2411': '#3A2116',
  '#3D2817': '#3A2116',
  '#5A3414': '#3A2116',
  '#5E3816': '#3A2116',
  '#7E4E24': '#3A2116',
  '#7A481F': '#3A2116',
  '#8B5A2B': '#3A2116',
  '#8C5C2E': '#3A2116',
  '#3A2415': '#3A2116',
  '#A8602E': '#3A2116',
  '#A87542': '#3A2116',
  '#9E6938': '#3A2116',
  '#5E2F0F': '#3A2116',
  '#3D1D09': '#3A2116',

  // Rich Espresso / Section backgrounds / Dark container borders -> RICH ESPRESSO (#21130D)
  '#14100D': '#21130D',
  '#160F0A': '#21130D',
  '#1A120B': '#21130D',
  '#2E1A0C': '#21130D',
  '#2D1F14': '#21130D',
  '#23180F': '#21130D',
  '#180F08': '#21130D',
  '#1A140E': '#21130D',
  '#100C09': '#21130D',
  '#12100E': '#21130D',
  '#141210': '#21130D',
  '#130C05': '#21130D',
  '#16120E': '#21130D',
  '#2E1807': '#21130D',
  '#231206': '#21130D',

  // Soft Black / Base Dark / Modals -> SOFT BLACK (#0B0A08)
  '#0A0A0B': '#0B0A08',
  '#090706': '#0B0A08',
  '#080605': '#0B0A08',
  '#0E0A07': '#0B0A08',
  '#0D0B0B': '#0B0A08',
  '#0E0B09': '#0B0A08',
  '#050505': '#0B0A08',
  '#0F0E0E': '#0B0A08',
  '#0D0C0A': '#0B0A08',
  '#0F0D0C': '#0B0A08',
  '#0A0A0A': '#0B0A08',
  '#0A0A09': '#0B0A08',
  '#080707': '#0B0A08',
  '#121010': '#0B0A08',
  '#141212': '#0B0A08',
  '#181515': '#0B0A08',
  '#1A1A1C': '#0B0A08',
  '#0E0C0B': '#0B0A08',
  '#100F0D': '#0B0A08',
  '#070605': '#0B0A08',
  '#2A2A2A': '#0B0A08',
  '#2D283E': '#21130D',
  '#9A8CB8': '#D8BE99'
};

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
let totalReplacements = 0;

for (const file of allFiles) {
  let content = fs.readFileSync(file, 'utf-8');
  let fileChanged = false;

  for (const [oldHex, newHex] of Object.entries(COLOR_MAP)) {
    // Case-insensitive replace for hex codes
    const regex = new RegExp(oldHex, 'gi');
    if (regex.test(content)) {
      content = content.replace(regex, newHex);
      fileChanged = true;
      totalReplacements++;
    }
  }

  if (fileChanged) {
    fs.writeFileSync(file, content, 'utf-8');
    console.log('Updated palette in:', file);
  }
}

console.log('Finished updating colors! Total replacements made:', totalReplacements);
