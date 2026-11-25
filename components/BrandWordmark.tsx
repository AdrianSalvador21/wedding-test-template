import { L, fraunces } from '../lib/brand';

// Logotipo "invyta": el mismo de la barra de la landing (components/landing/Nav.tsx) —
// Fraunces 600, tracking -0.02em, carbón de marca. Lo usan el panel y las pantallas de cuenta
// para que la marca se vea igual en todo el producto. El tamaño va en `className`.
export default function BrandWordmark({ className = 'text-xl' }: { className?: string }) {
  return (
    <span className={`font-semibold tracking-[-0.02em] ${className}`} style={{ ...fraunces, color: L.charcoal }}>
      invyta
    </span>
  );
}
