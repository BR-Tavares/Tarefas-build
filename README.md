# Tarefas-build — App de Missões (PWA v1)

Implementação da v1 do **App de Missões (PWA no Firebase)**, seguindo integralmente o **Protocolo de Missões v2.7** (`protocolo_missoes.md`) e a **Especificação v1.2** (`especificacao_app_missoes.md`).

- **URL do PWA (Firebase Hosting):** `https://tarefas-build.web.app`
- **Projeto Firebase:** `tarefas-build` (região `southamerica-east1` — São Paulo)

---

## Arquitetura e Estrutura

- `public/analise.js` e `functions/analise.js`: cópia intacta do módulo puro `analise.js`, compartilhado entre o painel do gestor e a Cloud Function agendada de sinais.
- `public/adaptador.js`: converte os documentos e subcoleções do Firestore nos objetos `{ g, r }` esperados por `analise.js` e resolve os links vigentes (`docsUrl` e `pastaUrl` com timestamp `linksEm`, permitindo edição tanto pelo gestor em `missoes/{id}` quanto pelo responsável em `responsavel/estado` sem quebrar a regra de um único escritor por documento).
- `public/feriados.js`: feriados nacionais de 2026 e 2027 pré-carregados ao criar a equipe + formatação de datas no fuso `America/Sao_Paulo`.
- `public/tela-equipe.js`: tela **Equipe** exclusiva do gestor (incluir/desativar responsáveis e gerir feriados).
- `public/tela-nova-missao.js`: criação de rascunho, consulta aos aprendizados de encerramentos anteriores, emissão de missão (`MS-NNN`) e alteração de cabeçalho com avanço de versão.
- `public/tela-folha.js`: os 5 blocos da folha da missão (cabeçalho, etapas com aviso do primeiro plano, pendências e respostas/alterações, entrega/revisão/encerramento e registro do dia em uma linha com auto-complete em até 3 toques e suporte offline via `persistentLocalCache`), além da folha espelhada do gestor com painel, linha do tempo e perguntas do Coaching Kata.
- `public/tela-painel.js`: lista e painel do gestor em tempo real, destacando no topo os sinais que notificam.
- `public/notificacoes.js` & `public/firebase-messaging-sw.js`: coleta de permissão/token FCM (`equipes/{id}/tokens/{uid}`) e exibição de notificações push.
- `functions/index.js`: Cloud Functions v2 em `southamerica-east1` para eventos em tempo real e agendamento de hora em hora (8h–18h nos dias úteis).
- `firestore.rules` & `test/firestore.rules.test.js`: regras de segurança no servidor garantindo um único escritor por documento e isolamento por papel/equipe, testadas no Firebase Firestore Emulator.

---

## Como rodar os testes automatizados

```bash
# Testes de unidade da análise e critérios 5, 7, 8, 9, 10 e 11
npm run test:analise

# Testes das regras de segurança no Firebase Firestore Emulator (critérios 1, 6, 12 e 13)
npm run test:rules

# Suite completa
npm test
```

---

## Passo a Passo de Administração (Gestor)

### 1. Primeiro acesso e criação da equipe
1. Acesse `https://tarefas-build.web.app` e clique em **Entrar com conta Google**.
2. No primeiro acesso do projeto, informe o nome da equipe e clique em **Criar equipe**. Sua conta será gravada como `gestorUid` e os feriados nacionais de 2026 e 2027 já serão cadastrados automaticamente.

### 2. Incluir e desativar pessoas (Responsáveis)
1. No menu superior do gestor, clique em **Equipe**.
2. Em **Incluir responsável na equipe**, preencha o **Nome** e o **E-mail Google** da pessoa e clique em **Incluir pessoa** (grava `equipes/{id}/membros/{email}` com `papel: "responsavel"` e `ativo: true`).
3. Para revogar o acesso de alguém sem perder o histórico das missões anteriores, clique em **Desativar** ao lado do nome na lista (`ativo: false`). Para restaurar o acesso, clique em **Reativar**.

### 3. Gerir feriados (nacionais e locais)
1. Na tela **Equipe**, role até **Feriados e dias sem expediente**.
2. Para incluir um feriado municipal/estadual ou emenda, escolha a data no seletor e clique em **Adicionar feriado**.
3. Para remover uma data, clique no `×` ao lado dela.

---

## Guias de Uso (1 página cada)

- [Guia de Uso — Gestor](./guia_uso_gestor.md)
- [Guia de Uso — Responsável](./guia_uso_responsavel.md)
