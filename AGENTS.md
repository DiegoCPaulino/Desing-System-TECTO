# TECTO — Instruções para agentes

Este arquivo governa o comportamento de qualquer agente que trabalhe neste
repositório. Leia inteiro antes da primeira alteração.

## 1. O que é este repositório

Protótipo navegável de um sistema de gestão de obras para uma empresa de reformas
de apartamentos em São Paulo. React · Vite · TypeScript · Tailwind. Origem: gerado
no Figma Make, exportado e migrado para desenvolvimento local.

**É maquete, não produto.** Não há back-end, autenticação real nem `tenant_id`.
O estado é um módulo em memória em `src/state/store.ts`.

**Existe para sustentar uma demonstração comercial.** Qualidade visual e
continuidade ponta a ponta entre telas são requisitos, não detalhes.

## 2. Regras que não se contornam

- **Domínio em português, sempre.** É `obra`, não `project`. É `ambiente`, não
  `room`. É `diaria`, não `daily_rate`. Nunca criar sinônimo: se o glossário diz
  `Vínculo`, não existe `contrato_trabalho` nem `alocacao`.
- **Dinheiro é inteiro em centavos.** `valor_centavos: 14832000`. Formatação só na
  exibição, e só pelo componente de valor monetário. Nunca float.
- **Nada escrito no código.** Nenhuma tela pode ter número, total, percentual ou
  nome fixo no componente. Se o dado não existe no estado, **pare e reporte**.
  Não remova o bloco. Não invente o valor.
- **Cálculo em função pura**, em `src/state/`. Nunca no componente.
- **Sem DELETE.** Desativação lógica (`desativado_em`) para pessoa; estorno para
  financeiro.
- **Guarda de permissão em um lugar só.** Controle por declaração em
  `handle.perfis`, verificado por `GuardaPerfil`. Rota sem perfil declarado é
  negada. Nunca lista de exceções, nunca duas camadas checando a mesma coisa.
- **Data sempre coerente com o dia da semana.** Hoje é quinta-feira, 20/08/2026.

## 3. Elenco fixo — não inventar nomes, não trocar funções

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
Rocha) · Obra 25 - ATB (Antônia T. Bicalho) · Obra 31 - MBP (Miguel Barros
Pinto) · Serviço 04 - LSM (Luciana S. Medeiros, pequeno serviço)

O código da obra deriva das iniciais do cliente; o slug da rota deriva do código.

## 4. Perfis e visibilidade

| Perfil | Usuário | Acesso |
|---|---|---|
| Administração | Pedro Almeida | Tudo |
| Financeiro | Fernanda Sousa | Tudo |
| Gerente de Obras | Rafael Duarte | `/`, `/obras`, `/planejamento`, `/equipe` e obras vinculadas |
| Cliente | Mariana Costa Lima | Apenas `/portal` e sub-rotas |

- Gerente **nunca** vê valor de orçamento, custo, margem nem diária. Não vê
  `/obras/:obraId/financeiro`. Só enxerga obras em `vinculos_obra`.
- Cliente **nunca** vê diária, salário, custo de terceirizado, margem, percentual
  aplicado nem contato de fornecedor.
- Perfil sem acesso vê `SemAcesso`. Nunca redirecionamento silencioso. Exceção:
  Cliente acessando `/` vai para `/portal` — roteamento de entrada, não permissão.

## 5. Design tokens

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
   1.6:1; preto sobre amarelo, 13:1.
2. Amarelo é exclusivo de: marca, botão primário, aba ativa, barra de progresso e
   célula "Em aberto" do Planejamento. **Nunca para alerta** — alerta usa
   `#E8833A`.
3. Item de menu selecionado usa fundo grafite `#363636` com texto branco.

**Tipografia:** Space Grotesk nos títulos, Inter no corpo e dados. Labels em Inter
Semibold, caixa alta, letterspacing 0.08em — nunca em texto longo ou dado de
tabela. Valores monetários em numerais tabulares, alinhados à direita.

Escala: Display 32/40 · Título 24/32 · Subtítulo 18/26 · Corpo 15/22 · Apoio 13/18
· Label 11/16 caixa alta.

## 6. Fluxos críticos que não podem regredir

**F1** Planejamento → Diário → Presença → Diária → Fechamento
**F2** Divergência planejado × realizado, sem revelar a outra obra
**F3** Checklist → Andamento → Carteira → Portal
**F4** Pendências derivadas do Painel
**F5** Rateio de diária: uma diária, o Financeiro escolhe a obra
**F6** Imutabilidade pelo Fechamento
**F7** Permissão por perfil

Qualquer alteração que quebre um deles deve ser revertida antes de seguir.

## 7. Como escrever

- Uma função, uma responsabilidade, um nível de abstração.
- Nome descreve intenção: `calcularDiariaDoFechamento`, não `processar`.
- Comentário explica **por que**, nunca **o que**.
- Erro tratado explicitamente. Nunca `catch` silencioso.
- Nunca `useEffect` para gravar estado derivado. Derive na renderização ou em
  `useMemo`. Este repositório já teve um loop infinito por causa disso.

## 8. Verificação e entrega

- **`tsc --noEmit` não é verificação.** Dois bugs deste repositório só apareceram
  no navegador.
- Verificar em 390px, 800px e 1440px.
- Verificar nos perfis nomeados, não só como Administração.
- Um commit por item numerado do prompt. Push da sua branch após cada commit.
  **Nunca push para master.**
- Relatório final item a item, com o hash de cada commit e o que foi verificado.