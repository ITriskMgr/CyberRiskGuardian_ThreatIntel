# CyberRiskGuardian Desktop — User Guide

**CyberRiskGuardian with Threat Live-feed, standalone desktop edition, version 1.5.6 Beta**
**Proof of concept** — for teaching, exploration and method validation. Validate every result before
it supports a real decision.
© 2026 Marc-André Léger · CC BY-NC 4.0

This guide covers installing the standalone app, starting it, verifying that it is trustworthy
before you use any number it produces, and working through each of its screens — from configuring
the organization to exporting the assessment to Excel.

---

## 1. What the standalone edition is

A single folder of static files that runs entirely inside your browser. It gives you the
CyberRiskGuardian calculation engine and everything around it needed to run an assessment end to
end: organization workspaces and context documents, a scenario register, editor and batch builder,
a portfolio risk calculator, MITRE ATT&CK threats, CVE/CWE vulnerabilities, threat-context
snapshots (CISA KEV and FIRST EPSS), treatment recommendations, a KRI dashboard with history and
trends, a budget calibrator with funding arbitrage, and an Excel export with live formulas.

Version 1.5.1 adds a **Frameworks & standards** register with imported control catalogues, the
**mitigation-to-recommendation lifecycle** (draft → review → approval → implementation → completion),
**backup and restore**, **forecasts** (Monte Carlo and KRI projection), an **AI assistant** that
proposes and never calculates, and **feed triage** with a weekly briefing.

Version 1.5.2 adds the **Process** page — the 12 steps of a complete assessment (section 6.0); a
**French interface** with an EN / FR toggle (6.27); a **help chatbot** (6.26); **users and rights**
per step with a RACI matrix (6.28); **extraction of the profile and the crown jewels from the
documents**, every value tagged FACT, INFERENCE, ASSUMPTION, EXTERNAL or UNKNOWN, with **Save** and
**Cancel** in Profile & appetite (6.1); AI-proposed candidates and a candidate count in Batch
scenarios (6.5); the **About** screen and the **Exit** button (6.29).

Version 1.5.3 adds **suggested links between vulnerabilities and scenarios** — rules on this computer,
then AI on the local model by default — reviewed in one list (6.30), and **Settings → AI — local &
remote**, one place that decides where each AI feature may send its requests, with a connection test
for each provider (6.31).

Version 1.5.4 completes the **guidelines in detail** (section *Guidelines in detail*, also on the
Process page, in the help chatbot and in the printable checklist), adds **Import from the documents**
for fourteen more parts of the assessment (6.32), the **Evidence** tab of Organization (6.32),
**Settings → Documents & files** to manage the documents of every workspace (6.33), **menu access by
user group and user account** (6.28), and shows **amounts in one format** — $123,423 — in every
language and on every screen.

Three properties matter more than any feature:

**Your data stays on the computer, with two exceptions you trigger yourself.** The app itself makes
no network request — not on start, not when you upload a document, load or build a snapshot, run the
exposure join, triage a feed, forecast or export. The first exception is the **download helper**: in
*Vulnerabilities → Online sources* and *Threat feeds*, it fetches public catalogues (CISA KEV, FIRST
EPSS, NVD, your accepted feeds) *in full* into your feeds folder. It never sends your CVE list,
documents, scenarios or client names anywhere; the join with your register happens afterwards, in the
browser. The second exception is **AI** (sections 6.1, 6.5, 6.23 and 6.26): when you press send in
an AI preview, the text you were just shown — byte for byte, with its size and destination named — is
transmitted to the provider you chose for that workspace. Nothing is sent automatically, on a
schedule, or in the background, and no network call sits in the calculation path. Links to
attack.mitre.org, NVD or CVE.org open only when clicked.

**It does not reimplement the formulas.** `crg.js` and `cvss4.js` are copied verbatim from
`CyberRiskGuardian_IOS` v1.0.1, where they are already verified against `crg_calc.py` and the Python
`cvss` package. Every number on every screen, and every cached value in the Excel export, comes from
that engine.

**It proves itself on every start.** See section 4.

---

## 2. Before you install

| You need | Notes |
|---|---|
| A current browser | Chrome or Edge for the installable app. Safari and Firefox run it in a tab. |
| Python 3 | Only to serve the folder locally. macOS and most Linux distributions already have it. On Windows, install it from [python.org](https://www.python.org/downloads/) and tick **Add python.exe to PATH**. |
| About 6 MB of disk | Plus your workspaces and any snapshot you load. The bundled example snapshot is about 1.5 MB; a full one from `threat_snapshot.py` is 8 MB or more. |

No account, licence key, installer or administrator rights are required. Nothing is written outside
the folder and your browser's own storage.

---

## 3. Install and start

### 3.1 Unpack

Unzip `CyberRiskGuardian_Desktop_v1.5.6-beta.zip` anywhere you can write. Keep the folder intact: the
app loads its own files by relative path.

> `INSTALL.md` in the folder is the same instructions on one page, **in English and in French**,
> including upgrading from an earlier 1.5.x and where your workspaces and keys actually live.

**Upgrading from 1.5.x?** Unzip into a *new* folder beside the old one, stop the old server if its
terminal window is still open, and start the new one **on the same port** — your workspaces are kept
by the browser for the exact address you use, not in the folder, so the same port finds them. Your
API keys are not in the folder either; they are in `crg-keys.json` in the feeds folder, and
`feeds-dir.txt` carries that path over. Workspaces from 1.1 onwards open as they are.

**Upgrading from 1.0.0?** Two things can keep showing you the old version:

1. **The old server is still running.** If a terminal window from 1.0.0 is still open, it still
   serves the old folder on port 8099, and the new launcher cannot take the port. Since 1.1.1 the
   launchers detect this, stop the earlier copy and say so. With any older launcher, press
   Control-C in the old window first (or run `lsof -ti:8099 | xargs kill` on macOS).
2. **Version 1.0.0's offline cache.** 1.0.0 served its cached files first. The first time you open
   the new version the browser may still show 1.0.0 while it installs the new one — **reload once**
   (⌘R) and the footer reads **v1.1.1**. From 1.1.1 on, the served files always win and updates show
   immediately.

Version 1.0.0 stored nothing, so there is nothing to migrate.

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
| `engine error` | An exception during the self-check. | Open the console (section 9) and report it. |

---

## 5. Workspaces and your data

A **workspace** holds one organization or one business case: its profile, documents, scenarios,
initiatives, threat and vulnerability links, snapshot, KRI history, decisions and revision log. The
selector at the top of every screen switches between them; its last entry creates a new one.

The first start creates **MediBec — teaching case (fictional)**, the complete 30-scenario example.
Use it to learn the screens; create your own workspace for real work.

Workspaces are saved automatically in the browser's local database (IndexedDB) on this computer —
the time of the last save is shown top right. They are not shared with other browsers or computers.
**Export a workspace** (Organization → Workspaces, or Export) to back it up, move it, or hand in a
classroom case; import it on any computer under Organization → Workspaces → *Import a JSON file*.
Clearing the browser's site data for the app's address deletes the workspaces on that computer.

> Confidential material stays on this computer, but it is still confidential material on this
> computer. Follow your organization's rules for where assessment data may be kept.

---

## 6. The screens

### 6.0 Process — the 12 steps of a complete assessment (start here)

**Process** is the first item in the menu. It lists the steps below with their status in the current
workspace (*not started*, *in progress*, *done*), recommends the next one, and opens the right screen
with one click. Each step says what it is for, what it needs and when it is done; *Tips* expand under
it. **Print the checklist** gives a list to tick that names, for each step and each guideline, where it
happens. The guidelines below the workflow open to show where each one happens, its steps with the exact
labels of the screens, and when it is done, with buttons to the screens; **Expand all** opens them all. In multi-user mode each step also shows who
is Responsible and Accountable.

| # | Step | Done when | Screens |
|---|---|---|---|
| 1 | Set up the workspace | The workspace has an organization name and at least one context document. | Workspaces, Context documents |
| 2 | Describe the context and risk appetite | At least 8 of the 12 context fields are filled, the appetite has a rationale and the IT budget is entered. | Profile & appetite |
| 3 | Identify crown jewels and information assets | At least 3 crown jewels or 5 information assets, with owners and classification. | Crown jewels, Information assets |
| 4 | Gather threats and vulnerabilities | A threat-context snapshot is loaded and the vulnerability register holds the exposed CVEs. | Threats, Vulnerabilities, Threat feeds, Threat context |
| 5 | Develop risk scenarios | At least 10 scenarios in the register (20 candidates, the 10 most material kept). | Batch scenarios, Scenario register, Scenario editor |
| 6 | Quantify each scenario | 80 % of the parameters of the included scenarios carry a rationale. | Scenario editor, CVSS v4.0, Forecasts |
| 7 | Evaluate against tolerance | The included scenarios compute and each has a management decision recorded. | Risk calculator, KRI dashboard, Risk register |
| 8 | Select mitigation measures | Every scenario above tolerance is covered by at least one measure. | Risk mitigation |
| 9 | Recommend and approve | At least one recommendation is approved and every risk has a treatment decision. | Recommendations, Risk register |
| 10 | Align the budget | The budget year is filled and the initiatives are allocated. | Budget |
| 11 | Monitor with KRIs | At least one measurement is recorded. | KRI dashboard, Forecasts |
| 12 | Report, demonstrate compliance and share | A compliance framework is assessed or a registry package has been published. | Export, Compliance, Frameworks, Publish & share |

**Guidelines that make the assessment simpler** — each is detailed in the next section, with the screens, the steps and when it is done; the same text is on the Process page (open a guideline) and in the printable checklist.

1. **Start from the documents.** Create the workspace with all the case documents and let “Extract from documents” propose the profile and the crown jewels. Accept, edit or reject each value, then Save.
2. **Resolve the UNKNOWN values first.** Extracted values are tagged FACT, INFERENCE, ASSUMPTION, EXTERNAL or UNKNOWN. UNKNOWN items are the information still to collect; ASSUMPTION and EXTERNAL values need validation by the organization.
3. **Generate 20, keep 10.** In Batch scenarios generate about 20 candidates (rules or AI), review them in the grid, and keep the 10 most material in the register.
4. **Write causal chains, not threat names.** Threat source → weakness → asset → event → consequence. “Ransomware” alone is not a scenario.
5. **Be honest about confidence.** Give every parameter a rationale and a confidence level; Forecasts turns low confidence into wider ranges.
6. **Let the engine calculate.** Residual risk and the ratio come from the verified engine; AI and feeds propose, they never change a score.
7. **Treat what is above tolerance first.** Use Risk mitigation → Proposals on the scenarios above tolerance; shared measures are counted once.
8. **Get approvals from the accountable person.** Recommendations and risk acceptances are approved by the person who is Accountable (RACI “A”).
9. **Keep a baseline and a budget.** Enter the IT budget, the current cybersecurity spend and the baseline (run) cost; the Budget screen shows where each option lands.
10. **Record KRIs at every review.** Four readings are enough for the KRI projection to say whether a threshold will be crossed.
11. **Anonymize what leaves.** Publish & share anonymizes; a classroom case is labelled fictional automatically.

### Guidelines in detail — a complete assessment, simply

Labels between quotation marks are the exact names of the buttons, tabs and options on the screens; they are checked against the application at every build (`tools/label_check.py`).

#### 1. Start from the documents

Create the workspace with all the case documents and let “Extract from documents” propose the profile and the crown jewels. Accept, edit or reject each value, then Save.

*Where:* Organization → Workspaces → New workspace

1. Type the workspace name; choose “Real organization” or “Classroom business case”; for teaching tick “Educational case used for training purposes”.
2. Drop all the case documents (Word, PDF, Excel, PowerPoint, text) on the document zone.
3. Tick “Extract the profile & appetite from these documents after creation”, “Then extract the crown jewels” and, to go further, “Then import more from the documents”; click “Create workspace”.
4. Choose “Use AI (preview before sending)” — you see the exact text before anything is sent — or “Rules only (no AI, offline)”.
5. In the review, edit any value, tick those to keep and click “Put ticked values in the form”; check the fields and click “Save”.
6. Review the crown jewels and click “Add ticked crown jewels”.
7. Under “Import from the documents”, tick the targets (information assets, BIA, third parties, existing controls, compliance, incidents, weaknesses, candidate scenarios, parameter evidence, risks, budget, KRIs, people and roles, classroom), click “Start the import”, and for each target tick and click “Add ticked”.
8. Redo any extraction later with “Extract from documents…” on Profile & appetite or Crown jewels; the AI route of each extraction is set in Settings → AI — local & remote.

*Done when:* Process steps 1 and 2 show Done: a name and at least one document; at least 8 of the 12 context fields, an appetite rationale and the IT budget.

#### 2. Resolve the UNKNOWN values first

Extracted values are tagged FACT, INFERENCE, ASSUMPTION, EXTERNAL or UNKNOWN. UNKNOWN items are the information still to collect; ASSUMPTION and EXTERNAL values need validation by the organization.

*Where:* Organization → Profile & appetite (and Evidence for imported records)

1. Read the coloured tag beside each field label.
2. UNKNOWN: collect the information, enter it and click “Save”.
3. ASSUMPTION and EXTERNAL: have them validated by the organization; hover the tag to see the source (document or web page). An asterisk after the tag means the value was edited after extraction.
4. When management has not approved an appetite, use the “Appetite estimator” at the bottom of the tab; its result is labelled an analytical estimate.

*Done when:* No UNKNOWN tag left on the fields the assessment relies on.

#### 3. Generate 20, keep 10

In Batch scenarios generate about 20 candidates (rules or AI), review them in the grid, and keep the 10 most material in the register.

*Where:* Batch scenarios

1. Rules: on “Threat patterns × assets” tick the patterns, then “Tick crown jewels + 5 most critical”, choose the threat sources, set “Number of candidates” to 20 and click “Generate candidates”.
2. AI: on “Propose with AI” set the number, add a direction if useful, keep “Include the text of the context documents” ticked and click “Propose candidates” (preview first).
3. Also available: “From MITRE ATT&CK”, “From CVE”, “From CWE”, and the candidate scenarios imported from the documents (marked [Docs]).
4. In the grid, edit names, statements and parameters, tick the 10 most material and click “Add … selected to the register”.
5. In the Scenario register, the checkboxes include or exclude scenarios from the totals.

*Done when:* Process step 5 shows Done: at least 10 scenarios in the register.

#### 4. Write causal chains, not threat names

Threat source → weakness → asset → event → consequence. “Ransomware” alone is not a scenario.

*Where:* Scenario editor

1. Write the statement in one or two sentences: threat source → weakness → asset → event → consequence.
2. Fill the threat source, initiating event, vulnerabilities or predisposing conditions, assets, processes, existing controls, sequence and consequences.
3. Link ATT&CK techniques, CWE and CVE; “Suggest vulnerabilities for this scenario…” opens Vulnerabilities → Suggest links for that scenario.

*Done when:* Every scenario in the register reads as a complete causal chain.

#### 4b. Record what already protects you, then measure the resilience it adds up to

An assessment that has no record of existing controls has to guess at θ. Inventory what is in force,
score it against the six capabilities θ is defined as, and let the two instruments disagree in the
open.

*Where:* Existing safeguards; Maturity & resilience

1. Existing safeguards → “Add a safeguard”: name it, set the state, name an accountable owner, and
   state the scope **and what it does not cover**.
2. Under “Contribution to resilience”, score the safeguard against each capability. A safeguard marked
   “Planned” counts for nothing until it operates.
3. Record when it was last tested with the result; no evidence for twelve months is reported as stale.
4. If your existing controls are still in the mitigation plan, “Bring controls over” lists them and
   “Bring the ticked ones into the inventory” moves the ones you tick.
5. Existing safeguards → “Resilience coverage” shows where the resilience comes from and proposes a θ.
   Nothing changes until you apply it to a scenario.
6. Maturity & resilience → “Maturity (CSF 2.0)”: score the categories that matter, against a target.
   Leave a category blank rather than guessing it. “Fill the unscored ones from the inventory” proposes
   a level where safeguards point at a CSF category.
7. Maturity & resilience → “Resilience (θ)”: answer the eighteen questions. “Unknown” is a real
   answer and is excluded from the score.
8. Maturity & resilience → “The two readings”: read the gap between the questionnaire and the
   inventory. The lower θ is offered; apply it per scenario.
9. “Record it” keeps a dated entry so the next assessment can be compared with this one.

*Done when:* The inventory covers what is in force, and a θ on each material scenario comes from the
assessment rather than from memory.

#### 5. Be honest about confidence

Give every parameter a rationale and a confidence level; Forecasts turns low confidence into wider ranges.

*Where:* Scenario editor → the six parameters; Forecasts

1. For each of the six parameters give the value, a rationale, the evidence and a confidence (High, Medium, Low). Evidence imported from the documents is added to these fields, never as a number.
2. Forecasts → “Parameter ranges” → “Propose ranges where none are set” (Low ±0.15, Medium ±0.10, High ±0.05), then “Monte Carlo” → “Run forecast”.
3. Optional: AI assistant → “Parameter critique” points out confidence the evidence does not support.

*Done when:* Process step 6 shows Done: 80% of the parameters of the included scenarios carry a rationale.

#### 6. Let the engine calculate

Residual risk and the ratio come from the verified engine; AI and feeds propose, they never change a score.

*Where:* Risk calculator; footer

1. Check the footer reads “engine verified · 84,491 / 41,104” at every start.
2. Read estimated, tolerated, mitigated and residual risk, the ratio and its band in the Risk calculator.
3. Only accepted proposals change a value; Threat context → “Proposed Pb(ψ,A) changes” is the only path from threat intelligence to a score, for exposed CVEs only.

*Done when:* The figures you report come from the Risk calculator.

#### 7. Treat what is above tolerance first

Use Risk mitigation → Proposals on the scenarios above tolerance; shared measures are counted once.

*Where:* Recommendations → Treatment need; Risk mitigation

1. Recommendations → “Treatment need”: the verdict against tolerance and a treatment objective per scenario.
2. Risk mitigation → “Proposals”: tick the scenarios above tolerance and click “Add ticked proposals to the plan” (or pick controls in “Control catalogue”). Existing controls imported from the documents are already there as implemented, with zero reductions until you set them.
3. “Mitigation plan”: set cost and likelihood / impact reductions; tick the measures to implement and click “→ New draft recommendation”.
4. A measure covering several scenarios is costed once — see Recommendations → “Shared controls”.

*Done when:* Process step 8 shows Done: every scenario above tolerance has at least one measure.

#### 8. Get approvals from the accountable person

Recommendations and risk acceptances are approved by the person who is Accountable (RACI “A”).

*Where:* Recommendations → Recommendations; Risk register

1. Recommendations → “Recommendations”: move the draft through Draft → In review → Approved, with the approver and a note; approval freezes the figures.
2. Risk register → the risk → “Formal acceptance” (“Accepted by”, “Rationale, conditions, approval reference”).
3. In multi-user mode (Settings → “Users & RACI”) only A on step 9, or an administrator, approves and accepts; approving a measure needs A on step 8. “Menu access by group and user account” can further restrict or open screens. “Switch user” is in the top bar.

*Done when:* Process step 9 shows Done: at least one recommendation approved and every risk has a treatment decision.

#### 9. Keep a baseline and a budget

Enter the IT budget, the current cybersecurity spend and the baseline (run) cost; the Budget screen shows where each option lands.

*Where:* Organization → Profile & appetite (bottom); Budget

1. Enter “Total IT budget (incl. salaries)”, “Cybersecurity budget (current spend)” and “Baseline (run) security cost”, then “Save”.
2. Budget: fill the budget year and allocate the initiatives over up to three years; projects imported from the documents are already listed as initiatives.
3. The band chart places each funding option between risk-averse (4% of IT), neutral (7.8%) and risk-seeking (12%).

*Done when:* Process step 10 shows Done: the budget year is filled and the initiatives are allocated.

#### 10. Record KRIs at every review

Four readings are enough for the KRI projection to say whether a threshold will be crossed.

*Where:* KRI dashboard; Forecasts → KRI projections

1. KRI dashboard: “Record a measurement”, or “Record computed + entered values” to capture everything at once. Metrics imported from the documents are the first reading.
2. Forecasts → “KRI projections”: from 4 readings, the trend with a 95% band and whether a threshold will be crossed.

*Done when:* Process step 11 shows Done: at least one measurement recorded.

#### 11. Anonymize what leaves

Publish & share anonymizes; a classroom case is labelled fictional automatically.

*Where:* Publish & share → Publish a package; Settings → AI — local & remote

1. Publish & share → “Publish a package”: choose the scope and format, tick “Anonymize this package”, read “Check these before publishing”, then “Publish to the shared registry”.
2. Classroom and educational cases are labelled fictional in the exports and the workbook.
3. For AI: Settings → AI — local & remote → “Anonymize before sending”.

*Done when:* Nothing identifying leaves the computer without a decision.

### 6.1 Organization

**Workspaces tab — assessing a new or different organization.** Give the workspace a name, choose
*Real organization* or *Classroom business case*, and start from a blank assessment, a copy of the
MediBec example, a copy of the current workspace, or an imported file (a workspace export, or any
assessment JSON that `crg_calc.py` accepts).

**Import several documents at creation.** The New-workspace form has its own drop zone: drop or
choose several Word (.docx) or PDF files at once — the business case, the company profile, an audit
report, the incident history; Excel, PowerPoint and text files are accepted too. Remove any you
added by mistake, then click **Create workspace**. Each file is read on this computer with a
progress line (words found, *little text found*, or an error) and the workspace opens on **Context
documents**, where the hints from all the documents are gathered for you to accept.

**Profile & appetite.** Context, mission, products and services, critical processes and systems, cloud,
suppliers, sensitive information, availability requirements, controls and maturity, incident
history and the legal and regulatory obligations. Below them: the **risk appetite** with its
rationale, the multiplication factor and currency, and the **IT budget**, current cyber spend and
baseline run cost used by the Budget screen. When management has not approved an appetite, the
*appetite estimator* suggests one from ticked factors — it is labelled an analytical estimate and
must be validated.

*Cybersecurity budget (current spend)* is everything spent on cybersecurity this year: staff, tools,
services, projects. *Baseline (run) security cost* is the part of that spend needed just to keep
existing security running — salaries of the current security staff, licence renewals, existing
managed services, maintenance. It covers no new treatment.

**Save and Cancel (1.5.2).** Edits in Profile & appetite are a draft: the bar at the top says
*Unsaved changes* until you click **Save**. **Cancel** puts back the saved values. Leaving the tab or
the screen with unsaved changes asks first.

**Extract from documents (1.5.2).** The button in the same bar proposes every field of the profile
from the context documents. Choose:

- **Use AI** — the documents' extracted text and the instructions are shown in full before anything
  is sent. With the **Claude** provider you can tick *Search the web for missing information*: items
  the documents do not give (for example a public company's sector or size, or the obligations of its
  jurisdiction) are looked up and tagged **EXTERNAL** with the page cited. This needs your Claude API
  key and `api.anthropic.com` allowed by your organization's network settings. With a **local
  model**, missing items can only be tagged ASSUMPTION or UNKNOWN. For a classroom or educational
  case the organization is fictional, so the search is limited to sector benchmarks (IT budget as a
  share of revenue, typical regulations).
- **Rules only** — no AI, offline: sentences matching each field are picked from the documents;
  values found this way are tagged FACT or INFERENCE, the appetite is an ASSUMPTION, and the rest is
  UNKNOWN.

The review lists every field with its current value, the proposed value (editable, normalized to a
short structured statement of under 50 words, or a number, an ISO currency code, an appetite between
0.1 and 0.9), its **tag** and its **source**:

| Tag | Meaning |
|---|---|
| FACT | Stated explicitly in the documents (the source names the document). |
| INFERENCE | Derived from facts in the documents. |
| ASSUMPTION | A plausible value because information is missing — validation required. |
| EXTERNAL | From external evidence, such as a web page (cited). |
| UNKNOWN | Not found — information still to collect. |

Tick the values to keep (empty fields are ticked by default) and click **Put ticked values in the
form**: they go into the draft, nothing is saved yet. A coloured tag stays next to each field label
— an asterisk means you edited the value after extraction. Click **Save** to keep them.

**Crown jewels.** The assets and services whose loss would most harm the mission, with owner, C/I/A
importance, dependencies and suppliers. They feed the batch builder. **Extract from documents…** on
this tab proposes crown jewels the same way (AI or rules), with a tag and a source for each; you tick
those to add. The *Provenance* column keeps the tag.

**New workspace options (1.5.2).** When you add documents at creation you can tick *Extract the
profile & appetite from these documents after creation* and *Then extract the crown jewels*: the
extraction opens as soon as the workspace is created. Tick **Educational case used for training
purposes** to mark a teaching case; the workspace becomes a classroom case and the banner says so
(the same box is in the Classroom tab).

**Classroom** (classroom workspaces only). Course, business-case title, team, members, instructor
and due date. Every export carries them, and the workbook README states that the case is fictional.

**Context documents — uploading data about the organization.** Drop or choose files: Word (.docx),
Excel (.xlsx), PowerPoint (.pptx), PDF, text, Markdown, CSV, JSON or HTML. The app extracts the text
**locally** and stores it with the workspace. Open any document to read or correct its text, or add
a typed note. PDFs are read on a best-effort basis: scanned or unusually encoded PDFs yield little
text, and the app says so — paste the key passages as a note instead.

The **context hints** panel scans the text for sector signals, laws and standards, technologies,
candidate crown jewels, CVE identifiers and monetary amounts. It is a keyword scan, not an
interpretation; nothing is added until you click to add it, and CVEs found this way enter the
vulnerability register as *unconfirmed*.

Text extraction and the hints use no AI: both are local code, and the documents themselves are never
transmitted. To have the CyberRiskGuardian agent draft scenarios from these documents, use
**Export → Context pack** and give the pack to the plugin in Claude (`/risk-assessment`); load its
assessment JSON back through the register. Since 1.5.1 the **AI assistant** screen (section 6.23) can
also draft scenarios from inside the app, from the organization context rather than the full
documents — and it still never writes to the register.

### 6.2 KRI dashboard

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

**Top 5 by default (1.4.0).** The dashboard opens on the five indicators that most need attention:
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

### 6.3 Scenario register

All scenarios with their threats (ATT&CK chips), vulnerabilities (CWE and CVE chips), CVSS,
estimated and residual risk, ratio and status. Chips open the matching technique, weakness or CVE;
a scenario name opens the editor. The checkbox includes or excludes the scenario from totals.
**Load assessment JSON** replaces the scenarios or appends them (clashing IDs are renumbered);
**Export JSON** writes the file `crg_calc.py` reads.

### 6.4 Scenario editor — view and edit a scenario

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

### 6.5 Batch scenarios — creating many scenarios at once

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
- **Propose with AI (1.5.2).** Choose how many candidates (1–30) and, optionally, a direction (“focus
  on suppliers”, “OT in the plants”). The organization profile, the crown jewels and the information
  assets are sent — shown first in the usual preview. Each candidate comes back with a full causal
  chain, the six parameters with a reason and a confidence for each; it lands in the grid named
  *[AI]* for review and never enters the register directly.

**Assets (1.5.2).** Step 2 lists the crown jewels **and** the information assets of the inventory,
most critical first; *Tick crown jewels + 5 most critical* is a quick start. (Before 1.5.2 it showed
“No crown jewels defined” when only Information assets were filled.)

**Number of candidates (1.5.2).** Threat patterns × assets × sources can make hundreds of
combinations. Set *Number of candidates* (default 10; quick buttons 10, 20, 30, 50; up to 500): the
most relevant combinations are generated first — pattern likelihood × asset criticality × fit of the
threat source.

Every candidate lands in the **review grid**, where name, statement, source, asset, the six
parameters, CVSS and reductions can be edited. Tick the ones to keep and click **Add selected to
the register**. Generated values are starting points, flagged *Low* confidence with the rationale
"Batch default — analytical estimate, validation required". The method's guidance applies:
about 20 candidates, then the 10 most material for detailed analysis.

### 6.6 Risk calculator

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

### 6.7 Recommendations — the options the organization can consider

**Treatment need** (first tab, 1.5.1). Before any control is offered, this tab states for every
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

**Register** (1.5.1) — the lifecycle from a selected measure to a decision the organization owns.

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

### 6.8 Threats · ATT&CK

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

### 6.9 Vulnerabilities · CVE/CWE

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

### 6.10 Threat context

**Snapshot.** Three routes, and since 1.5.5 one of them needs no network at all.

**Load the bundled example** (1.5.5). `examples/threat-context/threat-context-example.json` ships
with the application — about 1.5 MB — and the button beside the file picker loads it in one click. It
carries the **full CISA KEV catalogue of its build date (1,733 entries), 38,533 EPSS scores, the
Threat Evidence Ladder, the thresholds and the constraints**. That is enough to place CVEs on the
ladder, run the exposure join and complete Process step 4 on a machine with no internet access at all.

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

### 6.11 CVSS v4.0

A Base-score calculator. Threat and Environmental metrics are deliberately absent. Paste a vector to
load it, send it to the risk calculator, or — when opened from a scenario — save it back.

### 6.12 Budget — years, multi-year projects, and bands from risk-averse to risk-seeking

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

### 6.13 Export · Excel

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

### 6.14 Information assets

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

### 6.15 Risk register

Risks are what management owns; scenarios are how they are quantified. *Create from scenarios* makes
one risk per scenario with its techniques, CWE/CVE, assets and measures, and ratings on a 1–5
likelihood × impact scale: **current** from the scenario parameters, **target** after the combined
reductions of its measures; **inherent** starts equal to current for you to adjust. Each risk shows
the residual/tolerated ratio of its scenarios. Record the owner, category, treatment, status, next
review and a **formal acceptance** (by, date, valid until, rationale); every change is logged in the
risk's history. The heat map (inherent, current or target) and the top-risks list sit above the
register. *Refresh ratings from scenarios* updates current and target after parameters change.

### 6.16 Risk mitigation

- **Control catalogue.** Your list (Controls_list.xlsx: ISO/IEC 27002:2013, the NIST CSF 1.1
  subcategories labelled “NIST 800-53” in the sheet, CIS v7.1 — numbering corrected and seven rows
  flagged), ISO/IEC 27002:2022, NIST SP 800-53 Rev. 5 (with enhancements on request), NIST CSF 2.0,
  CIS Controls v8.1, ATT&CK mitigations, the CRG measures, and any catalogue you have loaded in
  *Frameworks & standards* (section 6.22) — SP 800-171 r3, ITSP.10.171, COBIT 2019 or your own import.
  Search, filter by framework, function or capability, tick controls and *Add* them to a new or
  existing measure.
- **Measures.** Name, function, owner, status (proposed, approved, in progress, implemented,
  rejected), one-time and recurring cost, months to benefit, effort, confidence, default likelihood
  reduction **rp** and impact reduction **ri**, overridable per scenario with a rationale, and the
  catalogue controls implemented. Since 1.5.1 a measure also records **what it changes** — one of the
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
- **→ Recommendation** (1.5.1). Tick the measures that belong together and press it: a **draft
  recommendation** is created from them, collecting their scenarios, costs, horizon, framework mapping
  and the reduction they would achieve. Continue in *Recommendations → Register* (section 6.7).
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

### 6.17 Threat feeds & social

**Triage** (first tab, 1.5.1). A feed is a pile of headlines; a triage is a decision. This tab merges
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

### 6.18 Compliance

Tick the frameworks the organization follows. For each, the **statement of applicability** lists the
controls with applicable, status, maturity 0–5 and target, owner and evidence, and the measures and
scenarios linked through Risk mitigation. *Mark … implemented by measures* sets the controls of
implemented measures. **Gaps** (applicable, not or partly implemented) are ranked by the residual risk
of the scenarios they relate to; *Create measure* starts one. The **Law 25** and **PIPEDA** checklists
summarize obligations for risk-management purposes (not legal advice) with status, owner, evidence,
due date and related controls. Reports: Markdown and CSV here, and the Compliance_SoA sheet in Excel.

### 6.19 Publish & share

Choose the content (risk register with threats and vulnerabilities, scenario registry, measures), the
scope and the format (crg-registry/1 JSON, Markdown, CSV). **Anonymize** replaces the organization's
names, people's names, asset names and host names, IP addresses, internal URLs and domains, e-mails,
phone numbers and postal codes, turns amounts into ranges, and optionally truncates dates, drops free
text and replaces your own list of terms; ATT&CK, CWE, CVE and control identifiers and the parameters
are kept. Read the preview: a banner lists any workspace term still present. Then **Download**, **Copy**
or **Publish to the shared registry** — into the synced Drive folder set in Settings, or into the
outbox that the scheduled task uploads to the Drive registry folder. Each publication is logged; the
re-identification table stays in the workspace and is never published. **Import a shared registry**
reuses others' scenarios as a library (imported excluded from the calculator until reviewed).

### 6.20 Settings

- **Links & shared folders.** Every external address in one place. The screen separates **your own
  folders** — the Drive Feeds and registry folders (with their folder IDs), the local folders synced
  with them through Google Drive for desktop, and your controls list — from the public endpoints that
  come configured: KEV, EPSS, NVD, ATT&CK Navigator and the plugin repository. **Since 1.5.6 the
  application ships with none of your folders set**, because a shared folder is where your
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
- **AI providers** (1.5.1). Store or remove your Claude API key, set the base URL of a local
  OpenAI-compatible endpoint, and list the models that endpoint actually offers. Keys go to
  `crg-keys.json` through the helper, mode 600 — never into `crg-config.json`, a log, an export or a
  backup.
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
- **Export / import.** `crg-config.json` without keys, to set up another computer or share a source list.

### 6.21 Scheduled feed downloads with Claude

A Claude scheduled task runs on this computer through the Claude desktop app. At each run it reads
`crg-config.json`, stops if paused, runs `bin/crg_feeds.py --due` in the feeds folder (each source at
its own frequency), copies `feeds-digest.json` and a short summary to the Drive Feeds folder, uploads
the registry outbox to the Drive registry folder, and — at most weekly — proposes new sources. To
change how often it wakes up, pause it or run it now, open Scheduled tasks in Claude or ask Claude
(“run my CyberRiskGuardian feed task every 12 hours”). The computer must be awake with the Claude
desktop app open. If the organization restricts Claude's network access, the domains in Settings →
Network allowlist must be allowed first; until then the task reports them as blocked.

Since 1.5.1 the same task also writes the **weekly briefing** — but only if it has something to
triage with. Export the profile first (section 6.17): *Threat feeds → Triage → Export the profile for
the scheduled task*. The task then reads `briefings/triage-profile.json`, applies the same documented
rules to the week's downloads, writes `briefings/briefing-YYYY-MM-DD.md` in the feeds folder and
uploads it beside the digest. It is forbidden from changing any score, parameter or workspace, and it
does not touch `crg-keys.json`. If the profile is absent it says so in one line and does the download
only — it will not invent a profile.

The task's briefing is a **reading** of the rules; the application's triage is the deterministic one,
and the two can differ in wording. Where they differ on substance, the application is right.

---

### 6.22 Frameworks & standards

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

---

### 6.23 AI assistant (proof of concept)

AI **proposes and explains**. The verified engine still calculates, and nothing the AI produces
changes a stored value until you accept it. Constraint C1 is untouched: no network call sits in the
calculation path.

**Where it runs.** The browser never calls a model. It posts to the local helper, which makes the
request — so the key stays out of the page and the egress point is one auditable function in
`serve.py`. Two providers:

| Provider | Where the text goes | Set up in |
|---|---|---|
| `claude` | api.anthropic.com, with **your own** API key | Settings → AI providers → store the key |
| `local` | an OpenAI-compatible endpoint on this machine (oMLX, Ollama, LM Studio). Nothing leaves the computer. | Settings → AI providers → set the base URL, e.g. `http://127.0.0.1:8000/v1` |

Models are listed from the endpoint itself — nothing is hardcoded, so a model you pull locally
appears without an update.

**What is sent.** Before anything is transmitted, the screen shows the **exact payload**, byte for
byte, with its size and its destination. Read it. The anonymizer from *Publish & share* can be
applied to it first, which replaces the organization, people, assets, hosts and amounts. AI is on by
default per workspace and can be switched off entirely; a workspace marked **confidential** confirms
every single call and never remembers your consent. A request over 400 kB is refused rather than
sent — at that size you are shipping documents, not a question.

**The four tasks.**

| Task | What it does | What it may not do |
|---|---|---|
| **Analyst** | Answers a question about this assessment, with the organization context and the engine's own figures in the payload. | Recalculate. The figures it cites are the ones it was given. |
| **Parameter critique** | Reviews your `Pb(A)`, `Pb(ψ,A)`, `δe`, `δm`, `θ` and `μ(E)` against the scenario text and the evidence recorded, and says where it disagrees and why. | Apply anything. It suggests; you decide, parameter by parameter. |
| **Scenario generation** | Drafts scenarios as full causal chains, optionally seeded from triaged feed items. | Reach the register. They land in *Batch scenarios* marked **AI-generated, unreviewed**. |
| **Briefing narration** | Rewrites the week's triage for a management audience. | State any risk figure. |

**What comes back is logged.** Every call records the task, provider, model, date, bytes sent,
whether it was anonymized, the token usage, and **your verdict on the answer** — accepted, partly
useful, rejected. That log is the evidence that AI was used responsibly in the assessment, which is
the thing an auditor will ask for.

If an answer hits the model's output ceiling the screen says *cut short* and shows the findings that
arrived complete, rather than discarding the whole answer.

**Keys** live in `crg-keys.json` beside the feeds, mode 600. They are never in `crg-config.json`,
never in a log, and never in a backup.

---

### 6.24 Forecasts

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

---

### 6.25 Backup & restore

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

---

### 6.26 Help chatbot

The **?** button at the bottom right opens the help panel on every screen. It starts with a tip for
the screen you are on; ask a question in English or French. Answers come from the built-in help —
screen tips, the 12 process steps, frequent questions — and the user guide, searched on this
computer; *Open this screen* takes you there.

By default the chatbot is **help-only**: no AI, nothing sent. To allow AI answers, go to **Settings →
AI — local & remote** and tick **Let the chatbot use AI**; AI must also be on for the workspace (same
page), and the *Help chatbot* feature must not be routed to *Off*. Each answer then offers **Ask AI**, which shows exactly what would be sent
(your question, the screen, the matching help passages and a short summary of the workspace) before
anything leaves the computer. The AI answer is labelled as such; the chatbot never changes data.

### 6.27 Language — English and French

**EN / FR** in the top bar (or Settings → Language) switches every screen at once; the
choice is remembered. Only the interface is translated. Organization data, case documents,
scenarios, catalogue content (ATT&CK, CWE, control titles), exported files and AI answers stay in
their original language — a French case stays French in an English interface and vice versa.
Numbers follow the language (0,85; 12,3 %; 1 234 $). With the interface in French, AI requests ask
for French prose.

### 6.28 Users and rights (RACI)

Single-user mode is the default: no sign-in. **Settings → Users & RACI → Turn multi-user mode on**
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
- **Menu access by group and user account (1.5.4).** Create groups (*Add group*), tick their members,
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

### 6.29 About and Exit

**About** (Help group) has three pages. **About** names the creator, his e-mail
(marcandre@leger.ca), the project website (www.leger.ca) and the GitHub repository
(github.com/ITriskMgr/CyberRiskGuardian), and acknowledges the use of generative AI in building the
application. **Licence** (1.5.6) explains CC BY-NC 4.0 and then answers the question people actually
have — see 6.41. **Versions** lists the application, the verified engine, the local helper and the
knowledge base, and what this release added.

**Exit** (top bar) saves your work, stops the local helper and closes the window. In a browser tab
that the app did not open itself, close the tab when the closing screen appears. Start the app again
with the launcher.

### 6.30 Suggested links between vulnerabilities and scenarios

Open **Vulnerabilities → Suggest links** for every scenario, or **Suggest vulnerabilities for this
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
organization's vulnerability list; see 6.31 to change it.

**Review.** Both stages land in one list with the scenario, the vulnerability (and whether its exposure
is confirmed), the reason, the method (rules, AI, or both) and the confidence. High-confidence rows are
ticked by default. *Accept ticked* adds the links to the scenarios; *Reject ticked* removes the
proposals for good — they are not proposed again. *Gaps* lists the scenarios with no vulnerability
evidence (they may still be valid: an insider, an outage) and the register CVEs no scenario uses (they
may call for a new scenario — Batch scenarios → From CVE). *Recent decisions* keeps who linked or
rejected what, by which method.

A link changes no score. Pb(ψ,A) moves only for **exposed** CVEs, through the ladder proposals you
accept in Threat context (section 6.10).

### 6.31 Settings → AI — local & remote

One page for every decision about what may leave this computer for an AI model.

- **Master switches (this installation).** *Allow requests to the Claude API (remote)* — off, nothing is
  ever sent to api.anthropic.com and every feature must use the local model. *Allow web search for
  missing profile information* (Claude only).
- **Route of each AI feature.** For each feature — vulnerability linking, profile and crown-jewel
  extraction, scenario proposals, the AI assistant's analyst and critique, the weekly briefing, the help
  chatbot — what it sends, its sensitivity, and its route: *Workspace provider*, *Local model only*,
  *Claude API (remote)* or *Off*. The last column shows where it would go for the current workspace.
  *Restore the recommended routes* puts vulnerability linking back on the local model and the others on
  the workspace provider.
- **This workspace.** AI on or off, the workspace provider, *Treat as confidential* (every call
  confirmed), *Anonymize before sending*.
- **Help chatbot.** *Let the chatbot use AI*.
- **Providers.** For the Claude API and the local OpenAI-compatible model: the key (stored by the
  helper, mode 600, never in a backup), the local endpoint, the model, and **Test the Claude API** /
  **Test the local model**. A test sends a few tokens and no workspace data, and reports the model, its
  answer and the round-trip time — or the reason it failed: no key, host not reachable (for example
  api.anthropic.com not on your network's allowlist), no local model running or none chosen.

The routes are saved in `crg-config.json` in the feeds folder, and the helper checks them again before
every call: a feature set to the local model cannot reach the Claude API, whatever a page asks for.

### 6.32 Import from the documents, and the Evidence tab

Organization → **Workspaces** → **Import from the documents** pre-fills the rest of the assessment from
the documents of the workspace, with the same approach as the profile: proposals, each tagged FACT,
INFERENCE, ASSUMPTION, EXTERNAL or UNKNOWN with its source, that you review, edit and accept. When you
create a workspace with documents, tick **Then import more from the documents** to land on it directly.

*Already available* lists the four earlier extractions: Profile & appetite (all 18 fields), Crown jewels,
the Context hints (sector, laws and standards, technologies, amounts, CVEs entered as unconfirmed) and
the full text kept with the workspace — now also offered to **Batch scenarios → Propose with AI** with
*Include the text of the context documents*.

*Import more* — tick the targets, choose the **Method** (AI with its preview, or rules only — no AI,
offline — where a rule exists) and click **Start the import**. Each target opens its review: edit,
tick, **Add ticked**.

| Target | Where it goes | Rules | Notes |
|---|---|---|---|
| Information assets | Information assets (owner, type, classification, C/I/A, hosting, vendor/product, dependencies) | yes | feeds Batch step 2, vulnerability linking and the blast radius |
| Business impact (BIA) | the asset's BIA: RTO, RPO, maximum tolerable downtime, impact 0–5, processes | yes (RTO/RPO) | evidence for μ(E), δe, δm |
| Third parties | Information assets of type *Supplier / third party* | yes | supplier scenarios and measures |
| Existing controls | Risk mitigation plan, status *Implemented*, framework references | yes | added with **zero reductions**: set their effect yourself |
| Compliance | the statement of applicability (status, maturity, findings as gaps) | AI | only controls the catalogues know |
| Incidents | Organization → Evidence | yes | evidence for Pb(A), Pb(ψ,A) |
| Vulnerabilities (named weaknesses) | the vulnerability register as *W-…* weaknesses with a CWE | yes | used by Suggest links; linking one adds its text and CWE to the scenario |
| Candidate scenarios | the Batch scenarios grid, marked *[Docs]* | AI | default parameters, Low confidence |
| Parameter evidence | Evidence and Rationale of the scenario parameters | AI | **never** a number |
| Existing risk register | Risk register (owner, ratings, treatment, acceptance to confirm) | AI | |
| Budget | initiatives, and the spend split staff / tools / services (Evidence) | yes (projects) | |
| KRIs | KRI dashboard: the indicator and its first reading | yes | |
| People and roles | Organization → Evidence; *Create user* in multi-user mode | yes | proposed owners, starting RACI |
| Classroom setting | the Classroom tab | yes | |

Routing: the targets that map the organization's systems and exposure — assets and BIA, existing
controls, incidents, weaknesses — form the feature *Import from documents — assets & BIA…*, routed to the
**local model by default**; the others follow the workspace provider (Settings → AI — local & remote).
Nothing is written before *Add ticked*, every created record keeps its tag, source and method, and an
import never moves a score.

**Organization → Evidence** keeps the incidents, the people and roles, the spend breakdown and the
**Import log** (what was proposed and added, by which method and by whom).

### 6.33 Settings → Documents & files

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

### 6.34 Existing safeguards — the inventory of what already protects you (1.5.5)

Two different registers answer two different questions. **Risk mitigation** answers *what should we
add, what would it cost, what would it buy us*. **Existing safeguards** answers *what protects us
today, who owns it, and when was it last shown to work*. Until 1.5.5 the controls found in your
documents were put in the mitigation plan as measures marked implemented, which is why a
recommendation could appear to claim credit for a control you already had.

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

### 6.35 Maturity & resilience (1.5.5)

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

### 6.36 Many AI providers, online or inside the organization (1.5.5)

Settings → AI — local & remote → **Providers** now lists one card per provider, grouped into *off this
machine* and *on this machine*: the Claude API, OpenAI, Google Gemini, Azure OpenAI, GitHub Models,
Ollama, LM Studio, any other local OpenAI-compatible server, and **Add a provider of your own** for an
internal gateway.

For every provider the **endpoint, the model and the key are all editable**, because a published path
or a model name can change after a release and a provider must not become unusable because this build
guessed wrong. *List models* asks the endpoint and is a convenience: where a provider offers no list,
type the name. Azure asks for the three things Azure requires — resource endpoint, deployment name and
`api-version` — which are yours, not ours to guess. Each card has a connection test that sends a few
tokens and no workspace data.

**GitHub Models, not Copilot.** Copilot the IDE assistant has no general API a third-party
application may call, so the provider is GitHub's model-inference API with a GitHub token. A box
labelled Copilot would be a box that cannot work.

**"Remote" means every provider that is not on this machine.** The master switch, the per-feature
routes and the helper's own check all read the provider's own flag, so a provider you add is covered
the day you add it, and a refusal names the provider it is protecting you from.

### 6.37 Varied batch candidates and the seed (1.5.5)

Ticking eight patterns and ten assets used to produce twenty candidates drawn from three patterns —
one threat applied to asset after asset — because the pattern likelihood is identical for every asset
and crown jewels all weigh the same. Candidates are now **spread** across the patterns, assets and
threat sources you ticked, still preferring the more likely combinations: each pick makes its own
pattern and asset less attractive for the next. On the MediBec case the same selection gives **18
distinct patterns in 20 candidates instead of 3**, with the counts tracking the likelihoods rather
than being an equal quota.

The spread is **seeded**, the seed is shown and kept with the workspace, and *Reshuffle* draws a new
one. The same seed reproduces the same candidates, so a set cited in a report can be re-derived.
*Vary the patterns and assets* can be unticked for the strict ranking.

### 6.38 AI-drafted causal chains (1.5.5)

Guideline 4 is the laborious part of the methodology. In the Scenario editor's **Causal chain** card,
**Draft it with AI…** drafts the statement and the eight structured fields from whatever the scenario
already holds — one scenario at a time, because a chain is an argument about this organization and a
batch of eight would get the review a batch gets.

You see the payload before it is sent, as everywhere else, and the request tells the model **not to
contradict** what is already recorded, so a half-written scenario is completed rather than rewritten.
In the review, **empty fields are ticked for you and a field that would replace existing text is left
unticked and says so**, with the current value beside the draft. Edit any draft in place. Nothing is
written until **Apply the ticked fields**, and what you accept goes into the revision log naming the
fields taken. The feature defaults to the local model, because it carries scenario text.

### 6.39 The General section, and the two windows (1.5.6)

The menu opens with **Start** (Process) and then **General**, which holds what you set up once and
come back to rather than work through: **Organization**, **Information assets**, **Maturity &
resilience**, **Publish & share** and **Reset data**, followed by two entries marked with an arrow
that are not screens of the application at all:

| Entry | What opens |
|---|---|
| **Step by step** ↗ | A window of its own with the 12 steps — what each is for, what it needs, when it is done — and the twelve guidelines in detail. Printable, works offline. Clicking a screen name opens that screen in the application window it came from. |
| **User guide** ↗ | This guide, in a window of its own, with a table of contents down the side and a find box. Printable, works offline. |

They are windows rather than tabs so a guide can sit beside the work. Both read what the application
reads — the step window renders the same step and guideline definitions the Process page uses, and the
guide window renders this file — so neither can describe a screen that has since changed. If your
browser blocks pop-up windows, allow them for this application; otherwise the entries open as tabs.

### 6.40 Reset data (1.5.6)

**General → Reset data.** Two audiences, kept apart on purpose.

**Start over** — for whoever is working a teaching case. No administrator is needed: resetting your
own exercise is not an administrative act. It is offered only for a **teaching case**, meaning the
bundled MediBec example or any workspace whose type is a classroom business case, because only a
teaching case has a starting point to go back to:

| The case | Where “start over” goes |
|---|---|
| The bundled MediBec example | The case as shipped with the application — all its scenarios, its profile, its figures. |
| A classroom case imported from a file | The state in that file, recorded the moment it was imported. |
| A classroom case built on this computer | Nowhere, until an instructor records a starting point. |

An instructor records one with **Set the current state as the starting point**, once the case is ready
to hand out, with its documents and whatever scenarios the exercise starts from. Recording it again
replaces it, which moves the starting point for everyone using that copy of the application. **Forget
it** removes the starting point, and with it the student's ability to start the case over.

A real organization is told why the button is not there: the work is the only copy, so the same button
would be a way to destroy it by accident.

**Reset or delete** — for an administrator (in single-user mode, that is whoever uses the computer).
Four depths, each described by what it **keeps**:

| Level | Keeps | Clears |
|---|---|---|
| Reset the assessment, keep the organization | Profile, appetite, crown jewels, documents, information assets, safeguards inventory, maturity assessment, KRI definitions | Scenarios, candidates, measures, recommendations, the risk register, KRI measurements, decisions |
| Keep the context, drop the assessment | As above, minus the KRI definitions | As above, plus the key risk indicators you designed |
| A clean slate, same organization details | Profile, appetite, crown jewels, documents | Everything else — assets, safeguards, maturity, vulnerabilities, threat context, compliance, the whole assessment |
| Remove the organization completely | The workspace and its name | Everything, including the profile, every organizational detail, the appetite, the budget and the documents |

On top of any level: **also clear** the safeguards inventory, the maturity assessment or the threat
snapshot — all three off by default, because they describe the organization rather than the assessment
— and **keep** the example snapshot, framework catalogues and AI settings (which belong to the
installation, not to a workspace), and **keep the stored API keys, which is ticked by default**.
Untick the keys and they are deleted through the helper as part of the reset; the result says how
many went.

Before anything happens the screen lists **what this would remove**, counted from the workspace as it
stands: “30 scenarios · 2 context documents · the maturity and resilience assessment”.

**Confirmation happens in a window of its own.** It repeats what will go and what will be kept and
asks you to type the word — `RESET`, `DELETE` or `START OVER`, in the language of the interface. A
one-line browser box is dismissed by reflex; this is not. In multi-user mode, if an administrator has
set a PIN, that PIN is required as well, so a class can decide that students do not reset
unsupervised. Set one in Settings → Users & RACI.

**Deleting a whole workspace** is unchanged and still lives on Organization → Workspaces, every row
with Open, Export and Delete; Reset data offers it for the workspace you are in. It removes the
workspace, its documents, their extracted text, its threat snapshot and its history from this
browser's storage, permanently — no undo, no trash, so export first. Deleting the last workspace
brings the MediBec teaching example back, so you are never left with none.

**A reset is not a way back.** It removes; it does not restore. To return to a state you know was
right, restore a backup taken earlier: Backup & restore → the file → **Replace everything**, which
says how many workspaces it would delete before you confirm.

Three different places hold what you have, and resetting one does not touch the others:

| Where | What | Survives a workspace reset? |
|---|---|---|
| In the workspace | Profile, documents, assets, safeguards, maturity, vulnerabilities, threat snapshot, scenarios, measures, risks, recommendations, KRI history | Only what the chosen level keeps |
| With the installation | Framework catalogues, the bundled example snapshot, AI settings, interface language, users and rights | Yes, unless you untick “keep” |
| With the helper | The API keys, in `crg-keys.json` in the feeds folder, mode 600 | Yes, unless you untick “keep” |

Every reset is recorded in the workspace and survives even the deepest level: a workspace cannot hide
that it was cleared.

### 6.41 Licence — who may use this (1.5.6)

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

### 6.42 Every API key stored on this computer (1.5.6)

**Settings → Feed sources & keys** ends with one list of every key the helper holds, each with
**Remove**, and **Remove every key**. It includes keys whose feed source or AI provider is no longer
in your configuration, which had no screen at all before. The per-provider *Remove* in Settings → AI —
local & remote and the per-source *Remove* above are unchanged. Reset data can delete all of them in
one step as part of a reset.


---

## 7. Acceptance test (about twenty-five minutes)

1. Footer reads `engine verified · 84,491 / 41,104`.
2. **Scenario register** on the MediBec workspace shows 30 scenarios, total estimated 84,491 and
   residual 41,104.
3. **Risk calculator** → untick S1. The included count becomes 29/30 and the totals drop. Reload the
   page: S1 is still excluded. Tick it again.
4. **Threat context** → **Load the bundled example** (no network needed). Paste:

   ```
   CVE-2026-59310
   CVE-2026-102490
   CVE-1999-0016
   CVE-1999-0001
   ```

   and click **Place on the ladder**. Expect rung 4 for the first two — one citing known ransomware
   use — rung 2 for `CVE-1999-0016` with the age-guard sentence despite an EPSS near 0.96, and
   rung 1 for the last, reading *EPSS below 0.05 (pruned from this snapshot), not in KEV*. Your own
   full snapshot gives the same four answers; the pruning changes no classification.
5. **Threats · ATT&CK** → the matrix shows coloured cells; open T1566 and see the MediBec scenarios
   that use it.
6. **KRI dashboard** → **Record**. The measurement count becomes 1.
7. **Export · Excel** → choose *All scenarios* and regenerate. Open the workbook: Analyse totals read
   84,491 and 41,104; change the appetite on Parameters and watch Analyse recalculate. Choose *Only
   scenarios above tolerance*: the preview reads 12 scenarios.
8. **Organization → Workspaces** → create a blank workspace with two Word or PDF files dropped in
   the form; the workspace opens on Context documents with both listed.
9. **KRI dashboard** → *Only warning or critical*: the gauges show only those indicators.
10. **Vulnerabilities → Online sources** (launcher running) → *Download latest* for KEV; when it is
    done, **Load** it and **Build and use snapshot**.

11. **KRI dashboard** opens with five gauges and the pill *automatic: worst first*.
12. **Risk mitigation → Proposals** → *Untreated above tolerance* → *Add ticked proposals to the plan*.
    The plan shows the measures; *Effect on each scenario* lists the covered scenarios with a lower
    ratio with measures. **Apply** one, check the scenario's red_p / red_i changed, then **Revert**.
13. **Risk register** → *Create from scenarios*: 30 risks and a heat map.
14. **Information assets** → *Create from profile & crown jewels*; open one, set a dependency, then
    **Dependencies & blast radius**.
15. **Publish & share** → anonymized JSON: the preview contains “Organization A” and not “MediBec”.
16. **Settings → Feed sources & keys** (launcher running) → the sources table lists your accepted
    sources; **Threat feeds & social → Sources & downloads** → *Download ticked now* reports each
    source as ok, skipped (no key) or error with the reason.

17. **Frameworks & standards → Control catalogues** → load *COBIT 2019*: 40 objectives appear, and
    *Risk mitigation*'s framework filter now offers COBIT 2019. Load *ITSP.10.171*: 131 identifiers,
    98 in force.
18. **Recommendations → Treatment need** lists every included scenario with a below / at / above
    verdict. Then **Risk mitigation** → tick two measures → **→ Recommendation**; in
    **Recommendations → Register** the draft carries both measures and their scenarios. Move it to
    *in review*, then **approve** it: the gate names anything missing. Fill those, approve, and the
    record shows frozen figures with the date. Change one of its measures afterwards — the live panel
    moves and the frozen figure does not.
19. **Forecasts → Monte Carlo**, with no parameter ranges set, 10,000 trials: the median reads
    **41,104** exactly. Then widen one parameter and re-run: the calculated figure falls inside the
    90% interval. Note the seed, re-run with it: the same median.
20. **Forecasts → KRI projections** → an indicator with fewer than four readings is refused with the
    reason; one with four or more shows a slope, r² and a prediction interval.
21. **Backup & restore** → *Create a backup*: the file downloads and the manifest lists your
    workspaces. Open the app in a second browser profile, restore that file, and the footer there
    reads **84,491 / 41,104** with your workspace, its recommendation and the COBIT catalogue present.
    Back in the first profile, change a workspace, then preview the same file again: that workspace is
    labelled *would lose work* and is unticked.
22. **AI assistant** (key stored) → *Analyst*: the preview card appears **before** any send, naming
    api.anthropic.com and the payload size. Send a question; the answer cites real scenario
    identifiers, and the log records the call. Switch the workspace's AI off: the screen says so and
    offers nothing to send.
23. **Threat feeds → Triage** (after a download) → items are merged into fewer stories, the count of
    merged duplicates is shown, each row states why it is in its bucket, and *not relevant* is still
    openable. **Write the briefing**: it names the organization, the period and the stories, and ends
    with "No risk score has been changed". Then **Export the profile for the scheduled task** and open
    `briefings/triage-profile.json` in the feeds folder: it contains your technologies and CVEs and
    **not** your organization's name, scenario text or asset names.

24. **Existing safeguards** → *Add a safeguard*: name it, set it *in place*, score it 3 on Recover and
    give it an annual run cost. The inventory KPIs show it in force, the run cost, and 1 of 6
    resilience capabilities covered. **Budget** then offers that run cost as the baseline.
25. **Existing safeguards → Resilience coverage** → a θ is proposed and the screen states that it
    proposes rather than changes; the button to put it on a scenario is disabled until you choose one.
26. **Maturity & resilience → Maturity (CSF 2.0)** → 22 categories are listed across the six
    functions. Score them all at 3: the overall reads 3.00 / 5 and *Scenarios this suggests* becomes
    20. **Process** step 5 then reads *about 20 for this organization — measured maturity 3 of 5*.
27. **Maturity & resilience → Resilience (θ)** → answer every question *Yes, demonstrated* with an
    empty inventory: each capability warns that nothing recorded supports it. **The two readings** then
    reads *the questionnaire is more optimistic* and recommends the lower θ.
28. **Settings → AI — local & remote → Providers** → one card per provider, grouped off-machine and
    on-machine, each with an editable endpoint, an editable model and a connection test. Azure asks
    for its `api-version`.
29. **Batch scenarios** → tick every pattern, *Tick crown jewels + 5 most critical*, set 20. The line
    under the button reports the patterns and assets covered and the largest pattern share; generate,
    and the grid holds candidates from many patterns rather than one. *Reshuffle* changes the set and
    the seed; the same seed reproduces it.
30. **Scenario editor → Causal chain → Draft it with AI…** → the preview appears before anything is
    sent. After sending, empty fields are ticked, fields with text are not, and *Apply the ticked
    fields* writes only the ticked ones and logs what you accepted.

31. **General → Step by step** → a separate window opens with 12 steps and 12 guidelines, *Print*
    works, and clicking a screen name brings the application window forward on that screen. **General
    → User guide** → this guide opens with a table of contents; type *crown jewels* in the find box
    and the matches are highlighted and counted.
32. **General → Reset data** on the MediBec example → *Start over* names the starting point as *the
    shipped case*. Add a scenario, then **Start this case over…**: a separate window lists what will
    go, refuses to proceed until you type `START OVER`, and afterwards the register is back to 30
    scenarios with the shipped profile. Press **Cancel** on a second attempt: nothing changes.
33. **Reset data → Reset or delete** → choose each of the four levels and watch *What this would
    remove* change; the three *also clear* boxes start unticked and the two *keep* boxes start
    ticked, with the keys reported as *kept by this reset*. Reset at *keep the organization*: the
    scenarios and measures go, the profile and the information assets stay, and Settings still lists
    your API keys.
34. **Reset data** on a real organization → *Start over* explains why there is no starting point and
    offers no button. Turn on multi-user mode with an administrator PIN, sign in as a student, and
    *Reset or delete* reads **Administrators only**; back on the teaching case, starting over now
    asks for the PIN and refuses a wrong one without closing the question.
35. **About → Licence** → the page names CC BY-NC 4.0, lists what is allowed without asking and what
    needs a commercial licence, states the 30-day evaluation, and gives marcandre@leger.ca. **About →
    Versions** reads `1.5.6 beta` and `engine verified · 84,491 / 41,104`.
36. **Settings → Feed sources & keys** (launcher running) → *Every key stored on this computer* lists
    each key with *Remove*; removing one leaves the others. Switch the interface to **FR**: Reset
    data, the confirmation window, the Licence page and both guide windows are in French.

If all thirty hold, the installation is sound.

---

**1.5.2 additions (five minutes).** (a) *Process* shows 12 steps and the MediBec workspace has
several done. (b) **FR** in the top bar turns the menu and screens French while the MediBec
profile text stays in English; **EN** turns it back. (c) The **?** panel answers “what is the
baseline cost?” from the built-in help without AI. (d) Organization → Profile & appetite: change a
field, the bar says *Unsaved changes*; **Cancel** restores it. (e) Batch scenarios → step 2 lists the
information assets; set *Number of candidates* to 17 and generate: 17 rows appear in the grid.

**1.5.4 additions (ten minutes).** (a) Process: open a guideline — Where, steps and Done when show;
**Print the checklist** shows *Where:* for each step. (b) Create a workspace with documents and **Then
import more from the documents**; run **Start the import** with *Rules only*, add the proposals, and
check Information assets, the register's *W-…* weaknesses and Organization → Evidence. (c) Settings →
Documents & files: replace a document, then delete it. (d) In French, Budget shows amounts as $123,423.
(e) `python3 tools/label_check.py` reports 0 labels not found.

**1.5.3 additions (five minutes).** (a) Settings → AI — local & remote: *Vulnerability ↔ scenario
linking* shows *Local model only* and *this computer*; *Test the Claude API* and *Test the local model*
each report a result. (b) Add two CVEs to the register, one with the product of an information asset;
Vulnerabilities → Suggest links → *Run the rules*: proposals appear with their reasons; accept one and
check the scenario editor shows the CVE. (c) Untick *Allow requests to the Claude API*: with the workspace
provider on the Claude API, the features that follow it become unavailable while vulnerability linking still works on the local model.

## 8. Updating

Replace the folder with the new version and start it with its own launcher on the same port; the
launcher stops any earlier copy still serving that port. Workspaces are untouched by updates. If you edit the app yourself, bump `CACHE`
in `sw.js`.

When `crg_calc.py` changes: update `crg.js` in the mobile repository first, verify it there, then
copy it here. The self-check will catch a mismatch, but only after the fact.

---

## 9. Troubleshooting

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
| Online sources says the helper is not running | The app was not started with its launcher, or an older launcher is serving it. | Close the window, start `start.command` / `start.bat` from the 1.5.1 folder. |
| An NVD download stays slow or keeps retrying | NVD rate-limits requests without an API key, or is busy. | Add a free NVD API key; or choose a shorter date range. The helper retries automatically. |
| A download says *interrupted* | The launcher window was closed before it finished. | **Restart** it from the Downloads list. |
| `CERTIFICATE_VERIFY_FAILED` in a download error | The python.org Python on macOS has no root certificates yet. | Run *Install Certificates.command* in the Python folder, once. |
| Footer still shows an older version after updating | An old server is still running on the port, or the 1.0.0 cache answered first. | Close every old launcher window (or `lsof -ti:8099 \| xargs kill`), start the new `start.command`, then reload once. Section 3.1. |
| Changes to a file have no effect | The service worker is serving its cache. | Bump `CACHE` in `sw.js`, or hard-reload (⇧⌘R / Ctrl-⇧-R). |
| A feed source shows *skipped* | Its API key is not stored. | Settings → Feed sources & keys → API keys. |
| A feed source shows *Refused by the network proxy* or *not resolved* | The domain is blocked by your network or by Claude's egress allowlist (scheduled task). | Settings → Network allowlist → copy the list for the organization owner (Admin settings → Capabilities). |
| Settings say *saved in this browser only* | The helper is not running. | Start the app with its launcher; settings are then written to the feeds folder for the scheduled task. |
| *Publish to the shared registry* writes to the outbox | No synced registry folder set. | Set *Local folder synced with the registry* in Settings, or let the scheduled task upload the outbox. |
| A scenario's ratio did not change after adding measures | The measures are not applied yet, or they reduce only likelihood or only impact. | Risk mitigation → Apply; add a measure for the other dimension. |
| A navigation section seems to have lost its screens | The section is collapsed. | Click its title; the number beside it is how many screens it holds. The state is remembered. |
| AI assistant says no provider is configured | No key stored, or no local endpoint set. | Settings → AI providers. For a local model, give the base URL including `/v1`. |
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
| Process step 4 will not go green | It has two halves: a snapshot **and** at least one entry in the vulnerability register. The step now names both and offers the screen for each. | Threat context → **Load the bundled example** (no network); Vulnerabilities → **Add a weakness without a CVE** if you have no scanner output. |
| *EPSS below 0.05 (pruned from this snapshot)* on a CVE you care about | The bundled example's EPSS table is pruned at the ladder's rung-1 ceiling, so a negligible score is absent rather than stored. The classification is the same either way. | Nothing to fix. For the exact score, load your own snapshot from `threat_snapshot.py`, or build one in the app from a KEV file and an EPSS file you downloaded. |
| The example snapshot is dated and will expire | It is a fixed build date, and snapshots expire 90 days after retrieval. | Download your own sources before relying on any figure; the screen and the age indicator both say so. |
| Red `engine DIVERGES` banner | Engine disagrees with the reference totals. | Stop. Restore a clean copy. |

To see an underlying error, open the developer console — **⌥⌘I** on macOS, **F12** on Windows and
Linux — and read the **Console** tab.

---

## 10. What this tool does not do

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

The decision to accept, transfer, avoid or mitigate a risk remains with management.
