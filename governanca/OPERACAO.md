# Manual de Operação e Runbook de Engenharia — App de Missões

> **Natureza deste documento:** Permanente e estável. Contém a arquitetura, regras de segurança, runbook de testes e procedimentos de deploy. Só é alterado quando a infraestrutura física ou o processo de compilação/deploy mudarem.

---

## 1. Identificação do Ambiente de Produção

| Item | Valor / Localização |
|---|---|
| **URL de Produção (PWA)** | `https://tarefas-build.web.app` (e `https://tarefas-build.firebaseapp.com`) |
| **Projeto Firebase / GCP** | `tarefas-build` (Project Number: `455008043199`) |
| **Região da Infraestrutura** | `southamerica-east1` (São Paulo) — Firestore e Cloud Functions v2 |
| **Plano de Faturamento** | **Blaze** (vinculado; consumo estimado para equipe interna dentro da franquia gratuita) |
| **Repositório do Software** | `https://github.com/BR-Tavares/Tarefas-build` (`C:\Users\andre\Tarefas-build`) |
| **Repositório da Skill** | `https://github.com/BR-Tavares/agent-skills` (`C:\Users\andre\agent-skills\skills\Toyota_para_desenvolvimento`) |
| **Conta Administradora** | `andre.leonardo1978@gmail.com` |

---

## 2. Mapa Arquitetural de Arquivos

O aplicativo foi construído sem frameworks pesados (Vanilla ES Modules + CSS nativo responsivo), garantindo carregamento instantâneo no celular, funcionamento offline e manutenção simples:

```text
Tarefas-build/
├── firebase.json                 # Configuração de Hosting, Firestore, Functions e Emulators
├── .firebaserc                   # Vínculo com o projeto tarefas-build
├── firestore.rules               # Regras de segurança no servidor (1 escritor por documento)
├── firestore.indexes.json        # Índice composto (responsavelEmail ASC + emitidaEm ASC)
├── package.json                  # Scripts de teste e deploy
├── governanca/                   # Governança de projeto (STATUS, HANDOFF, OPERACAO)
├── public/                       # Front-end (PWA no Firebase Hosting)
│   ├── index.html                # Shell do PWA
│   ├── styles.css                # Estilos visuais e variáveis CSS de tema
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

## 3. Decisões Técnicas de Engenharia

1. **Um único escritor por documento (`firestore.rules`):**
   - **Gestor grava:** `equipes/{equipeId}`, `membros/{email}`, `missoes/{missaoId}`, `alteracoes/{id}`, `respostas/{pendenciaId}`, `revisoes/{entregaId}`.
   - **Responsável grava:** `responsavel/estado`, `registros/{AAAA-MM-DD}`, `pendencias/{id}`, `entregas/{id}` (somente em missões já emitidas para o seu e-mail e não canceladas/concluídas).
   - **Cada usuário grava para si:** `tokens/{uid}`.
2. **Edição de links `Docs` e `Pasta` por ambos os papéis sem violar a regra de escritor único:**
   - Gestor edita: grava `{ docsUrl, pastaUrl, linksEm }` em `missoes/{missaoId}`.
   - Responsável edita: grava `{ docsUrl, pastaUrl, linksEm }` em `responsavel/estado`.
   - `obterLinksVigentes(g, r)` exibe sempre o par com `linksEm` mais recente.
3. **Encerramento após conclusão:**
   - Gestor salva revisão com `resultado: "concluida"`, gravando `concluidaEm`.
   - As regras passam a bloquear novos registros ou entregas, mas permitem que o responsável grave sua `fraseResponsavel` final.
4. **Resiliência Offline e Baixa Fricção:**
   - `persistentLocalCache` com `persistentMultipleTabManager` habilitado no cliente.
   - Registro diário em até 2 toques gravando direto no cache local indexado por dia útil.

---

## 4. Manual de Operação e Administração

### 4.1 Gestão de Equipe e Feriados (Gestor)
1. Acesse `https://tarefas-build.web.app` com a conta do gestor e clique em **Equipe**.
2. **Incluir/Desativar:** Informe Nome e E-mail Google. Ao clicar em **Desativar**, o acesso é cortado imediatamente no servidor pelas regras do Firestore, preservando todo o histórico.
3. **Feriados Locais:** Cadastre feriados municipais/estaduais ou emendas na tela Equipe para não computarem como dias úteis no cálculo de sinais.

### 4.2 Instalação Mobile (PWA)
- **Android:** Chrome → menu `⋮` → **Instalar aplicativo**.
- **iPhone:** Safari → botão **Compartilhar** → **Adicionar à Tela de Início**.
- Ao abrir, toque em **Ativar avisos 🔔** para registrar o token de notificações push.

---

## 5. Runbook de Testes Locais e Deploy

### 5.1 Executar a suíte de testes automatizados
O emulador do Firestore exige Java 21+ configurado:

```powershell
cd C:\Users\andre\Tarefas-build
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-25.0.3.9-hotspot"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

# Testes de unidade da lógica pura de sinais e adaptador
npm run test:analise

# Testes de segurança no Firestore Emulator
npm run test:rules

# Suíte completa (14/14 testes)
npm test
```

### 5.2 Procedimento de Deploy em Produção
1. Ao alterar arquivos em `public/`, incremente a constante `CACHE_NAME` (ex.: `'missoes-pwa-v3'`) em `public/sw.js`.
2. Execute o deploy:

```powershell
cd C:\Users\andre\Tarefas-build

# Publicar Front-end Hosting e Regras do Firestore
firebase deploy --only "hosting,firestore" --project=tarefas-build

# Publicar Cloud Functions (southamerica-east1)
firebase deploy --only functions --project=tarefas-build
```
