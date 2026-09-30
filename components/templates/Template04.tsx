'use client';

import HeroV4 from '../sections-v4/HeroV4';
import AboutV4 from '../sections-v4/AboutV4';
import CountdownV4 from '../sections-v4/CountdownV4';
import GalleryV4 from '../sections-v4/GalleryV4';
import LocationV4 from '../sections-v4/LocationV4';
import TimelineV4 from '../sections-v4/TimelineV4';
import DressCodeV4 from '../sections-v4/DressCodeV4';
import GiftRegistryV4 from '../sections-v4/GiftRegistryV4';
import AccommodationV4 from '../sections-v4/AccommodationV4';
import AdultOnlyEventV4 from '../sections-v4/AdultOnlyEventV4';
import RecommendedPlacesV4 from '../sections-v4/RecommendedPlacesV4';
import RSVPV4 from '../sections-v4/RSVPV4';
import FooterV4 from '../sections-v4/FooterV4';

interface Template04Props {
  overlayVisible: boolean;
}

export default function Template04({ overlayVisible }: Template04Props) {
  return (
    <div data-template-id="template-04">
      <HeroV4 overlayVisible={overlayVisible} />
      <AboutV4 />
      <CountdownV4 />
      <GalleryV4 />
      <LocationV4 />
      <TimelineV4 />
      <DressCodeV4 />
      <GiftRegistryV4 />
      <AccommodationV4 />
      <AdultOnlyEventV4 />
      <RecommendedPlacesV4 />
      <RSVPV4 />
      <FooterV4 />
    </div>
  );
}
