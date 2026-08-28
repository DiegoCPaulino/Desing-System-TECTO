import React, { useMemo, useState } from 'react';
import { useStore, formatarReais, getPessoaNome } from '../state/store';
import {
  calcularFechamentoDaPessoa,
  pendenciasQueBloqueiam,
  todosOsCiclos,
  type Ciclo,
  type ExtratoFechamento,
  type PendenciaBloqueante,
  type TipoCiclo,
} from '../state/fechamento';

/**
 * FECHAMENTO DE CICLO.
 *
 * Esta tela é o próprio cálculo, e por isso mora aqui e não no território das
 * telas. Ela nasce visualmente CRUA de propósito: o design system é aplicado
 * depois, num passo separado. O que precisa estar certo aqui é o número.
 *
 * Nenhum valor é escrito no componente e nenhum cálculo acontece nele: tudo
 * vem de `src/state/fechamento.ts`. Dinheiro circula em centavos inteiros e só
 * vira texto em `formatarReais`, na hora de exibir.
 */

const C = {
  tinta: '#000000',
  grafite: '#363636',
  tintaFraca: '#666666',
  borda: '#E6E6E6',
  fundo: '#FAFAFA',
  superficie: '#FFFFFF',
  acento: '#FFC213',
  atencao: '#E8833A',
  negativo: '#C94141',
  positivo: '#2E9E5B',
  neutro: '#9A9A9A',
} as const;

const ABAS: { tipo: TipoCiclo; rotulo: string }[] = [
  { tipo: 'semanal', rotulo: 'Semanal' },
  { tipo: 'quinzenal', rotulo: 'Quinzenal' },
  { tipo: 'mensal', rotulo: 'Mensal' },
  { tipo: 'por_obra', rotulo: 'Por obra' },
];

const celula: React.CSSProperties = {
  padding: '10px 12px',
  borderBottom: `1px solid ${C.borda}`,
  fontSize: '14px',
  textAlign: 'left',
};

const celulaNumero: React.CSSProperties = {
  ...celula,
  textAlign: 'right',
  fontVariantNumeric: 'tabular-nums',
};

const rotulo: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: C.tintaFraca,
};

export default function Fechamento() {
  const state = useStore();
  const perfilAtivo = useStore((s) => s.perfil_ativo);
  const definirObraQueArcaNaDiaria = useStore((s) => s.definirObraQueArcaNaDiaria);
  const executarFechamentoDoCiclo = useStore((s) => s.executarFechamentoDoCiclo);

  const [abaAtiva, setAbaAtiva] = useState<TipoCiclo>('semanal');
  const [extratoAberto, setExtratoAberto] = useState<string | null>(null);
  const [rateioAberto, setRateioAberto] = useState<string | null>(null);
  const [ajusteAberto, setAjusteAberto] = useState<string | null>(null);
  const [ajustes, setAjustes] = useState<Record<string, number>>({});
  const [aviso, setAviso] = useState<string | null>(null);

  // Quem executa é quem está na sessão. Só Administração e Financeiro chegam
  // aqui — a guarda de rota já barrou o resto.
  const autor = perfilAtivo === 'financeiro' ? 'p03' : 'p01';

  const ciclos = useMemo(() => todosOsCiclos(state), [state]);
  const ciclo: Ciclo | undefined = ciclos.find((c) => c.tipo === abaAtiva);

  const pendencias: PendenciaBloqueante[] = useMemo(
    () => (ciclo ? pendenciasQueBloqueiam(state, ciclo.id) : []),
    [state, ciclo]
  );

  const extratos: ExtratoFechamento[] = useMemo(() => {
    if (!ciclo || !ciclo.periodo_inicio) return [];
    return ciclo.pessoas.map((pid) => calcularFechamentoDaPessoa(state, pid, ciclo.id));
  }, [state, ciclo]);

  const somaPorTipo = (x: ExtratoFechamento, tipo: 'diaria' | 'adicional') =>
    x.linhas.filter((l) => l.tipo === tipo).reduce((s, l) => s + l.valor_centavos, 0);

  const totalAPagar = extratos.reduce((s, x) => {
    const alvo = ajustes[x.pessoa_id];
    const desconto = alvo === undefined ? x.descontos_centavos : Math.min(alvo, x.descontos_centavos);
    return s + Math.max(0, x.bruto_centavos - desconto);
  }, 0);

  const fechado = ciclo?.estado === 'fechado';
  const travado = pendencias.length > 0 || fechado;

  function executar() {
    if (!ciclo) return;
    const erro = executarFechamentoDoCiclo({
      ciclo_id: ciclo.id,
      fechado_por: autor,
      ajustes,
    });
    setAviso(erro ?? 'Fechamento executado. O período está travado.');
    if (!erro) setAjustes({});
  }

  function resolverRateio(diaria_id: string, obra_id: string) {
    const erro = definirObraQueArcaNaDiaria({ diaria_id, obra_id, definido_por: autor });
    setAviso(erro ?? 'Obra definida. A outra obra fica com custo zero.');
    if (!erro) setRateioAberto(null);
  }

  return (
    <div style={{ padding: '32px 40px', backgroundColor: C.fundo, minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: C.tinta }}>
      <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '26px', margin: '0 0 4px' }}>
        Fechamento de ciclo
      </h1>
      <p style={{ fontSize: '14px', color: C.tintaFraca, margin: '0 0 24px' }}>
        O fechamento é por ciclo e por pessoa. Os quatro ciclos correm ao mesmo tempo.
      </p>

      {/* ── ABAS POR CICLO ── */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {ABAS.map((a) => {
          const ativa = a.tipo === abaAtiva;
          return (
            <button
              key={a.tipo}
              onClick={() => { setAbaAtiva(a.tipo); setAviso(null); }}
              style={{
                padding: '8px 16px',
                border: `1px solid ${ativa ? C.acento : C.borda}`,
                backgroundColor: ativa ? C.acento : C.superficie,
                color: C.tinta,
                fontSize: '14px',
                fontWeight: ativa ? 600 : 400,
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              {a.rotulo}
            </button>
          );
        })}
      </div>

      {aviso && (
        <div style={{ padding: '12px 16px', marginBottom: '20px', backgroundColor: C.superficie, border: `1px solid ${C.borda}`, borderLeft: `4px solid ${C.atencao}`, borderRadius: '6px', fontSize: '14px' }}>
          {aviso}
        </div>
      )}

      {!ciclo && (
        <div style={{ padding: '32px', backgroundColor: C.superficie, border: `1px solid ${C.borda}`, borderRadius: '8px', fontSize: '14px', color: C.tintaFraca }}>
          Não há ciclo deste tipo com pessoas vinculadas.
        </div>
      )}

      {/* ── CICLO POR OBRA — estrutura sem afirmar a regra ── */}
      {ciclo && ciclo.tipo === 'por_obra' && (
        <PorObra ciclo={ciclo} />
      )}

      {ciclo && ciclo.tipo !== 'por_obra' && (
        <>
          <p style={{ ...rotulo, marginBottom: '12px' }}>
            Período {ciclo.periodo_inicio} a {ciclo.periodo_fim} · {ciclo.pessoas.length} pessoas
            {fechado && ' · FECHADO'}
          </p>

          {/* ── PENDÊNCIAS QUE BLOQUEIAM ── */}
          <section style={{ marginBottom: '24px', backgroundColor: C.superficie, border: `1px solid ${C.borda}`, borderRadius: '8px', padding: '16px' }}>
            <p style={{ ...rotulo, margin: '0 0 12px' }}>
              Pendências que bloqueiam o fechamento
            </p>
            {pendencias.length === 0 ? (
              <p style={{ fontSize: '14px', color: C.positivo, margin: 0 }}>
                Nenhuma. O ciclo pode ser fechado.
              </p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {pendencias.map((p) => (
                  <li key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', borderLeft: `4px solid ${C.negativo}`, paddingLeft: '12px' }}>
                    <div style={{ flex: 1, minWidth: '260px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 600 }}>{p.descricao}</div>
                      <div style={{ fontSize: '13px', color: C.tintaFraca }}>{p.detalhe}</div>
                    </div>
                    {p.tipo === 'rateio_indefinido' ? (
                      <button
                        onClick={() => setRateioAberto(p.referencia_id)}
                        style={botao(C.superficie)}
                      >
                        {p.acao}
                      </button>
                    ) : (
                      <span style={{ fontSize: '13px', color: C.tintaFraca, fontStyle: 'italic' }}>
                        {p.acao}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* ── TABELA POR PESSOA ── */}
          <div style={{ overflowX: 'auto', backgroundColor: C.superficie, border: `1px solid ${C.borda}`, borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '880px' }}>
              <thead>
                <tr>
                  <th style={{ ...celula, ...rotulo }}>Pessoa</th>
                  <th style={{ ...celulaNumero, ...rotulo }}>Diárias</th>
                  <th style={{ ...celulaNumero, ...rotulo }}>Adicionais</th>
                  <th style={{ ...celulaNumero, ...rotulo }}>Descontos</th>
                  <th style={{ ...celulaNumero, ...rotulo }}>A pagar</th>
                  <th style={{ ...celula, ...rotulo }}>Rola</th>
                  <th style={{ ...celulaNumero, ...rotulo }}>Deve ao todo</th>
                  <th style={{ ...celula, ...rotulo }} />
                </tr>
              </thead>
              <tbody>
                {extratos.map((x) => {
                  const alvo = ajustes[x.pessoa_id];
                  const desconto = alvo === undefined ? x.descontos_centavos : Math.min(alvo, x.descontos_centavos);
                  const aPagar = Math.max(0, x.bruto_centavos - desconto);
                  const rola = Math.max(0, desconto - x.bruto_centavos);
                  return (
                    <tr
                      key={x.pessoa_id}
                      onClick={() => setExtratoAberto(x.pessoa_id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={celula}>{getPessoaNome(state, x.pessoa_id)}</td>
                      <td style={celulaNumero}>{formatarReais(somaPorTipo(x, 'diaria'))}</td>
                      <td style={celulaNumero}>{formatarReais(somaPorTipo(x, 'adicional'))}</td>
                      <td style={{ ...celulaNumero, color: desconto > 0 ? C.negativo : C.tinta }}>
                        {desconto > 0 ? '− ' : ''}{formatarReais(desconto)}
                        {alvo !== undefined && <span style={{ fontSize: '11px', color: C.atencao }}> ajustado</span>}
                      </td>
                      <td style={{ ...celulaNumero, fontWeight: 600 }}>{formatarReais(aPagar)}</td>
                      <td style={{ ...celula, fontSize: '13px', color: rola > 0 ? C.atencao : C.neutro }}>
                        {rola > 0 ? formatarReais(rola) : '—'}
                      </td>
                      {/* RN-095: o Financeiro sempre enxerga o saldo devedor
                          antes de fechar. Não é o desconto deste ciclo — é a
                          dívida inteira, de todos os ciclos. */}
                      <td style={{ ...celulaNumero, fontSize: '13px', color: x.saldo_devedor_total_centavos > 0 ? C.negativo : C.neutro }}>
                        {x.saldo_devedor_total_centavos > 0 ? formatarReais(x.saldo_devedor_total_centavos) : '—'}
                      </td>
                      <td style={celula}>
                        {!fechado && x.descontos_centavos > 0 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setAjusteAberto(x.pessoa_id); }}
                            style={botao(C.superficie)}
                          >
                            Ajustar desconto
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td style={{ ...celula, fontWeight: 600 }}>Total do ciclo</td>
                  <td style={celula} colSpan={3} />
                  <td style={{ ...celulaNumero, fontWeight: 700 }}>{formatarReais(totalAPagar)}</td>
                  <td style={celula} colSpan={3} />
                </tr>
              </tfoot>
            </table>
          </div>

          {/* ── EXECUTAR ── */}
          <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <button
              onClick={executar}
              disabled={travado}
              style={{
                ...botao(travado ? C.borda : C.acento),
                cursor: travado ? 'not-allowed' : 'pointer',
                color: travado ? C.neutro : C.tinta,
                fontWeight: 600,
                padding: '12px 24px',
              }}
            >
              {fechado ? 'Ciclo fechado' : 'Executar fechamento'}
            </button>
            {pendencias.length > 0 && (
              <span style={{ fontSize: '13px', color: C.negativo }}>
                {pendencias.length} pendência{pendencias.length > 1 ? 's' : ''} impede
                {pendencias.length > 1 ? 'm' : ''} o fechamento.
              </span>
            )}
            {fechado && (
              <span style={{ fontSize: '13px', color: C.tintaFraca }}>
                O período está travado. Diário, presença e diária não podem mais ser
                alterados — nem pela Administração.
              </span>
            )}
          </div>
        </>
      )}

      {/* ── FOLHA: EXTRATO INDIVIDUAL ── */}
      {extratoAberto && (
        <Folha titulo={`Extrato de ${getPessoaNome(state, extratoAberto)}`} aoFechar={() => setExtratoAberto(null)}>
          <ExtratoDetalhado extrato={extratos.find((x) => x.pessoa_id === extratoAberto)} />
        </Folha>
      )}

      {/* ── FOLHA: RATEIO ── */}
      {rateioAberto && (
        <Folha titulo="Qual obra arca com a diária?" aoFechar={() => setRateioAberto(null)}>
          <FolhaRateio diaria_id={rateioAberto} aoEscolher={resolverRateio} />
        </Folha>
      )}

      {/* ── FOLHA: AJUSTE DE DESCONTO ── */}
      {ajusteAberto && (
        <Folha titulo={`Ajustar desconto de ${getPessoaNome(state, ajusteAberto)}`} aoFechar={() => setAjusteAberto(null)}>
          <FolhaAjuste
            extrato={extratos.find((x) => x.pessoa_id === ajusteAberto)}
            valorAtual={ajustes[ajusteAberto]}
            aoAplicar={(v) => {
              setAjustes((prev) => ({ ...prev, [ajusteAberto]: v }));
              setAjusteAberto(null);
              setAviso('Desconto ajustado. O que deixou de ser descontado continua devido.');
            }}
          />
        </Folha>
      )}
    </div>
  );
}

function botao(fundo: string): React.CSSProperties {
  return {
    padding: '6px 14px',
    border: `1px solid ${C.borda}`,
    backgroundColor: fundo,
    color: C.tinta,
    fontSize: '13px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
  };
}

/** Folha lateral simples. O acabamento vem depois, com o design system. */
function Folha({ titulo, aoFechar, children }: { titulo: string; aoFechar: () => void; children: React.ReactNode }) {
  return (
    <div
      onClick={aoFechar}
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 300, display: 'flex', justifyContent: 'flex-end' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: '520px', height: '100%', overflowY: 'auto', backgroundColor: C.superficie, padding: '24px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', gap: '16px' }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '18px', margin: 0 }}>{titulo}</h2>
          <button onClick={aoFechar} style={botao(C.superficie)}>Fechar</button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** O extrato linha a linha. Quem confere um pagamento precisa ver a origem. */
function ExtratoDetalhado({ extrato }: { extrato?: ExtratoFechamento }) {
  if (!extrato) return <p style={{ fontSize: '14px' }}>Extrato não encontrado.</p>;
  if (!extrato.linhas.length) {
    return (
      <p style={{ fontSize: '14px', color: C.tintaFraca }}>
        Nenhum lançamento neste período. Sem diário finalizado não há presença, e sem
        presença não há diária.
      </p>
    );
  }
  return (
    <>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {extrato.linhas.map((l, i) => (
            <tr key={`${l.referencia_id}_${i}`}>
              <td style={{ ...celula, fontSize: '13px', color: C.tintaFraca, whiteSpace: 'nowrap' }}>{l.data ?? '—'}</td>
              <td style={{ ...celula, fontSize: '13px' }}>{l.descricao}</td>
              <td style={{ ...celulaNumero, fontSize: '13px', color: l.valor_centavos < 0 ? C.negativo : C.tinta }}>
                {formatarReais(l.valor_centavos)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <dl style={{ marginTop: '20px', fontSize: '14px', display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px 16px' }}>
        <dt>Bruto</dt>
        <dd style={{ margin: 0, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{formatarReais(extrato.bruto_centavos)}</dd>
        <dt>Descontos</dt>
        <dd style={{ margin: 0, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: C.negativo }}>− {formatarReais(extrato.descontos_centavos)}</dd>
        <dt style={{ fontWeight: 700 }}>A pagar</dt>
        <dd style={{ margin: 0, textAlign: 'right', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{formatarReais(extrato.a_pagar_centavos)}</dd>
        {extrato.saldo_a_rolar_centavos > 0 && (
          <>
            <dt style={{ color: C.atencao }}>Rola para o ciclo seguinte</dt>
            <dd style={{ margin: 0, textAlign: 'right', color: C.atencao, fontVariantNumeric: 'tabular-nums' }}>
              {formatarReais(extrato.saldo_a_rolar_centavos)}
            </dd>
          </>
        )}
        {extrato.saldo_devedor_total_centavos > 0 && (
          <>
            <dt style={{ color: C.negativo }}>Deve ao todo</dt>
            <dd style={{ margin: 0, textAlign: 'right', color: C.negativo, fontVariantNumeric: 'tabular-nums' }}>
              {formatarReais(extrato.saldo_devedor_total_centavos)}
            </dd>
          </>
        )}
      </dl>
      {extrato.saldo_devedor_total_centavos > extrato.descontos_centavos && (
        <p style={{ fontSize: '13px', color: C.tintaFraca, marginTop: '12px' }}>
          A dívida total é maior que o desconto deste ciclo: o restante é cobrado
          nos ciclos seguintes, uma parcela por vez.
        </p>
      )}
      {extrato.saldo_a_rolar_centavos > 0 && (
        <p style={{ fontSize: '13px', color: C.tintaFraca, marginTop: '12px' }}>
          O desconto passou do ganho do ciclo. O pagamento não fica negativo: a pessoa
          recebe zero e a diferença é cobrada no ciclo seguinte.
        </p>
      )}
    </>
  );
}

/** Escolha da obra que arca. Uma obra paga a diária inteira; a outra, zero. */
function FolhaRateio({ diaria_id, aoEscolher }: { diaria_id: string; aoEscolher: (d: string, o: string) => void }) {
  const state = useStore();
  const diaria = state.diarias.find((d) => d.id === diaria_id);
  if (!diaria) return <p style={{ fontSize: '14px' }}>Diária não encontrada.</p>;

  const obras = state.presencas
    .filter((p) => p.pessoa_id === diaria.pessoa_id && p.data === diaria.data)
    .map((p) => state.obras.find((o) => o.id === p.obra_id))
    .filter((o): o is NonNullable<typeof o> => !!o);

  return (
    <>
      <p style={{ fontSize: '14px', marginTop: 0 }}>
        {getPessoaNome(state, diaria.pessoa_id)} esteve em {obras.length} obras em {diaria.data}, e
        isso gerou <strong>uma única diária</strong> de {formatarReais(diaria.valor_centavos)}.
      </p>
      <p style={{ fontSize: '13px', color: C.tintaFraca }}>
        Não há rateio proporcional. A obra escolhida arca com o valor inteiro; a outra
        fica com custo zero.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
        {obras.map((o) => (
          <button key={o.id} onClick={() => aoEscolher(diaria_id, o.id)} style={{ ...botao(C.superficie), textAlign: 'left', padding: '12px 16px' }}>
            {o.codigo} — {o.cliente}
          </button>
        ))}
      </div>
    </>
  );
}

/** Ajuste de desconto. Nunca aceita mais que o proposto. */
function FolhaAjuste({
  extrato,
  valorAtual,
  aoAplicar,
}: {
  extrato?: ExtratoFechamento;
  valorAtual?: number;
  aoAplicar: (v: number) => void;
}) {
  const proposto = extrato?.descontos_centavos ?? 0;
  const [reais, setReais] = useState(((valorAtual ?? proposto) / 100).toFixed(2));

  const emCentavos = Math.round(Number(reais.replace(',', '.')) * 100);
  const invalido = Number.isNaN(emCentavos) || emCentavos < 0;
  const excede = !invalido && emCentavos > proposto;

  return (
    <>
      <p style={{ fontSize: '14px', marginTop: 0 }}>
        Desconto proposto pelo cálculo: <strong>{formatarReais(proposto)}</strong>.
      </p>
      <p style={{ fontSize: '13px', color: C.tintaFraca }}>
        É possível descontar menos, nunca mais. O que deixar de ser descontado continua
        devido e é cobrado no ciclo seguinte.
      </p>
      <label style={{ ...rotulo, display: 'block', marginTop: '16px', marginBottom: '6px' }}>
        Descontar neste ciclo (R$)
      </label>
      <input
        value={reais}
        onChange={(e) => setReais(e.target.value)}
        inputMode="decimal"
        style={{ width: '100%', padding: '10px 12px', border: `1px solid ${excede ? C.negativo : C.borda}`, borderRadius: '6px', fontSize: '14px', fontFamily: 'Inter, sans-serif', fontVariantNumeric: 'tabular-nums' }}
      />
      {excede && (
        <p style={{ fontSize: '13px', color: C.negativo, marginTop: '8px' }}>
          Maior que o proposto. O máximo é {formatarReais(proposto)} — descontar mais
          seria cobrar dívida que não existe.
        </p>
      )}
      <button
        onClick={() => aoAplicar(emCentavos)}
        disabled={invalido || excede}
        style={{
          ...botao(invalido || excede ? C.borda : C.acento),
          marginTop: '16px',
          padding: '10px 20px',
          fontWeight: 600,
          cursor: invalido || excede ? 'not-allowed' : 'pointer',
        }}
      >
        Aplicar ajuste
      </button>
    </>
  );
}

/**
 * Aba "Por obra". Mostra pagamento com obra, pessoa, valor e situação, e NÃO
 * afirma quando nem como o pagamento acontece — `Q-001` a `Q-003` estão em
 * aberto. É a saída 2 do `docs/ABERTO.md` §1: construir a estrutura sem
 * assumir a regra.
 */
function PorObra({ ciclo }: { ciclo: Ciclo }) {
  const state = useStore();
  return (
    <>
      <p style={{ ...rotulo, marginBottom: '12px' }}>{ciclo.pessoas.length} pessoas</p>
      <div style={{ overflowX: 'auto', backgroundColor: C.superficie, border: `1px solid ${C.borda}`, borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
          <thead>
            <tr>
              <th style={{ ...celula, ...rotulo }}>Pessoa</th>
              <th style={{ ...celula, ...rotulo }}>Obra</th>
              <th style={{ ...celulaNumero, ...rotulo }}>Valor do contrato</th>
              <th style={{ ...celula, ...rotulo }}>Situação</th>
            </tr>
          </thead>
          <tbody>
            {ciclo.pessoas.map((pid) => {
              const vinculo = state.vinculos.find((v) => v.pessoa_id === pid && !v.fim);
              // A obra a que o pagamento se refere tem duas origens, e a fonte
              // certa depende de quem é a pessoa.
              //
              // Quem tem `vinculos_obra` — Gerente e Assistente — se liga à
              // obra por ali, e só por ali: o Rafael foi PLANEJADO um dia na
              // GFR sem gerenciá-la, e listar essa obra confundiria um dia de
              // trabalho com um contrato de gestão.
              //
              // O terceirizado não tem vínculo de obra até a entidade
              // `contratos_terceirizado` existir, então vale onde ele esteve
              // ou está alocado.
              const obraIds = new Set<string>();
              const gerenciadas = state.vinculos_obra.filter((v) => v.pessoa_id === pid && !v.fim);
              if (gerenciadas.length) {
                for (const v of gerenciadas) obraIds.add(v.obra_id);
              } else {
                for (const p of state.presencas) if (p.pessoa_id === pid) obraIds.add(p.obra_id);
                for (const p of state.planejamento) if (p.pessoa_id === pid && p.obra_id) obraIds.add(p.obra_id);
              }
              const obras = [...obraIds]
                .map((oid) => state.obras.find((o) => o.id === oid)?.codigo)
                .filter(Boolean)
                .sort();
              // O Gerente de Obras recebe valor fixo por Obra (RN-004), mas o
              // valor não está definido — Q-001. Exibir R$ 0,00 aqui diria que
              // ele não recebe nada, que é uma afirmação diferente de "ainda
              // não se sabe quanto".
              const temValor = vinculo?.valor_obra_centavos !== undefined;
              return (
                <tr key={pid}>
                  <td style={celula}>{getPessoaNome(state, pid)}</td>
                  <td style={{ ...celula, fontSize: '13px' }}>{obras.length ? obras.join(', ') : '—'}</td>
                  <td style={temValor ? celulaNumero : { ...celulaNumero, color: C.tintaFraca, fontStyle: 'italic' }}>
                    {temValor ? formatarReais(vinculo!.valor_obra_centavos!) : 'a definir'}
                  </td>
                  <td style={{ ...celula, fontSize: '13px', color: C.tintaFraca }}>Em aberto</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: '13px', color: C.tintaFraca, marginTop: '12px', maxWidth: '640px' }}>
        Quando e como o pagamento por obra acontece — parcelado durante a obra, por
        marco de execução, ou consolidado — ainda não foi decidido. Esta aba mostra os
        contratos sem afirmar a periodicidade.
      </p>
    </>
  );
}
