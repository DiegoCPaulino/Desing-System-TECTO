import type { CSSProperties, ElementType, ReactNode } from 'react';

type TituloSecaoProps = {
  children: ReactNode;
  as?: Extract<ElementType, 'h2' | 'h3' | 'p'>;
  id?: string;
  margemInferior?: CSSProperties['marginBottom'];
};

/**
 * Título visual compartilhado para seções da interface.
 * O amarelo aparece apenas no bloco de acento; o texto permanece em grafite.
 */
export default function TituloSecao({
  children,
  as: Tag = 'h2',
  id,
  margemInferior = 0,
}: TituloSecaoProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '9px',
        minWidth: 0,
        margin: 0,
        marginBottom: margemInferior,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: '6px',
          height: '18px',
          borderRadius: '2px',
          backgroundColor: '#FFC213',
          flexShrink: 0,
        }}
      />
      <Tag
        id={id}
        style={{
          margin: 0,
          minWidth: 0,
          fontFamily: 'Inter, sans-serif',
          fontSize: '12px',
          lineHeight: '16px',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#363636',
        }}
      >
        {children}
      </Tag>
    </div>
  );
}
