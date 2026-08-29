# Relatório — Reparos para destravar a T4

O Codex reportou onze bloqueios ao tentar executar a T4. Verifiquei os onze
contra o código: **todos procedem**. Este relatório registra o que foi
construído para destravá-los, e o que sobrou.

Branch `agente/code`, quatro commits.

## Commits

| hash | reparo |
|---|---|
| `8530465` | A — identidade na sessão, com a camada `Usuario` do `INV-01` |
| `27b29a0` | B — destinatário e leitura de notificação por perfil (`Q-027`) |
| `ef6ff10` | C e D — gravação de mídia com ambiente, e entidade `Documento` |
| `43b3b85` | E, F e G — três `RN` novas, `Q-027` respondida, nome do inventário |

**80 testes, 0 falhas.** `tsc --noEmit` limpo, `npm run build` passa.
Nenhum arquivo fora de `src/state/` e `docs/` foi tocado.

---

## Duas coisas que o relatório dele não viu

**O item 5 da T4 era da T6.** O runbook pedia ao Codex, na T4, filtrar notas em
`/obras/:obraId/financeiro` e documentos em `/obras/:obraId/documentos` — duas
rotas ainda em `EmBreve` que a **T6 vai criar**. Era decorar um cômodo antes de
construí-lo, e é a causa real dos bloqueios 5 e 6 da lista dele. O item foi
cortado da T4 e volta inteiro na T6.

**O bloqueio 9 estava mal classificado.** A §7 do `ABERTO.md` diz de si mesma:
*"Não são perguntas do cliente — são buracos na própria documentação. Precisam
virar `RN`."* Não é a tabela de proibições da §2. As duas lacunas já estavam
implementadas por mim; faltava escrevê-las como regra. Feito no reparo E.

---

## Reparo A — identidade na sessão

O que faltava não era um valor escrito no código a ser movido: era a **camada de
credencial que o `INV-01` exige e que não existia**. O glossário define Usuário
como "credencial de acesso ao sistema, ligada a uma Pessoa".

A sessão guardava só o perfil, e perfil não é identidade — dois gerentes têm o
mesmo perfil e obras diferentes. Daí o `PortalLayout` ter o nome do cliente
escrito no código e as três páginas do Portal fixarem `o01`.

Coleção `usuarios` com os quatro do Login, `usuario_ativo_id` na sessão, e
`src/state/sessao.ts` com as funções puras:

| Função | Devolve |
|---|---|
| `usuarioAtivo` | o `Usuario` logado |
| `pessoaAtiva` | a `Pessoa` por trás da credencial — perfis internos |
| `obraDoClienteAtivo` | a Obra do Cliente logado |
| `obrasDoGerenteAtivo` | as obras que o Gerente gerencia |
| `nomeDoUsuarioAtivo` | o nome, derivado de `Obra.cliente` para o Cliente |
| `iniciaisDoUsuarioAtivo` · `chaveDeAvatarDoUsuarioAtivo` | para o `Avatar` |

Há teste que renomeia o cliente da obra e confirma que o nome exibido acompanha
— é o que prova que nada ficou escrito no código.

### O desvio consciente, e por que não corrigi agora

O glossário faz do Cliente uma Pessoa: ele tem Usuário, e Usuário é ligado a
Pessoa. Mas `Obra.cliente` é um nome em texto, e acrescentar os cinco clientes a
`pessoas` faria o Painel exibir **"38 com vínculo ativo"** quando só 33 têm
vínculo — porque `PainelDoDia.tsx:115` conta `pessoas.filter(ativo)` sob esse
rótulo. É uma tela do outro agente, e eu causaria uma regressão visível na
primeira tela da demonstração para corrigir uma modelagem que ninguém vê.

Ficou registrado como pendência em `docs/DECISOES.md`, com o caminho: tornar o
Cliente uma Pessoa, criar `Obra.cliente_pessoa_id`, e corrigir a contagem do
Painel. É uma tarefa só, e das duas pontas.

---

## Reparo B — notificações (`Q-027`)

`Notificacao` trocou `lida: boolean` por dois campos:

```
destinatario_perfis: TipoPerfil[]   quem deve ver
lida_por: TipoPerfil[]              quem já leu
```

`lida_por` é lista por um motivo concreto, que o Codex levantou: com um booleano,
**o Pedro abrir o painel zeraria o contador do Rafael**, que nunca viu o aviso.
Há teste exatamente disso.

As sete notificações foram endereçadas a quem **age** sobre o fato: rateio para o
Financeiro (`RN-087`), diário faltando para o Gerente que precisa preenchê-lo,
decisão de pagamento para a Administração. Nenhuma vai para o Cliente —
notificação interna é operação da TECTO, e a `RN-136` o mantém fora.

`src/state/notificacoes.ts`: `notificacoesDoPerfil`, `naoLidasDoPerfil`,
`contarNaoLidas`, `foiLidaPor`, `marcarComoLidas`. No store,
`marcarNotificacoesComoLidas`, que marca só o perfil ativo.

**Por perfil e não por Usuário** — no sistema real o destinatário é o Usuário,
porque é ele que tem credencial. A maquete tem um Usuário por perfil, e modelar
por Usuário aqui só acrescentaria indireção sem mudar nada do que se vê.
Registrado com essa ressalva.

---

## Reparo C — mídia com ambiente

`criarMidia` **recusa** sem ambiente, e recusa ambiente que não seja da obra —
trocar de obra no formulário sem trocar o ambiente é o erro fácil de cometer, e
deixaria a foto num álbum que não é o dela.

`finalizarDiario` ganhou um parâmetro `midias` opcional, com ambiente. Quando
vem preenchido, **ele é a fonte**: `Diario.fotos` passa a ser derivada dele e os
registros de `midias` são criados junto. As duas representações da mesma foto não
têm como divergir. Sem o parâmetro, o comportamento é o de antes.

Para a tela de Fotos: `midiasPorData`, `midiasDoAmbiente` e `ambientesComMidia`,
que devolve só os ambientes que têm foto, para o filtro não oferecer opção vazia.
**O filtro deixa de ser decorativo.**

---

## Reparo D — `Documento`

Projetos e contratos, com tipo e especialidade. 16 documentos nas cinco obras.

**Nota fiscal não entra em `Documento`.** Ela já vive em `custos_obra`, pelo
`tipo_documento_id`, porque a nota é sempre a nota **de** alguma coisa. Separá-la
criaria duas verdades sobre o mesmo papel. `src/state/documentos.ts` serve as
duas listagens da T6 e deixa a diferença explícita: `documentosPorEspecialidade`
de um lado, `notasPorTipo` do outro.

---

## Reparos E, F e G — documentação

**Três `RN` novas**, fechando as lacunas da §7 do `ABERTO.md`:

| Regra | O que fixa |
|---|---|
| `RN-081` | toda mídia é classificada por Ambiente, obrigatoriamente |
| `RN-128` | Especialidade é catálogo fechado, atributo do serviço de terceiro |
| `RN-133b` | Tipo de Documento é catálogo em dois níveis |

As três já estavam implementadas. O que faltava era escrevê-las — e sem isso, o
próximo agente pararia no mesmo lugar que o Codex parou.

**`Q-027` respondida** no `PRODUTO.md`, apontando para a decisão no
`DECISOES.md`, sem duplicar o conteúdo nos dois arquivos.

**O nome do inventário.** `AGENTS.md` e `EXECUCAO.md` citavam `docs/ESTADO.md`
em cinco lugares — um arquivo que nunca existiu. Passaram a citar
`docs/ESTADO_DO_PROTOTIPO.md`. Os achados A1 e A2 do inventário foram marcados
como resolvidos.

---

## O que sobrou para o Codex, e o que sobrou para depois

**Destravado, e agora é dele:**

- painel de notificações, com contador por perfil que zera ao abrir;
- ambiente obrigatório ao enviar mídia;
- remover o nome do cliente do `PortalLayout` e a obra `o01` das três páginas do
  Portal;
- a tela de Fotos passar a ler `midias` com filtro por ambiente que funciona.

**Continua pendente, e não é da T4:**

1. **O Cliente ainda não é Pessoa.** Motivo e caminho no `DECISOES.md`.
2. **`PainelDoDia.tsx:115` conta pessoas sob o rótulo "com vínculo ativo".**
   Hoje o número está certo por coincidência. É o que impede o item 1.
3. **As rotas `/obras/:obraId/financeiro` e `/obras/:obraId/documentos`
   continuam em `EmBreve`.** Trocar é uma linha em `src/routes.ts`, e faz
   sentido na T6, quando as telas existirem.
4. **`Lancamento.parcelas` e `parcelas_pagas` seguem redundantes** com a coleção
   `parcelas`.
5. **Não há runner de teste.** São 80 testes em cinco arquivos, executados por
   compilação. Virar `npm test` exige autorização para mexer no `package.json`.
