import type {
  AppState,
  Lancamento,
  Obra,
  Parcela,
  Pessoa,
  Planejamento,
  Semana,
  TipoVinculo,
  Vinculo,
  VinculoObra,
} from './types';
import { proximoFimDeCiclo, type TipoCiclo } from './fechamento';

/**
 * FUNÇÕES DE CRIAÇÃO.
 *
 * Funções puras: recebem o estado, devolvem os arrays novos, não alteram nada.
 * As mutações correspondentes vivem no store, e os formulários que as chamam
 * são da T10 — **nenhuma regra de validação pode ser reimplementada na tela**.
 * Se uma validação faltar aqui, ela falta em todo lugar.
 *
 * Toda função devolve **erro descritivo**. "Dados inválidos" não diz a ninguém
 * o que fazer a seguir.
 */

export interface Resultado<T> {
  ok: boolean;
  erro?: string;
  criado?: T;
  estado?: Partial<AppState>;
}

function erro<T>(mensagem: string): Resultado<T> {
  return { ok: false, erro: mensagem };
}

/** Só estas três periodicidades delimitam período de Fechamento. */
function ehPeriodico(ciclo: string | undefined): boolean {
  return ciclo === 'semanal' || ciclo === 'quinzenal' || ciclo === 'mensal';
}

/** Próximo id sequencial de uma coleção, no padrão `prefixo + número`. */
function proximoId(existentes: { id: string }[], prefixo: string): string {
  const numeros = existentes
    .map((e) => Number(e.id.replace(prefixo, '')))
    .filter((n) => Number.isFinite(n));
  const maior = numeros.length ? Math.max(...numeros) : 0;
  return `${prefixo}${String(maior + 1).padStart(2, '0')}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// PESSOA — `RN-001`, `RN-002`
// ═══════════════════════════════════════════════════════════════════════════

/** Iniciais a partir do nome, ignorando partículas. "Mariana Costa Lima" → MCL. */
export function iniciaisDoNome(nome: string): string {
  const particulas = new Set(['de', 'da', 'do', 'dos', 'das', 'e']);
  return nome
    .trim()
    .split(/\s+/)
    .filter((parte) => parte && !particulas.has(parte.toLowerCase()))
    .map((parte) => parte[0].toUpperCase())
    .join('')
    .slice(0, 3);
}

/** Só os dígitos, para comparar CPF sem depender de pontuação. */
function digitos(valor: string): string {
  return valor.replace(/\D/g, '');
}

export interface NovaPessoa {
  nome: string;
  cpf: string;
  funcao: string;
  rg?: string;
  endereco?: string;
  nascimento?: string;
  telefone?: string;
  foto_url?: string;
  documentos_urls?: string[];
}

/**
 * Cria uma Pessoa. **Não cria Vínculo** — são camadas distintas (`INV-01`), e
 * é essa separação que permite um terceirizado virar funcionário próprio sem
 * cadastro duplicado.
 */
export function criarPessoa(state: AppState, dados: NovaPessoa): Resultado<Pessoa> {
  if (!dados.nome?.trim()) return erro('A pessoa precisa de um nome.');
  if (!dados.funcao?.trim()) {
    return erro('A pessoa precisa de uma função. É o que o Cliente vê no Portal (RN-135).');
  }

  const cpf = digitos(dados.cpf ?? '');
  if (!cpf) return erro('O CPF é obrigatório.');
  if (cpf.length !== 11) return erro(`O CPF precisa ter 11 dígitos, e este tem ${cpf.length}.`);

  // RN-002 — CPF é único no sistema. Inclui pessoa desativada: ela continua
  // existindo, e recadastrá-la criaria a duplicidade que o INV-01 evita.
  const jaExiste = state.pessoas.find((p) => p.cpf && digitos(p.cpf) === cpf);
  if (jaExiste) {
    return erro(
      `Este CPF já é de ${jaExiste.nome}` +
        (jaExiste.ativo ? '.' : ', que está desativada. Reative em vez de cadastrar de novo.')
    );
  }

  const pessoa: Pessoa = {
    id: proximoId(state.pessoas, 'p'),
    nome: dados.nome.trim(),
    iniciais: iniciaisDoNome(dados.nome),
    funcao: dados.funcao.trim(),
    ativo: true,
    cpf,
    rg: dados.rg,
    endereco: dados.endereco,
    nascimento: dados.nascimento,
    telefone: dados.telefone,
    foto_url: dados.foto_url,
    documentos_urls: dados.documentos_urls,
  };

  return { ok: true, criado: pessoa, estado: { pessoas: [...state.pessoas, pessoa] } };
}

// ═══════════════════════════════════════════════════════════════════════════
// VÍNCULO — `RN-003`, `RN-004`
// ═══════════════════════════════════════════════════════════════════════════

export interface NovoVinculo {
  pessoa_id: string;
  tipo: TipoVinculo;
  inicio: string;
  ciclo_pagamento?: 'diario' | 'semanal' | 'quinzenal' | 'mensal' | 'por_obra';
  valor_diaria_centavos?: number;
  valor_obra_centavos?: number;
  custo_empresa_diaria_centavos?: number;
}

/**
 * Cria um Vínculo. A `RN-003` permite vários ao longo do tempo, mas **apenas
 * um ativo por vez** — encerre o anterior antes.
 *
 * A exigência de valores segue a tabela da `RN-004`: funcionário próprio
 * trabalha por diária e precisa de ciclo e valor; Administração e Financeiro
 * estão fora do escopo de pagamento na V1 e não têm nem um nem outro.
 */
export function criarVinculo(state: AppState, dados: NovoVinculo): Resultado<Vinculo> {
  const pessoa = state.pessoas.find((p) => p.id === dados.pessoa_id);
  if (!pessoa) return erro('Pessoa não encontrada.');
  if (!pessoa.ativo) return erro(`${pessoa.nome} está desativada e não pode receber vínculo novo.`);
  if (!dados.inicio) return erro('O vínculo precisa de uma data de início.');

  const ativo = state.vinculos.find((v) => v.pessoa_id === dados.pessoa_id && !v.fim);
  if (ativo) {
    return erro(
      `${pessoa.nome} já tem vínculo ativo desde ${ativo.inicio}. ` +
        'A RN-003 permite apenas um por vez — encerre o atual antes de criar outro.'
    );
  }

  if (dados.tipo === 'funcionario_proprio') {
    if (!dados.ciclo_pagamento) {
      return erro('Funcionário próprio precisa de ciclo de pagamento: semanal, quinzenal ou mensal.');
    }
    if (dados.ciclo_pagamento === 'por_obra') {
      return erro('Funcionário próprio trabalha por diária, não por obra (RN-004).');
    }
    if (!dados.valor_diaria_centavos || dados.valor_diaria_centavos <= 0) {
      return erro('Funcionário próprio precisa do valor da diária.');
    }
  }

  if (
    (dados.tipo === 'administracao' || dados.tipo === 'financeiro') &&
    (dados.valor_diaria_centavos || dados.valor_obra_centavos)
  ) {
    return erro(
      'Administração e Financeiro estão fora do escopo de pagamento do sistema na V1 (RN-004). ' +
        'O vínculo existe; a remuneração não é registrada aqui.'
    );
  }

  const vinculo: Vinculo = {
    id: proximoId(state.vinculos, 'v'),
    pessoa_id: dados.pessoa_id,
    tipo: dados.tipo,
    ciclo_pagamento: dados.ciclo_pagamento,
    valor_diaria_centavos: dados.valor_diaria_centavos,
    valor_obra_centavos: dados.valor_obra_centavos,
    custo_empresa_diaria_centavos: dados.custo_empresa_diaria_centavos,
    inicio: dados.inicio,
  };

  return { ok: true, criado: vinculo, estado: { vinculos: [...state.vinculos, vinculo] } };
}

/** Encerra um vínculo. Nunca apaga — `INV-08`. */
export function encerrarVinculo(state: AppState, vinculo_id: string, fim: string): Resultado<Vinculo> {
  const vinculo = state.vinculos.find((v) => v.id === vinculo_id);
  if (!vinculo) return erro('Vínculo não encontrado.');
  if (vinculo.fim) return erro(`Este vínculo já foi encerrado em ${vinculo.fim}.`);
  if (fim < vinculo.inicio) return erro('A data de fim não pode ser anterior à de início.');

  const encerrado = { ...vinculo, fim };
  return {
    ok: true,
    criado: encerrado,
    estado: { vinculos: state.vinculos.map((v) => (v.id === vinculo_id ? encerrado : v)) },
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// OBRA — `RN-030` a `RN-043`
// ═══════════════════════════════════════════════════════════════════════════

export interface NovaObra {
  cliente: string;
  endereco: string;
  tipo: 'obra' | 'pequeno_servico';
  inicio: string;
  previsao_termino: string;
  valor_contratado_centavos: number;
}

/**
 * O código visível da Obra, pela `RN-038`: sigla do cliente mais sequencial.
 * "Obra 33 - JPS". Pequeno Serviço usa o prefixo "Serviço", e a sequência é
 * própria — os dois tipos não compartilham numeração, como o seed já mostra
 * ("Obra 31" e "Serviço 04" convivem).
 */
export function codigoDaObra(state: AppState, cliente: string, tipo: 'obra' | 'pequeno_servico'): string {
  const prefixo = tipo === 'obra' ? 'Obra' : 'Serviço';
  const numeros = state.obras
    .filter((o) => o.codigo.startsWith(prefixo))
    .map((o) => Number(o.codigo.replace(prefixo, '').split('-')[0].trim()))
    .filter((n) => Number.isFinite(n));
  const proximo = (numeros.length ? Math.max(...numeros) : 0) + 1;
  return `${prefixo} ${String(proximo).padStart(2, '0')} - ${iniciaisDoNome(cliente)}`;
}

/**
 * Cria uma Obra ou Pequeno Serviço.
 *
 * `RN-031` — exatamente um Cliente e exatamente um endereço.
 * `RN-033` — não depende de Orçamento aprovado para existir.
 * `RN-039` — nasce em `Aguardando início`.
 * `RN-043` e `INV-02` — Pequeno Serviço é o MESMO registro, com tipo
 * diferente. O Diário é desabilitado por tipo, e é por isso que
 * `obraTemDiario` existe: a regra vive aqui, não espalhada nas telas.
 */
export function criarObra(state: AppState, dados: NovaObra): Resultado<Obra> {
  if (!dados.cliente?.trim()) return erro('A obra precisa de exatamente um cliente (RN-031).');
  if (!dados.endereco?.trim()) return erro('A obra precisa de exatamente um endereço (RN-031).');
  if (!dados.inicio) return erro('A obra precisa de uma data de início.');
  if (!dados.previsao_termino) return erro('A obra precisa de uma previsão de término.');
  if (dados.previsao_termino < dados.inicio) {
    return erro('A previsão de término não pode ser anterior ao início.');
  }
  if (!dados.valor_contratado_centavos || dados.valor_contratado_centavos <= 0) {
    return erro('A obra precisa de um valor contratado.');
  }
  if (!Number.isInteger(dados.valor_contratado_centavos)) {
    return erro('Valor em centavos inteiros, sem fração (INV-10).');
  }

  const obra: Obra = {
    id: proximoId(state.obras, 'o'),
    codigo: codigoDaObra(state, dados.cliente, dados.tipo),
    tipo: dados.tipo,
    cliente: dados.cliente.trim(),
    endereco: dados.endereco.trim(),
    estado: 'aguardando_inicio',
    inicio: dados.inicio,
    previsao_termino: dados.previsao_termino,
    valor_contratado_centavos: dados.valor_contratado_centavos,
    adicionais_centavos: 0,
    recebido_centavos: 0,
    andamento_geral_pct: 0,
  };

  return { ok: true, criado: obra, estado: { obras: [...state.obras, obra] } };
}

/**
 * `INV-02` — "o Diário é desabilitado por tipo". A `RN-043` lista o que o
 * Pequeno Serviço possui, e o Diário não está lá.
 *
 * A regra mora aqui, num lugar só, para que nenhuma tela precise saber disso
 * por conta própria.
 */
export function obraTemDiario(obra: Obra): boolean {
  return obra.tipo === 'obra';
}

// ═══════════════════════════════════════════════════════════════════════════
// VÍNCULO DE OBRA — `RN-034`, `RN-035`, `RN-036`
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Vincula um Gerente ou Assistente a uma Obra.
 *
 * `RN-034` — uma Obra pode ter vários Gerentes e vários Assistentes ao mesmo
 * tempo, então não há checagem de exclusividade.
 * `RN-036` — o vínculo tem início e fim, e **nunca é excluído**. Por isso não
 * existe `desvincularGerente` que apague: existe `encerrarVinculoDeObra`.
 */
export function vincularGerente(
  state: AppState,
  dados: { obra_id: string; pessoa_id: string; papel: 'gerente' | 'assistente'; inicio: string }
): Resultado<VinculoObra> {
  const obra = state.obras.find((o) => o.id === dados.obra_id);
  if (!obra) return erro('Obra não encontrada.');

  const pessoa = state.pessoas.find((p) => p.id === dados.pessoa_id);
  if (!pessoa) return erro('Pessoa não encontrada.');
  if (!pessoa.ativo) return erro(`${pessoa.nome} está desativada.`);
  if (!dados.inicio) return erro('O vínculo de obra precisa de uma data de início (RN-036).');

  const vinculoPessoa = state.vinculos.find((v) => v.pessoa_id === dados.pessoa_id && !v.fim);
  const esperado: TipoVinculo = dados.papel === 'gerente' ? 'gerente_obras' : 'assistente_gerenciamento';
  if (!vinculoPessoa) {
    return erro(`${pessoa.nome} não tem vínculo ativo. Crie o vínculo antes de vincular à obra.`);
  }
  if (vinculoPessoa.tipo !== esperado) {
    return erro(
      `${pessoa.nome} tem vínculo de ${vinculoPessoa.tipo}, e o papel pedido é ${dados.papel}. ` +
        'O tipo de vínculo e o papel na obra precisam corresponder (RN-004).'
    );
  }

  const jaVinculado = state.vinculos_obra.find(
    (v) => v.obra_id === dados.obra_id && v.pessoa_id === dados.pessoa_id && !v.fim
  );
  if (jaVinculado) {
    return erro(`${pessoa.nome} já está vinculada a ${obra.codigo} desde ${jaVinculado.inicio}.`);
  }

  const vinculo: VinculoObra = {
    id: proximoId(state.vinculos_obra, 'vo'),
    obra_id: dados.obra_id,
    pessoa_id: dados.pessoa_id,
    papel: dados.papel,
    inicio: dados.inicio,
  };

  return {
    ok: true,
    criado: vinculo,
    estado: { vinculos_obra: [...state.vinculos_obra, vinculo] },
  };
}

/** Encerra o vínculo com a obra. `RN-036`: nunca é excluído, só encerrado. */
export function encerrarVinculoDeObra(
  state: AppState,
  vinculo_obra_id: string,
  fim: string
): Resultado<VinculoObra> {
  const vinculo = state.vinculos_obra.find((v) => v.id === vinculo_obra_id);
  if (!vinculo) return erro('Vínculo de obra não encontrado.');
  if (vinculo.fim) return erro(`Este vínculo já foi encerrado em ${vinculo.fim}.`);
  if (fim < vinculo.inicio) return erro('A data de fim não pode ser anterior à de início.');

  const encerrado = { ...vinculo, fim };
  return {
    ok: true,
    criado: encerrado,
    estado: { vinculos_obra: state.vinculos_obra.map((v) => (v.id === vinculo_obra_id ? encerrado : v)) },
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// PLANEJAMENTO — `RN-050` a `RN-058`
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Quem entra na grade da semana.
 *
 * A `RN-052` diz "toda Pessoa com Vínculo ativo". Aplicada ao pé da letra, ela
 * colocaria Pedro e Fernanda na escala — e eles não vão a obra. É a lacuna 2
 * do `docs/ABERTO.md` §7, que a `RN-004` agora permite resolver pelo TIPO em
 * vez de por uma lista de ids escrita à mão: Administração e Financeiro ficam
 * de fora, o resto entra.
 *
 * **Terceirizado continua entrando**, como já entra hoje no seed. Se ele
 * deveria entrar é a `Q-006`, em aberto — e tirá-lo agora seria responder a
 * pergunta em vez de preservar o que existe.
 */
export function pessoasDaSemana(state: AppState): string[] {
  const foraDeCampo: TipoVinculo[] = ['administracao', 'financeiro'];
  return state.vinculos
    .filter((v) => !v.fim && !foraDeCampo.includes(v.tipo))
    .map((v) => v.pessoa_id)
    .filter((pid) => state.pessoas.find((p) => p.id === pid)?.ativo);
}

/**
 * Cria a semana de Planejamento.
 *
 * `RN-051` — nasce em `Rascunho`.
 * `RN-052` — toda pessoa de campo com vínculo ativo entra na grade.
 * `RN-055` — quem não tem destino definido fica `Em aberto`, e pode ser
 * alocado depois, no meio da semana ou pelo Gerente durante o Diário.
 */
export function criarSemanaPlanejamento(
  state: AppState,
  semana_inicio: string
): Resultado<Semana> {
  if (!semana_inicio) return erro('A semana precisa de uma data de início.');

  const data = new Date(`${semana_inicio}T00:00:00Z`);
  if (Number.isNaN(data.getTime())) return erro('Data de início inválida.');
  if (data.getUTCDay() !== 1) {
    return erro('A semana de planejamento começa na segunda-feira.');
  }
  if (state.semanas.some((s) => s.inicio === semana_inicio)) {
    return erro(`Já existe uma semana de planejamento começando em ${semana_inicio}.`);
  }

  const pessoas = pessoasDaSemana(state);
  if (!pessoas.length) {
    return erro('Não há ninguém com vínculo ativo para montar a grade.');
  }

  const dias: string[] = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(data);
    d.setUTCDate(d.getUTCDate() + i);
    dias.push(d.toISOString().slice(0, 10));
  }

  const semana: Semana = { inicio: semana_inicio, estado: 'rascunho' };

  // Toda pessoa em todo dia, "Em aberto" até alguém decidir o destino.
  const celulas: Planejamento[] = pessoas.flatMap((pessoa_id) =>
    dias.map((dataDoDia) => ({
      id: `pl_${semana_inicio}_${pessoa_id}_${dataDoDia}`,
      semana_inicio,
      pessoa_id,
      data: dataDoDia,
      em_aberto: true,
      recebe: false,
      adicional_centavos: 0,
      estado: 'rascunho' as const,
    }))
  );

  return {
    ok: true,
    criado: semana,
    estado: {
      semanas: [...state.semanas, semana],
      planejamento: [...state.planejamento, ...celulas],
    },
  };
}

/**
 * Publica a semana. `RN-051`: `Rascunho` → `Publicado`.
 *
 * Não exige que todas as células tenham destino: a `RN-055` prevê justamente
 * que alguém fique `Em aberto` quando a reunião não decidiu. Publicar com
 * pendência é legítimo; o que não pode é publicar duas vezes.
 */
export function publicarPlanejamento(state: AppState, semana_inicio: string): Resultado<Semana> {
  const semana = state.semanas.find((s) => s.inicio === semana_inicio);
  if (!semana) return erro('Semana de planejamento não encontrada.');
  if (semana.estado === 'publicado') return erro('Esta semana já foi publicada.');

  const publicada: Semana = { ...semana, estado: 'publicado' };
  return {
    ok: true,
    criado: publicada,
    estado: {
      semanas: state.semanas.map((s) => (s.inicio === semana_inicio ? publicada : s)),
      planejamento: state.planejamento.map((p) =>
        p.semana_inicio === semana_inicio ? { ...p, estado: 'publicado' as const } : p
      ),
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// LANÇAMENTO — `RN-092`, `RN-093`, `RN-094`
// ═══════════════════════════════════════════════════════════════════════════

export interface NovoLancamento {
  pessoa_id: string;
  valor_centavos: number;
  parcelas: number;
  data: string;
  /** Fim do ciclo em que a primeira parcela cai. */
  primeiro_ciclo_fim: string;
}

/**
 * Cria adiantamento ou empréstimo.
 *
 * **Uma função só, porque são a mesma entidade.** A `RN-094` diz que
 * adiantamento e empréstimo se diferenciam pelo NÚMERO DE PARCELAS: uma
 * parcela é adiantamento, mais de uma é empréstimo. O tipo é derivado, não
 * escolhido — oferecer os dois numa lista deixaria criar um "adiantamento em
 * quatro parcelas", que não existe.
 *
 * **Sem limite de valor.** A `Q-007` pergunta se existe um, e continua aberta.
 * Inventar um teto aqui seria responder por conta própria.
 *
 * O valor é dividido em parcelas iguais; o resto vai na primeira, para a soma
 * fechar exatamente com o total. Centavo perdido em arredondamento é dinheiro
 * que não existe em lugar nenhum.
 */
export function criarLancamento(
  state: AppState,
  dados: NovoLancamento
): Resultado<{ lancamento: Lancamento; parcelas: Parcela[] }> {
  const pessoa = state.pessoas.find((p) => p.id === dados.pessoa_id);
  if (!pessoa) return erro('Pessoa não encontrada.');

  const vinculo = state.vinculos.find((v) => v.pessoa_id === dados.pessoa_id && !v.fim);
  if (!vinculo) {
    return erro(`${pessoa.nome} não tem vínculo ativo. Não há ciclo de pagamento para descontar.`);
  }

  if (!Number.isInteger(dados.valor_centavos) || dados.valor_centavos <= 0) {
    return erro('O valor precisa ser um número inteiro de centavos, maior que zero (INV-10).');
  }
  if (!Number.isInteger(dados.parcelas) || dados.parcelas < 1) {
    return erro('O número de parcelas precisa ser 1 ou mais.');
  }
  if (dados.parcelas > dados.valor_centavos) {
    return erro('Mais parcelas do que centavos: haveria parcela de valor zero.');
  }
  if (!dados.primeiro_ciclo_fim) {
    return erro('Informe em qual ciclo a primeira parcela cai.');
  }

  // RN-094 — o tipo é consequência do número de parcelas, não uma escolha.
  const tipo = dados.parcelas === 1 ? 'adiantamento' : 'emprestimo';

  const lancamento: Lancamento = {
    id: proximoId(state.lancamentos, 'la'),
    pessoa_id: dados.pessoa_id,
    tipo,
    valor_centavos: dados.valor_centavos,
    parcelas: dados.parcelas,
    parcelas_pagas: 0,
    data: dados.data,
  };

  // Cada parcela cai num ciclo, e os ciclos seguintes são projetados pela
  // periodicidade do vínculo. Sem isso a parcela 2 ficaria sem destino — e
  // parcela sem ciclo é dívida que nunca é cobrada.
  const periodicidade = vinculo.ciclo_pagamento;
  if (dados.parcelas > 1 && !ehPeriodico(periodicidade)) {
    return erro(
      `O vínculo de ${pessoa.nome} não tem periodicidade de ciclo (${periodicidade ?? 'nenhuma'}). ` +
        'Parcelamento exige ciclo semanal, quinzenal ou mensal.'
    );
  }

  const base = Math.floor(dados.valor_centavos / dados.parcelas);
  const resto = dados.valor_centavos - base * dados.parcelas;

  let cicloDaParcela = dados.primeiro_ciclo_fim;
  const parcelas: Parcela[] = [];
  for (let i = 0; i < dados.parcelas; i++) {
    if (i > 0) {
      cicloDaParcela = proximoFimDeCiclo(periodicidade as TipoCiclo, cicloDaParcela);
    }
    parcelas.push({
      id: `pa_${lancamento.id}_${i + 1}`,
      lancamento_id: lancamento.id,
      numero: i + 1,
      // O resto da divisão vai na primeira parcela: a soma fecha com o total.
      valor_centavos: i === 0 ? base + resto : base,
      situacao: 'pendente' as const,
      ciclo_periodo_fim: cicloDaParcela,
    });
  }

  return {
    ok: true,
    criado: { lancamento, parcelas },
    estado: {
      lancamentos: [...state.lancamentos, lancamento],
      parcelas: [...state.parcelas, ...parcelas],
    },
  };
}
