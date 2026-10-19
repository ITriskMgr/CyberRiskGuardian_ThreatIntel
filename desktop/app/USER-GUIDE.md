# CyberRiskGuardian Desktop — User Guide

**CyberRiskGuardian with Threat Live-feed — standalone desktop edition, version 1.7.0 (beta) · Beta 1.7.x**

> **Beta 1.7.x.** This application is a beta for teaching, exploration and method validation. Treat
> every result as an initial analytical hypothesis and validate it before it supports a real decision.

© 2026 Marc-André Léger · CC BY-NC 4.0 — who may use it without asking, and whose situation needs a
commercial licence: section 10 or **Help → About → Licence**.

This guide covers installing the application, starting it, verifying that it can be trusted before
you rely on any number it produces, the method it follows in thirteen steps, and every screen of the
side menu — from the organization's documents to compliance, audit, security operations and the shared
Risk Registry. Every screen has a **?** button beside its title that opens a short help and links to its
section here.

---

## 1. What the standalone edition is

A single folder of files that runs entirely in your browser, served from your own computer. It brings
together, in one application, everything needed to run a scenario-driven cybersecurity risk
assessment from end to end and to keep it alive afterwards:

| Menu | What you get |
|---|---|
| **Organization** | Workspaces for real organizations and classroom cases; context documents read on your computer; the profile, risk appetite and crown jewels extracted from the documents with a provenance tag on every value; documents added and extracted at any time; information assets; maturity and resilience; reset. |
| **Risk assessment** | KRIs with history; existing safeguards; a scenario register, editor and batch builder (including scenario seeds from security operations); the verified risk calculator; the risk register; mitigation measures from ISO/IEC 27002, NIST and CIS; recommendations with an approval workflow. |
| **Threats & vulnerabilities** | MITRE ATT&CK, CAPEC and CWE offline; the CVE register with CISA KEV and FIRST EPSS; threat-context snapshots and the Threat Evidence Ladder; threat feeds triaged into a weekly briefing; and the **CyberRiskGuardian Ontology** (CRGO) — a library of risk scenarios linked to techniques, weaknesses, controls and Quebec Law 25 obligations, and the organisation, compliance and security-operations contexts. |
| **Governance** | Information security management; **ISP management** (policy library, structured editor, versions frozen at approval, applicability, acknowledgements, non-compliance); cybersecurity management (control testing, governance, decisions, incidents); frameworks and standards; **shared registers** of evidence, corrective actions, exceptions and mappings; and a **quality review**. |
| **Compliance management** | Sources and obligations, legal applicability, programmes and frameworks, qualified mappings, statements of applicability and requirements, campaigns and determinations backed by evidence, the regulatory calendar, submissions, regulatory change, AI-assisted assessment and reporting. |
| **Audit management** | Charter and methodology, audit universe, risk-weighted plan, engagements, SP 800-53A procedures, workpapers and sampling, observations and findings, responses and independent follow-up, reports, quality and independence, SOC reports and evidence, traceability. |
| **Security operations** | A local **SIEM** (telemetry sources, detection rules, coverage validated by tests, alerts and triage, indicators with TLP) and a local **SOAR** (cases, incidents, playbooks, approval gates, recorded actions, dry-run simulations, lessons learned) — fed by files you import, never by a live connector. |
| **Risk Registry** | A catalogue of risks shared between organizations, searchable by sector, region, size, regulation, theme, asset category and technique, with anonymized contributions and moderation. |
| **Tools · Settings · Help** | CVSS v4.0 (Base), budget, Excel export with live formulas, AI assistant, forecasts, backup and restore; settings (modules, logs, AI, users, files, feeds, simulation data for teaching); the step-by-step window, this guide, About, a help chatbot, English and French. |

Most features are modules an administrator can switch off for the installation (Settings → Modules),
and screens can be hidden per person or group (Settings → Users & RACI); a feature that is off or hidden
simply does not appear in the menu.

Three properties matter more than any feature.

**Your data stays on your computer, with exceptions you trigger yourself.** The application makes no
network request on its own — not on start, not when you add a document, build a snapshot, triage a
feed, calculate, forecast or export. The exceptions all start with a click of yours:

- The **download helper** fetches public catalogues (CISA KEV, FIRST EPSS, NVD, the feeds you
  accepted) *in full* into your feeds folder. It never sends your CVE list, your documents, your
  scenarios or your client's name anywhere; the join with your register happens afterwards, in the
  browser.
- **AI**, when you press *Send* in an AI preview: the text you were shown — and could edit — byte for
  byte, with its size and destination named, goes to the provider chosen for that workspace. Nothing
  is sent automatically, on a schedule or in the background, and no AI sits in the calculation path.
- The **Risk Registry** and **Publish & share** write packages to a shared folder only when you share,
  anonymized by default.

The **ontology** is read on your computer: through its own MCP server, started by the helper, or
through the snapshot shipped with the application. Neither sends anything anywhere.

**It does not reimplement the formulas.** `crg.js` and `cvss4.js` are the verified engine of the
CyberRiskGuardian method, checked against the reference calculator `crg_calc.py` and the Python `cvss`
package. Every number on every screen, and every cached value in the Excel export, comes from that
engine. AI, feeds, the ontology and the registry *propose*; only values you accept reach the engine.

**It proves itself on every start.** See section 4.

---

## 2. Before you install

| You need | Notes |
|---|---|
| A current browser | Chrome or Edge for the installable app. Safari and Firefox run it in a tab. |
| Python 3 | Only to serve the folder locally. macOS and most Linux distributions already have it. On Windows, install it from [python.org](https://www.python.org/downloads/) and tick **Add python.exe to PATH**. |
| About 16 MB of disk | Plus your workspaces and any snapshot you load. The bundled example snapshot is about 1.5 MB, the ontology snapshot about 6.5 MB and the simulation pack for teaching about 0.1 MB; a full threat snapshot from `threat_snapshot.py` is 8 MB or more. |
| *Optional:* the CyberRiskGuardian Ontology v0.10.0 | To query the ontology through its own MCP server rather than the snapshot shipped with the application: a `CyberRiskGuardian-Ontology` folder and a Python with the `mcp`, `pyoxigraph`, `rdflib` and `jsonschema` packages. Section 3.5. |

No account, licence key, installer or administrator rights are required. Nothing is written outside
the folder and your browser's own storage.

---

## 3. Install and start

### 3.1 Unpack

Unzip `CyberRiskGuardian_Desktop_v1.7.0-beta.zip` anywhere you can write. Keep the folder intact: the
application loads its own files by relative path.

> `INSTALL.md` in the folder is the same instructions on one page, **in English and in French**,
> including where your workspaces and keys actually live.

**Replacing an earlier copy of the application?** Unzip into a *new* folder beside the old one, stop
the old server if its terminal window is still open, and start the new one **on the same port** — your
workspaces are kept by the browser for the exact address you use, not in the folder, so the same port
finds them. Your API keys are not in the folder either; they are in `crg-keys.json` in the feeds
folder, and `feeds-dir.txt` carries that path over. The launchers detect an earlier copy still serving
the port, stop it and say so; reload the page once if **Help → About → Versions** does not read
`1.7.0 beta`.

### 3.2 Start it

> **The app must be served over `http://`. Double-clicking `index.html` does not work.**
>
> `js/app.js` is an ES module, and every browser blocks modules loaded from a `file://` URL. The
> page will appear, but the engine self-check never runs and the footer stays on `engine loading…`.
>
> Serving is entirely local. The launchers bind to `127.0.0.1`, so the app is not reachable from
> your network even while it is running.

**macOS and Linux** — double-click **`start.command`**. If macOS refuses to open it, right-click
the file and choose **Open**, then **Open** again. If it opens as a text file instead of running:

```bash
cd /path/to/CyberRiskGuardian_Desktop
chmod +x start.command start.sh
```

**Windows** — double-click **`start.bat`**.

A terminal window opens and your browser opens on the app. **Leave the terminal open while you
work**; Control-C stops it. By hand:

```bash
cd CyberRiskGuardian_Desktop
python3 serve.py 8099          # or: python3 -m http.server 8099 --bind 127.0.0.1 (no download helper)
```

Then open `http://localhost:8099/`.

> **Keep the same port.** Your workspaces are stored by the browser for the exact address you use.
> `http://127.0.0.1:8099` and `http://localhost:8099` are different addresses to the browser, and
> so is any other port. Use the launcher, or always the same address, and you will always find your
> workspaces.

### 3.3 Stopping it

Press **Control-C** in the terminal window. Closing the browser does not stop the server, and
stopping the server does not close an installed app — an installed app keeps working from its cache
with no server at all.

To confirm nothing is still listening, on macOS or Linux: `lsof -ti:8099` (no output means nothing
is running). On Windows: `netstat -ano | findstr :8099`, then `taskkill /PID <pid> /F`.

### 3.4 Install it as a desktop application (recommended)

With the app open over `http://`, in **Chrome** click the install icon at the right of the address
bar; in **Edge**, ☰ → **Apps** → **Install this site as an app**. You get a windowed application
with its own icon that launches without a terminal and works offline. After replacing the folder
with a newer version, serve it once more so the installed app picks up the new cache.

### 3.5 Connect the ontology (optional)

The application ships with a snapshot of the CyberRiskGuardian Ontology and works without anything
more. To query the ontology through its own MCP server — the reference ranking, the organisation
context, write-back, and the compliance and security-operations contexts — the helper needs to find
**CRGO v0.10.0**:

1. **If the `crgo-ontology` server is registered in Claude on this computer** (Claude desktop →
   Settings → Developer → Edit Config), the helper reuses the same command, with the same Python. Point
   its `args` at the `pipeline/mcp/crgo_server.py` of a v0.10.0 clone.
2. **If a `CyberRiskGuardian-Ontology` folder sits near the application folder** — for example both
   inside `CyberRiskGuardian_ThreatIntel` — it is found automatically and started with the Python that
   runs the helper. Versioned clones such as `CyberRiskGuardian-Ontology-0.10.0` are preferred, **newest
   first**. That Python needs `pip install "mcp>=1.2" pyoxigraph rdflib jsonschema`.
3. **Otherwise**, give the Python interpreter and the path of `pipeline/mcp/crgo_server.py` in
   **Ontology · CRGO → Connection → Where the ontology is**, then **Save**.

```
git clone --branch v0.10.0 https://github.com/ITriskMgr/CyberRiskGuardian-Ontology.git CyberRiskGuardian-Ontology-0.10.0
pip install "mcp>=1.2" pyoxigraph rdflib jsonschema
```

**Ontology · CRGO → Connection** shows which of the three applies, the CRGO release found and which
contracts it supports: scenario identification works with any release, the organisation link (dss/v1)
needs v0.9.1 or later, and the compliance and security-operations contexts (compliance/v1, secops/v1)
need v0.10.0. It starts the server on request; the first start builds its store, about ten to twenty
seconds. Section 7.4.5.

---

## 4. First run: verify the engine before trusting a number

The bottom of the left sidebar must read:

```
engine verified · 84,491 / 41,104
```

On every start the app recomputes the bundled MediBec teaching case — 30 scenarios — and compares
the totals with the figures `crg_calc.py` produces. When they match, the engine in your browser
agrees with the reference implementation.

| Footer reads | Meaning | What to do |
|---|---|---|
| `engine verified · 84,491 / 41,104` | Correct. | Proceed. |
| `engine loading…` and it stays there | Opened as a file instead of served. | Section 3.2. |
| `engine missing` | `crg.js`, `cvss4.js` or `sample.js` did not load. | Re-unzip; keep the folder intact. |
| `engine DIVERGES` + red banner | The engine disagrees with the reference. | **Do not rely on any number.** Restore a clean copy. |
| `engine error` | An exception during the self-check. | Open the console (section 13) and report it. |

---

## 5. Workspaces and your data

A **workspace** holds one organization or one business case: its profile, documents, scenarios,
initiatives, threat and vulnerability links, snapshot, KRI history, decisions and revision log. The
selector at the top of every screen switches between them; its last entry creates a new one.

The first start creates **MediBec — teaching case (fictional)**, the complete 30-scenario example.
Use it to learn the screens; create your own workspace for real work. A workspace is either a **real
organization** or a **classroom business case**; the MediBec example and classroom cases are *teaching
cases*, which can be started over (section 7.2.4).

Workspaces are saved automatically in the browser's local database (IndexedDB) on this computer —
the time of the last save is shown top right. They are not shared with other browsers or computers.
**Export a workspace** (Organization → Workspaces, or Export) to back it up, move it, or hand in a
classroom case; import it on any computer under Organization → Workspaces → *Import a JSON file*.
Clearing the browser's site data for the app's address deletes the workspaces on that computer.

> Confidential material stays on this computer, but it is still confidential material on this
> computer. Follow your organization's rules for where assessment data may be kept.

### 5.1 Data versions: what you enter survives upgrades

Every workspace records the **data version** it was saved in, the application version that last saved
it, and a **migration journal**. The installation's own records (preferences, users, settings) and every
backup file carry a data version too. When the way data is stored changes, one **migration step** is
added; nothing else in the application rewrites older data.

- **At start-up, on import of a workspace file and on restore**, each workspace is brought to the
  current data version **on a copy**, step by step. Numbers are never recomputed or rescaled: the
  parameters, reductions, KRIs and decisions are carried as they are, and the engine self-check runs on
  the result.
- **The original is kept** on this computer. *Backup & restore → Data versions and migrations →
  Download the copy from before the migration* gives it back as a workspace file, to compare or to open
  with the application that wrote it.
- **A step that fails leaves the stored workspace untouched**: it opens read-only, and the same screen says
  why.
- **A workspace written by a newer application is never converted backwards.** It opens read-only, with a
  banner on every screen, and nothing you change is saved over it. A backup file is refused when it was
  written by a newer application, and a newer workspace inside a backup is not restored.

The current data version is **2**. The two steps are journalled in each workspace:

| Step | What it does |
|---|---|
| 0 → 1 | Fields created only when a screen first used them are present from the start; incidents imported from documents move to the incident register (Cybersecurity management → Incidents) and remain listed under Organization → Evidence; policy exceptions gain a scope, an approver and compensating controls; the governance, audit, cybersecurity-management, ISMS and ontology-link records are added, empty. |
| 1 → 2 | The **shared registers** are created. **Evidence** records move, unchanged, to the shared evidence register (Governance → Shared registers → Evidence); **policy exceptions** move, unchanged, to the shared exception register, each linked to its policy. Policy statements receive a stable identifier, their modality left to be stated. Empty compliance-management, audit-management, SIEM and SOAR records are added. |

---

## 6. The method in thirteen steps

**Process**, the first item of the menu, lists the thirteen steps of a complete assessment with their
status in the current workspace (*to do*, *in progress*, *done*), recommends the next one and opens the
right screen in one click. Each step says what it is for, what it needs and when it is done; a step with
several requirements lists each one with its own state and the screen that fixes it; *Tips* expand under
it. **Print the checklist** gives a list to tick that names, for each step and each guideline, where it
happens. In multi-user mode each step also shows who is Responsible and Accountable.

| # | Step | Done when | Screens |
|---|---|---|---|
| 1 | Set up the workspace | The workspace has an organization name and at least one context document. | Workspaces, Context documents |
| 2 | Describe the context and risk appetite | At least 8 of the 12 context fields are filled, the appetite has a rationale and the IT budget is entered. | Profile & appetite, Existing safeguards, Maturity & resilience |
| 3 | Identify crown jewels and information assets | At least 3 crown jewels or 5 information assets, with owners and classification. | Crown jewels, Information assets |
| 4 | Import other information from the documents | Every target ticked in the import plan has been reviewed at least once. | Import from documents, Context documents |
| 5 | Gather threats and vulnerabilities | A threat-context snapshot is loaded and the vulnerability register holds the organization’s exposed CVEs. | Threats · ATT&CK, Vulnerabilities · CVE/CWE, Threat feeds & social, Threat context |
| 6 | Develop risk scenarios | At least 10 scenarios in the register (20 candidates, the 10 most material kept). | Batch scenarios, Scenario register, Scenario editor, Suggest vulnerability links |
| 7 | Quantify each scenario | 80% of the parameters of the included scenarios carry a rationale. | Scenario editor, CVSS v4.0, Forecasts |
| 8 | Evaluate against tolerance | The included scenarios compute without error and each has a management decision recorded. | Risk calculator, KRI dashboard, Risk register |
| 9 | Select mitigation measures | Every scenario above tolerance is covered by at least one measure. | Risk mitigation |
| 10 | Recommend and approve | At least one recommendation is approved and every risk has a treatment decision. | Recommendations, Risk register |
| 11 | Align the budget | The budget year is filled and the initiatives are allocated. | Budget |
| 12 | Monitor with KRIs | At least one measurement is recorded. | KRI dashboard, Forecasts |
| 13 | Report, demonstrate compliance and share | A compliance framework is assessed, and a security policy is published or risks have been shared. | Export · Excel, Compliance management, ISP management, Frameworks & standards, Risk Registry, Publish & share |

**Guidelines that make the assessment simpler** — each is detailed in the next section, with the screens, the steps and when it is done; the same text is on the Process page (open a guideline), in the Step by step window and in the printable checklist.

1. **Start from the documents.** Create the workspace with all the case documents and let “Extract from documents” propose the profile and the crown jewels. Accept, edit or reject each value, then Save.
2. **Resolve the UNKNOWN values first.** Extracted values are tagged FACT, INFERENCE, ASSUMPTION, EXTERNAL or UNKNOWN. UNKNOWN items are the information still to collect; ASSUMPTION and EXTERNAL values need validation by the organization.
3. **Generate 20, keep 10.** In Batch scenarios generate about 20 candidates (rules or AI), review them in the grid, and keep the 10 most material in the register. Ten is where to start; the number rises with the organization’s maturity.
4. **Look in the ontology before writing from scratch.** The CyberRiskGuardian Ontology holds scenarios already linked to ATT&CK, weaknesses, controls and Quebec Law 25 obligations. Ask it for the scenarios that fit the organization, keep the relevant ones, and write the rest yourself.
5. **Write causal chains, not threat names.** Threat source → weakness → asset → event → consequence. “Ransomware” alone is not a scenario. AI can draft the chain; you accept it field by field.
6. **Record what already protects you, then measure the resilience it adds up to.** An assessment with no record of existing controls has to guess at θ. Inventory what is in force, score it against the six capabilities θ is defined as, and let the two instruments disagree in the open.
7. **Be honest about confidence.** Give every parameter a rationale and a confidence level; Forecasts turns low confidence into wider ranges.
8. **Let the engine calculate.** Residual risk and the ratio come from the verified engine; AI and feeds propose, they never change a score.
9. **Treat what is above tolerance first.** Use Risk mitigation → Proposals on the scenarios above tolerance; shared measures are counted once.
10. **Get approvals from the accountable person.** Recommendations and risk acceptances are approved by the person who is Accountable (RACI “A”).
11. **Keep a baseline and a budget.** Enter the IT budget, the current cybersecurity spend and the baseline (run) cost; the Budget screen shows where each option lands.
12. **Record KRIs at every review.** Four readings are enough for the KRI projection to say whether a threshold will be crossed.
13. **Anonymize what leaves.** The Risk Registry and Publish & share anonymize by default; a classroom case is labelled fictional automatically.
14. **Learn from organizations like yours, and give back.** The Risk Registry gathers risk cards contributed by other organizations, catalogued by sector, region, size, regulation, theme, asset category and technique. Read it before you finish your scenarios; contribute your own, anonymized.
15. **Keep the policies alive.** A policy that is never reviewed stops describing what the organization does. Write the policies from the templates, have them approved, publish them, review them on schedule, and record every departure from them.
16. **Assess compliance with evidence.** A compliance status is a claim; the evidence is what makes it true. Record the requirements that apply, let rules or AI propose a status from the evidence, accept what you can stand behind, and report.
17. **Know which laws apply — and say what is not known.** Describe the organization in the ontology’s terms and let CRGO’s evaluator say which instruments apply. "Potentially applicable" needs a qualified person; "unknown" means a fact is missing — an evidence gap, never "not applicable". None of it is legal advice.
18. **Test controls independently, and keep conflicts in view.** A control is as good as the evidence that it works. Record tests by line of defence and aspect; when an independent result contradicts management’s self-assessment, both stay visible until a person resolves it.
19. **Audit against criteria and follow up independently.** An audit finding states the criterion, the condition, the cause and the effect, with evidence. It closes only after an independent follow-up has verified the corrective action.
20. **Decide under authority, and keep exceptions honest.** Accepting a risk, funding a treatment or granting a policy exception is a management decision, made by a named person under a delegation valid on that date. The application drafts; people decide. An exception never waives a law and stops mitigating when it expires.
21. **Read the ontology’s context, write back proposals only.** Through the dss/v1 contract the ontology returns the organisation’s context for a scenario — obligations, applicability, control evidence by line, open findings — and records this application’s results as proposals. It never computes a risk, and a write-back is never an approval.
22. **Run the quality review before anything leaves.** Before a report or a write-back, check that nothing is called approved, compliant or likely without a person, evidence or the right kind of data behind it.

### Guidelines in detail — a complete assessment, simply

Labels between quotation marks are the exact names of the buttons, tabs and options on the screens; they are checked against the application at every build (`tools/label_check.py`).

#### 1. Start from the documents

Create the workspace with all the case documents and let “Extract from documents” propose the profile and the crown jewels. Accept, edit or reject each value, then Save.

*Where:* Organization → Workspaces → New workspace; Organization → Import from documents

1. Type the workspace name; choose “Real organization” or “Classroom business case”; for teaching tick “Educational case used for training purposes”.
2. Drop all the case documents (Word, PDF, Excel, PowerPoint, text) on the document zone.
3. Tick “Extract the profile & appetite from these documents after creation”, “Then extract the crown jewels” and, to go further, “Then import more from the documents”; click “Create workspace”.
4. Choose “Use AI (preview before sending)” — you see the exact text before anything is sent — or “Rules only (no AI, offline)”.
5. In the review, edit any value, tick those to keep and click “Put ticked values in the form”; check the fields and click “Save”.
6. Review the crown jewels and click “Add ticked crown jewels”.
7. In the preview, edit the payload if needed — remove what should not leave, add context — and choose the creativity of the answer: “Strict” keeps to documented facts, “Creative” also proposes what an organization like this usually has, tagged ASSUMPTION for you to check.
8. Then open Organization → “Import from documents” (Process step 4): tick the targets (information assets, BIA, third parties, existing controls, compliance, incidents, weaknesses, candidate scenarios, parameter evidence, risks, budget, KRIs, people and roles, classroom), click “Start the import”, and for each target tick and click “Add ticked”.
9. New documents later: drop them on “Import from documents”. They are selected on their own, so only they are read; tick what to extract and click “Start the import”. Existing values are kept unless you tick the proposal that replaces them.

*Done when:* Process steps 1 to 4 show Done: a name and at least one document; at least 8 of the 12 context fields, an appetite rationale and the IT budget; the crown jewels; every target of the import plan reviewed.

#### 2. Resolve the UNKNOWN values first

Extracted values are tagged FACT, INFERENCE, ASSUMPTION, EXTERNAL or UNKNOWN. UNKNOWN items are the information still to collect; ASSUMPTION and EXTERNAL values need validation by the organization.

*Where:* Organization → Profile & appetite (and Evidence for imported records)

1. Read the coloured tag beside each field label.
2. UNKNOWN: collect the information, enter it and click “Save”.
3. ASSUMPTION and EXTERNAL: have them validated by the organization; hover the tag to see the source (document or web page). An asterisk after the tag means the value was edited after extraction.
4. When management has not approved an appetite, use the “Appetite estimator” at the bottom of the tab; its result is labelled an analytical estimate.

*Done when:* No UNKNOWN tag left on the fields the assessment relies on.

#### 3. Generate 20, keep 10

In Batch scenarios generate about 20 candidates (rules or AI), review them in the grid, and keep the 10 most material in the register. Ten is where to start; the number rises with the organization’s maturity.

*Where:* Batch scenarios

1. Rules: on “Threat patterns × assets” tick the patterns, then “Tick crown jewels + 5 most critical”, choose the threat sources, set “Number of candidates” to 20 and click “Generate candidates”. Keep “Vary the patterns and assets” ticked so the candidates spread across the grid instead of repeating one threat; “Reshuffle” draws a different set and the seed reproduces it.
2. AI: on “Propose with AI” set the number, add a direction if useful, keep “Include the text of the context documents” ticked and click “Propose candidates” (preview first).
3. Also available: “From MITRE ATT&CK”, “From CVE”, “From CWE”, and the candidate scenarios imported from the documents (marked [Docs]).
4. In the grid, edit names, statements and parameters, tick the 10 most material and click “Add … selected to the register”. Ten is the recommended starting number, not a ceiling: carry more as the organization’s cybersecurity maturity grows and it can keep more scenarios current — Maturity & resilience suggests a number from the level you measured, and says why.
5. In the Scenario register, the checkboxes include or exclude scenarios from the totals.

*Done when:* Process step 6 shows Done: at least 10 scenarios in the register.

#### 4. Look in the ontology before writing from scratch

The CyberRiskGuardian Ontology holds scenarios already linked to ATT&CK, weaknesses, controls and Quebec Law 25 obligations. Ask it for the scenarios that fit the organization, keep the relevant ones, and write the rest yourself.

*Where:* Ontology · CRGO → Suggest scenarios; Batch scenarios; Scenario editor

1. Ontology · CRGO → “Suggest scenarios”: check the sector, the ATT&CK techniques and the keywords taken from the workspace, tick the asset categories present and the themes of concern, then click “Suggest scenarios”.
2. Read “Theme gaps”: themes with no scenario in the ontology are the ones to write yourself.
3. Tick the suggestions that fit, keep “Use the ontology’s priors as starting values” if you want a calibrated starting point, and click “Add ticked to Batch scenarios”; review and keep them in the grid like any other candidate.
4. For a scenario you wrote yourself: Scenario editor → “Find similar ontology scenarios” to link it, and “Controls for its techniques” for a starting list of controls.
5. Ontology priors are not organizational evidence: re-estimate every parameter with the organization. The Connection tab says whether the answer came from the ontology’s server or from the snapshot shipped with the application.

*Done when:* The register covers the ontology’s relevant themes, and the scenarios taken from it are re-estimated for this organization.

#### 5. Write causal chains, not threat names

Threat source → weakness → asset → event → consequence. “Ransomware” alone is not a scenario. AI can draft the chain; you accept it field by field.

*Where:* Scenario editor → Causal chain

1. Write the statement in one or two sentences: threat source → weakness → asset → event → consequence.
2. Or let AI draft it: in the Causal chain card click “Draft it with AI…”, read the preview of exactly what would be sent, and send it. One scenario at a time — a chain is an argument about this organization, not a batch job.
3. In the review, every proposed field is shown beside what the scenario holds now. Fields that are empty are ticked for you; a field that would replace existing text is left unticked and says so. Edit any draft in place, then click “Apply the ticked fields” — nothing is written until you do, and what you accept is recorded in the revision log.
4. Fill or check the threat source, initiating event, vulnerabilities or predisposing conditions, assets, processes, existing controls, sequence and consequences.
5. Link ATT&CK techniques, CWE and CVE; “Suggest vulnerabilities for this scenario…” opens Vulnerabilities → Suggest links for that scenario.

*Done when:* Every scenario in the register reads as a complete causal chain.

#### 6. Record what already protects you, then measure the resilience it adds up to

An assessment with no record of existing controls has to guess at θ. Inventory what is in force, score it against the six capabilities θ is defined as, and let the two instruments disagree in the open.

*Where:* Existing safeguards; Maturity & resilience

1. Existing safeguards → “Add a safeguard”: name it, set the state, name an accountable owner, and state the scope and what it does not cover.
2. Under “Contribution to resilience”, score the safeguard against each capability. A safeguard marked “Planned” counts for nothing until it operates.
3. Record when it was last tested with the result; no evidence for twelve months is reported as stale.
4. If your existing controls are still in the mitigation plan, “Bring controls over” lists them and “Bring the ticked ones into the inventory” moves the ones you tick.
5. Existing safeguards → “Resilience coverage” shows where the resilience comes from and proposes a θ. Nothing changes until you apply it to a scenario.
6. Maturity & resilience → “Maturity (CSF 2.0)”: score the categories that matter, against a target. Leave a category blank rather than guessing it. “Fill the unscored ones from the inventory” proposes a level where safeguards point at a CSF category.
7. Maturity & resilience → “Resilience (θ)”: answer the eighteen questions. “Unknown” is a real answer and is excluded from the score.
8. Maturity & resilience → “The two readings”: read the gap between the questionnaire and the inventory. The lower θ is offered; apply it per scenario.
9. “Record it” keeps a dated entry so the next assessment can be compared with this one.

*Done when:* The inventory covers what is in force, and a θ on each material scenario comes from the assessment rather than from memory.

#### 7. Be honest about confidence

Give every parameter a rationale and a confidence level; Forecasts turns low confidence into wider ranges.

*Where:* Scenario editor → the six parameters; Forecasts

1. For each of the six parameters give the value, a rationale, the evidence and a confidence (High, Medium, Low). Evidence imported from the documents is added to these fields, never as a number.
2. Forecasts → “Parameter ranges” → “Propose ranges where none are set” (Low ±0.15, Medium ±0.10, High ±0.05), then “Monte Carlo” → “Run forecast”.
3. Optional: AI assistant → “Parameter critique” points out confidence the evidence does not support.

*Done when:* Process step 7 shows Done: 80% of the parameters of the included scenarios carry a rationale.

#### 8. Let the engine calculate

Residual risk and the ratio come from the verified engine; AI and feeds propose, they never change a score.

*Where:* Risk calculator; footer

1. Check the footer reads “engine verified · 84,491 / 41,104” at every start.
2. Read estimated, tolerated, mitigated and residual risk, the ratio and its band in the Risk calculator.
3. Only accepted proposals change a value; Threat context → “Proposed Pb(ψ,A) changes” is the only path from threat intelligence to a score, for exposed CVEs only.

*Done when:* The figures you report come from the Risk calculator.

#### 9. Treat what is above tolerance first

Use Risk mitigation → Proposals on the scenarios above tolerance; shared measures are counted once.

*Where:* Recommendations → Treatment need; Risk mitigation

1. Recommendations → “Treatment need”: the verdict against tolerance and a treatment objective per scenario.
2. Risk mitigation → “Proposals”: tick the scenarios above tolerance and click “Add ticked proposals to the plan” (or pick controls in “Control catalogue”). Existing controls imported from the documents are already there as implemented, with zero reductions until you set them.
3. “Mitigation plan”: set cost and likelihood / impact reductions; tick the measures to implement and click “→ New draft recommendation”.
4. A measure covering several scenarios is costed once — see Recommendations → “Shared controls”.

*Done when:* Process step 9 shows Done: every scenario above tolerance has at least one measure.

#### 10. Get approvals from the accountable person

Recommendations and risk acceptances are approved by the person who is Accountable (RACI “A”).

*Where:* Recommendations → Recommendations; Risk register

1. Recommendations → “Recommendations”: move the draft through Draft → In review → Approved, with the approver and a note; approval freezes the figures.
2. Risk register → the risk → “Formal acceptance” (“Accepted by”, “Rationale, conditions, approval reference”).
3. In multi-user mode (Settings → “Users & RACI”) only A on step 10, or an administrator, approves and accepts; approving a measure needs A on step 9. “Menu access by group and user account” can further restrict or open screens. “Switch user” is in the top bar.

*Done when:* Process step 10 shows Done: at least one recommendation approved and every risk has a treatment decision.

#### 11. Keep a baseline and a budget

Enter the IT budget, the current cybersecurity spend and the baseline (run) cost; the Budget screen shows where each option lands.

*Where:* Organization → Profile & appetite (bottom); Budget

1. Enter “Total IT budget (incl. salaries)”, “Cybersecurity budget (current spend)” and “Baseline (run) security cost”, then “Save”.
2. Budget: fill the budget year and allocate the initiatives over up to three years; projects imported from the documents are already listed as initiatives.
3. The band chart places each funding option between risk-averse (4% of IT), neutral (7.8%) and risk-seeking (12%).

*Done when:* Process step 11 shows Done: the budget year is filled and the initiatives are allocated.

#### 12. Record KRIs at every review

Four readings are enough for the KRI projection to say whether a threshold will be crossed.

*Where:* KRI dashboard; Forecasts → KRI projections

1. KRI dashboard: “Record a measurement”, or “Record computed + entered values” to capture everything at once. Metrics imported from the documents are the first reading.
2. Forecasts → “KRI projections”: from 4 readings, the trend with a 95% band and whether a threshold will be crossed.

*Done when:* Process step 12 shows Done: at least one measurement recorded.

#### 13. Anonymize what leaves

The Risk Registry and Publish & share anonymize by default; a classroom case is labelled fictional automatically.

*Where:* Risk Registry → Contribute risks; Publish & share → Publish a package; Settings → AI — local & remote

1. Risk Registry → “Contribute risks”: anonymization is on by default; switching it off asks for a confirmation and the cards say they are not anonymized.
2. Publish & share → “Publish a package”: choose the scope and format, tick “Anonymize this package”, read “Check these before publishing”, then “Publish to the shared registry”.
3. Classroom and educational cases are labelled fictional in the exports and the workbook.
4. For AI: Settings → AI — local & remote → “Anonymize before sending”, or “Apply the anonymizer” in the preview of a single request — where you can also edit the payload before it leaves.

*Done when:* Nothing identifying leaves the computer without a decision.

#### 14. Learn from organizations like yours, and give back

The Risk Registry gathers risk cards contributed by other organizations, catalogued by sector, region, size, regulation, theme, asset category and technique. Read it before you finish your scenarios; contribute your own, anonymized.

*Where:* Risk Registry → Browse & search; Contribute risks; Moderation

1. Risk Registry → “Registry settings”: set the shared registry folder (a folder synced with Drive, OneDrive or SharePoint) and a contributor alias, then “Save”.
2. “Browse & search” → “Read the shared folder”, then “Organizations like mine” to filter on your sector and country; tick “Moderated cards only” for the curated catalogue.
3. Tick the cards that apply and click “Use ticked cards in this workspace”: they go to Batch scenarios, where every value is re-estimated for this organization.
4. To contribute (administrator, or RACI “A” on step 13): “Contribute risks” → tick scenarios, check the catalogue, keep “Anonymize before sharing (on by default)” ticked, read the preview and click “Share to the registry”.
5. A moderator approves or rejects new cards under “Moderation” and publishes the curated package.

*Done when:* The scenarios reflect what peers have seen, and what you share leaves anonymized.

#### 15. Keep the policies alive

A policy that is never reviewed stops describing what the organization does. Write the policies from the templates, have them approved, publish them, review them on schedule, and record every departure from them.

*Where:* ISP management → Policy library; Policy editor; Versions & approvals; Non-compliance

1. ISP management → Policy library → “Create from the template” (or “Draft it with AI…”, or “Create the whole policy set as drafts”).
2. Policy editor: adapt the statements and their controls, name the owner and the approver, then “Submit for review”, “Approve” (RACI “A” on step 13 or an administrator) and “Publish”.
3. A published policy is frozen: “Start a new version” opens a draft and keeps the published text in the history.
4. Non-compliance → “Record”: every departure found by an audit, an incident or monitoring, with its severity, owner, corrective action and due date; an accepted departure becomes an exception with an expiry date and the name of whoever accepts the risk. “Make it a risk” adds it to the risk register.
5. “Versions & approvals” lists what waits for approval and what is due for review.

*Done when:* Every policy in force is published, within its review date, and every open departure has an owner and a date.

#### 16. Assess compliance with evidence

A compliance status is a claim; the evidence is what makes it true. Record the requirements that apply, let rules or AI propose a status from the evidence, accept what you can stand behind, and report.

*Where:* Compliance → Requirements; AI-assisted assessment; Reporting

1. Compliance → “Frameworks & checklists”: choose the frameworks followed and fill the statement of applicability.
2. “Requirements”: add your own — laws, contracts, standards — or “Add the Law 25 and R-22.1 obligations” from the ontology and “Add the published policy statements”.
3. “AI-assisted assessment”: choose the scope, the method — Rules (offline) or AI (preview first) — and click “Propose”; edit the evidence and click “Apply the ticked proposals”.
4. “Reporting”: “Record a snapshot” at each review, then “Full compliance report (.md)” or “Printable report”.

*Done when:* Every applicable requirement has a status and the evidence behind it, and the report is filed.

#### 17. Know which laws apply — and say what is not known

Describe the organization in the ontology’s terms and let CRGO’s evaluator say which instruments apply. "Potentially applicable" needs a qualified person; "unknown" means a fact is missing — an evidence gap, never "not applicable". None of it is legal advice.

*Where:* Compliance → Legal applicability; Determinations

1. Compliance → “Legal applicability”: tick the organisation type, where it is established, offers services or monitors behaviour, add its processing activities with their data categories, and tick what the profile lists completely.
2. “Evaluate in the browser” (or “Evaluate with CRGO (helper)”): read the unresolved conditions of every unknown instrument and collect the missing facts.
3. “Determinations”: record compliance with each provision with its evidence, or the evidence gap. A control that supports an obligation is not compliance.

*Done when:* Every instrument is applicable, not applicable, or flagged for qualified review or as an evidence gap, and every provision the scenarios touch has a determination.

#### 18. Test controls independently, and keep conflicts in view

A control is as good as the evidence that it works. Record tests by line of defence and aspect; when an independent result contradicts management’s self-assessment, both stay visible until a person resolves it.

*Where:* Cybersecurity management → Control testing; Scenario editor

1. Cybersecurity management → “Control testing” → “Add”: the control tested, the date, the assessor line, the aspect (design, implementation, operation) and the result; for operating effectiveness, the period, population, sample and deviations.
2. “Control evidence by line of defence” shows the latest result of each line, the open findings and the conflicts.
3. In the scenario editor, “Organisation context and control evidence” shows the same evidence for the scenario’s controls: use it in the rationale of θ and of the reductions.

*Done when:* The controls the scenarios count on have been tested by an independent line, and no conflict is left unresolved.

#### 19. Audit against criteria and follow up independently

An audit finding states the criterion, the condition, the cause and the effect, with evidence. It closes only after an independent follow-up has verified the corrective action.

*Where:* Audit management → Engagements; Programmes · SP 800-53A; Findings; SOC reports & evidence

1. Audit management → “Programmes · SP 800-53A”: look up the assessment objectives of a control, or “Plan an engagement with this programme” (the programmes are illustrative).
2. “Procedures · SP 800-53A” and “Workpapers & sampling”: load or write the procedures, record their results, sample and deviations, and “Record an observation” where an exception was found; validate it as a finding in “Observations & findings”.
3. “Findings”: complete criterion, condition, cause, effect and significance, the management response and the corrective action; close only with an independent follow-up.
4. “SOC reports & evidence”: record the assurance reports of service organizations with their exceptions and CUECs, and the evidence register with validity dates.

*Done when:* Every finding has an owner, a due date and a response, and closed findings were verified independently.

#### 20. Decide under authority, and keep exceptions honest

Accepting a risk, funding a treatment or granting a policy exception is a management decision, made by a named person under a delegation valid on that date. The application drafts; people decide. An exception never waives a law and stops mitigating when it expires.

*Where:* Cybersecurity management → Governance; Decisions; Information security management → Policy exceptions

1. Cybersecurity management → “Governance”: the governing bodies, the roles by line, and the delegations of authority with their scope and dates.
2. “Decisions” → “Draft decision records for scenarios above tolerance”, then let the decision maker record the outcome under a valid delegation.
3. Information security management → “Policy exceptions”: scope, approver, compensating controls, expiry, and the scenarios that count on each one.

*Done when:* Every risk above tolerance has a decision record made by a person with valid authority, and no scenario counts on an expired exception.

#### 21. Read the ontology’s context, write back proposals only

Through the dss/v1 contract the ontology returns the organisation’s context for a scenario — obligations, applicability, control evidence by line, open findings — and records this application’s results as proposals. It never computes a risk, and a write-back is never an approval.

*Where:* Ontology · CRGO → Organisation link; Connection

1. Ontology · CRGO → “Connection”: the server must be CRGO v0.9.1 or later.
2. “Organisation link”: set the organisation base (never https://w3id.org/crgo/) and the confidential folder, then “Build the organisation graph”; the totals must equal this application’s.
3. “Read the context” for a scenario, then tick scenarios and quantities and “Send the ticked results as proposals”. A refusal is shown as it came; correct the cause rather than altering the data.

*Done when:* The results the organisation wants recorded are in its proposed graph, with model version, inputs and input hash.

#### 22. Run the quality review before anything leaves

Before a report or a write-back, check that nothing is called approved, compliant or likely without a person, evidence or the right kind of data behind it.

*Where:* Governance → Quality review

1. Governance → “Quality review”: read every failed check and open the screen that fixes it.

*Done when:* No check fails, and the ones needing attention are explained in the report.

---

## 7. The screens, menu by menu

The side menu has twelve sections, in this order: **Start · Organization · Risk assessment · Threats &
vulnerabilities · Governance · Compliance management · Audit management · Security operations · Risk
Registry · Tools · Settings · Help**. This chapter follows it screen by screen.

**Finding your way in the menu.**

- **Sections and sub-menus open and close.** Click a section title to fold it; a folded section shows
  how many screens it holds. A screen with several tabs (ISP management, SIEM, SOAR, Settings…) opens as a
  sub-menu of its tabs. What you open and close is remembered on this computer.
- **Rail mode.** The **«** button beside the application name folds the whole menu into a narrow rail of
  section icons; a section's screens then open in a flyout. **»** brings the full menu back.
- **Narrow screens.** On a phone-sized window the menu becomes a drawer, opened with **☰** in the top bar.
- **What is not there.** A feature switched off in **Settings → Modules**, or hidden from you in
  **Settings → Users & RACI → Menu access**, is left out of the menu, and a section or sub-menu left empty
  disappears with it. Its data is not deleted.
- **Badges** beside some entries count what the screen holds (scenarios, measures, snapshots…).

**Help on every screen.** Under each screen title a one-line description says what the screen is for;
the **?** beside the title opens a short help — the rules that apply to that screen — with **Open this
section of the user guide**, which opens this guide at the matching section in its own window.

### 7.1 Start — Process {#process}

Section 6. The step cards with their status in the workspace, the next recommended step, the guidelines
in detail and the printable checklist. The banner at the top recalls that the application is a beta and
that every result is an analytical hypothesis to validate.

### 7.2 Organization

What you set up once and come back to: the organization profile (with its documents and Import from
documents), information assets, maturity and resilience, and resetting data.

### 7.2.1 Organization profile {#org}

The **Organization profile** screen has six tabs: *Profile & appetite*, *Crown jewels*, *Context documents*,
*Import from documents*, *Evidence* and *Workspaces* (plus *Classroom* for a classroom case).

**Workspaces — assessing a new or different organization.** Give the workspace a name, choose *Real
organization* or *Classroom business case*, and start from a blank assessment, a copy of the MediBec
example, a copy of the current workspace, or an imported file (a workspace export, or any assessment
JSON that `crg_calc.py` accepts). Tick **Educational case used for training purposes** to mark a
teaching case; the workspace becomes a classroom case and every deliverable says the case is fictional.

The New-workspace form has its own drop zone: drop or choose several Word (.docx) or PDF files at once
— the business case, the company profile, an audit report, the incident history; Excel, PowerPoint and
text files are accepted too. Remove any you added by mistake. Three options chain the extractions right
after creation: *Extract the profile & appetite from these documents after creation*, *Then extract the
crown jewels*, and *Then import more from the documents*, which opens **Import from documents**
(below). Click **Create workspace**: each file is read on your computer with a progress line
(words found, *little text found*, or an error).

**Profile & appetite.** Context, mission, products and services, critical processes and systems,
cloud, suppliers, sensitive information, availability requirements, controls and maturity, incident
history and the legal and regulatory obligations. Below them: the **risk appetite** with its rationale,
the multiplication factor and currency, and the **IT budget**, current cybersecurity spend and baseline
run cost used by the Budget screen. When management has not approved an appetite, the *appetite
estimator* suggests one from ticked factors — labelled an analytical estimate, to be validated.

*Cybersecurity budget (current spend)* is everything spent on cybersecurity this year: staff, tools,
services, projects. *Baseline (run) security cost* is the part of that spend needed just to keep
existing security running — salaries of the current security staff, licence renewals, existing
managed services, maintenance. It covers no new treatment.

**Save and Cancel.** Edits in Profile & appetite are a draft: the bar at the top says *Unsaved
changes* until you click **Save**; **Cancel** puts back the saved values. Leaving the tab or the screen
with unsaved changes asks first.

**Extract from documents.** The button in the same bar proposes every field of the profile from the
context documents. Choose:

- **Use AI (preview before sending)** — you see the payload before anything is sent and can edit it,
  and you choose the **creativity** of the answer (section 8.2). With the **Claude** provider you can
  tick *Search the web for missing information*: items the documents do not give are looked up and
  tagged **EXTERNAL** with the page cited. With a **local model**, missing items can only be tagged
  ASSUMPTION or UNKNOWN. For a classroom case the organization is fictional, so the search is limited
  to sector benchmarks.
- **Rules only (no AI, offline)** — sentences matching each field are picked from the documents; values
  found this way are tagged FACT or INFERENCE, the appetite is an ASSUMPTION, the rest UNKNOWN.

The review lists every field with its current value, the proposed value (editable, normalized to a
short structured statement of under 50 words, or a number, an ISO currency code, an appetite between
0.1 and 0.9), its **tag** and its **source**:

| Tag | Meaning |
|---|---|
| FACT | Stated explicitly in the documents (the source names the document). |
| INFERENCE | Derived from facts in the documents. |
| ASSUMPTION | A plausible value because information is missing — validation required. With a creative answer, the source starts with *Proposed —*. |
| EXTERNAL | From external evidence, such as a web page (cited). |
| UNKNOWN | Not found — information still to collect. |

Proposals for fields that are empty are ticked; a proposal that would replace a value you already have
is shown beside it and left unticked. Click **Put ticked values in the form**: they go into the draft,
nothing is saved yet. A coloured tag stays next to each field label — an asterisk means you edited the
value after extraction. Click **Save** to keep them.

**Crown jewels.** The assets and services whose loss would most harm the mission, with owner, C/I/A
importance, dependencies and suppliers. They feed the batch builder. **Extract from documents…** on
this tab proposes crown jewels the same way, with a tag and a source for each; those already in the
list are recognized and skipped.

**Classroom** (classroom workspaces only). Course, business-case title, team, members, instructor and
due date. Every export carries them, and the workbook README states that the case is fictional.

**Context documents.** Drop or choose files: Word, Excel, PowerPoint, PDF, text, Markdown, CSV, JSON or
HTML. The text is extracted **on your computer** and stored with the workspace. Open any document to
read or correct its text, or add a typed note. PDFs are read on a best-effort basis: scanned or
unusually encoded PDFs yield little text, and the application says so — paste the key passages as a
note instead. When you add documents here, a card offers **Extract from the new documents…**, which
opens Import from documents with them already selected.

The **context hints** panel scans the text for sector signals, laws and standards, technologies,
candidate crown jewels, CVE identifiers and amounts. It is a keyword scan, not an interpretation;
nothing is added until you click, and CVEs found this way enter the vulnerability register as
*unconfirmed*. Text extraction and the hints use no AI.

#### Import from documents — at any time

**Organization → Import from documents** is where the documents become an assessment, and it is Process
step 4. It works the same whether the workspace was created a minute ago or the assessment is months
old: new information arrives — an audit report, a supplier list, a new incident — and you extract from
it without retyping and without disturbing what is already there.

**1. Documents to read.** Drop new documents on the zone at the top; they are read on your computer and
added to the workspace. The table lists every document with what has already been extracted from it
(*Already extracted into*). Tick the documents to read. By default the documents **you just added are
the only ones ticked**, so a new document can be extracted on its own; *Select all documents* ticks
them all. The documents ticked are the only ones whose text goes into a request — the preview names
each of them.

**2. What to extract.** The targets, each with its methods (*rules + AI* or *AI only*) and the route its
AI requests take:

| Target | Where it goes | Rules | Notes |
|---|---|---|---|
| Profile & appetite | the 18 profile fields, as a draft you save | yes | proposals for filled fields are left unticked |
| Crown jewels | Organization → Crown jewels | yes | existing names are skipped |
| Information assets | Information assets (owner, type, classification, C/I/A, hosting, vendor/product, dependencies) | yes | feeds Batch step 2, vulnerability linking and the blast radius |
| Business impact (BIA) | the asset's BIA: RTO, RPO, maximum tolerable downtime, impact 0–5, processes | yes (RTO/RPO) | evidence for μ(E), δe, δm |
| Third parties | Information assets of type *Supplier / third party* | yes | supplier scenarios and measures |
| Existing controls | Existing safeguards, with framework references | yes | added with **zero reductions**: set their effect yourself |
| Compliance | the statement of applicability (status, maturity, findings as gaps) | AI | only controls the catalogues know |
| Incidents | Organization → Evidence | yes | evidence for Pb(A), Pb(ψ,A) |
| Vulnerabilities (named weaknesses) | the vulnerability register as *W-…* weaknesses with a CWE | yes | used by Suggest links |
| Candidate scenarios | the Batch scenarios grid, marked *[Docs]* | AI | default parameters, Low confidence |
| Parameter evidence | Evidence and Rationale of the scenario parameters | AI | **never** a number |
| Existing risk register | Risk register (owner, ratings, treatment, acceptance to confirm) | AI | |
| Budget | initiatives, and the spend split staff / tools / services | yes (projects) | |
| KRIs | KRI dashboard: the indicator and its first reading | yes | |
| People and roles | Organization → Evidence; *Create user* in multi-user mode | yes | proposed owners, starting RACI |
| Classroom setting | the Classroom tab | yes | |

The targets ticked here are the **import plan** of Process step 4: the step is done when every target
of the plan has been reviewed at least once. Choose the **Method** — AI (preview before sending) or
Rules only, no AI, offline (where a rule exists) — and click **Start the import**. The profile opens
first, then the crown jewels, then each target in turn; each opens its review: edit, tick, **Add
ticked**. If the profile values you accepted are not saved yet when the run moves on, the application
asks: *Save the profile and continue*, *Stay on the profile*, or *Discard the profile values and
continue*.

**Merging, not overwriting.** Accepted values are added to what the workspace holds. A proposal that
would replace an existing profile value is shown beside it and left unticked; crown jewels already in
the list are skipped; records keep their tag, their source, the method and the date. An import never
moves a score.

**3. Previous imports.** The last imports: date, target, how many items were proposed and added, the
method, and how many documents were read.

Routing: the targets that map the organization's systems and exposure — assets and BIA, existing
controls, incidents, weaknesses — form the feature *Import from documents — assets & BIA…*, routed to
the **local model by default**; the others follow the workspace provider (section 8.3).

**Evidence.** Organization → *Evidence* keeps the people and roles, the spend breakdown, the incidents
read from the documents (they are also in the incident register) and the **import log** (what was
proposed and added, by which method and by whom). Evidence *records* — what a document or a test shows,
for which period and until when — are kept once in **Governance → Shared registers → Evidence**.

### 7.2.2 Information assets {#assets}

The organization's systems, applications, data, business services, cloud tenants, devices, suppliers
and facilities, each linked to the scenarios and risks it carries.

- **Inventory.** Search and filter by type, criticality tier, classification and lifecycle stage.
  *Create from profile & crown jewels* turns the critical systems of the Organization screen into
  assets to review. Click an asset to edit it: general data (owner, custodian, host, IP, OS, vendor,
  product, version, CPE, tags such as `internet-facing`), classification and C/I/A ratings,
  **sensitive-data tags** (PII, PHI, PCI, financial, IP, credentials, legal, HR), **business impact**
  (MTD, RTO, RPO, revenue per hour, financial / operational / legal / reputational / safety impact
  0–5, processes), **lifecycle** (stage, acquisition, end of support, end of life, retirement),
  **endpoint security** (EDR, disk encryption, last patch, last seen) and **configuration baseline**
  (CIS Benchmark, STIG, vendor guide; compliant / drift), software, vulnerabilities, upstream
  dependencies and the scenarios it carries.
- **Criticality** (0–100) = CIA 40 + business impact 30 + classification 15 + sensitive data 10 +
  dependents 5; tiers Critical ≥ 70, High ≥ 50, Medium ≥ 30. **Dynamic risk** = criticality ×
  exposure, where exposure rises with linked CVEs (KEV, EPSS, confirmed exposure), missing EDR or
  encryption, patch age over 60 days, baseline drift, end of support, internet exposure and linked
  scenarios above tolerance. It is recomputed whenever anything changes; **Record scores** stores the
  day's values so a sparkline shows the trend. Hover a score for its components.
- **Discovery & import.** Load an Nmap XML scan (`nmap -sV -O -oX scan.xml …`), a CSV export from a
  CMDB, EDR console, MDM or spreadsheet (name, hostname, IP, OS, owner, vendor, model, last seen and
  sensor-status columns are recognized), or AWS `describe-instances` / Azure `az resource list` JSON.
  The import is **compared with the inventory first**: new assets, changed fields and assets this
  source no longer sees; tick what to apply. For **continuous discovery**, have your scanner or EDR
  export write into `discovery/` in the feeds folder: the screen checks it every minute while open
  and flags new files.
- **Software & data.** Software aggregated across assets with the register CVEs that mention it;
  data assets and sensitivity tags with owner and encryption.
- **Business impact.** MTD/RTO/RPO and impact ratings for services and critical assets, with what
  each needs upstream.
- **Vulnerabilities & configuration.** Correlation suggestions (register CVEs whose product or asset
  field matches an asset's name, product or software), the assets × CVEs map (KEV in red, ● exposure
  confirmed), endpoint and baseline status with coverage figures.
- **Dependencies & blast radius.** The relational graph of assets (→ depends on), scenarios and,
  optionally, risks; node size is criticality. Select an asset: everything that depends on it,
  directly or not, is highlighted, with the business services, scenarios and risks affected and the
  shortest MTD among them.
- **Audit trail.** Every creation, change, link, import and deletion with its time stamp, field,
  before and after values and source; exportable as CSV.
- **Compliance reporting.** Ten asset checks (owner, classification, sensitivity tags, EDR, encryption,
  patching, baseline, end of support, BIA, recent discovery) with the controls they support and the
  failing assets; Markdown and CSV reports.

### 7.2.3 Maturity & resilience {#maturity}

**Maturity** is scored against NIST CSF 2.0: six functions and the 22 categories underneath them, read
from the bundled publisher content rather than typed from memory. Score 0–5 against a target, with
evidence. An unscored category is **left out of the average, never counted as zero**, so a partial
assessment stays honest. Where your safeguards point at a CSF category a level can be proposed, and a
proposal never exceeds 3 — an inventory can show that something is done, not whether it is defined,
managed or improving.

**Resilience** is eighteen questions, three per capability, about what the organization can
*demonstrate* rather than what it owns. **Unknown is a real answer**: recorded as an information gap
and excluded from the score, not counted as a zero nobody verified.

**The two readings.** The questionnaire records what people say; the inventory records what is written
down as in force. Both propose a θ, and the screen names the gap — *they agree*, *the questionnaire is
more optimistic* (somebody believes in a capability nothing supports), or *the inventory is more
optimistic* (controls are recorded that the people answering do not credit). They are not averaged:
averaging hides the finding. The lower reading is offered by default, because resilience claimed
without evidence is the more expensive mistake.

**History.** Record an assessment and it is dated, trended against the previous one, and comparable.
Recording twice in a day replaces the entry. Two KRIs follow it: CRG-15 maturity against target and
CRG-16 resilience capabilities covered, both blank until you assess.

**How many scenarios.** The measured level sets the suggested number — about 10 below maturity 2, 15
at 2, 20 at 3, 30 at 3.5 and above — shown on the Process page and in Batch scenarios with its reason.

*Where:* Maturity & resilience → Maturity (CSF 2.0) · Resilience (θ) · The two readings · History · Method

### 7.2.4 Reset data {#reset}

**Organization → Reset data.** Two audiences, kept apart on purpose.

**Start over** — for whoever is working a teaching case. No administrator is needed: resetting your own
exercise is not an administrative act. It is offered only for a **teaching case** — the bundled MediBec
example or any workspace whose type is a classroom business case — because only a teaching case has a
starting point to go back to:

| The case | Where “start over” goes |
|---|---|
| The bundled MediBec example | The case as shipped with the application. |
| A classroom case imported from a file | The state in that file, recorded the moment it was imported. |
| A classroom case built on this computer | Nowhere, until an instructor records a starting point. |

**The steps the student does again.** Starting over also empties what the first steps of the exercise
produce, so the student builds them again from the case documents and the Process screen shows them as
*to do*:

| Step | What starting over empties |
|---|---|
| 2 — Describe the context and risk appetite | the twelve context fields of the profile, the appetite rationale and the IT budget |
| 3 — Identify crown jewels and information assets | the crown jewels and the information-asset inventory |

The organization's name, its documents and everything else in the starting point stay. The instructor
chooses these steps per case, under *For the instructor* → **Steps the student redoes after starting
over**; both are ticked by default. Untick both and starting over returns the case exactly as it was
handed out.

An instructor records the starting point with **Set the current state as the starting point**, once the
case is ready to hand out, with its documents and whatever scenarios the exercise starts from. Recording
it again replaces it, which moves the starting point for everyone using that copy of the application.
**Forget it** removes the starting point, and with it the student's ability to start the case over.

A real organization is told why the button is not there: the work is the only copy, so the same button
would be a way to destroy it by accident.

**Reset or delete** — for an administrator (in single-user mode, whoever uses the computer). Four
depths, each described by what it **keeps**:

| Level | Keeps | Clears |
|---|---|---|
| Reset the assessment, keep the organization | Profile, appetite, crown jewels, documents, information assets, safeguards inventory, maturity assessment, security policies, compliance work, KRI definitions | Scenarios, candidates, measures, recommendations, the risk register, KRI measurements, decisions |
| Keep the context, drop the assessment | As above, minus the KRI definitions | As above, plus the key risk indicators you designed |
| A clean slate, same organization details | Profile, appetite, crown jewels, documents | Everything else — assets, safeguards, maturity, vulnerabilities, threat context, policies, compliance, the whole assessment |
| Remove the organization completely | The workspace and its name | Everything, including the profile, the appetite, the budget and the documents |

On top of any level: **also clear** the safeguards inventory, the maturity assessment or the threat
snapshot — all three off by default — and **keep** the example snapshot, framework catalogues and AI
settings (which belong to the installation), and **keep the stored API keys**, ticked by default.
Before anything happens the screen lists **what this would remove**, counted from the workspace as it
stands.

**Confirmation happens in a window of its own.** It repeats what will go and what will be kept and asks
you to type the word — `RESET`, `DELETE` or `START OVER`, in the language of the interface. In
multi-user mode, if an administrator has set a PIN, that PIN is required as well, so a class can decide
that students do not reset unsupervised.

**Deleting a whole workspace** lives on Organization → Workspaces (Open, Export, Delete on every row);
Reset data offers it for the workspace you are in. It is permanent — export first. Deleting the last
workspace brings the MediBec example back, so you are never left with none.

**A reset is not a way back.** To return to a state you know was right, restore a backup: Backup &
restore → the file → **Replace everything**.

| Where | What | Survives a workspace reset? |
|---|---|---|
| In the workspace | Profile, documents, assets, safeguards, maturity, vulnerabilities, threat snapshot, scenarios, measures, risks, recommendations, KRI history, policies, compliance | Only what the chosen level keeps |
| With the installation | Framework catalogues, the bundled example snapshot, AI settings, interface language, modules, users and rights, the Risk Registry catalogue | Yes, unless you untick “keep” |
| With the helper | The API keys, in `crg-keys.json` in the feeds folder, mode 600 | Yes, unless you untick “keep” |

Every reset is recorded in the workspace and survives even the deepest level.

### 7.3 Risk assessment

The assessment itself: indicators, what already protects the organization, the scenarios, the calculation, the risks, the treatment and the recommendations.

### 7.3.1 KRI dashboard {#dashboard}

Two kinds of key risk indicators:

- **Computed KRIs** (CRG-01 … CRG-10) come from the workspace itself: portfolio residual/tolerated
  ratio, scenarios above tolerance, total residual risk, snapshot age, share of material scenarios
  with an exposure-gated intel-backed Pb(ψ,A), exposed CVEs in KEV, ATT&CK mapping coverage,
  above-tolerance scenarios with funded treatment, recorded decisions, and cyber spend as a share of
  IT budget against the appetite-consistent target.
- **Operational KRIs** are those of the assessment (the MediBec case ships twenty: MFA coverage,
  patch SLAs, restore tests…). Define or edit them at the bottom of the screen; thresholds accept
  forms such as `100%`, `< 95%`, `> 8%`. A `<` warning means higher is better.

**Tracking over time.** Choose a date, optionally enter the operational values you measured, and
click **Record**. The computed KRIs are captured as they stand. Recording again on the same date
updates it; earlier dates can be back-filled, or a whole history imported from CSV.

**Top 5 by default.** The dashboard opens on the five indicators that most need attention:
critical ones first, then warnings, each ranked by how far it is past its threshold, then on-target
indicators closest to their warning level. The choice is recomputed at every visit, so a newly
breached indicator appears without you doing anything; **Record** then captures every indicator.
Tick or untick indicators to make your own selection (saved with the workspace); **Reset to top 5**
or **Top 5** returns to the automatic view. CRG-11 to CRG-14 come from Information assets and
Compliance and show *no data* until those screens are filled.

**Gauges.** Each selected indicator is shown as a gauge: green, amber and red bands for on target,
warning and critical, a tick at the target and a needle at the current value. Gauges of
lower-is-better indicators are coloured the other way round, so green is always "good". Indicators
without thresholds show a tracked value instead. Click a gauge for its trend.

**Selecting and searching.** Above the table: a search box (ID, name, method, owner…) and filters by
status, computed or operational, and owner — as in the Scenario register. Tick one or many
indicators, or use *Select shown*, *Deselect shown*, *Select all* or *Only warning or critical*.
The ticked indicators are the ones shown as gauges and **recorded** by **Record**; the selection is
saved with the workspace. **Compare selected trends** shows one small chart per selected indicator,
each on its own scale.

For each KRI the table shows the current value, thresholds, status, a sparkline and the **trend** —
the least-squares slope over all recorded points, read against the KRI's direction and labelled
improving, worsening or stable. Click a KRI for its chart with target, warning and critical lines,
the change since the previous point, slope per 30 days, and the number of critical breaches.

#### Claude Dashboard {#dashboard-claude}

**Download the dashboard pack (.zip)** turns this dashboard into a *Claude Dashboard* on claude.ai — a page
where every figure shows the dataset it comes from, shared with the people you choose. The pack holds four
datasets (key risk indicators now and over time, scenarios against tolerance, security policies with their
acknowledgement coverage), a ready page and a manifest; no document text, and the names of KRI owners only
when **Include the names of KRI owners** is ticked. Attach the ZIP in Claude and ask *"Build my
CyberRiskGuardian dashboard from this pack"* — with the CyberRiskGuardian plugin, the `crg-dashboard` skill
(or `/crg-dashboard`) does it the same way every time. Export a new pack and ask Claude to refresh the
dashboard when the numbers change. Anyone who can open the Claude Dashboard can read its datasets: share it
only with people allowed to see the assessment.

### 7.3.2 Existing safeguards — what already protects you {#safeguards}

Two different registers answer two different questions. **Risk mitigation** answers *what should we
add, what would it cost, what would it buy us*. **Existing safeguards** answers *what protects us
today, who owns it, and when was it last shown to work*. Keeping them apart is what stops a recommendation from claiming credit for a control the organization already has.

**The kinds.** Technical measures, business processes, internal controls, awareness programmes,
policies and roles, physical and environmental, contractual and insurance, personnel measures.

**Per entry.** An accountable owner — a person, not a team. The state: *in place*, *partly in place*,
*planned* (which counts for nothing: a control protects you when it operates, not when it is decided)
or *retired*. The scope **and what it does not cover**, because that is where the risk hides. The
assets and scenarios it covers, the framework controls it implements, the annual cost of keeping it
running, what it depends on, and when it was last tested, audited or reviewed with the result. No
evidence for twelve months and it is reported as stale; never tested and it is reported as an
assumption, which is what it is.

**Resilience coverage.** Each safeguard is scored 0–3 against the six capabilities θ(ψ,A) is defined
as — prevent, detect, contain, respond, recover, maintain critical operations. The tab shows where the
resilience actually comes from and **proposes** a θ, for the whole inventory or for one scenario, with
the rationale written for you. It proposes; you put it on a scenario yourself and the change is
recorded in the revision log. A capability takes its **strongest** contributor, never the sum: three
partial backups are not a recovery capability.

**The budget baseline.** The annual run cost of what is in force is offered as the baseline in Budget.
Add the staff and overheads the inventory does not carry.

*Where:* Existing safeguards → Inventory · Resilience coverage · Bring controls over · Method

### 7.3.3 Scenario register {#register}

All scenarios with their threats (ATT&CK chips), vulnerabilities (CWE and CVE chips), CVSS,
estimated and residual risk, ratio and status. Chips open the matching technique, weakness or CVE;
a scenario name opens the editor. The checkbox includes or excludes the scenario from totals.
**Load assessment JSON** replaces the scenarios or appends them (clashing IDs are renumbered);
**Export JSON** writes the file `crg_calc.py` reads.

### 7.3.4 Scenario editor — view and edit a scenario {#scenario}

Everything about one scenario on one screen, with its KRIs recalculated as you type:

- Identification, statement and the **causal chain** — threat source → initiating event →
  vulnerabilities → affected assets and processes → event sequence → consequences.
- **Threats — MITRE ATT&CK.** Search by name or ID and link techniques; the tactic coverage line
  shows the kill chain they describe.
- **Vulnerabilities — CWE and CVE.** Link weakness types and specific CVEs. With a snapshot loaded,
  each CVE shows its ladder rung; *watch* means its exposure is not confirmed.
- **Quantification.** The six parameters with value, rationale, evidence and confidence.
- **CVSS v4.0 (Base only)** — edit the vector here or in the CVSS calculator and save it back.
- **Treatment** — probability and impact reduction, the treatment package, the initiatives that
  address the scenario, or a manual Year-1 cost.
- **Threat-context basis** — the audit trail written when a Pb(ψ,A) proposal is accepted.

Duplicate, delete, move to the previous or next scenario, or open it in the calculator or the
recommendations.

**Draft the causal chain with AI.** In the **Causal chain** card, **Draft it with AI…** drafts the statement and the eight structured fields from whatever the scenario
already holds — one scenario at a time, because a chain is an argument about this organization and a
batch of eight would get the review a batch gets.

You see the payload before it is sent, as everywhere else, and the request tells the model **not to
contradict** what is already recorded, so a half-written scenario is completed rather than rewritten.
In the review, **empty fields are ticked for you and a field that would replace existing text is left
unticked and says so**, with the current value beside the draft. Edit any draft in place. Nothing is
written until **Apply the ticked fields**, and what you accept goes into the revision log naming the
fields taken. The feature defaults to the local model, because it carries scenario text.

**Ontology · CRGO card.** At the bottom of the editor. A scenario taken from the ontology shows its
ontology identifier, themes, asset categories, threat source types, the controls the ontology links to
it and the Quebec Law 25 obligations it can trigger. For any scenario, **Find similar ontology
scenarios** searches the ontology by the scenario's ATT&CK techniques and the words of its name — *Link*
attaches one, which gives the scenario its ontology keys — and **Controls for its techniques** lists,
technique by technique, the controls the ontology most often associates with it: a starting list for
Risk mitigation, not an assessment of the organization.

**Security-operations evidence card.** Read only, it gathers what the SIEM and SOAR records say about the
scenario — through its ATT&CK techniques, its assets and explicit links: detection coverage per technique
(*validated*, *untested*, *degraded*, *missing*, with the rules and why), open detection gaps, recent alerts
(benign and false positives left out — **not incidents**), SOAR cases, incidents (*confirmed* or *not
confirmed — not counted as an incident*), response playbooks with their simulation status, and the
evidence links recorded on the scenario. **It changes no parameter**: cite it in the rationale of Pb(A),
Pb(ψ,A) or θ yourself. Alerts marked TLP:RED or TLP:AMBER+STRICT are masked unless you tick *Show TLP:RED
and TLP:AMBER+STRICT items on this computer*. Buttons lead to SIEM coverage & gaps, Alerts & triage, SOAR
cases, Playbooks and the seeds in Batch scenarios.

### 7.3.5 Batch scenarios — creating many scenarios at once {#batch}

- **Generate from threats × assets.** Tick threat patterns (eighteen archetypes such as credential
  phishing, ransomware, edge-device exploitation, cloud misconfiguration, supplier compromise, BEC,
  backup destruction…) or add any ATT&CK technique as a pattern; tick assets (the crown jewels, or
  type others); choose the threat sources. Each combination becomes a candidate with a causal-chain
  statement, linked techniques and CWE, and default parameters.
- **From MITRE ATT&CK.** Search techniques by name or ID, or filter by tactic, and tick one or many.
  Each technique becomes a scenario linking the technique and its CWE weaknesses (through CAPEC).
  Pb(A) starts from the technique's prevalence in ATT&CK — labelled as a prior, not as evidence.
- **From CVE.** Pick CVEs from the vulnerability register — exposed and KEV-listed ones come first,
  with filters for each. Each CVE becomes a scenario linking the CVE, its CWE and the ATT&CK
  techniques that exploit that weakness, on the CVE's own asset when the register records one. With
  a snapshot loaded and exposure confirmed, Pb(ψ,A) starts at the floor of the CVE's Threat
  Evidence Ladder band, and the rationale says so; the NVD CVSS v4.0 vector is used when known.
- **From CWE.** Pick weaknesses from the 2024 Top 25 or a search; each becomes a scenario linking the
  ATT&CK techniques that exploit it.
- **Paste or import CSV.** One row per scenario; download the template for the column names.
- **Blank rows.** Start from empty rows.
- **From the ontology and the Risk Registry.** Ontology · CRGO → *Add ticked to Batch scenarios* (marked *[CRGO]*) and Risk Registry → *Use ticked cards in this workspace* (marked *[Registry]*) land here too.
- **Propose with AI.** Choose how many candidates (1–30) and, optionally, a direction (“focus
  on suppliers”, “OT in the plants”). The organization profile, the crown jewels and the information
  assets are sent — shown first in the usual preview. Each candidate comes back with a full causal
  chain, the six parameters with a reason and a confidence for each; it lands in the grid named
  *[AI]* for review and never enters the register directly.
- **From security operations (SIEM & SOAR).** *Scenario seeds from security operations* lists what the
  SIEM and SOAR records suggest: detection gaps, coverage not validated by a test, degraded telemetry,
  alert clusters by technique and asset, confirmed incidents, open cases (not incidents), response actions
  without a valid approval, playbooks not simulated and lessons learned. Each seed shows a suggested causal
  chain, the ATT&CK techniques, the scenarios it touches, its evidence (kind, identifier, date, TLP — and a
  source confidence *as stated, not a probability*) and the parameters it **may inform** — never a value.
  A seed whose techniques and crown jewel (or asset) match an existing scenario is marked *Evidence for an
  existing scenario*: **Record the evidence on S…** attaches it to that scenario without changing a
  parameter. Choose the *As of* date (coverage, telemetry health and alerts are read at that date) and the
  *Kind*, tick seeds and **Create … draft candidate(s)**: they land in the grid as drafts with neutral
  parameters, with their evidence links, for you to estimate. Benign and false-positive alerts are skipped
  and counted; incidents not confirmed by a person are not counted as incidents; TLP:RED and
  TLP:AMBER+STRICT seeds stay masked unless you tick *Show TLP:RED and TLP:AMBER+STRICT items on this
  computer*.

In **Propose with AI**, ticking **Include security-operations evidence** adds a summary of those seeds to
the request — shown in the preview like everything else. It is filtered: TLP:RED and TLP:AMBER+STRICT
items are never sent, and neither are source confidences. A seed that is evidence for an existing
scenario is described as such, so the model does not propose it again.

**Assets.** Step 2 lists the crown jewels **and** the information assets of the inventory,
most critical first; *Tick crown jewels + 5 most critical* is a quick start.

**Number of candidates.** Threat patterns × assets × sources can make hundreds of
combinations. Set *Number of candidates* (default 10; quick buttons 10, 20, 30, 50; up to 500): the
most relevant combinations are generated first — pattern likelihood × asset criticality × fit of the
threat source.

Every candidate lands in the **review grid**, where name, statement, source, asset, the six
parameters, CVSS and reductions can be edited. Tick the ones to keep and click **Add selected to
the register**. Generated values are starting points, flagged *Low* confidence with the rationale
"Batch default — analytical estimate, validation required". The method's guidance applies:
about 20 candidates, then the 10 most material for detailed analysis.

**Varied candidates and the seed.** Ranking alone would draw twenty candidates from two or three patterns — one threat applied to asset after asset — because the pattern likelihood is identical for every asset. Candidates are therefore **spread** across the patterns, assets and
threat sources you ticked, still preferring the more likely combinations: each pick makes its own
pattern and asset less attractive for the next. On the MediBec case the same selection gives **18
distinct patterns in 20 candidates instead of 3**, with the counts tracking the likelihoods rather
than being an equal quota.

The spread is **seeded**, the seed is shown and kept with the workspace, and *Reshuffle* draws a new
one. The same seed reproduces the same candidates, so a set cited in a report can be re-derived.
*Vary the patterns and assets* can be unticked for the strict ranking.

### 7.3.6 Risk calculator {#calc}

**Portfolio table.** The risk of every scenario — Pb(A), Pb(ψ,A), CVSS, estimated, tolerated,
mitigated and residual risk, ratio, status and allocated Year-1 cost — with a **checkbox to include
or exclude each scenario**. The totals, tolerated risk and portfolio ratio cover the included set,
with the all-scenario totals shown for comparison. Quick selections: include all, exclude all,
only above tolerance, top 10 by estimated risk. The selection is saved with the workspace and is
used by the dashboard, recommendations, budget and Excel export.

**Search and select.** As in the register: a search box (ID, name, threat, technique, CWE, CVE,
owner, asset — every word must match) and filters by status (including *included* / *excluded*),
threat source and owner. They choose which scenarios are **shown**; the checkboxes choose which are
**included**. *Include shown*, *Exclude shown* and *Include only shown* act on the rows on screen;
the header checkbox includes or excludes all of them; the count line shows how many are shown and
included.

Appetite and factor can be changed as a **what-if**; nothing is saved until you choose *Save as
workspace values*.

Shared initiatives are split equally across the *included* scenarios they address, so excluding a
scenario moves its share of a shared control onto the others rather than losing it.

**Single-scenario calculation.** Click a row to load the scenario: every step of the formula, the
±0.10 sensitivity cases and cost-effectiveness. Change values as a sandbox, then save them back to
the scenario or as a new one.

### 7.3.7 Risk register {#riskreg}

Risks are what management owns; scenarios are how they are quantified. *Create from scenarios* makes
one risk per scenario with its techniques, CWE/CVE, assets and measures, and ratings on a 1–5
likelihood × impact scale: **current** from the scenario parameters, **target** after the combined
reductions of its measures; **inherent** starts equal to current for you to adjust. Each risk shows
the residual/tolerated ratio of its scenarios. Record the owner, category, treatment, status, next
review and a **formal acceptance** (by, date, valid until, rationale); every change is logged in the
risk's history. The heat map (inherent, current or target) and the top-risks list sit above the
register. *Refresh ratings from scenarios* updates current and target after parameters change.

### 7.3.8 Risk mitigation {#mitigation}

- **Control catalogue.** Your list (Controls_list.xlsx: ISO/IEC 27002:2013, the NIST CSF 1.1
  subcategories labelled “NIST 800-53” in the sheet, CIS v7.1 — numbering corrected and seven rows
  flagged), ISO/IEC 27002:2022, NIST SP 800-53 Rev. 5 (with enhancements on request), NIST CSF 2.0,
  CIS Controls v8.1, ATT&CK mitigations, the CRG measures, and any catalogue you have loaded in
  *Frameworks & standards* (section 7.5.4) — SP 800-171 r3, ITSP.10.171, COBIT 2019 or your own import.
  Search, filter by framework, function or capability, tick controls and *Add* them to a new or
  existing measure.
- **Measures.** Name, function, owner, status (proposed, approved, in progress, implemented,
  rejected), one-time and recurring cost, months to benefit, effort, confidence, default likelihood
  reduction **rp** and impact reduction **ri**, overridable per scenario with a rationale, and the
  catalogue controls implemented. A measure also records **what it changes** — one of the
  nine effect categories (governance, prevention, detection, response, recovery, resilience,
  awareness, assurance, third-party) — the **action verb** (strengthen, extend, automate, formalize,
  replace… rather than a default "implement", because most organizations already have *something*) and
  whether the scenario revealed a **control gap**, a **weakness** in an existing control, or a
  **maturity** problem. These three are what turn a measure into a recommendation that reads like a
  decision rather than a shopping list.
- **Effect on each scenario.** Measures are combined per scenario as **red_p = 1 − ∏(1 − rp)** and
  **red_i = 1 − ∏(1 − ri)**; the verified engine then applies the workbook convention mitigated =
  estimated × red_p × red_i. The table shows the current ratio and the ratio with the measures.
  **Apply** writes the combined values into the scenario with a revision entry; **Revert** restores the
  previous values. Because the convention multiplies the two reductions, a package that reduces only
  likelihood (or only impact) mitigates nothing — the screen warns when that happens.
- **Costs.** Each measure is one investment; its Year-1 cost is split across its scenarios, so shared
  controls are never counted twice. **→ Initiative** creates the initiative used by Budget,
  Recommendations and Excel.
- **→ Recommendation**. Tick the measures that belong together and press it: a **draft
  recommendation** is created from them, collecting their scenarios, costs, horizon, framework mapping
  and the reduction they would achieve. Continue in *Recommendations → Register* (section 7.3.9).
  Ticking a measure only updates the action bar — the table does not redraw, so your scroll position
  and any open editor survive.
- **Proposals.** For the selected scenarios, capabilities are proposed from their ATT&CK techniques'
  mitigations, keywords in the scenario and the damage profile (δm ≥ 0.70, θ ≤ 0.40), once per
  capability for all scenarios that need it, with indicative CAD costs scaled to the organization's
  size and default reductions — analytical estimates, validation required.
- **Ask Claude.** Select scenarios, copy the request (organization profile, scenarios, parameters,
  current results, existing measures, the modelling convention and the JSON answer schema) into
  Claude, paste the answer back and **Read answer**: unknown scenarios or controls are reported, the
  rest is added as *Proposed* measures with Claude's per-scenario reductions.

### 7.3.9 Recommendations — the options the organization can consider {#recs}

**Treatment need** (first tab). Before any control is offered, this tab states for every
included scenario whether its residual risk is **below**, **approximately at** or **above** the
tolerated risk, with the ratio, and writes the treatment objective in risk terms — what the ratio
has to become, not what product to buy. A scenario does not earn a project by existing: a scenario
below tolerance needs monitoring, not an initiative, and this tab is where that is said out loud.
Work through it before the option tables below.

**By scenario.** For each included scenario, ordered by ratio, the four options — **mitigate,
transfer, avoid, accept** — with the suggested one highlighted and the reasons stated:

| Situation | Suggestion |
|---|---|
| Untreated risk below tolerance | Accept and monitor with a KRI |
| Untreated risk approximately at tolerance | Accept with monitoring, or low-cost mitigation |
| Above tolerance, treatment brings it to or below tolerance | Mitigate |
| Still above tolerance after treatment | Mitigate harder; also *transfer* if δm ≥ 0.80; also *avoid* if μ(E) < 0.50 |

Below the options: the initiatives linked to the scenario with cost and cost-effectiveness, the
ATT&CK mitigations for its techniques and the CRG measures that implement them, and the
**management decision** — option chosen, owner, horizon and rationale, saved in the decision
register. A decision that departs from the suggestion is legitimate; record why.

**Shared controls** ranks initiatives by the number of scenarios they serve and the risk reduction
attributed to them, and ATT&CK mitigations by the residual risk they cover. **Roadmap** places
initiatives in 0–90 days, 3–6, 6–12 and 12–24 months. **Initiative portfolio** edits the
initiatives themselves — costs, owners, priorities, start and end, scenarios addressed — and can
add entries from the CRG measure catalogue. **Decision register** lists every decision.

**Register** — the lifecycle from a selected measure to a decision the organization owns.

Tick measures in *Risk mitigation* and press **→ Recommendation**: a **draft** is created carrying
their scenarios, costs, horizon, framework mapping and the reduction they would achieve. The draft is
yours to write — title, the problem in one paragraph, the recommendation itself, the options
considered and why this one, the owner, the horizon, the decision asked of management.

| Status | What it means | Where it can go next |
|---|---|---|
| **Draft** | Being written. Figures are live and move with the workspace. | In review, deferred, rejected |
| **In review** | With the decision-makers. Their comments are recorded against it. | Approved, draft, deferred, rejected |
| **Approved** | A decision has been taken. **The figures are frozen** with the date and the approver. | In implementation, deferred |
| **In implementation** | Being delivered. Progress, due date and next review are tracked. | Completed, deferred |
| **Completed** | Delivered. | — |
| **Deferred** / **Rejected** | Terminal. The reason is recorded. | — |

Any other move is refused, and the screen says which transitions are available instead.

**Approval freezes the figures, deliberately.** A recommendation approved in October must still show,
in March, the numbers the decision was taken on — otherwise nobody can audit the decision. After
approval the live panel keeps moving with the workspace and the frozen record does not; the screen
shows both and labels which is which. Editing an approved recommendation records a new version rather
than overwriting it.

**The approval gate** checks the twelve questions the guidance requires before a recommendation goes
to management — a stated objective, an owner, a horizon, costs, the measures, the scenarios addressed,
the effect on the ratio, the options considered, the dependencies, the residual risk after treatment,
how it will be measured, and the decision being asked for. Missing items are named; it does not guess
them for you.

**A recommendation cannot claim credit for a control you already have.** The baseline is everything
already in force, including this recommendation's own measures if they are already implemented. If
you tick a measure whose status is *implemented*, the claimed reduction is zero, and that is correct.

**Consolidation** looks across the drafts and proposes merging those that share control themes or
scenarios into fewer enterprise initiatives, with the reason stated. Nothing is merged for you —
four drafts about identity may genuinely be one programme, or may genuinely be four.

**Draft first, formal after.** The intended use is to take the draft into the discussion with the
decision-maker, amend it there from what you hear, and only then move it to review and approval. The
discussion log on each recommendation is for exactly that.

### 7.4 Threats & vulnerabilities

Who could act, how, through which weaknesses — and what the threat landscape and the ontology say about it.

### 7.4.1 Threats · ATT&CK {#threats}

The bundled **MITRE ATT&CK Enterprise v19.2** knowledge base — 697 techniques and sub-techniques and
44 mitigations — linked to **CAPEC v3.9** attack patterns and **CWE v4.14** weaknesses.

- **Matrix**: techniques by tactic, coloured by how many scenarios use them; filter, or show only
  the linked ones.
- **Technique detail**: description, tactics, platforms, the number of tracked intrusion sets using
  it (prevalence, not likelihood for this organization), sub-techniques, ATT&CK mitigations, the
  CWE weaknesses linked through CAPEC, the scenarios using it, and buttons to link it to a scenario
  or start a new scenario from it.
- **Scenario mapping**: scenario × tactic coverage, and techniques ranked by residual risk.
- **Threat sources**: scenarios grouped by threat source, and the source catalogue.
- **Export ATT&CK Navigator layer** for the public or a self-hosted ATT&CK Navigator.

### 7.4.2 Vulnerabilities · CVE/CWE {#vulns}

- **Online sources** — update from the internet, see below.
- **CVE register** — the CVEs the organization operates. The *Exposed* box is the exposure gate
  (constraint C4): tick it only with inventory, CMDB or scanner evidence. With a snapshot loaded,
  each CVE shows its KEV listing (and known ransomware use), EPSS score, and ladder rung. Link
  CVEs to scenarios from here, pull those already linked in scenarios, or export the register.
- **Import** — NVD CVE API 2.0 files and CVE JSON 5 records you downloaded (CVSS v4.0 Base vector
  and CWE are kept; v3.1-only records are flagged for rescoring), and scanner or CMDB CSV exports.
  The app never queries an API with your CVE list.
- **CWE explorer** — the 2024 CWE Top 25 and search over 938 weaknesses; each weakness shows the
  ATT&CK techniques that exploit it and the scenarios and CVEs that carry it.
- **CVE detail** — everything known locally about one CVE.

**Online sources — updating KEV, EPSS and NVD.** When the app was started with its launcher, the
launcher window also runs a small **download helper**. Choose what to download:

| Source | Parameters | Size and time |
|---|---|---|
| CISA KEV | latest catalogue | about 2 MB, seconds |
| FIRST EPSS | score date (the previous days are tried if that day is not published yet) | about 2 MB, seconds |
| NVD CVE records | *changed since the last update*, *changed in a date range*, or **reload the complete catalogue** | a range: minutes; complete: about 300,000 records — 10–20 minutes with an NVD API key, 30–60 minutes or more without |

The complete reload asks for confirmation first. An optional **NVD API key** (free from NVD) makes
NVD downloads about ten times faster; it is kept only in this browser and never written to disk.

Downloads run **in the background in the launcher window** and are saved to
`Downloads/CyberRiskGuardian-feeds` on your computer. The **Downloads** list shows progress, lets you
cancel, and offers **Load** when a file is ready. You can close the browser — or the whole app — and
come back later: the **Files** list shows everything in that folder with a *Load* button and whether
it is already loaded in this workspace. Only the launcher window must stay open until a download has
finished; if it was closed too early, the download is marked *interrupted* and can be restarted.

Loading a file:

- **NVD** — joins the records with the register on this computer: each register CVE found gets its
  description, CVSS v4.0 Base vector and score (v3.1-only records are flagged for rescoring) and its
  CWE. Pull CVEs from your scenarios into the register first if you want them enriched. The date of
  the update is remembered for *changed since the last update*.
- **KEV** and **EPSS** — are staged; **Build and use snapshot** combines them (or one of them with the
  other half of the current snapshot) into a new threat-context snapshot with a fresh 90-day
  validity. Ladder rungs and KEV/EPSS columns update everywhere.

Every load is written to the workspace's **update history**. Without the helper (the app served
another way), the same screen gives the download links and a **Load files from Downloads** picker
that accepts KEV JSON, EPSS CSV(.gz) and NVD JSON or JSON.gz files.

**Suggested links between vulnerabilities and scenarios.** Open **Vulnerabilities → Suggest links** for every scenario, or **Suggest vulnerabilities for this
scenario…** in the scenario editor for one. *Scenarios in scope* narrows or widens the run.

**Stage 1 — Run the rules** (on this computer, no AI, nothing sent). A CVE of the register is proposed
for a scenario when:

| Rule | Example reason shown | Confidence |
|---|---|---|
| The scenario's inventory asset lists the CVE | asset *VPN gateway* lists CVE-2024-21762 | High |
| The CVE's asset or product field names one of the scenario's assets | register entry concerns asset “ehr” | High if exposed, else Medium |
| The CVE carries a weakness the scenario carries | same weakness CWE-287 | Medium (High with an asset match) |
| The CVE's weakness is exploited by one of the scenario's ATT&CK techniques | CWE-287 is exploited by the scenario's ATT&CK techniques | Low (Medium with an asset match) |
| The CVE's product is named in the scenario | product “Fortinet FortiOS” named in the scenario | Medium (High with an asset match) |

A scenario with ATT&CK techniques but no weakness gets up to two CWE proposals. **Exposure proposals**
list register CVEs not yet confirmed that an inventory asset lists (High) or runs the product of
(Medium); *Mark ticked as exposed* confirms them and writes the evidence into the register entry.

**Stage 2 — Ask AI for more links.** The scenarios' causal chains, the register and the links the rules
already proposed are sent — you see the exact payload first — and the model proposes further links with
a reason and a confidence, raises **doubts** about rule-proposed links, and names the scenarios no
vulnerability supports. A proposed CVE that is not in the register, or a scenario that does not exist,
is dropped and counted. By default this runs on the **local model**, because the payload is the
organization's vulnerability list; see section 8.3 to change it.

**Review.** Both stages land in one list with the scenario, the vulnerability (and whether its exposure
is confirmed), the reason, the method (rules, AI, or both) and the confidence. High-confidence rows are
ticked by default. *Accept ticked* adds the links to the scenarios; *Reject ticked* removes the
proposals for good — they are not proposed again. *Gaps* lists the scenarios with no vulnerability
evidence (they may still be valid: an insider, an outage) and the register CVEs no scenario uses (they
may call for a new scenario — Batch scenarios → From CVE). *Recent decisions* keeps who linked or
rejected what, by which method.

A link changes no score. Pb(ψ,A) moves only for **exposed** CVEs, through the ladder proposals you
accept in Threat context (section 7.4.4).

### 7.4.3 Threat feeds & social {#feeds}

**Triage** (first tab). A feed is a pile of headlines; a triage is a decision. This tab merges
the week's items into **stories** — a shared CVE identifier is decisive, otherwise the headlines are
compared on their meaningful words — so three outlets covering one vulnerability become one row
carrying all three source names. Each story is then placed in one of three buckets, and the reason is
always stated, naming the CVE, technique, technology or term that matched:

| Bucket | What puts a story there |
|---|---|
| **Needs a decision** | A registered CVE whose exposure is **confirmed** on an asset, or a match on both a scenario technique and a technology you run. |
| **Worth watching** | A registered CVE without confirmed exposure, or a match on a technique, a technology, your sector or your region. |
| **Not relevant** | Nothing matched. Kept, not discarded — "we looked and it did not concern us" is a finding, and the only way to show the week was actually read. |

The line between the first two buckets is the **exposure gate**: the same rule *Threat context* applies
before it will propose any change to `Pb(ψ,A)`. A CVE you have registered but not confirmed as exposed
stays in *worth watching*, however loud the headline. Each row in the first two buckets names the
scenarios and assets it touches and links to them.

The triage is **deterministic**: the same items and the same workspace give the same buckets in the
same order, every time. That is why it, and not a model's reading, is the authoritative triage.

**Weekly briefing.** *Write the briefing* produces a Markdown briefing from the triage **without any
AI**: the period, the item and story counts, how many duplicates were merged, each story with its
sources and the reason it is there, and a closing section stating what the briefing has *not* done —
no risk score has been changed; `Pb(A)` and `Pb(ψ,A)` move only on confirmed exposure, through the
Threat Evidence Ladder, with you accepting each change; CVSS stays Base-only. Save it to the feeds
folder beside the digest, or copy it.

*Narrate through the AI assistant* rewrites the same triage for a management audience. The model is
told to state no risk figure. The briefing without AI remains the one of record; the narration is a
covering note, and it is labelled as one.

**Export the profile for the scheduled task** writes `briefings/triage-profile.json` into the feeds
folder: the technologies, the registered CVEs with their exposure flag, the scenario techniques, the
sector, the region and the weighted terms. It carries **no organization name, no scenario text and no
asset names**, so the weekend task can triage the week without the workspace leaving the machine.
Export it again whenever your assets, CVEs or scenarios change materially; the task uses whatever it
finds, and says so plainly when it finds nothing.

**The folder has to be the one the task works in.** The export names the absolute path it wrote to —
read it. The helper writes to its own feeds folder, `~/Downloads/CyberRiskGuardian-feeds` unless you
have changed it, while the scheduled task works in whichever folder it was given. If the two differ,
the task finds no profile and writes no briefing. To make them agree, put the task's folder path on
the first line of `feeds-dir.txt` beside `serve.py` and restart the launcher; everything — downloads,
keys, briefings — then lives in one place.

**A thin profile cannot fill the first bucket.** If your asset inventory and CVE register are empty,
the profile exports with no technologies and no CVEs, and the screen says so. Matching is then limited
to techniques, sector and region, and *needs a decision* stays empty by construction — it requires a
registered CVE with confirmed exposure, or a technique and a technology together. That is the design
working, not a fault: the triage is only as good as what you have recorded.

- **Sources & downloads.** Your accepted sources with key status, last download, item count and
  status. *Download ticked now* runs them through the helper; when done, the files are loaded and
  matched. *Load latest files* loads what the scheduled task downloaded. Files from elsewhere can be
  loaded by hand.
- **Relevant to this organization.** Items scored by the terms of this workspace — exposed register
  CVEs weigh most, then IOCs on the watch list, assets' vendors, products and software, technologies
  in the profile, watch terms, scenario techniques, sector and region. Hover a score for the reasons.
- **All items.** Every item with search and filters by source and type (pulses, IOCs, advisories,
  news, posts, ransomware victims, statistics).
- **Act…** on an item: put its IOCs on the **watch list**, add its CVEs to the vulnerability register
  as unconfirmed, or attach it to a scenario as an **intelligence note**.
- **IOC watch list.** Status (watching, blocked, hunted, found in telemetry, retired), how often each
  indicator appears in the loaded feeds; export as CSV or as a **STIX 2.1** bundle for a firewall,
  SIEM or EDR.

Feed items never change a parameter. When telemetry confirms an indicator in your environment, that
is an incident or a threat-basis entry handled in Threat context.

### 7.4.4 Threat context {#threat}

**Snapshot.** Three routes, and one of them needs no network at all.

**Load the bundled example**. `examples/threat-context/threat-context-example.json` ships
with the application — about 1.5 MB — and the button beside the file picker loads it in one click. It
carries the **full CISA KEV catalogue of its build date (1,733 entries), 38,533 EPSS scores, the
Threat Evidence Ladder, the thresholds and the constraints**. That is enough to place CVEs on the
ladder, run the exposure join and complete Process step 5 on a machine with no internet access at all.

The EPSS table is **pruned at the ladder's own rung-1 ceiling** (0.05), keeping every score at or
above it, every score whose *percentile* reaches the rung-4 percentile, and every CVE listed in KEV.
That rule is lossless for classification: anything dropped would have been rung 1 by its score, and a
CVE absent from the table reads rung 1 with the reason *"EPSS below 0.05 (pruned from this
snapshot)"*. Every one of the 147,271 CVEs in the source snapshot classifies identically under the
pruned table — that is checked at build time, not assumed. What the pruning costs you is the exact
score of a CVE that was already negligible.

The screen says, on every visit, that this is an example and not current threat intelligence.
Download your own sources before any figure leaves the assessment: the example is a fixed date, and a
snapshot that reads as current when it is not is worse than none.

**Load your own.** The JSON produced by `threat_snapshot.py` in the
[`CyberRiskGuardian_ThreatIntel`](https://github.com/ITriskMgr/CyberRiskGuardian_ThreatIntel)
repository — `examples/threat-context/threat-context-shipped.json` there — or one built in the app.
This is the one to use for real work: it carries EPSS, so the exploitation probabilities and the age
guard both apply.

The snapshot is stored with the workspace. The screen shows its freshness against the 90-day
lifetime, KEV and EPSS counts, pruning, and a provenance table.

**The snapshot file, and what to do with it.** A snapshot is one JSON file named
`threat-context-YYYY-MM-DD.json` (the date it was retrieved). When you build one in the application, two
buttons appear:

- **Use in this workspace** stores the snapshot *inside the workspace*, in the browser's storage on this
  computer. **No file is created.** The exposure join, the ladder and the scenarios use it at once.
- **Download threat-context-YYYY-MM-DD.json** saves the same snapshot as a file in your browser's
  download folder (usually *Downloads*). Keep that file to load it into another workspace or on another
  computer with the *Snapshot* field of this screen, to give it to a colleague, or to archive the
  evidence that supported a decision.

**Download** at the top does the same for the snapshot already in use, and **Clear** removes it from this
workspace only. Snapshots are not included in a backup by default (section 7.10.6): keep the file if you
need it later.

**Generate a new snapshot.** Two routes to the same artifact:

- *In the app*: download the CISA KEV JSON and the EPSS daily `.csv.gz` with the links provided,
  open both files, choose validity, pruning, age guard and regional modules, and build. Use it in
  the workspace and/or download it.
- *With Python*: copy the `threat_snapshot.py --refresh …` command shown and run it where the
  repository is.

Either way the catalogues are downloaded whole and joined locally (constraint C5).

**Exposure join.** Paste the CVEs the organization is confirmed to operate, or click *Use the
register*. Each is placed on the **Threat Evidence Ladder**:

| Rung | Band | Label | Test |
|---|---|---|---|
| 1 | 0.10–0.20 | Theoretical threat | Technically possible, little evidence of current exploitation. |
| 2 | 0.30–0.40 | Known threat activity | Related malware, techniques or adversary activity observed somewhere. |
| 3 | 0.50–0.60 | Relevant active campaigns | Organizations with similar technologies are being targeted. |
| 4 | 0.70–0.80 | Confirmed exploitation of relevant technology | KEV listing, or high EPSS, for a technology the organization is confirmed to operate. |
| 5 | 0.90–1.00 | Direct organizational evidence | Matching malicious activity in the organization's own telemetry. |

**Rung 5 means an incident, not a prospective risk.** Invoke incident response first.

**Proposed Pb(ψ,A) changes.** For each scenario that links an exposed CVE and whose Pb(ψ,A) sits
below the CVE's band, the app proposes raising it to the **floor** of the band and shows the ratio
before and after. Nothing changes until you accept: accepting writes a `threat_basis` entry on the
scenario (evidence, snapshot date, exposure, confidence) and a line in the **revision log** —
which scenario moved, by how much, and whether its tolerance classification changed because of the
threat landscape rather than the organization.

The limits that cannot be configured away: intelligence calibrates Pb(A) and Pb(ψ,A) only, to a
band, never δe, δm, θ or μ(E); without confirmed exposure it is watch-list context; CVSS stays
Base-only; outside KEV a CVE older than ten years cannot reach rung 4 on EPSS alone.

### 7.4.5 Ontology · CRGO {#ontology}

The **CyberRiskGuardian Ontology** (CRGO) is a formal description of cybersecurity risk assessment —
assets, threats, weaknesses, controls, scenarios and the CRG parameters — with a library of about 1,900
risk scenarios. Each scenario is linked to MITRE ATT&CK techniques, weaknesses, controls of NIST CSF
2.0, NIST SP 800-53 r5 and ISO/IEC 27002:2022, the Quebec Law 25 obligations it can trigger, and
calibration estimates. Every link carries a confidence (high, medium, low) and an approval status.

> **Calibration priors, not evidence.** The ontology's values are AI estimates made in 2023 for a
> fictitious healthcare organization, or instructor values of teaching cases. They are starting points
> for a discussion with the organization: everything taken from the ontology is labelled *Analytical
> estimate — validation required*, and nothing it proposes reaches a score until you accept it.

**How the application reaches it.** Two ways, one answer shape:

1. **The ontology's own MCP server** — `pipeline/mcp/crgo_server.py` in the ontology folder, the same
   server Claude uses. The helper starts it on your computer and speaks to it; it reads its own files
   and sends nothing anywhere. This is the reference: its ranking, near-duplicate merging and gap
   reporting are the ontology's own.
2. **The snapshot shipped with the application** — `data/crgo-snapshot.json`, the ontology's
   identification export. Used when the helper is not running or the server cannot be started. It is
   queried in the browser with a port of the server's rules; every answer it gives is marked
   *snapshot*.

Every result shows which one answered.

**Suggest scenarios.** The organization described in the ontology's terms, built from the workspace:

- **Sector** — a word found in the scenario's sector (*health*, *bank*, *retail*, *hospitality*);
- **ATT&CK techniques seen** — from the scenarios already in the register; add those of your incidents
  and threat intelligence;
- **Keywords** — notable systems or weaknesses (*EHR*, *telehealth*, *MFA*, *HL7*…); the server expands
  synonyms;
- **Asset categories present** and **Themes of concern** — tick them from the ontology's vocabularies
  (ten categories, twenty-three themes).

Choose the **Link confidence** (high only, approved high and medium, or all), how many scenarios *Per
theme* and *At most*, whether to **Include teaching-case scenarios**, and — for an exercise — **Blind
test: hold out the MediBec case**, which hides the case's own scenarios from the ontology. Click
**Suggest scenarios**. A scenario matches when it shares any element of the profile; techniques and
keywords count double, the sector adds one; near-duplicates are merged under one representative
(*Merged* shows how many); each requested theme gets its representatives, then one representative for
each risk commonly assessed in any organization, then the best others.

The result shows the candidates, how many are distinct, and the **Theme gaps** — themes you asked for
that no scenario covers. Those are the scenarios to write yourself. For each suggestion: its themes,
ATT&CK techniques, the number of linked controls per framework, a *Prior risk* in CRG risk units (a
relative figure from the ontology's calibration, factor 1000, appetite 0.30 — not a score for your
organization) and **Details**: the statement, techniques, weaknesses, Law 25 obligations, controls per
framework and the calibration priors.

Tick what fits and click **Add ticked to Batch scenarios**. With **Use the ontology’s priors as starting
values**, each parameter starts from the ontology's case-calibrated value (or the 2023 library value)
with the rationale *Prior from the CyberRiskGuardian Ontology — not organizational evidence* at Low
confidence; untick it to start every parameter at 0.5. In the grid they are marked *[CRGO]* and reviewed
like any candidate; once in the register they keep their ontology identifier, themes, controls and
obligations, which the Risk Registry and the Scenario editor use.

**Explore.** *One scenario* by identifier (`LIB-F1436`, `MediBec/MED-A1`); *Controls for a technique* —
how often each control is linked to the library scenarios that use the technique, per framework, with
the replacement of a revoked technique identifier; *Scenarios a control addresses* — for a CSF 2.0, SP
800-53 or ISO/IEC 27002 control.

**Connection.** Whether the MCP server is running, ready or unavailable and where its command comes from:

| Source | Meaning |
|---|---|
| *set in Settings* | You gave the interpreter and the server script on this tab. |
| *taken from the Claude desktop configuration* | The `crgo-ontology` server registered for Claude on this computer is reused, with its own Python. |
| *found next to the application* | A `CyberRiskGuardian-Ontology` folder was found near the application folder (or in `CRGO_HOME`). |
| *not found* | No server: the snapshot answers. |

**Start the server** (or *Restart*) starts it now; the first start builds its store from the ontology's
files, about ten seconds. *Where the ontology is* lets you set the **Python interpreter** and the
**Server script (crgo_server.py)**; leave both empty to use the automatic search. The server needs a
Python with the `mcp` and `pyoxigraph` packages — the one Claude uses for it has them. Untick *Use the
ontology’s MCP server* to always use the snapshot. The tab also states the snapshot's version and size.

#### Organisation link — dss/v1, compliance/v1 and secops/v1

The ontology can read **this organisation's** context and record this application's results — through
tools of its server over a graph of the organisation. The ontology states facts, links and their review
status; **it never computes a risk**. The organisation link needs CRGO v0.9.1 or later; its fifth part
needs CRGO v0.10.0.

1. **Organisation base.** Every identifier of the organisation's records starts with it, so two
   organisations are never mixed. The default, `https://crg.invalid/<workspace>/`, is private (the
   `.invalid` domain is reserved and resolves nowhere); use an address the organisation controls if it has
   one. A base under `https://w3id.org/crgo/` — the ontology's own namespace — is refused.
2. **Organisation graph.** *Build the organisation graph* sends the included scenarios to CRGO's own bridge
   (`crg2rdf.py`, with the calculation engine `engine/crg_calc.py`), and adds this application's records in
   CRGO terms: control tests by assessor line and aspect, audit findings with their closures and
   reopenings, compliance determinations, obligations linked to scenarios, and the applicability profile
   with its evaluation. The totals of the graph must equal this application's (**same totals** pill). The
   files are written by the helper in a **confidential folder** — `~/CyberRiskGuardian-confidential/crgo/`
   by default, one sub-folder per workspace — never in the application, the ontology or a git repository;
   the helper refuses such a folder.
3. **Context of a scenario.** *Read the context* returns, at a date: the candidate obligations with their
   applicability (*applicable*, *not applicable*, *potentially applicable* → qualified review, *unknown* →
   evidence gap), the compliance state and evidence gap; each control with its latest result per assessor
   line and its open findings — a self-assessment that an independent line contradicts is shown as a
   **conflict**; the estimates with their confidence, assumptions and evidence quality (low or very low →
   *Analyst estimate — validation required*). There is no risk score in it.
4. **Write results back as proposals.** Tick scenarios and quantities — estimated, tolerated, mitigated,
   residual risk, the risk-to-tolerance ratio, the budget target — and *Send the ticked results as
   proposals*. One document per quantity, computed by this application's engine, with the application's
   model version, the inputs used and the SHA-256 of the exact assessment sent; status **proposed** and nothing
   else. CRGO stores it in the organisation's proposed graph. A write-back is never an approval, a risk
   acceptance or a funding decision: those are recorded by people in Cybersecurity management →
   Decisions.
5. **Compliance and security-operations contexts** (CRGO v0.10.0, read only). Choose an as-of date and
   **Read both contexts**. The organisation graph now also carries the records of the management modules
   in CRGO terms — policy versions and statements, obligations and determinations with their evidence,
   exceptions, findings and actions, detection rules, telemetry, alerts, cases, approvals and executions.
   - **Compliance context** (`crgo_compliance_context`, contract compliance/v1): each obligation with its
     applicability, its compliance state **as the latest recorded determination** (never inferred), the
     evidence status and validity, the supporting statements (*mappings — not compliance*) and open
     findings; legal provisions without a regulatory exemption (an internal exception never waives a law);
     findings and nonconformities with root causes and overdue actions; the versions of policies, standards
     and playbooks.
   - **Security-operations context** (`crgo_secops_context`, contract secops/v1): coverage per scenario and
     technique, validated only by an effective detection test; detection gaps; rules with their required
     telemetry (a rule whose required telemetry is silent does not detect); untriaged alerts (*not
     incidents*) with crown jewels first; executions without a valid approval (*an audit signal, not a
     verdict*); open regulatory triage.

   Records dated after the as-of date are ignored and another organisation's records are withheld. With an
   older CRGO the card says that these contexts need v0.10.0; everything else keeps working.

When the ontology refuses a document, the **write-back journal** shows its code and message as they came
(`SCHEMA_INVALID`, `UNKNOWN_ORGANISATION`, `UNKNOWN_SUBJECT`, `TENANT_MISMATCH`, `REFERENCE_NAMESPACE`,
`STATUS_NOT_PROPOSED`, `MODEL_VERSION_MISSING`, `INPUT_UNKNOWN`); the batch stops and nothing is retried
with altered data. Correct the cause — usually rebuilding the graph after adding or renaming scenarios —
and send again.

In the **Scenario editor**, the Ontology · CRGO card adds: the obligations the scenario can trigger, by
CRGO notation (`P-39.1 s. 10`); *Other regimes, D3FEND and exploitation evidence* — obligations under
A-2.1, PIPEDA, OSFI B-13 and the GDPR, MITRE D3FEND countermeasures, and KEV/EPSS figures per technique and
weakness, **shown as evidence that exploitation happens in the wild, never as a likelihood** (EPSS is not
Pb(A) or Pb(ψ,A), and KEV says nothing about the organisation's own systems); and *Organisation context and
control evidence* — the context above, or, without the graph, the control evidence recorded in the
workspace. Incidents that inform the scenario and the policy exceptions it counts on are listed beneath.

### 7.5 Governance

The management system, the policies, how the organization knows its controls work, the frameworks it
follows, the registers every management module shares, and the quality review. Each is a module that can
be switched off in Settings → Modules, except Frameworks & standards.

### 7.5.1 Information security management {#isms}

The management system that holds the rest together. Two tabs:

- **Overview** — the *scope* and *boundaries* of the management system; **security objectives** with how
  each is measured, its target, owner, due date, status and the KRI that follows it; **management
  reviews** (date, body, attendees, inputs reviewed, decisions, next review); and *Where the parts stand*:
  policies, statement of applicability, risk treatment, audit findings and incidents, each with a link.
- **Exceptions** — the policy exceptions of the **shared exception register** (section 7.5.5), seen from the
  management system: policy, scope, the departure, the compensating controls, the scenarios whose residual
  risk counts on it, the approver, status and expiry. Two rules are enforced: **an exception never waives a
  law** — one that names a legal or regulatory obligation cannot be accepted, because a departure from a
  law is a non-compliance — and an accepted exception needs an approver and an expiry date. **An expired
  exception is no longer a mitigation**: the banner lists the scenarios that still count on one, and the
  scenario editor shows it.

ISO/IEC 27001 and 27002 are cited by identifier only.

### 7.5.2 ISP management {#isp}

Information security policies from drafting to approval, publication, acknowledgement, review and
retirement. Each policy has **versions**: approval freezes a version with a SHA-256 hash of its content, and
changing it starts a new draft version. **An acknowledgement, a mapping or a policy statement is never
compliance**: only a dated compliance determination backed by evidence states a compliance state
(section 7.6). Seven tabs:

#### Overview {#isp-overview}

Policies by state, reviews overdue, **acknowledgement coverage** of the version in force, open
non-compliance and exceptions expiring — each figure with its denominator. Coverage counts the assigned
people who acknowledged the *exact* version in force (its hash); an acknowledgement of an earlier version
does not count. It is an adoption indicator, not a compliance indicator.

#### Policy library {#isp-policies}

Policies, standards, procedures and guidelines, grouped in **policy families** (the policies, standards and
procedures of one topic). **Create a policy** from one of **sixteen templates** — information security
policy, acceptable use, access control and authentication, information classification and handling,
protection of personal information, incident response, vulnerability and patch management, backup and
recovery, supplier and third-party security, remote work and mobile devices, logging and monitoring,
business continuity, cryptography, secure development and change, use of artificial intelligence,
physical security — each statement tied to the ISO/IEC 27002:2022 and NIST CSF 2.0 controls it implements.
**Create from the template** opens it as a draft; **Draft it with AI…** adapts the template to the
organization's profile (preview, editable payload and creativity as everywhere; the model writes *[to be
decided: …]* where the organization must choose); **Blank policy** starts empty; **Create the whole policy
set as drafts** creates a draft from every template not used yet. Templates are starting points, not legal
advice. Downloads: **Policy register (.csv)**, **Published policies (.md)**, **Statements and mappings (.csv)**.

#### Policy editor {#isp-policy}

The structured editor: title, type, family, owner, approver, review interval, purpose and scope, then
**clauses** and **statements**. Each statement has a stable identifier, belongs to one exact version, and
states its **modality** — *must*, *must not*, *should* or *may* (a guideline is never binding: *should* or
*may*) — with its controls and the training it requires. **Add a clause**, **Add a statement**, **Improve
with AI…**, **Download (.md)**, **Compare two versions** (statement by statement), **Delete the draft**. An
approved or published version is frozen; **Start a new version** opens a draft, and the frozen versions stay
readable and comparable.

#### Versions & approvals {#isp-reviews}

The life cycle and its ledger: *Draft → In review → Approved → Published → Retired*, with **Submit for
review**, **Approve**, **Reject (changes requested)**, **Send back to draft**, **Publish**, **Start a new
version**, **Retire**, **Reinstate as a new version** and **Mark as superseded**. The approver of a version
must not be its author or the person who submitted it; publication checks that the content still has the
approved hash (**Verify the hash**). Reviews are scheduled (review date) or triggered by a regulatory change,
an incident, a finding, a risk, an organisational or a technology change. **Approval ledger (.json)**
exports every transition with who, when and the hash.

#### Applicability & assignments {#isp-applicability}

Applicability rules by organisational unit, role, system or supplier, and **assignments** of policies to
people or groups with due dates. A policy without rules applies to everyone; with *include* rules at least
one must match, and an *exclude* rule always wins. **Check applicability** shows whom a policy reaches; each
assignment keeps the rules that matched when it was made.

#### Acknowledgements & training {#isp-acks}

**Record an acknowledgement** of an exact version by a person on a date; training requirements and
**Record the completion**; **Coverage of the versions in force**; **Acknowledgement ledger (.csv)**. An
acknowledgement says that a person read and accepted a version — it is not compliance, and neither is
training. Publishing a new version creates a new obligation to acknowledge: earlier acknowledgements stay in
the ledger but do not count for it.

#### Non-compliance {#isp-issues}

**Record a departure from a policy**: a *non-compliance* (a requirement of the policy is not met) or a
*violation* (someone did not respect it), with what found it (audit, incident, monitoring or logs,
self-assessment, report by an employee, supplier review), severity, owner, corrective action and due date.
**Corrective action** creates it in the shared action register; **Make it a risk** adds a risk of category
*Compliance* to the risk register. **Exceptions** — accepted, time-limited departures — live in the shared
exception register (**Open the shared exception register**): an exception needs a justification, an expiry
date and an approver who is not the requester, and it never waives a law. Exceptions still recorded in this
module are listed with **Move to the shared register**. **Non-compliance register (.csv)** exports the list.

#### Security Policy Writer {#writer}

**Governance → Security Policy Writer** writes the policy set of the organization — the enterprise
information security policy, topic-specific policies, standards and procedures — in English, French or
both, from an interview, the organization's own documents and the CyberRiskGuardian Ontology (CRGO).
**The Writer writes; ISP management manages**: every document it produces is a *draft* in ISP management,
where it is reviewed, approved (frozen with its SHA-256 hash), published, assigned and acknowledged. Nothing
is invented: an unknown fact becomes a highlighted placeholder such as `[DECISION: …]`, and a law is used
only after a named reviewer records that it applies. The Writer has its own version (0.1.0 beta); its engine
runs in the local helper on this computer, so the launcher must be running.

##### Start {#writer-start}

Where the Writer stands, the **Language of the documents** (English, French, or both — each document is then
written twice with the same statement identifiers) and the depth of the **Interview** (Express, about twenty
questions; Standard, about sixty). **Propose answers from the profile and the documents** reads the
organization profile, the crown jewels and the context documents of the workspace and proposes answers, each
with its source. **Clear the Writer data** forgets the answers, facts, legal decisions and selection; the
policies already in ISP management stay.

##### Interview {#writer-interview}

Questions about the organization, grouped in short sections. Each answer shows where it came from — *your
answer*, *from a document*, *from the organization profile*, or *default accepted* — with who and when.
**Unknown**, **Not applicable** and **Decide later** are answers too: the drafts then carry a placeholder.
*Governance observations* are patterns from *Introduction to Cybersecurity Governance* that the answers
suggest; they are points to discuss, never facts written into a policy.

##### Documents & facts {#writer-documents}

Facts proposed from the context documents (Organization → Context documents) and from the organization
profile: the question, the proposed value, the **quote** it rests on and where it was found (document, page,
paragraph). **Confirm** makes it the answer; **Reject** discards it; **Confirm all without conflict**
confirms the others at once. When two sources disagree they form a *conflict*, and neither value is used
until you confirm one. Passages that look like instructions to an AI are **set aside**: never read for facts,
never sent to a model. A scanned file has little or no text: **Read with OCR…** recognizes it on this
computer (Tesseract and Poppler must be installed; the file is not uploaded anywhere), and facts read by OCR
get a lower confidence. **Propose more with AI…** sends the documents' text through the usual preview and
keeps only the facts whose quote is found word for word in the documents.

When you create a workspace from documents (Organization → Workspaces), **Also extract policy facts for the
Security Policy Writer** does the same reading right away, without AI.

##### Legal applicability {#writer-legal}

Laws, regulations, contracts and frameworks that may apply. For the instruments CRGO knows (P-39.1, A-2.1,
R-22.1, PIPEDA, OSFI B-13, GDPR, C-1.1), the ontology's evaluation of the organisation profile is shown as
evidence; **Evaluate the profile now** runs it, and **Add them to the CRGO profile** adds the values your
interview implies (never marking a list complete — unknown stays unknown). Other candidates (sector rules,
contracts, frameworks) are the Writer's own. For each candidate choose a **Decision** — *Applies*, *Does not
apply*, *Needs legal review* — and give the **Reviewer (a named person)** and a **Rationale**, then
**Record**. A clause that depends on a law is drafted only when its candidate *Applies*. This is not legal
advice.

##### Library {#writer-library}

The 28 documents of the catalogue by level — enterprise policy, topic-specific policies, standards and
procedures — with their priority, the reasons for it, and the **Scenarios** they address: those of this
workspace whose ontology controls or measures share a CRGO control with the document (in red when above
tolerance), and how many scenarios of the CRGO library its controls treat. Tick the documents and **Save the
selection**; **Use the recommendation** ticks the recommended set again.

##### Decisions {#writer-decisions}

The choices the documents depend on — delays, scopes, approvers, frequencies — grouped by document, each with
its suggested value. **Accept all suggestions** fills every unanswered decision that has a suggestion and
records each one as a *default accepted* by you with the date; **Accept the suggestions for this document**
does the same for one document. Decisions that need legal review, or have no suggestion, are never filled
automatically: they stay open and are listed for you to decide. Answers already given are never changed.

##### Generate drafts {#writer-generate}

**Generate the drafts** creates or refreshes, for each selected document and language, a draft policy in ISP
management: the purpose and scope, one clause per section, and one statement per requirement with its
modality and CRGO control identifiers; policies of one topic share a policy family. Only a draft changes. A
published document is regenerated as a new version only when you tick **start a new version**; one in review
or approved is left as it is. A statement someone edited after the last generation — in the Policy editor or
through Word — is **kept** and reported as *kept as edited*. **Quality checks** list open decisions,
clauses for legal review, missing parent documents, implementation gaps and disagreeing documents.
**Improve the wording with AI…** rewords the statements of one draft; a rewording is refused when it changes
a placeholder, adds a number, changes the modal verb or the length too much, and you tick the ones to apply.

##### Word export & re-import {#writer-word}

**Word (.docx)** writes a native Word document of a policy — document control, contents, numbered clauses and
statements, open decisions, traceability of every statement to its basis and controls — for any policy of ISP
management, not only the Writer's (also on the Policy editor). A frozen version can be exported (**Word of v…
in force**) but never changed. **Re-import from Word…** reads a copy edited in Word: each statement is
matched by its hidden marker (or by its number when the marker was removed), every change is shown word by
word — modified, deleted, added, with a change of *must* to *should* flagged — and only the changes you leave
ticked are applied, to the draft.

### 7.5.3 Cybersecurity management {#csm}

A module. How the organization knows its controls work, who governs and decides, and what happened.

- **Control testing** — each test of a control: the control (an existing control of a scenario, or a
  safeguard of the inventory), what was tested, the date, the **assessor line** (management
  self-assessment, second line, internal audit, external assurer), the **aspect** (design, implementation,
  operation), the result (effective, partly effective, ineffective, not tested), the assessor and the
  evidence; for operating effectiveness, the period, population, sample size and deviations. *Control
  evidence by line of defence* shows, per control, the latest result of each line, the open audit findings
  and the confidence that results (*confirmed by an independent line*, *lowered*, *self-assessed only*,
  *not verified*). When an independent result is worse than management's self-assessment the control is
  flagged **conflict — resolve**: both stay visible until a person decides; the application never resolves
  it.
- **Governance** — governing bodies and committees (kind, reporting line, mandate, members, frequency);
  roles by line (person, role, line, body, from, to); **delegations of authority** (who delegates to whom,
  for which decisions — risk acceptance, treatment, funding, policy exception —, the limit, the dates, the
  reference).
- **Decisions** — decision records: subject, kind, outcome (*draft — management decision required*,
  approved, rejected, deferred, escalated), date, decision maker, delegation, rationale, conditions. *Draft
  decision records for scenarios above tolerance* creates drafts; a decision other than a draft needs a
  named person, and a risk acceptance, funding or exception needs a delegation that names that person,
  covers that kind of decision and is valid on the decision date. A record the application drafted is
  decided only when a person confirms it.
- **Incidents** — the incident register: security events, incidents recorded from documents (to confirm),
  confirmed incidents, containment and closure; severity, assets, the **scenarios it informs**, the timeline,
  impact, cause and lessons. **An alert is not an incident, and not a finding**: an incident counts as one
  only when a named person confirms it on a date (SOAR → Cases → *Confirm as incident* does it for a case).
  The same records appear in SOAR → Incidents. When personal information is involved, a confirmed incident
  needs a **breach-reportability assessment** under Loi 25 s. 3.5 and, where it applies, GDPR Art. 33 — an
  assessment for qualified people, not legal advice; Compliance management computes the notification
  deadlines from the confirmation date. An incident informs a scenario's likelihood; it does not prove it:
  cite it in the rationale of Pb(A) and Pb(ψ,A).

### 7.5.4 Frameworks & standards {#frameworks}

Two registers, because they are two different things, and conflating them is how compliance tools end
up with rows that cannot be compared.

**Control catalogues** are lists of selectable controls. They feed *Risk mitigation* and the Statement
of Applicability in *Compliance*. Four are built in (your list, ISO/IEC 27002:2022, SP 800-53 Rev. 5,
CSF 2.0, CIS v8.1, ATT&CK mitigations). Three more are shipped with the app and loaded when you ask:

| Catalogue | Identifiers | In force | Families |
|---|---|---|---|
| NIST SP 800-171 Revision 3 (May 2024) | 130 | 97 | 17 |
| ITSP.10.171, second release (October 2025) | 131 | 98 | 17 |
| COBIT 2019 — governance and management objectives | 40 | 40 | 5 domains |

They were extracted from the publishers' own documents, not typed from memory, and each pack records
its source, edition and date. Withdrawn and unallocated identifiers are kept and marked, so a
reference from an earlier assessment still resolves instead of silently disappearing. The two 800-171
editions were cross-checked against each other: every requirement in force in the NIST edition is
present in the Canadian one, which adds exactly one — **03.14.09 Dedicated administration
workstation**. ISO/IEC 27001:2022 Annex A is registered as an alias of ISO/IEC 27002:2022, not a
second copy of the same 93 controls.

**Methods and standards** is a citation register, not a control list: ISO/IEC 27001, 27002 and 27005,
NIST CSF 2.0, SP 800-30, SP 800-53, SP 800-171, ITSP.10.171, COBIT 2019, CIS, CVSS v4.0, FAIR and the
CRG model itself. Each entry records what the method is, what CyberRiskGuardian uses it for, and —
the part that matters in an audit — **where CRG stops**. CRG does not claim conformity with any of
them. Two statements are worth reading before you cite either method: FAIR and CRG are *parallel*
quantification methods, not layers of one another (FAIR gives a monetary loss distribution, CRG a
dimensionless indicator against a tolerated risk), and CVSS is used **Base-only**, with the reason
stated.

**When a new edition comes out.** *Import* accepts a CRG pack, a NIST OSCAL catalogue or a CSV.
Nothing is written until you have seen the diff:

- controls **added**, **removed** and **retitled**;
- controls **renumbered** — the case where a control keeps its title under a new identifier, which a
  plain added/removed diff would report as an unrelated loss and gain;
- and the **impact**: every measure and every Statement-of-Applicability row, across all workspaces,
  that points at a control the new edition moves or drops, named individually with its new identifier
  where there is one.

Nothing is remapped automatically. You accept the import, then fix the named references yourself —
because a renumbering that looks obvious in a diff is not always the same control in substance. Each
installation keeps a revision log of what was imported, when, and what it changed.

Offline, `tools/build_frameworks.py` converts and validates a pack without the app, and
`tools/extract.py` with `tools/build_packs.py` rebuilds the bundled packs from the source PDFs.

### 7.5.5 Shared registers {#shared}

Four registers kept **once** and used by every management module — ISP, compliance, audit, cybersecurity
management, SIEM and SOAR. A record links to what it concerns (`kind:id`, one per line — for example
`obligation:OBL-001`, `policy:POL-03`, `finding:F-002`, `case:CASE-01`), and each module shows the records
linked to what you are looking at.

| Tab | What it holds | The rule |
|---|---|---|
| **Evidence** | Evidence metadata: what it shows, for which period, how long it stays valid, the custodian, where it is kept (path or link), an optional SHA-256, and whether it was judged sufficient. | Expired evidence, or evidence judged insufficient, is an **evidence gap** — never support for a compliance state. The file stays where it is kept; only its description and hash are recorded. |
| **Corrective actions** | Corrective and remediation actions raised from findings, non-compliance, incidents and lessons learned: owner, due date, status. | An action closes only when **someone other than its owner verified it**. Overdue actions are evidence of weak control operation. |
| **Exceptions** | Approved, time-limited departures from internal requirements: scope, approver, compensating controls, expiry, the scenarios that count on it. | **An exception never waives a law**: a departure from a legal obligation is a non-compliance. Only an authority grants a regulatory exemption (Compliance management). |
| **Mappings** | Qualified mapping assertions between a policy statement or control and an obligation or framework requirement: *exact*, *full*, *partial*, *broader*, *narrower*, *related* or *conflicting*, against which edition, why, with what confidence and who reviewed it. | **A mapping is never compliance**: only a dated determination backed by evidence states a compliance state. A reviewed mapping names its reviewer. |

Evidence records and policy exceptions entered before the shared registers existed were moved here
unchanged by the data migration (section 5.1).

### 7.5.6 Quality review {#qc}

Eighteen checks to run before a report or a write-back leaves the analyst, each with *pass*, *attention* or
*fail*, the detail, and a button to the screen that fixes it.

| Check | What it verifies |
|---|---|
| QC-01 | Write-backs to the ontology are proposals with a model version and inputs. |
| QC-02 | Nothing is called approved unless a person approved it, under valid delegated authority. |
| QC-03 | "Supported by a control" is not called "compliant". |
| QC-04 | EPSS is not used as a likelihood (a likelihood equal to the EPSS score of the scenario's CVE, or a rationale saying it was set from EPSS, fails). |
| QC-05 | Unknown applicability is an evidence gap; potentially applicable needs qualified review. |
| QC-06 | Conflicts between lines of defence are resolved by a person. |
| QC-07 | Expired exceptions are not counted as mitigations. |
| QC-08 | No exception waives a law. |
| QC-09 | The organisation base is the organisation's own. |
| QC-10 | Fictional cases and ontology priors are not calibration evidence. |
| QC-11 | Evidence is current. |
| QC-12 | The engine reproduces the MediBec baseline (84,491 / 41,104). |
| QC-13 | Licensed standards are cited by identifier only. |
| QC-14 | No obligation is called compliant from a mapping, an acknowledgement or an attestation: every determination *satisfied* rests on current evidence of the shared register. |
| QC-15 | No incident is inferred from an alert: every incident has a confirmation by a named person on a date. |
| QC-16 | No response action is presented as authorised without a valid approval (containment or destructive actions without one are listed as audit signals). |
| QC-17 | TLP:RED and TLP:AMBER+STRICT material stays out of reports, recommendations, scenario rationales, communications and exports. |
| QC-18 | Source confidence is never used as a probability (a likelihood rationale relying on a STIX, feed or indicator confidence fails). |

A pass means the rule was not visibly broken in the data recorded here; the checks support a reviewer,
they do not replace one.

### 7.6 Compliance management {#compliance}

One screen whose tabs are listed directly in the menu. Obligations and their sources, applicability,
programmes, mappings, assessments, determinations with evidence, deadlines, submissions and regulatory
change. Two rules run through all of it: **only a dated compliance determination backed by evidence states a
compliance state** — a mapping, a policy acknowledgement or an attestation never does; and this is
**decision support, not legal advice** — applicability and interpretations need qualified review.

#### Dashboard {#compliance-dashboard}

Where compliance stands: obligations applicable, determinations and evidence, deadlines, submissions and
legal exposure — each figure with its denominator. *Not assessed* and *undetermined* are never counted as
compliant. An exception that concerns a legal provision is a compliance exposure unless an authority
granted an exemption.

#### Sources & obligations {#compliance-obligations}

Regulatory **sources** (laws, regulations, contracts, standards) with their versions or editions; **atomic
obligations**, each citing its source, version and provision — **Add its provisions** creates them from a
source; **interpretations**; **authorities**; and **exemptions**. An obligation's text is a paraphrase, never
the licensed text of a standard. An interpretation can be *legally privileged*: its content is then withheld
from reports and AI. Only a regulatory authority grants an exemption; an internal exception never waives a
law.

#### Legal applicability {#compliance-applicability}

The organisation profile in the ontology's terms: organisation type, where it is established, offers
goods or services, or monitors behaviour; its processing activities with their data categories, where the data
subjects are and where data is transferred; and which of these the profile lists completely. *Evaluate in the
browser* runs the port of CRGO's evaluator; *Evaluate with CRGO (helper)* runs the original. Each instrument —
Loi 25 (P-39.1), A-2.1, R-22.1, PIPEDA, OSFI B-13, GDPR, C-1.1 — is *applicable*, *not applicable*, *potentially
applicable* (**qualified review required**) or *unknown* (**evidence gap — organizational input required**),
with the conditions met, not met and unresolved. A value the profile does not list counts as absent only for the
properties ticked as complete; otherwise the fact is missing, and missing data never makes an instrument "not
applicable". This is not legal advice.

#### Programmes & frameworks {#compliance-programmes}

The compliance programme, its objectives, and the **frameworks adopted** for a stated scope. An adoption is a
decision — who decided, when, for which scope. It makes the framework's requirements commitments; it says
nothing about compliance with them.

#### Mappings {#compliance-mappings}

The qualified mappings between policy statements or controls and obligations, kept in the shared mapping
register (section 7.5.5): type of correspondence, edition, rationale, confidence, reviewer. A mapping says
how two requirements correspond. It is never compliance.

#### Frameworks & checklists

**Frameworks & checklists.** Tick the frameworks the organization follows. For each, the **statement of
applicability** lists the controls with applicable, status, maturity 0–5 and target, owner and evidence,
and the measures and scenarios linked through Risk mitigation. *Mark … implemented by measures* sets the
controls of implemented measures. **Gaps** (applicable, not or partly implemented) are ranked by the
residual risk of the scenarios they relate to; *Create measure* starts one. The **Law 25** and
**PIPEDA** checklists summarize obligations for risk-management purposes with status, owner, evidence,
due date and related controls.

#### Requirements

**Requirements.** The organization's own compliance requirements beside the catalogues — laws,
regulations, contracts, standards and internal policies. Each has a set, a reference, the requirement,
a category, a source, an owner, a due date, whether it applies, a status, the evidence, and the
**controls that meet it**; the table also shows the published security policies covering those
controls. Add them one by one, or import:

- **Add the Law 25 and R-22.1 obligations** — the Quebec private-sector act (P-39.1) and health-
  information act (R-22.1) obligations the ontology links to risk scenarios;
- **Add the published policy statements** — each statement of a published policy becomes an internal
  requirement with its controls;
- **From a list** — one requirement per line: `set;reference;requirement;category;controls`.

Requirements can also be imported from a CSV file (**Import requirements**).

#### Campaigns {#compliance-campaigns}

Assessment campaigns over a set of obligations, for a scope and a period; they produce the compliance
determinations (**Assess**). Each determination needs evidence from the shared evidence register or an
explicit evidence gap. **The assessor cannot be the owner of the obligation, and the reviewer who approves
cannot be the assessor.** **Approve and freeze** freezes the campaign and its determinations.

#### Determinations {#compliance-determinations}

Compliance with a provision or an obligation at a date: the state (*satisfied*, *partially satisfied*,
*unsatisfied*, *not assessed*, *undetermined*), who assessed, the evidence and the **evidence gap**.
*Satisfied* needs current evidence; partial, unsatisfied and undetermined need the gap stated; expired or
insufficient evidence is a gap, not support. Determinations made in an approved campaign are frozen.
*Obligations the scenarios touch* lists, per scenario, the provisions it is linked to and the controls that
**support** them — a link, not a conclusion.

#### Regulatory calendar {#compliance-calendar}

Regulatory deadlines: fixed dates (with **Next occurrence** for recurring ones) and deadlines counted from an
event, answered or not (**Record as answered**). **An event-triggered deadline starts only from a confirmed
incident** — a named person and a date — never from an alert; the calculation is shown with each deadline.

#### Submissions {#compliance-submissions}

Notifications and filings to authorities: **Prepare a submission**, its approval, the date sent, the receipt
reference and the acknowledgement. Nothing is sent to an authority by the application, and nothing is
recorded as sent without a human approval; the person who prepared a submission cannot approve it. A notice
recorded from a SOAR incident appears here too.

#### Regulatory change {#compliance-changes}

New, amended or repealed provisions, their impact and the work they create (**Create work items**). An
amendment creates a new version of the obligation (**New obligation versions**); the old version stays
attached to the determinations made against it.

#### AI-assisted assessment

**AI-assisted assessment.** Choose the scope (your requirements, by set, or a regulatory checklist), the
items (not assessed yet, or all — up to forty at a time) and the method:

- **Rules — offline.** For each item with related controls, the status follows what the workspace
  records: the statement of applicability, safeguards in place, implemented measures and published
  policies. The evidence names them; the gap says what is missing.
- **AI — preview before sending.** The same evidence (and, if ticked, excerpts of the documents) goes to
  the model, which must answer **unknown** when the evidence does not allow a conclusion, cite the
  evidence it relied on, state the gap, a confidence and a provenance tag. Payload editable,
  creativity selectable.

Click **Propose**. The review shows each item's current and proposed status side by side, the evidence
(editable) and the gap. Items already assessed are left unticked. **Apply the ticked proposals** writes
the status and evidence with *how it was assessed* — *rules accepted* or *AI accepted*, by whom, when.
The applied assessments are listed.

Every proposal is a draft; legally privileged interpretations are never sent.

#### Reporting {#compliance-report}

**Reporting.** One view across the frameworks, checklists, requirement sets, security policies
(published, reviews overdue) and policy non-compliance. **Record a snapshot** keeps today's percentages
so the next review shows the trend. **Full compliance report (.md)** gathers the statements of
applicability, the checklists, your requirements with how each was assessed, the security policies and
their non-compliance; **Printable report** opens it formatted for printing; **Requirements (.csv)**
exports the register. The Excel export carries the statement of applicability in its Compliance_SoA
sheet.

The **compliance posture** lists each obligation with its applicability, latest determination, evidence
status, exceptions without exemption and next deadline; it never states compliance from a mapping. The full
compliance report adds the legal-applicability table (state, unresolved conditions, qualified review needed)
and the determinations, and cites the CRGO release.

### 7.7 Audit management {#audit}

Risk-based audit planning, engagements, workpapers, findings, reports and independent follow-up. Audit
management is the **only owner of audit records**: other modules link to them, none of them changes an audit
conclusion. A compliance status, a risk score or a policy acknowledgement is never an audit conclusion.
IIA, ISACA ITAF, AICPA, COSO and ISO audit standards are referred to by identifier only; their text is not
reproduced. The tabs are listed directly in the menu:

#### Dashboard {#audit-dashboard}

Plan progress, issued findings, overdue actions, workpapers awaiting review and assurance coverage, with their
denominators; engagements by state, high-risk unresolved findings and recent audit events. Counts of findings
include **issued** findings only; preliminary observations and findings not yet issued are shown apart.

#### Charter & methodology {#audit-charter}

The **audit charter** (purpose, authority, independence, reporting line) and the **audit methodology** (how
engagements are planned, performed and rated, and the weights of the risk-based plan). Edit the working copy,
then **Approve this version**: it is frozen with a SHA-256 hash; a later change is a new version and the
previous one is kept as superseded.

#### Audit universe {#audit-universe}

The auditable entities — processes, systems, suppliers, units — with inherent risk, last audit and links to
assets, processes and scenarios. Each entity stands for one canonical record (for example `asset:A-001`): a
second entity for the same record is refused. **Add critical and high assets not yet in the universe** does
it in one step.

#### Audit plan {#audit-plan}

The risk-weighted plan: **New plan**, entries scored from the universe — inherent risk, time since the last
audit and the residual risk of their scenarios, read from the engine and never changed — with the weights and
the source risk version recorded (**Rescore**, **Set capacity**). A deferred or cancelled entry needs a reason
and the person who authorised it; a mandatory entry is never dropped for a low score. **Submit for review**,
**Approve and freeze**; **Amend (new version)** creates a new version; **Create the engagement** starts one
from an entry.

#### Engagements {#audit-engagements}

Audit and assurance engagements: type (internal audit, compliance audit, external assurance, second-line
review, control self-assessment review), scope, objectives, criteria (identifiers: SP 800-53A objectives,
laws, policies, contracts), team and a recorded state machine — *planning → fieldwork → reporting → follow-up
→ closed*. Fieldwork needs a scope, a lead, objectives and criteria, and a team without unresolved conflicts
of interest; reporting needs every workpaper signed off; closing needs an issued report and closed findings.

#### Procedures · SP 800-53A {#audit-programmes}

The **procedure library** (versioned: changing a version a workpaper already used creates a new version, so
earlier work keeps the exact procedure it followed); **SP 800-53A assessment objectives** — search any SP
800-53 control to see its objectives and the objects to *examine*, the people to *interview* and the
mechanisms to *test* (NIST SP 800-53A Rev. 5, as CRGO binds them to SP 800-53 Rev. 5.2.0); and CRGO's two work
programmes, **AUD-PAM-001** (privileged access) and **AUD-VULN-001** (vulnerability remediation), with method,
objectives, expected result, exception logic and sampling. They are **illustrative — not a validated audit
methodology**: **Copy into the procedure library** or **Plan an engagement with this programme** to adapt
them.

#### Workpapers & sampling {#audit-workpapers}

**New workpaper** for a procedure: preparer, independent reviewer and sign-off. The person who prepared a
workpaper cannot be its sole reviewer. **Sign off** locks it with a hash; **Reopen** is recorded with the
reason. **Draw** a sample: it keeps its population snapshot, method, size, seed and selected items, so
**Re-run** gives the same selection. **Record an observation** where an exception was found.

#### Observations & findings {#audit-findings}

An **observation** is preliminary: it is not a finding and is not counted as one. **Validate as finding**
against criteria and evidence: criterion, condition, cause, effect, significance, the control and scenarios
concerned, and the recommendation. A finding **issues** only with criterion, condition, effect and evidence (or
a stated evidence limitation); its conclusion then cannot be edited. An open finding on a control lowers
confidence in it wherever the control is used.

#### Responses & follow-up {#audit-followup}

Management responses, corrective actions (kept in the shared action register — one action can answer an audit
finding and a compliance nonconformity while each keeps its own conclusion), **independent follow-up
verification**, closure and reopening. Management owns the remediation; audit owns the closure decision. A
verification is done by someone other than the action owner; a failed verification reopens the action and the
finding. **Close on risk acceptance** records that management accepted the risk instead. The *closure and
reopening history* is kept.

#### Reports {#audit-reports}

Draft, supervisory review, approval, then **Issue report**: an immutable issued snapshot of the engagement,
its issued findings, recommendations and responses, with a SHA-256 hash. Corrections after issue are
**addenda**, chained by hash. **Export .md** and **Export .csv**.

#### Quality & independence {#audit-quality}

Supervisory and quality reviews, conflict-of-interest declarations and safeguards. A person with a declared
conflict on an engagement cannot be assigned until a safeguard is recorded and authorised by someone else; a
reviewer never reviews their own work.

#### SOC reports & evidence {#audit-assurance}

SOC and other assurance reports received from service organizations — type, period, opinion, Trust Services
Criteria categories, **exceptions**, the **complementary user entity controls** expected of you and how you
meet them, the scenarios that depend on the provider — and the shared evidence register, linked to
engagements, workpapers and findings. **Hash a local file and register it** records its SHA-256 and
provenance; the file itself stays where it is kept. Evidence past its validity date is flagged as stale.

#### Traceability {#audit-trace}

The chain from the universe to closure — universe → plan entry → engagement → procedure → workpaper →
observation → finding → recommendation → response → follow-up → closure — with the breaks in each chain.

### 7.8 Security operations

A **local** SIEM and SOAR for the risk analyst and the classroom. Nothing here connects to a live product:
telemetry lists, rules, alerts, indicators, playbooks and cases are **imported from files** exported by your
tools (formats in `docs/SIEM-SOAR-IMPORT-FORMAT.md`), response actions are **recorded by hand**, and playbooks
are tested by **dry-run simulation** — nothing is executed on a real system. Your SIEM stays the system of
record for events: an event here is a pointer (reference, time, hash, link). Nothing here changes a risk score.

The rules, as CRGO states them:

- **An alert is never an incident.** Escalation opens a SOAR case; only a confirmation by a named person on a
  date makes an incident.
- **Nothing authorises a response action.** Approvals are human decisions recorded in SOAR; an action without a
  valid approval is an audit signal, never an authorisation by the application.
- **Coverage is validated only by an effective detection test** of the rule's current version, with healthy
  telemetry.
- **Source confidence is not a probability.** A producer's confidence (0–100) is shown as stated and never
  feeds Pb(A) or Pb(ψ,A); an indicator match is not an attribution.
- **Respect TLP 2.0.** TLP:RED and TLP:AMBER+STRICT items are masked on screens unless you opt in on this
  computer, never sent to AI, and left out of exports unless you choose to keep them marked.

### 7.8.1 SIEM {#siem}

Security monitoring from local files: telemetry health, detection rules, coverage of the risk scenarios,
alerts and threat indicators.

#### Overview {#siem-dashboard}

Telemetry health, rule lifecycle, coverage, the alert queue and indicators at an **as-of date** (**Today** resets
it). Change the date to see the state recorded on that day: later tests, health observations and status changes
are ignored.

#### Telemetry sources {#siem-sources}

The sources that feed detection (an OCSF event class can be named), their expected cadence and their health —
*healthy*, *degraded* or *silent* — with **Record health** for an observation. A source is silent when its latest
health observation says so, or when its last event is older than three expected cadences. **A rule whose required
telemetry is silent does not detect.** Event records are pointers to the SIEM; the event itself stays there.

#### Detection rules {#siem-rules}

Rules with version, lifecycle status (*draft*, *testing*, *production*, *disabled*, *retired*), ATT&CK techniques,
scenarios, required telemetry and **detection tests**. **Import pasted Sigma** (or a Sigma file in the Import tab)
keeps the title, id, status, level, description, log source, `attack.t…` tags and the detection block; a Sigma
status never puts a rule in production. A rule goes to production only from testing, after an effective detection
test of its version, with the name of an approver who is not its owner.

#### Coverage & gaps {#siem-coverage}

The coverage matrix: which scenarios and ATT&CK techniques are detected, by which rules, validated by which test.
*Validated* needs an effective detection test of the rule on or before the as-of date; silent or degraded required
telemetry makes the coverage *degraded*; a rule in draft, disabled or retired gives none (*missing*); a rule never
tested is *untested*. **Record gap** for what is missing or degraded, and **Corrective action** links it to the
shared action register.

#### Alerts & triage {#siem-alerts}

Alerts imported from the SIEM or from STIX sightings, in a **triage queue with crown jewels first**, then severity
weighted by the criticality of the asset — not by arrival time. Set the triage (*new*, *in triage*, *benign*,
*false positive*…), **Add note**, or **Escalate to a SOAR case**. An alert is never an incident: escalation opens a
case, and only an incident confirmation by a named person makes an incident.

#### Indicators & TLP {#siem-intel}

Threat indicators with their source, validity, **source confidence** as stated and **TLP** marking, beside the
threat-feed watch list (*Indicators across SIEM and threat feeds*). A revoked indicator, or one past its *valid
until*, is **stale** and supports no inference. **Export indicators (.csv)** asks what to do with TLP:RED and
TLP:AMBER+STRICT items: **Export without them** or **Include them, marked**.

#### Import {#siem-import}

Import from local files: the `crg-siem-import/1` envelope (JSON), Sigma (YAML), STIX 2.1 bundles, alert lists (JSON
or CSV), telemetry sources and indicators (CSV) — drop a file or **Import pasted text**; with *Detect from the file*
the kind is read from the content. Every import is recorded with its SHA-256 in the import history and in Settings
→ Logs. Imports add records and never overwrite an original alert; a duplicate is counted and skipped.

### 7.8.2 SOAR {#soar}

Cases, incidents, versioned playbooks, approval gates, manually recorded actions and dry-run simulations.
Responders record what they did, when, with which attempt identifier and evidence, and each action is checked
against the recorded approvals.

#### Overview {#soar-dashboard}

Open cases, confirmed incidents, **executions without a valid approval** and playbook readiness. **Import a SOAR
file** reads a local `crg-soar-import/1` JSON file (playbooks, cases, gates, approvals, executions, simulations,
lessons); invalid records are skipped and listed in the **Import log**, and the import is recorded in the data log.

#### Cases {#soar-cases}

Investigations: timeline (**Add to the timeline**), assignee, status, forensic artefacts and actions recorded on
the case. A case moves *open → investigating → contained → eradicated → recovered → closed*, one stage at a time;
**Close the case** needs a rationale. **Confirm as incident** needs the name of the person who confirms and the
date: it creates or links the incident in the incident register, and Compliance management computes the
notification deadlines from the confirmed date.

#### Incidents {#soar-incidents}

The incident register — the same records as Cybersecurity management → Incidents — with impacts, communications,
recovery verifications and response measurements (**Propose from the recorded dates** fills times to detect,
contain and recover). A notice to a regulator is also recorded as a regulatory submission in Compliance
management.

#### Playbooks {#soar-playbooks}

Versioned playbooks: steps, actions, **risk classes**, gates and expected evidence. Edit the draft version (**Add a
step**); **Publish and freeze this version** freezes it with SHA-256 (**Verify hash**); published versions are never
edited — **New draft version from the version in force**. A containment or destructive step must require an
approval gate.

#### Approval gates {#soar-approvals}

A **gate** says which risk classes need approval and who may approve. An **approval decision** is made by someone
other than the requester, for a scope and a validity period, and can be **Revoke**d. A pre-authorisation is always
bounded by a scope and an expiry.

#### Actions {#soar-actions}

Manually recorded response actions: who did what, when, the attempt identifier, the evidence and the approval
relied on. Each execution is checked against the approvals — *absent*, *expired*, *revoked*, *not yet valid*,
*wrong authority*, *not corresponding* or *not granted*. This is an audit signal, never an authorisation by the
application.

#### Simulations {#soar-simulations}

**Run a dry run** of a playbook version against a case or a scenario (**Walk the steps (dry run)**): nothing is
executed. The dry run flags the steps needing approval and those without expected evidence, and **Record the
result** — passed or failed, with a date. A playbook counts as tested when a passed simulation exists for its
current version.

#### Lessons learned {#soar-lessons}

Lessons from cases and incidents; **Create corrective action** puts one in the shared register (Shared registers →
Corrective actions), where it closes only after independent verification.

### 7.9 Risk Registry {#registry}

A **shared catalogue of risks contributed by several organizations**. Its purpose: let an organization
see the risks that organizations like it have assessed — same sector, same region, same size, same
regulations — and contribute its own, anonymized. All its screens are in the **Risk Registry** menu.

> **How it is shared.** Contributions travel as packages (JSON, schema `crg-registry/2`) through a
> **shared folder** — a Google Drive, OneDrive or SharePoint folder synced on each participant's
> computer — or the helper's outbox, which the scheduled task uploads to the Drive registry folder.
> Each installation reads the packages in that folder into its own copy of the catalogue. There is no
> central server; a team server is designed (`MULTIUSER-ARCHITECTURE.md`,
> option B) and will keep the same package format.

**A risk card.** Each contribution is one risk told as a causal chain — threat source, event, weakness,
assets, consequence — with its treatment (the decision and the measures with their controls), the
contributor's six parameters and CVSS, the severity of its residual-to-tolerated ratio as a band, and a
**catalogue**:

| Dimension | Why |
|---|---|
| Industry sector | NAICS-aligned families, so a hospital and a clinic network meet under *Health care*. |
| Sub-sector | Free text, generalized on anonymization (“private clinic network”). |
| Region | Country and province or state — where the threat landscape and the law differ. |
| Organization size | A band, never a headcount. |
| Regulatory regimes | Law 25, PIPEDA, HIPAA, GDPR, PCI DSS… — risks follow obligations. |
| Ontology themes | The ontology's 23 themes (ransomware, third party, identity…). |
| Asset categories | The ontology's 10 categories (cloud, OT/IoT, identity…). |
| Threat source type | Adversarial, accidental, environmental, structural. |
| Impact dimensions | Confidentiality, availability, privacy, safety, financial, legal… |
| ATT&CK techniques | How it happens — the common language of threat intelligence. |
| Controls | ISO/IEC 27002, NIST CSF 2.0, SP 800-53 references of what treats it. |
| Maturity band | The contributor's overall CSF maturity, as a band — context for the values. |
| Severity band | From the contributor's residual-to-tolerated ratio — never the raw figures. |
| Evidence level | Observed incident, assessed, hypothetical, or threat intelligence. |
| Valid until | Risks age; a card past its date is shown as stale. |

The ontology's vocabularies make cards from different organizations line up without anyone agreeing on
words: a scenario linked to the ontology (Scenario editor → *Ontology · CRGO*) carries its themes, asset
categories and threat source types into its card.

### 7.9.1 Browse & search

**Read the shared folder** reads every package in the shared folder and the outbox (the helper must be
running); **Read package files…** reads packages you received another way. The filters: search words,
industry sector, region, size, theme, asset category, regulation, threat source, ATT&CK technique,
severity and evidence, with **Moderated cards only** and **Hide stale cards**. **Organizations like
mine** sets the filters from your profile. **Details** shows a card in full. Tick cards and click **Use
ticked cards in this workspace**: they go to Batch scenarios marked *[Registry]*, every parameter at Low
confidence with the rationale *describes another organization; re-estimate for this one*. **Download
these cards** saves the filtered set as a package.

### 7.9.2 Contribute risks

**Privileged users only**: in single-user mode, the one person; in multi-user mode, an administrator or a
user holding **A** (Accountable) on step 13. Others can browse.

1. **The risks to share** — tick scenarios of the workspace.
2. **How they are catalogued** — filled from the profile (sector, sub-sector, region, size,
   regulations, maturity band); adjust them, choose the **evidence level** and the validity in months.
3. **Anonymization** — **on by default**. Organization, people and asset names, e-mail, IP addresses,
   internal hosts and amounts are replaced; the region is kept at province or state level (or country —
   *Registry settings*) and the size as a band. Switching anonymization off asks for a second
   confirmation, and the cards then say *not anonymized*. The screen lists any workspace term still
   present, and shows the package itself before you share it.
4. **Share** — **Share to the registry** writes the package into the shared folder (or the outbox);
   **Download the package** gives you the file.

### 7.9.3 My contributions

What this installation has shared: date, package, cards, where, anonymized or not, the workspace.
**Withdraw** publishes a *withdrawal* package: other installations mark those cards withdrawn the next
time they read the folder. Copies already taken cannot be recalled.

### 7.9.4 Moderation

Privileged users approve or reject the cards waiting for a decision — check that each is anonymized, is
a real causal chain rather than a threat name, and is catalogued sensibly; a rejection asks for a
reason. **Publish the curated package** writes the approved, current cards as one package; readers who
tick *Moderated cards only* see exactly that set.

### 7.9.5 Publish & share — the full package {#share}

**Publish & share** publishes the **whole** risk register and scenario registry of
the workspace as one package (`crg-registry/1`), for management, auditors or a partner. Choose the
content (risk register with threats and vulnerabilities, scenario registry, measures), the scope and the
format (JSON, Markdown, CSV). **Anonymize this package** replaces the organization's names, people's
names, asset and host names, IP addresses, internal URLs and domains, e-mails, phone numbers and postal
codes, turns amounts into ranges, and optionally truncates dates, drops free text and replaces your own
list of terms; ATT&CK, CWE, CVE and control identifiers and the parameters are kept. Read the preview: a
banner lists any workspace term still present. Then **Download**, **Copy** or **Publish to the shared
registry**. Each publication is logged; the re-identification table stays in the workspace and is never
published. **Import a shared registry** reuses others' scenarios as a library — imported scenarios are
excluded from the calculator until you review them. The Risk Registry reads these packages too.

### 7.9.6 Registry settings

The **contributor alias** shown on your cards instead of your organization's name; the **region
granularity when anonymized** (province or state, or country only); the **shared registry folder on this
computer**; the recommended dimensions with the reason for each; the packages read on this computer,
and **Forget the cards read** (your contributions and moderation decisions are kept).

### 7.10 Tools

### 7.10.1 CVSS v4.0 {#cvss}

A Base-score calculator. Threat and Environmental metrics are deliberately absent. Paste a vector to
load it, send it to the risk calculator, or — when opened from a scenario — save it back.

### 7.10.2 Budget — years, multi-year projects, and bands from risk-averse to risk-seeking {#budget}

**Budget years.** Choose the **budget year** at the top; the table lists every year with its total IT
budget, planned cyber spend, actual cyber spend, baseline (run) cost and a note. *Add* the next or
the previous year — a new year copies the previous one as a starting point. For each year the table
shows the initiatives committed that year, baseline + committed as a share of the IT budget, and
where that sits against the guideline (below the 4% floor, below / at / above the appetite target,
above the 12% ceiling). The **chart by year** shows baseline and committed initiatives stacked, the
planned spend (bar) and the actual spend (◆), all as a share of that year's IT budget, against the
4% / 7.8% / 12% lines and the appetite target.

**Projects over several years (3 years max).** Each initiative has a start year, a number of years
(1–3) and a split: *initial in year 1, recurring each year* (the default), a *percentage of the
3-year total*, or *amounts per year*. A warning appears when percentages do not add up to 100%, or
when initiatives commit spending in a year not yet in the table.

The calibrator, the band chart, the arbitrage options and the funding frontier below all work on the
**selected year**.

The guideline: **12%** of the total IT budget (salaries included) at an appetite of 0.30 or below,
**7.8%** at 0.50, **4%** at 0.70 or above, linear in between. The screen gives the
appetite-consistent target, the implied appetite of current spend, and a warning when the two
disagree by 0.10 or more.

**Band chart.** The x-axis runs from risk-averse to risk-seeking appetite; shaded bands mark the
risk-averse, neutral and risk-seeking zones, with margin zones for spend above 12% or below 4%.
The curve is the guideline; the diamond is the stated appetite; the other points are the current
spend and four **funding options**, each placed at the appetite its total spend (baseline + Year-1
treatment) implies:

- **A** status quo — baseline only;
- **B** bring above-tolerance scenarios down — fund every scenario whose untreated risk exceeds tolerance;
- **C** best value within the appetite-consistent budget — fund scenarios in cost-effectiveness order up to the target;
- **D** full treatment portfolio.

The **arbitrage table** compares their cost, share of IT, implied appetite, residual risk and the
number of scenarios left above tolerance. The **funding frontier** shows residual risk falling as
scenarios are funded in cost-effectiveness order, with the treatment envelope available at 4%, 7.8%
and 12% after the baseline, and a table saying which band funds each scenario. Shared initiatives
are split across scenarios, so no investment is counted twice; the actual purchase decision is per
initiative.

### 7.10.3 Export · Excel {#export}

- **Excel workbook (.xlsx) — regenerated from scratch.** Every export builds a new workbook from the
  current workspace, with **live formulas**. Parameters, Inputs, Analyse, Portfolio, Sensitivity and
  Case_View follow `build_workbook.py` cell for cell; Scenarios, Candidates, KRIs and Evidence are
  the supporting registers; Organization, Threats, Vulnerabilities, Recommendations, KRI_History,
  Budget (single-year calculator, budget by year and multi-year allocation, with formulas) and
  Threat_Context are added by the app. Options:
  - **Scenarios** — included in the Risk calculator; all; only above tolerance; above or
    approximately at tolerance; or **picked for this export** from a searchable list (*Pick shown*,
    *Unpick shown*, *Start from the calculator selection*).
  - **Sheets** — tick the optional sheets to include (README, Parameters, Inputs, Analyse and
    Portfolio are always included).
  - **Budget years** — which years appear in the Budget sheet; **KRI history** on or off.

  A preview line gives the number of scenarios and sheets before you generate. Shared initiative
  costs are re-split across the exported scenarios, and the README records the scope chosen.
- **Assessment JSON** — all or included scenarios, readable by `crg_calc.py`, `build_workbook.py`
  and the plugin. ATT&CK, CWE and CVE links travel as optional fields that change no total.
- **Context pack** — Markdown for the CyberRiskGuardian agent. It contains the full text of your
  documents: give it only to an AI service authorized for that data.
- **Workspace backup** — everything except the snapshot (download that from Threat context).

Every file is saved to your browser's download folder, and each export is recorded in Settings → Logs
(data log).

### 7.10.4 AI assistant {#ai}

The analyst, the parameter critique, scenario generation, briefing narration and the decision log — section 8.

### 7.10.5 Forecasts {#forecast}

Two forecasts, both through the verified engine, **neither using AI**.

**Monte Carlo.** On the *Parameter ranges* tab, turn any parameter of any scenario into a three-point
range — minimum, likely, maximum — with a **triangular**, **uniform** or **PERT** shape. Leave a
parameter alone and it stays a single value. Then run the trials: you get the median portfolio risk,
a 90% interval, the probability of exceeding tolerated risk, and a histogram.

The useful property: an untouched workspace forecasts to **exactly** its calculated result. If you
run 10,000 trials on MediBec with no ranges set, the median is 41,104 — not approximately. That is a
check on the forecaster, not a coincidence, and it is the first thing to try.

Ranges can be **proposed** from the confidence you already recorded against each parameter, by a
stated rule: ±0.15 for Low confidence, ±0.10 for Medium, ±0.05 for High, clamped to each parameter's
own limits (θ is never proposed at or below zero). A proposal is a starting point to edit, not an
answer.

Runs are **seeded**: the same seed reproduces a run exactly, so a figure in a report can be
regenerated. A different seed gives a different run, which is how you check whether your conclusion
depends on the sample.

**Drivers.** The tornado chart holds every other parameter at its likely value and sweeps one across
its range. It is deliberately *not* derived from the Monte Carlo sample, because "what if this one
estimate is wrong" is a different question from "how do the parameters vary together", and the two
answers are not interchangeable. Read the tornado to decide which estimate to go and validate.

**KRI projection.** Ordinary least squares on each indicator's recorded readings, with a **95%
prediction interval for a single future reading** (not a confidence interval for the trend line — the
question is where the next measurement will fall), the projected threshold crossing in days, and r².
Fewer than four readings and it refuses to project rather than drawing a flattering line through
three points. An indicator already past its threshold reports no future crossing, because it has
already happened.

Every forecast is shown apart from the calculated results and labelled **Analytical estimate —
validation required**. A forecast is the width of your uncertainty, not a prediction of events.

### 7.10.6 Backup & restore {#backup}

One file holds every workspace, the extracted text of your context documents, the framework
catalogues you loaded and the helper settings, with a manifest and a SHA-256 checksum.

Context documents are included by default. Threat snapshots are **not**, because they are the bulk of
the size and are rebuildable from the public catalogues — the screen shows each part's size before
you choose, so the decision is yours and informed.

**API keys are never included.** The helper keeps those in a file of its own outside the browser, and
any field whose name looks like a key, token, secret, password or credential is stripped on the way
out. A backup you e-mail to yourself cannot leak your Claude key.

**Restoring shows you what it would do first.** Every workspace in the file is labelled:

| Label | Meaning | Ticked by default |
|---|---|---|
| **New here** | Not in this browser. | Yes |
| **Identical** | Same content. Nothing to do. | — |
| **Brought forward** | The file is newer than this browser's copy. | Yes |
| **Would lose work** | **This browser holds a newer copy.** | **No** |

**Merge** leaves everything else alone. **Replace everything** is offered as well, but it states how
many workspaces it would delete before you can confirm it. A file from a newer version of the
application is refused rather than partially read, and a failed checksum is reported above the restore
button, not after it.

**Moving to another machine** is the same file: back up here, restore there. Workspaces live in one
browser at one address, so this is also how you move from `localhost:8099` to a different port, or
from Chrome to Edge. Restored catalogues appear immediately — no reload needed.

**Data versions and migrations**: the data version this application reads, the data version of the open
workspace and the application version that last saved it, how many workspaces were migrated at start-up and
how many are open read-only, the migration journal of the workspace, and *Download the copy from before the
migration*. Section 5.1.

### 7.11 Settings {#settings}

Settings shared by every workspace of this installation, in twelve tabs listed in the menu. In multi-user mode
Settings is for administrators.

#### Language

English or French (section 7.12.4).

#### Modules {#settings-modules}

**Features of this installation**: switch each feature on or off (administrators). The switches are grouped:

| Group | Features |
|---|---|
| Governance | Information security management · ISP management · Cybersecurity management · Shared registers · Quality review |
| Compliance and audit | Compliance management · Audit management |
| Security operations | SIEM · SOAR |
| Other features | Risk Registry (with Publish & share) · Threat feeds & social · Ontology · CRGO · AI assistant · Forecasts · Budget |

A feature that is off leaves the menu, with any section or sub-menu left empty, and its address says how to
switch it back on. **Nothing it holds is deleted**: its data stays in each workspace and comes back when it is
switched on. To hide screens from some people only, use **Users & RACI → Menu access** instead.

#### Logs {#settings-logs}

Two logs of this installation, for administrators:

- **Access log** — the application opened, sign-ins and sign-outs (and failed ones), screens opened, refused
  approvals and rights, features switched on or off, settings saved.
- **Data log** — workspaces created, saved, imported, migrated, reset or deleted; files downloaded (exports,
  reports, backups); files written by the local helper; SIEM and SOAR imports; ontology write-backs.

Each entry records **when, who** (the signed-in person, or *this computer* in single-user mode), **what** and
**where** (workspace or file), with a short detail — **never the contents** of a workspace or file, never a key,
a PIN or a password. Search and filter (*Both logs*, *Access log*, *Data log*), **Export … entries as CSV**,
choose **Keep entries for** (30 days to 2 years; at most 10,000 entries per log), or **Clear the selected log**.
The logs stay on this computer.

#### AI — local & remote {#settings-ai}

Master switches, the route of each AI feature, the workspace's AI settings, the help chatbot and the providers
— section 8.3. Keys are stored by the helper in `crg-keys.json`, never in a workspace.

#### Users & RACI {#settings-users}

**Users and rights (RACI).** Single-user mode is the default: no sign-in. **Settings → Users & RACI → Turn multi-user mode on**
makes you the first administrator (an optional PIN is stored as a salted hash). Then:

- **Add users** with a starting template — viewer, analyst, risk owner, manager or administrator —
  and an optional PIN.
- **RACI matrix**: one letter per user and process step. **R** Responsible: view and edit. **A**
  Accountable: view, edit and approve. **C** Consulted and **I** Informed: view. **–**: no access,
  the step's screens are hidden. Administrators have every right.
- Screens where you lack the Edit right are **read-only**, with a banner naming your role; navigation,
  searching and filtering still work.
- **Approvals** — approving a recommendation, accepting a risk formally, approving a measure — need
  **A** on that step; the approver is recorded.
- **Switch user** in the top bar signs out; the sign-in screen lists the users.
- **Menu access by group and user account.** Create groups (*Add group*), tick their members,
  then set each menu (screen) for a group or a user: *Default (RACI)*, *Full* (shown and editable),
  *View only* (shown, read-only) or *Hidden* (removed from the menu). A user's own setting wins over the
  groups; between groups the most permissive applies. Approvals still need RACI **A**; Settings and
  Backup stay administrator-only; administrators are never restricted. *Export menu access (CSV)* keeps
  a record. A role imported from the documents can become a user with **Create user** on Organization →
  Evidence.
- **Activity** lists sign-ins, user and RACI changes, approvals and edits; it and the matrix export as
  CSV.

This is Option A: users and rights live in this browser and are enforced by the application. It
organizes who does what and records it, but it is **not a security boundary** — anyone with access to
the computer can bypass it. A team-server version (Option B) is designed in
`MULTIUSER-ARCHITECTURE.md`.

#### Documents & files

The administrator's view of every document of every workspace on this computer — business cases,
profiles, inventories, audit reports. Filter by workspace or category, or search, then:

- rename a document, or change its **Category**;
- **Replace…** with a new version: the file is read again on this computer and the previous text is
  kept as an earlier version (up to five);
- **Open text** opens it under Organization → Context documents;
- **Delete**, or tick several and **Delete ticked**. Values already accepted from a document stay in
  the workspace with their source.

*Unreferenced text* lists stored text no document refers to any more (an interrupted import, for
example) with **Remove unreferenced text**. In multi-user mode Settings is administrator-only.

#### Links, feeds, schedule and network

- **Links & shared folders.** Every external address in one place. The screen separates **your own
  folders** — the Drive Feeds and registry folders (with their folder IDs), the local folders synced
  with them through Google Drive for desktop, and your controls list — from the public endpoints that
  come configured: KEV, EPSS, NVD, ATT&CK Navigator and the plugin repository. **The application ships with none of your folders set**, because a shared folder is where your
  organization or your class keeps things and nobody else can choose it for you. The screen lists
  which are still empty and shows the feeds folder in use. None of them is required: leave them empty
  and Publish still writes a file you can download, while the scheduled task reports that the upload
  step was skipped. To set one, create the folder in your own Drive, copy its address from the browser
  and paste it in; the folder id is shown back so you can check it.
- **Feed sources & keys.** Accept, keep as proposed or reject each source; set its frequency; add your
  own source; accept or reject the sources the scheduled task suggests. Store API keys (OTX, abuse.ch,
  X) through the helper — they go to `crg-keys.json` in the feeds folder (readable by you only), never
  into workspaces, exports or packages. Set the social-media query and tags, and the **watch terms**
  matched locally.
- **Scheduled task.** Pause downloads, choose what the task uploads to Drive, allow source
  suggestions, record the task's name and cadence, and read its instructions.
- **Network allowlist.** The domains the downloads need; copy the list for your organization owner if
  Claude's network access is restricted.
- **Feeds folder.** `~/Downloads/CyberRiskGuardian-feeds` by default (`%USERPROFILE%\Downloads\…`
  on Windows). Everything the application writes outside your browser lives there: downloads, the
  weekly briefing and your API keys. To use another folder, write its path on the first line of
  `feeds-dir.txt` beside `serve.py` (or set `CRG_FEEDS_DIR`, which wins over the file) and restart the
  launcher; the scheduled task must work in the same folder. If someone handed you the application
  with a `feeds-dir.txt` naming a folder on *their* computer, delete it or put your own path in:
  otherwise the helper writes to a path that does not exist on your machine. `INSTALL.md` section 5
  covers this in both languages.

**Every API key stored on this computer.** **Settings → Feed sources & keys** ends with one list of every key the helper holds, each with
**Remove**, and **Remove every key**. It includes keys whose feed source or AI provider is no longer
in your configuration, which had no screen at all before. The per-provider *Remove* in Settings → AI —
local & remote and the per-source *Remove* above are unchanged. Reset data can delete all of them in
one step as part of a reset.

#### Simulation data {#settings-simulation}

Simulation data for teaching: a few weeks of **fictional** security-operations activity for a teaching case —
telemetry sources, detection rules and their tests, alerts, indicators, playbooks, cases, approvals and recorded
actions — with learning objectives, a day-by-day storyline and exercises with their expected findings. A pack is
imported into the **current workspace** through the same importers as any local SIEM or SOAR file. Every record
is marked as simulation and can be removed later. A pack never changes a risk score or a scenario parameter, and
**no alert becomes an incident**: confirming an incident is left to the students. Simulation data is never
evidence about a real organization.

The top of the screen shows the current workspace, its kind, its scenarios and crown jewels, and how many
simulation records it holds. Simulation data is meant for an **example case or a classroom workspace**; in an
organization workspace a banner says so, and in multi-user mode only an administrator can import into or remove
from one.

- **Bundled packs** — the packs shipped in `data/simulation`. A pack cites the scenario and crown-jewel
  identifiers of its teaching case, so it **validates only in a workspace of that case** (for MediBec: the example
  workspace or a copy of it). Each pack shows whether it is *valid for this workspace* (with any warnings) or the
  errors that prevent the import, then its **learning objectives**, **storyline** and **exercises for students**
  (each with its *expected finding (for the educator)*). **Import into this workspace** asks for confirmation —
  SIEM records are added, SOAR records with the same identifier are replaced — and reports what was imported and
  what the SOAR import refused on purpose (the MediBec pack includes a self-approval attempt). **Download the
  pack** saves it as one JSON file.
- **Generate with AI** — for educators: an AI model writes a new fictional pack for the current workspace. Choose
  the **storyline length** (7, 14 or 21 days), **intensity**, **focus of the intrusion** (ransomware, phishing and
  account takeover, insider, supplier, cloud, mixed), **number of alerts** and **language of the texts**, then
  **Prepare the request…**. The request carries only the organization profile, the scenarios (identifiers, names,
  ATT&CK techniques), the crown jewels and the information assets — no documents, notes, figures or keys — plus
  the rules of the simulation-data guide; you see and may edit the exact payload first, as for every AI feature.
  The answer is labelled *Analytical estimate — validation required*, validated, and can be downloaded or imported
  only when it has no error. Read the warnings and the exercises before using it in class: the model writes
  plausible data, not verified teaching material. *Or open a pack file* (**Open**) validates and imports a pack
  received as a file.
- **Remove simulation data from this workspace** — lists the simulation records by register and removes them in
  one step (a backup restores them). Tick *Also remove … record(s) created in class from simulation records* to
  remove, too, what the students created from them.

How a pack is built — the manifest, the required teaching points, the fictional-data safeguards (RFC 5737
addresses, `example.com` domains, made-up hashes) and the validation checklist — is in
`docs/SIMULATION-DATA-GUIDE.md`.

##### Classroom walkthrough — the MediBec pack

*MediBec — phishing to ransomware on the EHR (three weeks of SOC activity)*: 21 September – 9 October 2026, 12
telemetry sources, 13 detection rules with their tests, 40 alerts (noise, false positives and an intrusion chain
from a phishing attachment to ransomware on the EHR), 15 indicators with TLP 2.0 markings, 5 playbooks, 4 cases,
and approvals and recorded actions with deliberate approval gaps. It exercises scenarios S1 (credential
compromise) and S2 (ransomware), with S3, S4 and S5 along the way. All people are fictional.

**Before class (educator).**

1. Create a copy of the MediBec example for the class (Organization profile → Workspaces → New workspace → *a copy
   of the MediBec example*, type *Classroom business case*), or give each team its own copy.
2. Settings → Simulation data → the MediBec pack → check *Valid for this workspace* → **Import into this
   workspace**. The report must show 40 alerts, 13 rules, 15 indicators, 4 cases and 11 executions, and one SOAR
   record refused: APR-MB-04, a self-approval (a deliberate teaching point).
3. On SIEM → Overview, set the **as-of date** to 9 October 2026 or later: coverage and telemetry health are
   computed at that date.
4. Optional: Organization → Reset data → *For the instructor* → **Set the current state as the starting point**,
   so teams can start the exercise over.

**In class (students).** The storyline runs day by day: a normal Monday and background noise (the backup log
forwarder already went silent on 18 September), a phishing attachment opened at the Gatineau clinic on day 3 and
a case closed too early, persistence, MFA fatigue on day 7 and an account case whose approval is revoked before
the account is disabled, lateral movement to the EHR, collection of 48,000 patient records, exfiltration — partly
unseen because cloud data-read logs were switched off — recovery inhibition that the silent backup telemetry
never reported, encryption of the EHR on day 14 with isolations under expired, self-granted or unauthorised
approvals, containment, noise again, a match on a revoked indicator, a look-alike e-mail, and a restore test still
waiting for approval. The ten exercises:

| # | Question | Screen |
|---|---|---|
| EX-01 | Which alerts should an analyst open first on the morning of 4 October, and why? | SIEM → Alerts & triage |
| EX-02 | Find the true positive that was closed as benign on day 3. What should have happened? | SIEM → Alerts & triage |
| EX-03 | Which detections are validated, untested, degraded or missing, and why is DR-MB-07 not validated although it was tested? | SIEM → Coverage & gaps |
| EX-04 | Which telemetry sources are not healthy at the as-of date, and which scenario does each blind spot affect? | SIEM → Telemetry sources |
| EX-05 | Which indicators may not be shared outside the SOC, and which ones no longer support any inference? | SIEM → Indicators & TLP |
| EX-06 | IND-MB-10 has confidence 95. Can you use 0.95 as Pb(A) for scenario S2? | SIEM → Indicators & TLP, then Scenario register |
| EX-07 | Is CASE-MB-03 an incident? What is needed to make it one, and what follows for Quebec Law 25? | SOAR → Cases |
| EX-08 | Which recorded actions lack a valid approval, and for what reason? | SOAR → Actions |
| EX-09 | Which playbooks may be relied on in an incident, and which need work? | SOAR → Playbooks and Simulations |
| EX-10 | Write two detection gaps and one corrective action that this storyline justifies, linked to MediBec scenarios. | SIEM → Coverage & gaps, Shared registers |

The expected findings are on the pack's card, under each exercise, for the educator. Three points students
usually need to be told: the queue is ordered by crown jewel, then severity weighted by criticality, not by
arrival time (EX-01); a source confidence of 95 is the producer's statement, not a probability, and never becomes
a Pb(A) (EX-06); CASE-MB-03 is not an incident until a named person confirms it on a date with **Confirm as
incident** — which the students do themselves, and which then starts the Law 25 notification deadline in
Compliance management → Regulatory calendar (EX-07).

**Closing the loop with the risk assessment.** Batch scenarios → *From security operations (SIEM & SOAR)*, as of 9
October: the seeds show the detection gaps, degraded telemetry, approval gaps and unsimulated playbooks the
storyline produced; most are *evidence for an existing scenario* (S2, S3, S4). **Record the evidence on S2** and
open S2 in the Scenario editor: the *Security-operations evidence* card shows it — and no parameter has changed.
Any change to Pb(A), Pb(ψ,A) or θ is the students' decision, written in the rationale. Finish with Governance →
Quality review: QC-15 to QC-18 must pass.

**After class.** Settings → Simulation data → **Remove simulation data** (tick *Also remove … created in class*
to clear the students' records too), or restore the starting point with Reset data.

#### Export / import

`crg-config.json` without keys, to set up another computer or share a source list.

### 7.12 Help

### 7.12.1 Step by step and User guide

The **Help** menu opens with two entries marked with an arrow that are not screens of the application:

| Entry | What opens |
|---|---|
| **Step by step** ↗ | A window of its own with the thirteen steps — what each is for, what it needs, when it is done — and the guidelines in detail. Printable, works offline. Clicking a screen name opens that screen in the application window. |
| **User guide** ↗ | This guide, in a window of its own, with a table of contents and a find box — in French when the interface is in French. Printable, works offline. |

They are windows rather than tabs so a guide can sit beside the work, and both read what the application
reads, so neither can describe a screen differently from the application. If your browser blocks
pop-up windows, allow them for this application; otherwise the entries open as tabs.

### 7.12.2 About {#about}

**About** (Help group) has three pages. **About** names the creator, his e-mail
(marcandre@leger.ca), the project website (www.leger.ca) and the GitHub repository
(github.com/ITriskMgr/CyberRiskGuardian), and acknowledges the use of generative AI in building the
application. **Licence** explains CC BY-NC 4.0 and then answers the question people actually
have — see section 10. **Versions** lists the application, the verified engine, the local helper and the
knowledge base.

**Exit** (top bar) saves your work, stops the local helper and closes the window. In a browser tab
that the app did not open itself, close the tab when the closing screen appears. Start the app again
with the launcher.

### 7.12.3 Help chatbot

The **?** button at the bottom right opens the help panel on every screen. It starts with a tip for
the screen you are on; ask a question in English or French. Answers come from the built-in help —
screen tips, the 13 process steps, frequent questions — and the user guide, searched on this
computer; *Open this screen* takes you there.

By default the chatbot is **help-only**: no AI, nothing sent. To allow AI answers, go to **Settings →
AI — local & remote** and tick **Let the chatbot use AI**; AI must also be on for the workspace (same
page), and the *Help chatbot* feature must not be routed to *Off*. Each answer then offers **Ask AI**, which shows exactly what would be sent
(your question, the screen, the matching help passages and a short summary of the workspace) before
anything leaves the computer. The AI answer is labelled as such; the chatbot never changes data.

### 7.12.4 Language — English and French

**EN / FR** in the top bar (or Settings → Language) switches every screen at once; the
choice is remembered. Only the interface is translated. Organization data, case documents,
scenarios, catalogue content (ATT&CK, CWE, control titles), exported files and AI answers stay in
their original language — a French case stays French in an English interface and vice versa.
Numbers follow the language (0,85; 12,3 %; 1 234 $). With the interface in French, AI requests ask
for French prose.

---

## 8. AI in the application

AI **proposes and explains**; the verified engine calculates; you decide. Nothing an AI produces
changes a stored value until you accept it, and no AI sits in the calculation path.

### 8.1 What is sent — and how to change it

The browser never calls a model. It posts to the local helper, which makes the request — so keys stay
out of the page and the egress point is one auditable function in `serve.py`. Before anything leaves,
every AI feature opens the same **preview**:

- the task, the **size** (bytes and words), the **destination** (a provider off this machine, or a model
  on it) and whether web search is on;
- the payload itself in **two editable boxes**: *Instructions (system)* and *Request*.

**You can edit the payload.** Remove what should not leave, add context the documents lack, sharpen the
question. What is in the two boxes when you press **Send** is exactly what is transmitted — the size
updates as you type and a pill says *edited by you*. **Restore the prepared payload** undoes your edits;
**Apply the anonymizer** replaces the organization, people, assets, hosts and amounts in both boxes;
**Copy** copies them. The AI log records that the payload was edited.

A workspace marked **confidential** confirms every call and never remembers consent; otherwise the first
send from a workspace records the date. A request over 400 kB is refused rather than sent.

### 8.2 Creativity

For the features that propose — profile and crown-jewel extraction, import from documents, scenario
proposals, causal chains, policy drafting and compliance assessment — you choose how far the answer may
go beyond the material:

| Level | What the model is asked |
|---|---|
| **Strict — documented facts only** | Only what the documents state or directly imply. Anything else stays empty (UNKNOWN). |
| **Balanced — facts, then cautious assumptions** | The documents first; a cautious assumption where they are silent, labelled as such. The default. |
| **Exploratory — fill the gaps with plausible data** | Aims for a complete answer: every gap gets a plausible value from the sector, size and region, its reasoning in the source. |
| **Creative — propose what could also be there** | Also proposes items the documents do not mention but an organization like this usually has — systems, data sets, suppliers, processes, obligations, threats — for you to check with the organization. |

**Creativity changes completeness, never provenance.** At every level a value the documents do not
support is tagged ASSUMPTION, EXTERNAL or UNKNOWN — never FACT — and a creative proposal's source starts
with *Proposed —*. The level is written into the payload, so the preview shows exactly what the model
was asked. Choose it in the preview (changing it prepares the payload again) or set the default for the
workspace in **Settings → AI — local & remote** → *Creativity of extraction and proposals*; *Use this
level by default for this workspace* in the preview does the same. With a local model a matching
sampling temperature is also sent; the Claude API is guided by the instruction alone.

### 8.3 Settings → AI — local & remote

One page for every decision about what may leave this computer for an AI model.

- **Master switches (this installation).** *Allow requests to the Claude API (remote)* — off, nothing
  is ever sent off this machine and every feature must use a local model. *Allow web search for
  missing profile information* (Claude only).
- **Route of each AI feature.** For each feature — vulnerability linking, profile and crown-jewel
  extraction, import from documents (two groups), scenario proposals, causal chains, the AI assistant's
  analyst and critique, the weekly briefing, policy drafting, simulation data for teaching, compliance
  assessment, the help chatbot —
  what it sends, its sensitivity, and its route: *Workspace provider*, *Local model only*, *Remote
  provider* or *Off*. *Restore the recommended routes* puts the sensitive features back on the local
  model.
- **This workspace.** AI on or off, the workspace provider, *Treat as confidential*, *Anonymize before
  sending*, and the **creativity** default.
- **Help chatbot.** *Let the chatbot use AI* (off by default).
- **Providers.** One card per provider, grouped *off this machine* and *on this machine*: the Claude
  API, OpenAI, Google Gemini, Azure OpenAI, GitHub Models, Ollama, LM Studio, any other local
  OpenAI-compatible server, and **Add a provider of your own**. For every provider the endpoint, the
  model and the key are editable; *List models* asks the endpoint; a connection test sends a few tokens
  and no workspace data. Keys are stored by the helper in `crg-keys.json` (mode 600) — never in a
  configuration file, a log, an export or a backup.

The routes are saved in `crg-config.json` in the feeds folder, and the helper checks them again before
every call: a feature set to the local model cannot reach a remote provider, whatever a page asks for.
*Remote* means every provider that is not on this machine, including one you add.

### 8.4 The AI assistant

| Task | What it does | What it may not do |
|---|---|---|
| **Analyst** | Answers a question about this assessment, with the organization context and the engine's own figures in the payload. | Recalculate. The figures it cites are the ones it was given. |
| **Parameter critique** | Reviews your Pb(A), Pb(ψ,A), δe, δm, θ and μ(E) against the scenario text and the evidence recorded, and says where it disagrees and why. | Apply anything. It suggests; you decide, parameter by parameter. |
| **Scenario generation** | Drafts scenarios as full causal chains, optionally seeded from triaged feed items. | Reach the register. They land in Batch scenarios marked AI-generated, unreviewed. |
| **Briefing narration** | Rewrites the week's triage for a management audience. | State any risk figure. |

**Everything is logged**: the task, provider, model, date, bytes sent, whether it was anonymized or
edited, the creativity level, the token usage, and **your verdict** — accepted, partly useful, rejected.
That log is the evidence that AI was used responsibly in the assessment. If an answer hits the model's
output ceiling the screen says *cut short* and keeps the findings that arrived complete.

---

## 9. Scheduled feed downloads with Claude

A Claude scheduled task runs on this computer through the Claude desktop app. At each run it reads
`crg-config.json`, stops if paused, runs `bin/crg_feeds.py --due` in the feeds folder (each source at
its own frequency), copies `feeds-digest.json` and a short summary to the Drive Feeds folder, uploads
the registry outbox to the Drive registry folder, and — at most weekly — proposes new sources. To
change how often it wakes up, pause it or run it now, open Scheduled tasks in Claude or ask Claude
(“run my CyberRiskGuardian feed task every 12 hours”). The computer must be awake with the Claude
desktop app open. If the organization restricts Claude's network access, the domains in Settings →
Network allowlist must be allowed first; until then the task reports them as blocked.

The same task also writes the **weekly briefing** — but only if it has something to
triage with. Export the profile first (section 7.4.3): *Threat feeds → Triage → Export the profile for
the scheduled task*. The task then reads `briefings/triage-profile.json`, applies the same documented
rules to the week's downloads, writes `briefings/briefing-YYYY-MM-DD.md` in the feeds folder and
uploads it beside the digest. It is forbidden from changing any score, parameter or workspace, and it
does not touch `crg-keys.json`. If the profile is absent it says so in one line and does the download
only — it will not invent a profile.

The task's briefing is a **reading** of the rules; the application's triage is the deterministic one,
and the two can differ in wording. Where they differ on substance, the application is right.

---

## 10. Licence — who may use this

**About → Licence.** The application is licensed **CC BY-NC 4.0**: share and adapt it, with
attribution, and not “primarily for commercial advantage or monetary compensation”. The page lists the
situations, because “non-commercial” is a licence term and not a judgement about who deserves free
software.

**Allowed without asking:** students for their own coursework, including handing in the result for a
grade; personal and private use; non-profit organizations and NGOs assessing their own cyber risk;
research and teaching materials you write yourself, with attribution; and **evaluation for up to 30
days** by any organization, to decide whether to license it.

**Needs a commercial licence:** colleges, universities and other educational institutions using it to
deliver teaching — the students in the course are covered, the institution is not; government
departments and agencies at any level; Crown corporations and other public enterprises; businesses and
corporations of any size, including consultancies, auditors and advisers using it for client work; and
anything embedded in a product or a paid service.

Write to **marcandre@leger.ca** with what you want to do. A formal price list will be published; it is
not published yet, because the project is still in development, and terms are agreed case by case
until then. The licence summary on the page is exactly that — the licence itself is the Creative
Commons legal code, shipped in full as `LICENSE`, and it governs where the two differ. None of this is
legal advice.

---

## 11. Acceptance test (about an hour)

**The engine and the case**

1. Footer reads `engine verified · 84,491 / 41,104`.
2. **Scenario register** on the MediBec workspace shows 30 scenarios, total estimated 84,491 and
   residual 41,104.
3. **Risk calculator** → untick S1. The included count becomes 29/30 and the totals drop. Reload the
   page: S1 is still excluded. Tick it again.
4. **Process** shows thirteen steps, step 4 reading *Import other information from the documents*, and
   the banner recalling that the application is a beta.

**Organization and documents**

5. **Organization → Workspaces** → create a blank workspace with two Word or PDF files dropped in the
   form; the workspace opens with both documents listed.
6. **Organization → Profile & appetite** → change a field: the bar says *Unsaved changes*; **Cancel**
   restores it.
7. **Extract from documents…** → *Use AI (preview before sending)* (a provider configured): the preview
   shows two editable boxes, the size and the destination. Change the creativity to *Creative*: the
   request now contains `CREATIVITY: creative`. Add a sentence to the request, send; the AI log
   records *edited*. Without a provider, *Rules only* proposes values tagged FACT, INFERENCE or UNKNOWN.
8. **Organization → Import from documents** → drop a third document: it is listed as *new* and is the
   only one ticked. Untick *Profile & appetite* and *Crown jewels*, keep *Information assets*, choose
   *Rules only* and **Start the import**: only the new document is read, the review opens, **Add
   ticked**; the document now shows *Already extracted into: Information assets* and the import plan's
   targets appear on Process step 4.

**Threats, vulnerabilities and the ontology**

9. **Threat context** → **Load the bundled example** (no network needed). Paste:

   ```
   CVE-2026-59310
   CVE-2026-102490
   CVE-1999-0016
   CVE-1999-0001
   ```

   and click **Place on the ladder**. Expect rung 4 for the first two — one citing known ransomware
   use — rung 2 for `CVE-1999-0016` with the age-guard sentence despite an EPSS near 0.96, and
   rung 1 for the last, reading *EPSS below 0.05 (pruned from this snapshot), not in KEV*.
10. **Threats · ATT&CK** → the matrix shows coloured cells; open T1566 and see the MediBec scenarios
    that use it.
11. **Ontology · CRGO → Suggest scenarios** on MediBec → the sector reads *health* and the techniques
    come from the register; tick *malware and ransomware* and click **Suggest scenarios**. The result
    shows candidates, distinct scenarios and the source (*MCP server* when the ontology is connected,
    *snapshot* otherwise). Open **Details** on one. Tick two and **Add ticked to Batch scenarios**: the
    grid shows them marked *[CRGO]* with a rationale naming the ontology identifier.
12. **Ontology · CRGO → Explore → Controls for a technique** → `T1486`: controls listed per framework.
    **Connection** names where the server comes from, or why the snapshot answers.
13. **Scenario editor** → S1 → *Ontology · CRGO* card → **Controls for its techniques** lists controls
    per technique; **Find similar ontology scenarios** offers scenarios to *Link*.

**The assessment**

14. **KRI dashboard** opens with five gauges and the pill *automatic: worst first*. **Record**: the
    measurement count becomes 1.
15. **Batch scenarios** → tick every pattern, *Tick crown jewels + 5 most critical*, set 20; generate:
    the grid holds candidates from many patterns. *Reshuffle* changes the set and the seed; the same
    seed reproduces it.
16. **Risk mitigation → Proposals** → *Untreated above tolerance* → *Add ticked proposals to the plan*.
    **Apply** one measure, check the scenario's red_p / red_i changed, then **Revert**.
17. **Risk register** → *Create from scenarios*: 30 risks and a heat map.
18. **Recommendations → Treatment need** lists every included scenario with a below / at / above
    verdict. Risk mitigation → tick two measures → **→ Recommendation**; move the draft to *in review*,
    then **approve** it: the gate names anything missing; once approved the figures are frozen.
19. **Existing safeguards** → *Add a safeguard* in place, scored 3 on Recover with an annual run cost:
    the KPIs show it and **Budget** offers its run cost as the baseline.
20. **Maturity & resilience → Maturity (CSF 2.0)** → score all 22 categories at 3: *Scenarios this
    suggests* becomes 20 and Process step 6 reads *about 20 for this organization*.
21. **Forecasts → Monte Carlo**, with no parameter ranges set, 10,000 trials: the median reads
    **41,104** exactly.
22. **Export · Excel** → *All scenarios*: Analyse totals read 84,491 and 41,104 and recalculate when the
    appetite changes on Parameters.

**The Risk Registry**

23. **Risk Registry → Registry settings** → set a shared folder (any folder on this computer for the
    test) and an alias, **Save**.
24. **Contribute risks** → tick three scenarios; the catalogue shows *Health care*, *Canada — Quebec*,
    *Medium*; anonymization is ticked. The preview contains neither “MediBec” nor an asset name.
    **Share to the registry**: a `crg-registry2-contribution-…json` file appears in the folder.
25. In a second browser profile (or another computer reading the same folder), **Browse & search →
    Read the shared folder**: three cards. *Industry sector* → *Finance and insurance*: none.
    **Moderation** → approve one → **Publish the curated package**. Back in the first profile, read the
    folder again and tick *Moderated cards only*: one card. **Use ticked cards in this workspace**: it
    lands in Batch scenarios marked *[Registry]*.
26. **My contributions** → **Withdraw**: after reading the folder again, the other profile no longer
    shows those cards.

**Governance**

27. **ISP management → Policy library** → *Access control and authentication* → **Create from the
    template**: a draft whose statements each carry an identifier, a modality and controls. In **Versions &
    approvals**: **Submit for review**, **Approve** (by someone other than the author when multi-user mode is
    on), **Publish**: the version is frozen with its hash and **Verify the hash** passes. **Start a new
    version**: a new draft, and **Compare two versions** shows the differences.
28. **ISP management → Acknowledgements & training** → **Record an acknowledgement** of the published version:
    the Overview's coverage rises. **Non-compliance** → **Record a departure from a policy** → *Shared
    administrator account* → **Make it a risk**: a risk of category *Compliance* appears in the Risk register.
29. **Compliance management → Requirements** → **Add the Law 25 and R-22.1 obligations** and **Add the
    published policy statements**. **AI-assisted assessment** → *Rules*, **Propose** → **Apply the ticked
    proposals**: each shows *rules accepted*. **Reporting** → **Record a snapshot**, then **Full compliance
    report (.md)**: it contains the requirements, the policies and the compliance posture.
30. **Settings → Modules** → switch *ISP management* off: its menu entry disappears and its address explains
    that the feature is off; switch it on again: the policies are still there. Switch *SIEM* and *SOAR* off:
    the whole **Security operations** section disappears; switch them on again.

**Teaching cases and reset**

31. **Reset data** on the MediBec example → *Start over* lists *Steps you will do again*: step 2 and
    step 3. **Start this case over…**, type `START OVER`: the register has 30 scenarios again and
    Process shows steps 2 and 3 as *To do*. Under *For the instructor*, untick both steps and start over
    again: steps 2 and 3 are back as delivered.
32. **Reset data → Reset or delete** → choose each of the four levels and watch *What this would
    remove* change; the keys are reported as *kept by this reset*.

**Installation**

33. **Backup & restore** → *Create a backup*; restore it in a second browser profile: the footer reads
    **84,491 / 41,104** and your workspace, its policies and its requirements are present.
34. **Help → Step by step** → a separate window with thirteen steps and the guidelines; **Help → User guide**
    → this guide with a table of contents; switch the interface to **FR** and reopen it: the French guide.
35. **Help → About → Versions** reads `1.7.0 beta` and `engine verified · 84,491 / 41,104`; **Licence** names
    CC BY-NC 4.0 and marcandre@leger.ca.
36. Switch the interface to **FR**: the Ontology, Risk Registry, ISP management, Compliance management, SIEM
    and SOAR screens, the AI preview and the Import from documents tab are in French; the organization's data
    stays in its own language.

**Menu, help and logs**

37. The menu shows the twelve sections in order. Fold **Governance**: it shows how many screens it holds.
    **«** folds the menu to a rail of icons; **»** restores it. Narrow the window: the menu becomes a drawer
    opened with **☰**.
38. On any screen, the **?** beside the title opens the help; **Open this section of the user guide** opens this
    guide at that screen's section. `python3 tools/anchor_check.py` reports every anchor present.
39. **Settings → Users & RACI** → multi-user mode on, a second user with **Menu access** *Hidden* on SIEM: signed
    in as that user, SIEM is not in the menu. **Settings → Logs** (as administrator) lists the sign-ins and the
    screens opened; *Export … entries as CSV* writes a file with no workspace content.

**Data, ontology and quality**

40. **Backup & restore → Data versions and migrations**: data version 2; import an older workspace export that
    held evidence records and policy exceptions: its journal shows the steps to version 2, the evidence is in
    **Shared registers → Evidence**, the exceptions in **Shared registers → Exceptions**, and its numbers are
    unchanged.
41. **Ontology · CRGO → Connection** names CRGO v0.10.0; *Organisation link* → *Build the organisation graph*
    on MediBec shows **same totals**; *Read the context* of S1 gives no risk score; *Send the ticked results as
    proposals* shows **proposed** in the journal; **Read both contexts** returns the compliance and
    security-operations contexts.
42. **Cybersecurity management → Control testing**: a self-assessment *effective* and an internal-audit result
    *ineffective* on the same control show **conflict — resolve**; **Quality review** fails QC-06.
43. **Compliance management → Legal applicability** with an empty profile: every instrument is an evidence
    gap, none is "not applicable". **Determinations**: *satisfied* without current evidence is refused, or fails
    QC-14.
44. **Shared registers → Exceptions**: an exception that names a legal obligation cannot be accepted.
    **Audit management → Responses & follow-up**: closing a finding without an independent verification is
    refused.
45. **Threat context** → generate a snapshot from a KEV and an EPSS file: **Use in this workspace** creates no
    file; **Download threat-context-YYYY-MM-DD.json** saves it to the download folder.

**Security operations and teaching**

46. On a copy of MediBec, **Settings → Simulation data** → MediBec pack → **Import into this workspace**: 40
    alerts, 13 rules, 15 indicators, 4 cases; APR-MB-04 refused. No incident was created.
47. **SIEM → Alerts & triage** (as of 9 October 2026): crown-jewel alerts first. **Coverage & gaps** shows
    validated, untested, degraded and missing detections. **Indicators & TLP** → **Export indicators (.csv)**
    asks what to do with TLP:RED and TLP:AMBER+STRICT.
48. **SOAR → Actions** lists the executions without a valid approval with their reasons; **Cases** →
    CASE-MB-03 → **Confirm as incident** needs a name and a date, and the incident appears in SOAR → Incidents
    and Cybersecurity management → Incidents.
49. **Batch scenarios → From security operations (SIEM & SOAR)**: seeds with evidence and *may inform*, no
    value; **Record the evidence on S2** → the Scenario editor's *Security-operations evidence* card lists it and
    S2's parameters are unchanged.
50. **Quality review**: QC-14 to QC-18 are listed and pass on the imported pack. **Settings → Simulation data →
    Remove simulation data**: the SIEM and SOAR registers are empty again.

If all fifty hold, the installation is sound.

---

## 12. Updating

Replace the folder with the new version and start it with its own launcher on the same port; the
launcher stops any earlier copy still serving that port. Workspaces stay in the browser: on its first start
the new version migrates them on a copy and keeps the originals (section 5.1). If you edit the app yourself,
bump `CACHE` in `sw.js`, and when you change how a workspace is stored, add a step to `js/migrate.js` and
list the new field in `KNOWN_FIELDS` — the test suite fails until you do.

When `crg_calc.py` changes: update `crg.js` in the mobile repository first, verify it there, then
copy it here. The self-check will catch a mismatch, but only after the fact.

---


## 13. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Footer stuck on `engine loading…` | Opened as a file, not served. | Section 3.2. |
| My workspaces have disappeared | Different address or port, another browser, or site data cleared. | Use the same address and port (the launchers open `http://localhost:8099`). Import your last workspace export. |
| "Not persisted (private window)" top right | The browser refuses local storage (private window). | Use a normal window, or export before closing. |
| A PDF shows "poor extraction" or no text | Scanned or unusually encoded PDF. | Open the document and paste the key passages, or upload the Word original. |
| Snapshot generator says "not an EPSS CSV" | Wrong file, or the file was decompressed by the browser and renamed. | Use the `epss_scores-YYYY-MM-DD.csv.gz` file (or the plain `.csv`). |
| KEV / EPSS / ladder columns empty | No snapshot in this workspace. | Threat context → load or build one. |
| No Pb(ψ,A) proposals | The CVE is not linked to a scenario, its exposure is not confirmed, or the scenario is already at or above the band floor. | Link it in the scenario editor or the register; tick *Exposed*. |
| Excel shows formulas but old numbers | Manual calculation mode. | Formulas → Calculate Now. |
| Online sources says the helper is not running | The app was not started with its launcher, or an older launcher is serving it. | Close the window and start `start.command` / `start.bat` from the application folder. |
| An NVD download stays slow or keeps retrying | NVD rate-limits requests without an API key, or is busy. | Add a free NVD API key; or choose a shorter date range. The helper retries automatically. |
| A download says *interrupted* | The launcher window was closed before it finished. | **Restart** it from the Downloads list. |
| `CERTIFICATE_VERIFY_FAILED` in a download error | The python.org Python on macOS has no root certificates yet. | Run *Install Certificates.command* in the Python folder, once. |
| Footer still shows an older version after updating | An earlier server is still running on the port, or the browser answered from its cache. | Close every old launcher window (or `lsof -ti:8099 \| xargs kill`), start the new `start.command`, then reload once. Section 3.1. |
| Changes to a file have no effect | The service worker is serving its cache. | Bump `CACHE` in `sw.js`, or hard-reload (⇧⌘R / Ctrl-⇧-R). |
| A feed source shows *skipped* | Its API key is not stored. | Settings → Feed sources & keys → API keys. |
| A feed source shows *Refused by the network proxy* or *not resolved* | The domain is blocked by your network or by Claude's egress allowlist (scheduled task). | Settings → Network allowlist → copy the list for the organization owner (Admin settings → Capabilities). |
| Settings say *saved in this browser only* | The helper is not running. | Start the app with its launcher; settings are then written to the feeds folder for the scheduled task. |
| *Publish to the shared registry* writes to the outbox | No synced registry folder set. | Set *Local folder synced with the registry* in Settings, or let the scheduled task upload the outbox. |
| A scenario's ratio did not change after adding measures | The measures are not applied yet, or they reduce only likelihood or only impact. | Risk mitigation → Apply; add a measure for the other dimension. |
| A navigation section seems to have lost its screens | The section is collapsed. | Click its title; the number beside it is how many screens it holds. The state is remembered. |
| AI assistant says no provider is configured | No key stored, or no local endpoint set. | Settings → AI — local & remote → Providers. For a local model, give the base URL including `/v1`. |
| An AI answer says *cut short* | The answer hit the model's output ceiling. | Ask for fewer scenarios or findings at a time; what arrived complete is shown and usable. |
| AI screen offers nothing to send | AI is switched off for this workspace. | Settings on the AI screen → switch it on. A **confidential** workspace will still confirm every call. |
| Monte Carlo median is not the calculated figure, with no ranges set | A parameter range was left on a scenario. | Parameter ranges → clear it. With no ranges the median must equal the calculated total exactly. |
| *Not enough readings to project* on a KRI | Fewer than four recorded readings. | Record more. Three points do not establish a trend, and the forecaster will not pretend otherwise. |
| Restore refuses the file | It was written by a newer version of the app, or its checksum failed. | Use the matching version; if the checksum failed the file is damaged — take a fresh backup. |
| A workspace is labelled *would lose work* | This browser holds a newer copy than the backup. | Leave it unticked unless you mean to go back; export the current copy first. |
| Imported catalogue does not appear in Risk mitigation | The import was previewed but not applied. | Frameworks → finish the review and apply; the revision log should show it. |
| Triage shows nothing | No feed files loaded for the window. | Threat feeds → Sources & downloads → *Download ticked now* or *Load latest files*. |
| A CVE you care about sits in *worth watching* | Its exposure is not confirmed. | That is the exposure gate working. Confirm it on the asset in Vulnerabilities, then re-triage. |
| The scheduled task's briefing is missing | No `briefings/triage-profile.json` in the feeds folder. | Threat feeds → Triage → *Export the profile for the scheduled task*, then fire the task again. |
| Process step 5 will not go green | It has two halves: a snapshot **and** at least one entry in the vulnerability register. The step names both and offers the screen for each. | Threat context → **Load the bundled example** (no network); Vulnerabilities → **Add a weakness without a CVE** if you have no scanner output. |
| *EPSS below 0.05 (pruned from this snapshot)* on a CVE you care about | The bundled example's EPSS table is pruned at the ladder's rung-1 ceiling, so a negligible score is absent rather than stored. The classification is the same either way. | Nothing to fix. For the exact score, load your own snapshot from `threat_snapshot.py`, or build one in the app from a KEV file and an EPSS file you downloaded. |
| The example snapshot is dated and will expire | It is a fixed build date, and snapshots expire 90 days after retrieval. | Download your own sources before relying on any figure; the screen and the age indicator both say so. |
| Ontology · CRGO answers *snapshot* although the ontology is installed | The helper did not find the server, or its Python lacks the `mcp` or `pyoxigraph` package. | Ontology · CRGO → Connection: read *The MCP server cannot be used*; set the interpreter Claude uses for it (for example `/usr/local/bin/python3`) and the path of `crgo_server.py`, or run `pip install "mcp>=1.2" pyoxigraph` for the helper's Python. |
| The ontology's first answer takes ten seconds or more | The server builds its store from the ontology files on its first start. | Wait once; later answers are immediate while the helper runs. *Start the server* on the Connection tab does it ahead of time. |
| *Read the shared folder* finds nothing | No shared registry folder is set, it is not synced on this computer, or the helper is not running. | Risk Registry → Registry settings → *Shared registry folder on this computer*; check that the folder exists and is synced; start the app with its launcher. |
| *Contribute risks* says *Privileged users only* | In multi-user mode, sharing needs an administrator or RACI **A** on step 13. | Ask an administrator, or have the right granted in Settings → Users & RACI. |
| A Registry card shows *not anonymized* | Its contributor switched anonymization off. | Read it as identifiable information; a moderator can reject it. |
| *ISP management*, *Compliance management*, *SIEM* or another screen has disappeared from the menu | The feature is switched off, or hidden from you. | Settings → Modules; or Settings → Users & RACI → Menu access. The data is still in the workspace. |
| A whole menu section has disappeared | Every screen in it is switched off or hidden. | As above. |
| A published policy cannot be edited | Published text is frozen by design. | *Start a new version*: the published version stays in the history. |
| *Approve* is refused on a policy | Approving needs RACI **A** on step 13 or an administrator. | Have it approved by the accountable person. |
| After *Start this case over*, steps 2 and 3 show *To do* | The instructor's setting hands those steps back to the student. | That is intended: extract the profile and the crown jewels again from the case documents. An instructor can change it under *For the instructor*. |
| Import from documents reads only one document | The documents just added are the only ones selected by default. | Tick the others, or *Select all documents*. |
| Red `engine DIVERGES` banner | Engine disagrees with the reference totals. | Stop. Restore a clean copy. |
| *This workspace is open read-only* | It was written by a newer release, or its migration failed. | Backup & restore → Data versions and migrations says which; open it with the newer release, or send the error to support. Nothing was changed. |
| *Organisation link* says the contract is not available | The ontology found is older than v0.9.1. | Clone tag v0.10.0 (section 3.5) and point the server at it. |
| The compliance and security-operations contexts say they need CRGO v0.10.0 | The ontology found is older. | Clone tag v0.10.0 beside the application (it is found newest first), or point `crgo-ontology` in Claude at it. |
| A write-back is refused with `UNKNOWN_SUBJECT` or `INPUT_UNKNOWN` | Scenarios were added, renamed or excluded since the graph was built. | *Rebuild the organisation graph*, then send again. |
| *The organisation graph folder is inside a git repository* | The confidential folder chosen is in a repository. | Choose a folder outside any repository (Organisation link → *Save the folder*). |
| A simulation pack shows errors and cannot be imported | It cites scenarios or crown jewels this workspace does not have. | Import it into a workspace of its case (for MediBec, the example or a copy of it). |
| The SIEM coverage looks wrong for the exercise | The as-of date is before the storyline. | SIEM → Overview → set the as-of date (9 October 2026 or later for the MediBec pack). |
| An alert or case is not counted as an incident | Nobody confirmed it. | That is the rule: SOAR → Cases → **Confirm as incident**, with a name and a date. |
| An import in SIEM adds nothing | The records are duplicates of records already imported. | Nothing to fix; the import history shows how many were skipped. |
| Some alerts or seeds show *Masked — restricted TLP* | They are TLP:RED or TLP:AMBER+STRICT. | Tick *Show TLP:RED and TLP:AMBER+STRICT items on this computer* to read them here; they are never sent to AI. |
| *Settings → Logs* is refused | Only an administrator can read the logs in multi-user mode. | Sign in as an administrator. |
| A snapshot built in the app is not in the Downloads folder | **Use in this workspace** stores it in the workspace; it creates no file. | Click **Download threat-context-YYYY-MM-DD.json** (or **Download** at the top of Threat context). |

To see an underlying error, open the developer console — **⌥⌘I** on macOS, **F12** on Windows and
Linux — and read the **Console** tab.

---

## 14. What this tool does not do

It is a decision-support instrument. Every scenario, probability, CVSS score, cost estimate,
effectiveness estimate and suggested option that passes through it is an **initial analytical
hypothesis** that needs validation against internal stakeholders, technical data, audit findings,
test results, incident history and threat intelligence.

Quantitative results are **relative indicators for comparison and prioritization**, not predictions
of financial loss. A threat-context snapshot is dated evidence about the external environment, not
a measurement of your organization. The context hints are a keyword scan, not an analysis. The
batch builder produces candidates, not an assessment.

Anything the **AI assistant** produces is a hypothesis with less standing than the rest, not more: a
critique is one reader's opinion of your estimates, a generated scenario is a draft that has not met
your organization, and a narrated briefing is a covering note. None of it is evidence, none of it
changes a stored value by itself, and the decision log exists so that an auditor can see which
suggestions you took and which you refused.

A **forecast** describes the width of your uncertainty about your own estimates. It is not a
prediction of events, and a narrow interval means your estimates agreed with each other, not that
they were right. A **KRI projection** extends a line through past readings and says nothing about
whatever will actually change next quarter.

A **triage** says which of this week's stories deserve your attention given what you have recorded.
It is only as good as that record: a technology you never entered, or an exposure you never confirmed,
cannot put a story in front of you.

The **ontology** is a library of calibration priors, not a description of your organization: its
values were estimated for a fictitious healthcare organization and for teaching cases. A **Risk
Registry** card describes another organization at another time, as that organization saw it; its
parameters are a reference point, not an estimate for yours, and anonymization reduces — it does not
eliminate — the risk that a card is traced back to its contributor. A **policy template** is a starting
point, not legal advice; a **compliance status** proposed by rules or AI is a reading of the evidence
recorded, and is only as complete as that evidence.

- **It does not give legal advice.** Legal applicability is CRGO's evaluation of a profile; potentially
  applicable instruments need a qualified person, and breach-reportability assessments are for qualified
  people.
- **It is not an audit methodology.** SP 800-53A objectives are a reference; CRGO's work programmes are
  illustrative.
- **The ontology computes no risk, and a write-back approves nothing.** Every number comes from this
  application's engine; approvals, risk acceptances and funding are decisions people record.
- **It does not connect to your security tools.** SIEM and SOAR work from files you import; response actions are
  recorded by people, and playbooks are tested by dry run. An alert is not an incident until a person confirms
  it, nothing here authorises a response action, coverage is validated only by an effective detection test,
  and a source confidence is not a probability.
- **A mapping, an acknowledgement or an attestation is not compliance.** Only a dated determination backed by
  current evidence states a compliance state. Licensed standards appear as identifiers only.
- **Simulation data is fictional.** It teaches; it is never evidence about a real organization.

The decision to accept, transfer, avoid or mitigate a risk remains with management.
