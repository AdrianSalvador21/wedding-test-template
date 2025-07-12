// Patrones florales sutiles como data URIs (URL-encoded para compatibilidad con SSR)
export const floralPatterns = {
  // Patrón 1: Rama pequeña desde lateral izquierdo
  pattern1: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="floralPattern1" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
      <!-- Rama principal desde el lateral izquierdo -->
      <g transform="translate(0,30)">
        <!-- Tallo principal curvado -->
        <path d="M0 0 Q6 -1 12 1 Q18 4 24 6 Q30 7 36 8" 
              stroke="#8b7355" 
              stroke-width="0.5" 
              fill="none" 
              opacity="0.08"/>
        
        <!-- Rama secundaria superior -->
        <path d="M8 0 Q12 -2 16 -3 Q20 -4 24 -3 Q28 -2 32 -1" 
              stroke="#8b7355" 
              stroke-width="0.4" 
              fill="none" 
              opacity="0.06"/>
        
        <!-- Rama secundaria inferior -->
        <path d="M12 4 Q16 6 20 8 Q24 9 28 10 Q32 10 36 10" 
              stroke="#8b7355" 
              stroke-width="0.4" 
              fill="none" 
              opacity="0.06"/>
        
        <!-- Hojas largas distribuidas -->
        <ellipse cx="5" cy="0" rx="0.8" ry="2.5" fill="#8b7355" opacity="0.05" transform="rotate(15 5 0)"/>
        <ellipse cx="10" cy="1" rx="0.9" ry="3" fill="#7a9b76" opacity="0.06" transform="rotate(25 10 1)"/>
        <ellipse cx="15" cy="2" rx="0.8" ry="2.8" fill="#8b7355" opacity="0.05" transform="rotate(35 15 2)"/>
        <ellipse cx="20" cy="4" rx="1.0" ry="3.2" fill="#7a9b76" opacity="0.06" transform="rotate(40 20 4)"/>
        <ellipse cx="25" cy="6" rx="0.9" ry="3" fill="#8b7355" opacity="0.06" transform="rotate(45 25 6)"/>
        <ellipse cx="30" cy="7" rx="0.8" ry="2.5" fill="#7a9b76" opacity="0.05" transform="rotate(50 30 7)"/>
        
        <!-- Hojas en rama superior -->
        <ellipse cx="12" cy="-2" rx="0.6" ry="2" fill="#8b7355" opacity="0.04" transform="rotate(5 12 -2)"/>
        <ellipse cx="16" cy="-3" rx="0.7" ry="2.2" fill="#7a9b76" opacity="0.04" transform="rotate(10 16 -3)"/>
        <ellipse cx="20" cy="-4" rx="0.6" ry="2" fill="#8b7355" opacity="0.04" transform="rotate(15 20 -4)"/>
        <ellipse cx="24" cy="-3" rx="0.5" ry="1.8" fill="#7a9b76" opacity="0.03" transform="rotate(20 24 -3)"/>
        
        <!-- Hojas en rama inferior -->
        <ellipse cx="16" cy="6" rx="0.7" ry="2.2" fill="#8b7355" opacity="0.04" transform="rotate(60 16 6)"/>
        <ellipse cx="20" cy="8" rx="0.8" ry="2.5" fill="#7a9b76" opacity="0.04" transform="rotate(65 20 8)"/>
        <ellipse cx="24" cy="9" rx="0.7" ry="2.2" fill="#8b7355" opacity="0.04" transform="rotate(70 24 9)"/>
        <ellipse cx="28" cy="10" rx="0.6" ry="2" fill="#7a9b76" opacity="0.03" transform="rotate(75 28 10)"/>
        
        <!-- Pequeños detalles florales -->
        <circle cx="12" cy="1" r="0.5" fill="#d4a574" opacity="0.05"/>
        <circle cx="22" cy="5" r="0.5" fill="#d4a574" opacity="0.05"/>
        <circle cx="30" cy="8" r="0.5" fill="#d4a574" opacity="0.05"/>
      </g>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#floralPattern1)"/>
</svg>
  `)}`,

  // Patrón 2: Ramas pequeñas desde lateral derecho
  pattern2: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="floralPattern2" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
      <!-- Primera rama principal desde la derecha -->
      <g transform="translate(100,25)">
        <path d="M0 0 Q-8 -2 -16 0 Q-24 2 -32 3 Q-40 4 -46 4" 
              stroke="#8b7355" 
              stroke-width="0.5" 
              fill="none" 
              opacity="0.08"/>
        
        <!-- Hojas de la primera rama -->
        <ellipse cx="-6" cy="-1" rx="0.7" ry="2.2" fill="#8b7355" opacity="0.04" transform="rotate(-10 -6 -1)"/>
        <ellipse cx="-12" cy="0" rx="0.8" ry="2.5" fill="#7a9b76" opacity="0.05" transform="rotate(-20 -12 0)"/>
        <ellipse cx="-18" cy="1" rx="0.9" ry="2.8" fill="#8b7355" opacity="0.06" transform="rotate(-30 -18 1)"/>
        <ellipse cx="-24" cy="2" rx="0.8" ry="2.5" fill="#7a9b76" opacity="0.05" transform="rotate(-40 -24 2)"/>
        <ellipse cx="-30" cy="3" rx="0.7" ry="2.2" fill="#8b7355" opacity="0.05" transform="rotate(-45 -30 3)"/>
        <ellipse cx="-36" cy="4" rx="0.6" ry="2" fill="#7a9b76" opacity="0.04" transform="rotate(-50 -36 4)"/>
        <ellipse cx="-42" cy="4" rx="0.6" ry="1.8" fill="#8b7355" opacity="0.04" transform="rotate(-55 -42 4)"/>
      </g>
      
      <!-- Segunda rama principal desde la derecha -->
      <g transform="translate(100,45)">
        <path d="M0 0 Q-9 1 -18 3 Q-27 6 -36 8 Q-45 9 -52 10" 
              stroke="#8b7355" 
              stroke-width="0.5" 
              fill="none" 
              opacity="0.08"/>
        
        <!-- Hojas de la segunda rama -->
        <ellipse cx="-7" cy="0" rx="0.8" ry="2.5" fill="#8b7355" opacity="0.04" transform="rotate(-25 -7 0)"/>
        <ellipse cx="-14" cy="2" rx="0.9" ry="2.8" fill="#7a9b76" opacity="0.05" transform="rotate(-35 -14 2)"/>
        <ellipse cx="-21" cy="4" rx="0.8" ry="2.5" fill="#8b7355" opacity="0.05" transform="rotate(-45 -21 4)"/>
        <ellipse cx="-28" cy="6" rx="0.7" ry="2.2" fill="#7a9b76" opacity="0.04" transform="rotate(-55 -28 6)"/>
        <ellipse cx="-35" cy="8" rx="0.6" ry="2" fill="#8b7355" opacity="0.04" transform="rotate(-60 -35 8)"/>
        <ellipse cx="-42" cy="9" rx="0.6" ry="1.8" fill="#7a9b76" opacity="0.03" transform="rotate(-65 -42 9)"/>
      </g>
      
      <!-- Rama intermedia desde la derecha -->
      <g transform="translate(100,35)">
        <path d="M0 0 Q-6 0 -12 2 Q-18 4 -24 5 Q-30 6 -36 6" 
              stroke="#8b7355" 
              stroke-width="0.4" 
              fill="none" 
              opacity="0.06"/>
        
        <!-- Hojas de la rama intermedia -->
        <ellipse cx="-8" cy="1" rx="0.6" ry="2" fill="#8b7355" opacity="0.04" transform="rotate(-30 -8 1)"/>
        <ellipse cx="-16" cy="3" rx="0.7" ry="2.2" fill="#7a9b76" opacity="0.04" transform="rotate(-40 -16 3)"/>
        <ellipse cx="-24" cy="5" rx="0.6" ry="2" fill="#8b7355" opacity="0.04" transform="rotate(-50 -24 5)"/>
        <ellipse cx="-32" cy="6" rx="0.5" ry="1.8" fill="#7a9b76" opacity="0.03" transform="rotate(-55 -32 6)"/>
      </g>
      
      <!-- Detalles florales -->
      <circle cx="80" cy="28" r="0.4" fill="#d4a574" opacity="0.04"/>
      <circle cx="70" cy="38" r="0.4" fill="#d4a574" opacity="0.04"/>
      <circle cx="60" cy="48" r="0.4" fill="#d4a574" opacity="0.04"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#floralPattern2)"/>
</svg>
  `)}`,

  // Patrón 3: Diseño pequeño tipo helecho desde lateral izquierdo
  pattern3: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="floralPattern3" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
      <!-- Tallo principal curvado -->
      <g transform="translate(0,40)">
        <path d="M0 0 Q10 -3 20 -2 Q30 0 40 3 Q50 6 55 9" 
              stroke="#8b7355" 
              stroke-width="0.6" 
              fill="none" 
              opacity="0.08"/>
        
        <!-- Hojas tipo helecho lado superior -->
        <ellipse cx="5" cy="-2" rx="1.2" ry="5" fill="#8b7355" opacity="0.05" transform="rotate(5 5 -2)"/>
        <ellipse cx="10" cy="-2" rx="1.3" ry="5.5" fill="#7a9b76" opacity="0.05" transform="rotate(10 10 -2)"/>
        <ellipse cx="15" cy="-2" rx="1.4" ry="6" fill="#8b7355" opacity="0.06" transform="rotate(15 15 -2)"/>
        <ellipse cx="20" cy="-2" rx="1.3" ry="5.8" fill="#7a9b76" opacity="0.05" transform="rotate(20 20 -2)"/>
        <ellipse cx="25" cy="-1" rx="1.2" ry="5.5" fill="#8b7355" opacity="0.05" transform="rotate(25 25 -1)"/>
        <ellipse cx="30" cy="1" rx="1.1" ry="5" fill="#7a9b76" opacity="0.04" transform="rotate(30 30 1)"/>
        <ellipse cx="35" cy="2" rx="1.0" ry="4.8" fill="#8b7355" opacity="0.04" transform="rotate(35 35 2)"/>
        <ellipse cx="40" cy="4" rx="1.0" ry="4.5" fill="#7a9b76" opacity="0.03" transform="rotate(40 40 4)"/>
        <ellipse cx="45" cy="6" rx="0.9" ry="4.2" fill="#8b7355" opacity="0.03" transform="rotate(45 45 6)"/>
        
        <!-- Hojas tipo helecho lado inferior -->
        <ellipse cx="7" cy="1" rx="1.0" ry="4.2" fill="#8b7355" opacity="0.04" transform="rotate(60 7 1)"/>
        <ellipse cx="12" cy="2" rx="1.1" ry="4.8" fill="#7a9b76" opacity="0.05" transform="rotate(65 12 2)"/>
        <ellipse cx="17" cy="2" rx="1.2" ry="5.5" fill="#8b7355" opacity="0.05" transform="rotate(70 17 2)"/>
        <ellipse cx="22" cy="3" rx="1.1" ry="5.2" fill="#7a9b76" opacity="0.05" transform="rotate(75 22 3)"/>
        <ellipse cx="27" cy="4" rx="1.0" ry="4.8" fill="#8b7355" opacity="0.04" transform="rotate(80 27 4)"/>
        <ellipse cx="32" cy="6" rx="1.0" ry="4.5" fill="#7a9b76" opacity="0.04" transform="rotate(85 32 6)"/>
        <ellipse cx="37" cy="7" rx="0.9" ry="4.2" fill="#8b7355" opacity="0.03" transform="rotate(90 37 7)"/>
        <ellipse cx="42" cy="8" rx="0.8" ry="3.8" fill="#7a9b76" opacity="0.03" transform="rotate(95 42 8)"/>
        
        <!-- Ramas secundarias -->
        <path d="M12 -1 Q16 -3 20 -4 Q24 -5 28 -4" 
              stroke="#8b7355" 
              stroke-width="0.4" 
              fill="none" 
              opacity="0.06"/>
        <path d="M22 2 Q26 4 30 6 Q34 8 38 9" 
              stroke="#8b7355" 
              stroke-width="0.4" 
              fill="none" 
              opacity="0.06"/>
        
        <!-- Pequeños detalles -->
        <circle cx="16" cy="-1" r="0.4" fill="#d4a574" opacity="0.04"/>
        <circle cx="28" cy="3" r="0.4" fill="#d4a574" opacity="0.04"/>
        <circle cx="42" cy="6" r="0.4" fill="#d4a574" opacity="0.04"/>
      </g>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#floralPattern3)"/>
</svg>
  `)}`,

  // Patrón 4: Composición densa pequeña desde lateral derecho
  pattern4: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="floralPattern4" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
      <!-- Rama principal inferior desde la derecha -->
      <g transform="translate(100,50)">
        <path d="M0 0 Q-9 -1 -18 1 Q-27 4 -36 6 Q-45 7 -52 8" 
              stroke="#8b7355" 
              stroke-width="0.6" 
              fill="none" 
              opacity="0.08"/>
        
        <!-- Hojas grandes de la rama principal -->
        <ellipse cx="-7" cy="0" rx="1.0" ry="3" fill="#8b7355" opacity="0.05" transform="rotate(-20 -7 0)"/>
        <ellipse cx="-14" cy="1" rx="1.1" ry="3.3" fill="#7a9b76" opacity="0.06" transform="rotate(-30 -14 1)"/>
        <ellipse cx="-21" cy="2" rx="1.2" ry="3.6" fill="#8b7355" opacity="0.06" transform="rotate(-40 -21 2)"/>
        <ellipse cx="-28" cy="4" rx="1.1" ry="3.3" fill="#7a9b76" opacity="0.06" transform="rotate(-50 -28 4)"/>
        <ellipse cx="-35" cy="6" rx="1.0" ry="3.1" fill="#8b7355" opacity="0.05" transform="rotate(-55 -35 6)"/>
        <ellipse cx="-42" cy="7" rx="0.9" ry="3" fill="#7a9b76" opacity="0.05" transform="rotate(-60 -42 7)"/>
        <ellipse cx="-49" cy="8" rx="0.8" ry="2.8" fill="#8b7355" opacity="0.04" transform="rotate(-65 -49 8)"/>
      </g>
      
      <!-- Rama secundaria superior desde la derecha -->
      <g transform="translate(100,30)">
        <path d="M0 0 Q-6 -2 -12 -1 Q-18 0 -24 2 Q-30 4 -36 5" 
              stroke="#8b7355" 
              stroke-width="0.5" 
              fill="none" 
              opacity="0.07"/>
        
        <!-- Hojas de la rama superior -->
        <ellipse cx="-6" cy="-1" rx="0.8" ry="2.4" fill="#8b7355" opacity="0.04" transform="rotate(-15 -6 -1)"/>
        <ellipse cx="-12" cy="0" rx="0.9" ry="2.7" fill="#7a9b76" opacity="0.05" transform="rotate(-25 -12 0)"/>
        <ellipse cx="-18" cy="1" rx="0.8" ry="2.5" fill="#8b7355" opacity="0.04" transform="rotate(-35 -18 1)"/>
        <ellipse cx="-24" cy="2" rx="0.7" ry="2.4" fill="#7a9b76" opacity="0.04" transform="rotate(-45 -24 2)"/>
        <ellipse cx="-30" cy="3" rx="0.6" ry="2.2" fill="#8b7355" opacity="0.03" transform="rotate(-50 -30 3)"/>
        <ellipse cx="-36" cy="4" rx="0.6" ry="2" fill="#7a9b76" opacity="0.03" transform="rotate(-55 -36 4)"/>
      </g>
      
      <!-- Rama terciaria muy superior desde la derecha -->
      <g transform="translate(100,20)">
        <path d="M0 0 Q-5 -1 -10 0 Q-15 1 -20 2 Q-25 3 -30 3" 
              stroke="#8b7355" 
              stroke-width="0.4" 
              fill="none" 
              opacity="0.05"/>
        
        <!-- Hojas pequeñas -->
        <ellipse cx="-5" cy="0" rx="0.5" ry="1.8" fill="#8b7355" opacity="0.03" transform="rotate(-20 -5 0)"/>
        <ellipse cx="-10" cy="0" rx="0.6" ry="1.9" fill="#7a9b76" opacity="0.04" transform="rotate(-30 -10 0)"/>
        <ellipse cx="-15" cy="1" rx="0.5" ry="1.8" fill="#8b7355" opacity="0.03" transform="rotate(-40 -15 1)"/>
        <ellipse cx="-20" cy="2" rx="0.5" ry="1.7" fill="#7a9b76" opacity="0.03" transform="rotate(-50 -20 2)"/>
        <ellipse cx="-25" cy="3" rx="0.4" ry="1.5" fill="#8b7355" opacity="0.02" transform="rotate(-55 -25 3)"/>
      </g>
      
      <!-- Ramitas conectoras -->
      <path d="M85 35 Q80 40 75 45" stroke="#8b7355" stroke-width="0.3" fill="none" opacity="0.04"/>
      <path d="M75 28 Q70 32 65 38" stroke="#8b7355" stroke-width="0.3" fill="none" opacity="0.04"/>
      <path d="M80 25 Q75 30 70 35" stroke="#8b7355" stroke-width="0.3" fill="none" opacity="0.04"/>
      
      <!-- Detalles florales distribuidos -->
      <circle cx="85" cy="32" r="0.5" fill="#d4a574" opacity="0.05"/>
      <circle cx="75" cy="42" r="0.5" fill="#d4a574" opacity="0.05"/>
      <circle cx="65" cy="52" r="0.5" fill="#d4a574" opacity="0.05"/>
      <circle cx="55" cy="58" r="0.5" fill="#d4a574" opacity="0.05"/>
      
      <!-- Pequeños detalles adicionales -->
      <circle cx="88" cy="28" r="0.3" fill="#d4a574" opacity="0.03"/>
      <circle cx="78" cy="35" r="0.3" fill="#d4a574" opacity="0.03"/>
      <circle cx="68" cy="45" r="0.3" fill="#d4a574" opacity="0.03"/>
      <circle cx="58" cy="52" r="0.3" fill="#d4a574" opacity="0.03"/>
      <circle cx="48" cy="58" r="0.3" fill="#d4a574" opacity="0.03"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#floralPattern4)"/>
</svg>
  `)}`,

  // Patrón 5: Ramas con hojas largas en las esquinas
  pattern5: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="floralPattern5" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
      <!-- Primera flor - top left -->
      <g transform="translate(8,5)">
        <!-- Tallo principal curvado -->
        <path d="M0 0 Q3 8 5 18 Q6 28 7 38" 
              stroke="#7a9b76" 
              stroke-width="0.8" 
              fill="none" 
              opacity="0.15"/>
        
        <!-- Flor simple en la parte superior -->
        <g transform="translate(0,0)">
          <!-- Pétalos de la flor -->
          <ellipse cx="0" cy="0" rx="2" ry="4" fill="#7a9b76" opacity="0.12" transform="rotate(0 0 0)"/>
          <ellipse cx="0" cy="0" rx="2" ry="4" fill="#7a9b76" opacity="0.10" transform="rotate(72 0 0)"/>
          <ellipse cx="0" cy="0" rx="2" ry="4" fill="#8b7355" opacity="0.08" transform="rotate(144 0 0)"/>
          <ellipse cx="0" cy="0" rx="2" ry="4" fill="#8b7355" opacity="0.10" transform="rotate(216 0 0)"/>
          <ellipse cx="0" cy="0" rx="2" ry="4" fill="#7a9b76" opacity="0.09" transform="rotate(288 0 0)"/>
          
          <!-- Centro de la flor -->
          <circle cx="0" cy="0" r="1.2" fill="#d4a574" opacity="0.15"/>
        </g>
        
        <!-- Hojas pequeñas en el tallo -->
        <ellipse cx="4" cy="12" rx="0.8" ry="3" fill="#8b7355" opacity="0.08" transform="rotate(25 4 12)"/>
        <ellipse cx="6" cy="22" rx="0.6" ry="2.5" fill="#7a9b76" opacity="0.06" transform="rotate(35 6 22)"/>
        <ellipse cx="7" cy="32" rx="0.5" ry="2" fill="#8b7355" opacity="0.05" transform="rotate(40 7 32)"/>
      </g>

      <!-- Segunda flor - cerca de la primera -->
      <g transform="translate(18,8)">
        <!-- Tallo principal curvado -->
        <path d="M0 0 Q-2 6 -3 15 Q-4 24 -5 32" 
              stroke="#8b7355" 
              stroke-width="0.8" 
              fill="none" 
              opacity="0.15"/>
        
        <!-- Flor simple en la parte superior -->
        <g transform="translate(0,0)">
          <!-- Pétalos de la flor -->
          <ellipse cx="0" cy="0" rx="1.8" ry="3.5" fill="#8b7355" opacity="0.12" transform="rotate(30 0 0)"/>
          <ellipse cx="0" cy="0" rx="1.8" ry="3.5" fill="#8b7355" opacity="0.10" transform="rotate(102 0 0)"/>
          <ellipse cx="0" cy="0" rx="1.8" ry="3.5" fill="#7a9b76" opacity="0.08" transform="rotate(174 0 0)"/>
          <ellipse cx="0" cy="0" rx="1.8" ry="3.5" fill="#7a9b76" opacity="0.10" transform="rotate(246 0 0)"/>
          <ellipse cx="0" cy="0" rx="1.8" ry="3.5" fill="#8b7355" opacity="0.09" transform="rotate(318 0 0)"/>
          
          <!-- Centro de la flor -->
          <circle cx="0" cy="0" r="1" fill="#d4a574" opacity="0.15"/>
        </g>
        
        <!-- Hojas pequeñas en el tallo -->
        <ellipse cx="-2" cy="10" rx="0.7" ry="2.8" fill="#7a9b76" opacity="0.08" transform="rotate(-25 -2 10)"/>
        <ellipse cx="-3" cy="18" rx="0.6" ry="2.3" fill="#8b7355" opacity="0.06" transform="rotate(-35 -3 18)"/>
        <ellipse cx="-4" cy="26" rx="0.5" ry="1.8" fill="#7a9b76" opacity="0.05" transform="rotate(-40 -4 26)"/>
      </g>

      <!-- Tallo conectivo sutil entre las flores -->
      <path d="M8 5 Q12 6 18 8" 
            stroke="#7a9b76" 
            stroke-width="0.5" 
            fill="none" 
            opacity="0.08"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#floralPattern5)"/>
</svg>
  `)}`,
};

// Helper function para generar estilos de fondo
export const getFloralBackgroundStyle = (patternNumber: 1 | 2 | 3 | 4 | 5, size: string = '250px') => {
  // Configuración especial para el patrón 5 (mantiene configuración original)
  if (patternNumber === 5) {
    return {
      backgroundImage: `url('${floralPatterns[`pattern${patternNumber}`]}')`,
      backgroundSize: size,
      backgroundRepeat: 'repeat',
      backgroundPosition: '0% 0%',
    };
  }
  
  // Configuración para patrones 1-4 (aparece solo 1-2 veces máximo)
  return {
    backgroundImage: `url('${floralPatterns[`pattern${patternNumber}`]}')`,
    backgroundSize: '1400px 1000px', // Mucho más grande para que aparezca menos veces
    backgroundRepeat: 'repeat',
    backgroundPosition: '0% 0%',
  };
};

// Patrones geométricos luxury para el tema Luxury Navy
export const luxuryPatterns = {
  // Patrón geométrico 1: Hexágonos elegantes
  luxuryGeometric1: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="luxuryPattern1" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
      <!-- Hexágono principal -->
      <g transform="translate(60,60)">
        <polygon points="0,-20 17.32,-10 17.32,10 0,20 -17.32,10 -17.32,-10" 
                 fill="none" 
                 stroke="#1e3a8a" 
                 stroke-width="0.5" 
                 opacity="0.08"/>
        <polygon points="0,-15 12.99,-7.5 12.99,7.5 0,15 -12.99,7.5 -12.99,-7.5" 
                 fill="none" 
                 stroke="#3b82f6" 
                 stroke-width="0.3" 
                 opacity="0.06"/>
        <polygon points="0,-10 8.66,-5 8.66,5 0,10 -8.66,5 -8.66,-5" 
                 fill="#f59e0b" 
                 opacity="0.03"/>
      </g>
      
      <!-- Hexágonos esquinas -->
      <g transform="translate(0,0)">
        <polygon points="0,-12 10.39,-6 10.39,6 0,12 -10.39,6 -10.39,-6" 
                 fill="none" 
                 stroke="#1e3a8a" 
                 stroke-width="0.3" 
                 opacity="0.06"/>
      </g>
      
      <g transform="translate(120,0)">
        <polygon points="0,-12 10.39,-6 10.39,6 0,12 -10.39,6 -10.39,-6" 
                 fill="none" 
                 stroke="#1e3a8a" 
                 stroke-width="0.3" 
                 opacity="0.06"/>
      </g>
      
      <g transform="translate(60,120)">
        <polygon points="0,-12 10.39,-6 10.39,6 0,12 -10.39,6 -10.39,-6" 
                 fill="none" 
                 stroke="#1e3a8a" 
                 stroke-width="0.3" 
                 opacity="0.06"/>
      </g>
      
      <!-- Detalles dorados -->
      <circle cx="30" cy="30" r="1.5" fill="#f59e0b" opacity="0.08"/>
      <circle cx="90" cy="30" r="1.5" fill="#f59e0b" opacity="0.08"/>
      <circle cx="30" cy="90" r="1.5" fill="#f59e0b" opacity="0.08"/>
      <circle cx="90" cy="90" r="1.5" fill="#f59e0b" opacity="0.08"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#luxuryPattern1)"/>
</svg>
  `)}`,

  // Patrón geométrico 2: Líneas diagonales elegantes
  luxuryGeometric2: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="luxuryPattern2" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
      <!-- Líneas diagonales principales -->
      <line x1="0" y1="0" x2="80" y2="80" stroke="#1e3a8a" stroke-width="0.5" opacity="0.06"/>
      <line x1="0" y1="20" x2="80" y2="100" stroke="#1e3a8a" stroke-width="0.5" opacity="0.06"/>
      <line x1="0" y1="40" x2="80" y2="120" stroke="#1e3a8a" stroke-width="0.5" opacity="0.06"/>
      <line x1="0" y1="60" x2="80" y2="140" stroke="#1e3a8a" stroke-width="0.5" opacity="0.06"/>
      <line x1="0" y1="80" x2="80" y2="160" stroke="#1e3a8a" stroke-width="0.5" opacity="0.06"/>
      
      <!-- Líneas diagonales secundarias -->
      <line x1="0" y1="10" x2="80" y2="90" stroke="#3b82f6" stroke-width="0.3" opacity="0.04"/>
      <line x1="0" y1="30" x2="80" y2="110" stroke="#3b82f6" stroke-width="0.3" opacity="0.04"/>
      <line x1="0" y1="50" x2="80" y2="130" stroke="#3b82f6" stroke-width="0.3" opacity="0.04"/>
      <line x1="0" y1="70" x2="80" y2="150" stroke="#3b82f6" stroke-width="0.3" opacity="0.04"/>
      
      <!-- Detalles dorados -->
      <circle cx="20" cy="20" r="1" fill="#f59e0b" opacity="0.08"/>
      <circle cx="60" cy="20" r="1" fill="#f59e0b" opacity="0.08"/>
      <circle cx="20" cy="60" r="1" fill="#f59e0b" opacity="0.08"/>
      <circle cx="60" cy="60" r="1" fill="#f59e0b" opacity="0.08"/>
      
      <!-- Líneas de acento -->
      <line x1="40" y1="0" x2="40" y2="80" stroke="#f59e0b" stroke-width="0.2" opacity="0.05"/>
      <line x1="0" y1="40" x2="80" y2="40" stroke="#f59e0b" stroke-width="0.2" opacity="0.05"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#luxuryPattern2)"/>
</svg>
  `)}`,

  // Patrón ornamental 1: Ornamentos clásicos
  luxuryOrnate1: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="luxuryPattern3" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
      <!-- Ornamento central -->
      <g transform="translate(50,50)">
        <!-- Cruz ornamental -->
        <path d="M-15,0 L-5,-3 L0,-8 L5,-3 L15,0 L5,3 L0,8 L-5,3 Z" 
              fill="#1e3a8a" 
              opacity="0.08"/>
        <path d="M-10,0 L-3,-2 L0,-5 L3,-2 L10,0 L3,2 L0,5 L-3,2 Z" 
              fill="#f59e0b" 
              opacity="0.06"/>
        
        <!-- Círculos concéntricos -->
        <circle cx="0" cy="0" r="12" fill="none" stroke="#3b82f6" stroke-width="0.5" opacity="0.05"/>
        <circle cx="0" cy="0" r="8" fill="none" stroke="#1e3a8a" stroke-width="0.3" opacity="0.06"/>
        <circle cx="0" cy="0" r="4" fill="#f59e0b" opacity="0.04"/>
        
        <!-- Detalles en los extremos -->
        <circle cx="20" cy="0" r="2" fill="#3b82f6" opacity="0.06"/>
        <circle cx="-20" cy="0" r="2" fill="#3b82f6" opacity="0.06"/>
        <circle cx="0" cy="20" r="2" fill="#3b82f6" opacity="0.06"/>
        <circle cx="0" cy="-20" r="2" fill="#3b82f6" opacity="0.06"/>
      </g>
      
      <!-- Ornamentos esquinas -->
      <g transform="translate(0,0)">
        <path d="M0,0 L8,0 L8,8 L0,8 Z" fill="none" stroke="#1e3a8a" stroke-width="0.3" opacity="0.04"/>
        <circle cx="4" cy="4" r="1.5" fill="#f59e0b" opacity="0.05"/>
      </g>
      
      <g transform="translate(100,0)">
        <path d="M0,0 L-8,0 L-8,8 L0,8 Z" fill="none" stroke="#1e3a8a" stroke-width="0.3" opacity="0.04"/>
        <circle cx="-4" cy="4" r="1.5" fill="#f59e0b" opacity="0.05"/>
      </g>
      
      <g transform="translate(0,100)">
        <path d="M0,0 L8,0 L8,-8 L0,-8 Z" fill="none" stroke="#1e3a8a" stroke-width="0.3" opacity="0.04"/>
        <circle cx="4" cy="-4" r="1.5" fill="#f59e0b" opacity="0.05"/>
      </g>
      
      <g transform="translate(100,100)">
        <path d="M0,0 L-8,0 L-8,-8 L0,-8 Z" fill="none" stroke="#1e3a8a" stroke-width="0.3" opacity="0.04"/>
        <circle cx="-4" cy="-4" r="1.5" fill="#f59e0b" opacity="0.05"/>
      </g>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#luxuryPattern3)"/>
</svg>
  `)}`,

  // Patrón sutil 1: Puntos elegantes
  luxurySubtle1: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="luxuryPattern4" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
      <!-- Puntos principales -->
      <circle cx="30" cy="30" r="2" fill="#1e3a8a" opacity="0.06"/>
      <circle cx="30" cy="30" r="1" fill="#f59e0b" opacity="0.08"/>
      
      <!-- Puntos secundarios -->
      <circle cx="15" cy="15" r="1" fill="#3b82f6" opacity="0.04"/>
      <circle cx="45" cy="15" r="1" fill="#3b82f6" opacity="0.04"/>
      <circle cx="15" cy="45" r="1" fill="#3b82f6" opacity="0.04"/>
      <circle cx="45" cy="45" r="1" fill="#3b82f6" opacity="0.04"/>
      
      <!-- Puntos terciarios -->
      <circle cx="0" cy="0" r="0.5" fill="#1e3a8a" opacity="0.03"/>
      <circle cx="60" cy="0" r="0.5" fill="#1e3a8a" opacity="0.03"/>
      <circle cx="0" cy="60" r="0.5" fill="#1e3a8a" opacity="0.03"/>
      <circle cx="60" cy="60" r="0.5" fill="#1e3a8a" opacity="0.03"/>
      
      <!-- Líneas sutiles -->
      <line x1="30" y1="20" x2="30" y2="40" stroke="#f59e0b" stroke-width="0.2" opacity="0.03"/>
      <line x1="20" y1="30" x2="40" y2="30" stroke="#f59e0b" stroke-width="0.2" opacity="0.03"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#luxuryPattern4)"/>
</svg>
  `)}`,
};

// Función para obtener patrones luxury
export const getLuxuryPattern = (patternName: string) => {
  const patternMap: Record<string, string> = {
    'luxury-geometric-1': luxuryPatterns.luxuryGeometric1,
    'luxury-geometric-2': luxuryPatterns.luxuryGeometric2,
    'luxury-ornate-1': luxuryPatterns.luxuryOrnate1,
    'luxury-subtle-1': luxuryPatterns.luxurySubtle1,
  };
  
  return patternMap[patternName] || floralPatterns.pattern1;
};

// Función para obtener estilos de fondo para patrones luxury
export const getLuxuryBackgroundStyle = (patternName: string, size: string = '400px') => {
  const pattern = getLuxuryPattern(patternName);
  
  return {
    backgroundImage: `url('${pattern}')`,
    backgroundSize: size,
    backgroundRepeat: 'repeat',
    backgroundPosition: '0% 0%',
  };
};

// Patrones premium con colores rose gold y burgundy
export const premiumPatterns = {
  'premium-floral-1': `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="premiumFloral1" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
      <!-- Rama principal elegante -->
      <g transform="translate(10,30)">
        <path d="M0 0 Q12 -2 24 0 Q36 3 48 6 Q60 8 72 10" 
              stroke="#a08060" 
              stroke-width="0.8" 
              fill="none" 
              opacity="0.12"/>
        
        <!-- Hojas rose gold -->
        <ellipse cx="8" cy="-1" rx="1.5" ry="4" fill="#a08060" opacity="0.08" transform="rotate(15 8 -1)"/>
        <ellipse cx="16" cy="0" rx="1.6" ry="4.5" fill="#c9b49a" opacity="0.08" transform="rotate(25 16 0)"/>
        <ellipse cx="24" cy="1" rx="1.7" ry="5" fill="#a08060" opacity="0.10" transform="rotate(35 24 1)"/>
        <ellipse cx="32" cy="3" rx="1.6" ry="4.8" fill="#c9b49a" opacity="0.09" transform="rotate(40 32 3)"/>
        <ellipse cx="40" cy="5" rx="1.5" ry="4.5" fill="#a08060" opacity="0.08" transform="rotate(45 40 5)"/>
        <ellipse cx="48" cy="6" rx="1.4" ry="4.2" fill="#c9b49a" opacity="0.07" transform="rotate(50 48 6)"/>
        <ellipse cx="56" cy="7" rx="1.3" ry="4" fill="#a08060" opacity="0.07" transform="rotate(55 56 7)"/>
        <ellipse cx="64" cy="8" rx="1.2" ry="3.8" fill="#c9b49a" opacity="0.06" transform="rotate(60 64 8)"/>
        
        <!-- Flores burgundy pequeñas -->
        <circle cx="12" cy="1" r="0.8" fill="#b8a687" opacity="0.07"/>
        <circle cx="28" cy="4" r="0.8" fill="#b8a687" opacity="0.07"/>
        <circle cx="44" cy="6" r="0.8" fill="#b8a687" opacity="0.07"/>
        <circle cx="60" cy="8" r="0.8" fill="#b8a687" opacity="0.07"/>
        
        <!-- Pétalos alrededor de las flores -->
        <ellipse cx="11" cy="0" rx="0.4" ry="1.2" fill="#b8a687" opacity="0.05" transform="rotate(0 11 0)"/>
        <ellipse cx="13" cy="0" rx="0.4" ry="1.2" fill="#b8a687" opacity="0.05" transform="rotate(60 13 0)"/>
        <ellipse cx="12" cy="2" rx="0.4" ry="1.2" fill="#b8a687" opacity="0.05" transform="rotate(120 12 2)"/>
        
        <ellipse cx="27" cy="3" rx="0.4" ry="1.2" fill="#b8a687" opacity="0.05" transform="rotate(0 27 3)"/>
        <ellipse cx="29" cy="3" rx="0.4" ry="1.2" fill="#b8a687" opacity="0.05" transform="rotate(60 29 3)"/>
        <ellipse cx="28" cy="5" rx="0.4" ry="1.2" fill="#b8a687" opacity="0.05" transform="rotate(120 28 5)"/>
        
        <!-- Detalles en esquinas -->
        <circle cx="-10" cy="1" r="0.5" fill="#b8a687" opacity="0.06"/>
        <circle cx="-22" cy="3" r="0.5" fill="#b8a687" opacity="0.06"/>
        <circle cx="-34" cy="5" r="0.5" fill="#b8a687" opacity="0.06"/>
      </g>
      
      <!-- Rama secundaria -->
      <g transform="translate(90,80)">
        <path d="M0 0 Q-8 -1 -16 1 Q-24 3 -32 4 Q-40 5 -48 6" 
              stroke="#a08060" 
              stroke-width="0.6" 
              fill="none" 
              opacity="0.10"/>
        
        <!-- Hojas menores -->
        <ellipse cx="-6" cy="0" rx="1.0" ry="2.5" fill="#a08060" opacity="0.06" transform="rotate(-15 -6 0)"/>
        <ellipse cx="-12" cy="1" rx="1.1" ry="2.8" fill="#c9b49a" opacity="0.06" transform="rotate(-25 -12 1)"/>
        <ellipse cx="-18" cy="2" rx="1.0" ry="2.5" fill="#a08060" opacity="0.06" transform="rotate(-35 -18 2)"/>
        <ellipse cx="-24" cy="3" rx="0.9" ry="2.2" fill="#c9b49a" opacity="0.05" transform="rotate(-45 -24 3)"/>
        <ellipse cx="-30" cy="4" rx="0.8" ry="2" fill="#a08060" opacity="0.05" transform="rotate(-55 -30 4)"/>
        <ellipse cx="-36" cy="5" rx="0.7" ry="1.8" fill="#c9b49a" opacity="0.04" transform="rotate(-60 -36 5)"/>
        
        <!-- Pequeñas flores -->
        <circle cx="-10" cy="1" r="0.5" fill="#b8a687" opacity="0.06"/>
        <circle cx="-22" cy="3" r="0.5" fill="#b8a687" opacity="0.06"/>
        <circle cx="-34" cy="5" r="0.5" fill="#b8a687" opacity="0.06"/>
      </g>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#premiumFloral1)"/>
</svg>
  `)}`,

  'premium-floral-2': `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg width="140" height="140" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="premiumFloral2" x="0" y="0" width="140" height="140" patternUnits="userSpaceOnUse">
      <!-- Composición central elegante -->
      <g transform="translate(70,70)">
        <!-- Tallos en cruz -->
        <path d="M0 0 Q-15 -2 -30 -4 Q-45 -6 -60 -8" 
              stroke="#a08060" 
              stroke-width="0.7" 
              fill="none" 
              opacity="0.10"/>
        <path d="M0 0 Q15 -2 30 -4 Q45 -6 60 -8" 
              stroke="#a08060" 
              stroke-width="0.7" 
              fill="none" 
              opacity="0.10"/>
        <path d="M0 0 Q-2 -15 -4 -30 Q-6 -45 -8 -60" 
              stroke="#a08060" 
              stroke-width="0.7" 
              fill="none" 
              opacity="0.10"/>
        <path d="M0 0 Q2 15 4 30 Q6 45 8 60" 
              stroke="#a08060" 
              stroke-width="0.7" 
              fill="none" 
              opacity="0.10"/>
        
        <!-- Hojas en cada dirección -->
        <!-- Izquierda -->
        <ellipse cx="-10" cy="-1" rx="1.3" ry="3.5" fill="#a08060" opacity="0.07" transform="rotate(-10 -10 -1)"/>
        <ellipse cx="-20" cy="-2" rx="1.4" ry="4" fill="#c9b49a" opacity="0.07" transform="rotate(-15 -20 -2)"/>
        <ellipse cx="-30" cy="-3" rx="1.5" ry="4.5" fill="#a08060" opacity="0.08" transform="rotate(-20 -30 -3)"/>
        <ellipse cx="-40" cy="-4" rx="1.4" ry="4.2" fill="#c9b49a" opacity="0.07" transform="rotate(-25 -40 -4)"/>
        <ellipse cx="-50" cy="-6" rx="1.3" ry="3.8" fill="#a08060" opacity="0.06" transform="rotate(-30 -50 -6)"/>
        
        <!-- Derecha -->
        <ellipse cx="10" cy="-1" rx="1.3" ry="3.5" fill="#a08060" opacity="0.07" transform="rotate(10 10 -1)"/>
        <ellipse cx="20" cy="-2" rx="1.4" ry="4" fill="#c9b49a" opacity="0.07" transform="rotate(15 20 -2)"/>
        <ellipse cx="30" cy="-3" rx="1.5" ry="4.5" fill="#a08060" opacity="0.08" transform="rotate(20 30 -3)"/>
        <ellipse cx="40" cy="-4" rx="1.4" ry="4.2" fill="#c9b49a" opacity="0.07" transform="rotate(25 40 -4)"/>
        <ellipse cx="50" cy="-6" rx="1.3" ry="3.8" fill="#a08060" opacity="0.06" transform="rotate(30 50 -6)"/>
        
        <!-- Arriba -->
        <ellipse cx="-1" cy="-10" rx="3.5" ry="1.3" fill="#a08060" opacity="0.07" transform="rotate(-80 -1 -10)"/>
        <ellipse cx="-2" cy="-20" rx="4" ry="1.4" fill="#c9b49a" opacity="0.07" transform="rotate(-75 -2 -20)"/>
        <ellipse cx="-3" cy="-30" rx="4.5" ry="1.5" fill="#a08060" opacity="0.08" transform="rotate(-70 -3 -30)"/>
        <ellipse cx="-4" cy="-40" rx="4.2" ry="1.4" fill="#c9b49a" opacity="0.07" transform="rotate(-65 -4 -40)"/>
        <ellipse cx="-6" cy="-50" rx="3.8" ry="1.3" fill="#a08060" opacity="0.06" transform="rotate(-60 -6 -50)"/>
        
        <!-- Abajo -->
        <ellipse cx="1" cy="10" rx="3.5" ry="1.3" fill="#a08060" opacity="0.07" transform="rotate(80 1 10)"/>
        <ellipse cx="2" cy="20" rx="4" ry="1.4" fill="#c9b49a" opacity="0.07" transform="rotate(75 2 20)"/>
        <ellipse cx="3" cy="30" rx="4.5" ry="1.5" fill="#a08060" opacity="0.08" transform="rotate(70 3 30)"/>
        <ellipse cx="4" cy="40" rx="4.2" ry="1.4" fill="#c9b49a" opacity="0.07" transform="rotate(65 4 40)"/>
        <ellipse cx="6" cy="50" rx="3.8" ry="1.3" fill="#a08060" opacity="0.06" transform="rotate(60 6 50)"/>
        
        <!-- Flores centrales -->
        <circle cx="0" cy="0" r="1.5" fill="#b8a687" opacity="0.08"/>
        <circle cx="-25" cy="-3" r="1" fill="#b8a687" opacity="0.06"/>
        <circle cx="25" cy="-3" r="1" fill="#b8a687" opacity="0.06"/>
        <circle cx="-3" cy="-25" r="1" fill="#b8a687" opacity="0.06"/>
        <circle cx="3" cy="25" r="1" fill="#b8a687" opacity="0.06"/>
        
        <!-- Detalles ornamentales -->
        <circle cx="-15" cy="-1" r="0.3" fill="#c9b49a" opacity="0.05"/>
        <circle cx="15" cy="-1" r="0.3" fill="#c9b49a" opacity="0.05"/>
        <circle cx="-1" cy="-15" r="0.3" fill="#c9b49a" opacity="0.05"/>
        <circle cx="1" cy="15" r="0.3" fill="#c9b49a" opacity="0.05"/>
      </g>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#premiumFloral2)"/>
</svg>
  `)}`,

  'premium-ornate-1': `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="premiumOrnate1" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
      <!-- Patrón ornamental elegante -->
      <g transform="translate(50,50)">
        <!-- Círculo central -->
        <circle cx="0" cy="0" r="2" fill="#b8a687" opacity="0.08"/>
        
        <!-- Ornamentos en cruz -->
        <path d="M0 -8 Q-1 -12 0 -16 Q1 -12 0 -8" 
              fill="#a08060" 
              opacity="0.06"/>
        <path d="M0 8 Q-1 12 0 16 Q1 12 0 8" 
              fill="#a08060" 
              opacity="0.06"/>
        <path d="M-8 0 Q-12 -1 -16 0 Q-12 1 -8 0" 
              fill="#a08060" 
              opacity="0.06"/>
        <path d="M8 0 Q12 -1 16 0 Q12 1 8 0" 
              fill="#a08060" 
              opacity="0.06"/>
        
        <!-- Ornamentos diagonales -->
        <path d="M-6 -6 Q-8 -8 -10 -10 Q-8 -8 -6 -6" 
              fill="#c9b49a" 
              opacity="0.05"/>
        <path d="M6 -6 Q8 -8 10 -10 Q8 -8 6 -6" 
              fill="#c9b49a" 
              opacity="0.05"/>
        <path d="M-6 6 Q-8 8 -10 10 Q-8 8 -6 6" 
              fill="#c9b49a" 
              opacity="0.05"/>
        <path d="M6 6 Q8 8 10 10 Q8 8 6 6" 
              fill="#c9b49a" 
              opacity="0.05"/>
        
        <!-- Pequeños círculos decorativos -->
        <circle cx="0" cy="-12" r="0.8" fill="#b8a687" opacity="0.06"/>
        <circle cx="0" cy="12" r="0.8" fill="#b8a687" opacity="0.06"/>
        <circle cx="-12" cy="0" r="0.8" fill="#b8a687" opacity="0.06"/>
        <circle cx="12" cy="0" r="0.8" fill="#b8a687" opacity="0.06"/>
        
        <!-- Detalles menores -->
        <circle cx="-8" cy="-8" r="0.4" fill="#c9b49a" opacity="0.04"/>
        <circle cx="8" cy="-8" r="0.4" fill="#c9b49a" opacity="0.04"/>
        <circle cx="-8" cy="8" r="0.4" fill="#c9b49a" opacity="0.04"/>
        <circle cx="8" cy="8" r="0.4" fill="#c9b49a" opacity="0.04"/>
      </g>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#premiumOrnate1)"/>
</svg>
  `)}`,

  'premium-subtle-1': `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="premiumSubtle1" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
      <!-- Patrón sutil con puntos y líneas -->
      <g opacity="0.04">
        <!-- Puntos dispersos -->
        <circle cx="20" cy="20" r="0.5" fill="#a08060"/>
        <circle cx="60" cy="20" r="0.5" fill="#c9b49a"/>
        <circle cx="20" cy="60" r="0.5" fill="#b8a687"/>
        <circle cx="60" cy="60" r="0.5" fill="#a08060"/>
        <circle cx="40" cy="40" r="0.8" fill="#c9b49a"/>
        
        <!-- Líneas sutiles -->
        <line x1="20" y1="20" x2="25" y2="25" stroke="#a08060" stroke-width="0.3"/>
        <line x1="60" y1="20" x2="55" y2="25" stroke="#c9b49a" stroke-width="0.3"/>
        <line x1="20" y1="60" x2="25" y2="55" stroke="#b8a687" stroke-width="0.3"/>
        <line x1="60" y1="60" x2="55" y2="55" stroke="#a08060" stroke-width="0.3"/>
        
        <!-- Pequeños ornamentos -->
        <circle cx="10" cy="40" r="0.3" fill="#c9b49a"/>
        <circle cx="70" cy="40" r="0.3" fill="#b8a687"/>
        <circle cx="40" cy="10" r="0.3" fill="#a08060"/>
        <circle cx="40" cy="70" r="0.3" fill="#c9b49a"/>
      </g>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#premiumSubtle1)"/>
</svg>
  `)}`,
};

export const getPremiumPattern = (patternName: string) => {
  return premiumPatterns[patternName as keyof typeof premiumPatterns] || premiumPatterns['premium-subtle-1'];
};

export const getPremiumBackgroundStyle = (patternName: string, size: string = '300px') => {
  const pattern = getPremiumPattern(patternName);
  return {
    backgroundImage: `url("${pattern}")`,
    backgroundSize: size,
    backgroundRepeat: 'repeat',
    backgroundPosition: '0% 0%',
  };
};

// Patrones corporativos profesionales con diseños geométricos limpios
export const corporatePatterns = {
  'corporate-geometric-1': `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="corporateGeometric1" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
      <!-- Diseño geométrico corporativo -->
      <g transform="translate(50,50)">
        <!-- Cuadrado central -->
        <rect x="-15" y="-15" width="30" height="30" 
              fill="none" 
              stroke="#4a5568" 
              stroke-width="0.8" 
              opacity="0.12"/>
        <rect x="-10" y="-10" width="20" height="20" 
              fill="none" 
              stroke="#718096" 
              stroke-width="0.6" 
              opacity="0.10"/>
        <rect x="-5" y="-5" width="10" height="10" 
              fill="#2d3748" 
              opacity="0.08"/>
        
        <!-- Líneas conectoras -->
        <line x1="-25" y1="0" x2="-15" y2="0" stroke="#4a5568" stroke-width="0.5" opacity="0.08"/>
        <line x1="15" y1="0" x2="25" y2="0" stroke="#4a5568" stroke-width="0.5" opacity="0.08"/>
        <line x1="0" y1="-25" x2="0" y2="-15" stroke="#4a5568" stroke-width="0.5" opacity="0.08"/>
        <line x1="0" y1="15" x2="0" y2="25" stroke="#4a5568" stroke-width="0.5" opacity="0.08"/>
        
        <!-- Puntos de conexión -->
        <circle cx="-25" cy="0" r="1.5" fill="#718096" opacity="0.10"/>
        <circle cx="25" cy="0" r="1.5" fill="#718096" opacity="0.10"/>
        <circle cx="0" cy="-25" r="1.5" fill="#718096" opacity="0.10"/>
        <circle cx="0" cy="25" r="1.5" fill="#718096" opacity="0.10"/>
      </g>
      
      <!-- Elementos en esquinas -->
      <g transform="translate(0,0)">
        <rect x="0" y="0" width="8" height="8" fill="none" stroke="#2d3748" stroke-width="0.4" opacity="0.06"/>
        <circle cx="4" cy="4" r="1" fill="#4a5568" opacity="0.08"/>
      </g>
      
      <g transform="translate(100,0)">
        <rect x="-8" y="0" width="8" height="8" fill="none" stroke="#2d3748" stroke-width="0.4" opacity="0.06"/>
        <circle cx="-4" cy="4" r="1" fill="#4a5568" opacity="0.08"/>
      </g>
      
      <g transform="translate(0,100)">
        <rect x="0" y="-8" width="8" height="8" fill="none" stroke="#2d3748" stroke-width="0.4" opacity="0.06"/>
        <circle cx="4" cy="-4" r="1" fill="#4a5568" opacity="0.08"/>
      </g>
      
      <g transform="translate(100,100)">
        <rect x="-8" y="-8" width="8" height="8" fill="none" stroke="#2d3748" stroke-width="0.4" opacity="0.06"/>
        <circle cx="-4" cy="-4" r="1" fill="#4a5568" opacity="0.08"/>
      </g>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#corporateGeometric1)"/>
</svg>
  `)}`,

  'corporate-geometric-2': `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="corporateGeometric2" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
      <!-- Patrón de rombos corporativos -->
      <g transform="translate(60,60)">
        <!-- Rombo principal -->
        <polygon points="0,-20 20,0 0,20 -20,0" 
                 fill="none" 
                 stroke="#4a5568" 
                 stroke-width="0.8" 
                 opacity="0.12"/>
        <polygon points="0,-15 15,0 0,15 -15,0" 
                 fill="none" 
                 stroke="#718096" 
                 stroke-width="0.6" 
                 opacity="0.10"/>
        <polygon points="0,-8 8,0 0,8 -8,0" 
                 fill="#2d3748" 
                 opacity="0.08"/>
        
        <!-- Líneas de conexión -->
        <line x1="-30" y1="-30" x2="-20" y2="-20" stroke="#718096" stroke-width="0.4" opacity="0.06"/>
        <line x1="30" y1="-30" x2="20" y2="-20" stroke="#718096" stroke-width="0.4" opacity="0.06"/>
        <line x1="-30" y1="30" x2="-20" y2="20" stroke="#718096" stroke-width="0.4" opacity="0.06"/>
        <line x1="30" y1="30" x2="20" y2="20" stroke="#718096" stroke-width="0.4" opacity="0.06"/>
        
        <!-- Puntos de anclaje -->
        <circle cx="-30" cy="-30" r="1" fill="#4a5568" opacity="0.08"/>
        <circle cx="30" cy="-30" r="1" fill="#4a5568" opacity="0.08"/>
        <circle cx="-30" cy="30" r="1" fill="#4a5568" opacity="0.08"/>
        <circle cx="30" cy="30" r="1" fill="#4a5568" opacity="0.08"/>
      </g>
      
      <!-- Rombos secundarios -->
      <g transform="translate(30,30)">
        <polygon points="0,-8 8,0 0,8 -8,0" 
                 fill="none" 
                 stroke="#2d3748" 
                 stroke-width="0.4" 
                 opacity="0.06"/>
        <circle cx="0" cy="0" r="1.5" fill="#718096" opacity="0.06"/>
      </g>
      
      <g transform="translate(90,30)">
        <polygon points="0,-8 8,0 0,8 -8,0" 
                 fill="none" 
                 stroke="#2d3748" 
                 stroke-width="0.4" 
                 opacity="0.06"/>
        <circle cx="0" cy="0" r="1.5" fill="#718096" opacity="0.06"/>
      </g>
      
      <g transform="translate(30,90)">
        <polygon points="0,-8 8,0 0,8 -8,0" 
                 fill="none" 
                 stroke="#2d3748" 
                 stroke-width="0.4" 
                 opacity="0.06"/>
        <circle cx="0" cy="0" r="1.5" fill="#718096" opacity="0.06"/>
      </g>
      
      <g transform="translate(90,90)">
        <polygon points="0,-8 8,0 0,8 -8,0" 
                 fill="none" 
                 stroke="#2d3748" 
                 stroke-width="0.4" 
                 opacity="0.06"/>
        <circle cx="0" cy="0" r="1.5" fill="#718096" opacity="0.06"/>
      </g>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#corporateGeometric2)"/>
</svg>
  `)}`,

  'corporate-minimal-1': `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="corporateMinimal1" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
      <!-- Diseño minimalista corporativo -->
      <g transform="translate(40,40)">
        <!-- Cruz minimalista -->
        <line x1="-20" y1="0" x2="20" y2="0" stroke="#4a5568" stroke-width="0.6" opacity="0.08"/>
        <line x1="0" y1="-20" x2="0" y2="20" stroke="#4a5568" stroke-width="0.6" opacity="0.08"/>
        
        <!-- Círculo central -->
        <circle cx="0" cy="0" r="3" fill="none" stroke="#718096" stroke-width="0.5" opacity="0.10"/>
        <circle cx="0" cy="0" r="1.5" fill="#2d3748" opacity="0.08"/>
        
        <!-- Puntos de intersección -->
        <circle cx="-15" cy="0" r="0.8" fill="#4a5568" opacity="0.06"/>
        <circle cx="15" cy="0" r="0.8" fill="#4a5568" opacity="0.06"/>
        <circle cx="0" cy="-15" r="0.8" fill="#4a5568" opacity="0.06"/>
        <circle cx="0" cy="15" r="0.8" fill="#4a5568" opacity="0.06"/>
      </g>
      
      <!-- Elementos esquinas -->
      <circle cx="10" cy="10" r="0.5" fill="#718096" opacity="0.05"/>
      <circle cx="70" cy="10" r="0.5" fill="#718096" opacity="0.05"/>
      <circle cx="10" cy="70" r="0.5" fill="#718096" opacity="0.05"/>
      <circle cx="70" cy="70" r="0.5" fill="#718096" opacity="0.05"/>
      
      <!-- Líneas sutiles -->
      <line x1="20" y1="20" x2="25" y2="25" stroke="#2d3748" stroke-width="0.3" opacity="0.04"/>
      <line x1="60" y1="20" x2="55" y2="25" stroke="#2d3748" stroke-width="0.3" opacity="0.04"/>
      <line x1="20" y1="60" x2="25" y2="55" stroke="#2d3748" stroke-width="0.3" opacity="0.04"/>
      <line x1="60" y1="60" x2="55" y2="55" stroke="#2d3748" stroke-width="0.3" opacity="0.04"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#corporateMinimal1)"/>
</svg>
  `)}`,

  'corporate-subtle-1': `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="corporateSubtle1" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
      <!-- Patrón sutil corporativo -->
      <g opacity="0.05">
        <!-- Puntos organizados -->
        <circle cx="15" cy="15" r="0.8" fill="#4a5568"/>
        <circle cx="45" cy="15" r="0.8" fill="#718096"/>
        <circle cx="15" cy="45" r="0.8" fill="#2d3748"/>
        <circle cx="45" cy="45" r="0.8" fill="#4a5568"/>
        <circle cx="30" cy="30" r="1.2" fill="#718096"/>
        
        <!-- Líneas conectoras sutiles -->
        <line x1="15" y1="15" x2="20" y2="20" stroke="#4a5568" stroke-width="0.4"/>
        <line x1="45" y1="15" x2="40" y2="20" stroke="#718096" stroke-width="0.4"/>
        <line x1="15" y1="45" x2="20" y2="40" stroke="#2d3748" stroke-width="0.4"/>
        <line x1="45" y1="45" x2="40" y2="40" stroke="#4a5568" stroke-width="0.4"/>
        
        <!-- Grid sutil -->
        <line x1="30" y1="10" x2="30" y2="15" stroke="#718096" stroke-width="0.2"/>
        <line x1="30" y1="45" x2="30" y2="50" stroke="#718096" stroke-width="0.2"/>
        <line x1="10" y1="30" x2="15" y2="30" stroke="#718096" stroke-width="0.2"/>
        <line x1="45" y1="30" x2="50" y2="30" stroke="#718096" stroke-width="0.2"/>
        
        <!-- Puntos de grid -->
        <circle cx="0" cy="0" r="0.3" fill="#2d3748"/>
        <circle cx="60" cy="0" r="0.3" fill="#2d3748"/>
        <circle cx="0" cy="60" r="0.3" fill="#2d3748"/>
        <circle cx="60" cy="60" r="0.3" fill="#2d3748"/>
      </g>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#corporateSubtle1)"/>
</svg>
  `)}`,
};

export const getCorporatePattern = (patternName: string) => {
  return corporatePatterns[patternName as keyof typeof corporatePatterns] || corporatePatterns['corporate-subtle-1'];
};

export const getCorporateBackgroundStyle = (patternName: string, size: string = '300px') => {
  const pattern = getCorporatePattern(patternName);
  return {
    backgroundImage: `url("${pattern}")`,
    backgroundSize: size,
    backgroundRepeat: 'repeat',
    backgroundPosition: '0% 0%',
  };
};

export const testPattern = () => {
  console.log('Patrones florales cargados:', Object.keys(floralPatterns));
  console.log('Patrones luxury cargados:', Object.keys(luxuryPatterns));
}; 