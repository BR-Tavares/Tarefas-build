# Proposta: Metodologias de Micro-Tarefas Abertas e Prevenção de Retrabalho

> **Documento para Avaliação Técnica e Parecer de IA (JEV / Agentes de Arquitetura)**  
> **Data:** 18/10/2026  
> **Status:** Em Proposta / Análise de Viabilidade  
> **Contexto:** Expansão conceitual do [protocolo_missoes.md](file:///c:/Users/andre/Documents/Sistemas/tarefas-build/docs/protocolo_missoes.md) para suporte a missões de modelo aberto (*open claim / marketplace interno de tarefas*), focando em clareza extrema de especificação e eliminação de retrabalho.

---

## 1. Visão Geral e Motivação

O modelo padrão do protocolo foi desenhado para atribuição direta (Gestor $\to$ Responsável). No entanto, para fluxos em que as missões ficam disponíveis em um mural aberto para aceite voluntário, surgem patologias comuns de plataformas de *crowdsourcing* e micro-tarefas (como Mechanical Turk, Gitcoin Bounties, Clickworker):

1. **Subespecificação e Ambiguidade:** A pessoa aceita a tarefa sem compreender plenamente os limites e entrega algo que não atende à necessidade real.
2. **Monopolização e Abandono (*Task Hoarding*):** Executores reservam tarefas e não as realizam, bloqueando o avanço do time.
3. **Falta de Padronização na Entrega:** Respostas em texto livre do tipo *"concluído"*, sem evidências verificáveis.
4. **Gargalo no Gestor:** O gestor precisa atuar como inspetor manual de cada entrega, gerando atrito e lentidão no ciclo de aceite e pagamento/crédito.

Este documento consolida 6 estratégias metodológicas desenhadas para adaptação à arquitetura deste workspace.

---

## 2. As 6 Estratégias Propostas

### 2.1. Atomicidade de Decisão (*Single Cognitive Unit*)
* **Conceito:** Uma tarefa aberta deve ter apenas **um verbo principal de ação** e produzir um resultado unívoco. Tarefas multifacetadas que misturam coleta de dados, análise crítica e diagramação devem ser decompostas em esteira (pipeline sequencial).
* **Mecanismo:**
  - Na criação da missão, impor ou recomendar que a entrega consista em um único artefato ou resposta focal.
  - O produto de uma micro-missão concluída serve automaticamente como insumo/pré-requisito da próxima.
* **Critério de Avaliação para IA:** Verificar se a descrição possui mais de um objetivo independente que justifique fatiamento.

---

### 2.2. Contrato com Exemplos Positivos e Negativos (*Gold Standard / Few-Shot*)
* **Conceito:** Apenas descrever regras textuais gera margem interpretativa. O padrão ouro em *microtask design* é fornecer exemplos do que é aceito e do que é sumariamente rejeitado.
* **Mecanismo na Folha de Missão:**
  - **O que esperamos (Exemplo Positivo):** Modelo de evidência válida ou formato de sucesso esperado.
  - **O que NÃO pode acontecer (Anti-Exemplos / Negative Samples):** Erros frequentes e saídas inaceitáveis já catalogados.
* **Critério de Avaliação para IA:** Analisar se a missão contém regras de fronteira (*Must Not*) com contra-exemplos tangíveis.

---

### 2.3. Validação Estruturada na Entrega (*Format by Design*)
* **Conceito:** Eliminar a submissão por texto puramente livre. A entrega deve ser guiada por um contrato de verificação estrito.
* **Mecanismo:**
  - Aderência ao protocolo: cada critério de conclusão deve seguir a fórmula `"condição — verificado por [inspeção / análise / demonstração / teste]"`.
  - Formulário de submissão com campos específicos de evidência (ex.: link direto do commit/PR, anexo de relatório de ensaio, métrica obtida) e *checklist* de confirmação de invariantes antes de liberar a entrega.
* **Critério de Avaliação para IA:** Rejeitar no cliente/formulário entregas que não preencham as evidências do método de verificação definido.

---

### 2.4. Ciclo de Aceite Dinâmico com TTL (*Claim & Cooldown*)
* **Conceito:** Em tarefas abertas, o aceite precisa ser dinâmico e proteger o fluxo contra abandono.
* **Mecanismo:**
  - **Estado `disponivel`:** Missões publicadas sem responsável definido ficam abertas na visão de equipe.
  - **Aceite com Time-to-Live (TTL):** Ao aceitar, o executor assume a missão e um temporizador de *cooldown* inicia (ex.: 24h ou 48h).
  - **Compromisso Inicial (*Micro-Backbrief*):** O executor deve registrar 2 a 3 etapas de execução dentro das primeiras $X$ horas. Se não houver atividade registrada, a missão expira e retorna automaticamente para o mural de disponíveis.

---

### 2.5. Corda *Andon* de Ambiguidade (*Escalation sem Punição*)
* **Conceito:** O executor que se depara com uma instrução vaga não deve "adivinhar" e produzir retrabalho. Ele deve ter um mecanismo de parada segura.
* **Mecanismo:**
  - Uso imediato do bloco de **Pendências**: ao abrir uma pendência de esclarecimento ("Regra ambígua para o caso X"), o cronômetro de expiração do *claim* é automaticamente pausado.
  - O gestor responde esclarecendo a regra ou emitindo uma alteração de versão da folha.

---

### 2.6. Pré-Validação Automatizada por IA (*JEV Pre-Flight Check*)
* **Conceito:** O gestor não deve perder tempo apontando erros óbvios de formato ou ausência de requisitos.
* **Mecanismo:**
  - Antes da entrega final ser enviada para homologação do gestor, o motor JEV (IA) faz uma varredura fria e instantânea:
    1. A evidência atende aos métodos previstos?
    2. Alguma das restrições do tipo *Não pode acontecer* foi aparentemente violada?
    3. Há itens da folha deixados em branco?
  - A IA emite um parecer imediato para o executor: *"Atenção: o requisito 'Não pode acontecer' proíbe X, mas a evidência enviada aponta X. Ajuste antes de submeter."*
  - Isso elimina o retrabalho antes mesmo que ele alcance o gestor.

---

## 3. Matriz de Síntese: Aplicação ao Projeto

| Mecanismo de Mercado | Adaptação para o App de Missões | Impacto no Fluxo |
|---|---|---|
| **Atomicidade** | Missão focada em entrega única e mensurável | Menor carga cognitiva e menor taxa de erro |
| **Exemplos Positivo/Negativo** | Campos de "O que aceitamos" vs "Anti-exemplos" | Elimina interpretações divergentes |
| **Validação por Tipo de Verificação** | Checklist de evidência baseado no método de teste | Impede submissões vazias |
| **Claim com TTL** | Status `disponivel` $\to$ `em_andamento` com expiração | Evita retenção indevida de tarefas |
| **Corda Andon** | Abertura de pendência pausa o TTL | Estimula a comunicação precoce de dúvidas |
| **Pré-Flight JEV** | Validação por IA pré-submissão | Desonera o gestor e instrui o executor na hora |

---

## 4. Questões Abertas para o Modelo Avaliador

1. **Impacto na Complexidade do Firestore:** O modelo de `Claim com TTL` exige função agendada ou Cloud Function com checagem de expiração, ou é mais seguro gerenciar via cliente com base em regras de segurança de timestamp?
2. **Aderência à Filosofia do Protocolo:** A inclusão de anti-exemplos e checklist de evidência sobrecarrega a simplicidade de uma única folha?
3. **Papel do JEV:** O JEV deve agir apenas como consultor socrático no *Pre-Flight* ou deve ter poder de bloquear a submissão até que o executor marque explicitamente que revisou o alerta?
