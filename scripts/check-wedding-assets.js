#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando assets de bodas...\n');

const assetsPath = path.join(process.cwd(), 'public', 'assets');
const weddingImagesPath = path.join(assetsPath, 'wedding-images');
const musicPath = path.join(assetsPath, 'music');

console.log('📁 Rutas base:');
console.log('  - Assets:', assetsPath);
console.log('  - Wedding Images:', weddingImagesPath);
console.log('  - Music:', musicPath);
console.log('');

// Verificar estructura de assets
if (!fs.existsSync(assetsPath)) {
  console.log('❌ Carpeta /public/assets no existe');
  process.exit(1);
}

if (!fs.existsSync(weddingImagesPath)) {
  console.log('❌ Carpeta /public/assets/wedding-images no existe');
  process.exit(1);
}

if (!fs.existsSync(musicPath)) {
  console.log('❌ Carpeta /public/assets/music no existe');
  process.exit(1);
}

console.log('✅ Estructura de carpetas básica OK\n');

// Verificar bodas con imágenes
console.log('🖼️ Verificando imágenes de bodas:');
const weddingDirs = fs.readdirSync(weddingImagesPath).filter(item => {
  const itemPath = path.join(weddingImagesPath, item);
  return fs.statSync(itemPath).isDirectory();
});

if (weddingDirs.length === 0) {
  console.log('⚠️  No se encontraron carpetas de bodas en wedding-images');
} else {
  weddingDirs.forEach(weddingId => {
    console.log(`\n  📂 ${weddingId}:`);
    
    const weddingPath = path.join(weddingImagesPath, weddingId);
    const heroPath = path.join(weddingPath, 'hero.jpg');
    const couplePath = path.join(weddingPath, 'couple.jpg');
    const galleryPath = path.join(weddingPath, 'gallery');
    
    console.log(`    - hero.jpg: ${fs.existsSync(heroPath) ? '✅' : '❌'}`);
    console.log(`    - couple.jpg: ${fs.existsSync(couplePath) ? '✅' : '❌'}`);
    
    if (fs.existsSync(galleryPath)) {
      const galleryFiles = fs.readdirSync(galleryPath).filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
      });
      console.log(`    - gallery/: ✅ (${galleryFiles.length} imágenes)`);
      
      if (galleryFiles.length > 0) {
        galleryFiles.forEach(file => {
          console.log(`      • ${file}`);
        });
      }
    } else {
      console.log(`    - gallery/: ❌`);
    }
  });
}

// Verificar archivos de música
console.log('\n🎵 Verificando archivos de música:');
const musicFiles = fs.readdirSync(musicPath).filter(file => {
  const ext = path.extname(file).toLowerCase();
  return ['.mp3', '.wav', '.ogg', '.m4a'].includes(ext);
});

if (musicFiles.length === 0) {
  console.log('⚠️  No se encontraron archivos de música');
} else {
  musicFiles.forEach(file => {
    const filePath = path.join(musicPath, file);
    const stats = fs.statSync(filePath);
    const sizeKB = Math.round(stats.size / 1024);
    console.log(`  🎶 ${file} (${sizeKB} KB)`);
  });
}

console.log('\n✅ Verificación completada');
console.log('\n💡 Para deployment:');
console.log('   1. Asegúrate de que todas las carpetas y archivos se copien al servidor');
console.log('   2. Verifica que los permisos de lectura estén correctos');
console.log('   3. Confirma que las rutas sean accesibles desde el navegador');
console.log('   4. Prueba los endpoints API en producción');
