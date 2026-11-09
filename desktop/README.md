# CyberRiskGuardian Desktop — with Threat Intel features

**Version 1.9.2 Beta (1.9.x).** For teaching, exploration and method validation. Validate
every result before it supports a real decision.

A desktop companion to the CyberRiskGuardian method that runs entirely in your browser, offline, with
your data staying on your computer. Configure the organization (a real company or a classroom business
case), build and quantify scenarios, link them to MITRE ATT&CK and CVE/CWE, calibrate with a dated
KEV/EPSS threat-context snapshot, weigh treatment options, track KRIs, position a budget, and export
to Excel with live formulas. It also covers governance (information security management, ISP management,
cybersecurity management), compliance management, audit management, and SIEM and SOAR with local imports,
supported by the [CyberRiskGuardian Ontology (CRGO)](https://w3id.org/crgo/).

---

## Try it — the installable version

| | |
|---|---|
| **Download** | [`dist/CyberRiskGuardian_Desktop_v1.9.2-beta.zip`](dist/CyberRiskGuardian_Desktop_v1.9.2-beta.zip) — about 7 MB, everything included; check it against [`…zip.sha256`](https://github.com/ITriskMgr/CyberRiskGuardian_ThreatIntel/releases/tag/desktop-v1.9.2) from the release |
| **Install** | [`app/INSTALL.md`](app/INSTALL.md) — one page, **in English and in French** |
| **Print version** | [`app/INSTALL-Windows-macOS-EN-FR.pdf`](app/INSTALL-Windows-macOS-EN-FR.pdf) — Windows and macOS side by side, 14 pages |

In short, on **Windows** and **macOS**:

1. Download the zip and unpack it anywhere you can write.
2. Double-click **`start.bat`** (Windows) or **`start.command`** (macOS). A terminal window opens and
   your browser opens on the application. Leave that window open while you work.
3. Check the bottom of the left sidebar reads **`engine verified · 84,305 / 41,023 · CanaRetail 27,526 / 16,049`**
   before you trust any number — at every start the application recomputes the bundled teaching cases and
   compares the totals with the reference implementation.

You need a current browser and Python 3 (already on macOS; on Windows install it from python.org and
tick *Add python.exe to PATH*). No account, no licence key, no installer, no administrator rights.

> **It must be served over `http://`.** Double-clicking `index.html` does not work: the application is
> made of ES modules and browsers refuse to load those from a `file://` address. The launchers do this
> for you, on `127.0.0.1` only, so nothing is reachable from your network.

Nothing in the package points at anyone else's folders. The feeds folder — where downloads, the weekly
briefing and any API keys live — defaults to `~/Downloads/CyberRiskGuardian-feeds` on your own machine
and moves with one line in `feeds-dir.txt`; the optional shared Google Drive folders start empty and
are set in Settings → Links & shared folders. Section 5 of the installation instructions covers both.

## What is new in 1.9.0

One comprehensive beta release (the unreleased 1.8.2 wording patch and the planned security patch are folded in):
**security** of the local helper (a token made at each start, Host and Origin checks, a Content-Security-Policy, API keys
out of the Downloads folder, update downloads checked against a published SHA-256); the **Virtual consultant**, which
answers from passages retrieved on this computer (the textbook, CRGO, the workspace, the bundled catalogues and an
optional licensed library) and replaces the AI assistant; **French that follows the French book** (*appétence pour le
risque*, *joyaux de la couronne*, *registre des éléments probants*, *ratio de tolérance*) and **chapter-linked help**
("Read more: Chapter N — section") on every screen and step; a second bundled teaching example, **CanaRetail** (English
and French, 27,526 / 16,049), and **MediBec in French**; two optional modules, **Identity & access
management (IAM/PAM)** and **Configuration management** (population-level registers, six and three KRIs, findings as
evidence and proposals — nothing applied automatically; both off until switched on in Settings → Modules); **CRGO 0.11.0**
(scenario patterns, CIS Controls v8.1 safeguards with CRGO's own labels, OWASP lists, ISO/IEC 27701 and 42001, the CCSPA),
with **Ontology · CRGO** now under Organization; the **Atlas** redesign of every screen (the Scenario editor in six tabs
beside a live risk card); **SSVC**
decisions beside EPSS and KEV (a response priority, never a likelihood); and **AI forecasting** — exploitation over 30
days, a mitigation optimizer and the residual-risk path, every number from the verified engine. Workspaces move to data
version 5 (journalled); the MediBec reference stays **84,305 / 41,023**. The browser suites, gates and a GitHub Actions
workflow are in `tests/` and `.github/workflows/desktop-ci.yml`. See `app/CHANGELOG.md`; upgrading: `app/INSTALL.md`,
section 7.

## Feedback welcome

This is a beta (1.9.x), and anyone interested is welcome to test it. If you are trying it, the useful things to report are: what the
footer said at first start, anything that did not open or made no sense, any screen whose wording is
wrong for how you actually work, and anything in the French interface that reads badly. Open an issue
here, or write to **marcandre@leger.ca** (licences and quotes: **sales@cyberriskguardian.ca**).

## What is in this folder

| Path | What it is |
|---|---|
| `app/` | The application itself, as it ships: the verified engine, the knowledge base, the teaching case, the framework catalogues, the example threat snapshot, the launchers and the documentation. |
| `app/USER-GUIDE.md` | The full guide — every screen, the nineteen steps of an assessment (the textbook's), the acceptance test. Also readable inside the application: **Help → User guide**. |
| `app/CHANGELOG.md` | What each release changed. |
| `app/INSTALL.md` | Installation, English and French. |
| `dist/` | The packaged zip, which is exactly the contents of `app/`. |

## Licence

© 2026 Marc-André Léger. CyberRiskGuardian Desktop is **proprietary software** from this release: free for
students (their own coursework, including graded work) and non-profit organisations assessing their own risk,
with a 30-day evaluation for any organization; colleges, CEGEPs and universities take the **Educational
Licence** (installation, customization, the current desktop application and the Educator Edition of the
teaching materials); businesses, consultants, MSSPs and government take the **Commercial Licence** (the
Professional editions). Versions up to 1.7.0 remain under CC BY-NC 4.0, and the **Community Edition** — the
method, the Core plugin for Claude, the textbook skill, the MediBec example and the free teaching package —
stays free under CC BY-NC 4.0. Product site and prices: **cyberriskguardian.ca**; licences and quotes:
**sales@cyberriskguardian.ca**. The application's **About → Licence** page, `app/LICENSE` and the `app/licences`
folder give the detail; the licences govern.

Third-party material inside the application — the CVSS v4.0 reference tables, MITRE ATT&CK, CAPEC and
CWE, the NIST catalogues, the control identifiers of ISO/IEC and CIS, the CISA KEV catalogue and the
FIRST EPSS scores — carries its own terms, listed in `app/NOTICE.md`.

## How this relates to the plugin

The [plugin](../plugins/) in this repository brings the same method to Claude as skills, commands and
agents. The desktop application is standalone: it needs neither the plugin nor an AI provider, and its
risk calculation never uses AI — the engine (`crg.js`, `cvss4.js`) reproduces the CyberRiskGuardian
workbook formulas and is checked against the reference at every start. AI features inside the
application are optional, show what would be sent before anything leaves the computer, and never change
a stored value until a person accepts it.
