# Propostas para a folha da tarefa (tela do responsável)

18/10/2026 • Versão 2, para avaliação • Nada aqui está implementado

Base: a seção *Visão Estratégica* do `README.md`, o `docs/protocolo_missoes.md` (v2.7) e o código atual da folha (`public/tela-folha.js` e `functions/index.js`).

## O objetivo que orienta as propostas

A folha existe para **permitir o ajuste**: corrigir a rota da tarefa cedo, antes que o desvio vire retrabalho. O centro dela são as **etapas**, porque elas mostram como o responsável entendeu a tarefa, e é sobre elas que gestor e responsável conversam. O cabeçalho é o combinado e fica sempre à vista. As pendências são o canal do ajuste. O registro do dia é só um diário de foco e não deve ocupar a atenção do responsável.

Cada proposta abaixo serve a esse objetivo ou tira algo do caminho dele.

## Decisões do gestor que esta versão já incorpora

- O cabeçalho fica aberto. É o combinado e é fundamental.
- O registro do dia é o **foco de hoje**: só o nome da atividade, sem descrição e sem repetir automaticamente o dia anterior.
- Na tela do responsável, só os avisos que o protocolo prevê.
- As pendências ficam num menu suspenso. As fechadas não somem.
- O selo de situação é do gestor (Kanban), não do responsável.

---

## P1. As etapas guardam a história do entendimento

- **O que se observa:** o responsável escreve as etapas numa caixa de texto e, a cada edição, a lista nova apaga a anterior. O app avisa o gestor só na primeira vez que as etapas são salvas (`functions/index.js`). Depois disso, o gestor vê apenas a lista atual e, no painel, a contagem "1/4". A própria folha ainda diz ao responsável "Uma vez, no início, para alinhar o entendimento", o que desestimula revisar o plano.
- **Problema:** o momento mais valioso para corrigir a rota é quando o entendimento do responsável muda, e hoje ele não deixa rastro. O gestor não sabe se o plano mudou, o que mudou nem se mudou depois de uma resposta dele. A conversa sobre as etapas parte só da foto do dia, e o desvio aparece na entrega, que é o ponto mais caro para corrigir.
- **O que muda:**
  - Cada vez que o responsável salva as etapas, o app guarda o plano anterior. A vista do gestor mostra a evolução: "plano revisto em 22/10: saiu *Níveis 4 e 5 medidos*, entrou *Nível 4 medido*".
  - O painel do gestor marca "plano revisto" na linha da missão, sem notificação, como os sinais que só marcam na lista.
  - Sai da folha do responsável a frase "Uma vez, no início". Revisar as etapas passa a ser apresentado como parte do trabalho.
  - O responsável continua vendo só as etapas vigentes, sem histórico.
- **Custo e ganho:** nenhum custo para o responsável: nenhum campo e nenhum aviso. O gestor ganha o material da conversa, que é o caminho do entendimento e não só o estado atual, e vê o desvio quando o plano muda.

## P2. Toda mudança na tarefa volta para as etapas

- **O que se observa:** quando o gestor altera o cabeçalho, o código mostra no topo da folha do responsável uma faixa "Versão N: [resumo]" e marca os campos com "mudou na vN". Essa faixa não está prevista no protocolo e, como a condição do código é `g.versao > 1`, fica na tela para sempre depois da primeira alteração. Nada liga a alteração às etapas.
- **Problema:** a visão diz que respostas e alterações mudam a tarefa e, com ela, as etapas. Hoje o ciclo para no cabeçalho: o gestor muda o combinado, mas ninguém sabe se o entendimento do responsável acompanhou. O ajuste fica pela metade, e a faixa permanente é ruído que o protocolo não pediu.
- **O que muda:**
  - A faixa do topo sai.
  - A mudança aparece onde ela vale: o campo alterado do cabeçalho fica marcado, como o protocolo prevê ("a folha mostra o que mudou").
  - No bloco de etapas, depois de uma alteração, aparece uma pergunta: "A tarefa mudou. As etapas continuam valendo?" Há duas respostas, **continuam** ou **editar**. A marca no cabeçalho sai depois dessa resposta.
  - A resposta entra na história das etapas (P1). O gestor vê que a mudança foi absorvida e como.
- **Custo e ganho:** custa um toque por alteração do gestor, que é um evento raro. Em troca, cada alteração fecha o ciclo: o gestor muda o combinado e vê o novo entendimento. É o aviso do primeiro plano repetido em cada mudança, com a mesma leveza de uma leitura.

## P3. Pendências em menu suspenso

- **O que se observa:** todas as pendências aparecem abertas na folha, uma embaixo da outra, cada uma com a caixa de resposta, inclusive as fechadas.
- **Problema:** a pendência é o canal do ajuste, e a folha deveria mostrar a conversa em curso. Com o tempo, três ou quatro pendências se acumulam, a resposta que muda o trabalho de hoje se mistura com as resolvidas e o bloco cresce entre as etapas e a entrega.
- **O que muda:**
  - O bloco ocupa uma linha: a pendência em curso, com a resposta do gestor quando houver e o botão de fechar. Quando não há pendência em curso, a linha mostra só "abrir pendência".
  - Todas as pendências, abertas e fechadas, ficam num menu suspenso nessa mesma linha. As fechadas continuam ali, porque as respostas fazem parte do combinado: o que foi esclarecido numa pendência também é acordo.
  - O formulário só abre quando o responsável aciona uma nova pendência.
- **Custo e ganho:** custa um toque para consultar uma pendência antiga. O ganho é que a folha mostra só a conversa em curso e não acumula o arquivo, que continua guardado.

## P4. O registro do dia vira "foco de hoje"

- **O que se observa:** o bloco se chama "Registro do dia", e o campo pede "Atividade principal do dia...".
- **Problema:** "atividade principal" pede um julgamento sobre o dia inteiro (o que foi principal?). O registro não é o objeto da folha: é um diário que mostra ao gestor onde foi o tempo, e não deve tomar atenção do responsável.
- **O que muda:**
  - O bloco passa a se chamar **Foco de hoje**, com uma dica curta: "Em que você focou hoje? Só o nome da atividade."
  - O auto-complete continua, porque é ele que faz a mesma atividade ser escrita do mesmo jeito, e é isso que torna útil a linha do tempo do gestor. As três opções de "sem trabalho na missão" também continuam.
  - O app não repete o dia anterior. O bloco continua no fim da folha.
- **Custo e ganho:** custo zero. "Foco" pede uma lembrança, e não uma avaliação do dia, e o registro sai mais rápido e mais consistente.

## P5. Nenhuma marca de gestão na tela do responsável

- **O que se observa:** a folha do responsável mostra o selo de situação ("Em execução", "Impedida", "Entregue"...) e o número da versão ("MS-027 · versão 2", "ALTERAÇÃO → v2").
- **Problema:** situação e versão são instrumentos do gestor: a situação diz quem age no Kanban com dezenas de tarefas, e a versão é o histórico que a visão reserva à vista dele. Para o responsável são marcas de controle numa tela que deveria mostrar só a tarefa vigente.
- **O que muda:** o selo de situação e o número de versão saem da tela do responsável. A data estimada fica, com o "+N por impedimento" que o protocolo prevê. Na vista do gestor, nada muda.
- **Custo e ganho:** custo zero. A tela do responsável fica só com o combinado, o plano e a conversa.

---

## O que saiu da versão 1 e por quê

- **Repetir a atividade de ontem com um toque:** recusada. O registro é de foco, e a repetição automática esvazia o registro.
- **Registro do dia no topo:** recusada. O centro da folha são as etapas, não o registro.
- **Cabeçalho recolhido:** recusada. O cabeçalho é o combinado e fica à vista.
- **Ajustes de links, textos fixos, entrega e encerramento:** saíram por serem detalhe de interface, e não estratégia. Os defeitos reais estão abaixo.

## Defeitos encontrados no código (corrigir sem decisão de método)

- Na resposta a uma pendência, o rótulo "ALTERAÇÃO → v${g.versao}" mostra a versão atual, e não a versão que a resposta criou. Com P5, o rótulo some da tela do responsável, mas continua errado na vista do gestor.
- Na situação Entregue, o botão "Preencher" continua disponível, e um novo preenchimento cria outra entrega. A revisão do gestor passa a apontar para ela sem aviso.
