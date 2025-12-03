const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, 'public', '_redirects');
const dest = path.join(__dirname, 'dist', 'frontend', 'browser', '_redirects');

if (fs.existsSync(source)) {
  fs.copyFileSync(source, dest);
  console.log('✅ _redirects copiado a dist');
} else {
  console.warn('⚠️ _redirects no encontrado');
}
