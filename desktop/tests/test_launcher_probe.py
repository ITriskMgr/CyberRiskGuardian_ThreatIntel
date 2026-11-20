# SPDX-License-Identifier: CC-BY-NC-4.0
# Copyright (c) 2026 Marc-André Léger
"""BL-07 (Windows): launcher_probe.py names the copy already running on a port without wmic — the version from the
running copy's js/version.js over loopback, the folder from a command line that names serve.py with its path."""
import http.server
import os
import socketserver
import sys
import tempfile
import threading
import unittest

APP = os.path.abspath(os.environ.get("CRG_APP_DIR") or os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "app"))
sys.path.insert(0, APP)
import launcher_probe as L  # noqa: E402


class FolderFromCommandLine(unittest.TestCase):
    def test_quoted_windows_path(self):
        self.assertEqual(L.folder_from_cmdline(r'"C:\Python315\python.exe" "C:\CRG\next\serve.py" 8099'), "C:\\CRG\\next\\")

    def test_quoted_path_with_spaces(self):
        self.assertEqual(L.folder_from_cmdline(r'C:\py\python.exe "C:\Program Files\CRG app\serve.py" 8099'), "C:\\Program Files\\CRG app\\")

    def test_unquoted_path_stops_at_space(self):
        self.assertEqual(L.folder_from_cmdline("/usr/bin/python3 /home/u/crg/serve.py 8099"), "/home/u/crg/")

    def test_bare_serve_py_is_unknown(self):
        # what start.bat up to 1.9.5 left: Windows cannot tell that process's working folder
        self.assertEqual(L.folder_from_cmdline(r'"C:\Python315\python.exe" serve.py 8099'), "unknown")

    def test_empty_or_unrelated(self):
        self.assertEqual(L.folder_from_cmdline(""), "unknown")
        self.assertEqual(L.folder_from_cmdline("python -m http.server 8099"), "unknown")


class VersionOverLoopback(unittest.TestCase):
    def test_reads_version_js_of_the_running_copy(self):
        d = tempfile.mkdtemp(prefix="crg-probe-")
        os.makedirs(os.path.join(d, "js"))
        with open(os.path.join(d, "js", "version.js"), "w", encoding="utf-8") as fh:
            fh.write("export const VERSION = '1.9.5';\n")
        handler = lambda *a, **k: http.server.SimpleHTTPRequestHandler(*a, directory=d, **k)  # noqa: E731
        with socketserver.TCPServer(("127.0.0.1", 0), handler) as srv:
            srv.RequestHandlerClass.log_message = lambda *a: None
            threading.Thread(target=srv.serve_forever, daemon=True).start()
            try:
                self.assertEqual(L.version_of(srv.server_address[1]), "1.9.5")
            finally:
                srv.shutdown()

    def test_nothing_listening_is_unknown(self):
        with socketserver.TCPServer(("127.0.0.1", 0), http.server.BaseHTTPRequestHandler) as s:
            free = s.server_address[1]
        self.assertEqual(L.version_of(free, timeout=1), "unknown")


class Main(unittest.TestCase):
    def test_bad_arguments_print_unknown(self):
        from io import StringIO
        from unittest import mock
        with mock.patch("sys.stdout", new_callable=StringIO) as out:
            self.assertEqual(L.main(["x"]), 0)
        self.assertEqual(out.getvalue().strip(), "unknown|unknown")


if __name__ == "__main__":
    unittest.main()
