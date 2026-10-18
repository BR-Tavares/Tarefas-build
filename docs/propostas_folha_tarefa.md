# Propostas para a folha da tarefa (tela do responsável)

18/10/2026 • Versão 3, avaliada pelo gestor • Nada aqui está implementado

**Situação:** P1, P3, P4 e P5 (ajustada) aprovadas. P2 recusada.

Base: a seção *Visão Estratégica* do `README.md`, o `docs/protocolo_missoes.md` (v2.7) e o código atual da folha (`public/tela-folha.js` e `functions/index.js`).

## O objetivo que orienta as propostas

A folha existe para **permitir o ajuste**: corrigir a rota da tarefa cedo, antes que o desvio vire retrabalho. O centro dela são as **etapas**, porque elas mostram como o responsável entendeu a tarefa, e é sobre elas que gestor e responsável conversam. O cabeçalho é o combinado e fica sempre à vista. As pendências são o canal do ajuste. O registro do dia é só um diário de foco e não deve ocupar a atenção do responsável.

Cada proposta abaixo serve a esse objetivo ou tira algo do caminho dele. A numeração da versão 2 foi mantida, por isso não há P2.

## Decisões do gestor que esta versão já incorpora

- O cabeçalho fica aberto. É o combinado e é fundamental.
- O registro do dia é o **foco de hoje**: texto livre, só o nome da atividade, sem descrição e sem repetir automaticamente o dia anterior.
- O cabeçalho muda muito raramente, e só por consenso. O número da versão fica visível ao responsável: "versão 1" diz que nada mudou.
- Quem domina a folha é o responsável. Se uma mudança for combinada fora do app (no WhatsApp, por exemplo), é ele quem atualiza as etapas.
- Na tela do responsável, só os avisos que o protocolo prevê.
- As pendências ficam num menu suspenso. As fechadas não somem.
- O selo de situação é do gestor (Kanban), não do responsável.

---

## P1. As etapas guardam a história do entendimento — aprovada

A forma de mostrar o histórico na tela do gestor fica para depois, junto com a revisão dessa tela.

- **O que se observa:** o responsável escreve as etapas numa caixa de texto e, a cada edição, a lista nova apaga a anterior. O app avisa o gestor só na primeira vez que as etapas são salvas (`functions/index.js`). Depois disso, o gestor vê apenas a lista atual e, no painel, a contagem "1/4". A própria folha ainda diz ao responsável "Uma vez, no início, para alinhar o entendimento", o que desestimula revisar o plano.
- **Problema:** o momento mais valioso para corrigir a rota é quando o entendimento do responsável muda, e hoje ele não deixa rastro. O gestor não sabe se o plano mudou, o que mudou nem se mudou depois de uma resposta dele. A conversa sobre as etapas parte só da foto do dia, e o desvio aparece na entrega, que é o ponto mais caro para corrigir.
- **O que muda:**
  - Cada vez que o responsável salva as etapas, o app guarda o plano anterior. A vista do gestor mostra a evolução: "plano revisto em 22/10: saiu *Níveis 4 e 5 medidos*, entrou *Nível 4 medido*".
  - O painel do gestor marca "plano revisto" na linha da missão, sem notificação, como os sinais que só marcam na lista.
  - Sai da folha do responsável a frase "Uma vez, no início". Revisar as etapas passa a ser apresentado como parte do trabalho.
  - O responsável continua vendo só as etapas vigentes, sem histórico.
- **Custo e ganho:** nenhum custo para o responsável: nenhum campo e nenhum aviso. Quando uma mudança é combinada fora do app, o histórico mostra se o responsável atualizou o plano. O gestor ganha o material da conversa, que é o caminho do entendimento e não só o estado atual, e vê o desvio quando o plano muda.

## P3. Pendências em menu suspenso — aprovada

- **O que se observa:** todas as pendências aparecem abertas na folha, uma embaixo da outra, cada uma com a caixa de resposta, inclusive as fechadas.
- **Problema:** a pendência é o canal do ajuste, e a folha deveria mostrar a conversa em curso. Com o tempo, três ou quatro pendências se acumulam, a resposta que muda o trabalho de hoje se mistura com as resolvidas e o bloco cresce entre as etapas e a entrega.
- **O que muda:**
  - O bloco ocupa uma linha: a pendência em curso, com a resposta do gestor quando houver e o botão de fechar. Quando não há pendência em curso, a linha mostra só "abrir pendência".
  - Todas as pendências, abertas e fechadas, ficam num menu suspenso nessa mesma linha. As fechadas continuam ali, porque as respostas fazem parte do combinado: o que foi esclarecido numa pendência também é acordo.
  - O formulário só abre quando o responsável aciona uma nova pendência.
- **Custo e ganho:** custa um toque para consultar uma pendência antiga. O ganho é que a folha mostra só a conversa em curso e não acumula o arquivo, que continua guardado.

## P4. O registro do dia vira "foco de hoje" — aprovada

- **O que se observa:** o bloco se chama "Registro do dia", e o campo pede "Atividade principal do dia...".
- **Problema:** "atividade principal" pede um julgamento sobre o dia inteiro (o que foi principal?). O registro não é o objeto da folha: é um diário que mostra ao gestor onde foi o tempo, e não deve tomar atenção do responsável.
- **O que muda:**
  - O bloco passa a se chamar **Foco de hoje**, com uma dica curta: "Em que você focou hoje? Só o nome da atividade."
  - O texto é livre. O auto-complete continua, porque é ele que faz a mesma atividade ser escrita do mesmo jeito, e é isso que torna útil a linha do tempo do gestor. As três opções de "sem trabalho na missão" também continuam.
  - O app não repete o dia anterior. O bloco continua no fim da folha.
- **Custo e ganho:** custo zero. "Foco" pede uma lembrança, e não uma avaliação do dia, e o registro sai mais rápido e mais consistente.

## P5. Sem selo de situação na tela do responsável — aprovada com ajuste

- **O que se observa:** a folha do responsável mostra o selo de situação ("Em execução", "Impedida", "Entregue"...).
- **Problema:** a situação é um instrumento do gestor: diz quem age, num Kanban com dezenas de tarefas. Na folha do responsável, ela é uma marca de controle que não informa nada a quem está executando.
- **O que muda:** o selo de situação sai da tela do responsável. O número da versão **fica**, porque "versão 1" mostra que o combinado não mudou. A data estimada também fica, com o "+N por impedimento" que o protocolo prevê. Na vista do gestor, nada muda.
- **Custo e ganho:** custo zero. A tela do responsável fica só com o combinado, o plano e a conversa.

---

## O que foi recusado e por quê

- **Repetir a atividade de ontem com um toque:** recusada. O registro é de foco, e a repetição automática esvazia o registro.
- **Registro do dia no topo:** recusada. O centro da folha são as etapas, não o registro.
- **Cabeçalho recolhido:** recusada. O cabeçalho é o combinado e fica à vista.
- **Pergunta "as etapas continuam valendo?" depois de cada alteração (antiga P2):** recusada. Complica a folha. A mudança no cabeçalho é rara e combinada, e manter as etapas em dia é responsabilidade do responsável. A P1 já mostra ao gestor se isso aconteceu.
- **Retirar o número da versão da tela do responsável:** recusada. A versão mostra que o combinado não mudou.
- **Sugerir as etapas como foco de hoje:** recusada. O foco de hoje é texto livre.
- **Ajustes de links, textos fixos, entrega e encerramento:** saíram por serem detalhe de interface, e não estratégia. Os defeitos reais estão abaixo.

## Defeitos encontrados no código (corrigir sem decisão de método)

- Na resposta a uma pendência, o rótulo "ALTERAÇÃO → v${g.versao}" mostra a versão atual, e não a versão que a resposta criou. Aparece nas duas vistas.
- Na situação Entregue, o botão "Preencher" continua disponível, e um novo preenchimento cria outra entrega. A revisão do gestor passa a apontar para ela sem aviso.
