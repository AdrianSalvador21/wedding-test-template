'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, X, Globe, RefreshCw, Info, ExternalLink, AlertCircle, ChevronDown } from 'lucide-react';
import { AdminButton, AiBadge, AiButton, manrope } from '../../../../../components/admin/ui';
import type { EnglishField } from '../../../../../lib/wedding-language';
import { limitForKey } from '../../../../../lib/aiLimits';

// ---------- contexto compartido por las secciones del editor ----------

export interface EditorAiValue {
  weddingId: string;
  hasEnglish: boolean;
  meta: Record<string, string>;
  setMeta: (key: string, source: string | null) => void;
  translateLimit: boolean;
  setTranslateLimit: (v: boolean) => void;
  // Usos ya consumidos por contador (ej. 'storyGenerate', 'placeGenerate.<id>').
  setUsage: (key: string, used: number) => void;
  remaining: (key: string) => number;
  goToTab: (tab: string) => void;
}

const EditorAiContext = createContext<EditorAiValue | null>(null);
export const EditorAiProvider = EditorAiContext.Provider;

export function useEditorAi(): EditorAiValue {
  const ctx = useContext(EditorAiContext);
  if (!ctx) throw new Error('useEditorAi fuera de EditorAiProvider');
  return ctx;
}

const TRANSLATE_LIMIT_TEXT = 'Ya usaste tus 30 traducciones';
const LIMIT_TEXT = 'Ya usaste tus 5 generaciones para esto';
const ERROR_TEXT = 'No pudimos generar el texto, intenta de nuevo';

async function postJson(url: string, body: unknown): Promise<{ status: number; data: Record<string, unknown> }> {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  let data: Record<string, unknown> = {};
  try {
    data = await res.json();
  } catch {
    /* respuesta sin cuerpo */
  }
  return { status: res.status, data };
}

// Igual que postJson, pero registra en el editor los usos consumidos que
// devuelve el servidor (también en el 429), para mostrar cuántos quedan.
export async function postAi(ai: EditorAiValue, url: string, body: unknown) {
  const res = await postJson(url, body);
  const usage = res.data.usage as { key?: string; used?: number } | undefined;
  if (usage && typeof usage.key === 'string' && typeof usage.used === 'number') ai.setUsage(usage.key, usage.used);
  return res;
}

// " · te quedan 2" cuando ya casi se agotan; vacío si quedan varios.
export function usageHint(ai: EditorAiValue, key: string, threshold = 2): string {
  const left = ai.remaining(key);
  return left > 0 && left <= threshold ? ` · te quedan ${left}` : '';
}

export { limitForKey };

// ---------- overlay: portal a <body>, scroll bloqueado, Esc para cerrar ----------

function Overlay({ children, onClose, align = 'center' }: { children: ReactNode; onClose: () => void; align?: 'center' | 'right' }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  if (!mounted) return null;
  return createPortal(
    <div
      className="admin-form admin-overlay fixed inset-0 z-[100] bg-[rgba(10,10,10,0.45)] flex p-4"
      style={{ ...manrope, justifyContent: align === 'right' ? 'flex-end' : 'center', alignItems: align === 'right' ? 'stretch' : 'center', padding: align === 'right' ? 0 : undefined }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {children}
    </div>,
    document.body
  );
}

const inputBase =
  'w-full border border-[rgba(0,0,0,0.14)] rounded-lg text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111] transition-colors';
const aiInputBase =
  'w-full px-4 py-3 border border-[rgba(0,0,0,0.14)] rounded-lg text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[rgba(109,40,217,0.15)] focus:border-[#6D28D9] transition-colors';

// ---------- campo en inglés con "Traducir con IA" ----------

export function EnField({
  label,
  value,
  onChange,
  source,
  metaKey,
  rows,
  placeholder,
  size = 'md',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  source: string;
  metaKey: string;
  rows?: number;
  placeholder?: string;
  size?: 'md' | 'sm';
}) {
  const ai = useEditorAi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!ai.hasEnglish) return null;

  const translate = async () => {
    if (!source.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const { status, data } = await postAi(ai, '/api/ai/translate', { weddingId: ai.weddingId, items: [{ key: 'x', text: source }] });
      if (status === 429) {
        ai.setTranslateLimit(true);
        setError(TRANSLATE_LIMIT_TEXT);
        return;
      }
      const items = data.items as { key: string; en: string }[] | undefined;
      if (status !== 200 || !items?.[0]?.en) throw new Error('request failed');
      onChange(items[0].en);
      ai.setMeta(metaKey, source);
    } catch {
      setError(ERROR_TEXT);
    } finally {
      setLoading(false);
    }
  };

  const savedSource = ai.meta[metaKey];
  const aiTranslated = savedSource !== undefined && value.trim().length > 0;
  const isStale = aiTranslated && savedSource !== source;
  const disabled = loading || ai.translateLimit || !source.trim();
  const padding = size === 'sm' ? 'px-3 py-2 sm:px-4 sm:py-3' : 'px-4 py-3';
  const cls = `${inputBase} ${padding} ${loading ? 'ai-field-loading' : ''}`;
  const handle = (v: string) => {
    onChange(v);
    ai.setMeta(metaKey, null);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <label className="block text-[13px] font-semibold text-[#27272A]">{label}</label>
          {aiTranslated && !isStale && <AiBadge>Traducido con IA</AiBadge>}
        </div>
        <button
          type="button"
          onClick={translate}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#6D28D9] hover:text-[#5B21B6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Sparkles className="h-3.5 w-3.5" />
          {loading ? 'Traduciendo...' : ai.translateLimit ? TRANSLATE_LIMIT_TEXT : `Traducir con IA${usageHint(ai, 'translate', 5)}`}
        </button>
      </div>
      {rows ? (
        <textarea rows={rows} value={value} onChange={(e) => handle(e.target.value)} readOnly={loading} className={cls} placeholder={placeholder} />
      ) : (
        <input type="text" value={value} onChange={(e) => handle(e.target.value)} readOnly={loading} className={cls} placeholder={placeholder} />
      )}
      {isStale && (
        <div className="mt-1.5 flex items-center gap-2 text-[12px] text-[#71717A]">
          <RefreshCw className="h-3.5 w-3.5" />
          <span>El español cambió desde la traducción.</span>
          <button type="button" onClick={translate} disabled={disabled} className="font-bold text-[#6D28D9] underline disabled:opacity-50">
            Retraducir
          </button>
        </div>
      )}
      {error && <p className="mt-1.5 text-[12px] font-semibold text-[#B91C1C]">{error}</p>}
    </div>
  );
}

// ---------- sugerencias de hoteles / lugares ----------

interface SuggestedPlace {
  name: string;
  category: string;
  reason: string;
  reasonEn: string;
  mapsUrl: string;
}

export interface NewPlaceItem {
  id: string;
  name: string;
  description: { es: string; en: string };
  mapsUrl: string;
}

const CATEGORY_LABEL: Record<string, string> = {
  hospedaje: 'Hospedaje',
  restaurante: 'Restaurante',
  cafe: 'Café',
  atraccion: 'Atracción',
  experiencia: 'Experiencia',
};

interface VenueInfo {
  name: string;
  address: string;
}

export function useAiPlaceSuggestions(opts: {
  endpoint: string;
  usageKey: string;
  idPrefix: string;
  buttonLabel: string;
  heading: string;
  subtitle: string;
  helpText: string;
  existingNames: string[];
  ceremony: VenueInfo;
  reception: VenueInfo;
  onAdd: (items: NewPlaceItem[]) => void;
}): { button: ReactNode; panel: ReactNode } {
  const ai = useEditorAi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [empty, setEmpty] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestedPlace[]>([]);

  const limit = ai.remaining(opts.usageKey) <= 0;
  const hasAddress = opts.ceremony.address.trim().length >= 5 || opts.reception.address.trim().length >= 5;

  const run = async () => {
    setLoading(true);
    setError(null);
    setEmpty(false);
    try {
      const { status, data } = await postAi(ai, opts.endpoint, {
        weddingId: ai.weddingId,
        ceremony: opts.ceremony,
        reception: opts.reception,
        existingNames: opts.existingNames,
        withEnglish: ai.hasEnglish,
      });
      if (status === 429) {
        setError(LIMIT_TEXT);
        return;
      }
      if (status !== 200) throw new Error('request failed');
      const places = Array.isArray(data.places) ? (data.places as SuggestedPlace[]) : [];
      setSuggestions(places);
      setEmpty(places.length === 0);
    } catch {
      setError(ERROR_TEXT);
    } finally {
      setLoading(false);
    }
  };

  const toItems = (list: SuggestedPlace[]): NewPlaceItem[] =>
    list.map((s, i) => ({
      id: `${opts.idPrefix}-${Date.now()}-${i}`,
      name: s.name,
      description: { es: s.reason, en: s.reasonEn || '' },
      mapsUrl: s.mapsUrl,
    }));

  const addOne = (index: number) => {
    opts.onAdd(toItems([suggestions[index]]));
    setSuggestions((prev) => prev.filter((_, i) => i !== index));
  };
  const addAll = () => {
    opts.onAdd(toItems(suggestions));
    setSuggestions([]);
  };

  const button = hasAddress ? (
    <AiButton onClick={run} disabled={loading || limit}>
      <Sparkles className="h-3.5 w-3.5" />
      {loading ? 'Generando...' : limit ? LIMIT_TEXT : `${opts.buttonLabel}${usageHint(ai, opts.usageKey)}`}
    </AiButton>
  ) : null;

  const panel = (
    <>
      {!hasAddress && (
        <div className="flex items-center gap-3 border border-dashed border-[rgba(0,0,0,0.25)] rounded-xl px-4 py-3.5 text-sm text-[#3F3F46]">
          <span className="flex-1">{opts.helpText}</span>
          <button type="button" onClick={() => ai.goToTab('venues')} className="font-bold text-[#6D28D9] hover:text-[#5B21B6] whitespace-nowrap">
            Ir a Lugares
          </button>
        </div>
      )}
      {error && <p className="text-[13px] font-semibold text-[#B91C1C]">{error}</p>}
      {loading && <div className="h-28 rounded-xl ai-field-loading" />}
      {empty && !loading && (
        <div className="flex items-start gap-3 bg-white border border-[rgba(0,0,0,0.14)] rounded-xl px-4 py-3.5 text-sm text-[#3F3F46]">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-[#3F3F46]" />
          <div className="flex-1">
            <div className="font-bold text-[#0A0A0A]">No pudimos ubicar la zona con la dirección actual</div>
            <div>
              Agrega ciudad y estado en Lugares y vuelve a intentar. No se descontó ningún uso.
            </div>
          </div>
          <button type="button" onClick={() => ai.goToTab('venues')} className="font-bold text-[#6D28D9] hover:text-[#5B21B6] whitespace-nowrap">
            Ir a Lugares
          </button>
        </div>
      )}
      {suggestions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 bg-white border border-[rgba(0,0,0,0.14)] rounded-xl px-4 py-3 text-[13px] leading-relaxed text-[#3F3F46]">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>
              La IA puede equivocarse de nombre o sugerir un negocio que ya cerró. Abre <strong>Ver en Maps</strong> y confirma que existe antes de agregarlo.
            </span>
          </div>
          <div className="bg-[#F5F3FF] border border-[rgba(109,40,217,0.25)] rounded-xl p-3 sm:p-4 lg:p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-[#6D28D9]">{opts.heading}</h3>
                <p className="text-[12px] text-[#4C1D95]">{opts.subtitle}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={addAll} className="text-[12px] font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] px-3 py-1.5 rounded-full transition-colors">
                  Agregar todas
                </button>
                <button type="button" onClick={() => setSuggestions([])} className="text-[12px] font-bold text-[#6D28D9] bg-white border border-[rgba(109,40,217,0.3)] hover:bg-[#F5F3FF] px-3 py-1.5 rounded-full transition-colors">
                  Descartar todas
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {suggestions.map((s, index) => (
                <div key={`${s.name}-${index}`} className="bg-white rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-[rgba(109,40,217,0.15)]">
                  <div className="min-w-0">
                    <div className="text-[12px] font-bold text-[#6D28D9] uppercase tracking-wide">{CATEGORY_LABEL[s.category] || s.category}</div>
                    <div className="text-sm font-bold text-[#0A0A0A]">{s.name}</div>
                    <div className="text-[13px] text-[#3F3F46]">{s.reason}</div>
                    {s.reasonEn && (
                      <div className="text-[12px] text-[#71717A]">
                        <span className="font-bold">EN</span> {s.reasonEn}
                      </div>
                    )}
                    <a href={s.mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1.5 text-[12px] font-bold text-[#6D28D9] hover:text-[#5B21B6]">
                      <ExternalLink className="h-3 w-3" />
                      Ver en Maps
                    </a>
                  </div>
                  <div className="flex gap-2 self-start sm:self-center flex-shrink-0">
                    <button type="button" onClick={() => addOne(index)} className="text-[12px] font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] px-3 py-1.5 rounded-full transition-colors">
                      Agregar
                    </button>
                    <button type="button" onClick={() => setSuggestions((prev) => prev.filter((_, i) => i !== index))} className="text-[12px] font-bold text-[#71717A] border border-[rgba(0,0,0,0.14)] hover:bg-[#FAFAFA] px-3 py-1.5 rounded-full transition-colors">
                      Descartar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );

  return { button, panel };
}

// ---------- panel "Inglés" + vista previa de traducciones ----------

interface PreviewRow {
  field: EnglishField;
  en: string;
}

export function EnglishPanel({
  open,
  onClose,
  done,
  total,
  pending,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  done: number;
  total: number;
  pending: EnglishField[];
  onApply: (rows: PreviewRow[]) => void;
}) {
  const ai = useEditorAi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<PreviewRow[] | null>(null);

  useEffect(() => {
    if (!open) {
      setRows(null);
      setError(null);
    }
  }, [open]);

  if (!open) return null;

  const batch = pending.slice(0, 30);

  const translateAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const { status, data } = await postAi(ai, '/api/ai/translate', {
        weddingId: ai.weddingId,
        items: batch.map((f) => ({ key: f.id, text: f.es })),
      });
      if (status === 429) {
        ai.setTranslateLimit(true);
        setError(TRANSLATE_LIMIT_TEXT);
        return;
      }
      const items = data.items as { key: string; en: string }[] | undefined;
      if (status !== 200 || !items) throw new Error('request failed');
      const byKey = new Map(items.map((i) => [i.key, i.en]));
      setRows(batch.map((f) => ({ field: f, en: byKey.get(f.id) ?? '' })));
    } catch {
      setError(ERROR_TEXT);
    } finally {
      setLoading(false);
    }
  };

  if (rows) {
    return (
      <Overlay onClose={onClose}>
        <div role="dialog" aria-label="Revisar traducciones" className="admin-modal bg-white rounded-2xl w-full max-w-[1060px] max-h-[92vh] flex flex-col overflow-hidden">
          <div className="p-5 sm:p-6 pb-3 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[20px] font-extrabold text-[#0A0A0A]">Revisar traducciones</h3>
              <button type="button" onClick={onClose} aria-label="Cerrar" className="text-[#71717A] hover:text-[#0A0A0A]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex items-center gap-2.5 bg-[#F5F3FF] border border-[rgba(109,40,217,0.25)] rounded-lg px-3.5 py-2.5 text-[13px] text-[#4C1D95]">
              <Info className="h-4 w-4 flex-shrink-0 text-[#6D28D9]" />
              Los nombres propios y de lugares se conservan tal cual. Edita lo que quieras antes de aplicar.
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="hidden md:grid grid-cols-[200px_minmax(0,1fr)_minmax(0,1fr)] gap-5 px-6 py-2 text-[11px] font-extrabold tracking-widest uppercase text-[#71717A]">
              <span>Campo</span>
              <span>Español</span>
              <span>Inglés (editable)</span>
            </div>
            {rows.map((row, i) => (
              <div key={row.field.id} className="grid grid-cols-1 md:grid-cols-[200px_minmax(0,1fr)_minmax(0,1fr)] gap-2 md:gap-5 px-6 py-3.5 border-t border-[rgba(0,0,0,0.08)] items-start">
                <div>
                  <div className="text-[13px] font-bold text-[#0A0A0A]">{row.field.label}</div>
                  <div className="text-[12px] text-[#71717A]">{row.field.tabLabel}</div>
                </div>
                <div className="text-sm leading-relaxed text-[#3F3F46]">{row.field.es}</div>
                <textarea
                  aria-label={`Inglés: ${row.field.label}`}
                  rows={2}
                  value={row.en}
                  onChange={(e) => setRows((prev) => (prev ? prev.map((r, j) => (j === i ? { ...r, en: e.target.value } : r)) : prev))}
                  className={`${inputBase} px-3 py-2.5 text-sm`}
                />
              </div>
            ))}
          </div>
          <div className="px-6 py-4 border-t border-[rgba(0,0,0,0.08)] flex flex-wrap items-center justify-between gap-3">
            <span className="text-[13px] text-[#71717A]">Esto solo llena el formulario. Se guarda al pulsar «Guardar cambios».</span>
            <div className="flex gap-3">
              <AdminButton variant="ghost" onClick={onClose}>
                Cancelar
              </AdminButton>
              <AdminButton
                onClick={() => {
                  onApply(rows.filter((r) => r.en.trim()));
                  onClose();
                }}
              >
                Aplicar {rows.length} traducciones
              </AdminButton>
            </div>
          </div>
        </div>
      </Overlay>
    );
  }

  const groups = pending.reduce<Record<string, EnglishField[]>>((acc, f) => {
    (acc[f.tabLabel] ||= []).push(f);
    return acc;
  }, {});

  return (
    <Overlay onClose={onClose} align="right">
      <div role="dialog" aria-label="Inglés" className="admin-drawer bg-white w-full max-w-[460px] h-full flex flex-col shadow-[-12px_0_40px_rgba(0,0,0,0.12)]">
        <div className="p-6 pb-4 space-y-3.5 border-b border-[rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-[20px] font-extrabold text-[#0A0A0A]">
              <Globe className="h-5 w-5 text-[#6D28D9]" />
              Inglés
            </div>
            <button type="button" onClick={onClose} aria-label="Cerrar" className="text-[#71717A] hover:text-[#0A0A0A]">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="text-sm text-[#3F3F46]">
            {done} de {total} campos traducidos.{pending.length > 0 && <> Faltan <strong>{pending.length}</strong>.</>}
          </div>
          <div className="h-1.5 rounded-full bg-[#E4E4E7] overflow-hidden">
            <div className="h-full bg-[#6D28D9]" style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {pending.length === 0 && <p className="text-sm text-[#71717A] py-6 text-center">No falta nada por traducir.</p>}
          {Object.entries(groups).map(([tabLabel, fields]) => (
            <div key={tabLabel} className="mb-2">
              <div className="text-[11px] font-extrabold tracking-widest uppercase text-[#71717A] px-1 pt-2 pb-1">{tabLabel}</div>
              {fields.map((f) => (
                <div key={f.id} className="flex items-center gap-2.5 min-h-[40px] px-1">
                  <span className="h-3.5 w-3.5 rounded-full border-[1.5px] border-[#D4D4D8] flex-shrink-0" />
                  <span className="flex-1 text-sm font-semibold text-[#0A0A0A]">{f.label}</span>
                  <button
                    type="button"
                    onClick={() => {
                      ai.goToTab(f.tab);
                      onClose();
                    }}
                    className="text-[12px] font-bold text-[#6D28D9] hover:text-[#5B21B6]"
                  >
                    Ir al campo
                  </button>
                </div>
              ))}
            </div>
          ))}
          {done > 0 && (
            <div className="flex items-center gap-2 mt-3 px-1 py-2.5 border-t border-[rgba(0,0,0,0.08)] text-[13px] font-semibold text-[#3F3F46]">
              <ChevronDown className="h-4 w-4" />
              {done} campos ya traducidos
            </div>
          )}
        </div>
        <div className="px-6 pt-4 pb-6 border-t border-[rgba(0,0,0,0.08)] space-y-2.5">
          {error && <p className="text-[12px] font-semibold text-[#B91C1C] text-center">{error}</p>}
          <button
            type="button"
            onClick={translateAll}
            disabled={loading || ai.translateLimit || pending.length === 0}
            className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-lg bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            {loading ? 'Traduciendo...' : ai.translateLimit ? TRANSLATE_LIMIT_TEXT : `Traducir lo que falta (${batch.length})`}
          </button>
          <p className="text-[12px] leading-relaxed text-[#71717A] text-center">
            Verás una vista previa antes de aplicar. Cuenta como 1 de tus 30 traducciones.
            {pending.length > batch.length && ' Se traducen los primeros 30 campos.'}
          </p>
        </div>
      </div>
    </Overlay>
  );
}

// ---------- modal "Redactor de textos con IA" (Historia de Amor) ----------

export function AiStoryModal({
  weddingId,
  withEnglish,
  onClose,
  onUseText,
}: {
  weddingId: string;
  withEnglish: boolean;
  onClose: () => void;
  onUseText: (es: string, en: string | null) => void;
}) {
  const ai = useEditorAi();
  const [howMet, setHowMet] = useState('');
  const [anecdote, setAnecdote] = useState('');
  const [tone, setTone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ es: string; en: string } | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const { status, data } = await postAi(ai, '/api/ai/story', { weddingId, howMet, anecdote, tone, withEnglish });
      if (status === 429) {
        setError(LIMIT_TEXT);
        return;
      }
      if (status !== 200 || typeof data.es !== 'string') throw new Error('request failed');
      setResult({ es: data.es, en: typeof data.en === 'string' ? data.en : '' });
    } catch {
      setError(ERROR_TEXT);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Overlay onClose={onClose}>
      <div role="dialog" aria-label="Redactor de textos con IA" className="admin-modal bg-white rounded-2xl p-6 max-w-[600px] w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2.5 text-[18px] font-extrabold text-[#0A0A0A]">
            <Sparkles className="h-[18px] w-[18px] text-[#6D28D9]" />
            Redactor de textos con IA
          </h3>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="text-[#71717A] hover:text-[#0A0A0A] transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {!result ? (
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-semibold text-[#27272A] mb-2">¿Cómo se conocieron?</label>
              <textarea rows={2} value={howMet} onChange={(e) => setHowMet(e.target.value)} className={aiInputBase} placeholder="En la universidad, por medio de amigos en común..." />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-[#27272A] mb-2">Una anécdota o momento especial</label>
              <textarea rows={2} value={anecdote} onChange={(e) => setAnecdote(e.target.value)} className={aiInputBase} placeholder="El primer viaje juntos, la pedida de mano..." />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-[#27272A] mb-2">Tono deseado</label>
              <input type="text" value={tone} onChange={(e) => setTone(e.target.value)} className={aiInputBase} placeholder="Cálido, divertido, romántico..." />
            </div>
            {loading && <div className="h-24 rounded-lg ai-field-loading" />}
            {error && <p className="text-[12px] font-semibold text-[#B91C1C]">{error}</p>}
            <div className="flex justify-end pt-2">
              <AiButton onClick={handleGenerate} disabled={loading}>
                <Sparkles className="h-3.5 w-3.5" />
                {loading ? 'Generando...' : 'Generar borrador con IA'}
              </AiButton>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-semibold text-[#27272A] mb-2">Historia en Español</label>
              <textarea rows={4} value={result.es} onChange={(e) => setResult({ ...result, es: e.target.value })} className={aiInputBase} />
            </div>
            {withEnglish && (
              <div>
                <label className="block text-[13px] font-semibold text-[#27272A] mb-2">Historia en Inglés</label>
                <textarea rows={4} value={result.en} onChange={(e) => setResult({ ...result, en: e.target.value })} className={aiInputBase} />
              </div>
            )}
            {loading && <div className="h-24 rounded-lg ai-field-loading" />}
            {error && <p className="text-[12px] font-semibold text-[#B91C1C]">{error}</p>}
            <div className="flex flex-wrap justify-end gap-3 pt-2">
              <AiButton variant="ghost" onClick={handleGenerate} disabled={loading}>
                <Sparkles className="h-3.5 w-3.5" />
                {loading ? 'Regenerando...' : 'Regenerar'}
              </AiButton>
              <AdminButton onClick={() => onUseText(result.es, withEnglish ? result.en : null)}>Usar este texto</AdminButton>
            </div>
          </div>
        )}
      </div>
    </Overlay>
  );
}

// ---------- helper para redactores por campo (dress code, descripción de lugar) ----------

export async function requestDraft(
  ai: EditorAiValue,
  url: string,
  body: Record<string, unknown>
): Promise<{ ok: true; es: string; en: string } | { ok: false; limit: boolean }> {
  try {
    const { status, data } = await postAi(ai, url, body);
    if (status === 429) return { ok: false, limit: true };
    if (status !== 200 || typeof data.es !== 'string') return { ok: false, limit: false };
    return { ok: true, es: data.es, en: typeof data.en === 'string' ? data.en : '' };
  } catch {
    return { ok: false, limit: false };
  }
}

export const AI_TEXT = { LIMIT_TEXT, ERROR_TEXT };
