# Relatório — Ajustes depois da chegada do `PRODUTO.md`

A P1A foi executada sem o Documento Canônico, que não existia no repositório.
Com ele em mãos, reli o que construí contra as fontes de precedência 1 e 2.
Este relatório registra o que se manteve, o que estava errado, e o que mudou.

Branch `agente/code`, quatro commits.

## Commits

| hash | o quê |
|---|---|
| `616860a` | `RN-004` — seis tipos de vínculo · `RN-095` — saldo devedor |
| `73b4b27` | `RN-135`, `RN-131`, `RN-130` — entidades do Portal · `RN-136` — fronteira |
| `1e70fd1` | `RN-125` — transcrição da decisão `D1` |
| `4884798` | a obra do ciclo por obra vem da fonte certa por tipo de pessoa |

---

## O que a P1A já tinha certo

Conferido item a item contra os invariantes e as regras do capítulo 8:

| Fonte | Estado |
|---|---|
| `INV-03` valor congelado | lê o valor do registro da diária, com teste que muda o vínculo e confirma que o período não se mexe |
| `INV-04` N presenças, 1 diária | Israel: 2 presenças, 1 diária |
| `INV-05` divergência derivada | nunca gravada |
| `INV-07` trava pelo ciclo da pessoa | é o critério de `periodoEstaFechado`; a regra diz explicitamente que "não existe trava da semana" |
| `INV-10` centavos | em toda camada |
| `RN-085` não existe meia diária | Israel tem manhã e tarde, e **uma diária inteira** de R$200,00 |
| `RN-088/089` adicional opcional | não é recalculado por dia da semana — agora com fundamento, não intuição |
| `RN-090` por ciclo e por pessoa | `todosOsCiclos` agrupa pela tripla |
| `RN-092/093/094` | o desconto é dirigido por **parcela**, não pelo `tipo` do lançamento, que é o que a `RN-094` pede |

## O que estava errado

### `RN-004` — eu tinha deixado a gestão sem vínculo

Na P1A escrevi no seed que a gestão não teria vínculo porque "o regime de
remuneração do Gerente e do Assistente é `Q-001` a `Q-004`, e inventar um aqui
viraria regra de negócio por conveniência de seed".

A tabela da `RN-004` mostra que eu confundi duas coisas. Ela **decide o tipo**
de cada um: Gerente de Obras recebe valor fixo por Obra; Administração e
Financeiro estão fora do escopo de pagamento na V1. O que segue aberto é o
**valor**, não o tipo.

`Vinculo.tipo` foi de dois valores para os seis da regra, e os seis de gestão
ganharam vínculo. O cuidado que sobrevive: `valor_obra_centavos` do Gerente fica
**vazio**, e a tela exibe "a definir". Um número ali afirmaria que o valor não
varia com duração nem porte, que é exatamente o que a `Q-001` pergunta.

### `RN-095` — faltava o saldo devedor

*"O Financeiro sempre enxerga o saldo devedor de cada Pessoa antes de executar o
Fechamento."* A tela mostrava só o que rolava **daquele ciclo**. São números
diferentes: o Marcos desconta R$300,00 no ciclo e deve R$900,00 ao todo, porque
o empréstimo dele tem mais três parcelas.

Agora há coluna "Deve ao todo" na tabela e linha no extrato.

### `RN-136` — a fronteira do Cliente era convenção, não código

As três entidades do Portal exigidas pela `RN-135` não existiam:
`recebimentos` (parcelas do Cliente), `adicionais_obra` e `custos_obra`. Estavam
escritas à mão dentro de `PortalFinanceiro.tsx`.

Os valores foram movidos **sem alteração**, e há teste conferindo, nas cinco
obras, que a soma dos recebimentos é igual a `valor_contratado + adicionais` e
que a soma dos pagos é igual a `recebido_centavos`. Verificado no navegador: o
Portal renderiza os mesmos números de antes.

`custosVisiveisAoCliente` devolve um tipo que **não tem** `custo_centavos` nem
margem. Deixar o campo no objeto contando que a tela não o exiba é exatamente
como o vazamento acontece — e o Portal é a tela que a TECTO mostra aos clientes
dela.

### O defeito que o teste pegou

`margemDaObra` somava `cobrado − custo` em todos os custos, inclusive os
**direto do fornecedor**, onde a TECTO não desembolsa nada e `custo_centavos` é
zero. A Obra 22 aparecia com **R$57.200,00** de margem em vez de **R$2.800,00**
— vinte vezes mais, e com cara de número certo.

É o perfil exato do erro que o §12.4 descreve: não aparece na tela, aparece
semanas depois. Só `repassado_com_margem` gera margem.

## `RN-125` — a divergência com a decisão `D1`

A `RN-125` dizia que o Andamento Geral é *"organizado apenas por Ambiente, sem
detalhamento de serviço"*. A decisão `D1` diz que ele passa a ter Especialidade
**e** Ambiente, e declara **"Invalida: a `RN-125`"**.

Transcrevi a `D1` para a `RN-125` e acrescentei a `RN-125b` com a restrição —
especialidade é atributo do serviço de terceiro, os três percentuais saem do
mesmo conjunto, e não se cria segunda tabela espelhando o Checklist, porque isso
violaria o `INV-06`.

**Não foi decisão minha.** A `D1` já estava registrada e marcada `[PRODUTO]`,
que segundo o próprio `DECISOES.md` significa "deve virar `RN` ou `INV` em
`docs/PRODUTO.md`". Isto é a transcrição que faltava. Se a redação não estiver
boa, é só dizer.

---

## O que precisa da sua decisão

**1 · `docs/DECISOES.md` não está na tabela de precedência do `AGENTS.md` §2.**
Pela letra do contrato, uma `RN` vence uma decisão registrada — mesmo quando a
decisão declara invalidá-la, como a `D1` fazia. Ou o arquivo entra na tabela, ou
toda decisão `[PRODUTO]` precisa ser transcrita antes de valer. Registrei em
"aguardando registro"; a escolha é sua.

**2 · A §14 do `PRODUTO.md` existe, e o `AGENTS.md` §3 diz que não deveria.**
O contrato afirma que a seção comercial "foi deliberadamente deixada fora de
`docs/PRODUTO.md`". Há uma §14, "Contexto comercial que afeta o desenvolvimento".
**Não a li.** Se for só contexto de prazo, ajuste o `AGENTS.md`; se tiver valor
de contrato ou condição de pagamento, ela não deveria estar aí.

**3 · A §13 do `PRODUTO.md` duplica o `docs/ABERTO.md`.** As `Q-001` em diante
estão nos dois, hoje idênticas. O `DECISOES.md` tem regra explícita contra isso
— "nunca nos dois" — justamente porque uma é respondida e a outra não.

---

## O que isto muda na T3

O item 3 da T3 pede quatro entidades. **`custos_obra` já existe**, criada aqui
com a modalidade da `RN-131`. Restam `servicos_terceiros`, `despesas_empresa` e
`contratos_terceirizado`.

O item 2 da T3 — Andamento Geral com dois eixos — deixa de estar bloqueado: a
`RN-125` e a `D1` agora dizem a mesma coisa.

## O que isto muda para o Codex

Nada na T2 que está rodando: os itens que ela cobre não tocam nenhuma destas
entidades.

Para a rodada seguinte, dois itens deixam de estar bloqueados:

- **`ValorMonetario`** — `PortalFinanceiro.tsx` pode ler `recebimentos`,
  `adicionais_obra` e `custosVisiveisAoCliente` em vez das constantes locais.
  Os números são os mesmos, então a troca não move nada na tela.
- **`ChipVinculo`** — `Vinculo.tipo` tem os seis tipos da `RN-004`. Note que o
  chip "Administrativo/Marketing" do prompt original **não existe na regra**: é
  o regime de Salário fixo da decisão `D4`, degrau 8. O conjunto certo vem da
  `RN-004`.

## Verificação

- `npx tsc --noEmit` limpo; `npm run build` passa.
- **38 testes, 0 falhas** — 27 de fechamento, 11 de portal.
- Navegador, como Pedro: Painel sem regressão (11 em campo, R$6.680,00, 5
  pendências), coluna "Deve ao todo" com R$900,00 no Marcos, aba "Por obra" com
  os dois Gerentes em "a definir".
- Navegador, como Mariana: o Portal Financeiro renderiza os mesmos valores de
  antes — R$160.800,00, R$96.480,00 pagos, as 6 parcelas e os 2 adicionais.
