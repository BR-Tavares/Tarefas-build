# Handoff Técnico, Manual de Operação e Status — App de Missões (v1.0.0)

**Data de referência:** 18/10/2026  
**Status:** Em Produção (`v1.0.0` publicada e validada)  
**Base normativa:** `protocolo_missoes.md` (v2.7) e `especificacao_app_missoes.md` (v1.2)

---

## 1. Identificação do Ambiente e Status Executivo

| Item | Valor / Localização |
|---|---|
| **URL de Produção (PWA)** | `https://tarefas-build.web.app` (e `https://tarefas-build.firebaseapp.com`) |
| **Projeto Firebase / GCP** | `tarefas-build` (Project Number: `455008043199`) |
| **Região da Infraestrutura** | `southamerica-east1` (São Paulo) — Firestore e Cloud Functions v2 |
| **Plano de Faturamento** | **Blaze** (vinculado; consumo estimado para 4 usuários = R$ 0,00 dentro da franquia gratuita) |
| **Repositório da Aplicação** | `https://github.com/BR-Tavares/Tarefas-build` (`C:\Users\andre\Tarefas-build`) |
| **Repositório de Origem / Skills** | `https://github.com/BR-Tavares/agent-skills` (`C:\Users\andre\agent-skills\skills\Toyota_para_desenvolvimento`) |
| **Conta Administradora** | `andre.leonardo1978@gmail.com` |

---

## 2. Arquitetura do Sistema e Mapa de Arquivos

O aplicativo foi construído sem frameworks pesados (Vanilla ES Modules + CSS nativo responsivo), garantindo carregamento instantâneo no celular, funcionamento offline e manutenção simples.

```text
Tarefas-build/
├── firebase.json                 # Configuração de Hosting, Firestore, Functions e Emulators
├── .firebaserc                   # Vínculo com o projeto tarefas-build
├── firestore.rules               # Regras de segurança no servidor (1 escritor por documento)
├── firestore.indexes.json        # Índice composto (responsavelEmail ASC + emitidaEm ASC)
├── package.json                  # Scripts de teste e deploy
├── public/                       # Front-end (PWA no Firebase Hosting)
│   ├── index.html                # Shell do PWA
│   ├── styles.css                # Estilos fiéis a tela_missao_funcionario.svg
│   ├── manifest.json             # Manifesto de instalação mobile (standalone)
│   ├── icon.svg                  # Ícone vetorial do PWA
│   ├── sw.js                     # Service Worker de cache offline da interface
│   ├── firebase-messaging-sw.js  # Service Worker para notificações push em segundo plano
│   ├── firebase-config.js        # Inicialização do Auth e Firestore (persistentLocalCache)
│   ├── analise.js                # Módulo puro de análise do gestor (cópia intacta)
│   ├── adaptador.js              # Conversor Firestore -> { g, r } e resolução de links vigentes
│   ├── feriados.js               # Feriados nacionais 2026/2027 e datas em America/Sao_Paulo
│   ├── dom.js                    # Escape seguro de HTML e avisos (toast)
│   ├── app.js                    # Orquestrador de autenticação, estado em tempo real e rotas
│   ├── tela-equipe.js            # Gestão de membros e feriados (exclusiva do gestor)
│   ├── tela-nova-missao.js       # Criação/emissão de missão e alteração de versão (gestor)
│   ├── tela-folha.js             # Folha da missão (5 blocos do responsável + folha espelhada)
│   ├── tela-painel.js            # Lista de missões e painel do gestor em tempo real
│   └── notificacoes.js           # Permissão e gravação de token FCM
├── functions/                    # Back-end serverless (Cloud Functions v2, Node 22)
│   ├── package.json              # Dependências firebase-admin e firebase-functions
│   ├── analise.js                # Mesmo módulo puro usado pela função agendada
│   └── index.js                  # 5 gatilhos Firestore + 1 agendador (8h-18h dias úteis)
└── test/                         # Testes automatizados (Node Test Runner + Emulator)
    ├── analise.test.js           # 8 testes cobrindo analise.js, adaptador e critérios 5, 7-11
    └── firestore.rules.test.js   # 6 testes no Firestore Emulator cobrindo critérios 1, 6, 12, 13
```

---

## 3. Decisões Técnicas de Implementação (Handoff de Engenharia)

1. **Um único escritor por documento (`firestore.rules`):**
   - **Gestor grava:** `equipes/{equipeId}`, `membros/{email}`, `missoes/{missaoId}`, `alteracoes/{id}`, `respostas/{pendenciaId}`, `revisoes/{entregaId}`.
   - **Responsável grava:** `responsavel/estado`, `registros/{AAAA-MM-DD}`, `pendencias/{id}`, `entregas/{id}` (somente em missões já emitidas para o seu e-mail e não canceladas/concluídas).
   - **Cada usuário grava para si:** `tokens/{uid}`.
2. **Edição de links `Docs` e `Pasta` por ambos os papéis sem violar a regra de escritor único:**
   - Quando o gestor edita os links, grava `{ docsUrl, pastaUrl, linksEm }` em `missoes/{missaoId}` (sem avançar a versão da folha).
   - Quando o responsável edita os links, grava `{ docsUrl, pastaUrl, linksEm }` em `responsavel/estado`.
   - A função `obterLinksVigentes(g, r)` em `public/adaptador.js` exibe sempre o par cujo timestamp ISO `linksEm` é mais recente.
3. **Encerramento após conclusão (`R9` no protocolo):**
   - Quando o gestor salva uma revisão com `resultado: "concluida"`, grava `concluidaEm` em `missoes/{missaoId}`.
   - As regras do Firestore passam a bloquear novos `registros`, `pendencias`, `entregas` ou edição de `etapas`, mas permitem que o responsável grave em `responsavel/estado` especificamente a sua frase de encerramento (`fraseResponsavel`: *"O que a folha deveria ter dito desde o início?"*).
4. **Registro do dia em até 3 toques e sem conexão:**
   - O Firestore é inicializado com `persistentLocalCache({ tabManager: persistentMultipleTabManager() })`.
   - Ao tocar no campo de atividade (1º toque) e escolher uma atividade sugerida pelo auto-complete ou um motivo de "sem trabalho" (2º toque), o app já grava imediatamente no documento `registros/{AAAA-MM-DD}`.

---

## 4. Manual de Operação e Administração

### 4.1 Primeiro acesso e configuração da equipe
1. Confirme no Console do Firebase (`Authentication → Sign-in method`) que o provedor **Google** está **Ativado**.
2. Acesse `https://tarefas-build.web.app` e entre com a conta Google do gestor.
3. Na tela de primeiro acesso, informe o nome da equipe e clique em **Criar equipe**. O usuário torna-se `gestorUid` e os feriados nacionais de 2026 e 2027 são salvos automaticamente.

### 4.2 Incluir, desativar ou reativar responsáveis
1. Na barra superior do gestor, clique em **Equipe**.
2. Informe **Nome** e **E-mail Google** da pessoa e clique em **Incluir pessoa**.
3. Para revogar o acesso mantendo todo o histórico de missões, clique em **Desativar** (`ativo: false`). As regras de segurança do Firestore cortam o acesso imediatamente no servidor.

### 4.3 Feriados nacionais e locais
1. Na tela **Equipe**, seção **Feriados e dias sem expediente**, selecione a data do feriado municipal/estadual ou emenda e clique em **Adicionar feriado**.
2. Para excluir uma data, clique no botão `×` ao lado dela.

### 4.4 Instalação do PWA no celular
- **Android (Chrome):** Abra `https://tarefas-build.web.app` → menu `⋮` → **Instalar aplicativo** (ou *Adicionar à tela inicial*).
- **iPhone (Safari, iOS 16.4+):** Abra `https://tarefas-build.web.app` → botão **Compartilhar** → **Adicionar à Tela de Início**.
- Ao entrar pela primeira vez, toque em **Ativar avisos 🔔** na barra superior para habilitar as notificações push neste aparelho.

---

## 5. Runbook de Manutenção, Testes e Deploy (Para Desenvolvedores)

### 5.1 Rodar os testes automatizados localmente
O emulador do Firestore exige **Java 21+** no `PATH` (na máquina local, o Eclipse Adoptium JDK 25 está em `C:\Program Files\Eclipse Adoptium\jdk-25.0.3.9-hotspot`).

```powershell
cd C:\Users\andre\Tarefas-build
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-25.0.3.9-hotspot"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

# Rodar testes de unidade de analise.js e adaptador.js
npm run test:analise

# Rodar testes de segurança no Firestore Emulator
npm run test:rules

# Rodar toda a suíte (14 testes)
npm test
```

### 5.2 Publicar atualizações no Firebase
1. Sempre que alterar arquivos estáticos em `public/`, incremente a constante `CACHE_NAME` (ex.: `'missoes-pwa-v3'`) na linha 1 de `public/sw.js` para forçar a atualização imediata do cache nos celulares instalados.
2. Autentique o Firebase CLI (se necessário, `firebase login --reauth`) e publique:

```powershell
cd C:\Users\andre\Tarefas-build

# Publicar apenas Front-end e Regras do Firestore
firebase deploy --only "hosting,firestore" --project=tarefas-build

# Publicar Cloud Functions (em southamerica-east1)
firebase deploy --only functions --project=tarefas-build
```

---

## 6. Status dos Critérios de Aceite (Seção 12 da Especificação)

| # | Critério | Status | Como foi verificado |
|---|---|---|---|
| 1 | O responsável não consegue abrir a missão de outra pessoa nem a lista | **Atendido** | Teste automatizado no Emulator (`firestore.rules.test.js`) + roteamento direto em `app.js` |
| 2 | O registro do dia é feito com no máximo 3 toques quando a atividade já existe | **Atendido** | Auto-complete grava ao tocar na sugestão (2 toques: foco no campo → toque na sugestão) |
| 3 | O registro feito sem conexão é gravado no Firestore quando a conexão volta | **Atendido** | `persistentLocalCache` habilitado em `firebase-config.js` + `sw.js` |
| 4 | A tela do responsável não mostra sinal, contagem nem histórico | **Atendido** | Inspeção de `tela-folha.js` (bloco de análise só renderiza quando `papel === 'gestor'`) |
| 5 | Uma alteração avança a versão e aparece como "não vista" até o responsável abrir a folha | **Atendido** | Teste automatizado (`analise.test.js`) + gravação automática de `vistoVersao` em `tela-folha.js` |
| 6 | A pendência só fecha pelo responsável que a abriu | **Atendido** | Teste automatizado no Emulator (`firestore.rules.test.js`) + UI restrita ao responsável |
| 7 | MS-027 em 23/10: atividade atual *secar amostras n1*, 3 dias seguidos, etapas 1/4, sem sinais | **Atendido** | Teste automatizado (`analise.test.js`) |
| 8 | MS-027 em 29/10 (impedimento aberto): dias sem registro (4d), data passou, impedimento aberto há 5d | **Atendido** | Teste automatizado (`analise.test.js`) |
| 9 | Impedimento total sem resposta por 5d: situação "Impedida", data avança 5d, sem sinal de dias sem registro | **Atendido** | Teste automatizado (`analise.test.js`) |
| 10 | Entrega sem revisão há 5d: sinal de espera pela revisão, que notifica | **Atendido** | Teste automatizado (`analise.test.js`) |
| 11 | Feriado cadastrado na equipe não conta como dia útil | **Atendido** | Teste automatizado (`analise.test.js`) |
| 12 | O mesmo link abre a lista para o gestor e a missão para o responsável; quem não está na equipe vê só o aviso | **Atendido** | `app.js` (`descobrirPapelEIniciar`) + teste no Emulator (`firestore.rules.test.js`) |
| 13 | As regras do Firestore bloqueiam gravações cruzadas e leituras indevidas | **Atendido** | 6 testes automatizados no Firestore Emulator (`firestore.rules.test.js`) |
| 14 | O gestor recebe notificação de pendência aberta em até 1 min, e o responsável nunca recebe aviso de sinal | **Atendido** | Cloud Functions v2 publicadas em `southamerica-east1` (`functions/index.js`) |
