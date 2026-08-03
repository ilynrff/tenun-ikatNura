const fs = require('fs');
const path = require('path');

const srcPath = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\9d62c293-8c52-493b-ab1e-5ac1196f647c\\media__1785164682393.png';
const targetPath = 'c:\\projects\\tenun ikat Nura\\public\\images\\hero\\user-batik-floral.png';

try {
  const data = fs.readFileSync(srcPath);
  fs.writeFileSync(targetPath, data);
  console.log('Successfully saved user exact PNG image!');
} catch (err) {
  console.error('Error saving image:', err);
}
