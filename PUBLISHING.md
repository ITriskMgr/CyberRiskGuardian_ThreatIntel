# Publier CyberRiskGuardian with Threat Live-feed

Édition dérivée de CyberRiskGuardian v1.1.0 (devenu l’édition Core, plugiciel Core 2.2.1 en novembre 2026). Dépôt cible :
**https://github.com/ITriskMgr/CyberRiskGuardian_ThreatIntel**

## 1. Avant le premier push

1. Exécutez le bootstrap pour rendre le dépôt autonome :
   ```bash
   bash scripts/bootstrap-from-upstream.sh ../CyberRiskGuardian
   ```
   Puis les étapes manuelles de `BOOTSTRAP.md` — surtout le remplacement du `LICENSE` provisoire
   par le code légal complet, et la génération de l'instantané embarqué.
2. Validez :
   ```bash
   claude plugin validate plugins/cyberriskguardian-threatintel/.claude-plugin/plugin.json
   claude plugin validate .claude-plugin/marketplace.json
   ```
3. Régression obligatoire :
   ```bash
   python3 plugins/cyberriskguardian-threatintel/skills/cyber-risk-assessment/scripts/crg_calc.py \
           examples/medibec/source/medibec30.json      # doit afficher 84 305 / 41 023
   python3 plugins/cyberriskguardian-threatintel/skills/cyber-risk-assessment/scripts/test_crg_calc.py   # ALL PASSED
   ```
   Avec une copie de CRGO 0.11.1 (étiquette v0.11.1 ; v0.9.1 suffit pour dss/v1) :
   ```bash
   python3 plugins/cyberriskguardian-threatintel/skills/cyber-risk-assessment/scripts/test_crgo_contract.py \
           --crgo ${CRGO_HOME:-CyberRiskGuardian-Ontology-0.11.1}   # tous les contrôles doivent passer
   ```
4. Vérifiez qu'aucun appel réseau n'existe dans le chemin de calcul (voir `BOOTSTRAP.md`).
5. `bash scripts/sync-project-config.sh`

## 2. Dépôt GitHub public

Le dépôt est déjà initialisé avec un premier commit et le remote configuré.

```bash
git branch -M main
git push -u origin main
git tag v1.7.2          # version du plugiciel (plugin.json = marketplace.json)
git push --tags
```

Dans les paramètres du dépôt : description, sujets `claude-code`, `claude-plugin`,
`cybersecurity`, `risk-assessment`, `threat-intelligence`, et activation des *private
vulnerability reports*.

Installation par n'importe qui :
```bash
claude plugin marketplace add ITriskMgr/CyberRiskGuardian_ThreatIntel
claude plugin install cyberriskguardian-threatintel@cyberriskguardian-threatintel-marketplace
```

## 3. Répertoire communautaire Anthropic

- Soumettez le plugin avec le formulaire https://clau.de/plugin-directory-submission, en indiquant
  l'URL du dépôt public et le chemin `plugins/cyberriskguardian-threatintel`.
- Les pull requests ouvertes directement sur `anthropics/claude-plugins-community` sont fermées
  automatiquement.
- Chaque plugin passe une analyse de sécurité automatisée et une révision avant d'être listé.

Dans la soumission, précisez la relation entre les deux éditions : `cyberriskguardian` reste
l'édition stable, `cyberriskguardian-threatintel` ajoute la calibration par renseignement. Les
deux peuvent être installés, mais **un seul doit être activé à la fois** : les composants sont
préfixés par le nom du plugin et n'entrent pas en collision, mais deux hooks `SessionStart` aux
garde-fous contradictoires, deux serveurs MCP nommés `crg-calculator` et deux compétences
`cyber-risk-assessment` aux descriptions quasi identiques rendent arbitraire le choix de la
méthode qui répond. Recommandez la portée locale ou projet, ou `claude plugin disable` pour
basculer.

## 4. Publier l’application de bureau

Une version de l’application de bureau a sa propre étiquette, `desktop-v<version>` (par exemple `desktop-v1.9.0`),
et sa propre version GitHub avec trois fichiers :

| Fichier | D’où il vient |
|---|---|
| `CyberRiskGuardian_Desktop_v<version>-beta.zip` | `desktop/dist/` — construit par `python3 desktop/app/tools/package_desktop.py --edition community` (le contenu exact de `desktop/app/`, l’édition inscrite dans `js/edition.js`). Décision D3 : `--edition commercial` produit `…-beta-commercial.zip`, où les CIS Controls v8.1 figurent par identifiant seulement (titres et libellés CRGO retirés de `js/data/controls.js` dans la copie) tant que CIS n’a pas approuvé les titres ; `--edition educational` garde les titres avec l’avis CIS, comme l’édition communautaire |
| `CyberRiskGuardian_Desktop_v<version>-beta.zip.sha256` | `shasum -a 256 <zip> > <zip>.sha256` — **obligatoire depuis la 1.9.0** : la vérification des mises à jour contrôle le téléchargement avec ce fichier et marque « non vérifié » une version qui ne l’a pas |
| `CyberRiskGuardian_Desktop_v<version>-beta_Installation_Windows_macOS_EN_FR.pdf` | `desktop/app/INSTALL-Windows-macOS-EN-FR.pdf`, reconstruit par `python3 desktop/app/tools/build_install_pdf.py` chaque fois que `INSTALL.md` change |

Avant d’étiqueter : les contrôles de `desktop/app/tools` (`version_check`, `cache_check`, `label_check`, `history_check`,
`anchor_check`, `csp_check`, `i18n_coverage fr`) et `desktop/tests/run_all.sh` doivent tous passer, et le pied de page doit
afficher `© Marc-André Léger · ✓ Engine verified` (1.9.1 et suivantes), avec, sous Aide → À propos et versions,
`engine verified · 84,305 / 41,023 · CanaRetail 27,526 / 16,049`. Depuis la 1.9.1, la version porte aussi
`FIRST-INSTALL.pdf` et `FIRST-TIME-SETUP.pdf` (reconstruits par `build_install_pdf.py FIRST-INSTALL.md "First-time
installation"` et `… FIRST-TIME-SETUP.md "First-time setup"`).

## Rappels propres à cette édition

- **Licence** : CC BY-NC 4.0. Usage commercial non permis sans votre accord. Voir `LICENSE` et
  `NOTICE.md`, qui porte la déclaration de dérivation.
- **Contenu public** : le dépôt contient votre manuel, le cas MediBec et ses livrables. Tout ce
  qui est poussé est visible et copiable, et l'historique git le conserve. Retirez ce que vous ne
  voulez pas diffuser avant le premier push.
- **Instantané embarqué** : il incorpore des données EPSS. Les republier est une décision que vous
  prenez sciemment; `NOTICE.md` le signale. Le catalogue KEV, lui, est une œuvre du gouvernement
  américain.
- **Aucune clé d'API** ne doit se retrouver dans le dépôt. Les sources à Auth-Key (abuse.ch, OTX)
  sont déclarées mais jamais interrogées par l'outil.
- **Fraîcheur** : régénérez l'instantané embarqué s'il a plus de 90 jours avant chaque version.
