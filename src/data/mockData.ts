import { WeddingData, TimelineEvent, GalleryImage, SpecialMoment, AccommodationOption } from '../types/wedding';

// Mock data para María & Carlos (ID: maria-carlos-2025)
export const mockWeddingMariaCarlos: WeddingData = {
  id: 'maria-carlos-2025',
  couple: {
    bride: {
      name: 'Quetzalia',
      fullName: 'María Elena González',
      phone: '+52 55 1234-5678',
      email: 'maria@email.com',
      instagram: '@maria_gonzalez',
      facebook: 'maria.gonzalez'
    },
    groom: {
      name: 'Adrián',
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
    venue: {
      name: 'Jardines del Edén',
      address: 'Av. Principal 123, Ciudad, Estado 12345',
      coordinates: {
        lat: 19.4326,
        lng: -99.1332
      },
      description: 'Un hermoso lugar rodeado de naturaleza, perfecto para celebrar nuestro amor. Con amplios jardines, salones elegantes y vistas espectaculares.',
      features: [
        'Jardines exteriores para ceremonia',
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
  theme: {
    primaryColor: '#8b7355',
    secondaryColor: '#a67c5a',
    accentColor: '#d4af8c',
    fontPrimary: 'Playfair Display',
    fontSecondary: 'Crimson Text'
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
    venue: {
      name: 'Hacienda San Miguel',
      address: 'Carretera Nacional Km 25, Pueblo Mágico, Estado 54321',
      coordinates: {
        lat: 20.5937,
        lng: -100.3898
      },
      description: 'Una hermosa hacienda colonial con arquitectura tradicional mexicana, rodeada de viñedos y jardines botánicos.',
      features: [
        'Capilla colonial para ceremonia',
        'Salón de baile con vigas de madera',
        'Jardines con fuente central',
        'Viñedos como backdrop',
        'Terraza panorámica',
        'Cava de vinos'
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
  theme: {
    primaryColor: '#8b5a2b',
    secondaryColor: '#dda15e',
    accentColor: '#f4e4bc',
    fontPrimary: 'Playfair Display',
    fontSecondary: 'Lora'
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
  'ana-luis-2025': mockWeddingAnaLuis
};

// Función para obtener datos mock
export const getMockWeddingData = (id: string): WeddingData | null => {
  return mockWeddings[id] || null;
};

// Lista de IDs disponibles para desarrollo
export const availableWeddingIds = Object.keys(mockWeddings); 