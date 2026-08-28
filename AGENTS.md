# TECTO — Contrato de agentes

Este arquivo governa **qualquer agente** que trabalhe neste repositório: Claude
Code, Codex, ou outro. Leia inteiro antes da primeira alteração, em toda sessão
nova.

Se você é o Claude Code, leia também o `CLAUDE.md` depois deste.

---

## 1. O que é este repositório

Protótipo navegável de um sistema de gestão de obras para uma empresa de reformas
de apartamentos em São Paulo. **React · Vite · TypeScript · Tailwind.** Nasceu no
Figma Make, foi exportado e migrado para desenvolvimento local.

**É maquete, não produto.** Não há back-end, autenticação real nem `tenant_id`. O
estado é um módulo em memória em `src/state/store.ts`.

**Existe para sustentar uma demonstração comercial**, na qual se negocia o
contrato de desenvolvimento do sistema real. Qualidade visual e continuidade
ponta a ponta entre telas são requisitos, não detalhes. Uma tela com clique morto
ou número inconsistente custa mais que uma tela que não existe — porque o que
está atrás de `Em breve` ninguém vê.

---

## 2. Precedência das fontes

Do mais forte ao mais fraco. Em conflito, o mais forte vence e você **para e
reporta** em vez de escolher.

| # | Fonte | O que é |
|---|---|---|
| 1 | `INV-01` a `INV-10` em `docs/PRODUTO.md` | Invariantes arquiteturais. Não se contornam. |
| 2 | `RN-XXX` em `docs/PRODUTO.md` | Regras de negócio fechadas. |
| 3 | Instrução explícita do Mestre no prompt da tarefa | Vale para a tarefa corrente. |
| 4 | Este arquivo e o `CLAUDE.md` | Regras operacionais do protótipo. |
| 5 | `docs/ESTADO.md` | Inventário do que existe. |
| 6 | `docs/HANDOFF.md`, `docs/SPRINT.md` | Contexto e backlog. |

**`docs/ABERTO.md` não é fonte — é lista de proibições.** Se a sua tarefa depende
de um item de lá, você **para e reporta**. Não decide.

---

## 3. Mapa de leitura

Não leia tudo. Leia o que a sua tarefa pede.

| Sua tarefa toca… | Leia |
|---|---|
| Qualquer coisa | Este arquivo, inteiro |
| Cálculo, dinheiro, fechamento, permissão | `docs/PRODUTO.md` — seções 3, 8, 10.2, 12 |
| Uma tela específica | `docs/HANDOFF.md` §9, o apontamento correspondente |
| Saber o que já existe | `docs/ESTADO.md` |
| Saber o que vem depois | `docs/SPRINT.md` §2 — escada de prioridade |
| Saber por que a tela existe | `docs/ROTEIRO.md` — a cena que ela sustenta |
| Uma decisão que parece faltar | `docs/DECISOES.md` primeiro; se não estiver lá, `docs/ABERTO.md`; se estiver em nenhum, **pare e pergunte** |

**Nunca leia:** a seção comercial do Documento Canônico original — valor de
contrato, condições de pagamento, cláusula de propriedade intelectual. Ela foi
deliberadamente deixada fora de `docs/PRODUTO.md` e não entra em nenhum prompt.

**Onde há cópia, este arquivo prevalece.** O elenco fixo, os tokens e os perfis
aparecem também no `docs/HANDOFF.md` §6, que é registro histórico. Se divergirem,
vale o que está aqui.

---

## 4. Circuit breakers

Repetidos aqui de propósito. Violar qualquer um custa migração de dados no
sistema real, ou uma demonstração quebrada no protótipo.

- **Dinheiro é inteiro em centavos.** `valor_centavos: 14832000`. Formatação só
  na exibição. Nunca float, nunca decimal implícito, em nenhuma camada.
- **Domínio em português, exatamente como no glossário.** É `obra`, não
  `project`. É `ambiente`, não `room`. É `diaria`, não `daily_rate`. Nunca criar
  sinônimo: se o glossário diz `Vínculo`, não existe `contrato_trabalho`,
  `alocacao` nem `funcionario_ativo`.
- **Nada escrito no código.** Nenhuma tela pode ter número, total, percentual ou
  nome fixo no componente. Se o dado não existe no estado, **pare e reporte**.
  Não remova o bloco. Não escreva o valor. Não invente a entidade sem autorização.
- **Cálculo em função pura**, em `src/state/`. Nunca dentro do componente.
- **Sem DELETE.** Desativação lógica (`desativado_em`) para cadastro; estorno para
  financeiro. Nunca `UPDATE` destrutivo em registro financeiro.
- **Valor congelado.** Todo registro financeiro copia o valor no momento do fato.
  Nunca faz JOIN com o cadastro para descobrir "quanto essa pessoa ganha".
- **Guarda de permissão em um lugar só.** Controle por declaração em
  `handle.perfis`, verificado por `GuardaPerfil`. Rota sem perfil declarado é
  negada. Duas camadas checando a mesma coisa criam uma que nunca roda — este
  repositório já teve esse bug.
- **Data sempre coerente com o dia da semana.** Ver §6.
- **Nunca `useEffect` para gravar estado derivado.** Derive na renderização ou em
  `useMemo`. Este repositório já teve um loop infinito por causa disso, herdado do
  commit inicial do gerador.

---

## 5. Fronteira entre os agentes

> **O Claude Code escreve funções. O Codex chama funções.**

O critério não é "principal contra secundário". É **erro silencioso contra erro
visível**.

| Diretório | Claude Code | Codex |
|---|---|---|
| `src/state/**` | Exclusivo | **Proibido** |
| `src/components/**` | Só se o componente contiver cálculo | Principal |
| `src/pages/**` | Só quando a tela **é** o próprio cálculo | Principal |
| `src/layouts/**` | Só guarda de permissão | Principal |
| Dados semeados | Exclusivo | **Proibido** |
| `docs/**` | Quem fecha a tarefa atualiza | Idem |

**Claude Code** — entidades e campos · funções puras de cálculo · fechamento,
diária, estorno, rateio · andamento e indicadores · guardas de permissão e
visibilidade do Cliente · funções de mutação (`criarObra`, `criarPessoa`) · dados
semeados.

**Codex** — componentes visuais compartilhados · aplicação tela a tela ·
formulários que chamam funções prontas · estados vazios · responsividade ·
rótulos, hierarquia, filtros, abas.

**Nunca os dois na mesma árvore de trabalho ao mesmo tempo.** Branch por agente,
merge feito pelo Mestre.

### Módulos de cautela redobrada

Nestes, o erro **não aparece na tela** — aparece semanas depois no bolso de
alguém. Não gere código livremente. Escreva, releia linha a linha, escreva teste,
e explique o raciocínio no relatório:

Fechamento e cálculo de Diária · rateio de Diária entre Obras · Adiantamento,
Empréstimo e saldo devedor · Estorno · regras de visibilidade do Cliente.

Nos demais — cadastros, telas, upload, relatórios, portal — o erro é visível e
barato. Pode gerar com liberdade.

---

## 6. Fatos fixos do protótipo

### Data de referência

Hoje é **quinta-feira, 20/08/2026**. Semana corrente: segunda 17/08 a sábado
22/08. Toda data exibida ou semeada deriva disso e precisa bater com o dia da
semana.

### Elenco fixo — não inventar nomes, não trocar funções

**Gestão:** Pedro Almeida (Administração) · Fernando Nunes (Administração) ·
Fernanda Sousa (Financeiro) · Rafael Duarte (Gerente de Obras) · Sofia Monteiro
(Gerente de Obras) · Ana Carvalho (Assistente de Gerenciamento)

**Campo:** Marcos Bittencourt, Adilson Prado, Edmilson Vieira, Claudinei Sartori
(pedreiros) · Nilton Barreto, Reinaldo Peçanha (azulejistas) · Sebastião Nóbrega,
Otávio Bonfim (pintores) · Jonas Ribeiro, Valdir Chagas, Israel Fontes, Josimar
Andrade, Ubiratan Coelho, Genivaldo Reis (ajudantes) · Erasmo Peixoto, Belarmino
Souza, Osmar Cavalcante, Osvaldo Ramalho, Deusdete Farias, Anselmo Freitas,
Nazareno Correia, Wanderley Prazeres, Anísio Trindade

**Terceirizados:** Cleber Matos, Dorival Assunção (eletricistas) · Tarcísio Melo
(gesseiro) · Rogério Pastore (encanador)

**Inativo:** Wagner Lopes (pintor, desativado em 12/06/2026)

**Obras:** Obra 22 - MCL (Mariana Costa Lima) · Obra 18 - GFR (Guilherme F.
Rocha) · Obra 25 - ATB (Antônia T. Bicalho) · Obra 31 - MBP (Miguel Barros Pinto)
· Serviço 04 - LSM (Luciana S. Medeiros, pequeno serviço)

O código da obra deriva das iniciais do cliente; o slug da rota deriva do código.

### Perfis e visibilidade

| Perfil | Usuário de demonstração | Acesso |
|---|---|---|
| Administração | Pedro Almeida | Tudo |
| Financeiro | Fernanda Sousa | Tudo |
| Gerente de Obras | Rafael Duarte | `/`, `/obras`, `/planejamento`, `/equipe` e obras vinculadas |
| Cliente | Mariana Costa Lima | Apenas `/portal` e sub-rotas |

- Gerente **nunca** vê valor de orçamento, custo, margem nem diária. Não vê
  `/obras/:obraId/financeiro`. Só enxerga obras em `vinculos_obra`.
- Cliente **nunca** vê diária, salário, custo de terceirizado, margem, percentual
  aplicado nem contato de fornecedor.
- Perfil sem acesso vê `SemAcesso`. Nunca redirecionamento silencioso.
- **Exceção:** Cliente acessando `/` vai para `/portal`. Isso é roteamento de
  entrada, não permissão.
- Visitante **não logado** vai para `/entrar`, nunca para `SemAcesso`.

### Design tokens

| Token | Hex | Token | Hex |
|---|---|---|---|
| acento | `#FFC213` | positivo | `#2E9E5B` |
| acento-fundo | `#FFF6D6` | atencao | `#E8833A` |
| tinta | `#000000` | negativo | `#C94141` |
| grafite | `#363636` | neutro | `#9A9A9A` |
| tinta-fraca | `#666666` | informativo | `#215FD7` |
| borda | `#E6E6E6` | informativo-fundo | `#E7F1FF` |
| fundo | `#FAFAFA` | superficie | `#FFFFFF` |

**Regras de cor:**

1. Amarelo `#FFC213` **nunca** é cor de texto, ícone pequeno ou link. É sempre
   preenchimento, com texto preto por cima. Amarelo sobre branco dá contraste de
   1.6:1; preto sobre amarelo, 13:1. A regra veio do logo, que é um bloco amarelo
   com texto preto.
2. Amarelo é exclusivo de: marca, botão primário, aba ativa, barra de progresso e
   célula "Em aberto" do Planejamento. **Nunca para alerta** — alerta usa
   `#E8833A`.
3. Item de menu selecionado usa fundo grafite `#363636` com texto branco.

**Tipografia:** Space Grotesk nos títulos, Inter no corpo e dados. Labels em Inter
Semibold, caixa alta, letterspacing 0.08em — nunca em texto longo nem em dado de
tabela. Valores monetários em numerais tabulares, alinhados à direita.

Escala: Display 32/40 · Título 24/32 · Subtítulo 18/26 · Corpo 15/22 · Apoio
13/18 · Label 11/16 caixa alta.

---

## 7. Fluxos críticos

Estes funcionam e **não podem regredir**. Qualquer alteração que quebre um deles
é revertida antes de seguir.

| # | Fluxo |
|---|---|
| **F1** | Planejamento → Diário → Presença → Diária → Fechamento |
| **F2** | Divergência planejado × realizado, com confirmação explícita e sem revelar a outra obra |
| **F3** | Checklist → Andamento → Carteira → Portal |
| **F4** | Pendências derivadas do Painel, nunca escritas |
| **F5** | Rateio de diária: N presenças, UMA diária, o Financeiro escolhe a obra |
| **F6** | Imutabilidade pelo Fechamento, inclusive para Administração |
| **F7** | Permissão por perfil |

---

## 8. Verificação

**`tsc --noEmit` não é verificação.** Dois bugs deste repositório só apareceram
clicando: uma guarda de permissão inalcançável e presenças apontando para o
`diario_id` do dia anterior.

Toda tarefa termina com verificação em navegador:

- Em **390px, 800px e 1440px**.
- Nos perfis **Pedro Almeida, Rafael Duarte e Mariana Costa Lima**, no mínimo.
- Percorrendo os fluxos críticos que a tarefa pode ter afetado.

Se você não tiver ferramenta de navegador na sessão, **diga isso explicitamente
no relatório** e marque cada item como verificado por leitura de código, com
arquivo e linha. Nunca afirme ter verificado visualmente o que não clicou.

---

## 9. Como fechar uma tarefa

1. **Um commit por item numerado** do prompt. Nunca um commit único no fim.
2. **Push da sua branch após cada commit. NUNCA push para `master`.** O merge é
   do Mestre.
3. **Não fabrique commit vazio** para bater um número de itens. Se um item não
   exigiu mudança, diga isso.
4. **Atualize `docs/ESTADO.md`** no último commit, com o que passou a existir.
5. **Escreva o relatório em `docs/relatorios/<tarefa>.md`**, no formato da §10.
6. **Se uma decisão nova foi tomada**, registre em `docs/DECISOES.md` antes de
   encerrar. Decisão não registrada volta a ser discutida noutra sessão, com
   resposta diferente — é o principal risco de um projeto tocado por vários
   agentes.

---

## 10. Formato do relatório

```
## Commits
| hash | item | arquivos tocados |

## Item a item
O que foi feito, o que foi verificado, e como foi verificado.

## O que eu decidi por conta própria
Toda escolha que o prompt não determinava.

## O que eu não fiz e por quê
Tudo que estava fora do escopo, e tudo que eu tive vontade de corrigir e não
corrigi.

## Achados
Qualquer coisa estranha encontrada e não mexida — com arquivo e linha.
```

O relatório é para uma pessoa que não acompanhou a execução. Escreva para ela.

---

## 11. Regra de parada

Você **para e reporta**, sem tentar resolver, quando:

- a tarefa exige um campo, entidade ou cálculo que não existe no estado;
- a tarefa depende de um item de `docs/ABERTO.md`;
- uma instrução do prompt contraria um `INV` ou uma `RN`;
- você encontraria duas fontes divergindo sobre o mesmo fato;
- a correção do seu escopo exigiria tocar arquivo de outro agente.

Parar é resultado válido. Resposta plausível e errada, num projeto que vai rodar
folha de pagamento, é o pior defeito possível.
