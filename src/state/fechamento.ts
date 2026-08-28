import type { AppState, Diaria, Fechamento, Parcela, Presenca } from './types';

/**
 * FECHAMENTO DE CICLO — módulo sensível.
 *
 * Aqui o erro não aparece na tela: aparece semanas depois no bolso de alguém.
 * Três regras governam tudo o que segue.
 *
 * 1. DINHEIRO É INTEIRO EM CENTAVOS. Nenhuma divisão, nenhum float, nenhum
 *    arredondamento. Toda conta é soma e subtração de inteiros.
 *
 * 2. VALOR CONGELADO. O valor da diária é lido do REGISTRO da diária, nunca do
 *    vínculo da pessoa. Se o vínculo mudar amanhã, o fechamento de ontem não
 *    pode mudar junto.
 *
 * 3. O PAGAMENTO NUNCA É NEGATIVO. Quando o desconto é maior que o ganho do
 *    ciclo, a pessoa recebe zero e a diferença rola para o ciclo seguinte.
 *    Ver docs/DECISOES.md, decisão [SÓ PROTÓTIPO] sobre saldo devedor.
 *
 * Todas as funções de cálculo são PURAS: recebem o estado, não o alteram.
 * A única que grava é `executarFechamento`, e ela devolve o novo estado.
 */

// ═══════════════════════════════════════════════════════════════════════════
// CICLOS
// ═══════════════════════════════════════════════════════════════════════════

export type TipoCiclo = 'semanal' | 'quinzenal' | 'mensal' | 'por_obra';

export interface Ciclo {
  id: string;
  tipo: TipoCiclo;
  /**
   * Ausentes no ciclo `por_obra`. Quando e como o pagamento por Obra acontece
   * é `Q-001` a `Q-003` em docs/ABERTO.md, e este módulo NÃO afirma. Segue a
   * saída 2 do ABERTO.md §1: mostra a forma sem assumir a periodicidade.
   */
  periodo_inicio?: string;
  periodo_fim?: string;
  pessoas: string[];
  estado: 'aberto' | 'fechado';
}

/**
 * O Fechamento é por CICLO e por PESSOA, nunca global por semana. Um ciclo é
 * o conjunto de Fechamentos que compartilham tipo e período; a identidade dele
 * é a tripla, não um id gravado.
 */
export function cicloIdDe(f: Fechamento): string {
  return `${f.ciclo}_${f.periodo_inicio}_${f.periodo_fim}`;
}

/** Todos os ciclos do estado, abertos e fechados, incluindo o `por_obra`. */
export function todosOsCiclos(state: AppState): Ciclo[] {
  const porId = new Map<string, Ciclo>();

  for (const f of state.fechamentos) {
    const id = cicloIdDe(f);
    const existente = porId.get(id);
    if (existente) {
      existente.pessoas.push(f.pessoa_id);
      // Um ciclo só está fechado quando TODOS os fechamentos dele estão.
      if (f.estado === 'aberto') existente.estado = 'aberto';
    } else {
      porId.set(id, {
        id,
        tipo: f.ciclo,
        periodo_inicio: f.periodo_inicio,
        periodo_fim: f.periodo_fim,
        pessoas: [f.pessoa_id],
        estado: f.estado,
      });
    }
  }

  const ciclos = [...porId.values()];

  // O ciclo por obra não tem registro de Fechamento: ele é derivado dos
  // vínculos de terceirizado. Não tem período porque a periodicidade está
  // aberta — ver o comentário em `Ciclo`.
  const porObra = state.vinculos
    .filter((v) => v.ciclo_pagamento === 'por_obra' && !v.fim)
    .map((v) => v.pessoa_id);

  if (porObra.length) {
    ciclos.push({
      id: 'por_obra',
      tipo: 'por_obra',
      pessoas: porObra,
      estado: 'aberto',
    });
  }

  return ciclos;
}

/** Só os ciclos que ainda podem receber fechamento. */
export function ciclosAbertos(state: AppState): Ciclo[] {
  return todosOsCiclos(state).filter((c) => c.estado === 'aberto');
}

export function cicloPorId(state: AppState, cicloId: string): Ciclo | undefined {
  return todosOsCiclos(state).find((c) => c.id === cicloId);
}

/**
 * Fim do ciclo seguinte, para onde o saldo devedor rola.
 * Datas são strings `YYYY-MM-DD` e as contas usam UTC, para que o fuso da
 * máquina não mova um dia e quebre a coerência com o dia da semana.
 */
export function proximoFimDeCiclo(tipo: TipoCiclo, periodo_fim: string): string {
  const [y, m, d] = periodo_fim.split('-').map(Number);
  if (tipo === 'semanal') {
    return new Date(Date.UTC(y, m - 1, d + 7)).toISOString().slice(0, 10);
  }
  if (tipo === 'quinzenal') {
    return new Date(Date.UTC(y, m - 1, d + 15)).toISOString().slice(0, 10);
  }
  if (tipo === 'mensal') {
    // Último dia do mês seguinte: dia 0 do mês +2 é o último dia do mês +1.
    return new Date(Date.UTC(y, m + 1, 0)).toISOString().slice(0, 10);
  }
  return periodo_fim; // por_obra não tem período
}

// ═══════════════════════════════════════════════════════════════════════════
// EXTRATO E CÁLCULO
// ═══════════════════════════════════════════════════════════════════════════

export interface LinhaExtrato {
  tipo: 'diaria' | 'adicional' | 'adiantamento' | 'emprestimo';
  data?: string;
  descricao: string;
  /** Positivo credita, negativo desconta. Sempre em centavos inteiros. */
  valor_centavos: number;
  referencia_id: string;
}

export interface ExtratoFechamento {
  pessoa_id: string;
  ciclo_id: string;
  linhas: LinhaExtrato[];
  bruto_centavos: number;
  descontos_centavos: number;
  a_pagar_centavos: number;
  /** Quanto do desconto não coube neste ciclo e rola para o seguinte. */
  saldo_a_rolar_centavos: number;
  /**
   * `RN-095` — a dívida INTEIRA da pessoa, de todos os ciclos, e não só o que
   * este ciclo desconta. São coisas diferentes: quem tem empréstimo em quatro
   * parcelas desconta uma por ciclo e deve as outras três.
   */
  saldo_devedor_total_centavos: number;
}

/**
 * `RN-095` — o Financeiro sempre enxerga o saldo devedor de cada Pessoa antes
 * de executar o Fechamento.
 *
 * Soma toda parcela pendente da pessoa, caia ela neste ciclo ou em qualquer
 * ciclo futuro. Não é o mesmo número que `descontos_centavos`, que é só a
 * fatia cobrada agora.
 */
export function saldoDevedorDaPessoa(state: AppState, pessoa_id: string): number {
  const lancamentosDaPessoa = new Set(
    state.lancamentos.filter((l) => l.pessoa_id === pessoa_id).map((l) => l.id)
  );
  return state.parcelas
    .filter((p) => lancamentosDaPessoa.has(p.lancamento_id) && p.situacao === 'pendente')
    .reduce((soma, p) => soma + p.valor_centavos, 0);
}

/** Diárias da pessoa dentro do período, comparadas como string `YYYY-MM-DD`. */
function diariasDoPeriodo(
  state: AppState,
  pessoa_id: string,
  inicio: string,
  fim: string
): Diaria[] {
  return state.diarias.filter(
    (d) => d.pessoa_id === pessoa_id && d.data >= inicio && d.data <= fim
  );
}

/** Parcelas pendentes da pessoa que caem NESTE ciclo ou em ciclo já vencido. */
function parcelasDoCiclo(state: AppState, pessoa_id: string, fim: string): Parcela[] {
  const lancamentosDaPessoa = new Set(
    state.lancamentos.filter((l) => l.pessoa_id === pessoa_id).map((l) => l.id)
  );
  return state.parcelas.filter(
    (p) =>
      lancamentosDaPessoa.has(p.lancamento_id) &&
      p.situacao === 'pendente' &&
      // `<=` e não `===`: parcela que rolou de um ciclo anterior e ficou para
      // trás tem que ser cobrada aqui, senão some da conta.
      p.ciclo_periodo_fim <= fim
  );
}

/**
 * O cálculo do ciclo de uma pessoa, linha a linha.
 *
 * A ordem importa e é esta:
 *
 *   1. Soma as diárias do período pelo valor CONGELADO em cada registro.
 *   2. Soma os adicionais, também congelados. O adicional de sábado, domingo e
 *      noturno NÃO é recalculado aqui a partir do dia da semana: ele é uma
 *      decisão tomada no Planejamento e gravada na diária. Recalcular seria
 *      inventar dinheiro que ninguém aprovou.
 *   3. Desconta adiantamento INTEGRALMENTE — é uma antecipação do próprio
 *      pagamento, então volta inteira.
 *   4. Desconta, do empréstimo, APENAS a parcela do ciclo. O restante do
 *      empréstimo continua devido, e não é problema deste ciclo.
 *   5. `a_pagar` nunca é negativo. Se os descontos passarem do bruto, a pessoa
 *      recebe zero e a diferença vira `saldo_a_rolar`.
 *
 * Devolve o extrato inteiro, não só o total: quem confere um pagamento precisa
 * ver de onde veio cada centavo.
 */
export function calcularFechamentoDaPessoa(
  state: AppState,
  pessoa_id: string,
  cicloId: string
): ExtratoFechamento {
  const vazio: ExtratoFechamento = {
    pessoa_id,
    ciclo_id: cicloId,
    linhas: [],
    bruto_centavos: 0,
    descontos_centavos: 0,
    a_pagar_centavos: 0,
    saldo_a_rolar_centavos: 0,
    saldo_devedor_total_centavos: saldoDevedorDaPessoa(state, pessoa_id),
  };

  const ciclo = cicloPorId(state, cicloId);
  if (!ciclo || !ciclo.periodo_inicio || !ciclo.periodo_fim) return vazio;

  const linhas: LinhaExtrato[] = [];
  let bruto = 0;

  // 1 e 2 — diárias e adicionais, pelos valores congelados
  for (const d of diariasDoPeriodo(state, pessoa_id, ciclo.periodo_inicio, ciclo.periodo_fim)) {
    if (d.valor_centavos > 0) {
      linhas.push({
        tipo: 'diaria',
        data: d.data,
        descricao: 'Diária',
        valor_centavos: d.valor_centavos,
        referencia_id: d.id,
      });
      bruto += d.valor_centavos;
    }
    if (d.adicional_centavos > 0) {
      linhas.push({
        tipo: 'adicional',
        data: d.data,
        descricao: 'Adicional',
        valor_centavos: d.adicional_centavos,
        referencia_id: d.id,
      });
      bruto += d.adicional_centavos;
    }
  }

  // 3 e 4 — descontos
  let descontos = 0;
  for (const p of parcelasDoCiclo(state, pessoa_id, ciclo.periodo_fim)) {
    const lancamento = state.lancamentos.find((l) => l.id === p.lancamento_id);
    if (!lancamento) continue;

    const ehAdiantamento = lancamento.tipo === 'adiantamento';
    linhas.push({
      tipo: ehAdiantamento ? 'adiantamento' : 'emprestimo',
      data: lancamento.data,
      descricao: ehAdiantamento
        ? 'Adiantamento'
        : `Empréstimo — parcela ${p.numero} de ${lancamento.parcelas}`,
      valor_centavos: -p.valor_centavos,
      referencia_id: p.id,
    });
    descontos += p.valor_centavos;
  }

  // 5 — o pagamento nunca é negativo
  const a_pagar = Math.max(0, bruto - descontos);
  const saldo_a_rolar = Math.max(0, descontos - bruto);

  return {
    pessoa_id,
    ciclo_id: cicloId,
    linhas,
    bruto_centavos: bruto,
    descontos_centavos: descontos,
    a_pagar_centavos: a_pagar,
    saldo_a_rolar_centavos: saldo_a_rolar,
    saldo_devedor_total_centavos: saldoDevedorDaPessoa(state, pessoa_id),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// PENDÊNCIAS QUE BLOQUEIAM
// ═══════════════════════════════════════════════════════════════════════════

export interface PendenciaBloqueante {
  id: string;
  tipo: 'rateio_indefinido' | 'ausencia_sem_decisao' | 'diario_nao_finalizado';
  descricao: string;
  detalhe: string;
  /** O que resolve esta pendência, para a tela oferecer a ação certa. */
  acao: string;
  referencia_id: string;
}

/**
 * Pendência aberta IMPEDE executar o fechamento. Não é aviso: é trava.
 *
 * Pagar sem resolver estas três produz número errado em silêncio — diária sem
 * obra não entra no custo de obra nenhuma, ausência sem decisão paga ou deixa
 * de pagar por omissão, e diário não finalizado significa que as presenças
 * daquele dia ainda não existem.
 */
export function pendenciasQueBloqueiam(state: AppState, cicloId: string): PendenciaBloqueante[] {
  const ciclo = cicloPorId(state, cicloId);
  if (!ciclo || !ciclo.periodo_inicio || !ciclo.periodo_fim) return [];

  const { periodo_inicio: inicio, periodo_fim: fim } = ciclo;
  const pessoasDoCiclo = new Set(ciclo.pessoas);
  const pendencias: PendenciaBloqueante[] = [];

  // 1. Diária sem obra que arca — o rateio não foi decidido
  for (const d of state.diarias) {
    if (!pessoasDoCiclo.has(d.pessoa_id)) continue;
    if (d.data < inicio || d.data > fim) continue;
    if (d.obra_que_arca_id) continue;
    const pessoa = state.pessoas.find((p) => p.id === d.pessoa_id);
    pendencias.push({
      id: `bloq_rat_${d.id}`,
      tipo: 'rateio_indefinido',
      descricao: `Rateio não decidido: ${pessoa?.nome ?? d.pessoa_id}`,
      detalhe: `Diária de ${d.data} sem obra que arca`,
      acao: 'Escolher qual obra arca com a diária',
      referencia_id: d.id,
    });
  }

  // 2. Ausência sem decisão de pagamento
  for (const diario of state.diarios) {
    if (diario.data < inicio || diario.data > fim) continue;
    for (const rem of diario.removidos_planejados ?? []) {
      if (!pessoasDoCiclo.has(rem.pessoa_id)) continue;
      const pessoa = state.pessoas.find((p) => p.id === rem.pessoa_id);
      pendencias.push({
        id: `bloq_aus_${diario.id}_${rem.pessoa_id}`,
        tipo: 'ausencia_sem_decisao',
        descricao: `Ausência sem decisão: ${pessoa?.nome ?? rem.pessoa_id}`,
        detalhe: `${rem.motivo} — dia ${diario.data}`,
        acao: 'Decidir se o dia é pago',
        referencia_id: diario.id,
      });
    }
  }

  // 3. Diário não finalizado no período, nas obras onde essas pessoas estiveram
  const obrasDoCiclo = new Set(
    state.presencas
      .filter((pr) => pessoasDoCiclo.has(pr.pessoa_id) && pr.data >= inicio && pr.data <= fim)
      .map((pr) => pr.obra_id)
  );
  for (const diario of state.diarios) {
    if (diario.data < inicio || diario.data > fim) continue;
    if (!obrasDoCiclo.has(diario.obra_id)) continue;
    if (diario.estado === 'finalizado') continue;
    const obra = state.obras.find((o) => o.id === diario.obra_id);
    pendencias.push({
      id: `bloq_dia_${diario.id}`,
      tipo: 'diario_nao_finalizado',
      descricao: `Diário não finalizado: ${obra?.codigo ?? diario.obra_id}`,
      detalhe: `Diário de ${diario.data} ainda em rascunho`,
      acao: 'Finalizar o diário',
      referencia_id: diario.id,
    });
  }

  return pendencias;
}

/** O fechamento só pode ser executado quando não há nenhuma pendência. */
export function podeExecutarFechamento(state: AppState, cicloId: string): boolean {
  const ciclo = cicloPorId(state, cicloId);
  if (!ciclo || ciclo.estado === 'fechado') return false;
  if (!ciclo.periodo_inicio || !ciclo.periodo_fim) return false; // por_obra não fecha aqui
  return pendenciasQueBloqueiam(state, cicloId).length === 0;
}

// ═══════════════════════════════════════════════════════════════════════════
// RATEIO
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Uma pessoa em duas obras no mesmo dia gera N presenças e UMA diária.
 * O Financeiro escolhe qual obra arca; a outra fica com custo ZERO.
 *
 * Não existe rateio proporcional — ver docs/DECISOES.md, decisão
 * [SÓ PROTÓTIPO] sobre rateio de diária. Meia diária para cada obra seria
 * inventar uma regra que ninguém aprovou.
 *
 * Devolve o novo array de diárias. Não altera o estado recebido.
 */
export function definirObraQueArca(
  state: AppState,
  diaria_id: string,
  obra_id: string,
  definido_por: string
): { diarias: Diaria[]; erro?: string } {
  const diaria = state.diarias.find((d) => d.id === diaria_id);
  if (!diaria) return { diarias: state.diarias, erro: 'Diária não encontrada.' };

  if (diariaEstaFechada(state, diaria)) {
    return {
      diarias: state.diarias,
      erro: 'Esta diária pertence a um ciclo já fechado e não pode ser alterada.',
    };
  }

  // A obra escolhida precisa ser uma onde a pessoa esteve de fato naquele dia.
  const obrasDoDia = state.presencas
    .filter((pr) => pr.pessoa_id === diaria.pessoa_id && pr.data === diaria.data)
    .map((pr) => pr.obra_id);

  if (!obrasDoDia.includes(obra_id)) {
    return {
      diarias: state.diarias,
      erro: 'A pessoa não teve presença registrada nesta obra nesta data.',
    };
  }

  return {
    diarias: state.diarias.map((d) =>
      d.id === diaria_id ? { ...d, obra_que_arca_id: obra_id, definido_por } : d
    ),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// IMUTABILIDADE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * A pessoa tem um Fechamento FECHADO cobrindo esta data?
 * É a pergunta que responde por toda a imutabilidade deste módulo.
 */
export function periodoEstaFechado(state: AppState, pessoa_id: string, data: string): boolean {
  return state.fechamentos.some(
    (f) =>
      f.pessoa_id === pessoa_id &&
      f.estado === 'fechado' &&
      data >= f.periodo_inicio &&
      data <= f.periodo_fim
  );
}

export function diariaEstaFechada(state: AppState, diaria: Diaria): boolean {
  return periodoEstaFechado(state, diaria.pessoa_id, diaria.data);
}

export function presencaEstaFechada(state: AppState, presenca: Presenca): boolean {
  return periodoEstaFechado(state, presenca.pessoa_id, presenca.data);
}

/**
 * Um diário está travado quando QUALQUER pessoa nele está em período fechado.
 *
 * O critério é esse, e não "todas as pessoas", por um motivo concreto:
 * `finalizarDiario` apaga e regrava as presenças e as diárias de todo mundo do
 * diário. Editar um diário que contenha uma só pessoa já fechada reescreveria
 * o pagamento dela. Por isso basta uma.
 *
 * Vale inclusive para a Administração. `INV-07` não abre exceção por perfil, e
 * um fechamento que a Administração pode desfazer não é um fechamento.
 */
export function diarioEstaFechado(state: AppState, diario_id: string): boolean {
  const diario = state.diarios.find((d) => d.id === diario_id);
  if (!diario) return false;

  const presencas = state.presencas.filter((p) => p.diario_id === diario_id);
  if (presencas.some((p) => presencaEstaFechada(state, p))) return true;

  // Um diário ainda em rascunho não tem presença. Mesmo assim ele está travado
  // se as pessoas planejadas para aquele dia já foram fechadas.
  const planejados = state.planejamento.filter(
    (pl) => pl.obra_id === diario.obra_id && pl.data === diario.data
  );
  return planejados.some((pl) => periodoEstaFechado(state, pl.pessoa_id, diario.data));
}

/** Erro descritivo para quem tentar editar. Nunca mensagem genérica. */
export function motivoDeBloqueioDoDiario(state: AppState, diario_id: string): string | undefined {
  if (!diarioEstaFechado(state, diario_id)) return undefined;
  const diario = state.diarios.find((d) => d.id === diario_id);
  return (
    `O diário de ${diario?.data ?? diario_id} pertence a um período já fechado. ` +
    'Nem a Administração pode alterá-lo — o fechamento congelou presença e diária.'
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXECUÇÃO
// ═══════════════════════════════════════════════════════════════════════════

export interface ResultadoExecucao {
  ok: boolean;
  erro?: string;
  fechamentos?: Fechamento[];
  parcelas?: Parcela[];
}

/**
 * Executa o fechamento de um ciclo inteiro.
 *
 * O que acontece, por pessoa:
 *   - o total do Fechamento passa a ser o `a_pagar` calculado;
 *   - as parcelas cobertas pelo ganho do ciclo viram `paga`;
 *   - a parcela que o ganho cobriu só em parte é PARTIDA em duas: a fatia paga
 *     fica neste ciclo, o restante vira uma parcela nova no ciclo seguinte.
 *     Partir preserva o rastro de quanto foi amortizado e quando — reduzir o
 *     valor da parcela original apagaria essa informação, e isto é dinheiro.
 *   - o Fechamento passa a `fechado`, com autor e data.
 *
 * A trava de imutabilidade não é um campo novo: é consequência de o Fechamento
 * estar `fechado`, lida por `periodoEstaFechado`.
 *
 * Não altera o estado recebido. Devolve os arrays novos.
 */
export function executarFechamento(
  state: AppState,
  cicloId: string,
  fechado_por: string,
  /**
   * Ajuste de desconto por pessoa, em centavos. O Financeiro pode descontar
   * MENOS que o proposto — nunca mais. Descontar mais seria cobrar dívida que
   * não existe; por isso o valor é limitado ao proposto aqui dentro, e não só
   * na tela. O que deixa de ser descontado continua devido e rola.
   *
   * Se um acordo de desconto parcial é legítimo é `Q-008`, em aberto. Esta
   * função oferece a forma sem afirmar quando usá-la.
   */
  ajustes?: Record<string, number>
): ResultadoExecucao {
  const ciclo = cicloPorId(state, cicloId);
  if (!ciclo) return { ok: false, erro: 'Ciclo não encontrado.' };
  if (ciclo.estado === 'fechado') return { ok: false, erro: 'Este ciclo já foi fechado.' };
  if (!ciclo.periodo_inicio || !ciclo.periodo_fim) {
    return {
      ok: false,
      erro: 'O ciclo por obra não tem período definido e não pode ser fechado aqui.',
    };
  }

  const pendencias = pendenciasQueBloqueiam(state, cicloId);
  if (pendencias.length) {
    return {
      ok: false,
      erro:
        `Há ${pendencias.length} pendência${pendencias.length > 1 ? 's' : ''} aberta` +
        `${pendencias.length > 1 ? 's' : ''} neste ciclo. Resolva antes de fechar: ` +
        pendencias.map((p) => p.descricao).join('; '),
    };
  }

  const fimSeguinte = proximoFimDeCiclo(ciclo.tipo, ciclo.periodo_fim);
  let parcelas = [...state.parcelas];
  const fechamentos = [...state.fechamentos];

  for (const pessoa_id of ciclo.pessoas) {
    const extrato = calcularFechamentoDaPessoa(state, pessoa_id, cicloId);

    // O desconto efetivo é o proposto, salvo ajuste — e o ajuste só desce.
    const proposto = extrato.descontos_centavos;
    const pedido = ajustes?.[pessoa_id];
    const alvo = pedido === undefined ? proposto : Math.max(0, Math.min(pedido, proposto));

    // Amortiza as parcelas, na ordem em que entraram no extrato, com o que o
    // ciclo rendeu, limitado ao alvo. Sobra vira parcela no ciclo seguinte.
    let disponivel = Math.min(extrato.bruto_centavos, alvo);
    const aPagar = extrato.bruto_centavos - disponivel;
    const idsNoExtrato = new Set(
      extrato.linhas
        .filter((l) => l.tipo === 'adiantamento' || l.tipo === 'emprestimo')
        .map((l) => l.referencia_id)
    );

    parcelas = parcelas.flatMap((p) => {
      if (!idsNoExtrato.has(p.id)) return [p];

      if (disponivel >= p.valor_centavos) {
        disponivel -= p.valor_centavos;
        return [{ ...p, situacao: 'paga' as const }];
      }

      const amortizado = disponivel;
      const restante = p.valor_centavos - amortizado;
      disponivel = 0;

      // Nada coube: a parcela inteira apenas muda de ciclo.
      if (amortizado === 0) {
        return [{ ...p, ciclo_periodo_fim: fimSeguinte }];
      }

      // Coube em parte: uma parcela paga aqui, outra pendente no ciclo seguinte.
      return [
        { ...p, valor_centavos: amortizado, situacao: 'paga' as const },
        {
          ...p,
          id: `${p.id}_r${ciclo.periodo_fim!.replace(/-/g, '')}`,
          valor_centavos: restante,
          situacao: 'pendente' as const,
          ciclo_periodo_fim: fimSeguinte,
        },
      ];
    });

    const idx = fechamentos.findIndex(
      (f) => f.pessoa_id === pessoa_id && cicloIdDe(f) === cicloId
    );
    if (idx >= 0) {
      fechamentos[idx] = {
        ...fechamentos[idx],
        estado: 'fechado',
        total_centavos: aPagar,
        fechado_por,
      };
    }
  }

  return { ok: true, fechamentos, parcelas };
}
