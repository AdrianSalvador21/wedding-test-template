This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## ✅ **URLs Correctas del wedding-invitation-clean:**

### **🎯 Estructura:**
- **Sin guest específico**: `/wedding/[weddingId]`
- **Con guest específico**: `/wedding/[weddingId]?guest=[guestId]`
- **En inglés**: `/en/wedding/[weddingId]` o `/en/wedding/[weddingId]?guest=[guestId]`

### **📋 Bodas Disponibles:**

**1. María & Carlos (Clásico/Romántico)**
```
Boda: maria-carlos-2025
URL base: /wedding/maria-carlos-2025
Con guests:
- /wedding/maria-carlos-2025?guest=guest-001 (Ana Patricia López - Madrina)
- /wedding/maria-carlos-2025?guest=guest-002 (Roberto Martínez - Amigo)
```

**2. Friends Test (Prueba con Fotos Locales)**
```
Boda: friends-test
URL base: /wedding/friends-test
Con guests:
- /wedding/friends-test?guest=guest-001 (Ana Patricia López - Madrina)
- /wedding/friends-test?guest=guest-002 (Roberto Martínez - Amigo)
- /wedding/friends-test?guest=guest-003 (Familia Rodríguez - Familia)

NOTA: Usa imágenes locales de /public/assets/friends/ (01.jpeg - 10.jpeg)
Configurado para funcionar en desarrollo y producción.
```

**3. Ana & Luis (Estándar)**
```
Boda: ana-luis-2025
URL base: /wedding/ana-luis-2025
Con guests:
- /wedding/ana-luis-2025?guest=guest-101 (Carlos Vega - VIP)
- /wedding/ana-luis-2025?guest=guest-102 (María González - Familia)
- /wedding/ana-luis-2025?guest=guest-103 (Familia Torres - Familia)
```

**3. Isabella & Alexander (Lujo)**
```
Boda: isabella-alexander-2025
URL base: /wedding/isabella-alexander-2025
Con guests:
- /wedding/isabella-alexander-2025?guest=guest-201 (VIP Guest)
- /wedding/isabella-alexander-2025?guest=guest-202 (Family Member)
```

**4. Valentina & Sebastian (Premium)**
```
Boda: valentina-sebastian-2025
URL base: /wedding/valentina-sebastian-2025
Con guests:
- /wedding/valentina-sebastian-2025?guest=guest-301 (VIP Guest)
- /wedding/valentina-sebastian-2025?guest=guest-302 (Family Member)
```

**5. Roberto & Patricia (Corporativo)**
```
Boda: roberto-patricia-2025
URL base: /wedding/roberto-patricia-2025
Con guests:
- /wedding/roberto-patricia-2025?guest=guest-401 (VIP Guest)
- /wedding/roberto-patricia-2025?guest=guest-402 (Family Member)
```

### **🌐 Ejemplos de URLs Completas:**

**En Español:**
- `http://localhost:3000/wedding/maria-carlos-2025`
- `http://localhost:3000/wedding/maria-carlos-2025?guest=guest-001`
- `http://localhost:3000/wedding/ana-luis-2025?guest=guest-102`

**En Inglés:**
- `http://localhost:3000/en/wedding/maria-carlos-2025`
- `http://localhost:3000/en/wedding/maria-carlos-2025?guest=guest-001`

¡Gracias por la corrección! La diferencia es que el `guest` va como `?guest=` en los query parameters, no como `/guest/` en la ruta. 🎯
