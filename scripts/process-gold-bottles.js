import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const publicProducts = path.resolve('public/products');

async function segmentBottle(inputFile, outputFile) {
  console.log(`Segmenting ${inputFile}...`);

  const image = sharp(inputFile);
  const metadata = await image.metadata();
  const width = metadata.width;
  const height = metadata.height;

  const { data, info } = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const channels = 4;
  const outBuffer = Buffer.from(data);

  // 1. Flood fill from 4 outer borders to mark external background
  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let qHead = 0;
  let qTail = 0;

  function isBackgroundPixel(x, y) {
    const ny = y / height;
    const nx = x / width;
    const idx = (y * width + x) * channels;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];

    // Anything below bottom edge of bottle base (y > 80.5%)
    if (ny > 0.805) return true;
    // Anything far left or right (x < 33% or x > 67%)
    if (nx < 0.33 || nx > 0.67) return true;
    // Above crown tip (ny < 16.8%)
    if (ny < 0.168) return true;

    // Check if pixel is dark background (archway / velvet / shadows)
    const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
    const isGold = (r > 95 && g > 70 && (r + g) > 175) || brightness > 85;

    if (!isGold) return true;

    // In upper crown area outside crown width
    if (ny < 0.37) {
      const cx = width * 0.5;
      const distFromCenter = Math.abs(x - cx);
      if (distFromCenter > width * 0.135) return true;
      if (ny < 0.23 && distFromCenter > width * 0.07) return true;
      if (ny < 0.19 && distFromCenter > width * 0.035) return true;
    }

    return false;
  }

  // Seed boundary pixels
  for (let x = 0; x < width; x++) {
    const topIdx = 0 * width + x;
    const btmIdx = (height - 1) * width + x;
    visited[topIdx] = 1;
    queue[qTail++] = topIdx;
    visited[btmIdx] = 1;
    queue[qTail++] = btmIdx;
  }
  for (let y = 0; y < height; y++) {
    const leftIdx = y * width + 0;
    const rightIdx = y * width + (width - 1);
    if (!visited[leftIdx]) {
      visited[leftIdx] = 1;
      queue[qTail++] = leftIdx;
    }
    if (!visited[rightIdx]) {
      visited[rightIdx] = 1;
      queue[qTail++] = rightIdx;
    }
  }

  // BFS Flood Fill
  while (qHead < qTail) {
    const curr = queue[qHead++];
    const cx = curr % width;
    const cy = Math.floor(curr / width);

    const neighbors = [
      cy > 0 ? (cy - 1) * width + cx : -1,
      cy < height - 1 ? (cy + 1) * width + cx : -1,
      cx > 0 ? cy * width + (cx - 1) : -1,
      cx < width - 1 ? cy * width + (cx + 1) : -1
    ];

    for (let i = 0; i < 4; i++) {
      const nIdx = neighbors[i];
      if (nIdx >= 0 && !visited[nIdx]) {
        const nx = nIdx % width;
        const ny = Math.floor(nIdx / width);
        if (isBackgroundPixel(nx, ny)) {
          visited[nIdx] = 1;
          queue[qTail++] = nIdx;
        }
      }
    }
  }

  // 2. Set all visited background pixels to alpha = 0
  for (let i = 0; i < width * height; i++) {
    const byteOffset = i * channels;
    if (visited[i]) {
      outBuffer[byteOffset + 3] = 0;
    }
  }

  // 3. Smooth / feather outer boundaries
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      if (!visited[idx]) {
        let bgCount = 0;
        if (visited[(y - 1) * width + x]) bgCount++;
        if (visited[(y + 1) * width + x]) bgCount++;
        if (visited[y * width + (x - 1)]) bgCount++;
        if (visited[y * width + (x + 1)]) bgCount++;

        if (bgCount > 0) {
          const byteOffset = idx * channels;
          const factor = (4 - bgCount) / 4;
          outBuffer[byteOffset + 3] = Math.floor(255 * factor);
        }
      }
    }
  }

  await sharp(outBuffer, {
    raw: {
      width,
      height,
      channels
    }
  })
    .png()
    .toFile(outputFile);

  console.log(`Refined cutout saved to: ${outputFile}`);
}

async function run() {
  await segmentBottle(
    path.join(publicProducts, 'billionaire_gold.jpg'),
    path.join(publicProducts, 'billionaire_gold.png')
  );

  await segmentBottle(
    path.join(publicProducts, 'queens_secret_gold.jpg'),
    path.join(publicProducts, 'queens_secret_gold.png')
  );
}

run();
