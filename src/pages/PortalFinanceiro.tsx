import React from 'react';
import { useStore } from '../state/store';
import {
  adicionaisDaObra,
  custosVisiveisAoCliente,
  recebimentosDaObra,
  totaisDaObra,
} from '../state/visibilidade';
import TituloSecao from '../components/TituloSecao';
import CabecalhoTabela from '../components/CabecalhoTabela';
import ValorMonetario from '../components/ValorMonetario';

const C = {
  acento: '#FFC213',
  acentoSuave: '#FFFBEE',
  tinta: '#000000',
  grafite: '#363636',
  tintaFraca: '#666666',
  borda: '#E6E6E6',
  fundo: '#F5F5F3',
  superficie: '#FFFFFF',
  neutro: '#9A9A9A',
  positivo: '#2E9E5B',
  positivoFundo: '#EDFAF3',
  informativo: '#215FD7',
  informativoFundo: '#E7F1FF',
} as const;

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ backgroundColor: C.superficie, borderRadius: '16px', border: `1px solid ${C.borda}`, ...style }}>
      {children}
    </div>
  );
}

type Situacao = 'paga' | 'vencendo' | 'futura';

const SITUACAO_STYLE: Record<Situacao, { label: string; color: string; bg: string }> = {
  paga: { label: 'Paga', color: C.positivo, bg: C.positivoFundo },
  vencendo: { label: 'Vence em 5 dias', color: '#8B5E00', bg: '#FFF8E1' },
  futura: { label: 'Futura', color: C.neutro, bg: '#F0F0EE' },
};

const MODALIDADE_STYLE: Record<string, { color: string; bg: string }> = {
  'Reembolsável': { color: C.informativo, bg: C.informativoFundo },
  'Direto do fornecedor': { color: '#6B3FA0', bg: '#F3EEFF' },
};

function formatarDataCurta(data: string) {
  return data.split('-').reverse().join('/');
}

export default function PortalFinanceiro() {
  const state = useStore();
  const obraId = 'o01';
  const parcelas = recebimentosDaObra(state, obraId);
  const adicionais = adicionaisDaObra(state, obraId);
  const materiais = custosVisiveisAoCliente(state, obraId)
    .filter((custo) => custo.modalidade_rotulo !== 'Serviço TECTO');
  const totais = totaisDaObra(state, obraId);
  const totalAdicionais = adicionais.reduce((soma, adicional) => soma + adicional.valor_centavos, 0);

  return (
    <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '48px 32px 80px', fontFamily: 'Inter, sans-serif' }}>

      {/* ── Title ── */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '36px', fontWeight: 700, color: C.tinta, letterSpacing: '-0.02em', margin: 0, lineHeight: '1.1' }}>
          Financeiro da sua obra
        </h1>
      </div>

      {/* ── Top summary cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '28px' }}>

        {/* Total da obra */}
        <Card style={{ padding: '28px' }}>
          <TituloSecao>Total da obra</TituloSecao>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '32px', fontWeight: 700, color: C.tinta, letterSpacing: '-0.02em', marginTop: '12px', fontVariantNumeric: 'tabular-nums' }}>
            <ValorMonetario valorCentavos={totais.total_centavos} />
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.tintaFraca, marginTop: '10px', lineHeight: '18px' }}>
            inclui <ValorMonetario valorCentavos={totalAdicionais} alinhamento="left" /> em serviços adicionais aprovados
          </p>
        </Card>

        {/* Já pago */}
        <Card style={{ padding: '28px' }}>
          <TituloSecao>Já pago</TituloSecao>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '32px', fontWeight: 700, color: C.positivo, letterSpacing: '-0.02em', marginTop: '12px', fontVariantNumeric: 'tabular-nums' }}>
            <ValorMonetario valorCentavos={totais.recebido_centavos} style={{ color: C.positivo }} />
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.tintaFraca, marginTop: '10px' }}>
            {Math.round((totais.recebido_centavos / totais.total_centavos) * 100)}% do total
          </p>
        </Card>

        {/* A pagar */}
        <Card style={{ padding: '28px' }}>
          <TituloSecao>A pagar</TituloSecao>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '32px', fontWeight: 700, color: C.tinta, letterSpacing: '-0.02em', marginTop: '12px', fontVariantNumeric: 'tabular-nums' }}>
            <ValorMonetario valorCentavos={totais.a_receber_centavos} />
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.tintaFraca, marginTop: '10px' }}>
            restante para conclusão
          </p>
        </Card>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* ── Parcelas ── */}
        <Card>
          <div style={{ padding: '24px 28px 20px' }}>
            <TituloSecao>Parcelas</TituloSecao>
          </div>

          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 160px 200px 120px', gap: '0', padding: '0 28px 12px', borderBottom: `1px solid ${C.borda}` }}>
            {['Parcela', 'Vencimento', 'Valor', 'Situação', ''].map((h, i) => (
              <CabecalhoTabela key={i} elemento="span" style={{ color: C.neutro }}>
                {h}
              </CabecalhoTabela>
            ))}
          </div>

          {parcelas.map((p, idx) => {
            const s = SITUACAO_STYLE[p.situacao];
            return (
              <div
                key={p.id}
                style={{
                  display: 'grid', gridTemplateColumns: '80px 1fr 160px 200px 120px',
                  padding: '16px 28px',
                  borderBottom: idx < parcelas.length - 1 ? `1px solid ${C.borda}` : 'none',
                  backgroundColor: p.situacao === 'vencendo' ? '#FFFDF0' : 'transparent',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '14px', color: C.grafite }}>{p.numero}ª</span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: C.grafite }}>{formatarDataCurta(p.vencimento)}</span>
                <ValorMonetario valorCentavos={p.valor_centavos} style={{ fontSize: '15px', color: C.tinta, fontWeight: 500 }} />
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 500, color: s.color, backgroundColor: s.bg, padding: '4px 12px', borderRadius: '999px', display: 'inline-flex', alignItems: 'center', gap: '6px', width: 'fit-content' }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: s.color, flexShrink: 0 }} />
                  {s.label}
                </span>
                <span>
                  {p.situacao === 'paga' && (
                    <button style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.informativo, background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
                      Comprovante
                    </button>
                  )}
                </span>
              </div>
            );
          })}
        </Card>

        {/* ── Serviços Adicionais Aprovados ── */}
        <Card>
          <div style={{ padding: '24px 28px 20px' }}>
            <TituloSecao>Serviços adicionais aprovados</TituloSecao>
          </div>

          {adicionais.map((a) => (
            <div
              key={a.id}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px',
                padding: '16px 28px',
                borderTop: `1px solid ${C.borda}`,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: C.grafite }}>{a.descricao}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.neutro, marginTop: '4px' }}>Aprovado em {formatarDataCurta(a.aprovado_em)}</p>
              </div>
              <ValorMonetario valorCentavos={a.valor_centavos} style={{ fontSize: '15px', fontWeight: 600, color: C.tinta, flexShrink: 0 }} />
            </div>
          ))}

          {/* Total adicionais */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 28px', borderTop: `2px solid ${C.borda}`, backgroundColor: '#FAFAFA' }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, color: C.grafite }}>Total em adicionais</span>
            <ValorMonetario valorCentavos={totalAdicionais} style={{ fontSize: '16px', fontWeight: 700, color: C.tinta }} />
          </div>
        </Card>

        {/* ── Materiais e Notas ── */}
        <Card>
          <div style={{ padding: '24px 28px 20px' }}>
            <TituloSecao>Materiais e notas</TituloSecao>
          </div>

          {materiais.map((m) => {
            const ms = MODALIDADE_STYLE[m.modalidade_rotulo];
            return (
              <div
                key={m.id}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px',
                  padding: '16px 28px',
                  borderTop: `1px solid ${C.borda}`,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, color: C.grafite }}>{m.fornecedor}</span>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 500, color: ms.color, backgroundColor: ms.bg, padding: '2px 10px', borderRadius: '999px' }}>
                      {m.modalidade_rotulo}
                    </span>
                  </div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.tintaFraca, lineHeight: '20px' }}>{m.descricao}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.neutro, marginTop: '4px' }}>{formatarDataCurta(m.data)}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0 }}>
                  <ValorMonetario valorCentavos={m.valor_centavos} style={{ fontSize: '15px', fontWeight: 600, color: C.tinta }} />
                  <button style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.informativo, background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
                    Ver nota
                  </button>
                </div>
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}
