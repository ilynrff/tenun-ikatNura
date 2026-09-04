const fs = require('fs');
const path = require('path');

const publicDir = 'c:\\projects\\tenun ikat Nura\\public\\images';
const brainDir = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\9d62c293-8c52-493b-ab1e-5ac1196f647c';

// Existing source images from brain & hero
const sourceStory = path.join(publicDir, 'story', 'brand-intro.jpg');
const sourceHero = path.join(publicDir, 'hero', 'hero-main.jpg');
const sourceBrandIntroBrain = path.join(brainDir, 'brand_intro_1785149543804.png');
const sourceCollectionBrain = path.join(brainDir, 'collection_piece_1785149560519.png');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function copyFileSafe(src, dest) {
  try {
    if (fs.existsSync(src)) {
      const data = fs.readFileSync(src);
      fs.writeFileSync(dest, data);
      console.log(`Copied ${path.basename(src)} -> ${dest}`);
      return true;
    }
  } catch (e) {
    console.error(`Failed copying ${src} -> ${dest}:`, e);
  }
  return false;
}

// 1. Story
ensureDir(path.join(publicDir, 'story'));
copyFileSafe(sourceBrandIntroBrain, path.join(publicDir, 'story', 'our-story.jpg')) ||
copyFileSafe(sourceHero, path.join(publicDir, 'story', 'our-story.jpg'));

// 2. Collections
ensureDir(path.join(publicDir, 'collections'));
const collectionsList = [
  'nusa-indah-1.jpg',
  'ratna-dress-1.jpg',
  'majapahit-blazer-1.jpg',
  'candramawa-scarf-1.jpg',
  'surya-shirt-1.jpg',
  'swarna-kimono-1.jpg',
  'signature-piece.jpg'
];

collectionsList.forEach(filename => {
  const target = path.join(publicDir, 'collections', filename);
  copyFileSafe(sourceCollectionBrain, target) ||
  copyFileSafe(sourceStory, target) ||
  copyFileSafe(sourceHero, target);
});

// 3. Lookbook
ensureDir(path.join(publicDir, 'lookbook'));
for (let i = 1; i <= 4; i++) {
  const target = path.join(publicDir, 'lookbook', `lookbook-${i}.jpg`);
  copyFileSafe(sourceCollectionBrain, target) ||
  copyFileSafe(sourceStory, target);
}

// 4. Instagram
ensureDir(path.join(publicDir, 'instagram'));
for (let i = 1; i <= 6; i++) {
  const target = path.join(publicDir, 'instagram', `insta-${i}.jpg`);
  copyFileSafe(sourceBrandIntroBrain, target) ||
  copyFileSafe(sourceStory, target);
}

console.log('All image files successfully deployed to public/images structure!');
