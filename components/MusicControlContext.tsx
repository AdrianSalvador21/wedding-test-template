'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

// Spec 25: expone el estado del reproductor global (MusicPlayer) para que un template pueda
// dibujar su propio botón de música sin crear un segundo <audio>. El audio, el autoplay y la
// canción siguen viviendo dentro de MusicPlayer.
export interface MusicControl {
  available: boolean;
  isPlaying: boolean;
  toggle: () => void;
}

const noop = () => {};
const EMPTY_CONTROL: MusicControl = { available: false, isPlaying: false, toggle: noop };

interface MusicControlContextValue {
  control: MusicControl;
  register: (control: MusicControl | null) => void;
}

const MusicControlContext = createContext<MusicControlContextValue>({
  control: EMPTY_CONTROL,
  register: noop,
});

export function MusicControlProvider({ children }: { children: React.ReactNode }) {
  const [control, setControl] = useState<MusicControl>(EMPTY_CONTROL);

  const register = useCallback((next: MusicControl | null) => {
    setControl((prev) => {
      const value = next ?? EMPTY_CONTROL;
      if (prev.available === value.available && prev.isPlaying === value.isPlaying && prev.toggle === value.toggle) {
        return prev;
      }
      return value;
    });
  }, []);

  const value = useMemo(() => ({ control, register }), [control, register]);

  return <MusicControlContext.Provider value={value}>{children}</MusicControlContext.Provider>;
}

export function useMusicControl(): MusicControl {
  return useContext(MusicControlContext).control;
}

export function useRegisterMusicControl(): (control: MusicControl | null) => void {
  return useContext(MusicControlContext).register;
}
