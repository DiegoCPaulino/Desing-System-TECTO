import type { AppState } from './types';
import DADOS from './dados-iniciais';
import {
  AMBIENTE_OBRA_INTEIRA,
  ESPECIALIDADE_TECTO,
  calcularAndamentoGeral,
  calcularAndamentoTecto,
  montarRegistros,
} from './andamento';

/**
 * Testes do Andamento Geral com dois eixos.
 *
 * O que precisa ficar guardado aqui é a `RN-125b`: os três percentuais saem do
 * MESMO conjunto de registros, e não existe tabela nova espelhando o Checklist.
 */

interface Resultado {
  nome: string;
  ok: boolean;
  detalhe?: string;
}

const resultados: Resultado[] = [];

function teste(nome: string, corpo: () => void) {
  try {
    corpo();
    resultados.push({ nome, ok: true });
  } catch (e) {
    resultados.push({ nome, ok: false, detalhe: (e as Error).message });
  }
}

function igual(recebido: unknown, esperado: unknown, oQue: string) {
  if (recebido !== esperado) {
    throw new Error(`${oQue}: esperado ${String(esperado)}, recebido ${String(recebido)}`);
  }
}

function verdadeiro(valor: boolean, oQue: string) {
  if (!valor) throw new Error(`${oQue}: esperado verdadeiro`);
}

function falso(valor: boolean, oQue: string) {
  if (valor) throw new Error(`${oQue}: esperado falso`);
}

const e = DADOS as AppState;

/** A mesma contagem de `calcularPctObra` no store, replicada para comparar. */
function pctObraDoChecklist(estado: AppState, obra_id: string): number {
  const itens = estado.itens_orcamento.filter((i) => i.obra_id === obra_id);
  if (!itens.length) return 0;
  return Math.round((itens.filter((i) => i.executado).length / itens.length) * 100);
}

// ═══════════════════════════════════════════════════════════════════════════
// RN-125b — um conjunto só, três recortes
// ═══════════════════════════════════════════════════════════════════════════

teste('RN-125b: os dois eixos cobrem exatamente o mesmo conjunto', () => {
  for (const obra of e.obras) {
    const g = calcularAndamentoGeral(e, obra.id);
    const somaEsp = g.por_especialidade.reduce((s, f) => s + f.total, 0);
    const somaAmb = g.por_ambiente.reduce((s, f) => s + f.total, 0);
    igual(somaEsp, g.total, `${obra.codigo}: eixo especialidade cobre o conjunto`);
    igual(somaAmb, g.total, `${obra.codigo}: eixo ambiente cobre o conjunto`);

    const concEsp = g.por_especialidade.reduce((s, f) => s + f.concluidos, 0);
    const concAmb = g.por_ambiente.reduce((s, f) => s + f.concluidos, 0);
    igual(concEsp, g.concluidos, `${obra.codigo}: concluídos batem no eixo especialidade`);
    igual(concAmb, g.concluidos, `${obra.codigo}: concluídos batem no eixo ambiente`);
  }
});

teste('o conjunto é itens de orçamento MAIS serviços de terceiros', () => {
  const registros = montarRegistros(e, 'o01');
  const doOrcamento = registros.filter((r) => r.origem === 'orcamento').length;
  const deTerceiros = registros.filter((r) => r.origem === 'servico_terceiro').length;
  igual(doOrcamento, e.itens_orcamento.filter((i) => i.obra_id === 'o01').length, 'itens');
  igual(deTerceiros, e.servicos_terceiros.filter((s) => s.obra_id === 'o01').length, 'serviços');
  igual(registros.length, doOrcamento + deTerceiros, 'o conjunto é a união dos dois');
});

teste('INV-06: nenhuma coleção nova espelha o Checklist', () => {
  // O conjunto do Andamento é montado em memória e morre no fim do cálculo.
  // Se alguém criar uma coleção de andamento no estado, este teste avisa.
  const colecoes = Object.keys(e);
  for (const proibida of ['andamento', 'andamentos', 'checklist', 'itens_checklist']) {
    falso(colecoes.includes(proibida), `a coleção "${proibida}" não pode existir`);
  }
  // E o item de orçamento continua sendo a unidade de execução.
  verdadeiro('executado' in e.itens_orcamento[0], 'o item de orçamento carrega a execução');
});

// ═══════════════════════════════════════════════════════════════════════════
// O total, e o acordo com as telas
// ═══════════════════════════════════════════════════════════════════════════

teste('ACEITE: o total derivado bate com o percentual armazenado, nas 5 obras', () => {
  // É este número que a Carteira, a Visão da Obra e o Portal exibem hoje.
  for (const obra of e.obras) {
    const g = calcularAndamentoGeral(e, obra.id);
    igual(g.pct_total, obra.andamento_geral_pct, `${obra.codigo}`);
  }
});

teste('o total é calculado sobre o conjunto, não somado das fatias', () => {
  const g = calcularAndamentoGeral(e, 'o01');
  igual(g.total, 41, 'registros da Obra 22');
  igual(g.concluidos, 20, 'concluídos');
  igual(g.pct_total, 49, '20 de 41 é 49%');

  // A média das fatias daria outro número — e seria o número errado.
  const mediaDasFatias = Math.round(
    g.por_especialidade.reduce((s, f) => s + f.pct, 0) / g.por_especialidade.length
  );
  verdadeiro(mediaDasFatias !== g.pct_total, 'a média das fatias não é o total');
});

// ═══════════════════════════════════════════════════════════════════════════
// As duas decisões [SÓ PROTÓTIPO]
// ═══════════════════════════════════════════════════════════════════════════

teste('o escopo TECTO entra como uma especialidade, e fecha com o Checklist', () => {
  for (const obra of e.obras) {
    const tecto = calcularAndamentoGeral(e, obra.id).por_especialidade.find(
      (f) => f.id === ESPECIALIDADE_TECTO.id
    );
    if (!tecto) continue;
    igual(tecto.pct, pctObraDoChecklist(e, obra.id), `${obra.codigo}: TECTO = Andamento TECTO`);
    igual(calcularAndamentoTecto(e, obra.id), tecto.pct, `${obra.codigo}: pela função também`);
  }
});

teste('serviço sem ambiente único cai no pseudo-ambiente "Obra inteira"', () => {
  const semAmbiente = e.servicos_terceiros.filter((s) => s.obra_id === 'o01' && !s.ambiente_id);
  verdadeiro(semAmbiente.length > 0, 'há serviços sem ambiente na Obra 22');

  const fatia = calcularAndamentoGeral(e, 'o01').por_ambiente.find(
    (f) => f.id === AMBIENTE_OBRA_INTEIRA.id
  )!;
  igual(fatia.nome, 'Obra inteira', 'nome do pseudo-ambiente');
  igual(fatia.total, semAmbiente.length, 'recebe exatamente os serviços sem ambiente');
});

teste('o pseudo-ambiente é pseudo: não existe em `ambientes`', () => {
  // Criar a linha faria o Checklist e o Andamento TECTO exibirem um ambiente
  // vazio, em telas que não são minhas.
  falso(
    e.ambientes.some((a) => a.id === AMBIENTE_OBRA_INTEIRA.id || a.nome === 'Obra inteira'),
    'não pode haver ambiente "Obra inteira" no estado'
  );
});

teste('contagem simples: nenhuma fatia pondera por valor', () => {
  // Dois itens de valores muito diferentes pesam igual. Ver a decisão
  // [SÓ PROTÓTIPO] sobre Andamento TECTO.
  const g = calcularAndamentoGeral(e, 'o01');
  const cozinha = g.por_ambiente.find((f) => f.nome === 'Cozinha')!;
  igual(cozinha.pct, Math.round((cozinha.concluidos / cozinha.total) * 100), 'só contagem');
});

// ═══════════════════════════════════════════════════════════════════════════
// Bordas
// ═══════════════════════════════════════════════════════════════════════════

teste('obra sem serviço de terceiro tem Andamento Geral igual ao TECTO', () => {
  // Obra 31 - MBP ainda não começou: só tem itens de orçamento.
  igual(e.servicos_terceiros.filter((s) => s.obra_id === 'o04').length, 0, 'sem terceiros');
  const g = calcularAndamentoGeral(e, 'o04');
  igual(g.pct_total, pctObraDoChecklist(e, 'o04'), 'os dois percentuais coincidem');
  igual(g.por_especialidade.length, 1, 'só a especialidade TECTO');
});

teste('obra inexistente devolve zero em vez de estourar', () => {
  const g = calcularAndamentoGeral(e, 'nao_existe');
  igual(g.total, 0, 'sem registros');
  igual(g.pct_total, 0, 'sem percentual');
  igual(g.por_especialidade.length, 0, 'sem fatias');
});

teste('marcar um item de orçamento move o total, e move os dois eixos junto', () => {
  const antes = calcularAndamentoGeral(e, 'o01');
  const pendente = e.itens_orcamento.find((i) => i.obra_id === 'o01' && !i.executado)!;

  const depois = calcularAndamentoGeral(
    {
      ...e,
      itens_orcamento: e.itens_orcamento.map((i) =>
        i.id === pendente.id ? { ...i, executado: true } : i
      ),
    },
    'o01'
  );

  igual(depois.concluidos, antes.concluidos + 1, 'um a mais no total');
  const espAntes = antes.por_especialidade.find((f) => f.id === ESPECIALIDADE_TECTO.id)!;
  const espDepois = depois.por_especialidade.find((f) => f.id === ESPECIALIDADE_TECTO.id)!;
  igual(espDepois.concluidos, espAntes.concluidos + 1, 'e um a mais na especialidade TECTO');

  const ambAntes = antes.por_ambiente.find((f) => f.id === pendente.ambiente_id)!;
  const ambDepois = depois.por_ambiente.find((f) => f.id === pendente.ambiente_id)!;
  igual(ambDepois.concluidos, ambAntes.concluidos + 1, 'e um a mais no ambiente dele');
});

// ═══════════════════════════════════════════════════════════════════════════

export function rodarTestes(): { total: number; falhas: number; resultados: Resultado[] } {
  const falhas = resultados.filter((r) => !r.ok).length;
  return { total: resultados.length, falhas, resultados };
}
