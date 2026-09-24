'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { XCircle } from 'lucide-react';
import { rsvpService } from '../../../../../services/rsvpService';
import { FirebaseRSVP } from '../../../../../src/types/wedding';
import { AdminButton, manrope, displayFont } from '../../../../../components/admin/ui';
import AuthGuard from '../../../../../components/admin/AuthGuard';

interface AdminStats {
  total: number;
  attending: number;
  notAttending: number;
}

const AdminConfirmationsContent = () => {
  const params = useParams();
  const weddingId = params.weddingId as string;
  
  const [rsvps, setRsvps] = useState<FirebaseRSVP[]>([]);
  const [stats, setStats] = useState<AdminStats>({ total: 0, attending: 0, notAttending: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'attending' | 'not-attending'>('all');

  // Cargar confirmaciones al montar el componente
  useEffect(() => {
    const loadConfirmations = async () => {
      if (!weddingId) {
        setError('ID de boda no proporcionado');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Obtener confirmaciones
        const confirmations = await rsvpService.getWeddingRSVPs(weddingId);
        
        // Calcular estadísticas manualmente
        const statistics = {
          total: confirmations.length,
          attending: confirmations.filter(r => r.attending).length,
          notAttending: confirmations.filter(r => !r.attending).length
        };

        setRsvps(confirmations);
        setStats(statistics);

      } catch (err) {
        console.error('Error cargando confirmaciones:', err);
        setError('Error al cargar las confirmaciones de asistencia');
      } finally {
        setIsLoading(false);
      }
    };

    loadConfirmations();
  }, [weddingId]);

  // Filtrar confirmaciones
  const filteredRsvps = rsvps.filter(rsvp => {
    const matchesSearch = rsvp.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rsvp.guestEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'attending' && rsvp.attending) ||
                         (filterStatus === 'not-attending' && !rsvp.attending);
    
    return matchesSearch && matchesFilter;
  });

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Exportar a CSV
  const exportToCSV = () => {
    const headers = ['Nombre', 'Email', 'Asiste', 'Número de Invitados', 'Nombre Acompañante', 'Mensaje', 'Fecha Confirmación'];
    const csvData = filteredRsvps.map(rsvp => [
      rsvp.guestName,
      rsvp.guestEmail,
      rsvp.attending ? 'Sí' : 'No',
      rsvp.guestCount || 1,
      rsvp.plusOne?.name || '',
      rsvp.message || '',
      formatDate(rsvp.submittedAt)
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `confirmaciones-${weddingId}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center" style={manrope}>
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-2 border-[rgba(0,0,0,0.14)] border-t-[#111111] rounded-full mx-auto mb-4"></div>
          <p className="text-[#3F3F46] font-medium">Cargando confirmaciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center" style={manrope}>
        <div className="text-center max-w-md mx-auto p-8">
          <XCircle className="w-16 h-16 text-[#B91C1C] mx-auto mb-4" />
          <h2 className="text-2xl text-[#0A0A0A] mb-2" style={displayFont}>Error</h2>
          <p className="text-[#3F3F46] mb-6">{error}</p>
          <AdminButton onClick={() => window.location.reload()}>Reintentar</AdminButton>
        </div>
      </div>
    );
  }

  // Obtener nombre de la boda más elegante
  const getWeddingTitle = (id: string) => {
    switch (id) {
      case 'friends-test':
        return 'Confirmación de invitados';
      case 'maria-carlos-2025':
        return 'María & Carlos';
      default:
        return id.replace('-', ' & ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]" style={manrope}>
      {/* Header */}
      <div className="bg-white border-b border-[rgba(0,0,0,0.08)]">
        <div className="max-w-4xl mx-auto px-6 md:px-8 py-12 md:py-16">
          <div className="text-center">
            <h1 className="text-[#0A0A0A] mb-4 tracking-tight" style={{ ...displayFont, fontSize: 'clamp(1.8rem, 5vw, 3.75rem)' }}>
              {getWeddingTitle(weddingId)}
            </h1>
            <div className="w-24 h-px bg-[rgba(0,0,0,0.14)] mx-auto mb-6"></div>
            <p className="text-lg text-[#3F3F46] font-light tracking-wide">
              Panel de Confirmaciones
            </p>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-3 gap-8 md:gap-12 max-w-lg mx-auto mt-12 md:mt-16">
            <div className="text-center">
              <div className="text-[#0A0A0A] mb-2" style={{ ...displayFont, fontSize: 'clamp(1.5rem, 4vw, 2.25rem)' }}>{stats.total}</div>
              <div className="text-xs text-[#71717A] uppercase tracking-widest font-medium">Total</div>
            </div>
            <div className="text-center">
              <div className="text-[#15803D] mb-2" style={{ ...displayFont, fontSize: 'clamp(1.5rem, 4vw, 2.25rem)' }}>{stats.attending}</div>
              <div className="text-xs text-[#71717A] uppercase tracking-widest font-medium">Asisten</div>
            </div>
            <div className="text-center">
              <div className="text-[#B91C1C] mb-2" style={{ ...displayFont, fontSize: 'clamp(1.5rem, 4vw, 2.25rem)' }}>{stats.notAttending}</div>
              <div className="text-xs text-[#71717A] uppercase tracking-widest font-medium">Ausentes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="max-w-4xl mx-auto px-6 md:px-8 py-8 md:py-12">
        <div className="flex flex-col gap-6 mb-8 md:mb-12">
          {/* Búsqueda */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar invitado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border-0 border-b border-[rgba(0,0,0,0.2)] bg-transparent focus:border-[#111111] focus:outline-none transition-colors text-[#0A0A0A] placeholder-[#71717A]"
            />
          </div>

          {/* Filtros y Exportar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'attending' | 'not-attending')}
              className="border-0 border-b border-[rgba(0,0,0,0.2)] bg-transparent focus:border-[#111111] focus:outline-none transition-colors text-[#3F3F46] py-2"
            >
              <option value="all">Todos</option>
              <option value="attending">Asisten</option>
              <option value="not-attending">Ausentes</option>
            </select>

            <button
              onClick={exportToCSV}
              className="px-6 py-2 text-[#3F3F46] border border-[rgba(0,0,0,0.2)] hover:border-[#111111] hover:text-[#111111] transition-colors text-sm tracking-wide uppercase font-medium self-start sm:self-auto rounded-full"
            >
              Exportar
            </button>
          </div>
        </div>

        {/* Lista de Confirmaciones */}
        <div className="bg-white">
          {filteredRsvps.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-6xl text-[#D4D4D8] mb-6">∅</div>
              <h3 className="text-2xl text-[#3F3F46] mb-3" style={displayFont}>
                {searchTerm || filterStatus !== 'all' ? 'Sin resultados' : 'Sin confirmaciones'}
              </h3>
              <p className="text-[#71717A] font-light">
                {searchTerm || filterStatus !== 'all'
                  ? 'Ajusta los filtros de búsqueda'
                  : 'Las confirmaciones aparecerán aquí'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-6 md:space-y-0">
              {filteredRsvps.map((rsvp, index) => (
                <div
                  key={rsvp.id}
                  className={`
                    md:border-b md:border-[rgba(0,0,0,0.06)] md:py-8 md:px-0 md:hover:bg-[#FAFAFA] transition-colors
                    relative bg-white border border-[rgba(0,0,0,0.08)] rounded-xl p-8 shadow-sm hover:shadow-md transition-all duration-200
                    md:bg-transparent md:border-0 md:rounded-none md:p-0 md:shadow-none md:hover:shadow-none md:relative
                    ${index === 0 ? 'md:border-t' : ''}
                  `}
                >
                  {/* Diseño móvil (tarjetas) */}
                  <div className="block md:hidden">
                    {/* Badge de estado posicionado absolutamente */}
                    <div className={`absolute top-0 right-0 px-4 py-2 text-sm font-medium ${
                      rsvp.attending
                        ? 'bg-[rgba(21,128,61,0.1)] text-[#15803D] border-l border-b border-[rgba(21,128,61,0.3)]'
                        : 'bg-[rgba(185,28,28,0.08)] text-[#B91C1C] border-l border-b border-[rgba(185,28,28,0.25)]'
                    }`} style={{ borderBottomLeftRadius: '0.75rem' }}>
                      {rsvp.attending ? '✓ Asiste' : '✗ Ausente'}
                    </div>

                    {/* Header con nombre */}
                    <div className="mb-6 pr-24">
                      <h3 className="text-xl text-[#0A0A0A] mb-2" style={displayFont}>{rsvp.guestName}</h3>
                      <p className="text-[#71717A] text-sm">{rsvp.guestEmail}</p>
                    </div>

                    {/* Información en filas */}
                    <div className="space-y-1">
                                    {/* Número de invitados */}
              <div className="flex items-center justify-between py-4 border-b border-[rgba(0,0,0,0.06)]">
                <span className="text-[#3F3F46] font-medium">Número de invitados</span>
                <div className="text-right">
                  <div className="text-sm font-medium text-[#0A0A0A]">
                    {rsvp.guestCount || 1} {rsvp.guestCount === 1 ? 'persona' : 'personas'}
                  </div>
                  {rsvp.plusOne && rsvp.plusOne.name && (
                    <div className="text-xs text-[#3F3F46] mt-1 font-medium">Acompañante: {rsvp.plusOne.name}</div>
                  )}
                </div>
              </div>

                      {/* Fecha */}
                      <div className="flex items-center justify-between py-4 border-b border-[rgba(0,0,0,0.06)]">
                        <span className="text-[#3F3F46] font-medium">Confirmado</span>
                        <span className="text-[#0A0A0A] text-sm font-medium">{formatDate(rsvp.submittedAt)}</span>
                      </div>

                      {/* Mensaje */}
                      {rsvp.message && (
                        <div className="pt-5">
                          <div className="text-[#3F3F46] font-medium mb-4">Mensaje</div>
                          <div className="bg-[#FAFAFA] rounded-xl p-5 border border-[rgba(0,0,0,0.06)]">
                            <p className="text-[#27272A] text-sm leading-relaxed italic font-light">&ldquo;{rsvp.message}&rdquo;</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Diseño desktop (lista) */}
                  <div className="hidden md:flex md:flex-col md:gap-4 lg:flex-row lg:items-center lg:justify-between">
                    {/* Información del invitado */}
                    <div className="flex-1">
                      <h3 className="text-xl text-[#0A0A0A] mb-1" style={displayFont}>{rsvp.guestName}</h3>
                      <p className="text-[#71717A] text-sm">{rsvp.guestEmail}</p>
                      {rsvp.message && (
                        <p className="text-[#3F3F46] italic text-sm mt-2 max-w-md">&ldquo;{rsvp.message}&rdquo;</p>
                      )}
                    </div>

                    {/* Estado y detalles */}
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8">
                      {/* Número de invitados */}
                      <div className="text-center lg:text-left">
                        <div className="text-xs text-[#71717A] uppercase tracking-widest mb-1">Invitados</div>
                        <div>
                          <div className="text-sm font-medium text-[#0A0A0A]">
                            {rsvp.guestCount || 1} {rsvp.guestCount === 1 ? 'persona' : 'personas'}
                          </div>
                          {rsvp.plusOne && rsvp.plusOne.name && (
                            <div className="text-xs text-[#3F3F46] mt-1">+ {rsvp.plusOne.name}</div>
                          )}
                        </div>
                      </div>

                      {/* Estado principal */}
                      <div className="text-center">
                        <div className="text-xs text-[#71717A] uppercase tracking-widest mb-1">Estado</div>
                        <div className={`text-lg ${
                          rsvp.attending ? 'text-[#15803D]' : 'text-[#B91C1C]'
                        }`} style={displayFont}>
                          {rsvp.attending ? 'Asiste' : 'Ausente'}
                        </div>
                      </div>

                      {/* Fecha */}
                      <div className="text-center lg:text-right">
                        <div className="text-xs text-[#71717A] uppercase tracking-widest mb-1">Confirmado</div>
                        <div className="text-sm text-[#3F3F46]">{formatDate(rsvp.submittedAt)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resumen al final */}
        {filteredRsvps.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-[#71717A] font-light">
              Mostrando {filteredRsvps.length} de {rsvps.length} confirmaciones
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const AdminConfirmationsPage = () => {
  const params = useParams();
  return (
    <AuthGuard weddingId={params.weddingId as string}>
      <AdminConfirmationsContent />
    </AuthGuard>
  );
};

export default AdminConfirmationsPage;
