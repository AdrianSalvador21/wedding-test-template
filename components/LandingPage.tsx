'use client';

import React from 'react';
import StructuredData from './StructuredData';
import Nav from './landing/Nav';
import Hero from './landing/Hero';
import PriceStrip from './landing/PriceStrip';
import TrustSection from './landing/TrustSection';
import DesignGallery from './landing/DesignGallery';
import GuestJourney from './landing/GuestJourney';
import PersonalizadoSection from './landing/PersonalizadoSection';
import Packages from './landing/Packages';
import MesasSection from './landing/MesasSection';
import FAQ from './landing/FAQ';
import FinalCta from './landing/FinalCta';
import PlannerCta from './landing/PlannerCta';
import Footer from './landing/Footer';
import StickyCtaBar, { STICKY_BAR_SPACE } from './landing/StickyCtaBar';

// Orden de la landing v4 (spec 26): como se toma la decisión. ¿Se ve bonito?, ¿puedo confiar?,
// ¿funciona para mis invitados?, ¿cuánto cuesta? Mesas gratis queda como red para quien no compra.
const LandingPage = () => {
  return (
    <div className="min-h-screen">
      <StructuredData />
      <Nav />
      <main>
        <Hero />
        <PriceStrip />
        <TrustSection />
        <DesignGallery />
        <GuestJourney />
        <PersonalizadoSection />
        <Packages />
        <MesasSection />
        <FAQ />
        <FinalCta />
        <PlannerCta />
      </main>
      <Footer />
      {/* Espacio para que la barra móvil no tape el final del pie. */}
      <div aria-hidden="true" className={`md:hidden bg-[#211D19] ${STICKY_BAR_SPACE}`} />
      <StickyCtaBar />
    </div>
  );
};

export default LandingPage;
