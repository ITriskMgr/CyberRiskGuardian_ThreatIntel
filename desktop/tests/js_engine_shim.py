#!/usr/bin/env python3
# SPDX-License-Identifier: CC-BY-NC-4.0
# Copyright (c) 2026 Marc-André Léger
"""js_engine_shim.py — the desktop browser engine (desktop/app/crg.js + cvss4.js) behind the Python engine's interface.

The cross-engine conformance test (plugins/cyberriskguardian-threatintel/.../test_cross_engine.py) loads every engine as a
Python module exposing calc(s, appetite, factor), classify(ratio) and run(data). This module gives the JavaScript engine
that face: each call runs node on crg.js and returns its JSON. An engine error (the message crg.js throws) becomes a
CRGInputError (a ValueError with .errors), as in the Python engines; NaN ratios arrive as None (JSON null).

    python3 test_cross_engine.py --engine desktop_js=/path/to/desktop/tests/js_engine_shim.py

CRG_APP_DIR points at the application folder (default: ../app next to this file).
"""
import json, os, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
APP = os.path.abspath(os.environ.get("CRG_APP_DIR") or os.path.join(HERE, "..", "app"))
NOT_APPLICABLE = "Not applicable (tolerated risk 0)"

NODE = r"""
const APP = process.env.CRG_SHIM_APP;
// NaN and ±Infinity are not JSON: the Python side sends {"__num__": "nan" | "inf" | "-inf"}
const revive = (k, v) => (v && typeof v === 'object' && '__num__' in v) ? ({ nan: NaN, inf: Infinity, '-inf': -Infinity })[v.__num__] : v;
const req = JSON.parse(require('fs').readFileSync(0, 'utf8'), revive);
global.CVSS4 = require(APP + '/cvss4.js'); const CRG = require(APP + '/crg.js');
const clean = (k, v) => (typeof v === 'number' && !Number.isFinite(v)) ? null : v;
let out;
try {
  if (req.op === 'calc') out = { ok: true, value: CRG.calc(req.s, req.appetite, req.factor) };
  else if (req.op === 'run') out = { ok: true, value: CRG.run(req.data, req.appetite, req.factor) };
  else if (req.op === 'classify') out = { ok: true, value: CRG.classify(req.ratio === null ? NaN : req.ratio) };
  else if (req.op === 'sensitivity') out = { ok: true, value: CRG.sensitivity(req.s, req.delta, req.appetite, req.factor) };
  else if (req.op === 'validate') out = { ok: true, value: CRG.validate(req.s, req.appetite, req.factor) };
  else out = { ok: false, error: 'unknown op ' + req.op };
} catch (e) { out = { ok: false, error: String(e && e.message || e) }; }
process.stdout.write(JSON.stringify(out, clean));
"""


class CRGInputError(ValueError):
    def __init__(self, errors):
        self.errors = list(errors)
        super().__init__("; ".join(self.errors))


def _wire(x):
    """NaN and ±inf are not JSON: send them as {"__num__": …} for the node side to revive."""
    if isinstance(x, float) and (x != x or x in (float("inf"), float("-inf"))):
        return {"__num__": "nan" if x != x else ("inf" if x > 0 else "-inf")}
    if isinstance(x, dict):
        return {k: _wire(v) for k, v in x.items()}
    if isinstance(x, list):
        return [_wire(v) for v in x]
    return x


def _call(req):
    p = subprocess.run(["node", "-e", NODE], input=json.dumps(_wire(req)), capture_output=True, text=True, timeout=60,
                       env=dict(os.environ, CRG_SHIM_APP=APP))
    if p.returncode:
        raise RuntimeError("node failed: " + p.stderr[-400:])
    out = json.loads(p.stdout)
    if not out["ok"]:
        raise CRGInputError([m.strip() for m in out["error"].split("; ") if m.strip()])
    return out["value"]


def calc(s, appetite=0.30, factor=1000):
    return _call({"op": "calc", "s": s, "appetite": appetite, "factor": factor})


def validate(s, appetite=0.30, factor=1000):
    return _call({"op": "validate", "s": s, "appetite": appetite, "factor": factor})


def classify(ratio):
    return _call({"op": "classify", "ratio": None if ratio is None or ratio != ratio else ratio})


def run(data, appetite=None, factor=None):
    return _call({"op": "run", "data": data, "appetite": appetite, "factor": factor})


def sensitivity(s, delta=0.10, appetite=0.30, factor=1000):
    return _call({"op": "sensitivity", "s": s, "delta": delta, "appetite": appetite, "factor": factor})
