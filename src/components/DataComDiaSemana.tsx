import React from 'react';
import CabecalhoTabela from './CabecalhoTabela';

const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

const DIAS_DA_SEMANA = [
  'domingo', 'segunda-feira', 'terça-feira', 'quarta-feira',
  'quinta-feira', 'sexta-feira', 'sábado',
];

const DIAS_CURTOS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

type ModoData = 'padrao' | 'destaque' | 'grade';

interface DataComDiaSemanaProps {
  data: string;
  modo?: ModoData;
  style?: React.CSSProperties;
}

function partesDaData(data: string) {
  const [ano, mes, dia] = data.split('-').map(Number);
  const dataLocal = new Date(ano, mes - 1, dia, 12);

  return {
    dia,
    mes: MESES[mes - 1],
    diaDaSemana: DIAS_DA_SEMANA[dataLocal.getDay()],
    diaCurto: DIAS_CURTOS[dataLocal.getDay()],
  };
}

function formatarDataComDiaSemana(data: string): string {
  const { dia, mes, diaDaSemana } = partesDaData(data);
  return `${dia} de ${mes} · ${diaDaSemana}`;
}

export default function DataComDiaSemana({ data, modo = 'padrao', style }: DataComDiaSemanaProps) {
  const partes = partesDaData(data);
  const rotulo = formatarDataComDiaSemana(data);

  if (modo === 'grade') {
    return (
      <span
        data-componente="data-com-dia-semana"
        data-formato={rotulo}
        aria-label={rotulo}
        title={rotulo}
        style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '1px', ...style }}
      >
        <CabecalhoTabela elemento="span">
          {partes.diaCurto}
        </CabecalhoTabela>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '15px', lineHeight: '20px', fontWeight: 700, color: '#363636' }}>
          {partes.dia}
        </span>
      </span>
    );
  }

  const destaque = modo === 'destaque';

  return (
    <span
      data-componente="data-com-dia-semana"
      data-formato={rotulo}
      style={{ display: 'inline-flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '6px', ...style }}
    >
      <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: destaque ? '18px' : '15px', lineHeight: destaque ? '26px' : '22px', fontWeight: destaque ? 700 : 600, color: destaque ? '#000000' : '#363636', letterSpacing: destaque ? '-0.01em' : undefined }}>
        {partes.dia} de {partes.mes}
      </span>
      <span aria-hidden="true" style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#9A9A9A' }}>·</span>
      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', lineHeight: '18px', fontWeight: 600, color: '#363636' }}>
        {partes.diaDaSemana}
      </span>
    </span>
  );
}
