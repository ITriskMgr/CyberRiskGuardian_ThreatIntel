# Publier CyberRiskGuardian with Threat Live-feed

Édition dérivée de CyberRiskGuardian v1.1.0, qui reste inchangée. Dépôt cible :
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
3. Régression obligatoire — la base de v1.1.0 ne doit pas bouger :
   ```bash
   python3 plugins/cyberriskguardian-threatintel/skills/cyber-risk-assessment/scripts/crg_calc.py \
           examples/medibec/source/medibec30.json      # doit afficher 84 491 / 41 104
   ```
4. Vérifiez qu'aucun appel réseau n'existe dans le chemin de calcul (voir `BOOTSTRAP.md`).
5. `bash scripts/sync-project-config.sh`

## 2. Dépôt GitHub public

Le dépôt est déjà initialisé avec un premier commit et le remote configuré.

```bash
git branch -M main
git push -u origin main
git tag v1.2.0
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
