# CyberRiskGuardian Desktop — with Threat Intel features

**Version 1.5.6 Beta — proof of concept.** For teaching, exploration and method validation. Validate
every result before it supports a real decision.

A desktop companion to the CyberRiskGuardian method that runs entirely in your browser, offline, with
your data staying on your computer. Configure the organization (a real company or a classroom business
case), build and quantify scenarios, link them to MITRE ATT&CK and CVE/CWE, calibrate with a dated
KEV/EPSS threat-context snapshot, weigh treatment options, track KRIs, position a budget, and export
to Excel with live formulas.

---

## Try it — the installable version

| | |
|---|---|
| **Download** | [`dist/CyberRiskGuardian_Desktop_v1.5.6-beta.zip`](dist/CyberRiskGuardian_Desktop_v1.5.6-beta.zip) — about 2.4 MB, everything included |
| **Install** | [`app/INSTALL.md`](app/INSTALL.md) — one page, **in English and in French** |
| **Print version** | [`app/INSTALL-Windows-macOS-EN-FR.pdf`](app/INSTALL-Windows-macOS-EN-FR.pdf) — Windows and macOS side by side, 11 pages |

In short, on **Windows** and **macOS**:

1. Download the zip and unpack it anywhere you can write.
2. Double-click **`start.bat`** (Windows) or **`start.command`** (macOS). A terminal window opens and
   your browser opens on the application. Leave that window open while you work.
3. Check the bottom of the left sidebar reads **`engine verified · 84,491 / 41,104`** before you trust
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

## Feedback welcome

This is a beta and a proof of concept. If you are trying it, the useful things to report are: what the
footer said at first start, anything that did not open or made no sense, any screen whose wording is
wrong for how you actually work, and anything in the French interface that reads badly. Open an issue
here, or write to **marcandre@leger.ca**.

## What is in this folder

| Path | What it is |
|---|---|
| `app/` | The application itself, as it ships: the verified engine, the knowledge base, the teaching case, the framework catalogues, the example threat snapshot, the launchers and the documentation. |
| `app/USER-GUIDE.md` | The full guide — every screen, the 12 steps of an assessment, the acceptance test. Also readable inside the application: **General → User guide**. |
| `app/CHANGELOG.md` | What each release changed. |
| `app/INSTALL.md` | Installation, English and French. |
| `dist/` | The packaged zip, which is exactly the contents of `app/`. |

## Licence

© 2026 Marc-André Léger. **CC BY-NC 4.0.** Students for their own coursework, personal use, non-profits
and NGOs, and evaluation for up to 30 days are covered. Colleges and universities as institutions,
government bodies, Crown corporations, businesses of any size and anything embedded in a product or a
paid service need a commercial licence — write to marcandre@leger.ca. The application's **About →
Licence** page and the root `LICENSE` file give the detail; the Creative Commons legal code governs.

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
