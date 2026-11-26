import { setDoc, type DocumentReference } from 'firebase/firestore';

// Campos que escribe el servidor (contadores de IA). El editor los carga al
// abrir, pero si los guardara de vuelta pisaría los incrementos hechos desde
// entonces: sería una forma de reiniciar el límite de uso.
// Spec 33 — `checkIn` lo activa la sección Check-in del panel con una ruta de servidor; si el Editor
// lo guardara de vuelta, una pestaña abierta antes de activarlo lo apagaría.
const SERVER_OWNED_FIELDS = ['aiUsage', 'checkIn'];

// Guarda el documento de la boda reemplazando cada campo de primer nivel
// (igual que un setDoc completo) pero sin tocar los campos del servidor.
export async function saveWeddingDoc(ref: DocumentReference, data: object): Promise<void> {
  const rest = Object.fromEntries(Object.entries(data).filter(([key]) => !SERVER_OWNED_FIELDS.includes(key)));
  await setDoc(ref, rest, { mergeFields: Object.keys(rest) });
}
