# Relatório — T7 · Funções de criação

Branch `agente/code`. **138 testes, 0 falhas.** `tsc --noEmit` limpo,
`npm run build` passa. Nenhuma tela alterada.

## Commits

| hash | o quê |
|---|---|
| `bb3731c` | `src/state/criacao.ts`, oito mutações no store e 39 testes |
| este | inventário, três decisões e este relatório |

---

## ACHADO GRAVE — uma violação de `INV-02` no seed

**A Obra 05 é `pequeno_servico` e tem três Diários.**

- `INV-02` — *"O Diário é **desabilitado por tipo**, não é uma tabela separada."*
- `RN-043` — lista o que o Pequeno Serviço possui: *"Cliente, endereço,
  orçamento, checklist, pessoas, custo, receita e fotos."* Diário não está lá.
- O prompt da T7 diz literalmente: *"pequeno serviço não tem Diário."*

Três fontes concordam, e o seed contradiz as três. `Serviço 04 - LSM` tem `d05`,
`d_18c` e `d06` — o primeiro é anterior a mim, os outros dois **fui eu que criei
na P1A**.

**Não corrigi**, e a razão é que a correção muda o que aparece na tela durante a
demonstração:

| O que cai junto | Consequência |
|---|---|
| As 3 diárias da LSM | somem as presenças de p08, p16, p17 e p26 |
| Sem presença, sem diária | o ciclo semanal encolhe |
| `d06` | **some a pendência "Decisão de pagamento: Jonas Ribeiro"** |
| "Pessoas em campo hoje" | cai de 11 para 8 |

Uma das cinco pendências do Painel desaparece. Isso é decisão sua, não minha —
o `AGENTS.md` §7 manda anotar e seguir quando o prompt não pediu.

**Duas saídas.** Ou a LSM deixa de ter diário e eu remonto a cena do Jonas em
outra obra; ou o Pequeno Serviço passa a ter Diário e a `RN-043` é corrigida
para dizer isso. A segunda contraria o `INV-02`, que é precedência 1 — então a
primeira parece a certa, mas custa retrabalho no seed.

A função `obraTemDiario` já faz a regra valer daqui para a frente. O que está
inconsistente é só o dado.

---

## O que foi construído

`src/state/criacao.ts` — funções puras que devolvem os arrays novos. As oito
mutações vivem no store. Os formulários são da T10 e **não podem reimplementar
regra nenhuma**: se uma validação faltar aqui, ela falta em todo lugar.

**Todo erro é descritivo.** O de CPF duplicado nomeia de quem é o CPF; o de
vínculo ativo diz desde quando; o de papel errado cita a `RN-004`. "Dados
inválidos" não diz a ninguém o que fazer a seguir.

| Função | Regras que faz valer |
|---|---|
| `criarPessoa` | `RN-002` CPF único · `INV-01` não cria vínculo |
| `criarVinculo` · `encerrarVinculo` | `RN-003` um ativo por vez · `RN-004` exigências por tipo · `INV-08` encerra, não apaga |
| `criarObra` | `RN-031` `RN-033` `RN-038` `RN-039` · `INV-10` centavos inteiros |
| `obraTemDiario` | `INV-02` e `RN-043` |
| `vincularGerente` · `encerrarVinculoDeObra` | `RN-034` vários simultâneos · `RN-036` nunca excluído |
| `criarSemanaPlanejamento` | `RN-051` nasce rascunho · `RN-052` · `RN-055` em aberto |
| `publicarPlanejamento` | `RN-051` · publica com gente em aberto |
| `criarLancamento` | `RN-092` `RN-093` `RN-094` · `Q-007` sem limite |

### Três coisas que mereceram cuidado

**O tipo do lançamento é derivado, não escolhido.** A `RN-094` diz que
adiantamento e empréstimo são a mesma entidade diferenciada pelo número de
parcelas. Uma função só: uma parcela produz adiantamento, mais de uma produz
empréstimo. Oferecer os dois numa lista deixaria criar um "adiantamento em
quatro parcelas", que não existe.

**O resto da divisão vai na primeira parcela.** R$1,00 em três parcelas dá
34 + 33 + 33. Centavo perdido em arredondamento é dinheiro que não existe em
lugar nenhum — há teste conferindo que a soma fecha.

**O recorte do Planejamento passou a sair do tipo.** A `RN-052` diz "toda Pessoa
com Vínculo ativo", o que ao pé da letra poria Pedro e Fernanda na escala. É a
lacuna 2 do `ABERTO.md`, e a `RN-004` agora permite resolvê-la pelo tipo do
vínculo em vez da lista de ids escrita à mão que existia em `pessoasDaGrade`.
**Terceirizado continua entrando**, como já entra: tirá-lo seria responder a
`Q-006`.

### Uma duplicidade que eliminei de passagem

`publicarSemana`, no store, publicava a semana sem validação nenhuma — inclusive
duas vezes. Passou a delegar para `publicarPlanejamento`. A assinatura não mudou,
as telas não sentem, e agora existe **uma** regra em **um** lugar.

---

## `criarCliente` — pendente da sua decisão

Ficou de fora, e é a única função do prompt que não entreguei.

`Obra.cliente` é uma string. O glossário faz do Cliente uma Pessoa — Usuário é
"credencial ligada a uma Pessoa". Mas `PainelDoDia.tsx:115` conta
`pessoas.filter(ativo)` sob o rótulo "com vínculo ativo", e hoje o número está
certo por coincidência.

**Na Cena 3 isso fica pior:** criar um cliente ao vivo somaria 1 ao contador do
Painel, errado, na frente do cliente.

As duas saídas continuam as mesmas: **(b)** eu crio Pessoa + Usuário e você
acrescenta uma linha ao prompt do Codex corrigindo aquela contagem; ou **(a)** ela
vira tarefa conjunta depois.

---

## O que eu decidi por conta própria

Três decisões em `docs/DECISOES.md`: o tipo do lançamento derivado do número de
parcelas; o recorte do Planejamento pelo tipo de vínculo; e o resto da divisão na
primeira parcela.

## O que eu não fiz e por quê

- **`criarCliente`** — aguarda decisão.
- **Não corrigi o Diário do Pequeno Serviço** — muda a demonstração; é sua.
- **Não escrevi a `RN` do recorte do Planejamento.** Implementei e anotei no
  `ABERTO.md` que falta virar regra, como fiz com as lacunas 3 e 4. Posso
  escrever se autorizar.
- **Não semeei CPF nas 34 pessoas existentes.** O campo é novo e elas são
  anteriores. `criarPessoa` exige CPF para quem for criado daqui em diante, e há
  teste da unicidade entre pessoas criadas.

## Achados

1. **`Serviço 04 - LSM` tem Diário** — a violação de `INV-02` acima.
2. **`pessoasDaGrade`, em `store.ts`, ainda exclui p01, p02 e p03 por id.**
   `pessoasDaSemana` faz o mesmo recorte pelo tipo. As duas coexistem e vão
   divergir se alguém contratar um segundo financeiro. Unificar é seguro, mas a
   primeira é lida pela tela de Planejamento e eu não quis mexer no que a T4 do
   Codex está tocando agora.
3. **`Lancamento.parcelas_pagas` continua sem ninguém que o atualize.**
   `criarLancamento` o inicializa em zero e nada o incrementa — quem sabe quantas
   foram pagas é a coleção `parcelas`. Terceira vez que este campo aparece nos
   achados; vale removê-lo numa tarefa própria.
