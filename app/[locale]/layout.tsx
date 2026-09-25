import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { locales } from "../../i18n";
import "./invitation-fonts.css";

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
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  // Sin esta validación, /favicon.ico o /cualquier.cosa coincidía con
  // app/[locale]/page.tsx y respondía 200 con HTML (soft 404).
  if (!(locales as readonly string[]).includes(params.locale)) {
    notFound();
  }

  return children;
}
