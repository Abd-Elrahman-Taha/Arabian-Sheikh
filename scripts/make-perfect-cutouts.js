import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const publicProducts = path.resolve('public/products');

async function createVectorCutout(inputFile, outputFile) {
  const image = sharp(inputFile);
  const metadata = await image.metadata();
  const w = metadata.width;
  const h = metadata.height;

  // Build SVG path polygon for the royal flacon contour
  // We use normalized coordinates multiplied by width and height
  const points = [
    // Top finial
    [0.500, 0.178],
    [0.508, 0.182],
    [0.514, 0.190],
    [0.518, 0.205],
    [0.510, 0.222],
    [0.522, 0.228],
    // Crown right crest spikes & flare
    [0.550, 0.233],
    [0.575, 0.236],
    [0.602, 0.246],
    [0.605, 0.275],
    [0.598, 0.315],
    [0.585, 0.345],
    [0.574, 0.370],
    // Neck
    [0.565, 0.378],
    // Right shoulder
    [0.600, 0.395],
    [0.635, 0.412],
    [0.654, 0.428],
    // Right body side wall
    [0.654, 0.450],
    [0.651, 0.550],
    [0.648, 0.650],
    [0.645, 0.750],
    [0.643, 0.798],
    [0.640, 0.803],
    // Bottom base line
    [0.500, 0.803],
    [0.360, 0.803],
    // Left body side wall
    [0.357, 0.798],
    [0.355, 0.750],
    [0.352, 0.650],
    [0.349, 0.550],
    [0.346, 0.450],
    [0.346, 0.428],
    // Left shoulder
    [0.365, 0.412],
    [0.400, 0.395],
    // Neck
    [0.435, 0.378],
    // Crown left crest spikes & flare
    [0.426, 0.370],
    [0.415, 0.345],
    [0.402, 0.315],
    [0.395, 0.275],
    [0.398, 0.246],
    [0.425, 0.236],
    [0.450, 0.233],
    [0.478, 0.228],
    [0.490, 0.222],
    [0.482, 0.205],
    [0.486, 0.190],
    [0.492, 0.182]
  ];

  const pathData = points
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${(pt[0] * w).toFixed(2)} ${(pt[1] * h).toFixed(2)}`)
    .join(' ') + ' Z';

  const maskSvg = `
    <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
      <path d="${pathData}" fill="white" stroke="white" stroke-width="3" stroke-linejoin="round" />
    </svg>
  `;

  const maskBuffer = Buffer.from(maskSvg);

  const maskPng = await sharp(maskBuffer)
    .png()
    .toBuffer();

  await sharp(inputFile)
    .ensureAlpha()
    .composite([
      {
        input: maskPng,
        blend: 'dest-in'
      }
    ])
    .png()
    .toFile(outputFile);

  console.log(`Generated perfect vector cutout: ${outputFile}`);
}

async function run() {
  await createVectorCutout(
    path.join(publicProducts, 'billionaire_gold.jpg'),
    path.join(publicProducts, 'billionaire_gold.png')
  );

  await createVectorCutout(
    path.join(publicProducts, 'queens_secret_gold.jpg'),
    path.join(publicProducts, 'queens_secret_gold.png')
  );
}

run();
