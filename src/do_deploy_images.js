const fs = require('fs');
const path = require('path');

const basePublic = 'c:\\projects\\tenun ikat Nura\\public\\images';
const brainDir = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\9d62c293-8c52-493b-ab1e-5ac1196f647c';

// Helper to write buffer directly
function writeImg(subFolder, fileName, sourceFile) {
  const targetDir = path.join(basePublic, subFolder);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  const src = path.join(brainDir, sourceFile);
  if (fs.existsSync(src)) {
    const data = fs.readFileSync(src);
    fs.writeFileSync(path.join(targetDir, fileName), data);
    console.log(`Saved ${subFolder}/${fileName}`);
  }
}

// Write Story images
writeImg('story', 'brand-intro.jpg', 'artisan_weaving_editorial_1785768418024.png');
writeImg('story', 'our-story.jpg', 'brand_intro_1785149543804.png');

// Write Collections images
const colItems = [
  'nusa-indah-1.jpg',
  'ratna-dress-1.jpg',
  'majapahit-blazer-1.jpg',
  'candramawa-scarf-1.jpg',
  'surya-shirt-1.jpg',
  'swarna-kimono-1.jpg',
  'signature-piece.jpg'
];
colItems.forEach(name => {
  writeImg('collections', name, 'collection_piece_1785149560519.png');
});

// Write Lookbook images
for (let i = 1; i <= 4; i++) {
  writeImg('lookbook', `lookbook-${i}.jpg`, 'brand_intro_1785149543804.png');
}

// Write Instagram images
for (let i = 1; i <= 6; i++) {
  writeImg('instagram', `insta-${i}.jpg`, 'collection_piece_1785149560519.png');
}

console.log('All image assets written successfully!');
