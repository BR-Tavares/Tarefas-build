# HANDOFF — Passagem de Bastão

> **Natureza deste documento:** Efêmero e dinâmico. Sobrescrito ao final de cada sessão de trabalho.
> **Destinatário:** Próximo desenvolvedor ou agente de IA que assumir a evolução do código.

---

## 1. O que foi feito nesta sessão (18/10/2026)

1. **Estruturação da Governança Documental:**
   - Criada a pasta `governanca/` separando as naturezas temporais:
     - `governanca/OPERACAO.md`: manual de operação e runbook técnico permanente.
     - `governanca/STATUS.md`: fotografia da versão em produção e dos 14 critérios de aceite.
     - `governanca/HANDOFF.md`: esta passagem de bastão direta e sem ruído.
2. **Backlog Estratégico Alinhado:**
   - Centralizado no [BACKLOG.md](./BACKLOG.md) com as decisões de concepção D1–D8, separando o supervisor neutro JEV, o quadro Kanban/Obeya de dependências e a engenharia reversa de demandas (REA).
3. **Limpeza da Skill:**
   - Removidos arquivos de operação de software da skill `Toyota_para_desenvolvimento`, mantendo nela apenas a metodologia.

---

## 2. Estado do Repositório e Ambiente

- **Branch:** `main` (limpa e sincronizada com `origin/main`).
- **Produção:** `https://tarefas-build.web.app` operando normalmente na versão `v1.0.0`.
- **Testes:** 14/14 testes automatizados validados com sucesso.

---

## 3. Próximo Passo Imediato (O que fazer nos primeiros 5 minutos)

1. **Aguardar aprovação do demandante** para as prioridades de concepção da próxima versão definidas no [BACKLOG.md](./BACKLOG.md).
2. **Candidatos imediatos sem risco à estabilidade:**
   - `UI-01` (Estilo Black / Dark Mode): adição de tema escuro via variáveis CSS em `public/styles.css` e botão `☀️/🌙`.
   - `GEST-03` (Modelos de critérios na Nova Missão): botões rápidos no front-end para pré-preencher a tríade de critérios conforme a natureza da missão.

---

## 4. Cuidados e Armadilhas Conhecidas

- **Java JDK para testes:** O emulador do Firestore requer Java 21+. Na máquina local, use:  
  `$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-25.0.3.9-hotspot"`
- **Cache do PWA:** Sempre que mexer em `public/`, incremente `CACHE_NAME` em `public/sw.js` antes de fazer deploy no Firebase Hosting.
- **Regra de escritor único:** Nunca adicione campos na raiz de `missoes/{id}` para o responsável gravar; qualquer dado novo do responsável deve ir para `responsavel/estado` ou subcoleções próprias.
