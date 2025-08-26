#!/usr/bin/env node

/**
 * Script para desplegar las reglas de Firestore
 * 
 * Uso:
 * 1. Instala Firebase CLI: npm install -g firebase-tools
 * 2. Inicia sesión: firebase login
 * 3. Ejecuta este script: node deploy-rules.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Verificar que existe el archivo de reglas
const rulesPath = path.join(__dirname, 'firestore.rules');
if (!fs.existsSync(rulesPath)) {
  process.exit(1);
}

try {
  // Verificar que Firebase CLI está instalado
  execSync('firebase --version', { stdio: 'pipe' });
  
  // Verificar que hay un proyecto configurado
  try {
    const projectInfo = execSync('firebase use', { encoding: 'utf8' });
  } catch (error) {
    process.exit(1);
  }
  
  // Desplegar las reglas
  console.log('🚀 Desplegando reglas...');
  execSync('firebase deploy --only firestore:rules', { stdio: 'inherit' });
  
  console.log('\n✅ ¡Reglas de Firestore desplegadas correctamente!');
  console.log('\n📝 Las reglas permiten:');
  console.log('   • Lectura pública de invitaciones');
  console.log('   • Escritura desde admin (sin autenticación por ahora)');
  console.log('   • Creación y actualización de RSVP');
  console.log('   • Lectura de configuración general');
  
  console.log('\n⚠️  IMPORTANTE para producción:');
  console.log('   • Añade autenticación de admin');
  console.log('   • Restringe escritura solo a usuarios autorizados');
  console.log('   • Considera límites de rate limiting');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  
  if (error.message.includes('firebase')) {
    console.log('\n💡 Solución:');
    console.log('1. Instala Firebase CLI: npm install -g firebase-tools');
    console.log('2. Inicia sesión: firebase login');
    console.log('3. Configura proyecto: firebase use --add');
  }
  
  process.exit(1);
}
