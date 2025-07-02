import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "María & Carlos - Invitación de Boda",
  description: "Nos casamos el 21 de noviembre de 2025. Acompáñanos en este día tan especial.",
  keywords: ["boda", "invitación", "wedding", "María", "Carlos", "21 de noviembre", "2025"],
  authors: [{ name: "María & Carlos" }],
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

export default function LocaleLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
} 