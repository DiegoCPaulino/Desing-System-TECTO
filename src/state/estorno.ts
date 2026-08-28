import type { AppState, Lancamento, Parcela } from './types';
import { proximoFimDeCiclo, type TipoCiclo } from './fechamento';

/**
 * ESTORNO — módulo sensível.
 *
 * O estorno é a única forma de corrigir dinheiro neste sistema. As fontes:
 *
 * - **Glossário** — "Registro que anula um lançamento anterior. Substitui a
 *   exclusão em qualquer contexto financeiro."
 * - **`INV-08`** — "Toda correção financeira é Estorno seguido de novo
 *   lançamento. Nunca UPDATE destrutivo em registro financeiro."
 * - **`RN-073`** — "A correção se faz por Estorno **no ciclo seguinte**."
 * - **`INV-07`** — a imutabilidade vem do Fechamento, não do calendário.
 *
 * Disso saem as quatro regras que este módulo faz valer:
 *
 * 1. O original **não é apagado nem alterado**. O estorno é registro novo que
 *    aponta para ele.
 * 2. O valor cai no **ciclo seguinte**, nunca num ciclo já fechado. É o que
 *    permite corrigir um pagamento sem violar o `INV-07`.
 * 3. Autor, data e motivo ficam gravados. Correção sem motivo não é auditável.
 * 4. Lançamento já estornado não estorna de novo.
 */

export interface ResultadoEstorno {
  ok: boolean;
  erro?: string;
  lancamentos?: Lancamento[];
  parcelas?: Parcela[];
  /** O estorno criado, quando deu certo. */
  estorno?: Lancamento;
}

/** O estorno que anula este lançamento, se já existir. */
export function estornoDe(state: AppState, lancamento_id: string): Lancamento | undefined {
  return state.lancamentos.find(
    (l) => l.tipo === 'estorno' && l.estorna_lancamento_id === lancamento_id
  );
}

export function jaFoiEstornado(state: AppState, lancamento_id: string): boolean {
  return estornoDe(state, lancamento_id) !== undefined;
}

/**
 * O ciclo da pessoa em que o estorno deve cair: o primeiro que ainda está
 * ABERTO e que termina depois de `depoisDe`.
 *
 * Se todos os ciclos registrados já fecharam — ou se a pessoa não tem
 * Fechamento nenhum —, projeta o próximo a partir da periodicidade do vínculo.
 * O estorno nunca fica sem destino: ficar sem destino significaria dinheiro
 * devido a alguém e não cobrado de ninguém.
 */
export function cicloDestinoDoEstorno(
  state: AppState,
  pessoa_id: string,
  depoisDe: string
): string | undefined {
  const abertos = state.fechamentos
    .filter((f) => f.pessoa_id === pessoa_id && f.estado === 'aberto' && f.periodo_fim > depoisDe)
    .sort((a, b) => a.periodo_fim.localeCompare(b.periodo_fim));

  if (abertos.length) return abertos[0].periodo_fim;

  // Nenhum ciclo aberto adiante: projeta a partir da periodicidade da pessoa.
  // Primeiro pelo último Fechamento dela, que é o registro mais confiável.
  const ultimoFechamento = state.fechamentos
    .filter((f) => f.pessoa_id === pessoa_id)
    .sort((a, b) => b.periodo_fim.localeCompare(a.periodo_fim))[0];

  if (ultimoFechamento) return proximoFimDeCiclo(ultimoFechamento.ciclo, depoisDe);

  // Sem Fechamento nenhum, resta o vínculo. Só as três periodicidades de
  // Fechamento servem: `diario` e `por_obra` não delimitam período, e projetar
  // um a partir deles seria inventar quando o dinheiro cai.
  const cicloDoVinculo = state.vinculos.find((v) => v.pessoa_id === pessoa_id && !v.fim)
    ?.ciclo_pagamento;
  const periodicos: TipoCiclo[] = ['semanal', 'quinzenal', 'mensal'];
  if (cicloDoVinculo && periodicos.includes(cicloDoVinculo as TipoCiclo)) {
    return proximoFimDeCiclo(cicloDoVinculo as TipoCiclo, depoisDe);
  }
  return undefined;
}

/**
 * Estorna um lançamento.
 *
 * **O raciocínio do valor**, que é a parte que não pode errar:
 *
 * Anular um lançamento significa colocar a pessoa de volta onde ela estava
 * antes dele. Isso tem duas metades, e as duas importam:
 *
 * - **O que já foi descontado volta.** O crédito é a soma das parcelas com
 *   situação `paga` — o dinheiro que de fato saiu do bolso da pessoa. Não é o
 *   valor do lançamento: um empréstimo de R$1.200,00 com uma parcela paga tirou
 *   R$300,00 dela, e é R$300,00 que ela tem a receber.
 * - **O que ainda seria descontado para de ser.** As parcelas `pendente`
 *   passam a `estornada` e somem da cobrança, sem sumir do extrato.
 *
 * Se nada foi pago ainda, o crédito é zero e o estorno só cancela as parcelas
 * futuras. O registro do estorno existe de qualquer forma, porque a decisão de
 * anular é um fato e precisa de rastro.
 *
 * Não altera o estado recebido. Devolve os arrays novos.
 */
export function estornarLancamento(
  state: AppState,
  lancamento_id: string,
  motivo: string,
  autor_id: string,
  data: string
): ResultadoEstorno {
  const original = state.lancamentos.find((l) => l.id === lancamento_id);
  if (!original) {
    return { ok: false, erro: 'Lançamento não encontrado.' };
  }

  if (original.tipo === 'estorno') {
    return {
      ok: false,
      erro:
        'Um estorno não se estorna. Para corrigir um estorno, registre um ' +
        'lançamento novo — é o que o INV-08 chama de "estorno seguido de novo lançamento".',
    };
  }

  const anterior = estornoDe(state, lancamento_id);
  if (anterior) {
    return {
      ok: false,
      erro: `Este lançamento já foi estornado em ${anterior.data}, por "${anterior.motivo}".`,
    };
  }

  if (!motivo.trim()) {
    return { ok: false, erro: 'O estorno exige um motivo. Correção sem motivo não é auditável.' };
  }

  const doLancamento = state.parcelas.filter((p) => p.lancamento_id === lancamento_id);
  const pagas = doLancamento.filter((p) => p.situacao === 'paga');
  const pendentes = doLancamento.filter((p) => p.situacao === 'pendente');

  // O crédito é o que de fato saiu do bolso da pessoa, não o valor do lançamento.
  const credito = pagas.reduce((soma, p) => soma + p.valor_centavos, 0);

  // O estorno cai no ciclo SEGUINTE ao da última parcela cobrada. Se nada foi
  // cobrado, o ponto de partida é a data do próprio lançamento.
  const ultimaCobranca = pagas
    .map((p) => p.ciclo_periodo_fim)
    .sort()
    .pop();
  const referencia = ultimaCobranca ?? original.data;
  const cicloDestino = cicloDestinoDoEstorno(state, original.pessoa_id, referencia);

  if (credito > 0 && !cicloDestino) {
    return {
      ok: false,
      erro:
        'Não há ciclo seguinte para receber o estorno. O vínculo da pessoa não ' +
        'tem periodicidade definida, e o valor ficaria devido sem cair em lugar nenhum.',
    };
  }

  const estorno: Lancamento = {
    id: `es_${lancamento_id}`,
    pessoa_id: original.pessoa_id,
    tipo: 'estorno',
    valor_centavos: credito,
    parcelas: credito > 0 ? 1 : 0,
    parcelas_pagas: 0,
    data,
    estorna_lancamento_id: lancamento_id,
    motivo: motivo.trim(),
    autor_id,
  };

  // As pendentes deixam de ser cobradas. Continuam no extrato, com o valor e o
  // número intactos — não é DELETE nem sobrescrita de valor.
  const parcelas: Parcela[] = state.parcelas.map((p) =>
    pendentes.some((x) => x.id === p.id) ? { ...p, situacao: 'estornada' as const } : p
  );

  if (credito > 0) {
    parcelas.push({
      id: `pa_${estorno.id}`,
      lancamento_id: estorno.id,
      numero: 1,
      valor_centavos: credito,
      situacao: 'pendente',
      ciclo_periodo_fim: cicloDestino!,
    });
  }

  return {
    ok: true,
    lancamentos: [...state.lancamentos, estorno],
    parcelas,
    estorno,
  };
}

/**
 * Linha de auditoria de um estorno, para quem precisar exibir o que aconteceu.
 * O original continua inteiro e acessível — é esse o ponto do `INV-08`.
 */
export interface RegistroDeEstorno {
  estorno_id: string;
  original_id: string;
  pessoa_id: string;
  tipo_original: string;
  valor_original_centavos: number;
  valor_creditado_centavos: number;
  parcelas_canceladas: number;
  motivo: string;
  autor_id?: string;
  data: string;
  ciclo_destino?: string;
}

export function estornosDaPessoa(state: AppState, pessoa_id: string): RegistroDeEstorno[] {
  return state.lancamentos
    .filter((l) => l.tipo === 'estorno' && l.pessoa_id === pessoa_id)
    .map((e) => {
      const original = state.lancamentos.find((l) => l.id === e.estorna_lancamento_id);
      const canceladas = state.parcelas.filter(
        (p) => p.lancamento_id === e.estorna_lancamento_id && p.situacao === 'estornada'
      );
      const destino = state.parcelas.find((p) => p.lancamento_id === e.id);
      return {
        estorno_id: e.id,
        original_id: e.estorna_lancamento_id ?? '',
        pessoa_id: e.pessoa_id,
        tipo_original: original?.tipo ?? 'desconhecido',
        valor_original_centavos: original?.valor_centavos ?? 0,
        valor_creditado_centavos: e.valor_centavos,
        parcelas_canceladas: canceladas.length,
        motivo: e.motivo ?? '',
        autor_id: e.autor_id,
        data: e.data,
        ciclo_destino: destino?.ciclo_periodo_fim,
      };
    });
}
