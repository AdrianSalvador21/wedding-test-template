'use client';

import { useEffect, useId, useState, type FormEvent } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { Modal, Field, Btn, inputClass } from './OperatorTools';
import { useAuth } from '../../lib/auth-context';
import { db } from '../../lib/firebase';
import { saveWeddingDoc } from '../../lib/weddingSave';
import { isValidIsoDate } from '../../lib/admin-validation';
import { track } from '../../lib/analytics/client';
import type { WeddingData } from '../../src/types/wedding';

// Alta y ajustes de autoservicio de una boda gratuita (spec 16): mismo patrón visual que
// components/admin/OperatorTools.tsx (Modal/Field/Btn compartidos), sin las partes que solo
// aplican al operador (correos, plantilla, dirección editable).

// ---------- Alta gratuita ----------

export function FreeWeddingModal({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string) => void }) {
  const auth = useAuth();
  const uid = useId();

  const [bride, setBride] = useState('');
  const [groom, setGroom] = useState('');
  const [date, setDate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBanner(null);

    const next: Record<string, string> = {};
    if (!bride.trim()) next.bride = 'Escribe el nombre.';
    if (!groom.trim()) next.groom = 'Escribe el nombre.';
    if (!isValidIsoDate(date)) next.date = 'Elige la fecha de la boda.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      const res = await auth.authedFetch('/api/weddings/free', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bride: bride.trim(), groom: groom.trim(), date }),
      });
      if (res.status === 201) {
        const data = await res.json();
        track('free_wedding_created', {});
        onCreated(data.id);
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (res.status === 409 && data.error === 'free_limit_reached') {
        track('free_wedding_limit_reached', {});
        setBanner(`Ya tienes ${data.limit ?? 3} bodas gratuitas creadas. Escríbenos si necesitas otra.`);
      } else if (res.status === 400 && typeof data.field === 'string') {
        setErrors({ [data.field]: 'Revisa este campo.' });
      } else {
        setBanner('No pudimos crear tu lista de invitados. Inténtalo de nuevo.');
      }
    } catch {
      setBanner('No pudimos crear tu lista de invitados. Revisa tu conexión e inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Crear tu lista de invitados"
      sub="Sin plantilla ni editor de invitación. Después puedes agregar una invitación con diseño si la contratas."
      onClose={onClose}
      width={480}
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-[22px]">
        {banner && (
          <div role="alert" className="flex gap-2.5 items-start bg-[rgba(185,28,28,0.06)] border border-[rgba(185,28,28,0.3)] rounded-[10px] px-3.5 py-3 text-[13px] text-[#7F1D1D]">
            {banner}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nombre de la persona 1" htmlFor={`${uid}-bride`} error={errors.bride}>
            <input id={`${uid}-bride`} type="text" value={bride} onChange={(e) => setBride(e.target.value)} className={inputClass(!!errors.bride)} placeholder="Sofía" />
          </Field>
          <Field label="Nombre de la persona 2" htmlFor={`${uid}-groom`} error={errors.groom}>
            <input id={`${uid}-groom`} type="text" value={groom} onChange={(e) => setGroom(e.target.value)} className={inputClass(!!errors.groom)} placeholder="Diego" />
          </Field>
        </div>
        <Field label="Fecha de la boda" htmlFor={`${uid}-date`} error={errors.date} hint="Puedes cambiarla después desde Ajustes.">
          <input id={`${uid}-date`} type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass(!!errors.date)} />
        </Field>
        <p className="m-0 text-xs leading-normal text-[#71717A]">
          No hay ningún enlace público que compartir con tus invitados: tú los agregas y anotas su confirmación desde el panel. Puedes crear hasta 3 bodas gratuitas por cuenta.
        </p>
        <div className="flex justify-end gap-3">
          <Btn ghost onClick={onClose} disabled={submitting}>
            Cancelar
          </Btn>
          <Btn type="submit" loading={submitting}>
            Crear mi lista de invitados
          </Btn>
        </div>
      </form>
    </Modal>
  );
}

// ---------- Ajustes de autoservicio (solo nombres y fecha) ----------

export function FreeWeddingSettingsModal({ weddingId, onClose, onSaved }: { weddingId: string; onClose: () => void; onSaved: () => void }) {
  const uid = useId();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [current, setCurrent] = useState<WeddingData | null>(null);
  const [bride, setBride] = useState('');
  const [groom, setGroom] = useState('');
  const [date, setDate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'weddings', weddingId));
        if (cancelled) return;
        if (!snap.exists()) {
          setLoadError(true);
          return;
        }
        const data = snap.data() as WeddingData;
        setCurrent(data);
        setBride(data.couple?.bride?.name || '');
        setGroom(data.couple?.groom?.name || '');
        setDate((data.event?.date || '').slice(0, 10));
      } catch {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [weddingId]);

  const save = async () => {
    if (!current) return;
    setError(null);
    const next: Record<string, string> = {};
    if (!bride.trim()) next.bride = 'Escribe el nombre.';
    if (!groom.trim()) next.groom = 'Escribe el nombre.';
    if (!isValidIsoDate(date)) next.date = 'Elige la fecha de la boda.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    try {
      const updated: WeddingData = {
        ...current,
        couple: {
          ...current.couple,
          bride: { ...current.couple.bride, name: bride.trim() },
          groom: { ...current.couple.groom, name: groom.trim() },
        },
        event: { ...current.event, date: `${date}T16:00:00.000Z` },
        updatedAt: new Date().toISOString(),
      };
      await saveWeddingDoc(doc(db, 'weddings', weddingId), updated);
      setCurrent(updated);
      onSaved();
      onClose();
    } catch {
      setError('No pudimos guardar los cambios. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Ajustes de tu boda" sub={<span className="font-mono">{weddingId}</span>} onClose={onClose} width={480}>
      {loading && <div className="text-[13px] text-[#71717A]">Cargando ajustes...</div>}
      {loadError && (
        <div role="alert" className="text-[13px] font-semibold text-[#B91C1C]">
          No pudimos cargar los ajustes. Cierra e inténtalo de nuevo.
        </div>
      )}
      {current && !loadError && (
        <div className="flex flex-col gap-[22px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Persona 1" htmlFor={`${uid}-bride`} error={errors.bride}>
              <input id={`${uid}-bride`} type="text" value={bride} onChange={(e) => setBride(e.target.value)} className={inputClass(!!errors.bride)} />
            </Field>
            <Field label="Persona 2" htmlFor={`${uid}-groom`} error={errors.groom}>
              <input id={`${uid}-groom`} type="text" value={groom} onChange={(e) => setGroom(e.target.value)} className={inputClass(!!errors.groom)} />
            </Field>
          </div>
          <Field label="Fecha de la boda" htmlFor={`${uid}-date`} error={errors.date}>
            <input id={`${uid}-date`} type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass(!!errors.date)} />
          </Field>
          <p className="m-0 text-xs leading-normal text-[#71717A]">
            Estos son los únicos datos editables en el plan gratuito. Para elegir plantilla y abrir el editor de diseño, escríbenos por WhatsApp.
          </p>
          {error && (
            <div role="alert" className="text-[13px] font-semibold text-[#B91C1C]">
              {error}
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Btn ghost onClick={onClose} disabled={saving}>
              Cancelar
            </Btn>
            <Btn onClick={save} loading={saving}>
              Guardar cambios
            </Btn>
          </div>
        </div>
      )}
    </Modal>
  );
}
