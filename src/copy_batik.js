const fs = require('fs');
const path = require('path');

const src = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\9d62c293-8c52-493b-ab1e-5ac1196f647c\\media__1785164682393.png';
const dest = 'c:\\projects\\tenun ikat Nura\\public\\images\\hero\\batik-floral-corner.png';

try {
  fs.copyFileSync(src, dest);
  console.log('Successfully copied reference batik floral image!');
} catch (err) {
  console.error('Error copying file:', err);
}
