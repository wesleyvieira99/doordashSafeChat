# ADR 001 — Deterministic laboratory / Laboratório determinístico

Date / Data: 2026-10-26. Status: accepted for the portfolio / aceita para o portfólio.

## Português

**Problema:** a demonstração pública deve funcionar sem credenciais, com cenários reproduzíveis e sem expor mensagens de usuários a terceiros.

**Opções:** usar um LLM remoto; carregar um modelo local; implementar sinais determinísticos e identificar a simulação.

**Decisão:** regras determinísticas no navegador e no backend de referência. Score, custo e tempo de cenário têm rótulo de simulação. Medir execução de regras não é medir a latência de um modelo.

**Justificativa:** permite revisar os contratos e comportamentos de contingência com controle experimental. Não demonstra eficácia de detecção em produção.

**Consequências:** exemplos didáticos cobrem casos limitados; trocadilhos e generalização real não são resolvidos pelo laboratório. Não usar os resultados para prometer redução de incidentes.

**Reconsiderar quando:** existir conjunto de avaliação aprovado, orçamento, provedor configurado e requisitos de privacidade. Manter a simulação como suíte de regressão do contrato mesmo com modelo real.

## English

**Problem:** the public demo must be credential-free, reproducible and avoid sending personal messages to third parties. **Options:** remote inference, a local model or explicitly labeled deterministic signals. **Decision:** use deterministic browser and reference-backend rules; label scores, scenario cost and time as simulated. **Rationale:** reviewers can inspect contracts and contingency, without confusing execution time with model latency. **Consequences:** limited teaching examples do not establish production accuracy, language robustness or incident reduction. **Revisit:** when an approved dataset, budget, provider and privacy requirements exist; retain the simulator for contract regression.
