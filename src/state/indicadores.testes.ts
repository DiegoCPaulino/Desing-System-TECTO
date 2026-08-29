import type { AppState } from './types';
import DADOS from './dados-iniciais';
import * as Indicadores from './indicadores';
import {
  custoDeMaoDeObra,
  custosPorModalidade,
  despesasPorCategoria,
  indicadoresConsolidados,
  indicadoresDaObra,
  margemDeRepasses,
  receitaContratada,
  receitaRecebida,
  totalDeDespesasDaEmpresa,
  type Periodo,
} from './indicadores';

/**
 * Testes dos Indicadores — módulo sensível.
 *
 * O que precisa ficar guardado aqui é o erro que a decisão sobre encargos
 * previu: usar o líquido no lugar do custo da empresa faz a margem parecer
 * maior do que é, e ninguém percebe.
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

function estado(): AppState {
  return JSON.parse(JSON.stringify(DADOS)) as AppState;
}

const AGOSTO: Periodo = { inicio: '2026-08-01', fim: '2026-08-31' };
const ANO: Periodo = { inicio: '2026-01-01', fim: '2026-12-31' };

// ═══════════════════════════════════════════════════════════════════════════
// O erro que a decisão sobre encargos previu
// ═══════════════════════════════════════════════════════════════════════════

teste('a margem usa o custo da EMPRESA, não o líquido acordado', () => {
  const e = estado();
  const mo = custoDeMaoDeObra(e, 'o01', AGOSTO);

  igual(mo.liquido_centavos, 347000, 'líquido da Obra 22 em agosto');
  igual(mo.empresa_centavos, 576900, 'custo da empresa');
  verdadeiro(mo.empresa_centavos > mo.liquido_centavos, 'o custo real é maior que o líquido');

  const ind = indicadoresDaObra(e, 'o01', AGOSTO);
  const margemComLiquido = ind.receita_contratada_centavos - mo.liquido_centavos;
  verdadeiro(
    ind.margem_sobre_contratado_centavos < margemComLiquido,
    'usar o líquido daria uma margem MAIOR — é o erro que a decisão previu'
  );
  igual(margemComLiquido - ind.margem_sobre_contratado_centavos, 229900, 'a diferença exata');
});

teste('INV-03: o custo é lido do registro congelado, nunca do cadastro', () => {
  const e = estado();
  const antes = custoDeMaoDeObra(e, 'o01', AGOSTO).empresa_centavos;

  // Muda a folha no cadastro. Nada do passado pode se mexer.
  e.vinculos = e.vinculos.map((v) =>
    v.pessoa_id === 'p07' ? { ...v, custo_empresa_diaria_centavos: 99900 } : v
  );

  igual(custoDeMaoDeObra(e, 'o01', AGOSTO).empresa_centavos, antes, 'o custo do período não muda');
});

teste('o custo da empresa NUNCA é derivado do líquido', () => {
  // Se fosse um percentual fixo, a razão seria igual para todo mundo. Este
  // teste falha se alguém trocar a tabela por uma fórmula.
  const e = estado();
  const razoes = new Set<string>();
  for (const v of e.vinculos) {
    if (v.tipo !== 'funcionario_proprio') continue;
    if (!v.valor_diaria_centavos || !v.custo_empresa_diaria_centavos) continue;
    razoes.add((v.custo_empresa_diaria_centavos / v.valor_diaria_centavos).toFixed(4));
  }
  verdadeiro(razoes.size > 3, `há ${razoes.size} razões diferentes — não é fórmula`);
});

teste('diária sem custo informado é CONTADA, não substituída pelo líquido', () => {
  const e = estado();
  e.diarias = e.diarias.map((d) =>
    d.pessoa_id === 'p07' && d.data === '2026-08-18'
      ? { ...d, custo_empresa_centavos: undefined }
      : d
  );
  const mo = custoDeMaoDeObra(e, 'o01', AGOSTO);
  igual(mo.sem_custo_informado, 1, 'contou a que ficou sem custo');
  igual(mo.empresa_centavos, 576900 - 41000, 'não somou o líquido no lugar');
});

teste('o aviso aparece quando falta custo informado', () => {
  const e = estado();
  e.diarias = e.diarias.map((d) =>
    d.pessoa_id === 'p07' ? { ...d, custo_empresa_centavos: undefined } : d
  );
  const c = indicadoresConsolidados(e, AGOSTO);
  verdadeiro(
    c.avisos.some((a) => a.includes('sem custo de empresa informado')),
    'o resultado avisa'
  );
});

teste('diária de valor zero não conta como custo faltando', () => {
  // Gerente e terceirizado por obra têm diária zero: não há custo a informar.
  const e = estado();
  igual(custoDeMaoDeObra(e, 'o01', AGOSTO).sem_custo_informado, 0, 'nenhuma faltando');
});

// ═══════════════════════════════════════════════════════════════════════════
// Item 2 — a margem da empresa desconta as despesas
// ═══════════════════════════════════════════════════════════════════════════

teste('ITEM 2: margem da empresa = margem das obras menos despesas da empresa', () => {
  const e = estado();
  const c = indicadoresConsolidados(e, AGOSTO);
  igual(
    c.margem_da_empresa_centavos,
    c.margem_das_obras_centavos - c.despesas_empresa_centavos,
    'a conta'
  );
  verdadeiro(c.despesas_empresa_centavos > 0, 'há despesa no período');
  verdadeiro(
    c.margem_da_empresa_centavos < c.margem_das_obras_centavos,
    'a empresa lucra menos que a soma das obras'
  );
});

teste('as despesas por categoria somam o total', () => {
  const e = estado();
  const porCategoria = despesasPorCategoria(e, ANO);
  const soma = porCategoria.reduce((s, d) => s + d.total_centavos, 0);
  igual(soma, totalDeDespesasDaEmpresa(e, ANO), 'soma das categorias');
  igual(porCategoria.length, 3, 'as três categorias respondidas da Q-030');
});

// ═══════════════════════════════════════════════════════════════════════════
// Q-031 e Q-033 — o que continua em aberto
// ═══════════════════════════════════════════════════════════════════════════

teste('Q-031: não existe função de rateio de despesa entre obras', () => {
  const nomes = Object.keys(Indicadores);
  for (const proibido of nomes.filter((n) => /rate/i.test(n))) {
    throw new Error(`a função "${proibido}" não deveria existir enquanto a Q-031 estiver aberta`);
  }
  const c = indicadoresConsolidados(estado(), AGOSTO);
  verdadeiro(c.avisos.some((a) => a.includes('não é rateada')), 'o resultado diz que não rateia');
  // E nenhuma obra recebeu pedaço de despesa da empresa.
  for (const o of c.por_obra) {
    verdadeiro(
      !Object.keys(o).some((k) => k.includes('despesa')),
      `${o.codigo} não carrega despesa da empresa`
    );
  }
});

teste('Q-033: as duas receitas são devolvidas, e são diferentes', () => {
  const e = estado();
  const c = indicadoresConsolidados(e, AGOSTO);
  verdadeiro(c.receita_contratada_centavos > 0, 'há receita contratada');
  verdadeiro(c.receita_recebida_centavos > 0, 'há receita recebida');
  verdadeiro(
    c.receita_contratada_centavos !== c.receita_recebida_centavos,
    'as duas bases dão números diferentes — é por isso que a Q-033 importa'
  );
  verdadeiro(c.avisos.some((a) => a.includes('Q-033')), 'o resultado diz que a pergunta está aberta');
});

teste('receita contratada é por vencimento; recebida é por pagamento', () => {
  const e = estado();
  // rc04 vence em 25/08 e não foi paga; rc01 a rc03 foram pagas antes de agosto.
  igual(receitaContratada(e, 'o01', AGOSTO), 3216000, 'vence em agosto');
  igual(receitaRecebida(e, 'o01', AGOSTO), 0, 'nada foi pago em agosto na Obra 22');
  igual(receitaRecebida(e, 'o01', { inicio: '2026-04-01', fim: '2026-04-30' }), 3216000, 'abril');
});

// ═══════════════════════════════════════════════════════════════════════════
// RN-131 — só repassado com margem move a margem
// ═══════════════════════════════════════════════════════════════════════════

teste('RN-131: reembolsável e direto do Cliente não movem a margem', () => {
  const e = estado();
  const porModalidade = custosPorModalidade(e, ANO);
  for (const m of porModalidade) {
    if (m.modalidade === 'repassado_com_margem') {
      verdadeiro(m.margem_centavos > 0, 'repassado gera margem');
    } else {
      igual(m.margem_centavos, 0, `${m.rotulo} não gera margem`);
    }
  }
});

teste('a margem de repasses da obra bate com a modalidade', () => {
  const e = estado();
  const daObra = custosPorModalidade(e, ANO, 'o01').find((m) => m.modalidade === 'repassado_com_margem')!;
  igual(margemDeRepasses(e, 'o01', ANO), daObra.margem_centavos, 'os dois caminhos concordam');
  igual(margemDeRepasses(e, 'o01', ANO), 280000, 'R$2.800,00 na Obra 22');
});

teste('o custo direto do Cliente não sai do caixa da TECTO', () => {
  const direto = custosPorModalidade(estado(), ANO).find((m) => m.modalidade === 'direto_do_cliente')!;
  igual(direto.custo_centavos, 0, 'a TECTO não desembolsa');
  verdadeiro(direto.cobrado_centavos > 0, 'mas a nota existe e é registrada');
});

// ═══════════════════════════════════════════════════════════════════════════
// Período e bordas
// ═══════════════════════════════════════════════════════════════════════════

teste('o período filtra de verdade', () => {
  const e = estado();
  const jan: Periodo = { inicio: '2026-01-01', fim: '2026-01-31' };
  const c = indicadoresConsolidados(e, jan);
  igual(c.receita_contratada_centavos, 0, 'nada vence em janeiro');
  igual(c.custo_mao_de_obra_empresa_centavos, 0, 'ninguém trabalhou em janeiro');
  igual(c.despesas_empresa_centavos, 0, 'sem despesa em janeiro');
  igual(c.margem_da_empresa_centavos, 0, 'margem zero');
});

teste('obra sem movimento devolve zeros, sem estourar', () => {
  // Obra 31 - MBP ainda não começou.
  const ind = indicadoresDaObra(estado(), 'o04', AGOSTO);
  igual(ind.custo_mao_de_obra_empresa_centavos, 0, 'sem mão de obra');
  igual(ind.margem_sobre_contratado_centavos, 0, 'margem zero');
  igual(ind.diarias_sem_custo_informado, 0, 'nada faltando');
});

teste('obra inexistente não estoura', () => {
  const ind = indicadoresDaObra(estado(), 'nao_existe', AGOSTO);
  igual(ind.codigo, 'nao_existe', 'devolve o id como rótulo');
  igual(ind.margem_sobre_contratado_centavos, 0, 'zero');
});

teste('o consolidado cobre todas as obras', () => {
  const e = estado();
  igual(indicadoresConsolidados(e, AGOSTO).por_obra.length, e.obras.length, 'as cinco obras');
});

teste('o aviso sobre a gestão sem regime aparece', () => {
  const c = indicadoresConsolidados(estado(), AGOSTO);
  verdadeiro(
    c.avisos.some((a) => a.includes('Gerente e Assistente')),
    'o resultado diz que a gestão não é descontada'
  );
});

// ═══════════════════════════════════════════════════════════════════════════

export function rodarTestes(): { total: number; falhas: number; resultados: Resultado[] } {
  const falhas = resultados.filter((r) => !r.ok).length;
  return { total: resultados.length, falhas, resultados };
}
