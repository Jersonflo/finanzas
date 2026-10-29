// Ajusta la exportación web (carpeta dist) para GitHub Pages y para instalarla en el iPhone:
// - etiquetas para "Agregar a pantalla de inicio" (ícono, pantalla completa, manifest)
// - 404.html igual al index para que funcionen las rutas al recargar
// - .nojekyll para que GitHub Pages no esconda la carpeta _expo
const fs = require('fs');
const path = require('path');

const BASE = '/finanzas';
const dist = path.join(__dirname, '..', 'dist');
const archivo = path.join(dist, 'index.html');
let html = fs.readFileSync(archivo, 'utf8');

const etiquetas = `
    <link rel="manifest" href="${BASE}/manifest.json" />
    <link rel="apple-touch-icon" href="${BASE}/apple-touch-icon.png" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="Finanzas" />
    <meta name="theme-color" content="#ffffff" />
  `;

html = html
  .replace(/<html[^>]*>/, '<html lang="es">')
  .replace(/<title>.*?<\/title>/, '<title>Finanzas</title>')
  // viewport-fit=cover deja usar la zona de la barra de gestos; sin zoom al tocar inputs.
  .replace(/<meta name="viewport"[^>]*>/, '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />')
  .replace('</head>', `${etiquetas}</head>`);

fs.writeFileSync(archivo, html);
fs.writeFileSync(path.join(dist, '404.html'), html);
fs.writeFileSync(path.join(dist, '.nojekyll'), '');
console.log('✓ dist listo para GitHub Pages');
