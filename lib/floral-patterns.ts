// Patrones florales sutiles como data URIs (URL-encoded para compatibilidad con SSR)
export const floralPatterns = {
  // Patrón 1: Flores verticales con tallos largos
  pattern1: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="floralPattern1" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
      <!-- Flor lateral izquierda -->
      <g transform="translate(15,20)">
        <line x1="0" y1="0" x2="0" y2="50" stroke="#8b7355" stroke-width="0.5" opacity="0.09"/>
        <ellipse cx="0" cy="0" rx="1.5" ry="3" fill="#8b7355" opacity="0.07"/>
        <ellipse cx="0" cy="0" rx="3" ry="1.5" fill="#8b7355" opacity="0.07"/>
        <circle cx="0" cy="0" r="0.8" fill="#a67c5a" opacity="0.11"/>
        <ellipse cx="2" cy="25" rx="0.8" ry="2" fill="#8b7355" opacity="0.06" transform="rotate(45 2 25)"/>
        <ellipse cx="-2" cy="35" rx="0.8" ry="2" fill="#8b7355" opacity="0.06" transform="rotate(-45 -2 35)"/>
      </g>
      <!-- Flor lateral derecha -->
      <g transform="translate(85,60)">
        <line x1="0" y1="0" x2="0" y2="35" stroke="#8b7355" stroke-width="0.4" opacity="0.09"/>
        <ellipse cx="0" cy="0" rx="1.2" ry="2.5" fill="#8b7355" opacity="0.07"/>
        <ellipse cx="0" cy="0" rx="2.5" ry="1.2" fill="#8b7355" opacity="0.07"/>
        <circle cx="0" cy="0" r="0.6" fill="#a67c5a" opacity="0.11"/>
        <ellipse cx="1.5" cy="15" rx="0.6" ry="1.5" fill="#8b7355" opacity="0.06" transform="rotate(30 1.5 15)"/>
      </g>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#floralPattern1)"/>
</svg>
  `)}`,

  // Patrón 2: Ramitas alargadas verticales en esquinas
  pattern2: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="floralPattern2" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
      <!-- Ramita vertical izquierda -->
      <g transform="translate(10,10)">
        <path d="M0,0 Q2,15 0,30 Q-1,45 0,60" stroke="#8b7355" stroke-width="0.4" fill="none" opacity="0.09"/>
        <ellipse cx="0" cy="5" rx="0.8" ry="2.5" fill="#8b7355" opacity="0.07"/>
        <ellipse cx="2" cy="20" rx="0.6" ry="2" fill="#8b7355" opacity="0.06" transform="rotate(45 2 20)"/>
        <ellipse cx="-1" cy="35" rx="0.6" ry="2" fill="#8b7355" opacity="0.06" transform="rotate(-30 -1 35)"/>
        <ellipse cx="1" cy="50" rx="0.8" ry="2.5" fill="#8b7355" opacity="0.07"/>
        <circle cx="0" cy="5" r="0.4" fill="#a67c5a" opacity="0.11"/>
        <circle cx="1" cy="50" r="0.4" fill="#a67c5a" opacity="0.11"/>
      </g>
      <!-- Ramita vertical derecha -->
      <g transform="translate(110,40)">
        <path d="M0,0 Q-2,20 0,40 Q1,60 0,80" stroke="#8b7355" stroke-width="0.4" fill="none" opacity="0.09"/>
        <ellipse cx="0" cy="8" rx="0.8" ry="2.5" fill="#8b7355" opacity="0.07"/>
        <ellipse cx="-1.5" cy="25" rx="0.6" ry="2" fill="#8b7355" opacity="0.06" transform="rotate(-45 -1.5 25)"/>
        <ellipse cx="1" cy="45" rx="0.6" ry="2" fill="#8b7355" opacity="0.06" transform="rotate(30 1 45)"/>
        <ellipse cx="0" cy="70" rx="0.8" ry="2.5" fill="#8b7355" opacity="0.07"/>
        <circle cx="0" cy="8" r="0.4" fill="#a67c5a" opacity="0.11"/>
        <circle cx="0" cy="70" r="0.4" fill="#a67c5a" opacity="0.11"/>
      </g>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#floralPattern2)"/>
</svg>
  `)}`,

  // Patrón 3: Flores de tallo largo muy espaciadas
  pattern3: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="floralPattern3" x="0" y="0" width="150" height="150" patternUnits="userSpaceOnUse">
      <!-- Flor con tallo largo - esquina superior izquierda -->
      <g transform="translate(20,25)">
        <line x1="0" y1="0" x2="0" y2="80" stroke="#8b7355" stroke-width="0.3" opacity="0.09"/>
        <ellipse cx="0" cy="0" rx="1" ry="2" fill="#8b7355" opacity="0.07"/>
        <ellipse cx="1.5" cy="0" rx="1" ry="2" fill="#8b7355" opacity="0.07" transform="rotate(72 1.5 0)"/>
        <ellipse cx="1" cy="1.5" rx="1" ry="2" fill="#8b7355" opacity="0.07" transform="rotate(144 1 1.5)"/>
        <ellipse cx="-1" cy="1" rx="1" ry="2" fill="#8b7355" opacity="0.07" transform="rotate(216 -1 1)"/>
        <ellipse cx="-1" cy="-1" rx="1" ry="2" fill="#8b7355" opacity="0.07" transform="rotate(288 -1 -1)"/>
        <circle cx="0" cy="0" r="0.5" fill="#d4a574" opacity="0.11"/>
        <ellipse cx="2" cy="40" rx="0.5" ry="1.5" fill="#8b7355" opacity="0.06" transform="rotate(45 2 40)"/>
        <ellipse cx="-2" cy="60" rx="0.5" ry="1.5" fill="#8b7355" opacity="0.06" transform="rotate(-45 -2 60)"/>
      </g>
      <!-- Flor con tallo largo - esquina inferior derecha -->
      <g transform="translate(130,80)">
        <line x1="0" y1="0" x2="0" y2="60" stroke="#8b7355" stroke-width="0.3" opacity="0.09"/>
        <ellipse cx="0" cy="0" rx="1" ry="2" fill="#8b7355" opacity="0.07"/>
        <ellipse cx="1.5" cy="0" rx="1" ry="2" fill="#8b7355" opacity="0.07" transform="rotate(72 1.5 0)"/>
        <ellipse cx="1" cy="1.5" rx="1" ry="2" fill="#8b7355" opacity="0.07" transform="rotate(144 1 1.5)"/>
        <ellipse cx="-1" cy="1" rx="1" ry="2" fill="#8b7355" opacity="0.07" transform="rotate(216 -1 1)"/>
        <ellipse cx="-1" cy="-1" rx="1" ry="2" fill="#8b7355" opacity="0.07" transform="rotate(288 -1 -1)"/>
        <circle cx="0" cy="0" r="0.5" fill="#d4a574" opacity="0.11"/>
        <ellipse cx="1.5" cy="30" rx="0.5" ry="1.5" fill="#8b7355" opacity="0.06" transform="rotate(30 1.5 30)"/>
      </g>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#floralPattern3)"/>
</svg>
  `)}`,

  // Patrón 4: Patrón especial para card de invitación personal - muy delicado
  pattern4: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="floralPattern4" x="0" y="0" width="80" height="120" patternUnits="userSpaceOnUse">
      <!-- Ramita delicada esquina superior izquierda -->
      <g transform="translate(8,15)">
        <path d="M0,0 Q3,20 0,40 Q2,60 0,80" stroke="#8b7355" stroke-width="0.4" fill="none" opacity="0.08"/>
        <ellipse cx="0" cy="8" rx="0.6" ry="1.8" fill="#8b7355" opacity="0.09"/>
        <ellipse cx="1" cy="35" rx="0.5" ry="1.5" fill="#8b7355" opacity="0.07" transform="rotate(45 1 35)"/>
        <ellipse cx="-1" cy="65" rx="0.5" ry="1.5" fill="#8b7355" opacity="0.07" transform="rotate(-45 -1 65)"/>
        <circle cx="0" cy="8" r="0.3" fill="#d4a574" opacity="0.1"/>
      </g>
      <!-- Ramita delicada esquina inferior derecha -->
      <g transform="translate(72,25)">
        <path d="M0,0 Q-2,25 0,50 Q-1,75 0,95" stroke="#8b7355" stroke-width="0.4" fill="none" opacity="0.08"/>
        <ellipse cx="0" cy="12" rx="0.6" ry="1.8" fill="#8b7355" opacity="0.09"/>
        <ellipse cx="-1" cy="45" rx="0.5" ry="1.5" fill="#8b7355" opacity="0.07" transform="rotate(-30 -1 45)"/>
        <ellipse cx="1" cy="75" rx="0.5" ry="1.5" fill="#8b7355" opacity="0.07" transform="rotate(30 1 75)"/>
        <circle cx="0" cy="12" r="0.3" fill="#d4a574" opacity="0.1"/>
      </g>
      <!-- Elementos decorativos muy sutiles -->
      <circle cx="40" cy="20" r="0.3" fill="#8b7355" opacity="0.06"/>
      <circle cx="30" cy="90" r="0.3" fill="#8b7355" opacity="0.06"/>
      <circle cx="50" cy="110" r="0.3" fill="#8b7355" opacity="0.06"/>
      <!-- Ramita horizontal muy sutil -->
      <path d="M20,60 Q35,63 50,60" stroke="#8b7355" stroke-width="0.3" fill="none" opacity="0.06"/>
      <ellipse cx="25" cy="61" rx="0.4" ry="1.2" fill="#8b7355" opacity="0.06" transform="rotate(20 25 61)"/>
      <ellipse cx="45" cy="59" rx="0.4" ry="1.2" fill="#8b7355" opacity="0.06" transform="rotate(-20 45 59)"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#floralPattern4)"/>
</svg>
  `)}`,
};

// Helper function para generar estilos de fondo
export const getFloralBackgroundStyle = (patternNumber: 1 | 2 | 3 | 4, size: string = '250px') => ({
  backgroundImage: `url('${floralPatterns[`pattern${patternNumber}`]}')`,
  backgroundSize: size,
  backgroundRepeat: 'repeat',
  backgroundPosition: 'center',
});

// Función de prueba para verificar que los patrones funcionan
export const testPattern = () => {
  console.log('Pattern 1 length:', floralPatterns.pattern1.length);
  console.log('Pattern 2 length:', floralPatterns.pattern2.length);
  console.log('Pattern 3 length:', floralPatterns.pattern3.length);
  console.log('Pattern 4 length:', floralPatterns.pattern4.length);
}; 