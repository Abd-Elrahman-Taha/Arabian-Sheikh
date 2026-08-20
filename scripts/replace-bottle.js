import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const inputPath = 'C:/Users/b0ody/.gemini/antigravity/brain/11f02dcf-c642-431c-bad8-bdb47318fdf2/.user_uploaded/media_1787231359414.jpg';
const outputDir = './public/products';

async function processImage() {
  console.log('Reading image from:', inputPath);

  // 1. Copy as JPG
  const jpgDest = path.join(outputDir, 'ana_sukkar_white.jpg');
  fs.copyFileSync(inputPath, jpgDest);
  console.log('Copied original to:', jpgDest);

  // 2. Read metadata and raw pixels
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  console.log('Metadata:', metadata.width, 'x', metadata.height, 'channels:', metadata.channels);

  const { data, info } = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  const channels = info.channels; // 4 (RGBA)

  // Use flood-fill from edges/corners so white label elements inside the bottle aren't made transparent
  const visited = new Uint8Array(width * height);
  const queue = [];

  // Add all boundary pixels that are light/white
  for (let x = 0; x < width; x++) {
    queue.push(0 * width + x); // top
    queue.push((height - 1) * width + x); // bottom
  }
  for (let y = 0; y < height; y++) {
    queue.push(y * width + 0); // left
    queue.push(y * width + (width - 1)); // right
  }

  let head = 0;
  while (head < queue.length) {
    const idx = queue[head++];
    if (visited[idx]) continue;

    const px = idx % width;
    const py = Math.floor(idx / width);
    const byteOffset = idx * channels;

    const r = data[byteOffset];
    const g = data[byteOffset + 1];
    const b = data[byteOffset + 2];

    // Background threshold (near white)
    const isBg = (r > 230 && g > 230 && b > 230) || ((r + g + b) / 3 > 238);

    if (isBg) {
      visited[idx] = 1;
      data[byteOffset + 3] = 0; // make transparent

      // Check 4 neighbors
      if (px > 0 && !visited[idx - 1]) queue.push(idx - 1);
      if (px < width - 1 && !visited[idx + 1]) queue.push(idx + 1);
      if (py > 0 && !visited[idx - width]) queue.push(idx - width);
      if (py < height - 1 && !visited[idx + width]) queue.push(idx + width);
    } else if (r > 210 && g > 210 && b > 210) {
      // Soft edge
      visited[idx] = 1;
      const brightness = (r + g + b) / 3;
      const alpha = Math.max(0, Math.min(255, Math.round((240 - brightness) / 30 * 255)));
      data[byteOffset + 3] = alpha;
    }
  }

  const pngDest = path.join(outputDir, 'ana_sukkar_white.png');
  await sharp(data, {
    raw: {
      width,
      height,
      channels: 4
    }
  })
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(pngDest);

  console.log('Successfully saved transparent cutout to:', pngDest);
}

processImage().catch(console.error);
