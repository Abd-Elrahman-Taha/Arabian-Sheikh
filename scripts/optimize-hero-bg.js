import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const editorialDir = path.join(__dirname, '..', 'public', 'editorial');

async function optimizeHeroImages() {
  console.log('Optimizing hero background images in:', editorialDir);

  const phoneWebp = path.join(editorialDir, 'mainPhone.webp');
  const deskWebp = path.join(editorialDir, 'maindesk.webp');

  if (!fs.existsSync(phoneWebp)) {
    console.error('File not found:', phoneWebp);
    return;
  }
  if (!fs.existsSync(deskWebp)) {
    console.error('File not found:', deskWebp);
    return;
  }

  // Backup originals if not already backed up
  const phoneWebpBackup = path.join(editorialDir, 'mainPhone_raw.webp');
  const deskWebpBackup = path.join(editorialDir, 'maindesk_raw.webp');

  if (!fs.existsSync(phoneWebpBackup)) {
    fs.copyFileSync(phoneWebp, phoneWebpBackup);
    console.log('Backed up mainPhone.webp -> mainPhone_raw.webp');
  }
  if (!fs.existsSync(deskWebpBackup)) {
    fs.copyFileSync(deskWebp, deskWebpBackup);
    console.log('Backed up maindesk.webp -> maindesk_raw.webp');
  }

  const phoneInput = fs.existsSync(phoneWebpBackup) ? phoneWebpBackup : phoneWebp;
  const deskInput = fs.existsSync(deskWebpBackup) ? deskWebpBackup : deskWebp;

  // 1. Inspect Phone Image
  const phoneMeta = await sharp(phoneInput).metadata();
  console.log('Phone metadata:', {
    width: phoneMeta.width,
    height: phoneMeta.height,
    format: phoneMeta.format,
    size: fs.statSync(phoneInput).size
  });

  // 2. Inspect Desktop Image
  const deskMeta = await sharp(deskInput).metadata();
  console.log('Desktop metadata:', {
    width: deskMeta.width,
    height: deskMeta.height,
    format: deskMeta.format,
    size: fs.statSync(deskInput).size
  });

  // Target mobile: width up to 1080 (standard full HD mobile width)
  const targetPhoneWidth = Math.min(phoneMeta.width || 1080, 1080);
  
  // Target desktop: width up to 2560 (2K/QHD) or 1920
  const targetDeskWidth = Math.min(deskMeta.width || 2560, 2560);

  // Generate mainPhone.webp (Optimized mobile WebP ~250-350 KB)
  console.log('Generating optimized mainPhone.webp...');
  await sharp(phoneInput)
    .resize({ width: targetPhoneWidth, withoutEnlargement: true })
    .webp({ quality: 80, effort: 6 })
    .toFile(path.join(editorialDir, 'mainPhone_temp.webp'));

  fs.renameSync(path.join(editorialDir, 'mainPhone_temp.webp'), path.join(editorialDir, 'mainPhone.webp'));

  // Generate mainPhone.jpg (Optimized mobile JPG fallback ~350-450 KB)
  console.log('Generating mainPhone.jpg...');
  await sharp(phoneInput)
    .resize({ width: targetPhoneWidth, withoutEnlargement: true })
    .jpeg({ quality: 80, progressive: true, mozjpeg: true })
    .toFile(path.join(editorialDir, 'mainPhone.jpg'));

  // Generate maindesk.webp (Optimized desktop WebP ~380-450 KB)
  console.log('Generating optimized maindesk.webp...');
  await sharp(deskInput)
    .resize({ width: targetDeskWidth, withoutEnlargement: true })
    .webp({ quality: 82, effort: 6 })
    .toFile(path.join(editorialDir, 'maindesk_temp.webp'));

  fs.renameSync(path.join(editorialDir, 'maindesk_temp.webp'), path.join(editorialDir, 'maindesk.webp'));

  // Generate maindesk.jpg (Optimized desktop JPG fallback ~400-500 KB)
  console.log('Generating maindesk.jpg...');
  await sharp(deskInput)
    .resize({ width: targetDeskWidth, withoutEnlargement: true })
    .jpeg({ quality: 80, progressive: true, mozjpeg: true })
    .toFile(path.join(editorialDir, 'maindesk.jpg'));

  console.log('Finished optimization!');
  console.log('Results:');
  console.log('mainPhone.webp:', (fs.statSync(path.join(editorialDir, 'mainPhone.webp')).size / 1024).toFixed(1), 'KB');
  console.log('mainPhone.jpg:', (fs.statSync(path.join(editorialDir, 'mainPhone.jpg')).size / 1024).toFixed(1), 'KB');
  console.log('maindesk.webp:', (fs.statSync(path.join(editorialDir, 'maindesk.webp')).size / 1024).toFixed(1), 'KB');
  console.log('maindesk.jpg:', (fs.statSync(path.join(editorialDir, 'maindesk.jpg')).size / 1024).toFixed(1), 'KB');
}

optimizeHeroImages().catch(err => {
  console.error('Error during image optimization:', err);
  process.exit(1);
});
