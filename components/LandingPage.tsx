'use client';

import React from 'react';
import StructuredData from './StructuredData';
import Nav from './landing/Nav';
import Hero from './landing/Hero';
import HowItWorks from './landing/HowItWorks';
import TrustStrip from './landing/TrustStrip';
import DesignGallery from './landing/DesignGallery';
import IndividualPersonalization from './landing/IndividualPersonalization';
import Features from './landing/Features';
import AdminProof from './landing/AdminProof';
import Packages from './landing/Packages';
import PlannerCta from './landing/PlannerCta';
import FAQ from './landing/FAQ';
import Footer from './landing/Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      <StructuredData />
      <Nav />
      <Hero />
      <HowItWorks />
      <TrustStrip />
      <DesignGallery />
      <IndividualPersonalization />
      <Features />
      <AdminProof />
      <Packages />
      <PlannerCta />
      <FAQ />
      <Footer />
    </div>
  );
};

export default LandingPage;
