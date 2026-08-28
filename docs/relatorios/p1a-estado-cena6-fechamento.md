# Relatório — P1A · Estado, Cena 6 e Fechamento

Branch `agente/code`, seis itens, seis commits, todos empurrados.

## Commits

| hash | item | arquivos tocados |
|---|---|---|
| `d6e97d4` | 1 — auditoria de `useEffect` | `docs/ESTADO_DO_PROTOTIPO.md` |
| `4d20eb2` | 2 — cinco entidades aditivas | `src/state/types.ts`, `src/state/dados-iniciais.ts` |
| `77c16c9` | 3 — estado semeado da demonstração | `src/state/dados-iniciais.ts` |
| `630f9ab` | 4 — fluxo F2 no navegador | `src/state/store.ts`, `docs/ESTADO_DO_PROTOTIPO.md` |
| `23f421f` | 5 — `fechamento.ts` e testes | `src/state/fechamento.ts`, `src/state/fechamento.testes.ts` |
| `513c06b` | 6 — tela e rota `/financeiro` | `src/pages/Fechamento.tsx`, `src/routes.ts`, `src/state/*`, `docs/ESTADO_DO_PROTOTIPO.md` |

Este commit acrescenta as decisões em `docs/DECISOES.md` e este relatório.

---

## Item a item

### Item 1 — Auditoria de `useEffect`

Três ocorrências em `src/` inteiro, todas em `src/pages/DiarioObra.tsx`. Nenhuma
outra tela herdou o padrão do gerador.

| Linha | O que faz | Veredito |
|---|---|---|
| 1 | importação | não é efeito |
| 499 | timer de gravação, com `clearInterval` | **(a) legítimo** |
| 641 | recria o conteúdo da folha e grava em estado | **(b) defeito** |

**A suspeita do Pacote 0 virou certeza, e no navegador.** `pessoasMap` é
recriado a cada render em `DiarioObra.tsx:469` e está nas dependências do efeito
em `DiarioObra.tsx:681`. O efeito roda em todo render e grava um elemento JSX
novo, que nunca é `Object.is`-igual ao anterior. Abri o diário da Obra 18 como
Pedro, removi uma pessoa planejada, e o console acusou `Maximum update depth
exceeded` repetidamente.

**Severidade menor do que parece.** A folha renderiza — o React interrompe em 50
iterações — e a ação completa corretamente. É degradação silenciosa: renderização
em excesso e console inundado, invisível para quem assiste à demonstração.

**Não corrigi**, por duas razões independentes: o item manda classificar, e a
correção é em `src/pages/DiarioObra.tsx`, fora dos arquivos permitidos.

### Item 2 — Cinco entidades aditivas

`parcelas`, `notificacoes`, `especialidades`, `tipos_documento` e `midias`.
Nenhuma tela existente as lê; o Painel continuou byte a byte igual depois do
commit.

Duas escolhas de modelagem que valem explicação:

- **`Parcela.ciclo_periodo_fim` é uma data, não um id de Fechamento.** Parcela
  futura cai em ciclo que ainda não tem registro de Fechamento; apontar para um
  id inexistente seria pior que apontar para a data.
- **`Notificacao` guarda título e descrição congelados.** Notificação é registro
  de fato passado. Texto derivado na leitura mudaria junto com o dado de origem,
  e a notificação passaria a descrever algo que não aconteceu.

`midias` é aditiva de propósito: `Diario.fotos` continua sendo o que as telas de
foto leem hoje. As 18 fotos existentes ganharam ambiente, atribuído pelo texto do
diário correspondente, não sorteado.

### Item 3 — Estado semeado da demonstração

Substituí os 20 nomes inventados por p11–p30 pelo elenco fixo. São 34 pessoas:
6 de gestão, 23 de campo, 4 terceirizados e Wagner Lopes inativo.

Os 12 pontos de tensão, todos verificados no Painel como Pedro:

| # | Pedido | Estado |
|---|---|---|
| 1 | semana publicada com as pessoas de campo | 23 de campo, mais Rafael, Ana e os 4 terceirizados |
| 2 | diário da MCL de 19/08 finalizado | `d01` |
| 3 | diário da MCL de 20/08 em rascunho, ≥4 planejados | `d02`, com **10** planejados |
| 4 | Obra 25 - ATB sem diário → pendência | aparece no Painel |
| 5 | divergência do Rafael | planejado GFR, presente MCL em 19/08 |
| 6 | Israel Fontes em duas obras, uma diária sem obra | 2 presenças, 1 diária |
| 7 | ausência do Jonas sem decisão | via `d06` da LSM |
| 8 | adiantamento do Jonas, parcela única | `la01` |
| 9 | empréstimo do Marcos, 4 parcelas, 1 paga | `la02` |
| 10 | Valdir com saldo devedor maior que o ciclo | R$1.200,00 contra R$400,00 |
| 11 | ciclos 22/08, 29/08 e 31/08 | 14, 6 e 3 pessoas |
| 12 | as cinco obras com itens de orçamento | 18 ambientes, 92 itens |

**Corrigi de passagem o achado S5:** toda presença aponta agora para o diário da
mesma obra e da mesma data. Havia 8 presenças de 20/08 apontando para diários de
19/08.

Duas coisas exigiram decisão e estão em `docs/DECISOES.md`: a Obra 25 precisou
passar de `pausada` para `em_andamento`, porque `calcularPendencias` só deriva
"diário faltando" para obra em andamento; e Ana Carvalho deixou de ser "gerente"
da Obra 25, papel que o elenco fixo não dá a ela.

### Item 4 — Fluxo F2 no navegador

Os sete passos, como Pedro, em `/obras/22-mcl/diario`. Todos passaram. O detalhe
está na §11 do `docs/ESTADO_DO_PROTOTIPO.md`; o resumo:

- o diário chega pré-preenchido com os 10 planejados;
- a remoção abre a folha, nomeia a pessoa, pede motivo e exige confirmação;
- a adição de alguém alocado em outra obra avisa *"Ele está alocado em outra
  obra"* — **sem revelar qual**;
- finalizar grava presenças e diárias;
- **o Painel muda sozinho**: 11 → 20 pessoas em campo, 5 → 7 pendências.

As duas pendências novas são derivadas, não escritas: o rateio do Edmilson, que
ficou em duas obras no mesmo dia, e a decisão de pagamento do Adilson.

**Defeito encontrado e corrigido.** Cinco mutações do store gravavam
`new Date().toISOString()` — a data real da máquina. Um diário de 20/08/2026
exibia "finalizado em 28/08". Quebrava o invariante de data coerente **no fim da
Cena 6**, que é o momento mais visível da demonstração. Agora usam
`agoraNoPrototipo()`. Reverificado: "finalizado em 20/08 às 14:15".

### Item 5 — `src/state/fechamento.ts` · módulo sensível

**O raciocínio do cálculo, na ordem em que acontece:**

1. **Soma as diárias do período pelo valor congelado no registro.** Nunca lê o
   vínculo. Há teste para isso: mudo a diária do vínculo do Marcos para R$999,00
   e o bruto do período não se mexe.
2. **Soma os adicionais, também congelados.** O adicional de sábado, domingo e
   noturno **não** é recalculado a partir do dia da semana. Ele é decisão tomada
   no Planejamento e gravada na diária; recalcular seria inventar dinheiro que
   ninguém aprovou.
3. **Desconta adiantamento integralmente.** É antecipação do próprio pagamento,
   então volta inteira.
4. **Do empréstimo, desconta apenas a parcela do ciclo.** O resto continua
   devido e não é problema deste ciclo. A busca usa `ciclo_periodo_fim <= fim`, e
   não `===`, para que parcela que rolou de um ciclo anterior seja cobrada aqui
   em vez de sumir da conta.
5. **`a_pagar = max(0, bruto − descontos)`.** O pagamento nunca é negativo. A
   diferença vira `saldo_a_rolar`.

Conferindo no Valdir, que é o caso de borda: bruto R$400,00 (duas diárias de
R$200,00), desconto R$1.200,00, a pagar R$0,00, rola R$800,00. Ao executar, a
parcela de R$1.200,00 é **partida em duas** — R$400,00 paga neste ciclo,
R$800,00 pendente em 29/08. Partir preserva o rastro de quanto foi amortizado e
quando; reduzir o valor da parcela original apagaria essa informação, e isto é
dinheiro.

**Imutabilidade.** Um diário está travado quando **qualquer** pessoa nele está em
período fechado, e não quando todas. O motivo é concreto: `finalizarDiario` apaga
e regrava presenças e diárias de todo mundo do diário, então uma pessoa fechada
já basta para proibir a edição. Nenhuma função de imutabilidade recebe perfil — a
trava vale para a Administração, e há teste guardando essa ausência.

**Testes: 21, zero falhas**, incluindo os três obrigatórios. Ver §12.3 do
inventário para como foram executados — não há runner instalado, e instalar um
tocaria `package.json`, fora dos arquivos permitidos.

### Item 6 — Tela de Fechamento e rota `/financeiro`

`src/pages/Fechamento.tsx`, visualmente crua de propósito. Nenhum número escrito
no componente; tudo vem de `fechamento.ts`, em centavos, formatado só na exibição.

Verificado no navegador, como Pedro:

- as quatro abas; a "Por obra" mostra pessoa, obra, valor e situação e **declara
  em texto** que a periodicidade não foi decidida;
- as três pendências que bloqueiam, cada uma com a ação que a resolve;
- a tabela com Valdir em R$0,00 a pagar e R$800,00 rolando;
- o extrato do Jonas linha a linha: duas diárias de R$180,00, adiantamento de
  −R$400,00, a pagar R$0,00, rola R$40,00;
- resolver o rateio do Israel fez a pendência sumir sozinha;
- o ajuste de desconto recusou R$500,00 contra R$300,00 propostos, com o botão
  desabilitado e a frase *"descontar mais seria cobrar dívida que não existe"*;
- um ajuste válido de R$100,00 levou o Marcos de R$200,00 para R$400,00 e o total
  do ciclo de R$6.680,00 para R$6.880,00.

**Corrigi um número que não batia.** A tela expôs que `Fechamento.total_centavos`
estava semeado como **bruto**: o Painel dizia R$7.740,00 e a tela dizia
R$6.680,00 para a mesma semana. O campo passa a guardar o **líquido**, que é o
mesmo significado que `executarFechamento` grava ao fechar. Os dois agora dizem
R$6.680,00.

---

## Permissão — o que foi clicado e o que foi lido

**Clicado, com sessão viva, como Rafael Duarte:**

- o menu lateral dele não tem Financeiro, Indicadores, Orçamentos nem Equipe;
- a página da obra não oferece as abas Financeiro e Documentos;
- a `GuardaPerfil` devolve `SemAcesso` num link que ele alcança — "Ver como o
  cliente vê" leva a `/portal`, cujo `handle.perfis` é só Cliente.

**Lido, não clicado:** `/financeiro` com `perfis: ADMIN_FINANCEIRO`
([routes.ts:106](../../src/routes.ts:106)), verificado pela mesma
`GuardaPerfil` de [routes.ts:67](../../src/routes.ts:67), que é camada única.

**Por que não cliquei nessa rota:** o Rafael não tem nenhum caminho de interface
até ela — o que é o comportamento correto e a primeira metade do aceite.
Alcançá-la exigiria digitar a URL, e como a sessão vive em memória, qualquer
carga de página devolve o Login. É limitação da maquete não ter persistência, não
da guarda. O mecanismo é literalmente o mesmo que devolveu `SemAcesso` no
`/portal`: mesma constante, mesma função, mesma camada.

---

## O que eu decidi por conta própria

Todas registradas em `docs/DECISOES.md`. As que mais importam:

- **23 pessoas de campo, não 21.** O prompt diz 21; a lista do `AGENTS.md` §6 tem
  23 nomes. O `AGENTS.md` vence por precedência.
- **Função para as 9 pessoas que o elenco não classifica.** Campo obrigatório,
  nomes sem rótulo no contrato. É conveniência de seed — **confirmar com
  Fernando** antes de virar regra.
- **Obra 25 passa a "em andamento"** e **Ana Carvalho deixa de ser gerente**.
- **`total_centavos` é o líquido**, e o seed foi corrigido para isso.
- **O ciclo `por_obra` não entra em `Fechamento.ciclo`** — um quarto valor no
  enum deixaria o rótulo do Painel sem tradução.
- **Data gravada é a do protótipo**, via `agoraNoPrototipo()`.
- **Parcela amortizada em parte é partida em duas.**

---

## O que eu não fiz e por quê

- **Não corrigi o `useEffect` da linha 641 do Diário.** O item 1 manda
  classificar, e o arquivo é do outro agente.
- **Não instalei runner de teste.** Tocaria `package.json`, fora dos arquivos
  permitidos. Os 21 testes existem e rodam; falta o `npm test`.
- **Não toquei em `src/components/**` nem em nenhuma tela existente.** A única
  tela criada é `Fechamento.tsx`, que é o próprio cálculo.
- **Não apliquei design system na tela de Fechamento.** Ela nasce crua por
  contrato; é o item 1 da T4 do Codex.
- **Não mexi nos `Lancamento.parcelas` e `parcelas_pagas`**, que agora são
  redundantes com a coleção `parcelas` — ver achados.
- **Não corrigi a responsividade** da tela nova. Pertence à TF1.

---

## Achados

Nada disto foi mexido.

1. **`src/pages/PainelDoDia.tsx:352` tem `Obra 22 - MCL` escrito no componente.**
   Viola o circuit breaker de nada escrito no código. Na mesma linha, todas as
   fotos são rotuladas com `HOJE` independentemente de que diário vieram; como
   `PainelDoDia.tsx:154` usa `.find()` sem ordenar, elas vêm de `d01` (19/08) e
   aparecem rotuladas 20/08. É o mesmo padrão do achado T3 do Pacote 0.

2. **O ramo "Rascunho" de `PainelDoDia.tsx:143` é inalcançável.** A tabela "Quem
   está onde hoje" é montada a partir das presenças do dia
   (`PainelDoDia.tsx:134`); obra com diário em rascunho não tem presença, então
   nunca entra na lista e nunca exibe "Rascunho". Consequência visível: a Obra 22
   **não aparece** nessa tabela antes de o diário ser finalizado ao vivo.

3. **A lista de "Adicionar quem veio" do Diário oferece Pedro Almeida, Fernando
   Nunes e Fernanda Sousa** como trabalhadores de obra. Vem de
   `DiarioObra.tsx:668`, que filtra só por `ativo`. É a lacuna 2 do `ABERTO.md`
   §7 — falta o recorte de quem vai a obra.

4. **`FOTOS_INICIAIS` em `DiarioObra.tsx:64` é dado de domínio no componente.**
   Oito mídias com URL fixa, fora do estado. O contador "6 fotos · 2 vídeos" da
   tela vem daí, não do diário.

5. **`Lancamento.parcelas` e `Lancamento.parcelas_pagas` ficaram redundantes**
   com a coleção `parcelas`. Hoje ninguém lê os dois campos, mas duas fontes para
   o mesmo fato é exatamente o que costuma divergir. Vale removê-los numa tarefa
   própria.

6. **`formatarReais` produz `R$ -400,00`**, com o sinal entre o símbolo e o
   número. Não alterei porque a função é usada por outras telas. O
   `ValorMonetario` do P1B já prevê tratamento de valor negativo.

7. **`docs/PRODUTO.md` continua não existindo.** É a fonte de precedência 1 e 2.
   Trabalhei nesta tarefa sem poder ler `INV-06`, `INV-07` nem nenhuma `RN` —
   apoiei-me no que o `AGENTS.md` e o `DECISOES.md` repetem. **Enquanto esse
   arquivo não existir, toda tarefa que dependa de invariante está apoiada em
   cópia.**

8. **`docs/ESTADO.md` também não existe**, embora o preâmbulo de despacho mande
   consultá-lo. O inventário real é `docs/ESTADO_DO_PROTOTIPO.md`. Vale corrigir
   o preâmbulo ou criar um ponteiro, senão todo agente novo tropeça nisso.
