'use client';

import React from 'react';
import StructuredData from './StructuredData';
import Nav from './landing/Nav';
import Hero from './landing/Hero';
import PriceStrip from './landing/PriceStrip';
import DesignGallery from './landing/DesignGallery';
import HowItWorks from './landing/HowItWorks';
import Features from './landing/Features';
import EditorSection from './landing/EditorSection';
import MesasSection from './landing/MesasSection';
import AiSection from './landing/AiSection';
import Packages from './landing/Packages';
import ProcessSection from './landing/ProcessSection';
import FAQ from './landing/FAQ';
import PlannerCta from './landing/PlannerCta';
import FinalCta from './landing/FinalCta';
import Footer from './landing/Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      <StructuredData />
      <Nav />
      <main>
        <Hero />
        <PriceStrip />
        <DesignGallery />
        <HowItWorks />
        <Features />
        <EditorSection />
        <MesasSection />
        <AiSection />
        <Packages />
        <ProcessSection />
        <FAQ />
        <PlannerCta />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
