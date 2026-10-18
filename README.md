# Tarefas-build — App de Missões (PWA v1.0.0)

Implementação da v1 do **App de Missões (PWA no Firebase)**, seguindo integralmente o **Protocolo de Missões v2.7** (`protocolo_missoes.md`) e a **Especificação v1.2** (`especificacao_app_missoes.md`).

- **URL de Produção (Firebase Hosting):** `https://tarefas-build.web.app`
- **Projeto Firebase / GCP:** `tarefas-build` (região `southamerica-east1` — São Paulo)
- **Status:** `v1.0.0` publicada em produção (Critérios de Aceite 1 a 14 validados)

---

## Índice de Documentação Oficial

| Seção / Pasta | Documento | Finalidade |
|---|---|---|
| **Governança** | [`governanca/SPECIFICATION.md`](./governanca/SPECIFICATION.md) | **Especificação Técnica do Sistema** (Contrato formal de requisitos da v1 no padrão SDD) |
| **Governança** | [`governanca/BACKLOG.md`](./governanca/BACKLOG.md) | **Backlog Vivo de Produto** (Decisões de concepção D1–D8, UI Black, Kanban/Obeya, JEV e REA) |
| **Governança** | [`governanca/OPERACAO.md`](./governanca/OPERACAO.md) | **Manual de Operação e Runbook** (Arquitetura, segurança, testes JDK 25 e deploy no Firebase) |
| **Governança** | [`governanca/STATUS.md`](./governanca/STATUS.md) | **Fotografia do Ambiente em Produção** (Estado atual e 14 critérios de aceite validados) |
| **Governança** | [`governanca/HANDOFF.md`](./governanca/HANDOFF.md) | **Passagem de Bastão** (Efêmero: o que foi feito na sessão e próximos passos imediatos) |
| **Doutrina & Teoria** | [`docs/fundamentos_engenharia_missoes.md`](./docs/fundamentos_engenharia_missoes.md) | **Fundamentos e Espaço Semântico** (DoDAF, NASA, SpaceX, Mission Command, Toyota e JEV) |
| **Doutrina & Teoria** | [`docs/protocolo_missoes.md`](./docs/protocolo_missoes.md) | **Protocolo de Missões (v2.7)** (Princípios Lean/Toyota e regras metodológicas da folha) |
| **Guias Rápidos** | [`docs/guia_uso_gestor.md`](./docs/guia_uso_gestor.md) | Guia rápido de uso de 1 página para o **Gestor** |
| **Guias Rápidos** | [`docs/guia_uso_responsavel.md`](./docs/guia_uso_responsavel.md) | Guia rápido de uso de 1 página para o **Responsável** |
| **Referência Visual** | [`docs/tela_missao_funcionario.svg`](./docs/tela_missao_funcionario.svg) | Esboço visual da folha do responsável no celular |
| **Histórico** | [`CHANGELOG.md`](./CHANGELOG.md) | Histórico de versões e entregas (padrão Keep a Changelog) |

---

## Arquitetura e Estrutura de Código

- `public/analise.js` e `functions/analise.js`: cópia intacta do módulo puro `analise.js`, compartilhado entre o painel do gestor e a Cloud Function agendada de sinais.
- `public/adaptador.js`: converte os documentos e subcoleções do Firestore nos objetos `{ g, r }` esperados por `analise.js` e resolve os links vigentes (`docsUrl` e `pastaUrl` com timestamp `linksEm`, permitindo edição tanto pelo gestor em `missoes/{id}` quanto pelo responsável em `responsavel/estado` sem quebrar a regra de um único escritor por documento).
- `public/feriados.js`: feriados nacionais de 2026 e 2027 pré-carregados ao criar a equipe + formatação de datas no fuso `America/Sao_Paulo`.
- `public/tela-equipe.js`: tela **Equipe** exclusiva do gestor (incluir/desativar responsáveis e gerir feriados).
- `public/tela-nova-missao.js`: criação de rascunho, consulta aos aprendizados de encerramentos anteriores, emissão de missão (`MS-NNN`) e alteração de cabeçalho com avanço de versão.
- `public/tela-folha.js`: os 5 blocos da folha da missão (cabeçalho, etapas com aviso do primeiro plano, pendências e respostas/alterações, entrega/revisão/encerramento e registro do dia em uma linha com auto-complete em até 3 toques e suporte offline via `persistentLocalCache`), além da folha espelhada do gestor com painel, linha do tempo e perguntas do Coaching Kata.
- `public/tela-painel.js`: lista e painel do gestor em tempo real, destacando no topo os sinais que notificam.
- `public/notificacoes.js` & `public/firebase-messaging-sw.js`: coleta de permissão/token FCM (`equipes/{id}/tokens/{uid}`) e exibição de notificações push.
- `functions/index.js`: 6 Cloud Functions v2 em `southamerica-east1` para eventos em tempo real e agendamento de hora em hora (8h–18h nos dias úteis).
- `firestore.rules` & `test/firestore.rules.test.js`: regras de segurança no servidor garantindo um único escritor por documento e isolamento por papel/equipe, testadas no Firebase Firestore Emulator.

---

## Como rodar os testes automatizados

```bash
# Testes de unidade da análise e critérios 5, 7, 8, 9, 10 e 11
npm run test:analise

# Testes das regras de segurança no Firebase Firestore Emulator (critérios 1, 6, 12 e 13)
npm run test:rules

# Suíte completa (14 testes)
npm test
```

---

## Resumo de Administração (Gestor)

1. **Primeiro acesso e criação da equipe:** Acesse `https://tarefas-build.web.app`, clique em **Entrar com conta Google** e crie a equipe (os feriados nacionais de 2026/2027 já entram automaticamente).
2. **Incluir e desativar pessoas:** No menu **Equipe**, cadastre o Nome e o E-mail Google do responsável. Para revogar acesso mantendo o histórico, clique em **Desativar**.
3. **Gerir feriados:** No menu **Equipe**, adicione feriados estaduais/municipais ou emendas para que `analise.js` não os conte como dias úteis.
