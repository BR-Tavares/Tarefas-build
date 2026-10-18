# STATUS — App de Missões (Produção)

> **Natureza deste documento:** Fotografia da verdade operacional no presente. Atualizado a cada deploy ou validação em produção.

- **Data da fotografia:** 18/10/2026  
- **Versão em produção:** `v1.0.0` (tag Git `v1.0.0`, commit de base `bb230ff`)  
- **URL ativa:** `https://tarefas-build.web.app`  
- **Infraestrutura ativa:** Firebase Hosting, Firestore Database (`(default)`) e 6 Cloud Functions v2 em `southamerica-east1` (São Paulo).

---

## 1. Inventário de Recursos em Produção

| Componente | Estado Operacional | Evidência / Verificação |
|---|---|---|
| **PWA Web App** | Ativo / Online | `https://tarefas-build.web.app` (cache Service Worker `missoes-pwa-v2`) |
| **Firestore Database** | Ativo / Protegido | Regras de segurança em `firestore.rules` (isolamento por equipe e 1 escritor por doc) |
| **Índices Firestore** | Construídos | `responsavelEmail ASC + emitidaEm ASC` em status Ativo no Console |
| **Cloud Functions v2** | 6 funções ativas | `aoEmitirMissao`, `aoResponderPendencia`, `aoSalvarPrimeiroPlano`, `aoAbrirPendencia`, `aoFazerEntrega`, `verificarSinaisAgendado` |
| **Faturamento GCP** | Blaze Vinculado | Conta `0168E5-5DB6F9-D473C1` ativa com alertas de orçamento |
| **Notificações Push (FCM)**| Ativo | Chave de par de chaves VAPID configurada no cliente e tokens em `equipes/{id}/tokens/{uid}` |

---

## 2. Conformidade dos Critérios de Aceite (v1.0.0)

Todos os 14 critérios de aceite da especificação técnica foram validados e aprovados:

| # | Critério de Aceite | Status | Meio de Verificação |
|---|---|---|---|
| 1 | Responsável não abre missão de terceiros nem lista geral | **Aprovado** | Teste automatizado no Emulator (`firestore.rules.test.js`) + roteamento em `app.js` |
| 2 | Registro do dia em no máximo 3 toques com auto-complete | **Aprovado** | Verificado em `tela-folha.js` (2 toques: foco no campo → toque na sugestão) |
| 3 | Registro offline sincronizado quando conexão retorna | **Aprovado** | `persistentLocalCache` em `firebase-config.js` |
| 4 | Tela do responsável livre de sinais, contagem e cobrança | **Aprovado** | `tela-folha.js` (bloco de análise restrito a `papel === 'gestor'`) |
| 5 | Alteração avança versão e aparece como não vista até abertura | **Aprovado** | Teste unitário (`analise.test.js`) + gravação de `vistoVersao` |
| 6 | Pendência só pode ser fechada pelo responsável que a abriu | **Aprovado** | Teste de regras no Emulator (`firestore.rules.test.js`) |
| 7 | Cenário MS-027 em 23/10 (execução normal sem sinais) | **Aprovado** | Teste automatizado (`analise.test.js`) |
| 8 | Cenário MS-027 em 29/10 (impedimento aberto há 5d) | **Aprovado** | Teste automatizado (`analise.test.js`) |
| 9 | Impedimento total sem resposta: situação "Impedida", avanço de data | **Aprovado** | Teste automatizado (`analise.test.js`) |
| 10 | Entrega sem revisão há 5d: sinal de espera pela revisão | **Aprovado** | Teste automatizado (`analise.test.js`) |
| 11 | Feriados cadastrados não contam como dias úteis | **Aprovado** | Teste automatizado (`analise.test.js`) |
| 12 | Mesmo link redireciona gestor para lista e responsável para missão | **Aprovado** | `app.js` + testes de regras |
| 13 | Regras do Firestore bloqueiam gravações cruzadas | **Aprovado** | 6 testes de segurança no Emulator (`firestore.rules.test.js`) |
| 14 | Notificação push em tempo real para gestor; silêncio para responsável | **Aprovado** | Cloud Functions v2 em `southamerica-east1` |

---

## 3. Estado da Suíte de Testes Automatizados

- **Resultado atual:** 14 testes passando (0 falhas).
  - `analise.test.js`: 8 testes de unidade cobrindo o algoritmo puro de sinais e cálculo de dias úteis.
  - `firestore.rules.test.js`: 6 testes de integração de segurança no Firebase Emulator.

---

## 4. Bloqueios e Riscos Atuais

- **Nenhum bloqueio técnico em produção.** O sistema está operacional e estável.
- **Próximos passos de produto:** Concepção da próxima versão no [BACKLOG.md](../BACKLOG.md).
