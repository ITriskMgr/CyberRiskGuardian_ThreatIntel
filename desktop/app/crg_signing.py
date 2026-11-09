#!/usr/bin/env python3
# SPDX-License-Identifier: CC-BY-NC-4.0
# Copyright (c) 2026 Marc-André Léger
"""crg_signing.py — minisign signature verification for release downloads (Desktop 1.9.2, NV-086).

The update check keeps a release ZIP only when its SHA-256 matches the checksum published beside it (1.9.0). That
proves the file is the one on the release page; it does not prove who published it. This module adds the second
proof: a **minisign** signature (https://jedisct1.github.io/minisign/) of the ZIP, published beside it as
`<zip name>.minisig`, checked against the author's public key pinned in serve.py (UPDATE_MINISIGN_PUBKEY).

Standard library only: Ed25519 verification is implemented here from RFC 8032 (the reference algorithm; hashlib
gives SHA-512 and BLAKE2b). It is slow in pure Python (about a second per signature), which is fine for one
download. Nothing here signs anything the application ships: `sign()` exists so the test suite can produce a
signature with a key pair it generates, and so that the format reading can be checked end to end.

Minisign formats (both base64 on the second line of a small text file):
  public key  : "Ed" (2 bytes) · key id (8 bytes) · public key (32 bytes)
  signature   : "Ed" or "ED" (2) · key id (8) · signature (64);  "ED" means the signature is over BLAKE2b-512(file)
                (the format minisign writes by default); line 3 "trusted comment: …"; line 4 the global signature
                over signature ‖ trusted comment.

Status words returned by `check()`:
  verified        the signature is valid for this public key and this file
  invalid         a signature was given and it does not verify (the file must not be kept)
  no-key          no public key is pinned: the signature could not be checked (SHA-256 only)
  no-signature    the release carries no .minisig beside the asset while a key is pinned: refused (1.9.2 review, M6)
  malformed       the signature or key text is not in minisign format
"""
from __future__ import annotations

import base64
import hashlib
import os
import secrets

# ---------------------------------------------------------------- Ed25519 (RFC 8032, reference algorithm)
_P = 2 ** 255 - 19
_Q = 2 ** 252 + 27742317777372353535851937790883648493
_D = (-121665 * pow(121666, _P - 2, _P)) % _P


def _sha512(*parts: bytes) -> bytes:
    h = hashlib.sha512()
    for p in parts:
        h.update(p)
    return h.digest()


def _inv(x: int) -> int:
    return pow(x, _P - 2, _P)


def _point_add(P1, P2):
    x1, y1, z1, t1 = P1
    x2, y2, z2, t2 = P2
    a = (y1 - x1) * (y2 - x2) % _P
    b = (y1 + x1) * (y2 + x2) % _P
    c = 2 * t1 * t2 * _D % _P
    d = 2 * z1 * z2 % _P
    e, f, g, h = b - a, d - c, d + c, b + a
    return (e * f % _P, g * h % _P, f * g % _P, e * h % _P)


def _point_mul(s: int, P):
    Q = (0, 1, 1, 0)
    while s > 0:
        if s & 1:
            Q = _point_add(Q, P)
        P = _point_add(P, P)
        s >>= 1
    return Q


def _point_equal(P1, P2) -> bool:
    return (P1[0] * P2[2] - P2[0] * P1[2]) % _P == 0 and (P1[1] * P2[2] - P2[1] * P1[2]) % _P == 0


def _recover_x(y: int, sign: int):
    if y >= _P:
        return None
    x2 = (y * y - 1) * _inv(_D * y * y + 1)
    if x2 == 0:
        return 0 if sign == 0 else None
    x = pow(x2, (_P + 3) // 8, _P)
    if (x * x - x2) % _P != 0:
        x = x * pow(2, (_P - 1) // 4, _P) % _P
    if (x * x - x2) % _P != 0:
        return None
    if (x & 1) != sign:
        x = _P - x
    return x


_G_Y = 4 * _inv(5) % _P
_G_X = _recover_x(_G_Y, 0)
_G = (_G_X, _G_Y, 1, _G_X * _G_Y % _P)


def _point_compress(P) -> bytes:
    zinv = _inv(P[2])
    x, y = P[0] * zinv % _P, P[1] * zinv % _P
    return int.to_bytes(y | ((x & 1) << 255), 32, "little")


def _point_decompress(s: bytes):
    if len(s) != 32:
        return None
    y = int.from_bytes(s, "little")
    sign = y >> 255
    y &= (1 << 255) - 1
    x = _recover_x(y, sign)
    if x is None:
        return None
    return (x, y, 1, x * y % _P)


def _secret_expand(secret: bytes):
    h = _sha512(secret)
    a = int.from_bytes(h[:32], "little")
    a &= (1 << 254) - 8
    a |= (1 << 254)
    return a, h[32:]


def ed25519_public_key(secret: bytes) -> bytes:
    a, _ = _secret_expand(secret)
    return _point_compress(_point_mul(a, _G))


def ed25519_sign(secret: bytes, msg: bytes) -> bytes:
    a, prefix = _secret_expand(secret)
    A = _point_compress(_point_mul(a, _G))
    r = int.from_bytes(_sha512(prefix, msg), "little") % _Q
    Rs = _point_compress(_point_mul(r, _G))
    h = int.from_bytes(_sha512(Rs, A, msg), "little") % _Q
    s = (r + h * a) % _Q
    return Rs + int.to_bytes(s, 32, "little")


def ed25519_verify(public: bytes, msg: bytes, signature: bytes) -> bool:
    if len(public) != 32 or len(signature) != 64:
        return False
    A = _point_decompress(public)
    if A is None:
        return False
    Rs = signature[:32]
    R = _point_decompress(Rs)
    if R is None:
        return False
    s = int.from_bytes(signature[32:], "little")
    if s >= _Q:
        return False
    h = int.from_bytes(_sha512(Rs, public, msg), "little") % _Q
    sB = _point_mul(s, _G)
    hA = _point_mul(h, A)
    return _point_equal(sB, _point_add(R, hA))


# ---------------------------------------------------------------- minisign
def _b64_line(text: str, index: int) -> bytes:
    """The base64 payload on line `index` (0-based) of a minisign text; the first line is a comment."""
    lines = [ln.strip() for ln in str(text or "").strip().splitlines() if ln.strip()]
    if len(lines) <= index:
        raise ValueError("minisign text too short")
    return base64.b64decode(lines[index], validate=True)


def parse_public_key(text: str) -> dict:
    """{'key_id': bytes, 'key': bytes} from a minisign public-key file or its bare base64 line."""
    raw = _b64_line(text, 1 if str(text).lstrip().lower().startswith("untrusted comment") else 0)
    if len(raw) != 42 or raw[:2] != b"Ed":
        raise ValueError("not a minisign public key")
    return {"key_id": raw[2:10], "key": raw[10:]}


def parse_signature(text: str) -> dict:
    """{'alg', 'key_id', 'sig', 'trusted_comment', 'global_sig'} from a .minisig text."""
    lines = [ln.strip() for ln in str(text or "").strip().splitlines() if ln.strip()]
    if len(lines) < 2:
        raise ValueError("not a minisign signature")
    raw = base64.b64decode(lines[1], validate=True)
    if len(raw) != 74 or raw[:2] not in (b"Ed", b"ED"):
        raise ValueError("not a minisign signature")
    out = {"alg": raw[:2].decode(), "key_id": raw[2:10], "sig": raw[10:], "trusted_comment": "", "global_sig": b""}
    # 1.9.2 review (M6): the trusted comment is taken exactly as written after "trusted comment: " (minisign signs it byte for
    # byte: a comment with leading or trailing spaces would otherwise fail as "invalid"); the lines themselves are only
    # right-stripped of the line break.
    raw_lines = [ln.rstrip("\r\n") for ln in str(text or "").splitlines() if ln.strip()]
    if len(raw_lines) >= 4 and raw_lines[2].lower().startswith("trusted comment:"):
        comment = raw_lines[2][len("trusted comment:"):]
        out["trusted_comment"] = comment[1:] if comment.startswith(" ") else comment
        out["global_sig"] = base64.b64decode(lines[3], validate=True)
    return out


def verify_minisign(data: bytes, signature_text: str, public_key_text: str) -> bool:
    """True when `signature_text` (a .minisig file) signs `data` under `public_key_text`."""
    pk = parse_public_key(public_key_text)
    sg = parse_signature(signature_text)
    if sg["key_id"] != pk["key_id"]:
        return False
    msg = hashlib.blake2b(data, digest_size=64).digest() if sg["alg"] == "ED" else data
    if not ed25519_verify(pk["key"], msg, sg["sig"]):
        return False
    if sg["global_sig"]:                                 # the trusted comment is bound to the signature
        if not ed25519_verify(pk["key"], sg["sig"] + sg["trusted_comment"].encode("utf-8"), sg["global_sig"]):
            return False
    return True


def check(data: bytes, signature_text: str | None, public_key_text: str | None) -> dict:
    """{'status': word, 'detail': str} — see the module docstring for the words."""
    if not (public_key_text or "").strip():
        return {"status": "no-key", "detail": "No release-signing public key is pinned in this build: the signature could not be checked. SHA-256 only."}
    if not (signature_text or "").strip():
        # 1.9.2 review (M6): once a key is pinned, a release without its signature is refused — otherwise stripping the
        # .minisig would downgrade the check to the SHA-256 the same party publishes
        return {"status": "no-signature", "detail": "The release carries no .minisig signature beside the asset, and this build pins a release-signing key: an unsigned release is refused; the file was not kept."}
    try:
        ok = verify_minisign(data, signature_text, public_key_text)
    except (ValueError, TypeError) as exc:
        return {"status": "malformed", "detail": f"The signature or the public key is not in minisign format: {exc}"}
    return {"status": "verified" if ok else "invalid",
            "detail": "The minisign signature of the download is valid for the pinned public key." if ok
            else "The minisign signature of the download does NOT verify against the pinned public key; the file was not kept."}


# ---------------------------------------------------------------- key pair and signature in minisign format (tests)
def generate_keypair(key_id: bytes | None = None) -> tuple[bytes, str]:
    """(secret 32 bytes, public-key text in minisign format). For the test suite and for the author's own tooling."""
    secret = secrets.token_bytes(32)
    kid = key_id or secrets.token_bytes(8)
    pub = ed25519_public_key(secret)
    text = "untrusted comment: minisign public key\n" + base64.b64encode(b"Ed" + kid + pub).decode() + "\n"
    return secret, text


def sign(secret: bytes, public_key_text: str, data: bytes, trusted_comment: str = "signed by CyberRiskGuardian tests") -> str:
    """A .minisig text (prehashed "ED" form, as minisign writes by default) for `data`."""
    kid = parse_public_key(public_key_text)["key_id"]
    msg = hashlib.blake2b(data, digest_size=64).digest()
    sig = ed25519_sign(secret, msg)
    glob = ed25519_sign(secret, sig + trusted_comment.encode("utf-8"))
    return ("untrusted comment: signature from minisign secret key\n" + base64.b64encode(b"ED" + kid + sig).decode() + "\n"
            + "trusted comment: " + trusted_comment + "\n" + base64.b64encode(glob).decode() + "\n")


if __name__ == "__main__":                              # python3 crg_signing.py <file> <file.minisig> <pubkey file>
    import sys
    if len(sys.argv) != 4:
        print(__doc__)
        sys.exit(2)
    with open(sys.argv[1], "rb") as fh:
        blob = fh.read()
    res = check(blob, open(sys.argv[2], encoding="utf-8").read(), open(sys.argv[3], encoding="utf-8").read())
    print(res["status"], "—", res["detail"])
    sys.exit(0 if res["status"] == "verified" else 1)
