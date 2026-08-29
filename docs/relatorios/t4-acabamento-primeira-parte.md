# Relatório — T4 · acabamento · primeira parte

## Commits

| hash | item | arquivos tocados |
|---|---|---:|
| `23498e5` | 1 — criar e aplicar `ValorMonetario` | 7 |
| `19829cc` | 2 — criar e aplicar `ChipVinculo` e registrar o sexto tratamento | 5 |
| `3447f89` | 3 — aplicar o design system ao Fechamento | 1 |
| `7147a8d` | 4 — cobrir estados vazios | 15 |
| `228c463` | 5 — confirmar ações que gravam | 5 |
| `1557a8a` | 6 — completar `/design-system` | 1 |
| este commit | atualizar o estado do protótipo e registrar o relatório | 2 |

## Item a item

### Item 1 — ValorMonetario

Criei `src/components/ValorMonetario.tsx` como único ponto visual de dinheiro.
O componente recebe centavos, usa `formatarReais`, mantém símbolo e número na
mesma linha, aplica numerais tabulares, alinha à direita por padrão e apresenta
negativos como `−R$ 400,00`, em vermelho.

Apliquei-o em Painel, Planejamento, Visão da Obra, Portal Financeiro e
Fechamento. O Portal passou a consumir exclusivamente `recebimentosDaObra`,
`adicionaisDaObra`, `custosVisiveisAoCliente` e `totaisDaObra`; não lê
`custos_obra` diretamente. Os valores permaneceram em R$ 160.800,00 de total,
R$ 12.480,00 de adicionais, R$ 96.480,00 recebidos e R$ 64.320,00 a receber,
com seis parcelas, dois adicionais e quatro notas visíveis.

Verificação em navegador, em 390, 800 e 1440 px:

- Pedro: Painel, Obra 22, Planejamento, Equipe e Fechamento;
- Rafael: Painel, Obra 22, Planejamento e Diário;
- Mariana: Minha Obra e Financeiro do Portal;
- inspeção do Portal confirmou que custo e margem não aparecem para o Cliente;
- o grep final por moeda, `toLocaleString` e `formatarReais` deixou apenas a
  implementação de `ValorMonetario.tsx`.

### Item 2 — ChipVinculo

Criei `src/components/ChipVinculo.tsx` para os seis valores de `Vinculo.tipo`.
Os cinco tratamentos da D5 foram mantidos. Para `financeiro`, defini o sexto
tratamento como fundo neutro com hachura diagonal e borda cinza; a escolha foi
registrada em `docs/DECISOES.md`.

Apliquei o chip em Equipe, Diário e Planejamento. A Equipe também passou a
filtrar pelos seis tipos reais, sem agrupamento por ids de pessoas.

Verificação em navegador, em 390, 800 e 1440 px:

- Equipe: 33 chips ativos e os seis tipos presentes;
- Planejamento: 30 chips na grade da semana corrente;
- Diário da Obra 22: 10 chips na equipe do dia;
- smoke de Pedro, Rafael e Mariana nas telas permitidas de cada perfil.

### Item 3 — Design system no Fechamento

Apliquei `TituloSecao`, `CabecalhoTabela`, `Avatar`, `DataComDiaSemana`,
`ValorMonetario` e `ChipVinculo` à tela de Fechamento. Também normalizei cartões,
abas, tabelas e folhas laterais com os tokens existentes.

Não alterei chamadas, cálculos, pendências ou critérios de bloqueio. Em
particular, `calcularFechamentoDaPessoa`, `pendenciasQueBloqueiam`,
`todosOsCiclos`, `definirObraQueArcaNaDiaria` e
`executarFechamentoDoCiclo` permaneceram intactos.

Verificação em navegador, em 390, 800 e 1440 px:

- ciclo semanal: duas datas compartilhadas, oito cabeçalhos, 16 avatares e os
  valores monetários da tabela e dos extratos;
- ciclo por obra: quatro cabeçalhos e seis chips de vínculo;
- o botão de execução continuou bloqueado pelas mesmas pendências;
- smoke de Pedro e Portal de Mariana; a negação de Rafael em `/financeiro` foi
  confirmada pela declaração de perfil da rota, pois o menu dele não oferece o
  link necessário para exercitar essa URL sem recarregar a sessão em memória.

### Item 4 — Estados vazios

Criei `src/components/EstadoVazio.tsx`, com variações neutra, positiva e
compacta, além de suporte a ação. Substituí mensagens genéricas e vazios
silenciosos em Carteira, Equipe, Planejamento, Diário, Fechamento, Painel,
Checklist, Andamento, Fotos, Visão da Obra e nas três páginas do Portal.

Casos exercitados no navegador:

- Obra 31: visão geral sem diário, aba Diários vazia e aba Fotos vazia;
- Obra 25: abas Todos, Com fotos e Sem execução sem diários;
- Checklist: `itens_fora_escopo` vazio com ação “Registrar fora do escopo”;
- Fechamento por obra: aviso explícito de que o ciclo não tem período definido,
  sem afirmar a regra de pagamento ainda aberta;
- filtros vazios de Carteira, Equipe, Planejamento e Checklist.

Depois do item, Painel, Obra 22, Planejamento, Diário, Equipe, Fechamento e
Portal passaram no smoke de 390, 800 e 1440 px com Pedro, Rafael e Mariana nas
telas permitidas de cada perfil.

### Item 5 — Confirmações visíveis

Padronizei as confirmações com `role="status"`, `aria-live="polite"` e o mesmo
verbo da ação. Foram cobertos:

- `Publicar` → `Publicado` e `Salvar alterações` → `Alterações salvas`;
- `Finalizar diário` → `Diário finalizado`;
- `Marcar`/`Desmarcar` checklist → `Marcado`/`Desmarcado`;
- `Concluir` ambiente → `Concluído`;
- `Executar fechamento` → `Executado`;
- `Salvar ajuste` → `Ajuste salvo`;
- `Salvar rascunho` fora do escopo → `Rascunho salvo`.

No navegador, publiquei a semana seguinte, marquei checklist, concluí um
ambiente, salvei um rascunho fora do escopo e salvei um ajuste de
desconto. Cada ação exibiu a confirmação esperada; uma recarga restaurou o
estado em memória entre cenários. Não finalizei o diário de 20/08 da Obra 22.
Semanal, quinzenal e mensal tinham pendências bloqueantes, então a execução do
Fechamento foi verificada por leitura em `src/pages/Fechamento.tsx`, sem forçar
o fluxo nem remover pendências.

O smoke completo voltou a passar em 390, 800 e 1440 px nos três perfis.

### Item 6 — /design-system

`/design-system` agora importa e demonstra as seis implementações reais:
`TituloSecao`, `Avatar`, `CabecalhoTabela`, `DataComDiaSemana`,
`ValorMonetario` e `ChipVinculo`.

Estados documentados:

- título como `h2`, `h3` e `p`;
- Avatar em quatro tamanhos e nas 34 identidades do estado;
- cabeçalho como `th`, `span` e `div`, com três alinhamentos;
- data nos modos padrão, destaque e grade;
- dinheiro positivo, zero, negativo, em tabela e em largura estreita;
- os seis vínculos nos modos padrão e compacto.

Em 390, 800 e 1440 px, a rota exibiu seis blocos, cinco exemplos monetários e
12 chips, cobrindo os seis tipos. A regressão final percorreu Painel, Obra 22,
Planejamento, Diário, Equipe, Fechamento e Portal nos três tamanhos e perfis
aplicáveis, sem erro de execução.

Ao final, `npx tsc --noEmit`, `npm run build`, `git diff --check` e os greps de
aceite passaram. O build mantém somente os avisos preexistentes do Vite sobre o
futuro carregador nativo e o bundle maior que 500 kB.

## O que eu decidi por conta própria

- O sinal negativo fica antes do símbolo monetário, com o glifo tipográfico
  `−`, porque `formatarReais` coloca o sinal entre símbolo e número.
- No Portal, mantive apenas as quatro entradas de materiais/notas da tela
  anterior. O item `Serviço TECTO`, embora seguro na projeção de visibilidade,
  não pertence à seção “Materiais e notas”; assim os números e linhas visíveis
  não mudaram.
- O sexto tratamento de vínculo usa hachura neutra, diferenciando Financeiro
  sem tomar emprestado positivo, atenção, negativo ou informativo.
- Estados vazios positivos usam verde apenas quando a ausência representa uma
  situação concluída, como não haver pendências.
- Confirmações receberam atributos acessíveis e um marcador de teste
  `data-confirmacao-acao`, sem criar estado de domínio novo.

## O que eu não fiz e por quê

- Não alterei `src/state/**` nem `src/routes.ts`.
- Não alterei cálculo, chamada de estado ou bloqueio do Fechamento.
- Não finalizei o diário de 20/08 da Obra 22, preservando a cena de demonstração.
- Não forcei nenhum ciclo de Fechamento: todos os ciclos temporais estavam
  bloqueados por pendências reais.
- Não implementei notificações, ambiente obrigatório de mídia nem a derivação do
  cliente no `PortalLayout`; o prompt determina que esses três pontos ficam para
  a segunda metade da T4.
- Não implementei filtros de notas/documentos; o item foi cancelado e voltou
  para a T6.
- Não corrigi responsividade estrutural do layout, porque o aceite proíbe mudar
  layout nesta rodada.

## Achados

- `src/layouts/AppLayout.tsx:111` mantém a sidebar fixa com 248 px. Em 390 px,
  ela comprime o conteúdo das páginas internas e exige rolagem horizontal.
- `src/layouts/AppLayout.tsx:67` deixa Equipe fora de `NAV_GERENTE`, enquanto
  `src/routes.ts:104` permite a rota a todos os perfis internos. Por isso Equipe
  não é alcançável pelo menu de Rafael.
- `src/layouts/PortalLayout.tsx:101` e `:103` ainda escrevem Mariana Costa Lima e
  a chave do avatar no layout. O próprio prompt adiou essa correção para a
  segunda metade da T4.
- A negação de Rafael em `/financeiro` está declarada em `src/routes.ts:107`,
  mas não pôde ser clicada diretamente: o menu de Rafael não mostra Financeiro
  e uma navegação completa para a URL limpa o perfil mantido apenas em memória.
