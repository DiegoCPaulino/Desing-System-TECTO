import React from 'react';

type EstadoVazioProps = {
  mensagem: React.ReactNode;
  acao?: React.ReactNode;
  compacto?: boolean;
  tom?: 'neutro' | 'positivo';
  style?: React.CSSProperties;
};

export default function EstadoVazio({
  mensagem,
  acao,
  compacto = false,
  tom = 'neutro',
  style,
}: EstadoVazioProps) {
  const positivo = tom === 'positivo';

  return (
    <div
      role="status"
      data-componente="estado-vazio"
      data-tom={tom}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        minWidth: 0,
        padding: compacto ? '16px' : '32px 24px',
        border: `1px dashed ${positivo ? '#B8DEC8' : '#D7D7D7'}`,
        borderRadius: '10px',
        backgroundColor: positivo ? '#F4FBF7' : '#FAFAFA',
        color: positivo ? '#207A46' : '#666666',
        textAlign: 'center',
        fontFamily: 'Inter, sans-serif',
        fontSize: compacto ? '13px' : '14px',
        lineHeight: compacto ? '18px' : '21px',
        ...style,
      }}
    >
      <span style={{ maxWidth: '560px' }}>{mensagem}</span>
      {acao && <div>{acao}</div>}
    </div>
  );
}
