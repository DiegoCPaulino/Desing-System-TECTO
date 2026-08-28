## 17. Roteiro revisado da demonstração

O roteiro muda com os fluxos de criação: deixa de ser passeio e passa a ser
construção ao vivo.

### Cena 1 — Login e perfis
**Precisa funcionar:** os quatro botões de demonstração. **Dados prévios:** os
quatro usuários. **Ação:** entrar como Pedro Almeida. **Mensagem:** cada pessoa
da empresa entra pela mesma porta e vê o que lhe cabe. **Falha grave:** botão de
perfil que não muda nada.

### Cena 2 — Painel com pendências reais
**Precisa funcionar:** indicadores derivados, lista de pendências, notificações
clicáveis (`A03`). **Estado inicial:** divergência do Rafael em 19/08, rateio do
Israel, diário faltando na Obra 25, fechamento semanal em 2 dias. **Mensagem:** o
sistema te diz o que precisa da sua decisão hoje. **Falha grave:** lista vazia.

### Cena 3 — Criar uma obra do zero **(nova)**
**Precisa funcionar:** Fase 3 inteira. **Ação:** criar cliente, criar obra,
vincular Rafael como gerente. **Mensagem:** começar uma obra leva um minuto, não
uma planilha nova. **Falha grave:** obra criada que abre com telas quebradas —
por isso `R01` (estados vazios) é pré-requisito desta cena.

### Cena 4 — Orçar a obra **(nova, se a Fase 4 couber)**
**Ação:** rodar o assistente, aplicar percentual, aprovar. **Mensagem:** o
orçamento não é um documento solto; ele vira a lista de execução da obra.
**Momento wow:** virar para o perfil Gerente e mostrar a mesma lista **sem um
único valor**.

### Cena 5 — Planejamento da semana
**Ação:** criar a semana seguinte, alocar pessoas, marcar uma ausência, publicar.
**Mensagem:** a grade que substitui a planilha. **Momento wow:** virar para o
perfil Gerente e ver a grade encolher para as obras dele.

### Cena 6 — Diário e divergência
**Ação:** abrir o diário, ver que já veio preenchido pelo planejamento, remover
quem não foi, acrescentar quem foi, disparar a confirmação de divergência.
**Mensagem:** o gerente confirma a realidade, não digita do zero. **Falha
grave:** diário que abre vazio.

### Cena 7 — Fechamento
**Ação:** resolver as pendências, executar o fechamento, voltar ao diário e
mostrá-lo travado. **Mensagem:** depois de pago, ninguém mexe — nem o dono.
**Momento wow:** a tentativa de editar sendo bloqueada para o próprio Pedro.

### Cena 8 — Portal do Cliente
**Ação:** clicar em "Ver como o cliente vê". **Mensagem:** o que a TECTO já
promete no site — cliente acompanhando a obra todo dia — entregue de verdade.
**Momento wow, o mais forte de todos:** o diário preenchido na Cena 6 aparecendo
para a Mariana, dois cliques depois.

### Cena 9 — Indicadores
**Ação:** abrir o dashboard. **Mensagem:** onde está o dinheiro da empresa, de
ponta a ponta. **Falha grave:** número que não bate com o que foi mostrado nas
telas anteriores.
