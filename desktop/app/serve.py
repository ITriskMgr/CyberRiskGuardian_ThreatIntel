#!/usr/bin/env python3
# SPDX-License-Identifier: CC-BY-NC-4.0
# Copyright (c) 2026 Marc-André Léger
"""CyberRiskGuardian Desktop — local server and download helper (version 1.4.0).

Serves the app folder on 127.0.0.1 (loopback only) exactly like `python3 -m http.server`, and adds a
small helper API used by Vulnerabilities → Online sources:

  * It downloads public threat and vulnerability sources IN FULL (bulk) — CISA KEV, FIRST EPSS for a
    date, NVD CVE records for a date range or the complete catalogue — into
        ~/Downloads/CyberRiskGuardian-feeds/
    in the background. The organization's own CVE list is never sent anywhere (constraint C5): the
    join with the vulnerability register happens later, in the browser, on this computer.
  * Downloads keep running while this window stays open, even if the browser is closed. Their state is
    recorded in manifest.json in that folder, so the app can list finished files and load them later.
  * 1.4.0: threat feeds and social media (crg_feeds.py — OTX, abuse.ch ThreatFox / MalwareBazaar / URLhaus /
    Feodo, SANS ISC, advisories, Mastodon, Bluesky, X…), the shared configuration edited in Settings
    (crg-config.json), optional API keys for unattended runs (crg-keys.json, mode 600), publishing of
    anonymized registry packages to a shared folder, and the asset-discovery drop folder.
  * It only ever fetches the fixed list of sources below and the feed sources in your accepted list. It is not a general proxy, it listens on
    loopback only, and its API refuses requests that do not come from the app itself.

Standard library only. Usage:  python3 serve.py [port]      (default 8099)
"""
from __future__ import annotations

import datetime as dt
import gzip
import http.server
import io
import json
import os
import re
import socketserver
import ssl
import sys
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import crg_feeds  # noqa: E402  (same folder)

VERSION = "1.5.6"
ROOT = os.path.dirname(os.path.abspath(__file__))
def _feeds_dir():
    """CRG_FEEDS_DIR, else the path written in feeds-dir.txt beside this file, else ~/Downloads/CyberRiskGuardian-feeds."""
    if os.environ.get("CRG_FEEDS_DIR"):
        return os.path.expanduser(os.environ["CRG_FEEDS_DIR"])
    try:
        with open(os.path.join(ROOT, "feeds-dir.txt"), encoding="utf-8") as fh:
            line = fh.read().strip().splitlines()[0].strip()
        if line:
            return os.path.expanduser(line)
    except (OSError, IndexError):
        pass
    return os.path.join(os.path.expanduser("~"), "Downloads", "CyberRiskGuardian-feeds")


FEEDS = _feeds_dir()
MANIFEST = os.path.join(FEEDS, "manifest.json")
UA = f"CyberRiskGuardian-Desktop/{VERSION} (+https://github.com/ITriskMgr/CyberRiskGuardian)"

# Fixed source list. CRG_FEED_BASE lets the test-suite point every source at a local mock server.
_BASE = os.environ.get("CRG_FEED_BASE")
SOURCES = {
    "kev": [_BASE + "/kev.json"] if _BASE else [
        "https://raw.githubusercontent.com/cisagov/kev-data/develop/known_exploited_vulnerabilities.json",
        "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json"],
    "epss": (_BASE + "/epss_scores-{date}.csv.gz") if _BASE else "https://epss.empiricalsecurity.com/epss_scores-{date}.csv.gz",
    "nvd": (_BASE + "/nvd") if _BASE else "https://services.nvd.nist.gov/rest/json/cves/2.0",
}
NVD_PAGE = 2000
NVD_MAX_DAYS = 120          # NVD rejects date ranges longer than 120 days

CERT_HINT = ("TLS certificate verification failed. The python.org build of Python on macOS ships without "
             "root certificates: run '/Applications/Python 3.x/Install Certificates.command' once, or "
             "'pip3 install certifi'. Verification is never disabled.")

lock = threading.Lock()
jobs: dict[str, dict] = {}
cancel_flags: dict[str, threading.Event] = {}


# ---------------------------------------------------------------- manifest
def _load_manifest():
    os.makedirs(FEEDS, exist_ok=True)
    try:
        with open(MANIFEST, encoding="utf-8") as fh:
            data = json.load(fh)
    except Exception:                                   # noqa: BLE001
        data = {"jobs": []}
    for j in data.get("jobs", []):
        if j.get("status") in ("running", "queued"):
            j["status"] = "interrupted"
            j["message"] = "The helper was stopped before this download finished. Restart it."
        jobs[j["id"]] = j


def _save_manifest():
    tmp = MANIFEST + ".tmp"
    with open(tmp, "w", encoding="utf-8") as fh:
        json.dump({"helper": VERSION, "jobs": sorted(jobs.values(), key=lambda j: j["started"])}, fh, indent=1)
    os.replace(tmp, MANIFEST)


def _update(job, **kw):
    with lock:
        job.update(kw)
        job["updated"] = _now()
        _save_manifest()


def _now():
    return dt.datetime.now().isoformat(timespec="seconds")


# ---------------------------------------------------------------- fetching
def _ctx():
    # A corporate or sandbox proxy that inspects TLS publishes its CA through one of these variables.
    for var in ("SSL_CERT_FILE", "REQUESTS_CA_BUNDLE", "CURL_CA_BUNDLE", "NODE_EXTRA_CA_CERTS"):
        f = os.environ.get(var)
        if f and os.path.isfile(f):
            ctx = ssl.create_default_context()
            ctx.load_verify_locations(cafile=f)
            return ctx
    try:
        import certifi                                  # noqa: PLC0415
        return ssl.create_default_context(cafile=certifi.where())
    except Exception:                                   # noqa: BLE001
        return ssl.create_default_context()


def _fetch(url, headers=None, timeout=120):
    req = urllib.request.Request(url, headers={"User-Agent": UA, **(headers or {})})
    try:
        with urllib.request.urlopen(req, timeout=timeout, context=_ctx() if url.startswith("https") else None) as r:
            return r.read()
    except urllib.error.URLError as exc:
        if "CERTIFICATE_VERIFY_FAILED" in str(exc):
            raise RuntimeError(CERT_HINT) from exc
        raise



# ---------------------------------------------------------------- AI providers (1.5.1)
# The only part of the application that sends anything about a workspace anywhere. The browser never
# talks to a model: it posts here, and this process makes the call. Two providers:
#
#   claude  — api.anthropic.com with the analyst's own key. Text leaves the machine.
#   local   — an OpenAI-compatible endpoint on this machine (oMLX, Ollama, LM Studio…). Nothing
#             leaves the machine; the request does not go through a proxy or the public internet.
#
# Keys live in crg-keys.json (mode 600) beside the feeds, never in crg-config.json and never in a log.
# ---------------------------------------------------------------- AI providers (1.5.5)
# The only part of the application that sends anything about a workspace anywhere. The browser never
# talks to a model: it posts here, and this process makes the call.
#
# A provider is a row in a registry, not a branch in the code. Three wire protocols cover every
# provider below, so adding one is data, not logic:
#
#   anthropic  — POST {base}/messages, header x-api-key + anthropic-version
#   openai     — POST {base}/chat/completions, header Authorization: Bearer   (the de-facto standard:
#                OpenAI, Gemini's compatibility endpoint, GitHub Models, Ollama, LM Studio, vLLM…)
#   azure      — POST {base}/openai/deployments/{model}/chat/completions?api-version=…, header api-key
#
# `base` and `model` are always editable in Settings: a provider must not break because a published
# endpoint path or version string changed after this release. `local: True` means the request cannot
# leave the machine, which the routing policy relies on.
# Keys live in crg-keys.json (mode 600) beside the feeds, never in crg-config.json and never in a log.
AI_PROVIDERS = {
    "claude": {
        "label": "Claude API (api.anthropic.com)",
        "protocol": "anthropic", "base": "https://api.anthropic.com/v1",
        "key": "anthropic", "local": False, "default_model": "claude-sonnet-5",
        "key_url": "https://console.anthropic.com/settings/keys",
        "note": "Supports web search for missing profile data.",
    },
    "openai": {
        "label": "OpenAI (api.openai.com)",
        "protocol": "openai", "base": "https://api.openai.com/v1",
        "key": "openai", "local": False, "default_model": "",
        "key_url": "https://platform.openai.com/api-keys",
    },
    "gemini": {
        "label": "Google Gemini (OpenAI-compatible endpoint)",
        "protocol": "openai", "base": "https://generativelanguage.googleapis.com/v1beta/openai",
        "key": "gemini", "local": False, "default_model": "",
        "key_url": "https://aistudio.google.com/apikey",
        "note": "Google's own OpenAI-compatible endpoint is used, so there is one protocol to maintain "
                "rather than two.",
    },
    "azure": {
        "label": "Azure OpenAI (your own resource)",
        "protocol": "azure", "base": "", "key": "azure", "local": False, "default_model": "",
        "needs": ["base", "model", "api_version"],
        "note": "Give your resource endpoint (https://NAME.openai.azure.com), the deployment name as the "
                "model, and the api-version from your portal \u2014 Azure requires all three and they are "
                "yours, not ours to guess.",
    },
    "github": {
        "label": "GitHub Models (Copilot plan)",
        "protocol": "openai", "base": "https://models.github.ai/inference",
        "key": "github", "local": False, "default_model": "",
        "key_url": "https://github.com/settings/tokens",
        "note": "GitHub's model-inference API with a GitHub token. This is not the Copilot IDE assistant, "
                "which has no general API a third-party application may call.",
    },
    "ollama": {
        "label": "Ollama (this machine)",
        "protocol": "openai", "base": "http://127.0.0.1:11434/v1",
        "key": "ollama", "local": True, "default_model": "",
        "note": "Start it with `ollama serve`; pull a model with `ollama pull llama3.1`.",
    },
    "lmstudio": {
        "label": "LM Studio (this machine)",
        "protocol": "openai", "base": "http://127.0.0.1:1234/v1",
        "key": "lmstudio", "local": True, "default_model": "",
        "note": "Enable the local server in LM Studio (Developer \u2192 Start server).",
    },
    "local": {
        "label": "Other local model (OpenAI-compatible)",
        "protocol": "openai", "base": "http://127.0.0.1:8000/v1",
        "key": "local_ai", "local": True, "default_model": "",
        "note": "oMLX, llama.cpp, vLLM, text-generation-webui \u2014 anything serving /chat/completions.",
    },
}
# Kept so a 1.5.1-1.5.4 configuration still resolves; the registry carries the defaults now.
AI_DEFAULT_MODEL = {k: v.get("default_model", "") for k, v in AI_PROVIDERS.items()}
CUSTOM_ID = re.compile(r"^[a-z0-9_-]{1,24}$")


def ai_providers(cfg):
    """The registry plus this installation's custom providers (an internal gateway, a colleague's
    server). A custom provider is data in crg-config.json: id, label, base, protocol, local."""
    out = {k: dict(v) for k, v in AI_PROVIDERS.items()}
    for c in ((cfg.get("ai") or {}).get("custom") or []):
        pid = str(c.get("id") or "").strip().lower()
        if not CUSTOM_ID.match(pid) or pid in out:
            continue
        proto = c.get("protocol") if c.get("protocol") in ("openai", "anthropic", "azure") else "openai"
        out[pid] = {"label": str(c.get("label") or pid)[:80], "protocol": proto,
                    "base": str(c.get("base") or "")[:300], "key": "custom_" + pid,
                    "local": bool(c.get("local")), "default_model": str(c.get("model") or "")[:120],
                    "custom": True, "needs": ["base"]}
    return out


def ai_provider(pid, cfg):
    p = ai_providers(cfg).get(pid)
    if not p:
        raise RuntimeError(f"Unknown AI provider '{pid}'. Choose one in Settings → AI.")
    return p

AI_DEFAULT_MODEL = {"claude": "claude-sonnet-5", "local": ""}
MAX_AI_BYTES = 400_000          # a workspace excerpt, not a database dump

# 1.5.3 — routing policy, mirror of DEFAULT_POLICY in js/ai.js. The browser decides where a request should
# go; the helper checks the same policy before calling anything, so a feature set to "local only" (by
# default the vulnerability-linking task, which carries the organization's CVE list) can never reach
# api.anthropic.com, whatever a page asks for.
AI_DEFAULT_POLICY = {
    "remote_allowed": True, "web_search": True,
    "tasks": {"link_vulns": "local", "extract_profile": "workspace", "extract_crown": "workspace",
              "scenarios": "workspace", "analyst": "workspace", "critique": "workspace",
              "briefing": "workspace", "chat": "workspace",
              "extract_sensitive": "local", "extract_more": "workspace"},
}


def ai_policy(cfg):
    p = (cfg.get("ai") or {}).get("policy") or {}
    out = {**AI_DEFAULT_POLICY, **{k: v for k, v in p.items() if k != "tasks"}}
    out["tasks"] = {**AI_DEFAULT_POLICY["tasks"], **(p.get("tasks") or {})}
    return out


def ai_check_policy(provider, cfg, body):
    """Refuse a request the installation's policy does not allow. Returns an error string or ''."""
    task = body.get("task") or ""
    if not task:
        m = re.search(r"TASK:\s*([a-z_]+)", str(body.get("prompt") or ""))
        task = m.group(1) if m else ""
    pol = ai_policy(cfg)
    # 1.5.4 — the import-from-documents tasks share two features (sensitive → local by default)
    feature = "extract_sensitive" if task.startswith("extract_s_") else "extract_more" if task.startswith("extract_m_") else task
    mode = pol["tasks"].get(feature, "workspace")
    if mode == "off":
        return f"The feature '{task}' is switched off in Settings → AI — local & remote."
    # 1.5.5 — "remote" is every provider that is not on this machine, not the Claude API alone. The
    # check is on the provider's own `local` flag, so a new row in the registry is covered the day it
    # is added rather than the day someone remembers to extend this function.
    p = ai_providers(cfg).get(provider) or {}
    if not p.get("local"):
        where = p.get("label") or provider
        if not pol.get("remote_allowed", True):
            return f"Remote AI is switched off in Settings → AI — local & remote, so nothing may go to {where}."
        if mode == "local":
            return (f"The feature '{feature}' is set to the local model only; the helper will not send it "
                    f"to {where}.")
        if body.get("web_search") and not pol.get("web_search", True):
            return "Web search is switched off in Settings → AI — local & remote."
    if body.get("web_search") and provider != "claude":
        return f"Web search is available on the Claude API only; {p.get('label') or provider} cannot run it."
    return ""


def ai_test(provider, cfg):
    """A minimal round trip to check a provider: no workspace data, a few tokens."""
    t0 = time.time()
    out = ai_complete(provider, cfg, {"system": "You are a connectivity test. Reply with exactly: OK",
                                      "prompt": "TASK: test\nReply with exactly: OK", "max_tokens": 16})
    ms = int((time.time() - t0) * 1000)
    text = (out.get("text") or "").strip()
    return {"ok": True, "provider": provider, "model": out.get("model"), "ms": ms, "reply": text[:80],
            "label": ai_provider(provider, cfg)["label"]}


def _ai_base(cfg, pid="local"):
    """The endpoint for one provider: what Settings saved, else the registry default. `local_base` is
    still honoured for the single local provider of 1.5.1-1.5.4, so an existing configuration keeps
    working without being rewritten."""
    a = cfg.get("ai") or {}
    p = ai_providers(cfg).get(pid) or {}
    base = a.get(pid + "_base") or (a.get("local_base") if pid == "local" else "") or p.get("base") or ""
    return base.rstrip("/")


def _ai_model(cfg, pid):
    a = cfg.get("ai") or {}
    p = ai_providers(cfg).get(pid) or {}
    return a.get(pid + "_model") or p.get("default_model") or ""


def _ai_key(cfg, pid):
    p = ai_providers(cfg).get(pid) or {}
    return crg_feeds.load_keys(FEEDS).get(p.get("key") or "", "")


def _ai_headers(p, key, cfg):
    """Auth for one protocol. An empty key is allowed for a local endpoint that wants none."""
    proto = p.get("protocol")
    if proto == "anthropic":
        return {"x-api-key": key, "anthropic-version": "2023-06-01"}
    if proto == "azure":
        return {"api-key": key}
    return {"Authorization": "Bearer " + key} if key else {}


def _ai_requires_key(p):
    return not p.get("local")


def _azure_url(cfg, pid, model, what):
    base = _ai_base(cfg, pid)
    ver = (cfg.get("ai") or {}).get(pid + "_api_version") or ""
    if not base:
        raise RuntimeError("No Azure endpoint is set. Put your resource URL "
                           "(https://NAME.openai.azure.com) in Settings \u2192 AI.")
    if not ver:
        raise RuntimeError("No Azure api-version is set. Copy it from your portal into Settings \u2192 AI; "
                           "Azure rejects a request without one.")
    if what == "models":
        return f"{base}/openai/models?api-version={urllib.parse.quote(ver)}"
    if not model:
        raise RuntimeError("No Azure deployment name is set. Put it in the Model field in Settings \u2192 AI.")
    return (f"{base}/openai/deployments/{urllib.parse.quote(model)}/chat/completions"
            f"?api-version={urllib.parse.quote(ver)}")


def _post_json(url, payload, headers, timeout=180):
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, method="POST",
                                 headers={"User-Agent": UA, "Content-Type": "application/json", **(headers or {})})
    ctx = _ctx() if url.startswith("https") else None
    try:
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as r:
            return json.loads(r.read() or b"{}")
    except urllib.error.HTTPError as exc:
        detail = ""
        try:
            detail = (exc.read() or b"")[:600].decode("utf-8", "replace")
        except Exception:                               # noqa: BLE001
            pass
        raise RuntimeError(f"{exc.code} {exc.reason}{': ' + detail if detail else ''}") from exc
    except urllib.error.URLError as exc:
        if "CERTIFICATE_VERIFY_FAILED" in str(exc):
            raise RuntimeError(CERT_HINT) from exc
        raise RuntimeError(_ai_net_hint(url, exc)) from exc


def _ai_net_hint(url, exc):
    host = urllib.parse.urlparse(url).netloc
    if host.startswith(("127.0.0.1", "localhost")):
        return (f"No local model answered at {host}. Start it (for example oMLX or Ollama) and check the "
                f"base URL in Settings. Error: {exc}")
    return (f"{host} could not be reached. If this machine is behind an egress allowlist, {host} has to be "
            f"on it. Error: {exc}")


def ai_models(provider, cfg):
    """Ask the endpoint what it serves. Nothing is hardcoded, and a provider whose list endpoint is
    unavailable is not a dead end: Settings always lets the model be typed in."""
    p = ai_provider(provider, cfg)
    key = _ai_key(cfg, provider)
    proto = p.get("protocol")
    if _ai_requires_key(p) and not key:
        raise RuntimeError(f"No API key is stored for {p['label']}. Add one in Settings \u2192 AI.")
    if proto == "azure":
        url = _azure_url(cfg, provider, "", "models")
    else:
        base = _ai_base(cfg, provider)
        if not base:
            raise RuntimeError(f"No endpoint is set for {p['label']}. Put one in Settings \u2192 AI.")
        url = base + "/models"
    raw = _fetch(url, headers=_ai_headers(p, key, cfg), timeout=30)
    data = json.loads(raw or b"{}")
    items = data.get("data") or data.get("models") or []
    out = []
    for m in items:
        mid = m.get("id") or m.get("name")
        if mid:
            out.append({"id": mid, "name": m.get("display_name") or m.get("friendly_name") or mid})
    out.sort(key=lambda x: x["id"])
    return out


def ai_complete(provider, cfg, body):
    """One request to the chosen provider. Returns {text, model, provider, usage}."""
    mock = os.environ.get("CRG_AI_MOCK")
    if mock:                                            # test suite only: canned answers from a folder
        task = re.search(r"TASK:\s*([a-z_]+)", str(body.get("prompt") or ""))
        name = (task.group(1) if task else "default") + ".txt"
        try:
            with open(os.path.join(mock, name), encoding="utf-8") as fh:
                text = fh.read()
        except OSError:
            text = "Mock answer."
        return {"text": text, "model": "mock-model", "provider": provider, "sources": [{"url": "https://example.org/source", "title": "Mock source"}] if body.get("web_search") else [],
                "usage": {"in": len(str(body.get("prompt") or "")) // 4, "out": len(text) // 4}}
    p = ai_provider(provider, cfg)
    key = _ai_key(cfg, provider)
    system = str(body.get("system") or "")
    prompt = str(body.get("prompt") or "")
    if len(prompt.encode("utf-8")) > MAX_AI_BYTES:
        raise RuntimeError(f"The request is larger than the {MAX_AI_BYTES // 1000} kB limit for one call. "
                           "Narrow what you are sending.")
    model = body.get("model") or _ai_model(cfg, provider)
    max_tokens = int(body.get("max_tokens") or 4000)
    # Newer Claude models reject `temperature` outright, so it is sent only when a caller asks for it.
    temperature = None if body.get("temperature") is None else float(body["temperature"])
    proto = p.get("protocol")
    if _ai_requires_key(p) and not key:
        raise RuntimeError(f"No API key is stored for {p['label']}. Add one in Settings \u2192 AI, "
                           "or switch this workspace to a local model.")

    if proto == "anthropic":
        if not model:
            raise RuntimeError(f"No model is chosen for {p['label']}. Pick one in Settings \u2192 AI.")
        payload = {"model": model, "max_tokens": max_tokens, "system": system,
                   "messages": [{"role": "user", "content": prompt}]}
        if temperature is not None:
            payload["temperature"] = temperature
        # 1.5.2 - web search for missing profile data (Anthropic server tool). Results come back as
        # citations; the URLs are returned so every EXTERNAL value can be traced to its page.
        if body.get("web_search"):
            payload["tools"] = [{"type": "web_search_20250305", "name": "web_search", "max_uses": 6}]
        out = _post_json(_ai_base(cfg, provider) + "/messages", payload, _ai_headers(p, key, cfg))
        text = "".join(b.get("text", "") for b in out.get("content", []) if b.get("type") == "text")
        sources = []
        for b in out.get("content", []):
            for c in (b.get("citations") or []):
                if c.get("url") and c["url"] not in [x["url"] for x in sources]:
                    sources.append({"url": c["url"], "title": c.get("title") or ""})
        usage = out.get("usage") or {}
        return {"text": text, "model": out.get("model") or model, "provider": provider, "sources": sources[:30],
                "usage": {"in": usage.get("input_tokens"), "out": usage.get("output_tokens")}}

    # openai and azure share the chat-completions body; only the URL and the auth header differ.
    if proto == "azure":
        url = _azure_url(cfg, provider, model, "chat")
    else:
        base = _ai_base(cfg, provider)
        if not base:
            raise RuntimeError(f"No endpoint is set for {p['label']}. Put one in Settings \u2192 AI.")
        if not model:
            raise RuntimeError(f"No model is chosen for {p['label']}. Pick one in Settings \u2192 AI; "
                               "the list comes from the endpoint itself, or type the name.")
        url = base + "/chat/completions"
    msgs = ([{"role": "system", "content": system}] if system else []) + [{"role": "user", "content": prompt}]
    # `max_tokens` is the long-standing field and `max_completion_tokens` the newer one; sending both
    # is refused by some endpoints, so the newer name is used only where it is known to be required.
    payload = {"model": model, "max_tokens": max_tokens, "messages": msgs}
    if temperature is not None:
        payload["temperature"] = temperature
    try:
        out = _post_json(url, payload, _ai_headers(p, key, cfg))
    except RuntimeError as exc:
        # Some endpoints now reject `max_tokens` by name and ask for `max_completion_tokens`. Retry once
        # on exactly that complaint rather than making every provider carry a flag for it.
        if "max_completion_tokens" in str(exc):
            payload.pop("max_tokens", None)
            payload["max_completion_tokens"] = max_tokens
            out = _post_json(url, payload, _ai_headers(p, key, cfg))
        else:
            raise
    choice = (out.get("choices") or [{}])[0]
    text = ((choice.get("message") or {}).get("content")) or choice.get("text") or ""
    usage = out.get("usage") or {}
    return {"text": text, "model": out.get("model") or model, "provider": provider,
            "usage": {"in": usage.get("prompt_tokens"), "out": usage.get("completion_tokens")}}


def _write(job, name, data: bytes):
    path = os.path.join(FEEDS, name)
    with open(path + ".part", "wb") as fh:
        fh.write(data)
    os.replace(path + ".part", path)
    return path


def run_kev(job, params, ev):
    last = None
    for url in SOURCES["kev"]:
        try:
            _update(job, message=f"Downloading the KEV catalogue from {urllib.parse.urlparse(url).netloc}…", progress=0.1)
            raw = _fetch(url)
            data = json.loads(raw)
            n = len(data.get("vulnerabilities", []))
            name = f"kev-{data.get('catalogVersion', dt.date.today().isoformat()).replace('.', '-')}.json"
            _write(job, name, raw)
            return name, {"records": n, "catalog_version": data.get("catalogVersion"), "url": url}
        except Exception as exc:                        # noqa: BLE001
            last = exc
    raise RuntimeError(f"KEV could not be retrieved: {last}")


def run_epss(job, params, ev):
    date = params.get("date") or (dt.date.today() - dt.timedelta(days=1)).isoformat()
    tries = int(params.get("back_days", 5))
    start = dt.date.fromisoformat(date)
    last = None
    for off in range(tries):
        if ev.is_set():
            raise InterruptedError
        day = (start - dt.timedelta(days=off)).isoformat()
        url = SOURCES["epss"].format(date=day)
        try:
            _update(job, message=f"Downloading EPSS scores for {day}…", progress=0.1 + off * 0.1)
            raw = _fetch(url)
            text = gzip.decompress(raw).decode("utf-8", "replace")
            n = max(0, text.count("\n") - 2)
            name = f"epss_scores-{day}.csv.gz"
            _write(job, name, raw)
            return name, {"records": n, "score_date": day, "url": url}
        except Exception as exc:                        # noqa: BLE001
            last = exc
    raise RuntimeError(f"No EPSS file found for {date} or the {tries - 1} days before it ({last}).")


def _nvd_compact(item):
    c = item.get("cve", {})
    m = c.get("metrics", {})
    v4 = (m.get("cvssMetricV40") or [{}])[0].get("cvssData", {})
    v31 = (m.get("cvssMetricV31") or [{}])[0].get("cvssData", {})
    cwes = sorted({d.get("value") for w in c.get("weaknesses", []) for d in w.get("description", [])
                   if re.match(r"^CWE-\d+$", d.get("value", ""))})
    desc = next((d.get("value", "") for d in c.get("descriptions", []) if d.get("lang") == "en"), "")
    return {"id": c.get("id"), "published": (c.get("published") or "")[:10], "lastModified": (c.get("lastModified") or "")[:10],
            "status": c.get("vulnStatus"), "desc": desc[:400],
            "cvss4": {"vector": v4.get("vectorString"), "score": v4.get("baseScore")} if v4 else None,
            "cvss31": v31.get("baseScore") if v31 else None, "cwe": cwes,
            "kev": bool(c.get("cisaExploitAdd"))}


def run_nvd(job, params, ev):
    p = params
    mode = p.get("mode", "range")
    key = p.get("api_key") or ""
    delay = 0.7 if key else 6.5                         # NVD: 50 req/30 s with a key, 5 req/30 s without
    headers = {"apiKey": key} if key else {}
    if mode == "full":
        windows = [(None, None)]
        label = "complete"
    else:
        a = dt.date.fromisoformat(p["start"])
        b = dt.date.fromisoformat(p.get("end") or dt.date.today().isoformat())
        if b < a:
            raise ValueError("end date is before start date")
        windows, cur = [], a
        while cur <= b:
            nxt = min(b, cur + dt.timedelta(days=NVD_MAX_DAYS - 1))
            windows.append((cur, nxt)); cur = nxt + dt.timedelta(days=1)
        label = f"{a.isoformat()}_{b.isoformat()}"
    out, total_seen, wi = {}, 0, 0
    for (w0, w1) in windows:
        wi += 1
        start, total = 0, None
        while total is None or start < total:
            if ev.is_set():
                raise InterruptedError
            q = {"startIndex": start, "resultsPerPage": NVD_PAGE}
            if w0:
                q["lastModStartDate"] = f"{w0.isoformat()}T00:00:00.000Z"
                q["lastModEndDate"] = f"{w1.isoformat()}T23:59:59.999Z"
            url = SOURCES["nvd"] + "?" + urllib.parse.urlencode(q)
            for attempt in range(4):
                try:
                    data = json.loads(_fetch(url, headers, timeout=180))
                    break
                except Exception as exc:                # noqa: BLE001
                    if attempt == 3:
                        raise RuntimeError(f"NVD request failed after retries: {exc}") from exc
                    _update(job, message=f"NVD busy or rate-limited, retrying in {10 * (attempt + 1)} s…")
                    if ev.wait(10 * (attempt + 1)):
                        raise InterruptedError
            total = data.get("totalResults", 0)
            for it in data.get("vulnerabilities", []):
                r = _nvd_compact(it)
                if r["id"]:
                    out[r["id"]] = r
            start += NVD_PAGE
            total_seen = len(out)
            frac = (wi - 1 + min(1.0, start / max(1, total))) / len(windows)
            remaining = ((total - start) / NVD_PAGE if total else 0) + (len(windows) - wi) * 1
            _update(job, progress=round(frac, 4), records=total_seen,
                    message=f"Window {wi}/{len(windows)}: {min(start, total):,} of {total:,} records"
                            f" · about {int(max(0, remaining) * (delay + 2) / 60) + 1} min left")
            if total and start < total:
                if ev.wait(delay):
                    raise InterruptedError
        if wi < len(windows) and ev.wait(delay):
            raise InterruptedError
    doc = {"schema": "crg-nvd-compact/1", "source": "NVD CVE API 2.0", "mode": mode,
           "range": None if mode == "full" else {"start": p["start"], "end": p.get("end") or dt.date.today().isoformat()},
           "retrieved": dt.date.today().isoformat(), "count": len(out), "records": list(out.values())}
    name = f"nvd-{label}-{dt.date.today().isoformat()}.json"
    _write(job, name, json.dumps(doc, separators=(",", ":")).encode("utf-8"))
    return name, {"records": len(out)}


def run_feeds(job, params, ev):
    def prog(p, msg):
        if ev.is_set():
            raise InterruptedError
        _update(job, progress=round(p, 3), message=msg)
    ids = params.get("sources") or None
    dg = crg_feeds.run(ids=ids, due=bool(params.get("due")), d=FEEDS, progress=prog, cancel=ev)
    ok = sum(r["status"] == "ok" for r in dg["results"])
    job["results"] = dg["results"]
    return "feeds-digest.json", {"records": ok}


RUNNERS = {"kev": run_kev, "epss": run_epss, "nvd": run_nvd, "feeds": run_feeds}

SAFE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._ -]{0,120}$")


def _safe_join(base, *parts):
    p = os.path.abspath(os.path.join(base, *parts))
    if not p.startswith(os.path.abspath(base) + os.sep):
        raise ValueError("path outside folder")
    return p


def publish(name, content, target):
    """Write a registry package to the shared registry folder or the outbox, or a briefing to the
    feeds folder. Registry packages are anonymized in the app before they get here."""
    if not SAFE.match(name or "") or not name.endswith((".json", ".md", ".csv")):
        raise ValueError("bad file name")
    cfg = crg_feeds.load_config(FEEDS)
    local = os.path.expanduser((cfg.get("links") or {}).get("registry_local_dir") or "")
    if target == "briefing":
        # Briefings are not registry packages: they stay in the feeds folder, where the scheduled task
        # can find them, and never in the outbox that gets uploaded to the shared registry.
        folder = os.path.join(FEEDS, "briefings")
    elif target == "registry" and local:
        if not os.path.isdir(local):
            raise ValueError(f"shared registry folder not found: {local}")
        folder = local
    else:
        folder = os.path.join(FEEDS, "registry-outbox")
    os.makedirs(folder, exist_ok=True)
    path = _safe_join(folder, name)
    with open(path + ".part", "w", encoding="utf-8") as fh:
        fh.write(content)
    os.replace(path + ".part", path)
    return {"path": path, "folder": folder, "outbox": folder.endswith("registry-outbox")}


def list_dir(sub):
    folder = os.path.join(FEEDS, sub)
    os.makedirs(folder, exist_ok=True)
    out = []
    for f in sorted(os.listdir(folder)):
        p = os.path.join(folder, f)
        if os.path.isfile(p) and not f.startswith(".") and not f.endswith((".part", ".tmp")):
            out.append({"name": f, "bytes": os.path.getsize(p), "modified": dt.datetime.fromtimestamp(os.path.getmtime(p)).isoformat(timespec="seconds")})
    return out


def install_task_files():
    """Copy crg_feeds.py next to the data so a scheduled task needs only the feeds folder."""
    try:
        os.makedirs(os.path.join(FEEDS, "bin"), exist_ok=True)
        for sub in ("registry-outbox", "discovery"):
            os.makedirs(os.path.join(FEEDS, sub), exist_ok=True)
        src = os.path.join(ROOT, "crg_feeds.py")
        dst = os.path.join(FEEDS, "bin", "crg_feeds.py")
        with open(src, "rb") as a, open(dst + ".tmp", "wb") as b:
            b.write(a.read())
        os.replace(dst + ".tmp", dst)
        cfgp = os.path.join(FEEDS, "crg-config.json")
        if not os.path.exists(cfgp):
            crg_feeds.save_config({}, FEEDS)
    except Exception as exc:                            # noqa: BLE001
        sys.stderr.write(f"helper: could not install task files: {exc}\n")


def start_job(source, params):
    """Start a background download. The API key, if any, is used for the run but never written to disk."""
    if source not in RUNNERS:
        raise ValueError("unknown source")
    jid = uuid.uuid4().hex[:10]
    job = {"id": jid, "source": source, "params": {k: v for k, v in params.items() if k != "api_key"},
           "status": "running", "progress": 0.0, "message": "Starting…", "started": _now(), "updated": _now(),
           "file": None, "records": None}
    ev = threading.Event()
    with lock:
        jobs[jid] = job; cancel_flags[jid] = ev; _save_manifest()

    def work():
        try:
            name, info = RUNNERS[source](job, dict(params), ev)
            _update(job, status="done", progress=1.0, file=name, finished=_now(),
                    message=f"Saved {name} in Downloads/CyberRiskGuardian-feeds",
                    **{k: v for k, v in info.items() if k in ("records", "score_date", "catalog_version")})
        except InterruptedError:
            _update(job, status="cancelled", message="Cancelled.", finished=_now())
        except Exception as exc:                        # noqa: BLE001
            _update(job, status="error", message=str(exc)[:500], finished=_now())

    threading.Thread(target=work, daemon=True).start()
    return job


def list_files():
    out = []
    for f in sorted(os.listdir(FEEDS)):
        p = os.path.join(FEEDS, f)
        if (f.startswith(".") or f.endswith((".part", ".tmp")) or f in ("manifest.json", "feeds-digest.json", "suggested-sources.json")
                or f.startswith("crg-") or not os.path.isfile(p)):            # 1.4.0 settings and feed state are not catalogue files
            continue
        kind = "kev" if f.startswith("kev") or f.startswith("known_exploited") else "epss" if f.startswith("epss") else "nvd" if f.startswith("nvd") else "other"
        st = os.stat(p)
        out.append({"name": f, "kind": kind, "bytes": st.st_size, "modified": dt.datetime.fromtimestamp(st.st_mtime).isoformat(timespec="seconds")})
    return out


# ---------------------------------------------------------------- HTTP
class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def log_message(self, fmt, *args):                  # quieter console: API calls only
        if self.path.startswith("/api/") and "/api/jobs" not in self.path:
            sys.stderr.write("helper: " + (fmt % args) + "\n")

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def _json(self, code, obj):
        body = json.dumps(obj).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _guard(self):
        # Only the app may use the API: it sends X-CRG, which a foreign web page cannot add without a
        # CORS preflight this server never approves; the Host must be loopback.
        host = (self.headers.get("Host") or "").split(":")[0]
        if self.headers.get("X-CRG") != "1" or host not in ("localhost", "127.0.0.1"):
            self._json(403, {"error": "forbidden"}); return False
        return True

    def do_OPTIONS(self):                               # never approve cross-origin preflights
        self.send_response(403); self.end_headers()

    def do_GET(self):
        if not self.path.startswith("/api/"):
            return super().do_GET()
        if not self._guard():
            return
        path = urllib.parse.urlparse(self.path).path
        if path == "/api/ai/models":
            return self._ai_models(urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query))
        if path == "/api/helper":
            keys = crg_feeds.load_keys(FEEDS)
            cfg = crg_feeds.load_config(FEEDS)
            return self._json(200, {"helper": VERSION, "feeds_dir": FEEDS, "sources": list(RUNNERS), "feeds": True,
                                    "ai": self._ai_state(cfg, keys)})
        if path == "/api/jobs":
            with lock:
                return self._json(200, {"jobs": sorted(jobs.values(), key=lambda j: j["started"], reverse=True)})
        if path == "/api/files":
            return self._json(200, {"feeds_dir": FEEDS, "files": list_files()})
        if path == "/api/config":
            cfg = crg_feeds.load_config(FEEDS)
            return self._json(200, {"config": cfg, "keys": sorted(crg_feeds.load_keys(FEEDS)), "catalogue": crg_feeds.SOURCES,
                                    "sources": crg_feeds.sources(cfg), "feeds_dir": FEEDS})
        if path == "/api/feeds/state":
            st = crg_feeds._read_json(os.path.join(FEEDS, "crg-feeds-state.json"), {})
            dg = crg_feeds._read_json(os.path.join(FEEDS, "feeds-digest.json"), None)
            return self._json(200, {"state": st, "latest": crg_feeds.latest_files(FEEDS), "digest": dg})
        if path == "/api/suggested":
            return self._json(200, crg_feeds._read_json(os.path.join(FEEDS, "suggested-sources.json"), {"sources": []}))
        if path in ("/api/discovery", "/api/outbox"):
            sub = "discovery" if path.endswith("discovery") else "registry-outbox"
            return self._json(200, {"folder": os.path.join(FEEDS, sub), "files": list_dir(sub)})
        m = re.match(r"^/api/(feeds/latest|discovery)/([A-Za-z0-9._-]+)$", path)
        if m:
            try:
                if m.group(1) == "discovery":
                    p = _safe_join(os.path.join(FEEDS, "discovery"), m.group(2))
                else:
                    lf = crg_feeds.latest_files(FEEDS).get(m.group(2))
                    if not lf:
                        return self._json(404, {"error": "no file for this source yet"})
                    p = _safe_join(FEEDS, lf["file"])
                with open(p, "rb") as fh:
                    data = fh.read()
            except Exception:                           # noqa: BLE001
                return self._json(404, {"error": "not found"})
            self.send_response(200)
            self.send_header("Content-Type", "application/octet-stream")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return
        m = re.match(r"^/api/files/([A-Za-z0-9._-]+)$", path)
        if m:
            name = m.group(1)
            p = os.path.join(FEEDS, name)
            if not os.path.isfile(p) or os.path.dirname(os.path.abspath(p)) != os.path.abspath(FEEDS):
                return self._json(404, {"error": "not found"})
            with open(p, "rb") as fh:
                data = fh.read()
            self.send_response(200)
            self.send_header("Content-Type", "application/octet-stream")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return
        return self._json(404, {"error": "unknown endpoint"})

    def _ai_state(self, cfg, keys):
        """What the Settings page needs to draw every provider: its label, protocol, where it sends,
        which endpoint and model are set, whether a key is stored, and what it still needs. No key
        value is ever included \u2014 only whether one exists."""
        provs = ai_providers(cfg)
        return {
            "providers": {k: {"label": v["label"], "local": bool(v.get("local")),
                              "protocol": v.get("protocol"), "custom": bool(v.get("custom")),
                              "needs": v.get("needs") or [], "note": v.get("note") or "",
                              "key_url": v.get("key_url") or "", "key_name": v.get("key"),
                              "base_default": v.get("base") or ""} for k, v in provs.items()},
            "keys": {k: bool(keys.get(v["key"])) for k, v in provs.items()},
            "bases": {k: _ai_base(cfg, k) for k in provs},
            "models": {k: _ai_model(cfg, k) for k in provs},
            "api_versions": {k: (cfg.get("ai") or {}).get(k + "_api_version") or "" for k in provs},
            # kept for 1.5.1-1.5.4 pages that read a single local endpoint
            "local_base": _ai_base(cfg, "local"),
        }

    def _ai_models(self, qs):
        provider = (qs.get("provider") or ["claude"])[0]
        if provider not in ai_providers(crg_feeds.load_config(FEEDS)):
            return self._json(400, {"error": "unknown provider"})
        try:
            return self._json(200, {"provider": provider, "models": ai_models(provider, crg_feeds.load_config(FEEDS))})
        except Exception as exc:                        # noqa: BLE001
            return self._json(502, {"error": str(exc)})

    def do_POST(self):
        if not self.path.startswith("/api/") or not self._guard():
            if not self.path.startswith("/api/"):
                self._json(404, {"error": "unknown endpoint"})
            return
        n = int(self.headers.get("Content-Length") or 0)
        try:
            body = json.loads(self.rfile.read(n) or b"{}")
        except Exception:                               # noqa: BLE001
            return self._json(400, {"error": "bad json"})
        path = urllib.parse.urlparse(self.path).path
        if path == "/api/quit":                         # 1.5.2 — Exit button: stop after answering
            self._json(200, {"ok": True, "message": "The helper is stopping."})
            threading.Thread(target=lambda: (time.sleep(0.4), HTTPD and HTTPD.shutdown()), daemon=True).start()
            return
        if path == "/api/download":
            try:
                job = start_job(body.get("source"), body.get("params") or {})
                return self._json(200, {"job": job})
            except Exception as exc:                    # noqa: BLE001
                return self._json(400, {"error": str(exc)})
        if path == "/api/config":
            try:
                cfg = crg_feeds.save_config(body.get("config") or {}, FEEDS)
                return self._json(200, {"config": cfg, "sources": crg_feeds.sources(cfg)})
            except Exception as exc:                    # noqa: BLE001
                return self._json(400, {"error": str(exc)})
        if path == "/api/ai":
            provider = body.get("provider") or "claude"
            cfg = crg_feeds.load_config(FEEDS)
            if provider not in ai_providers(cfg):
                return self._json(400, {"error": "unknown provider"})
            refused = ai_check_policy(provider, cfg, body)
            if refused:
                sys.stderr.write(f"helper: ai {provider} refused by policy\n")
                return self._json(403, {"error": refused})
            try:
                out = ai_complete(provider, cfg, body)
                sys.stderr.write(f"helper: ai {provider} {out.get('model')} "
                                 f"in={out['usage'].get('in')} out={out['usage'].get('out')}\n")
                return self._json(200, out)
            except Exception as exc:                    # noqa: BLE001
                return self._json(502, {"error": str(exc)})
        if path == "/api/ai/test":
            provider = body.get("provider") or "claude"
            cfg = crg_feeds.load_config(FEEDS)
            provs = ai_providers(cfg)
            if provider not in provs:
                return self._json(400, {"error": "unknown provider"})
            try:
                return self._json(200, ai_test(provider, cfg))
            except Exception as exc:                    # noqa: BLE001
                return self._json(200, {"ok": False, "provider": provider, "error": str(exc),
                                        "label": provs[provider]["label"]})
        if path == "/api/keys":
            try:
                return self._json(200, {"keys": crg_feeds.set_key(body.get("name"), body.get("value"), FEEDS)})
            except Exception as exc:                    # noqa: BLE001
                return self._json(400, {"error": str(exc)})
        if path == "/api/suggested/clear":
            crg_feeds._write_json(os.path.join(FEEDS, "suggested-sources.json"), {"schema": "crg-suggested-sources/1", "sources": [], "cleared": _now()})
            return self._json(200, {"ok": True})
        if path == "/api/publish":
            try:
                return self._json(200, publish(body.get("name"), body.get("content") or "", body.get("target") or "registry"))
            except Exception as exc:                    # noqa: BLE001
                return self._json(400, {"error": str(exc)})
        m = re.match(r"^/api/jobs/([a-f0-9]+)/cancel$", path)
        if m:
            ev = cancel_flags.get(m.group(1))
            if ev:
                ev.set()
            return self._json(200, {"ok": bool(ev)})
        m = re.match(r"^/api/jobs/([a-f0-9]+)/forget$", path)
        if m:
            with lock:
                jobs.pop(m.group(1), None); _save_manifest()
            return self._json(200, {"ok": True})
        return self._json(404, {"error": "unknown endpoint"})


class Server(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


HTTPD = None


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8099
    _load_manifest()
    install_task_files()
    global HTTPD
    httpd = HTTPD = Server(("127.0.0.1", port), Handler)
    print(f"Serving {ROOT}\n  at http://localhost:{port}/  (loopback only)\n"
          f"Download helper {VERSION}: files go to {FEEDS}\n"
          f"Leave this window open while you use the app or while downloads run. Control-C stops it.", flush=True)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        with lock:
            for j in jobs.values():
                if j.get("status") == "running":
                    j["status"] = "interrupted"; j["message"] = "The helper was stopped before this download finished. Restart it."
            _save_manifest()
        print("\nStopped.")


if __name__ == "__main__":
    main()
