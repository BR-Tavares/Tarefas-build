# A folha da tarefa — espaço semântico

18/10/2026

> **Natureza deste texto.** Descreve o olhar com que a folha da tarefa é pensada. São definições e lentes de leitura, não regras nem decisões: as decisões ficam no `BACKLOG.md`, e o que está implementado fica na especificação e no protocolo. Serve para que pessoas e agentes de IA que trabalhem neste repositório partam do mesmo entendimento e não desviem do objetivo nem do contexto. A base teórica mais ampla está em `fundamentos_engenharia_missoes.md`.

---

## 1. O olhar

**Lean como gestão de baixo atrito.** O sistema existe para reduzir o atrito entre as pessoas: o ruído de conversa, o desvio de foco e o combinado que não fica registrado. Um mecanismo vale quando reduz esse atrito mais do que o custo que impõe a quem o usa.

**Foco no processo, não na pessoa.** Toda tarefa tem desafios e uma dinâmica próprios, e merece respeito por si mesma, além do gestor e do responsável. As pessoas também têm o seu próprio ritmo, como plantas: puxar o broto não o faz crescer (wu wei). Pressionar com prazo não melhora o trabalho. O que se faz é observar o desvio: quando a tarefa se afasta do rumo, corrige-se; quando ela resiste, ajuda-se.

**Entender antes de acelerar.** O que mais importa não é o prazo, e sim entender bem o problema e corrigir a rota cedo, para evitar retrabalho.

## 2. A folha da tarefa

**A folha é do responsável.** É o ambiente de trabalho dele e o lugar onde a responsabilidade pela tarefa se exerce. Essa responsabilidade não é dividida nem retirada. O gestor define a tarefa (o cabeçalho); a construção da tarefa a partir daí pertence ao responsável.

**É um ambiente focado.** Na folha está só o que serve para executar esta tarefa. Conversas sobre outros assuntos, reflexões de melhoria do método ou da pessoa e a visão entre tarefas acontecem fora dela.

**É dinâmica.** A tarefa se constrói durante a execução: as pendências geram respostas e alterações, que podem mudar a própria tarefa e, com ela, as etapas. Essas mudanças podem ser versionadas. O histórico de versões serve à vista do gestor; para o responsável, a folha mostra a tarefa vigente.

**É individual.** Cada tarefa tem um responsável e é um processo próprio. Ninguém precisa conhecer a tarefa do outro: a integração entre as frentes de trabalho é papel do gestor, fora da folha.

## 3. Os elementos da folha e o seu sentido

| Elemento | Sentido |
|---|---|
| **Cabeçalho** | A definição da tarefa feita pelo gestor: necessidade, resultado esperado, entrega, critérios e requisitos. É o contrato de fronteira (o quê); o como é do responsável |
| **Etapas** | A devolução do entendimento. Ao escrevê-las, o responsável mostra como compreendeu a tarefa; etapas incoerentes revelam, logo no início, que a tarefa foi entendida de outro jeito |
| **Registro do dia** | Um diário: o compromisso de anotar o que foi feito de principal no dia. Mostra quanto tempo cada atividade consumiu (por exemplo, quatro dias na mesma atividade). A data do registro não tem relação com o prazo |
| **Pendências** | O canal de comunicação da tarefa com o gestor: dúvida, consulta, impedimento e nova data. É por elas que a tarefa se ajusta |
| **Resposta e alteração** | A resposta esclarece sem mudar a tarefa; a alteração muda a tarefa e gera uma nova versão |
| **Data estimada** | Fica visível para o responsável como referência. É estimativa, não instrumento de cobrança |
| **Entrega** | O resultado com a evidência de cada critério |

## 4. Duas vistas sobre a mesma tarefa

| Vista do responsável | Vista do gestor |
|---|---|
| A tarefa vigente, as etapas, o registro do dia e as pendências | Tudo o que o responsável vê, mais as versões, a linha do tempo, os sinais e a avaliação da tarefa |
| Nenhum sinal, contagem ou cobrança | Os sinais apontam onde remover obstáculos, não quem cobrar |

Num futuro avaliador neutro (JEV, ver `proposta_jev.md`), a mesma separação se mantém: a frase de apoio vai para o responsável, e o sinal de avaliação da tarefa vai só para o gestor.

## 5. Correspondência com as referências

| Na folha | Referência |
|---|---|
| A tarefa como atividade com executor, entradas, saídas e evidência | DoDAF OV-5b (modelo de atividade operacional) |
| Necessidade e resultado esperado | DoDAF OV-1 (conceito operacional); intenção do comandante |
| Requisitos (precisa / não pode / consultar antes) | DoDAF OV-6a (regras operacionais) |
| Situações da tarefa | DoDAF OV-6b (transições de estado) |
| O como pertence a quem executa | Respeito às pessoas (Toyota Way); comando por missão |
| Etapas como devolução do entendimento | *Backbrief* |
| Impedimento | *Andon*, *jidoka* |
| Análise só na vista do gestor | Controle visual a serviço de quem remove obstáculos; filtragem por escalão |

## 6. Leituras que se afastam deste olhar

Estas leituras já apareceram ao pensar o sistema, e convém reconhecê-las:

- Tratar o registro do dia como controle de prazo. Ele é diário e medida de tempo consumido, não cobrança.
- Dar ao gestor escrita na folha ou retirar do responsável a construção da tarefa.
- Trazer para dentro da folha reflexões de melhoria, capacitação ou conversas sobre outros assuntos. A folha é um ambiente focado.
- Projetar a tarefa como coletiva ou visível entre colegas, por analogia com a fábrica. Aqui as tarefas são individuais.
- Confundir a vista do gestor (versões, sinais, avaliação) com a folha do responsável.
- Partir da tela do gestor ou do avaliador quando o foco é a tarefa.
