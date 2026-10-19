# CyberRiskGuardian Desktop — with Threat Live-feed

A desktop companion to the CyberRiskGuardian method. Configure the organization (a real company or
a classroom business case) and upload its documents; build, batch-create and edit scenarios; link
them to **MITRE ATT&CK** threats and **CVE/CWE** vulnerabilities; calibrate with a dated
**threat-context snapshot** (CISA KEV, FIRST EPSS); compare the risk of every scenario; weigh
treatment options; track **KRIs over time**; position funding choices on the risk-averse →
risk-seeking budget band; and export the assessment to **Excel** with live formulas. Around the
assessment: policy, compliance and audit management, the **Security Policy Writer** (it drafts the policy
set in English and French for ISP management to manage), a local SIEM and SOAR fed by files, the
**CyberRiskGuardian Ontology** (CRGO v0.10.0), a shared **Risk Registry**, and a pack that turns the KRI
dashboard into a **Claude Dashboard** on claude.ai.

**Version 1.7.0 Beta (1.7.x).** For teaching, exploration and method validation; validate every result
before it supports a real decision.

**Installing it:** `INSTALL.md` in the folder — one page, in English and in French, including how to set up
your own file locations, connecting the ontology, replacing an earlier copy, and where your workspaces
and API keys actually live. The user guide is `USER-GUIDE.md` (English) and `USER-GUIDE.fr.md` (French);
every screen's **?** button opens its section. `INSTALL-Windows-macOS-EN-FR.pdf` is the same thing, print-ready.

**It ships with nobody else's folders.** The feeds folder defaults to `~/Downloads/CyberRiskGuardian-feeds`
and moves with one line in `feeds-dir.txt`; the shared Google Drive folders start empty and are set in
Settings → Links & shared folders, which says which are still unset. Nothing is required: the application
works offline with none of them.

It runs in your browser and works offline. Your data stays on the computer. Network use is limited
to three things you ask for: the download of public sources (KEV, EPSS, NVD and the threat feeds you
accepted) by the launcher's helper or the scheduled task; sharing a registry package — anonymized by
default — to the shared folder you chose; and a request you send to an AI provider — the Claude API, OpenAI,
Gemini, Azure OpenAI, GitHub Models, a model on this machine, or one your organization added — always
previewed first and described below. One example threat-context snapshot ships with the application, so the
Threat Evidence Ladder and Process step 5 work with no network at all. With the Claude provider an
extraction may also ask Claude to **search the web** for missing profile items; you choose it in the
extraction dialog. The SIEM and SOAR have **no live connector**: they read files you import. Nothing is sent
automatically, on a schedule, or in the background, and no network call sits in the calculation path.

© 2026 Marc-André Léger. CC BY-NC 4.0. Version 1.7.0 Beta (1.7.x) — see `CHANGELOG.md`.
Who may use it without asking and whose situation needs a commercial licence: Help → About → Licence in the
application.
Project: https://github.com/ITriskMgr/CyberRiskGuardian · https://www.leger.ca

## The engine is reused, not rewritten

`crg.js` and `cvss4.js` are copied **verbatim** from
[`CyberRiskGuardian_IOS`](https://github.com/ITriskMgr/CyberRiskGuardian_IOS) v1.0.1, where they
are already verified: `cvss4.js` matches the Python `cvss` package on all 104,976 base vectors,
and `crg.js` matches `crg_calc.py` on MediBec. A third implementation of the formulas would be a
third thing to keep in step with `crg_calc.py`, and reproducibility is the point of the method.

On every start the app recomputes the bundled MediBec case and compares the totals with
**84,491 / 41,104**. The footer shows the result. If the engine ever diverges, a red banner says
so and tells you not to rely on any number until it matches again.

## Run it

The app must be **served over `http://`**, not opened as a file. `js/app.js` is an ES module, and
every browser refuses to load modules from a `file://` URL — the page loads, the engine self-check
never runs, and the footer stays on `engine loading…`. Serving is local only; no network connection
is used or needed.

**The launchers do it for you.** Double-click `start.command` (macOS), `start.bat` (Windows) or
`start.sh` (Linux). They serve the folder on `127.0.0.1:8099` — loopback only, never the local
network — and open your browser. Leave the window open while you work; Control-C stops it.

On macOS the first run may be blocked by Gatekeeper. Either right-click `start.command` → **Open**,
or make it executable once:

```bash
chmod +x start.command start.sh
```

**By hand**, if you prefer:

```bash
cd CyberRiskGuardian_Desktop
python3 serve.py 8099          # or: python3 -m http.server 8099 --bind 127.0.0.1 (no download helper)
```

Then open `http://localhost:8099/`.

**Install it as a desktop app.** With the app served, choose **Install** from Chrome's address bar
or **Apps → Install this site as an app** in Edge. You get a windowed app with its own icon that
keeps working offline, because the service worker caches the whole folder. The service worker also
only registers over `http(s)`, which is the second reason not to open the file directly.

**Host it.** Any static host serves it as-is; GitHub Pages from `main` / `(root)` works, the same
arrangement as the mobile app.

**The ontology (optional).** The application ships with a snapshot of CRGO. To use the ontology's own MCP
server — organisation context, write-back as proposals, compliance and security-operations contexts — clone
CRGO v0.10.0 beside the application (`CyberRiskGuardian-Ontology*` folders are found newest first) or register
it in Claude as `crgo-ontology`. `INSTALL.md` section 5.3.

See `USER-GUIDE.md` for the full walkthrough, first-run verification and troubleshooting.

## The menu

The side menu is built from one tree (`js/menu.js`): sections that fold, sub-menus for screens with tabs, a
narrow rail of icons (**«** / **»**) and a drawer (**☰**) on narrow screens. A feature switched off in
**Settings → Modules**, or hidden from a person in **Settings → Users & RACI → Menu access**, is left out of
the menu, with any section left empty. Every screen shows a one-line description and a **?** help that
links to its section of the user guide.

| Section | Screen | What it is for |
|---|---|---|
| Start | **Process** | The 13 steps of a complete risk assessment with their status in this workspace, the next recommended step, buttons to the right screens, guidelines and a printable checklist. |
| Organization | **Organization profile** | Workspaces (with several Word/PDF documents imported at creation); profile, obligations, crown jewels, appetite and budget; classroom setting; context documents with local text extraction and keyword hints; **Import from documents** — add documents at any time and extract the profile, the crown jewels and fourteen other targets from them alone (step 4); evidence. |
| | **Information assets** | Inventory linked to scenarios and risks; discovery imports and drop folder; software and data; classification and criticality; BIA; dynamic risk; vulnerability and configuration correlation; endpoint status; dependency graph and blast radius; lifecycle; audit trail; asset compliance. |
| | **Maturity & resilience** | NIST CSF 2.0 maturity — six functions, 22 categories, scored 0–5 against a target — and an eighteen-question resilience instrument on the six capabilities θ is defined as; the two readings of θ shown with the gap named; dated history; the scenario count the measured level suggests. |
| | **Reset data** | Put a teaching case back to its starting point, handing steps 2 and 3 back to the student, or — as an administrator — reset a workspace at one of four depths or delete it, with what would go counted before you confirm. |
| Risk assessment | **KRI dashboard** | Top 5 indicators by default (worst first), gauges with thresholds, search and multi-select, recorded measurements, trends and charts. |
| | **Existing safeguards** | What already protects the organization: owner, state, scope and what it does not cover, framework controls, annual run cost, last shown to work. Proposes θ from the six resilience capabilities; feeds the budget baseline. |
| | **Scenario register** | Every scenario with threat and vulnerability links, status, search, include/exclude, JSON load and export. |
| | **Scenario editor** | One scenario completely, with live KRIs, AI-drafted causal chain, ontology card and a read-only **security-operations evidence** card. |
| | **Batch scenarios** | Candidates from threat patterns, AI, ATT&CK techniques, register CVEs or CWE weaknesses, CSV — and **scenario seeds from security operations** (detection gaps, untested coverage, degraded telemetry, alert clusters, confirmed incidents, approval gaps…), which propose a causal chain and the parameters they may inform, never a value. |
| | **Risk calculator** | Risk of every scenario with search, filters and include/exclude; what-if appetite; full single-scenario calculation with sensitivity. |
| | **Risk register** | Risks with threats, vulnerabilities, assets, scenarios and measures; inherent / current / target ratings; treatment, review and acceptance; heat map; history. |
| | **Risk mitigation** | Control catalogues (your list, ISO/IEC 27002:2022, SP 800-53 r5, CSF 2.0, CIS v8.1, ATT&CK mitigations, and any catalogue loaded in Frameworks); measures with cost, likelihood/impact reductions, effect category, action verb and gap type; combined 1 − ∏(1 − r); proposals; Ask Claude. |
| | **Recommendations** | Treatment need (the residual-to-tolerance verdict first); mitigate / transfer / avoid / accept per scenario; the register from draft to completion with an approval gate that freezes the figures; consolidation; shared controls; roadmap; initiative portfolio; decision register. |
| Threats & vulnerabilities | **Threats · ATT&CK** | ATT&CK Enterprise v19.2 matrix, technique detail with mitigations and CWE links, coverage map, Navigator export. |
| | **Vulnerabilities · CVE/CWE** | CVE register (exposure gate) enriched with KEV/EPSS/ladder; download of KEV, EPSS and NVD through the launcher's helper; NVD, CVE JSON 5 and scanner imports; CWE explorer; vulnerability ↔ scenario link suggestions (rules, then optional AI). |
| | **Threat feeds & social** | Triage first — stories bucketed *needs a decision* / *worth watching* / *not relevant* with the reason stated, and a weekly briefing written without AI; sources matched to this organization; IOC watch list (CSV, STIX 2.1); triage profile for the scheduled task. |
| | **Threat context** | Load or generate a snapshot (`threat-context-YYYY-MM-DD.json` — used in the workspace, or downloaded as a file), place exposed CVEs on the Threat Evidence Ladder, accept exposure-gated Pb(ψ,A) proposals, revision log. |
| | **Ontology · CRGO** | Scenarios suggested from the ontology for the organization, controls by technique and scenarios by control; the **organisation link**: organisation graph, context of a scenario, write-back of results as proposals (dss/v1), and the compliance and security-operations contexts (compliance/v1, secops/v1, CRGO v0.10.0). |
| Governance | **Information security management** | Scope and boundaries, security objectives, management reviews, where the parts stand; exceptions — never waiving a law, no longer a mitigation once expired. |
| | **ISP management** | Policy library and families, sixteen templates, AI drafting; structured editor with clauses and statements (identifier, modality, controls, training) and version comparison; versions frozen with a hash at approval, approver independent of the author; applicability rules and assignments; acknowledgements of an exact version and training; non-compliance. |
| | **Cybersecurity management** | Control testing by assessor line and aspect with conflicts kept visible; governing bodies, roles and delegations of authority; decision records decided only by a named person under valid authority; the incident register. |
| | **Frameworks & standards** | Control catalogues (with SP 800-171 r3, ITSP.10.171 and COBIT 2019 packs loaded on request) and the methods-and-standards register with where CRG stops; import of a CRG pack, an OSCAL catalogue or a CSV with diff and impact shown first. |
| | **Shared registers** | Evidence, corrective actions, exceptions and qualified mappings kept once and used by every management module. |
| | **Quality review** | Eighteen checks before a report or a write-back leaves the analyst — among them: no compliance from a mapping, no incident from an alert, no response action presented as authorised, TLP respected, source confidence never a probability. |
| Compliance management | **Compliance management** | Dashboard; sources and obligations, interpretations, authorities and exemptions; legal applicability with CRGO's evaluator; programmes and framework adoption; mappings; statements of applicability and checklists; requirements; campaigns and determinations backed by evidence; regulatory calendar; submissions; regulatory change; AI-assisted assessment; reporting with the compliance posture. |
| Audit management | **Audit management** | Dashboard; charter and methodology; audit universe; risk-weighted plan; engagements; procedures and SP 800-53A objectives; workpapers and reproducible sampling; observations and findings; responses and independent follow-up; reports issued as hashed snapshots; quality and independence; SOC reports and evidence; traceability. |
| Security operations | **SIEM** | Telemetry sources and health, detection rules (Sigma import), coverage validated only by an effective detection test, gaps, alerts triaged by crown jewel, indicators with source confidence and TLP 2.0, import of local files. |
| | **SOAR** | Cases and incident confirmation by a named person, incidents, versioned playbooks, approval gates, manually recorded actions checked against approvals, dry-run simulations, lessons learned. Nothing is executed on a real system. |
| Risk Registry | **Browse & search · Contribute risks · My contributions · Moderation · Publish & share · Registry settings** | The shared catalogue of risk cards read from a common folder, filtered by sector, region, size, regulation, theme, asset category, threat source, technique, severity and evidence; anonymized contributions; moderation and the curated package; the full register published as JSON, Markdown or CSV. |
| Tools | **CVSS v4.0** | Base metrics only; send to the calculator or save to a scenario. |
| | **Budget** | Budgets by year, initiatives over up to 3 years; guideline target, band chart of funding options, arbitrage table, funding frontier. |
| | **Export · Excel** | Workbook regenerated from scratch with live formulas — scope, sheets and years — plus assessment JSON, context pack, workspace backup. |
| | **AI assistant** | Analyst, parameter critique and scenario generation, with the exact payload shown before anything is sent and a log of every call and your verdict. |
| | **Forecasts** | Monte Carlo over the CRG model from three-point parameter ranges with a driver tornado, and KRI projection with a 95% prediction interval. No AI. |
| | **Backup & restore** | One checksummed file with every workspace, the document text, the loaded catalogues and the helper settings — never an API key; a restore plan shown first; data versions and migrations. |
| Settings | **Settings** | Language · **Modules** · **Logs** (access and data logs) · AI — local & remote · Users & RACI (with menu access) · Documents & files · Links & shared folders · Feed sources & keys · Scheduled task · Network allowlist · **Simulation data** (fictional SIEM/SOAR packs for teaching, bundled or generated with AI) · Export / import. |
| Help | **Step by step** ↗ · **User guide** ↗ · **About** | The steps and guidelines and this guide in windows of their own; creator, licence, use of generative AI, versions. |

## Security operations, locally

The SIEM and SOAR screens follow the rules of CRGO v0.10.0: **an alert is never an incident** (only a
confirmation by a named person on a date makes one); **nothing authorises a response action** (approvals are
human decisions; an action without a valid approval is an audit signal); **coverage is validated only by an
effective detection test**; **source confidence is not a probability**; and **TLP 2.0 is respected**
(TLP:RED and TLP:AMBER+STRICT are masked, never sent to AI, and left out of exports unless kept marked). They
read local files — the `crg-siem-import/1` and `crg-soar-import/1` formats in `docs/SIEM-SOAR-IMPORT-FORMAT.md`,
Sigma rules, STIX 2.1 bundles, CSV — and never connect to a live product. For teaching, **Settings → Simulation
data** imports a fictional pack (the MediBec pack: three weeks of SOC activity with ten exercises) into a case
workspace; `docs/SIMULATION-DATA-GUIDE.md` explains how a pack is built.

## What the threat panel will not do

It honours the same five constraints as the rest of the edition:

- It calibrates `Pb(A)` and `Pb(ψ,A)` only, within ladder bands — never a decimal straight from a feed.
- It never touches `δe`, `δm`, `θ` or `μ(E)`. Those are properties of the organization.
- Without confirmed exposure, evidence goes to the watch list and no score moves.
- Rung 5 is an incident, not a prospective risk; the panel says so when it is reached.
- The exposure join runs locally. No CVE list, scenario text, document or asset inventory leaves the
  machine. The app makes no network request; the launcher's download helper fetches public catalogues
  in full, only when you ask, and never with your CVE list. The AI features are the one deliberate
  exception — see below.
- A proposed Pb(ψ,A) change only raises the value to the floor of the ladder band, only for an
  exposed CVE linked to the scenario, and only when the analyst accepts it.

## What the AI features send, and what they do not

AI **proposes and explains**; the verified engine still calculates, and nothing the AI produces
changes a stored value until you accept it. No network call sits in the calculation path.

The browser never calls a model. It posts to the local helper, which makes the request — so the key
stays out of the page and the egress point is a single auditable function. Before anything is
transmitted the screen shows the **exact payload**, editable, with its size and its destination; the
anonymizer can be applied to it first. A workspace marked **confidential** confirms every single call
and never remembers consent. Every call is recorded — task, provider, model, date, bytes sent, whether it
was anonymized or edited, and what you decided about the answer.

Settings → **AI — local & remote** is the one place that decides what may leave this computer: each AI
feature has a route — the workspace's provider, the local model only, a remote provider, or off — and the
helper checks the route again before any call, so a feature set to the local model cannot reach a remote
provider. A master switch turns remote providers off for the whole installation. Each provider has a
**Test** button that sends a few tokens and no workspace data.

Keys live in `crg-keys.json` beside the feeds, mode 600. They are never in `crg-config.json`, never
in a log, and never in a backup: the backup strips any field whose name looks like a key, token,
secret or password.

## Languages

**EN / FR** in the top bar switches the interface at once. Only interface text is translated: the values of
fields, organization data, case documents, scenarios, catalogue content (ATT&CK, CWE, control titles) and AI
answers stay as written. When the interface is in French, AI requests ask for French prose.

How it works: `js/i18n.js` translates text nodes and the placeholder, title and aria-label
attributes from a catalogue, and a MutationObserver applies it to everything drawn later; switching
back restores the English kept on each node. Catalogue keys are exact English strings, with `#` for a
number and `{0}` for any text.

**Adding a language:** copy `js/i18n/fr.js` to `js/i18n/<code>.js` and translate the values; add one
line to `LANGS` and one to `LOADERS` in `js/i18n.js`; add the file to `sw.js`. Then run
`python3 tools/i18n_coverage.py <code> --missing` to list what is still untranslated.

## Users, rights and logs

Single-user by default. Settings → Users & RACI → *Turn multi-user mode on* makes you the first
administrator. Each user has a RACI letter per process step — R edits, A edits and approves, C and I
view, – hides the step; approvals need A. **Menu access** can further show, set to view only or hide each
screen per group or user. Everything is stored in this browser and enforced by the application: it organizes
and records accountability on one computer but is **not a security boundary**. A team-server design
(Option B) is in `MULTIUSER-ARCHITECTURE.md`. **Settings → Logs** keeps an access log and a data log — when,
who, what and where, never contents, keys or PINs — on this computer, for the retention you choose.

## Feed triage and the weekly briefing

A feed is a pile of headlines; a triage is a decision. The Threat feeds screen opens on the triage,
where the week's items are merged into **stories** — a shared CVE identifier is decisive, otherwise
the headlines are compared on their meaningful words. Each story falls into one of three buckets and the
reason is always stated:

| Bucket | What puts a story there |
|---|---|
| **Needs a decision** | A registered CVE whose exposure is **confirmed** on an asset, or a match on both a scenario technique and a technology you run. |
| **Worth watching** | A registered CVE without confirmed exposure, or a match on a technique, a technology, your sector or your region. |
| **Not relevant** | Nothing in the profile matched. Kept, not discarded — "we looked and it did not concern us" is a finding. |

The triage is deterministic, and the briefing is written from it **without AI**, stating plainly what it has
not done: no risk score has been changed; `Pb(A)` and `Pb(ψ,A)` move only on confirmed exposure, through the
Threat Evidence Ladder, with the analyst accepting each change; and CVSS stays Base-only.

## Files

```
index.html  styles.css                    the application shell
js/app.js  js/state.js  js/store.js       router, workspaces, local storage (IndexedDB)
js/menu.js  js/nav.js                     the side menu as one tree; sections, sub-menus, rail and drawer
js/modules.js  js/users.js                features switched on or off (Settings → Modules); users, RACI, menu access
js/helpdesc.js                            the one-line description and "?" help of every screen, with its guide anchor
js/logs.js                                access log and data log (Settings → Logs)
js/panels/*.js                            one module per screen
js/ontology.js  kb.js                     ATT&CK / CAPEC / CWE knowledge base (bundled extract) and helpers
js/extract.js  js/extractor.js            local text extraction; profile / crown-jewel extraction with provenance tags
js/importer.js                            Import from documents: targets, rules and AI, review
js/snapgen.js  threat.js                  in-app threat-context snapshot builder; ladder and snapshot rules
js/kri.js  js/charts.js                   KRIs, trends, SVG charts
js/xlsx.js  js/exportx.js                 dependency-free .xlsx writer and the workbook layout
crg.js  cvss4.js  sample.js               verbatim from CyberRiskGuardian_IOS, do not edit here
medibec.js                                full MediBec teaching case for the example workspace
js/catalog.js  js/data/controls.js        control catalogue and measure model
js/feedparse.js  js/data/sources.js       feed parsers, relevance matching, STIX export; source catalogue
js/triage.js                              feed triage: story merging, exposure gate, buckets, briefing
js/registry.js  js/anon.js  js/rhub.js    risk register model, registry packages, anonymization, the shared Risk Registry
js/assets.js  js/helper.js                asset model; helper client and settings
js/frameworks.js  js/data/methods.js      catalogue registry, pack import/diff/impact; methods and standards
frameworks/*.json                         bundled control packs (SP 800-171 r3, ITSP.10.171, COBIT 2019)
js/recommend.js                           recommendation lifecycle, approval gate, frozen figures, consolidation
js/safeguards.js  js/maturity.js          existing safeguards; CSF 2.0 maturity and the resilience instrument
js/variety.js                             spreading batch candidates across patterns and assets, from a seed
js/backup.js  js/migrate.js               backup format and restore plan; data versions, migrations, KNOWN_FIELDS
js/forecast.js                            Monte Carlo, distributions, tornado, KRI regression
js/ai.js  js/aiui.js                      AI tasks, routes, consent, decision log; the AI preview dialog
js/linker.js                              vulnerability ↔ scenario link suggestions
js/process.js  js/guidelines.js           the 13 process steps and the guidelines, as data
js/i18n.js  js/i18n/fr.js  js/prefs.js    interface languages and the French catalogue; preferences
js/help.js  js/chat.js                    help corpus and the help chatbot
js/reset.js                               reset scopes and teaching starting points
js/version.js                             the application version, in one place
js/crgo.js  crgo_client.py                the ontology: MCP calls through the helper, the snapshot engine
js/dss.js  crgo_bridge.py                 CRGO contracts dss/v1, compliance/v1, secops/v1; the organisation graph
engine/crg_calc.py                        the calculation engine CRGO's bridge runs
data/crgo-snapshot.json                   the ontology's identification export, for use without the server
data/crgo-assurance.json                  SP 800-53A objectives and methods; illustrative work programmes
js/isp.js  js/grcui.js                    ISP management; the register component of the management modules
js/cms.js  js/ams.js  js/shared.js        compliance management, audit management, shared registers
js/siem.js  js/soar.js                    SIEM and SOAR models (local files, no connector)
js/secops_seed.js                         scenario seeds and evidence from SIEM and SOAR records
js/simgen.js  data/simulation/            simulation packs for teaching: validation, AI prompt, bundled MediBec pack
docs/                                     SIEM/SOAR import formats; how a simulation pack is built
help/                                     step-by-step, user guide and reset windows, with their Markdown renderer
examples/threat-context/                  the bundled example snapshot
start.command  start.sh  start.bat        local launchers (serve on 127.0.0.1, open the browser)
serve.py  crg_feeds.py                    local server and download helper; threat-feed downloader
tools/                                    build scripts and checks: version_check, cache_check, label_check,
                                          history_check, anchor_check, i18n_coverage, guide_parts, build_*
manifest.webmanifest  sw.js  icons/       PWA shell; bump CACHE in sw.js on every change
MULTIUSER-ARCHITECTURE.md                 Option A as built, Option B (team server) design
```

## Scheduled feed downloads and the weekly briefing

`crg_feeds.py` downloads the feed sources of your accepted list into the feeds folder
(`~/Downloads/CyberRiskGuardian-feeds` by default) according to each source's frequency, using the
settings in `crg-config.json` and the keys in `crg-keys.json` that the app writes through the helper.
The helper copies it to `bin/` in the feeds folder at every start, so a scheduled job needs only that
folder:

```bash
python3 ~/Downloads/CyberRiskGuardian-feeds/bin/crg_feeds.py --due     # what a scheduled run does
python3 ~/Downloads/CyberRiskGuardian-feeds/bin/crg_feeds.py --list    # sources, frequency, last run
```

A Claude scheduled task runs it on this computer, copies the digest and a summary to the Drive Feeds
folder, uploads the registry outbox to the Drive registry folder, and proposes new sources for you to
accept in Settings. The same task writes the weekly briefing when you have exported the triage profile
(**Threat feeds → Triage → Export the profile for the scheduled task**, which carries no organization name, no
scenario text and no asset names). It is forbidden from changing any score, parameter or workspace. Settings →
Scheduled task shows its instructions; Settings → Network allowlist lists the domains to allow if your
organization restricts Claude's network access.

## Your data

Workspaces, documents and snapshots are kept in this browser's IndexedDB for this app's address
(`http://localhost:8099` when started by the launchers). They stay on the computer, survive restarts and
updates — each workspace is migrated to the current data version on a copy, the original kept — and are not
shared between browsers or computers. Export a workspace or make a backup to move it. Serving the app on a
different port gives a different, empty store. Clearing the browser's site data deletes them.

## Keeping it in step

When `crg_calc.py` changes, update `crg.js` in the mobile repository first, verify it there, then
copy it here. The self-check will catch a mismatch, but only after the fact — the ordering is what
prevents the divergence.

## Licence

CC BY-NC 4.0. See `LICENSE` and `NOTICE.md`.
