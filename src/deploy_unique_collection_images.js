const fs = require('fs');
const path = require('path');

const brainDir = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\9d62c293-8c52-493b-ab1e-5ac1196f647c';
const colTargetDir = 'c:\\projects\\tenun ikat Nura\\public\\images\\collections';

const mapping = {
  'nusa-indah-1.jpg': 'nusa_indah_outer_1785769443953.png',
  'ratna-dress-1.jpg': 'ratna_dress_1785769455505.png',
  'majapahit-blazer-1.jpg': 'majapahit_blazer_1785769467603.png',
  'candramawa-scarf-1.jpg': 'candramawa_scarf_1785769481897.png',
  'surya-shirt-1.jpg': 'surya_kencana_shirt_1785769494701.png',
  'swarna-kimono-1.jpg': 'swarna_bumi_kimono_1785769510401.png',
  'signature-piece.jpg': 'nusa_indah_outer_1785769443953.png',
};

if (!fs.existsSync(colTargetDir)) {
  fs.mkdirSync(colTargetDir, { recursive: true });
}

for (const [targetFile, srcFile] of Object.entries(mapping)) {
  const srcPath = path.join(brainDir, srcFile);
  const targetPath = path.join(colTargetDir, targetFile);
  if (fs.existsSync(srcPath)) {
    const data = fs.readFileSync(srcPath);
    fs.writeFileSync(targetPath, data);
    console.log(`Successfully deployed ${targetFile} (${data.length} bytes)`);
  } else {
    console.error(`Source file missing: ${srcPath}`);
  }
}

// Deploy unique Lookbook images
const lookbookTargetDir = 'c:\\projects\\tenun ikat Nura\\public\\images\\lookbook';
if (!fs.existsSync(lookbookTargetDir)) {
  fs.mkdirSync(lookbookTargetDir, { recursive: true });
}

const lbMap = [
  'nusa_indah_outer_1785769443953.png',
  'ratna_dress_1785769455505.png',
  'swarna_bumi_kimono_1785769510401.png',
  'majapahit_blazer_1785769467603.png'
];

lbMap.forEach((srcFile, idx) => {
  const srcPath = path.join(brainDir, srcFile);
  const targetPath = path.join(lookbookTargetDir, `lookbook-${idx + 1}.jpg`);
  if (fs.existsSync(srcPath)) {
    const data = fs.readFileSync(srcPath);
    fs.writeFileSync(targetPath, data);
    console.log(`Deployed lookbook-${idx + 1}.jpg`);
  }
});

// Deploy unique Instagram images
const instaTargetDir = 'c:\\projects\\tenun ikat Nura\\public\\images\\instagram';
if (!fs.existsSync(instaTargetDir)) {
  fs.mkdirSync(instaTargetDir, { recursive: true });
}

const instaMap = [
  'artisan_weaving_editorial_1785768418024.png',
  'candramawa_scarf_1785769481897.png',
  'surya_kencana_shirt_1785769494701.png',
  'ratna_dress_1785769455505.png',
  'swarna_bumi_kimono_1785769510401.png',
  'nusa_indah_outer_1785769443953.png'
];

instaMap.forEach((srcFile, idx) => {
  const srcPath = path.join(brainDir, srcFile);
  const targetPath = path.join(instaTargetDir, `insta-${idx + 1}.jpg`);
  if (fs.existsSync(srcPath)) {
    const data = fs.readFileSync(srcPath);
    fs.writeFileSync(targetPath, data);
    console.log(`Deployed insta-${idx + 1}.jpg`);
  }
});

console.log('All unique collection, lookbook, and instagram photos deployed successfully!');
