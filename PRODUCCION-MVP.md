# 🚀 Configuración MVP para Producción

## 📋 IDs de Prueba Disponibles

El sistema incluye **2 datasets de prueba** completamente funcionales:

### 1. María & Carlos (Dataset principal)
- **ID**: `maria-carlos-2025`
- **URL**: `/wedding/maria-carlos-2025`
- **URL en inglés**: `/en/wedding/maria-carlos-2025`

### 2. Ana & Luis (Dataset alternativo)
- **ID**: `ana-luis-2025` 
- **URL**: `/wedding/ana-luis-2025`
- **URL en inglés**: `/en/wedding/ana-luis-2025`

## ⚙️ Variables de Entorno para Producción

Para que los IDs de prueba funcionen en producción, configurar estas variables de entorno:

```bash
# En tu plataforma de deployment (Vercel, Netlify, etc.)
NEXT_PUBLIC_USE_MOCK=true
NODE_ENV=production
```

## 🌐 URLs de Demostración

Una vez desplegado, las siguientes URLs mostrarán invitaciones completas:

### Español (por defecto):
- **Base**: `https://tu-dominio.com/` → Carga automáticamente `maria-carlos-2025`
- **Específica**: `https://tu-dominio.com/wedding/maria-carlos-2025`
- **Alternativa**: `https://tu-dominio.com/wedding/ana-luis-2025`

### Inglés:
- **Base**: `https://tu-dominio.com/en` → Carga automáticamente `maria-carlos-2025`
- **Específica**: `https://tu-dominio.com/en/wedding/maria-carlos-2025`
- **Alternativa**: `https://tu-dominio.com/en/wedding/ana-luis-2025`

## 📱 Funcionalidades Incluidas

### ✅ Completamente dinámico:
- [x] Nombres de pareja desde Redux
- [x] Fechas y horarios dinámicos
- [x] Traducciones español/inglés
- [x] Galería de fotos
- [x] Timeline de eventos
- [x] Información de venue
- [x] Formulario RSVP
- [x] Código de vestimenta
- [x] Información de hospedaje
- [x] Diseño responsive

### 🎨 Estilo elegante:
- [x] Diseño minimalista
- [x] Tipografía serif elegante
- [x] Colores stone difuminados
- [x] Animaciones suaves
- [x] Espaciado optimizado (py-12)

## 🔧 Configuración de Deployment

### Vercel:
1. Conectar repositorio
2. Configurar variables de entorno:
   - `NEXT_PUBLIC_USE_MOCK=true`
3. Deploy

### Netlify:
1. Conectar repositorio  
2. Build command: `npm run build`
3. Configurar variables de entorno:
   - `NEXT_PUBLIC_USE_MOCK=true`
4. Deploy

### Otros providers:
Asegurar que `NEXT_PUBLIC_USE_MOCK=true` esté configurado.

## 📊 Datos de Ejemplo

### María & Carlos:
- **Fecha**: 21 de Noviembre, 2025
- **Venue**: Jardines del Edén
- **Estilo**: Formal/Cocktail
- **Idiomas**: Español e Inglés

### Ana & Luis:
- **Fecha**: 15 de Septiembre, 2025  
- **Venue**: Hacienda San Miguel
- **Estilo**: Garden Party/Semi-Formal
- **Idiomas**: Español e Inglés

## 🎯 MVP Listo

✅ **El sistema está 100% funcional para presentar como MVP**
✅ **Los IDs de prueba cargarán automáticamente**
✅ **Diseño profesional y responsive**
✅ **Traducciones completas**
✅ **Datos dinámicos desde Redux**

El sistema carga automáticamente datos mock cuando NEXT_PUBLIC_USE_MOCK=true. 