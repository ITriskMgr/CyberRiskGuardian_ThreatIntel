<!-- Léger, M.-A. (2026). Introduction à la gouvernance de la cybersécurité pour la gestion des technologies d’affaires (3e éd., v2.51). Chapitre 13 : Architecture et ingénierie de la sécurité. CC BY-NC 4.0 -->

# Chapitre 13 : Architecture et ingénierie de la sécurité

## Résultats d’apprentissage

Au terme de ce chapitre, vous devriez être en mesure de :

1. Distinguer l’architecture de sécurité de l’ingénierie de la sécurité et expliquer comment les responsables du risque et la gouvernance complètent une seule chaîne d’imputabilité.

2. Expliquer pourquoi les contrôles architecturaux offrent un plus grand effet de levier de réduction du risque que les contrôles de détection ou procéduraux, à l’aide de la logique des scénarios des chapitres 4 à 6.

3. Comparer SABSA, TOGAF et Open Security Architecture et recommander une façon défendable de les combiner dans une organisation.

4. Analyser les sept piliers architecturaux comme un système en interaction et déterminer, pour chacun, la décision qui le gouverne et les éléments probants attendus.

5. Évaluer un programme de vérification systématique au regard de la publication NIST SP 800-207, du Zero Trust Maturity Model Version 2.0 de la CISA et des pièges de gouvernance décrits dans le chapitre.

6. Concevoir les mécanismes de gouvernance qui rendent l’architecture gouvernable : points de contrôle de modélisation des menaces, patrons de référence, autorité de conception, fiches de décision d’architecture et exceptions à échéance.

7. Justifier le traitement de la dette de sécurité comme un risque de cybersécurité et recommander des mesures fondées sur la couverture et des indicateurs clés de risque pour rendre compte de l’architecture à la direction.

La gouvernance de la cybersécurité est souvent enseignée au moyen de principes, de politiques et de normes. Les opérations de cybersécurité sont souvent enseignées au moyen d’outils, de la détection, de l’intervention et des équipes. Les deux sont nécessaires. Pourtant, les gestionnaires peinent souvent dans l’espace qui les sépare : traduire les priorités en matière de risque en un ensemble cohérent de décisions de conception qui façonnent la manière dont la technologie est construite, connectée, exploitée et rétablie. Cet espace est le domaine de l’architecture et de l’ingénierie de la sécurité. C’est là que l’énoncé d’appétence pour le risque d’un conseil d’administration devient une propriété structurelle des systèmes de l’organisation ou demeure une simple phrase dans une politique.

L’architecture de sécurité est la conception rigoureuse des capacités de protection dans l’ensemble des systèmes, des flux de données et des processus de l’organisation. L’ingénierie de la sécurité est la mise en œuvre pratique de ces conceptions dans des environnements réels — où les contraintes, les dépendances patrimoniales, les budgets, les fournisseurs et le comportement humain déterminent ce qui fonctionne réellement. Pour les gestionnaires, ni l’une ni l’autre n’est un sujet technique au sens étroit. Ce sont toutes deux des domaines de contrôle de gestion, car elles déterminent l’exposition structurelle de l’organisation au cyberrisque, le coût de la sécurité sur la durée de vie de chaque système, les frictions opérationnelles imposées aux unités d’affaires et la crédibilité de chaque affirmation d’assurance présentée à un conseil d’administration, à un organisme de réglementation, à un auditeur ou à un client.

Les normes et les catalogues de contrôles, examinés au chapitre 9, décrivent ce qui devrait exister. L’architecture fournit la justification et la structure de ce que l’organisation construira réellement, de la manière dont les éléments s’imbriquent, de ce qui doit être imposé par la conception plutôt que par la vigilance, et de la façon dont le résultat sera exploité et rétabli. Les dirigeants approuvent rarement des catalogues de contrôles; ils approuvent des feuilles de route, des choix de plateformes, des modèles opérationnels, des dépendances et des compromis. L’architecture est le langage de ces approbations, et le lieu où une mauvaise approbation coûte le plus cher à renverser.

Ce chapitre s’appuie sur la logique du risque des chapitres 4 à 6. L’évaluation des risques fondée sur des scénarios indique aux gestionnaires quelles combinaisons de menace, de vulnérabilité et d’exposition comptent le plus; l’architecture est le moyen par lequel l’organisation réduit durablement la vraisemblance et l’impact de ces scénarios, dans de nombreux systèmes à la fois. Le chapitre est aussi lié aux chapitres voisins : la gestion des identités et des accès (chapitre 10), les bases de référence (chapitre 14), l’infonuagique (chapitre 15), les tiers (chapitre 19), la cryptographie (chapitre 20) et l’investissement (chapitre 17) dépendent tous de choix architecturaux faits, ou évités, en amont.

Le chapitre distingue d’abord l’architecture de l’ingénierie et présente la sécurité dès la conception et le principe « sécurisé par défaut » comme la philosophie structurante des programmes modernes. Il examine ensuite les cadres d’architecture d’entreprise qui donnent sa méthode à l’architecture de sécurité — SABSA, TOGAF et Open Security Architecture — ainsi que les sept piliers architecturaux que la plupart des programmes gouvernent et dans lesquels ils investissent, traités à l’échelle des décisions d’architecture, les pratiques détaillées étant laissées à d’autres chapitres. L’architecture à vérification systématique (AVS) est présentée comme un concept de gouvernance plutôt que comme une catégorie de produits. Les dernières sections traitent de la façon dont l’architecture est gouvernée dans la pratique : la modélisation des menaces, les architectures de référence et les patrons, les comités d’examen et l’autorité de conception, les fiches de décision d’architecture et les exceptions, la dette technique en tant que risque, et les mesures qui rendent l’ensemble visible pour la direction. Une mise en situation et des questions à l’intention des gestionnaires concluent le chapitre.

## Architecture et ingénierie : ce que les gestionnaires doivent gouverner

Les mots architecture et ingénierie sont employés de manière approximative dans la pratique, et cette imprécision cause de réels problèmes de gouvernance. Quand tout le monde se dit architecte, personne n’est responsable de l’état cible. Quand l’ingénierie se résume au déploiement d’outils, personne ne se demande si ces outils forment ensemble une défense cohérente. Les gestionnaires n’ont pas besoin de maîtriser le contenu technique de l’une ou l’autre discipline, mais ils ont besoin d’un modèle clair de la raison d’être de chacune, de qui décide quoi et des éléments probants que chacune doit produire.

Deux disciplines, une seule chaîne d’imputabilité

Une distinction managériale simple est utile. L’architecture de sécurité répond à la question suivante : que doit-il être vrai de l’environnement technologique de l’organisation pour que le risque demeure dans les limites de l’appétence? Elle définit les états cibles, les patrons standard, les architectures de référence, les contraintes de conception obligatoires et les principes au regard desquels les conceptions proposées sont jugées. Son but est de structurer les systèmes de manière que les résultats de sécurité ne dépendent ni d’actes héroïques, ni de la mémoire, ni de la bonne volonté de chaque administrateur.

L’ingénierie de la sécurité répond à une autre question : comment allons-nous bâtir et exploiter ces états cibles dans notre environnement réel? Elle choisit les méthodes de mise en œuvre et les outils, écrit le code de configuration, intègre les contrôles aux chaînes de livraison, définit la façon dont les contrôles seront testés et s’assure que ce qui est conçu peut réellement être exploité par les équipes des opérations décrites au chapitre 7. L’ingénierie transforme la conception en capacité fonctionnelle et, point essentiel, produit les éléments probants démontrant que cette capacité existe et fonctionne.

Les deux disciplines forment une seule chaîne d’imputabilité. L’architecture sans l’ingénierie produit des schémas élégants qui n’atteignent jamais la production. L’ingénierie sans l’architecture produit un assemblage disparate dans lequel les contrôles existent, mais ne concordent pas, la surveillance présente des angles morts, les accès privilégiés ne sont pas gérés et la reprise n’a jamais été testée. Les organisations matures traitent les deux comme des compétences assorties de responsables désignés, de droits décisionnels et de résultats mesurables, reliées au registre des risques afin que chaque décision d’architecture puisse être rattachée aux scénarios qu’elle traite.

- L’architecture est responsable du « quoi » et du « pourquoi » : les états cibles, les principes, les patrons et les contraintes de conception que les projets doivent respecter.
- L’ingénierie est responsable du « comment » et de la preuve : la mise en œuvre, l’automatisation, les tests et les éléments probants opérationnels démontrant qu’une conception fonctionne comme prévu.
- Les responsables du risque assument le risque résiduel : lorsqu’une conception n’atteint pas l’état cible, c’est le responsable métier du service touché, et non l’architecte, qui décide d’accepter ou non l’écart, dans les limites de l’appétence pour le risque.
- La gouvernance est responsable du système dans son ensemble : elle fixe les principes, finance la feuille de route, arbitre les conflits entre la vitesse de livraison et le risque, et surveille si l’architecture réduit réellement l’exposition.
Pourquoi l’architecture est un instrument de gestion des risques

La gestion des risques, telle qu’elle est présentée aux chapitres 4 à 6, est fondée sur des scénarios : des acteurs de menace exploitent des vulnérabilités pour produire des impacts sur ce à quoi l’organisation accorde de la valeur. Les contrôles peuvent agir à de nombreux points de cette chaîne, mais ils n’ont pas tous le même effet de levier. Un contrôle de détection repère une occurrence d’un problème. Un contrôle procédural repose sur des personnes qui doivent se souvenir de l’appliquer. Un contrôle architectural modifie la structure de l’environnement de sorte que des catégories entières de scénarios deviennent moins probables ou moins dommageables, pour chaque système bâti sur cette structure, sans que personne ait à se souvenir de quoi que ce soit.

Considérons quelques mécanismes structurels. La segmentation limite le rayon d’impact d’un poste de travail compromis. L’authentification résistante à l’hameçonnage élimine toute une famille de scénarios de vol d’identifiants. Des bases de référence standard appliquées sous forme de code empêchent la dérive de configuration sur des milliers d’actifs. Des sauvegardes immuables et isolées transforment un scénario de rançongiciel catastrophique en une perturbation à laquelle on peut survivre, même si elle est pénible. Chacune de ces décisions de conception est prise une fois et héritée de nombreuses fois. C’est pourquoi un seul patron d’architecture bien choisi peut réduire le risque dans des dizaines ou des centaines de systèmes, souvent à un coût total inférieur à celui d’une compensation par la détection, l’examen manuel ou les mesures correctives après coup.

C’est aussi pourquoi l’architecture relève directement de la gouvernance. Lorsqu’un conseil d’administration demande si l’organisation gère son cyberrisque de manière responsable, la preuve opérationnelle se trouve souvent dans l’architecture : les accès privilégiés sont-ils restreints, les systèmes critiques sont-ils segmentés, la journalisation soutient-elle la détection et les enquêtes, les clés de chiffrement sont-elles maîtrisées et la reprise est-elle réaliste? Ce sont des questions de structure, et la structure est précisément ce que gouverne l’architecture. Les décisions d’architecture comptent parmi les décisions de risque ayant le plus grand effet de levier qu’une organisation puisse prendre, et elles méritent la même attention de la gouvernance que les grandes décisions d’investissement.

Les politiques disent aux gens quoi faire; l’architecture détermine ce que l’environnement permet. Quand les deux divergent, c’est généralement l’environnement qui l’emporte.

La place de l’architecture dans les normes et la réglementation

L’architecture de sécurité n’est pas un raffinement facultatif qui se situerait hors des cadres présentés au chapitre 9. La norme ISO/IEC 27002:2022 comprend une mesure précise, la mesure 8.27, Principes d’ingénierie et d’architecture des systèmes sécurisés, qui attend des organisations qu’elles établissent, documentent, tiennent à jour et appliquent de tels principes à toute activité de développement de systèmes d’information, en plus de mesures connexes portant sur le cycle de vie de développement sécurisé (8.25), le codage sécurisé (8.28) et la gestion de la configuration (8.9). Un système de gestion de la sécurité de l’information (SGSI) certifié selon la norme ISO/IEC 27001:2022 devrait donc pouvoir démontrer non seulement que des principes existent, mais aussi que les projets les appliquent réellement.

Le NIST CSF 2.0 situe les préoccupations architecturales dans plusieurs catégories de la fonction Protéger, notamment Sécurité des plateformes (PR.PS) et Résilience de l’infrastructure technologique (PR.IR), tandis que la fonction Gouverner attend de la stratégie, des rôles et de la politique de cybersécurité qu’ils orientent la façon dont ces résultats sont recherchés. Dans le langage de COBIT 2019, l’architecture de sécurité s’inscrit dans l’objectif de gestion de l’architecture d’entreprise gérée (APO03) et dans les objectifs de construction qui en découlent, ce qui aide à relier la conception de la sécurité aux objectifs de l’entreprise plutôt que de la traiter comme une préoccupation technique isolée.

Au Canada, les institutions financières fédérales (IFF) font face à des attentes explicites. La ligne directrice B-13 du BSIF, Gestion du risque lié aux technologies et du cyberrisque, publiée en juillet 2022 et en vigueur depuis le 1er janvier 2024, énonce comme principe 4 que les institutions devraient mettre en œuvre un cadre d’architecture technologique assorti de processus de soutien; elle s’attend à ce que les systèmes soient conçus pour la sécurité (sécurité dès la conception) et la résilience (résilience dès la conception) selon une approche fondée sur les risques, et demande aux institutions d’adopter des pratiques de sécurité dès la conception pour protéger les actifs technologiques. Pour les organisations qui se trouvent hors de ce périmètre, la même logique apparaît de plus en plus dans le droit de la protection des renseignements personnels : la Loi 25 exige une évaluation des facteurs relatifs à la vie privée (EFVP) pour tout projet d’acquisition, de développement ou de refonte d’un système d’information comportant des renseignements personnels, et exige que les produits technologiques offerts au public assurent par défaut le plus haut niveau de confidentialité; l’article 25 du RGPD de l’Union européenne exige la protection des données dès la conception et par défaut. C’est dans l’architecture que ces obligations juridiques prennent une réalité technique.

## Sécurité dès la conception et sécurité par défaut

Le changement le plus lourd de conséquences en architecture de sécurité au cours de la dernière décennie n’est pas une technologie. C’est un changement quant au moment où le travail de sécurité est censé se faire. Pendant de nombreuses années, la sécurité était ajoutée à un système après sa conception, souvent par une autre équipe et fréquemment à la fin d’un projet, lorsque le coût des changements était le plus élevé. La sécurité dès la conception inverse cette séquence : les exigences de sécurité, l’analyse des menaces et les contraintes architecturales sont introduites dès le départ et maintenues tout au long de la vie du système. La sécurité par défaut ajoute une deuxième attente : que les systèmes et les produits soient sûrs dans leur configuration d’origine, sans que le client ou l’exploitant ait à découvrir et à activer les paramètres de protection.

De l’adaptation après coup aux décisions prises à la conception

L’argument économique en faveur de la sécurité dès la conception est simple. Les décisions prises tôt — à quel fournisseur d’identité un système fait confiance, si un composant est exposé à Internet, comment les données sont partitionnées, quels protocoles sont autorisés — encadrent tout ce qui suit. Les modifier après le déploiement exige généralement une nouvelle conception, une migration des données, de nouveaux tests et une interruption de service. Ajouter plutôt des contrôles compensatoires crée un coût d’exploitation permanent. L’organisation paie dans tous les cas; la question est de savoir si elle paie une fois, au moment de la conception, ou à répétition, pendant toute la vie du système.

La publication NIST SP 800-160 Vol. 1 Rev. 1, Engineering Trustworthy Secure Systems, parue en novembre 2022, offre le traitement public le plus complet de cette discipline. Elle présente l’ingénierie de la sécurité des systèmes comme une partie intégrante de l’ingénierie des systèmes plutôt que comme une activité parallèle; elle organise le travail autour d’un contexte de problème (ce qui doit être protégé et pourquoi), d’un contexte de solution (comment la protection est assurée) et d’un contexte de fiabilité (comment les parties prenantes acquièrent une confiance justifiée dans le fait que la solution fonctionne); et elle souligne que la démarche s’applique à la livraison agile et DevOps autant qu’aux cycles de vie traditionnels. Sa publication complémentaire, NIST SP 800-160 Vol. 2 Rev. 1, porte sur l’ingénierie de la cyberrésilience, c’est-à-dire la conception de systèmes capables d’anticiper des conditions défavorables, d’y résister, de s’en rétablir et de s’y adapter, y compris en cas d’attaques réussies.

Pour les gestionnaires, la leçon essentielle de la publication SP 800-160 est l’accent qu’elle met sur la confiance justifiée. Une conception sécurisée n’est pas une conception que l’architecte croit sécurisée; c’est une conception pour laquelle il existe une argumentation, étayée par des éléments probants, démontrant que les exigences de sécurité sont complètes, cohérentes et réellement satisfaites. Ce cadrage s’accorde naturellement avec l’accent que met ce manuel sur les décisions défendables et sur des éléments probants capables de résister à un audit et à une revue post-incident.

Le Secure by Design de la CISA et le rôle du client

La Cybersecurity and Infrastructure Security Agency (CISA) des États-Unis et des organismes partenaires ont promu la même idée du côté des producteurs de technologies. Leurs orientations conjointes, Shifting the Balance of Cybersecurity Risk, ont d’abord été publiées en avril 2023 (avec le sous-titre Principles and Approaches for Security-by-Design and -Default), puis rééditées dans une version enrichie en octobre 2023 sous le sous-titre Principles and Approaches for Secure by Design Software, avec un groupe élargi de partenaires internationaux, dont le Centre canadien pour la cybersécurité. Elles énoncent trois principes à l’intention des fabricants de logiciels : prendre en charge les résultats de sécurité de leurs clients, adopter une transparence et une imputabilité radicales, et donner l’exemple au sommet de l’organisation. L’argument sous-jacent est que le fardeau de la sécurité repose de manière disproportionnée sur les clients, qui sont les moins aptes à le porter, et que les fabricants devraient éliminer des catégories entières de vulnérabilités — par exemple au moyen de langages sûrs sur le plan de la mémoire, de l’authentification multifacteur (AMF) activée par défaut et de la suppression des mots de passe par défaut — plutôt que de livrer des produits qui ne sont sécurisés que s’ils sont correctement configurés.

La plupart des organisations qui lisent ce manuel sont des clientes plutôt que des fabricants; la pertinence managériale tient donc à l’approvisionnement et au développement interne. Les orientations subséquentes Secure by Demand de la CISA (2024) aident les clients à poser les bonnes questions aux fournisseurs : comment ils authentifient les utilisateurs par défaut, s’ils publient des politiques de divulgation des vulnérabilités, si les journaux de sécurité sont fournis aux clients sans frais supplémentaires et s’ils peuvent fournir une nomenclature logicielle (SBOM). Ces questions ont leur place dans les processus d’évaluation des tiers décrits au chapitre 19, et le chapitre 14 applique le principe de la sécurité par défaut aux bases de référence de configuration. La réglementation évolue dans le même sens : le règlement européen sur la cyberrésilience (CRA), règlement (UE) 2024/2847, impose des exigences essentielles de cybersécurité aux produits comportant des éléments numériques vendus dans l’Union européenne; les obligations des fabricants en matière de signalement des vulnérabilités et des incidents s’appliquent à compter du 11 septembre 2026, et la plupart des autres obligations, à compter du 11 décembre 2027 (voir les chapitres 11 et 19). Les entreprises canadiennes qui vendent des logiciels ou des appareils connectés en Europe devraient considérer la sécurité par défaut comme une condition d’accès au marché, et non simplement comme une bonne pratique.

Le développement logiciel sécurisé en tant que processus gouverné

Lorsque l’organisation développe elle-même des logiciels — qu’il s’agisse d’un portail client, d’une intégration interne ou d’un produit commercial —, la sécurité dès la conception doit être intégrée au processus de développement. La publication NIST SP 800-218, le Secure Software Development Framework (SSDF, cadre de développement logiciel sécurisé) Version 1.1, parue en février 2022, est la référence la plus utilisée à cette fin. Elle regroupe les pratiques en quatre familles : préparer l’organisation, protéger le logiciel, produire un logiciel bien sécurisé et répondre aux vulnérabilités. La publication SP 800-218A (juillet 2024) complète le SSDF par un profil communautaire pour l’IA générative et les modèles de fondation à double usage, ce qui relie ce chapitre au chapitre 18. Au moment de la rédaction, une ébauche de la révision 1 (SSDF Version 1.2) publiée en décembre 2025 en était encore à l’étape de l’ébauche publique; les gestionnaires devraient en vérifier le statut avant de la citer dans un contrat.

La valeur du SSDF pour la gouvernance tient à ce qu’il est axé sur les résultats et neutre quant au cycle de vie : il ne prescrit aucune méthode, mais il donne aux acheteurs et aux fournisseurs un vocabulaire commun et donne à l’audit interne une base pour vérifier si le développement sécurisé est réellement pratiqué. Les faiblesses applicatives elles-mêmes sont répertoriées dans des références comme l’OWASP Top 10:2025, et les tests sont abordés au chapitre 8. Le propos architectural est plus étroit : l’organisation devrait déterminer quelles pratiques de développement sont obligatoires pour quelles catégories de systèmes, et en exiger la preuve avant qu’un système soit mis en production.

- La sécurité dès la conception est une décision de séquencement : elle déplace l’analyse de sécurité au moment où les changements coûtent le moins cher et où les options de conception sont les plus vastes.
- La sécurité par défaut est une décision de répartition du fardeau : elle confie la responsabilité d’une configuration sûre à la partie la plus apte à l’assumer, qu’il s’agisse d’un fournisseur ou d’une équipe de plateforme interne.
- Les deux exigent des éléments probants : des modèles de menaces, des revues de conception, des résultats de tests et des registres de configuration qui démontrent que les principes ont été appliqués, et non seulement approuvés.

## Cadres d’architecture d’entreprise et architecture de sécurité

L’architecture de sécurité n’existe pas en vase clos. La plupart des moyennes et grandes organisations pratiquent une forme d’architecture d’entreprise : une description structurée des capacités d’affaires, de l’information, des applications et de la technologie, assortie d’une méthode pour passer de l’état actuel à un état futur souhaité. L’architecture de sécurité est la plus efficace lorsqu’elle est intégrée à cette méthode plutôt que menée comme un exercice parallèle. Trois références sont particulièrement utiles pour les gestionnaires des technologies d’affaires : SABSA, TOGAF et Open Security Architecture.

SABSA : une architecture de sécurité guidée par les affaires

SABSA (à l’origine, Sherwood Applied Business Security Architecture) est une méthodologie d’élaboration d’architectures de sécurité guidées par les exigences d’affaires plutôt que par la technologie. Son idée centrale est que la sécurité devrait être justifiée par des liens traçables vers des attributs d’affaires — des qualités comme disponible, confidentiel, auditable, conforme ou protégé sur le plan de la réputation, dont l’entreprise a besoin pour un service. Au moyen d’une technique appelée profilage des attributs d’affaires, les parties prenantes définissent ce que chaque attribut signifie pour un service donné et la façon dont il sera mesuré, et chaque élément architectural est rattaché aux attributs qu’il soutient.

SABSA organise le travail en couches qui reflètent les questions posées par différentes parties prenantes : une couche contextuelle (le point de vue des affaires), une couche conceptuelle (le point de vue de l’architecte sur ce qui est nécessaire), une couche logique (le point de vue du concepteur), une couche physique (le point de vue du constructeur), une couche des composants (le point de vue de l’artisan sur des produits et des normes précis) et une couche transversale de gestion des services, qui porte sur l’exploitation du résultat. La force managériale de cette structure est sa traçabilité bidirectionnelle : un conseil d’administration peut demander pourquoi un contrôle existe et être ramené à un attribut d’affaires, et un ingénieur peut demander quel résultat d’affaires souffrirait si un composant faisait défaut. The SABSA Institute assure la tenue à jour de la méthodologie et de ses certifications.

TOGAF et la sécurité dans le cycle d’architecture d’entreprise

La norme TOGAF, tenue à jour par The Open Group, figure parmi les cadres d’architecture d’entreprise les plus utilisés. Son édition actuelle, la TOGAF Standard, 10th Edition, a été lancée en avril 2022 avec une structure modulaire qui sépare un corps stable de contenu fondamental de guides thématiques portant sur des sujets précis. Son noyau est la méthode de développement d’architecture (ADM), un cycle itératif qui passe de la vision de l’architecture aux architectures d’affaires, de données, d’applications et de technologie, puis aux occasions et solutions, à la planification de la migration, à la gouvernance de la mise en œuvre et à la gestion du changement d’architecture, le tout ancré dans la gestion des exigences.

L’importance de TOGAF pour la sécurité tient à ce qu’il fournit les mécanismes organisationnels — principes d’architecture, référentiel d’architecture, contrats d’architecture, revues de conformité et comité d’architecture — au sein desquels les exigences de sécurité peuvent être exprimées et appliquées. The Open Group a publié des orientations sur l’intégration de la sécurité et du risque dans l’ADM et, dès 2011, il a publié avec The SABSA Institute un livre blanc sur l’intégration de TOGAF et de SABSA, afin que la traçabilité des attributs d’affaires propre à SABSA puisse se déployer dans le cycle TOGAF. En pratique, les organisations qui utilisent déjà TOGAF ne devraient pas créer une méthode d’architecture de sécurité distincte; elles devraient plutôt s’assurer que les exigences de sécurité, l’analyse des menaces et l’acceptation des risques figurent à chaque phase pertinente de l’ADM et que le mandat du comité d’architecture comprend explicitement la sécurité.

Open Security Architecture et bibliothèques de patrons

Open Security Architecture (OSA) est une ressource communautaire, active depuis 2008 et récemment relancée sur une plateforme modernisée, qui publie des patrons d’architecture de sécurité et un catalogue de contrôles sous une licence ouverte Creative Commons. Ses patrons décrivent des situations courantes — infonuagique, gestion des identités, accès à distance, systèmes de contrôle industriels, environnements de paiement — ainsi que les contrôles et les mesures d’atténuation des menaces que chacune exige; son catalogue de contrôles est fondé sur la publication NIST SP 800-53 et mis en correspondance avec d’autres cadres comme la norme ISO/IEC 27001:2022, les CIS Controls et le NIST CSF 2.0.

Pour une organisation aux ressources limitées, une telle bibliothèque offre un point de départ déjà révisé et mis en correspondance avec les cadres sur lesquels les auditeurs posent des questions. Les architectures de référence et les cadres de bonne architecture des fournisseurs infonuagiques, ainsi que les orientations en matière d’architecture du Centre pour la cybersécurité, jouent un rôle semblable pour des plateformes particulières (voir le chapitre 15). La mise en garde de gouvernance est que les patrons externes doivent être adaptés à l’appétence pour le risque, au profil de menace et au contexte réglementaire de l’organisation. Un patron adopté sans adaptation devient une forme de conformité de façade : le schéma semble faire autorité, mais personne ne s’est demandé s’il traite les scénarios réels de l’organisation.

Choisir et combiner les cadres

Comme pour les cadres de contrôles présentés au chapitre 9, les organisations adoptent rarement un cadre d’architecture à l’état pur. Une combinaison courante et défendable utilise TOGAF, ou un équivalent interne plus léger, comme méthode d’architecture d’entreprise; la logique des attributs d’affaires de SABSA pour justifier et retracer les exigences de sécurité; et des patrons choisis provenant d’OSA, des fournisseurs infonuagiques et du Centre pour la cybersécurité comme point de départ des architectures de référence. La décision managériale la plus importante ne consiste pas à choisir quel cadre nommer, mais à déterminer si l’organisation dispose vraiment d’une méthode d’architecture, si la sécurité y est intégrée et si la méthode produit des décisions consignées, examinées et rattachées au risque.

## Les sept piliers architecturaux

Quel que soit le cadre qu’utilise une organisation, son architecture de sécurité se ramène en définitive à un nombre limité de capacités structurelles qui doivent être conçues, financées et gouvernées. Ce manuel les regroupe en sept piliers. Les piliers ne constituent pas un catalogue de contrôles; ce sont les grands domaines de décision architecturale dans lesquels l’appétence pour le risque de l’organisation se concrétise. Chaque pilier comporte des pratiques détaillées qui relèvent d’autres chapitres, et les sections qui suivent s’en tiennent délibérément au niveau de l’architecture : ce qui doit être décidé, qui devrait le décider et quels éléments probants devraient démontrer que la décision a été mise en œuvre.

La figure ci-dessous présente les sept piliers. Six d’entre eux sont des structures de protection et de détection. Le septième, l’architecture de résilience, est présenté comme la fondation sur laquelle reposent les autres, parce que c’est le pilier qui présume que les autres feront parfois défaut.

Figure 60 : les sept piliers de l’architecture de sécurité

Lire les piliers comme un système

Les piliers interagissent, et leur valeur réside dans cette interaction. L’identité détermine qui peut agir; la segmentation détermine ce qu’une identité ou un appareil compromis peut atteindre; les bases de référence déterminent dans quelle mesure un attaquant peut exploiter l’environnement une fois sur place; le chiffrement et la gestion des clés déterminent quelles données valent la peine d’être volées; la journalisation détermine si quelqu’un s’en aperçoit; et la résilience détermine si l’organisation peut se rétablir lorsque tout ce qui précède se révèle insuffisant. Une faiblesse dans un pilier peut parfois être compensée par la solidité d’un autre, et c’est précisément pourquoi l’architecture doit être gouvernée comme un tout. Une décision de reporter la segmentation, par exemple, accroît l’importance des contrôles d’identité et de la couverture de détection, et devrait être consignée comme telle.

Les piliers correspondent aussi à des cadres que les gestionnaires utilisent déjà : l’identité et les accès privilégiés, aux CIS Controls 5 et 6 et à la catégorie Gestion des identités, authentification et contrôle d’accès (PR.AA) du NIST CSF 2.0; les bases de référence, au CIS Control 4 et à PR.PS; la journalisation, au CIS Control 8 et à la fonction Détecter; la résilience, au CIS Control 11, à PR.IR et à la fonction Rétablir. L’organisation peut donc rendre compte de son architecture dans le langage du cadre qu’elle a choisi tout en la gouvernant comme un ensemble de programmes structurels.

Pilier 1 : architecture des identités et des accès privilégiés

L’identité est le plan de contrôle de la cybersécurité moderne. Dans les environnements infonuagiques, SaaS, de télétravail et hybrides, la frontière de sécurité la plus importante n’est plus le périmètre du réseau; c’est le modèle d’identité et d’autorisation. Bien des intrusions graves commencent par une compromission d’identité ou se transforment rapidement en problème d’accès privilégiés, et c’est pourquoi les organisations doivent gouverner l’identité comme une infrastructure critique plutôt que comme un simple service d’annuaire.

Les décisions architecturales de ce pilier sont peu nombreuses, mais lourdes de conséquences. L’organisation doit décider si elle exploitera un seul fournisseur d’identité faisant autorité ou si elle en tolérera plusieurs, et comment les partenaires externes et les clients seront fédérés. Elle doit fixer sa norme d’authentification, y compris les situations où l’authentification résistante à l’hameçonnage est obligatoire, conformément aux niveaux d’assurance de la publication NIST SP 800-63-4. Elle doit choisir un modèle d’autorisation — fondé sur les rôles, sur les attributs ou sur une combinaison des deux — qui puisse réellement être appliqué dans l’ensemble de ses systèmes. Elle doit décider comment les accès privilégiés seront séparés des accès ordinaires, si les privilèges seront permanents ou accordés juste-à-temps, comment les voies d’administration seront isolées et comment les identités non humaines, comme les comptes de service, les charges de travail et les agents d’IA, seront gouvernées. Enfin, elle doit décider comment l’identité elle-même sera rétablie si le fournisseur d’identité est compromis ou indisponible.

Les pratiques détaillées — processus d’arrivées, de mutations et de départs, revues des accès, outils de gestion des accès privilégiés, enregistrement des sessions, coffres-forts d’identifiants et procédures d’accès d’urgence — sont traitées au chapitre 10. Le point de contrôle architectural se résume à une seule question : pouvons-nous démontrer que les accès sont minimaux, auditables et difficiles à utiliser abusivement, en particulier pour les actions privilégiées? Si la conception des identités est faible, aucun outil pour les terminaux ni aucune politique ne pourra la compenser entièrement.

Pilier 2 : architecture de sécurité des terminaux et des charges de travail

Les terminaux (ordinateurs portables, postes de travail, appareils mobiles) et les charges de travail (serveurs, machines virtuelles, conteneurs, fonctions sans serveur) demeurent les endroits où le code s’exécute et où les attaquants prennent pied. L’architecture des terminaux et des charges de travail doit donc prévenir la compromission lorsque c’est possible, détecter de façon fiable les activités suspectes, permettre un confinement rapide et préserver l’information nécessaire aux enquêtes.

Ce pilier porte avant tout sur la normalisation et l’applicabilité, parce qu’une posture sécurisée est très difficile à maintenir dans un parc hétérogène et partiellement non géré. Les décisions architecturales portent sur les catégories d’appareils et de charges de travail que l’organisation prendra en charge, sur les outils de gestion et de télémétrie que chaque actif doit comporter avant de pouvoir se connecter aux ressources de l’entreprise, sur le degré de variation qui sera toléré et sur la façon dont les charges de travail seront construites — par exemple, à partir d’images minimales, durcies et tenues à jour de manière centralisée plutôt que de constructions improvisées. Pour les charges de travail infonuagiques natives, la décision s’étend à la question de savoir si les charges de travail sont traitées comme immuables, c’est-à-dire remplacées plutôt que corrigées, ce qui modifie à la fois le profil de risque et le modèle opérationnel (voir le chapitre 15).

Trois questions permettent de garder ce pilier honnête. Quelle proportion des terminaux et des charges de travail est réellement gérée selon une base de référence standard, et non simplement inventoriée? En combien de temps un terminal ou une charge de travail compromis peut-il être isolé sans paralyser le processus d’affaires qu’il soutient? L’organisation peut-elle produire sur demande des preuves de l’exécution des contrôles — état des correctifs, état du chiffrement, couverture de la détection et de l’intervention sur les terminaux (EDR) et mesures de confinement? L’ingénierie de la détection et les capacités d’intervention fondées sur cette télémétrie sont abordées au chapitre 8.

Pilier 3 : architecture de segmentation et de connectivité

La segmentation limite le rayon d’impact. Là où les contrôles d’identité déterminent qui peut faire quoi, la segmentation détermine ce qu’un système ou une identité compromis peut atteindre. Les deux sont nécessaires : quand l’un fait défaut, l’autre devrait empêcher un incident circonscrit de devenir une défaillance à l’échelle de l’entreprise. Dans des environnements dominés par les rançongiciels et les intrusions menées manuellement par des attaquants, la segmentation fait souvent la différence décisive entre ces deux issues.

La segmentation est souvent comprise à tort comme un ensemble de règles de pare-feu. Sur le plan architectural, il s’agit d’une stratégie qui définit des zones et des frontières de confiance, les flux autorisés entre elles et la surveillance requise à chaque frontière. Son but est d’empêcher le déplacement latéral et de protéger les actifs les plus précieux et les plus dangereux de l’organisation : l’infrastructure d’identité, les systèmes financiers et de paiement, les dépôts de données sensibles, les systèmes de sauvegarde, les plans de gestion infonuagiques et la technologie opérationnelle (voir le chapitre 11). Dans les conceptions modernes et infonuagiques, elle s’exerce de plus en plus au niveau des comptes, des charges de travail et des identités plutôt qu’à celui des plages réseau, et c’est là qu’elle converge avec la vérification systématique.

La segmentation est un sujet de gouvernance parce qu’elle suppose des compromis visibles. Des frontières solides créent des frictions opérationnelles, et les unités d’affaires peuvent résister à des changements qui rompent des intégrations établies de longue date. Les gestionnaires devraient donc traiter la segmentation comme une politique fondée sur les risques dans laquelle les actifs critiques justifient des frontières plus solides, et ils devraient recadrer le débat. La question pertinente n’est pas de savoir si la segmentation est contraignante, mais combien coûterait le déplacement latéral en cas de compromission — une question à laquelle les méthodes d’évaluation fondées sur des scénarios du chapitre 6 sont conçues pour répondre.

## Les piliers qui préservent la confiance : bases de référence, clés, journaux et reprise

Les trois premiers piliers déterminent qui peut agir et ce que chacun peut atteindre. Les quatre autres déterminent si l’environnement demeure dans l’état voulu par l’architecture, si les données les plus sensibles restent protégées même lorsque l’infrastructure est compromise, si l’organisation peut voir et prouver ce qui s’est passé, et si elle peut se rétablir. Ils sont moins visibles que l’identité ou la segmentation, et c’est pourquoi ils sont plus souvent sous-financés.

Pilier 4 : bases de référence de configuration sécurisée et durcissement

Les erreurs de configuration demeurent l’une des sources d’exposition les plus persistantes, tant dans les environnements sur site que dans le nuage. C’est rarement un problème de technologie; c’est un problème de discipline. Les bases de référence de configuration sécurisée apportent cette discipline en définissant une configuration minimale acceptable pour chaque catégorie d’actifs — terminaux, serveurs, appareils réseau, comptes et services infonuagiques, conteneurs et applications clés — et en rendant les écarts visibles.

Les décisions architecturales de ce pilier portent sur la façon d’exprimer et d’appliquer les bases de référence, et non sur les paramètres individuels. L’organisation doit décider quelles références externes serviront d’ancrage à ses bases de référence (par exemple, les CIS Benchmarks ou les bases de référence de sécurité des fournisseurs), qui est responsable de chaque base de référence, comment les bases de référence seront appliquées — de plus en plus au moyen de l’infrastructure en tant que code et de la politique en tant que code, afin que les environnements soient déployés de façon sécurisée par défaut plutôt que corrigés après coup — et comment la dérive sera détectée et corrigée. Le chapitre 14 traite en profondeur de la gouvernance des bases de référence, y compris l’adaptation, la gestion des exceptions et les éléments probants.

Les gestionnaires devraient éviter de confondre le fait d’avoir un document de base de référence avec celui d’exercer un contrôle sur la base de référence. L’exigence de gouvernance est la preuve : une couverture démontrable, une conformité mesurable et un processus d’exception maîtrisé. Une base de référence qui ne s’applique qu’à une partie du parc, ou qui ne peut pas être mesurée, est une déclaration d’intention plutôt qu’un contrôle.

Pilier 5 : architecture du chiffrement et de la gestion des clés

Le chiffrement est un mécanisme fondamental de confidentialité et, au moyen des signatures et de l’authentification des messages, d’intégrité. Pourtant, un chiffrement sans gestion rigoureuse des clés n’offre qu’un réconfort superficiel. La gestion des clés est l’endroit où la gouvernance échoue le plus souvent, parce qu’elle se situe à l’intersection des opérations, des services des fournisseurs infonuagiques, des tiers et des obligations juridiques.

Les décisions architecturales commencent par la classification des données et l’analyse des menaces : quelles données doivent être protégées, contre quels scénarios, et avec quelles conséquences si la protection échoue. À partir de là, l’organisation doit décider où le chiffrement est obligatoire (au repos, en transit et, de plus en plus, en cours d’utilisation pour les charges de travail les plus sensibles), qui contrôle les clés pour chaque catégorie de données (gérées par le fournisseur, gérées par le client ou détenues par le client), où les clés sont stockées et avec quelle protection matérielle, comment l’administration des clés est séparée de l’administration des données, et comment les clés sont sauvegardées et récupérées. Une décision architecturale plus récente porte sur l’agilité cryptographique : les systèmes sont-ils conçus de manière que les algorithmes puissent être remplacés sans refonte, ce qui importe pour la transition vers la cryptographie post-quantique? Le chapitre 20 développe ces sujets en termes de gestion.

Les gestionnaires devraient exiger de la clarté quant à la propriété des clés, la séparation des tâches pour les administrateurs de clés, la journalisation de l’utilisation des clés et des procédures de récupération testées. Un contre-modèle courant consiste à imposer le chiffrement de façon généralisée sans gérer le cycle de vie des clés. Il en résulte une fragilité cachée : pendant un incident, une organisation peut découvrir qu’elle ne peut pas récupérer ses propres données parce que les clés, ou les personnes qui les comprenaient, ne sont plus disponibles.

Pilier 6 : architecture de journalisation, surveillance et éléments probants

Si la gouvernance est une affaire d’imputabilité, la journalisation en est le fondement technique. Sans journaux de grande qualité et sans une architecture qui les recueille, les protège et les analyse, les organisations ne peuvent pas détecter de façon fiable les intrusions, enquêter sur les incidents, respecter les obligations de notification prévues par des lois comme la Loi 25 du Québec ou la LPRPDE, ni démontrer le fonctionnement des contrôles aux auditeurs. Les journaux sont aussi la matière première des mesures crédibles dont la haute direction a besoin.

L’architecture de journalisation ne se résume pas à « activer les journaux ». C’est une conception qui précise ce qui doit être journalisé et à quel niveau de détail, comment les journaux sont centralisés, comment ils sont protégés contre l’altération et la suppression, combien de temps ils sont conservés, comment ils alimentent la détection et qui peut y accéder. Les sources les plus précieuses sont généralement les événements d’identité et d’authentification, les actions privilégiées, les modifications administratives, l’activité du plan de contrôle infonuagique, la télémétrie des terminaux et des charges de travail, le trafic aux frontières et les journaux des services de sécurité eux-mêmes. Les décisions architecturales portent sur les priorités de couverture, la plateforme centrale, une durée de conservation alignée sur les besoins juridiques et d’enquête, et la séparation entre le stockage des journaux et les systèmes journalisés, afin qu’un attaquant qui compromet un système ne puisse pas effacer la trace de son passage.

La journalisation coûte cher à grande échelle et doit être priorisée en fonction du risque. La question managériale est de savoir si une couverture existe pour les actifs et les plans de contrôle dont la compromission serait catastrophique, et si des éléments probants auditables peuvent être produits sur demande. Les opérations et l’ingénierie de la détection qui exploitent ces journaux sont traitées aux chapitres 7 et 8.

Pilier 7 : architecture de résilience

Bien des organisations traitent encore la résilience comme une question de continuité des TI et la sécurité comme une question de prévention. Cette séparation est une erreur de gouvernance. Face aux rançongiciels, aux attaques destructrices, aux compromissions de la chaîne d’approvisionnement et aux intrusions persistantes, la prévention finira par échouer quelque part. Ce qui distingue les organisations matures, c’est la capacité de rétablir les services critiques dans les limites de tolérance que les responsables des affaires ont définies à l’avance.

L’architecture de résilience comprend des sauvegardes isolées et immuables, des mécanismes de restauration qui fonctionnent à l’échelle requise, une redondance pour les systèmes critiques et la cartographie des dépendances qui révèle quels services ne peuvent pas être restaurés avant que d’autres le soient. Ses décisions architecturales portent sur les délais de reprise visés et les points de reprise visés pour chaque service critique, sur le degré d’isolement entre les environnements de production et de sauvegarde, sur la conception d’un environnement de reprise digne de confiance après une compromission et sur la reprise de l’identité elle-même, sans laquelle rien d’autre ne peut être restauré. Les dépendances infonuagiques exigent elles aussi des décisions explicites : que se passe-t-il si une région tombe en panne, si un service d’un fournisseur se dégrade ou si une erreur de configuration se propage d’un environnement à l’autre?

Le livrable central de ce pilier n’est pas un document de plan, mais une capacité de reprise démontrable dans des conditions réalistes. Les gestionnaires devraient exiger une validation fondée sur des scénarios, y compris des tests de restauration technique et des exercices, parce qu’une résilience qui n’a pas été testée est souvent fictive. Le chapitre 12 traite de façon complète de la gestion des incidents, de la continuité des activités et de la résilience; la publication NIST SP 800-160 Vol. 2 Rev. 1 présente le point de vue de l’ingénierie sur la conception axée sur la cyberrésilience.

Chaque pilier se ramène à une seule question de gouvernance : pouvons-nous démontrer, preuves à l’appui, que la décision architecturale a été mise en œuvre dans les actifs qui comptent le plus?

## L’architecture à vérification systématique en tant que concept de gouvernance

Peu de termes en cybersécurité ont été autant étirés que celui de vérification systématique (zero trust). On l’emploie pour décrire des produits, des programmes, des conceptions de réseau et des aspirations, souvent dans la même présentation. Pour les gestionnaires, l’approche utile consiste à revenir aux définitions de référence, à traiter la vérification systématique comme un ensemble de principes architecturaux et une orientation pluriannuelle, et à la gouverner en conséquence. La vérification systématique n’est pas quelque chose qu’une organisation achète; c’est quelque chose qu’elle devient progressivement.

Ce que dit réellement la publication NIST SP 800-207

La publication NIST SP 800-207, Zero Trust Architecture, parue en août 2020, demeure la référence fondamentale. Elle définit la vérification systématique comme « un ensemble de concepts et d’idées conçus pour réduire au minimum l’incertitude dans l’application de décisions d’accès précises, fondées sur le moindre privilège et prises requête par requête, dans les systèmes et services d’information, face à un réseau considéré comme compromis ». Une architecture à vérification systématique est, selon les termes du NIST, « le plan de cybersécurité d’une entreprise qui utilise les concepts de vérification systématique et qui englobe les relations entre les composants, la planification des flux de travail et les politiques d’accès ». Le changement central est l’abandon de la confiance implicite fondée sur l’emplacement dans le réseau : le fait de se trouver « à l’intérieur » du réseau de l’entreprise ne confère plus d’accès.

La publication SP 800-207 énonce un petit nombre de principes qui sont utiles à la gouvernance précisément parce qu’ils sont neutres sur le plan technologique. Chaque source de données et chaque service informatique est considéré comme une ressource. Les communications doivent être protégées, qu’elles proviennent de l’intérieur ou de l’extérieur du réseau de l’entreprise. L’accès à chaque ressource est accordé par session, sur la base d’une politique dynamique qui tient compte de l’identité du demandeur, de l’état de l’appareil, de la sensibilité de la ressource et d’autres attributs comportementaux et environnementaux. L’entreprise surveille l’intégrité et la posture de sécurité de tous les actifs qu’elle possède, applique dynamiquement l’authentification et l’autorisation avant l’accès, et recueille le plus d’information possible sur l’état actuel de ses actifs et de ses communications afin d’améliorer sa posture de sécurité. Sur le plan architectural, ces principes se concrétisent au moyen d’un point de décision de politique — un moteur de politiques et un administrateur de politiques qui évaluent chaque requête — et de points d’application de politique qui autorisent ou refusent la connexion.

Le NIST a depuis ajouté des orientations de mise en œuvre. La publication SP 800-207A (septembre 2023) porte sur le contrôle d’accès pour les applications infonuagiques natives dans des environnements multisites et multinuages, et la publication SP 1800-35, Implementing a Zero Trust Architecture, publiée par le National Cybersecurity Center of Excellence en juin 2025, documente 19 exemples de mise en œuvre réalisés avec des technologies commerciales provenant d’une vingtaine de fournisseurs. Cette dernière est particulièrement instructive pour les gestionnaires, car elle montre que toute mise en œuvre pratique de la vérification systématique combine plusieurs produits et que c’est l’intégration, et non l’acquisition, qui constitue la partie difficile.

Le modèle de maturité de la vérification systématique de la CISA comme feuille de route

Si la publication SP 800-207 explique ce qu’est la vérification systématique, le Zero Trust Maturity Model (ZTMM, modèle de maturité de la vérification systématique) Version 2.0 de la CISA, publié en avril 2023, aide les organisations à planifier la façon d’y parvenir. Il organise la vérification systématique en cinq piliers — Identité, Appareils, Réseaux, Applications et charges de travail, et Données — appuyés par trois capacités transversales : Visibilité et analytique, Automatisation et orchestration, et Gouvernance. Chaque pilier est décrit selon quatre stades de maturité : Traditionnel, Initial, Avancé et Optimal. La version 2.0 a ajouté le stade Initial pour reconnaître que la plupart des organisations commencent par des étapes graduelles et en partie manuelles plutôt que par un bond vers une automatisation sophistiquée.

La figure ci-dessous présente ce parcours de maturité en termes de gestion. Sa valeur pour la gouvernance est qu’il transforme un principe abstrait en une suite d’états observables qui peuvent être évalués, financés et faire l’objet d’une reddition de comptes. Un conseil d’administration n’a pas besoin de comprendre les points d’application de politique pour comprendre que le pilier Identité est passé du stade Initial au stade Avancé, ou que le pilier Données demeure au stade Traditionnel et constitue donc la priorité du prochain cycle budgétaire.

Figure 61 : un parcours de maturité de la vérification systématique fondé sur le modèle de la CISA

Deux caractéristiques du ZTMM méritent d’être soulignées. Premièrement, la gouvernance est l’une de ses trois capacités transversales : la CISA s’attend à ce que les politiques, les rôles et leur application gagnent en maturité en même temps que la technologie, et non après. Deuxièmement, les piliers n’ont pas à progresser au même rythme. Une organisation peut raisonnablement atteindre le stade Avancé pour l’identité tout en demeurant au stade Initial pour les données, pourvu que ce choix soit délibéré, lié à des scénarios de risque et consigné. L’erreur consiste à déclarer qu’une organisation est « à vérification systématique » parce qu’un seul pilier a progressé.

Les pièges de gouvernance

Les programmes de vérification systématique échouent de manières reconnaissables, et la plupart de ces échecs sont des échecs de gouvernance plutôt que des échecs techniques.

- La vérification systématique comme produit : considérer l’achat d’une seule plateforme, souvent un courtier d’accès ou un produit réseau, comme la réalisation de la vérification systématique. Les orientations du Centre pour la cybersécurité mettent explicitement en garde contre les fournisseurs qui affirment qu’un seul produit peut assurer une vérification systématique complète.
- La vérification systématique comme slogan : annoncer une stratégie de vérification systématique sans évaluation de l’état actuel, sans maturité cible par pilier, sans feuille de route financée ni mesures, ce qui transforme une orientation architecturale en conformité de façade.
- La vérification systématique sans hygiène des identités : investir dans des politiques d’accès dynamiques alors que les accès privilégiés demeurent permanents, que les comptes de service ne sont pas gérés et que l’authentification multifacteur est incomplète; une politique dynamique ne vaut que ce que valent les identités qu’elle évalue.
- La vérification systématique sans inventaire des actifs et des données : des décisions prises requête par requête qui tiennent compte de la sensibilité des ressources sont impossibles si l’organisation ne sait pas quelles sont ses ressources ni quel est leur degré de sensibilité.
- La vérification systématique sans modèle d’exceptions : les systèmes patrimoniaux, la technologie opérationnelle et les intégrations avec des partenaires qui ne peuvent satisfaire aux exigences de la vérification systématique sont laissés sans documentation au lieu d’être isolés et consignés comme exceptions assorties de dates d’échéance.
La vérification systématique dans le contexte canadien

Pour les organisations canadiennes, la publication du Centre pour la cybersécurité intitulée Approche de sécurité à vérification systématique (ITSM.10.008), parue en mars 2023, complète utilement les références du NIST et de la CISA. Elle désigne la prévention du déplacement latéral comme le but premier de la vérification systématique, recommande une adoption graduelle selon un modèle hybride qui coexiste avec les défenses périmétriques existantes, associe la vérification systématique à une gestion de la sécurité fondée sur les risques et décrit franchement les obstacles : technologies patrimoniales incompatibles, frictions pour les utilisateurs, coûts, rareté des compétences et transitions qui se mesurent en années. Elle signale aussi que le gouvernement du Canada élabore son propre cadre de vérification systématique, aligné sur ceux du NIST et de la CISA. Aux États-Unis, les organismes fédéraux sont orientés vers la vérification systématique depuis le mémorandum M-22-09 de l’OMB (janvier 2022); les fournisseurs canadiens de clients du secteur public américain se verront donc imposer ces attentes dans leurs contrats.

La conclusion managériale est la même dans toutes ces sources. La vérification systématique se gouverne le mieux comme un programme architectural pluriannuel, assorti d’une maturité cible par pilier, financé par étapes, mesuré au moyen de critères observables et présenté au conseil d’administration comme toute autre transformation stratégique.

## La modélisation des menaces en tant que contrôle de gestion

Les décisions d’architecture ne valent que ce que vaut l’analyse qui les éclaire. La modélisation des menaces est l’analyse structurée de la conception d’un système afin de déterminer ce qui pourrait mal tourner, de quelle façon, et ce qu’il faudrait faire à ce sujet, avant que le système soit construit ou modifié. On la présente souvent comme une pratique technique destinée aux spécialistes de la sécurité, et ses techniques sont effectivement techniques. Son importance pour la gouvernance tient toutefois à ce qu’elle est le moment où une conception précise est confrontée à des menaces précises, et le moment où les décisions de risque au niveau de la conception deviennent explicites.

Quatre questions et quelques méthodes

Le cadrage le plus accessible est celui des quatre questions associé à Adam Shostack et repris dans le Threat Modeling Manifesto communautaire (2020) : Sur quoi travaillons-nous? Qu’est-ce qui peut mal tourner? Qu’allons-nous faire à ce sujet? Avons-nous fait un travail suffisant? Chacune a son pendant managérial : la première exige un modèle exact du système et de ses flux de données, ce qui manque à bien des projets; la deuxième est l’analyse des menaces proprement dite; la troisième produit des modifications de conception, des contrôles compensatoires ou une acceptation explicite du risque; et la quatrième demande si l’analyse était adéquate compte tenu de la criticité du système.

Plusieurs méthodes aident à répondre à la deuxième question. STRIDE, élaborée chez Microsoft, amène les analystes à envisager, pour chaque élément d’une conception, l’usurpation d’identité, l’altération, la répudiation, la divulgation d’information, le déni de service et l’élévation de privilèges. LINDDUN applique une approche semblable aux menaces pour la vie privée, ce qui la rend utile en complément des évaluations des facteurs relatifs à la vie privée exigées par la Loi 25 (voir le chapitre 16). PASTA propose un processus en plusieurs étapes, davantage centré sur le risque; les arbres d’attaque décomposent l’objectif d’un attaquant en chemins possibles; et MITRE ATT&CK fournit un catalogue de techniques d’adversaires observées qui ancre l’analyse dans des comportements réels. Les gestionnaires n’ont pas besoin de choisir en détail parmi ces méthodes. Ils doivent s’assurer qu’une méthode est choisie, appliquée de façon cohérente et adaptée à l’importance du système.

Rendre la modélisation des menaces gouvernable

La modélisation des menaces devient un contrôle de gestion lorsqu’elle est obligatoire, proportionnée et documentée par des éléments probants. Elle devrait être exigée à des moments définis : lorsqu’un nouveau système ou un changement important est proposé, lorsqu’un système franchit une frontière de confiance ou commence à traiter des données plus sensibles, lorsqu’un nouveau fournisseur ou une nouvelle intégration est introduit, et après un incident important qui révèle que des hypothèses antérieures étaient erronées. Elle devrait être proportionnée : un exercice léger d’une heure peut suffire pour un outil interne à faible impact, alors qu’une plateforme de paiement ou un système qui contrôle des processus physiques justifie une analyse plus approfondie et documentée. Et elle devrait être documentée : le résultat est un court dossier décrivant le modèle du système, les menaces envisagées, les décisions prises ainsi que les risques résiduels acceptés et par qui.

Il existe un lien naturel entre la modélisation des menaces et les évaluations des risques fondées sur des scénarios des chapitres 5 et 6. Les scénarios de risque d’entreprise décrivent ce que l’organisation craint sur le plan stratégique, comme un rançongiciel qui perturbe les activités cliniques ou une violation de données chez un fournisseur clé. Les modèles de menaces décrivent comment un système particulier pourrait contribuer à ces scénarios. Lorsque les deux sont reliés, chaque décision prise au niveau d’un système peut être rattachée à un risque d’entreprise, et chaque risque d’entreprise peut être rattaché aux décisions de conception qui le traitent. Des outils comme CyberRiskGuardian peuvent aider à maintenir cette traçabilité en reliant la chaîne causale de chaque scénario à ses mesures de traitement et aux indicateurs clés de risque (ICR) qui les surveillent.

- Obligatoire : la modélisation des menaces est un point de contrôle obligatoire pour des catégories de changements définies, et non une activité discrétionnaire.
- Proportionnée : sa profondeur varie selon la criticité du système, la sensibilité des données et l’exposition.
- Documentée : chaque modèle de menaces produit un court dossier conservé, qu’un auditeur ou un enquêteur en cas d’incident peut consulter.
- Reliée : les menaces importantes et les risques résiduels acceptés sont versés au registre des risques et transmis au responsable du risque imputable.

## Architectures de référence et patrons

Si chaque projet concevait sa sécurité à partir de principes fondamentaux, l’architecture serait lente, incohérente et coûteuse. Les architectures de référence et les patrons de sécurité résolvent ce problème en consignant des conceptions approuvées pour des situations récurrentes — une application Web destinée à la clientèle, une plateforme d’analytique de données, une voie d’administration à distance, une intégration avec un partenaire, l’adoption d’un service SaaS — afin que les projets puissent les réutiliser plutôt que de les réinventer.

Les patrons comme voie tracée

Une architecture de référence décrit les composants, les frontières de confiance, les flux de données et les contrôles obligatoires pour une catégorie de systèmes. Un patron est une solution plus petite et réutilisable à un problème de conception précis, par exemple la façon d’exposer un service interne à un partenaire, de stocker des secrets ou d’authentifier une charge de travail auprès d’un service infonuagique. Dans les organisations dotées d’une ingénierie de plateforme mature, ces éléments sont de plus en plus mis en œuvre sous forme de gabarits, de modules et de chaînes de déploiement — ce qu’on appelle parfois une voie tracée (paved road) —, de sorte que la façon sécurisée de construire soit aussi la plus facile.

Les avantages pour la gouvernance sont considérables. Les patrons réduisent l’effort de conception et les délais de livraison, en éliminant une grande partie des frictions qui font paraître la sécurité comme un obstacle. Ils rendent l’assurance moins coûteuse, parce qu’une conception conforme peut être examinée rapidement en concentrant l’attention sur les écarts. Ils rendent les mesures possibles, parce que l’organisation peut mesurer combien de systèmes sont bâtis sur des patrons approuvés. Et ils incarnent la sécurité par défaut à l’interne : l’équipe de plateforme règle la sécurité une fois pour toutes, plutôt que chaque projet en porte le fardeau à répétition.

Gouverner le cycle de vie des patrons

Les patrons sont des actifs et, comme tous les actifs, ils doivent avoir un responsable et être tenus à jour. Un patron qui était sécurisé il y a trois ans peut aujourd’hui reposer sur des protocoles désuets, des composants qui ne sont plus pris en charge ou des hypothèses qui ne tiennent plus. Chaque patron devrait donc avoir un responsable désigné, une version, une date de revue, une correspondance avec les contrôles et les cadres auxquels il satisfait, et un registre des systèmes qui l’utilisent, afin que l’organisation sache quels systèmes sont touchés lorsqu’un patron change.

L’organisation doit aussi décider comment les patrons deviennent obligatoires. Une approche judicieuse distingue les patrons exigés (par exemple, la voie approuvée pour l’administration privilégiée), les patrons privilégiés dont on peut s’écarter moyennant une justification, et les patrons proposés à titre indicatif. Les dérogations aux patrons exigés sont des exceptions et devraient être gouvernées comme telles, et les patrons externes ne devraient être adoptés qu’après avoir été adaptés à l’appétence pour le risque, aux obligations et au parc technologique de l’organisation.

## Gouvernance de l’architecture : comités d’examen, autorité de conception et décisions

Pour être gouvernable, l’architecture de sécurité a besoin d’un modèle opérationnel : un ensemble défini de rôles, d’instances, de droits décisionnels, d’artefacts et de boucles de rétroaction. Sans modèle, l’architecture devient un conseil que les projets peuvent ignorer; avec un modèle trop lourd, elle devient un goulot d’étranglement que les projets apprennent à contourner. La figure ci-dessous résume un modèle opérationnel qui équilibre l’autorité et la fluidité.

Figure 62 : un modèle opérationnel pour la gouvernance de l’architecture

Autorité de conception et comités d’examen de l’architecture

Une autorité de conception est le rôle ou l’instance habilité à établir les normes d’architecture, à approuver les conceptions au regard de ces normes et à trancher — ou à faire remonter la question — lorsqu’une conception s’en écarte. Dans les petites organisations, il peut s’agir d’une seule personne architecte principale disposant d’un mandat clair du DPI et du CSI; dans les grandes, c’est généralement un comité d’examen de l’architecture (ARB) qui réunit des architectes d’entreprise, de sécurité, d’infrastructure, de données et d’applications, souvent avec une représentation de la gestion des risques et de la protection de la vie privée. L’architecture de sécurité devrait soit siéger au comité d’examen de l’architecture de l’entreprise avec une autorité explicite sur les questions de sécurité, soit fonctionner comme une autorité de conception de la sécurité dont le comité est tenu de respecter les décisions.

Le mandat du comité compte davantage que sa composition. Il devrait préciser quels changements doivent faire l’objet d’un examen, les critères au regard desquels les conceptions sont évaluées, le pouvoir du comité d’approuver, d’approuver sous conditions ou de rejeter, la voie de remontée lorsqu’un promoteur d’affaires est en désaccord, et les niveaux de service auxquels le comité s’engage afin que les équipes de réalisation puissent planifier. Il devrait aussi indiquer clairement que le comité n’accepte pas de risque résiduel au nom des unités d’affaires. Lorsqu’une conception ne peut satisfaire à une exigence, le rôle du comité est de décrire clairement le risque qui en découle; la décision de l’accepter appartient au responsable du risque imputable, dans les limites de l’appétence pour le risque et de la délégation de pouvoirs décrites au chapitre 4.

Intégrer l’architecture à la réalisation

Un examen de l’architecture qui n’a lieu qu’à la fin d’un projet arrive presque toujours trop tard; à ce stade, le choix se résume à accepter une conception déficiente ou à retarder un lancement. Les organisations efficaces intègrent l’architecture à plusieurs moments : à l’accueil de la demande, où un bref triage détermine si un changement est assez important pour être examiné et quels patrons s’appliquent; à la conception, où le modèle de menaces et l’architecture de la solution sont examinés; avant la mise en production, où des preuves d’ingénierie confirment que la conception approuvée a bien été réalisée; et après la mise en service, où la surveillance et l’examen périodique détectent les écarts par rapport à la conception approuvée.

Dans les environnements agiles et DevOps, ces points de contrôle doivent être légers et en grande partie automatisés. Des patrons mis en œuvre sous forme de code, des vérifications de politique en tant que code dans les chaînes de déploiement et la collecte automatisée de preuves permettent à la plupart des changements d’avancer sans même qu’il soit nécessaire de convoquer le comité. L’attention du comité est alors réservée aux conceptions nouvelles, aux écarts importants et aux systèmes à fort impact. C’est là le compromis essentiel : plus l’organisation investit dans des voies tracées et des garde-fous automatisés, moins elle doit compter sur l’examen manuel, et plus sa capacité d’examen peut se concentrer là où le risque est le plus élevé.

Fiches de décision d’architecture

Les décisions d’architecture sont souvent prises en réunion et ne restent que dans la mémoire des personnes présentes. Lorsque ces personnes partent, l’organisation perd le raisonnement qui sous-tend sa structure et reprend de vieux débats ou, pire, renverse de bonnes décisions sans comprendre pourquoi elles avaient été prises. Une fiche de décision d’architecture (ADR) est un document court et structuré qui consigne une seule décision importante : le contexte, les options envisagées, la décision prise, sa justification, ses conséquences (y compris ses conséquences en matière de sécurité et de risque) et la personne qui l’a prise.

Les ADR sont un artefact de gouvernance léger, mais puissant. Elles fournissent la piste d’audit qui montre que les décisions de conception ont été délibérées et éclairées par les risques, ce que recherchent les organismes de réglementation et les auditeurs en vertu de la ligne directrice B-13 du BSIF ou de la norme ISO/IEC 27001. Après un incident, elles distinguent un risque connu et accepté en toute connaissance de cause d’un risque qui n’a jamais été envisagé — une distinction qui importe beaucoup pour l’imputabilité et pour le caractère défendable de la conduite de la direction. Une bonne ADR tient en une ou deux pages; la rigueur consiste à la rédiger au moment où la décision est prise, et non à la reconstituer après coup.

Exceptions à échéance

Les exceptions sont inévitables. Les systèmes patrimoniaux ne peuvent pas toujours satisfaire aux normes actuelles, les fournisseurs imposent des contraintes et l’urgence d’affaires justifie parfois un écart temporaire. Ce qui détruit l’architecture, ce ne sont pas les exceptions, mais les exceptions non gérées : des écarts accordés de manière informelle, jamais consignés, jamais réexaminés et, finalement, oubliés jusqu’à ce qu’un incident les mette au jour.

Un processus d’exception crédible est directement lié à l’appétence pour le risque. Chaque exception devrait consigner l’exigence dont on s’écarte, la raison, le risque qui en découle décrit sous forme de scénario, les contrôles compensatoires, le responsable du risque imputable qui accepte le risque résiduel, l’autorité d’approbation (qui devrait s’élever avec l’ampleur du risque) ainsi qu’une date d’échéance assortie d’un plan de mesures correctives. Les exceptions qui créeraient un risque résiduel au-delà de la tolérance ne doivent être approuvées à aucun niveau inférieur à celui qui est autorisé à accepter un tel risque, et certaines ne devraient pas être approuvées du tout. Le registre des exceptions devrait être présenté à la haute direction sous forme de portefeuille : combien d’exceptions existent, combien sont échues sans mesures correctives, quels systèmes en comptent le plus et si la tendance s’améliore. Le chapitre 14 applique la même rigueur aux bases de référence de configuration.

Une exception sans responsable, sans contrôle compensatoire et sans date d’échéance n’est pas une exception; c’est une modification non documentée de l’appétence pour le risque de l’organisation.

## La dette technique comme risque de cybersécurité

Toute organisation porte une dette technique : le coût accumulé des raccourcis de conception passés, des mises à niveau reportées, des plateformes non prises en charge, des intégrations non documentées et des solutions de contournement expéditives devenues permanentes. La dette de sécurité est la portion de cette dette qui accroît l’exposition aux cyberrisques. Contrairement à la dette financière, elle figure rarement au bilan, et ses intérêts se paient sous des formes difficiles à percevoir tant que rien ne tourne mal : application d’urgence de correctifs, contrôles compensatoires, intervention en cas d’incident plus lente, audits échoués et, au bout du compte, incidents dont l’impact est amplifié par les faiblesses que la dette a créées.

Comment la dette de sécurité s’accumule

La dette de sécurité s’accumule de façons prévisibles : des systèmes arrivent en fin de soutien alors qu’ils font encore tourner des processus critiques; des exceptions sont accordées et jamais fermées; des acquisitions apportent des environnements jamais intégrés à la gestion des identités, à la journalisation ou à l’architecture de référence de l’organisation; des projets sont livrés avec des faiblesses connues sur la promesse d’une correction qui n’est jamais financée; et l’adoption du nuage devance ses garde-fous. Chaque décision a pu être raisonnable sur le moment. Le problème, c’est que la dette fait boule de neige, et que son effet global sur le profil de risque est rarement évalué.

L’architecture est à la fois une cause et un remède de la dette de sécurité. Une architecture déficiente ou absente engendre de la dette, parce que chaque projet résout les mêmes problèmes différemment. Une bonne architecture prévient la nouvelle dette en orientant les projets vers des patrons approuvés et fournit l’état cible au regard duquel la dette existante est mesurée; sans elle, une organisation ne peut même pas dire combien de dette elle porte.

Rendre la dette visible et gouvernable

La première étape de gouvernance consiste à traiter la dette de sécurité importante comme un risque et à l’inscrire au registre des risques, et non simplement dans un carnet de travail d’ingénierie. Chaque élément devrait être décrit sous forme de scénario — ce qui pourrait arriver, quelle en est la vraisemblance et ce que cela coûterait — afin de pouvoir le comparer aux autres risques et l’ordonner en conséquence. Des systèmes d’exploitation non pris en charge sur un réseau de production, une application patrimoniale incapable d’utiliser l’authentification moderne ou une filiale acquise qui partage encore des identifiants d’administration ne sont pas des curiosités techniques; ce sont des scénarios de risque ouverts qui ont des responsables.

La deuxième étape consiste à mesurer la dette et ses intérêts. Parmi les indicateurs utiles figurent le nombre d’actifs exécutant des logiciels non pris en charge, le nombre d’exceptions d’architecture ouvertes et échues, la proportion de systèmes critiques qui ne reposent pas encore sur des patrons approuvés, le coût des contrôles compensatoires maintenus uniquement en raison de contraintes patrimoniales et le temps nécessaire pour corriger les vulnérabilités critiques des systèmes patrimoniaux comparativement aux systèmes modernes. Suivis dans le temps, ces indicateurs deviennent des indicateurs clés de risque qui disent aux dirigeants si l’organisation rembourse sa dette ou l’alourdit.

Rembourser la dette : la logique d’investissement

Les gestionnaires perçoivent souvent l’établissement du budget de cybersécurité comme ambigu, parce que la sécurité semble n’avoir aucune limite naturelle. L’architecture réduit cette ambiguïté en transformant l’investissement en un portefeuille de capacités structurelles qui réduisent chacune de vastes catégories de risques. Le but n’est pas de tout acheter, mais de bâtir une capacité de protection durable là où elle importe le plus et d’éliminer la dette qui accroît le plus l’exposition.

Pour de nombreuses organisations, une séquence pratique commence par l’identité et l’accès privilégié, parce qu’une compromission à ce niveau se répercute partout. Elle aborde ensuite le durcissement de la base de référence et la rigueur de la correction des vulnérabilités, parce que les erreurs de configuration et l’exploitation de faiblesses connues sont des modes de défaillance persistants. Elle renforce la journalisation et la surveillance pour améliorer la détection et la capacité de produire des preuves, accroît la segmentation pour réduire le rayon d’impact, et valide la résilience et la reprise, parce que la capacité de reprise est l’ultime mesure de protection contre les issues catastrophiques. Le retrait ou l’isolement des systèmes non pris en charge se déroule en parallèle de cette séquence plutôt qu’après elle. L’ordre n’est pas universel et doit être adapté au secteur, aux dépendances et au profil de menace — un environnement de technologie opérationnelle ou un hôpital peut devoir donner la priorité plus tôt à la segmentation et à la résilience —, mais le principe directeur tient. L’investissement architectural est la façon dont une organisation convertit une appétence pour le risque abstraite en choix défendables, et la réduction de la dette devrait être financée comme une réduction du risque, et non traitée comme un entretien discrétionnaire. Le chapitre 17 présente les outils économiques permettant de défendre ce point de vue.

## Mesurer l’architecture et l’aligner sur les normes

Ce qui n’est pas mesuré est rarement gouverné. L’architecture a toujours été difficile à mesurer, parce que ses extrants — conceptions, principes, patrons — ne sont pas manifestement quantifiables. La solution consiste à mesurer l’architecture par ses effets sur l’environnement : la couverture, la conformité et les résultats.

Mesures et indicateurs clés de risque

Les mesures d’architecture devraient être axées sur la couverture et les résultats plutôt que sur l’activité. Le nombre d’examens de conception réalisés en dit peu; la proportion de systèmes critiques bâtis sur des patrons approuvés en dit long. Les mesures utiles peuvent être organisées par pilier et selon les processus de gouvernance décrits plus haut dans ce chapitre.

Domaine

Exemple d’indicateur

Ce qu’il indique aux dirigeants

Identité et accès privilégié

Part des comptes privilégiés soumis à un contrôle juste-à-temps ou placés en coffre-fort

Si l’accès le plus dangereux est encadré

Bases de référence et charges de travail

Part des actifs critiques dont la conformité à une base de référence est imposée et surveillée

Si la configuration prévue se maintient réellement

Segmentation

Part des systèmes « joyaux de la couronne » (actifs critiques) isolés dans des zones définies

Si le rayon d’impact est limité là où cela compte

Journalisation

Couverture des journaux du plan de contrôle et des identités pour les services critiques

Si les incidents peuvent être détectés et faire l’objet d’une enquête

Résilience

Tests de restauration réussis dans les limites du RTO pour les services critiques

Si la reprise est réelle ou simplement présumée

Gouvernance de l’architecture

Exceptions ouvertes, échues et à risque élevé; part des systèmes reposant sur des patrons approuvés

Si l’architecture tient bon ou s’érode

Vérification systématique

Stade de maturité par pilier du ZTMM par rapport à la cible

Si la transformation progresse comme prévu

Ces indicateurs devraient être assortis de seuils qui reflètent la tolérance au risque, de sorte qu’une détérioration attire l’attention avant de se transformer en incident. Ils devraient aussi être présentés sous une forme qui les rattache aux scénarios de risque que le conseil d’administration connaît déjà. Un rapport hypothétique indiquant que la couverture de segmentation des systèmes cliniques est passée de 40 % à 85 % a beaucoup plus de sens lorsqu’il est présenté avec le scénario de rançongiciel qu’il traite et la réduction estimée de l’impact de ce scénario.

Les normes fournissent le langage, l’architecture fournit la structure

Les normes comme l’ISO/IEC 27001 et l’ISO/IEC 27002, les cadres comme le NIST CSF 2.0 et la publication NIST SP 800-53 Rev. 5, et les mesures de protection priorisées comme les CIS Controls v8.1 sont essentiels à la crédibilité de la gouvernance. Le piège managérial consiste à les traiter comme des listes de contrôles à mettre en œuvre un à un. L’architecture est le mécanisme qui permet de mettre en œuvre les normes à grande échelle.

Une organisation mature utilise les normes pour définir ce qui doit être couvert et l’architecture pour définir comment cette couverture sera obtenue de manière cohérente et mesurable. Les attentes de l’ISO/IEC 27002 en matière de contrôle d’accès sont satisfaites par le pilier de l’identité et de l’accès privilégié. Les attentes en matière de journalisation et de surveillance sont satisfaites par l’architecture de journalisation et l’ingénierie de la détection. Les attentes relatives à la préparation des TIC pour la continuité des activités sont satisfaites par l’architecture de résilience et la reprise testée. La mesure 8.27 de l’ISO/IEC 27002:2022, qui porte sur les principes d’architecture et d’ingénierie sécurisées, est satisfaite par l’autorité de conception, les architectures de référence, la modélisation des menaces et les fiches de décision décrites dans ce chapitre. Les normes fournissent le langage de l’assurance; l’architecture fournit la structure d’exécution. Les gestionnaires devraient donc s’attendre à ce que leur organisation traduise les normes en un nombre limité de programmes architecturaux, chacun doté d’une responsabilité claire, d’une feuille de route et de résultats mesurables, plutôt qu’en des centaines de tâches de contrôle sans lien entre elles.

Le modèle des trois lignes, présenté plus tôt dans ce manuel, s’applique ici aussi. Les équipes d’architecture et d’ingénierie, avec les responsables métier des systèmes, forment la première ligne : elles conçoivent et exploitent les contrôles. La deuxième ligne — la gestion des risques et la fonction de gouvernance de la sécurité — établit la politique d’architecture et les critères de risque, remet en question les décisions importantes et surveille les exceptions et la dette. L’audit interne, à titre de troisième ligne, fournit une assurance indépendante que le processus de gouvernance de l’architecture fonctionne : que les examens ont lieu, que les décisions sont consignées, que les exceptions arrivent à échéance et que les mesures sont exactes.

## L’architecture en pratique

Les concepts de ce chapitre deviennent plus clairs lorsqu’on les applique à une seule organisation aux prises avec des contraintes réalistes. La mise en situation qui suit est fictive, mais les pressions qu’elle décrit sont typiques des entreprises technologiques canadiennes en croissance.

Mise en situation : une entreprise montréalaise de logiciels de santé en croissance rapide (scale-up)

Clairvue Santé est une entreprise de logiciels établie à Montréal qui compte environ 350 employés et fournit une plateforme de prise de rendez-vous et de communication avec les patients à des cliniques et à des hôpitaux du Québec et de l’Ontario; sa clientèle croît dans le nord-est des États-Unis et un distributeur européen manifeste un premier intérêt. La plateforme traite des renseignements personnels sur la santé, ce qui la fait entrer dans le champ d’application de la Loi 25 du Québec, de la législation ontarienne sur la protection des renseignements sur la santé par l’intermédiaire de ses clients, et des exigences contractuelles de sécurité imposées par les hôpitaux clients. L’entreprise a grandi rapidement grâce à deux petites acquisitions, et sa plateforme fonctionne chez un fournisseur de nuage public, avec certains composants patrimoniaux hébergés dans une installation de colocation héritée de l’une des entreprises acquises.

L’équipe d’approvisionnement d’un grand réseau hospitalier envoie à Clairvue un questionnaire de sécurité qui demande, entre autres, des preuves d’un cycle de développement sécurisé, d’une authentification résistante à l’hameçonnage pour les administrateurs, de l’isolement des locataires, de journaux d’audit accessibles aux clients, d’objectifs de reprise testés et d’une feuille de route vers la vérification systématique. Le chef de la direction demande à la nouvelle responsable de l’architecture de sécurité si l’entreprise peut répondre de façon crédible. La réponse honnête est « en partie ». Les pratiques d’ingénierie sont bonnes au sein de l’équipe du produit principal, mais inégales dans les équipes acquises; les administrateurs utilisent l’authentification multifacteur (AMF), mais pas une forme résistante à l’hameçonnage; l’isolement des locataires est imposé dans l’application, mais pas dans la couche de données pour un module de production de rapports patrimonial; les journaux sont recueillis, mais ne sont pas mis à la disposition des clients; et la reprise a été testée pour la base de données principale, mais pas pour le fournisseur d’identité ni pour les composants patrimoniaux.

Plutôt que de répondre au questionnaire point par point, la responsable de l’architecture de sécurité propose d’en faire le point de départ d’un programme architectural. En collaboration avec le chef de la technologie et le comité des risques, elle formule trois scénarios de risque d’entreprise : la compromission d’un compte d’administrateur menant à l’exposition de données d’un locataire à l’autre; un rançongiciel se propageant de l’environnement de colocation patrimonial vers la plateforme infonuagique; et une panne prolongée causée par la perte du fournisseur d’identité. Chacun est évalué à l’aide de la méthode de l’entreprise fondée sur des scénarios, qui produit des estimations de vraisemblance et d’impact exprimées en dollars, en conséquences réglementaires et en termes de réputation. L’évaluation montre que les deuxième et troisième scénarios dépassent la tolérance au risque que le conseil d’administration a approuvée l’année précédente.

La feuille de route qui en résulte est exprimée dans le langage des sept piliers et du modèle de maturité de la CISA. Au cours des six premiers mois, l’entreprise fait passer tous les administrateurs à l’authentification résistante à l’hameçonnage et aux privilèges juste-à-temps, isole l’environnement de colocation patrimonial derrière une connexion étroitement contrôlée sans accès administratif permanent, et réalise un test complet de restauration du fournisseur d’identité et de la plateforme à partir de sauvegardes isolées. Au cours des six mois suivants, elle adopte le SSDF comme norme de développement sécurisé dans toutes les équipes, instaure une modélisation des menaces allégée comme point de contrôle pour les changements importants, publie trois architectures de référence sous forme de modèles réutilisables et commence à mettre les journaux d’audit des locataires à la disposition des clients. Le module patrimonial de production de rapports est consigné comme exception d’architecture, avec un responsable (le vice-président des produits), des contrôles compensatoires (surveillance supplémentaire et accès restreint) et une échéance de dix-huit mois liée à un projet de remplacement financé.

Des changements de gouvernance accompagnent le travail technique. Un petit comité d’examen de l’architecture, présidé par le chef de la technologie, la responsable de l’architecture de sécurité disposant d’un droit de veto sur les questions de sécurité sous réserve d’une remontée au chef de la direction, se réunit toutes les deux semaines et n’examine que les conceptions nouvelles ou à risque élevé; tout le reste passe par des vérifications automatisées dans les chaînes de déploiement. Les décisions importantes sont consignées sous forme d’ADR. Le comité des risques du conseil d’administration reçoit chaque trimestre un tableau de bord qui présente la maturité par pilier de la vérification systématique par rapport à la cible, la couverture des accès privilégiés, le nombre et l’ancienneté des exceptions, ainsi que les résultats des tests de restauration. En moins d’un an, Clairvue peut répondre au questionnaire du réseau hospitalier avec des preuves plutôt qu’avec des affirmations et — plus important encore — les deux scénarios qui dépassaient la tolérance y ont été ramenés. Les questions du distributeur européen sur le règlement sur la cyberrésilience (CRA), qui auraient été alarmantes un an plus tôt, correspondent désormais à des pratiques que l’entreprise suit déjà.

Les leçons se transposent facilement : les exigences du client sont devenues un intrant d’une architecture fondée sur les risques plutôt qu’un exercice de conformité, les investissements ont été ordonnancés selon le risque plutôt que selon l’ordre du questionnaire, les exceptions avaient un responsable et une durée limitée, et la gouvernance est restée assez légère pour que les équipes de réalisation perçoivent l’architecture comme un accélérateur.

Questions que les gestionnaires et les conseils d’administration devraient poser

Les questions suivantes aident les gestionnaires et les conseils d’administration à vérifier si l’architecture de sécurité est réellement gouvernée ou simplement décrite.

- État cible : Disposons-nous d’une architecture de sécurité cible documentée, approuvée par la direction et liée à notre appétence pour le risque et à nos principaux scénarios de risque?
- Droits décisionnels : Qui a le pouvoir d’approuver une conception, de l’assortir de conditions ou de la rejeter pour des motifs de sécurité, et comment les désaccords avec les promoteurs d’affaires sont-ils remontés?
- Sécurité dès la conception : À quel moment de notre processus de réalisation les exigences de sécurité et les modèles de menaces sont-ils produits, et quelles preuves montrent que cela se fait pour les changements importants?
- Fournisseurs : Nos processus d’approvisionnement posent-ils aux fournisseurs des questions sur la sécurité dès la conception et la sécurité par défaut, et donnons-nous suite aux réponses?
- Piliers : Pour chacun des sept piliers, pouvons-nous démontrer la couverture des actifs dont la compromission causerait le plus de tort?
- Accès privilégié : Quelle part de l’accès privilégié est permanente plutôt que juste-à-temps, et à quelle vitesse cette proportion diminue-t-elle?
- Vérification systématique : Quel stade de maturité avons-nous atteint dans chaque pilier du modèle de la CISA, quelle est notre cible et la feuille de route est-elle financée?
- Patrons : Quelle proportion de nos systèmes critiques repose sur des architectures de référence approuvées, et qui tient ces patrons à jour?
- Décisions : Les décisions d’architecture importantes sont-elles consignées avec leur justification et leurs conséquences sur le plan du risque, de sorte que nous puissions les expliquer à un organisme de réglementation après un incident?
- Exceptions : Combien d’exceptions d’architecture sont ouvertes, combien sont échues sans mesures correctives, et qui a accepté le risque résiduel pour chacune?
- Dette technique : Notre dette de sécurité est-elle consignée et quantifiée comme un risque, et la remboursons-nous plus vite que nous ne l’alourdissons?
- Reprise : Quand avons-nous restauré pour la dernière fois notre fournisseur d’identité et un service d’affaires critique à partir de sauvegardes isolées, et avons-nous atteint nos objectifs de reprise?

## Synthèse : l’architecture, visage concret de la gouvernance

La gouvernance de la cybersécurité est le système de gestion qui fixe les objectifs, arbitre les compromis, répartit les ressources et fait respecter l’imputabilité. L’architecture et l’ingénierie de la sécurité sont le lieu où ce système prend une forme concrète. Elles déterminent si la sécurité est obtenue par la conception ou simplement espérée à force d’efforts, si l’appétence pour le risque est une propriété structurelle de l’environnement ou une aspiration inscrite dans une politique, et si l’organisation peut prouver ce qu’elle affirme lorsqu’un organisme de réglementation, un client ou un tribunal le lui demande.

Ce chapitre a fait valoir que les gestionnaires devraient gouverner l’architecture comme un portefeuille de décisions structurelles plutôt que comme une collection d’outils. La sécurité dès la conception et la sécurité par défaut déplacent la sécurité au point où elle est la moins coûteuse et la plus efficace. Des cadres comme SABSA, TOGAF et Open Security Architecture dotent le travail d’une méthode et le rattachent à la valeur d’affaires. Les sept piliers définissent les capacités structurelles que la plupart des programmes doivent bâtir, chacun assorti de pratiques détaillées traitées dans d’autres chapitres. La vérification systématique, vue à travers la publication NIST SP 800-207 et le Zero Trust Maturity Model Version 2.0 de la CISA, fournit une orientation à long terme qui peut être planifiée, financée et mesurée par étapes.

Les mécanismes de gouvernance comptent autant que les conceptions. La modélisation des menaces rend explicite le risque au niveau de la conception; les patrons font de la voie sécurisée la voie facile; les autorités de conception détiennent les droits décisionnels et concentrent l’examen là où le risque est le plus élevé; les fiches de décision préservent le raisonnement qui rend les décisions défendables; les exceptions assorties d’un responsable et d’une date d’échéance maintiennent les écarts dans les limites de l’appétence pour le risque; et traiter la dette technique comme un risque rend visible et finançable le coût des raccourcis passés. Des mesures fondées sur la couverture, présentées dans le langage des scénarios de risque de l’organisation, permettent aux dirigeants de voir si l’architecture tient bon.

Une fois l’architecture gouvernée de cette manière, les chapitres voisins deviennent plus faciles à appliquer. L’identité, les systèmes cyberphysiques, la résilience, les bases de référence, le nuage, la protection des données, la cryptographie, la gouvernance de la chaîne d’approvisionnement et les décisions d’investissement deviennent tous des déclinaisons d’une structure cohérente plutôt que des initiatives distinctes qui se disputent l’attention. Les scénarios de risque peuvent être traduits en exigences d’architecture, les normes en programmes et les budgets en investissements dans des capacités durables. Surtout, l’organisation passe d’une activité de sécurité fragmentée à un état de risque acceptable rigoureux, étayé par des preuves et défendable — ce qui est, en fin de compte, la raison d’être de la gouvernance de la cybersécurité.

## Résumé du chapitre

L’architecture et l’ingénierie de la sécurité sont le lieu où l’appétence pour le risque du conseil d’administration devient une propriété structurelle des systèmes de l’organisation ou reste une phrase dans une politique. L’architecture définit ce qui doit être vrai pour que le risque demeure dans les limites de l’appétence; l’ingénierie le construit et prouve que cela fonctionne. Comme une seule décision architecturale est héritée par de nombreux systèmes, l’architecture est l’un des instruments de gestion des risques à plus fort effet de levier que gouvernent les gestionnaires. Le chapitre présente la sécurité dès la conception et la sécurité par défaut, les cadres SABSA, TOGAF et Open Security Architecture, sept piliers architecturaux, ainsi que la vérification systématique comme programme de gouvernance pluriannuel. Il se termine par les mécanismes qui rendent l’architecture gouvernable : modélisation des menaces, patrons, autorité de conception, fiches de décision, exceptions à échéance, dette de sécurité et mesures fondées sur la couverture.

Points clés à retenir

- L’architecture est responsable du quoi et du pourquoi, l’ingénierie du comment et de la preuve, les responsables du risque du risque résiduel, et la gouvernance du système dans son ensemble.
- Les contrôles architecturaux modifient la structure de l’environnement : une seule décision réduit des catégories entières de scénarios de risque dans tous les systèmes qui en héritent.
- Les normes et la réglementation attendent une architecture, notamment la mesure 8.27 de l’ISO/IEC 27002:2022, le NIST CSF 2.0 (PR.PS, PR.IR), le domaine APO03 de COBIT 2019, la ligne directrice B-13 du BSIF, la Loi 25 et l’article 25 du RGPD.
- La sécurité dès la conception est une décision de séquencement et la sécurité par défaut, une décision de répartition du fardeau; les deux exigent des éléments probants montrant que les principes ont été appliqués.
- SABSA relie la sécurité aux attributs d’affaires, TOGAF fournit les mécanismes de l’architecture d’entreprise et Open Security Architecture propose des patrons réutilisables qui doivent être adaptés.
- Les sept piliers (identité, terminaux et charges de travail, segmentation, bases de référence, chiffrement et clés, journalisation, résilience) interagissent, et chacun est gouverné par une seule question : pouvons-nous montrer, éléments probants à l’appui, que la décision a été mise en œuvre là où cela compte le plus?
- Les architectures de référence et les patrons forment une voie tracée (paved road) qui fait de la façon sécurisée la façon la plus facile, à condition que chaque patron ait un responsable, une version et une date de révision.
- La vérification systématique abandonne la confiance implicite fondée sur l’emplacement dans le réseau; une organisation le devient progressivement, elle ne l’achète pas.
- Le Zero Trust Maturity Model Version 2.0 de la CISA transforme la vérification systématique en stades de maturité observables par pilier, qui peuvent être évalués, financés et faire l’objet de rapports.
- La modélisation des menaces devient un contrôle de gestion lorsqu’elle est obligatoire, proportionnée, documentée par des éléments probants et reliée au registre des risques.
- Une autorité de conception détient des droits décisionnels et concentre l’examen là où le risque est le plus élevé, mais n’accepte jamais le risque résiduel; ses décisions importantes sont consignées dans des fiches de décision d’architecture.
- Les exceptions exigent un responsable, des contrôles compensatoires et une date d’échéance, et la dette de sécurité importante a sa place dans le registre des risques, mesurée et financée comme une réduction du risque; l’architecture elle-même se mesure par la couverture et les résultats, présentés dans le langage des scénarios de risque.
Termes clés

- Architecture de sécurité — Conception rigoureuse des capacités de protection à l’échelle des systèmes, des flux de données et des processus, qui définit ce qui doit être vrai pour que le risque demeure dans les limites de l’appétence.
- Ingénierie de la sécurité — Mise en œuvre concrète des conceptions de sécurité dans des environnements réels, y compris l’automatisation, les tests et les éléments probants montrant que les contrôles existent et fonctionnent.
- Sécurité dès la conception — Introduction des exigences de sécurité, de l’analyse des menaces et des contraintes architecturales au début du cycle de vie d’un système, puis maintien de celles-ci tout au long de ce cycle.
- Sécurisé par défaut — Attente selon laquelle les systèmes et les produits sont sûrs dans leur configuration d’origine, sans que le client ait à découvrir et à activer les paramètres de protection.
- Cadre de développement logiciel sécurisé (SSDF) — Publication NIST SP 800-218, ensemble de pratiques axées sur les résultats et regroupées en quatre familles : préparer l’organisation, protéger le logiciel, produire un logiciel bien sécurisé et répondre aux vulnérabilités.
- SABSA — Méthode d’architecture de sécurité guidée par les affaires qui relie chaque élément architectural à des attributs d’affaires au moyen de vues en couches propres à chaque partie prenante.
- Méthode de développement d’architecture (ADM) de TOGAF — Cycle itératif d’architecture d’entreprise de la norme TOGAF, dans lequel les exigences de sécurité, l’analyse des menaces et l’acceptation du risque devraient être intégrées.
- Piliers architecturaux — Les sept grands domaines de décision architecturale dans lesquels l’appétence pour le risque de l’organisation devient concrète, de l’identité à la résilience.
- Vérification systématique (zero trust) — Selon la publication NIST SP 800-207, ensemble de concepts qui réduisent l’incertitude dans l’application de décisions d’accès exactes, fondées sur le moindre privilège et prises à chaque requête, dans un réseau considéré comme compromis.
- Points de décision et d’application de politique — Composants de la vérification systématique qui évaluent chaque demande d’accès au regard d’une politique dynamique, puis autorisent ou refusent la connexion.
- Modélisation des menaces — Analyse structurée de la conception d’un système visant à déterminer ce qui pourrait mal tourner, comment, et ce qu’il faudrait faire avant que le système soit construit ou modifié.
- Architecture de référence et patron — Conceptions approuvées pour une catégorie de systèmes ou un problème de conception précis, de plus en plus mises en œuvre sous forme de modèles et de chaînes de déploiement formant une voie tracée.
- Autorité de conception — Rôle ou instance, souvent un comité d’examen de l’architecture, habilité à établir les normes architecturales, à approuver les conceptions et à trancher ou à faire remonter les dérogations.
- Fiche de décision d’architecture (ADR) — Document court et structuré consignant une décision importante : contexte, options, décision, justification, conséquences, y compris sur le risque, et auteur de la décision.
- Dette de sécurité — Partie de la dette technique, comme les plateformes non prises en charge et les exceptions jamais fermées, qui accroît l’exposition de l’organisation aux cyberrisques.

## Questions de révision

Questions à développement

1. Le chapitre soutient que les décisions architecturales comptent parmi les décisions de risque à plus fort effet de levier que prend une organisation. À l’aide d’au moins trois mécanismes structurels présentés dans le chapitre, analysez pourquoi un contrôle architectural peut surpasser les contrôles de détection et procéduraux, et discutez de ce que cela implique pour la façon dont les conseils d’administration devraient gouverner l’architecture.

2. Une organisation canadienne de taille moyenne utilise déjà TOGAF pour l’architecture d’entreprise, mais n’a aucune méthode d’architecture de sécurité. Évaluez comment elle devrait intégrer SABSA et des bibliothèques de patrons comme Open Security Architecture, et expliquez les risques de gouvernance liés à l’adoption de patrons externes sans les adapter.

3. Choisissez une organisation que vous connaissez (ou utilisez Clairvue Santé, présentée dans le chapitre). Évaluez sa position probable sur les sept piliers architecturaux, désignez les deux piliers qui nécessitent le plus d’investissements et justifiez une séquence pour les 12 prochains mois à l’aide de la logique d’investissement du chapitre.

4. Un fournisseur affirme à votre comité de direction que sa plateforme permettra à l’organisation de passer « à la vérification systématique en six mois ». À l’aide de la publication NIST SP 800-207, du Zero Trust Maturity Model Version 2.0 de la CISA et des orientations du Centre pour la cybersécurité, évaluez de façon critique cette affirmation et proposez comment la vérification systématique devrait plutôt être gouvernée.

5. Concevez un modèle opérationnel de gouvernance de l’architecture pour une organisation en croissance qui livre ses logiciels au moyen d’équipes agiles. Expliquez comment une autorité de conception, des points de contrôle de modélisation des menaces, des fiches de décision d’architecture et des exceptions à échéance fonctionneraient ensemble sans devenir un goulot d’étranglement.

Questions à choix multiples

Choisissez la meilleure réponse. Les réponses figurent à l’annexe « Réponses aux questions à choix multiples ».

1. Selon le chapitre, à quelle question l’architecture de sécurité répond-elle?

A. Comment construirons-nous et exploiterons-nous les états cibles dans notre environnement réel?

B. Qu’est-ce qui doit être vrai dans notre environnement pour que le risque demeure dans les limites de l’appétence?

C. Quels outils le centre des opérations de sécurité devrait-il déployer pour détecter les intrusions?

D. Quel responsable métier accepte le risque résiduel lorsqu’une conception est insuffisante?

2. Lorsqu’une conception proposée n’atteint pas l’état cible, qui décide s’il faut accepter l’écart qui en résulte?

A. L’architecte de sécurité qui a examiné et documenté la conception

B. Le comité d’examen de l’architecture, par un vote majoritaire de ses membres

C. L’équipe d’ingénierie chargée de mettre en œuvre la conception

D. Le responsable métier du service touché, dans les limites de l’appétence pour le risque

3. Pourquoi le chapitre décrit-il les contrôles architecturaux comme ayant plus d’effet de levier que les contrôles de détection ou procéduraux?

A. Ils modifient la structure de l’environnement, de sorte que des catégories entières de scénarios deviennent moins probables ou moins dommageables

B. Ils coûtent moins cher à acquérir que les outils de détection et n’entraînent aucun coût d’exploitation continu

C. Ils reposent sur le respect de procédures écrites par le personnel, que les auditeurs trouvent plus faciles à tester

D. Ils éliminent la nécessité pour les responsables du risque d’accepter quelque risque résiduel que ce soit

4. Quelle mesure de l’ISO/IEC 27002:2022 porte précisément sur les principes d’architecture et d’ingénierie des systèmes sécurisés?

A. Mesure 8.9, gestion de la configuration

B. Mesure 8.25, cycle de vie de développement sécurisé

C. Mesure 8.27, principes d’architecture et d’ingénierie des systèmes sécurisés

D. Mesure 8.28, codage sécurisé

5. Après un incident, quelle distinction importante une fiche de décision d’architecture bien tenue permet-elle à l’organisation de faire?

A. Si c’est le fournisseur ou le client qui a introduit la vulnérabilité

B. Si l’incident doit être déclaré en vertu de la Loi 25 du Québec

C. Si un risque a été accepté en connaissance de cause ou n’a jamais été envisagé

D. Si le comité d’examen a respecté les niveaux de service auxquels il s’était engagé

6. Le chapitre qualifie la sécurité dès la conception de décision de séquencement. Qu’est-ce que cela signifie?

A. Elle déplace l’analyse de sécurité au moment où le changement coûte le moins cher et où les options sont les plus vastes

B. Elle confie la responsabilité de la configuration sûre à la partie la mieux placée pour l’assumer

C. Elle exige que les tests de sécurité soient effectués seulement après le déploiement en production

D. Elle ordonne les contrôles selon leur coût afin que les moins chers soient mis en œuvre en premier

7. Lequel des énoncés suivants est l’un des trois principes des orientations Secure by Design de la CISA destinées aux fabricants de logiciels?

A. Transférer entièrement les tests de sécurité à l’équipe des opérations du client

B. Certifier chaque produit selon la norme ISO/IEC 27001 avant sa mise en marché

C. Exiger que les clients activent eux-mêmes l’authentification multifacteur

D. Assumer la responsabilité des résultats de sécurité des clients

8. Une entreprise canadienne utilise déjà TOGAF pour l’architecture d’entreprise. Selon le chapitre, comment devrait-elle traiter l’architecture de sécurité?

A. Créer une méthode distincte d’architecture de sécurité menée en parallèle avec TOGAF

B. Intégrer les exigences de sécurité, l’analyse des menaces et l’acceptation du risque aux phases pertinentes de l’ADM

C. Remplacer entièrement TOGAF par SABSA, parce que SABSA est propre à la sécurité

D. Adopter sans adaptation les patrons d’Open Security Architecture pour gagner du temps de conception

9. Quel est le principal avantage, pour la gestion, du profilage des attributs d’affaires de SABSA?

A. Une traçabilité dans les deux sens entre les attributs d’affaires et les éléments architecturaux

B. Une échelle de maturité allant de Traditionnel à Optimal pour chaque domaine de sécurité

C. Un catalogue des techniques d’adversaires observées, ancré dans des comportements réels

D. Un format lisible par machine pour vérifier à grande échelle la conformité des configurations

10. Pourquoi le chapitre met-il en garde contre l’adoption d’un patron de sécurité externe sans l’adapter?

A. Les patrons externes sont rarement mis en correspondance avec un cadre de contrôles reconnu

B. Les licences Creative Commons interdisent leur utilisation par des organisations commerciales

C. Il devient de la conformité de façade si personne ne vérifie qu’il répond aux scénarios réels

D. Les auditeurs refusent d’accepter les patrons qui n’ont pas été élaborés à l’interne

11. Pourquoi l’architecture de résilience est-elle présentée comme le fondement des sept piliers architecturaux?

A. C’est le pilier le moins coûteux, qui devrait donc toujours être réalisé en premier

B. C’est le pilier qui suppose que les autres piliers feront parfois défaut

C. C’est le seul pilier qui correspond directement aux résultats du NIST CSF 2.0

D. Il rend la segmentation inutile dans les environnements infonuagiques natifs

12. Une organisation décide de reporter d’un an son programme de segmentation. Que devrait-elle faire, selon le chapitre?

A. Rien, parce que la segmentation est un raffinement facultatif dans les conceptions modernes

B. Suspendre les améliorations de l’identité jusqu’à ce que la segmentation puisse être financée avec elles

C. Traiter le report comme une question opérationnelle relevant de la seule équipe réseau

D. Consigner la décision et accroître l’importance de l’identité et de la couverture de détection

13. Une entreprise impose le chiffrement dans tous ses systèmes, mais ne gère pas le cycle de vie des clés. Quelle est la principale préoccupation du chapitre?

A. Le chiffrement ralentira les applications sous les seuils de performance acceptables

B. Les organismes de réglementation interdisent le chiffrement à moins que le client détienne toutes les clés

C. Les algorithmes post-quantiques rendront immédiatement le chiffrement inutile

D. Une fragilité cachée : elle pourrait être incapable de récupérer ses propres données lors d’un incident

14. Selon le chapitre, quelle est la première étape de gouvernance pour une dette de sécurité importante?

A. L’ajouter au carnet de travail de l’ingénierie pour le prochain sprint de livraison

B. La consigner dans le registre des risques, décrite en termes de scénarios

C. La reporter jusqu’à ce que les systèmes touchés atteignent leur fin de soutien

D. La signaler à l’auditeur externe comme une déficience de contrôle

15. Quel est le changement central introduit par la publication NIST SP 800-207, Zero Trust Architecture?

A. Remplacer les pare-feu de périmètre par un seul produit de courtage d’accès

B. Exiger que tout le personnel travaille uniquement à partir du réseau de l’entreprise

C. Abandonner la confiance implicite fondée sur l’emplacement dans le réseau

D. Chiffrer toutes les données au repos avec des clés détenues par le client

16. Une organisation atteint la maturité Avancé dans le pilier Identité du ZTMM de la CISA, alors que son pilier Données demeure au stade Initial. Comment le chapitre considère-t-il cette situation?

A. Acceptable si le choix est délibéré, lié à des scénarios de risque et consigné

B. Inacceptable, parce que tous les piliers doivent progresser au même rythme chaque année

C. Suffisante pour déclarer que l’organisation applique la vérification systématique

D. La preuve que la capacité Gouvernance peut sans danger mûrir plus tard

17. Quelle méthode de modélisation des menaces applique une démarche structurée précisément aux menaces pour la vie privée, ce qui la rend utile en complément des évaluations des facteurs relatifs à la vie privée exigées par la Loi 25?

A. LINDDUN

B. STRIDE

C. PASTA

D. MITRE ATT&CK

18. Une équipe réalise une modélisation des menaces d’une heure pour un outil interne à faible impact, mais une analyse approfondie et documentée pour sa plateforme de paiement. Quelle propriété d’une modélisation des menaces gouvernable cela illustre-t-il?

A. Obligatoire

B. Documentée

C. Reliée

D. Proportionnée

19. Quel est le rôle du comité d’examen de l’architecture lorsqu’une conception ne peut pas satisfaire à une exigence de sécurité?

A. Accepter le risque résiduel au nom du promoteur d’affaires

B. Rejeter catégoriquement le projet et annuler le reste de son financement

C. Décrire clairement le risque qui en résulte pour le responsable du risque imputable

D. Approuver automatiquement la conception lorsque la livraison est urgente

20. Un rapport hypothétique montre que la couverture de segmentation des systèmes cliniques passe de 40 % à 85 %. Qu’est-ce qui rendrait cette donnée la plus significative pour un conseil d’administration?

A. L’exprimer en nombre de règles de pare-feu modifiées au cours du trimestre

B. La présenter avec le scénario de rançongiciel qu’elle traite et la réduction estimée de son impact

C. La comparer au nombre d’examens de conception effectués au cours de l’année

D. La communiquer uniquement à l’audit interne, dans son rôle de troisième ligne
