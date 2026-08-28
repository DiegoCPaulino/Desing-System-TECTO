import type { AppState } from './types';
import DADOS from './dados-iniciais';
import {
  adicionaisDaObra,
  custosVisiveisAoCliente,
  margemDaObra,
  recebimentosDaObra,
  totaisDaObra,
} from './visibilidade';

/**
 * Testes da fronteira de visibilidade do Cliente e da coerência entre os
 * totais gravados na Obra e as linhas que os compõem.
 *
 * Mesmo formato de `fechamento.testes.ts`: sem framework, executável
 * compilando com `tsc` e rodando no Node.
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

const e = DADOS as AppState;

// ═══════════════════════════════════════════════════════════════════════════
// Coerência: os totais da Obra e as linhas que os compõem
// ═══════════════════════════════════════════════════════════════════════════

teste('a soma dos recebimentos bate com contratado + adicionais, nas 5 obras', () => {
  for (const obra of e.obras) {
    const { total_centavos } = totaisDaObra(e, obra.id);
    const esperado = obra.valor_contratado_centavos + obra.adicionais_centavos;
    igual(total_centavos, esperado, `total de ${obra.codigo}`);
  }
});

teste('a soma dos recebimentos PAGOS bate com recebido_centavos, nas 5 obras', () => {
  for (const obra of e.obras) {
    const { recebido_centavos } = totaisDaObra(e, obra.id);
    igual(recebido_centavos, obra.recebido_centavos, `recebido de ${obra.codigo}`);
  }
});

teste('a soma dos adicionais bate com adicionais_centavos da Obra', () => {
  for (const obra of e.obras) {
    const soma = adicionaisDaObra(e, obra.id).reduce((s, a) => s + a.valor_centavos, 0);
    igual(soma, obra.adicionais_centavos, `adicionais de ${obra.codigo}`);
  }
});

teste('a Obra 22 tem 6 parcelas, 3 pagas, e falta receber R$64.320,00', () => {
  const parcelas = recebimentosDaObra(e, 'o01');
  igual(parcelas.length, 6, 'número de parcelas');
  igual(parcelas.filter((p) => p.situacao === 'paga').length, 3, 'pagas');
  igual(totaisDaObra(e, 'o01').a_receber_centavos, 6432000, 'a receber');
});

// ═══════════════════════════════════════════════════════════════════════════
// RN-136 — o que o Cliente NUNCA vê
// ═══════════════════════════════════════════════════════════════════════════

teste('RN-136: o custo recortado para o Cliente não carrega custo nem margem', () => {
  const visiveis = custosVisiveisAoCliente(e, 'o01');
  verdadeiro(visiveis.length > 0, 'há custos na Obra 22');
  for (const c of visiveis) {
    const chaves = Object.keys(c);
    verdadeiro(!chaves.includes('custo_centavos'), `custo_centavos vazou em ${c.id}`);
    verdadeiro(!chaves.includes('margem'), `margem vazou em ${c.id}`);
    verdadeiro(!chaves.includes('valor_cobrado_centavos'), `nome interno vazou em ${c.id}`);
  }
});

teste('RN-136: o valor visível é o COBRADO, nunca o custo', () => {
  // co05: elétrica repassada com margem — cobra R$4.800,00, custa R$3.200,00.
  const co05 = custosVisiveisAoCliente(e, 'o01').find((c) => c.id === 'co05')!;
  igual(co05.valor_centavos, 480000, 'o Cliente vê o valor cobrado');

  const interno = e.custos_obra.find((c) => c.id === 'co05')!;
  igual(interno.custo_centavos, 320000, 'o custo existe, mas fica no estado');
  verdadeiro(co05.valor_centavos !== interno.custo_centavos, 'são números diferentes');
});

teste('a margem da obra é interna e é a diferença entre cobrado e custo', () => {
  // Obra 22: (480000-320000) + (360000-240000) = 280000. Os demais custos são
  // reembolsáveis ou diretos, sem margem.
  igual(margemDaObra(e, 'o01'), 280000, 'margem da Obra 22');
});

teste('RN-131: só "repassado com margem" gera margem', () => {
  // Este é o teste que pegou o defeito: a margem somava também as notas
  // "direto do fornecedor", e a Obra 22 aparecia com R$57.200,00 de margem
  // em vez de R$2.800,00.
  for (const obra of e.obras) {
    const somaIngenua = e.custos_obra
      .filter((c) => c.obra_id === obra.id)
      .reduce((s, c) => s + (c.valor_cobrado_centavos - c.custo_centavos), 0);
    const soComMargem = e.custos_obra
      .filter((c) => c.obra_id === obra.id && c.modalidade === 'repassado_com_margem')
      .reduce((s, c) => s + (c.valor_cobrado_centavos - c.custo_centavos), 0);
    igual(margemDaObra(e, obra.id), soComMargem, `margem de ${obra.codigo}`);
    if (somaIngenua !== soComMargem) {
      verdadeiro(margemDaObra(e, obra.id) < somaIngenua, `${obra.codigo} não infla a margem`);
    }
  }
});

teste('RN-130: reembolsável não tem margem, e direto do fornecedor não custa nada', () => {
  // Todo material é do Cliente, logo nunca é repassado com margem.
  for (const c of e.custos_obra) {
    if (c.modalidade === 'reembolsavel') {
      igual(c.valor_cobrado_centavos, c.custo_centavos, `${c.id} reembolsa o mesmo valor`);
    }
    if (c.modalidade === 'direto_do_cliente') {
      igual(c.custo_centavos, 0, `${c.id} não sai do caixa da TECTO`);
    }
    if (c.modalidade === 'repassado_com_margem') {
      verdadeiro(c.custo_centavos > 0, `${c.id} precisa ter custo próprio`);
      verdadeiro(
        c.valor_cobrado_centavos > c.custo_centavos,
        `${c.id} cobra mais do que custa`
      );
    }
  }
});

teste('RN-131: a nomenclatura do Portal troca "Direto do Cliente"', () => {
  const rotulos = new Set(custosVisiveisAoCliente(e, 'o01').map((c) => c.modalidade_rotulo));
  verdadeiro(rotulos.has('Direto do fornecedor'), 'rótulo do Portal');
  verdadeiro(!rotulos.has('Direto do Cliente'), 'o rótulo interno não vaza');
});

teste('RN-133: o mesmo prestador pode ter modalidades diferentes por obra', () => {
  // Rogério Pastore é repassado com margem nas duas obras em que aparece; o
  // que este teste guarda é que a modalidade vive no CUSTO, não no cadastro.
  const doRogerio = e.custos_obra.filter((c) => c.fornecedor === 'Rogério Pastore');
  verdadeiro(doRogerio.length >= 2, 'aparece em mais de uma obra');
  for (const c of doRogerio) {
    verdadeiro('modalidade' in c, 'a modalidade está no registro do custo');
  }
  const pessoa = e.pessoas.find((p) => p.nome === 'Rogério Pastore')!;
  verdadeiro(!('modalidade' in pessoa), 'e não no cadastro da pessoa');
});

// ═══════════════════════════════════════════════════════════════════════════

export function rodarTestes(): { total: number; falhas: number; resultados: Resultado[] } {
  const falhas = resultados.filter((r) => !r.ok).length;
  return { total: resultados.length, falhas, resultados };
}
