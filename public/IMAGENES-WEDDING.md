# 📸 Sistema de Imágenes Dinámicas para Bodas

## 🎯 Cómo Funciona

El sistema de imágenes dinámicas carga automáticamente imágenes personalizadas para cada boda desde la carpeta `public/[weddingId]/`.

### 📁 Estructura de Carpetas

Para cada boda, crea una carpeta con el ID de la boda en `public/assets/wedding-images/`:

```
public/assets/wedding-images/
├── [weddingId]/
│   ├── hero.jpg          # Imagen principal del hero
│   ├── couple.jpg        # Imagen de la pareja (sección About)
│   └── gallery/          # Carpeta de galería
│       ├── 1.jpg, 1.jpeg
│       ├── 2.jpg, 2.jpeg
│       ├── image1.jpg, image1.jpeg
│       ├── image2.jpg, image2.jpeg
│       ├── photo1.jpg, photo1.jpeg
│       └── ... (más imágenes)
```

### 🖼️ Tipos de Imágenes

#### 1. **Hero Image** (`hero.jpg`)
- **Ubicación**: `public/assets/wedding-images/[weddingId]/hero.jpg`
- **Uso**: Imagen principal de fondo del hero
- **Dimensiones recomendadas**: 2000x1200px o similar
- **Formato**: JPG (optimizado para web)

#### 2. **Couple Image** (`couple.jpg`)
- **Ubicación**: `public/assets/wedding-images/[weddingId]/couple.jpg`
- **Uso**: Imagen de la pareja en la sección "About"
- **Dimensiones recomendadas**: 800x1000px (vertical)
- **Formato**: JPG (optimizado para web)

#### 3. **Gallery Images** (`gallery/`)
- **Ubicación**: `public/assets/wedding-images/[weddingId]/gallery/`
- **Uso**: Carrusel de imágenes de la galería
- **Nombres aceptados**:
  - `1.jpg`, `2.jpg`, `3.jpg`, ... (hasta 12.jpg)
  - `1.jpeg`, `2.jpeg`, `3.jpeg`, ... (hasta 12.jpeg)
  - `image1.jpg`, `image2.jpg`, ... (hasta image12.jpg)
  - `image1.jpeg`, `image2.jpeg`, ... (hasta image12.jpeg)
  - `photo1.jpg`, `photo2.jpg`, ... (hasta photo6.jpg)
  - `photo1.jpeg`, `photo2.jpeg`, ... (hasta photo6.jpeg)
  - `img1.jpg`, `img2.jpg`, ... (hasta img6.jpg)
  - `img1.jpeg`, `img2.jpeg`, ... (hasta img6.jpeg)
- **Dimensiones recomendadas**: 1200x800px
- **Formato**: JPG o JPEG (optimizado para web)

## 🔄 Comportamiento del Sistema

### ✅ **Si existe la boda en Firebase:**
- Carga `hero.jpg` desde `public/assets/wedding-images/[weddingId]/hero.jpg`
- Carga `couple.jpg` desde `public/assets/wedding-images/[weddingId]/couple.jpg`
- Carga todas las imágenes encontradas en `public/assets/wedding-images/[weddingId]/gallery/`

### ❌ **Si NO existe la boda:**
- Usa las imágenes por defecto de María y Carlos (Unsplash)
- Mantiene la funcionalidad completa del template

## 📝 Ejemplo Práctico

Para una boda con ID `friends-test`:

```
public/assets/wedding-images/friends-test/
├── hero.jpg              # Imagen del hero
├── couple.jpg            # Imagen de la pareja
└── gallery/
    ├── image1.jpeg       # Primera imagen de galería
    ├── image2.jpeg       # Segunda imagen de galería
    ├── image3.jpeg       # Tercera imagen de galería
    ├── image4.jpeg       # Cuarta imagen de galería
    ├── image5.jpg        # Quinta imagen de galería
    ├── image6.jpg        # Sexta imagen de galería
    └── image7.jpg        # Séptima imagen de galería
```

## 🚀 Implementación Técnica

El sistema usa el hook personalizado `useWeddingImages()` que:

1. **Detecta** si hay datos de boda en Redux
2. **Genera** las rutas de imágenes basadas en el `weddingId`
3. **Retorna** las URLs correctas para cada componente
4. **Fallback** automático a imágenes por defecto si no existe la boda

### Componentes Afectados:
- **Hero.tsx**: Usa `heroImage`
- **About.tsx**: Usa `coupleImage`
- **Gallery.tsx**: Usa `galleryImages[]`

## 💡 Ventajas

- ✅ **Automático**: No requiere configuración manual
- ✅ **Fallback**: Siempre funciona aunque no haya imágenes personalizadas
- ✅ **Flexible**: Acepta múltiples nombres de archivo para la galería
- ✅ **Optimizado**: Solo carga las imágenes que existen
- ✅ **Escalable**: Fácil agregar nuevas bodas

## 🔧 Para Desarrolladores

El hook `useWeddingImages(weddingId?)` retorna:

```typescript
interface WeddingImages {
  heroImage: string;      // URL de la imagen hero
  coupleImage: string;    // URL de la imagen de pareja
  galleryImages: string[]; // Array de URLs de galería
}
```
