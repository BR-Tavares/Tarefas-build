# Handoff — Revisão da Lógica do Workspace de Tarefas (Lean / Toyota)

**Para:** o agente da próxima conversa
**Gerado em:** 18/10/2026
**Repositório principal:** `BR-Tavares/Tarefas-build` (branch `main`)
**Objetivo central da próxima conversa:** revisar a lógica do app de missões para que ele se torne um **método efetivo de gestão de tarefas no estilo lean e Toyota**, aproveitando só o que tem eficiência máxima para uma equipe pequena.

> **Regra de ouro:** a próxima versão ainda está **em concepção**. Nenhuma alteração de código é feita sem aprovação explícita do demandante. O produto esperado da conversa é **diagnóstico e propostas**, não implementação.

---

## 1. Como começar a conversa

O demandante prefere que toda conversa **comece nivelando ambiguidades** sobre o objetivo, antes de produzir qualquer coisa. Sequência sugerida:

1. Ler, nesta ordem: este handoff, `BACKLOG.md` (seção 0), `fundamentos_engenharia_missoes.md`, `protocolo_missoes.md` e, por fim, o código (`public/analise.js`, `public/tela-folha.js`, `public/tela-painel.js`, `public/tela-nova-missao.js`, `firestore.rules`).
2. Apresentar ao demandante as **perguntas de nivelamento da seção 6** que ainda fizerem sentido, com uma recomendação para cada uma.
3. Só depois disso, conduzir a revisão com a **lente da seção 5**.
4. Encerrar com as propostas registradas no `BACKLOG.md` (status *Proposto*), mais um artefato agregador para a conversa seguinte.

---

## 2. Quem é o demandante e o que ele valoriza

- É especialista em várias áreas (agricultura regenerativa, sensores ambientais, irrigação solar para agricultura familiar, IA na ciência e na educação) e usa a IA para acessar engenharia de software aplicada. Ele quer **direcionamentos, estratégias e blueprints no estado da arte**.
- **Princípio de projeto declarado:** *"Os responsáveis não são máquinas nem escravos; são como plantas e têm uma dinâmica própria para ser ajustada. Quem precisa se ajustar, como interface, é o sistema."*
- **Lean com acompanhamento Toyota, só o de eficiência máxima.** Cada mecanismo novo precisa justificar o custo que impõe às pessoas.
- **O prazo não é o fator limitante.** O que importa é a **compreensão e o ajuste de rota, para evitar retrabalho**.
- Quer um desenvolvedor profissional que **não trave o trabalho** por causa de documentos antigos, mas que **não implemente nada sem aprovação**.

---

## 3. Mapa dos documentos e onde está cada coisa

| Documento (em `Tarefas-build`) | Papel | Observação |
|---|---|---|
| `fundamentos_engenharia_missoes.md` | O **porquê**: base teórica (DoDAF, NASA/JPL, SpaceX, *Mission Command*, Toyota/SBCE, JEV) e vocabulário canônico | Permanente. Uma cópia idêntica existe em `agent-skills/skills/Toyota_para_desenvolvimento/` |
| **`BACKLOG.md`** | **Define os próximos passos**: decisões de concepção D1 a D8, itens propostos e uma sequência sugerida (não aprovada) | **Só existe no `Tarefas-build`** (centralizado pelo demandante em 18/10). Outro modelo também edita este arquivo: antes de editar, faça `git pull` e verifique o histórico |
| `especificacao_app_missoes.md` (v1.2) e `protocolo_missoes.md` (v2.7) | Descrevem **o que já está implementado** (v1.0.0) e as regras de uso atuais | Não bloqueiam propostas novas. São atualizados quando um item aprovado for implementado |
| `CHANGELOG.md`, `HANDOFF_E_OPERACAO.md`, `guia_uso_*.md` | Histórico da v1.0.0, runbook de operação, guias de uso | — |
| `agent-skills/skills/Toyota_para_desenvolvimento/` | Skill de método (SKILL.md, protocolo, fundamentos, propostas de pesquisa e testes) | Backlog e runbook **não** ficam mais aqui |

---

## 4. Estado atual do app (v1.0.0, implementado)

**Stack:** PWA em JavaScript (módulos ES) + Firebase (Hosting, Auth Google, Firestore com cache offline, Cloud Functions v2 e FCM em `southamerica-east1`). Equipe-alvo: 1 gestor e 3 responsáveis.

**Princípios já materializados:**
- **O gestor define o quê; o responsável define o como.** O cabeçalho (necessidade, resultado esperado, tarefa, entrega, critérios com método de verificação, insumos, *Precisa / Não pode / Consultar antes*, data estimada) é do gestor. As etapas e o método são do responsável.
- **Um escritor por documento**, garantido nas regras do Firestore. A situação da missão **é calculada, nunca gravada** (`situacao()` em `analise.js`).
- **A tela do responsável não mostra sinal, contagem nem histórico.** O registro diário é uma linha: data, atividade com auto-complete e botão.
- ***Backbrief* reduzido a uma leitura:** o responsável escreve as etapas no primeiro acesso, e o gestor recebe um aviso único (sem aprovação).
- **Andon:** a pendência `impedimento` com `bloqueio: tudo` deixa a missão *Impedida* e empurra a data estimada pelos dias úteis bloqueados.
- **Comunicação rastreável:** pendência (dúvida, consulta, impedimento, nova data) e resposta. **Resposta ≠ alteração**: a alteração avança a versão do contrato (v2, v3), marca "mudou na vN" e controla se o responsável já viu. Quem abre a pendência é quem a fecha.
- **Entrega honesta:** resultado, evidência por critério (atendido, parcial ou não atendido) e **desvios e limites**. A revisão do gestor separa a missão (concluída ou em ajuste) do produto (atende, não atende ou inconclusivo).
- **Hansei / PRACA:** 1 frase do responsável e 1 do gestor no encerramento. As últimas 4 aparecem na tela Nova Missão.
- **Sinais só para o gestor.** Metade deles cobra o próprio gestor: pendência sem resposta, espera pela revisão, impedimento aberto. Perguntas do **Coaching Kata** aparecem na folha espelhada.

**Situações calculadas, em ordem de prioridade:** cancelada → rascunho → concluída → entregue → impedida → em ajuste → em execução.

**Mapa do código:** `analise.js` (funções puras, compartilhadas entre o app e as Functions; testes em `test/analise.test.js`), `adaptador.js` (converte o Firestore nos objetos `{g, r}`), `tela-folha.js` (folha, com 5 blocos), `tela-painel.js` (lista do gestor), `tela-nova-missao.js`, `tela-equipe.js`, `functions/index.js` (5 gatilhos por evento + 1 função agendada de sinais), `firestore.rules` (testes no emulador).

---

## 5. Decisões de concepção já tomadas (resumo de `BACKLOG.md`, seção 0)

| # | Decisão |
|---|---|
| D1 | A **data estimada de entrega basta**. Não haverá data por etapa nem cálculo de margem ou ritmo |
| D2 | O responsável preenche atividades e pendências **conforme o processo ocorre**. Nenhum campo novo obrigatório para ele |
| D3 | **O rumo importa, não o prazo**: compreensão e ajuste de rota para evitar retrabalho |
| D4 | O JEV será o supervisor neutro e aparecerá para o responsável **com tom auxiliador** (forma ainda indefinida) |
| D5 | O gestor terá o **dashboard completo** de todas as tarefas da equipe |
| D6 | "Com ressalvas" é **derivada** (concluída com produto diferente de "atende" ou com desvios preenchidos), não uma situação nova |
| D7 | **O JEV fica para depois** que o app estiver definido |
| D8 | **Sugestão, não decidida:** usar uma IA do Gemini via API para o gestor gerar a missão (ver REA-01) |

**Itens propostos no backlog:** UI-01 (modo escuro); RESP-01 e RESP-03 (adiados com o JEV); GEST-01 (painel Obeya/Kanban + dependências `dependeDe`); GEST-02 (incorporar lições com 1 clique); GEST-03 (natureza da missão + modelos de critério); IA-01 (JEV, adiado); REA-01 a 03 (gerar missão a partir de demanda vaga, separar verificado, suposto e desconhecido, conferir evidência contra requisito); FN-01 a 08 (evoluções originais: chat, motivo para um intervalo de dias, seletor de missões, visão de equipe com limite de 2 missões por pessoa e *heijunka*, complemento de pesquisa e outras).

---

## 6. Perguntas de nivelamento para abrir a conversa

Estas são hipóteses levantadas na conversa anterior. **Nenhuma está decidida.** Apresente-as com uma recomendação e deixe o demandante escolher.

1. **Fluxo puxado × empurrado.** Hoje o gestor emite e a missão é empurrada para o responsável. O lean pede **limite de trabalho em andamento** (WIP). O limite de 2 missões por pessoa (FN-04) deve vir antes do painel Obeya (GEST-01), já que sem ele o painel só mostra a sobrecarga?
2. **"Nova data" ainda faz sentido?** Se o prazo não é limitante (D3), a pendência `nova_data` e o sinal "data estimada passou" mantêm o mesmo peso, ou viram informação sem cobrança?
3. **Etapas obrigatórias no primeiro acesso.** O app pede as etapas "antes de qualquer outra coisa". Isso respeita a dinâmica de "planta" ou deveria ser um convite, com o *backbrief* acontecendo quando o responsável tiver entendido o problema?
4. **Ponto de verificação no meio da missão.** A revisão só acontece no fim. A Toyota faz revisões cedo, diante do trabalho real (*genchi genbutsu*, *design reviews*). O Kata deve ter um momento leve no meio da missão, e não apenas quando há sinal ativo, como hoje?
5. **Do aprendizado ao trabalho padrão.** As frases de encerramento são relidas, mas não viram padrão. Um item como "requisito aprendido entra no modelo daquele tipo de missão" (GEST-02 + GEST-03 + FN-06) fecharia o ciclo de *kaizen*?
6. **Desperdício no trabalho do gestor.** O formulário da Nova Missão é extenso. A ajuda deve vir de modelos (GEST-03, sem IA) ou de geração por IA (REA-01, com a sugestão do Gemini)? Qual vem primeiro?
7. **Qualidade do registro diário.** A atividade do dia é o dado mais rico do sistema e a base futura do JEV. A interface pode melhorá-la (auto-complete com as etapas, por exemplo) sem exigir nada a mais do responsável?
8. **Painel do gestor como vigilância.** Indicadores como "dias seguidos na atividade" e "dias em outra missão" ajudam o gestor a remover obstáculos, ou induzem cobrança? Como a interface deve enquadrá-los?

---

## 7. Lente de revisão: princípios lean/Toyota × lógica do app

Use esta tabela para percorrer o app de forma sistemática. A coluna da direita é a pergunta de revisão, não a resposta.

| Princípio | Onde aparece hoje no app | Pergunta de revisão |
|---|---|---|
| **Respeito às pessoas** | O "como" é do responsável; a tela dele não tem sinais | Algum passo obriga o responsável a se adaptar ao sistema, quando deveria ser o contrário? |
| **Eliminar desperdício (*muda*)** | Registro de 1 linha; 3 toques | Que dado é coletado e nunca usado? Que passo do gestor poderia sumir? |
| **Fluxo e puxar (*pull*)** | Missões emitidas pelo gestor; sem limite de WIP | Onde o trabalho espera? Quem puxa a próxima missão? |
| ***Jidoka* / Andon** | Impedimento com bloqueio; "parar cedo é o esperado" | O custo de puxar a corda é baixo o suficiente? A resposta do gestor é rápida e visível? |
| ***Genchi genbutsu*** | Kata na folha espelhada; links do Docs e da pasta | O gestor é levado a olhar o trabalho real antes de julgar? |
| ***Nemawashi* / *backbrief*** | Primeiro plano + aviso único | O desalinhamento aparece no Dia 1 ou só na entrega? |
| ***Heijunka*** | Ausente (depende da visão de equipe) | O nivelamento cabe ao app ou à conversa do gestor? |
| **Trabalho padrão** | Ausente; só o exemplo MS-027 | Que parte da missão deveria nascer de um padrão por tipo? |
| ***Kaizen* / *Hansei*** | 2 frases de encerramento; 4 últimas visíveis | O aprendizado muda a próxima missão automaticamente ou depende da memória do gestor? |
| **Gestão visual (*Obeya*)** | Lista com sinais | O gestor enxerga o fluxo e as dependências num só olhar? |
| **Contrato de fronteira** (fundamentos) | Precisa / Não pode / Consultar antes + critérios verificáveis | Os requisitos são realmente usados na entrega e na revisão, ou só preenchidos? |
| **SBCE: limites honestos** | Desvios e limites; produto "inconclusivo" | O app trata "achar o limite" como sucesso em missões de ensaio? |

---

## 8. Restrições de trabalho

- **Sem código sem aprovação.** Proponha; implemente só depois do "aprovado" explícito.
- **Nada novo obrigatório para o responsável** (D2). Se uma proposta exigir dado, mostre de onde ele viria sem custo para quem executa.
- **No backlog, nunca escreva que algo "será implementado agora".** Use status *Proposto*, *Adiado* ou *Absorvido*, e "sequência sugerida para discussão".
- **Git:** o backlog é editado por mais de um modelo. Sempre `git pull origin main` antes de editar e verifique se houve commits recentes de outra sessão. Desenvolva na branch designada da sessão. Faça merge no `main` só quando o demandante pedir.
- **Linguagem dos documentos:** português, sem termos de comando, explicando o porquê (apoio à autonomia, como no protocolo).
- Não inclua identificadores de modelo de IA em commits ou documentos.

---

## 9. Entregáveis esperados da próxima conversa

1. **Diagnóstico da lógica atual** pela lente da seção 7: o que já é lean/Toyota efetivo, o que é desperdício e o que falta.
2. **Respostas do demandante** às perguntas da seção 6, registradas como novas decisões de concepção (D9 em diante) no `BACKLOG.md`.
3. **Propostas** novas ou revisadas no `BACKLOG.md`, todas como *Proposto*, cada uma com o princípio que atende e o custo que impõe às pessoas.
4. **Artefato agregador** atualizado para a conversa seguinte.

### Prompt de abertura sugerido

> "Leia `handoff_revisao_logica_lean.md` no repositório `Tarefas-build` e os documentos que ele indica. Comece nivelando comigo as perguntas da seção 6, com sua recomendação para cada uma. Depois revise a lógica do app pela lente da seção 7. Não implemente nada; registre as propostas no backlog como *Proposto*."
