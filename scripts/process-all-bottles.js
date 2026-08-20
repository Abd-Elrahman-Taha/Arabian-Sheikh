import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const millionaireInput = 'C:/Users/b0ody/.gemini/antigravity/brain/11f02dcf-c642-431c-bad8-bdb47318fdf2/.user_uploaded/media_1787231359414.jpg';
const anaSukkarInput = 'C:/Users/b0ody/.gemini/antigravity/brain/11f02dcf-c642-431c-bad8-bdb47318fdf2/.user_uploaded/media_1787231553982.jpg';
const outputDir = './public/products';

async function processBottle(inputPath, baseName) {
  console.log(`Processing ${baseName} from ${inputPath}...`);

  // 1. Copy full original JPG
  const jpgDest = path.join(outputDir, `${baseName}.jpg`);
  fs.copyFileSync(inputPath, jpgDest);
  console.log(`Saved original JPG to ${jpgDest}`);

  // 2. Read raw image buffer
  const image = sharp(inputPath);
  const { data, info } = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  const channels = info.channels; // 4 (RGBA)

  // 3. Flood-fill from outer edges to isolate and remove outer background
  const visited = new Uint8Array(width * height);
  const queue = [];

  // Seed boundary coordinates
  for (let x = 0; x < width; x++) {
    queue.push(0 * width + x); // Top edge
    queue.push((height - 1) * width + x); // Bottom edge
  }
  for (let y = 0; y < height; y++) {
    queue.push(y * width + 0); // Left edge
    queue.push(y * width + (width - 1)); // Right edge
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

    // Background threshold (pure white to off-white studio backdrop)
    const avgBrightness = (r + g + b) / 3;
    const isBg = (r > 232 && g > 232 && b > 232) || avgBrightness > 236;

    if (isBg) {
      visited[idx] = 1;
      data[byteOffset + 3] = 0; // Transparent

      // Check 4-connected neighbors
      if (px > 0 && !visited[idx - 1]) queue.push(idx - 1);
      if (px < width - 1 && !visited[idx + 1]) queue.push(idx + 1);
      if (py > 0 && !visited[idx - width]) queue.push(idx - width);
      if (py < height - 1 && !visited[idx + width]) queue.push(idx + width);
    } else if (avgBrightness > 215) {
      // Antialiased border feathering
      visited[idx] = 1;
      const alpha = Math.max(0, Math.min(255, Math.round((236 - avgBrightness) / 21 * 255)));
      data[byteOffset + 3] = alpha;
    }
  }

  // 4. Save transparent PNG
  const pngDest = path.join(outputDir, `${baseName}.png`);
  await sharp(data, {
    raw: {
      width,
      height,
      channels: 4
    }
  })
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(pngDest);

  console.log(`Successfully saved transparent cutout to ${pngDest}`);
}

async function run() {
  await processBottle(millionaireInput, 'millionaire_black');
  await processBottle(anaSukkarInput, 'ana_sukkar_white');
  console.log('All bottles processed successfully!');
}

run().catch(console.error);
