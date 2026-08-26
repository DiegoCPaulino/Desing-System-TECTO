CONTEXTO FIXO deste projeto:
- Use o Design System, o estado compartilhado e o CampoLayout já criados.
  Nenhum número ou nome escrito à mão — tudo vem do estado.
- Amarelo #FFC213 só em marca, botão primário e progresso. Nunca texto.
- Todos os rótulos em português do Brasil. Não traduza nada.

TAREFA: construir o Diário de Obra, tela mobile do Gerente, na rota
/campo/diario, e a confirmação de divergência. Substitui a página "Em breve".

1. MOLDURA
   A tela é mobile, 390px de largura. Renderize-a dentro de uma moldura de
   celular de 390x844, centralizada na página, sobre fundo grafite #363636.
   Quem abrir no computador deve entender na hora que é a tela do celular
   do gerente em obra.

2. CAMPOLAYOUT
   - Topo compacto: logo TECTO pequeno à esquerda, "Obra 22 - MCL" em
     negrito ao centro, avatar "RD" à direita. Abaixo, em 13px #666666,
     "Quinta, 20 de agosto" e o badge "Rascunho".
   - Barra inferior fixa com três itens e ícone: Hoje (ativo) · Minhas
     obras · Planejamento. Os dois últimos abrem a página "Em breve"
     dentro do CampoLayout.
   - Na tela de Obra, o botão "Abrir diário de hoje" passa a navegar
     para /campo/diario.

3. SEÇÃO "HOUVE TRABALHO HOJE?"
   Dois botões grandes lado a lado: "Sim, teve execução" (selecionado) e
   "Não teve execução". Ao escolher "Não teve execução", as seções 4, 5 e 6
   somem e aparece no lugar uma lista de motivos — Clima · Falta de material
   · Obra parada · Feriado · Outro — sendo que "Outro" abre campo de texto.
   Voltar para "Sim" restaura tudo.

4. SEÇÃO "QUEM TRABALHOU HOJE"
   Título com contador à direita, calculado: "5 de 5 confirmados".
   Vem PRÉ-PREENCHIDA a partir do planejamento publicado desta obra nesta
   data. Se o planejamento não tiver pessoas nesta obra hoje, crie no
   estado: Marcos Bittencourt, Jonas Ribeiro, Adilson Prado, Valdir Chagas
   e Israel Fontes planejados para outra obra hoje.
   Cada linha da lista tem:
   - Avatar com iniciais, nome em negrito, função em 13px #666666.
   - Um seletor de período com três opções em pílula: "Dia todo"
     (pré-selecionado), "Manhã", "Tarde".
   - Um botão de remover à direita, que desmarca a pessoa.
   Pessoa desmarcada continua visível, esmaecida, com o motivo registrado
   ao lado, e um botão "Desfazer".
   Abaixo da lista, um botão secundário de largura total:
   "+ Adicionar quem veio", que abre uma folha inferior com campo de busca
   e a lista de pessoas com vínculo ativo.

5. SEÇÃO "O QUE FOI EXECUTADO"
   - Um botão grande, de largura total, com ícone de microfone:
     "Gravar relato de voz".
   - Ao tocar: o botão vira estado de gravação, com onda animada, cronômetro
     correndo e o texto "Gravando... toque para parar".
   - Ao parar: por 2 segundos exibe "Transcrevendo e organizando...".
   - Em seguida, o campo de texto abaixo é preenchido com este conteúdo já
     estruturado, e acima dele aparece, em 13px #666666, a nota
     "Transcrito e organizado automaticamente · toque para editar":

     SERVIÇOS EXECUTADOS
     - Assentamento de porcelanato na cozinha, cerca de 18 m²
     - Rejunte do banheiro da suíte, concluído
     - Limpeza e retirada de entulho no período da tarde
     MATERIAIS RECEBIDOS
     - Gesso, entregue pela manhã, armazenado na área de serviço
     PRÓXIMO DIA
     - Continuidade do porcelanato da cozinha

   - O campo é editável depois disso, e também aceita digitação direta sem
     gravar áudio.

6. SEÇÃO "FOTOS E VÍDEOS"
   Grade de miniaturas quadradas, 3 por linha, com fotos reais de reforma
   residencial. O primeiro quadrado é um botão "+" que acrescenta mais uma
   foto à grade a cada toque. Contador no título: "6 fotos · 2 vídeos".

7. RODAPÉ FIXO
   Botão primário de largura total "Finalizar diário" e, abaixo, botão
   fantasma "Salvar rascunho".

8. CONFIRMAÇÃO DE DIVERGÊNCIA — folha inferior, disparada em dois casos:

 8.1 Ao REMOVER alguém que estava planejado para esta obra hoje:
     Título "Diferente do planejado".
     Texto: "Jonas Ribeiro estava planejado para esta obra hoje."
     Pergunta obrigatória "O que aconteceu?" com os motivos em lista:
     Doente · Dispensado pela empresa · Falta · Folga · Outro.
     Abaixo, em 13px #666666: "A Administração decidirá se o dia é pago."
     Depois: "O planejamento será atualizado. Administração e Financeiro
     serão notificados."
     Botões "Confirmar" e "Cancelar". Cancelar desfaz a remoção.

 8.2 Ao ADICIONAR alguém que está alocado em outra obra hoje:
     Título "Diferente do planejado".
     Texto: "Israel Fontes não estava planejado para esta obra hoje. Ele
     está alocado em outra obra."
     IMPORTANTE: nunca diga qual é a outra obra. O Gerente não tem acesso
     a essa informação.
     Abaixo: "O planejamento será atualizado. Administração e Financeiro
     serão notificados."
     Botões "Confirmar" e "Cancelar".

   Em ambos os casos, ao confirmar, o registro original do planejamento
   NÃO é apagado. Grave a alteração por cima, mantendo o valor anterior,
   igual ao que já foi feito na tela de Planejamento.

9. AO FINALIZAR O DIÁRIO
   - Grave no estado: uma presença por pessoa confirmada, com o período
     escolhido; uma diária por pessoa, com valor_centavos COPIADO do
     vínculo naquele momento; o diário passa a 'finalizado', com
     finalizado_por e finalizado_em.
   - Para o Israel Fontes, que tem presença em duas obras hoje, crie uma
     única diária com obra_que_arca_id VAZIO.
   - Exiba uma confirmação: "Diário finalizado. 5 presenças e 5 diárias
     registradas. O cliente já pode ver o diário de hoje."
   - A tela vira somente leitura, com um aviso no topo: "Diário finalizado
     em 20/08 às 17:42 por Rafael Duarte. Alterações somente pela
     Administração." Todos os campos ficam desabilitados.

10. EFEITO NO PAINEL
    Como tudo vem do mesmo estado, ao voltar para o Painel a lista "Precisa
    da sua atenção" deve mudar sozinha: some o diário pendente da Obra 22,
    entra a diária do Israel Fontes sem obra definida, e entra a decisão de
    pagamento do Jonas Ribeiro. Não escreva essas linhas à mão — elas têm
    que ser derivadas.