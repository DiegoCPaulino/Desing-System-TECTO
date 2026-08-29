import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useStore, obraPorSlug } from '../state/store';
import { recebimentosDaObra, totaisDaObra, adicionaisDaObra } from '../state/visibilidade';
import { notasPorTipo, tiposDeNotaComCusto } from '../state/documentos';
import { maoDeObraPorPessoa } from '../state/pessoa';
import { custosPorModalidade, margemDeRepasses, type Periodo } from '../state/indicadores';
import type { ModalidadeFinanceira } from '../state/types';
import AbasDaObra from '../components/AbasDaObra';
import TituloSecao from '../components/TituloSecao';
import CabecalhoTabela from '../components/CabecalhoTabela';
import ValorMonetario from '../components/ValorMonetario';
import EstadoVazio from '../components/EstadoVazio';
import Avatar from '../components/Avatar';
import EmBreve from './EmBreve';

/**
 * FINANCEIRO DA OBRA — a operação detalhada de uma obra.
 *
 * A fronteira com as outras duas telas de dinheiro, que a T8 pede explícita:
 *
 *  - `/indicadores` é leitura rápida do conjunto. Não desce ao lançamento.
 *  - `/financeiro` é o Fechamento de ciclo, por PESSOA e por ciclo.
 *  - esta é por OBRA: o que entra do Cliente, o que sai para terceiros e
 *    quanto de mão de obra a obra consumiu.
 *
 * Nenhum número é escrito aqui. Tudo vem de `src/state/`, e os totais de mão de
 * obra são os mesmos que os Indicadores mostram — mesma função de origem.
 *
 * `RN-136`: esta tela é INTERNA e mostra custo e margem. A rota exclui o
 * Gerente de Obras e o Cliente nunca chega nela — o Portal tem tela própria,
 * montada por `custosVisiveisAoCliente`.
 */

const C = {
  acento: '#FFC213',
  acentoFundo: '#FFF6D6',
  tinta: '#000000',
  grafite: '#363636',
  tintaFraca: '#666666',
  borda: '#E6E6E6',
  fundo: '#FAFAFA',
  superficie: '#FFFFFF',
  positivo: '#2E9E5B',
  atencao: '#E8833A',
  negativo: '#C94141',
  neutro: '#9A9A9A',
  informativo: '#215FD7',
} as const;

const PERIODOS: { id: string; rotulo: string; periodo: Periodo }[] = [
  { id: 'ago', rotulo: 'Agosto', periodo: { inicio: '2026-08-01', fim: '2026-08-31' } },
  { id: 'tri', rotulo: 'Últimos 3 meses', periodo: { inicio: '2026-06-01', fim: '2026-08-31' } },
  { id: 'ano', rotulo: '2026', periodo: { inicio: '2026-01-01', fim: '2026-12-31' } },
];

const ROTULO_MODALIDADE: Record<ModalidadeFinanceira, string> = {
  repassado_com_margem: 'Repassado com margem',
  reembolsavel: 'Reembolsável',
  direto_do_cliente: 'Direto do cliente',
};

const SITUACAO_RECEBIMENTO: Record<string, { rotulo: string; cor: string; fundo: string }> = {
  paga: { rotulo: 'Paga', cor: C.positivo, fundo: '#E8F5ED' },
  vencendo: { rotulo: 'Vencendo', cor: C.atencao, fundo: '#FDF0E5' },
  futura: { rotulo: 'Futura', cor: C.tintaFraca, fundo: '#F2F2F2' },
};

function dataCurta(iso: string): string {
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano.slice(2)}`;
}

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

const TD: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontSize: '14px',
  color: C.grafite,
  padding: '11px 12px',
  borderBottom: `1px solid ${C.borda}`,
  verticalAlign: 'middle',
};

export default function ObraFinanceiro() {
  const { obraId } = useParams<{ obraId: string }>();
  const state = useStore();
  const [periodoId, setPeriodoId] = useState('tri');
  const [tipoNota, setTipoNota] = useState<string | undefined>(undefined);

  const obra = obraId ? obraPorSlug(state, obraId) : undefined;
  const periodo = PERIODOS.find((p) => p.id === periodoId)!.periodo;

  const dados = useMemo(() => {
    if (!obra) return undefined;
    return {
      recebimentos: recebimentosDaObra(state, obra.id),
      totais: totaisDaObra(state, obra.id),
      adicionais: adicionaisDaObra(state, obra.id),
      modalidades: custosPorModalidade(state, periodo, obra.id),
      margem: margemDeRepasses(state, obra.id, periodo),
      maoDeObra: maoDeObraPorPessoa(state, obra.id, periodo),
      tiposDeNota: tiposDeNotaComCusto(state, obra.id),
      notas: notasPorTipo(state, obra.id, tipoNota),
    };
  }, [state, obra, periodo, tipoNota]);

  if (!obra || !dados) return <EmBreve />;

  const maoDeObraLiquido = dados.maoDeObra.reduce((s, l) => s + l.liquido_centavos, 0);
  const maoDeObraEmpresa = dados.maoDeObra.reduce((s, l) => s + l.empresa_centavos, 0);
  const semCusto = dados.maoDeObra.reduce((s, l) => s + l.dias_sem_custo, 0);
  const totalCobrado = dados.modalidades.reduce((s, m) => s + m.cobrado_centavos, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <AbasDaObra
        obra={obra}
        titulo="Financeiro"
        resumo={obra.cliente}
        acao={
          <div style={{ display: 'flex', gap: '6px' }}>
            {PERIODOS.map((p) => {
              const ativo = p.id === periodoId;
              return (
                <button
                  key={p.id}
                  onClick={() => setPeriodoId(p.id)}
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '13px',
                    fontWeight: ativo ? 600 : 400,
                    color: ativo ? C.tinta : C.tintaFraca,
                    backgroundColor: ativo ? C.acento : C.superficie,
                    border: `1px solid ${ativo ? C.acento : C.borda}`,
                    borderRadius: '8px',
                    padding: '7px 14px',
                    cursor: 'pointer',
                  }}
                >
                  {p.rotulo}
                </button>
              );
            })}
          </div>
        }
      />

      {/* ── Recebimentos do cliente ───────────────────────────────────────── */}
      <Cartao>
        <TituloSecao margemInferior="16px">Recebimentos do cliente</TituloSecao>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '12px' }}>
          {[
            // O total das parcelas JÁ inclui os adicionais aprovados, e por isso
            // é maior que `obra.valor_contratado_centavos`. Os dois números
            // estão certos; rotular este de "contratado" é que os faria brigar
            // na mesma tela.
            { rotulo: 'Contrato mais adicionais', valor: dados.totais.total_centavos, cor: C.tinta },
            { rotulo: 'Recebido', valor: dados.totais.recebido_centavos, cor: C.positivo },
            { rotulo: 'A receber', valor: dados.totais.a_receber_centavos, cor: C.atencao },
          ].map((b) => (
            <div key={b.rotulo} style={{ backgroundColor: C.fundo, borderRadius: '10px', padding: '14px 16px' }}>
              <CabecalhoTabela elemento="div">{b.rotulo}</CabecalhoTabela>
              <ValorMonetario
                valorCentavos={b.valor}
                alinhamento="left"
                style={{ fontSize: '20px', fontWeight: 600, color: b.cor, marginTop: '4px' }}
              />
            </div>
          ))}
        </div>

        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.tintaFraca, marginBottom: '20px', lineHeight: '17px' }}>
          Contrato base de{' '}
          <ValorMonetario
            valorCentavos={obra.valor_contratado_centavos}
            alinhamento="left"
            style={{ fontSize: '12px', color: C.grafite, fontWeight: 500 }}
          />
          {dados.totais.total_centavos !== obra.valor_contratado_centavos && (
            <>
              {' '}mais{' '}
              <ValorMonetario
                valorCentavos={dados.totais.total_centavos - obra.valor_contratado_centavos}
                alinhamento="left"
                style={{ fontSize: '12px', color: C.grafite, fontWeight: 500 }}
              />
              {' '}em adicionais aprovados.
            </>
          )}
        </p>

        {dados.recebimentos.length === 0 ? (
          <EstadoVazio
            compacto
            mensagem="Esta obra ainda não tem parcelas de recebimento. Elas aparecem aqui quando o contrato for lançado."
          />
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <CabecalhoTabela scope="col" style={{ padding: '0 12px 8px' }}>Parcela</CabecalhoTabela>
                <CabecalhoTabela scope="col" style={{ padding: '0 12px 8px' }}>Vencimento</CabecalhoTabela>
                <CabecalhoTabela scope="col" style={{ padding: '0 12px 8px' }}>Situação</CabecalhoTabela>
                <CabecalhoTabela scope="col" alinhamento="right" style={{ padding: '0 12px 8px' }}>Valor</CabecalhoTabela>
              </tr>
            </thead>
            <tbody>
              {dados.recebimentos.map((r) => {
                const s = SITUACAO_RECEBIMENTO[r.situacao] ?? SITUACAO_RECEBIMENTO.futura;
                return (
                  <tr key={r.id}>
                    <td style={{ ...TD, fontWeight: 500, color: C.tinta }}>{r.numero}ª parcela</td>
                    <td style={TD}>
                      {dataCurta(r.vencimento)}
                      {r.pago_em && (
                        <span style={{ color: C.tintaFraca, fontSize: '12px' }}> · pago em {dataCurta(r.pago_em)}</span>
                      )}
                    </td>
                    <td style={TD}>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 500, color: s.cor, backgroundColor: s.fundo, borderRadius: '6px', padding: '3px 9px' }}>
                        {s.rotulo}
                      </span>
                    </td>
                    <td style={{ ...TD, textAlign: 'right' }}>
                      <ValorMonetario valorCentavos={r.valor_centavos} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {dados.adicionais.length > 0 && (
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: `1px solid ${C.borda}` }}>
            <CabecalhoTabela elemento="div" style={{ marginBottom: '8px' }}>Adicionais aprovados</CabecalhoTabela>
            {dados.adicionais.map((a) => (
              <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '6px 0' }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.grafite }}>
                  {a.descricao}
                  <span style={{ color: C.tintaFraca, fontSize: '12px' }}> · {dataCurta(a.aprovado_em)}</span>
                </span>
                <ValorMonetario valorCentavos={a.valor_centavos} />
              </div>
            ))}
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.tintaFraca, marginTop: '8px', lineHeight: '17px' }}>
              O adicional aprovado amplia o escopo e faz o percentual de andamento recuar. É o comportamento
              correto: o denominador cresceu.
            </p>
          </div>
        )}
      </Cartao>

      {/* ── Custos de terceiros ───────────────────────────────────────────── */}
      <Cartao>
        <TituloSecao margemInferior="16px">Custos de terceiros no período</TituloSecao>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px' }}>
          <thead>
            <tr>
              <CabecalhoTabela scope="col" style={{ padding: '0 12px 8px' }}>Modalidade</CabecalhoTabela>
              <CabecalhoTabela scope="col" alinhamento="right" style={{ padding: '0 12px 8px' }}>Cobrado do cliente</CabecalhoTabela>
              <CabecalhoTabela scope="col" alinhamento="right" style={{ padding: '0 12px 8px' }}>Custo da TECTO</CabecalhoTabela>
              <CabecalhoTabela scope="col" alinhamento="right" style={{ padding: '0 12px 8px' }}>Margem</CabecalhoTabela>
            </tr>
          </thead>
          <tbody>
            {dados.modalidades.map((m) => {
              const comMargem = m.modalidade === 'repassado_com_margem';
              return (
                <tr key={m.modalidade}>
                  <td style={{ ...TD, color: C.tinta }}>
                    {ROTULO_MODALIDADE[m.modalidade]}
                    <span style={{ color: C.tintaFraca, fontSize: '12px' }}> · {m.quantidade}</span>
                  </td>
                  <td style={{ ...TD, textAlign: 'right' }}><ValorMonetario valorCentavos={m.cobrado_centavos} /></td>
                  <td style={{ ...TD, textAlign: 'right' }}><ValorMonetario valorCentavos={m.custo_centavos} /></td>
                  <td style={{ ...TD, textAlign: 'right' }}>
                    {comMargem ? (
                      <ValorMonetario valorCentavos={m.margem_centavos} style={{ color: C.positivo, fontWeight: 600 }} />
                    ) : (
                      <span style={{ color: C.neutro }}>—</span>
                    )}
                  </td>
                </tr>
              );
            })}
            <tr>
              <td style={{ ...TD, fontWeight: 600, color: C.tinta, borderBottom: 'none' }}>Total</td>
              <td style={{ ...TD, textAlign: 'right', borderBottom: 'none' }}>
                <ValorMonetario valorCentavos={totalCobrado} style={{ fontWeight: 600 }} />
              </td>
              <td style={{ ...TD, textAlign: 'right', borderBottom: 'none' }}>
                <ValorMonetario
                  valorCentavos={dados.modalidades.reduce((s, m) => s + m.custo_centavos, 0)}
                  style={{ fontWeight: 600 }}
                />
              </td>
              <td style={{ ...TD, textAlign: 'right', borderBottom: 'none' }}>
                <ValorMonetario valorCentavos={dados.margem} style={{ color: C.positivo, fontWeight: 600 }} />
              </td>
            </tr>
          </tbody>
        </table>

        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.tintaFraca, lineHeight: '17px' }}>
          Só <strong style={{ color: C.grafite, fontWeight: 500 }}>repassado com margem</strong> gera resultado.
          Reembolsável entra e sai pelo mesmo valor; direto do cliente não passa pelo caixa da TECTO — a obra só
          registra a nota.
        </p>
      </Cartao>

      {/* ── Notas ─────────────────────────────────────────────────────────── */}
      <Cartao>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <TituloSecao>Notas da obra</TituloSecao>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[{ id: undefined as string | undefined, rotulo: 'Todas' }, ...dados.tiposDeNota.map((t) => ({ id: t.tipo.id, rotulo: `${t.tipo.nome} (${t.quantidade})` }))].map((f) => {
              const ativo = f.id === tipoNota;
              return (
                <button
                  key={f.id ?? 'todas'}
                  onClick={() => setTipoNota(f.id)}
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '13px',
                    fontWeight: ativo ? 600 : 400,
                    color: ativo ? C.tinta : C.tintaFraca,
                    backgroundColor: ativo ? C.acentoFundo : C.superficie,
                    border: `1px solid ${ativo ? C.acento : C.borda}`,
                    borderRadius: '999px',
                    padding: '6px 13px',
                    cursor: 'pointer',
                  }}
                >
                  {f.rotulo}
                </button>
              );
            })}
          </div>
        </div>

        {dados.notas.length === 0 ? (
          <EstadoVazio
            compacto
            mensagem={
              tipoNota
                ? 'Nenhuma nota deste tipo nesta obra. Escolha outro tipo ou veja todas.'
                : 'Esta obra ainda não tem notas lançadas. A primeira aparece aqui quando um custo for registrado com nota.'
            }
          />
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <CabecalhoTabela scope="col" style={{ padding: '0 12px 8px' }}>Fornecedor</CabecalhoTabela>
                <CabecalhoTabela scope="col" style={{ padding: '0 12px 8px' }}>Descrição</CabecalhoTabela>
                <CabecalhoTabela scope="col" style={{ padding: '0 12px 8px' }}>Tipo</CabecalhoTabela>
                <CabecalhoTabela scope="col" style={{ padding: '0 12px 8px' }}>Nota</CabecalhoTabela>
                <CabecalhoTabela scope="col" alinhamento="right" style={{ padding: '0 12px 8px' }}>Cobrado</CabecalhoTabela>
              </tr>
            </thead>
            <tbody>
              {dados.notas.map(({ custo, tipo }) => (
                <tr key={custo.id}>
                  <td style={{ ...TD, color: C.tinta, fontWeight: 500 }}>{custo.fornecedor}</td>
                  <td style={TD}>{custo.descricao}</td>
                  <td style={TD}>{tipo?.nome ?? '—'}</td>
                  <td style={{ ...TD, color: C.tintaFraca }}>
                    {custo.nota_numero ?? '—'}
                    <span style={{ fontSize: '12px' }}> · {dataCurta(custo.data)}</span>
                  </td>
                  <td style={{ ...TD, textAlign: 'right' }}>
                    <ValorMonetario valorCentavos={custo.valor_cobrado_centavos} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Cartao>

      {/* ── Mão de obra ───────────────────────────────────────────────────── */}
      <Cartao>
        <TituloSecao margemInferior="16px">Mão de obra no período</TituloSecao>

        {dados.maoDeObra.length === 0 ? (
          <EstadoVazio
            compacto
            mensagem="Nenhuma diária foi lançada nesta obra no período. Escolha outro período ou registre o diário do dia."
          />
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <CabecalhoTabela scope="col" style={{ padding: '0 12px 8px' }}>Pessoa</CabecalhoTabela>
                  <CabecalhoTabela scope="col" alinhamento="right" style={{ padding: '0 12px 8px' }}>Dias</CabecalhoTabela>
                  <CabecalhoTabela scope="col" alinhamento="right" style={{ padding: '0 12px 8px' }}>Diárias</CabecalhoTabela>
                  <CabecalhoTabela scope="col" alinhamento="right" style={{ padding: '0 12px 8px' }}>Adicionais</CabecalhoTabela>
                  <CabecalhoTabela scope="col" alinhamento="right" style={{ padding: '0 12px 8px' }}>Líquido</CabecalhoTabela>
                  <CabecalhoTabela scope="col" alinhamento="right" style={{ padding: '0 12px 8px' }}>Custo da empresa</CabecalhoTabela>
                </tr>
              </thead>
              <tbody>
                {dados.maoDeObra.map((l) => (
                  <tr key={l.pessoa_id}>
                    <td style={TD}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                        <Avatar pessoaId={l.pessoa_id} nome={l.nome} tamanho={28} />
                        <span style={{ color: C.tinta, fontWeight: 500 }}>{l.nome}</span>
                      </span>
                    </td>
                    <td style={{ ...TD, textAlign: 'right' }}>{l.dias}</td>
                    <td style={{ ...TD, textAlign: 'right' }}><ValorMonetario valorCentavos={l.diarias_centavos} /></td>
                    <td style={{ ...TD, textAlign: 'right' }}>
                      {l.adicionais_centavos > 0 ? (
                        <ValorMonetario valorCentavos={l.adicionais_centavos} />
                      ) : (
                        <span style={{ color: C.neutro }}>—</span>
                      )}
                    </td>
                    <td style={{ ...TD, textAlign: 'right' }}><ValorMonetario valorCentavos={l.liquido_centavos} /></td>
                    <td style={{ ...TD, textAlign: 'right' }}>
                      {l.dias_sem_custo > 0 && l.empresa_centavos === 0 ? (
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.atencao }}>não informado</span>
                      ) : (
                        <ValorMonetario valorCentavos={l.empresa_centavos} />
                      )}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td style={{ ...TD, fontWeight: 600, color: C.tinta, borderBottom: 'none' }}>Total</td>
                  <td style={{ ...TD, borderBottom: 'none' }} />
                  <td style={{ ...TD, borderBottom: 'none' }} />
                  <td style={{ ...TD, borderBottom: 'none' }} />
                  <td style={{ ...TD, textAlign: 'right', borderBottom: 'none' }}>
                    <ValorMonetario valorCentavos={maoDeObraLiquido} style={{ fontWeight: 600 }} />
                  </td>
                  <td style={{ ...TD, textAlign: 'right', borderBottom: 'none' }}>
                    <ValorMonetario valorCentavos={maoDeObraEmpresa} style={{ fontWeight: 600 }} />
                  </td>
                </tr>
              </tbody>
            </table>

            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.tintaFraca, marginTop: '12px', lineHeight: '17px' }}>
              <strong style={{ color: C.grafite, fontWeight: 500 }}>Líquido</strong> é o que a pessoa recebe.{' '}
              <strong style={{ color: C.grafite, fontWeight: 500 }}>Custo da empresa</strong> é o que a obra
              consome de verdade, com encargos, e vem lançado à mão — o sistema não o calcula a partir do líquido.
              {semCusto > 0 && (
                <>
                  {' '}
                  <span style={{ color: C.atencao }}>
                    {semCusto === 1 ? 'Uma diária está' : `${semCusto} diárias estão`} sem custo informado e{' '}
                    {semCusto === 1 ? 'não entra' : 'não entram'} no total.
                  </span>
                </>
              )}
            </p>
          </>
        )}
      </Cartao>
    </div>
  );
}
