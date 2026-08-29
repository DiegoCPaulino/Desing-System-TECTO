import type { AppState } from './types';
import DADOS from './dados-iniciais';
import {
  codigoDaObra,
  criarLancamento,
  criarObra,
  criarPessoa,
  criarSemanaPlanejamento,
  criarVinculo,
  encerrarVinculo,
  encerrarVinculoDeObra,
  iniciaisDoNome,
  obraTemDiario,
  pessoasDaSemana,
  publicarPlanejamento,
  vincularGerente,
} from './criacao';

/** Testes das funções de criação da T7. */

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

const CPF = '39053344705';

// ═══════════════════════════════════════════════════════════════════════════
// PESSOA — RN-001, RN-002, INV-01
// ═══════════════════════════════════════════════════════════════════════════

teste('INV-01: criarPessoa NÃO cria vínculo', () => {
  const e = estado();
  const r = criarPessoa(e, { nome: 'João Pedro Silva', cpf: CPF, funcao: 'Pedreiro' });
  verdadeiro(r.ok, `deveria passar — ${r.erro ?? ''}`);
  igual(r.estado!.vinculos, undefined, 'nenhum vínculo foi criado');
  igual(r.estado!.pessoas!.length, e.pessoas.length + 1, 'só a pessoa entrou');
});

teste('RN-002: CPF é único, e o erro diz de quem é', () => {
  let e = estado();
  const primeiro = criarPessoa(e, { nome: 'João Pedro Silva', cpf: CPF, funcao: 'Pedreiro' });
  e = { ...e, pessoas: primeiro.estado!.pessoas! };

  const segundo = criarPessoa(e, { nome: 'Outro Nome', cpf: CPF, funcao: 'Ajudante' });
  falso(segundo.ok, 'deveria recusar');
  verdadeiro(segundo.erro!.includes('João Pedro Silva'), `erro nomeia o dono: ${segundo.erro}`);
});

teste('RN-002: a unicidade ignora pontuação', () => {
  let e = estado();
  const r1 = criarPessoa(e, { nome: 'João Pedro Silva', cpf: '390.533.447-05', funcao: 'Pedreiro' });
  e = { ...e, pessoas: r1.estado!.pessoas! };
  const r2 = criarPessoa(e, { nome: 'Outro', cpf: '39053344705', funcao: 'Ajudante' });
  falso(r2.ok, 'mesmo CPF, pontuação diferente, mesma pessoa');
});

teste('CPF com número errado de dígitos é recusado, dizendo quantos tem', () => {
  const r = criarPessoa(estado(), { nome: 'João', cpf: '123', funcao: 'Pedreiro' });
  falso(r.ok, 'deveria recusar');
  verdadeiro(r.erro!.includes('3'), `o erro diz quantos dígitos vieram: ${r.erro}`);
});

teste('RN-135: a função é obrigatória, porque o Cliente a vê', () => {
  const r = criarPessoa(estado(), { nome: 'João', cpf: CPF, funcao: '' });
  falso(r.ok, 'deveria recusar');
  verdadeiro(r.erro!.includes('função'), `erro: ${r.erro}`);
});

teste('as iniciais saem do nome, ignorando partículas', () => {
  igual(iniciaisDoNome('Mariana Costa Lima'), 'MCL', 'três palavras');
  igual(iniciaisDoNome('Luciana S. Medeiros'), 'LSM', 'com abreviação');
  igual(iniciaisDoNome('João de Souza'), 'JS', '"de" não conta');
  igual(iniciaisDoNome('Ana Paula dos Santos Lima'), 'APS', 'no máximo três');
});

// ═══════════════════════════════════════════════════════════════════════════
// VÍNCULO — RN-003, RN-004
// ═══════════════════════════════════════════════════════════════════════════

teste('RN-003: apenas um vínculo ativo por vez', () => {
  const e = estado();
  // Marcos já tem vínculo ativo.
  const r = criarVinculo(e, {
    pessoa_id: 'p07',
    tipo: 'funcionario_proprio',
    ciclo_pagamento: 'semanal',
    valor_diaria_centavos: 25000,
    inicio: '2026-09-01',
  });
  falso(r.ok, 'deveria recusar');
  verdadeiro(r.erro!.includes('RN-003'), `o erro cita a regra: ${r.erro}`);
});

teste('RN-003: encerrado o anterior, o novo passa — e o antigo NÃO some', () => {
  let e = estado();
  const ativo = e.vinculos.find((v) => v.pessoa_id === 'p07' && !v.fim)!;
  const quantosAntes = e.vinculos.length;

  const fim = encerrarVinculo(e, ativo.id, '2026-08-31');
  verdadeiro(fim.ok, 'encerra');
  e = { ...e, vinculos: fim.estado!.vinculos! };
  igual(e.vinculos.length, quantosAntes, 'INV-08: o vínculo antigo continua lá');
  igual(e.vinculos.find((v) => v.id === ativo.id)!.fim, '2026-08-31', 'com data de fim');

  const novo = criarVinculo(e, {
    pessoa_id: 'p07',
    tipo: 'terceirizado',
    ciclo_pagamento: 'por_obra',
    inicio: '2026-09-01',
  });
  verdadeiro(novo.ok, `agora passa — ${novo.erro ?? ''}`);
  igual(novo.estado!.vinculos!.length, quantosAntes + 1, 'o histórico cresce, não é substituído');
});

teste('RN-004: funcionário próprio exige ciclo e valor de diária', () => {
  const e = estado();
  const semCiclo = criarVinculo(e, { pessoa_id: 'p10', tipo: 'funcionario_proprio', inicio: '2026-09-01' });
  falso(semCiclo.ok, 'sem ciclo é recusado');

  const porObra = criarVinculo(e, {
    pessoa_id: 'p10',
    tipo: 'funcionario_proprio',
    ciclo_pagamento: 'por_obra',
    valor_diaria_centavos: 20000,
    inicio: '2026-09-01',
  });
  falso(porObra.ok, 'funcionário próprio não trabalha por obra');
});

teste('RN-004: Administração e Financeiro não têm remuneração no sistema', () => {
  const e = estado();
  // p10 está desativado; uso alguém sem vínculo ativo criando um antes.
  const nova = criarPessoa(e, { nome: 'Nova Admin', cpf: CPF, funcao: 'Sócia' });
  const comPessoa = { ...e, pessoas: nova.estado!.pessoas! };
  const id = nova.criado!.id;

  const r = criarVinculo(comPessoa, {
    pessoa_id: id,
    tipo: 'administracao',
    valor_diaria_centavos: 50000,
    inicio: '2026-09-01',
  });
  falso(r.ok, 'deveria recusar');
  verdadeiro(r.erro!.includes('V1'), `erro cita o escopo: ${r.erro}`);
});

teste('pessoa desativada não recebe vínculo novo', () => {
  const r = criarVinculo(estado(), {
    pessoa_id: 'p10',
    tipo: 'funcionario_proprio',
    ciclo_pagamento: 'semanal',
    valor_diaria_centavos: 20000,
    inicio: '2026-09-01',
  });
  falso(r.ok, 'Wagner Lopes está desativado');
});

// ═══════════════════════════════════════════════════════════════════════════
// OBRA — RN-031, RN-033, RN-038, RN-039, RN-043, INV-02, INV-10
// ═══════════════════════════════════════════════════════════════════════════

const OBRA_OK = {
  cliente: 'João Pedro Silva',
  endereco: 'R. Teste, 100 — São Paulo',
  tipo: 'obra' as const,
  inicio: '2026-09-01',
  previsao_termino: '2027-02-28',
  valor_contratado_centavos: 12000000,
};

teste('RN-038: o código vem das iniciais do cliente mais sequencial', () => {
  const e = estado();
  igual(codigoDaObra(e, 'João Pedro Silva', 'obra'), 'Obra 32 - JPS', 'próxima obra');
  igual(codigoDaObra(e, 'João Pedro Silva', 'pequeno_servico'), 'Serviço 05 - JPS', 'próximo serviço');
});

teste('as duas numerações são independentes', () => {
  // O seed já tem "Obra 31" e "Serviço 04" convivendo.
  const e = estado();
  const obra = criarObra(e, OBRA_OK);
  const comObra = { ...e, obras: obra.estado!.obras! };
  const servico = criarObra(comObra, { ...OBRA_OK, tipo: 'pequeno_servico' });
  igual(servico.criado!.codigo, 'Serviço 05 - JPS', 'a obra nova não empurrou a sequência do serviço');
});

teste('RN-031: cliente e endereço são obrigatórios', () => {
  const e = estado();
  falso(criarObra(e, { ...OBRA_OK, cliente: '' }).ok, 'sem cliente');
  falso(criarObra(e, { ...OBRA_OK, endereco: '  ' }).ok, 'sem endereço');
});

teste('RN-039: a obra nasce em "aguardando início"', () => {
  const r = criarObra(estado(), OBRA_OK);
  igual(r.criado!.estado, 'aguardando_inicio', 'estado inicial');
  igual(r.criado!.andamento_geral_pct, 0, 'sem andamento');
  igual(r.criado!.recebido_centavos, 0, 'sem recebimento');
});

teste('RN-033: a obra existe sem orçamento aprovado', () => {
  const e = estado();
  const r = criarObra(e, OBRA_OK);
  verdadeiro(r.ok, 'criou');
  const itens = e.itens_orcamento.filter((i) => i.obra_id === r.criado!.id);
  igual(itens.length, 0, 'e não exigiu nenhum item de orçamento');
});

teste('INV-10: valor fracionado é recusado', () => {
  const r = criarObra(estado(), { ...OBRA_OK, valor_contratado_centavos: 1200.5 });
  falso(r.ok, 'deveria recusar');
  verdadeiro(r.erro!.includes('INV-10'), `erro cita o invariante: ${r.erro}`);
});

teste('previsão anterior ao início é recusada', () => {
  const r = criarObra(estado(), { ...OBRA_OK, previsao_termino: '2026-08-01' });
  falso(r.ok, 'deveria recusar');
});

teste('INV-02 e RN-043: pequeno serviço não tem Diário', () => {
  const e = estado();
  const obra = criarObra(e, OBRA_OK).criado!;
  const servico = criarObra(e, { ...OBRA_OK, tipo: 'pequeno_servico' }).criado!;
  verdadeiro(obraTemDiario(obra), 'obra tem diário');
  falso(obraTemDiario(servico), 'pequeno serviço não tem');
});

// ═══════════════════════════════════════════════════════════════════════════
// VÍNCULO DE OBRA — RN-034, RN-036
// ═══════════════════════════════════════════════════════════════════════════

teste('RN-034: uma obra pode ter mais de um gerente ao mesmo tempo', () => {
  let e = estado();
  // Sofia (p05) é gerente e ainda não está na Obra 22, que já tem o Rafael.
  const r = vincularGerente(e, {
    obra_id: 'o01',
    pessoa_id: 'p05',
    papel: 'gerente',
    inicio: '2026-09-01',
  });
  verdadeiro(r.ok, `deveria passar — ${r.erro ?? ''}`);
  e = { ...e, vinculos_obra: r.estado!.vinculos_obra! };
  const gerentes = e.vinculos_obra.filter((v) => v.obra_id === 'o01' && v.papel === 'gerente' && !v.fim);
  igual(gerentes.length, 2, 'dois gerentes simultâneos');
});

teste('o papel na obra precisa bater com o tipo de vínculo', () => {
  const r = vincularGerente(estado(), {
    obra_id: 'o02',
    pessoa_id: 'p07',
    papel: 'gerente',
    inicio: '2026-09-01',
  });
  falso(r.ok, 'Marcos é funcionário próprio, não gerente');
  verdadeiro(r.erro!.includes('RN-004'), `erro cita a regra: ${r.erro}`);
});

teste('vincular duas vezes à mesma obra é recusado', () => {
  const r = vincularGerente(estado(), {
    obra_id: 'o01',
    pessoa_id: 'p04',
    papel: 'gerente',
    inicio: '2026-09-01',
  });
  falso(r.ok, 'Rafael já está na Obra 22');
});

teste('RN-036: o vínculo de obra é encerrado, nunca excluído', () => {
  let e = estado();
  const antes = e.vinculos_obra.length;
  const r = encerrarVinculoDeObra(e, 'vo01', '2026-09-30');
  verdadeiro(r.ok, 'encerra');
  e = { ...e, vinculos_obra: r.estado!.vinculos_obra! };
  igual(e.vinculos_obra.length, antes, 'nada foi removido');
  igual(e.vinculos_obra.find((v) => v.id === 'vo01')!.fim, '2026-09-30', 'ganhou data de fim');
});

// ═══════════════════════════════════════════════════════════════════════════
// PLANEJAMENTO — RN-051, RN-052, RN-055
// ═══════════════════════════════════════════════════════════════════════════

teste('RN-052: a grade exclui Administração e Financeiro, pelo TIPO', () => {
  const e = estado();
  const pessoas = pessoasDaSemana(e);
  falso(pessoas.includes('p01'), 'Pedro, Administração, fora');
  falso(pessoas.includes('p02'), 'Fernando, Administração, fora');
  falso(pessoas.includes('p03'), 'Fernanda, Financeiro, fora');
  verdadeiro(pessoas.includes('p04'), 'Rafael, Gerente, dentro');
  verdadeiro(pessoas.includes('p06'), 'Ana, Assistente, dentro');
  verdadeiro(pessoas.includes('p07'), 'Marcos, funcionário próprio, dentro');
});

teste('Q-006: terceirizado continua entrando, como já entra hoje', () => {
  // Tirá-lo seria responder a Q-006 em vez de preservar o que existe.
  verdadeiro(pessoasDaSemana(estado()).includes('p09'), 'Cleber Matos na grade');
});

teste('pessoa desativada não entra na grade', () => {
  falso(pessoasDaSemana(estado()).includes('p10'), 'Wagner Lopes fora');
});

teste('RN-051 e RN-055: a semana nasce em rascunho, com todos em aberto', () => {
  const e = estado();
  const r = criarSemanaPlanejamento(e, '2026-08-31');
  verdadeiro(r.ok, `deveria passar — ${r.erro ?? ''}`);
  igual(r.criado!.estado, 'rascunho', 'nasce rascunho');

  const novas = r.estado!.planejamento!.filter((p) => p.semana_inicio === '2026-08-31');
  const pessoas = pessoasDaSemana(e);
  igual(novas.length, pessoas.length * 6, 'toda pessoa em todos os seis dias');
  verdadeiro(novas.every((p) => p.em_aberto), 'todas em aberto');
  verdadeiro(novas.every((p) => p.estado === 'rascunho'), 'todas em rascunho');
});

teste('a semana começa na segunda-feira', () => {
  const r = criarSemanaPlanejamento(estado(), '2026-09-01');
  falso(r.ok, '01/09/2026 é terça');
  verdadeiro(r.erro!.includes('segunda'), `erro: ${r.erro}`);
});

teste('semana repetida é recusada', () => {
  const r = criarSemanaPlanejamento(estado(), '2026-08-24');
  falso(r.ok, 'a semana de 24/08 já existe');
});

teste('publicar leva a semana e as células de rascunho a publicado', () => {
  const e = estado();
  const r = publicarPlanejamento(e, '2026-08-24');
  verdadeiro(r.ok, `deveria passar — ${r.erro ?? ''}`);
  igual(r.criado!.estado, 'publicado', 'a semana');
  const daSemana = r.estado!.planejamento!.filter((p) => p.semana_inicio === '2026-08-24');
  verdadeiro(daSemana.every((p) => p.estado === 'publicado'), 'todas as células');
});

teste('publicar duas vezes é recusado', () => {
  const r = publicarPlanejamento(estado(), '2026-08-17');
  falso(r.ok, 'a semana corrente já está publicada');
});

teste('RN-055: publicar com gente em aberto é legítimo', () => {
  let e = estado();
  const criada = criarSemanaPlanejamento(e, '2026-08-31');
  e = { ...e, semanas: criada.estado!.semanas!, planejamento: criada.estado!.planejamento! };
  const r = publicarPlanejamento(e, '2026-08-31');
  verdadeiro(r.ok, 'publica mesmo com todos em aberto — a RN-055 prevê isso');
});

// ═══════════════════════════════════════════════════════════════════════════
// LANÇAMENTO — RN-092, RN-093, RN-094, Q-007
// ═══════════════════════════════════════════════════════════════════════════

teste('RN-094: uma parcela é adiantamento, mais de uma é empréstimo', () => {
  const e = estado();
  const uma = criarLancamento(e, {
    pessoa_id: 'p11', valor_centavos: 50000, parcelas: 1,
    data: '2026-08-20', primeiro_ciclo_fim: '2026-08-22',
  });
  igual(uma.criado!.lancamento.tipo, 'adiantamento', 'uma parcela');

  const varias = criarLancamento(e, {
    pessoa_id: 'p11', valor_centavos: 120000, parcelas: 4,
    data: '2026-08-20', primeiro_ciclo_fim: '2026-08-22',
  });
  igual(varias.criado!.lancamento.tipo, 'emprestimo', 'quatro parcelas');
});

teste('Q-007: não existe limite de valor', () => {
  // A pergunta continua aberta; impor um teto seria respondê-la.
  const r = criarLancamento(estado(), {
    pessoa_id: 'p11', valor_centavos: 500000000, parcelas: 1,
    data: '2026-08-20', primeiro_ciclo_fim: '2026-08-22',
  });
  verdadeiro(r.ok, 'R$5.000.000,00 passa — nenhum limite foi inventado');
});

teste('a soma das parcelas fecha exatamente com o total', () => {
  // 100 centavos em 3 parcelas: 34 + 33 + 33. Nada se perde no arredondamento.
  const r = criarLancamento(estado(), {
    pessoa_id: 'p11', valor_centavos: 100, parcelas: 3,
    data: '2026-08-20', primeiro_ciclo_fim: '2026-08-22',
  });
  const soma = r.criado!.parcelas.reduce((s, p) => s + p.valor_centavos, 0);
  igual(soma, 100, 'a soma fecha');
  igual(r.criado!.parcelas[0].valor_centavos, 34, 'o resto vai na primeira');
});

teste('cada parcela cai num ciclo, projetado pela periodicidade', () => {
  // Adilson é semanal: 22/08, 29/08, 05/09, 12/09.
  const r = criarLancamento(estado(), {
    pessoa_id: 'p11', valor_centavos: 120000, parcelas: 4,
    data: '2026-08-20', primeiro_ciclo_fim: '2026-08-22',
  });
  const ciclos = r.criado!.parcelas.map((p) => p.ciclo_periodo_fim);
  igual(ciclos.join(','), '2026-08-22,2026-08-29,2026-09-05,2026-09-12', 'quatro ciclos semanais');
  verdadeiro(ciclos.every((c) => !!c), 'nenhuma parcela sem ciclo');
});

teste('parcelar quem não tem ciclo periódico é recusado', () => {
  // Cleber é terceirizado por obra: não há período para projetar.
  const r = criarLancamento(estado(), {
    pessoa_id: 'p09', valor_centavos: 100000, parcelas: 3,
    data: '2026-08-20', primeiro_ciclo_fim: '2026-08-22',
  });
  falso(r.ok, 'deveria recusar');
  verdadeiro(r.erro!.includes('periodicidade'), `erro: ${r.erro}`);
});

teste('mais parcelas do que centavos é recusado', () => {
  const r = criarLancamento(estado(), {
    pessoa_id: 'p11', valor_centavos: 2, parcelas: 5,
    data: '2026-08-20', primeiro_ciclo_fim: '2026-08-22',
  });
  falso(r.ok, 'haveria parcela de valor zero');
});

teste('lançamento para quem não tem vínculo ativo é recusado', () => {
  const r = criarLancamento(estado(), {
    pessoa_id: 'p10', valor_centavos: 50000, parcelas: 1,
    data: '2026-08-20', primeiro_ciclo_fim: '2026-08-22',
  });
  falso(r.ok, 'Wagner não tem ciclo para descontar');
});

// ═══════════════════════════════════════════════════════════════════════════

export function rodarTestes(): { total: number; falhas: number; resultados: Resultado[] } {
  const falhas = resultados.filter((r) => !r.ok).length;
  return { total: resultados.length, falhas, resultados };
}
