# Sistema de Temas - Documentación

## 📋 Resumen

El sistema de temas funciona de manera que **todo el contenido visual** (colores, fuentes, patrones) está definido en el **frontend**. El **backend/servicio** solo envía un **ID del tema**.

## 🎯 Flujo de Funcionamiento

### 1. **Servicio → Frontend**
```json
{
  "theme": {
    "id": "classic"  // Solo el ID del tema
  }
}
```

### 2. **Frontend → Tema Completo**
```typescript
// El frontend convierte el ID en un tema completo
const theme = getTheme('classic'); // Obtiene todo: colores, fuentes, etc.
```

### 3. **Aplicación del Tema**
```typescript
// Se aplica automáticamente a toda la aplicación
<ThemeProvider weddingTheme={theme}>
  <App />
</ThemeProvider>
```

## 🎨 Temas Disponibles

### **Classic Wedding** (`id: "classic"`)
- **Colores**: Beiges y marrones elegantes
- **Fuentes**: Cormorant Garamond + Lora
- **Estilo**: Clásico y atemporal

### **Romantic Blush** (`id: "romantic"`)
- **Colores**: Tonos rosados suaves
- **Fuentes**: Playfair Display + Source Sans Pro
- **Estilo**: Romántico y delicado

### **Modern Minimalist** (`id: "modern"`)
- **Colores**: Grises modernos con acentos verdes
- **Fuentes**: Inter + Inter
- **Estilo**: Minimalista y contemporáneo

### **Elegant Gold** (`id: "elegant"`)
- **Colores**: Dorados y cremas elegantes
- **Fuentes**: Crimson Text + Libre Baskerville
- **Estilo**: Lujoso y sofisticado

## 🔧 Implementación

### **Estructura del Servicio**
```json
{
  "id": "maria-carlos-2025",
  "couple": { ... },
  "event": { ... },
  "theme": {
    "id": "classic"  // <- Solo esto
  }
}
```

### **Procesamiento en Frontend**
```typescript
// 1. Recibir datos del servicio
const weddingData = await fetchWeddingData(id);

// 2. Crear tema completo
const theme = createWeddingTheme(weddingData);

// 3. Aplicar tema
<ThemeProvider weddingTheme={theme}>
  <WeddingTemplate />
</ThemeProvider>
```

## 🎯 Ventajas

### **✅ Separación de Responsabilidades**
- **Backend**: Solo lógica de negocio
- **Frontend**: Control completo del diseño

### **✅ Performance**
- Respuesta del servicio más liviana
- Temas pre-cargados en el frontend

### **✅ Mantenibilidad**
- Cambios de diseño sin tocar el backend
- Nuevos temas fáciles de agregar

### **✅ Consistencia**
- Todos los temas siguen la misma estructura
- Garantía de que todos los elementos visuales están definidos

## 📁 Archivos Principales

### **`lib/themes.ts`**
```typescript
// Definición de todos los temas
export const classicTheme: WeddingTheme = { ... };
export const romanticTheme: WeddingTheme = { ... };
```

### **`lib/theme-utils.ts`**
```typescript
// Conversión de ID a tema completo
export const createWeddingTheme = (weddingData: WeddingData): WeddingTheme => {
  return getTheme(weddingData.theme.id as ThemeId);
};
```

### **`lib/theme-context.tsx`**
```typescript
// Aplicación del tema a toda la app
<ThemeProvider weddingTheme={theme}>
  <App />
</ThemeProvider>
```

## 🔄 Ejemplo de Uso

### **Cambiar tema de una boda**
```typescript
// En el servicio, cambiar:
{
  "theme": { "id": "classic" }
}

// Por:
{
  "theme": { "id": "modern" }
}

// ¡El frontend automáticamente aplicará el tema Modern Minimalist!
```

### **Agregar nuevo tema**
```typescript
// 1. Definir el tema en lib/themes.ts
export const vintageTheme: WeddingTheme = {
  id: 'vintage',
  name: 'Vintage Romance',
  colors: { ... },
  fonts: { ... },
  // etc.
};

// 2. Agregarlo a la colección
export const availableThemes = {
  classic: classicTheme,
  romantic: romanticTheme,
  modern: modernTheme,
  elegant: elegantTheme,
  vintage: vintageTheme,  // <- Nuevo tema
};

// 3. ¡Listo! Ya se puede usar con { "id": "vintage" }
```

## 🚀 Beneficios del Sistema

1. **Simplicidad**: Solo un ID del servicio
2. **Control**: Frontend maneja toda la presentación
3. **Flexibilidad**: Fácil agregar/modificar temas
4. **Performance**: Menos datos transferidos
5. **Mantenibilidad**: Cambios de diseño independientes del backend 