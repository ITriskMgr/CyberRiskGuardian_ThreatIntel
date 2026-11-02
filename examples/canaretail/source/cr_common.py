# SPDX-License-Identifier: CC-BY-NC-4.0
# Copyright (c) 2026 Marc-André Léger
"""CanaRetail teaching case — shared helpers and the context part (profile, evidence, crown jewels, budget).

Every text is a pair (English, French); numbers are written once, so the two workspaces agree by construction.
All values are teaching-case values: plausible, internally consistent, justified, and labelled with the
standard markers where they are estimated. Fictional case (CanaRetail Business Case v2.0c, student version)."""

EST = ('Analytical estimate — validation required', 'Estimation analytique — validation requise')
GAP = ('Information gap — organizational validation required', 'Lacune d’information — validation organisationnelle requise')
MGMT = ('Management decision required', 'Décision de la direction requise')


def T(en, fr):
    """A bilingual text."""
    return (en, fr)


def cat(*parts):
    """Join bilingual and plain parts into one bilingual text."""
    en = ''.join(p[0] if isinstance(p, tuple) else p for p in parts)
    fr = ''.join(p[1] if isinstance(p, tuple) else p for p in parts)
    return (en, fr)


def pick(o, i):
    """The tree in one language: i = 0 English, 1 French."""
    if isinstance(o, tuple):
        return o[i]
    if isinstance(o, list):
        return [pick(x, i) for x in o]
    if isinstance(o, dict):
        return {k: pick(v, i) for k, v in o.items()}
    return o


ORG = {
    'name': T('CanaRetail (fictional)', 'CanaRetail (fictif)'),
    'context': T('Pan-Canadian retail chain headquartered in Montreal: 100 stores operating as Maison Helenas and a national e-commerce platform (click-and-collect and home delivery). Hybrid IT: Montreal data centre, AWS and Azure, SAP S/4HANA ERP integrated with POS and e-commerce (E1, E2, E3).',
                 'Chaîne de magasins pancanadienne dont le siège est à Montréal : 100 magasins exploités sous le nom Maison Helenas et une plateforme nationale de commerce électronique (cueillette en magasin et livraison à domicile). TI hybrides : centre de données de Montréal, AWS et Azure, PGI SAP S/4HANA intégré aux points de vente et au commerce électronique (E1, E2, E3).'),
    'sector': T('Retail — national multi-channel chain', 'Commerce de détail — chaîne nationale multicanale'),
    'size': T('Large', 'Grande'),
    'employees': T('Information gap — organizational validation required (total headcount not stated; 62 IT staff, E4)',
                   'Lacune d’information — validation organisationnelle requise (effectif total non précisé; 62 employés en TI, E4)'),
    'region': T('Canada (all provinces and the territories); headquarters in Montreal, Quebec', 'Canada (toutes les provinces et les territoires); siège social à Montréal (Québec)'),
    'mission': T('Sell apparel, electronics and home goods through 100 stores and a national online platform, with ethical sourcing, a loyalty programme and customer trust at the centre of the brand (E1).',
                 'Vendre des vêtements, de l’électronique et des articles pour la maison dans 100 magasins et sur une plateforme nationale en ligne, en plaçant l’approvisionnement éthique, le programme de fidélisation et la confiance de la clientèle au cœur de la marque (E1).'),
    'services': T('In-store sales on POS terminals; online sales with card, e-wallet and cryptocurrency payment; click-and-collect (BOPIS) and home delivery; loyalty programme; AI personalization (E2).',
                  'Ventes en magasin sur terminaux de point de vente (PDV); ventes en ligne par carte, portefeuille électronique et cryptomonnaie; cueillette en magasin et livraison à domicile; programme de fidélisation; personnalisation par IA (E2).'),
    'processes': T('Payment processing (stores and online); order-to-delivery and click-and-collect; merchandising, pricing and promotions; replenishment and distribution-centre logistics; financial accounting and daily cash reconciliation; payroll and seasonal hiring (E3).',
                   'Traitement des paiements (magasins et en ligne); de la commande à la livraison et cueillette en magasin; marchandisage, prix et promotions; réapprovisionnement et logistique des centres de distribution; comptabilité financière et rapprochement quotidien de l’encaisse; paie et embauche saisonnière (E3).'),
    'systems': T('SAP S/4HANA 2025 (Article Master, MM, CAR, F&R, EWM, SD, FI/CO, SuccessFactors); POS terminals in 100 stores; e-commerce portal with CDNs and payment gateways; SAP CRM and loyalty; Microsoft Server 2022, SAN/NAS, virtualization; Microsoft Teams, e-mail, VoIP; MDM; store IoT (smart shelves, cameras, NFC tags) (E2, E3).',
                 'SAP S/4HANA 2025 (fiche article, MM, CAR, F&R, EWM, SD, FI/CO, SuccessFactors); terminaux PDV dans 100 magasins; portail de commerce électronique avec réseaux de diffusion de contenu et passerelles de paiement; SAP CRM et fidélisation; Microsoft Server 2022, SAN/NAS, virtualisation; Microsoft Teams, courriel, VoIP; gestion des appareils mobiles; IdO en magasin (tablettes intelligentes, caméras, étiquettes NFC) (E2, E3).'),
    'cloud': T('AWS and Microsoft Azure (IaaS for peak demand, PaaS for development, disaster recovery and backups); CI/CD pipelines and virtual sandboxes (E2).',
               'AWS et Microsoft Azure (IaaS pour les pointes de demande, PaaS pour le développement, la reprise après sinistre et les sauvegardes); chaînes CI/CD et bacs à sable virtuels (E2).'),
    'suppliers': T('Payment processors and acquiring bank; CDN providers; AWS and Microsoft; SAP; CGI Inc. (recovery sites in Saguenay, Vancouver and Ottawa); POS, logistics and IoT vendors; John Molson School of Business co-op partnership (E2, E4).',
                   'Processeurs de paiement et banque acquéreuse; fournisseurs de réseaux de diffusion de contenu; AWS et Microsoft; SAP; CGI inc. (sites de relève à Saguenay, Vancouver et Ottawa); fournisseurs de PDV, de logistique et d’IdO; partenariat d’enseignement coopératif avec l’École de gestion John-Molson (E2, E4).'),
    'regulations': [T('PIPEDA (federal private-sector privacy law)', 'LPRPDE (loi fédérale sur la protection des renseignements personnels dans le secteur privé)'),
                    T('Quebec Law 25 (Act respecting the protection of personal information in the private sector) — headquarters and Quebec customers; counsel to confirm',
                      'Loi 25 du Québec (Loi sur la protection des renseignements personnels dans le secteur privé) — siège social et clientèle québécoise; à confirmer par les conseillers juridiques'),
                    T('PCI DSS v4.0.1 and card-brand rules (contractual, through the acquiring bank)', 'PCI DSS v4.0.1 et règles des réseaux de cartes (contractuelles, par la banque acquéreuse)'),
                    T('Provincial consumer-protection laws (where relevant)', 'Lois provinciales sur la protection du consommateur (s’il y a lieu)')],
    'sensitive': T('Cardholder data in transit through POS and e-commerce; loyalty and CRM profiles (identity, contact, purchase history); employee HR and payroll data (SuccessFactors); supplier contracts and pricing; financial results before publication (E2, E3).',
                   'Données de titulaires de carte en transit dans les PDV et le commerce électronique; profils de fidélisation et CRM (identité, coordonnées, historique d’achats); données RH et de paie des employés (SuccessFactors); contrats et prix des fournisseurs; résultats financiers avant leur publication (E2, E3).'),
    'availability': T('Online sales outage must not exceed 24 hours (appetite statement, E6); stores need POS and payment authorization during opening hours; peak seasons (Black Friday, December) raise the cost of any outage.',
                      'Une panne des ventes en ligne ne doit pas dépasser 24 heures (énoncé d’appétence, E6); les magasins ont besoin des PDV et de l’autorisation des paiements pendant les heures d’ouverture; les périodes de pointe (Vendredi fou, décembre) augmentent le coût de toute panne.'),
    'maturity': T('Stated controls: firewalls and IDS, antimalware on all endpoints and POS, encryption in transit and at rest, zero-trust architecture, behavioural analytics, MFA on the ERP, MDM, yearly disaster-recovery drills, separate development and test environment; in-house SOC with 10 analysts (levels 1–3). Effectiveness not evidenced — Information gap — organizational validation required.',
                  'Mesures déclarées : pare-feu et IDS, antimaliciel sur tous les postes et PDV, chiffrement en transit et au repos, architecture à vérification systématique (zéro confiance), analyse comportementale, AMF sur le PGI, gestion des appareils mobiles, exercices annuels de reprise, environnement de développement et d’essai distinct; centre des opérations de sécurité interne de 10 analystes (niveaux 1 à 3). Efficacité non démontrée — Lacune d’information — validation organisationnelle requise.'),
    'incidents': T('Marked increase in attack attempts on the retail sector since 2020; CanaRetail repelled the attempts so far, no confirmed breach (E1). Management treats ideologically motivated activity (DDoS, defacement, impersonation, phishing) as part of the threat landscape because the founders’ heritage is publicly known (E1).',
                   'Hausse marquée des tentatives d’attaque contre le commerce de détail depuis 2020; CanaRetail les a repoussées jusqu’ici, aucune atteinte confirmée (E1). La direction intègre l’activité à motivation idéologique (déni de service, défiguration, usurpation, hameçonnage) à son paysage de menaces parce que l’héritage des fondateurs est connu du public (E1).'),
    'controls': T('See maturity. Board-level reporting, incident-response and restore testing are not evidenced in the case.',
                  'Voir la maturité. Les rapports au conseil, les essais de réponse aux incidents et de restauration ne sont pas démontrés dans le cas.'),
    'notes': T('Source: CanaRetail business case v2.0c, student version (fictional teaching case). All figures are illustrative teaching values.',
               'Source : cas d’affaires CanaRetail v2.0c, version étudiante (cas pédagogique fictif). Tous les chiffres sont des valeurs pédagogiques illustratives.'),
    'materiality': T('Any exposure of cardholder data; any exposure of loyalty or CRM data for many customers; online sales unavailable beyond 24 hours; POS unavailable in several stores during opening hours; a single-event loss above 5% of quarterly revenue (E6). Analytical estimate — validation required.',
                     'Toute exposition de données de titulaires de carte; toute exposition de données de fidélisation ou CRM touchant de nombreux clients; ventes en ligne indisponibles plus de 24 heures; PDV indisponibles dans plusieurs magasins pendant les heures d’ouverture; une perte de plus de 5 % du chiffre d’affaires trimestriel pour un seul événement (E6). Estimation analytique — validation requise.'),
}

APPETITE_RATIONALE = T(
    'CanaRetail’s published statement sets an overall appetite of 0.5 (risk neutral), with low appetite for data breaches and reputational damage and very low appetite for privacy and payment non-compliance (E6). The assessment uses 0.5 as the case states it. The very low appetite for payment and privacy risk argues for a lower value on scenarios involving cardholder or loyalty data; the case invites that challenge. Analytical estimate — validation required.',
    'L’énoncé publié de CanaRetail fixe une appétence globale de 0,5 (neutre à l’égard du risque), avec une appétence faible pour les atteintes aux données et l’atteinte à la réputation et très faible pour la non-conformité en matière de vie privée et de paiement (E6). L’évaluation retient 0,5, comme le cas l’énonce. La très faible appétence pour le risque lié aux paiements et à la vie privée plaide pour une valeur plus basse dans les scénarios touchant les données de cartes ou de fidélisation; le cas invite à cette remise en question. Estimation analytique — validation requise.')

# The case's IT budget table (E5); baseline = the run cost already committed in the allocation (estimate).
BUDGET_YEARS = [
    {'year': 2026, 'it_budget': 150000000, 'spend': 10500000, 'actual': None, 'baseline': 7000000,
     'note': T('Case table: 7.0% of the IT budget. Baseline (run cost) is an analytical estimate — validation required.',
               'Tableau du cas : 7,0 % du budget des TI. Le coût de fonctionnement de base est une estimation analytique — validation requise.')},
    {'year': 2027, 'it_budget': 165000000, 'spend': 13200000, 'actual': None, 'baseline': 7500000,
     'note': T('Case table, planned: 8.0%.', 'Tableau du cas, prévu : 8,0 %.')},
    {'year': 2028, 'it_budget': 181500000, 'spend': 16340000, 'actual': None, 'baseline': 8000000,
     'note': T('Case table, planned: 9.0%.', 'Tableau du cas, prévu : 9,0 %.')},
]

EVIDENCE = [
    ['E1', T('CanaRetail business case v2.0c — Introduction (history, profile, threat context)', 'Cas d’affaires CanaRetail v2.0c — Introduction (historique, profil, contexte des menaces)'), T('Documented (case)', 'Documenté (cas)'),
     T('Montreal headquarters; 100 Maison Helenas stores across Canada; e-commerce, loyalty programme, ethical sourcing; increase in attack attempts since 2020, none successful; identity-based and ideologically motivated targeting considered by management.',
       'Siège social à Montréal; 100 magasins Maison Helenas au Canada; commerce électronique, programme de fidélisation, approvisionnement éthique; hausse des tentatives d’attaque depuis 2020, aucune réussie; ciblage identitaire et à motivation idéologique pris en compte par la direction.')],
    ['E2', T('Business case — IT infrastructure overview', 'Cas d’affaires — Aperçu de l’infrastructure TI'), T('Documented (case)', 'Documenté (cas)'),
     T('Montreal data centre (Windows Server 2022, SAN/NAS, virtualization, incremental and full backups); AWS and Azure IaaS/PaaS; POS in 100 stores integrated in real time; e-commerce with CDNs, payment gateways (cards, e-wallets, cryptocurrency) and AI personalization; WAN with VPN and SD-WAN; firewalls, IDS, antimalware, encryption, zero trust, behavioural analytics; Teams, VoIP; MDM; store IoT; hot/warm/cold sites (Ville Saint-Laurent, Mississauga, CGI sites); yearly drills; CI/CD and sandboxes.',
       'Centre de données de Montréal (Windows Server 2022, SAN/NAS, virtualisation, sauvegardes incrémentielles et complètes); IaaS/PaaS AWS et Azure; PDV dans 100 magasins intégrés en temps réel; commerce électronique avec réseaux de diffusion, passerelles de paiement (cartes, portefeuilles électroniques, cryptomonnaie) et personnalisation par IA; réseau étendu avec RPV et SD-WAN; pare-feu, IDS, antimaliciel, chiffrement, zéro confiance, analyse comportementale; Teams, VoIP; gestion des appareils mobiles; IdO en magasin; sites chauds, tièdes et froids (Ville Saint-Laurent, Mississauga, sites de CGI); exercices annuels; CI/CD et bacs à sable.')],
    ['E3', T('Business case — ERP (SAP S/4HANA 2025 FPS01) and its modules', 'Cas d’affaires — PGI (SAP S/4HANA 2025 FPS01) et ses modules'), T('Documented (case)', 'Documenté (cas)'),
     T('Merchandising, pricing and promotions; MM, CAR (real-time POS aggregation for click-and-collect), F&R, EWM; SD; POS connectivity; in-store MIM on mobile Fiori apps; FI/CO with daily cash reconciliation; SuccessFactors/HCM; CRM and loyalty; MFA and audits stated; cloud backups.',
       'Marchandisage, prix et promotions; MM, CAR (agrégation en temps réel des PDV pour la cueillette en magasin), F&R, EWM; SD; connectivité PDV; MIM en magasin sur applications mobiles Fiori; FI/CO avec rapprochement quotidien de l’encaisse; SuccessFactors/HCM; CRM et fidélisation; AMF et audits déclarés; sauvegardes infonuagiques.')],
    ['E4', T('Business case — IT department, workforce and organizational structure', 'Cas d’affaires — Service des TI, effectif et structure organisationnelle'), T('Documented (case)', 'Documenté (cas)'),
     T('CIO reports to the CEO; four directors (infrastructure, applications, cybersecurity, network); 62 IT staff in total, including 19 in cybersecurity (SOC manager and 10 SOC analysts, 6 security analysts, 2 team leads); helpdesk of 9; DevOps of 3; co-op students; remote and hybrid work.',
       'Le DPI relève du chef de la direction; quatre directeurs (infrastructure, applications, cybersécurité, réseau); 62 employés en TI au total, dont 19 en cybersécurité (gestionnaire du COS et 10 analystes du COS, 6 analystes en sécurité, 2 chefs d’équipe); centre d’assistance de 9 personnes; DevOps de 3 personnes; stagiaires en enseignement coopératif; travail à distance et hybride.')],
    ['E5', T('Business case — IT costs, salaries and cybersecurity allocation 2023–2031', 'Cas d’affaires — Coûts des TI, salaires et enveloppe de cybersécurité 2023–2031'), T('Documented (case)', 'Documenté (cas)'),
     T('IT budget CAD 150M in 2026 including salaries, +10% a year; cybersecurity allocation CAD 10.5M in 2026 (7.0%), 13.2M in 2027 (8.0%), rising to 26.57M in 2031 (11.0%); salaries 10% of IT budget (teaching simplification).',
       'Budget des TI de 150 M$ CA en 2026, salaires compris, +10 % par année; enveloppe de cybersécurité de 10,5 M$ en 2026 (7,0 %), 13,2 M$ en 2027 (8,0 %), jusqu’à 26,57 M$ en 2031 (11,0 %); salaires à 10 % du budget des TI (simplification pédagogique).')],
    ['E6', T('Business case — Risk appetite statement (annual report)', 'Cas d’affaires — Énoncé d’appétence pour le risque (rapport annuel)'), T('Documented (case)', 'Documenté (cas)'),
     T('Overall moderate, risk neutral (0.5); data breach low; operational disruption moderate, never above 24 hours for online sales; financial moderate-low, single-event loss under 5% of quarterly revenue; innovation moderate-high; regulatory, privacy and payment compliance very low; reputation low.',
       'Globale modérée, neutre à l’égard du risque (0,5); atteinte aux données faible; perturbation opérationnelle modérée, jamais plus de 24 heures pour les ventes en ligne; financière modérée à faible, perte par événement inférieure à 5 % du chiffre d’affaires trimestriel; innovation modérée à élevée; conformité réglementaire, vie privée et paiements très faible; réputation faible.')],
    ['E7', T('Business case — Module B audit universe', 'Cas d’affaires — Univers d’audit du module B'), T('Documented (case)', 'Documenté (cas)'),
     T('Auditable areas: governance and Board reporting, incident response, SOC triage, IAM incl. privileged and former-employee access, e-commerce/API/CI-CD, POS and payment data, store segmentation and remote support, cloud configuration, ERP integrity, backup and ransomware-resilient restore, third parties and payment processors, awareness, privacy and AI personalization.',
       'Domaines auditables : gouvernance et rapports au conseil, réponse aux incidents, tri au COS, GIA y compris les accès privilégiés et ceux des anciens employés, commerce électronique/API/CI-CD, PDV et données de paiement, segmentation des magasins et soutien à distance, configuration infonuagique, intégrité du PGI, sauvegarde et restauration résistante aux rançongiciels, tiers et processeurs de paiement, sensibilisation, vie privée et personnalisation par IA.')],
    ['E8', T('Business case — Examples of cyberattacks in the retail industry since 2020', 'Cas d’affaires — Exemples de cyberattaques dans le commerce de détail depuis 2020'), T('External context (cited in the case)', 'Contexte externe (cité dans le cas)'),
     T('E-skimming (Magecart), ransomware, credential stuffing, POS malware, DDoS (activism, extortion, distraction), supply-chain attacks, data breaches, phishing of customers. Sector context, not organizational evidence.',
       'Écrémage en ligne (Magecart), rançongiciels, bourrage d’identifiants, maliciels de PDV, déni de service (militantisme, extorsion, diversion), attaques de la chaîne d’approvisionnement, atteintes aux données, hameçonnage de la clientèle. Contexte sectoriel, non une preuve organisationnelle.')],
    ['E9', T('Business case — Scenario library (50 prompts) and Module D (nine supplied scenarios + one original)', 'Cas d’affaires — Bibliothèque de scénarios (50 amorces) et module D (neuf scénarios fournis + un original)'), T('Documented (case)', 'Documenté (cas)'),
     T('Fifty short prompts drafted with consultants; Module D asks for scenarios S1–S10 and measures M1–M10 in the CRG workbook. The nine supplied scenarios are those of the CRGO case library (CanaRetail/CR-S2, S3, S5, S6, S10, S13a, S13b, S20, S26); their statements are rewritten here as complete causal chains.',
       'Cinquante courtes amorces rédigées avec des consultants; le module D demande les scénarios S1 à S10 et les mesures M1 à M10 dans le classeur CRG. Les neuf scénarios fournis sont ceux de la bibliothèque de cas de CRGO (CanaRetail/CR-S2, S3, S5, S6, S10, S13a, S13b, S20, S26); leurs énoncés sont réécrits ici en chaînes causales complètes.')],
    ['E10', T('Project KB — Cybersecurity Risk Assessment Excel Guide v1.0c and textbook v2.51 (ch. 4–6, 17)', 'Base de connaissances — Guide Excel d’évaluation des risques v1.0c et manuel v2.51 (ch. 4 à 6, 17)'), T('Methodology', 'Méthodologie'),
     T('Authoritative formulas; factor 1,000; CVSS v4.0 base only; reductions within 0–1; appetite-consistent budget 7.8% of the IT budget at appetite 0.5; equivalency for non-technical weaknesses.',
       'Formules de référence; facteur 1 000; CVSS v4.0 de base seulement; réductions entre 0 et 1; budget cohérent avec l’appétence de 7,8 % du budget des TI à une appétence de 0,5; équivalence pour les vulnérabilités non techniques.')],
    ['E11', T('FIRST CVSS v4.0 specification (scores computed by the application engine)', 'Spécification CVSS v4.0 de FIRST (scores calculés par le moteur de l’application)'), T('External reference', 'Référence externe'),
     T('Base scores (CVSS-B) computed from the documented vectors.', 'Scores de base (CVSS-B) calculés à partir des vecteurs documentés.')],
    ['E12', T('CRGO case library — CanaRetail instructor values', 'Bibliothèque de cas de CRGO — valeurs de l’enseignant pour CanaRetail'), T('Illustrative values (calibration only)', 'Valeurs illustratives (étalonnage seulement)'),
     T('Illustrative parameters for the nine supplied scenarios. Used only as a calibration cross-check; not adopted as evidence and not copied.',
       'Paramètres illustratifs des neuf scénarios fournis. Utilisés seulement comme contre-vérification d’étalonnage; ni adoptés comme preuve ni recopiés.')],
]

CROWN = [
    ['CJ1', T('E-commerce platform and payment-gateway integration', 'Plateforme de commerce électronique et intégration des passerelles de paiement'),
     T('National online sales, click-and-collect, home delivery; card, e-wallet and cryptocurrency payments', 'Ventes nationales en ligne, cueillette en magasin, livraison à domicile; paiements par carte, portefeuille électronique et cryptomonnaie'),
     T('Director of Application Management (technical); VP e-commerce (business — Information gap)', 'Directeur de la gestion des applications (technique); vice-présidence commerce électronique (affaires — lacune d’information)'),
     'Very high', 'Very high', 'Very high', T('CDNs, web and database tiers, SAP CAR stock, payment processors, DNS', 'Réseaux de diffusion, niveaux web et base de données, stocks SAP CAR, processeurs de paiement, DNS'),
     T('CDN providers, payment processors, AWS/Azure', 'Fournisseurs de réseaux de diffusion, processeurs de paiement, AWS/Azure')],
    ['CJ2', T('Store POS terminals and card-payment processing (100 stores)', 'Terminaux PDV des magasins et traitement des paiements par carte (100 magasins)'),
     T('Every in-store sale; real-time stock and sales feed to SAP', 'Chaque vente en magasin; flux en temps réel des ventes et des stocks vers SAP'),
     T('Director of IT Infrastructure; store operations', 'Directeur de l’infrastructure TI; exploitation des magasins'),
     'Very high', 'High', 'Very high', T('Store LAN and SD-WAN, payment terminals, SAP POS connectivity, remote support', 'Réseau local des magasins et SD-WAN, terminaux de paiement, connectivité PDV de SAP, soutien à distance'),
     T('POS vendor, acquiring bank, payment processors', 'Fournisseur de PDV, banque acquéreuse, processeurs de paiement')],
    ['CJ3', T('SAP S/4HANA ERP (merchandising, supply chain, FI/CO, HCM)', 'PGI SAP S/4HANA (marchandisage, chaîne d’approvisionnement, FI/CO, GCH)'),
     T('Replenishment, pricing, distribution centres, accounting, payroll', 'Réapprovisionnement, prix, centres de distribution, comptabilité, paie'),
     T('CFO and COO (business); Director of Application Management (technical)', 'Chef des finances et chef de l’exploitation (affaires); directeur de la gestion des applications (technique)'),
     'High', 'Very high', 'High', T('Montreal data centre, databases, integrations with POS and e-commerce, service accounts', 'Centre de données de Montréal, bases de données, intégrations avec les PDV et le commerce électronique, comptes de service'),
     T('SAP, hosting and integration partners', 'SAP, partenaires d’hébergement et d’intégration')],
    ['CJ4', T('Customer, loyalty and CRM data', 'Données clients, de fidélisation et CRM'),
     T('Loyalty programme, personalization, complaints, marketing', 'Programme de fidélisation, personnalisation, plaintes, marketing'),
     T('Chief Marketing Officer; privacy officer (Information gap — not named in the case)', 'Chef du marketing; responsable de la protection des renseignements personnels (lacune d’information — non nommé dans le cas)'),
     'Very high', 'High', 'Medium', T('SAP CRM, e-commerce accounts, analytics and AI personalization, cloud storage', 'SAP CRM, comptes en ligne, analytique et personnalisation par IA, stockage infonuagique'),
     T('Cloud providers, analytics vendors', 'Fournisseurs infonuagiques, fournisseurs d’analytique')],
    ['CJ5', T('Identity, privileged and remote access', 'Identité, accès privilégiés et accès à distance'),
     T('Gateway to every crown jewel: directory, VPN, zero-trust policies, administrator and service accounts', 'Porte d’entrée de tous les joyaux de la couronne : annuaire, RPV, politiques zéro confiance, comptes d’administrateur et de service'),
     T('Director of Cybersecurity', 'Directeur de la cybersécurité'),
     'High', 'Very high', 'Very high', T('Directory and cloud identity, MFA, VPN, PAM (not evidenced)', 'Annuaire et identité infonuagique, AMF, RPV, GAP (non démontrée)'),
     T('Microsoft, VPN vendor', 'Microsoft, fournisseur de RPV')],
    ['CJ6', T('Montreal data centre, WAN/SD-WAN, backup and recovery sites', 'Centre de données de Montréal, réseau étendu/SD-WAN, sauvegardes et sites de relève'),
     T('Hosting, connectivity of 100 stores, recoverability', 'Hébergement, connectivité des 100 magasins, capacité de reprise'),
     T('Director of IT Infrastructure; Director of Network', 'Directeur de l’infrastructure TI; directeur du réseau'),
     'High', 'High', 'Very high', T('Power and cooling, SAN/NAS, firewalls, backup systems, Ville Saint-Laurent and Mississauga sites', 'Alimentation et refroidissement, SAN/NAS, pare-feu, systèmes de sauvegarde, sites de Ville Saint-Laurent et de Mississauga'),
     T('Telecom carriers, CGI Inc.', 'Fournisseurs de télécommunications, CGI inc.')],
    ['CJ7', T('AWS and Azure tenants, CI/CD pipelines and storage', 'Locataires AWS et Azure, chaînes CI/CD et stockage'),
     T('Peak-season capacity, development, disaster recovery, data exports', 'Capacité de pointe, développement, reprise après sinistre, exportations de données'),
     T('Director of Application Management; DevOps lead', 'Directeur de la gestion des applications; chef DevOps'),
     'High', 'High', 'High', T('Cloud identity, storage buckets, secrets in pipelines, logging', 'Identité infonuagique, compartiments de stockage, secrets dans les chaînes, journalisation'),
     T('AWS, Microsoft', 'AWS, Microsoft')],
    ['CJ8', T('Public domains and DNS (canaretail / Maison Helenas web presence)', 'Domaines publics et DNS (présence Web de CanaRetail / Maison Helenas)'),
     T('Customers reach the store, the account and the checkout by name; e-mail authentication', 'La clientèle accède à la boutique, au compte et au paiement par le nom de domaine; authentification du courriel'),
     T('Director of Network; Communications', 'Directeur du réseau; communications'),
     'Medium', 'Very high', 'High', T('Registrar account, authoritative DNS, CDN configuration, certificates', 'Compte auprès du registraire, DNS faisant autorité, configuration des réseaux de diffusion, certificats'),
     T('Domain registrar, DNS and CDN providers', 'Registraire de domaines, fournisseurs de DNS et de réseaux de diffusion')],
]
