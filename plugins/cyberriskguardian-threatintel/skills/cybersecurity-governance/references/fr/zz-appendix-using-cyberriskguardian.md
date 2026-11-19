<!-- Léger, M.-A. (2026). Introduction à la gouvernance de la cybersécurité pour la gestion des technologies d’affaires (3e éd., v2.51). Annexe : Utiliser CyberRiskGuardian avec ce manuel. CC BY-NC 4.0 -->

# Annexe : Utiliser CyberRiskGuardian avec ce manuel

Ce manuel présente la gouvernance de la cybersécurité comme un ensemble de décisions de gestion : quoi protéger, quelle part de risque accepter, quels traitements financer et comment démontrer que les décisions étaient fondées. Les chapitres 5 et 6 transforment ces décisions en une méthode reproductible, l’évaluation des risques fondée sur des scénarios, et les chapitres suivants y reviennent chaque fois qu’un domaine — identités, infonuagique, tiers, intelligence artificielle, investissement — doit être relié au risque d’affaires. CyberRiskGuardian est l’ensemble d’outils qui soutient cette méthode dans la pratique. Cette annexe explique ce qu’il est, quelle édition utiliser, comment chaque chapitre s’y rattache et où l’obtenir.

Cette annexe s’adresse aux étudiantes et aux étudiants, au personnel enseignant et aux personnes responsables de la coordination des programmes. Elle ne reprend pas la méthode elle-même; les formules, les paramètres et les règles d’interprétation sont expliqués aux chapitres 5 et 6, et les outils suivent fidèlement ces chapitres. Toutes les activités pédagogiques associées à ce manuel utilisent l’Édition communautaire de CyberRiskGuardian ou sa licence éducative.

## Ce qu’est CyberRiskGuardian

CyberRiskGuardian (CRG) est la méthode ouverte, axée sur les scénarios, que l’auteur a conçue pour évaluer les risques de cybersécurité, accompagnée des outils qui la soutiennent. C’est un outil d’aide à la décision, et non un décideur : il structure l’analyse et l’accélère, tandis que l’analyste demeure imputable de chaque estimation et la direction, de chaque décision relative au risque.

La méthode suit la démarche enseignée aux chapitres 4 à 6. L’analyste documente le contexte organisationnel dans un registre des éléments probants, recense les joyaux de la couronne (actifs critiques), fixe l’appétence pour le risque sur une échelle de 0 à 1, rédige des scénarios candidats formulés comme des chaînes causales (généralement de 25 à 40, jamais moins de vingt) et retient les dix plus importants. Chaque scénario retenu reçoit six paramètres — la probabilité de présence de la menace, Pb(A); la probabilité d’exploitation, Pb(ψ,A); le dommage estimé, δe; le dommage maximal, δm; la résilience organisationnelle, θ; et la criticité organisationnelle ou utilité attendue, μ(E) — ainsi que le score CVSS v4.0 de la faiblesse qu’il exploite, le tout sur un même horizon de 12 mois. Le moteur de calcul produit ensuite le risque estimé (Re), le risque toléré (Rt), le risque atténué et le risque résiduel de chaque ensemble de mesures, ainsi que le ratio de tolérance, qui se lit comme sous la tolérance (moins de 0,90), approximativement à la tolérance (de 0,90 à 1,10) ou au-dessus de la tolérance (plus de 1,10). Les résultats alimentent un portefeuille de traitement, un budget de cybersécurité aligné sur l’appétence, des indicateurs clés de risque (ICR) et un rapport à la direction.

Trois mentions figurent sur chaque livrable CRG et tout au long des chapitres 5 et 6 : Estimation analytique — validation requise pour une valeur estimée par l’analyste ou par un outil d’IA, Lacune d’information — validation organisationnelle requise pour un fait que personne n’a fourni, et Décision de la direction requise pour un choix que seule la direction peut faire. Quiconque emploie correctement ces mentions a compris la différence entre la preuve, l’inférence et le jugement, qui est la compétence centrale que ce manuel cherche à développer.

CyberRiskGuardian calcule et structure; les personnes valident et décident. Un nombre que le moteur vérifié n’a pas recalculé n’est pas un résultat.

## Éditions : qui devrait utiliser laquelle

CyberRiskGuardian suit un modèle à cœur ouvert (open core). Les éditions diffèrent selon les personnes qui peuvent les utiliser et les fins auxquelles elles peuvent le faire, et non par la méthode, qui est partout la même.

- Édition communautaire (gratuite). Le dépôt public est publié sous la licence Creative Commons Attribution - Pas d’Utilisation Commerciale 4.0 International (CC BY-NC 4.0). La population étudiante peut l’utiliser gratuitement pour ses propres travaux de cours, y compris les travaux notés, et les organismes sans but lucratif peuvent l’utiliser gratuitement pour évaluer leurs propres risques. Le personnel enseignant peut lire, adapter et réutiliser le matériel gratuit pour un enseignement non commercial, en citant la source. L’Édition communautaire comprend les spécifications de base de la méthode, le plugiciel pour assistant d’IA avec ses compétences (skills), ses commandes, ses agents de revue et son calculateur vérifié, une version de ce manuel présentée sous forme de compétence de référence, l’exemple résolu MediBec et la trousse pédagogique. Les étudiantes et étudiants, pour leurs propres travaux de cours, ainsi que les organismes sans but lucratif peuvent aussi utiliser gratuitement l’application de bureau en vertu de sa licence.
- Licence éducative (Educational Licence). Les collèges, les cégeps et les universités, à titre d’établissements, utilisent la licence éducative CyberRiskGuardian pour offrir un cours fondé sur CRG. Offerte à un prix éducatif réduit, elle comprend l’installation et la personnalisation pour l’établissement, la version actuelle de l’application de bureau, le processus quantitatif complet décrit au chapitre 6 et l’Édition Éducateur du matériel pédagogique : corrigés des laboratoires, banque de questionnaires notés, exemples de calibrage des grilles d’évaluation, notes pédagogiques sur les cas et un cas réservé pour l’examen final.
- Éditions professionnelles. Des éditions payantes distinctes existent pour les entreprises, les consultants, les fournisseurs de services de sécurité gérés et les organismes publics qui utilisent CRG pour leur propre gestion des risques ou pour réaliser des mandats rémunérés.
La règle pratique pour ce manuel est simple. Une personne étudiante qui travaille de façon autonome utilise l’Édition communautaire. Un cours offert par un établissement utilise la licence éducative, afin que tous les groupes-cours travaillent avec la même installation, les mêmes corrigés et les mêmes mesures de protection des examens. En cas de divergence entre ce résumé et le texte de la licence, c’est la licence qui prévaut; cette annexe ne constitue pas un avis juridique.

## Trois façons de travailler

La trousse pédagogique décrit trois parcours d’outil. La méthode et les formules sont identiques dans les trois; seule l’interface change. Le personnel enseignant devrait choisir un seul parcours par cours, ou un parcours hybride déclaré, afin que les équipes soient évaluées sur un pied d’égalité.

- Parcours A — Assistant d’IA. Le plugiciel gratuit fonctionne dans une plateforme d’assistant d’IA approuvée. Il interroge la personne qui l’utilise au sujet de l’organisation, constitue le registre des éléments probants et la cartographie des joyaux de la couronne, propose l’appétence pour le risque, génère et filtre les scénarios, puis calcule les résultats avec le calculateur vérifié intégré. Une commande d’analyse rapide produit au moins vingt scénarios candidats (généralement de 25 à 40), dix scénarios retenus et leurs verdicts avant traitement dans un seul tableau; une commande d’évaluation complète y ajoute le résumé à l’intention de la direction. Un agent de revue de qualité en lecture seule et une vérification des mentions signalent les mentions manquantes.
- Parcours B — Application de bureau. L’application de bureau s’exécute localement dans un navigateur Web, conserve les données sur l’ordinateur de la personne étudiante, à moins que celle-ci ne choisisse de les envoyer, et fait basculer toute son interface entre l’anglais et le français. Elle offre des espaces de travail pour la classe, un éditeur de scénarios, un outil CVSS v4.0, un calculateur de risque qui affiche chaque étape de la formule, des propositions de traitement et un catalogue de contrôles, des prévisions, un tableau de bord des ICR, des exercices de simulation des opérations de sécurité ainsi que des modules de politiques et d’audit.
- Parcours C — Modèle Excel. Le modèle Excel CRG vierge affiche ouvertement chaque formule et fonctionne hors ligne, ce qui convient à la population étudiante en gestion qui souhaite voir les calculs. Son utilisation est décrite plus bas.
Une approche hybride fonctionne bien : la population étudiante rédige le contexte et les scénarios avec l’assistant d’IA, puis les quantifie et les traite dans l’application de bureau ou dans le classeur, où chaque nombre est recalculé. Quel que soit le parcours, la première étape consiste à confirmer que le moteur concorde avec l’implémentation de référence : l’exemple MediBec doit produire un risque estimé total de 84 305 et un risque résiduel total de 41 023.

## Guide chapitre par chapitre

Le tableau ci-dessous associe chaque chapitre aux fonctionnalités de CRG qui le soutiennent. Les fonctionnalités confirmées dans la documentation de CRG sont présentées sans mention particulière; celles qui ne sont offertes que dans l’application de bureau portent la mention « application de bureau »; celles qui sont distribuées dans des modules distincts ou payants, ou qui ne sont pas encore documentées pour les éditions pédagogiques, portent la mention « selon la disponibilité ».

Chapitre

Fonctionnalités de CyberRiskGuardian

Activité type

1 Notions de base

Compétence de référence du manuel; les trois mentions; gabarit de chaîne causale

Expliquer le triangle du risque à l’aide d’une réponse qui cite le chapitre

2 Gouvernance

Estimateur de l’appétence pour le risque; mention Décision de la direction requise; revue de qualité; RACI multiutilisateur (selon la disponibilité)

Déterminer quelles décisions relèvent du conseil d’administration et lesquelles relèvent de la direction

3 Conformité

Gestion des audits (univers d’audit, plan d’audit); trousses de conformité et gestion de la conformité (selon la disponibilité)

Relier une obligation à un scénario et à son contrôle clé

4 Gestion des risques

Collecte du contexte; registre des éléments probants; joyaux de la couronne; appétence sur une échelle de 0 à 1; ligne directrice budgétaire (application de bureau)

Fixer et justifier une valeur d’appétence pour un cas

5 Scénarios de risque

Générateur de scénarios : au moins vingt candidats (généralement de 25 à 40), filtrage, dix retenus; éditeur de scénarios

Rédiger et filtrer des scénarios sous forme de chaînes causales

6 Évaluation des risques

Six paramètres; cotation CVSS v4.0; calculateur de risque; propositions de traitement et catalogue de contrôles; verdicts par rapport à la tolérance; analyse de sensibilité et prévisions Monte-Carlo (application de bureau); résumé à l’intention de la direction

Calculer Re, Rt, le risque résiduel et le ratio, puis tester la sensibilité

7 Opérations

Éléments probants des opérations de sécurité consignés dans les scénarios; tableau de bord des ICR (application de bureau)

Consigner les éléments probants des opérations sans modifier manuellement les paramètres

8 Détection et intervention

Exercices de simulation SIEM et SOAR (application de bureau); outil CVSS v4.0; flux de renseignement sur les menaces (selon la disponibilité)

Trier les alertes et confirmer ce qui fait d’un dossier un incident

9 Cadres de contrôles

Catalogue de contrôles; énoncés de politique rattachés à l’ISO/IEC 27002:2022

Faire correspondre un ensemble de mesures aux éditions actuelles des cadres

10 GIA

Bibliothèque de politiques de sécurité (gabarit sur le contrôle d’accès et l’authentification) et attribution des politiques de GIA (application de bureau)

Rédiger cinq énoncés de politique de GIA vérifiables

11 TO, IdO, systèmes cyberphysiques

Générateur de scénarios et calculateur appliqués aux scénarios cyberphysiques

Coter un scénario touchant la sécurité des personnes à l’aide de δm et de μ(E)

12 Incidents et résilience

Paramètre de résilience θ; ICR liés aux tests de restauration; exercices SOAR (application de bureau)

Montrer comment une reprise testée modifie θ

13 Architecture

Traçabilité de la chaîne causale, du scénario au traitement; ontologie CRGO (selon la disponibilité)

Relier une décision de conception à un scénario d’entreprise

14 Bases de référence

Tableau de bord des ICR et projections des ICR (application de bureau)

Définir des ICR de configuration avec leurs responsables et leurs seuils

15 Infonuagique

Registre des scénarios; patrons de scénarios infonuagiques dans le générateur de scénarios

Évaluer un scénario d’erreur de configuration infonuagique

16 Vie privée

Scénarios relatifs à la vie privée dans le même registre; registre des éléments probants

Ajouter un scénario relatif à la vie privée lié à la Loi 25 à côté des scénarios de sécurité

17 Économie

Coût-efficacité par tranche de 1 000 $; ligne directrice budgétaire, facteurs déterminants, analyse de sensibilité et prévisions Monte-Carlo (application de bureau)

Comparer le portefeuille fondé sur les risques au budget aligné sur l’appétence

18 IA

IA encadrée avec aperçu du contenu envoyé, anonymisation et option de modèle local (application de bureau); vérification des mentions

N’utiliser les résultats de l’IA qu’après validation et recalcul

19 Tiers

Scénarios liés aux fournisseurs; module de gestion du risque lié aux tiers (selon la disponibilité)

Évaluer un scénario de concentration des fournisseurs

20 Cryptographie

Générateur de scénarios; cotation CVSS par équivalence pour les faiblesses de processus

Modéliser un scénario d’expiration de certificat

21 Personnes et reddition de comptes

Responsables du risque; Décision de la direction requise; revue de qualité; RACI multiutilisateur (selon la disponibilité)

Attribuer les responsables et les droits décisionnels pour les risques résiduels

Trois mises en garde s’appliquent à l’ensemble du tableau. Premièrement, le CVSS est un multiplicateur obligatoire dans l’indice de risque, mais jamais un critère de classement ou de sélection; pour les faiblesses liées aux processus, aux personnes, à la gouvernance, à la sécurité physique et aux tiers, la personne étudiante cote une faiblesse représentative par équivalence, comme l’explique le chapitre 6, et lui attribue la mention « applicabilité limitée ». Deuxièmement, l’indice de risque est un indicateur relatif servant à la comparaison, et non un montant en dollars ni un ICR; les ICR sont les indicateurs mesurés, assortis de responsables, de sources et de seuils, qui permettent de surveiller l’évolution d’un risque. Troisièmement, un ensemble de mesures ne réduit le risque calculé que s’il agit à la fois sur la probabilité et sur l’impact, puisque les deux réductions sont multipliées; une mesure à levier unique, comme l’assurance, est consignée comme un transfert du risque, et non comme une atténuation.

## Le modèle Excel pédagogique

La trousse pédagogique comprend un modèle Excel CyberRiskGuardian gratuit et vierge, utilisé pour le travail d’équipe d’évaluation des risques dans les cours fondés sur ce manuel. Il contient une feuille Analyse comportant une ligne par scénario, dix feuilles de saisie des scénarios (S1 à S10) et dix feuilles d’atténuation (M1 à M10) qui renferment un catalogue de contrôles. La version qui accompagne la présente édition, CyberRiskGuardian_Excel_Model_Blank_v2-6.xlsx, conserve aussi le vecteur CVSS de chaque scénario à côté de son score, compare les dépenses actuelles en cybersécurité à la cible alignée sur l’appétence (écart par rapport à la cible et appétence implicite) et consigne le transfert du risque avec la part de la perte couverte et l’approbateur. Sa transparence constitue sa principale force : chaque valeur intermédiaire peut être examinée, ce qui aide la population étudiante à vérifier ses calculs manuels par rapport au moteur.

Le modèle corrigé qui accompagne cette édition du manuel suit exactement le moteur CyberRiskGuardian. Gardez les points suivants à l’esprit lorsque vous l’utilisez.

- Recalculez délibérément. Le classeur s’ouvre en mode de calcul manuel; les valeurs ne changent donc qu’après la commande Calculer maintenant (F9).
- Saisissez toutes les données requises. Les cellules CVSS sont vides au départ et acceptent des scores de 0 à 10; un score manquant est signalé par la mention « CVSS required » (CVSS requis) au lieu de produire silencieusement un zéro. La résilience doit être supérieure à 0 et au plus égale à 1, et l’appétence doit se situer strictement entre 0 et 1. Le facteur de multiplication est de 1 000; il met les scores à l’échelle, mais ne change jamais un ratio ni un verdict.
- Combinez les contrôles selon la règle du produit. Lorsque plusieurs contrôles sont sélectionnés pour un scénario, le classeur combine leurs coefficients selon la formule 1 − ∏(1 − rᵢ), séparément pour la réduction de la probabilité et pour la réduction de l’impact, de sorte que chaque contrôle supplémentaire retranche une part de ce que les autres ont laissé et que l’ensemble de mesures peut s’approcher de 1 sans jamais le dépasser. CyberRiskGuardian applique la même règle dans tous les parcours. Une réduction invalide ne peut donc provenir que d’un coefficient isolé saisi hors de l’intervalle de 0 à 1, que le classeur signale; il est aussi possible de saisir une estimation unique pour l’ensemble de mesures dans une ligne « Other » (Autre).
- Lisez les colonnes de verdict. Le classeur calcule le ratio avant traitement, le ratio de tolérance et son verdict (sous la tolérance, approximativement à la tolérance ou au-dessus de la tolérance), le coût-efficacité par tranche de 1 000 $ et le repère budgétaire de pratique exemplaire correspondant à l’appétence de l’organisation.
- Utilisez des catalogues à jour. Les feuilles d’atténuation énumèrent les mesures de l’ISO/IEC 27002:2022, les résultats du NIST CSF 2.0 et les dix-huit CIS Controls v8.1, comme le décrit le chapitre 9. Les coûts et les coefficients par défaut sont des valeurs provisoires à remplacer par des estimations propres au cas.
- Comptez une seule fois les contrôles partagés. Lorsqu’une initiative sert plusieurs scénarios, répartissez son coût entre eux pour l’analyse des scénarios et comptez-le une seule fois dans le total du portefeuille.

## Utiliser l’IA de façon responsable avec CyberRiskGuardian

CyberRiskGuardian est lui-même assisté par l’IA; les règles du chapitre 18 s’y appliquent donc directement. L’IA peut rédiger des scénarios, proposer des valeurs de paramètres accompagnées de justifications, critiquer des estimations et suggérer des contrôles. Elle ne peut pas fournir sur un cas des faits que celui-ci ne contient pas, produire un nombre final que la personne étudiante n’a pas recalculé avec le moteur vérifié, ni inventer des normes, des identifiants de contrôles, des obligations légales, des statistiques ou des sources. Chaque valeur proposée par l’IA porte la mention Estimation analytique — validation requise jusqu’à ce qu’une personne l’ait vérifiée.

La protection des données passe en premier. La population étudiante ne devrait utiliser qu’un service d’IA approuvé par son établissement et ne devrait jamais coller de renseignements confidentiels sur une organisation réelle dans un service externe sans autorisation écrite. Les cas fictifs, comme les cinq cas de la Bibliothèque de cas CRG, conviennent sans risque aux travaux de cours. Dans l’application de bureau, les requêtes à l’IA affichent le contenu exact avant tout envoi, peuvent être anonymisées et peuvent être acheminées vers un modèle local ou complètement désactivées, ce qui constitue le choix approprié chaque fois que les données sont sensibles.

## Où l’obtenir

L’Édition communautaire, y compris la trousse pédagogique, le modèle Excel, l’exemple MediBec et les guides de démarrage rapide en anglais et en français, est publiée dans le dépôt GitHub public ITriskMgr/CyberRiskGuardian. Commencez par le fichier README de la trousse pédagogique, qui énumère le Guide de l’enseignant, le Cahier de laboratoires de l’étudiant, la Trousse d’évaluation, la Bibliothèque de cas, la présentation d’introduction et le modèle Excel vierge.

L’information sur le produit, la licence éducative destinée aux collèges et aux universités ainsi que les éditions professionnelles sont présentées sur le site du produit, cyberriskguardian.ca, et les demandes relatives aux licences peuvent être envoyées à sales@cyberriskguardian.ca. Le personnel enseignant qui planifie un cours devrait communiquer tôt avec la personne responsable de la coordination du programme dans son établissement, afin que l’installation, la personnalisation et l’Édition Éducateur soient en place avant le premier laboratoire.

Peu importe l’édition ou le parcours utilisé dans un cours, le critère est le même : chaque nombre doit pouvoir être relié à des éléments probants, chaque estimation doit porter sa mention et chaque décision relative au risque doit revenir aux personnes qui en sont imputables.
