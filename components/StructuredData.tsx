import JsonLd from './seo/JsonLd';
import { organizationSchema, websiteSchema } from '../lib/seo-schema';

// Datos estructurados de la landing (spec 10): solo Organization y WebSite con
// hechos verificados. El FAQPage vive únicamente en /preguntas-frecuentes, y
// los precios (Service + Offer) en /paquetes.
export default function StructuredData() {
  return <JsonLd data={[organizationSchema(), websiteSchema()]} />;
}
