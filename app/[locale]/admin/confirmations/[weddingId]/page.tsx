'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Users, Calendar, CheckCircle, XCircle, Download, Filter, Search } from 'lucide-react';
import { rsvpService } from '../../../../../services/rsvpService';
import { FirebaseRSVP } from '../../../../../src/types/wedding';

interface AdminStats {
  total: number;
  attending: number;
  notAttending: number;
}

const AdminConfirmationsPage = () => {
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
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-stone-300 border-t-stone-600 rounded-full mx-auto mb-4"></div>
          <p className="text-stone-600 font-medium">Cargando confirmaciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-stone-800 mb-2">Error</h2>
          <p className="text-stone-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-stone-600 text-white rounded-lg hover:bg-stone-700 transition-colors"
          >
            Reintentar
          </button>
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
    <div className="min-h-screen bg-stone-50">
      {/* Header Minimalista y Elegante */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-6 md:px-8 py-12 md:py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-extralight text-stone-900 mb-4 tracking-tight" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.8rem, 5vw, 3.75rem)' }}>
              {getWeddingTitle(weddingId)}
            </h1>
            <div className="w-24 h-px bg-stone-300 mx-auto mb-6"></div>
            <p className="text-lg text-stone-600 font-light tracking-wide">
              Panel de Confirmaciones
            </p>
          </div>
          
          {/* Estadísticas Minimalistas */}
          <div className="grid grid-cols-3 gap-8 md:gap-12 max-w-lg mx-auto mt-12 md:mt-16">
            <div className="text-center">
              <div className="text-2xl md:text-4xl font-extralight text-stone-900 mb-2" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)' }}>{stats.total}</div>
              <div className="text-xs text-stone-500 uppercase tracking-widest font-medium">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-4xl font-extralight text-emerald-700 mb-2" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)' }}>{stats.attending}</div>
              <div className="text-xs text-stone-500 uppercase tracking-widest font-medium">Asisten</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-4xl font-extralight text-stone-400 mb-2" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)' }}>{stats.notAttending}</div>
              <div className="text-xs text-stone-500 uppercase tracking-widest font-medium">Ausentes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controles Minimalistas */}
      <div className="max-w-4xl mx-auto px-6 md:px-8 py-8 md:py-12">
        <div className="flex flex-col gap-6 mb-8 md:mb-12">
          {/* Búsqueda */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar invitado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border-0 border-b border-stone-300 bg-transparent focus:border-stone-900 focus:outline-none transition-colors text-stone-900 placeholder-stone-400"
            />
          </div>

          {/* Filtros y Exportar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="border-0 border-b border-stone-300 bg-transparent focus:border-stone-900 focus:outline-none transition-colors text-stone-700 py-2"
            >
              <option value="all">Todos</option>
              <option value="attending">Asisten</option>
              <option value="not-attending">Ausentes</option>
            </select>

            <button
              onClick={exportToCSV}
              className="px-6 py-2 text-stone-700 border border-stone-300 hover:border-stone-900 hover:text-stone-900 transition-colors text-sm tracking-wide uppercase font-medium self-start sm:self-auto"
            >
              Exportar
            </button>
          </div>
        </div>

        {/* Lista Minimalista de Confirmaciones */}
        <div className="bg-white">
          {filteredRsvps.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-6xl font-extralight text-stone-300 mb-6">∅</div>
              <h3 className="text-2xl font-extralight text-stone-600 mb-3" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                {searchTerm || filterStatus !== 'all' ? 'Sin resultados' : 'Sin confirmaciones'}
              </h3>
              <p className="text-stone-400 font-light">
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
                    md:border-b md:border-stone-100 md:py-8 md:px-0 md:hover:bg-stone-50/50 transition-colors
                    relative bg-white border border-stone-200/60 rounded-xl p-8 shadow-sm hover:shadow-md transition-all duration-200
                    md:bg-transparent md:border-0 md:rounded-none md:p-0 md:shadow-none md:hover:shadow-none md:relative
                    ${index === 0 ? 'md:border-t' : ''}
                  `}
                >
                  {/* Diseño móvil (tarjetas) */}
                  <div className="block md:hidden">
                    {/* Badge de estado posicionado absolutamente */}
                    <div className={`absolute top-0 right-0 px-4 py-2 text-sm font-medium ${
                      rsvp.attending 
                        ? 'bg-emerald-100 text-emerald-800 border-l border-b border-emerald-200' 
                        : 'bg-stone-100 text-stone-700 border-l border-b border-stone-200'
                    }`} style={{ borderBottomLeftRadius: '0.75rem' }}>
                      {rsvp.attending ? '✓ Asiste' : '✗ Ausente'}
                    </div>

                    {/* Header con nombre */}
                    <div className="mb-6 pr-24">
                      <h3 className="text-xl font-light text-stone-900 mb-2">{rsvp.guestName}</h3>
                      <p className="text-stone-500 text-sm">{rsvp.guestEmail}</p>
                    </div>

                    {/* Información en filas */}
                    <div className="space-y-1">
                                    {/* Número de invitados */}
              <div className="flex items-center justify-between py-4 border-b border-stone-100/80">
                <span className="text-stone-600 font-medium">Número de invitados</span>
                <div className="text-right">
                  <div className="text-sm font-medium text-stone-700">
                    {rsvp.guestCount || 1} {rsvp.guestCount === 1 ? 'persona' : 'personas'}
                  </div>
                  {rsvp.plusOne && rsvp.plusOne.name && (
                    <div className="text-xs text-stone-600 mt-1 font-medium">Acompañante: {rsvp.plusOne.name}</div>
                  )}
                </div>
              </div>

                      {/* Fecha */}
                      <div className="flex items-center justify-between py-4 border-b border-stone-100/80">
                        <span className="text-stone-600 font-medium">Confirmado</span>
                        <span className="text-stone-700 text-sm font-medium">{formatDate(rsvp.submittedAt)}</span>
                      </div>

                      {/* Mensaje */}
                      {rsvp.message && (
                        <div className="pt-5">
                          <div className="text-stone-600 font-medium mb-4">Mensaje</div>
                          <div className="bg-stone-50/80 rounded-xl p-5 border border-stone-100">
                            <p className="text-stone-700 text-sm leading-relaxed italic font-light">"{rsvp.message}"</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Diseño desktop (lista) */}
                  <div className="hidden md:flex md:flex-col md:gap-4 lg:flex-row lg:items-center lg:justify-between">
                    {/* Información del invitado */}
                    <div className="flex-1">
                      <h3 className="text-xl font-light text-stone-900 mb-1">{rsvp.guestName}</h3>
                      <p className="text-stone-500 text-sm">{rsvp.guestEmail}</p>
                      {rsvp.message && (
                        <p className="text-stone-600 italic text-sm mt-2 max-w-md">"{rsvp.message}"</p>
                      )}
                    </div>

                    {/* Estado y detalles */}
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8">
                      {/* Número de invitados */}
                      <div className="text-center lg:text-left">
                        <div className="text-xs text-stone-400 uppercase tracking-widest mb-1">Invitados</div>
                        <div>
                          <div className="text-sm font-medium text-stone-700">
                            {rsvp.guestCount || 1} {rsvp.guestCount === 1 ? 'persona' : 'personas'}
                          </div>
                          {rsvp.plusOne && rsvp.plusOne.name && (
                            <div className="text-xs text-stone-600 mt-1">+ {rsvp.plusOne.name}</div>
                          )}
                        </div>
                      </div>

                      {/* Estado principal */}
                      <div className="text-center">
                        <div className="text-xs text-stone-400 uppercase tracking-widest mb-1">Estado</div>
                        <div className={`text-lg font-light ${
                          rsvp.attending ? 'text-emerald-700' : 'text-stone-400'
                        }`}>
                          {rsvp.attending ? 'Asiste' : 'Ausente'}
                        </div>
                      </div>

                      {/* Fecha */}
                      <div className="text-center lg:text-right">
                        <div className="text-xs text-stone-400 uppercase tracking-widest mb-1">Confirmado</div>
                        <div className="text-sm text-stone-600">{formatDate(rsvp.submittedAt)}</div>
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
            <p className="text-stone-500 font-light">
              Mostrando {filteredRsvps.length} de {rsvps.length} confirmaciones
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminConfirmationsPage;
