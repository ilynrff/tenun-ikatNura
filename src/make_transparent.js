const fs = require('fs');
const zlib = require('zlib');

// Read the user image
const srcPath = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\9d62c293-8c52-493b-ab1e-5ac1196f647c\\media__1785164682393.png';
const destPath = 'c:\\projects\\tenun ikat Nura\\public\\images\\hero\\user-batik-transparent.png';

// Copy image to public first
const buffer = fs.readFileSync(srcPath);
fs.writeFileSync(destPath, buffer);
console.log('Image copied to public folder.');
