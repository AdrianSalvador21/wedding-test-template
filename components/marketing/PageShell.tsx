import React from 'react';
import Nav from '../landing/Nav';
import Footer from '../landing/Footer';
import { manrope } from '../../lib/brand';

// Marco común de las páginas de marketing: navegación, migas de pan, contenido y pie.
// `active` es el href de la navegación que corresponde a la página (ver components/landing/Nav.tsx).
export default function PageShell({
  active,
  crumbs,
  children,
}: {
  active: string;
  crumbs: { name: string; path?: string }[];
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FBF7F1]" style={manrope}>
      <Nav active={active} />
      <div className="pt-16 md:pt-24">
        <nav aria-label="Migas de pan" className="max-w-7xl mx-auto px-6 md:px-12 h-14 flex items-center">
          <ol className="flex flex-wrap items-center gap-2.5 text-[13px] text-[#5A534B]">
            <li>
              <a href="/" className="hover:text-[#AE5730]">
                Inicio
              </a>
            </li>
            {crumbs.map((crumb, index) => {
              const isLast = index === crumbs.length - 1;
              return (
                <li key={crumb.name} className="flex items-center gap-2.5">
                  <span aria-hidden="true">›</span>
                  {isLast || !crumb.path ? (
                    <span aria-current={isLast ? 'page' : undefined} className="font-bold text-[#211D19]">
                      {crumb.name}
                    </span>
                  ) : (
                    <a href={crumb.path} className="hover:text-[#AE5730]">
                      {crumb.name}
                    </a>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
        <main>{children}</main>
        <Footer />
      </div>
    </div>
  );
}
