export interface Pessoa {
  id: string;
  nome: string;
  iniciais: string;
  funcao: string;
  ativo: boolean;
  desativado_em?: string;
}

export interface Vinculo {
  id: string;
  pessoa_id: string;
  tipo: 'funcionario_proprio' | 'terceirizado';
  ciclo_pagamento: 'diario' | 'semanal' | 'quinzenal' | 'mensal' | 'por_obra';
  valor_diaria_centavos?: number;
  valor_obra_centavos?: number;
  inicio: string;
  fim?: string;
}

export interface Obra {
  id: string;
  codigo: string;
  tipo: 'obra' | 'pequeno_servico';
  cliente: string;
  endereco: string;
  estado: 'aguardando_inicio' | 'em_andamento' | 'pausada' | 'concluida' | 'cancelada';
  inicio: string;
  previsao_termino: string;
  valor_contratado_centavos: number;
  adicionais_centavos: number;
  recebido_centavos: number;
  andamento_geral_pct: number;
}

export interface VinculoObra {
  id: string;
  obra_id: string;
  pessoa_id: string;
  papel: 'gerente' | 'assistente';
  inicio: string;
  fim?: string;
}

export interface Ambiente {
  id: string;
  obra_id: string;
  nome: string;
}

export interface ItemOrcamento {
  id: string;
  obra_id: string;
  ambiente_id: string;
  servico: string;
  quantidade: number;
  unidade: string;
  valor_centavos: number;
  executado: boolean;
  executado_em?: string;
  executado_por?: string;
}

export interface Planejamento {
  id: string;
  semana_inicio: string;
  pessoa_id: string;
  data: string;
  obra_id?: string;
  motivo_ausencia?: string;
  em_aberto?: boolean;
  recebe: boolean;
  adicional_centavos: number;
  estado: 'rascunho' | 'publicado';
  // Registro de alteração após publicação
  alterada?: boolean;
  alteracao_pendente?: boolean;
  alteracao_por?: string;
  alteracao_em?: string;
  valor_anterior?: string; // rótulo do valor antes da 1ª alteração — nunca sobrescrito
}

export interface Semana {
  inicio: string;
  estado: 'rascunho' | 'publicado';
}

export interface Diario {
  id: string;
  obra_id: string;
  data: string;
  estado: 'rascunho' | 'finalizado';
  texto: string[];
  houve_execucao?: boolean;
  motivo_sem_execucao?: string;
  fotos: string[];
  finalizado_por?: string;
  finalizado_em?: string;
  removidos_planejados?: { pessoa_id: string; motivo: string }[];
}

export interface Presenca {
  id: string;
  diario_id: string;
  obra_id: string;
  pessoa_id: string;
  data: string;
  periodo: 'dia_todo' | 'manha' | 'tarde';
}

export interface Diaria {
  id: string;
  pessoa_id: string;
  data: string;
  obra_que_arca_id?: string;
  valor_centavos: number;
  adicional_centavos: number;
  definido_por?: string;
}

export interface Fechamento {
  id: string;
  ciclo: 'semanal' | 'quinzenal' | 'mensal';
  pessoa_id: string;
  periodo_inicio: string;
  periodo_fim: string;
  estado: 'aberto' | 'fechado';
  total_centavos: number;
  fechado_por?: string;
}

export interface Lancamento {
  id: string;
  pessoa_id: string;
  tipo: 'adiantamento' | 'emprestimo' | 'estorno';
  valor_centavos: number;
  parcelas: number;
  parcelas_pagas: number;
  data: string;
}

export type TipoPerfil = 'administracao' | 'gerente_obras' | 'cliente';

export interface ItemForaEscopo {
  id: string;
  obra_id: string;
  descricao: string;
  quantidade: number;
  unidade: string;
  criado_em: string;
  criado_por?: string;
  estado: 'rascunho' | 'aprovado';
}

export interface AppState {
  pessoas: Pessoa[];
  vinculos: Vinculo[];
  obras: Obra[];
  vinculos_obra: VinculoObra[];
  ambientes: Ambiente[];
  itens_orcamento: ItemOrcamento[];
  itens_fora_escopo: ItemForaEscopo[];
  planejamento: Planejamento[];
  semanas: Semana[];
  diarios: Diario[];
  presencas: Presenca[];
  diarias: Diaria[];
  fechamentos: Fechamento[];
  lancamentos: Lancamento[];
}
