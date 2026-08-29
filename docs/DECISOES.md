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

### `[TÉCNICA]` · O estorno devolve o que foi PAGO, não o valor do lançamento
**Decisão:** o crédito de um estorno é a soma das parcelas `paga` do lançamento
original. As parcelas `pendente` passam a `estornada` e deixam de ser cobradas.
**Por quê:** anular um lançamento é colocar a pessoa de volta onde ela estava.
Um empréstimo de R$1.200,00 com duas parcelas pagas tirou R$600,00 dela — é isso
que ela tem a receber, não os R$1.200,00 que nunca saíram inteiros.

### `[TÉCNICA]` · `estornada` é transição de estado, não `UPDATE` destrutivo
**Decisão:** `Parcela.situacao` ganhou o valor `estornada`.
**Por quê:** o `INV-08` proíbe `UPDATE` destrutivo em registro financeiro.
Marcar a parcela não destrói nada — número e valor continuam intactos, a linha
continua no extrato. É do mesmo tipo que `pendente → paga`. Apagar a linha é que
seria destrutivo.

### `[TÉCNICA]` · Crédito de estorno tem campo próprio, não desconto negativo
**Decisão:** o extrato do Fechamento ganhou `creditos_centavos`, separado de
`descontos_centavos`. `a_pagar = max(0, bruto + creditos − descontos)`.
**Por quê:** crédito e desconto andam em sentidos opostos. Valor negativo em
campo de desconto é como se erra a conta sem perceber.

### `[SÓ PROTÓTIPO]` · Parcela de contrato de terceirizado sem gatilho
**Decisão:** `ParcelaContrato` tem `numero`, `valor_centavos` e `situacao`, e
**não** tem `vencimento` nem `etapa`/`confirmado_por`.
**Por quê:** a `Q-005` pergunta se a cobrança é por data fixa ou por etapa
concluída, e quem confirma a etapa. Qualquer um dos dois campos afirmaria a
resposta. É a saída 2 do `docs/ABERTO.md` §1 — a estrutura sem a regra.
**Vigilância:** quando a `Q-005` for respondida, o campo que faltar entra aqui.

### `[TÉCNICA]` · O pseudo-ambiente "Obra inteira" não existe em `ambientes`
**Decisão:** serviço de terceiro sem ambiente único fica com `ambiente_id`
ausente, e a agregação do Andamento o rotula "Obra inteira".
**Por quê:** criar a linha em `ambientes` faria o Checklist e o Andamento TECTO
exibirem um ambiente vazio, em telas que pertencem ao outro agente. Pseudo
quer dizer que não é um ambiente de verdade.

### `[TÉCNICA]` · O total do Andamento sai do conjunto, não da soma das fatias
**Decisão:** `pct_total` é calculado sobre todos os registros da obra.
**Por quê:** somar ou mediar fatias arredondadas dá um número ligeiramente
diferente, e é o total que precisa bater com o do Portal.

---

### `[SÓ PROTÓTIPO]` · Notificação é endereçada por perfil · responde `Q-027`
**Decisão:** `Notificacao` tem `destinatario_perfis` e `lida_por`, ambos listas
de perfil. A central de notificações existe, e cada perfil vê e marca só o que
é dele.
**Por quê:** a `Q-027` perguntava quem recebe o quê. Com um `lida` booleano, o
Pedro abrir o painel zeraria o contador do Rafael, que nunca viu o aviso.
**Vigilância:** no sistema real o destinatário é o **Usuário**, não o perfil,
porque é o Usuário que tem credencial (`INV-01`). A maquete tem um Usuário por
perfil, e modelar por Usuário aqui só acrescentaria indireção. **Confirmar com
Pedro antes de virar `RN`.**
**Invalida:** o campo `lida` de `Notificacao`.

### `[SÓ PROTÓTIPO]` · O Cliente ainda não é uma Pessoa
**Decisão:** a camada `Usuario` do `INV-01` passou a existir. Para os três
perfis internos ela aponta para uma `Pessoa`; para o Cliente aponta para a
`Obra`.
**Por quê:** o glossário define Usuário como "credencial ligada a uma Pessoa",
o que faz do Cliente uma Pessoa. Mas `Obra.cliente` é um nome em texto, e
acrescentar os cinco clientes a `pessoas` faria o Painel exibir "38 com vínculo
ativo" quando só 33 têm vínculo — numa tela que pertence ao outro agente.
**Pendência:** transformar o Cliente em Pessoa, com `Obra.cliente_pessoa_id`, e
corrigir a contagem do Painel. É uma tarefa só, e das duas pontas.

### `[TÉCNICA]` · Mídia com ambiente é a fonte quando existe
**Decisão:** `finalizarDiario` aceita `midias` com ambiente; quando vem,
`Diario.fotos` é derivada dela e os registros de `midias` são criados junto.
**Por quê:** as duas representações da mesma foto não podem contar histórias
diferentes. Enquanto as telas lerem `Diario.fotos`, ela continua existindo — mas
deixa de ser escrita à mão.

### `[TÉCNICA]` · Nota fiscal não é `Documento`
**Decisão:** `Documento` cobre projeto e contrato. A nota continua em
`custos_obra`, pelo `tipo_documento_id`.
**Por quê:** a nota é sempre a nota **de** alguma coisa. Separá-la do custo
criaria duas verdades sobre o mesmo papel — e a `RN-133b` foi escrita assim.

---

### `[SÓ PROTÓTIPO]` · O custo da empresa por dia existe, em dois campos
**Decisão:** `Vinculo.custo_empresa_diaria_centavos` é o cadastro;
`Diaria.custo_empresa_centavos` é o valor **congelado no fato**. Os Indicadores
leem o congelado.
**Por quê:** é o segundo campo do "padrão de dois campos" que a decisão sobre
encargos já previa e que nunca tinha sido construído. São dois porque o `INV-03`
manda congelar: com o custo só no cadastro, mudar a folha hoje reescreveria a
margem do mês passado.
**Vigilância:** os valores semeados são **plausíveis, não reais**. Vieram de
mim, não da contabilidade. **Confirmar a tabela com Pedro antes da
demonstração** — é um número que ele vai reconhecer como certo ou errado na
hora.

### `[TÉCNICA]` · Receita é devolvida nas duas bases · `Q-033`
**Decisão:** os Indicadores devolvem `receita_contratada` e `receita_recebida`,
e a margem calculada sobre as duas. Nenhuma é eleita.
**Por quê:** a `Q-033` pergunta se receita é o contratado ou o recebido, e
continua aberta. Em agosto as duas bases dão R$48.260,00 e R$11.900,00 — a
diferença é grande demais para ser escolhida por conveniência de implementação.
**Consequência:** a tela da T8 é obrigada a rotular qual base está exibindo.

### `[TÉCNICA]` · Só "repassado com margem" entra na margem da obra
**Decisão:** reembolsável e direto do Cliente não movem a margem.
**Por quê:** reembolsável entra e sai — a TECTO paga e o Cliente devolve o mesmo
valor; contar o custo sem contar a devolução afundaria a margem sem motivo. Em
direto do Cliente a TECTO não desembolsa nada. É a mesma regra já aplicada em
`margemDaObra`, agora com recorte de período.

---

### `[TÉCNICA]` · O tipo do lançamento é derivado, não escolhido · `RN-094`
**Decisão:** `criarLancamento` é uma função só. Uma parcela produz
`adiantamento`; mais de uma produz `emprestimo`.
**Por quê:** a `RN-094` diz que são a mesma entidade diferenciada pelo número de
parcelas. Oferecer os dois numa lista deixaria criar um "adiantamento em quatro
parcelas", que não existe.
**Sem limite de valor:** a `Q-007` continua aberta, e impor um teto seria
respondê-la.

### `[TÉCNICA]` · O recorte do Planejamento sai do tipo do vínculo
**Decisão:** entram na grade todos os vínculos ativos, exceto `administracao` e
`financeiro`. Terceirizado **continua entrando**.
**Por quê:** a `RN-052` diz "toda Pessoa com Vínculo ativo", o que ao pé da letra
poria Pedro e Fernanda na escala. É a lacuna 2 do `docs/ABERTO.md` §7, que a
`RN-004` agora permite resolver pelo tipo em vez da lista de ids escrita à mão
que existia. Tirar o terceirizado seria responder a `Q-006`, aberta — então o
comportamento atual é preservado.

### `[TÉCNICA]` · O resto da divisão vai na primeira parcela
**Decisão:** ao parcelar, `valor − base × n` é somado à parcela 1.
**Por quê:** a soma das parcelas tem de fechar exatamente com o total. Centavo
perdido em arredondamento é dinheiro que não existe em lugar nenhum, e o
`INV-10` existe para impedir exatamente esse tipo de perda.

---

## Aguardando registro

Itens decididos em conversa e ainda não escritos aqui em formato completo. Quem
encostar neles, complete o registro.

- Comportamento do Checklist quando um Orçamento Adicional é aprovado (`A12`)
- Destino do harness de SSR criado durante o P0.5: manter como script
  documentado ou remover
- ~~Nome fixo "Mariana Costa Lima" dentro do `PortalLayout`~~ — **destravado**. A
  camada `Usuario` e `nomeDoUsuarioAtivo` existem; a remoção em si é do Codex
- **`docs/DECISOES.md` não está na tabela de precedência do `AGENTS.md` §2.**
  Pela letra do contrato, uma `RN` vence uma decisão registrada aqui — mesmo
  quando a decisão declara invalidá-la, como a `D1` fazia com a `RN-125`. Ou
  este arquivo entra na tabela, ou toda decisão `[PRODUTO]` precisa ser
  transcrita para o `PRODUTO.md` antes de valer.
