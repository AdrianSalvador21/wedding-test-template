import { setDoc, type DocumentReference } from 'firebase/firestore';

// Campos que escribe el servidor (contadores de IA). El editor los carga al
// abrir, pero si los guardara de vuelta pisaría los incrementos hechos desde
// entonces: sería una forma de reiniciar el límite de uso.
const SERVER_OWNED_FIELDS = ['aiUsage'];

// Guarda el documento de la boda reemplazando cada campo de primer nivel
// (igual que un setDoc completo) pero sin tocar los campos del servidor.
export async function saveWeddingDoc(ref: DocumentReference, data: object): Promise<void> {
  const rest = Object.fromEntries(Object.entries(data).filter(([key]) => !SERVER_OWNED_FIELDS.includes(key)));
  await setDoc(ref, rest, { mergeFields: Object.keys(rest) });
}
