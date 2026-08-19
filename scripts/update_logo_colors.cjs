const fs = require('fs');

function updateSvg(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  const defs = '<defs>\n    <linearGradient id="royalGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">\n      <stop offset="0%" stop-color="#FFF9F2" />\n      <stop offset="25%" stop-color="#FCEFD8" />\n      <stop offset="65%" stop-color="#E4C487" />\n      <stop offset="100%" stop-color="#D2A55F" />\n    </linearGradient>\n  </defs>';
  
  if (!content.includes('royalGoldGradient')) {
    content = content.replace(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 85.039 113.386" width="100%" height="100%">',
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 85.039 113.386" width="100%" height="100%">\n  ${defs}`
    );
  }
  
  content = content.replace(/fill="currentColor"/g, 'fill="url(#royalGoldGradient)"');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully updated logo color to radiant champagne gold in:', filePath);
}

updateSvg('src/assets/arabian-sheikh-logo.svg');
updateSvg('public/arabian-sheikh-logo.svg');
