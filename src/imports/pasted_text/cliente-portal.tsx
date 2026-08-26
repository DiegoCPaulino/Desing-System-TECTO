CONTEXTO FIXO deste projeto:
- Use o Design System, o PortalLayout e o estado compartilhado já criados.
- Amarelo #FFC213 só em marca, botão primário e progresso. Nunca texto.
- Todos os rótulos em português do Brasil. Não traduza nada.

TAREFA: construir o Portal do Cliente — três telas nas rotas /portal,
/portal/diario e /portal/financeiro. O usuário é Mariana Costa Lima,
cliente da Obra 22 - MCL. Ela é somente leitura: nenhum botão de editar,
salvar, aprovar ou enviar em tela alguma.

Esta é a tela mais importante do protótipo em acabamento visual. Mais ar,
mais foto, tipografia maior. Deve parecer um produto de consumo, não uma
ferramenta interna.

1. PORTALLAYOUT — completamente diferente do AppLayout. SEM barra lateral.
   - Topo branco, largura total: logo TECTO à esquerda; ao centro, três
     itens de menu horizontais — "Minha obra" · "Diário" · "Financeiro";
     à direita, "Mariana Costa Lima" com avatar.
   - Item ativo com sublinhado amarelo de 3px, igual às abas da tela de Obra.
   - Conteúdo com largura máxima de 1120px, centralizado.
   - Rodapé discreto: bloco amarelo pequeno com "TECTO" e, ao lado, em
     13px #666666, "Rua Joaquim Floriano, 820 — Itaim Bibi".
   - NUNCA exiba, em nenhuma das três telas: valor de diária, salário,
     custo de terceirizado, margem, percentual aplicado ou telefone de
     fornecedor.

2. TELA "MINHA OBRA", rota /portal
 a) Faixa de abertura: foto grande de apartamento em reforma, 320px de
    altura, cantos 12px. Sobreposta na parte inferior, com leve
    escurecimento: "Reforma do apartamento" em 32px branco e, abaixo,
    "Itaim Bibi · início em 14/04/2026" em 15px branco.
 b) Cartão "ANDAMENTO" com duas barras grandes:
    - "Serviços da TECTO", percentual calculado dos itens executados,
      barra amarela.
    - "Obra completa", percentual do andamento geral, barra grafite, com
      a nota em 13px #666666: "inclui marcenaria, marmoraria, vidro e
      ar-condicionado".
    - À direita do cartão, em bloco separado: "PREVISÃO DE ENTREGA" em
      caixa alta 11px e "30 de setembro de 2026" em 24px.
 c) Cartão "AMBIENTE POR AMBIENTE": cinco linhas com nome do ambiente,
    barra fina, percentual, e badge "Concluído" onde estiver em 100%.
    Cada linha expande ao clicar, mostrando a lista de serviços daquele
    ambiente com um visto verde nos concluídos e um círculo vazio nos
    pendentes. SEM VALOR ALGUM nessa lista.
 d) Cartão "O QUE ACONTECEU HOJE": data em caixa alta, o texto do diário
    de hoje, três fotos em miniatura e um link "Ver todos os dias".
 e) Cartão "QUEM ESTÁ NA SUA OBRA": chips com avatar, nome e função das
    pessoas que trabalharam hoje. Só nome e função, nada mais.

3. TELA "DIÁRIO", rota /portal/diario
 a) Título "Diário da obra" e, abaixo, "Acompanhe o que foi feito, dia
    por dia".
 b) Linha do tempo vertical, do mais recente para o mais antigo, com uma
    linha fina cinza à esquerda e um marcador circular por dia. Cinco
    dias: 20/08, 19/08, 18/08, 17/08 e 14/08.
    Cada entrada é um cartão contendo:
    - Data em negrito e o dia da semana em 13px #666666.
    - O texto do diário, com os títulos de seção — SERVIÇOS EXECUTADOS,
      MATERIAIS RECEBIDOS, PRÓXIMO DIA — em caixa alta 11px.
    - Grade de fotos, de 3 a 6 por dia, em miniaturas quadradas. Clicar
      abre a foto ampliada sobre fundo escuro, com setas para navegar.
    - Rodapé do cartão: chips das pessoas que trabalharam naquele dia.
 c) A entrada de 17/08 é um dia sem execução: em vez de texto e fotos,
    mostra apenas "Não houve execução — falta de material", em cinza.
 d) Filtro discreto no topo direito: "Todos os dias" · "Só com fotos".

4. TELA "FINANCEIRO", rota /portal/financeiro
 a) Título "Financeiro da sua obra".
 b) Três cartões no topo, cada um com label em caixa alta, valor em 32px
    tabular:
    TOTAL DA OBRA · JÁ PAGO · A PAGAR.
    Sob o total da obra, em 13px #666666: "inclui R$ 12.480,00 em
    serviços adicionais aprovados".
 c) Cartão "PARCELAS": tabela com Parcela, Vencimento, Valor, Situação.
    Seis parcelas — três com badge "Paga" verde e link "Comprovante",
    uma "Vence em 5 dias" em amarelo suave, duas "Futura" em cinza.
 d) Cartão "SERVIÇOS ADICIONAIS APROVADOS": duas linhas com descrição,
    data de aprovação e valor. Ao final, o total.
 e) Cartão "MATERIAIS E NOTAS": quatro linhas com fornecedor, descrição,
    data, valor e badge de modalidade — duas "Reembolsável" e duas
    "Direto do fornecedor". Cada linha com link "Ver nota".
    Sem telefone, sem contato, sem custo interno.
 f) Nenhum botão de pagar, aprovar ou contestar. É informativo.

5. LIGAÇÕES
   - Os três itens do topo navegam entre as três rotas.
   - "Ver todos os dias" leva para /portal/diario.
   - Na tela de Obra do sistema interno, acrescente ao cabeçalho um botão
     fantasma pequeno "Ver como o cliente vê", que abre /portal.

6. DERIVADO DO ESTADO
   Percentuais, ambientes, serviços, textos dos diários, fotos e nomes das
   pessoas vêm todos do estado compartilhado — os mesmos dados das telas
   internas. Se o Diário de hoje foi finalizado no app do gerente, ele
   aparece aqui. Os valores financeiros podem ser criados no estado se
   ainda não existirem.