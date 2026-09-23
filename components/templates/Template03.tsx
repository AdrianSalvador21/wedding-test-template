'use client';

import HeroV3 from '../sections-v3/HeroV3';
import CountdownV3 from '../sections-v3/CountdownV3';
import LocationV3 from '../sections-v3/LocationV3';
import AboutV3 from '../sections-v3/AboutV3';
import GalleryV3 from '../sections-v3/GalleryV3';
import TimelineV3 from '../sections-v3/TimelineV3';
import DressCodeV3 from '../sections-v3/DressCodeV3';
import GiftRegistryV3 from '../sections-v3/GiftRegistryV3';
import AccommodationV3 from '../sections-v3/AccommodationV3';
import AdultOnlyEventV3 from '../sections-v3/AdultOnlyEventV3';
import RecommendedPlacesV3 from '../sections-v3/RecommendedPlacesV3';
import RSVPV3 from '../sections-v3/RSVPV3';
import FooterV3 from '../sections-v3/FooterV3';

interface Template03Props {
  overlayVisible: boolean;
}

export default function Template03({ overlayVisible }: Template03Props) {
  return (
    <div data-template-id="template-03">
      <HeroV3 overlayVisible={overlayVisible} />
      <CountdownV3 />
      <LocationV3 />
      <AboutV3 />
      <GalleryV3 />
      <TimelineV3 />
      <DressCodeV3 />
      <GiftRegistryV3 />
      <AccommodationV3 />
      <AdultOnlyEventV3 />
      <RecommendedPlacesV3 />
      <RSVPV3 />
      <FooterV3 />
    </div>
  );
}
