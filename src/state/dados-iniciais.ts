import type { AppState } from './types';

// Data de referência: quinta-feira, 20/08/2026
export const HOJE = '2026-08-20';
export const ONTEM = '2026-08-19';
export const SEMANA_INICIO = '2026-08-17'; // segunda-feira
export const SEMANA_2_INICIO = '2026-08-24'; // segunda-feira (próxima semana)

// Toda mídia do seed segue este padrão de URL. A função existe para que a URL
// gravada em `midias` seja byte a byte a mesma que está em `Diario.fotos` — as
// duas descrevem a mesma foto, e divergir aqui criaria duas verdades.
const FOTO = (id: string) => `https://images.unsplash.com/${id}?w=280&h=280&fit=crop&auto=format`;

const DADOS: AppState = {
  // ─── PESSOAS ──────────────────────────────────────────────────────────────
  pessoas: [
    { id: 'p01', nome: 'Pedro Almeida',       iniciais: 'PA', funcao: 'Sócio',                          ativo: true },
    { id: 'p02', nome: 'Fernando Nunes',      iniciais: 'FN', funcao: 'Sócio',                          ativo: true },
    { id: 'p03', nome: 'Fernanda Sousa',      iniciais: 'FS', funcao: 'Analista Financeiro',             ativo: true },
    { id: 'p04', nome: 'Rafael Duarte',       iniciais: 'RD', funcao: 'Gerente de Obras',               ativo: true },
    { id: 'p05', nome: 'Sofia Monteiro',      iniciais: 'SM', funcao: 'Gerente de Obras',               ativo: true },
    { id: 'p06', nome: 'Ana Carvalho',        iniciais: 'AC', funcao: 'Assistente de Gerenciamento',    ativo: true },
    { id: 'p07', nome: 'Marcos Bittencourt',  iniciais: 'MB', funcao: 'Pedreiro',                       ativo: true },
    { id: 'p08', nome: 'Jonas Ribeiro',       iniciais: 'JR', funcao: 'Ajudante',                       ativo: true },
    { id: 'p09', nome: 'Cleber Matos',        iniciais: 'CM', funcao: 'Eletricista',                    ativo: true },
    { id: 'p10', nome: 'Wagner Lopes',        iniciais: 'WL', funcao: 'Pintor',                         ativo: false, desativado_em: '2026-06-12' },
    // 20 trabalhadores de campo (14 ativos + 6 inativos = completa 30 total / 24 ativos)
    { id: 'p11', nome: 'André Ferreira',      iniciais: 'AF', funcao: 'Pedreiro',        ativo: true },
    { id: 'p12', nome: 'Bruno Santana',       iniciais: 'BS', funcao: 'Ajudante',        ativo: true },
    { id: 'p13', nome: 'Carlos Pinto',        iniciais: 'CP', funcao: 'Azulejista',      ativo: true },
    { id: 'p14', nome: 'Diego Campos',        iniciais: 'DC', funcao: 'Pintor',          ativo: true },
    { id: 'p15', nome: 'Eduardo Lima',        iniciais: 'EL', funcao: 'Gesseiro',        ativo: true },
    { id: 'p16', nome: 'Felipe Martins',      iniciais: 'FM', funcao: 'Ajudante',        ativo: true },
    { id: 'p17', nome: 'Gustavo Rocha',       iniciais: 'GR', funcao: 'Pedreiro',        ativo: true },
    { id: 'p18', nome: 'Henrique Costa',      iniciais: 'HC', funcao: 'Ajudante',        ativo: true },
    { id: 'p19', nome: 'Igor Souza',          iniciais: 'IS', funcao: 'Pintor',          ativo: true },
    { id: 'p20', nome: 'João Oliveira',       iniciais: 'JO', funcao: 'Pedreiro',        ativo: true },
    { id: 'p21', nome: 'Lucas Melo',          iniciais: 'LM', funcao: 'Ajudante',        ativo: true },
    { id: 'p22', nome: 'Mateus Silva',        iniciais: 'MS', funcao: 'Azulejista',      ativo: true },
    { id: 'p23', nome: 'Nicolas Andrade',     iniciais: 'NA', funcao: 'Gesseiro',        ativo: true },
    { id: 'p24', nome: 'Paulo Ramos',         iniciais: 'PR', funcao: 'Ajudante',        ativo: true },
    // 6 inativos
    { id: 'p25', nome: 'Ricardo Teles',       iniciais: 'RT', funcao: 'Pedreiro',        ativo: false, desativado_em: '2026-05-30' },
    { id: 'p26', nome: 'Sérgio Barbosa',      iniciais: 'SB', funcao: 'Ajudante',        ativo: false, desativado_em: '2026-04-15' },
    { id: 'p27', nome: 'Thiago Nogueira',     iniciais: 'TN', funcao: 'Pintor',          ativo: false, desativado_em: '2026-07-01' },
    { id: 'p28', nome: 'Ubirajara Santos',    iniciais: 'US', funcao: 'Gesseiro',        ativo: false, desativado_em: '2026-03-22' },
    { id: 'p29', nome: 'Vinícius Alves',      iniciais: 'VA', funcao: 'Ajudante',        ativo: false, desativado_em: '2026-06-28' },
    { id: 'p30', nome: 'Welton Correia',      iniciais: 'WC', funcao: 'Pedreiro',        ativo: false, desativado_em: '2026-07-20' },
  ],

  // ─── VÍNCULOS ─────────────────────────────────────────────────────────────
  vinculos: [
    { id: 'v07', pessoa_id: 'p07', tipo: 'funcionario_proprio', ciclo_pagamento: 'semanal',  valor_diaria_centavos: 25000, inicio: '2025-03-01' },
    { id: 'v08', pessoa_id: 'p08', tipo: 'funcionario_proprio', ciclo_pagamento: 'semanal',  valor_diaria_centavos: 18000, inicio: '2025-03-01' },
    { id: 'v09', pessoa_id: 'p09', tipo: 'terceirizado',        ciclo_pagamento: 'por_obra', valor_obra_centavos: 320000, inicio: '2026-05-01' },
    ...['p11','p12','p13','p14','p15','p16','p17','p18','p19','p20','p21','p22','p23','p24'].map((id, i) => ({
      id: `v${id}`,
      pessoa_id: id,
      tipo: 'funcionario_proprio' as const,
      ciclo_pagamento: 'semanal' as const,
      valor_diaria_centavos: 20000 + (i % 3) * 3000,
      inicio: '2025-01-01',
    })),
  ],

  // ─── OBRAS ────────────────────────────────────────────────────────────────
  obras: [
    {
      id: 'o01',
      codigo: 'Obra 22 - MCL',
      tipo: 'obra',
      cliente: 'Mariana Costa Lima',
      endereco: 'Rua Joaquim Floriano, 820 — Itaim Bibi, São Paulo',
      estado: 'em_andamento',
      inicio: '2026-04-14',
      previsao_termino: '2026-09-30',
      valor_contratado_centavos: 14832000,
      adicionais_centavos: 1248000,
      recebido_centavos: 9648000,
      andamento_geral_pct: 54,
    },
    {
      id: 'o02',
      codigo: 'Obra 18 - GFR',
      tipo: 'obra',
      cliente: 'Guilherme F. Rocha',
      endereco: 'Al. Itu, 450 — Pinheiros, São Paulo',
      estado: 'em_andamento',
      inicio: '2026-05-02',
      previsao_termino: '2026-10-15',
      valor_contratado_centavos: 9800000,
      adicionais_centavos: 0,
      recebido_centavos: 4900000,
      andamento_geral_pct: 41,
    },
    {
      id: 'o03',
      codigo: 'Obra 25 - ATB',
      tipo: 'obra',
      cliente: 'Antônia T. Bicalho',
      endereco: 'Av. Ibirapuera, 2100 — Moema, São Paulo',
      estado: 'pausada',
      inicio: '2026-06-10',
      previsao_termino: '2026-12-20',
      valor_contratado_centavos: 7400000,
      adicionais_centavos: 0,
      recebido_centavos: 1700000,
      andamento_geral_pct: 23,
    },
    {
      id: 'o04',
      codigo: 'Obra 31 - MBP',
      tipo: 'obra',
      cliente: 'Miguel Barros Pinto',
      endereco: 'R. Harmonia, 312 — Vila Madalena, São Paulo',
      estado: 'aguardando_inicio',
      inicio: '2026-09-01',
      previsao_termino: '2027-03-31',
      valor_contratado_centavos: 18600000,
      adicionais_centavos: 0,
      recebido_centavos: 0,
      andamento_geral_pct: 0,
    },
    {
      id: 'o05',
      codigo: 'Serviço 04 - LSM',
      tipo: 'pequeno_servico',
      cliente: 'Luciana S. Medeiros',
      endereco: 'R. Oscar Freire, 900 — Jardins, São Paulo',
      estado: 'em_andamento',
      inicio: '2026-07-14',
      previsao_termino: '2026-08-29',
      valor_contratado_centavos: 2800000,
      adicionais_centavos: 0,
      recebido_centavos: 2380000,
      andamento_geral_pct: 85,
    },
  ],

  // ─── VÍNCULOS DE OBRA ─────────────────────────────────────────────────────
  vinculos_obra: [
    { id: 'vo01', obra_id: 'o01', pessoa_id: 'p04', papel: 'gerente',    inicio: '2026-04-14' },
    { id: 'vo02', obra_id: 'o01', pessoa_id: 'p06', papel: 'assistente', inicio: '2026-04-14' },
    { id: 'vo03', obra_id: 'o02', pessoa_id: 'p05', papel: 'gerente',    inicio: '2026-05-02' },
    { id: 'vo04', obra_id: 'o03', pessoa_id: 'p06', papel: 'gerente',    inicio: '2026-06-10' },
    { id: 'vo05', obra_id: 'o04', pessoa_id: 'p04', papel: 'gerente',    inicio: '2026-08-01' },
    { id: 'vo06', obra_id: 'o05', pessoa_id: 'p05', papel: 'gerente',    inicio: '2026-07-14' },
  ],

  // ─── AMBIENTES ────────────────────────────────────────────────────────────
  ambientes: [
    { id: 'a01', obra_id: 'o01', nome: 'Suíte Master' },
    { id: 'a02', obra_id: 'o01', nome: 'Banheiro da Suíte' },
    { id: 'a03', obra_id: 'o01', nome: 'Cozinha' },
    { id: 'a04', obra_id: 'o01', nome: 'Sala' },
    { id: 'a05', obra_id: 'o01', nome: 'Lavabo' },
  ],

  // ─── ITENS DE ORÇAMENTO ───────────────────────────────────────────────────
  // Suíte Master: 5 itens, 5 executados → 100%
  // Banheiro da Suíte: 5 itens, 4 executados → 80%
  // Cozinha: 11 itens, 5 executados → 45.5% ≈ 45%
  // Sala: 5 itens, 1 executado → 20%
  // Lavabo: 4 itens, 0 executados → 0%
  // Total TECTO: 30 itens, 15 executados → 50%
  itens_orcamento: [
    // Suíte Master — 5/5 executados
    { id: 'i01', obra_id: 'o01', ambiente_id: 'a01', servico: 'Demolição de banheiro existente',   quantidade: 1, unidade: 'vb', valor_centavos: 180000, executado: true,  executado_em: '2026-04-28', executado_por: 'p07' },
    { id: 'i02', obra_id: 'o01', ambiente_id: 'a01', servico: 'Instalação de box em vidro',        quantidade: 1, unidade: 'vb', valor_centavos: 240000, executado: true,  executado_em: '2026-05-10', executado_por: 'p07' },
    { id: 'i03', obra_id: 'o01', ambiente_id: 'a01', servico: 'Assentamento de porcelanato',       quantidade: 18, unidade: 'm²', valor_centavos: 290000, executado: true, executado_em: '2026-05-22', executado_por: 'p07' },
    { id: 'i04', obra_id: 'o01', ambiente_id: 'a01', servico: 'Pintura de teto e paredes',         quantidade: 1, unidade: 'vb', valor_centavos: 120000, executado: true,  executado_em: '2026-06-01', executado_por: 'p14' },
    { id: 'i05', obra_id: 'o01', ambiente_id: 'a01', servico: 'Instalação de luminárias',          quantidade: 4, unidade: 'un', valor_centavos: 95000,  executado: true,  executado_em: '2026-06-05', executado_por: 'p09' },
    // Banheiro da Suíte — 4/5 executados
    { id: 'i06', obra_id: 'o01', ambiente_id: 'a02', servico: 'Demolição de azulejo',              quantidade: 1, unidade: 'vb', valor_centavos: 90000,  executado: true,  executado_em: '2026-06-10', executado_por: 'p07' },
    { id: 'i07', obra_id: 'o01', ambiente_id: 'a02', servico: 'Impermeabilização',                 quantidade: 6, unidade: 'm²', valor_centavos: 110000, executado: true,  executado_em: '2026-06-18', executado_por: 'p07' },
    { id: 'i08', obra_id: 'o01', ambiente_id: 'a02', servico: 'Assentamento de azulejo',           quantidade: 14, unidade: 'm²', valor_centavos: 260000, executado: true, executado_em: '2026-07-02', executado_por: 'p13' },
    { id: 'i09', obra_id: 'o01', ambiente_id: 'a02', servico: 'Instalação de louças sanitárias',   quantidade: 1, unidade: 'vb', valor_centavos: 130000, executado: true,  executado_em: '2026-07-15', executado_por: 'p07' },
    { id: 'i10', obra_id: 'o01', ambiente_id: 'a02', servico: 'Pintura final',                     quantidade: 1, unidade: 'vb', valor_centavos: 85000,  executado: false },
    // Cozinha — 5/11 executados
    { id: 'i11', obra_id: 'o01', ambiente_id: 'a03', servico: 'Demolição de armários',             quantidade: 1, unidade: 'vb', valor_centavos: 120000, executado: true,  executado_em: '2026-07-05', executado_por: 'p07' },
    { id: 'i12', obra_id: 'o01', ambiente_id: 'a03', servico: 'Alvenaria de banco de serviço',     quantidade: 1, unidade: 'vb', valor_centavos: 95000,  executado: true,  executado_em: '2026-07-12', executado_por: 'p07' },
    { id: 'i13', obra_id: 'o01', ambiente_id: 'a03', servico: 'Passagem de conduítes elétricos',   quantidade: 1, unidade: 'vb', valor_centavos: 80000,  executado: true,  executado_em: '2026-08-08', executado_por: 'p09' },
    { id: 'i14', obra_id: 'o01', ambiente_id: 'a03', servico: 'Instalação de quadro de distribuição', quantidade: 1, unidade: 'vb', valor_centavos: 95000, executado: true, executado_em: '2026-08-08', executado_por: 'p09' },
    { id: 'i15', obra_id: 'o01', ambiente_id: 'a03', servico: 'Assentamento de porcelanato no piso', quantidade: 14, unidade: 'm²', valor_centavos: 220000, executado: true, executado_em: '2026-08-19', executado_por: 'p07' },
    { id: 'i16', obra_id: 'o01', ambiente_id: 'a03', servico: 'Porcelanato nas paredes',           quantidade: 12, unidade: 'm²', valor_centavos: 195000, executado: false },
    { id: 'i17', obra_id: 'o01', ambiente_id: 'a03', servico: 'Instalação de marcenaria',          quantidade: 1, unidade: 'vb', valor_centavos: 480000, executado: false },
    { id: 'i18', obra_id: 'o01', ambiente_id: 'a03', servico: 'Instalação de ponto de gás',        quantidade: 1, unidade: 'vb', valor_centavos: 75000,  executado: false },
    { id: 'i19', obra_id: 'o01', ambiente_id: 'a03', servico: 'Instalação de louças e torneiras',  quantidade: 1, unidade: 'vb', valor_centavos: 110000, executado: false },
    { id: 'i20', obra_id: 'o01', ambiente_id: 'a03', servico: 'Pintura',                           quantidade: 1, unidade: 'vb', valor_centavos: 95000,  executado: false },
    { id: 'i21', obra_id: 'o01', ambiente_id: 'a03', servico: 'Acabamentos elétricos',             quantidade: 1, unidade: 'vb', valor_centavos: 55000,  executado: false },
    // Sala — 1/5 executados
    { id: 'i22', obra_id: 'o01', ambiente_id: 'a04', servico: 'Demolição de forro existente',      quantidade: 1, unidade: 'vb', valor_centavos: 70000,  executado: true,  executado_em: '2026-07-20', executado_por: 'p08' },
    { id: 'i23', obra_id: 'o01', ambiente_id: 'a04', servico: 'Assentamento de piso laminado',     quantidade: 28, unidade: 'm²', valor_centavos: 310000, executado: false },
    { id: 'i24', obra_id: 'o01', ambiente_id: 'a04', servico: 'Pintura de teto e paredes',         quantidade: 1, unidade: 'vb', valor_centavos: 160000, executado: false },
    { id: 'i25', obra_id: 'o01', ambiente_id: 'a04', servico: 'Instalação de luminárias',          quantidade: 6, unidade: 'un', valor_centavos: 140000, executado: false },
    { id: 'i26', obra_id: 'o01', ambiente_id: 'a04', servico: 'Instalação de rodapé',              quantidade: 22, unidade: 'm', valor_centavos: 85000,  executado: false },
    // Lavabo — 0/4 executados
    { id: 'i27', obra_id: 'o01', ambiente_id: 'a05', servico: 'Demolição existente',               quantidade: 1, unidade: 'vb', valor_centavos: 60000,  executado: false },
    { id: 'i28', obra_id: 'o01', ambiente_id: 'a05', servico: 'Impermeabilização',                 quantidade: 3, unidade: 'm²', valor_centavos: 55000,  executado: false },
    { id: 'i29', obra_id: 'o01', ambiente_id: 'a05', servico: 'Assentamento de porcelanato',       quantidade: 8, unidade: 'm²', valor_centavos: 130000, executado: false },
    { id: 'i30', obra_id: 'o01', ambiente_id: 'a05', servico: 'Instalação de louças e torneiras',  quantidade: 1, unidade: 'vb', valor_centavos: 95000,  executado: false },
  ],

  // ─── PLANEJAMENTO (semana 17–22/08) ───────────────────────────────────────
  planejamento: [
    // Rafael Duarte: planejado para GFR em 19/08 → divergência
    { id: 'pl01', semana_inicio: '2026-08-17', pessoa_id: 'p04', data: '2026-08-17', obra_id: 'o01', recebe: true, adicional_centavos: 0, estado: 'publicado' },
    { id: 'pl02', semana_inicio: '2026-08-17', pessoa_id: 'p04', data: '2026-08-18', obra_id: 'o01', recebe: true, adicional_centavos: 0, estado: 'publicado' },
    { id: 'pl03', semana_inicio: '2026-08-17', pessoa_id: 'p04', data: '2026-08-19', obra_id: 'o02', recebe: true, adicional_centavos: 0, estado: 'publicado' }, // ← GFR
    { id: 'pl04', semana_inicio: '2026-08-17', pessoa_id: 'p04', data: '2026-08-20', obra_id: 'o01', recebe: true, adicional_centavos: 0, estado: 'publicado' },
    { id: 'pl05', semana_inicio: '2026-08-17', pessoa_id: 'p04', data: '2026-08-21', obra_id: 'o01', recebe: true, adicional_centavos: 0, estado: 'publicado' },
    { id: 'pl06', semana_inicio: '2026-08-17', pessoa_id: 'p04', data: '2026-08-22', obra_id: 'o01', recebe: true, adicional_centavos: 0, estado: 'publicado' },
    // Marcos Bittencourt: planejado MCL semana toda
    { id: 'pl07', semana_inicio: '2026-08-17', pessoa_id: 'p07', data: '2026-08-17', obra_id: 'o01', recebe: true, adicional_centavos: 0, estado: 'publicado' },
    { id: 'pl08', semana_inicio: '2026-08-17', pessoa_id: 'p07', data: '2026-08-18', obra_id: 'o01', recebe: true, adicional_centavos: 0, estado: 'publicado' },
    { id: 'pl09', semana_inicio: '2026-08-17', pessoa_id: 'p07', data: '2026-08-19', obra_id: 'o01', recebe: true, adicional_centavos: 0, estado: 'publicado' }, // mas esteve em GFR tbm
    { id: 'pl10', semana_inicio: '2026-08-17', pessoa_id: 'p07', data: '2026-08-20', obra_id: 'o01', recebe: true, adicional_centavos: 0, estado: 'publicado' },
    { id: 'pl11', semana_inicio: '2026-08-17', pessoa_id: 'p07', data: '2026-08-21', obra_id: 'o01', recebe: true, adicional_centavos: 0, estado: 'publicado' },
    { id: 'pl12', semana_inicio: '2026-08-17', pessoa_id: 'p07', data: '2026-08-22', obra_id: 'o01', recebe: true, adicional_centavos: 0, estado: 'publicado' },
    // Jonas Ribeiro: MCL semana toda
    { id: 'pl13', semana_inicio: '2026-08-17', pessoa_id: 'p08', data: '2026-08-17', obra_id: 'o01', recebe: true, adicional_centavos: 0, estado: 'publicado' },
    { id: 'pl14', semana_inicio: '2026-08-17', pessoa_id: 'p08', data: '2026-08-18', obra_id: 'o01', recebe: true, adicional_centavos: 0, estado: 'publicado' },
    { id: 'pl15', semana_inicio: '2026-08-17', pessoa_id: 'p08', data: '2026-08-19', obra_id: 'o01', recebe: true, adicional_centavos: 0, estado: 'publicado' },
    { id: 'pl16', semana_inicio: '2026-08-17', pessoa_id: 'p08', data: '2026-08-20', obra_id: 'o01', recebe: true, adicional_centavos: 0, estado: 'publicado' },
    { id: 'pl17', semana_inicio: '2026-08-17', pessoa_id: 'p08', data: '2026-08-21', obra_id: 'o01', recebe: true, adicional_centavos: 0, estado: 'publicado' },
    { id: 'pl18', semana_inicio: '2026-08-17', pessoa_id: 'p08', data: '2026-08-22', obra_id: 'o01', recebe: true, adicional_centavos: 0, estado: 'publicado' },
    // Cleber Matos: MCL seg-qui
    { id: 'pl19', semana_inicio: '2026-08-17', pessoa_id: 'p09', data: '2026-08-17', obra_id: 'o01', recebe: true, adicional_centavos: 0, estado: 'publicado' },
    { id: 'pl20', semana_inicio: '2026-08-17', pessoa_id: 'p09', data: '2026-08-18', obra_id: 'o01', recebe: true, adicional_centavos: 0, estado: 'publicado' },
    { id: 'pl21', semana_inicio: '2026-08-17', pessoa_id: 'p09', data: '2026-08-19', obra_id: 'o01', recebe: true, adicional_centavos: 0, estado: 'publicado' },
    { id: 'pl22', semana_inicio: '2026-08-17', pessoa_id: 'p09', data: '2026-08-20', obra_id: 'o01', recebe: true, adicional_centavos: 0, estado: 'publicado' },
    // Ana Carvalho: MCL seg-sex
    { id: 'pl23', semana_inicio: '2026-08-17', pessoa_id: 'p06', data: '2026-08-17', obra_id: 'o01', recebe: true, adicional_centavos: 0, estado: 'publicado' },
    { id: 'pl24', semana_inicio: '2026-08-17', pessoa_id: 'p06', data: '2026-08-18', obra_id: 'o01', recebe: true, adicional_centavos: 0, estado: 'publicado' },
    { id: 'pl25', semana_inicio: '2026-08-17', pessoa_id: 'p06', data: '2026-08-19', obra_id: 'o01', recebe: true, adicional_centavos: 0, estado: 'publicado' },
    { id: 'pl26', semana_inicio: '2026-08-17', pessoa_id: 'p06', data: '2026-08-20', obra_id: 'o01', recebe: true, adicional_centavos: 0, estado: 'publicado' },
    // Workers GFR (p11-p15)
    ...['p11','p12','p13','p14','p15'].flatMap((pid, i) =>
      ['2026-08-17','2026-08-18','2026-08-19','2026-08-20','2026-08-21','2026-08-22'].map((data, j) => ({
        id: `pl_gfr_${pid}_${j}`,
        semana_inicio: '2026-08-17',
        pessoa_id: pid,
        data,
        obra_id: 'o02',
        recebe: true,
        adicional_centavos: 0,
        estado: 'publicado' as const,
      }))
    ),
    // Workers LSM (p16-p18)
    ...['p16','p17','p18'].flatMap((pid, i) =>
      ['2026-08-17','2026-08-18','2026-08-19','2026-08-20','2026-08-21'].map((data, j) => ({
        id: `pl_lsm_${pid}_${j}`,
        semana_inicio: '2026-08-17',
        pessoa_id: pid,
        data,
        obra_id: 'o05',
        recebe: true,
        adicional_centavos: 0,
        estado: 'publicado' as const,
      }))
    ),

    // ── SEMANA 24–29/08 (rascunho) — metade da equipe ainda sem alocação ──
    // MCL (o01): Rafael, Ana, Marcos, Jonas seg–sex; Cleber seg–qua
    ...[
      { pid: 'p04', dias: ['2026-08-24','2026-08-25','2026-08-26','2026-08-27','2026-08-28'] },
      { pid: 'p06', dias: ['2026-08-24','2026-08-25','2026-08-26','2026-08-27','2026-08-28'] },
      { pid: 'p07', dias: ['2026-08-24','2026-08-25','2026-08-26','2026-08-27','2026-08-28'] },
      { pid: 'p08', dias: ['2026-08-24','2026-08-25','2026-08-26','2026-08-27','2026-08-28'] },
      { pid: 'p09', dias: ['2026-08-24','2026-08-25','2026-08-26'] },
    ].flatMap(({ pid, dias }) =>
      dias.map((data, j) => ({
        id: `pl2_mcl_${pid}_${j}`,
        semana_inicio: '2026-08-24',
        pessoa_id: pid,
        data,
        obra_id: 'o01',
        recebe: true,
        adicional_centavos: 0,
        estado: 'rascunho' as const,
      }))
    ),
    // GFR (o02): André, Bruno seg–sex; Carlos seg–qui
    ...[
      { pid: 'p11', dias: ['2026-08-24','2026-08-25','2026-08-26','2026-08-27','2026-08-28'] },
      { pid: 'p12', dias: ['2026-08-24','2026-08-25','2026-08-26','2026-08-27','2026-08-28'] },
      { pid: 'p13', dias: ['2026-08-24','2026-08-25','2026-08-26','2026-08-27'] },
    ].flatMap(({ pid, dias }) =>
      dias.map((data, j) => ({
        id: `pl2_gfr_${pid}_${j}`,
        semana_inicio: '2026-08-24',
        pessoa_id: pid,
        data,
        obra_id: 'o02',
        recebe: true,
        adicional_centavos: 0,
        estado: 'rascunho' as const,
      }))
    ),
    // LSM (o05): Felipe seg–sex
    ...['2026-08-24','2026-08-25','2026-08-26','2026-08-27','2026-08-28'].map((data, j) => ({
      id: `pl2_lsm_p16_${j}`,
      semana_inicio: '2026-08-24',
      pessoa_id: 'p16',
      data,
      obra_id: 'o05',
      recebe: true,
      adicional_centavos: 0,
      estado: 'rascunho' as const,
    })),
    // MBP (o04): Gustavo seg–sex (obra aguardando início)
    ...['2026-08-24','2026-08-25','2026-08-26','2026-08-27','2026-08-28'].map((data, j) => ({
      id: `pl2_mbp_p17_${j}`,
      semana_inicio: '2026-08-24',
      pessoa_id: 'p17',
      data,
      obra_id: 'o04',
      recebe: true,
      adicional_centavos: 0,
      estado: 'rascunho' as const,
    })),
    // Em aberto (3 pessoas): Diego, Henrique, Mateus
    { id: 'pl2_ab_p14_0', semana_inicio: '2026-08-24', pessoa_id: 'p14', data: '2026-08-24', em_aberto: true, recebe: false, adicional_centavos: 0, estado: 'rascunho' as const },
    { id: 'pl2_ab_p14_1', semana_inicio: '2026-08-24', pessoa_id: 'p14', data: '2026-08-25', em_aberto: true, recebe: false, adicional_centavos: 0, estado: 'rascunho' as const },
    { id: 'pl2_ab_p18_0', semana_inicio: '2026-08-24', pessoa_id: 'p18', data: '2026-08-24', em_aberto: true, recebe: false, adicional_centavos: 0, estado: 'rascunho' as const },
    { id: 'pl2_ab_p22_0', semana_inicio: '2026-08-24', pessoa_id: 'p22', data: '2026-08-26', em_aberto: true, recebe: false, adicional_centavos: 0, estado: 'rascunho' as const },
    { id: 'pl2_ab_p22_1', semana_inicio: '2026-08-24', pessoa_id: 'p22', data: '2026-08-27', em_aberto: true, recebe: false, adicional_centavos: 0, estado: 'rascunho' as const },
    // Ausências: Igor de férias (recebe) seg–sáb; Eduardo folga (não recebe) na segunda
    ...['2026-08-24','2026-08-25','2026-08-26','2026-08-27','2026-08-28','2026-08-29'].map((data, j) => ({
      id: `pl2_aus_p19_${j}`,
      semana_inicio: '2026-08-24',
      pessoa_id: 'p19',
      data,
      motivo_ausencia: 'Férias',
      recebe: true,
      adicional_centavos: 0,
      estado: 'rascunho' as const,
    })),
    { id: 'pl2_aus_p15_0', semana_inicio: '2026-08-24', pessoa_id: 'p15', data: '2026-08-24', motivo_ausencia: 'Folga', recebe: false, adicional_centavos: 0, estado: 'rascunho' as const },
  ],

  // ─── SEMANAS ──────────────────────────────────────────────────────────────
  semanas: [
    { inicio: '2026-08-17', estado: 'publicado' },
    { inicio: '2026-08-24', estado: 'rascunho' },
  ],

  // ─── DIÁRIOS ──────────────────────────────────────────────────────────────
  diarios: [
    {
      id: 'd01',
      obra_id: 'o01',
      data: ONTEM, // 19/08 finalizado
      estado: 'finalizado',
      texto: [
        'Assentamento de porcelanato na sala de estar — finalizadas 3 fiadas. Rejuntamento previsto para 23/08.',
        'Passagem de conduítes elétricos na cozinha concluída. Quadro de distribuição posicionado e fixado.',
        'Preparação de parede para instalação de box na suíte master iniciada.',
      ],
      fotos: [
        'https://images.unsplash.com/photo-1618832515490-e181c4794a45?w=280&h=280&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1634586648651-f1fb9ec10d90?w=280&h=280&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1505798577917-a65157d3320a?w=280&h=280&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1674649207083-281c2517ab49?w=280&h=280&fit=crop&auto=format',
      ],
      finalizado_por: 'p04',
      finalizado_em: '2026-08-19T18:32:00',
    },
    {
      id: 'd02',
      obra_id: 'o01',
      data: HOJE,
      estado: 'finalizado',
      texto: [
        'SERVIÇOS EXECUTADOS',
        'Cozinha — assentamento de porcelanato na parede sul concluído. Total acumulado nessa parede: 24 m².',
        'Sala — primer no teto aplicado. Lona protetora no parquet existente.',
        'Banheiro da suíte — massa corrida aplicada. Pronto para primeira demão de tinta.',
        'MATERIAIS RECEBIDOS',
        'Massa corrida PVA Suvinil — 10 galões. Rodapé MDF branco — 30 metros lineares.',
        'PRÓXIMO DIA',
        'Rejuntamento da cozinha e continuidade da pintura da sala.',
      ],
      fotos: [
        'https://images.unsplash.com/photo-1618832515490-e181c4794a45?w=280&h=280&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1634586648651-f1fb9ec10d90?w=280&h=280&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1505798577917-a65157d3320a?w=280&h=280&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=280&h=280&fit=crop&auto=format',
      ],
      houve_execucao: true,
      finalizado_por: 'p04',
      finalizado_em: '2026-08-20T17:45:00',
    },
    {
      id: 'd_18',
      obra_id: 'o01',
      data: '2026-08-18',
      estado: 'finalizado',
      texto: [
        'SERVIÇOS EXECUTADOS',
        'Cozinha — passagem de conduítes elétricos concluída. Quadro de distribuição posicionado e fixado.',
        'Cozinha — assentamento de porcelanato no piso iniciado. Aprox. 14 m² dos 28 m² totais.',
        'Suíte master — montagem e instalação do box de vidro temperado concluída.',
        'MATERIAIS RECEBIDOS',
        'Porcelanato Portinari Biancogres 60×60 — 6 caixas. Box de vidro temperado — conferido e aprovado.',
        'PRÓXIMO DIA',
        'Continuidade do porcelanato da cozinha e elétrica dos demais cômodos.',
      ],
      fotos: [
        'https://images.unsplash.com/photo-1590073243968-827440c4e68d?w=280&h=280&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=280&h=280&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=280&h=280&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1527271433-4e34d1dbebc9?w=280&h=280&fit=crop&auto=format',
      ],
      houve_execucao: true,
      finalizado_por: 'p04',
      finalizado_em: '2026-08-18T18:15:00',
    },
    {
      id: 'd_17',
      obra_id: 'o01',
      data: '2026-08-17',
      estado: 'finalizado',
      texto: [],
      fotos: [],
      houve_execucao: false,
      motivo_sem_execucao: 'Não houve execução — falta de material',
      finalizado_por: 'p04',
      finalizado_em: '2026-08-17T14:00:00',
    },
    {
      id: 'd_14',
      obra_id: 'o01',
      data: '2026-08-14',
      estado: 'finalizado',
      texto: [
        'SERVIÇOS EXECUTADOS',
        'Sala — demolição do forro de gesso existente concluída. Limpeza e retirada de entulho no período da tarde.',
        'Cozinha — alvenaria de banco de serviço finalizada. Aguardando secagem para sequência.',
        'Marcenaria — visita técnica para medição e definição de projeto das bancadas.',
        'MATERIAIS RECEBIDOS',
        'Tinta Suvinil Acetinado Branco — 40 litros. Porcelanato para cozinha — 4 caixas.',
        'PRÓXIMO DIA',
        'Início da semana com foco em elétrica da cozinha e preparação do lavabo.',
      ],
      fotos: [
        'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=280&h=280&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=280&h=280&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=280&h=280&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1674649207083-281c2517ab49?w=280&h=280&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1548946526-f69e2424cf45?w=280&h=280&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=280&h=280&fit=crop&auto=format',
      ],
      houve_execucao: true,
      finalizado_por: 'p04',
      finalizado_em: '2026-08-14T17:30:00',
    },
    // GFR — diário finalizado ontem
    {
      id: 'd03',
      obra_id: 'o02',
      data: ONTEM,
      estado: 'finalizado',
      texto: ['Regularização de piso no dormitório principal.'],
      fotos: [],
      finalizado_por: 'p05',
      finalizado_em: '2026-08-19T17:00:00',
    },
    // LSM — diário finalizado ontem
    {
      id: 'd05',
      obra_id: 'o05',
      data: ONTEM,
      estado: 'finalizado',
      texto: ['Pintura de segunda mão na sala e corredores.'],
      fotos: [],
      finalizado_por: 'p05',
      finalizado_em: '2026-08-19T16:30:00',
    },
    // ATB — sem diário de 19/08 (intencional: pendente)
  ],

  // ─── PRESENÇAS ────────────────────────────────────────────────────────────
  presencas: [
    // MCL ontem (19/08) — diário d01
    { id: 'pr01', diario_id: 'd01', obra_id: 'o01', pessoa_id: 'p04', data: ONTEM, periodo: 'dia_todo' }, // Rafael → MCL (mas planejado GFR → divergência)
    { id: 'pr02', diario_id: 'd01', obra_id: 'o01', pessoa_id: 'p06', data: ONTEM, periodo: 'dia_todo' }, // Ana → MCL
    { id: 'pr03', diario_id: 'd01', obra_id: 'o01', pessoa_id: 'p07', data: ONTEM, periodo: 'dia_todo' }, // Marcos → MCL
    { id: 'pr04', diario_id: 'd01', obra_id: 'o01', pessoa_id: 'p08', data: ONTEM, periodo: 'dia_todo' }, // Jonas → MCL
    { id: 'pr05', diario_id: 'd01', obra_id: 'o01', pessoa_id: 'p09', data: ONTEM, periodo: 'dia_todo' }, // Cleber → MCL
    // MCL hoje (20/08) — diário d02 rascunho
    { id: 'pr10', diario_id: 'd02', obra_id: 'o01', pessoa_id: 'p04', data: HOJE, periodo: 'dia_todo' },
    { id: 'pr11', diario_id: 'd02', obra_id: 'o01', pessoa_id: 'p06', data: HOJE, periodo: 'dia_todo' },
    { id: 'pr12', diario_id: 'd02', obra_id: 'o01', pessoa_id: 'p07', data: HOJE, periodo: 'dia_todo' },
    { id: 'pr13', diario_id: 'd02', obra_id: 'o01', pessoa_id: 'p08', data: HOJE, periodo: 'dia_todo' },
    { id: 'pr14', diario_id: 'd02', obra_id: 'o01', pessoa_id: 'p09', data: HOJE, periodo: 'dia_todo' },
    // GFR ontem (19/08) — diário d03
    { id: 'pr20', diario_id: 'd03', obra_id: 'o02', pessoa_id: 'p07', data: ONTEM, periodo: 'tarde' }, // Marcos → GFR tbm → rateio pendente
    { id: 'pr21', diario_id: 'd03', obra_id: 'o02', pessoa_id: 'p11', data: ONTEM, periodo: 'dia_todo' },
    { id: 'pr22', diario_id: 'd03', obra_id: 'o02', pessoa_id: 'p12', data: ONTEM, periodo: 'dia_todo' },
    { id: 'pr23', diario_id: 'd03', obra_id: 'o02', pessoa_id: 'p13', data: ONTEM, periodo: 'dia_todo' },
    // GFR hoje
    { id: 'pr30', diario_id: 'd03', obra_id: 'o02', pessoa_id: 'p11', data: HOJE, periodo: 'dia_todo' },
    { id: 'pr31', diario_id: 'd03', obra_id: 'o02', pessoa_id: 'p12', data: HOJE, periodo: 'dia_todo' },
    { id: 'pr32', diario_id: 'd03', obra_id: 'o02', pessoa_id: 'p13', data: HOJE, periodo: 'dia_todo' },
    { id: 'pr33', diario_id: 'd03', obra_id: 'o02', pessoa_id: 'p14', data: HOJE, periodo: 'dia_todo' },
    { id: 'pr34', diario_id: 'd03', obra_id: 'o02', pessoa_id: 'p15', data: HOJE, periodo: 'dia_todo' },
    // LSM hoje
    { id: 'pr40', diario_id: 'd05', obra_id: 'o05', pessoa_id: 'p16', data: HOJE, periodo: 'dia_todo' },
    { id: 'pr41', diario_id: 'd05', obra_id: 'o05', pessoa_id: 'p17', data: HOJE, periodo: 'dia_todo' },
    { id: 'pr42', diario_id: 'd05', obra_id: 'o05', pessoa_id: 'p18', data: HOJE, periodo: 'dia_todo' },
    // LSM ontem
    { id: 'pr50', diario_id: 'd05', obra_id: 'o05', pessoa_id: 'p16', data: ONTEM, periodo: 'dia_todo' },
    { id: 'pr51', diario_id: 'd05', obra_id: 'o05', pessoa_id: 'p17', data: ONTEM, periodo: 'dia_todo' },
    { id: 'pr52', diario_id: 'd05', obra_id: 'o05', pessoa_id: 'p18', data: ONTEM, periodo: 'dia_todo' },
    // MCL 18/08 (d_18)
    { id: 'pr_18_p04', diario_id: 'd_18', obra_id: 'o01', pessoa_id: 'p04', data: '2026-08-18', periodo: 'dia_todo' },
    { id: 'pr_18_p06', diario_id: 'd_18', obra_id: 'o01', pessoa_id: 'p06', data: '2026-08-18', periodo: 'dia_todo' },
    { id: 'pr_18_p07', diario_id: 'd_18', obra_id: 'o01', pessoa_id: 'p07', data: '2026-08-18', periodo: 'dia_todo' },
    { id: 'pr_18_p08', diario_id: 'd_18', obra_id: 'o01', pessoa_id: 'p08', data: '2026-08-18', periodo: 'dia_todo' },
    { id: 'pr_18_p09', diario_id: 'd_18', obra_id: 'o01', pessoa_id: 'p09', data: '2026-08-18', periodo: 'dia_todo' },
    // MCL 14/08 (d_14)
    { id: 'pr_14_p04', diario_id: 'd_14', obra_id: 'o01', pessoa_id: 'p04', data: '2026-08-14', periodo: 'dia_todo' },
    { id: 'pr_14_p06', diario_id: 'd_14', obra_id: 'o01', pessoa_id: 'p06', data: '2026-08-14', periodo: 'dia_todo' },
    { id: 'pr_14_p07', diario_id: 'd_14', obra_id: 'o01', pessoa_id: 'p07', data: '2026-08-14', periodo: 'dia_todo' },
    { id: 'pr_14_p08', diario_id: 'd_14', obra_id: 'o01', pessoa_id: 'p08', data: '2026-08-14', periodo: 'dia_todo' },
    { id: 'pr_14_p09', diario_id: 'd_14', obra_id: 'o01', pessoa_id: 'p09', data: '2026-08-14', periodo: 'dia_todo' },
  ],

  // ─── DIÁRIAS ──────────────────────────────────────────────────────────────
  diarias: [
    // Ontem — MCL
    { id: 'di01', pessoa_id: 'p04', data: ONTEM, obra_que_arca_id: 'o01', valor_centavos: 0,     adicional_centavos: 0 }, // gerente, sem diária
    { id: 'di02', pessoa_id: 'p06', data: ONTEM, obra_que_arca_id: 'o01', valor_centavos: 0,     adicional_centavos: 0 }, // assistente
    { id: 'di03', pessoa_id: 'p08', data: ONTEM, obra_que_arca_id: 'o01', valor_centavos: 18000, adicional_centavos: 0 },
    { id: 'di04', pessoa_id: 'p09', data: ONTEM, obra_que_arca_id: 'o01', valor_centavos: 0,     adicional_centavos: 0 }, // terceirizado por obra
    // Marcos — presente em MCL e GFR ontem → obra_que_arca_id vazio (rateio pendente)
    { id: 'di05', pessoa_id: 'p07', data: ONTEM, obra_que_arca_id: undefined, valor_centavos: 25000, adicional_centavos: 0 },
    // GFR ontem
    { id: 'di10', pessoa_id: 'p11', data: ONTEM, obra_que_arca_id: 'o02', valor_centavos: 20000, adicional_centavos: 0 },
    { id: 'di11', pessoa_id: 'p12', data: ONTEM, obra_que_arca_id: 'o02', valor_centavos: 20000, adicional_centavos: 0 },
    { id: 'di12', pessoa_id: 'p13', data: ONTEM, obra_que_arca_id: 'o02', valor_centavos: 23000, adicional_centavos: 0 },
    // LSM ontem
    { id: 'di20', pessoa_id: 'p16', data: ONTEM, obra_que_arca_id: 'o05', valor_centavos: 20000, adicional_centavos: 0 },
    { id: 'di21', pessoa_id: 'p17', data: ONTEM, obra_que_arca_id: 'o05', valor_centavos: 20000, adicional_centavos: 0 },
    { id: 'di22', pessoa_id: 'p18', data: ONTEM, obra_que_arca_id: 'o05', valor_centavos: 23000, adicional_centavos: 0 },
  ],

  // ─── FECHAMENTOS ──────────────────────────────────────────────────────────
  // Ciclo semanal: 18 pessoas, fecha 22/08
  fechamentos: [
    ...Array.from({ length: 18 }, (_, i) => ({
      id: `fc_sem_${i + 1}`,
      ciclo: 'semanal' as const,
      pessoa_id: ['p07','p08','p11','p12','p13','p14','p15','p16','p17','p18','p19','p20','p21','p22','p23','p24','p09','p06'][i],
      periodo_inicio: '2026-08-17',
      periodo_fim: '2026-08-22',
      estado: 'aberto' as const,
      total_centavos: [25000,18000,20000,20000,23000,20000,20000,20000,20000,23000,20000,20000,20000,23000,20000,20000,0,0][i] * 5,
      fechado_por: undefined,
    })),
    // Ciclo quinzenal: 6 pessoas, fecha 29/08
    ...Array.from({ length: 6 }, (_, i) => ({
      id: `fc_qui_${i + 1}`,
      ciclo: 'quinzenal' as const,
      pessoa_id: ['p11','p12','p13','p14','p15','p16'][i],
      periodo_inicio: '2026-08-15',
      periodo_fim: '2026-08-29',
      estado: 'aberto' as const,
      total_centavos: 128000,
      fechado_por: undefined,
    })),
    // Ciclo mensal: 4 pessoas, fecha 31/08
    ...Array.from({ length: 4 }, (_, i) => ({
      id: `fc_men_${i + 1}`,
      ciclo: 'mensal' as const,
      pessoa_id: ['p17','p18','p19','p20'][i],
      periodo_inicio: '2026-08-01',
      periodo_fim: '2026-08-31',
      estado: 'aberto' as const,
      total_centavos: 96000,
      fechado_por: undefined,
    })),
  ],

  // ─── LANÇAMENTOS ──────────────────────────────────────────────────────────
  lancamentos: [
    { id: 'la01', pessoa_id: 'p08', tipo: 'adiantamento', valor_centavos: 40000, parcelas: 1, parcelas_pagas: 0, data: '2026-08-15' },
    { id: 'la02', pessoa_id: 'p07', tipo: 'emprestimo',   valor_centavos: 120000, parcelas: 4, parcelas_pagas: 1, data: '2026-07-01' },
  ],

  // ─── PARCELAS ─────────────────────────────────────────────────────────────
  // Derivadas dos lançamentos acima. O adiantamento é parcela única, porque a
  // regra do Fechamento desconta adiantamento integralmente; o empréstimo do
  // Marcos tem 4 parcelas de R$300,00, uma já paga no ciclo que fechou em
  // 15/08. As três restantes caem nos ciclos semanais seguintes.
  parcelas: [
    { id: 'pa01', lancamento_id: 'la01', numero: 1, valor_centavos: 40000, situacao: 'pendente', ciclo_periodo_fim: '2026-08-22' },
    { id: 'pa02', lancamento_id: 'la02', numero: 1, valor_centavos: 30000, situacao: 'paga',     ciclo_periodo_fim: '2026-08-15' },
    { id: 'pa03', lancamento_id: 'la02', numero: 2, valor_centavos: 30000, situacao: 'pendente', ciclo_periodo_fim: '2026-08-22' },
    { id: 'pa04', lancamento_id: 'la02', numero: 3, valor_centavos: 30000, situacao: 'pendente', ciclo_periodo_fim: '2026-08-29' },
    { id: 'pa05', lancamento_id: 'la02', numero: 4, valor_centavos: 30000, situacao: 'pendente', ciclo_periodo_fim: '2026-09-05' },
  ],

  // ─── NOTIFICAÇÕES ─────────────────────────────────────────────────────────
  // Cada uma aponta para um registro que existe de fato neste seed. Nenhuma
  // descreve evento inventado. 6 notificações, 4 não lidas.
  notificacoes: [
    {
      id: 'nt01', tipo: 'divergencia', origem_tipo: 'diario', origem_id: 'd01',
      titulo: 'Divergência: Rafael Duarte',
      descricao: 'Planejado em Obra 18 - GFR, presente em Obra 22 - MCL em 19/08/2026',
      data: '2026-08-19T18:32:00', lida: false,
    },
    {
      id: 'nt02', tipo: 'rateio_pendente', origem_tipo: 'diaria', origem_id: 'di05',
      titulo: 'Rateio pendente: Marcos Bittencourt',
      descricao: 'Diária de 19/08/2026 sem obra definida',
      data: '2026-08-19T18:32:00', lida: false,
    },
    {
      id: 'nt03', tipo: 'fechamento_proximo', origem_tipo: 'fechamento', origem_id: 'fc_sem_1',
      titulo: 'Fechamento semanal em 22/08/2026',
      descricao: '18 pessoas aguardando fechamento do ciclo semanal',
      data: '2026-08-20T08:00:00', lida: false,
    },
    {
      id: 'nt04', tipo: 'planejamento_rascunho', origem_tipo: 'planejamento', origem_id: '2026-08-24',
      titulo: 'Semana de 24/08 ainda em rascunho',
      descricao: 'A semana seguinte não foi publicada e tem pessoas sem destino',
      data: '2026-08-20T08:00:00', lida: false,
    },
    {
      id: 'nt05', tipo: 'diario_finalizado', origem_tipo: 'diario', origem_id: 'd02',
      titulo: 'Diário finalizado: Obra 22 - MCL',
      descricao: 'Rafael Duarte finalizou o diário de 20/08/2026',
      data: '2026-08-20T17:45:00', lida: true,
    },
    {
      id: 'nt06', tipo: 'diario_finalizado', origem_tipo: 'diario', origem_id: 'd_18',
      titulo: 'Diário finalizado: Obra 22 - MCL',
      descricao: 'Rafael Duarte finalizou o diário de 18/08/2026',
      data: '2026-08-18T17:50:00', lida: true,
    },
  ],

  // ─── ESPECIALIDADES ───────────────────────────────────────────────────────
  // Catálogo. É atributo do serviço de terceiro — ver decisão D1.
  especialidades: [
    { id: 'es01', nome: 'Marcenaria' },
    { id: 'es02', nome: 'Marmoraria' },
    { id: 'es03', nome: 'Vidro' },
    { id: 'es04', nome: 'Ar-condicionado' },
    { id: 'es05', nome: 'Gesso' },
    { id: 'es06', nome: 'Piso de madeira' },
    { id: 'es07', nome: 'Elétrica' },
    { id: 'es08', nome: 'Hidráulica' },
    { id: 'es09', nome: 'Pintura' },
  ],

  // ─── TIPOS DE DOCUMENTO ───────────────────────────────────────────────────
  // Três tipos de topo; os cinco tipos de nota são filhos de "Nota fiscal".
  tipos_documento: [
    { id: 'td01', nome: 'Nota fiscal' },
    { id: 'td02', nome: 'Projeto' },
    { id: 'td03', nome: 'Contrato' },
    { id: 'td04', nome: 'Depósito de material',   pai_id: 'td01' },
    { id: 'td05', nome: 'Parte elétrica',         pai_id: 'td01' },
    { id: 'td06', nome: 'Reembolso de material',  pai_id: 'td01' },
    { id: 'td07', nome: 'Compra online',          pai_id: 'td01' },
    { id: 'td08', nome: 'Outros',                 pai_id: 'td01' },
  ],

  // ─── MÍDIAS ───────────────────────────────────────────────────────────────
  // Toda mídia já existente em `Diario.fotos` recebe um ambiente. As 18 fotos
  // do seed pertencem à Obra 22, a única com ambientes hoje. O ambiente segue
  // o texto do diário correspondente, não é sorteado.
  midias: [
    // d_14 (14/08) — porcelanato da cozinha, pintura da sala, lavabo
    { id: 'md01', obra_id: 'o01', diario_id: 'd_14', ambiente_id: 'a03', url: FOTO('photo-1504307651254-35680f356dfd'), tipo: 'foto',  data: '2026-08-14' },
    { id: 'md02', obra_id: 'o01', diario_id: 'd_14', ambiente_id: 'a03', url: FOTO('photo-1565043589221-1a6fd9ae45c7'), tipo: 'foto',  data: '2026-08-14' },
    { id: 'md03', obra_id: 'o01', diario_id: 'd_14', ambiente_id: 'a04', url: FOTO('photo-1484154218962-a197022b5858'), tipo: 'foto',  data: '2026-08-14' },
    { id: 'md04', obra_id: 'o01', diario_id: 'd_14', ambiente_id: 'a04', url: FOTO('photo-1674649207083-281c2517ab49'), tipo: 'foto',  data: '2026-08-14' },
    { id: 'md05', obra_id: 'o01', diario_id: 'd_14', ambiente_id: 'a05', url: FOTO('photo-1548946526-f69e2424cf45'), tipo: 'foto',  data: '2026-08-14' },
    { id: 'md06', obra_id: 'o01', diario_id: 'd_14', ambiente_id: 'a05', url: FOTO('photo-1600585154340-be6161a56a0c'), tipo: 'foto',  data: '2026-08-14' },
    // d_18 (18/08) — porcelanato recebido, box de vidro da suíte
    { id: 'md07', obra_id: 'o01', diario_id: 'd_18', ambiente_id: 'a03', url: FOTO('photo-1590073243968-827440c4e68d'), tipo: 'foto',  data: '2026-08-18' },
    { id: 'md08', obra_id: 'o01', diario_id: 'd_18', ambiente_id: 'a03', url: FOTO('photo-1581094794329-c8112a89af12'), tipo: 'foto',  data: '2026-08-18' },
    { id: 'md09', obra_id: 'o01', diario_id: 'd_18', ambiente_id: 'a02', url: FOTO('photo-1558618666-fcd25c85cd64'), tipo: 'video', data: '2026-08-18' },
    { id: 'md10', obra_id: 'o01', diario_id: 'd_18', ambiente_id: 'a01', url: FOTO('photo-1527271433-4e34d1dbebc9'), tipo: 'foto',  data: '2026-08-18' },
    // d01 (19/08) — preparação de parede para box na suíte master
    { id: 'md11', obra_id: 'o01', diario_id: 'd01', ambiente_id: 'a01', url: FOTO('photo-1618832515490-e181c4794a45'), tipo: 'foto',  data: ONTEM },
    { id: 'md12', obra_id: 'o01', diario_id: 'd01', ambiente_id: 'a01', url: FOTO('photo-1634586648651-f1fb9ec10d90'), tipo: 'foto',  data: ONTEM },
    { id: 'md13', obra_id: 'o01', diario_id: 'd01', ambiente_id: 'a02', url: FOTO('photo-1505798577917-a65157d3320a'), tipo: 'foto',  data: ONTEM },
    { id: 'md14', obra_id: 'o01', diario_id: 'd01', ambiente_id: 'a02', url: FOTO('photo-1674649207083-281c2517ab49'), tipo: 'foto',  data: ONTEM },
    // d02 (20/08) — rejuntamento da cozinha e pintura da sala
    { id: 'md15', obra_id: 'o01', diario_id: 'd02', ambiente_id: 'a03', url: FOTO('photo-1618832515490-e181c4794a45'), tipo: 'foto',  data: HOJE },
    { id: 'md16', obra_id: 'o01', diario_id: 'd02', ambiente_id: 'a03', url: FOTO('photo-1634586648651-f1fb9ec10d90'), tipo: 'foto',  data: HOJE },
    { id: 'md17', obra_id: 'o01', diario_id: 'd02', ambiente_id: 'a04', url: FOTO('photo-1505798577917-a65157d3320a'), tipo: 'foto',  data: HOJE },
    { id: 'md18', obra_id: 'o01', diario_id: 'd02', ambiente_id: 'a04', url: FOTO('photo-1556909114-f6e7ad7d3136'), tipo: 'video', data: HOJE },
  ],

  // ─── ITENS FORA DO ESCOPO ─────────────────────────────────────────────────
  itens_fora_escopo: [],
};

export default DADOS;
