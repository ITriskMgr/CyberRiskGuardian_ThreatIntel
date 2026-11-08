#!/usr/bin/env python3
"""mock_github.py — a stand-in for the GitHub "latest release" API, for t29 (update check). Loopback only.
Paths: /newer /same /none (404) /rate (403 rate limit) /noasset /verified and /badsum (1.9.0: the
release carries "<zip>.sha256", right or wrong), /signed and /badsig (1.9.2: a minisign signature, valid or not), and
/asset.zip, /asset.sha256, /bad.sha256, /good.minisig, /bad.minisig. Every request is logged to
the file given as second argument (path, query and headers), so the test can check nothing was sent.
Third and fourth arguments: the version to announce as newer and the running version (t29 derives both from js/version.js)."""
import hashlib, http.server, json, os, sys
PORT = int(sys.argv[1]); LOG = sys.argv[2]
NEWER = sys.argv[3] if len(sys.argv) > 3 else "1.9.0"; CURRENT = sys.argv[4] if len(sys.argv) > 4 else "1.8.1"
ZNAME = f"CyberRiskGuardian_Desktop_v{NEWER}-beta.zip"
ZIP = b'PK\x05\x06' + b'\x00' * 18
# 1.9.2 (NV-086): a minisign key pair made at start; the public key is written to the file named as fifth argument so the
# helper can be started with CRG_UPDATE_PUBKEY pointing at it. /signed carries a valid "<zip>.minisig", /badsig a wrong one.
SIG_GOOD = SIG_BAD = ""
if len(sys.argv) > 5:
    sys.path.insert(0, os.environ.get("CRG_APP_DIR") or os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "app"))
    import crg_signing
    _sec, _pub = crg_signing.generate_keypair()
    with open(sys.argv[5], "w", encoding="utf-8") as fh:
        fh.write(_pub)
    SIG_GOOD = crg_signing.sign(_sec, _pub, ZIP, "CyberRiskGuardian Desktop release " + NEWER)
    SIG_BAD = crg_signing.sign(_sec, _pub, ZIP + b"tampered", "CyberRiskGuardian Desktop release " + NEWER)
def rel(tag, asset=True):
    return {"tag_name": tag, "name": "CyberRiskGuardian Desktop " + tag, "html_url": f"https://github.com/ITriskMgr/CyberRiskGuardian_ThreatIntel/releases/tag/{tag}",
            "published_at": "2026-11-02T10:00:00Z", "prerelease": False,
            "assets": [{"name": f"CyberRiskGuardian_Desktop_{tag}-beta.zip", "size": len(ZIP), "browser_download_url": f"http://127.0.0.1:{PORT}/asset.zip"}] if asset else []}
def signed(tag, good=True, sig=None):
    r = rel(tag)
    name = r["assets"][0]["name"] + ".sha256"
    r["assets"].append({"name": name, "size": 90, "browser_download_url": f"http://127.0.0.1:{PORT}/{'asset' if good else 'bad'}.sha256"})
    if sig:
        r["assets"].append({"name": r["assets"][0]["name"] + ".minisig", "size": 200, "browser_download_url": f"http://127.0.0.1:{PORT}/{sig}.minisig"})
    return r
class H(http.server.BaseHTTPRequestHandler):
    def log_message(self, *a): pass
    def send(self, code, body, ctype="application/json", headers=None):
        self.send_response(code); self.send_header("Content-Type", ctype); self.send_header("Content-Length", str(len(body)))
        for k, v in (headers or {}).items(): self.send_header(k, v)
        self.end_headers(); self.wfile.write(body)
    def do_GET(self):
        with open(LOG, "a") as fh: fh.write(json.dumps({"path": self.path, "headers": dict(self.headers)}) + "\n")
        p = self.path.split("?")[0]
        if p == "/newer": return self.send(200, json.dumps(rel("v" + NEWER)).encode())
        if p == "/same": return self.send(200, json.dumps(rel("v" + CURRENT)).encode())
        if p == "/noasset": return self.send(200, json.dumps(rel("v" + NEWER, asset=False)).encode())
        if p == "/plugin":
            r = rel("v2.1.0", asset=False); r["assets"] = [{"name": "CyberRiskGuardian-Skills-2.1.0.zip", "size": 10, "browser_download_url": f"http://127.0.0.1:{PORT}/asset.zip"}]
            return self.send(200, json.dumps([r]).encode())
        if p == "/mixed":
            plug = rel("plugin-v2.1.0", asset=False); plug["assets"] = [{"name": "cyberriskguardian-threatintel-2.1.0.zip", "size": 10, "browser_download_url": f"http://127.0.0.1:{PORT}/asset.zip"}]
            draft = rel("v9.9.9"); draft["draft"] = True
            return self.send(200, json.dumps([draft, plug, rel("v" + NEWER), rel("v1.7.0")]).encode())
        if p == "/none": return self.send(404, b'{"message":"Not Found"}')
        if p == "/rate": return self.send(403, b'{"message":"API rate limit exceeded"}', headers={"X-RateLimit-Remaining": "0", "X-RateLimit-Reset": "1893456000"})
        if p == "/verified": return self.send(200, json.dumps(signed("v" + NEWER)).encode())
        if p == "/badsum": return self.send(200, json.dumps(signed("v" + NEWER, good=False)).encode())
        if p == "/signed": return self.send(200, json.dumps(signed("v" + NEWER, sig="good")).encode())
        if p == "/badsig": return self.send(200, json.dumps(signed("v" + NEWER, sig="bad")).encode())
        if p == "/good.minisig": return self.send(200, SIG_GOOD.encode(), "text/plain")
        if p == "/bad.minisig": return self.send(200, SIG_BAD.encode(), "text/plain")
        if p == "/asset.sha256": return self.send(200, (hashlib.sha256(ZIP).hexdigest() + "  " + ZNAME + "\n").encode(), "text/plain")
        if p == "/bad.sha256": return self.send(200, ("0" * 64 + "  " + ZNAME + "\n").encode(), "text/plain")
        if p == "/asset.zip": return self.send(200, ZIP, "application/zip")
        return self.send(404, b"{}")
http.server.ThreadingHTTPServer(("127.0.0.1", PORT), H).serve_forever()
