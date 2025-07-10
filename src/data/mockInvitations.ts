import { WeddingInvitation, GuestInfo } from '../types/wedding';
import { mockWeddingMariaCarlos, mockWeddingAnaLuis, mockWeddingLuxury } from './mockData';

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

// Mapa de invitaciones disponibles
export const mockInvitations: Record<string, WeddingInvitation[]> = {
  'maria-carlos-2025': mockInvitationMariaCarlos,
  'ana-luis-2025': mockInvitationAnaLuis,
  'isabella-alexander-2025': mockInvitationLuxury
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