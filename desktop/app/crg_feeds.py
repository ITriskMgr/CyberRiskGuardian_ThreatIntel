#!/usr/bin/env python3
# SPDX-License-Identifier: CC-BY-NC-4.0
# Copyright (c) 2026 Marc-André Léger
"""crg_feeds.py — threat-feed and social-media downloader for CyberRiskGuardian Desktop 1.4.0.

Used two ways, with the same code and the same files:
  * by the local helper (serve.py) when the analyst clicks "Download now" in Threat feeds;
  * by the Claude scheduled task (or cron / Task Scheduler) without the app running:
        python3 crg_feeds.py --due                # sources whose frequency says they are due
        python3 crg_feeds.py --all                # every enabled source
        python3 crg_feeds.py --source threatfox   # one source
        python3 crg_feeds.py --list               # catalogue and state, no download

Everything lives in the feeds folder (default ~/Downloads/CyberRiskGuardian-feeds, or --dir / CRG_FEEDS_DIR):
  crg-config.json          settings edited in the app (Settings): sources, links, shared folders, schedule
  crg-keys.json            API keys, only if the analyst chose to store them for unattended runs (mode 600)
  crg-feeds-state.json     last run, status and item count per source
  feeds/<source>/          downloaded files: latest.<ext> plus dated copies (retention per config)
  feeds-digest.json        small summary of the last run, safe to copy to a shared Drive folder
  suggested-sources.json   new sources proposed by the scheduled task, accepted or rejected in the app
  registry-outbox/         anonymized registry packages waiting to be copied to the shared registry folder

Constraints carried over from the Threat Evidence Ladder: sources are downloaded in bulk, never queried with
the organization's own identifiers; nothing here changes a risk score — feed items are evidence for the analyst.
Standard library only.
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import re
import ssl
import sys
import urllib.error
import urllib.parse
import urllib.request

VERSION = "1.4.0"
UA = f"CyberRiskGuardian-Desktop/{VERSION} (+https://github.com/ITriskMgr/CyberRiskGuardian)"
DEFAULT_DIR = os.path.join(os.path.expanduser("~"), "Downloads", "CyberRiskGuardian-feeds")
FREQ_HOURS = {"hourly": 1, "6h": 6, "12h": 12, "daily": 24, "weekly": 168, "manual": None}
_BASE = os.environ.get("CRG_FEED_BASE")          # test-suite: point every source at a local mock server

# ------------------------------------------------------------------ source catalogue
# status: accepted (in your list) · proposed (suggested, not yet accepted) · rejected
# Placeholders: {key} = the API key named by "key"; {query} = Settings → social query; {tag} = first social tag;
# {since} = ISO date of the last successful run (or 7 days back).
SOURCES = [
    # --- named in the 1.4.0 request (accepted) ---
    {"id": "otx", "name": "AlienVault OTX — subscribed pulses", "provider": "LevelBlue / AlienVault OTX", "category": "intel",
     "url": "https://otx.alienvault.com/api/v1/pulses/subscribed?limit=50&modified_since={since}", "headers": {"X-OTX-API-KEY": "{key}"},
     "key": "otx", "key_required": True, "format": "json", "freq": "6h", "status": "accepted", "enabled": True,
     "domains": ["otx.alienvault.com"], "homepage": "https://otx.alienvault.com/",
     "terms": "Free account; API key from your OTX settings page. Pulses are community-contributed: verify before acting."},
    {"id": "threatfox", "name": "abuse.ch ThreatFox — IOCs of the last day", "provider": "abuse.ch", "category": "ioc",
     "url": "https://threatfox-api.abuse.ch/api/v1/", "method": "POST", "body": {"query": "get_iocs", "days": 1},
     "headers": {"Auth-Key": "{key}"}, "key": "abusech", "key_required": True, "format": "json", "freq": "6h", "status": "accepted", "enabled": True,
     "domains": ["threatfox-api.abuse.ch"], "homepage": "https://threatfox.abuse.ch/", "terms": "Free abuse.ch Auth-Key (auth.abuse.ch). CC0."},
    {"id": "malwarebazaar", "name": "abuse.ch MalwareBazaar — recent samples", "provider": "abuse.ch", "category": "ioc",
     "url": "https://mb-api.abuse.ch/api/v1/", "method": "POST", "form": {"query": "get_recent", "selector": "time"},
     "headers": {"Auth-Key": "{key}"}, "key": "abusech", "key_required": True, "format": "json", "freq": "12h", "status": "accepted", "enabled": True,
     "domains": ["mb-api.abuse.ch"], "homepage": "https://bazaar.abuse.ch/", "terms": "Free abuse.ch Auth-Key. CC0. Metadata only — samples are never downloaded."},
    {"id": "urlhaus", "name": "abuse.ch URLhaus — recent malicious URLs", "provider": "abuse.ch", "category": "ioc",
     "url": "https://urlhaus-api.abuse.ch/v1/urls/recent/limit/500/", "headers": {"Auth-Key": "{key}"}, "key": "abusech", "key_required": True,
     "format": "json", "freq": "12h", "status": "accepted", "enabled": True, "domains": ["urlhaus-api.abuse.ch"],
     "homepage": "https://urlhaus.abuse.ch/", "terms": "Free abuse.ch Auth-Key. CC0."},
    {"id": "feodo", "name": "abuse.ch Feodo Tracker — botnet C2 block list", "provider": "abuse.ch", "category": "ioc",
     "url": "https://feodotracker.abuse.ch/downloads/ipblocklist_recommended.json", "key": None, "key_required": False,
     "format": "json", "freq": "daily", "status": "accepted", "enabled": True, "domains": ["feodotracker.abuse.ch"],
     "homepage": "https://feodotracker.abuse.ch/", "terms": "No key. CC0."},
    {"id": "isc-diary", "name": "SANS ISC — Handler diaries", "provider": "SANS Internet Storm Center", "category": "news",
     "url": "https://isc.sans.edu/rssfeed_full.xml", "key": None, "key_required": False, "format": "rss", "freq": "daily",
     "status": "accepted", "enabled": True, "domains": ["isc.sans.edu"], "homepage": "https://isc.sans.edu/",
     "terms": "No key. CC BY-NC-SA. Identify yourself in the User-Agent (done)."},
    {"id": "isc-infocon", "name": "SANS ISC — Infocon level", "provider": "SANS Internet Storm Center", "category": "stats",
     "url": "https://isc.sans.edu/api/infocon?json", "key": None, "key_required": False, "format": "json", "freq": "daily",
     "status": "accepted", "enabled": True, "domains": ["isc.sans.edu"], "homepage": "https://isc.sans.edu/api/", "terms": "No key."},
    {"id": "isc-topports", "name": "SANS ISC — most attacked ports (DShield)", "provider": "SANS Internet Storm Center", "category": "stats",
     "url": "https://isc.sans.edu/api/topports/records/20?json", "key": None, "key_required": False, "format": "json", "freq": "daily",
     "status": "accepted", "enabled": True, "domains": ["isc.sans.edu"], "homepage": "https://isc.sans.edu/api/", "terms": "No key."},
    # --- proposed: news and advisories ---
    {"id": "cisa-advisories", "name": "CISA — cybersecurity advisories", "provider": "CISA (US)", "category": "news",
     "url": "https://www.cisa.gov/cybersecurity-advisories/all.xml", "format": "rss", "freq": "daily", "status": "proposed", "enabled": False,
     "domains": ["www.cisa.gov"], "homepage": "https://www.cisa.gov/news-events/cybersecurity-advisories", "terms": "Public domain (US government)."},
    {"id": "cccs-advisories", "name": "Canadian Centre for Cyber Security — alerts and advisories", "provider": "CCCS (Canada)", "category": "news",
     "url": "https://www.cyber.gc.ca/api/cccs/rss/v1/get?feed=alerts_advisories&lang=en", "format": "rss", "freq": "daily", "status": "proposed", "enabled": False,
     "domains": ["www.cyber.gc.ca"], "homepage": "https://www.cyber.gc.ca/en/alerts-advisories", "terms": "Government of Canada; relevant to Quebec / Canadian organizations."},
    {"id": "ncsc-uk", "name": "NCSC (UK) — news and reports", "provider": "NCSC UK", "category": "news",
     "url": "https://www.ncsc.gov.uk/api/1/services/v1/report-rss-feed.xml", "format": "rss", "freq": "daily", "status": "proposed", "enabled": False,
     "domains": ["www.ncsc.gov.uk"], "homepage": "https://www.ncsc.gov.uk/", "terms": "Open Government Licence."},
    {"id": "github-advisories", "name": "GitHub Advisory Database — reviewed advisories", "provider": "GitHub", "category": "vuln",
     "url": "https://api.github.com/advisories?type=reviewed&per_page=100&sort=published", "format": "json", "freq": "daily", "status": "proposed", "enabled": False,
     "headers": {"Accept": "application/vnd.github+json"}, "domains": ["api.github.com"], "homepage": "https://github.com/advisories",
     "terms": "No key (60 requests/hour). CC BY 4.0. Reachable through the current egress allowlist."},
    {"id": "bleepingcomputer", "name": "BleepingComputer — security news", "provider": "BleepingComputer", "category": "news",
     "url": "https://www.bleepingcomputer.com/feed/", "format": "rss", "freq": "6h", "status": "proposed", "enabled": False,
     "domains": ["www.bleepingcomputer.com"], "homepage": "https://www.bleepingcomputer.com/", "terms": "Headlines and links only."},
    {"id": "therecord", "name": "The Record (Recorded Future News)", "provider": "Recorded Future", "category": "news",
     "url": "https://therecord.media/feed", "format": "rss", "freq": "6h", "status": "proposed", "enabled": False,
     "domains": ["therecord.media"], "homepage": "https://therecord.media/", "terms": "Headlines and links only."},
    {"id": "ransomware-live", "name": "ransomware.live — recent victims (sector watch)", "provider": "ransomware.live", "category": "intel",
     "url": "https://api.ransomware.live/v2/recentvictims", "format": "json", "freq": "12h", "status": "proposed", "enabled": False,
     "domains": ["api.ransomware.live"], "homepage": "https://www.ransomware.live/", "terms": "Free API, fair use. Victim names are public leak-site claims, unverified."},
    # --- proposed: social media ---
    {"id": "x-search", "name": "X (Twitter) — recent posts matching the social query", "provider": "X Corp. API v2", "category": "social",
     "url": "https://api.x.com/2/tweets/search/recent?max_results=50&tweet.fields=created_at,entities,author_id&query={query}",
     "headers": {"Authorization": "Bearer {key}"}, "key": "x", "key_required": True, "format": "json", "freq": "12h", "status": "proposed", "enabled": False,
     "domains": ["api.x.com"], "homepage": "https://developer.x.com/", "terms": "Requires a paid X API plan with recent search (Basic or higher) and its bearer token."},
    {"id": "mastodon-infosec", "name": "Mastodon infosec.exchange — posts with the social tag", "provider": "infosec.exchange", "category": "social",
     "url": "https://infosec.exchange/api/v1/timelines/tag/{tag}?limit=40", "format": "json", "freq": "6h", "status": "proposed", "enabled": False,
     "domains": ["infosec.exchange"], "homepage": "https://infosec.exchange/", "terms": "Public timeline, no key."},
    {"id": "bluesky-search", "name": "Bluesky — posts matching the social query", "provider": "Bluesky (AT Protocol)", "category": "social",
     "url": "https://api.bsky.app/xrpc/app.bsky.feed.searchPosts?limit=50&sort=latest&q={query}", "format": "json", "freq": "12h", "status": "proposed", "enabled": False,
     "domains": ["api.bsky.app"], "homepage": "https://bsky.app/", "terms": "Public search; Bluesky may require an authenticated session — then the run reports 401/403."},
    {"id": "reddit-netsec", "name": "Reddit r/netsec — new posts", "provider": "Reddit", "category": "social",
     "url": "https://www.reddit.com/r/netsec/new.json?limit=50", "format": "json", "freq": "12h", "status": "proposed", "enabled": False,
     "domains": ["www.reddit.com"], "homepage": "https://www.reddit.com/r/netsec/", "terms": "Public JSON, rate-limited; Reddit API terms apply."},
]

DEFAULT_CONFIG = {
    "schema": "crg-config/1",
    "links": {
        # Yours, not the author's (1.5.6): empty until you set them in Settings -> Links & shared folders.
        "drive_feeds": "",                  # a Google Drive folder you own, for the feed digest and summaries
        "drive_registry": "",               # a Google Drive folder you own, for published risk registries
        "registry_local_dir": "",           # e.g. a Google Drive for desktop folder synced with drive_registry
        "drive_feeds_local_dir": "",        # e.g. a Google Drive for desktop folder synced with drive_feeds
        "controls_list": "",                # your own control list, if you keep one in Google Sheets
        "nvd_api": "https://services.nvd.nist.gov/rest/json/cves/2.0",
        "kev": "https://raw.githubusercontent.com/cisagov/kev-data/develop/known_exploited_vulnerabilities.json",
        "epss": "https://epss.empiricalsecurity.com/epss_scores-{date}.csv.gz",
        "attack_navigator": "https://mitre-attack.github.io/attack-navigator/",
        "plugin_repo": "https://github.com/ITriskMgr/CyberRiskGuardian",
    },
    "social": {"query": "(CVE OR ransomware OR zero-day) -is:retweet lang:en", "tags": ["cve", "infosec", "ransomware"],
               "watch_terms": []},
    "schedule": {"paused": False, "retention": 14, "upload_digest_to_drive": True, "upload_outbox_to_drive": True,
                 "suggest_sources": True, "task_name": "CyberRiskGuardian threat-feed download", "task_cadence": "every 6 hours"},
    "sources": {},        # per-source overrides: {id: {enabled, freq, status, url}}
    "custom_sources": [], # sources added by the analyst or accepted from suggestions (same shape as SOURCES)
}


# ------------------------------------------------------------------ files
def feeds_dir(d=None):
    return os.path.abspath(os.path.expanduser(d or os.environ.get("CRG_FEEDS_DIR") or DEFAULT_DIR))


def _read_json(path, default):
    try:
        with open(path, encoding="utf-8") as fh:
            return json.load(fh)
    except Exception:                                   # noqa: BLE001
        return default


def _write_json(path, obj, mode=None):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as fh:
        json.dump(obj, fh, indent=1, ensure_ascii=False)
    if mode:
        os.chmod(tmp, mode)
    os.replace(tmp, path)


def _merge(base, over):
    out = json.loads(json.dumps(base))
    for k, v in (over or {}).items():
        if isinstance(v, dict) and isinstance(out.get(k), dict):
            out[k] = _merge(out[k], v)
        else:
            out[k] = v
    return out


def load_config(d=None):
    return _merge(DEFAULT_CONFIG, _read_json(os.path.join(feeds_dir(d), "crg-config.json"), {}))


def save_config(cfg, d=None):
    cfg = _merge(DEFAULT_CONFIG, cfg)
    cfg["saved"] = _now()
    _write_json(os.path.join(feeds_dir(d), "crg-config.json"), cfg)
    return cfg


def load_keys(d=None):
    return _read_json(os.path.join(feeds_dir(d), "crg-keys.json"), {})


def set_key(name, value, d=None):
    if not re.fullmatch(r"[a-z0-9_-]{1,32}", name or ""):
        raise ValueError("bad key name")
    keys = load_keys(d)
    if value:
        keys[name] = value
    else:
        keys.pop(name, None)
    _write_json(os.path.join(feeds_dir(d), "crg-keys.json"), keys, mode=0o600)
    return sorted(keys)


def sources(cfg):
    """Catalogue + custom sources with the analyst's overrides applied."""
    out = []
    for s in SOURCES + list(cfg.get("custom_sources") or []):
        s = dict(s)
        s.update({k: v for k, v in (cfg.get("sources") or {}).get(s["id"], {}).items() if k in ("enabled", "freq", "status", "url")})
        s.setdefault("method", "GET"); s.setdefault("key", None); s.setdefault("key_required", False)
        s.setdefault("enabled", s.get("status") == "accepted")
        if s.get("status") != "accepted":
            s["enabled"] = False                   # only sources in your list are ever downloaded
        if _BASE:
            s["url"] = _BASE + "/feeds/" + s["id"]
        out.append(s)
    return out


def _now():
    return dt.datetime.now().isoformat(timespec="seconds")


# ------------------------------------------------------------------ download
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


def _fill(text, src, cfg, keys, state):
    since = (state.get(src["id"], {}).get("last_ok") or (dt.datetime.now() - dt.timedelta(days=7)).isoformat(timespec="seconds"))[:19]
    tag = ((cfg.get("social") or {}).get("tags") or ["cve"])[0]
    rep = {"{key}": keys.get(src.get("key") or "", ""), "{query}": urllib.parse.quote((cfg.get("social") or {}).get("query") or "CVE"),
           "{tag}": urllib.parse.quote(tag), "{since}": urllib.parse.quote(since)}
    for k, v in rep.items():
        text = text.replace(k, v)
    return text


def fetch_source(src, cfg, keys, state, timeout=90):
    url = _fill(src["url"], src, cfg, keys, state)
    if not url.startswith(("https://", "http://127.0.0.1", "http://localhost")):
        raise ValueError("only https sources are allowed")
    headers = {"User-Agent": UA, "Accept": "application/json, application/rss+xml, application/xml;q=0.9, */*;q=0.5"}
    for k, v in (src.get("headers") or {}).items():
        headers[k] = _fill(v, src, cfg, keys, state)
    data = None
    if src.get("method", "GET").upper() == "POST":
        if src.get("form"):
            data = urllib.parse.urlencode(src["form"]).encode()
            headers["Content-Type"] = "application/x-www-form-urlencoded"
        else:
            data = json.dumps(src.get("body") or {}).encode()
            headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=data, headers=headers, method=src.get("method", "GET").upper())
    with urllib.request.urlopen(req, timeout=timeout, context=_ctx() if url.startswith("https") else None) as r:
        return r.read(), r.headers.get("Content-Type", "")


def _count(raw, fmt):
    try:
        if fmt == "rss":
            return len(re.findall(rb"<(item|entry)[\s>]", raw))
        j = json.loads(raw)
        if isinstance(j, list):
            return len(j)
        for k in ("results", "data", "urls", "items", "posts", "statuses"):
            if isinstance(j.get(k), list):
                return len(j[k])
        if isinstance(j.get("data"), dict) and isinstance(j["data"].get("children"), list):
            return len(j["data"]["children"])
        return 1
    except Exception:                                   # noqa: BLE001
        return None


def _explain(exc):
    s = str(exc)
    if isinstance(exc, urllib.error.HTTPError):
        if exc.code in (401, 403):
            return f"HTTP {exc.code}: refused — missing or invalid API key, or the network's egress policy blocks this domain."
        if exc.code == 429:
            return "HTTP 429: rate limited — lower the frequency."
        return f"HTTP {exc.code} {exc.reason}"
    if "Tunnel connection failed: 403" in s or "Tunnel connection failed: 407" in s:
        return "Refused by the network proxy (HTTP 403 on CONNECT) — this domain is not in the egress allowlist."
    if "CERTIFICATE_VERIFY_FAILED" in s:
        return ("TLS certificate verification failed. On macOS run 'Install Certificates.command' from the python.org "
                "Python folder once, or 'pip3 install certifi'. Verification is never disabled.")
    if "Name or service not known" in s or "nodename nor servname" in s or "Temporary failure in name resolution" in s:
        return "Domain could not be resolved — offline, or blocked by the network's egress allowlist."
    return s[:300]


def is_due(src, st, now=None):
    h = FREQ_HOURS.get(src.get("freq") or "daily")
    if h is None:
        return False
    last = st.get("last_ok") or st.get("last_run")
    if not last:
        return True
    now = now or dt.datetime.now()
    try:
        return (now - dt.datetime.fromisoformat(last[:19])).total_seconds() >= h * 3600 * 0.9
    except ValueError:
        return True


def run(ids=None, due=False, d=None, progress=None, cancel=None):
    """Download the selected sources. ids=None → every enabled source (or only the due ones)."""
    d = feeds_dir(d)
    os.makedirs(d, exist_ok=True)
    cfg, keys = load_config(d), load_keys(d)
    state_p = os.path.join(d, "crg-feeds-state.json")
    state = _read_json(state_p, {})
    srcs = [s for s in sources(cfg) if s["enabled"]]
    if ids:
        allsrc = {s["id"]: s for s in sources(cfg)}
        srcs = [allsrc[i] for i in ids if i in allsrc and allsrc[i].get("status") == "accepted"]
    if due:
        srcs = [s for s in srcs if is_due(s, state.get(s["id"], {}))]
    if cfg.get("schedule", {}).get("paused") and due:
        srcs = []
    keep = max(1, int(cfg.get("schedule", {}).get("retention") or 14))
    results = []
    for n, s in enumerate(srcs):
        if cancel and cancel.is_set():
            raise InterruptedError
        if progress:
            progress(n / max(1, len(srcs)), f"{s['name']}…")
        st = state.setdefault(s["id"], {})
        st["last_run"] = _now()
        r = {"id": s["id"], "name": s["name"], "category": s["category"], "domains": s.get("domains", [])}
        if s.get("key_required") and not keys.get(s.get("key") or ""):
            r.update(status="skipped", message=f"API key '{s.get('key')}' not stored — add it in Settings to run unattended.")
        else:
            try:
                raw, ctype = fetch_source(s, cfg, keys, state)
                ext = "xml" if s.get("format") == "rss" else "csv" if s.get("format") == "csv" else "json"
                folder = os.path.join(d, "feeds", s["id"])
                os.makedirs(folder, exist_ok=True)
                stamp = dt.datetime.now().strftime("%Y%m%d-%H%M%S")
                name = f"{s['id']}-{stamp}.{ext}"
                with open(os.path.join(folder, name + ".part"), "wb") as fh:
                    fh.write(raw)
                os.replace(os.path.join(folder, name + ".part"), os.path.join(folder, name))
                with open(os.path.join(folder, "latest." + ext), "wb") as fh:
                    fh.write(raw)
                dated = sorted(f for f in os.listdir(folder) if f.startswith(s["id"] + "-"))
                for old in dated[:-keep]:
                    os.remove(os.path.join(folder, old))
                items = _count(raw, s.get("format"))
                st.update(last_ok=_now(), status="ok", message="", items=items, bytes=len(raw), file=f"feeds/{s['id']}/{name}", latest=f"feeds/{s['id']}/latest.{ext}")
                r.update(status="ok", items=items, bytes=len(raw), file=st["file"])
            except Exception as exc:                    # noqa: BLE001
                r.update(status="error", message=_explain(exc))
        st["status"] = r["status"]; st["message"] = r.get("message", "")
        results.append(r)
        _write_json(state_p, state)
    digest = {"schema": "crg-feeds-digest/1", "generated": _now(), "helper": VERSION, "feeds_dir": d,
              "paused": bool(cfg.get("schedule", {}).get("paused")), "results": results,
              "blocked_or_failed_domains": sorted({dom for r in results if r["status"] == "error" for dom in r["domains"]}),
              "state": state}
    _write_json(os.path.join(d, "feeds-digest.json"), digest)
    if progress:
        progress(1.0, f"{sum(r['status'] == 'ok' for r in results)} of {len(results)} sources downloaded")
    return digest


def latest_files(d=None):
    d = feeds_dir(d)
    out = {}
    root = os.path.join(d, "feeds")
    if os.path.isdir(root):
        for sid in sorted(os.listdir(root)):
            for f in os.listdir(os.path.join(root, sid)):
                if f.startswith("latest."):
                    p = os.path.join(root, sid, f)
                    out[sid] = {"file": f"feeds/{sid}/{f}", "bytes": os.path.getsize(p),
                                "modified": dt.datetime.fromtimestamp(os.path.getmtime(p)).isoformat(timespec="seconds")}
    return out


def main(argv=None):
    ap = argparse.ArgumentParser(description="CyberRiskGuardian threat-feed downloader")
    ap.add_argument("--dir", help="feeds folder (default ~/Downloads/CyberRiskGuardian-feeds)")
    g = ap.add_mutually_exclusive_group()
    g.add_argument("--due", action="store_true", help="download the sources that are due according to their frequency")
    g.add_argument("--all", action="store_true", help="download every enabled source now")
    g.add_argument("--source", action="append", help="download this source (repeatable)")
    g.add_argument("--list", action="store_true", help="show the catalogue, the configuration and the state")
    ap.add_argument("--json", action="store_true", help="print the digest as JSON")
    a = ap.parse_args(argv)
    d = feeds_dir(a.dir)
    if a.list or not (a.due or a.all or a.source):
        cfg, state = load_config(d), _read_json(os.path.join(d, "crg-feeds-state.json"), {})
        keys = load_keys(d)
        for s in sources(cfg):
            st = state.get(s["id"], {})
            flag = "on " if s["enabled"] else "off"
            due = "due" if s["enabled"] and is_due(s, st) else "   "
            key = "" if not s.get("key_required") else (" key:ok" if keys.get(s["key"]) else " key:MISSING")
            print(f"{flag} {due} {s['status']:9} {s['freq']:7} {s['id']:18} {st.get('status', '-'):8} {st.get('last_ok', '-'):19}{key}")
        print(f"\nfolder: {d}\nconfig: {'paused' if cfg['schedule'].get('paused') else 'active'}")
        return 0
    dg = run(ids=a.source, due=a.due, d=d)
    if a.json:
        print(json.dumps(dg, indent=1))
    else:
        for r in dg["results"]:
            print(f"{r['status']:8} {r['id']:18} {r.get('items') or '':>6} {r.get('message', '')}")
        if not dg["results"]:
            print("Nothing to download (no source due, all disabled, or schedule paused).")
        if dg["blocked_or_failed_domains"]:
            print("Failed domains: " + ", ".join(dg["blocked_or_failed_domains"]))
    return 0 if all(r["status"] != "error" for r in dg["results"]) else 2


if __name__ == "__main__":
    sys.exit(main())
