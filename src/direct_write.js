const fs = require('fs');

const srcPath = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\9d62c293-8c52-493b-ab1e-5ac1196f647c\\media__1785164682393.png';
const targetPath = 'c:\\projects\\tenun ikat Nura\\public\\images\\hero\\user-batik-floral.png';

try {
  const fileData = fs.readFileSync(srcPath);
  fs.writeFileSync(targetPath, fileData);
  console.log('Direct write completed successfully, file size:', fileData.length);
} catch (err) {
  console.error('Failed to write image:', err);
}
