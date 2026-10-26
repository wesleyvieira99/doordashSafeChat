"""Local-only demo API. Run from repository root with the documented command."""
from __future__ import annotations

import hashlib
import json
import threading
import time
from collections import OrderedDict
from typing import Annotated, Literal

from fastapi import FastAPI, Query, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict, Field, StrictBool, field_validator

from .engine import ENGINE_VERSION, POLICIES, InputError, moderate, retrieve_policy, evaluate_dataset
from .advisory import AdvisoryError, configured, get_advisory


class ModerationRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    text: str = Field(min_length=1, max_length=2000)
    context: str = Field(default="", max_length=2000)
    locale: Literal["pt", "en"] = "pt"
    threshold: float = Field(default=0.72, ge=0, le=1, allow_inf_nan=False)
    available: StrictBool = True
    mode: Literal["reference", "proposed"] = "proposed"
    idempotencyKey: str | None = Field(default=None, min_length=1, max_length=80, pattern=r"^[A-Za-z0-9_-]+$")

    @field_validator("text")
    @classmethod
    def not_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("TEXT_REQUIRED")
        return value


class BodyLimit:
    """Bound memory before JSON parsing; do not echo or log rejected bodies."""
    def __init__(self, app, max_bytes: int = 16384):
        self.app, self.max_bytes = app, max_bytes

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            return await self.app(scope, receive, send)
        chunks, size = [], 0
        while True:
            message = await receive()
            if message["type"] == "http.disconnect":
                return
            chunk = message.get("body", b"")
            size += len(chunk)
            if size > self.max_bytes:
                response = JSONResponse(status_code=413, content={"error": {"code": "BODY_TOO_LARGE", "messages": {"pt": "Corpo da requisição excede 16 KiB.", "en": "Request body exceeds 16 KiB."}}})
                return await response(scope, receive, send)
            chunks.append(chunk)
            if not message.get("more_body", False):
                break
        body, delivered = b"".join(chunks), False

        async def replay():
            nonlocal delivered
            if not delivered:
                delivered = True
                return {"type": "http.request", "body": body, "more_body": False}
            return await receive()

        await self.app(scope, replay, send)


app = FastAPI(title="SafeChat synthetic demo API", version="1.0.0", description="Deterministic moderation. Separate opt-in local advisory; no account mutations or production policies.")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5178", "http://127.0.0.1:5178", "http://localhost:5173", "http://127.0.0.1:5173"], allow_methods=["GET", "POST"], allow_headers=["Content-Type"])
app.add_middleware(BodyLimit)


@app.exception_handler(InputError)
async def engine_error(_request: Request, exc: InputError):
    return JSONResponse(status_code=422, content={"error": exc.as_dict()})


@app.exception_handler(RequestValidationError)
async def validation_error(_request: Request, exc: RequestValidationError):
    # Pydantic's default detail includes input; return only field names/type codes.
    fields = [{"field": ".".join(map(str, error["loc"])), "type": error["type"]} for error in exc.errors()]
    return JSONResponse(status_code=422, content={"error": {"code": "INPUT_INVALID", "messages": {"pt": "Confira os campos e limites da requisição.", "en": "Check request fields and bounds."}, "fields": fields}})


class IdempotencyCache:
    """Bounded process-local replay cache; contains hashes and results, no raw input."""
    def __init__(self, capacity: int = 128, ttl_seconds: float = 300):
        self.capacity, self.ttl_seconds = capacity, ttl_seconds
        self.entries: OrderedDict[str, tuple[float, str, dict]] = OrderedDict()
        self.lock = threading.Lock()

    def run(self, data: dict) -> tuple[dict, bool]:
        key = data.pop("idempotencyKey", None)
        if key is None:
            return moderate(data), False
        key_digest = hashlib.sha256(key.encode()).hexdigest()
        fingerprint = hashlib.sha256(json.dumps(data, sort_keys=True, ensure_ascii=False, separators=(",", ":")).encode()).hexdigest()
        with self.lock:
            now = time.monotonic()
            expired = [key for key, value in self.entries.items() if now - value[0] >= self.ttl_seconds]
            for expired_key in expired:
                del self.entries[expired_key]
            if key_digest in self.entries:
                _, existing_fingerprint, result = self.entries[key_digest]
                if fingerprint != existing_fingerprint:
                    raise InputError("IDEMPOTENCY_CONFLICT", "A chave já foi usada com outra entrada.", "The key was already used with different input.")
                self.entries.move_to_end(key_digest)
                return result, True
            result = moderate(data)
            self.entries[key_digest] = (now, fingerprint, result)
            while len(self.entries) > self.capacity:
                self.entries.popitem(last=False)
            return result, False


cache = IdempotencyCache()


@app.get("/health")
def health():
    try:
        configured()
        advisory_configured = True
    except AdvisoryError:
        advisory_configured = False
    return {"status": "ok", "engineVersion": ENGINE_VERSION, "mode": "deterministic-fixtures", "llmConfigured": False, "sensitiveActionsEnabled": False, "advisoryConfigured": advisory_configured, "advisoryConnectivityVerified": False}


@app.post("/moderate")
def moderate_endpoint(body: ModerationRequest):
    try:
        result, replayed = cache.run(body.model_dump(exclude_none=True))
    except InputError as error:
        if error.code == "IDEMPOTENCY_CONFLICT":
            return JSONResponse(status_code=409, content={"error": error.as_dict()})
        raise
    return JSONResponse(content=result, headers={"X-Demo-Mode": "synthetic", "X-Idempotent-Replay": str(replayed).lower(), "Cache-Control": "no-store"})


@app.get("/policies")
def policy_endpoint(q: Annotated[str | None, Query(min_length=1, max_length=500)] = None, locale: Literal["pt", "en"] = "pt"):
    return {"source": "synthetic-policies", "retrieval": "lexical", "results": retrieve_policy(q, locale) if q is not None else POLICIES}


@app.get("/evaluation")
def evaluation_endpoint():
    return evaluate_dataset()


class AdvisoryRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    text: str = Field(min_length=1, max_length=2000)
    context: str = Field(default="", max_length=2000)
    locale: Literal["pt", "en"] = "pt"

    @field_validator("text")
    @classmethod
    def not_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("TEXT_REQUIRED")
        return value


@app.post("/advisory")
async def advisory_endpoint(body: AdvisoryRequest):
    # Separate opt-in endpoint; no call to moderate and no authority to mutate.
    try:
        result = await get_advisory(body.text, body.context, body.locale, configured())
        return JSONResponse(content=result, headers={"Cache-Control": "no-store", "X-Advisory-Authority": "none"})
    except AdvisoryError as error:
        return JSONResponse(status_code=error.status, content={"error": {"code": error.code, "messages": error.messages}}, headers={"Cache-Control": "no-store"})
