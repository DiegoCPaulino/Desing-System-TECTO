import type {
  AppState,
  CategoriaDespesa,
  ModalidadeFinanceira,
} from './types';

/**
 * INDICADORES — módulo sensível.
 *
 * O erro aqui não trava nada: produz um número que parece certo e está errado,
 * e é o número para o qual o dono da empresa olha primeiro. Três coisas
 * governam o arquivo.
 *
 * **1. Duas receitas, porque a `Q-033` está aberta.** A pergunta "receita
 * significa valor contratado ou valor recebido?" não foi respondida. Este
 * módulo devolve as DUAS e não elege nenhuma. Escolher em silêncio seria
 * decidir por conveniência de implementação uma coisa que muda todo o
 * resultado.
 *
 * **2. Despesa da empresa fica SEPARADA, sem rateio.** A `Q-031` pergunta se
 * ela é rateada entre obras. Enquanto não houver resposta, não existe função de
 * rateio aqui — nem comentada, nem "por enquanto".
 *
 * **3. O custo da empresa é lido do registro, nunca calculado.** O sistema não
 * calcula encargos. `Diaria.custo_empresa_centavos` vem congelado do fato; se
 * estiver ausente, o resultado **avisa** em vez de substituir pelo líquido.
 * Somar o líquido no lugar do custo faria a margem parecer maior do que é, que
 * é precisamente o erro que a decisão sobre encargos previu.
 */

export interface Periodo {
  inicio: string;
  fim: string;
}

const ROTULO_MODALIDADE: Record<ModalidadeFinanceira, string> = {
  repassado_com_margem: 'Repassado com margem',
  reembolsavel: 'Reembolsável',
  direto_do_cliente: 'Direto do Cliente',
};

const ROTULO_CATEGORIA: Record<CategoriaDespesa, string> = {
  ferramentas_e_maquinas: 'Ferramentas e máquinas',
  uniforme: 'Uniforme',
  marketing_e_trafego_pago: 'Marketing e tráfego pago',
};

const dentro = (data: string, p: Periodo) => data >= p.inicio && data <= p.fim;

export interface CustoPorModalidade {
  modalidade: ModalidadeFinanceira;
  rotulo: string;
  cobrado_centavos: number;
  custo_centavos: number;
  margem_centavos: number;
  quantidade: number;
}

export interface DespesaPorCategoria {
  categoria: CategoriaDespesa;
  rotulo: string;
  total_centavos: number;
  quantidade: number;
}

export interface IndicadoresDaObra {
  obra_id: string;
  codigo: string;

  /** Parcelas do Cliente com VENCIMENTO no período — visão de competência. */
  receita_contratada_centavos: number;
  /** Parcelas efetivamente PAGAS no período — visão de caixa. */
  receita_recebida_centavos: number;

  /** O que foi acordado com as pessoas. Não é o que a obra custou. */
  custo_mao_de_obra_liquido_centavos: number;
  /** O que a obra custou de fato em mão de obra, com encargos. */
  custo_mao_de_obra_empresa_centavos: number;

  /** Margem dos serviços repassados com margem. Ver a nota em `margemDeRepasses`. */
  margem_repasses_centavos: number;

  margem_sobre_contratado_centavos: number;
  margem_sobre_recebido_centavos: number;

  /** Diárias com valor mas sem custo de empresa informado. */
  diarias_sem_custo_informado: number;
}

export interface IndicadoresConsolidados {
  periodo: Periodo;
  por_obra: IndicadoresDaObra[];

  receita_contratada_centavos: number;
  receita_recebida_centavos: number;
  custo_mao_de_obra_empresa_centavos: number;
  margem_repasses_centavos: number;

  custos_por_modalidade: CustoPorModalidade[];
  despesas_por_categoria: DespesaPorCategoria[];
  despesas_empresa_centavos: number;

  /** Soma das margens das obras. Responde "as obras deram lucro". */
  margem_das_obras_centavos: number;
  /**
   * A anterior menos as despesas da empresa. Responde "a EMPRESA deu lucro",
   * que é a pergunta real — uma obra pode fechar no azul enquanto a empresa
   * fecha no vermelho por causa do que não pertence a obra nenhuma.
   */
  margem_da_empresa_centavos: number;

  /** O que este número NÃO contém. A tela é obrigada a dizer. */
  avisos: string[];
}

// ─── Receita ─────────────────────────────────────────────────────────────────

export function receitaContratada(state: AppState, obra_id: string, p: Periodo): number {
  return state.recebimentos
    .filter((r) => r.obra_id === obra_id && dentro(r.vencimento, p))
    .reduce((soma, r) => soma + r.valor_centavos, 0);
}

export function receitaRecebida(state: AppState, obra_id: string, p: Periodo): number {
  return state.recebimentos
    .filter((r) => r.obra_id === obra_id && r.situacao === 'paga' && r.pago_em && dentro(r.pago_em, p))
    .reduce((soma, r) => soma + r.valor_centavos, 0);
}

// ─── Mão de obra ─────────────────────────────────────────────────────────────

/**
 * Custo de mão de obra da obra no período, nos dois valores.
 *
 * `empresa` soma **apenas o que foi informado**. Diária com valor e sem custo
 * de empresa é contada em `sem_custo_informado`, não substituída pelo líquido:
 * substituir daria um número menor e parecendo certo.
 */
export function custoDeMaoDeObra(
  state: AppState,
  obra_id: string,
  p: Periodo
): { liquido_centavos: number; empresa_centavos: number; sem_custo_informado: number } {
  const doPeriodo = state.diarias.filter((d) => d.obra_que_arca_id === obra_id && dentro(d.data, p));

  let liquido = 0;
  let empresa = 0;
  let semCusto = 0;

  for (const d of doPeriodo) {
    const valor = d.valor_centavos + d.adicional_centavos;
    liquido += valor;
    if (d.custo_empresa_centavos !== undefined) {
      empresa += d.custo_empresa_centavos;
    } else if (valor > 0) {
      // Sem valor não há custo a informar — gerente e terceirizado por obra
      // têm diária zero e não entram nesta contagem.
      semCusto += 1;
    }
  }

  return { liquido_centavos: liquido, empresa_centavos: empresa, sem_custo_informado: semCusto };
}

// ─── Terceiros ───────────────────────────────────────────────────────────────

/**
 * Margem dos custos de terceiros no período.
 *
 * **Só `repassado_com_margem` entra.** As outras duas modalidades da `RN-131`
 * são passagem de dinheiro e não movem a margem:
 *
 * - *Reembolsável* — a TECTO paga e o Cliente devolve o mesmo valor. Entra e
 *   sai. Contar o custo sem contar a devolução afundaria a margem sem motivo.
 * - *Direto do Cliente* — a TECTO não desembolsa nada e não cobra nada; só
 *   registra a nota.
 */
export function margemDeRepasses(state: AppState, obra_id: string, p: Periodo): number {
  return state.custos_obra
    .filter((c) => c.obra_id === obra_id && c.modalidade === 'repassado_com_margem' && dentro(c.data, p))
    .reduce((soma, c) => soma + (c.valor_cobrado_centavos - c.custo_centavos), 0);
}

/** Custos por modalidade, para a leitura por modalidade financeira. */
export function custosPorModalidade(state: AppState, p: Periodo, obra_id?: string): CustoPorModalidade[] {
  const modalidades: ModalidadeFinanceira[] = [
    'repassado_com_margem',
    'reembolsavel',
    'direto_do_cliente',
  ];

  return modalidades.map((modalidade) => {
    const linhas = state.custos_obra.filter(
      (c) => c.modalidade === modalidade && dentro(c.data, p) && (!obra_id || c.obra_id === obra_id)
    );
    const cobrado = linhas.reduce((s, c) => s + c.valor_cobrado_centavos, 0);
    const custo = linhas.reduce((s, c) => s + c.custo_centavos, 0);
    return {
      modalidade,
      rotulo: ROTULO_MODALIDADE[modalidade],
      cobrado_centavos: cobrado,
      custo_centavos: custo,
      // Só a primeira modalidade produz margem — ver `margemDeRepasses`.
      margem_centavos: modalidade === 'repassado_com_margem' ? cobrado - custo : 0,
      quantidade: linhas.length,
    };
  });
}

// ─── Despesas da empresa ─────────────────────────────────────────────────────

/**
 * `Q-031` EM ABERTO: não se sabe se a despesa geral é rateada entre obras ou
 * fica em categoria separada. Ela fica **separada**, e não existe função de
 * rateio neste módulo. Quando a resposta vier, ela entra — não antes.
 */
export function despesasPorCategoria(state: AppState, p: Periodo): DespesaPorCategoria[] {
  const categorias: CategoriaDespesa[] = [
    'ferramentas_e_maquinas',
    'uniforme',
    'marketing_e_trafego_pago',
  ];

  return categorias.map((categoria) => {
    const linhas = state.despesas_empresa.filter((d) => d.categoria === categoria && dentro(d.data, p));
    return {
      categoria,
      rotulo: ROTULO_CATEGORIA[categoria],
      total_centavos: linhas.reduce((s, d) => s + d.valor_centavos, 0),
      quantidade: linhas.length,
    };
  });
}

export function totalDeDespesasDaEmpresa(state: AppState, p: Periodo): number {
  return state.despesas_empresa
    .filter((d) => dentro(d.data, p))
    .reduce((soma, d) => soma + d.valor_centavos, 0);
}

// ─── Por obra ────────────────────────────────────────────────────────────────

/**
 * A margem de uma obra no período.
 *
 *   receita + margem dos repasses − custo de mão de obra COM encargos
 *
 * O custo usado é o da empresa, e não o líquido: o líquido é o que a pessoa
 * recebe, não o que a obra custa. Usar o líquido aqui é o erro que a decisão
 * sobre encargos previu — "superestima a margem em silêncio".
 */
export function indicadoresDaObra(state: AppState, obra_id: string, p: Periodo): IndicadoresDaObra {
  const obra = state.obras.find((o) => o.id === obra_id);
  const maoDeObra = custoDeMaoDeObra(state, obra_id, p);
  const repasses = margemDeRepasses(state, obra_id, p);
  const contratada = receitaContratada(state, obra_id, p);
  const recebida = receitaRecebida(state, obra_id, p);

  return {
    obra_id,
    codigo: obra?.codigo ?? obra_id,
    receita_contratada_centavos: contratada,
    receita_recebida_centavos: recebida,
    custo_mao_de_obra_liquido_centavos: maoDeObra.liquido_centavos,
    custo_mao_de_obra_empresa_centavos: maoDeObra.empresa_centavos,
    margem_repasses_centavos: repasses,
    margem_sobre_contratado_centavos: contratada + repasses - maoDeObra.empresa_centavos,
    margem_sobre_recebido_centavos: recebida + repasses - maoDeObra.empresa_centavos,
    diarias_sem_custo_informado: maoDeObra.sem_custo_informado,
  };
}

// ─── Consolidado ─────────────────────────────────────────────────────────────

/**
 * O consolidado da empresa no período.
 *
 * A diferença entre `margem_das_obras` e `margem_da_empresa` é o ponto inteiro
 * deste módulo: a primeira responde "as obras deram lucro", a segunda responde
 * "a empresa deu lucro". São perguntas diferentes, e só a segunda paga a conta.
 */
export function indicadoresConsolidados(state: AppState, p: Periodo): IndicadoresConsolidados {
  const porObra = state.obras.map((o) => indicadoresDaObra(state, o.id, p));

  const soma = (f: (i: IndicadoresDaObra) => number) => porObra.reduce((s, i) => s + f(i), 0);

  const margemDasObras = soma((i) => i.margem_sobre_contratado_centavos);
  const despesas = totalDeDespesasDaEmpresa(state, p);

  const avisos: string[] = [];

  const semCusto = soma((i) => i.diarias_sem_custo_informado);
  if (semCusto > 0) {
    avisos.push(
      `${semCusto} diária${semCusto > 1 ? 's' : ''} sem custo de empresa informado. ` +
        'A margem está mais alta do que a real nessa medida.'
    );
  }

  // A remuneração da gestão é Q-001 a Q-004, em aberto. Enquanto for, o custo
  // do Gerente e do Assistente não entra em obra nenhuma — e a margem ignora
  // uma despesa que existe. Dizer isso é obrigação deste módulo.
  const gestaoSemRegime = state.vinculos.some(
    (v) =>
      !v.fim &&
      (v.tipo === 'gerente_obras' || v.tipo === 'assistente_gerenciamento') &&
      v.valor_obra_centavos === undefined
  );
  if (gestaoSemRegime) {
    avisos.push(
      'A remuneração de Gerente e Assistente não está definida (Q-001 a Q-004) ' +
        'e não entra em nenhuma obra. A margem não a desconta.'
    );
  }

  avisos.push(
    'Receita aparece em duas bases porque a Q-033 está aberta: contratado e recebido.'
  );
  avisos.push(
    'Despesa da empresa não é rateada entre obras — a Q-031 não foi respondida.'
  );

  return {
    periodo: p,
    por_obra: porObra,
    receita_contratada_centavos: soma((i) => i.receita_contratada_centavos),
    receita_recebida_centavos: soma((i) => i.receita_recebida_centavos),
    custo_mao_de_obra_empresa_centavos: soma((i) => i.custo_mao_de_obra_empresa_centavos),
    margem_repasses_centavos: soma((i) => i.margem_repasses_centavos),
    custos_por_modalidade: custosPorModalidade(state, p),
    despesas_por_categoria: despesasPorCategoria(state, p),
    despesas_empresa_centavos: despesas,
    margem_das_obras_centavos: margemDasObras,
    margem_da_empresa_centavos: margemDasObras - despesas,
    avisos,
  };
}
