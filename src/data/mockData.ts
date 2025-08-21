import { WeddingData } from '../types/wedding';

// Datos de prueba para María & Carlos

// Mock data para María & Carlos (ID: maria-carlos-2025)
export const mockWeddingMariaCarlos: WeddingData = {
  id: 'maria-carlos-2025',
  couple: {
    bride: {
      name: 'Maria',
      fullName: 'María Elena González',
      phone: '+52 55 1234-5678',
      email: 'maria@email.com',
      instagram: '@maria_gonzalez',
      facebook: 'maria.gonzalez'
    },
    groom: {
      name: 'Juan',
      fullName: 'Carlos Antonio Rodríguez',
      phone: '+52 55 8765-4321',
      email: 'carlos@email.com',
      instagram: '@carlos_rodriguez',
      facebook: 'carlos.rodriguez'
    },
    coupleEmail: 'maria.carlos@email.com',
    hashtag: '#MaríaYCarlos2025',
    story: 'Hace más de 6 años, el destino nos unió en una cafetería de la ciudad. Lo que comenzó como una conversación casual se convirtió en risas compartidas, sueños entrelazados y un amor que creció día a día. Hoy, queremos celebrar este momento único rodeados de las personas que más queremos.',
    quote: 'El amor no es solo mirarse el uno al otro, sino mirar juntos en la misma dirección.'
  },
  event: {
    weddingId: 'maria-carlos-2025',
    date: '2025-11-21T16:00:00.000Z',
    time: '16:00',
    ceremony: {
      time: '16:00',
      duration: 45
    },
    reception: {
      time: '19:30',
      duration: 360
    },
    ceremonyVenue: {
      name: 'Iglesia del Sagrado Corazón',
      address: 'Calle de los Santos 456, Ciudad, Estado 12345',
      coordinates: {
        lat: 19.4290,
        lng: -99.1285
      },
      description: 'Hermosa iglesia con arquitectura colonial donde celebraremos nuestra ceremonia religiosa'
    },
    receptionVenue: {
      name: 'Jardines del Edén',
      address: 'Av. Principal 123, Ciudad, Estado 12345',
      coordinates: {
        lat: 19.4326,
        lng: -99.1332
      },
      description: 'Un hermoso lugar rodeado de naturaleza, perfecto para celebrar nuestro amor. Con amplios jardines, salones elegantes y vistas espectaculares.',
      features: [
        'Jardines exteriores para cóctel',
        'Salón principal climatizado',
        'Estacionamiento amplio y seguro',
        'Área de fotos panorámicas',
        'Coctelera al aire libre',
        'Música y sonido profesional'
      ]
    },
    dressCode: {
      style: 'Formal / Cocktail',
      description: 'Queremos que te sientas elegante y cómodo en nuestra celebración',
      recommendations: {
        ladies: [
          'Vestidos midi o largos elegantes',
          'Conjuntos de falda y blusa sofisticados',
          'Pantalones de vestir con blusa elegante',
          'Vestidos cóctel o de fiesta'
        ],
        gentlemen: [
          'Traje completo (saco y pantalón)',
          'Pantalón de vestir con camisa y saco',
          'Camisa de vestir (corbata opcional)',
          'Zapatos de vestir formales'
        ]
      },
      colors: {
        recommended: ['#8b7355', '#a67c5a', '#d4af8c', '#2c3e50', '#8e44ad', '#27ae60'],
        avoid: ['#ffffff', '#f8f8ff', '#ff0000', '#00ff00']
      }
    },
    rsvpDeadline: '2025-10-15T23:59:59.000Z'
  },
  timeline: [
    {
      id: 'arrival',
      time: '15:30',
      title: 'Llegada de Invitados',
      description: 'Recepción y bienvenida en los jardines',
      icon: 'MapPin'
    },
    {
      id: 'ceremony',
      time: '16:00',
      title: 'Ceremonia Civil',
      description: '¡El momento más esperado! Intercambio de votos',
      icon: 'Heart',
      isHighlight: true
    },
    {
      id: 'photos',
      time: '16:45',
      title: 'Sesión de Fotos',
      description: 'Fotos con familiares y amigos cercanos',
      icon: 'Camera'
    },
    {
      id: 'cocktail',
      time: '18:00',
      title: 'Cóctel de Celebración',
      description: 'Aperitivos y bebidas mientras preparamos la recepción',
      icon: 'Utensils'
    },
    {
      id: 'reception',
      time: '19:30',
      title: 'Cena y Brindis',
      description: 'Cena especial con nuestros seres queridos',
      icon: 'Utensils'
    },
    {
      id: 'party',
      time: '21:00',
      title: '¡A Bailar!',
      description: 'Música, baile y diversión hasta altas horas',
      icon: 'Music'
    }
  ],
  gallery: [
    {
      id: 'photo1',
      url: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?ixlib=rb-4.0.3',
      alt: 'María y Carlos en la playa',
      cols: 2,
      rows: 2
    },
    {
      id: 'photo2',
      url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?ixlib=rb-4.0.3',
      alt: 'Momento romántico',
      cols: 1,
      rows: 1
    },
    {
      id: 'photo3',
      url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?ixlib=rb-4.0.3',
      alt: 'Caminando juntos',
      cols: 1,
      rows: 1
    },
    {
      id: 'photo4',
      url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?ixlib=rb-4.0.3',
      alt: 'Atardecer romántico',
      cols: 1,
      rows: 2
    },
    {
      id: 'photo5',
      url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?ixlib=rb-4.0.3',
      alt: 'Sonrisas de amor',
      cols: 1,
      rows: 1
    },
    {
      id: 'photo6',
      url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?ixlib=rb-4.0.3',
      alt: 'Momentos especiales',
      cols: 1,
      rows: 1
    }
  ],
  heroImage: {
    url: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    alt: 'María y Carlos - Imagen principal de boda'
  },
  specialMoments: [
    {
      year: '2018',
      title: 'Primer Encuentro',
      description: 'Nos conocimos en una cafetería del centro'
    },
    {
      year: '2021',
      title: 'Nuestra Primera Casa',
      description: 'Comenzamos a vivir juntos'
    },
    {
      year: '2024',
      title: 'La Propuesta',
      description: 'Carlos le pidió matrimonio a María en la playa'
    }
  ],
  relationshipStats: {
    yearsTogther: 6,
    adventures: 47,
    memories: 1250,
    dreams: 8
  },
  accommodation: [
    {
      name: 'Hotel Boutique Central',
      distance: '5 min del lugar',
      price: 'Desde $120/noche',
      phone: '+52 55 1111-2222',
      website: 'www.hotelboutiquecentral.com',
      amenities: ['WiFi gratuito', 'Desayuno incluido', 'Estacionamiento']
    },
    {
      name: 'Gran Hotel Plaza',
      distance: '10 min del lugar',
      price: 'Desde $80/noche',
      phone: '+52 55 3333-4444',
      website: 'www.granhotelplaza.com',
      amenities: ['WiFi gratuito', 'Gimnasio', 'Piscina']
    }
  ],
  transport: {
    parking: true,
    valetParking: true,
    shuttleService: {
      available: true,
      pickupPoints: ['Hotel Boutique Central', 'Gran Hotel Plaza'],
      schedule: ['15:00', '15:15', '15:30']
    },
    publicTransport: 'Estación de metro a 2 cuadras',
    rideshare: true
  },
  giftRegistry: {
    enabled: true,
    message: 'Tu presencia es nuestro regalo más valioso, pero si deseas hacernos un obsequio, hemos preparado algunas opciones:',
    registries: [
      {
        id: 'liverpool',
        name: 'Liverpool',
        url: 'https://mesaderegalos.liverpool.com.mx/milistaderegalos/123456789',
        description: 'Mesa de regalos en Liverpool con todo lo que necesitamos para nuestro hogar'
      },
      {
        id: 'amazon',
        name: 'Amazon',
        url: 'https://www.amazon.com.mx/hz/wishlist/ls/2ABCDEFGHIJKL',
        description: 'Lista de deseos en Amazon con productos prácticos para nuestra nueva vida juntos'
      },
      {
        id: 'palacio',
        name: 'El Palacio de Hierro',
        url: 'https://www.elpalaciodehierro.com/mesa-de-regalos/maria-carlos-2025',
        description: 'Mesa de regalos con artículos elegantes y de calidad'
      }
    ],
    bankAccount: {
      bankName: 'Banco BBVA',
      accountName: 'María Elena González',
      accountNumber: '1234567890',
      clabe: '012345678901234567',
      description: 'También puedes contribuir directamente a nuestra cuenta bancaria'
    }
  },
  adultOnlyEvent: {
    enabled: true,
    message: 'Aunque adoramos a los pequeños de la familia, hemos decidido que nuestra celebración sea solo para adultos. Esperamos que puedan acompañarnos en esta noche especial.'
  },
  theme: {
    id: 'classic'
  },
  languages: ['es', 'en'],
  defaultLanguage: 'es',
  isActive: true,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z'
};

// Mock data para Ana & Luis (ID: ana-luis-2025) - Diferente estilo
export const mockWeddingAnaLuis: WeddingData = {
  id: 'ana-luis-2025',
  couple: {
    bride: {
      name: 'Ana',
      fullName: 'Ana Sofía Martínez',
      phone: '+52 55 9876-5432',
      email: 'ana@email.com',
      instagram: '@ana_martinez',
      facebook: 'ana.martinez'
    },
    groom: {
      name: 'Luis',
      fullName: 'Luis Fernando López',
      phone: '+52 55 2468-1357',
      email: 'luis@email.com',
      instagram: '@luis_lopez',
      facebook: 'luis.lopez'
    },
    coupleEmail: 'ana.luis@email.com',
    hashtag: '#AnaYLuis2025',
    story: 'Nuestros caminos se cruzaron en la universidad hace 8 años. Entre estudios, café y largas conversaciones descubrimos que éramos almas gemelas. Hoy escribimos un nuevo capítulo de nuestra historia de amor.',
    quote: 'El amor verdadero no tiene final, porque el verdadero amor nunca termina.'
  },
  event: {
    weddingId: 'ana-luis-2025',
    date: '2025-09-15T17:00:00.000Z',
    time: '17:00',
    ceremony: {
      time: '17:00',
      duration: 50
    },
    reception: {
      time: '20:00',
      duration: 300
    },
    ceremonyVenue: {
      name: 'Capilla San Francisco',
      address: 'Plaza Principal s/n, Pueblo Mágico, Estado 54321',
      coordinates: {
        lat: 20.5920,
        lng: -100.3850
      },
      description: 'Hermosa capilla colonial del siglo XVIII con arquitectura tradicional mexicana'
    },
    receptionVenue: {
      name: 'Hacienda San Miguel',
      address: 'Carretera Nacional Km 25, Pueblo Mágico, Estado 54321',
      coordinates: {
        lat: 20.5937,
        lng: -100.3898
      },
      description: 'Una hermosa hacienda colonial con arquitectura tradicional mexicana, rodeada de viñedos y jardines botánicos.',
      features: [
        'Salón de baile con vigas de madera',
        'Jardines con fuente central',
        'Viñedos como backdrop',
        'Terraza panorámica',
        'Cava de vinos',
        'Área de cóctel al aire libre'
      ]
    },
    dressCode: {
      style: 'Garden Party / Semi-Formal',
      description: 'Un estilo elegante pero relajado, perfecto para una celebración al aire libre',
      recommendations: {
        ladies: [
          'Vestidos florales o de colores pasteles',
          'Faldas midi con blusas elegantes',
          'Jumpsuit elegante',
          'Zapatos cómodos (evitar tacones muy altos)'
        ],
        gentlemen: [
          'Guayabera o camisa elegante',
          'Pantalón de lino o algodón',
          'Saco sport opcional',
          'Zapatos cómodos de cuero'
        ]
      },
      colors: {
        recommended: ['#f4e4bc', '#dda15e', '#bc6c25', '#8b5a2b', '#6f4e37', '#3e8e41'],
        avoid: ['#ffffff', '#000000', '#ff0066']
      }
    },
    rsvpDeadline: '2025-08-15T23:59:59.000Z'
  },
  timeline: [
    {
      id: 'welcome',
      time: '16:30',
      title: 'Bienvenida',
      description: 'Recibimiento con agua de sabores y canapés',
      icon: 'Users'
    },
    {
      id: 'ceremony',
      time: '17:00',
      title: 'Ceremonia Religiosa',
      description: 'Ceremonia en la capilla colonial',
      icon: 'Heart',
      isHighlight: true
    },
    {
      id: 'toast',
      time: '17:50',
      title: 'Brindis de Bienvenida',
      description: 'Celebración con vino de la región',
      icon: 'Wine'
    },
    {
      id: 'photos',
      time: '18:30',
      title: 'Golden Hour',
      description: 'Sesión de fotos en los viñedos',
      icon: 'Camera'
    },
    {
      id: 'dinner',
      time: '20:00',
      title: 'Cena de Gala',
      description: 'Menú mexicano contemporáneo',
      icon: 'Utensils'
    },
    {
      id: 'party',
      time: '22:00',
      title: 'Fiesta',
      description: 'Música en vivo y baile hasta el amanecer',
      icon: 'Music'
    }
  ],
  gallery: [
    {
      id: 'engagement1',
      url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3',
      alt: 'Ana y Luis en el campo',
      cols: 2,
      rows: 1
    },
    {
      id: 'engagement2',
      url: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?ixlib=rb-4.0.3',
      alt: 'Momento íntimo',
      cols: 1,
      rows: 2
    },
    {
      id: 'engagement3',
      url: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?ixlib=rb-4.0.3',
      alt: 'Sonrisas genuinas',
      cols: 1,
      rows: 1
    },
    {
      id: 'engagement4',
      url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?ixlib=rb-4.0.3',
      alt: 'Atardecer dorado',
      cols: 1,
      rows: 1
    }
  ],
  heroImage: {
    url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    alt: 'Ana y Luis - Imagen principal de boda'
  },
  specialMoments: [
    {
      year: '2017',
      title: 'Universidad',
      description: 'Nos conocimos en la biblioteca de la facultad'
    },
    {
      year: '2020',
      title: 'Graduación',
      description: 'Celebramos juntos nuestro título profesional'
    },
    {
      year: '2023',
      title: 'La Propuesta',
      description: 'Luis propuso matrimonio en Tequila, Jalisco'
    }
  ],
  relationshipStats: {
    yearsTogther: 8,
    adventures: 62,
    memories: 2341,
    dreams: 12
  },
  accommodation: [
    {
      name: 'Posada Colonial San Miguel',
      distance: '2 min del lugar',
      price: 'Desde $150/noche',
      phone: '+52 33 5555-7777',
      amenities: ['Arquitectura colonial', 'Spa', 'Restaurant gourmet']
    }
  ],
  transport: {
    parking: true,
    valetParking: false,
    shuttleService: {
      available: true,
      pickupPoints: ['Centro del pueblo', 'Posada Colonial'],
      schedule: ['16:00', '16:30']
    },
    publicTransport: 'Autobús desde la ciudad cada hora',
    rideshare: false
  },
  giftRegistry: {
    enabled: true,
    message: 'Tu presencia es nuestro regalo más preciado, pero si deseas contribuir a nuestro futuro juntos:',
    registries: [
      {
        id: 'coppel',
        name: 'Coppel',
        url: 'https://www.coppel.com/mesa-de-regalos/ana-luis-2025',
        description: 'Mesa de regalos en Coppel con productos para el hogar'
      },
      {
        id: 'elektra',
        name: 'Elektra',
        url: 'https://www.elektra.com.mx/mesa-de-regalos/654321',
        description: 'Lista de electrodomésticos y productos tecnológicos'
      },
      {
        id: 'sears',
        name: 'Sears',
        url: 'https://www.sears.com.mx/mesa-de-regalos/ana-luis-2025',
        description: 'Mesa de regalos con artículos de hogar y decoración'
      }
    ],
    bankAccount: {
      bankName: 'Banco Santander',
      accountName: 'Ana Sofía Martínez',
      accountNumber: '0987654321',
      clabe: '987654321012345678',
      description: 'También puedes hacer tu aportación directamente a nuestra cuenta'
    }
  },
  adultOnlyEvent: {
    enabled: false
  },
  theme: {
    id: 'modern'
  },
  languages: ['es', 'en'],
  defaultLanguage: 'es',
  isActive: true,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z'
};

// Mock wedding con tema Luxury Navy
export const mockWeddingLuxury: WeddingData = {
  id: 'isabella-alexander-2025',
  couple: {
    bride: {
      name: 'Isabella',
      fullName: 'Isabella Victoria Rossi',
      phone: '+52 646 100-2000',
      email: 'isabella@example.com'
    },
    groom: {
      name: 'Alexander',
      fullName: 'Alexander James Montgomery',
      phone: '+52 646 100-2001',
      email: 'alexander@example.com'
    },
    coupleEmail: 'isabella.alexander@example.com',
    hashtag: '#IsabellaAndAlexander2025',
    story: 'Isabella y Alexander se conocieron en París durante un intercambio académico en la Sorbona. Cinco años después, con carreras consolidadas en diferentes continentes, decidieron que el amor no conoce fronteras. Su historia es de elegancia, sofisticación y una conexión que trasciende océanos.',
    quote: 'El amor no conoce fronteras'
  },
  event: {
    weddingId: 'isabella-alexander-2025',
    date: '2025-09-20T18:00:00.000Z',
    time: '18:00',
    ceremony: {
      time: '18:00',
      duration: 45
    },
    reception: {
      time: '20:00',
      duration: 300
    },
    ceremonyVenue: {
      name: 'Château de la Vigne - Capilla',
      address: 'Carretera Valle de Guadalupe Km 95, Ensenada, Baja California 22750',
      coordinates: {
        lat: 32.1456,
        lng: -116.8765
      },
      description: 'Capilla gótica del Château con arquitectura francesa y elegancia contemporánea.'
    },
    receptionVenue: {
      name: 'Château de la Vigne',
      address: 'Carretera Valle de Guadalupe Km 95, Ensenada, Baja California 22750',
      coordinates: {
        lat: 32.1456,
        lng: -116.8765
      },
      description: 'Un château privado con viñedos y vista al valle, arquitectura francesa y elegancia contemporánea.',
      features: ['Viñedos privados', 'Capilla gótica', 'Jardines franceses', 'Terraza panorámica', 'Bodega de vinos']
    },
    dressCode: {
      style: 'Formal Elegance',
      description: 'Elegancia formal con toques de sofisticación europea. Paleta de azul marino, dorado y tonos neutros.',
      recommendations: {
        ladies: [
          'Vestidos largos en tonos azul marino, dorado suave o champagne',
          'Cocktail dress elegante con accesorios dorados',
          'Evitar blanco, marfil y colores muy llamativos',
          'Zapatos elegantes, preferiblemente con suela blanda para los jardines'
        ],
        gentlemen: [
          'Smoking o traje formal en azul marino o negro',
          'Corbata o corbatín en tonos dorados o azul',
          'Camisa blanca de vestir',
          'Zapatos de vestir en cuero negro o marrón'
        ]
      },
      colors: {
        recommended: ['#1e3a8a', '#3b82f6', '#f59e0b', '#fbbf24', '#f8fafc', '#334155'],
        avoid: ['#ffffff', '#f8f8ff', '#ff69b4', '#00ff00']
      }
    },
    rsvpDeadline: '2025-08-15T23:59:59.000Z'
  },
  timeline: [
    {
      id: 'arrival',
      time: '17:30',
      title: 'Llegada y Recepción',
      description: 'Recibimiento con champagne y vista a los viñedos',
      icon: 'Users'
    },
    {
      id: 'ceremony',
      time: '18:00',
      title: 'Ceremonia Civil',
      description: 'Unión en la capilla gótica del Château',
      icon: 'Heart',
      isHighlight: true
    },
    {
      id: 'cocktail',
      time: '18:30',
      title: 'Cocktail Hour',
      description: 'Canapés gourmet y cata de vinos en la terraza',
      icon: 'Wine'
    },
    {
      id: 'photos',
      time: '19:30',
      title: 'Sesión de Fotos',
      description: 'Golden hour en los jardines franceses',
      icon: 'Camera'
    },
    {
      id: 'dinner',
      time: '20:00',
      title: 'Cena de Gala',
      description: 'Menú degustación francés-mexicano de 7 tiempos',
      icon: 'Utensils'
    },
    {
      id: 'speeches',
      time: '21:30',
      title: 'Brindis y Palabras',
      description: 'Momento íntimo con familia y amigos',
      icon: 'MessageCircle'
    },
    {
      id: 'party',
      time: '22:30',
      title: 'Celebración',
      description: 'Baile con orquesta y DJ hasta el amanecer',
      icon: 'Music'
    }
  ],
  gallery: [
    {
      id: 'engagement1',
      url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Isabella y Alexander en París',
      cols: 2,
      rows: 1
    },
    {
      id: 'engagement2',
      url: 'https://images.unsplash.com/photo-1504473220234-f8c7e2bd2d30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Momento elegante',
      cols: 1,
      rows: 2
    },
    {
      id: 'engagement3',
      url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Sofisticación natural',
      cols: 1,
      rows: 1
    },
    {
      id: 'engagement4',
      url: 'https://images.unsplash.com/photo-1475968098848-1b9c4e8c2c1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Elegancia europea',
      cols: 1,
      rows: 1
    },
    {
      id: 'engagement5',
      url: 'https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Momento íntimo',
      cols: 1,
      rows: 1
    },
    {
      id: 'engagement6',
      url: 'https://images.unsplash.com/photo-1464691110742-1353c4b1cda8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Caminando juntos',
      cols: 1,
      rows: 1
    }
  ],
  heroImage: {
    url: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    alt: 'Isabella y Alexander - Una historia de elegancia'
  },
  specialMoments: [
    {
      year: '2019',
      title: 'París, La Sorbona',
      description: 'Primer encuentro durante el intercambio académico'
    },
    {
      year: '2021',
      title: 'Graduación Conjunta',
      description: 'Maestría en Arte y Negocios Internacionales'
    },
    {
      year: '2023',
      title: 'Versailles',
      description: 'Alexander propuso en los jardines del palacio'
    },
    {
      year: '2024',
      title: 'Proyecto Conjunto',
      description: 'Fundación de la ONG educativa "Bridges of Knowledge"'
    }
  ],
  relationshipStats: {
    yearsTogther: 6,
    adventures: 89,
    memories: 3247,
    dreams: 25
  },
  accommodation: [
    {
      name: 'Château de la Vigne - Suites',
      distance: 'En el mismo lugar',
      price: 'Desde $400/noche',
      phone: '+52 646 123-4567',
      amenities: ['Suites de lujo', 'Spa privado', 'Servicio de conserjería', 'Desayuno gourmet']
    },
    {
      name: 'Hotel Boutique Valle',
      distance: '15 min del lugar',
      price: 'Desde $250/noche',
      phone: '+52 646 234-5678',
      amenities: ['Vista a viñedos', 'Piscina', 'Restaurant premiado']
    }
  ],
  transport: {
    parking: true,
    valetParking: true,
    shuttleService: {
      available: true,
      pickupPoints: ['Aeropuerto de Tijuana', 'Hotel Boutique Valle', 'Centro de Ensenada'],
      schedule: ['16:00', '16:30', '17:00']
    },
    publicTransport: 'Servicio de transporte privado disponible',
    rideshare: true
  },
  giftRegistry: {
    enabled: true,
    message: 'Vuestra presencia es el regalo más valioso. Si deseáis contribuir a nuestro futuro juntos:',
    registries: [
      {
        id: 'palacio',
        name: 'El Palacio de Hierro',
        url: 'https://www.elpalaciodehierro.com/mesa-de-regalos/isabella-alexander-2025',
        description: 'Mesa de regalos premium con artículos de lujo para el hogar'
      },
      {
        id: 'liverpool',
        name: 'Liverpool',
        url: 'https://www.liverpool.com.mx/mesa-de-regalos/luxury-2025',
        description: 'Selección curada de productos de alta gama'
      }
    ],
    bankAccount: {
      bankName: 'Banco Santander Private Banking',
      accountName: 'Isabella V. Rossi',
      accountNumber: '1234567890',
      clabe: '123456789012345678',
      description: 'También podéis hacer vuestra aportación directamente'
    }
  },
  adultOnlyEvent: {
    enabled: true,
    message: 'Para mantener la elegancia y sofisticación de la velada, hemos decidido que sea un evento solo para adultos. Agradecemos vuestra comprensión.'
  },
  theme: {
    id: 'luxury'
  },
  languages: ['es', 'en'],
  defaultLanguage: 'es',
  isActive: true,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z'
};

// Mock data para Valentina & Sebastián (ID: valentina-sebastian-2025) - Tema Premium
export const mockWeddingPremium: WeddingData = {
  id: 'valentina-sebastian-2025',
  couple: {
    bride: {
      name: 'Valentina',
      fullName: 'Valentina Sofia Mendoza',
      phone: '+52 55 2345-6789',
      email: 'valentina@email.com',
      instagram: '@valentina_mendoza',
      facebook: 'valentina.mendoza'
    },
    groom: {
      name: 'Sebastián',
      fullName: 'Sebastián Alejandro Herrera',
      phone: '+52 55 9876-5432',
      email: 'sebastian@email.com',
      instagram: '@sebastian_herrera',
      facebook: 'sebastian.herrera'
    },
    coupleEmail: 'vale.seb@email.com',
    hashtag: '#ValentinaySebastian2025',
    story: 'Nuestro amor floreció como una rosa dorada en el jardín de la vida. Desde aquella primera mirada en la galería de arte hasta hoy, hemos tejido una historia de pasión, arte y sueños compartidos. En cada atardecer, en cada risa, en cada momento de silencio, hemos construido un amor que trasciende el tiempo.',
    quote: 'En el arte del amor, cada día pintamos juntos un lienzo de eternidad.'
  },
  event: {
    weddingId: 'valentina-sebastian-2025',
    date: '2025-12-14T17:00:00.000Z',
    time: '17:00',
    ceremony: {
      time: '17:00',
      duration: 50
    },
    reception: {
      time: '20:00',
      duration: 420
    },
    ceremonyVenue: {
      name: 'Jardín Botánico de Chapultepec',
      address: 'Av. Paseo de la Reforma S/N, Chapultepec, Ciudad de México',
      coordinates: {
        lat: 19.4194,
        lng: -99.1832
      },
      description: 'Un santuario natural en el corazón de la ciudad, donde la naturaleza y el arte se fusionan en perfecta armonía'
    },
    receptionVenue: {
      name: 'Hacienda San Angel',
      address: 'Calz. Desierto de los Leones 4620, Alcantarilla, Ciudad de México',
      coordinates: {
        lat: 19.3611,
        lng: -99.2594
      },
      description: 'Una hacienda colonial del siglo XVIII restaurada con elegancia contemporánea, rodeada de jardines de rosas y fuentes de cantera.',
      features: [
        'Jardines de rosas premium',
        'Salón de cristal con vista panorámica',
        'Capilla privada',
        'Terraza con fuentes artesanales',
        'Sala de cata privada',
        'Servicio de sommeliers'
      ]
    },
    dressCode: {
      style: 'Gala / Black Tie Opcional',
      description: 'Una celebración de elegancia y sofisticación, donde cada detalle refleja la belleza del momento',
      recommendations: {
        ladies: [
          'Vestidos largos de gala',
          'Vestidos cocktail elegantes',
          'Tonos burgundy, rose gold y champagne son bienvenidos',
          'Complementos dorados y joyería fina'
        ],
        gentlemen: [
          'Esmoquin negro o azul marino',
          'Traje oscuro con corbata de seda',
          'Gemelos y accesorios elegantes',
          'Zapatos de charol o cuero fino'
        ]
      },
      colors: {
        recommended: ['#a08060', '#c9b49a', '#b8a687', '#2c3e50', '#8e44ad', '#c0392b'],
        avoid: ['#ffffff', '#f8f8ff', '#ff0000', '#00ff00']
      }
    },
    rsvpDeadline: '2025-11-01T23:59:59.000Z'
  },
  timeline: [
    {
      id: 'arrival',
      time: '16:30',
      title: 'Recepción de Invitados',
      description: 'Bienvenida con copa de champagne rosé',
      icon: 'MapPin'
    },
    {
      id: 'ceremony',
      time: '17:00',
      title: 'Ceremonia Sacred',
      description: 'Unión de almas bajo el rosal dorado',
      icon: 'Heart',
      isHighlight: true
    },
    {
      id: 'photos',
      time: '17:50',
      title: 'Sesión Artística',
      description: 'Retratos en los jardines de rosas',
      icon: 'Camera'
    },
    {
      id: 'cocktail',
      time: '19:00',
      title: 'Cocktail Premium',
      description: 'Canapés gourmet y mixología de autor',
      icon: 'Wine'
    },
    {
      id: 'reception',
      time: '20:00',
      title: 'Cena de Degustación',
      description: 'Menú de 6 tiempos con maridaje de vinos',
      icon: 'Utensils'
    },
    {
      id: 'speeches',
      time: '21:30',
      title: 'Brindis de Amor',
      description: 'Palabras del corazón y champagne Cristal',
      icon: 'MessageCircle'
    },
    {
      id: 'party',
      time: '22:30',
      title: 'Celebración Dorada',
      description: 'Baile con orquesta sinfónica y DJ',
      icon: 'Music'
    }
  ],
  gallery: [
    {
      id: 'premium1',
      url: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Valentina y Sebastián en la galería',
      cols: 2,
      rows: 1
    },
    {
      id: 'premium2',
      url: 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Momento artístico',
      cols: 1,
      rows: 2
    },
    {
      id: 'premium3',
      url: 'https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Atardecer dorado',
      cols: 1,
      rows: 1
    },
    {
      id: 'premium4',
      url: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Elegancia premium',
      cols: 1,
      rows: 1
    },
    {
      id: 'premium5',
      url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Sonrisas doradas',
      cols: 1,
      rows: 1
    },
    {
      id: 'premium6',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Caminando hacia el futuro',
      cols: 1,
      rows: 1
    }
  ],
  heroImage: {
    url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    alt: 'Valentina y Sebastián - Una historia de arte y amor'
  },
  specialMoments: [
    {
      year: '2020',
      title: 'Galería de Arte',
      description: 'Nos conocimos en una exposición de arte contemporáneo'
    },
    {
      year: '2022',
      title: 'Primera Exposición Juntos',
      description: 'Colaboramos en una muestra de arte digital'
    },
    {
      year: '2024',
      title: 'Propuesta Artística',
      description: 'Sebastián creó una instalación solo para pedirle matrimonio'
    },
    {
      year: '2025',
      title: 'Estudio Compartido',
      description: 'Abrimos nuestro atelier conjunto "Amor en Lienzo"'
    }
  ],
  relationshipStats: {
    yearsTogther: 5,
    adventures: 127,
    memories: 2847,
    dreams: 31
  },
  accommodation: [
    {
      name: 'Hotel Presidente InterContinental',
      distance: '20 min del lugar',
      price: 'Desde $320/noche',
      phone: '+52 55 1234-5678',
      amenities: ['Spa de lujo', 'Restaurante premiado', 'Servicio de conserjería 24h', 'Valet parking']
    },
    {
      name: 'Four Seasons México DF',
      distance: '25 min del lugar',
      price: 'Desde $450/noche',
      phone: '+52 55 2345-6789',
      amenities: ['Suites premium', 'Spa world-class', 'Bar rooftop', 'Servicio de mayordomo']
    }
  ],
  transport: {
    parking: true,
    valetParking: true,
    shuttleService: {
      available: true,
      pickupPoints: ['Aeropuerto de la Ciudad de México', 'Hotel Presidente InterContinental', 'Four Seasons México DF'],
      schedule: ['16:00', '16:15', '16:30']
    },
    publicTransport: 'Servicio de transporte privado de lujo disponible',
    rideshare: true
  },
  giftRegistry: {
    enabled: true,
    message: 'Vuestra presencia es el regalo más preciado. Para aquellos que deseen contribuir a nuestro futuro artístico:',
    registries: [
      {
        id: 'palacio',
        name: 'El Palacio de Hierro',
        url: 'https://www.elpalaciodehierro.com/mesa-de-regalos/valentina-sebastian-2025',
        description: 'Mesa de regalos con arte y decoración premium'
      },
      {
        id: 'crate',
        name: 'Crate & Barrel',
        url: 'https://www.crateandbarrel.com.mx/mesa-de-regalos/premium-2025',
        description: 'Selección curada de piezas de diseño contemporáneo'
      }
    ],
    bankAccount: {
      bankName: 'Banco Santander Private',
      accountName: 'Valentina S. Mendoza',
      accountNumber: '9876543210',
      clabe: '987654321098765432',
      description: 'También podéis hacer vuestra aportación directamente para nuestro estudio de arte'
    }
  },
  adultOnlyEvent: {
    enabled: true,
    message: 'Para mantener la atmósfera íntima y sofisticada de nuestra celebración artística, hemos decidido que sea un evento solo para adultos. Agradecemos vuestra comprensión.'
  },
  theme: {
    id: 'premium'
  },
  languages: ['es', 'en'],
  defaultLanguage: 'es',
  isActive: true,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z'
};

// Mock data para Friends Test (ID: friends-test) - Tema Classic (igual que María & Carlos)
export const mockWeddingFriendsTest: WeddingData = {
  id: 'friends-test',
  couple: {
    bride: {
      name: 'Maria',
      fullName: 'María Elena González',
      phone: '+52 55 1234-5678',
      email: 'maria@email.com',
      instagram: '@maria_gonzalez',
      facebook: 'maria.gonzalez'
    },
    groom: {
      name: 'Carlos',
      fullName: 'Carlos Antonio Rodríguez',
      phone: '+52 55 8765-4321',
      email: 'carlos@email.com',
      instagram: '@carlos_rodriguez',
      facebook: 'carlos.rodriguez'
    },
    coupleEmail: 'maria.carlos@email.com',
    hashtag: '#MaríaYCarlos2025',
    story: 'Hace más de 6 años, el destino nos unió en una cafetería de la ciudad. Lo que comenzó como una conversación casual se convirtió en risas compartidas, sueños entrelazados y un amor que creció día a día. Hoy, queremos celebrar este momento único rodeados de las personas que más queremos.',
    quote: 'El amor no es solo mirarse el uno al otro, sino mirar juntos en la misma dirección.'
  },
  event: {
    weddingId: 'friends-test',
    date: '2025-11-21T16:00:00.000Z',
    time: '16:00',
    ceremony: {
      time: '16:00',
      duration: 45
    },
    reception: {
      time: '19:30',
      duration: 360
    },
    ceremonyVenue: {
      name: 'Iglesia del Sagrado Corazón',
      address: 'Calle de los Santos 456, Ciudad, Estado 12345',
      coordinates: {
        lat: 19.4290,
        lng: -99.1285
      },
      description: 'Hermosa iglesia con arquitectura colonial donde celebraremos nuestra ceremonia religiosa'
    },
    receptionVenue: {
      name: 'Jardines del Edén',
      address: 'Av. Principal 123, Ciudad, Estado 12345',
      coordinates: {
        lat: 19.4326,
        lng: -99.1332
      },
      description: 'Un hermoso lugar rodeado de naturaleza, perfecto para celebrar nuestro amor. Con amplios jardines, salones elegantes y vistas espectaculares.',
      features: [
        'Jardines exteriores para cóctel',
        'Salón principal climatizado',
        'Estacionamiento amplio y seguro',
        'Área de fotos panorámicas',
        'Coctelera al aire libre',
        'Música y sonido profesional'
      ]
    },
    dressCode: {
      style: 'Formal / Cocktail',
      description: 'Queremos que te sientas elegante y cómodo en nuestra celebración',
      recommendations: {
        ladies: [
          'Vestidos midi o largos elegantes',
          'Conjuntos de falda y blusa sofisticados',
          'Pantalones de vestir con blusa elegante',
          'Vestidos cóctel o de fiesta'
        ],
        gentlemen: [
          'Traje completo (saco y pantalón)',
          'Pantalón de vestir con camisa y saco',
          'Camisa de vestir (corbata opcional)',
          'Zapatos de vestir formales'
        ]
      },
      colors: {
        recommended: ['#8b7355', '#a67c5a', '#d4af8c', '#2c3e50', '#8e44ad', '#27ae60'],
        avoid: ['#ffffff', '#f8f8ff', '#ff0000', '#00ff00']
      }
    },
    rsvpDeadline: '2025-10-15T23:59:59.000Z'
  },
  timeline: [
    {
      id: 'arrival',
      time: '15:30',
      title: 'Llegada de Invitados',
      description: 'Recepción y bienvenida en los jardines',
      icon: 'MapPin'
    },
    {
      id: 'ceremony',
      time: '16:00',
      title: 'Ceremonia Civil',
      description: '¡El momento más esperado! Intercambio de votos',
      icon: 'Heart',
      isHighlight: true
    },
    {
      id: 'photos',
      time: '16:45',
      title: 'Sesión de Fotos',
      description: 'Fotos con familiares y amigos cercanos',
      icon: 'Camera'
    },
    {
      id: 'cocktail',
      time: '18:00',
      title: 'Cóctel de Celebración',
      description: 'Aperitivos y bebidas mientras preparamos la recepción',
      icon: 'Utensils'
    },
    {
      id: 'reception',
      time: '19:30',
      title: 'Cena y Brindis',
      description: 'Cena especial con nuestros seres queridos',
      icon: 'Utensils'
    },
    {
      id: 'party',
      time: '21:00',
      title: '¡A Bailar!',
      description: 'Música, baile y diversión hasta altas horas',
      icon: 'Music'
    }
  ],
  gallery: [
    {
      id: 'friends1',
      url: '/assets/friends/03.jpeg',
      alt: 'María y Carlos - Momento especial con amigos',
      cols: 2,
      rows: 2
    },
    {
      id: 'friends2',
      url: '/assets/friends/02.jpeg',
      alt: 'Celebración con amigos',
      cols: 1,
      rows: 1
    },
    {
      id: 'friends3',
      url: '/assets/friends/03.jpeg',
      alt: 'Momentos divertidos',
      cols: 1,
      rows: 1
    },
    {
      id: 'friends4',
      url: '/assets/friends/04.jpeg',
      alt: 'Risas compartidas',
      cols: 1,
      rows: 2
    },
    {
      id: 'friends5',
      url: '/assets/friends/05.jpeg',
      alt: 'Aventuras juntos',
      cols: 1,
      rows: 1
    },
    {
      id: 'friends6',
      url: '/assets/friends/06.jpeg',
      alt: 'Recuerdos inolvidables',
      cols: 1,
      rows: 1
    },
    {
      id: 'friends7',
      url: '/assets/friends/07.jpeg',
      alt: 'Momentos de felicidad',
      cols: 2,
      rows: 1
    },
    {
      id: 'friends8',
      url: '/assets/friends/08.jpeg',
      alt: 'Diversión con amigos',
      cols: 1,
      rows: 1
    },
    {
      id: 'friends9',
      url: '/assets/friends/09.jpeg',
      alt: 'Sonrisas sinceras',
      cols: 1,
      rows: 2
    },
    {
      id: 'friends10',
      url: '/assets/friends/10.jpeg',
      alt: 'Amistad verdadera',
      cols: 1,
      rows: 1
    }
  ],
  heroImage: {
    url: '/assets/friends/011.jpg',
    alt: 'María y Carlos - Friends Test - Imagen principal de boda'
  },
  specialMoments: [
    {
      year: '2018',
      title: 'Primer Encuentro',
      description: 'Nos conocimos en una cafetería del centro'
    },
    {
      year: '2021',
      title: 'Nuestra Primera Casa',
      description: 'Comenzamos a vivir juntos'
    },
    {
      year: '2024',
      title: 'La Propuesta',
      description: 'Carlos le pidió matrimonio a María en la playa'
    }
  ],
  relationshipStats: {
    yearsTogther: 6,
    adventures: 47,
    memories: 1250,
    dreams: 8
  },
  accommodation: [
    {
      name: 'Hotel Boutique Central',
      distance: '5 min del lugar',
      price: 'Desde $120/noche',
      phone: '+52 55 1111-2222',
      website: 'www.hotelboutiquecentral.com',
      amenities: ['WiFi gratuito', 'Desayuno incluido', 'Estacionamiento']
    },
    {
      name: 'Gran Hotel Plaza',
      distance: '10 min del lugar',
      price: 'Desde $80/noche',
      phone: '+52 55 3333-4444',
      website: 'www.granhotelplaza.com',
      amenities: ['WiFi gratuito', 'Gimnasio', 'Piscina']
    }
  ],
  transport: {
    parking: true,
    valetParking: true,
    shuttleService: {
      available: true,
      pickupPoints: ['Hotel Boutique Central', 'Gran Hotel Plaza'],
      schedule: ['15:00', '15:15', '15:30']
    },
    publicTransport: 'Estación de metro a 2 cuadras',
    rideshare: true
  },
  giftRegistry: {
    enabled: true,
    message: 'Tu presencia es nuestro regalo más valioso, pero si deseas hacernos un obsequio, hemos preparado algunas opciones:',
    registries: [
      {
        id: 'liverpool',
        name: 'Liverpool',
        url: 'https://mesaderegalos.liverpool.com.mx/milistaderegalos/123456789',
        description: 'Mesa de regalos en Liverpool con todo lo que necesitamos para nuestro hogar'
      },
      {
        id: 'amazon',
        name: 'Amazon',
        url: 'https://www.amazon.com.mx/hz/wishlist/ls/2ABCDEFGHIJKL',
        description: 'Lista de deseos en Amazon con productos prácticos para nuestra nueva vida juntos'
      },
      {
        id: 'palacio',
        name: 'El Palacio de Hierro',
        url: 'https://www.elpalaciodehierro.com/mesa-de-regalos/maria-carlos-2025',
        description: 'Mesa de regalos con artículos elegantes y de calidad'
      }
    ],
    bankAccount: {
      bankName: 'Banco BBVA',
      accountName: 'María Elena González',
      accountNumber: '1234567890',
      clabe: '012345678901234567',
      description: 'También puedes contribuir directamente a nuestra cuenta bancaria'
    }
  },
  adultOnlyEvent: {
    enabled: true,
    message: 'Aunque adoramos a los pequeños de la familia, hemos decidido que nuestra celebración sea solo para adultos. Esperamos que puedan acompañarnos en esta noche especial.'
  },
  music: {
    enabled: true,
    spotifyTrackId: '1HNkqx9Ahdgi1Ixy2xkKkL', // "Perfect" by Ed Sheeran - ID correcto
    title: 'Perfect',
    artist: 'Ed Sheeran',
    autoplay: true,
    volume: 0.3,
    showControls: false, // Volver a modo minimalista
    startTime: 0
  },
  theme: {
    id: 'classic'
  },
  languages: ['es', 'en'],
  defaultLanguage: 'es',
  isActive: true,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z'
};

// Mock data para Roberto & Patricia (ID: roberto-patricia-2025) - Tema Corporate
export const mockWeddingCorporate: WeddingData = {
  id: 'roberto-patricia-2025',
  couple: {
    bride: {
      name: 'Patricia',
      fullName: 'Patricia Elena Morrison',
      phone: '+52 55 3456-7890',
      email: 'patricia@email.com',
      instagram: '@patricia_morrison',
      facebook: 'patricia.morrison'
    },
    groom: {
      name: 'Roberto',
      fullName: 'Roberto Alejandro Ruiz',
      phone: '+52 55 0987-6543',
      email: 'roberto@email.com',
      instagram: '@roberto_ruiz',
      facebook: 'roberto.ruiz'
    },
    coupleEmail: 'patricia.roberto@email.com',
    hashtag: '#PatriciaYRoberto2025',
    story: 'Nuestra historia comenzó en el mundo corporativo, donde la excelencia y la dedicación nos unieron. Durante cinco años trabajando en proyectos desafiantes, descubrimos que nuestras metas profesionales compartían el mismo valor: construir algo duradero juntos. Hoy, queremos celebrar no solo nuestro amor, sino también el compromiso mutuo hacia un futuro próspero.',
    quote: 'El éxito se mide no solo en logros, sino en las personas con quienes compartes el camino.'
  },
  event: {
    weddingId: 'roberto-patricia-2025',
    date: '2025-10-18T18:00:00.000Z',
    time: '18:00',
    ceremony: {
      time: '18:00',
      duration: 45
    },
    reception: {
      time: '20:30',
      duration: 360
    },
    ceremonyVenue: {
      name: 'Torre Corporativa Milenio - Salón Ejecutivo',
      address: 'Av. Paseo de la Reforma 350, Juárez, Ciudad de México',
      coordinates: {
        lat: 19.4326,
        lng: -99.1332
      },
      description: 'Un espacio de vanguardia con vista panorámica de la ciudad, donde la elegancia corporativa se encuentra con la celebración personal'
    },
    receptionVenue: {
      name: 'Club Empresarial Metropolitan',
      address: 'Av. Presidente Masaryk 201, Polanco, Ciudad de México',
      coordinates: {
        lat: 19.4284,
        lng: -99.1901
      },
      description: 'Un exclusivo club empresarial con ambientes sofisticados, jardines urbanos y servicios de primera clase para una celebración memorable.',
      features: [
        'Salón ejecutivo con vista panorámica',
        'Terraza corporativa al aire libre',
        'Servicio de valet parking',
        'Área de networking VIP',
        'Sistema de sonido profesional',
        'Servicio de catering gourmet'
      ]
    },
    dressCode: {
      style: 'Business Formal / Cocktail Elegante',
      description: 'Una celebración donde la elegancia profesional se encuentra con la sofisticación personal',
      recommendations: {
        ladies: [
          'Vestidos cocktail elegantes',
          'Trajes ejecutivos sofisticados',
          'Conjuntos de blazer y falda/pantalón',
          'Tonos corporativos: grises, azul marino, negro'
        ],
        gentlemen: [
          'Traje completo business',
          'Camisa de vestir con corbata',
          'Blazer con pantalón de vestir',
          'Zapatos de cuero ejecutivos'
        ]
      },
      colors: {
        recommended: ['#4a5568', '#718096', '#2d3748', '#1a202c', '#38a169', '#2b6cb0'],
        avoid: ['#ffffff', '#f8f8ff', '#ff0000', '#00ff00']
      }
    },
    rsvpDeadline: '2025-09-15T23:59:59.000Z'
  },
  timeline: [
    {
      id: 'arrival',
      time: '17:30',
      title: 'Recepción Ejecutiva',
      description: 'Bienvenida con cóctel de networking',
      icon: 'MapPin'
    },
    {
      id: 'ceremony',
      time: '18:00',
      title: 'Ceremonia Corporativa',
      description: 'Unión en el salón ejecutivo con vista a la ciudad',
      icon: 'Heart',
      isHighlight: true
    },
    {
      id: 'photos',
      time: '18:45',
      title: 'Sesión Profesional',
      description: 'Fotografías en la terraza panorámica',
      icon: 'Camera'
    },
    {
      id: 'cocktail',
      time: '19:30',
      title: 'Cocktail Premium',
      description: 'Networking y aperitivos gourmet',
      icon: 'Wine'
    },
    {
      id: 'reception',
      time: '20:30',
      title: 'Cena Ejecutiva',
      description: 'Menú degustación de 5 tiempos',
      icon: 'Utensils'
    },
    {
      id: 'speeches',
      time: '22:00',
      title: 'Brindis Corporativo',
      description: 'Palabras de éxito y champagne premium',
      icon: 'MessageCircle'
    },
    {
      id: 'party',
      time: '23:00',
      title: 'Celebración de Logros',
      description: 'Música selecta y ambiente sofisticado',
      icon: 'Music'
    }
  ],
  gallery: [
    {
      id: 'corporate1',
      url: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Patricia y Roberto en el distrito financiero',
      cols: 2,
      rows: 1
    },
    {
      id: 'corporate2',
      url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Momento ejecutivo',
      cols: 1,
      rows: 2
    },
    {
      id: 'corporate3',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Profesionalismo y elegancia',
      cols: 1,
      rows: 1
    },
    {
      id: 'corporate4',
      url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Caminando hacia el futuro',
      cols: 1,
      rows: 1
    },
    {
      id: 'corporate5',
      url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Sonrisas de éxito',
      cols: 1,
      rows: 1
    },
    {
      id: 'corporate6',
      url: 'https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Momento de conexión',
      cols: 1,
      rows: 1
    }
  ],
  heroImage: {
    url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    alt: 'Patricia y Roberto - Una historia de éxito profesional y personal'
  },
  specialMoments: [
    {
      year: '2020',
      title: 'Primer Proyecto Conjunto',
      description: 'Colaboramos en una estrategia corporativa innovadora'
    },
    {
      year: '2022',
      title: 'Promoción Simultánea',
      description: 'Ambos ascendimos a posiciones ejecutivas'
    },
    {
      year: '2024',
      title: 'Propuesta Ejecutiva',
      description: 'Roberto propuso en la terraza de la oficina durante sunset'
    },
    {
      year: '2025',
      title: 'Fusión Empresarial',
      description: 'Decidimos fusionar nuestras vidas como nuestros objetivos'
    }
  ],
  relationshipStats: {
    yearsTogther: 5,
    adventures: 67,
    memories: 1852,
    dreams: 15
  },
  accommodation: [
    {
      name: 'Hotel Presidente InterContinental',
      distance: '5 min del lugar',
      price: 'Desde $350/noche',
      phone: '+52 55 1234-5678',
      amenities: ['Centro de negocios 24h', 'Spa ejecutivo', 'Gimnasio premium', 'Servicio de conserjería']
    },
    {
      name: 'JW Marriott México City',
      distance: '10 min del lugar',
      price: 'Desde $420/noche',
      phone: '+52 55 2345-6789',
      amenities: ['Club ejecutivo', 'Spa de lujo', 'Restaurante gourmet', 'Servicio de limusina']
    }
  ],
  transport: {
    parking: true,
    valetParking: true,
    shuttleService: {
      available: true,
      pickupPoints: ['Aeropuerto de la Ciudad de México', 'Hotel Presidente InterContinental', 'JW Marriott México City'],
      schedule: ['17:00', '17:15', '17:30']
    },
    publicTransport: 'Servicio de transporte ejecutivo disponible',
    rideshare: true
  },
  giftRegistry: {
    enabled: true,
    message: 'Vuestra presencia es nuestro mayor logro. Para aquellos que deseen contribuir a nuestro futuro empresarial:',
    registries: [
      {
        id: 'palacio',
        name: 'El Palacio de Hierro',
        url: 'https://www.elpalaciodehierro.com/mesa-de-regalos/patricia-roberto-2025',
        description: 'Mesa de regalos ejecutiva con artículos premium para el hogar'
      },
      {
        id: 'williams',
        name: 'Williams Sonoma',
        url: 'https://www.williams-sonoma.com.mx/mesa-de-regalos/corporate-2025',
        description: 'Selección de productos gourmet y utensilios profesionales'
      }
    ],
    bankAccount: {
      bankName: 'BBVA Bancomer Private Banking',
      accountName: 'Patricia E. Morrison',
      accountNumber: '5432109876',
      clabe: '543210987654321098',
      description: 'También podéis hacer vuestra aportación directamente para nuestros proyectos futuros'
    }
  },
  adultOnlyEvent: {
    enabled: true,
    message: 'Para mantener el ambiente profesional y sofisticado de nuestra celebración corporativa, hemos decidido que sea un evento solo para adultos. Agradecemos vuestra comprensión.'
  },
  theme: {
    id: 'corporate'
  },
  languages: ['es', 'en'],
  defaultLanguage: 'es',
  isActive: true,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z'
};

// Mapa de bodas disponibles para desarrollo
export const mockWeddings: Record<string, WeddingData> = {
  'maria-carlos-2025': mockWeddingMariaCarlos,
  'ana-luis-2025': mockWeddingAnaLuis,
  'isabella-alexander-2025': mockWeddingLuxury,
  'valentina-sebastian-2025': mockWeddingPremium,
  'roberto-patricia-2025': mockWeddingCorporate,
  'friends-test': mockWeddingFriendsTest
};

// Función para obtener datos mock
export const getMockWeddingData = (id: string): WeddingData | null => {
  return mockWeddings[id] || null;
};

// Lista de IDs disponibles para desarrollo
export const availableWeddingIds = Object.keys(mockWeddings); 