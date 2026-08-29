# TECTO — Perguntas em aberto

> **Este arquivo não é fonte de verdade. É lista de proibições.**
>
> Se a sua tarefa depende de um item daqui, você **para e reporta**. Não escolhe
> a opção mais razoável, não implementa "só por enquanto", não deduz a partir de
> uma tela existente.
>
> Nada aqui se resolve dentro do repositório. Estas perguntas pertencem ao
> Mestre, e a maioria delas ao cliente — Pedro decide sobre empresa e financeiro,
> Fernando sobre operação de obra e cronograma.

Quando uma pergunta for respondida, ela sai daqui e entra em `docs/DECISOES.md`
ou em `docs/PRODUTO.md`, conforme o caso. **Nunca nos dois.**

---

## 1. Como o protótipo trata uma pergunta aberta

Há três saídas legítimas, em ordem de preferência:

1. **Não construir.** O módulo fica atrás de `Em breve`. É honesto; meio
   construído parece quebrado.
2. **Construir a estrutura sem afirmar a regra.** Mostra-se a forma —
   lista, colunas, estados — sem assumir periodicidade, fórmula ou vínculo que
   ninguém decidiu. Exemplo em uso: a aba "Por obra" do Fechamento exibe
   pagamentos com obra, pessoa, valor e situação, e **não** afirma quando nem
   como o Gerente recebe.
3. **Decidir só para o protótipo**, registrando em `docs/DECISOES.md` com a marca
   `[SÓ PROTÓTIPO]`. Essa decisão **nunca** entra em `docs/PRODUTO.md` sem passar
   por Pedro e Fernando.

A saída ilegítima é a quarta: implementar como se estivesse decidido. É assim que
uma conveniência de tela vira regra de negócio sem ninguém perceber.

---

## 2. Bloqueiam schema — nada que dependa disto se implementa

| Código | Pergunta |
|---|---|
| `Q-001` | O valor fixo por Obra do Gerente varia conforme duração ou porte? Obra de dois meses e de oito pagam o mesmo? |
| `Q-002` | Quando o Gerente recebe pelo valor da Obra — parcelado enquanto a obra corre, ou por marco de execução? |
| `Q-003` | Gerente com cinco obras recebe cinco pagamentos em datas diferentes, ou um consolidado? |
| `Q-004` | Qual o regime de remuneração do Assistente de Gerenciamento — diária, valor por obra ou salário fixo? |
| `Q-005` | As parcelas de contrato de Terceirizado são por data fixa ou por etapa concluída? Se por etapa, quem confirma — Gerente ou Administração? |
| `Q-006` | Terceirizado que trabalha por Diária entra no Planejamento e aparece no Diário como os demais? |
| `Q-007` | Existe limite de valor para Adiantamento e Empréstimo? |
| `Q-008` | Fechamento de R$800 com dívida de R$1.000: recebe zero e carrega R$200, ou desconta parcialmente por acordo? |
| `Q-010` | Quando o Financeiro escolhe qual Obra arca com a Diária, a outra registra presença com custo zero, ou há rateio proporcional? |
| `Q-011` | Ambiente é catálogo global reutilizável ou é criado dentro de cada Obra? |
| `Q-012` | O Andamento Geral reutiliza os Ambientes do Orçamento TECTO, ou o Gerente cria estrutura própria? |
| `Q-013` | Um item do Checklist pode voltar de concluído para pendente, em caso de retrabalho? |
| `Q-014` | Um Orçamento Adicional aprovado pode ser cancelado? O que acontece com os itens já no Checklist? |
| `Q-015` | Quando a tabela de preços muda, orçamentos em Rascunho atualizam ou congelam no preço de criação? |

## 3. Bloqueiam fluxo

| Código | Pergunta |
|---|---|
| `Q-020` | Quem publica o Planejamento semanal — Administração ou Gerente? |
| `Q-021` | O Planejamento pode ser republicado várias vezes na semana, ou é publicação única com alterações por cima? |
| `Q-022` | O que acontece se o Gerente não preencher o Diário de um dia? Alguém é notificado? Trava o Fechamento? |
| `Q-023` | Existe prazo-limite para finalizar um Diário? Pode ser finalizado uma semana depois? |
| `Q-024` | Quem finaliza o Diário — apenas o Gerente, ou o Assistente também? |
| `Q-025` | Como o Cliente aprova o Orçamento, já que não aprova pelo sistema? Precisa anexar evidência? |
| `Q-026` | O que define uma Obra concluída — Checklist em 100% ou decisão manual da Administração? |
| `Q-028` | Fotos e vídeos são armazenados no original ou comprimidos? Qual o horizonte de retenção? |

## 4. Financeiro e gestão

| Código | Pergunta |
|---|---|
| `Q-030` | Quais são as categorias de despesa da empresa? **Parcialmente respondida:** ferramentas e máquinas, uniforme, marketing e tráfego pago. Faltam as demais. |
| `Q-031` | Despesa geral da empresa é rateada entre obras ou fica em categoria separada? Afeta o cálculo da margem. |
| `Q-032` | Quais indicadores o dashboard executivo precisa mostrar, em ordem de importância? |
| `Q-033` | Receita é valor contratado ou recebido? Despesa é lançada ou paga? |

## 5. Segurança e LGPD

| Código | Pergunta |
|---|---|
| `Q-040` | Quem pode ver as fotos dos documentos pessoais — apenas Administração e Financeiro? |
| `Q-041` | A sessão expira? Em quanto tempo? |
| `Q-042` | Administração e Financeiro terão segundo fator de autenticação? |
| `Q-043` | Por quanto tempo os documentos de uma Pessoa desativada são retidos? |

---

## 6. Decisões do Mestre ainda pendentes

| Código | Pergunta | Situação |
|---|---|---|
| `D5` | Cores por tipo de vínculo, sem colidir com `positivo`, `atencao`, `negativo` e `informativo` | **Proposta em `DECISOES.md`, aguardando uso** |
| `D6` | A observação sobre "FIXO" ficou sem texto no pedido original | **Interpretada** como o rótulo "Fixo" que deveria ser "R$". Confirmar. |

---

## 7. Lacunas encontradas no Documento Canônico

Não são perguntas do cliente — são buracos na própria documentação, achados
durante a prototipação. Precisam virar `RN`.

1. **Campo de função da Pessoa.** A `RN-135` promete ao Cliente ver a *função*
   das pessoas que trabalharam, mas nenhuma `RN` cria esse campo. Tipo de Vínculo
   (`Funcionário próprio`) não é função (`Pedreiro`). Hoje o protótipo exibe
   função sem que ela exista formalmente no modelo.

2. **Recorte de quem aparece no Planejamento.** A `RN-052` exige que toda Pessoa
   com Vínculo ativo apareça no Planejamento da semana, mas Administração e
   Financeiro não vão a obra. Falta o recorte explícito.

3. ~~**Classificação de mídia por Ambiente.**~~ **FECHADA** — virou a `RN-081`.

4. ~~**Taxonomia de especialidade e tipo de documento.**~~ **FECHADA** — virou a
   `RN-128` para Especialidade e a `RN-133b` para Tipo de Documento.

5. **Contrato de terceirizado por Obra.** A `RN-004` menciona "contrato com
   parcelas" sem definir se é por Obra ou por Vínculo.
