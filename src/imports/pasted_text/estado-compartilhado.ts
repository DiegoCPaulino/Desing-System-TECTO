CONTEXTO FIXO deste projeto — vale sempre:
- Use o Design System já criado.
- Todos os rótulos em português do Brasil. Não traduza nada.

TAREFA: criar o estado compartilhado da aplicação. Esta etapa é só de
dados. NÃO ALTERE NENHUMA TELA. Nenhum conteúdo, nenhum número, nenhum
texto de tela existente deve mudar nesta etapa. As telas continuam com os
dados que já têm; elas serão religadas ao estado em uma etapa seguinte.

Exceção única: a barra lateral e o topo passam a ficar fixos na tela, com
rolagem apenas na área de conteúdo. Hoje a lateral rola junto.

1. ESTADO COMPARTILHADO
   Crie um único módulo de estado global, acessível por qualquer tela.
   Nomeie entidades e campos exatamente assim, em português — este
   vocabulário é obrigatório e não deve ser traduzido nem abreviado:

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

2. REGRAS QUE O ESTADO OBEDECE, sem exceção
   - Todo valor monetário é inteiro em centavos. R$ 148.320,00 é gravado
     como 14832000. A formatação com R$ e vírgula acontece só na exibição.
     Nunca usar número decimal para dinheiro.
   - diarias.valor_centavos é copiado do vínculo no momento em que a diária
     é criada, e nunca mais lido do vínculo. Alterar um vínculo não altera
     diárias existentes.
   - Divergência entre planejamento e presença nunca é um campo guardado.
     É sempre calculada comparando as duas listas na hora de exibir.
   - Nada é apagado. Desativar pessoa preenche desativado_em. Corrigir
     valor cria um lançamento de tipo 'estorno'.

3. DATA DE REFERÊNCIA DO ESTADO
   Guarde no estado um valor "hoje" igual a 20/08/2026, quinta-feira, e uma
   "semana corrente" de segunda 17/08 a sábado 22/08. As telas ainda não
   usam esses valores nesta etapa.

4. DADOS INICIAIS
   - Pessoas: o elenco já usado no projeto, mais Wagner Lopes, pintor,
     funcionário próprio, ativo = falso, desativado_em 12/06/2026.
     Total de 30 pessoas, 24 com vínculo ativo.
   - Vínculos: Rafael Duarte e Sofia Monteiro por obra; Marcos Bittencourt,
     Jonas Ribeiro e Wagner Lopes com diária e ciclo semanal; Cleber Matos
     terceirizado com contrato em parcelas; Ana Carvalho com ciclo ainda
     não definido; Pedro Almeida e Fernanda Sousa sem remuneração no
     sistema.
   - Obras: as cinco já existentes, com valor_contratado_centavos coerente
     (a Obra 22 - MCL vale 14832000 e tem 1248000 de adicionais).
   - Ambientes da Obra 22 - MCL: Suíte Master, Banheiro da Suíte, Cozinha,
     Sala e Lavabo, com itens_orcamento em quantidade suficiente para que
     os executados resultem em 100%, 80%, 45%, 20% e 0% respectivamente.
   - Planejamento da semana 17/08 a 22/08, estado 'publicado', cobrindo
     todas as pessoas com vínculo ativo.
   - Diário da Obra 22 - MCL em 19/08 finalizado, com presenças.
   - Diário da Obra 22 - MCL em 20/08 em rascunho.
   - Nenhum diário para a Obra 25 - ATB em 19/08.
   - Divergência: o planejamento de 19/08 coloca Rafael Duarte na Obra
     18 - GFR, mas a presença de 19/08 registra Rafael Duarte na Obra
     22 - MCL.
   - Rateio pendente: Marcos Bittencourt tem presença em 19/08 na Obra
     22 - MCL e na Obra 18 - GFR, e a diária dele nessa data está com
     obra_que_arca_id vazio.
   - Lançamentos: adiantamento de 40000 centavos para Jonas Ribeiro em
     parcela única; empréstimo de 120000 centavos para Marcos Bittencourt
     em 4 parcelas, 1 paga.
   - Fechamentos abertos: semanal com 18 pessoas encerrando em 22/08/2026,
     quinzenal com 6 pessoas em 29/08, mensal com 4 pessoas em 31/08.

5. Ao terminar, liste no chat as entidades criadas e quantos registros cada
   uma recebeu. Não gere nenhuma tela nova nem altere as existentes.