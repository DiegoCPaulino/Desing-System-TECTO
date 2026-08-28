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

## Aguardando registro

Itens decididos em conversa e ainda não escritos aqui em formato completo. Quem
encostar neles, complete o registro.

- Comportamento do Checklist quando um Orçamento Adicional é aprovado (`A12`)
- Destino do harness de SSR criado durante o P0.5: manter como script
  documentado ou remover
- Nome fixo "Mariana Costa Lima" dentro do `PortalLayout` — viola a regra de nada
  escrito no código; precisa sair
