# SafeChat demo API contract

All endpoints are local prototype capabilities. Moderation returns a recommendation; it never bans accounts, publishes messages, issues refunds or contacts anyone. No real LLM or external policy database is connected by default. The separate `/advisory` endpoint can call a locally configured Ollama instance after explicit opt-in; it never changes a moderation decision.

## `GET /health`

Returns `status`, `engineVersion`, `mode:"deterministic-fixtures"`, `llmConfigured:false` for the moderation engine, and `sensitiveActionsEnabled:false`. `advisoryConfigured` reports valid opt-in configuration for the separate endpoint; `advisoryConnectivityVerified:false` explicitly says this health route does not contact or verify the model.

## `POST /advisory` — optional, disabled by default

Accepts only `{text, context?, locale?}` with the same text/context bounds as moderation. The API must have `OLLAMA_ADVISORY_ENABLED=true`, an installed local `OLLAMA_MODEL`, and a literal loopback `OLLAMA_BASE_URL`. See [configuration and privacy boundaries](backend.md#optional-local-ollama-advisory).

The response has `source:"optional-local-ollama"`, `model`, `authoritative:false`, `actionExecuted:false`, and `advisory:{category, summary, needsReview}`. Category must be one of the five lab categories, summary is 1–300 characters, and needsReview is a strict boolean. Unexpected fields are rejected. The summary is untrusted generated text and may contain fragments of the submitted synthetic input; schema validation is not factual validation or redaction.

There is no invocation of the policy engine and no action field. The whole operation has a shared deadline (2.5 seconds by default, maximum 10), a 64 KiB provider-response cap and at most one retry on transport errors or HTTP 429/502/503/504. Invalid schemas, HTTP 4xx except 429, redirects and incomplete outputs are not retried.

Errors: HTTP 503 `ADVISORY_DISABLED`, `ADVISORY_CONFIG_INVALID` or `ADVISORY_UNAVAILABLE`; 502 `ADVISORY_INVALID_RESPONSE`; 504 `ADVISORY_TIMEOUT`. All have bilingual messages and omit raw provider errors. `/moderate` and public browser behavior remain unchanged on any advisory outcome.

## `POST /moderate`

```json
{
  "text": "A pessoa escreveu: vou te matar.",
  "context": "Denúncia de uma ameaça recebida.",
  "locale": "pt",
  "threshold": 0.72,
  "available": true,
  "mode": "proposed",
  "idempotencyKey": "demo-report-001"
}
```

| Field | Bounds / default |
|---|---|
| `text` | Required string, 1–2,000 Unicode codepoints, not only whitespace |
| `context` | Optional string, up to 2,000 codepoints; default empty |
| `locale` | `pt` or `en`; default `pt` |
| `threshold` | Finite number from 0 through 1; default 0.72 |
| `available` | Boolean; default `true`; `false` injects contextual service unavailability |
| `mode` | `reference` or `proposed`; default `proposed` |
| `idempotencyKey` | Optional 1–80 ASCII letters, digits, `_`, `-` |

Unknown fields are rejected. JSON request bodies above 16 KiB are rejected before parsing. This permits 2,000-codepoint strings while bounding total wire size; encoding all characters as long JSON escape sequences can reach the wire limit sooner.

Response shape:

```ts
type ModerationResult = {
  id: string;                          // stable demo fixture identity
  category: 'safe' | 'profanity' | 'threat' | 'ambiguous' | 'injection';
  score: number;                       // fixed heuristic signal, not model confidence
  action: 'allow' | 'censor' | 'hold' | 'review';
  route: string;
  reason: { pt: string; en: string };
  policy: {
    id: string;
    version: string;
    title: { pt: string; en: string };
    source: string;                    // explicitly fictional / not DoorDash policy
  };
  stages: string[];
  simulatedLatencyMs: number;          // scenario assumption, not measured
  simulatedCostUsd: number;            // scenario assumption, not billed
  audit: {
    policyVersion: string;
    evidenceDigest: string;            // noncryptographic fixture fingerprint
    contentStored: false;              // no persisted raw content in this implementation
  };
};
```

For the request above, the proposed engine returns `ambiguous/review` under `CONTEXT-004`. The same input in reference mode returns `threat/hold` under `THREAT-003`. Raw text and context do not appear in the result. Changing the threshold can move a recognized threat/insult to review; it does not make that signal automatically safe.

The optional idempotency cache returns the same result for the same key and normalized request defaults. `X-Idempotent-Replay:true` identifies replay. Reusing a key with different content/configuration returns HTTP 409. Cache TTL is five minutes and capacity is 128 entries per process; eviction/restart removes replay history. This demonstrates request replay and is not a distributed sensitive-action guarantee.

Successful responses include `X-Demo-Mode:synthetic` and `Cache-Control:no-store`.

## Errors

```json
{
  "error": {
    "code": "INPUT_INVALID",
    "messages": {
      "pt": "Confira os campos e limites da requisição.",
      "en": "Check request fields and bounds."
    },
    "fields": [{ "field": "body.text", "type": "string_too_long" }]
  }
}
```

| HTTP | Code | Meaning |
|---|---|---|
| 422 | `INPUT_INVALID` | API schema validation; field/type information only, never raw input |
| 422 | `TEXT_REQUIRED`, `TEXT_TOO_LONG`, `CONTEXT_INVALID`, `THRESHOLD_INVALID`, `QUERY_INVALID`, etc. | Engine validation with bilingual messages |
| 409 | `IDEMPOTENCY_CONFLICT` | The replay key was used with different input |
| 413 | `BODY_TOO_LARGE` | Body exceeds 16 KiB |

The TypeScript engine throws `InputError` containing `.code` and `.messages:{pt,en}`. Browser callers should display the localized message rather than treating an exception as an allowed message.

## `GET /policies?q=ameaça&locale=pt`

With `q`, returns a maximum of three lexical matches over the fictional policy set. Query length is 1–500 codepoints. Without `q`, returns all six policies. A no-match search returns an empty `results` array.

```ts
{
  source: 'synthetic-policies';
  retrieval: 'lexical';
  results: Array<{
    id: string; version: string; title: {pt: string; en: string};
    source: string; body: {pt: string; en: string}; keywords: string[];
    relevance?: number; excerpt?: string;
  }>;
}
```

Relevance is token overlap, not semantic similarity or a confidence probability. All policies are candidate-authored examples.

## `GET /evaluation`

Runs the eighteen synthetic fixtures in both modes and returns:

- `dataset`, `engineVersion`, `synthetic:true`, `total`, and a bilingual `disclaimer`.
- `rows`: fixture text/context/expected labels, both results, and per-mode pass flags. These are intentionally public synthetic cases, never submitted user messages.
- `reference` and `proposed`: correct count, total, exact category-and-action agreement, review count/rate, false-positive/false-negative counts/rates, simulated p95 latency, simulated total cost.

The eight interactive presets are separate from these fixtures. Labels and rules are authored together; the report is a regression demonstration, not an independent model evaluation. See [evaluation definitions and limitations](backend.md#interpreting-the-evaluation).

## Browser exports

`src/lib/engine.ts` exports synchronous `moderate`, `retrievePolicy`, `policies`, `toolDefinitions`, `callTool`, `evaluateDataset`, `scenarios`, `InputError`, and TypeScript types. All execute locally without fetch, storage or credentials. The optional `idempotencyKey` is validated by the browser engine; replay caching exists only in the Python API.

## MCP contract

The Python server exposes the three read-only functions documented in [backend.md](backend.md#mcp-over-stdio). It supports MCP `2025-03-26` over stdio; there is no `/mcp` HTTP endpoint. Browser `callTool` runs local functions with equivalent arguments, not a network MCP client.
