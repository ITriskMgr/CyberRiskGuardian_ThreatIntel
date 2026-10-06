# Changelog — CyberRiskGuardian Desktop (with Threat Live-feed)

## 1.5.6 Beta — 6 October 2026

**Proof of concept.** `crg.js`, `cvss4.js`, `sample.js` and `threat.js` are unchanged; the start-up
self-check still requires **84,491 / 41,104**. Workspaces from 1.1–1.5.5 open as they are.

### Added
- **A General section in the menu.** Organization, Information assets, Maturity & resilience,
  Publish & share and the new Reset data are together in one section, with two entries that leave the
  application and open in a window of their own: **Step by step** and **User guide**. Both are
  printable, both work offline, and both read what the application itself reads — the step-by-step
  window renders the same `STEPS` and guideline definitions the Process page uses, and the guide
  window renders the shipped `USER-GUIDE.md` — so neither can drift from the screens it describes.
  - Opening a guide beside the work is the point: the windows are real windows, not tabs, and a
    screen name in the step-by-step window opens that screen in the application window it came from.
  - The guidelines moved out of `js/panels/process.js` into `js/guidelines.js`, where they are data
    with no imports, so a page that is not the application can read them. `tools/label_check.py`
    checks them there now.

- **Reset data** (General → Reset data), which answers two different needs without confusing them.
  - **Start over** is for someone working a teaching case, and needs no administrator: resetting your
    own exercise is not an administrative act. It is offered only for a teaching case — the bundled
    MediBec example or any workspace whose type is a classroom business case — because only a
    teaching case has a starting point to go back to. The bundled example rebuilds from the case
    shipped with the application; a classroom case uses the baseline recorded when it was imported,
    or the one an instructor sets with *Set the current state as the starting point*. A real
    organization is told plainly why the button is not there.
  - **Reset or delete** is for an administrator and offers four depths, written as what each one
    *keeps*: reset the assessment and keep the organization · keep the context and drop the
    assessment · a clean slate with the same organization details · remove the organization
    completely. Before anything happens the screen lists what would go, counted from the workspace as
    it stands — “30 scenarios, 2 context documents, the maturity and resilience assessment”.
  - On top of any depth: *also clear* the safeguards inventory, the maturity assessment or the threat
    snapshot (all off by default, because they describe the organization rather than the assessment),
    and *keep* the example snapshot, framework catalogues and AI settings, and **keep the stored API
    keys — ticked by default**. Unticking the keys deletes them through the helper as part of the
    reset, and the result says how many went.
  - **Confirmation happens in a window of its own**, with what will be removed, what will be kept,
    and the word typed out — `RESET`, `DELETE`, `START OVER`, in the language of the interface. A
    one-line `confirm()` box is dismissed by reflex; this cannot be. In multi-user mode, if an
    administrator has a PIN, that PIN is required, so a class can decide that students do not reset
    unsupervised.
  - Deleting a whole workspace is unchanged and still lives on Organization → Workspaces, row by row
    with Open, Export and Delete; Reset data offers it for the workspace you are in and says what it
    means. Deleting the last workspace still brings the MediBec example back, so you are never left
    with none.
  - A reset is not a way back. The screen says so and points at Backup & restore → *Replace
    everything* for returning to a state you know was right.
  - Every reset is recorded in the workspace (`resetLog`), which survives even the deepest level: a
    workspace should not be able to hide that it was cleared.

- **Licence page** (About → Licence). What CC BY-NC 4.0 permits, and then the thing people actually
  need to know: who may use this without asking — students for their own coursework, personal use,
  non-profits and NGOs, your own research and teaching materials, and evaluation for up to 30 days —
  and whose situation needs a commercial licence: colleges and universities as institutions,
  government departments and agencies, Crown corporations and other public enterprises, businesses of
  any size including consultancies using it for client work, and anything embedded in a product or a
  paid service. With how to reach the author, and a note that a formal price list will follow because
  the project is still in development.

- **One list of every API key stored on this computer** (Settings → Feed sources & keys), each
  removable, including keys whose source or provider is no longer in the configuration and which had
  no screen at all before. The per-provider and per-source *Remove* buttons are unchanged.

- **The package ships with nobody else's folders.** Until 1.5.5 the author's own Google Drive feeds
  and registry folders, and his controls spreadsheet, were the built-in defaults, so every copy handed
  to anyone pointed at them. They now ship empty. Settings → Links & shared folders gained a **Your
  own folders** card that says what each one is for, which are still unset, and that none of them is
  required; an empty field shows the shape expected rather than someone else's address. Publish &
  share offers *Set a shared registry folder…* instead of an anchor with an empty address, and the
  scheduled-task prompt tells the task to **skip the upload and say so** rather than printing a
  sentence with no address in it. The public endpoints — KEV, EPSS, NVD, the ATT&CK Navigator, the
  repository — keep their defaults, because they are not personal.
  - The same applies to `feeds-dir.txt`: it is not in the distributed package, so a recipient gets
    `~/Downloads/CyberRiskGuardian-feeds` on their own machine. `INSTALL.md` section 5 explains how to
    move it, and warns about a `feeds-dir.txt` that came from someone else's computer.

- **`INSTALL.md`, in English and in French.** Installation on one page: what you need, unpacking,
  starting it on each system, why it must be served over `http://`, why the port matters, the engine
  check with the exact footer in both languages, installing it as a desktop application, upgrading
  from an earlier 1.5.x, **how to set up your own file locations** (the feeds folder, and the shared
  folders if you share), seven things that can go wrong, and a table of where your workspaces,
  catalogues, API keys and downloads actually live. Also as a print-ready PDF,
  `INSTALL-Windows-macOS-EN-FR.pdf`, with Windows and macOS side by side. The user guide and the
  README point at it.

### Changed
- **One version, everywhere.** The version lived in seven files and drifted: About announced 1.5.4
  while the helper, the offline cache and the package were 1.5.5. It now comes from `js/version.js`,
  every module imports it, and `tools/version_check.py` fails the build when `index.html`, `sw.js` or
  `serve.py` disagree. Version-bearing interface strings use one catalogue entry with `#` for the
  number instead of a new entry per release.
- **About has three pages** — About, Licence, Versions — and the Versions page carries the engine
  check and what this release added.
- Starting points travel with backups. A backup that includes document text now carries the baseline
  of each teaching case, so a restored classroom case is still resettable; a full replacement and a
  workspace deletion both take the baseline with them.

### Fixed
- **A teaching reset of the workspace you were in was written straight back over.** `select()` saves
  what is in memory before loading what you asked for, so restoring the open workspace put the stale
  copy back on top of the restored record — the reset appeared to work and nothing changed. The
  regression now has a test of its own.
- **The French coverage tool read version numbers differently from the application.** It normalised
  `1.5.6` as two numbers where the runtime reads one, so catalogue entries that work on screen were
  reported missing. It now uses the runtime's own rule.
- **The translation gate did not see the new windows.** `tools/i18n_coverage.py` read `index.html`
  and the modules only; it now also reads the pages in `help/`, markup and inline script, so a window
  cannot ship untranslated. Labels built by gluing a value onto a sentence (`'Done when: ' + text`)
  were split into separate nodes, which is what makes them translatable at all.
- French is complete again: 5,360 catalogue entries, 5,195 / 5,195 interface strings.

## 1.5.5 Beta — 6 October 2026

**Proof of concept.** `crg.js`, `cvss4.js`, `sample.js` and `threat.js` are unchanged; the start-up
self-check still requires **84,491 / 41,104**. Workspaces from 1.1–1.5.4 open as they are.

### Added
- **Many AI providers, online or inside the organization.** A provider is now a row in a registry
  rather than a branch in the code, so three wire protocols cover the lot: Anthropic messages, the
  OpenAI-compatible `/chat/completions` that most of the industry now speaks, and Azure OpenAI's
  deployment URLs. Shipped: **Claude API**, **OpenAI**, **Google Gemini** (through Google's own
  OpenAI-compatible endpoint, so there is one protocol to maintain instead of two), **Azure OpenAI**,
  **GitHub Models**, **Ollama**, **LM Studio** and **any other local OpenAI-compatible server**
  (oMLX, llama.cpp, vLLM). *Add a provider of your own* takes an id, a name, an endpoint, a protocol
  and whether it stays on this machine — enough for an internal gateway without waiting for a release.
  - **GitHub Models, not "Copilot".** Copilot the IDE assistant has no general API a third-party
    application may call, so a box labelled Copilot would be a box that cannot work. The provider is
    GitHub's model-inference API with a GitHub token, and the screen says so.
  - **The endpoint, the model and the key are always editable, for every provider.** A published path
    or a model name can change after a release, and a provider must not become unusable because this
    build guessed wrong. *List models* asks the endpoint and is a convenience: when a provider offers
    no list, the screen says so and the name can simply be typed.
  - Azure asks for the three things Azure requires — resource endpoint, deployment name and
    `api-version` — because those are the analyst's, not ours to guess.
  - One provider card each, grouped into **off this machine** and **on this machine**, with the key
    stored by the helper (`crg-keys.json`, mode 600), a connection test of a few tokens and no
    workspace data, and a link to where each provider issues keys.

- **AI drafts the causal chain, you accept it field by field** (Scenario editor → Causal chain →
  *Draft it with AI…*). Guideline 4 is the laborious part of the methodology — a statement plus eight
  structured fields, for every scenario — and this drafts them from whatever the scenario already
  holds. Deliberately **one scenario at a time**: a chain is an argument about a specific
  organization, and a batch of eight would get the review a batch gets rather than the review an
  argument needs.
  - The payload is previewed, byte for byte, like every other AI action, and the request carries the
    fields already filled with an instruction **not to contradict them** — so running it on a
    half-written scenario completes it instead of rewriting your work.
  - The review shows every proposed field beside what the scenario holds now. **Empty fields are
    ticked for you; a field that would replace existing text is left unticked and says so**, with the
    current value shown. Each draft is editable in place before it is applied, consequences are
    offered per category, and new ATT&CK techniques are offered separately.
  - Nothing is written until *Apply the ticked fields*, and what you accept is recorded in the
    revision log, naming the fields taken.
  - It has its own row in the routing policy, **defaulting to the local model** because it carries
    scenario text, and it refuses to run without a scenario open.
- **Guideline 3 now says what ten means.** "Ten most material" gains: *ten is the recommended
  starting number, not a ceiling — carry more as cybersecurity maturity grows and the organization can
  keep more scenarios current.* Process step 5 and Batch scenarios both show the number derived from
  the maturity actually measured, with its reason, instead of repeating a generic ten; before any
  assessment they say so and still give the methodology's starting point.

- **Process step 4 can be completed, including with no network at all.** It was the only step that
  was *structurally* unreachable, for four separate reasons, all now fixed.
  - **The example snapshot the guide has named since 1.5.1 now ships.**
    `examples/threat-context/threat-context-example.json` — about 1.5 MB — with a *Load the bundled
    example* button beside the file picker. It is built from the project's own
    `threat-context-shipped.json`, generated by `threat_snapshot.py`, and carries the **full CISA KEV
    catalogue of its build date (1,733 entries), 38,533 EPSS scores, the Threat Evidence Ladder, the
    thresholds and the constraints**.
    That is enough to place CVEs on the ladder, run the exposure join and finish step 4 on a machine
    behind an egress allowlist, where every previous route — the download helper, a KEV plus an EPSS
    file fetched by hand, `threat_snapshot.py` — needed the internet.
  - **A pruned EPSS table is bundled, by an explicit decision of the author**, which
    `examples/threat-context/README.md` reserves to him and `NOTICE.md` now records: earlier releases
    fetched every score at run time. 38,533 of the snapshot's 147,271 scores ship.
  - **The prune is lossless for classification, and that is checked rather than claimed.** The rule is
    *keep a score at or above the ladder's own rung-1 ceiling (0.05), or a score whose percentile
    reaches the rung-4 percentile (0.90), or any CVE listed in KEV.* The middle clause matters: **7,585
    CVEs score below 0.05 yet carry a percentile above 0.90**, and a naive prune at 0.05 would have
    demoted every one of them from rung 4 to rung 1. Everything dropped would have been rung 1 by its
    score, and an absent CVE reads rung 1 with the honest reason *"EPSS below 0.05 (pruned from this
    snapshot)"*. All **147,274** CVEs classify identically under the pruned and unpruned tables, and
    the test that proves it runs in the suite.
  - **It announces itself.** The snapshot carries an `example` block, and the screen states on every
    visit that this is an example and not current threat intelligence, with its build date and where
    it came from. It cannot be mistaken for a download.
  - **A step now shows which half is missing.** Step 4 needs a snapshot **and** one entry in the
    vulnerability register; before this it showed the same opaque *To do* whether you had neither or
    one of the two, and its tips mentioned only the snapshot. Steps with several requirements now list
    them as named parts, each ticked or not, each with its hint and a button to the screen that fixes
    it — step 4, and also steps 1 and 7, which sat at *partial* with no explanation.
  - **A weakness needs no CVE.** The register half asks for an entry, not for confirmed exposure, and
    an organization with no scanner output still knows things. Vulnerabilities → *Add a weakness
    without a CVE* records one as `W-001`. Confirmed exposure remains required before any score
    moves — that is the C4 gate, and it is unchanged.

- **Maturity & resilience** (new screen) — two instruments, deliberately kept apart because they
  answer different questions.
  - **Maturity** is scored against **NIST CSF 2.0**: six functions and the 22 categories underneath
    them, *read from the bundled publisher content* rather than typed from memory, so importing a
    newer edition in Frameworks & standards changes the list instead of contradicting it. Each
    category takes a level 0–5 against a target, with evidence, and rolls up by function. An
    **unscored category is left out of the average, never counted as zero**, so a partial assessment
    stays honest. Where the inventory of existing safeguards points at a CSF category, a level can be
    proposed — and a proposal **never exceeds 3**, because an inventory can show that something is
    being done but not whether it is defined, managed or improving.
  - **Resilience** is answered as **eighteen questions**, three for each of the six capabilities
    θ(ψ,A) is defined as. They ask what the organization can *demonstrate* rather than what it owns —
    "we have backups" is not an answer to whether it can recover. **Unknown is a real answer**,
    recorded as an information gap and excluded from the score rather than counted as a zero nobody
    verified. Each capability shows what the inventory holds beside it, and warns when a capability is
    answered well with nothing recorded to support it.
  - **Two readings, named rather than averaged.** The questionnaire records what people say the
    organization can do; the inventory records what is written down as in force. Both propose a θ, and
    the screen shows the gap with a verdict: *they agree*, *the questionnaire is more optimistic*
    (somebody believes in a capability nothing recorded supports) or *the inventory is more optimistic*
    (controls are recorded that the people answering do not credit). Averaging them would hide the one
    thing worth knowing. The **lower** reading is offered by default, because resilience claimed
    without evidence is the more expensive mistake — and it is offered, not applied: putting a θ on a
    scenario writes the rationale and a revision-log entry.
  - **Dated history** with a trend of both instruments on one axis, the change since the previous
    assessment, and how much was actually assessed each time. Recording twice in a day replaces the
    entry rather than adding a second.
  - **How many scenarios to carry** now comes from the measured level instead of a generic ten: ≥ 0 →
    10, ≥ 2 → 15, ≥ 3 → 20, ≥ 3.5 → 30, each with its reason stated. Below 2 the constraint is not
    analysis but the capacity to act on it.
- **Two computed KRIs**: *CSF 2.0 maturity against target* (CRG-15) and *resilience capabilities
  covered by a safeguard in force* (CRG-16), both null until assessed — an unassessed organization is
  not a zero. Both read through the models, so there is one definition of each rather than a second
  copy in the KRI module.

- **Existing safeguards** (new screen) — the inventory of what already protects the organization:
  **technical measures, business processes, internal controls, awareness programmes, policies and
  roles, physical and environmental measures, contractual and insurance measures, and personnel
  measures**. Per entry: an accountable owner, the state (in place, partly in place, planned,
  retired), the scope *and what it does not cover*, the assets and scenarios it covers, the framework
  controls it implements, the annual cost of keeping it running, what it depends on, and when it was
  last tested, audited or reviewed with the result. A test older than twelve months is reported as
  stale, and an entry never tested is reported as an assumption, because that is what it is.
  - **This is not the mitigation plan, and that distinction is the point.** Risk mitigation answers
    "what should we add, what would it cost, what would it buy us"; this register answers "what
    protects us today, who owns it, and when was it last shown to work". Conflating them gives a
    treatment portfolio padded with things already in place and a resilience estimate with nothing
    behind it.
  - **θ can now be argued instead of guessed.** Each safeguard is scored 0–3 against the six
    capabilities θ(ψ,A) is *defined* as in the methodology — prevent, detect, contain, respond,
    recover, maintain critical operations. The Resilience coverage tab shows where the resilience
    comes from and **proposes** a θ, for the whole inventory or for one scenario, with the rationale
    written for you. It proposes and never applies: you put it on a scenario yourself, and the
    Scenario editor records the change in the revision log. A capability takes its **strongest**
    contributor, never the sum — three partial backups are not a recovery capability — a *planned*
    safeguard contributes nothing, and a partly-implemented one contributes less than a fully
    operating one.
  - **The budget baseline comes from evidence.** The annual run cost of what is in force is offered as
    the baseline in Budget, with a note that staff and overheads the inventory does not carry still
    have to be added. Offered, never applied.
- **Bringing existing controls over.** A tab lists the measures in the mitigation plan that are marked
  implemented and missing from the inventory, says why each one is there, and moves the ticked ones.
  Nothing moves on its own, and the measure is left in the plan — an implemented measure contributes
  nothing to a recommendation, so leaving it is harmless.

- **Varied batch candidates.** Ticking eight threat patterns and ten assets produced twenty
  candidates drawn from **three** patterns — "credential phishing × asset 1, credential phishing ×
  asset 2…" — because the pattern prior is identical for every asset, crown jewels all weigh exactly
  1.0, and the ranked list was therefore one column of the grid. Candidates are now **spread** across
  the patterns, assets and threat sources that were ticked, still preferring the more likely
  combinations: each pick makes its own pattern and asset less attractive for the next, so the set
  walks across the grid instead of down one column. On the MediBec case the same selection now gives
  **18 distinct patterns in 20 candidates instead of 3**, with the counts tracking the pattern
  likelihoods (5 / 4 / 3 / 2 / 2 / 2 / 1 / 1 across eight patterns) rather than being an equal quota —
  variety is a preference, not a rule, and a pattern genuinely more likely still earns more slots.
  The screen states what the set covers before you generate it. *Vary the patterns and assets* can be
  unticked to get the strict ranking back.
- **A seed, not a coin toss.** The spread is seeded, the seed is shown, and it is kept with the
  workspace, so the same seed reproduces the same candidates exactly and a set cited in a report can
  be re-derived. *Reshuffle* draws a new seed as a deliberate act — the same discipline Forecasts uses
  for its Monte Carlo runs. The jitter is derived from each combination's own identity rather than
  from a sequence of draws, so ticking the patterns in a different order gives the same answer.

### Changed
- **"Import from the documents" now sends existing controls to the inventory, not to the treatment
  plan.** They used to arrive as measures marked implemented with zero reductions, which is how the
  two registers came to be confused. A control whose stated maturity is below 3 is recorded as *partly
  in place* rather than claimed as fully operating, its resilience contribution is seeded from its
  stated function and marked for review, and its note says what still needs checking — the documents
  say a control exists, they rarely say it covers everything.
- **"Remote" now means every provider that is not on this machine, not the Claude API alone.** The
  master switch, the per-feature routes and the helper's own check all read the provider's `local`
  flag, so a provider added to the registry — or by the analyst — is covered the day it appears
  rather than the day someone remembers to extend a comparison. The refusal messages name the
  provider they are protecting you from.
- No page compares a provider id with `claude` or `local` any more: `js/ai.js` answers
  `isLocal`, `where`, `host` and `kindOf`, and the destination shown on every screen is derived from
  the endpoint actually configured. A custom provider therefore gets honest labels for free.
- A workspace naming a provider this installation no longer offers (a custom one was removed, a
  backup came from another machine) falls back to an available provider instead of failing every call
  with "unknown provider".
- Web search stays a Claude-API capability and is now refused by name on other providers, rather than
  being silently dropped.
- `tools/i18n_coverage.py` no longer counts a loose `{0}` pattern as a translation when the text it
  swallowed is itself English prose.

### Fixed
- **The user guide and the acceptance test pointed at a file the package did not contain.** Since
  1.5.1 both named `examples/threat-context/threat-context-shipped.json`; there was no `examples/`
  folder in the desktop package at all. The guide now distinguishes the bundled example from your own
  full snapshot and states what each one can and cannot tell you, and acceptance-test step 4 expects
  what the bundled example actually produces.
- **A stored object that was replaced on every read.** `state()` for the maturity assessment was
  written as `ws.maturity = Object.assign({defaults}, ws.maturity)`, which hands back a *new* object
  each call — so a reference taken a moment earlier wrote to a discarded copy. It silently lost every
  recorded assessment, because `record()` captured the object and then called two helpers that
  replaced it. It now creates once and fills in place, and a test asserts that two calls return the
  same object.
- **A button that did nothing.** `fromMeasure` built an inventory entry from a measure and returned
  it without storing it, so *Bring the ticked ones into the inventory* silently did nothing. The unit
  test had checked the mapping of the returned object and never that the inventory grew, which is
  exactly the gap that let it through; there is now an `adoptMeasure` that stores, and a test that
  the list grows and the ids keep incrementing.
- **A tab label stopped being translated when its count was zero.** `Bring controls over{0}` with an
  empty placeholder matches no catalogue entry, so the label fell back to English. It is now two
  plain strings rather than one template with an empty hole.
- **French coverage was reported as 100% while screens showed half-translated text.** `"Add {0}"`
  matched `"Add a provider of your own"`, so the catalogue looked complete and the screen read
  *"Ajouter a provider of your own"*. With the stricter check, **eight strings shipped in 1.5.4 were
  being rendered this way** — in Users and rights, Import from the documents, the AI assistant, the
  Process page and Documents & files — and all eight are now translated.

### Verified for this release
- Self-check 84,491 / 41,104; all **28** routes render with no console error.
- 31 unit tests on the candidate spread, starting with a **reproduction of the defect**: the released
  ranking puts 20 candidates into 2 patterns with one of them taking half the list. Then: every
  pattern and every asset represented; the count per pattern never rising as its prior falls; a
  pattern 50× more likely keeping every slot while distinct assets remain, and the weaker one taking
  the rest once they run out; the same seed reproducing a set exactly and a different seed not; the
  answer independent of the order the patterns were ticked in; threat sources spread as well as
  patterns and assets; a zero penalty reproducing the old rank-only behaviour; and the empty, single
  and over-large cases.
- 13 interface checks on Batch scenarios, and a side-by-side run on the MediBec case: 3 distinct
  patterns in the 20 candidates before, 18 after, with no pattern taking more than 2 slots. The seed
  survives a reload.
- 56 unit tests on the safeguards inventory: planned and retired safeguards contributing nothing; a
  partly-implemented one contributing less; a capability taking its strongest contributor so that
  three partial backups do not become a recovery capability; θ floored at 0.10 for an empty inventory
  and capped at 0.90 for a complete one, never 0 and never 1; θ for one scenario narrower than for the
  whole inventory; the run cost counting only what is in force; a test two years old reported as
  stale and an unreadable date treated as untested; and the mapping of a measure brought over,
  including a measure already in the inventory not being offered twice.
- 21 interface checks on the new screen, including that the θ button is disabled until a scenario is
  chosen, that the screen says in words that it proposes rather than changes, and that a control
  brought over lands in the inventory while the measure stays in the plan.
- 62 unit tests on maturity and resilience: the 22 CSF 2.0 categories and their titles read from the
  bundle rather than hard-coded; one category scored giving that category's mean and not a mean over
  22; gaps ordered worst-first; an *unknown* answer counted and excluded while an answered *no* scores
  zero; a θ proposed from the questionnaire alone staying inside the band; each of the three verdicts
  when the two readings disagree, in both directions; the scenario anchors never falling as maturity
  rises; a proposal from the inventory capped at 3 and a single untested safeguard proposing only 1;
  and a history that replaces same-day entries and stays in date order.
- 34 interface checks on the new screen, and 4 on the two new KRIs, including that both read null for
  an unassessed organization and that the comparison tab offers no way to record (it only reads).
- 24 interface checks on the causal-chain draft and the scenario-count guidance, end to end against a
  mock model: the preview appearing before anything is sent and carrying "Do not contradict"; the
  review ticking 7 of 38 boxes because only seven fields were empty; applying filling the empty
  fields while **leaving the populated statement untouched**; the revision log naming the fields
  accepted; and step 5 reading "about 30 for this organization — measured maturity 3.6 of 5" once the
  maturity was scored, and the starting number before it.
- The build-time label check now verifies **189** quoted labels against the application (up from 183),
  including the new ones the guidelines name.
- 22 unit tests on the bundled example snapshot and the ladder against it: the example declaring
  itself an example, KEV complete at 1,733 entries, the pruned EPSS table and its stated rule,
  `epss_pruned_below` matching the prune, the two KEV CVEs reaching rung 4 (one citing ransomware
  use), `CVE-1999-0016` reaching rung 2 **with the age-guard sentence** despite an EPSS of 0.957, and
  `CVE-1999-0001` reading rung 1 *"EPSS below 0.05 (pruned from this snapshot)"* — the four answers the
  user guide has documented since 1.5.1. Plus the equivalence test over all 147,274 CVEs, and the C4
  exposure gate still refusing without confirmation.
- 24 interface checks on step 4, start to finish on a clean workspace: the step naming both halves
  with a button for each, the offline banner, the example loading in one click and announcing itself,
  the ladder classifying with no network, a weakness with no CVE landing as `W-001`, and the step
  then reading **Done** both on screen and in the model.
- The helper against mock endpoints for all three protocols: the OpenAI-compatible path, the Anthropic
  path, and Azure refusing in turn until its endpoint, deployment, `api-version` and key are all
  present. A provider that rejects `max_tokens` and asks for `max_completion_tokens` is retried once
  on that one complaint.
- A custom provider added through the configuration reaches the model list, the completion and the
  connection test; a malformed id and an id that would shadow a shipped provider are both ignored
  rather than accepted.
- The routing policy, generalized: a remote provider refused for a local-only feature and named in the
  refusal; the master switch blocking every remote provider including a custom one while the local
  ones keep working; web search refused on a provider that cannot run it.
- 17 interface checks: every shipped provider has a card, the workspace list offers all of them, the
  groups are separated, Azure asks for its `api-version`, and the model field is typeable.
- French: **4,882 / 4,882** interface strings at the close of the release, checked on every new screen
  with no English fragment left on any of them.
- Offline: with the network cut, the service worker (`crg-desktop-1.5.5`, 96 files) serves the app, the
  self-check still reads 84,491 / 41,104, all 28 screens remain reachable, **and the bundled example
  snapshot loads** — 1,733 KEV entries and 38,533 EPSS scores, with no network at all.
- Static gates at the close: 76 modules parse, 189 quoted labels found in the application, French at
  100%, helper 1.5.5, cache `crg-desktop-1.5.5`, and no API key anywhere in the build.
- Every suite re-run together on the packaged build: 31 variety · 56 safeguards · 62 maturity ·
  22 ladder · 147,274-CVE equivalence · 4 KRI · 17 providers · 13 batch · 21 safeguards UI ·
  34 maturity UI · 24 causal chain · 24 step 4.

## 1.5.4 Beta — 5 October 2026

**Proof of concept.** For teaching, exploration and method validation; validate every result before it
supports a real decision. `crg.js`, `cvss4.js`, `sample.js` and `threat.js` are unchanged; the start-up
self-check still requires **84,491 / 41,104**. Workspaces and backups from earlier versions open as
they are.

### Added
- **Guidelines in detail** — each of the 11 guidelines now says where it happens, the steps with the
  exact labels of the screens, and when it is done. One source (the Process page) feeds the user guide
  (*Guidelines in detail*), the help chatbot and the printable checklist, which now shows *Where:* for
  every step and guideline. **Label check at build time:** `tools/label_check.py` verifies that every
  label quoted by the guidelines and the guide exists in the application (183 labels, 0 missing).
- **Import from the documents** (Organization → Workspaces, and *Then import more from the documents*
  when creating a workspace) — fourteen more targets pre-filled from the context documents with the
  same propose → review → accept approach and the same tags: information assets, business impact (BIA),
  third parties, existing controls → mitigation plan (implemented, zero reductions), compliance,
  incidents, vulnerabilities as named weaknesses (W-…, with a CWE), candidate scenarios ([Docs] in the
  Batch grid), parameter evidence (evidence and rationale, never a number), existing risk register,
  budget (initiatives and spend split), KRIs (with a first reading), people and roles, classroom
  setting. AI for all, rules (no AI, offline) for ten. The targets that map systems and exposure use a
  new AI feature routed to the **local model by default**; the helper enforces it. An import never
  moves a score; every record keeps its tag, source and method; an import log records each run.
- **Organization → Evidence** — incidents, people and roles (*Create user* in multi-user mode), the
  spend breakdown and the import log.
- **Batch scenarios → Propose with AI** can include the full text of the context documents.
- **Settings → Documents & files** — the administrator's view of every document of every workspace:
  rename, recategorize, **Replace…** with a new version (text read again, previous text kept), open,
  delete one or several, remove unreferenced text.
- **Menu access by user group and user account** (Settings → Users & RACI, multi-user mode) — groups,
  membership, and per menu *Default (RACI)*, *Full*, *View only* or *Hidden*, for a group or a user.
  A user's own setting wins; between groups the most permissive applies; approvals still need RACI A;
  Settings and Backup stay administrator-only. Exportable as CSV.

### Changed
- **Amounts use one format in every language and on every screen** — the English one, $123,423
  (French screens no longer show 123 423 $).
- Vulnerability linking also proposes the named weaknesses; linking one adds its text and CWE to the
  scenario.

### Resolved from 1.5.3
- French interface reviewed by a native speaker: accepted as is.
- Provider test buttons confirmed against the real Claude API and local model.

## 1.5.3 Beta — 5 October 2026

**Proof of concept.** For teaching, exploration and method validation; validate every result before it
supports a real decision. `crg.js`, `cvss4.js`, `sample.js` and `threat.js` are unchanged; the start-up
self-check still requires **84,491 / 41,104**. Workspaces and backups from earlier versions open as
they are.

### Added
- **Suggest links between vulnerabilities and scenarios** — Vulnerabilities → *Suggest links*, or
  *Suggest vulnerabilities for this scenario…* in the scenario editor.
  - **Stage 1 — rules, on this computer, no AI.** A register CVE is proposed for a scenario when the
    scenario's inventory asset lists it, when the CVE's asset or product names one of the scenario's
    assets, when it carries a weakness (CWE) the scenario carries, when its weakness is exploited by
    one of the scenario's ATT&CK techniques (through CAPEC), or when its product is named in the
    scenario. A CWE is proposed for a scenario that has techniques but no weakness.
    **Exposure proposals** mark register CVEs that an inventory asset lists or runs.
  - **Stage 2 — AI.** Reads the causal chains and the register and proposes further links with a
    reason and a confidence, plus doubts about rule-proposed links and the scenarios no vulnerability
    supports. **Local model by default**, because the payload is the organization's vulnerability
    list; it can be routed to the Claude API in Settings. Identifiers the register does not hold, and
    unknown scenarios, are dropped and counted.
  - One review list for both: filter, *Tick high confidence*, *Accept ticked*, *Reject ticked*
    (a rejected proposal is not proposed again), the gaps (scenarios without evidence, CVEs no
    scenario uses), and a log of every decision with method, confidence and person. A link never
    changes a score: Pb(ψ,A) still moves only for exposed CVEs, through the ladder proposals of
    Threat context.
- **Settings → AI — local & remote** — one place for everything that decides what may leave this
  computer: a master switch for the Claude API, a switch for web search, the **route of each AI
  feature** (workspace provider, local model only, Claude API, off) with its sensitivity and where it
  goes for the current workspace, this workspace's AI settings (on/off, provider, confidential,
  anonymize), the help chatbot's AI answers, and the providers. The routes are saved in
  `crg-config.json` and **enforced by the local helper**: a feature set to the local model cannot reach
  api.anthropic.com, whatever a page asks for.
- **Test buttons for the AI providers** — *Test the Claude API* and *Test the local model* send a few
  tokens, no workspace data, and report the model, the answer and the round-trip time, or the error
  (missing key, unreachable host, no model chosen).
- Process page, step 5: *Suggest vulnerability links*.

### Changed
- Settings tabs: *Language* (was Language & chatbot) and *AI — local & remote* (was AI providers);
  the chatbot and workspace AI switches moved to the AI page.
- The AI preview names the destination chosen by the route of the feature, not only the workspace
  provider; the decision log records it.
- French catalogue extended to the new screens (4,100+ entries, 100 % of the interface strings found).

## 1.5.2 Beta — 5 October 2026

**Proof of concept.** This beta is for teaching, exploration and method validation; validate every
result before it supports a real decision. `crg.js`, `cvss4.js`, `sample.js` and `threat.js` are
unchanged; the start-up self-check still requires **84,491 / 41,104**. Workspaces and backups from
earlier versions open as they are.

### Added
- **Process page** (new, first in the navigation) — the 12 steps of a complete risk assessment, the
  status of each in this workspace, the next recommended step, what each step needs and when it is
  done, buttons that open the right screens, tips, 11 guidelines and a printable checklist.
- **French interface** — every screen in English or French, switched with the **EN / FR** buttons in
  the top bar or in Settings → Language & chatbot. Only the interface changes: organization data,
  case documents, scenarios and AI answers stay in their original language. Numbers, percentages and
  amounts follow the language (12,3 %; 1 234 $). Built for more languages: one catalogue file per
  language in `js/i18n/`, one line in the language list; `tools/i18n_coverage.py` reports what a
  catalogue misses (French: 3,800+ strings, 100 % of the interface strings found).
- **Help chatbot** — the **?** button on every screen. Help-only by default: it answers from the
  built-in help (a tip per screen, the 12 steps, frequent questions) and the user guide, on this
  computer. **Settings → Language & chatbot → “Let the chatbot use AI”** adds an *Ask AI* button
  (needs AI on for the workspace), with the usual preview of what is sent.
- **Users and rights (multi-user, Option A)** — Settings → Users & RACI. Several people sign in on
  one computer; each has a RACI letter per process step: R edits, A edits and approves, C and I view,
  – hides the step. Screens without the Edit right become read-only with a banner; approving a
  recommendation, accepting a risk formally and approving a measure need **A**. Activity log and
  RACI matrix exportable as CSV. It organizes accountability; it is not a security boundary.
  Option B (team server) is designed in `MULTIUSER-ARCHITECTURE.md`.
- **Extract the profile from documents** — Organization → Profile & appetite → *Extract from
  documents…*: proposes every field (context, mission, products and services, processes, systems,
  cloud, suppliers, sensitive information, continuity, controls and maturity, incidents, obligations,
  risk appetite and rationale, currency, IT budget, cybersecurity budget, baseline run cost), each
  value normalized (under 50 words), tagged **FACT / INFERENCE / ASSUMPTION / EXTERNAL / UNKNOWN**
  with its source. With AI and the Claude provider, missing items can be looked up on the web
  (tagged EXTERNAL with the page cited); with a local model they stay ASSUMPTION or UNKNOWN; a
  rules-only method works offline without AI. You review, edit and tick each value; the tags stay
  visible on the fields.
- **Extract the crown jewels from documents** — Organization → Crown jewels, same review.
- **Save and Cancel in Profile & appetite** — edits are a draft until *Save*; *Cancel* restores the
  saved values; leaving with unsaved changes asks first.
- **New workspace** — options to extract the profile and then the crown jewels right after
  creation, and to mark the case **“Educational case used for training purposes”** (also in the
  Classroom tab), shown in the workspace banner.
- **Batch scenarios** — *Propose with AI*: up to 30 candidates with full causal chains, the six
  parameters, a reason and a confidence for each, landing in the grid marked [AI] for review.
  *Number of candidates* (default 10, quick 10 / 20 / 30 / 50, up to 500), generated most relevant
  first (pattern likelihood × asset criticality × source fit).
- **About** — creator, licence, acknowledgment of the use of generative AI, project website and
  GitHub repository, versions.
- **Exit** — top-bar button: saves, stops the local helper and closes the window.
- **Beta notice** — “Beta · proof of concept” in the top bar, footer and Process page.

### Changed
- Profile labels: “Cybersecurity budget (current spend)” and a definition under “Baseline (run)
  security cost”: the part of that spend needed just to keep existing security running — salaries
  of the current security staff, licence renewals, existing managed services, maintenance; it
  covers no new treatment.
- Backups now carry interface preferences and the users / RACI matrix (never PIN hashes).
- AI requests made while the interface is in French ask for French prose; data stays as written.

### Fixed
- Batch scenarios, step 2 “Assets and services”: said “No crown jewels defined…” when assets
  existed in Information assets. It now lists the crown jewels and the information assets, most
  critical first.
- Batch scenarios, threat sources: the number of candidates is no longer fixed.

## 1.5.1 Beta — 4 October 2026

**Proof of concept.** `crg.js`, `cvss4.js`, `sample.js` and `threat.js` are unchanged; the start-up
self-check still requires **84,491 / 41,104**. Workspaces from 1.1–1.4 open as they are; the
recommendation register starts empty.

### Added
- **Collapsible navigation** — section titles bold and larger (12px/700 in full text colour, from
  10.5px/600 muted), each section collapsible with the state remembered across reloads, the section
  holding the current screen opening automatically, operable from the keyboard. A closed section
  shows how many screens it holds — deliberately the screen count, not the sum of its badges, which
  count different things. On a narrow window the sidebar becomes a strip and every item stays visible.
- **Frameworks & standards** (new screen) — two registers, because they are two different things.
  *Control catalogues* are selectable controls feeding Risk mitigation and the Statement of
  Applicability. *Methods and standards* — ISO/IEC 27001, 27002, 27005, NIST CSF 2.0, SP 800-30,
  SP 800-53, SP 800-171, ITSP.10.171, COBIT 2019, CIS, CVSS v4.0, FAIR and the CRG model — are
  recorded and cited, each stating where CRG stops. FAIR and CRG are named as parallel quantification
  methods, not layers of one another; CVSS is Base-only and says why.
- **Three catalogues extracted from the publishers' own documents** and shipped with the app, loaded
  on request: **NIST SP 800-171 r3** (130 identifiers, 97 in force, 17 families), **ITSP.10.171**
  (131 identifiers, 98 in force, 17 families) and **COBIT 2019** (40 objectives: EDM 5, APO 14,
  BAI 11, DSS 6, MEA 4). Cross-check: every requirement in force in SP 800-171 r3 is present in
  ITSP.10.171, which adds exactly one — 03.14.09 *Dedicated administration workstation*. Withdrawn
  and unallocated identifiers are kept and marked so earlier references still resolve.
  ISO/IEC 27001:2022 Annex A is registered as an alias of ISO/IEC 27002:2022, not a duplicate.
- **Framework update mechanism** — import a CRG pack, a NIST OSCAL catalogue or a CSV. Nothing is
  written until the diff is shown: added, removed, retitled, and separately **renumbered**, the case
  where a control keeps its title under a new identifier. Before applying, every measure and
  Statement-of-Applicability row across all workspaces that points at a control the new edition moves
  or drops is named, with its new identifier where there is one. Nothing is remapped automatically.
  Per-installation revision log. `tools/build_frameworks.py` converts and validates offline;
  `tools/extract.py` and `tools/build_packs.py` rebuild the bundled packs from the source PDFs.
- **Treatment need** (Recommendations → new tab) — the residual-to-tolerance verdict for every
  included scenario, and a treatment objective written in risk terms, both *before* any control is
  offered. A scenario does not earn a project by existing.
- **Recommendations register** (Recommendations → new tab) — selecting measures in Risk mitigation
  creates a **draft** recommendation that collects their scenarios, costs, horizon and framework
  mapping. Lifecycle draft → in review → approved → in implementation → completed, with deferred and
  rejected as terminal states and illegal transitions refused. Approval is gated on the twelve
  questions of the guidance and **freezes the figures** — reduction, ratios, cost, scenarios and
  measures — with the date and approver; later changes to the workspace move the live panel and leave
  the frozen record alone. Editing a formal recommendation records a new version. Decision-maker
  comments, full history, and tracking (progress, due date, next review) once implementation starts.
- **Consolidation** — drafts sharing control themes or scenarios are proposed for merging into fewer
  enterprise initiatives, with the reason stated. Nothing is merged for you.
- **AI assistant** (new screen, Tools) — proof of concept. The in-app analyst, parameter critique and
  scenario generation, with a provider seam that already carries both options.
  *Where it runs*: the browser never calls a model. It posts to the local helper, which makes the
  request, so the key stays out of the page and the egress point is one auditable function. Provider
  `claude` reaches api.anthropic.com with the analyst's own key; provider `local` reaches any
  OpenAI-compatible endpoint on the same machine (oMLX, Ollama, LM Studio) and nothing leaves it.
  Models are listed from the endpoint itself — nothing is hardcoded.
  *What is sent*: the screen shows the exact payload, byte for byte, with its size and destination,
  before anything is transmitted. The anonymizer from Publish & share can be applied first. AI is on
  by default per workspace and can be switched off; a workspace marked confidential confirms every
  single call and never remembers consent. A request over 400 kB is refused rather than sent.
  *What comes back*: a critique suggests and never applies; generated scenarios land in Batch
  scenarios marked as AI-generated and unreviewed, never in the register. Every call is recorded —
  task, provider, model, date, bytes, whether it was anonymized, token usage, and the analyst's
  verdict on the answer.
  *Keys*: held by the helper in crg-keys.json, mode 600. Never in crg-config.json, never in a log,
  never in a backup.
- **Settings → AI providers** — store or remove a key, set a local endpoint, and list the models the
  endpoint actually offers.
- **Feed triage** (Threat feeds → now the first tab) — the week's items arrive as *stories*, not as a
  list. Reports of the same event are merged: a shared CVE identifier is decisive, otherwise the
  headlines are compared on their meaningful words, so three outlets covering one vulnerability become
  one row carrying all three sources. Each story falls into **needs a decision**, **worth watching**
  or **not relevant**, and the reason is stated with the CVE, technique, technology or term that put
  it there. The exposure gate decides the top bucket: a registered CVE only reaches *needs a decision*
  when exposure is confirmed on an asset. Nothing is dropped — *not relevant* is a bucket you can
  open, because "we looked and it did not concern us" is a finding. The triage is deterministic: the
  same items and the same workspace give the same buckets in the same order, which is why it is the
  application's triage that is authoritative and not the scheduled task's.
- **Weekly briefing, written without AI** — the triage renders directly to a Markdown briefing naming
  the organization, the period, the number of items, the stories, the duplicates merged, and for each
  story the scenarios and assets it touches. It ends by stating what it has *not* done: no risk score
  changed, Pb(A) and Pb(ψ,A) move only on confirmed exposure through the Threat Evidence Ladder with
  the analyst accepting each change, and CVSS stays Base-only. A second button narrates the same
  triage through the AI assistant for a management audience; the narration is told to state no risk
  figure, and the briefing without AI remains the one of record. Either can be written into the feeds
  folder beside the digest.
- **Triage profile for the scheduled task** — *Export the profile for the scheduled task* writes
  `briefings/triage-profile.json`: the technologies, registered CVEs with their exposure flag,
  scenario techniques, sector, region and weighted terms. It deliberately carries **no organization
  name, no scenario text and no asset names**, so the weekend download task can triage the week and
  write its own briefing without the workspace leaving the machine. The task's prompt was updated to
  read it, apply the documented rules and write `briefings/briefing-YYYY-MM-DD.md`; it is forbidden
  from touching any score, parameter or workspace.
- **Forecasts** (new screen, Tools) — Monte Carlo over the CRG model and KRI projection, both without
  AI and both through the verified engine.
  *Monte Carlo*: parameters become three-point ranges (min, likely, max) with a triangular, uniform or
  PERT shape; seeded trials give a median, a 90% interval, the probability of exceeding tolerance, and
  a driver chart. Leaving a parameter alone keeps it a single value, so an untouched workspace
  forecasts to exactly its calculated result — a check, not a coincidence. The CVSS score is resolved
  once per scenario rather than re-parsed each trial, which is why 300,000 engine calls take about a
  sixth of a second instead of six and a half seconds, and why no Web Worker is needed. Ranges can be
  proposed from the confidence already recorded against each parameter by a stated rule (±0.15 / ±0.10
  / ±0.05 for Low / Medium / High), clamped to each parameter's own limits.
  *Drivers*: a tornado holding every other parameter at its likely value and sweeping one across its
  range — deliberately not derived from the Monte Carlo sample, because "what if this one estimate
  were wrong" is a different question from how the parameters vary together.
  *KRI projection*: ordinary least squares on each indicator's recorded readings with a 95%
  **prediction** interval for a single future reading, projected threshold crossings in days, and a
  refusal to project from fewer than four readings rather than drawing a flattering line through three.
  Every forecast is shown apart from the calculated results and labelled *Analytical estimate —
  validation required*.
- **New logo** throughout: the shield mark for the application icon at 32, 64, 192 and 512 px, a
  maskable icon with the art inside the central 70% for platforms that crop to a circle, and the full
  lock-up kept as `icons/logo-full.png`. The background was removed by a border-connected flood fill
  so the white of the eagle's head survives while the page background does not.
- **Backup & restore** (new screen, Tools) — one file holding every workspace, the extracted document
  text, the loaded framework catalogues and the helper settings, with a manifest and a SHA-256
  checksum. Context documents are included by default and threat snapshots are not, because snapshots
  are the bulk and are rebuildable from the public catalogues; the screen shows each part's size
  before you choose. **API keys are never included** — the helper keeps those in a file of its own
  outside the browser, and any field whose name looks like a key, token, secret or password is
  stripped. Loading a file shows what restoring it would do before anything is written: every
  workspace is labelled added, no change, brought forward, or **would lose work** when this browser
  holds a newer copy, and that last case is unticked by default. Merge leaves everything else alone;
  a full replacement is offered but states how many workspaces it would delete. A file from a newer
  version of the application is refused rather than partially read, and a failed checksum is reported
  before the restore button. Migration to another machine is the same file restored on the other side.
- **Measures** gain what the guidance requires of them: what the measure changes (the nine effect
  categories), the action verb (strengthen, extend, automate… rather than a default "implement"),
  and whether the scenario revealed a control gap, a weakness or a maturity problem.

### Changed
- **The network statement changes, and says so.** The application still makes no network request of
  its own, and the helper still downloads only the public catalogues in the accepted list. The AI
  assistant is the one deliberate exception: when the analyst sends from that screen, the helper
  transmits the previewed text to the chosen provider. README and NOTICE state this plainly rather
  than leaving the old blanket claim standing. Nothing is sent automatically, on a schedule, or in
  the background, and constraint C1 is untouched — no network call sits in the calculation path.
- Service-worker cache `crg-desktop-1.5.1`; `serve.py` reports version 1.5.1 (the helper itself is
  unchanged from 1.4.0).
- Ticking a measure updates only the action bar instead of redrawing the measures table, so the
  scroll position and any open editor survive.

### Fixed
- **Exporting the triage profile said nothing about where it went**, which is the one thing that
  matters: the helper writes to its own feeds folder, and if the scheduled task works in a different
  folder it finds no profile and writes no briefing, with nothing on screen to explain why. The export
  now names the absolute path it wrote to, states what the profile contains and what it omits, and says
  that the task must work in that same folder — with the `feeds-dir.txt` remedy if it does not. It also
  warns when the profile carries no technologies or no registered CVEs, because such a profile cannot
  put any story in *needs a decision*: that bucket requires an exposed CVE, or a technique and a
  technology together. Found by running the task for real rather than by testing the writer alone.
- `temperature` is rejected outright by current Claude models, so it is now sent only when a caller
  explicitly asks for one. Found by calling the live API rather than reading about it.
- An answer that hit the model's output ceiling was discarded whole. The parser now salvages the
  array elements that are complete, reports how many were lost, and the screen says the answer was
  cut short — a truncated critique shows its first nine findings instead of nothing.
- The AI screen awaited the helper probe before its first paint, which let a second render overtake
  the first and show a stale state. It now paints from what is known and refreshes when the probe
  lands.
- A recommendation whose measure was already in force claimed credit for it: the baseline excluded
  the recommendation's own measures regardless of status. "Current" now includes everything in force,
  so an already-implemented control contributes nothing to the claimed reduction.
- Imported framework packs were not loaded before the first screen rendered, so a fresh page showed
  none of them; several screens read a static framework list that imports never reached.
- Restoring a backup wrote the framework packs to storage but left the registry's in-memory cache in
  place, so the restored catalogues did not appear until the page was reloaded.

### Verified for this release
- Self-check 84,491 / 41,104; all 24 routes render with no console error.
- 40 unit tests on the recommendation lifecycle, including: post-treatment residual matching
  1 − ∏(1 − r) applied directly to the verified engine; a measure added twice counted once; approval
  refused with the missing fields named; frozen figures surviving a later change to the measures while
  the live figure moves; illegal transitions refused; consolidation grouping only genuine overlaps.
- 32 unit tests on the framework diff, validation, parsers and impact report, including renumbering
  detection and the Statement-of-Applicability impact warning.
- End-to-end in a browser: draft from selected measures → approval gate → approval → implementation →
  completion, with the frozen figure holding at 646 while the live figure moved to 1,292 after the
  measure changed.
- All three bundled packs load through the review path and reach Risk mitigation and Compliance
  (1,914 controls available).
- AI, against the live API and a mock OpenAI-compatible endpoint: 46 checks including the preview
  appearing before any send and naming its destination, the payload carrying the organization context
  and the engine's own figures, a live analyst answer citing real scenario identifiers, a critique
  returning 10 parsed findings, three generated scenarios reaching Batch scenarios while the register
  stayed at 30, the decision log recording each call with its verdict, anonymization changing the
  payload, switching AI off removing the feature, the local provider listing models and completing
  through a mock, and the error paths for a wrong key, a dead endpoint and an oversized request. The
  key appears in no log, no page and no file in the build.
- 45 unit tests on the forecaster: with no ranges every trial is identical and the median equals the
  calculated 41,104 exactly; the same seed reproduces a run and a different seed does not; symmetric,
  skewed, uniform and PERT draws match their analytic means and PERT is the narrower; θ is never
  proposed at or below zero; the tornado orders by span and produces no bars where nothing varies; a
  perfect straight line projects with a zero-width interval and r² of 1, a flat series predicts no
  crossing, an already-breached indicator reports no future crossing, and a rising one lands its
  predicted crossing within two days of the arithmetic.
- 19 forecast checks in the browser, including the no-range median reading 41,104 on screen, the
  calculated figure falling inside the widened interval, and the same seed reproducing the same median.
- 41 unit tests on triage: three reports of one CVE collapsing into one story, identical headlines
  across sources merging, unrelated stories staying apart, a confirmed-exposure CVE reaching *needs a
  decision* and naming the CVE, a registered-but-unexposed CVE held at *worth watching*, an unrelated
  item kept as *not relevant* rather than discarded, the same input giving the same output twice, the
  window honoured, the briefing carrying the organization, the scenario, "No risk score has been
  changed", the ladder and the Base-only statement — and the exported profile carrying the
  technologies, CVEs and techniques while carrying none of the organization name, scenario text or
  asset names.
- Documentation brought up to the release: README (screens, the revised network statement, the triage
  and briefing rules, the new modules), NOTICE (the three bundled packs with their licences and exact
  editions, the methods register, the AI providers) and USER-GUIDE (sections 6.22 Frameworks &
  standards, 6.23 AI assistant, 6.24 Forecasts, 6.25 Backup & restore, the recommendation lifecycle in
  6.7, triage and the briefing in 6.17, thirteen new troubleshooting rows, and an acceptance test
  extended from sixteen steps to twenty-three). The claim "the app itself uses no AI" was removed from
  the context-documents section, where it had stopped being true.
- The whole suite re-run on the packaged build: engine 84,491 / 41,104; 24 routes with no console
  error; 153 unit tests across frameworks, recommendations, backup, forecasts and triage; and the
  browser suites for the framework import path, the recommendation lifecycle, approval and freezing,
  forecasts, backup across two profiles, and triage.
- The three bundled packs loaded through the review path in one session: 301 controls added, the
  catalogue filter in Risk mitigation listing COBIT 2019 (40), ITSP.10.171 (131) and SP 800-171 r3
  (130) alongside the built-in catalogues, and all three reaching Compliance.
- The AI layer re-verified against a mock OpenAI-compatible endpoint with no Claude key stored at all:
  the models listed from the endpoint, the exact payload shown before any send with the engine's own
  figures in it and no key in it, a completion returned and parsed, the refusal when no model is
  chosen reported in words rather than as a silent failure, and no key in the page.
- Offline: with the network cut, the service worker (`crg-desktop-1.5.1`) serves the app, the
  self-check still reads 84,491 / 41,104 and all 24 screens remain reachable.
- Test-harness corrections, not product defects: the framework UI test was clicking a button whose
  label changed once the catalogue became bundled ("Load …" and "Review or import another edition…"),
  and was reading the Mitigation plan's status filter instead of the Control catalogue's framework
  filter.
- 21 triage checks in the browser against seeded feed data: 7 items became 4 stories with 3
  duplicates merged, one story needed a decision, its row named the two scenarios and the asset it
  touches, and the briefing written from the screen contained every required statement.
- 21 backup checks across two browser profiles: a backup taken in one profile and restored into a
  clean one reproduces **84,491 / 41,104** and brings back the workspace, its recommendation, its
  measure, the extracted document text and the framework pack (40 COBIT rows); a workspace modified
  after the backup is flagged and unticked; a file claiming a newer app version is refused; a tampered
  file fails its checksum; and no key, token, secret or password field survives into the file.

## 1.4.0 — 4 October 2026

Proof-of-concept release. `crg.js`, `cvss4.js`, `sample.js` and `threat.js` are unchanged; the start-up
self-check still requires **84,491 / 41,104**. Workspaces from 1.1 and 1.2 open as they are; the new
collections (measures, risks, assets, compliance, IOC watch list) start empty.

### Added
- **KRI dashboard** — shows the **top 5** indicators by default (critical first, then warning, each
  ranked by how far past its threshold), recomputed at every visit; ticking switches to your own
  selection, *Reset to top 5* returns to the automatic view. Four new computed KRIs: EDR coverage of
  critical endpoints (CRG-11), assets past end of support (CRG-12), critical assets with a KEV CVE
  (CRG-13), controls implemented in the first followed framework (CRG-14).
- **Risk mitigation** (new screen) — control catalogue of 1,677 entries: your list (Controls_list.xlsx:
  ISO/IEC 27002:2013, NIST CSF 1.1 subcategories, CIS Controls v7.1 — numbering fixed, 7 rows
  flagged), ISO/IEC 27002:2022, NIST SP 800-53 Rev. 5 and NIST CSF 2.0 (OSCAL), CIS Controls v8.1,
  MITRE ATT&CK mitigations and the CRG measures; search by framework, function and capability.
  Measures with owner, one-time and recurring cost, months to benefit, default and per-scenario
  likelihood (rp) and impact (ri) reductions, confidence and status. Per scenario the reductions are
  combined as **red_p = 1 − ∏(1 − rp), red_i = 1 − ∏(1 − ri)** and passed to the verified engine;
  before/after ratios; *Apply* writes them into the scenario with a revision entry (*Revert* restores);
  shared measures counted once; *→ Initiative* feeds Budget, Recommendations and Excel. Proposals by
  transparent rules (ATT&CK mitigations, keywords, damage profile, sized to the organization) and an
  **Ask Claude** round-trip (request with the JSON schema, import of the answer with checks).
- **Threat feeds & social** (new screen) — AlienVault OTX, abuse.ch ThreatFox, MalwareBazaar, URLhaus
  and Feodo Tracker, SANS ISC (diaries, Infocon, top ports), plus proposed sources: CISA, Canadian
  Centre for Cyber Security, NCSC UK, GitHub advisories, BleepingComputer, The Record,
  ransomware.live, X (paid API), Mastodon, Bluesky, Reddit. Items are parsed and matched locally to
  assets, technologies, registered CVEs, scenario techniques, sector, region and watch terms, with the
  reasons shown. IOC watch list with CSV and STIX 2.1 export; CVEs to the register (unconfirmed);
  intelligence notes on scenarios. Feeds never change a score.
- **Risk register** (new screen) — risks with threats (ATT&CK), vulnerabilities (CVE/CWE), assets,
  scenarios and measures; inherent / current / target ratings 1–5 suggested from the scenario
  parameters and measures; CRG ratio of the linked scenarios; treatment, status, review date, formal
  acceptance, change history; heat map and top risks.
- **Publish & share** (new screen) — the risk register (with threats and vulnerabilities) and the
  scenario registry as crg-registry/1 JSON, Markdown or CSV, **anonymized** on request (organization,
  people, assets, IPs, hosts, URLs, e-mails, phones, postal codes, amounts, dates, free text, custom
  terms) with a preview and a residual-term check; download, copy, or publish to the shared registry
  folder (synced Drive folder, or the outbox uploaded by the scheduled task); publication log with a
  local-only re-identification table; import of shared registries as a scenario library.
- **Compliance** (new screen) — statements of applicability for the catalogue frameworks (applicable,
  status, maturity 0–5 against target, owner, evidence), gaps ranked by the residual risk of linked
  scenarios with *Create measure*, Quebec Law 25 and PIPEDA checklists, Markdown and CSV reports.
- **Information assets** (new screen) — inventory linked to scenarios and risks; discovery imports
  (Nmap XML, CSV from CMDB/EDR/MDM, AWS and Azure JSON) compared with the inventory before applying,
  and a discovery drop folder checked every minute; software and data inventory; classification,
  CIA and criticality score; business impact analysis (MTD, RTO, RPO, five impact categories);
  sensitivity tags; dynamic risk score (criticality × exposure) with recorded history; vulnerability
  correlation suggestions and assets × CVEs map; configuration baselines and endpoint security
  status; dependency mapping, relational graph and blast-radius analysis; lifecycle and end of
  support; timestamped audit trail; asset compliance checks.
- **Settings** (new screen) — every external link and shared folder in one place (Drive Feeds and
  registry folders, synced local folders, controls list, KEV/EPSS/NVD, Navigator, plugin), feed
  sources (accept / propose / reject, frequency, custom sources, suggestions from the scheduled task),
  API keys stored by the helper only, social query and watch terms, the scheduled task (pause, uploads,
  suggestions, instructions), the network domains to allow, export/import of crg-config.json.
- **Scheduled downloads** — `crg_feeds.py` (stdlib) downloads the due sources into the feeds folder
  for the helper and for a Claude scheduled task; it reads the same crg-config.json and writes a
  digest the task copies to the Drive Feeds folder.
- **Excel** — new sheets Risk_Register, Measures (combined reductions as live formulas), Compliance_SoA
  and Assets.
- **Scenario editor** — linked assets, measures, risks and intelligence notes.

### Changed
- `serve.py` 1.4.0: configuration, keys, feed downloads, publication and discovery endpoints;
  honours SSL_CERT_FILE / REQUESTS_CA_BUNDLE for TLS-inspecting proxies; reports proxy refusals as
  egress-allowlist blocks. The helper API is never cached by the service worker.
- Network statement: the app itself still makes no network request. The helper and the scheduled task
  download the sources in your accepted list only; social-media searches send the search query you
  set (about threats, not about your organization); nothing from the workspace is transmitted.
- Service-worker cache `crg-desktop-1.4.0`.

### Verified for this release
- Self-check 84,491 / 41,104; every screen renders with no console error (smoke test, 22 routes).
- 50-check end-to-end test: top-5 KRIs; proposals; 1 − ∏(1 − r) against an independent computation;
  apply/revert; shared cost counted once; catalogue counts (ISO 27002:2013 114, CIS v7.1 171,
  ISO 27002:2022 93, SP 800-53 r5 1,014, CSF 2.0 106); Claude answer import with warnings; risk register
  from 30 scenarios; Nmap and CSV discovery diffs and audit trail; blast radius; compliance statistics;
  anonymized package with no trace of the organization, published to the outbox and re-imported;
  settings written to crg-config.json, key file mode 600 and never in the config; feeds downloaded from
  a mock of every source, matched, IOC exported as STIX 2.1.
- Excel (all scenarios, 22 sheets): LibreOffice recalculation from formulas alone matches all 2,958
  cached values.
- 1.2 regression tests (Excel scopes, migration, helper KEV/EPSS/NVD, offline service worker) pass.

## 1.2.0 — 3 October 2026

Additive release. `crg.js`, `cvss4.js`, `sample.js` and `threat.js` are unchanged; the start-up
self-check still requires **84,491 / 41,104**. Workspaces from 1.1.x open without conversion steps.

### Added
- **Organization** — the New-workspace form imports several Word or PDF documents at once (Excel,
  PowerPoint and text accepted), read locally with a per-file progress list; the workspace opens on
  Context documents.
- **KRI dashboard** — gauges with target, warning and critical bands for the selected indicators;
  search and filters (status, computed/operational, owner) with checkboxes and bulk selection, as in
  the Scenario register; the selection drives the gauges and what **Record** captures and is saved
  with the workspace; *Compare selected trends* (one chart per indicator, own scale).
- **Batch scenarios** — three new sources: **From MITRE ATT&CK** (search, tactic filter), **From CVE**
  (register CVEs, exposed/KEV first; CWE and ATT&CK links; ladder-band Pb(ψ,A) start with stated
  rationale; NVD CVSS v4.0 vector; the CVE's own asset) and **From CWE** (Top 25 or search).
- **Risk calculator** — search and filters (status, included/excluded, threat source, owner),
  *Include shown*, *Exclude shown*, *Include only shown*, select-all-shown checkbox, count line.
- **Vulnerabilities → Online sources** — update CISA KEV, FIRST EPSS (by date) and NVD (changed
  since the last update, a date range, or the complete catalogue with a time warning; optional NVD
  API key) through the launcher's new **download helper** (`serve.py`). Downloads run in the
  background into `~/Downloads/CyberRiskGuardian-feeds`, survive closing the browser, and are loaded
  later from a files list; NVD records enrich the register locally; KEV + EPSS build a new snapshot;
  update history per workspace. Without the helper: download links and a file picker.
- **Budget** — budget years (IT budget, planned and actual cyber spend, baseline, note), add/remove
  years, year selector; initiatives allocated over up to 3 years (default, % split or amounts);
  committed spend per year; chart by year against 4% / 7.8% / 12% and the appetite target; verdict
  per year. The calibrator, band chart, arbitrage and frontier work on the selected year.
- **Export** — the Excel workbook is regenerated from scratch with options: scope (included, all,
  above tolerance, above or at tolerance, picked from a searchable list), optional sheets, budget
  years, KRI history; preview of scenarios and sheets. The Budget sheet gains the multi-year
  allocation and budget-by-year tables with live formulas (SUMIF on start year).

### Changed
- Launchers start `serve.py` (static server + helper, 127.0.0.1 only) instead of `http.server`; an
  earlier copy on the port is still detected and stopped.
- Network statement: the app still makes no network request; the helper downloads public catalogues
  in full when the analyst asks, and never transmits organizational data. Its API answers only the
  app (custom header, loopback host), fetches only the fixed source list, and keeps the NVD API key
  out of its files.
- Service-worker cache `crg-desktop-1.2.0`.

### Verified for this release
- Self-check 84,491 / 41,104; smoke test of every screen with no console error.
- Workbook scopes all / above tolerance / picked: LibreOffice recalculation from formulas alone
  matches every cached value (1,659 / 903 / 156 formulas); *all* reproduces 84,491 / 41,104.
- Helper tested against a mock of the KEV, EPSS and NVD endpoints: background jobs, date fallback
  for EPSS, 120-day NVD windows, cancel, files list, load, snapshot build, API key never on disk.
- Migration of a 1.1.x workspace export: budget becomes budget year 2026, totals unchanged.

## 1.1.1 — 3 October 2026

Fixes the upgrade from 1.0.0 still showing the old version.

- Launchers (`start.command`, `start.sh`, `start.bat`) detect an earlier copy of the app still
  serving the port, stop it and say which folder it was serving; another program on the port is
  reported instead of being stopped.
- Service worker is now network-first: when the app is served, the served files always win, so a
  new version appears at once; the cache is used only offline. Cache `crg-desktop-1.1.1`.
- The page reloads itself once when a newer service worker takes over.
- User guide: upgrade and troubleshooting notes.

## 1.1.0 — 3 October 2026

Additive release. No formula changed: `crg.js`, `cvss4.js` and `sample.js` are byte-identical to
1.0.0, and the start-up self-check still requires **84,491 / 41,104**.

### Added

**Organization and workspaces**
- Workspaces: one per organization, business case or class team, stored locally in the browser
  (IndexedDB). Create blank, from the MediBec example, as a copy, or by importing a workspace or
  assessment JSON. Export a workspace — documents included — for backup or hand-in.
- Organization profile: mission, services, processes, systems, cloud, suppliers, obligations,
  sensitive information, availability, maturity, incident history; crown-jewel register.
- Risk appetite with rationale and an appetite estimator (labelled as an analytical estimate);
  IT budget, cyber spend and baseline.
- Classroom mode: course, case title, team, members, instructor, due date; deliverables carry the
  "fictional" label.
- Context documents: upload .docx, .xlsx, .pptx, .pdf, .txt, .md, .csv, .json or .html. Text is
  extracted locally (no upload, no AI) and can be corrected. A keyword scan proposes sector,
  obligations, technologies, crown-jewel candidates and CVE identifiers for the analyst to accept.
- Context pack: a Markdown brief of the profile, crown jewels, documents, scenarios and exposure,
  to hand to the CyberRiskGuardian plugin (`/risk-assessment`).

**Scenarios**
- Scenario register with ATT&CK and CWE/CVE chips that open the Threats and Vulnerabilities screens,
  search and status filter, include/exclude checkboxes, JSON load (replace or append) and export.
- Scenario editor: view and edit every field of a scenario — statement, causal chain, consequences,
  the six parameters with rationale/evidence/confidence, CVSS vector, treatment, initiatives,
  ATT&CK techniques, CWE and CVE links, threat-basis audit trail — with live KRIs; duplicate, delete,
  previous/next.
- Batch scenarios: generate candidates from 18 threat patterns × assets × threat sources, or from
  any ATT&CK technique; paste/import CSV; add blank rows; review in an editable grid; add the
  selected rows to the register.

**Risk calculator**
- Portfolio table with the risk of every scenario and a checkbox to include or exclude it; totals,
  tolerated risk and the portfolio ratio for the included set; what-if appetite and factor; quick
  selections (all, none, above tolerance, top 10). The selection persists and drives the dashboard,
  recommendations, budget and Excel export.
- Single-scenario calculation loads any scenario; save values back or as a new scenario.

**Threats — MITRE ATT&CK** (bundled ATT&CK Enterprise v19.2, offline)
- Matrix by tactic, heat-coloured by the number of scenarios using each technique.
- Technique detail: description, tactics, platforms, prevalence (intrusion sets), sub-techniques,
  ATT&CK mitigations, CRG measures implementing them, CWE weaknesses linked through CAPEC v3.9,
  scenarios using it; link to a scenario or start a new one from the technique.
- Scenario × tactic coverage map, techniques ranked by residual risk, threat sources view.
- ATT&CK Navigator layer export.

**Vulnerabilities — CVE, CWE, KEV, EPSS**
- CVE register with the exposure-confirmed flag (the C4 gate), enriched by local join with the
  loaded snapshot: KEV listing and ransomware use, EPSS score and percentile, ladder rung.
- Import NVD CVE API 2.0 files, CVE JSON 5 records and scanner/CMDB CSV exports.
- CWE explorer (CWE v4.14, 2024 Top 25) with linked ATT&CK techniques and scenarios.
- CVE detail screen.

**Threat context**
- Snapshot stored per workspace.
- In-app snapshot generator from analyst-downloaded CISA KEV JSON and EPSS CSV(.gz) — same
  `crg-threat-context/1` artifact as `threat_snapshot.py`, with pruning, age guard, validity and
  regional modules; or the equivalent Python command.
- Exposure join pre-filled from the vulnerability register.
- Proposed Pb(ψ,A) changes for scenarios linked to exposed CVEs, raised to the ladder-band floor
  only; the analyst accepts each one, which writes a `threat_basis` entry and a revision-log line
  (before/after ratio and classification).

**Recommendations**
- Per scenario: suggested treatment option (mitigate, transfer, avoid, accept) from transparent
  rules on the untreated and treated tolerance ratios, δm and μ(E); linked initiatives with
  cost-effectiveness; ATT&CK mitigations and CRG measures; management decision register.
- Shared controls ranked by scenarios covered and attributed risk reduction; ATT&CK mitigations
  ranked by residual risk covered.
- Roadmap in 0–90 days / 3–6 / 6–12 / 12–24 months lanes.
- Initiative portfolio editor (costs, owners, priorities, scenario mapping, catalogue entries).

**KRI dashboard**
- Ten computed KRIs (portfolio ratio, scenarios above tolerance, residual, snapshot age,
  intel-backed Pb(ψ,A) coverage, exposed KEV CVEs, ATT&CK mapping coverage, funded treatment,
  recorded decisions, budget share) plus the assessment's operational KRIs.
- Record measurements by date; history table, sparkline, trend (least-squares slope per 30 days,
  improving/worsening against the KRI's direction), breach count and chart with thresholds;
  CSV import/export of history; KRI definition editor with suggested KRIs.

**Budget**
- Band chart from risk-averse to risk-seeking: the guideline curve, the stated appetite, the current
  spend and four funding options (status quo, bring above-tolerance scenarios down, best value
  within the appetite-consistent budget, full portfolio), each placed at the appetite its spend
  implies.
- Arbitrage options table and the funding frontier (residual risk vs cumulative Year-1 cost in
  cost-effectiveness order) with the 4% / 7.8% / 12% treatment envelopes.

**Export**
- Excel workbook (.xlsx) generated in the browser, with live formulas and cached values: README,
  Analyse, Parameters, Inputs, Portfolio, Sensitivity, Case_View, Scenarios, Candidates, KRIs,
  Evidence laid out as `build_workbook.py` does, plus Organization, Threats, Vulnerabilities,
  Recommendations, KRI_History, Budget and Threat_Context.
- Assessment JSON (all or included scenarios) readable by `crg_calc.py` and `build_workbook.py`.

### Changed
- Navigation grouped into Assessment, Threats & vulnerabilities, and Tools, with hash links so
  scenarios, techniques, weaknesses and CVEs link to one another.
- Shared initiative costs are split across the *included* scenarios; an excluded scenario shows an
  informational share.
- `desktop.js` replaced by ES modules under `js/`; service-worker cache `crg-desktop-1.1.0`.

### Verified for this release
- Start-up self-check 84,491 / 41,104.
- MediBec exported to Excel: 1,621 formulas; LibreOffice recalculation from formulas alone matches
  every cached value; per-scenario Year-1 allocation equals the reference data to 1e-10.
- Exported assessment JSON → `crg_calc.py`: 84,491 / 41,104; `build_workbook.py` builds from it.
- Threat Evidence Ladder acceptance test (CVE-2026-59310, CVE-2026-102490, CVE-1999-0016,
  CVE-1999-0001) unchanged on the shipped snapshot.
- In-app snapshot generation from the live KEV catalogue (2026.10.02, 1,733 entries).
- No network request is made by the app.
