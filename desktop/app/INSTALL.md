# CyberRiskGuardian Desktop 1.5.6 Beta — Installation

**English below · [Français plus bas](#français)**

Proof of concept — for teaching, exploration and method validation. Validate every result before it
supports a real decision. © 2026 Marc-André Léger · CC BY-NC 4.0. Who may use it without asking and
whose situation needs a commercial licence: **About → Licence** in the application, or `LICENSE`.

---

# English

## 1. What you need

| | |
|---|---|
| **A current browser** | Chrome or Edge if you want to install it as a desktop application. Safari and Firefox run it in a tab. |
| **Python 3** | Only to serve the folder on your own machine. macOS and most Linux distributions already have it. On Windows, install it from [python.org](https://www.python.org/downloads/) and tick **Add python.exe to PATH**. |
| **About 6 MB of disk** | Plus your workspaces. The bundled example threat snapshot is about 1.5 MB. |

No account, no licence key, no installer, no administrator rights. Nothing is written outside the
folder and your browser’s own storage, and the server listens on `127.0.0.1` only — the application
is never reachable from your network, even while it is running.

## 2. Unpack

Unzip **`CyberRiskGuardian_Desktop_v1.5.6-beta.zip`** anywhere you can write — your Documents folder
is fine. Keep the folder intact: the application loads its own files by relative path.

## 3. Start it

> **It must be served over `http://`. Double-clicking `index.html` does not work.** `js/app.js` is an
> ES module and every browser refuses to load modules from a `file://` address. The page would
> appear, but the engine self-check would never run and the footer would stay on `engine loading…`.

| Your system | What to do |
|---|---|
| **macOS** | Double-click **`start.command`**. If macOS refuses to open it, right-click the file → **Open** → **Open**. If it opens as a text file instead of running, see 8.1. |
| **Windows** | Double-click **`start.bat`**. |
| **Linux** | Double-click **`start.sh`**, or run `./start.sh` in a terminal. |

A terminal window opens and your browser opens on the application. **Leave the terminal window open
while you work** — it is the local server and, when you download threat sources, the helper that
fetches them. **Control-C** stops it.

By hand, if you prefer:

```bash
cd CyberRiskGuardian_Desktop_v1.5.6-beta
python3 serve.py 8099
```

then open `http://localhost:8099/`. The port is a positional argument: `python3 serve.py 8150` for
another port.

> **Always use the same address.** Your workspaces are stored by the browser for the exact address
> you use. `http://localhost:8099` and `http://127.0.0.1:8099` are different addresses to a browser,
> and so is any other port. If you ever open the application on a different port the workspace list
> looks empty — nothing is lost, the workspaces are still there under the address you used before.
> Use the launcher and this cannot happen.

## 4. Check the engine before trusting a number

The bottom of the left sidebar must read:

```
engine verified · 84,491 / 41,104
```

At every start the application recomputes the bundled MediBec teaching case — 30 scenarios — and
compares the totals with the reference implementation. When they match, the engine in your browser
agrees with the reference.

| The footer reads | What it means | What to do |
|---|---|---|
| `engine verified · 84,491 / 41,104` | Correct. | Carry on. |
| `engine loading…`, and it stays | Opened as a file instead of being served. | Section 3. |
| `engine missing` | `crg.js`, `cvss4.js` or `sample.js` did not load. | Unzip again and keep the folder intact. |
| `engine DIVERGES` and a red banner | The engine disagrees with the reference. | **Do not rely on any number.** Restore a clean copy. |
| `engine error` | An exception during the self-check. | Open the browser console and send me what it says. |

Then open **General → User guide** for everything else, or **General → Step by step** for the 12
steps of an assessment. Both open in a window of their own and both work offline.

## 5. Set up your own file locations

The application ships with **no folders belonging to anyone else**. Two kinds of location are yours to
choose, and neither is required — the application runs offline with none of them set.

### 5.1 The feeds folder — the one that matters

Everything the application writes outside your browser goes here: the threat sources it downloads, the
weekly briefing, and **your API keys** (`crg-keys.json`, readable by your user only). By default:

| | |
|---|---|
| **macOS and Linux** | `~/Downloads/CyberRiskGuardian-feeds` |
| **Windows** | `%USERPROFILE%\Downloads\CyberRiskGuardian-feeds` |

The launcher creates it the first time it needs it. Downloads is a tidy-up folder on most systems, so
if you intend to keep anything, move it somewhere you back up:

1. Create the folder you want — for example `~/Documents/CyberRiskGuardian-feeds`, or a folder inside
   your organization’s synced drive.
2. In the application folder, create a plain text file called **`feeds-dir.txt`** beside `serve.py`
   and write that one path on its first line. Nothing else in the file.
3. Restart the launcher. **Settings → Links & shared folders** shows the folder in use, so you can
   confirm it took effect.

```
~/Documents/CyberRiskGuardian-feeds
```

If you already have keys and downloads in the old folder, move its contents into the new one before
restarting. The alternative is the environment variable `CRG_FEEDS_DIR`, which wins over the file —
useful in a lab where every student’s folder differs.

> **If someone sent you this application**, check whether a `feeds-dir.txt` came with it. If it names a
> folder on *their* computer, delete the file or replace the path with your own: otherwise the helper
> tries to write to a path that does not exist on your machine, and your keys have nowhere to go.

### 5.2 The shared folders — only if you share

Publishing a risk registry, and the weekly briefing, can go to folders you keep in **your own** Google
Drive. The application ships with none set, because a shared folder is where your organization or your
class keeps things and nobody else can choose it for you. **Settings → Links & shared folders** says
which are still empty.

| Folder | What it is for | Needed when |
|---|---|---|
| **Google Drive — Feeds folder** | The scheduled task copies the feed digest and the summaries it writes there. | You use the scheduled weekly briefing and want it in Drive. |
| **Google Drive — Risk registry folder** | Where you share published, anonymized registries with colleagues. | You publish registries to a team or a community of practice. |
| **Local folder synced with either** | A Google Drive for desktop path. When set, the application writes there directly instead of waiting for the scheduled task. | You have Drive for desktop and want publishing to be immediate. |
| **Controls list (Google Sheets)** | Your own control list, if you keep one. | Almost never — the bundled catalogues do not need it. |

To set one: create the folder in your own Drive, open it in a browser, copy the address from the
address bar, paste it into the matching field in Settings → Links & shared folders, then **Save
settings**. The folder id is shown back to you, so you can check you pasted the right thing.

Leave them empty and nothing breaks: Publish still writes a file you can download and put wherever you
like, and the scheduled task reports that the upload step was skipped.

## 6. Install it as a desktop application (recommended)

With the application open over `http://`:

- **Chrome** — the install icon at the right of the address bar.
- **Edge** — ☰ → **Apps** → **Install this site as an app**.

You get a windowed application with its own icon that starts without a terminal and works offline.
After replacing the folder with a newer version, serve it once with the launcher so the installed
application picks up the new files.

## 7. Upgrading from 1.5.x

1. **Export anything you would hate to lose first** — Backup & restore → *Make a backup* → *Download backup*,
   which writes one file holding every workspace. Your workspaces live in the browser, not in the folder,
   so unzipping a new version does not touch them; a backup is for the day something else does.
2. Unzip 1.5.6 into a **new** folder beside the old one. Do not unzip over the old folder.
3. **Stop the old server** if its terminal window is still open (Control-C). The launchers detect an
   earlier copy on the same port, stop it and say so, but an old window left running is the usual
   reason a browser keeps showing the previous version.
4. Start 1.5.6 **on the same port** as before — the default 8099 — and your workspaces are there.
5. **About → Versions** must read `1.5.6 beta`, and the footer `engine verified · 84,491 / 41,104`.
   If an installed desktop application still shows the old version, reload it once (⌘R / Ctrl-R).
6. If you had set a feeds folder (section 5.1), copy your `feeds-dir.txt` into the new folder. Your API keys
   are not in the application folder at all — they are in `crg-keys.json` in the feeds folder — so
   they survive the upgrade.

Workspaces from 1.1 onwards open as they are. Nothing needs migrating.

## 8. If something goes wrong

**8.1 `start.command` opens in a text editor instead of running (macOS).**

```bash
cd /path/to/CyberRiskGuardian_Desktop_v1.5.6-beta
chmod +x start.command start.sh
```

**8.2 "No local web server found."** Install Python 3 from python.org. On Windows, tick *Add
python.exe to PATH* in the installer, then run `start.bat` again.

**8.3 The port is in use by another program.** Start on another port and keep using it:
`./start.command 8150` or `start.bat 8150`. Remember that the workspaces of port 8099 are not
visible on port 8150.

**8.4 Nothing opens in the browser.** Open `http://localhost:8099/` yourself. The terminal window
prints the exact address it is serving.

**8.5 Confirming nothing is still listening.** macOS or Linux: `lsof -ti:8099` — no output means
nothing is running. Windows: `netstat -ano | findstr :8099`, then `taskkill /PID <pid> /F`.

**8.6 The two guide windows do not open.** They are real windows: allow pop-up windows for
`localhost` in your browser. Without that permission they open as ordinary tabs instead.

**8.7 Stopping it.** Control-C in the terminal window. Closing the browser does not stop the server,
and stopping the server does not close an installed desktop application — that keeps working from
its cache with no server at all.

## 9. Where your things are

| What | Where | Survives unzipping a new version? |
|---|---|---|
| Workspaces, documents, snapshots | Your browser’s own storage, for the address you use | Yes |
| Framework catalogues, AI settings, users and rights | The same storage | Yes |
| API keys | `crg-keys.json` in the feeds folder, readable by your user only (mode 600) | Yes |
| Downloaded threat sources and briefings | The feeds folder — see section 5.1 | Yes |
| The application itself | The folder you unzipped | It *is* the folder |

To start a teaching case over, or to clear or delete a workspace, use **General → Reset data**.

---

<a id="français"></a>

# Français

Preuve de concept — destinée à l’enseignement, à l’exploration et à la validation de la méthode.
Validez chaque résultat avant qu’il n’appuie une décision réelle. © 2026 Marc-André Léger ·
CC BY-NC 4.0. Qui peut l’utiliser sans demander et quelles situations exigent une licence
commerciale : **À propos → Licence** dans l’application, ou le fichier `LICENSE`.

## 1. Ce qu’il vous faut

| | |
|---|---|
| **Un navigateur à jour** | Chrome ou Edge si vous voulez l’installer comme application de bureau. Safari et Firefox l’exécutent dans un onglet. |
| **Python 3** | Uniquement pour servir le dossier sur votre propre poste. macOS et la plupart des distributions Linux l’ont déjà. Sous Windows, installez-le depuis [python.org](https://www.python.org/downloads/) et cochez **Add python.exe to PATH**. |
| **Environ 6 Mo d’espace disque** | Plus vos espaces de travail. L’instantané de menace fourni en exemple pèse environ 1,5 Mo. |

Aucun compte, aucune clé de licence, aucun programme d’installation, aucun droit d’administrateur.
Rien n’est écrit en dehors du dossier et du stockage propre à votre navigateur, et le serveur n’écoute
que sur `127.0.0.1` — l’application n’est jamais accessible depuis votre réseau, même pendant qu’elle
fonctionne.

## 2. Décompresser

Décompressez **`CyberRiskGuardian_Desktop_v1.5.6-beta.zip`** à un endroit où vous avez le droit
d’écrire ; votre dossier Documents convient. Gardez le dossier intact : l’application charge ses
propres fichiers par chemin relatif.

## 3. Démarrer

> **L’application doit être servie en `http://`. Double-cliquer `index.html` ne fonctionne pas.**
> `js/app.js` est un module ES et tous les navigateurs refusent de charger des modules depuis une
> adresse `file://`. La page s’afficherait, mais l’autovérification du moteur ne s’exécuterait jamais
> et le pied de page resterait à `engine loading…`.

| Votre système | Ce qu’il faut faire |
|---|---|
| **macOS** | Double-cliquez **`start.command`**. Si macOS refuse de l’ouvrir, clic droit sur le fichier → **Ouvrir** → **Ouvrir**. S’il s’ouvre comme un fichier texte au lieu de s’exécuter, voyez 8.1. |
| **Windows** | Double-cliquez **`start.bat`**. |
| **Linux** | Double-cliquez **`start.sh`**, ou lancez `./start.sh` dans un terminal. |

Une fenêtre de terminal s’ouvre et votre navigateur s’ouvre sur l’application. **Laissez la fenêtre
de terminal ouverte pendant que vous travaillez** : c’est le serveur local et, lorsque vous
téléchargez des sources de menace, l’assistant qui va les chercher. **Contrôle-C** l’arrête.

À la main, si vous préférez :

```bash
cd CyberRiskGuardian_Desktop_v1.5.6-beta
python3 serve.py 8099
```

puis ouvrez `http://localhost:8099/`. Le port est un argument positionnel :
`python3 serve.py 8150` pour un autre port.

> **Utilisez toujours la même adresse.** Vos espaces de travail sont conservés par le navigateur pour
> l’adresse exacte que vous utilisez. Pour un navigateur, `http://localhost:8099` et
> `http://127.0.0.1:8099` sont deux adresses différentes, et tout autre port également. Si vous ouvrez
> un jour l’application sur un autre port, la liste des espaces de travail paraît vide — rien n’est
> perdu, ils sont toujours là sous l’adresse utilisée auparavant. Avec le lanceur, cela ne peut pas
> arriver.

## 4. Vérifier le moteur avant de vous fier à un chiffre

Le bas de la barre latérale gauche doit afficher ceci (les nombres gardent le même format dans
toutes les langues) :

```
moteur vérifié · 84,491 / 41,104
```

À chaque démarrage, l’application recalcule le cas pédagogique MediBec fourni — 30 scénarios — et
compare les totaux à ceux de l’implémentation de référence. S’ils concordent, le moteur de votre
navigateur est d’accord avec la référence.

| Le pied de page affiche | Ce que cela signifie | Quoi faire |
|---|---|---|
| `moteur vérifié · 84,491 / 41,104` | Tout est correct. | Continuez. |
| `chargement du moteur…`, et cela persiste | Ouvert comme fichier au lieu d’être servi. | Section 3. |
| `moteur manquant` | `crg.js`, `cvss4.js` ou `sample.js` n’a pas été chargé. | Décompressez de nouveau et gardez le dossier intact. |
| `moteur DIVERGENT` et une bannière rouge | Le moteur est en désaccord avec la référence. | **Ne vous fiez à aucun chiffre.** Restaurez une copie propre. |
| `erreur du moteur` | Une exception pendant l’autovérification. | Ouvrez la console du navigateur et envoyez-moi ce qu’elle indique. |

Ouvrez ensuite **Général → Guide de l’utilisateur** pour tout le reste, ou **Général → Pas à pas**
pour les 12 étapes d’une analyse. Les deux s’ouvrent dans une fenêtre distincte et fonctionnent hors
ligne. (Le guide de l’utilisateur est en anglais ; l’interface se met en français avec le bouton
**FR** de la barre supérieure.)

## 5. Configurer vos propres emplacements de fichiers

L’application n’est livrée avec **aucun dossier appartenant à quelqu’un d’autre**. Deux types
d’emplacement vous reviennent, et aucun n’est obligatoire — l’application fonctionne hors ligne sans
qu’aucun ne soit configuré.

### 5.1 Le dossier des flux — celui qui compte

Tout ce que l’application écrit en dehors de votre navigateur va là : les sources de menace qu’elle
télécharge, le breffage hebdomadaire et **vos clés d’API** (`crg-keys.json`, lisible par votre seul
compte). Par défaut :

| | |
|---|---|
| **macOS et Linux** | `~/Downloads/CyberRiskGuardian-feeds` |
| **Windows** | `%USERPROFILE%\Downloads\CyberRiskGuardian-feeds` |

Le lanceur le crée la première fois qu’il en a besoin. Sur la plupart des systèmes, Téléchargements
est un dossier de passage : si vous comptez conserver quelque chose, déplacez-le à un endroit que vous
sauvegardez.

1. Créez le dossier voulu — par exemple `~/Documents/CyberRiskGuardian-feeds`, ou un dossier dans le
   lecteur synchronisé de votre organisation.
2. Dans le dossier de l’application, créez un fichier texte simple nommé **`feeds-dir.txt`** à côté de
   `serve.py` et écrivez ce seul chemin sur sa première ligne. Rien d’autre dans le fichier.
3. Redémarrez le lanceur. **Paramètres → Liens et dossiers partagés** affiche le dossier utilisé, ce
   qui vous permet de confirmer que le changement a pris effet.

```
~/Documents/CyberRiskGuardian-feeds
```

Si vous avez déjà des clés et des téléchargements dans l’ancien dossier, déplacez son contenu dans le
nouveau avant de redémarrer. L’autre méthode est la variable d’environnement `CRG_FEEDS_DIR`, qui a
préséance sur le fichier — utile dans un laboratoire où le dossier diffère pour chaque étudiant.

> **Si quelqu’un vous a transmis cette application**, vérifiez si un fichier `feeds-dir.txt`
> l’accompagne. S’il désigne un dossier situé sur l’ordinateur de cette personne, supprimez le fichier
> ou remplacez le chemin par le vôtre : sinon l’assistant local tente d’écrire dans un chemin qui
> n’existe pas sur votre poste, et vos clés n’ont nulle part où aller.

### 5.2 Les dossiers partagés — seulement si vous partagez

La publication d’un registre de risques et le breffage hebdomadaire peuvent aboutir dans des dossiers
que vous tenez dans **votre propre** Google Drive. L’application n’en configure aucun, parce qu’un
dossier partagé est l’endroit où votre organisation ou votre classe range ses documents et que
personne d’autre ne peut le choisir à votre place. **Paramètres → Liens et dossiers partagés** indique
ceux qui sont encore vides.

| Dossier | À quoi il sert | Nécessaire quand |
|---|---|---|
| **Google Drive — dossier des flux** | La tâche planifiée y copie le condensé des flux et les résumés qu’elle rédige. | Vous utilisez le breffage hebdomadaire planifié et le voulez dans Drive. |
| **Google Drive — dossier du registre des risques** | Là où vous partagez les registres publiés et anonymisés avec des collègues. | Vous publiez des registres pour une équipe ou une communauté de pratique. |
| **Dossier local synchronisé avec l’un ou l’autre** | Un chemin de Google Drive pour ordinateur. Lorsqu’il est défini, l’application y écrit directement au lieu d’attendre la tâche planifiée. | Vous avez Drive pour ordinateur et voulez une publication immédiate. |
| **Liste de contrôles (Google Sheets)** | Votre propre liste de contrôles, si vous en tenez une. | Presque jamais — les catalogues fournis n’en ont pas besoin. |

Pour en configurer un : créez le dossier dans votre propre Drive, ouvrez-le dans un navigateur, copiez
l’adresse dans la barre d’adresse, collez-la dans le champ correspondant sous Paramètres → Liens et
dossiers partagés, puis **Enregistrer les paramètres**. L’identifiant du dossier vous est réaffiché,
ce qui vous permet de vérifier que vous avez collé la bonne chose.

Laissez-les vides et rien ne casse : Publier écrit toujours un fichier que vous pouvez télécharger et
déposer où vous voulez, et la tâche planifiée signale que l’étape de téléversement a été sautée.

## 6. L’installer comme application de bureau (recommandé)

Avec l’application ouverte en `http://` :

- **Chrome** — l’icône d’installation à droite de la barre d’adresse.
- **Edge** — ☰ → **Applications** → **Installer ce site en tant qu’application**.

Vous obtenez une application en fenêtre, avec sa propre icône, qui démarre sans terminal et
fonctionne hors ligne. Après avoir remplacé le dossier par une version plus récente, servez-la une
fois avec le lanceur pour que l’application installée reprenne les nouveaux fichiers.

## 7. Mise à niveau depuis une version 1.5.x

1. **Exportez d’abord ce que vous ne voudriez pas perdre** — Sauvegarde et restauration → *Faire une
   sauvegarde* → *Télécharger la sauvegarde*, qui écrit un seul fichier contenant tous les espaces
   de travail. Vos espaces de
   travail résident dans le navigateur et non dans le dossier : décompresser une nouvelle version ne
   les touche pas. Une sauvegarde sert pour le jour où autre chose les touchera.
2. Décompressez la 1.5.6 dans un **nouveau** dossier, à côté de l’ancien. Ne décompressez pas
   par-dessus l’ancien dossier.
3. **Arrêtez l’ancien serveur** si sa fenêtre de terminal est encore ouverte (Contrôle-C). Les
   lanceurs détectent une copie antérieure sur le même port, l’arrêtent et vous le disent, mais une
   ancienne fenêtre restée ouverte est la raison habituelle pour laquelle un navigateur continue
   d’afficher la version précédente.
4. Démarrez la 1.5.6 **sur le même port** qu’avant — 8099 par défaut — et vos espaces de travail sont
   là.
5. **À propos → Versions** doit afficher `1.5.6 beta`, et le pied de page
   `moteur vérifié · 84,491 / 41,104`. Si une application de bureau installée affiche encore
   l’ancienne version, rechargez-la une fois (⌘R / Ctrl-R).
6. Si vous aviez défini un dossier de flux (section 5.1), copiez votre fichier `feeds-dir.txt` dans le nouveau dossier.
   Vos clés d’API ne sont pas du tout dans le dossier de l’application — elles sont dans
   `crg-keys.json`, au dossier des flux — et survivent donc à la mise à niveau.

Les espaces de travail créés depuis la version 1.1 s’ouvrent tels quels. Aucune migration n’est
nécessaire.

## 8. En cas de problème

**8.1 `start.command` s’ouvre dans un éditeur de texte au lieu de s’exécuter (macOS).**

```bash
cd /chemin/vers/CyberRiskGuardian_Desktop_v1.5.6-beta
chmod +x start.command start.sh
```

**8.2 « No local web server found. »** Installez Python 3 depuis python.org. Sous Windows, cochez
*Add python.exe to PATH* dans le programme d’installation, puis relancez `start.bat`.

**8.3 Le port est utilisé par un autre programme.** Démarrez sur un autre port et continuez de
l’utiliser : `./start.command 8150` ou `start.bat 8150`. Rappelez-vous que les espaces de travail du
port 8099 ne sont pas visibles sur le port 8150.

**8.4 Rien ne s’ouvre dans le navigateur.** Ouvrez vous-même `http://localhost:8099/`. La fenêtre de
terminal affiche l’adresse exacte qu’elle sert.

**8.5 Vérifier que rien n’écoute encore.** macOS ou Linux : `lsof -ti:8099` — aucune sortie signifie
que rien ne tourne. Windows : `netstat -ano | findstr :8099`, puis `taskkill /PID <pid> /F`.

**8.6 Les deux fenêtres de guide ne s’ouvrent pas.** Ce sont de vraies fenêtres : autorisez les
fenêtres surgissantes pour `localhost` dans votre navigateur. Sans cette autorisation, elles
s’ouvrent comme des onglets ordinaires.

**8.7 Arrêter l’application.** Contrôle-C dans la fenêtre de terminal. Fermer le navigateur n’arrête
pas le serveur, et arrêter le serveur ne ferme pas une application de bureau installée — celle-ci
continue de fonctionner à partir de sa cache, sans aucun serveur.

## 9. Où se trouvent vos données

| Quoi | Où | Survit à la décompression d’une nouvelle version ? |
|---|---|---|
| Espaces de travail, documents, instantanés | Le stockage propre à votre navigateur, pour l’adresse que vous utilisez | Oui |
| Catalogues de référentiels, paramètres d’IA, utilisateurs et droits | Le même stockage | Oui |
| Clés d’API | `crg-keys.json`, au dossier des flux, lisible par votre seul compte (mode 600) | Oui |
| Sources de menace téléchargées et breffages | Le dossier des flux — voir la section 5.1 | Oui |
| L’application elle-même | Le dossier que vous avez décompressé | C'*est* le dossier |

Pour recommencer un cas pédagogique, ou pour effacer ou supprimer un espace de travail, utilisez
**Général → Réinitialiser les données**.
