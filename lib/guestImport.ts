// Spec 28 — importar invitados desde un .xlsx o .csv. Lectura del archivo (SheetJS, cargado
// con import() dinámico solo aquí), detección de columnas por encabezado y validación por fila.
// La detección y la validación son funciones puras; el guardado vive en `guestService.importGuests`.
import type { FirebaseGuest, WeddingData } from '../src/types/wedding';
import { normalizePhone } from './phone';
import { resolveHasEnglish } from './wedding-language';

export const MAX_IMPORT_ROWS = 500;

export type ImportField = 'name' | 'phone' | 'guestCount' | 'language' | 'email' | 'coupleMessage';

export const IMPORT_FIELD_LABELS: Record<ImportField, string> = {
  name: 'Nombre',
  phone: 'Teléfono',
  guestCount: 'Personas',
  language: 'Idioma',
  email: 'Correo',
  coupleMessage: 'Mensaje personal',
};

// Encabezados ya normalizados (minúsculas, sin acentos, sin espacios extremos).
const HEADER_ALIASES: Record<ImportField, string[]> = {
  name: ['nombre', 'nombres', 'invitado', 'invitados', 'invitacion', 'familia', 'name', 'guest'],
  phone: ['telefono', 'tel', 'celular', 'cel', 'whatsapp', 'movil', 'phone', 'mobile'],
  guestCount: ['personas', 'pases', 'lugares', 'boletos', 'cantidad', 'adultos', 'guests', 'seats', 'party size'],
  language: ['idioma', 'lengua', 'language', 'lang'],
  email: ['correo', 'correo electronico', 'email', 'e-mail', 'mail'],
  coupleMessage: ['mensaje', 'mensaje personal', 'nota', 'message', 'note'],
};

// Una entrada por columna del archivo: qué dato es, o `null` = "No importar".
export type ColumnMapping = (ImportField | null)[];

export interface ParsedSheet {
  headers: string[];
  rows: string[][]; // sin la fila de encabezados ni filas vacías
}

export interface ImportGuestData {
  name: string;
  phone: string;
  guestCount: number;
  language: 'es' | 'en';
  email: string;
  coupleMessage: string;
}

export interface ImportRowResult {
  rowNumber: number; // número de fila en el archivo (los encabezados son la fila 1)
  status: 'ready' | 'warning' | 'skipped';
  reasons: string[];
  data: ImportGuestData | null; // null si se omite
}

export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export async function parseFile(file: File): Promise<ParsedSheet> {
  const XLSX = await import('xlsx');
  const isCsv = /\.csv$/i.test(file.name);
  // El CSV se lee como texto para respetar UTF-8 (acentos) aunque no traiga BOM.
  const workbook = isCsv
    ? XLSX.read(await file.text(), { type: 'string' })
    : XLSX.read(await file.arrayBuffer(), { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) return { headers: [], rows: [] };

  // `raw: false` lee el texto formateado de la celda (evita teléfonos como 3.31E+09).
  const matrix = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, raw: false, defval: '', blankrows: false });
  const cells = matrix.map((row) => row.map((cell) => String(cell ?? '').trim()));
  const nonEmpty = cells.filter((row) => row.some((cell) => cell !== ''));
  const [headers = [], ...rows] = nonEmpty;
  return { headers, rows };
}

export function detectColumns(headers: string[]): ColumnMapping {
  const used = new Set<ImportField>();
  return headers.map((header) => {
    const normalized = normalizeText(header);
    const field = (Object.keys(HEADER_ALIASES) as ImportField[]).find((f) => HEADER_ALIASES[f].includes(normalized));
    if (!field || used.has(field)) return null;
    used.add(field);
    return field;
  });
}

function parseLanguage(raw: string): 'es' | 'en' | null {
  const value = normalizeText(raw);
  if (['es', 'espanol', 'spanish'].includes(value)) return 'es';
  if (['en', 'ingles', 'english'].includes(value)) return 'en';
  return null;
}

export function validateRows(
  rows: string[][],
  mapping: ColumnMapping,
  existingGuests: FirebaseGuest[],
  wedding: WeddingData | null
): ImportRowResult[] {
  const hasEnglish = resolveHasEnglish(wedding);
  const guestPicksCount = !!wedding?.selectedGuestTickets;
  const column = (field: ImportField) => mapping.indexOf(field);
  const cell = (row: string[], field: ImportField) => {
    const index = column(field);
    return index >= 0 ? (row[index] ?? '').trim() : '';
  };

  // Teléfonos y nombres ya usados: los de la lista existente y los de filas anteriores del archivo.
  const phones = new Map<string, string>();
  const names = new Map<string, string>();
  existingGuests.forEach((g) => {
    const phone = normalizePhone(g.phone);
    if (phone.value) phones.set(phone.value, g.name);
    names.set(normalizeText(g.name), g.name);
  });

  return rows.map((row, i) => {
    const rowNumber = i + 2;
    const reasons: string[] = [];
    const name = cell(row, 'name');
    if (!name) return { rowNumber, status: 'skipped', reasons: ['Sin nombre'], data: null };

    const phone = normalizePhone(cell(row, 'phone'));
    if (phone.value && phones.has(phone.value)) {
      return { rowNumber, status: 'skipped', reasons: [`Ya existe: ${phones.get(phone.value)}`], data: null };
    }
    const nameKey = normalizeText(name);
    if (!phone.value && names.has(nameKey)) {
      return { rowNumber, status: 'skipped', reasons: [`Ya existe: ${names.get(nameKey)}`], data: null };
    }
    if (!phone.valid) reasons.push('Teléfono no válido, se importa sin teléfono');

    let guestCount = 1;
    const rawCount = cell(row, 'guestCount');
    if (!guestPicksCount && rawCount) {
      const parsed = /^\d+$/.test(rawCount) ? Number(rawCount) : NaN;
      if (parsed >= 1 && parsed <= 10) guestCount = parsed;
      else reasons.push(`Personas fuera de rango (${rawCount}), se usa 1`);
    }

    let language: 'es' | 'en' = 'es';
    const rawLanguage = cell(row, 'language');
    if (hasEnglish && rawLanguage) {
      const parsed = parseLanguage(rawLanguage);
      if (parsed) language = parsed;
      else reasons.push(`Idioma no reconocido (${rawLanguage}), se usa español`);
    }

    let email = cell(row, 'email');
    if (email && !email.includes('@')) {
      reasons.push('Correo no válido, se importa sin correo');
      email = '';
    }

    if (phone.value) phones.set(phone.value, name);
    names.set(nameKey, name);

    return {
      rowNumber,
      status: reasons.length ? 'warning' : 'ready',
      reasons,
      data: { name, phone: phone.value ?? '', guestCount, language, email, coupleMessage: cell(row, 'coupleMessage') },
    };
  });
}
