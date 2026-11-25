'use client';

import React, { useMemo, useRef, useState } from 'react';
import { AlertTriangle, Check, Download, FileUp, Sheet, X } from 'lucide-react';
import { FirebaseGuest, WeddingData } from '../../../src/types/wedding';
import { guestService } from '../../../services/guestService';
import { track } from '../../../lib/analytics/client';
import {
  IMPORT_FIELD_LABELS,
  MAX_IMPORT_ROWS,
  detectColumns,
  parseFile,
  validateRows,
  type ColumnMapping,
  type ImportField,
  type ParsedSheet,
} from '../../../lib/guestImport';
import { AdminButton, manrope, displayFont } from '../ui';

// Spec 28 — importar invitados desde archivo en 3 pasos: Cargar → Columnas → Vista previa.

const TEMPLATE_URL = '/plantillas/invitados-invyta.xlsx';
const STEPS = ['Cargar', 'Columnas', 'Vista previa'] as const;

interface ImportGuestsModalProps {
  weddingId: string;
  weddingData: WeddingData | null;
  existingGuests: FirebaseGuest[];
  onClose: () => void;
  onImported: (guests: FirebaseGuest[]) => void;
}

export function ImportGuestsModal({ weddingId, weddingData, existingGuests, onClose, onImported }: ImportGuestsModalProps) {
  const [step, setStep] = useState(0);
  const [fileName, setFileName] = useState('');
  const [sheet, setSheet] = useState<ParsedSheet | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [done, setDone] = useState<{ imported: number; skipped: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(
    () => (sheet && step === 2 ? validateRows(sheet.rows, mapping, existingGuests, weddingData) : []),
    [sheet, step, mapping, existingGuests, weddingData]
  );
  const counts = useMemo(
    () => ({
      ready: results.filter((r) => r.status === 'ready').length,
      warning: results.filter((r) => r.status === 'warning').length,
      skipped: results.filter((r) => r.status === 'skipped').length,
    }),
    [results]
  );

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setLoadError(null);
    if (!/\.(xlsx|csv)$/i.test(file.name)) {
      setLoadError('Solo se pueden importar archivos .xlsx o .csv.');
      return;
    }
    setLoading(true);
    try {
      const parsed = await parseFile(file);
      if (parsed.headers.length === 0 || parsed.rows.length === 0) {
        setLoadError('El archivo no tiene invitados. Revisa que la primera fila tenga los encabezados.');
        return;
      }
      setFileName(file.name);
      setSheet(parsed);
      setMapping(detectColumns(parsed.headers));
      setStep(1);
    } catch (err) {
      console.error('Error leyendo el archivo de invitados:', err);
      setLoadError('No pudimos leer el archivo. Prueba guardarlo de nuevo como .xlsx o .csv.');
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const setColumnField = (index: number, field: ImportField | null) => {
    // Un dato solo puede venir de una columna: si ya estaba asignado a otra, esa queda en "No importar".
    setMapping((prev) => prev.map((f, i) => (i === index ? field : field && f === field ? null : f)));
  };

  const handleImport = async () => {
    const rows = results.flatMap((r) => (r.data ? [r.data] : []));
    if (rows.length === 0) return;
    setImporting(true);
    setImportError(null);
    try {
      const created = await guestService.importGuests(weddingId, rows);
      track('guests_imported', { rows: created.length });
      onImported(created);
      setDone({ imported: created.length, skipped: counts.skipped });
    } catch {
      setImportError('No se pudieron importar los invitados. Intenta de nuevo.');
    } finally {
      setImporting(false);
    }
  };

  const recognized = mapping.filter(Boolean).length;
  const unknownHeaders = sheet ? sheet.headers.filter((_, i) => !mapping[i]) : [];
  const nameMapped = mapping.includes('name');
  const tooManyRows = (sheet?.rows.length ?? 0) > MAX_IMPORT_ROWS;
  const ignoresCount = !!weddingData?.selectedGuestTickets && mapping.includes('guestCount');
  const toImport = counts.ready + counts.warning;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={manrope}>
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)]" onClick={importing ? undefined : onClose} />
        <div role="dialog" aria-modal="true" aria-labelledby="import-modal-title" className="relative w-full max-w-[780px] bg-white rounded-2xl shadow-xl">
          <div className="px-6 sm:px-7 pt-6 pb-4 border-b border-[rgba(0,0,0,0.08)]">
            <div className="flex items-center justify-between">
              <h3 id="import-modal-title" className="text-[20px] text-[#0A0A0A]" style={displayFont}>
                Importar invitados
              </h3>
              <button
                type="button"
                onClick={onClose}
                disabled={importing}
                aria-label="Cerrar"
                className="text-[#71717A] hover:text-[#0A0A0A] p-2 rounded-lg hover:bg-[#FAFAFA] transition-colors disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {!done && (
              <ol className="flex items-center gap-2 mt-3.5 text-[13px] font-semibold flex-wrap">
                {STEPS.map((label, i) => (
                  <React.Fragment key={label}>
                    {i > 0 && <li aria-hidden="true" className="text-[#D4D4D8]">—</li>}
                    <li className={`flex items-center gap-2 ${i < step ? 'text-[#15803D]' : i === step ? 'text-[#0A0A0A]' : 'text-[#71717A]'}`} aria-current={i === step ? 'step' : undefined}>
                      <span
                        className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs ${
                          i < step ? 'bg-[#DCFCE7]' : i === step ? 'bg-[#AE5730] text-white' : 'bg-[#F4F4F5]'
                        }`}
                      >
                        {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
                      </span>
                      {label}
                    </li>
                  </React.Fragment>
                ))}
              </ol>
            )}
          </div>

          {done ? (
            <div className="px-7 py-10 flex flex-col items-center text-center gap-3">
              <span className="w-12 h-12 rounded-full bg-[#DCFCE7] text-[#15803D] inline-flex items-center justify-center">
                <Check className="h-6 w-6" />
              </span>
              <div className="text-[17px] font-semibold text-[#0A0A0A]">
                Se importaron {done.imported} invitados · {done.skipped} omitidos
              </div>
              <div className="text-[13px] text-[#71717A]">Ya aparecen en tu lista de invitados.</div>
              <AdminButton onClick={onClose} className="mt-3">Listo</AdminButton>
            </div>
          ) : step === 0 ? (
            <div className="px-6 sm:px-7 py-6 flex flex-col gap-5">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  handleFile(e.dataTransfer.files?.[0]);
                }}
                className={`border-2 border-dashed rounded-2xl px-6 py-11 flex flex-col items-center gap-2.5 text-center transition-colors ${
                  dragging ? 'border-[#AE5730] bg-[#FBF1EC]' : 'border-[rgba(0,0,0,0.18)] bg-[#FAFAFA]'
                }`}
              >
                <FileUp className="h-9 w-9 text-[#AE5730]" strokeWidth={1.8} />
                <div className="text-base font-semibold text-[#0A0A0A]">Arrastra tu archivo aquí</div>
                <div className="text-[13px] text-[#71717A]">Excel (.xlsx) o CSV · hasta {MAX_IMPORT_ROWS} invitados</div>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".xlsx,.csv"
                  className="sr-only"
                  id="import-guests-file"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
                <label
                  htmlFor="import-guests-file"
                  className="mt-2 inline-flex items-center justify-center min-h-[44px] px-5 rounded-lg border border-[rgba(0,0,0,0.14)] bg-white text-sm font-semibold text-[#0A0A0A] hover:bg-[#FAFAFA] cursor-pointer"
                >
                  {loading ? 'Leyendo archivo…' : 'Elegir archivo'}
                </label>
              </div>
              {loadError && (
                <div className="flex items-start gap-2.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] px-3.5 py-3 text-[13px] text-[#991B1B]">
                  <AlertTriangle className="h-4 w-4 flex-none mt-0.5" />
                  {loadError}
                </div>
              )}

              <div className="flex items-center justify-between gap-4 flex-wrap border border-[rgba(0,0,0,0.08)] rounded-xl px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-lg bg-[#F0FDF4] text-[#15803D] inline-flex items-center justify-center flex-none">
                    <Sheet className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-[#0A0A0A]">¿Empiezas de cero? Usa nuestra plantilla</div>
                    <div className="text-[12.5px] text-[#71717A] mt-0.5">Nombre, Teléfono, Personas, Idioma, Correo y Mensaje, con un ejemplo</div>
                  </div>
                </div>
                <a
                  href={TEMPLATE_URL}
                  download
                  className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-lg border border-[rgba(0,0,0,0.14)] bg-white text-sm font-semibold text-[#0A0A0A] hover:bg-[#FAFAFA]"
                >
                  <Download className="h-4 w-4" />
                  Descargar plantilla
                </a>
              </div>
            </div>
          ) : step === 1 && sheet ? (
            <div className="px-6 sm:px-7 py-5 flex flex-col gap-3.5">
              <div className="text-[13.5px] text-[#3F3F46]">
                <span className="font-semibold text-[#0A0A0A]">{fileName}</span> · {sheet.rows.length} filas · reconocimos {recognized} de {sheet.headers.length} columnas
              </div>
              <div className="border border-[rgba(0,0,0,0.08)] rounded-xl overflow-hidden">
                <div className="grid grid-cols-3 bg-[#FAFAFA] text-[11px] font-semibold tracking-[0.06em] uppercase text-[#71717A]">
                  <div className="px-4 py-2.5">Columna en tu archivo</div>
                  <div className="px-4 py-2.5">Ejemplo</div>
                  <div className="px-4 py-2.5">Se importa como</div>
                </div>
                <div className="max-h-[320px] overflow-y-auto">
                  {sheet.headers.map((header, i) => {
                    const unknown = !mapping[i];
                    const sample = sheet.rows.find((r) => r[i])?.[i] ?? '';
                    return (
                      <div key={`${header}-${i}`} className={`grid grid-cols-3 items-center border-t border-[rgba(0,0,0,0.06)] ${unknown ? 'bg-[#FFFBF5]' : 'bg-white'}`}>
                        <div className="px-4 py-3 text-sm font-semibold text-[#0A0A0A] truncate">{header || `Columna ${i + 1}`}</div>
                        <div className="px-4 py-3 text-[13px] text-[#71717A] truncate">{sample}</div>
                        <div className="px-4 py-2">
                          <label className="sr-only" htmlFor={`import-col-${i}`}>Dato para {header}</label>
                          <select
                            id={`import-col-${i}`}
                            value={mapping[i] ?? ''}
                            onChange={(e) => setColumnField(i, (e.target.value || null) as ImportField | null)}
                            className={`w-full min-h-[40px] rounded-lg px-2.5 text-[13px] font-semibold bg-white text-[#0A0A0A] focus:outline-none ${
                              unknown ? 'border-2 border-[#EA580C]' : 'border border-[rgba(0,0,0,0.14)]'
                            }`}
                          >
                            <option value="">No importar</option>
                            {(Object.keys(IMPORT_FIELD_LABELS) as ImportField[]).map((field) => (
                              <option key={field} value={field}>
                                {IMPORT_FIELD_LABELS[field]}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {unknownHeaders.length > 0 && (
                <Notice tone="warning">
                  No reconocimos {unknownHeaders.length === 1 ? 'la columna' : 'las columnas'}{' '}
                  <span className="font-semibold">{unknownHeaders.map((h) => h || 'sin encabezado').join(', ')}</span>. Elige qué dato es o déjala en «No importar».
                </Notice>
              )}
              {ignoresCount && <Notice tone="warning">El invitado elige cuántas personas; se ignora esta columna.</Notice>}
              {!nameMapped && <Notice tone="error">Elige qué columna es el <span className="font-semibold">Nombre</span>; es obligatoria.</Notice>}
              {tooManyRows && <Notice tone="error">Máximo {MAX_IMPORT_ROWS} invitados por importación. Tu archivo tiene {sheet.rows.length}.</Notice>}
            </div>
          ) : (
            <div className="px-6 sm:px-7 py-5 flex flex-col gap-3.5">
              <div className="grid grid-cols-3 gap-2.5">
                <CountCard value={counts.ready} label="Listas" tone="ready" />
                <CountCard value={counts.warning} label="Con aviso · se importan" tone="warning" />
                <CountCard value={counts.skipped} label="Omitidas" tone="skipped" />
              </div>
              <div className="border border-[rgba(0,0,0,0.08)] rounded-xl overflow-hidden max-h-[340px] overflow-y-auto">
                {results.map((r) => (
                  <div key={r.rowNumber} className="flex items-center gap-3.5 px-4 py-2.5 border-t first:border-t-0 border-[rgba(0,0,0,0.06)]">
                    <StatusBadge status={r.status} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[#0A0A0A] truncate">{r.data?.name || sheet?.rows[r.rowNumber - 2]?.[mapping.indexOf('name')] || `(fila ${r.rowNumber})`}</div>
                      {r.data && (
                        <div className="text-[12.5px] text-[#71717A] truncate">
                          {[r.data.phone, `${r.data.guestCount} ${r.data.guestCount === 1 ? 'persona' : 'personas'}`, r.data.language.toUpperCase()].filter(Boolean).join(' · ')}
                        </div>
                      )}
                    </div>
                    {r.reasons.length > 0 && <div className="text-[12.5px] font-semibold text-[#52525B] text-right max-w-[280px]">{r.reasons.join(' · ')}</div>}
                  </div>
                ))}
              </div>
              {importError && <Notice tone="error">{importError}</Notice>}
            </div>
          )}

          {!done && (
            <div className="flex justify-between gap-2.5 px-6 sm:px-7 py-4 border-t border-[rgba(0,0,0,0.08)]">
              {step === 0 ? (
                <span />
              ) : (
                <AdminButton variant="ghost" onClick={() => setStep(step - 1)} disabled={importing}>
                  Atrás
                </AdminButton>
              )}
              <div className="flex gap-2.5">
                {step === 0 && (
                  <AdminButton variant="ghost" onClick={onClose}>
                    Cancelar
                  </AdminButton>
                )}
                {step === 1 && (
                  <AdminButton onClick={() => setStep(2)} disabled={!nameMapped || tooManyRows}>
                    Ver vista previa
                  </AdminButton>
                )}
                {step === 2 && (
                  <AdminButton onClick={handleImport} disabled={importing || toImport === 0}>
                    {importing ? 'Importando…' : `Importar ${toImport} ${toImport === 1 ? 'invitado' : 'invitados'}`}
                  </AdminButton>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Notice({ tone, children }: { tone: 'warning' | 'error'; children: React.ReactNode }) {
  const classes = tone === 'warning' ? 'bg-[#FFF7ED] border-[#FED7AA] text-[#7C2D12]' : 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]';
  return (
    <div className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-[13px] ${classes}`}>
      <AlertTriangle className="h-4 w-4 flex-none mt-0.5" />
      <span>{children}</span>
    </div>
  );
}

function CountCard({ value, label, tone }: { value: number; label: string; tone: 'ready' | 'warning' | 'skipped' }) {
  const classes = {
    ready: 'border-[#BBF7D0] bg-[#F0FDF4] text-[#166534]',
    warning: 'border-[#FED7AA] bg-[#FFF7ED] text-[#9A3412]',
    skipped: 'border-[#E4E4E7] bg-[#FAFAFA] text-[#3F3F46]',
  }[tone];
  return (
    <div className={`border rounded-xl px-3.5 py-3 ${classes}`}>
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-[12.5px] font-semibold">{label}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: 'ready' | 'warning' | 'skipped' }) {
  const { label, classes } = {
    ready: { label: 'Lista', classes: 'bg-[#DCFCE7] text-[#166534]' },
    warning: { label: 'Con aviso', classes: 'bg-[#FFEDD5] text-[#9A3412]' },
    skipped: { label: 'Omitida', classes: 'bg-[#F4F4F5] text-[#3F3F46]' },
  }[status];
  return <span className={`flex-none w-[92px] text-center py-1 rounded-full text-[11.5px] font-semibold ${classes}`}>{label}</span>;
}
