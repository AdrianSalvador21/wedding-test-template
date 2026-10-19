'use client';

import { useMemo } from 'react';
import { useTranslations } from '../../lib/translations';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { useWeddingImages } from '../../hooks/useWeddingImages';
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
import DesktopNavV2 from '../sections-v2/DesktopNavV2';
import StickyConfirmBarV2 from '../sections-v2/StickyConfirmBarV2';
import { V2_COLORS } from '../sections-v2/ui';
import { V2SectionNumbersContext, getVisibleSectionsV2 } from '../sections-v2/sections';

interface Template02Props {
  overlayVisible: boolean;
}

// Template02 "Moderno" (spec 25). Orden del diseño aprobado; las secciones numeradas toman su
// número de getVisibleSectionsV2 para que no queden huecos cuando una sección no tiene datos.
export default function Template02({ overlayVisible }: Template02Props) {
  const { currentLanguage } = useTranslations('template02');
  const weddingData = useAppSelector(selectCurrentWedding);
  const { galleryImages } = useWeddingImages(weddingData?.id);
  const galleryCount = galleryImages.filter(Boolean).length;

  const sections = useMemo(
    () => getVisibleSectionsV2(weddingData, galleryCount, currentLanguage),
    [weddingData, galleryCount, currentLanguage]
  );
  const numbers = useMemo(() => Object.fromEntries(sections.map((s) => [s.key, s.number])), [sections]);

  return (
    <div data-template-id="template-02" style={{ backgroundColor: V2_COLORS.stone }}>
      <V2SectionNumbersContext.Provider value={numbers}>
        <DesktopNavV2 sections={sections} />
        <HeroV2 overlayVisible={overlayVisible} />
        <CountdownV2 />
        <AboutV2 />
        <LocationV2 />
        <TimelineV2 />
        <DressCodeV2 />
        <GalleryV2 />
        <GiftRegistryV2 />
        <AccommodationV2 />
        <RecommendedPlacesV2 />
        <AdultOnlyEventV2 />
        <RSVPV2 />
        <FooterV2 />
        <StickyConfirmBarV2 />
      </V2SectionNumbersContext.Provider>
    </div>
  );
}
