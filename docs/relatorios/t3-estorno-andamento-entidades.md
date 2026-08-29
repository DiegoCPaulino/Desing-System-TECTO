# Relatório — T3 · Estorno, Andamento por especialidade e entidades

Branch `agente/code`. Três itens, três commits, todos empurrados.

## Commits

| hash | item | arquivos tocados |
|---|---|---|
| `64bb2f1` | 1 — `estornarLancamento` | `estorno.ts`, `estorno.testes.ts`, `fechamento.ts`, `types.ts`, `store.ts` |
| `af001b0` | 3 — entidades aditivas | `types.ts`, `dados-iniciais.ts` |
| `9cefa1e` | 2 — Andamento Geral | `andamento.ts`, `andamento.testes.ts`, `dados-iniciais.ts` |

**Executei o item 3 antes do item 2.** O Andamento Geral depende de
`servicos_terceiros`, que é criada no item 3 — sem ela, o eixo Especialidade não
teria de onde sair. A ordem do prompt não era executável.

**65 testes, 0 falhas.** `tsc --noEmit` limpo, `npm run build` passa.

---

## Item 1 — `estornarLancamento`

### As fontes

Este item ganhou fundamento que a T1 não tinha, porque o `PRODUTO.md` chegou:

- **Glossário** — "Estorno: registro que anula um lançamento anterior. Substitui
  a exclusão em qualquer contexto financeiro."
- **`INV-08`** — "Toda correção financeira é Estorno seguido de novo lançamento.
  Nunca `UPDATE` destrutivo em registro financeiro."
- **`RN-073`** — "Diário finalizado cujo Ciclo de pagamento das Pessoas
  envolvidas já foi fechado não pode ser alterado nem pela Administração. **A
  correção se faz por Estorno no ciclo seguinte.**"

### O raciocínio do cálculo

Anular um lançamento é colocar a pessoa de volta onde ela estava antes dele.
Isso tem **duas metades**, e errar qualquer uma produz número errado em silêncio.

**Primeira: o que já foi descontado volta.** O crédito é a soma das parcelas com
situação `paga` — o dinheiro que de fato saiu do bolso da pessoa. **Não é o
valor do lançamento.** O empréstimo do Marcos é de R$1.200,00 em quatro parcelas
de R$300,00; com duas pagas, tirou R$600,00 dele, e é R$600,00 que ele tem a
receber. Creditar R$1.200,00 daria à pessoa dinheiro que ela nunca pagou.

**Segunda: o que ainda seria descontado para de ser.** As parcelas `pendente`
passam a `estornada`. Sem isso, o estorno devolveria R$600,00 e continuaria
cobrando os R$600,00 restantes — a pessoa acabaria no mesmo lugar, e o estorno
não teria servido para nada.

Se nada foi pago, o crédito é zero e o estorno só cancela o futuro. O registro
existe do mesmo jeito, porque a decisão de anular é um fato e precisa de rastro.

### Onde o crédito entra no Fechamento

Em campo próprio, `creditos_centavos`, e **não** como desconto negativo:

```
a_pagar      = max(0, bruto + creditos − descontos)
saldo_a_rolar = max(0, descontos − bruto − creditos)
```

Crédito e desconto andam em sentidos opostos. Valor negativo num campo chamado
"desconto" é como se erra a conta sem perceber. O crédito também soma ao que
está disponível para amortizar dívida na execução do fechamento — é dinheiro que
a pessoa tem a receber, então serve para abater o que ela deve.

### `estornada` não viola o `INV-08`

O invariante proíbe `UPDATE` **destrutivo**. Marcar uma parcela como estornada
não destrói nada: número e valor continuam intactos e a linha continua no
extrato do lançamento. É transição de estado, do mesmo tipo que `pendente →
paga`. Apagar a linha é que seria destrutivo — e há teste conferindo que as
quatro parcelas do empréstimo continuam existindo depois do estorno.

### O ciclo de destino

O crédito cai no primeiro ciclo **aberto** que termina depois da última
cobrança. Se não houver nenhum registrado, o próximo é projetado pela
periodicidade do vínculo. O estorno nunca fica sem destino — sem destino
significaria dinheiro devido a alguém e não cobrado de ninguém.

### Os três testes obrigatórios

| Caso | Como foi verificado |
|---|---|
| Estorno em ciclo fechado | Fecho o ciclo semanal, estorno o empréstimo do Marcos, e comparo os `Fechamento` do período e as parcelas já pagas **byte a byte** antes e depois. Nada se moveu |
| Estorno duplo | O segundo estorno é recusado, e o erro cita a data e o motivo do primeiro. Estornar um estorno também é recusado, com a explicação do `INV-08` |
| Saldo do ciclo seguinte | O crédito de R$600,00 vira parcela pendente com `ciclo_periodo_fim` em 29/08 — depois do ciclo que fechou em 22/08. A dívida do Marcos vai de R$600,00 a zero, porque as duas pendentes foram canceladas |

---

## Item 3 — Entidades aditivas

**`custos_obra` já existia.** Foi criada no ajuste da `RN-135`, depois que o
`PRODUTO.md` chegou. Este item cobriu as três restantes.

| Entidade | Registros | Nota |
|---|---:|---|
| `servicos_terceiros` | 20 | matéria-prima do eixo Especialidade |
| `despesas_empresa` | 8 | `RN-140`, três categorias |
| `contratos_terceirizado` | 4 | por Obra, como o prompt fixa |
| `parcelas_contrato` | 8 | **sem gatilho de cobrança** — ver abaixo |

**A `Q-005` continua aberta**, e por isso `ParcelaContrato` tem `numero`,
`valor_centavos` e `situacao`, e **não tem** `vencimento` nem
`etapa`/`confirmado_por`. A pergunta é se a parcela vence por data fixa ou por
etapa concluída, e quem confirma a etapa; qualquer um dos dois campos afirmaria
a resposta. É a saída 2 do `docs/ABERTO.md` §1 — a estrutura sem a regra —, a
mesma forma já usada na aba "Por obra" do Fechamento. Registrado no
`DECISOES.md`; quando a `Q-005` for respondida, entra o campo que faltar.

**Não unifiquei `custos_obra` e `servicos_terceiros`.** A decisão `D2` existe e
está no degrau 8. As duas coexistem de propósito, e o comentário do tipo
`ServicoTerceiro` registra a duplicidade para quem chegar depois — o mesmo
eletricista aparece nas duas.

---

## Item 2 — Andamento Geral com dois eixos

### Um conjunto, três recortes

`montarRegistros` produz **uma lista**, em memória, a partir de duas coleções
que já existem: `itens_orcamento` — que **é** o Checklist (`INV-06`) — e
`servicos_terceiros`, que já carrega especialidade e ambiente. Os três
percentuais são três `group by` sobre essa mesma lista.

Isso é literal, não retórico: `calcularAndamentoGeral` chama `montarRegistros`
uma vez e agrupa o mesmo array duas vezes. Se os eixos saíssem de fontes
diferentes poderiam discordar entre si, e é exatamente isso que a `RN-125b`
proíbe. Há teste conferindo, nas cinco obras, que os dois eixos somam o mesmo
total e os mesmos concluídos.

### `INV-06` — nenhuma tabela nova

A lista vive o tempo do cálculo e morre. Não há coleção de andamento no estado,
e há um teste que **falha** se alguém criar uma chamada `andamento`,
`andamentos`, `checklist` ou `itens_checklist`.

### As duas decisões `[SÓ PROTÓTIPO]` que viraram código

- **Escopo TECTO como especialidade.** Os itens de orçamento entram sob a
  especialidade sintética "TECTO". Por construção, a fatia dela dá o mesmo
  número que `calcularPctObra` — conferido nas cinco obras.
- **Pseudo-ambiente "Obra inteira".** Serviço sem ambiente único fica com
  `ambiente_id` ausente e é rotulado assim na agregação. É pseudo de verdade:
  **não** existe linha em `ambientes`, e há teste garantindo que ninguém crie
  uma. Criar faria o Checklist e o Andamento TECTO exibirem um ambiente vazio,
  em telas que não são minhas.

### O total

Calculado sobre o conjunto inteiro, não somado nem mediado das fatias. Somar
fatias arredondadas dá outro número, e é o total que precisa bater com o Portal.
Obra 22: 20 concluídos de 41 registros = 49%.

### Aceite verificado no navegador

`Obra.andamento_geral_pct` passou a ser o valor derivado — 49, 40, 26, 0 e 89 —,
porque três telas leem o campo e elas pertencem ao outro agente. Como Pedro e
como Mariana:

| Tela | Andamento TECTO | Andamento Geral |
|---|---|---|
| Carteira de obras | 50% (rótulo "Progresso") | não exibe |
| Obra 22 · visão geral | 50% | **49%** |
| Portal do Cliente | 50% ("Serviços da TECTO") | **49%** ("Obra completa") |

Os dois números que aparecem em mais de uma tela são idênticos nas telas em que
aparecem. Há teste conferindo a igualdade entre o derivado e o armazenado.

---

## O que eu decidi por conta própria

Seis decisões, todas em `docs/DECISOES.md`. As que mais importam:

- **O estorno devolve o que foi pago**, não o valor do lançamento.
- **`estornada` é transição de estado**, não `UPDATE` destrutivo.
- **Crédito tem campo próprio** no extrato, não desconto negativo.
- **`ParcelaContrato` sem gatilho de cobrança**, pela `Q-005`.
- **O pseudo-ambiente não existe em `ambientes`.**
- **O total do Andamento sai do conjunto**, não da soma das fatias.

## O que eu não fiz e por quê

- **Não unifiquei `custos_obra` e `servicos_terceiros`** — decisão `D2`,
  degrau 8, e o prompt proíbe nominalmente.
- **Não toquei em nenhuma tela.** Nenhum arquivo fora de `src/state/**` foi
  alterado nesta tarefa.
- **Não mudei o que a Carteira exibe** — ver achados.
- **Não instalei runner de teste.** Continua pendente, e agora são 65 testes em
  quatro arquivos.

## Achados

Nada disto foi mexido. Os três primeiros ficaram mais fáceis de resolver agora,
porque as funções passaram a existir.

1. **A Carteira exibe o Andamento TECTO, rotulado "Progresso".** As outras duas
   telas exibem os dois percentuais. O número que o Cliente enxerga como
   progresso da obra é o **Geral**; o cartão da Carteira mostra o TECTO.
   `CarteiraDObras.tsx` chama `calcularPctObra`; trocar por
   `calcularAndamentoGeral(...).pct_total` é uma linha, numa tela do Codex.

2. **O bloco "Ambiente por ambiente" do Portal usa `calcularPctAmbiente`**, que
   conta só itens de orçamento. Para o Banheiro da Suíte ele dá 80%, enquanto o
   eixo Ambiente do Andamento Geral dá 71%, porque inclui o box de vidro. São
   dois percentuais por ambiente na mesma tela, com origens diferentes.
   `calcularAndamentoGeral(...).por_ambiente` já entrega o número certo.

3. **`Obra.andamento_geral_pct` continua sendo campo armazenado.** Enquanto as
   três telas não chamarem a função, o seed precisa ser mantido em sincronia à
   mão. Há teste protegendo, mas o certo é as telas passarem a derivar.

4. **`Lancamento.parcelas` e `parcelas_pagas` seguem redundantes** com a coleção
   `parcelas` — achado já registrado na P1A, agora com mais superfície, porque o
   estorno mexe em parcelas e não nesses contadores.

5. **A `Q-030` está parcialmente respondida** e o tipo `CategoriaDespesa` tem só
   as três categorias que vieram do cliente. Ele vai crescer; o comentário do
   tipo registra isso.
