# Guia de Uso — Gestor (1 Página)

**App de Missões (PWA):** `https://tarefas-build.web.app`  
**Princípio:** *O gestor define o quê; o responsável define o como. A folha informa; não cobra.*

---

## 1. Quando o gestor entra em ação (os 4 pontos do protocolo)

Você não acompanha o dia a dia cobrando status. Você só entra em **quatro momentos**:

1. **Ao emitir uma missão (`+ Nova missão`):**
   - Antes de emitir uma missão parecida com outra já concluída, releia os **Aprendizados de missões encerradas** exibidos no topo da tela.
   - Preencha o cabeçalho: **Título** (verbo + objeto), **Responsável único**, **Data estimada**, links opcionais do **Docs** e da **Pasta** no Drive (que podem ser alterados a qualquer momento por você ou pelo responsável), **Descrição** (necessidade, resultado esperado, tarefa, entrega, até **3 critérios de conclusão** com forma de verificação e insumos) e **Requisitos da tarefa** (*precisa acontecer*, *não pode acontecer*, *consultar antes*).
   - Clique em **Emitir missão** (ou **Salvar rascunho** se ainda estiver preparando).

2. **Ao ler o primeiro plano de etapas (aviso único de *backbrief*):**
   - Quando o responsável escreve as etapas iniciais, você recebe um aviso único.
   - Abra a folha espelhada e leia as etapas:
     - **Mostram que a tarefa foi entendida?** Não faça nada. Não existe botão de aprovação.
     - **Mostram entendimento diferente?** Clique em **Alterar cabeçalho** para esclarecer o que faltou na folha.

3. **Ao responder uma pendência ou atender a um sinal:**
   - No topo de **Lista e Painel**, ficam em destaque os **sinais que exigem ação do gestor**:
     - *Pendência sem resposta* (impedimento após 1 dia útil; demais tipos após 2 dias úteis);
     - *Espera pela revisão* (entregue há mais de 2 dias úteis);
     - *Impedimento respondido, mas aberto há ≥ 3 dias úteis*.
   - **Diante de uma pendência:** escolha entre **Responder** (esclarece em texto sem mudar a folha) ou **Alterar folha** (muda o cabeçalho ou a data estimada, avança a versão `vN` e destaca `"mudou na vN"` para o responsável). Lembre-se: **quem abre a pendência é quem a fecha**.
   - **Diante de um sinal na lista:** primeiro abra a **Linha do tempo dos registros** na folha espelhada (uma atividade longa pode ser só uma atividade longa). Se precisar conversar, vá diante do trabalho real (*genchi genbutsu*) e use as **5 perguntas do Coaching Kata** disponíveis na própria folha.

4. **Na revisão e no encerramento (`Salvar revisão`):**
   - Avalie em até 2 dias úteis **somente pelo que está na folha** (uma exigência nova vira outra missão):
     1. **A missão foi concluída?** (`Concluída` ou `Em ajuste`, apontando o critério/requisito pendente).
     2. **O que o resultado diz sobre o produto?** (`Atende`, `Não atende` ou `Inconclusivo` — achar a falha num teste também conclui a missão com sucesso).
   - No encerramento, registre em **uma frase**: *"O que muda na próxima folha?"*

---

## 2. Administração da Equipe e Feriados (aba `Equipe`)

- **Incluir responsável:** Informe Nome e E-mail Google em **Equipe → Incluir pessoa**. Ao acessar `https://tarefas-build.web.app` com esse e-mail, a pessoa entra direto na missão atribuída a ela.
- **Desativar / Reativar pessoa:** Clique em **Desativar** ao lado do membro. O acesso imediato é revogado nas regras do servidor e o histórico das missões permanece preservado.
- **Feriados:** Os feriados nacionais de 2026 e 2027 já vêm carregados. Adicione feriados locais ou emendas na aba **Equipe** para que `analise.js` não os conte como dias úteis.
