import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Invitación de Boda Digital",
  description: "Una experiencia digital única para celebrar momentos especiales. Diseño elegante y personalizado para tu día perfecto.",
  keywords: ["boda", "invitación digital", "wedding", "celebración", "amor", "matrimonio"],
  authors: [{ name: "Wedding Invitations" }],
  robots: {
    index: false,
    follow: false,
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