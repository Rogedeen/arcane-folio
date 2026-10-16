const fs = require('fs');
const path = require('path');

const css = fs.readFileSync('src/index.css.backup', 'utf8');
const lines = css.split('\n');

function getRange(start, end) {
  return lines.slice(start - 1, end).join('\n');
}

const modules = {
  'tokens.css': getRange(1, 74),
  'base.css': getRange(75, 119),
  'layout.css': getRange(120, 403),
  'creator.css': [getRange(404, 599), getRange(5231, 5332)].join('\n\n'),
  'dice.css': [getRange(600, 782), getRange(3265, 3792)].join('\n\n'),
  'sheet.css': [getRange(783, 1100), getRange(2296, 2534), getRange(4310, 4772)].join('\n\n'),
  'spells.css': [getRange(1101, 1302), getRange(3793, 4127)].join('\n\n'),
  'inventory.css': [getRange(1303, 1479), getRange(4128, 4309)].join('\n\n'),
  'dialogs.css': [getRange(1480, 1812), getRange(2535, 2975)].join('\n\n'),
  'encounters.css': getRange(1813, 2295),
  'death-saves.css': [getRange(3107, 3264), getRange(4773, 4930)].join('\n\n'),
  'gallery.css': getRange(4931, 5230),
  'combat.css': [getRange(5333, 5415), getRange(5416, 5600)].join('\n\n'),
  'toast.css': [getRange(3052, 3106), getRange(5601, 5743)].join('\n\n'),
  'legacy-helpers.css': getRange(2976, 3051)
};

const stylesDir = path.join(__dirname, '..', 'src', 'styles');
if (!fs.existsSync(stylesDir)) {
  fs.mkdirSync(stylesDir, { recursive: true });
}

const importLines = [];
for (const [filename, content] of Object.entries(modules)) {
  const filePath = path.join(stylesDir, filename);
  fs.writeFileSync(filePath, content.trim() + '\n', 'utf8');
  console.log(`Created: src/styles/${filename} (${content.split('\n').length} lines)`);
  importLines.push(`@import './styles/${filename}';`);
}

const newIndexCss = `/* =========================================================================
   D&D 5E BEYOND KILLER — MODULAR CSS ARCHITECTURE
   Clean Architecture & SOLID Principle Split
   ========================================================================= */

${importLines.join('\n')}
`;

fs.writeFileSync('src/index.css', newIndexCss, 'utf8');
console.log('Updated src/index.css with modular imports!');
