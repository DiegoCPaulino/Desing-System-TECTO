import type { AppState } from './types';
import DADOS from './dados-iniciais';
import {
  calcularFechamentoDaPessoa,
  ciclosAbertos,
  definirObraQueArca,
  diarioEstaFechado,
  executarFechamento,
  motivoDeBloqueioDoDiario,
  pendenciasQueBloqueiam,
  podeExecutarFechamento,
  proximoFimDeCiclo,
} from './fechamento';

/**
 * Testes do módulo de Fechamento.
 *
 * Não há runner de teste neste repositório, e instalar um tocaria
 * `package.json`, que está fora dos arquivos permitidos desta tarefa. Então
 * este módulo é auto-contido: sem framework, sem dependência, executável
 * compilando `src/state/` e rodando `rodarTestes()` no Node.
 *
 * Cobre os três casos obrigatórios — saldo devedor maior que o ciclo, diária
 * em duas obras, e edição de diário de período fechado — mais as bordas que
 * apareceram ao escrever o cálculo.
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

/** Cópia rasa do seed, para cada teste partir do mesmo lugar. */
function estado(): AppState {
  return JSON.parse(JSON.stringify(DADOS)) as AppState;
}

const CICLO_SEMANAL = 'semanal_2026-08-17_2026-08-22';

// ═══════════════════════════════════════════════════════════════════════════

teste('ciclos abertos incluem semanal, quinzenal, mensal e por obra', () => {
  const ciclos = ciclosAbertos(estado());
  const tipos = ciclos.map((c) => c.tipo).sort();
  igual(tipos.join(','), 'mensal,por_obra,quinzenal,semanal', 'tipos de ciclo');

  const porObra = ciclos.find((c) => c.tipo === 'por_obra')!;
  igual(porObra.periodo_inicio, undefined, 'ciclo por obra não afirma período');
  igual(porObra.pessoas.length, 4, 'terceirizados no ciclo por obra');
});

teste('o ciclo é por pessoa, não global: o semanal tem 14 pessoas', () => {
  const semanal = ciclosAbertos(estado()).find((c) => c.id === CICLO_SEMANAL)!;
  igual(semanal.pessoas.length, 14, 'pessoas no ciclo semanal');
});

// ── CASO OBRIGATÓRIO 1 — saldo devedor maior que o ciclo ───────────────────

teste('OBRIGATÓRIO: saldo devedor maior que o ciclo paga zero e rola a diferença', () => {
  // Valdir Chagas (p18): diária de R$200,00 em 18/08 e 19/08 = R$400,00 bruto.
  // Adiantamento de R$1.200,00 caindo neste ciclo.
  const e = estado();
  const x = calcularFechamentoDaPessoa(e, 'p18', CICLO_SEMANAL);

  igual(x.bruto_centavos, 40000, 'bruto do Valdir');
  igual(x.descontos_centavos, 120000, 'descontos do Valdir');
  igual(x.a_pagar_centavos, 0, 'a pagar NUNCA negativo');
  igual(x.saldo_a_rolar_centavos, 80000, 'saldo que rola para o ciclo seguinte');

  // O extrato mostra de onde veio cada centavo, não só o total.
  igual(x.linhas.filter((l) => l.tipo === 'diaria').length, 2, 'linhas de diária');
  igual(x.linhas.filter((l) => l.tipo === 'adiantamento').length, 1, 'linha de adiantamento');
});

teste('OBRIGATÓRIO: o saldo devedor aparece mesmo no ciclo SEGUINTE', () => {
  // Resolve as pendências, fecha o ciclo, e confere que os R$800,00 restantes
  // viraram parcela pendente no ciclo seguinte, com o rastro do que foi pago.
  let e = estado();
  e = resolverPendencias(e);

  const r = executarFechamento(e, CICLO_SEMANAL, 'p01');
  verdadeiro(r.ok, `execução deveria passar — ${r.erro ?? ''}`);
  e = { ...e, fechamentos: r.fechamentos!, parcelas: r.parcelas! };

  const doValdir = e.parcelas.filter((p) => p.lancamento_id === 'la03');
  igual(doValdir.length, 2, 'a parcela foi partida em paga + restante');

  const paga = doValdir.find((p) => p.situacao === 'paga')!;
  const pendente = doValdir.find((p) => p.situacao === 'pendente')!;
  igual(paga.valor_centavos, 40000, 'amortizado neste ciclo');
  igual(pendente.valor_centavos, 80000, 'restante devido');
  igual(pendente.ciclo_periodo_fim, '2026-08-29', 'restante cai no ciclo seguinte');

  // A soma das duas continua sendo o adiantamento original: nada sumiu.
  igual(paga.valor_centavos + pendente.valor_centavos, 120000, 'total preservado');
});

teste('o Fechamento do Valdir fecha com total zero, não negativo', () => {
  let e = resolverPendencias(estado());
  const r = executarFechamento(e, CICLO_SEMANAL, 'p01');
  e = { ...e, fechamentos: r.fechamentos!, parcelas: r.parcelas! };
  const f = e.fechamentos.find((x) => x.pessoa_id === 'p18' && x.ciclo === 'semanal')!;
  igual(f.total_centavos, 0, 'total do Valdir');
  igual(f.estado, 'fechado', 'estado do fechamento');
  igual(f.fechado_por, 'p01', 'autor registrado');
});

// ── CASO OBRIGATÓRIO 2 — diária em duas obras ──────────────────────────────

teste('OBRIGATÓRIO: pessoa em duas obras no mesmo dia tem UMA diária, sem obra', () => {
  const e = estado();
  const presencas = e.presencas.filter((p) => p.pessoa_id === 'p19' && p.data === '2026-08-19');
  igual(presencas.length, 2, 'Israel tem 2 presenças em 19/08');
  igual(new Set(presencas.map((p) => p.obra_id)).size, 2, 'em obras diferentes');

  const diarias = e.diarias.filter((d) => d.pessoa_id === 'p19' && d.data === '2026-08-19');
  igual(diarias.length, 1, 'mas UMA única diária');
  igual(diarias[0].obra_que_arca_id, undefined, 'sem obra que arca — rateio pendente');
});

teste('OBRIGATÓRIO: o rateio indefinido BLOQUEIA o fechamento', () => {
  const e = estado();
  const bloqueios = pendenciasQueBloqueiam(e, CICLO_SEMANAL);
  const rateio = bloqueios.filter((b) => b.tipo === 'rateio_indefinido');
  verdadeiro(rateio.length > 0, 'deveria haver bloqueio de rateio');
  verdadeiro(
    rateio.some((b) => b.descricao.includes('Israel Fontes')),
    'o bloqueio nomeia Israel Fontes'
  );
  falso(podeExecutarFechamento(e, CICLO_SEMANAL), 'fechamento não pode ser executado');
});

teste('definirObraQueArca escolhe UMA obra; não existe rateio proporcional', () => {
  const e = estado();
  const r = definirObraQueArca(e, 'di_1908_rateio_p19', 'o01', 'p03');
  igual(r.erro, undefined, 'não deveria dar erro');

  const d = r.diarias.find((x) => x.id === 'di_1908_rateio_p19')!;
  igual(d.obra_que_arca_id, 'o01', 'obra escolhida');
  igual(d.valor_centavos, 20000, 'valor INTEIRO, não metade');
  igual(d.definido_por, 'p03', 'quem decidiu fica registrado');

  // A outra obra fica com custo zero: não há segunda diária para ela.
  const noDia = r.diarias.filter((x) => x.pessoa_id === 'p19' && x.data === '2026-08-19');
  igual(noDia.length, 1, 'continua sendo uma diária só');
});

teste('definirObraQueArca recusa obra onde a pessoa não esteve', () => {
  const e = estado();
  const r = definirObraQueArca(e, 'di_1908_rateio_p19', 'o04', 'p03');
  verdadeiro(!!r.erro, 'deveria recusar');
  verdadeiro(r.erro!.includes('presença'), `erro descritivo, não genérico: ${r.erro}`);
});

// ── CASO OBRIGATÓRIO 3 — editar diário de período fechado ──────────────────

teste('OBRIGATÓRIO: diário de período fechado fica travado', () => {
  let e = resolverPendencias(estado());
  falso(diarioEstaFechado(e, 'd01'), 'antes de fechar, o diário está livre');

  const r = executarFechamento(e, CICLO_SEMANAL, 'p01');
  verdadeiro(r.ok, `execução deveria passar — ${r.erro ?? ''}`);
  e = { ...e, fechamentos: r.fechamentos!, parcelas: r.parcelas! };

  // d01 é da Obra 22 em 19/08, dentro do período, com gente do ciclo semanal.
  verdadeiro(diarioEstaFechado(e, 'd01'), 'depois de fechar, o diário está travado');

  const motivo = motivoDeBloqueioDoDiario(e, 'd01');
  verdadeiro(!!motivo, 'há motivo de bloqueio');
  verdadeiro(motivo!.includes('Administração'), 'o motivo diz que nem a Administração altera');
});

teste('OBRIGATÓRIO: a trava vale inclusive para a Administração', () => {
  // Não existe parâmetro de perfil em nenhuma função de imutabilidade deste
  // módulo. Este teste guarda essa ausência: se alguém acrescentar uma
  // exceção por perfil, ela terá de passar por aqui.
  let e = resolverPendencias(estado());
  const r = executarFechamento(e, CICLO_SEMANAL, 'p01');
  e = { ...e, fechamentos: r.fechamentos!, parcelas: r.parcelas! };

  const d = e.diarias.find((x) => x.pessoa_id === 'p18' && x.data === '2026-08-19')!;
  const tentativa = definirObraQueArca(e, d.id, 'o01', 'p01'); // p01 = Pedro, Administração
  verdadeiro(!!tentativa.erro, 'a Administração também é recusada');
  verdadeiro(tentativa.erro!.includes('fechado'), `erro descritivo: ${tentativa.erro}`);
});

teste('diário FORA do período fechado continua editável', () => {
  let e = resolverPendencias(estado());
  const r = executarFechamento(e, CICLO_SEMANAL, 'p01');
  e = { ...e, fechamentos: r.fechamentos!, parcelas: r.parcelas! };
  // d_14 é de 14/08, antes do período 17–22/08.
  falso(diarioEstaFechado(e, 'd_14'), 'diário de 14/08 não foi travado');
});

// ── OUTRAS BORDAS ──────────────────────────────────────────────────────────

teste('ciclo já fechado não fecha de novo', () => {
  let e = resolverPendencias(estado());
  const r1 = executarFechamento(e, CICLO_SEMANAL, 'p01');
  e = { ...e, fechamentos: r1.fechamentos!, parcelas: r1.parcelas! };
  const r2 = executarFechamento(e, CICLO_SEMANAL, 'p01');
  falso(r2.ok, 'segunda execução deve falhar');
  verdadeiro(r2.erro!.includes('já foi fechado'), `erro descritivo: ${r2.erro}`);
});

teste('o ciclo por obra não pode ser fechado: a periodicidade está em aberto', () => {
  const r = executarFechamento(estado(), 'por_obra', 'p01');
  falso(r.ok, 'não deve fechar');
  verdadeiro(r.erro!.includes('período'), `erro descritivo: ${r.erro}`);
});

teste('executar com pendência aberta é recusado, e o erro nomeia as pendências', () => {
  const r = executarFechamento(estado(), CICLO_SEMANAL, 'p01');
  falso(r.ok, 'deve recusar');
  verdadeiro(r.erro!.includes('pendência'), `erro menciona pendência: ${r.erro}`);
});

teste('adiantamento é descontado INTEGRALMENTE; empréstimo, só a parcela do ciclo', () => {
  const e = estado();

  // Jonas (p08): adiantamento de R$400,00, parcela única.
  const jonas = calcularFechamentoDaPessoa(e, 'p08', CICLO_SEMANAL);
  igual(jonas.descontos_centavos, 40000, 'adiantamento inteiro do Jonas');

  // Marcos (p07): empréstimo de R$1.200,00 em 4 parcelas de R$300,00.
  // Só a parcela deste ciclo entra — e a que rolou do ciclo de 15/08.
  const marcos = calcularFechamentoDaPessoa(e, 'p07', CICLO_SEMANAL);
  igual(marcos.descontos_centavos, 30000, 'só a parcela do ciclo, não o saldo todo');
  igual(marcos.bruto_centavos, 50000, 'duas diárias de R$250,00');
  igual(marcos.a_pagar_centavos, 20000, 'R$500,00 menos R$300,00');
});

teste('o valor vem CONGELADO da diária, nunca do vínculo', () => {
  const e = estado();
  const antes = calcularFechamentoDaPessoa(e, 'p07', CICLO_SEMANAL).bruto_centavos;

  // Muda o vínculo do Marcos. O fechamento do período não pode mudar junto.
  e.vinculos = e.vinculos.map((v) =>
    v.pessoa_id === 'p07' ? { ...v, valor_diaria_centavos: 99900 } : v
  );
  const depois = calcularFechamentoDaPessoa(e, 'p07', CICLO_SEMANAL).bruto_centavos;
  igual(depois, antes, 'o bruto não se mexe quando o vínculo muda');
});

teste('adicional entra pelo valor gravado, sem ser recalculado pelo dia da semana', () => {
  const e = estado();
  e.diarias = e.diarias.map((d) =>
    d.pessoa_id === 'p07' && d.data === '2026-08-19'
      ? { ...d, adicional_centavos: 5000 }
      : d
  );
  const x = calcularFechamentoDaPessoa(e, 'p07', CICLO_SEMANAL);
  igual(x.bruto_centavos, 55000, 'bruto com adicional');
  igual(x.linhas.filter((l) => l.tipo === 'adicional').length, 1, 'linha de adicional no extrato');
});

teste('próximo fim de ciclo respeita cada periodicidade', () => {
  igual(proximoFimDeCiclo('semanal', '2026-08-22'), '2026-08-29', 'semanal + 7');
  igual(proximoFimDeCiclo('quinzenal', '2026-08-29'), '2026-09-13', 'quinzenal + 15');
  igual(proximoFimDeCiclo('mensal', '2026-08-31'), '2026-09-30', 'mensal = fim do mês seguinte');
});

teste('pessoa sem diária no período fecha em zero, sem quebrar', () => {
  // Erasmo (p23) está na Obra 25 - ATB, que não tem diário: sem presença, sem
  // diária. O ciclo dele é o quinzenal.
  const e = estado();
  const x = calcularFechamentoDaPessoa(e, 'p23', 'quinzenal_2026-08-15_2026-08-29');
  igual(x.bruto_centavos, 0, 'bruto zero');
  igual(x.a_pagar_centavos, 0, 'a pagar zero');
  igual(x.linhas.length, 0, 'extrato vazio');
});

teste('cicloId inexistente devolve extrato vazio em vez de estourar', () => {
  const x = calcularFechamentoDaPessoa(estado(), 'p07', 'nao_existe');
  igual(x.bruto_centavos, 0, 'bruto zero');
  igual(x.linhas.length, 0, 'sem linhas');
});

// ═══════════════════════════════════════════════════════════════════════════

/**
 * Resolve as três pendências que o seed deixa abertas de propósito no ciclo
 * semanal, para que os testes de execução possam chegar até o fechamento:
 * o rateio do Israel, a ausência do Jonas e o diário em rascunho da MCL.
 */
function resolverPendencias(e: AppState): AppState {
  const diarias = definirObraQueArca(e, 'di_1908_rateio_p19', 'o02', 'p03').diarias;
  const diarios = e.diarios.map((d) => {
    if (d.id === 'd06') return { ...d, removidos_planejados: [] };
    if (d.id === 'd02') return { ...d, estado: 'finalizado' as const, finalizado_por: 'p04' };
    return d;
  });
  return { ...e, diarias, diarios };
}

export function rodarTestes(): { total: number; falhas: number; resultados: Resultado[] } {
  const falhas = resultados.filter((r) => !r.ok).length;
  return { total: resultados.length, falhas, resultados };
}
