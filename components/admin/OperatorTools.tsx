'use client';

import { useEffect, useId, useState, type FormEvent, type ReactNode } from 'react';
import { useParams } from 'next/navigation';
import { Check, Copy, Info, Loader2, MessageCircle, Trash2, X } from 'lucide-react';
import { manrope } from './ui';
import { useAuth, type LinkedWedding } from '../../lib/auth-context';
import { isValidWeddingId, slugifyWeddingNames } from '../../lib/wedding-defaults';
import { EMAIL_RE, MAX_OWNER_EMAILS, TEMPLATE_OPTIONS, isValidEmail, isValidIsoDate, type TemplateId } from '../../lib/admin-validation';

// Alta de invitaciones y edición de correos con acceso (solo operador, spec 08).

const inputClass = (error?: boolean) =>
  `w-full h-[46px] rounded-lg border bg-white px-4 text-sm text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111] transition-colors ${
    error ? 'border-[#B91C1C]' : 'border-[rgba(0,0,0,0.14)]'
  }`;

function Modal({ title, sub, onClose, children, width = 680 }: { title: string; sub?: ReactNode; onClose: () => void; children: ReactNode; width?: number }) {
  useEffect(() => {
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

  return (
    <div
      className="admin-form admin-overlay fixed inset-0 z-[100] bg-[rgba(10,10,10,0.45)] flex items-start sm:items-center justify-center p-4 overflow-y-auto"
      style={manrope}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div role="dialog" aria-label={title} className="admin-modal bg-white rounded-2xl p-5 sm:p-7 w-full flex flex-col gap-[22px] my-auto" style={{ maxWidth: width }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="text-[22px] font-extrabold tracking-[-0.01em] text-[#0A0A0A]">{title}</div>
            {sub && <div className="text-[13px] leading-normal text-[#3F3F46]">{sub}</div>}
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="h-9 w-9 flex items-center justify-center rounded-lg text-[#71717A] hover:bg-[#F4F4F5]">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, error, hint, children, htmlFor }: { label: string; error?: string; hint?: string; children: ReactNode; htmlFor: string }) {
  return (
    <div className="flex flex-col gap-2 min-w-0">
      <label htmlFor={htmlFor} className="text-[13px] font-semibold text-[#27272A]">
        {label}
      </label>
      {children}
      {(error || hint) && <span className={`text-xs leading-normal ${error ? 'text-[#B91C1C]' : 'text-[#71717A]'}`}>{error || hint}</span>}
    </div>
  );
}

function Btn({ children, onClick, type = 'button', ghost = false, loading = false, disabled = false }: { children: ReactNode; onClick?: () => void; type?: 'button' | 'submit'; ghost?: boolean; loading?: boolean; disabled?: boolean }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 h-[46px] px-5 rounded-lg text-sm font-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
        ghost ? 'bg-white text-[#0A0A0A] border border-[rgba(0,0,0,0.14)] hover:bg-[#FAFAFA]' : 'bg-[#111111] text-white border border-transparent hover:bg-black'
      }`}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-bold tracking-[0.04em] uppercase text-[#71717A]">{label}</span>
      <div className="flex items-center gap-2.5 border border-[rgba(0,0,0,0.08)] bg-[#FAFAFA] rounded-lg py-2 pl-3.5 pr-2">
        <span className="flex-1 min-w-0 text-[13px] text-[#0A0A0A] font-mono truncate">{value}</span>
        <button
          type="button"
          onClick={async () => {
            if (await copyText(value)) {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }
          }}
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-white text-[#0A0A0A] border border-[rgba(0,0,0,0.14)] hover:bg-[#FAFAFA] text-[13px] font-bold"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
    </div>
  );
}

const TEMPLATE_IMAGES: Record<TemplateId, string> = {
  'template-01': '/assets/landing/design-template-01.jpg',
  'template-02': '/assets/landing/design-template-02.jpg',
  'template-03': '/assets/landing/design-template-03.jpg',
};

function TemplatePicker({ value, onChange, name }: { value: TemplateId; onChange: (id: TemplateId) => void; name: string }) {
  return (
    <fieldset className="flex flex-col gap-2 border-0 p-0 m-0 min-w-0">
      <legend className="text-[13px] font-semibold text-[#27272A] mb-2 p-0">Plantilla</legend>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {TEMPLATE_OPTIONS.map((t) => {
          const selected = value === t.id;
          return (
            <label
              key={t.id}
              className={`flex flex-col gap-2.5 rounded-xl bg-white cursor-pointer min-w-0 ${selected ? 'border-2 border-[#111111] p-[11px]' : 'border border-[rgba(0,0,0,0.14)] p-3'}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={TEMPLATE_IMAGES[t.id]} alt="" className="w-full aspect-[4/3] object-cover object-top rounded-lg bg-[#F4F4F5]" />
              <div className="flex items-center gap-2">
                <input type="radio" name={name} checked={selected} onChange={() => onChange(t.id)} className="accent-[#111111] m-0" />
                <span className="text-sm font-bold text-[#0A0A0A]">{t.name}</span>
              </div>
              <span className="text-xs leading-snug text-[#71717A]">{t.description}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

interface CreatedWedding {
  id: string;
  bride: string;
  groom: string;
  emails: string[];
}

// ---------- Nueva invitación ----------

export function NewWeddingModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const auth = useAuth();
  const params = useParams();
  const locale = (params?.locale as string) || 'es';
  const uid = useId();

  const [bride, setBride] = useState('');
  const [groom, setGroom] = useState('');
  const [brideEmail, setBrideEmail] = useState('');
  const [groomEmail, setGroomEmail] = useState('');
  const [date, setDate] = useState('');
  const [templateId, setTemplateId] = useState<TemplateId>('template-01');
  const [weddingId, setWeddingId] = useState('');
  const [idTouched, setIdTouched] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<CreatedWedding | null>(null);
  const [messageCopied, setMessageCopied] = useState(false);

  useEffect(() => {
    if (!idTouched) setWeddingId(slugifyWeddingNames(bride, groom));
  }, [bride, groom, idTouched]);

  const reset = () => {
    setBride('');
    setGroom('');
    setBrideEmail('');
    setGroomEmail('');
    setDate('');
    setTemplateId('template-01');
    setWeddingId('');
    setIdTouched(false);
    setErrors({});
    setSuggestion(null);
    setBanner(null);
    setCreated(null);
  };

  const idError = (id: string): string | null => {
    if (id.length < 3 || id.length > 50 || !/^[a-zA-Z0-9\-_]+$/.test(id)) return 'Usa de 3 a 50 caracteres: letras, números y guiones.';
    if (!isValidWeddingId(id)) return 'Ese ID está reservado. Usa otro.';
    return null;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBanner(null);
    setSuggestion(null);

    const next: Record<string, string> = {};
    if (!bride.trim()) next.bride = 'Escribe el nombre.';
    if (!groom.trim()) next.groom = 'Escribe el nombre.';
    if (!EMAIL_RE.test(brideEmail.trim())) next.brideEmail = 'Escribe un correo válido.';
    if (!EMAIL_RE.test(groomEmail.trim())) next.groomEmail = 'Escribe un correo válido.';
    if (!isValidIsoDate(date)) next.date = 'Elige la fecha de la boda.';
    const idProblem = idError(weddingId.trim());
    if (idProblem) next.weddingId = idProblem;
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      const res = await auth.authedFetch('/api/admin/weddings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bride: bride.trim(),
          groom: groom.trim(),
          brideEmail: brideEmail.trim(),
          groomEmail: groomEmail.trim(),
          date,
          templateId,
          weddingId: weddingId.trim(),
        }),
      });
      if (res.status === 201) {
        const emails = Array.from(new Set([brideEmail.trim().toLowerCase(), groomEmail.trim().toLowerCase()]));
        setCreated({ id: weddingId.trim(), bride: bride.trim(), groom: groom.trim(), emails });
        onCreated();
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (res.status === 409) {
        setErrors({ weddingId: 'Ya existe una invitación con ese ID.' });
        setSuggestion(`${weddingId.trim()}-2`);
      } else if (res.status === 400 && typeof data.field === 'string') {
        setErrors({ [data.field]: 'Revisa este campo.' });
      } else {
        setBanner('No pudimos crear la invitación. Inténtalo de nuevo.');
      }
    } catch {
      setBanner('No pudimos crear la invitación. Revisa tu conexión e inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  if (created) {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const inviteUrl = `${origin}/es/wedding/${created.id}`;
    const loginUrl = `${origin}/login`;
    const emailsText = created.emails.length > 1 ? `${created.emails[0]} (o ${created.emails[1]})` : created.emails[0];
    const message = `Hola ${created.bride} y ${created.groom}, ya está lista la base de su invitación en Invyta.\n\nPara editarla:\n1. Entren a ${loginUrl}\n2. Creen su cuenta con este correo: ${emailsText} y verifíquenlo desde el mensaje que les llega.\n3. Al entrar, se abrirá directo su invitación.\n\nSi algo no funciona, respóndanme por aquí.`;

    return (
      <Modal title="Invitación creada" sub={`${created.bride} y ${created.groom} ya pueden entrar con sus correos.`} onClose={onClose}>
        <CopyRow label="Invitación para los invitados" value={inviteUrl} />
        <CopyRow label="Entrada de la pareja" value={loginUrl} />
        <div className="flex flex-col gap-2">
          <label htmlFor={`${uid}-msg`} className="text-[13px] font-semibold text-[#27272A]">
            Mensaje para WhatsApp
          </label>
          <textarea id={`${uid}-msg`} readOnly rows={10} value={message} className="w-full resize-none rounded-lg border border-[rgba(0,0,0,0.14)] bg-white px-4 py-3.5 text-[13px] leading-relaxed text-[#0A0A0A]" />
          <div className="flex flex-wrap gap-2.5">
            <Btn
              onClick={async () => {
                if (await copyText(message)) {
                  setMessageCopied(true);
                  setTimeout(() => setMessageCopied(false), 2000);
                }
              }}
            >
              {messageCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {messageCopied ? 'Mensaje copiado' : 'Copiar mensaje'}
            </Btn>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(message)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 h-[46px] px-5 rounded-lg bg-white text-[#0A0A0A] border border-[rgba(0,0,0,0.14)] hover:bg-[#FAFAFA] text-sm font-bold"
            >
              <MessageCircle className="h-4 w-4" />
              Abrir en WhatsApp
            </a>
          </div>
        </div>
        <div className="flex gap-2.5 items-start bg-[#F4F4F5] rounded-[10px] px-3.5 py-3 text-[13px] leading-normal text-[#3F3F46]">
          <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>Las fotos y la música se agregan aparte. Mientras tanto la invitación usa fotos de stock.</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button type="button" onClick={reset} className="text-[13px] font-bold text-[#0A0A0A] underline">
            Crear otra invitación
          </button>
          <a
            href={`/${locale}/admin/wedding-editor/${created.id}`}
            className="inline-flex items-center justify-center h-[46px] px-5 rounded-lg bg-white text-[#0A0A0A] border border-[rgba(0,0,0,0.14)] hover:bg-[#FAFAFA] text-sm font-bold"
          >
            Ir al editor de la invitación
          </a>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title="Nueva invitación" sub="Crea la base de la invitación. La pareja completa el resto desde su editor." onClose={onClose}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-[22px]">
        {banner && (
          <div role="alert" className="flex gap-2.5 items-start bg-[rgba(185,28,28,0.06)] border border-[rgba(185,28,28,0.3)] rounded-[10px] px-3.5 py-3 text-[13px] text-[#7F1D1D]">
            {banner}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nombre de la persona 2" htmlFor={`${uid}-bride`} error={errors.bride}>
            <input id={`${uid}-bride`} type="text" value={bride} onChange={(e) => setBride(e.target.value)} className={inputClass(!!errors.bride)} placeholder="María" />
          </Field>
          <Field label="Nombre de la persona 1" htmlFor={`${uid}-groom`} error={errors.groom}>
            <input id={`${uid}-groom`} type="text" value={groom} onChange={(e) => setGroom(e.target.value)} className={inputClass(!!errors.groom)} placeholder="Carlos" />
          </Field>
        </div>
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Correo de la persona 2" htmlFor={`${uid}-bmail`} error={errors.brideEmail}>
              <input id={`${uid}-bmail`} type="email" value={brideEmail} onChange={(e) => setBrideEmail(e.target.value)} className={inputClass(!!errors.brideEmail)} placeholder="maria@correo.com" />
            </Field>
            <Field label="Correo de la persona 1" htmlFor={`${uid}-gmail`} error={errors.groomEmail}>
              <input id={`${uid}-gmail`} type="email" value={groomEmail} onChange={(e) => setGroomEmail(e.target.value)} className={inputClass(!!errors.groomEmail)} placeholder="carlos@correo.com" />
            </Field>
          </div>
          <span className="text-xs text-[#71717A]">Con estos correos podrán crear su cuenta y entrar a su invitación.</span>
        </div>
        <Field label="Fecha de la boda" htmlFor={`${uid}-date`} error={errors.date}>
          <input id={`${uid}-date`} type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass(!!errors.date)} />
        </Field>
        <TemplatePicker value={templateId} onChange={setTemplateId} name={`${uid}-tpl`} />
        <Field
          label="Dirección de la invitación"
          htmlFor={`${uid}-id`}
          error={errors.weddingId}
          hint="Es la parte que ven los invitados en su enlace. De 3 a 50 caracteres: letras, números y guiones."
        >
          <div className={`flex items-stretch h-[46px] rounded-lg border overflow-hidden bg-white ${errors.weddingId ? 'border-[#B91C1C]' : 'border-[rgba(0,0,0,0.14)]'}`}>
            <span className="flex items-center px-3 bg-[#F4F4F5] text-[13px] text-[#71717A] font-mono">/wedding/</span>
            <input
              id={`${uid}-id`}
              type="text"
              value={weddingId}
              onChange={(e) => {
                setWeddingId(e.target.value);
                setIdTouched(true);
              }}
              className="flex-1 min-w-0 border-0 px-3.5 text-sm text-[#0A0A0A] font-mono focus:outline-none"
            />
          </div>
          {suggestion && (
            <button
              type="button"
              onClick={() => {
                setWeddingId(suggestion);
                setIdTouched(true);
                setErrors((prev) => ({ ...prev, weddingId: '' }));
                setSuggestion(null);
              }}
              className="self-start text-xs font-bold text-[#0A0A0A] underline"
            >
              Usar {suggestion}
            </button>
          )}
        </Field>
        <div className="flex justify-end gap-3">
          <Btn ghost onClick={onClose}>
            Cancelar
          </Btn>
          <Btn type="submit" loading={submitting}>
            Crear invitación
          </Btn>
        </div>
      </form>
    </Modal>
  );
}

// ---------- Correos con acceso ----------

export function OwnersModal({ wedding, onClose, onSaved }: { wedding: LinkedWedding; onClose: () => void; onSaved: () => void }) {
  const auth = useAuth();
  const uid = useId();
  const [emails, setEmails] = useState<string[]>(wedding.ownerEmails ?? []);
  const [input, setInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await auth.authedFetch(`/api/admin/weddings/${wedding.id}/owners`);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && Array.isArray(data.emails)) setEmails(data.emails);
        }
      } catch {
        /* se conserva la lista con la que se abrió el modal */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wedding.id]);

  const add = () => {
    const value = input.trim().toLowerCase();
    if (!isValidEmail(value)) {
      setInputError('Escribe un correo válido.');
      return;
    }
    if (emails.includes(value)) {
      setInputError('Ese correo ya está en la lista.');
      return;
    }
    if (emails.length >= MAX_OWNER_EMAILS) {
      setInputError(`Máximo ${MAX_OWNER_EMAILS} correos por invitación.`);
      return;
    }
    setEmails((prev) => [...prev, value]);
    setInput('');
    setInputError(null);
  };

  const save = async () => {
    setError(null);
    if (emails.length === 0) {
      setError('Debe quedar al menos un correo con acceso.');
      return;
    }
    setSaving(true);
    try {
      const res = await auth.authedFetch(`/api/admin/weddings/${wedding.id}/owners`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails }),
      });
      if (!res.ok) throw new Error('save failed');
      onSaved();
      onClose();
    } catch {
      setError('No pudimos guardar los correos. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Correos con acceso"
      sub={
        <>
          {wedding.title} · <span className="font-mono">{wedding.id}</span>
        </>
      }
      onClose={onClose}
      width={560}
    >
      <div className="flex flex-col gap-2">
        {loading && <div className="text-[13px] text-[#71717A]">Cargando correos...</div>}
        {emails.map((email) => (
          <div key={email} className="flex items-center gap-2.5 border border-[rgba(0,0,0,0.08)] rounded-lg py-1.5 pl-3.5 pr-1.5">
            <span className="flex-1 text-sm text-[#0A0A0A] break-all">{email}</span>
            <button
              type="button"
              aria-label={`Quitar ${email}`}
              onClick={() => setEmails((prev) => prev.filter((e) => e !== email))}
              className="h-9 w-9 flex items-center justify-center rounded-lg text-[#71717A] hover:bg-[#F4F4F5]"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <Field label="Agregar correo" htmlFor={`${uid}-add`} error={inputError || undefined}>
        <div className="flex gap-2.5">
          <input
            id={`${uid}-add`}
            type="email"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setInputError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                add();
              }
            }}
            className={inputClass(!!inputError)}
            placeholder="nombre@correo.com"
          />
          <Btn ghost onClick={add}>
            Agregar
          </Btn>
        </div>
      </Field>
      <div className="flex gap-2.5 items-start bg-[#F4F4F5] rounded-[10px] px-3.5 py-3 text-[13px] leading-normal text-[#3F3F46]">
        <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <span>Solo estos correos, ya verificados, pueden entrar a esta invitación. Los cambios se aplican la próxima vez que inicien sesión.</span>
      </div>
      {error && (
        <div role="alert" className="text-[13px] font-semibold text-[#B91C1C]">
          {error}
        </div>
      )}
      <div className="flex justify-end gap-3">
        <Btn ghost onClick={onClose}>
          Cancelar
        </Btn>
        <Btn onClick={save} loading={saving}>
          Guardar correos
        </Btn>
      </div>
    </Modal>
  );
}

// ---------- Ajustes de la invitación (plantilla y dirección) ----------

export function SettingsModal({ wedding, onClose, onSaved }: { wedding: LinkedWedding; onClose: () => void; onSaved: () => void }) {
  const auth = useAuth();
  const uid = useId();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [initial, setInitial] = useState<{ templateId: TemplateId; guestCount: number } | null>(null);
  const [templateId, setTemplateId] = useState<TemplateId>('template-01');
  const [newId, setNewId] = useState(wedding.id);
  const [idProblem, setIdProblem] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await auth.authedFetch(`/api/admin/weddings/${wedding.id}`);
        if (!res.ok) throw new Error('load failed');
        const data = await res.json();
        if (cancelled) return;
        setInitial({ templateId: data.templateId, guestCount: data.guestCount ?? 0 });
        setTemplateId(data.templateId);
      } catch {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wedding.id]);

  const guestCount = initial?.guestCount ?? 0;
  const locked = guestCount > 0;
  const trimmedId = newId.trim();
  const idChanged = trimmedId !== wedding.id;
  const templateChanged = !!initial && templateId !== initial.templateId;
  const changed = templateChanged || (!locked && idChanged);

  const save = async () => {
    setError(null);
    setSuggestion(null);
    if (!locked && idChanged) {
      if (trimmedId.length < 3 || trimmedId.length > 50 || !/^[a-zA-Z0-9\-_]+$/.test(trimmedId)) {
        setIdProblem('Usa de 3 a 50 caracteres: letras, números y guiones.');
        return;
      }
      if (!isValidWeddingId(trimmedId)) {
        setIdProblem('Ese ID está reservado. Usa otro.');
        return;
      }
    }
    setIdProblem(null);

    setSaving(true);
    try {
      const body: Record<string, string> = {};
      if (templateChanged) body.templateId = templateId;
      if (!locked && idChanged) body.newWeddingId = trimmedId;
      const res = await auth.authedFetch(`/api/admin/weddings/${wedding.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        onSaved();
        onClose();
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (res.status === 409 && data.error === 'has_guests') {
        setInitial((prev) => (prev ? { ...prev, guestCount: data.guestCount ?? 1 } : prev));
        setNewId(wedding.id);
        setError('Esta invitación ya tiene invitados, así que la dirección no se puede cambiar.');
      } else if (res.status === 409) {
        setIdProblem('Ya existe una invitación con ese ID.');
        setSuggestion(`${trimmedId}-2`);
      } else if (res.status === 400 && data.field === 'newWeddingId') {
        setIdProblem('Ese ID no es válido.');
      } else {
        setError('No pudimos guardar los cambios. Inténtalo de nuevo.');
      }
    } catch {
      setError('No pudimos guardar los cambios. Revisa tu conexión e inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Ajustes de la invitación"
      sub={
        <>
          {wedding.title} · <span className="font-mono">{wedding.id}</span>
        </>
      }
      onClose={onClose}
    >
      {loading && <div className="text-[13px] text-[#71717A]">Cargando ajustes...</div>}
      {loadError && (
        <div role="alert" className="text-[13px] font-semibold text-[#B91C1C]">
          No pudimos cargar los ajustes. Cierra e inténtalo de nuevo.
        </div>
      )}
      {initial && (
        <>
          <TemplatePicker value={templateId} onChange={setTemplateId} name={`${uid}-tpl`} />
          <Field
            label="Dirección de la invitación"
            htmlFor={`${uid}-id`}
            error={idProblem || undefined}
            hint={
              locked
                ? `Esta invitación ya tiene ${guestCount} ${guestCount === 1 ? 'invitado' : 'invitados'}: cambiar la dirección rompería sus enlaces.`
                : 'Es la parte que ven los invitados en su enlace. Solo se puede cambiar mientras la invitación no tenga invitados.'
            }
          >
            <div className={`flex items-stretch h-[46px] rounded-lg border overflow-hidden ${locked ? 'bg-[#F4F4F5]' : 'bg-white'} ${idProblem ? 'border-[#B91C1C]' : 'border-[rgba(0,0,0,0.14)]'}`}>
              <span className="flex items-center px-3 bg-[#F4F4F5] text-[13px] text-[#71717A] font-mono">/wedding/</span>
              <input
                id={`${uid}-id`}
                type="text"
                value={newId}
                disabled={locked}
                onChange={(e) => {
                  setNewId(e.target.value);
                  setIdProblem(null);
                  setSuggestion(null);
                }}
                className="flex-1 min-w-0 border-0 px-3.5 text-sm text-[#0A0A0A] font-mono focus:outline-none disabled:bg-[#F4F4F5] disabled:text-[#71717A]"
              />
            </div>
            {suggestion && (
              <button
                type="button"
                onClick={() => {
                  setNewId(suggestion);
                  setIdProblem(null);
                  setSuggestion(null);
                }}
                className="self-start text-xs font-bold text-[#0A0A0A] underline"
              >
                Usar {suggestion}
              </button>
            )}
          </Field>
          {!locked && idChanged && (
            <div className="flex gap-2.5 items-start bg-[#F4F4F5] rounded-[10px] px-3.5 py-3 text-[13px] leading-normal text-[#3F3F46]">
              <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>
                Si ya copiaste fotos o música con el ID anterior (<span className="font-mono">public/assets/wedding-images/{wedding.id}/</span> y <span className="font-mono">music/{wedding.id}.mp3</span>), renómbralas a <span className="font-mono">{trimmedId || 'el ID nuevo'}</span> y vuelve a desplegar.
              </span>
            </div>
          )}
        </>
      )}
      {error && (
        <div role="alert" className="text-[13px] font-semibold text-[#B91C1C]">
          {error}
        </div>
      )}
      <div className="flex justify-end gap-3">
        <Btn ghost onClick={onClose}>
          Cancelar
        </Btn>
        <Btn onClick={save} loading={saving} disabled={!initial || !changed}>
          Guardar cambios
        </Btn>
      </div>
    </Modal>
  );
}
