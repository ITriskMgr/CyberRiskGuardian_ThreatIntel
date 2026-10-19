# CyberRiskGuardian Desktop — Guide de l'utilisateur

**CyberRiskGuardian avec flux de menaces en direct — édition autonome pour ordinateur, version 1.7.0 (bêta) · Bêta 1.7.x**

> **Bêta 1.7.x.** Cette application est une version bêta destinée à l'enseignement, à l'exploration et à
> la validation de la méthode. Traitez chaque résultat comme une hypothèse analytique initiale et
> validez-le avant qu'il n'appuie une décision réelle.

© 2026 Marc-André Léger · CC BY-NC 4.0 — qui peut l'utiliser sans demander, et quelles situations
exigent une licence commerciale : section 10 ou **Aide → À propos → Licence**.

Ce guide couvre l'installation de l'application, son démarrage, la vérification qu'elle est digne de
confiance avant de vous fier à un chiffre qu'elle produit, la méthode qu'elle suit en treize étapes, et
chacun des écrans du menu latéral — des documents de l'organisation jusqu'à la conformité, à l'audit,
aux opérations de sécurité et au Registre partagé des risques. Chaque écran comporte, à côté de son
titre, un bouton **?** qui ouvre une courte aide et renvoie à sa section dans ce guide.

---

## 1. Ce qu'est l'édition autonome

Un seul dossier de fichiers qui s'exécute entièrement dans votre navigateur, servi depuis votre propre
ordinateur. Elle réunit, dans une seule application, tout ce qu'il faut pour mener de bout en bout une
évaluation des risques de cybersécurité fondée sur des scénarios, et pour la maintenir vivante par la
suite :

| Menu | Ce que vous obtenez |
|---|---|
| **Organisation** | Des espaces de travail pour des organisations réelles et des cas pour la classe ; des documents de contexte lus sur votre ordinateur ; le profil, l'appétit pour le risque et les actifs essentiels extraits des documents, avec une étiquette de provenance sur chaque valeur ; des documents ajoutés et extraits à tout moment ; les actifs informationnels ; la maturité et la résilience ; la réinitialisation. |
| **Évaluation des risques** | Des ICR avec historique ; les mesures de protection existantes ; un registre des scénarios, un éditeur et un générateur de scénarios en lot (y compris des amorces de scénarios issues des opérations de sécurité) ; le calculateur de risque vérifié ; le registre des risques ; des mesures d'atténuation tirées d'ISO/IEC 27002, du NIST et du CIS ; des recommandations avec un processus d'approbation. |
| **Menaces et vulnérabilités** | MITRE ATT&CK, CAPEC et CWE hors ligne ; le registre des CVE avec CISA KEV et FIRST EPSS ; les instantanés de contexte de menace et l'Échelle des preuves de menace ; des flux de menaces triés dans un bulletin hebdomadaire ; et l'**Ontologie CyberRiskGuardian** (CRGO) — une bibliothèque de scénarios de risque liés à des techniques, des faiblesses, des contrôles et des obligations de la Loi 25 du Québec, ainsi que les contextes de l'organisation, de la conformité et des opérations de sécurité. |
| **Gouvernance** | La gestion de la sécurité de l'information ; la **gestion des PSI** (bibliothèque de politiques, éditeur structuré, versions figées à l'approbation, applicabilité, prises de connaissance, non-conformités) ; la gestion de la cybersécurité (essais des contrôles, gouvernance, décisions, incidents) ; les cadres et normes ; des **registres partagés** de preuves, de mesures correctives, d'exceptions et de correspondances ; et une **revue de qualité**. |
| **Gestion de la conformité** | Sources et obligations, applicabilité juridique, programmes et référentiels, correspondances qualifiées, déclarations d'applicabilité et exigences, campagnes et déterminations appuyées par des preuves, calendrier réglementaire, soumissions, changement réglementaire, évaluation assistée par l'IA et production de rapports. |
| **Gestion de l'audit** | Charte et méthodologie, univers d'audit, plan pondéré selon le risque, missions, procédures SP 800-53A, feuilles de travail et échantillonnage, observations et constatations, réponses et suivi indépendant, rapports, qualité et indépendance, rapports SOC et éléments probants, traçabilité. |
| **Opérations de sécurité** | Un **SIEM** local (sources de télémétrie, règles de détection, couverture validée par des essais, alertes et tri, indicateurs avec TLP) et un **SOAR** local (dossiers, incidents, guides d'intervention, points d'approbation, actions consignées, simulations à blanc, leçons apprises) — alimentés par des fichiers que vous importez, jamais par un connecteur en direct. |
| **Registre partagé des risques** | Un catalogue de risques partagé entre organisations, consultable par secteur, région, taille, réglementation, thème, catégorie d'actifs et technique, avec des contributions anonymisées et une modération. |
| **Outils · Paramètres · Aide** | CVSS v4.0 (Base), budget, exportation Excel avec formules actives, assistant IA, prévisions, sauvegarde et restauration ; les paramètres (modules, journaux, IA, utilisateurs, fichiers, flux, données de simulation pour l'enseignement) ; la fenêtre Pas à pas, ce guide, À propos, un agent conversationnel d'aide, l'anglais et le français. |

La plupart des fonctionnalités sont des modules qu'un administrateur peut désactiver pour l'installation
(Paramètres → Modules), et les écrans peuvent être masqués par personne ou par groupe (Paramètres →
Utilisateurs et RACI) ; une fonctionnalité désactivée ou masquée n'apparaît tout simplement pas dans le
menu.

Trois propriétés comptent davantage que toute fonctionnalité.

**Vos données restent sur votre ordinateur, sauf les exceptions que vous déclenchez vous-même.**
L'application n'effectue aucune requête réseau de sa propre initiative — ni au démarrage, ni lorsque
vous ajoutez un document, construisez un instantané, triez un flux, calculez, faites une prévision ou
exportez. Les exceptions commencent toutes par un clic de votre part :

- L'**assistant local de téléchargement** récupère des catalogues publics (CISA KEV, FIRST EPSS, NVD,
  les flux que vous avez acceptés) *au complet* dans votre dossier de flux. Il n'envoie jamais nulle
  part votre liste de CVE, vos documents, vos scénarios ou le nom de votre client ; la jointure avec
  votre registre se fait ensuite, dans le navigateur.
- L'**IA**, lorsque vous appuyez sur *Envoyer* dans un aperçu d'IA : le texte qui vous a été montré —
  et que vous pouviez modifier —, octet pour octet, avec sa taille et sa destination indiquées, est
  transmis au fournisseur choisi pour cet espace de travail. Rien n'est envoyé automatiquement, selon
  un horaire ou en arrière-plan, et aucune IA ne se trouve dans le chemin de calcul.
- Le **Registre partagé des risques** et **Publier et partager** écrivent des paquets dans un dossier
  partagé uniquement lorsque vous partagez, anonymisés par défaut.

L'**ontologie** est lue sur votre ordinateur : au moyen de son propre serveur MCP, démarré par
l'assistant local, ou au moyen de l'instantané livré avec l'application. Ni l'un ni l'autre n'envoie
quoi que ce soit nulle part.

**Elle ne réimplémente pas les formules.** `crg.js` et `cvss4.js` constituent le moteur vérifié de la
méthode CyberRiskGuardian, contrôlé par rapport au calculateur de référence `crg_calc.py` et au paquet
Python `cvss`. Chaque chiffre de chaque écran, et chaque valeur mise en cache dans l'exportation Excel,
provient de ce moteur. L'IA, les flux, l'ontologie et le registre *proposent* ; seules les valeurs que
vous acceptez parviennent au moteur.

**Elle fait la preuve de son exactitude à chaque démarrage.** Voir la section 4.

---

## 2. Avant d'installer

| Il vous faut | Remarques |
|---|---|
| Un navigateur à jour | Chrome ou Edge pour l'application installable. Safari et Firefox l'exécutent dans un onglet. |
| Python 3 | Uniquement pour servir le dossier localement. macOS et la plupart des distributions Linux l'ont déjà. Sous Windows, installez-le à partir de [python.org](https://www.python.org/downloads/) et cochez **Add python.exe to PATH**. |
| Environ 16 Mo d'espace disque | Plus vos espaces de travail et tout instantané que vous chargez. L'instantané d'exemple fourni fait environ 1,5 Mo, l'instantané de l'ontologie environ 6,5 Mo et le paquet de simulation pour l'enseignement environ 0,1 Mo ; un instantané complet des menaces produit par `threat_snapshot.py` fait 8 Mo ou plus. |
| *Facultatif :* l'Ontologie CyberRiskGuardian v0.10.0 | Pour interroger l'ontologie au moyen de son propre serveur MCP plutôt que de l'instantané livré avec l'application : un dossier `CyberRiskGuardian-Ontology` et un Python doté des paquets `mcp`, `pyoxigraph`, `rdflib` et `jsonschema`. Section 3.5. |

Aucun compte, clé de licence, programme d'installation ni droit d'administrateur n'est requis. Rien
n'est écrit à l'extérieur du dossier et du stockage propre à votre navigateur.

---

## 3. Installer et démarrer

### 3.1 Décompresser

Décompressez `CyberRiskGuardian_Desktop_v1.7.0-beta.zip` à tout endroit où vous pouvez écrire. Gardez
le dossier intact : l'application charge ses propres fichiers par chemin relatif.

> `INSTALL.md`, dans le dossier, reprend les mêmes instructions sur une seule page, **en anglais et en
> français**, y compris l'endroit où se trouvent réellement vos espaces de travail et vos clés.

**Vous remplacez une copie antérieure de l'application ?** Décompressez dans un *nouveau* dossier à côté
de l'ancien, arrêtez l'ancien serveur si sa fenêtre de terminal est encore ouverte, et démarrez le
nouveau **sur le même port** — vos espaces de travail sont conservés par le navigateur pour l'adresse
exacte que vous utilisez, et non dans le dossier ; le même port les retrouve donc. Vos clés d'API ne
sont pas non plus dans le dossier ; elles se trouvent dans `crg-keys.json` dans le dossier de flux, et
`feeds-dir.txt` reporte ce chemin. Les lanceurs détectent une copie antérieure qui sert encore le port,
l'arrêtent et l'indiquent ; rechargez la page une fois si **Aide → À propos → Versions** n'affiche pas
`1.7.0 beta`.

### 3.2 Le démarrer

> **L'application doit être servie par `http://`. Double-cliquer sur `index.html` ne fonctionne pas.**
>
> `js/app.js` est un module ES, et tous les navigateurs bloquent les modules chargés à partir d'une URL
> `file://`. La page s'affichera, mais l'autovérification du moteur ne s'exécute jamais et le pied de
> page reste à `chargement du moteur…`.
>
> Le service est entièrement local. Les lanceurs se lient à `127.0.0.1` ; l'application n'est donc pas
> accessible depuis votre réseau, même pendant qu'elle fonctionne.

**macOS et Linux** — double-cliquez sur **`start.command`**. Si macOS refuse de l'ouvrir, cliquez sur
le fichier avec le bouton droit et choisissez **Ouvrir**, puis **Ouvrir** de nouveau. S'il s'ouvre
comme un fichier texte au lieu de s'exécuter :

```bash
cd /path/to/CyberRiskGuardian_Desktop
chmod +x start.command start.sh
```

**Windows** — double-cliquez sur **`start.bat`**.

Une fenêtre de terminal s'ouvre et votre navigateur s'ouvre sur l'application. **Laissez le terminal
ouvert pendant que vous travaillez** ; Contrôle-C l'arrête. À la main :

```bash
cd CyberRiskGuardian_Desktop
python3 serve.py 8099          # or: python3 -m http.server 8099 --bind 127.0.0.1 (no download helper)
```

Ouvrez ensuite `http://localhost:8099/`.

> **Gardez le même port.** Vos espaces de travail sont stockés par le navigateur pour l'adresse exacte
> que vous utilisez. `http://127.0.0.1:8099` et `http://localhost:8099` sont des adresses différentes
> pour le navigateur, tout comme n'importe quel autre port. Utilisez le lanceur, ou toujours la même
> adresse, et vous retrouverez toujours vos espaces de travail.

### 3.3 L'arrêter

Appuyez sur **Contrôle-C** dans la fenêtre de terminal. Fermer le navigateur n'arrête pas le serveur,
et arrêter le serveur ne ferme pas une application installée — une application installée continue de
fonctionner à partir de sa mémoire cache, sans aucun serveur.

Pour confirmer que plus rien n'écoute, sous macOS ou Linux : `lsof -ti:8099` (aucune sortie signifie
que rien ne s'exécute). Sous Windows : `netstat -ano | findstr :8099`, puis `taskkill /PID <pid> /F`.

### 3.4 L'installer comme application de bureau (recommandé)

L'application étant ouverte par `http://`, dans **Chrome**, cliquez sur l'icône d'installation à droite
de la barre d'adresse ; dans **Edge**, ☰ → **Applications** → **Installer ce site en tant
qu'application**. Vous obtenez une application fenêtrée, avec sa propre icône, qui se lance sans
terminal et fonctionne hors ligne. Après avoir remplacé le dossier par une version plus récente,
servez-le une fois de plus pour que l'application installée prenne la nouvelle mémoire cache.

### 3.5 Connecter l'ontologie (facultatif)

L'application est livrée avec un instantané de l'Ontologie CyberRiskGuardian et fonctionne sans rien
de plus. Pour interroger l'ontologie au moyen de son propre serveur MCP — le classement de référence,
le contexte de l'organisation, le renvoi des résultats, ainsi que les contextes de la conformité et des
opérations de sécurité —, l'assistant local doit trouver **CRGO v0.10.0** :

1. **Si le serveur `crgo-ontology` est enregistré dans Claude sur cet ordinateur** (Claude pour
   ordinateur → Settings → Developer → Edit Config), l'assistant local réutilise la même commande, avec
   le même Python. Faites pointer ses `args` vers le `pipeline/mcp/crgo_server.py` d'un clone v0.10.0.
2. **Si un dossier `CyberRiskGuardian-Ontology` se trouve près du dossier de l'application** — par
   exemple, tous deux dans `CyberRiskGuardian_ThreatIntel` —, il est trouvé automatiquement et démarré
   avec le Python qui exécute l'assistant local. Les clones versionnés comme
   `CyberRiskGuardian-Ontology-0.10.0` sont privilégiés, **le plus récent en premier**. Ce Python a
   besoin de `pip install "mcp>=1.2" pyoxigraph rdflib jsonschema`.
3. **Sinon**, indiquez l'interpréteur Python et le chemin de `pipeline/mcp/crgo_server.py` dans
   **Ontologie · CRGO → Connexion → Où se trouve l'ontologie**, puis **Enregistrer**.

```
git clone --branch v0.10.0 https://github.com/ITriskMgr/CyberRiskGuardian-Ontology.git CyberRiskGuardian-Ontology-0.10.0
pip install "mcp>=1.2" pyoxigraph rdflib jsonschema
```

**Ontologie · CRGO → Connexion** indique lequel des trois cas s'applique, la version de CRGO trouvée et
les contrats qu'elle prend en charge : la détermination des scénarios fonctionne avec n'importe quelle
version, le lien avec l'organisation (dss/v1) exige v0.9.1 ou une version ultérieure, et les contextes
de la conformité et des opérations de sécurité (compliance/v1, secops/v1) exigent v0.10.0. L'onglet
démarre le serveur sur demande ; le premier démarrage construit son magasin de données, en dix à vingt
secondes environ. Section 7.4.5.

---

## 4. Première exécution : vérifier le moteur avant de vous fier à un chiffre

Le bas de la barre latérale gauche doit afficher :

```
moteur vérifié · 84,491 / 41,104
```

À chaque démarrage, l'application recalcule le cas pédagogique MediBec fourni — 30 scénarios — et
compare les totaux aux chiffres que produit `crg_calc.py`. Lorsqu'ils concordent, le moteur de votre
navigateur est en accord avec l'implémentation de référence.

| Le pied de page affiche | Signification | Que faire |
|---|---|---|
| `moteur vérifié · 84,491 / 41,104` | Correct. | Poursuivez. |
| `chargement du moteur…` et il y reste | Ouvert comme fichier au lieu d'être servi. | Section 3.2. |
| `moteur manquant` | `crg.js`, `cvss4.js` ou `sample.js` ne s'est pas chargé. | Décompressez de nouveau ; gardez le dossier intact. |
| `moteur DIVERGENT` + bandeau rouge | Le moteur est en désaccord avec la référence. | **Ne vous fiez à aucun chiffre.** Restaurez une copie propre. |
| `erreur du moteur` | Une exception pendant l'autovérification. | Ouvrez la console (section 13) et signalez-la. |

---

## 5. Les espaces de travail et vos données

Un **espace de travail** contient une organisation ou un cas d'affaires : son profil, ses documents,
ses scénarios, ses initiatives, ses liens vers des menaces et des vulnérabilités, son instantané,
l'historique de ses ICR, ses décisions et son journal des révisions. Le sélecteur en haut de chaque
écran permet de passer de l'un à l'autre ; sa dernière entrée en crée un nouveau.

Le premier démarrage crée **MediBec — cas pédagogique (fictif)**, l'exemple complet de 30 scénarios.
Servez-vous-en pour apprendre les écrans ; créez votre propre espace de travail pour le travail réel. Un
espace de travail est soit une **organisation réelle**, soit un **cas d'affaires pour la classe** ;
l'exemple MediBec et les cas pour la classe sont des *cas pédagogiques*, que l'on peut recommencer
(section 7.2.4).

Les espaces de travail sont enregistrés automatiquement dans la base de données locale du navigateur
(IndexedDB) sur cet ordinateur — l'heure du dernier enregistrement est affichée en haut à droite. Ils
ne sont pas partagés avec d'autres navigateurs ou ordinateurs. **Exportez un espace de travail**
(Organisation → Espaces de travail, ou Exporter) pour le sauvegarder, le déplacer ou remettre un cas
pour la classe ; importez-le sur n'importe quel ordinateur sous Organisation → Espaces de travail →
*Importer un fichier JSON…*. Effacer les données de site du navigateur pour l'adresse de l'application
supprime les espaces de travail sur cet ordinateur.

> Le matériel confidentiel reste sur cet ordinateur, mais il demeure du matériel confidentiel sur cet
> ordinateur. Suivez les règles de votre organisation quant aux endroits où les données d'évaluation
> peuvent être conservées.

### 5.1 Versions des données : ce que vous saisissez survit aux mises à niveau

Chaque espace de travail consigne la **version des données** dans laquelle il a été enregistré, la version
de l'application qui l'a enregistré en dernier et un **journal des migrations**. Les propres
enregistrements de l'installation (préférences, utilisateurs, paramètres) et chaque fichier de sauvegarde
portent aussi une version des données. Lorsque la façon dont les données sont stockées change, une
**étape de migration** est ajoutée ; rien d'autre dans l'application ne réécrit des données plus anciennes.

- **Au démarrage, à l'importation d'un fichier d'espace de travail et à la restauration**, chaque espace
  de travail est amené à la version courante des données **sur une copie**, étape par étape. Les valeurs
  numériques ne sont jamais recalculées ni remises à l'échelle : les paramètres, les réductions, les ICR
  et les décisions sont conservés tels quels, et l'autovérification du moteur s'exécute sur le résultat.
- **L'original est conservé** sur cet ordinateur. *Sauvegarde et restauration → Versions des données et
  migrations → Télécharger la copie antérieure à la migration* le restitue sous forme de fichier d'espace
  de travail, à des fins de comparaison ou pour l'ouvrir avec l'application qui l'a écrit.
- **Une étape qui échoue laisse intact l'espace de travail stocké** : il s'ouvre en lecture seule, et le
  même écran en indique la raison.
- **Un espace de travail écrit par une application plus récente n'est jamais converti à rebours.** Il
  s'ouvre en lecture seule, avec un bandeau sur chaque écran, et rien de ce que vous modifiez n'est
  enregistré par-dessus. Un fichier de sauvegarde est refusé lorsqu'il a été écrit par une application
  plus récente, et un espace de travail plus récent contenu dans une sauvegarde n'est pas restauré.

La version courante des données est **2**. Les deux étapes sont consignées au journal de chaque espace de
travail :

| Étape | Ce qu'elle fait |
|---|---|
| 0 → 1 | Les champs qui n'étaient créés que lorsqu'un écran les utilisait pour la première fois sont présents dès le départ ; les incidents importés à partir de documents passent au registre des incidents (Gestion de la cybersécurité → Incidents) et demeurent affichés sous Organisation → Preuves ; les exceptions aux politiques reçoivent un périmètre, un approbateur et des contrôles compensatoires ; les enregistrements de gouvernance, d'audit, de gestion de la cybersécurité, du SGSI et du lien avec l'ontologie sont ajoutés, vides. |
| 1 → 2 | Les **registres partagés** sont créés. Les enregistrements de **preuves** passent, inchangés, au registre partagé des preuves (Gouvernance → Registres partagés → Preuves) ; les **exceptions aux politiques** passent, inchangées, au registre partagé des exceptions, chacune liée à sa politique. Les énoncés de politique reçoivent un identifiant stable, leur modalité restant à préciser. Des enregistrements vides de gestion de la conformité, de gestion de l'audit, de SIEM et de SOAR sont ajoutés. |

---

## 6. La méthode en treize étapes

**Processus**, le premier élément du menu, énumère les treize étapes d'une évaluation complète avec leur
état dans l'espace de travail courant (*à faire*, *en cours*, *terminé*), recommande la suivante et ouvre
le bon écran en un clic. Chaque étape indique à quoi elle sert, ce dont elle a besoin et quand elle est
terminée ; une étape comportant plusieurs exigences énumère chacune avec son propre état et l'écran qui
permet de la régler ; des *Conseils* se déploient sous celle-ci. **Imprimer la liste de contrôle** produit
une liste à cocher qui indique, pour chaque étape et chaque ligne directrice, où elle se déroule. En mode
multiutilisateur, chaque étape indique aussi qui est Responsable (R) et Approbateur (A).

| # | Étape | Terminée lorsque | Écrans |
|---|---|---|---|
| 1 | Configurer l'espace de travail | L'espace de travail a un nom d'organisation et au moins un document de contexte. | Espaces de travail, Documents de contexte |
| 2 | Décrire le contexte et l'appétit pour le risque | Au moins 8 des 12 champs de contexte sont remplis, l'appétit a une justification et le budget TI est saisi. | Profil et appétit, Mesures de protection existantes, Maturité et résilience |
| 3 | Repérer les actifs essentiels et les actifs informationnels | Au moins 3 actifs essentiels ou 5 actifs informationnels, avec responsables et classification. | Actifs essentiels, Actifs informationnels |
| 4 | Importer les autres informations des documents | Chaque cible cochée dans le plan d'importation a été revue au moins une fois. | Importer des documents, Documents de contexte |
| 5 | Recueillir les menaces et vulnérabilités | Un instantané du contexte de menace est chargé et le registre des vulnérabilités contient les CVE exposées de l'organisation. | Menaces · ATT&CK, Vulnérabilités · CVE/CWE, Flux de menaces et réseaux sociaux, Contexte de menace |
| 6 | Élaborer des scénarios de risque | Au moins 10 scénarios au registre (20 candidats, les 10 plus importants conservés). | Scénarios en lot, Registre des scénarios, Éditeur de scénarios, Suggérer des liens de vulnérabilité |
| 7 | Quantifier chaque scénario | 80 % des paramètres des scénarios inclus sont accompagnés d'une justification. | Éditeur de scénarios, CVSS v4.0, Prévisions |
| 8 | Évaluer par rapport à la tolérance | Les scénarios inclus se calculent sans erreur et chacun a une décision de la direction consignée. | Calculateur de risque, Tableau de bord des ICR, Registre des risques |
| 9 | Sélectionner des mesures d'atténuation | Chaque scénario au-dessus de la tolérance est couvert par au moins une mesure. | Atténuation des risques |
| 10 | Recommander et approuver | Au moins une recommandation est approuvée et chaque risque a une décision de traitement. | Recommandations, Registre des risques |
| 11 | Aligner le budget | L'année budgétaire est remplie et les initiatives sont réparties. | Budget |
| 12 | Surveiller avec des ICR | Au moins une mesure est consignée. | Tableau de bord des ICR, Prévisions |
| 13 | Produire des rapports, démontrer la conformité et partager | Un cadre de conformité est évalué, et une politique de sécurité est publiée ou des risques ont été partagés. | Exporter · Excel, Gestion de la conformité, Gestion des PSI, Cadres et normes, Registre partagé des risques, Publier et partager |

**Lignes directrices qui simplifient l'évaluation** — chacune est détaillée dans la section suivante, avec les écrans, les étapes et le moment où elle est terminée ; le même texte figure dans la page Processus (ouvrez une ligne directrice), dans la fenêtre Pas à pas et dans la liste de contrôle imprimable.

1. **Partir des documents.** Créez l'espace de travail avec tous les documents du cas et laissez « Extraire des documents » proposer le profil et les actifs essentiels. Acceptez, modifiez ou rejetez chaque valeur, puis enregistrez.
2. **Résolvez d'abord les valeurs UNKNOWN.** Les valeurs extraites sont étiquetées FACT, INFERENCE, ASSUMPTION, EXTERNAL ou UNKNOWN. Les éléments UNKNOWN sont les renseignements qui restent à recueillir ; les valeurs ASSUMPTION et EXTERNAL doivent être validées par l'organisation.
3. **En générer 20, en garder 10.** Dans Scénarios par lot, générez une vingtaine de candidats (règles ou IA), révisez-les dans la grille et conservez les 10 plus importants au registre. Dix est le point de départ ; le nombre augmente avec la maturité de l'organisation.
4. **Consulter l'ontologie avant d'écrire à partir de zéro.** L'ontologie CyberRiskGuardian contient des scénarios déjà reliés à ATT&CK, à des faiblesses, à des contrôles et à des obligations de la Loi 25 du Québec. Demandez-lui les scénarios qui conviennent à l'organisation, gardez ceux qui sont pertinents et écrivez les autres vous-même.
5. **Rédigez des chaînes causales, pas des noms de menaces.** Source de menace → faiblesse → actif → événement → conséquence. « Rançongiciel » à lui seul n'est pas un scénario. L'IA peut ébaucher la chaîne ; vous l'acceptez champ par champ.
6. **Consignez ce qui vous protège déjà, puis mesurez la résilience qui en résulte.** Une analyse sans relevé des contrôles existants doit deviner θ. Inventoriez ce qui est en vigueur, notez-le selon les six capacités qui définissent θ, et laissez les deux instruments diverger ouvertement.
7. **Soyez honnête quant à la confiance.** Donnez à chaque paramètre une justification et un niveau de confiance ; Prévisions transforme une faible confiance en intervalles plus larges.
8. **Laisser le moteur calculer.** Le risque résiduel et le ratio proviennent du moteur vérifié ; l'IA et les flux proposent, ils ne modifient jamais un score.
9. **Traiter d'abord ce qui dépasse la tolérance.** Utilisez Atténuation des risques → Propositions sur les scénarios au-dessus de la tolérance ; les mesures partagées sont comptées une seule fois.
10. **Obtenir les approbations de la personne redevable.** Les recommandations et les acceptations de risque sont approuvées par la personne qui approuve (RACI « A »).
11. **Tenir un coût de base et un budget.** Saisissez le budget TI, les dépenses actuelles en cybersécurité et le coût de base (fonctionnement) ; l'écran Budget indique où se situe chaque option.
12. **Enregistrer les ICR à chaque revue.** Quatre mesures suffisent pour que la projection de l'ICR indique si un seuil sera franchi.
13. **Anonymiser ce qui sort.** Le registre partagé des risques et Publier et partager anonymisent par défaut ; un cas de classe est étiqueté fictif automatiquement.
14. **Apprendre d'organisations comme la vôtre, et redonner.** Le registre partagé des risques rassemble des fiches de risque contribuées par d'autres organisations, classées par secteur, région, taille, réglementation, thème, catégorie d'actif et technique. Consultez-le avant de finaliser vos scénarios ; contribuez les vôtres, anonymisés.
15. **Garder les politiques vivantes.** Une politique qui n'est jamais revue cesse de décrire ce que fait l'organisation. Rédigez les politiques à partir des gabarits, faites-les approuver, publiez-les, revoyez-les selon le calendrier et consignez chaque dérogation.
16. **Évaluer la conformité avec des preuves.** Un statut de conformité est une affirmation ; ce sont les preuves qui la rendent vraie. Inscrivez les exigences applicables, laissez les règles ou l'IA proposer un statut à partir des preuves, acceptez ce que vous pouvez défendre et produisez le rapport.
17. **Savoir quelles lois s'appliquent — et dire ce qui n'est pas connu.** Décrivez l'organisation dans les termes de l'ontologie et laissez l'évaluateur de CRGO indiquer quels instruments s'appliquent. « Potentiellement applicable » exige une personne qualifiée ; « inconnu » signifie qu'un fait manque — une lacune de preuve, jamais « non applicable ». Rien de ceci ne constitue un avis juridique.
18. **Tester les contrôles de façon indépendante et garder les conflits en vue.** Un contrôle ne vaut que par les éléments probants démontrant qu'il fonctionne. Consignez les essais par ligne de défense et par aspect ; lorsqu'un résultat indépendant contredit l'autoévaluation de la direction, les deux restent visibles jusqu'à ce qu'une personne tranche.
19. **Auditer en fonction de critères et assurer un suivi indépendant.** Une constatation d'audit énonce le critère, le constat, la cause et l'effet, avec des éléments probants. Elle n'est fermée qu'après qu'un suivi indépendant a vérifié la mesure corrective.
20. **Décider en vertu des pouvoirs délégués, et garder les exceptions honnêtes.** Accepter un risque, financer un traitement ou accorder une exception à une politique est une décision de la direction, prise par une personne nommée en vertu d'une délégation valide à cette date. L'application rédige ; les personnes décident. Une exception ne déroge jamais à une loi et cesse d'atténuer le risque à son expiration.
21. **Lire le contexte de l'ontologie, ne renvoyer que des propositions.** Au moyen du contrat dss/v1, l'ontologie renvoie le contexte de l'organisation pour un scénario — obligations, applicabilité, éléments probants des contrôles par ligne, constatations ouvertes — et consigne les résultats de cette application comme propositions. Elle ne calcule jamais un risque, et un renvoi des résultats n'est jamais une approbation.
22. **Effectuer la revue de qualité avant que quoi que ce soit ne sorte.** Avant un rapport ou un renvoi des résultats, vérifiez que rien n'est qualifié d'approuvé, de conforme ou de probable sans une personne, des éléments probants ou le bon type de données à l'appui.

### Les lignes directrices en détail — une évaluation complète, simplement

Les libellés entre guillemets sont les noms exacts des boutons, onglets et options des écrans ; ils sont vérifiés par rapport à l'application à chaque compilation (`tools/label_check.py`).

#### 1. Partir des documents

Créez l'espace de travail avec tous les documents du cas et laissez « Extraire des documents » proposer le profil et les actifs essentiels. Acceptez, modifiez ou rejetez chaque valeur, puis enregistrez.

*Où :* Organisation → Espaces de travail → Nouvel espace de travail ; Organisation → Importer des documents

1. Saisissez le nom de l'espace de travail ; choisissez « Organisation réelle » ou « Cas d'affaires pour la classe » ; pour l'enseignement, cochez « Cas pédagogique utilisé à des fins de formation ».
2. Déposez tous les documents du cas (Word, PDF, Excel, PowerPoint, texte) dans la zone des documents.
3. Cochez « Extraire le profil et l'appétit de ces documents après la création », « Puis extraire les actifs essentiels » et, pour aller plus loin, « Puis importer d'autres éléments des documents » ; cliquez sur « Créer l'espace de travail ».
4. Choisissez « Utiliser l'IA (aperçu avant l'envoi) » — vous voyez le texte exact avant tout envoi — ou « Règles seulement (sans IA, hors ligne) ».
5. Dans la revue, modifiez toute valeur, cochez celles à conserver et cliquez sur « Mettre les valeurs cochées dans le formulaire » ; vérifiez les champs et cliquez sur « Enregistrer ».
6. Examinez les actifs essentiels et cliquez sur « Ajouter les actifs essentiels cochés ».
7. Dans l'aperçu, modifiez au besoin le contenu envoyé — retirez ce qui ne doit pas sortir, ajoutez du contexte — et choisissez la créativité de la réponse : « Stricte » s'en tient aux faits documentés, « Créative » propose aussi ce qu'une organisation comme celle-ci possède habituellement, étiqueté ASSUMPTION pour que vous le vérifiiez.
8. Ouvrez ensuite Organisation → « Importer des documents » (étape 4 du processus) : cochez les cibles (actifs informationnels, BIA, tiers, contrôles existants, conformité, incidents, faiblesses, scénarios candidats, preuves des paramètres, risques, budget, KRI, personnes et rôles, classe), cliquez sur « Démarrer l'importation » et, pour chaque cible, cochez puis cliquez sur « Ajouter les cochés ».
9. De nouveaux documents plus tard : déposez-les sur « Importer des documents ». Ils sont sélectionnés seuls, de sorte que seuls eux sont lus ; cochez ce qu'il faut extraire et cliquez sur « Démarrer l'importation ». Les valeurs existantes sont conservées, sauf si vous cochez la proposition qui les remplace.

*Terminé lorsque :* Les étapes 1 à 4 du processus indiquent Fait : un nom et au moins un document ; au moins 8 des 12 champs de contexte, une justification de l'appétit et le budget TI ; les actifs essentiels ; chaque cible du plan d'importation revue.

#### 2. Résolvez d'abord les valeurs UNKNOWN

Les valeurs extraites sont étiquetées FACT, INFERENCE, ASSUMPTION, EXTERNAL ou UNKNOWN. Les éléments UNKNOWN sont les renseignements qui restent à recueillir ; les valeurs ASSUMPTION et EXTERNAL doivent être validées par l'organisation.

*Où :* Organisation → Profil et appétit (et Éléments probants pour les enregistrements importés)

1. Lisez l'étiquette colorée à côté de chaque libellé de champ.
2. UNKNOWN : recueillez l'information, saisissez-la et cliquez sur « Enregistrer ».
3. ASSUMPTION et EXTERNAL : faites-les valider par l'organisation ; survolez l'étiquette pour voir la source (document ou page Web). Un astérisque après l'étiquette signifie que la valeur a été modifiée après l'extraction.
4. Lorsque la direction n'a pas approuvé d'appétit, utilisez l'« Estimateur d'appétit » au bas de l'onglet ; son résultat est indiqué comme une estimation analytique.

*Terminé lorsque :* Aucune étiquette UNKNOWN ne subsiste sur les champs sur lesquels repose l'évaluation.

#### 3. En générer 20, en garder 10

Dans Scénarios par lot, générez une vingtaine de candidats (règles ou IA), révisez-les dans la grille et conservez les 10 plus importants au registre. Dix est le point de départ ; le nombre augmente avec la maturité de l'organisation.

*Où :* Scénarios en lot

1. Règles : dans « Modèles de menace × actifs », cochez les modèles, puis « Cocher les joyaux de la couronne + les 5 plus critiques », choisissez les sources de menace, réglez « Nombre de candidats » à 20 et cliquez sur « Générer des candidats ». Laissez « Varier les modèles et les actifs » coché pour que les candidats se répartissent sur la grille au lieu de répéter une seule menace ; « Rebrasser » en tire un ensemble différent et le germe le reproduit.
2. IA : sous « Proposer avec l'IA », indiquez le nombre, ajoutez une orientation au besoin, laissez « Inclure le texte des documents de contexte » coché et cliquez sur « Proposer des candidats » (aperçu d'abord).
3. Également disponibles : « À partir de MITRE ATT&CK », « À partir de CVE », « À partir de CWE » et les scénarios candidats importés des documents (marqués [Docs]).
4. Dans la grille, modifiez les noms, les énoncés et les paramètres, cochez les 10 plus importants et cliquez sur « Ajouter … sélectionnés au registre ». Dix est le nombre de départ recommandé, pas un plafond : portez-en davantage à mesure que la maturité en cybersécurité de l'organisation augmente et qu'elle peut tenir à jour plus de scénarios — Maturité et résilience suggère un nombre d'après le niveau que vous avez mesuré, et explique pourquoi.
5. Dans le registre des scénarios, les cases à cocher incluent ou excluent des scénarios des totaux.

*Terminé lorsque :* L'étape 6 du processus indique Fait : au moins 10 scénarios au registre.

#### 4. Consulter l'ontologie avant d'écrire à partir de zéro

L'ontologie CyberRiskGuardian contient des scénarios déjà reliés à ATT&CK, à des faiblesses, à des contrôles et à des obligations de la Loi 25 du Québec. Demandez-lui les scénarios qui conviennent à l'organisation, gardez ceux qui sont pertinents et écrivez les autres vous-même.

*Où :* Ontologie · CRGO → Suggérer des scénarios ; Scénarios en lot ; Éditeur de scénarios

1. Ontologie · CRGO → « Suggérer des scénarios » : vérifiez le secteur, les techniques ATT&CK et les mots-clés tirés de l'espace de travail, cochez les catégories d'actifs présentes et les thèmes préoccupants, puis cliquez sur « Suggérer des scénarios ».
2. Lisez « Thèmes sans scénario » : les thèmes sans scénario dans l'ontologie sont ceux à écrire vous-même.
3. Cochez les suggestions qui conviennent, gardez « Utiliser les valeurs a priori de l'ontologie comme valeurs de départ » si vous voulez un point de départ étalonné, et cliquez sur « Ajouter les cochés aux scénarios en lot » ; revoyez-les et conservez-les dans la grille comme tout autre candidat.
4. Pour un scénario que vous avez écrit vous-même : Éditeur de scénarios → « Trouver des scénarios semblables dans l'ontologie » pour le relier, et « Contrôles pour ses techniques » pour une liste de départ de contrôles.
5. Les valeurs a priori de l'ontologie ne sont pas des preuves organisationnelles : réestimez chaque paramètre avec l'organisation. L'onglet Connexion indique si la réponse vient du serveur de l'ontologie ou de l'instantané fourni avec l'application.

*Terminé lorsque :* Le registre couvre les thèmes pertinents de l'ontologie, et les scénarios qui en sont tirés sont réestimés pour cette organisation.

#### 5. Rédigez des chaînes causales, pas des noms de menaces

Source de menace → faiblesse → actif → événement → conséquence. « Rançongiciel » à lui seul n'est pas un scénario. L'IA peut ébaucher la chaîne ; vous l'acceptez champ par champ.

*Où :* Éditeur de scénario → Chaîne causale

1. Rédigez l'énoncé en une ou deux phrases : source de menace → faiblesse → actif → événement → conséquence.
2. Ou laissez l'IA l'ébaucher : dans la carte Chaîne causale, cliquez sur « L'ébaucher avec l'IA… », lisez l'aperçu de ce qui serait exactement envoyé, puis envoyez. Un scénario à la fois — une chaîne est une argumentation au sujet de cette organisation, pas un traitement par lot.
3. Dans la révision, chaque champ proposé est affiché à côté de ce que le scénario contient actuellement. Les champs vides sont cochés pour vous ; un champ qui remplacerait du texte existant reste décoché et l'indique. Modifiez n'importe quelle ébauche sur place, puis cliquez sur « Appliquer les champs cochés » — rien n'est écrit avant, et ce que vous acceptez est consigné au journal des révisions.
4. Remplissez ou vérifiez la source de menace, l'événement déclencheur, les vulnérabilités ou conditions prédisposantes, les actifs, les processus, les contrôles existants, la séquence et les conséquences.
5. Liez des techniques ATT&CK, des CWE et des CVE ; « Suggérer des vulnérabilités pour ce scénario… » ouvre Vulnérabilités → Suggérer des liens pour ce scénario.

*Terminé lorsque :* Chaque scénario du registre se lit comme une chaîne causale complète.

#### 6. Consignez ce qui vous protège déjà, puis mesurez la résilience qui en résulte

Une analyse sans relevé des contrôles existants doit deviner θ. Inventoriez ce qui est en vigueur, notez-le selon les six capacités qui définissent θ, et laissez les deux instruments diverger ouvertement.

*Où :* Mesures de protection existantes ; Maturité et résilience

1. Mesures de protection existantes → « Ajouter une mesure de protection » : nommez-la, fixez l'état, nommez un responsable imputable, et énoncez la portée ainsi que ce qu'elle ne couvre pas.
2. Sous « Contribution à la résilience », notez la mesure pour chaque capacité. Une mesure marquée « Planifiée » ne compte pour rien avant d'être en fonction.
3. Consignez la date du dernier test et son résultat ; une absence de preuve depuis douze mois est signalée comme périmée.
4. Si vos contrôles existants sont encore dans le plan d'atténuation, « Récupérer des contrôles » les énumère et « Verser les éléments cochés à l'inventaire » déplace ceux que vous cochez.
5. Mesures de protection existantes → « Couverture de la résilience » montre d'où vient la résilience et propose un θ. Rien ne change avant que vous l'appliquiez à un scénario.
6. Maturité et résilience → « Maturité (CSF 2.0) » : notez les catégories qui comptent, par rapport à une cible. Laissez une catégorie vide plutôt que de la deviner. « Remplir les non notées d'après l'inventaire » propose un niveau là où des mesures pointent vers une catégorie du CSF.
7. Maturité et résilience → « Résilience (θ) » : répondez aux dix-huit questions. « Inconnu » est une vraie réponse et elle est exclue du score.
8. Maturité et résilience → « Les deux lectures » : lisez l'écart entre le questionnaire et l'inventaire. Le θ le plus bas est proposé ; appliquez-le par scénario.
9. « Enregistrer » conserve une entrée datée pour que la prochaine évaluation puisse être comparée à celle-ci.

*Terminé lorsque :* L'inventaire couvre ce qui est en vigueur, et le θ de chaque scénario important provient de l'évaluation plutôt que de la mémoire.

#### 7. Soyez honnête quant à la confiance

Donnez à chaque paramètre une justification et un niveau de confiance ; Prévisions transforme une faible confiance en intervalles plus larges.

*Où :* Éditeur de scénarios → les six paramètres ; Prévisions

1. Pour chacun des six paramètres, indiquez la valeur, une justification, les éléments probants et une confiance (Élevée, Moyenne, Faible). Les éléments probants importés des documents s'ajoutent à ces champs, jamais comme un nombre.
2. Prévisions → « Plages de paramètres » → « Proposer des plages là où aucune n'est définie » (Faible ±0.15, Moyenne ±0.10, Élevée ±0.05), puis « Monte-Carlo » → « Lancer la prévision ».
3. Facultatif : Assistant IA → « Critique des paramètres » signale la confiance que les éléments probants n'appuient pas.

*Terminé lorsque :* L'étape 7 du processus indique Fait : 80 % des paramètres des scénarios inclus portent une justification.

#### 8. Laisser le moteur calculer

Le risque résiduel et le ratio proviennent du moteur vérifié ; l'IA et les flux proposent, ils ne modifient jamais un score.

*Où :* Calculateur de risque ; pied de page

1. Vérifiez que le pied de page indique « moteur vérifié · 84,491 / 41,104 » à chaque démarrage.
2. Lisez le risque estimé, toléré, atténué et résiduel, le ratio et sa bande dans le calculateur de risque.
3. Seules les propositions acceptées modifient une valeur ; Contexte des menaces → « Changements proposés de Pb(ψ,A) » est la seule voie entre le renseignement sur les menaces et une note, pour les CVE exposés seulement.

*Terminé lorsque :* Les chiffres que vous rapportez proviennent du calculateur de risque.

#### 9. Traiter d'abord ce qui dépasse la tolérance

Utilisez Atténuation des risques → Propositions sur les scénarios au-dessus de la tolérance ; les mesures partagées sont comptées une seule fois.

*Où :* Recommandations → Besoin de traitement ; Atténuation des risques

1. Recommandations → « Besoin de traitement » : le verdict par rapport à la tolérance et un objectif de traitement par scénario.
2. Atténuation des risques → « Propositions » : cochez les scénarios au-dessus de la tolérance et cliquez sur « Ajouter les propositions cochées au plan » (ou choisissez des contrôles dans « Catalogue de contrôles »). Les contrôles existants importés des documents y figurent déjà comme mis en œuvre, avec des réductions nulles tant que vous ne les définissez pas.
3. « Plan d'atténuation » : définissez le coût et les réductions de vraisemblance / d'impact ; cochez les mesures à mettre en œuvre et cliquez sur « → Nouvelle ébauche de recommandation ».
4. Une mesure couvrant plusieurs scénarios n'est comptée qu'une fois — voir Recommandations → « Contrôles partagés ».

*Terminé lorsque :* L'étape 9 du processus indique Fait : chaque scénario au-dessus de la tolérance a au moins une mesure.

#### 10. Obtenir les approbations de la personne redevable

Les recommandations et les acceptations de risque sont approuvées par la personne qui approuve (RACI « A »).

*Où :* Recommandations → Recommandations ; Registre des risques

1. Recommandations → « Recommandations » : faites passer l'ébauche par Brouillon → En revue → Approuvé, avec l'approbateur et une note ; l'approbation fige les chiffres.
2. Registre des risques → le risque → « Acceptation formelle » (« Accepté par », « Justification, conditions, référence d'approbation »).
3. En mode multi-utilisateur (Paramètres → « Utilisateurs et RACI »), seul A à l'étape 10, ou un administrateur, approuve et accepte ; l'approbation d'une mesure exige A à l'étape 9. « Accès aux menus par groupe et par compte utilisateur » peut restreindre ou ouvrir davantage les écrans. « Changer d'utilisateur » se trouve dans la barre supérieure.

*Terminé lorsque :* L'étape 10 du processus indique Fait : au moins une recommandation approuvée et chaque risque a une décision de traitement.

#### 11. Tenir un coût de base et un budget

Saisissez le budget TI, les dépenses actuelles en cybersécurité et le coût de base (fonctionnement) ; l'écran Budget indique où se situe chaque option.

*Où :* Organisation → Profil et appétit (en bas) ; Budget

1. Saisissez « Budget TI total (salaires inclus) », « Budget de cybersécurité (dépenses actuelles) » et « Coût de base (fonctionnement) de la sécurité », puis « Enregistrer ».
2. Budget : renseignez l'année budgétaire et répartissez les initiatives sur un maximum de trois ans ; les projets importés des documents figurent déjà comme initiatives.
3. Le graphique à bandes place chaque option de financement entre aversion au risque (4 % des TI), neutralité (7,8 %) et recherche du risque (12 %).

*Terminé lorsque :* L'étape 11 du processus indique Fait : l'année budgétaire est remplie et les initiatives sont réparties.

#### 12. Enregistrer les ICR à chaque revue

Quatre mesures suffisent pour que la projection de l'ICR indique si un seuil sera franchi.

*Où :* Tableau de bord des ICR ; Prévisions → Projections des ICR

1. Tableau de bord des ICR : « Enregistrer une mesure », ou « Enregistrer les valeurs calculées et saisies » pour tout capter d'un coup. Les indicateurs importés des documents constituent le premier relevé.
2. Prévisions → « Projections des ICR » : à partir de 4 relevés, la tendance avec une bande de 95 % et l'indication d'un éventuel dépassement de seuil.

*Terminé lorsque :* L'étape 12 du processus indique Fait : au moins une mesure consignée.

#### 13. Anonymiser ce qui sort

Le registre partagé des risques et Publier et partager anonymisent par défaut ; un cas de classe est étiqueté fictif automatiquement.

*Où :* Registre partagé des risques → Contribuer des risques ; Publier et partager → Publier un paquet ; Paramètres → IA — locale et distante

1. Registre partagé des risques → « Contribuer des risques » : l'anonymisation est activée par défaut ; la désactiver demande une confirmation et les fiches indiquent qu'elles ne sont pas anonymisées.
2. Publier et partager → « Publier un paquet » : choisissez la portée et le format, cochez « Anonymiser ce paquet », lisez « Vérifiez ces éléments avant de publier », puis « Publier dans le registre partagé ».
3. Les cas de classe et les cas pédagogiques sont indiqués comme fictifs dans les exportations et le classeur.
4. Pour l'IA : Paramètres → IA — locale et distante → « Anonymiser avant l'envoi », ou « Appliquer l'anonymiseur » dans l'aperçu d'une seule requête — où vous pouvez aussi modifier le contenu envoyé avant qu'il parte.

*Terminé lorsque :* Rien d'identifiant ne quitte l'ordinateur sans une décision.

#### 14. Apprendre d'organisations comme la vôtre, et redonner

Le registre partagé des risques rassemble des fiches de risque contribuées par d'autres organisations, classées par secteur, région, taille, réglementation, thème, catégorie d'actif et technique. Consultez-le avant de finaliser vos scénarios ; contribuez les vôtres, anonymisés.

*Où :* Registre partagé des risques → Parcourir et rechercher ; Contribuer des risques ; Modération

1. Registre partagé des risques → « Paramètres du registre » : définissez le dossier partagé du registre (un dossier synchronisé avec Drive, OneDrive ou SharePoint) et un alias de contributeur, puis « Enregistrer ».
2. « Parcourir et rechercher » → « Lire le dossier partagé », puis « Organisations comme la mienne » pour filtrer selon votre secteur et votre pays ; cochez « Fiches modérées seulement » pour le catalogue validé.
3. Cochez les fiches pertinentes et cliquez sur « Utiliser les fiches cochées dans cet espace de travail » : elles vont aux Scénarios en lot, où chaque valeur est réestimée pour cette organisation.
4. Pour contribuer (administrateur, ou RACI « A » à l'étape 13) : « Contribuer des risques » → cochez des scénarios, vérifiez le catalogue, gardez « Anonymiser avant de partager (activé par défaut) » coché, lisez l'aperçu et cliquez sur « Partager dans le registre ».
5. Un modérateur approuve ou rejette les nouvelles fiches sous « Modération » et publie le paquet validé.

*Terminé lorsque :* Les scénarios reflètent ce que des pairs ont observé, et ce que vous partagez part anonymisé.

#### 15. Garder les politiques vivantes

Une politique qui n'est jamais revue cesse de décrire ce que fait l'organisation. Rédigez les politiques à partir des gabarits, faites-les approuver, publiez-les, revoyez-les selon le calendrier et consignez chaque dérogation.

*Où :* Politiques de sécurité (PSI) → Politiques ; Éditeur de politiques ; Non-conformités ; Revues et approbations

1. Politiques de sécurité (PSI) → « Créer à partir du gabarit » (ou « L'ébaucher avec l'IA… », ou « Créer tout le jeu de politiques en brouillons »).
2. Éditeur de politiques : adaptez les énoncés et leurs contrôles, nommez le responsable et l'approbateur, puis « Soumettre pour revue », « Approuver » (RACI « A » à l'étape 13 ou un administrateur) et « Publier ».
3. Une politique publiée est figée : « Commencer une nouvelle version » ouvre un brouillon et conserve le texte publié dans l'historique.
4. Non-conformités → « Consigner » : chaque dérogation constatée par un audit, un incident ou la surveillance, avec sa gravité, son responsable, sa mesure corrective et son échéance ; une dérogation acceptée devient une exception avec une date d'expiration et le nom de la personne qui accepte le risque. « En faire un risque » l'ajoute au registre des risques.
5. « Revues et approbations » liste ce qui attend une approbation et ce dont la revue est due.

*Terminé lorsque :* Chaque politique en vigueur est publiée, dans son délai de revue, et chaque dérogation ouverte a un responsable et une date.

#### 16. Évaluer la conformité avec des preuves

Un statut de conformité est une affirmation ; ce sont les preuves qui la rendent vraie. Inscrivez les exigences applicables, laissez les règles ou l'IA proposer un statut à partir des preuves, acceptez ce que vous pouvez défendre et produisez le rapport.

*Où :* Conformité → Exigences ; Évaluation assistée par l'IA ; Rapports

1. Conformité → « Cadres et listes de contrôle » : choisissez les cadres suivis et remplissez la déclaration d'applicabilité.
2. « Exigences » : ajoutez les vôtres — lois, contrats, normes — ou « Ajouter les obligations de la Loi 25 et du R-22.1 » de l'ontologie et « Ajouter les énoncés des politiques publiées ».
3. « Évaluation assistée par l'IA » : choisissez la portée, la méthode — Règles (hors ligne) ou IA (aperçu d'abord) — et cliquez sur « Proposer » ; modifiez les preuves et cliquez sur « Appliquer les propositions cochées ».
4. « Rapports » : « Enregistrer un instantané » à chaque revue, puis « Rapport de conformité complet (.md) » ou « Rapport imprimable ».

*Terminé lorsque :* Chaque exigence applicable a un statut et les preuves qui le soutiennent, et le rapport est classé.

#### 17. Savoir quelles lois s'appliquent — et dire ce qui n'est pas connu

Décrivez l'organisation dans les termes de l'ontologie et laissez l'évaluateur de CRGO indiquer quels instruments s'appliquent. « Potentiellement applicable » exige une personne qualifiée ; « inconnu » signifie qu'un fait manque — une lacune de preuve, jamais « non applicable ». Rien de ceci ne constitue un avis juridique.

*Où :* Conformité → Applicabilité juridique ; Déterminations

1. Conformité → « Applicabilité juridique » : cochez le type d'organisation, les lieux où elle est établie, offre des services ou surveille des comportements, ajoutez ses activités de traitement avec leurs catégories de données, et cochez ce que le profil énumère de façon complète.
2. « Évaluer dans le navigateur » (ou « Évaluer avec CRGO (assistant local) ») : lisez les conditions non résolues de chaque instrument inconnu et recueillez les faits manquants.
3. « Déterminations » : consignez la conformité à chaque disposition avec ses éléments probants, ou la lacune de preuve. Un contrôle qui appuie une obligation ne constitue pas la conformité.

*Terminé lorsque :* Chaque instrument est applicable, non applicable, ou signalé pour une revue par une personne qualifiée ou comme lacune de preuve, et chaque disposition touchée par les scénarios a une détermination.

#### 18. Tester les contrôles de façon indépendante et garder les conflits en vue

Un contrôle ne vaut que par les éléments probants démontrant qu'il fonctionne. Consignez les essais par ligne de défense et par aspect ; lorsqu'un résultat indépendant contredit l'autoévaluation de la direction, les deux restent visibles jusqu'à ce qu'une personne tranche.

*Où :* Gestion de la cybersécurité → Essais des contrôles ; Éditeur de scénarios

1. Gestion de la cybersécurité → « Essais des contrôles » → « Ajouter » : le contrôle soumis à l'essai, la date, la ligne d'évaluation, l'aspect (conception, mise en œuvre, fonctionnement) et le résultat ; pour l'efficacité du fonctionnement, la période, la population, l'échantillon et les écarts.
2. « Éléments probants des contrôles par ligne de défense » présente le dernier résultat de chaque ligne, les constatations ouvertes et les conflits.
3. Dans l'éditeur de scénarios, « Contexte de l'organisation et éléments probants des contrôles » présente les mêmes éléments probants pour les contrôles du scénario : utilisez-les dans la justification de θ et des réductions.

*Terminé lorsque :* Les contrôles sur lesquels reposent les scénarios ont été soumis à des essais par une ligne indépendante, et aucun conflit ne reste non résolu.

#### 19. Auditer en fonction de critères et assurer un suivi indépendant

Une constatation d'audit énonce le critère, le constat, la cause et l'effet, avec des éléments probants. Elle n'est fermée qu'après qu'un suivi indépendant a vérifié la mesure corrective.

*Où :* Gestion de l'audit → Missions ; Programmes · SP 800-53A ; Constatations ; Rapports SOC et éléments probants

1. Gestion de l'audit → « Programmes · SP 800-53A » : consultez les objectifs d'évaluation d'un contrôle, ou « Planifier une mission avec ce programme » (les programmes sont illustratifs).
2. « Missions » → « Procédures » : chargez ou rédigez les procédures, consignez leurs résultats, l'échantillon et les écarts, puis « Consigner une constatation » lorsqu'une exception a été relevée.
3. « Constatations » : remplissez le critère, le constat, la cause, l'effet et l'importance, la réponse de la direction et la mesure corrective ; ne fermez qu'avec un suivi indépendant.
4. « Rapports SOC et éléments probants » : consignez les rapports d'assurance des organisations de services avec leurs exceptions et leurs contrôles complémentaires attendus de l'entité utilisatrice (CUEC), ainsi que le registre des éléments probants avec les dates de validité.

*Terminé lorsque :* Chaque constatation a un responsable, une date d'échéance et une réponse, et les constatations fermées ont fait l'objet d'un suivi indépendant.

#### 20. Décider en vertu des pouvoirs délégués, et garder les exceptions honnêtes

Accepter un risque, financer un traitement ou accorder une exception à une politique est une décision de la direction, prise par une personne nommée en vertu d'une délégation valide à cette date. L'application rédige ; les personnes décident. Une exception ne déroge jamais à une loi et cesse d'atténuer le risque à son expiration.

*Où :* Gestion de la cybersécurité → Gouvernance ; Décisions ; Gestion de la sécurité de l'information → Exceptions aux politiques

1. Gestion de la cybersécurité → « Gouvernance » : les organes de gouvernance, les rôles par ligne, et les délégations de pouvoirs avec leur portée et leurs dates.
2. « Décisions » → « Rédiger des fiches de décision pour les scénarios au-delà de la tolérance », puis laissez le décideur consigner la décision en vertu d'une délégation valide.
3. Gestion de la sécurité de l'information → « Exceptions aux politiques » : périmètre, approbateur, contrôles compensatoires, expiration et scénarios qui comptent sur chacune.

*Terminé lorsque :* Chaque risque supérieur à la tolérance a une fiche de décision établie par une personne ayant un pouvoir valide, et aucun scénario ne compte sur une exception expirée.

#### 21. Lire le contexte de l'ontologie, ne renvoyer que des propositions

Au moyen du contrat dss/v1, l'ontologie renvoie le contexte de l'organisation pour un scénario — obligations, applicabilité, éléments probants des contrôles par ligne, constatations ouvertes — et consigne les résultats de cette application comme propositions. Elle ne calcule jamais un risque, et un renvoi des résultats n'est jamais une approbation.

*Où :* Ontologie · CRGO → Lien avec l'organisation ; Connexion

1. Ontologie · CRGO → « Connexion » : le serveur doit être CRGO v0.9.1 ou une version ultérieure.
2. « Lien avec l'organisation » : définissez la base de l'organisation (jamais https://w3id.org/crgo/) et le dossier confidentiel, puis « Construire le graphe de l'organisation » ; les totaux doivent être égaux à ceux de cette application.
3. « Lire le contexte » pour un scénario, puis cochez des scénarios et des quantités et « Envoyer les résultats cochés sous forme de propositions ». Un refus est affiché tel qu'il a été reçu ; corrigez-en la cause plutôt que de modifier les données.

*Terminé lorsque :* Les résultats que l'organisation souhaite consigner se trouvent dans son graphe proposé, avec la version du modèle, les intrants et le hachage des intrants.

#### 22. Effectuer la revue de qualité avant que quoi que ce soit ne sorte

Avant un rapport ou un renvoi des résultats, vérifiez que rien n'est qualifié d'approuvé, de conforme ou de probable sans une personne, des éléments probants ou le bon type de données à l'appui.

*Où :* Gouvernance → Revue de qualité

1. Gouvernance → « Revue de qualité » : lisez chaque vérification échouée et ouvrez l'écran qui permet de la corriger.

*Terminé lorsque :* Aucune vérification n'échoue, et celles qui demandent de l'attention sont expliquées dans le rapport.

---

## 7. Les écrans, menu par menu

Le menu latéral compte douze sections, dans cet ordre : **Démarrer · Organisation · Évaluation des
risques · Menaces et vulnérabilités · Gouvernance · Gestion de la conformité · Gestion de l'audit ·
Opérations de sécurité · Registre partagé des risques · Outils · Paramètres · Aide**. Ce chapitre le
suit écran par écran.

**Vous orienter dans le menu.**

- **Les sections et les sous-menus s'ouvrent et se ferment.** Cliquez sur le titre d'une section pour la
  replier ; une section repliée indique combien d'écrans elle contient. Un écran à plusieurs onglets
  (Gestion des PSI, SIEM, SOAR, Paramètres…) s'ouvre comme un sous-menu de ses onglets. Ce que vous ouvrez
  et fermez est mémorisé sur cet ordinateur.
- **Mode rail.** Le bouton **« ** à côté du nom de l'application replie tout le menu en un rail étroit
  d'icônes de section ; les écrans d'une section s'ouvrent alors dans un volet flottant. ** »** rétablit le
  menu complet.
- **Écrans étroits.** Dans une fenêtre de la taille d'un téléphone, le menu devient un tiroir, ouvert
  avec **☰** dans la barre du haut.
- **Ce qui n'y figure pas.** Une fonctionnalité désactivée dans **Paramètres → Modules**, ou masquée pour
  vous dans **Paramètres → Utilisateurs et RACI → Accès aux menus**, est omise du menu, et une section ou
  un sous-menu laissé vide disparaît avec elle. Ses données ne sont pas supprimées.
- Les **pastilles** à côté de certaines entrées comptent ce que contient l'écran (scénarios, mesures,
  instantanés…).

**De l'aide sur chaque écran.** Sous le titre de chaque écran, une description d'une ligne indique à
quoi sert l'écran ; le **?** à côté du titre ouvre une courte aide — les règles qui s'appliquent à cet
écran — avec **Ouvrir cette section du guide de l'utilisateur**, qui ouvre ce guide à la section
correspondante, dans sa propre fenêtre.

### 7.1 Démarrer — Processus {#process}

Section 6. Les fiches d'étape avec leur état dans l'espace de travail, la prochaine étape recommandée,
les lignes directrices en détail et la liste de contrôle imprimable. Le bandeau du haut rappelle que
l'application est une version bêta et que chaque résultat est une hypothèse analytique à valider.

### 7.2 Organisation

Ce que vous configurez une fois et que vous revenez consulter : le profil de l'organisation (avec ses
documents et Importer des documents), les actifs informationnels, la maturité et la résilience, et la
réinitialisation des données.

### 7.2.1 Profil de l'organisation {#org}

L'écran **Profil de l'organisation** comporte six onglets : *Profil et appétit*, *Actifs essentiels*,
*Documents de contexte*, *Importer des documents*, *Preuves* et *Espaces de travail* (plus *Classe* pour
un cas de classe).

**Espaces de travail — évaluer une organisation nouvelle ou différente.** Donnez un nom à l'espace de
travail, choisissez *Organisation réelle* ou *Cas d'affaires pour la classe*, et partez d'une évaluation
vierge, d'une copie de l'exemple MediBec, d'une copie de l'espace de travail courant ou d'un fichier
importé (une exportation d'espace de travail, ou tout fichier JSON d'évaluation que `crg_calc.py`
accepte). Cochez **Cas pédagogique utilisé à des fins de formation** pour signaler un cas
d'enseignement ; l'espace de travail devient un cas de classe et chaque livrable indique que le cas est
fictif.

Le formulaire du nouvel espace de travail a sa propre zone de dépôt : déposez ou choisissez plusieurs
fichiers Word (.docx) ou PDF à la fois — le cas d'affaires, le profil de l'entreprise, un rapport
d'audit, l'historique des incidents ; les fichiers Excel, PowerPoint et texte sont aussi acceptés.
Retirez ceux que vous avez ajoutés par erreur. Trois options enchaînent les extractions tout de suite
après la création : *Extraire le profil et l'appétit de ces documents après la création*, *Puis
extraire les actifs essentiels* et *Puis importer d'autres éléments des documents*, qui ouvre
**Importer des documents** (ci-dessous). Cliquez sur **Créer l'espace de travail** : chaque fichier est
lu sur votre ordinateur avec une ligne de progression (mots trouvés, *peu de texte trouvé*, ou une
erreur).

**Profil et appétit.** Contexte, mission, produits et services, processus et systèmes critiques,
infonuagique, fournisseurs, information sensible, exigences de disponibilité, contrôles et maturité,
historique des incidents et obligations légales et réglementaires. En dessous : l'**appétit pour le
risque** avec sa justification, le facteur de multiplication et la devise, ainsi que le **budget TI**,
les dépenses actuelles en cybersécurité et le coût de base de fonctionnement utilisés par l'écran
Budget. Lorsque la direction n'a pas approuvé d'appétit, l'*estimateur de l'appétit* en suggère un à
partir des facteurs cochés — présenté comme une estimation analytique, à valider.

*Budget de cybersécurité (dépenses actuelles)* correspond à tout ce qui est dépensé en cybersécurité
cette année : personnel, outils, services, projets. *Coût de base (fonctionnement) de la sécurité* est
la part de ces dépenses nécessaire simplement pour maintenir la sécurité existante en fonction —
salaires du personnel de sécurité actuel, renouvellements de licences, services gérés existants,
maintenance. Il ne couvre aucun nouveau traitement.

**Enregistrer et Annuler.** Les modifications dans Profil et appétit sont un brouillon : la barre du
haut affiche *Modifications non enregistrées* jusqu'à ce que vous cliquiez sur **Enregistrer** ;
**Annuler** rétablit les valeurs enregistrées. Quitter l'onglet ou l'écran avec des modifications non
enregistrées demande d'abord une confirmation.

**Extraire des documents.** Le bouton situé dans la même barre propose chaque champ du profil à partir
des documents de contexte. Choisissez :

- **Utiliser l'IA (aperçu avant l'envoi)** — vous voyez le contenu à envoyer avant que quoi que ce soit
  ne parte et pouvez le modifier, et vous choisissez la **créativité** de la réponse (section 8.2). Avec
  le fournisseur **Claude**, vous pouvez cocher *Rechercher sur le Web les renseignements manquants* :
  les éléments que les documents ne donnent pas sont recherchés et étiquetés **EXTERNAL** avec la page
  citée. Avec un **modèle local**, les éléments manquants ne peuvent être étiquetés que ASSUMPTION ou
  UNKNOWN. Pour un cas de classe, l'organisation est fictive : la recherche se limite donc aux données
  de référence du secteur.
- **Règles seulement (sans IA, hors ligne)** — les phrases correspondant à chaque champ sont tirées des
  documents ; les valeurs trouvées de cette façon sont étiquetées FACT ou INFERENCE, l'appétit est une
  ASSUMPTION, le reste UNKNOWN.

La revue énumère chaque champ avec sa valeur actuelle, la valeur proposée (modifiable, normalisée en un
énoncé structuré court de moins de 50 mots, ou en un nombre, un code de devise ISO, un appétit entre
0,1 et 0,9), son **étiquette** et sa **source** :

| Étiquette | Signification |
|---|---|
| FACT | Énoncé explicitement dans les documents (la source nomme le document). |
| INFERENCE | Déduit de faits contenus dans les documents. |
| ASSUMPTION | Une valeur plausible faute d'information — validation requise. Avec une réponse créative, la source commence par *Proposed —*. |
| EXTERNAL | Tiré d'une preuve externe, comme une page Web (citée). |
| UNKNOWN | Non trouvé — information encore à recueillir. |

Les propositions pour les champs vides sont cochées ; une proposition qui remplacerait une valeur que
vous avez déjà est affichée à côté de celle-ci et laissée non cochée. Cliquez sur **Mettre les valeurs
cochées dans le formulaire** : elles vont dans le brouillon, rien n'est encore enregistré. Une étiquette
de couleur reste à côté du libellé de chaque champ — un astérisque signifie que vous avez modifié la
valeur après l'extraction. Cliquez sur **Enregistrer** pour les conserver.

**Actifs essentiels.** Les actifs et services dont la perte nuirait le plus à la mission, avec leur
responsable, l'importance C/I/A, les dépendances et les fournisseurs. Ils alimentent le générateur de
scénarios en lot. **Extraire des documents…** dans cet onglet propose des actifs essentiels de la même
façon, avec une étiquette et une source pour chacun ; ceux qui figurent déjà dans la liste sont reconnus
et ignorés.

**Classe** (espaces de travail de classe seulement). Cours, titre du cas d'affaires, équipe, membres,
enseignant et date de remise. Chaque exportation les reprend, et le README du classeur indique que le
cas est fictif.

**Documents de contexte.** Déposez ou choisissez des fichiers : Word, Excel, PowerPoint, PDF, texte,
Markdown, CSV, JSON ou HTML. Le texte est extrait **sur votre ordinateur** et stocké avec l'espace de
travail. Ouvrez n'importe quel document pour en lire ou en corriger le texte, ou ajoutez une note
saisie. Les PDF sont lus au mieux : les PDF numérisés ou encodés de façon inhabituelle donnent peu de
texte, et l'application le signale — collez plutôt les passages clés sous forme de note. Lorsque vous
ajoutez des documents ici, une fiche propose **Extraire des nouveaux documents…**, qui ouvre Importer
des documents avec ces documents déjà sélectionnés.

Le panneau des **indices de contexte** parcourt le texte à la recherche de signaux sectoriels, de lois
et de normes, de technologies, d'actifs essentiels candidats, d'identifiants CVE et de montants. Il
s'agit d'un balayage par mots clés, pas d'une interprétation ; rien n'est ajouté tant que vous ne
cliquez pas, et les CVE trouvées de cette façon entrent dans le registre des vulnérabilités comme *non
confirmées*. L'extraction du texte et les indices n'utilisent aucune IA.

#### Importer des documents — à tout moment

**Organisation → Importer des documents** est l'endroit où les documents deviennent une évaluation ;
c'est l'étape 4 du Processus. L'écran fonctionne de la même façon, que l'espace de travail ait été créé
il y a une minute ou que l'évaluation date de plusieurs mois : de nouvelles informations arrivent — un
rapport d'audit, une liste de fournisseurs, un nouvel incident — et vous les extrayez sans ressaisie et
sans perturber ce qui s'y trouve déjà.

**1. Documents à lire.** Déposez les nouveaux documents dans la zone du haut ; ils sont lus sur votre
ordinateur et ajoutés à l'espace de travail. Le tableau énumère chaque document avec ce qui en a déjà
été extrait (*Déjà extrait vers*). Cochez les documents à lire. Par défaut, les documents **que vous
venez d'ajouter sont les seuls cochés**, de sorte qu'un nouveau document peut être extrait seul ;
*Sélectionner tous les documents* les coche tous. Les documents cochés sont les seuls dont le texte
entre dans une requête — l'aperçu nomme chacun d'eux.

**2. Ce qu'il faut extraire.** Les cibles, chacune avec ses méthodes (*règles + IA* ou *IA seulement*)
et l'acheminement de ses requêtes d'IA :

| Cible | Où elle va | Règles | Remarques |
|---|---|---|---|
| Profil et appétit | les 18 champs du profil, sous forme de brouillon que vous enregistrez | oui | les propositions pour les champs remplis restent non cochées |
| Actifs essentiels | Organisation → Actifs essentiels | oui | les noms existants sont ignorés |
| Actifs informationnels | Actifs informationnels (responsable, type, classification, C/I/A, hébergement, fournisseur/produit, dépendances) | oui | alimente l'étape 2 des scénarios en lot, la liaison des vulnérabilités et le rayon d'impact |
| Impact sur les affaires (BIA) | le BIA de l'actif : RTO, RPO, durée maximale d'interruption tolérable, impact 0–5, processus | oui (RTO/RPO) | preuves pour μ(E), δe, δm |
| Tiers | Actifs informationnels de type *Fournisseur / tiers* | oui | scénarios et mesures liés aux fournisseurs |
| Contrôles existants | Mesures de protection existantes, avec les références aux cadres | oui | ajoutés avec **zéro réduction** : définissez vous-même leur effet |
| Conformité | la déclaration d'applicabilité (statut, maturité, constats comme écarts) | IA | seulement les contrôles que les catalogues connaissent |
| Incidents | Organisation → Preuves | oui | preuves pour Pb(A), Pb(ψ,A) |
| Vulnérabilités (faiblesses nommées) | le registre des vulnérabilités sous forme de faiblesses *W-…* avec une CWE | oui | utilisées par Suggérer des liens |
| Scénarios candidats | la grille Scénarios en lot, marqués *[Docs]* | IA | paramètres par défaut, confiance faible |
| Preuves des paramètres | Preuves et justification des paramètres du scénario | IA | **jamais** un nombre |
| Registre des risques existant | Registre des risques (responsable, cotes, traitement, acceptation à confirmer) | IA | |
| Budget | initiatives, et la répartition des dépenses personnel / outils / services | oui (projets) | |
| ICR | Tableau de bord des ICR : l'indicateur et sa première mesure | oui | |
| Personnes et rôles | Organisation → Preuves ; *Créer l'utilisateur* en mode multiutilisateur | oui | responsables proposés, RACI de départ |
| Contexte de classe | l'onglet Classe | oui | |

Les cibles cochées ici constituent le **plan d'importation** de l'étape 4 du Processus : l'étape est
terminée lorsque chaque cible du plan a été examinée au moins une fois. Choisissez la **Méthode** — IA
(aperçu avant l'envoi) ou Règles seulement, sans IA, hors ligne (lorsqu'une règle existe) — et cliquez
sur **Démarrer l'importation**. Le profil s'ouvre en premier, puis les actifs essentiels, puis chaque
cible à tour de rôle ; chacune ouvre sa revue : modifiez, cochez, **Ajouter les cochés**. Si les valeurs
du profil que vous avez acceptées ne sont pas encore enregistrées lorsque le traitement passe à la
suite, l'application demande : *Enregistrer le profil et continuer*, *Rester sur le profil* ou
*Abandonner les valeurs du profil et continuer*.

**Fusionner, et non écraser.** Les valeurs acceptées s'ajoutent à ce que contient l'espace de travail.
Une proposition qui remplacerait une valeur existante du profil est affichée à côté de celle-ci et
laissée non cochée ; les actifs essentiels déjà dans la liste sont ignorés ; les enregistrements
conservent leur étiquette, leur source, la méthode et la date. Une importation ne modifie jamais un
score.

**3. Importations précédentes.** Les dernières importations : date, cible, nombre d'éléments proposés
et ajoutés, la méthode et le nombre de documents lus.

Acheminement : les cibles qui cartographient les systèmes et l'exposition de l'organisation — actifs et
BIA, contrôles existants, incidents, faiblesses — forment la fonction *Importer des documents — actifs
et BIA, contrôles existants, incidents, faiblesses*, acheminée vers le **modèle local par défaut** ; les
autres suivent le fournisseur de l'espace de travail (section 8.3).

**Preuves.** Organisation → *Preuves* conserve les personnes et les rôles, la ventilation des dépenses,
les incidents lus dans les documents (ils figurent aussi au registre des incidents) et le **journal
d'importation** (ce qui a été proposé et ajouté, par quelle méthode et par qui). Les *enregistrements*
de preuves — ce qu'un document ou un essai démontre, pour quelle période et jusqu'à quand — sont
conservés une seule fois dans **Gouvernance → Registres partagés → Preuves**.

### 7.2.2 Actifs informationnels {#assets}

Les systèmes, applications, données, services d'affaires, locataires infonuagiques, appareils,
fournisseurs et installations de l'organisation, chacun lié aux scénarios et aux risques qu'il porte.

- **Inventaire.** Recherchez et filtrez par type, niveau de criticité, classification et étape du cycle
  de vie. *Créer à partir du profil et des actifs essentiels* transforme les systèmes critiques de
  l'écran Organisation en actifs à examiner. Cliquez sur un actif pour le modifier : données générales
  (responsable, gardien, hôte, IP, SE, fournisseur, produit, version, CPE, étiquettes comme
  `internet-facing`), classification et cotes C/I/A, **étiquettes de données sensibles** (PII, PHI, PCI,
  financières, PI, identifiants, juridiques, RH), **impact sur les affaires** (MTD, RTO, RPO, revenus
  par heure, impact financier / opérationnel / juridique / réputationnel / sur la sécurité des
  personnes 0–5, processus), **cycle de vie** (étape, acquisition, fin du soutien, fin de vie, retrait),
  **sécurité des terminaux** (EDR, chiffrement du disque, dernier correctif, dernière détection) et
  **configuration de référence** (CIS Benchmark, STIG, guide du fournisseur ; conforme / dérive),
  logiciels, vulnérabilités, dépendances en amont et scénarios qu'il porte.
- **Criticité** (0–100) = CIA 40 + impact sur les affaires 30 + classification 15 + données
  sensibles 10 + dépendants 5 ; niveaux Critique ≥ 70, Élevé ≥ 50, Moyen ≥ 30. **Risque dynamique** =
  criticité × exposition, où l'exposition augmente avec les CVE liées (KEV, EPSS, exposition confirmée),
  l'absence d'EDR ou de chiffrement, un correctif datant de plus de 60 jours, une dérive de la
  configuration de référence, la fin du soutien, l'exposition à Internet et les scénarios liés au-dessus
  de la tolérance. Il est recalculé chaque fois que quelque chose change ; **Enregistrer les cotes**
  conserve les valeurs du jour pour qu'un graphique miniature montre la tendance. Survolez un score pour
  voir ses composantes.
- **Découverte et importation.** Chargez un balayage Nmap XML (`nmap -sV -O -oX scan.xml …`), une
  exportation CSV provenant d'une CMDB, d'une console EDR, d'une solution MDM ou d'un chiffrier (les
  colonnes nom, nom d'hôte, IP, SE, responsable, fournisseur, modèle, dernière détection et état du
  capteur sont reconnues), ou un JSON AWS `describe-instances` / Azure `az resource list`. L'importation
  est **d'abord comparée à l'inventaire** : nouveaux actifs, champs modifiés et actifs que cette source
  ne voit plus ; cochez ce qu'il faut appliquer. Pour la **découverte continue**, faites écrire
  l'exportation de votre balayeur ou de votre EDR dans `discovery/` du dossier des flux : l'écran le
  vérifie chaque minute tant qu'il est ouvert et signale les nouveaux fichiers.
- **Logiciels et données.** Les logiciels regroupés pour l'ensemble des actifs avec les CVE du registre
  qui les mentionnent ; les actifs de données et les étiquettes de sensibilité avec leur responsable et
  leur chiffrement.
- **Impact sur les affaires.** MTD/RTO/RPO et cotes d'impact des services et des actifs critiques, avec
  ce dont chacun a besoin en amont.
- **Vulnérabilités et configuration.** Suggestions de corrélation (CVE du registre dont le champ produit
  ou actif correspond au nom, au produit ou au logiciel d'un actif), la carte actifs × CVE (KEV en
  rouge, ● exposition confirmée), l'état des terminaux et de la configuration de référence avec les
  chiffres de couverture.
- **Dépendances et rayon d'impact.** Le graphe relationnel des actifs (→ dépend de), des scénarios et,
  facultativement, des risques ; la taille des nœuds correspond à la criticité. Sélectionnez un actif :
  tout ce qui en dépend, directement ou non, est mis en évidence, avec les services d'affaires, les
  scénarios et les risques touchés et la MTD la plus courte parmi eux.
- **Piste d'audit.** Chaque création, modification, liaison, importation et suppression avec son
  horodatage, son champ, ses valeurs avant et après et sa source ; exportable en CSV.
- **Rapports de conformité.** Dix vérifications des actifs (responsable, classification, étiquettes de
  sensibilité, EDR, chiffrement, correctifs, configuration de référence, fin du soutien, BIA, découverte
  récente) avec les contrôles qu'elles appuient et les actifs non conformes ; rapports en Markdown et en
  CSV.

### 7.2.3 Maturité et résilience {#maturity}

La **maturité** est cotée par rapport au NIST CSF 2.0 : six fonctions et les 22 catégories qui en
découlent, lues à partir du contenu de l'éditeur fourni avec l'application plutôt que saisies de
mémoire. Cotez de 0 à 5 par rapport à une cible, avec des preuves. Une catégorie non cotée est
**exclue de la moyenne, jamais comptée comme zéro**, de sorte qu'une évaluation partielle reste
honnête. Lorsque vos mesures de protection renvoient à une catégorie du CSF, un niveau peut être
proposé, et une proposition ne dépasse jamais 3 — un inventaire peut montrer que quelque chose est
fait, mais pas si c'est défini, géré ou en amélioration.

La **résilience** consiste en dix-huit questions, trois par capacité, portant sur ce que l'organisation
peut *démontrer* plutôt que sur ce qu'elle possède. **« Inconnu » est une vraie réponse** : elle est
consignée comme une lacune d'information et exclue du score, au lieu d'être comptée comme un zéro que
personne n'a vérifié.

**Les deux lectures.** Le questionnaire consigne ce que les gens disent ; l'inventaire consigne ce qui
est écrit comme étant en vigueur. Les deux proposent un θ, et l'écran nomme l'écart — *elles
concordent*, *le questionnaire est plus optimiste* (quelqu'un croit en une capacité que rien n'appuie)
ou *l'inventaire est plus optimiste* (des contrôles sont consignés auxquels les personnes qui répondent
n'accordent pas de crédit). Elles ne sont pas moyennées : faire la moyenne cache le constat. La lecture
la plus basse est proposée par défaut, car une résilience revendiquée sans preuve est l'erreur la plus
coûteuse.

**Historique.** Consignez une évaluation : elle est datée, sa tendance est établie par rapport à la
précédente, et elle est comparable. Consigner deux fois le même jour remplace l'entrée. Deux ICR la
suivent : CRG-15, maturité par rapport à la cible, et CRG-16, capacités de résilience couvertes, tous
deux vides jusqu'à ce que vous fassiez l'évaluation.

**Combien de scénarios.** Le niveau mesuré fixe le nombre suggéré — environ 10 sous une maturité de 2,
15 à 2, 20 à 3, 30 à 3,5 et plus — affiché dans la page Processus et dans Scénarios en lot avec sa
raison.

*Où :* Maturité et résilience → Maturité (CSF 2.0) · Résilience (θ) · Les deux lectures · Historique · Méthode

### 7.2.4 Réinitialiser les données {#reset}

**Organisation → Réinitialiser les données.** Deux publics, tenus séparés à dessein.

**Recommencer** — pour la personne qui travaille sur un cas d'enseignement. Aucun administrateur n'est
nécessaire : réinitialiser son propre exercice n'est pas un acte administratif. Cette option n'est
offerte que pour un **cas d'enseignement** — l'exemple MediBec fourni ou tout espace de travail dont le
type est un cas d'affaires pour la classe — parce que seul un cas d'enseignement a un point de départ
auquel revenir :

| Le cas | Où mène « recommencer » |
|---|---|
| L'exemple MediBec fourni | Le cas tel que livré avec l'application. |
| Un cas de classe importé d'un fichier | L'état contenu dans ce fichier, consigné au moment de son importation. |
| Un cas de classe construit sur cet ordinateur | Nulle part, tant qu'un enseignant n'a pas consigné de point de départ. |

**Les étapes que l'étudiant refait.** Recommencer vide aussi ce que produisent les premières étapes de
l'exercice, de sorte que l'étudiant les reconstruit à partir des documents du cas et que l'écran
Processus les affiche comme *à faire* :

| Étape | Ce que recommencer vide |
|---|---|
| 2 — Décrire le contexte et l'appétit pour le risque | les douze champs de contexte du profil, la justification de l'appétit et le budget TI |
| 3 — Repérer les actifs essentiels et les actifs informationnels | les actifs essentiels et l'inventaire des actifs informationnels |

Le nom de l'organisation, ses documents et tout le reste du point de départ demeurent. L'enseignant
choisit ces étapes pour chaque cas, sous *Pour l'enseignant* → **Étapes que l'étudiant refait après
avoir recommencé** ; les deux sont cochées par défaut. Décochez les deux, et recommencer rend le cas
exactement tel qu'il a été remis.

Un enseignant consigne le point de départ avec **Définir l'état actuel comme point de départ**, une
fois que le cas est prêt à être remis, avec ses documents et les scénarios éventuels de départ de
l'exercice. Le consigner de nouveau le remplace, ce qui déplace le point de départ pour toutes les
personnes qui utilisent cette copie de l'application. **L'oublier** retire le point de départ et, avec
lui, la possibilité pour l'étudiant de recommencer le cas.

Pour une organisation réelle, l'écran explique pourquoi le bouton n'y figure pas : le travail en est la
seule copie, de sorte que le même bouton serait un moyen de le détruire par accident.

**Réinitialiser ou supprimer** — pour un administrateur (en mode utilisateur unique, la personne qui
utilise l'ordinateur). Quatre niveaux, chacun décrit par ce qu'il **conserve** :

| Niveau | Conserve | Efface |
|---|---|---|
| Réinitialiser l'évaluation, garder l'organisation | Profil, appétit, actifs essentiels, documents, actifs informationnels, inventaire des mesures de protection, évaluation de la maturité, politiques de sécurité, travaux de conformité, définitions des ICR | Scénarios, candidats, mesures, recommandations, le registre des risques, mesures des ICR, décisions |
| Garder le contexte, abandonner l'évaluation | Comme ci-dessus, moins les définitions des ICR | Comme ci-dessus, plus les indicateurs clés de risque que vous avez conçus |
| Table rase, en gardant les détails de l'organisation | Profil, appétit, actifs essentiels, documents | Tout le reste — actifs, mesures de protection, maturité, vulnérabilités, contexte de menace, politiques, conformité, toute l'évaluation |
| Retirer complètement l'organisation | L'espace de travail et son nom | Tout, y compris le profil, l'appétit, le budget et les documents |

En plus de n'importe quel niveau : **Effacer aussi** l'inventaire des mesures de protection,
l'évaluation de la maturité ou l'instantané des menaces — les trois désactivés par défaut — et
**Conserver** l'instantané d'exemple, les catalogues de cadres et les paramètres d'IA (qui
appartiennent à l'installation), et **conserver les clés d'API stockées**, coché par défaut. Avant que
quoi que ce soit ne se produise, l'écran énumère **Ce que ceci supprimerait**, compté à partir de
l'espace de travail tel qu'il est.

**La confirmation se fait dans une fenêtre distincte.** Elle répète ce qui sera supprimé et ce qui sera
conservé, et vous demande de taper le mot — `RÉINITIALISER`, `SUPPRIMER` ou `RECOMMENCER`, dans la
langue de l'interface. En mode multiutilisateur, si un administrateur a défini un NIP, ce NIP est
également exigé, de sorte qu'une classe peut décider que les étudiants ne réinitialisent pas sans
supervision.

**La suppression d'un espace de travail complet** se trouve dans Organisation → Espaces de travail
(Ouvrir, Exporter, Supprimer sur chaque ligne) ; Réinitialiser les données l'offre pour l'espace de
travail dans lequel vous êtes. Elle est définitive — exportez d'abord. La suppression du dernier espace
de travail ramène l'exemple MediBec, de sorte que vous n'êtes jamais sans espace de travail.

**Une réinitialisation n'est pas un retour en arrière.** Pour revenir à un état que vous savez correct,
restaurez une sauvegarde : Sauvegarde et restauration → le fichier → **Tout remplacer**.

| Où | Quoi | Survit à la réinitialisation d'un espace de travail ? |
|---|---|---|
| Dans l'espace de travail | Profil, documents, actifs, mesures de protection, maturité, vulnérabilités, instantané des menaces, scénarios, mesures, risques, recommandations, historique des ICR, politiques, conformité | Seulement ce que le niveau choisi conserve |
| Avec l'installation | Catalogues de cadres, l'instantané d'exemple fourni, paramètres d'IA, langue de l'interface, modules, utilisateurs et droits, le catalogue du Registre partagé des risques | Oui, sauf si vous décochez « Conserver » |
| Avec l'assistant local | Les clés d'API, dans `crg-keys.json` du dossier des flux, mode 600 | Oui, sauf si vous décochez « Conserver » |

Chaque réinitialisation est consignée dans l'espace de travail et survit même au niveau le plus
profond.

### 7.3 Évaluation des risques

L'évaluation proprement dite : les indicateurs, ce qui protège déjà l'organisation, les scénarios, le
calcul, les risques, le traitement et les recommandations.

### 7.3.1 Tableau de bord des ICR {#dashboard}

Deux types d'indicateurs clés de risque :

- Les **ICR calculés** (CRG-01 … CRG-10) proviennent de l'espace de travail lui-même : ratio
  résiduel/toléré du portefeuille, scénarios au-dessus de la tolérance, risque résiduel total, âge de
  l'instantané, part des scénarios importants dont la Pb(ψ,A) repose sur le renseignement et est
  conditionnée par l'exposition, CVE exposées figurant au KEV, couverture de la correspondance ATT&CK,
  scénarios au-dessus de la tolérance dont le traitement est financé, décisions consignées, et dépenses
  en cybersécurité en proportion du budget TI par rapport à la cible cohérente avec l'appétit pour le
  risque.
- Les **ICR opérationnels** sont ceux de l'évaluation (le cas MediBec en fournit vingt : couverture de
  l'AMF, délais de correction, essais de restauration…). Définissez-les ou modifiez-les au bas de
  l'écran ; les seuils acceptent des formes comme `100%`, `< 95%`, `> 8%`. Un avertissement `<` signifie
  que plus la valeur est élevée, mieux c'est.

**Suivi dans le temps.** Choisissez une date, saisissez au besoin les valeurs opérationnelles que vous
avez mesurées, puis cliquez sur **Consigner**. Les ICR calculés sont saisis tels qu'ils sont. Consigner
de nouveau à la même date met à jour l'entrée ; des dates antérieures peuvent être remplies
rétroactivement, ou un historique complet importé à partir d'un CSV.

**Top 5 par défaut.** Le tableau de bord s'ouvre sur les cinq indicateurs qui exigent le plus
d'attention : les critiques d'abord, puis les avertissements, chacun classé selon l'ampleur du
dépassement de son seuil, puis les indicateurs conformes à la cible les plus proches de leur niveau
d'avertissement. Le choix est recalculé à chaque visite, de sorte qu'un indicateur nouvellement en
dépassement apparaît sans que vous ayez à intervenir ; **Consigner** saisit ensuite tous les
indicateurs. Cochez ou décochez des indicateurs pour faire votre propre sélection (enregistrée avec
l'espace de travail) ; **Revenir aux 5 premiers** ou **Top 5** ramène à la vue automatique. Les
indicateurs CRG-11 à CRG-14 proviennent d'Actifs informationnels et de Conformité et affichent *aucune
donnée* tant que ces écrans ne sont pas remplis.

**Jauges.** Chaque indicateur sélectionné est présenté sous forme de jauge : des bandes verte, ambre et
rouge pour conforme à la cible, avertissement et critique, un repère à la cible et une aiguille à la
valeur actuelle. Les jauges des indicateurs pour lesquels une valeur plus basse est meilleure sont
colorées en sens inverse, de sorte que le vert signifie toujours « bon ». Les indicateurs sans seuils
affichent plutôt une valeur suivie. Cliquez sur une jauge pour voir sa tendance.

**Sélection et recherche.** Au-dessus du tableau : une zone de recherche (ID, nom, méthode,
responsable…) et des filtres par statut, par type (calculé ou opérationnel) et par responsable — comme
dans le Registre des scénarios. Cochez un ou plusieurs indicateurs, ou utilisez *Sélectionner les
éléments affichés*, *Désélectionner les éléments affichés*, *Tout sélectionner* ou *Seulement
avertissement ou critique*. Les indicateurs cochés sont ceux qui sont présentés sous forme de jauges et
**consignés** par **Consigner** ; la sélection est enregistrée avec l'espace de travail. **Comparer les
tendances sélectionnées** affiche un petit graphique par indicateur sélectionné, chacun selon sa propre
échelle.

Pour chaque ICR, le tableau affiche la valeur actuelle, les seuils, le statut, une microcourbe et la
**tendance** — la pente des moindres carrés sur l'ensemble des points consignés, interprétée selon le
sens de l'ICR et étiquetée en amélioration, en détérioration ou stable. Cliquez sur un ICR pour
afficher son graphique avec les lignes de cible, d'avertissement et de seuil critique, la variation
depuis le point précédent, la pente par 30 jours et le nombre de dépassements critiques.

#### Tableau de bord Claude {#dashboard-claude}

**Télécharger le paquet du tableau de bord (.zip)** transforme ce tableau de bord en *tableau de bord Claude*
sur claude.ai — une page où chaque chiffre indique le jeu de données d'où il provient, partagée avec les
personnes de votre choix. Le paquet contient quatre jeux de données (indicateurs de risque clés actuels et
dans le temps, scénarios par rapport à la tolérance, politiques de sécurité et couverture des prises de
connaissance), une page prête et un manifeste; aucun texte de document, et le nom des responsables des ICR
seulement si **Inclure le nom des responsables des ICR** est coché. Joignez le ZIP dans Claude et demandez
*« Build my CyberRiskGuardian dashboard from this pack »* — avec le plugiciel CyberRiskGuardian, la compétence
`crg-dashboard` (ou `/crg-dashboard`) le fait toujours de la même façon. Exportez un nouveau paquet et
demandez à Claude d'actualiser le tableau de bord quand les chiffres changent. Quiconque peut ouvrir le
tableau de bord Claude peut lire ses jeux de données : ne le partagez qu'avec les personnes autorisées à voir
l'évaluation.

### 7.3.2 Mesures de protection existantes — ce qui vous protège déjà {#safeguards}

Deux registres distincts répondent à deux questions distinctes. **Atténuation des risques** répond à
*que devrions-nous ajouter, combien cela coûterait-il, qu'est-ce que cela nous apporterait*. **Mesures
de protection existantes** répond à *qu'est-ce qui nous protège aujourd'hui, qui en est responsable, et
quand a-t-on démontré pour la dernière fois que cela fonctionne*. C'est en les gardant séparés qu'on
empêche une recommandation de s'attribuer le mérite d'un contrôle dont l'organisation dispose déjà.

**Les types.** Mesures techniques, processus d'affaires, contrôles internes, programmes de
sensibilisation, politiques et rôles, mesures physiques et environnementales, mesures contractuelles et
d'assurance, mesures liées au personnel.

**Pour chaque entrée.** Un responsable imputable — une personne, et non une équipe. L'état : *en
place*, *partiellement en place*, *planifiée* (ce qui ne compte pour rien : un contrôle vous protège
lorsqu'il fonctionne, et non lorsqu'il est décidé) ou *retirée*. La portée **et ce qu'elle ne couvre
pas**, car c'est là que le risque se cache. Les actifs et les scénarios couverts, les contrôles des
cadres de référence mis en œuvre, le coût annuel de son fonctionnement, ce dont elle dépend, et la date
de son dernier essai, audit ou examen avec le résultat. Sans preuve depuis douze mois, elle est signalée
comme périmée ; jamais mise à l'essai, elle est signalée comme une hypothèse, ce qu'elle est
effectivement.

**Couverture de la résilience.** Chaque mesure de protection reçoit une note de 0 à 3 pour chacune des
six capacités qui définissent θ(ψ,A) — prévenir, détecter, contenir, intervenir, rétablir, maintenir les
opérations critiques. L'onglet montre d'où provient réellement la résilience et **propose** un θ, pour
l'ensemble de l'inventaire ou pour un scénario, avec la justification rédigée pour vous. Il propose ;
c'est vous qui l'appliquez à un scénario, et la modification est consignée dans le journal des
révisions. Une capacité prend la valeur de son contributeur **le plus fort**, jamais la somme : trois
sauvegardes partielles ne constituent pas une capacité de rétablissement.

**La base de référence budgétaire.** Le coût annuel de fonctionnement de ce qui est en vigueur est proposé comme
base dans Budget. Ajoutez le personnel et les frais généraux que l'inventaire ne comprend pas.

*Où :* Mesures de protection existantes → Inventaire · Couverture de la résilience · Récupérer des contrôles · Méthode

### 7.3.3 Registre des scénarios {#register}

Tous les scénarios avec leurs menaces (pastilles ATT&CK), leurs vulnérabilités (pastilles CWE et CVE),
leur CVSS, leur risque estimé et résiduel, leur ratio et leur statut. Les pastilles ouvrent la
technique, la faiblesse ou la CVE correspondante ; le nom d'un scénario ouvre l'éditeur. La case à
cocher inclut le scénario dans les totaux ou l'en exclut. **Charger un JSON d'évaluation…** remplace
les scénarios ou les ajoute à la suite (les ID en conflit sont renumérotés) ; **Exporter en JSON
(crg_calc.py)** écrit le fichier que lit `crg_calc.py`.

### 7.3.4 Éditeur de scénarios — consulter et modifier un scénario {#scenario}

Tout ce qui concerne un scénario sur un seul écran, avec ses ICR recalculés au fil de la saisie :

- L'identification, l'énoncé et la **chaîne causale** — source de menace → événement déclencheur →
  vulnérabilités → actifs et processus touchés → séquence d'événements → conséquences.
- **Menaces — MITRE ATT&CK.** Recherchez par nom ou par ID et liez des techniques ; la ligne de
  couverture des tactiques montre la chaîne d'attaque qu'elles décrivent.
- **Vulnérabilités — CWE et CVE.** Liez des types de faiblesses et des CVE précises. Lorsqu'un
  instantané est chargé, chaque CVE affiche son échelon sur l'échelle ; *à surveiller* signifie que son
  exposition n'est pas confirmée.
- **Quantification.** Les six paramètres avec leur valeur, leur justification, leurs preuves et leur
  niveau de confiance.
- **CVSS v4.0 (base seulement)** — modifiez le vecteur ici ou dans le calculateur CVSS, puis
  enregistrez-le dans le scénario.
- **Traitement** — réduction de la probabilité et de l'impact, ensemble de traitement, initiatives qui
  visent le scénario, ou coût manuel de l'année 1.
- **Fondement du contexte de menace** — la piste d'audit rédigée lorsqu'une proposition de Pb(ψ,A) est
  acceptée.

Dupliquez, supprimez, passez au scénario précédent ou suivant, ou ouvrez-le dans le calculateur ou dans
les recommandations.

**Ébaucher la chaîne causale avec l'IA.** Dans la fiche **Chaîne causale**, **L'ébaucher avec l'IA…**
ébauche l'énoncé et les huit champs structurés à partir de ce que le scénario contient déjà — un
scénario à la fois, parce qu'une chaîne est un argument portant sur cette organisation, et un lot de
huit recevrait l'examen qu'on accorde à un lot.

Vous voyez le contenu à envoyer avant son envoi, comme partout ailleurs, et la requête demande au modèle
**de ne pas contredire** ce qui est déjà consigné, de sorte qu'un scénario à moitié rédigé est complété
plutôt que réécrit. Lors de l'examen, **les champs vides sont cochés pour vous, et un champ qui
remplacerait un texte existant est laissé décoché et l'indique**, avec la valeur actuelle à côté de
l'ébauche. Modifiez toute ébauche sur place. Rien n'est écrit avant **Appliquer les champs cochés**, et
ce que vous acceptez est consigné dans le journal des révisions avec le nom des champs retenus. La
fonction utilise par défaut le modèle local, car elle transmet le texte du scénario.

**Fiche Ontologie · CRGO.** Au bas de l'éditeur. Un scénario tiré de l'ontologie affiche son
identifiant dans l'ontologie, ses thèmes, ses catégories d'actifs, ses types de sources de menace, les
contrôles que l'ontologie lui associe et les obligations de la Loi 25 du Québec qu'il peut déclencher.
Pour tout scénario, **Trouver des scénarios semblables dans l'ontologie** cherche dans l'ontologie à
l'aide des techniques ATT&CK du scénario et des mots de son nom — *Lien* en rattache un, ce qui donne
au scénario ses clés d'ontologie — et **Contrôles pour ses techniques** énumère, technique par
technique, les contrôles que l'ontologie lui associe le plus souvent : une liste de départ pour
Atténuation des risques, et non une évaluation de l'organisation.

**Fiche des preuves des opérations de sécurité.** En lecture seule, elle rassemble ce que les
enregistrements du SIEM et du SOAR disent du scénario — par ses techniques ATT&CK, ses actifs et des
liens explicites : la couverture de détection par technique (*validée*, *non vérifiée*, *dégradée*,
*absente*, avec les règles et la raison), les lacunes de détection ouvertes, les alertes récentes (sans
les alertes bénignes ni les faux positifs — **ce ne sont pas des incidents**), les dossiers SOAR, les
incidents (*confirmé* ou *non confirmé — non compté comme incident*), les guides d'intervention avec
l'état de leur simulation, et les liens de preuve consignés dans le scénario. **Elle ne modifie aucun
paramètre** : citez-la vous-même dans la justification de Pb(A), de Pb(ψ,A) ou de θ. Les alertes
marquées TLP:RED ou TLP:AMBER+STRICT sont masquées à moins que vous ne cochiez *Afficher les éléments
TLP:RED et TLP:AMBER+STRICT sur cet ordinateur*. Des boutons mènent à Couverture et lacunes du SIEM, à
Alertes et tri, aux dossiers SOAR, aux Guides d'intervention et aux amorces dans Scénarios en lot.

### 7.3.5 Scénarios en lot — créer de nombreux scénarios à la fois {#batch}

- **Générer à partir de menaces × actifs.** Cochez des modèles de menace (dix-huit archétypes comme
  l'hameçonnage visant les identifiants, le rançongiciel, l'exploitation d'équipements de périphérie, la
  mauvaise configuration infonuagique, la compromission d'un fournisseur, la fraude par compromission de
  courriel d'affaires (BEC), la destruction des sauvegardes…) ou ajoutez n'importe quelle technique
  ATT&CK comme modèle ; cochez des actifs (les actifs essentiels, ou saisissez-en d'autres) ; choisissez
  les sources de menace. Chaque combinaison devient un candidat avec un énoncé de chaîne causale, des
  techniques et des CWE liées, et des paramètres par défaut.
- **À partir de MITRE ATT&CK.** Recherchez des techniques par nom ou par ID, ou filtrez par tactique, et
  cochez-en une ou plusieurs. Chaque technique devient un scénario qui lie la technique et ses
  faiblesses CWE (par l'intermédiaire de CAPEC). Pb(A) part de la prévalence de la technique dans
  ATT&CK — étiquetée comme une valeur a priori, et non comme une preuve.
- **À partir de CVE.** Choisissez des CVE dans le registre des vulnérabilités — celles qui sont exposées
  et inscrites au KEV viennent en premier, avec un filtre pour chacune de ces catégories. Chaque CVE
  devient un scénario qui lie la CVE, sa CWE et les techniques ATT&CK qui exploitent cette faiblesse,
  sur l'actif propre à la CVE lorsque le registre en consigne un. Lorsqu'un instantané est chargé et que
  l'exposition est confirmée, Pb(ψ,A) part du plancher de la bande de l'Échelle des preuves de menace
  de la CVE, et la justification le mentionne ; le vecteur CVSS v4.0 de la NVD est utilisé lorsqu'il est
  connu.
- **À partir de CWE.** Choisissez des faiblesses dans le Top 25 de 2024 ou au moyen d'une recherche ;
  chacune devient un scénario qui lie les techniques ATT&CK qui l'exploitent.
- **Coller ou importer un CSV.** Une ligne par scénario ; téléchargez le gabarit pour connaître les noms
  des colonnes.
- **Lignes vides.** Partez de lignes vides.
- **À partir de l'ontologie et du Registre partagé des risques.** Ontologie · CRGO → *Ajouter les
  cochés aux scénarios en lot* (marqués *[CRGO]*) et Registre partagé des risques → *Utiliser les fiches
  cochées dans cet espace de travail* (marqués *[Registre]*) aboutissent également ici.
- **Proposer avec l'IA.** Choisissez le nombre de candidats (1 à 30) et, au besoin, une orientation
  (« mettre l'accent sur les fournisseurs », « TO dans les usines »). Le profil de l'organisation, les
  actifs essentiels et les actifs informationnels sont envoyés — affichés d'abord dans l'aperçu
  habituel. Chaque candidat revient avec une chaîne causale complète et les six paramètres, chacun
  accompagné d'une justification et d'un niveau de confiance ; il arrive dans la grille, nommé *[IA]*,
  pour examen, et n'entre jamais directement dans le registre.
- **Des opérations de sécurité (SIEM et SOAR).** *Amorces de scénarios issues des opérations de
  sécurité* énumère ce que suggèrent les enregistrements du SIEM et du SOAR : lacunes de détection,
  couverture non validée par un essai, télémétrie dégradée, grappes d'alertes par technique et par
  actif, incidents confirmés, dossiers ouverts (qui ne sont pas des incidents), actions d'intervention
  sans approbation valide, guides d'intervention non simulés et leçons apprises. Chaque amorce affiche
  une chaîne causale suggérée, les techniques ATT&CK, les scénarios qu'elle touche, ses preuves (type,
  identifiant, date, TLP — et une confiance de la source *telle qu'énoncée, et non une probabilité*) et
  les paramètres qu'elle **peut éclairer** — jamais une valeur. Une amorce dont les techniques et
  l'actif essentiel (ou l'actif) correspondent à un scénario existant est marquée *Preuve pour un
  scénario existant* : **Consigner la preuve dans S…** la rattache à ce scénario sans modifier aucun
  paramètre. Choisissez la date *En date du* (la couverture, l'état de la télémétrie et les alertes
  sont lus à cette date) et le *Type*, cochez des amorces et **Créer … candidat(s) provisoire(s)** : ils
  arrivent dans la grille comme ébauches avec des paramètres neutres, avec leurs liens de preuve, pour
  que vous les estimiez. Les alertes bénignes et les faux positifs sont écartés et comptés ; les
  incidents non confirmés par une personne ne sont pas comptés comme incidents ; les amorces TLP:RED et
  TLP:AMBER+STRICT restent masquées à moins que vous ne cochiez *Afficher les éléments TLP:RED et
  TLP:AMBER+STRICT sur cet ordinateur*.

Dans **Proposer avec l'IA**, cocher **Inclure les preuves des opérations de sécurité** ajoute à la
requête un résumé de ces amorces — affiché dans l'aperçu comme tout le reste. Il est filtré : les
éléments TLP:RED et TLP:AMBER+STRICT ne sont jamais envoyés, pas plus que les niveaux de confiance des
sources. Une amorce qui constitue une preuve pour un scénario existant est décrite comme telle, de
sorte que le modèle ne la propose pas de nouveau.

**Actifs.** L'étape 2 énumère les actifs essentiels **et** les actifs informationnels de l'inventaire,
les plus critiques en premier ; *Cocher les actifs essentiels + les 5 plus critiques* permet de démarrer
rapidement.

**Nombre de candidats.** Les modèles de menace × actifs × sources peuvent produire des centaines de
combinaisons. Réglez *Nombre de candidats* (10 par défaut ; boutons rapides 10, 20, 30, 50 ; jusqu'à
500) : les combinaisons les plus pertinentes sont générées en premier — vraisemblance du modèle ×
criticité de l'actif × adéquation de la source de menace.

Chaque candidat arrive dans la **grille d'examen**, où le nom, l'énoncé, la source, l'actif, les six
paramètres, le CVSS et les réductions peuvent être modifiés. Cochez ceux à conserver et cliquez sur
**Ajouter les … sélectionnés au registre**. Les valeurs générées sont des points de départ, marqués
d'une confiance *Faible* avec la justification « Valeur par défaut du lot — estimation analytique,
validation requise ». Les consignes de la méthode s'appliquent : environ 20 candidats, puis les 10 plus
importants pour une analyse détaillée.

**Candidats variés et germe.** Le classement seul tirerait vingt candidats de deux ou trois modèles —
une même menace appliquée à un actif après l'autre — parce que la vraisemblance du modèle est identique
pour chaque actif. Les candidats sont donc **répartis** entre les modèles, les actifs et les sources de
menace que vous avez cochés, en privilégiant toujours les combinaisons les plus vraisemblables : chaque
choix rend son propre modèle et son propre actif moins attrayants pour le suivant. Dans le cas MediBec,
la même sélection donne **18 modèles distincts sur 20 candidats au lieu de 3**, les nombres suivant les
vraisemblances plutôt que de constituer un quota égal.

La répartition repose sur un **germe** ; le germe est affiché et conservé avec l'espace de travail, et
*Rebrasser* en tire un nouveau. Le même germe reproduit les mêmes candidats, de sorte qu'un ensemble
cité dans un rapport peut être reconstitué. *Varier les modèles et les actifs* peut être décoché pour
obtenir le classement strict.

### 7.3.6 Calculateur de risque {#calc}

**Tableau du portefeuille.** Le risque de chaque scénario — Pb(A), Pb(ψ,A), CVSS, risque estimé,
toléré, atténué et résiduel, ratio, statut et coût de l'année 1 attribué — avec une **case à cocher
pour inclure ou exclure chaque scénario**. Les totaux, le risque toléré et le ratio du portefeuille
portent sur l'ensemble inclus, les totaux de tous les scénarios étant affichés à titre de comparaison.
Sélections rapides : tout inclure, tout exclure, seulement au-dessus de la tolérance, 10 principaux par
risque estimé. La sélection est enregistrée avec l'espace de travail et est utilisée par le tableau de
bord, les recommandations, le budget et l'exportation Excel.

**Recherche et sélection.** Comme dans le registre : une zone de recherche (ID, nom, menace, technique,
CWE, CVE, responsable, actif — chaque mot doit correspondre) et des filtres par statut (y compris
*inclus* / *exclu*), par source de menace et par responsable. Ils déterminent quels scénarios sont
**affichés** ; les cases à cocher déterminent lesquels sont **inclus**. *Inclure les éléments
affichés*, *Exclure les éléments affichés* et *Inclure seulement les éléments affichés* agissent sur les
lignes à l'écran ; la case à cocher de l'en-tête les inclut ou les exclut toutes ; la ligne de décompte
indique combien sont affichés et inclus.

L'appétit pour le risque et le facteur peuvent être modifiés à titre d'**hypothèse de simulation** ;
rien n'est enregistré tant que vous ne choisissez pas *Enregistrer comme valeurs de l'espace de
travail*.

Les initiatives partagées sont réparties également entre les scénarios *inclus* qu'elles visent, de
sorte qu'exclure un scénario reporte sa part d'un contrôle partagé sur les autres plutôt que de la
perdre.

**Calcul d'un seul scénario.** Cliquez sur une ligne pour charger le scénario : chaque étape de la
formule, les cas de sensibilité à ±0.10 et le rapport coût-efficacité. Modifiez les valeurs comme dans
un bac à sable, puis enregistrez-les dans le scénario ou comme nouveau scénario.

### 7.3.7 Registre des risques {#riskreg}

Les risques sont ce dont la direction est responsable ; les scénarios sont la façon de les quantifier.
*Créer à partir des scénarios* crée un risque par scénario avec ses techniques, ses CWE/CVE, ses actifs
et ses mesures, et des cotes sur une échelle de 1 à 5 vraisemblance × impact : **actuelle** d'après les
paramètres du scénario, **cible** après les réductions combinées de ses mesures ; **inhérente** part
d'une valeur égale à l'actuelle, que vous ajustez. Chaque risque affiche le ratio résiduel/toléré de
ses scénarios. Consignez le responsable, la catégorie, le traitement, le statut, le prochain examen et
une **acceptation formelle** (par, date, valide jusqu'au, justification) ; chaque modification est
journalisée dans l'historique du risque. La carte de chaleur (inhérente, actuelle ou cible) et la liste
des principaux risques figurent au-dessus du registre. *Actualiser les cotes à partir des scénarios*
met à jour les cotes actuelle et cible après une modification des paramètres.

### 7.3.8 Atténuation des risques {#mitigation}

- **Catalogue de contrôles.** Votre liste (Controls_list.xlsx : ISO/IEC 27002:2013, les
  sous-catégories du NIST CSF 1.1 étiquetées « NIST 800-53 » dans la feuille, CIS v7.1 — numérotation
  corrigée et sept lignes signalées), ISO/IEC 27002:2022, NIST SP 800-53 Rev. 5 (avec les améliorations
  sur demande), NIST CSF 2.0, CIS Controls v8.1, les mesures d'atténuation ATT&CK, les mesures CRG, et
  tout catalogue que vous avez chargé dans *Cadres et normes* (section 7.5.4) — SP 800-171 r3,
  ITSP.10.171, COBIT 2019 ou votre propre importation. Recherchez, filtrez par cadre, par fonction ou
  par capacité, cochez des contrôles et faites *Ajouter* pour les intégrer à une mesure nouvelle ou
  existante.
- **Mesures.** Nom, fonction, responsable, statut (proposée, approuvée, en cours, mise en œuvre,
  rejetée), coût ponctuel et récurrent, mois avant l'obtention du bénéfice, effort, confiance,
  réduction de vraisemblance par défaut **rp** et réduction d'impact **ri**, modifiables par scénario
  avec une justification, et les contrôles du catalogue mis en œuvre. Une mesure consigne aussi **ce
  qu'elle change** — l'une des neuf catégories d'effet (gouvernance, prévention, détection,
  intervention, rétablissement, résilience, sensibilisation, assurance, tiers) — le **verbe d'action**
  (renforcer, étendre, automatiser, formaliser, remplacer… plutôt qu'un « mettre en œuvre » par
  défaut, parce que la plupart des organisations ont déjà *quelque chose*) et si le scénario a révélé un
  **écart de contrôle**, une **faiblesse** d'un contrôle existant, ou un problème de **maturité**. Ces
  trois éléments sont ce qui transforme une mesure en une recommandation qui se lit comme une décision
  plutôt que comme une liste d'achats.
- **Effet sur chaque scénario.** Les mesures sont combinées par scénario selon **red_p = 1 − ∏(1 − rp)**
  et **red_i = 1 − ∏(1 − ri)** ; le moteur vérifié applique ensuite la convention du classeur atténué =
  estimé × red_p × red_i. Le tableau affiche le ratio actuel et le ratio avec les mesures. **Appliquer**
  écrit les valeurs combinées dans le scénario avec une entrée de révision ; **Annuler les
  modifications** rétablit les valeurs précédentes. Comme la convention multiplie les deux réductions,
  un ensemble qui ne réduit que la vraisemblance (ou que l'impact) n'atténue rien — l'écran vous
  avertit lorsque cela se produit.
- **Coûts.** Chaque mesure constitue un seul investissement ; son coût de l'année 1 est réparti entre
  ses scénarios, de sorte que les contrôles partagés ne sont jamais comptés deux fois. **→ Initiative**
  crée l'initiative utilisée par Budget, Recommandations et Excel.
- **→ Recommandation**. Cochez les mesures qui vont ensemble et appuyez sur ce bouton : une **ébauche de
  recommandation** est créée à partir d'elles, regroupant leurs scénarios, leurs coûts, leur horizon,
  la correspondance avec les cadres de référence et la réduction qu'elles permettraient d'obtenir.
  Poursuivez dans *Recommandations → Registre* (section 7.3.9). Cocher une mesure ne fait que mettre à
  jour la barre d'actions — le tableau n'est pas redessiné, de sorte que votre position de défilement et
  tout éditeur ouvert sont conservés.
- **Propositions.** Pour les scénarios sélectionnés, des capacités sont proposées à partir des mesures
  d'atténuation de leurs techniques ATT&CK, des mots clés du scénario et du profil de dommages
  (δm ≥ 0.70, θ ≤ 0.40), une seule fois par capacité pour tous les scénarios qui en ont besoin, avec des
  coûts indicatifs en dollars canadiens adaptés à la taille de l'organisation et des réductions par
  défaut — estimations analytiques, validation requise.
- **Demander à Claude.** Sélectionnez des scénarios, copiez la requête (profil de l'organisation,
  scénarios, paramètres, résultats actuels, mesures existantes, convention de modélisation et schéma
  JSON de la réponse) dans Claude, collez la réponse en retour et faites **Lire la réponse** : les
  scénarios ou les contrôles inconnus sont signalés, le reste est ajouté sous forme de mesures
  *Proposé* avec les réductions par scénario de Claude.

### 7.3.9 Recommandations — les options que l'organisation peut envisager {#recs}

**Besoin de traitement** (premier onglet). Avant qu'un contrôle soit proposé, cet onglet indique pour
chaque scénario inclus si son risque résiduel est **inférieur**, **approximativement égal** ou
**supérieur** au risque toléré, avec le ratio, et rédige l'objectif de traitement en termes de risque
— ce que le ratio doit devenir, et non le produit à acheter. Un scénario ne mérite pas un projet du seul
fait d'exister : un scénario sous la tolérance exige une surveillance, et non une initiative, et c'est
dans cet onglet que cela est dit clairement. Parcourez-le avant les tableaux d'options ci-dessous.

**Par scénario.** Pour chaque scénario inclus, classé selon son ratio, les quatre options —
**atténuer, transférer, éviter, accepter** — avec l'option suggérée mise en évidence et les motifs
énoncés :

| Situation | Suggestion |
|---|---|
| Risque non traité sous la tolérance | Accepter et surveiller au moyen d'un ICR |
| Risque non traité approximativement à la tolérance | Accepter avec surveillance, ou atténuation peu coûteuse |
| Au-dessus de la tolérance, le traitement le ramène à la tolérance ou en dessous | Atténuer |
| Toujours au-dessus de la tolérance après traitement | Atténuer davantage ; aussi *transférer* si δm ≥ 0.80 ; aussi *éviter* si μ(E) < 0.50 |

Sous les options : les initiatives liées au scénario avec leur coût et leur rapport coût-efficacité,
les mesures d'atténuation ATT&CK pour ses techniques et les mesures CRG qui les mettent en œuvre, ainsi
que la **décision de la direction** — option retenue, responsable, horizon et justification,
enregistrée dans le registre des décisions. Une décision qui s'écarte de la suggestion est légitime ;
consignez-en la raison.

**Contrôles partagés** classe les initiatives selon le nombre de scénarios qu'elles servent et la
réduction du risque qui leur est attribuée, et les mesures d'atténuation ATT&CK selon le risque
résiduel qu'elles couvrent. **Feuille de route** place les initiatives dans les horizons 0 à 90 jours,
3 à 6, 6 à 12 et 12 à 24 mois. **Portefeuille d'initiatives** permet de modifier les initiatives
elles-mêmes — coûts, responsables, priorités, début et fin, scénarios visés — et peut ajouter des
entrées à partir du catalogue des mesures CRG. **Registre des décisions** énumère toutes les décisions.

**Registre** — le cycle de vie, d'une mesure sélectionnée jusqu'à une décision dont l'organisation est
responsable.

Cochez des mesures dans *Atténuation des risques* et appuyez sur **→ Recommandation** : une
**ébauche** est créée, reprenant leurs scénarios, leurs coûts, leur horizon, la correspondance avec les
cadres de référence et la réduction qu'elles permettraient d'obtenir. C'est à vous de rédiger
l'ébauche — titre, le problème en un paragraphe, la recommandation elle-même, les options envisagées et
la raison du choix de celle-ci, le responsable, l'horizon, la décision demandée à la direction.

| Statut | Signification | Étapes suivantes possibles |
|---|---|---|
| **Brouillon** | En cours de rédaction. Les chiffres sont dynamiques et évoluent avec l'espace de travail. | En revue, reporté, rejeté |
| **En revue** | Entre les mains des décideurs. Leurs commentaires y sont consignés. | Approuvé, brouillon, reporté, rejeté |
| **Approuvé** | Une décision a été prise. **Les chiffres sont figés** avec la date et l'approbateur. | En cours de mise en œuvre, reporté |
| **En cours de mise en œuvre** | En cours de réalisation. L'avancement, l'échéance et le prochain examen sont suivis. | Terminé, reporté |
| **Terminé** | Réalisé. | — |
| **Reporté** / **Rejeté** | Final. La raison est consignée. | — |

Toute autre transition est refusée, et l'écran indique plutôt les transitions possibles.

**L'approbation fige les chiffres, délibérément.** Une recommandation approuvée en octobre doit encore
afficher, en mars, les chiffres sur lesquels la décision a été prise — sinon, personne ne peut auditer
la décision. Après l'approbation, le panneau dynamique continue d'évoluer avec l'espace de travail, mais
l'enregistrement figé, lui, ne change pas ; l'écran affiche les deux et indique lequel est lequel.
Modifier une recommandation approuvée consigne une nouvelle version plutôt que d'écraser la précédente.

**Le point de contrôle d'approbation** vérifie les douze questions que les lignes directrices exigent
avant qu'une recommandation soit soumise à la direction — un objectif énoncé, un responsable, un
horizon, les coûts, les mesures, les scénarios visés, l'effet sur le ratio, les options envisagées, les
dépendances, le risque résiduel après traitement, la façon dont elle sera mesurée, et la décision
demandée. Les éléments manquants sont nommés ; il ne les devine pas à votre place.

**Une recommandation ne peut pas s'attribuer le mérite d'un contrôle dont vous disposez déjà.** La base
de référence comprend tout ce qui est déjà en vigueur, y compris les propres mesures de cette
recommandation si elles sont déjà mises en œuvre. Si vous cochez une mesure dont le statut est *mis en
œuvre*, la réduction revendiquée est nulle, et c'est exact.

**Consolidation** examine l'ensemble des ébauches et propose de fusionner celles qui partagent des
thèmes de contrôle ou des scénarios en un nombre moindre d'initiatives d'entreprise, en énonçant la
raison. Rien n'est fusionné à votre place — quatre ébauches portant sur l'identité peuvent réellement
constituer un seul programme, ou réellement en constituer quatre.

**L'ébauche d'abord, le formel ensuite.** L'usage prévu consiste à apporter l'ébauche à la discussion
avec le décideur, à la modifier sur place à partir de ce que vous entendez, et seulement ensuite à la
faire passer à l'examen et à l'approbation. Le journal de discussion de chaque recommandation sert
exactement à cela.

### 7.4 Menaces et vulnérabilités

Qui pourrait agir, comment, par quelles faiblesses — et ce qu'en disent le paysage des menaces et
l'ontologie.

### 7.4.1 Menaces · ATT&CK {#threats}

La base de connaissances **MITRE ATT&CK Enterprise v19.2** intégrée — 697 techniques et sous-techniques
et 44 mesures d'atténuation — liée aux modèles d'attaque **CAPEC v3.9** et aux faiblesses **CWE v4.14**.

- **Matrice** : les techniques par tactique, colorées selon le nombre de scénarios qui les utilisent ;
  filtrez, ou affichez seulement celles qui sont liées.
- **Détail de la technique** : description, tactiques, plateformes, nombre d'ensembles d'intrusion
  suivis qui l'utilisent (prévalence, et non vraisemblance pour cette organisation), sous-techniques,
  mesures d'atténuation ATT&CK, faiblesses CWE liées par l'entremise de CAPEC, scénarios qui
  l'utilisent, et boutons pour la lier à un scénario ou démarrer un nouveau scénario à partir de
  celle-ci.
- **Correspondance des scénarios** : couverture scénario × tactique, et techniques classées selon le
  risque résiduel.
- **Sources de menace** : scénarios regroupés par source de menace, et catalogue des sources.
- **Exporter une couche ATT&CK Navigator** pour l'ATT&CK Navigator public ou auto-hébergé.

### 7.4.2 Vulnérabilités · CVE/CWE {#vulns}

- **Sources en ligne** — mise à jour à partir d'Internet, voir ci-dessous.
- **Registre des CVE** — les CVE que l'organisation exploite. La case *Exposé* est le filtre
  d'exposition (contrainte C4) : cochez-la seulement si vous disposez de preuves tirées de
  l'inventaire, de la CMDB ou d'un balayeur. Lorsqu'un instantané est chargé, chaque CVE affiche son
  inscription au KEV (et son utilisation connue par des rançongiciels), son score EPSS et son échelon.
  Liez des CVE à des scénarios à partir d'ici, récupérez celles qui sont déjà liées dans les scénarios,
  ou exportez le registre.
- **Importer** — les fichiers de l'API CVE 2.0 de NVD et les fiches CVE JSON 5 que vous avez
  téléchargés (le vecteur de base CVSS v4.0 et la CWE sont conservés ; les fiches uniquement en v3.1
  sont signalées pour une nouvelle cotation), ainsi que les exportations CSV de balayeurs ou de CMDB.
  L'application n'interroge jamais une API avec votre liste de CVE.
- **Explorateur CWE** — le Top 25 CWE 2024 et une recherche parmi 938 faiblesses ; chaque faiblesse
  affiche les techniques ATT&CK qui l'exploitent ainsi que les scénarios et les CVE qui la comportent.
- **Détail de la CVE** — tout ce qui est connu localement au sujet d'une CVE.

**Sources en ligne — mise à jour de KEV, EPSS et NVD.** Lorsque l'application a été démarrée avec son
lanceur, la fenêtre du lanceur exécute aussi un petit **assistant local de téléchargement**. Choisissez
ce qu'il faut télécharger :

| Source | Paramètres | Taille et durée |
|---|---|---|
| CISA KEV | dernier catalogue | environ 2 Mo, quelques secondes |
| FIRST EPSS | date du score (les jours précédents sont essayés si ce jour n'est pas encore publié) | environ 2 Mo, quelques secondes |
| Fiches CVE de NVD | *modifiées depuis la dernière mise à jour*, *modifiées dans une plage de dates*, ou **recharger le catalogue complet** | une plage : quelques minutes ; complet : environ 300 000 fiches — 10 à 20 minutes avec une clé d'API NVD, 30 à 60 minutes ou plus sans |

Le rechargement complet demande d'abord une confirmation. Une **clé API NVD** facultative (gratuite
auprès de NVD) rend les téléchargements NVD environ dix fois plus rapides ; elle est conservée uniquement
dans ce navigateur et n'est jamais écrite sur le disque.

Les téléchargements s'exécutent **en arrière-plan dans la fenêtre du lanceur** et sont enregistrés dans
`Downloads/CyberRiskGuardian-feeds` sur votre ordinateur. La liste **Téléchargements** affiche la
progression, vous permet d'annuler et propose **Charger** lorsqu'un fichier est prêt. Vous pouvez fermer
le navigateur — ou toute l'application — et revenir plus tard : la liste **Fichiers** affiche tout le
contenu de ce dossier avec un bouton *Charger* et indique s'il est déjà chargé dans cet espace de
travail. Seule la fenêtre du lanceur doit rester ouverte jusqu'à la fin d'un téléchargement ; si elle a
été fermée trop tôt, le téléchargement est marqué *interrompu* et peut être relancé.

Chargement d'un fichier :

- **NVD** — joint les fiches au registre sur cet ordinateur : chaque CVE du registre trouvée reçoit sa
  description, son vecteur de base et son score CVSS v4.0 (les fiches uniquement en v3.1 sont signalées
  pour une nouvelle cotation) et sa CWE. Récupérez d'abord les CVE de vos scénarios dans le registre si
  vous voulez qu'elles soient enrichies. La date de la mise à jour est mémorisée pour l'option
  *modifiées depuis la dernière mise à jour*.
- **KEV** et **EPSS** — sont mis en attente ; **Construire et utiliser l'instantané** les combine (ou
  l'un d'eux avec l'autre moitié de l'instantané actuel) en un nouvel instantané du contexte de menace
  assorti d'une nouvelle validité de 90 jours. Les échelons et les colonnes KEV/EPSS se mettent à jour
  partout.

Chaque chargement est inscrit dans l'**historique des mises à jour** de l'espace de travail. Sans
l'assistant local (application servie d'une autre façon), le même écran donne les liens de
téléchargement et un sélecteur **Charger les fichiers de Downloads** qui accepte les fichiers KEV JSON,
EPSS CSV(.gz) et NVD JSON ou JSON.gz.

**Liens suggérés entre vulnérabilités et scénarios.** Ouvrez **Vulnérabilités → Suggérer des liens**
pour tous les scénarios, ou **Suggérer des vulnérabilités pour ce scénario…** dans l'éditeur de
scénarios pour un seul. *Scénarios visés* restreint ou élargit l'exécution.

**Étape 1 — Appliquer les règles** (sur cet ordinateur, sans IA, rien n'est envoyé). Une CVE du
registre est proposée pour un scénario lorsque :

| Règle | Exemple de motif affiché | Confiance |
|---|---|---|
| L'actif d'inventaire du scénario mentionne la CVE | l'actif *Passerelle RPV* mentionne CVE-2024-21762 | Élevée |
| Le champ actif ou produit de la CVE nomme l'un des actifs du scénario | l'entrée du registre concerne l'actif « ehr » | Élevée si exposée, sinon Moyenne |
| La CVE comporte une faiblesse que comporte le scénario | même faiblesse CWE-287 | Moyenne (Élevée avec une correspondance d'actif) |
| La faiblesse de la CVE est exploitée par l'une des techniques ATT&CK du scénario | CWE-287 est exploitée par les techniques ATT&CK du scénario | Faible (Moyenne avec une correspondance d'actif) |
| Le produit de la CVE est nommé dans le scénario | produit « Fortinet FortiOS » nommé dans le scénario | Moyenne (Élevée avec une correspondance d'actif) |

Un scénario qui a des techniques ATT&CK mais aucune faiblesse reçoit jusqu'à deux propositions de CWE.
Les **propositions d'exposition** énumèrent les CVE du registre non encore confirmées qu'un actif
d'inventaire mentionne (Élevée) ou dont il exécute le produit (Moyenne) ; *Marquer les éléments cochés
comme exposés* les confirme et inscrit la preuve dans l'entrée du registre.

**Étape 2 — Demander à l'IA d'autres liens.** Les chaînes causales des scénarios, le registre et les
liens déjà proposés par les règles sont envoyés — vous voyez d'abord le contenu exact à envoyer — et le
modèle propose d'autres liens avec un motif et un niveau de confiance, émet des **doutes** sur les
liens proposés par les règles et nomme les scénarios qu'aucune vulnérabilité n'appuie. Une CVE
proposée qui ne figure pas au registre, ou un scénario qui n'existe pas, est écarté et comptabilisé.
Par défaut, cette étape s'exécute sur le **modèle local**, parce que le contenu envoyé est la liste des
vulnérabilités de l'organisation ; voir la section 8.3 pour modifier ce réglage.

**Revoir.** Les deux étapes aboutissent dans une même liste indiquant le scénario, la vulnérabilité (et
si son exposition est confirmée), le motif, la méthode (règles, IA ou les deux) et le niveau de
confiance. Les lignes de confiance élevée sont cochées par défaut. *Accepter les éléments cochés*
ajoute les liens aux scénarios ; *Rejeter les éléments cochés* supprime les propositions définitivement
— elles ne sont plus proposées. *Écarts* énumère les scénarios sans preuve de vulnérabilité (ils peuvent
tout de même être valides : un initié, une panne) et les CVE du registre qu'aucun scénario n'utilise
(elles peuvent justifier un nouveau scénario — Scénarios en lot → À partir de CVE). *Décisions
récentes* conserve qui a lié ou rejeté quoi, et par quelle méthode.

Un lien ne modifie aucun score. Pb(ψ,A) ne change que pour les CVE **exposées**, au moyen des
propositions de l'échelle que vous acceptez dans Contexte de menace (section 7.4.4).

### 7.4.3 Flux de menaces et réseaux sociaux {#feeds}

**Tri** (premier onglet). Un flux est une pile de manchettes ; un tri est une décision. Cet onglet
fusionne les éléments de la semaine en **histoires** — un identifiant CVE commun est déterminant, sinon
les manchettes sont comparées selon leurs mots significatifs — de sorte que trois médias couvrant une
même vulnérabilité deviennent une seule ligne portant les trois noms de source. Chaque histoire est
ensuite placée dans l'une de trois catégories, et le motif est toujours indiqué, en nommant la CVE, la
technique, la technologie ou le terme qui a correspondu :

| Catégorie | Ce qui y place une histoire |
|---|---|
| **Décision requise** | Une CVE inscrite au registre dont l'exposition est **confirmée** sur un actif, ou une correspondance à la fois sur une technique d'un scénario et sur une technologie que vous exploitez. |
| **À surveiller** | Une CVE inscrite au registre sans exposition confirmée, ou une correspondance sur une technique, une technologie, votre secteur ou votre région. |
| **Non pertinent** | Aucune correspondance. Conservé, et non écarté — « nous avons regardé et cela ne nous concernait pas » est un constat, et la seule façon de montrer que la semaine a réellement été lue. |

La frontière entre les deux premières catégories est le **filtre d'exposition** : la même règle que
*Contexte de menace* applique avant de proposer tout changement à `Pb(ψ,A)`. Une CVE que vous avez
inscrite au registre sans en confirmer l'exposition reste dans *À surveiller*, si retentissante que soit
la manchette. Chaque ligne des deux premières catégories nomme les scénarios et les actifs qu'elle
touche et renvoie à ceux-ci.

Le tri est **déterministe** : les mêmes éléments et le même espace de travail donnent les mêmes
catégories dans le même ordre, chaque fois. C'est pourquoi c'est lui, et non la lecture d'un modèle,
qui constitue le tri de référence.

**Synthèse hebdomadaire.** *Rédiger la synthèse* produit une synthèse en Markdown à partir du tri **sans
aucune IA** : la période, le nombre d'éléments et d'histoires, le nombre de doublons fusionnés, chaque
histoire avec ses sources et la raison de sa présence, et une section finale indiquant ce que la
synthèse n'a *pas* fait — aucun score de risque n'a été modifié ; `Pb(A)` et `Pb(ψ,A)` ne changent que
sur exposition confirmée, au moyen de l'Échelle des preuves de menace, chaque changement étant accepté
par vous ; le CVSS reste limité au score de base. Enregistrez-la dans le dossier des flux à côté du
condensé, ou copiez-la.

*Raconter au moyen de l'assistant IA* réécrit le même tri pour un public de gestionnaires. Le modèle
reçoit la consigne de n'énoncer aucun chiffre de risque. La synthèse sans IA demeure la version
officielle ; le récit est une note d'accompagnement, et il est présenté comme tel.

**Exporter le profil pour la tâche planifiée** écrit `briefings/triage-profile.json` dans le dossier des
flux : les technologies, les CVE inscrites au registre avec leur indicateur d'exposition, les
techniques des scénarios, le secteur, la région et les termes pondérés. Il ne contient **aucun nom
d'organisation, aucun texte de scénario et aucun nom d'actif**, de sorte que la tâche de fin de semaine
peut trier la semaine sans que l'espace de travail quitte la machine. Exportez-le de nouveau chaque fois
que vos actifs, vos CVE ou vos scénarios changent de façon importante ; la tâche utilise ce qu'elle
trouve et le dit clairement lorsqu'elle ne trouve rien.

**Le dossier doit être celui dans lequel la tâche travaille.** L'exportation indique le chemin absolu
où elle a écrit — lisez-le. L'assistant local écrit dans son propre dossier des flux,
`~/Downloads/CyberRiskGuardian-feeds` à moins que vous ne l'ayez modifié, tandis que la tâche planifiée
travaille dans le dossier qui lui a été attribué. Si les deux diffèrent, la tâche ne trouve aucun profil
et ne rédige aucune synthèse. Pour les accorder, inscrivez le chemin du dossier de la tâche sur la
première ligne de `feeds-dir.txt` à côté de `serve.py` et redémarrez le lanceur ; tout —
téléchargements, clés, synthèses — se trouve alors au même endroit.

**Un profil mince ne peut pas alimenter la première catégorie.** Si votre inventaire d'actifs et votre
registre des CVE sont vides, le profil est exporté sans technologies ni CVE, et l'écran l'indique. La
correspondance se limite alors aux techniques, au secteur et à la région, et *Décision requise* reste
vide par construction — elle exige une CVE inscrite au registre dont l'exposition est confirmée, ou une
technique et une technologie ensemble. C'est la conception qui fonctionne, non une anomalie : le tri ne
vaut que ce que vous avez consigné.

- **Sources et téléchargements.** Vos sources acceptées avec l'état de la clé, le dernier
  téléchargement, le nombre d'éléments et l'état. *Télécharger maintenant les éléments cochés* les
  exécute au moyen de l'assistant local ; une fois terminé, les fichiers sont chargés et mis en
  correspondance. *Charger les fichiers les plus récents* charge ce que la tâche planifiée a téléchargé.
  Les fichiers provenant d'ailleurs peuvent être chargés manuellement.
- **Pertinent pour cette organisation.** Éléments notés selon les termes de cet espace de travail — les
  CVE exposées du registre pèsent le plus, puis les IOC de la liste de surveillance, les fournisseurs,
  produits et logiciels des actifs, les technologies du profil, les termes surveillés, les techniques
  des scénarios, le secteur et la région. Survolez un score pour en voir les motifs.
- **Tous les éléments.** Chaque élément, avec recherche et filtres par source et par type (pulsations,
  IOC, avis, nouvelles, publications, victimes de rançongiciels, statistiques).
- **Agir…** sur un élément : placer ses IOC dans la **liste de surveillance**, ajouter ses CVE au
  registre des vulnérabilités comme non confirmées, ou le rattacher à un scénario comme **note de
  renseignement**.
- **Liste de surveillance des IOC.** État (surveillé, bloqué, recherché, trouvé dans la télémétrie,
  retiré), fréquence d'apparition de chaque indicateur dans les flux chargés ; exportation en CSV ou en
  ensemble **STIX 2.1** pour un pare-feu, un SIEM ou un EDR.

Les éléments des flux ne modifient jamais un paramètre. Lorsque la télémétrie confirme un indicateur
dans votre environnement, il s'agit d'un incident ou d'une entrée de fondement de la menace traitée
dans Contexte de menace.

### 7.4.4 Contexte de menace {#threat}

**Instantané.** Trois voies, dont l'une ne nécessite aucun réseau.

**Charger l'exemple fourni**. `examples/threat-context/threat-context-example.json` est livré avec
l'application — environ 1,5 Mo — et le bouton à côté du sélecteur de fichier le charge en un clic. Il
contient le **catalogue CISA KEV complet à sa date de construction (1 733 entrées), 38 533 scores EPSS,
l'Échelle des preuves de menace, les seuils et les contraintes**. C'est suffisant pour placer des CVE
sur l'échelle, exécuter la jointure d'exposition et terminer l'étape 5 du Processus sur une machine sans
aucun accès à Internet.

La table EPSS est **élaguée au plafond de l'échelon 1 de l'échelle elle-même** (0.05), en conservant
chaque score égal ou supérieur à ce plafond, chaque score dont le *centile* atteint le centile de
l'échelon 4, et chaque CVE inscrite au KEV. Cette règle est sans perte pour la classification : tout ce
qui est retiré aurait été à l'échelon 1 selon son score, et une CVE absente de la table est lue à
l'échelon 1 avec le motif *« EPSS below 0.05 (pruned from this snapshot) »*. Chacune des 147 271 CVE de
l'instantané source se classe de façon identique avec la table élaguée — c'est vérifié au moment de la
construction, et non présumé. Ce que l'élagage vous fait perdre, c'est le score exact d'une CVE qui
était déjà négligeable.

L'écran rappelle, à chaque visite, qu'il s'agit d'un exemple et non de renseignements à jour sur les
menaces. Téléchargez vos propres sources avant qu'un chiffre ne sorte de l'évaluation : l'exemple est
figé à une date, et un instantané qui semble à jour alors qu'il ne l'est pas est pire que pas
d'instantané du tout.

**Charger le vôtre.** Le JSON produit par `threat_snapshot.py` dans le dépôt
[`CyberRiskGuardian_ThreatIntel`](https://github.com/ITriskMgr/CyberRiskGuardian_ThreatIntel) —
`examples/threat-context/threat-context-shipped.json` dans ce dépôt — ou un instantané construit dans
l'application. C'est celui qu'il faut utiliser pour le travail réel : il contient EPSS, de sorte que
les probabilités d'exploitation et le garde-fou d'ancienneté s'appliquent tous deux.

L'instantané est stocké avec l'espace de travail. L'écran affiche sa fraîcheur par rapport à la durée
de vie de 90 jours, les nombres d'entrées KEV et EPSS, l'élagage et un tableau de provenance.

**Le fichier d'instantané, et ce qu'il faut en faire.** Un instantané est un fichier JSON nommé
`threat-context-YYYY-MM-DD.json` (la date à laquelle il a été récupéré). Lorsque vous en construisez un
dans l'application, deux boutons apparaissent :

- **Utiliser dans cet espace de travail** stocke l'instantané *dans l'espace de travail*, dans le
  stockage du navigateur sur cet ordinateur. **Aucun fichier n'est créé.** La jointure d'exposition,
  l'échelle et les scénarios l'utilisent immédiatement.
- **Télécharger threat-context-YYYY-MM-DD.json** enregistre le même instantané sous forme de fichier
  dans le dossier de téléchargement de votre navigateur (habituellement *Téléchargements*). Conservez ce
  fichier pour le charger dans un autre espace de travail ou sur un autre ordinateur au moyen du champ
  *Instantané* de cet écran, pour le remettre à un collègue, ou pour archiver les preuves qui ont appuyé
  une décision.

**Télécharger**, en haut, fait de même pour l'instantané déjà utilisé, et **Effacer** le retire de cet
espace de travail seulement. Les instantanés ne sont pas compris dans une sauvegarde par défaut
(section 7.10.6) : conservez le fichier si vous en aurez besoin plus tard.

**Générer un nouvel instantané.** Deux voies vers le même artefact :

- *Dans l'application* : téléchargez le JSON CISA KEV et le fichier quotidien EPSS `.csv.gz` à l'aide
  des liens fournis, ouvrez les deux fichiers, choisissez la validité, l'élagage, le garde-fou
  d'ancienneté et les modules régionaux, puis construisez. Utilisez-le dans l'espace de travail et/ou
  téléchargez-le.
- *Avec Python* : copiez la commande `threat_snapshot.py --refresh …` affichée et exécutez-la là où se
  trouve le dépôt.

Dans les deux cas, les catalogues sont téléchargés en entier et joints localement (contrainte C5).

**Jointure d'exposition.** Collez les CVE dont l'exploitation par l'organisation est confirmée, ou
cliquez sur *Utiliser le registre*. Chacune est placée sur l'**Échelle des preuves de menace** :

| Échelon | Fourchette | Libellé | Critère |
|---|---|---|---|
| 1 | 0.10–0.20 | Menace théorique | Techniquement possible, peu de preuves d'exploitation actuelle. |
| 2 | 0.30–0.40 | Activité de menace connue | Maliciels, techniques ou activités d'adversaires apparentés observés quelque part. |
| 3 | 0.50–0.60 | Campagnes actives pertinentes | Des organisations utilisant des technologies semblables sont ciblées. |
| 4 | 0.70–0.80 | Exploitation confirmée d'une technologie pertinente | Inscription au KEV, ou EPSS élevé, pour une technologie dont l'exploitation par l'organisation est confirmée. |
| 5 | 0.90–1.00 | Preuve organisationnelle directe | Activité malveillante correspondante dans la télémétrie propre de l'organisation. |

**L'échelon 5 signifie un incident, et non un risque prospectif.** Déclenchez d'abord la réponse aux
incidents.

**Changements proposés de Pb(ψ,A).** Pour chaque scénario lié à une CVE exposée et dont la valeur
Pb(ψ,A) se situe sous la fourchette de la CVE, l'application propose de la relever au **plancher** de
la fourchette et affiche le ratio avant et après. Rien ne change tant que vous n'acceptez pas :
l'acceptation inscrit une entrée `threat_basis` dans le scénario (preuve, date de l'instantané,
exposition, confiance) et une ligne dans le **journal des révisions** — quel scénario a changé, de
combien, et si son classement par rapport à la tolérance a changé en raison du paysage des menaces
plutôt que de l'organisation.

Les limites qu'aucun paramétrage ne peut lever : le renseignement étalonne seulement Pb(A) et Pb(ψ,A),
à une fourchette, jamais δe, δm, θ ou μ(E) ; sans exposition confirmée, il ne constitue qu'un contexte de
liste de surveillance ; le CVSS reste limité au score de base ; hors du KEV, une CVE de plus de dix ans ne
peut atteindre l'échelon 4 sur la seule base de l'EPSS.

### 7.4.5 Ontologie · CRGO {#ontology}

L'**Ontologie CyberRiskGuardian** (CRGO) est une description formelle de l'évaluation des risques de
cybersécurité — actifs, menaces, faiblesses, contrôles, scénarios et paramètres CRG — accompagnée d'une
bibliothèque d'environ 1 900 scénarios de risque. Chaque scénario est lié à des techniques MITRE ATT&CK,
à des faiblesses, à des contrôles du NIST CSF 2.0, du NIST SP 800-53 r5 et de l'ISO/IEC 27002:2022, aux
obligations de la Loi 25 du Québec qu'il peut déclencher, et à des estimations d'étalonnage. Chaque lien
comporte un niveau de confiance (élevé, moyen, faible) et un statut d'approbation.

> **Valeurs a priori d'étalonnage, pas des preuves.** Les valeurs de l'ontologie sont des
> estimations de l'IA établies en 2023 pour une organisation de santé fictive, ou des valeurs
> d'enseignant pour des cas pédagogiques. Ce sont des points de départ pour une discussion avec
> l'organisation : tout ce qui est tiré de l'ontologie porte la mention *Estimation analytique —
> validation requise*, et rien de ce qu'elle propose n'atteint un score tant que vous ne l'avez pas
> accepté.

**Comment l'application y accède.** Deux voies, une même forme de réponse :

1. **Le serveur MCP propre à l'ontologie** — `pipeline/mcp/crgo_server.py` dans le dossier de
   l'ontologie, le même serveur que celui qu'utilise Claude. L'assistant local le démarre sur votre
   ordinateur et communique avec lui ; le serveur lit ses propres fichiers et n'envoie rien nulle part.
   C'est la référence : son classement, la fusion des quasi-doublons et le signalement des lacunes sont
   ceux de l'ontologie elle-même.
2. **L'instantané livré avec l'application** — `data/crgo-snapshot.json`, l'exportation
   d'identification de l'ontologie. Utilisé lorsque l'assistant local n'est pas en marche ou que le
   serveur ne peut être démarré. Il est interrogé dans le navigateur au moyen d'une adaptation des
   règles du serveur ; chaque réponse qu'il donne est marquée *instantané*.

Chaque résultat indique laquelle des deux voies a répondu.

**Suggérer des scénarios.** L'organisation décrite dans les termes de l'ontologie, construite à partir
de l'espace de travail :

- **Secteur** — un mot présent dans le secteur du scénario (*santé*, *banque*, *commerce de détail*,
  *hôtellerie*) ;
- **Techniques ATT&CK observées** — tirées des scénarios déjà présents dans le registre ; ajoutez celles
  de vos incidents et de votre renseignement sur les menaces ;
- **Mots-clés** — systèmes ou faiblesses notables (*DME*, *télésanté*, *AMF*, *HL7*…) ; le serveur
  développe les synonymes ;
- **Catégories d'actifs présentes** et **Thèmes préoccupants** — cochez-les dans les vocabulaires de
  l'ontologie (dix catégories, vingt-trois thèmes).

Choisissez la **Confiance des liens** (élevée seulement, élevée et moyenne approuvées, ou toutes), le
nombre de scénarios *Par thème* et *Au plus*, s'il faut **Inclure les scénarios des cas pédagogiques**,
et — pour un exercice — **Test à l'aveugle : exclure le cas MediBec**, qui masque à l'ontologie les
scénarios propres à ce cas. Cliquez sur **Suggérer des scénarios**. Un scénario correspond lorsqu'il
partage un élément quelconque du profil ; les techniques et les mots-clés comptent double, le secteur
ajoute un point ; les quasi-doublons sont fusionnés sous un seul représentant (*Fusionnés* indique
combien) ; chaque thème demandé obtient ses représentants, puis un représentant pour chaque risque
couramment évalué dans toute organisation, puis les meilleurs autres.

Le résultat affiche les candidats, le nombre de candidats distincts et les **Thèmes sans scénario** —
les thèmes que vous avez demandés et qu'aucun scénario ne couvre. Ce sont les scénarios à rédiger
vous-même. Pour chaque suggestion : ses thèmes, ses techniques ATT&CK, le nombre de contrôles liés par
cadre, un *Risque a priori* en unités de risque CRG (un chiffre relatif issu de l'étalonnage de
l'ontologie, facteur 1000, appétit 0.30 — et non un score pour votre organisation) et **Détails** :
l'énoncé, les techniques, les faiblesses, les obligations de la Loi 25, les contrôles par cadre et les
valeurs a priori d'étalonnage.

Cochez ce qui convient et cliquez sur **Ajouter les cochés aux scénarios en lot**. Avec **Utiliser les
valeurs a priori de l'ontologie comme valeurs de départ**, chaque paramètre part de la valeur étalonnée
selon le cas dans l'ontologie (ou de la valeur de la bibliothèque 2023) avec la justification *Valeur a
priori de l'ontologie CyberRiskGuardian — pas une preuve organisationnelle* à un niveau de confiance Faible ;
décochez cette option pour faire partir chaque paramètre à 0,5. Dans la grille, ils sont marqués
*[CRGO]* et examinés comme tout candidat ; une fois au registre, ils conservent leur identifiant
d'ontologie, leurs thèmes, leurs contrôles et leurs obligations, qu'utilisent le Registre partagé des
risques et l'Éditeur de scénarios.

**Explorer.** *Un scénario* par identifiant (`LIB-F1436`, `MediBec/MED-A1`) ; *Contrôles pour une
technique* — la fréquence à laquelle chaque contrôle est lié aux scénarios de la bibliothèque qui
utilisent la technique, par cadre, avec le remplacement d'un identifiant de technique révoqué ;
*Scénarios traités par un contrôle* — pour un contrôle du CSF 2.0, du SP 800-53 ou de l'ISO/IEC 27002.

**Connexion.** Indique si le serveur MCP est en marche, prêt ou indisponible, et d'où provient sa
commande :

| Source | Signification |
|---|---|
| *défini dans Paramètres* | Vous avez indiqué l'interpréteur et le script du serveur dans cet onglet. |
| *tiré de la configuration de Claude Desktop* | Le serveur `crgo-ontology` enregistré pour Claude sur cet ordinateur est réutilisé, avec son propre Python. |
| *trouvé à côté de l'application* | Un dossier `CyberRiskGuardian-Ontology` a été trouvé près du dossier de l'application (ou dans `CRGO_HOME`). |
| *introuvable* | Aucun serveur : l'instantané répond. |

**Démarrer le serveur** (ou *Redémarrer*) le démarre immédiatement ; le premier démarrage construit son
magasin à partir des fichiers de l'ontologie, ce qui prend environ dix secondes. *Où se trouve
l'ontologie* vous permet de définir l'**Interpréteur Python** et le **Script du serveur
(crgo_server.py)** ; laissez les deux vides pour utiliser la recherche automatique. Le serveur a besoin
d'un Python doté des paquets `mcp` et `pyoxigraph` — celui qu'utilise Claude pour ce serveur les
possède. Décochez *Utiliser le serveur MCP de l'ontologie* pour toujours utiliser l'instantané. L'onglet
indique aussi la version et la taille de l'instantané.

#### Lien avec l'organisation — dss/v1, compliance/v1 et secops/v1

L'ontologie peut lire le contexte de **cette organisation** et consigner les résultats de cette
application — au moyen d'outils de son serveur, sur un graphe de l'organisation. L'ontologie énonce des
faits, des liens et leur statut de revue ; **elle ne calcule jamais un risque**. Le lien avec
l'organisation exige CRGO v0.9.1 ou une version ultérieure ; sa cinquième partie exige CRGO v0.10.0.

1. **Base de l'organisation.** Chaque identifiant des enregistrements de l'organisation commence par
   celle-ci, de sorte que deux organisations ne sont jamais confondues. La valeur par défaut,
   `https://crg.invalid/<workspace>/`, est privée (le domaine `.invalid` est réservé et ne se résout
   nulle part) ; utilisez une adresse que l'organisation contrôle si elle en possède une. Une base sous
   `https://w3id.org/crgo/` — l'espace de noms propre à l'ontologie — est refusée.
2. **Graphe de l'organisation.** *Construire le graphe de l'organisation* envoie les scénarios inclus au
   pont propre à CRGO (`crg2rdf.py`, avec le moteur de calcul `engine/crg_calc.py`) et ajoute, dans les
   termes de CRGO, les enregistrements de cette application : les essais des contrôles par ligne
   d'évaluation et par aspect, les constatations d'audit avec leurs clôtures et leurs réouvertures, les
   déterminations de conformité, les obligations liées aux scénarios, ainsi que le profil
   d'applicabilité avec son évaluation. Les totaux du graphe doivent être égaux à ceux de cette
   application (pastille **mêmes totaux que cette application**). Les fichiers sont écrits par
   l'assistant local dans un **dossier confidentiel** — `~/CyberRiskGuardian-confidential/crgo/` par
   défaut, un sous-dossier par espace de travail — jamais dans l'application, dans l'ontologie ni dans
   un dépôt git ; l'assistant local refuse un tel dossier.
3. **Contexte d'un scénario.** *Lire le contexte* renvoie, à une date donnée : les obligations
   candidates avec leur applicabilité (*applicable*, *non applicable*, *potentiellement applicable* →
   revue par une personne qualifiée, *inconnu* → lacune de preuve), l'état de conformité et la lacune de
   preuve ; chaque contrôle avec son dernier résultat par ligne d'évaluation et ses constatations
   ouvertes — une autoévaluation que contredit une ligne indépendante est présentée comme un
   **conflit** ; les estimations avec leur niveau de confiance, leurs hypothèses et la qualité de leurs
   éléments probants (faible ou très faible → *Estimation analytique — validation requise*). Il ne
   contient aucune cote de risque.
4. **Renvoyer les résultats sous forme de propositions.** Cochez des scénarios et des grandeurs —
   risque estimé, toléré, atténué et résiduel, le ratio risque-tolérance, la cible budgétaire — puis
   *Envoyer les résultats cochés sous forme de propositions*. Un document par grandeur, calculé par le
   moteur de cette application, avec la version du modèle de l'application, les intrants utilisés et le
   SHA-256 de l'évaluation exacte envoyée ; statut **proposé** et rien d'autre. CRGO le stocke dans le
   graphe proposé de l'organisation. Un renvoi n'est jamais une approbation, une acceptation du risque
   ni une décision de financement : celles-ci sont consignées par des personnes dans Gestion de la
   cybersécurité → Décisions.
5. **Contextes de conformité et d'opérations de sécurité** (CRGO v0.10.0, lecture seule). Choisissez une
   date de référence et **Lire les deux contextes**. Le graphe de l'organisation porte désormais aussi
   les enregistrements des modules de gestion dans les termes de CRGO — versions et énoncés des
   politiques, obligations et déterminations avec leurs preuves, exceptions, constatations et mesures,
   règles de détection, télémétrie, alertes, dossiers, approbations et exécutions.
   - **Contexte de conformité** (`crgo_compliance_context`, contrat compliance/v1) : chaque obligation
     avec son applicabilité, son état de conformité **selon la plus récente détermination consignée**
     (jamais inféré), l'état et la validité des preuves, les énoncés à l'appui (*correspondances — pas la
     conformité*) et les constatations ouvertes ; les dispositions légales sans exemption réglementaire
     (une exception interne ne déroge jamais à une loi) ; les constatations et les non-conformités avec
     leurs causes profondes et les mesures en retard ; les versions des politiques, des normes et des
     guides d'intervention.
   - **Contexte d'opérations de sécurité** (`crgo_secops_context`, contrat secops/v1) : la couverture
     par scénario et par technique, validée seulement par un essai de détection concluant ; les lacunes de
     détection ; les règles avec la télémétrie qu'elles exigent (une règle dont la télémétrie requise est
     muette ne détecte rien) ; les alertes non triées (*pas des incidents*), les actifs essentiels en
     premier ; les exécutions sans approbation valide (*un signal d'audit, pas un verdict*) ; le tri
     réglementaire en cours.

   Les enregistrements datés après la date de référence sont ignorés et ceux d'une autre organisation
   sont retenus. Avec une version plus ancienne de CRGO, la fiche indique que ces contextes exigent
   v0.10.0 ; tout le reste continue de fonctionner.

Lorsque l'ontologie refuse un document, le **Journal des renvois** en affiche le code et le message tels
qu'ils ont été reçus (`SCHEMA_INVALID`, `UNKNOWN_ORGANISATION`, `UNKNOWN_SUBJECT`, `TENANT_MISMATCH`,
`REFERENCE_NAMESPACE`, `STATUS_NOT_PROPOSED`, `MODEL_VERSION_MISSING`, `INPUT_UNKNOWN`) ; le lot s'arrête
et rien n'est retenté avec des données modifiées. Corrigez la cause — habituellement en reconstruisant
le graphe après avoir ajouté ou renommé des scénarios — puis envoyez de nouveau.

Dans l'**Éditeur de scénarios**, la fiche Ontologie · CRGO ajoute : les obligations que le scénario
peut déclencher, selon la notation de CRGO (`P-39.1 s. 10`) ; *Autres régimes, D3FEND et preuves
d'exploitation* — les obligations découlant de A-2.1, de la LPRPDE, de la ligne directrice B-13 du BSIF
et du RGPD, les contre-mesures MITRE D3FEND, ainsi que les données KEV/EPSS par technique et par
faiblesse, **présentées comme des éléments probants que l'exploitation se produit dans la nature,
jamais comme une vraisemblance** (l'EPSS n'est ni Pb(A) ni Pb(ψ,A), et le KEV ne dit rien des systèmes
propres à l'organisation) ; et *Contexte de l'organisation et éléments probants des contrôles* — le
contexte ci-dessus ou, sans le graphe, les éléments probants des contrôles consignés dans l'espace de
travail. Les incidents qui éclairent le scénario et les exceptions aux politiques sur lesquelles il
repose sont énumérés en dessous.

### 7.5 Gouvernance

Le système de gestion, les politiques, la façon dont l'organisation sait que ses contrôles
fonctionnent, les cadres qu'elle suit, les registres que partagent tous les modules de gestion, et la
revue de qualité. Chacun est un module qui peut être désactivé dans Paramètres → Modules, sauf Cadres
et normes.

### 7.5.1 Gestion de la sécurité de l'information {#isms}

Le système de gestion qui assure la cohésion de l'ensemble. Deux onglets :

- **Vue d'ensemble** — la *portée* et les *limites* du système de gestion ; les **objectifs de
  sécurité**, avec pour chacun la façon dont il est mesuré, sa cible, son responsable, son échéance,
  son statut et l'ICR qui le suit ; les **revues de direction** (date, organe, participants, intrants
  examinés, décisions, prochaine revue) ; et *Où en sont les éléments* : politiques, déclaration
  d'applicabilité, traitement du risque, constatations d'audit et incidents, chacun avec un lien.
- **Exceptions** — les exceptions aux politiques du **registre partagé des exceptions**
  (section 7.5.5), vues du point de vue du système de gestion : politique, périmètre, écart, contrôles
  compensatoires, scénarios dont le risque résiduel compte sur elle, approbateur, statut et expiration.
  Deux règles sont appliquées : **une exception ne déroge jamais à une loi** — une exception qui vise une
  obligation légale ou réglementaire ne peut être acceptée, car un écart par rapport à une loi est une
  non-conformité — et une exception acceptée exige un approbateur et une date d'expiration. **Une
  exception expirée n'est plus une mesure d'atténuation** : le bandeau énumère les scénarios qui
  comptent encore sur une telle exception, et l'éditeur de scénarios l'indique.

Les normes ISO/IEC 27001 et 27002 sont citées par identifiant seulement.

### 7.5.2 Gestion des PSI {#isp}

Les politiques de sécurité de l'information, de la rédaction à l'approbation, à la publication, à la
prise de connaissance, à la revue et au retrait. Chaque politique a des **versions** : l'approbation
fige une version avec une empreinte SHA-256 de son contenu, et toute modification ouvre une nouvelle
version en brouillon. **Une prise de connaissance, une correspondance ou un énoncé de politique n'est
jamais la conformité** : seule une détermination de conformité datée et appuyée par des preuves établit
un état de conformité (section 7.6). Sept onglets :

#### Vue d'ensemble {#isp-overview}

Les politiques par état, les revues en retard, la **couverture des prises de connaissance** de la
version en vigueur, les non-conformités ouvertes et les exceptions qui arrivent à expiration — chaque
chiffre avec son dénominateur. La couverture compte les personnes visées qui ont pris connaissance de
la version *exacte* en vigueur (son empreinte) ; une prise de connaissance d'une version précédente ne
compte pas. C'est un indicateur d'adoption, et non un indicateur de conformité.

#### Bibliothèque des politiques {#isp-policies}

Politiques, normes, procédures et lignes directrices, regroupées en **familles de politiques** (les
politiques, normes et procédures d'un même sujet). **Créer une politique** à partir de l'un des **seize
gabarits** — politique de sécurité de l'information, utilisation acceptable, contrôle d'accès et
authentification, classification et traitement de l'information, protection des renseignements
personnels, réponse aux incidents, gestion des vulnérabilités et des correctifs, sauvegarde et
rétablissement, sécurité des fournisseurs et des tiers, télétravail et appareils mobiles,
journalisation et surveillance, continuité des activités, cryptographie, développement sécurisé et
gestion des changements, utilisation de l'intelligence artificielle, sécurité physique — chaque énoncé
étant lié aux contrôles d'ISO/IEC 27002:2022 et du NIST CSF 2.0 qu'il met en œuvre. **Créer à partir du
gabarit** l'ouvre comme brouillon ; **L'ébaucher avec l'IA…** adapte le gabarit au profil de
l'organisation (aperçu, contenu à envoyer modifiable et niveau de créativité comme partout ailleurs ; le
modèle écrit *[à décider : …]* là où l'organisation doit choisir) ; **Politique vierge** part de zéro ;
**Créer tout le jeu de politiques en brouillons** crée un brouillon à partir de chaque gabarit non encore
utilisé. Les gabarits sont des points de départ, et non des avis juridiques. Téléchargements :
**Registre des politiques (.csv)**, **Politiques publiées (.md)**, **Énoncés et correspondances (.csv)**.

#### Éditeur de politiques {#isp-policy}

L'éditeur structuré : titre, type, famille, responsable, approbateur, intervalle de revue, objet et
portée, puis les **clauses** et les **énoncés**. Chaque énoncé a un identifiant stable, appartient à une
version précise et indique sa **modalité** — *doit*, *ne doit pas*, *devrait* ou *peut* (une ligne
directrice n'est jamais contraignante : *devrait* ou *peut*) — avec ses contrôles et la formation qu'il
exige. **Ajouter une clause**, **Ajouter un énoncé**, **Améliorer avec l'IA…**, **Télécharger (.md)**,
**Comparer deux versions** (énoncé par énoncé), **Supprimer le brouillon**. Une version approuvée ou
publiée est figée ; **Commencer une nouvelle version** ouvre un brouillon, et les versions figées
demeurent lisibles et comparables.

#### Versions et approbations {#isp-reviews}

Le cycle de vie et son registre : *Brouillon → En revue → Approuvé → Publié → Retiré*, avec **Soumettre
pour revue**, **Approuver**, **Rejeter (modifications demandées)**, **Renvoyer en brouillon**,
**Publier**, **Commencer une nouvelle version**, **Retirer**, **Rétablir en nouvelle version** et
**Marquer comme remplacée**. L'approbateur d'une version ne doit être ni son auteur ni la personne qui
l'a soumise ; la publication vérifie que le contenu porte toujours l'empreinte approuvée (**Vérifier
l'empreinte**). Les revues sont planifiées (date de revue) ou déclenchées par un changement
réglementaire, un incident, une constatation, un risque, un changement organisationnel ou
technologique. **Registre des approbations (.json)** exporte chaque transition avec qui, quand et
l'empreinte.

#### Applicabilité et affectations {#isp-applicability}

Des règles d'applicabilité par unité organisationnelle, rôle, système ou fournisseur, et des
**affectations** de politiques à des personnes ou à des groupes, avec échéances. Une politique sans
règle s'applique à tous ; avec des règles d'*inclusion*, au moins une doit correspondre, et une règle
d'*exclusion* l'emporte toujours. **Vérifier l'applicabilité** montre qui une politique atteint ; chaque
affectation conserve les règles qui correspondaient au moment où elle a été faite.

#### Prises de connaissance et formation {#isp-acks}

**Consigner une prise de connaissance** d'une version précise par une personne à une date ; les
exigences de formation et **Consigner la réussite** ; **Couverture des versions en vigueur** ;
**Registre des prises de connaissance (.csv)**. Une prise de connaissance indique qu'une personne a lu
et accepté une version — ce n'est pas la conformité, pas plus que la formation. La publication d'une
nouvelle version crée une nouvelle obligation de prise de connaissance : les prises de connaissance
antérieures restent au registre, mais ne comptent pas pour elle.

#### Non-conformités {#isp-issues}

**Consigner une dérogation à une politique** : une *non-conformité* (une exigence de la politique n'est
pas satisfaite) ou une *violation* (quelqu'un ne l'a pas respectée), avec ce qui l'a révélée (audit,
incident, surveillance ou journaux, autoévaluation, signalement par un employé, revue d'un
fournisseur), la gravité, le responsable, la mesure corrective et l'échéance. **Mesure corrective** la
crée dans le registre partagé des mesures ; **En faire un risque** ajoute un risque de catégorie
*Conformité* au registre des risques. Les **exceptions** — des dérogations acceptées et limitées dans le
temps — se trouvent dans le registre partagé des exceptions (**Ouvrir le registre partagé des
exceptions**) : une exception exige une justification, une date d'expiration et un approbateur qui
n'est pas le demandeur, et elle ne déroge jamais à une loi. Les exceptions encore consignées dans ce
module sont énumérées avec **Déplacer au registre partagé**. **Registre des non-conformités (.csv)**
exporte la liste.

#### Rédacteur de politiques de sécurité {#writer}

**Gouvernance → Rédacteur de politiques de sécurité** rédige l'ensemble des politiques de l'organisation — la
politique d'entreprise de sécurité de l'information, les politiques thématiques, les normes et les procédures
— en anglais, en français ou dans les deux langues, à partir d'une entrevue, des documents de l'organisation
et de l'ontologie CyberRiskGuardian (CRGO). **Le rédacteur rédige; la gestion des PSI gère** : chaque
document produit est un *brouillon* dans la gestion des PSI, où il est révisé, approuvé (figé par son
empreinte SHA-256), publié, affecté et fait l'objet de prises de connaissance. Rien n'est inventé : un fait
inconnu devient un espace réservé surligné comme `[DÉCISION : …]`, et une loi n'est utilisée qu'après qu'un
réviseur nommé a consigné qu'elle s'applique. Le rédacteur a sa propre version (0.1.0 bêta); son moteur
s'exécute dans l'assistant local sur cet ordinateur : le lanceur doit être en marche.

##### Départ {#writer-start}

Où en est le rédacteur, la **Langue des documents** (anglais, français ou les deux — chaque document est alors
rédigé deux fois avec les mêmes identifiants d'énoncés) et la profondeur de l'**Entrevue** (Express, environ
vingt questions; Standard, environ soixante). **Proposer des réponses à partir du profil et des documents**
lit le profil de l'organisation, les actifs essentiels et les documents de contexte de l'espace de travail
et propose des réponses, chacune avec sa source. **Effacer les données du rédacteur** oublie les réponses,
les faits, les décisions juridiques et la sélection; les politiques déjà dans la gestion des PSI restent.

##### Entrevue {#writer-interview}

Des questions sur l'organisation, regroupées en courtes sections. Chaque réponse indique sa provenance —
*votre réponse*, *tirée d'un document*, *tirée du profil de l'organisation* ou *valeur par défaut acceptée*
— avec qui et quand. **Inconnu**, **Non applicable** et **Décider plus tard** sont aussi des réponses : les
brouillons portent alors un espace réservé. Les *observations de gouvernance* sont des constats tirés
d'*Introduction à la gouvernance de la cybersécurité* que les réponses suggèrent; ce sont des points à
discuter, jamais des faits écrits dans une politique.

##### Documents et faits {#writer-documents}

Des faits proposés à partir des documents de contexte (Organisation → Documents de contexte) et du profil de
l'organisation : la question, la valeur proposée, la **citation** sur laquelle elle repose et l'endroit où
elle a été trouvée (document, page, paragraphe). **Confirmer** en fait la réponse; **Rejeter** l'écarte;
**Confirmer tout ce qui n'est pas en conflit** confirme les autres d'un coup. Quand deux sources se
contredisent, elles forment un *conflit*, et aucune valeur n'est utilisée avant que vous en confirmiez une.
Les passages qui ressemblent à des instructions destinées à une IA sont **mis de côté** : jamais lus pour en
tirer des faits, jamais envoyés à un modèle. Un fichier numérisé contient peu ou pas de texte : **Lire par
ROC…** le reconnaît sur cet ordinateur (Tesseract et Poppler doivent être installés; le fichier n'est
téléversé nulle part), et les faits lus par ROC reçoivent une confiance plus faible. **En proposer davantage
avec l'IA…** envoie le texte des documents par l'aperçu habituel et ne garde que les faits dont la citation
se trouve mot pour mot dans les documents.

Quand vous créez un espace de travail à partir de documents (Organisation → Espaces de travail), **Extraire
aussi les faits utiles aux politiques pour le rédacteur de politiques de sécurité** fait la même lecture
immédiatement, sans IA.

##### Applicabilité juridique {#writer-legal}

Les lois, règlements, contrats et référentiels qui peuvent s'appliquer. Pour les instruments que CRGO connaît
(P-39.1, A-2.1, R-22.1, LPRPDE, BSIF B-13, RGPD, C-1.1), l'évaluation du profil de l'organisation par
l'ontologie est présentée comme preuve; **Évaluer le profil maintenant** l'exécute, et **Les ajouter au
profil CRGO** ajoute les valeurs que votre entrevue implique (sans jamais marquer une liste comme complète —
l'inconnu reste inconnu). Les autres candidats (règles sectorielles, contrats, référentiels) sont ceux du
rédacteur. Pour chaque candidat, choisissez une **Décision** — *S'applique*, *Ne s'applique pas*, *Révision
juridique requise* — et indiquez le **Réviseur (une personne nommée)** et une **Justification**, puis
**Consigner**. Une clause qui dépend d'une loi n'est rédigée que lorsque son candidat *s'applique*. Ceci ne
constitue pas un avis juridique.

##### Bibliothèque {#writer-library}

Les 28 documents du catalogue par niveau — politique d'entreprise, politiques thématiques, normes et
procédures — avec leur priorité, ses raisons et les **scénarios** qu'ils traitent : ceux de cet espace de
travail dont les mesures de l'ontologie ou les mesures de traitement ont une mesure CRGO en commun avec le
document (en rouge au-dessus de la tolérance), et le nombre de scénarios de la bibliothèque CRGO que ses
mesures traitent. Cochez les documents et **Enregistrer la sélection**; **Utiliser la recommandation** coche
de nouveau l'ensemble recommandé.

##### Décisions {#writer-decisions}

Les choix dont dépendent les documents — délais, portées, approbateurs, fréquences — regroupés par document,
chacun avec sa valeur suggérée. **Accepter toutes les suggestions** remplit chaque décision sans réponse qui a
une suggestion et consigne chacune comme *valeur par défaut acceptée* par vous avec la date; **Accepter les
suggestions pour ce document** fait de même pour un document. Les décisions qui exigent une révision
juridique, ou qui n'ont pas de suggestion, ne sont jamais remplies automatiquement : elles restent ouvertes et
sont énumérées pour que vous décidiez. Les réponses déjà données ne sont jamais modifiées.

##### Générer les brouillons {#writer-generate}

**Générer les brouillons** crée ou actualise, pour chaque document sélectionné et chaque langue, un brouillon
de politique dans la gestion des PSI : l'objet et la portée, une clause par section et un énoncé par exigence
avec sa modalité et les identifiants de mesures CRGO; les politiques d'un même sujet partagent une famille de
politiques. Seul un brouillon change. Un document publié n'est régénéré comme nouvelle version que si vous
cochez **commencer une nouvelle version**; un document en révision ou approuvé est laissé tel quel. Un énoncé
modifié par quelqu'un après la dernière génération — dans l'éditeur de politiques ou par Word — est
**conservé** et signalé comme *conservé tel que modifié*. Les **contrôles de qualité** énumèrent les décisions
ouvertes, les clauses à soumettre à une révision juridique, les documents parents manquants, les écarts de
mise en œuvre et les documents qui se contredisent. **Améliorer la formulation avec l'IA…** reformule les
énoncés d'un brouillon; une reformulation est refusée si elle change un espace réservé, ajoute un nombre,
change le verbe modal ou trop la longueur, et vous cochez celles à appliquer.

##### Exportation et réimportation Word {#writer-word}

**Word (.docx)** écrit un document Word natif d'une politique — contrôle du document, table des matières,
clauses et énoncés numérotés, décisions ouvertes, traçabilité de chaque énoncé vers son fondement et ses
mesures — pour toute politique de la gestion des PSI, pas seulement celles du rédacteur (aussi dans l'éditeur
de politiques). Une version figée peut être exportée (**Word de la v… en vigueur**), jamais modifiée.
**Réimporter de Word…** lit une copie modifiée dans Word : chaque énoncé est associé par son marqueur caché
(ou par son numéro si le marqueur a été supprimé), chaque modification est montrée mot à mot — modifiée,
supprimée, ajoutée, avec un passage de *doit* à *devrait* signalé — et seules les modifications laissées
cochées sont appliquées, au brouillon.

### 7.5.3 Gestion de la cybersécurité {#csm}

Un module. Comment l'organisation sait que ses contrôles fonctionnent, qui gouverne et qui décide, et
ce qui s'est passé.

- **Essais des contrôles** — chaque essai d'un contrôle : le contrôle (un contrôle existant d'un
  scénario, ou une mesure de protection de l'inventaire), ce qui a été mis à l'essai, la date, la
  **ligne d'évaluation** (autoévaluation de la direction, deuxième ligne, audit interne, certificateur
  externe), l'**aspect** (conception, mise en œuvre, fonctionnement), le résultat (efficace,
  partiellement efficace, inefficace, non mis à l'essai), l'évaluateur et les éléments probants ; pour
  l'efficacité de fonctionnement, la période, la population, la taille de l'échantillon et les écarts.
  *Éléments probants des contrôles par ligne de défense* présente, pour chaque contrôle, le dernier
  résultat de chaque ligne, les constatations d'audit ouvertes et la confiance qui en découle
  (*confirmée par une ligne indépendante*, *abaissée*, *autoévaluée seulement*, *non vérifiée*).
  Lorsqu'un résultat indépendant est moins favorable que l'autoévaluation de la direction, le contrôle
  est signalé **conflit — à résoudre** : les deux demeurent visibles jusqu'à ce qu'une personne tranche ;
  l'application ne le résout jamais.
- **Gouvernance** — les organes de gouvernance et les comités (type, lien hiérarchique, mandat,
  membres, fréquence) ; les rôles par ligne (personne, rôle, ligne, organe, du, au) ; les **délégations de
  pouvoirs** (qui délègue à qui, pour quelles décisions — acceptation du risque, traitement,
  financement, exception à une politique —, la limite, les dates, la référence).
- **Décisions** — les fiches de décision : objet, type, issue (*ébauche — décision de la direction
  requise*, approuvée, rejetée, reportée, transmise à un niveau supérieur), date, décideur, délégation,
  justification, conditions. *Rédiger des fiches de décision pour les scénarios au-delà de la
  tolérance* crée des ébauches ; une décision autre qu'une ébauche exige une personne nommée, et une
  acceptation du risque, un financement ou une exception exige une délégation qui nomme cette personne,
  couvre ce type de décision et est valide à la date de la décision. Une fiche rédigée par
  l'application n'est décidée que lorsqu'une personne la confirme.
- **Incidents** — le registre des incidents : événements de sécurité, incidents consignés à partir de
  documents (à confirmer), incidents confirmés, confinement et fermeture ; gravité, actifs, les
  **scénarios qu'il éclaire**, la chronologie, l'impact, la cause et les leçons apprises. **Une alerte
  n'est pas un incident, ni une constatation** : un incident ne compte comme tel que lorsqu'une personne
  nommée le confirme à une date (SOAR → Dossiers → *Confirmer comme incident* le fait pour un dossier).
  Les mêmes enregistrements figurent dans SOAR → Incidents. Lorsque des renseignements personnels sont
  en cause, un incident confirmé exige une **évaluation de l'obligation de déclaration** en vertu de la
  Loi 25, art. 3.5 et, s'il y a lieu, du RGPD, art. 33 — une évaluation destinée à des personnes
  qualifiées, et non un avis juridique ; la Gestion de la conformité calcule les délais de notification
  à partir de la date de confirmation. Un incident éclaire la vraisemblance d'un scénario ; il ne la
  prouve pas : citez-le dans la justification de Pb(A) et de Pb(ψ,A).

### 7.5.4 Cadres et normes {#frameworks}

Deux registres, parce qu'il s'agit de deux choses différentes, et c'est en les confondant que les
outils de conformité se retrouvent avec des lignes impossibles à comparer.

Les **catalogues de contrôles** sont des listes de contrôles sélectionnables. Ils alimentent
*Atténuation des risques* et la déclaration d'applicabilité dans *Conformité*. Quatre sont intégrés
(votre liste, ISO/IEC 27002:2022, SP 800-53 Rev. 5, CSF 2.0, CIS v8.1, mesures d'atténuation ATT&CK).
Trois autres sont livrés avec l'application et chargés à votre demande :

| Catalogue | Identifiants | En vigueur | Familles |
|---|---|---|---|
| NIST SP 800-171 Revision 3 (mai 2024) | 130 | 97 | 17 |
| ITSP.10.171, deuxième version (octobre 2025) | 131 | 98 | 17 |
| COBIT 2019 — objectifs de gouvernance et de gestion | 40 | 40 | 5 domaines |

Ils ont été extraits des documents mêmes des éditeurs, et non saisis de mémoire, et chaque paquet
consigne sa source, son édition et sa date. Les identifiants retirés et non attribués sont conservés et
marqués, de sorte qu'une référence provenant d'une évaluation antérieure se résout encore au lieu de
disparaître silencieusement. Les deux éditions de la 800-171 ont été vérifiées l'une par rapport à
l'autre : chaque exigence en vigueur dans l'édition du NIST est présente dans l'édition canadienne, qui
en ajoute exactement une — **03.14.09 Poste de travail dédié à l'administration**. L'annexe A
d'ISO/IEC 27001:2022 est enregistrée comme alias d'ISO/IEC 27002:2022, et non comme une seconde copie
des mêmes 93 contrôles.

**Méthodes et normes** est un registre de citations, et non une liste de contrôles : ISO/IEC 27001,
27002 et 27005, NIST CSF 2.0, SP 800-30, SP 800-53, SP 800-171, ITSP.10.171, COBIT 2019, CIS, CVSS v4.0,
FAIR et le modèle CRG lui-même. Chaque entrée consigne ce qu'est la méthode, ce à quoi CyberRiskGuardian
l'utilise et — la partie qui compte lors d'un audit — **où CRG s'arrête**. CRG ne revendique la
conformité à aucune d'elles. Deux énoncés méritent d'être lus avant de citer l'une ou l'autre méthode :
FAIR et CRG sont des méthodes de quantification *parallèles*, et non des couches l'une de l'autre (FAIR
donne une distribution des pertes monétaires, CRG un indicateur sans dimension comparé à un risque
toléré), et CVSS n'est utilisé qu'en **Base seulement**, la raison étant énoncée.

**Quand une nouvelle édition paraît.** *Importer* accepte un paquet CRG, un catalogue NIST OSCAL ou un
fichier CSV. Rien n'est écrit avant que vous ayez vu les différences :

- contrôles **ajoutés**, **retirés** et **renommés** ;
- contrôles **renumérotés** — le cas où un contrôle conserve son titre sous un nouvel identifiant, ce
  qu'une simple comparaison ajouts/retraits présenterait comme une perte et un gain sans lien ;
- et l'**incidence** : chaque mesure et chaque ligne de déclaration d'applicabilité, dans tous les
  espaces de travail, qui renvoie à un contrôle que la nouvelle édition déplace ou supprime, nommée
  individuellement avec son nouvel identifiant lorsqu'il y en a un.

Rien n'est remappé automatiquement. Vous acceptez l'importation, puis vous corrigez vous-même les
références nommées — parce qu'une renumérotation qui semble évidente dans une comparaison ne correspond
pas toujours au même contrôle sur le fond. Chaque installation tient un journal des révisions
indiquant ce qui a été importé, quand, et ce que cela a changé.

Hors ligne, `tools/build_frameworks.py` convertit et valide un paquet sans l'application, et
`tools/extract.py` avec `tools/build_packs.py` reconstruisent les paquets intégrés à partir des PDF
sources.

### 7.5.5 Registres partagés {#shared}

Quatre registres tenus **une seule fois** et utilisés par tous les modules de gestion — PSI,
conformité, audit, gestion de la cybersécurité, SIEM et SOAR. Un enregistrement est lié à ce qu'il
concerne (`kind:id`, un par ligne — par exemple `obligation:OBL-001`, `policy:POL-03`,
`finding:F-002`, `case:CASE-01`), et chaque module affiche les enregistrements liés à ce que vous
consultez.

| Onglet | Ce qu'il contient | La règle |
|---|---|---|
| **Preuves** | Les métadonnées des preuves : ce qu'elles démontrent, pour quelle période, combien de temps elles restent valides, le dépositaire, l'endroit où elles sont conservées (chemin ou lien), un SHA-256 facultatif, et si elles ont été jugées suffisantes. | Une preuve expirée, ou jugée insuffisante, est une **lacune de preuve** — jamais un appui à un état de conformité. Le fichier reste là où il est conservé ; seuls sa description et son empreinte sont consignés. |
| **Mesures correctives** | Les mesures correctives et de remédiation issues des constatations, des non-conformités, des incidents et des leçons apprises : responsable, échéance, statut. | Une mesure n'est fermée que lorsque **quelqu'un d'autre que son responsable l'a vérifiée**. Les mesures en retard témoignent d'un fonctionnement faible des contrôles. |
| **Exceptions** | Les dérogations approuvées et limitées dans le temps aux exigences internes : périmètre, approbateur, contrôles compensatoires, expiration, scénarios qui comptent sur elles. | **Une exception ne déroge jamais à une loi** : un écart par rapport à une obligation légale est une non-conformité. Seule une autorité accorde une exemption réglementaire (Gestion de la conformité). |
| **Correspondances** | Des assertions de correspondance qualifiées entre un énoncé de politique ou un contrôle et une obligation ou une exigence d'un cadre : *exacte*, *complète*, *partielle*, *plus large*, *plus étroite*, *connexe* ou *contradictoire*, par rapport à quelle édition, pourquoi, avec quelle confiance et qui l'a revue. | **Une correspondance n'est jamais la conformité** : seule une détermination datée et appuyée par des preuves établit un état de conformité. Une correspondance revue nomme la personne qui l'a revue. |

Les enregistrements de preuves et les exceptions aux politiques saisis avant l'existence des registres
partagés y ont été déplacés, inchangés, par la migration des données (section 5.1).

### 7.5.6 Revue de qualité {#qc}

Dix-huit vérifications à exécuter avant qu'un rapport ou un renvoi ne quitte l'analyste, chacune avec
*réussi*, *à surveiller* ou *échec*, le détail, et un bouton menant à l'écran qui permet la correction.

| Vérification | Ce qu'elle vérifie |
|---|---|
| QC-01 | Les renvois vers l'ontologie sont des propositions accompagnées d'une version du modèle et des intrants. |
| QC-02 | Rien n'est dit approuvé à moins qu'une personne ne l'ait approuvé, en vertu d'une délégation de pouvoirs valide. |
| QC-03 | « Appuyé par un contrôle » n'est pas présenté comme « conforme ». |
| QC-04 | L'EPSS n'est pas utilisé comme vraisemblance (une vraisemblance égale au score EPSS de la CVE du scénario, ou une justification indiquant qu'elle a été fixée à partir de l'EPSS, échoue). |
| QC-05 | Une applicabilité inconnue est une lacune de preuve ; une applicabilité potentielle exige une revue par une personne qualifiée. |
| QC-06 | Les conflits entre lignes de défense sont résolus par une personne. |
| QC-07 | Les exceptions expirées ne sont pas comptées comme mesures d'atténuation. |
| QC-08 | Aucune exception ne déroge à une loi. |
| QC-09 | La base de l'organisation appartient à l'organisation. |
| QC-10 | Les cas fictifs et les valeurs a priori de l'ontologie ne sont pas des éléments probants d'étalonnage. |
| QC-11 | Les preuves sont à jour. |
| QC-12 | Le moteur reproduit la base de référence MediBec (84,491 / 41,104). |
| QC-13 | Les normes sous licence sont citées par identifiant seulement. |
| QC-14 | Aucune obligation n'est déclarée conforme sur la foi d'une correspondance, d'une prise de connaissance ou d'une attestation : chaque détermination *satisfaite* repose sur une preuve à jour du registre partagé. |
| QC-15 | Aucun incident n'est inféré d'une alerte : chaque incident est confirmé par une personne nommée, à une date. |
| QC-16 | Aucune action d'intervention n'est présentée comme autorisée sans approbation valide (les actions de confinement ou destructrices qui n'en ont pas sont énumérées comme signaux d'audit). |
| QC-17 | Les éléments TLP:RED et TLP:AMBER+STRICT restent hors des rapports, des recommandations, des justifications de scénarios, des communications et des exportations. |
| QC-18 | La confiance d'une source n'est jamais utilisée comme probabilité (une justification de vraisemblance qui s'appuie sur la confiance d'un objet STIX, d'un flux ou d'un indicateur échoue). |

Une réussite signifie que la règle n'a pas été visiblement enfreinte dans les données consignées ici ;
les vérifications appuient un réviseur, elles ne le remplacent pas.

### 7.6 Gestion de la conformité {#compliance}

Un seul écran dont les onglets sont énumérés directement dans le menu. Les obligations et leurs
sources, l'applicabilité, les programmes, les correspondances, les évaluations, les déterminations avec
preuves, les échéances, les soumissions et le changement réglementaire. Deux règles traversent
l'ensemble : **seule une détermination de conformité datée et appuyée par des preuves établit un état
de conformité** — jamais une correspondance, une prise de connaissance d'une politique ni une
attestation ; et il s'agit d'une **aide à la décision, et non d'un avis juridique** — l'applicabilité et
les interprétations exigent une revue par une personne qualifiée.

#### Tableau de bord {#compliance-dashboard}

Où en est la conformité : obligations applicables, déterminations et preuves, échéances, soumissions et
exposition juridique — chaque chiffre avec son dénominateur. *Non évalué* et *indéterminé* ne sont
jamais comptés comme conformes. Une exception qui concerne une disposition légale constitue une
exposition en matière de conformité, à moins qu'une autorité n'ait accordé une exemption.

#### Sources et obligations {#compliance-obligations}

Les **sources** réglementaires (lois, règlements, contrats, normes) avec leurs versions ou leurs
éditions ; les **obligations atomiques**, chacune citant sa source, sa version et sa disposition —
**Ajouter ses dispositions** les crée à partir d'une source ; les **interprétations** ; les
**autorités** ; et les **exemptions**. Le texte d'une obligation est une paraphrase, jamais le texte sous
licence d'une norme. Une interprétation peut être *protégée par le secret professionnel* : son contenu
est alors exclu des rapports et de l'IA. Seule une autorité réglementaire accorde une exemption ; une
exception interne ne déroge jamais à une loi.

#### Applicabilité juridique {#compliance-applicability}

Le profil de l'organisation dans les termes de l'ontologie : type d'organisation, lieu où elle est
établie, où elle offre des biens ou des services, ou surveille des comportements ; ses activités de
traitement avec leurs catégories de données, le lieu où se trouvent les personnes concernées et celui
où les données sont transférées ; et lesquels de ces éléments le profil énumère de façon complète.
*Évaluer dans le navigateur* exécute l'adaptation de l'évaluateur de CRGO ; *Évaluer avec CRGO
(assistant local)* exécute l'original. Chaque instrument — Loi 25 (P-39.1), A-2.1, R-22.1, LPRPDE,
B-13 du BSIF, RGPD, C-1.1 — est *applicable*, *non applicable*, *potentiellement applicable* (**revue
par une personne qualifiée requise**) ou *inconnu* (**lacune de preuve — renseignement organisationnel
requis**), avec les conditions remplies, non remplies et non résolues. Une valeur que le profil
n'énumère pas n'est considérée comme absente que pour les propriétés cochées comme complètes ; sinon, le
fait est manquant, et des données manquantes ne rendent jamais un instrument « non applicable ». Ceci
n'est pas un avis juridique.

#### Programmes et référentiels {#compliance-programmes}

Le programme de conformité, ses objectifs et les **référentiels adoptés** pour une portée énoncée. Une
adoption est une décision — qui a décidé, quand, pour quelle portée. Elle fait des exigences du
référentiel des engagements ; elle ne dit rien de la conformité à ces exigences.

#### Correspondances {#compliance-mappings}

Les correspondances qualifiées entre des énoncés de politique ou des contrôles et des obligations,
conservées dans le registre partagé des correspondances (section 7.5.5) : type de correspondance,
édition, justification, confiance, réviseur. Une correspondance indique comment deux exigences se
correspondent. Ce n'est jamais la conformité.

#### Cadres et listes de contrôle

**Cadres et listes de contrôle.** Cochez les cadres que suit l'organisation. Pour chacun, la
**déclaration d'applicabilité** énumère les contrôles avec leur applicabilité, leur statut, leur
maturité de 0 à 5 et la cible, le responsable et les preuves, ainsi que les mesures et scénarios liés
au moyen d'Atténuation des risques. *Marquer … comme mis en œuvre par des mesures* règle les contrôles
des mesures mises en œuvre. Les **écarts** (applicables, non ou partiellement mis en œuvre) sont classés
selon le risque résiduel des scénarios auxquels ils se rapportent ; *Créer une mesure* en amorce une.
Les listes de contrôle de la **Loi 25** et de la **LPRPDE** résument les obligations aux fins de la
gestion des risques, avec statut, responsable, preuves, échéance et contrôles connexes.

#### Exigences

**Exigences.** Les exigences de conformité propres à l'organisation, à côté des catalogues — lois,
règlements, contrats, normes et politiques internes. Chacune comporte un ensemble, une référence,
l'exigence, une catégorie, une source, un responsable, une échéance, son applicabilité, un statut, les
preuves et les **contrôles qui la satisfont** ; le tableau présente aussi les politiques de sécurité
publiées qui couvrent ces contrôles. Ajoutez-les une par une, ou importez :

- **Ajouter les obligations de la Loi 25 et de la R-22.1** — les obligations de la loi québécoise sur
  le secteur privé (P-39.1) et de la loi sur les renseignements de santé (R-22.1) que l'ontologie lie à
  des scénarios de risque ;
- **Ajouter les énoncés des politiques publiées** — chaque énoncé d'une politique publiée devient une
  exigence interne avec ses contrôles ;
- **À partir d'une liste** — une exigence par ligne : `set;reference;requirement;category;controls`.

Les exigences peuvent aussi être importées à partir d'un fichier CSV (**Importer des exigences**).

#### Campagnes {#compliance-campaigns}

Des campagnes d'évaluation portant sur un ensemble d'obligations, pour une portée et une période ; elles
produisent les déterminations de conformité (**Évaluer**). Chaque détermination exige une preuve du
registre partagé des preuves ou une lacune de preuve explicite. **L'évaluateur ne peut pas être le
responsable de l'obligation, et le réviseur qui approuve ne peut pas être l'évaluateur.** **Approuver et
figer** fige la campagne et ses déterminations.

#### Déterminations {#compliance-determinations}

La conformité à une disposition ou à une obligation à une date : l'état (*satisfaite*, *partiellement
satisfaite*, *non satisfaite*, *non évaluée*, *indéterminée*), qui a évalué, les preuves et la
**lacune de preuve**. *Satisfaite* exige une preuve à jour ; partiellement satisfaite, non satisfaite et
indéterminée exigent que la lacune soit précisée ; une preuve expirée ou insuffisante est une lacune, et
non un appui. Les déterminations faites dans une campagne approuvée sont figées. *Obligations touchées
par les scénarios* énumère, pour chaque scénario, les dispositions auxquelles il est lié et les
contrôles qui les **appuient** — un lien, et non une conclusion.

#### Calendrier réglementaire {#compliance-calendar}

Les échéances réglementaires : dates fixes (avec **Occurrence suivante** pour les échéances
récurrentes) et délais calculés à partir d'un événement, respectés ou non (**Consigner comme
respectée**). **Un délai déclenché par un événement ne court qu'à partir d'un incident confirmé** — une
personne nommée et une date —, jamais à partir d'une alerte ; le calcul est affiché avec chaque échéance.

#### Soumissions {#compliance-submissions}

Les avis et les dépôts auprès des autorités : **Préparer une soumission**, son approbation, la date
d'envoi, la référence de l'accusé de réception et la confirmation. L'application n'envoie rien à une
autorité, et rien n'est consigné comme envoyé sans une approbation humaine ; la personne qui a préparé
une soumission ne peut pas l'approuver. Un avis consigné à partir d'un incident SOAR figure aussi ici.

#### Changement réglementaire {#compliance-changes}

Les dispositions nouvelles, modifiées ou abrogées, leur incidence et le travail qu'elles entraînent
(**Créer les tâches**). Une modification crée une nouvelle version de l'obligation (**Nouvelles versions
d'obligations**) ; l'ancienne version reste rattachée aux déterminations faites par rapport à elle.

#### Évaluation assistée par l'IA

**Évaluation assistée par l'IA.** Choisissez la portée (vos exigences, par ensemble, ou une liste de
contrôle réglementaire), les éléments (non encore évalués, ou tous — jusqu'à quarante à la fois) et la
méthode :

- **Règles — hors ligne.** Pour chaque élément ayant des contrôles connexes, le statut découle de ce que
  l'espace de travail consigne : la déclaration d'applicabilité, les mesures de protection en place,
  les mesures mises en œuvre et les politiques publiées. Les preuves les nomment ; l'écart indique ce qui
  manque.
- **IA — aperçu avant l'envoi.** Les mêmes preuves (et, si la case est cochée, des extraits des
  documents) sont transmises au modèle, qui doit répondre **unknown** (inconnu) lorsque les preuves ne
  permettent pas de conclure, citer les preuves sur lesquelles il s'est appuyé, énoncer l'écart, un
  niveau de confiance et une étiquette de provenance. Contenu à envoyer modifiable, niveau de créativité
  sélectionnable.

Cliquez sur **Proposer**. La revue présente côte à côte le statut actuel et le statut proposé de chaque
élément, les preuves (modifiables) et l'écart. Les éléments déjà évalués sont laissés décochés.
**Appliquer les propositions cochées** écrit le statut et les preuves avec *la façon dont l'évaluation
a été faite* — *règles acceptées* ou *IA acceptée*, par qui, quand. Les évaluations appliquées sont
énumérées.

Chaque proposition est une ébauche ; les interprétations protégées par le secret professionnel ne sont
jamais envoyées.

#### Rapports {#compliance-report}

**Rapports.** Une vue unique couvrant les cadres, les listes de contrôle, les ensembles d'exigences, les
politiques de sécurité (publiées, revues en retard) et les non-conformités aux politiques.
**Enregistrer un instantané** conserve les pourcentages du jour afin que la revue suivante montre la
tendance. **Rapport de conformité complet (.md)** rassemble les déclarations d'applicabilité, les listes
de contrôle, vos exigences avec la façon dont chacune a été évaluée, les politiques de sécurité et leurs
non-conformités ; **Rapport imprimable** l'ouvre mis en forme pour l'impression ; **Exigences (.csv)**
exporte le registre. L'exportation Excel inclut la déclaration d'applicabilité dans sa feuille
Compliance_SoA.

La **posture de conformité** énumère chaque obligation avec son applicabilité, sa plus récente
détermination, l'état de ses preuves, les exceptions sans exemption et la prochaine échéance ; elle
n'établit jamais la conformité à partir d'une correspondance. Le rapport de conformité complet ajoute le
tableau d'applicabilité juridique (état, conditions non résolues, revue par une personne qualifiée
requise) et les déterminations, et cite la version de CRGO.

### 7.7 Gestion de l'audit {#audit}

La planification de l'audit fondée sur le risque, les missions, les feuilles de travail, les
constatations, les rapports et le suivi indépendant. La gestion de l'audit est la **seule propriétaire
des enregistrements d'audit** : les autres modules y renvoient, aucun ne modifie une conclusion d'audit.
Un état de conformité, une cote de risque ou une prise de connaissance d'une politique n'est jamais une
conclusion d'audit. Les normes d'audit de l'IIA, d'ISACA (ITAF), de l'AICPA, du COSO et de l'ISO sont
citées par identifiant seulement ; leur texte n'est pas reproduit. Les onglets sont énumérés directement
dans le menu :

#### Tableau de bord {#audit-dashboard}

L'avancement du plan, les constatations émises, les mesures en retard, les feuilles de travail en
attente de revue et la couverture d'assurance, avec leurs dénominateurs ; les missions par état, les
constatations à risque élevé non résolues et les événements d'audit récents. Les décomptes de
constatations ne comprennent que les constatations **émises** ; les observations préliminaires et les
constatations non encore émises sont présentées à part.

#### Charte et méthodologie {#audit-charter}

La **charte d'audit** (objet, autorité, indépendance, lien hiérarchique) et la **méthodologie d'audit**
(la façon dont les missions sont planifiées, réalisées et cotées, et les pondérations du plan fondé sur
le risque). Modifiez la copie de travail, puis **Approuver cette version** : elle est figée avec une
empreinte SHA-256 ; une modification ultérieure constitue une nouvelle version, et la précédente est
conservée comme remplacée.

#### Univers d'audit {#audit-universe}

Les entités auditables — processus, systèmes, fournisseurs, unités — avec leur risque inhérent, leur
dernier audit et leurs liens vers des actifs, des processus et des scénarios. Chaque entité représente
un enregistrement canonique (par exemple `asset:A-001`) : une seconde entité pour le même
enregistrement est refusée. **Ajouter les actifs critiques et élevés absents de l'univers** le fait en
une étape.

#### Plan d'audit {#audit-plan}

Le plan pondéré selon le risque : **Nouveau plan**, des entrées cotées à partir de l'univers — risque
inhérent, temps écoulé depuis le dernier audit et risque résiduel de leurs scénarios, lu dans le moteur
et jamais modifié — avec les pondérations et la version du risque source consignées (**Recoter**,
**Fixer la capacité**). Une entrée reportée ou annulée exige une raison et la personne qui l'a
autorisée ; une entrée obligatoire n'est jamais écartée en raison d'une cote faible. **Soumettre pour
revue**, **Approuver et figer** ; **Modifier (nouvelle version)** crée une nouvelle version ; **Créer la
mission** en lance une à partir d'une entrée.

#### Missions {#audit-engagements}

Les missions d'audit et d'assurance : type (audit interne, audit de conformité, assurance externe,
revue de deuxième ligne, revue d'autoévaluation des contrôles), portée, objectifs, critères
(identifiants : objectifs SP 800-53A, lois, politiques, contrats), équipe et un automate d'états
consigné — *planification → travaux sur le terrain → rapport → suivi → fermée*. Les travaux sur le
terrain exigent une portée, un responsable, des objectifs et des critères, et une équipe sans conflit
d'intérêts non résolu ; le rapport exige que chaque feuille de travail soit approuvée ; la fermeture
exige un rapport émis et des constatations fermées.

#### Procédures · SP 800-53A {#audit-programmes}

La **bibliothèque de procédures** (versionnée : modifier une version qu'une feuille de travail a déjà
utilisée crée une nouvelle version, de sorte que les travaux antérieurs conservent la procédure exacte
qu'ils ont suivie) ; les **objectifs d'évaluation SP 800-53A** — recherchez n'importe quel contrôle
SP 800-53 pour voir ses objectifs ainsi que les objets à soumettre à l'*examen*, les personnes à
rencontrer en *entretien* et les mécanismes à soumettre à l'*essai* (NIST SP 800-53A Rev. 5, tels que
CRGO les rattache à SP 800-53 Rev. 5.2.0) ; et les deux programmes de travail de CRGO, **AUD-PAM-001**
(accès privilégiés) et **AUD-VULN-001** (correction des vulnérabilités), avec la méthode, les objectifs,
le résultat attendu, la logique d'exception et l'échantillonnage. Ils sont **illustratifs — il ne s'agit
pas d'une méthodologie d'audit validée** : **Copier dans la bibliothèque de procédures** ou
**Planifier une mission avec ce programme** pour les adapter.

#### Feuilles de travail et échantillonnage {#audit-workpapers}

**Nouvelle feuille de travail** pour une procédure : préparateur, réviseur indépendant et approbation.
La personne qui a préparé une feuille de travail ne peut pas en être le seul réviseur. **Approuver** la
verrouille avec une empreinte ; **Rouvrir** est consigné avec la raison. **Tirer** un échantillon : il
conserve l'instantané de sa population, sa méthode, sa taille, son germe et les éléments sélectionnés,
de sorte que **Reproduire** donne la même sélection. **Consigner une observation** lorsqu'une exception
a été relevée.

#### Observations et constatations {#audit-findings}

Une **observation** est préliminaire : ce n'est pas une constatation, et elle n'est pas comptée comme
telle. **Valider comme constatation** en fonction des critères et des preuves : critère, constat,
cause, effet, importance, le contrôle et les scénarios concernés, et la recommandation. Une
constatation n'est **émise** qu'avec un critère, un constat, un effet et des preuves (ou une limite de
preuve énoncée) ; sa conclusion ne peut ensuite plus être modifiée. Une constatation ouverte sur un
contrôle réduit la confiance envers celui-ci, partout où le contrôle est utilisé.

#### Réponses et suivi {#audit-followup}

Les réponses de la direction, les mesures correctives (conservées dans le registre partagé des mesures
— une même mesure peut répondre à une constatation d'audit et à une non-conformité tout en laissant
chacune garder sa propre conclusion), la **vérification indépendante de suivi**, la fermeture et la
réouverture. La direction est responsable de la remédiation ; l'audit est responsable de la décision de
fermeture. Une vérification est faite par une personne autre que le responsable de la mesure ; une
vérification qui échoue rouvre la mesure et la constatation. **Fermer sur acceptation du risque**
consigne que la direction a plutôt accepté le risque. L'*historique des fermetures et réouvertures* est
conservé.

#### Rapports {#audit-reports}

Ébauche, revue de supervision, approbation, puis **Émettre le rapport** : un instantané émis et
immuable de la mission, de ses constatations émises, de ses recommandations et de ses réponses, avec une
empreinte SHA-256. Les corrections postérieures à l'émission sont des **addenda**, chaînés par
empreinte. **Exporter .md** et **Exporter .csv**.

#### Qualité et indépendance {#audit-quality}

Les revues de supervision et de qualité, les déclarations de conflit d'intérêts et les mesures de
sauvegarde. Une personne ayant déclaré un conflit sur une mission ne peut y être affectée tant qu'une
mesure de sauvegarde n'a pas été consignée et autorisée par quelqu'un d'autre ; un réviseur ne revoit
jamais son propre travail.

#### Rapports SOC et éléments probants {#audit-assurance}

Les rapports SOC et autres rapports d'assurance reçus des organisations de services — type, période,
opinion, catégories des Trust Services Criteria, **exceptions**, les **contrôles complémentaires de
l'entité utilisatrice** attendus de vous et la façon dont vous y répondez, les scénarios qui dépendent
du fournisseur — et le registre partagé des preuves, lié aux missions, aux feuilles de travail et aux
constatations. **Calculer l'empreinte d'un fichier local et l'inscrire** consigne son SHA-256 et sa
provenance ; le fichier lui-même reste là où il est conservé. Les éléments probants dont la date de
validité est dépassée sont signalés comme périmés.

#### Traçabilité {#audit-trace}

La chaîne de l'univers à la fermeture — univers → entrée du plan → mission → procédure → feuille de
travail → observation → constatation → recommandation → réponse → suivi → fermeture — avec les ruptures
de chaque chaîne.

### 7.8 Opérations de sécurité

Un SIEM et un SOAR **locaux** pour l'analyste de risque et la classe. Rien ici ne se connecte à un
produit en direct : les listes de télémétrie, les règles, les alertes, les indicateurs, les guides
d'intervention et les dossiers sont **importés à partir de fichiers** exportés par vos outils (formats
dans `docs/SIEM-SOAR-IMPORT-FORMAT.md`), les actions d'intervention sont **consignées à la main**, et
les guides d'intervention sont mis à l'essai par **simulation à blanc** — rien n'est exécuté sur un
système réel. Votre SIEM demeure le système de référence pour les événements : un événement, ici, est
un pointeur (référence, heure, empreinte, lien). Rien ici ne modifie une cote de risque.

Les règles, telles que CRGO les énonce :

- **Une alerte n'est jamais un incident.** La transmission ouvre un dossier SOAR ; seule une confirmation
  par une personne nommée, à une date, fait un incident.
- **Rien n'autorise une action d'intervention.** Les approbations sont des décisions humaines consignées
  dans le SOAR ; une action sans approbation valide est un signal d'audit, jamais une autorisation donnée
  par l'application.
- **La couverture n'est validée que par un essai de détection concluant** de la version courante de la
  règle, avec une télémétrie saine.
- **La confiance d'une source n'est pas une probabilité.** La confiance d'un producteur (0–100) est
  affichée telle qu'énoncée et n'alimente jamais Pb(A) ni Pb(ψ,A) ; la correspondance d'un indicateur
  n'est pas une attribution.
- **Respectez TLP 2.0.** Les éléments TLP:RED et TLP:AMBER+STRICT sont masqués à l'écran à moins que
  vous ne les affichiez sur cet ordinateur, ne sont jamais envoyés à l'IA et sont exclus des
  exportations à moins que vous ne choisissiez de les conserver marqués.

### 7.8.1 SIEM {#siem}

La surveillance de la sécurité à partir de fichiers locaux : état de la télémétrie, règles de
détection, couverture des scénarios de risque, alertes et indicateurs de menace.

#### Vue d'ensemble {#siem-dashboard}

L'état de la télémétrie, le cycle de vie des règles, la couverture, la file des alertes et les
indicateurs à une **date de référence** (**Aujourd'hui** la réinitialise). Changez la date pour voir
l'état consigné ce jour-là : les essais, les observations d'état et les changements de statut
ultérieurs sont ignorés.

#### Sources de télémétrie {#siem-sources}

Les sources qui alimentent la détection (une classe d'événements OCSF peut être nommée), leur cadence
attendue et leur état — *saine*, *dégradée* ou *muette* — avec **Consigner la santé** pour une
observation. Une source est muette lorsque sa dernière observation d'état l'indique, ou lorsque son
dernier événement est plus ancien que trois cadences attendues. **Une règle dont la télémétrie requise
est muette ne détecte rien.** Les enregistrements d'événements sont des pointeurs vers le SIEM ;
l'événement lui-même y reste.

#### Règles de détection {#siem-rules}

Les règles avec leur version, leur statut de cycle de vie (*brouillon*, *en test*, *production*,
*désactivée*, *retirée*), leurs techniques ATT&CK, leurs scénarios, la télémétrie requise et les
**essais de détection**. **Importer le Sigma collé** (ou un fichier Sigma dans l'onglet Importer)
conserve le titre, l'identifiant, le statut, le niveau, la description, la source de journaux, les
étiquettes `attack.t…` et le bloc de détection ; un statut Sigma ne met jamais une règle en production.
Une règle ne passe en production qu'à partir de l'état en test, après un essai de détection concluant de
sa version, avec le nom d'un approbateur qui n'en est pas le responsable.

#### Couverture et lacunes {#siem-coverage}

La matrice de couverture : quels scénarios et quelles techniques ATT&CK sont détectés, par quelles
règles, validés par quel essai. *Validée* exige un essai de détection concluant de la règle à la date de
référence ou avant ; une télémétrie requise muette ou dégradée rend la couverture *dégradée* ; une règle
en brouillon, désactivée ou retirée n'en donne aucune (*absente*) ; une règle jamais mise à l'essai est
*non vérifiée*. **Consigner une lacune** pour ce qui est absent ou dégradé, et **Mesure corrective** la
lie au registre partagé des mesures.

#### Alertes et tri {#siem-alerts}

Les alertes importées du SIEM ou d'observations STIX, dans une **file de tri où les actifs essentiels
viennent en premier**, puis selon la gravité pondérée par la criticité de l'actif — et non selon l'heure
d'arrivée. Réglez le tri (*nouvelle*, *en cours de tri*, *bénigne*, *faux positif*…), **Ajouter la
note**, ou **Transmettre à un dossier SOAR**. Une alerte n'est jamais un incident : la transmission
ouvre un dossier, et seule la confirmation d'un incident par une personne nommée fait un incident.

#### Indicateurs et TLP {#siem-intel}

Les indicateurs de menace avec leur source, leur validité, la **confiance de la source** telle
qu'énoncée et le marquage **TLP**, à côté de la liste de surveillance des flux de menaces
(*Indicateurs du SIEM et des flux de menaces*). Un indicateur révoqué, ou dont la date *valide
jusqu'au* est dépassée, est **périmé** et n'appuie aucune inférence. **Exporter les indicateurs
(.csv)** demande quoi faire des éléments TLP:RED et TLP:AMBER+STRICT : **Exporter sans eux** ou **Les
inclure, marqués**.

#### Importer {#siem-import}

L'importation à partir de fichiers locaux : l'enveloppe `crg-siem-import/1` (JSON), Sigma (YAML), des
ensembles STIX 2.1, des listes d'alertes (JSON ou CSV), des sources de télémétrie et des indicateurs
(CSV) — déposez un fichier ou **Importer le texte collé** ; avec *Déterminer d'après le fichier*, le type
est lu à partir du contenu. Chaque importation est consignée avec son SHA-256 dans l'historique des
importations et dans Paramètres → Journaux. Les importations ajoutent des enregistrements et n'écrasent
jamais une alerte d'origine ; un doublon est compté et écarté.

### 7.8.2 SOAR {#soar}

Les dossiers, les incidents, les guides d'intervention versionnés, les points d'approbation, les
actions consignées à la main et les simulations à blanc. Les intervenants consignent ce qu'ils ont fait,
quand, avec quel identifiant de tentative et quelles preuves, et chaque action est vérifiée par rapport
aux approbations consignées.

#### Vue d'ensemble {#soar-dashboard}

Les dossiers ouverts, les incidents confirmés, les **exécutions sans approbation valide** et l'état de
préparation des guides d'intervention. **Importer un fichier SOAR** lit un fichier JSON local
`crg-soar-import/1` (guides d'intervention, dossiers, points d'approbation, approbations, exécutions,
simulations, leçons) ; les enregistrements non valides sont écartés et énumérés dans le **Journal
d'importation**, et l'importation est consignée dans le journal des données.

#### Dossiers {#soar-cases}

Les enquêtes : chronologie (**Ajouter à la chronologie**), personne assignée, statut, artefacts
forensiques et actions consignées dans le dossier. Un dossier passe par *ouvert → en investigation →
confiné → éradiqué → rétabli → fermé*, une étape à la fois ; **Fermer le dossier** exige une
justification. **Confirmer comme incident** exige le nom de la personne qui confirme et la date : il crée
ou lie l'incident dans le registre des incidents, et la Gestion de la conformité calcule les délais de
notification à partir de la date de confirmation.

#### Incidents {#soar-incidents}

Le registre des incidents — les mêmes enregistrements que Gestion de la cybersécurité → Incidents —
avec les impacts, les communications, les vérifications du rétablissement et les mesures de
l'intervention (**Proposer à partir des dates consignées** remplit les délais de détection, de
confinement et de rétablissement). Un avis à un organisme de réglementation est aussi consigné comme
soumission réglementaire dans la Gestion de la conformité.

#### Guides d'intervention {#soar-playbooks}

Les guides d'intervention versionnés : étapes, actions, **classes de risque**, points d'approbation et
preuves attendues. Modifiez la version en brouillon (**Ajouter une étape**) ; **Publier et figer cette
version** la fige avec un SHA-256 (**Vérifier l'empreinte**) ; les versions publiées ne sont jamais
modifiées — **Nouvelle version brouillon à partir de la version en vigueur**. Une étape de confinement
ou destructrice doit exiger un point d'approbation.

#### Points d'approbation {#soar-approvals}

Un **point d'approbation** indique quelles classes de risque exigent une approbation et qui peut
approuver. Une **décision d'approbation** est prise par une personne autre que le demandeur, pour une
portée et une période de validité, et peut être révoquée (**Révoquer**). Une préautorisation est
toujours bornée par une portée et une date d'expiration.

#### Actions {#soar-actions}

Les actions d'intervention consignées à la main : qui a fait quoi, quand, l'identifiant de tentative,
les preuves et l'approbation invoquée. Chaque exécution est vérifiée par rapport aux approbations —
*absente*, *expirée*, *révoquée*, *pas encore valide*, *autorité inappropriée*, *non correspondante* ou
*non accordée*. Il s'agit d'un signal d'audit, jamais d'une autorisation donnée par l'application.

#### Simulations {#soar-simulations}

**Effectuer une simulation à blanc** d'une version de guide d'intervention sur un dossier ou un
scénario (**Parcourir les étapes (simulation à blanc)**) : rien n'est exécuté. La simulation signale les
étapes qui exigent une approbation et celles qui n'ont pas de preuve attendue, puis **Consigner le
résultat** — réussie ou échouée, avec une date. Un guide d'intervention est considéré comme mis à l'essai
lorsqu'une simulation réussie existe pour sa version courante.

#### Leçons apprises {#soar-lessons}

Les leçons tirées des dossiers et des incidents ; **Créer une action corrective** en place une dans le
registre partagé (Registres partagés → Mesures correctives), où elle n'est fermée qu'après une
vérification indépendante.

### 7.9 Registre partagé des risques {#registry}

Un **catalogue partagé de risques alimenté par plusieurs organisations**. Son but : permettre à une
organisation de voir les risques que des organisations semblables ont évalués — même secteur, même
région, même taille, mêmes réglementations — et de contribuer les siens, anonymisés. Tous ses écrans se
trouvent dans le menu **Registre partagé des risques**.

> **Comment il est partagé.** Les contributions circulent sous forme de paquets (JSON, schéma
> `crg-registry/2`) par l'entremise d'un **dossier partagé** — un dossier Google Drive, OneDrive ou
> SharePoint synchronisé sur l'ordinateur de chaque participant — ou de la boîte d'envoi de l'assistant
> local, que la tâche planifiée téléverse dans le dossier du registre sur Drive. Chaque installation lit
> les paquets de ce dossier dans sa propre copie du catalogue. Il n'y a pas de serveur central ; un
> serveur d'équipe est conçu (`MULTIUSER-ARCHITECTURE.md`, option B) et conservera le même format de
> paquet.

**Une fiche de risque.** Chaque contribution est un risque décrit comme une chaîne causale — source de
menace, événement, faiblesse, actifs, conséquence — avec son traitement (la décision et les mesures
avec leurs contrôles), les six paramètres et le CVSS du contributeur, la gravité de son ratio
résiduel/toléré sous forme de tranche, et un **catalogue** :

| Dimension | Pourquoi |
|---|---|
| Secteur d'activité | Familles alignées sur le SCIAN, de sorte qu'un hôpital et un réseau de cliniques se rejoignent sous *Soins de santé*. |
| Sous-secteur | Texte libre, généralisé lors de l'anonymisation (« réseau de cliniques privées »). |
| Région | Pays et province ou État — là où le paysage des menaces et le droit diffèrent. |
| Taille de l'organisation | Une tranche, jamais un effectif. |
| Régimes réglementaires | Loi 25, LPRPDE, HIPAA, RGPD, PCI DSS… — les risques suivent les obligations. |
| Thèmes de l'ontologie | Les 23 thèmes de l'ontologie (rançongiciel, tiers, identité…). |
| Catégories d'actifs | Les 10 catégories de l'ontologie (infonuagique, TO/IdO, identité…). |
| Type de source de menace | Malveillante, accidentelle, environnementale, structurelle. |
| Dimensions d'impact | Confidentialité, disponibilité, vie privée, sécurité des personnes, finances, aspects juridiques… |
| Techniques ATT&CK | Comment cela se produit — la langue commune du renseignement sur les menaces. |
| Contrôles | Références ISO/IEC 27002, NIST CSF 2.0 et SP 800-53 de ce qui traite le risque. |
| Tranche de maturité | La maturité CSF globale du contributeur, sous forme de tranche — contexte pour les valeurs. |
| Tranche de gravité | Tirée du ratio résiduel/toléré du contributeur — jamais les chiffres bruts. |
| Niveau de preuve | Incident observé, évalué, hypothétique ou renseignement sur les menaces. |
| Valide jusqu'au | Les risques vieillissent ; une fiche dont la date est dépassée est affichée comme périmée. |

Les vocabulaires de l'ontologie permettent d'aligner les fiches de différentes organisations sans que
quiconque ait à s'entendre sur les mots : un scénario lié à l'ontologie (Éditeur de scénarios →
*Ontologie · CRGO*) transmet ses thèmes, ses catégories d'actifs et ses types de source de menace à sa
fiche.

### 7.9.1 Parcourir et rechercher

**Lire le dossier partagé** lit tous les paquets du dossier partagé et de la boîte d'envoi (l'assistant
local doit être en marche) ; **Lire des fichiers de paquet…** lit les paquets que vous avez reçus
autrement. Les filtres : mots de recherche, secteur d'activité, région, taille, thème, catégorie
d'actif, réglementation, source de menace, technique ATT&CK, gravité et preuve, avec **Fiches modérées
seulement** et **Masquer les fiches périmées**. **Organisations comme la mienne** règle les filtres à
partir de votre profil. **Détails** affiche une fiche au complet. Cochez des fiches et cliquez sur
**Utiliser les fiches cochées dans cet espace de travail** : elles vont dans Scénarios en lot, marquées
*[Registre]*, chaque paramètre à un niveau de confiance Faible avec la justification *décrit une autre
organisation ; réestimez pour celle-ci*. **Télécharger ces fiches** enregistre l'ensemble filtré sous
forme de paquet.

### 7.9.2 Contribuer des risques

**Utilisateurs privilégiés seulement** : en mode utilisateur unique, la seule personne ; en mode
multiutilisateur, un administrateur ou un utilisateur détenant le rôle **A** (Approbateur) à
l'étape 13. Les autres peuvent parcourir.

1. **Les risques à partager** — cochez des scénarios de l'espace de travail.
2. **Leur classement au catalogue** — rempli à partir du profil (secteur, sous-secteur, région, taille,
   réglementations, tranche de maturité) ; ajustez-les, choisissez le **niveau de preuve** et la
   validité en mois.
3. **Anonymisation** — **activée par défaut**. Les noms de l'organisation, des personnes et des actifs,
   les adresses de courriel, les adresses IP, les hôtes internes et les montants sont remplacés ; la
   région est conservée au niveau de la province ou de l'État (ou du pays — *Paramètres du registre*)
   et la taille sous forme de tranche. La désactivation de l'anonymisation demande une deuxième
   confirmation, et les fiches portent alors la mention *non anonymisée*. L'écran énumère tout terme de
   l'espace de travail encore présent et affiche le paquet lui-même avant que vous le partagiez.
4. **Partager** — **Partager dans le registre** écrit le paquet dans le dossier partagé (ou la boîte
   d'envoi) ; **Télécharger le paquet** vous remet le fichier.

### 7.9.3 Mes contributions

Ce que cette installation a partagé : date, paquet, fiches, emplacement, anonymisé ou non, espace de
travail. **Retirer** publie un paquet de *retrait* : les autres installations marquent ces fiches comme
retirées la prochaine fois qu'elles lisent le dossier. Les copies déjà prises ne peuvent pas être
rappelées.

### 7.9.4 Modération

Les utilisateurs privilégiés approuvent ou rejettent les fiches en attente d'une décision — vérifiez
que chacune est anonymisée, décrit une véritable chaîne causale plutôt qu'un nom de menace, et est
classée de façon sensée ; un rejet exige un motif. **Publier le paquet validé** écrit les fiches
approuvées et à jour en un seul paquet ; les lecteurs qui cochent *Fiches modérées seulement* voient
exactement cet ensemble.

### 7.9.5 Publier et partager — le paquet complet {#share}

**Publier et partager** publie l'**ensemble** du registre des risques et du registre des scénarios de
l'espace de travail en un seul paquet (`crg-registry/1`), à l'intention de la direction, des auditeurs
ou d'un partenaire. Choisissez le contenu (registre des risques avec menaces et vulnérabilités, registre
des scénarios, mesures), la portée et le format (JSON, Markdown, CSV). **Anonymiser ce paquet** remplace
les noms de l'organisation, les noms des personnes, les noms d'actifs et d'hôtes, les adresses IP, les
URL et domaines internes, les adresses de courriel, les numéros de téléphone et les codes postaux,
transforme les montants en fourchettes et, au besoin, tronque les dates, supprime le texte libre et
remplace votre propre liste de termes ; les identifiants ATT&CK, CWE, CVE et de contrôles ainsi que les
paramètres sont conservés. Lisez l'aperçu : un bandeau énumère tout terme de l'espace de travail encore
présent. Ensuite, choisissez **Télécharger**, **Copier** ou **Publier dans le registre partagé**.
Chaque publication est journalisée ; la table de réidentification reste dans l'espace de travail et
n'est jamais publiée. **Importer un registre partagé** réutilise les scénarios d'autres organisations
comme bibliothèque — les scénarios importés sont exclus du calculateur jusqu'à ce que vous les ayez
examinés. Le Registre partagé des risques lit aussi ces paquets.

### 7.9.6 Paramètres du registre

L'**alias du contributeur** affiché sur vos fiches à la place du nom de votre organisation ; la
**granularité de la région à l'anonymisation** (province ou État, ou pays seulement) ; le **dossier
partagé du registre sur cet ordinateur** ; les dimensions recommandées avec la raison de chacune ; les
paquets lus sur cet ordinateur, et **Oublier les fiches lues** (vos contributions et vos décisions de
modération sont conservées).

### 7.10 Outils

### 7.10.1 CVSS v4.0 {#cvss}

Un calculateur de score de base. Les métriques Threat et Environmental sont délibérément absentes.
Collez un vecteur pour le charger, l'envoyer au calculateur de risque ou — lorsque l'outil est ouvert à
partir d'un scénario — l'y enregistrer.

### 7.10.2 Budget — années, projets pluriannuels et fourchettes, de l'aversion pour le risque à la recherche du risque {#budget}

**Années budgétaires.** Choisissez l'**année budgétaire** en haut ; le tableau énumère chaque année avec
son budget TI total, les dépenses de cybersécurité prévues, les dépenses de cybersécurité réelles, le
coût de base (fonctionnement) et une note. *Ajouter* l'année suivante ou l'année précédente — une
nouvelle année copie la précédente comme point de départ. Pour chaque année, le tableau indique les
initiatives engagées cette année-là, la base + les engagements en proportion du budget TI, et leur
position par rapport à la ligne directrice (sous le plancher de 4 %, sous / à / au-dessus de la cible
d'appétit, au-dessus du plafond de 12 %). Le **graphique par année** présente, empilées, la base et les
initiatives engagées, les dépenses prévues (barre) et les dépenses réelles (◆), le tout en proportion du
budget TI de l'année, par rapport aux lignes de 4 % / 7,8 % / 12 % et à la cible d'appétit.

**Projets sur plusieurs années (3 ans au maximum).** Chaque initiative a une année de début, un nombre
d'années (1 à 3) et une répartition : *coût initial la première année, récurrent chaque année* (par
défaut), un *pourcentage du total sur 3 ans*, ou des *montants par année*. Un avertissement apparaît
lorsque les pourcentages ne totalisent pas 100 %, ou lorsque des initiatives engagent des dépenses dans
une année qui ne figure pas encore dans le tableau.

Le calibreur, le graphique des fourchettes, les options d'arbitrage et la frontière de financement
ci-dessous portent tous sur l'**année sélectionnée**.

La ligne directrice : **12 %** du budget TI total (salaires compris) pour un appétit de 0,30 ou moins,
**7,8 %** à 0,50, **4 %** à 0,70 ou plus, de façon linéaire entre ces points. L'écran fournit la cible
cohérente avec l'appétit, l'appétit implicite des dépenses actuelles, et un avertissement lorsque les
deux divergent de 0,10 ou plus.

**Graphique des fourchettes.** L'axe des x va de l'aversion pour le risque à la recherche du risque ;
des bandes ombrées marquent les zones d'aversion, de neutralité et de recherche du risque, avec des
zones de marge pour les dépenses au-dessus de 12 % ou sous 4 %. La courbe représente la ligne
directrice ; le losange, l'appétit déclaré ; les autres points, les dépenses actuelles et quatre
**options de financement**, chacune placée à l'appétit qu'implique sa dépense totale (base +
traitement de l'année 1) :

- **A** statu quo — la base seulement ;
- **B** ramener les scénarios au-dessus de la tolérance — financer chaque scénario dont le risque non
  traité dépasse la tolérance ;
- **C** meilleur rapport qualité-prix dans le budget cohérent avec l'appétit — financer les scénarios
  par ordre de rapport coût-efficacité jusqu'à la cible ;
- **D** portefeuille de traitement complet.

Le **tableau d'arbitrage** compare leur coût, leur part des TI, l'appétit implicite, le risque
résiduel et le nombre de scénarios restant au-dessus de la tolérance. La **frontière de financement**
montre la baisse du risque résiduel à mesure que les scénarios sont financés par ordre de rapport
coût-efficacité, avec l'enveloppe de traitement disponible à 4 %, 7,8 % et 12 % après la base, et un
tableau indiquant quelle fourchette finance chaque scénario. Les initiatives partagées sont réparties
entre les scénarios, de sorte qu'aucun investissement n'est compté deux fois ; la décision d'achat réelle
se prend par initiative.

### 7.10.3 Exporter · Excel {#export}

- **Classeur Excel (.xlsx) — régénéré à partir de zéro.** Chaque exportation construit un nouveau
  classeur à partir de l'espace de travail courant, avec des **formules actives**. Parameters, Inputs,
  Analyse, Portfolio, Sensitivity et Case_View suivent `build_workbook.py` cellule par cellule ;
  Scenarios, Candidates, KRIs et Evidence sont les registres d'appui ; Organization, Threats,
  Vulnerabilities, Recommendations, KRI_History, Budget (calculateur sur une année, budget par année et
  répartition pluriannuelle, avec formules) et Threat_Context sont ajoutés par l'application. Options :
  - **Scénarios** — ceux inclus dans le calculateur de risque ; tous ; seulement ceux au-dessus de la
    tolérance ; au-dessus ou approximativement à la tolérance ; ou **choisis pour cette exportation**
    dans une liste interrogeable (*Choisir les éléments affichés*, *Désélectionner les éléments
    affichés*, *Partir de la sélection du calculateur*).
  - **Feuilles** — cochez les feuilles facultatives à inclure (README, Parameters, Inputs, Analyse et
    Portfolio sont toujours incluses).
  - **Années budgétaires** — les années qui figurent dans la feuille Budget ; **historique des ICR**
    activé ou désactivé.

  Une ligne d'aperçu indique le nombre de scénarios et de feuilles avant la génération. Les coûts des
  initiatives partagées sont répartis de nouveau entre les scénarios exportés, et le README consigne la
  portée choisie.
- **JSON d'évaluation** — tous les scénarios ou ceux inclus, lisible par `crg_calc.py`,
  `build_workbook.py` et le plugiciel. Les liens ATT&CK, CWE et CVE sont transmis comme champs
  facultatifs qui ne modifient aucun total.
- **Paquet de contexte** — Markdown pour l'agent CyberRiskGuardian. Il contient le texte intégral de
  vos documents : ne le confiez qu'à un service d'IA autorisé pour ces données.
- **Sauvegarde de l'espace de travail** — tout sauf l'instantané (téléchargez celui-ci à partir de
  Contexte de menace).

Chaque fichier est enregistré dans le dossier de téléchargement de votre navigateur, et chaque
exportation est consignée dans Paramètres → Journaux (journal des données).

### 7.10.4 Assistant IA {#ai}

L'analyste, la critique des paramètres, la génération de scénarios, la narration des synthèses et le
journal des décisions — section 8.

### 7.10.5 Prévisions {#forecast}

Deux prévisions, toutes deux produites par le moteur vérifié, **aucune n'utilisant l'IA**.

**Monte-Carlo.** Dans l'onglet *Plages de paramètres*, transformez n'importe quel paramètre de n'importe
quel scénario en une plage à trois points — minimum, plus probable, maximum — de forme
**triangulaire**, **uniforme** ou **PERT**. Si vous ne touchez pas à un paramètre, il reste une valeur
unique. Lancez ensuite les essais : vous obtenez le risque médian du portefeuille, un intervalle de
90 %, la probabilité de dépasser le risque toléré, et un histogramme.

La propriété utile : un espace de travail auquel on n'a pas touché donne une prévision **exactement**
égale à son résultat calculé. Si vous lancez 10 000 essais sur MediBec sans aucune plage définie, la
médiane est de 41 104 — pas approximativement. Il s'agit d'une vérification de l'outil de prévision, et
non d'une coïncidence, et c'est la première chose à essayer.

Des plages peuvent être **proposées** à partir de la confiance déjà consignée pour chaque paramètre,
selon une règle énoncée : ±0,15 pour une confiance faible, ±0,10 pour une confiance moyenne, ±0,05 pour
une confiance élevée, bornées aux limites propres de chaque paramètre (θ n'est jamais proposé à zéro ou
en dessous). Une proposition est un point de départ à modifier, et non une réponse.

Les exécutions utilisent un **germe** : le même germe reproduit exactement une exécution, de sorte qu'un
chiffre figurant dans un rapport peut être régénéré. Un germe différent donne une exécution différente,
ce qui permet de vérifier si votre conclusion dépend de l'échantillon.

**Facteurs déterminants.** Le graphique en tornade maintient chaque autre paramètre à sa valeur la plus
probable et fait varier un seul paramètre sur sa plage. Il n'est délibérément *pas* dérivé de
l'échantillon Monte-Carlo, parce que « et si cette estimation-là était fausse » est une autre question
que « comment les paramètres varient-ils ensemble », et les deux réponses ne sont pas interchangeables.
Lisez la tornade pour décider quelle estimation aller valider.

**Projection des ICR.** Moindres carrés ordinaires sur les relevés consignés de chaque indicateur, avec
un **intervalle de prévision de 95 % pour un seul relevé futur** (et non un intervalle de confiance
pour la droite de tendance — la question est de savoir où tombera la prochaine mesure), le
franchissement projeté du seuil en jours, et le r². Avec moins de quatre relevés, l'outil refuse de
projeter plutôt que de tracer une droite flatteuse passant par trois points. Un indicateur qui a déjà
dépassé son seuil n'indique aucun franchissement futur, parce que celui-ci a déjà eu lieu.

Chaque prévision est présentée à l'écart des résultats calculés et porte la mention **Estimation
analytique — validation requise**. Une prévision représente l'ampleur de votre incertitude, et non une
prédiction d'événements.

### 7.10.6 Sauvegarde et restauration {#backup}

Un seul fichier contient tous les espaces de travail, le texte extrait de vos documents de contexte,
les catalogues de cadres que vous avez chargés et les paramètres de l'assistant local, avec un manifeste
et une somme de contrôle SHA-256.

Les documents de contexte sont inclus par défaut. Les instantanés de menaces ne le sont **pas**, parce
qu'ils représentent l'essentiel de la taille et peuvent être reconstruits à partir des catalogues
publics — l'écran affiche la taille de chaque partie avant que vous fassiez votre choix, de sorte que la
décision vous appartient, en connaissance de cause.

**Les clés d'API ne sont jamais incluses.** L'assistant local les conserve dans un fichier distinct,
hors du navigateur, et tout champ dont le nom ressemble à une clé, un jeton, un secret, un mot de passe
ou un identifiant est retiré à la sortie. Une sauvegarde que vous vous envoyez par courriel ne peut pas
divulguer votre clé Claude.

**La restauration vous montre d'abord ce qu'elle ferait.** Chaque espace de travail du fichier reçoit
une étiquette :

| Étiquette | Signification | Coché par défaut |
|---|---|---|
| **Nouveau ici** | Absent de ce navigateur. | Oui |
| **Identique** | Même contenu. Rien à faire. | — |
| **Avancé** | Le fichier est plus récent que la copie de ce navigateur. | Oui |
| **Entraînerait une perte de travail** | **Ce navigateur contient une copie plus récente.** | **Non** |

**Fusionner** laisse tout le reste intact. **Tout remplacer** est également offert, mais indique
combien d'espaces de travail seraient supprimés avant que vous puissiez confirmer. Un fichier provenant
d'une application plus récente est refusé plutôt que lu partiellement, et un échec de la somme de
contrôle est signalé au-dessus du bouton de restauration, et non après.

**Passer à un autre ordinateur** se fait avec le même fichier : sauvegardez ici, restaurez là-bas. Les
espaces de travail résident dans un seul navigateur à une seule adresse ; c'est donc aussi ainsi que l'on
passe de `localhost:8099` à un autre port, ou de Chrome à Edge. Les catalogues restaurés apparaissent
immédiatement — aucun rechargement n'est nécessaire.

**Versions des données et migrations** : la version des données que lit cette application, la version
des données de l'espace de travail ouvert et la version de l'application qui l'a enregistré en
dernier, le nombre d'espaces de travail migrés au démarrage et le nombre d'espaces ouverts en lecture
seule, le journal des migrations de l'espace de travail, et *Télécharger la copie antérieure à la
migration*. Section 5.1.

### 7.11 Paramètres {#settings}

Des paramètres communs à tous les espaces de travail de cette installation, en douze onglets énumérés
dans le menu. En mode multiutilisateur, Paramètres est réservé aux administrateurs.

#### Langue

Anglais ou français (section 7.12.4).

#### Modules {#settings-modules}

**Fonctionnalités de cette installation** : activez ou désactivez chaque fonctionnalité
(administrateurs). Les commutateurs sont regroupés :

| Groupe | Fonctionnalités |
|---|---|
| Gouvernance | Gestion de la sécurité de l'information · Gestion des PSI · Gestion de la cybersécurité · Registres partagés · Revue de qualité |
| Conformité et audit | Gestion de la conformité · Gestion de l'audit |
| Opérations de sécurité | SIEM · SOAR |
| Autres fonctionnalités | Registre partagé des risques (avec Publier et partager) · Flux de menaces et réseaux sociaux · Ontologie · CRGO · Assistant IA · Prévisions · Budget |

Une fonctionnalité désactivée quitte le menu, avec toute section ou tout sous-menu laissé vide, et son
adresse indique comment la réactiver. **Rien de ce qu'elle contient n'est supprimé** : ses données
demeurent dans chaque espace de travail et réapparaissent lorsqu'elle est réactivée. Pour masquer des
écrans à certaines personnes seulement, utilisez plutôt **Utilisateurs et RACI → Accès aux menus**.

#### Journaux {#settings-logs}

Deux journaux de cette installation, pour les administrateurs :

- **Journal des accès** — l'ouverture de l'application, les ouvertures et fermetures de session (et
  les tentatives échouées), les écrans ouverts, les approbations et les droits refusés, les
  fonctionnalités activées ou désactivées, les paramètres enregistrés.
- **Journal des données** — les espaces de travail créés, enregistrés, importés, migrés, réinitialisés
  ou supprimés ; les fichiers téléchargés (exportations, rapports, sauvegardes) ; les fichiers écrits par
  l'assistant local ; les importations SIEM et SOAR ; les renvois vers l'ontologie.

Chaque entrée consigne **quand, qui** (la personne connectée, ou *cet ordinateur* en mode utilisateur
unique), **quoi** et **où** (espace de travail ou fichier), avec un bref détail — **jamais le contenu**
d'un espace de travail ou d'un fichier, jamais une clé, un NIP ou un mot de passe. Recherchez et filtrez
(*Les deux journaux*, *Journal des accès*, *Journal des données*), **Exporter … entrées en CSV**,
choisissez **Conserver les entrées pendant** (de 30 jours à 2 ans ; au plus 10 000 entrées par journal),
ou **Effacer le journal sélectionné**. Les journaux restent sur cet ordinateur.

#### IA — locale et distante {#settings-ai}

Les commutateurs généraux, l'acheminement de chaque fonction d'IA, les paramètres d'IA de l'espace de
travail, l'agent conversationnel d'aide et les fournisseurs — section 8.3. Les clés sont stockées par
l'assistant local dans `crg-keys.json`, jamais dans un espace de travail.

#### Utilisateurs et RACI {#settings-users}

**Utilisateurs et droits (RACI).** Le mode utilisateur unique est le mode par défaut : aucune ouverture
de session. **Paramètres → Utilisateurs et RACI → Activer le mode multiutilisateur** fait de vous le
premier administrateur (un NIP facultatif est stocké sous forme de hachage salé). Ensuite :

- **Ajoutez des utilisateurs** avec un gabarit de départ — lecteur, analyste, propriétaire du risque,
  gestionnaire ou administrateur — et un NIP facultatif.
- **Matrice RACI** : une lettre par utilisateur et par étape du processus. **R** Responsable
  (réalisation) : consulter et modifier. **A** Approbateur (redevable) : consulter, modifier et
  approuver. **C** Consulté et **I** Informé : consulter. **–** : aucun accès ; les écrans de l'étape
  sont masqués. Les administrateurs ont tous les droits.
- Les écrans pour lesquels vous n'avez pas le droit de modification sont en **lecture seule**, avec un
  bandeau indiquant votre rôle ; la navigation, la recherche et le filtrage fonctionnent toujours.
- Les **approbations** — approuver une recommandation, accepter formellement un risque, approuver une
  mesure — exigent un **A** à l'étape concernée ; l'approbateur est consigné.
- **Changer d'utilisateur**, dans la barre supérieure, ferme la session ; l'écran d'ouverture de session
  énumère les utilisateurs.
- **Accès aux menus par groupe et par compte utilisateur.** Créez des groupes (*Ajouter un groupe*),
  cochez leurs membres, puis réglez chaque menu (écran) pour un groupe ou un utilisateur : *Par défaut
  (RACI)*, *Complet* (affiché et modifiable), *Lecture seule* (affiché, en lecture seule) ou *Masqué*
  (retiré du menu). Le réglage propre à un utilisateur l'emporte sur ceux des groupes ; entre groupes, le
  plus permissif s'applique. Les approbations exigent toujours un **A** dans la matrice RACI ;
  Paramètres et Sauvegarde restent réservés aux administrateurs ; les administrateurs ne sont jamais
  restreints. *Exporter l'accès aux menus (CSV)* conserve une trace. Un rôle importé des documents peut
  devenir un utilisateur au moyen de **Créer l'utilisateur** dans Organisation → Preuves.
- **Activité** énumère les ouvertures de session, les modifications d'utilisateurs et de RACI, les
  approbations et les modifications ; l'activité et la matrice s'exportent en CSV.

Il s'agit de l'option A : les utilisateurs et les droits résident dans ce navigateur et sont appliqués
par l'application. Elle organise qui fait quoi et le consigne, mais elle **ne constitue pas une
frontière de sécurité** — toute personne ayant accès à l'ordinateur peut la contourner. Une version pour
serveur d'équipe (option B) est conçue dans `MULTIUSER-ARCHITECTURE.md`.

#### Documents et fichiers

La vue de l'administrateur sur chaque document de chaque espace de travail de cet ordinateur — cas
d'affaires, profils, inventaires, rapports d'audit. Filtrez par espace de travail ou par catégorie, ou
faites une recherche, puis :

- renommez un document, ou changez sa **Catégorie** ;
- **Remplacer…** par une nouvelle version : le fichier est relu sur cet ordinateur et le texte
  précédent est conservé comme version précédente du document (jusqu'à cinq) ;
- **Ouvrir le texte** l'ouvre sous Organisation → Documents de contexte ;
- **Supprimer**, ou cochez-en plusieurs et **Supprimer les éléments cochés**. Les valeurs déjà
  acceptées à partir d'un document restent dans l'espace de travail avec leur source.

*Texte non référencé* énumère le texte stocké auquel plus aucun document ne renvoie (une importation
interrompue, par exemple), avec **Retirer le texte non référencé**. En mode multiutilisateur,
Paramètres est réservé aux administrateurs.

#### Liens, flux, tâche planifiée et réseau

- **Liens et dossiers partagés.** Toutes les adresses externes au même endroit. L'écran distingue
  **vos propres dossiers** — les dossiers Drive des flux et du registre (avec leurs identifiants de
  dossier), les dossiers locaux synchronisés avec eux au moyen de Google Drive pour ordinateur, et votre
  liste de contrôles — des points de terminaison publics qui sont préconfigurés : KEV, EPSS, NVD, ATT&CK
  Navigator et le dépôt de plugiciels. **L'application est livrée sans aucun de vos dossiers
  configuré**, parce qu'un dossier partagé est l'endroit où votre organisation ou votre classe conserve
  ses éléments, et personne d'autre ne peut le choisir à votre place. L'écran indique lesquels sont
  encore vides et affiche le dossier des flux utilisé. Aucun n'est obligatoire : laissez-les vides et
  Publier écrit tout de même un fichier que vous pouvez télécharger, tandis que la tâche planifiée
  signale que l'étape de téléversement a été sautée. Pour en configurer un, créez le dossier dans votre
  propre Drive, copiez son adresse depuis le navigateur et collez-la ; l'identifiant du dossier est
  affiché en retour pour que vous puissiez le vérifier.
- **Sources de flux et clés.** Acceptez, conservez tel que proposé ou rejetez chaque source ; réglez sa
  fréquence ; ajoutez votre propre source ; acceptez ou rejetez les sources que suggère la tâche
  planifiée. Stockez les clés d'API (OTX, abuse.ch, X) au moyen de l'assistant local — elles vont dans
  `crg-keys.json`, dans le dossier des flux (lisible par vous seul), jamais dans les espaces de travail,
  les exportations ou les paquets. Réglez la requête et les mots-clics pour les médias sociaux, ainsi
  que les **termes de veille** comparés localement.
- **Tâche planifiée.** Suspendez les téléchargements, choisissez ce que la tâche téléverse dans Drive,
  autorisez les suggestions de sources, consignez le nom et la cadence de la tâche, et lisez ses
  instructions.
- **Liste d'autorisation réseau.** Les domaines dont les téléchargements ont besoin ; copiez la liste
  pour le propriétaire de votre organisation si l'accès réseau de Claude est restreint.
- **Dossier des flux.** `~/Downloads/CyberRiskGuardian-feeds` par défaut
  (`%USERPROFILE%\Downloads\…` sous Windows). Tout ce que l'application écrit hors de votre navigateur
  s'y trouve : les téléchargements, la synthèse hebdomadaire et vos clés d'API. Pour utiliser un autre
  dossier, écrivez son chemin sur la première ligne de `feeds-dir.txt`, à côté de `serve.py` (ou
  définissez `CRG_FEEDS_DIR`, qui a préséance sur le fichier) et redémarrez le lanceur ; la tâche
  planifiée doit travailler dans le même dossier. Si quelqu'un vous a remis l'application avec un
  `feeds-dir.txt` désignant un dossier sur *son* ordinateur, supprimez-le ou inscrivez-y votre propre
  chemin : sinon, l'assistant local écrit dans un chemin qui n'existe pas sur votre machine. La
  section 5 de `INSTALL.md` traite de ce point dans les deux langues.

**Toutes les clés d'API stockées sur cet ordinateur.** **Paramètres → Sources de flux et clés** se
termine par une liste unique de toutes les clés que détient l'assistant local, chacune avec
**Retirer**, ainsi que **Retirer toutes les clés**. Elle comprend les clés dont la source de flux ou le
fournisseur d'IA ne figure plus dans votre configuration. Le bouton *Retirer* par fournisseur dans
Paramètres → IA — locale et distante et le bouton *Retirer* par source ci-dessus fonctionnent de la même
façon. Réinitialiser les données peut toutes les supprimer en une seule étape dans le cadre d'une
réinitialisation.

#### Données de simulation {#settings-simulation}

Des données de simulation pour l'enseignement : quelques semaines d'activité **fictive** des opérations
de sécurité pour un cas pédagogique — sources de télémétrie, règles de détection et leurs essais,
alertes, indicateurs, guides d'intervention, dossiers, approbations et actions consignées — avec des
objectifs d'apprentissage, un déroulement jour par jour et des exercices assortis de leurs constats
attendus. Une trousse est importée dans l'**espace de travail courant** au moyen des mêmes importateurs
que tout fichier SIEM ou SOAR local. Chaque enregistrement est marqué comme simulation et peut être
retiré plus tard. Une trousse ne modifie jamais une cote de risque ni un paramètre de scénario, et
**aucune alerte ne devient un incident** : la confirmation d'un incident est laissée aux étudiants. Les
données de simulation ne sont jamais des preuves concernant une organisation réelle.

Le haut de l'écran affiche l'espace de travail courant, son type, ses scénarios et ses actifs
essentiels, et le nombre d'enregistrements de simulation qu'il contient. Les données de simulation sont
destinées à un **cas d'exemple ou à un espace de travail de classe** ; dans l'espace de travail d'une
organisation, un bandeau l'indique, et en mode multiutilisateur, seul un administrateur peut y importer
des données ou en retirer.

- **Trousses fournies** — les trousses livrées dans `data/simulation`. Une trousse cite les
  identifiants des scénarios et des actifs essentiels de son cas pédagogique ; elle **n'est donc valide
  que dans un espace de travail de ce cas** (pour MediBec : l'espace de travail d'exemple ou une copie de
  celui-ci). Chaque trousse indique si elle est *Valide pour cet espace de travail* (avec les
  avertissements éventuels) ou les erreurs qui empêchent l'importation, puis ses **objectifs
  d'apprentissage**, son **déroulement** et ses **exercices pour les étudiants** (chacun avec son
  *constat attendu (pour l'enseignant)*). **Importer dans cet espace de travail** demande une
  confirmation — les enregistrements SIEM sont ajoutés, les enregistrements SOAR portant le même
  identifiant sont remplacés — et indique ce qui a été importé et ce que l'importation SOAR a refusé à
  dessein (la trousse MediBec comprend une tentative d'auto-approbation). **Télécharger la trousse**
  l'enregistre en un seul fichier JSON.
- **Générer avec l'IA** — pour les enseignants : un modèle d'IA rédige une nouvelle trousse fictive
  pour l'espace de travail courant. Choisissez la **durée du déroulement** (7, 14 ou 21 jours),
  l'**intensité**, le **thème de l'intrusion** (rançongiciel, hameçonnage et prise de contrôle de
  compte, menace interne, fournisseur, infonuagique, mixte), le **nombre d'alertes** et la **langue des
  textes**, puis **Préparer la requête…**. La requête ne transmet que le profil de l'organisation, les
  scénarios (identifiants, noms, techniques ATT&CK), les actifs essentiels et les actifs
  informationnels — aucun document, note, chiffre ou clé — ainsi que les règles du guide des données de
  simulation ; vous voyez et pouvez modifier d'abord le contenu exact à envoyer, comme pour toute
  fonction d'IA. La réponse porte la mention *Estimation analytique — validation requise*, est validée,
  et ne peut être téléchargée ou importée que si elle ne comporte aucune erreur. Lisez les
  avertissements et les exercices avant de l'utiliser en classe : le modèle rédige des données
  plausibles, et non du matériel pédagogique vérifié. *Ou ouvrir un fichier de trousse* (**Ouvrir**)
  valide et importe une trousse reçue sous forme de fichier.
- **Retirer les données de simulation de cet espace de travail** — énumère les enregistrements de
  simulation par registre et les retire en une seule étape (une sauvegarde les restaure). Cochez
  *Retirer aussi … enregistrement(s) créé(s) en classe à partir des enregistrements de simulation* pour
  retirer également ce que les étudiants ont créé à partir de ceux-ci.

La façon dont une trousse est construite — le manifeste, les points pédagogiques requis, les
garde-fous des données fictives (adresses RFC 5737, domaines `example.com`, empreintes inventées) et la
liste de validation — est décrite dans `docs/SIMULATION-DATA-GUIDE.md`.

##### Démarche en classe — la trousse MediBec

*MediBec — de l'hameçonnage au rançongiciel sur le DME (trois semaines d'activité du SOC)* : du
21 septembre au 9 octobre 2026, 12 sources de télémétrie, 13 règles de détection avec leurs essais,
40 alertes (bruit, faux positifs et une chaîne d'intrusion allant d'une pièce jointe d'hameçonnage
jusqu'au rançongiciel sur le DME), 15 indicateurs avec des marquages TLP 2.0, 5 guides d'intervention,
4 dossiers, ainsi que des approbations et des actions consignées comportant des lacunes d'approbation
délibérées. Elle met en jeu les scénarios S1 (compromission d'identifiants) et S2 (rançongiciel), avec
S3, S4 et S5 au passage. Toutes les personnes sont fictives.

**Avant le cours (enseignant).**

1. Créez une copie de l'exemple MediBec pour la classe (Profil de l'organisation → Espaces de travail
   → nouvel espace de travail → *une copie de l'exemple MediBec*, type *Cas d'affaires pour la
   classe*), ou donnez à chaque équipe sa propre copie.
2. Paramètres → Données de simulation → la trousse MediBec → vérifiez *Valide pour cet espace de
   travail* → **Importer dans cet espace de travail**. Le rapport doit indiquer 40 alertes, 13 règles,
   15 indicateurs, 4 dossiers et 11 exécutions, ainsi qu'un enregistrement SOAR refusé : APR-MB-04, une
   auto-approbation (un point pédagogique délibéré).
3. Dans SIEM → Vue d'ensemble, réglez la **date de référence** au 9 octobre 2026 ou plus tard : la
   couverture et l'état de la télémétrie sont calculés à cette date.
4. Facultatif : Organisation → Réinitialiser les données → *Pour l'enseignant* → **Définir l'état
   actuel comme point de départ**, pour que les équipes puissent recommencer l'exercice.

**En classe (étudiants).** Le déroulement se fait jour par jour : un lundi normal et du bruit de fond
(le transmetteur des journaux de sauvegarde est déjà muet depuis le 18 septembre), une pièce jointe
d'hameçonnage ouverte à la clinique de Gatineau le jour 3 et un dossier fermé trop tôt, de la
persistance, de la fatigue MFA le jour 7 et un dossier de compte dont l'approbation est révoquée avant
la désactivation du compte, un mouvement latéral vers le DME, la collecte de 48 000 dossiers de
patients, l'exfiltration — en partie invisible parce que les journaux de lecture des données
infonuagiques avaient été désactivés —, l'inhibition de la récupération que la télémétrie muette des
sauvegardes n'a jamais signalée, le chiffrement du DME le jour 14 avec des isolements effectués sous des
approbations expirées, auto-accordées ou non autorisées, le confinement, de nouveau du bruit, une
correspondance avec un indicateur révoqué, un courriel imitant un expéditeur légitime, et un essai de
restauration qui attend toujours une approbation. Les dix exercices :

| # | Question | Écran |
|---|---|---|
| EX-01 | Quelles alertes un analyste devrait-il ouvrir en premier le matin du 4 octobre, et pourquoi ? | SIEM → Alertes et tri |
| EX-02 | Trouvez le vrai positif qui a été fermé comme bénin le jour 3. Que fallait-il faire ? | SIEM → Alertes et tri |
| EX-03 | Quelles détections sont validées, non vérifiées, dégradées ou absentes, et pourquoi DR-MB-07 n'est-elle pas validée alors qu'elle a été mise à l'essai ? | SIEM → Couverture et lacunes |
| EX-04 | Quelles sources de télémétrie ne sont pas saines à la date de référence, et quel scénario chaque angle mort touche-t-il ? | SIEM → Sources de télémétrie |
| EX-05 | Quels indicateurs ne peuvent pas être communiqués hors du SOC, et lesquels n'appuient plus aucune inférence ? | SIEM → Indicateurs et TLP |
| EX-06 | IND-MB-10 a une confiance de 95. Pouvez-vous utiliser 0,95 comme Pb(A) pour le scénario S2 ? | SIEM → Indicateurs et TLP, puis Registre des scénarios |
| EX-07 | CASE-MB-03 est-il un incident ? Que faut-il pour qu'il le devienne, et qu'en découle-t-il au regard de la Loi 25 du Québec ? | SOAR → Dossiers |
| EX-08 | Quelles actions consignées n'ont pas d'approbation valide, et pour quelle raison ? | SOAR → Actions |
| EX-09 | Sur quels guides d'intervention peut-on compter lors d'un incident, et lesquels doivent être retravaillés ? | SOAR → Guides d'intervention et Simulations |
| EX-10 | Rédigez deux lacunes de détection et une mesure corrective que ce déroulement justifie, liées à des scénarios de MediBec. | SIEM → Couverture et lacunes, Registres partagés |

Les constats attendus figurent sur la fiche de la trousse, sous chaque exercice, à l'intention de
l'enseignant. Trois points qu'il faut habituellement rappeler aux étudiants : la file est ordonnée par
actif essentiel, puis par gravité pondérée selon la criticité, et non par heure d'arrivée (EX-01) ; une
confiance de source de 95 est l'affirmation du producteur, et non une probabilité, et ne devient jamais
une Pb(A) (EX-06) ; CASE-MB-03 n'est pas un incident tant qu'une personne nommée ne l'a pas confirmé à
une date avec **Confirmer comme incident** — ce que les étudiants font eux-mêmes, et qui déclenche alors
le délai de notification de la Loi 25 dans Gestion de la conformité → Calendrier réglementaire (EX-07).

**Boucler la boucle avec l'évaluation des risques.** Scénarios en lot → *Des opérations de sécurité
(SIEM et SOAR)*, en date du 9 octobre : les amorces montrent les lacunes de détection, la télémétrie
dégradée, les lacunes d'approbation et les guides d'intervention non simulés que le déroulement a
produits ; la plupart sont des *preuves pour un scénario existant* (S2, S3, S4). **Consigner la preuve
dans S2**, puis ouvrez S2 dans l'Éditeur de scénarios : la fiche *Preuves des opérations de sécurité*
l'affiche — et aucun paramètre n'a changé. Toute modification de Pb(A), de Pb(ψ,A) ou de θ est la
décision des étudiants, consignée dans la justification. Terminez par Gouvernance → Revue de qualité :
QC-15 à QC-18 doivent réussir.

**Après le cours.** Paramètres → Données de simulation → **Retirer les données de simulation** (cochez
*Retirer aussi … créé(s) en classe* pour effacer aussi les enregistrements des étudiants), ou rétablissez
le point de départ avec Réinitialiser les données.

#### Exporter / importer

`crg-config.json` sans les clés, pour configurer un autre ordinateur ou partager une liste de sources.

### 7.12 Aide

### 7.12.1 Pas à pas et Guide de l'utilisateur

Le menu **Aide** commence par deux entrées marquées d'une flèche qui ne sont pas des écrans de
l'application :

| Entrée | Ce qui s'ouvre |
|---|---|
| **Pas à pas** ↗ | Une fenêtre distincte présentant les treize étapes — à quoi chacune sert, ce dont elle a besoin, quand elle est terminée — et les lignes directrices en détail. Imprimable, fonctionne hors ligne. Cliquer sur le nom d'un écran ouvre cet écran dans la fenêtre de l'application. |
| **Guide de l'utilisateur** ↗ | Ce guide, dans une fenêtre distincte, avec une table des matières et une boîte de recherche — en français lorsque l'interface est en français. Imprimable, fonctionne hors ligne. |

Ce sont des fenêtres plutôt que des onglets afin qu'un guide puisse rester à côté du travail, et les
deux lisent ce que l'application lit, de sorte qu'aucun ne peut décrire un écran autrement que
l'application. Si votre navigateur bloque les fenêtres contextuelles, autorisez-les pour cette
application ; sinon, les entrées s'ouvrent dans des onglets.

### 7.12.2 À propos {#about}

**À propos** (groupe Aide) comporte trois pages. **À propos** nomme le créateur, son courriel
(marcandre@leger.ca), le site Web du projet (www.leger.ca) et le dépôt GitHub
(github.com/ITriskMgr/CyberRiskGuardian), et reconnaît l'utilisation de l'IA générative dans la
conception de l'application. **Licence** explique la licence CC BY-NC 4.0, puis répond à la question
que les gens se posent réellement — voir la section 10. **Versions** énumère l'application, le moteur
vérifié, l'assistant local et la base de connaissances.

**Quitter** (barre supérieure) enregistre votre travail, arrête l'assistant local et ferme la fenêtre.
Dans un onglet de navigateur que l'application n'a pas ouvert elle-même, fermez l'onglet lorsque l'écran
de fermeture apparaît. Relancez l'application avec le lanceur.

### 7.12.3 Agent conversationnel d'aide

Le bouton **?**, en bas à droite, ouvre le panneau d'aide sur chaque écran. Il commence par un conseil
pour l'écran où vous vous trouvez ; posez une question en anglais ou en français. Les réponses
proviennent de l'aide intégrée — conseils d'écran, les 13 étapes du processus, questions fréquentes —
et du guide de l'utilisateur, consultés sur cet ordinateur ; *Ouvrir cet écran* vous y mène.

Par défaut, l'agent conversationnel est en mode **aide seulement** : aucune IA, rien n'est envoyé. Pour
autoriser les réponses de l'IA, allez dans **Paramètres → IA — locale et distante** et cochez
**Permettre à l'agent conversationnel d'utiliser l'IA** ; l'IA doit également être activée pour l'espace
de travail (même page), et la fonction *Agent conversationnel d'aide* ne doit pas être acheminée vers
*Désactivé*. Chaque réponse offre alors **Demander à l'IA**, qui montre exactement ce qui serait envoyé
(votre question, l'écran, les passages d'aide correspondants et un bref résumé de l'espace de travail)
avant que quoi que ce soit ne quitte l'ordinateur. La réponse de l'IA est identifiée comme telle ;
l'agent conversationnel ne modifie jamais les données.

### 7.12.4 Langue — anglais et français

**EN / FR**, dans la barre supérieure (ou Paramètres → Langue), change tous les écrans d'un coup ; le
choix est mémorisé. Seule l'interface est traduite. Les données de l'organisation, les documents de
cas, les scénarios, le contenu des catalogues (ATT&CK, CWE, titres des contrôles), les fichiers
exportés et les réponses de l'IA restent dans leur langue d'origine — un cas en français reste en
français dans une interface anglaise, et inversement. Les nombres suivent la langue (0,85 ; 12,3 % ;
1 234 $). Lorsque l'interface est en français, les requêtes à l'IA demandent une rédaction en français.

---

## 8. L'IA dans l'application

L'IA **propose et explique** ; le moteur vérifié calcule ; vous décidez. Rien de ce que produit une IA ne
modifie une valeur enregistrée tant que vous ne l'avez pas acceptée, et aucune IA ne se trouve dans le
chemin de calcul.

### 8.1 Ce qui est envoyé — et comment le modifier

Le navigateur n'appelle jamais un modèle. Il transmet à l'assistant local, qui effectue la requête —
ainsi les clés restent hors de la page et le point de sortie est une seule fonction vérifiable dans
`serve.py`. Avant que quoi que ce soit ne sorte, chaque fonction d'IA ouvre le même **aperçu** :

- la tâche, la **taille** (octets et mots), la **destination** (un fournisseur hors de cette machine,
  ou un modèle sur celle-ci) et l'activation ou non de la recherche Web ;
- le contenu à envoyer lui-même dans **deux zones modifiables** : *Instructions (système)* et
  *Requête*.

**Vous pouvez modifier le contenu à envoyer.** Retirez ce qui ne doit pas sortir, ajoutez le contexte
qui manque aux documents, précisez la question. Ce qui se trouve dans les deux zones lorsque vous
appuyez sur **Envoyer** est exactement ce qui est transmis — la taille se met à jour pendant la saisie
et une pastille indique *modifié par vous*. **Rétablir le contenu préparé** annule vos modifications ;
**Appliquer l'anonymiseur** remplace l'organisation, les personnes, les actifs, les hôtes et les
montants dans les deux zones ; **Copier** les copie. Le journal de l'IA consigne que le contenu envoyé a
été modifié.

Un espace de travail marqué **confidentiel** demande une confirmation à chaque appel et ne mémorise
jamais le consentement ; sinon, le premier envoi depuis un espace de travail en consigne la date. Une
requête de plus de 400 ko est refusée plutôt qu'envoyée.

### 8.2 Créativité

Pour les fonctions qui proposent — extraction du profil et des actifs essentiels, importation à partir
des documents, propositions de scénarios, chaînes causales, rédaction de politiques et évaluation de la
conformité — vous choisissez jusqu'où la réponse peut aller au-delà du matériel fourni :

| Niveau | Ce qui est demandé au modèle |
|---|---|
| **Stricte — faits documentés seulement** | Seulement ce que les documents énoncent ou impliquent directement. Tout le reste demeure vide (UNKNOWN). |
| **Équilibrée — des faits, puis des hypothèses prudentes** | Les documents d'abord ; une hypothèse prudente là où ils sont muets, étiquetée comme telle. Le niveau par défaut. |
| **Exploratoire — combler les lacunes avec des données plausibles** | Vise une réponse complète : chaque lacune reçoit une valeur plausible selon le secteur, la taille et la région, avec son raisonnement dans la source. |
| **Créative — proposer ce qui pourrait aussi s'y trouver** | Propose aussi des éléments que les documents ne mentionnent pas, mais qu'une organisation de ce type possède habituellement — systèmes, ensembles de données, fournisseurs, processus, obligations, menaces — pour que vous les vérifiiez auprès de l'organisation. |

**La créativité change l'exhaustivité, jamais la provenance.** À tous les niveaux, une valeur que les
documents n'appuient pas est étiquetée ASSUMPTION, EXTERNAL ou UNKNOWN — jamais FACT — et la source
d'une proposition créative commence par *Proposed —*. Le niveau est inscrit dans le contenu envoyé, de
sorte que l'aperçu montre exactement ce qui a été demandé au modèle. Choisissez-le dans l'aperçu (le
modifier prépare de nouveau le contenu à envoyer) ou définissez la valeur par défaut de l'espace de
travail dans **Paramètres → IA — locale et distante** → *Créativité de l'extraction et des
propositions* ; *Utiliser ce niveau par défaut pour cet espace de travail* dans l'aperçu fait la même
chose. Avec un modèle local, une température d'échantillonnage correspondante est aussi envoyée ; l'API
Claude est guidée par la seule instruction.

### 8.3 Paramètres → IA — locale et distante

Une seule page pour toutes les décisions sur ce qui peut quitter cet ordinateur à destination d'un
modèle d'IA.

- **Interrupteurs généraux (cette installation).** *Autoriser les requêtes vers l'API Claude
  (distante)* — désactivé, rien n'est jamais envoyé hors de cette machine et chaque fonction doit
  utiliser un modèle local. *Autoriser la recherche Web pour les renseignements de profil manquants*
  (Claude seulement).
- **Acheminement de chaque fonctionnalité d'IA.** Pour chaque fonction — liaison des vulnérabilités,
  extraction du profil et des actifs essentiels, importation à partir des documents (deux groupes),
  propositions de scénarios, chaînes causales, l'analyste et la critique de l'assistant IA, la synthèse
  hebdomadaire, la rédaction de politiques, les données de simulation pour l'enseignement,
  l'évaluation de la conformité, l'agent conversationnel d'aide — ce qu'elle envoie, sa sensibilité et
  son acheminement : *Fournisseur de l'espace de travail*, *Modèle local seulement*, *Fournisseur
  distant* ou *Désactivé*. *Rétablir les acheminements recommandés* remet les fonctions sensibles sur
  le modèle local.
- **Cet espace de travail.** IA activée ou désactivée, le fournisseur de l'espace de travail, *Traiter
  comme confidentiel*, *Anonymiser avant l'envoi* et la valeur par défaut de la **créativité**.
- **Agent conversationnel d'aide.** *Permettre à l'agent conversationnel d'utiliser l'IA* (désactivé
  par défaut).
- **Fournisseurs.** Une fiche par fournisseur, regroupées *Hors de cette machine* et *Sur cette
  machine* : l'API Claude, OpenAI, Google Gemini, Azure OpenAI, GitHub Models, Ollama, LM Studio, tout
  autre serveur local compatible OpenAI, et **Ajouter votre propre fournisseur**. Pour chaque
  fournisseur, le point de terminaison, le modèle et la clé sont modifiables ; *Lister les modèles*
  interroge le point de terminaison ; un essai de connexion envoie quelques jetons et aucune donnée de
  l'espace de travail. Les clés sont stockées par l'assistant local dans `crg-keys.json` (mode 600) —
  jamais dans un fichier de configuration, un journal, une exportation ou une sauvegarde.

Les acheminements sont enregistrés dans `crg-config.json` dans le dossier des flux, et l'assistant
local les vérifie de nouveau avant chaque appel : une fonction réglée sur le modèle local ne peut pas
joindre un fournisseur distant, quoi qu'une page demande. *Distant* désigne tout fournisseur qui ne se
trouve pas sur cette machine, y compris un fournisseur que vous ajoutez.

### 8.4 L'assistant IA

| Tâche | Ce qu'elle fait | Ce qu'elle ne peut pas faire |
|---|---|---|
| **Analyste** | Répond à une question sur cette évaluation, avec le contexte de l'organisation et les chiffres propres du moteur dans le contenu envoyé. | Recalculer. Les chiffres qu'elle cite sont ceux qu'on lui a fournis. |
| **Critique des paramètres** | Examine vos Pb(A), Pb(ψ,A), δe, δm, θ et μ(E) au regard du texte du scénario et des preuves consignées, et indique où elle est en désaccord et pourquoi. | Appliquer quoi que ce soit. Elle suggère ; vous décidez, paramètre par paramètre. |
| **Génération de scénarios** | Rédige des scénarios sous forme de chaînes causales complètes, éventuellement amorcées à partir d'éléments de flux triés. | Atteindre le registre. Ils aboutissent dans Scénarios en lot, marqués générés par l'IA, non examinés. |
| **Narration de la synthèse** | Réécrit le tri de la semaine pour un public de gestionnaires. | Énoncer un chiffre de risque. |

**Tout est journalisé** : la tâche, le fournisseur, le modèle, la date, les octets envoyés, si le
contenu a été anonymisé ou modifié, le niveau de créativité, l'utilisation de jetons et **votre
verdict** — accepté, partiellement utile, rejeté. Ce journal est la preuve que l'IA a été utilisée de
façon responsable dans l'évaluation. Si une réponse atteint le plafond de sortie du modèle, l'écran
indique *tronquée* et conserve les constats arrivés complets.

---

## 9. Téléchargements planifiés des flux avec Claude

Une tâche planifiée Claude s'exécute sur cet ordinateur par l'intermédiaire de l'application de bureau
Claude. À chaque exécution, elle lit `crg-config.json`, s'arrête si elle est en pause, exécute
`bin/crg_feeds.py --due` dans le dossier des flux (chaque source à sa propre fréquence), copie
`feeds-digest.json` et un court résumé dans le dossier Feeds de Drive, téléverse la boîte d'envoi du
registre dans le dossier du registre de Drive et — au plus une fois par semaine — propose de nouvelles
sources. Pour modifier la fréquence à laquelle elle se réveille, la mettre en pause ou l'exécuter
maintenant, ouvrez les tâches planifiées dans Claude ou demandez à Claude (« exécute ma tâche de flux
CyberRiskGuardian toutes les 12 heures »). L'ordinateur doit être éveillé et l'application de bureau
Claude ouverte. Si l'organisation restreint l'accès réseau de Claude, les domaines indiqués dans
Paramètres → Liste d'autorisation réseau doivent d'abord être autorisés ; d'ici là, la tâche les signale
comme bloqués.

La même tâche rédige aussi la **synthèse hebdomadaire** — mais seulement si elle dispose de quoi trier.
Exportez d'abord le profil (section 7.4.3) : *Flux de menaces → Tri → Exporter le profil pour la tâche
planifiée*. La tâche lit alors `briefings/triage-profile.json`, applique les mêmes règles documentées aux
téléchargements de la semaine, écrit `briefings/briefing-YYYY-MM-DD.md` dans le dossier des flux et la
téléverse à côté du condensé. Il lui est interdit de modifier un score, un paramètre ou un espace de
travail, et elle ne touche pas à `crg-keys.json`. Si le profil est absent, elle le signale en une ligne
et effectue seulement le téléchargement — elle n'inventera pas de profil.

La synthèse de la tâche est une **lecture** des règles ; le tri de l'application est le tri
déterministe, et les deux peuvent différer dans leur formulation. Lorsqu'ils diffèrent sur le fond,
c'est l'application qui a raison.

---

## 10. Licence — qui peut l'utiliser

**À propos → Licence.** L'application est sous licence **CC BY-NC 4.0** : vous pouvez la partager et
l'adapter, avec attribution, et non « principalement à des fins commerciales ou de compensation
monétaire ». La page énumère les situations, parce que « non commercial » est un terme de licence et non
un jugement sur qui mérite un logiciel gratuit.

**Autorisé sans demande :** les étudiants pour leurs propres travaux, y compris la remise du résultat
pour évaluation ; l'usage personnel et privé ; les organismes sans but lucratif et les ONG qui évaluent
leur propre cyberrisque ; la recherche et le matériel pédagogique que vous rédigez vous-même, avec
attribution ; et **l'évaluation pendant au plus 30 jours** par toute organisation, afin de décider
d'acquérir une licence.

**Nécessite une licence commerciale :** les cégeps, collèges, universités et autres établissements
d'enseignement qui l'utilisent pour donner de l'enseignement — les étudiants du cours sont couverts,
l'établissement ne l'est pas ; les ministères et organismes gouvernementaux de tout ordre ; les sociétés
d'État et autres entreprises publiques ; les entreprises et sociétés de toute taille, y compris les
cabinets-conseils, les auditeurs et les conseillers qui l'utilisent pour des mandats clients ; et tout ce
qui est intégré à un produit ou à un service payant.

Écrivez à **marcandre@leger.ca** en précisant ce que vous souhaitez faire. Une grille tarifaire
officielle sera publiée ; elle n'est pas encore publiée, car le projet est toujours en développement, et
les conditions sont convenues au cas par cas d'ici là. Le résumé de la licence sur la page n'est que
cela — la licence elle-même est le code juridique Creative Commons, fourni intégralement dans `LICENSE`,
et c'est lui qui prévaut là où les deux diffèrent. Rien de ceci ne constitue un avis juridique.

---

## 11. Essai de réception (environ une heure)

**Le moteur et le cas**

1. Le pied de page indique `moteur vérifié · 84,491 / 41,104`.
2. Le **Registre des scénarios** de l'espace de travail MediBec affiche 30 scénarios, un total estimé de
   84 491 et un résiduel de 41 104.
3. **Calculateur de risque** → décochez S1. Le nombre inclus passe à 29/30 et les totaux baissent.
   Rechargez la page : S1 est toujours exclu. Cochez-le de nouveau.
4. **Processus** affiche treize étapes, l'étape 4 indiquant *Importer les autres informations des
   documents*, ainsi que le bandeau rappelant que l'application est une version bêta.

**Organisation et documents**

5. **Organisation → Espaces de travail** → créez un espace de travail vierge en déposant deux fichiers
   Word ou PDF dans le formulaire ; l'espace de travail s'ouvre avec les deux documents énumérés.
6. **Organisation → Profil et appétit** → modifiez un champ : la barre indique *Modifications non
   enregistrées* ; **Annuler** le rétablit.
7. **Extraire des documents…** → *Utiliser l'IA (aperçu avant l'envoi)* (un fournisseur étant
   configuré) : l'aperçu affiche deux zones modifiables, la taille et la destination. Changez la
   créativité pour *Créative* : la requête contient maintenant `CREATIVITY: creative`. Ajoutez une
   phrase à la requête, envoyez ; le journal de l'IA consigne *modifié*. Sans fournisseur, *Règles
   seulement* propose des valeurs étiquetées FACT, INFERENCE ou UNKNOWN.
8. **Organisation → Importer des documents** → déposez un troisième document : il est énuméré comme
   *nouveau* et est le seul coché. Décochez *Profil et appétit* et *Actifs essentiels*, conservez
   *Actifs informationnels*, choisissez *Règles seulement* et **Démarrer l'importation** : seul le
   nouveau document est lu, la revue s'ouvre, **Ajouter les cochés** ; le document indique maintenant
   *Déjà extrait vers : Actifs informationnels* et les cibles du plan d'importation apparaissent à
   l'étape 4 du Processus.

**Menaces, vulnérabilités et ontologie**

9. **Contexte de menace** → **Charger l'exemple fourni** (aucun réseau requis). Collez :

   ```
   CVE-2026-59310
   CVE-2026-102490
   CVE-1999-0016
   CVE-1999-0001
   ```

   puis cliquez sur **Placer sur l'échelle**. Attendez-vous à l'échelon 4 pour les deux premières —
   l'une citant une utilisation connue par un rançongiciel —, à l'échelon 2 pour `CVE-1999-0016` avec
   la phrase du garde-fou d'ancienneté malgré un EPSS proche de 0,96, et à l'échelon 1 pour la
   dernière, avec la mention *EPSS below 0.05 (pruned from this snapshot), not in KEV*.
10. **Menaces · ATT&CK** → la matrice affiche des cellules colorées ; ouvrez T1566 et voyez les
    scénarios MediBec qui l'utilisent.
11. **Ontologie · CRGO → Suggérer des scénarios** sur MediBec → le secteur indique *santé* et les
    techniques proviennent du registre ; cochez *maliciels et rançongiciels* et cliquez sur **Suggérer des
    scénarios**. Le résultat affiche les candidats, les scénarios distincts et la source (*Serveur MCP*
    lorsque l'ontologie est connectée, *instantané* sinon). Ouvrez les **Détails** de l'un d'eux.
    Cochez-en deux et **Ajouter les cochés aux scénarios en lot** : la grille les affiche marqués
    *[CRGO]*, avec une justification nommant l'identifiant de l'ontologie.
12. **Ontologie · CRGO → Explorer → Contrôles pour une technique** → `T1486` : contrôles énumérés par
    cadre. **Connexion** indique la provenance du serveur, ou pourquoi c'est l'instantané qui répond.
13. **Éditeur de scénarios** → S1 → fiche *Ontologie · CRGO* → **Contrôles pour ses techniques**
    énumère les contrôles par technique ; **Trouver des scénarios semblables dans l'ontologie** propose
    des scénarios à lier (*Lien*).

**L'évaluation**

14. Le **Tableau de bord des ICR** s'ouvre avec cinq jauges et la pastille *automatique : le pire
    d'abord*. **Consigner** : le nombre de mesures passe à 1.
15. **Scénarios en lot** → cochez tous les modèles, *Cocher les actifs essentiels + les 5 plus
    critiques*, réglez à 20 ; générez : la grille contient des candidats issus de nombreux modèles.
    *Rebrasser* change l'ensemble et le germe ; le même germe le reproduit.
16. **Atténuation des risques → Propositions** → *Non traités au-dessus de la tolérance* → *Ajouter les
    propositions cochées au plan*. **Appliquer** une mesure, vérifiez que les red_p / red_i du scénario
    ont changé, puis **Annuler les modifications**.
17. **Registre des risques** → *Créer à partir des scénarios* : 30 risques et une carte de chaleur.
18. **Recommandations → Besoin de traitement** énumère chaque scénario inclus avec un verdict sous / à /
    au-dessus. Atténuation des risques → cochez deux mesures → **→ Recommandation** ; faites passer le
    brouillon à *en revue*, puis **approuvez-le** : le point de contrôle nomme tout ce qui manque ; une
    fois la recommandation approuvée, les chiffres sont figés.
19. **Mesures de protection existantes** → *Ajouter une mesure de protection* en place, cotée 3 pour
    Rétablir, avec un coût annuel de fonctionnement : les indicateurs l'affichent et **Budget** propose
    son coût de fonctionnement comme base.
20. **Maturité et résilience → Maturité (CSF 2.0)** → cotez les 22 catégories à 3 : *Scénarios que cela
    suggère* passe à 20 et l'étape 6 du Processus indique *environ 20 pour cette organisation*.
21. **Prévisions → Monte-Carlo**, sans aucune plage de paramètres définie, 10 000 essais : la médiane
    indique **41 104** exactement.
22. **Exporter · Excel** → *Tous les scénarios* : les totaux de la feuille Analyse indiquent 84 491 et
    41 104 et se recalculent lorsque l'appétit change dans la feuille Parameters.

**Le Registre partagé des risques**

23. **Registre partagé des risques → Paramètres du registre** → définissez un dossier partagé
    (n'importe quel dossier de cet ordinateur pour l'essai) et un alias, **Enregistrer**.
24. **Contribuer des risques** → cochez trois scénarios ; le catalogue affiche *Soins de santé*,
    *Canada — Québec*, *Moyenne* ; l'anonymisation est cochée. L'aperçu ne contient ni « MediBec » ni un
    nom d'actif. **Partager dans le registre** : un fichier `crg-registry2-contribution-…json` apparaît
    dans le dossier.
25. Dans un deuxième profil de navigateur (ou un autre ordinateur lisant le même dossier), **Parcourir et
    rechercher → Lire le dossier partagé** : trois fiches. *Secteur d'activité* → *Finance et
    assurances* : aucune. **Modération** → approuvez-en une → **Publier le paquet validé**. De retour
    dans le premier profil, relisez le dossier et cochez *Fiches modérées seulement* : une fiche.
    **Utiliser les fiches cochées dans cet espace de travail** : elle aboutit dans Scénarios en lot,
    marquée *[Registre]*.
26. **Mes contributions** → **Retirer** : après une nouvelle lecture du dossier, l'autre profil
    n'affiche plus ces fiches.

**Gouvernance**

27. **Gestion des PSI → Bibliothèque des politiques** → *Contrôle d'accès et authentification* →
    **Créer à partir du gabarit** : un brouillon dont chaque énoncé porte un identifiant, une modalité
    et des contrôles. Dans **Versions et approbations** : **Soumettre pour revue**, **Approuver** (par
    une personne autre que l'auteur lorsque le mode multiutilisateur est activé), **Publier** : la
    version est figée avec son empreinte et **Vérifier l'empreinte** réussit. **Commencer une nouvelle
    version** : un nouveau brouillon, et **Comparer deux versions** montre les différences.
28. **Gestion des PSI → Prises de connaissance et formation** → **Consigner une prise de connaissance**
    de la version publiée : la couverture de la Vue d'ensemble augmente. **Non-conformités** →
    **Consigner une dérogation à une politique** → *Compte administrateur partagé* → **En faire un
    risque** : un risque de catégorie *Conformité* apparaît dans le Registre des risques.
29. **Gestion de la conformité → Exigences** → **Ajouter les obligations de la Loi 25 et de la
    R-22.1** et **Ajouter les énoncés des politiques publiées**. **Évaluation assistée par l'IA** →
    *Règles*, **Proposer** → **Appliquer les propositions cochées** : chacune indique *règles
    acceptées*. **Rapports** → **Enregistrer un instantané**, puis **Rapport de conformité complet
    (.md)** : il contient les exigences, les politiques et la posture de conformité.
30. **Paramètres → Modules** → désactivez *Gestion des PSI* : son entrée de menu disparaît et son
    adresse explique que la fonctionnalité est désactivée ; réactivez-la : les politiques sont toujours
    là. Désactivez *SIEM* et *SOAR* : toute la section **Opérations de sécurité** disparaît ;
    réactivez-les.

**Cas d'enseignement et réinitialisation**

31. **Réinitialiser les données** sur l'exemple MediBec → *Recommencer* énumère les *Étapes que vous
    referez* : l'étape 2 et l'étape 3. **Recommencer ce cas…**, tapez `RECOMMENCER` : le registre compte
    de nouveau 30 scénarios et le Processus affiche les étapes 2 et 3 comme *à faire*. Sous *Pour
    l'enseignant*, décochez les deux étapes et recommencez de nouveau : les étapes 2 et 3 sont revenues
    telles que livrées.
32. **Réinitialiser les données → Réinitialiser ou supprimer** → choisissez chacun des quatre niveaux et
    observez le changement de *Ce que ceci supprimerait* ; les clés sont signalées comme *conservées par
    cette réinitialisation*.

**Installation**

33. **Sauvegarde et restauration** → créez une sauvegarde ; restaurez-la dans un deuxième profil de
    navigateur : le pied de page indique **84,491 / 41,104** et votre espace de travail, ses politiques
    et ses exigences sont présents.
34. **Aide → Pas à pas** → une fenêtre distincte avec treize étapes et les lignes directrices ; **Aide →
    Guide de l'utilisateur** → ce guide avec une table des matières ; passez l'interface en **FR** et
    rouvrez-le : le guide français.
35. **Aide → À propos → Versions** indique `1.7.0 beta` et `moteur vérifié · 84,491 / 41,104` ;
    **Licence** nomme CC BY-NC 4.0 et marcandre@leger.ca.
36. Passez l'interface en **FR** : les écrans Ontologie, Registre partagé des risques, Gestion des PSI,
    Gestion de la conformité, SIEM et SOAR, l'aperçu de l'IA et l'onglet Importer des documents sont en
    français ; les données de l'organisation restent dans leur propre langue.

**Menu, aide et journaux**

37. Le menu affiche les douze sections dans l'ordre. Repliez **Gouvernance** : elle indique combien
    d'écrans elle contient. **« ** replie le menu en un rail d'icônes ; ** »** le rétablit. Rétrécissez la
    fenêtre : le menu devient un tiroir ouvert avec **☰**.
38. Sur n'importe quel écran, le **?** à côté du titre ouvre l'aide ; **Ouvrir cette section du guide de
    l'utilisateur** ouvre ce guide à la section de cet écran. `python3 tools/anchor_check.py` indique
    que toutes les ancres sont présentes.
39. **Paramètres → Utilisateurs et RACI** → mode multiutilisateur activé, un deuxième utilisateur dont
    l'**Accès aux menus** est *Masqué* pour SIEM : connecté sous cet utilisateur, SIEM n'est pas dans le
    menu. **Paramètres → Journaux** (en tant qu'administrateur) énumère les ouvertures de session et les
    écrans ouverts ; *Exporter … entrées en CSV* écrit un fichier sans aucun contenu d'espace de travail.

**Données, ontologie et qualité**

40. **Sauvegarde et restauration → Versions des données et migrations** : version des données 2 ;
    importez une exportation d'espace de travail plus ancienne qui contenait des enregistrements de
    preuves et des exceptions aux politiques : son journal indique les étapes jusqu'à la version 2, les
    preuves se trouvent dans **Registres partagés → Preuves**, les exceptions dans **Registres partagés
    → Exceptions**, et ses valeurs numériques sont inchangées.
41. **Ontologie · CRGO → Connexion** nomme CRGO v0.10.0 ; *Lien avec l'organisation* → *Construire le
    graphe de l'organisation* sur MediBec affiche **mêmes totaux que cette application** ; *Lire le
    contexte* de S1 ne donne aucune cote de risque ; *Envoyer les résultats cochés sous forme de
    propositions* affiche **proposé** dans le journal ; **Lire les deux contextes** renvoie les contextes
    de conformité et d'opérations de sécurité.
42. **Gestion de la cybersécurité → Essais des contrôles** : une autoévaluation *efficace* et un
    résultat d'audit interne *inefficace* sur le même contrôle affichent **conflit — à résoudre** ; la
    **Revue de qualité** échoue au QC-06.
43. **Gestion de la conformité → Applicabilité juridique** avec un profil vide : chaque instrument est
    une lacune de preuve, aucun n'est « non applicable ». **Déterminations** : *satisfaite* sans preuve
    à jour est refusée, ou échoue au QC-14.
44. **Registres partagés → Exceptions** : une exception qui nomme une obligation légale ne peut pas
    être acceptée. **Gestion de l'audit → Réponses et suivi** : la fermeture d'une constatation sans
    vérification indépendante est refusée.
45. **Contexte de menace** → générez un instantané à partir d'un fichier KEV et d'un fichier EPSS :
    **Utiliser dans cet espace de travail** ne crée aucun fichier ; **Télécharger
    threat-context-YYYY-MM-DD.json** l'enregistre dans le dossier de téléchargement.

**Opérations de sécurité et enseignement**

46. Sur une copie de MediBec, **Paramètres → Données de simulation** → trousse MediBec → **Importer dans
    cet espace de travail** : 40 alertes, 13 règles, 15 indicateurs, 4 dossiers ; APR-MB-04 refusé.
    Aucun incident n'a été créé.
47. **SIEM → Alertes et tri** (en date du 9 octobre 2026) : les alertes des actifs essentiels en
    premier. **Couverture et lacunes** affiche des détections validées, non vérifiées, dégradées et
    absentes. **Indicateurs et TLP** → **Exporter les indicateurs (.csv)** demande quoi faire des
    éléments TLP:RED et TLP:AMBER+STRICT.
48. **SOAR → Actions** énumère les exécutions sans approbation valide avec leurs raisons ; **Dossiers** →
    CASE-MB-03 → **Confirmer comme incident** exige un nom et une date, et l'incident apparaît dans
    SOAR → Incidents et dans Gestion de la cybersécurité → Incidents.
49. **Scénarios en lot → Des opérations de sécurité (SIEM et SOAR)** : des amorces avec leurs preuves et
    *Peut éclairer*, sans aucune valeur ; **Consigner la preuve dans S2** → la fiche *Preuves des
    opérations de sécurité* de l'Éditeur de scénarios l'énumère, et les paramètres de S2 sont inchangés.
50. **Revue de qualité** : QC-14 à QC-18 sont énumérés et réussissent sur la trousse importée.
    **Paramètres → Données de simulation → Retirer les données de simulation** : les registres SIEM et
    SOAR sont de nouveau vides.

Si les cinquante vérifications réussissent, l'installation est saine.

---

## 12. Mise à jour

Remplacez le dossier par la nouvelle version et démarrez-la avec son propre lanceur sur le même port ;
le lanceur arrête toute copie antérieure qui sert encore ce port. Les espaces de travail demeurent dans
le navigateur : à son premier démarrage, la nouvelle version les migre sur une copie et conserve les
originaux (section 5.1). Si vous modifiez vous-même l'application, incrémentez `CACHE` dans `sw.js` et,
lorsque vous changez la façon dont un espace de travail est stocké, ajoutez une étape à
`js/migrate.js` et inscrivez le nouveau champ dans `KNOWN_FIELDS` — la suite de tests échoue tant que
vous ne l'avez pas fait.

Lorsque `crg_calc.py` change : mettez d'abord à jour `crg.js` dans le dépôt mobile, vérifiez-le là,
puis copiez-le ici. L'autovérification détectera une divergence, mais seulement après coup.

---

## 13. Dépannage

| Symptôme | Cause | Solution |
|---|---|---|
| Le pied de page reste figé sur `chargement du moteur…` | Ouvert comme fichier, non servi. | Section 3.2. |
| Mes espaces de travail ont disparu | Adresse ou port différent, autre navigateur, ou données du site effacées. | Utilisez la même adresse et le même port (les lanceurs ouvrent `http://localhost:8099`). Importez votre dernière exportation d'espace de travail. |
| « Non conservé (fenêtre privée) » en haut à droite | Le navigateur refuse le stockage local (fenêtre privée). | Utilisez une fenêtre normale, ou exportez avant de fermer. |
| Un PDF affiche « extraction médiocre » ou aucun texte | PDF numérisé ou encodé de façon inhabituelle. | Ouvrez le document et collez les passages clés, ou téléversez l'original Word. |
| Le générateur d'instantané indique « pas un CSV EPSS » | Mauvais fichier, ou fichier décompressé par le navigateur puis renommé. | Utilisez le fichier `epss_scores-YYYY-MM-DD.csv.gz` (ou le `.csv` simple). |
| Colonnes KEV / EPSS / échelle vides | Aucun instantané dans cet espace de travail. | Contexte de menace → chargez-en ou construisez-en un. |
| Aucune proposition de Pb(ψ,A) | La CVE n'est liée à aucun scénario, son exposition n'est pas confirmée, ou le scénario est déjà au plancher de la fourchette ou au-dessus. | Liez-la dans l'éditeur de scénarios ou le registre ; cochez *Exposé*. |
| Excel affiche les formules, mais d'anciens nombres | Mode de calcul manuel. | Formules → Calculer maintenant. |
| Sources en ligne indique que l'assistant local ne fonctionne pas | L'application n'a pas été démarrée avec son lanceur, ou un lanceur plus ancien la sert. | Fermez la fenêtre et démarrez `start.command` / `start.bat` à partir du dossier de l'application. |
| Un téléchargement NVD reste lent ou ne cesse de réessayer | La NVD limite le débit des requêtes sans clé d'API, ou elle est occupée. | Ajoutez une clé d'API NVD gratuite ; ou choisissez une plage de dates plus courte. L'assistant local réessaie automatiquement. |
| Un téléchargement indique *interrompu* | La fenêtre du lanceur a été fermée avant la fin. | **Redémarrer** depuis la liste des Téléchargements. |
| `CERTIFICATE_VERIFY_FAILED` dans une erreur de téléchargement | Le Python de python.org sous macOS n'a pas encore de certificats racines. | Exécutez *Install Certificates.command* dans le dossier Python, une seule fois. |
| Le pied de page affiche toujours une version plus ancienne après la mise à jour | Un serveur antérieur fonctionne toujours sur le port, ou le navigateur a répondu à partir de sa mémoire cache. | Fermez toutes les anciennes fenêtres de lanceur (ou `lsof -ti:8099 \| xargs kill`), démarrez le nouveau `start.command`, puis rechargez une fois. Section 3.1. |
| Les modifications d'un fichier n'ont aucun effet | Le script de service (`sw.js`) sert sa mémoire cache. | Incrémentez `CACHE` dans `sw.js`, ou faites un rechargement forcé (⇧⌘R / Ctrl-⇧-R). |
| Une source de flux indique *ignorée* | Sa clé d'API n'est pas stockée. | Paramètres → Sources de flux et clés → Clés d'API. |
| Une source de flux indique *Refusé par le mandataire réseau* ou *non résolu* | Le domaine est bloqué par votre réseau ou par la liste d'autorisation de sortie de Claude (tâche planifiée). | Paramètres → Liste d'autorisation réseau → copiez la liste pour le propriétaire de l'organisation (Admin settings → Capabilities). |
| Les paramètres indiquent *enregistrés dans ce navigateur seulement* | L'assistant local ne fonctionne pas. | Démarrez l'application avec son lanceur ; les paramètres sont alors écrits dans le dossier des flux pour la tâche planifiée. |
| *Publier dans le registre partagé* écrit dans la boîte d'envoi | Aucun dossier de registre synchronisé n'est défini. | Définissez *Dossier local synchronisé avec le registre* dans Paramètres, ou laissez la tâche planifiée téléverser la boîte d'envoi. |
| Le ratio d'un scénario n'a pas changé après l'ajout de mesures | Les mesures ne sont pas encore appliquées, ou elles ne réduisent que la vraisemblance ou que l'impact. | Atténuation des risques → Appliquer ; ajoutez une mesure pour l'autre dimension. |
| Une section de navigation semble avoir perdu ses écrans | La section est repliée. | Cliquez sur son titre ; le nombre à côté indique combien d'écrans elle contient. L'état est mémorisé. |
| L'assistant IA indique qu'aucun fournisseur n'est configuré | Aucune clé stockée, ou aucun point de terminaison local défini. | Paramètres → IA — locale et distante → Fournisseurs. Pour un modèle local, indiquez l'URL de base incluant `/v1`. |
| Une réponse de l'IA indique *tronquée* | La réponse a atteint le plafond de sortie du modèle. | Demandez moins de scénarios ou de constats à la fois ; ce qui est arrivé complet est affiché et utilisable. |
| L'écran de l'IA n'offre rien à envoyer | L'IA est désactivée pour cet espace de travail. | Paramètres sur l'écran de l'IA → activez-la. Un espace de travail **confidentiel** demandera tout de même une confirmation à chaque appel. |
| La médiane Monte-Carlo n'est pas le chiffre calculé, sans aucune plage définie | Une plage de paramètres a été laissée sur un scénario. | Plages de paramètres → effacez-la. Sans plage, la médiane doit être exactement égale au total calculé. |
| *Pas assez de relevés pour projeter* sur un ICR | Moins de quatre relevés consignés. | Consignez-en davantage. Trois points n'établissent pas une tendance, et l'outil de prévision ne prétendra pas le contraire. |
| La restauration refuse le fichier | Il a été écrit par une application plus récente, ou sa somme de contrôle a échoué. | Utilisez l'application correspondante ; si la somme de contrôle a échoué, le fichier est endommagé — faites une nouvelle sauvegarde. |
| Un espace de travail est étiqueté *entraînerait une perte de travail* | Ce navigateur contient une copie plus récente que la sauvegarde. | Laissez-le décoché à moins de vouloir revenir en arrière ; exportez d'abord la copie actuelle. |
| Le catalogue importé n'apparaît pas dans Atténuation des risques | L'importation a été prévisualisée, mais pas appliquée. | Cadres et normes → terminez la revue et appliquez ; le journal des révisions devrait l'indiquer. |
| Le tri n'affiche rien | Aucun fichier de flux chargé pour la période. | Flux de menaces → Sources et téléchargements → *Télécharger maintenant les éléments cochés* ou *Charger les fichiers les plus récents*. |
| Une CVE qui vous importe se trouve dans *À surveiller* | Son exposition n'est pas confirmée. | C'est le filtre d'exposition qui fonctionne. Confirmez-la sur l'actif dans Vulnérabilités, puis relancez le tri. |
| La synthèse de la tâche planifiée est absente | Aucun `briefings/triage-profile.json` dans le dossier des flux. | Flux de menaces → Tri → *Exporter le profil pour la tâche planifiée*, puis relancez la tâche. |
| L'étape 5 du Processus ne passe pas au vert | Elle comporte deux moitiés : un instantané **et** au moins une entrée dans le registre des vulnérabilités. L'étape nomme les deux et propose l'écran correspondant à chacune. | Contexte de menace → **Charger l'exemple fourni** (aucun réseau) ; Vulnérabilités → **Ajouter une faiblesse sans CVE** si vous n'avez aucune sortie de balayeur. |
| *EPSS below 0.05 (pruned from this snapshot)* sur une CVE qui vous importe | La table EPSS de l'exemple fourni est élaguée au plafond de l'échelon 1 de l'échelle, de sorte qu'un score négligeable est absent plutôt qu'enregistré. La classification est la même dans les deux cas. | Rien à corriger. Pour le score exact, chargez votre propre instantané produit par `threat_snapshot.py`, ou construisez-en un dans l'application à partir d'un fichier KEV et d'un fichier EPSS que vous avez téléchargés. |
| L'instantané d'exemple est daté et expirera | Il a une date de construction fixe, et les instantanés expirent 90 jours après leur récupération. | Téléchargez vos propres sources avant de vous fier à un chiffre ; l'écran et l'indicateur d'ancienneté le disent tous deux. |
| Ontologie · CRGO répond *instantané* alors que l'ontologie est installée | L'assistant local n'a pas trouvé le serveur, ou son Python ne dispose pas du paquet `mcp` ou `pyoxigraph`. | Ontologie · CRGO → Connexion : lisez *Le serveur MCP ne peut pas être utilisé* ; définissez l'interpréteur que Claude utilise pour celui-ci (par exemple `/usr/local/bin/python3`) et le chemin de `crgo_server.py`, ou exécutez `pip install "mcp>=1.2" pyoxigraph` pour le Python de l'assistant local. |
| La première réponse de l'ontologie prend dix secondes ou plus | Le serveur construit son magasin à partir des fichiers de l'ontologie lors de son premier démarrage. | Patientez une fois ; les réponses suivantes sont immédiates tant que l'assistant local fonctionne. *Démarrer le serveur* dans l'onglet Connexion le fait à l'avance. |
| *Lire le dossier partagé* ne trouve rien | Aucun dossier de registre partagé n'est défini, il n'est pas synchronisé sur cet ordinateur, ou l'assistant local ne fonctionne pas. | Registre partagé des risques → Paramètres du registre → *Dossier partagé du registre sur cet ordinateur* ; vérifiez que le dossier existe et qu'il est synchronisé ; démarrez l'application avec son lanceur. |
| *Contribuer des risques* indique *Utilisateurs privilégiés seulement* | En mode multiutilisateur, le partage exige un administrateur ou le RACI **A** à l'étape 13. | Adressez-vous à un administrateur, ou faites accorder le droit dans Paramètres → Utilisateurs et RACI. |
| Une fiche du Registre affiche *non anonymisée* | Son contributeur a désactivé l'anonymisation. | Lisez-la comme une information identifiable ; un modérateur peut la rejeter. |
| *Gestion des PSI*, *Gestion de la conformité*, *SIEM* ou un autre écran a disparu du menu | La fonctionnalité est désactivée, ou masquée pour vous. | Paramètres → Modules ; ou Paramètres → Utilisateurs et RACI → Accès aux menus. Les données sont toujours dans l'espace de travail. |
| Toute une section du menu a disparu | Tous ses écrans sont désactivés ou masqués. | Comme ci-dessus. |
| Une politique publiée ne peut pas être modifiée | Le texte publié est figé à dessein. | *Commencer une nouvelle version* : la version publiée demeure dans l'historique. |
| *Approuver* est refusé pour une politique | L'approbation exige le RACI **A** à l'étape 13 ou un administrateur. | Faites-la approuver par la personne redevable. |
| Après *Recommencer ce cas*, les étapes 2 et 3 affichent *à faire* | Le paramètre de l'enseignant redonne ces étapes à l'étudiant. | C'est voulu : extrayez de nouveau le profil et les actifs essentiels des documents du cas. Un enseignant peut le modifier sous *Pour l'enseignant*. |
| Importer des documents ne lit qu'un seul document | Les documents qui viennent d'être ajoutés sont les seuls sélectionnés par défaut. | Cochez les autres, ou *Sélectionner tous les documents*. |
| Bandeau rouge `moteur DIVERGENT` | Le moteur est en désaccord avec les totaux de référence. | Arrêtez. Restaurez une copie propre. |
| *Cet espace de travail est ouvert en lecture seule* | Il a été écrit par une application plus récente, ou sa migration a échoué. | Sauvegarde et restauration → Versions des données et migrations en indique la raison ; ouvrez-le avec l'application plus récente, ou envoyez l'erreur au soutien technique. Rien n'a été modifié. |
| *Lien avec l'organisation* indique que le contrat n'est pas disponible | L'ontologie trouvée est antérieure à v0.9.1. | Clonez l'étiquette v0.10.0 (section 3.5) et faites pointer le serveur vers celle-ci. |
| Les contextes de conformité et d'opérations de sécurité indiquent qu'ils exigent CRGO v0.10.0 | L'ontologie trouvée est plus ancienne. | Clonez l'étiquette v0.10.0 à côté de l'application (le clone le plus récent est trouvé en premier), ou faites pointer `crgo-ontology` dans Claude vers celui-ci. |
| Un renvoi est refusé avec `UNKNOWN_SUBJECT` ou `INPUT_UNKNOWN` | Des scénarios ont été ajoutés, renommés ou exclus depuis la construction du graphe. | *Reconstruire le graphe de l'organisation*, puis envoyez de nouveau. |
| *Le dossier du graphe de l'organisation se trouve dans un dépôt git* | Le dossier confidentiel choisi se trouve dans un dépôt. | Choisissez un dossier situé hors de tout dépôt (Lien avec l'organisation → *Enregistrer le dossier*). |
| Une trousse de simulation affiche des erreurs et ne peut pas être importée | Elle cite des scénarios ou des actifs essentiels que cet espace de travail ne contient pas. | Importez-la dans un espace de travail de son cas (pour MediBec, l'exemple ou une copie de celui-ci). |
| La couverture du SIEM semble erronée pour l'exercice | La date de référence précède le déroulement. | SIEM → Vue d'ensemble → réglez la date de référence (le 9 octobre 2026 ou plus tard pour la trousse MediBec). |
| Une alerte ou un dossier n'est pas compté comme incident | Personne ne l'a confirmé. | C'est la règle : SOAR → Dossiers → **Confirmer comme incident**, avec un nom et une date. |
| Une importation dans le SIEM n'ajoute rien | Les enregistrements sont des doublons d'enregistrements déjà importés. | Rien à corriger ; l'historique des importations indique combien ont été écartés. |
| Certaines alertes ou amorces affichent *Masqué — TLP restreint* | Elles sont TLP:RED ou TLP:AMBER+STRICT. | Cochez *Afficher les éléments TLP:RED et TLP:AMBER+STRICT sur cet ordinateur* pour les lire ici ; elles ne sont jamais envoyées à l'IA. |
| *Paramètres → Journaux* est refusé | En mode multiutilisateur, seul un administrateur peut lire les journaux. | Ouvrez une session en tant qu'administrateur. |
| Un instantané construit dans l'application n'est pas dans le dossier Téléchargements | **Utiliser dans cet espace de travail** le stocke dans l'espace de travail ; aucun fichier n'est créé. | Cliquez sur **Télécharger threat-context-YYYY-MM-DD.json** (ou sur **Télécharger** en haut de Contexte de menace). |

Pour voir une erreur sous-jacente, ouvrez la console de développement — **⌥⌘I** sous macOS, **F12** sous
Windows et Linux — et lisez l'onglet **Console**.

---

## 14. Ce que cet outil ne fait pas

C'est un instrument d'aide à la décision. Chaque scénario, probabilité, score CVSS, estimation de coût,
estimation d'efficacité et option suggérée qui y transite est une **hypothèse analytique initiale** qui
doit être validée auprès des parties prenantes internes, à l'aide des données techniques, des constats
d'audit, des résultats d'essais, de l'historique des incidents et du renseignement sur les menaces.

Les résultats quantitatifs sont des **indicateurs relatifs de comparaison et de priorisation**, et non
des prédictions de pertes financières. Un instantané du contexte de menace est une preuve datée de
l'environnement externe, et non une mesure de votre organisation. Les indices de contexte sont un
balayage par mots clés, et non une analyse. Le générateur de scénarios en lot produit des candidats, et
non une évaluation.

Tout ce que produit l'**assistant IA** est une hypothèse qui a moins de poids que le reste, et non
davantage : une critique est l'opinion d'un lecteur sur vos estimations, un scénario généré est une
ébauche qui n'a pas rencontré votre organisation, et une synthèse narrée est une note d'accompagnement.
Rien de cela ne constitue une preuve, rien de cela ne modifie par soi-même une valeur enregistrée, et le
journal des décisions existe pour qu'un auditeur puisse voir quelles suggestions vous avez retenues et
lesquelles vous avez refusées.

Une **prévision** décrit l'ampleur de votre incertitude au sujet de vos propres estimations. Ce n'est
pas une prédiction d'événements, et un intervalle étroit signifie que vos estimations concordaient
entre elles, et non qu'elles étaient justes. Une **projection d'ICR** prolonge une droite à travers les
relevés passés et ne dit rien de ce qui changera réellement au prochain trimestre.

Un **tri** indique lesquelles des histoires de la semaine méritent votre attention compte tenu de ce
que vous avez consigné. Il ne vaut que ce que vaut cette consignation : une technologie que vous n'avez
jamais saisie, ou une exposition que vous n'avez jamais confirmée, ne peut pas porter une histoire à
votre attention.

L'**ontologie** est une bibliothèque de valeurs a priori d'étalonnage, et non une description de votre
organisation : ses valeurs ont été estimées pour une organisation de soins de santé fictive et pour des
cas d'enseignement. Une fiche du **Registre partagé des risques** décrit une autre organisation à un
autre moment, telle que cette organisation la percevait ; ses paramètres sont un point de référence, et
non une estimation pour la vôtre, et l'anonymisation réduit — sans l'éliminer — le risque qu'une fiche
soit rattachée à son contributeur. Un **gabarit de politique** est un point de départ, et non un avis
juridique ; un **statut de conformité** proposé par les règles ou par l'IA est une lecture des preuves
consignées, et n'est complet que dans la mesure où ces preuves le sont.

- **Il ne fournit pas d'avis juridique.** L'applicabilité juridique est l'évaluation, par CRGO, d'un
  profil ; les instruments potentiellement applicables exigent une personne qualifiée, et les
  évaluations de l'obligation de déclaration relèvent de personnes qualifiées.
- **Ce n'est pas une méthodologie d'audit.** Les objectifs de la SP 800-53A sont une référence ; les
  programmes de travail de CRGO sont illustratifs.
- **L'ontologie ne calcule aucun risque, et un renvoi n'approuve rien.** Chaque valeur numérique
  provient du moteur de cette application ; les approbations, les acceptations de risque et le
  financement sont des décisions que des personnes consignent.
- **Il ne se connecte pas à vos outils de sécurité.** Le SIEM et le SOAR fonctionnent à partir de
  fichiers que vous importez ; les actions d'intervention sont consignées par des personnes, et les
  guides d'intervention sont mis à l'essai par simulation à blanc. Une alerte n'est pas un incident
  tant qu'une personne ne l'a pas confirmé, rien ici n'autorise une action d'intervention, la
  couverture n'est validée que par un essai de détection concluant, et la confiance d'une source n'est
  pas une probabilité.
- **Une correspondance, une prise de connaissance ou une attestation n'est pas la conformité.** Seule
  une détermination datée et appuyée par une preuve à jour établit un état de conformité. Les normes
  sous licence n'apparaissent que sous forme d'identifiants.
- **Les données de simulation sont fictives.** Elles servent à enseigner ; elles ne sont jamais des
  preuves concernant une organisation réelle.

La décision d'accepter, de transférer, d'éviter ou d'atténuer un risque demeure la responsabilité de la
direction.
