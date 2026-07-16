import React from 'react';

/**
 * Grammatikterm med hover-tooltip som visar termen på källspråket,
 * i stil med icelandicgrammar.com. Fungerar för både tyska och italienska:
 *   <Term de="Partizip II">perfekt particip</Term>
 *   <Term it="participio passato">perfekt particip</Term>
 */
export default function Term({de, it, children}) {
  const label = it ? `🇮🇹 ${it}` : de ? `🇩🇪 ${de}` : '';
  return (
    <span className="grammar-term">
      {children}
      <span className="grammar-term-tooltip">{label}</span>
    </span>
  );
}
