'use client';

import HeroV2 from '../sections-v2/HeroV2';
import CountdownV2 from '../sections-v2/CountdownV2';
import LocationV2 from '../sections-v2/LocationV2';
import AboutV2 from '../sections-v2/AboutV2';
import GalleryV2 from '../sections-v2/GalleryV2';
import TimelineV2 from '../sections-v2/TimelineV2';
import DressCodeV2 from '../sections-v2/DressCodeV2';
import GiftRegistryV2 from '../sections-v2/GiftRegistryV2';
import AccommodationV2 from '../sections-v2/AccommodationV2';
import AdultOnlyEventV2 from '../sections-v2/AdultOnlyEventV2';
import RecommendedPlacesV2 from '../sections-v2/RecommendedPlacesV2';
import RSVPV2 from '../sections-v2/RSVPV2';
import FooterV2 from '../sections-v2/FooterV2';

interface Template02Props {
  overlayVisible: boolean;
}

export default function Template02({ overlayVisible }: Template02Props) {
  return (
    <div data-template-id="template-02">
      <HeroV2 overlayVisible={overlayVisible} />
      <CountdownV2 />
      <LocationV2 />
      <AboutV2 />
      <GalleryV2 />
      <TimelineV2 />
      <DressCodeV2 />
      <GiftRegistryV2 />
      <AccommodationV2 />
      <AdultOnlyEventV2 />
      <RecommendedPlacesV2 />
      <RSVPV2 />
      <FooterV2 />
    </div>
  );
}
