const fs = require('fs');
const path = require('path');

function walk(dir) {
  fs.readdirSync(dir).forEach(f => {
    let p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.match(/\.(ts|tsx|css)$/)) {
      let c = fs.readFileSync(p, 'utf8');
      if (c.includes('#f97316')) {
        fs.writeFileSync(p, c.replaceAll('#f97316', '#FCA311'));
        console.log('Updated', p);
      }
    }
  });
}

walk('c:/Users/migue/Proyecto de Sistemas II/PS2B2026-AplicacionRutasBloqueos-Frontend/src');
console.log('Done!');
