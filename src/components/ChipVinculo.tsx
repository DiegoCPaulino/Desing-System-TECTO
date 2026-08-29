import type { CSSProperties } from 'react';
import type { TipoVinculo } from '../state/types';

type ChipVinculoProps = {
  tipo: TipoVinculo;
  compacto?: boolean;
  style?: CSSProperties;
};

const ROTULOS: Record<TipoVinculo, string> = {
  funcionario_proprio: 'Funcionário próprio',
  gerente_obras: 'Gerente de Obras',
  assistente_gerenciamento: 'Assistente de Gerenciamento',
  terceirizado: 'Terceirizado',
  administracao: 'Administração',
  financeiro: 'Financeiro',
};

const TRATAMENTOS: Record<TipoVinculo, CSSProperties> = {
  funcionario_proprio: {
    color: '#FFFFFF',
    backgroundColor: '#363636',
    border: '1px solid #363636',
  },
  terceirizado: {
    color: '#363636',
    backgroundColor: 'transparent',
    border: '1px solid #666666',
  },
  administracao: {
    color: '#5E4474',
    backgroundColor: '#F3EEFF',
    border: '1px solid #DDD2EE',
  },
  gerente_obras: {
    color: '#363636',
    backgroundColor: '#EEEEEE',
    border: '1px solid #DDDDDD',
  },
  assistente_gerenciamento: {
    color: '#7A4536',
    backgroundColor: '#F7EDE7',
    border: '1px solid #E8D3C8',
  },
  financeiro: {
    color: '#363636',
    backgroundColor: '#F7F7F5',
    backgroundImage: 'repeating-linear-gradient(135deg, transparent 0 5px, #E7E7E3 5px 6px)',
    border: '1px solid #9A9A9A',
  },
};

export default function ChipVinculo({ tipo, compacto = false, style }: ChipVinculoProps) {
  return (
    <span
      data-componente="chip-vinculo"
      data-tipo-vinculo={tipo}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        minWidth: 0,
        maxWidth: '100%',
        padding: compacto ? '2px 7px' : '3px 10px',
        borderRadius: '999px',
        fontFamily: 'Inter, sans-serif',
        fontSize: compacto ? '10px' : '11px',
        lineHeight: compacto ? '14px' : '16px',
        fontWeight: 600,
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        ...TRATAMENTOS[tipo],
        ...style,
      }}
      title={ROTULOS[tipo]}
    >
      {ROTULOS[tipo]}
    </span>
  );
}
