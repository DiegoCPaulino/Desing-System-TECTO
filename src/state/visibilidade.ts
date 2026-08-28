import type { AppState, ModalidadeFinanceira } from './types';

/**
 * FRONTEIRA DE VISIBILIDADE DO CLIENTE e totais derivados da Obra.
 *
 * Módulo de funções PURAS, sem dependência do store — como `fechamento.ts`.
 * A separação não é estética: é o que permite testar a `RN-136` sem subir o
 * zustand, e é o que impede que uma tela do Portal alcance o custo por
 * descuido de import.
 */

/**
 * O custo, recortado para o que a `RN-135` permite ao Cliente ver. O tipo não
 * tem `custo_centavos` nem margem: a `RN-136` proíbe, e deixar o campo no
 * objeto contando com a tela não exibi-lo é como o vazamento acontece.
 *
 * A nomenclatura do Portal troca "Direto do Cliente" por "Direto do
 * fornecedor" — decisão [SÓ PROTÓTIPO] em docs/DECISOES.md.
 */
export interface CustoVisivelAoCliente {
  id: string;
  fornecedor: string;
  descricao: string;
  modalidade_rotulo: string;
  valor_centavos: number;
  data: string;
  nota_numero?: string;
}

const ROTULO_MODALIDADE_CLIENTE: Record<ModalidadeFinanceira, string> = {
  repassado_com_margem: 'Serviço TECTO',
  reembolsavel: 'Reembolsável',
  direto_do_cliente: 'Direto do fornecedor',
};

/**
 * Custos de uma obra, já recortados para o Cliente. Use SEMPRE esta função no
 * Portal; ler `state.custos_obra` direto lá é o caminho para exibir margem.
 */
export function custosVisiveisAoCliente(state: AppState, obra_id: string): CustoVisivelAoCliente[] {
  return state.custos_obra
    .filter((c) => c.obra_id === obra_id)
    .map((c) => ({
      id: c.id,
      fornecedor: c.fornecedor,
      descricao: c.descricao,
      modalidade_rotulo: ROTULO_MODALIDADE_CLIENTE[c.modalidade],
      valor_centavos: c.valor_cobrado_centavos,
      data: c.data,
      nota_numero: c.nota_numero,
    }));
}

/**
 * Margem da obra. Interno — nunca chegue ao Portal (`RN-136`).
 *
 * Só **Repassado com margem** produz margem. As outras duas modalidades da
 * `RN-131` não são receita da TECTO e precisam ficar de fora:
 *
 * - **Reembolsável** — a TECTO paga e o Cliente devolve o mesmo valor. A
 *   diferença é zero por definição.
 * - **Direto do Cliente** — o Cliente paga o fornecedor e a TECTO só registra a
 *   nota. `custo_centavos` é zero porque a TECTO não desembolsou nada, e somar
 *   `cobrado − custo` aqui contaria a nota inteira como lucro.
 *
 * Esse era o defeito: na Obra 22 a margem dava R$57.200,00 em vez de
 * R$2.800,00, porque duas notas de material entravam inteiras na conta.
 */
export function margemDaObra(state: AppState, obra_id: string): number {
  return state.custos_obra
    .filter((c) => c.obra_id === obra_id && c.modalidade === 'repassado_com_margem')
    .reduce((soma, c) => soma + (c.valor_cobrado_centavos - c.custo_centavos), 0);
}

export function recebimentosDaObra(state: AppState, obra_id: string) {
  return state.recebimentos
    .filter((r) => r.obra_id === obra_id)
    .sort((a, b) => a.numero - b.numero);
}

export function adicionaisDaObra(state: AppState, obra_id: string) {
  return state.adicionais_obra.filter((a) => a.obra_id === obra_id);
}

/** Totais derivados dos recebimentos, em centavos. */
export function totaisDaObra(state: AppState, obra_id: string) {
  const parcelas = recebimentosDaObra(state, obra_id);
  const total = parcelas.reduce((s, r) => s + r.valor_centavos, 0);
  const recebido = parcelas.filter((r) => r.situacao === 'paga').reduce((s, r) => s + r.valor_centavos, 0);
  return { total_centavos: total, recebido_centavos: recebido, a_receber_centavos: total - recebido };
}
