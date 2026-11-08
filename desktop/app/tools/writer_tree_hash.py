#!/usr/bin/env python3
"""writer_tree_hash.py — the content hash of the Security Policy Writer engine tree (Writer 0.1.1, NV-W01).

The Writer exists in two places: this desktop copy (`desktop/app/crg_writer/`, the canonical one — author decision D1)
and the stand-alone repository. Both carried version 0.1.0 with different content. The hash pins the tree: it is
recorded beside WRITER_VERSION in js/version.js (WRITER_TREE_HASH), tools/version_check.py fails the build when the
tree and the recorded hash disagree, and the stand-alone repository's tools/sync_to_desktop.py compares the same
hash before it overwrites anything.

    python3 tools/writer_tree_hash.py            # print the hash of crg_writer/
    python3 tools/writer_tree_hash.py --write    # record it in js/version.js (after a deliberate change of the engine)
    python3 tools/writer_tree_hash.py --check    # exit 1 when js/version.js records another hash
    python3 tools/writer_tree_hash.py <folder>   # hash another crg_writer tree (the stand-alone repository's)

The hash covers every *.py file under the tree (recursively, sorted by relative path, __pycache__ excluded):
SHA-256 over "relative path\\0SHA-256 of the file's bytes\\n" lines. Line endings are normalised to \\n so a
checkout on Windows gives the same hash.
"""
import hashlib
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
VERSION_JS = ROOT / "js" / "version.js"


def tree_hash(folder: pathlib.Path) -> str:
    h = hashlib.sha256()
    files = sorted(p for p in folder.rglob("*.py") if "__pycache__" not in p.parts)
    for p in files:
        data = p.read_bytes().replace(b"\r\n", b"\n")
        h.update(p.relative_to(folder).as_posix().encode("utf-8") + b"\0" + hashlib.sha256(data).hexdigest().encode() + b"\n")
    return h.hexdigest()


def recorded() -> str | None:
    m = re.search(r"export const WRITER_TREE_HASH = '([0-9a-f]{64})'", VERSION_JS.read_text(encoding="utf-8"))
    return m.group(1) if m else None


def main(argv):
    args = [a for a in argv[1:] if not a.startswith("--")]
    folder = pathlib.Path(args[0]).resolve() if args else ROOT / "crg_writer"
    if not folder.is_dir():
        print(f"writer_tree_hash: {folder} is not a folder")
        return 2
    got = tree_hash(folder)
    if "--write" in argv:
        src = VERSION_JS.read_text(encoding="utf-8")
        if "WRITER_TREE_HASH" in src:
            src = re.sub(r"export const WRITER_TREE_HASH = '[0-9a-f]*'", f"export const WRITER_TREE_HASH = '{got}'", src)
        else:
            src = src.replace("export const WRITER_VERSION = '", f"export const WRITER_TREE_HASH = '{got}';\nexport const WRITER_VERSION = '", 1)
        VERSION_JS.write_text(src, encoding="utf-8")
        print(f"writer_tree_hash: {got} recorded in js/version.js")
        return 0
    if "--check" in argv:
        want = recorded()
        if want != got:
            print(f"writer_tree_hash: FAIL — crg_writer/ hashes to {got}, js/version.js records {want!r}.\n"
                  "  A deliberate change of the engine: run python3 tools/writer_tree_hash.py --write (and bump WRITER_VERSION).")
            return 1
        print(f"writer_tree_hash: crg_writer/ matches js/version.js ({got[:16]}…)")
        return 0
    print(got)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
