---
name: redigir-missao
description: >-
  Guia direto e específico para um agente de IA redigir, revisar e dimensionar folhas de
  tarefas/missões no padrão do app tarefas-build, convertendo objetivos ou informações prévias
  em campos precisos. Avalia se a missão deve ser mantida, simplificada ou dividida
  (uma missão, um resultado) antes de produzir o JSON.
---

# Skill: Redigir Folha de Missão (tarefas-build)

Esta skill orienta o agente de IA a estruturar e preencher uma folha de tarefa/missão no padrão de governança do aplicativo `tarefas-build`.

## Princípio Fundamental
> **O gestor define o quê; o responsável define o como.**
> A folha da missão é um contrato claro de trabalho. O gestor define a necessidade, o que fazer, os limites (requisitos) e o formato da entrega com seus critérios de conclusão objetivos. O responsável define as etapas, os registros diários e a execução.

> **Uma missão, um resultado.** A melhor missão não é a mais detalhada: é a que comunica, com o mínimo necessário, o resultado esperado, por que ele importa e como reconhecer que terminou. Quem conhece a área deve entendê-la sem perguntar ao gestor o que entregar.

### Missão · Etapa · Atividade

| Nível | É | Quem define | Vai para a folha? |
| :--- | :--- | :--- | :--- |
| **Missão** | O resultado esperado e por que ele é necessário | Gestor | Sim (cabeçalho) |
| **Etapa** | Como o responsável planeja chegar ao resultado | Responsável, no início | Sim, escrita por ele |
| **Atividade** (microtarefa) | Ação operacional dentro de uma etapa (ex.: enviar e-mail, consultar fornecedor, preencher planilha) | Responsável, no dia | Só como "Foco de hoje" |

Nunca transforme uma atividade em missão. Exceção: quando a própria atividade é uma entrega formal que alguém vai verificar ou de que alguém depende (ex.: *Enviar proposta assinada ao cliente até a data do edital*).

---

## 1. Campos Obrigatórios da Folha (O que a IA deve preencher)

| Campo | O que é | Regra de ouro da IA | Exemplo real |
| :--- | :--- | :--- | :--- |
| **Título** | Nome da missão | **Verbo no infinitivo + objeto da entrega.** Curto e específico: diz o que sai pronto. Evite títulos amplos (*Estudar rastreabilidade*). | `Calibrar sensor de umidade em solo argiloso` |
| **Responsável** | E-mail do membro | Nome e e-mail único da pessoa responsável pela execução. | `marina@exemplo.com` |
| **Data Estimada** | Previsão inicial | Data no formato `YYYY-MM-DD`. É estimativa, não prazo fatal. | `2026-10-28` |
| **Necessidade** | Por que importa | O problema, objetivo ou **decisão que depende** do resultado. Corte o contexto que não muda o entendimento. | `Saber se o sensor v2 mede bem em solo argiloso para ir ao piloto com agricultores.` |
| **Tarefa** | O que fazer | 1 ou 2 frases com **um resultado principal**. Não misture aqui o porquê (necessidade), o produto (entrega) nem os limites (requisitos). Método só se for parte do resultado. | `Comparar as leituras do sensor com o método gravimétrico em amostras de solo argiloso.` |
| **Requisitos da Tarefa** | Limites do caminho | Valem durante toda a execução. Só o que é realmente necessário; lista vazia é válida. Não repita critérios. | |
| ↳ *Precisa acontecer* | Obrigação (Must) | O que tem de ser feito ou mantido no caminho. | `• Registrar todas as leituras, inclusive as descartadas, com o motivo.` |
| ↳ *Não pode acontecer* | Proibição (Must not) | Custo, risco, recurso ou efeito colateral proibido. Se acontecer, o responsável para e abre impedimento. | `• Secar amostras acima de 65 °C.` |
| **Formato da Entrega** | O que sai pronto | O produto ou a evidência. Formato e local só quando importam (o padrão é a pasta da missão). | `Planilha com a curva de calibração e erro médio na pasta da missão.` |
| **Critérios de Conclusão** | Checklist de aceite (1 a 3) | O que precisa **estar na entrega** ou ser demonstrado, cada um com uma condição verificável e um método (`inspecao`, `analise`, `demonstracao`, `teste`). | `1. Erro médio ≤ 3 p.p. em 5 níveis × 3 repetições (teste)`<br>`2. Dados brutos e cálculos na pasta (inspecao)` |

**Critério × requisito.** O critério é verificado **na entrega** (está lá ou não). O requisito vale **no caminho** (foi respeitado ou não). Se a mesma ideia cabe nos dois, fique com um só.

---

## 2. Avaliação antes de finalizar

Antes de entregar a missão, responda mentalmente às perguntas abaixo. Elas orientam o texto; não viram campos nem nota.

**Qualidade (cinco perguntas)**
1. Há **um resultado principal** claramente identificável?
2. A entrega pode ser **verificada objetivamente**?
3. Os critérios de conclusão são **diferentes** das restrições de execução?
4. O gestor fixa o resultado **sem prescrever o método** além do necessário?
5. A missão aceita um **resultado negativo ou inconclusivo** quando o trabalho é de pesquisa, teste ou investigação?

**Granularidade**
- Há mais de um resultado principal, cada um útil sozinho?
- Esses resultados têm critérios de conclusão independentes?
- Há dependência que imponha sequência, ou partes que podem avançar em paralelo?
- Mistura trabalhos de natureza diferente (pesquisa, implementação, validação, decisão)?
- Dividir ajuda a enxergar impedimentos, ou só cria administração (mais folhas, revisões e passagens sem ganho)?

**Veredito** (sempre com uma justificativa de uma ou duas frases, baseada na tarefa real):

| Veredito | Quando |
| :--- | :--- |
| **MANTER** | Uma entrega coesa e verificável. |
| **SIMPLIFICAR** | A missão é do tamanho certo, mas tem redundância, ambiguidade ou texto que não muda o entendimento. Entregue a versão corrigida. |
| **DIVIDIR** | Há resultados independentes o bastante para que cada um tenha entrega, critérios e responsável próprios. |

Contar verbos, palavras, etapas ou critérios **não decide** o veredito. Vários verbos que descrevem um resultado indivisível (*coletar, secar e pesar amostras para obter a curva*) continuam sendo **uma** missão. Mais de 3 critérios é sinal para olhar a granularidade: a saída pode ser juntar critérios redundantes (SIMPLIFICAR) ou separar resultados (DIVIDIR).

Ao apontar um problema, **entregue a versão corrigida**, não só a crítica.

---

## 3. Incerteza: pesquisa, teste e investigação

Esse tipo de missão termina quando o trabalho está evidenciado, **não quando a resposta é positiva**. São resultados válidos: o fornecedor não respondeu; os dados não bastam para estimar o benefício; a tecnologia não atende; as evidências não permitem recomendar.

- Escreva critérios que aceitem esses resultados com evidência. Ex.: *Para cada tecnologia, custo com fonte e data, ou "indisponível" com as tentativas feitas — inspecao.*
- Peça que a entrega classifique cada informação como **fato** (com fonte), **estimativa** (com premissa), **hipótese** (a validar) ou **indisponível**. Uma suposição nunca aparece como resultado comprovado.
- A revisão separa *a missão foi concluída?* de *o que o resultado diz sobre o produto?* (protocolo, bloco 4).

---

## 4. Dividir uma missão

A IA **só propõe** a divisão; nada é gravado sem a revisão do gestor (BACKLOG, REA-01). A proposta traz:

- a justificativa resumida;
- para cada missão resultante: título, tarefa, entrega, critérios e requisitos;
- as dependências indispensáveis e o que pode correr em paralelo;
- nenhuma etapa ou atividade (isso é do responsável).

**Nada se perde na divisão.** Cada requisito, critério, premissa e restrição técnica da missão original vai para pelo menos uma missão resultante. Requisitos que valem para todas são repetidos em cada uma. A missão dependente diz, na **Necessidade**, de quais entregas ela parte, porque é isso que o responsável dela vê na folha.

Enquanto o app não tem o campo de dependência (BACKLOG, GEST-01), as dependências ficam no **plano de divisão**, fora das missões, e não são gravadas no Firestore.

---

## 5. O que a IA NUNCA deve incluir (Antipadrões)
- ❌ **Não invente "etapas de trabalho":** As etapas pertencem ao responsável técnico, que as escreve ao iniciar o trabalho. O gestor/IA não deve preencher etapas na folha.
- ❌ **Não duplique os critérios no cabeçalho:** Os critérios de conclusão são avaliados na entrega (checklist). Também não os repita em *Tarefa* ou nos requisitos.
- ❌ **Não crie "Resultado Esperado" ou "Insumos":** Essas informações estão implícitas na Tarefa e os insumos ficam na Pasta do Drive.
- ❌ **Não use critérios vagos:** Evite *"relatório de qualidade"*, *"análise completa"*, *"resultado satisfatório"*, *"testar bem"* sem parâmetro. Diga o que precisa estar presente ou demonstrado.
- ❌ **Não passe de 3 critérios de conclusão** (limite da tela). Se forem necessários mais, simplifique ou divida (seção 2).
- ❌ **Não encha listas para cumprir formato:** requisito que não muda o comportamento de quem executa fica de fora.
- ❌ **Não transforme atividades em missões** (seção *Missão · Etapa · Atividade*).

---

## 6. Formato JSON de Exportação da Missão

Quando solicitado a redigir uma missão, produza o objeto com esta estrutura exata:

```json
{
  "titulo": "Calibrar sensor de umidade em solo argiloso",
  "responsavelEmail": "operador@empresa.com",
  "dataEstimada": "2026-10-28",
  "docsUrl": "https://docs.google.com/document/d/...",
  "pastaUrl": "https://drive.google.com/drive/folders/...",
  "descricao": {
    "necessidade": "Saber se o sensor mede bem em solo argiloso para liberar o lote de campo.",
    "tarefa": "Comparar as leituras do sensor com o método gravimétrico em amostras coletadas.",
    "entrega": "Planilha consolidada com curva de calibração na pasta da missão.",
    "criterios": [
      {
        "condicao": "Erro médio ≤ 3 p.p. frente ao gravimétrico em 5 níveis × 3 repetições",
        "verificacao": "teste"
      },
      {
        "condicao": "Planilha de dados brutos salva na pasta",
        "verificacao": "inspecao"
      }
    ]
  },
  "requisitos": {
    "precisa": [
      "Registrar todas as leituras, inclusive as descartadas, com o motivo."
    ],
    "naoPode": [
      "Secar amostras acima de 65 °C."
    ]
  }
}
```

Ao revisar uma missão existente, ou quando o veredito não for MANTER, envolva a saída num **plano**. `chave` e `dependencias` servem só ao gestor e **não são gravados** na missão:

```json
{
  "avaliacao": { "veredito": "DIVIDIR", "justificativa": "Custos e benefícios são entregas úteis por si e independentes; a recomendação depende das duas." },
  "missoes": [ { "chave": "A", "titulo": "...", "descricao": { }, "requisitos": { } } ],
  "dependencias": [ { "missao": "C", "dependeDe": ["A", "B"] } ]
}
```

Missões sem dependência entre si podem avançar em paralelo. Exemplos completos, incluindo o caso de rastreabilidade bovina: `exemplos/`. Para conferir o contrato antes de gravar: `verificar.js` (`verificarMissao`, `verificarPlano`). Ele aponta problemas objetivos e não decide o veredito.

---

## 7. Como a IA deve Gravar ou Inserir a Missão no Firestore

Se tiver acesso ao Firestore do Firebase:
1. Coleção: `equipes/{equipeId}/missoes/{missaoId}` (onde `missaoId` é ex.: `MS-001`).
2. Incremente `proximoNumero` em `equipes/{equipeId}`.
3. Se for rascunho: `emitidaEm: null`, `versao: 0`.
4. Se for emitida: `emitidaEm: "YYYY-MM-DD"`, `versao: 1`.
5. Grave só os campos da seção 6 (sem `chave`, `avaliacao` ou `dependencias`). Num plano de divisão, grave as missões como rascunho somente depois que o gestor aprovar. Na Necessidade, cite as entregas de que a missão parte pelo título da missão, nunca pela `chave`.
