import React from 'react';

/**
 * Convierte saltos de línea (\n o /n) en elementos <br> de React
 * @param text - El texto que puede contener \n o /n
 * @returns Array de elementos React con saltos de línea
 */
export const formatTextWithLineBreaks = (text: string): React.ReactNode => {
  if (!text) return text;
  
  // Detectar tanto \n como /n y convertirlos a saltos de línea
  const textWithBreaks = text
    .replace(/\\n/g, '\n')  // Convertir \\n a \n
    .replace(/\/n/g, '\n'); // Convertir /n a \n
  
  return textWithBreaks.split('\n').map((line, index, array) => (
    <React.Fragment key={index}>
      {line}
      {index < array.length - 1 && <br />}
    </React.Fragment>
  ));
};

/**
 * Convierte saltos de línea reales (\n) en elementos <br> de React
 * Útil para textos que vienen con saltos de línea reales del backend
 * @param text - El texto que puede contener saltos de línea reales
 * @returns Array de elementos React con saltos de línea
 */
export const formatRealLineBreaks = (text: string): React.ReactNode => {
  if (!text) return text;
  
  return text.split('\n').map((line, index, array) => (
    <React.Fragment key={index}>
      {line}
      {index < array.length - 1 && <br />}
    </React.Fragment>
  ));
};
