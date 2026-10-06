# CyberRiskGuardian Desktop — with Threat Live-feed

A desktop companion to the CyberRiskGuardian method. Configure the organization (a real company or
a classroom business case) and upload its documents; build, batch-create and edit scenarios; link
them to **MITRE ATT&CK** threats and **CVE/CWE** vulnerabilities; calibrate with a dated
**threat-context snapshot** (CISA KEV, FIRST EPSS); compare the risk of every scenario; weigh
treatment options; track **KRIs over time**; position funding choices on the risk-averse →
risk-seeking budget band; and export the assessment to **Excel** with live formulas.

**Version 1.5.6 Beta — proof of concept.** For teaching, exploration and method validation; validate
every result before it supports a real decision. 1.5.6 adds a **General** menu section (Organization,
Information assets, Maturity & resilience, Publish & share, Reset data) with **Step by step** and the
**User guide** opening in windows of their own, printable and offline; **Reset data**, where anyone
working a teaching case can put it back to its starting point and an administrator can reset a
workspace at one of four depths or delete it, confirmed in a separate window with the word typed out
and — in multi-user mode — an administrator PIN; a **Licence page** saying plainly who may use this
under CC BY-NC 4.0 and whose situation needs a commercial licence; and **one list of every API key
stored on this computer**, each removable. The version now comes from one place in the source, with a
build gate so the screens, the helper and the offline cache cannot disagree again.

1.5.5 added **many AI providers, online or inside the
organization** — Claude, OpenAI, Gemini, Azure OpenAI, GitHub Models, Ollama, LM Studio, any other
local OpenAI-compatible server, and *add a provider of your own* for an internal gateway; **varied
batch candidates**, spread across the threat patterns and assets instead of repeating one threat, from
a seed that reproduces the set; **Existing safeguards**, the inventory of what already protects the
organization (technical measures, business processes, internal controls, awareness programmes,
policies, physical, contractual and personnel measures) which also feeds θ and the budget baseline;
**Maturity & resilience**, NIST CSF 2.0 maturity and an eighteen-question resilience instrument whose
two readings are compared rather than averaged; **AI-drafted causal chains** accepted field by field;
a scenario count that follows the maturity you measured rather than a generic ten; and a **bundled
example threat-context snapshot** so Process step 4 can be completed with no network at all.

**Installing it:** `INSTALL.md` in the folder — one page, in English and in French, including how to set up
your own file locations, upgrading from an earlier 1.5.x, and where your workspaces and API keys actually
live. `INSTALL-Windows-macOS-EN-FR.pdf` is the same thing, print-ready.

**It ships with nobody else's folders.** The feeds folder defaults to `~/Downloads/CyberRiskGuardian-feeds`
and moves with one line in `feeds-dir.txt`; the shared Google Drive folders start empty and are set in
Settings → Links & shared folders, which says which are still unset. Nothing is required: the application
works offline with none of them.

It runs in your browser and works offline. Your data stays on the computer. Network use is limited
to three things you ask for: the download of public sources (KEV, EPSS, NVD and the threat feeds you
accepted) by the launcher's helper or the scheduled task; publishing a registry package you chose to
share; and a request you send to an AI provider — the Claude API, OpenAI, Gemini, Azure OpenAI, GitHub
Models, a model on this machine, or one your organization added — always previewed first and described
below. One example threat-context snapshot ships with the application, so the Threat Evidence Ladder
and Process step 4 work with no network at all. With the Claude provider
an extraction may also ask Claude to **search the web** for missing profile items; you choose it in
the extraction dialog. Nothing is sent automatically, on a schedule, or in
the background, and no network call sits in the calculation path.

© 2026 Marc-André Léger. CC BY-NC 4.0. Version 1.5.6 Beta (proof of concept) — see `CHANGELOG.md`.
Who may use it without asking and whose situation needs a commercial licence: About → Licence in the
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

**The launchers do it for you.** Double-click `start.command` (macOS, Linux) or `start.bat`
(Windows). They serve the folder on `127.0.0.1:8099` — loopback only, never the local network —
and open your browser. Leave the window open while you work; Control-C stops it.

On macOS the first run may be blocked by Gatekeeper. Either right-click `start.command` → **Open**,
or make it executable once:

```bash
chmod +x start.command
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

See `USER-GUIDE.md` for the full walkthrough, first-run verification and troubleshooting.

## Screens

| Group | Screen | What it is for |
|---|---|---|
| Start | **Process** | The 12 steps of a complete risk assessment with their status in this workspace, the next recommended step, buttons to the right screens, guidelines and a printable checklist. |
| General | **Organization** | Workspaces (with several Word/PDF documents imported at creation); profile, obligations, crown jewels, appetite and budget; classroom setting; context documents (Word, Excel, PowerPoint, PDF, text) with local text extraction and keyword hints; context pack for the Claude agent. |
| | **Information assets** | Inventory linked to scenarios and risks; discovery imports and drop folder; software and data inventory; classification and criticality; BIA; dynamic risk; vulnerability and configuration correlation; endpoint status; dependency graph and blast radius; lifecycle; audit trail; asset compliance. |
| | **Maturity & resilience** | NIST CSF 2.0 maturity — six functions, 22 categories read from the bundled publisher content, scored 0–5 against a target — and an eighteen-question resilience instrument on the six capabilities θ is defined as. The two readings of θ are shown with the gap named rather than averaged, the lower offered by default. Dated history, trend, and the scenario count the measured level suggests. (1.5.5) |
| | **Publish & share** | Risk register and scenario registry as JSON, Markdown or CSV, anonymized on request; publish to the shared Drive registry; import shared registries. |
| | **Reset data** | Put a teaching case back to its starting point (anyone working it; an administrator PIN in multi-user mode), or — as an administrator — reset a workspace at one of four depths or delete it. What would go is counted before you confirm, and confirmation happens in a window of its own with the word typed out. The stored API keys are kept unless you untick them. (1.5.6) |
| | **Step by step** ↗ | The 12 steps and the guidelines in detail, in a window of its own: printable, works offline, reads the same step and guideline definitions the Process page uses. A screen name opens that screen in the application. (1.5.6) |
| | **User guide** ↗ | The user guide rendered in a window of its own, with a table of contents and a find box. (1.5.6) |
| Assessment | **KRI dashboard** | Top 5 indicators by default (worst first), gauges with thresholds, search and multi-select, recorded measurements, trends and charts. |
| | **Existing safeguards** | The inventory of what already protects the organization: technical measures, business processes, internal controls, awareness programmes, policies and roles, physical, contractual and personnel measures. Owner, state, scope and what it does not cover, what it covers, framework controls, annual run cost, dependencies, and when it was last shown to work. Proposes θ from the six resilience capabilities; feeds the budget baseline. Not the treatment plan. (1.5.5) |
| | **Scenario register** | Every scenario with threat and vulnerability links, status, search, include/exclude, JSON load and export. |
| | **Scenario editor** | View and edit one scenario completely, with live KRIs. |
| | **Batch scenarios** | Generate candidates from threat patterns, MITRE ATT&CK techniques, register CVEs or CWE weaknesses × assets × sources; paste CSV; review in a grid; add to the register. |
| | **Risk calculator** | Risk of every scenario with search, filters and checkboxes to include or exclude; what-if appetite; full single-scenario calculation with sensitivity. |
| | **Risk register** | Risks with threats, vulnerabilities, assets, scenarios and measures; inherent / current / target ratings; treatment, review and acceptance; heat map; history. |
| | **Risk mitigation** | Control catalogue (your list, ISO 27002:2022, SP 800-53 r5, CSF 2.0, CIS v8.1, ATT&CK mitigations, plus any catalogue you loaded in Frameworks); measures with cost, likelihood/impact reductions, effect category, action verb and gap type; combined 1 − ∏(1 − r); before/after; proposals; Ask Claude. Ticking measures builds a draft recommendation. |
| | **Recommendations** | **Treatment need** (the residual-to-tolerance verdict and a treatment objective before any control is offered); mitigate / transfer / avoid / accept options per scenario; the **register** — draft → in review → approved → in implementation → completed, with an approval gate that freezes the figures, decision-maker comments, versions, history and tracking; consolidation of overlapping drafts; shared controls; roadmap; initiative portfolio; decision register. |
| Threats & vulnerabilities | **Threats · ATT&CK** | ATT&CK Enterprise v19.2 matrix, technique detail with mitigations and CWE links, coverage map, Navigator export. |
| | **Vulnerabilities · CVE/CWE** | CVE register (exposure gate) enriched with KEV/EPSS/ladder; online update of KEV, EPSS and NVD through the launcher's helper (background download to Downloads, load later); NVD, CVE JSON 5 and scanner imports; CWE explorer. |
| | **Threat feeds & social** | **Triage** first: the week's items merged into stories and bucketed *needs a decision* / *worth watching* / *not relevant* with the reason stated, plus a weekly briefing written without AI; then the sources themselves — OTX, abuse.ch, SANS ISC, advisories, news, X, Mastodon, Bluesky, Reddit — matched to this organization; IOC watch list (CSV, STIX 2.1); export of the triage profile for the scheduled task. |
| | **Threat context** | Load or generate a snapshot, place exposed CVEs on the Threat Evidence Ladder, accept exposure-gated Pb(ψ,A) proposals, revision log. |
| Governance | **Frameworks & standards** | Two registers: *control catalogues* that feed Risk mitigation and the Statement of Applicability (with the bundled SP 800-171 r3, ITSP.10.171 and COBIT 2019 packs loaded on request), and *methods and standards* — ISO/IEC 27001, 27002, 27005, NIST CSF 2.0, SP 800-30, SP 800-53, CIS, CVSS v4.0, FAIR and the CRG model — each recorded with where CRG stops. Import a CRG pack, a NIST OSCAL catalogue or a CSV, with the diff and the impact on your measures shown before anything is written; revision log. |
| | **Compliance** | Statements of applicability, maturity against target, gaps linked to measures and scenarios, Law 25 and PIPEDA checklists, reports. |
| Tools | **CVSS v4.0** | Base metrics only; send to the calculator or save to a scenario. |
| | **Budget** | Budgets by year, initiatives allocated over up to 3 years, chart by year; guideline target, band chart of funding options, arbitrage table, funding frontier. |
| | **Export · Excel** | Workbook regenerated from scratch with live formulas — scope (included, all, above tolerance, picked), sheets (now with Risk_Register, Measures, Compliance_SoA, Assets) and years — plus assessment JSON, context pack, workspace backup. |
| | **AI assistant** | Proof of concept. In-app analyst, parameter critique and scenario generation, with the exact payload shown before anything is sent, a provider switch (your Claude key, or a local OpenAI-compatible model), and a log of every call and your verdict on the answer. |
| | **Forecasts** | Monte Carlo over the CRG model from three-point parameter ranges with a driver tornado, and KRI projection by least squares with a 95% prediction interval. No AI; the verified engine throughout. |
| | **Backup & restore** | One checksummed file with every workspace, the extracted document text, the loaded catalogues and the helper settings — never an API key. Restoring shows what it would do first, and flags a workspace this browser holds a newer copy of. Migration to another machine is the same file restored there. |
| | **Settings** | Language (EN/FR); **AI — local & remote** (master switches, route of each AI feature, workspace AI, chatbot AI, providers and connection tests); users and RACI rights, all external links and shared folders, feed sources, AI providers and API keys, the scheduled task, network domains to allow. |
| Help | **About** | Creator, licence, use of generative AI, project website and GitHub repository, versions. |

## What the threat panel will not do

It honours the same five constraints as the rest of the edition:

- It calibrates `Pb(A)` and `Pb(ψ,A)` only, within ladder bands — never a decimal straight from a feed.
- It never touches `δe`, `δm`, `θ` or `μ(E)`. Those are properties of the organization.
- Without confirmed exposure, evidence goes to the watch list and no score moves.
- Rung 5 is an incident, not a prospective risk; the panel says so when it is reached.
- The exposure join runs locally. No CVE list, scenario text, document or asset inventory leaves the
  machine. The app makes no network request; the launcher's download helper fetches public catalogues
  in full, only when you ask, and never with your CVE list. The AI assistant added in 1.5.1 is the one
  deliberate exception — see below.
- A proposed Pb(ψ,A) change only raises the value to the floor of the ladder band, only for an
  exposed CVE linked to the scenario, and only when the analyst accepts it.

## What the AI assistant sends, and what it does not (1.5.1, proof of concept)

AI **proposes and explains**; the verified engine still calculates, and nothing the AI produces
changes a stored value until you accept it. Constraint C1 is untouched: no network call sits in the
calculation path.

The browser never calls a model. It posts to the local helper, which makes the request — so the key
stays out of the page and the egress point is a single auditable function. Two providers:

| Provider | Where the text goes |
|---|---|
| `claude` | api.anthropic.com, with your own key |
| `local` | an OpenAI-compatible endpoint on this machine (oMLX, Ollama, LM Studio). Nothing leaves it. |

Before anything is transmitted the screen shows the **exact payload**, byte for byte, with its size
and its destination. The anonymizer from Publish & share can be applied to it first. AI is on by
default per workspace and can be switched off entirely; a workspace marked **confidential** confirms
every single call and never remembers consent. Every call is recorded — task, provider, model, date,
bytes sent, whether it was anonymized, and what you decided about the answer.

Keys live in `crg-keys.json` beside the feeds, mode 600. They are never in `crg-config.json`, never
in a log, and never in a backup: the backup strips any field whose name looks like a key, token,
secret or password.

Nothing is sent automatically, on a schedule, or in the background.

## Languages (1.5.2)

The screens are written in English; French ships with 1.5.2. **EN / FR** in the top bar switches the
interface at once. Only interface text is translated: the values of fields, organization data, case
documents, scenarios, catalogue content (ATT&CK, CWE, control titles) and AI answers stay as written.
When the interface is in French, AI requests ask for French prose.

How it works: `js/i18n.js` translates text nodes and the placeholder, title and aria-label
attributes from a catalogue, and a MutationObserver applies it to everything drawn later; switching
back restores the English kept on each node. Catalogue keys are exact English strings, with `#` for a
number and `{0}` for any text.

**Adding a language:** copy `js/i18n/fr.js` to `js/i18n/<code>.js` and translate the values; add one
line to `LANGS` and one to `LOADERS` in `js/i18n.js`; add the file to `sw.js`. Then run
`python3 tools/i18n_coverage.py <code> --missing` to list what is still untranslated.

## AI — local & remote (1.5.3)

Settings → **AI — local & remote** is the one place that decides what may leave this computer for an AI
model. Each AI feature has a route — the workspace's provider, the local model only, the Claude API, or
off — and the page shows, for the current workspace, where each one would go. A master switch turns
the Claude API off for the whole installation; another governs web search. The routes are stored in
`crg-config.json` and checked again by the helper before any call, so a feature set to the local model
cannot reach api.anthropic.com. Recommended routes: vulnerability linking on the local model (its
payload is the organization's vulnerability list); the others follow the workspace provider. Each
provider has a **Test** button that sends a few tokens and no workspace data.

## Vulnerability ↔ scenario links (1.5.3)

Vulnerabilities → *Suggest links* proposes links in two stages: **rules** on this computer (asset
inventory, shared CWE, CWE exploited by the scenario's ATT&CK techniques, product named in the
scenario; exposure proposals for CVEs an asset lists or runs), then optionally **AI** (local model by
default). Everything lands in one review list; nothing is linked until accepted, rejected proposals do
not come back, and every decision is logged. A link never moves a score by itself.

## Users and rights (1.5.2, Option A)

Single-user by default. Settings → Users & RACI → *Turn multi-user mode on* makes you the first
administrator. Each user has a RACI letter per process step — R edits, A edits and approves, C and I
view, – hides the step; approvals of recommendations, formal risk acceptances and measure approvals
need A. Everything is stored in this browser and enforced by the application: it organizes and
records accountability on one computer but is **not a security boundary**. A team-server design
(Option B), where the helper enforces the same model, is in `MULTIUSER-ARCHITECTURE.md`.

## Feed triage and the weekly briefing (1.5.1)

A feed is a pile of headlines; a triage is a decision. The Threat feeds screen opens on the triage,
where the week's items are merged into **stories** — a shared CVE identifier is decisive, otherwise
the headlines are compared on their meaningful words — so three outlets covering one vulnerability
become one row carrying all three sources. Each story falls into one of three buckets and the reason
is always stated, naming the CVE, technique, technology or term that matched:

| Bucket | What puts a story there |
|---|---|
| **Needs a decision** | A registered CVE whose exposure is **confirmed** on an asset, or a match on both a scenario technique and a technology you run. |
| **Worth watching** | A registered CVE without confirmed exposure, or a match on a technique, a technology, your sector or your region. |
| **Not relevant** | Nothing in the profile matched. Kept, not discarded — "we looked and it did not concern us" is a finding. |

The exposure gate (constraint C4) is what separates the first two buckets, which is the same rule the
Threat context screen uses before proposing any change to `Pb(ψ,A)`. The triage is deterministic: the
same items and the same workspace produce the same buckets in the same order.

The briefing is written from the triage **without AI** and states plainly what it has not done: no
risk score has been changed; `Pb(A)` and `Pb(ψ,A)` move only on confirmed exposure, through the
Threat Evidence Ladder, with the analyst accepting each change; and CVSS stays Base-only. A second
button narrates the same triage through the AI assistant for a management audience — that narration
is told to state no risk figure, and the briefing without AI remains the one of record.

Snapshots are built either by `threat_snapshot.py` in the
[`CyberRiskGuardian_ThreatIntel`](https://github.com/ITriskMgr/CyberRiskGuardian_ThreatIntel)
repository, or in the app from the KEV and EPSS files the analyst downloads in bulk. Either way, no
organization-specific CVE is ever sent to a provider.

## Files

```
index.html  styles.css                    the application shell
js/app.js  js/state.js  js/store.js       router, workspaces, local storage (IndexedDB)
js/panels/*.js                            one module per screen
js/ontology.js  kb.js                     ATT&CK / CAPEC / CWE knowledge base (bundled extract) and helpers
js/extract.js                             local text extraction (docx, xlsx, pptx, pdf, text)
js/snapgen.js                             in-app threat-context snapshot builder
js/kri.js  js/charts.js                   KRIs, trends, SVG charts
js/xlsx.js  js/exportx.js                 dependency-free .xlsx writer and the workbook layout
threat.js                                 ladder, snapshot rules, revision log — port of threat_snapshot.py
crg.js  cvss4.js  sample.js               verbatim from CyberRiskGuardian_IOS, do not edit here
medibec.js                                full MediBec teaching case for the example workspace
tools/build_kb.py                         regenerates kb.js from the MITRE ATT&CK, CAPEC and CWE releases
start.command  start.sh  start.bat        local launchers (serve on 127.0.0.1, open the browser)
serve.py                                  local server + download helper for Vulnerabilities → Online sources
crg_feeds.py                              threat-feed downloader shared by the helper and the scheduled task (1.4)
js/catalog.js  js/data/controls.js        control catalogue and measure model; tools/build_controls.py rebuilds it
js/feedparse.js  js/data/sources.js       feed parsers, relevance matching, STIX export; source catalogue (tools/build_sources.py)
js/registry.js  js/anon.js                risk register model, registry packages, anonymization
js/assets.js  js/helper.js                asset model (scores, discovery, blast radius); helper client and settings
js/nav.js                                 collapsible navigation sections (1.5)
js/frameworks.js  js/data/methods.js      catalogue registry, pack import/diff/impact; the methods and standards register
frameworks/*.json                         bundled control packs (SP 800-171 r3, ITSP.10.171, COBIT 2019)
tools/build_frameworks.py                 converts and validates a pack offline
tools/extract.py  tools/build_packs.py    rebuild the bundled packs from the publishers' PDFs
js/recommend.js                           recommendation model: lifecycle, approval gate, frozen figures, consolidation
js/backup.js                              backup file format, checksum, restore plan
js/forecast.js                            Monte Carlo, distributions, tornado, KRI regression
js/ai.js                                  AI tasks, payload preparation, consent, decision log (the browser never calls a model)
js/triage.js                              feed triage: story merging, exposure gate, buckets, briefing, profile export
js/process.js  js/panels/process.js       the 12 process steps, statuses, guidelines (1.5.2)
js/i18n.js  js/i18n/fr.js  js/prefs.js    interface languages and the French catalogue; per-user preferences
js/users.js  js/panels/settings_more.js   users, RACI rights, read-only enforcement, activity log; Language & Users settings
js/extractor.js  js/aiui.js               profile / crown-jewel extraction with provenance tags; AI preview dialog
js/help.js  js/chat.js                    help corpus and the help chatbot
js/linker.js  js/panels/links.js          vulnerability ↔ scenario link suggestions (rules and AI) and their review (1.5.3)
js/panels/settings_ai.js                  Settings → AI — local & remote: routes, master switches, workspace AI, chatbot (1.5.3)
js/importer.js  js/panels/importui.js     Import from the documents: 14 targets, rules and AI, review, Evidence tab (1.5.4)
js/panels/settings_files.js               Settings → Documents & files (1.5.4)
tools/label_check.py                      checks that the guidelines and the guide name the screens exactly (1.5.4)
js/variety.js                             spreading batch candidates across patterns and assets, from a seed (1.5.5)
js/safeguards.js  js/panels/safeguards.js the inventory of existing safeguards; proposes θ, feeds the baseline (1.5.5)
js/maturity.js  js/panels/maturity.js     CSF 2.0 maturity, the resilience questionnaire, the two θ readings (1.5.5)
examples/threat-context/                  the bundled example snapshot: KEV in full, EPSS pruned at the rung-1 ceiling (1.5.5)
js/version.js                             the application version, in one place; tools/version_check.py enforces it (1.5.6)
js/guidelines.js                          the guidelines as data, readable by a page that is not the app (1.5.6)
js/reset.js  js/panels/reset.js           reset scopes, teaching starting points, the Reset data screen (1.5.6)
help/                                     the three windows that open outside the app: step-by-step, user guide,
                                          reset confirmation, with their Markdown renderer and stylesheet (1.5.6)
tools/version_check.py                    one version everywhere: index.html, sw.js and serve.py must agree (1.5.6)
js/panels/about.js                        About screen: About, Licence (CC BY-NC 4.0 in plain terms), Versions
tools/i18n_coverage.py                    interface strings and catalogue coverage
MULTIUSER-ARCHITECTURE.md                 Option A as built, Option B (team server) design
manifest.webmanifest  sw.js  icons/       PWA shell; bump CACHE in sw.js on every change
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
accept in Settings. Settings → Scheduled task shows its instructions, the pause switch and how to
change its cadence. If your organization restricts Claude's network access, the domains in Settings →
Network allowlist must be allowed first.

Since 1.5.1 the same task also writes the weekly briefing, but only if you have given it something to
triage with: **Threat feeds → Triage → Export the profile for the scheduled task** writes
`briefings/triage-profile.json` into the feeds folder. That file carries the technologies, the
registered CVEs with their exposure flag, the scenario techniques, the sector, the region and the
weighted terms — and deliberately **no organization name, no scenario text and no asset names**, so
the week can be triaged without the workspace leaving the machine. The task reads it, applies the
same documented rules, writes `briefings/briefing-YYYY-MM-DD.md` and uploads it beside the digest. It
is forbidden from changing any score, parameter or workspace. If the profile is absent it says so and
does the download only. The application's own triage remains the authoritative one, because it is
deterministic; the task's briefing is a reading of the same rules.

## Your data

Workspaces, documents and snapshots are kept in this browser's IndexedDB for this app's address
(`http://localhost:8099` when started by the launchers). They stay on the computer, survive restarts and updates, and are not
shared between browsers or computers. Export a workspace to back it up or move it. Serving the app
on a different port gives a different, empty store. Clearing the browser's site data deletes them.

## Keeping it in step

When `crg_calc.py` changes, update `crg.js` in the mobile repository first, verify it there, then
copy it here. The self-check will catch a mismatch, but only after the fact — the ordering is what
prevents the divergence.

## Licence

CC BY-NC 4.0. See `LICENSE` and `NOTICE.md`.
