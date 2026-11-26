import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firebaseConfig } from './firebase-config';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Firebase Auth (spec 08). Los correos de verificación y recuperación salen en español.
export const auth = getAuth(app);
auth.languageCode = 'es';

export default app;
