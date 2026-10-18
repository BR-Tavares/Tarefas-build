# Proposta futura — JEV, o avaliador neutro da tarefa

Versão 0.1 • 18/10/2026 • **Proposta futura, não aprovada para implementação** (ver `governanca/BACKLOG.md`, D7 e IA-01)

> Este documento guarda a concepção do JEV para que ela não se perca. Ele entra depois que a tela da tarefa estiver definida. Nada aqui altera o protocolo nem a especificação vigentes.

---

## 1. Papel

O JEV é um terceiro elemento neutro entre o gestor e o responsável. Ele lê a folha da missão e escolhe, em listas fechadas, uma situação da tarefa e uma frase de apoio. A IA observa, mas não é o chefe: as regras dela são fixas, conhecidas e iguais para todos, e por isso são mais fáceis de aceitar do que um julgamento pessoal.

**Princípio: o JEV avalia a tarefa, não a pessoa.** Toda tarefa tem desafios e uma dinâmica próprios e merece respeito, além do gestor e do responsável (foco no processo; wu wei: não se puxa o broto para ele crescer). As frases falam sempre da tarefa ("esta etapa parece pedir mais do que o previsto"), nunca da pessoa ("você está há 4 dias nisso").

**O JEV não escreve nem pesquisa.** Ele só escolhe: uma situação numa lista fechada e uma frase num catálogo escrito pelo demandante.

## 2. Duas saídas, dois destinatários

| Destinatário | O que recebe | O que não recebe |
|---|---|---|
| **Responsável (operador)** | Só a **frase de apoio**, escolhida do catálogo | Sinal, status, nota, comparação ou cobrança |
| **Gestor** | O **sinal de avaliação da tarefa**, a situação identificada e a frase que foi mostrada ao responsável | — |

A forma do sinal do gestor ainda não está definida e depende do estudo do Sistema Toyota de Produção (controle visual, poka-yoke). Ele avalia a tarefa e aparece no painel do gestor.

## 3. Situações da tarefa (lista fechada, rascunho)

As situações saem dos modos de falha do poka-yoke aplicados aos fatos que a folha já tem. Nenhum campo novo é pedido ao responsável.

| Situação | Modo de falha | Fatos lidos na folha |
|---|---|---|
| As etapas não cobrem a entrega ou um critério | Omissão, ambiguidade | Etapas × entrega e critérios |
| O ponto mais incerto ficou para o fim | Sequência (*genchi genbutsu*: validar cedo) | Ordem das etapas |
| As atividades do dia não levam a nenhuma etapa | Desvio de foco | Registro do dia × etapas |
| A mesma atividade se repete por muitos dias | Capacidade: a tarefa resiste | Registro do dia, interpretado pela natureza da tarefa (num ensaio pode ser normal) |
| Uma resposta do gestor não mudou o trabalho | Passagem | Registro do dia depois de uma resposta |
| Houve alteração e as etapas não foram revistas | Informação | Versão × etapas |
| Pendência parada | Escalonamento | Pendências |
| Atividade próxima de um "consultar antes" ou de um "não pode acontecer" | Autorização (*jidoka*) | Registro do dia × requisitos |
| Etapas concluídas sem evidência por critério | Inspeção na fonte | Etapas × critérios |
| No rumo | — | Coerência geral |
| Poucos registros para julgar | — | Nenhuma frase é mostrada |

## 4. Catálogo de frases

Cerca de 200 frases, escritas e mantidas pelo demandante, umas 15 a 20 por situação. Cada frase tem:

- **id**;
- **situação** a que responde;
- **texto**: 1 a 2 frases, de preferência uma pergunta, sobre a tarefa, sem cobrança;
- **conceito**: *jidoka*, *genchi genbutsu*, *kaizen*, *hansei*, poka-yoke, *andon*, *nemawashi*…;
- **referência**: Ohno, princípio de Liker, Shingo, Rother etc.

A frase também capacita: cada uma traz um conceito do método aplicado à tarefa em andamento.

## 5. Como o JEV escolhe

1. Funções puras em `analise.js` calculam os fatos objetivos (dias na mesma atividade, pendências abertas, versão vista, etapas concluídas).
2. O modelo recebe o contrato da tarefa (cabeçalho), as etapas, os registros, as pendências e esses fatos, e devolve só `{ situacao, fraseId }`.
3. A saída é validada por esquema: a situação precisa estar na lista e a frase precisa pertencer à situação.

Como o JEV não gera texto, toda escolha pode ser conferida: qualquer um vê a situação, a frase e os fatos que a sustentam.

## 6. Notas de implementação (herdadas do IA-01)

- Cloud Function acionada por gravações em `registros`, `pendencias`, `responsavel/estado` e `alteracoes`, com no máximo 1 avaliação por missão por dia (*debounce*).
- Grava `missoes/{id}/avaliacao/atual` e o histórico em `avaliacoes/{AAAA-MM-DD}`. Só a função grava. As regras separam a leitura: o responsável lê só a frase; o gestor lê tudo.

## 7. Em aberto

- Forma do sinal de avaliação da tarefa no painel do gestor (estudo do STP).
- Lista final de situações.
- Frequência e momento em que a frase aparece para o responsável.
- Escrita do catálogo de partida.
