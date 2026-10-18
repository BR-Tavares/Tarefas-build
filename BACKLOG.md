# Backlog e Melhorias Identificadas pelo Usuário — App de Missões

Este documento centraliza todas as melhorias observadas no uso real e as evoluções estratégicas planejadas para as próximas versões (`v1.1`, `v2.0`), seguindo a regra do protocolo: *"Ideias novas vão para o backlog, não para o código da versão em andamento."*

A arquitetura de evolução respeita a separação clara entre dois mundos:
1. **A Tela da Tarefa (Responsável):** Foco na execução da missão, autogestão e qualidade na fonte.
2. **A Tela de Gestão de Tarefas (Gestor):** Foco no fluxo entre missões, dependências, nivelamento e aprendizados da equipe.
3. **O Avaliador Independente (IA / JEV):** Um terceiro elemento neutro entre gestor e responsável para avaliar o andamento sem gerar atrito pessoal.
4. **Engenharia Reversa de Demandas e Verificação Epistêmica (Inspirado no REA):** Ferramental para transformar pedidos vagos em contratos estruturados e auditar evidências de entrega.

---

## 1. Melhorias Gerais de Interface (Candidatas à v1.1)

| ID | Item / Melhoria | Origem | Notas Técnicas para Implementação | Status |
|---|---|---|---|---|
| **UI-01** | **Estilo Black / Modo Escuro (Dark Mode)** | Demandante (18/10/2026) | O arquivo [`public/styles.css`](./public/styles.css) já utiliza variáveis CSS globais (`:root { --bg, --surface, --border, --text, --muted, ... }`). Basta adicionar um tema `[data-theme="dark"]` (ou `@media (prefers-color-scheme: dark)`) e um botão de alternância `☀️ / 🌙` na barra superior, salvando a preferência no `localStorage`. | Proposto |

---

## 2. Evoluções na Tela da Tarefa — Visão do Responsável

Na tela do responsável, o objetivo não é vigiar, mas dar **ferramentas de autogestão e dicas baseadas nos conceitos da Toyota** no momento em que ele planeja e executa suas etapas:

| ID | Item / Estratégia | Conceito Base | Como funciona na Tela do Responsável | Status |
|---|---|---|---|---|
| **RESP-01** | **Guia dos 3 Conceitos Toyota no Planejamento de Etapas (com Margem de Revisão)** | *Jidoka* (Qualidade na Fonte), *Heijunka* (Ritmo Nivelado) e *Genchi Genbutsu* (Validar Cedo) | Em vez de um alerta frio de "margem zero", apresentar na caixa de **Etapas** um guia rápido/checklist interativo com 3 princípios práticos da Toyota e dicas ao montar o plano:<br>1. **Margem de Autorevisão (*Jidoka*):** *"Você deixou pelo menos 1 dia útil de margem antes do prazo final para revisar seu próprio trabalho com calma?"*<br>2. **Descoberta Cedo (*Genchi Genbutsu / Front-loading*):** *"Sua primeira etapa já testa na prática o ponto mais difícil ou incerto da missão?"*<br>3. **Passo Pequeno e Constante (*Heijunka*):** *"Suas etapas têm entregas curtas (2 a 4 dias) para não acumular tudo na última semana?"* | Proposto |
| **RESP-02** | **Sinalização de Risco Inicial no Plano (*Backbrief* Rápido)** | *Mission Command Backbrief* | Campo opcional de 1 linha junto ao plano de etapas: *"Ponto de atenção ou dúvida que já enxergo no início"*, permitindo alinhar expectativas no Dia 1 sem precisar abrir um impedimento formal. | Proposto |

---

## 3. Evoluções na Tela de Gestão de Tarefas — Visão do Gestor

A tela do gestor cuida do **sistema de gestão de múltiplas missões** — evoluindo da lista atual para uma visão de fluxo e coordenação (inspirada em *Obeya Room* da Toyota, *Kanban de Fluxo* e *WarpDrive* da SpaceX):

| ID | Item / Estratégia | Inspiração | Como funciona na Tela de Gestão | Status |
|---|---|---|---|---|
| **GEST-01** | **Quadro de Fluxo (Kanban / Obeya) e Grafo de Dependência entre Missões** | Toyota *Obeya* + SpaceX *WarpDrive* | Transformar o painel de gestão para visualizar o fluxo das missões em colunas/raias de estado (*Aguardando Plano → Em Execução → Com Impedimento → Em Revisão/Entrega → Concluída*) e permitir vincular **`MS-028 depende da MS-027`**. Se a missão anterior atrasar, sofrer *Alteração* ou for entregue *Com ressalvas*, o painel sinaliza imediatamente as missões seguintes afetadas. | Proposto |
| **GEST-02** | **Memória de Lições na Criação (*Closed-Loop PRACA*)** | NASA *PRACA* + Toyota *Hansei* | Na tela de *Nova Missão*, exibir de forma acessível as últimas frases de encerramento (`O que melhorar na próxima especificação` e `O que dificultou`) das missões anteriores, com 1 clique para incorporar uma lição aprendida nos novos critérios. | Proposto |
| **GEST-03** | **Templates de Critérios por Natureza da Missão** | NASA *Flight Rules* + Toyota *SBCE* | Botões rápidos na criação da missão para pré-estruturar os campos *Precisa acontecer / Não pode acontecer / Consultar antes* conforme o tipo: **(a) Execução Padrão**, **(b) Ensaio / Pesquisa de Limites (SBCE)** ou **(c) Resolução de Incidente**. | Proposto |

---

## 4. Avaliador Independente por IA (JEV — Julgador / Avaliador Neutro)

Para eliminar a "trica" (atrito pessoal ou desgaste subjetivo) entre gerente e responsável sobre como está o andamento de uma tarefa, entra a figura de um **avaliador separado e automatizado**:

| ID | Item / Estratégia | Papel no Protocolo | Como funciona Tecnicamente | Status |
|---|---|---|---|---|
| **IA-01** | **Avaliador JEV (IA Leve de Avaliação de Status e Orientação)** | Árbitro Técnico Neutro (sem atrito entre gestor e responsável) | Um modelo de IA leve e rápido (chamado via Cloud Function quando o plano ou o diário é atualizado) lê os dados objetivos da folha (critérios, etapas, datas, margem de revisão, pendências e histórico) e:<br>1. **Escolhe 1 status padronizado** dentro de uma lista fechada (ex.: `No Ritmo com Margem`, `Em Andamento sem Margem de Revisão`, `Risco de Escopo`, `Bloqueado por Decisão`, `Pronto para Revisão Final`).<br>2. **Emite uma orientação curta e imparcial** (1 a 2 frases) útil tanto para o responsável quanto para o gestor.<br>Como a classificação vem do **JEV (IA)** e não de uma cobrança manual do chefe, preserva-se a relação de confiança na equipe. | Proposto |

---

## 5. Estratégias do Projeto REA (*Reverse Engineer Anything*) Aplicadas a Missões

**Repositório de Origem:** [`morluto/rea`](https://github.com/morluto/rea) (GitHub) — Ferramenta e servidor MCP para engenharia reversa automatizada por agentes de IA, operando por inspeção de fronteiras externas, desconstrução em evidências e reconstrução verificada.

| ID | Funcionalidade Proposta | Conceito Estratégico no REA | Como funciona Operacionalmente no App de Missões | Status |
|---|---|---|---|---|
| **REA-01** | **Engenharia Reversa de Demandas Vagas (Gerador de Missão por Caixa-Preta)** | *Black-Box Inspection & Interface Tracing* | Muitas vezes o gestor tem apenas uma ordem vaga ou um documento final desejado (ex.: "precisamos de um laudo do concreto igual ao da obra tal"), mas não sabe fatiar a especificação. Um assistente inteligente no app permite ao gestor colar o texto livre ou anexar o exemplo de saída, e a IA faz a "engenharia reversa" da demanda: deduz o objetivo (`OV-1`), sugere o entregável (`OV-5b`) e propõe a tríade de critérios (*Precisa acontecer*, *Não pode acontecer*, *Consultar antes*), restando ao gestor apenas revisar e assinar. | Proposto |
| **REA-02** | **Auditoria Epistêmica no Acompanhamento (*Seen vs. Guessed vs. Unknown*)** | *Epistemic State Tracking (Seen / Guessed / Unknown)* | No REA, para evitar que o agente alucine conclusões técnicas, cada fato é explicitamente rotulado como verificado (*Seen*), deduzido/suposto (*Guessed*) ou desconhecido (*Unknown*). No app de missões, o avaliador JEV ou a própria interface ajuda o responsável a separar no plano: o que já é premissa validada na prática e o que é mera suposição de prazo/capacidade, evitando que etapas inteiras sejam construídas em cima de hipóteses frágeis sem teste prévio. | Proposto |
| **REA-03** | **Verificação de Entrega Baseada em Evidência Direta (*Evidence-Backed Verification*)** | *Proof-backed Clean-room Reconstruction* | O REA não aceita que uma reconstrução está pronta sem confrontar as evidências de teste contra a especificação de entrada. No app de missões, no momento em que o responsável clica em "Fazer entrega", o sistema cruza automaticamente o link/documento anexado com os itens do *Precisa acontecer*, destacando para o gestor uma checagem ponto a ponto antes da homologação final. | Proposto |

---

## 6. Evoluções Funcionais Originais do Protocolo (Seção 13 da Especificação)

| ID | Item | Por que ficou para depois da v1 | Quando implementar |
|---|---|---|---|
| **FN-01** | **Chat entre responsável e gestor (2ª aba da missão)** | Na v1, a pendência com resposta cobre a comunicação e deixa registro formal na folha. Quando entrar, será subcoleção `mensagens` em tempo real, mantendo a regra: o que mudar o cabeçalho vira **alteração**. | v1.1 / v2.0 |
| **FN-02** | **Motivo "sem trabalho" para um intervalo de dias** (*ex.: "outra missão até sexta"*) | Detalhe de interface que reduz toques em ausências planejadas. | v1.1 |
| **FN-03** | **Seletor de missões para responsável com mais de uma missão ativa** | Na v1, o app abre direto na missão ativa mais recente do responsável. | Junto com a visão de equipe (v2.0) |
| **FN-04** | **Visão de equipe: limite de 2 missões por pessoa, prioridade, *heijunka* e carga invisível** | São regras entre folhas (várias missões por pessoa) — sinergia direta com o **GEST-01**. | v2.0 |
| **FN-05** | **Complemento de pesquisa e teste** (pergunta, hipótese, protocolo antes dos dados, limites) | Tipo especial de missão (ver `proposta_solicitacao_pesquisa_testes.md`) — sinergia direta com **GEST-03**. | Primeira extensão de domínio recomendada |
| **FN-06** | **Biblioteca pesquisável de aprendizados dos encerramentos** | Sinergia direta com **GEST-02**. | Quando o histórico de missões concluídas crescer |
| **FN-07** | **Integração com a API do Google Drive/Docs** (criar Docs e pasta automaticamente ao emitir) | Na v1, colar os links opcionais (editáveis por gestor e responsável) evita pedir permissões sensíveis do Drive no login. | Se colar os links virar atrito real |
| **FN-08** | **Produto para outras equipes (SaaS)** | A estrutura no Firestore já separa `equipes/{equipeId}`; faltam apenas fluxo comercial, termos de uso e LGPD. | Quando houver uma segunda equipe interessada |
