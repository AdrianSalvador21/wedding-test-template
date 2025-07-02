'use client';

import React from 'react';
import { MapPin, Car, Phone, Navigation, ExternalLink, Star } from 'lucide-react';
import { useTranslations } from '../../lib/translations';
import { openExternalLink } from '@/lib/utils';
import { useIsMobile } from '@/lib/motion';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';

const Location = () => {
  const { t, raw } = useTranslations('location');
  const { isMobile, isLoaded } = useIsMobile();
  const weddingData = useAppSelector(selectCurrentWedding);

  // Datos dinámicos con fallbacks
  const venue = weddingData?.event.venue;
  const venueName = venue?.name || t('subtitle');
  const venueAddress = venue?.address || t('address');
  const venueDescription = venue?.description || t('description');
  const venueFeatures = venue?.features || raw('facilities.features') as string[];
  
  const accommodationOptions = weddingData?.accommodation || raw('accommodation.hotels') as Array<{
    name: string;
    distance: string;
    price: string;
    phone?: string;
    website?: string;
    amenities?: string[];
  }>;

  const handleMapsClick = () => {
    if (venue?.coordinates) {
      openExternalLink(`https://maps.google.com/maps?q=${venue.coordinates.lat},${venue.coordinates.lng}`);
    } else {
      openExternalLink(`https://maps.google.com/maps?q=${encodeURIComponent(venueName + ' ' + venueAddress)}`);
    }
  };

  const handleWazeClick = () => {
    if (venue?.coordinates) {
      openExternalLink(`https://waze.com/ul?ll=${venue.coordinates.lat},${venue.coordinates.lng}&navigate=yes`);
    } else {
      openExternalLink(`https://waze.com/ul?q=${encodeURIComponent(venueName)}`);
    }
  };

  // Versión estática para móvil
  if (isMobile) {
    return (
      <section className="py-12 bg-white">
        <div className="section-container">
          {/* Título */}
          <div className="text-center mb-16">
            <h2 className="section-title text-stone-600 opacity-80 mb-4">{t('title')}</h2>
            <div className="w-16 h-0.5 bg-accent mx-auto mb-4"></div>
            <h3 className="text-2xl font-heading font-semibold text-accent mb-4">
              {venueName}
            </h3>
            <p className="section-subtitle max-w-3xl mx-auto">
              {venueDescription}
            </p>
            
            {/* Ornamento */}
            <div className="flex items-center justify-center mt-8 mb-12">
              <div className="w-16 h-px bg-accent" />
              <MapPin className="mx-4 w-6 h-6 text-accent" />
              <div className="w-16 h-px bg-accent" />
            </div>
          </div>

          <div className="max-w-lg mx-auto space-y-8">
            {/* Información principal */}
            <div className="bg-gradient-to-br from-light to-white rounded-2xl p-6 shadow-lg">
              <div className="text-center mb-6">
                <MapPin className="w-12 h-12 mx-auto mb-4 text-accent" />
                <h3 className="text-xl font-heading font-semibold text-primary mb-2">
                  {venueName}
                </h3>
                <p className="text-text">{venueAddress}</p>
              </div>

              {/* Mapa placeholder */}
              <div className="bg-gray-200 rounded-xl h-48 flex items-center justify-center mb-6">
                <div className="text-center">
                  <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-600 text-sm">{t('mapPlaceholder')}</p>
                </div>
              </div>

              {/* Botones de direcciones */}
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={handleMapsClick}
                  className="bg-gradient-primary text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <ExternalLink className="w-5 h-5" />
                  <span>{t('directions.googleMaps')}</span>
                </button>
                
                <button
                  onClick={handleWazeClick}
                  className="border-2 border-primary text-primary font-semibold py-3 px-6 rounded-xl hover:bg-primary hover:text-white transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <Navigation className="w-5 h-5" />
                  <span>{t('directions.waze')}</span>
                </button>
              </div>
            </div>

            {/* Facilidades */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-heading font-semibold text-primary mb-4 text-center">
                {t('facilities.title')}
              </h3>
              <ul className="space-y-3">
                {venueFeatures.map((facility: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0" />
                    <span className="text-text text-sm">{facility}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Hospedaje */}
            <div className="bg-gradient-to-br from-light to-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-heading font-semibold text-primary mb-2 text-center">
                {t('accommodation.title')}
              </h3>
              <p className="text-text text-sm mb-4 text-center opacity-80">
                {t('accommodation.subtitle')}
              </p>
              
              <div className="space-y-3">
                {accommodationOptions.map((hotel, index) => (
                  <div key={index} className="bg-white rounded-xl p-4 border border-border">
                    <h4 className="font-semibold text-dark text-sm">{hotel.name}</h4>
                    <p className="text-text text-xs opacity-80">{hotel.distance}</p>
                    <p className="text-accent text-sm font-medium">{hotel.price}</p>
                    {hotel.phone && (
                      <p className="text-text text-xs">{t('phone')}: {hotel.phone}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Transporte */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-heading font-semibold text-primary mb-4 text-center">
                {t('transport.title')}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Car className="w-5 h-5 text-accent mr-3" />
                  <span className="text-text text-sm">{t('transport.parking')}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-accent mr-3" />
                  <span className="text-text text-sm">{t('transport.uber')}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-accent mr-3" />
                  <span className="text-text text-sm">{t('transport.publicTransport')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Loading state
  if (!isLoaded) {
    return (
      <section id="location" className="py-12 bg-gradient-to-br from-light via-white to-light">
        <div className="section-container">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto" />
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto" />
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="h-64 bg-gray-200 rounded-2xl" />
                <div className="h-48 bg-gray-200 rounded-2xl" />
              </div>
              <div className="h-96 bg-gray-200 rounded-2xl" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Versión para desktop con animaciones CSS
  return (
    <section id="location" className="py-12 bg-gradient-to-br from-light via-white to-light">
      <div className="section-container">
        <div className="animate-fade-in-up">
          {/* Título */}
          <div className="text-center mb-16 animation-delay-200">
            <h2 className="section-title text-stone-600 opacity-80 mb-4">{t('title')}</h2>
            <div className="w-16 h-0.5 bg-accent mx-auto mb-4"></div>
            <p className="section-subtitle">
              {venueDescription}
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              
              {/* Información del lugar */}
              <div className="space-y-8 animation-delay-400">
                
                {/* Tarjeta principal del lugar */}
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="text-center mb-8">
                    <MapPin className="w-16 h-16 mx-auto mb-6 text-accent" />
                    <h3 className="text-3xl font-heading font-semibold text-primary mb-4">
                      {venueName}
                    </h3>
                    <p className="text-text text-lg mb-4">{venueAddress}</p>
                    <p className="text-text opacity-80 leading-relaxed">
                      {venueDescription}
                    </p>
                  </div>

                  {/* Botones de direcciones */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <button
                      onClick={handleMapsClick}
                      className="bg-gradient-primary text-white font-semibold py-4 px-6 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-3"
                    >
                      <ExternalLink className="w-5 h-5" />
                      <span>{t('directions.googleMaps')}</span>
                    </button>
                    
                    <button
                      onClick={handleWazeClick}
                      className="border-2 border-primary text-primary font-semibold py-4 px-6 rounded-xl hover:bg-primary hover:text-white transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-3"
                    >
                      <Navigation className="w-5 h-5" />
                      <span>{t('directions.waze')}</span>
                    </button>
                  </div>
                </div>

                {/* Facilidades del lugar */}
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <h3 className="text-2xl font-heading font-semibold text-primary mb-6 flex items-center">
                    <Star className="w-6 h-6 mr-3 text-accent" />
                    {t('facilities.title')}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {venueFeatures.map((facility: string, index: number) => (
                      <div key={index} className="flex items-start group">
                        <div className="w-3 h-3 bg-gradient-to-r from-accent to-primary rounded-full mt-1.5 mr-4 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
                        <span className="text-text">{facility}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Transporte */}
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <h3 className="text-2xl font-heading font-semibold text-primary mb-6 flex items-center">
                    <Car className="w-6 h-6 mr-3 text-accent" />
                    {t('transport.title')}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center p-4 bg-light rounded-xl">
                      <Car className="w-6 h-6 text-accent mr-4" />
                      <span className="text-text font-medium">{t('transport.parking')}</span>
                    </div>
                    <div className="flex items-center p-4 bg-light rounded-xl">
                      <Phone className="w-6 h-6 text-accent mr-4" />
                      <span className="text-text font-medium">{t('transport.uber')}</span>
                    </div>
                    <div className="flex items-center p-4 bg-light rounded-xl">
                      <MapPin className="w-6 h-6 text-accent mr-4" />
                      <span className="text-text font-medium">{t('transport.publicTransport')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hospedaje recomendado */}
              <div className="animation-delay-600">
                <div className="bg-gradient-to-br from-light to-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="text-center mb-8">
                    <MapPin className="w-16 h-16 mx-auto mb-6 text-accent" />
                    <h3 className="text-3xl font-heading font-semibold text-primary mb-4">
                      {t('accommodation.title')}
                    </h3>
                    <p className="text-text opacity-80">
                      {t('accommodation.subtitle')}
                    </p>
                  </div>
                  
                  <div className="space-y-6">
                    {accommodationOptions.map((hotel, index) => (
                      <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 border border-border">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-primary mb-2">{hotel.name}</h4>
                            <div className="space-y-1">
                              <p className="text-text text-sm flex items-center">
                                <MapPin className="w-4 h-4 mr-2 text-accent" />
                                {hotel.distance}
                              </p>
                              {hotel.phone && (
                                <p className="text-text text-sm flex items-center">
                                  <Phone className="w-4 h-4 mr-2 text-accent" />
                                  {hotel.phone}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-accent text-lg font-bold">{hotel.price}</p>
                          </div>
                        </div>
                        
                        {hotel.amenities && hotel.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-4">
                            {hotel.amenities.slice(0, 3).map((amenity, amenityIndex) => (
                              <span
                                key={amenityIndex}
                                className="bg-light text-text text-xs px-3 py-1 rounded-full"
                              >
                                {amenity}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {hotel.website && (
                          <button
                            onClick={() => openExternalLink(hotel.website!)}
                            className="mt-4 w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>{t('viewWebsite')}</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Location; 