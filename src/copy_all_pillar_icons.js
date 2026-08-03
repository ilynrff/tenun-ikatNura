const fs = require('fs');
const path = require('path');

const brainDir = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\9d62c293-8c52-493b-ab1e-5ac1196f647c';
const targetDir = 'c:\\projects\\tenun ikat Nura\\public\\images\\icons';

const mapping = {
  'handcrafted.png': 'media__1785766570615.png',
  'authentic.png': 'media__1785766734067.png',
  'quality-material.png': 'media__1785766806526.png',
  'made-in-indonesia.png': 'media__1785766924117.png',
};

try {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  for (const [targetName, srcName] of Object.entries(mapping)) {
    const srcPath = path.join(brainDir, srcName);
    const targetPath = path.join(targetDir, targetName);
    if (fs.existsSync(srcPath)) {
      const data = fs.readFileSync(srcPath);
      fs.writeFileSync(targetPath, data);
      console.log(`Successfully copied ${srcName} -> ${targetName} (${data.length} bytes)`);
    } else {
      console.error(`Source file not found: ${srcPath}`);
    }
  }
} catch (err) {
  console.error('Error copying files:', err);
}
