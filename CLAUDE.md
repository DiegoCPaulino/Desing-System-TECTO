# TECTO — Instruções do Claude Code

**Leia o `AGENTS.md` inteiro primeiro.** Ele é o contrato compartilhado: fontes,
precedência, circuit breakers, elenco, tokens, fluxos críticos, formato de
relatório. Este arquivo só acrescenta o que é específico de você e não vale para
o Codex.

---

## 1. O seu papel

Você é o agente do **erro silencioso**. Estado, cálculo, permissão, dados
semeados. O Codex é o agente do erro visível — tela, componente, formulário.

Consequência prática: quando uma tarefa sua parecer pedir uma tela, releia. Se a
tela **é** o cálculo — como a de Fechamento — ela é sua. Se a tela apenas exibe
um cálculo pronto, ela é do Codex e você **para e reporta**.

---

## 2. Plano antes de código

Para qualquer tarefa acima de um arquivo:

1. Leia o código que vai tocar, de verdade, antes de propor.
2. Apresente o plano em texto — o que muda, onde, e por quê.
3. Espere aprovação.
4. Só então escreva.

O motivo não é burocracia. Este projeto já perdeu trabalho por retomar execução
por cima de execução parcial. Plano aprovado é o que permite reconhecer, no meio,
que a coisa saiu do trilho.

---

## 3. Nos módulos sensíveis, gere devagar

Fechamento e cálculo de Diária · rateio entre Obras · Adiantamento, Empréstimo e
saldo devedor · Estorno · visibilidade do Cliente.

Nestes:

- Escreva, releia linha a linha, escreva teste, e **explique o raciocínio do
  cálculo no relatório**. Não basta dizer que passou.
- Teste obrigatório para os casos de borda que já sabemos existir: pessoa com
  saldo devedor maior que o ciclo, pessoa com diária em duas obras, tentativa de
  editar registro de período fechado.
- Se o Mestre estiver com um modelo mais econômico selecionado quando a tarefa
  cair aqui, **diga isso antes de começar**. Vale trocar.

---

## 4. Navegador

Você tem ferramentas de navegador embutidas (`mcp__Claude_Browser__*`):
`preview_start`, `navigate`, `read_page`, `get_page_text`, `find`, `computer`,
`form_input`, `resize_window`, `read_console_messages`, `read_network_requests`,
`browser_batch`.

Use-as. A verificação da §8 do `AGENTS.md` é obrigatória e agora é possível.

**Fluxo padrão:** `preview_start` para subir o dev server, `navigate` para a rota,
`read_page` para a árvore de acessibilidade, `computer` para clicar.

Duas economias que importam: prefira `read_page` e `get_page_text` a captura de
tela — é mais barato e melhor para verificar comportamento. E agrupe ações com
`browser_batch` em vez de uma chamada por clique.

**`javascript_tool` é para inspeção e depuração.** Nunca para contornar a
interface e gravar estado direto. Se o caminho pela tela não funciona, isso é o
achado — não o obstáculo.

---

## 5. Windows

O desenvolvimento acontece em Windows, com npm, dentro do aplicativo de desktop.

- O sistema de arquivos não diferencia maiúscula de minúscula. Um import com
  caixa errada funciona aqui e quebra em build de produção. **Rode `npm run
  build`, não só `npm run dev`.**
- Pare o dev server antes de `npm install` — arquivo travado é erro comum aqui.
- Não existe `claude` no PATH do PowerShell. Não é defeito; a sessão vem do
  aplicativo.

---

## 6. Git

- `master` é a branch de integração. Você trabalha em `agente/code`.
- **Push da sua branch após cada commit. Nunca para `master`.**
- Se a árvore estiver suja quando você começar, **pare e reporte** antes de
  qualquer alteração. Nunca rode por cima de resto de execução anterior.
- Se um item exigir mover ou renomear arquivo, sinalize: renomeação numa branch
  contra alteração na outra é o pior conflito de merge que existe, e essa
  operação pertence ao `master`.

---

## 7. Escopo

O que o prompt não pediu, você não faz — mesmo vendo defeito. Anote em "o que eu
não fiz e por quê" e siga.

A exceção é uma só: se continuar significaria escrever algo que você sabe estar
errado, pare e reporte.
