'use client';

import { Music, Pause } from 'lucide-react';
import { useTranslations } from '../../lib/translations';
import { useMusicControl } from '../MusicControlContext';
import { V2_COLORS } from './ui';

// Botón de música de template-02 (spec 25). Dentro del hero va sobre la foto; al salir del hero
// (`pinned`) queda fijo arriba a la derecha con fondo sólido. El audio vive en MusicPlayer.
export default function MusicToggleV2({ pinned }: { pinned: boolean }) {
  const { t } = useTranslations('template02');
  const music = useMusicControl();

  if (!music.available) return null;

  const Icon = music.isPlaying ? Pause : Music;
  const label = music.isPlaying ? t('hero.pauseMusic') : t('hero.playMusic');

  return (
    <button
      type="button"
      onClick={music.toggle}
      aria-label={label}
      title={label}
      className={`z-40 flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
        pinned ? 'fixed right-4 top-4 shadow-[0_12px_30px_-14px_rgba(30,28,25,0.45)]' : 'absolute right-4 top-4'
      }`}
      style={
        pinned
          ? { backgroundColor: V2_COLORS.paper, border: `1px solid ${V2_COLORS.rule}`, color: V2_COLORS.ink }
          : { backgroundColor: 'rgba(30,28,25,0.25)', border: '1px solid rgba(255,255,255,0.7)', color: V2_COLORS.white }
      }
    >
      <Icon className="h-[18px] w-[18px]" aria-hidden="true" strokeWidth={1.6} />
    </button>
  );
}
