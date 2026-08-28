# Estado do protótipo — inventário do repositório

Inventário lido do código, não de memória nem de documento anterior.

**Gerado em:** 28/08/2026, na limpeza estrutural (itens 1 a 5).
**Método:** leitura direta de `src/routes.ts`, `src/state/types.ts`,
`src/state/store.ts` e `src/state/dados-iniciais.ts`. A contagem de registros do
seed foi executada em tempo de execução sobre os dados, não estimada por linha.

Quando este arquivo divergir do código, o código está certo. Atualize-o na mesma
tarefa em que mudar rota, entidade ou tela.

---

## 1. Rotas declaradas

Todas as rotas vivem em [src/routes.ts](../src/routes.ts), em um único
`createBrowserRouter`. Não há rota declarada em nenhum outro arquivo.

### 1.1 Autenticação — sem layout, sem guarda

| Rota | Componente | Perfis |
|---|---|---|
| `/entrar` | `Login` | — (pública) |
| `/entrar/primeiro-acesso` | `PrimeiroAcesso` | — (pública) |

### 1.2 Aplicação interna — dentro de `AppLayout` › `GuardaPerfil`

`TODOS_INTERNOS` = `administracao`, `financeiro`, `gerente_obras`.
`ADMIN_FINANCEIRO` = `administracao`, `financeiro`.
`obraScoped` significa que, para o Gerente de Obras, `GuardaPerfil` também checa
`gerenteTemAcessoAObra` contra `vinculos_obra`.

| Rota | Componente | Perfis | obraScoped |
|---|---|---|---|
| `/` (index) | `PainelDoDia` | TODOS_INTERNOS | não |
| `/obras` | `CarteiraDObras` | TODOS_INTERNOS | não |
| `/obras/:obraId` | `ObraVisaoGeral` | TODOS_INTERNOS | sim |
| `/obras/:obraId/diario` | `DiarioObra` | TODOS_INTERNOS | sim |
| `/obras/:obraId/diarios` | `ObraDiarios` | TODOS_INTERNOS | sim |
| `/obras/:obraId/checklist` | `ObraChecklist` | TODOS_INTERNOS | sim |
| `/obras/:obraId/andamento` | `ObraAndamento` | TODOS_INTERNOS | sim |
| `/obras/:obraId/fotos` | `ObraFotos` | TODOS_INTERNOS | sim |
| `/obras/:obraId/financeiro` | **`EmBreve`** | ADMIN_FINANCEIRO | sim |
| `/obras/:obraId/documentos` | **`EmBreve`** | TODOS_INTERNOS | sim |
| `/planejamento` | `Planejamento` | TODOS_INTERNOS | não |
| `/equipe` | `Equipe` | TODOS_INTERNOS | não |
| `/equipe/:pessoaId` | **`EmBreve`** | TODOS_INTERNOS | não |
| `/orcamentos` | **`EmBreve`** | ADMIN_FINANCEIRO | não |
| `/financeiro` | **`EmBreve`** | ADMIN_FINANCEIRO | não |
| `/indicadores` | **`EmBreve`** | ADMIN_FINANCEIRO | não |
| `*` (não encontrada) | **`EmBreve`** | TODOS_INTERNOS | não |

### 1.3 Design system — sem layout, sem guarda

| Rota | Componente | Perfis |
|---|---|---|
| `/design-system` | `DesignSystemPage` | — (nenhuma guarda) |

### 1.4 Portal do cliente — dentro de `PortalLayout`

| Rota | Componente | Perfis declarados |
|---|---|---|
| `/portal` (index) | `PortalMinhaObra` | nenhum |
| `/portal/diario` | `PortalDiario` | nenhum |
| `/portal/financeiro` | `PortalFinanceiro` | nenhum |

As três rotas do portal **não** passam por `GuardaPerfil` e não declaram
`handle.perfis`. Ver a divergência D1 na seção 6.

---

## 2. Rotas que caem em `EmBreve`

Sete rotas renderizam [src/pages/EmBreve.tsx](../src/pages/EmBreve.tsx):

1. `/obras/:obraId/financeiro`
2. `/obras/:obraId/documentos`
3. `/equipe/:pessoaId`
4. `/orcamentos`
5. `/financeiro` — Fechamento de Ciclo, ainda por construir
6. `/indicadores` — ainda por construir
7. `*` — qualquer rota interna não declarada

`EmBreve` também é importado diretamente por `ObraVisaoGeral`, para as abas
Financeiro e Documentos dentro da tela de obra.

---

## 3. Entidades do estado

Definidas em [src/state/types.ts](../src/state/types.ts), na interface
`AppState`. As 14 chaves abaixo são o estado inteiro — não há outra fonte.

| Entidade | Interface | Registros no seed |
|---|---|---|
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

Duas entidades existem no código mas não constam da lista de "Estado
compartilhado" do CLAUDE.md: **`itens_fora_escopo`** e **`semanas`**.

Além do `AppState`, o store guarda `perfil_ativo: TipoPerfil | null`, que não é
entidade de domínio e sim sessão da maquete.

`TipoPerfil` = `administracao` · `financeiro` · `gerente_obras` · `cliente`.

---

## 4. Arquivos de `src/state/`

Três arquivos, 1.295 linhas.

### `types.ts` — 170 linhas

Só tipos. As 14 interfaces de entidade, mais `TipoPerfil` e `AppState`. Sem
lógica.

### `store.ts` — 533 linhas

Store zustand (`useStore`) e todas as funções puras de cálculo.

**Ações que escrevem no estado:** `setPerfil` · `resetarDados` · `marcarItem` ·
`marcarTodosItensAmbiente` · `adicionarItemForaEscopo` · `gravarCelula` ·
`publicarSemana` · `salvarAlteracoes` · `finalizarDiario`.

**Funções puras exportadas:** `formatarReais` · `calcularPctAmbiente` ·
`calcularPctObra` · `getPessoaNome` · `getPessoaIniciais` · `obraSlug` ·
`obraPorSlug` · `gerenteTemAcessoAObra` · `getGerenteDaObra` ·
`presencasNaData` · `calcularIndicadores` · `calcularPendencias` · `tipoCelula` ·
`valorDiaria` · `semanaEstado` · `semanaTemAlteracoesPendentes` · `rotuloCelula` ·
`getCelula` · `obrasNaoConcluidas` · `pessoasDaGrade` · `diasDaSemana` ·
`resumoSemana` · `pessoasNaSemana`.

**Também exporta:** os tipos `CelulaValor` e `TipoCelula`, e a constante
`GERENTE_ID = 'p04'` (Rafael Duarte).

### `dados-iniciais.ts` — 592 linhas

O seed. `export default DADOS: AppState`, mais as constantes de data
`HOJE = '2026-08-20'` · `ONTEM = '2026-08-19'` ·
`SEMANA_INICIO = '2026-08-17'` · `SEMANA_2_INICIO = '2026-08-24'`.

Boa parte dos registros é gerada por `.map()` e `Array.from()` sobre listas de
ids, e não escrita registro a registro — por isso contar linhas subestima o
volume real.

---

## 5. Componentes, telas e layouts

### `src/components/` — **não existe**

Não há diretório de componentes neste repositório. Não há componente
compartilhado de botão, cartão, badge, tabela nem de valor monetário. Cada tela
redeclara o que precisa, inclusive a paleta: a constante local `const C = {...}`
com os tokens de cor está repetida nos **20** arquivos de tela e layout — as 18
páginas e os 2 layouts, sem exceção.

O único componente que uma tela importa de outra é `EmBreve`, usado por
`ObraVisaoGeral`. Fora isso, as telas só compartilham `src/state/`.

Consequência prática: uma mudança de token de cor não tem hoje um único ponto de
edição; são 20 arquivos.

### `src/pages/` — 18 telas

| Arquivo | Linhas |
|---|---|
| `CarteiraDObras.tsx` | 227 |
| `DesignSystemPage.tsx` | 555 |
| `DiarioObra.tsx` | 1062 |
| `EmBreve.tsx` | 76 |
| `Equipe.tsx` | 156 |
| `Login.tsx` | 260 |
| `ObraAndamento.tsx` | 250 |
| `ObraChecklist.tsx` | 419 |
| `ObraDiarios.tsx` | 441 |
| `ObraFotos.tsx` | 306 |
| `ObraVisaoGeral.tsx` | 486 |
| `PainelDoDia.tsx` | 413 |
| `Planejamento.tsx` | 668 |
| `PortalDiario.tsx` | 288 |
| `PortalFinanceiro.tsx` | 248 |
| `PortalMinhaObra.tsx` | 335 |
| `PrimeiroAcesso.tsx` | 213 |
| `SemAcesso.tsx` | 50 |

### `src/layouts/` — 2 layouts

- `AppLayout.tsx` — 232 linhas. Barra lateral e topo da aplicação interna.
- `PortalLayout.tsx` — 141 linhas. Topo horizontal do portal, sem barra lateral.

Não existe `CampoLayout`. Foi removido, e o Diário de Obra hoje é tela normal
dentro de `AppLayout`.

### Raiz de `src/`

`App.tsx` (6) · `main.tsx` (10) · `routes.ts` (104) · `index.css` ·
`vite-env.d.ts`. Nenhuma tela solta na raiz.

---

## 6. Divergências entre documentação e código

Registradas como observação. Nenhuma foi corrigida na limpeza estrutural, porque
corrigir qualquer uma delas mudaria comportamento.

**D1 — O portal não tem guarda de perfil.** As rotas `/portal*` não passam por
`GuardaPerfil` e não declaram `handle.perfis`. `PortalLayout` só checa se há
alguém logado (`if (!perfil) return <Navigate to="/entrar" />`); não checa se o
perfil é `cliente`. Na prática, um usuário de Administração que navegue até
`/portal` vê o portal do cliente. O AGENTS.md §2 diz que rota sem perfil
declarado é negada por padrão — isso hoje vale para a árvore interna, não para o
portal.

**D2 — Há uma segunda camada de permissão em `AppLayout`.** Além de
`GuardaPerfil`, `AppLayout` faz `if (perfil === 'cliente') return <SemAcesso />`.
O AGENTS.md §2 pede guarda "em um lugar só, nunca duas camadas checando a mesma
coisa".

**D3 — Cliente em `/` vê `SemAcesso`, não é levado ao portal.** O AGENTS.md §4
descreve a exceção "Cliente acessando `/` vai para `/portal`". O código não faz
esse redirecionamento.

**D4 — `/design-system` é público.** Não tem guarda nem layout: abre sem login,
em qualquer perfil.

**D5 — `/equipe` é acessível ao Gerente de Obras.** `handle.perfis` é
`TODOS_INTERNOS`. O CLAUDE.md descreve a barra lateral do Gerente com apenas
Painel, Obras e Planejamento; o AGENTS.md §4 lista `/equipe` entre os acessos
dele. Barra lateral e acesso à rota são coisas diferentes, e só a barra lateral
omite o item.

**D6 — Duas entidades fora do vocabulário documentado.** `itens_fora_escopo` e
`semanas` existem no `AppState` e não constam da lista de entidades do CLAUDE.md.
