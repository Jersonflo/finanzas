import { createElement } from 'react';

import { useTheme } from '@/hooks/use-theme';
import { desdeISO, fechaISO } from '@/lib/formato';

/** En la web se usa el selector de fecha del navegador (en el iPhone abre la rueda de Safari). */
export function SelectorFecha({ valor, onCambio }: { valor: Date; onCambio: (fecha: Date) => void }) {
  const theme = useTheme();
  return createElement('input', {
    type: 'date',
    value: fechaISO(valor),
    max: fechaISO(new Date()),
    onChange: (e: { target: { value: string } }) => e.target.value && onCambio(desdeISO(e.target.value)),
    style: {
      backgroundColor: theme.backgroundElement,
      color: theme.text,
      border: 'none',
      borderRadius: 10,
      padding: '8px 12px',
      fontSize: 16,
      fontFamily: 'inherit',
    },
  });
}
