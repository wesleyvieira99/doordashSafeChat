"""Small MCP 2025-03-26 stdio server using the standard library only.

Supports lifecycle, ping and three read-only tools. No sampling, mutation tools,
HTTP transport, secrets or external I/O. Stdout contains JSON-RPC messages only.
"""
from __future__ import annotations

import json
import sys
from typing import Any

from .engine import TOOL_DEFINITIONS, InputError, call_tool

PROTOCOL_VERSION = "2025-03-26"
MAX_LINE_BYTES = 16384


class Session:
    def __init__(self):
        self.initialized = False
        self.ready = False

    @staticmethod
    def error(identifier, code: int, message: str) -> dict:
        return {"jsonrpc": "2.0", "id": identifier, "error": {"code": code, "message": message}}

    def dispatch(self, request: Any) -> dict | list | None:
        if isinstance(request, list):
            if not request or len(request) > 20:
                return self.error(None, -32600, "Invalid batch")
            if any(isinstance(item, dict) and item.get("method") == "initialize" for item in request):
                return self.error(None, -32600, "Initialization cannot be batched")
            responses = [self.dispatch(item) for item in request]
            return [response for response in responses if response is not None] or None
        if not isinstance(request, dict) or request.get("jsonrpc") != "2.0" or not isinstance(request.get("method"), str):
            return self.error(None, -32600, "Invalid request")
        identifier = request.get("id")
        if "id" in request and (isinstance(identifier, bool) or not isinstance(identifier, (str, int))):
            return self.error(None, -32600, "Invalid request id")
        method, params = request["method"], request.get("params", {})
        if "id" not in request:
            if method == "notifications/initialized" and self.initialized:
                self.ready = True
            return None
        if not isinstance(params, dict):
            return self.error(identifier, -32602, "Parameters must be an object")
        if method == "initialize":
            if self.initialized:
                return self.error(identifier, -32600, "Already initialized")
            if not isinstance(params.get("protocolVersion"), str) or not isinstance(params.get("clientInfo"), dict) or not isinstance(params.get("capabilities"), dict):
                return self.error(identifier, -32602, "Missing initialization fields")
            self.initialized = True
            result = {"protocolVersion": PROTOCOL_VERSION, "capabilities": {"tools": {"listChanged": False}}, "serverInfo": {"name": "safechat-synthetic-demo", "version": "1.0.0"}, "instructions": "Fictional policies and synthetic cases only. All tools are read-only. No account actions exist."}
        elif method == "ping":
            result = {}
        elif not self.ready:
            return self.error(identifier, -32002, "Initialize and send notifications/initialized first")
        elif method == "tools/list":
            if params.get("cursor") is not None:
                return self.error(identifier, -32602, "Pagination cursor is unsupported for this fixed tool list")
            result = {"tools": TOOL_DEFINITIONS}
        elif method == "tools/call":
            try:
                output = call_tool(params.get("name"), params.get("arguments", {}))
                result = {"content": [{"type": "text", "text": json.dumps(output, ensure_ascii=False)}], "isError": False}
            except InputError as error:
                if error.code in ("TOOL_NOT_ALLOWED", "TOOL_ARGUMENTS_INVALID", "QUERY_INVALID", "LOCALE_INVALID"):
                    return self.error(identifier, -32602, error.code)
                result = {"content": [{"type": "text", "text": json.dumps(error.as_dict(), ensure_ascii=False)}], "isError": True}
        else:
            return self.error(identifier, -32601, "Method not found")
        return {"jsonrpc": "2.0", "id": identifier, "result": result}


def main() -> None:
    session = Session()
    while True:
        line = sys.stdin.buffer.readline(MAX_LINE_BYTES + 1)
        if not line:
            break
        if len(line) > MAX_LINE_BYTES:
            # Drain the oversized frame without loading it into memory.
            while line and not line.endswith(b"\n"):
                line = sys.stdin.buffer.readline(MAX_LINE_BYTES + 1)
            response = session.error(None, -32600, "Frame exceeds 16 KiB")
        else:
            try:
                response = session.dispatch(json.loads(line))
            except (json.JSONDecodeError, UnicodeDecodeError):
                response = session.error(None, -32700, "Parse error")
        if response is not None:
            sys.stdout.write(json.dumps(response, ensure_ascii=False, separators=(",", ":")) + "\n")
            sys.stdout.flush()


if __name__ == "__main__":
    main()
