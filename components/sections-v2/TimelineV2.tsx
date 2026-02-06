'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
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
import { useIsMobile } from '@/lib/motion';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { useThemePatterns } from '../../lib/theme-context';
import { V2Card, V2Container, V2Section, V2Stagger, V2StaggerItem, V2Title } from './ui';

export default function TimelineV2() {
  const { t } = useTranslations('timeline');
  const params = useParams();
  const currentLocale = params.locale as string;
  const { isLoaded } = useIsMobile();
  const weddingData = useAppSelector(selectCurrentWedding);
  const { getBackgroundStyle } = useThemePatterns();

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

  if (!weddingData?.timeline?.length) {
    return null;
  }

  const events = weddingData.timeline.map((event, index) => ({
    time: event.time,
    title:
      typeof event.title === 'object' && event.title
        ? (event.title[currentLocale as 'es' | 'en'] || event.title.es || '')
        : ((event.title as unknown as string) || ''),
    description:
      typeof event.description === 'object' && event.description
        ? (event.description[currentLocale as 'es' | 'en'] || event.description.es || '')
        : ((event.description as unknown as string) || ''),
    icon: getIcon(event.icon as string, index),
  }));

  if (!isLoaded) {
    return (
      <V2Section id="timeline">
        <V2Container className="py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-[#efe6dc] rounded w-64 mx-auto" />
            <div className="h-4 bg-[#f3ece4] rounded w-96 mx-auto" />
          </div>
        </V2Container>
      </V2Section>
    );
  }

  return (
    <V2Section
      id="timeline"
      className="relative overflow-hidden"
      style={getBackgroundStyle(3, '160px')}
    >
      <V2Container className="py-12">
        <V2Stagger>
          <V2StaggerItem>
            <V2Title title={t('title')} />
          </V2StaggerItem>

          <div className="mt-10 max-w-4xl mx-auto">
            {/* Desktop */}
            <div className="hidden md:block relative">
              <div className="absolute left-1/2 -translate-x-1/2 h-full w-px bg-[#d7c2a5]/70" />

              <div className="space-y-10">
                {events.map((event, index) => {
                  const IconComponent = event.icon;
                  const isLeft = index % 2 === 0;

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: isLeft ? -60 : 60 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: '-100px' }}
                      transition={{ duration: 0.7, ease: 'easeOut', delay: index * 0.08 }}
                      className={`relative flex items-center ${isLeft ? 'justify-start pr-8' : 'justify-end pl-8'}`}
                    >
                      <div className={`w-5/12 ${isLeft ? 'text-right pr-8' : 'text-left pl-8'}`}>
                        <V2Card className="p-6">
                          <div className={`flex items-center ${isLeft ? 'justify-end' : 'justify-start'} mb-4`}>
                            <div className="rounded-full border border-[#eadfd3] bg-white/70 px-4 py-2">
                              <span className="text-[11px] tracking-[0.28em] uppercase text-[#8a7c6b]">{event.time}</span>
                            </div>
                          </div>
                          <h3 className="font-serif text-lg text-[#3b342b]">{event.title}</h3>
                          {event.description && (
                            <p className="mt-3 text-sm text-[#6f6254] leading-relaxed">{event.description}</p>
                          )}
                        </V2Card>
                      </div>

                      <div className="absolute left-1/2 -translate-x-1/2 z-10">
                        <div className="w-12 h-12 bg-[#fbf7f1] rounded-full border border-[#d7c2a5] shadow-[0_10px_25px_rgba(26,20,12,0.10)] flex items-center justify-center">
                          <IconComponent className="w-5 h-5 text-[#b79a7a]" />
                        </div>
                      </div>

                      <div
                        className={`absolute top-1/2 -translate-y-1/2 h-px bg-[#d7c2a5]/70 ${
                          isLeft ? 'right-1/2 w-10 mr-6' : 'left-1/2 w-10 ml-6'
                        }`}
                      />
                    </motion.div>
                  );
                })}
              </div>

              <V2StaggerItem>
                <div className="flex justify-center mt-10">
                  <div className="w-3 h-3 rounded-full bg-[#b79a7a]" />
                </div>
              </V2StaggerItem>
            </div>

            {/* Mobile */}
            <div className="md:hidden relative">
              <div className="absolute left-6 top-0 h-full w-px bg-[#d7c2a5]/70" />

              <div className="space-y-6">
                {events.map((event, index) => {
                  const IconComponent = event.icon;

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 18 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-100px' }}
                      transition={{ duration: 0.6, ease: 'easeOut', delay: index * 0.06 }}
                      className="relative flex items-start pl-16"
                    >
                      <div className="absolute left-6 top-4 -translate-x-1/2 z-10">
                        <div className="w-10 h-10 bg-[#fbf7f1] rounded-full border border-[#d7c2a5] shadow-[0_10px_25px_rgba(26,20,12,0.10)] flex items-center justify-center">
                          <IconComponent className="w-4 h-4 text-[#b79a7a]" />
                        </div>
                      </div>

                      <div className="absolute left-6 top-9 w-6 h-px bg-[#d7c2a5]/70" />

                      <V2Card className="p-5 w-full">
                        <div className="flex justify-end">
                          <div className="rounded-full border border-[#eadfd3] bg-white/70 px-3 py-1.5">
                            <span className="text-[11px] tracking-[0.28em] uppercase text-[#8a7c6b]">{event.time}</span>
                          </div>
                        </div>
                        <h3 className="mt-3 font-serif text-base text-[#3b342b]">{event.title}</h3>
                        {event.description && (
                          <p className="mt-2 text-sm text-[#6f6254] leading-relaxed">{event.description}</p>
                        )}
                      </V2Card>
                    </motion.div>
                  );
                })}
              </div>

              <V2StaggerItem>
                <div className="flex justify-start mt-6 pl-6">
                  <div className="w-3 h-3 rounded-full bg-[#b79a7a] -translate-x-1/2" />
                </div>
              </V2StaggerItem>
            </div>
          </div>
        </V2Stagger>
      </V2Container>
    </V2Section>
  );
}
