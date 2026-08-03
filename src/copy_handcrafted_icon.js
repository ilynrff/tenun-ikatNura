const fs = require('fs');
const path = require('path');

const srcPath = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\9d62c293-8c52-493b-ab1e-5ac1196f647c\\media__1785766570615.png';
const targetDir = 'c:\\projects\\tenun ikat Nura\\public\\images\\icons';
const targetPath = path.join(targetDir, 'handcrafted-icon.png');

try {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  const data = fs.readFileSync(srcPath);
  fs.writeFileSync(targetPath, data);
  console.log('Successfully saved user icon to handcrafted-icon.png, size:', data.length);
} catch (err) {
  console.error('Failed to copy icon:', err);
}
