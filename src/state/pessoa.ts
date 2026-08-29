import type {
  AppState,
  ContratoTerceirizado,
  Lancamento,
  Parcela,
  ParcelaContrato,
  Obra,
  Pessoa,
  TipoPerfil,
  TipoVinculo,
  Usuario,
  Vinculo,
} from './types';
import type { Periodo } from './indicadores';

/**
 * PESSOA — as duas leituras que a T6 precisa e que ainda não existiam.
 *
 * Funções puras, sem dependência do store, como `fechamento.ts` e
 * `visibilidade.ts`. A tela não cruza coleção nenhuma: recebe o objeto pronto.
 *
 * Duas coisas que este módulo NÃO faz, de propósito:
 *
 * - **Não deriva custo de empresa a partir do líquido.** O custo vem congelado
 *   na Diária (`INV-03`); onde ele não foi informado, isso é reportado, não
 *   preenchido. A decisão sobre encargos em `docs/DECISOES.md` proíbe
 *   multiplicar um pelo outro.
 * - **Não decide o que a gestão recebe.** `Q-001` a `Q-004` seguem abertas.
 */

// ─── Período ─────────────────────────────────────────────────────────────────

/** Mesmo recorte de `indicadores.ts`: datas ISO, comparação lexicográfica. */
function dentro(data: string, p: Periodo): boolean {
  return data >= p.inicio && data <= p.fim;
}

// ─── Mão de obra por pessoa ──────────────────────────────────────────────────

export interface MaoDeObraDaPessoa {
  pessoa_id: string;
  nome: string;
  /** Quantas diárias a obra arcou no período. */
  dias: number;
  /** Soma dos valores de diária, sem adicionais. */
  diarias_centavos: number;
  /** Soma dos adicionais de sábado, domingo e noturno. */
  adicionais_centavos: number;
  /** O que a pessoa recebe: diárias + adicionais. */
  liquido_centavos: number;
  /**
   * O que a empresa gasta, somando apenas o que foi informado em cada Diária.
   * Zero com `dias_sem_custo > 0` significa "não informado", não "de graça".
   */
  empresa_centavos: number;
  /** Diárias com valor e sem custo de empresa informado. */
  dias_sem_custo: number;
}

/**
 * A mão de obra da Obra no período, quebrada por pessoa.
 *
 * `custoDeMaoDeObra`, em `indicadores.ts`, responde o total da obra. Esta
 * responde a mesma pergunta pessoa a pessoa, e a soma das linhas daqui é
 * idêntica ao total de lá — há teste conferindo, porque duas telas mostrando
 * números diferentes para a mesma coisa é o defeito que a T8 mais teme.
 *
 * O recorte é `obra_que_arca_id`: uma pessoa em duas obras no mesmo dia gera N
 * presenças e UMA diária (`INV-04`), e ela custa inteira à obra que o
 * Financeiro escolheu. Sem rateio proporcional.
 */
export function maoDeObraPorPessoa(
  state: AppState,
  obra_id: string,
  p: Periodo
): MaoDeObraDaPessoa[] {
  const porPessoa = new Map<string, MaoDeObraDaPessoa>();

  for (const d of state.diarias) {
    if (d.obra_que_arca_id !== obra_id) continue;
    if (!dentro(d.data, p)) continue;

    let linha = porPessoa.get(d.pessoa_id);
    if (!linha) {
      linha = {
        pessoa_id: d.pessoa_id,
        nome: state.pessoas.find((x) => x.id === d.pessoa_id)?.nome ?? '?',
        dias: 0,
        diarias_centavos: 0,
        adicionais_centavos: 0,
        liquido_centavos: 0,
        empresa_centavos: 0,
        dias_sem_custo: 0,
      };
      porPessoa.set(d.pessoa_id, linha);
    }

    const valor = d.valor_centavos + d.adicional_centavos;
    linha.dias += 1;
    linha.diarias_centavos += d.valor_centavos;
    linha.adicionais_centavos += d.adicional_centavos;
    linha.liquido_centavos += valor;

    if (d.custo_empresa_centavos !== undefined) {
      linha.empresa_centavos += d.custo_empresa_centavos;
    } else if (valor > 0) {
      // Diária zero é gerente ou terceirizado por obra: não há custo a informar.
      linha.dias_sem_custo += 1;
    }
  }

  return [...porPessoa.values()].sort((a, b) => b.liquido_centavos - a.liquido_centavos);
}

// ─── Ficha da pessoa ─────────────────────────────────────────────────────────

/**
 * Um vínculo com a obra resolvida, quando o tipo o exige. Terceirizado por
 * obra e Gerente de Obras têm o vínculo preso a uma Obra; funcionário próprio
 * não tem.
 */
export interface VinculoNaLinhaDoTempo {
  vinculo: Vinculo;
  /** Ativo é o vínculo sem data de fim (`RN-003`). */
  ativo: boolean;
}

export interface ContratoDescrito {
  contrato: ContratoTerceirizado;
  obra?: Obra;
  parcelas: ParcelaContrato[];
  pago_centavos: number;
  pendente_centavos: number;
}

export interface LancamentoDescrito {
  lancamento: Lancamento;
  parcelas: Parcela[];
  pago_centavos: number;
  /** O que ainda será descontado. Parcela estornada não conta. */
  pendente_centavos: number;
  /** Existe um estorno apontando para este lançamento. */
  estornado: boolean;
}

/**
 * As quatro camadas do `INV-01`, juntas e ainda distintas.
 *
 * O `INV-01` é a coisa mais difícil de explicar deste sistema em palavras e a
 * mais fácil de mostrar em tela: **Pessoa** é o ser humano, **Vínculo** é o
 * contrato de trabalho, **Usuário** é a credencial e **Papel** é o que a
 * credencial pode fazer. Uma pessoa pode ter vários vínculos ao longo do tempo
 * e nenhum usuário; um usuário pode existir sem vínculo ativo.
 *
 * Por isso os quatro campos abaixo são independentes e qualquer um pode faltar.
 * Achatá-los num objeto só — "a pessoa é gerente" — é exatamente o erro que o
 * invariante existe para impedir.
 */
export interface FichaDaPessoa {
  /** Camada 1 — o ser humano. Sempre existe. */
  pessoa: Pessoa;
  /** Camada 2 — a linha do tempo de contratos de trabalho, do mais novo. */
  vinculos: VinculoNaLinhaDoTempo[];
  /** O vínculo sem data de fim, se houver. No máximo um (`RN-003`). */
  vinculo_ativo?: Vinculo;
  /** Camada 3 — a credencial. Ausente para quem não acessa o sistema. */
  usuario?: Usuario;
  /** Camada 4 — o que a credencial pode fazer. Vem do Usuário, não da Pessoa. */
  papel?: TipoPerfil;

  /** Contratos por obra. Só terceirizado por obra costuma ter. */
  contratos: ContratoDescrito[];
  /** Adiantamentos e empréstimos, do mais recente. Inclui os estornados. */
  lancamentos: LancamentoDescrito[];
  /** Obras em que a pessoa tem diária no estado, da mais recente. */
  obras: Array<{ obra: Obra; dias: number }>;
}

/** Um vínculo está ativo quando não tem data de fim. */
export function vinculoEstaAtivo(v: Vinculo): boolean {
  return !v.fim;
}

export function vinculosDaPessoa(state: AppState, pessoa_id: string): VinculoNaLinhaDoTempo[] {
  return state.vinculos
    .filter((v) => v.pessoa_id === pessoa_id)
    .sort((a, b) => b.inicio.localeCompare(a.inicio))
    .map((vinculo) => ({ vinculo, ativo: vinculoEstaAtivo(vinculo) }));
}

export function contratosDaPessoa(state: AppState, pessoa_id: string): ContratoDescrito[] {
  return state.contratos_terceirizado
    .filter((c) => c.pessoa_id === pessoa_id)
    .map((contrato) => {
      const parcelas = state.parcelas_contrato
        .filter((p) => p.contrato_id === contrato.id)
        .sort((a, b) => a.numero - b.numero);
      const pago = parcelas
        .filter((p) => p.situacao === 'paga')
        .reduce((s, p) => s + p.valor_centavos, 0);
      return {
        contrato,
        obra: state.obras.find((o) => o.id === contrato.obra_id),
        parcelas,
        pago_centavos: pago,
        pendente_centavos: contrato.valor_centavos - pago,
      };
    });
}

/**
 * Adiantamentos e empréstimos da pessoa.
 *
 * Os estornos aparecem na lista como lançamentos próprios, porque é isso que
 * eles são (`INV-08`): registro novo, nunca alteração do original. E cada
 * lançamento estornado é marcado, para a tela não oferecer estornar de novo.
 */
export function lancamentosDaPessoa(state: AppState, pessoa_id: string): LancamentoDescrito[] {
  const estornados = new Set(
    state.lancamentos
      .filter((l) => l.tipo === 'estorno' && l.estorna_lancamento_id)
      .map((l) => l.estorna_lancamento_id!)
  );

  return state.lancamentos
    .filter((l) => l.pessoa_id === pessoa_id)
    .sort((a, b) => b.data.localeCompare(a.data))
    .map((lancamento) => {
      const parcelas = state.parcelas
        .filter((p) => p.lancamento_id === lancamento.id)
        .sort((a, b) => a.numero - b.numero);
      return {
        lancamento,
        parcelas,
        pago_centavos: parcelas
          .filter((p) => p.situacao === 'paga')
          .reduce((s, p) => s + p.valor_centavos, 0),
        pendente_centavos: parcelas
          .filter((p) => p.situacao === 'pendente')
          .reduce((s, p) => s + p.valor_centavos, 0),
        estornado: estornados.has(lancamento.id),
      };
    });
}

/** As obras em que a pessoa trabalhou, contadas pelas diárias que cada uma arcou. */
export function obrasDaPessoa(state: AppState, pessoa_id: string): Array<{ obra: Obra; dias: number }> {
  const contagem = new Map<string, number>();
  for (const d of state.diarias) {
    if (d.pessoa_id !== pessoa_id || !d.obra_que_arca_id) continue;
    contagem.set(d.obra_que_arca_id, (contagem.get(d.obra_que_arca_id) ?? 0) + 1);
  }
  return [...contagem.entries()]
    .map(([obra_id, dias]) => ({ obra: state.obras.find((o) => o.id === obra_id)!, dias }))
    .filter((x) => x.obra)
    .sort((a, b) => b.dias - a.dias);
}

export function fichaDaPessoa(state: AppState, pessoa_id: string): FichaDaPessoa | undefined {
  const pessoa = state.pessoas.find((p) => p.id === pessoa_id);
  if (!pessoa) return undefined;

  const vinculos = vinculosDaPessoa(state, pessoa_id);
  // O Usuário aponta para a Pessoa, não o contrário: é assim que uma Pessoa
  // pode existir sem credencial nenhuma.
  const usuario = state.usuarios.find((u) => u.pessoa_id === pessoa_id && u.ativo);

  return {
    pessoa,
    vinculos,
    vinculo_ativo: vinculos.find((v) => v.ativo)?.vinculo,
    usuario,
    papel: usuario?.perfil,
    contratos: contratosDaPessoa(state, pessoa_id),
    lancamentos: lancamentosDaPessoa(state, pessoa_id),
    obras: obrasDaPessoa(state, pessoa_id),
  };
}

// ─── Rótulos ─────────────────────────────────────────────────────────────────

/** Os seis tipos da `RN-004`, por extenso. */
export const ROTULO_TIPO_VINCULO: Record<TipoVinculo, string> = {
  funcionario_proprio: 'Funcionário próprio',
  gerente_obras: 'Gerente de obras',
  assistente_gerenciamento: 'Assistente de gerenciamento',
  terceirizado: 'Terceirizado',
  administracao: 'Administração',
  financeiro: 'Financeiro',
};

export const ROTULO_PERFIL: Record<TipoPerfil, string> = {
  administracao: 'Administração',
  financeiro: 'Financeiro',
  gerente_obras: 'Gerente de obras',
  cliente: 'Cliente',
};

export const ROTULO_CICLO: Record<string, string> = {
  diario: 'Diário',
  semanal: 'Semanal',
  quinzenal: 'Quinzenal',
  mensal: 'Mensal',
  por_obra: 'Por obra',
};
