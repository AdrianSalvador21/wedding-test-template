'use client';

import React from 'react';
import {
  Clock,
  MapPin,
  Users,
  Calendar,
  Star,
  Circle,
  Sparkles,
  Gift,
  Heart,
  Music,
  Utensils,
  Wine,
  type LucideIcon,
} from 'lucide-react';
import { useTranslations } from '../../lib/translations';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { V2_COLORS, V2Container, V2Section, V2SectionHeading, V2SectionLayout, V2Stagger, V2StaggerItem, v2DisplayStyle } from './ui';
import { useV2SectionNumber, v2Localized } from './sections';

const iconMap: Record<string, LucideIcon> = {
  MapPin,
  Heart,
  Music,
  Utensils,
  Users,
  Wine,
  Clock,
  Star,
  Gift,
  Calendar,
  Circle,
  Sparkles,
};

const iconPool = [Clock, Users, Calendar, Star, Circle, MapPin, Sparkles, Gift];

const getIcon = (iconName: string | undefined, index: number) => {
  if (iconName && iconMap[iconName]) return iconMap[iconName];
  return iconPool[index % iconPool.length];
};

export default function TimelineV2() {
  const { t, currentLanguage } = useTranslations('template02');
  const weddingData = useAppSelector(selectCurrentWedding);
  const number = useV2SectionNumber('timeline');

  if (!weddingData?.timeline?.length) {
    return null;
  }

  const events = weddingData.timeline.map((event, index) => ({
    id: event.id || String(index),
    time: event.time,
    title: v2Localized(event.title, currentLanguage),
    description: v2Localized(event.description, currentLanguage),
    icon: getIcon(event.icon as string, index),
    highlight: !!event.isHighlight,
  }));

  return (
    <V2Section id="timeline">
      <V2Container className="py-[72px] pb-16 lg:py-24">
        <V2SectionLayout heading={<V2SectionHeading number={number} overline={t('timeline.overline')} title={t('timeline.title')} />}>
            <V2Stagger as="ol" className="m-0 list-none p-0" style={{ borderTop: `1px solid ${V2_COLORS.rule}` }}>
              {events.map((event) => {
                const Icon = event.icon;
                return (
                  <V2StaggerItem
                    as="li"
                    key={event.id}
                    className="grid grid-cols-[96px_minmax(0,1fr)_40px] items-start gap-x-3 py-[22px] lg:grid-cols-[132px_minmax(0,1fr)_40px] lg:gap-x-5 lg:py-7"
                    style={{ borderBottom: `1px solid ${V2_COLORS.rule}` }}
                  >
                    <span
                      className="text-[34px] lg:text-[44px]"
                      style={{
                        ...v2DisplayStyle(34, 300, -0.04),
                        fontSize: undefined,
                        lineHeight: 1,
                        color: event.highlight ? V2_COLORS.bronze : undefined,
                      }}
                    >
                      {event.time}
                    </span>
                    <div className="flex flex-col gap-1.5 pt-0.5">
                      <h3 className="m-0 text-[17px] font-semibold lg:text-lg">{event.title}</h3>
                      {event.description && (
                        <p className="m-0 text-sm leading-normal" style={{ color: V2_COLORS.graphite }}>
                          {event.description}
                        </p>
                      )}
                    </div>
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-full"
                      aria-hidden="true"
                      style={
                        event.highlight
                          ? { backgroundColor: V2_COLORS.bronze, color: V2_COLORS.paper }
                          : { border: `1px solid ${V2_COLORS.rule}`, color: V2_COLORS.graphite }
                      }
                    >
                      <Icon className="h-[18px] w-[18px]" strokeWidth={1.6} />
                    </span>
                  </V2StaggerItem>
                );
              })}
            </V2Stagger>
          </V2SectionLayout>
      </V2Container>
    </V2Section>
  );
}
