"""Deterministic reference engine, intentionally small and inspectable.

Scores, latency and cost are authored scenario values, never model probabilities
or performance measurements. Evaluation fixtures are not a real-world benchmark.
"""
from __future__ import annotations

import json
import math
import re
import unicodedata
from pathlib import Path
from typing import Any

DATA = Path(__file__).parent / "data"
POLICIES = json.loads((DATA / "policies.json").read_text(encoding="utf-8"))
EVALUATION = json.loads((DATA / "evaluation.json").read_text(encoding="utf-8"))
ENGINE_VERSION = "deterministic-demo-1.0"


class InputError(ValueError):
    def __init__(self, code: str, pt: str, en: str):
        super().__init__(en)
        self.code = code
        self.messages = {"pt": pt, "en": en}

    def as_dict(self) -> dict:
        return {"code": self.code, "messages": self.messages}


def normalize(text: str) -> str:
    return re.sub(r"[\u0300-\u036f]", "", unicodedata.normalize("NFKD", text)).lower()


def digest(text: str) -> str:
    """FNV-1a for fixture parity; not anonymization or tamper protection."""
    value = 0x811C9DC5
    scalar_text = text.encode("utf-16-le", errors="surrogatepass").decode("utf-16-le", errors="replace")
    for byte in scalar_text.encode("utf-8"):
        value = ((value ^ byte) * 0x01000193) & 0xFFFFFFFF
    return f"{value:08x}"


def validate(data: dict) -> None:
    text = data.get("text")
    if not isinstance(text, str) or not text.strip():
        raise InputError("TEXT_REQUIRED", "Escreva uma mensagem para avaliar.", "Enter a message to assess.")
    if len(text) > 2000:
        raise InputError("TEXT_TOO_LONG", "Use até 2.000 caracteres.", "Use at most 2,000 characters.")
    context = data.get("context", "")
    if not isinstance(context, str) or len(context) > 2000:
        raise InputError("CONTEXT_INVALID", "O contexto deve ter até 2.000 caracteres.", "Context must contain at most 2,000 characters.")
    threshold = data.get("threshold", 0.72)
    if isinstance(threshold, bool) or not isinstance(threshold, (int, float)) or not math.isfinite(threshold) or not 0 <= threshold <= 1:
        raise InputError("THRESHOLD_INVALID", "O limiar deve estar entre 0 e 1.", "Threshold must be between 0 and 1.")
    if data.get("locale", "pt") not in ("pt", "en"):
        raise InputError("LOCALE_INVALID", "Escolha pt ou en.", "Choose pt or en.")
    if data.get("mode", "proposed") not in ("reference", "proposed"):
        raise InputError("MODE_INVALID", "Escolha reference ou proposed.", "Choose reference or proposed.")
    if not isinstance(data.get("available", True), bool):
        raise InputError("AVAILABILITY_INVALID", "Disponibilidade deve ser um booleano.", "Availability must be a boolean.")
    if "idempotencyKey" in data and (not isinstance(data["idempotencyKey"], str) or not re.fullmatch(r"[A-Za-z0-9_-]{1,80}", data["idempotencyKey"])):
        raise InputError("IDEMPOTENCY_KEY_INVALID", "Use uma chave de 1 a 80 letras, números, _ ou -.", "Use a key of 1–80 letters, digits, _ or -.")


PATTERNS = {
    "injection": re.compile(r"ignore (?:all|previous|as|todas|os)|(?:system|developer) (?:prompt|message)|ban_user|approve_refund|approve refund|execute tool|execute a ferramenta|libere o pagamento"),
    "threat": re.compile(r"vou te (?:matar|machucar|agredir)|(?:i will|i'll|going to) (?:kill|hurt|shoot) you|te dou um tiro"),
    "profanity": re.compile(r"\b(?:idiota|imbecil|babaca|porra|merda|fuck|fucking|asshole|idiot|bitch)\b"),
    "ambiguous": re.compile(r"vai se arrepender|will regret|sei onde voce mora|know where you live|vai pagar por isso|pay for this"),
    "reporting": re.compile(r"denuncia|relato|citando|citacao|quoted|quoting|reporting|report:|received|recebi|recebido|recebeu|complaint"),
    "figurative": re.compile(r"matar de rir|killing me with laughter"),
}


def moderate(data: dict[str, Any]) -> dict[str, Any]:
    validate(data)
    text, context = normalize(data["text"]), normalize(data.get("context", ""))
    mode, threshold, available = data.get("mode", "proposed"), data.get("threshold", 0.72), data.get("available", True)
    category, score, action, policy_id, route = "safe", 0.06, "allow", "SAFE-001", "rules"
    reason = {"pt": "Nenhum padrão de risco desta demonstração foi reconhecido. Isso não é uma garantia de segurança.", "en": "No risk pattern in this demo was recognized. This is not a safety guarantee."}
    threat, profanity = bool(PATTERNS["threat"].search(text)), bool(PATTERNS["profanity"].search(text))
    stages = ["validate", "normalize", "rules"]
    if PATTERNS["injection"].search(f"{text} {context}"):
        category, score, action, policy_id, route = "injection", 0.98, "review", "BOUNDARY-005", "tool-boundary"
        reason = {"pt": "Tentativa de alterar instruções foi tratada como conteúdo. Nenhuma ferramenta de escrita existe; encaminhar para revisão.", "en": "An attempt to change instructions was treated as content. No write tool exists; route to review."}
    elif not available:
        category, score = ("threat", 0.94) if threat else ("ambiguous", 0.5)
        action, policy_id, route = "hold" if threat or profanity else "review", "FALLBACK-006", "timeout-fallback"
        reason = {"pt": "Indisponibilidade contextual injetada. Sinal forte fica retido; os demais casos seguem para revisão, sem aprovação automática.", "en": "Contextual unavailability was injected. Strong signals are held; other cases go to review, without automatic approval."}
        stages.append("timeout-injected")
    elif mode == "proposed" and PATTERNS["figurative"].search(text) and not PATTERNS["threat"].search(PATTERNS["figurative"].sub("", text, count=1)) and not profanity:
        score, policy_id, route = 0.12, "CONTEXT-004", "context-rules"
        reason = {"pt": "Uma expressão figurada conhecida foi reconhecida pela regra contextual. Permissão limitada a este padrão sintético.", "en": "A known figurative expression matched the context rule. Allowance is limited to this synthetic pattern."}
        stages.append("context-rules")
    elif mode == "proposed" and (threat or profanity) and PATTERNS["reporting"].search(f"{text} {context}"):
        category, score, action, policy_id, route = "ambiguous", 0.55, "review", "CONTEXT-004", "context-review"
        reason = {"pt": "O conteúdo pode ser uma denúncia ou citação. Revisão humana preserva o contexto; o relato não autoriza uma sanção automática.", "en": "The content may be a report or quotation. Human review preserves context; the report does not authorize an automatic sanction."}
        stages.append("context-rules")
    elif threat:
        category, score, policy_id = "threat", 0.94, "THREAT-003"
        action = "hold" if score >= threshold else "review"
        route = "safety-review" if action == "hold" else "threshold-review"
        reason = {"pt": "Padrão de ameaça direta reconhecido. O limiar decide entre retenção recomendada e revisão; nenhuma ação sobre a conta é executada.", "en": "A direct-threat pattern was recognized. Threshold selects recommended hold or review; no account action is executed."}
    elif profanity:
        category, score, policy_id = "profanity", 0.88, "ABUSE-002"
        action = "censor" if score >= threshold else "review"
        route = "message-filter" if action == "censor" else "threshold-review"
        reason = {"pt": "Padrão de linguagem ofensiva reconhecido. Acima do limiar, recomenda-se ocultar a mensagem; abaixo dele, revisar.", "en": "An abusive-language pattern was recognized. Above threshold, censoring the message is recommended; below it, review."}
    elif PATTERNS["ambiguous"].search(text):
        category, score, action, policy_id, route = "ambiguous", 0.58, "review", "CONTEXT-004", "context-review"
        reason = {"pt": "A intenção não pode ser resolvida por este padrão. Encaminhar para revisão humana.", "en": "Intent cannot be resolved from this pattern. Route to human review."}
    policy = next(policy for policy in POLICIES if policy["id"] == policy_id)
    stages.extend(["policy-gate", "recommendation", "audit-envelope"])
    # JS serializes integral numbers without a fractional suffix.
    numeric_threshold = int(threshold) if threshold == int(threshold) else threshold
    identity = json.dumps([data["text"], data.get("context", ""), mode, numeric_threshold, available, policy["version"]], ensure_ascii=False, separators=(",", ":"))
    return {
        "id": f"demo-{digest(identity)}", "category": category, "score": score,
        "action": action, "route": route, "reason": reason,
        "policy": {key: policy[key] for key in ("id", "version", "title", "source")},
        "stages": stages,
        "simulatedLatencyMs": (12 if mode == "reference" else 84 if "context" in route else 24) if available else 300,
        "simulatedCostUsd": 0.0004 if available and mode == "proposed" and "context" in route else 0,
        "audit": {"policyVersion": policy["version"], "evidenceDigest": "fnv1a32:" + digest(data["text"] + "\n" + data.get("context", "")), "contentStored": False},
    }


def retrieve_policy(query: str, locale: str = "pt") -> list[dict]:
    if not isinstance(query, str) or not query.strip() or len(query) > 500:
        raise InputError("QUERY_INVALID", "Use uma busca de 1 a 500 caracteres.", "Use a query of 1–500 characters.")
    if locale not in ("pt", "en"):
        raise InputError("LOCALE_INVALID", "Escolha pt ou en.", "Choose pt or en.")
    tokens = set(re.findall(r"[a-z0-9]+", normalize(query)))
    hits = []
    for policy in POLICIES:
        terms = normalize(f'{policy["id"]} {policy["title"][locale]} {policy["body"][locale]} {" ".join(policy["keywords"])}')
        relevance = sum(token in terms for token in tokens) / len(tokens) if tokens else 0
        if relevance:
            hits.append({**policy, "relevance": relevance, "excerpt": policy["body"][locale]})
    return sorted(hits, key=lambda hit: (-hit["relevance"], hit["id"]))[:3]


TOOL_DEFINITIONS = [
    {"name": "search_policies", "description": "Search fictional demo policies using lexical matches. Read-only.", "inputSchema": {"type": "object", "properties": {"query": {"type": "string", "minLength": 1, "maxLength": 500}, "locale": {"type": "string", "enum": ["pt", "en"]}}, "required": ["query"], "additionalProperties": False}, "annotations": {"readOnlyHint": True, "destructiveHint": False, "openWorldHint": False}},
    {"name": "get_case_preview", "description": "Read one synthetic evaluation case and its deterministic recommendation. Read-only.", "inputSchema": {"type": "object", "properties": {"id": {"type": "string", "minLength": 1, "maxLength": 80}}, "required": ["id"], "additionalProperties": False}, "annotations": {"readOnlyHint": True, "destructiveHint": False, "openWorldHint": False}},
    {"name": "list_cases", "description": "List synthetic fixture identifiers and labels. Read-only.", "inputSchema": {"type": "object", "properties": {}, "additionalProperties": False}, "annotations": {"readOnlyHint": True, "destructiveHint": False, "openWorldHint": False}},
]


def call_tool(name: str, args: dict | None = None) -> Any:
    if args is None:
        args = {}
    if not isinstance(args, dict):
        raise InputError("TOOL_ARGUMENTS_INVALID", "Argumentos da ferramenta inválidos.", "Invalid tool arguments.")
    allowed = {"search_policies": {"query", "locale"}, "get_case_preview": {"id"}, "list_cases": set()}
    if not isinstance(name, str) or name not in allowed:
        raise InputError("TOOL_NOT_ALLOWED", "Esta ferramenta não está disponível. Somente leitura é permitida.", "This tool is unavailable. Only read operations are allowed.")
    if set(args) - allowed[name]:
        raise InputError("TOOL_ARGUMENTS_INVALID", "Campo não permitido na ferramenta.", "Unexpected tool argument.")
    if name == "search_policies":
        return {"source": "synthetic-policies", "retrieval": "lexical", "results": retrieve_policy(args.get("query"), args.get("locale", "pt"))}
    if name == "list_cases":
        return [{**{key: row[key] for key in ("id", "locale", "expectedAction", "expectedCategory")}, "synthetic": True} for row in EVALUATION]
    if not isinstance(args.get("id"), str) or not 1 <= len(args["id"]) <= 80:
        raise InputError("TOOL_ARGUMENTS_INVALID", "Use um identificador de 1 a 80 caracteres.", "Use an identifier of 1–80 characters.")
    row = next((row for row in EVALUATION if row["id"] == args.get("id")), None)
    if row is None:
        raise InputError("CASE_NOT_FOUND", "Caso sintético não encontrado.", "Synthetic case not found.")
    return {**row, "synthetic": True, "result": moderate(row)}


def evaluate_dataset() -> dict:
    rows = []
    for row in EVALUATION:
        reference = moderate({**row, "mode": "reference"})
        proposed = moderate({**row, "mode": "proposed"})
        rows.append({**row, "reference": reference, "proposed": proposed,
                     "referencePass": reference["action"] == row["expectedAction"] and reference["category"] == row["expectedCategory"],
                     "proposedPass": proposed["action"] == row["expectedAction"] and proposed["category"] == row["expectedCategory"]})

    def summarize(mode: str) -> dict:
        correct = sum(row[f"{mode}Pass"] for row in rows)
        review_count = sum(row[mode]["action"] in ("review", "hold") for row in rows)
        allowed = [row for row in rows if row["expectedAction"] == "allow"]
        risky = [row for row in rows if row["expectedAction"] != "allow"]
        fp = sum(row[mode]["action"] != "allow" for row in allowed)
        fn = sum(row[mode]["action"] == "allow" for row in risky)
        latencies = sorted(row[mode]["simulatedLatencyMs"] for row in rows)
        return {"correct": correct, "total": len(rows), "accuracy": correct / len(rows), "reviewCount": review_count, "reviewRate": review_count / len(rows), "falsePositiveCount": fp, "falsePositiveRate": fp / len(allowed), "falseNegativeCount": fn, "falseNegativeRate": fn / len(risky), "simulatedP95LatencyMs": latencies[math.ceil(len(rows) * 0.95) - 1], "simulatedTotalCostUsd": round(sum(row[mode]["simulatedCostUsd"] for row in rows), 6)}

    return {"dataset": "synthetic-fixtures-v1", "engineVersion": ENGINE_VERSION, "synthetic": True, "total": len(rows), "rows": rows, "reference": summarize("reference"), "proposed": summarize("proposed"), "disclaimer": {"pt": "Acurácia mede concordância com 18 exemplos sintéticos escritos pelo autor. Latência e custo são cenários fixos, não medições. Não é um benchmark independente.", "en": "Accuracy measures agreement with 18 author-written synthetic examples. Latency and cost are fixed scenarios, not measurements. This is not an independent benchmark."}}
