// Servicio para integración con Spotify Web API
import { ApiResponse } from '../types/wedding';

// Configuración de Spotify
const SPOTIFY_CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

// Tipos para respuestas de Spotify
export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string; width: number; height: number }>;
  };
  duration_ms: number;
  preview_url: string | null;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: Array<{ url: string; width: number; height: number }>;
  tracks: {
    total: number;
  };
  external_urls: {
    spotify: string;
  };
}

// Cache para token de acceso
let accessToken: string | null = null;
let tokenExpiration: number = 0;

export class SpotifyApiService {
  // Obtener token de acceso usando Client Credentials Flow
  static async getAccessToken(): Promise<string | null> {
    // Verificar si el token actual sigue siendo válido
    if (accessToken && Date.now() < tokenExpiration) {
      return accessToken;
    }

    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
      console.error('Spotify credentials not configured');
      return null;
    }

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
        },
        body: 'grant_type=client_credentials',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      accessToken = data.access_token;
      tokenExpiration = Date.now() + (data.expires_in * 1000) - 60000; // 1 minuto de buffer

      return accessToken;
    } catch (error) {
      console.error('Error getting Spotify access token:', error);
      return null;
    }
  }

  // Obtener información de una canción
  static async getTrack(trackId: string): Promise<ApiResponse<SpotifyTrack>> {
    try {
      const token = await this.getAccessToken();
      if (!token) {
        return {
          success: false,
          error: 'No se pudo obtener token de acceso de Spotify',
          message: 'Error de autenticación con Spotify'
        };
      }

      const response = await fetch(`${SPOTIFY_API_BASE}/tracks/${trackId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const track = await response.json();
      return {
        success: true,
        data: track,
        message: 'Información de canción obtenida exitosamente'
      };
    } catch (error) {
      console.error('Error fetching Spotify track:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        message: 'Error al obtener información de la canción'
      };
    }
  }

  // Obtener información de una playlist
  static async getPlaylist(playlistId: string): Promise<ApiResponse<SpotifyPlaylist>> {
    try {
      const token = await this.getAccessToken();
      if (!token) {
        return {
          success: false,
          error: 'No se pudo obtener token de acceso de Spotify',
          message: 'Error de autenticación con Spotify'
        };
      }

      const response = await fetch(`${SPOTIFY_API_BASE}/playlists/${playlistId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const playlist = await response.json();
      return {
        success: true,
        data: playlist,
        message: 'Información de playlist obtenida exitosamente'
      };
    } catch (error) {
      console.error('Error fetching Spotify playlist:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        message: 'Error al obtener información de la playlist'
      };
    }
  }

  // Validar que un track ID existe
  static async validateTrackId(trackId: string): Promise<boolean> {
    const result = await this.getTrack(trackId);
    return result.success;
  }

  // Validar que un playlist ID existe
  static async validatePlaylistId(playlistId: string): Promise<boolean> {
    const result = await this.getPlaylist(playlistId);
    return result.success;
  }

  // Extraer ID de Spotify desde URL
  static extractSpotifyId(url: string): { type: 'track' | 'playlist' | null; id: string | null } {
    try {
      // Patrones para URLs de Spotify
      const trackPattern = /(?:https?:\/\/)?(?:open\.)?spotify\.com\/track\/([a-zA-Z0-9]+)/;
      const playlistPattern = /(?:https?:\/\/)?(?:open\.)?spotify\.com\/playlist\/([a-zA-Z0-9]+)/;

      const trackMatch = url.match(trackPattern);
      if (trackMatch) {
        return { type: 'track', id: trackMatch[1] };
      }

      const playlistMatch = url.match(playlistPattern);
      if (playlistMatch) {
        return { type: 'playlist', id: playlistMatch[1] };
      }

      return { type: null, id: null };
    } catch (error) {
      console.error('Error extracting Spotify ID:', error);
      return { type: null, id: null };
    }
  }
}

// Funciones de utilidad exportadas
export const spotifyApi = {
  getTrack: (trackId: string) => SpotifyApiService.getTrack(trackId),
  getPlaylist: (playlistId: string) => SpotifyApiService.getPlaylist(playlistId),
  validateTrackId: (trackId: string) => SpotifyApiService.validateTrackId(trackId),
  validatePlaylistId: (playlistId: string) => SpotifyApiService.validatePlaylistId(playlistId),
  extractSpotifyId: (url: string) => SpotifyApiService.extractSpotifyId(url),
};

export default spotifyApi;
