import { fraunces, manrope } from '../lib/brand';
import { whatsappUrl } from '../lib/contact';

// Next responde 404 y agrega `noindex` automáticamente a esta página.
export const metadata = {
  title: 'Página no encontrada | Invyta',
};

export default function NotFound() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center gap-5 px-6 text-center bg-[#FBF7F1]"
      style={manrope}
    >
      <span className="text-[13px] font-bold tracking-[3px] uppercase text-[#AE5730]">Error 404</span>
      <h1 className="text-4xl md:text-5xl leading-[1.1] tracking-tight text-[#211D19]" style={fraunces}>
        No encontramos esta página
      </h1>
      <p className="text-lg text-[#5A534B] leading-relaxed max-w-[520px]">
        La dirección no existe o cambió de lugar. Puedes volver al inicio o escribirnos por WhatsApp.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
        <a
          href="/"
          className="inline-flex items-center justify-center rounded-full px-8 h-14 text-[15px] font-semibold bg-[#AE5730] text-[#FBF7F1]"
        >
          Ir al inicio
        </a>
        <a
          href={whatsappUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-full px-8 h-14 text-[15px] font-semibold bg-[#211D19] text-[#FBF7F1]"
        >
          Escribirnos por WhatsApp
        </a>
      </div>
    </main>
  );
}
