# Blueprint — Folha da tarefa v1.1

18/10/2026 • Especificação para implementação • Alvo: app `v1.1.0`

## 0. Como usar este documento

- **Para quem:** o modelo ou a pessoa que vai implementar. Leia antes a seção *Visão Estratégica* do `README.md` e o `docs/protocolo_missoes.md`.
- **Precedência:** onde este documento e o protocolo v2.7 divergirem, vale este documento. As divergências estão listadas na seção 10, e o protocolo deve ser atualizado no mesmo trabalho.
- **Origem:** as decisões vêm da avaliação do gestor sobre `docs/propostas_folha_tarefa.md`. Só entra aqui o que foi aprovado.
- **Regra de implementação:** não acrescente mecanismos que não estejam aqui. A seção 11 lista o que foi recusado e não deve ser construído.

## 1. Escopo

**Entra:** a folha da tarefa (`public/tela-folha.js`) nas duas vistas, a do responsável e a espelhada do gestor, e o que ela exige no modelo de dados, nas regras do Firestore, na criação da missão (`public/tela-nova-missao.js`) e no carregamento dos dados (`public/app.js`).

**Não entra:** o painel e a lista de missões do gestor (`public/tela-painel.js`), o Kanban, o JEV e as notificações novas. O painel continua como está até a revisão da tela do gestor.

## 2. Decisões

| # | Decisão |
|---|---|
| F1 | **O dono da missão é o responsável.** O gestor define o cabeçalho e monitora. |
| F2 | **A missão não tem estado; tem versão.** Versão 0 é o rascunho, versão 1 é a missão emitida, e cada alteração do cabeçalho cria a versão seguinte. A folha não mostra situação ("Em execução", "Entregue" etc.). |
| F3 | **O cabeçalho muda raramente e só por consenso.** O número da versão fica visível nas duas vistas: "versão 1" diz que o combinado não mudou. |
| F4 | **As etapas mostram o entendimento.** Cada plano salvo fica guardado, e só o gestor vê o histórico. O responsável vê só as etapas vigentes. Se uma mudança for combinada fora do app, é o responsável quem atualiza as etapas. |
| F5 | **As pendências ficam num menu suspenso.** As fechadas continuam acessíveis no menu. |
| F6 | **O registro do dia é o "Foco de hoje":** texto livre, só o nome da atividade, sem repetir automaticamente o dia anterior. |
| F7 | **O trabalho entregue fica fora da folha.** A folha guarda o link da entrega e o checklist dos critérios de conclusão. Os requisitos não entram no checklist, porque valem para a missão inteira e podem ser mais amplos que os critérios. |
| F8 | **Ajuste é não aceitar um critério.** O gestor marca "não aceito" e diz o que falta. Uma exigência nova também é ajuste: se ela muda o cabeçalho, entra por alteração (nova versão) da mesma missão. Não se cria outra missão. |
| F9 | **Exemplo didático:** a folha oferece um exemplo completo de uma tarefa padrão, só para leitura. Não existe modelo obrigatório de documento de entrega. |
| F10 | **Avisos:** só os que o protocolo prevê. A faixa de versão que existe hoje no topo da folha continua como está. |

## 3. A folha, bloco a bloco

A ordem dos blocos não muda: cabeçalho, etapas, pendências, entrega e foco de hoje.

### 3.1 Cabeçalho

- **Selo de situação:** remover das duas vistas da folha (`rotSit` em `tela-folha.js`). A data estimada continua, com o "+N por impedimento".
- **Versão:** a linha do código mostra "MS-027 · versão N".
  - Para um rascunho (`emitidaEm == null`), mostra "versão 0". Isso vale também para os rascunhos antigos, gravados com `versao: 1`.
  - Na criação do rascunho, gravar `versao: 0` (hoje `tela-nova-missao.js` grava `versao: 1`).
  - Ao emitir (botão "Emitir missão" da folha ou do formulário), gravar `versao: 1` junto com `emitidaEm`.
  - A alteração continua somando 1 (`(m.versao || 1) + 1`).
- **Critérios com identificador estável:** cada critério de conclusão ganha um `id` (por exemplo `cr-<n>-<timestamp>`), criado junto com o critério.
  - Numa alteração, o critério que já existia mantém o seu `id`. A referência é a linha do formulário.
  - Critério sem `id` (missões antigas): usar o índice como identificador (`idx-<n>`).
- **Link do exemplo didático:** um link discreto "ver um exemplo de folha" na linha do código, nas duas vistas (ver 3.6).
- Os demais campos e o "ver resultado esperado e insumos" ficam como estão.

### 3.2 Etapas

- **Texto fixo:** remover "Uma vez, no início, para alinhar o entendimento." do rodapé do bloco. Ele desestimula revisar o plano.
- **Histórico do plano (só para o gestor):**
  - Cada vez que o responsável salva o formulário de etapas e a lista de nomes, na ordem, é diferente da vigente, o app grava um documento em `planos`, com o plano novo (ver seção 4). O primeiro plano também é gravado.
  - Marcar uma etapa como concluída não grava plano.
  - Na vista do gestor, abaixo das etapas, um bloco recolhido "Planos anteriores" lista cada plano com a data, a versão da missão em que foi salvo e a diferença para o plano anterior ("entrou: ...", "saiu: ..."). Para missões antigas, o histórico começa no primeiro salvamento depois da implantação.
  - A forma visual na vista do gestor pode ser simples. Ela será revista com a tela do gestor.
- O aviso do primeiro plano (`functions/index.js`, `aoSalvarPrimeiroPlano`) não muda. Os planos seguintes não notificam.

### 3.3 Pendências

- **Fechado (padrão):** o bloco ocupa uma linha.
  - Com pendência aberta: o tipo e o início do texto da pendência aberta mais recente. Se ela já tem resposta, a marca "respondida". Se houver mais de uma aberta, acrescentar "+ outras abertas".
  - Sem pendência aberta: só o título "Pendências".
  - Em qualquer caso, o botão "+ abrir" fica à direita.
- **Aberto (um toque na linha):** a lista completa, com as abertas primeiro (as respondidas antes das que esperam resposta) e as fechadas depois. Cada item mostra o texto, a resposta do gestor e, se estiver aberto, o botão "Fechar pendência".
- **Formulário:** só aparece quando o responsável toca em "+ abrir". Os tipos, os campos e as regras não mudam.
- **Texto fixo:** remover "Você abriu, você fecha." de cada pendência.
- O estado aberto ou fechado do menu é só de interface (`uiFolha`) e não é gravado.
- A vista do gestor usa o mesmo menu. Os botões "Responder" e "Alterar folha" ficam dentro do item aberto.
- **Defeito a corrigir:** a resposta do tipo alteração mostra hoje `v${g.versao}`, que é a versão atual. Ela deve mostrar a versão que a alteração criou, lida em `alteracoes` pelo `pendenciaId`.

### 3.4 Entrega e revisão

**Formulário do responsável:**

| Campo | Regra |
|---|---|
| Link da entrega | Obrigatório, URL. O documento ou o arquivo onde está o trabalho entregue. |
| Uma linha por critério da versão vigente | Mostra a condição e a forma de verificação. |
| Marca do responsável | Atendido, parcial ou não atendido. Sem valor pré-marcado. |
| Por quê | Obrigatório quando a marca é parcial ou não atendido. Uma linha. |
| Onde está a comprovação | Opcional. Só quando a comprovação não está no documento entregue (outro arquivo, uma aba). O rótulo usa a palavra "comprovação", não "evidência". |

Os campos **Resultado** e **Desvios e limites** saem do formulário. Eles vivem no documento entregue.

**Ciclo da entrega:**

- **Sem entrega:** o botão é "Preencher entrega".
- **Última entrega ainda sem revisão:** o botão é "Corrigir entrega". Ele edita a mesma entrega (`updateDoc` em `entregas/{id}`) e não cria outra. Isso corrige o defeito atual, em que um novo preenchimento criava uma segunda entrega sem aviso.
- **Última entrega com revisão e algum critério não aceito:** o botão é "Atualizar entrega".
  - Cria uma entrega nova, com o link e as marcas da anterior já preenchidos.
  - Ao lado de cada critério não aceito aparece o "o que falta" escrito pelo gestor.
  - Um critério que entrou numa versão nova aparece sem marca e precisa ser marcado.
- **Missão concluída ou cancelada:** sem botão. A entrega fica só para leitura.

**Revisão do gestor (vista espelhada):**

- **Formulário:** aparece quando a última entrega não tem revisão. Mostra o mesmo checklist, com a marca do responsável, o por quê e a comprovação.
- **Marca do gestor em cada critério:** aceito ou não aceito. Não aceito exige uma linha "o que falta".
- **Pergunta "o que o resultado diz sobre o produto?":** continua (atende / não atende / inconclusivo). O mesmo vale para a frase de encerramento do gestor.
- **Texto livre "Ajustes":** sai, substituído pelo "o que falta" de cada critério.
- **Ao salvar:**
  - Se todos os critérios vigentes foram aceitos, o app grava `resultado: 'concluida'` e `missoes.concluidaEm`, como hoje.
  - Se algum não foi aceito, grava `resultado: 'em_ajuste'`.
  - O campo `resultado` continua sendo gravado para que `analise.js` funcione sem mudança.
- **Exigência nova:** o gestor usa "Alterar cabeçalho" para incluir ou mudar o critério, e a versão avança. Não há botão de criar outra missão.

**Leitura de entregas antigas:** entregas no formato v1.0 (`resultado`, `evidencias`, `desvios`) continuam sendo exibidas como texto, só para leitura.

**Encerramento:** a frase do responsável ("O que a folha deveria ter dito desde o início?") e a do gestor não mudam.

### 3.5 Foco de hoje

- **Título do bloco:** "Foco de hoje" (hoje é "Registro do dia").
- **Texto de ajuda do campo:** "Em que você focou hoje? Só o nome da atividade."
- **O que continua igual:** o texto livre (até 80 caracteres), o auto-complete com as atividades já registradas nesta missão, as três opções de sem trabalho, a data trocável, o botão de registrar e a regra de um registro por dia.
- **Não implementar:** sugestão de repetir o dia anterior nem sugestão de etapas como foco.

### 3.6 Exemplo didático

- **Onde fica:** num arquivo novo, `public/exemplo-didatico.js`, que exporta um objeto `missaoDoc` e um objeto `subcolecoes` no mesmo formato do Firestore.
- **Como abre:** o link "ver um exemplo de folha" mostra a folha do exemplo com o mesmo desenho da folha real, em modo somente leitura.
  - A forma sugerida é uma opção `somenteLeitura: true` em `renderizarTelaFolha`, que esconde todos os botões e formulários e não grava nada.
  - Um botão "voltar à minha missão" fecha o exemplo.
  - O exemplo não aparece no painel nem conta para a análise.
- **Conteúdo:** o da seção 7.

## 4. Modelo de dados (diferenças em relação a `governanca/SPECIFICATION.md`)

```text
missoes/{missaoId}
  versao: 0 no rascunho; 1 na emissão; +1 a cada alteração
  descricao.criterios: [{ id, condicao, verificacao }]          // id novo

  planos/{autoId}          responsável grava, só o gestor lê      // nova
    { em: "AAAA-MM-DD", versaoMissao: n, etapas: ["nome", ...] }

  entregas/{id}            responsável                            // formato v1.1
    { em, link,
      criterios: [{ criterioId, condicao, status, porque, comprovacao }] }
    // status: "atendido" | "parcial" | "nao_atendido"
    // condicao: cópia do texto do critério no momento da entrega

  revisoes/{entregaId}     gestor                                 // formato v1.1
    { em, resultado: "concluida" | "em_ajuste", produto,
      criterios: [{ criterioId, aceito: true | false, falta }] }
```

- `resultado` da revisão é derivado das marcas: todos aceitos dá `concluida`, e qualquer não aceito dá `em_ajuste`.
- Os campos v1.0 (`entregas.resultado`, `evidencias`, `desvios` e `revisoes.ajustes`) não são mais gravados, mas continuam sendo lidos.
- `adaptador.js` passa a repassar `planos` (só na vista do gestor) e os campos novos de entrega e revisão.

## 5. Regras do Firestore (`firestore.rules`)

- **`planos/{planoId}`:**
  - `read`: só `isGestor`.
  - `create`: `missaoAbertaParaResponsavel`, com chaves apenas `em`, `versaoMissao` e `etapas`, e `etapas` como lista.
  - `update` e `delete`: negados.
- **`entregas/{id}`:** manter create e update para `missaoAbertaParaResponsavel`. O update é o que permite "Corrigir entrega". Exigir `link` como string não vazia na criação.
- **`revisoes`:** sem mudança de permissão.

## 6. Carregamento (`public/app.js`)

- **Assinatura de subcoleções:** incluir `planos` na lista `nomesCols` **somente quando o papel é gestor**. O responsável não tem permissão de leitura, e a assinatura falharia.

## 7. Conteúdo do exemplo didático

Os valores são ilustrativos. Na tela, o exemplo leva a marca "Exemplo — valores ilustrativos".

**MS-000 — Montar uma cesta de alimentos de baixo custo e nutritiva para um adulto** • versão 2 • Data estimada: 5 dias úteis após a emissão

**Descrição**
- **Necessidade:** saber se dá para alimentar bem um adulto com pouco dinheiro, usando o que o mercado do bairro tem nesta época, para orientar a compra da semana.
- **Resultado esperado:** uma cesta diária com custo e valor nutricional conhecidos, feita só com itens que existem hoje no mercado.
- **Tarefa:** levantar os alimentos da época disponíveis em dois mercados do bairro, com preço e valor nutricional, e montar a cesta de um dia.
- **Entrega:** uma planilha na pasta, com uma linha por alimento (alimento, porção, calorias, proteína, preço, mercado, data da coleta) e o total do dia.
- **Critérios de conclusão:**
  1. A cesta soma pelo menos 2.000 kcal e 50 g de proteína por dia — verificado por análise.
  2. O custo da cesta é de no máximo R$ 12 por dia, com preços coletados nos dois mercados na mesma semana — verificado por inspeção.
  3. Todos os itens estavam à venda nos mercados na data da coleta — verificado por inspeção.
- **Insumos:** a Tabela Brasileira de Composição de Alimentos (TACO), na pasta; os endereços dos dois mercados.

**Requisitos da tarefa**
- **Precisa acontecer:** registrar a fonte e a data de cada preço.
- **Não pode acontecer:** usar preço de site ou de folheto no lugar do preço coletado no mercado.
- **Consultar antes:** incluir alimentos além de frutas, verduras e legumes.

**Etapas** (versão vigente)
1. Itens da época listados
2. Preços coletados nos dois mercados
3. Valores nutricionais preenchidos
4. Cesta fechada e conferida

Histórico mostrado só na vista do gestor: no plano de 1º dia, a etapa 3 era "Tabela nutricional das frutas". Ela mudou depois da consulta abaixo.

**Pendência** (fechada)
- **Consulta:** "Pretendo incluir ovo, porque só com frutas e verduras a proteína não chega a 50 g."
- **Resposta do gestor (alteração, versão 2):** "Pode incluir ovo." O "consultar antes" passa a ser: incluir alimentos além de frutas, verduras, legumes e ovos.

**Foco de hoje** (exemplos de registros): *listar itens da época*; *coletar preços mercado A*; *coletar preços mercado B*; *preencher tabela nutricional*.

**Entrega**
- **Link:** planilha "Cesta MS-000" na pasta.
- **Checklist:**

| Critério | Responsável | Gestor |
|---|---|---|
| 1. ≥ 2.000 kcal e ≥ 50 g de proteína | Atendido | Aceito |
| 2. Custo ≤ R$ 12 por dia | Parcial. Por quê: R$ 12,80 no mercado B; no mercado A, R$ 11,40 | Aceito ("o mercado A basta") |
| 3. Itens à venda na data | Atendido | Aceito |

- **Produto:** atende.
- **Encerramento.** Responsável: "A folha deveria ter dito se valia um mercado só ou os dois." Gestor: "Nas próximas, dizer quantos mercados contam."

## 8. Critérios de aceite

| # | Critério | Como verificar |
|---|---|---|
| A1 | A folha não mostra selo de situação em nenhuma vista | Inspeção |
| A2 | Um rascunho mostra "versão 0", e a missão emitida mostra "versão 1" | Teste manual de criação e emissão |
| A3 | Salvar etapas com nomes diferentes grava um documento em `planos`, e salvar sem mudança não grava | Teste no emulador |
| A4 | O responsável não lê `planos`, e o gestor lê | Teste de regras |
| A5 | A vista do gestor lista os planos com "entrou" e "saiu" | Inspeção |
| A6 | Com três pendências (uma aberta respondida, duas fechadas), o bloco fechado mostra uma linha, e as três aparecem ao abrir | Inspeção |
| A7 | O bloco do registro se chama "Foco de hoje" e tem a ajuda "Em que você focou hoje? Só o nome da atividade." | Inspeção |
| A8 | A entrega exige o link e exige o "por quê" em parcial ou não atendido; não tem resultado nem desvios | Teste manual |
| A9 | Com a entrega sem revisão, "Corrigir entrega" edita o mesmo documento, e a contagem de entregas não muda | Teste no emulador |
| A10 | A revisão com um critério não aceito grava `em_ajuste`; o responsável vê o "o que falta" no critério e reabre a entrega preenchida | Teste manual |
| A11 | A revisão com todos os critérios aceitos grava `concluida` e `concluidaEm` | Teste manual |
| A12 | O exemplo didático abre pela folha, não grava nada e volta para a missão | Inspeção |
| A13 | Entregas e revisões no formato v1.0 continuam legíveis | Teste com dados antigos |
| A14 | `npm test` passa, incluindo os testes novos de regras para `planos` e `entregas` | `npm test` |
| A15 | O rótulo de alteração na resposta mostra a versão que a alteração criou, e não a versão atual | Inspeção com duas alterações seguidas |

## 9. Arquivos a mudar

| Arquivo | O que muda |
|---|---|
| `public/tela-folha.js` | Seções 3.1 a 3.6 |
| `public/tela-nova-missao.js` | `versao: 0` no rascunho e `versao: 1` na emissão; `id` dos critérios |
| `public/adaptador.js` | `planos`; campos novos de entrega e revisão; versão exibida |
| `public/app.js` | Assinar `planos` só para o gestor |
| `public/exemplo-didatico.js` | Novo |
| `public/styles.css` | Menu suspenso das pendências; checklist |
| `firestore.rules` | Seção 5 |
| `test/firestore.rules.test.js` | Testes de A4 e A9 |
| `functions/index.js` | Nenhuma mudança de comportamento |

## 10. Documentos a atualizar junto

- **`docs/protocolo_missoes.md`:**
  - versões no lugar de situações (F2);
  - bloco 4 com o link e o checklist (F7), sem resultado e desvios na folha;
  - ajuste e exigência nova como alteração da mesma missão (F8);
  - "foco de hoje" (F6);
  - pendências em menu (F5);
  - histórico de planos na vista do gestor (F4);
  - exemplo didático (F9).

  A frase "Uma exigência nova vira outra missão, não um ajuste desta" deve ser substituída.
- **`governanca/SPECIFICATION.md`:** o modelo de dados (seção 4 deste documento) e as regras.
- **`docs/guia_uso_responsavel.md` e `docs/guia_uso_gestor.md`:** a nova entrega e a revisão por critério.
- **`docs/tela_missao_funcionario.svg`:** sem o selo de situação, com o menu de pendências, o "Foco de hoje" e a entrega por link e checklist.
- **`CHANGELOG.md`:** entrada `v1.1.0`.

## 11. Não construir

Estes itens foram avaliados e recusados. Não devem ser implementados:

- Pergunta "as etapas continuam valendo?" depois de uma alteração.
- Retirar o número da versão da tela do responsável.
- Recolher o cabeçalho, ou mover o registro do dia para o topo.
- Botão de repetir a atividade de ontem, ou etapas sugeridas como foco.
- Criar outra missão a partir da revisão.
- Modelo padrão obrigatório do documento de entrega.
- Campo de exemplo por missão no cabeçalho.
- Bloquear a entrega até haver comprovação em todos os critérios.
- Prazo de expiração da missão, ou extensão da data estimada por dúvida.
- Situação ou estado da missão na folha.

## 12. Pontos em aberto, com a opção adotada até decisão em contrário

| Ponto | Opção adotada |
|---|---|
| O painel e a lista do gestor usam `situacao()` de `analise.js` para agrupar as missões | Continuam usando até a revisão da tela do gestor. A função é só um cálculo, não um estado gravado, e não aparece na folha. |
| Como marcar o fim da missão sem estado | Pelos fatos que já existem: `concluidaEm` (todos os critérios aceitos) e `cancelada`. Eles só travam a escrita do responsável. |
| Nome "critérios de conclusão" ou "critérios de aceite" | Mantido "critérios de conclusão", como no protocolo. |
