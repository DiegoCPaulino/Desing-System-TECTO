# Estado do protótipo — inventário auditado

Fotografia do que existe no repositório. Este arquivo descreve o código atual;
não substitui regra de negócio, decisão de produto nem pergunta em aberto.

**Atualizado em:** 28/08/2026, após as tarefas P1A e P1B visual.
**Base da auditoria:** branch `agente/codex`, depois do commit `2f012f5`.
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

Ainda não é uma demonstração ponta a ponta completa. Indicadores, Orçamentos,
Financeiro/Documentos da obra e Ficha da Pessoa continuam em `EmBreve`. A rota
`/financeiro` já expõe a tela de Fechamento de ciclo criada na P1A.

### Saúde técnica em 28/08/2026

| Verificação | Estado atual |
|---|---|
| `npx tsc --noEmit` | passa sem erros |
| `npm run build` | passa |
| Testes automatizados | 38 testes em `fechamento.testes.ts` e `portal.testes.ts`; não há runner instalado — ver §12.3 |
| Script de lint | não existe |
| `src/components/` | quatro componentes: `TituloSecao`, `Avatar`, `CabecalhoTabela` e `DataComDiaSemana` |
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
| `/financeiro` | `Fechamento` | Administração e Financeiro | não |
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

A página documenta as seis implementações públicas do design system:
`TituloSecao`, `Avatar`, `CabecalhoTabela`, `DataComDiaSemana`,
`ValorMonetario` e `ChipVinculo`, incluindo suas variações de exibição.

Manter essa rota pública ou protegê-la ainda precisa de decisão explícita.

### 2.5 Rotas em `EmBreve`

Seis rotas caem em `EmBreve`: Financeiro e Documentos da obra, Ficha da Pessoa,
Orçamentos, Indicadores e a rota interna não encontrada. `/financeiro` saiu do
`EmBreve` na P1A e passou a servir a tela de Fechamento de ciclo.

---

## 3. Estado em memória

`AppState`, em [src/state/types.ts](../src/state/types.ts), tem 19 coleções de
domínio. A sessão `perfil_ativo` é acrescentada pelo store, mas não é entidade.

| Coleção | Interface | Registros no seed |
|---|---|---:|
| `pessoas` | `Pessoa` | 34 |
| `vinculos` | `Vinculo` | 34 |
| `obras` | `Obra` | 5 |
| `vinculos_obra` | `VinculoObra` | 7 |
| `ambientes` | `Ambiente` | 18 |
| `itens_orcamento` | `ItemOrcamento` | 92 |
| `itens_fora_escopo` | `ItemForaEscopo` | 0 |
| `planejamento` | `Planejamento` | 216 |
| `semanas` | `Semana` | 2 |
| `diarios` | `Diario` | 11 |
| `presencas` | `Presenca` | 61 |
| `diarias` | `Diaria` | 60 |
| `fechamentos` | `Fechamento` | 23 |
| `lancamentos` | `Lancamento` | 3 |
| `parcelas` | `Parcela` | 6 |
| `notificacoes` | `Notificacao` | 7 |
| `especialidades` | `Especialidade` | 9 |
| `tipos_documento` | `TipoDocumento` | 8 |
| `midias` | `Midia` | 14 |
| `recebimentos` | `Recebimento` | 21 |
| `adicionais_obra` | `AdicionalObra` | 2 |
| `custos_obra` | `CustoObra` | 11 |

As oito últimas são **aditivas**: nenhuma tela existente as lê ainda.
`Diario.fotos` continua sendo a fonte das telas de foto; `midias` é a modelagem
real, com ambiente.

As três criadas depois do `PRODUTO.md` chegar ao repositório existem para
cumprir a `RN-135` — são o que o Cliente tem direito de ver no Portal, e o que
estava escrito à mão dentro de `PortalFinanceiro.tsx`. A soma dos
`recebimentos` de cada obra é igual a `valor_contratado + adicionais`, e a soma
dos pagos é igual a `recebido_centavos`. Há teste conferindo isso nas cinco
obras.

### 3.1 Arquivos de estado

- `types.ts`: tipos das entidades e `AppState`.
- `dados-iniciais.ts`: seed e data fixa de referência.
- `store.ts`: store zustand, mutações e funções puras.
- `fechamento.ts`: cálculo do Fechamento de ciclo — funções puras.
- `fechamento.testes.ts`: 27 testes do módulo acima.
- `visibilidade.ts`: fronteira de visibilidade do Cliente (`RN-135`, `RN-136`) e
  totais derivados da Obra. Funções puras, sem dependência do store.
- `portal.testes.ts`: 11 testes de visibilidade e de coerência do seed.

As mutações disponíveis são `setPerfil`, `resetarDados`, `marcarItem`,
`marcarTodosItensAmbiente`, `adicionarItemForaEscopo`, `gravarCelula`,
`publicarSemana`, `salvarAlteracoes`, `finalizarDiario`,
`definirObraQueArcaNaDiaria` e `executarFechamentoDoCiclo`.

As datas gravadas pelas mutações usam `agoraNoPrototipo()`, e não o relógio
real da máquina — ver §11.1.

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

Existem 19 páginas e 2 layouts:

- aplicação interna: Painel, Carteira, Visão da Obra, Diário, Diários,
  Checklist, Andamento, Fotos, Planejamento, Equipe e Fechamento;
- autenticação: Login e Primeiro Acesso;
- cliente: Minha Obra, Diário e Financeiro;
- apoio: Design System, Sem Acesso e Em Breve;
- layouts: `AppLayout` e `PortalLayout`.

Não existe `CampoLayout`; o Diário usa `AppLayout`.

O Fechamento usa os componentes compartilhados sem alterar as funções de
cálculo. As telas e abas com coleções vazias exibem mensagens contextuais e uma
ação quando há próximo passo. Publicação de planejamento, marcação de checklist,
conclusão de ambiente, finalização de diário, execução de fechamento e ajuste de
desconto têm confirmação visível com o mesmo nome da ação.

### 4.2 Componentes compartilhados

`src/components/` contém os seis componentes públicos do design system e um
componente de apoio para estados vazios:

- `TituloSecao`: bloco amarelo de preenchimento e texto grafite, aplicado nas
  seções das telas do app e do Portal;
- `Avatar`: retrato SVG ilustrado e determinístico a partir de `pessoaId`,
  aplicado em Painel, Equipe, Diário, Planejamento, Obra, Login e Portal;
- `CabecalhoTabela`: Inter Semibold, caixa alta e `letter-spacing: 0.08em`,
  aplicado nos cabeçalhos de tabela e grade, inclusive no Fechamento;
- `DataComDiaSemana`: deriva data e dia da semana do ISO e oferece os modos
  padrão, destaque e grade compacta;
- `ValorMonetario`: único ponto de formatação de centavos nas telas, mantém
  símbolo e número juntos, usa numerais tabulares, alinha tabelas à direita e
  apresenta negativos com sinal antes de `R$` e cor negativa;
- `ChipVinculo`: apresenta os seis tipos de vínculo com tratamentos visuais
  distintos nos modos padrão e compacto;
- `EstadoVazio`: componente de apoio, fora do catálogo público dos seis, usado
  para mensagens contextuais, tom positivo e ação sugerida.

`/design-system` usa as seis implementações reais e documenta todas as suas
variações públicas. `EstadoVazio` é apoio de interface e não entra nessa conta.

As 19 páginas e os 2 layouts ainda repetem uma constante local `C` com cores.
Botões, cartões e badges continuam, em sua maioria, reconstruídos tela a tela;
valores monetários e chips de vínculo já estão centralizados.

---

## 5. Estado dos fluxos críticos

Esta tabela separa o que o contrato diz que precisa funcionar do que a interface
atual permite percorrer.

| Fluxo | Estado observado no código atual |
|---|---|
| F1 Planejamento → Diário → Presença → Diária → Fechamento | todas as etapas têm interface; a tela de Fechamento e o módulo puro de cálculo foram adicionados na P1A |
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

O Login não depende mais de imagem externa: a metade esquerda é uma composição
SVG local de planta baixa, grafite e amarelo. Carteira, obra, diários e Portal
ainda dependem de URLs do Unsplash. Na verificação do Pacote 0, a imagem
principal do Portal não carregou e exibiu o texto alternativo sobre o gradiente;
essas telas ainda não têm fallback local.

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

1. O Mestre integra as branches P1A e P1B sem trabalho simultâneo na mesma
   árvore.
2. Claude Code fecha as lacunas de estado necessárias a `ValorMonetario` e
   `ChipVinculo` antes de qualquer extração visual desses dados.
3. Resolver imagem/fallback local da carteira, obra, diários e Portal.
4. Corrigir cliques mortos que já tenham função ou rota pronta.
5. Fazer a responsividade estrutural em 390, 800 e 1440 px.
6. Reexecutar os sete fluxos críticos e os três perfis após os merges.

O diretório `src/state/**` e o seed permanecem fora do escopo do Codex.

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

---

## 12. Fechamento de ciclo

Criado na P1A, itens 5 e 6. `/financeiro` deixou de ser `EmBreve`.

### 12.1 O cálculo — `src/state/fechamento.ts`

Funções puras. Nenhuma altera o estado recebido; `executarFechamento` devolve
os arrays novos e quem grava é o store.

| Função | O que faz |
|---|---|
| `todosOsCiclos` / `ciclosAbertos` | agrupa Fechamentos pela tripla tipo + início + fim, e acrescenta o ciclo `por_obra`, derivado dos vínculos de terceirizado |
| `calcularFechamentoDaPessoa` | devolve o extrato linha a linha, o bruto, os descontos, o a pagar e o saldo que rola |
| `pendenciasQueBloqueiam` | rateio indefinido, ausência sem decisão, diário não finalizado |
| `podeExecutarFechamento` | só é verdadeiro quando não há nenhuma pendência |
| `definirObraQueArca` | uma obra arca com a diária inteira; a outra fica com zero |
| `periodoEstaFechado` · `diariaEstaFechada` · `presencaEstaFechada` · `diarioEstaFechado` | a trava de imutabilidade |
| `executarFechamento` | fecha o ciclo, grava autor e data, e rola o saldo devedor |

Três decisões que valem registro:

1. **O ciclo `por_obra` não tem período.** Quando e como o pagamento por Obra
   acontece é `Q-001` a `Q-003`, em aberto. Ele aparece na tela com obra,
   pessoa, valor e situação, e não afirma periodicidade — é a saída 2 do
   `docs/ABERTO.md` §1. `executarFechamento` recusa fechá-lo.
2. **`'por_obra'` não entra em `Fechamento.ciclo`.** O tipo continua com três
   valores. Acrescentar um quarto deixaria o rótulo do Painel sem tradução.
3. **Um diário está travado quando QUALQUER pessoa nele está em período
   fechado**, e não quando todas. `finalizarDiario` apaga e regrava presenças e
   diárias de todo mundo do diário, então uma pessoa fechada já basta para
   proibir a edição. Nenhuma função de imutabilidade recebe perfil: a trava
   vale para a Administração.

### 12.2 `total_centavos` é o valor LÍQUIDO

O campo guarda o valor **a pagar**, depois dos descontos e com o piso em zero —
o mesmo significado que `executarFechamento` grava. O seed foi corrigido para
isso na P1A: antes trazia o bruto, e o Painel dizia R$7.740,00 enquanto a tela
de Fechamento dizia R$6.680,00 para a mesma semana.

### 12.3 Testes

**38 testes, 0 falhas**, em dois arquivos.

`fechamento.testes.ts` — 27. Saldo devedor maior que o ciclo, diária em duas
obras, edição de diário de período fechado, valor congelado, adicional não
recalculado, os seis tipos de vínculo da `RN-004`, o saldo devedor total da
`RN-095`, e as bordas de ciclo inexistente e pessoa sem diária.

`portal.testes.ts` — 11. Coerência entre os totais gravados na Obra e as linhas
que os compõem, nas cinco obras, e a fronteira da `RN-136`.

**Não há runner de teste no repositório.** Instalar um tocaria `package.json`,
fora dos arquivos permitidos da P1A. Os testes são auto-contidos, sem framework,
e foram executados assim:

```
npx tsc src/state/fechamento.testes.ts --outDir <tmp> --module commonjs \
  --target es2020 --moduleResolution node --esModuleInterop --skipLibCheck --strict
node <tmp>/run.js
```

Transformar isso num `npm test` é tarefa própria, e precisa de autorização para
mexer no `package.json`.
