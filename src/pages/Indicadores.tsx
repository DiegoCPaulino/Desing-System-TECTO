import React, { useMemo, useState } from 'react';
import { useStore, formatarReais } from '../state/store';
import TituloSecao from '../components/TituloSecao';
import CabecalhoTabela from '../components/CabecalhoTabela';
import {
  indicadoresConsolidados,
  type IndicadoresConsolidados,
  type Periodo,
} from '../state/indicadores';

/**
 * INDICADORES — o painel executivo.
 *
 * Nenhum número é calculado aqui. Tudo vem de `src/state/indicadores.ts`, em
 * centavos, e só vira texto na exibição.
 *
 * A `Q-032` — "quais indicadores o dashboard precisa mostrar, em ordem de
 * importância" — está ABERTA. Esta tela mostra o que a T5 calculou, e não
 * afirma uma ordem de prioridade. A hierarquia visual segue a única coisa que
 * está decidida: a margem da empresa é a pergunta que paga a conta.
 *
 * Os `avisos` do consolidado aparecem em destaque, e não em rodapé. O módulo de
 * cálculo foi escrito para que esta tela não conseguisse exibir número pelado.
 */

const C = {
  tinta: '#000000',
  grafite: '#363636',
  tintaFraca: '#666666',
  borda: '#E6E6E6',
  fundo: '#FAFAFA',
  superficie: '#FFFFFF',
  acento: '#FFC213',
  acentoFundo: '#FFF6D6',
  positivo: '#2E9E5B',
  atencao: '#E8833A',
  negativo: '#C94141',
  neutro: '#9A9A9A',
  informativo: '#215FD7',
  informativoFundo: '#E7F1FF',
} as const;

const rotulo: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: C.tintaFraca,
};

const numero: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontVariantNumeric: 'tabular-nums',
};

const celula: React.CSSProperties = {
  ...numero,
  padding: '11px 12px',
  borderBottom: `1px solid ${C.borda}`,
  fontSize: '14px',
  color: C.tinta,
};

const celulaNum: React.CSSProperties = { ...celula, textAlign: 'right' };

/**
 * `formatarReais` produz "R$ -6.946,00", com o sinal entre o símbolo e o
 * número. Até o `ValorMonetario` do outro agente chegar a esta tela, o sinal é
 * tratado aqui — número negativo em tela de dinheiro precisa ser legível.
 */
function dinheiro(centavos: number): string {
  return centavos < 0 ? `− ${formatarReais(Math.abs(centavos))}` : formatarReais(centavos);
}

const PERIODOS: { id: string; rotulo: string; periodo: Periodo }[] = [
  { id: 'ago', rotulo: 'Agosto', periodo: { inicio: '2026-08-01', fim: '2026-08-31' } },
  { id: 'jul', rotulo: 'Julho', periodo: { inicio: '2026-07-01', fim: '2026-07-31' } },
  { id: 'tri', rotulo: 'Últimos 3 meses', periodo: { inicio: '2026-06-01', fim: '2026-08-31' } },
  { id: 'ano', rotulo: '2026', periodo: { inicio: '2026-01-01', fim: '2026-12-31' } },
];

function Cartao({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        backgroundColor: C.superficie,
        border: `1px solid ${C.borda}`,
        borderRadius: '12px',
        padding: '20px',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Barra proporcional. O amarelo é preenchimento, nunca cor de texto. */
function Barra({ pct, cor }: { pct: number; cor: string }) {
  return (
    <div style={{ height: '8px', backgroundColor: C.borda, borderRadius: '999px', overflow: 'hidden' }}>
      <div
        style={{
          width: `${Math.max(0, Math.min(100, pct))}%`,
          height: '100%',
          backgroundColor: cor,
          borderRadius: '999px',
          transition: 'width 0.4s ease',
        }}
      />
    </div>
  );
}

export default function Indicadores() {
  const state = useStore();
  // Agosto está pela metade — hoje é dia 20. O padrão é a janela fechada mais
  // recente, que é o que um painel executivo mostra: mês corrente sozinho dá
  // uma leitura parcial que parece resultado.
  const [periodoId, setPeriodoId] = useState('tri');

  const periodo = PERIODOS.find((p) => p.id === periodoId)!.periodo;
  const ind: IndicadoresConsolidados = useMemo(
    () => indicadoresConsolidados(state, periodo),
    [state, periodo]
  );

  const comMovimento = ind.por_obra.filter(
    (o) =>
      o.receita_contratada_centavos > 0 ||
      o.custo_mao_de_obra_empresa_centavos > 0 ||
      o.margem_repasses_centavos > 0
  );

  const maiorDespesa = Math.max(1, ...ind.despesas_por_categoria.map((d) => d.total_centavos));
  const margemNegativa = ind.margem_da_empresa_centavos < 0;

  return (
    <div style={{ padding: '32px 40px', backgroundColor: C.fundo, minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      {/* ── Cabeçalho ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '26px', color: C.tinta, margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            Indicadores
          </h1>
          <p style={{ fontSize: '14px', color: C.tintaFraca, margin: 0 }}>
            Resultado das obras e da empresa no período.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {PERIODOS.map((p) => {
            const ativo = p.id === periodoId;
            return (
              <button
                key={p.id}
                onClick={() => setPeriodoId(p.id)}
                style={{
                  padding: '8px 14px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '13px',
                  fontWeight: ativo ? 600 : 400,
                  color: C.tinta,
                  backgroundColor: ativo ? C.acento : C.superficie,
                  border: `1px solid ${ativo ? C.acento : C.borda}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                {p.rotulo}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Os três números de topo ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <Cartao>
          <p style={{ ...rotulo, margin: '0 0 8px' }}>Receita contratada</p>
          <p style={{ ...numero, fontSize: '28px', fontWeight: 600, color: C.tinta, margin: 0 }}>
            {formatarReais(ind.receita_contratada_centavos)}
          </p>
          <p style={{ fontSize: '13px', color: C.tintaFraca, margin: '8px 0 0' }}>
            recebido no período: <strong style={numero}>{formatarReais(ind.receita_recebida_centavos)}</strong>
          </p>
        </Cartao>

        <Cartao>
          <p style={{ ...rotulo, margin: '0 0 8px' }}>Custo de mão de obra</p>
          <p style={{ ...numero, fontSize: '28px', fontWeight: 600, color: C.tinta, margin: 0 }}>
            {formatarReais(ind.custo_mao_de_obra_empresa_centavos)}
          </p>
          <p style={{ fontSize: '13px', color: C.tintaFraca, margin: '8px 0 0' }}>
            custo real para a empresa, com encargos
          </p>
        </Cartao>

        <Cartao style={{ borderColor: margemNegativa ? C.negativo : C.acento, borderWidth: '2px' }}>
          <p style={{ ...rotulo, margin: '0 0 8px' }}>Margem da empresa</p>
          <p style={{ ...numero, fontSize: '28px', fontWeight: 700, color: margemNegativa ? C.negativo : C.positivo, margin: 0 }}>
            {dinheiro(ind.margem_da_empresa_centavos)}
          </p>
          <p style={{ fontSize: '13px', color: C.tintaFraca, margin: '8px 0 0' }}>
            depois das despesas gerais
          </p>
        </Cartao>
      </div>

      {/* ── A conta que separa obra de empresa ── */}
      <Cartao style={{ marginBottom: '24px' }}>
        <TituloSecao margemInferior={16}>Da obra para a empresa</TituloSecao>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', alignItems: 'end' }}>
          <div>
            <p style={{ ...rotulo, margin: '0 0 6px' }}>Margem das obras</p>
            <p style={{ ...numero, fontSize: '20px', fontWeight: 600, color: C.tinta, margin: '0 0 8px' }}>
              {formatarReais(ind.margem_das_obras_centavos)}
            </p>
            <Barra pct={100} cor={C.acento} />
          </div>
          <div>
            <p style={{ ...rotulo, margin: '0 0 6px' }}>Despesas da empresa</p>
            <p style={{ ...numero, fontSize: '20px', fontWeight: 600, color: C.negativo, margin: '0 0 8px' }}>
              − {formatarReais(ind.despesas_empresa_centavos)}
            </p>
            <Barra
              pct={ind.margem_das_obras_centavos ? (ind.despesas_empresa_centavos / ind.margem_das_obras_centavos) * 100 : 0}
              cor={C.negativo}
            />
          </div>
          <div>
            <p style={{ ...rotulo, margin: '0 0 6px' }}>Sobra para a empresa</p>
            <p style={{ ...numero, fontSize: '20px', fontWeight: 700, color: margemNegativa ? C.negativo : C.positivo, margin: '0 0 8px' }}>
              {dinheiro(ind.margem_da_empresa_centavos)}
            </p>
            <Barra
              pct={ind.margem_das_obras_centavos ? (ind.margem_da_empresa_centavos / ind.margem_das_obras_centavos) * 100 : 0}
              cor={margemNegativa ? C.negativo : C.positivo}
            />
          </div>
        </div>
        <p style={{ fontSize: '13px', color: C.tintaFraca, margin: '16px 0 0', maxWidth: '680px' }}>
          A margem das obras responde <em>“as obras deram lucro”</em>. A sobra responde{' '}
          <em>“a empresa deu lucro”</em>, que é a pergunta que paga a conta — despesa geral não
          pertence a obra nenhuma.
        </p>
      </Cartao>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {/* ── Despesas por categoria ── */}
        <Cartao>
          <TituloSecao margemInferior={16}>Despesas da empresa</TituloSecao>
          {ind.despesas_empresa_centavos === 0 ? (
            <p style={{ fontSize: '14px', color: C.tintaFraca, margin: 0 }}>
              Nenhuma despesa lançada neste período. Elas aparecem aqui assim que o Financeiro
              registrar a primeira.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {ind.despesas_por_categoria.filter((d) => d.total_centavos > 0).map((d) => (
                <div key={d.categoria}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '14px', color: C.tinta }}>{d.rotulo}</span>
                    <span style={{ ...numero, fontSize: '14px', fontWeight: 600, color: C.tinta }}>
                      {formatarReais(d.total_centavos)}
                    </span>
                  </div>
                  <Barra pct={(d.total_centavos / maiorDespesa) * 100} cor={C.grafite} />
                </div>
              ))}
            </div>
          )}
        </Cartao>

        {/* ── Custos por modalidade ── */}
        <Cartao>
          <TituloSecao margemInferior={16}>Custos por modalidade</TituloSecao>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '320px' }}>
              <thead>
                <tr>
                  <CabecalhoTabela>Modalidade</CabecalhoTabela>
                  <CabecalhoTabela alinhamento="right">Cobrado</CabecalhoTabela>
                  <CabecalhoTabela alinhamento="right">Margem</CabecalhoTabela>
                </tr>
              </thead>
              <tbody>
                {ind.custos_por_modalidade.map((m) => (
                  <tr key={m.modalidade}>
                    <td style={celula}>
                      {m.rotulo}
                      <span style={{ fontSize: '12px', color: C.neutro }}> · {m.quantidade}</span>
                    </td>
                    <td style={celulaNum}>{formatarReais(m.cobrado_centavos)}</td>
                    <td style={{ ...celulaNum, color: m.margem_centavos > 0 ? C.positivo : C.neutro }}>
                      {m.margem_centavos > 0 ? formatarReais(m.margem_centavos) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '13px', color: C.tintaFraca, margin: '12px 0 0' }}>
            Só serviço repassado com margem gera resultado. Reembolsável entra e sai; direto do
            cliente não passa pelo caixa da TECTO.
          </p>
        </Cartao>
      </div>

      {/* ── Por obra ── */}
      <Cartao style={{ marginBottom: '24px' }}>
        <TituloSecao margemInferior={16}>Resultado por obra</TituloSecao>
        {comMovimento.length === 0 ? (
          <p style={{ fontSize: '14px', color: C.tintaFraca, margin: 0 }}>
            Nenhuma obra teve movimento neste período. Escolha outro acima.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '640px' }}>
              <thead>
                <tr>
                  <CabecalhoTabela>Obra</CabecalhoTabela>
                  <CabecalhoTabela alinhamento="right">Receita</CabecalhoTabela>
                  <CabecalhoTabela alinhamento="right">Mão de obra</CabecalhoTabela>
                  <CabecalhoTabela alinhamento="right">Repasses</CabecalhoTabela>
                  <CabecalhoTabela alinhamento="right">Margem</CabecalhoTabela>
                </tr>
              </thead>
              <tbody>
                {comMovimento.map((o) => {
                  const negativa = o.margem_sobre_contratado_centavos < 0;
                  return (
                    <tr key={o.obra_id}>
                      <td style={celula}>{o.codigo}</td>
                      <td style={celulaNum}>{formatarReais(o.receita_contratada_centavos)}</td>
                      <td style={{ ...celulaNum, color: C.negativo }}>
                        − {formatarReais(o.custo_mao_de_obra_empresa_centavos)}
                      </td>
                      <td style={{ ...celulaNum, color: o.margem_repasses_centavos > 0 ? C.positivo : C.neutro }}>
                        {o.margem_repasses_centavos > 0 ? formatarReais(o.margem_repasses_centavos) : '—'}
                      </td>
                      <td style={{ ...celulaNum, fontWeight: 700, color: negativa ? C.negativo : C.tinta }}>
                        {dinheiro(o.margem_sobre_contratado_centavos)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td style={{ ...celula, fontWeight: 600 }}>Total</td>
                  <td style={{ ...celulaNum, fontWeight: 600 }}>{formatarReais(ind.receita_contratada_centavos)}</td>
                  <td style={{ ...celulaNum, fontWeight: 600, color: C.negativo }}>
                    − {formatarReais(ind.custo_mao_de_obra_empresa_centavos)}
                  </td>
                  <td style={{ ...celulaNum, fontWeight: 600 }}>
                    {ind.margem_repasses_centavos > 0 ? formatarReais(ind.margem_repasses_centavos) : '—'}
                  </td>
                  <td style={{ ...celulaNum, fontWeight: 700 }}>{dinheiro(ind.margem_das_obras_centavos)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Cartao>

      {/* ── O que estes números NÃO contêm ── */}
      <Cartao style={{ backgroundColor: C.informativoFundo, borderColor: C.informativo }}>
        <TituloSecao margemInferior={12}>O que estes números não contêm</TituloSecao>
        <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {ind.avisos.map((aviso, i) => (
            <li key={i} style={{ fontSize: '14px', color: C.grafite, lineHeight: '20px' }}>
              {aviso}
            </li>
          ))}
        </ul>
      </Cartao>
    </div>
  );
}
