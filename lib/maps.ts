// Link de búsqueda de Google Maps (sin API): permite verificar en un clic que un
// negocio sugerido por la IA existe en la zona.
export function buildMapsSearchUrl(name: string, address: string): string {
  const query = [name, address].filter(Boolean).join(' ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
