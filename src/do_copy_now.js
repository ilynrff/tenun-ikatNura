const fs = require('fs');
const path = require('path');

const brainDir = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\9d62c293-8c52-493b-ab1e-5ac1196f647c';
const publicDir = 'c:\\projects\\tenun ikat Nura\\public\\images';

// Make sure target folders exist
const folders = ['story', 'collections', 'lookbook', 'instagram', 'hero'];
folders.forEach(f => {
  const dir = path.join(publicDir, f);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Copy Artisan Brand Intro Image
const brandIntroSrc = path.join(brainDir, 'artisan_weaving_editorial_1785768418024.png');
if (fs.existsSync(brandIntroSrc)) {
  const data = fs.readFileSync(brandIntroSrc);
  fs.writeFileSync(path.join(publicDir, 'story', 'brand-intro.jpg'), data);
  fs.writeFileSync(path.join(publicDir, 'story', 'our-story.jpg'), data);
  console.log('Brand intro & story images written successfully, size:', data.length);
} else {
  console.error('Source brand intro image not found at:', brandIntroSrc);
}

// Copy Collection Image
const colBrainSrc = path.join(brainDir, 'collection_piece_1785149560519.png');
if (fs.existsSync(colBrainSrc)) {
  const colData = fs.readFileSync(colBrainSrc);
  ['nusa-indah-1.jpg', 'ratna-dress-1.jpg', 'majapahit-blazer-1.jpg', 'candramawa-scarf-1.jpg', 'surya-shirt-1.jpg', 'swarna-kimono-1.jpg', 'signature-piece.jpg'].forEach(f => {
    fs.writeFileSync(path.join(publicDir, 'collections', f), colData);
  });
  for (let i = 1; i <= 4; i++) {
    fs.writeFileSync(path.join(publicDir, 'lookbook', `lookbook-${i}.jpg`), colData);
  }
  for (let i = 1; i <= 6; i++) {
    fs.writeFileSync(path.join(publicDir, 'instagram', `insta-${i}.jpg`), colData);
  }
  console.log('Collections, Lookbook & Instagram images written successfully!');
}
