import asyncio
import json
import os
import unittest
from unittest.mock import patch

import httpx
from fastapi.testclient import TestClient

from .advisory import AdvisoryConfig, AdvisoryError, configured, get_advisory
from .app import app


def response(**overrides):
    content = {"category": "ambiguous", "summary": "Synthetic context needs review.", "needsReview": True, **overrides}
    return httpx.Response(200, json={"done": True, "message": {"content": json.dumps(content)}})


class AdvisoryTests(unittest.IsolatedAsyncioTestCase):
    async def test_schema_no_tools_no_authority(self):
        requests = []
        def handler(request):
            requests.append(json.loads(request.content))
            return response()
        result = await get_advisory("synthetic", "", "en", AdvisoryConfig("http://127.0.0.1:11434", "fixture-model"), httpx.MockTransport(handler))
        self.assertFalse(result["authoritative"])
        self.assertFalse(result["actionExecuted"])
        self.assertEqual(requests[0]["stream"], False)
        self.assertNotIn("tools", requests[0])
        self.assertIn("additionalProperties", requests[0]["format"])

    async def test_transient_retried_once(self):
        calls = []
        def handler(request):
            calls.append(request)
            return httpx.Response(503) if len(calls) == 1 else response()
        await get_advisory("synthetic", "", "pt", AdvisoryConfig("http://127.0.0.1:11434", "fixture-model"), httpx.MockTransport(handler))
        self.assertEqual(len(calls), 2)

    async def test_nontransient_and_invalid_schema_not_retried(self):
        for reply in (httpx.Response(400), response(action="ban_user"), httpx.Response(200, json={"done": False}), httpx.Response(200, text="x" * 65537)):
            calls = []
            def handler(request):
                calls.append(request)
                return reply
            with self.assertRaises(AdvisoryError) as caught:
                await get_advisory("synthetic", "", "en", AdvisoryConfig("http://127.0.0.1:11434", "fixture-model"), httpx.MockTransport(handler))
            self.assertEqual(caught.exception.code, "ADVISORY_INVALID_RESPONSE")
            self.assertEqual(len(calls), 1)

    async def test_total_deadline_cancels_slow_provider(self):
        async def handler(request):
            await asyncio.sleep(0.2)
            return response()
        with self.assertRaises(AdvisoryError) as caught:
            await get_advisory("synthetic", "", "en", AdvisoryConfig("http://127.0.0.1:11434", "fixture-model", 0.02), httpx.MockTransport(handler))
        self.assertEqual(caught.exception.code, "ADVISORY_TIMEOUT")

    async def test_exhausted_transport_failure_has_two_attempts(self):
        calls = []
        def handler(request):
            calls.append(request)
            raise httpx.ConnectError("fixture failure")
        with self.assertRaises(AdvisoryError) as caught:
            await get_advisory("synthetic", "", "en", AdvisoryConfig("http://127.0.0.1:11434", "fixture-model"), httpx.MockTransport(handler))
        self.assertEqual(caught.exception.code, "ADVISORY_UNAVAILABLE")
        self.assertEqual(len(calls), 2)

    async def test_disabled_configuration_and_loopback_boundary(self):
        with patch.dict(os.environ, {}, clear=True):
            with self.assertRaises(AdvisoryError) as caught:
                configured()
            self.assertEqual(caught.exception.code, "ADVISORY_DISABLED")
        for url in ["https://example.com", "http://localhost:11434", "http://127.0.0.1:11434/path", "http://user:secret@127.0.0.1", "http://127.0.0.1?next=external"]:
            with self.assertRaises(ValueError):
                AdvisoryConfig(url, "fixture-model")

    async def test_endpoint_defaults_disabled_and_moderation_unchanged(self):
        with patch.dict(os.environ, {}, clear=True), TestClient(app) as client:
            result = client.post("/advisory", json={"text": "synthetic"})
            self.assertEqual(result.status_code, 503)
            self.assertEqual(result.json()["error"]["code"], "ADVISORY_DISABLED")
            self.assertEqual(client.post("/moderate", json={"text": "Hello"}).json()["action"], "allow")


if __name__ == "__main__":
    unittest.main()
