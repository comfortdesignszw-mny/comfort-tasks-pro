import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// Header Wrench specs:
// Container: bg-emerald-600 (#059669)
// Wrench: white (#ffffff), stroke-width 2, round linecap & linejoin
// Path from lucide-react Wrench:
const WRENCH_PATH =
  'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z';

function createSvgString({ size, iconScale = 0.5, borderRadius = 0 }) {
  const iconSize = size * iconScale;
  const offset = (size - iconSize) / 2;
  const scale = iconSize / 24;
  const strokeWidth = 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${borderRadius}" ry="${borderRadius}" fill="#059669" />
  <g transform="translate(${offset}, ${offset}) scale(${scale})">
    <path
      d="${WRENCH_PATH}"
      fill="none"
      stroke="#ffffff"
      stroke-width="${strokeWidth}"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </g>
</svg>`;
}

function createIcoBuffer(png32Buffer) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // ICO type
  header.writeUInt16LE(1, 4); // 1 image

  const dirEntry = Buffer.alloc(16);
  dirEntry.writeUInt8(32, 0); // width
  dirEntry.writeUInt8(32, 1); // height
  dirEntry.writeUInt8(0, 2); // color count
  dirEntry.writeUInt8(0, 3); // reserved
  dirEntry.writeUInt16LE(1, 4); // planes
  dirEntry.writeUInt16LE(32, 6); // bpp
  dirEntry.writeUInt32LE(png32Buffer.length, 8); // size
  dirEntry.writeUInt32LE(22, 12); // offset (6 + 16 = 22)

  return Buffer.concat([header, dirEntry, png32Buffer]);
}

async function run() {
  const publicDir = path.resolve('public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // 1. Save standard icon.svg (512x512 with subtle rounded corner or full bleed)
  const svg512 = createSvgString({ size: 512, iconScale: 0.52 });
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svg512, 'utf8');
  console.log('Saved icon.svg');

  // 2. Generate 512x512 PNG (standard)
  await sharp(Buffer.from(svg512))
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('Saved pwa-512x512.png');

  // 3. Generate 192x192 PNG (standard)
  const svg192 = createSvgString({ size: 192, iconScale: 0.52 });
  await sharp(Buffer.from(svg192))
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('Saved pwa-192x192.png');

  // 4. Generate maskable 512x512 PNG
  // For maskable icons: safe zone is the central 80% circle (radius ~204px).
  // An iconScale of 0.48 comfortably guarantees all edges stay well within the safe zone margin.
  const svgMaskable = createSvgString({ size: 512, iconScale: 0.48 });
  await sharp(Buffer.from(svgMaskable))
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('Saved pwa-maskable-512x512.png');

  // 5. Generate apple-touch-icon.png (180x180 PNG, iOS home screen standard)
  const svg180 = createSvgString({ size: 180, iconScale: 0.52 });
  await sharp(Buffer.from(svg180))
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Saved apple-touch-icon.png');

  // 6. Favicons (32x32, 16x16, favicon.ico)
  const svg32 = createSvgString({ size: 32, iconScale: 0.55 });
  const png32 = await sharp(Buffer.from(svg32)).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), png32);

  const svg16 = createSvgString({ size: 16, iconScale: 0.55 });
  const png16 = await sharp(Buffer.from(svg16)).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'favicon-16x16.png'), png16);

  const icoBuffer = createIcoBuffer(png32);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  console.log('Saved favicons');

  console.log('All PWA icons generated successfully!');
}

run().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
