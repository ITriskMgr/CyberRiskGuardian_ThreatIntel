#!/usr/bin/env python3
# SPDX-License-Identifier: CC-BY-NC-4.0
# Copyright (c) 2026 Marc-André Léger
"""crgo_client.py — the CyberRiskGuardian Ontology, reached as an MCP server (1.5.7; dss/v1 contract 1.5.8;
compliance/v1 and secops/v1 read contracts of CRGO v0.10.0 in 1.6.0).

The ontology (CRGO) ships its own MCP server, pipeline/mcp/crgo_server.py, the same one Claude uses.
The helper starts that server as a child process and speaks MCP to it over stdio — newline-delimited
JSON-RPC 2.0 — with the standard library only, so the application and Claude read the same ontology
through the same six read-only tools.

Where the server is found, in this order:
  1. crg-config.json → "ontology": {"command": ..., "args": [...]}   (Settings → Ontology)
  2. the "crgo-ontology" entry of the Claude desktop configuration, when this computer has one
     (claude_desktop_config.json → mcpServers) — so a server already registered for Claude is reused
     with the same Python interpreter;
  3. a CyberRiskGuardian-Ontology folder found in CRGO_HOME or near this application, started with the
     Python running this helper.

Guard rails: only the six tools of crgo_server.py can be called; the script started must be named
crgo_server.py and exist; nothing is sent anywhere — the server reads its own files. When it cannot be
started, the application falls back to the snapshot shipped in data/crgo-snapshot.json and says so.
"""
from __future__ import annotations

import json
import os
import re
import queue
import subprocess
import sys
import threading
import time

TOOLS = ("crgo_sweep", "crgo_identify", "crgo_scenario", "crgo_controls_for_technique",
         "crgo_scenarios_for_control", "crgo_list_values")
# 1.5.8 — the dss/v1 contract (CRGO 0.9.x). They are not callable through /api/crgo/call: the helper calls
# them itself, with the workspace's own graph files and after its own checks (status proposed, model version).
CONTRACT_TOOLS = ("crgo_risk_context", "crgo_submit_assessment", "crgo_compliance_context", "crgo_secops_context")
MIN_CONTRACT = (0, 9, 1)     # 0.9.0's bridge does not declare the organisation base: the contract tools refuse its graphs
# 1.6.0 — the read contracts compliance/v1 and secops/v1 (CRGO 0.10.0): read only, never retried
VIEW_TOOLS = {"crgo_compliance_context": "compliance/v1", "crgo_secops_context": "secops/v1"}
MIN_VIEWS = (0, 10, 0)
SERVER_NAME = "crgo_server.py"
PROTOCOL = "2025-06-18"
CLIENT_VERSION = "?"      # set by serve.py


def claude_desktop_config():
    """Path of the Claude desktop configuration on this computer, or None."""
    home = os.path.expanduser("~")
    cands = [os.path.join(home, "Library", "Application Support", "Claude", "claude_desktop_config.json"),
             os.path.join(os.environ.get("APPDATA", ""), "Claude", "claude_desktop_config.json"),
             os.path.join(home, ".config", "Claude", "claude_desktop_config.json")]
    for p in cands:
        if p and os.path.isfile(p):
            return p
    return None


def find_home(start):
    """A CyberRiskGuardian-Ontology folder holding the server: CRGO_HOME, then up to five parents of
    `start` and their direct children."""
    def ok(d):
        return d and os.path.isfile(os.path.join(d, "pipeline", "mcp", SERVER_NAME))
    env = os.environ.get("CRGO_HOME")
    if ok(env):
        return os.path.abspath(env)
    d = os.path.abspath(start)
    for _ in range(6):
        # 1.5.8 — a versioned clone (CyberRiskGuardian-Ontology-0.9.1) is preferred, newest first
        try:
            names = sorted((n for n in os.listdir(d) if n.lower().startswith("cyberriskguardian-ontology")),
                           key=lambda n: tuple(int(x) for x in re.findall(r"\d+", n)) or (0,), reverse=True)
        except OSError:
            names = []
        for name in names:
            if ok(os.path.join(d, name)):
                return os.path.join(d, name)
        parent = os.path.dirname(d)
        if parent == d:
            break
        d = parent
    return None


def resolve(cfg, app_root):
    """{command, args, source} for the server, or {error} when none can be found."""
    o = (cfg or {}).get("ontology") or {}
    if o.get("enabled") is False:
        return {"error": "The ontology server is switched off in Settings → Ontology.", "source": "settings"}
    if o.get("command") and o.get("args"):
        return {"command": o["command"], "args": list(o["args"]), "source": "settings"}
    p = claude_desktop_config()
    if p:
        try:
            with open(p, encoding="utf-8") as fh:
                e = (json.load(fh).get("mcpServers") or {}).get("crgo-ontology")
            if e and e.get("command") and e.get("args"):
                return {"command": e["command"], "args": list(e["args"]), "source": "claude-desktop", "file": p}
        except (OSError, ValueError):
            pass
    home = find_home(app_root)
    if home:
        return {"command": sys.executable, "args": [os.path.join(home, "pipeline", "mcp", SERVER_NAME)], "source": "found", "home": home}
    return {"error": "No CyberRiskGuardian Ontology was found on this computer. Set its folder in Settings → Ontology, "
                     "or register the crgo-ontology server in Claude.", "source": "none"}


def check(spec):
    """Refuse anything that is not crgo_server.py: this endpoint starts a process."""
    if spec.get("error"):
        return spec["error"]
    script = next((a for a in spec["args"] if str(a).endswith(SERVER_NAME)), None)
    if not script:
        return f"The configured server is not {SERVER_NAME}."
    if not os.path.isfile(os.path.expanduser(script)):
        return f"{script} does not exist on this computer."
    cmd = os.path.expanduser(spec["command"])
    if os.path.isabs(cmd) and not os.path.isfile(cmd):
        return f"The interpreter {cmd} does not exist on this computer."
    return None


class Client:
    """One long-lived server process; calls are serialised."""

    def __init__(self):
        self.proc = None
        self.spec = None
        self.q = queue.Queue()
        self.lock = threading.Lock()
        self.next_id = 1
        self.info = None
        self.err_tail = []
        self.started = None

    # -- process ----------------------------------------------------------------------------------
    def _reader(self, stream):
        for line in iter(stream.readline, b""):
            line = line.strip()
            if not line:
                continue
            try:
                self.q.put(json.loads(line.decode("utf-8")))
            except ValueError:
                pass
        self.q.put(None)

    def _stderr(self, stream):
        for line in iter(stream.readline, b""):
            self.err_tail = (self.err_tail + [line.decode("utf-8", "replace").rstrip()])[-20:]

    def _send(self, obj):
        self.proc.stdin.write((json.dumps(obj) + "\n").encode("utf-8"))
        self.proc.stdin.flush()

    def _wait(self, rid, timeout):
        end = time.time() + timeout
        while True:
            left = end - time.time()
            if left <= 0:
                raise TimeoutError("The ontology server did not answer in time.")
            try:
                msg = self.q.get(timeout=left)
            except queue.Empty:
                raise TimeoutError("The ontology server did not answer in time.")
            if msg is None:
                tail = " ".join(self.err_tail[-3:])
                raise RuntimeError("The ontology server stopped." + (f" {tail}" if tail else ""))
            if msg.get("id") == rid:
                if "error" in msg:
                    raise RuntimeError(msg["error"].get("message") or str(msg["error"]))
                return msg.get("result")

    def alive(self):
        return self.proc is not None and self.proc.poll() is None

    def stop(self):
        if self.alive():
            try:
                self.proc.terminate()
                self.proc.wait(timeout=3)
            except Exception:                           # noqa: BLE001
                try:
                    self.proc.kill()
                except Exception:                       # noqa: BLE001
                    pass
        self.proc = None
        self.info = None

    def start(self, spec, timeout=90):
        self.stop()
        bad = check(spec)
        if bad:
            raise RuntimeError(bad)
        script = next(a for a in spec["args"] if str(a).endswith(SERVER_NAME))
        cwd = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(os.path.expanduser(script)))))
        self.q = queue.Queue()
        self.err_tail = []
        self.proc = subprocess.Popen([os.path.expanduser(spec["command"])] + [os.path.expanduser(a) for a in spec["args"]],
                                     stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, cwd=cwd)
        threading.Thread(target=self._reader, args=(self.proc.stdout,), daemon=True).start()
        threading.Thread(target=self._stderr, args=(self.proc.stderr,), daemon=True).start()
        rid = self.next_id; self.next_id += 1
        self._send({"jsonrpc": "2.0", "id": rid, "method": "initialize",
                    "params": {"protocolVersion": PROTOCOL, "capabilities": {},
                               "clientInfo": {"name": "CyberRiskGuardian Desktop", "version": CLIENT_VERSION}}})
        res = self._wait(rid, timeout)
        self._send({"jsonrpc": "2.0", "method": "notifications/initialized"})
        rid = self.next_id; self.next_id += 1
        self._send({"jsonrpc": "2.0", "id": rid, "method": "tools/list", "params": {}})
        tools = [t.get("name") for t in (self._wait(rid, timeout) or {}).get("tools", [])]
        self.spec = spec
        self.started = time.strftime("%Y-%m-%dT%H:%M:%S")
        self.info = {"server": (res or {}).get("serverInfo"), "protocol": (res or {}).get("protocolVersion"), "tools": tools}
        return self.info

    # -- calls ------------------------------------------------------------------------------------
    def call(self, spec, tool, args, timeout=120, contract=False):
        if tool not in TOOLS and not (contract and tool in CONTRACT_TOOLS):
            raise ValueError("unknown ontology tool")
        if tool in VIEW_TOOLS:
            rel = release(home_of(spec))
            if not rel.get("viewsUsable"):
                raise RuntimeError(rel.get("viewsProblem") or "%s needs CRGO v0.10.0." % tool)
        with self.lock:
            if not self.alive() or self.spec != spec:
                self.start(spec)
            rid = self.next_id; self.next_id += 1
            self._send({"jsonrpc": "2.0", "id": rid, "method": "tools/call", "params": {"name": tool, "arguments": args or {}}})
            res = self._wait(rid, timeout) or {}
        if res.get("isError"):
            text = " ".join(c.get("text", "") for c in res.get("content") or [] if c.get("type") == "text")
            raise RuntimeError(text or "The ontology tool reported an error.")
        if "structuredContent" in res and res["structuredContent"] is not None:
            sc = res["structuredContent"]
            # FastMCP wraps non-object results as {"result": ...}
            return sc["result"] if isinstance(sc, dict) and set(sc) == {"result"} else sc
        texts = [c.get("text", "") for c in res.get("content") or [] if c.get("type") == "text"]
        if len(texts) == 1:
            try:
                return json.loads(texts[0])
            except ValueError:
                return texts[0]
        out = []
        for t in texts:
            try:
                out.append(json.loads(t))
            except ValueError:
                out.append(t)
        return out


CLIENT = Client()


def home_of(spec):
    """The CRGO folder a server specification points at (three levels above crgo_server.py)."""
    script = next((a for a in (spec.get("args") or []) if str(a).endswith(SERVER_NAME)), None)
    if not script:
        return None
    return os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(os.path.expanduser(script)))))


def release(home):
    """{tag, ontology, contract, bridge}: the release in CRGO's CHANGELOG, the ontology release in src/build.py,
    whether the dss/v1 contract is present, and whether its bridge declares the organisation base (0.9.1)."""
    out = {"tag": None, "ontology": None, "contract": False, "bridge": False, "views": False, "viewsUsable": False,
           "viewsProblem": "No CRGO folder: the compliance and security-operations contexts need CRGO v0.10.0."}
    if not home:
        return out
    try:
        for line in open(os.path.join(home, "CHANGELOG.md"), encoding="utf-8"):
            m = re.match(r"## \[(\d+\.\d+\.\d+)\]", line)
            if m:
                out["tag"] = m.group(1); break
    except OSError:
        pass
    try:
        out["ontology"] = next((l.split('"')[1] for l in open(os.path.join(home, "src", "build.py"), encoding="utf-8") if l.startswith("VERSION")), None)
    except OSError:
        pass
    out["contract"] = os.path.isfile(os.path.join(home, "contracts", "dss", "v1", "assessment-result.schema.json"))
    try:
        out["bridge"] = "preferredNamespaceUri" in open(os.path.join(home, "pipeline", "crg", "crg2rdf.py"), encoding="utf-8").read()
    except OSError:
        pass
    v = tuple(int(x) for x in (out["tag"] or "0.0.0").split("."))
    out["contractUsable"] = out["contract"] and out["bridge"] and v >= MIN_CONTRACT
    # 1.6.0 — compliance/v1 and secops/v1 need CRGO v0.10.0 (contracts and the two MCP tools)
    out["views"] = all(os.path.isfile(os.path.join(home, "contracts", c, "v1", "README.md")) for c in ("compliance", "secops"))
    out["viewsUsable"] = out["views"] and v >= MIN_VIEWS
    out.pop("viewsProblem", None)
    if not out["viewsUsable"]:
        out["viewsProblem"] = ("This CRGO (%s) has no compliance/v1 or secops/v1 contract: the compliance and security-operations contexts need "
                               "CRGO v0.10.0. The dss/v1 contract and scenario identification still work." % (out["tag"] or "unknown"))
    if not out["contractUsable"]:
        out["contractProblem"] = ("This CRGO (%s) has no dss/v1 contract or an older bridge: CRGO v%s or later is needed to read organisation context "
                                  "and write results back. Scenario identification still works." % (out["tag"] or "unknown", ".".join(map(str, MIN_CONTRACT))))
    return out


def status(cfg, app_root):
    spec = resolve(cfg, app_root)
    bad = check(spec)
    return {"source": spec.get("source"), "command": spec.get("command"), "args": spec.get("args"),
            "file": spec.get("file"), "home": spec.get("home"), "usable": not bad, "problem": bad,
            "running": CLIENT.alive() and CLIENT.spec == spec, "info": CLIENT.info if CLIENT.alive() else None,
            "started": CLIENT.started if CLIENT.alive() else None, "stderr": CLIENT.err_tail[-5:],
            "release": release(home_of(spec)) if not spec.get("error") else None}
