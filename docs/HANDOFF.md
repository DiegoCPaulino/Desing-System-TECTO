# TECTO — Handoff Mestre do Protótipo

Versão 1.0 · 26/08/2026

---

## 1. Objetivo deste documento

Este documento existe para permitir que uma conversa nova com Claude continue o
desenvolvimento do protótipo TECTO **sem depender da conversa que o originou**.

Ele consolida: o que o produto é, o que o protótipo já tem, o que a revisão mais
recente pediu, quais desses pedidos conflitam com a especificação do produto, em
que ordem tudo deve ser feito, e como saber que está pronto.

Ele **não** é a especificação do sistema real. O sistema real tem documento
próprio, o Documento Canônico, com regras `RN-XXX`, invariantes `INV-XX` e
perguntas `Q-XXX`. Este documento cita o Canônico quando há impacto, mas nunca o
substitui.

**Convenções usadas aqui:**

| Marcação | Significado |
|---|---|
| `A##` | Apontamento da revisão da visão Administração |
| `B##` | Apontamento da revisão de Orçamentos e fluxos de criação |
| `R##` | Recomendação do Claude, não pedida pelo Mestre |
| `[FATO]` | Verificado no código ou na documentação do protótipo |
| `[DECISÃO]` | Determinado pelo Mestre |
| `[INTERPRETAÇÃO]` | Leitura do Claude sobre um pedido ambíguo |
| `[RECOMENDAÇÃO]` | Opinião técnica do Claude |

---

## 2. Visão executiva do TECTO

A TECTO é uma empresa de reformas de apartamentos em São Paulo, em transição de
pequeno para médio porte. Opera hoje com WhatsApp, Google Drive e planilhas.

**Dimensionamento real:** ~30 pessoas · ~20 obras simultâneas · 10 a 15 fotos e
~5 vídeos por obra por dia.

**As quatro perguntas que o sistema existe para responder:**

1. Quem apareceu para trabalhar, e onde.
2. Quem recebe o quê, quanto, e quando.
3. O que aconteceu na obra.
4. O que vai acontecer na próxima semana.

**Princípio norteador:** uma informação é registrada uma vez e reutilizada em
todos os pontos onde tem impacto. O sistema não pode reproduzir internamente a
fragmentação que existe hoje entre planilhas.

**Particularidade comercial que define o módulo financeiro:** a TECTO **não
inclui material em suas obras**. Todo material pertence ao Cliente. Por isso o
dinheiro circula em modalidades distintas, e a visibilidade do Cliente muda
conforme a modalidade.

---

## 3. Objetivo comercial do protótipo

O protótipo não é entrega técnica. É **instrumento de venda**, com dois alvos
simultâneos:

1. Convencer a TECTO de que o sistema resolve a dor operacional dela.
2. Sustentar a negociação do contrato de desenvolvimento e da nova função do
   desenvolvedor dentro da empresa.

Isso muda o critério de qualidade. Não basta "as telas existem". A demonstração
precisa produzir a percepção *"isso já parece o sistema da TECTO"*.

Em consequência, tratamos como **requisito**, não como cosmético: hierarquia
visual, consistência entre telas que mostram o mesmo dado, ausência de clique
morto, ausência de aparência de placeholder, e continuidade ponta a ponta entre
módulos.

**Contraponto que precisa ser dito na apresentação:** o protótipo é aparência
final, não sistema pronto. Se a demonstração passar a impressão de "já está
quase pronto", a negociação de prazo trabalha contra o desenvolvedor. A frase
recomendada é: *"isso é a aparência final; o que leva dez meses é o que roda por
trás."*

---

## 4. Estado atual do protótipo

`[FATO]` **19 telas construídas**, uma rota em "Em breve" (Orçamentos, cortada
deliberadamente — e que os apontamentos agora trazem de volta ao escopo).

**Stack:** React · Vite · TypeScript · Tailwind. Repositório local, versionado em
git. Origem: gerado no Figma Make, exportado e migrado para desenvolvimento
local quando os créditos da ferramenta acabaram.

**O que é maquete:** não há back-end, autenticação real nem `tenant_id`. O estado
é um módulo em memória. As permissões são reais no roteamento do protótipo, mas
não são autorização de servidor.

**Última tarefa executada:** a passada de responsividade (Tarefa D) **não
terminou 100%**. Faltou pouco, e o encerramento correto dela é a Fase 0 do
roadmap.

### 4.1 Histórico de tarefas já executadas

| Tarefa | Conteúdo | Situação |
|---|---|---|
| Fundação | Design System, 3 layouts, 19 rotas, estado compartilhado | Concluída |
| Telas base | Painel, Carteira, Obra, Equipe, Planejamento, Diário, Portal, Login | Concluída |
| A | Auditoria da corrente de dados + Fechamento de Ciclo | Concluída |
| B | Faxina de elenco, 3 entidades novas, Financeiro da obra | Concluída |
| C | Itens de orçamento das 4 obras, Indicadores, Ficha da pessoa, Documentos | Concluída |
| D | Responsividade + 2 correções | **Incompleta** |

### 4.2 Achados relevantes das tarefas anteriores

`[FATO]` A auditoria da Tarefa A confirmou que **a corrente de dados é real**: os
indicadores do Painel são derivados, finalizar o Diário grava `presencas` e
`diarias` no store, e o Andamento é calculado a partir de `itens_orcamento` nas
três telas onde aparece.

`[FATO]` Dois bugs só apareceram em teste de navegador, nunca na leitura do
código:

- **Guarda de permissão inalcançável.** `AppLayout` tinha um retorno
  incondicional para o perfil Cliente acima da avaliação de rota, o que tornava
  a checagem em `GuardaPerfil` código morto. **Lição durável: guarda de
  permissão vive num lugar só; duas camadas checando a mesma coisa criam uma que
  nunca roda.**
- **Integridade referencial furada.** Presenças de hoje apontando para o
  `diario_id` de ontem, gerando chaves duplicadas no React.

`[RECOMENDAÇÃO]` Toda tarefa deve terminar com verificação em navegador, não
apenas `tsc --noEmit`. Isso já é prática do projeto e deve continuar.

---

## 5. Fontes de verdade e precedência

Do mais forte ao mais fraco:

1. **`INV-01` a `INV-10`** do Documento Canônico — invariantes arquiteturais do
   produto real. Não se contornam.
2. **`RN-XXX`** do Documento Canônico — regras de negócio fechadas.
3. **Decisão explícita do Mestre** na conversa corrente.
4. **`CLAUDE.md`** da raiz do repositório — regras operacionais do protótipo.
5. **`docs/ESTADO_DO_PROTOTIPO.md`** — inventário do que existe.
6. Qualquer outra coisa.

### 5.1 Separação deliberada entre protótipo e produto

`[DECISÃO]` As decisões tomadas durante a construção do protótipo **não foram
registradas no Documento Canônico**. Elas ficam listadas na seção 10 deste
documento, para serem levadas à pauta com Pedro e Fernando depois.

O motivo: o protótipo é feito na correria, com liberdade para escolher o que
demonstra melhor. Registrar essas escolhas como regra de produto criaria
regra por conveniência de tela — exatamente a deriva que o Documento Canônico
existe para evitar.

**Consequência para o próximo Claude:** nunca proponha alteração no Documento
Canônico a partir de uma necessidade de tela do protótipo. Registre o conflito e
devolva a decisão ao Mestre.

---

## 6. Arquitetura e conceitos que não podem ser perdidos

### 6.1 Vocabulário obrigatório

Termos do domínio em **português**, sempre. Nunca traduzir, nunca criar sinônimo.

Pessoa · Vínculo · Usuário · Papel · Obra · Pequeno Serviço · Diário de Obra ·
Presença · Diária · Planejamento · Orçamento · Ambiente · Item de Orçamento ·
Checklist de Execução · Andamento TECTO · Andamento Geral · Fechamento · Ciclo
de pagamento · Adiantamento · Empréstimo · Estorno · Modalidade financeira.

É `obra`, não `project`. É `ambiente`, não `room`. É `diaria`, não `daily_rate`.

### 6.2 Invariantes que o protótipo respeita

Custam zero e evitam que a maquete ensine comportamento que o produto não terá:

| Invariante | Como aparece no protótipo |
|---|---|
| `INV-10` — dinheiro em centavos | `valor_centavos: 14832000`; formatação só na exibição |
| `INV-03` — valor congelado | `diarias.valor_centavos` copiado do vínculo na criação, nunca relido |
| `INV-05` — divergência derivada | Planejado × realizado comparado na exibição, nunca gravado |
| `INV-08` — sem DELETE | `desativado_em` para pessoa; estorno para financeiro |
| `INV-04` — presença ≠ diária | N presenças por dia, 1 diária por dia |
| `INV-07` — imutabilidade pelo Fechamento | Período fechado trava diário, presença e diária |

`[FATO]` `INV-09` (`tenant_id`) **não** é aplicado no protótipo, deliberadamente:
a maquete tem uma empresa só e um campo constante em todo registro não ensinaria
nada. No schema real ele é obrigatório desde a primeira migration.

### 6.3 Regras estruturais do protótipo

- **Nada escrito no código.** Nenhuma tela pode ter número, total, percentual ou
  nome fixo no componente. Se o dado não existe no estado, **cria-se a
  entidade** — não se remove o bloco nem se escreve o valor no componente.
  Esta regra já causou um incidente: numa tarefa anterior, três blocos de
  conteúdo foram removidos por obediência à versão incompleta da regra.
- **Cálculo em função pura.** Todo cálculo vive em `src/state/`, nunca no
  componente. Já existem `src/state/fechamento.ts`, `obra.ts`, `indicadores.ts`,
  `pessoa.ts`.
- **Rota sem perfil declarado é negada.** Controle por declaração em
  `handle.perfis`, verificado por `GuardaPerfil`. Nunca lista de exceções.
- **Guarda de permissão em um lugar só.**

### 6.4 Design tokens

| Token | Hex | Token | Hex |
|---|---|---|---|
| acento | `#FFC213` | positivo | `#2E9E5B` |
| acento-fundo | `#FFF6D6` | atencao | `#E8833A` |
| tinta | `#000000` | negativo | `#C94141` |
| grafite | `#363636` | neutro | `#9A9A9A` |
| tinta-fraca | `#666666` | informativo | `#215FD7` |
| borda | `#E6E6E6` | informativo-fundo | `#E7F1FF` |
| fundo | `#FAFAFA` | superficie | `#FFFFFF` |

**Regras de cor:**

1. Amarelo `#FFC213` nunca é cor de texto, ícone pequeno ou link. É sempre
   preenchimento, com texto preto por cima. Amarelo sobre branco dá contraste de
   1.6:1; preto sobre amarelo, 13:1. A regra veio do próprio logo, que é um
   bloco amarelo com texto preto.
2. Amarelo é exclusivo de: marca, botão primário, aba ativa, barra de progresso
   e célula "Em aberto" do Planejamento. **Nunca para alerta** — alerta usa
   `#E8833A`.
3. Item de menu selecionado usa fundo grafite `#363636` com texto branco.

**Tipografia:** Space Grotesk nos títulos, Inter no corpo e dados. Labels em
Inter Semibold, caixa alta, letterspacing 0.08em — nunca em texto longo ou dado
de tabela. Valores monetários em numerais tabulares, alinhados à direita.

Escala: Display 32/40 · Título 24/32 · Subtítulo 18/26 · Corpo 15/22 · Apoio
13/18 · Label 11/16 caixa alta.

### 6.5 Perfis

| Perfil | Usuário de demonstração | Acesso |
|---|---|---|
| Administração | Pedro Almeida | Tudo |
| Financeiro | Fernanda Sousa | Tudo |
| Gerente de Obras | Rafael Duarte | `/`, `/obras`, `/planejamento`, `/equipe` e obras vinculadas |
| Cliente | Mariana Costa Lima | Apenas `/portal` e sub-rotas |

- Gerente **nunca** vê valor de orçamento, custo, margem nem diária. Não vê
  `/obras/:obraId/financeiro`. Só enxerga obras em `vinculos_obra`.
- Cliente **nunca** vê diária, salário, custo de terceirizado, margem,
  percentual aplicado nem contato de fornecedor.
- Perfil sem acesso vê `SemAcesso`. Nunca redirecionamento silencioso. Exceção:
  Cliente acessando `/` vai para `/portal` — roteamento de entrada, não
  permissão.

### 6.6 Elenco fixo

Não inventar nomes. Não trocar funções.

**Gestão:** Pedro Almeida (Administração) · Fernando Nunes (Administração) ·
Fernanda Sousa (Financeiro) · Rafael Duarte (Gerente de Obras) · Sofia Monteiro
(Gerente de Obras) · Ana Carvalho (Assistente de Gerenciamento)

**Campo:** Marcos Bittencourt, Adilson Prado, Edmilson Vieira, Claudinei Sartori
(pedreiros) · Nilton Barreto, Reinaldo Peçanha (azulejistas) · Sebastião
Nóbrega, Otávio Bonfim (pintores) · Jonas Ribeiro, Valdir Chagas, Israel Fontes,
Josimar Andrade, Ubiratan Coelho, Genivaldo Reis (ajudantes)

**Terceirizados:** Cleber Matos, Dorival Assunção (eletricistas) · Tarcísio Melo
(gesseiro) · Rogério Pastore (encanador)

**Complemento gerado na Tarefa B**, já registrado no `CLAUDE.md`: Erasmo
Peixoto, Belarmino Souza, Osmar Cavalcante, Osvaldo Ramalho, Deusdete Farias,
Anselmo Freitas, Nazareno Correia, Wanderley Prazeres, Anísio Trindade.

**Inativo:** Wagner Lopes (pintor, desativado em 12/06/2026)

**Obras:** Obra 22 - MCL (Mariana Costa Lima) · Obra 18 - GFR (Guilherme F.
Rocha) · Obra 25 - ATB (Antônia T. Bicalho) · Obra 31 - MBP (Miguel Barros
Pinto) · Serviço 04 - LSM (Luciana S. Medeiros, pequeno serviço).

O código da obra deriva das iniciais do cliente; o slug da rota deriva do código.

### 6.7 Data de referência

`[FATO]` Hoje é **quinta-feira, 20/08/2026**. Semana corrente: segunda 17/08 a
sábado 22/08. Toda data exibida deriva disso.

`[INTERPRETAÇÃO]` O apontamento `B09` pede poder mudar a data durante a
demonstração. Isso transforma a data de referência de constante em estado
mutável — mudança estrutural, tratada na Fase 2.

---

## 7. Inventário das telas e módulos

### 7.1 Rotas públicas

| Rota | Componente | Estado |
|---|---|---|
| `/entrar` | `Login.tsx` | Construída |
| `/entrar/primeiro-acesso` | `PrimeiroAcesso.tsx` | Construída |
| `/design-system` | `DesignSystemPage.tsx` | Construída |

### 7.2 Internas — `AppLayout.tsx`

| Rota | Componente | Estado |
|---|---|---|
| `/` | `PainelDoDia.tsx` | Construída |
| `/obras` | `CarteiraDObras.tsx` | Construída |
| `/obras/:obraId` | `ObraVisaoGeral.tsx` | Construída, genérica |
| `/obras/:obraId/diario` | `DiarioObra.tsx` | Construída |
| `/obras/:obraId/diarios` | `ObraDiarios.tsx` | Construída |
| `/obras/:obraId/checklist` | `ObraChecklist.tsx` | Construída |
| `/obras/:obraId/andamento` | `ObraAndamento.tsx` | Construída |
| `/obras/:obraId/fotos` | `ObraFotos.tsx` | Construída |
| `/obras/:obraId/financeiro` | `ObraFinanceiro.tsx` | Construída |
| `/obras/:obraId/documentos` | `ObraDocumentos.tsx` | Construída |
| `/planejamento` | `Planejamento.tsx` | Construída |
| `/financeiro` | `Fechamento.tsx` | Construída |
| `/indicadores` | `Indicadores.tsx` | Construída |
| `/equipe` | `Equipe.tsx` | Construída |
| `/equipe/:pessoaId` | `FichaPessoa.tsx` | Construída |
| `/orcamentos` | `EmBreve` | **Pendente — volta ao escopo** |

### 7.3 Portal do Cliente — `PortalLayout.tsx`

| Rota | Componente | Estado |
|---|---|---|
| `/portal` | `PortalMinhaObra.tsx` | Construída |
| `/portal/diario` | `PortalDiario.tsx` | Construída |
| `/portal/financeiro` | `PortalFinanceiro.tsx` | Construída |

### 7.4 Estado compartilhado

Módulo único em `src/state/store.ts`. Entidades:

`pessoas` · `vinculos` · `obras` · `vinculos_obra` · `ambientes` ·
`itens_orcamento` · `planejamento` · `diarios` · `presencas` · `diarias` ·
`fechamentos` · `lancamentos` · `custos_obra` · `servicos_terceiros` ·
`orcamentos_adicionais` · `parcelas`

Auxiliares: `obraSlug`, `obraPorSlug`.

Cálculos em `src/state/`: `fechamento.ts`, `obra.ts`, `indicadores.ts`,
`pessoa.ts`.

---

## 8. Fluxos críticos existentes

Estes já funcionam e **não podem regredir**. Qualquer tarefa que os quebre deve
ser revertida antes de seguir.

**F1 — Planejamento → Diário → Presença → Diária → Fechamento.** O Planejamento
publicado pré-preenche o Diário; o Gerente confirma ou corrige; ao finalizar,
gravam-se presenças e diárias; o Fechamento consome as diárias.

**F2 — Divergência planejado × realizado.** Remover alguém planejado ou
acrescentar alguém alocado em outra obra dispara confirmação explícita, sem
revelar qual é a outra obra. O registro original nunca é destruído.

**F3 — Checklist → Andamento → Carteira → Portal.** Marcar um item do checklist
recalcula o Andamento TECTO na obra, o percentual na Carteira e o que o Cliente
vê no Portal.

**F4 — Pendências derivadas do Painel.** Divergências, diárias sem obra,
diários faltando e fechamentos próximos são calculados, não escritos. Resolver
uma pendência a faz desaparecer.

**F5 — Rateio de diária.** Pessoa com presença em duas obras gera uma única
diária; o Financeiro escolhe qual obra arca; a outra fica com custo zero.

**F6 — Imutabilidade pelo Fechamento.** Fechado o ciclo, o diário do período
fica travado inclusive para Administração.

**F7 — Permissão por perfil.** Gerente com lateral reduzida, sem financeiro, e
bloqueado em obra não vinculada.

---

## 9. Auditoria completa dos novos apontamentos

Todos os apontamentos das duas revisões, sem exceção. A revisão cobriu **apenas
a visão Administração**; as visões Gerente, Financeiro e Cliente serão revisadas
em rodadas posteriores.

### 9.1 Login

**A01 — Imagem no lado esquerdo do Login**
Tela: `/entrar`. Situação: metade esquerda deveria ter foto e está sem, ou com
imagem inadequada. Desejado: imagem de construção/reforma, com pessoas olhando
projeto. Classificação: **UX/UI**. Impacto em dados: nenhum. Dependências:
nenhuma. Risco de regressão: baixo. Aceite: ao abrir `/entrar` em 1440px, a
metade esquerda exibe fotografia coerente com reforma residencial, sem
distorção, com o logo legível sobre ela.

**A02 — Bloco de demonstração está adequado**
Nenhuma ação. Registrado para não ser alterado por engano.

### 9.2 Painel do dia

**A03 — Notificações precisam ser clicáveis**
Tela: `AppLayout` / `PainelDoDia`. Situação: o sino com contador é decorativo.
Desejado: abrir painel com as últimas notificações. Classificação: **adição**.
Impacto em dados: **exige entidade `notificacoes`**. Dependências: Fase 2.
Regras relacionadas: `RN-058` (alteração no Planejamento dispara notificação),
`RN-060`, e **`Q-027`**, que pergunta exatamente se existe central de
notificações — este apontamento a responde afirmativamente. Aceite: clicar no
sino abre lista com pelo menos cinco notificações derivadas de eventos reais do
estado; o contador reflete as não lidas e zera ao abrir.

**A04 — Destaque dos títulos e rótulos do Painel**
Alcance: "pessoas em campo hoje", "obras em andamento", "diários pendentes", "a
fechar essa semana", "precisa da sua atenção", "quem está onde hoje", e os
cabeçalhos de tabela. Desejado: mais destaque que negrito, explorando o amarelo
do logo. Classificação: **UX/UI estrutural** — resolve-se em componente
compartilhado, não nesta tela. Dependências: Fase 1. Aceite: existe um
componente único de título de seção, usado em todas as telas, com tratamento
tipográfico e marca de acento; nenhuma tela desenha título de seção por conta
própria.

**A05 — Últimas fotos: manter como está.** Sem ação.

**A06 — Próximos fechamentos: manter como está.** Sem ação.

### 9.3 Carteira de obras

**A07 — Sem apontamentos.** Registrado para não sofrer alteração desnecessária.

### 9.4 Obra — visão geral

**A08 — Destaque dos títulos "Andamento", "Ambientes", "Último diário"**
Mesmo tratamento de `A04`. Classificação: **UX/UI estrutural**. Dependência:
Fase 1. Aceite: idêntico ao de `A04`.

**A09 — Bloco "Último diário" está adequado.** Sem ação.

### 9.5 Obra — Diários

**A10 — Destacar o dia da semana**
Situação: a data aparece com o dia da semana em peso secundário. Desejado:
"20 de agosto · quinta-feira" com destaque maior. Classificação: **UX/UI**.
Dependência: Fase 1 fornece o padrão. Aceite: em cada cartão de diário, o dia da
semana é legível à distância e não compete com a data.

**A11 — Filtros estão adequados.** Sem ação.

### 9.6 Obra — Checklist

**A12 — Visual adequado; funcionamento a definir junto com Orçamentos**
Classificação: **dependência**. O Checklist é a mesma lista do Orçamento sem
valores (`INV-06`: o Item de Orçamento é a unidade de execução, não existe tabela
de checklist separada). Portanto, o comportamento do Checklist só fecha depois
que o módulo de Orçamento estiver desenhado. Dependência: Fase 4. Sem ação
isolada.

### 9.7 Obra — Andamento

**A13 — Destaque dos títulos "Andamento TECTO" e "Andamento Geral"**
Mesmo tratamento de `A04`. Dependência: Fase 1.

**A14 — Andamento Geral dividido por especialidade**
Situação: o Andamento Geral é organizado por Ambiente, com um bloco separado de
serviços de terceiros. Desejado: o Andamento Geral passa a ter **subseções por
especialidade** — marcenaria, marmoraria, ar-condicionado, vidro, gesso — e cada
uma é marcada à parte; os ambientes continuam existindo dentro dele.
Classificação: **mudança funcional com impacto em dados**.
**Conflito:** a `RN-125` define o Andamento Geral como "organizado apenas por
Ambiente, sem detalhamento de serviço". O pedido introduz um segundo eixo.
Impacto em dados: `servicos_terceiros` já tem `ambiente_id`; falta
`especialidade` e uma fórmula de agregação por especialidade.
Decisão necessária: ver seção 10, item D1. Aceite: a aba Andamento exibe o
Andamento Geral com agrupamento por especialidade, cada uma com progresso
próprio, e o total continua batendo com o percentual mostrado no Portal.

### 9.8 Obra — Fotos

**A15 — Tela adequada; divisão por ambiente é acertada.** Sem ação.

**A16 — Selecionar o ambiente ao enviar foto ou vídeo**
Situação: o envio simulado não pergunta o ambiente. Desejado: ao adicionar
mídia, o Gerente escolhe o ambiente, e a mídia já entra classificada.
Classificação: **adição**. Impacto em dados: a mídia precisa de `ambiente_id`.
Dependência: Fase 2 (campo no estado). Aceite: enviar foto exige escolher
ambiente; a foto aparece imediatamente sob a aba do ambiente escolhido.

### 9.9 Obra — Financeiro

**A17 — Bloco de mão de obra por pessoa: manter.** Sem ação.

**A18 — Legibilidade dos rótulos**
Alcance: "mão de obra", "recebimentos do cliente", "custos da obra",
"fornecedor", "descrição", "data". Mesmo tratamento de `A04`. Dependência:
Fase 1.

**A19 — "Repassado com margem" equivale a serviço terceirizado**
Situação: modalidade financeira e serviço de terceiro são tratados como coisas
separadas na interface. Desejado: refletir que elétrica, gesso, porcelanato e
pintura repassados com margem **são** serviços terceirizados.
Classificação: **mudança funcional / modelagem**.
`[INTERPRETAÇÃO]` O que o apontamento revela é que hoje existem duas entidades
para o mesmo fato do mundo: `custos_obra` com modalidade `repassado_com_margem`
e `servicos_terceiros`. O mesmo eletricista aparece nas duas. Isso vai gerar
inconsistência.
Regras relacionadas: `RN-131`, `RN-133` (a modalidade pertence ao registro do
custo, nunca ao cadastro do prestador), `RN-127` (o Gerente gerencia também os
serviços de terceiros). Decisão necessária: seção 10, item D2. Aceite: um serviço
de terceiro repassado com margem aparece uma única vez no estado e é exibido nos
dois lugares a partir do mesmo registro, sem duplicação.

**A20 — Reembolsável: entender e corrigir o fluxo**
Situação: o protótipo implementa a `RN-131`, em que a TECTO paga o fornecedor e o
cliente reembolsa. Desejado, conforme descrito pelo Mestre: **um funcionário
compra algo para a obra, a TECTO reembolsa o funcionário, e depois cobra do
cliente.**
Classificação: **conflito com regra existente + impacto no módulo mais sensível**.
`[INTERPRETAÇÃO]` São dois fluxos distintos que hoje têm um nome só. O segundo
introduz uma Pessoa como credora da empresa, o que significa que o reembolso
**entra no ciclo de pagamento dela**, ao lado de diárias, adiantamentos e
descontos. Isso toca `lancamentos`, o cálculo do Fechamento, e o extrato da
pessoa.
Regras relacionadas: `RN-131`, `RN-092` a `RN-095`, `INV-03`. Decisão
necessária: seção 10, item D3. Aceite: existe um lançamento de tipo `reembolso`
associado a uma Pessoa e a uma Obra; ele soma no Fechamento da pessoa; e o
mesmo fato aparece como valor a cobrar do Cliente no Financeiro da obra.

**A21 — "Direto do cliente" está correto**
O Cliente pagou diretamente; a TECTO só registra a nota. Confirma a `RN-131`.
Sem ação, exceto a nomenclatura já decidida no Portal ("Direto do fornecedor").

**A22 — Recebimentos do cliente: manter.** Sem ação.

**A23 — Classificação das notas fiscais**
Desejado: separar nota de depósito de material, nota de parte elétrica, nota de
reembolso de material, compra online e demais. Objetivo declarado: "conseguir
ver isso acontecendo dentro da empresa". Classificação: **adição com impacto em
dados**. Impacto: exige taxonomia de tipo de nota. Dependência: Fase 2, e
relaciona-se a `A24`, `A25` e `A26` — todos são o mesmo problema de
classificação. Regras relacionadas: `RN-140`, e **`Q-030`**, que pergunta quais
são as categorias de despesa. Aceite: cada nota no Financeiro da obra tem tipo
declarado, e a lista pode ser filtrada por tipo.

### 9.10 Obra — Documentos

**A24 — Projetos separados por especialidade**
Desejado: abas ou classificação por marcenaria, marmoraria, piso de madeira etc.
Ao adicionar, escolher a especialidade ou marcar como projeto geral.
Classificação: **adição**. Dependência: mesma taxonomia de `A23`. Aceite: enviar
projeto exige escolher especialidade ou "geral"; a lista filtra por
especialidade.

**A25 — Contratos separados pela mesma lógica**
Idêntico a `A24`, aplicado à aba de contratos. Mesma dependência.

**A26 — Notas fiscais: separação complexa**
Reconhecido pelo Mestre como complexo. Mesma taxonomia de `A23`.
`[INTERPRETAÇÃO]` `A23`, `A24`, `A25` e `A26` são um único problema: **o sistema
precisa de uma taxonomia de especialidade e de tipo de documento**, usada em
notas, projetos e contratos. Resolver uma vez resolve as quatro.

**A27 — Fotos de documento: ideia entendida.** Sem ação.

### 9.11 Orçamento adicional dentro da obra

**A28 — Criar orçamento adicional dentro de cada obra**
Desejado: a Administração cria um adicional dentro da obra; ele usa a mesma
função do orçamento; é enviado ao cliente; o cliente aprova fora do sistema; a
aprovação é registrada; e então o adicional atualiza o Checklist, o valor total
e o prazo.
Classificação: **adição**. **Compatível com a documentação**: `RN-115` a
`RN-121` já descrevem exatamente isso, incluindo o rascunho de adicionais, a
revisão pela Administração, o Checklist consolidado único (`RN-119`) e o que o
Cliente vê (`RN-120`). Também compatível com `Q-025`, que pergunta como o
Cliente aprova fora do sistema — o apontamento confirma que é fora e que a
evidência é anexada. Dependência: **Fase 4**, porque reutiliza o motor do
Orçamento. Aceite: dentro da obra, criar um adicional, registrar a aprovação com
data e evidência, e observar o Checklist ganhar os itens, o total da obra subir
e o prazo mudar — com o Portal do Cliente refletindo tudo.

### 9.12 Planejamento

**A29 — Criar um planejamento do zero durante a demonstração**
Desejado: iniciar uma semana nova, montar a grade inteira e publicar, ao vivo.
Classificação: **adição estrutural**. Impacto: exige criação de semana e,
combinado com `B09`, data de referência mutável. Regras relacionadas: `RN-051`
(Rascunho → Publicado), `RN-052`, `RN-062`. Dependência: Fase 3. Aceite: a
partir da tela de Planejamento, criar a semana seguinte vazia, alocar pessoas,
marcar ausências, publicar, e ver o Diário da obra chegar pré-preenchido com o
que foi planejado.

**A30 — Faixa de resumo deve refletir mudanças**
`[FATO]` Já implementado — os quatro números são recalculados ao vivo. Verificar
que continua funcionando após as mudanças de Fase 1 e 3. Sem ação nova.

### 9.13 Financeiro e Indicadores

**A31 — O financeiro é da empresa e das obras**
Classificação: **princípio orientador**, não tarefa isolada. Consequência: o
módulo financeiro precisa das duas dimensões, e hoje só tem a das obras. Ver
`A39`.

**A32 — Divisão de papéis: Indicadores é visual, Financeiro é detalhado**
`[DECISÃO]` Registrada. Indicadores = dashboard, leitura rápida, gráfico.
Financeiro = operação detalhada. Nenhuma tela deve invadir o papel da outra.

**A33 — Fechamento de ciclo funcionou no teste.** Sem ação. Fluxo confirmado
pelo Mestre: ajustar desconto → salvar → resolver pendências → executar
fechamento.

**A34 — Ver de qual obra vem cada pagamento — RETIRADO**
O Mestre encontrou a funcionalidade durante a própria revisão (clicar na linha
abre a gaveta de extrato). Registrado para memória; **nenhuma ação**.

**A35 — Tabela do Fechamento mais legível**
Mesmo tratamento de `A04`, aplicado a tabela financeira. Dependência: Fase 1.

**A36 — Explicar descontos, parcela, adiantamento e estorno**
Classificação: **pedido de definição, não de código**. `[FATO]` Adiantamento é
descontado integralmente no ciclo seguinte (`RN-092`); Empréstimo é parcelado
(`RN-093`); ambos são a mesma entidade diferenciada pelo número de parcelas
(`RN-094`). `[FATO]` "Estornar lançamento" aparece nas linhas fechadas mas **não
tem fluxo implementado** — o clique informa que não está disponível.
Ação: implementar o estorno de verdade, porque é a única forma de correção
depois do Fechamento (`INV-08`) e é argumento de auditoria forte na
demonstração. Aceite: estornar um lançamento fechado cria um registro de
estorno visível, não apaga nada, e o valor reaparece no ciclo seguinte.

**A37 — Organizar a aba "Por obra" do Fechamento**
`[FATO]` A aba existe e conta corretamente zero, mas não tem dado de
demonstração. Classificação: **adição**. Regras relacionadas: `RN-004` (Gerente
recebe valor fixo por Obra), `Q-001` a `Q-003`, todas em aberto sobre como esse
pagamento funciona. `[INTERPRETAÇÃO]` Como as perguntas estão abertas, o
protótipo deve mostrar a estrutura sem afirmar a regra: lista de pagamentos por
obra, com a obra, a pessoa, o valor e a situação. Aceite: a aba exibe ao menos
dois pagamentos por obra, com origem identificada.

**A38 — Detalhar muito melhor os Indicadores**
Objetivo declarado: entender onde passa o dinheiro e quanto se gasta com cada
coisa. Classificação: **mudança funcional**. Dependência: `A39`, porque sem as
despesas da empresa não há o que detalhar. Aceite: os Indicadores respondem, sem
sair da tela, quanto foi gasto por categoria no período e qual a margem
resultante.

**A39 — Custos da empresa que hoje não existem**
Novos: ferramentas e máquinas (compra e conserto — marreta, martelete, maquita),
uniforme e camisetas da equipe, marketing e tráfego pago.
Classificação: **adição com impacto em dados**. Impacto: exige entidade
`despesas_empresa` com categoria. Regras relacionadas: **`RN-140`** (despesas
gerais por lançamento manual, com categoria) e **`Q-030`** (quais são as
categorias) — este apontamento **responde parcialmente a `Q-030`**.
Também `Q-031`: se a despesa geral é rateada entre obras ou fica em categoria
separada — continua aberta e afeta o cálculo da margem. Aceite: existe tela ou
bloco de despesas da empresa com as categorias citadas; os Indicadores as
consomem; a margem da empresa passa a descontá-las.

**A40 — Novo tipo de funcionário: marketing (Daniel)**
Classificação: **adição com impacto em dados**. **Conflito parcial:** a tabela de
`RN-004` lista os tipos de Vínculo e não contempla marketing nem administrativo
não-sócio. Decisão necessária: seção 10, item D4. Aceite: existe uma Pessoa com
vínculo de tipo administrativo/marketing, cujo custo aparece nas despesas da
empresa e não em nenhuma obra.

**A41 — Saber se está perdendo dinheiro**
Classificação: **objetivo, não tarefa**. Traduz-se em: os Indicadores devem
mostrar resultado consolidado da empresa, não só soma de obras. Coberto por
`A38` e `A39`.

**A49 — Formatação monetária e vivacidade visual**
Situação: nos Indicadores, o `R$` aparece separado do valor, quebrando a leitura.
Desejado: corrigir a formatação, dar mais destaque aos rótulos e usar cor com
mais vida. Classificação: **UX/UI estrutural**. Dependência: Fase 1 — a
formatação monetária deve virar função única usada em todo o projeto.
Aceite: nenhuma tela exibe `R$` quebrado do número; existe uma única função de
formatação monetária; ela é usada em todos os lugares.

### 9.14 Equipe e Ficha da pessoa

**A42 — Fotos das pessoas**
Situação: todos os avatares são iniciais em cinza e grafite, o que o Mestre
descreve como incômodo. Desejado: fotos simuladas, nem que sejam avatares
ilustrados. Classificação: **UX/UI estrutural** — o avatar é componente
compartilhado, usado em Painel, Equipe, Diário, Planejamento, Fechamento, Obra
e Portal. Dependência: Fase 1. Aceite: toda pessoa tem retrato consistente,
sempre o mesmo em todas as telas.
`[RECOMENDAÇÃO]` Usar avatares ilustrados determinísticos, não fotografias de
pessoas reais. Fotografia de banco de imagens associada a nome fictício de
funcionário cria constrangimento se alguém reconhecer o rosto, e o protótipo vai
ser publicado num link.

**A43 — Dados pessoais e diária na ficha: adequado.** Sem ação.

**A44 — Emprestar dinheiro e adiantar pagamento a partir da ficha**
Classificação: **adição**. Regras relacionadas: `RN-092` a `RN-095` já definem o
comportamento; falta o ponto de entrada. `Q-007` (existe limite de valor?)
continua aberta. Dependência: nenhuma estrutural — `lancamentos` já existe.
Aceite: da ficha da pessoa, criar adiantamento ou empréstimo; o lançamento
aparece no próximo Fechamento dela como desconto, com a contagem de parcelas.

**A45 — Terceirizado com contrato e valor por obra**
Situação: o terceirizado tem vínculo único com contrato em parcelas. Desejado:
cada obra que ele executa tem contrato próprio, com escopo e valor definidos.
Classificação: **mudança funcional com impacto em dados**. Regras relacionadas:
`RN-004`, `RN-133`, e **`Q-005`** (as parcelas são por data fixa ou por etapa, e
quem confirma) — em aberto. Impacto: exige entidade de contrato de terceirizado
por obra. Dependência: Fase 2. Aceite: a ficha de um terceirizado lista os
contratos dele por obra, cada um com escopo, valor e situação.

**A46 — Foto também para terceirizados.** Coberto por `A42`.

**A47 — Cores por tipo de vínculo**
Desejado: distinguir visualmente funcionário próprio, terceirizado,
administração e gerência. Classificação: **UX/UI estrutural**. Dependência:
Fase 1. Restrição: a paleta não tem quatro cores livres — `positivo`, `atencao`,
`negativo` e `informativo` já carregam significado. Decisão necessária: seção
10, item D5.

**A48 — Melhorar o visual ao máximo, deixar agradável.** Objetivo geral,
absorvido pelas Fases 1 e 5.

### 9.15 Orçamentos — fluxo completo

**B01 — Não precisa estar completo, mas pensar com mente aberta**
`[DECISÃO]` O módulo entra no escopo, mas com profundidade calibrada: o
**fluxo de criação precisa funcionar ponta a ponta**; o catálogo de serviços
pode ser reduzido e representativo, não exaustivo.

**B02 — Tela de listagem de orçamentos**
Desejado: orçamentos feitos, pré-aprovados, aprovados. Classificação: **adição**.
Regras relacionadas: `RN-106` define os estados como `Rascunho` → `Finalizado` →
`Aprovado` · `Recusado`. `[INTERPRETAÇÃO]` "Pré-aprovado" do apontamento
corresponde a `Finalizado` — usar a nomenclatura da `RN-106`. Aceite: `/orcamentos`
lista orçamentos com estado, obra, cliente, valor e data, filtráveis por estado.

**B03 — Assistente de criação de orçamento**
O fluxo descrito, em cinco passos:

1. **Ambientes.** Adicionar os ambientes da obra e a quantidade de cada — suíte
   master, suítes, dormitório, despensa, cozinha, lavabo, banheiro, sala.
2. **Metragem.** Informar a metragem de cada ambiente.
3. **Serviços por categoria.** Selecionar serviços organizados por área:
   demolição, alvenaria, gesso, hidráulica, elétrica, porcelanato. Dentro de
   cada área, vários serviços — exemplo dado: gesso contém execução de forro de
   drywall, demolição de forro de drywall, execução de parede de drywall,
   execução de sanca.
4. **Ambientes e quantidades por serviço.** Para cada serviço escolhido, marcar
   em quais ambientes ele ocorre e a quantidade em cada um. Exemplo dado: sala
   com 3 tomadas e 5 luminárias; cozinha com 5 tomadas e 10 luminárias.
5. **Ajuste comercial.** Aplicar percentual ou valor fixo sobre o total.

Classificação: **adição estrutural — maior item do roadmap**. Impacto em dados:
exige catálogo de serviços com categorias e formas de cálculo.
Regras relacionadas: `RN-100` a `RN-105`. `RN-102` já prevê metro quadrado,
metro linear, unidade, diária, ponto, ambiente e valor fixo — o exemplo das
tomadas corresponde à forma "ponto". `RN-104` prevê o percentual sobre o
orçamento inteiro ou sobre itens, distribuído proporcionalmente. `RN-105` proíbe
o Cliente de ver que houve percentual.
Dependência: Fase 2 (catálogo) → Fase 4 (assistente). Aceite: criar um orçamento
do zero pelo assistente, com pelo menos três ambientes e seis serviços, aplicar
um percentual, e obter um orçamento cujos itens alimentam o Checklist da obra.

**B04 — Duas visualizações do orçamento gerado**
1. **Por ambiente** → dentro de cada ambiente, agrupado por tipo de serviço →
   dentro, os serviços.
2. **Corrida** → agrupado por tipo de serviço, todos os ambientes juntos.
Classificação: **adição**. Regras relacionadas: `RN-101` (o orçamento é
estruturado por Ambiente). A segunda visão é nova e não conflita — é
apresentação, não estrutura. Aceite: alternar entre as duas visões sem recarregar,
com o total idêntico nas duas.

### 9.16 Fluxos de criação

**B05 — Criar nova obra**
`[FATO]` O botão "Nova obra" existe e não funciona. Classificação: **adição
estrutural**. Regras relacionadas: `RN-030` (somente Administração cria),
`RN-031` (uma Obra tem exatamente um Cliente e um endereço), `RN-033` (não
depende de orçamento aprovado), `RN-038` (identificação por sigla do cliente
mais sequencial). Dependência: `B07`, porque a obra exige cliente. Aceite: criar
uma obra do zero, com código gerado a partir do cliente, e vê-la aparecer na
Carteira imediatamente.

**B06 — Criar novo funcionário**
Classificação: **adição estrutural**. Regras relacionadas: `RN-001` (campos
obrigatórios da Pessoa), `RN-002` (CPF único), `RN-003` (um Vínculo ativo por
vez), `RN-004` (o tipo de Vínculo determina campos e regime).
`[INTERPRETAÇÃO]` O formulário precisa criar **Pessoa e Vínculo separadamente**,
não um "cadastro de funcionário" — é `INV-01` virando interface, e é um bom
momento de demonstração. Aceite: criar uma Pessoa, atribuir um Vínculo com tipo
e regime, e vê-la disponível no Planejamento da semana seguinte.

**B07 — Criar cliente**
Classificação: **adição**. Regras relacionadas: `RN-032` (um Cliente pode ter
várias Obras), `RN-138` (exatamente um login por Cliente). Aceite: criar cliente
e usá-lo imediatamente na criação de uma obra.

**B08 — Fluxo completo de ponta a ponta**
Criar obra → vincular gerente e assistente → montar planejamento → abrir diário.
Classificação: **integração**, não funcionalidade nova. É o teste de aceite das
Fases 3 e 4 juntas, e é o que o Mestre chama de fluxo "lindo".
Aceite: em uma sessão contínua de demonstração, executar a cadeia inteira sem
sair para nenhuma tela de administração de dados.

**B09 — Mudar a data e variar o cenário**
Desejado: editar a data de referência, testar variações, publicar.
Classificação: **adição estrutural**. Impacto: a data de referência deixa de ser
constante e vira estado mutável — toda tela que deriva dela precisa reagir.
Risco de regressão: **alto**, porque a data alimenta o Painel, o Planejamento, o
Diário, o Fechamento e o Portal.
`[RECOMENDAÇÃO]` Implementar como controle discreto de ensaio, não como
funcionalidade visível ao cliente na demonstração. Aceite: mudar a data
reposiciona a semana corrente e os indicadores derivados, sem quebrar nenhuma
tela.

---

## 10. Conflitos, decisões novas e pontos que precisam virar documentação

### A. Apontamentos compatíveis com a documentação atual

`A21` (direto do cliente confirma `RN-131`) · `A28` (adicional dentro da obra já
está em `RN-115` a `RN-121`) · `A44` (empréstimo e adiantamento já em `RN-092` a
`RN-094`, falta o ponto de entrada) · `B04` (visões do orçamento, apresentação
sobre `RN-101`) · `B05`, `B06`, `B07` (criação seguindo `RN-030`, `RN-001` a
`RN-004`, `RN-032`).

### B. Apontamentos que complementam algo ainda não documentado

- `A16` — mídia classificada por Ambiente. Nenhuma RN trata classificação de
  mídia. Deve virar regra.
- `A23`, `A24`, `A25`, `A26` — taxonomia de especialidade e tipo de documento.
  Nenhuma RN a define. Deve virar regra, e é pré-requisito de várias telas.
- `A45` — contrato de terceirizado por Obra. A `RN-004` menciona "contrato com
  parcelas" sem definir se é por Obra.
- `B02` — nomenclatura de listagem de orçamentos; usar os estados da `RN-106`.

### C. Apontamentos que substituem decisão anterior

- **`A29` e `B09` substituem a decisão de data fixa.** O protótipo foi construído
  com "hoje = 20/08/2026" constante. Passa a precisar de data mutável.
- **`B01` a `B04` revertem o corte do módulo de Orçamento.** Ele havia sido
  deliberadamente excluído do protótipo por custo. Volta ao escopo.
- **`A34` foi retirado pelo próprio Mestre** durante a revisão.

### D. Apontamentos que conflitam com uma RN — decisão necessária

**D1 · `A14` × `RN-125` — eixo do Andamento Geral**
A `RN-125` define o Andamento Geral como organizado **apenas por Ambiente, sem
detalhamento de serviço**. O apontamento pede subseções por especialidade.
Opções: (a) manter a RN e tratar a especialidade só como agrupamento visual, sem
mudar o cálculo; (b) alterar a RN para dois eixos, ambiente e especialidade, com
o percentual derivando da especialidade. `[RECOMENDAÇÃO]` (b), porque é como a
obra realmente acontece — o marceneiro entrega a marcenaria inteira, não "a
marcenaria da suíte". Mas a alteração precisa ser decidida com Pedro e Fernando,
não no protótipo.

**D2 · `A19` — duplicidade entre `custos_obra` e `servicos_terceiros`**
O mesmo eletricista existe como custo repassado com margem e como serviço de
terceiro. `[RECOMENDAÇÃO]` Unificar: um serviço de terceiro **é** um custo com
modalidade; a situação de execução é um campo desse mesmo registro. Isso respeita
`RN-133` (a modalidade pertence ao registro do custo) e elimina a chance de os
dois blocos discordarem na tela.

**D3 · `A20` × `RN-131` — reembolso ao funcionário**
A `RN-131` só prevê reembolso de fornecedor para cliente. O fluxo descrito
introduz a Pessoa como credora da empresa, o que faz o reembolso entrar no ciclo
de pagamento dela. `[RECOMENDAÇÃO]` Tratar como **modalidade nova**, não como
variação da existente, e como **tipo novo de lançamento**. Este é o item de maior
risco do documento: mexe no Fechamento, que é o módulo onde erro não aparece na
tela e aparece semanas depois no bolso de alguém.

**D4 · `A40` × `RN-004` — tipo de Vínculo para marketing/administrativo**
A tabela da `RN-004` não contempla. Precisa de linha nova, com a definição do
regime de remuneração e da forma como o custo entra no resultado — despesa da
empresa, não custo de obra.

### E. Conflitos com invariante arquitetural

Nenhum apontamento viola diretamente um `INV`.

Dois merecem vigilância:

- `A20`/`D3` toca `INV-03` (valor congelado) e `INV-07` (imutabilidade pelo
  Fechamento). Reembolso lançado depois do fechamento do ciclo **não pode**
  alterar o ciclo fechado; tem que ir para o seguinte, ou virar estorno.
- `A14`/`D1` não viola `INV-06`, desde que a especialidade seja atributo do
  serviço de terceiro e não crie uma segunda tabela espelhando o checklist.

### F. Apontamentos ligados a perguntas em aberto

| Apontamento | Pergunta | Situação |
|---|---|---|
| `A03` | `Q-027` — existe central de notificações? | O apontamento responde: sim |
| `A23`, `A39` | `Q-030` — quais categorias de despesa? | Respondida parcialmente |
| `A39` | `Q-031` — despesa geral é rateada entre obras? | Continua aberta, afeta margem |
| `A37` | `Q-001`, `Q-002`, `Q-003` — pagamento do Gerente por obra | Continuam abertas |
| `A44` | `Q-007` — existe limite para adiantamento? | Continua aberta |
| `A45` | `Q-005` — parcelas por data ou por etapa? | Continua aberta |
| `A28` | `Q-025` — como o Cliente aprova fora do sistema | O apontamento confirma: fora, com evidência |
| `A16` | `Q-028` — retenção e compressão de mídia | Continua aberta |

### G. Decisões que ficam só no protótipo

Não devem virar regra do produto sem discussão com Pedro e Fernando:

Andamento TECTO por contagem simples de itens · período trabalhado como enum de
três opções · Administração publica o Planejamento e o Gerente ajusta na semana ·
publicação única sem versionamento · Gerente vê só as obras dele no Planejamento ·
mensagem "pessoa indisponível" sem revelar a obra · no Diário o Gerente registra
presença de qualquer um · Gerente informa a ausência e a Administração decide o
pagamento · diária sem rateio proporcional · pagamento nunca negativo · fechamento
bloqueado por pendência aberta · nomenclatura "Direto do fornecedor" no Portal.

### Lacunas do Documento Canônico encontradas durante a prototipação

1. A `RN-135` promete ao Cliente ver a **função** das pessoas, mas nenhuma RN
   cria esse campo. Tipo de Vínculo não é função.
2. A `RN-052` exige que toda Pessoa com Vínculo ativo apareça no Planejamento,
   mas Administração e Financeiro não vão a obra. Falta o recorte explícito.

---

## 11. Recomendações adicionais do Claude

Não pedidas pelo Mestre. Separadas de propósito.

**R01 — Estados vazios em todas as telas.** Com os fluxos de criação, o usuário
vai criar uma obra e cair em telas sem dado. Uma obra recém-criada não pode
mostrar tabela vazia sem explicação. Cada tela precisa de um estado vazio com
frase útil e ação sugerida. Isso é o que separa "protótipo" de "produto" na
percepção de quem assiste.

**R02 — Confirmação visível para toda ação que grava.** Hoje algumas ações
gravam em silêncio. Numa demonstração, quem assiste não sabe se funcionou. Um
aviso curto e consistente após cada gravação transmite solidez.

**R03 — Um único componente de valor monetário.** Ligado a `A49`, mas maior:
formatação, alinhamento tabular, cor para negativo e comportamento em tela
estreita, num componente só. Valor monetário aparece em nove telas.

**R04 — Não publicar o link com dado que pareça real.** O protótipo será
publicado. Nome de cliente, endereço de imóvel e foto de pessoa, mesmo
fictícios, devem ser obviamente fictícios. Endereços genéricos, avatares
ilustrados.

**R05 — Ensaiar a demonstração inteira duas vezes antes da reunião.** Com o
cronômetro. O maior risco não é a tela quebrar; é o Mestre perder o fio da
narrativa procurando onde clicar.

**R06 — Congelar o repositório 24 horas antes da reunião.** Nenhuma alteração
depois disso, por melhor que pareça. Bug introduzido na véspera não tem tempo de
ser descoberto.

**R07 — Ter um plano para a pergunta "quanto custa e quando fica pronto".** Ela
vai aparecer no meio da demonstração. Vale ter a resposta pronta e curta.

---

## 12. Roadmap mestre de alterações

### Princípio de ordenação

A revisão cobriu **apenas a visão Administração**. Haverá pelo menos mais três
rodadas — Gerente, Financeiro e Cliente. Por isso o roadmap começa pelo que é
**compartilhado**: resolver o sistema visual agora faz as próximas revisões
nascerem com menos itens, em vez de pagar a mesma correção quatro vezes.

Depois vem o **estado**, porque quase toda adição pedida precisa de entidade
nova. Depois os **fluxos**, depois os **módulos**, depois a **responsividade**, e
por último o **ensaio**.

### Triagem por prazo

`[RECOMENDAÇÃO]` O escopo agregado pelos apontamentos é maior que a construção
original do protótipo. Se a reunião for na próxima semana, não cabe. Divisão
sugerida:

**Indispensável para a reunião:** Fases 0, 1, 2, 3 e 7.
**Alto retorno se houver tempo:** Fase 4 (Orçamento) e os itens de Fase 5 ligados
a Indicadores e Financeiro.
**Pode ficar para depois do fechamento comercial:** o restante da Fase 5 e as
Fases 6.

---

### FASE 0 — Encerrar o estado atual do repositório

**Objetivo.** Deixar o repositório estável, compreendido e documentado antes de
começar o novo ciclo.

**Por que vem nesta posição.** A Tarefa D não terminou. Começar coisa nova sobre
tarefa incompleta gera diagnóstico impossível: um bug futuro pode vir da Tarefa D
ou da tarefa nova, e ninguém sabe.

**Pré-requisitos.** Nenhum.

**Arquivos envolvidos.** Todo o repositório; `CLAUDE.md`;
`docs/ESTADO_DO_PROTOTIPO.md`.

**Subtarefas.**
1. Inspecionar `git status` e `git diff`.
2. Identificar o que da Tarefa D foi feito e o que faltou.
3. Concluir o que faltou, sem começar nada novo.
4. Rodar `tsc --noEmit`, build e lint disponíveis.
5. Verificar em navegador nas três larguras e nos quatro perfis.
6. Atualizar a documentação para refletir o código real.
7. Commit.

**Critérios de aceite.** `tsc --noEmit` limpo · nenhuma tela com rolagem
horizontal em 390px · os sete fluxos críticos da seção 8 funcionando ·
documentação batendo com o código.

**Riscos de regressão.** Baixo, é conclusão de trabalho iniciado.

**Teste manual obrigatório.** Os sete fluxos da seção 8.

**Impacto nas próximas etapas.** Todas dependem disto.

---

### FASE 1 — Sistema visual compartilhado

**Objetivo.** Resolver, em componentes compartilhados, os apontamentos de
hierarquia visual que aparecem em várias telas.

**Por que vem nesta posição.** Resolve `A04`, `A08`, `A10`, `A13`, `A18`, `A35`,
`A42`, `A46`, `A47`, `A48` e `A49` de uma vez, e faz as próximas três revisões
por perfil começarem de um patamar melhor.

**Pré-requisitos.** Fase 0.

**Arquivos envolvidos.** Componentes compartilhados; `DesignSystemPage.tsx`;
todas as telas, por consumo.

**Alterações necessárias.**
1. **Componente de título de seção**, com tratamento tipográfico e marca de
   acento amarelo, usado obrigatoriamente em todas as telas. Nenhuma tela desenha
   título por conta própria. (`A04`, `A08`, `A13`, `A18`, `A35`)
2. **Componente de cabeçalho de tabela**, com o mesmo tratamento.
3. **Componente de avatar com retrato**, determinístico por pessoa, igual em
   todas as telas. (`A42`, `A46`)
4. **Codificação de cor por tipo de vínculo.** Depende da decisão `D5`.
   (`A47`)
5. **Componente único de valor monetário**: formatação, numerais tabulares,
   alinhamento, cor para negativo. (`A49`, `R03`)
6. **Destaque de data com dia da semana.** (`A10`)
7. **Imagem do Login.** (`A01`)
8. Atualizar a página de Design System para exibir todos os componentes novos.

**Critérios de aceite.** Nenhum `R$` separado do número em nenhuma tela · toda
pessoa com o mesmo retrato em todas as telas · nenhum título de seção desenhado
fora do componente compartilhado · a página `/design-system` mostra os
componentes novos.

**Riscos de regressão.** Médio — toca todas as telas. Mitigação: uma subtarefa
por componente, com commit e verificação entre elas.

**Teste manual obrigatório.** Percorrer as 19 telas nos quatro perfis, buscando
título fora do padrão.

**Impacto nas próximas etapas.** Todas as telas novas nascem no padrão certo.

---

### FASE 2 — Expansão do estado

**Objetivo.** Criar as entidades e campos que as adições pedidas exigem, sem
construir tela nenhuma.

**Por que vem nesta posição.** Sete apontamentos dependem de estrutura de dados
que não existe. Construir tela antes obriga a reescrevê-la depois.

**Pré-requisitos.** Fase 0.

**Alterações necessárias.**
1. `notificacoes` — tipo, origem, data, lida. Derivada de eventos reais.
   (`A03`)
2. `catalogo_servicos` e `categorias_servico` — demolição, alvenaria, gesso,
   hidráulica, elétrica, porcelanato; cada serviço com forma de cálculo conforme
   `RN-102`. (`B03`)
3. `especialidades` — marcenaria, marmoraria, vidro, ar-condicionado, gesso,
   piso de madeira. Usada por serviços de terceiros, projetos e contratos.
   (`A14`, `A24`, `A25`)
4. `tipos_documento` e tipo em nota fiscal. (`A23`, `A26`)
5. `despesas_empresa` — categoria, descrição, valor, data. Categorias:
   ferramentas e máquinas, uniforme, marketing e tráfego pago, e as demais que
   surgirem. (`A39`)
6. `contratos_terceirizado` — pessoa, obra, escopo, valor, parcelas, situação.
   (`A45`)
7. Campo `ambiente_id` em mídia. (`A16`)
8. Tipo `reembolso` em `lancamentos`, com pessoa e obra. Depende da decisão
   `D3`. (`A20`)
9. Tipo de vínculo administrativo/marketing. Depende da decisão `D4`. (`A40`)
10. Unificação de `custos_obra` e `servicos_terceiros`. Depende da decisão `D2`.
    (`A19`)
11. Data de referência como estado mutável. (`B09`)

**Critérios de aceite.** `tsc --noEmit` limpo · nenhuma tela existente alterada
visualmente · o estado popula com dados coerentes com o elenco fixo · os sete
fluxos críticos continuam funcionando.

**Riscos de regressão.** Alto nos itens 10 e 11 — a unificação toca telas que já
funcionam, e a data mutável alimenta cinco módulos. Mitigação: fazer 10 e 11 em
subtarefas separadas, cada uma com verificação completa.

**Teste manual obrigatório.** Os sete fluxos críticos, integralmente.

---

### FASE 3 — Fluxos de criação

**Objetivo.** Permitir criar cliente, obra, pessoa e planejamento durante a
demonstração.

**Por que vem nesta posição.** É o que transforma a demonstração de passeio em
construção ao vivo, e depende do estado da Fase 2.

**Pré-requisitos.** Fases 1 e 2.

**Subtarefas em ordem.**
1. Criar Cliente. (`B07`)
2. Criar Obra, com código derivado do cliente e vinculação de gerente e
   assistente. (`B05`)
3. Criar Pessoa e Vínculo, em passos separados. (`B06`)
4. Criar semana de Planejamento do zero e publicar. (`A29`)
5. Controle de data de referência para ensaio. (`B09`)

**Critérios de aceite.** Executar `B08` inteiro numa sessão contínua: criar
cliente → criar obra → vincular gerente → criar pessoa → montar planejamento →
publicar → abrir o diário e vê-lo pré-preenchido.

**Riscos de regressão.** Médio. Entidade criada com campo faltando quebra telas
que assumem dado completo. Mitigação: validação em todo formulário, e criar uma
obra nova e percorrer as sete abas dela antes de dar por concluído.

---

### FASE 4 — Módulo de Orçamento

**Objetivo.** Construir a listagem, o assistente de criação, as duas
visualizações e o orçamento adicional dentro da obra.

**Por que vem nesta posição.** É o maior item isolado do roadmap e depende do
catálogo da Fase 2. Também destrava `A12` e `A28`.

**Pré-requisitos.** Fases 2 e 3.

**Subtarefas em ordem.**
1. `/orcamentos` — listagem com estados da `RN-106`. (`B02`)
2. Assistente, passos 1 e 2: ambientes e metragens. (`B03`)
3. Assistente, passo 3: seleção de serviços por categoria. (`B03`)
4. Assistente, passo 4: ambientes e quantidades por serviço. (`B03`)
5. Assistente, passo 5: ajuste percentual ou por valor, conforme `RN-104`.
   (`B03`)
6. Visualização por ambiente e visualização corrida. (`B04`)
7. Orçamento adicional dentro da obra, com registro da aprovação e propagação
   para Checklist, total e prazo. (`A28`)
8. Fechar o comportamento do Checklist agora que o orçamento existe. (`A12`)

**Critérios de aceite.** Criar orçamento do zero com três ambientes e seis
serviços, aplicar percentual, aprovar, e ver os itens no Checklist da obra · o
Cliente nunca enxerga o percentual aplicado (`RN-105`) · o Gerente vê o Checklist
sem nenhum valor (`RN-022`) · o total é idêntico nas duas visualizações.

**Riscos de regressão.** Alto sobre o fluxo F3. Aprovar um adicional altera o
denominador do Andamento e faz o percentual recuar — comportamento correto, que
precisa da faixa explicativa já implementada.

---

### FASE 5 — Ajustes por módulo, visão Administração

**Objetivo.** Aplicar os apontamentos específicos de cada tela.

**Pré-requisitos.** Fases 1 e 2.

**Subtarefas, agrupadas por componente para evitar retrabalho.**

**5.1 Notificações** — painel clicável derivado de eventos. (`A03`)

**5.2 Obra: Andamento e Fotos** — subseções por especialidade no Andamento Geral
(`A14`, conforme decisão `D1`); seleção de ambiente ao enviar mídia (`A16`).

**5.3 Obra: Financeiro e Documentos** — classificação de notas (`A23`, `A26`);
projetos e contratos por especialidade (`A24`, `A25`); reflexo da unificação de
custos e serviços de terceiros (`A19`); fluxo de reembolso (`A20`, conforme `D3`).

**5.4 Fechamento** — implementar o estorno de verdade (`A36`); popular e
organizar a aba "Por obra" (`A37`).

**5.5 Indicadores e despesas da empresa** — tela ou bloco de despesas (`A39`);
detalhamento por categoria e resultado consolidado (`A38`, `A31`, `A41`);
pessoa de marketing (`A40`, conforme `D4`).

**5.6 Equipe e Ficha** — adiantamento e empréstimo a partir da ficha (`A44`);
contratos de terceirizado por obra (`A45`).

**Critérios de aceite.** Cada subtarefa tem o aceite descrito no apontamento
correspondente na seção 9.

---

### FASE 6 — Revisões por perfil

**Objetivo.** Absorver as revisões das visões Gerente de Obras, Financeiro e
Cliente, que ainda não foram feitas.

**Por que vem nesta posição.** Depois da Fase 1, os apontamentos dessas revisões
tendem a ser específicos, não repetições de problemas visuais compartilhados.

**Estrutura.** Uma etapa por perfil, cada uma com o mesmo formato: o Mestre
percorre a visão, registra os apontamentos, e eles entram como sub-fase.

`[RECOMENDAÇÃO]` Fazer a revisão do **Cliente** primeiro entre as três. É o
perfil que aparece no melhor momento da demonstração e o único que a TECTO vai
mostrar aos clientes dela.

---

### FASE 7 — Responsividade final

**Objetivo.** Garantir que todas as telas, incluindo as criadas nas Fases 3 a 5,
funcionem em desktop e celular.

**Por que vem nesta posição.** Aplicar responsividade a telas que ainda não
existem é pagar duas vezes.

**Pré-requisitos.** Fases 3, 4 e 5.

**Alterações.** Pontos de quebra em 720px e 1024px, seguindo o padrão já
estabelecido na tela de Fechamento. Barra lateral vira barra inferior abaixo de
720px. Grade do Planejamento com rolagem horizontal e coluna de nomes fixa.
Tabela financeira vira cartão por linha, nunca rolagem horizontal. Assistente de
orçamento em coluna única.

**Critério de aceite.** Nenhuma tela gera rolagem horizontal da página em 390px.

---

### FASE 8 — Ensaio da demonstração

**Objetivo.** Executar o roteiro inteiro duas vezes, cronometrado, e corrigir só
o que quebrar.

**Pré-requisitos.** Todas as anteriores.

**Critério de aceite.** Duas execuções completas sem travar, sem clique morto e
sem número inconsistente entre telas.

Depois disso, congelar o repositório. (`R06`)

---

## 13. Dependências entre tarefas

```
Fase 0 (encerrar) ─┬─> Fase 1 (visual)  ──────────┬─> Fase 5 (ajustes)
                   │                              │
                   └─> Fase 2 (estado) ─┬─> Fase 3 (criação) ─> Fase 4 (orçamento)
                                        │                              │
                                        └──────────────────────────────┴─> Fase 7 ─> Fase 8
                                                          Fase 6 (perfis) ─┘
```

**Regras de dependência:**

- Fase 1 e Fase 2 podem ocorrer em paralelo — uma toca componentes visuais, a
  outra toca o estado. Não se cruzam.
- Fase 3 exige Fase 2. Não há como criar obra sem as entidades.
- Fase 4 exige Fase 2 (catálogo) e Fase 3 (criar obra antes de orçar).
- Fase 5 exige Fase 1 (padrão visual) e Fase 2 (entidades).
- Fase 6 pode começar assim que a Fase 1 terminar, para cada perfil revisado.
- Fase 7 exige que todas as telas existam.
- Fase 8 exige tudo.

**Agrupamentos obrigatórios, por tocarem os mesmos arquivos:**

| Grupo | Apontamentos | Motivo |
|---|---|---|
| Taxonomia | `A23`, `A24`, `A25`, `A26` | Mesma entidade de classificação |
| Custos e terceiros | `A19`, `A20`, `A14` | Todos tocam `custos_obra` e `servicos_terceiros` |
| Indicadores | `A31`, `A38`, `A39`, `A40`, `A41` | Todos tocam o cálculo consolidado |
| Visual compartilhado | `A04`, `A08`, `A10`, `A13`, `A18`, `A35`, `A42`, `A46`, `A47`, `A49` | Mesmos componentes |
| Criação | `B05`, `B06`, `B07`, `B08`, `A29`, `B09` | Mesmo padrão de formulário |
| Orçamento | `B01`, `B02`, `B03`, `B04`, `A28`, `A12` | Mesmo motor |

---

## 14. Critérios de aceite por etapa

Consolidado, para conferência rápida.

| Fase | Critério objetivo |
|---|---|
| 0 | `tsc` limpo · sem rolagem horizontal em 390px · sete fluxos críticos ok · doc = código |
| 1 | Nenhum `R$` quebrado · retrato igual em todas as telas · nenhum título fora do componente |
| 2 | Entidades criadas e populadas · nenhuma tela alterada visualmente · fluxos críticos ok |
| 3 | `B08` executável numa sessão contínua |
| 4 | Orçamento criado do zero alimenta o Checklist · Cliente não vê percentual · Gerente não vê valor |
| 5 | Cada apontamento com o aceite da seção 9 |
| 6 | Apontamentos de cada perfil absorvidos |
| 7 | Nenhuma rolagem horizontal em 390px em nenhuma tela |
| 8 | Duas execuções completas do roteiro sem falha |

---

## 15. Estratégia de UX/UI e polish

**Hierarquia.** O problema central apontado é que tudo tem o mesmo peso. A saída
não é aumentar fontes, é criar **três níveis claros**: título de seção, rótulo de
campo, e dado. Hoje os três são quase iguais.

**O amarelo como marcador de hierarquia.** O logo é um bloco amarelo com texto
preto. Esse motivo pode virar o marcador de título de seção — uma barra ou bloco
pequeno antes do texto — sem violar a regra de que amarelo não é cor de texto.

**Densidade.** Tabela financeira precisa de densidade alta e legibilidade;
Portal do Cliente precisa de respiro. Mesma marca, densidades diferentes.

**Microcopy.** Todo estado vazio, toda confirmação e todo bloqueio precisa de
frase específica, nunca genérica. "Nenhum item" é ruim; "Nenhum serviço
cadastrado neste ambiente ainda" é bom.

**Feedback.** Toda ação que grava exibe confirmação curta e consistente. (`R02`)

**Placeholders.** Nada pode parecer não terminado. Se uma funcionalidade não
existe, ou ela não aparece, ou aparece com estado explicado.

---

## 16. Estratégia de responsividade

`[DECISÃO]` **Não existem três contextos de uso.** O Gerente trabalha na obra e
em casa; o Cliente abre no celular e no notebook. Toda tela funciona nos dois
tamanhos. Não existe "tela de campo".

Pontos de quebra: **720px** e **1024px**. A tela de Fechamento já implementou
720px e serve de referência.

| Elemento | Abaixo de 720px |
|---|---|
| Barra lateral | Vira barra inferior, com os itens permitidos ao perfil |
| Menu do Portal | Vira barra inferior |
| Grade do Planejamento | Rolagem horizontal com coluna de nomes fixa; menu de célula vira folha inferior |
| Tabela financeira | Um cartão por linha. **Nunca** rolagem horizontal |
| Abas da obra | Rolagem horizontal com a aba ativa visível |
| Diário | Coluna única, botões grandes, rodapé fixo |
| Assistente de orçamento | Um passo por tela, coluna única |

---

## 17. Roteiro revisado da demonstração

O roteiro muda com os fluxos de criação: deixa de ser passeio e passa a ser
construção ao vivo.

### Cena 1 — Login e perfis
**Precisa funcionar:** os quatro botões de demonstração. **Dados prévios:** os
quatro usuários. **Ação:** entrar como Pedro Almeida. **Mensagem:** cada pessoa
da empresa entra pela mesma porta e vê o que lhe cabe. **Falha grave:** botão de
perfil que não muda nada.

### Cena 2 — Painel com pendências reais
**Precisa funcionar:** indicadores derivados, lista de pendências, notificações
clicáveis (`A03`). **Estado inicial:** divergência do Rafael em 19/08, rateio do
Israel, diário faltando na Obra 25, fechamento semanal em 2 dias. **Mensagem:** o
sistema te diz o que precisa da sua decisão hoje. **Falha grave:** lista vazia.

### Cena 3 — Criar uma obra do zero **(nova)**
**Precisa funcionar:** Fase 3 inteira. **Ação:** criar cliente, criar obra,
vincular Rafael como gerente. **Mensagem:** começar uma obra leva um minuto, não
uma planilha nova. **Falha grave:** obra criada que abre com telas quebradas —
por isso `R01` (estados vazios) é pré-requisito desta cena.

### Cena 4 — Orçar a obra **(nova, se a Fase 4 couber)**
**Ação:** rodar o assistente, aplicar percentual, aprovar. **Mensagem:** o
orçamento não é um documento solto; ele vira a lista de execução da obra.
**Momento wow:** virar para o perfil Gerente e mostrar a mesma lista **sem um
único valor**.

### Cena 5 — Planejamento da semana
**Ação:** criar a semana seguinte, alocar pessoas, marcar uma ausência, publicar.
**Mensagem:** a grade que substitui a planilha. **Momento wow:** virar para o
perfil Gerente e ver a grade encolher para as obras dele.

### Cena 6 — Diário e divergência
**Ação:** abrir o diário, ver que já veio preenchido pelo planejamento, remover
quem não foi, acrescentar quem foi, disparar a confirmação de divergência.
**Mensagem:** o gerente confirma a realidade, não digita do zero. **Falha
grave:** diário que abre vazio.

### Cena 7 — Fechamento
**Ação:** resolver as pendências, executar o fechamento, voltar ao diário e
mostrá-lo travado. **Mensagem:** depois de pago, ninguém mexe — nem o dono.
**Momento wow:** a tentativa de editar sendo bloqueada para o próprio Pedro.

### Cena 8 — Portal do Cliente
**Ação:** clicar em "Ver como o cliente vê". **Mensagem:** o que a TECTO já
promete no site — cliente acompanhando a obra todo dia — entregue de verdade.
**Momento wow, o mais forte de todos:** o diário preenchido na Cena 6 aparecendo
para a Mariana, dois cliques depois.

### Cena 9 — Indicadores
**Ação:** abrir o dashboard. **Mensagem:** onde está o dinheiro da empresa, de
ponta a ponta. **Falha grave:** número que não bate com o que foi mostrado nas
telas anteriores.

---

## 18. Estado inicial necessário para a demonstração

O estado inicial **é o roteiro**. Sem tensão inicial, não há o que demonstrar.

**Precisa existir antes de começar:**

- Data de referência em quinta-feira, 20/08/2026, semana de 17 a 22/08.
- Planejamento da semana corrente publicado, cobrindo as 21 pessoas de campo.
- Diário da Obra 22 - MCL de 19/08 finalizado; o de 20/08 em rascunho.
- Nenhum diário da Obra 25 - ATB em 19/08 — pendência.
- Divergência: planejamento de 19/08 põe Rafael na Obra 18, presença registra
  Rafael na Obra 22.
- Israel Fontes com presença em duas obras e diária sem obra definida.
- Ausência do Jonas em 20/08 sem decisão de pagamento.
- Adiantamento do Jonas, empréstimo do Marcos em 4 parcelas com 1 paga.
- Valdir Chagas com saldo devedor maior que o valor do ciclo.
- Fechamentos abertos: semanal em 22/08, quinzenal em 29/08, mensal em 31/08.
- As cinco obras com itens de orçamento coerentes com o estado de cada uma.
- Notificações não lidas, para o sino ter conteúdo.

**Ferramenta de ensaio:** o botão discreto de restaurar dados iniciais, no rodapé
da lateral. Ele existe para o Mestre ensaiar e voltar ao ponto de partida.
**Nunca deve ser clicado durante a demonstração.**

---

## 19. Checklist de homologação ponta a ponta

Executar depois de todas as fases, na ordem.

**Acesso e permissão**
- [ ] Login como Pedro Almeida entra em `/`
- [ ] Login como Fernanda Sousa entra em `/`
- [ ] Login como Rafael Duarte entra em `/` com lateral reduzida
- [ ] Login como Mariana Costa Lima entra em `/portal`
- [ ] Como Rafael, `/financeiro` bloqueia com `SemAcesso`
- [ ] Como Rafael, `/obras/25-atb` bloqueia
- [ ] Como Rafael, a aba Financeiro da obra não aparece
- [ ] Como Mariana, `/obras` bloqueia
- [ ] Sair volta para `/entrar` nos quatro perfis

**Navegação**
- [ ] Todos os itens da lateral abrem tela construída
- [ ] Nenhuma rota cai em "Em breve"
- [ ] Voltar e avançar do navegador funcionam
- [ ] Nenhum botão sem efeito em nenhuma tela

**Obras**
- [ ] As cinco obras abrem pela Carteira
- [ ] Serviço 04 - LSM não mostra a aba Diários
- [ ] As sete abas abrem em todas as obras
- [ ] Obra recém-criada abre as sete abas com estado vazio explicado

**Planejamento**
- [ ] Criar semana nova do zero
- [ ] Alocar, marcar ausência com decisão de pagamento, deixar em aberto
- [ ] Adicional de sábado oferecido automaticamente
- [ ] Publicar muda o badge e confirma
- [ ] Como Rafael, a grade mostra só as obras dele mais os "Em aberto"
- [ ] Como Rafael, alocar pessoa indisponível informa sem revelar a obra
- [ ] Faixa de resumo recalcula a cada ação

**Diário e divergência**
- [ ] Diário chega pré-preenchido pelo Planejamento
- [ ] Período de presença gravado como dia todo, manhã ou tarde
- [ ] Remover planejado dispara confirmação e pede motivo
- [ ] Acrescentar alocado em outra obra avisa **sem** revelar a obra
- [ ] Finalizar grava presenças e diárias
- [ ] Registro original do planejamento preservado

**Painel**
- [ ] Indicadores derivados, não escritos
- [ ] Finalizar o diário muda a lista de pendências sozinha
- [ ] Contador de pendências bate com as linhas
- [ ] Notificações abrem e o contador zera

**Fechamento**
- [ ] Pendência aberta bloqueia a execução
- [ ] Definir obra que arca resolve a pendência no Fechamento e no Painel
- [ ] Ajustar desconto não permite valor maior que o proposto
- [ ] A pagar nunca negativo
- [ ] Executar fechamento trava o período
- [ ] Diário do período fechado não edita nem como Administração
- [ ] Estorno cria registro visível e não apaga nada
- [ ] Aba "Por obra" com conteúdo

**Checklist, Andamento e Fotos**
- [ ] Marcar item muda o percentual na obra, na Carteira e no Portal
- [ ] Desmarcar funciona
- [ ] Como Rafael, o Checklist não mostra nenhum valor
- [ ] Andamento Geral agrupado por especialidade
- [ ] Faixa de escopo ampliado aparece quando há adicional
- [ ] Enviar foto exige escolher ambiente e ela aparece sob o ambiente certo

**Financeiro da obra**
- [ ] Custos com modalidade e margem
- [ ] Notas classificadas por tipo e filtráveis
- [ ] Mão de obra por pessoa
- [ ] Reembolso a funcionário aparece no ciclo dele e como valor a cobrar do cliente
- [ ] Invisível para o Gerente

**Equipe, Ficha e Documentos**
- [ ] Filtros da Equipe funcionam, inclusive "Inativos"
- [ ] Toda pessoa tem retrato
- [ ] Cor por tipo de vínculo aplicada
- [ ] Ficha mostra a linha do tempo de vínculos
- [ ] Criar adiantamento pela ficha aparece no próximo Fechamento
- [ ] Terceirizado mostra contratos por obra
- [ ] Documentos classificados por especialidade e filtráveis

**Orçamento**
- [ ] Listagem com estados da `RN-106`
- [ ] Assistente completo nos cinco passos
- [ ] Percentual aplicado e invisível ao Cliente
- [ ] Duas visualizações com total idêntico
- [ ] Adicional dentro da obra propaga para Checklist, total e prazo

**Portal do Cliente**
- [ ] Andamento, ambientes e diário coerentes com as telas internas
- [ ] Diário recém-finalizado aparece
- [ ] Financeiro sem diária, custo, margem ou percentual
- [ ] Nenhum contato de fornecedor visível

**Consistência de dados**
- [ ] O percentual da obra é idêntico na Carteira, na obra e no Portal
- [ ] O total da obra é idêntico no Financeiro da obra e no Portal
- [ ] Nenhum nome fora do elenco fixo
- [ ] Nenhuma data incoerente com o dia da semana

**Responsividade**
- [ ] As 19+ telas em 390px, 800px e 1440px
- [ ] Nenhuma rolagem horizontal de página em 390px
- [ ] Nenhuma tabela financeira com rolagem horizontal em celular

**Demonstração**
- [ ] Roteiro completo executado duas vezes sem falha

---

## 20. Riscos de regressão

| Risco | Onde | Mitigação |
|---|---|---|
| Data mutável quebrar telas derivadas | Painel, Planejamento, Diário, Fechamento, Portal | Subtarefa isolada, com os sete fluxos críticos verificados |
| Unificar custos e terceiros quebrar telas prontas | Obra, Andamento, Portal | Migração com verificação nas três telas antes do commit |
| Reembolso corromper o Fechamento | Fechamento, Ficha | Cálculo em função pura, revisão linha a linha, teste com ciclo fechado |
| Componente visual novo quebrar o layout | Todas | Um componente por subtarefa, com commit entre elas |
| Obra criada sem dado quebrar as abas | Sete abas da obra | Estados vazios antes dos fluxos de criação (`R01`) |
| Adicional derrubar o percentual e parecer bug | Andamento, Portal | Faixa de escopo ampliado, já implementada |
| Guarda de permissão duplicada | Roteamento | Uma camada só; a lição já custou um bug |
| Documentação divergir do código | Repositório | Toda tarefa atualiza `ESTADO_DO_PROTOTIPO.md` |

---

## 21. Perguntas ainda abertas

**Decisões do protótipo, para o Mestre:**

- **D1** — Andamento Geral por especialidade altera a `RN-125`?
- **D2** — Unificar `custos_obra` e `servicos_terceiros`?
- **D3** — Reembolso a funcionário: modalidade nova e lançamento novo?
- **D4** — Qual o tipo de Vínculo do pessoal de marketing e administrativo?
- **D5** — Quais cores para os quatro tipos de vínculo, sem colidir com
  `positivo`, `atencao`, `negativo` e `informativo`?
- **D6** — A observação sobre "FIXO" ficou sem texto no pedido original. O que
  era?

**Perguntas do Documento Canônico tocadas pelos apontamentos e ainda abertas:**

`Q-001`, `Q-002`, `Q-003` (pagamento do Gerente por obra) · `Q-005` (parcelas de
terceirizado) · `Q-007` (limite de adiantamento) · `Q-028` (retenção de mídia) ·
`Q-031` (rateio de despesa geral entre obras).

**Lacunas do Canônico encontradas na prototipação:** campo de função da Pessoa
(`RN-135`); recorte de quem aparece no Planejamento (`RN-052`).

---

## 22. Definição de pronto do protótipo

O protótipo está pronto quando **todas** as condições abaixo forem verdadeiras:

1. O checklist da seção 19 está inteiramente marcado.
2. O roteiro da seção 17 roda duas vezes seguidas, cronometrado, sem falha.
3. Nenhuma tela tem clique morto, número inconsistente ou aparência de
   placeholder.
4. As quatro revisões por perfil foram feitas e absorvidas.
5. A documentação do repositório reflete o código real.
6. O repositório está congelado há pelo menos 24 horas.

**Não é critério de pronto:** cobertura de funcionalidade do sistema real,
qualidade de código de produção, autenticação, back-end. Isso é o projeto, não o
protótipo.

---

## 23. Contexto para a próxima conversa com Claude

Bootstrap para uma conversa sem histórico.

**O que é o TECTO.** Sistema de gestão para uma empresa de reformas de
apartamentos em São Paulo, com ~30 pessoas e ~20 obras simultâneas, que opera
hoje em WhatsApp, Drive e planilhas. Existe para responder quatro perguntas: quem
trabalhou e onde, quem recebe quanto e quando, o que aconteceu na obra, e o que
vai acontecer na próxima semana.

**Objetivo comercial.** O protótipo é instrumento de venda. Ele sustenta uma
reunião em que se discutem o contrato de desenvolvimento do sistema (cerca de
R$ 30.000, dez meses, três entregas) e a nova função do desenvolvedor dentro da
empresa. Qualidade visual e integração ponta a ponta são requisitos, não
detalhes.

**Objetivo do protótipo.** Produzir a percepção *"isso já parece o sistema da
TECTO"*. Não é entregar funcionalidade completa.

**Estágio atual.** 19 telas construídas, rodando localmente em React + Vite +
TypeScript + Tailwind, versionado em git. A cadeia de dados é real e verificada:
o Planejamento alimenta o Diário, o Diário gera Presenças e Diárias, as Diárias
alimentam o Fechamento, e o Checklist alimenta o Andamento que o Cliente vê. A
última tarefa de responsividade não terminou. O módulo de Orçamento e os fluxos
de criação não existem.

**Arquitetura conceitual.** Estado compartilhado único em memória, nomeado com as
entidades do domínio em português. Cálculo em funções puras em `src/state/`.
Roteamento com permissão declarada por rota e negação por padrão. Dois layouts:
interno e portal do cliente.

**Fontes de verdade.** Documento Canônico do projeto (regras do produto real,
`RN`/`INV`/`Q`) > decisão do Mestre > `CLAUDE.md` da raiz (regras do protótipo) >
`docs/ESTADO_DO_PROTOTIPO.md` (inventário). Este documento de handoff consolida a
etapa atual.

**Decisões principais.** Dinheiro em centavos. Nada apagado. Valor congelado no
momento do fato. Divergência derivada, nunca gravada. Nada escrito no código —
se o dado não existe, cria-se a entidade. Amarelo nunca é texto nem alerta.
Vocabulário do domínio em português, sem sinônimos. Decisões de tela do protótipo
não vão para o Documento Canônico.

**Módulos existentes.** Login e primeiro acesso · Painel · Carteira · Obra com
sete abas · Diário · Planejamento · Fechamento · Indicadores · Equipe e Ficha ·
Portal do Cliente com três telas · Design System.

**Módulos incompletos ou ausentes.** Orçamento (inexistente) · fluxos de criação
de obra, cliente, pessoa e planejamento (inexistentes) · notificações
(decorativas) · despesas da empresa (inexistentes) · estorno (sem fluxo) ·
responsividade (parcial).

**Perfis.** Administração (Pedro Almeida) · Financeiro (Fernanda Sousa) · Gerente
de Obras (Rafael Duarte) · Cliente (Mariana Costa Lima).

**Fluxos críticos que não podem regredir.** Os sete listados na seção 8.

**Mudanças recém-planejadas.** Todas as da seção 9, organizadas no roadmap da
seção 12.

**Restrições.** É maquete, não produto. A revisão feita até agora cobriu **apenas
a visão Administração**; faltam Gerente, Financeiro e Cliente, que virão em
rodadas separadas. O prazo é curto e o escopo agregado é maior que a construção
original — a triagem por prazo está na seção 12.

**Riscos.** Os da seção 20. O maior é o reembolso a funcionário, que toca o
Fechamento.

**Perguntas em aberto.** As da seção 21, com destaque para `D1` a `D6`, que
bloqueiam partes do roadmap.

**Definição de pronto.** Seção 22.

---

## 24. Prompt de encerramento para o Claude Code atual

Copiar e colar integralmente no Claude Code conectado ao repositório.

```
Esta é uma tarefa de ENCERRAMENTO E CONSOLIDAÇÃO. Você NÃO vai implementar
funcionalidades novas nesta tarefa.

Objetivo: deixar o repositório estável, compreendido e documentado, pronto
para uma nova sequência de trabalho em outra sessão.

=== ETAPA 1 — LEITURA E INSPEÇÃO. Não edite nada ainda. ===

1. Leia integralmente o CLAUDE.md da raiz e docs/ESTADO_DO_PROTOTIPO.md.
2. Rode git status e git log --oneline -15.
3. Rode git diff e git diff --staged. Descreva o que está pendente.
4. Identifique qual foi a última tarefa executada nesta sessão a partir do
   código e do histórico, NÃO a partir da documentação. A documentação pode
   estar desatualizada; o código é a fonte do estado real.
5. A última tarefa era a passada de responsividade, que incluía também duas
   correções: ordenar por data o bloco "Último Diário" em ObraVisaoGeral, e
   trocar a coluna "Andamento" dos Indicadores de Andamento Geral para
   Andamento TECTO. Ela NÃO foi concluída integralmente.

=== ETAPA 2 — DIAGNÓSTICO ===

6. Compare o que aquela tarefa exigia com o que existe no código. Separe em
   cinco listas, item a item:
   - concluído
   - parcialmente concluído
   - não iniciado
   - implementado de forma diferente da solicitada
   - potencial regressão introduzida
7. NÃO presuma que algo foi concluído só porque o arquivo foi modificado.
   Verifique o comportamento real no código.
8. Apresente esse diagnóstico ANTES de corrigir qualquer coisa.

=== ETAPA 3 — CONCLUSÃO DO QUE FALTOU ===

9. Termine o que ficou pendente daquela tarefa, desde que não dependa de
   decisão de negócio em aberto. Se algo depender de decisão, liste e pule.

   O escopo pendente é:
   a. Pontos de quebra em 720px e 1024px em todas as telas. A tela de
      Fechamento já tem o padrão — use o mesmo em todo o projeto.
   b. Abaixo de 720px: barra lateral vira barra inferior com os itens
      permitidos ao perfil; menu do Portal vira barra inferior.
   c. Planejamento abaixo de 1024px: rolagem horizontal com a coluna de
      nomes FIXA. Não empilhar, não esconder dias, não reduzir fonte abaixo
      de 13px. Menu de célula vira folha inferior.
   d. Tabelas financeiras (Fechamento, Financeiro da obra, Indicadores)
      abaixo de 720px: cada linha vira cartão. NUNCA rolagem horizontal em
      tabela financeira.
   e. Obra: as sete abas com rolagem horizontal e a aba ativa visível;
      colunas empilham abaixo de 1024px; capa reduz para 140px.
   f. Diário: coluna única em qualquer largura, botões grandes, rodapé fixo.
   g. Painel, Carteira, Equipe, Checklist, Andamento, Diários, Fotos, Ficha,
      Documentos, Login: colunas empilham, grades reduzem, listas viram
      cartões, as duas metades do Login empilham.
   h. Correção: ObraVisaoGeral.tsx, bloco "Último Diário", usa find sem
      ordenar por data. Ordene decrescente. Verifique o mesmo padrão em
      outras telas.
   i. Correção: Indicadores, tabela "Resultado por obra", coluna "Andamento"
      deve usar Andamento TECTO, não Andamento Geral, e bater com a Carteira
      e a Visão Geral em todas as obras.

   Critério de aceite objetivo: NENHUMA tela pode gerar rolagem horizontal
   da página em 390px de largura.

=== ETAPA 4 — VERIFICAÇÃO ===

10. Rode tsc --noEmit, e o build e o lint que existirem no projeto.
11. Corrija os problemas que a sua própria execução introduziu.
12. Verifique no navegador, não apenas lendo o código. Duas tarefas
    anteriores tiveram bugs que só apareceram no navegador: uma guarda de
    permissão inalcançável e presenças apontando para o diário errado.
    Teste em 390px, 800px e 1440px, nos quatro perfis (Pedro Almeida,
    Fernanda Sousa, Rafael Duarte, Mariana Costa Lima).
13. Verifique que estes fluxos continuam funcionando:
    - finalizar o Diário muda a lista de pendências do Painel sozinha
    - marcar item do Checklist muda o percentual na obra, na Carteira e no
      Portal
    - executar o Fechamento trava o diário do período
    - como Rafael Duarte, /obras/25-atb e /financeiro bloqueiam
14. Rode git diff novamente e revise o que mudou.

=== ETAPA 5 — DOCUMENTAÇÃO ===

15. Atualize docs/ESTADO_DO_PROTOTIPO.md para refletir o código REAL depois
    da execução: inventário de rotas, entidades do estado, funções puras
    existentes, backlog e o que ficou pendente.
16. Revise o CLAUDE.md e garanta que ele contenha apenas o que é permanente:
    regras invariantes, vocabulário, tokens, elenco, perfis e método de
    trabalho. Nada de inventário — isso pertence ao ESTADO_DO_PROTOTIPO.
    Remova duplicação entre os dois arquivos.
17. Registre no CLAUDE.md, na seção de método, duas lições duráveis:
    - guarda de permissão vive em um lugar só; duas camadas checando a mesma
      coisa criam uma que nunca roda
    - toda tarefa termina com verificação em navegador, não apenas tsc
18. Faça commit com mensagem descritiva.

=== ETAPA 6 — RELATÓRIO ===

Apresente um relatório final com:
- o que encontrou no repositório
- o que já estava concluído da última tarefa
- o que estava faltando
- o que você terminou agora
- arquivos modificados
- testes e verificações executados, e os resultados
- pendências restantes, se houver
- documentação atualizada
- estado final do repositório
- recomendação explícita: podemos encerrar esta sessão com segurança, sim
  ou não, e por quê

NÃO comece nenhum roadmap novo. NÃO crie telas novas. NÃO altere entidades do
estado além do necessário para concluir o que ficou pendente.
```

---

## 25. Próximo passo recomendado

1. **Rodar o prompt da seção 24** no Claude Code atual. Só isso, nada além.
2. **Decidir `D1` a `D6`** da seção 21. Sem elas, a Fase 2 fica parcialmente
   bloqueada, e a Fase 2 destrava quase todo o resto.
3. **Abrir conversa nova com este documento** como contexto inicial, e começar
   pela Fase 1, que é a de maior alavancagem — resolve onze apontamentos de uma
   vez e reduz o tamanho das três revisões por perfil que ainda virão.
4. **Confirmar a data da reunião** e aplicar a triagem por prazo da seção 12. Se
   for na próxima semana, o escopo precisa ser cortado deliberadamente, e é
   melhor cortar agora do que descobrir na sexta-feira.
