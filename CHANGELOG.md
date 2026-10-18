# Changelog

Todas as alterações relevantes deste projeto seguem o padrão [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/) e o versionamento semântico.

## [1.1.0] - 2026-10-18

### Modificado (Changed)
- **Folha da Missão v1.1 (`public/tela-folha.js` e `public/styles.css`):**
  - **F2 / A1:** Removido selo de situação da folha nas duas vistas; o cabeçalho agora reflete exclusivamente código e versão ("MS-NNN · versão N").
  - **F2 / A2:** Rascunhos agora iniciam e exibem "versão 0", e a emissão oficial grava "versão 1".
  - **F4 / A3 / A4 / A5:** Criação da subcoleção `planos` no Firestore. Salvar alterações nos nomes das etapas grava histórico com timestamp e versão; somente o gestor tem acesso de leitura, com visualizador recolhido de "Planos anteriores" destacando o que entrou e o que saiu.
  - **F5 / A6:** Bloco de **Pendências** reformulado em menu suspenso de uma linha por padrão; ao abrir, ordena pendências abertas primeiro (respondidas antes das não respondidas) e fechadas depois. Rótulo de alteração agora aponta a versão criada pela alteração.
  - **F6 / A7:** Bloco do registro renomeado para **"Foco de hoje"** com texto de ajuda "Em que você focou hoje? Só o nome da atividade.".
  - **F7 / F8 / A8 / A9 / A10 / A11:** Novo modelo de entrega e revisão por contrato:
    - Campo obrigatório de **Link da entrega** (o documento de entrega vive fora da folha).
    - Tabela de **Checklist dos critérios de conclusão** com marcas (*Atendido*, *Parcial*, *Não atendido*), exigindo justificativa obrigatória para parcial/não atendido.
    - Ciclo de entrega: "Preencher entrega" $\to$ "Corrigir entrega" (edita o mesmo documento sem duplicar entregas) $\to$ "Atualizar entrega" (gera nova entrega caso haja critérios com ajuste).
    - Revisão do gestor com aprovação critério a critério (*Aceito* / *Não aceito* com "O que falta").
  - **F9 / A12:** Adicionado link "ver um exemplo de folha" e módulo `public/exemplo-didatico.js` (MS-000 da cesta nutritiva) para consulta didática em modo somente leitura.
  - **A13:** Compatibilidade garantida para leitura de entregas legadas da v1.0.

---

## [1.0.0] - 2026-10-18

### Adicionado (Added)
- **Fatia (a) — Fundação, Autenticação, Tela Equipe e Segurança (`firestore.rules`):**
  - Configuração completa do projeto Firebase `tarefas-build` (`southamerica-east1`) com Hosting, Authentication (Google), Firestore nativo e Cloud Functions (Plano Blaze).
  - Regras de segurança em `firestore.rules` garantindo um único escritor por documento, validação estrita de `registros/{AAAA-MM-DD}` (`atividade` até 80 caracteres sem espaços nas pontas **ou** `motivo`, nunca ambos) e isolamento por equipe/papel.
  - Suíte de testes automatizados no Firebase Firestore Emulator (`test/firestore.rules.test.js`) e suíte de testes unitários de análise (`test/analise.test.js`).
  - Tela **Equipe** (`public/tela-equipe.js`) com inclusão/desativação de responsáveis e gestão de feriados (nacionais de 2026/2027 pré-carregados + feriados locais).
- **Fatia (b) — Criação de Rascunho e Emissão de Missão (`public/tela-nova-missao.js`):**
  - Formulário completo do cabeçalho com consulta aos aprendizados de encerramentos anteriores, preenchimento rápido do exemplo MS-027, geração sequencial de código (`MS-NNN`) e emissão.
- **Fatia (c) — Folha do Responsável e Registro Diário Offline (`public/tela-folha.js`):**
  - Interface em 5 blocos fiel a `tela_missao_funcionario.svg`, abrindo direto na missão atribuída, sem lista, sinais, histórico ou contagem.
  - Edição de links `Docs` e `Pasta` tanto pelo gestor quanto pelo responsável mantendo um único escritor por documento (`linksEm`).
  - Registro diário em uma linha com auto-complete (`sugerirAtividades()`) e funcionamento sem conexão via `persistentLocalCache` e Service Worker (`public/sw.js`).
- **Fatia (d) — Pendências, Resposta e Alteração de Versão:**
  - Abertura de pendências nos 4 tipos (`impedimento`, `duvida`, `consulta`, `nova_data`), fechamento exclusivo pelo responsável que abriu, resposta do gestor em texto ou alteração de cabeçalho com avanço de versão (`vN`), etiqueta `"mudou na vN"` e controle de `"não vista"` (`vistoVersao`).
- **Fatia (e) — Lista, Painel, Sinais e Linha do Tempo do Gestor em Tempo Real (`public/tela-painel.js`):**
  - Painel em tempo real (`onSnapshot`) alimentado por `analise.js`, destacando no topo os sinais que exigem ação do gestor, e folha espelhada com Linha do Tempo e perguntas do Coaching Kata.
- **Fatia (f) — Entrega, Revisão e Encerramento:**
  - Registro de entrega com evidências por critério de conclusão, revisão do gestor separando conclusão da missão (`concluida` / `em_ajuste`) da avaliação do produto (`atende` / `nao_atende` / `inconclusivo`), e frases de encerramento de 1 linha do responsável e do gestor.
- **Fatia (g) — Notificações Push (FCM + Cloud Functions em `southamerica-east1`) e Documentação:**
  - 6 Cloud Functions v2 publicadas em `southamerica-east1` (`aoEmitirMissao`, `aoResponderPendencia`, `aoSalvarPrimeiroPlano`, `aoAbrirPendencia`, `aoFazerEntrega`, `verificarSinaisAgendado`).
  - Documentação completa: `especificacao_app_missoes.md` (v1.2), `protocolo_missoes.md` (v2.7), `HANDOFF_E_OPERACAO.md`, `guia_uso_gestor.md` e `guia_uso_responsavel.md`.

### Corrigido (Fixed)
- Removido import não utilizado de `somaDiasUteis` em `public/tela-nova-missao.js` que impedia o carregamento inicial de módulos ES no navegador, e atualizado o cache do Service Worker para `missoes-pwa-v2`.
