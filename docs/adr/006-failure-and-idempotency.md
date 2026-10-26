# ADR 006 — Failure and idempotency / Falhas e idempotência

Date / Data: 2026-10-26. Status: laboratory fallback accepted; distributed design proposed / contingência de laboratório aceita; distribuição proposta.

## Português

**Problema:** uma chamada repetida ou um consumidor reiniciado não pode produzir ações duplicadas. Espera ilimitada pode tornar a moderação indisponível.

**Opções:** repetir até sucesso; tratar toda falha como liberação; usar prazo limitado, contingência por risco e efeitos idempotentes.

**Decisão:** cenário de falha explícito no laboratório. Para produção, orçamento de deadline compartilhado, nenhuma tentativa que ultrapasse o prazo, circuit breaker após degradação e outbox para publicação assíncrona. Eventos carregam chave de deduplicação; consumidores confirmam somente após persistir o efeito.

**Justificativa:** entrega pelo menos uma vez exige deduplicação de efeitos. Um score baixo não autoriza ignorar falha em um contexto de risco elevado.

**Consequências:** política de contingência precisa definir o custo de liberar, atrasar e encaminhar por categoria. Deduplicação em memória só vale para um processo; produção exige armazenamento durável, janela e isolamento transacional. Fila, outbox e circuit breaker distribuído não estão implantados neste projeto.

**Reconsiderar quando:** os contratos de entrega, SLA, risco e taxa de reprocessamento reais forem conhecidos. Testar crash antes/depois do commit e replay do mesmo event ID.

## English

**Problem:** retries and restarted consumers must not duplicate effects; unbounded waiting can make moderation unavailable. **Options:** retry forever, fail open universally or use bounded deadlines, risk-based contingency and idempotent effects. **Decision:** explicit failure injection in the lab; propose a shared deadline budget, circuit breaker, durable outbox and deduplicated consumers in production. **Rationale:** at-least-once transport needs effect deduplication. **Consequences:** fallback must weigh allow/delay/review by category; in-memory deduplication is only process-local. A distributed outbox, queues and circuit breaker are not deployed. **Revisit:** when actual SLA, risk and replay requirements are known; test crashes on both sides of commit.
