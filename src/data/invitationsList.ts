import { getAvailableInvitationIds, getMockInvitation } from './mockInvitations';

// Función para mostrar todas las invitaciones disponibles
export const showAvailableInvitations = () => {
  const invitations = getAvailableInvitationIds();
  
  console.log('=== INVITACIONES DISPONIBLES ===\n');
  
  // Agrupar por boda
  const groupedInvitations: Record<string, typeof invitations> = {};
  
  invitations.forEach(invitation => {
    if (!groupedInvitations[invitation.weddingId]) {
      groupedInvitations[invitation.weddingId] = [];
    }
    groupedInvitations[invitation.weddingId].push(invitation);
  });
  
  // Mostrar cada boda con sus invitados
  Object.keys(groupedInvitations).forEach(weddingId => {
    console.log(`🎊 BODA: ${weddingId.toUpperCase()}`);
    console.log('─'.repeat(50));
    
    groupedInvitations[weddingId].forEach((invitation, index) => {
      const fullInvitation = getMockInvitation(invitation.weddingId, invitation.guestId);
      
      console.log(`${index + 1}. ${invitation.guestName}`);
      console.log(`   📧 ID: ${invitation.guestId}`);
      console.log(`   👥 Personas permitidas: ${fullInvitation?.guest.allowedGuests}`);
      console.log(`   🏷️  Tipo: ${fullInvitation?.guest.guestType}`);
      console.log(`   📝 URL: /wedding/${invitation.weddingId}/${invitation.guestId}`);
      
      if (fullInvitation?.guest.specialMessage) {
        console.log(`   💌 Mensaje: "${fullInvitation.guest.specialMessage.substring(0, 80)}..."`);
      }
      console.log('');
    });
    
    console.log('');
  });
  
  console.log('=== EJEMPLOS DE USO ===');
  console.log('Para acceder a una invitación específica:');
  console.log('• URL: /wedding/maria-carlos-2025/guest-001');
  console.log('• URL: /wedding/ana-luis-2025/guest-101');
  console.log('');
  
  return invitations;
};

// Función para obtener información detallada de una invitación
export const getInvitationDetails = (weddingId: string, guestId: string) => {
  const invitation = getMockInvitation(weddingId, guestId);
  
  if (!invitation) {
    console.log(`❌ No se encontró la invitación para: ${weddingId}/${guestId}`);
    return null;
  }
  
  console.log('=== DETALLES DE LA INVITACIÓN ===');
  console.log(`💍 Boda: ${invitation.wedding.couple.bride.name} & ${invitation.wedding.couple.groom.name}`);
  console.log(`📅 Fecha: ${new Date(invitation.wedding.event.date).toLocaleDateString('es-ES')}`);
  console.log(`👤 Invitado: ${invitation.guest.name}`);
  console.log(`👥 Personas permitidas: ${invitation.guest.allowedGuests}`);
  console.log(`🏷️  Tipo de invitado: ${invitation.guest.guestType}`);
  console.log(`📧 Email: ${invitation.guest.email || 'No disponible'}`);
  console.log(`📱 Teléfono: ${invitation.guest.phone || 'No disponible'}`);
  console.log(`🪑 Mesa: ${invitation.guest.table || 'No asignada'}`);
  console.log(`✅ Confirmado: ${invitation.guest.isConfirmed ? 'Sí' : 'No'}`);
  
  if (invitation.guest.specialMessage) {
    console.log(`💌 Mensaje personalizado:`);
    console.log(`"${invitation.guest.specialMessage}"`);
  }
  
  if (invitation.guest.dietaryRestrictions && invitation.guest.dietaryRestrictions.length > 0) {
    console.log(`🍽️  Restricciones alimentarias: ${invitation.guest.dietaryRestrictions.join(', ')}`);
  }
  
  if (invitation.guest.notes) {
    console.log(`📝 Notas: ${invitation.guest.notes}`);
  }
  
  return invitation;
};

// Exportar funciones de utilidad
export { getAvailableInvitationIds, getMockInvitation } from './mockInvitations'; 