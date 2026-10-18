# Propostas para a folha da tarefa (tela do responsável)

18/10/2026 • Para avaliação • Nada aqui está implementado

Base: a seção *Visão Estratégica* do `README.md`, o `docs/protocolo_missoes.md` (v2.7) e a folha como ela funciona hoje em `public/tela-folha.js`.

## Como ler

A régua é a da visão: **cada mecanismo precisa valer o custo que impõe a quem o usa.** A folha é do responsável, é focada e individual, e mostra a tarefa vigente, sem sinais, contagens ou cobrança. O histórico serve ao gestor.

Cada proposta responde a quatro perguntas:
- **O que se observa:** como a folha está hoje.
- **Problema:** o que isso custa na prática.
- **O que muda.**
- **Custo e ganho para o responsável.**

Quando a proposta muda o texto do protocolo ou do guia, isso está indicado. As propostas são independentes: dá para aprovar uma e recusar outra.

## Resumo

| # | Proposta | Tipo | Ganho principal |
|---|---|---|---|
| P1 | Repetir a atividade de ontem com um toque | Mudar | O dia típico passa a custar 1 toque |
| P2 | O registro do dia sobe para o topo | Mudar a ordem | Fim da rolagem diária pelo cabeçalho |
| P3 | Cabeçalho completo na leitura, recolhido no dia a dia | Simplificar | Tela diária curta; resultado esperado deixa de ficar escondido |
| P4 | O aviso de alteração some depois de visto; sai o número da versão | Remover | Fim de um aviso permanente e de selos que viram ruído |
| P5 | A situação só aparece quando muda quem age | Remover | Um selo a menos em quase todos os dias |
| P6 | Sem blocos vazios e sem textos fixos de instrução | Remover | Menos leitura repetida; fim de uma contradição com o protocolo |
| P7 | Links: atalho só quando falta | Simplificar | Um controle a menos no topo |
| P8 | Abrir pendência pelo tipo, em um toque | Simplificar | Pendência aberta com menos decisões; nova data com data de verdade |
| P9 | Pendências: o que pede ação primeiro, fechadas recolhidas | Simplificar | A lista não cresce sem fim |
| P10 | A entrega aparece na hora dela; em "Entregue", a folha espera | Simplificar | Menos botões fora de hora; fim da entrega duplicada |
| P11 | Em ajuste, a entrega reabre preenchida | Mudar | Refazer só o que o ajuste pede |
| P12 | Concluída, a folha vira encerramento | Simplificar | A única ação que resta fica à vista |

---

## A. O uso diário

### P1. Repetir a atividade de ontem com um toque

- **O que se observa:** para registrar o dia, o responsável toca no campo, a lista do auto-complete abre e ele toca na sugestão. São dois toques, e o primeiro abre o teclado no celular. A primeira sugestão já é a atividade mais recente (`sugerirAtividades` ordena pelos dias mais recentes), mas só aparece depois que o campo recebe o foco.
- **Problema:** o caso mais comum é o dia que continua o anterior. O protocolo diz que "há atividades que demoram mesmo" (no exemplo, *secar amostras n1* três dias seguidos). Esse caso custa o mesmo que uma atividade nova, e o teclado abre sem necessidade.
- **O que muda:** quando hoje ainda não tem registro e existe um registro anterior, a linha mostra, ao lado do campo, um botão com o texto da última atividade (ex.: *secar amostras n1 ✓*). Um toque grava. O campo e a lista continuam iguais para registrar outra coisa. Não aparece há quantos dias a atividade se repete: isso continua só no painel do gestor.
- **Custo e ganho:** custo zero. Ganho: o dia típico passa de dois toques com teclado para um toque sem teclado. É o mecanismo de uso diário, e o ganho se repete todos os dias da missão.
- **Cuidado:** o botão grava só com o toque, nunca sozinho. Se o registro virar automático, deixa de dizer o que aconteceu.

### P2. O registro do dia sobe para o topo

- **O que se observa:** a folha tem cinco blocos, e o registro do dia é o último (`tela-folha.js`, bloco 5). Antes dele vêm o cabeçalho inteiro, as etapas, as pendências e a entrega.
- **Problema:** o único bloco de uso diário é o mais distante. No celular, todo dia o responsável rola por um texto que já conhece para chegar a uma linha. O custo é pequeno por dia, mas se soma em todos os dias e acontece no momento em que ele quer só registrar e voltar ao trabalho.
- **O que muda:** a linha do registro fica logo abaixo do título da missão. A ordem passa a ser: título e data estimada, registro do dia, etapas, pendências, cabeçalho (ver P3) e entrega. Na primeira abertura, enquanto as etapas não existem, a ordem atual se mantém, porque ali o certo é ler o cabeçalho antes de escrever o plano.
- **Custo e ganho:** custo zero para o responsável. Ganho: registrar o dia vira abrir o app e tocar, sem rolagem.
- **Muda o protocolo:** a frase "É o último bloco e o único de uso diário" e a ordem descrita em *A folha, bloco a bloco*. O `guia_uso_responsavel.md` e o `tela_missao_funcionario.svg` também precisam acompanhar.

### P3. Cabeçalho completo na leitura, recolhido no dia a dia

- **O que se observa:** o cabeçalho aparece sempre aberto, com necessidade, tarefa, entrega e critérios à vista. **Resultado esperado** e **insumos** ficam escondidos atrás de "Ver resultado esperado e insumos ▾".
- **Problema:** são dois problemas. No dia a dia, o cabeçalho aberto ocupa a maior parte da tela com um texto que não mudou. Na leitura, a divisão esconde justamente o que o protocolo põe como critério de decisão: "se o plano não se encaixar na realidade, o responsável decide pela necessidade e pelo resultado esperado". Os insumos também são o que ele precisa no início.
- **O que muda:** o cabeçalho tem dois estados.
  - **Aberto e completo**, com todos os campos e sem o "ver mais", quando o responsável precisa ler: na primeira abertura (antes das etapas) e quando há uma alteração ainda não vista (ver P4).
  - **Recolhido** no resto do tempo, numa linha "O combinado (necessidade, entrega, critérios e requisitos) ▾". Um toque abre tudo de uma vez.
- **Custo e ganho:** custo de um toque nos dias em que ele quiser reler o combinado. Ganho: a tela diária fica curta, e a leitura de quando importa fica inteira, sem um campo-chave escondido.

---

## B. O que sai da tela do responsável

### P4. O aviso de alteração some depois de visto; sai o número da versão

- **O que se observa:**
  - O aviso do topo ("Versão N: ...") aparece para o responsável sempre que a versão é maior que 1, mesmo depois de visto. A condição em `tela-folha.js` é `versaoEraNaoVista || (papel === 'responsavel' && g.versao > 1 && ultimaAlteracao)`, e a segunda parte é verdadeira para sempre.
  - Os selos "mudou na vN" ficam ao lado dos campos até a próxima alteração.
  - O número da versão aparece no código da missão ("MS-027 · versão 2") e na resposta da pendência ("ALTERAÇÃO → v2").
- **Problema:** o protocolo diz que a alteração aparece como "não vista" **até o responsável abrir a folha**. Hoje ela fica marcada para sempre. Um aviso que nunca sai deixa de ser lido, e o próximo aviso real perde força. O número da versão é histórico, e a visão diz que o histórico serve à vista do gestor; ao responsável basta a tarefa vigente e o que mudou nela.
- **O que muda:**
  - O aviso e os selos aparecem só na sessão em que a alteração ainda não tinha sido vista. O texto passa a ser "O gestor alterou a folha: [resumo]".
  - O número da versão sai da vista do responsável. Na resposta, "ALTERAÇÃO → vN" passa a "Mudou a folha".
  - A vista do gestor continua com versão, vista ou não vista.
- **Custo e ganho:** custo zero. Ganho: o aviso volta a significar "algo mudou e você ainda não viu".
- **Defeito junto:** o rótulo "ALTERAÇÃO → v${g.versao}" usa a versão atual, e não a versão que a resposta criou. Depois de uma segunda alteração, a resposta antiga passa a mostrar a versão errada. Com a proposta, o defeito some.

### P5. A situação só aparece quando muda quem age

- **O que se observa:** o selo de situação ("Em execução", "Impedida", "Entregue", "Em ajuste") aparece sempre ao lado da data estimada.
- **Problema:** na maior parte da missão a situação é "Em execução", e o selo não diz nada novo. O protocolo define a situação como "quem precisa agir agora"; em execução, quem age é o próprio responsável, que já sabe disso.
- **O que muda:** o selo aparece só quando a vez não é do responsável ou quando ele precisa saber por quê: Impedida (aguardando o gestor), Entregue (aguardando a revisão) e Em ajuste.
- **Custo e ganho:** custo zero. Ganho: quando o selo aparece, ele avisa algo.

### P6. Sem blocos vazios e sem textos fixos de instrução

- **O que se observa:**
  - Os três requisitos aparecem sempre, com "—" quando vazios. "Consultar antes" é opcional no protocolo e aparece mesmo assim.
  - Textos fixos se repetem todos os dias: "Uma vez, no início, para alinhar o entendimento." abaixo das etapas; "escritas no início · [data]" no título delas; "Você abriu, você fecha." em cada pendência aberta; "Resultado, evidência por critério, desvios." no título da entrega.
- **Problema:** é leitura sem informação nova. Um dos textos contradiz o protocolo: "Uma vez, no início" sugere que as etapas não se editam, e o protocolo diz que o responsável "pode editar as etapas se o entendimento mudar, sem aprovação". A visão diz que as etapas são a devolução do entendimento e mudam com a tarefa. A data "escritas no início" é histórico, que serve ao gestor. "Você abriu, você fecha" é regra do método dita como ordem, e o protocolo pede linguagem que explique o porquê e não comande.
- **O que muda:**
  - Requisito vazio não aparece. Se os três estiverem vazios, o título "Requisitos da tarefa" também sai.
  - As explicações passam para dentro dos formulários, onde são úteis: a dica das etapas aparece no editor (já existe lá) e a da entrega, no formulário dela.
  - Saem "Uma vez, no início...", a data de "escritas no início" e "Você abriu, você fecha.". O botão "Fechar pendência" já diz o que fazer; a regra continua no guia.
- **Custo e ganho:** custo zero. Ganho: menos texto fixo, e a folha para de contradizer o próprio método.

### P7. Links: atalho só quando falta

- **O que se observa:** ao lado do código da missão há sempre um "editar links". Quando falta um link, aparece também um "+ Docs ↗" ou "+ Pasta ↗". O "editar links" continua visível em missão concluída ou cancelada.
- **Problema:** é um controle permanente no ponto mais visível da folha, para uma ação que acontece uma vez, quando acontece. Em missão encerrada, ele permite mudar onde estão as evidências de uma revisão já feita.
- **O que muda:** o "editar links" fixo sai. Fica o "+ Docs" ou "+ Pasta" quando falta o link; para trocar um link existente, há uma opção discreta dentro do cabeçalho aberto (P3). Em missão concluída ou cancelada, não há edição de links.
- **Custo e ganho:** custo de um toque a mais no caso raro de trocar um link. Ganho: um controle a menos no topo e a evidência revisada fica estável.

---

## C. Pendências

### P8. Abrir pendência pelo tipo, em um toque

- **O que se observa:** "+ abrir" mostra um formulário com uma lista de tipos (com textos longos), uma lista de alcance do bloqueio e um campo de texto. O tipo já vem marcado como Impedimento. A Consulta aparece mesmo quando o cabeçalho não tem nada em "consultar antes". A Nova data é texto livre, sem campo de data.
- **Problema:** abrir uma pendência pede escolher numa lista antes de escrever, e o tipo marcado de saída favorece o erro de abrir como impedimento o que era uma dúvida. A Consulta sem "consultar antes" é uma opção que o protocolo não prevê para aquela missão. Na Nova data, a data fica escondida no texto: o gestor precisa ler e digitar de novo na alteração.
- **O que muda:**
  - "+ abrir" vira quatro botões lado a lado: **Dúvida**, **Consulta**, **Impedimento** e **Nova data**. O toque já abre o campo de texto com a dica daquele tipo.
  - **Consulta** só aparece quando há algo em "consultar antes".
  - **Impedimento** mostra uma escolha de dois botões, "só uma parte" ou "tudo", sem valor pré-marcado.
  - **Nova data** tem um campo de data e um campo de motivo. Na resposta do gestor, a alteração já vem com a data preenchida.
- **Custo e ganho:** o mesmo número de campos ou menos. Ganho: menos decisões antes de escrever, menos erro de tipo e uma nova data que o gestor aceita sem redigitar.
- **Toca a especificação:** a Nova data passa a guardar a data proposta (um campo novo na pendência, preenchido pelo próprio responsável no lugar do texto).

### P9. Pendências: o que pede ação primeiro, fechadas recolhidas

- **O que se observa:** todas as pendências aparecem na ordem em que foram abertas, inclusive as fechadas, para sempre.
- **Problema:** a lista cresce com a missão, e a pendência que pede ação (o gestor respondeu e falta o responsável confirmar e fechar) se mistura com as já resolvidas.
- **O que muda:**
  - Primeiro, as abertas com resposta do gestor: é a vez do responsável. Depois, as abertas sem resposta.
  - As fechadas ficam recolhidas em "ver pendências fechadas", sem número. Continuam consultáveis, porque uma resposta pode esclarecer o combinado.
- **Custo e ganho:** custo de um toque para consultar uma fechada. Ganho: o bloco mostra o que está em aberto, e a resposta nova não se perde.

---

## D. Entrega e encerramento

### P10. A entrega aparece na hora dela; em "Entregue", a folha espera

- **O que se observa:**
  - O botão "Preencher" da entrega aparece desde o primeiro dia, com o mesmo peso dos outros.
  - Depois de entregar, enquanto a revisão não sai (situação Entregue), o botão "Preencher" e o registro do dia continuam disponíveis. Um novo preenchimento cria **outra** entrega, e a revisão passa a apontar para ela.
- **Problema:** na maior parte da missão a entrega não é a ação do momento, e o botão disputa a atenção. Em Entregue, a vez é do gestor, mas a folha oferece ações ao responsável: o registro do dia não entra mais em nenhum sinal (a análise só calcula os dias sem registro em execução, impedida ou em ajuste) e uma segunda entrega troca, sem aviso, o que o gestor vai revisar.
- **O que muda:**
  - Enquanto há etapas abertas, a entrega fica como uma linha discreta ("Preencher a entrega"), sem bloquear nada. Quando todas as etapas estão concluídas, ela ganha destaque.
  - Em Entregue, o registro do dia e o "Preencher" saem. A folha mostra "Entrega enviada em [data]. A revisão é do gestor." Se o responsável perceber um erro, há um "corrigir a entrega" que edita a mesma entrega, em vez de criar outra (depende de as regras do Firestore permitirem atualizar a entrega antes da revisão).
- **Custo e ganho:** custo zero. Ganho: a folha mostra a ação do momento, e o gestor revisa sempre a entrega certa.

### P11. Em ajuste, a entrega reabre preenchida

- **O que se observa:** em ajuste, o formulário da entrega traz de volta o resultado e os desvios, mas as evidências por critério voltam vazias: todos os status em "Atendido" e o "onde" em branco. Os ajustes pedidos pelo gestor ficam fora do formulário, no resumo da revisão.
- **Problema:** o responsável redigita o que já estava certo para corrigir um ponto, e escreve sem ver o que o ajuste pede.
- **O que muda:** o formulário reabre com as evidências da entrega anterior e mostra os ajustes do gestor no topo. Ele muda só o que o ajuste pediu.
- **Custo e ganho:** custo zero. Ganho: o retrabalho fica do tamanho do ajuste.

### P12. Concluída, a folha vira encerramento

- **O que se observa:** na missão concluída, a pergunta "O que a folha deveria ter dito desde o início?" fica no fim do bloco de entrega, abaixo de toda a folha. Depois de salva a frase, o formulário continua aberto para edição.
- **Problema:** a única ação que resta ao responsável fica no fim da tela, depois de tudo o que já acabou. A frase é o que melhora as próximas missões, e é fácil não vê-la.
- **O que muda:** na missão concluída, a pergunta do encerramento fica no topo, e o resto da folha aparece recolhido, só para consulta. Depois de salva, a frase aparece como texto, com um "editar" discreto.
- **Custo e ganho:** custo zero. Ganho: a frase é pedida no momento certo e com destaque, sem cobrança.

---

## Ordem sugerida

1. **P1, P2 e P3:** juntas, mudam o custo de todos os dias. P2 e P3 pedem a revisão do protocolo, do guia do responsável e do SVG da tela.
2. **P4, P5, P6 e P7:** só removem ou escondem. Custo baixo de implementação e corrigem dois defeitos (o aviso permanente e o rótulo de versão errado).
3. **P10:** corrige a entrega duplicada em "Entregue".
4. **P8, P9, P11 e P12:** melhoram momentos menos frequentes. P8 toca a especificação (data na Nova data).

## O que fica de fora destas propostas

- **Registrar "outra missão" em várias folhas.** Quem tem duas missões registra o dia nas duas. Resolver isso exige a visão entre folhas (FN-03 e FN-04 no `BACKLOG.md`).
- **Motivo para um intervalo de dias** ("outra missão até sexta"). O protocolo já o lista para reconsiderar; é independente destas propostas.
- **Espaço do JEV na folha** (RESP-03). Adiado pela decisão D7. Se P2 for aceita, o lugar candidato "acima do registro do dia" passa a ser o topo da folha, o que pede cuidado para não ocupar o espaço do uso diário.
- **Vista do gestor.** As propostas mudam só a vista do responsável; o que o gestor vê continua igual.
