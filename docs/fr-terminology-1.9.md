# French terminology 1.9.0 — aligned to the French edition of the book

Decision (1.9.0, 2026-11-02): where the interface and the French book disagree, **the book wins**. This
supersedes the earlier rule "FR labels follow the app". This file lists every term changed so the author's
native read-through can follow the change set (branch `lane/fr`).

Drafted with generative AI (Claude) — **validate before institutional use**. Agreement, elision and pronoun
fixes were made by hand after the automatic replacement; every changed sentence is listed by `git diff` on
the files below.

## Terms

| Concept (EN) | Before (1.8.x interface) | After (book) | Grammar notes applied |
|---|---|---|---|
| risk appetite | *appétit pour le risque*, *appétit*; once *appétence au risque* (Virtual consultant) | ***appétence pour le risque***, *appétence* | feminine: *une/aucune/cette/quelle appétence*; *l'appétence*, *d'appétence*; participles and adjectives agree (*déclarée*, *suggérée*, *fixée*, *approuvée*, *actuelle*, *modérée*, *élevée*, *traduite*); pronouns that referred to it become feminine (*la revoit*, *Elle est revue*, *qui la dépassent*, *en propose une*, *est-elle cohérente*) |
| Appetite estimator | *Estimateur de l'appétit* / *Estimateur d'appétit* | ***Estimateur d'appétence*** | label of Organization → Profile & appetite, and the guide |
| crown jewel(s) | *actif(s) essentiel(s)* | ***joyau(x) de la couronne*** | *l'actif essentiel* → *le joyau de la couronne*; *de l'actif* → *du joyau*; *à l'actif* → *au joyau*; *d'actifs essentiels* → *de joyaux de la couronne*; *cet actif* → *ce joyau*; *ACTIFS ESSENTIELS* (AI prompt header) → *JOYAUX DE LA COURONNE*; "Crown-jewel assets and services" → *Joyaux de la couronne (actifs et services)* |
| evidence register | *registre des preuves*, *registre partagé des preuves* | ***registre des éléments probants***, *registre partagé des éléments probants* | the tab "Evidence" (*Preuves*) and "evidence" in general (*preuve*) are unchanged: only the register's name changes |
| risk-to-tolerance ratio / residual-to-tolerance ratio | *ratio risque/tolérance*, *ratio risque résiduel/tolérance*, *ratio résiduel/toléré*, *ratio risque résiduel / risque toléré*, *ratio risque-tolérance* | ***ratio de tolérance*** | the definition stays visible where it was given: *Ratio de tolérance (résiduel ÷ toléré)* |

Not changed on purpose: *[VALEUR : services et actifs essentiels]* in the Security Policy Writer (it renders
"critical services and assets", not crown jewels); *Couronne* in "Crown copyright" and *sociétés d'État*.

## Where (replacements per file)

| File | appétence | joyau(x) de la couronne | registre des éléments probants | ratio de tolérance |
|---|---:|---:|---:|---:|
| `desktop/app/js/i18n/fr.js` (199 catalogue entries changed) | 106 | 101 | 11 | 12 |
| `desktop/app/USER-GUIDE.fr.md` | 50 | 44 | 4 | 4 |
| `desktop/app/crg_writer/` (Security Policy Writer, FR policy text: `catalogue.py`, `questions.py`, `library/eisp.py`, `library/ops.py`) | 29 | — | — | — |
| **Total** | **185** | **145** | **15** | **16** |

Already aligned before this change (checked, nothing to replace): the French teaching cases
(`medibec-fr.js` from `examples/medibec/source/fr/*.tsv`, `canaretail.js` from `examples/canaretail/source`),
the plugin's French markers, the help pages (the help windows translate through `fr.js`).

## Related wording fixes (label check)

The plugin label check (`hooks/check_labels.py`, OUTDATED_METHOD) flagged two English screen texts left by
the security lane; both were reworded rather than whitelisted, because the rule they trip is right:

| Where | Before | After | Why |
|---|---|---|---|
| `js/panels/budget.js` (note under the funding chart), `js/charts.js` (comment) | "A spend outside the 4–12% band implies no appetite…" | "A spend above the 12% point (appetite 0.30) or below the 4% point (appetite 0.70) implies no appetite…" | the budget rule is three point targets, linear in between — not a band |
| `js/panels/dashboard.js` (KRI dashboard lede) | "Computed KRIs come from the assessment itself" | "Automatic KRIs are measured from this workspace's own records" | computed values are risk indices; the automatic KRIs are measured counts and coverages with thresholds |

French translations updated with them (*point de 12 % (appétence 0,30)…*, *Les ICR automatiques sont mesurés à partir des propres enregistrements…*).

## For the native read-through

1. *appétence pour le risque* vs the short *appétence* in labels (*Profil et appétence*, *Appétence déclarée*): kept short where the English is short.
2. *joyau de la couronne* in long sentences can read heavy (*candidats de joyaux de la couronne*, *Cocher les joyaux de la couronne + les 5 plus critiques*).
3. *Estimateur d'appétence … en propose une* / *en suggère une* — pronoun now feminine.
4. Chapter-help section titles in French (`desktop/app/js/data/chapters.js`) are translations of the English headings of book v2.51b; replace them with the French edition's headings where they differ.
