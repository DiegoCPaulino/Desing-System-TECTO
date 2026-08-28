# Estado do protótipo — inventário auditado

Fotografia do que existe no repositório. Este arquivo descreve o código atual;
não substitui regra de negócio, decisão de produto nem pergunta em aberto.

**Atualizado em:** 28/08/2026, após o Pacote 0 de estabilização.
**Base da auditoria:** branch `agente/codex`, depois do commit `1e2f933`.
**Método:** leitura de rotas, telas, layouts, tipos, store e seed; compilação e
build; verificação em navegador nos perfis Pedro Almeida, Rafael Duarte e
Mariana Costa Lima, em 390, 800 e 1440 px.

Quando este inventário divergir do código, o código mostra o comportamento que
será executado. A divergência ainda precisa ser reportada contra a fonte de
maior precedência, não resolvida por suposição.

---

## 1. Resumo executivo

O TECTO é hoje uma **maquete navegável** em React, Vite e TypeScript. Não há
back-end, autenticação real, persistência, API nem isolamento por empresa. A
sessão e os dados vivem em memória no zustand; recarregar a aplicação ou usar
“Restaurar dados iniciais” devolve o seed.

O protótipo já demonstra uma parte relevante da operação:

- quatro perfis de entrada simulados;
- carteira e visão de obra;
- planejamento semanal;
- diário de obra com presença e divergência;
- checklist, andamento, fotos e histórico de diários;
- painel derivado do estado;
- portal do cliente com obra, diário e financeiro;
- guarda de rota por perfil e vínculo de obra.

Ainda não é uma demonstração ponta a ponta completa. Financeiro interno,
Fechamento de Ciclo, Indicadores, Orçamentos, Financeiro/Documentos da obra e
Ficha da Pessoa continuam em `EmBreve`. A rota `/financeiro` não expõe hoje uma
tela de fechamento, embora os dados de fechamento existam no estado.

### Saúde técnica em 28/08/2026

| Verificação | Estado atual |
|---|---|
| `npx tsc --noEmit` | passa sem erros |
| `npm run build` | passa |
| Testes automatizados | não existem |
| Script de lint | não existe |
| `src/components/` | não existe |
| Navegador em 1440 px | telas auditadas renderizam sem erro de console |
| Navegador em 800 px | renderiza, com truncamentos visuais |
| Navegador em 390 px | aplicação interna e Portal têm falhas estruturais de responsividade |

O build ainda avisa sobre recursos do `vite.config.ts` incompatíveis com o
futuro carregador nativo do Vite e sobre o bundle JavaScript acima de 500 kB.
Esses avisos não impedem o build atual.

---

## 2. Rotas declaradas

Todas as rotas estão em [src/routes.ts](../src/routes.ts), em um único
`createBrowserRouter`.

### 2.1 Autenticação — públicas

| Rota | Componente |
|---|---|
| `/entrar` | `Login` |
| `/entrar/primeiro-acesso` | `PrimeiroAcesso` |

### 2.2 Aplicação interna — `AppLayout` e `GuardaPerfil`

`TODOS_INTERNOS` = `administracao`, `financeiro`, `gerente_obras`.
`ADMIN_FINANCEIRO` = `administracao`, `financeiro`.

Em rotas `obraScoped`, o Gerente de Obras também precisa ter um vínculo ativo em
`vinculos_obra`. Falta de sessão leva a `/entrar`; falta de permissão mostra
`SemAcesso`.

| Rota | Componente | Perfis | obraScoped |
|---|---|---|---|
| `/` | `PainelDoDia` | internos | não |
| `/obras` | `CarteiraDObras` | internos | não |
| `/obras/:obraId` | `ObraVisaoGeral` | internos | sim |
| `/obras/:obraId/diario` | `DiarioObra` | internos | sim |
| `/obras/:obraId/diarios` | `ObraDiarios` | internos | sim |
| `/obras/:obraId/checklist` | `ObraChecklist` | internos | sim |
| `/obras/:obraId/andamento` | `ObraAndamento` | internos | sim |
| `/obras/:obraId/fotos` | `ObraFotos` | internos | sim |
| `/obras/:obraId/financeiro` | **`EmBreve`** | Administração e Financeiro | sim |
| `/obras/:obraId/documentos` | **`EmBreve`** | internos | sim |
| `/planejamento` | `Planejamento` | internos | não |
| `/equipe` | `Equipe` | internos | não |
| `/equipe/:pessoaId` | **`EmBreve`** | internos | não |
| `/orcamentos` | **`EmBreve`** | Administração e Financeiro | não |
| `/financeiro` | **`EmBreve`** | Administração e Financeiro | não |
| `/indicadores` | **`EmBreve`** | Administração e Financeiro | não |
| `*` | **`EmBreve`** | internos | não |

O Cliente que entra por `/` é encaminhado a `/portal` por um loader. Nas outras
rotas internas, ele recebe `SemAcesso`.

### 2.3 Portal do cliente — `GuardaPerfil` e `PortalLayout`

`SO_CLIENTE` = `cliente`.

| Rota | Componente | Perfis |
|---|---|---|
| `/portal` | `PortalMinhaObra` | Cliente |
| `/portal/diario` | `PortalDiario` | Cliente |
| `/portal/financeiro` | `PortalFinanceiro` | Cliente |

As três folhas declaram `handle.perfis`. A mesma `GuardaPerfil` protege as
árvores interna e do Portal; os layouts só tratam ausência de sessão. Esse ponto
substitui as antigas divergências D1, D2 e D3 deste documento, que já não
representavam o código.

### 2.4 Design system

| Rota | Componente | Perfis |
|---|---|---|
| `/design-system` | `DesignSystemPage` | pública, sem guarda |

Manter essa rota pública ou protegê-la ainda precisa de decisão explícita.

### 2.5 Rotas em `EmBreve`

Sete rotas caem em `EmBreve`: Financeiro e Documentos da obra, Ficha da Pessoa,
Orçamentos, Financeiro/Fechamento, Indicadores e a rota interna não encontrada.

---

## 3. Estado em memória

`AppState`, em [src/state/types.ts](../src/state/types.ts), tem 14 coleções de
domínio. A sessão `perfil_ativo` é acrescentada pelo store, mas não é entidade.

| Coleção | Interface | Registros no seed |
|---|---|---:|
| `pessoas` | `Pessoa` | 30 |
| `vinculos` | `Vinculo` | 17 |
| `obras` | `Obra` | 5 |
| `vinculos_obra` | `VinculoObra` | 6 |
| `ambientes` | `Ambiente` | 5 |
| `itens_orcamento` | `ItemOrcamento` | 30 |
| `itens_fora_escopo` | `ItemForaEscopo` | 0 |
| `planejamento` | `Planejamento` | 130 |
| `semanas` | `Semana` | 2 |
| `diarios` | `Diario` | 7 |
| `presencas` | `Presenca` | 35 |
| `diarias` | `Diaria` | 11 |
| `fechamentos` | `Fechamento` | 28 |
| `lancamentos` | `Lancamento` | 2 |

### 3.1 Arquivos de estado

- `types.ts`: tipos das entidades e `AppState`.
- `dados-iniciais.ts`: seed e data fixa de referência.
- `store.ts`: store zustand, mutações e funções puras.

As mutações disponíveis são `setPerfil`, `resetarDados`, `marcarItem`,
`marcarTodosItensAmbiente`, `adicionarItemForaEscopo`, `gravarCelula`,
`publicarSemana`, `salvarAlteracoes` e `finalizarDiario`.

As principais funções puras disponíveis incluem formatação monetária, cálculo
de andamento por ambiente e obra, indicadores, pendências, acesso do gerente,
presenças, valor de diária, estado/resumo da semana e leitura da grade de
planejamento.

### 3.2 Data de referência

- hoje: quinta-feira, `20/08/2026`;
- ontem: quarta-feira, `19/08/2026`;
- semana corrente: `17/08/2026` a `22/08/2026`;
- próxima semana: início em `24/08/2026`.

As datas fixas batem com os dias da semana. O relógio real do computador não
altera a maquete.

---

## 4. Estrutura visual atual

### 4.1 Páginas e layouts

Existem 18 páginas e 2 layouts:

- aplicação interna: Painel, Carteira, Visão da Obra, Diário, Diários,
  Checklist, Andamento, Fotos, Planejamento e Equipe;
- autenticação: Login e Primeiro Acesso;
- cliente: Minha Obra, Diário e Financeiro;
- apoio: Design System, Sem Acesso e Em Breve;
- layouts: `AppLayout` e `PortalLayout`.

Não existe `CampoLayout`; o Diário usa `AppLayout`.

### 4.2 Componentes compartilhados

`src/components/` passou a existir no P1B visual. O primeiro componente é
`TituloSecao`, aplicado em Painel, Visão da Obra, Andamento, Planejamento,
Diário, Minha Obra, Portal Financeiro e Design System. O tratamento usa um bloco
amarelo de preenchimento antes do texto grafite e substituiu as definições
locais `SectionLabel`.

Os cinco componentes seguintes ainda não existem: `ValorMonetario`, `Avatar`,
`ChipVinculo`, `CabecalhoTabela` e `DataComDiaSemana`. O P1B parou antes de
`ValorMonetario`: as parcelas, os adicionais e os materiais exibidos em
`PortalFinanceiro.tsx` são constantes locais formatadas, mas as entidades
correspondentes não existem no estado. Cumprir o aceite global sem inventar
dados exige primeiro uma alteração em `src/state/**` pelo Claude Code.

As 18 páginas e os 2 layouts ainda repetem uma constante local `C` com cores.
Botões, cartões, badges, avatares, cabeçalhos de tabela, datas e valores
monetários continuam, em sua maioria, reconstruídos tela a tela.

---

## 5. Estado dos fluxos críticos

Esta tabela separa o que o contrato diz que precisa funcionar do que a interface
atual permite percorrer.

| Fluxo | Estado observado no código atual |
|---|---|
| F1 Planejamento → Diário → Presença → Diária → Fechamento | Planejamento, Diário e Presença existem; a interface interna de Fechamento não existe e `/financeiro` mostra `EmBreve` |
| F2 Divergência planejado × realizado | **exercitado ponta a ponta no navegador** na P1A: remoção pede motivo e confirmação explícita, adição avisa "alocado em outra obra" sem dizer qual, e o Painel muda sozinho depois de finalizar. Ver §11 |
| F3 Checklist → Andamento → Carteira → Portal | telas leem o mesmo estado da Obra 22; é o fluxo visual mais completo |
| F4 Pendências derivadas | Painel e layout chamam `calcularPendencias`; não há lista de notificações ao clicar no sino |
| F5 Rateio de diária | há diária sem obra pagadora no seed; não há tela financeira atual para concluir a escolha |
| F6 Imutabilidade pelo Fechamento | há fechamentos no estado; sem interface atual, não foi possível homologar no navegador |
| F7 Permissão por perfil | `GuardaPerfil` centralizada e rotas declarativas; smoke test passou para Administração, Gerente e Cliente |

Há, portanto, uma divergência objetiva entre “fluxos críticos funcionam” no
contrato operacional e a ausência das telas Financeiro/Fechamento na árvore de
rotas atual. Ela precisa ser tratada pelo agente responsável por `src/state/**`
e pelas telas de cálculo, sem o Codex inventar a interface ou as funções.

---

## 6. Divergências e riscos ainda abertos

### 6.1 Fontes de verdade

**A1 — `docs/PRODUTO.md` não existe.** O `AGENTS.md` aponta para INV-01 a INV-10
e RN-XXX nesse arquivo, mas ele não está no repositório nem aparece no histórico
Git disponível. Qualquer tarefa que exija interpretar ou criar regra de negócio
fica sem a fonte de maior precedência e deve parar.

**A2 — `docs/ESTADO.md` também não existe.** O mapa do `AGENTS.md` cita esse
nome; o inventário real é este `ESTADO_DO_PROTOTIPO.md`.

### 6.2 Seed e consistência de dados — responsabilidade do Claude Code

**S1 — O elenco do seed não é o elenco fixo.** De `p11` a `p30`, o seed usa
nomes como André Ferreira, Bruno Santana e Lucas Melo, enquanto o contrato fixa
Adilson Prado, Edmilson Vieira, Valdir Chagas, Israel Fontes e os demais nomes.
Também existem seis inativos adicionais, embora o elenco fixe apenas Wagner
Lopes como inativo.

**S2 — A semana corrente não cobre as 21 pessoas de campo esperadas.** O Painel
mostra 13 pessoas em campo hoje. Valdir Chagas e Israel Fontes não existem no
seed, portanto as cenas planejadas para saldo devedor e rateio deles não podem
ocorrer como documentadas.

**S3 — O rateio pendente está em Marcos Bittencourt, não em Israel Fontes.** A
diária de Marcos em 19/08 tem `obra_que_arca_id` vazio após presença em duas
obras.

**S4 — O diário de hoje da Obra 22 já está finalizado.** `d02`, de 20/08, tem
estado `finalizado`; o roteiro de demonstração descreve esse diário como
rascunho.

**S5 — Oito presenças de hoje apontam para diários de ontem.** `pr30` a `pr34`
usam `d03`, de 19/08, e `pr40` a `pr42` usam `d05`, também de 19/08. A data da
presença é 20/08. Esse é um risco direto para Diário, indicadores e diárias.

**S6 — Só a Obra 22 tem ambientes e itens de orçamento.** As outras quatro obras
não têm estrutura para Checklist/Andamento equivalente.

### 6.3 Dados fixos nas telas

**T1 — O Portal é fixo na Obra 22.** `PortalMinhaObra`, `PortalDiario` e
`PortalFinanceiro` consultam diretamente `o01`; `PortalLayout` escreve “Mariana
Costa Lima”. Não existe associação entre sessão Cliente e obra.

**T2 — Parte do Financeiro do Portal está fora do estado.** Parcelas,
adicionais e materiais/notas são arrays constantes com valores já formatados
dentro de `PortalFinanceiro`. Apenas os totais superiores vêm da obra.

**T3 — A visão da obra pode mostrar o diário finalizado mais antigo.**
`ObraVisaoGeral` usa `.find()` sem ordenação; no seed atual encontra `d01`
(19/08) antes de `d02` (20/08).

**T4 — “Ver como o cliente vê” não funciona para Administração.** O link leva a
`/portal`, mas a guarda corretamente aceita apenas Cliente, então Pedro recebe
`SemAcesso`. O roteiro pede essa transição e ainda não define troca de perfil.

### 6.4 Interações incompletas

- botões de pendência do Painel (`Revisar`, `Definir`, `Ver`) não têm ação;
- sino e avatar do topo parecem clicáveis, mas não abrem nada;
- `+ Nova obra` não tem ação;
- busca global do topo não executa busca;
- “Comprovante” e “Ver nota” no Portal Financeiro não têm ação;
- várias rotas intencionalmente terminam em `EmBreve`.

Esses elementos devem ser resolvidos ou retirados do caminho da demonstração.
Os que dependem de novas entidades ou funções permanecem bloqueados para o
Codex.

### 6.5 Efeito derivado no Diário

A suspeita levantada no Pacote 0 foi **confirmada no navegador** e está detalhada
na §10. O ciclo de renderização não é possível: é certo, e dispara na ação
central da Cena 6. Ver §10 — esta seção não repete o diagnóstico para as duas
não divergirem.

---

## 7. Responsividade e ativos externos

### 7.1 Aplicação interna

`AppLayout` mantém uma sidebar fixa de 248 px e não tem navegação móvel. Em
390 px, ela ocupa a maior parte do viewport e deixa Planejamento e Checklist
praticamente inacessíveis. Em 800 px as telas abrem, mas filtros e conteúdos
largos começam a truncar. Em 1440 px, as telas auditadas ficam estáveis.

### 7.2 Portal

Em 390 px, o cabeçalho sobrepõe logo, navegação, nome e avatar. O documento
mediu 375 px de área cliente e 482 px de conteúdo, com rolagem horizontal. Em
800 e 1440 px o layout principal cabe no viewport.

### 7.3 Imagens

Login, carteira, obra, diários e Portal dependem de URLs do Unsplash. Na
verificação do Pacote 0, a imagem principal do Portal não carregou e exibiu o
texto alternativo sobre o gradiente. Não há ativo local nem fallback visual que
torne a demonstração independente de rede.

---

## 8. Verificação do Pacote 0

### Técnica

- `npx tsc --noEmit`: passou;
- `npm run build`: passou com os avisos descritos na seção 1;
- `git diff --check`: passou;
- console do navegador: nenhuma mensagem de nível `error` durante a matriz.

### Navegador

| Perfil | 390 px | 800 px | 1440 px |
|---|---|---|---|
| Pedro Almeida | Planejamento e Checklist carregam, mas a sidebar inviabiliza o uso | carregam; filtros do Checklist truncam | carregam e formulário “fora do escopo” mantém estado desabilitado correto |
| Rafael Duarte | Planejamento e Checklist da Obra 22 carregam, com a mesma falha móvel | carregam | carregam |
| Mariana Costa Lima | Portal carrega com sobreposição e overflow horizontal | carrega | carrega |

O resultado “carrega” significa que a rota e o conteúdo foram exercitados no
navegador sem exceção. Não significa que o layout foi aprovado visualmente onde
há ressalva explícita.

---

## 9. Próxima ordem segura

1. Claude Code corrige seed, vínculos entre presenças e diários e lacunas
   necessárias aos fluxos de cálculo, sem trabalho simultâneo na mesma árvore.
2. Codex executa o P1B visual em componentes pequenos e commits isolados.
3. Aplicar os componentes tela a tela, começando pelas telas do roteiro.
4. Resolver imagem/fallback local do Login e do Portal.
5. Corrigir cliques mortos que já tenham função/rota pronta.
6. Fazer a responsividade estrutural em 390, 800 e 1440 px.
7. Reexecutar os sete fluxos críticos e os três perfis após os merges.

Enquanto o Claude Code estiver indisponível, o Codex pode avançar nos itens 2 a
6 apenas quando não precisar inventar dado, cálculo, entidade ou permissão. O
diretório `src/state/**` e o seed permanecem fora do seu escopo.

---

## 10. Auditoria de `useEffect`

Produzida no item 1 da tarefa P1A. **Nada foi corrigido** — a correção é decisão
do Mestre, e o arquivo envolvido pertence ao outro agente.

**Método:** `grep` por `useEffect`, `useLayoutEffect` e `useInsertionEffect` em
`src/` inteiro. Três ocorrências, todas em um único arquivo. Nenhuma outra tela
herdou o padrão do gerador.

**Critério:** (a) sincroniza com o mundo externo — legítimo · (b) grava no estado
algo que poderia ser calculado na renderização — defeito.

| Arquivo | Linha | O que faz | Veredito |
|---|---|---|---|
| `src/pages/DiarioObra.tsx` | 1 | Importação de `useEffect` | não é efeito |
| `src/pages/DiarioObra.tsx` | 499 | Timer de gravação: `setInterval` incrementando os segundos, com `clearInterval` no retorno | **(a) legítimo** |
| `src/pages/DiarioObra.tsx` | 641 | Recria o conteúdo da sheet e grava em `sheetContent` | **(b) defeito — confirmado no navegador** |

### 10.1 Linha 499 — legítimo

Depende de `gravacaoEstado`, primitivo único. O tempo de relógio não é derivável
na renderização, e a limpeza do intervalo está correta. Usa a forma funcional
`setSegundosGravacao((n) => n + 1)`, então não precisa do valor nas dependências.
Nada a fazer.

### 10.2 Linha 641 — defeito, com ciclo de renderização confirmado

O efeito grava em `sheetContent` (via `showSheet` → `setSheetContent`) um valor
inteiramente derivável de `sheetEstado`, `workers`, `pessoasMap` e `buscarTexto`.
É o padrão (b) em forma pura.

O ciclo acontece assim:

1. `pessoasMap` é declarado em `src/pages/DiarioObra.tsx:469` como
   `Object.fromEntries(...)`, sem `useMemo` — **referência nova a cada render**.
2. `pessoasMap` está na lista de dependências (`src/pages/DiarioObra.tsx:681`),
   então o efeito roda **em todo render**.
3. Cada execução chama `showSheet(<Componente … />)`. JSX cria um objeto novo,
   que nunca é `Object.is`-igual ao anterior, então o React não descarta a
   atualização.
4. Novo estado → novo render → passo 1.

O ciclo fica **dormente enquanto `sheetEstado` é nulo**, porque aí o efeito chama
`hideSheet()` e `setSheetContent(null)` — e `null === null` faz o React parar.
Ele acorda no instante em que qualquer folha abre.

**Verificação executada** — Pedro Almeida, `/obras/18-gfr/diario` (obra sem
diário em 20/08, portanto formulário editável), remoção de uma pessoa planejada:

- console: `Maximum update depth exceeded`, repetido, a cada abertura de folha;
- a folha **renderiza mesmo assim** — o React interrompe em 50 iterações e o
  conteúdo aparece;
- a ação **completa corretamente**: o contador foi de "5 de 5 confirmados" para
  "4 de 5", e a pessoa passou a exibir "Falta" com opção de desfazer.

**Severidade.** Não quebra a demonstração e não é visível para quem assiste. É
degradação silenciosa: renderização em excesso a cada interação com qualquer
folha, e console inundado. Encaixa na definição de erro silencioso do
`AGENTS.md` §5 — aparece para quem abre o console, não para quem olha a tela.

**Por que não foi corrigido.** Duas razões independentes: o item 1 da P1A manda
classificar e não corrigir, e a correção é em `src/pages/DiarioObra.tsx`, que
está fora dos arquivos permitidos da tarefa.

**Correção sugerida, quando for despachada:** envolver `pessoasMap` em `useMemo`
resolve o sintoma; derivar a folha na renderização, em vez de guardá-la em
estado, resolve a causa. A segunda é a que o circuit breaker do `AGENTS.md` §4
descreve.

---

## 11. Fluxo F2 exercitado no navegador

Item 4 da tarefa P1A. Perfil Pedro Almeida, rota `/obras/22-mcl/diario`.

| # | Passo | Resultado |
|---|---|---|
| 1 | Abrir o diário de hoje da Obra 22 | abre em **Rascunho** |
| 2 | Chega pré-preenchido com os planejados | 10 pessoas, todas do elenco fixo |
| 3 | Remover uma pessoa planejada | folha "Diferente do planejado" abre, nomeia Adilson Prado, oferece 5 motivos e exige Confirmar |
| 4 | Confirmar | contador vai a "9 de 10", a pessoa passa a exibir "Doente" com Desfazer |
| 5 | Acrescentar alguém alocado em outra obra | aviso: *"Ele está alocado em outra obra"* — **sem revelar qual**, como o F2 exige |
| 6 | Finalizar o diário | grava 10 presenças, as diárias e o texto; o diário passa a Finalizado |
| 7 | Voltar ao Painel | **muda sozinho**: 11 → 20 pessoas em campo, 5 → 7 pendências |

As duas pendências novas do passo 7 são derivadas, não escritas:

- **Rateio pendente: Edmilson Vieira** — ele estava presente na GFR e foi
  acrescentado na MCL no mesmo dia. `finalizarDiario` detecta a presença na
  outra obra e grava UMA diária com `obra_que_arca_id` vazio. É a `F5`
  funcionando.
- **Decisão de pagamento: Adilson Prado** — vem de `removidos_planejados`.

O registro original do planejamento sobreviveu: a divergência continua sendo
derivada na exibição e nunca gravada por cima.

### 11.1 Defeito encontrado e corrigido

`finalizarDiario`, `marcarItem`, `marcarTodosItensAmbiente`,
`adicionarItemForaEscopo` e `gravarCelula` gravavam `new Date().toISOString()`,
ou seja, a data **real da máquina**. Um diário de 20/08/2026 exibia
"finalizado em 28/08" — a data em que o teste rodou.

Isso quebra o invariante de data coerente do `AGENTS.md` §4 e §6, e quebrava
exatamente no fim da Cena 6, que é o momento mais visível da demonstração.

Corrigido em `src/state/store.ts` com `agoraNoPrototipo()`: a data é sempre
`HOJE`, a data de referência da maquete, e só a hora vem do relógio. Reverificado
no navegador — passou a exibir "finalizado em 20/08 às 14:15".
