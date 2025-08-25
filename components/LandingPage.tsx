'use client';

import React from 'react';
import { motion } from 'framer-motion';
import StructuredData from './StructuredData';
import { 
  Check, 
  X, 
  Globe, 
  Smartphone,
  Star,
} from 'lucide-react';
import Link from 'next/link';

const LandingPage = () => {
  // WhatsApp configuration
  const whatsappMessage = "Hola! Me interesa conocer más sobre las invitaciones digitales de Invyta. ¿Podrías brindarme información?";
  const whatsappLink = `https://wa.me/529602460590?text=${encodeURIComponent(whatsappMessage)}`;

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100" style={{ backgroundColor: '#faf8f5' }}>
      <StructuredData />
      {/* Header/Navigation */}
      <header className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-stone-200/50 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-3xl font-serif font-bold text-stone-800 tracking-tight">
            invyta
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#inicio" className="text-stone-600 hover:text-stone-800 transition-colors">Inicio</a>
            <a href="#funcionalidades" className="text-stone-600 hover:text-stone-800 transition-colors">Funcionalidades</a>
            <a href="#paquetes" className="text-stone-600 hover:text-stone-800 transition-colors">Paquetes</a>
            <a href="#ejemplos" className="text-stone-600 hover:text-stone-800 transition-colors">Ejemplos</a>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-stone-800 text-white px-6 py-2 rounded-full hover:bg-stone-700 transition-colors inline-block"
            >
              Comenzar ahora
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section id="inicio" className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div {...fadeInUp} className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-6xl font-serif font-bold text-stone-800 leading-tight">
                  Tu invitación digital
                  <br />
                  <span className="text-amber-600">de boda, fácil y elegante</span>
                </h1>
                
                <p className="text-xl text-stone-600 leading-relaxed max-w-lg">
                  Comparte con tus invitados una experiencia única y personalizada.
                </p>
                
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-amber-600 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-amber-700 hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg inline-block"
                >
                  Crea tu invitación ahora
                </a>
              </div>

              {/* Features Icons */}
              <motion.div 
                variants={staggerChildren}
                initial="initial"
                animate="animate"
                className="grid grid-cols-3 gap-8 pt-8"
              >
                <motion.div variants={fadeInUp} className="text-center">
                  <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Globe className="w-8 h-8 text-stone-600" />
                  </div>
                  <p className="text-sm font-medium text-stone-700">Página web personalizada</p>
                </motion.div>
                
                <motion.div variants={fadeInUp} className="text-center">
                  <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Check className="w-8 h-8 text-stone-600" />
                  </div>
                  <p className="text-sm font-medium text-stone-700">Confirmación de asistencia fácil (RSVP)</p>
                </motion.div>
                
                <motion.div variants={fadeInUp} className="text-center">
                  <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Star className="w-8 h-8 text-stone-600" />
                  </div>
                  <p className="text-sm font-medium text-stone-700">Diseño elegante y adaptable</p>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Right Content - Phone Mockup */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative mx-auto w-80 h-[640px]">
                {/* Phone Frame */}
                <div className="absolute inset-0 bg-gray-900 rounded-[3rem] p-2 shadow-2xl">
                  <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden">
                    {/* Phone Content with Hero Image */}
                    <img 
                      src="/assets/landing/hero.png" 
                      alt="Wedding Invitation Preview" 
                      className="w-full h-full object-cover rounded-[2.5rem]"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section - Minimalist like invitameok */}
      <section id="funcionalidades" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-serif font-bold text-stone-800 mb-6 leading-tight">
              Una experiencia completa para tu día especial
            </h2>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed">
              Cada detalle pensado para crear la invitación perfecta y gestionar tu evento sin complicaciones.
            </p>
          </motion.div>

          <motion.div 
            variants={staggerChildren}
            initial="initial"
            animate="animate"
            className="space-y-4 max-w-4xl mx-auto"
          >
            {[
              { 
                title: "Express", 
                desc: "Rápido y sencillo"
              },
              { 
                title: "Sustentable", 
                desc: "Cuida el medio ambiente"
              },
              { 
                title: "Económica", 
                desc: "Más por menos dinero"
              },
              { 
                title: "Invitaciones ilimitadas", 
                desc: "Sin límites ni costos extra"
              },
              { 
                title: "Links personalizados para tus invitados", 
                desc: "Haz personal el momento de compartir la invitación"
              },
              { 
                title: "Gestión inteligente", 
                desc: "Control total del evento"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className={`p-6 rounded-2xl transition-all duration-300 hover:shadow-lg ${
                  index % 2 === 0 
                    ? 'bg-amber-600 text-white hover:bg-amber-700' 
                    : 'bg-white border border-stone-200 text-stone-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-xl font-semibold mb-1 ${
                      index % 2 === 0 ? 'text-white' : 'text-stone-800'
                    }`}>
                      {feature.title}
                    </h3>
                    <p className={`${
                      index % 2 === 0 ? 'text-white/90' : 'text-stone-600'
                    }`}>
                      {feature.desc}
                    </p>
                  </div>
                  <div className={`w-2 h-12 rounded-full ${
                    index % 2 === 0 ? 'bg-white/30' : 'bg-amber-600'
                  }`}></div>
                </div>
              </motion.div>
            ))}
          </motion.div>


        </div>
      </section>

      {/* Admin Features Section */}
      <section className="py-20 bg-gradient-to-br from-stone-50 to-amber-50/30">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-stone-800 mb-4">
              Panel de administración intuitivo
            </h2>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">
              Controla cada aspecto de tu boda desde una interfaz moderna y fácil de usar
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Admin Boda */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="group"
            >
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 hover:shadow-lg transition-all duration-300">
                <div className="mb-6 rounded-xl overflow-hidden bg-gradient-to-br from-amber-50 to-stone-50">
                  <img 
                    src="/assets/landing/admin-boda.png" 
                    alt="Panel de administración de boda" 
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                    <h3 className="text-xl font-semibold text-stone-800">
                      Editor de Invitación
                    </h3>
                  </div>
                  <p className="text-stone-600 text-sm leading-relaxed">
                    Personaliza cada detalle: información de la pareja, lugares del evento, cronograma y configuraciones especiales.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Admin Invitados */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="group"
            >
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 hover:shadow-lg transition-all duration-300">
                <div className="mb-6 rounded-xl overflow-hidden bg-gradient-to-br from-amber-50 to-stone-50">
                  <img 
                    src="/assets/landing/admin-invitados.png" 
                    alt="Panel de gestión de invitados" 
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                    <h3 className="text-xl font-semibold text-stone-800">
                      Gestión de Invitados
                    </h3>
                  </div>
                  <p className="text-stone-600 text-sm leading-relaxed">
                    Administra tu lista de invitados y controla las confirmaciones de asistencia en tiempo real.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Features highlight */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <div className="w-6 h-6 bg-amber-600 rounded-lg"></div>
              </div>
              <p className="text-sm text-stone-600 font-medium">Diseño intuitivo</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <div className="w-6 h-6 bg-amber-600 rounded-lg"></div>
              </div>
              <p className="text-sm text-stone-600 font-medium">Tiempo real</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <div className="w-6 h-6 bg-amber-600 rounded-lg"></div>
              </div>
              <p className="text-sm text-stone-600 font-medium">Fácil de usar</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <div className="w-6 h-6 bg-amber-600 rounded-lg"></div>
              </div>
              <p className="text-sm text-stone-600 font-medium">Sin límites</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Packages Section */}
      <section id="paquetes" className="py-20 bg-gradient-to-br from-stone-50 to-amber-50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-serif font-bold text-stone-800 mb-4">
              Paquetes diseñados para ti
            </h2>
            <p className="text-xl text-stone-600">
              Elige el paquete que mejor se adapte a tus necesidades
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Paquete Básico */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-serif font-bold text-stone-800 mb-2">Paquete Básico</h3>
                <div className="text-4xl font-bold text-stone-800 mb-2">$2,000 <span className="text-lg font-normal text-stone-600">MXN</span></div>
                <p className="text-stone-600">Perfecto para bodas tradicionales</p>
              </div>

              <div className="space-y-4 mb-8">
                {[
                  "Página web tipo plantilla",
                  "Enlace único para compartir",
                  "Dominio/espacio web incluido hasta 15 días después del evento",
                  "Entrega en hasta 7 días hábiles",
                  "Bienvenida general",
                  "Cuenta regresiva personalizada",
                  "Detalles del evento",
                  "Nuestra historia",
                  "Galería de fotos",
                  "Cronograma del evento",
                  "Código de vestimenta",
                  "Mesa de regalos",
                  "Hospedaje recomendado",
                  "Sección de solo adultos",
                  "Formulario RSVP (Confirmación de asistencia)",
                  "Gestión de invitados confirmados"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-stone-700">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-8 pt-4 border-t border-stone-200">
                <p className="font-medium text-stone-800 mb-2">No incluye:</p>
                {[
                  "Personalización individual por invitado",
                  "URL individual por invitado",
                  "Mensaje de bienvenida personalizado",
                  "Idioma por invitado",
                  "Número de boletos por invitado",
                  "Canción de bienvenida"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <X className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <span className="text-stone-600 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-stone-800 text-white py-3 rounded-xl hover:bg-stone-700 transition-colors font-medium inline-block text-center"
              >
                Elegir Básico
              </a>
            </motion.div>

            {/* Paquete Personalizado */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 bg-white text-amber-600 px-3 py-1 rounded-badge text-sm font-medium">
                Recomendado
              </div>

              <div className="text-center mb-8">
                <h3 className="text-2xl font-serif font-bold mb-2 mt-2 mt-4">Paquete Personalizado</h3>
                <div className="text-4xl font-bold mb-2">$2,400 <span className="text-lg font-normal opacity-90">MXN</span></div>
                <p className="opacity-90">Experiencia completamente personalizada</p>
              </div>

              <div className="space-y-4 mb-8">
                <p className="font-medium mb-4">Incluye todo:</p>
                {[
                  "Página web completamente personalizada",
                  "Enlace único para compartir en redes",
                  "Dominio/hosting incluido (15 días post-evento)",
                  "Entrega rápida en 7 días hábiles",
                  "Bienvenida personalizada por invitado",
                  "Cuenta regresiva dinámica",
                  "Detalles completos del evento",
                  "Sección 'Nuestra historia'",
                  "Galería de fotos profesional",
                  "Cronograma detallado del evento",
                  "Código de vestimenta elegante",
                  "Mesa de regalos integrada",
                  "Recomendaciones de hospedaje",
                  "Sección evento solo adultos",
                  "Sistema RSVP inteligente",
                  "Panel de gestión de invitados",
                  "URL individual por invitado",
                  "Mensaje de bienvenida único por invitado",
                  "Control de boletos por invitado",
                  "Idioma personalizado (ES/EN)",
                  "Canción en la invitación",
                  "Soporte extendido (15 días pre-evento)"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Check className="w-4 h-4 text-white flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-white text-amber-600 py-3 rounded-xl hover:bg-amber-50 transition-colors font-medium inline-block text-center"
              >
                Elegir Personalizado
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Demo Section - Redesigned */}
      <section id="ejemplos" className="py-20 bg-gradient-to-br from-stone-50 via-amber-50 to-stone-100">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeInUp} className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-serif font-bold text-stone-800 mb-6 leading-tight">
              Experimenta la diferencia
            </h2>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed">
              Ve en acción nuestras invitaciones y descubre por qué las parejas eligen Invyta
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {/* Demo Links */}
            <motion.div {...fadeInUp} className="text-center">
              <h3 className="text-2xl font-serif font-bold text-stone-800 mb-8">
                Explora nuestros ejemplos en vivo
              </h3>
              
              <div className="grid md:grid-cols-1 gap-6 max-w-3xl mx-auto">
                <Link 
                  href="/es/wedding/maria-carlos-2025?guest=fernando-bautista-4035"
                  className="group block bg-amber-600 text-white p-6 rounded-2xl hover:bg-amber-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <div className="text-center">
                    <h4 className="text-xl font-semibold mb-2">Invitación completa</h4>
                    <p className="text-white/90 mb-4">María & Carlos • Español</p>
                  </div>
                </Link>

                {/*<Link 
                  href="/en/wedding/maria-carlos-2025?guest=fernando-bautista-4035"
                  className="group block bg-white border-2 border-stone-200 text-stone-800 p-6 rounded-2xl hover:border-stone-300 hover:shadow-lg transition-all duration-300"
                >
                  <div className="text-center">
                    <h4 className="text-xl font-semibold mb-2">Versión en inglés</h4>
                    <p className="text-stone-600 mb-4">María & Carlos • English</p>
                    <ArrowRight className="w-6 h-6 mx-auto group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link> */}
              </div>
            </motion.div>
          </div>

          {/* Features Highlight */}
          <motion.div {...fadeInUp} className="bg-white rounded-3xl p-8 shadow-lg border border-stone-200 mt-12">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="w-8 h-8 text-amber-600" />
                </div>
                <h4 className="font-semibold text-stone-800 mb-2">Optimizado para móvil</h4>
                <p className="text-stone-600 text-sm">Perfecto en cualquier dispositivo</p>
              </div>
              
              <div>
                <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-amber-600" />
                </div>
                <h4 className="font-semibold text-stone-800 mb-2">Multiidioma</h4>
                <p className="text-stone-600 text-sm">Español e inglés incluidos</p>
              </div>
              
              <div>
                <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-amber-600" />
                </div>
                <h4 className="font-semibold text-stone-800 mb-2">RSVP Inteligente</h4>
                <p className="text-stone-600 text-sm">Gestión automática de confirmaciones</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-amber-600 to-amber-700 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div {...fadeInUp} className="space-y-8">
            <h2 className="text-4xl lg:text-5xl font-serif font-bold">
              ¿Eres wedding planner? 
            </h2>
            
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Tenemos beneficios especiales para ti y para tus clientes.
            </p>
            
            <div className="space-y-4">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-amber-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-stone-50 hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg inline-block"
              >
                Comenzar ahora
              </a>
              
              <p className="text-amber-100 text-sm">
                Respuesta en menos de 24 horas
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="grid md:grid-cols-4 gap-8"
          >
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="space-y-4"
            >
              <div className="text-2xl font-serif font-bold">invyta</div>
              <p className="text-stone-400">
                Invitaciones digitales para tu día especial.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h4 className="font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-stone-400">
                <li><a href="#funcionalidades" className="hover:text-white transition-colors">Funcionalidades</a></li>
                <li><a href="#paquetes" className="hover:text-white transition-colors">Paquetes</a></li>
                <li><a href="#ejemplos" className="hover:text-white transition-colors">Ejemplos</a></li>
              </ul>
            </motion.div>
            
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <h4 className="font-semibold mb-4">Contacto</h4>
              <ul className="space-y-2 text-stone-400">
                <li>hola@invyta.me</li>
                <li>+52 960 246 0590</li>
              </ul>
            </motion.div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="border-t border-stone-800 mt-12 pt-8 text-center text-stone-400"
          >
            <p>&copy; 2025 Invyta. Todos los derechos reservados.</p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
