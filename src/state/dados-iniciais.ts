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

// Segunda a sábado da semana corrente. Hoje é QUINTA, 20/08: os dias 21 e 22
// ainda não aconteceram, e por isso não têm diário, presença nem diária.
const S1 = ['2026-08-17', '2026-08-18', '2026-08-19', '2026-08-20', '2026-08-21', '2026-08-22'];

// Célula publicada da semana corrente, para uma pessoa numa obra.
const aloca = (pessoa_id: string, obra_id: string, dias: string[] = S1) =>
  dias.map((data, j) => ({
    id: `pl_${pessoa_id}_${j}`,
    semana_inicio: '2026-08-17',
    pessoa_id,
    data,
    obra_id,
    recebe: true,
    adicional_centavos: 0,
    estado: 'publicado' as const,
  }));

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
    // ── CAMPO ──────────────────────────────────────────────────────────────
    // Os 23 nomes do elenco fixo do AGENTS.md §6. Marcos Bittencourt (p07) e
    // Jonas Ribeiro (p08) estão acima, então aqui vão os 21 restantes.
    // As 9 últimas pessoas do elenco não têm função declarada no contrato; a
    // função atribuída aqui é decisão [SÓ PROTÓTIPO] — ver docs/DECISOES.md.
    { id: 'p11', nome: 'Adilson Prado',       iniciais: 'AP', funcao: 'Pedreiro',        ativo: true },
    { id: 'p12', nome: 'Edmilson Vieira',     iniciais: 'EV', funcao: 'Pedreiro',        ativo: true },
    { id: 'p13', nome: 'Claudinei Sartori',   iniciais: 'CS', funcao: 'Pedreiro',        ativo: true },
    { id: 'p14', nome: 'Nilton Barreto',      iniciais: 'NB', funcao: 'Azulejista',      ativo: true },
    { id: 'p15', nome: 'Reinaldo Peçanha',    iniciais: 'RP', funcao: 'Azulejista',      ativo: true },
    { id: 'p16', nome: 'Sebastião Nóbrega',   iniciais: 'SN', funcao: 'Pintor',          ativo: true },
    { id: 'p17', nome: 'Otávio Bonfim',       iniciais: 'OB', funcao: 'Pintor',          ativo: true },
    { id: 'p18', nome: 'Valdir Chagas',       iniciais: 'VC', funcao: 'Ajudante',        ativo: true },
    { id: 'p19', nome: 'Israel Fontes',       iniciais: 'IF', funcao: 'Ajudante',        ativo: true },
    { id: 'p20', nome: 'Josimar Andrade',     iniciais: 'JA', funcao: 'Ajudante',        ativo: true },
    { id: 'p21', nome: 'Ubiratan Coelho',     iniciais: 'UC', funcao: 'Ajudante',        ativo: true },
    { id: 'p22', nome: 'Genivaldo Reis',      iniciais: 'GR', funcao: 'Ajudante',        ativo: true },
    // Os 9 sem função declarada no contrato
    { id: 'p23', nome: 'Erasmo Peixoto',      iniciais: 'EP', funcao: 'Pedreiro',        ativo: true },
    { id: 'p24', nome: 'Belarmino Souza',     iniciais: 'BS', funcao: 'Ajudante',        ativo: true },
    { id: 'p25', nome: 'Osmar Cavalcante',    iniciais: 'OC', funcao: 'Azulejista',      ativo: true },
    { id: 'p26', nome: 'Osvaldo Ramalho',     iniciais: 'OR', funcao: 'Pintor',          ativo: true },
    { id: 'p27', nome: 'Deusdete Farias',     iniciais: 'DF', funcao: 'Ajudante',        ativo: true },
    { id: 'p28', nome: 'Anselmo Freitas',     iniciais: 'AF', funcao: 'Ajudante',        ativo: true },
    { id: 'p29', nome: 'Nazareno Correia',    iniciais: 'NC', funcao: 'Pedreiro',        ativo: true },
    { id: 'p30', nome: 'Wanderley Prazeres',  iniciais: 'WP', funcao: 'Ajudante',        ativo: true },
    { id: 'p31', nome: 'Anísio Trindade',     iniciais: 'AT', funcao: 'Azulejista',      ativo: true },
    // ── TERCEIRIZADOS ──────────────────────────────────────────────────────
    // Cleber Matos (p09) está acima.
    { id: 'p32', nome: 'Dorival Assunção',    iniciais: 'DA', funcao: 'Eletricista',     ativo: true },
    { id: 'p33', nome: 'Tarcísio Melo',       iniciais: 'TM', funcao: 'Gesseiro',        ativo: true },
    { id: 'p34', nome: 'Rogério Pastore',     iniciais: 'RP', funcao: 'Encanador',       ativo: true },
  ],

  // ─── VÍNCULOS ─────────────────────────────────────────────────────────────
  vinculos: [
    // ── GESTÃO ──
    // A tabela da RN-004 define o tipo de vínculo de cada um destes. O que
    // continua em aberto é o VALOR, não o tipo: Q-001 a Q-003 para o Gerente e
    // Q-004 para o Assistente. Por isso eles têm tipo e não têm remuneração.
    { id: 'v01', pessoa_id: 'p01', tipo: 'administracao',            inicio: '2024-01-15' },
    { id: 'v02', pessoa_id: 'p02', tipo: 'administracao',            inicio: '2024-01-15' },
    { id: 'v03', pessoa_id: 'p03', tipo: 'financeiro',               inicio: '2024-03-01' },
    { id: 'v04', pessoa_id: 'p04', tipo: 'gerente_obras',            ciclo_pagamento: 'por_obra', inicio: '2024-06-01' },
    { id: 'v05', pessoa_id: 'p05', tipo: 'gerente_obras',            ciclo_pagamento: 'por_obra', inicio: '2025-02-01' },
    { id: 'v06', pessoa_id: 'p06', tipo: 'assistente_gerenciamento', inicio: '2025-08-01' },

    // ── Ciclo SEMANAL — fecha 22/08 ──
    { id: 'v07', pessoa_id: 'p07', tipo: 'funcionario_proprio', ciclo_pagamento: 'semanal', valor_diaria_centavos: 25000, inicio: '2025-03-01' },
    { id: 'v08', pessoa_id: 'p08', tipo: 'funcionario_proprio', ciclo_pagamento: 'semanal', valor_diaria_centavos: 18000, inicio: '2025-03-01' },
    { id: 'v11', pessoa_id: 'p11', tipo: 'funcionario_proprio', ciclo_pagamento: 'semanal', valor_diaria_centavos: 25000, inicio: '2025-01-01' },
    { id: 'v12', pessoa_id: 'p12', tipo: 'funcionario_proprio', ciclo_pagamento: 'semanal', valor_diaria_centavos: 25000, inicio: '2025-01-01' },
    { id: 'v13', pessoa_id: 'p13', tipo: 'funcionario_proprio', ciclo_pagamento: 'semanal', valor_diaria_centavos: 24000, inicio: '2025-01-01' },
    { id: 'v14', pessoa_id: 'p14', tipo: 'funcionario_proprio', ciclo_pagamento: 'semanal', valor_diaria_centavos: 23000, inicio: '2025-01-01' },
    { id: 'v15', pessoa_id: 'p15', tipo: 'funcionario_proprio', ciclo_pagamento: 'semanal', valor_diaria_centavos: 23000, inicio: '2025-01-01' },
    { id: 'v16', pessoa_id: 'p16', tipo: 'funcionario_proprio', ciclo_pagamento: 'semanal', valor_diaria_centavos: 22000, inicio: '2025-01-01' },
    { id: 'v17', pessoa_id: 'p17', tipo: 'funcionario_proprio', ciclo_pagamento: 'semanal', valor_diaria_centavos: 22000, inicio: '2025-01-01' },
    { id: 'v18', pessoa_id: 'p18', tipo: 'funcionario_proprio', ciclo_pagamento: 'semanal', valor_diaria_centavos: 20000, inicio: '2025-01-01' },
    { id: 'v19', pessoa_id: 'p19', tipo: 'funcionario_proprio', ciclo_pagamento: 'semanal', valor_diaria_centavos: 20000, inicio: '2025-01-01' },
    { id: 'v20', pessoa_id: 'p20', tipo: 'funcionario_proprio', ciclo_pagamento: 'semanal', valor_diaria_centavos: 18000, inicio: '2025-01-01' },
    { id: 'v21', pessoa_id: 'p21', tipo: 'funcionario_proprio', ciclo_pagamento: 'semanal', valor_diaria_centavos: 18000, inicio: '2025-01-01' },
    { id: 'v22', pessoa_id: 'p22', tipo: 'funcionario_proprio', ciclo_pagamento: 'semanal', valor_diaria_centavos: 18000, inicio: '2025-01-01' },
    // ── Ciclo QUINZENAL — fecha 29/08 ──
    { id: 'v23', pessoa_id: 'p23', tipo: 'funcionario_proprio', ciclo_pagamento: 'quinzenal', valor_diaria_centavos: 25000, inicio: '2025-02-01' },
    { id: 'v24', pessoa_id: 'p24', tipo: 'funcionario_proprio', ciclo_pagamento: 'quinzenal', valor_diaria_centavos: 18000, inicio: '2025-02-01' },
    { id: 'v25', pessoa_id: 'p25', tipo: 'funcionario_proprio', ciclo_pagamento: 'quinzenal', valor_diaria_centavos: 23000, inicio: '2025-02-01' },
    { id: 'v26', pessoa_id: 'p26', tipo: 'funcionario_proprio', ciclo_pagamento: 'quinzenal', valor_diaria_centavos: 22000, inicio: '2025-02-01' },
    { id: 'v27', pessoa_id: 'p27', tipo: 'funcionario_proprio', ciclo_pagamento: 'quinzenal', valor_diaria_centavos: 18000, inicio: '2025-02-01' },
    { id: 'v28', pessoa_id: 'p28', tipo: 'funcionario_proprio', ciclo_pagamento: 'quinzenal', valor_diaria_centavos: 18000, inicio: '2025-02-01' },
    // ── Ciclo MENSAL — fecha 31/08 ──
    { id: 'v29', pessoa_id: 'p29', tipo: 'funcionario_proprio', ciclo_pagamento: 'mensal', valor_diaria_centavos: 25000, inicio: '2024-11-01' },
    { id: 'v30', pessoa_id: 'p30', tipo: 'funcionario_proprio', ciclo_pagamento: 'mensal', valor_diaria_centavos: 18000, inicio: '2024-11-01' },
    { id: 'v31', pessoa_id: 'p31', tipo: 'funcionario_proprio', ciclo_pagamento: 'mensal', valor_diaria_centavos: 23000, inicio: '2024-11-01' },
    // ── TERCEIRIZADOS — ciclo por obra ──
    { id: 'v09', pessoa_id: 'p09', tipo: 'terceirizado', ciclo_pagamento: 'por_obra', valor_obra_centavos: 320000, inicio: '2026-05-01' },
    { id: 'v32', pessoa_id: 'p32', tipo: 'terceirizado', ciclo_pagamento: 'por_obra', valor_obra_centavos: 280000, inicio: '2026-06-01' },
    { id: 'v33', pessoa_id: 'p33', tipo: 'terceirizado', ciclo_pagamento: 'por_obra', valor_obra_centavos: 190000, inicio: '2026-06-15' },
    { id: 'v34', pessoa_id: 'p34', tipo: 'terceirizado', ciclo_pagamento: 'por_obra', valor_obra_centavos: 240000, inicio: '2026-07-01' },
    // Wagner Lopes (p10) teve vínculo encerrado ao ser desativado em 12/06.
    { id: 'v10', pessoa_id: 'p10', tipo: 'funcionario_proprio', ciclo_pagamento: 'semanal', valor_diaria_centavos: 22000, inicio: '2025-01-01', fim: '2026-06-12' },
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
      // Em andamento, e não pausada: a pendência "diário faltando" do item 3.4
      // só é derivada para obra em andamento — ver calcularPendencias.
      estado: 'em_andamento',
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
    // Ana Carvalho (p06) é Assistente de Gerenciamento no elenco fixo, não
    // Gerente de Obras. A gerência da Obra 25 passa para Rafael Duarte e Ana
    // fica como assistente, que é o papel dela.
    { id: 'vo04', obra_id: 'o03', pessoa_id: 'p04', papel: 'gerente',    inicio: '2026-06-10' },
    { id: 'vo05', obra_id: 'o04', pessoa_id: 'p04', papel: 'gerente',    inicio: '2026-08-01' },
    { id: 'vo06', obra_id: 'o05', pessoa_id: 'p05', papel: 'gerente',    inicio: '2026-07-14' },
    { id: 'vo07', obra_id: 'o03', pessoa_id: 'p06', papel: 'assistente', inicio: '2026-06-10' },
  ],

  // ─── AMBIENTES ────────────────────────────────────────────────────────────
  ambientes: [
    // Obra 22 - MCL
    { id: 'a01', obra_id: 'o01', nome: 'Suíte Master' },
    { id: 'a02', obra_id: 'o01', nome: 'Banheiro da Suíte' },
    { id: 'a03', obra_id: 'o01', nome: 'Cozinha' },
    { id: 'a04', obra_id: 'o01', nome: 'Sala' },
    { id: 'a05', obra_id: 'o01', nome: 'Lavabo' },
    // Obra 18 - GFR
    { id: 'a06', obra_id: 'o02', nome: 'Dormitório Principal' },
    { id: 'a07', obra_id: 'o02', nome: 'Banheiro Social' },
    { id: 'a08', obra_id: 'o02', nome: 'Cozinha' },
    { id: 'a09', obra_id: 'o02', nome: 'Sala de Estar' },
    // Obra 25 - ATB
    { id: 'a10', obra_id: 'o03', nome: 'Sala' },
    { id: 'a11', obra_id: 'o03', nome: 'Cozinha' },
    { id: 'a12', obra_id: 'o03', nome: 'Banheiro' },
    // Obra 31 - MBP — aguardando início, orçamento aprovado e nada executado
    { id: 'a13', obra_id: 'o04', nome: 'Suíte' },
    { id: 'a14', obra_id: 'o04', nome: 'Banheiro da Suíte' },
    { id: 'a15', obra_id: 'o04', nome: 'Cozinha' },
    { id: 'a16', obra_id: 'o04', nome: 'Sala' },
    // Serviço 04 - LSM — pequeno serviço
    { id: 'a17', obra_id: 'o05', nome: 'Sala' },
    { id: 'a18', obra_id: 'o05', nome: 'Corredor' },
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

    // ── Obra 18 - GFR — 20 itens, 8 executados → 40% TECTO ──
    // Dormitório Principal: 5 itens, 4 executados
    { id: 'i31', obra_id: 'o02', ambiente_id: 'a06', servico: 'Demolição de forro existente',      quantidade: 18, unidade: 'm²', valor_centavos: 126000, executado: true,  executado_em: '2026-06-08', executado_por: 'p11' },
    { id: 'i32', obra_id: 'o02', ambiente_id: 'a06', servico: 'Forro de gesso acartonado',         quantidade: 18, unidade: 'm²', valor_centavos: 234000, executado: true,  executado_em: '2026-06-22', executado_por: 'p33' },
    { id: 'i33', obra_id: 'o02', ambiente_id: 'a06', servico: 'Ponto de elétrica',                 quantidade: 8,  unidade: 'un', valor_centavos: 152000, executado: true,  executado_em: '2026-07-06', executado_por: 'p09' },
    { id: 'i34', obra_id: 'o02', ambiente_id: 'a06', servico: 'Regularização de contrapiso',       quantidade: 18, unidade: 'm²', valor_centavos: 162000, executado: true,  executado_em: '2026-07-28', executado_por: 'p12' },
    { id: 'i35', obra_id: 'o02', ambiente_id: 'a06', servico: 'Piso de madeira laminado',          quantidade: 18, unidade: 'm²', valor_centavos: 342000, executado: false },
    // Banheiro Social: 5 itens, 3 executados
    { id: 'i36', obra_id: 'o02', ambiente_id: 'a07', servico: 'Demolição de revestimento',         quantidade: 22, unidade: 'm²', valor_centavos: 154000, executado: true,  executado_em: '2026-06-10', executado_por: 'p13' },
    { id: 'i37', obra_id: 'o02', ambiente_id: 'a07', servico: 'Impermeabilização',                 quantidade: 6,  unidade: 'm²', valor_centavos: 108000, executado: true,  executado_em: '2026-06-25', executado_por: 'p13' },
    { id: 'i38', obra_id: 'o02', ambiente_id: 'a07', servico: 'Ponto de hidráulica',               quantidade: 5,  unidade: 'un', valor_centavos: 135000, executado: true,  executado_em: '2026-07-14', executado_por: 'p34' },
    { id: 'i39', obra_id: 'o02', ambiente_id: 'a07', servico: 'Assentamento de porcelanato',       quantidade: 22, unidade: 'm²', valor_centavos: 352000, executado: false },
    { id: 'i40', obra_id: 'o02', ambiente_id: 'a07', servico: 'Instalação de louças e metais',     quantidade: 1,  unidade: 'vb', valor_centavos: 168000, executado: false },
    // Cozinha: 6 itens, 1 executado
    { id: 'i41', obra_id: 'o02', ambiente_id: 'a08', servico: 'Demolição de bancada',              quantidade: 1,  unidade: 'vb', valor_centavos: 68000,  executado: true,  executado_em: '2026-07-20', executado_por: 'p11' },
    { id: 'i42', obra_id: 'o02', ambiente_id: 'a08', servico: 'Ponto de hidráulica',               quantidade: 4,  unidade: 'un', valor_centavos: 108000, executado: false },
    { id: 'i43', obra_id: 'o02', ambiente_id: 'a08', servico: 'Ponto de elétrica',                 quantidade: 9,  unidade: 'un', valor_centavos: 171000, executado: false },
    { id: 'i44', obra_id: 'o02', ambiente_id: 'a08', servico: 'Revestimento de parede',            quantidade: 26, unidade: 'm²', valor_centavos: 338000, executado: false },
    { id: 'i45', obra_id: 'o02', ambiente_id: 'a08', servico: 'Bancada de quartzo',                quantidade: 1,  unidade: 'vb', valor_centavos: 480000, executado: false },
    { id: 'i46', obra_id: 'o02', ambiente_id: 'a08', servico: 'Marcenaria planejada',              quantidade: 1,  unidade: 'vb', valor_centavos: 920000, executado: false },
    // Sala de Estar: 4 itens, 0 executados
    { id: 'i47', obra_id: 'o02', ambiente_id: 'a09', servico: 'Regularização de contrapiso',       quantidade: 32, unidade: 'm²', valor_centavos: 288000, executado: false },
    { id: 'i48', obra_id: 'o02', ambiente_id: 'a09', servico: 'Piso de madeira laminado',          quantidade: 32, unidade: 'm²', valor_centavos: 608000, executado: false },
    { id: 'i49', obra_id: 'o02', ambiente_id: 'a09', servico: 'Pintura de paredes e teto',         quantidade: 78, unidade: 'm²', valor_centavos: 234000, executado: false },
    { id: 'i50', obra_id: 'o02', ambiente_id: 'a09', servico: 'Instalação de luminárias',          quantidade: 6,  unidade: 'un', valor_centavos: 96000,  executado: false },

    // ── Obra 25 - ATB — 16 itens, 4 executados → 25% TECTO ──
    // Sala: 6 itens, 2 executados
    { id: 'i51', obra_id: 'o03', ambiente_id: 'a10', servico: 'Demolição de piso existente',       quantidade: 28, unidade: 'm²', valor_centavos: 196000, executado: true,  executado_em: '2026-06-18', executado_por: 'p23' },
    { id: 'i52', obra_id: 'o03', ambiente_id: 'a10', servico: 'Remoção de forro',                  quantidade: 28, unidade: 'm²', valor_centavos: 168000, executado: true,  executado_em: '2026-06-24', executado_por: 'p23' },
    { id: 'i53', obra_id: 'o03', ambiente_id: 'a10', servico: 'Forro de gesso acartonado',         quantidade: 28, unidade: 'm²', valor_centavos: 364000, executado: false },
    { id: 'i54', obra_id: 'o03', ambiente_id: 'a10', servico: 'Regularização de contrapiso',       quantidade: 28, unidade: 'm²', valor_centavos: 252000, executado: false },
    { id: 'i55', obra_id: 'o03', ambiente_id: 'a10', servico: 'Assentamento de porcelanato',       quantidade: 28, unidade: 'm²', valor_centavos: 448000, executado: false },
    { id: 'i56', obra_id: 'o03', ambiente_id: 'a10', servico: 'Pintura de paredes e teto',         quantidade: 70, unidade: 'm²', valor_centavos: 210000, executado: false },
    // Cozinha: 6 itens, 2 executados
    { id: 'i57', obra_id: 'o03', ambiente_id: 'a11', servico: 'Demolição de revestimento',         quantidade: 24, unidade: 'm²', valor_centavos: 168000, executado: true,  executado_em: '2026-06-30', executado_por: 'p29' },
    { id: 'i58', obra_id: 'o03', ambiente_id: 'a11', servico: 'Ponto de hidráulica',               quantidade: 4,  unidade: 'un', valor_centavos: 108000, executado: true,  executado_em: '2026-07-10', executado_por: 'p34' },
    { id: 'i59', obra_id: 'o03', ambiente_id: 'a11', servico: 'Ponto de elétrica',                 quantidade: 8,  unidade: 'un', valor_centavos: 152000, executado: false },
    { id: 'i60', obra_id: 'o03', ambiente_id: 'a11', servico: 'Revestimento de parede',            quantidade: 24, unidade: 'm²', valor_centavos: 312000, executado: false },
    { id: 'i61', obra_id: 'o03', ambiente_id: 'a11', servico: 'Assentamento de porcelanato',       quantidade: 12, unidade: 'm²', valor_centavos: 192000, executado: false },
    { id: 'i62', obra_id: 'o03', ambiente_id: 'a11', servico: 'Bancada de granito',                quantidade: 1,  unidade: 'vb', valor_centavos: 320000, executado: false },
    // Banheiro: 4 itens, 0 executados
    { id: 'i63', obra_id: 'o03', ambiente_id: 'a12', servico: 'Impermeabilização',                 quantidade: 5,  unidade: 'm²', valor_centavos: 90000,  executado: false },
    { id: 'i64', obra_id: 'o03', ambiente_id: 'a12', servico: 'Assentamento de porcelanato',       quantidade: 20, unidade: 'm²', valor_centavos: 320000, executado: false },
    { id: 'i65', obra_id: 'o03', ambiente_id: 'a12', servico: 'Instalação de louças e metais',     quantidade: 1,  unidade: 'vb', valor_centavos: 158000, executado: false },
    { id: 'i66', obra_id: 'o03', ambiente_id: 'a12', servico: 'Box de vidro temperado',            quantidade: 1,  unidade: 'vb', valor_centavos: 145000, executado: false },

    // ── Obra 31 - MBP — 18 itens, 0 executados → 0% TECTO (aguardando início) ──
    { id: 'i67', obra_id: 'o04', ambiente_id: 'a13', servico: 'Demolição de forro existente',      quantidade: 20, unidade: 'm²', valor_centavos: 140000, executado: false },
    { id: 'i68', obra_id: 'o04', ambiente_id: 'a13', servico: 'Forro de gesso acartonado',         quantidade: 20, unidade: 'm²', valor_centavos: 260000, executado: false },
    { id: 'i69', obra_id: 'o04', ambiente_id: 'a13', servico: 'Ponto de elétrica',                 quantidade: 10, unidade: 'un', valor_centavos: 190000, executado: false },
    { id: 'i70', obra_id: 'o04', ambiente_id: 'a13', servico: 'Piso de madeira laminado',          quantidade: 20, unidade: 'm²', valor_centavos: 380000, executado: false },
    { id: 'i71', obra_id: 'o04', ambiente_id: 'a13', servico: 'Marcenaria planejada',              quantidade: 1,  unidade: 'vb', valor_centavos: 1180000, executado: false },
    { id: 'i72', obra_id: 'o04', ambiente_id: 'a14', servico: 'Impermeabilização',                 quantidade: 7,  unidade: 'm²', valor_centavos: 126000, executado: false },
    { id: 'i73', obra_id: 'o04', ambiente_id: 'a14', servico: 'Ponto de hidráulica',               quantidade: 6,  unidade: 'un', valor_centavos: 162000, executado: false },
    { id: 'i74', obra_id: 'o04', ambiente_id: 'a14', servico: 'Assentamento de porcelanato',       quantidade: 24, unidade: 'm²', valor_centavos: 384000, executado: false },
    { id: 'i75', obra_id: 'o04', ambiente_id: 'a14', servico: 'Instalação de louças e metais',     quantidade: 1,  unidade: 'vb', valor_centavos: 210000, executado: false },
    { id: 'i76', obra_id: 'o04', ambiente_id: 'a14', servico: 'Box de vidro temperado',            quantidade: 1,  unidade: 'vb', valor_centavos: 165000, executado: false },
    { id: 'i77', obra_id: 'o04', ambiente_id: 'a15', servico: 'Demolição de bancada',              quantidade: 1,  unidade: 'vb', valor_centavos: 72000,  executado: false },
    { id: 'i78', obra_id: 'o04', ambiente_id: 'a15', servico: 'Ponto de hidráulica',               quantidade: 5,  unidade: 'un', valor_centavos: 135000, executado: false },
    { id: 'i79', obra_id: 'o04', ambiente_id: 'a15', servico: 'Revestimento de parede',            quantidade: 30, unidade: 'm²', valor_centavos: 390000, executado: false },
    { id: 'i80', obra_id: 'o04', ambiente_id: 'a15', servico: 'Bancada de quartzo',                quantidade: 1,  unidade: 'vb', valor_centavos: 520000, executado: false },
    { id: 'i81', obra_id: 'o04', ambiente_id: 'a16', servico: 'Regularização de contrapiso',       quantidade: 40, unidade: 'm²', valor_centavos: 360000, executado: false },
    { id: 'i82', obra_id: 'o04', ambiente_id: 'a16', servico: 'Piso de madeira laminado',          quantidade: 40, unidade: 'm²', valor_centavos: 760000, executado: false },
    { id: 'i83', obra_id: 'o04', ambiente_id: 'a16', servico: 'Pintura de paredes e teto',         quantidade: 96, unidade: 'm²', valor_centavos: 288000, executado: false },
    { id: 'i84', obra_id: 'o04', ambiente_id: 'a16', servico: 'Instalação de luminárias',          quantidade: 8,  unidade: 'un', valor_centavos: 128000, executado: false },

    // ── Serviço 04 - LSM — 8 itens, 7 executados → 87% TECTO ──
    { id: 'i85', obra_id: 'o05', ambiente_id: 'a17', servico: 'Preparação de paredes',             quantidade: 62, unidade: 'm²', valor_centavos: 124000, executado: true,  executado_em: '2026-07-16', executado_por: 'p16' },
    { id: 'i86', obra_id: 'o05', ambiente_id: 'a17', servico: 'Massa corrida',                     quantidade: 62, unidade: 'm²', valor_centavos: 155000, executado: true,  executado_em: '2026-07-22', executado_por: 'p16' },
    { id: 'i87', obra_id: 'o05', ambiente_id: 'a17', servico: 'Pintura — primeira demão',          quantidade: 62, unidade: 'm²', valor_centavos: 186000, executado: true,  executado_em: '2026-08-04', executado_por: 'p17' },
    { id: 'i88', obra_id: 'o05', ambiente_id: 'a17', servico: 'Pintura — segunda demão',           quantidade: 62, unidade: 'm²', valor_centavos: 186000, executado: true,  executado_em: '2026-08-19', executado_por: 'p17' },
    { id: 'i89', obra_id: 'o05', ambiente_id: 'a18', servico: 'Preparação de paredes',             quantidade: 24, unidade: 'm²', valor_centavos: 48000,  executado: true,  executado_em: '2026-07-18', executado_por: 'p26' },
    { id: 'i90', obra_id: 'o05', ambiente_id: 'a18', servico: 'Massa corrida',                     quantidade: 24, unidade: 'm²', valor_centavos: 60000,  executado: true,  executado_em: '2026-07-24', executado_por: 'p26' },
    { id: 'i91', obra_id: 'o05', ambiente_id: 'a18', servico: 'Pintura — primeira demão',          quantidade: 24, unidade: 'm²', valor_centavos: 72000,  executado: true,  executado_em: '2026-08-06', executado_por: 'p26' },
    { id: 'i92', obra_id: 'o05', ambiente_id: 'a18', servico: 'Pintura — segunda demão',           quantidade: 24, unidade: 'm²', valor_centavos: 72000,  executado: false },
  ],

  // ─── PLANEJAMENTO (semana 17–22/08) ───────────────────────────────────────
  planejamento: [
    // ══ SEMANA CORRENTE 17–22/08 — PUBLICADA ══
    // Cobre as 23 pessoas de campo do elenco fixo do AGENTS.md §6, mais Rafael
    // e Ana, que vão a obra, e os 4 terceirizados.

    // Rafael Duarte — MCL, exceto 19/08 em GFR. É a origem da divergência do
    // item 3.5: planejado em GFR, presente em MCL.
    ...S1.map((data, j) => ({
      id: `pl_p04_${j}`,
      semana_inicio: '2026-08-17',
      pessoa_id: 'p04',
      data,
      obra_id: data === '2026-08-19' ? 'o02' : 'o01',
      recebe: true,
      adicional_centavos: 0,
      estado: 'publicado' as const,
    })),
    ...aloca('p06', 'o01', S1.slice(0, 4)), // Ana Carvalho

    // ── Obra 22 - MCL ──
    ...aloca('p07', 'o01'),                 // Marcos Bittencourt
    ...aloca('p11', 'o01'),                 // Adilson Prado
    ...aloca('p14', 'o01'),                 // Nilton Barreto
    ...aloca('p18', 'o01'),                 // Valdir Chagas
    ...aloca('p20', 'o01'),                 // Josimar Andrade
    ...aloca('p28', 'o01'),                 // Anselmo Freitas
    ...aloca('p31', 'o01'),                 // Anísio Trindade
    ...aloca('p09', 'o01', S1.slice(0, 4)), // Cleber Matos, terceirizado

    // ── Obra 18 - GFR ──
    ...aloca('p12', 'o02'),                 // Edmilson Vieira
    ...aloca('p13', 'o02'),                 // Claudinei Sartori
    ...aloca('p15', 'o02'),                 // Reinaldo Peçanha
    ...aloca('p19', 'o02'),                 // Israel Fontes — também em MCL em 19/08
    ...aloca('p21', 'o02'),                 // Ubiratan Coelho
    ...aloca('p22', 'o02'),                 // Genivaldo Reis
    ...aloca('p30', 'o02'),                 // Wanderley Prazeres
    ...aloca('p32', 'o02', S1.slice(1, 4)), // Dorival Assunção, terceirizado
    ...aloca('p33', 'o02', S1.slice(0, 3)), // Tarcísio Melo, terceirizado

    // ── Obra 25 - ATB — a obra sem diário do item 3.4 ──
    ...aloca('p23', 'o03'),                 // Erasmo Peixoto
    ...aloca('p24', 'o03'),                 // Belarmino Souza
    ...aloca('p25', 'o03'),                 // Osmar Cavalcante
    ...aloca('p27', 'o03'),                 // Deusdete Farias
    ...aloca('p29', 'o03'),                 // Nazareno Correia
    ...aloca('p34', 'o03', S1.slice(2, 4)), // Rogério Pastore, terceirizado

    // ── Serviço 04 - LSM ──
    ...aloca('p16', 'o05', S1.slice(0, 5)), // Sebastião Nóbrega
    ...aloca('p17', 'o05', S1.slice(0, 5)), // Otávio Bonfim
    ...aloca('p26', 'o05', S1.slice(0, 5)), // Osvaldo Ramalho
    // Jonas Ribeiro — planejado a semana toda. Faltou doente em 20/08 e a
    // decisão de pagamento fica pendente. Ver o diário d06.
    ...aloca('p08', 'o05'),

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
    // GFR (o02): Adilson, Edmilson seg–sex; Claudinei seg–qui
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
    // LSM (o05): Sebastião Nóbrega seg–sex
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
    // MBP (o04): Otávio Bonfim seg–sex (obra aguardando início)
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
    // Em aberto (3 pessoas): Nilton Barreto, Valdir Chagas, Genivaldo Reis
    { id: 'pl2_ab_p14_0', semana_inicio: '2026-08-24', pessoa_id: 'p14', data: '2026-08-24', em_aberto: true, recebe: false, adicional_centavos: 0, estado: 'rascunho' as const },
    { id: 'pl2_ab_p14_1', semana_inicio: '2026-08-24', pessoa_id: 'p14', data: '2026-08-25', em_aberto: true, recebe: false, adicional_centavos: 0, estado: 'rascunho' as const },
    { id: 'pl2_ab_p18_0', semana_inicio: '2026-08-24', pessoa_id: 'p18', data: '2026-08-24', em_aberto: true, recebe: false, adicional_centavos: 0, estado: 'rascunho' as const },
    { id: 'pl2_ab_p22_0', semana_inicio: '2026-08-24', pessoa_id: 'p22', data: '2026-08-26', em_aberto: true, recebe: false, adicional_centavos: 0, estado: 'rascunho' as const },
    { id: 'pl2_ab_p22_1', semana_inicio: '2026-08-24', pessoa_id: 'p22', data: '2026-08-27', em_aberto: true, recebe: false, adicional_centavos: 0, estado: 'rascunho' as const },
    // Ausências: Israel Fontes de férias (recebe) seg–sáb; Reinaldo Peçanha folga (não recebe) na segunda
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
      // É o diário que o Mestre preenche ao vivo na Cena 6. Nasce em RASCUNHO,
      // sem texto, sem foto e sem presença: tudo isso é gravado ao finalizar.
      // Os planejados de hoje em MCL pré-preenchem o formulário — são 8, bem
      // acima dos 4 que o item 3.3 exige.
      id: 'd02',
      obra_id: 'o01',
      data: HOJE,
      estado: 'rascunho',
      texto: [],
      fotos: [],
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
    // GFR — 18/08
    {
      id: 'd_18b',
      obra_id: 'o02',
      data: '2026-08-18',
      estado: 'finalizado',
      texto: ['Contrapiso do dormitório principal regularizado. Conduítes do banheiro social passados.'],
      fotos: [],
      finalizado_por: 'p05',
      finalizado_em: '2026-08-18T17:10:00',
    },
    // GFR — hoje, finalizado
    {
      id: 'd04',
      obra_id: 'o02',
      data: HOJE,
      estado: 'finalizado',
      texto: ['Assentamento de porcelanato no banheiro social iniciado. Demolição da bancada da cozinha concluída.'],
      fotos: [],
      houve_execucao: true,
      finalizado_por: 'p05',
      finalizado_em: '2026-08-20T17:20:00',
    },
    // LSM — 18/08
    {
      id: 'd_18c',
      obra_id: 'o05',
      data: '2026-08-18',
      estado: 'finalizado',
      texto: ['Massa corrida do corredor lixada. Primeira demão na sala aplicada.'],
      fotos: [],
      finalizado_por: 'p05',
      finalizado_em: '2026-08-18T16:40:00',
    },
    // LSM — hoje, finalizado. Jonas Ribeiro estava planejado e faltou doente;
    // o Gerente informou a ausência e a decisão de pagamento fica com a
    // Administração. É a pendência do item 3.7.
    {
      id: 'd06',
      obra_id: 'o05',
      data: HOJE,
      estado: 'finalizado',
      texto: ['Segunda demão na sala concluída. Corredor aguardando retoque final.'],
      fotos: [],
      houve_execucao: true,
      finalizado_por: 'p05',
      finalizado_em: '2026-08-20T16:15:00',
      removidos_planejados: [{ pessoa_id: 'p08', motivo: 'Doente' }],
    },
    // ATB — sem diário de 19/08 nem de 20/08. É intencional: gera a pendência
    // "diário faltando" do item 3.4, e por isso a obra está em_andamento.
  ],

  // ─── PRESENÇAS ────────────────────────────────────────────────────────────
  // Toda presença aponta para o diário da MESMA obra e da MESMA data. O seed
  // anterior tinha 8 presenças de 20/08 apontando para diários de 19/08.
  // O diário de hoje da MCL é rascunho e por isso não tem presença: elas são
  // gravadas quando o diário é finalizado, ao vivo.
  presencas: [
    // ── 14/08 — MCL ──
    ...['p07', 'p08', 'p09'].map((pid) => ({
      id: `pr_14_${pid}`, diario_id: 'd_14', obra_id: 'o01', pessoa_id: pid,
      data: '2026-08-14', periodo: 'dia_todo' as const,
    })),
    // ── 18/08 ──
    ...['p04', 'p06', 'p07', 'p09', 'p11', 'p14', 'p18', 'p20', 'p28', 'p31'].map((pid) => ({
      id: `pr_18_${pid}`, diario_id: 'd_18', obra_id: 'o01', pessoa_id: pid,
      data: '2026-08-18', periodo: 'dia_todo' as const,
    })),
    ...['p12', 'p13', 'p15', 'p19', 'p21', 'p22', 'p30', 'p32', 'p33'].map((pid) => ({
      id: `pr_18b_${pid}`, diario_id: 'd_18b', obra_id: 'o02', pessoa_id: pid,
      data: '2026-08-18', periodo: 'dia_todo' as const,
    })),
    ...['p08', 'p16', 'p17', 'p26'].map((pid) => ({
      id: `pr_18c_${pid}`, diario_id: 'd_18c', obra_id: 'o05', pessoa_id: pid,
      data: '2026-08-18', periodo: 'dia_todo' as const,
    })),
    // ── 19/08 — MCL. Rafael estava planejado em GFR e apareceu aqui: é a
    // divergência do item 3.5, derivada na exibição e nunca gravada.
    ...['p04', 'p06', 'p07', 'p09', 'p11', 'p14', 'p18', 'p20', 'p28', 'p31'].map((pid) => ({
      id: `pr_19a_${pid}`, diario_id: 'd01', obra_id: 'o01', pessoa_id: pid,
      data: ONTEM, periodo: 'dia_todo' as const,
    })),
    // Israel Fontes esteve nas DUAS obras em 19/08 — meio período em cada.
    // São 2 presenças e UMA diária só, sem obra definida. Item 3.6.
    { id: 'pr_19a_p19', diario_id: 'd01', obra_id: 'o01', pessoa_id: 'p19', data: ONTEM, periodo: 'manha' },
    { id: 'pr_19b_p19', diario_id: 'd03', obra_id: 'o02', pessoa_id: 'p19', data: ONTEM, periodo: 'tarde' },
    // ── 19/08 — GFR e LSM ──
    ...['p12', 'p13', 'p15', 'p21', 'p22', 'p30', 'p32', 'p33'].map((pid) => ({
      id: `pr_19b_${pid}`, diario_id: 'd03', obra_id: 'o02', pessoa_id: pid,
      data: ONTEM, periodo: 'dia_todo' as const,
    })),
    ...['p08', 'p16', 'p17', 'p26'].map((pid) => ({
      id: `pr_19c_${pid}`, diario_id: 'd05', obra_id: 'o05', pessoa_id: pid,
      data: ONTEM, periodo: 'dia_todo' as const,
    })),
    // ── 20/08 — GFR e LSM finalizados. MCL é rascunho e não tem presença.
    // Jonas Ribeiro não aparece: faltou doente, e é a pendência do item 3.7.
    ...['p12', 'p13', 'p15', 'p19', 'p21', 'p22', 'p30', 'p32'].map((pid) => ({
      id: `pr_20b_${pid}`, diario_id: 'd04', obra_id: 'o02', pessoa_id: pid,
      data: HOJE, periodo: 'dia_todo' as const,
    })),
    ...['p16', 'p17', 'p26'].map((pid) => ({
      id: `pr_20c_${pid}`, diario_id: 'd06', obra_id: 'o05', pessoa_id: pid,
      data: HOJE, periodo: 'dia_todo' as const,
    })),
  ],

  // ─── DIÁRIAS ──────────────────────────────────────────────────────────────
  // O valor é COPIADO do vínculo no momento do fato e congelado aqui. Nenhuma
  // tela lê o vínculo para descobrir quanto a pessoa ganha.
  // Gerente, Assistente e terceirizado por obra têm diária de valor zero: o
  // regime deles é Q-001 a Q-005 em docs/ABERTO.md, e não se afirma aqui.
  diarias: [
    ...[
      { d: '2026-08-14', obra: 'o01', pessoas: [['p07', 25000], ['p08', 18000], ['p09', 0]] },
      { d: '2026-08-18', obra: 'o01', pessoas: [['p04', 0], ['p06', 0], ['p07', 25000], ['p09', 0], ['p11', 25000], ['p14', 23000], ['p18', 20000], ['p20', 18000], ['p28', 18000], ['p31', 23000]] },
      { d: '2026-08-18', obra: 'o02', pessoas: [['p12', 25000], ['p13', 24000], ['p15', 23000], ['p19', 20000], ['p21', 18000], ['p22', 18000], ['p30', 18000], ['p32', 0], ['p33', 0]] },
      { d: '2026-08-18', obra: 'o05', pessoas: [['p08', 18000], ['p16', 22000], ['p17', 22000], ['p26', 22000]] },
      { d: ONTEM,        obra: 'o01', pessoas: [['p04', 0], ['p06', 0], ['p07', 25000], ['p09', 0], ['p11', 25000], ['p14', 23000], ['p18', 20000], ['p20', 18000], ['p28', 18000], ['p31', 23000]] },
      { d: ONTEM,        obra: 'o02', pessoas: [['p12', 25000], ['p13', 24000], ['p15', 23000], ['p21', 18000], ['p22', 18000], ['p30', 18000], ['p32', 0], ['p33', 0]] },
      { d: ONTEM,        obra: 'o05', pessoas: [['p08', 18000], ['p16', 22000], ['p17', 22000], ['p26', 22000]] },
      { d: HOJE,         obra: 'o02', pessoas: [['p12', 25000], ['p13', 24000], ['p15', 23000], ['p19', 20000], ['p21', 18000], ['p22', 18000], ['p30', 18000], ['p32', 0]] },
      { d: HOJE,         obra: 'o05', pessoas: [['p16', 22000], ['p17', 22000], ['p26', 22000]] },
    ].flatMap(({ d, obra, pessoas }) =>
      (pessoas as [string, number][]).map(([pid, valor]) => ({
        id: `di_${d.slice(5).replace('-', '')}_${obra}_${pid}`,
        pessoa_id: pid,
        data: d,
        obra_que_arca_id: obra,
        valor_centavos: valor,
        adicional_centavos: 0,
      }))
    ),
    // Israel Fontes em 19/08: duas presenças, UMA diária, sem obra que arca.
    // O Financeiro escolhe qual obra paga; a outra fica com custo zero.
    { id: 'di_1908_rateio_p19', pessoa_id: 'p19', data: ONTEM, obra_que_arca_id: undefined, valor_centavos: 20000, adicional_centavos: 0 },
  ],
  // ─── FECHAMENTOS ──────────────────────────────────────────────────────────
  // Ciclo semanal: 18 pessoas, fecha 22/08
  // ─── FECHAMENTOS ──────────────────────────────────────────────────────────
  // Um Fechamento por CICLO e por PESSOA, nunca global por semana.
  //
  // `total_centavos` é o valor A PAGAR — líquido, depois dos descontos e já
  // com o piso em zero. É o mesmo significado que `executarFechamento` grava
  // ao fechar o ciclo. Semear o bruto aqui faria o Painel dizer R$7.740,00 e a
  // tela de Fechamento dizer R$6.680,00 para a mesma semana, que é exatamente
  // o tipo de número que não bate na frente do cliente.
  //
  // Quem está na Obra 25 - ATB tem total ZERO: a obra não tem diário, logo não
  // tem presença nem diária. É a pendência que bloqueia o fechamento.
  fechamentos: [
    // ── SEMANAL — 17/08 a 22/08, 14 pessoas ──
    // Marcos desconta 1 parcela de R$300,00; Jonas, adiantamento de R$400,00
    // contra R$360,00 de ganho; Valdir, R$1.200,00 contra R$400,00. Os dois
    // últimos ficam em zero e rolam a diferença.
    ...([
      ['p07', 20000], ['p08', 0],     ['p11', 50000], ['p12', 75000],
      ['p13', 72000], ['p14', 46000], ['p15', 69000], ['p16', 66000],
      ['p17', 66000], ['p18', 0],     ['p19', 60000], ['p20', 36000],
      ['p21', 54000], ['p22', 54000],
    ] as [string, number][]).map(([pessoa_id, total]) => ({
      id: `fc_sem_${pessoa_id}`,
      ciclo: 'semanal' as const,
      pessoa_id,
      periodo_inicio: '2026-08-17',
      periodo_fim: '2026-08-22',
      estado: 'aberto' as const,
      total_centavos: total,
      fechado_por: undefined,
    })),
    // ── QUINZENAL — 15/08 a 29/08, 6 pessoas ──
    ...([
      ['p23', 0], ['p24', 0], ['p25', 0], ['p26', 66000], ['p27', 0], ['p28', 36000],
    ] as [string, number][]).map(([pessoa_id, total]) => ({
      id: `fc_qui_${pessoa_id}`,
      ciclo: 'quinzenal' as const,
      pessoa_id,
      periodo_inicio: '2026-08-15',
      periodo_fim: '2026-08-29',
      estado: 'aberto' as const,
      total_centavos: total,
      fechado_por: undefined,
    })),
    // ── MENSAL — 01/08 a 31/08, 3 pessoas ──
    ...([
      ['p29', 0], ['p30', 54000], ['p31', 46000],
    ] as [string, number][]).map(([pessoa_id, total]) => ({
      id: `fc_men_${pessoa_id}`,
      ciclo: 'mensal' as const,
      pessoa_id,
      periodo_inicio: '2026-08-01',
      periodo_fim: '2026-08-31',
      estado: 'aberto' as const,
      total_centavos: total,
      fechado_por: undefined,
    })),
  ],

  // ─── LANÇAMENTOS ──────────────────────────────────────────────────────────
  lancamentos: [
    { id: 'la01', pessoa_id: 'p08', tipo: 'adiantamento', valor_centavos: 40000,  parcelas: 1, parcelas_pagas: 0, data: '2026-08-15' },
    { id: 'la02', pessoa_id: 'p07', tipo: 'emprestimo',   valor_centavos: 120000, parcelas: 4, parcelas_pagas: 1, data: '2026-07-01' },
    // Valdir Chagas — item 3.10. O adiantamento de R$1.200,00 é MAIOR que o
    // ciclo dele: com diária de R$200,00, uma semana cheia dá R$1.000,00.
    // O pagamento não fica negativo; o saldo rola para o ciclo seguinte.
    { id: 'la03', pessoa_id: 'p18', tipo: 'adiantamento', valor_centavos: 120000, parcelas: 1, parcelas_pagas: 0, data: '2026-08-17' },
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
    // Valdir Chagas — parcela única, maior que o ciclo dele. Ver la03.
    { id: 'pa06', lancamento_id: 'la03', numero: 1, valor_centavos: 120000, situacao: 'pendente', ciclo_periodo_fim: '2026-08-22' },
  ],

  // ─── NOTIFICAÇÕES ─────────────────────────────────────────────────────────
  // Cada uma aponta para um registro que existe de fato neste seed. Nenhuma
  // descreve evento inventado. 6 notificações, 4 não lidas.
  // ─── NOTIFICAÇÕES ─────────────────────────────────────────────────────────
  // Cada uma aponta para um registro que existe de fato neste seed, e cada uma
  // corresponde a uma das cinco pendências que o Painel deriva hoje, mais os
  // dois diários finalizados. 7 notificações, 5 não lidas.
  notificacoes: [
    {
      id: 'nt01', tipo: 'divergencia', origem_tipo: 'diario', origem_id: 'd01',
      titulo: 'Divergência: Rafael Duarte',
      descricao: 'Planejado em Obra 18 - GFR, presente em Obra 22 - MCL em 19/08/2026',
      data: '2026-08-19T18:32:00', lida: false,
    },
    {
      id: 'nt02', tipo: 'rateio_pendente', origem_tipo: 'diaria', origem_id: 'di_1908_rateio_p19',
      titulo: 'Rateio pendente: Israel Fontes',
      descricao: 'Diária de 19/08/2026 sem obra definida — esteve em duas obras',
      data: '2026-08-19T18:40:00', lida: false,
    },
    {
      id: 'nt03', tipo: 'diario_pendente', origem_tipo: 'obra', origem_id: 'o03',
      titulo: 'Diário faltando: Obra 25 - ATB',
      descricao: 'Nenhum diário finalizado em 19/08/2026 ou 20/08/2026',
      data: '2026-08-20T08:00:00', lida: false,
    },
    {
      id: 'nt04', tipo: 'ausencia_sem_decisao', origem_tipo: 'diario', origem_id: 'd06',
      titulo: 'Decisão de pagamento: Jonas Ribeiro',
      descricao: 'Doente — dia 20/08/2026. A Administração decide se o dia é pago.',
      data: '2026-08-20T16:15:00', lida: false,
    },
    {
      id: 'nt05', tipo: 'fechamento_proximo', origem_tipo: 'fechamento', origem_id: 'fc_sem_p07',
      titulo: 'Fechamento semanal em 22/08/2026',
      descricao: '14 pessoas aguardando fechamento do ciclo semanal',
      data: '2026-08-20T08:00:00', lida: false,
    },
    {
      id: 'nt06', tipo: 'diario_finalizado', origem_tipo: 'diario', origem_id: 'd04',
      titulo: 'Diário finalizado: Obra 18 - GFR',
      descricao: 'Sofia Monteiro finalizou o diário de 20/08/2026',
      data: '2026-08-20T17:20:00', lida: true,
    },
    {
      id: 'nt07', tipo: 'diario_finalizado', origem_tipo: 'diario', origem_id: 'd_18',
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
    // O diário de hoje da MCL (d02) é rascunho e não tem foto ainda: as mídias
    // dele são gravadas quando o diário for finalizado, ao vivo.
  ],

  // ─── ITENS FORA DO ESCOPO ─────────────────────────────────────────────────
  itens_fora_escopo: [],
};

export default DADOS;
