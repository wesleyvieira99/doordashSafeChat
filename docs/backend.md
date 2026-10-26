# Backend: what runs today

This is an independent candidate prototype, not a DoorDash service or policy implementation. The browser engine and Python API implement the same small, deterministic moderation rules. By default, they make **no LLM calls** and execute **no actions on accounts, payments or real messages**. The returned `action` is a recommendation displayed in a simulation.

## Implemented

| Capability | Actual implementation |
|---|---|
| Moderation | Rules for the documented Portuguese/English examples, with configurable threshold and a context-aware branch |
| Comparison | `reference` ignores reporting/figurative context; `proposed` routes reported abuse to human review and recognizes a narrow figurative pattern |
| Policy retrieval | Lexical ranking over six fictional, versioned policies; maximum three matches; no invented evidence on an empty result |
| Tool boundary | Three read-only MCP tools and an explicit allowlist; no mutation function exists |
| Failure mode | `available:false` injects unavailable contextual assessment and returns hold/review; no real provider timeout occurs |
| API bounds | Pydantic validation, 2,000-codepoint text/context limits, 16 KiB request body limit, bilingual errors without echoed input |
| Replay | Optional idempotency key, same input replay, changed input conflict, bounded in-memory cache |
| Audit envelope | Policy ID/version and stable evidence fingerprint in each response; no raw text in results or cache |
| Evaluation | Eighteen separate authored synthetic fixtures, computed agreement rates and explicit denominators |

## Run locally

Requires Python 3.10+; execute from the repository root. `requirements.lock` captures the dependency versions used for verification; `requirements.txt` lists direct dependencies.

```sh
python3 -m venv backend/.venv
backend/.venv/bin/python -m pip install -r backend/requirements.lock
backend/.venv/bin/python -m uvicorn backend.app:app --host 127.0.0.1 --port 8000 --no-access-log
```

Open `http://127.0.0.1:8000/docs` for the generated OpenAPI explorer, or `http://127.0.0.1:8000/health` for implementation status. The frontend demonstration uses its local TypeScript engine by default and does not require this API. Launching the API does not automatically connect the frontend to it.

Tests:

```sh
backend/.venv/bin/python -m unittest backend.test_engine backend.test_api backend.test_advisory -v
npm test -- --run tests/engine.test.ts
```

The Python suite includes a real subprocess exchange with the MCP server, API request validation, replay conflict, bounded body, and no raw-text echo. Both implementations consume the same policy and evaluation JSON fixtures. They are separate implementations; shared fixtures and tests reduce drift but do not establish general semantic equivalence.

## MCP over stdio

The small server uses only the Python standard library and implements the MCP `2025-03-26` lifecycle, `ping`, `tools/list`, and `tools/call`. It has no dependency on an LLM provider or credentials.

```sh
python3 -m backend.mcp_server
```

The client must start the process with the repository as working directory, send `initialize`, then `notifications/initialized`. Messages are UTF-8 JSON-RPC, one per line. The server emits protocol messages only on stdout. EOF terminates it. Individual frames are capped at 16 KiB and batches at 20 messages.

Available tools:

- `search_policies({"query":"threat", "locale":"en"})`: lexical lookup in fictional policies.
- `list_cases({})`: identifiers and labels of synthetic evaluation fixtures.
- `get_case_preview({"id":"eval-01"})`: one synthetic fixture and a deterministic recommendation.

Unknown tools, unexpected arguments and invalid queries are rejected. A missing fixture produces a tool result with `isError:true`. The server does not expose arbitrary file, URL, shell or account access. Tool annotations describe read-only behavior; the actual protection is the allowlisted implementation with no write operation.

The browser tool explorer calls the matching TypeScript functions locally. It is a protocol-shaped demonstration; it does not launch the stdio server from the browser. The Python subprocess test exercises the real stdio transport.

## Interpreting the evaluation

`backend/data/evaluation.json` contains 18 cases separate from the eight interactive scenarios. All labels and rules were authored for this prototype. This separation is useful for regression testing, **not evidence of generalization** or an independent benchmark.

At the default threshold, the context-blind reference agrees with 13/18 category-and-action labels; the proposed rule set agrees with 18/18. Review/hold recommendations increase from 11/18 to 12/18. The workflow preserves reports for a human, so the prototype does not establish that review cost or staffing would decrease.

Definitions:

- Agreement: both action and category match the authored label.
- False positive: a fixture labeled `allow` receives another action; denominator is the four allowed fixtures.
- False negative: a fixture labeled otherwise receives `allow`; denominator is the fourteen non-allowed fixtures.
- Review burden: `review` plus `hold` recommendations divided by all eighteen fixtures.
- Latency, p95 and cost: fixed scenario values, including 300 ms injected timeout; they are not wall-clock measurements, vendor prices, or production projections.
- Score: a fixed heuristic signal, not a calibrated probability or model confidence.

Regex rules recognize only a small vocabulary. Obfuscation, new languages, adversarial phrasing and missing context can bypass them. Even a `safe/allow` result therefore states that no implemented pattern matched, rather than certifying safety.

## Data handling and replay limits

Raw text exists transiently in request/browser memory because it is necessary to assess the input. The backend does not write that content to disk or return it in the moderation result or validation errors. The optional replay cache contains hashes and result envelopes, is limited to 128 entries, expires after five minutes, and is erased on restart. It is process-local; multiple workers do not share replay state.

`audit.contentStored:false` means this implementation does not persist raw input. It is not a statement about browser extensions, reverse proxies, client tooling or infrastructure outside this code. The evidence fingerprint uses FNV-1a only for reproducible fixture identity; it is **not anonymization, cryptographic integrity or an immutable audit log**. Cache hashes also do not anonymize low-entropy messages.

No sensitive-action endpoint is implemented. If one is added, request replay is insufficient: enforce authorization, policy version, evidence binding, scoped action permissions and transactional idempotency at the system that applies the action.

## Proposed, not implemented

LLM classification in the moderation path; production model routing; embedding/vector RAG; production policy ingestion; LangChain orchestration; agent planning; authentication/authorization; durable review queues; reviewer UI and case assignment; appeals; notification delivery; production observability; rate limits; distributed caches; encryption/key management; operational rollout and cloud provisioning.

The optional advisory adapter below has a shared deadline, schema validation and bounded transient retries. A production model adapter would additionally need measured routing, a circuit breaker, authorization and operational controls. A real policy service should pin retrieval to an effective version and tenant/locale. Those are design requirements, not capabilities demonstrated by the current fallback switch.

Bind the sample API to loopback as shown. Its local development CORS list is not authentication and the sample is not ready to expose as a production service.

## Protocol/documentation references

- [FastAPI request bodies and Pydantic models](https://fastapi.tiangolo.com/tutorial/body/)
- [MCP stdio transport, 2025-03-26](https://modelcontextprotocol.io/specification/2025-03-26/basic/transports)
- [MCP lifecycle, 2025-03-26](https://modelcontextprotocol.io/specification/2025-03-26/basic/lifecycle)
- [MCP tool discovery and invocation, 2025-03-26](https://modelcontextprotocol.io/specification/2025-03-26/server/tools)

## Optional local Ollama advisory

`backend/advisory.py` adds a separate `POST /advisory` route. It is disabled by default, never called by the frontend or moderation engine, and has no tools or action authority. The transport uses the official [Ollama chat API](https://docs.ollama.com/api/chat) and [structured JSON output](https://docs.ollama.com/capabilities/structured-outputs), checked 2026-10-26. Schema validation checks shape, not correctness or safety.

To try an **already installed local model**, run the API from host Python with explicit environment. Replace the model placeholder with its actual installed name; this project never downloads a model automatically:

```sh
OLLAMA_ADVISORY_ENABLED=true OLLAMA_BASE_URL=http://127.0.0.1:11434 OLLAMA_MODEL=your-installed-local-model OLLAMA_DEADLINE_SECONDS=2.5 backend/.venv/bin/python -m uvicorn backend.app:app --host 127.0.0.1 --port 8000 --no-access-log
```

Then use the local `/docs` explorer to submit a synthetic `{text, context, locale}` to `/advisory`. `.env.example` lists options but is not automatically loaded. Only literal loopback HTTP origins (`127.0.0.1` or `::1`) are accepted; environment proxies and redirects are disabled. Choose a local model, not a cloud-backed model alias; inspect Ollama configuration independently. In a container, loopback refers to that container, so the supplied Docker setup keeps the adapter off. Host Python is the documented optional inference path.

The shared wall-clock deadline defaults to 2.5 seconds and may be set from 0.01 to 10 seconds. It covers both attempts and the retry pause. There is at most one retry for transport failures or HTTP 429/502/503/504. Non-transient failures, unexpected schemas, incomplete output and redirects are rejected without retry. The provider body is capped at 64 KiB; the advisory summary is at most 300 characters. Cold model loading may exceed the deadline. No model latency or quality was measured here.

The response declares `authoritative:false` and `actionExecuted:false`; fields are category, summary and needsReview. It is not written into the moderation result or any policy. No action execution method exists. The summary is untrusted model output and could repeat parts of the input despite the prompt. The optional provider receives your submitted synthetic text and may have its own memory, logs or retention; the lab cannot guarantee deletion by that separate process. Do not use personal data.

Validation used mocked HTTP responses only: success, schema rejection, no tool fields, disabled configuration, local-origin restrictions, transient retry, exhausted connection failure, body bounds and a slow-provider deadline. No real model was called. Enabling the endpoint does not mean the model is available; `/health` reports configuration separately from unverified connectivity.

### Português

O adaptador Ollama é uma integração opcional de parecer, separada da moderação determinística e desativada por padrão. O comando acima precisa do nome real de um modelo local já instalado. O projeto não baixa modelos. `.env.example` documenta as variáveis, sem carregamento automático. Somente endereço HTTP de loopback literal é aceito; proxies de ambiente e redirecionamentos estão desligados.

`/advisory` recebe dados sintéticos e devolve categoria, resumo e indicação de revisão, sempre com `authoritative:false` e `actionExecuted:false`. A saída não altera políticas ou decisões. O prazo total é compartilhado entre até duas tentativas; somente erros transitórios permitem a segunda tentativa. Respostas fora do schema, incompletas ou maiores que 64 KiB são rejeitadas. A configuração padrão de 2,5 segundos pode expirar enquanto o modelo carrega; não é uma medição de desempenho.

O processo Ollama recebe o texto enviado e pode manter seus próprios logs ou memória. Um resumo validado ainda é conteúdo não confiável e pode repetir trechos de entrada. Use somente dados sintéticos. Os testes usam transportes simulados; nenhuma chamada real foi executada. No container, loopback significa o próprio container, por isso o exemplo Docker mantém o adaptador desativado e o caminho documentado de inferência opcional usa Python no host.

## Optional container

The [Dockerfile](../backend/Dockerfile) uses the versioned `python:3.12.15-slim-bookworm` tag, confirmed in the [official image manifest](https://github.com/docker-library/official-images/blob/master/library/python). No image digest is invented. Runtime uses UID 10001, pinned Python dependencies and a loopback health check; the recommended run command publishes only on host loopback, drops capabilities and makes the filesystem read-only. `.dockerignore` allowlists backend source and excludes virtual environments, caches, tests and environment files.

The Docker CLI was available but its daemon was not running during verification. The image has therefore not been built or executed; Python/venv execution and tests are verified. Pin a reviewed digest and scan dependencies before using a container outside this local study.
