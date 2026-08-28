# TECTO — Sprint Final do Protótipo · v2

**28/08/2026 · substitui a v1 · Cenário B confirmado**

> A v1 foi escrita sob a hipótese de que o repositório continha as Tarefas A a D.
> A verificação provou o contrário. Este documento corrige o inventário da perda,
> troca a lógica de "cortes" por uma **escada de prioridade** e traz os prompts
> prontos.
>
> O que **não** mudou e continua valendo da v1: a fronteira entre os agentes
> (seção 3), o `AGENTS.md` de referência (4.1), a higiene de repositório (8).

---

# 1. O inventário real da perda

`[FATO]` Verificado no repositório em 28/08. Não existem em `src/`:
`Fechamento.tsx` · `Indicadores.tsx` · `FichaPessoa.tsx` · `ObraFinanceiro.tsx` ·
`ObraDocumentos.tsx`. Não existem no `store.ts`: `custos_obra` ·
`servicos_terceiros` · `orcamentos_adicionais` · `parcelas`. `src/state/` tem
apenas `dados-iniciais.ts`, `store.ts` e `types.ts` — nenhum módulo de cálculo.

`c996533` "sem tempo" é o estado **pós-Tarefa 1**, idêntico ao que o
`prototipo.md` descreve.

| Perdido | Conteúdo |
|---|---|
| Tarefa A | Auditoria da corrente de dados · **Fechamento de Ciclo** |
| Tarefa B | Faxina de elenco · 3 entidades · **Financeiro da obra** |
| Tarefa C | Itens de orçamento das 4 obras · **Indicadores** · **Ficha da pessoa** · **Documentos** |
| Tarefa D | Responsividade (já estava incompleta) |
| Bloco 0 | Destravar a Cena 6 · dados semeados |
| Blocos 1.1 e 1.2 | Componente de título de seção · componente de valor monetário |
| Bloco 2.1 | Taxonomia — especialidades, tipos de documento, `ambiente_id` em mídia |

## 1.1 O que sobrou, e três achados que a verificação deu de graça

**Sobrevivem:** 15 telas mais Design System e SemAcesso · `AppLayout` e
`PortalLayout` · controle de acesso por declaração · `store.ts` com 12 entidades ·
`dados-iniciais.ts` com 40 KB de dados semeados · **`AGENTS.md` e `CLAUDE.md`**.

`[FATO]` **Não existe pasta `src/components/`.** Todo o design system está
desenhado dentro de cada tela, à moda Figma Make. Isso encarece a rodada visual:
deixa de ser "criar componente e aplicar" e passa a ser "extrair de 15 telas e
aplicar". É o achado mais caro da verificação.

`[FATO]` **`ObraVisaoGeral.tsx` e `PainelDoDia.tsx` estão soltos em `src/`**, fora
de `pages/`. E `src/imports/pasted_text/` tem três `.tsx` que parecem telas
inteiras — provável código morto do Figma Make. Agente que encontra duas versões
da mesma tela edita a errada.

`[FATO]` **Existem dois lockfiles:** `package-lock.json` e `pnpm-lock.yaml`. Dois
gerenciadores de pacote na mesma árvore divergem em versão de dependência. Precisa
sobrar um.

---

# 2. A escada de prioridade

`[DECISÃO DO MESTRE]` Não existe corte. Existe fila. Sobe-se um degrau por vez, e
**o roteiro da demonstração se decide no fim**, pelo degrau alcançado — não no
começo, por chute.

`[REGRA]` A invariante da v1 continua governando: **o protótipo tem que estar
demonstrável ao fim de todo degrau.** Módulo inacabado fica atrás do `EmBreve`.

| Degrau | Conteúdo | Libera a cena | Quem |
|---|---|---|---|
| **0** | Limpeza estrutural: telas soltas, código morto, lockfile duplo | — | Code |
| **1** | Estado semeado completo · Cena 6 destravada · design system extraído e aplicado | 1, 2, 5, 6, 8 | Code ‖ Codex |
| **2** | Fechamento de Ciclo: cálculo + tela + travamento do período | **7** | Code |
| **3** | Acabamento: estados vazios, confirmações, notificações, taxonomia | — | Codex |
| **4** | Financeiro da obra · Ficha da pessoa · Documentos | — | Code + Codex |
| **5** | Indicadores | **9** | Code + Codex |
| **6** | Fluxos de criação: cliente, obra, pessoa, vínculo, semana | **3** | Code + Codex |
| **7** | Orçamento: motor, assistente de 5 passos, duas visualizações | **4** | Code + Codex |
| **8** | Estorno · reembolso a Pessoa · salário fixo · unificação · data mutável | — | Code |
| **F** | Responsividade · revisão por perfil · ensaio · congelar | — | Codex + Mestre |

**O degrau F não é um degrau.** É o fechamento do sprint e acontece
independentemente de onde a escada parou. Reserve tempo para ele mesmo que
signifique não subir mais um.

## 2.1 Por que esta ordem

**Degrau 1 antes de tudo** porque contém o par 6→8, o momento mais forte da
demonstração: preencher o diário e, dois cliques depois, mostrar a Mariana vendo.
E porque o design system extraído melhora as 15 telas de uma vez — se só um
degrau couber, é este.

**Degrau 2 antes do 5** porque o Fechamento responde a segunda das quatro
perguntas que o sistema existe para responder: quem recebe o quê, quanto e quando.
É a dor que o Pedro sente todo mês. Os Indicadores são consequência disso e podem
ser descritos em palavras sem prejuízo; o travamento do período não pode — ou
trava na frente deles, ou não trava.

**Degrau 8 por último** porque são as cinco tarefas de maior risco sobre o
Fechamento, o módulo da seção 12.4 do Canônico, onde o erro não aparece na tela e
aparece semanas depois no bolso de alguém. Nenhuma cena depende delas.

---

# 3. Fronteira entre os agentes, no Cenário B

A regra única da v1 continua: **o Claude Code escreve funções, o Codex chama
funções.** Duas precisões que o Cenário B exige:

**`Fechamento.tsx` pertence ao Claude Code por inteiro.** É a tela que *é* o
próprio cálculo — rateio de diária, saldo devedor, desconto, travamento do
período. Pela fronteira da v1, tela que é cálculo é do Code. O Codex fica
**proibido** nesse arquivo até o degrau 3, quando aplica o design system nele.

**A pasta `src/components/` nasce com o Codex.** Como ela não existe, o Codex a
cria no degrau 1. Enquanto isso o Claude Code trabalha só em `src/state/` e nos
arquivos novos que ele mesmo cria. Territórios disjuntos, merge trivial.

| Diretório | Claude Code | Codex |
|---|---|---|
| `src/state/**` | Exclusivo | **Proibido** |
| `src/components/**` | **Proibido** no degrau 1 | Exclusivo |
| `src/pages/Fechamento.tsx` | Exclusivo | **Proibido** até o degrau 3 |
| `src/pages/**` (demais) | **Proibido** no degrau 1 | Principal |

---

# 4. Sequência de disparo

```
P0  Claude Code em master ─── commit ─── push
      │
      ├── P1A Claude Code em agente/code  ──┐
      └── P1B Codex em agente/codex ────────┤ merge + verificação
                                             │
      P2  (degrau 3) ────────────────────────┘
```

**P0 roda sozinho, em `master`, antes dos dois.** Ele move arquivos. Mover arquivo
numa branch enquanto a outra o edita gera o pior tipo de conflito de merge:
renomeação contra alteração. Dez minutos de P0 economizam uma hora de conflito.

Depois que o P0 commitar e você tiver dado push:

```bash
git checkout master && git pull
git branch -f agente/code master
git branch -f agente/codex master
```

Aí sim os dois em paralelo.

---

# 5. P0 — Limpeza estrutural · Claude Code · em `master`

**Antes de colar:** resolva a modificação pendente do `AGENTS.md`.
`git diff AGENTS.md` → se fizer sentido, `git add AGENTS.md && git commit`. Se
não, `git restore AGENTS.md`. A árvore precisa estar limpa.

````
Leia AGENTS.md e CLAUDE.md inteiros antes de começar.
Você está na branch master. Esta é uma tarefa de limpeza estrutural, executada
antes de duas rodadas paralelas. Nada aqui pode mudar comportamento.

5 itens numerados. Um commit por item. Ao final, push para master.

REGRA ABSOLUTA DESTA TAREFA: nenhuma tela pode mudar de aparência nem de
comportamento. Se um item exigir isso, PARE e reporte.

------------------------------------------------------------------
ITEM 1 — Telas soltas fora de src/pages/
------------------------------------------------------------------
src/ObraVisaoGeral.tsx e src/PainelDoDia.tsx estão na raiz de src/, fora de
pages/, onde todas as outras telas vivem. Herança do gerador.

Mova ambos para src/pages/ usando `git mv`, para o histórico ser preservado.
Atualize todos os imports e a declaração de rotas.

Verifique no navegador que / e /obras/22-mcl continuam abrindo.

------------------------------------------------------------------
ITEM 2 — Código morto em src/imports/pasted_text/
------------------------------------------------------------------
Existem três arquivos ali: cliente-portal.tsx, diario-obra-gerente.tsx e
obra-22-mcl-tabs.tsx. Pelo nome, são versões antigas de telas que hoje vivem em
src/pages/.

Investigue: algum deles é importado por alguma rota, layout ou componente?

  - Se NENHUM for importado: remova a pasta inteira. Explique no relatório o que
    havia em cada um, para o caso de precisarmos consultar depois.
  - Se ALGUM for importado: PARE. Não remova nada. Reporte qual arquivo importa
    qual, porque isso significa que temos duas versões vivas da mesma tela e a
    decisão é minha, não sua.

Duas versões da mesma tela é o defeito mais perigoso para as rodadas seguintes:
um agente edita uma e o navegador mostra a outra.

------------------------------------------------------------------
ITEM 3 — Lockfile duplicado
------------------------------------------------------------------
Existem package-lock.json e pnpm-lock.yaml na raiz. Dois gerenciadores de pacote
na mesma árvore divergem em versão de dependência.

O desenvolvimento agora é em Windows com npm. Remova o pnpm-lock.yaml, rode
`npm install` e confirme que `npm run build` passa.

Se o build quebrar, restaure o pnpm-lock.yaml, reverta e reporte — nesse caso o
projeto depende de pnpm e a decisão muda.

------------------------------------------------------------------
ITEM 4 — .gitignore
------------------------------------------------------------------
Confirme que node_modules/ e dist/ estão ignorados. Se dist/ estiver rastreado,
remova do índice com `git rm -r --cached dist` sem apagar do disco.

------------------------------------------------------------------
ITEM 5 — Inventário real do repositório
------------------------------------------------------------------
Crie docs/ESTADO_DO_PROTOTIPO.md com o que EXISTE de verdade, lido do código —
nunca de memória nem de documento anterior:

  - todas as rotas declaradas, com o componente que atende cada uma
  - quais caem em EmBreve
  - todas as entidades do store.ts
  - todos os arquivos de src/state/
  - o que existe em src/components/, se existir

Este arquivo passa a ser a fonte de inventário do projeto. Ele estava
desatualizado em três tarefas e foi uma das causas de termos trabalhado com uma
foto velha do código.

------------------------------------------------------------------
ACEITE
------------------------------------------------------------------
- npm run build passa
- As 15 telas continuam abrindo, sem mudança visual nenhuma
- Login nos quatro perfis: Pedro Almeida, Fernanda Sousa, Rafael Duarte,
  Mariana Costa Lima
- 5 commits, um por item

RELATÓRIO: hash de cada commit, o que havia nos arquivos removidos no item 2, e
qualquer coisa estranha que você tenha encontrado e não mexido.
````

---

# 6. P1A — Estado, Cena 6 e Fechamento · Claude Code · `agente/code`

Este é o prompt maior do sprint. Ele cobre os degraus 1 e 2 de uma vez.

````
Leia AGENTS.md e CLAUDE.md inteiros. Você está na branch agente/code.

6 itens numerados. Execute na ordem. Um commit por item, e push da sua branch
após cada commit. NUNCA push para master.

Arquivos permitidos: src/state/**, src/pages/Fechamento.tsx (novo),
src/routes (para declarar a rota), docs/ESTADO_DO_PROTOTIPO.md
Arquivos PROIBIDOS: src/components/**, e qualquer arquivo existente em
src/pages/ que não seja Fechamento.tsx.

Outro agente está trabalhando em src/components/ e nas demais telas ao mesmo
tempo, em outra branch. Se você tocar nos arquivos dele, o merge quebra.

Se um item exigir alteração numa tela existente, PARE e reporte.

------------------------------------------------------------------
ITEM 1 — Auditoria de useEffect gravando estado derivado
------------------------------------------------------------------
Um loop infinito já ocorreu neste repositório porque um useEffect gravava estado
que deveria ser derivado. O padrão veio do commit inicial do Figma Make, então
outras telas da mesma origem provavelmente carregam o mesmo defeito.

Faça grep por useEffect em src/ inteiro. Classifique cada ocorrência:
  (a) sincroniza com o mundo externo — legítimo
  (b) grava no estado algo que poderia ser calculado na renderização — defeito

NÃO corrija nada. Produza a lista classificada com arquivo, linha e veredito.
A correção é decisão minha e as telas são de outro agente agora.

Commit: apenas a lista, em docs/ESTADO_DO_PROTOTIPO.md.

------------------------------------------------------------------
ITEM 2 — Entidades novas
------------------------------------------------------------------
Aditivas. Não podem alterar nenhuma tela existente.

  parcelas — de empréstimo: lançamento de origem, número, valor_centavos,
    situação (paga, pendente), ciclo em que cai
  notificacoes — tipo, origem, data, lida
  especialidades — marcenaria, marmoraria, vidro, ar-condicionado, gesso,
    piso de madeira, elétrica, hidráulica, pintura
  tipos_documento — nota fiscal, projeto, contrato. Tipos de nota: depósito de
    material, parte elétrica, reembolso de material, compra online, outros
  ambiente_id em mídia (foto e vídeo)

Semeie dados coerentes para todas. Cada mídia já existente recebe um ambiente.
As notificações derivam de eventos REAIS do estado semeado do item 3 — não
invente eventos. Pelo menos 5, com pelo menos 3 não lidas.

------------------------------------------------------------------
ITEM 3 — Estado semeado completo da demonstração
------------------------------------------------------------------
O estado inicial É o roteiro. Sem tensão inicial não há o que demonstrar.

Data de referência: quinta-feira, 20/08/2026. Semana corrente: segunda 17/08 a
sábado 22/08. Toda data semeada precisa bater com o dia da semana.

  1. Planejamento da semana corrente PUBLICADO, cobrindo as 21 pessoas de campo
     do elenco fixo do AGENTS.md.
  2. Diário da Obra 22 - MCL de 19/08 FINALIZADO.
  3. Diário da Obra 22 - MCL de 20/08 em RASCUNHO, com pelo menos 4 pessoas
     planejadas para hoje nessa obra. É o diário que vou preencher ao vivo.
  4. NENHUM diário da Obra 25 - ATB em 19/08 — pendência que deve aparecer no
     Painel.
  5. Divergência: o planejamento de 19/08 põe Rafael Duarte na Obra 18 - GFR,
     mas a presença de 19/08 registra Rafael na Obra 22 - MCL. Os dois registros
     coexistem. A divergência é DERIVADA na exibição, nunca gravada.
  6. Israel Fontes com presença em duas obras no mesmo dia e uma única diária
     sem obra definida. O Financeiro precisa decidir qual obra arca.
  7. Ausência do Jonas Ribeiro em 20/08 sem decisão de pagamento.
  8. Adiantamento do Jonas Ribeiro, parcela única.
  9. Empréstimo do Marcos Bittencourt em 4 parcelas, 1 já paga.
 10. Valdir Chagas com saldo devedor MAIOR que o valor do ciclo dele.
 11. Ciclos abertos: semanal em 22/08, quinzenal em 29/08, mensal em 31/08.
 12. As cinco obras com itens de orçamento coerentes com o estado de cada uma.

Dinheiro em inteiro de centavos, sempre. O valor da diária é COPIADO para o
registro no momento da criação, nunca lido do vínculo na exibição.
Nenhum nome fora do elenco fixo.

------------------------------------------------------------------
ITEM 4 — Destravar o fluxo F2 e provar no navegador
------------------------------------------------------------------
A folha de divergência que aparece ao REMOVER alguém planejado do Diário nunca
foi exercitada no navegador. É a Cena 6 da demonstração e é o único caminho sem
prova dentro da cena central.

Com o estado do item 3, execute e relate cada passo:
  1. Abra /obras/22-mcl/diario.
  2. Confirme que o diário chega PRÉ-PREENCHIDO com quem foi planejado.
  3. Remova uma pessoa planejada. A folha de divergência deve abrir, pedir
     confirmação explícita e pedir motivo.
  4. Confirme. Verifique que o registro ORIGINAL do planejamento sobrevive.
  5. Acrescente alguém alocado em outra obra. O aviso aparece SEM revelar qual
     é a outra obra.
  6. Finalize o diário. Presenças e diárias são gravadas.
  7. Volte ao Painel. A lista de pendências muda sozinha.

Se algo falhar, corrija em src/state/. Se a correção exigir mudança em tela,
PARE e reporte com o diagnóstico — a tela é de outro agente.

------------------------------------------------------------------
ITEM 5 — src/state/fechamento.ts · MÓDULO SENSÍVEL
------------------------------------------------------------------
Este é o módulo em que o erro NÃO aparece na tela e aparece semanas depois no
bolso de alguém. Não gere código livremente aqui. Escreva, releia linha a linha,
escreva teste, e explique o raciocínio no relatório.

Funções puras de cálculo do Fechamento:

  ciclosAbertos()
    - fechamento é por CICLO e por PESSOA, nunca globalmente por semana
    - existem ciclos semanal, quinzenal, mensal e por obra simultaneamente

  calcularFechamentoDaPessoa(pessoaId, cicloId)
    - soma as diárias do período, usando o valor CONGELADO em cada diária
    - aplica adicional de sábado, domingo e noturno quando houver
    - desconta adiantamento integralmente
    - desconta a parcela do ciclo no caso de empréstimo
    - o valor a pagar NUNCA é negativo: o saldo devedor rola para o ciclo
      seguinte
    - devolve o extrato linha a linha, não só o total

  pendenciasQueBloqueiam(cicloId)
    - diária sem obra definida (rateio não decidido)
    - ausência sem decisão de pagamento
    - diário não finalizado no período
    - pendência aberta IMPEDE executar o fechamento

  definirObraQueArca(diariaId, obraId)
    - uma pessoa em duas obras no mesmo dia gera N presenças e UMA diária
    - o Financeiro escolhe qual obra arca; a outra fica com custo zero
    - sem rateio proporcional

  executarFechamento(cicloId)
    - trava o período: diário, presença e diária do período tornam-se imutáveis
    - imutável inclusive para Administração
    - registra autor e data

Escreva teste para: pessoa com saldo devedor maior que o ciclo, pessoa com
diária em duas obras, e tentativa de editar diário de período fechado.

------------------------------------------------------------------
ITEM 6 — src/pages/Fechamento.tsx e a rota /financeiro
------------------------------------------------------------------
Esta tela é sua porque ela É o cálculo. Ela vai ficar visualmente crua e tudo
bem — outro agente aplica o design system nela depois. Priorize CORREÇÃO e
CLAREZA, não acabamento.

  - abas por ciclo: semanal, quinzenal, mensal, por obra
  - bloco de pendências que bloqueiam, cada uma com a ação que a resolve
  - tabela por pessoa: nome, diárias, adicionais, descontos, a pagar
  - clicar na linha abre o extrato individual, linha a linha
  - folha de rateio: escolher qual obra arca com a diária
  - folha de ajuste de desconto — nunca permite desconto maior que o proposto
  - botão de executar o fechamento, desabilitado enquanto houver pendência
  - depois de executado, o período aparece travado

Declare a rota /financeiro com handle.perfis contendo apenas Administração e
Financeiro. Como Rafael Duarte, /financeiro deve bloquear com SemAcesso.

Dinheiro sempre em centavos no estado; a formatação é só na exibição.

------------------------------------------------------------------
ACEITE
------------------------------------------------------------------
- tsc --noEmit limpo, npm run build passa
- NENHUMA tela existente alterada
- Os 7 passos do item 4 executados no navegador, com relato
- Testes do item 5 passando
- Executar o fechamento trava o período; o diário do período não edita nem como
  Administração
- Como Rafael Duarte, /financeiro bloqueia
- Os 7 fluxos críticos do AGENTS.md continuam funcionando
- 6 commits, um por item, com push

RELATÓRIO: para cada item, hash, arquivos tocados, o que foi verificado no
navegador. Para o item 5, o raciocínio do cálculo linha a linha. Liste
separadamente tudo que você teve vontade de fazer e não fez por estar fora do
escopo.
````

---

# 7. P1B — O sistema visual da TECTO · Codex · `agente/codex`

`[OPINIÃO]` Se um único prompt do sprint tiver que dar certo, é este. Um
protótipo funcionalmente parcial e visualmente impecável vende melhor que o
inverso — o que está atrás do `EmBreve` ninguém vê, mas a inconsistência aparece
em toda tela.

````
Leia AGENTS.md inteiro antes de começar. Você está na branch agente/codex.

8 itens numerados. Execute na ordem. Um commit por item, e push da sua branch
após cada commit. NUNCA push para master.

Arquivos permitidos: src/components/**, src/pages/**, src/layouts/**,
src/styles/**
Arquivos PROIBIDOS: src/state/** — sem exceção. E src/pages/Fechamento.tsx, que
outro agente está criando neste momento em outra branch.

Se um item exigir campo, entidade ou cálculo que não existe no estado, PARE e
reporte. Não crie o dado. Não escreva o valor no componente. Não remova o bloco.

------------------------------------------------------------------
CONTEXTO — leia antes do item 1
------------------------------------------------------------------
Este projeto nasceu no Figma Make. Consequência: NÃO EXISTE pasta
src/components/. Cada uma das 15 telas desenha seu próprio título de seção, sua
própria formatação de valor, seu próprio avatar e seu próprio cabeçalho de
tabela. O resultado é inconsistente entre telas que mostram o mesmo dado.

Sua tarefa é criar src/components/ e EXTRAIR essas repetições para componentes
únicos, aplicando em todas as telas. Ao final, nenhuma tela desenha nenhum
desses elementos por conta própria.

Isso é refatoração visual, não redesenho. O layout de cada tela permanece.

------------------------------------------------------------------
ITEM 1 — TituloSecao
------------------------------------------------------------------
Hoje os títulos são apenas negrito e se perdem: "pessoas em campo hoje", "obras
em andamento", "diários pendentes", "a fechar essa semana", "precisa da sua
atenção", "quem está onde hoje", "Andamento", "Ambientes", "Último diário",
"Andamento TECTO", "Andamento Geral".

Componente único com mais presença que negrito, explorando o amarelo #FFC213
como PREENCHIMENTO — nunca como cor de texto. Avalie barra de acento à esquerda
ou bloco amarelo pequeno antes do texto. Escolha UM e use o mesmo em todo lugar.

Aplique em todas as telas. Ao terminar, faça grep e confirme que nenhuma tela
desenha título de seção por conta própria.

------------------------------------------------------------------
ITEM 2 — ValorMonetario
------------------------------------------------------------------
O estado guarda dinheiro em INTEIRO DE CENTAVOS. A formatação é só na exibição, e
hoje ela difere entre telas — em alguns lugares o R$ aparece separado do número.

Componente único responsável por:
  - formatar a partir de centavos
  - R$ NUNCA separado do número por quebra de linha
  - numerais tabulares, para as colunas alinharem
  - alinhamento à direita em tabela
  - cor #C94141 para valor negativo
  - comportamento definido em tela estreita

Aplique em todas as telas onde há valor. Ao terminar, faça grep por "R$" e por
toLocaleString em src/pages e src/components: não pode sobrar nenhuma formatação
monetária fora deste componente.

------------------------------------------------------------------
ITEM 3 — Avatar
------------------------------------------------------------------
Hoje todos os avatares são iniciais em cinza e grafite. Fica sem vida.

Avatar ILUSTRADO e DETERMINÍSTICO, derivado do id da pessoa: a mesma pessoa tem
sempre o mesmo retrato, em todas as telas. Gerado por código, sem dependência de
rede.

NUNCA fotografia de pessoa real. Este protótipo pode ser publicado em um link, e
rosto real associado a nome fictício de funcionário cria constrangimento.

Aplique em Painel, Equipe, Diário, Planejamento, Obra e Portal. Inclui
terceirizados.

------------------------------------------------------------------
ITEM 4 — ChipVinculo
------------------------------------------------------------------
Distinguir visualmente os tipos de vínculo. A paleta não tem cores livres:
positivo, atencao, negativo e informativo já carregam significado e não podem ser
reutilizados aqui.

Cinco chips, diferenciados por TRATAMENTO antes de por matiz:
  Funcionário próprio      → sólido escuro, grafite #363636 com texto branco
  Terceirizado             → vazado, borda com fundo transparente
  Administração            → violeta suave
  Gerência                 → cinza claro
  Administrativo/Marketing → terracota

Aplique em Equipe, Diário e Planejamento.

------------------------------------------------------------------
ITEM 5 — CabecalhoTabela
------------------------------------------------------------------
Cabeçalho único em Inter Semibold, caixa alta, letterspacing 0.08em.
Aplicar em todas as tabelas.

Regra: caixa alta NUNCA em texto longo nem em dado de célula. Só em rótulo.

------------------------------------------------------------------
ITEM 6 — DataComDiaSemana
------------------------------------------------------------------
Hoje o dia da semana aparece em peso secundário e se perde.
Formato: "20 de agosto · quinta-feira", com o dia da semana legível à distância
sem competir com a data.

Aplique em cartões de diário, cabeçalho do Diário, Planejamento e Portal.

------------------------------------------------------------------
ITEM 7 — Imagem do Login
------------------------------------------------------------------
A metade esquerda de /entrar está vazia ou com imagem inadequada.

Preencha com uma composição coerente com reforma residencial. Se não houver
imagem no repositório, construa uma composição gráfica em CSS ou SVG com os
tokens da marca — bloco amarelo, grafite, geometria de planta baixa.
NÃO busque imagem na internet e NÃO use foto com rosto de pessoa.

O logo precisa ficar legível sobre ela. Verifique em 1440px.

------------------------------------------------------------------
ITEM 8 — /design-system
------------------------------------------------------------------
A página passa a exibir os seis componentes criados, com todos os estados de
cada um. É a referência de quem entrar no projeto depois.

------------------------------------------------------------------
ACEITE — verificável por outra pessoa
------------------------------------------------------------------
- Existe src/components/ com os seis componentes
- Nenhum R$ separado do número em nenhuma tela
- Nenhuma formatação monetária fora do ValorMonetario (comprovar por grep)
- Nenhum título de seção desenhado fora do TituloSecao (comprovar por grep)
- Toda pessoa com o mesmo retrato em todas as telas
- Amarelo #FFC213 não aparece como cor de texto em lugar nenhum
- /design-system mostra os seis
- tsc --noEmit limpo e npm run build passa
- Nenhuma tela mudou de LAYOUT — só de tratamento visual

------------------------------------------------------------------
VERIFICAÇÃO EM NAVEGADOR — obrigatória, entre cada item
------------------------------------------------------------------
Depois de CADA item, abra e confira: Painel, Obra 22 visão geral, Planejamento,
Diário, Equipe, Portal. Em 390px, 800px e 1440px.
Nos perfis Pedro Almeida, Rafael Duarte e Mariana Costa Lima.

tsc não basta. Dois bugs deste repositório só apareceram clicando.

RELATÓRIO: para cada item, hash, quantos arquivos foram tocados, quais telas
foram verificadas. Liste separadamente qualquer inconsistência que você encontrou
e NÃO corrigiu por estar fora do escopo.
````

---

# 8. Merge do degrau 1

```bash
git checkout master
git merge agente/code      # src/state/** e Fechamento.tsx
git merge agente/codex     # src/components/** e as demais telas
npm run build
git push
```

Conflito, se houver, será em `docs/ESTADO_DO_PROTOTIPO.md` — os dois escrevem
nele. Resolva mantendo as duas listas.

**Antes de subir para o degrau 3, rode uma vez inteira:** Login como Pedro →
Painel → Planejamento → Diário da Obra 22 → remover alguém → confirmar
divergência → finalizar → voltar ao Painel → Portal como Mariana → Fechamento.

Se essa sequência rodar limpa, você já tem uma demonstração que se sustenta
sozinha. Tudo a partir daí é ganho.

---

*TECTO — Sprint Final do Protótipo v2 · 28/08/2026*
*Escada de prioridade, não lista de cortes. O roteiro se decide no fim.*
