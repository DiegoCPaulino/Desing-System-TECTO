import React from 'react';
import { useStore, formatarReais } from '../state/store';
import TituloSecao from '../components/TituloSecao';

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

const PARCELAS = [
  { num: 1, vencimento: '14/04/2026', valor: 'R$ 32.160,00', status: 'paga' as const },
  { num: 2, vencimento: '14/05/2026', valor: 'R$ 32.160,00', status: 'paga' as const },
  { num: 3, vencimento: '14/07/2026', valor: 'R$ 32.160,00', status: 'paga' as const },
  { num: 4, vencimento: '25/08/2026', valor: 'R$ 32.160,00', status: 'vencendo' as const },
  { num: 5, vencimento: '14/09/2026', valor: 'R$ 16.080,00', status: 'futura' as const },
  { num: 6, vencimento: '14/10/2026', valor: 'R$ 16.080,00', status: 'futura' as const },
];

const ADICIONAIS = [
  { descricao: 'Reforço de impermeabilização no lavabo', aprovacao: '15/06/2026', valor: 'R$ 7.480,00' },
  { descricao: 'Tomadas adicionais e pontos de dados na cozinha', aprovacao: '03/07/2026', valor: 'R$ 5.000,00' },
];

const MATERIAIS = [
  { fornecedor: 'Mármores Paulista', descricao: 'Bancada de mármore branco — cozinha e banheiro', data: '22/07/2026', valor: 'R$ 18.400,00', modalidade: 'Reembolsável' as const },
  { fornecedor: 'NX Marcenaria', descricao: 'Instalação completa de marcenaria — dormitórios e cozinha', data: '05/08/2026', valor: 'R$ 45.600,00', modalidade: 'Direto do fornecedor' as const },
  { fornecedor: 'Eletromed', descricao: 'Sistema de ar-condicionado split — 3 ambientes', data: '10/08/2026', valor: 'R$ 9.200,00', modalidade: 'Reembolsável' as const },
  { fornecedor: 'Vidraçaria Santos', descricao: 'Box de vidro temperado e espelhos sob medida', data: '12/08/2026', valor: 'R$ 8.800,00', modalidade: 'Direto do fornecedor' as const },
];

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

type Modalidade = 'Reembolsável' | 'Direto do fornecedor';

const MODALIDADE_STYLE: Record<Modalidade, { color: string; bg: string }> = {
  'Reembolsável': { color: C.informativo, bg: C.informativoFundo },
  'Direto do fornecedor': { color: '#6B3FA0', bg: '#F3EEFF' },
};

export default function PortalFinanceiro() {
  const state = useStore();
  const obra = state.obras.find(o => o.id === 'o01')!;

  const total = obra.valor_contratado_centavos + obra.adicionais_centavos;
  const jaPago = obra.recebido_centavos;
  const aPagar = total - jaPago;

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
            {formatarReais(total)}
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.tintaFraca, marginTop: '10px', lineHeight: '18px' }}>
            inclui {formatarReais(obra.adicionais_centavos)} em serviços adicionais aprovados
          </p>
        </Card>

        {/* Já pago */}
        <Card style={{ padding: '28px' }}>
          <TituloSecao>Já pago</TituloSecao>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '32px', fontWeight: 700, color: C.positivo, letterSpacing: '-0.02em', marginTop: '12px', fontVariantNumeric: 'tabular-nums' }}>
            {formatarReais(jaPago)}
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.tintaFraca, marginTop: '10px' }}>
            {Math.round((jaPago / total) * 100)}% do total
          </p>
        </Card>

        {/* A pagar */}
        <Card style={{ padding: '28px' }}>
          <TituloSecao>A pagar</TituloSecao>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '32px', fontWeight: 700, color: C.tinta, letterSpacing: '-0.02em', marginTop: '12px', fontVariantNumeric: 'tabular-nums' }}>
            {formatarReais(aPagar)}
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
              <span key={i} style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: C.neutro }}>
                {h}
              </span>
            ))}
          </div>

          {PARCELAS.map((p, idx) => {
            const s = SITUACAO_STYLE[p.status];
            return (
              <div
                key={p.num}
                style={{
                  display: 'grid', gridTemplateColumns: '80px 1fr 160px 200px 120px',
                  padding: '16px 28px',
                  borderBottom: idx < PARCELAS.length - 1 ? `1px solid ${C.borda}` : 'none',
                  backgroundColor: p.status === 'vencendo' ? '#FFFDF0' : 'transparent',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '14px', color: C.grafite }}>{p.num}ª</span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: C.grafite }}>{p.vencimento}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '15px', color: C.tinta, fontWeight: 500 }}>{p.valor}</span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 500, color: s.color, backgroundColor: s.bg, padding: '4px 12px', borderRadius: '999px', display: 'inline-flex', alignItems: 'center', gap: '6px', width: 'fit-content' }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: s.color, flexShrink: 0 }} />
                  {s.label}
                </span>
                <span>
                  {p.status === 'paga' && (
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

          {ADICIONAIS.map((a, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px',
                padding: '16px 28px',
                borderTop: `1px solid ${C.borda}`,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: C.grafite }}>{a.descricao}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.neutro, marginTop: '4px' }}>Aprovado em {a.aprovacao}</p>
              </div>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '15px', fontWeight: 600, color: C.tinta, flexShrink: 0 }}>{a.valor}</span>
            </div>
          ))}

          {/* Total adicionais */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 28px', borderTop: `2px solid ${C.borda}`, backgroundColor: '#FAFAFA' }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, color: C.grafite }}>Total em adicionais</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '16px', fontWeight: 700, color: C.tinta }}>
              {formatarReais(obra.adicionais_centavos)}
            </span>
          </div>
        </Card>

        {/* ── Materiais e Notas ── */}
        <Card>
          <div style={{ padding: '24px 28px 20px' }}>
            <TituloSecao>Materiais e notas</TituloSecao>
          </div>

          {MATERIAIS.map((m, idx) => {
            const ms = MODALIDADE_STYLE[m.modalidade];
            return (
              <div
                key={idx}
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
                      {m.modalidade}
                    </span>
                  </div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.tintaFraca, lineHeight: '20px' }}>{m.descricao}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.neutro, marginTop: '4px' }}>{m.data}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0 }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '15px', fontWeight: 600, color: C.tinta }}>{m.valor}</span>
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
