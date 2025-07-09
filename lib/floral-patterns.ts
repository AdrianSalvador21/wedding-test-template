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

// Función de prueba para verificar que los patrones funcionan
export const testPattern = () => {
  console.log('Pattern 1 length:', floralPatterns.pattern1.length);
  console.log('Pattern 2 length:', floralPatterns.pattern2.length);
  console.log('Pattern 3 length:', floralPatterns.pattern3.length);
  console.log('Pattern 4 length:', floralPatterns.pattern4.length);
  console.log('Pattern 5 length:', floralPatterns.pattern5.length);
}; 