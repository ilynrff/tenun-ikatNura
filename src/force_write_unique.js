const fs = require('fs');
const path = require('path');

const brainDir = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\9d62c293-8c52-493b-ab1e-5ac1196f647c';
const basePublic = 'c:\\projects\\tenun ikat Nura\\public\\images';

const items = [
  { file: 'nusa-indah-1.jpg', src: 'nusa_indah_outer_1785769443953.png' },
  { file: 'ratna-dress-1.jpg', src: 'ratna_dress_1785769455505.png' },
  { file: 'majapahit-blazer-1.jpg', src: 'majapahit_blazer_1785769467603.png' },
  { file: 'candramawa-scarf-1.jpg', src: 'candramawa_scarf_1785769481897.png' },
  { file: 'surya-shirt-1.jpg', src: 'surya_kencana_shirt_1785769494701.png' },
  { file: 'swarna-kimono-1.jpg', src: 'swarna_bumi_kimono_1785769510401.png' },
  { file: 'signature-piece.jpg', src: 'nusa_indah_outer_1785769443953.png' }
];

items.forEach(item => {
  const srcPath = path.join(brainDir, item.src);
  const destPath = path.join(basePublic, 'collections', item.file);
  if (fs.existsSync(srcPath)) {
    const buf = fs.readFileSync(srcPath);
    fs.writeFileSync(destPath, buf);
    console.log(`Updated collections/${item.file} (${buf.length} bytes)`);
  }
});

// Update lookbook
const lbItems = [
  { file: 'lookbook-1.jpg', src: 'nusa_indah_outer_1785769443953.png' },
  { file: 'lookbook-2.jpg', src: 'ratna_dress_1785769455505.png' },
  { file: 'lookbook-3.jpg', src: 'swarna_bumi_kimono_1785769510401.png' },
  { file: 'lookbook-4.jpg', src: 'majapahit_blazer_1785769467603.png' }
];
lbItems.forEach(item => {
  const srcPath = path.join(brainDir, item.src);
  const destPath = path.join(basePublic, 'lookbook', item.file);
  if (fs.existsSync(srcPath)) {
    const buf = fs.readFileSync(srcPath);
    fs.writeFileSync(destPath, buf);
    console.log(`Updated lookbook/${item.file}`);
  }
});

// Update instagram
const instaItems = [
  { file: 'insta-1.jpg', src: 'artisan_weaving_editorial_1785768418024.png' },
  { file: 'insta-2.jpg', src: 'candramawa_scarf_1785769481897.png' },
  { file: 'insta-3.jpg', src: 'surya_kencana_shirt_1785769494701.png' },
  { file: 'insta-4.jpg', src: 'ratna_dress_1785769455505.png' },
  { file: 'insta-5.jpg', src: 'swarna_bumi_kimono_1785769510401.png' },
  { file: 'insta-6.jpg', src: 'nusa_indah_outer_1785769443953.png' }
];
instaItems.forEach(item => {
  const srcPath = path.join(brainDir, item.src);
  const destPath = path.join(basePublic, 'instagram', item.file);
  if (fs.existsSync(srcPath)) {
    const buf = fs.readFileSync(srcPath);
    fs.writeFileSync(destPath, buf);
    console.log(`Updated instagram/${item.file}`);
  }
});

console.log('Finished updating all unique photos!');
