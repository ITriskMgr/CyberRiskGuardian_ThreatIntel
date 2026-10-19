#!/usr/bin/env python3
"""build_install_pdf.py — INSTALL-Windows-macOS-EN-FR.pdf from INSTALL.md (maintainer tool).

Renders INSTALL.md with the application's own Markdown renderer (help/md.js) in Chromium and prints it to a
Letter-size PDF with a footer naming the version. Needs Playwright (`pip install playwright`) and a Chromium;
the application itself does not. The version comes from js/version.js, so the PDF can never name another one.

Usage:  python3 tools/build_install_pdf.py            # writes INSTALL-Windows-macOS-EN-FR.pdf beside INSTALL.md
© 2026 Marc-André Léger. CC BY-NC 4.0
"""
import functools
import http.server
import pathlib
import re
import socketserver
import sys
import threading

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "INSTALL-Windows-macOS-EN-FR.pdf"
VERSION = re.search(r"export const VERSION = '([\d.]+)'", (ROOT / "js" / "version.js").read_text()).group(1)

PAGE = """<!doctype html><html lang="en"><head><meta charset="utf-8"><title>CyberRiskGuardian Desktop {v} Beta — Installation (Windows, macOS)</title>
<style>
@page {{ size: Letter; margin: 16mm 16mm 18mm; }}
body {{ font-family: "DejaVu Sans", "Segoe UI", Helvetica, Arial, sans-serif; font-size: 9.6pt; line-height: 1.45; color: #1f2a37; margin: 0; }}
h1 {{ font-size: 17pt; color: #0b2e4f; border-bottom: 2px solid #0b2e4f; padding-bottom: 4px; margin: 0 0 10px; page-break-after: avoid; }}
h1 + p {{ margin-top: 0; }}
h2 {{ font-size: 12.5pt; color: #0b2e4f; margin: 16px 0 6px; page-break-after: avoid; }}
h3 {{ font-size: 10.5pt; color: #0b2e4f; margin: 12px 0 4px; page-break-after: avoid; }}
h4 {{ font-size: 9.8pt; margin: 10px 0 4px; page-break-after: avoid; }}
p, li {{ orphans: 3; widows: 3; }}
a {{ color: #0b4f6c; text-decoration: none; }}
code {{ font-family: "DejaVu Sans Mono", Menlo, Consolas, monospace; font-size: 8.4pt; background: #eef2f5; padding: 0 3px; border-radius: 3px; }}
pre {{ background: #eef2f5; border: 1px solid #d5dde3; border-radius: 4px; padding: 6px 8px; font-size: 8.2pt; white-space: pre-wrap; page-break-inside: avoid; }}
pre code {{ background: none; padding: 0; }}
table {{ border-collapse: collapse; width: 100%; margin: 6px 0 10px; font-size: 8.8pt; page-break-inside: auto; }}
tr {{ page-break-inside: avoid; }}
th, td {{ border: 1px solid #c9d3db; padding: 4px 6px; text-align: left; vertical-align: top; }}
th {{ background: #e8eef2; }}
td:first-child {{ font-weight: 600; }}
blockquote {{ margin: 8px 0; padding: 6px 10px; border-left: 3px solid #0b4f6c; background: #f3f6f8; page-break-inside: avoid; }}
hr {{ border: 0; border-top: 1px solid #c9d3db; margin: 14px 0; }}
h1#français, h1#francais {{ page-break-before: always; }}
</style></head><body><main id="doc"></main>
<script type="module">
import {{ render }} from '/help/md.js';
const text = await (await fetch('/INSTALL.md')).text();
render(text, document.getElementById('doc'));
document.body.dataset.ready = '1';
</script></body></html>"""


def main():
    from playwright.sync_api import sync_playwright
    page_file = ROOT / "_install_print.html"
    page_file.write_text(PAGE.format(v=VERSION), encoding="utf-8")
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(ROOT))
    handler.log_message = lambda *a: None
    with socketserver.TCPServer(("127.0.0.1", 0), handler) as httpd:
        threading.Thread(target=httpd.serve_forever, daemon=True).start()
        port = httpd.server_address[1]
        try:
            with sync_playwright() as p:
                b = p.chromium.launch()
                pg = b.new_page()
                pg.goto(f"http://127.0.0.1:{port}/_install_print.html")
                pg.wait_for_selector("body[data-ready='1']")
                footer = (f'<div style="font-size:7pt;color:#5f6b76;width:100%;padding:0 16mm;display:flex;justify-content:space-between;font-family:sans-serif">'
                          f'<span>CyberRiskGuardian Desktop {VERSION} Beta — Installation · © 2026 Marc-André Léger · CC BY-NC 4.0</span>'
                          f'<span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>')
                pg.pdf(path=str(OUT), format="Letter", print_background=True, display_header_footer=True,
                       header_template="<div></div>", footer_template=footer, margin={"top": "16mm", "bottom": "18mm", "left": "16mm", "right": "16mm"})
                b.close()
        finally:
            httpd.shutdown()
            page_file.unlink()
    print(f"build_install_pdf: {OUT.name} written for {VERSION}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
