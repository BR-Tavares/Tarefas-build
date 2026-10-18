# Backlog e Melhorias Identificadas pelo Usuário — App de Missões

Este documento centraliza todas as melhorias observadas no uso real pelos usuários (gestor e responsáveis) e as evoluções planejadas para as próximas versões (`v1.1`, `v2.0`), seguindo a regra do protocolo: *"Ideias novas vão para o backlog, não para o código da versão em andamento."*

---

## 1. Melhorias de Interface e Experiência Identificadas pelo Usuário (Candidatas à v1.1)

| ID | Item / Melhoria | Origem | Notas Técnicas para Implementação | Status |
|---|---|---|---|---|
| **UI-01** | **Estilo Black / Modo Escuro (Dark Mode)** | Demandante (18/10/2026) | O arquivo [`public/styles.css`](./public/styles.css) já utiliza variáveis CSS globais (`:root { --bg, --surface, --border, --text, --muted, ... }`). Basta adicionar um tema `[data-theme="dark"]` (ou `@media (prefers-color-scheme: dark)`) e um botão de alternância `☀️ / 🌙` na barra superior, salvando a preferência no `localStorage`. | Proposto |

*(Adicione novos itens identificados no uso diário nas linhas acima).*

---

## 2. Evoluções Funcionais do Protocolo (Fora da v1 — Seção 13 da Especificação)

| ID | Item | Por que ficou para depois da v1 | Quando implementar |
|---|---|---|---|
| **FN-01** | **Chat entre responsável e gestor (2ª aba da missão)** | Na v1, a pendência com resposta cobre a comunicação e deixa registro formal na folha. Quando entrar, será subcoleção `mensagens` em tempo real, mantendo a regra: o que mudar o cabeçalho vira **alteração**. | v1.1 / v2.0 |
| **FN-02** | **Motivo "sem trabalho" para um intervalo de dias** (*ex.: "outra missão até sexta"*) | Detalhe de interface que reduz toques em ausências planejadas. | v1.1 |
| **FN-03** | **Seletor de missões para responsável com mais de uma missão ativa** | Na v1, o app abre direto na missão ativa mais recente do responsável. | Junto com a visão de equipe (v2.0) |
| **FN-04** | **Visão de equipe: limite de 2 missões por pessoa, prioridade, *heijunka* e carga invisível** | São regras entre folhas (várias missões por pessoa). | v2.0 |
| **FN-05** | **Complemento de pesquisa e teste** (pergunta, hipótese, protocolo antes dos dados, limites) | Tipo especial de missão (ver `proposta_solicitacao_pesquisa_testes.md`). | Primeira extensão de domínio recomendada |
| **FN-06** | **Biblioteca pesquisável de aprendizados dos encerramentos** | Na v1, o gestor relê os encerramentos recentes no topo da tela *Nova missão*. | Quando o histórico de missões concluídas crescer |
| **FN-07** | **Integração com a API do Google Drive/Docs** (criar Docs e pasta automaticamente ao emitir) | Na v1, colar os links opcionais (editáveis por gestor e responsável) evita pedir permissões sensíveis do Drive no login. | Se colar os links virar atrito real |
| **FN-08** | **Produto para outras equipes (SaaS)** | A estrutura no Firestore já separa `equipes/{equipeId}`; faltam apenas fluxo comercial, termos de uso e LGPD. | Quando houver uma segunda equipe interessada |
