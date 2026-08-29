export interface Pessoa {
  id: string;
  nome: string;
  iniciais: string;
  funcao: string;
  ativo: boolean;
  desativado_em?: string;
}

/**
 * Os seis tipos da tabela da `RN-004`. O tipo determina o regime de
 * remuneração:
 *
 *   funcionario_proprio      → Diária, em ciclo semanal, quinzenal ou mensal
 *   gerente_obras            → Valor fixo por Obra
 *   assistente_gerenciamento → a confirmar, `Q-004`
 *   terceirizado             → Contrato com parcelas, ou Diária eventual
 *   administracao            → fora do escopo de pagamento do sistema na V1
 *   financeiro               → fora do escopo de pagamento do sistema na V1
 */
export type TipoVinculo =
  | 'funcionario_proprio'
  | 'gerente_obras'
  | 'assistente_gerenciamento'
  | 'terceirizado'
  | 'administracao'
  | 'financeiro';

export interface Vinculo {
  id: string;
  pessoa_id: string;
  tipo: TipoVinculo;
  /**
   * Opcional porque nem todo vínculo tem regime definido: Administração e
   * Financeiro estão fora do escopo de pagamento na V1, e o regime do
   * Assistente de Gerenciamento é `Q-004`, em aberto.
   */
  ciclo_pagamento?: 'diario' | 'semanal' | 'quinzenal' | 'mensal' | 'por_obra';
  valor_diaria_centavos?: number;
  /**
   * O Gerente de Obras recebe valor fixo por Obra (`RN-004`), mas o campo fica
   * VAZIO para ele: se esse valor varia com a duração ou o porte da obra é
   * `Q-001`, em aberto, e um único número no vínculo já afirmaria que não
   * varia. A estrutura existe; a regra não é assumida.
   */
  valor_obra_centavos?: number;
  /**
   * O que a Pessoa custa à empresa por dia — o segundo campo do "padrão de
   * dois campos" da decisão sobre encargos, em `docs/DECISOES.md`.
   *
   * **Nunca é derivado do líquido, e o líquido nunca é derivado dele.** São
   * dois números independentes: o líquido é o acordo com a pessoa, e este vem
   * da contabilidade externa, lançado à mão. Multiplicar um pelo outro por um
   * percentual seria exatamente o cálculo de encargos que a decisão proíbe.
   *
   * Ausente para terceirizado, que emite nota e não gera encargo, e para a
   * gestão, cujo regime é `Q-001` a `Q-004`.
   */
  custo_empresa_diaria_centavos?: number;
  inicio: string;
  fim?: string;
}

export interface Obra {
  id: string;
  codigo: string;
  tipo: 'obra' | 'pequeno_servico';
  cliente: string;
  endereco: string;
  estado: 'aguardando_inicio' | 'em_andamento' | 'pausada' | 'concluida' | 'cancelada';
  inicio: string;
  previsao_termino: string;
  valor_contratado_centavos: number;
  adicionais_centavos: number;
  recebido_centavos: number;
  andamento_geral_pct: number;
}

export interface VinculoObra {
  id: string;
  obra_id: string;
  pessoa_id: string;
  papel: 'gerente' | 'assistente';
  inicio: string;
  fim?: string;
}

export interface Ambiente {
  id: string;
  obra_id: string;
  nome: string;
}

export interface ItemOrcamento {
  id: string;
  obra_id: string;
  ambiente_id: string;
  servico: string;
  quantidade: number;
  unidade: string;
  valor_centavos: number;
  executado: boolean;
  executado_em?: string;
  executado_por?: string;
}

export interface Planejamento {
  id: string;
  semana_inicio: string;
  pessoa_id: string;
  data: string;
  obra_id?: string;
  motivo_ausencia?: string;
  em_aberto?: boolean;
  recebe: boolean;
  adicional_centavos: number;
  estado: 'rascunho' | 'publicado';
  // Registro de alteração após publicação
  alterada?: boolean;
  alteracao_pendente?: boolean;
  alteracao_por?: string;
  alteracao_em?: string;
  valor_anterior?: string; // rótulo do valor antes da 1ª alteração — nunca sobrescrito
}

export interface Semana {
  inicio: string;
  estado: 'rascunho' | 'publicado';
}

export interface Diario {
  id: string;
  obra_id: string;
  data: string;
  estado: 'rascunho' | 'finalizado';
  texto: string[];
  houve_execucao?: boolean;
  motivo_sem_execucao?: string;
  fotos: string[];
  finalizado_por?: string;
  finalizado_em?: string;
  removidos_planejados?: { pessoa_id: string; motivo: string }[];
}

export interface Presenca {
  id: string;
  diario_id: string;
  obra_id: string;
  pessoa_id: string;
  data: string;
  periodo: 'dia_todo' | 'manha' | 'tarde';
}

export interface Diaria {
  id: string;
  pessoa_id: string;
  data: string;
  obra_que_arca_id?: string;
  valor_centavos: number;
  adicional_centavos: number;
  /**
   * O custo da empresa naquele dia, CONGELADO no momento do fato, como manda o
   * `INV-03` — do mesmo jeito que `valor_centavos`.
   *
   * Mora aqui, e não só no Vínculo, por um motivo concreto: se os Indicadores
   * lessem o cadastro ao vivo, mudar a folha hoje reescreveria a margem do mês
   * passado, e não existiria auditoria possível.
   *
   * Ausente quando a empresa não informou o custo. Nesse caso os Indicadores
   * **avisam**, em vez de substituir pelo líquido em silêncio.
   */
  custo_empresa_centavos?: number;
  definido_por?: string;
}

export interface Fechamento {
  id: string;
  ciclo: 'semanal' | 'quinzenal' | 'mensal';
  pessoa_id: string;
  periodo_inicio: string;
  periodo_fim: string;
  estado: 'aberto' | 'fechado';
  total_centavos: number;
  fechado_por?: string;
}

export interface Lancamento {
  id: string;
  pessoa_id: string;
  tipo: 'adiantamento' | 'emprestimo' | 'estorno';
  valor_centavos: number;
  parcelas: number;
  parcelas_pagas: number;
  data: string;

  // ── Só em lançamentos de tipo `estorno` ──
  /**
   * Qual lançamento este estorno anula. O original **nunca é alterado nem
   * apagado** (`INV-08`): o estorno é um registro novo que aponta para ele.
   */
  estorna_lancamento_id?: string;
  /** Obrigatório no estorno. Correção sem motivo registrado não é auditável. */
  motivo?: string;
  /** Quem mandou estornar. */
  autor_id?: string;
}

// Parcela de um Lançamento. A pessoa vem do lançamento de origem; o ciclo em
// que a parcela cai é identificado pela data de FIM do período, e não por um
// id de Fechamento, porque parcela futura cai em ciclo que ainda não tem
// registro de Fechamento.
export interface Parcela {
  id: string;
  lancamento_id: string;
  numero: number;
  valor_centavos: number;
  /**
   * `estornada` é estado terminal: a parcela estava pendente quando o
   * lançamento de origem foi estornado, e deixa de ser cobrada.
   *
   * Marcar assim **não** é o `UPDATE` destrutivo que o `INV-08` proíbe. O
   * número e o valor continuam intactos e a linha continua no extrato — é uma
   * transição de estado, do mesmo tipo que `pendente → paga`. Apagar a linha
   * é que seria destrutivo.
   */
  situacao: 'paga' | 'pendente' | 'estornada';
  ciclo_periodo_fim: string;
}

// Título e descrição são CONGELADOS no momento do evento, como o valor de um
// registro financeiro. Uma notificação é o registro de um fato passado: se o
// texto fosse derivado na leitura, mudaria quando o dado de origem mudasse, e
// a notificação passaria a descrever algo que não aconteceu.
export interface Notificacao {
  id: string;
  tipo:
    | 'divergencia'
    | 'rateio_pendente'
    | 'ausencia_sem_decisao'
    | 'diario_pendente'
    | 'diario_finalizado'
    | 'fechamento_proximo'
    | 'planejamento_rascunho';
  origem_tipo: 'diario' | 'diaria' | 'planejamento' | 'fechamento' | 'obra';
  origem_id: string;
  titulo: string;
  descricao: string;
  data: string;

  /**
   * Quem deve ver esta notificação. Resposta [SÓ PROTÓTIPO] à `Q-027`, que
   * pergunta "quem recebe qual notificação".
   *
   * Por PERFIL, e não por Usuário. No sistema real o destinatário é o Usuário,
   * porque é ele que tem credencial — mas a maquete tem um Usuário por perfil,
   * e modelar por Usuário aqui só acrescentaria uma indireção sem mudar nada
   * do que se vê. Ver `docs/DECISOES.md`.
   *
   * O Cliente nunca entra nesta lista: notificação interna é operação da
   * TECTO, e a `RN-136` mantém o Cliente fora disso.
   */
  destinatario_perfis: TipoPerfil[];

  /**
   * Quem já leu. É lista, e não um booleano, por um motivo concreto: com um
   * `lida` só, o Pedro abrir o painel zeraria o contador do Rafael, que nunca
   * viu a notificação.
   */
  lida_por: TipoPerfil[];
}

export interface Especialidade {
  id: string;
  nome: string;
}

// Catálogo em um nível de profundidade: os tipos de topo não têm `pai_id`;
// os tipos de nota apontam para o tipo "Nota fiscal".
export interface TipoDocumento {
  id: string;
  nome: string;
  pai_id?: string;
}

/**
 * As três modalidades da `RN-131`. A modalidade pertence ao registro do custo,
 * nunca ao cadastro do prestador (`RN-133`): o mesmo eletricista pode ser
 * repassado com margem numa obra e direto do cliente noutra.
 */
export type ModalidadeFinanceira =
  | 'repassado_com_margem'
  | 'reembolsavel'
  | 'direto_do_cliente';

/**
 * Custo ou serviço contratado a terceiros, por Obra.
 *
 * Dois campos de dinheiro, e a diferença entre eles é a margem da TECTO. A
 * `RN-136` proíbe o Cliente de ver `custo_centavos` e a margem — use
 * `custoVisivelAoCliente` para montar qualquer coisa que o Cliente enxergue.
 *
 * A `RN-130` diz que a TECTO não inclui material: todo material é do Cliente,
 * logo aparece como reembolsável ou direto do cliente, nunca com margem.
 */
export interface CustoObra {
  id: string;
  obra_id: string;
  fornecedor: string;
  descricao: string;
  modalidade: ModalidadeFinanceira;
  /** O que a TECTO cobra do Cliente. Visível a ele. */
  valor_cobrado_centavos: number;
  /** O que a TECTO paga. NUNCA visível ao Cliente (`RN-136`). */
  custo_centavos: number;
  data: string;
  /** Aponta para um tipo de nota em `tipos_documento`. */
  tipo_documento_id?: string;
  nota_numero?: string;
}

/**
 * Parcela de pagamento do CLIENTE à TECTO. Não confundir com `Parcela`, que é
 * parcela de adiantamento ou empréstimo de uma Pessoa — dinheiro no sentido
 * oposto.
 *
 * A `RN-135` dá ao Cliente o direito de ver quanto deve, quanto já pagou, as
 * parcelas futuras e os comprovantes.
 */
export interface Recebimento {
  id: string;
  obra_id: string;
  numero: number;
  vencimento: string;
  valor_centavos: number;
  situacao: 'paga' | 'vencendo' | 'futura';
  pago_em?: string;
  comprovante_url?: string;
}

/**
 * Serviço executado por terceiro na Obra — marcenaria, marmoraria, vidro,
 * ar-condicionado e afins. É a matéria-prima do Andamento Geral.
 *
 * `especialidade_id` é o que a `RN-125b` chama de "atributo do serviço de
 * terceiro": é daqui que sai o eixo Especialidade do Andamento, sem tabela
 * nova espelhando o Checklist.
 *
 * **Duplicidade conhecida:** o mesmo eletricista pode aparecer aqui e em
 * `custos_obra`. A decisão `D2` unifica as duas entidades, e está no degrau 8
 * por risco — até lá as duas coexistem de propósito.
 */
export interface ServicoTerceiro {
  id: string;
  obra_id: string;
  descricao: string;
  fornecedor: string;
  /**
   * Ausente quando o serviço não pertence a um ambiente só — ar-condicionado
   * em três cômodos, forro da obra inteira. A agregação do Andamento trata
   * isso como o pseudo-ambiente "Obra inteira" da decisão `[SÓ PROTÓTIPO]`.
   *
   * É pseudo de verdade: **não** existe linha correspondente em `ambientes`.
   * Criar uma faria o Checklist e o Andamento TECTO exibirem um ambiente vazio.
   */
  ambiente_id?: string;
  especialidade_id: string;
  situacao: 'nao_iniciado' | 'em_andamento' | 'concluido';
}

/**
 * Categorias de despesa da empresa. A `Q-030` está **parcialmente respondida**:
 * estas três vieram do cliente, e faltam as demais. O tipo vai crescer.
 */
export type CategoriaDespesa =
  | 'ferramentas_e_maquinas'
  | 'uniforme'
  | 'marketing_e_trafego_pago';

/** `RN-140` — despesa geral da empresa, por lançamento manual, com categoria. */
export interface DespesaEmpresa {
  id: string;
  categoria: CategoriaDespesa;
  descricao: string;
  valor_centavos: number;
  data: string;
}

/**
 * Contrato de Terceirizado, por Obra. A `RN-004` define o regime como
 * "contrato com parcelas"; o prompt da tarefa fixa que o contrato é por Obra,
 * e não por Vínculo.
 */
export interface ContratoTerceirizado {
  id: string;
  pessoa_id: string;
  obra_id: string;
  escopo: string;
  valor_centavos: number;
  situacao: 'ativo' | 'concluido' | 'cancelado';
}

/**
 * Parcela de um contrato de terceirizado.
 *
 * **Deliberadamente sem `vencimento` e sem `etapa`.** A `Q-005` pergunta se as
 * parcelas são por data fixa ou por etapa concluída, e quem confirma a etapa —
 * e continua aberta. Qualquer um dos dois campos afirmaria a resposta.
 *
 * É a saída 2 do `docs/ABERTO.md` §1: construir a estrutura sem afirmar a
 * regra. Número, valor e situação bastam para exibir o contrato; o gatilho da
 * cobrança entra quando Pedro e Fernando decidirem.
 */
export interface ParcelaContrato {
  id: string;
  contrato_id: string;
  numero: number;
  valor_centavos: number;
  situacao: 'paga' | 'pendente';
}

/** Serviço adicional aprovado, que soma ao valor contratado da Obra. */
export interface AdicionalObra {
  id: string;
  obra_id: string;
  descricao: string;
  aprovado_em: string;
  valor_centavos: number;
}

// Mídia deixa de ser uma URL solta em `Diario.fotos` e passa a ter ambiente.
// A coleção é ADITIVA: `Diario.fotos` continua existindo e continua sendo o
// que as telas atuais leem.
export interface Midia {
  id: string;
  obra_id: string;
  diario_id?: string;
  ambiente_id: string;
  url: string;
  tipo: 'foto' | 'video';
  data: string;
}

/**
 * Documento da obra — projeto e contrato.
 *
 * **Nota fiscal não entra aqui.** Ela já vive em `custos_obra`, pelo campo
 * `tipo_documento_id`, porque a nota é sempre a nota DE alguma coisa: separá-la
 * do custo criaria duas verdades sobre o mesmo papel. `Documento` é o que
 * existe por si — a planta, o memorial, o contrato assinado.
 *
 * `especialidade_id` é o que a T6 filtra: "projetos e contratos por
 * especialidade". Fica opcional porque nem todo documento pertence a uma —
 * uma planta baixa geral não é de marcenaria nem de elétrica.
 */
export interface Documento {
  id: string;
  obra_id: string;
  nome: string;
  tipo_documento_id: string;
  especialidade_id?: string;
  url: string;
  data: string;
  enviado_por?: string;
}

export type TipoPerfil = 'administracao' | 'financeiro' | 'gerente_obras' | 'cliente';

/**
 * A camada de credencial do `INV-01` — "Pessoa, Vínculo, Usuário e Papel são
 * quatro camadas distintas". O glossário define Usuário como "credencial de
 * acesso ao sistema, ligada a uma Pessoa. Nem toda Pessoa tem Usuário".
 *
 * Ela não existia: a sessão guardava só o perfil, e por isso o Portal não
 * tinha como saber QUEM estava logado — daí o nome do cliente escrito dentro
 * do `PortalLayout`.
 *
 * **Desvio consciente do `INV-01`, só no protótipo.** Para os três perfis
 * internos o Usuário aponta para uma `Pessoa`, como manda o invariante. Para o
 * Cliente ele aponta para a `Obra`, porque `Obra.cliente` é um nome em texto e
 * o Cliente ainda não é uma Pessoa no estado. Transformá-lo em Pessoa é a
 * modelagem correta e está registrada como pendência: ver `docs/DECISOES.md`.
 * O que impede fazer agora é que o Painel conta `pessoas.filter(ativo)` sob o
 * rótulo "com vínculo ativo", e acrescentar cinco clientes faria esse número
 * mentir numa tela que não é minha.
 */
export interface Usuario {
  id: string;
  perfil: TipoPerfil;
  nome_exibicao: string;
  email: string;
  /** Perfis internos. */
  pessoa_id?: string;
  /** Cliente: a Obra dele. Ver a nota acima. */
  obra_id?: string;
  ativo: boolean;
}

export interface ItemForaEscopo {
  id: string;
  obra_id: string;
  descricao: string;
  quantidade: number;
  unidade: string;
  criado_em: string;
  criado_por?: string;
  estado: 'rascunho' | 'aprovado';
}

export interface AppState {
  pessoas: Pessoa[];
  vinculos: Vinculo[];
  obras: Obra[];
  vinculos_obra: VinculoObra[];
  ambientes: Ambiente[];
  itens_orcamento: ItemOrcamento[];
  itens_fora_escopo: ItemForaEscopo[];
  planejamento: Planejamento[];
  semanas: Semana[];
  diarios: Diario[];
  presencas: Presenca[];
  diarias: Diaria[];
  fechamentos: Fechamento[];
  lancamentos: Lancamento[];
  parcelas: Parcela[];
  notificacoes: Notificacao[];
  especialidades: Especialidade[];
  tipos_documento: TipoDocumento[];
  midias: Midia[];
  custos_obra: CustoObra[];
  recebimentos: Recebimento[];
  adicionais_obra: AdicionalObra[];
  servicos_terceiros: ServicoTerceiro[];
  despesas_empresa: DespesaEmpresa[];
  contratos_terceirizado: ContratoTerceirizado[];
  parcelas_contrato: ParcelaContrato[];
  usuarios: Usuario[];
  documentos: Documento[];
}
