# 🚀 Guía de Deployment - Assets Dinámicos

## 🔍 Problema Identificado

Las imágenes dinámicas funcionan en **desarrollo** pero no en **producción**.

## 📋 Checklist de Deployment

### 1. ✅ Verificar Assets Localmente
```bash
# Ejecutar antes del deployment
node scripts/check-wedding-assets.js
```

### 2. 📁 Estructura de Archivos Requerida
```
public/assets/
├── wedding-images/
│   └── [weddingId]/
│       ├── hero.jpg          # Imagen principal
│       ├── couple.jpg        # Imagen de pareja
│       └── gallery/          # Galería
│           ├── image1.jpeg
│           ├── image2.jpeg
│           └── ...
└── music/
    ├── [weddingId].mp3      # Música personalizada
    └── default.mp3          # Música por defecto
```

### 3. 🚀 Deployment Steps

#### Para Vercel:
```bash
# 1. Asegurar que public/ se incluya en el build
npm run build

# 2. Verificar que .vercelignore NO excluya public/assets/
# Crear/verificar .vercelignore:
echo "!public/assets/" >> .vercelignore

# 3. Deploy
vercel --prod
```

#### Para Netlify:
```bash
# 1. Verificar netlify.toml
[build]
  publish = ".next"
  
[[redirects]]
  from = "/assets/*"
  to = "/assets/:splat"
  status = 200

# 2. Deploy
netlify deploy --prod --dir=.next
```

#### Para otros proveedores:
- Asegurar que `public/assets/` se copie al servidor
- Verificar permisos de lectura en archivos
- Confirmar que las rutas sean accesibles

### 4. 🧪 Testing en Producción

#### Verificar API Endpoints:
```bash
# Probar API de imágenes
curl https://tu-dominio.com/api/wedding-images/friends-test

# Probar API de música  
curl https://tu-dominio.com/api/wedding-music/friends-test

# Probar acceso directo a archivos
curl -I https://tu-dominio.com/assets/wedding-images/friends-test/hero.jpg
curl -I https://tu-dominio.com/assets/music/friends-test.mp3
```

#### Verificar en Navegador:
1. Abrir DevTools → Network
2. Cargar página de boda
3. Verificar que las imágenes se carguen desde `/assets/wedding-images/`
4. Verificar que no haya errores 404

### 5. 🐛 Debugging en Producción

#### Habilitar logs temporalmente:
```javascript
// En next.config.js, comentar temporalmente:
compiler: {
  // removeConsole: process.env.NODE_ENV === 'production', // ← Comentar esta línea
},
```

#### Logs a buscar en consola:
```
🖼️ API Debug - weddingId: friends-test
🖼️ API Debug - process.cwd(): /var/task (o similar)
🖼️ API Debug - baseExists: true/false
🖼️ API Debug - galleryExists: true/false
```

### 6. 🔧 Soluciones Comunes

#### Problema: API devuelve arrays vacíos
**Causa**: Archivos no se copiaron al servidor
**Solución**: 
- Verificar que `public/assets/` esté en el build
- Revisar configuración de deployment

#### Problema: Error 404 en archivos
**Causa**: Permisos o rutas incorrectas
**Solución**:
- Verificar permisos de lectura
- Confirmar estructura de carpetas

#### Problema: Funciona en staging pero no en prod
**Causa**: Diferencias en configuración de entorno
**Solución**:
- Comparar variables de entorno
- Verificar configuración de servidor

### 7. 📊 Monitoreo

#### Métricas a vigilar:
- Tasa de éxito de carga de imágenes personalizadas
- Tiempo de respuesta del API
- Errores 404 en assets

#### Logs importantes:
```bash
# Buscar en logs del servidor:
grep "wedding-images" /var/log/app.log
grep "API Debug" /var/log/app.log
grep "Error reading wedding images" /var/log/app.log
```

## 🎯 Próximos Pasos

1. **Ejecutar script de verificación**: `node scripts/check-wedding-assets.js`
2. **Hacer deployment con logs habilitados**
3. **Probar endpoints en producción**
4. **Verificar carga de imágenes en navegador**
5. **Deshabilitar logs una vez confirmado el funcionamiento**

## 📞 Soporte

Si el problema persiste después de seguir esta guía:

1. Ejecutar el script de diagnóstico
2. Capturar logs de la consola del navegador
3. Probar los endpoints API directamente
4. Verificar que los archivos estén físicamente en el servidor
