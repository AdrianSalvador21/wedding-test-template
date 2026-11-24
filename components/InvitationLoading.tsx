'use client';

// Pantalla de carga de la invitación. Es la misma mientras llegan los datos de la boda
// (WeddingTemplate) y mientras se precarga la foto del save the date (spec 27), para que el
// paso de una a otra no se note.
export default function InvitationLoading({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-primary-800 font-medium">{message}</p>
      </div>
    </div>
  );
}
