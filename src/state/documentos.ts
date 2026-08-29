import type { AppState, CustoObra, Documento, Especialidade, TipoDocumento } from './types';

/**
 * DOCUMENTOS E NOTAS.
 *
 * Funções puras. A T6 precisa de duas listagens diferentes e é importante não
 * confundi-las:
 *
 * - **Documentos da obra** — projetos e contratos, filtráveis por
 *   especialidade. Vêm de `documentos`.
 * - **Notas do Financeiro da obra** — filtráveis por tipo de nota. Vêm de
 *   `custos_obra`, pelo campo `tipo_documento_id`, porque a nota é sempre a
 *   nota de um custo.
 */

/** Um documento com os nomes já resolvidos, para a tela não ter de cruzar. */
export interface DocumentoDescrito {
  documento: Documento;
  tipo?: TipoDocumento;
  especialidade?: Especialidade;
}

export function documentosDaObra(state: AppState, obra_id: string): DocumentoDescrito[] {
  return state.documentos
    .filter((d) => d.obra_id === obra_id)
    .sort((a, b) => b.data.localeCompare(a.data))
    .map((documento) => ({
      documento,
      tipo: state.tipos_documento.find((t) => t.id === documento.tipo_documento_id),
      especialidade: state.especialidades.find((e) => e.id === documento.especialidade_id),
    }));
}

/**
 * As especialidades que de fato aparecem nos documentos da obra, para o filtro
 * não oferecer opção vazia. Documentos sem especialidade ficam de fora daqui e
 * são alcançados pelo filtro "Todos".
 */
export function especialidadesComDocumento(
  state: AppState,
  obra_id: string
): Array<{ especialidade: Especialidade; quantidade: number }> {
  const contagem = new Map<string, number>();
  for (const { documento } of documentosDaObra(state, obra_id)) {
    if (!documento.especialidade_id) continue;
    contagem.set(documento.especialidade_id, (contagem.get(documento.especialidade_id) ?? 0) + 1);
  }
  return state.especialidades
    .filter((e) => contagem.has(e.id))
    .map((especialidade) => ({ especialidade, quantidade: contagem.get(especialidade.id)! }));
}

/** Documentos de uma especialidade. Sem filtro, devolve todos. */
export function documentosPorEspecialidade(
  state: AppState,
  obra_id: string,
  especialidade_id?: string
): DocumentoDescrito[] {
  const todos = documentosDaObra(state, obra_id);
  if (!especialidade_id) return todos;
  return todos.filter((d) => d.documento.especialidade_id === especialidade_id);
}

/** Documentos de um tipo — projeto, contrato. Sem filtro, devolve todos. */
export function documentosPorTipo(
  state: AppState,
  obra_id: string,
  tipo_documento_id?: string
): DocumentoDescrito[] {
  const todos = documentosDaObra(state, obra_id);
  if (!tipo_documento_id) return todos;
  return todos.filter((d) => d.documento.tipo_documento_id === tipo_documento_id);
}

// ─── Notas, que vivem no custo ───────────────────────────────────────────────

export interface NotaDescrita {
  custo: CustoObra;
  tipo?: TipoDocumento;
}

/** Os custos da obra que têm nota, com o tipo resolvido. */
export function notasDaObra(state: AppState, obra_id: string): NotaDescrita[] {
  return state.custos_obra
    .filter((c) => c.obra_id === obra_id && c.tipo_documento_id)
    .sort((a, b) => b.data.localeCompare(a.data))
    .map((custo) => ({
      custo,
      tipo: state.tipos_documento.find((t) => t.id === custo.tipo_documento_id),
    }));
}

/**
 * Os tipos de nota que aparecem nos custos da obra. São os filhos de
 * "Nota fiscal" na taxonomia — depósito de material, parte elétrica e afins.
 */
export function tiposDeNotaComCusto(
  state: AppState,
  obra_id: string
): Array<{ tipo: TipoDocumento; quantidade: number }> {
  const contagem = new Map<string, number>();
  for (const { custo } of notasDaObra(state, obra_id)) {
    if (!custo.tipo_documento_id) continue;
    contagem.set(custo.tipo_documento_id, (contagem.get(custo.tipo_documento_id) ?? 0) + 1);
  }
  return state.tipos_documento
    .filter((t) => contagem.has(t.id))
    .map((tipo) => ({ tipo, quantidade: contagem.get(tipo.id)! }));
}

export function notasPorTipo(
  state: AppState,
  obra_id: string,
  tipo_documento_id?: string
): NotaDescrita[] {
  const todas = notasDaObra(state, obra_id);
  if (!tipo_documento_id) return todas;
  return todas.filter((n) => n.custo.tipo_documento_id === tipo_documento_id);
}
