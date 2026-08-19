const fs = require('fs');

const content = fs.readFileSync('src/assets/stream_2.bin', 'utf8');

// Parse PDF graphics stream to SVG
const tokens = content.trim().split(/\s+/);
let svgPaths = [];
let currentPath = '';
let currentMatrix = [1, 0, 0, 1, 0, 0];
let matrixStack = [];

let args = [];
for (let i = 0; i < tokens.length; i++) {
  const token = tokens[i];
  const num = parseFloat(token);
  if (!isNaN(num) && isFinite(num) && !token.endsWith('rg') && !token.endsWith('k') && !token.endsWith('m') && !token.endsWith('c') && !token.endsWith('l') && !token.endsWith('re') && !token.endsWith('cm')) {
    args.push(num);
  } else {
    switch (token) {
      case 'q':
        matrixStack.push([...currentMatrix]);
        break;
      case 'Q':
        if (matrixStack.length > 0) currentMatrix = matrixStack.pop();
        break;
      case 'cm': {
        const [a, b, c, d, e, f] = args;
        currentMatrix = [a, b, c, d, e, f];
        args = [];
        break;
      }
      case 'm': {
        const [x, y] = args;
        currentPath += `M ${x} ${-y} `;
        args = [];
        break;
      }
      case 'l': {
        const [x, y] = args;
        currentPath += `L ${x} ${-y} `;
        args = [];
        break;
      }
      case 'c': {
        const [x1, y1, x2, y2, x3, y3] = args;
        currentPath += `C ${x1} ${-y1} ${x2} ${-y2} ${x3} ${-y3} `;
        args = [];
        break;
      }
      case 'v': {
        const [x2, y2, x3, y3] = args;
        currentPath += `S ${x2} ${-y2} ${x3} ${-y3} `;
        args = [];
        break;
      }
      case 'y': {
        const [x1, y1, x3, y3] = args;
        currentPath += `C ${x1} ${-y1} ${x1} ${-y1} ${x3} ${-y3} `;
        args = [];
        break;
      }
      case 'h':
        currentPath += 'Z ';
        args = [];
        break;
      case 'f':
      case 'F':
      case 'f*':
        if (currentPath.trim()) {
          svgPaths.push({ d: currentPath.trim(), matrix: [...currentMatrix] });
          currentPath = '';
        }
        args = [];
        break;
      case 're':
        args = [];
        break;
      default:
        args = [];
        break;
    }
  }
}

console.log('Parsed SVG path groups:', svgPaths.length);
let svgOutput = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 85.039 113.386" width="100%" height="100%">\n`;
svgPaths.forEach((p) => {
  const [a, b, c, d, tx, ty] = p.matrix;
  svgOutput += `  <g transform="matrix(${a} ${b} ${c} ${d} ${tx} ${113.386 - ty})">\n`;
  svgOutput += `    <path d="${p.d}" fill="currentColor" />\n`;
  svgOutput += `  </g>\n`;
});
svgOutput += `</svg>`;
fs.writeFileSync('src/assets/arabian-sheikh-logo.svg', svgOutput);
fs.writeFileSync('public/arabian-sheikh-logo.svg', svgOutput);
console.log('Successfully written logo SVG to src/assets and public!');
