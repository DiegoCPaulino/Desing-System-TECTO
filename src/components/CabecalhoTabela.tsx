import React from 'react';

interface CabecalhoTabelaProps {
  children: React.ReactNode;
  elemento?: 'th' | 'span' | 'div';
  alinhamento?: React.CSSProperties['textAlign'];
  scope?: 'col' | 'row';
  style?: React.CSSProperties;
}

export default function CabecalhoTabela({
  children,
  elemento = 'th',
  alinhamento = 'left',
  scope,
  style,
}: CabecalhoTabelaProps) {
  const estilos: React.CSSProperties = {
    fontFamily: 'Inter, sans-serif',
    fontSize: '11px',
    lineHeight: '16px',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#666666',
    textAlign: alinhamento,
    ...style,
  };

  if (elemento === 'span') {
    return <span data-componente="cabecalho-tabela" style={estilos}>{children}</span>;
  }

  if (elemento === 'div') {
    return <div data-componente="cabecalho-tabela" style={estilos}>{children}</div>;
  }

  return (
    <th data-componente="cabecalho-tabela" scope={scope} style={estilos}>
      {children}
    </th>
  );
}
