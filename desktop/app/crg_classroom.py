#!/usr/bin/env python3
# SPDX-License-Identifier: CC-BY-NC-4.0
# Copyright (c) 2026 Marc-André Léger
"""crg_classroom.py — signed classroom packs, course-key pinning and submission checksums (BL-25/26, spec §2, §7).

Classroom work moves as files, never through a server (spec Q1). The instructor's application signs every pack it
exports (assignment, quiz, exercise or course pack); the student's application refuses a pack whose signature does not
verify, and pins each course to the key of its first pack (spec Q5, Q12).

Instructor key
    An Ed25519 key pair in minisign format (crg_signing.py), made on first use. The secret key is a file of mode 600 in
    the folder that already holds API keys (~/.cyberriskguardian/classroom/, or CRG_KEYS_DIR), never in a workspace, a
    pack or a log. The public key travels in every pack; its fingerprint (16 hex digits in four groups) is what the
    instructor posts on the LMS course page.

Pack file (.crgpack, JSON)
    {"schema": "crg-classroom-pack/1", "body": {...}, "signature": "<minisign signature text>", "public_key": "<minisign
    public key text>"}. The signature covers canonical(body): the body as JSON with sorted keys and no spaces, UTF-8.
    body = {"kind": assignment|quiz|exercise|course, "course": {"id", "title"}, "title", "issued", "settings": {...},
    "content": {...}}. settings = {"ai": [allowed AI features], "proposals": bool, "reveal": "immediate"|"after"|"never",
    "due": "YYYY-MM-DD" or ""}. AI is off unless a feature is listed (spec Q13).

Pinning (student side)
    pins.json in the same folder: {course id: {"key": public key text, "fingerprint", "pinned", "changes": [...]}}. The
    first verified pack pins its course. A later pack for that course signed by another key is refused ("key-change")
    until the student confirms a change the instructor announced; the confirmation is journalled in "changes".

Submission file (.crgsub, JSON)
    {"schema": "crg-classroom-submission/1", "body": {...}, "sha256": hex}. The checksum covers canonical(body); the
    instructor's application reports "intact" or "altered". A submission after the due date is marked late, never
    refused (spec §2).
"""
from __future__ import annotations

import datetime as _dt
import hashlib
import json
import os
import re

import crg_signing as SIG

PACK_SCHEMA = "crg-classroom-pack/1"
SUB_SCHEMA = "crg-classroom-submission/1"
KINDS = ("assignment", "quiz", "exercise", "course")
REVEAL = ("immediate", "after", "never")
COURSE_ID = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$")


# ---------------------------------------------------------------- storage
def home() -> str:
    base = os.environ.get("CRG_KEYS_DIR") or os.path.join("~", ".cyberriskguardian")
    return os.path.join(os.path.abspath(os.path.expanduser(base)), "classroom")


def _ensure_home() -> str:
    d = home()
    os.makedirs(d, mode=0o700, exist_ok=True)
    try:
        os.chmod(d, 0o700)
    except OSError:
        pass
    return d


def _write_private(path: str, data: bytes) -> None:
    fd = os.open(path + ".tmp", os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    with os.fdopen(fd, "wb") as fh:
        fh.write(data)
    os.replace(path + ".tmp", path)


def canonical(obj) -> bytes:
    return json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")


def fingerprint(public_key_text: str) -> str:
    """16 hex digits of SHA-256 over the raw public key, in four groups: what the instructor posts on the LMS."""
    raw = SIG.parse_public_key(public_key_text)["key"]
    h = hashlib.sha256(raw).hexdigest()[:16].upper()
    return " ".join(h[i:i + 4] for i in range(0, 16, 4))


# ---------------------------------------------------------------- instructor key
def instructor_key(create: bool = True) -> dict | None:
    """{'public_key', 'fingerprint', 'created'} — makes the pair on first use. The secret never leaves this module."""
    d = home()
    pub_p, sec_p = os.path.join(d, "instructor.pub"), os.path.join(d, "instructor.key")
    if not (os.path.exists(pub_p) and os.path.exists(sec_p)):
        if not create:
            return None
        _ensure_home()
        secret, pub = SIG.generate_keypair()
        _write_private(sec_p, secret.hex().encode("ascii"))
        _write_private(pub_p, pub.encode("utf-8"))
    with open(pub_p, encoding="utf-8") as fh:
        pub = fh.read()
    created = _dt.datetime.fromtimestamp(os.path.getmtime(pub_p), _dt.timezone.utc).date().isoformat()
    return {"public_key": pub, "fingerprint": fingerprint(pub), "created": created}


def _secret() -> bytes:
    with open(os.path.join(home(), "instructor.key"), encoding="ascii") as fh:
        return bytes.fromhex(fh.read().strip())


# ---------------------------------------------------------------- packs
def validate_body(body) -> list[str]:
    errs = []
    if not isinstance(body, dict):
        return ["The pack body is not an object."]
    if body.get("kind") not in KINDS:
        errs.append("kind must be one of " + ", ".join(KINDS) + ".")
    c = body.get("course")
    if not isinstance(c, dict) or not COURSE_ID.match(str(c.get("id") or "")):
        errs.append("course.id must be 1–64 letters, digits, dot, dash or underscore.")
    if not str(body.get("title") or "").strip():
        errs.append("title is required.")
    s = body.get("settings")
    if not isinstance(s, dict):
        errs.append("settings is required.")
    else:
        if not isinstance(s.get("ai", []), list) or not all(isinstance(x, str) for x in s.get("ai", [])):
            errs.append("settings.ai must be a list of AI feature names.")
        if not isinstance(s.get("proposals", False), bool):
            errs.append("settings.proposals must be true or false.")
        if s.get("reveal", "after") not in REVEAL:
            errs.append("settings.reveal must be one of " + ", ".join(REVEAL) + ".")
        due = str(s.get("due") or "")
        if due and not re.match(r"^\d{4}-\d{2}-\d{2}$", due):
            errs.append("settings.due must be a date (YYYY-MM-DD) or empty.")
    if not isinstance(body.get("content", {}), dict):
        errs.append("content must be an object.")
    return errs


def sign_pack(body: dict) -> dict:
    """The pack file object for `body`, signed with the instructor key (made on first use)."""
    errs = validate_body(body)
    if errs:
        raise ValueError(" ".join(errs))
    k = instructor_key()
    comment = f"CyberRiskGuardian classroom pack · course {body['course']['id']} · {body['kind']}"
    sig = SIG.sign(_secret(), k["public_key"], canonical(body), trusted_comment=comment)
    return {"schema": PACK_SCHEMA, "body": body, "signature": sig, "public_key": k["public_key"]}


def _pins_path() -> str:
    return os.path.join(home(), "pins.json")


def pins() -> dict:
    try:
        with open(_pins_path(), encoding="utf-8") as fh:
            return json.load(fh)
    except (OSError, ValueError):
        return {}


def _save_pins(p: dict) -> None:
    _ensure_home()
    _write_private(_pins_path(), json.dumps(p, ensure_ascii=False, indent=1).encode("utf-8"))


def verify_pack(pack) -> dict:
    """{'status', 'detail', 'course', 'fingerprint', 'pinned'} — never pins; accept_pack() does.

    status: verified (signature valid, key matches the course pin) · new-course (valid, course not pinned yet) ·
    key-change (valid, but signed by another key than the pinned one) · invalid (signature does not verify) ·
    malformed (not a pack)."""
    if not isinstance(pack, dict) or pack.get("schema") != PACK_SCHEMA:
        return {"status": "malformed", "detail": f"Not a classroom pack (expected schema {PACK_SCHEMA})."}
    body = pack.get("body")
    errs = validate_body(body)
    if errs:
        return {"status": "malformed", "detail": " ".join(errs)}
    try:
        fp = fingerprint(pack.get("public_key") or "")
        ok = SIG.verify_minisign(canonical(body), pack.get("signature") or "", pack.get("public_key") or "")
    except (ValueError, TypeError) as exc:
        return {"status": "malformed", "detail": f"The signature or the key is not in minisign format: {exc}"}
    course = body["course"]["id"]
    if not ok:
        return {"status": "invalid", "detail": "The pack's signature does not verify: it was altered or not signed by its key. Refused.",
                "course": course, "fingerprint": fp}
    pin = pins().get(course)
    if not pin:
        return {"status": "new-course", "course": course, "fingerprint": fp, "pinned": None,
                "detail": f"First pack for course {course}. Compare the fingerprint {fp} with the one your instructor posted before accepting."}
    if fingerprint(pin["key"]) != fp:
        return {"status": "key-change", "course": course, "fingerprint": fp, "pinned": pin["fingerprint"],
                "detail": f"Course {course} is pinned to key {pin['fingerprint']}, but this pack is signed by {fp}. Refused unless your instructor announced a key change."}
    return {"status": "verified", "course": course, "fingerprint": fp, "pinned": pin["fingerprint"],
            "detail": f"Signed by the course key {fp}."}


def accept_pack(pack, confirm_key_change: bool = False, today: str | None = None) -> dict:
    """Verify, then pin a new course or journal a confirmed key change. Returns verify_pack()'s result with 'accepted'."""
    r = verify_pack(pack)
    r["accepted"] = False
    if r["status"] in ("invalid", "malformed"):
        return r
    day = today or _dt.date.today().isoformat()
    p = pins()
    course = r["course"]
    if r["status"] == "new-course":
        p[course] = {"key": pack["public_key"], "fingerprint": r["fingerprint"], "pinned": day, "changes": []}
        _save_pins(p)
    elif r["status"] == "key-change":
        if not confirm_key_change:
            return r
        old = p[course]
        old.setdefault("changes", []).append({"from": old["fingerprint"], "to": r["fingerprint"], "on": day,
                                              "confirmed_by": "student", "reason": "key change announced by the instructor"})
        old.update({"key": pack["public_key"], "fingerprint": r["fingerprint"]})
        _save_pins(p)
    r["accepted"] = True
    return r


# ---------------------------------------------------------------- submissions
def make_submission(body: dict, now: str | None = None) -> dict:
    """The submission file object: body + submitted time + late flag + SHA-256 over canonical(body)."""
    if not isinstance(body, dict):
        raise ValueError("The submission body is not an object.")
    b = dict(body)
    b["submitted"] = now or _dt.datetime.now(_dt.timezone.utc).replace(microsecond=0).isoformat()
    due = str(b.get("due") or "")
    b["late"] = bool(due) and b["submitted"][:10] > due
    return {"schema": SUB_SCHEMA, "body": b, "sha256": hashlib.sha256(canonical(b)).hexdigest()}


def check_submission(sub) -> dict:
    """{'status': intact|altered|malformed, 'late': bool, 'detail'}."""
    if not isinstance(sub, dict) or sub.get("schema") != SUB_SCHEMA or not isinstance(sub.get("body"), dict):
        return {"status": "malformed", "late": False, "detail": f"Not a submission file (expected schema {SUB_SCHEMA})."}
    ok = hashlib.sha256(canonical(sub["body"])).hexdigest() == str(sub.get("sha256") or "")
    late = bool(sub["body"].get("late"))
    return {"status": "intact" if ok else "altered", "late": late,
            "detail": ("The submission is as the student exported it." if ok
                       else "The submission was changed after it was exported: its checksum does not match.")
            + (" Submitted after the due date (late)." if late else "")}
