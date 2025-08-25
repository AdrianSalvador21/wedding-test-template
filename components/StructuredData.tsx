'use client';

export default function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Invyta",
    "url": "https://invyta.com",
    "logo": "https://invyta.com/assets/landing/logo.png",
    "description": "Plataforma líder en invitaciones digitales elegantes para bodas. Crea, personaliza y gestiona invitaciones online con diseños únicos.",
    "foundingDate": "2024",
    "sameAs": [
      "https://facebook.com/invyta",
      "https://instagram.com/invyta",
      "https://twitter.com/invyta"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+52-55-74889849",
      "contactType": "customer service",
      "email": "hola@invyta.me",
      "availableLanguage": ["Spanish", "English"]
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "MX",
      "addressLocality": "México"
    }
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Invitaciones Digitales para Bodas",
    "description": "Servicio completo de creación de invitaciones digitales elegantes para bodas. Incluye diseños personalizables, gestión de invitados, RSVP en tiempo real y administración completa del evento.",
    "provider": {
      "@type": "Organization",
      "name": "Invyta",
      "url": "https://invyta.com"
    },
    "serviceType": "Invitaciones Digitales",
    "category": "Bodas y Eventos",
    "offers": [
      {
        "@type": "Offer",
        "name": "Paquete Básico",
        "description": "Invitación digital elegante con funcionalidades esenciales",
        "price": "0",
        "priceCurrency": "MXN",
        "availability": "https://schema.org/InStock"
      },
      {
        "@type": "Offer",
        "name": "Paquete Personalizado",
        "description": "Invitación digital premium con diseño personalizado y funcionalidades avanzadas",
        "priceSpecification": {
          "@type": "PriceSpecification",
          "price": "Consultar",
          "priceCurrency": "MXN"
        },
        "availability": "https://schema.org/InStock"
      }
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Catálogo de Invitaciones Digitales",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Diseño de Invitación Digital",
            "description": "Creación de invitación digital personalizada"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Gestión de Invitados",
            "description": "Sistema completo de administración de lista de invitados"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "RSVP Digital",
            "description": "Sistema de confirmación de asistencia en tiempo real"
          }
        }
      ]
    }
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Invyta",
    "url": "https://invyta.com",
    "description": "Crea invitaciones digitales elegantes para tu boda. Plataforma completa con diseños personalizables y gestión de invitados.",
    "inLanguage": "es-MX",
    "isAccessibleForFree": true,
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://invyta.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Invyta",
      "logo": {
        "@type": "ImageObject",
        "url": "https://invyta.com/assets/landing/logo.png"
      }
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Inicio",
        "item": "https://invyta.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Funcionalidades",
        "item": "https://invyta.com#funcionalidades"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Paquetes",
        "item": "https://invyta.com#paquetes"
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": "Ejemplos",
        "item": "https://invyta.com#ejemplos"
      }
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "¿Qué son las invitaciones digitales?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Las invitaciones digitales son invitaciones de boda enviadas electrónicamente a través de enlaces únicos. Incluyen toda la información del evento, RSVP digital, mapas interactivos y más funcionalidades modernas."
        }
      },
      {
        "@type": "Question",
        "name": "¿Cómo funciona Invyta?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Con Invyta puedes crear tu invitación digital personalizada, gestionar tu lista de invitados, enviar invitaciones por WhatsApp o email, y recibir confirmaciones en tiempo real. Todo desde una plataforma fácil de usar."
        }
      },
      {
        "@type": "Question",
        "name": "¿Las invitaciones digitales son ecológicas?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sí, las invitaciones digitales son 100% ecológicas ya que no requieren papel ni impresión, reduciendo significativamente el impacto ambiental de tu boda."
        }
      },
      {
        "@type": "Question",
        "name": "¿Puedo personalizar el diseño de mi invitación?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolutamente. Invyta ofrece múltiples plantillas elegantes y opciones de personalización para que tu invitación refleje perfectamente el estilo de tu boda."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}

