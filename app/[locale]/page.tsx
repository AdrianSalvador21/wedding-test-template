import Hero from '@/components/sections/Hero';
import Countdown from '@/components/sections/Countdown';
import About from '@/components/sections/About';
import Gallery from '@/components/sections/Gallery';
import Timeline from '@/components/sections/Timeline';
import DressCode from '@/components/sections/DressCode';
import RSVP from '@/components/sections/RSVP';
import Location from '@/components/sections/Location';
import Footer from '@/components/sections/Footer';

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Countdown />
      <About />
      <Gallery />
      <Timeline />
      <DressCode />
      <RSVP />
      <Location />
      <Footer />
    </main>
  );
} 