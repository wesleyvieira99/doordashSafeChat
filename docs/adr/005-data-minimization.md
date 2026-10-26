# ADR 005 — Data minimization / Minimização de dados

Date / Data: 2026-10-26. Status: laboratory accepted; production retention proposed / laboratório aceito; retenção de produção proposta.

## Português

**Problema:** histórico e evidências podem ajudar a revisão e também aumentar a exposição de dados.

**Opções:** guardar conversas completas por prazo indefinido; excluir tudo imediatamente; manter contexto transitório e evidência mínima com retenção definida.

**Decisão:** apenas casos sintéticos no laboratório. Em produção, propor contexto limitado, IDs pseudônimos, logs sem conteúdo bruto, autorização por caso e exclusão verificável. O prazo deve ser definido com as áreas responsáveis, não inferido do artigo público.

**Justificativa:** dados necessários para decisão e dados necessários para operação são conjuntos diferentes. Conteúdo de mensagem em telemetria cria cópias desnecessárias.

**Consequências:** depuração exige casos autorizados e ferramentas de acesso auditável. Pseudonimização não equivale a anonimização. Backups e DLQs precisam participar do plano de retenção.

**Reconsiderar quando:** novos requisitos de apelação, jurisdição, investigação ou avaliação exigirem evidência adicional, após análise de necessidade e acesso.

## English

**Problem:** context can help reviewers while increasing data exposure. **Options:** indefinite full retention, immediate deletion or transient context plus minimal evidence. **Decision:** synthetic cases only in the lab; propose limited context, pseudonymous IDs, content-free telemetry, case-scoped access and verified deletion for production. Retention must be agreed with accountable teams. **Rationale:** decision data and operational data serve different purposes. **Consequences:** debugging needs authorized cases and auditable access; pseudonymization is not anonymization; backups and DLQs need retention rules. **Revisit:** if appeal, jurisdiction, investigation or evaluation needs change.
