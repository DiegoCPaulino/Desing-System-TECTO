# Relatório — Pacote 1 · sistema visual

## Commits

| hash | item | arquivos tocados |
|---|---|---|
| `b050b38` | 1 — criar e aplicar `TituloSecao` | `src/components/TituloSecao.tsx` e 8 páginas |
| este commit | registrar estado real e bloqueio do pacote | `docs/ESTADO_DO_PROTOTIPO.md`, `docs/relatorios/pacote-1-sistema-visual.md` |

## Item a item

### Item 1 — TituloSecao

Criei o componente compartilhado com um bloco amarelo de 6 × 18 px antes do
título. O amarelo é preenchimento; o texto é grafite. O componente usa `h2` por
padrão e permite `h3` ou `p` quando a hierarquia da tela exigir.

Removi as oito definições locais `SectionLabel` e apliquei o componente em:

- Painel;
- Visão Geral e Andamento da Obra;
- Planejamento;
- Diário;
- Minha Obra e Financeiro do Portal;
- Design System.

Verificações executadas antes do commit:

- `npx tsc --noEmit`: passou sem erros;
- `git diff --check`: passou;
- grep por `SectionLabel`: nenhum resultado em `src/pages` e `src/components`;
- Pedro, em 390, 800 e 1440 px: Painel, Obra 22, Diário, Planejamento e Equipe;
- Rafael, em 390, 800 e 1440 px: Painel, Obra 22, Diário e Planejamento;
- Mariana, em 390, 800 e 1440 px: Minha Obra e Financeiro do Portal;
- inspeção semântica: todos os títulos de seção dessas páginas tinham o bloco
  `rgb(255, 194, 19)` e hierarquia `h2`;
- inspeção visual: Design System em 1440 px e Portal Financeiro em 390 px;
- console do navegador: nenhuma mensagem de nível `error`.

Equipe não contém título de seção, apenas o título de página, por isso não houve
elemento a substituir. Como Rafael, a tela não pôde ser aberta pela interface:
o perfil tem permissão de rota, mas o menu lateral não oferece o link Equipe.

### Item 2 — ValorMonetario · bloqueado antes da alteração

O item exige aplicar o componente em todos os valores e comprovar que não resta
`R$` ou formatação monetária fora dele. Isso não pode ser feito com o estado
atual sem violar os circuit breakers.

`PortalFinanceiro.tsx` declara localmente `PARCELAS`, `ADICIONAIS` e
`MATERIAIS`, com valores já formatados em strings. O estado não possui coleções
equivalentes. Converter essas strings em números locais, derivar parcelas dentro
da página ou criar entidades em `src/state/**` seria inventar dado ou cálculo e
entrar na área exclusiva do Claude Code.

O bloqueio foi identificado antes de criar `ValorMonetario`; nenhum código
parcial do item foi deixado no repositório.

### Itens 3 a 8 — não iniciados

Não iniciei `Avatar`, `ChipVinculo`, `CabecalhoTabela`,
`DataComDiaSemana`, a composição do Login nem a consolidação final de
`/design-system`. O prompt do P1B determina execução em ordem e manda parar
quando um item depende de entidade ausente no estado.

## O que eu decidi por conta própria

- Escolhi o bloco amarelo à esquerda, em vez de uma barra ocupando toda a
  altura do cartão. É o mesmo tratamento em todas as telas e não muda o layout.
- Mantive as margens anteriores de cada tela por uma propriedade visual do
  componente, evitando alteração de espaçamento.
- Tratei títulos de página, nomes de ambiente e rótulos de dados como elementos
  diferentes de título de seção; eles não foram convertidos artificialmente.
- Interrompi o pacote no primeiro bloqueio, conforme a ordem e a regra de parada,
  em vez de mascarar dados locais para satisfazer o grep.

## O que eu não fiz e por quê

- Não toquei em `src/state/**`, dados semeados, cálculos ou guardas de permissão.
- Não converti os valores hardcoded do Portal para centavos locais, porque o
  contrato proíbe números de domínio escritos no componente.
- Não avancei para itens posteriores fora da ordem definida no P1B.
- Não corrigi responsividade, navegação ou vazamento de valores do perfil
  Gerente, pois são achados anteriores e fora do item 1.

## Achados

- `src/pages/PortalFinanceiro.tsx:21` inicia a constante `PARCELAS`;
  `src/pages/PortalFinanceiro.tsx:30`, `ADICIONAIS`; e
  `src/pages/PortalFinanceiro.tsx:35`, `MATERIAIS`. As três guardam dados de
  domínio fora do estado.
- O Portal Financeiro mediu 721 px de conteúdo dentro do viewport de 390 px.
  A captura mostrou cards e tabela cortados, inclusive o símbolo `R$` separado
  do número nos cards de resumo. Esse é o problema que o item 2 e a futura
  passada responsiva precisam resolver depois do estado ser completado.
- `src/layouts/AppLayout.tsx:66` termina `NAV_GERENTE` sem o item Equipe, embora
  `src/routes.ts:103` permita `/equipe` para todos os perfis internos.
- Como Rafael, Painel e Planejamento continuam exibindo valores financeiros.
  A correção depende da regra de visibilidade do Gerente e pertence ao Claude
  Code.
