CONTEXTO FIXO deste projeto — vale sempre:
- Use o Design System já criado. Não altere o visual de telas existentes.
- Layout fluido, máximo 1440px, centralizado. Nunca rolagem horizontal.
- Amarelo #FFC213 só em marca, botão primário, aba ativa e barra de
  progresso. Nunca como cor de texto.
- Avatares em tons de grafite com iniciais brancas.
- Todos os rótulos em português do Brasil. Não traduza nada.

TAREFA: criar o estado compartilhado da aplicação e religar as telas
existentes a ele. Esta tarefa é de dados e comportamento, não de visual.
Nenhuma tela deve mudar de aparência.

1. CORREÇÃO PRÉVIA
   A barra lateral e o topo ficam fixos na tela. Só a área de conteúdo
   rola. Hoje a lateral está rolando junto com o conteúdo.

2. ESTADO COMPARTILHADO
   Crie um único módulo de estado global que todas as telas leem e
   escrevem. Nomeie as entidades e os campos exatamente assim, em
   português. Este vocabulário é obrigatório:

   pessoas: id, nome, iniciais, funcao, ativo, desativado_em
   vinculos: id, pessoa_id, tipo, ciclo_pagamento, valor_diaria_centavos,
     valor_obra_centavos, inicio, fim
   obras: id, codigo, tipo ('obra' ou 'pequeno_servico'), cliente,
     endereco, estado, inicio, previsao_termino, valor_contratado_centavos,
     adicionais_centavos, recebido_centavos
   vinculos_obra: id, obra_id, pessoa_id, papel ('gerente' ou
     'assistente'), inicio, fim
   ambientes: id, obra_id, nome
   itens_orcamento: id, obra_id, ambiente_id, servico, quantidade, unidade,
     valor_centavos, executado, executado_em, executado_por
   planejamento: id, semana_inicio, pessoa_id, data, obra_id,
     motivo_ausencia, recebe, adicional_centavos, estado ('rascunho' ou
     'publicado')
   diarios: id, obra_id, data, estado ('rascunho' ou 'finalizado'), texto,
     motivo_sem_execucao, fotos, finalizado_por, finalizado_em
   presencas: id, diario_id, obra_id, pessoa_id, data,
     periodo ('dia_todo', 'manha' ou 'tarde')
   diarias: id, pessoa_id, data, obra_que_arca_id, valor_centavos,
     adicional_centavos, definido_por
   fechamentos: id, ciclo, pessoa_id, periodo_inicio, periodo_fim,
     estado ('aberto' ou 'fechado'), total_centavos, fechado_por
   lancamentos: id, pessoa_id, tipo ('adiantamento', 'emprestimo' ou
     'estorno'), valor_centavos, parcelas, parcelas_pagas, data

3. REGRAS QUE O ESTADO OBEDECE, sem exceção
   - Todo valor monetário é número inteiro em centavos. A formatação em
     "R$ 148.320,00" acontece só na exibição. Nunca usar decimal.
   - O campo diarias.valor_centavos é copiado do vínculo no momento em que
     a diária é criada e nunca mais lido do vínculo. Alterar o valor de um
     vínculo não altera diárias já existentes.
   - Divergência entre planejamento e presença nunca é um campo guardado.
     É sempre calculada na hora de exibir, comparando as duas tabelas.
   - Nada é removido. Desativar pessoa preenche desativado_em. Corrigir
     valor cria um lançamento de estorno.

4. DATA DE REFERÊNCIA
   Hoje é quinta-feira, 20/08/2026. A semana corrente vai de segunda
   17/08 a sábado 22/08. Toda data exibida deriva disso. Corrija a data
   do Painel, que hoje diz 23 de agosto.

5. DADOS INICIAIS
   Pessoas, vínculos e obras conforme o elenco já usado, mais:
   - Wagner Lopes, pintor, funcionário próprio, desativado em 12/06/2026.
   - 30 pessoas no total, 24 com vínculo ativo.
   - Ambientes da Obra 22 - MCL: Suíte Master (100%), Banheiro da Suíte
     (80%), Cozinha (45%), Sala (20%), Lavabo (0%), com itens de orçamento
     coerentes com cada percentual.
   - Planejamento da semana 17/08 a 22/08 no estado 'publicado'.
   - Diário da Obra 22 - MCL de 19/08 finalizado, com presenças.
   - Diário da Obra 22 - MCL de hoje, 20/08, ainda em rascunho.
   - Diário da Obra 25 - ATB de 19/08 inexistente, ou seja, pendente.
   - Uma divergência: o planejamento de 19/08 põe Rafael Duarte na Obra
     18 - GFR, mas a presença de 19/08 registra Rafael Duarte na Obra
     22 - MCL.
   - Um rateio pendente: Marcos Bittencourt tem presença em 19/08 na Obra
     22 - MCL e na Obra 18 - GFR, e a diária dele desse dia ainda está com
     obra_que_arca_id vazio.
   - Adiantamento de R$ 400,00 para Jonas Ribeiro, em parcela única.
   - Empréstimo de R$ 1.200,00 para Marcos Bittencourt, em 4 parcelas,
     1 já paga.
   - Fechamentos abertos: ciclo semanal com 18 pessoas fechando em
     22/08/2026, quinzenal com 6 pessoas em 29/08, mensal com 4 pessoas
     em 31/08.

6. RELIGAR AS TELAS EXISTENTES
   Nenhuma tela pode ter número ou nome escrito diretamente no código.
   Tudo vem do estado:
   - Os quatro indicadores do Painel são CALCULADOS. "Pessoas em campo
     hoje" conta pessoas distintas com presença na data de hoje. "Diários
     pendentes" conta obras em andamento sem diário finalizado nos últimos
     dois dias. "A fechar" soma as diárias do ciclo que fecha primeiro.
   - A lista "Precisa da sua atenção" é derivada: divergências
     calculadas, diárias sem obra_que_arca_id, diários faltando,
     fechamentos próximos. Se uma pendência for resolvida, ela desaparece
     da lista e o contador cai.
   - A tabela "Quem está onde hoje" vem das presenças de hoje.
   - A Carteira, a tela de Equipe e a tela de Obra leem tudo do estado.
   - Os percentuais de Andamento TECTO e de cada Ambiente são calculados
     a partir dos itens_orcamento marcados como executados. Não escreva
     68% em nenhum lugar: o número tem que sair da conta.

7. AÇÕES JÁ FUNCIONAIS NESTA ETAPA
   - As abas de filtro da Carteira e da Equipe filtram de verdade.
   - Os campos de busca buscam de verdade, por nome de obra, cliente ou
     pessoa.
   - O seletor "Visualizar como" na tela de Obra funciona como já está.
   - Um ícone discreto de recarregar, em cinza claro, ao lado de
     "ADMINISTRAÇÃO" no rodapé da lateral, restaura os dados iniciais.
     Sem texto, sem destaque: é ferramenta de ensaio, não de demonstração.
