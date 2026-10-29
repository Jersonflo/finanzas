// Genera los íconos PNG de la app web (pantalla de inicio del iPhone) sin dependencias:
// fondo azul con una dona de colores pastel, como la gráfica de Análisis.
// Uso: node scripts/generar-iconos.js
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const FONDO = [0x20, 0x8a, 0xef];
const PORCIONES = [
  { hasta: 0.42, color: [0xff, 0xff, 0xff] },
  { hasta: 0.68, color: [0xf7, 0xc6, 0x6b] },
  { hasta: 0.86, color: [0xf2, 0x8b, 0x82] },
  { hasta: 1.0, color: [0x8f, 0xd3, 0xa8] },
];

function colorEn(x, y) {
  const dx = x - 0.5;
  const dy = y - 0.5;
  const r = Math.hypot(dx, dy);
  if (r < 0.19 || r > 0.33) return FONDO;
  // Ángulo desde las 12 en punto, en sentido horario, de 0 a 1.
  const angulo = (Math.atan2(dx, -dy) / (2 * Math.PI) + 1) % 1;
  // Pequeña separación blanca entre porciones.
  for (const p of PORCIONES) if (angulo < p.hasta - 0.006) return p.color;
  return FONDO;
}

function png(tamano) {
  const sub = 4; // supermuestreo para bordes suaves
  const filas = [];
  for (let y = 0; y < tamano; y++) {
    const fila = Buffer.alloc(1 + tamano * 3);
    for (let x = 0; x < tamano; x++) {
      let rgb = [0, 0, 0];
      for (let sy = 0; sy < sub; sy++)
        for (let sx = 0; sx < sub; sx++) {
          const c = colorEn((x + (sx + 0.5) / sub) / tamano, (y + (sy + 0.5) / sub) / tamano);
          rgb = rgb.map((v, i) => v + c[i]);
        }
      rgb.forEach((v, i) => (fila[1 + x * 3 + i] = Math.round(v / (sub * sub))));
    }
    filas.push(fila);
  }

  const crc = (buf) => {
    let c = ~0;
    for (const b of buf) {
      c ^= b;
      for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
    }
    return ~c >>> 0;
  };
  const bloque = (tipo, datos) => {
    const largo = Buffer.alloc(4);
    largo.writeUInt32BE(datos.length);
    const td = Buffer.concat([Buffer.from(tipo), datos]);
    const c = Buffer.alloc(4);
    c.writeUInt32BE(crc(td));
    return Buffer.concat([largo, td, c]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(tamano, 0);
  ihdr.writeUInt32BE(tamano, 4);
  ihdr[8] = 8; // bits por canal
  ihdr[9] = 2; // RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    bloque('IHDR', ihdr),
    bloque('IDAT', zlib.deflateSync(Buffer.concat(filas))),
    bloque('IEND', Buffer.alloc(0)),
  ]);
}

const destino = path.join(__dirname, '..', 'public');
fs.mkdirSync(destino, { recursive: true });
for (const [nombre, tamano] of [
  ['apple-touch-icon.png', 180],
  ['icon-192.png', 192],
  ['icon-512.png', 512],
]) {
  fs.writeFileSync(path.join(destino, nombre), png(tamano));
  console.log('✓', nombre);
}
