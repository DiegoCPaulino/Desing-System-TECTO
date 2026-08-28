# Relatório — Pacote 1 · sistema visual compartilhado

## Commits

| hash | item | arquivos tocados |
|---|---|---:|
| `7cdac33` | 1 — criar e aplicar `Avatar` | 13 |
| `f4e0a20` | 2 — criar e aplicar `CabecalhoTabela` | 5 |
| `ff965af` | 3 — criar e aplicar `DataComDiaSemana` | 6 |
| `7d32b49` | 4 — substituir a imagem do Login por composição local | 1 |
| `2f012f5` | 5 — consolidar `/design-system` | 1 |
| este commit | registrar o estado e o relatório da tarefa | 2 |

## Item a item

### Item 1 — Avatar

Criei `src/components/Avatar.tsx`, um retrato SVG ilustrado e determinístico. Um
hash de `pessoaId` escolhe fundo, pele, cabelo, roupa e penteado; a mesma pessoa
recebe exatamente a mesma ilustração em qualquer tela e tamanho. Não há foto de
pessoa nem dependência de rede.

Substituí os avatares locais em Painel, Equipe, Diário, Planejamento, Carteira,
Visão da Obra, Login e Portal, além dos dois layouts. Os 34 registros de
`pessoas` permanecem no estado sem alteração.

Verificação em navegador, sempre em 390, 800 e 1440 px:

- Pedro: Painel, Obra 22, Planejamento, Diário e Equipe;
- Rafael: Painel, Obra 22, Planejamento e Diário;
- Mariana: Minha Obra e Diário do Portal;
- comparação das assinaturas SVG repetidas de Pedro, Rafael e Mariana;
- console sem erro de execução.

### Item 2 — CabecalhoTabela

Criei `src/components/CabecalhoTabela.tsx` com Inter Semibold, caixa alta e
`letter-spacing: 0.08em`. O componente aceita `th`, `span` e `div`, além de
alinhamento e `scope`.

Apliquei-o na tabela do Painel, na grade do Planejamento, na tabela do Portal
Financeiro e na referência visual. `Fechamento.tsx` foi excluído expressamente e
não foi tocado.

Verificação em navegador, nos três perfis e nas três larguras:

- Painel: quatro cabeçalhos compartilhados;
- Planejamento: sete cabeçalhos de grade;
- Portal Financeiro: cinco cabeçalhos;
- `/design-system`: os exemplos então existentes;
- estilos computados: Inter, peso 600, caixa alta e 0,88 px de espaçamento para
  fonte de 11 px;
- grep final: nenhum elemento `<th>` fora de `CabecalhoTabela.tsx`, excluído
  `Fechamento.tsx`.

### Item 3 — DataComDiaSemana

Criei `src/components/DataComDiaSemana.tsx`. O componente deriva o dia civil do
ISO sem depender do fuso do navegador e oferece três modos: padrão, destaque e
grade compacta. O formato completo é `20 de agosto · quinta-feira`; no modo de
grade, o formato completo permanece em `aria-label`, `title` e `data-formato`
para preservar a largura das colunas.

Removi formatadores e o mapa manual de datas duplicados. Apliquei o componente
nos cartões de Diários, no cabeçalho do Diário de hoje, no Planejamento, em
Minha Obra e no Diário do Portal.

Verificação em navegador, em 390, 800 e 1440 px:

- Pedro e Rafael: Planejamento, Diários da Obra 22 e Diário de hoje;
- Mariana: Minha Obra e Diário do Portal;
- os seis dias de 17 a 22/08 correspondem de segunda-feira a sábado;
- o Diário de hoje permaneceu em `Rascunho`;
- o Portal mostrou 19/08 como último diário finalizado, sem expor o rascunho de
  20/08;
- inspeção visual adicional do Portal em 1440 px e da grade em 390 px.

### Item 4 — Imagem do Login

Removi a imagem remota do Login e construí a metade esquerda como SVG local. A
composição usa grafite, grade técnica, bloco amarelo, folha de planta baixa,
paredes, portas, cotas e identificação da Obra 22. Não há rosto ou URL externa.

Verifiquei o Login em 390, 800 e 1440 px: o painel visual aparece a partir de
900 px, o logo TECTO permanece legível e os quatro perfis de demonstração ficam
disponíveis. Em 1440 px, a composição ocupa toda a metade esquerda. A página
teve zero imagens remotas e zero erros no console.

As telas obrigatórias do app foram revalidadas na matriz final do item 5. Isso
também cobre o estado posterior ao item 4, porque o item 5 alterou somente a
rota pública `/design-system`.

### Item 5 — /design-system

Reescrevi `DesignSystemPage.tsx` como referência apenas dos quatro componentes
que realmente existem. A página importa e renderiza as implementações de
produção, em vez de manter cópias locais.

Estados documentados:

- `TituloSecao`: `h2`, `h3`, `p` e margem inferior;
- `Avatar`: 28, 36, 48 e 64 px, além das 34 identidades do estado;
- `CabecalhoTabela`: `th`, `span`, `div` e alinhamentos esquerdo, central e
  direito;
- `DataComDiaSemana`: padrão, destaque e grade compacta.

Em 390, 800 e 1440 px, a rota mostrou exatamente quatro blocos, 38 instâncias de
Avatar (quatro tamanhos mais 34 identidades), seis cabeçalhos compartilhados e
três datas. A página ficou responsiva e o console de uma aba nova ficou sem
erros.

A regressão final em 390, 800 e 1440 px passou em:

- Pedro: Painel, Obra 22, Diário de hoje, Planejamento e Equipe;
- Rafael: Painel, Obra 22, Diário de hoje e Planejamento;
- Mariana: Minha Obra e Diário do Portal.

Também executei `npx tsc --noEmit`, `npm run build` e `git diff --check`. Todos
passaram. O build mantém apenas os avisos já existentes sobre o carregador
nativo futuro do Vite e o bundle maior que 500 kB.

## O que eu decidi por conta própria

- Usei um hash estável em vez de associar ilustrações manualmente; isso cobre
  qualquer pessoa futura sem criar dado no estado.
- Para Mariana, que não existe na coleção `pessoas`, usei a chave visual estável
  `cliente-o01`. Ela não cria entidade, campo ou registro; serve apenas como
  entrada determinística do SVG.
- Mantive o cabeçalho do Planejamento compacto e guardei o formato completo da
  data nos atributos acessíveis, evitando alargar a grade.
- Construí a ilustração do Login dentro da própria página porque ela é conteúdo
  exclusivo dessa tela, não um quinto componente compartilhado.
- A página `/design-system` lê o elenco do estado, em vez de repetir nomes no
  componente de demonstração.
- Nenhuma decisão de negócio ou arquitetura de domínio foi tomada; por isso
  `docs/DECISOES.md` não precisou de nova entrada.

## O que eu não fiz e por quê

- Não criei `ValorMonetario` nem `ChipVinculo`: as entidades necessárias seguem
  ausentes do estado e o prompt os excluiu desta tarefa.
- Não toquei em `src/state/**`, dados semeados, cálculo, permissão ou
  `src/pages/Fechamento.tsx`.
- Não finalizei o diário de 20/08 da Obra 22; ele continua em `Rascunho` para a
  demonstração.
- Não corrigi responsividade estrutural, cliques mortos, visibilidade financeira
  de Rafael nem imagens remotas fora do Login. Esses pontos são preexistentes e
  exigem tarefas próprias.
- Não consegui abrir Equipe pela interface de Rafael: a rota permite o perfil,
  mas o menu dele não oferece o link. Registrei o achado em vez de alterar
  navegação fora do escopo.

## Achados

- `src/layouts/AppLayout.tsx:111` mantém a sidebar com 248 px. Em 390 px ela
  ocupa a maior parte da tela; Planejamento e outras telas internas ficam
  visualmente cortados.
- `src/layouts/PortalLayout.tsx:101` e `:103` ainda escrevem Mariana e a chave do
  avatar diretamente; não existe associação entre sessão Cliente e obra.
- `src/pages/PortalFinanceiro.tsx:22`, `:31` e `:36` mantêm parcelas, adicionais
  e materiais como constantes locais. Em 390 px a página continua com conteúdo
  de aproximadamente 721 px e rolagem horizontal.
- `src/layouts/AppLayout.tsx:67` inicia `NAV_GERENTE` sem Equipe, embora a rota
  `/equipe` aceite todos os perfis internos.
- `src/pages/PainelDoDia.tsx:201` e `src/pages/Planejamento.tsx:303` continuam
  exibindo valores financeiros para Rafael. A regra de visibilidade pertence à
  área de permissão e cálculo do Claude Code.
- Carteira, Obra e Portal ainda dependem de imagens do Unsplash; o Login foi o
  único ativo externo substituído nesta tarefa.
