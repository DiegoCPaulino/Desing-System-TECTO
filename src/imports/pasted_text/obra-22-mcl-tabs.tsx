CONTEXTO FIXO deste projeto:
- Use o Design System, o AppLayout e o estado compartilhado já criados.
  Nenhum número escrito à mão — tudo calculado a partir do estado.
- Amarelo #FFC213 só em marca, botão primário, aba ativa e progresso.
  Nunca como cor de texto.
- Todos os rótulos em português do Brasil. Não traduza nada.

TAREFA: construir quatro abas da tela de Obra 22 - MCL, substituindo as
páginas "Em breve". Todas dentro do mesmo cabeçalho e das mesmas abas que
já existem — não redesenhe o cabeçalho da obra.

Rotas: /obras/22-mcl/checklist · /andamento · /diarios · /fotos

==================================================
ABA 1 — CHECKLIST DE EXECUÇÃO, rota /checklist
==================================================
É a lista de serviços a executar, agrupada por ambiente. NENHUM VALOR
APARECE NESTA TELA. Sem preço, sem total, sem percentual de valor. Só
serviço, quantidade e se está feito.

1. Faixa no topo: campo de busca "Buscar serviço", e três abas de filtro:
   Todos · Pendentes · Concluídos.
2. Cinco blocos, um por ambiente, cada um recolhível:
   - Cabeçalho do bloco: nome do ambiente, contador "8 de 10 concluídos",
     barra fina de progresso e badge "Concluído" quando estiver em 100%.
   - Dentro: uma linha por item de orçamento, com caixa de seleção grande
     à esquerda, nome do serviço, e à direita a quantidade com unidade —
     ex.: "18 m²", "4 un", "12 m linear".
   - Item concluído: caixa marcada, texto com risco leve, e em 11px
     #666666 "marcado por Rafael Duarte em 19/08".
3. Ordem dos ambientes: Suíte Master, Banheiro da Suíte, Cozinha, Sala,
   Lavabo. Os percentuais atuais são 100%, 80%, 45%, 20% e 0%.
4. MARCAR OU DESMARCAR um item grava no estado na hora e recalcula:
   o contador do ambiente, a barra do ambiente, o Andamento TECTO da obra,
   o percentual na Carteira de obras e o percentual no Portal do Cliente.
   Desmarcar é permitido — retrabalho acontece.
5. Ao marcar o último item pendente de um ambiente, o ambiente recebe o
   badge "Concluído" automaticamente e exibe por 3 segundos uma confirmação:
   "Cozinha concluída."
6. Um botão secundário no topo direito: "Registrar serviço fora do
   escopo". Abre uma folha lateral com campo de descrição, quantidade e
   unidade, e o texto em 13px #666666: "Serviços fora do escopo ficam em
   rascunho até a Administração revisar e transformar em orçamento
   adicional." Ao salvar, aparece uma faixa no topo do checklist:
   "2 serviços fora do escopo aguardando revisão da Administração."

==================================================
ABA 2 — ANDAMENTO, rota /andamento
==================================================
Duas visões lado a lado em telas largas, empilhadas em telas estreitas.

1. Bloco "ANDAMENTO TECTO":
   - Percentual grande, calculado por contagem de itens executados sobre
     o total, e a nota em 13px #666666: "48 de 100 serviços concluídos".
   - Lista dos cinco ambientes com barra e percentual. Cada ambiente
     expande e mostra os serviços com visto verde ou círculo vazio.
   - Sem valores.
2. Bloco "ANDAMENTO GERAL":
   - Percentual grande, com a nota: "obra completa, incluindo serviços de
     terceiros".
   - Lista por ambiente, SEM detalhamento de serviço, cada linha com o
     nome do ambiente, uma barra, o percentual e um botão de marcar como
     concluído.
   - Abaixo, um bloco "SERVIÇOS DE TERCEIROS" com cinco linhas —
     Marcenaria, Marmoraria, Vidro, Ar-condicionado e Gesso — cada uma com
     o ambiente onde acontece, o fornecedor e um badge de situação:
     "Concluído", "Em execução" ou "Aguardando". Sem valores.
   - Um botão secundário "Adicionar serviço de terceiro".
3. FAIXA DE ESCOPO AMPLIADO, no topo da aba, em cartão com fundo #FFF6D6
   e borda amarela:
   "Escopo ampliado em 19/08. Dois serviços adicionais aprovados
   acrescentaram 6 itens ao checklist. O percentual recuou de 51% para 48%
   por esse motivo."
   Isso explica ao cliente por que a barra pode andar para trás. Deve
   aparecer também no Portal do Cliente, na mesma situação.

==================================================
ABA 3 — DIÁRIOS, rota /diarios
==================================================
1. Título "Diários da obra" e, à direita, botão primário "Abrir diário de
   hoje", que navega para a tela do diário.
2. Faixa de filtro: campo de busca por texto e abas Todos · Com fotos ·
   Sem execução.
3. Lista vertical de cartões, do mais recente para o mais antigo, com os
   diários que existem no estado — 20/08, 19/08, 18/08, 17/08 e 14/08.
   Cada cartão traz:
   - Data em negrito, dia da semana em 13px #666666, e badge "Finalizado"
     ou "Rascunho".
   - As duas primeiras linhas do texto do diário, truncadas.
   - Faixa de até quatro miniaturas de foto.
   - Avatares sobrepostos de quem trabalhou, com "+2" quando houver mais.
   - Ao clicar, expande no lugar e mostra o texto completo, todas as fotos
     e a lista de presenças com nome, função e período trabalhado.
4. O diário de 17/08 é um dia sem execução: em vez de texto e fotos,
   mostra "Não houve execução — falta de material" em cinza.
5. Diário de período já fechado exibe um cadeado pequeno ao lado da data,
   e ao expandir mostra em cinza: "Período fechado. Alterações somente por
   estorno."

==================================================
ABA 4 — FOTOS, rota /fotos
==================================================
1. Título "Fotos da obra" e contador calculado: "34 fotos · 6 vídeos".
2. Filtros: abas por ambiente — Todos · Suíte Master · Banheiro da Suíte
   · Cozinha · Sala · Lavabo — e um seletor "Mais recentes" ou "Mais
   antigas".
3. Grade de miniaturas quadradas, 5 por linha em telas largas, agrupadas
   por data com um título de seção por dia: "20 DE AGOSTO" em caixa alta
   11px, com o contador de fotos daquele dia ao lado.
4. Vídeos aparecem na mesma grade, com um ícone de play sobreposto e a
   duração no canto.
5. Clicar em qualquer foto abre visualização ampliada sobre fundo escuro,
   com setas de navegação, contador "12 de 34", a data e o ambiente
   embaixo, e um botão de fechar.
6. Um botão secundário no topo direito: "Baixar todas".

==================================================
5. NAVEGAÇÃO
   As sete abas do cabeçalho da obra continuam funcionando como já
   funcionam. As quatro abas construídas aqui deixam de cair em "Em breve".
   Financeiro da obra e Documentos continuam em "Em breve".