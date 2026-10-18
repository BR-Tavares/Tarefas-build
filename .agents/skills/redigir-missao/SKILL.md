---
name: redigir-missao
description: >-
  Guia direto e específico para um agente de IA redigir e preencher folhas de tarefas/missões
  no padrão do app tarefas-build, convertendo objetivos ou informações prévias em campos precisos.
---

# Skill: Redigir Folha de Missão (tarefas-build)

Esta skill orienta o agente de IA a estruturar e preencher uma folha de tarefa/missão no padrão de governança do aplicativo `tarefas-build`.

## Princípio Fundamental
> **O gestor define o quê; o responsável define o como.**
> A folha da missão é um contrato claro de trabalho. O gestor define a necessidade, o que fazer, os limites (requisitos) e o formato da entrega com seus critérios de conclusão objetivos. O responsável define as etapas, os registros diários e a execução.

---

## 1. Campos Obrigatórios da Folha (O que a IA deve preencher)

| Campo | O que é | Regra de ouro da IA | Exemplo real |
| :--- | :--- | :--- | :--- |
| **Título** | Nome da missão | Deve iniciar com **Verbo no infinitivo + Objeto**. Curto e direto. | `Calibrar sensor de umidade em solo argiloso` |
| **Responsável** | E-mail do membro | Nome e e-mail único da pessoa responsável pela execução. | `marina@exemplo.com` |
| **Data Estimada** | Previsão inicial | Data no formato `YYYY-MM-DD`. É estimativa, não prazo fatal. | `2026-10-28` |
| **Necessidade** | Contexto / Por que importa | Qual problema precisa ser resolvido e que decisão depende do resultado. | `Saber se o sensor v2 mede bem em solo argiloso para ir ao piloto com agricultores.` |
| **Tarefa** | O que fazer | Em 1 ou 2 frases, a ação central que o responsável irá executar. | `Comparar as leituras do sensor com o método gravimétrico em amostras de solo argiloso.` |
| **Requisitos da Tarefa** | Limites e fronteiras | Dividido estritamente em duas listas de itens objetivos: | |
| ↳ *Precisa acontecer* | O que deve ser garantido (Must) | 1 a 3 itens indispensáveis. | `• Registrar todas as leituras, inclusive as descartadas, com o motivo.` |
| ↳ *Não pode acontecer* | Invariantes / Restrições (Must not) | 2 a 4 itens explícitos de proibição técnica ou operacional. | `• Nenhum lote pode ser processado sem aferição prévia da balança.`<br>`• Não secar amostras acima de 65°C sob hipótese alguma.` |
| **Formato da Entrega** | Onde e o que entregar | Especifica o artefato tangível e o local (por padrão, pasta no Drive). | `Planilha com a curva de calibração e erro médio na pasta da missão.` |
| **Critérios de Conclusão** | Checklist de aceite (1 a 3) | Cada critério deve ter uma **condição testável** e um método de verificação (`inspeção`, `análise`, `demonstração`, `teste`). | `1. Erro médio ≤ 3 p.p. em 5 níveis × 3 repetições (teste)`<br>`2. Dados brutos e cálculos na pasta (inspeção)` |

---

## 2. O que a IA NUNCA deve incluir (Antipadrões)
- ❌ **Não invente "etapas de trabalho":** As etapas pertencem ao responsável técnico, que as escreve ao iniciar o trabalho. O gestor/IA não deve preencher etapas na folha.
- ❌ **Não duplique os critérios no cabeçalho:** Os critérios de conclusão são avaliados na entrega (checklist).
- ❌ **Não crie "Resultado Esperado" ou "Insumos":** Essas informações estão implícitas na Tarefa e os insumos ficam na Pasta do Drive.
- ❌ **Não use critérios vagos:** Evite *"Fazer com boa qualidade"*, *"Testar bem"*. Use condições numéricas ou verificáveis por inspeção/teste.
- ❌ **Não passe de 3 critérios de conclusão:** Se a tarefa exige mais de 3 critérios para ser dada como concluída, divida-a em duas missões separadas.

---

## 3. Formato JSON de Exportação da Missão

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
      "Nenhum lote pode ser processado sem aferição prévia da balança.",
      "Não secar amostras acima de 65°C sob hipótese alguma."
    ]
  }
}
```

---

## 4. Como a IA deve Gravar ou Inserir a Missão no Firestore

Se tiver acesso ao Firestore do Firebase:
1. Coleção: `equipes/{equipeId}/missoes/{missaoId}` (onde `missaoId` é ex.: `MS-001`).
2. Incremente `proximoNumero` em `equipes/{equipeId}`.
3. Se for rascunho: `emitidaEm: null`, `versao: 0`.
4. Se for emitida: `emitidaEm: "YYYY-MM-DD"`, `versao: 1`.
