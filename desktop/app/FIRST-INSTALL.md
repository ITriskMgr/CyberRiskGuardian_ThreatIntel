# CyberRiskGuardian Desktop 1.9.3 Beta — First-time installation

**English below · [Français plus bas](#français)**

**Document 1 of 2.** This guide gets the application running on your computer and proves that its
calculation engine is correct. It ends when the bottom of the left menu shows **✓ Engine verified**. Then
continue with **Document 2 — First-time setup**, which covers where your data goes, backups, modules, AI and
your first assessment.

Written for one person installing on one computer: a consultant, an analyst, a tester. Upgrading from an
earlier version? Use the upgrade section of the installation guide instead.

**Finding the screens.** **Help** is the button in the top bar: it opens *Help on this screen*, *Step by
step*, the *User guide*, *Ask the help chatbot* and *About & versions*. Every other path, such as
**Settings → Modules**, starts in the left-hand menu.

---

# English

## 1. What you need

| | |
|---|---|
| **A current browser** | Chrome or Edge if you want to install it as a desktop application (section 5). Safari and Firefox run it in a tab. |
| **Python 3** | Only to serve the folder on your own machine. macOS and most Linux distributions already have it. On Windows, install it from [python.org](https://www.python.org/downloads/) and tick **Add python.exe to PATH**. |
| **About 16 MB of disk** | Plus your workspaces. |
| **Optional: Tesseract and Poppler** | Only to read scanned PDFs and images in the Security Policy Writer. Everything else works without them. Skip them for now — the installation guide has the commands. |

No account, no licence key, no installer, no administrator rights. Nothing is written outside the
application folder and your browser’s own storage, and the local server listens on `127.0.0.1` only:
the application is never reachable from your network.

> **Licence — read once.** Free for students (personal learning), for registered non-profit
> organisations assessing their own cyber risk, and for **evaluation by any organization for up to
> 30 days**. Consultants, businesses, MSSPs and public bodies need a **Commercial Licence**
> (Professional, Team, Enterprise or MSSP); colleges, CEGEPs and universities need the
> **Educational Licence**. Nothing to activate: the details are in **Help → About & versions → Licence**
> and in the `licences` folder; Professional and Team are sold at **cyberriskguardian.ca**, everything
> else through **sales@cyberriskguardian.ca**.

## 2. Download, check and unpack

1. From the release page, download **`CyberRiskGuardian_Desktop_v1.9.3-beta.zip`** and the file beside
   it, **`CyberRiskGuardian_Desktop_v1.9.3-beta.zip.sha256`**.
2. **Check that the ZIP is the one that was published.** It is a security tool; start as you mean to go
   on. In a terminal, in the folder holding both files:

   | System | Command |
   |---|---|
   | macOS, Linux | `shasum -a 256 -c CyberRiskGuardian_Desktop_v1.9.3-beta.zip.sha256` → must print `OK` |
   | Windows (PowerShell) | `Get-FileHash .\CyberRiskGuardian_Desktop_v1.9.3-beta.zip -Algorithm SHA256` → the hash must equal the one in the `.sha256` file |

   If it does not match, do not open the ZIP: download it again.
3. Unzip it **somewhere you can write and that you back up** — your Documents folder is fine. Keep the
   folder intact: the application loads its own files from it.

## 3. Start it

> **Start it with the launcher below. Double-clicking `index.html` does not work.** Opened as a file, the
> page appears but the engine check never runs and the footer stays on *engine loading…*.

| Your system | What to do |
|---|---|
| **macOS** | Double-click **`start.command`**. If macOS refuses to open it: right-click the file → **Open** → **Open**. If it opens as a text file, see 6.1. |
| **Windows** | Double-click **`start.bat`**. |
| **Linux** | Double-click **`start.sh`**, or run `./start.sh` in a terminal. |

A terminal window opens, then your browser opens on the application. If a copy is already running (the same
folder started twice, or an earlier version in another folder), the terminal asks *CyberRiskGuardian is already
running (version x, folder path). Stop it and start this one? [y/N]* — **Return** opens the running copy in your
browser; **y** stops it and starts this one (do this after an upgrade). **Leave the terminal window open
while you work**: it is the local server and the helper that downloads threat sources and keeps your
API keys. **Control-C** in that window stops it (or **Exit** in the application’s top bar).

At the very first start the application asks **Check for updates at start-up?** Answering **No** is
safe: it then never contacts anything on its own. Document 2, section 2, helps you decide. The Process
page also invites you to **Set up the application for your practice** — Document 2, section 5, explains
the questions; you can skip them for now.

> **Always use the same address.** The browser stores your workspaces for the exact address you use.
> `http://localhost:8099` and `http://127.0.0.1:8099` are two different addresses to a browser, and so
> is any other port. Use the launcher every time and this cannot go wrong.

## 4. Check the engine before trusting a number

The bottom of the left menu must show:

```
© Marc-André Léger · v1.9.3 Beta · ✓ Engine verified
```

At every start the application recomputes its bundled teaching cases — MediBec (30 scenarios, English
and French) and CanaRetail (English and French) — and compares the totals with the reference
implementation. When they match, the engine in your browser agrees with the reference. Click that line
(or **Help → About & versions**) to see the totals: **MediBec 84,305 / 41,023 · CanaRetail 27,526 / 16,049**.

| The bottom of the menu shows | What it means | What to do |
|---|---|---|
| **✓ Engine verified** | Correct. | **Installation done.** Optional: section 5 below (install as a desktop app). Then continue with Document 2 — First-time setup. |
| *engine loading…*, and it stays | Opened as a file instead of with the launcher. | Section 3. |
| **✗ Engine check failed**, with a red banner | The engine disagrees with the reference, or some of the application’s files did not load. | **Do not rely on any number.** Read the banner; delete the folder and start again from a ZIP whose checksum matches. If it persists, open the browser console and send what it says to sales@cyberriskguardian.ca. |
| **◻ Engine unverified** | A file of the self-check is missing: calculations work but are unchecked. | Unzip again and keep the folder intact. |

**Help → User guide** and **Help → Step by step** open in windows of their own and work offline. Every
screen has a **?** beside its title that opens its own help (the same as **Help → Help on this screen**).

## 5. Install it as a desktop application (recommended)

With the application open from the launcher:

- **Chrome** — the install icon at the right of the address bar.
- **Edge** — ☰ → **Apps** → **Install this site as an app**.

You get a windowed application with its own icon that works offline. Downloading threat sources and
using AI still need the helper: start the launcher when you need them.

## 6. If something goes wrong

**6.1 `start.command` opens in a text editor instead of running (macOS).** In a terminal:

```bash
cd /path/to/CyberRiskGuardian_Desktop_v1.9.3-beta
chmod +x start.command start.sh
```

**6.2 “No local web server found.”** Install Python 3 from python.org. On Windows, tick *Add
python.exe to PATH* in the installer, then run `start.bat` again.

**6.3 The port is in use by another program.** Start on another port and **keep using it**:
`./start.command 8150` or `start.bat 8150`. Workspaces created on port 8099 are not visible on 8150.

**6.4 Nothing opens in the browser.** Open `http://localhost:8099/` yourself. The terminal window
prints the exact address it is serving.

**6.5 Confirming nothing is still listening.** macOS or Linux: `lsof -ti:8099` — no output means
nothing is running. Windows: `netstat -ano | findstr :8099`, then `taskkill /PID <pid> /F`.

**6.6 The guide windows do not open.** Allow pop-up windows for `localhost` in your browser.

**6.7 Stopping it.** Control-C in the terminal window, or **Exit** in the top bar. Closing the browser
does not stop the server.

## 7. What is optional, and where it is described

| You may later want | Where to look |
|---|---|
| The CyberRiskGuardian Ontology through its own MCP server (the application already ships a snapshot) | The installation guide, section on the ontology |
| The CyberRiskGuardian plugins for Claude (Core, Threat Intel) | github.com/ITriskMgr/CyberRiskGuardian |
| Shared folders and the shared Risk Registry | The installation guide, sections on shared folders and the Risk Registry |

**Next: Document 2 — First-time setup.**

---

# Français

**Document 1 de 2.** Ce guide fait fonctionner l’application sur votre ordinateur et prouve que son
moteur de calcul est exact. Il se termine lorsque le bas du menu de gauche affiche **✓ Moteur vérifié**.
Poursuivez ensuite avec le **Document 2 — Première configuration**, qui traite de l’emplacement de vos
données, des sauvegardes, des modules, de l’IA et de votre première analyse.

Rédigé pour une personne qui installe l’application sur un seul ordinateur : consultant, analyste,
testeur. Vous passez d’une version antérieure? Utilisez plutôt la section sur la mise à niveau du guide
d’installation.

**Trouver les écrans.** **Aide** est le bouton de la barre supérieure : il ouvre *Aide sur cet écran*,
*Pas à pas*, le *Guide de l’utilisateur*, *Demander à l’agent conversationnel d’aide* et *À propos et
versions*. Tout autre chemin, comme **Paramètres → Modules**, part du menu de gauche.

## 1. Ce qu’il vous faut

| | |
|---|---|
| **Un navigateur à jour** | Chrome ou Edge si vous voulez l’installer comme application de bureau (section 5). Safari et Firefox l’exécutent dans un onglet. |
| **Python 3** | Uniquement pour servir le dossier sur votre propre poste. macOS et la plupart des distributions Linux l’ont déjà. Sous Windows, installez-le depuis [python.org](https://www.python.org/downloads/) et cochez **Add python.exe to PATH**. |
| **Environ 16 Mo d’espace disque** | Plus vos espaces de travail. |
| **Facultatif : Tesseract et Poppler** | Uniquement pour lire les PDF numérisés et les images dans le rédacteur de politiques de sécurité. Tout le reste fonctionne sans eux. Laissez-les de côté pour l’instant — les commandes sont dans le guide d’installation. |

Aucun compte, aucune clé de licence, aucun programme d’installation, aucun droit d’administrateur.
Rien n’est écrit en dehors du dossier de l’application et du stockage propre à votre navigateur, et le
serveur local n’écoute que sur `127.0.0.1` : l’application n’est jamais accessible depuis votre réseau.

> **Licence — à lire une fois.** Gratuite pour les étudiants (apprentissage personnel), pour les
> organismes sans but lucratif enregistrés qui évaluent leur propre risque cyber, et pour
> **l’évaluation par toute organisation pendant au plus 30 jours**. Les consultants, entreprises,
> fournisseurs de services de sécurité gérés et organismes publics ont besoin d’une **licence
> commerciale** (Professionnel, Équipe, Entreprise ou MSSP); les collèges, cégeps et universités, de la
> **licence éducative**. Rien à activer : les détails sont sous **Aide → À propos et versions → Licence**
> et dans le dossier `licences`; Professionnel et Équipe se vendent sur **cyberriskguardian.ca**, le
> reste par **sales@cyberriskguardian.ca**.

## 2. Télécharger, vérifier et décompresser

1. Sur la page de la version, téléchargez **`CyberRiskGuardian_Desktop_v1.9.3-beta.zip`** et le fichier
   qui l’accompagne, **`CyberRiskGuardian_Desktop_v1.9.3-beta.zip.sha256`**.
2. **Vérifiez que le ZIP est bien celui qui a été publié.** C’est un outil de sécurité : autant
   commencer comme il se doit. Dans un terminal, dans le dossier qui contient les deux fichiers :

   | Système | Commande |
   |---|---|
   | macOS, Linux | `shasum -a 256 -c CyberRiskGuardian_Desktop_v1.9.3-beta.zip.sha256` → doit afficher `OK` |
   | Windows (PowerShell) | `Get-FileHash .\CyberRiskGuardian_Desktop_v1.9.3-beta.zip -Algorithm SHA256` → l’empreinte doit être identique à celle du fichier `.sha256` |

   Si elle ne concorde pas, n’ouvrez pas le ZIP : téléchargez-le de nouveau.
3. Décompressez-le **à un endroit où vous pouvez écrire et que vous sauvegardez** — votre dossier
   Documents convient. Gardez le dossier intact : l’application y charge ses propres fichiers.

## 3. Démarrer

> **Démarrez-la avec le lanceur ci-dessous. Double-cliquer `index.html` ne fonctionne pas.** Ouverte
> comme fichier, la page s’affiche, mais la vérification du moteur ne s’exécute jamais et le pied de page
> reste à *chargement du moteur…*.

| Votre système | Ce qu’il faut faire |
|---|---|
| **macOS** | Double-cliquez **`start.command`**. Si macOS refuse de l’ouvrir : clic droit sur le fichier → **Ouvrir** → **Ouvrir**. S’il s’ouvre comme un fichier texte, voyez 6.1. |
| **Windows** | Double-cliquez **`start.bat`**. |
| **Linux** | Double-cliquez **`start.sh`**, ou lancez `./start.sh` dans un terminal. |

Une fenêtre de terminal s’ouvre, puis votre navigateur s’ouvre sur l’application. Si une copie est déjà en cours
(le même dossier démarré deux fois, ou une version antérieure dans un autre dossier), le terminal demande
*CyberRiskGuardian is already running (version x, folder path). Stop it and start this one? [y/N]* — **Retour** ouvre
la copie en cours dans votre navigateur; **y** l’arrête et démarre celle-ci (à faire après une mise à niveau).
**Laissez la fenêtre de terminal ouverte pendant que vous travaillez** : c’est le serveur local et l’assistant local qui
télécharge les sources de menace et garde vos clés d’API. **Contrôle-C** dans cette fenêtre l’arrête
(ou **Quitter** dans la barre supérieure de l’application).

Au tout premier démarrage, l’application demande **Rechercher les mises à jour au démarrage ?**
Répondre **Non** est sans risque : elle ne contacte alors rien d’elle-même. La section 2 du Document 2
vous aide à décider. La page Processus vous invite aussi à **Configurer l’application pour votre
pratique** — la section 5 du Document 2 explique les questions; vous pouvez les passer pour l’instant.

> **Utilisez toujours la même adresse.** Le navigateur conserve vos espaces de travail pour l’adresse
> exacte que vous utilisez. Pour un navigateur, `http://localhost:8099` et `http://127.0.0.1:8099` sont
> deux adresses différentes, tout comme un autre port. Utilisez le lanceur chaque fois et cela ne peut
> pas mal tourner.

## 4. Vérifier le moteur avant de vous fier à un chiffre

Le bas du menu de gauche doit afficher :

```
© Marc-André Léger · v1.9.3 Beta · ✓ Moteur vérifié
```

À chaque démarrage, l’application recalcule ses cas pédagogiques fournis — MediBec (30 scénarios, en
anglais et en français) et CanaRetail (en anglais et en français) — et compare les totaux à ceux de
l’implémentation de référence. S’ils concordent, le moteur de votre navigateur est d’accord avec la
référence. Cliquez sur cette ligne (ou **Aide → À propos et versions**) pour voir les totaux : **MediBec
84 305 / 41 023 · CanaRetail 27 526 / 16 049** (en français, les nombres s’affichent au format français).

| Le bas du menu affiche | Ce que cela signifie | Quoi faire |
|---|---|---|
| **✓ Moteur vérifié** | Tout est correct. | **Installation terminée.** Facultatif : la section 5 ci-dessous (l’installer comme application de bureau). Poursuivez ensuite avec le Document 2 — Première configuration. |
| *chargement du moteur…*, et cela persiste | Ouverte comme fichier au lieu de l’être avec le lanceur. | Section 3. |
| **✗ Échec de la vérification du moteur**, avec une bannière rouge | Le moteur est en désaccord avec la référence, ou certains fichiers de l’application n’ont pas été chargés. | **Ne vous fiez à aucun chiffre.** Lisez la bannière; supprimez le dossier et recommencez avec un ZIP dont l’empreinte concorde. Si cela persiste, ouvrez la console du navigateur et envoyez ce qu’elle indique à sales@cyberriskguardian.ca. |
| **◻ Moteur non vérifié** | Un fichier de l’autovérification manque : les calculs fonctionnent, mais ne sont pas vérifiés. | Décompressez de nouveau et gardez le dossier intact. |

**Aide → Guide de l’utilisateur** et **Aide → Pas à pas** s’ouvrent dans des fenêtres distinctes et
fonctionnent hors ligne. Chaque écran a un **?** à côté de son titre, qui ouvre son aide (la même que
**Aide → Aide sur cet écran**).

## 5. L’installer comme application de bureau (recommandé)

Avec l’application ouverte par le lanceur :

- **Chrome** — l’icône d’installation à droite de la barre d’adresse.
- **Edge** — ☰ → **Applications** → **Installer ce site en tant qu’application**.

Vous obtenez une application en fenêtre, avec sa propre icône, qui fonctionne hors ligne. Le
téléchargement des sources de menace et l’IA ont toujours besoin de l’assistant local : lancez le
lanceur lorsque vous en avez besoin.

## 6. En cas de problème

**6.1 `start.command` s’ouvre dans un éditeur de texte au lieu de s’exécuter (macOS).** Dans un
terminal :

```bash
cd /chemin/vers/CyberRiskGuardian_Desktop_v1.9.3-beta
chmod +x start.command start.sh
```

**6.2 « No local web server found. »** Installez Python 3 depuis python.org. Sous Windows, cochez
*Add python.exe to PATH* dans le programme d’installation, puis relancez `start.bat`.

**6.3 Le port est utilisé par un autre programme.** Démarrez sur un autre port et **continuez de
l’utiliser** : `./start.command 8150` ou `start.bat 8150`. Les espaces de travail créés sur le port
8099 ne sont pas visibles sur le port 8150.

**6.4 Rien ne s’ouvre dans le navigateur.** Ouvrez vous-même `http://localhost:8099/`. La fenêtre de
terminal affiche l’adresse exacte qu’elle sert.

**6.5 Vérifier que rien n’écoute encore.** macOS ou Linux : `lsof -ti:8099` — aucune sortie signifie
que rien ne tourne. Windows : `netstat -ano | findstr :8099`, puis `taskkill /PID <pid> /F`.

**6.6 Les fenêtres de guide ne s’ouvrent pas.** Autorisez les fenêtres surgissantes pour `localhost`
dans votre navigateur.

**6.7 Arrêter l’application.** Contrôle-C dans la fenêtre de terminal, ou **Quitter** dans la barre
supérieure. Fermer le navigateur n’arrête pas le serveur.

## 7. Ce qui est facultatif, et où c’est décrit

| Vous voudrez peut-être plus tard | Où regarder |
|---|---|
| L’ontologie CyberRiskGuardian au moyen de son propre serveur MCP (l’application en contient déjà un instantané) | Le guide d’installation, section sur l’ontologie |
| Les plugiciels CyberRiskGuardian pour Claude (Core, Threat Intel) | github.com/ITriskMgr/CyberRiskGuardian |
| Les dossiers partagés et le registre partagé des risques | Le guide d’installation, sections sur les dossiers partagés et le registre |

**Suite : Document 2 — Première configuration.**
