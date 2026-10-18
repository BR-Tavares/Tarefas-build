# Backlog e Melhorias Identificadas pelo Usuário — App de Missões

Este documento centraliza todas as melhorias observadas no uso real e as evoluções estratégicas planejadas para as próximas versões (`v1.1`, `v2.0`), seguindo a regra do protocolo: *"Ideias novas vão para o backlog, não para o código da versão em andamento."*

## 0. Hierarquia dos documentos e decisões de concepção (18/10/2026)

> **Estado deste backlog:** a próxima versão ainda está em concepção. **Nenhum item aqui está aprovado para implementação.** A implementação de qualquer item só começa com aprovação explícita do demandante.

**Qual documento define o quê:**

| Documento | Papel | Tempo verbal |
|---|---|---|
| `fundamentos_engenharia_missoes.md` | Orientação teórica e espaço semântico (o *porquê*) | Permanente |
| **`BACKLOG.md` (este)** | **Define os próximos passos e as decisões das próximas versões (o *quê fazer*)** | Futuro |
| `governanca/SPECIFICATION.md` e `docs/protocolo_missoes.md` | Descrevem o que já está implementado e as regras de uso atuais | Presente |

Quando um item deste backlog é implementado, a especificação é atualizada para descrevê-lo. A especificação antiga **não bloqueia** item que o demandante aprovar aqui; um conflito com ela é resolvido aqui e depois refletido nela.

**Princípio de projeto (lean com acompanhamento Toyota, só o de eficiência máxima):** os responsáveis não são máquinas; têm dinâmica própria, como plantas. Quem se adapta é a interface, não a pessoa. Nada novo é exigido do responsável além do que já existe.

| # | Decisão | Consequência no desenvolvimento |
|---|---|---|
| D1 | **A data estimada de entrega é suficiente.** Não haverá data por etapa nem cálculo de margem ou ritmo. | Itens baseados em datas de etapa foram retirados (ver RESP-01). |
| D2 | **O responsável preenche atividades e pendências conforme o processo ocorre.** Nenhum campo novo obrigatório para ele. | RESP-02 absorvido pela pendência *Dúvida*. |
| D3 | **O prazo não é o fator limitante; o rumo é.** O objetivo é compreensão e ajuste de rota para evitar retrabalho. | O JEV avalia aderência ao contrato, não atraso. Sinais de data continuam só no painel do gestor. |
| D4 | **O JEV é o supervisor neutro da tarefa e aparece para o responsável com tom auxiliador.** A forma visual ainda não está definida. | A saída do JEV separa a orientação ao responsável (auxiliadora) da nota ao gestor. |
| D5 | **O gestor tem o dashboard completo de todas as tarefas da equipe.** | GEST-01 é o painel principal do gestor. |
| D6 | **"Com ressalvas" não é uma situação nova.** É derivada: revisão `concluida` com `produto ≠ atende` ou com `desvios` preenchido. | Usada para propagar impacto às missões dependentes (GEST-01). |
| D7 | **O JEV fica para depois que o app estiver definido** (telas do gestor e do responsável estáveis). | IA-01, RESP-01 e RESP-03 ficam como *Adiado*. A especificação do JEV continua registrada aqui para não se perder. |
| D8 | **Sugestão (não decidida):** para o gestor gerar a tarefa, usar uma IA do Gemini via API. | Anotada em REA-01. Avaliar quando o REA-01 entrar na fila. |

### Sequência sugerida para discussão (não aprovada)

Proposta de encadeamento lógico entre os itens, para orientar a concepção da próxima versão. Não é um plano de execução.

1. **GEST-03** (natureza da missão e modelos de critério): barato e sem IA.
2. **GEST-01** (painel completo da equipe e dependências entre missões).
3. **GEST-02** (incorporar lições com 1 clique) e **UI-01**.
4. **REA-01** (gerar a missão a partir de demanda vaga), com a sugestão do Gemini (D8).
5. **IA-01 + RESP-03** (JEV), só depois que o app estiver definido (D7).

---

A arquitetura de evolução respeita a separação clara entre quatro frentes:
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

Na tela do responsável não há vigilância nem campos novos (D1, D2). A ajuda chega pela interface e pelo JEV, em tom auxiliador:

| ID | Item / Estratégia | Conceito Base | Como funciona na Tela do Responsável | Status |
|---|---|---|---|---|
| **RESP-01** | **Conceitos Toyota como perguntas do JEV, não como checklist de datas** | *Genchi Genbutsu* (validar cedo), *Jidoka* (qualidade na fonte) | Sem datas por etapa (D1). Os conceitos viram perguntas de orientação que o JEV usa quando os fatos da folha pedem: *"A primeira etapa já testa o ponto mais incerto?"*, *"Antes de entregar, as evidências de cada critério já estão onde o gestor vai procurar?"*. *Heijunka* (ritmo) fica fora, porque exige datas por etapa. | Adiado (D7) |
| **RESP-02** | ~~Campo de ponto de atenção no plano~~ | *Backbrief* | Absorvido: a dúvida inicial é aberta como pendência *Dúvida*, que já existe e já notifica o gestor (D2). | Absorvido |
| **RESP-03** | **Espaço do JEV na folha (forma a definir)** | Supervisor neutro (D4) | Exibe só a orientação ao responsável (1 a 2 frases, tom auxiliador, de preferência em forma de pergunta). Nunca mostra status de atraso nem comparação com outras pessoas. Forma visual a definir: candidatos são um cartão discreto acima do registro do dia ou uma nota ao lado das etapas. | Adiado (D7) |

---

## 3. Evoluções na Tela de Gestão de Tarefas — Visão do Gestor

A tela do gestor cuida do **sistema de gestão de múltiplas missões** — evoluindo da lista atual para uma visão de fluxo e coordenação (inspirada em *Obeya Room* da Toyota, *Kanban de Fluxo* e *WarpDrive* da SpaceX):

| ID | Item / Estratégia | Inspiração | Como funciona na Tela de Gestão | Status |
|---|---|---|---|---|
| **GEST-01** | **Quadro de Fluxo (Kanban / Obeya) e Grafo de Dependência entre Missões** | Toyota *Obeya* + SpaceX *WarpDrive* | Transformar o painel de gestão para visualizar o fluxo das missões em colunas/raias de estado (*Aguardando Plano → Em Execução → Com Impedimento → Em Revisão/Entrega → Concluída*) e permitir vincular **`MS-028 depende da MS-027`**. Se a missão anterior atrasar, sofrer *Alteração* ou for entregue *Com ressalvas* (D6), o painel sinaliza imediatamente as missões seguintes afetadas.<br>**Implementação:** campo `dependeDe: [missaoId]` na missão (gestor grava); função pura `impactos(missoes)` em `analise.js` que gera o sinal `dependencia_impactada`; coluna extra *Aguardando plano* derivada de `primeiroPlanoEm` vazio; quando o JEV existir (D7), o status dele aparece em cada cartão (D5). | Proposto |
| **GEST-02** | **Memória de Lições na Criação (*Closed-Loop PRACA*)** | NASA *PRACA* + Toyota *Hansei* | Na tela de *Nova Missão*, exibir de forma acessível as últimas frases de encerramento (`O que melhorar na próxima especificação` e `O que dificultou`) das missões anteriores, com 1 clique para incorporar uma lição aprendida nos novos critérios.<br>**Já existe:** leitura das 4 últimas frases na Nova Missão. **Falta:** incluir os `desvios` das entregas, o botão de incorporar e a marca de lição aplicada (fecha o ciclo). | Parcial |
| **GEST-03** | **Templates de Critérios por Natureza da Missão** | NASA *Flight Rules* + Toyota *SBCE* | Botões rápidos na criação da missão para pré-estruturar os campos *Precisa acontecer / Não pode acontecer / Consultar antes* conforme o tipo: **(a) Execução Padrão**, **(b) Ensaio / Pesquisa de Limites (SBCE)** ou **(c) Resolução de Incidente**.<br>O tipo escolhido fica gravado na missão (`natureza`) e, no futuro, serve de ponto de partida para o JEV (IA-01). | Proposto |

---

## 4. Avaliador Independente por IA (JEV — Julgador / Avaliador Neutro)

Para eliminar a "trica" (atrito pessoal ou desgaste subjetivo) entre gerente e responsável sobre como está o andamento de uma tarefa, entra a figura de um **avaliador separado e automatizado**:

| ID | Item / Estratégia | Papel no Protocolo | Como funciona Tecnicamente | Status |
|---|---|---|---|---|
| **IA-01** | **Avaliador JEV — supervisor neutro de rumo da tarefa** | Árbitro técnico neutro entre gestor e responsável (D3, D4) | **1. Avalia o tipo de tarefa.** Na emissão e a cada alteração, classifica a natureza da missão (`execucao_padrao`, `ensaio_limites`, `incidente`), partindo do campo `natureza` do GEST-03 quando ele existir. A natureza muda o que conta como estar no rumo: num ensaio, achar um limite é progresso; numa execução padrão, é desvio.<br>**2. Avalia se a tarefa segue no rumo certo**, sem usar o prazo como critério. Compara o que acontece (atividades do dia, etapas, pendências e respostas, alterações, desvios) com o contrato (necessidade, resultado esperado, entrega, critérios, precisa / não pode / consultar antes). Exemplos de deriva: atividades sem relação com a entrega; um critério sem nenhuma atividade que leve a ele; algo próximo de um "consultar antes" sem consulta aberta; uma resposta do gestor que não mudou as atividades seguintes.<br>**3. Escolhe 1 status de uma lista fechada:** `no_rumo`, `rumo_a_confirmar` (poucos registros para julgar), `possivel_desvio_de_escopo`, `decisao_pendente`, `criterio_sem_caminho`, `pronto_para_entregar`.<br>**4. Emite duas saídas:** `orientacaoResponsavel` (tom auxiliador, 1 a 2 frases, de preferência uma pergunta, sem cobrança; ver RESP-03) e `notaGestor` (diagnóstico objetivo, para o painel do GEST-01).<br>**Implementação:** Cloud Function acionada por gravações em `registros`, `pendencias`, `responsavel/estado` e `alteracoes`, no máximo 1 avaliação por missão por dia (*debounce*). Grava `missoes/{id}/avaliacao/atual` e o histórico em `avaliacoes/{AAAA-MM-DD}`. **Só a função grava**: as regras negam escrita de clientes; gestor e responsável leem. Os fatos objetivos (dias na mesma atividade, pendências abertas, critérios atendidos) são calculados por funções puras em `analise.js` e enviados ao modelo junto com o contrato. O modelo escolhe o status apenas dentro da lista fechada, e a saída é validada por esquema. | Adiado (D7) |

---

## 5. Estratégias do Projeto REA (*Reverse Engineer Anything*) Aplicadas a Missões

**Repositório de Origem:** [`morluto/rea`](https://github.com/morluto/rea) (GitHub) — Ferramenta e servidor MCP para engenharia reversa automatizada por agentes de IA, operando por inspeção de fronteiras externas, desconstrução em evidências e reconstrução verificada.

| ID | Funcionalidade Proposta | Conceito Estratégico no REA | Como funciona Operacionalmente no App de Missões | Status |
|---|---|---|---|---|
| **REA-01** | **Engenharia Reversa de Demandas Vagas (Gerador de Missão por Caixa-Preta)** | *Black-Box Inspection & Interface Tracing* | Muitas vezes o gestor tem apenas uma ordem vaga ou um documento final desejado (ex.: "precisamos de um laudo do concreto igual ao da obra tal"), mas não sabe fatiar a especificação. Um assistente inteligente no app permite ao gestor colar o texto livre ou anexar o exemplo de saída, e a IA faz a "engenharia reversa" da demanda: deduz o objetivo (`OV-1`), sugere o entregável (`OV-5b`) e propõe a tríade de critérios (*Precisa acontecer*, *Não pode acontecer*, *Consultar antes*), restando ao gestor apenas revisar e assinar.<br>**Sugestão do demandante (D8, não decidida):** usar uma IA do Gemini via API para essa geração, chamada por Cloud Function, para não expor a chave no PWA. A IA só propõe; nada é gravado na missão sem a revisão do gestor. | Proposto |
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
