/**
 * Utilidades compartidas entre los servicios de Firestore (spec 12).
 * Extraído de GuestService para que TableService y VenueFixtureService
 * no dupliquen la misma función.
 *
 * `any` es deliberado aquí (igual que en `src/types/wedding.ts`): el valor
 * de retorno alimenta `updateDoc`/`addDoc` de Firestore, cuyos tipos de
 * escritura parcial (`UpdateData`/`WithFieldValue`) no aceptan un
 * `Record<string, unknown>` genérico.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function cleanUndefinedFields(obj: any): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cleaned: any = {};

  Object.keys(obj).forEach((key) => {
    const value = obj[key];

    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        const cleanedNested = cleanUndefinedFields(value);
        if (Object.keys(cleanedNested).length > 0) {
          cleaned[key] = cleanedNested;
        }
      } else {
        cleaned[key] = value;
      }
    }
  });

  return cleaned;
}
