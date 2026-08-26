# Protótipo TECTO

## O que é isto

Protótipo navegável de um sistema de gestão de obras de reforma residencial, para
apresentação comercial. Gerado inicialmente no Figma Make e migrado para
desenvolvimento local.

**Isto é maquete, não produto.** Não há back-end, autenticação real nem
`tenant_id`. O estado é um módulo em memória. O objetivo é demonstrar o
funcionamento do sistema numa reunião, não sustentar operação.

O sistema real será construído depois, na mesma stack, com regras de negócio
próprias. Não assuma que uma regra implementada aqui é a regra final.

## Stack

React · Vite · TypeScript · Tailwind. Não introduza outra biblioteca de UI, outro
roteador nem gerenciador de estado sem pedir antes.

## Idioma

Todo rótulo de interface em português do Brasil. Todo nome de entidade e campo do
domínio em português, exatamente como na seção Vocabulário. Nunca traduzir para
inglês: é `obra`, não `project`; é `ambiente`, não `room`; é `diaria`, não
`daily_rate`. Nomes técnicos de infraestrutura podem ser em inglês.

## Design tokens

Extraídos do logo e do site da empresa. Não invente cor nova.

| Token | Hex |
|---|---|
| acento | `#FFC213` |
| acento-fundo | `#FFF6D6` |
| tinta | `#000000` |
| grafite | `#363636` |
| tinta-fraca | `#666666` |
| borda | `#E6E6E6` |
| fundo | `#FAFAFA` |
| superficie | `#FFFFFF` |
| positivo | `#2E9E5B` |
| atencao | `#E8833A` |
| negativo | `#C94141` |
| neutro | `#9A9A9A` |
| informativo | `#215FD7` |
| informativo-fundo | `#E7F1FF` |

### Regras de cor

1. Amarelo `#FFC213` nunca é cor de texto, ícone pequeno ou link. É sempre
   preenchimento, com texto preto por cima. Contraste de amarelo sobre branco é
   1.6:1; de preto sobre amarelo, 13:1.
2. Amarelo é exclusivo de: marca, botão primário, aba ativa, barra de progresso e
   célula "Em aberto" do Planejamento. Nunca para alerta — alerta usa `#E8833A`.
3. Item de menu selecionado usa fundo grafite `#363636` com texto branco.

### Tipografia

Space Grotesk nos títulos. Inter no corpo, dados e tabelas. Labels e títulos de
seção em Inter Semibold, caixa alta, letterspacing 0.08em — nunca em texto longo
ou dado de tabela. Valores monetários em numerais tabulares, alinhados à direita.

Escala: Display 32/40 · Título 24/32 · Subtítulo 18/26 · Corpo 15/22 · Apoio
13/18 · Label 11/16 caixa alta.

## Vocabulário do domínio

Pessoa · Vínculo · Usuário · Papel · Obra · Pequeno Serviço · Diário de Obra ·
Presença · Diária · Planejamento · Orçamento · Ambiente · Item de Orçamento ·
Checklist de Execução · Andamento TECTO · Andamento Geral · Fechamento · Ciclo de
pagamento · Adiantamento · Empréstimo · Estorno.

Nunca criar sinônimo. Se o vocabulário diz `Vínculo`, não existe `contrato`,
`alocacao` nem `funcionario_ativo`.

## Estado compartilhado

Módulo único, lido e escrito por todas as telas. Entidades:

`pessoas` · `vinculos` · `obras` · `vinculos_obra` · `ambientes` ·
`itens_orcamento` · `planejamento` · `diarios` · `presencas` · `diarias` ·
`fechamentos` · `lancamentos`

### Regras invariantes do estado

- Dinheiro é **inteiro em centavos**. `R$ 148.320,00` é `14832000`. Formatação em
  reais só na exibição. Nunca decimal, em nenhuma camada.
- `diarias.valor_centavos` é copiado do vínculo no momento da criação e nunca mais
  lido do vínculo. Alterar um vínculo não altera diárias existentes.
- Divergência entre `planejamento` e `presencas` nunca é campo guardado. É sempre
  calculada na exibição, comparando as duas listas.
- Nada é apagado. Desativar pessoa preenche `desativado_em`. Corrigir valor cria
  `lancamento` de tipo `estorno`.
- Nenhuma tela pode ter número, total ou percentual escrito no código. Todo valor
  exibido é derivado do estado.

### Data de referência

Hoje é quinta-feira, 20/08/2026. Semana corrente: segunda 17/08 a sábado 22/08.
Toda data exibida deriva disso.

## Elenco fixo

Não invente nomes. Não troque funções.

**Gestão:** Pedro Almeida (Administração) · Fernando Nunes (Administração) ·
Fernanda Sousa (Financeiro) · Rafael Duarte (Gerente de Obras) · Sofia Monteiro
(Gerente de Obras) · Ana Carvalho (Assistente de Gerenciamento)

**Campo:** Marcos Bittencourt (pedreiro) · Adilson Prado (pedreiro) · Edmilson
Vieira (pedreiro) · Claudinei Sartori (pedreiro) · Nilton Barreto (azulejista) ·
Reinaldo Peçanha (azulejista) · Sebastião Nóbrega (pintor) · Otávio Bonfim
(pintor) · Jonas Ribeiro (ajudante) · Valdir Chagas (ajudante) · Israel Fontes
(ajudante) · Josimar Andrade (ajudante) · Ubiratan Coelho (ajudante) · Genivaldo
Reis (ajudante)

**Terceirizados:** Cleber Matos (eletricista) · Dorival Assunção (eletricista) ·
Tarcísio Melo (gesseiro) · Rogério Pastore (encanador)

**Inativo:** Wagner Lopes (pintor, desativado em 12/06/2026)

**Obras:** Obra 22 - MCL (Mariana Costa Lima, 68%, Em andamento, Rafael Duarte) ·
Obra 18 - GFR (Guilherme F. Rocha, Em andamento, Sofia Monteiro) · Obra 25 - ATB
(Antônia T. Bicalho, Pausada, Ana Carvalho) · Obra 31 - MBP (Miguel Barros Pinto,
Aguardando início, Rafael Duarte) · Serviço 04 - LSM (Luciana S. Medeiros,
pequeno serviço, Sofia Monteiro)

O código da obra deriva das iniciais do cliente.

## Rotas

`/entrar` · `/entrar/primeiro-acesso` · `/` (Painel) · `/obras` ·
`/obras/:obraId` e sub-rotas `/diario` `/diarios` `/checklist` `/andamento`
`/fotos` `/financeiro` `/documentos` — genérica, abre as cinco obras (22-mcl,
18-gfr, 25-atb, 31-mbp, 04-lsm) a partir do estado · `/planejamento` ·
`/orcamentos` · `/financeiro` · `/indicadores` · `/equipe` ·
`/equipe/:pessoaId` · `/portal` · `/portal/diario` · `/portal/financeiro` ·
`/design-system`

Rota sem tela construída renderiza a página "Em breve" — nunca link morto.
Rota fora do perfil do usuário logado renderiza `SemAcesso` — nunca
redirecionamento silencioso. Perfis por rota declarados em `routes.ts` (rota
sem perfil declarado é negada por padrão); para `/obras/:obraId` e sub-rotas, o
Gerente de Obras só acessa as obras às quais está vinculado no estado.

## Permissões visíveis

- **Administração:** tudo.
- **Gerente de Obras:** barra lateral só com Painel, Obras e Planejamento. Vê
  apenas as obras às quais está vinculado. Não vê valor de orçamento, custo nem
  margem. Rota interna proibida exibe bloqueio, não redireciona em silêncio.
- **Cliente:** apenas o portal. Somente leitura. Nunca vê diária, salário, custo
  de terceirizado, margem, percentual aplicado nem contato de fornecedor.

## Situação atual

**Construído:** Design System · layouts e rotas · Painel do dia · Carteira de
obras · Obra: visão geral e sub-abas (Diários, Checklist, Andamento, Fotos),
genéricas para as cinco obras · Diário de Obra em `/obras/:obraId/diario`,
tela normal dentro do `AppLayout` · Equipe · Planejamento semanal com
interações · Portal do Cliente (3 telas) · Login com perfis (Administração,
Financeiro, Gerente de Obras, Cliente) · controle de acesso por rota.

**Falta construir:** Fechamento de Ciclo em `/financeiro` · Indicadores em
`/indicadores`.

**Correções pendentes:** nenhuma no momento. As três anteriores — moldura de
celular no Diário de Obra, `CampoLayout` separado, destino do botão de
demonstração de Rafael Duarte — foram resolvidas.

**Pendência transversal:** nenhuma tela tem pontos de quebra. Todas precisam
funcionar em desktop e em celular — o mesmo usuário acessa dos dois. A grade do
Planejamento resolve com rolagem horizontal e coluna de nomes fixa; a tabela do
Fechamento vira um cartão por pessoa em tela estreita.

## Como trabalhar aqui

- Antes de gerar tela, leia o estado compartilhado e reaproveite o que existe.
- Uma tela por vez. Commit antes de começar cada uma.
- Não altere tela existente ao construir tela nova.
- Se uma regra necessária não estiver neste arquivo, pergunte. Não invente regra
  de negócio.
