const fs = require('fs');
const path = require('path');

const brainDir = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\9d62c293-8c52-493b-ab1e-5ac1196f647c';
const storyPublic = 'c:\\projects\\tenun ikat Nura\\public\\images\\story';

if (!fs.existsSync(storyPublic)) {
  fs.mkdirSync(storyPublic, { recursive: true });
}

// Artisan weaving image data
const artisanSrc = path.join(brainDir, 'artisan_weaving_editorial_1785768418024.png');
if (fs.existsSync(artisanSrc)) {
  const data = fs.readFileSync(artisanSrc);
  fs.writeFileSync(path.join(storyPublic, 'brand-intro.jpg'), data);
  fs.writeFileSync(path.join(storyPublic, 'our-story.jpg'), data);
  for (let i = 1; i <= 6; i++) {
    fs.writeFileSync(path.join(storyPublic, `craft-${i}.jpg`), data);
  }
  console.log('Successfully wrote brand-intro.jpg, our-story.jpg, and craft-1..6.jpg');
}
