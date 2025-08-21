# 📋 Documentación Completa - Wedding Invitation Clean

## 🎯 **Resumen Ejecutivo**

**Wedding Invitation Clean** es una aplicación web de invitaciones de boda construida con **Next.js 15**, **TypeScript**, **Tailwind CSS** y **Redux Toolkit**. La aplicación permite crear invitaciones digitales elegantes y completamente personalizables con múltiples temas, traducciones automáticas, y funcionalidades avanzadas como RSVP, galerías de fotos, y gestión de invitados.

---

## 🏗️ **Arquitectura del Proyecto**

### **Stack Tecnológico**
- **Framework**: Next.js 15 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Estado Global**: Redux Toolkit
- **Internacionalización**: next-intl
- **Patrones de Diseño**: Component-based Architecture, Theme System, Service Layer

### **Estructura de Directorios**
```
wedding-invitation-clean/
├── app/                          # App Router de Next.js 15
│   ├── [locale]/                 # Rutas con internacionalización
│   │   ├── wedding/[id]/         # Página principal de invitación
│   │   ├── demo/                 # Página de demostración
│   │   └── invitation/           # Template estático de invitación
│   ├── globals.css               # Estilos globales
│   └── layout.tsx                # Layout principal
├── components/                   # Componentes React
│   ├── sections/                 # Secciones de la invitación
│   │   ├── Hero.tsx             # Sección principal con nombres
│   │   ├── Countdown.tsx        # Contador regresivo
│   │   ├── About.tsx            # Historia de la pareja
│   │   ├── Gallery.tsx          # Galería de fotos
│   │   ├── Timeline.tsx         # Cronograma del día
│   │   ├── DressCode.tsx        # Código de vestimenta
│   │   ├── Location.tsx         # Ubicación y mapas
│   │   ├── RSVP.tsx             # Formulario de confirmación
│   │   ├── GiftRegistry.tsx     # Mesa de regalos
│   │   ├── Accommodation.tsx    # Hospedaje
│   │   ├── AdultOnlyEvent.tsx   # Evento solo adultos
│   │   └── Footer.tsx           # Pie de página
│   ├── WeddingTemplate.tsx      # Template principal
│   ├── WeddingPageClient.tsx    # Cliente wrapper
│   └── InvitationOverlay.tsx    # Overlay personalizado
├── lib/                          # Utilidades y configuraciones
│   ├── themes.ts                # Sistema de temas
│   ├── theme-context.tsx        # Context de temas
│   ├── theme-utils.ts           # Utilidades de temas
│   ├── translations.ts          # Sistema de traducciones
│   ├── motion.tsx               # Animaciones
│   └── utils.ts                 # Utilidades generales
├── src/                          # Código fuente principal
│   ├── data/                    # Datos mock y configuraciones
│   │   ├── mockData.ts          # Datos de prueba de bodas
│   │   └── mockInvitations.ts   # Invitaciones de prueba
│   ├── services/                # Servicios y API
│   │   └── weddingApi.ts        # Servicio de API
│   ├── store/                   # Redux store
│   │   ├── index.ts             # Configuración del store
│   │   ├── hooks.ts             # Hooks tipados de Redux
│   │   └── slices/              # Redux slices
│   │       └── weddingSlice.ts  # Slice principal de bodas
│   └── types/                   # Definiciones TypeScript
│       └── wedding.ts           # Tipos principales
├── messages/                     # Archivos de traducción
│   ├── en.json                  # Traducciones en inglés
│   └── es.json                  # Traducciones en español
└── public/                       # Assets públicos
    └── assets/                   # Imágenes y recursos
        └── friends/              # Fotos para template de amigos
```

---

## 🎨 **Sistema de Temas**

### **Temas Disponibles**
1. **Classic Wedding** (`classic`) - Beiges y marrones elegantes
2. **Romantic Blush** (`romantic`) - Tonos rosados suaves  
3. **Modern Minimalist** (`modern`) - Grises modernos con acentos verdes
4. **Elegant Gold** (`elegant`) - Dorados y cremas elegantes
5. **Luxury Champagne** (`luxury`) - Champagne y bronces sofisticados
6. **Premium Rose Gold** (`premium`) - Rose gold y champagne premium
7. **Corporate Professional** (`corporate`) - Grises corporativos profesionales

### **Estructura de Tema**
```typescript
interface WeddingTheme {
  id: string;
  name: string;
  colors: { primary, secondary, accent, light, dark, text, border, background, muted, success, warning, error };
  gradients: { primary, overlay, background, accent };
  fonts: { heading: { family, weights, fallback }, body: { family, weights, fallback } };
  typography: { heroTitle, sectionTitle, subtitle, body };
  shadows: { sm, md, lg, xl };
  patterns: { primary, secondary, accent, subtle };
  spacing: { section, container };
  effects: { blur, opacity };
}
```

### **Aplicación de Temas**
- Los temas se aplican mediante **CSS Custom Properties**
- **ThemeProvider** context distribuye el tema a todos los componentes
- **createWeddingTheme()** convierte el ID del tema en objeto completo
- Cada componente usa clases de Tailwind que mapean a las variables CSS

---

## 📊 **Gestión de Estado (Redux)**

### **Store Configuration**
```typescript
// src/store/index.ts
export const store = configureStore({
  reducer: {
    wedding: weddingReducer,
  },
});
```

### **Wedding Slice**
```typescript
interface WeddingState {
  currentWedding: WeddingData | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

// Acciones principales:
- fetchWeddingData(weddingId) // Cargar datos de boda
- setCurrentWedding(weddingData) // Establecer boda actual
- setLoading(boolean) // Estado de carga
- setError(string) // Manejo de errores
```

### **Hooks Tipados**
```typescript
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useWedding = () => useAppSelector(state => state.wedding);
```

---

## 🌐 **Sistema de Internacionalización**

### **Configuración**
- **next-intl** para traducciones
- **Middleware** para detección automática de idioma
- **Locales soportados**: `es` (español), `en` (inglés)
- **Rutas localizadas**: `/[locale]/wedding/[id]`

### **Estructura de Traducciones**
```json
// messages/es.json
{
  "template": {
    "loading": "Cargando...",
    "notFound": "Invitación no encontrada",
    "tryAgain": "Intentar nuevamente"
  },
  "sections": {
    "hero": { "title": "Nos casamos" },
    "about": { "title": "Nuestra Historia" },
    "rsvp": { "title": "Confirma tu Asistencia" }
  }
}
```

### **Uso en Componentes**
```typescript
import { useTranslations } from '../lib/translations';

export default function Component() {
  const { t } = useTranslations('sections.hero');
  return <h1>{t('title')}</h1>;
}
```

---

## 🔌 **Sistema de API y Servicios**

### **WeddingApiService**
```typescript
export class WeddingApiService {
  static async getWeddingById(id: string): Promise<ApiResponse<WeddingData>>
  static async submitRSVP(rsvpData: RSVPFormData): Promise<ApiResponse<{ id: string }>>
}
```

### **Configuración de Entorno**
- **Desarrollo**: `USE_MOCK_DATA = true` (usa datos mock)
- **Producción**: `NEXT_PUBLIC_USE_MOCK = "true"` (para demo)
- **API Real**: `NEXT_PUBLIC_API_URL` (URL del backend real)

### **Flujo de Datos**
1. **WeddingPageClient** recibe `weddingId` y `guestId`
2. **useEffect** dispara `fetchWeddingData(weddingId)`
3. **weddingSlice** llama a `WeddingApiService.getWeddingById()`
4. **Servicio** retorna datos mock o hace llamada HTTP real
5. **Estado global** se actualiza con los datos
6. **WeddingTemplate** consume datos del store

---

## 📱 **Componentes Principales**

### **WeddingTemplate** (Componente Principal)
- **Props**: `{ guestId?: string | null }`
- **Responsabilidades**:
  - Consume datos del store Redux
  - Maneja estados de loading/error
  - Crea y aplica tema basado en datos
  - Renderiza todas las secciones
  - Maneja overlay personalizado para invitados

### **Secciones de la Invitación**
1. **Hero** - Nombres, fecha, imagen principal
2. **Countdown** - Contador regresivo al día de la boda
3. **Location** - Mapas y direcciones de ceremonia/recepción
4. **About** - Historia de la pareja, estadísticas de relación
5. **Gallery** - Grid de fotos con layout responsivo
6. **Timeline** - Cronograma del día con iconos
7. **DressCode** - Recomendaciones de vestimenta con colores
8. **GiftRegistry** - Mesa de regalos y datos bancarios
9. **Accommodation** - Opciones de hospedaje
10. **AdultOnlyEvent** - Mensaje de evento solo para adultos
11. **RSVP** - Formulario de confirmación con validación
12. **Footer** - Información de contacto y redes sociales

### **InvitationOverlay**
- **Props**: `{ guestId: string, weddingId: string, onClose: () => void }`
- **Funcionalidad**:
  - Muestra mensaje personalizado para invitado específico
  - Información de mesa asignada
  - Número de acompañantes permitidos
  - Restricciones dietéticas
  - Botón para cerrar overlay

---

## 🎯 **Casos de Uso y Templates**

### **Bodas Disponibles para Testing**

#### **1. María & Carlos (Classic Theme)**
- **ID**: `maria-carlos-2025`
- **Tema**: Classic Wedding (beiges y marrones)
- **URL Base**: `/wedding/maria-carlos-2025`
- **URL con Invitado**: `/wedding/maria-carlos-2025?guest=guest-001`
- **Características**:
  - Historia romántica de 6 años
  - Ceremonia religiosa + recepción
  - 6 invitados mock con diferentes tipos
  - Mesa de regalos completa
  - Evento solo para adultos

#### **2. Ana & Luis (Modern Theme)**
- **ID**: `ana-luis-2025`
- **Tema**: Modern Minimalist
- **URL Base**: `/wedding/ana-luis-2025`
- **Características**:
  - Historia universitaria de 8 años
  - Estilo garden party semi-formal
  - Hacienda colonial mexicana
  - Evento familiar (permite niños)

#### **3. Isabella & Alexander (Luxury Theme)**
- **ID**: `isabella-alexander-2025`
- **Tema**: Luxury Champagne
- **Características**:
  - Historia internacional (París-Sorbona)
  - Château con viñedos
  - Formal elegance dress code
  - Invitados VIP y aristocracia

#### **4. Valentina & Sebastián (Premium Theme)**
- **ID**: `valentina-sebastian-2025`
- **Tema**: Premium Rose Gold
- **Características**:
  - Pareja artística
  - Jardín botánico + hacienda colonial
  - Black tie opcional
  - Enfoque en arte y creatividad

#### **5. Roberto & Patricia (Corporate Theme)**
- **ID**: `roberto-patricia-2025`
- **Tema**: Corporate Professional
- **Características**:
  - Historia corporativa
  - Club empresarial
  - Business formal dress code
  - Networking y ambiente profesional

#### **6. Friends Test (Classic Theme con Fotos Locales)**
- **ID**: `friends-test`
- **Tema**: Classic Wedding (mismo que María & Carlos)
- **URL Base**: `/wedding/friends-test`
- **URL con Invitado**: `/wedding/friends-test?guest=guest-001`
- **Características**:
  - **Contenido idéntico** a María & Carlos
  - **Fotos locales** de `/assets/friends/01.jpeg` a `/assets/friends/10.jpeg`
  - **Galería personalizada** con 10 fotos de amigos
  - **Mismo tema Classic** (beiges y marrones)
  - **3 invitados mock** (Ana Patricia, Roberto, Familia Rodríguez)
  - **Propósito**: Testing con assets locales sin dependencias externas

### **Invitados Mock por Boda**
Cada boda tiene entre 2-7 invitados mock con:
- **Tipos**: `close_family`, `family`, `friends`, `work`, `vip`
- **Mensajes personalizados** opcionales
- **Restricciones dietéticas**
- **Mesas asignadas**
- **Número de acompañantes**
- **Estado de confirmación**

---

## 🔧 **Configuración y Deployment**

### **Variables de Entorno**
```bash
# Desarrollo
NODE_ENV=development
NEXT_PUBLIC_USE_MOCK=true

# Producción con datos mock (para demo)
NODE_ENV=production
NEXT_PUBLIC_USE_MOCK=true

# Producción con API real
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_USE_MOCK=false
```

### **Scripts Disponibles**
```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint"
}
```

### **Deployment en Vercel**
1. Conectar repositorio
2. Configurar variables de entorno:
   - `NEXT_PUBLIC_USE_MOCK=true`
3. Deploy automático

### **URLs de Demostración**
```bash
# Español (por defecto)
https://tu-dominio.com/
https://tu-dominio.com/wedding/maria-carlos-2025
https://tu-dominio.com/wedding/maria-carlos-2025?guest=guest-001

# Inglés
https://tu-dominio.com/en
https://tu-dominio.com/en/wedding/maria-carlos-2025
https://tu-dominio.com/en/wedding/maria-carlos-2025?guest=guest-001

# Todas las bodas disponibles
/wedding/maria-carlos-2025        # Classic theme
/wedding/friends-test             # Classic theme con fotos locales
/wedding/ana-luis-2025            # Modern theme
/wedding/isabella-alexander-2025  # Luxury theme
/wedding/valentina-sebastian-2025 # Premium theme
/wedding/roberto-patricia-2025    # Corporate theme

# Con invitados específicos
/wedding/friends-test?guest=guest-001  # Ana Patricia López
/wedding/friends-test?guest=guest-002  # Roberto Martínez
/wedding/friends-test?guest=guest-003  # Familia Rodríguez
```

---

## 📋 **Estructura de Datos**

### **WeddingData Interface**
```typescript
interface WeddingData {
  id: string;
  couple: {
    bride: PersonInfo;
    groom: PersonInfo;
    coupleEmail: string;
    hashtag: string;
    story: string;
    quote: string;
  };
  event: {
    weddingId: string;
    date: string; // ISO format
    time: string;
    ceremony: { time: string; duration: number };
    reception: { time: string; duration: number };
    ceremonyVenue: VenueInfo;
    receptionVenue: VenueInfo;
    dressCode: DressCodeInfo;
    rsvpDeadline: string;
  };
  timeline: TimelineEvent[];
  gallery: GalleryImage[];
  heroImage: { url: string; alt: string };
  specialMoments: SpecialMoment[];
  relationshipStats: { yearsTogther: number; adventures: number; memories: number; dreams: number };
  accommodation: AccommodationOption[];
  transport: TransportInfo;
  giftRegistry: GiftRegistryInfo;
  adultOnlyEvent: { enabled: boolean; message?: string };
  theme: { id: ThemeId };
  languages: string[];
  defaultLanguage: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### **GuestInfo Interface**
```typescript
interface GuestInfo {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  allowedGuests: number;
  guestType: 'close_family' | 'family' | 'friends' | 'work' | 'vip';
  table?: string;
  specialMessage?: string;
  dietaryRestrictions?: string[];
  isConfirmed: boolean;
  confirmedGuests?: number;
  notes?: string;
}
```

---

## 🎨 **Personalización y Extensión**

### **Agregar Nuevo Tema**
1. **Crear tema en `lib/themes.ts`**:
```typescript
export const newTheme: WeddingTheme = {
  id: 'new-theme',
  name: 'New Theme Name',
  colors: { /* definir colores */ },
  // ... resto de propiedades
};
```

2. **Agregar a `availableThemes`**:
```typescript
export const availableThemes = {
  // ... temas existentes
  'new-theme': newTheme,
};
```

3. **Usar en datos mock**:
```typescript
const mockWedding: WeddingData = {
  // ... otros datos
  theme: { id: 'new-theme' },
};
```

### **Agregar Nueva Sección**
1. **Crear componente** en `components/sections/`
2. **Agregar al template** en `WeddingTemplate.tsx`
3. **Añadir traducciones** en `messages/`
4. **Actualizar tipos** si es necesario

### **Agregar Nueva Boda Mock**
1. **Crear datos** en `src/data/mockData.ts`
2. **Crear invitados** en `src/data/mockInvitations.ts`
3. **Agregar a mapas** de exportación
4. **Probar URLs** correspondientes

---

## 🚀 **Flujo de Desarrollo**

### **Desarrollo Local**
```bash
# 1. Instalar dependencias
npm install

# 2. Ejecutar en desarrollo
npm run dev

# 3. Acceder a URLs de prueba
http://localhost:3000/wedding/maria-carlos-2025
http://localhost:3000/wedding/maria-carlos-2025?guest=guest-001
```

### **Testing de Funcionalidades**
1. **Temas**: Probar cada ID de boda para verificar temas
2. **Invitados**: Usar diferentes `guest` query params
3. **Idiomas**: Cambiar `/es/` por `/en/` en URLs
4. **RSVP**: Llenar y enviar formulario
5. **Responsive**: Probar en diferentes tamaños de pantalla

### **Debug y Logging**
- Console logs en `WeddingTemplate` muestran tema aplicado
- Redux DevTools para inspeccionar estado
- Network tab para verificar llamadas API
- React DevTools para componentes

---

## ⚠️ **Consideraciones Importantes**

### **SEO y Indexación**
- **robots.txt**: Las invitaciones tienen `index: false`
- **Meta tags**: Generados dinámicamente por boda
- **Open Graph**: Imagen y descripción personalizadas
- **Sitemap**: No incluir invitaciones privadas

### **Performance**
- **Imágenes**: Usar Next.js Image component para optimización
- **Assets Estáticos**: Configurados con cache headers optimizados (`max-age=86400, s-maxage=31536000`)
- **Middleware**: Excluye `/assets/*` para servir imágenes directamente
- **Lazy Loading**: Secciones se cargan según scroll
- **Bundle Size**: Temas se cargan dinámicamente
- **Caching**: Datos mock se cachean en memoria

### **Seguridad**
- **Guest IDs**: No exponer información sensible en URLs
- **API Keys**: Usar variables de entorno
- **CORS**: Configurar adecuadamente para producción
- **Rate Limiting**: Implementar en RSVP submissions

### **Accesibilidad**
- **Contraste**: Todos los temas cumplen WCAG AA
- **Keyboard Navigation**: Formularios y botones accesibles
- **Screen Readers**: Alt texts y aria-labels
- **Focus States**: Visibles en todos los elementos interactivos

---

## 📞 **Soporte y Mantenimiento**

### **Logs y Monitoreo**
- **Console errors** en desarrollo
- **Sentry** o similar para producción
- **Analytics** para tracking de uso
- **Performance monitoring** para Core Web Vitals

### **Actualizaciones**
- **Next.js**: Mantener versión estable
- **Dependencies**: Actualizar regularmente
- **Security patches**: Aplicar inmediatamente
- **Theme updates**: Versionar cambios

### **Backup y Recovery**
- **Código**: Git repository con branches
- **Assets**: CDN con backup
- **Database**: Si se implementa backend real
- **Environment configs**: Documentar todas las variables

---

## 📸 **Configuración de Imágenes**

### **Imágenes Locales (Recomendado para Testing)**
- **Ubicación**: `public/assets/friends/01.jpeg` a `public/assets/friends/10.jpeg`
- **URLs**: `/assets/friends/01.jpeg` (servidas desde la raíz)
- **Ventajas**: No dependen de servicios externos, funcionan offline
- **Uso**: Template `friends-test` utiliza estas imágenes

### **Imágenes Remotas (Unsplash)**
- **Configuración**: Permitidas en `next.config.js` via `remotePatterns`
- **Optimización**: Automática via Next.js Image Optimization
- **Uso**: Otros templates usan URLs de Unsplash

### **Middleware y Assets Estáticos**
```typescript
// middleware.ts - CRÍTICO para que funcionen las imágenes
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Excluir assets estáticos - IMPORTANTE
  if (pathname.startsWith('/assets/')) {
    return NextResponse.next();
  }
  
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|assets).*)',
  ],
};
```

### **Cache Headers para Producción**
```javascript
// next.config.js
{
  source: '/assets/:path*',
  headers: [
    {
      key: 'Cache-Control',
      value: 'public, max-age=86400, s-maxage=31536000, immutable',
    },
  ],
}
```

### **Testing de Imágenes**
```bash
# Desarrollo
curl -I http://localhost:3001/assets/friends/01.jpeg

# Producción
curl -I http://localhost:3000/assets/friends/01.jpeg

# Debe retornar: HTTP/1.1 200 OK
```

---

## 🎯 **Próximos Pasos y Roadmap**

### **Funcionalidades Pendientes**
1. **Backend Real**: API REST completa
2. **Admin Dashboard**: Panel de administración
3. **Email Notifications**: Confirmaciones automáticas
4. **Payment Integration**: Mesa de regalos con pagos
5. **Advanced Analytics**: Tracking detallado
6. **Mobile App**: PWA o aplicación nativa
7. **Video Integration**: Streaming de ceremonia
8. **Guest Management**: Portal para organizadores

### **Mejoras Técnicas**
1. **Testing**: Unit tests con Jest/RTL
2. **E2E Testing**: Playwright o Cypress
3. **CI/CD**: GitHub Actions
4. **Performance**: Lighthouse optimization
5. **Security**: Penetration testing
6. **Documentation**: Storybook para componentes

---

## 📋 **Checklist de Implementación**

### **Para Desarrolladores Nuevos**
- [ ] Clonar repositorio y ejecutar `npm install`
- [ ] Revisar estructura de carpetas
- [ ] Probar todas las URLs de ejemplo
- [ ] Inspeccionar Redux store en DevTools
- [ ] Cambiar temas y verificar aplicación
- [ ] Probar formulario RSVP
- [ ] Verificar responsive design
- [ ] Revisar traducciones en ambos idiomas
- [ ] Entender flujo de datos API
- [ ] Explorar sistema de temas

### **Para Testing**
- [ ] Verificar todas las bodas mock funcionan
- [ ] Probar todos los invitados mock
- [ ] Validar formularios con datos incorrectos
- [ ] Testear en diferentes dispositivos
- [ ] Verificar performance en slow 3G
- [ ] Probar con lectores de pantalla
- [ ] Validar SEO meta tags
- [ ] Confirmar analytics tracking

---

*Esta documentación está diseñada para ser completamente autosuficiente. Un desarrollador con esta información debería poder entender, modificar y extender el proyecto sin asistencia adicional.*
