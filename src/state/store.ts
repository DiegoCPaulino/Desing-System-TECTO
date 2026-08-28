import { create } from 'zustand';
import type { AppState, Planejamento, Presenca, Diaria, Diario, Obra, TipoPerfil, ItemForaEscopo } from './types';
import DADOS_INICIAIS, { HOJE } from './dados-iniciais';
import { definirObraQueArca, executarFechamento } from './fechamento';

/**
 * Instante "agora" do protótipo: a data é sempre HOJE, a data de referência
 * fixa da maquete, e só a hora vem do relógio da máquina.
 *
 * `new Date().toISOString()` grava a data REAL do computador. Como a maquete
 * vive em 20/08/2026, isso fazia um diário de 20/08 exibir "finalizado em
 * 28/08" — quebrando o invariante de data coerente do AGENTS.md §4 e §6 no
 * meio da Cena 6.
 */
function agoraNoPrototipo(): string {
  const hora = new Date().toTimeString().slice(0, 8);
  return `${HOJE}T${hora}`;
}

/** Descreve o novo conteúdo de uma célula do planejamento */
export type CelulaValor =
  | { tipo: 'alocada'; obra_id: string; adicional_centavos?: number }
  | { tipo: 'ausencia'; motivo_ausencia: string; recebe: boolean }
  | { tipo: 'aberto' }
  | { tipo: 'vazio' }
  | { tipo: 'limpar' };

type Store = AppState & {
  perfil_ativo: TipoPerfil | null;
  setPerfil: (perfil: TipoPerfil | null) => void;
  resetarDados: () => void;
  marcarItem: (args: { item_id: string; executado: boolean; pessoa_id: string }) => void;
  marcarTodosItensAmbiente: (args: { ambiente_id: string; executado: boolean; pessoa_id: string }) => void;
  adicionarItemForaEscopo: (args: { obra_id: string; descricao: string; quantidade: number; unidade: string; criado_por: string }) => void;
  gravarCelula: (args: {
    pessoa_id: string;
    data: string;
    semana_inicio: string;
    valor: CelulaValor;
    registrarAlteracao: boolean;
    alterado_por?: string;
  }) => void;
  publicarSemana: (semana_inicio: string) => void;
  salvarAlteracoes: (semana_inicio: string) => void;
  finalizarDiario: (args: {
    diario_id: string;
    obra_id: string;
    data: string;
    texto_linhas: string[];
    fotos: string[];
    confirmados: Array<{ pessoa_id: string; periodo: 'dia_todo' | 'manha' | 'tarde' }>;
    removidos_planejados: Array<{ pessoa_id: string; motivo: string }>;
    finalizado_por: string;
    houve_execucao: boolean;
    motivo_sem_execucao?: string;
  }) => void;
  /** Devolvem a mensagem de erro, ou `undefined` quando deu certo. */
  definirObraQueArcaNaDiaria: (args: {
    diaria_id: string;
    obra_id: string;
    definido_por: string;
  }) => string | undefined;
  executarFechamentoDoCiclo: (args: {
    ciclo_id: string;
    fechado_por: string;
    ajustes?: Record<string, number>;
  }) => string | undefined;
};

export const useStore = create<Store>(() => ({
  ...DADOS_INICIAIS,

  perfil_ativo: null,
  setPerfil: (perfil) => useStore.setState({ perfil_ativo: perfil }),

  resetarDados: () => {
    useStore.setState({ ...DADOS_INICIAIS });
  },

  marcarItem: ({ item_id, executado, pessoa_id }) => {
    const agora = HOJE; // executado_em e data pura no seed, nao timestamp
    useStore.setState((s) => ({
      itens_orcamento: s.itens_orcamento.map((item) =>
        item.id === item_id
          ? { ...item, executado, executado_em: executado ? agora : undefined, executado_por: executado ? pessoa_id : undefined }
          : item
      ),
    }));
  },

  marcarTodosItensAmbiente: ({ ambiente_id, executado, pessoa_id }) => {
    const agora = HOJE; // idem marcarItem
    useStore.setState((s) => ({
      itens_orcamento: s.itens_orcamento.map((item) =>
        item.ambiente_id === ambiente_id
          ? { ...item, executado, executado_em: executado ? agora : undefined, executado_por: executado ? pessoa_id : undefined }
          : item
      ),
    }));
  },

  adicionarItemForaEscopo: ({ obra_id, descricao, quantidade, unidade, criado_por }) => {
    const id = `fe_${Date.now()}`;
    const agora = agoraNoPrototipo();
    const novoItem: ItemForaEscopo = { id, obra_id, descricao, quantidade, unidade, criado_em: agora, criado_por, estado: 'rascunho' };
    useStore.setState((s) => ({ itens_fora_escopo: [...s.itens_fora_escopo, novoItem] }));
  },

  gravarCelula: ({ pessoa_id, data, semana_inicio, valor, registrarAlteracao, alterado_por }) => {
    useStore.setState((s) => {
      const anterior = s.planejamento.find((p) => p.pessoa_id === pessoa_id && p.data === data);
      const rotuloAnterior = rotuloCelula(s, anterior);
      const estadoSemana = semanaEstado(s, semana_inicio);

      // Remoção limpa numa semana em rascunho: apaga a célula.
      if (valor.tipo === 'limpar' && !registrarAlteracao) {
        return { planejamento: s.planejamento.filter((p) => p !== anterior) };
      }

      const base: Planejamento = {
        id: anterior?.id ?? `pl_${pessoa_id}_${data}`,
        semana_inicio,
        pessoa_id,
        data,
        estado: anterior?.estado ?? estadoSemana,
        recebe: false,
        adicional_centavos: 0,
        obra_id: undefined,
        motivo_ausencia: undefined,
        em_aberto: undefined,
        // preserva o histórico de alteração já existente
        alterada: anterior?.alterada,
        alteracao_pendente: anterior?.alteracao_pendente,
        alteracao_por: anterior?.alteracao_por,
        alteracao_em: anterior?.alteracao_em,
        valor_anterior: anterior?.valor_anterior,
      };

      if (valor.tipo === 'alocada') {
        base.obra_id = valor.obra_id;
        base.recebe = true;
        base.adicional_centavos = valor.adicional_centavos ?? 0;
      } else if (valor.tipo === 'ausencia') {
        base.motivo_ausencia = valor.motivo_ausencia;
        base.recebe = valor.recebe;
      } else if (valor.tipo === 'aberto') {
        base.em_aberto = true;
      }
      // 'vazio' e 'limpar' (em semana publicada) mantêm a célula sem conteúdo.

      if (registrarAlteracao) {
        base.alterada = true;
        base.alteracao_pendente = true;
        base.alteracao_por = alterado_por;
        base.alteracao_em = agoraNoPrototipo();
        // o valor anterior nunca é sobrescrito
        base.valor_anterior = anterior?.valor_anterior ?? rotuloAnterior;
      }

      const outras = s.planejamento.filter((p) => p !== anterior);
      return { planejamento: [...outras, base] };
    });
  },

  publicarSemana: (semana_inicio) => {
    useStore.setState((s) => ({
      semanas: s.semanas.map((w) => (w.inicio === semana_inicio ? { ...w, estado: 'publicado' } : w)),
      planejamento: s.planejamento.map((p) =>
        p.semana_inicio === semana_inicio ? { ...p, estado: 'publicado' } : p
      ),
    }));
  },

  salvarAlteracoes: (semana_inicio) => {
    useStore.setState((s) => ({
      planejamento: s.planejamento.map((p) =>
        p.semana_inicio === semana_inicio && p.alteracao_pendente
          ? { ...p, alteracao_pendente: false }
          : p
      ),
    }));
  },

  finalizarDiario: ({ diario_id, obra_id, data, texto_linhas, fotos, confirmados, removidos_planejados, finalizado_por, houve_execucao, motivo_sem_execucao }) => {
    useStore.setState((s) => {
      const agora = agoraNoPrototipo();

      const diarioExistente = s.diarios.find((d) => d.id === diario_id);
      const diarioFinalizado: Diario = {
        id: diario_id,
        obra_id,
        data,
        estado: 'finalizado',
        texto: texto_linhas,
        fotos,
        finalizado_por,
        finalizado_em: agora,
        removidos_planejados,
        houve_execucao,
        motivo_sem_execucao,
      };
      const updatedDiarios = diarioExistente
        ? s.diarios.map((d) => (d.id === diario_id ? diarioFinalizado : d))
        : [...s.diarios, diarioFinalizado];

      // Remove old presencas for this diary, keep others
      const outrasPresencas = s.presencas.filter((p) => p.diario_id !== diario_id);

      const novasPresencas: Presenca[] = confirmados.map((c) => ({
        id: `pr_fin_${diario_id}_${c.pessoa_id}`,
        diario_id,
        obra_id,
        pessoa_id: c.pessoa_id,
        data,
        periodo: c.periodo,
      }));

      // Remove existing diarias for these people on this date
      const pessoasIds = new Set(confirmados.map((c) => c.pessoa_id));
      const outrasDialias = s.diarias.filter((d) => !(pessoasIds.has(d.pessoa_id) && d.data === data));

      const novasDiarias: Diaria[] = confirmados.map((c) => {
        const vinculo = s.vinculos.find((v) => v.pessoa_id === c.pessoa_id && !v.fim);
        const valorDiaria = vinculo?.valor_diaria_centavos ?? 0;
        // Check if person already has presença in another obra today
        const emOutraObra = s.presencas.some(
          (p) => p.pessoa_id === c.pessoa_id && p.data === data && p.obra_id !== obra_id && p.diario_id !== diario_id
        );
        return {
          id: `di_fin_${diario_id}_${c.pessoa_id}`,
          pessoa_id: c.pessoa_id,
          data,
          obra_que_arca_id: emOutraObra ? undefined : obra_id,
          valor_centavos: valorDiaria,
          adicional_centavos: 0,
          definido_por: finalizado_por,
        };
      });

      return {
        diarios: updatedDiarios,
        presencas: [...outrasPresencas, ...novasPresencas],
        diarias: [...outrasDialias, ...novasDiarias],
      };
    });
  },

  // As duas mutações do Fechamento apenas aplicam o que as funções puras de
  // `fechamento.ts` decidiram. Nenhuma regra de cálculo mora aqui.
  definirObraQueArcaNaDiaria: ({ diaria_id, obra_id, definido_por }) => {
    const resultado = definirObraQueArca(useStore.getState(), diaria_id, obra_id, definido_por);
    if (resultado.erro) return resultado.erro;
    useStore.setState({ diarias: resultado.diarias });
    return undefined;
  },

  executarFechamentoDoCiclo: ({ ciclo_id, fechado_por, ajustes }) => {
    const resultado = executarFechamento(useStore.getState(), ciclo_id, fechado_por, ajustes);
    if (!resultado.ok) return resultado.erro;
    useStore.setState({ fechamentos: resultado.fechamentos!, parcelas: resultado.parcelas! });
    return undefined;
  },
}));

// ─── Selectors ────────────────────────────────────────────────────────────────

export function formatarReais(centavos: number): string {
  return 'R$ ' + (centavos / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function calcularPctAmbiente(state: AppState, ambiente_id: string): number {
  const itens = state.itens_orcamento.filter(i => i.ambiente_id === ambiente_id);
  if (!itens.length) return 0;
  return Math.round((itens.filter(i => i.executado).length / itens.length) * 100);
}

export function calcularPctObra(state: AppState, obra_id: string): number {
  const itens = state.itens_orcamento.filter(i => i.obra_id === obra_id);
  if (!itens.length) return 0;
  return Math.round((itens.filter(i => i.executado).length / itens.length) * 100);
}

export function getPessoaNome(state: AppState, pessoa_id: string): string {
  return state.pessoas.find(p => p.id === pessoa_id)?.nome ?? '—';
}

export function getPessoaIniciais(state: AppState, pessoa_id: string): string {
  return state.pessoas.find(p => p.id === pessoa_id)?.iniciais ?? '?';
}

/** Slug de rota derivado do código da obra — "Obra 22 - MCL" → "22-mcl" */
export function obraSlug(obra: Obra): string {
  const [primeira, sigla] = obra.codigo.split(' - ');
  const numero = primeira.match(/\d+/)?.[0] ?? '';
  return `${numero}-${(sigla ?? '').toLowerCase()}`;
}

export function obraPorSlug(state: AppState, slug: string): Obra | undefined {
  return state.obras.find((o) => obraSlug(o) === slug);
}

/** Obras às quais o Gerente de Obras (perfil de demonstração) está vinculado como gerente */
export function gerenteTemAcessoAObra(state: AppState, obra_id: string): boolean {
  return state.vinculos_obra.some(
    (v) => v.obra_id === obra_id && v.pessoa_id === GERENTE_ID && v.papel === 'gerente' && !v.fim
  );
}

export function getGerenteDaObra(state: AppState, obra_id: string) {
  const vo = state.vinculos_obra.find(v => v.obra_id === obra_id && v.papel === 'gerente' && !v.fim);
  if (!vo) return null;
  return state.pessoas.find(p => p.id === vo.pessoa_id) ?? null;
}

/** Pessoas com presença numa data específica */
export function presencasNaData(state: AppState, data: string) {
  return state.presencas.filter(p => p.data === data);
}

/** Calcula indicadores do painel */
export function calcularIndicadores(state: AppState) {
  const presencasHoje = presencasNaData(state, HOJE);
  const pessoasEmCampo = new Set(presencasHoje.map(p => p.pessoa_id)).size;

  const obrasEmAndamento = state.obras.filter(o => o.estado === 'em_andamento');
  let diariosPendentes = 0;
  const ontem = new Date(HOJE);
  ontem.setDate(ontem.getDate() - 1);
  const ontemStr = ontem.toISOString().split('T')[0];

  for (const obra of obrasEmAndamento) {
    const diarioRecente = state.diarios.find(
      d => d.obra_id === obra.id && d.estado === 'finalizado' && (d.data === HOJE || d.data === ontemStr)
    );
    if (!diarioRecente) diariosPendentes++;
  }

  // Fechamentos mais próximos
  const abertos = state.fechamentos.filter(f => f.estado === 'aberto');
  const maisProximo = abertos.sort((a, b) => a.periodo_fim.localeCompare(b.periodo_fim))[0];
  const totalAFechar = maisProximo
    ? abertos.filter(f => f.periodo_fim === maisProximo.periodo_fim).reduce((s, f) => s + f.total_centavos, 0)
    : 0;

  const obrasAtivas = obrasEmAndamento.length;

  return { pessoasEmCampo, diariosPendentes, totalAFechar, obrasAtivas };
}

/** Gera lista de pendências "Precisa da sua atenção" */
export function calcularPendencias(state: AppState) {
  const pendencias: { id: string; tipo: string; descricao: string; detalhe?: string }[] = [];

  // 1. Divergências: planejado X ≠ presença Y
  const presencas = state.presencas;
  const planejamentos = state.planejamento.filter(pl => pl.estado === 'publicado');

  for (const pl of planejamentos) {
    if (!pl.obra_id) continue;
    const presencaDoDia = presencas.filter(pr => pr.pessoa_id === pl.pessoa_id && pr.data === pl.data);
    if (!presencaDoDia.length) continue;
    const estavaNaObraErrada = presencaDoDia.every(pr => pr.obra_id !== pl.obra_id);
    if (estavaNaObraErrada) {
      const pessoa = state.pessoas.find(p => p.id === pl.pessoa_id);
      const obraPlaneada = state.obras.find(o => o.id === pl.obra_id);
      const obraPresente = state.obras.find(o => o.id === presencaDoDia[0].obra_id);
      pendencias.push({
        id: `div_${pl.id}`,
        tipo: 'divergencia',
        descricao: `Divergência: ${pessoa?.nome ?? pl.pessoa_id}`,
        detalhe: `Planejado em ${obraPlaneada?.codigo ?? pl.obra_id}, presente em ${obraPresente?.codigo ?? presencaDoDia[0].obra_id} em ${formatarData(pl.data)}`,
      });
    }
  }

  // 2. Rateios pendentes: diárias sem obra_que_arca_id
  for (const d of state.diarias) {
    if (!d.obra_que_arca_id) {
      const pessoa = state.pessoas.find(p => p.id === d.pessoa_id);
      pendencias.push({
        id: `rat_${d.id}`,
        tipo: 'rateio',
        descricao: `Rateio pendente: ${pessoa?.nome ?? d.pessoa_id}`,
        detalhe: `Diária de ${formatarData(d.data)} sem obra definida`,
      });
    }
  }

  // 3. Diários faltando
  const ontem = new Date(HOJE);
  ontem.setDate(ontem.getDate() - 1);
  const ontemStr = ontem.toISOString().split('T')[0];
  const obrasEmAndamento = state.obras.filter(o => o.estado === 'em_andamento');
  for (const obra of obrasEmAndamento) {
    const diarioRecente = state.diarios.find(
      d => d.obra_id === obra.id && d.estado === 'finalizado' && (d.data === HOJE || d.data === ontemStr)
    );
    if (!diarioRecente) {
      pendencias.push({
        id: `diar_${obra.id}`,
        tipo: 'diario',
        descricao: `Diário faltando: ${obra.codigo}`,
        detalhe: `Nenhum diário finalizado em ${formatarData(ontemStr)} ou ${formatarData(HOJE)}`,
      });
    }
  }

  // 4. Decisões de pagamento pendentes (removidos durante diário)
  for (const d of state.diarios) {
    if (!d.removidos_planejados?.length) continue;
    for (const rem of d.removidos_planejados) {
      const pessoa = state.pessoas.find((p) => p.id === rem.pessoa_id);
      pendencias.push({
        id: `pag_${d.id}_${rem.pessoa_id}`,
        tipo: 'decisao_pagamento',
        descricao: `Decisão de pagamento: ${pessoa?.nome ?? rem.pessoa_id}`,
        detalhe: `${rem.motivo} — dia ${formatarData(d.data)}`,
      });
    }
  }

  // 5. Fechamentos próximos (nos próximos 3 dias)
  const limite = new Date(HOJE);
  limite.setDate(limite.getDate() + 3);
  const limiteStr = limite.toISOString().split('T')[0];
  const fechamentosProximos = state.fechamentos.filter(
    f => f.estado === 'aberto' && f.periodo_fim <= limiteStr
  );
  const datesVistas = new Set<string>();
  for (const fc of fechamentosProximos) {
    if (!datesVistas.has(fc.ciclo + fc.periodo_fim)) {
      datesVistas.add(fc.ciclo + fc.periodo_fim);
      const qtd = fechamentosProximos.filter(f => f.ciclo === fc.ciclo && f.periodo_fim === fc.periodo_fim).length;
      pendencias.push({
        id: `fech_${fc.ciclo}_${fc.periodo_fim}`,
        tipo: 'fechamento',
        descricao: `Fechamento ${fc.ciclo} em ${formatarData(fc.periodo_fim)}`,
        detalhe: `${qtd} pessoa${qtd > 1 ? 's' : ''} aguardando fechamento`,
      });
    }
  }

  return pendencias;
}

function formatarData(data: string): string {
  const [y, m, d] = data.split('-');
  return `${d}/${m}/${y}`;
}

// ─── Planejamento ───────────────────────────────────────────────────────────

/** Gerente de Obras assumido no perfil "Gerente de Obras" */
export const GERENTE_ID = 'p04'; // Rafael Duarte

export type TipoCelula = 'alocada' | 'ausencia' | 'aberto' | 'vazio';

export function tipoCelula(cel?: Planejamento): TipoCelula {
  if (!cel) return 'vazio';
  if (cel.obra_id) return 'alocada';
  if (cel.motivo_ausencia) return 'ausencia';
  if (cel.em_aberto) return 'aberto';
  return 'vazio';
}

export function valorDiaria(state: AppState, pessoa_id: string): number {
  const v = state.vinculos.find((x) => x.pessoa_id === pessoa_id && !x.fim);
  return v?.valor_diaria_centavos ?? 0;
}

export function semanaEstado(state: AppState, semana_inicio: string): 'rascunho' | 'publicado' {
  return state.semanas.find((w) => w.inicio === semana_inicio)?.estado ?? 'rascunho';
}

export function semanaTemAlteracoesPendentes(state: AppState, semana_inicio: string): boolean {
  return state.planejamento.some((p) => p.semana_inicio === semana_inicio && p.alteracao_pendente);
}

/** Rótulo legível de uma célula — usado no histórico de alteração */
export function rotuloCelula(state: AppState, cel?: Planejamento): string {
  const tipo = tipoCelula(cel);
  if (tipo === 'alocada') {
    const obra = state.obras.find((o) => o.id === cel!.obra_id);
    return obra?.codigo ?? 'Obra';
  }
  if (tipo === 'ausencia') {
    return `Ausência — ${cel!.motivo_ausencia} (${cel!.recebe ? 'recebe' : 'não recebe'})`;
  }
  if (tipo === 'aberto') return 'Em aberto';
  return 'Vazio';
}

export function getCelula(state: AppState, pessoa_id: string, data: string): Planejamento | undefined {
  return state.planejamento.find((p) => p.pessoa_id === pessoa_id && p.data === data);
}

/** Obras que ainda aceitam alocação (não concluídas / não canceladas) */
export function obrasNaoConcluidas(state: AppState) {
  return state.obras.filter((o) => o.estado !== 'concluida' && o.estado !== 'cancelada');
}

/** Pessoas visíveis na grade conforme o perfil */
export function pessoasDaGrade(state: AppState, semana_inicio: string, comoGerente: boolean): string[] {
  const dias = diasDaSemana(semana_inicio);
  if (!comoGerente) {
    // Administração: elenco de campo ativo (exclui sócios e financeiro)
    return state.pessoas
      .filter((p) => p.ativo && !['p01', 'p02', 'p03'].includes(p.id))
      .map((p) => p.id);
  }
  // Gerente: pessoas alocadas nas obras que ele gerencia + qualquer pessoa em aberto
  const obrasDoGerente = state.vinculos_obra
    .filter((v) => v.pessoa_id === GERENTE_ID && v.papel === 'gerente' && !v.fim)
    .map((v) => v.obra_id);
  const ids = new Set<string>();
  for (const p of state.planejamento) {
    if (p.semana_inicio !== semana_inicio) continue;
    if (!dias.includes(p.data)) continue;
    if (p.obra_id && obrasDoGerente.includes(p.obra_id)) ids.add(p.pessoa_id);
    if (p.em_aberto) ids.add(p.pessoa_id);
  }
  ids.add(GERENTE_ID);
  // Ordena conforme a lista de pessoas
  return state.pessoas.filter((p) => ids.has(p.id)).map((p) => p.id);
}

export function diasDaSemana(semana_inicio: string): string[] {
  const [y, m, d] = semana_inicio.split('-').map(Number);
  const dias: string[] = [];
  for (let i = 0; i < 6; i++) {
    const dt = new Date(Date.UTC(y, m - 1, d + i));
    dias.push(dt.toISOString().split('T')[0]);
  }
  return dias; // segunda … sábado
}

/** Faixa de resumo da semana — recalculada a cada ação */
export function resumoSemana(state: AppState, semana_inicio: string, roster: string[]) {
  const dias = diasDaSemana(semana_inicio);
  const rosterSet = new Set(roster);
  const celulas = state.planejamento.filter(
    (p) => p.semana_inicio === semana_inicio && dias.includes(p.data) && rosterSet.has(p.pessoa_id)
  );

  const naGrade = new Set<string>();
  const emAberto = new Set<string>();
  let ausencias = 0;
  let custo = 0;

  for (const cel of celulas) {
    const tipo = tipoCelula(cel);
    if (tipo === 'alocada') {
      naGrade.add(cel.pessoa_id);
      custo += valorDiaria(state, cel.pessoa_id) + cel.adicional_centavos;
    } else if (tipo === 'aberto') {
      emAberto.add(cel.pessoa_id);
    } else if (tipo === 'ausencia') {
      ausencias++;
      if (cel.recebe) custo += valorDiaria(state, cel.pessoa_id);
    }
  }

  return {
    pessoasNaGrade: naGrade.size,
    emAberto: emAberto.size,
    ausencias,
    custoPrevisto: custo,
  };
}

/** Quantas pessoas serão notificadas ao publicar/alterar a semana */
export function pessoasNaSemana(state: AppState, semana_inicio: string): number {
  const ids = new Set(state.planejamento.filter((p) => p.semana_inicio === semana_inicio).map((p) => p.pessoa_id));
  return ids.size;
}
