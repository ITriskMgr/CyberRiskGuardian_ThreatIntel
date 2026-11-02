#!/usr/bin/env python3
"""mock_embed.py — a stand-in for a LOCAL embedding model, for the Virtual consultant suites.

Serves the two endpoints the helper calls:
  POST /api/embeddings     Ollama:  {"model", "prompt"}        -> {"embedding": [...]}
  POST /v1/embeddings      OpenAI:  {"model", "input": [...]}  -> {"data": [{"index", "embedding"}], "model"}
Vectors are deterministic (hashed bag of words, 64 dimensions, salted by the model name, so a change of
model changes every vector). Every request is appended to the log file as one JSON line, so a test can
check which endpoint was called with which model. Standard library only.

Usage: python3 mock_embed.py PORT LOGFILE
"""
import hashlib
import http.server
import json
import math
import re
import socketserver
import sys

DIMS = 64


def vector(text, model):
    v = [0.0] * DIMS
    for w in re.findall(r"[a-z0-9]{3,}", str(text).lower()):
        h = hashlib.sha256((model + "|" + w[:6]).encode()).digest()
        v[h[0] % DIMS] += 1.0 if h[1] & 1 else -1.0
    n = math.sqrt(sum(x * x for x in v)) or 1.0
    return [round(x / n, 6) for x in v]


class H(http.server.BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def _send(self, code, obj):
        b = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(b)))
        self.end_headers()
        self.wfile.write(b)

    def do_POST(self):
        body = json.loads(self.rfile.read(int(self.headers.get("Content-Length") or 0)) or b"{}")
        model = str(body.get("model") or "")
        with open(LOG, "a", encoding="utf-8") as fh:
            fh.write(json.dumps({"path": self.path, "model": model,
                                 "n": len(body["input"]) if isinstance(body.get("input"), list) else 1}) + "\n")
        if self.path == "/api/embeddings":
            return self._send(200, {"embedding": vector(body.get("prompt", ""), model)})
        if self.path == "/v1/embeddings":
            items = body.get("input") or []
            items = items if isinstance(items, list) else [items]
            return self._send(200, {"model": model, "object": "list",
                                    "data": [{"object": "embedding", "index": i, "embedding": vector(t, model)} for i, t in enumerate(items)]})
        return self._send(404, {"error": "unknown endpoint"})


class S(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


if __name__ == "__main__":
    PORT, LOG = int(sys.argv[1]), sys.argv[2]
    open(LOG, "w").close()
    S(("127.0.0.1", PORT), H).serve_forever()
