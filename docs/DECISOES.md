# TECTO — Registro de decisões

> Sessões diferentes tomam decisões diferentes para o mesmo problema. Em três
> meses isso vira duas formas de fazer a mesma coisa.
>
> **Este arquivo existe para que uma decisão seja tomada uma vez.** Toda decisão
> tomada em qualquer sessão é registrada aqui **antes de a sessão terminar**.
> Decisão não registrada volta a ser discutida, com resposta diferente.

---

## Como usar

**Antes de decidir qualquer coisa:** procure aqui. Depois em `docs/ABERTO.md`. Se
não estiver em nenhum dos dois, **pare e pergunte**.

**Ao registrar**, use o formato abaixo. A marca importa mais que o texto:

| Marca | Significado |
|---|---|
| `[PRODUTO]` | Vale para o sistema real. Deve virar `RN` ou `INV` em `docs/PRODUTO.md`. |
| `[SÓ PROTÓTIPO]` | Vale só para a maquete. **Nunca** entra em `docs/PRODUTO.md` sem passar por Pedro e Fernando. |
| `[PENDENTE PO]` | Implementado no protótipo, aguardando confirmação do dono do produto. |
| `[TÉCNICA]` | Decisão de implementação, sem efeito sobre regra de negócio. |
| `[PROCESSO]` | Como trabalhamos, não o que construímos. |

```
### <data> · <marca> · <título curto>
**Decisão:** o que ficou decidido, em uma frase.
**Por quê:** o motivo, não a justificativa.
**Invalida:** o que deixa de valer, se algo deixar.
```

A distinção entre `[PRODUTO]` e `[SÓ PROTÓTIPO]` é a mais importante do arquivo.
O protótipo é feito na correria, com liberdade para escolher o que demonstra
melhor. Registrar essas escolhas como regra de produto criaria regra por
conveniência de tela — exatamente o que o Documento Canônico existe para evitar.

---

## Decisões vigentes

### `[PRODUTO]` · Andamento Geral ganha dois eixos · D1
**Decisão:** o Andamento Geral passa a ter Especialidade **e** Ambiente
simultaneamente, derivados do mesmo conjunto de registros. Três percentuais de um
conjunto só.
**Por quê:** é como a obra acontece. O marceneiro entrega a marcenaria inteira,
não "a marcenaria da suíte".
**Invalida:** a `RN-125`, que definia o Andamento Geral como organizado apenas
por Ambiente.
**Restrição:** a especialidade é atributo do serviço de terceiro. Não pode criar
uma segunda tabela espelhando o checklist — isso violaria `INV-06`.
**Transcrita:** a `RN-125` de `docs/PRODUTO.md` foi reescrita para refletir esta
decisão, e ganhou a `RN-125b` com a restrição acima. Até essa transcrição, as
duas fontes diziam coisas opostas sobre o mesmo assunto.

### `[PRODUTO]` · Serviço de terceiro e custo são o mesmo registro · D2
**Decisão:** um serviço de terceiro **é** um custo com modalidade financeira; a
situação de execução é campo desse mesmo registro. Fim da duplicidade entre
`custos_obra` e `servicos_terceiros`.
**Por quê:** hoje o mesmo eletricista existe nas duas entidades e os dois blocos
podem discordar na tela.
**Gera:** `RN-134`.
**Não implementado ainda** — está no degrau 8 do sprint, por risco.

### `[PRODUTO]` · Reembolso a Pessoa é tipo novo de lançamento · D3
**Decisão:** quando um funcionário compra material para a obra, a TECTO reembolsa
**a pessoa** e depois cobra do cliente. É modalidade nova, não variação da
existente, e entra no ciclo de pagamento da pessoa com sinal positivo.
**Por quê:** introduz a Pessoa como credora da empresa, o que a `RN-131` não
previa.
**Gera:** `RN-097` a `RN-099`.
**Vigilância:** reembolso lançado depois do fechamento do ciclo **não pode**
alterar o ciclo fechado (`INV-07`). Vai para o seguinte, ou vira estorno.
**Não implementado ainda** — degrau 8.

### `[PRODUTO]` · Regime de Salário fixo mensal · D4
**Decisão:** pessoal de marketing e administrativo é funcionário pleno, com
regime novo chamado **Salário fixo mensal**. O custo vai para despesa da empresa,
nunca para custo de obra.
**Por quê:** a tabela da `RN-004` não contemplava o caso.
**Gera:** `RN-008`, `RN-009b`, `RN-143`.
**Consequência estrutural:** o destino do custo de um Fechamento passa a ser
polimórfico — Obra **ou** Empresa. O cálculo do regime de Salário **não
compartilha código** com o de Diária: duas funções irmãs, despacho pelo Vínculo.
**Não implementado ainda** — degrau 8.

### `[PRODUTO]` · O sistema não calcula encargos nem descontos
**Decisão:** registra-se apenas o **valor líquido acordado**. Nenhum cálculo de
imposto, encargo ou dedução.
**Por quê:** está fora do escopo contratado, e fingir que calcula é pior que não
calcular.
**Consequência que exige atenção:** para funcionário com vínculo formal, o custo
real para a empresa excede o líquido registrado. Sem correção, o módulo de
Indicadores superestima a margem em silêncio.
**Padrão de dois campos:** o valor líquido acordado vive no Vínculo e alimenta o
Fechamento; o custo para a empresa é lançado manualmente, vindo da contabilidade
externa, e alimenta os Indicadores. **Um nunca é derivado do outro.**
**Onde:** `docs/PRODUTO.md` §11.2.

---

### `[SÓ PROTÓTIPO]` · O elenco de campo tem 23 pessoas, não 21
**Decisão:** o seed traz as **23** pessoas de campo listadas no `AGENTS.md` §6.
**Por quê:** o prompt da P1A fala em "21 pessoas de campo" e a lista do
`AGENTS.md` tem 23 nomes. O `AGENTS.md` vence por precedência, e ele mesmo diz
que prevalece onde houver cópia.
**Invalida:** o número 21 no `docs/SPRINT.md` §6.

### `[SÓ PROTÓTIPO]` · Função das 9 pessoas que o elenco não classifica
**Decisão:** Erasmo Peixoto, Nazareno Correia → Pedreiro · Osmar Cavalcante,
Anísio Trindade → Azulejista · Osvaldo Ramalho → Pintor · Belarmino Souza,
Deusdete Farias, Anselmo Freitas, Wanderley Prazeres → Ajudante.
**Por quê:** `Pessoa.funcao` é campo obrigatório e essas 9 pessoas aparecem no
`AGENTS.md` §6 sem o rótulo entre parênteses que as outras têm. Sem função elas
não podem ser semeadas.
**Vigilância:** é conveniência de seed, não informação vinda do cliente. A
lacuna 1 do `docs/ABERTO.md` §7 continua aberta — nenhuma `RN` cria o campo
função. **Confirmar com Fernando antes de virar regra.**

### `[SÓ PROTÓTIPO]` · Obra 25 - ATB passa a "em andamento"
**Decisão:** a Obra 25 deixa de ser `pausada` e passa a `em_andamento`.
**Por quê:** o item 3.4 pede que a falta de diário dela vire pendência no
Painel, e `calcularPendencias` só deriva "diário faltando" para obra em
andamento. Pausada, a obra nunca geraria a pendência que a cena precisa.

### `[SÓ PROTÓTIPO]` · Ana Carvalho não é gerente de obra
**Decisão:** a gerência da Obra 25 passa para Rafael Duarte; Ana fica como
assistente, que é o papel dela.
**Por quê:** o seed anterior a punha como `gerente`, e o elenco fixo a define
como Assistente de Gerenciamento. Duas fontes divergindo sobre a mesma pessoa.

## Decisões que ficam só no protótipo

Estas **não** entram em `docs/PRODUTO.md`. Vão à pauta com Pedro e Fernando.

| `[SÓ PROTÓTIPO]` | Decisão |
|---|---|
| Andamento TECTO | Contagem simples de itens, sem ponderação por valor |
| Andamento Geral | Mesma contagem simples, por coerência |
| Escopo TECTO no Andamento Geral | Entra como uma Especialidade chamada "TECTO", cujo percentual é o Andamento TECTO — assim a soma da obra fecha em 100% |
| Serviço sem ambiente único | Pseudo-ambiente "Obra inteira" |
| Efeito do adicional | Adicional aprovado faz o percentual recuar; a faixa de escopo ampliado explica, para não parecer defeito |
| Período trabalhado | Enum fechado: dia todo · manhã · tarde. Sem efeito financeiro |
| Publicação do Planejamento | Administração publica; Gerente ajusta durante a semana |
| Versionamento do Planejamento | Publicação única, alterações registradas por cima |
| Planejamento do Gerente | Vê apenas as obras dele, mais as pessoas "Em aberto" |
| Conflito de alocação | "Pessoa indisponível nesta data", sem revelar a obra |
| Presença no Diário | Gerente registra qualquer pessoa — o fato prevalece sobre a projeção |
| Decisão de pagamento | Gerente informa a ausência; Administração decide se paga |
| Rateio de diária | Sem rateio proporcional; a outra obra fica com custo zero |
| Saldo devedor | Pagamento nunca negativo; o saldo rola para o ciclo seguinte |
| Bloqueio do Fechamento | Pendência aberta impede executar o fechamento |
| Nomenclatura no Portal | "Direto do fornecedor" em vez de "Direto do Cliente" |
| Cor por tipo de vínculo (`D5`) | Cinco chips diferenciados por tratamento antes de matiz: sólido escuro, vazado, violeta suave, cinza claro, terracota |
| Avatares | Ilustrados e determinísticos, gerados por código. **Nunca fotografia de pessoa real** — o protótipo será publicado num link |

---

## Decisões técnicas e de processo

### `[PROCESSO]` · Push após cada commit, nunca para master
**Decisão:** todo agente empurra a própria branch depois de cada commit. O merge
em `master` é do Mestre, depois de olhar o diff.
**Por quê:** sete commits foram perdidos por existirem em um disco só. Commit
local não é backup.

### `[PROCESSO]` · Documentação mora no repositório
**Decisão:** produto, backlog, roteiro, estado e decisões vivem em `docs/`. A
conversa com um assistente externo deixa de ser canal obrigatório.
**Por quê:** um fato que existe só numa conversa não sobrevive à conversa.

### `[TÉCNICA]` · Guarda de permissão em camada única
**Decisão:** a permissão vive só na declaração `handle.perfis`, verificada por
`GuardaPerfil`. `AppLayout` e `PortalLayout` não checam perfil.
**Por quê:** duas camadas checando a mesma coisa criam uma que nunca roda. Já
custou um bug neste repositório.
**Complemento:** autenticação e permissão são coisas separadas dentro do
`GuardaPerfil` — visitante não logado vai para `/entrar`, não para `SemAcesso`.

### `[TÉCNICA]` · `INV-09` não se aplica ao protótipo
**Decisão:** `tenant_id` **não** é implementado na maquete.
**Por quê:** uma empresa só, e um campo constante em todo registro não ensinaria
nada. No schema real ele é obrigatório desde a primeira migration.

### `[SÓ PROTÓTIPO]` · Módulos fora do sprint
**Decisão:** Orçamento, reembolso a Pessoa, salário fixo, unificação
`custos_obra`/`servicos_terceiros` e data de referência mutável ficam nos degraus
7 e 8 do `docs/SPRINT.md`.
**Por quê:** os quatro últimos mexem no Fechamento, onde o erro não aparece na
tela. Nenhuma cena do roteiro depende deles. O Orçamento é o maior item do
roadmap e a cena que ele sustenta sempre foi condicional.
**Não é corte.** É fila. Se a escada chegar lá, entram.

---

### `[TÉCNICA]` · Data gravada é a do protótipo, não a do relógio
**Decisão:** toda mutação do store grava `agoraNoPrototipo()` — data sempre
`HOJE`, a data de referência da maquete, e só a hora vem do relógio.
**Por quê:** `new Date().toISOString()` fazia um diário de 20/08/2026 exibir
"finalizado em 28/08" — a data real da máquina. Quebrava o invariante de data
coerente do `AGENTS.md` §4 e §6, e quebrava no fim da Cena 6.

### `[TÉCNICA]` · `Fechamento.total_centavos` guarda o valor LÍQUIDO
**Decisão:** o campo é o valor **a pagar**, depois dos descontos e com piso em
zero — o mesmo que `executarFechamento` grava.
**Por quê:** semeado como bruto, o Painel dizia R$7.740,00 e a tela de
Fechamento dizia R$6.680,00 para a mesma semana. Um campo, um significado.

### `[TÉCNICA]` · O ciclo `por obra` é derivado e não entra no enum
**Decisão:** `Fechamento.ciclo` continua com três valores. O ciclo `por_obra` é
derivado dos vínculos de terceirizado, não tem período, e `executarFechamento`
recusa fechá-lo.
**Por quê:** um quarto valor no enum deixaria o rótulo do Painel sem tradução.
E a periodicidade do pagamento por Obra é `Q-001` a `Q-003`, em aberto: a aba
mostra a forma sem afirmar a regra, como manda a saída 2 do `ABERTO.md` §1.

### `[TÉCNICA]` · Diário travado por UMA pessoa fechada, não por todas
**Decisão:** `diarioEstaFechado` é verdadeiro quando qualquer pessoa do diário
está em período fechado.
**Por quê:** `finalizarDiario` apaga e regrava presenças e diárias de todo mundo
do diário. Editar um diário com uma só pessoa já fechada reescreveria o
pagamento dela. Nenhuma função de imutabilidade recebe perfil — a trava vale
para a Administração.

### `[TÉCNICA]` · Parcela amortizada em parte é PARTIDA em duas
**Decisão:** quando o ganho do ciclo cobre só parte de uma parcela, ela vira
duas: a fatia paga fica no ciclo, o restante vira parcela nova no ciclo
seguinte.
**Por quê:** reduzir o valor da parcela original apagaria quanto foi amortizado
e quando. Isto é dinheiro; o rastro importa mais que a economia de um registro.

### `[TÉCNICA]` · Notificação guarda título e descrição congelados
**Decisão:** `Notificacao` grava o texto no momento do evento, em vez de
derivá-lo na leitura.
**Por quê:** notificação é registro de fato passado. Texto derivado mudaria
junto com o dado de origem, e a notificação passaria a descrever algo que não
aconteceu.

### `[PROCESSO]` · Testes existem, runner não
**Decisão:** os testes do Fechamento vivem em `src/state/fechamento.testes.ts`,
sem framework, e são executados compilando com `tsc` para fora da árvore.
**Por quê:** instalar um runner toca `package.json`, que estava fora dos
arquivos permitidos da P1A. **Transformar isso num `npm test` é tarefa própria e
precisa de autorização para mexer no `package.json`.**

---

### `[TÉCNICA]` · A gestão tem vínculo, com o tipo da `RN-004`
**Decisão:** `Vinculo.tipo` passa a ter os seis valores da tabela da `RN-004`, e
Pedro, Fernando, Fernanda, Rafael, Sofia e Ana passam a ter vínculo.
**Por quê:** a P1A deixou a gestão sem vínculo alegando que o regime era
pergunta aberta. A `RN-004` decide o **tipo** de cada um; o que segue aberto é o
**valor** — `Q-001` a `Q-003` para o Gerente e `Q-004` para o Assistente.
**Consequência:** o Gerente de Obras entra no ciclo `por_obra` do Fechamento,
com `valor_obra_centavos` vazio e a coluna exibindo "a definir". Um número ali
afirmaria que o valor não varia com duração nem porte, que é exatamente o que a
`Q-001` pergunta.
**Invalida:** o comentário do seed que dizia que a gestão não teria vínculo.

### `[TÉCNICA]` · A fronteira do Cliente é um tipo, não uma convenção
**Decisão:** `custosVisiveisAoCliente` devolve um tipo que **não tem**
`custo_centavos` nem margem, e vive em `src/state/visibilidade.ts`, sem
dependência do store.
**Por quê:** a `RN-136` proíbe o Cliente de ver custo e margem. Deixar o campo
no objeto contando que a tela não vá exibi-lo é exatamente como o vazamento
acontece — e o Portal é a tela que a TECTO mostra aos clientes dela.

### `[TÉCNICA]` · Só "repassado com margem" gera margem
**Decisão:** `margemDaObra` considera apenas a modalidade `repassado_com_margem`.
**Por quê:** reembolsável devolve o mesmo valor, e em "direto do Cliente" a TECTO
não desembolsa nada — somar `cobrado − custo` ali conta a nota inteira como
lucro. O defeito existiu: a Obra 22 aparecia com R$57.200,00 de margem em vez de
R$2.800,00. Foi um teste que pegou.

---

## Aguardando registro

Itens decididos em conversa e ainda não escritos aqui em formato completo. Quem
encostar neles, complete o registro.

- Comportamento do Checklist quando um Orçamento Adicional é aprovado (`A12`)
- Destino do harness de SSR criado durante o P0.5: manter como script
  documentado ou remover
- Nome fixo "Mariana Costa Lima" dentro do `PortalLayout` — viola a regra de nada
  escrito no código; precisa sair
- **`docs/DECISOES.md` não está na tabela de precedência do `AGENTS.md` §2.**
  Pela letra do contrato, uma `RN` vence uma decisão registrada aqui — mesmo
  quando a decisão declara invalidá-la, como a `D1` fazia com a `RN-125`. Ou
  este arquivo entra na tabela, ou toda decisão `[PRODUTO]` precisa ser
  transcrita para o `PRODUTO.md` antes de valer.
