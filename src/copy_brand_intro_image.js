const fs = require('fs');
const path = require('path');

const srcPath = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\9d62c293-8c52-493b-ab1e-5ac1196f647c\\artisan_weaving_editorial_1785768418024.png';
const targetDir = 'c:\\projects\\tenun ikat Nura\\public\\images\\story';
const targetPath = path.join(targetDir, 'brand-intro.jpg');

try {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  const data = fs.readFileSync(srcPath);
  fs.writeFileSync(targetPath, data);
  console.log('Successfully saved artisan weaving image to brand-intro.jpg, size:', data.length);
} catch (err) {
  console.error('Error saving image:', err);
}
