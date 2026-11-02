# SPDX-License-Identifier: CC-BY-NC-4.0
# Copyright (c) 2026 Marc-André Léger
"""CanaRetail — 40 candidate scenarios from the case library, their screening, ten families, watch list and
evidence-collection plan. Scores: BC AC TR EX IM RL OR DC EV RV CU DU (1–5)."""
from cr_common import T, MGMT

CANDS = []      # assessment.CANDIDATES rows
SCREEN = {}     # screening.cands


def C(cid, name, source, vuln, assets, cons, ref, status, note, scores, rat, flags, conf, basis, disp, strategy, target=T('', ''), excl=None):
    CANDS.append([cid, name, source, vuln, assets, cons, ref, status, note])
    r = {'scores': scores, 'rat': rat, 'flags': flags, 'conf': conf, 'basis': basis, 'disp': disp, 'target': target, 'strategy': strategy}
    if excl:
        r['exclReview'] = excl
    SCREEN[cid] = r


CASE = T('Case', 'Cas')
SECTOR = T('External/sector + case', 'Externe/secteur + cas')
ASSUME = T('Case + assumption', 'Cas + hypothèse')
NONE = T('', '')
SEL = lambda s: T('Selected (' + s + ')', 'Retenu (' + s + ')')
MERGED = lambda s: T('Merged into ' + s, 'Fusionné dans ' + s)
NOTSEL = T('Not selected', 'Non retenu')
WATCH_REVIEW = T('On the watch list for explicit management review — Management decision required.',
                 'Sur la liste de surveillance pour examen explicite par la direction — Décision de la direction requise.')

C('C01', T('Ransomware encrypting central servers, SAP and store back-end', 'Rançongiciel chiffrant les serveurs centraux, SAP et l’arrière-boutique'), T('Ransomware affiliate', 'Affilié de rançongiciel'),
  T('Segmentation and backup isolation not evidenced', 'Segmentation et isolement des sauvegardes non démontrés'), 'CJ3 / CJ6 / CJ2', T('Multi-day disruption and data theft', 'Perturbation de plusieurs jours et vol de données'), 'CR-S2 · #2', SEL('S1'),
  T('Highest combined operational and privacy consequence; supplied scenario.', 'Conséquence opérationnelle et sur la vie privée combinée la plus élevée; scénario fourni.'),
  [5, 5, 5, 4, 5, 4, 5, 4, 3, 5, 4, 5], T('Sector-wide threat (E8), peak-season impact, recovery unproven (E2). Evidence 3: no incident at CanaRetail yet.', 'Menace sectorielle (E8), impact en saison de pointe, reprise non démontrée (E2). Preuve 3 : aucun incident chez CanaRetail à ce jour.'),
  ['ES', 'CD', 'BK', 'MU'], 'High', SECTOR, 'Select', ['TD', 'TH'])
C('C02', T('Attack on backup systems preventing data recovery', 'Attaque contre les systèmes de sauvegarde empêchant la reprise'), T('Ransomware affiliate', 'Affilié de rançongiciel'),
  T('Backups reachable from production', 'Sauvegardes accessibles depuis la production'), 'CJ6', T('Loss of recoverability', 'Perte de la capacité de reprise'), '#15', MERGED('S1'),
  T('A stage of the ransomware chain; same treatment (I01).', 'Une étape de la chaîne du rançongiciel; même traitement (I01).'),
  [5, 5, 4, 4, 5, 3, 5, 4, 2, 4, 4, 4], T('Decides whether S1 is survivable; consolidated so it is not counted twice.', 'Détermine si S1 est surmontable; regroupé pour ne pas être compté deux fois.'), ['BK', 'PR'], 'Medium', ASSUME, 'Consolidate', ['DP'])
C('C03', T('Fileless malware on employee machines', 'Maliciel sans fichier sur les postes des employés'), T('Cybercriminal', 'Cybercriminel'), T('Script execution allowed', 'Exécution de scripts permise'), T('Endpoints', 'Postes de travail'),
  T('Foothold for ransomware', 'Point d’appui pour un rançongiciel'), '#38', MERGED('S1'), T('Execution technique within the S1 chain.', 'Technique d’exécution dans la chaîne de S1.'),
  [3, 3, 4, 3, 3, 2, 3, 2, 2, 4, 4, 2], T('Technique, not a scenario on its own.', 'Une technique, non un scénario en soi.'), [], 'Low', NONE, 'Consolidate', ['BU'])
C('C04', T('Lateral movement through inadequate network segmentation', 'Déplacement latéral dû à une segmentation inadéquate du réseau'), T('Any intruder', 'Tout intrus'), T('Flat store and server networks', 'Réseaux des magasins et des serveurs à plat'), 'CJ6 / CJ2',
  T('Spread of any intrusion', 'Propagation de toute intrusion'), '#27', MERGED('S1'), T('Amplifier of S1 and S3; treated by I09.', 'Amplificateur de S1 et S3; traité par I09.'),
  [4, 4, 4, 4, 4, 3, 4, 3, 2, 4, 4, 3], T('Condition rather than event; its treatment is shared by S1, S3 and S8.', 'Une condition plutôt qu’un événement; son traitement est partagé par S1, S3 et S8.'), ['MU'], 'Medium', ASSUME, 'Consolidate', ['DP'])
C('C05', T('Spear-phishing of senior executives and IT staff', 'Harponnage de cadres supérieurs et du personnel des TI'), T('Cybercriminal / hacktivist', 'Cybercriminel / hacktiviste'), T('Push MFA, awareness unknown', 'AMF par notification, sensibilisation inconnue'), 'CJ5',
  T('Account takeover', 'Prise de contrôle de comptes'), '#1, #28', MERGED('S1'), T('Entry path of S1 and S10; treated by I02 (phishing-resistant MFA).', 'Voie d’entrée de S1 et S10; traitée par I02 (AMF résistante à l’hameçonnage).'),
  [4, 4, 5, 4, 4, 3, 3, 2, 3, 4, 4, 4], T('Most frequent entry path in the sector (E8); consolidated with the outcomes it enables.', 'Voie d’entrée la plus fréquente du secteur (E8); regroupée avec les résultats qu’elle permet.'), ['PI'], 'Medium', SECTOR, 'Consolidate', ['TH'])
C('C06', T('Inadequate logging and monitoring allow undetected breaches', 'Journalisation et surveillance inadéquates laissant passer des atteintes'), T('Any incident', 'Tout incident'), T('Log coverage unknown', 'Couverture des journaux inconnue'), T('All', 'Tous'),
  T('Longer dwell time', 'Présence prolongée de l’attaquant'), '#25', MERGED('S1'), T('Amplifier; reflected in θ of each scenario.', 'Amplificateur; reflété dans le θ de chaque scénario.'),
  [4, 3, 3, 3, 4, 3, 3, 2, 2, 3, 5, 3], T('A 10-analyst SOC exists (E4); its coverage is the uncertainty.', 'Un COS de 10 analystes existe (E4); sa couverture est l’incertitude.'), [], 'Medium', CASE, 'Consolidate', ['BU'])
C('C07', T('Malicious IT insider exfiltrates customer, supplier and proprietary data', 'Initié malveillant des TI exfiltrant des données clients, fournisseurs et exclusives'), T('Malicious insider', 'Initié malveillant'),
  T('Standing privileges, no export alerting', 'Privilèges permanents, aucune alerte d’exportation'), 'CJ4 / CJ3', T('Privacy breach, loss of trade secrets', 'Atteinte à la vie privée, perte de secrets commerciaux'), 'CR-S3 · #3', SEL('S2'),
  T('Supplied scenario; privileged and leaver access is an audit area (E7).', 'Scénario fourni; les accès privilégiés et ceux des départs forment un domaine d’audit (E7).'),
  [4, 4, 3, 4, 4, 5, 2, 2, 3, 3, 4, 4], T('High regulatory weight; small, privileged IT team (E4).', 'Poids réglementaire élevé; petite équipe des TI privilégiée (E4).'), ['PV'], 'Medium', CASE, 'Select', ['TD', 'BU'])
C('C08', T('Former employee retains access and misuses privileges', 'Ancien employé conservant des accès et abusant de ses privilèges'), T('Former employee', 'Ancien employé'), T('Leaver process not evidenced', 'Processus de départ non démontré'), 'CJ5',
  T('Unauthorized access', 'Accès non autorisé'), '#11', MERGED('S2'), T('Same control family (IAM lifecycle, PAM).', 'Même famille de mesures (cycle de vie des identités, GAP).'),
  [3, 4, 3, 4, 3, 4, 2, 2, 2, 3, 4, 3], T('Common gap in fast-hiring retail (seasonal staff, E3).', 'Lacune courante dans un commerce qui embauche beaucoup (personnel saisonnier, E3).'), [], 'Medium', ASSUME, 'Consolidate', ['BU'])
C('C09', T('Insider alters financial transactions in SAP FI/CO', 'Initié modifiant des opérations financières dans SAP FI/CO'), T('Malicious insider', 'Initié malveillant'), T('Segregation of duties not evidenced', 'Séparation des tâches non démontrée'), 'CJ3',
  T('Fraud, misstatement', 'Fraude, inexactitude des états financiers'), '#36', MERGED('S2'), T('Insider misuse; SoD controls are financial controls outside this portfolio.', 'Abus par un initié; les contrôles de séparation des tâches sont des contrôles financiers hors de ce portefeuille.'),
  [3, 4, 2, 3, 3, 4, 2, 1, 2, 2, 3, 2], T('Financial-control territory; cyber angle covered by S2 treatments.', 'Relève des contrôles financiers; l’angle cyber est couvert par les traitements de S2.'), [], 'Low', NONE, 'Consolidate', ['BU'])
C('C10', T('POS memory-scraping malware steals card data across stores', 'Maliciel de lecture de mémoire sur les PDV volant des données de cartes'), T('Card-fraud group', 'Groupe de fraude par carte'),
  T('Vendor remote access, no P2PE stated', 'Accès à distance du fournisseur, P2PE non précisé'), 'CJ2', T('Card compromise, PCI fines', 'Compromission de cartes, amendes PCI'), 'CR-S5 · #5', SEL('S3'),
  T('Supplied scenario; payment security is the case’s central theme.', 'Scénario fourni; la sécurité des paiements est le thème central du cas.'),
  [5, 5, 5, 4, 5, 5, 4, 4, 3, 4, 4, 5], T('Very low appetite for payment non-compliance (E6); named sector attack (E8).', 'Très faible appétence pour la non-conformité des paiements (E6); attaque sectorielle nommée (E8).'),
  ['PV', 'RG', 'MU'], 'High', SECTOR, 'Select', ['TD', 'TH'])
C('C11', T('Compromised device used to infiltrate the store or corporate network', 'Appareil compromis servant à infiltrer le réseau d’un magasin ou de l’entreprise'), T('Cybercriminal', 'Cybercriminel'), T('Network access control not evidenced', 'Contrôle d’accès au réseau non démontré'), T('Store LAN', 'Réseau local du magasin'),
  T('Foothold', 'Point d’appui'), '#16', MERGED('S3'), T('Entry path into store networks; treated by I09.', 'Voie d’entrée dans les réseaux des magasins; traitée par I09.'),
  [3, 3, 3, 3, 3, 2, 3, 2, 2, 3, 3, 2], T('Generic path; overlaps S3 and S1.', 'Voie générique; recoupe S3 et S1.'), [], 'Low', NONE, 'Consolidate', ['GL'])
C('C12', T('Malware introduced via removable media in stores', 'Maliciel introduit par un support amovible en magasin'), T('Opportunistic / insider', 'Opportuniste / initié'), T('USB ports enabled on back-office PCs', 'Ports USB actifs sur les PC d’arrière-boutique'), T('Store PCs', 'PC des magasins'),
  T('Foothold', 'Point d’appui'), '#17', MERGED('S3'), T('Same treatment (allow-listing, segmentation).', 'Même traitement (liste d’applications autorisées, segmentation).'),
  [2, 3, 2, 3, 2, 2, 2, 1, 1, 2, 3, 2], T('Low decision value on its own.', 'Faible valeur décisionnelle en soi.'), [], 'Low', NONE, 'Consolidate', ['GL'])
C('C13', T('Exploitation of unpatched internet-facing software', 'Exploitation de logiciels exposés à Internet et non corrigés'), T('Access broker / state-linked', 'Courtier d’accès / acteur lié à un État'),
  T('Patch windows tied to stores, no EASM', 'Fenêtres de correctifs liées aux magasins, aucune surveillance externe'), 'CJ5 / CJ6', T('Intrusion, ransomware precursor', 'Intrusion, précurseur d’un rançongiciel'), 'CR-S6 · #6', SEL('S4'),
  T('Supplied scenario; leading entry vector.', 'Scénario fourni; vecteur d’entrée majeur.'),
  [4, 5, 5, 4, 4, 3, 4, 3, 3, 5, 4, 4], T('Mass exploitation within days of disclosure; patch constraints inferred from store operations.', 'Exploitation massive dans les jours suivant la divulgation; contraintes de correction déduites de l’exploitation des magasins.'), ['PI'], 'Medium', SECTOR, 'Select', ['TH', 'BU'])
C('C14', T('VPN vulnerability exploited for unauthorized access', 'Vulnérabilité de RPV exploitée pour un accès non autorisé'), T('Access broker', 'Courtier d’accès'), T('Edge device exposure', 'Exposition d’un équipement de périphérie'), 'CJ5',
  T('Remote access', 'Accès à distance'), '#41', MERGED('S4'), T('The concrete instance used in S4.', 'L’instance concrète utilisée dans S4.'), [4, 5, 5, 4, 4, 3, 4, 3, 3, 5, 4, 3], T('Same chain as C13.', 'Même chaîne que C13.'), ['PI'], 'Medium', SECTOR, 'Consolidate', ['TH'])
C('C15', T('Known but unaddressed vulnerabilities on internal servers', 'Vulnérabilités connues non traitées sur des serveurs internes'), T('Any intruder', 'Tout intrus'), T('No SLA, exception backlog', 'Aucun délai, arriéré d’exceptions'), 'CJ6',
  T('Privilege escalation', 'Élévation de privilèges'), '#43', MERGED('S4'), T('Same programme (I05).', 'Même programme (I05).'), [3, 4, 4, 4, 3, 2, 3, 2, 2, 3, 3, 3], T('Amplifier of S1 and S4.', 'Amplificateur de S1 et S4.'), [], 'Low', NONE, 'Consolidate', ['BU'])
C('C16', T('Outdated browser plug-ins exploited on company machines', 'Modules d’extension de navigateur désuets exploités sur les postes'), T('Cybercriminal', 'Cybercriminel'), T('Plug-in inventory absent', 'Inventaire des modules absent'), T('Endpoints', 'Postes de travail'),
  T('Foothold', 'Point d’appui'), '#32', MERGED('S4'), T('Endpoint variant of S4.', 'Variante de S4 sur les postes.'), [2, 2, 3, 3, 2, 1, 2, 1, 1, 3, 3, 2], T('Low consequence alone.', 'Faible conséquence à elle seule.'), [], 'Low', NONE, 'Consolidate', ['GL'])
C('C17', T('Unsecured cloud storage bucket exposes customer information', 'Compartiment infonuagique non sécurisé exposant des renseignements clients'), T('Opportunistic actor', 'Acteur opportuniste'),
  T('No public-access block, no object logging', 'Aucun blocage de l’accès public, aucune journalisation des objets'), 'CJ7 / CJ4', T('Bulk privacy breach', 'Atteinte massive à la vie privée'), 'CR-S10 · #10', SEL('S5'),
  T('Supplied scenario; cloud configuration is an audit area (E7).', 'Scénario fourni; la configuration infonuagique est un domaine d’audit (E7).'),
  [4, 4, 4, 4, 4, 5, 2, 3, 3, 4, 4, 4], T('Frequent, high privacy weight, cheap to prevent.', 'Fréquent, poids élevé sur la vie privée, peu coûteux à prévenir.'), ['PV'], 'Medium', SECTOR, 'Select', ['BU', 'TH'])
C('C18', T('Data leak due to misconfigured permissions on shares and cloud folders', 'Fuite de données due à des permissions mal configurées sur des partages et dossiers infonuagiques'), T('Insider / external', 'Initié / externe'), T('Oversharing', 'Partage excessif'), T('Teams, SharePoint', 'Teams, SharePoint'),
  T('Privacy breach', 'Atteinte à la vie privée'), '#22', MERGED('S5'), T('Same treatment (posture management, DLP).', 'Même traitement (gestion de la posture, DLP).'), [3, 3, 3, 4, 3, 4, 1, 2, 2, 3, 3, 3], T('Common, smaller scale.', 'Courant, à plus petite échelle.'), [], 'Low', NONE, 'Consolidate', ['BU'])
C('C19', T('Weak encryption standards allow decryption of customer and card data', 'Normes de chiffrement faibles permettant de déchiffrer des données clients et de cartes'), T('Cybercriminal with a data copy', 'Cybercriminel détenant une copie des données'),
  T('Deprecated algorithms, keys with data', 'Algorithmes dépréciés, clés avec les données'), 'CJ1 / CJ4', T('Breach, PCI finding', 'Atteinte, constat PCI'), 'CR-S13a · #12', SEL('S6'),
  T('Supplied scenario; tests the “encrypted” claim (E2).', 'Scénario fourni; met à l’épreuve l’affirmation « chiffré » (E2).'),
  [4, 4, 3, 3, 4, 5, 1, 2, 2, 2, 4, 4], T('Consequence high, evidence weak; selected because the case relies on encryption as a control.', 'Conséquence élevée, preuve faible; retenu parce que le cas s’appuie sur le chiffrement comme mesure.'), ['PV', 'RG'], 'Low', CASE, 'Select', ['BU'])
C('C20', T('Mismanagement of cryptographic keys', 'Mauvaise gestion des clés cryptographiques'), T('Any actor', 'Tout acteur'), T('No KMS/HSM', 'Aucun service de gestion des clés ni HSM'), 'CJ1', T('Decryption', 'Déchiffrement'), '#29', MERGED('S6'),
  T('Same treatment (I07).', 'Même traitement (I07).'), [3, 4, 3, 3, 4, 4, 1, 2, 2, 2, 4, 3], T('Part of the S6 chain.', 'Partie de la chaîne de S6.'), [], 'Low', NONE, 'Consolidate', ['BU'])
C('C21', T('Data interception due to weak transport-layer security', 'Interception de données due à une sécurité faible de la couche transport'), T('Network attacker', 'Attaquant réseau'), T('Legacy TLS on store routers', 'TLS ancien sur des routeurs de magasins'), T('Store WAN', 'Réseau étendu des magasins'),
  T('Interception', 'Interception'), '#44', MERGED('S6'), T('Same crypto programme (I07).', 'Même programme cryptographique (I07).'), [3, 3, 2, 3, 3, 3, 1, 2, 2, 2, 3, 2], T('Limited exposure on a private WAN.', 'Exposition limitée sur un réseau étendu privé.'), [], 'Low', NONE, 'Consolidate', ['GL'])
C('C22', T('SQL injection on the e-commerce website', 'Injection SQL sur le site de commerce électronique'), T('Cybercriminal', 'Cybercriminel'), T('No SAST/DAST or WAF evidenced', 'Aucun SAST/DAST ni pare-feu applicatif Web démontré'), 'CJ1',
  T('Data theft, skimming', 'Vol de données, écrémage'), 'CR-S13b · #13', SEL('S7'), T('Supplied scenario; online channel is primary (E3).', 'Scénario fourni; le canal en ligne est principal (E3).'),
  [5, 5, 4, 3, 5, 5, 3, 2, 3, 4, 4, 4], T('Direct path to customer and card data online.', 'Voie directe vers les données clients et de cartes en ligne.'), ['PV', 'RG'], 'Medium', SECTOR, 'Select', ['TH', 'BU'])
C('C23', T('E-skimming through a malicious third-party script or widget on checkout', 'Écrémage en ligne au moyen d’un script ou d’un gadget tiers malveillant au paiement'), T('Magecart-type group', 'Groupe de type Magecart'), T('Third-party scripts unmonitored', 'Scripts tiers non surveillés'), 'CJ1',
  T('Card theft online', 'Vol de cartes en ligne'), '#34, #35', MERGED('S7'), T('Same outcome as S7 (checkout skimming); treated by I08 and I04.', 'Même résultat que S7 (écrémage au paiement); traité par I08 et I04.'),
  [5, 5, 4, 3, 5, 5, 2, 3, 3, 4, 4, 4], T('Named in the case (E8); consolidated with S7 so card theft online is assessed once.', 'Nommé dans le cas (E8); regroupé avec S7 pour que le vol de cartes en ligne soit évalué une seule fois.'), ['PV', 'RG'], 'Medium', SECTOR, 'Consolidate', ['TH'])
C('C24', T('Content-management system vulnerability on the storefront', 'Vulnérabilité du système de gestion de contenu de la boutique'), T('Cybercriminal', 'Cybercriminel'), T('CMS plug-ins', 'Modules du système de gestion de contenu'), 'CJ1', T('Defacement, injection', 'Défiguration, injection'), '#45', MERGED('S7'),
  T('Same treatment (I08).', 'Même traitement (I08).'), [3, 4, 3, 3, 3, 2, 2, 2, 2, 3, 3, 2], T('Variant of S7.', 'Variante de S7.'), [], 'Low', NONE, 'Consolidate', ['GL'])
C('C25', T('Malicious advertisement displayed on the e-commerce platform', 'Publicité malveillante affichée sur la plateforme de commerce électronique'), T('Ad-network abuser', 'Utilisateur malveillant d’un réseau publicitaire'), T('Third-party ad content', 'Contenu publicitaire tiers'), 'CJ1',
  T('Customer infection', 'Infection de la clientèle'), '#21', MERGED('S7'), T('Third-party content path; same controls.', 'Voie du contenu tiers; mêmes mesures.'), [2, 3, 3, 2, 2, 2, 1, 2, 1, 2, 3, 2], T('Low consequence for CanaRetail directly.', 'Faible conséquence directe pour CanaRetail.'), [], 'Low', NONE, 'Consolidate', ['GL'])
C('C26', T('Inadequate firewall configuration exposes internal services', 'Configuration inadéquate du pare-feu exposant des services internes'), T('Opportunistic cybercriminal', 'Cybercriminel opportuniste'),
  T('Temporary rules never removed', 'Règles temporaires jamais retirées'), 'CJ6', T('Intrusion', 'Intrusion'), 'CR-S20 · #20', SEL('S8'), T('Supplied scenario.', 'Scénario fourni.'),
  [4, 4, 4, 4, 4, 2, 4, 2, 2, 4, 4, 3], T('Common misconfiguration path distinct from S4 (unpatched).', 'Voie de mauvaise configuration courante, distincte de S4 (non corrigé).'), ['PI'], 'Medium', ASSUME, 'Select', ['BU'])
C('C27', T('Remote code execution due to server misconfiguration', 'Exécution de code à distance due à une mauvaise configuration de serveur'), T('Cybercriminal', 'Cybercriminel'), T('Hardening baselines not evidenced', 'Bases de durcissement non démontrées'), 'CJ6',
  T('Server takeover', 'Prise de contrôle d’un serveur'), '#39', MERGED('S8'), T('Same treatment (I09, I05).', 'Même traitement (I09, I05).'), [3, 4, 3, 3, 4, 2, 3, 2, 2, 4, 3, 2], T('Variant of S8.', 'Variante de S8.'), [], 'Low', NONE, 'Consolidate', ['BU'])
C('C28', T('DNS hijacking redirects customers to malicious sites', 'Détournement DNS redirigeant la clientèle vers des sites malveillants'), T('Hacktivist / criminal', 'Hacktiviste / criminel'), T('Registrar without MFA or lock', 'Registraire sans AMF ni verrou'), 'CJ8 / CJ1',
  T('Credential and card capture, defacement', 'Capture d’identifiants et de cartes, défiguration'), 'CR-S26 · #26', SEL('S9'), T('Supplied scenario; links to the identity-based threat named by management (E1).', 'Scénario fourni; lié à la menace identitaire désignée par la direction (E1).'),
  [4, 4, 4, 3, 4, 3, 4, 3, 3, 5, 4, 4], T('Fast-moving and reputationally severe in the geopolitical context of E1.', 'Rapide et grave pour la réputation dans le contexte géopolitique d’E1.'), ['MU'], 'Medium', CASE, 'Select', ['TH', 'DP'])
C('C29', T('Domain hijacking through misconfigured DNS or registrar account', 'Détournement de domaine par un DNS ou un compte de registraire mal configuré'), T('Hacktivist / criminal', 'Hacktiviste / criminel'), T('Registrar contacts', 'Contacts du registraire'), 'CJ8',
  T('Loss of the domain', 'Perte du domaine'), '#49', MERGED('S9'), T('Same chain and treatment (I10).', 'Même chaîne et même traitement (I10).'), [4, 4, 3, 3, 4, 2, 4, 3, 2, 4, 4, 3], T('Variant of S9.', 'Variante de S9.'), [], 'Low', NONE, 'Consolidate', ['DP'])
C('C30', T('Over-privileged integration service account abused for bulk data extraction', 'Compte de service d’intégration surprivilégié détourné pour une extraction massive'), T('Cybercriminal data broker', 'Courtier de données cybercriminel'),
  T('Secret in pipelines, broad rights, no owner', 'Secret dans les chaînes, droits étendus, aucun responsable'), 'CJ4 / CJ3 / CJ7', T('Mass privacy breach', 'Atteinte massive à la vie privée'), T('Original (from #11, #22, #31, #37)', 'Original (d’après les nos 11, 22, 31 et 37)'), SEL('S10'),
  T('The original Module D scenario: the identity dimension the supplied nine leave out.', 'Le scénario original du module D : la dimension identitaire que les neuf scénarios fournis laissent de côté.'),
  [4, 5, 4, 4, 4, 5, 3, 3, 2, 4, 5, 5], T('Real-time integrations run on service accounts (E3); CI/CD in use (E2). Evidence 2: account practices are inferred.', 'Les intégrations en temps réel reposent sur des comptes de service (E3); la chaîne CI/CD est utilisée (E2). Preuve 2 : les pratiques de gestion des comptes sont déduites.'),
  ['PV', 'PI'], 'Medium', ASSUME, 'Select', ['BU', 'DP'])
C('C31', T('API vulnerabilities exploited to access back-end data', 'Vulnérabilités d’API exploitées pour accéder aux données en arrière-plan'), T('Cybercriminal', 'Cybercriminel'), T('Broken object-level authorization', 'Autorisation défaillante au niveau des objets'), 'CJ1 / CJ3',
  T('Data theft', 'Vol de données'), '#31', MERGED('S10'), T('Same integration surface and treatment (I08, I02).', 'Même surface d’intégration et même traitement (I08, I02).'), [4, 4, 4, 3, 4, 4, 2, 3, 2, 4, 4, 3], T('Variant of S10 through the API itself.', 'Variante de S10 par l’API elle-même.'), ['PV'], 'Low', NONE, 'Consolidate', ['BU'])
C('C32', T('Unauthorized access to the development environment and CI/CD secrets', 'Accès non autorisé à l’environnement de développement et aux secrets CI/CD'), T('Cybercriminal', 'Cybercriminel'), T('Secrets in variables', 'Secrets dans les variables'), 'CJ7',
  T('Code and secret theft', 'Vol de code et de secrets'), '#37', MERGED('S10'), T('Precondition of S10.', 'Condition préalable de S10.'), [3, 4, 3, 4, 3, 2, 2, 2, 2, 3, 4, 3], T('Stage of the S10 chain.', 'Étape de la chaîne de S10.'), [], 'Low', NONE, 'Consolidate', ['BU'])
C('C33', T('DDoS on the e-commerce platform during peak sale season', 'Déni de service distribué contre la plateforme de commerce électronique en période de pointe'), T('Hacktivist / extortionist', 'Hacktiviste / extorqueur'),
  T('DDoS protection beyond CDN not evidenced', 'Protection contre le déni de service au-delà des réseaux de diffusion non démontrée'), 'CJ1', T('Online sales unavailable', 'Ventes en ligne indisponibles'), '#4', NOTSEL,
  T('Strong candidate; left out because the CDN absorbs volumetric attacks and outages above 24 h are unlikely. Watch list.', 'Candidat solide; écarté parce que les réseaux de diffusion absorbent les attaques volumétriques et qu’une panne de plus de 24 h est peu probable. Liste de surveillance.'),
  [4, 4, 4, 3, 3, 1, 4, 3, 3, 5, 3, 4], T('Named by management for the geopolitical context (E1); availability limit of 24 h (E6). CDNs in place (E2).', 'Désigné par la direction pour le contexte géopolitique (E1); limite de disponibilité de 24 h (E6). Réseaux de diffusion en place (E2).'),
  ['ES'], 'Medium', CASE, 'Consider', ['TH'], T('Watch list — explicit management review', 'Liste de surveillance — examen explicite par la direction'), WATCH_REVIEW)
C('C34', T('Credential stuffing against customer accounts', 'Bourrage d’identifiants contre les comptes clients'), T('Fraud group', 'Groupe de fraude'), T('No bot protection evidenced', 'Aucune protection contre les robots démontrée'), T('Customer accounts', 'Comptes clients'),
  T('Loyalty-point and gift-card fraud', 'Fraude aux points de fidélité et aux cartes-cadeaux'), '#19', NOTSEL, T('Frequent but bounded fraud; WAF rate limiting in I08 helps.', 'Fraude fréquente, mais limitée; la limitation du débit du pare-feu applicatif Web de I08 aide.'),
  [3, 3, 5, 3, 3, 3, 1, 2, 3, 4, 3, 3], T('Named in the case (E8); consequence bounded per account.', 'Nommé dans le cas (E8); conséquence limitée par compte.'), [], 'Medium', SECTOR, 'Defer', ['TH'], T('Watch list', 'Liste de surveillance'))
C('C35', T('Attack on a third-party payment processor', 'Attaque contre un processeur de paiement tiers'), T('Supply-chain attacker', 'Attaquant de la chaîne d’approvisionnement'), T('Concentration on few processors', 'Concentration sur quelques processeurs'), T('Payments', 'Paiements'),
  T('Payment outage or card compromise outside CanaRetail', 'Panne des paiements ou compromission de cartes hors de CanaRetail'), '#24', NOTSEL, T('Outside CanaRetail’s control; contractual and continuity treatment.', 'Hors du contrôle de CanaRetail; traitement contractuel et de continuité.'),
  [4, 4, 3, 2, 4, 3, 4, 5, 2, 3, 3, 3], T('High concentration, low controllability; continuity plan (manual or alternate processor) is the lever.', 'Forte concentration, faible maîtrise; le plan de continuité (manuel ou processeur de rechange) est le levier.'),
  ['SC', 'ES'], 'Low', NONE, 'Consider', ['DP'], T('Watch list — explicit management review', 'Liste de surveillance — examen explicite par la direction'), WATCH_REVIEW)
C('C36', T('Compromised software or plug-in update (supply chain)', 'Mise à jour de logiciel ou de module compromise (chaîne d’approvisionnement)'), T('Supply-chain actor', 'Acteur de la chaîne d’approvisionnement'), T('Automatic updates, no supplier assurance', 'Mises à jour automatiques, aucune assurance des fournisseurs'), T('Many hosts', 'De nombreux hôtes'),
  T('Enterprise foothold', 'Point d’appui dans l’entreprise'), '#23, #34', NOTSEL, T('Rare but enterprise-wide; prevention largely in suppliers’ hands.', 'Rare, mais touchant toute l’entreprise; prévention surtout entre les mains des fournisseurs.'),
  [3, 4, 3, 2, 4, 2, 3, 5, 2, 3, 4, 3], T('Case cites SolarWinds (E8); detection and segmentation in I03 and I09 limit spread.', 'Le cas cite SolarWinds (E8); la détection et la segmentation de I03 et I09 limitent la propagation.'),
  ['SC', 'MU'], 'Low', NONE, 'Consider', ['TH', 'DP'], T('Watch list — explicit management review', 'Liste de surveillance — examen explicite par la direction'), WATCH_REVIEW)
C('C37', T('Store IoT devices (smart shelves, cameras, lighting) hijacked', 'Appareils IdO des magasins (tablettes intelligentes, caméras, éclairage) détournés'), T('Botnet operator', 'Exploitant de réseau de zombies'), T('IoT on store networks', 'IdO sur les réseaux des magasins'), T('Store IoT', 'IdO des magasins'),
  T('Botnet participation, foothold', 'Participation à un réseau de zombies, point d’appui'), '#9, #47', NOTSEL, T('Low consequence once segmented (I09).', 'Faible conséquence une fois segmenté (I09).'),
  [2, 2, 3, 4, 2, 1, 2, 2, 2, 2, 3, 2], T('Present in all stores (E2); treated by segmentation.', 'Présent dans tous les magasins (E2); traité par la segmentation.'), [], 'Medium', CASE, 'Defer', ['BU'], T('Standard control (segmentation)', 'Mesure standard (segmentation)'))
C('C38', T('Social engineering of customer support', 'Ingénierie sociale visant le service à la clientèle'), T('Fraudster', 'Fraudeur'), T('Weak caller verification', 'Vérification faible des appelants'), T('Customer accounts', 'Comptes clients'),
  T('Account takeover, refund fraud', 'Prise de contrôle de comptes, fraude aux remboursements'), '#14', NOTSEL, T('Bounded fraud; process control.', 'Fraude limitée; mesure de processus.'),
  [2, 2, 4, 3, 2, 2, 1, 1, 2, 3, 3, 2], T('Process fix; low enterprise consequence.', 'Correction de processus; faible conséquence pour l’entreprise.'), [], 'Medium', NONE, 'Defer', ['GL'], T('Standard control (verification procedure)', 'Mesure standard (procédure de vérification)'))
C('C39', T('Stolen or lost devices without encryption or remote wipe', 'Appareils volés ou perdus sans chiffrement ni effacement à distance'), T('Opportunistic thief', 'Voleur opportuniste'), T('MDM coverage unknown', 'Couverture de la gestion des appareils mobiles inconnue'), T('Mobile devices', 'Appareils mobiles'),
  T('Limited data exposure', 'Exposition limitée de données'), '#48', NOTSEL, T('MDM in place (E2); standard control.', 'Gestion des appareils mobiles en place (E2); mesure standard.'),
  [2, 2, 4, 2, 2, 3, 1, 1, 3, 2, 2, 2], T('Near-certain occurrence, small consequence.', 'Occurrence quasi certaine, faible conséquence.'), [], 'Medium', CASE, 'Defer', ['GL'], T('Standard control (MDM)', 'Mesure standard (gestion des appareils mobiles)'))
C('C40', T('Physical breach leading to server-room access', 'Intrusion physique menant à la salle des serveurs'), T('Intruder', 'Intrus'), T('Physical controls not described', 'Mesures physiques non décrites'), 'CJ6',
  T('Theft, tampering', 'Vol, altération'), '#18', NOTSEL, T('Physical security out of scope.', 'Sécurité physique hors du périmètre.'),
  [3, 3, 2, 2, 3, 2, 3, 2, 1, 2, 2, 2], T('Out of scope for this assessment.', 'Hors du périmètre de cette évaluation.'), [], 'High', NONE, 'Defer', ['GL'], T('Out of scope (physical)', 'Hors périmètre (physique)'))


def F(fid, name, statement, members, rationale, coverage, why, scen, judgment=T('', '')):
    return {'id': fid, 'name': name, 'statement': statement, 'members': members, 'selected': True, 'rationale': rationale,
            'judgment': judgment, 'coverage': coverage, 'why': why, 'scenarios': scen}


FAMILIES = [
    F('P01', T('Ransomware and destructive attack on the data centre and ERP', 'Rançongiciel et attaque destructrice contre le centre de données et le PGI'),
      T('A ransomware affiliate enters through phishing or an exposed service, escalates, moves laterally and destroys recoverability before encrypting SAP and the data centre.', 'Un affilié de rançongiciel entre par hameçonnage ou un service exposé, élève ses privilèges, se déplace latéralement et détruit la capacité de reprise avant de chiffrer SAP et le centre de données.'),
      ['C01', 'C02', 'C03', 'C04', 'C05', 'C06'], T('Highest operational consequence; variants (backup attack, fileless execution, lateral movement, phishing, logging gaps) consolidated as stages of one chain.', 'Conséquence opérationnelle la plus élevée; variantes (attaque des sauvegardes, exécution sans fichier, déplacement latéral, hameçonnage, lacunes de journalisation) regroupées comme étapes d’une même chaîne.'),
      ['Integrity', 'Availability', 'Ransomware / destructive', 'Resilience / DR', 'Endpoint', 'Infrastructure / network'],
      [T('Retail is a sustained ransomware target and SAP runs every channel.', 'Le commerce de détail est une cible constante et SAP fait fonctionner tous les canaux.'), T('Rising attempts (E1); recovery untested (E2).', 'Tentatives en hausse (E1); reprise non testée (E2).'),
       T('CJ3, CJ6; peak-season revenue.', 'CJ3, CJ6; revenus de la saison de pointe.'), T('Segmentation and backup isolation not evidenced.', 'Segmentation et isolement des sauvegardes non démontrés.'),
       T('Multi-day outage beyond the 24-hour online limit.', 'Panne de plusieurs jours dépassant la limite de 24 heures en ligne.'), T('Highest score under every scheme.', 'Score le plus élevé selon chaque pondération.')], ['S1']),
    F('P02', T('Insider misuse of privileged access', 'Utilisation abusive d’accès privilégiés par un initié'),
      T('A current or former employee with privileged access exfiltrates or alters data because privileges are standing and exports are not monitored.', 'Un employé actuel ou ancien disposant d’accès privilégiés exfiltre ou modifie des données parce que les privilèges sont permanents et que les exportations ne sont pas surveillées.'),
      ['C07', 'C08', 'C09'], T('Insider variants share owner (Cybersecurity with HR) and treatment (PAM, DLP).', 'Les variantes d’initié partagent un responsable (cybersécurité avec RH) et un traitement (GAP, DLP).'),
      ['Confidentiality', 'Insider', 'Identity & privileged access', 'Data protection / privacy'],
      [T('Small IT team with broad rights (E4).', 'Petite équipe des TI aux droits étendus (E4).'), T('Audit universe names privileged and former-employee access (E7).', 'L’univers d’audit nomme les accès privilégiés et ceux des anciens employés (E7).'),
       T('CJ4 loyalty data, CJ3 pricing.', 'CJ4 données de fidélisation, CJ3 prix.'), T('Standing privileges, no export alerting.', 'Privilèges permanents, aucune alerte d’exportation.'),
       T('Reportable breach and loss of trade secrets.', 'Atteinte à déclarer et perte de secrets commerciaux.'), T('Supplied scenario; distinct actor and controls.', 'Scénario fourni; acteur et mesures distincts.')], ['S2']),
    F('P03', T('Card-data theft from store POS', 'Vol de données de cartes dans les PDV des magasins'),
      T('A card-fraud group reaches POS terminals through vendor remote access or a store foothold and scrapes card data in memory.', 'Un groupe de fraude par carte atteint les terminaux PDV par l’accès à distance du fournisseur ou un point d’appui en magasin et lit les données de cartes en mémoire.'),
      ['C10', 'C11', 'C12'], T('Payment security is the case’s central theme; store entry paths consolidated.', 'La sécurité des paiements est le thème central du cas; les voies d’entrée en magasin sont regroupées.'),
      ['Confidentiality', 'Third-party / supply chain', 'Endpoint', 'Data protection / privacy', 'Fraud / BEC'],
      [T('Card payment in 100 stores.', 'Paiement par carte dans 100 magasins.'), T('Named sector attack (E8); POS security an audit area (E7).', 'Attaque sectorielle nommée (E8); la sécurité des PDV est un domaine d’audit (E7).'),
       T('CJ2.', 'CJ2.'), T('Vendor access, P2PE unknown.', 'Accès du fournisseur, P2PE inconnu.'), T('PCI fines, reissue, brand damage.', 'Amendes PCI, réémission, atteinte à la marque.'), T('Very low appetite for payment risk (E6).', 'Très faible appétence pour le risque lié aux paiements (E6).')], ['S3']),
    F('P04', T('Exploitation of unpatched internet-facing systems', 'Exploitation de systèmes exposés à Internet et non corrigés'),
      T('An access broker exploits a known-exploited flaw on an edge device before it is patched and sells or uses the access.', 'Un courtier d’accès exploite une faille activement exploitée d’un équipement de périphérie avant sa correction et vend ou utilise l’accès.'),
      ['C13', 'C14', 'C15', 'C16'], T('Leading entry vector; internal and endpoint variants consolidated under one vulnerability programme.', 'Vecteur d’entrée majeur; variantes internes et sur les postes regroupées dans un même programme de gestion des vulnérabilités.'),
      ['Infrastructure / network', 'Identity & privileged access', 'Integrity'],
      [T('VPN and edge devices are exposed by design.', 'Le RPV et les équipements de périphérie sont exposés par conception.'), T('Library prompts (E9); patch duty in infrastructure (E4).', 'Amorces de la bibliothèque (E9); correction confiée à l’infrastructure (E4).'),
       T('CJ5, CJ6.', 'CJ5, CJ6.'), T('Patch windows tied to stores; no EASM.', 'Fenêtres de correctifs liées aux magasins; aucune surveillance externe.'), T('Intrusion and ransomware precursor.', 'Intrusion et précurseur de rançongiciel.'), T('Fast velocity; supplied scenario.', 'Vitesse élevée; scénario fourni.')], ['S4']),
    F('P05', T('Cloud storage and permission misconfiguration exposing customer data', 'Mauvaise configuration du stockage infonuagique et des permissions exposant des données clients'),
      T('Customer data in cloud storage or shares becomes readable by outsiders through a configuration error and is downloaded.', 'Des données clients dans le stockage infonuagique ou des partages deviennent lisibles de l’extérieur à cause d’une erreur de configuration et sont téléchargées.'),
      ['C17', 'C18'], T('Same treatment (posture management, logging, DLP).', 'Même traitement (gestion de la posture, journalisation, DLP).'),
      ['Confidentiality', 'Cloud & SaaS', 'Data protection / privacy'],
      [T('AWS and Azure host analytics and development (E2).', 'AWS et Azure hébergent l’analytique et le développement (E2).'), T('Cloud configuration audit area (E7).', 'Domaine d’audit de la configuration infonuagique (E7).'),
       T('CJ7, CJ4.', 'CJ7, CJ4.'), T('No public-access block or object logging.', 'Aucun blocage de l’accès public ni journalisation des objets.'), T('Reportable breach of unknown scope.', 'Atteinte à déclarer d’ampleur inconnue.'), T('Supplied scenario; cheap to treat.', 'Scénario fourni; peu coûteux à traiter.')], ['S5']),
    F('P06', T('Weak cryptography and key management', 'Cryptographie et gestion des clés déficientes'),
      T('Stolen data is decrypted, or traffic intercepted, because algorithms are deprecated and keys are poorly managed.', 'Des données volées sont déchiffrées, ou du trafic intercepté, parce que les algorithmes sont dépréciés et les clés mal gérées.'),
      ['C19', 'C20', 'C21'], T('Tests the encryption the case relies on; crypto variants consolidated.', 'Met à l’épreuve le chiffrement sur lequel le cas s’appuie; variantes cryptographiques regroupées.'),
      ['Confidentiality', 'Data protection / privacy'],
      [T('The case claims encryption at rest and in transit (E2).', 'Le cas affirme le chiffrement au repos et en transit (E2).'), T('Library prompts only (E9) — weak evidence.', 'Amorces de la bibliothèque seulement (E9) — preuve faible.'),
       T('CJ1, CJ4.', 'CJ1, CJ4.'), T('Algorithms and key custody unknown.', 'Algorithmes et garde des clés inconnus.'), T('PCI and privacy consequences.', 'Conséquences PCI et sur la vie privée.'), T('Supplied scenario; decision on crypto investment.', 'Scénario fourni; décision sur l’investissement cryptographique.')], ['S6'],
      T('Selected by judgment: weak evidence and low velocity keep it just outside the top ten under every scheme, but it is a supplied scenario and tests a control the case relies on.', 'Retenu par jugement : la faiblesse de la preuve et la faible vitesse le placent juste hors des dix premiers selon chaque pondération, mais c’est un scénario fourni et il met à l’épreuve une mesure sur laquelle le cas s’appuie.')),
    F('P07', T('E-commerce web application compromise and online skimming', 'Compromission de l’application Web de commerce électronique et écrémage en ligne'),
      T('An attacker exploits a web-application flaw or third-party script to read customer data and skim cards at checkout.', 'Un attaquant exploite une faille de l’application Web ou un script tiers pour lire les données clients et écrémer les cartes au paiement.'),
      ['C22', 'C23', 'C24', 'C25'], T('Online card theft assessed once; injection, skimming, CMS and malvertising consolidated.', 'Vol de cartes en ligne évalué une seule fois; injection, écrémage, système de gestion de contenu et publicité malveillante regroupés.'),
      ['Confidentiality', 'Integrity', 'Application / API', 'Fraud / BEC', 'Data protection / privacy'],
      [T('E-commerce is a primary channel (E3).', 'Le commerce électronique est un canal principal (E3).'), T('E-skimming and SQL injection named (E8, E9).', 'Écrémage en ligne et injection SQL nommés (E8, E9).'),
       T('CJ1, CJ4.', 'CJ1, CJ4.'), T('No SAST/DAST or WAF evidenced.', 'Aucun SAST/DAST ni pare-feu applicatif Web démontré.'), T('Card theft, fines, downtime.', 'Vol de cartes, amendes, interruption.'), T('Supplied scenario; high impact.', 'Scénario fourni; impact élevé.')], ['S7']),
    F('P08', T('Perimeter and server misconfiguration', 'Mauvaise configuration du périmètre et des serveurs'),
      T('A firewall or server misconfiguration exposes a management service that an attacker uses to enter.', 'Une mauvaise configuration du pare-feu ou d’un serveur expose un service de gestion qu’un attaquant utilise pour entrer.'),
      ['C26', 'C27'], T('Configuration path distinct from patching; same governance treatment.', 'Voie de configuration distincte de la correction; même traitement de gouvernance.'),
      ['Infrastructure / network', 'Availability'],
      [T('Changes for store rollouts are frequent.', 'Les changements liés aux déploiements en magasin sont fréquents.'), T('Library prompts (E9); IDS stated (E2).', 'Amorces de la bibliothèque (E9); IDS déclaré (E2).'),
       T('CJ6, CJ3.', 'CJ6, CJ3.'), T('Rule review and post-change verification not evidenced.', 'Revue des règles et vérification après changement non démontrées.'), T('Intrusion into the data centre.', 'Intrusion dans le centre de données.'), T('Supplied scenario.', 'Scénario fourni.')], ['S8']),
    F('P09', T('Domain and DNS hijacking', 'Détournement de domaine et de DNS'),
      T('An attacker takes over the registrar account or DNS and redirects customers to a malicious copy of the store.', 'Un attaquant prend le contrôle du compte auprès du registraire ou du DNS et redirige la clientèle vers une copie malveillante de la boutique.'),
      ['C28', 'C29'], T('Fast, reputationally severe; linked to the identity-based targeting named by management.', 'Rapide et grave pour la réputation; lié au ciblage identitaire désigné par la direction.'),
      ['Integrity', 'Availability', 'Third-party / supply chain', 'Fraud / BEC'],
      [T('Management names impersonation and defacement (E1).', 'La direction nomme l’usurpation et la défiguration (E1).'), T('Library prompts (E9).', 'Amorces de la bibliothèque (E9).'),
       T('CJ8, CJ1.', 'CJ8, CJ1.'), T('Registrar protection unknown.', 'Protection auprès du registraire inconnue.'), T('Customer harm and political defacement.', 'Préjudice à la clientèle et défiguration politique.'), T('Supplied scenario; high velocity.', 'Scénario fourni; vitesse élevée.')], ['S9']),
    F('P10', T('Machine-identity and integration abuse', 'Abus d’identités machines et d’intégrations'),
      T('An attacker steals or abuses service-account secrets, APIs or development access to extract data through legitimate integrations.', 'Un attaquant vole ou détourne des secrets de comptes de service, des API ou des accès de développement pour extraire des données par des intégrations légitimes.'),
      ['C30', 'C31', 'C32'], T('The original scenario of Module D: covers identities that are not people, which no supplied scenario does.', 'Le scénario original du module D : il couvre les identités qui ne sont pas des personnes, ce qu’aucun scénario fourni ne fait.'),
      ['Confidentiality', 'Identity & privileged access', 'Application / API', 'Cloud & SaaS', 'Data protection / privacy'],
      [T('Real-time SAP integrations with e-commerce and POS (E3).', 'Intégrations SAP en temps réel avec le commerce électronique et les PDV (E3).'), T('CI/CD and sandboxes (E2); API and CI/CD audit area (E7).', 'CI/CD et bacs à sable (E2); domaine d’audit des API et de CI/CD (E7).'),
       T('CJ4, CJ3, CJ7, CJ5.', 'CJ4, CJ3, CJ7, CJ5.'), T('Secrets in pipelines, broad rights, no owner.', 'Secrets dans les chaînes, droits étendus, aucun responsable.'), T('Mass privacy breach that looks like normal traffic.', 'Atteinte massive à la vie privée qui ressemble à du trafic normal.'),
       T('Highest decision usefulness; fills the identity gap of the supplied nine.', 'Utilité décisionnelle la plus élevée; comble la lacune identitaire des neuf scénarios fournis.')], ['S10']),
]

WATCH = [
    {'id': 'C33', 'trigger': T('Promote if a DDoS campaign targets Canadian retailers or CanaRetail, if the CDN contract lacks DDoS mitigation, or if an outage approaches the 24-hour limit.', 'Promouvoir si une campagne de déni de service vise des détaillants canadiens ou CanaRetail, si le contrat des réseaux de diffusion ne prévoit pas d’atténuation du déni de service, ou si une panne approche la limite de 24 heures.'),
     'owner': T('Director of Network', 'Directeur du réseau')},
    {'id': 'C35', 'trigger': T('Promote if a processor has an incident or if CanaRetail depends on a single processor for online payments. Continuity and contracts are the levers; management should confirm this reliance.', 'Promouvoir si un processeur subit un incident ou si CanaRetail dépend d’un seul processeur pour les paiements en ligne. La continuité et les contrats sont les leviers; la direction devrait confirmer cette dépendance.'),
     'owner': T('CFO (payments)', 'Chef des finances (paiements)')},
    {'id': 'C36', 'trigger': T('Promote if a supplier of POS, SAP add-ons or e-commerce plug-ins is compromised in the sector.', 'Promouvoir si un fournisseur de PDV, de modules SAP ou de modules de commerce électronique est compromis dans le secteur.'),
     'owner': T('Director of Cybersecurity', 'Directeur de la cybersécurité')},
    {'id': 'C34', 'trigger': T('Promote if loyalty-point fraud exceeds the fraud budget or bot traffic rises on login pages.', 'Promouvoir si la fraude aux points de fidélité dépasse le budget de fraude ou si le trafic de robots augmente sur les pages de connexion.'),
     'owner': T('Director of Application Management', 'Directeur de la gestion des applications')},
]

PLAN = [
    {'activity': T('Confirm the payment architecture (P2PE, tokenization, stored card data) with the acquiring bank', 'Confirmer l’architecture de paiement (P2PE, jetonisation, données de cartes stockées) avec la banque acquéreuse'), 'scenarios': 'P03, P06, P07', 'owner': T('CFO (payments)', 'Chef des finances (paiements)'), 'due': T('30 days', '30 jours')},
    {'activity': T('Inventory privileged and service accounts, with owners and secret storage', 'Inventorier les comptes privilégiés et de service, avec leurs responsables et le stockage des secrets'), 'scenarios': 'P02, P10', 'owner': T('Director of Cybersecurity', 'Directeur de la cybersécurité'), 'due': T('30 days', '30 jours')},
    {'activity': T('Run a ransomware restore test of SAP and record RTO/RPO achieved', 'Effectuer un essai de restauration de SAP après rançongiciel et consigner les RTO/RPO atteints'), 'scenarios': 'P01', 'owner': T('Director of IT Infrastructure', 'Directeur de l’infrastructure TI'), 'due': T('60 days', '60 jours')},
    {'activity': T('External attack-surface scan and firewall rule review', 'Balayage externe de la surface d’attaque et revue des règles de pare-feu'), 'scenarios': 'P04, P08', 'owner': T('Director of Network', 'Directeur du réseau'), 'due': T('30 days', '30 jours')},
    {'activity': T('Cloud posture baseline of AWS and Azure (public storage, logging)', 'Portrait de la posture infonuagique d’AWS et d’Azure (stockage public, journalisation)'), 'scenarios': 'P05, P10', 'owner': T('DevOps lead', 'Chef DevOps'), 'due': T('30 days', '30 jours')},
    {'activity': T('Check registrar MFA, registry lock and DNSSEC status', 'Vérifier l’AMF, le verrou de registre et l’état de DNSSEC chez le registraire'), 'scenarios': 'P09', 'owner': T('Director of Network', 'Directeur du réseau'), 'due': T('Immediate', 'Immédiat')},
    {'activity': T('Cryptographic inventory of sensitive data stores', 'Inventaire cryptographique des dépôts de données sensibles'), 'scenarios': 'P06', 'owner': T('Director of Application Management', 'Directeur de la gestion des applications'), 'due': T('90 days', '90 jours')},
]
