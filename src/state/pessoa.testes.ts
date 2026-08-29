import type { AppState } from './types';
import DADOS from './dados-iniciais';
import { custoDeMaoDeObra, type Periodo } from './indicadores';
import {
  fichaDaPessoa,
  lancamentosDaPessoa,
  maoDeObraPorPessoa,
  obrasDaPessoa,
  vinculosDaPessoa,
} from './pessoa';

/**
 * Testes de `pessoa.ts`.
 *
 * O erro que este arquivo existe para impedir é o da T8: **duas telas mostrando
 * números diferentes para a mesma coisa**. A mão de obra por pessoa e o total
 * da obra saem de dois módulos distintos, e a soma de um tem de bater com o
 * outro — não por coincidência, mas porque há teste.
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

function verdadeiro(condicao: boolean, oQue: string) {
  if (!condicao) throw new Error(oQue);
}

function estado(): AppState {
  return JSON.parse(JSON.stringify(DADOS)) as AppState;
}

const AGOSTO: Periodo = { inicio: '2026-08-01', fim: '2026-08-31' };
const TRIMESTRE: Periodo = { inicio: '2026-06-01', fim: '2026-08-31' };

// ═══ Mão de obra por pessoa ═══════════════════════════════════════════════════

teste('a soma das pessoas bate com o total da obra — líquido', () => {
  const e = estado();
  for (const obra of e.obras) {
    const porPessoa = maoDeObraPorPessoa(e, obra.id, TRIMESTRE);
    const total = custoDeMaoDeObra(e, obra.id, TRIMESTRE);
    const soma = porPessoa.reduce((s, l) => s + l.liquido_centavos, 0);
    igual(soma, total.liquido_centavos, `líquido da ${obra.codigo}`);
  }
});

teste('a soma das pessoas bate com o total da obra — custo de empresa', () => {
  const e = estado();
  for (const obra of e.obras) {
    const porPessoa = maoDeObraPorPessoa(e, obra.id, TRIMESTRE);
    const total = custoDeMaoDeObra(e, obra.id, TRIMESTRE);
    const soma = porPessoa.reduce((s, l) => s + l.empresa_centavos, 0);
    igual(soma, total.empresa_centavos, `custo de empresa da ${obra.codigo}`);
  }
});

teste('a contagem de dias sem custo informado também bate', () => {
  const e = estado();
  for (const obra of e.obras) {
    const soma = maoDeObraPorPessoa(e, obra.id, TRIMESTRE).reduce((s, l) => s + l.dias_sem_custo, 0);
    igual(soma, custoDeMaoDeObra(e, obra.id, TRIMESTRE).sem_custo_informado, `sem custo na ${obra.codigo}`);
  }
});

teste('líquido é sempre diárias mais adicionais', () => {
  const e = estado();
  for (const obra of e.obras) {
    for (const l of maoDeObraPorPessoa(e, obra.id, TRIMESTRE)) {
      igual(l.liquido_centavos, l.diarias_centavos + l.adicionais_centavos, `${l.nome} na ${obra.codigo}`);
    }
  }
});

teste('o custo da empresa nunca é derivado do líquido', () => {
  // A decisão sobre encargos proíbe multiplicar um pelo outro. Se alguém
  // introduzir um percentual, a razão entre os dois vira constante — e é isso
  // que este teste vigia.
  const e = estado();
  const razoes = new Set<number>();
  for (const obra of e.obras) {
    for (const l of maoDeObraPorPessoa(e, obra.id, TRIMESTRE)) {
      if (l.empresa_centavos > 0 && l.liquido_centavos > 0) {
        razoes.add(Math.round((l.empresa_centavos / l.liquido_centavos) * 1000));
      }
    }
  }
  verdadeiro(razoes.size > 1, 'as razões custo/líquido variam entre pessoas, como devem');
});

teste('período fora do estado devolve lista vazia, não erro', () => {
  const e = estado();
  igual(maoDeObraPorPessoa(e, e.obras[0].id, { inicio: '2020-01-01', fim: '2020-01-31' }).length, 0, 'vazio');
});

teste('a diária conta inteira para a obra que arca, sem rateio', () => {
  // INV-04: N presenças, UMA diária. Israel Fontes tem presença em duas obras
  // no mesmo dia; a diária dele não pode aparecer partida entre as duas.
  const e = estado();
  const comDuasPresencas = e.diarias.filter((d) => d.obra_que_arca_id);
  for (const d of comDuasPresencas) {
    const linhas = maoDeObraPorPessoa(e, d.obra_que_arca_id!, { inicio: d.data, fim: d.data });
    const linha = linhas.find((l) => l.pessoa_id === d.pessoa_id);
    if (!linha) continue;
    verdadeiro(
      linha.diarias_centavos >= d.valor_centavos,
      `a diária de ${linha.nome} em ${d.data} entrou inteira`
    );
  }
});

// ═══ Ficha da pessoa — as quatro camadas do INV-01 ════════════════════════════

teste('a ficha existe para toda pessoa do elenco', () => {
  const e = estado();
  for (const p of e.pessoas) {
    verdadeiro(fichaDaPessoa(e, p.id) !== undefined, `ficha de ${p.nome}`);
  }
});

teste('pessoa inexistente devolve undefined, não erro', () => {
  igual(fichaDaPessoa(estado(), 'p999'), undefined, 'id desconhecido');
});

teste('Pessoa e Usuário são camadas distintas: há pessoa sem credencial', () => {
  // Se toda pessoa tivesse usuário, o INV-01 seria decorativo. O seed precisa
  // provar a separação, senão a tela não tem o que demonstrar.
  const e = estado();
  const semUsuario = e.pessoas.filter((p) => !fichaDaPessoa(e, p.id)!.usuario);
  verdadeiro(semUsuario.length > 0, 'existe pessoa sem usuário no estado');
});

teste('o Papel vem do Usuário, nunca da Pessoa', () => {
  const e = estado();
  for (const p of e.pessoas) {
    const f = fichaDaPessoa(e, p.id)!;
    if (f.usuario) igual(f.papel, f.usuario.perfil, `papel de ${p.nome}`);
    else igual(f.papel, undefined, `${p.nome} não tem papel sem usuário`);
  }
});

teste('no máximo um vínculo ativo por pessoa — RN-003', () => {
  const e = estado();
  for (const p of e.pessoas) {
    const ativos = vinculosDaPessoa(e, p.id).filter((v) => v.ativo);
    verdadeiro(ativos.length <= 1, `${p.nome} tem ${ativos.length} vínculos ativos`);
  }
});

teste('a linha do tempo de vínculos vem do mais recente', () => {
  const e = estado();
  for (const p of e.pessoas) {
    const linha = vinculosDaPessoa(e, p.id);
    for (let i = 1; i < linha.length; i++) {
      verdadeiro(
        linha[i - 1].vinculo.inicio >= linha[i].vinculo.inicio,
        `ordem da linha do tempo de ${p.nome}`
      );
    }
  }
});

teste('vínculo ativo é o mesmo que a linha do tempo marca como ativo', () => {
  const e = estado();
  for (const p of e.pessoas) {
    const f = fichaDaPessoa(e, p.id)!;
    const daLinha = vinculosDaPessoa(e, p.id).find((v) => v.ativo)?.vinculo;
    igual(f.vinculo_ativo?.id, daLinha?.id, `vínculo ativo de ${p.nome}`);
  }
});

// ═══ Lançamentos e contratos ══════════════════════════════════════════════════

teste('o lançamento estornado é marcado como estornado', () => {
  const e = estado();
  const estornos = e.lancamentos.filter((l) => l.tipo === 'estorno' && l.estorna_lancamento_id);
  for (const est of estornos) {
    const daPessoa = lancamentosDaPessoa(e, est.pessoa_id);
    const original = daPessoa.find((x) => x.lancamento.id === est.estorna_lancamento_id);
    verdadeiro(original?.estornado === true, `o original de ${est.id} está marcado`);
  }
});

teste('lançamento sem estorno não é marcado', () => {
  const e = estado();
  const alvo = e.lancamentos.find((l) => l.tipo === 'adiantamento' || l.tipo === 'emprestimo');
  if (!alvo) throw new Error('o seed não tem adiantamento nem empréstimo');
  const descrito = lancamentosDaPessoa(e, alvo.pessoa_id).find((x) => x.lancamento.id === alvo.id)!;
  const temEstorno = e.lancamentos.some((l) => l.estorna_lancamento_id === alvo.id);
  igual(descrito.estornado, temEstorno, 'a marca acompanha o estado real');
});

teste('pago mais pendente nunca passa do valor do lançamento', () => {
  const e = estado();
  for (const p of e.pessoas) {
    for (const l of lancamentosDaPessoa(e, p.id)) {
      if (l.parcelas.length === 0) continue;
      verdadeiro(
        l.pago_centavos + l.pendente_centavos <= l.lancamento.valor_centavos,
        `${p.nome}: parcelas somam mais que o lançamento ${l.lancamento.id}`
      );
    }
  }
});

teste('parcela estornada não conta como pendente', () => {
  const e = estado();
  for (const p of e.pessoas) {
    for (const l of lancamentosDaPessoa(e, p.id)) {
      const estornadas = l.parcelas.filter((x) => x.situacao === 'estornada');
      if (estornadas.length === 0) continue;
      const soma = estornadas.reduce((s, x) => s + x.valor_centavos, 0);
      verdadeiro(
        l.pendente_centavos <= l.lancamento.valor_centavos - soma,
        `${p.nome}: parcela estornada entrou no pendente`
      );
    }
  }
});

teste('o contrato de terceirizado fecha pago mais pendente', () => {
  const e = estado();
  for (const p of e.pessoas) {
    for (const c of fichaDaPessoa(e, p.id)!.contratos) {
      igual(
        c.pago_centavos + c.pendente_centavos,
        c.contrato.valor_centavos,
        `contrato ${c.contrato.id} de ${p.nome}`
      );
    }
  }
});

teste('as obras da pessoa saem das diárias, sem obra fantasma', () => {
  const e = estado();
  for (const p of e.pessoas) {
    for (const { obra, dias } of obrasDaPessoa(e, p.id)) {
      verdadeiro(dias > 0, `${p.nome} na ${obra.codigo} com ${dias} dias`);
      verdadeiro(e.obras.some((o) => o.id === obra.id), `a obra existe`);
    }
  }
});

teste('o mês e o trimestre são coerentes entre si', () => {
  const e = estado();
  for (const obra of e.obras) {
    const mes = maoDeObraPorPessoa(e, obra.id, AGOSTO).reduce((s, l) => s + l.liquido_centavos, 0);
    const tri = maoDeObraPorPessoa(e, obra.id, TRIMESTRE).reduce((s, l) => s + l.liquido_centavos, 0);
    verdadeiro(mes <= tri, `${obra.codigo}: agosto não pode passar do trimestre`);
  }
});

// ═══════════════════════════════════════════════════════════════════════════

export function rodarTestes(): { total: number; falhas: number; resultados: Resultado[] } {
  const falhas = resultados.filter((r) => !r.ok).length;
  return { total: resultados.length, falhas, resultados };
}
