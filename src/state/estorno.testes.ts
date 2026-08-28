import type { AppState } from './types';
import DADOS from './dados-iniciais';
import {
  cicloDestinoDoEstorno,
  estornarLancamento,
  estornosDaPessoa,
  jaFoiEstornado,
} from './estorno';
import {
  calcularFechamentoDaPessoa,
  definirObraQueArca,
  executarFechamento,
  saldoDevedorDaPessoa,
} from './fechamento';

/**
 * Testes do Estorno — módulo sensível.
 *
 * Cobre os três casos obrigatórios: estorno em ciclo fechado, estorno duplo, e
 * o saldo do ciclo seguinte. Mais as bordas que apareceram ao escrever.
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

const CICLO_SEMANAL = 'semanal_2026-08-17_2026-08-22';
const HOJE = '2026-08-20';

/** Resolve as pendências que o seed deixa abertas de propósito. */
function resolverPendencias(e: AppState): AppState {
  const diarias = definirObraQueArca(e, 'di_1908_rateio_p19', 'o02', 'p03').diarias;
  const diarios = e.diarios.map((d) => {
    if (d.id === 'd06') return { ...d, removidos_planejados: [] };
    if (d.id === 'd02') return { ...d, estado: 'finalizado' as const, finalizado_por: 'p04' };
    return d;
  });
  return { ...e, diarias, diarios };
}

/** Fecha o ciclo semanal, que é o pré-requisito do caso "ciclo fechado". */
function comCicloFechado(): AppState {
  const e = resolverPendencias(estado());
  const r = executarFechamento(e, CICLO_SEMANAL, 'p01');
  if (!r.ok) throw new Error(`não deu para fechar o ciclo: ${r.erro}`);
  return { ...e, fechamentos: r.fechamentos!, parcelas: r.parcelas! };
}

// ═══════════════════════════════════════════════════════════════════════════
// O básico: não apaga, não altera, registra
// ═══════════════════════════════════════════════════════════════════════════

teste('o estorno não apaga nem altera o lançamento original', () => {
  const e = estado();
  const antes = JSON.stringify(e.lancamentos.find((l) => l.id === 'la02'));

  const r = estornarLancamento(e, 'la02', 'Valor lançado em duplicidade', 'p03', HOJE);
  verdadeiro(r.ok, `deveria passar — ${r.erro ?? ''}`);

  const depois = JSON.stringify(r.lancamentos!.find((l) => l.id === 'la02'));
  igual(depois, antes, 'o original ficou intacto, byte a byte');
  igual(r.lancamentos!.length, e.lancamentos.length + 1, 'o estorno foi ACRESCENTADO');
});

teste('o estorno registra autor, data e motivo', () => {
  const r = estornarLancamento(estado(), 'la02', 'Cobrança indevida', 'p03', HOJE);
  const es = r.estorno!;
  igual(es.tipo, 'estorno', 'tipo');
  igual(es.motivo, 'Cobrança indevida', 'motivo');
  igual(es.autor_id, 'p03', 'autor');
  igual(es.data, HOJE, 'data');
  igual(es.estorna_lancamento_id, 'la02', 'aponta para o original');
});

teste('estorno sem motivo é recusado', () => {
  const r = estornarLancamento(estado(), 'la02', '   ', 'p03', HOJE);
  falso(r.ok, 'deveria recusar');
  verdadeiro(r.erro!.includes('motivo'), `erro descritivo: ${r.erro}`);
});

teste('lançamento inexistente é recusado com erro descritivo', () => {
  const r = estornarLancamento(estado(), 'nao_existe', 'qualquer', 'p03', HOJE);
  falso(r.ok, 'deveria recusar');
  verdadeiro(r.erro!.includes('não encontrado'), `erro: ${r.erro}`);
});

// ── CASO OBRIGATÓRIO 1 — estorno duplo ─────────────────────────────────────

teste('OBRIGATÓRIO: lançamento já estornado não estorna de novo', () => {
  let e = estado();
  const primeiro = estornarLancamento(e, 'la02', 'Duplicidade', 'p03', HOJE);
  verdadeiro(primeiro.ok, 'o primeiro estorno passa');
  e = { ...e, lancamentos: primeiro.lancamentos!, parcelas: primeiro.parcelas! };

  verdadeiro(jaFoiEstornado(e, 'la02'), 'o lançamento consta como estornado');

  const segundo = estornarLancamento(e, 'la02', 'De novo', 'p03', HOJE);
  falso(segundo.ok, 'o segundo estorno é recusado');
  verdadeiro(segundo.erro!.includes('já foi estornado'), `erro: ${segundo.erro}`);
  verdadeiro(segundo.erro!.includes('Duplicidade'), 'o erro cita o motivo do primeiro');
});

teste('um estorno não se estorna', () => {
  let e = estado();
  const r = estornarLancamento(e, 'la02', 'Duplicidade', 'p03', HOJE);
  e = { ...e, lancamentos: r.lancamentos!, parcelas: r.parcelas! };

  const doEstorno = estornarLancamento(e, r.estorno!.id, 'errei o estorno', 'p03', HOJE);
  falso(doEstorno.ok, 'deveria recusar');
  verdadeiro(doEstorno.erro!.includes('não se estorna'), `erro: ${doEstorno.erro}`);
});

// ── CASO OBRIGATÓRIO 2 — estorno em ciclo fechado ──────────────────────────

teste('OBRIGATÓRIO: estorno em ciclo FECHADO é permitido e não toca no ciclo fechado', () => {
  // Este é o ponto da RN-073: o ciclo fechado é imutável, e a correção existe
  // justamente para não precisar mexer nele.
  const e = comCicloFechado();

  const fechadoAntes = JSON.stringify(
    e.fechamentos.filter((f) => f.periodo_fim === '2026-08-22')
  );
  const pagasAntes = JSON.stringify(e.parcelas.filter((p) => p.situacao === 'paga'));

  // Marcos teve a parcela pa03 cobrada no ciclo que acabou de fechar.
  const r = estornarLancamento(e, 'la02', 'Empréstimo lançado por engano', 'p03', HOJE);
  verdadeiro(r.ok, `deveria passar — ${r.erro ?? ''}`);

  const depois = { ...e, lancamentos: r.lancamentos!, parcelas: r.parcelas! };

  // Nada do ciclo fechado se moveu.
  igual(
    JSON.stringify(depois.fechamentos.filter((f) => f.periodo_fim === '2026-08-22')),
    fechadoAntes,
    'os Fechamentos do ciclo fechado não mudaram'
  );
  igual(
    JSON.stringify(depois.parcelas.filter((p) => p.situacao === 'paga')),
    pagasAntes,
    'as parcelas já pagas não mudaram'
  );
});

teste('OBRIGATÓRIO: o valor cai no ciclo SEGUINTE, nunca no já fechado', () => {
  const e = comCicloFechado();
  const r = estornarLancamento(e, 'la02', 'Empréstimo por engano', 'p03', HOJE);

  const parcelaDoEstorno = r.parcelas!.find((p) => p.lancamento_id === r.estorno!.id)!;
  verdadeiro(
    parcelaDoEstorno.ciclo_periodo_fim > '2026-08-22',
    `cai depois do ciclo fechado, e não em ${parcelaDoEstorno.ciclo_periodo_fim}`
  );
  igual(parcelaDoEstorno.ciclo_periodo_fim, '2026-08-29', 'no ciclo semanal seguinte');
  igual(parcelaDoEstorno.situacao, 'pendente', 'ainda não foi pago');
});

teste('o ciclo de destino é o primeiro ABERTO depois da última cobrança', () => {
  const e = comCicloFechado();
  igual(cicloDestinoDoEstorno(e, 'p07', '2026-08-22'), '2026-08-29', 'próximo aberto');
});

// ── CASO OBRIGATÓRIO 3 — saldo do ciclo seguinte ───────────────────────────

teste('OBRIGATÓRIO: o crédito do estorno aparece no extrato do ciclo seguinte', () => {
  let e = comCicloFechado();

  // Antes do estorno, o Marcos deve as 2 parcelas restantes: R$600,00.
  igual(saldoDevedorDaPessoa(e, 'p07'), 60000, 'dívida antes do estorno');

  const r = estornarLancamento(e, 'la02', 'Empréstimo por engano', 'p03', HOJE);
  e = { ...e, lancamentos: r.lancamentos!, parcelas: r.parcelas! };

  // O empréstimo tinha 4 parcelas de R$300,00: 2 pagas, 2 pendentes.
  // As 2 pendentes são canceladas; as 2 pagas viram crédito de R$600,00.
  igual(r.estorno!.valor_centavos, 60000, 'crédito = o que já foi descontado');
  igual(saldoDevedorDaPessoa(e, 'p07'), 0, 'a dívida zerou: as pendentes foram canceladas');

  const canceladas = e.parcelas.filter(
    (p) => p.lancamento_id === 'la02' && p.situacao === 'estornada'
  );
  igual(canceladas.length, 2, 'duas parcelas canceladas');
  // Canceladas, não apagadas: o valor e o número continuam lá.
  igual(canceladas[0].valor_centavos, 30000, 'o valor da parcela cancelada continua íntegro');
});

teste('OBRIGATÓRIO: o crédito entra no cálculo do ciclo seguinte e aumenta o a pagar', () => {
  let e = comCicloFechado();
  const r = estornarLancamento(e, 'la02', 'Empréstimo por engano', 'p03', HOJE);
  e = { ...e, lancamentos: r.lancamentos!, parcelas: r.parcelas! };

  // O ciclo seguinte do Marcos não existe como Fechamento no seed, então o
  // crédito fica pendente esperando por ele. O que dá para afirmar aqui é que
  // ele NÃO entrou no ciclo que já fechou.
  const noFechado = calcularFechamentoDaPessoa(e, 'p07', CICLO_SEMANAL);
  igual(noFechado.creditos_centavos, 0, 'o ciclo fechado não recebeu o crédito');

  // E que a parcela do crédito existe, pendente, no ciclo seguinte.
  const credito = e.parcelas.find((p) => p.lancamento_id === r.estorno!.id)!;
  igual(credito.ciclo_periodo_fim, '2026-08-29', 'no ciclo seguinte');
  igual(credito.valor_centavos, 60000, 'valor do crédito');
});

teste('o crédito soma ao bruto e o a pagar cresce', () => {
  // Monta um caso direto: ciclo aberto, com um crédito de estorno caindo nele.
  const e = estado();
  const semEstorno = calcularFechamentoDaPessoa(e, 'p11', CICLO_SEMANAL);
  igual(semEstorno.creditos_centavos, 0, 'Adilson não tem crédito');

  const comCredito: AppState = {
    ...e,
    lancamentos: [
      ...e.lancamentos,
      {
        id: 'la_teste',
        pessoa_id: 'p11',
        tipo: 'estorno' as const,
        valor_centavos: 25000,
        parcelas: 1,
        parcelas_pagas: 0,
        data: HOJE,
        estorna_lancamento_id: 'la01',
        motivo: 'teste',
        autor_id: 'p03',
      },
    ],
    parcelas: [
      ...e.parcelas,
      {
        id: 'pa_teste',
        lancamento_id: 'la_teste',
        numero: 1,
        valor_centavos: 25000,
        situacao: 'pendente' as const,
        ciclo_periodo_fim: '2026-08-22',
      },
    ],
  };

  const x = calcularFechamentoDaPessoa(comCredito, 'p11', CICLO_SEMANAL);
  igual(x.creditos_centavos, 25000, 'crédito reconhecido');
  igual(x.a_pagar_centavos, semEstorno.a_pagar_centavos + 25000, 'a pagar cresce pelo crédito');
  igual(x.linhas.filter((l) => l.tipo === 'estorno').length, 1, 'linha de estorno no extrato');
});

// ── OUTRAS BORDAS ──────────────────────────────────────────────────────────

teste('estornar lançamento sem nenhuma parcela paga credita zero e só cancela', () => {
  // Jonas: adiantamento de R$400,00, parcela única, ainda pendente.
  const e = estado();
  const r = estornarLancamento(e, 'la01', 'Adiantamento cancelado a pedido', 'p03', HOJE);
  verdadeiro(r.ok, `deveria passar — ${r.erro ?? ''}`);
  igual(r.estorno!.valor_centavos, 0, 'nada foi descontado, nada a devolver');
  igual(r.estorno!.parcelas, 0, 'sem parcela de crédito');

  const doCredito = r.parcelas!.filter((p) => p.lancamento_id === r.estorno!.id);
  igual(doCredito.length, 0, 'não cria parcela de crédito para valor zero');

  const cancelada = r.parcelas!.find((p) => p.id === 'pa01')!;
  igual(cancelada.situacao, 'estornada', 'a parcela pendente foi cancelada');
  igual(cancelada.valor_centavos, 40000, 'e continua com o valor íntegro');
});

teste('o registro de auditoria descreve o que aconteceu', () => {
  let e = comCicloFechado();
  const r = estornarLancamento(e, 'la02', 'Empréstimo por engano', 'p03', HOJE);
  e = { ...e, lancamentos: r.lancamentos!, parcelas: r.parcelas! };

  const registros = estornosDaPessoa(e, 'p07');
  igual(registros.length, 1, 'um estorno registrado');
  const reg = registros[0];
  igual(reg.original_id, 'la02', 'aponta para o original');
  igual(reg.tipo_original, 'emprestimo', 'diz o que era');
  igual(reg.valor_original_centavos, 120000, 'valor do lançamento original');
  igual(reg.valor_creditado_centavos, 60000, 'o que foi devolvido');
  igual(reg.parcelas_canceladas, 2, 'quantas pararam de ser cobradas');
  igual(reg.motivo, 'Empréstimo por engano', 'motivo');
  igual(reg.ciclo_destino, '2026-08-29', 'ciclo em que o crédito cai');
});

teste('parcela estornada some da cobrança mas não do extrato do lançamento', () => {
  const e = estado();
  const r = estornarLancamento(e, 'la02', 'Engano', 'p03', HOJE);
  const doLancamento = r.parcelas!.filter((p) => p.lancamento_id === 'la02');
  igual(doLancamento.length, 4, 'as 4 parcelas continuam existindo');
  igual(
    doLancamento.filter((p) => p.situacao === 'estornada').length,
    3,
    'as 3 pendentes foram canceladas'
  );
  igual(doLancamento.filter((p) => p.situacao === 'paga').length, 1, 'a paga continua paga');
});

// ═══════════════════════════════════════════════════════════════════════════

export function rodarTestes(): { total: number; falhas: number; resultados: Resultado[] } {
  const falhas = resultados.filter((r) => !r.ok).length;
  return { total: resultados.length, falhas, resultados };
}
