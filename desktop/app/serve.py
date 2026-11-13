#!/usr/bin/env python3
# SPDX-License-Identifier: CC-BY-NC-4.0
# Copyright (c) 2026 Marc-André Léger
"""CyberRiskGuardian Desktop — local server and download helper (the version is VERSION below, checked by tools/version_check.py).

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
    (crg-config.json), optional API keys for unattended runs (1.9.0: macOS keychain, else ~/.cyberriskguardian), publishing of
    anonymized registry packages to a shared folder, and the asset-discovery drop folder.
  * It only ever fetches the fixed list of sources below and the feed sources in your accepted list. It is not a general proxy, it listens on
    loopback only, and its API refuses requests that do not come from the app itself.

Standard library only. Usage:  python3 serve.py [port]      (default 8099)
"""
from __future__ import annotations

import datetime as dt
import gzip
import hashlib
import hmac
import http.server
import io
import json
import os
import re
import secrets
import socket
import socketserver
import ssl
import subprocess
import sys
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import crg_feeds  # noqa: E402  (same folder)
import crgo_client  # noqa: E402  (1.5.7 — the ontology, reached as an MCP server)
import crg_signing  # noqa: E402  (1.9.2 — minisign verification of release downloads)
import crgo_local  # noqa: E402  (1.9.3 — ontology proposals in files when the CRGO server is not running)
try:                    # 1.7.0 — the Security Policy Writer engine (standard library only, crg_writer/)
    import crg_writer  # noqa: E402
    from crg_writer import api as writer_api  # noqa: E402
    WRITER_ERROR = ""
except Exception as _exc:                            # noqa: BLE001 — the rest of the helper keeps working
    crg_writer, writer_api, WRITER_ERROR = None, None, f"{type(_exc).__name__}: {_exc}"

VERSION = "1.9.3"
# 1.9.0 — a random token made at each start. The page reads it from /api/session (same origin only) and sends it
# with every /api/* call, next to X-CRG; the helper also checks Host and Origin. See Handler._guard.
TOKEN = secrets.token_urlsafe(32)
PORT = 8099
crgo_client.CLIENT_VERSION = VERSION
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

# Fixed source list. CRG_SOURCES_BASE (alias CRG_FEED_BASE) lets the test-suite point every source at a local mock
# server — loopback only (1.9.2, NV-091): any other host is ignored, so the variable can never redirect a real download.
def _sources_base():
    base = os.environ.get("CRG_SOURCES_BASE") or os.environ.get("CRG_FEED_BASE") or ""
    if not base:
        return None
    u = urllib.parse.urlsplit(base)
    host = (u.hostname or "").lower()
    if u.scheme != "http" or host not in ("127.0.0.1", "localhost", "::1"):
        sys.stderr.write(f"helper: CRG_SOURCES_BASE ignored — {base!r} is not plain http to this machine (loopback only)\n")
        return None
    return base.rstrip("/")


_BASE = _sources_base()
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


CREDENTIAL_HEADERS = {"authorization", "x-api-key", "api-key", "apikey", "auth-key", "x-otx-api-key"}


def _open(req, timeout):
    """urlopen, except that a request carrying a credential follows a redirect only to the same host (urllib
    would otherwise send the key header to wherever the server redirects) — 1.9.0."""
    creds = any(k.lower() in CREDENTIAL_HEADERS for k in req.headers) or any(
        k.lower() in CREDENTIAL_HEADERS for k in getattr(req, "unredirected_hdrs", {}))
    host = urllib.parse.urlsplit(req.full_url).hostname
    return urllib.request.build_opener(urllib.request.HTTPSHandler(context=_ctx()),
                                       crg_feeds.GuardedRedirect([host] if creds else None)).open(req, timeout=timeout)


def _fetch(url, headers=None, timeout=120):
    req = urllib.request.Request(url, headers={"User-Agent": UA, **(headers or {})})
    try:
        with _open(req, timeout) as r:
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
# Keys: macOS keychain or ~/.cyberriskguardian (crg_feeds, 1.9.0), never in crg-config.json and never in a log.
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
# Keys: macOS keychain or ~/.cyberriskguardian (crg_feeds, 1.9.0), never in crg-config.json and never in a log.
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

MAX_AI_BYTES = 400_000          # a workspace excerpt, not a database dump (system + prompt, measured in bytes — 1.9.2, NV-055)
MAX_AI_TOKENS = 64_000          # 1.9.2 (NV-055): the most output tokens one request may ask for
MODEL_ID = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._:/@-]{0,159}$")   # 1.9.2 (NV-055): a model name, not free text


class AiRequestTooLarge(ValueError):
    """1.9.2 (NV-055): answered 413, not 502."""

# 1.5.3 — routing policy, mirror of DEFAULT_POLICY in js/ai.js. The browser decides where a request should
# go; the helper checks the same policy before calling anything, so a feature set to "local only" (by
# default the vulnerability-linking task, which carries the organization's CVE list) can never reach
# api.anthropic.com, whatever a page asks for.
AI_DEFAULT_POLICY = {
    "remote_allowed": True, "web_search": True,
    # 1.9.2 (NV-019): the legacy tasks "chat" and "analyst" are gone — they reached a remote provider while every feature
    # of Settings → AI was set to local. tools/ai_policy_check.py fails the build when this map and js/ai.js FEATURES differ.
    "tasks": {"link_vulns": "local", "extract_profile": "workspace", "extract_crown": "workspace",
              "scenarios": "workspace", "critique": "workspace",
              "briefing": "workspace",
              "extract_sensitive": "local", "extract_more": "workspace", "simulation_pack": "workspace",
              "writer_facts": "workspace", "writer_tailor": "workspace",
              "causal_chain": "local", "isp_draft": "workspace", "compliance_assess": "workspace",
              "consultant": "local",
              # 1.9.0 - AI forecasting: both carry the CVE register or the treatment portfolio -> local by default
              "exploit_forecast": "local", "mitigation_optimizer": "local",
              # 1.9.2 (C5) - screening scores proposed for review (js/screenai.js)
              "screening_scores": "workspace"},
}
# 1.9.0 — the tasks the application sends. The policy is decided on the task, so the task is checked rather
# than trusted: it must be one of these, and the TASK line of the prompt must name the same one.
AI_TASK_PATTERN = re.compile(r"^(extract_[sm]_[a-z0-9_]{1,40}|test)$")
# 1.9.0 review L3 — the connectivity test carries this fixed prompt and nothing else: a "test" request with any other
# system or prompt text is refused, so the task cannot be used to send workspace text past its feature's routing.
AI_TEST_SYSTEM = "You are a connectivity test. Reply with exactly: OK"
AI_TEST_PROMPT = "TASK: test\nReply with exactly: OK"


def ai_task(body):
    """The task of a request, or raise ValueError: unknown, missing, or the body and the prompt disagree."""
    named = str(body.get("task") or "")
    m = re.match(r"\s*TASK:\s*([a-z0-9_]+)", str(body.get("prompt") or ""))
    in_prompt = m.group(1) if m else ""
    task = named or in_prompt
    if not task:
        raise ValueError("The request does not name its task, so the routing policy cannot be applied.")
    if named and in_prompt and named != in_prompt:
        raise ValueError(f"The request names the task '{named}' but its prompt is for '{in_prompt}'; it was refused.")
    if task not in AI_DEFAULT_POLICY["tasks"] and not AI_TASK_PATTERN.match(task):
        raise ValueError(f"Unknown AI task '{task[:40]}'; it was refused.")
    if task == "test" and (str(body.get("prompt") or "") != AI_TEST_PROMPT
                           or str(body.get("system") or AI_TEST_SYSTEM) != AI_TEST_SYSTEM or body.get("web_search")):
        raise ValueError("The 'test' task carries only the fixed connectivity prompt; this request was refused.")
    return task


def ai_policy(cfg):
    p = (cfg.get("ai") or {}).get("policy") or {}
    out = {**AI_DEFAULT_POLICY, **{k: v for k, v in p.items() if k != "tasks"}}
    out["tasks"] = {**AI_DEFAULT_POLICY["tasks"], **(p.get("tasks") or {})}
    return out


def ai_check_policy(provider, cfg, body):
    """Refuse a request the installation's policy does not allow. Returns an error string or ''."""
    try:
        task = ai_task(body)
    except ValueError as exc:
        return str(exc)
    pol = ai_policy(cfg)
    # 1.5.4 — the import-from-documents tasks share two features (sensitive → local by default)
    feature = "extract_sensitive" if task.startswith("extract_s_") else "extract_more" if task.startswith("extract_m_") else task
    # 1.9.0 review L3 — a feature missing from the policy map is treated as local, never as the workspace provider;
    # the fixed connectivity test (no workspace text) follows the workspace provider.
    mode = "workspace" if task == "test" else pol["tasks"].get(feature, "local")
    if mode == "off":
        return f"The feature '{task}' is switched off in Settings → AI — local & remote."
    # 1.5.5 — "remote" is every provider that is not on this machine, not the Claude API alone. The
    # check is on the provider's own `local` flag, so a new row in the registry is covered the day it
    # is added rather than the day someone remembers to extend this function.
    p = ai_providers(cfg).get(provider) or {}
    if p.get("local") and not _loopback_url(_ai_base(cfg, provider)):
        return (f"{p.get('label') or provider} is marked as running on this machine, but its endpoint "
                f"({urllib.parse.urlsplit(_ai_base(cfg, provider)).hostname or 'none'}) is not on this machine. "
                "Point it at 127.0.0.1 or localhost, or add the endpoint as a remote provider.")
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


_CONFIG_LOCK = threading.Lock()


def _record_test(provider, passed):
    """1.9.1 (B3) — the helper's record of connection tests (crg-config.json ai.tested, a date per provider): a passed
    test adds the provider, a failed one removes it, so an uninstalled server stops being the automatic default.
    A failure to record never turns a working connection into a failed test."""
    try:
        with _CONFIG_LOCK:
            fresh = crg_feeds.load_config(FEEDS)
            tested = fresh.setdefault("ai", {}).setdefault("tested", {})
            if passed:
                tested[provider] = dt.date.today().isoformat()
            elif provider in tested:
                del tested[provider]
            else:
                return
            crg_feeds.save_config(fresh, FEEDS)
    except Exception as exc:                            # noqa: BLE001
        sys.stderr.write(f"helper: the connection test of {provider} was not recorded: {exc}\n")


def ai_test(provider, cfg):
    """A minimal round trip to check a provider: no workspace data, a few tokens."""
    t0 = time.time()
    out = ai_complete(provider, cfg, {"system": AI_TEST_SYSTEM, "prompt": AI_TEST_PROMPT, "max_tokens": 16})
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


def _loopback_url(url):
    try:
        return (urllib.parse.urlsplit(url).hostname or "").lower() in ("127.0.0.1", "localhost", "::1")
    except ValueError:
        return False


def _key_hosts_for(pid, cfg):
    """Hosts the key of provider `pid` may go to: the registry's own host for a built-in provider, and the
    hosts recorded when the key was saved."""
    p = ai_providers(cfg).get(pid) or {}
    hosts = set(crg_feeds.key_hosts(p.get("key") or ""))
    if not p.get("custom") and p.get("base"):
        hosts.add(urllib.parse.urlsplit(p["base"]).hostname or "")
    return sorted(h for h in hosts if h)


def _ai_key(cfg, pid):
    """The stored key of a provider — only if the endpoint now set is a host the key was saved for (1.9.0).
    Changing the endpoint of a provider therefore never sends its key somewhere new: the person stores the
    key again for the new endpoint."""
    p = ai_providers(cfg).get(pid) or {}
    name = p.get("key") or ""
    keys = crg_feeds.load_keys(FEEDS)
    if name not in keys:
        return ""
    base = _ai_base(cfg, pid)
    hosts = _key_hosts_for(pid, cfg)
    if base and not crg_feeds.host_allowed(base, hosts):
        raise RuntimeError(f"The key of {p.get('label') or pid} was saved for {', '.join(hosts) or 'no endpoint'}, and the "
                           f"endpoint is now {urllib.parse.urlsplit(base).hostname}. Store the key again in Settings \u2192 AI "
                           "to use it with this endpoint; it is never sent to a new address on its own.")
    return keys.get(name, "")


def _key_hosts_at_save(name, cfg):
    """When a key is stored: the host of the endpoint its provider uses now, or the hosts of the feed sources
    that use it."""
    for pid, p in ai_providers(cfg).items():
        if p.get("key") == name:
            host = urllib.parse.urlsplit(_ai_base(cfg, pid)).hostname
            return [host] if host else []
    if name == "nvd":                                   # 1.9.2 (NV-058)
        return [urllib.parse.urlsplit(SOURCES["nvd"]).hostname or "services.nvd.nist.gov"]
    hosts = set()
    for src in crg_feeds.sources(cfg):
        if src.get("key") == name:
            hosts.update(src.get("domains") or [])
    return sorted(h for h in hosts if h)


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
    try:
        with _open(req, timeout) as r:
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
    key = _ai_key(cfg, provider)                       # raises when the endpoint moved away from the key's host — before any mock
    mock = os.environ.get("CRG_AI_MOCK")
    if mock:                                            # test suite only: "<mock>/models.json" is the endpoint's list
        try:
            with open(os.path.join(mock, "models.json"), encoding="utf-8") as fh:
                items = json.load(fh)
            return [{"id": m["id"], "name": m.get("name") or m["id"]} for m in items if isinstance(m, dict) and m.get("id")]
        except (OSError, ValueError):
            raise RuntimeError("The mock endpoint offers no model list.") from None
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


# 1.9.2 (NV-033 / X-9): the stop reason of every provider path, and what it means for the answer. A cut-off answer is
# returned with truncated=True (the page says so and may still salvage complete items); an answer with no text — an
# HTTP 200 with empty content, every token spent on reasoning — is an error, never a success.
TRUNCATED_MSG = "The answer was cut off; raise the limit or narrow the request."
EMPTY_MSG = "The model returned no text (the answer was empty); try again, raise the limit or choose another model."
STOP_TRUNCATED = {"max_tokens", "length", "max_output_tokens"}
# OpenAI-compatible reasoning models count their reasoning against `max_completion_tokens` and reject `max_tokens`;
# local servers and older endpoints know only `max_tokens`. Providers off this machine get the newer name first,
# providers on this machine the older one; a complaint about the name flips it once.
MAX_COMPLETION_FIRST = {"openai", "azure", "github"}


def _finish(text, stop, usage_out, max_tokens):
    """truncated / empty flags from the stop reason, the text and the usage."""
    stop = str(stop or "")
    text = text or ""
    truncated = stop in STOP_TRUNCATED or (usage_out is not None and max_tokens and int(usage_out) >= int(max_tokens))
    empty = not text.strip()
    return {"stop_reason": stop, "truncated": bool(truncated), "empty": bool(empty)}


def _check_request(body):
    """1.9.2 (NV-055): size (system + prompt, bytes), token budget and model name — before the mock branch too."""
    system = str(body.get("system") or "")
    prompt = str(body.get("prompt") or "")
    size = len(system.encode("utf-8")) + len(prompt.encode("utf-8"))
    if size > MAX_AI_BYTES:
        raise AiRequestTooLarge(f"The request is larger than the {MAX_AI_BYTES // 1000} kB limit for one call "
                                f"({size // 1000} kB with the instructions). Narrow what you are sending.")
    try:
        max_tokens = int(body.get("max_tokens") or 4000)
    except (TypeError, ValueError) as exc:
        raise ValueError("max_tokens must be a number.") from exc
    if max_tokens < 1:
        raise ValueError("max_tokens must be at least 1.")
    max_tokens = min(max_tokens, MAX_AI_TOKENS)
    model = body.get("model")
    if model is not None and model != "" and not (isinstance(model, str) and MODEL_ID.match(model)):
        raise ValueError("The model name is not valid: letters, digits and . _ : / @ - only, at most 160 characters.")
    return system, prompt, max_tokens, (model or "")


def ai_complete(provider, cfg, body):
    """One request to the chosen provider. Returns {text, model, provider, usage, stop_reason, truncated, empty}."""
    system, prompt, max_tokens, model_req = _check_request(body)
    mock = os.environ.get("CRG_AI_MOCK")
    if mock:                                            # test suite only: canned answers from a folder
        task = re.search(r"TASK:\s*([a-z_]+)", prompt)
        base_name = task.group(1) if task else "default"
        try:                                            # 1.5.7 - the suite checks what was actually sent; 1.9.2 (NV-084): the full payload
            with open(os.path.join(mock, "_last.json"), "w", encoding="utf-8") as fh:
                json.dump({"system": system, "prompt": prompt, "temperature": body.get("temperature"), "task": body.get("task"),
                           "model": model_req or _ai_model(cfg, provider) or "mock-model", "max_tokens": max_tokens,
                           "web_search": bool(body.get("web_search")), "provider": provider}, fh)
        except OSError:
            pass
        try:
            with open(os.path.join(mock, base_name + ".txt"), encoding="utf-8") as fh:
                text = fh.read()
        except OSError:
            text = "Mock answer."
        stop = "end_turn"
        try:                                            # 1.9.2 (NV-033): "<task>.stop" names the stop reason to simulate
            with open(os.path.join(mock, base_name + ".stop"), encoding="utf-8") as fh:
                stop = fh.read().strip() or stop
        except OSError:
            pass
        usage = {"in": len(prompt) // 4, "out": len(text) // 4}
        return {"text": text, "model": "mock-model", "provider": provider, "sources": [{"url": "https://example.org/source", "title": "Mock source"}] if body.get("web_search") else [],
                "usage": usage, **_finish(text, stop, usage["out"] if stop in STOP_TRUNCATED else None, max_tokens)}
    p = ai_provider(provider, cfg)
    key = _ai_key(cfg, provider)
    model = model_req or _ai_model(cfg, provider)
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
                "usage": {"in": usage.get("input_tokens"), "out": usage.get("output_tokens")},
                **_finish(text, out.get("stop_reason"), usage.get("output_tokens"), max_tokens)}

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
    first = "max_completion_tokens" if (provider in MAX_COMPLETION_FIRST and not p.get("local")) else "max_tokens"
    other = "max_tokens" if first == "max_completion_tokens" else "max_completion_tokens"
    payload = {"model": model, first: max_tokens, "messages": msgs}
    if temperature is not None:
        payload["temperature"] = temperature
    try:
        out = _post_json(url, payload, _ai_headers(p, key, cfg))
    except RuntimeError as exc:
        # The endpoint knows the other name for the token budget: retry once on exactly that complaint.
        if first in str(exc) or other in str(exc):
            payload.pop(first, None)
            payload[other] = max_tokens
            out = _post_json(url, payload, _ai_headers(p, key, cfg))
        else:
            raise
    choice = (out.get("choices") or [{}])[0]
    text = ((choice.get("message") or {}).get("content")) or choice.get("text") or ""
    if not isinstance(text, str):                       # some servers return content as a list of parts
        text = "".join(part.get("text", "") for part in text if isinstance(part, dict))
    usage = out.get("usage") or {}
    return {"text": text, "model": out.get("model") or model, "provider": provider,
            "usage": {"in": usage.get("prompt_tokens"), "out": usage.get("completion_tokens")},
            **_finish(text, choice.get("finish_reason"), usage.get("completion_tokens"), max_tokens)}


# ---------------------------------------------------------------- embeddings (1.9.0, Virtual consultant)
# The optional embedding path of the consultant's retrieval. LOCAL models only: the provider is read from
# this installation's configuration (ai.embed.provider / ai.embed.model, set in Settings -> AI), never from
# the page, and a provider whose registry row is not `local` is refused whatever the configuration says —
# remote providers never embed. Ollama is reached on its own /api/embeddings; any other local provider on
# the OpenAI-compatible {base}/embeddings.
MAX_EMBED_TEXTS = 128


def embed_config(cfg):
    e = (cfg.get("ai") or {}).get("embed") or {}
    return {"provider": str(e.get("provider") or ""), "model": str(e.get("model") or "")}


def ai_embed(cfg, texts):
    """Vectors for a batch of texts from the configured local embedding model: {model, provider, vectors}."""
    ec = embed_config(cfg)
    pid, model = ec["provider"], ec["model"]
    if not pid or not model:
        raise PermissionError("No local embedding model is configured. Set one in Settings \u2192 AI \u2192 Retrieval.")
    p = ai_providers(cfg).get(pid)
    if not p:
        raise PermissionError(f"Unknown provider '{pid}' for embeddings.")
    if not p.get("local"):
        raise PermissionError(f"Remote providers never embed: {p.get('label') or pid} is not on this machine. "
                              "Choose a local embedding model (Ollama or a local OpenAI-compatible endpoint).")
    if not isinstance(texts, list) or not texts or len(texts) > MAX_EMBED_TEXTS:
        raise ValueError(f"Send between 1 and {MAX_EMBED_TEXTS} texts per request.")
    texts = [str(t)[:8000] for t in texts]
    if sum(len(t.encode("utf-8")) for t in texts) > MAX_AI_BYTES:
        raise ValueError(f"The batch is larger than the {MAX_AI_BYTES // 1000} kB limit.")
    base = _ai_base(cfg, pid)
    host = urllib.parse.urlparse(base).hostname or ""
    if host not in ("127.0.0.1", "localhost", "::1"):
        raise PermissionError(f"The endpoint of {p.get('label') or pid} ({host or 'none'}) is not on this machine; "
                              "embeddings go to a loopback address only.")
    key = _ai_key(cfg, pid)
    if pid == "ollama":                          # Ollama's own endpoint: one prompt per call
        root = re.sub(r"/v1$", "", base)
        vecs = []
        for t in texts:
            out = _post_json(root + "/api/embeddings", {"model": model, "prompt": t}, _ai_headers(p, key, cfg), timeout=120)
            vecs.append(out.get("embedding") or [])
    else:                                        # OpenAI-compatible: one call per batch
        out = _post_json(base + "/embeddings", {"model": model, "input": texts}, _ai_headers(p, key, cfg), timeout=180)
        data = sorted(out.get("data") or [], key=lambda d: d.get("index", 0))
        vecs = [d.get("embedding") or [] for d in data]
    if len(vecs) != len(texts) or not all(isinstance(v, list) and v for v in vecs):
        raise RuntimeError("The embedding endpoint returned no vector for some texts.")
    return {"provider": pid, "model": model, "dims": len(vecs[0]), "vectors": vecs}


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
    # EPSS files are dated in UTC (score_date …+0000): derive "yesterday" in UTC, not local time
    date = params.get("date") or (dt.datetime.now(dt.timezone.utc).date() - dt.timedelta(days=1)).isoformat()
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
    # 1.9.2 (NV-058): the NVD API key lives in the key store (Settings → AI → keys, name "nvd"), bound to NVD's host;
    # it is read here and never kept in the browser. A key passed with the request (older pages) is still honoured.
    key = p.get("api_key") or ""
    if not key:
        try:
            keys = crg_feeds.load_keys(FEEDS)
            if "nvd" in keys and crg_feeds.host_allowed(SOURCES["nvd"], crg_feeds.key_hosts("nvd") or ["services.nvd.nist.gov"]):
                key = keys.get("nvd", "")
        except Exception as exc:                        # noqa: BLE001
            sys.stderr.write(f"helper: the NVD key could not be read: {exc}\n")
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


# ---------------------------------------------------------------- update check (1.8.0, opt-in)
# The only place the application asks whether a newer release exists. Off by default; the person switches it
# on (asked once at first start) or clicks "Check now". The request goes to one fixed URL — the GitHub
# releases list of the repository that publishes the desktop — with no query, no identifier and no
# workspace data; the User-Agent names the product only, not the version. A release is never installed: the
# person downloads the ZIP asset to the feeds folder and upgrades by hand (backup → new folder → restart).
UPDATE_REPO = "ITriskMgr/CyberRiskGuardian_ThreatIntel"
UPDATE_URL = os.environ.get("CRG_UPDATE_URL") or f"https://api.github.com/repos/{UPDATE_REPO}/releases?per_page=30"
# Only a release carrying the desktop ZIP counts; the same repository also publishes plugin releases.
DESKTOP_ASSET = re.compile(r"^CyberRiskGuardian_Desktop_v(\d+\.\d+\.\d+)[A-Za-z0-9._-]*\.zip$")
UPDATE_UA = "CyberRiskGuardian-Desktop-update-check"
# 1.9.2 (NV-086) — signed releases. When the author publishes a minisign public key, its text goes here (pinned in the
# build, like the release repository above); a release then carries "<zip name>.minisig" beside the ZIP and the download
# is kept only if that signature verifies (crg_signing.py). Empty: the SHA-256 check alone applies and the result says so.
# CRG_UPDATE_PUBKEY (a file path or the key text) overrides it for the test suite.
UPDATE_MINISIGN_PUBKEY = ""


def _update_pubkey():
    env = os.environ.get("CRG_UPDATE_PUBKEY") or ""
    if env and os.path.isfile(env):
        try:
            with open(env, encoding="utf-8") as fh:
                return fh.read()
        except OSError:
            return ""
    return env or UPDATE_MINISIGN_PUBKEY
UPDATE_DOWNLOAD_HOSTS = ("https://github.com/" + UPDATE_REPO + "/releases/download/",
                         "https://objects.githubusercontent.com/", "https://release-assets.githubusercontent.com/")
_update_cache = {}


def _vtuple(v):
    m = re.search(r"(\d+)\.(\d+)\.(\d+)", str(v or ""))
    return tuple(int(x) for x in m.groups()) if m else None


def update_check():
    """Ask GitHub for the latest release; return what the banner needs, or why it could not tell."""
    out = {"current": VERSION, "checked": _now(), "source": UPDATE_URL if os.environ.get("CRG_UPDATE_URL") else f"github.com/{UPDATE_REPO}/releases"}
    req = urllib.request.Request(UPDATE_URL, headers={"User-Agent": UPDATE_UA, "Accept": "application/vnd.github+json"})
    try:
        with urllib.request.urlopen(req, timeout=15, context=_ctx() if UPDATE_URL.startswith("https") else None) as r:
            data = json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        remaining = exc.headers.get("X-RateLimit-Remaining") if exc.headers else None
        if exc.code == 404:
            return {**out, "status": "none", "message": "No release has been published yet."}
        if exc.code == 429 or (exc.code == 403 and remaining == "0"):
            reset = exc.headers.get("X-RateLimit-Reset") if exc.headers else None
            when = dt.datetime.fromtimestamp(int(reset)).isoformat(timespec="minutes") if reset and reset.isdigit() else ""
            return {**out, "status": "rate-limited", "retry": when, "message": "GitHub limits how often it can be asked. Try again later."}
        return {**out, "status": "error", "code": exc.code, "message": "GitHub answered with an error."}
    except (urllib.error.URLError, OSError, TimeoutError) as exc:
        if "CERTIFICATE_VERIFY_FAILED" in str(exc):
            return {**out, "status": "error", "message": CERT_HINT}
        return {**out, "status": "offline", "message": "The release page could not be reached (no network, or the network blocks api.github.com)."}
    except ValueError:
        return {**out, "status": "error", "message": "The answer was not a release description."}
    releases = data if isinstance(data, list) else [data]
    releases = [r for r in releases if isinstance(r, dict) and not r.get("draft")]
    if not releases:
        return {**out, "status": "none", "message": "No release has been published yet."}
    best = None
    for rel in releases:
        for a in rel.get("assets") or []:
            m = DESKTOP_ASSET.match(str(a.get("name", "")))
            if m and (best is None or _vtuple(m.group(1)) > best[0]):
                best = (_vtuple(m.group(1)), rel, a)
    if not best:
        return {**out, "status": "none", "message": "No desktop release is available yet: the published releases have no ZIP file attached for the desktop."}
    latest, data, asset = best
    tag = data.get("tag_name") or ""
    res = {**out, "status": "ok", "latest": ".".join(map(str, latest)), "tag": tag, "name": data.get("name") or tag,
           "newer": latest > (_vtuple(VERSION) or (0, 0, 0)), "notes_url": data.get("html_url") or f"https://github.com/{UPDATE_REPO}/releases",
           "published": data.get("published_at") or "", "prerelease": bool(data.get("prerelease")),
           "asset": {"name": asset["name"], "size": asset.get("size")}}
    # 1.9.0 — the checksum convention: the release carries "<zip name>.sha256" beside the ZIP (the output of
    # `shasum -a 256 <zip>` or `sha256sum <zip>`). Without it the download is kept but marked unverified.
    sums = next((a for a in data.get("assets") or [] if str(a.get("name", "")) == asset["name"] + ".sha256"), None)
    res["asset"]["checksum"] = bool(sums)
    # 1.9.2 (NV-086): "<zip name>.minisig" beside the ZIP, checked against the pinned public key when there is one
    sig = next((a for a in data.get("assets") or [] if str(a.get("name", "")) == asset["name"] + ".minisig"), None)
    res["asset"]["signature"] = bool(sig)
    res["asset"]["signing_key"] = bool(_update_pubkey().strip())
    _update_cache.clear()
    if asset:
        _update_cache.update(name=asset["name"], url=asset.get("browser_download_url") or "", latest=res["latest"],
                             sha_url=(sums or {}).get("browser_download_url") or "", sig_url=(sig or {}).get("browser_download_url") or "")
    return res


def _update_url_ok(url):
    return url.startswith(UPDATE_DOWNLOAD_HOSTS) or bool(os.environ.get("CRG_UPDATE_URL") and url.startswith("http://127.0.0.1"))


def _update_get(url, timeout):
    req = urllib.request.Request(url, headers={"User-Agent": UPDATE_UA, "Accept": "application/octet-stream"})
    with urllib.request.urlopen(req, timeout=timeout, context=_ctx() if url.startswith("https") else None) as r:
        final = r.geturl()
        if not _update_url_ok(final):           # urllib follows redirects: the address it ended on is checked too
            raise RuntimeError("The download was redirected away from GitHub; nothing was kept.")
        return r.read()


def run_update(job, params, ev):
    """Download the release ZIP found by the last check into the feeds folder. Never unpacked, never run."""
    if not _update_cache.get("url"):
        raise RuntimeError("Check for updates first: no release asset is known.")
    url, name = _update_cache["url"], os.path.basename(_update_cache["name"])
    sha_url = _update_cache.get("sha_url") or ""
    sig_url = _update_cache.get("sig_url") or ""
    if not _update_url_ok(url) or (sha_url and not _update_url_ok(sha_url)) or (sig_url and not _update_url_ok(sig_url)):
        raise RuntimeError("The release asset is not on the expected GitHub address; nothing was downloaded.")
    if not SAFE.match(name) or not name.lower().endswith(".zip"):
        raise RuntimeError("Unexpected asset name.")
    _update(job, message=f"Downloading {name}…", progress=0.1)
    data = _update_get(url, 300)
    if ev.is_set():
        raise InterruptedError()
    digest = hashlib.sha256(data).hexdigest()
    verified = False
    if sha_url:
        _update(job, message="Checking the SHA-256 checksum published with the release…", progress=0.9)
        m = re.search(r"\b([0-9a-fA-F]{64})\b", _update_get(sha_url, 60).decode("utf-8", "replace"))
        if not m:
            raise RuntimeError("The checksum file of the release is not readable; the download was not kept.")
        if not hmac.compare_digest(m.group(1).lower(), digest):
            raise RuntimeError("The SHA-256 checksum of the download does not match the one published with the release; "
                               "the file was not kept. Download it again later, or from the release page.")
        verified = True
    # 1.9.2 (NV-086): the minisign signature, when the release carries one and a public key is pinned. An invalid
    # signature refuses the file; a missing key or signature is reported, never silently passed.
    sig_text = _update_get(sig_url, 60).decode("utf-8", "replace") if sig_url else ""
    if sig_url:
        _update(job, message="Checking the minisign signature published with the release…", progress=0.95)
    signature = crg_signing.check(data, sig_text, _update_pubkey())
    # 1.9.2 review (M6): with a pinned key, "no-signature" is a refusal too (an unsigned release never downgrades to SHA-256 only)
    if signature["status"] in ("invalid", "malformed", "no-signature"):
        raise RuntimeError(signature["detail"])
    path = _write(job, name, data)
    return name, {"records": len(data), "path": path, "version": _update_cache.get("latest"), "sha256": digest, "verified": verified,
                  "signature": signature["status"], "signature_detail": signature["detail"]}


RUNNERS = {"kev": run_kev, "epss": run_epss, "nvd": run_nvd, "feeds": run_feeds, "update": run_update}

SAFE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._ -]{0,120}$")


def _safe_join(base, *parts):
    p = os.path.abspath(os.path.join(base, *parts))
    if not p.startswith(os.path.abspath(base) + os.sep):
        raise ValueError("path outside folder")
    return p


# The file names the application itself produces (Publish & share, Risk Registry, briefings). Nothing else is written
# through /api/publish (1.9.2, NV-060): a configuration name or a project file can never be created or replaced here.
PUBLISH_PREFIXES = {"registry": ("crg-registry-", "crg-registry2-"), "briefing": ("briefing-", "triage-profile.json")}
PUBLISH_TARGETS = ("registry", "briefing")


def _app_made(path):
    """True when the existing file reads as one this application wrote: a JSON package with a crg-… schema or our generator,
    a Markdown report of ours, or a CSV of ours. Anything else is somebody else's file and is never overwritten."""
    try:
        with open(path, "r", encoding="utf-8", errors="replace") as fh:
            head = fh.read(4000)
    except OSError:
        return False
    if path.endswith(".json"):
        # 1.9.2 review (L4): a JSON file is ours only when it parses and its top-level "schema" is one of ours ("crg-…");
        # a mention of the product's name in somebody else's file is not a claim on it
        try:
            with open(path, "r", encoding="utf-8", errors="replace") as fh:
                doc = json.load(fh)
        except (OSError, ValueError):
            return False
        return isinstance(doc, dict) and isinstance(doc.get("schema"), str) and doc["schema"].startswith("crg-")
    if path.endswith(".md"):
        return head.lstrip().startswith(("# Risk registry", "# Registre des risques", "# Weekly threat briefing", "# Threat briefing", "# Briefing", "# Veille", "### Management summary", "### Sommaire", "# CyberRiskGuardian"))
    if path.endswith(".csv"):
        return head.startswith(("id,", "\ufeffid,", "cve,", "scenario", "risk"))
    return False


def publish(name, content, target):
    """Write a registry package to the shared registry folder or the outbox, or a briefing to the
    feeds folder. Registry packages are anonymized in the app before they get here.
    1.9.2 (NV-060): only the application's own name prefixes, only the known targets, and never over a file the
    application did not create."""
    if target not in PUBLISH_TARGETS:
        raise ValueError(f"unknown publish target {target!r} (registry or briefing)")
    if not SAFE.match(name or "") or not name.endswith((".json", ".md", ".csv")):
        raise ValueError("bad file name")
    if not name.startswith(PUBLISH_PREFIXES[target]):
        raise ValueError(f"the name {name!r} is not one this application publishes for {target} ({', '.join(PUBLISH_PREFIXES[target])}…)")
    cfg = crg_feeds.load_config(FEEDS)
    local = os.path.expanduser((cfg.get("links") or {}).get("registry_local_dir") or "")
    if target == "briefing":
        # Briefings are not registry packages: they stay in the feeds folder, where the scheduled task
        # can find them, and never in the outbox that gets uploaded to the shared registry.
        folder = os.path.join(FEEDS, "briefings")
    elif local:
        folder = registry_folder("shared")
    else:
        folder = os.path.join(FEEDS, "registry-outbox")
    os.makedirs(folder, exist_ok=True)
    path = _safe_join(folder, name)
    ours = _published_record()
    replaced = os.path.lexists(path)
    if replaced and (os.path.islink(path) or not os.path.isfile(path) or not (path in ours or _app_made(path))):
        raise ValueError(f"{name} exists in {folder} and was not created by this application: choose another name or remove it yourself")
    with open(path + ".part", "w", encoding="utf-8") as fh:
        fh.write(content)
    os.replace(path + ".part", path)
    ours[path] = {"sha256": hashlib.sha256(content.encode("utf-8")).hexdigest(), "written": _now(), "target": target}
    _published_save(ours)
    return {"path": path, "folder": folder, "outbox": folder.endswith("registry-outbox"), "replaced": replaced}


def _published_record():
    """The files this helper wrote through /api/publish (path → sha256, date, target): the record that lets it tell its own
    files from somebody else's when a name is reused. Kept in the feeds folder; a missing or unreadable record is empty."""
    try:
        with open(os.path.join(FEEDS, "published.json"), encoding="utf-8") as fh:
            d = json.load(fh)
        return d.get("files", {}) if isinstance(d, dict) and isinstance(d.get("files"), dict) else {}
    except (OSError, ValueError):
        return {}


def _published_save(files):
    try:
        crg_feeds._write_json(os.path.join(FEEDS, "published.json"), {"schema": "crg-published/1", "files": files})
    except OSError:
        pass


# ---------------- 1.5.8 — CRGO dss/v1: the organisation graph of a workspace ----------------

def org_root():
    """The organisation root: CRG_ORG_DIR, else links.org_graph_dir in crg-config.json, else ~/CyberRiskGuardian-confidential/crgo."""
    cfg = crg_feeds.load_config(FEEDS)
    root = os.environ.get("CRG_ORG_DIR") or (cfg.get("links") or {}).get("org_graph_dir") or os.path.join("~", "CyberRiskGuardian-confidential", "crgo")
    return os.path.abspath(os.path.expanduser(root))


def org_dir(ws_id):
    """Where a workspace's organisation graph lives: CRG_ORG_DIR, else links.org_graph_dir in crg-config.json,
    else ~/CyberRiskGuardian-confidential/crgo — one sub-folder per workspace. Never inside a git repository,
    the application folder or the ontology folder: these files describe a client and stay with its deliverables."""
    wid = re.sub(r"[^A-Za-z0-9_-]", "", str(ws_id or ""))
    if not wid:
        raise ValueError("No workspace identifier.")
    return _confidential(os.path.join(org_root(), wid))


def crgo_store(create=False):
    """1.9.3 — this installation's ontology store (library-proposal/v1 store_dir): <org root>/_installation/crgo-local/,
    with the organisation graphs' rules (never in the application, the ontology folder or a git repository). Installation
    level: workspace resets keep it. Created on demand (create=True); None when absent and not created."""
    d = _confidential(os.path.join(org_root(), "_installation", "crgo-local"))
    if create:
        os.makedirs(d, exist_ok=True)
    return d if os.path.isdir(d) else None


def _confidential(d):
    cfg = crg_feeds.load_config(FEEDS)
    home = crgo_client.home_of(crgo_client.resolve(cfg, ROOT)) or ""
    for forbidden in (ROOT, home):
        if forbidden and (d + os.sep).startswith(os.path.abspath(forbidden) + os.sep):
            raise ValueError("The organisation graph folder may not be inside the application or the ontology folder: %s" % d)
    probe = d
    while True:
        if os.path.isdir(os.path.join(probe, ".git")):
            raise ValueError("The organisation graph folder is inside a git repository (%s). Client data never goes into a repository: "
                             "choose another folder in Settings → Links & shared folders." % probe)
        parent = os.path.dirname(probe)
        if parent == probe:
            break
        probe = parent
    return d


def crgo_spec():
    cfg = crg_feeds.load_config(FEEDS)
    spec = crgo_client.resolve(cfg, ROOT)
    bad = crgo_client.check(spec)
    if bad:
        raise RuntimeError(bad)
    rel = crgo_client.release(crgo_client.home_of(spec))
    return spec, rel


# ---------------- 1.9.3 — ontology proposals (CRGO 0.11.2, contract library-proposal/v1) ----------------
PROPOSAL_OPS = {"propose": "crgo_propose_library_scenario", "list": "crgo_list_proposals", "approve": "crgo_approve_proposal",
                "reject": "crgo_reject_proposal", "export-contribution": "crgo_export_contribution"}
ADMIN_OPS = ("approve", "reject", "export-contribution")
NO_OUT_DIR = ("No folder for ontology proposals is set: choose one in Settings → Links & shared folders → "
              "Folder for ontology proposals. The contribution file is written there; nothing is sent anywhere.")


def proposals_dir_problem(path):
    """Why `path` may not be the Folder for ontology proposals ('' when it may): the shared-folder rules, and never
    inside the CRGO folder (REPOSITORY_PATH in CRGO's terms)."""
    d = os.path.expanduser(str(path or ""))
    if not os.path.isdir(d):
        return f"The folder for ontology proposals {path} does not exist on this computer."
    bad = registry_dir_problem(d)
    if bad:
        return bad.replace("The shared registry folder", "The folder for ontology proposals")
    home = crgo_client.home_of(crgo_client.resolve(crg_feeds.load_config(FEEDS), ROOT)) or ""
    real = os.path.realpath(d)
    if home and (real + os.sep).startswith(os.path.realpath(home) + os.sep):
        return "The folder for ontology proposals may not be inside the CRGO folder: contributions are files the CRGO project owner receives."
    return ""


def proposals_out_dir():
    d = ((crg_feeds.load_config(FEEDS).get("links") or {}).get("ontology_proposals_dir") or "").strip()
    if not d:
        return None, {"error": True, "code": "NO_FOLDER", "message": NO_OUT_DIR}
    bad = proposals_dir_problem(d)
    if bad:
        return None, {"error": True, "code": "REPOSITORY_PATH" if "CRGO folder" in bad else "INVALID_ARGUMENT", "message": bad}
    return os.path.realpath(os.path.expanduser(d)), None


def _grouping_spec():
    """(spec, None) when the CRGO server can run the library-proposal/v1 tools, else (None, why)."""
    try:
        spec, rel = crgo_spec()
    except Exception as exc:                            # noqa: BLE001
        return None, str(exc)
    if not rel.get("groupingUsable"):
        return None, rel.get("groupingProblem") or "CRGO v0.11.2 is needed."
    return spec, None


def crgo_proposals(op, body):
    """/api/crgo/proposals/<op>: the CRGO server's write tools with store_dir = this installation's store, or — when the
    server is not available — the same files written by crgo_local.py. Approve, reject and export are for an
    administrator (multi-user mode; with one person, that person). Returns (HTTP status, document)."""
    if op not in PROPOSAL_OPS and op != "read":
        return 404, {"error": True, "code": "UNKNOWN", "message": "unknown proposal operation"}
    who = body.get("user") or {}
    if op in ADMIN_OPS and who.get("multi") and not who.get("admin"):
        return 403, {"error": True, "code": "FORBIDDEN", "message": "Only an administrator can approve, reject or make public an ontology proposal."}
    try:
        store = crgo_store(create=op in ("propose", "approve", "reject", "export-contribution"))
    except ValueError as exc:
        return 200, {"error": True, "code": "INVALID_ARGUMENT", "message": str(exc)}
    if store is None:                                   # nothing proposed yet on this installation
        if op == "list":
            return 200, {"proposals": [], "count": 0, "via": "files"}
        return 200, {"error": True, "code": "UNKNOWN_ID", "message": "unknown proposal: %s" % body.get("proposal_id"), "via": "files"}
    if op == "read":                                    # the whole document, for the preview (files only; same on both paths)
        try:
            return 200, crgo_local.read_proposal(store, body.get("proposal_id"))
        except crgo_local.ProposalError as e:
            return 200, e.document()
    approver = str(body.get("approver") or who.get("name") or "").strip()
    args = {"store_dir": store}
    if op == "propose":
        args["proposal"] = body.get("proposal")
    elif op == "list":
        args["status"] = str(body.get("status") or "")
    else:
        args["proposal_id"] = str(body.get("proposal_id") or "")
        if op in ("approve", "reject"):
            args.update(approver=approver, date=str(body.get("date") or ""))
        if op == "reject":
            args["reason"] = body.get("reason") or ""
        if op == "export-contribution":
            out, err = proposals_out_dir()
            if err:
                return 200, err
            args.update(out_dir=out, action=str(body.get("action") or "add"), date=str(body.get("date") or ""),
                        tool="CyberRiskGuardian Desktop %s" % VERSION)
    spec, why = _grouping_spec()
    if spec is not None:
        try:
            res = crgo_client.CLIENT.call(spec, PROPOSAL_OPS[op], args, contract=True)
            if isinstance(res, dict):
                return 200, {**res, "via": "mcp"}
        except Exception as exc:                        # noqa: BLE001 — server unavailable: the same files, written here
            why = str(exc)
    fn = {"propose": lambda: crgo_local.propose(args["proposal"], store),
          "list": lambda: crgo_local.list_proposals(store, args["status"]),
          "approve": lambda: crgo_local.approve(store, args["proposal_id"], args["approver"], args["date"]),
          "reject": lambda: crgo_local.reject(store, args["proposal_id"], args["approver"], args["date"], args["reason"]),
          "export-contribution": lambda: crgo_local.export_contribution(store, args["proposal_id"], args["out_dir"], args["action"],
                                                                        args["date"], args["tool"])}[op]
    try:
        res = fn()
    except crgo_local.ProposalError as e:
        res = e.document()
    except (ValueError, TypeError, KeyError) as e:
        res = {"error": True, "code": "INVALID_ARGUMENT", "message": "%s: %s" % (type(e).__name__, str(e)[:300])}
    return 200, {**res, "via": "files", "why": why}


def crgo_local_extension():
    """This installation's approved additions (approved/crgo-local-extension.json), for the browser's offline port."""
    try:
        store = crgo_store()
    except ValueError as exc:
        return {"schema": "crgo-local-extension/1", "scenarios": [], "problem": str(exc)}
    path = os.path.join(store, crgo_local.EXTENSION) if store else None
    if not path or not os.path.isfile(path):
        return {"schema": "crgo-local-extension/1", "scenarios": [], "present": False}
    with open(path, encoding="utf-8") as fh:
        doc = json.load(fh)
    return {**doc, "present": True}


def crgo_bridge(op, req):
    """Run crgo_bridge.py with the interpreter of the ontology server (it needs rdflib and CRGO's own code)."""
    spec, rel = crgo_spec()
    if not rel.get("contractUsable"):
        return {"error": True, "code": "CRGO_TOO_OLD", "message": rel.get("contractProblem")}
    req = dict(req, crgo=crgo_client.home_of(spec))
    cp = subprocess.run([os.path.expanduser(spec["command"]), os.path.join(ROOT, "crgo_bridge.py"), op], input=json.dumps(req).encode("utf-8"),
                        capture_output=True, timeout=300)
    try:
        out = json.loads(cp.stdout.decode("utf-8"))
    except ValueError:
        return {"error": True, "code": "BRIDGE_FAILED", "message": (cp.stderr.decode("utf-8", "replace")[-600:] or "No answer from the bridge.")}
    out["release"] = rel
    return out


def crgo_contract(op, body):
    """graph · applicability · context · submit. Every refusal comes back as {error, code, message} for the analyst."""
    wid = body.get("ws")
    d = org_dir(wid)
    if op in ("graph", "applicability"):
        return crgo_bridge(op, {"dir": d, "base": body.get("base"), "label": body.get("label"), "assessment": body.get("assessment"),
                                "facts": body.get("facts") or {}, "date": body.get("date")})
    files = [os.path.join(d, f) for f in ("org.ttl", "orgfacts.ttl") if os.path.isfile(os.path.join(d, f))]
    if not files:
        return {"error": True, "code": "NO_GRAPH", "message": "Build the organisation graph first (Ontology · CRGO → Organisation link)."}
    spec, rel = crgo_spec()
    if not rel.get("contractUsable"):
        return {"error": True, "code": "CRGO_TOO_OLD", "message": rel.get("contractProblem")}
    if op == "context":
        out = crgo_client.CLIENT.call(spec, "crgo_risk_context", {"org_graph_files": files, "organization": body.get("organization"),
                                                                   "scenario": body.get("scenario"), "as_of": body.get("as_of")}, contract=True)
        return {"document": out, "release": rel}
    if op == "submit":
        doc = body.get("document") or {}
        # the helper's own checks come first: a write-back is a proposal, never an approval
        if doc.get("status") != "proposed":
            return {"error": True, "code": "STATUS_NOT_PROPOSED", "message": "A write-back must have the status \"proposed\": approval, risk acceptance and funding are human decisions recorded separately."}
        if re.fullmatch(r"\s*([Tt][Bb][Dd]|[Uu][Nn][Kk][Nn][Oo][Ww][Nn]|[Nn]/?[Aa]|[Tt][Oo][Dd][Oo]|-|\?)?\s*", str(doc.get("modelVersion") or "")):
            return {"error": True, "code": "MODEL_VERSION_MISSING", "message": "The model version actually used is required (placeholders such as TBD are refused)."}
        out = crgo_client.CLIENT.call(spec, "crgo_submit_assessment", {"document": doc, "org_graph_files": files}, contract=True)
        if isinstance(out, dict) and out.get("stored"):
            with open(os.path.join(d, "write-backs.jsonl"), "a", encoding="utf-8") as fh:
                fh.write(json.dumps({"at": _now(), "stored": out["stored"], "document": doc}, ensure_ascii=False) + "\n")
        return {"result": out, "release": rel}
    if op in ("compliance", "secops"):
        # 1.6.0 — read contracts compliance/v1 and secops/v1 (CRGO v0.10.0) over the workspace's own graph files.
        # CRGO's answer (or refusal: UNKNOWN_ORGANISATION, REFERENCE_NAMESPACE, SCHEMA_INVALID) is returned as it came; nothing is retried.
        if not rel.get("viewsUsable"):
            return {"error": True, "code": "CRGO_TOO_OLD", "message": rel.get("viewsProblem") or "This view needs CRGO v0.10.0."}
        org = body.get("organization") or graph_organization(d)
        if not org:
            return {"error": True, "code": "NO_GRAPH", "message": "The organisation graph does not declare its base: rebuild it (Ontology · CRGO → Organisation link)."}
        tool = "crgo_compliance_context" if op == "compliance" else "crgo_secops_context"
        out = crgo_client.CLIENT.call(spec, tool, {"org_graph_files": files, "organization": org, "as_of": str(body.get("as_of") or "")}, contract=True)
        return out if isinstance(out, dict) and out.get("error") else {"document": out, "release": rel}
    return {"error": True, "code": "UNKNOWN_OPERATION", "message": op}


def graph_organization(d):
    """The organisation IRI of a workspace graph: <base>org, the base being the one org.ttl declares (vann:preferredNamespaceUri)."""
    try:
        with open(os.path.join(d, "org.ttl"), encoding="utf-8") as fh:
            m = re.search(r'preferredNamespaceUri\s+"([^"]+)"', fh.read())
    except OSError:
        return None
    return (m.group(1) + "org") if m else None


def registry_folder(where):
    """The shared registry folder (a synced Drive/OneDrive folder set in Settings) or the outbox."""
    if where == "outbox":
        return os.path.join(FEEDS, "registry-outbox")
    cfg = crg_feeds.load_config(FEEDS)
    local = os.path.expanduser((cfg.get("links") or {}).get("registry_local_dir") or "")
    if not local or not os.path.isdir(local):
        raise ValueError("no shared registry folder is set, or it is not reachable on this computer")
    bad = registry_dir_problem(local)
    if bad:
        raise ValueError(bad)
    return local


# 1.9.0 — the shared registry folder receives files the application writes. It must be an ordinary data folder:
# never a configuration folder (a file written there could configure another program — an MCP server in
# claude_desktop_config.json, for example), never the home folder itself, the application or a system folder.
CONFIG_MARKERS = ("claude_desktop_config.json", ".mcp.json", "settings.json", "settings.local.json", "config.json",
                  "authorized_keys", "known_hosts", ".bashrc", ".zshrc", ".profile", "crg-config.json", "keys-index.json")


def registry_dir_problem(path):
    """Why `path` may not be the shared registry folder, or '' when it may."""
    d = os.path.realpath(os.path.abspath(os.path.expanduser(str(path or ""))))
    home = os.path.realpath(os.path.expanduser("~"))
    parts = [p for p in os.path.relpath(d, home).split(os.sep)] if (d + os.sep).startswith(home + os.sep) else None
    why = "The shared registry folder must be an ordinary data folder (a synced Drive or OneDrive folder, for example)"
    if d in (home, os.path.realpath(os.sep)) or os.path.dirname(d) == d:
        return why + ", not the home folder or the root of a disk."
    for forbidden in (ROOT, FEEDS, crg_feeds.keys_dir()):
        f = os.path.realpath(forbidden)
        if (d + os.sep).startswith(f + os.sep):
            return why + ", outside the application, the feeds folder and the key folder."
    system = ("/etc", "/usr", "/bin", "/sbin", "/lib", "/opt", "/var", "/private", "/System", "/Library", "/Applications",
              "/boot", "/dev", "/proc", "/sys", "/root")
    if os.name == "nt":
        win = os.environ.get("SystemRoot", r"C:\Windows").lower()
        if d.lower().startswith((win, os.environ.get("ProgramFiles", r"C:\Program Files").lower(),
                                 os.environ.get("ProgramData", r"C:\ProgramData").lower())):
            return why + ", not a system folder."
    elif parts is None and any(d == p or d.startswith(p + "/") for p in system):
        return why + ", not a system folder."
    if parts is not None:
        if any(p.startswith(".") for p in parts):
            return why + ", not a hidden or configuration folder."
        if parts[0] in ("Library", "AppData") and not (len(parts) > 1 and parts[1] in ("CloudStorage", "Mobile Documents")):
            return why + ", not a folder of application settings."
    try:
        present = [f for f in CONFIG_MARKERS if os.path.exists(os.path.join(d, f))]
    except OSError:
        present = []
    if present:
        return why + f": this folder holds configuration files ({', '.join(present[:3])})."
    return ""


def validate_config(new, old):
    """Refuse a configuration that would let a caller start a program or write into a configuration folder.
    The same checks run again where the value is used (crgo_client.check, registry_folder)."""
    o = new.get("ontology") or {}
    if (o.get("command") or o.get("args")) and (o.get("command"), o.get("args")) != ((old.get("ontology") or {}).get("command"), (old.get("ontology") or {}).get("args")):
        bad = crgo_client.settings_problem(o.get("command"), o.get("args"))
        if bad:
            raise ValueError(bad)
    d = (new.get("links") or {}).get("registry_local_dir") or ""
    if d and d != ((old.get("links") or {}).get("registry_local_dir") or ""):
        if not os.path.isdir(os.path.expanduser(d)):
            raise ValueError(f"The shared registry folder {d} does not exist on this computer.")
        bad = registry_dir_problem(d)
        if bad:
            raise ValueError(bad)
    # 1.9.2 (NV-059): the organisation-graph folder receives files the application writes too — the same rule applies
    g = (new.get("links") or {}).get("org_graph_dir") or ""
    if g and g != ((old.get("links") or {}).get("org_graph_dir") or ""):
        bad = registry_dir_problem(g)
        if bad:
            raise ValueError(bad.replace("The shared registry folder", "The organisation-graph folder"))
    # 1.9.3 — the Folder for ontology proposals (contribution files): the same rule, and never inside the CRGO folder
    p = (new.get("links") or {}).get("ontology_proposals_dir") or ""
    if p and p != ((old.get("links") or {}).get("ontology_proposals_dir") or ""):
        bad = proposals_dir_problem(p)
        if bad:
            raise ValueError(bad)


def registry_files():
    """Registry packages (JSON) visible to this computer, newest first (1.5.7)."""
    out = {"shared": None, "files": []}
    for where in ("shared", "outbox"):
        try:
            folder = registry_folder(where)
        except ValueError:
            continue
        if where == "shared":
            out["shared"] = folder
        if not os.path.isdir(folder):
            continue
        for f in os.listdir(folder):
            p = os.path.join(folder, f)
            if f.endswith(".json") and not f.startswith(".") and os.path.isfile(p) and SAFE.match(f):
                out["files"].append({"where": where, "name": f, "bytes": os.path.getsize(p),
                                     "modified": dt.datetime.fromtimestamp(os.path.getmtime(p)).isoformat(timespec="seconds")})
    out["files"].sort(key=lambda x: x["modified"], reverse=True)
    return out


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
                    message=f"Saved {name} in {FEEDS}" if source == "update" else f"Saved {name} in Downloads/CyberRiskGuardian-feeds",
                    **{k: v for k, v in info.items() if k in ("records", "score_date", "catalog_version", "path", "version", "sha256", "verified", "signature", "signature_detail")})
        except InterruptedError:
            _update(job, status="cancelled", message="Cancelled.", finished=_now())
        except Exception as exc:                        # noqa: BLE001
            _update(job, status="error", message=str(exc)[:500], finished=_now())

    threading.Thread(target=work, daemon=True).start()
    return job


SNAP_NAME = re.compile(r"^threat-context-(\d{4}-\d{2}-\d{2})\.json$")
EPSS_SERIES_MAX_FILES = 120


def epss_series(cves):
    """1.9.0 - the EPSS history of the registered CVEs, read from the dated threat-context-YYYY-MM-DD.json
    snapshots kept in the feeds folder. Local only: nothing is fetched, nothing about the CVEs leaves the
    machine. The history is only as long as the snapshots that were kept."""
    want = sorted({str(c).upper() for c in (cves or []) if re.match(r"^CVE-\d{4}-\d{4,}$", str(c), re.I)})[:2000]
    files = sorted((m.group(1), f) for f in os.listdir(FEEDS) if (m := SNAP_NAME.match(f)))[-EPSS_SERIES_MAX_FILES:]
    series = {c: [] for c in want}
    used = []
    for date, f in files:
        try:
            with open(os.path.join(FEEDS, f), encoding="utf-8") as fh:
                snap = json.load(fh)
        except Exception:                               # noqa: BLE001 - a damaged file is skipped and named
            used.append({"file": f, "date": date, "error": "unreadable"})
            continue
        scores = (snap.get("epss") or {}).get("scores") or {}
        kev = (snap.get("kev") or {}).get("cves") or {}
        sdate = (snap.get("epss") or {}).get("score_date") or snap.get("retrieved") or date
        used.append({"file": f, "date": date, "score_date": sdate, "pruned_below": (snap.get("thresholds") or {}).get("epss_pruned_below")})
        for c in want:
            e = scores.get(c)
            series[c].append({"date": sdate, "epss": e[0] if e else None, "pct": e[1] if e else None, "kev": c in kev})
    return {"files": used, "series": series, "feeds_dir": FEEDS}


def list_files():
    out = []
    for f in sorted(os.listdir(FEEDS)):
        p = os.path.join(FEEDS, f)
        if (f.startswith(".") or f.endswith((".part", ".tmp")) or f in ("manifest.json", "feeds-digest.json", "suggested-sources.json", "published.json")
                or f.startswith("crg-") or not os.path.isfile(p)):            # 1.4.0 settings and feed state are not catalogue files
            continue
        kind = "kev" if f.startswith("kev") or f.startswith("known_exploited") else "epss" if f.startswith("epss") else "nvd" if f.startswith("nvd") else "release" if f.lower().endswith(".zip") else "other"
        st = os.stat(p)
        out.append({"name": f, "kind": kind, "bytes": st.st_size, "modified": dt.datetime.fromtimestamp(st.st_mtime).isoformat(timespec="seconds")})
    return out


# ---------------------------------------------------------------- HTTP
class Handler(http.server.SimpleHTTPRequestHandler):
    # 1.9.0 — the bundled fonts: a fixed type, whatever the system's MIME table says (Windows reads it from the registry)
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map, ".woff2": "font/woff2"}
    # 1.9.2 (NV-043): a connection that sends nothing for 30 s is closed — half-open connections and a declared body that
    # never arrives no longer hold a thread for good (the AI call itself has its own, longer timeout on the outbound side)
    timeout = 30

    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def log_message(self, fmt, *args):                  # quieter console: API calls only
        if self.path.startswith("/api/") and "/api/jobs" not in self.path:
            sys.stderr.write("helper: " + (fmt % args) + "\n")

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        # 1.9.0 — every answer: no sniffing, no framing, no referrer. The full Content-Security-Policy is the
        # <meta> of each page (it also applies offline); this header only adds what a meta tag cannot carry.
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("Content-Security-Policy", "frame-ancestors 'none'; object-src 'none'; base-uri 'none'")
        super().end_headers()

    def list_directory(self, path):                    # 1.9.0 — no directory listings
        self.send_error(404, "Not found")
        return None

    def _json(self, code, obj):
        body = json.dumps(obj).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _host_ok(self):
        """The Host header names this server on loopback (a DNS-rebinding page sends its own name)."""
        return (self.headers.get("Host") or "").lower() in (f"127.0.0.1:{PORT}", f"localhost:{PORT}")

    def _guard(self, token=True):
        """Only the app may use the API (1.9.0):
          * Host is 127.0.0.1:PORT or localhost:PORT;
          * X-CRG: 1 — a foreign page cannot add it without a CORS preflight, which this server never approves;
          * Origin, when the browser sends one, is this server, and Sec-Fetch-Site, when sent, is same-origin;
          * X-CRG-Token is the token made at this start (compared in constant time). The page reads it from
            /api/session, which only the same origin can read."""
        origin = self.headers.get("Origin")
        site = self.headers.get("Sec-Fetch-Site")
        if (self.headers.get("X-CRG") != "1" or not self._host_ok()
                or (origin is not None and origin not in (f"http://127.0.0.1:{PORT}", f"http://localhost:{PORT}"))
                or (site is not None and site != "same-origin")):
            self._json(403, {"error": "forbidden", "code": "ORIGIN"}); return False
        if token and not hmac.compare_digest(str(self.headers.get("X-CRG-Token") or ""), TOKEN):
            self._json(403, {"error": "The helper was restarted or the request did not come from the application.", "code": "TOKEN"})
            return False
        return True

    def do_OPTIONS(self):                               # never approve cross-origin preflights
        self.send_response(403); self.end_headers()

    def do_HEAD(self):
        if self.path.startswith("/api/") or not self._host_ok():
            self.send_response(403); self.end_headers(); return None
        return super().do_HEAD()

    def do_GET(self):
        if not self.path.startswith("/api/"):
            if not self._host_ok():                     # 1.9.0 — DNS rebinding cannot read the application's files
                self.send_error(403, "Forbidden")
                return None
            return super().do_GET()
        path = urllib.parse.urlparse(self.path).path
        if path == "/api/session":                      # 1.9.0 — the per-launch token, for the same origin only
            if self._guard(token=False):
                self._json(200, {"token": TOKEN})
            return None
        if not self._guard():
            return
        if path == "/api/ai/models":
            return self._ai_models(urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query))
        if path == "/api/helper":
            keys = crg_feeds.load_keys(FEEDS)
            cfg = crg_feeds.load_config(FEEDS)
            return self._json(200, {"helper": VERSION, "feeds_dir": FEEDS, "sources": list(RUNNERS), "feeds": True,
                                    "ai": self._ai_state(cfg, keys),
                                    "writer": crg_writer.VERSION if crg_writer else None, "writer_error": WRITER_ERROR})
        if path == "/api/writer/meta":                  # 1.7.0 — the Security Policy Writer
            if not writer_api:
                return self._json(503, {"error": "The Security Policy Writer engine could not be loaded: " + WRITER_ERROR})
            code, out = writer_api.handle("meta", {})
            return self._json(code, out)
        if path == "/api/update/check":                 # 1.8.0 — opt-in update check (fixed URL, nothing sent)
            return self._json(200, update_check())
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
        if path == "/api/registry":                     # 1.5.7 — packages in the shared registry folder and the outbox
            return self._json(200, registry_files())
        m = re.match(r"^/api/registry/(shared|outbox)/([^/]+)$", path)
        if m:
            try:
                name = urllib.parse.unquote(m.group(2))
                if not SAFE.match(name) or not name.endswith(".json"):
                    raise ValueError("bad file name")
                folder = registry_folder(m.group(1))
                with open(_safe_join(folder, name), encoding="utf-8") as fh:
                    return self._json(200, {"name": name, "content": json.load(fh)})
            except Exception as exc:                    # noqa: BLE001
                return self._json(404, {"error": str(exc)})
        if path == "/api/crgo/local-extension":         # 1.9.3 — approved ontology additions, for the offline port
            return self._json(200, crgo_local_extension())
        if path == "/api/crgo/status":                  # 1.5.7 — where the ontology server is, and whether it runs
            return self._json(200, crgo_client.status(crg_feeds.load_config(FEEDS), ROOT))
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
            # 1.9.2 (NV-057): only the catalogue files list_files() shows are served — never crg-* settings, state or a key file
            if name not in {f["name"] for f in list_files()} or not os.path.isfile(p) or os.path.dirname(os.path.abspath(p)) != os.path.abspath(FEEDS):
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
            "keys": {k: v["key"] in keys for k, v in provs.items()},
            # 1.9.0 — a stored key is sent only to the hosts it was saved for; Settings says when the endpoint moved
            "key_hosts": {k: _key_hosts_for(k, cfg) for k, v in provs.items() if v["key"] in keys},
            "key_mismatch": {k: bool(_ai_base(cfg, k)) and not crg_feeds.host_allowed(_ai_base(cfg, k), _key_hosts_for(k, cfg))
                             for k, v in provs.items() if v["key"] in keys},
            "key_storage": crg_feeds.key_storage(),
            "bases": {k: _ai_base(cfg, k) for k in provs},
            "models": {k: _ai_model(cfg, k) for k in provs},
            "api_versions": {k: (cfg.get("ai") or {}).get(k + "_api_version") or "" for k in provs},
            # kept for 1.5.1-1.5.4 pages that read a single local endpoint
            "local_base": _ai_base(cfg, "local"),
            "embed": embed_config(cfg),
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
        # 1.9.2 (NV-043): a non-numeric or negative Content-Length is a bad request, not an exception or a read to EOF
        try:
            n = int(self.headers.get("Content-Length") or 0)
        except (TypeError, ValueError):
            return self._json(400, {"error": "bad Content-Length"})
        if n < 0:
            return self._json(400, {"error": "bad Content-Length"})
        if n > 100 * 1024 * 1024:
            return self._json(413, {"error": "request too large"})
        try:
            raw = self.rfile.read(n) if n else b""
        except (socket.timeout, TimeoutError, OSError):
            return self._json(408, {"error": "the request body did not arrive in time"})
        try:
            body = json.loads(raw or b"{}")
        except Exception:                               # noqa: BLE001
            return self._json(400, {"error": "bad json"})
        if not isinstance(body, dict):
            return self._json(400, {"error": "bad json"})
        path = urllib.parse.urlparse(self.path).path
        if path == "/api/quit":                         # 1.5.2 — Exit button: stop after answering
            self._json(200, {"ok": True, "message": "The helper is stopping."})
            threading.Thread(target=lambda: (time.sleep(0.4), HTTPD and HTTPD.shutdown()), daemon=True).start()
            return
        m = re.match(r"^/api/writer/([a-z_]{2,40})$", path)
        if m:                                           # 1.7.0 — Security Policy Writer: stateless, local only
            if not writer_api:
                return self._json(503, {"error": "The Security Policy Writer engine could not be loaded: " + WRITER_ERROR})
            code, out = writer_api.handle(m.group(1), body)
            if code != 200:
                sys.stderr.write(f"helper: writer {m.group(1)} → {code}\n")
            return self._json(code, out)
        if path == "/api/epss/series":                  # 1.9.0 - exploitation forecast: local EPSS history
            try:
                return self._json(200, epss_series(body.get("cves") or []))
            except Exception as exc:                    # noqa: BLE001
                return self._json(400, {"error": str(exc)})
        if path == "/api/download":
            try:
                job = start_job(body.get("source"), body.get("params") or {})
                return self._json(200, {"job": job})
            except Exception as exc:                    # noqa: BLE001
                return self._json(400, {"error": str(exc)})
        if path == "/api/config":
            try:
                old_cfg = crg_feeds.load_config(FEEDS)
                validate_config(body.get("config") or {}, old_cfg)
                new_cfg = body.get("config") or {}
                # 1.9.1 (B3): ai.tested is written by the helper only (connection tests); a page never drops or forges it
                if not isinstance(new_cfg.get("ai"), dict):
                    new_cfg["ai"] = dict(old_cfg.get("ai") or {}) if "ai" not in new_cfg else {}
                new_cfg["ai"]["tested"] = (old_cfg.get("ai") or {}).get("tested") or {}
                with _CONFIG_LOCK:
                    cfg = crg_feeds.save_config(new_cfg, FEEDS)
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
                sys.stderr.write(f"helper: ai {provider} refused by policy: {refused[:160]}\n")
                return self._json(403, {"error": refused})
            try:
                out = ai_complete(provider, cfg, body)
                sys.stderr.write(f"helper: ai {provider} {out.get('model')} "
                                 f"in={out['usage'].get('in')} out={out['usage'].get('out')} stop={out.get('stop_reason') or '-'}"
                                 f"{' TRUNCATED' if out.get('truncated') else ''}{' EMPTY' if out.get('empty') else ''}\n")
                if out.get("empty"):                    # 1.9.2 (NV-033): no text is an error, whatever the HTTP status was
                    return self._json(502, {"error": EMPTY_MSG + (f" (stop reason: {out['stop_reason']})" if out.get("stop_reason") else ""),
                                            "empty": True, "stop_reason": out.get("stop_reason"), "usage": out.get("usage"), "model": out.get("model")})
                if out.get("truncated"):
                    out["warning"] = TRUNCATED_MSG
                return self._json(200, out)
            except AiRequestTooLarge as exc:            # 1.9.2 (NV-055)
                return self._json(413, {"error": str(exc)})
            except ValueError as exc:
                return self._json(400, {"error": str(exc)})
            except Exception as exc:                    # noqa: BLE001
                return self._json(502, {"error": str(exc)})
        if path == "/api/embed":                       # 1.9.0 — Virtual consultant: local embeddings only
            cfg = crg_feeds.load_config(FEEDS)
            try:
                out = ai_embed(cfg, body.get("texts"))
                sys.stderr.write(f"helper: embed {out['provider']} {out['model']} n={len(out['vectors'])}\n")
                return self._json(200, out)
            except PermissionError as exc:
                sys.stderr.write("helper: embed refused\n")
                return self._json(403, {"error": str(exc)})
            except ValueError as exc:
                return self._json(400, {"error": str(exc)})
            except Exception as exc:                    # noqa: BLE001
                return self._json(502, {"error": str(exc)})
        if path == "/api/ai/test":
            provider = body.get("provider") or "claude"
            cfg = crg_feeds.load_config(FEEDS)
            provs = ai_providers(cfg)
            if provider not in provs:
                return self._json(400, {"error": "unknown provider"})
            # 1.9.2 (NV-019): the connectivity test is a request too — it respects "remote AI off" and the local-endpoint check
            refused = ai_check_policy(provider, cfg, {"task": "test", "prompt": AI_TEST_PROMPT, "system": AI_TEST_SYSTEM})
            if refused:
                return self._json(403, {"ok": False, "provider": provider, "error": refused, "label": provs[provider]["label"]})
            try:
                out = ai_test(provider, cfg)
            except Exception as exc:                    # noqa: BLE001
                _record_test(provider, False)
                return self._json(200, {"ok": False, "provider": provider, "error": str(exc),
                                        "label": provs[provider]["label"]})
            _record_test(provider, True)
            return self._json(200, out)
        if path == "/api/keys":
            try:
                name = str(body.get("name") or "")
                hosts = _key_hosts_at_save(name, crg_feeds.load_config(FEEDS))
                return self._json(200, {"keys": crg_feeds.set_key(name, body.get("value"), FEEDS, hosts=hosts)})
            except Exception as exc:                    # noqa: BLE001
                return self._json(400, {"error": str(exc)})
        m = re.match(r"^/api/crgo/(graph|applicability|context|submit|compliance|secops)$", path)
        if m:                                           # 1.5.8 — the dss/v1 contract; 1.6.0 — compliance/v1 and secops/v1
            try:
                t0 = time.time()
                out = crgo_contract(m.group(1), body)
                sys.stderr.write(f"helper: crgo {m.group(1)} {time.time() - t0:.1f}s\n")
                return self._json(200, out)
            except Exception as exc:                    # noqa: BLE001
                return self._json(200, {"error": True, "code": "HELPER", "message": str(exc)})
        m = re.match(r"^/api/crgo/proposals/(propose|list|read|approve|reject|export-contribution)$", path)
        if m:                                           # 1.9.3 — library-proposal/v1: server tools or the same files
            code, out = crgo_proposals(m.group(1), body if isinstance(body, dict) else {})
            return self._json(code, out)
        if path in ("/api/crgo/call", "/api/crgo/restart"):   # 1.5.7 — read-only ontology tools
            cfg = crg_feeds.load_config(FEEDS)
            spec = crgo_client.resolve(cfg, ROOT)
            try:
                if path.endswith("restart"):
                    crgo_client.CLIENT.stop()
                    info = crgo_client.CLIENT.start(spec)
                    return self._json(200, {"ok": True, "info": info, "source": spec.get("source")})
                t0 = time.time()
                tool, args = str(body.get("tool") or ""), dict(body.get("args") or {})
                if tool in crgo_client.GROUPING_TOOLS:   # 1.9.3 — the installation's approved additions take part; never a path from the page
                    args.pop("store_dir", None)
                    try:
                        store = crgo_store()
                    except ValueError:
                        store = None
                    if store:
                        args["store_dir"] = store
                out = crgo_client.CLIENT.call(spec, tool, args)
                sys.stderr.write(f"helper: crgo {body.get('tool')} {time.time() - t0:.1f}s\n")
                return self._json(200, {"result": out, "via": "mcp", "source": spec.get("source"),
                                        "server": (crgo_client.CLIENT.info or {}).get("server")})
            except Exception as exc:                    # noqa: BLE001
                return self._json(502, {"error": str(exc), "via": "mcp", "source": spec.get("source")})
        if path == "/api/suggested/clear":
            crg_feeds._write_json(os.path.join(FEEDS, "suggested-sources.json"), {"schema": "crg-suggested-sources/1", "sources": [], "cleared": _now()})
            return self._json(200, {"ok": True})
        if path == "/api/publish":
            try:
                return self._json(200, publish(body.get("name"), body.get("content") or "", body.get("target") or "registry"))
            except Exception as exc:                    # noqa: BLE001
                return self._json(409 if "was not created by this application" in str(exc) else 400, {"error": str(exc)})
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
    # 1.9.0 — on Windows SO_REUSEADDR lets another program bind the same port and answer in the helper's place;
    # an exclusive bind is used there instead.
    allow_reuse_address = os.name != "nt"

    def server_bind(self):
        if os.name == "nt" and hasattr(socket, "SO_EXCLUSIVEADDRUSE"):
            self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_EXCLUSIVEADDRUSE, 1)
        super().server_bind()


HTTPD = None


def main():
    global PORT
    port = PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8099
    _load_manifest()
    install_task_files()
    try:                                                # 1.9.0 — keys move out of the feeds folder, once
        cfg = crg_feeds.load_config(FEEDS)
        moved = crg_feeds.migrate_legacy_keys(FEEDS, hosts_for=lambda n: _key_hosts_at_save(n, cfg))
        if moved:
            print(f"Moved {moved} API key(s) out of the feeds folder into {crg_feeds.key_storage()['path']}.", flush=True)
        left = crg_feeds.unmigrated_keys()
        if left:
            print(f"{len(left)} API key(s) could not be moved and wait in {crg_feeds.key_storage()['unmigrated']['path']}: "
                  f"{', '.join(left)}. Enter them again in Settings → AI.", flush=True)
    except Exception as exc:                            # noqa: BLE001
        sys.stderr.write(f"helper: the API keys could not be moved out of the feeds folder: {exc}\n")
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
