# Architecture / Arquitetura

Independent portfolio study. No DoorDash systems, private data or production configuration are accessed. This document describes the delivered laboratory and a separately identified production proposal. Diagram source: `public/diagrams/generate.py`; diagram metadata and accessible text: `src/data/diagrams.ts`.

## Português

### O que executa

O portal é uma aplicação React/TypeScript estática. `src/lib/engine.ts` executa a demonstração determinística no navegador. O fluxo é mensagem sintética → validação → sinais de contexto → classificação ilustrativa → política versionada → decisão → explicação e registro. Nenhuma credencial ou serviço de IA é necessário. Scores, custos e latências apresentados pelos cenários são simulações, não benchmarks ou probabilidades calibradas.

A referência Python/FastAPI roda separadamente em ambiente local. `/moderate` recebe o contrato de demonstração e `/policies` expõe políticas sintéticas. A implementação local de MCP oferece ferramentas somente para consulta a políticas e leitura de casos sintéticos. A interface pública não depende desses processos locais. A especificação OpenAPI exposta pelo backend é a fonte dos campos e tipos exatos do contrato.

Há também `/advisory`, um adaptador opcional para Ollama local, desligado por padrão e separado do motor. Seu resultado não autoriza ação nem modifica a política. O adapter foi testado com respostas simuladas, sem executar modelo real. Um Dockerfile opcional foi entregue, mas sua imagem não foi construída porque o daemon Docker estava indisponível. Consulte `docs/backend.md` para a execução Python verificada e as condições de ativação explícita do adaptador.

Não há conexão a uma conversa real, entrega de mensagens, suspensão de conta, central humana, banco de produção, índice vetorial ou provedor de inferência ativo no portal. Um encaminhamento exibido significa uma decisão demonstrada, não um chamado aberto em operação.

### Limites de confiança

1. **Navegador:** toda entrada é não confiável; a demonstração aceita apenas dados sintéticos. O navegador não é autoridade para ações reais.
2. **API de referência:** valida tipos e limites. Rodar em localhost é diferente de expor um serviço autenticado; uma publicação real exige identidade, autorização por objeto, quotas e TLS.
3. **Política:** regras e versões são configurações do sistema; texto do usuário ou retorno de um modelo não pode alterá-las.
4. **Ferramentas:** consulta de políticas e de casos permanece somente leitura. MCP transporta chamadas, mas não concede permissões.
5. **Provedor opcional:** conteúdo enviado a um serviço externo cruza um limite de privacidade; exige aprovação da base legal, minimização, região, prazo e contrato de retenção. Não está ativado no site.

### Proposta de produção

Eu começaria com um serviço de decisão simples, um snapshot de política validado e um contrato estável. O caminho síncrono seria autenticação → validação → contexto mínimo → classificação rápida → escalonamento seletivo → política → decisão. A decisão é um objeto estruturado, nunca uma ação irrestrita derivada de texto gerado.

A entrega não deve esperar a persistência por consumidores de auditoria. Uma transação durável poderia registrar decisão e outbox, cujo publicador enviaria eventos para uma fila. Trabalhadores assíncronos deduplicariam `event_id`, atualizariam a auditoria minimizada e encaminhariam casos elegíveis. Essa outbox, o banco, os consumidores e a revisão humana são propostas, não funcionalidades implantadas.

Eu definiria o orçamento de tempo por etapa após medir o classificador e o caminho de rede. O valor público de menos de 300 ms para a maioria das mensagens, descrito pela DoorDash, não é um p95 e não é um resultado deste projeto. Uma expiração não deve iniciar repetição ilimitada. A política determina o comportamento por risco; indisponibilidade e revisão pendente são estados explícitos.

### Contratos propostos além do laboratório

| Contrato | Campos essenciais | Invariante |
|---|---|---|
| Decisão | request ID, categoria, ação, motivo resumido, policy version | Política conhecida; ação em enumeração permitida |
| Evento assíncrono | event ID, decision ID, timestamp, tipo, versão | Reprocessamento não duplica o efeito |
| Revisão | case ID, decisão original, evidência mínima, autorizador | Escopo do revisor e prazo verificáveis |
| Contestação | case ID, identidade autorizada, versão da decisão | Mudança rastreável sem reescrever o histórico |

Esses campos definem a evolução pretendida; consulte os schemas entregues para o contrato local efetivamente implementado.

### Dados e operação

Eu manteria a janela de conversa pequena e transitória. O prazo de retenção de uma implantação real depende de produto, privacidade e requisitos locais; não adoto retenção ilimitada como padrão. Logs operacionais conteriam IDs, regra, rota e códigos de erro, sem texto integral. Exemplos para avaliação exigem autorização, acesso segregado e política de exclusão.

Falhas a exercitar antes de produção: timeout do provedor; política indisponível ou vencida; duplicidade de evento; saturação de revisão; falha de zona; drift por idioma; tentativa de instruir o modelo a ignorar a política. A implantação avançaria de avaliação offline para shadow mode, canário e expansão por evidência. Rollback fixa a última política e versão de modelo aprovadas; a decisão de interromper expansão é um controle de segurança.

## English

### Executable scope

The static React/TypeScript portal runs a deterministic browser simulation in `src/lib/engine.ts`. Its vertical slice is synthetic message → validation → context signals → illustrative classification → versioned policy → decision → explanation and record. Scenario scores, costs and latency values are simulated; they are not calibrated probabilities or benchmarks.

The Python/FastAPI reference runs separately on localhost. `/moderate` accepts the demonstration contract and `/policies` exposes synthetic policies. Local read-only MCP tools retrieve policy evidence and synthetic cases. The public browser demo does not require these local processes. The backend's generated OpenAPI schema is authoritative for exact API fields.

A separate, default-off `/advisory` adapter supports local Ollama. Its output cannot authorize actions or change policy. Tests used mocked responses; no real model was called. An optional Dockerfile is included, but its image was not built because the Docker daemon was unavailable. See `docs/backend.md` for verified host-Python execution and explicit adapter configuration.

No live conversations, account actions, human review operations, production databases, vector indices or inference providers are connected to the public portal. A displayed referral demonstrates a decision; it does not open a live support case.

### Trust boundaries

Browser input is untrusted, and the browser cannot authorize real actions. The local API validates inputs but needs identity, object-level authorization, quotas and TLS before remote exposure. Policy versions are system-controlled; neither user content nor model output can change them. MCP is an integration protocol, not an authorization grant. Optional external inference requires a separately approved privacy, regional and retention contract.

### Proposed production design

I would begin with a small decision service, a verified policy snapshot and a stable contract. The synchronous path would authenticate, validate, retrieve minimal context, classify, selectively escalate and apply policy. A structured decision would constrain all actions.

A durable transaction could store the decision and an outbox entry. Asynchronous publishers and workers would deliver minimized audit events, deduplicate event IDs and create eligible review cases. Message delivery should not wait for downstream audit consumers. The outbox, queue consumers, database and human operations are proposals, not deployed capabilities.

Time budgets must be established by measuring actual model and network performance. DoorDash's published “under 300 ms for most messages” is not a p95 or a result of this project. Failures require explicit risk-specific contingency and bounded retries. Expired policies must not silently become an unrestricted allow rule.

### Proposed contracts and operations

A decision carries identity, category, action, concise reason and policy version. An audit event adds an event ID and timestamp. A review case links minimum evidence to an original decision and authorized reviewer. An appeal produces a new version while retaining the prior record. These are proposed production contracts; implemented local schemas may be narrower.

Conversation context should be limited and transient. Retention is a product/privacy decision, not an unlimited default. Operational logs should carry IDs, policy, route and error codes rather than full message content. Evaluation examples require approved access and deletion policy.

Production acceptance must exercise provider timeout, stale policy, duplicate events, review backlog, zone failure, language drift and prompt injection attempts. Rollout proceeds through offline evaluation, shadow mode and evidence-gated canaries. Rollback restores the last approved model and policy versions. Pausing an expansion is a deliberate safety control.

## Diagram inventory

1. Context / Contexto — actors and independent study boundary.
2. Containers / Containers — static, local and proposed production lanes.
3. Core / Núcleo — actual deterministic slice.
4. Data flow / Dados — synchronous decision and proposed asynchronous audit.
5. Deployment / Implantação — GitHub Pages and separate AWS alternative.
6. Allowed / Liberada — laboratory sequence.
7. Flagged / Sinalizada — laboratory sequence.
8. Timeout / Timeout — injected failure and contingency.
9. Review and appeal / Revisão e contestação — proposed authorized workflow.
10. Policy tools / Ferramentas — read-only local MCP.

Regenerate all 20 assets and typed metadata with `python3 public/diagrams/generate.py`. SVGs include accessible title and description; the UI also supplies a textual reading order. Semantic colors distinguish synchronous decisions, asynchronous records, policy controls and human review. Diagram arrows indicate conceptual responsibility, not undocumented network integrations.
