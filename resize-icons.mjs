import sharp from 'sharp';

const icons = [
  { src: 'public/icon-192x192.png', size: 192 },
  { src: 'public/icon-512x512.png', size: 512 },
  { src: 'public/icon-maskable-192x192.png', size: 192 },
  { src: 'public/icon-maskable-512x512.png', size: 512 },
];

for (const icon of icons) {
  await sharp(icon.src)
    .resize(icon.size, icon.size)
    .toFile(icon.src.replace('.png', '-resized.png'));
  console.log(`✅ Resized ${icon.src} to ${icon.size}x${icon.size}`);
}