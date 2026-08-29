# Relatório — T6 · Financeiro da obra, Ficha da pessoa e Documentos

Branch `agente/code`. **159 testes, 0 falhas** (21 novos). `tsc --noEmit` limpo,
`npm run build` passa.

**A T6 era do Codex.** Foi reatribuída porque o limite de uso dele acabou. É a
primeira vez que o Claude Code escreve em `src/pages/**` fora da exceção do
Fechamento, e a fronteira da §3 do `SPRINT.md` deixou de existir na prática —
anotado no `EXECUCAO.md`.

## Commits

| hash | item |
|---|---|
| `b07a4fc` | `src/state/pessoa.ts` e 21 testes |
| `3842e4a` | `AbasDaObra` e `ObraFinanceiro` |
| `75ce033` | `FichaPessoa` e o clique em Equipe |
| `eb398ed` | `ObraDocumentos` |
| `5a1b820` | abas nas quatro telas antigas — **reversível sozinho** |
| este | documentação e relatório |

---

## A T8 já estava feita

A tela de Indicadores foi construída na sessão anterior. Confrontada com o
escopo escrito, ela cumpre tudo — **menos um item de aceite que era impossível
até agora**: *"verifique o total da obra contra o Financeiro da obra"*. A tela
contra a qual conferir não existia.

Agora existe, e **os números batem**:

| Obra 22 - MCL · últimos 3 meses | Indicadores | Financeiro da obra | Portal |
|---|---|---|---|
| Receita | R$ 64.320,00 | 3ª + 4ª parcela = R$ 64.320,00 | — |
| Mão de obra (custo empresa) | − R$ 5.769,00 | R$ 5.769,00 | — |
| Margem de repasses | R$ 1.200,00 | R$ 1.200,00 | — |
| Total da obra | — | R$ 160.800,00 | R$ 160.800,00 |
| Recebido | — | R$ 96.480,00 | R$ 96.480,00 |
| A receber | — | R$ 64.320,00 | R$ 64.320,00 |

A coincidência não é sorte: `maoDeObraPorPessoa` e `custoDeMaoDeObra` são
funções diferentes sobre os mesmos dados, e **há teste conferindo que a soma de
uma é idêntica ao total da outra nas cinco obras**. Se alguém mexer numa e não
na outra, o teste cai antes de a tela mentir.

---

## O defeito que a verificação no navegador achou

A tela nasceu dizendo **"contrato de R$ 148.320,00"** no cabeçalho e
**"contratado R$ 160.800,00"** no bloco logo abaixo. Os dois números estavam
certos — a diferença são os dois adicionais aprovados, R$ 12.480,00 — mas
nenhum rótulo dizia isso.

É exatamente a falha que o `EXECUCAO.md` nomeia como a mais grave desta parte do
sistema: *"número que não bate com o que foi mostrado nas telas anteriores"*.
E ela não apareceu no `tsc`, não apareceu no build e não apareceria em leitura
de código — só apareceu com os dois blocos na mesma tela.

**O Portal do Cliente já resolvia isso corretamente**, dizendo *"inclui
R$ 12.480,00 em serviços adicionais aprovados"*. Quem estava fora de passo era a
tela interna. Corrigido para "Contrato mais adicionais", com base e adicionais
explícitos embaixo.

---

## O que foi construído

### `src/state/pessoa.ts`

`maoDeObraPorPessoa` quebra por pessoa o que `custoDeMaoDeObra` já respondia por
obra. `fichaDaPessoa` monta as quatro camadas do `INV-01` **sem achatá-las**:
Pessoa, Vínculo, Usuário e Papel ficam campos independentes, e qualquer um pode
faltar.

Dois testes merecem menção:

- **Existe pessoa sem Usuário no seed.** Se toda pessoa tivesse credencial, o
  `INV-01` seria decorativo e a tela não teria o que demonstrar.
- **A razão custo-empresa ÷ líquido varia entre pessoas.** Se alguém introduzir
  um percentual de encargos — o cálculo que a decisão sobre encargos proíbe — a
  razão vira constante e o teste cai.

### `src/pages/ObraFinanceiro.tsx`

Recebimentos do cliente · custos por modalidade com margem · notas filtráveis
por tipo · mão de obra por pessoa. Nenhum número escrito no componente.

A tela diz por escrito por que só *repassado com margem* gera resultado, e
marca em laranja as diárias sem custo de empresa informado em vez de somar zero
em silêncio.

### `src/pages/FichaPessoa.tsx`

Quatro blocos numerados. **Valdir Chagas prova a separação na tela**: tem Pessoa
e Vínculo, não tem Usuário, e por isso não tem Papel. Uma ficha achatada com
"cargo: ajudante" não teria como mostrar isso.

O ponto de entrada de adiantamento e empréstimo chama `criarLancamento`, que já
existia. A tela não valida nada, e o tipo continua **derivado** do número de
parcelas — ela mostra "isto será um Empréstimo" enquanto se digita, e não
oferece escolher.

### `src/pages/ObraDocumentos.tsx`

Projetos e contratos agrupados por tipo, com filtro que só oferece as
especialidades que de fato têm documento.

### `src/components/AbasDaObra.tsx`

Ver "o que eu fiz além do pedido", abaixo.

---

## O que eu fiz além do pedido, e por quê

**Acrescentei migalha e abas às quatro telas de aba que não tinham** — Fotos,
Andamento, Checklist e Diários. Não estava no escopo.

O motivo é que descobri, verificando no navegador, que quem clica em "Fotos"
perde o cabeçalho da obra e a barra de abas por completo: não sabe em que obra
está e só volta pelo botão do navegador. As duas telas que a T6 pedia são abas
da mesma barra — construí-las no padrão vigente significaria criar mais dois
becos sem saída, na véspera de uma demonstração ao vivo.

Perguntei antes de fazer, e o Mestre delegou a escolha. **O commit `5a1b820` é o
único que toca as quatro telas antigas, e reverte sozinho** — se incomodar,
Financeiro, Ficha e Documentos continuam de pé.

---

## Verificação no navegador

Feita em aba nova, com console limpo, no servidor de desenvolvimento do Mestre.

| O quê | Resultado |
|---|---|
| Financeiro da obra, Obra 22, como Pedro | os quatro blocos, sem erro |
| **Como Rafael Duarte, a aba Financeiro não aparece** | confirmado |
| Ficha de Valdir Chagas | quatro camadas, saldo devedor R$ 1.200,00 |
| **Lançar R$ 600,00 em 3 parcelas** | produziu **Empréstimo**, data 20/08/26 — a do protótipo, não a do relógio — e o saldo derivado reagiu para R$ 1.800,00 |
| Documentos, filtro Marcenaria | 7 → 1 contrato e 1 projeto |
| Abas nas quatro telas antigas | migalha e abas, títulos próprios intactos |
| **Pequeno Serviço LSM** | continua sem aba de Diários — `INV-02` |
| Portal como Mariana | os três totais idênticos aos internos, **sem custo e sem margem** — `RN-136` |

### O que eu não consegui verificar

**A rota `/obras/:id/financeiro` bloqueando para o Gerente.** O estado do
protótipo é em memória: recarregar a página para digitar a URL derruba a sessão
para o login, então não há como exercitar a rota direta pelo navegador. A aba
some — isso está verificado. O bloqueio vem do mesmo `GuardaPerfil` com a mesma
lista `ADMIN_FINANCEIRO` que já barra `/financeiro` no teste de fumaça, e a
camada de permissão é única, não duplicada por rota.

---

## O que eu não fiz e por quê

- **Não corrigi a classificação de `Rogério Pastore`.** O custo "Hidráulica da
  cozinha e do banheiro da suíte" está com tipo de nota **"Parte elétrica"** no
  seed. É erro meu, da T3, e agora fica visível na tela de notas. A correção é
  um campo e não move dinheiro nenhum — `tipo_documento_id` só alimenta o
  filtro. **Não está no escopo da T6**, então anoto em vez de mexer. Se
  autorizar, é um commit de uma linha.
- **Não mexi na violação de `INV-02` do seed** — a Obra 05 é pequeno serviço e
  tem três Diários. Continua valendo o que o relatório da T7 diz: corrigir apaga
  uma pendência do Painel e derruba "pessoas em campo hoje" de 11 para 8.
- **Não apliquei `ValorMonetario` ao `Indicadores.tsx`.** A tela tem um
  formatador local, escrito quando o componente ainda estava na branch do Codex.
  Funciona e formata igual; unificar é tarefa própria.
- **Não criei `criarCliente`.** Segue pendente desde a T7, pela mesma razão.

## Achados

1. **`Rogério Pastore` classificado como "Parte elétrica"** — acima.
2. **As fotos de obra do seed incluem rostos de pessoas reais.** A restrição de
   "nunca fotografia de pessoa real" foi dada para os **avatares**, e os avatares
   estão corretos — são ilustrações geradas por código. Mas as mídias da obra
   vêm de fotografia, e pelo menos uma delas é retrato de rosto. Se o protótipo
   for publicado num link, vale a mesma preocupação que motivou a regra
   original. Não é meu arquivo e não estava no escopo.
3. **`pessoasDaGrade` e `pessoasDaSemana` continuam coexistindo** — terceira vez
   que este achado aparece. Uma recorta por id, a outra por tipo de vínculo.
4. **`Lancamento.parcelas_pagas` continua sem ninguém que o atualize** — quarta
   vez. A `FichaPessoa` deliberadamente **não** o lê: conta as parcelas com
   `situacao === 'paga'`, que é a fonte real.
