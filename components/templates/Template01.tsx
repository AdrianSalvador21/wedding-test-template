'use client';

import Hero from '../sections/Hero';
import Countdown from '../sections/Countdown';
import Location from '../sections/Location';
import About from '../sections/About';
import Gallery from '../sections/Gallery';
import Timeline from '../sections/Timeline';
import DressCode from '../sections/DressCode';
import GiftRegistry from '../sections/GiftRegistry';
import Accommodation from '../sections/Accommodation';
import AdultOnlyEvent from '../sections/AdultOnlyEvent';
import RecommendedPlaces from '../sections/RecommendedPlaces';
import RSVP from '../sections/RSVP';
import Footer from '../sections/Footer';

interface Template01Props {
  overlayVisible: boolean;
}

export default function Template01({ overlayVisible }: Template01Props) {
  return (
    <>
      <Hero overlayVisible={overlayVisible} />
      <Countdown />
      <Location />
      <About />
      <Gallery />
      <Timeline />
      <DressCode />
      <GiftRegistry />
      <Accommodation />
      <AdultOnlyEvent />
      <RecommendedPlaces />
      <RSVP />
      <Footer />
    </>
  );
}
