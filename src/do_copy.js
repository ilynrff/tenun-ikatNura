const fs = require('fs');

const srcPath = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\9d62c293-8c52-493b-ab1e-5ac1196f647c\\media__1785164682393.png';
const targetPath1 = 'c:\\projects\\tenun ikat Nura\\public\\images\\hero\\user-batik-floral.png';
const targetPath2 = 'c:\\projects\\tenun ikat Nura\\public\\images\\hero\\batik-ornament.svg';

try {
  const data = fs.readFileSync(srcPath);
  fs.writeFileSync(targetPath1, data);
  console.log('Saved image successfully, size:', data.length);
} catch (e) {
  console.error(e);
}
