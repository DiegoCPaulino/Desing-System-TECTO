# Relatório — Pacote 0 · estabilização e inventário

## Commits

| hash | item | arquivos tocados |
|---|---|---|
| `1e2f933` | 0.1 — corrigir os três erros TypeScript | `src/pages/ObraChecklist.tsx`, `src/pages/Planejamento.tsx` |
| este commit | 0.2 — atualizar o inventário e registrar a auditoria | `docs/ESTADO_DO_PROTOTIPO.md`, `docs/relatorios/pacote-0-estabilizacao.md` |

## Item a item

### 0.1 — Erros TypeScript

Em `ObraChecklist`, removi a primeira de duas declarações `color` no mesmo
objeto de estilo. A segunda declaração já prevalecia no navegador, portanto a
cor habilitada/desabilitada não mudou.

Em `Planejamento`, o tipo do parâmetro `state` de `CelulaConteudo` passou a ser
derivado de `useStore.getState`. Isso elimina o `unknown` e permite inferir o
tipo de `obra` no `.find`, sem mudar cálculo ou comportamento.

Verificações executadas:

- `npx tsc --noEmit`: passou sem erros;
- `npm run build`: passou;
- `git diff --check`: passou;
- formulário “Registrar fora do escopo”: botão “Salvar rascunho” permaneceu
  desabilitado e com `rgb(154, 154, 154)` sem descrição;
- Pedro: Planejamento e Checklist em 390, 800 e 1440 px;
- Rafael: Planejamento e Checklist da Obra 22 em 390, 800 e 1440 px;
- Mariana: Portal em 390, 800 e 1440 px;
- console do navegador: nenhuma mensagem de nível `error` na matriz.

O build preserva dois grupos de avisos anteriores: configuração ainda não
compatível com o futuro `configLoader: native` do Vite e chunk JavaScript acima
de 500 kB.

### 0.2 — Estado do protótipo

`docs/ESTADO_DO_PROTOTIPO.md` foi reauditado e reescrito para refletir o código
atual. A versão anterior afirmava que o Portal não tinha guarda, que os layouts
duplicavam permissão e que Cliente em `/` recebia `SemAcesso`; os três pontos já
haviam sido corrigidos em `src/routes.ts` e nos layouts.

O inventário novo registra:

- arquitetura e saúde técnica atuais;
- árvore de rotas e sete destinos `EmBreve`;
- 14 coleções do estado e suas contagens;
- ausência de `src/components/`, testes e lint;
- diferença entre os fluxos críticos declarados e as telas realmente
  navegáveis;
- inconsistências do seed e presenças apontando para diários do dia anterior;
- dados fixos e cliques mortos nas telas;
- resultado real da matriz responsiva;
- separação do que cabe ao Claude Code e ao Codex.

## O que eu decidi por conta própria

- Tratei o Pacote 0 como dois itens porque esse era o recorte aprovado antes da
  execução: estabilização TypeScript e atualização do inventário.
- Usei `ReturnType<typeof useStore.getState>` como tipo local em Planejamento.
  É a menor correção que preserva a API atual e não entra em `src/state/**`.
- Classifiquei “carrega” separadamente de “aprovado visualmente”. Isso evita
  declarar sucesso responsivo em telas que renderizaram, mas ficaram cortadas.
- Mantive `/design-system` pública apenas como fato auditado. Não decidi se ela
  deve ser protegida.
- Não registrei nova entrada em `docs/DECISOES.md`, porque nenhuma decisão de
  produto, domínio ou arquitetura foi tomada.

## O que eu não fiz e por quê

- Não alterei nenhum arquivo em `src/state/**` nem o seed: são exclusivos do
  Claude Code.
- Não corrigi as oito presenças ligadas a diários de ontem, o elenco inventado,
  o rateio em Marcos ou o estado finalizado de `d02`: todos exigem mudar dados
  semeados.
- Não implementei Financeiro, Fechamento, rateio ou imutabilidade: dependem de
  telas de cálculo e funções sob responsabilidade do Claude Code.
- Não corrigi responsividade, imagens externas, cliques mortos ou componentes
  compartilhados: pertencem aos pacotes seguintes e ampliar o item 0.1 tornaria
  difícil isolar regressões.
- Não corrigi os avisos do Vite/bundle, porque não são os três erros TypeScript
  do Pacote 0 e não bloqueiam o build.
- Não fiz push para `master`; os dois itens ficam na branch `agente/codex` para
  merge pelo Mestre.

## Achados

- `docs/PRODUTO.md` e `docs/ESTADO.md`, citados no mapa do `AGENTS.md`, não
  existem no repositório. `PRODUTO.md` também não apareceu no histórico Git
  disponível. Sem ele, tarefas que dependam de INV/RN não podem ser decididas.
- O seed usa nomes fora do elenco fixo a partir de
  `src/state/dados-iniciais.ts:21` e cria seis inativos adicionais em
  `src/state/dados-iniciais.ts:37`.
- `pr30` a `pr34`, com data 20/08, apontam para `d03`, de 19/08
  (`src/state/dados-iniciais.ts:499`); `pr40` a `pr42` fazem o mesmo com `d05`
  (`src/state/dados-iniciais.ts:505`).
- O comentário diz que `d02` é rascunho, mas o registro é `finalizado`
  (`src/state/dados-iniciais.ts:366` e `src/state/dados-iniciais.ts:369`).
- `PortalMinhaObra`, `PortalDiario` e `PortalFinanceiro` fixam a obra `o01`
  (`src/pages/PortalMinhaObra.tsx:76`, `src/pages/PortalDiario.tsx:120`,
  `src/pages/PortalFinanceiro.tsx:74`); `PortalLayout` fixa Mariana em
  `src/layouts/PortalLayout.tsx:100`.
- Parcelas, adicionais e materiais do Portal são constantes com valores
  formatados no componente, a partir de `src/pages/PortalFinanceiro.tsx:19`.
- `ObraVisaoGeral` encontra o primeiro diário finalizado sem ordenar em
  `src/pages/ObraVisaoGeral.tsx:145`, mostrando 19/08 mesmo com 20/08 finalizado.
- “Ver como o cliente vê” aponta para `/portal`
  (`src/pages/ObraVisaoGeral.tsx:261`), mas Administração é corretamente negada
  pela guarda exclusiva do Cliente. O roteiro não tem hoje uma troca de perfil
  para sustentar esse clique.
- O `SmallBtn` do Painel não recebe ação (`src/pages/PainelDoDia.tsx:87`) e é
  usado nas pendências em `src/pages/PainelDoDia.tsx:264`. `+ Nova obra` também
  não tem ação (`src/pages/CarteiraDObras.tsx:123`).
- A sidebar fixa de 248 px (`src/layouts/AppLayout.tsx:110`) torna a aplicação
  interna impraticável em 390 px. O Portal mediu 482 px de conteúdo dentro de
  375 px de área cliente e sobrepôs o cabeçalho.
- A imagem principal do Portal depende de URL externa
  (`src/pages/PortalMinhaObra.tsx:126`) e falhou na verificação, sem fallback
  local.
- `pessoasMap` é reconstruído a cada render (`src/pages/DiarioObra.tsx:476`) e
  está na lista de dependências do efeito que atualiza a sheet
  (`src/pages/DiarioObra.tsx:648`). O trecho merece revisão por risco de ciclo.
