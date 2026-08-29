# Relatório — T5 · Cálculo dos Indicadores

Branch `agente/code`. Um commit de código, um de documentação.

**99 testes, 0 falhas.** `tsc --noEmit` limpo, `npm run build` passa. Nenhuma
tela alterada — nada fora de `src/state/` e `docs/` foi tocado.

## Commits

| hash | o quê |
|---|---|
| `d75cd12` | `src/state/indicadores.ts`, os dois campos de custo e 19 testes |
| este | inventário, três decisões e este relatório |

---

## O erro que este módulo existia para cometer

A decisão sobre encargos, no `DECISOES.md`, já tinha previsto:

> *"para funcionário com vínculo formal, o custo real para a empresa excede o
> líquido registrado. **Sem correção, o módulo de Indicadores superestima a
> margem em silêncio.**"*

Em números, na Obra 22 em agosto:

| | Valor |
|---|---:|
| Mão de obra pelo líquido acordado | R$ 3.470,00 |
| Mão de obra pelo custo real da empresa | **R$ 5.769,00** |
| Diferença que a margem engoliria | R$ 2.299,00 |

Numa obra, num mês. É exatamente o "número que parece certo e está errado" que o
runbook usa para descrever este módulo.

## O caminho (b), e por que exigiu dois campos

Você autorizou construir o segundo campo do "padrão de dois campos". Ele virou
**dois**, e a razão é o `INV-03`:

```
Vinculo.custo_empresa_diaria_centavos   o cadastro, lançado à mão
Diaria.custo_empresa_centavos           CONGELADO no momento do fato
```

Se o custo morasse só no Vínculo e os Indicadores o lessem ao vivo, **mudar a
folha hoje reescreveria a margem do mês passado** — e não existiria auditoria.
É o mesmo par que já existe para o líquido: `valor_diaria_centavos` no cadastro,
`valor_centavos` congelado na diária. Há teste que altera o cadastro e confirma
que o período não se mexe.

**O código nunca deriva um do outro.** A tabela de custo da empresa é fonte
independente, e a razão entre os dois números muda de pessoa para pessoa — há um
teste que falha se alguém trocar a tabela por um percentual sobre o líquido, que
é precisamente o cálculo de encargos que a decisão proíbe.

**Os valores semeados são plausíveis, não reais.** Vieram de mim, não da
contabilidade. Registrado no `DECISOES.md` com pedido de confirmação: é um número
que o Pedro vai reconhecer como certo ou errado na hora.

---

## Duas perguntas abertas, nenhuma respondida por mim

### `Q-031`, que o prompt já antecipava

Despesa da empresa fica **separada**, e **não existe função de rateio** neste
módulo — nem comentada, nem "por enquanto". Há teste que percorre os exports e
falha se alguém criar uma função com "rate" no nome.

### `Q-033`, que ninguém tinha visto

*"Receita significa valor contratado ou valor recebido?"* Está aberta, e decide o
numerador de tudo. **Não escolhi.** O módulo devolve as duas bases:

| Base | Agosto/2026 |
|---|---:|
| Receita contratada — parcelas com vencimento no período | R$ 48.260,00 |
| Receita recebida — parcelas pagas no período | R$ 11.900,00 |

A diferença é grande demais para ser decidida por conveniência de implementação.
A margem é calculada nas duas bases, e a tela da T8 é obrigada a rotular qual
está exibindo.

---

## O item 2, em números

| | Agosto/2026 |
|---|---:|
| Margem das obras | R$ 31.653,00 |
| Despesas da empresa | − R$ 4.680,00 |
| **Margem da empresa** | **R$ 26.973,00** |

A primeira responde *"as obras deram lucro"*. A segunda responde *"a empresa deu
lucro"*, que é a pergunta que paga a conta.

## A `RN-131` no cálculo da margem

Só **repassado com margem** move a margem da obra:

- **Reembolsável** — a TECTO paga e o Cliente devolve o mesmo valor. Entra e sai.
  Contar o custo sem contar a devolução afundaria a margem sem motivo.
- **Direto do Cliente** — a TECTO não desembolsa nada e não cobra nada; só
  registra a nota.

Há teste conferindo que as outras duas modalidades dão margem zero.

## O que sobra, e fica visível

O resultado consolidado carrega um campo `avisos`, para a tela da T8 **não
conseguir exibir número pelado**:

1. quantas diárias vieram sem custo de empresa informado, e que a margem está
   mais alta nessa medida — hoje, zero;
2. que a remuneração de Gerente e Assistente é `Q-001` a `Q-004`, não entra em
   obra nenhuma, **e a margem não a desconta**;
3. que a receita aparece em duas bases por causa da `Q-033`;
4. que a despesa não é rateada por causa da `Q-031`.

O item 2 dessa lista é um buraco real: o Rafael e a Ana custam dinheiro à
empresa e não aparecem em custo nenhum. Não inventei o regime deles, mas o
número não pode fingir que eles são de graça.

---

## O que eu decidi por conta própria

Três decisões, em `docs/DECISOES.md`: os dois campos de custo com a ressalva
sobre os valores; a receita nas duas bases; e só repassado com margem entrando
na margem.

## O que eu não fiz e por quê

- **Não criei função de rateio de despesa** — `Q-031`, e o prompt proíbe.
- **Não elegi uma base de receita** — `Q-033`, aberta.
- **Não inventei o regime da gestão** — `Q-001` a `Q-004`, abertas. O buraco
  está no `avisos`.
- **Não calculei encargos.** Os valores de custo da empresa são lançados, nunca
  computados.
- **Não toquei em tela nenhuma.** A tela de Indicadores é a T8, do Codex.

## Achados

1. **`Diaria.custo_empresa_centavos` fica ausente nas diárias de valor zero** —
   gerente, assistente e terceirizado por obra. É correto: sem líquido não há
   custo de diária a informar. Mas o custo *real* dessas pessoas existe e não
   está em lugar nenhum. É o mesmo buraco do aviso 2.

2. **`Vinculo.valor_obra_centavos` do Gerente continua vazio** por causa da
   `Q-001`. Quando ela for respondida, o custo do Gerente pode entrar na obra —
   e aí o aviso 2 sai.

3. **O período usa `data` do registro em todos os casos.** Para diária é o dia
   trabalhado, para custo é a data do custo, para despesa é a data do
   lançamento. Se a `Q-033` decidir "despesa é quando paga", a despesa precisará
   de um campo de pagamento que hoje não existe.
