import json
import unittest

from fastapi.testclient import TestClient

from .app import IdempotencyCache, app, cache


class APITests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        cache.entries.clear()

    def tearDown(self):
        self.client.close()

    def test_health_identifies_actual_implementation(self):
        health = self.client.get("/health").json()
        self.assertFalse(health["llmConfigured"])
        self.assertFalse(health["sensitiveActionsEnabled"])

    def test_moderation_and_replay_conflict(self):
        payload = {"text": "You are an idiot.", "idempotencyKey": "test-key-1"}
        first = self.client.post("/moderate", json=payload)
        second = self.client.post("/moderate", json=payload)
        self.assertEqual(first.status_code, 200)
        self.assertEqual(first.json()["action"], "censor")
        self.assertEqual(first.json(), second.json())
        self.assertEqual(second.headers["X-Idempotent-Replay"], "true")
        conflict = self.client.post("/moderate", json={**payload, "text": "Hello"})
        self.assertEqual(conflict.status_code, 409)
        self.assertEqual(conflict.json()["error"]["code"], "IDEMPOTENCY_CONFLICT")

    def test_validation_errors_never_echo_raw_input(self):
        unique = "SECRET_RAW_INPUT_x" * 150
        response = self.client.post("/moderate", json={"text": unique})
        self.assertEqual(response.status_code, 422)
        self.assertNotIn("SECRET_RAW_INPUT", response.text)
        self.assertIn("pt", response.json()["error"]["messages"])
        self.assertEqual(self.client.post("/moderate", json={"text": "ok", "available": "false"}).status_code, 422)
        self.assertEqual(self.client.post("/moderate", json={"text": "ok", "admin": True}).status_code, 422)

    def test_request_body_cap_before_parsing(self):
        response = self.client.post("/moderate", content=b"x" * 17000, headers={"Content-Type": "application/json"})
        self.assertEqual(response.status_code, 413)

    def test_no_account_action_endpoint(self):
        self.assertEqual(self.client.post("/ban_user", json={"account": "synthetic-1"}).status_code, 404)

    def test_policies_evaluation_and_cors(self):
        self.assertTrue(self.client.get("/policies", params={"q": "ameaça"}).json()["results"])
        self.assertEqual(self.client.get("/evaluation").json()["total"], 18)
        response = self.client.options("/moderate", headers={"Origin": "https://untrusted.example", "Access-Control-Request-Method": "POST"})
        self.assertNotIn("Access-Control-Allow-Origin", response.headers)

    def test_bounded_cache_contains_only_hashes_and_result_envelopes(self):
        local_cache = IdempotencyCache(capacity=2)
        for index in range(3):
            local_cache.run({"text": f"private-value-{index}", "idempotencyKey": f"key-{index}"})
        self.assertEqual(len(local_cache.entries), 2)
        self.assertNotIn("private-value", json.dumps(list(local_cache.entries.items())))
        self.assertNotIn("key-", json.dumps(list(local_cache.entries.items())))
        expired_cache = IdempotencyCache(ttl_seconds=0)
        expired_cache.run({"text": "first", "idempotencyKey": "same-key"})
        _, replayed = expired_cache.run({"text": "second", "idempotencyKey": "same-key"})
        self.assertFalse(replayed)


if __name__ == "__main__":
    unittest.main()
