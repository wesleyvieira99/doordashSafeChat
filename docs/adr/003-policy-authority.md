# ADR 003 — Policy authority / Autoridade da política

Date / Data: 2026-10-26. Status: accepted / aceita.

## Português

**Problema:** uma classificação ou resposta gerada não deve conferir autorização para agir sobre pessoas.

**Opções:** aceitar instruções de uma resposta livre; impor um contrato de decisão e regras de autorização externas ao modelo.

**Decisão:** a política versionada controla ações permitidas. A saída de classificação é evidência, não autorização. MCP expõe leitura; não oferece ferramentas de suspensão ou cancelamento. No laboratório, nenhuma ação real é executada.

**Justificativa:** a separação permite auditar política, evidência e ação. Uma tentativa de prompt injection não deve alterar regras do sistema ou habilitar ferramentas.

**Consequências:** atualização de política exige revisão e mecanismo de distribuição. Política ausente ou vencida deve produzir estado explícito e contingência aprovada, não uma liberação silenciosa.

**Reconsiderar quando:** mudar o produto ou o contrato regulatório; a necessidade de autorização independente permanece.

## English

**Problem:** classification or generated text must not grant permission to act on people. **Options:** follow free-text instructions or enforce a structured decision plus model-independent authorization. **Decision:** versioned policy constrains allowed actions; classifier output is evidence. MCP is read-only, and the lab executes no account action. **Rationale:** keep policy, evidence and action auditable; prompt injection must not enable privileged tools. **Consequences:** policy rollout needs review and distribution; missing or expired policy produces an explicit approved fallback. **Revisit:** for product or regulatory changes, while retaining independent authorization.
