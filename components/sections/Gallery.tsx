'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';
import { Camera, Heart } from 'lucide-react';

const Gallery = () => {
  const [isMobile, setIsMobile] = useState(false);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const photos = [
    {
      src: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      alt: "Quetzalia y Adrián en el parque",
      cols: 2,
      rows: 2
    },
    {
      src: "https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      alt: "Momento romántico",
      cols: 1,
      rows: 1
    },
    {
      src: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      alt: "Caminando juntos",
      cols: 1,
      rows: 1
    },
    {
      src: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      alt: "Atardecer romántico",
      cols: 1,
      rows: 2
    },
    {
      src: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      alt: "Riendo juntos",
      cols: 1,
      rows: 1
    },
    {
      src: "https://images.unsplash.com/photo-1511988617509-a57c8a288659?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      alt: "Momento íntimo",
      cols: 1,
      rows: 1
    }
  ];

  // Versión sin animaciones para móvil
  if (isMobile) {
    return (
      <section className="py-20 bg-gradient-to-br from-light via-white to-light">
        <div className="section-container">
          {/* Título */}
          <div className="text-center mb-16">
            <h2 className="section-title mb-4">Nuestra Galería</h2>
            <p className="section-subtitle">
              Momentos especiales que hemos compartido juntos a lo largo de nuestra relación
            </p>
            
            {/* Ornamento */}
            <div className="flex items-center justify-center mt-8 mb-12">
              <div className="w-16 h-px bg-accent" />
              <Camera className="mx-4 w-6 h-6 text-accent" />
              <div className="w-16 h-px bg-accent" />
            </div>
          </div>

          {/* Grid de fotos simplificado para móvil */}
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {photos.map((photo, index) => (
                <div
                  key={index}
                  className="relative overflow-hidden rounded-2xl shadow-lg h-64"
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    className="object-cover"
                    quality={60}
                    loading={index > 2 ? "lazy" : "eager"}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Mensaje especial */}
          <div className="text-center mt-16">
            <div className="bg-white rounded-2xl p-8 shadow-lg max-w-3xl mx-auto">
              <Heart className="w-12 h-12 mx-auto mb-6 text-accent" />
              <h3 className="text-2xl font-heading font-semibold text-primary mb-4">
                Cada Momento Cuenta
              </h3>
              <p className="text-text leading-relaxed mb-6">
                Estas son solo algunas de las memorias que hemos creado juntos. 
                Cada foto cuenta una historia, cada sonrisa refleja nuestro amor, 
                y cada momento nos ha llevado hasta este día especial.
              </p>
              <div className="flex items-center justify-center space-x-4">
                <div className="w-12 h-px bg-accent" />
                <Camera className="w-6 h-6 text-accent" />
                <div className="w-12 h-px bg-accent" />
              </div>
            </div>
          </div>

          {/* Call to action */}
          <div className="text-center mt-12">
            <div className="bg-gradient-primary rounded-2xl p-8 text-white max-w-2xl mx-auto">
              <h3 className="text-xl font-heading font-semibold mb-4">
                ¡Ayúdanos a Crear Más Recuerdos!
              </h3>
              <p className="opacity-90 mb-6">
                No olvides traer tu cámara y capturar los momentos especiales de nuestro día. 
                Usa el hashtag <span className="font-semibold">#QuetzaliaYAdrian2025</span> para que podamos ver todas las fotos.
              </p>
              <div className="flex items-center justify-center space-x-2">
                <Camera className="w-5 h-5" />
                <span className="font-semibold">#QuetzaliaYAdrian2025</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Versión con animaciones para desktop
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  return (
    <section ref={ref} className="py-20 bg-gradient-to-br from-light via-white to-light">
      <div className="section-container">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {/* Título */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="section-title mb-4">Nuestra Galería</h2>
            <p className="section-subtitle">
              Momentos especiales que hemos compartido juntos a lo largo de nuestra relación
            </p>
            
            {/* Ornamento */}
            <div className="flex items-center justify-center mt-8 mb-12">
              <div className="w-16 h-px bg-accent" />
              <Camera className="mx-4 w-6 h-6 text-accent" />
              <div className="w-16 h-px bg-accent" />
            </div>
          </motion.div>

          {/* Grid de fotos */}
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
              {photos.map((photo, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.01 }}
                  className={`relative overflow-hidden rounded-2xl shadow-lg md:hover:shadow-xl transition-shadow duration-300 group cursor-pointer
                    ${photo.cols === 2 ? 'col-span-2' : 'col-span-1'}
                    ${photo.rows === 2 ? 'row-span-2' : 'row-span-1'}
                  `}
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    quality={80}
                  />
                  
                  {/* Overlay con efecto hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Icono de corazón en hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Heart className="w-12 h-12 text-white" fill="currentColor" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mensaje especial */}
          <motion.div
            variants={itemVariants}
            className="text-center mt-16"
          >
            <div className="bg-white rounded-2xl p-8 shadow-elegant max-w-3xl mx-auto">
              <Heart className="w-12 h-12 mx-auto mb-6 text-accent" />
              <h3 className="text-2xl font-heading font-semibold text-primary mb-4">
                Cada Momento Cuenta
              </h3>
              <p className="text-text leading-relaxed mb-6">
                Estas son solo algunas de las memorias que hemos creado juntos. 
                Cada foto cuenta una historia, cada sonrisa refleja nuestro amor, 
                y cada momento nos ha llevado hasta este día especial.
              </p>
              <div className="flex items-center justify-center space-x-4">
                <div className="w-12 h-px bg-accent" />
                <Camera className="w-6 h-6 text-accent" />
                <div className="w-12 h-px bg-accent" />
              </div>
            </div>
          </motion.div>

          {/* Call to action */}
          <motion.div
            variants={itemVariants}
            className="text-center mt-12"
          >
            <div className="bg-gradient-primary rounded-2xl p-8 text-white max-w-2xl mx-auto">
              <h3 className="text-xl font-heading font-semibold mb-4">
                ¡Ayúdanos a Crear Más Recuerdos!
              </h3>
              <p className="opacity-90 mb-6">
                No olvides traer tu cámara y capturar los momentos especiales de nuestro día. 
                Usa el hashtag <span className="font-semibold">#QuetzaliaYAdrian2025</span> para que podamos ver todas las fotos.
              </p>
              <div className="flex items-center justify-center space-x-2">
                <Camera className="w-5 h-5" />
                <span className="font-semibold">#QuetzaliaYAdrian2025</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Gallery; 