'use client';

import { useEffect } from 'react';
import Hero from '../components/sections/Hero';
import Countdown from '../components/sections/Countdown';
import About from '../components/sections/About';
import Gallery from '../components/sections/Gallery';
import Timeline from '../components/sections/Timeline';
import DressCode from '../components/sections/DressCode';
import RSVP from '../components/sections/RSVP';
import Location from '../components/sections/Location';
import GiftRegistry from '../components/sections/GiftRegistry';
import Footer from '../components/sections/Footer';
import { useAppDispatch, useAppSelector } from '../src/store/hooks';
import { selectWeddingInitialized, selectCurrentWedding } from '../src/store/slices/weddingSlice';
import { mockWeddingMariaCarlos } from '../src/data/mockData';
import { ThemeProvider } from '../lib/theme-context';
import { createWeddingTheme } from '../lib/theme-utils';

export default function HomePage() {
  const dispatch = useAppDispatch();
  const isInitialized = useAppSelector(selectWeddingInitialized);
  const currentWedding = useAppSelector(selectCurrentWedding);

  useEffect(() => {
    // Inicializar con datos de muestra si no hay datos cargados
    if (!isInitialized && !currentWedding) {
      // Simular carga de datos directamente al estado
      dispatch({ type: 'wedding/fetchWeddingData/fulfilled', payload: mockWeddingMariaCarlos });
    }
  }, [dispatch, isInitialized, currentWedding]);

  // Crear tema para la página raíz usando los datos mock
  const weddingTheme = createWeddingTheme(currentWedding || mockWeddingMariaCarlos);

  return (
    <ThemeProvider weddingTheme={weddingTheme}>
      <main>
        <Hero />
        <Countdown />
        <About />
        <Gallery />
        <Timeline />
        <DressCode />
        <Location />
        <GiftRegistry />
        <RSVP />
        <Footer />
      </main>
    </ThemeProvider>
  );
} 