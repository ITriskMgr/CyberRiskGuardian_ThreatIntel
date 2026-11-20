#!/usr/bin/env python3
# SPDX-License-Identifier: CC-BY-NC-4.0
# Copyright (c) 2026 Marc-André Léger
"""launcher_probe.py — name the copy already running on a port, for start.bat (BL-07, Windows).

    python launcher_probe.py PID PORT      prints one line: VERSION|FOLDER   ("unknown" when not found)

Until 1.9.5, start.bat read the running copy's command line with `wmic`, which recent Windows 11 releases (24H2 and
later) no longer ship; the prompt then said "version unknown, folder unknown". This probe, standard library only:

- reads the version from the running copy itself: http://127.0.0.1:PORT/js/version.js (loopback only, 3-second
  timeout, nothing sent but the request line). Works with every 1.9.x copy, whatever started it;
- reads the folder from the process's command line, with PowerShell's Get-CimInstance (wmic as a fallback). After 1.9.5,
  start.bat starts the helper with its full path, so the folder is there; a copy started by an older start.bat shows a
  bare `serve.py` and its folder stays unknown (Windows does not expose another process's working folder).

It never stops, signals or changes the running copy; start.bat decides what to do after asking.
"""
from __future__ import annotations

import os
import re
import subprocess  # nosec B404
import sys
import urllib.request

VERSION_RX = re.compile(r"export const VERSION = '([0-9][0-9A-Za-z.\-]*)'")
# a quoted path may hold spaces ("C:\Program Files\…\serve.py"); an unquoted one ends at the first space
SERVE_QUOTED = re.compile(r'"([^"]*[\\/])serve\.py"', re.I)
SERVE_BARE = re.compile(r'(?:^|\s)([^\s"]*[\\/])serve\.py(?=\s|$)', re.I)


def version_of(port: int, timeout: float = 3.0) -> str:
    try:
        # reviewed: a fixed http://127.0.0.1 address, only the port varies (an integer)
        with urllib.request.urlopen(f"http://127.0.0.1:{int(port)}/js/version.js", timeout=timeout) as r:  # noqa: S310  # nosec B310
            m = VERSION_RX.search(r.read(65536).decode("utf-8", "replace"))
            return m.group(1) if m else "unknown"
    except (OSError, ValueError):
        return "unknown"


def folder_from_cmdline(cmdline: str) -> str:
    """The folder of serve.py in a command line, or 'unknown' when serve.py was started without a path."""
    m = SERVE_QUOTED.search(cmdline or "") or SERVE_BARE.search(cmdline or "")
    if not m:
        return "unknown"
    folder = m.group(1).strip()
    return folder if folder and (os.path.isabs(folder) or re.match(r"^[A-Za-z]:[\\/]", folder)) else "unknown"


def cmdline_of(pid: int) -> str:
    pid = int(pid)
    attempts = [
        ["powershell", "-NoProfile", "-NonInteractive", "-Command",
         f"(Get-CimInstance Win32_Process -Filter 'ProcessId={pid}').CommandLine"],
        ["wmic", "process", "where", f"ProcessId={pid}", "get", "CommandLine", "/value"],
    ]
    for cmd in attempts:
        try:
            # reviewed: fixed commands, no shell; the only variable part is the integer process id
            out = subprocess.run(cmd, capture_output=True, text=True, timeout=8, check=False).stdout  # noqa: S603  # nosec B603
        except (OSError, subprocess.SubprocessError):
            continue
        out = out.replace("CommandLine=", "").strip()
        if out:
            return out
    return ""


def main(argv: list[str]) -> int:
    if len(argv) != 2 or not all(a.isdigit() for a in argv):
        print("unknown|unknown")
        return 0
    pid, port = int(argv[0]), int(argv[1])
    print(f"{version_of(port)}|{folder_from_cmdline(cmdline_of(pid))}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
