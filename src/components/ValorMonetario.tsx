import type { CSSProperties } from 'react';
import { formatarReais } from '../state/store';

type ValorMonetarioProps = {
  valorCentavos: number;
  alinhamento?: CSSProperties['textAlign'];
  style?: CSSProperties;
};

/**
 * Único ponto de formatação visual de dinheiro nas telas.
 * Recebe sempre centavos inteiros e mantém símbolo e número inseparáveis.
 */
export default function ValorMonetario({
  valorCentavos,
  alinhamento = 'right',
  style,
}: ValorMonetarioProps) {
  const negativo = valorCentavos < 0;
  const texto = `${negativo ? '−' : ''}${formatarReais(Math.abs(valorCentavos))}`;

  return (
    <span
      data-componente="valor-monetario"
      data-valor-centavos={valorCentavos}
      style={{
        display: 'inline-block',
        maxWidth: '100%',
        fontFamily: 'Inter, sans-serif',
        fontSize: 'inherit',
        fontWeight: 'inherit',
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '-0.01em',
        lineHeight: 'inherit',
        textAlign: alinhamento,
        whiteSpace: 'nowrap',
        ...style,
        color: negativo ? '#C94141' : style?.color,
      }}
    >
      {texto}
    </span>
  );
}
