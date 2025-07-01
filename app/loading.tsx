export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-light">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-text font-body">Cargando nuestra invitación...</p>
      </div>
    </div>
  );
} 