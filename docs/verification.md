# Verification / Verificação

Review date: **2026-10-26**. These checks establish the behavior and provenance of this independent prototype. They do not establish production safety, hiring eligibility or DoorDash endorsement.

| Check / Verificação | Evidence / Evidência | Status |
|---|---|---|
| Browser-domain tests | `npm test`: 2 files, **15 tests passed**; moderation contracts, synthetic evaluation and financial arithmetic | Passed |
| Source catalog | Seven actual authored files, 877 lines with contiguous bilingual guide blocks; SHA-256 and source text matched files on disk | Passed; regenerate after source edits |
| Synthetic dataset | `backend/data/evaluation.json`: **18 unique authored fixtures**, separate from the eight interactive scenarios | Passed |
| Official assets | All **13 files** match SHA-256 values in `brand-assets.md`; SVGs contain no script tags | Passed |
| Primary references | Reopened SafeChat article, Bruna Pereira's InfoQ presentation and role 7682119; title, author/date where stated, key claims and role requirements checked | Passed |
| Production build | `npm run build`: source catalog, TypeScript and Vite production build passed after the final core/advisory guide changes | Passed |
| Python/API/MCP/advisory | `backend/.venv/bin/python -m unittest backend.test_engine backend.test_api backend.test_advisory -v`: **27 tests passed**, including real MCP subprocess exchange and mocked Ollama fault cases | Passed |
| Optional advisory adapter | Code reviewed: loopback-only opt-in configuration, shared deadline, bounded retries/response, strict schema, no action authority; included in the source catalog | Passed; no actual model call tested |
| Live browser | Local browser: all 13 sections in PT/EN at390px and all13 inPT at1440px, no document overflow; eight moderation scenarios, fallback, capacity overload, policy/tool success and errors, code search/copy, evaluation, calculator, language preservation, skip link and Escape checked | Passed |
| Published deployment | GitHub Pages URL, public source links, route refresh, downloaded assets and public catalog | Pending root review |

## Interpretation boundaries / Limites

- **18/18 is fixture agreement.** Rules and expected labels were authored for this project. It is not an independent benchmark or evidence of performance on real conversations. Correctness requires both category and action to match. The reference agrees on 13/18; the proposed rules agree on 18/18. Review/hold recommendations increase from 11/18 to 12/18, so these fixtures do not demonstrate reduced review staffing.
- Scores and displayed latency, p95 and cost are fixed illustrative scenario values. The economic calculator uses explicit assumptions, including the realizable fraction of released capacity; none is a vendor quote or measured DoorDash saving.
- The public browser and core API execute narrow deterministic rules. A recommendation does not send a message, apply a sanction or create a live review case. Read-only MCP functions use synthetic policies/cases. Any optional model adapter must remain advisory, explicitly activated locally and unable to change the policy decision.
- The audit envelope holds a policy version and noncryptographic fixture fingerprint. It is not persistent evidence storage, anonymization or an immutable audit log. API replay is a bounded process-local cache, not distributed exactly-once execution.
- Cloud designs, durable outbox/queues, real human review, production authorization, observability and rollout automation are proposals. The Terraform foundation has not been applied; no `terraform validate` result is claimed.
- The source guide covers all lines of the **selected central files**, not every repository file. Function-level notes explain inputs, outputs, purpose and failure boundaries. Types/imports and constructors use shared explanatory blocks. Catalog generation is part of every build.

## Public evidence / Evidência pública

The [2025 SafeChat article](https://careersatdoordash.com/blog/doordash-safechat-ai-safety-feature/) supports 99.8% handled by the internal model, under 300 ms for most messages and the reported reduction in low/medium-severity occurrences. Those statements must retain their original context: traffic share is not accuracy, “most” is not p95, and DoorDash's results are not results of this project. Existing configurable workflows, backtesting and audit capabilities are acknowledged by the study rather than represented as missing features.

The [current job listing](https://job-boards.greenhouse.io/doordashinternational/jobs/7682119) was readable on the review date. It specifies seven years of software engineering, two years of people management leading five or more engineers, a relevant degree and English fluency. The application states a hybrid arrangement of one or two days weekly at the Paulista Avenue office. The candidate's satisfaction of these requirements is not independently certified by this portal.

See [source registry](sources.md) for all 28 references, absent publication dates and the article/archive date discrepancy; see [official asset provenance](brand-assets.md) for original URLs and hashes. Original article figures were also inspected visually in the browser (sync moderation and voice flows); command-line image download returned403. No source diagrams were copied. Portal diagrams are independently authored and identify implemented/proposed boundaries.

## Final acceptance to record / Registrar na entrega

The published deployment row is completed after the actual Pages URL is checked. Reduced-motion behavior was reviewed in CSS; no system preference or benchmark score is claimed. Final code changes require catalog regeneration and a production build; a checked-in earlier artifact does not verify later edits.
