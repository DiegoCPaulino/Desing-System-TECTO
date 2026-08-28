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

`src/components/` ainda não existe. As 18 páginas e os 2 layouts repetem uma
constante local `C` com cores. Botões, cartões, badges, avatares, títulos,
cabeçalhos de tabela, datas e valores monetários também são reconstruídos tela
a tela.

Essa repetição é a base do P1B visual. Os seis primeiros componentes previstos
são `TituloSecao`, `ValorMonetario`, `Avatar`, `ChipVinculo`,
`CabecalhoTabela` e `DataComDiaSemana`.

---

## 5. Estado dos fluxos críticos

Esta tabela separa o que o contrato diz que precisa funcionar do que a interface
atual permite percorrer.

| Fluxo | Estado observado no código atual |
|---|---|
| F1 Planejamento → Diário → Presença → Diária → Fechamento | Planejamento, Diário e Presença existem; a interface interna de Fechamento não existe e `/financeiro` mostra `EmBreve` |
| F2 Divergência planejado × realizado | tratamento existe no Diário; não foi reexecutado ponta a ponta no Pacote 0 |
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

O timer de gravação usa `useEffect` para sincronizar um intervalo externo, o que
é adequado. Outro `useEffect` recria o conteúdo da sheet a partir de
`sheetEstado`, `workers` e `pessoasMap`. Como `pessoasMap` é reconstruído a cada
render e está nas dependências, esse trecho merece revisão por possível ciclo de
renderização. Não foi alterado no Pacote 0.

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
