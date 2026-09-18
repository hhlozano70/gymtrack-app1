import fs from 'fs';
import path from 'path';
import { encode } from 'fast-png';

function createIcon(size, isMaskable = false) {
  const data = new Uint8Array(size * size * 4);
  const scale = size / 512;

  const setPixel = (x, y, r, g, b, a = 255) => {
    if (x < 0 || x >= size || y < 0 || y >= size) return;
    const idx = (Math.floor(y) * size + Math.floor(x)) * 4;
    // Simple alpha blending
    const srcA = a / 255;
    const destA = data[idx + 3] / 255;
    const outA = srcA + destA * (1 - srcA);
    if (outA > 0) {
      data[idx] = Math.round((r * srcA + data[idx] * destA * (1 - srcA)) / outA);
      data[idx + 1] = Math.round((g * srcA + data[idx + 1] * destA * (1 - srcA)) / outA);
      data[idx + 2] = Math.round((b * srcA + data[idx + 2] * destA * (1 - srcA)) / outA);
      data[idx + 3] = Math.round(outA * 255);
    }
  };

  const drawRect = (rx, ry, rw, rh, r, g, b, a = 255) => {
    const startX = Math.max(0, Math.floor(rx * scale));
    const endX = Math.min(size, Math.ceil((rx + rw) * scale));
    const startY = Math.max(0, Math.floor(ry * scale));
    const endY = Math.min(size, Math.ceil((ry + rh) * scale));
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        setPixel(x, y, r, g, b, a);
      }
    }
  };

  const drawRoundedRect = (rx, ry, rw, rh, radius, r, g, b, a = 255) => {
    const sx = rx * scale;
    const sy = ry * scale;
    const sw = rw * scale;
    const sh = rh * scale;
    const rad = radius * scale;

    const startX = Math.max(0, Math.floor(sx));
    const endX = Math.min(size, Math.ceil(sx + sw));
    const startY = Math.max(0, Math.floor(sy));
    const endY = Math.min(size, Math.ceil(sy + sh));

    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        let inside = true;
        // Check 4 corners
        if (x < sx + rad && y < sy + rad) {
          const dx = x - (sx + rad);
          const dy = y - (sy + rad);
          if (dx * dx + dy * dy > rad * rad) inside = false;
        } else if (x > sx + sw - rad && y < sy + rad) {
          const dx = x - (sx + sw - rad);
          const dy = y - (sy + rad);
          if (dx * dx + dy * dy > rad * rad) inside = false;
        } else if (x < sx + rad && y > sy + sh - rad) {
          const dx = x - (sx + rad);
          const dy = y - (sy + sh - rad);
          if (dx * dx + dy * dy > rad * rad) inside = false;
        } else if (x > sx + sw - rad && y > sy + sh - rad) {
          const dx = x - (sx + sw - rad);
          const dy = y - (sy + sh - rad);
          if (dx * dx + dy * dy > rad * rad) inside = false;
        }
        if (inside) {
          setPixel(x, y, r, g, b, a);
        }
      }
    }
  };

  // 1. Base background
  // For maskable, full-bleed solid/gradient. For normal, sleek squircle with dark slate #0f172a
  if (isMaskable) {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        // Gradient from #0f172a to #1e293b
        const ratio = (x + y) / (size * 2);
        const r = Math.round(15 + ratio * (30 - 15));
        const g = Math.round(23 + ratio * (41 - 23));
        const b = Math.round(42 + ratio * (59 - 42));
        setPixel(x, y, r, g, b, 255);
      }
    }
  } else {
    // Elegant squircle with rounded corners (radius 112 out of 512)
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const ratio = (x + y) / (size * 2);
        const r = Math.round(15 + ratio * (30 - 15));
        const g = Math.round(23 + ratio * (41 - 23));
        const b = Math.round(42 + ratio * (59 - 42));
        setPixel(x, y, r, g, b, 255);
      }
    }
    // Border ring in emerald
    drawRoundedRect(8, 8, 496, 496, 108, 16, 185, 129, 60);
  }

  // Safe-zone offset factor (for maskable, slightly scale inside safe circle)
  const pad = isMaskable ? 0.85 : 1.0;
  const cx = 256;
  const cy = 256;

  const transformX = (x) => cx + (x - cx) * pad;
  const transformY = (y) => cy + (y - cy) * pad;
  const transformW = (w) => w * pad;
  const transformH = (h) => h * pad;

  // 2. Glow around dumbbell (drawn with soft emerald)
  drawRoundedRect(transformX(90), transformY(160), transformW(332), transformH(192), 30, 16, 185, 129, 45);

  // 3. Central Bar (Metallic steel #e2e8f0)
  drawRoundedRect(transformX(190), transformY(242), transformW(132), transformH(28), 8, 226, 232, 240);

  // Knurling grooves
  drawRect(transformX(230), transformY(242), transformW(4), transformH(28), 148, 163, 184);
  drawRect(transformX(246), transformY(242), transformW(4), transformH(28), 148, 163, 184);
  drawRect(transformX(262), transformY(242), transformW(4), transformH(28), 148, 163, 184);
  drawRect(transformX(278), transformY(242), transformW(4), transformH(28), 148, 163, 184);

  // 4. Left Weight Plates
  // Inner collar
  drawRoundedRect(transformX(174), transformY(222), transformW(16), transformH(68), 5, 5, 150, 105);
  // Medium plate
  drawRoundedRect(transformX(144), transformY(196), transformW(24), transformH(120), 8, 16, 185, 129);
  // Heavy main plate (vibrant emerald #10b981)
  drawRoundedRect(transformX(114), transformY(172), transformW(24), transformH(168), 9, 52, 211, 153);
  // Outer plate stopper
  drawRoundedRect(transformX(94), transformY(234), transformW(16), transformH(44), 4, 203, 213, 225);

  // 5. Right Weight Plates
  // Inner collar
  drawRoundedRect(transformX(322), transformY(222), transformW(16), transformH(68), 5, 5, 150, 105);
  // Medium plate
  drawRoundedRect(transformX(344), transformY(196), transformW(24), transformH(120), 8, 16, 185, 129);
  // Heavy main plate
  drawRoundedRect(transformX(374), transformY(172), transformW(24), transformH(168), 9, 52, 211, 153);
  // Outer plate stopper
  drawRoundedRect(transformX(402), transformY(234), transformW(16), transformH(44), 4, 203, 213, 225);

  // 6. Energy Core / Lightning bolt at top
  // Center lightning badge
  drawRoundedRect(transformX(236), transformY(130), transformW(40), transformH(50), 12, 16, 185, 129, 230);
  drawRoundedRect(transformX(242), transformY(136), transformW(28), transformH(38), 8, 255, 255, 255, 240);

  // 7. Bottom Brand Pill
  drawRoundedRect(transformX(180), transformY(372), transformW(152), transformH(36), 18, 16, 185, 129);

  return encode({ width: size, height: size, data });
}

// Generate all icons
const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

console.log('Generating PWA and Android icon assets...');

const pwa192 = createIcon(192, false);
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), Buffer.from(pwa192));
console.log('Created public/pwa-192x192.png');

const pwa512 = createIcon(512, false);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), Buffer.from(pwa512));
console.log('Created public/pwa-512x512.png');

const pwaMaskable = createIcon(512, true);
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), Buffer.from(pwaMaskable));
console.log('Created public/pwa-maskable-512x512.png');

const appleTouch = createIcon(180, false);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), Buffer.from(appleTouch));
console.log('Created public/apple-touch-icon.png');

const favicon = createIcon(64, false);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), Buffer.from(favicon));
console.log('Created public/favicon.ico');

console.log('All icons generated successfully!');
