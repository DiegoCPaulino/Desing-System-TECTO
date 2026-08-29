# TECTO — Runbook de execução

**Este é o documento que você abre para trabalhar.** Ele diz qual tarefa vem
agora, quem executa, o que colar, o que verificar e como integrar.

Os outros documentos respondem outras perguntas: `AGENTS.md` diz **como** um
agente trabalha, `docs/PRODUTO.md` diz **quais são as regras**, `docs/SPRINT.md`
diz **por que esta ordem**, `docs/ABERTO.md` diz **o que não decidir**. Nenhum
deles diz o que fazer agora. Este diz.

---

# 1. O ciclo invariável

Toda tarefa, sem exceção, passa por cinco passos. Não pule nenhum, principalmente
o zero e o quatro.

### Passo 0 · A árvore está limpa?

```bash
git status
git log --oneline -5
```

Modificação pendente é resto de execução anterior. Resolva antes: commite se
fizer sentido, `git restore` se não. **Agente rodando sobre trabalho parcial
mistura duas execuções**, e o resultado é um estado que nenhuma das duas
pretendia.

Confirme também que só existe **uma sessão viva** sobre esta pasta. Duas sessões
na mesma árvore de trabalho é o defeito mais silencioso possível.

### Passo 1 · Despacho

Cole o preâmbulo padrão da §2 mais o escopo da tarefa. Espere a resposta da
pergunta de leitura antes de deixar ele começar.

### Passo 2 · O agente executa

Commit por item, push da branch, relatório em `docs/relatorios/`.

**Se a sessão acabar no meio**, o commit por item é o que te salva: você retoma
do último item concluído, não do começo.

### Passo 3 · Merge — §7 deste documento

Sempre seu. Nunca do agente.

### Passo 4 · Teste de fumaça — §8 deste documento

Dois minutos, depois de todo merge. É o que te diz *qual* merge quebrou, em vez
de descobrir na véspera que algo quebrou em algum momento.

---

# 2. Preâmbulo padrão de despacho

Idêntico em toda tarefa. Só as duas últimas linhas mudam.

```
Leia AGENTS.md inteiro. Se você é o Claude Code, leia CLAUDE.md também.
Consulte docs/ESTADO_DO_PROTOTIPO.md para saber o que existe hoje.
Se a tarefa depender de algo em docs/ABERTO.md, PARE e reporte.

Antes de escrever qualquer código, me diga em três frases: o que você leu,
o que entendeu do escopo, e o que você acha que vai ter que tocar.

Branch: <agente/code | agente/codex>
Tarefa: <cole o escopo fechado da tarefa>
```

A pergunta de leitura não é cortesia. É como você descobre em trinta segundos se
ele leu ou está improvisando — e improviso custa um commit inteiro.

---

# 3. O pipeline

Os dois agentes trabalham em paralelo, mas **o Claude Code anda um degrau à
frente**. Ele constrói o estado da rodada seguinte enquanto o Codex constrói as
telas da rodada anterior.

```
Rodada 1   Code: estado + Cena 6 + Fechamento    ‖  Codex: sistema visual
                                    └── merge ──┘
Rodada 2   Code: estorno + entidades do deg. 4   ‖  Codex: acabamento
                                    └── merge ──┘
Rodada 3   Code: cálculo dos Indicadores         ‖  Codex: telas do deg. 4
                                    └── merge ──┘
Rodada 4   Code: funções de criação              ‖  Codex: Indicadores
                                    └── merge ──┘
Rodada 5   Code: motor de orçamento              ‖  Codex: formulários
                                    └── merge ──┘
Rodada 6   Code: degrau 8 (risco alto)           ‖  Codex: assistente
                                    └── merge ──┘
Rodada F   Codex: responsividade                 ‖  Mestre: revisão e ensaio
```

**Por que o Code vai na frente.** Estado sem tela é invisível — ninguém percebe
que existe. Tela sem estado quebra na cara de quem está assistindo. Se a escada
parar no meio de uma rodada, você quer que a sobra seja do lado invisível.

**Se a parada for entre rodadas**, o protótipo está inteiro e demonstrável. Essa é
a invariante que governa a ordem toda.

---

# 4. Tabela mestra

| # | Tarefa | Degrau | Agente | Libera | Situação |
|---|---|---|---|---|---|
| P0 | Limpeza estrutural | 0 | Code | — | **Feita** · `a62dcb8` |
| P0.5 | Guarda de permissão em camada única | 0 | Code | 1, 8 | **Confirmar aceite** |
| **T1** | Estado semeado · Cena 6 · Fechamento | 1, 2 | Code | 2, 5, 6, 7, 8 | Próxima |
| **T2** | Sistema visual compartilhado | 1 | Codex | todas | Próxima |
| **T3** | Estorno · Andamento por especialidade · entidades | 3, 4 | Code | 7 | **Feita** · `f25d388` |
| **T4** | Acabamento: vazios, confirmações, notificações | 3 | Codex | 2 | **Feita** |
| **T5** | Cálculo dos Indicadores · despesas da empresa | 5 | Code | 9 | **Feita** · `d75cd12` |
| **T6** | Financeiro da obra · Ficha · Documentos | 4 | ~~Codex~~ **Code** | — | **Feita** · `b07a4fc`–`5a1b820` |
| **T7** | Funções de criação | 6 | Code | 3 | **Feita** · `bb3731c` |
| **T8** | Tela de Indicadores | 5 | ~~Codex~~ **Code** | 9 | **Feita** |
| **T9** | Motor de orçamento | 7 | Code | 4 | |
| **T10** | Formulários de criação | 6 | Codex | 3 | |
| **T11** | Degrau 8 — os cinco de risco alto | 8 | Code | — | |
| **T12** | Assistente de orçamento | 7 | Codex | 4 | |
| **TF1** | Responsividade das telas novas | F | Codex | — | |
| **TF2** | Revisão pelos perfis Cliente, Gerente, Financeiro | F | **Mestre** | — | |
| **TF3** | Ensaio duplo e congelamento | F | **Mestre** | — | |

**As três últimas não são opcionais.** Reserve tempo para elas mesmo que isso
signifique não subir mais um degrau.

> **29/08/2026 — a fronteira entre os agentes caiu.** O Codex esgotou o limite
> de uso. A T6 e a T8, que eram dele, foram executadas pelo Claude Code por
> determinação do Mestre. As tarefas restantes do Codex — T10, T12 e TF1 — não
> têm mais executante designado; o pipeline paralelo da §3 deixou de valer e a
> fila passou a ser sequencial. A regra de território de arquivo continua útil
> como higiene, mas já não protege contra nada.

---

# 5. As tarefas

## T1 · Estado, Cena 6 e Fechamento · Claude Code

**Prompt completo já escrito:** `docs/SPRINT.md` §6.

**Cuidado.** O item 5 é `src/state/fechamento.ts` — módulo da §5 do `AGENTS.md`,
onde o erro não aparece na tela. **Rode esse item com o modelo mais forte
disponível** e leia o raciocínio do cálculo antes de aceitar. Se estiver num
modelo econômico, troque; se não puder, rode o item 5 numa sessão à parte.

**Aceite.** Os sete passos do item 4 executados **no navegador**, com relato. O
navegador embutido existe — `preview_start`, `navigate`, `read_page`, `computer`.
Não aceite "verificado por leitura" nesta tarefa.

---

## T2 · Sistema visual compartilhado · Codex

**Prompt completo já escrito:** `docs/SPRINT.md` §7.

**Antes de despachar, pergunte:** *"quais ferramentas de navegador você tem
carregadas agora?"* Se ele não tiver nenhuma, a verificação entre itens vira
leitura de código, e ele precisa declarar isso — o `AGENTS.md` §8 já cobre o
caso. O que não pode é afirmar ter clicado.

**Cuidado.** É a tarefa que toca mais arquivos do sprint inteiro. O commit por
item é o que permite reverter um componente sem perder os outros sete.

---

## T3 · Estorno, Andamento por especialidade e entidades · Claude Code

```
Arquivos permitidos: src/state/**
Arquivos PROIBIDOS: src/pages/**, src/components/**, src/layouts/**

1. estornarLancamento(lancamentoId, motivo) — MÓDULO SENSÍVEL
   Cria registro que anula o anterior. Não apaga, não altera o original.
   Registra autor, data e motivo. O valor reaparece no ciclo SEGUINTE,
   nunca no ciclo já fechado. Lançamento já estornado não estorna de novo.
   Teste: estorno em ciclo fechado, estorno duplo, saldo do ciclo seguinte.
   Explique o raciocínio do cálculo no relatório.

2. Andamento Geral com dois eixos — decisão D1 em docs/DECISOES.md
   Função de agregação que devolve, do MESMO conjunto de registros:
   percentual por especialidade, por ambiente, e total da obra.
   Sem segunda tabela espelhando o checklist — isso violaria INV-06.
   O total continua batendo com o percentual do Portal.

3. Entidades aditivas, com dados semeados coerentes:
   custos_obra — fornecedor, descrição, modalidade financeira,
     valor cobrado, custo, data, nota
   servicos_terceiros — descrição, fornecedor, ambiente, especialidade,
     situação
   despesas_empresa — categoria, descrição, valor_centavos, data.
     Categorias: ferramentas e máquinas, uniforme, marketing e tráfego pago
   contratos_terceirizado — pessoa, obra, escopo, valor, parcelas, situação

   NÃO unifique custos_obra e servicos_terceiros nesta tarefa. A decisão D2
   existe e está no degrau 8, por risco.
```

**Cuidado.** O item 1 é o segundo módulo sensível do sprint. Mesma regra do T1:
modelo forte, leitura linha a linha.

**Aceite.** Estornar um lançamento fechado cria registro visível, não apaga nada,
e o valor aparece no ciclo seguinte · o percentual da obra idêntico na Carteira,
na obra e no Portal · nenhuma tela alterada.

---

## T4 · Acabamento · Codex

```
Arquivos permitidos: src/components/**, src/pages/**, src/layouts/**
Arquivos PROIBIDOS: src/state/**

1. Design system aplicado ao src/pages/Fechamento.tsx.
   A tela nasceu crua de propósito, na T1. Agora ela recebe os componentes.
   Não altere nenhum cálculo nem nenhuma chamada a src/state/.

2. Estados vazios em toda tela e toda aba.
   Frase que diz o que está faltando, na voz da interface, sem se desculpar,
   e uma ação sugerida quando existir. Nunca "Nenhum dado encontrado".
   Tom: "Esta obra ainda não tem diários. O primeiro aparece aqui quando o
   gerente registrar o dia."

3. Confirmação visível para toda ação que grava.
   A ação mantém o MESMO nome do começo ao fim: o botão "Publicar" produz
   o aviso "Publicado". Nunca "Operação realizada com sucesso".
   Cobrir: finalizar diário, publicar planejamento, marcar checklist,
   executar fechamento, salvar ajuste de desconto, enviar mídia.

4. Painel de notificações. O sino tem contador e não abre nada.
   Clicar abre a lista da entidade notificacoes, que JÁ EXISTE.
   O contador reflete as não lidas e zera ao abrir.

5. Classificação por tipo e especialidade, consumindo tipos_documento e
   especialidades, que JÁ EXISTEM: notas no Financeiro da obra filtráveis
   por tipo; projetos e contratos em Documentos, por especialidade.

6. Ambiente obrigatório ao enviar mídia. O campo ambiente_id JÁ EXISTE.

7. Remover o nome "Mariana Costa Lima" escrito no código do PortalLayout.
   Deriva do cliente da obra. Viola a regra de nada escrito no componente.
```

**Cuidado.** O item 1 toca a tela que o Claude Code acabou de criar. Se algo
parecer errado no cálculo dela, **pare e reporte** — não corrija.

---

## T5 · Cálculo dos Indicadores · Claude Code

```
Arquivos permitidos: src/state/**

1. src/state/indicadores.ts — funções puras que respondem, por período:
   receita por obra e consolidada · custo de mão de obra por obra ·
   custos por modalidade financeira · despesas da empresa por categoria ·
   margem por obra e margem consolidada da empresa

2. A margem consolidada desconta as despesas_empresa. Sem isso o número
   responde "a obra deu lucro" e não "a empresa deu lucro", que é a
   pergunta real.

3. ATENÇÃO — Q-031 está ABERTA: não se sabe se despesa geral é rateada
   entre obras ou fica em categoria separada. Implemente SEPARADA e deixe
   a função de rateio inexistente. Não invente a fórmula.

4. O sistema NÃO calcula encargos. Ver docs/DECISOES.md — o valor
   registrado é o líquido acordado. Se um vínculo tiver campo de custo
   para a empresa, use-o nos Indicadores; nunca derive um do outro.
```

**Cuidado.** É o terceiro módulo sensível. O erro aqui produz um número que
parece certo e está errado — e o Pedro vai olhar exatamente para esse número.

---

## T6 · Financeiro da obra, Ficha da pessoa e Documentos · Codex

```
Arquivos permitidos: src/components/**, src/pages/**

As entidades custos_obra, servicos_terceiros, contratos_terceirizado e
despesas_empresa JÁ EXISTEM. Se faltar campo, PARE e reporte.

1. /obras/:obraId/financeiro — custos com modalidade e margem, notas
   classificadas, recebimentos do cliente, mão de obra por pessoa.
   handle.perfis SEM Gerente de Obras. Como Rafael Duarte, a aba não
   aparece E a rota bloqueia.

2. /equipe/:pessoaId — ficha da pessoa. Reative o clique na tabela.
   Pessoa, Vínculo, Usuário e Papel visíveis como CAMADAS DISTINTAS —
   é o INV-01 virando interface, e é momento de demonstração.
   Linha do tempo de vínculos. Contratos por obra, para terceirizado.
   Ponto de entrada para criar adiantamento e empréstimo, chamando a
   função que já existe em src/state/.

3. /obras/:obraId/documentos — projetos e contratos por especialidade,
   com filtro. Tipos de documento vindos da taxonomia.
```

---

## T7 · Funções de criação · Claude Code

```
Arquivos permitidos: src/state/**
Escreva FUNÇÕES. O Codex monta os formulários na T10.

criarCliente · criarObra · vincularGerente · criarPessoa · criarVinculo ·
criarSemanaPlanejamento · publicarPlanejamento

Regras que a validação precisa fazer valer:
  - Obra: exatamente um Cliente e um endereço. Código derivado das
    INICIAIS do cliente mais sequencial ("Obra 33 - JPS"). Não depende de
    orçamento aprovado. Tipo obra ou pequeno serviço; pequeno serviço não
    tem Diário.
  - Pessoa e Vínculo são SEPARADOS. criarPessoa não cria vínculo.
    CPF único. Apenas um vínculo ativo por vez.
  - vincularGerente: o vínculo tem data de início e fim, nunca é excluído.
  - criarSemanaPlanejamento: nasce em Rascunho, com toda pessoa de campo
    com vínculo ativo na grade. Sem destino definido fica "Em aberto".

Cada função devolve erro descritivo. Nunca erro genérico.
```

---

## T8 · Tela de Indicadores · Codex

```
Arquivos permitidos: src/components/**, src/pages/**
As funções de src/state/indicadores.ts JÁ EXISTEM. Apenas chame.

/indicadores é DASHBOARD: leitura rápida, gráfico, comparação.
/financeiro é operação detalhada. Nenhuma das duas invade o papel da outra.

Responder sem sair da tela: quanto foi gasto por categoria no período,
e qual a margem resultante — por obra e consolidada da empresa.

Nenhum número escrito no componente. Se um indicador exigir cálculo que
não existe, PARE e reporte.
```

**Cuidado.** A falha grave desta tela é número que não bate com o que foi
mostrado nas telas anteriores. Verifique o total da obra contra o Financeiro da
obra e contra o Portal.

---

## T9 · Motor de orçamento · Claude Code

```
Arquivos permitidos: src/state/**

1. catalogo_servicos e categorias_servico. Formas de cálculo da RN-102:
   metro quadrado, metro linear, unidade, diária, ponto, ambiente, valor
   fixo. Catálogo REDUZIDO e representativo, não exaustivo.
   Categorias: demolição, alvenaria, gesso, hidráulica, elétrica,
   porcelanato.

2. Motor de cálculo do orçamento, por Ambiente.

3. Ajuste percentual da RN-104: sobre o orçamento inteiro ou sobre itens
   selecionados, distribuído PROPORCIONALMENTE entre os itens.
   RN-105: o Cliente NUNCA vê que houve percentual. Ele vê o valor final.

4. Estados da RN-106: Rascunho → Finalizado → Aprovado · Recusado.
   Aprovado é imutável. Congela os valores.

5. Aprovar um orçamento alimenta o Checklist da obra. INV-06: o Item de
   Orçamento É a unidade de execução; não existe tabela de checklist.
```

**Cuidado.** Aprovar um adicional altera o denominador do Andamento e faz o
percentual **recuar**. É comportamento correto, e depende da faixa de escopo
ampliado já existente para não parecer defeito.

---

## T10 · Formulários de criação · Codex

```
Arquivos permitidos: src/components/**, src/pages/**
As funções de mutação JÁ EXISTEM em src/state/. Não reimplemente regra
nenhuma na tela. Se faltar validação, PARE e reporte.

1. Criar cliente e criar obra. O botão "Nova obra" existe e não faz nada.
   O código da obra aparece derivado do cliente ANTES de salvar.
   Vincular gerente no mesmo fluxo. Só Administração cria.
   A obra nova abre as sete abas com estado vazio explicado.

2. Criar Pessoa e Vínculo em PASSOS SEPARADOS, e a interface tem que
   deixar visível que são duas coisas. É o que permite um terceirizado
   virar funcionário sem cadastro duplicado. Um subtítulo curto
   explicando isso vale mais que um formulário bonito.

3. Criar e publicar semana de Planejamento.
   Motivos de ausência: Doente, Dispensado, Falta, Folga, Férias,
   Afastado, Obra parada — cada um com a pergunta "recebe o dia?" à
   parte. Motivo e efeito financeiro são independentes.
   Sábado, domingo e noturno OFERECEM adicional, fixo ou percentual,
   e aceitam ficar em branco.
   Alocar pessoa ocupada informa "pessoa indisponível nesta data", SEM
   revelar a outra obra.
```

**Aceite — é a Cena 3 inteira, numa sessão contínua.** Criar cliente → obra →
vincular Rafael → criar pessoa com vínculo → montar semana → publicar → abrir o
diário da obra nova e vê-lo pré-preenchido. Sem sair para tela de administração
de dados, sem erro no console.

---

## T11 · Degrau 8 · Claude Code · `[RISCO ALTO]`

**Uma sub-tarefa por vez, commit próprio, sete fluxos verificados antes e depois
de cada uma.** Não empacote.

| Ordem | O quê | Decisão |
|---|---|---|
| 11.1 | Reembolso a Pessoa como tipo de lançamento | `D3` |
| 11.2 | Regime Salário fixo mensal | `D4` |
| 11.3 | Unificar `custos_obra` e `servicos_terceiros` | `D2` |
| 11.4 | Data de referência como estado mutável | `B09` |

**Cuidado.** As três primeiras mexem no Fechamento. A quarta alimenta Painel,
Planejamento, Diário, Fechamento e Portal ao mesmo tempo — uma tela derivada que
não reage vira número inconsistente no meio da apresentação.

`[OPINIÃO]` Se faltar pouco tempo, **não faça o 11.4.** O ganho é uma ferramenta
de ensaio que o cliente nem deveria ver; o risco é a Cena 9.

---

## T12 · Assistente de orçamento · Codex

```
Arquivos permitidos: src/components/**, src/pages/**
O motor JÁ EXISTE em src/state/. Apenas chame.

1. /orcamentos — listagem com os estados da RN-106, filtrável.
   "Pré-aprovado" não existe: o nome é Finalizado.

2. Assistente em cinco passos:
   1) ambientes da obra e quantidade de cada
   2) metragem de cada ambiente
   3) serviços por categoria
   4) para cada serviço, em quais ambientes ocorre e a quantidade
      (sala com 3 tomadas e 5 luminárias — forma de cálculo "ponto")
   5) ajuste comercial: percentual ou valor fixo sobre o total

3. Duas visualizações, alternáveis sem recarregar, com total IDÊNTICO:
   por ambiente (ambiente → tipo de serviço → serviços) e corrida
   (tipo de serviço, todos os ambientes juntos).
```

**Aceite.** Criar orçamento com três ambientes e seis serviços, aplicar
percentual, aprovar, ver os itens no Checklist · o Cliente nunca vê o percentual
· o Gerente vê o Checklist **sem nenhum valor**.

---

## TF1 · Responsividade · Codex

Só as telas criadas da T4 em diante. As antigas já foram feitas.

Pontos de quebra em 720px e 1024px. Formulário e assistente em coluna única em
tela estreita. **Nenhuma rolagem horizontal de página em 390px.** Tabela
financeira vira um cartão por pessoa em tela estreita, nunca rolagem horizontal.

---

## TF2 · Revisão por perfil · Mestre

A revisão feita até hoje cobriu **apenas Administração**. Faça nesta ordem:

| Ordem | Perfil | Por quê | Telas |
|---|---|---|---|
| 1 | Cliente | Cena 8, o melhor momento, e o único perfil que a TECTO mostra aos clientes dela | 3 |
| 2 | Gerente de Obras | Cenas 5 e 6, e é onde a permissão aparece | ~8 |
| 3 | Financeiro | Cena 7 | ~6 |

Tela a tela, anotando. Depois despache as correções em uma tarefa só, para o
Codex.

---

## TF3 · Ensaio e congelamento · Mestre

O roteiro de `docs/ROTEIRO.md` inteiro, **duas vezes, cronometrado**. Corrija só
o que quebrar.

Depois do segundo ensaio, **congele**. Nenhuma alteração, por melhor que pareça.
Bug introduzido na véspera não tem tempo de ser descoberto.

`[OPINIÃO]` O maior risco da reunião não é a tela quebrar. É você perder o fio da
narrativa procurando onde clicar. Ensaio resolve isso, e nada mais resolve.

---

# 6. Cuidados que valem para toda tarefa

| Situação | O que fazer |
|---|---|
| A tarefa toca `src/state/fechamento.ts`, estorno, rateio, adiantamento ou visibilidade do Cliente | Modelo mais forte, leitura linha a linha, teste obrigatório, raciocínio no relatório |
| A tarefa exigiria mover ou renomear arquivo | **Pare.** Renomeação numa branch contra alteração na outra é o pior conflito de merge. Faça no `master`, sozinho |
| A tarefa exigiria tocar arquivo do outro agente | Pare e reporte. Nunca "só um ajustezinho" |
| O agente pediu decisão | Procure em `docs/DECISOES.md`, depois em `docs/ABERTO.md`. Se não estiver em nenhum, a decisão é sua — e vai para o `DECISOES.md` antes de a sessão acabar |
| O aceite falhou num item | Reverta **aquele commit**, não a tarefa. É para isso que serve o commit por item |
| O relatório trouxe achado fora do escopo | Não mande corrigir agora. Anote no `docs/ESTADO_DO_PROTOTIPO.md` §achados e trate como tarefa própria |
| A sessão acabou no meio | Confira o último commit, confira `git status`, e retome do item seguinte. Nunca reexecute um item já commitado |

---

# 7. Merge

```bash
git checkout master
git pull
git merge agente/code      # sempre o Code primeiro: estado antes de tela
git merge agente/codex
npm run build
git push
```

**Code primeiro, sempre.** Se houver conflito, você quer resolver com o estado
já em pé.

**Onde o conflito vai aparecer:** `docs/ESTADO_DO_PROTOTIPO.md`, porque os dois escrevem nele.
Resolva mantendo as duas listas. Conflito em `src/` significa que alguém saiu do
território dele — investigue antes de resolver, porque isso é sintoma, não
acidente.

Depois do merge, antes de despachar a rodada seguinte:

```bash
git branch -f agente/code master
git branch -f agente/codex master
```

---

# 8. Teste de fumaça

Dois minutos, depois de todo merge. Não é o checklist de homologação — é o
mínimo que prova que nada essencial quebrou.

1. Entrar como **Pedro Almeida** → cai em `/`
2. Painel → a lista de pendências tem conteúdo
3. Planejamento → a grade abre com a semana publicada
4. Obra 22 → Diário → chega **pré-preenchido**
5. Remover uma pessoa planejada → a folha de divergência abre
6. Confirmar → finalizar o diário
7. Voltar ao Painel → **a lista de pendências mudou sozinha**
8. Trocar para **Mariana Costa Lima** → cai em `/portal` → o diário recém-
   finalizado aparece
9. Trocar para **Rafael Duarte** → `/financeiro` bloqueia com `SemAcesso`

Se o passo 7 falhar, a corrente de dados quebrou — isso é grave e para tudo. Se o
8 falhar, você perdeu o momento mais forte da demonstração. Se o 9 falhar, a
história de permissão que você vai contar não se sustenta.

---

# 9. Quando parar de subir a escada

Pare de subir e vá para a rodada F quando qualquer uma destas for verdade:

- Falta um terço do tempo disponível para a reunião.
- Duas tarefas seguidas custaram mais que o previsto.
- O teste de fumaça falhou duas vezes seguidas depois de merges diferentes.

`[REGRA]` O protótipo tem que estar demonstrável ao fim de toda rodada. Parar
entre rodadas é sempre seguro. Parar no meio de uma nunca é — e é por isso que a
rodada F existe como reserva, não como sobra.
