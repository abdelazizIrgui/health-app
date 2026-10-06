// Run once:  node scripts/make-notification-icon.js
// Creates assets/notification-icon.png (a white drop on a transparent background).
// Android needs notification icons to be white and transparent.
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

const SIZE = 96;
const SCALE = 4; // draw 4x bigger and average down, so the edges are smooth
const BIG = SIZE * SCALE;

// Is this point (in the 96x96 picture) inside the drop?
function inside(x, y) {
  const cx = SIZE / 2;
  const cy = SIZE * 0.62;
  const r = SIZE * 0.27;
  if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) return true; // round bottom
  const top = SIZE * 0.1; // pointed top
  const baseY = cy - r * 0.3;
  if (y < top || y > baseY) return false;
  const half = ((y - top) / (baseY - top)) * r * 0.93;
  return Math.abs(x - cx) <= half;
}

const raw = Buffer.alloc((SIZE * 4 + 1) * SIZE);
for (let y = 0; y < SIZE; y++) {
  raw[y * (SIZE * 4 + 1)] = 0; // PNG filter type 0
  for (let x = 0; x < SIZE; x++) {
    let hits = 0;
    for (let sy = 0; sy < SCALE; sy++) {
      for (let sx = 0; sx < SCALE; sx++) {
        if (inside(x + (sx + 0.5) / SCALE, y + (sy + 0.5) / SCALE)) hits++;
      }
    }
    const o = y * (SIZE * 4 + 1) + 1 + x * 4;
    raw[o] = 255;
    raw[o + 1] = 255;
    raw[o + 2] = 255;
    raw[o + 3] = Math.round((hits / (SCALE * SCALE)) * 255);
  }
}

// PNG needs a CRC checksum on every block.
const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
};

const header = Buffer.alloc(13);
header.writeUInt32BE(SIZE, 0);
header.writeUInt32BE(SIZE, 4);
header[8] = 8; // 8 bits per channel
header[9] = 6; // RGBA

const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk('IHDR', header),
  chunk('IDAT', zlib.deflateSync(raw)),
  chunk('IEND', Buffer.alloc(0)),
]);

const out = path.join(__dirname, '..', 'assets', 'notification-icon.png');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, png);
console.log('Created', out);