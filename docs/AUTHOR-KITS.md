# Author kits — the backlog items only the author can do

Each kit is a short, ready-to-run task for an item that needs the author's own machine, key, language or decision. The
paths assume the consolidated layout on the author's Mac (`~/CyberRiskGuardian_Current/CyberRiskGuardian_ThreatIntel`).
Record each result in the release notes; the backlog item is closed when its "Done when" is met.

## BL-08 — Signed releases (minisign)

The application already verifies a `.minisig` beside each release ZIP (`crg_signing.py`) once a public key is pinned in
`desktop/app/serve.py` (`UPDATE_MINISIGN_PUBKEY`). **Steps 1–2 done on 20 November 2026**: the key pair is on the
author's Mac and the public key is pinned (`RWR57THy8GZvqaD2lfamsmwouCcN+NhTPZQ8cumNeZvFZF8WUINkjg84`). The key is published on the product site (20 November 2026:
https://cyberriskguardian.ca/release-signing.html, French /fr/signature-des-versions.html). Left: steps 3–4 at the next
release, then copy the key from the live page and check the signed ZIP with it (`minisign -Vm <zip> -P <key>`).

1. Install minisign and make the key pair — the secret key stays on the Mac, outside every repository and synced folder,
   protected by a password you keep in your password manager:

   ```bash
   brew install minisign
   ```

   ```bash
   mkdir -p ~/.minisign && chmod 700 ~/.minisign && minisign -G -p ~/.minisign/crg.pub -s ~/.minisign/crg.key
   ```

2. Pin the public key: copy the **second line** of `~/.minisign/crg.pub` into `UPDATE_MINISIGN_PUBKEY = "…"` in
   `desktop/app/serve.py`, commit, and publish it on the product site too (so a user can check it independently).
3. Build, sign and verify a release in one command (the script asks for the key's password, then checks the signature
   with the application's own verifier against the pinned key — it exits 1 if anything does not verify):

   ```bash
   cd ~/CyberRiskGuardian_Current/CyberRiskGuardian_ThreatIntel/desktop/app && python3 tools/package_desktop.py --edition community --sign ~/.minisign/crg.key
   ```

4. Upload `…zip`, `…zip.sha256` **and** `…zip.minisig` to the GitHub release.
5. Update cyberriskguardian.ca (website session): the download pages (`/download.html`, `/fr/telecharger.html`) get the
   new version, date, release link, the community ZIP's SHA-256 and the "New in" list. The signing pages need no change
   unless the key changes.

**Done when** Help → About & versions → *Check now* on a test install reports the download as *verified*.
Back up `crg.key` (encrypted) — a lost key means a new key pair and a release that pins it.

## BL-07 — Launcher prompt on the Mac and on Windows (item 3)

Since 1.9.2 a second launcher finds the first one running and asks instead of stopping it silently.

| Step | Mac (`start.command`) | Windows (`start.bat`) | Expected |
|---|---|---|---|
| 1 | Double-click `start.command` | Double-click `start.bat` | The app opens; the window says it is serving on port 8099 |
| 2 | Double-click it again | Double-click it again | *CyberRiskGuardian is already running (version 1.9.3, folder …) on port 8099* and a question |
| 3 | Press **Return** (default N) | Press **Enter** | The running app opens in the browser; the second window closes; the first keeps running |
| 4 | Start again, answer **Y** | Same | The first app stops, the second starts and opens |
| 5 | Start a copy from another folder (for example the 1.9.2 package in Historical) | Same | The prompt names the other version and folder |

**Done when** steps 2–5 behave as expected on both systems; note the macOS and Windows versions used.

## BL-10 — Native French read-through

**Done on 20 November 2026**: the author read the 1.9.5 export and found no change required. Kept for the next
read-through.

1. Export every French interface string with its English source (12,567 strings; 79 flagged to check first because they
   use a variant of a method term):

   ```bash
   cd ~/CyberRiskGuardian_Current/CyberRiskGuardian_ThreatIntel/desktop/app && python3 tools/fr_review_export.py ~/Desktop/crg-fr-review.csv
   ```

2. Read, in this order: the *Check first* rows; MediBec FR and CanaRetail FR (open the teaching cases with the interface
   in French); chapter help (*Read more* links); the Detailed-level lines of the 19-step guide; the CRGO French labels on
   Organization → Ontology · CRGO; `USER-GUIDE.fr.md`.
3. Write corrections in the *Correction* column (keep the English column untouched) and send the file back; the
   corrections are applied to `js/i18n/fr.js` and the guide, and `tools/fr_terms_check.py` keeps the decided terms
   (FR-1 to FR-3).

**Done when** the corrected file is applied and `i18n_coverage.py` still reports 100 %.

## BL-13 — Larger local models (24B / 32B / 70B) on the new computer

1. Start the application with its launcher; in **Settings → AI — local & remote**, set the local model (Ollama or
   LM Studio) to the model under test, and set every feature to *local*.
2. Rebuild the request set from the current release, then run the live pass on the local features:

   ```bash
   cd ~/CyberRiskGuardian_Current/CyberRiskGuardian_ThreatIntel/desktop/tests && CRG_URL=http://127.0.0.1:8099/ node ../tools/live/build_requests.mjs ../tools/live/live-requests.json
   ```

   ```bash
   cd ~/CyberRiskGuardian_Current/CyberRiskGuardian_ThreatIntel/desktop/tools/live && python3 live_pass.py --port 8099 --providers local --fresh --timeout 1200 --out ~/Desktop/live-local-MODEL.json
   ```

3. Repeat for each model size; send the JSON files back.

**Done when** each model's results are recorded against NV-047, and Settings → AI's quality warning (below about 30B)
is confirmed or its threshold changed.

## BL-15 — CIS approval for titles in the commercial editions (D3)

**Closed by author decision (19 November 2026): no request is sent to CIS.** The commercial package keeps showing CIS
Controls v8.1 by identifier only (`package_desktop.py --edition commercial` strips the titles and checks it). The
Community and Educational editions keep the titles under CIS's CC BY-NC-ND terms.

## Already done (checked 19 November 2026)

- **BL-09 — CRGO tag and approvals.** Tag `v0.11.2` exists on GitHub (`ITriskMgr/CyberRiskGuardian-Ontology`); the release
  check recorded 1,598 of 1,598 terms approved (`src/approvals.tsv`); 0.11.2 adds no term.
- **BL-14 — documentation checks.** The footer text (`engine verified · 84,305 / 41,023 · CanaRetail 27,526 / 16,049`) and
  the AI master-switch names in USER-GUIDE §8.3 match the application.
