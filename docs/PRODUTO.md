# TECTO — Documento Canônico do Projeto
### Fonte única da verdade · v1.0 · 23/08/2026
 
---
 
# 0. Como usar este documento
 
Este é o **único documento com autoridade** sobre o projeto TECTO. Qualquer especificação anterior que conflite com este texto está superada.
 
**Para humanos:** leia as seções 1 a 3 uma vez. Consulte as seções 4 a 8 conforme a necessidade. A seção 9 é o backlog de decisões.
 
**Para agentes de IA:** este documento deve ser lido integralmente antes de qualquer tarefa de modelagem, implementação ou revisão. As diretrizes obrigatórias estão na seção 12.
 
**Convenções:**
 
| Marcação | Significado |
|---|---|
| `RN-XXX` | Regra de negócio fechada. Vale como especificação. |
| `INV-XX` | Invariante arquitetural. Violar exige migração de dados. Nunca contornar. |
| `Q-XXX` | Pergunta em aberto. Não implementar sem resposta. |
| **[V2]** | Fora da versão inicial, mas a estrutura de dados deve suportar. |
 
**Regra de precedência:** decisão mais recente prevalece. Não se mantém regra antiga em paralelo.
 
---
 
# 1. O que é o TECTO
 
Sistema de gestão para uma empresa de reformas de apartamentos em São Paulo, em transição de pequeno para médio porte. Substitui a fragmentação atual entre WhatsApp, Google Drive e planilhas.
 
**As quatro perguntas que o sistema existe para responder:**
 
1. Quem apareceu para trabalhar, e onde
2. Quem recebe o quê, quanto, e quando
3. O que aconteceu na obra
4. O que vai acontecer na próxima semana
Tudo o mais é consequência disso.
 
**Princípio norteador:** uma informação é registrada uma vez e reutilizada em todos os pontos onde tem impacto. O sistema não pode reproduzir internamente a fragmentação que existe hoje entre planilhas.
 
**Perfis de usuário na V1:** Administração, Financeiro, Gerente de Obras, Assistente de Gerenciamento, Cliente. O acesso do **Funcionário** fica para a V2.
 
**Dimensionamento real:** ~30 funcionários · ~20 obras simultâneas · 10 a 15 fotos e ~5 vídeos por obra por dia.
 
**Responsável pelas decisões (Product Owner):** Pedro decide sobre empresa e financeiro. Fernando decide sobre operação de obra e cronograma. Tudo que Fernando decide, Pedro também pode; o inverso não vale.
 
---
 
# 2. Glossário do domínio
 
Estes termos têm significado exato. **Usar sempre em português, exatamente como grafados aqui**, em código, tabelas, variáveis e conversas com agentes.
 
| Termo | Definição |
|---|---|
| **Pessoa** | Ser humano registrado no sistema. Existe uma única vez, para sempre. Não tem permissão nem remuneração. |
| **Vínculo** | Relação de uma Pessoa com a TECTO durante um período. Carrega o tipo e o regime de remuneração. Uma Pessoa pode ter vários Vínculos ao longo do tempo. |
| **Usuário** | Credencial de acesso ao sistema, ligada a uma Pessoa. Nem toda Pessoa tem Usuário. |
| **Papel** | Perfil de acesso do Usuário. Um Usuário tem exatamente um Papel. |
| **Obra** | Unidade principal de gestão. Reforma completa ou parcial de um imóvel. |
| **Pequeno Serviço** | Atendimento pontual e simplificado. Mesma entidade de Obra, com tipo diferente. Não possui Diário. |
| **Diário de Obra** | Registro do que aconteceu em um dia específico de uma Obra. Destinado ao cliente. |
| **Presença** | Registro de que uma Pessoa esteve em uma Obra em uma data, com o período trabalhado. |
| **Diária** | Unidade de pagamento de um dia de trabalho de uma Pessoa. Sempre integral. |
| **Planejamento** | Escala semanal indicando para qual Obra cada Pessoa deve ir. Módulo global, não pertence a uma Obra. |
| **Orçamento TECTO** | Proposta comercial da própria TECTO ao cliente. Dividido por Ambiente. |
| **Orçamento Externo** | Proposta recebida de fornecedor ou prestador externo. |
| **Orçamento Adicional** | Novo escopo surgido durante a Obra, orçado à parte e incorporado ao escopo. |
| **Ambiente** | Cômodo ou área do imóvel. Ex.: "Suíte Master", "Banheiro da Suíte Master". Unidade de organização do orçamento e do andamento. |
| **Item de Orçamento** | Um serviço aplicado a um Ambiente, com quantidade e valor. É também a unidade de execução do checklist. |
| **Checklist de Execução** | Lista de Itens de Orçamento que o Gerente marca conforme executa. Não exibe valores. |
| **Andamento TECTO** | Percentual do escopo contratado da TECTO já executado, calculado a partir do Checklist. |
| **Andamento Geral** | Percentual da obra inteira, incluindo serviços de terceiros, controlado por Ambiente sem detalhamento de serviço. |
| **Funcionário próprio** | Pessoa que trabalha por Diária, com ciclo de pagamento semanal, quinzenal ou mensal. |
| **Terceirizado** | Pessoa ou empresa que executa mão de obra por contrato com parcelas, ou eventualmente por Diária. Ex.: eletricista, gesseiro, carpinteiro. |
| **Fornecedor** | Empresa que fornece material ou produto. Diferente de Terceirizado, que fornece mão de obra. |
| **Fechamento** | Ato de consolidar e travar os pagamentos de um Ciclo. Depois do Fechamento, nada daquele período é editável. |
| **Ciclo de pagamento** | Periodicidade com que uma Pessoa recebe: semanal, quinzenal, mensal ou por Obra. |
| **Adiantamento** | Valor pago antecipadamente, descontado integralmente no Fechamento seguinte. |
| **Empréstimo** | Valor pago antecipadamente, descontado parceladamente ao longo de vários Fechamentos. |
| **Estorno** | Registro que anula um lançamento anterior. Substitui a exclusão em qualquer contexto financeiro. |
| **Modalidade financeira** | Classificação que define quem paga o quê e o que o cliente enxerga. Ver RN-131. |
 
---
 
# 3. Invariantes arquiteturais
 
Estas são as decisões estruturais. Errar qualquer uma exige migração de dados e reescrita de consultas. **Nenhuma pode ser contornada por conveniência de implementação.**
 
### INV-01 · Pessoa, Vínculo, Usuário e Papel são quatro camadas distintas
 
Nunca modelar "tabela de funcionários", "tabela de gerentes" e "tabela de terceirizados" em paralelo. Existe uma tabela de Pessoa. O tipo de relação vive no Vínculo, que tem data de início e data de fim. A credencial vive no Usuário. A permissão vive no Papel.
 
**Consequência:** um terceirizado que vira funcionário próprio mantém a mesma Pessoa e ganha um novo Vínculo. Todo o histórico continua acessível, sem duplicação de cadastro.
 
### INV-02 · Obra e Pequeno Serviço são a mesma entidade
 
Uma única tabela, com um campo discriminador de tipo. O Diário é **desabilitado por tipo**, não é uma tabela separada.
 
**Consequência:** a consulta "onde essa pessoa esteve em março" não precisa de UNION.
 
### INV-03 · Registros financeiros congelam o valor no momento da ocorrência
 
Um pagamento nunca lê o valor da diária do cadastro atual. O valor é copiado para o registro no momento em que o fato ocorre.
 
**Consequência:** alterar a diária de alguém hoje não altera pagamentos passados. Sem isso não existe auditoria possível.
 
### INV-04 · Presença e Diária são registros separados
 
**Presença** pode ter N registros por Pessoa por dia — uma por Obra visitada, com o período.
**Diária** tem exatamente 1 registro por Pessoa por dia, com a Obra que arca com o custo definida pelo Financeiro.
 
**Consequência:** pagamento em duplicidade se torna impossível por construção, e ainda assim registra-se corretamente que a pessoa esteve em duas obras.
 
### INV-05 · Planejado e Realizado vivem em tabelas separadas
 
O Diário nunca sobrescreve o Planejamento. Quando há divergência, ambos permanecem, e a exibição da grade é derivada.
 
**Consequência:** a métrica "planejado × realizado" continua calculável para sempre. Divergência nunca é armazenada — é sempre derivada.
 
### INV-06 · O Item de Orçamento é unidade de execução, não linha financeira passiva
 
O mesmo registro que carrega quantidade e valor carrega o estado de execução do Checklist. Não existe uma "tabela de checklist" separada espelhando o orçamento.
 
### INV-07 · A imutabilidade é definida pelo Fechamento, não pelo calendário
 
O Diário trava quando o Ciclo de pagamento **da Pessoa afetada** é fechado. Como existem ciclos semanais, quinzenais, mensais e por obra simultaneamente, não existe "trava da semana".
 
### INV-08 · Não existe DELETE físico
 
Toda remoção é lógica (`desativado_em`). Toda correção financeira é Estorno seguido de novo lançamento. Nunca UPDATE destrutivo em registro financeiro ou de presença.
 
### INV-09 · `tenant_id` desde a primeira migration
 
Toda tabela de domínio carrega `tenant_id`. Toda consulta filtra por ele. O produto é destinado a licenciamento futuro para outras empresas; retrofit de multi-tenancy é caro e arriscado.
 
### INV-10 · Dinheiro é inteiro em centavos
 
Nunca usar ponto flutuante para valor monetário, em nenhuma camada. Nunca.
 
---
 
# 4. Pessoas, vínculos e acesso
 
## 4.1 Cadastro
 
**RN-001** — Toda Pessoa tem: nome, endereço, RG, CPF, data de nascimento, telefone, foto da pessoa e fotos dos documentos.
 
**RN-002** — CPF é único no sistema.
 
**RN-003** — Cada Pessoa pode ter múltiplos Vínculos ao longo do tempo, mas apenas um Vínculo ativo por vez.
 
**RN-004** — O tipo de Vínculo determina quais campos adicionais são exigidos e qual regime de remuneração se aplica.
 
| Tipo de Vínculo | Regime de remuneração |
|---|---|
| Funcionário próprio | Diária, com ciclo semanal, quinzenal ou mensal |
| Gerente de Obras | Valor fixo por Obra |
| Assistente de Gerenciamento | A confirmar — ver Q-004 |
| Terceirizado | Contrato com parcelas, ou Diária eventual |
| Administração | Fora do escopo de pagamento do sistema na V1 |
| Financeiro | Fora do escopo de pagamento do sistema na V1 |
 
**RN-005** — Alterar o valor da remuneração de uma Pessoa nunca altera registros financeiros passados (INV-03). A alteração registra autor, data e valor anterior.
 
**RN-006** — Pessoa é desativada, nunca excluída. O histórico permanece integralmente.
 
**RN-007** — Pessoa desativada mantém acesso somente-leitura ao próprio histórico por 90 dias, contados da desativação. **[V2 — depende do acesso de Funcionário]**
 
## 4.2 Acesso e autenticação
 
**RN-010** — Perfis com acesso na V1: Administração, Financeiro, Gerente de Obras, Assistente de Gerenciamento, Cliente.
 
**RN-011** — O acesso de Funcionário não faz parte da V1. **[V2]**
 
**RN-012** — Terceirizados e arquitetos não têm acesso ao sistema.
 
**RN-013** — Cada Usuário tem exatamente um Papel. Não existe acúmulo de perfis.
 
**RN-014** — Administração é o nível máximo e executa qualquer ação disponível aos demais perfis. Não existe Super Admin.
 
**RN-015** — Login é feito por e-mail e senha.
 
**RN-016** — A senha inicial é gerada aleatoriamente pelo sistema e a troca é obrigatória no primeiro acesso.
 
**RN-017** — Senha nunca pode ser derivável de qualquer outro campo do cadastro. Nunca usar CPF, RG, nome ou data de nascimento como senha permanente.
 
**RN-018** — Senha é armazenada apenas como hash, com algoritmo apropriado para senhas. Nunca em texto claro, nunca reversível.
 
## 4.3 Matriz de autoridade
 
| Ação | Administração | Financeiro | Gerente / Assistente | Cliente |
|---|---|---|---|---|
| Criar Usuário | Sim | Não | Não | Não |
| Editar/desativar Usuário interno | Sim | Sim | Não | Não |
| Criar/alterar Cliente | Sim | Não | Não | Não |
| Criar/alterar Obra | Sim | Não | Não | Não |
| Cadastrar Pessoa | Sim | Sim | Não | Não |
| Alterar remuneração | Sim | Sim | Não | Não |
| Ver RG, CPF, endereço e documentos | Sim | Sim | Não | Não |
| Criar Orçamento TECTO | Sim | Não | Não | Não |
| Marcar Orçamento como aprovado | Sim | Não | Não | Não |
| Operar Obra vinculada | Sim | Não | Sim | Não |
| Preencher Diário | Sim | Não | Sim | Não |
| Marcar Checklist de Execução | Sim | Não | Sim | Não |
| Ver valores do Orçamento | Sim | Sim | **Não** | Sim, o próprio |
| Executar Fechamento | Sim | Sim | Não | Não |
| Alterar Diário finalizado | Sim | Não | Não | Não |
| Métricas executivas | Sim | Parcial | Apenas próprias obras | Não |
 
**RN-020** — Gerente e Assistente têm capacidades operacionais idênticas dentro das Obras vinculadas. A diferença é organizacional.
 
**RN-021** — Gerente e Assistente enxergam apenas Obras às quais estão vinculados.
 
**RN-022** — Gerente e Assistente nunca enxergam valores do Orçamento TECTO. Enxergam somente a lista de serviços a executar.
 
---
 
# 5. Obras e Pequenos Serviços
 
**RN-030** — Somente Administração cria Obra.
 
**RN-031** — Toda Obra tem exatamente um Cliente e exatamente um endereço.
 
**RN-032** — Um Cliente pode ter várias Obras.
 
**RN-033** — A Obra não depende de Orçamento aprovado para existir.
 
**RN-034** — Uma Obra pode ter múltiplos Gerentes e múltiplos Assistentes simultaneamente.
 
**RN-035** — Obra sem Gerente fica sob responsabilidade da Administração.
 
**RN-036** — O vínculo entre Gerente e Obra tem data de início e data de fim. Nunca é excluído.
 
**RN-037** — Gerente removido de uma Obra mantém acesso somente-leitura por 90 dias, para apoiar a transição. Não pode adicionar nem alterar nada.
 
**RN-038** — Identificação da Obra: sigla derivada do cliente mais número sequencial visível. Ex.: "Obra 22 - MCL". Existe também um identificador técnico interno.
 
**RN-039** — Estados da Obra: `Aguardando início` · `Em andamento` · `Pausada` · `Concluída` · `Cancelada`.
 
**RN-040** — Somente Administração conclui ou reabre uma Obra.
 
**RN-041** — Obra concluída fisicamente pode ter valores a receber. Não existe estado separado de encerramento financeiro na V1.
 
**RN-042** — Concluir uma Obra não remove nem oculta nada. Fotos, documentos, projetos, orçamento, diário e histórico permanecem acessíveis, inclusive ao Cliente, por tempo indeterminado.
 
**RN-043** — Pequeno Serviço é o mesmo registro de Obra com tipo diferente. Possui Cliente, endereço, orçamento, checklist, pessoas, custo, receita e fotos.
 
**RN-044** — Pequeno Serviço não possui Diário de Obra.
 
**RN-045** — Pequeno Serviço ocupa a agenda das pessoas no Planejamento, impedindo que sejam consideradas disponíveis.
 
---
 
# 6. Planejamento semanal
 
**RN-050** — O Planejamento é um módulo global, não pertence a nenhuma Obra.
 
**RN-051** — Estados: `Rascunho` → `Publicado`. O Rascunho é montado ao longo da semana anterior.
 
**RN-052** — Toda Pessoa com Vínculo ativo deve aparecer no Planejamento da semana. Quem não for trabalhar recebe uma marcação de motivo.
 
**RN-053** — Ao marcar que alguém não vai trabalhar, o sistema pergunta se a Pessoa recebe o dia. Motivos e efeito financeiro são independentes.
 
**RN-054** — Motivos de ausência disponíveis: `Doente` · `Dispensado pela empresa` · `Falta` · `Folga` · `Férias` · `Afastado` · `Obra parada`. Cada um com resposta "recebe" ou "não recebe".
 
**RN-055** — Uma Pessoa pode ficar em estado `Em aberto` no Planejamento, quando a reunião semanal não decidiu o destino. Pode ser alocada depois, no meio da semana ou por um Gerente durante o Diário.
 
**RN-056** — Ao escalar alguém para sábado, domingo ou serviço noturno, o sistema oferece automaticamente a marcação de adicional.
 
**RN-057** — O adicional pode ser valor fixo ou percentual, definido no momento da escala. Pode também ser deixado em branco.
 
**RN-058** — Alteração no Planejamento publicado registra autor, data e valor anterior, e dispara notificação.
 
## 6.1 Fluxo de divergência entre Planejamento e Diário
 
Este é o fluxo mais crítico do sistema operacional. Ele deve funcionar exatamente assim:
 
1. O Planejamento semanal é publicado.
2. O Gerente abre o Diário do dia. As pessoas planejadas para aquela Obra **já aparecem pré-selecionadas**.
3. O Gerente confirma, ou altera removendo quem não foi e adicionando quem foi.
4. Se houver divergência com o Planejamento publicado, o sistema avisa e pede confirmação explícita.
5. Confirmada, o Planejamento passa a refletir a realidade, com marcação de quem alterou e quando.
6. Todos os envolvidos são notificados.
7. O lado financeiro é atualizado: define-se qual Obra arca com o custo daquele dia.
**RN-059** — O Diário chega ao Gerente pré-preenchido a partir do Planejamento. Ele confirma ou corrige — nunca preenche do zero. Isso evita esquecimento de pessoas.
 
**RN-060** — Se o Gerente marcar presença de alguém que a Administração havia marcado como ausente, aplica-se o mesmo fluxo: aviso, confirmação, atualização e notificação.
 
**RN-061** — O registro original do Planejamento nunca é destruído (INV-05).
 
---
 
# 7. Diário de Obra
 
**RN-070** — Existe no máximo um Diário por Obra por dia.
 
**RN-071** — Estados: `Rascunho` → `Finalizado`.
 
**RN-072** — Diário finalizado é imutável. Somente Administração pode alterá-lo.
 
**RN-073** — Diário finalizado cujo Ciclo de pagamento das Pessoas envolvidas já foi fechado não pode ser alterado nem pela Administração. A correção se faz por Estorno no ciclo seguinte (INV-07, INV-08).
 
**RN-074** — O Diário existe mesmo em dias sem execução. Nesse caso o Gerente escolhe um motivo pronto (clima, falta de material, obra parada, feriado) ou digita um livre.
 
**RN-075** — Os serviços executados são descritos em **texto livre** pelo Gerente. Não são selecionados de uma lista.
 
**RN-076** — O Checklist de Execução é alimentado separadamente do Diário. São dois registros distintos com finalidades distintas.
 
**RN-077** — O Gerente registra, para cada Pessoa presente, o **período trabalhado**, permitindo saber se ficou o dia todo ou parte dele.
 
**RN-078** — O Diário aceita fotos e vídeos.
 
**RN-079** — O Diário aceita gravação de áudio, que é transcrita e organizada automaticamente em texto estruturado. Esta é a única funcionalidade de IA da V1.
 
**RN-080** — O Diário é integralmente destinado ao Cliente. Não existe seção interna oculta dentro dele. Informação que o Cliente não pode ver vive em outro recurso.
 
**RN-081** — Toda mídia — foto ou vídeo — é classificada por **Ambiente**, obrigatoriamente, no momento do envio. Mídia sem Ambiente não é aceita.
 
*Consequência:* o Cliente e o Gerente conseguem percorrer a obra por cômodo, e não só por data. Sem a classificação, o filtro por Ambiente da galeria é decorativo — era o estado do protótipo antes desta regra.
 
*Origem:* lacuna 3 registrada em `docs/ABERTO.md` §7, encontrada durante a prototipação. Nenhuma `RN` tratava do assunto e o protótipo já dependia do campo.
 
---
 
# 8. Presença, diária e fechamento
 
**RN-085** — Não existe meia diária. Pessoa que trabalhou parte do dia recebe o dia integral.
 
**RN-086** — Uma Pessoa pode aparecer em duas ou três Obras no mesmo dia. Isso gera múltiplas Presenças, mas **uma única Diária** (INV-04).
 
**RN-087** — Quando há Presença em mais de uma Obra no mesmo dia, o Financeiro decide qual Obra arca com o custo, em conversa com a Administração. O sistema apresenta o caso explicitamente, nunca decide sozinho.
 
**RN-088** — Serviço noturno gera adicional, em valor fixo ou percentual. Opcional.
 
**RN-089** — Trabalho em sábado e domingo gera adicional, em valor fixo ou percentual. Opcional.
 
**RN-090** — O Fechamento é executado por Ciclo e por Pessoa, nunca globalmente por semana.
 
**RN-091** — Depois do Fechamento, todos os registros que o alimentaram tornam-se imutáveis.
 
**RN-092** — Adiantamento é descontado integralmente no Fechamento seguinte.
 
**RN-093** — Empréstimo é descontado parceladamente, ao longo do número de ciclos combinado.
 
**RN-094** — Adiantamento e Empréstimo são a mesma entidade, diferenciada pelo número de parcelas.
 
**RN-095** — O Financeiro sempre enxerga o saldo devedor de cada Pessoa antes de executar o Fechamento.
 
**RN-096** — O Diário confirmado é a fonte da verdade para pagamento. O Planejamento indica a expectativa; o Diário indica o fato.
 
---
 
# 9. Comercial: orçamento, adicionais e andamento
 
## 9.1 Orçamento TECTO
 
**RN-100** — Somente Administração cria e edita Orçamento TECTO.
 
**RN-101** — O Orçamento é estruturado por Ambiente. Dentro de cada Ambiente ficam os serviços a executar.
 
**RN-102** — O catálogo de serviços suporta múltiplas formas de cálculo: metro quadrado, metro linear, unidade, diária, ponto, ambiente e valor fixo.
 
**RN-103** — É permitido incluir item manual que não exista no catálogo.
 
**RN-104** — A Administração pode aplicar percentual sobre o orçamento inteiro ou sobre itens selecionados. O acréscimo é distribuído proporcionalmente entre os itens.
 
**RN-105** — O Cliente **nunca** vê que houve aplicação de percentual. Ele vê apenas os serviços e os valores finais.
 
**RN-106** — Estados: `Rascunho` → `Finalizado` → `Aprovado` · `Recusado`.
 
**RN-107** — Orçamento aprovado é imutável. Correções e mudanças de escopo se fazem por Orçamento Adicional.
 
**RN-108** — O Orçamento aprovado congela os valores e registra qual versão da tabela de preços foi usada.
 
**RN-109** — Alterar a tabela de preços nunca altera orçamentos já emitidos.
 
## 9.2 Serviços adicionais
 
**RN-115** — Durante a Obra, Administração e Gerente podem marcar serviços executados fora do escopo original. Esses registros se acumulam como **rascunho de adicionais**.
 
**RN-116** — A Administração revisa o rascunho, seleciona quais itens irão para o Orçamento Adicional e mantém os demais em rascunho.
 
**RN-117** — O Orçamento Adicional é criado dentro da Obra e é independente do Orçamento original.
 
**RN-118** — Ao ser aprovado, o Orçamento Adicional atualiza o Checklist de Execução, o valor total da Obra e o prazo.
 
**RN-119** — O Gerente enxerga **um único Checklist consolidado**, nunca um checklist por orçamento. Uma obra pode acumular dez adicionais e o Gerente continua vendo uma lista só.
 
**RN-120** — O Cliente vê, ao receber um adicional: os serviços adicionais, o valor de cada um, o total do adicional, o novo total da Obra, o novo prazo e a lista de serviços atualizada.
 
**RN-121** — Rascunhos de adicionais são invisíveis ao Cliente. Ele só vê o adicional depois de apresentado.
 
## 9.3 Andamento
 
**RN-125** — Existem **duas visões de andamento** por Obra, ambas visíveis ao Cliente.
 
**Andamento TECTO** — organizado por Ambiente, detalhado por serviço. O Gerente marca cada serviço concluído. Quando todos os serviços de um Ambiente estão marcados, o Ambiente é automaticamente concluído.
 
**Andamento Geral** — organizado por **Especialidade e por Ambiente ao mesmo tempo**, derivando os dois recortes do **mesmo conjunto de registros**. Cobre marcenaria, marmoraria, vidro, ar-condicionado e demais terceiros. O Gerente cria essas entradas ao longo da Obra.
 
*A redação anterior desta regra dizia "organizado apenas por Ambiente, sem detalhamento de serviço". Foi substituída pela decisão `D1` de `docs/DECISOES.md`, que já declarava invalidá-la: é assim que a obra acontece, porque o marceneiro entrega a marcenaria inteira, não "a marcenaria da suíte".*
 
**RN-125b** — A Especialidade é **atributo do serviço de terceiro**. Os três percentuais — por especialidade, por ambiente e total da obra — saem de uma agregação sobre o mesmo conjunto de registros. **Não se cria uma segunda tabela espelhando o Checklist**: isso violaria o `INV-06`.
 
**RN-126** — O percentual do Andamento TECTO é calculado a partir do Checklist de Execução.
 
**RN-127** — O Gerente é responsável por gerenciar também os serviços de terceiros, ainda que eles não entrem no escopo comercial da TECTO.
 
**RN-128** — A **Especialidade** é um catálogo fechado, mantido pela Administração, e é atributo do serviço de terceiro. Catálogo inicial: marcenaria, marmoraria, vidro, ar-condicionado, gesso, piso de madeira, elétrica, hidráulica e pintura.
 
*Consequência:* é a Especialidade que sustenta o eixo do Andamento Geral (`RN-125b`) e a classificação de projetos e contratos (`RN-133b`). Texto livre no lugar dela impediria os dois.
 
*Origem:* lacuna 4 registrada em `docs/ABERTO.md` §7. A taxonomia era pré-requisito de quatro telas e não estava definida em `RN` nenhuma.
 
---
 
# 10. Financeiro
 
## 10.1 Modalidade financeira
 
**RN-130** — A TECTO **não inclui material em suas obras**. Todo material pertence ao Cliente.
 
**RN-131** — Todo custo e todo serviço contratado a terceiros carrega uma **modalidade financeira**, que determina o fluxo de dinheiro e a visibilidade do Cliente:
 
| Modalidade | Fluxo | Cliente vê |
|---|---|---|
| **Repassado com margem** | A TECTO cobra o serviço do Cliente e paga o Terceirizado por fora. Ex.: elétrica, colocação de portas. | Vê o serviço e o valor cobrado pela TECTO. **Nunca** vê o custo nem a margem. |
| **Reembolsável** | A TECTO paga o Fornecedor e o Cliente reembolsa. Ex.: material, caçamba de entulho. | Vê a nota e o valor a reembolsar. |
| **Direto do Cliente** | O Cliente paga o Fornecedor diretamente. A TECTO apenas registra a nota para acompanhamento. | Vê a nota. A TECTO não tem envolvimento financeiro. |
 
**RN-132** — Quando um Orçamento Externo é aprovado, registra-se quem pagou. Isso determina a modalidade e todo o comportamento subsequente.
 
**RN-133** — Um mesmo prestador pode operar em modalidades diferentes em obras diferentes. A modalidade pertence ao registro do custo, nunca ao cadastro do prestador.
 
**RN-133b** — O **Tipo de Documento** é um catálogo em dois níveis. No topo: nota fiscal, projeto e contrato. Abaixo de nota fiscal: depósito de material, parte elétrica, reembolso de material, compra online e outros.
 
*Consequência:* a nota vive junto do custo que ela comprova, e é filtrada por tipo no Financeiro da Obra. Projeto e contrato existem por si, são classificados também por Especialidade (`RN-128`), e são filtrados em Documentos.
 
*Origem:* lacuna 4 registrada em `docs/ABERTO.md` §7.
 
## 10.2 Fronteira de visibilidade do Cliente
 
**RN-135** — O Cliente **vê**: quanto deve à TECTO, quanto já pagou, parcelas futuras, comprovantes, materiais da própria obra e respectivas notas, orçamentos externos apresentados, nome dos fornecedores, nomes e funções das pessoas que trabalharam, o Diário, as fotos e as duas visões de andamento.
 
**RN-136** — O Cliente **nunca vê**: diária ou salário de qualquer pessoa, valor pago a Terceirizado pela TECTO, margem da TECTO, percentual aplicado ao orçamento, custos internos da empresa, telefone e dados de contato de fornecedores.
 
**RN-137** — O Cliente é somente leitura. Não altera dados, não alimenta a obra, não aprova orçamento pelo sistema.
 
**RN-138** — Existe exatamente um login por Cliente. Não há múltiplas contas por cadastro.
 
## 10.3 Financeiro da empresa
 
**RN-140** — O sistema registra despesas gerais da empresa por **lançamento manual**, com categoria.
 
**RN-141** — Integrações fiscais e bancárias estão fora do escopo: nota fiscal eletrônica, conciliação bancária, assinatura eletrônica e integração contábil.
 
**RN-142** — O dashboard apresenta resultado operacional por obra e movimento geral da empresa. Não constitui DRE nem substitui sistema contábil.
 
---
 
# 11. Escopo
 
## 11.1 Entregas por fase
 
| Fase | Conteúdo | Em uso |
|---|---|---|
| **1 — Operação** | Fundação, permissões, Pessoa/Vínculo/Usuário/Papel, cadastros, Obra e Pequeno Serviço, Planejamento semanal, Diário com fotos, vídeos e áudio, Presença e Diária, Fechamento nos quatro ciclos, Adiantamento e Empréstimo, Portal do Cliente, notificações internas, auditoria e estorno | Mês 5 |
| **2 — Comercial** | Gerador de Orçamento, catálogo, ambientes e metragens, tabela de preços versionada, ajuste percentual, PDF, Orçamentos Adicionais, Checklist de Execução, as duas visões de Andamento, Orçamentos Externos, Projetos, Fornecedores | Mês 8 |
| **3 — Financeiro e gestão** | Custos por obra com as três modalidades, parcelas e recebimentos do Cliente, despesas da empresa por lançamento manual, dashboard executivo, relatórios exportáveis | Mês 10 |
 
## 11.2 Fora do escopo
 
Cada item abaixo pode ser contratado separadamente no futuro.
 
Emissão de nota fiscal eletrônica · Conciliação bancária automática · Assinatura eletrônica · Integração contábil · Integração bancária · Migração de histórico anterior ao sistema · Chat interno · Integração com WhatsApp · Notificação por e-mail ou push · Aplicativo nativo · Acesso para Funcionário, Terceirizado e arquiteto · Controle de estoque e ferramentas · DRE · Recursos de IA além da transcrição de áudio do Diário · Modo offline · Multi-empresa e filiais na interface · Aprovação de orçamento pelo Cliente dentro do sistema.
 
## 11.3 No radar para depois
 
Ordem sugerida de prioridade para a V2, com base no que foi conversado:
 
1. Acesso do Funcionário: ver onde vai trabalhar na semana, endereços, e quanto vai receber
2. Controle de estoque e ferramentas
3. Notificações por WhatsApp
4. Migração de histórico
5. Integrações fiscais e bancárias
6. Recursos de IA sobre a base de dados já estruturada
---
 
# 12. Diretrizes obrigatórias para agentes de IA
 
Esta seção existe porque a maior parte do desenvolvimento será feita com agentes. Ela deve ser lida integralmente antes de qualquer tarefa.
 
### 12.1 Antes de qualquer coisa
 
1. **Leia este documento inteiro.** Não trabalhe a partir de resumo.
2. **Não invente regra de negócio.** Se a regra não estiver aqui, ela não foi decidida. Pergunte, não suponha.
3. **Se uma instrução conflitar com um INV, pare e sinalize.** Invariante não se contorna por conveniência de implementação.
4. **Se uma pergunta da seção 13 tocar a tarefa, sinalize antes de implementar.**
### 12.2 Nomenclatura
 
- Termos de domínio em **português**, exatamente como no glossário da seção 2.
- Nunca traduzir para inglês: é `obra`, não `project`. É `diaria`, não `daily_rate`. É `ambiente`, não `room`.
- Nomes técnicos de infraestrutura podem ser em inglês.
- Nunca criar sinônimo. Se o glossário diz `Vínculo`, não existe `contrato_trabalho`, `alocacao` ou `funcionario_ativo`.
### 12.3 Regras técnicas inegociáveis
 
- **Dinheiro:** inteiro em centavos. Nunca float, nunca decimal implícito, em nenhuma camada.
- **Datas:** sempre com fuso. Operação em São Paulo, mas o campo nunca é ingênuo.
- **DELETE:** proibido em tabelas de domínio. Use desativação lógica.
- **Correção financeira:** sempre Estorno mais novo lançamento. Nunca UPDATE.
- **`tenant_id`:** em toda tabela de domínio, em toda consulta, desde a primeira migration.
- **Migrations:** aditivas. Nunca alterar migration já aplicada.
- **Valores congelados:** todo registro financeiro copia o valor no momento do fato. Nunca faz JOIN com o cadastro para descobrir "quanto essa pessoa ganha".
### 12.4 Onde ter cautela redobrada
 
Trate estes módulos como código que você **não gera sem revisão linha a linha**, porque o erro é silencioso e caro:
 
- Fechamento de pagamento e cálculo de Diária
- Rateio de Diária entre Obras
- Adiantamento, Empréstimo e saldo devedor
- Estorno
- Regras de visibilidade do Cliente
Nestes módulos, o erro não aparece na tela. Aparece três semanas depois, no bolso de alguém.
 
Nos demais — cadastros, telas, upload, relatórios, portal — o erro é visível e barato. Pode gerar com liberdade.
 
### 12.5 Deriva arquitetural
 
Sessões diferentes tomam decisões diferentes para o mesmo problema. Em três meses isso vira duas formas de fazer a mesma coisa.
 
**Regra:** este documento é colado no início de toda sessão nova, sem exceção. Quando uma decisão nova for tomada em uma sessão, ela é registrada aqui antes de continuar.
 
---
 
# 13. Perguntas em aberto
 
Não implementar nada que dependa destas respostas.
 
## 13.1 Bloqueantes de schema
 
**Q-001** — O valor fixo por Obra do Gerente varia conforme a duração ou o porte da obra? Uma obra de dois meses e uma de oito pagam o mesmo?
 
**Q-002** — Quando o Gerente recebe pelo valor da Obra? Parcelado mensalmente enquanto a obra corre, ou atrelado a marcos de execução?
 
**Q-003** — Um Gerente com cinco obras simultâneas recebe cinco pagamentos separados, em datas diferentes, ou um consolidado?
 
**Q-004** — Qual o regime de remuneração do Assistente de Gerenciamento? Diária, valor por obra ou salário fixo?
 
**Q-005** — As parcelas de contrato de Terceirizado são por data fixa ou por etapa concluída? Se por etapa, quem confirma a conclusão — Gerente ou Administração?
 
**Q-006** — Terceirizado que trabalha por Diária entra no Planejamento semanal e aparece no Diário como os demais?
 
**Q-007** — Existe limite de valor para Adiantamento e Empréstimo?
 
**Q-008** — Se o Fechamento resulta em R$800 e a Pessoa deve R$1.000, ela recebe zero e carrega R$200 para o ciclo seguinte? Ou desconta-se parcialmente por acordo?
 
**Q-009** — O "período trabalhado" registrado no Diário é um enum fechado (dia todo, manhã, tarde) ou horário livre de entrada e saída?
 
**Q-010** — Quando o Financeiro escolhe qual Obra arca com a Diária de alguém que esteve em duas, a outra Obra registra a presença com custo zero, ou existe rateio proporcional?
 
**Q-011** — Ambiente é catálogo global reutilizável ou é criado dentro de cada Obra?
 
**Q-012** — O Andamento Geral reutiliza os mesmos Ambientes do Orçamento TECTO, ou o Gerente cria uma estrutura própria?
 
**Q-013** — Um item do Checklist pode voltar de concluído para pendente, no caso de retrabalho?
 
**Q-014** — Um Orçamento Adicional aprovado pode ser cancelado? O que acontece com os itens que já entraram no Checklist?
 
**Q-015** — Quando a tabela de preços muda, orçamentos em Rascunho atualizam automaticamente ou congelam no preço do momento da criação?
 
## 13.2 Bloqueantes de fluxo
 
**Q-020** — Quem publica o Planejamento semanal: Administração ou Gerente?
 
**Q-021** — O Planejamento pode ser republicado várias vezes na mesma semana, ou existe uma única publicação com alterações registradas em cima?
 
**Q-022** — O que acontece se o Gerente não preencher o Diário de um dia? Alguém é notificado? Trava algo no Fechamento?
 
**Q-023** — Existe prazo-limite para finalizar um Diário? Pode ser finalizado uma semana depois?
 
**Q-024** — Quem finaliza o Diário: apenas o Gerente, ou o Assistente também?
 
**Q-025** — Como o Cliente aprova o Orçamento, já que não aprova pelo sistema? É por WhatsApp ou e-mail? Precisa anexar evidência da aprovação?
 
**Q-026** — O que define que uma Obra está concluída: o Checklist em 100%, ou decisão manual da Administração?
 
**Q-027** — ~~Quem recebe qual notificação? Existe uma central de notificações dentro do sistema, ou apenas o aviso no momento?~~ **RESPONDIDA.** A central existe; o destinatário é por perfil no protótipo e será por Usuário no sistema real. Ver `docs/DECISOES.md`.
 
**Q-028** — Fotos e vídeos são armazenados no original ou comprimidos? Nada é apagado — qual o horizonte de retenção?
 
## 13.3 Financeiro e gestão
 
**Q-030** — Quais são as categorias de despesa da empresa a lançar manualmente?
 
**Q-031** — Despesa geral da empresa é rateada entre obras ou fica em categoria separada?
 
**Q-032** — Quais indicadores o dashboard executivo precisa mostrar, em ordem de importância?
 
**Q-033** — Receita significa valor contratado ou valor recebido? Despesa significa lançada ou paga?
 
## 13.4 Segurança e LGPD
 
**Q-040** — Quem pode ver as fotos dos documentos pessoais: apenas Administração e Financeiro?
 
**Q-041** — A sessão expira? Em quanto tempo?
 
**Q-042** — Administração e Financeiro terão segundo fator de autenticação?
 
**Q-043** — Por quanto tempo os documentos de uma Pessoa desativada são retidos?
 
---
 
# 14. Contexto comercial que afeta o desenvolvimento
 
Resumo do que foi contratado, na medida em que impacta decisões técnicas.
 
| Item | Definição |
|---|---|
| Valor | R$ 30.000 · R$ 5.000 de entrada + 10 × R$ 2.500 |
| Prazo | 10 meses, três entregas parciais |
| Propriedade intelectual | Permanece com o desenvolvedor |
| Licença | Perpétua e ilimitada para uso interno da TECTO; licenciamento a terceiros permitido ao desenvolvedor |
| Infraestrutura | Contratada e paga pela TECTO, em nome dela |
| Manutenção | R$ 500/mês a partir do aceite da Fase 1 · teto de 4h/mês · reajuste anual por IPCA |
| Novas funcionalidades | Orçamento individual, valor e prazo fechados antes de iniciar |
| LGPD | TECTO é controladora; desenvolvedor é operador |
| Garantia | 90 dias após o aceite da Fase 3 |
| Homologação | Obra piloto de 30 dias, com planilhas rodando em paralelo |
 
**Critérios de aceite de cada fase:** quatro fechamentos consecutivos sem divergência contra o controle paralelo · nenhum defeito crítico em aberto · duas semanas de operação sem suporte · termo de aceite assinado.
 
**Implicação técnica direta:** o licenciamento a terceiros é a razão de INV-09. Sem `tenant_id` desde o início, a cláusula 8.5 do contrato perde valor prático.
 
---
 
*TECTO — Documento Canônico v1.0 · 23/08/2026*
*Este documento substitui a Especificação Funcional Base v1.0 e o Questionário Mestre de Discovery.*
