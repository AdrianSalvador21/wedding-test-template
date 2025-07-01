import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quetzalia & Adrián - Invitación de Boda",
  description: "Nos casamos el 21 de noviembre de 2025. Acompáñanos en este día tan especial lleno de amor y alegría.",
  keywords: ["boda", "invitación", "wedding", "Quetzalia", "Adrián", "21 de noviembre", "2025"],
  authors: [{ name: "Quetzalia & Adrián" }],
  openGraph: {
    title: "Quetzalia & Adrián - Invitación de Boda",
    description: "Nos casamos el 21 de noviembre de 2025. Acompáñanos en este día tan especial.",
    type: "website",
    locale: "es_ES",
    url: "https://quetzalia-adrian-wedding.vercel.app",
    siteName: "Boda Quetzalia & Adrián",
    images: [
      {
        url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=630&q=80",
        width: 1200,
        height: 630,
        alt: "Quetzalia & Adrián - Invitación de Boda",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Quetzalia & Adrián - Invitación de Boda",
    description: "Nos casamos el 21 de noviembre de 2025. Acompáñanos en este día tan especial.",
    images: ["https://images.unsplash.com/photo-1583939003579-730e3918a45a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=630&q=80"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className="font-body text-text bg-light antialiased">
        {children}
      </body>
    </html>
  );
} 