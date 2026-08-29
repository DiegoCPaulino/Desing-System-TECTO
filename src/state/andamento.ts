import type { AppState } from './types';

/**
 * ANDAMENTO GERAL — dois eixos, um conjunto só.
 *
 * A `RN-125` define o Andamento Geral como "organizado por **Especialidade e
 * por Ambiente ao mesmo tempo**, derivando os dois recortes do **mesmo
 * conjunto de registros**". A `RN-125b` acrescenta a restrição que governa
 * este arquivo inteiro:
 *
 *   "A Especialidade é atributo do serviço de terceiro. Os três percentuais
 *    saem de uma agregação sobre o mesmo conjunto de registros. **Não se cria
 *    uma segunda tabela espelhando o Checklist**: isso violaria o `INV-06`."
 *
 * Por isso aqui não existe entidade nova. `montarRegistros` produz UMA lista,
 * em memória, a partir de duas coleções que já existem:
 *
 * - `itens_orcamento` — que **é** o Checklist (`INV-06`), agrupado sob uma
 *   especialidade sintética chamada "TECTO";
 * - `servicos_terceiros` — que já carrega especialidade e ambiente.
 *
 * Os três percentuais são três `group by` sobre essa mesma lista. Se fossem
 * calculados a partir de fontes diferentes, poderiam discordar entre si — e é
 * exatamente isso que a regra proíbe.
 *
 * **Contagem simples, sem ponderação por valor**, para os dois eixos. Ver
 * `docs/DECISOES.md`, decisões `[SÓ PROTÓTIPO]` sobre Andamento TECTO e Geral.
 */

/** A especialidade sintética que representa o escopo próprio da TECTO. */
export const ESPECIALIDADE_TECTO = { id: 'tecto', nome: 'TECTO' } as const;

/**
 * O pseudo-ambiente da decisão `[SÓ PROTÓTIPO]`. É pseudo de verdade: não
 * existe linha correspondente em `ambientes`, porque criar uma faria o
 * Checklist e o Andamento TECTO exibirem um ambiente vazio.
 */
export const AMBIENTE_OBRA_INTEIRA = { id: 'obra_inteira', nome: 'Obra inteira' } as const;

export interface RegistroDeAndamento {
  id: string;
  origem: 'orcamento' | 'servico_terceiro';
  descricao: string;
  especialidade_id: string;
  especialidade_nome: string;
  ambiente_id: string;
  ambiente_nome: string;
  concluido: boolean;
}

export interface FatiaAndamento {
  id: string;
  nome: string;
  total: number;
  concluidos: number;
  pct: number;
}

export interface AndamentoGeral {
  obra_id: string;
  por_especialidade: FatiaAndamento[];
  por_ambiente: FatiaAndamento[];
  /** O percentual da obra inteira, sobre o conjunto todo. */
  pct_total: number;
  total: number;
  concluidos: number;
}

/** Mesma regra de arredondamento de `calcularPctObra`, para os números baterem. */
function pct(concluidos: number, total: number): number {
  if (!total) return 0;
  return Math.round((concluidos / total) * 100);
}

/**
 * O conjunto único de registros do Andamento Geral de uma obra.
 *
 * Nada aqui é gravado: a lista existe pelo tempo do cálculo e morre. É o que
 * mantém o `INV-06` de pé — o Item de Orçamento continua sendo a unidade de
 * execução, e não ganha um espelho.
 */
export function montarRegistros(state: AppState, obra_id: string): RegistroDeAndamento[] {
  const nomeAmbiente = (id: string) =>
    state.ambientes.find((a) => a.id === id)?.nome ?? id;

  // 1 — o escopo da TECTO, que é o Checklist, sob a especialidade "TECTO".
  const doOrcamento: RegistroDeAndamento[] = state.itens_orcamento
    .filter((i) => i.obra_id === obra_id)
    .map((i) => ({
      id: i.id,
      origem: 'orcamento' as const,
      descricao: i.servico,
      especialidade_id: ESPECIALIDADE_TECTO.id,
      especialidade_nome: ESPECIALIDADE_TECTO.nome,
      ambiente_id: i.ambiente_id,
      ambiente_nome: nomeAmbiente(i.ambiente_id),
      concluido: i.executado,
    }));

  // 2 — os serviços de terceiros, cada um com a própria especialidade.
  const dosTerceiros: RegistroDeAndamento[] = state.servicos_terceiros
    .filter((s) => s.obra_id === obra_id)
    .map((s) => {
      const esp = state.especialidades.find((x) => x.id === s.especialidade_id);
      const semAmbiente = !s.ambiente_id;
      return {
        id: s.id,
        origem: 'servico_terceiro' as const,
        descricao: s.descricao,
        especialidade_id: s.especialidade_id,
        especialidade_nome: esp?.nome ?? s.especialidade_id,
        ambiente_id: semAmbiente ? AMBIENTE_OBRA_INTEIRA.id : s.ambiente_id!,
        ambiente_nome: semAmbiente ? AMBIENTE_OBRA_INTEIRA.nome : nomeAmbiente(s.ambiente_id!),
        concluido: s.situacao === 'concluido',
      };
    });

  return [...doOrcamento, ...dosTerceiros];
}

/** Agrupa a mesma lista por uma chave, preservando a ordem de aparição. */
function agrupar(
  registros: RegistroDeAndamento[],
  chave: (r: RegistroDeAndamento) => { id: string; nome: string }
): FatiaAndamento[] {
  const mapa = new Map<string, FatiaAndamento>();
  for (const r of registros) {
    const { id, nome } = chave(r);
    const atual = mapa.get(id) ?? { id, nome, total: 0, concluidos: 0, pct: 0 };
    atual.total += 1;
    if (r.concluido) atual.concluidos += 1;
    mapa.set(id, atual);
  }
  for (const fatia of mapa.values()) {
    fatia.pct = pct(fatia.concluidos, fatia.total);
  }
  return [...mapa.values()];
}

/**
 * Os três percentuais do Andamento Geral, do mesmo conjunto de registros.
 *
 * O total **não** é a soma nem a média das fatias: é o percentual calculado
 * sobre o conjunto inteiro. Somar fatias arredondadas daria um número
 * ligeiramente diferente, e é o total que precisa bater com o do Portal.
 */
export function calcularAndamentoGeral(state: AppState, obra_id: string): AndamentoGeral {
  const registros = montarRegistros(state, obra_id);

  const concluidos = registros.filter((r) => r.concluido).length;

  return {
    obra_id,
    por_especialidade: agrupar(registros, (r) => ({
      id: r.especialidade_id,
      nome: r.especialidade_nome,
    })),
    por_ambiente: agrupar(registros, (r) => ({ id: r.ambiente_id, nome: r.ambiente_nome })),
    pct_total: pct(concluidos, registros.length),
    total: registros.length,
    concluidos,
  };
}

/**
 * O Andamento **TECTO**: só o escopo próprio, que é o Checklist (`RN-126`).
 *
 * Devolve o mesmo número que `calcularPctObra` do store, porque as duas contam
 * os mesmos itens da mesma forma. A diferença é a origem: aqui ele sai do
 * conjunto do Andamento Geral, como a fatia da especialidade "TECTO" — o que
 * garante que os dois eixos e o total nunca discordem entre si.
 */
export function calcularAndamentoTecto(state: AppState, obra_id: string): number {
  const fatia = calcularAndamentoGeral(state, obra_id).por_especialidade.find(
    (f) => f.id === ESPECIALIDADE_TECTO.id
  );
  return fatia?.pct ?? 0;
}
