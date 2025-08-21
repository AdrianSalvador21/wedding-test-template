'use client';

import { useState, useEffect } from 'react';
import { MusicConfig } from '../src/types/wedding';

interface SpotifyEmbedProps {
  music: MusicConfig;
  className?: string;
}

export default function SpotifyEmbed({ music, className = '' }: SpotifyEmbedProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);

  // Detectar primera interacción del usuario
  useEffect(() => {
    const handleFirstInteraction = () => {
      setUserInteracted(true);
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('scroll', handleFirstInteraction);
    };

    if (!userInteracted) {
      document.addEventListener('click', handleFirstInteraction, { passive: true });
      document.addEventListener('keydown', handleFirstInteraction, { passive: true });
      document.addEventListener('touchstart', handleFirstInteraction, { passive: true });
      document.addEventListener('scroll', handleFirstInteraction, { passive: true });
    }

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('scroll', handleFirstInteraction);
    };
  }, [userInteracted]);

  // Solo mostrar si la música está habilitada
  if (!music.enabled || (!music.spotifyTrackId && !music.spotifyPlaylistId)) {
    return null;
  }

  // Construir URL de Spotify embed
  const getSpotifyEmbedUrl = () => {
    const baseUrl = 'https://open.spotify.com/embed';
    let url = '';
    
    if (music.spotifyTrackId) {
      url = `${baseUrl}/track/${music.spotifyTrackId}`;
    } else if (music.spotifyPlaylistId) {
      url = `${baseUrl}/playlist/${music.spotifyPlaylistId}`;
    }
    
    // Parámetros adicionales
    const params = new URLSearchParams();
    params.append('utm_source', 'generator');
    params.append('theme', '0'); // Tema oscuro
    
    if (music.autoplay && userInteracted) {
      params.append('autoplay', '1');
    }
    
    if (music.startTime) {
      params.append('t', music.startTime.toString());
    }

    return `${url}?${params.toString()}`;
  };

  const handleIframeLoad = () => {
    setIsLoaded(true);
    console.log('✅ Spotify embed cargado correctamente');
  };

  const handleIframeError = () => {
    console.error('❌ Error cargando Spotify embed');
  };

  // Modo completo (si showControls es true)
  if (music.showControls) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-green-600 text-white px-4 py-2 flex items-center space-x-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            <div className="flex-1">
              <div className="text-sm font-medium">{music.title || 'Música de Boda'}</div>
              {music.artist && (
                <div className="text-xs opacity-90">{music.artist}</div>
              )}
            </div>
            <a
              href={`https://open.spotify.com/${music.spotifyTrackId ? 'track' : 'playlist'}/${music.spotifyTrackId || music.spotifyPlaylistId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-green-200 transition-colors"
              title="Abrir en Spotify"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6m4-3h6v6m-11 5L18 4"/>
              </svg>
            </a>
          </div>
          <iframe
            src={getSpotifyEmbedUrl()}
            width="300"
            height="152"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            title={`Música de fondo: ${music.title || 'Canción de boda'}`}
            className="w-full"
          />
        </div>
      </div>
    );
  }

  // Modo minimalista híbrido
  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* Iframe oculto para reproducción */}
      <iframe
        src={getSpotifyEmbedUrl()}
        width="1"
        height="1"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        title={`Música de fondo: ${music.title || 'Canción de boda'}`}
        className="opacity-0 absolute pointer-events-none"
        style={{ 
          position: 'absolute', 
          top: '-9999px', 
          left: '-9999px',
          width: '1px',
          height: '1px'
        }}
      />

      {/* Indicador visual cuando está reproduciendo */}
      {showPlayer && (
        <div className="absolute bottom-full right-0 mb-2 bg-green-600 text-white px-3 py-2 rounded-lg shadow-xl text-xs flex items-center space-x-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span>Reproduciendo: {music.title}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowPlayer(false);
            }}
            className="text-white hover:text-green-200 ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Botón minimalista */}
      <div 
        className="bg-white/95 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 p-3 flex items-center space-x-3 transition-all duration-300 hover:shadow-xl cursor-pointer"
        onClick={() => {
          setUserInteracted(true);
          setShowPlayer(true);
          
          // Activar el iframe oculto temporalmente para iniciar reproducción
          const iframe = document.querySelector('iframe[title*="Música de fondo"]') as HTMLIFrameElement;
          if (iframe) {
            // Hacer el iframe temporalmente visible e interactuable
            iframe.style.position = 'fixed';
            iframe.style.top = '50%';
            iframe.style.left = '50%';
            iframe.style.transform = 'translate(-50%, -50%)';
            iframe.style.width = '300px';
            iframe.style.height = '152px';
            iframe.style.opacity = '1';
            iframe.style.pointerEvents = 'auto';
            iframe.style.zIndex = '10000';
            iframe.style.border = '2px solid #16a34a';
            iframe.style.borderRadius = '8px';
            
            // Crear overlay para cerrar
            const overlay = document.createElement('div');
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
            overlay.style.zIndex = '9999';
            overlay.style.cursor = 'pointer';
            
            overlay.onclick = () => {
              // Ocultar iframe
              iframe.style.position = 'absolute';
              iframe.style.top = '-9999px';
              iframe.style.left = '-9999px';
              iframe.style.width = '1px';
              iframe.style.height = '1px';
              iframe.style.opacity = '0';
              iframe.style.pointerEvents = 'none';
              iframe.style.zIndex = '1';
              iframe.style.transform = 'none';
              iframe.style.border = 'none';
              
              // Remover overlay
              document.body.removeChild(overlay);
            };
            
            document.body.appendChild(overlay);
            
            // Auto-cerrar después de 3 segundos
            setTimeout(() => {
              if (document.body.contains(overlay)) {
                overlay.click();
              }
            }, 3000);
          }
        }}
      >
        {/* Icono de música */}
        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        </div>

        {/* Información de la canción */}
        <div className="hidden sm:block text-xs text-gray-700 min-w-0">
          <div className="font-medium truncate">{music.title || 'Música'}</div>
          {music.artist && (
            <div className="text-gray-500 truncate">{music.artist}</div>
          )}
        </div>

        {/* Enlace a Spotify */}
        <a
          href={`https://open.spotify.com/${music.spotifyTrackId ? 'track' : 'playlist'}/${music.spotifyTrackId || music.spotifyPlaylistId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-600 hover:text-green-700 transition-colors flex-shrink-0"
          title="Abrir en Spotify"
          onClick={(e) => e.stopPropagation()}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
        </a>
      </div>

      {/* Mensaje de activación */}
      {!userInteracted && (
        <div className="absolute bottom-full right-0 mb-2 bg-black text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap">
          Click para reproducir música
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
        </div>
      )}

      {/* Debug info (solo en desarrollo) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-full right-0 mb-16 bg-black text-white text-xs p-2 rounded max-w-xs">
          <div>Track ID: {music.spotifyTrackId}</div>
          <div>Autoplay: {music.autoplay ? 'Sí' : 'No'}</div>
          <div>User Interacted: {userInteracted ? 'Sí' : 'No'}</div>
          <div>Loaded: {isLoaded ? 'Sí' : 'No'}</div>
          <div>Show Player: {showPlayer ? 'Sí' : 'No'}</div>
          <div className="mt-1 break-all">
            URL: {getSpotifyEmbedUrl()}
          </div>
        </div>
      )}
    </div>
  );
}