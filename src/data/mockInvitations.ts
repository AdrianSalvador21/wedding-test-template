import { WeddingInvitation, GuestInfo } from '../types/wedding';
import { mockWeddingMariaCarlos, mockWeddingAnaLuis, mockWeddingLuxury, mockWeddingPremium, mockWeddingCorporate } from './mockData';

// Mocks de invitados para María & Carlos
export const mockGuestsMariaCarlos: GuestInfo[] = [
  {
    id: 'guest-001',
    name: 'Ana Patricia López',
    email: 'ana.lopez@email.com',
    phone: '+52 55 1111-2222',
    allowedGuests: 2,
    guestType: 'close_family',
    table: 'Mesa 1',
    specialMessage: 'Querida Ana, como madrina de María, tu presencia es fundamental en este día tan especial. ¡Te esperamos con mucho amor!',
    isConfirmed: false,
    notes: 'Madrina de la novia'
  },
  {
    id: 'guest-002',
    name: 'Roberto Martínez',
    email: 'roberto.martinez@email.com',
    allowedGuests: 1,
    guestType: 'friends',
    table: 'Mesa 5',
    specialMessage: 'Roberto, tu amistad ha sido invaluable para nosotros. ¡Será un honor tenerte en nuestra boda!',
    isConfirmed: true,
    confirmedGuests: 1,
    notes: 'Amigo de la universidad'
  },
  {
    id: 'guest-003',
    name: 'Familia Rodríguez',
    email: 'familia.rodriguez@email.com',
    phone: '+52 55 3333-4444',
    allowedGuests: 4,
    guestType: 'family',
    table: 'Mesa 2',
    specialMessage: 'Querida familia, su amor y apoyo han sido fundamentales en nuestro camino. ¡Los esperamos con los brazos abiertos!',
    dietaryRestrictions: ['vegetariano'],
    isConfirmed: false,
    notes: 'Familia del novio - incluye abuelos'
  },
  {
    id: 'guest-004',
    name: 'Dr. Miguel Hernández',
    email: 'miguel.hernandez@email.com',
    allowedGuests: 2,
    guestType: 'work',
    table: 'Mesa 8',
    specialMessage: 'Dr. Hernández, ha sido un honor trabajar con usted. Esperamos que pueda acompañarnos en este día tan importante.',
    isConfirmed: false,
    notes: 'Jefe de Carlos'
  },
  {
    id: 'guest-005',
    name: 'Sofía y Diego Morales',
    email: 'sofia.diego@email.com',
    phone: '+52 55 5555-6666',
    allowedGuests: 3,
    guestType: 'friends',
    table: 'Mesa 6',
    specialMessage: 'Sofía y Diego, nuestros queridos amigos, su amistad significa el mundo para nosotros. ¡Esperamos celebrar juntos!',
    dietaryRestrictions: ['sin gluten'],
    isConfirmed: true,
    confirmedGuests: 2,
    notes: 'Pareja de amigos con hijo pequeño'
  },
  {
    id: 'guest-006',
    name: 'Abuela Carmen',
    email: 'carmen.gonzalez@email.com',
    phone: '+52 55 7777-8888',
    allowedGuests: 1,
    guestType: 'vip',
    table: 'Mesa Principal',
    specialMessage: 'Abuelita Carmen, eres el corazón de nuestra familia. Tu bendición y tu presencia harán que este día sea perfecto.',
    dietaryRestrictions: ['diabético'],
    isConfirmed: true,
    confirmedGuests: 1,
    notes: 'Abuela de la novia - VIP'
  },
  {
    id: 'guest-007',
    name: 'Laura Hernández',
    email: 'laura.hernandez@email.com',
    phone: '+52 55 9999-0000',
    allowedGuests: 2,
    guestType: 'friends',
    table: 'Mesa 7',
    // Sin mensaje especial - es opcional
    isConfirmed: false,
    notes: 'Amiga del trabajo'
  }
];

// Mocks de invitados para Ana & Luis
export const mockGuestsAnaLuis: GuestInfo[] = [
  {
    id: 'guest-101',
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@email.com',
    phone: '+52 33 1111-2222',
    allowedGuests: 2,
    guestType: 'close_family',
    table: 'Mesa 1',
    specialMessage: 'Carlos, como padrino de Luis, tu presencia es esencial. ¡Te esperamos para celebrar juntos!',
    isConfirmed: false,
    notes: 'Padrino del novio'
  },
  {
    id: 'guest-102',
    name: 'María Elena Vásquez',
    email: 'maria.vasquez@email.com',
    allowedGuests: 1,
    guestType: 'friends',
    table: 'Mesa 4',
    specialMessage: 'María Elena, tu amistad desde la infancia es un tesoro. ¡Será mágico tenerte en nuestra boda!',
    isConfirmed: true,
    confirmedGuests: 1,
    notes: 'Amiga de la infancia'
  }
];

// Mocks de invitados para Isabella & Alexander (tema luxury)
export const mockGuestsLuxury: GuestInfo[] = [
  {
    id: 'guest-201',
    name: 'Victoria Montecarlo',
    email: 'victoria.montecarlo@email.com',
    phone: '+52 646 200-3000',
    allowedGuests: 2,
    guestType: 'close_family',
    table: 'Mesa VIP',
    specialMessage: 'Victoria, vuestra elegancia y sofisticación han sido una inspiración constante. Será un honor teneros en nuestro día especial.',
    isConfirmed: false,
    notes: 'Madrina de Isabella - Familia VIP'
  },
  {
    id: 'guest-202',
    name: 'Maximilian von Habsburg',
    email: 'max.habsburg@email.com',
    phone: '+52 646 200-3001',
    allowedGuests: 2,
    guestType: 'close_family',
    table: 'Mesa VIP',
    specialMessage: 'Maximilian, vuestra amistad desde París ha sido invaluable. Esperamos celebrar juntos esta nueva etapa.',
    isConfirmed: true,
    confirmedGuests: 2,
    notes: 'Padrino de Alexander - Amigo de París'
  },
  {
    id: 'guest-203',
    name: 'Alejandro Vega',
    email: 'alejandro.vega@email.com',
    phone: '+52 646 200-3002',
    allowedGuests: 1,
    guestType: 'friends',
    table: 'Mesa 3',
    specialMessage: 'Alejandro, vuestra presencia añadirá distinción a nuestra celebración. ¡Os esperamos con gran expectación!',
    isConfirmed: false,
    notes: 'Amigo común - Empresario'
  },
  {
    id: 'guest-204',
    name: 'Familia Rossi',
    email: 'famiglia.rossi@email.com',
    phone: '+52 646 200-3003',
    allowedGuests: 4,
    guestType: 'family',
    table: 'Mesa 1',
    specialMessage: 'Querida famiglia, vuestro amor y tradiciones italianas han enriquecido nuestra historia. ¡Será mágico teneros con nosotros!',
    dietaryRestrictions: ['sin lactosa'],
    isConfirmed: true,
    confirmedGuests: 4,
    notes: 'Familia italiana de Isabella'
  },
  {
    id: 'guest-205',
    name: 'Dr. Catherine Morrison',
    email: 'catherine.morrison@email.com',
    phone: '+52 646 200-3004',
    allowedGuests: 2,
    guestType: 'work',
    table: 'Mesa 5',
    specialMessage: 'Dr. Morrison, vuestra mentoría ha sido fundamental en nuestro crecimiento profesional. Será un privilegio teneros en nuestra boda.',
    isConfirmed: false,
    notes: 'Mentora académica - Profesora de la Sorbona'
  },
  {
    id: 'guest-206',
    name: 'Conde Eduardo de Braganza',
    email: 'conde.braganza@email.com',
    phone: '+52 646 200-3005',
    allowedGuests: 2,
    guestType: 'vip',
    table: 'Mesa Principal',
    specialMessage: 'Estimado Conde, vuestra amistad y sabiduría han sido una bendición. Esperamos que honréis nuestra celebración con vuestra presencia.',
    dietaryRestrictions: ['vegetariano'],
    isConfirmed: true,
    confirmedGuests: 2,
    notes: 'Invitado VIP - Aristocracia europea'
  }
];

// Mocks de invitados para Isabella & Alexander (tema premium)
export const mockGuestsPremium: GuestInfo[] = [
  {
    id: 'guest-301',
    name: 'Isabella Montecarlo',
    email: 'isabella.montecarlo@email.com',
    phone: '+52 646 200-3006',
    allowedGuests: 2,
    guestType: 'close_family',
    table: 'Mesa VIP',
    specialMessage: 'Isabella, vuestra elegancia y sofisticación han sido una inspiración constante. Será un honor teneros en nuestro día especial.',
    isConfirmed: false,
    notes: 'Hija de Victoria - Familia VIP'
  },
  {
    id: 'guest-302',
    name: 'Alexander von Habsburg',
    email: 'alexander.habsburg@email.com',
    phone: '+52 646 200-3007',
    allowedGuests: 2,
    guestType: 'close_family',
    table: 'Mesa VIP',
    specialMessage: 'Alexander, vuestra amistad desde París ha sido invaluable. Esperamos celebrar juntos esta nueva etapa.',
    isConfirmed: true,
    confirmedGuests: 2,
    notes: 'Hijo de Maximilian - Amigo de París'
  },
  {
    id: 'guest-303',
    name: 'Familia Rossi Premium',
    email: 'familia.rossi.premium@email.com',
    phone: '+52 646 200-3008',
    allowedGuests: 4,
    guestType: 'family',
    table: 'Mesa 1',
    specialMessage: 'Querida famiglia, vuestro amor y tradiciones italianas han enriquecido nuestra historia. ¡Será mágico teneros con nosotros!',
    dietaryRestrictions: ['sin lactosa'],
    isConfirmed: true,
    confirmedGuests: 4,
    notes: 'Familia italiana de Isabella - Premium'
  },
  {
    id: 'guest-304',
    name: 'Dr. Catherine Morrison Premium',
    email: 'catherine.morrison.premium@email.com',
    phone: '+52 646 200-3009',
    allowedGuests: 2,
    guestType: 'work',
    table: 'Mesa 5',
    specialMessage: 'Dr. Morrison, vuestra mentoría ha sido fundamental en nuestro crecimiento profesional. Será un privilegio teneros en nuestra boda.',
    isConfirmed: false,
    notes: 'Mentora académica - Profesora de la Sorbona - Premium'
  },
  {
    id: 'guest-305',
    name: 'Valeria Santoro',
    email: 'valeria.santoro@email.com',
    phone: '+52 55 4567-8901',
    allowedGuests: 1,
    guestType: 'friends',
    table: 'Mesa 4',
    specialMessage: 'Valeria, tu amistad y tu arte han sido una inspiración. ¡Esperamos que compartas este momento especial con nosotros!',
    isConfirmed: true,
    confirmedGuests: 1,
    notes: 'Artista amiga - Galerista'
  },
  {
    id: 'guest-306',
    name: 'Maestro Antonio Silva',
    email: 'antonio.silva@email.com',
    phone: '+52 55 5678-9012',
    allowedGuests: 2,
    guestType: 'vip',
    table: 'Mesa Principal',
    specialMessage: 'Maestro Silva, vuestro talento y sabiduría artística han sido fundamentales en nuestro crecimiento. Será un honor teneros en nuestra boda.',
    dietaryRestrictions: ['vegetariano'],
    isConfirmed: false,
    notes: 'Mentor artístico - VIP'
  }
];

// Invitados para Roberto & Patricia (Corporate Theme)
export const mockGuestsCorporate: GuestInfo[] = [
  {
    id: 'guest-401',
    name: 'Sr. Fernando Ruiz',
    email: 'fernando.ruiz@corporate.com',
    phone: '+52 55 1111-2222',
    allowedGuests: 2,
    guestType: 'family',
    table: 'Mesa Ejecutiva - Familia',
    specialMessage: 'Sr. Ruiz, como miembro de la familia, tu presencia es fundamental en este día tan especial. ¡Te esperamos con mucho amor!',
    isConfirmed: true,
    confirmedGuests: 1,
    notes: 'Padrino de Roberto - Familia VIP'
  },
  {
    id: 'guest-402',
    name: 'Dra. Ana María García',
    email: 'ana.garcia@enterprise.com',
    phone: '+52 55 2233-4455',
    allowedGuests: 1,
    guestType: 'friends',
    table: 'Mesa Profesional - Colegas',
    specialMessage: 'Dra. García, tu amistad y tu experiencia han sido una inspiración. ¡Será un honor tenerte en nuestra boda!',
    isConfirmed: true,
    confirmedGuests: 1,
    notes: 'Amiga de Roberto - Empresa'
  },
  {
    id: 'guest-403',
    name: 'Lic. Miguel Hernández',
    email: 'miguel.hernandez@business.com',
    phone: '+52 55 3344-5566',
    allowedGuests: 2,
    guestType: 'work',
    table: 'Mesa Corporativa - Directivos',
    specialMessage: 'Lic. Hernández, ha sido un honor trabajar con usted. Esperamos que pueda acompañarnos en este día tan importante.',
    isConfirmed: false,
    notes: 'Jefe de Roberto'
  },
  {
    id: 'guest-404',
    name: 'CEO María Fernanda López',
    email: 'mf.lopez@global.com',
    phone: '+52 55 4455-6677',
    allowedGuests: 1,
    guestType: 'vip',
    table: 'Mesa VIP - Socios Estratégicos',
    specialMessage: 'CEO López, vuestra experiencia y liderazgo han sido fundamentales. Esperamos que honréis nuestra celebración con vuestra presencia.',
    isConfirmed: true,
    confirmedGuests: 1,
    notes: 'Líder de la empresa - Socios'
  },
  {
    id: 'guest-405',
    name: 'Dir. Comercial Ricardo Silva',
    email: 'ricardo.silva@innovation.com',
    phone: '+52 55 5566-7788',
    allowedGuests: 2,
    guestType: 'work',
    table: 'Mesa Profesional - Colegas',
    specialMessage: 'Dir. Silva, vuestra experiencia y liderazgo han sido fundamentales. Esperamos que honréis nuestra celebración con vuestra presencia.',
    isConfirmed: true,
    confirmedGuests: 2,
    notes: 'Líder de la empresa - Colegas'
  },
  {
    id: 'guest-406',
    name: 'CFO Patricia Morrison Sr.',
    email: 'patricia.senior@finance.com',
    phone: '+52 55 6677-8899',
    allowedGuests: 1,
    guestType: 'family',
    table: 'Mesa Ejecutiva - Familia',
    specialMessage: 'CFO Morrison, eres el corazón de nuestra familia. Tu bendición y tu presencia harán que este día sea perfecto.',
    isConfirmed: true,
    confirmedGuests: 1,
    notes: 'Abuela de Roberto - Familia VIP'
  }
];

// Mapeo de invitados por boda
export const guestsByWedding: Record<string, GuestInfo[]> = {
  'maria-carlos-2025': mockGuestsMariaCarlos,
  'ana-luis-2025': mockGuestsAnaLuis,
  'isabella-alexander-2025': mockGuestsLuxury,
  'valentina-sebastian-2025': mockGuestsPremium,
  'roberto-patricia-2025': mockGuestsCorporate,
};

// Mocks de invitaciones completas
export const mockInvitationMariaCarlos: WeddingInvitation[] = mockGuestsMariaCarlos.map(guest => ({
  wedding: mockWeddingMariaCarlos,
  guest,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z'
}));

export const mockInvitationAnaLuis: WeddingInvitation[] = mockGuestsAnaLuis.map(guest => ({
  wedding: mockWeddingAnaLuis,
  guest,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z'
}));

export const mockInvitationLuxury: WeddingInvitation[] = mockGuestsLuxury.map(guest => ({
  wedding: mockWeddingLuxury,
  guest,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z'
}));

export const mockInvitationPremium: WeddingInvitation[] = mockGuestsPremium.map(guest => ({
  wedding: mockWeddingPremium,
  guest,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z'
}));

export const mockInvitationCorporate: WeddingInvitation[] = mockGuestsCorporate.map(guest => ({
  wedding: mockWeddingCorporate,
  guest,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z'
}));

// Mapa de invitaciones disponibles
export const mockInvitations: Record<string, WeddingInvitation[]> = {
  'maria-carlos-2025': mockInvitationMariaCarlos,
  'ana-luis-2025': mockInvitationAnaLuis,
  'isabella-alexander-2025': mockInvitationLuxury,
  'valentina-sebastian-2025': mockInvitationPremium,
  'roberto-patricia-2025': mockInvitationCorporate
};

// Función para obtener invitación específica
export const getMockInvitation = (weddingId: string, guestId: string): WeddingInvitation | null => {
  const weddingInvitations = mockInvitations[weddingId];
  if (!weddingInvitations) return null;
  
  return weddingInvitations.find(invitation => invitation.guest.id === guestId) || null;
};

// Función para obtener todas las invitaciones de una boda
export const getMockInvitationsByWedding = (weddingId: string): WeddingInvitation[] => {
  return mockInvitations[weddingId] || [];
};

// Lista de IDs de invitaciones disponibles para desarrollo
export const getAvailableInvitationIds = (): { weddingId: string; guestId: string; guestName: string }[] => {
  const invitations: { weddingId: string; guestId: string; guestName: string }[] = [];
  
  Object.keys(mockInvitations).forEach(weddingId => {
    mockInvitations[weddingId].forEach(invitation => {
      invitations.push({
        weddingId,
        guestId: invitation.guest.id,
        guestName: invitation.guest.name
      });
    });
  });
  
  return invitations;
}; 