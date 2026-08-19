const fs = require('fs');

function makeSvgLightGold(path) {
  let content = fs.readFileSync(path, 'utf8');
  
  const defs = `<defs>
    <linearGradient id="lightGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFDF7" />
      <stop offset="30%" stop-color="#FDF2D7" />
      <stop offset="70%" stop-color="#E8CE93" />
      <stop offset="100%" stop-color="#D2A55F" />
    </linearGradient>
  </defs>`;

  // Remove any existing defs
  content = content.replace(/<defs>[\s\S]*?<\/defs>/g, '');
  
  // Add new light gold defs right after <svg ...>
  content = content.replace(/(<svg[^>]*>)/, `$1\n  ${defs}`);
  
  // Replace all fill attributes with url(#lightGoldGrad)
  content = content.replace(/fill="[^"]*"/g, 'fill="url(#lightGoldGrad)"');
  
  fs.writeFileSync(path, content, 'utf8');
  console.log('Successfully updated to light gold:', path);
}

makeSvgLightGold('src/assets/arabian-sheikh-logo.svg');
makeSvgLightGold('public/arabian-sheikh-logo.svg');
