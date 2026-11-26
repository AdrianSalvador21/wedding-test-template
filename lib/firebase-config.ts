// Configuración pública de la app web de Firebase. Vive aparte de `lib/firebase.ts` para que la
// analítica (spec 31) pueda iniciar la app sin cargar Firestore ni Auth en las páginas de marketing.
// `initializeApp` con las mismas opciones devuelve la app ya creada, así que ambos módulos conviven.
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  // Google Analytics para Firebase (spec 31).
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};
