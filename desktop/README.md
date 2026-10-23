# CyberRiskGuardian Desktop — with Threat Intel features

**Version 1.8.1 Beta (1.8.x).** For teaching, exploration and method validation. Validate
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
| **Download** | [`dist/CyberRiskGuardian_Desktop_v1.8.1-beta.zip`](dist/CyberRiskGuardian_Desktop_v1.8.1-beta.zip) — about 4 MB, everything included |
| **Install** | [`app/INSTALL.md`](app/INSTALL.md) — one page, **in English and in French** |
| **Print version** | [`app/INSTALL-Windows-macOS-EN-FR.pdf`](app/INSTALL-Windows-macOS-EN-FR.pdf) — Windows and macOS side by side, 12 pages |

In short, on **Windows** and **macOS**:

1. Download the zip and unpack it anywhere you can write.
2. Double-click **`start.bat`** (Windows) or **`start.command`** (macOS). A terminal window opens and
   your browser opens on the application. Leave that window open while you work.
3. Check the bottom of the left sidebar reads **`engine verified · 84,305 / 41,023`** before you trust
   any number — at every start the application recomputes the bundled teaching case and compares the
   totals with the reference implementation.

You need a current browser and Python 3 (already on macOS; on Windows install it from python.org and
tick *Add python.exe to PATH*). No account, no licence key, no installer, no administrator rights.

> **It must be served over `http://`.** Double-clicking `index.html` does not work: the application is
> made of ES modules and browsers refuse to load those from a `file://` address. The launchers do this
> for you, on `127.0.0.1` only, so nothing is reachable from your network.

Nothing in the package points at anyone else's folders. The feeds folder — where downloads, the weekly
briefing and any API keys live — defaults to `~/Downloads/CyberRiskGuardian-feeds` on your own machine
and moves with one line in `feeds-dir.txt`; the optional shared Google Drive folders start empty and
are set in Settings → Links & shared folders. Section 5 of the installation instructions covers both.

## What is new in 1.8.1

Aligned with *Introduction to Cybersecurity Governance for Business Technology Management*, v2.51: the
**nineteen steps** of the book on the Process screen; an **evidence register**; **scenario screening** on the
twelve criteria of chapter 5 with escalation flags, families, four weighting schemes, a coverage matrix and the
watch list; **CVSS by equivalency** for non-technical weaknesses (*limited applicability*); a one-page
**management summary**; full **input validation** (a missing CVSS is an error, never 0); the standard markers;
only the current control catalogues (ISO/IEC 27002:2022, NIST CSF 2.0, CIS v8.1) with legacy references migrated;
and an **opt-in update check** against this repository's GitHub releases (off by default, nothing sent, nothing
installed). The MediBec reference becomes **84,305 / 41,023** (S2 and S8 at AV:L). See `app/CHANGELOG.md`;
upgrading from 1.7.x: `app/INSTALL.md`, section 7.

## Feedback welcome

This is a beta (1.8.x), and anyone interested is welcome to test it. If you are trying it, the useful things to report are: what the
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
