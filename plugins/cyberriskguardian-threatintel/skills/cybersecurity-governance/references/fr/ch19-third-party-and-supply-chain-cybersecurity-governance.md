<!-- Léger, M.-A. (2026). Introduction à la gouvernance de la cybersécurité pour la gestion des technologies d’affaires (3e éd., v2.51). Chapitre 19 : Gouvernance de la cybersécurité des tiers et de la chaîne d’approvisionnement. CC BY-NC 4.0 -->

# Chapitre 19 : Gouvernance de la cybersécurité des tiers et de la chaîne d’approvisionnement

## Résultats d’apprentissage

Au terme de ce chapitre, vous devriez être en mesure de :

1. Expliquer pourquoi le risque lié aux tiers doit être défini par ses conséquences plutôt que par le type de contrat, et distinguer l’exposition liée aux tiers, aux parties de quatrième rang et à la chaîne d’approvisionnement.

2. Décrire les sept étapes du cycle de vie de la gouvernance des tiers et justifier le recours à des points de contrôle assortis de droits décisionnels définis à chaque étape.

3. Appliquer les quatre facteurs de risque inhérent pour classer un fournisseur dans un niveau et rattacher ce niveau aux éléments probants minimaux, au pouvoir d’approbation et à la fréquence de surveillance.

4. Évaluer la valeur d’assurance des questionnaires, des rapports SOC et des certificats ISO/IEC 27001, y compris la portée, la période, les exceptions, les exclusions (carve-outs) et les contrôles complémentaires chez l’entité utilisatrice.

5. Recommander des exigences de sécurité, des critères éliminatoires et des clauses contractuelles qui rendent les obligations des fournisseurs exécutoires et alignées sur les échéances réglementaires de l’organisation.

6. Analyser le risque de concentration et le risque lié aux parties de quatrième rang, à l’aide de la panne de juillet 2024 et des incidents touchant la chaîne d’approvisionnement logicielle, afin de déterminer les réponses de gouvernance.

7. Concevoir les modalités de coordination des incidents et de sortie pour un fournisseur critique, y compris les déclencheurs d’avis, le pouvoir de déconnexion, la portabilité des données et les éléments probants à la résiliation.

8. Attribuer les rôles et les droits décisionnels de la gouvernance des tiers entre les responsables métier, l’approvisionnement, les services juridiques, la protection des renseignements personnels, la fonction du CSI et les trois lignes.

La gouvernance de la cybersécurité réussit ou échoue de plus en plus aux frontières de l’organisation. Bon nombre des incidents les plus perturbateurs de la dernière décennie n’ont pas été causés uniquement par les faiblesses des contrôles internes d’une organisation, mais par des faiblesses de son écosystème : dépendances infonuagiques et de logiciel-service (SaaS), fournisseurs de services gérés, composants logiciels, sociétés de traitement des paiements, plateformes de soutien à la clientèle et fournisseurs spécialisés disposant d’accès privilégiés. Un groupe de rançongiciel qui compromet un outil de gestion à distance utilisé par un fournisseur de services gérés atteint d’un coup des centaines de clients de ce fournisseur. Une faille dans un produit de transfert de fichiers largement utilisé expose les données de milliers d’organisations qui n’ont jamais eu de contrat avec le fabricant du produit. Une mise à jour défectueuse provenant d’un fournisseur de sécurité de confiance paralyse des compagnies aériennes, des hôpitaux et des détaillants le même matin. Dans chaque cas, les organisations touchées ont découvert que leur posture de cybersécurité n’était pas plus solide que celle des parties externes dont elles dépendaient.

Dans ce contexte, le risque lié aux tiers n’est pas une formalité d’approvisionnement. C’est la discipline de gouvernance qui détermine si les attentes de l’organisation en matière de cybersécurité deviennent des obligations exécutoires ou restent des politiques de principe. Les contrôles internes peuvent être conçus, mis en œuvre et testés par l’organisation elle-même. Les contrôles externes, non. Ils doivent être précisés à l’avance, négociés, inscrits au contrat, étayés par des éléments probants, surveillés et, au besoin, imposés ou abandonnés. Chacun de ces verbes décrit un acte de gestion, et non un acte technique.

Pour les gestionnaires des technologies d’affaires, la sécurité des tiers et de la chaîne d’approvisionnement est l’un des domaines les plus concrets de la gouvernance de la cybersécurité. C’est là que l’appétence pour le risque se traduit en exigences minimales, que l’auditabilité devient contractuelle et que l’imputabilité devient opérationnelle : qui doit faire quoi, pour quand, avec quels éléments probants, et ce qui se passe si ce n’est pas fait. C’est aussi un domaine où des gestionnaires extérieurs à la fonction de sécurité — responsables de l’approvisionnement, responsables métier qui parrainent un achat SaaS, juristes qui négocient les conditions, responsables des finances qui approuvent les renouvellements — prennent des décisions qui façonnent l’exposition en cybersécurité pendant des années, souvent sans s’en rendre compte.

Ce chapitre s’appuie sur la matière vue précédemment : l’appétence pour le risque et la tolérance au risque (chapitre 4) fondent le classement des tiers par niveau de risque, l’évaluation des risques fondée sur des scénarios (chapitres 5 et 6) fournit la méthode pour se demander ce qui pourrait mal tourner chez un fournisseur, les cadres du chapitre 9 contiennent tous des exigences relatives aux fournisseurs, la gestion des incidents et la continuité (chapitre 12) sont ce que les défaillances des fournisseurs mettent le plus souvent à l’épreuve, et le modèle de responsabilité partagée de l’infonuagique (chapitre 15) est un cas particulier du problème plus large traité ici.

Le chapitre présente la cybersécurité des tiers et de la chaîne d’approvisionnement comme un cycle de vie complet : la planification et le classement des tiers par niveau de risque, la vérification diligente précontractuelle, les exigences de sécurité dans l’approvisionnement, la contractualisation et le caractère exécutoire, l’intégration et la surveillance continue, le risque de concentration et le risque lié aux parties de quatrième rang, l’assurance de la chaîne d’approvisionnement logicielle, la coordination des incidents et la planification de la sortie. Il décrit ensuite le modèle opérationnel qui fait fonctionner le programme ainsi que les questions que les gestionnaires et les conseils d’administration devraient poser. L’objectif n’est pas simplement d’évaluer les fournisseurs, mais d’exploiter un programme d’assurance défendable qui réduit le risque réel et produit des éléments probants de vérification diligente.

## Concepts et portée : ce que signifient concrètement les tiers et la chaîne d’approvisionnement

Les organisations emploient souvent l’expression « risque lié aux tiers » dans un sens étroit, pour désigner les fournisseurs qui ont accès au réseau. Cette définition n’a jamais été adéquate, et elle est aujourd’hui dangereusement incomplète. Une organisation moderne dépend de parties externes pour l’identité, les communications, le stockage, le calcul, les paiements, l’analytique, les relations avec la clientèle et même la surveillance de sa propre sécurité. Certaines de ces parties ne touchent jamais au réseau de l’entreprise, et pourtant leur défaillance paralyserait les activités. La gouvernance doit donc commencer par définir correctement la portée du problème, car tout ce qui suit — classement par niveau de risque, vérification diligente, contrats, surveillance — ne s’applique qu’à ce qui se trouve dans cette portée.

Définir le tiers par les conséquences, et non par le contrat

Un tiers, aux fins de la gouvernance de la cybersécurité, est toute entité externe dont les services, les produits ou les activités peuvent avoir une incidence importante sur la confidentialité, l’intégrité ou la disponibilité de l’information de l’organisation, sur la vie privée des personnes dont elle détient les données ou sur la continuité de ses services critiques. Une extension de navigateur gratuite adoptée par une équipe de marketing, une passerelle de paiement, une bibliothèque à code source ouvert intégrée à une application destinée à la clientèle et une société affiliée qui fournit des services de TI partagés répondent toutes à cette définition si leur défaillance ou leur compromission devait nuire à l’organisation.

Cette définition fondée sur les conséquences correspond à l’orientation prise par les organismes de réglementation. La ligne directrice B-10 du BSIF, Gestion du risque lié aux tiers, publiée en avril 2023 et en vigueur depuis le 1er mai 2024, a remplacé l’ancienne ligne directrice axée sur l’impartition par une définition de l’entente avec un tiers qui va bien au-delà de l’impartition, et elle inclut explicitement les ententes conclues avec des sociétés affiliées. Le règlement européen sur la résilience opérationnelle numérique du secteur financier (DORA), règlement (UE) 2022/2554, applicable depuis le 17 janvier 2025, traite lui aussi les services de TIC de façon large, de l’infrastructure infonuagique aux services logiciels et de données. La leçon pour les gestionnaires est qu’une organisation qui ne répertorie que ses fournisseurs d’impartition des TI sous contrat ne gère pas son risque lié aux tiers; elle n’en gère qu’une partie.

Une définition fondée sur les conséquences dissipe aussi une source fréquente de confusion : le risque lié aux tiers n’est pas synonyme d’insécurité du fournisseur. Un fournisseur peut être bien sécurisé et constituer malgré tout une source de risque grave si l’organisation en dépend sans solution de rechange, si son contrat ne confère aucun droit à l’organisation ou si l’intégration de l’organisation elle-même avec ce fournisseur est mal contrôlée. La gouvernance doit tenir compte de la relation, et pas seulement du fournisseur.

Six catégories de dépendance externe

Une définition pratique de la portée distingue habituellement au moins six catégories de dépendance externe.

- Les fournisseurs de technologies et de services infonuagiques comprennent les fournisseurs d’infrastructure-service, de plateforme-service et de logiciel-service, les fournisseurs d’identité, les plateformes de courriel et de collaboration ainsi que les bases de données gérées. Ce sont souvent les dépendances les plus critiques et les plus difficiles à remplacer.
- Les fournisseurs de services gérés et de services de sécurité comprennent les fournisseurs de services gérés (MSP), les fournisseurs de services de sécurité gérés (MSSP), les fournisseurs de détection et d’intervention gérées (MDR) et les fournisseurs d’intervention en cas d’incident liés par une convention de disponibilité. Ils détiennent généralement un accès privilégié aux environnements de nombreux clients à la fois, ce qui en fait des cibles attrayantes.
- Les fournisseurs de logiciels et les intégrateurs comprennent les éditeurs de logiciels commerciaux, les composants à code source ouvert, les entrepreneurs qui développent des systèmes internes et les intégrateurs de systèmes qui déploient des plateformes. Leur risque réside dans le code et les configurations qu’ils livrent.
- Les fournisseurs d’impartition des processus d’affaires comprennent les services de paie, les centres de contact avec la clientèle, les agences de recouvrement, les agences de marketing et les firmes d’analyse de données. Ils traitent souvent de grands volumes de renseignements personnels hors de la surveillance directe de l’organisation.
- Les partenaires et intermédiaires de données reçoivent, enrichissent, échangent ou traitent des données pour le compte de l’organisation. Leur risque relève principalement de la confidentialité, de la protection de la vie privée et de l’utilisation secondaire.
- Les dépendances opérationnelles, comme les entreprises de traitement des paiements, les entreprises de télécommunications, les plateformes logistiques et les fournisseurs de technologie opérationnelle, peuvent sembler non techniques, mais elles sont pertinentes sur le plan de la cybersécurité, car leur compromission ou leur panne interrompt des services critiques (voir le chapitre 11 au sujet des fournisseurs de TO en particulier).
Chaîne d’approvisionnement, parties de quatrième rang et exposition transitive

La cybersécurité de la chaîne d’approvisionnement recoupe le risque lié aux tiers, mais met l’accent sur les dépendances en amont et sur l’exposition transitive : les composants, les sous-traitants, les bibliothèques, les outils de compilation et les fournisseurs de services dont dépendent l’organisation — et ses fournisseurs directs. Le NIST désigne cette discipline sous le nom de gestion des risques de cybersécurité liés à la chaîne d’approvisionnement (C-SCRM). La réflexion axée sur la chaîne d’approvisionnement impose deux questions qu’une vision fournisseur par fournisseur tend à négliger. Que contiennent les produits et services que nous achetons? Et de qui nos fournisseurs dépendent-ils eux-mêmes?

La seconde question introduit le risque lié aux parties de quatrième rang : le risque qui découle des fournisseurs du fournisseur. Un fournisseur SaaS fonctionne sur un nuage à très grande échelle, utilise un service tiers d’acheminement de courriels, intègre un service de traitement des paiements et s’appuie sur un centre de soutien imparti. Chacun d’eux est une partie de quatrième rang pour le client du fournisseur SaaS. Le client n’a habituellement aucun contrat avec ces parties et aucune visibilité directe sur leurs pratiques, et pourtant leur défaillance peut se propager jusqu’à ses services critiques. L’exposition aux parties de quatrième rang est aussi ce qui rend le risque de concentration systémique : lorsque de nombreux fournisseurs s’appuient sur les mêmes quelques fournisseurs en amont, une base de fournisseurs apparemment diversifiée peut dissimuler un point de défaillance unique.

La gestion du risque lié aux tiers n’est donc pas un processus unique, mais un programme de gouvernance de l’écosystème : fondé sur les risques, guidé par la portée et intégré à l’approvisionnement, aux services juridiques, à la protection des renseignements personnels, à la continuité des activités et aux opérations de cybersécurité.

Le paysage des référentiels

Plusieurs normes et cadres traitent désormais directement de ce domaine, et les gestionnaires devraient savoir ce que chacun apporte. La série ISO/IEC 27036, Cybersecurity — Supplier relationships, fournit les orientations internationales les plus précises : la partie 1 (2021) présente une vue d’ensemble et des concepts, la partie 2 (2022) précise les exigences relatives à la définition, à la mise en œuvre et à la gestion de la sécurité de l’information dans les relations avec les fournisseurs, la partie 3 (2023) fournit des lignes directrices sur la sécurité de la chaîne d’approvisionnement du matériel, des logiciels et des services, et la partie 4 (2016) porte sur la sécurité des services infonuagiques. Au sein même du SGSI, les normes ISO/IEC 27001:2022 et ISO/IEC 27002:2022 comportent un ensemble de mesures organisationnelles (5.19 à 5.23) qui couvrent la sécurité de l’information dans les relations avec les fournisseurs, la sécurité dans les accords conclus avec les fournisseurs, la chaîne d’approvisionnement des TIC, la surveillance et la gestion des changements des services des fournisseurs ainsi que l’utilisation des services infonuagiques.

La publication NIST SP 800-161 Rev. 1, Cybersecurity Supply Chain Risk Management Practices for Systems and Organizations, publiée en mai 2022 et mise à jour par un erratum (Update 1) en novembre 2024 qui a clarifié les orientations sur les SBOM et les avis de vulnérabilité, constitue le traitement public le plus détaillé de la C-SCRM, avec des pratiques à l’échelle de l’entreprise, de la mission et du système. Le NIST CSF 2.0 a élevé la gestion des risques liés à la chaîne d’approvisionnement au sein de la fonction Gouverner, sous forme de catégorie distincte, GV.SC, comptant dix résultats qui vont de l’établissement d’un programme de C-SCRM et de l’attribution des rôles à la priorisation des fournisseurs selon leur criticité, à l’intégration d’exigences dans les contrats, à l’inclusion des fournisseurs dans la planification des incidents et à la gestion des activités postérieures à la relation. Les CIS Controls v8.1 abordent le sujet sur le plan opérationnel au moyen du CIS Control 15, Service Provider Management. Pour les institutions financières fédérales (IFF) au Canada, la ligne directrice B-10 du BSIF établit les attentes en matière de surveillance, et, pour les entités financières de l’Union européenne, les dispositions de DORA sur les tiers prestataires de services de TIC ont force de loi. Ces référentiels sont complémentaires : l’ISO/IEC 27036 et la publication NIST SP 800-161 expliquent comment faire le travail, le CSF 2.0 énonce les résultats que la gouvernance devrait atteindre, et la ligne directrice B-10 du BSIF et DORA définissent ce que les autorités de surveillance examineront.

Le risque lié aux tiers se définit par les conséquences, et non par le type de contrat : si la défaillance d’une partie externe devait nuire à des services critiques ou à des renseignements sensibles, cette partie doit faire partie du programme de gouvernance.

## Un modèle de cycle de vie pour la gouvernance de la cybersécurité des tiers

Un programme de gouvernance crédible suit un cycle de vie qui reflète l’évolution réelle des relations. Le cycle de vie importe parce que le risque n’est pas constant au cours d’une relation : il se forme avant le contrat, atteint un sommet pendant l’intégration, dérive pendant l’exploitation et refait surface à la sortie. Un programme qui concentre tout son effort à un seul moment — généralement un questionnaire de sécurité lors de l’approvisionnement — sera solide à ce moment et aveugle partout ailleurs. L’ISO/IEC 27036-2 et le NIST CSF 2.0 (GV.SC-09 et GV.SC-10 en particulier) présentent tous deux la sécurité des fournisseurs comme un élément à intégrer et à surveiller tout au long de la relation, y compris après sa fin.

Sept étapes de la relation

La première étape est celle de la planification et de la classification. L’organisation définit les types de tiers qui existent, les exigences minimales qui s’appliquent à chacun et la façon dont les relations sont classées selon le risque. La classification a des conséquences pratiques : elle détermine les contrôles requis, les éléments probants exigés, les niveaux d’approbation et l’intensité de la surveillance continue. Cette étape comprend aussi la tenue du registre des tiers dont il est question plus loin dans ce chapitre.

La deuxième étape est celle de la vérification diligente préalable au contrat. Avant de s’engager, l’organisation évalue si le fournisseur pressenti peut satisfaire à ses exigences. Cela comprend l’examen de la posture de sécurité et des éléments probants d’assurance, des obligations en matière de protection des renseignements personnels et de résidence des données, de la viabilité financière, de la résilience opérationnelle et des propres dépendances du fournisseur. La vérification diligente est proportionnée : une plateforme infonuagique critique justifie des semaines d’examen, alors qu’un fournisseur de bureau à faible risque n’en justifie que quelques minutes.

La troisième étape est celle de la contractualisation et du caractère exécutoire. C’est à ce moment que la politique devient une obligation juridiquement contraignante : exigences de sécurité, droits d’audit et d’accès aux éléments probants, obligations d’avis d’incident, contrôles visant les sous-traitants, engagements relatifs au traitement et à la suppression des données, et recours en cas de non-conformité. Ce qui ne figure pas au contrat est, en pratique, en grande partie inexécutable.

La quatrième étape est celle de l’accueil et de l’intégration. Le risque atteint souvent un sommet à cette étape : des comptes sont créés, des identifiants et des clés d’API sont échangés, des connexions réseau sont ouvertes et les données commencent à circuler. L’accueil devrait donc comprendre des contrôles techniques de passage — aucun accès à la production tant que les configurations requises n’ont pas été vérifiées — ainsi que la consignation des éléments probants en vue d’un audit ultérieur.

La cinquième étape est celle de l’assurance et de la surveillance continues. Les fournisseurs changent de propriétaires, d’architecture, de personnel et de sous-traitants. L’organisation doit maintenir sa confiance de façon continue plutôt que de s’en remettre à un instantané pris à la signature du contrat.

La sixième étape est celle de la coordination des incidents. Lorsqu’un fournisseur subit un incident, ou lorsque l’organisation subit une atteinte par l’intermédiaire d’un fournisseur, la coordination et les éléments probants deviennent déterminants. La gouvernance doit définir à l’avance les canaux de communication, les délais d’avis, les attentes en matière de coopération et les droits décisionnels, avant que l’incident ne survienne.

La septième étape est celle du renouvellement, de la sortie et de la transition. Le renouvellement est un point de décision auquel le risque de la relation devrait être réévalué, et non une formalité de calendrier. La résiliation exige une transition sécurisée : retour ou destruction des données, révocation des identifiants, continuité du service et migration vers une solution de rechange dont les risques sont gérés. La figure ci-dessous résume le cycle de vie.

Figure 78 : le cycle de vie de la gouvernance de la cybersécurité des tiers

L’échec du modèle « accepter puis oublier »

Le mode de défaillance le plus courant de la gouvernance des tiers est ce que l’on peut appeler accepter puis oublier : le risque est évalué et accepté à l’accueil, puis le fournisseur disparaît en pratique du champ de vision de la gouvernance jusqu’à ce que quelque chose tourne mal. Les contrôles d’approvisionnement se concentrent naturellement autour de l’achat, les promoteurs d’affaires passent à autre chose une fois le service en exploitation, les équipes de sécurité disposent de peu de capacité résiduelle pour les réévaluations, et les contrats à renouvellement automatique éliminent le point de décision naturel.

Les conséquences sont prévisibles : un fournisseur à faible risque reçoit peu à peu des données de paiement, un fournisseur est acquis par une entreprise aux pratiques plus faibles, ou une intégration pilote devient une connexion privilégiée permanente, sans qu’aucun de ces changements ne déclenche de réévaluation. Le modèle du cycle de vie contre ce mode de défaillance en rendant chaque étape explicite, en lui attribuant un responsable et en définissant les événements qui ramènent une relation en examen.

Points de contrôle du cycle de vie et droits décisionnels

Un cycle de vie ne devient de la gouvernance que lorsque ses étapes comportent des points de contrôle : des moments où une personne désignée doit prendre une décision consignée en se fondant sur des éléments probants définis. Les points de contrôle types comprennent l’approbation de poursuivre avec un fournisseur jusqu’à la négociation du contrat, l’approbation de clauses contractuelles qui s’écartent de l’annexe de sécurité standard, l’approbation de l’octroi de l’accès à la production après les vérifications d’accueil, l’approbation du renouvellement et l’approbation de la résiliation assortie d’un plan de sortie vérifié. Chaque point de contrôle devrait préciser qui décide, quels éléments probants sont exigés et comment les exceptions sont traitées.

Les droits décisionnels à ces points de contrôle devraient être proportionnels au niveau de risque : un fournisseur à faible risque pourrait être approuvé par le responsable métier au moyen d’une vérification automatisée, alors qu’un fournisseur critique pourrait exiger l’évaluation du CSI, l’approbation de la personne responsable de la protection des renseignements personnels, l’approbation par les services juridiques des clauses non standard et l’acceptation explicite du risque résiduel par un dirigeant responsable du risque. Lorsque les exigences ne peuvent être respectées, le point de contrôle devrait produire une exception documentée assortie d’un responsable, de contrôles compensatoires et d’une date d’échéance — la même rigueur que celle appliquée aux autres exceptions dans ce manuel — plutôt qu’une dérogation tacite. Ce sont les points de contrôle de ce type qui transforment un schéma de cycle de vie en un registre de décisions défendable que l’audit interne, les organismes de réglementation et les conseils d’administration peuvent examiner.

## Classement par niveau de risque : traduire l’appétence pour le risque en exigences par niveau

Les organisations affirment souvent disposer d’une gestion du risque lié aux tiers, mais appliquent le même processus à tous les fournisseurs. Cette approche entraîne deux échecs à la fois : les fournisseurs critiques ne font pas l’objet d’un examen suffisant, et les fournisseurs à faible risque créent une surcharge bureaucratique qui ralentit les activités et mine l’adhésion au programme. La gouvernance des investissements comme la gouvernance des risques exigent un classement par niveau de risque : classer les relations avec les tiers selon leur risque inhérent, de façon que l’effort, les éléments probants et la surveillance soient proportionnés. La ligne directrice B-10 du BSIF exprime cela comme une approche fondée sur les risques dans laquelle l’intensité de la gestion est proportionnelle au risque et à la criticité de chaque entente, et le CSF 2.0 (GV.SC-04) demande que les fournisseurs soient connus et priorisés selon leur criticité.

Quatre facteurs de risque inhérent

Un modèle pratique de classement par niveau de risque tient généralement compte de quatre facteurs. Chacun peut être saisi au moyen d’un court questionnaire d’admission rempli par le responsable métier avant le début de toute évaluation de sécurité, ce qui permet un classement rapide et place la responsabilité d’une description exacte de la relation là où elle doit se trouver.

- La sensibilité des données porte sur l’information que le fournisseur stockera, traitera ou consultera. Les renseignements personnels, les données financières, les données de santé, les données de cartes de paiement, la propriété intellectuelle, les secrets d’authentification et les renseignements d’affaires confidentiels font monter le niveau, tout comme le volume. Les territoires en cause comptent également : en vertu de la Loi 25 du Québec, par exemple, la communication de renseignements personnels à l’extérieur du Québec exige une évaluation des facteurs relatifs à la vie privée, et toute communication à un prestataire de services doit s’appuyer sur un contrat écrit précisant les mesures de protection.
- La criticité du service porte sur ce qui se produit si le fournisseur fait défaut. À quelle vitesse le préjudice s’aggrave-t-il? Le fournisseur se trouve-t-il sur le chemin critique des revenus, du service à la clientèle, de la sécurité des personnes, de la conformité réglementaire ou de l’information financière? La ligne directrice B-10 du BSIF précise explicitement que la criticité s’attache à l’impact d’une perturbation, indépendamment de sa probabilité, ce qui constitue une discipline utile pour toute organisation.
- L’accès et l’intégration portent sur la profondeur de la connexion du fournisseur. Un accès privilégié ou administratif, une connectivité réseau permanente, un accès par API aux systèmes essentiels ou la capacité de pousser du code ou des mises à jour dans l’environnement font tous augmenter fortement le risque, car ils transforment une compromission du fournisseur en compromission de l’organisation.
- La substituabilité et la concentration portent sur la capacité réaliste de l’organisation à remplacer le fournisseur dans un délai acceptable, et sur la question de savoir si le fournisseur constitue un point de défaillance unique en raison du caractère unique de son produit, de la concentration du marché, de formats de données exclusifs ou de la complexité de l’intégration interne.
Des facteurs aux niveaux

À partir de ces facteurs, les organisations définissent un petit nombre de niveaux — habituellement trois ou quatre. Un plus grand nombre de niveaux ajoute de la précision, mais aussi des débats sur les cas limites; un plus petit nombre rend le programme plus facile à expliquer et à exploiter. Le niveau le plus élevé comprend généralement les fournisseurs d’identité infonuagiques, les principales plateformes SaaS et d’infrastructure, les fournisseurs de services gérés disposant d’un accès privilégié et les fournisseurs qui traitent à grande échelle des renseignements personnels réglementés. Le niveau le plus bas comprend les fournisseurs de produits courants, sans accès aux données ni criticité opérationnelle. Le tableau ci-dessous présente un exemple de modèle; chaque organisation doit étalonner ses propres seuils en fonction de son appétence pour le risque.

Niveau

Exemples types

Éléments probants minimaux

Réévaluation

1 — Critique

Fournisseur d’identité, PGI principal ou plateforme infonuagique principale, MSP disposant d’un accès administrateur

Rapport indépendant de portée correspondante, examen ciblé, plan de sortie

Annuelle, plus événements déclencheurs

2 — Élevé

SaaS détenant des renseignements personnels, paie, centre de contact

Rapport indépendant ou dossier détaillé d’éléments probants

Annuelle ou au renouvellement

3 — Modéré

Outil d’analytique aux données limitées, logiciel spécialisé

Questionnaire standard avec éléments probants clés

Tous les deux à trois ans

4 — Faible

Aucune donnée, aucun accès, facilement remplaçable

Formulaire d’admission seulement

Au renouvellement

Une fois attribué, le niveau détermine tout ce qui suit : le modèle de demande de propositions utilisé, la profondeur de la vérification diligente, l’annexe contractuelle jointe, les points de contrôle d’accueil appliqués, la fréquence de surveillance, l’autorité d’approbation des exceptions et la nécessité ou non d’un plan de sortie. C’est ce qui rend le modèle applicable. Sans ces liens, le classement par niveau de risque n’est qu’un exercice d’étiquetage qui ne change rien.

Risque inhérent, risque résiduel et étalonnage

Le classement par niveau repose sur le risque inhérent — l’exposition créée par la nature de la relation avant la prise en compte des contrôles du fournisseur. La vérification diligente éclaire ensuite le risque résiduel : l’exposition qui subsiste compte tenu de ce que l’organisation sait des contrôles du fournisseur et de ses propres mesures compensatoires. Maintenir la distinction entre les deux empêche qu’un fournisseur réputé soit placé dans un niveau bas et ne soit jamais examiné de près. Un fournisseur d’identité critique demeure au niveau 1 même si ses contrôles sont excellents; ce qui change lorsque les éléments probants sont solides, c’est la cote de risque résiduel et le degré de confiance avec lequel le responsable métier peut l’accepter.

L’étalonnage devrait être mis à l’épreuve au regard de l’appétence pour le risque. Si le conseil d’administration a énoncé une faible appétence pour la perte de renseignements personnels de la clientèle et une appétence modérée pour de courtes interruptions de service dans des fonctions non essentielles, les seuils de classement devraient refléter ces énoncés : un fournisseur qui détient des données de la clientèle à grande échelle devrait se situer au niveau 1 ou 2, quel que soit son rôle opérationnel, alors qu’un fournisseur dont la panne incommoderait une équipe interne pendant une journée pourrait se situer au niveau 3. L’évaluation des risques fondée sur des scénarios, décrite aux chapitres 5 et 6, est l’outil tout désigné pour vérifier l’étalonnage. L’élaboration de deux ou trois scénarios concrets pour un échantillon de fournisseurs de chaque niveau — une atteinte chez un fournisseur exposant des données, une panne d’un fournisseur, une mise à jour compromise transmise par le canal d’un fournisseur — révèle rapidement si les niveaux concordent avec les pertes qui préoccupent réellement l’organisation.

Le registre des tiers comme fondement

Le classement par niveau suppose que l’organisation sache qui sont ses tiers. En pratique, c’est souvent l’étape la plus difficile. Les achats effectués au moyen de cartes d’entreprise, les outils SaaS gratuits adoptés sans passer par l’approvisionnement, les intégrations créées par les développeurs et les anciens contrats antérieurs au programme actuel échappent tous à l’inventaire officiel. Un registre des tiers qui consigne chaque relation, son responsable métier, son niveau, les données et les systèmes en cause, ses principales clauses contractuelles, ses sous-traitants importants et l’état de son évaluation constitue le fondement du programme. La ligne directrice B-10 du BSIF s’attend à ce que les institutions financières fédérales tiennent un inventaire des tiers, et DORA exige que les entités financières de l’Union européenne tiennent un registre d’information sur tous les accords contractuels portant sur des services de TIC, dont les autorités de surveillance se servent notamment pour repérer les prestataires critiques à l’échelle du secteur.

La constitution du registre exige habituellement de combiner plusieurs sources : les données des comptes fournisseurs, les systèmes de gestion des contrats, les journaux d’authentification unique et d’identité indiquant quelles applications externes les employés utilisent, la télémétrie du réseau et des courtiers de sécurité d’accès infonuagique, et des entrevues avec les unités d’affaires. Le registre devrait être traité comme un contrôle vivant plutôt que comme une compilation annuelle. Sa qualité est elle-même un indicateur clé de risque : la proportion de fournisseurs actifs auxquels un niveau et un responsable ont été attribués en dit plus long au conseil d’administration sur la couverture réelle du programme que n’importe quel nombre de questionnaires remplis. La figure ci-dessous montre comment l’appétence pour le risque se traduit, par le classement par niveau, en exigences concrètes.

Figure 79 : de l’appétence pour le risque aux exigences par niveau applicables aux tiers

C’est le classement par niveau de risque qui rend la gouvernance des tiers applicable : chaque niveau doit comporter ses propres contrôles minimaux, éléments probants minimaux, autorité d’approbation et fréquence de surveillance, faute de quoi les niveaux ne changent rien.

## Vérification diligente et assurance : questionnaires ou confiance fondée sur des éléments probants

L’une des décisions de gouvernance les plus importantes dans ce domaine porte sur la façon dont l’organisation obtient une assurance quant à la sécurité d’un fournisseur. De nombreux programmes s’appuient fortement sur des questionnaires parce qu’ils sont peu coûteux, extensibles et familiers. Les questionnaires ont leur place, mais ils créent souvent un faux sentiment de confiance, car ils mesurent des déclarations plutôt que des capacités. Un fournisseur qui répond oui à « Appliquez-vous l’authentification multifacteur pour tous les accès administratifs? » a formulé une affirmation; il n’a pas démontré l’existence d’un contrôle. La question de gouvernance est de savoir de quel degré de confiance l’organisation a besoin pour une relation donnée, et quel type d’éléments probants peut le lui procurer.

Ce que les questionnaires peuvent faire et ne peuvent pas faire

Il vaut mieux voir les questionnaires comme un outil de filtrage et de délimitation de la portée. Ils repèrent les fournisseurs qui n’ont aucun programme de sécurité, révèlent la configuration générale de l’environnement d’un fournisseur, confirment l’existence de politiques et de certifications, fournissent des personnes-ressources en sécurité et font ressortir les incidents divulgués. Les questionnaires normalisés réduisent les frictions de part et d’autre. Le Consensus Assessments Initiative Questionnaire (CAIQ) de la Cloud Security Alliance, désormais à la version 4.1, aux côtés de la Cloud Controls Matrix v4.1 publiée en janvier 2026, est largement utilisé pour les fournisseurs de services infonuagiques, et de nombreux fournisseurs publient leurs CAIQ remplis dans le registre CSA STAR, ce qui permet aux clients de les consulter sans envoyer un énième questionnaire sur mesure.

Les limites sont tout aussi claires. Les questionnaires reposent sur une autodéclaration, sont souvent remplis par le personnel des ventes ou de la conformité plutôt que par les personnes qui exploitent les contrôles, et les réponses retiennent l’interprétation raisonnable la plus favorable. Ils mesurent la conception, rarement l’efficacité opérationnelle. Et un questionnaire rempli, classé dans un système d’approvisionnement, peut donner à un programme une apparence de diligence sans la moindre analyse des réponses — une forme classique de conformité de façade. Le critère d’un processus de questionnaire n’est pas le nombre de questionnaires remplis, mais le fait que les réponses soient examinées par une personne compétente, que les lacunes importantes donnent lieu à des décisions et que les affirmations qui comptent soient corroborées.

Lire les rapports d’assurance indépendants

À un niveau supérieur, l’assurance fondée sur des éléments probants repose sur des documents indépendants. Les plus courants sont les rapports sur les contrôles des sociétés de services et les certifications. Un rapport SOC 2, préparé par un auditeur indépendant selon les normes d’attestation de l’AICPA au regard des Trust Services Criteria, ou critères relatifs aux services de confiance (sécurité, disponibilité, intégrité du traitement, confidentialité et protection de la vie privée), décrit le système et les contrôles d’une société de services. Un rapport de type I indique si les contrôles étaient conçus de façon appropriée à un moment donné; un rapport de type II vérifie également s’ils ont fonctionné efficacement au cours d’une période, généralement de six à douze mois, et il est donc beaucoup plus instructif. Les rapports SOC 1, délivrés aux États-Unis selon la norme SSAE 18, à l’échelle internationale selon la norme ISAE 3402 et au Canada selon la norme NCMC 3416 (CSAE 3416), portent sur les contrôles pertinents pour l’information financière des clients plutôt que sur la sécurité proprement dite, et ils intéressent les équipes des finances et de l’audit externe. La certification ISO/IEC 27001 donne l’assurance qu’un système de gestion satisfait aux exigences de la norme dans une portée définie, mais elle n’atteste pas à elle seule l’efficacité opérationnelle de contrôles précis comme le fait un rapport de type II.

La valeur de gouvernance de ces documents dépend entièrement de la façon dont ils sont lus. Les gestionnaires devraient s’assurer que les examinateurs vérifient au moins les éléments suivants :

- La portée et les limites déterminent si le rapport ou le certificat couvre réellement le service, les emplacements et les systèmes que l’organisation utilise. Un certificat ISO/IEC 27001 visant le siège social d’un fournisseur ne couvre pas l’exploitation de ses centres de données, à moins que l’énoncé de portée ne le précise.
- La période et son actualité comptent, car un rapport de type II couvrant une période terminée depuis de nombreux mois en dit peu sur la situation actuelle. Les fournisseurs remettent couramment une lettre de transition (bridge letter) affirmant qu’aucun changement important n’est survenu depuis la fin de la période; elle est utile, mais il s’agit d’une affirmation de la direction, et non d’un élément probant d’audit.
- Les exceptions et les opinions avec réserve sont l’endroit où se trouve l’information réelle. Une page de synthèse sans réserve peut masquer, dans la section des tests, des exceptions de contrôle directement pertinentes pour le risque de l’organisation.
- Les sociétés sous-traitantes exclues (méthode de l’exclusion) révèlent des parties de quatrième rang. Si le rapport exclut le fournisseur d’hébergement infonuagique du fournisseur, les contrôles de cette partie de quatrième rang ne sont pas couverts et doivent faire l’objet d’une assurance par un autre moyen.
- Les contrôles complémentaires chez l’entité utilisatrice sont des contrôles que le fournisseur suppose que ses clients exercent — par exemple, gérer leurs propres comptes d’utilisateur ou examiner les journaux d’accès. Si l’organisation ne les exerce pas, l’assurance fournie par le rapport ne vaut pas pour elle.
Ce dernier point mérite d’être souligné, car il est souvent négligé. Un rapport SOC 2 n’est pas seulement un élément probant sur le fournisseur; c’est aussi une liste d’obligations pour le client. Cela reflète le modèle de responsabilité partagée abordé au chapitre 15, et cela signifie que l’examen d’un rapport devrait donner lieu à des mesures pour les équipes internes, et non seulement à un verdict de réussite ou d’échec pour le fournisseur.

Une validation plus poussée pour les fournisseurs critiques

Pour les relations de niveau 1, la gouvernance peut exiger une validation qui va au-delà des rapports standard. Les options comprennent des évaluations ciblées au regard de scénarios de risque précis; des examens d’architecture axés sur l’isolement des locataires, la séparation des données, la gestion des clés et les voies d’accès administratif; l’examen du plan d’intervention en cas d’incident du fournisseur et des preuves d’exercices récents; des résumés de tests d’intrusion indépendants indiquant l’état des mesures correctives; et, lorsque les droits contractuels le permettent, des audits sur place ou à distance. Pour les services infonuagiques, la validation plus poussée porte souvent sur la configuration et l’intégration plutôt que sur les contrôles internes du fournisseur, car la défaillance la plus probable se situe dans l’utilisation que le client fait lui-même du service (voir le chapitre 15).

La proportionnalité et le budget d’assurance

Le principe qui relie ces couches est simple : plus le risque est important, plus l’assurance doit reposer sur des éléments probants. La proportionnalité est un principe de conception, et non une concession : elle consacre une capacité d’évaluation limitée là où elle réduit le plus le risque. Une organisation qui compte trois cents fournisseurs et deux analystes ne peut pas examiner tout le monde en profondeur, mais elle peut s’assurer que ses vingt fournisseurs de niveau 1 font l’objet d’un examen véritable, que ses fournisseurs de niveau 2 fournissent des éléments probants indépendants et que les niveaux inférieurs sont traités au moyen de processus efficaces et largement automatisés.

Les gestionnaires devraient aussi reconnaître que l’assurance a un coût, et que ce coût doit être pris en compte dans les décisions d’investissement (voir le chapitre 17). Le temps consacré à l’évaluation, à la négociation et à la surveillance d’un fournisseur critique fait partie du coût total de la relation. Lorsqu’une unité d’affaires propose un nouveau fournisseur de niveau 1, l’analyse de rentabilisation devrait inclure l’effort d’assurance requis, au même titre que les droits de licence et les coûts d’intégration. Cela fait de l’examen de sécurité un coût planifié d’une décision à risque élevé plutôt qu’un obstacle non budgété.

## Exigences de sécurité dans les demandes de propositions et l’approvisionnement : intégrer la sécurité dès le départ plutôt que la négocier plus tard

Le point de contrôle le plus efficace est souvent l’étape de la demande de propositions (DP). Si la sécurité n’est introduite qu’après la sélection d’un fournisseur, le levier de l’organisation diminue fortement. Les échéanciers sont fixés, et le fournisseur sait que le client a peu de chances de renoncer pour une clause de sécurité. La maturité de la gouvernance se manifeste par l’intégration d’exigences minimales de sécurité aux critères d’approvisionnement avant le choix d’un fournisseur, de sorte que la sécurité devienne un facteur de sélection plutôt qu’un obstacle à la signature.

Des exigences avant la sélection

En pratique, cela signifie que l’approvisionnement et les responsables métier définissent les exigences de sécurité et de protection des renseignements personnels en même temps que les exigences fonctionnelles, la fonction de sécurité fournissant un contenu standard plutôt qu’un examen sur mesure de chaque DP. Les exigences types comprennent l’authentification unique et l’authentification multifacteur, des journaux d’audit accessibles au client, le chiffrement avec possibilité de clés gérées par le client pour les charges de travail sensibles, des choix de résidence des données, des délais définis d’application des correctifs, une politique de divulgation des vulnérabilités, des engagements d’avis d’incident, des rapports d’assurance indépendants et la transparence quant aux sous-traitants importants. Pour les produits logiciels, les exigences comprennent de plus en plus des preuves de pratiques de développement sécurisé et la capacité de fournir une nomenclature logicielle, dont il est question plus loin dans ce chapitre.

Les exigences devraient être rédigées sous forme d’énoncés vérifiables, et les réponses aux DP devraient être évaluées par des personnes compétentes pour en juger. « La solution prend en charge l’authentification unique au moyen de SAML 2.0 ou d’OpenID Connect et impose l’AMF pour tous les rôles administratifs » peut être vérifié lors d’une preuve de concept; « Le fournisseur prend la sécurité au sérieux » ne le peut pas.

Les critères d’exclusion comme expression de l’appétence pour le risque

Les exigences d’approvisionnement constituent aussi un moyen efficace de rendre l’appétence pour le risque opérationnelle. Si l’appétence de l’organisation ne permet pas certaines expositions — par exemple, un fournisseur critique sans aucun rapport d’assurance indépendant, une application porteuse d’identités qui ne peut s’intégrer au fournisseur d’identité de l’entreprise ou une plateforme qui ne peut conserver les données réglementées dans les territoires approuvés —, ces conditions devraient devenir des critères d’exclusion énoncés dans la DP plutôt que des points de négociation après la sélection. Énoncer les critères d’exclusion d’entrée de jeu est plus équitable envers les fournisseurs, qui peuvent choisir de ne pas soumissionner, et cela élimine une source récurrente de conflit entre les promoteurs d’affaires et la fonction de sécurité.

Les critères d’exclusion doivent être utilisés avec parcimonie, car chacun d’eux rétrécit le marché et peut créer le risque de concentration même que l’organisation souhaite éviter. Le modèle approprié consiste en une courte liste d’exigences non négociables découlant des énoncés d’appétence du conseil d’administration, une liste plus longue d’exigences pondérées qui influent sur la notation, et une procédure d’exception documentée pour les cas où la valeur d’affaires justifie l’acceptation d’une lacune assortie de contrôles compensatoires.

Modèles par niveau et pondération de l’évaluation

Un modèle de gouvernance utile consiste à fournir des modèles de DP par niveau. Les achats à faible risque reçoivent un ensemble allégé d’exigences qu’un responsable métier peut inclure sans aide. Les achats à risque plus élevé reçoivent des exigences structurées, des demandes d’éléments probants et une pondération définie de la sécurité dans l’évaluation globale. La pondération elle-même est une décision de gouvernance : si la sécurité compte pour cinq pour cent de la note dans l’achat d’une plateforme critique, l’organisation a signalé qu’elle est prête à sacrifier la plupart des préoccupations de sécurité au profit du prix ou des fonctionnalités, et ce signal devrait être délibéré plutôt qu’accidentel.

Les modèles par niveau réduisent les frictions tout en augmentant la cohérence, et c’est la cohérence qui rend les décisions défendables. Lorsqu’un organisme de réglementation, un auditeur ou le conseil d’administration demande pourquoi un fournisseur donné a été choisi malgré des faiblesses connues, l’organisation peut montrer les exigences qui s’appliquaient, la note obtenue par le fournisseur, les lacunes qui ont été acceptées et qui les a acceptées. Ce registre est le sens concret d’une décision défendable en matière d’approvisionnement.

## Contractualisation et caractère exécutoire : là où la gouvernance devient juridiquement réelle

Une politique n’est pas opposable à un fournisseur tant qu’elle n’est pas devenue une obligation contraignante. La contractualisation est donc au cœur de la gouvernance de la cybersécurité des tiers. C’est le moment où l’organisation traduit ses attentes en matière de sécurité en clauses claires, en engagements mesurables et en recours. C’est aussi le moment où de nombreux programmes perdent du terrain : les conditions standard du fournisseur sont acceptées parce que la négociation retarderait le projet, les annexes de sécurité sont jointes, mais jamais lues par le personnel opérationnel du fournisseur, et les clauses sont rédigées en des termes si généraux qu’aucun manquement ne pourrait jamais être établi. La mesure 5.20 de l’ISO/IEC 27002:2022 et le résultat GV.SC-05 du CSF 2.0 demandent tous deux que des exigences de sécurité soient établies dans les accords avec les fournisseurs; le défi de gouvernance consiste à rendre ces exigences suffisamment précises pour qu’elles aient une portée réelle.

Obligations de sécurité et partage des responsabilités

Les contrats devraient préciser des obligations de sécurité de base adaptées au niveau : contrôle d’accès et gestion des accès privilégiés, chiffrement, développement sécurisé s’il y a lieu, gestion des vulnérabilités assortie de délais de correction définis, journalisation et conservation, surveillance de la sécurité, sécurité du personnel, et capacités de continuité et de reprise assorties d’objectifs énoncés. L’approche la plus efficace est une annexe de sécurité standard tenue à jour par les fonctions de sécurité et juridique, avec des variantes propres à chaque niveau, de sorte que chaque contrat n’ait pas à être rédigé à partir de zéro et que les écarts soient visibles.

Lorsque la responsabilité partagée s’applique, comme c’est le cas pour presque tous les services infonuagiques et gérés, le partage des responsabilités doit être explicite plutôt que présumé. Une matrice des responsabilités jointe au contrat — qui gère les identités, qui configure la journalisation, qui applique les correctifs à quelle couche, qui intervient à la suite de quelles alertes — élimine une ambiguïté qui, autrement, n’apparaît qu’au cours d’un incident. Les ententes de services gérés méritent une attention particulière, car le fournisseur exerce souvent ses activités avec des privilèges administratifs dans l’environnement du client. Le contrat devrait préciser comment l’accès du fournisseur lui-même est sécurisé (par exemple, AMF résistante à l’hameçonnage, comptes administratifs dédiés, accès juste-à-temps et journalisation visible par le client), car la compromission des outils de gestion à distance d’un fournisseur est l’une des voies d’attaque les plus efficaces dont disposent les criminels.

Droits d’audit et obligations relatives aux éléments probants

Les contrats devraient définir les documents d’assurance que le fournisseur doit remettre, à quelle fréquence, et dans quelles conditions le client peut demander des éléments probants supplémentaires ou effectuer un audit. Pour les fournisseurs à risque élevé, l’organisation peut exiger des rapports SOC 2 de type II annuels, des certificats ISO/IEC 27001 à jour et de portée appropriée, des résumés de tests d’intrusion et un avis de tout changement important apporté à l’environnement de contrôle. Les droits d’audit devraient comporter des limites raisonnables qui respectent la confidentialité du fournisseur et les intérêts de ses autres clients, mais ils doivent exister sous une forme suffisamment solide pour soutenir la gouvernance et l’examen réglementaire. Pour les institutions financières fédérales, la ligne directrice B-10 du BSIF s’attend à ce que les contrats visant des ententes à risque élevé et critiques prévoient des droits d’audit et d’accès tant pour l’institution que pour le BSIF lui-même, et DORA exige de même que les contrats accordent aux entités financières et à leurs autorités compétentes des droits d’accès, d’inspection et d’audit.

Les grands fournisseurs offrent fréquemment leurs rapports d’assurance standard au lieu de droits d’audit individuels. C’est souvent un compromis raisonnable si les rapports couvrent les services utilisés et doivent être remis selon un calendrier prévu au contrat; l’erreur de gouvernance consiste à accepter un contrat qui ne prévoit aucun droit aux éléments probants.

Avis d’incident et coopération

Les contrats doivent définir les délais d’avis d’incident, l’information à communiquer et les obligations de coopération relatives à l’enquête, au confinement, aux exigences juridiques et aux communications avec la clientèle. Les clauses d’avis devraient reconnaître qu’un incident est une notion plus large qu’une violation confirmée, car c’est souvent l’alerte précoce d’une compromission soupçonnée qui permet au client de limiter les préjudices — en renouvelant des identifiants, en suspendant une intégration ou en préparant les avis réglementaires.

Les délais d’avis devraient aussi être harmonisés avec les obligations réglementaires du client lui-même. Une organisation canadienne assujettie aux exigences de déclaration des atteintes de la LPRPDE, aux dispositions de la Loi 25 du Québec sur les incidents de confidentialité, aux attentes du BSIF en matière de déclaration des incidents liés à la technologie et à la cybersécurité ou, pour ses activités dans l’Union européenne, aux exigences de déclaration des incidents de NIS2 ou de DORA, ne peut pas respecter ses délais si ses fournisseurs disposent de plus de temps pour l’informer que l’organisme de réglementation ne lui en accorde pour informer les autorités. Les clauses de coopération devraient couvrir la conservation des journaux et des preuves criminalistiques, l’accès au personnel du fournisseur pendant une enquête, la participation à des exercices conjoints et la coordination des déclarations publiques. Le CSF 2.0 (GV.SC-08) demande explicitement que les fournisseurs pertinents soient inclus dans les activités de planification, d’intervention et de rétablissement en cas d’incident.

Sous-traitance, traitement des données et recours

Les fournisseurs devraient être tenus d’imposer des obligations de sécurité équivalentes à leurs sous-traitants, de divulguer leurs sous-traitants importants — en particulier ceux qui traitent des données sensibles ou qui soutiennent des fonctions critiques — et d’aviser le client, idéalement assorti d’un droit d’opposition, avant tout changement important en matière de sous-traitance. C’est le fondement contractuel de la gestion du risque lié aux parties de quatrième rang, abordée plus loin dans ce chapitre.

Les contrats doivent aussi préciser la propriété des données, les utilisations permises (y compris toute utilisation des données du client à des fins d’analytique ou d’entraînement de modèles d’IA, une question devenue courante depuis que des fonctionnalités d’IA générative ont commencé à apparaître dans les produits SaaS grand public; voir le chapitre 18), les limites de conservation, l’emplacement des données, le retour des données dans des formats utilisables et les obligations de destruction sécurisée, preuves à l’appui. Il ne s’agit pas seulement de contrôles de protection de la vie privée; ce sont des contrôles qui limitent l’impact d’une violation, car des données supprimées ne peuvent pas être volées. Au Québec, la Loi 25 exige que le contrat conclu avec un prestataire de services qui reçoit des renseignements personnels soit écrit et précise les mesures que le prestataire doit prendre pour en assurer la protection, pour ne les utiliser qu’aux fins du mandat et pour ne pas les conserver après la fin de celui-ci.

Enfin, la gouvernance exige de la clarté quant à ce qui se produit si les obligations ne sont pas respectées : droits de résiliation en cas de manquement en matière de sécurité, crédits de service en cas de défaillance de disponibilité, indemnisations et plafonds de responsabilité adaptés au risque, engagements à corriger les lacunes relevées dans des délais définis, et droits de substitution ou d’assistance à la transition pour les services critiques. Les plafonds de responsabilité méritent l’attention de la haute direction. Un plafond standard équivalant à douze mois de frais peut être raisonnable pour un outil à faible risque, mais tout à fait insuffisant pour un fournisseur dont une violation pourrait exposer des millions de dossiers de clients. Sans conséquences, les exigences sont facultatives en pratique.

Minimums réglementaires et conditions standard

Pour les organisations réglementées, le contenu des contrats est en partie prescrit. La ligne directrice B-10 du BSIF énonce, dans une annexe, les dispositions que les contrats visant des ententes à risque élevé et critiques devraient traiter, notamment les droits d’audit, la déclaration des incidents, la sous-traitance, l’emplacement des données et la résiliation. L’article 30 de DORA énumère les principales dispositions contractuelles applicables à tous les contrats de services de TIC, ainsi que des dispositions supplémentaires pour ceux qui soutiennent des fonctions critiques ou importantes, notamment la description des niveaux de service, les délais de préavis, la participation aux programmes de sensibilisation à la sécurité et aux tests de résilience de l’entité financière, et les stratégies de sortie. Les organisations qui n’appartiennent pas à ces secteurs peuvent tout de même utiliser ces listes comme des listes de contrôle éprouvées.

Les gestionnaires devraient aussi s’attendre à ce que certains fournisseurs critiques n’offrent que des conditions standard non négociables. La ligne directrice B-10 du BSIF tient compte de cette réalité : elle reconnaît que les contrats normalisés laissent peu de marge de négociation et que les ententes ne feront pas toutes l’objet d’un contrat sur mesure, et elle s’attend à ce que les risques qui en découlent soient gérés par d’autres moyens, comme la surveillance, la continuité des activités et la planification d’urgence. La même rigueur s’applique ailleurs : lorsque l’organisation ne peut pas négocier, elle devrait documenter l’écart entre ses exigences et les conditions du fournisseur, déterminer des contrôles compensatoires (par exemple, une surveillance interne renforcée, un chiffrement sous ses propres clés ou un plan de sortie plus élaboré) et faire accepter le risque résiduel par le dirigeant imputable. C’est l’acceptation documentée qui transforme un écart inexécutable en une décision assumée.

## Accueil, surveillance continue et assurance continue : reconnaître que les fournisseurs changent

Le risque lié aux tiers est dynamique. Les fournisseurs ajoutent des fonctionnalités, modifient leurs architectures, restructurent leurs équipes, remplacent leurs sous-traitants, migrent vers de nouvelles plateformes d’hébergement, subissent des incidents et sont acquis. L’utilisation qu’une organisation fait d’un fournisseur change elle aussi : plus de données, plus d’utilisateurs, plus d’intégrations. Un instantané ponctuel de vérification diligente ne peut pas procurer une confiance durable. Le CSF 2.0 (GV.SC-07) demande que les risques liés aux fournisseurs soient compris, consignés, priorisés, évalués, traités et surveillés tout au long de la relation, et la mesure 5.22 de l’ISO/IEC 27002:2022 porte sur la surveillance, la revue et la gestion des changements des services des fournisseurs.

L’accueil comme point de contrôle

L’accueil est le moment où les promesses contractuelles rencontrent la réalité technique, et c’est un moment de risque accru. Des comptes sont créés, des identifiants et des clés d’API sont échangés — parfois par courriel —, des chemins réseau sont ouverts et les migrations de données commencent. La gouvernance devrait exiger que l’accueil des fournisseurs de niveaux 1 et 2 comprenne la vérification des contrôles dont dépend le contrat avant l’octroi de l’accès à la production : authentification unique et AMF configurées, comptes privilégiés attribués à des personnes nommément désignées, clés d’API limitées selon le principe du moindre privilège et stockées dans un gestionnaire de secrets, journalisation activée et transmise aux outils de surveillance de l’organisation, et flux de données documentés. C’est le volet intégration de la relation avec le fournisseur, et il relève de l’organisation, et non du fournisseur (voir le chapitre 10 au sujet des contrôles d’identité en cause).

Surveillance de gouvernance et surveillance technique

La surveillance continue peut être envisagée en deux couches. La première est la surveillance de gouvernance : renouvellement périodique des éléments probants clés (rapports d’assurance à jour, renouvellement des certificats, modifications de politiques), examen du rendement du service et de l’historique des incidents, confirmation des listes de sous-traitants, suivi des engagements de correction et évaluations au renouvellement qui réexaminent le niveau. Sa fréquence suit le niveau, comme l’indique l’exemple de tableau de classement présenté plus tôt dans ce chapitre.

La seconde est la surveillance technique. Elle peut comprendre la surveillance de la surface d’attaque externe et les cotes de sécurité, le renseignement sur les menaces portant sur les compromissions de fournisseurs, la surveillance des points d’intégration (comportement des API, profils d’authentification, sessions privilégiées) et les alertes en cas de transferts de données anormaux. Les cotes de sécurité, qui notent les organisations à partir d’indicateurs observables de l’extérieur, devraient être traitées avec prudence : elles détectent les problèmes évidents, comme les services exposés, et s’appliquent bien à grande échelle, mais elles ne voient que la surface externe, peuvent attribuer des actifs à tort et ne disent rien des contrôles internes. Elles constituent une alarme utile, et non un substitut à une assurance fondée sur des éléments probants.

Souvent, la surveillance la plus précieuse est la propre télémétrie de l’organisation : des comptes de fournisseurs qui s’authentifient depuis de nouveaux emplacements, une intégration qui télécharge beaucoup plus d’enregistrements que d’habitude ou un compte de soutien utilisé en dehors des fenêtres de maintenance convenues.

Déclencheurs, indicateurs et remontée

La surveillance devient de la gouvernance lorsqu’elle est reliée à des décisions. Les programmes devraient définir des déclencheurs de réévaluation : des événements qui ramènent un fournisseur en examen, quel que soit le calendrier. Les déclencheurs types comprennent un incident divulgué chez le fournisseur, un changement de propriétaire ou de siège social, un changement important des services ou des données en cause, la perte d’un rapport d’assurance ou l’émission d’une opinion avec réserve, une détérioration marquée des résultats de la surveillance externe, l’exploitation publique d’une vulnérabilité dans le produit du fournisseur et le non-respect répété des engagements de correction.

À l’échelle du portefeuille, un petit ensemble d’indicateurs clés de risque permet à la haute direction et au conseil d’administration de voir si le programme fonctionne. Parmi les indicateurs utiles figurent le pourcentage de fournisseurs actifs auxquels un niveau et un responsable ont été attribués; le pourcentage de fournisseurs de niveaux 1 et 2 disposant d’éléments probants d’assurance à jour; le nombre d’exceptions ouvertes et combien d’entre elles ont dépassé leur échéance; l’âge médian des éléments de correction ouverts chez les fournisseurs critiques; le nombre de fournisseurs critiques sans plan de sortie testé; et le nombre d’incidents provenant de fournisseurs au cours de la période. Chaque indicateur devrait être assorti d’un seuil de tolérance lié à l’appétence pour le risque, de sorte qu’un dépassement de la tolérance entraîne une décision plutôt qu’une note en bas de page dans un rapport.

Un programme mature intègre ces résultats à la reddition de comptes plus large sur les risques. Si la posture de risque d’un fournisseur critique se dégrade, la haute direction devrait recevoir une recommandation claire parmi un ensemble défini d’options : accepter le risque assorti d’un plan de correction et d’une échéance, appliquer des contrôles compensatoires, faire valoir les recours contractuels, restreindre la portée de la relation ou amorcer la planification de la transition. La valeur du programme réside dans le fait de rendre ce choix explicite, opportun et assumé.

## Risque de concentration : la dépendance à un fournisseur unique, un problème de gouvernance moderne

L’un des aspects les moins bien gouvernés de la cybersécurité des tiers est le risque de concentration. Même des fournisseurs très sécurisés peuvent créer une dépendance fragile. Si un grand fournisseur infonuagique, un fournisseur d’identité, un fournisseur de sécurité des terminaux ou un fournisseur de services gérés subit une panne ou une compromission, l’organisation peut perdre des capacités critiques, quelle que soit la qualité de ses contrôles internes. Le risque de concentration est donc une question de dépendance systémique, et non d’insécurité du fournisseur : il s’agit du recours à un fournisseur unique pour une fonction critique, à une échelle telle qu’un changement de fournisseur serait lent ou peu réaliste. Le chapitre 15 aborde les aspects propres à l’infonuagique, comme la conception multirégion et les sauvegardes logiquement isolées; la présente section traite de la concentration dans l’ensemble des dépendances externes, infonuagiques ou non.

Reconnaître la concentration à trois niveaux

La concentration se manifeste à trois niveaux, et la gouvernance devrait examiner chacun d’eux. La concentration organisationnelle survient lorsqu’un fournisseur soutient un grand nombre des services critiques de l’organisation, de sorte que sa défaillance entraîne une perturbation simultanée dans l’ensemble des activités — par exemple, lorsque l’identité, le courriel, la collaboration, le stockage de documents et la gestion des terminaux dépendent tous d’une seule plateforme. La concentration chez les parties de quatrième rang survient lorsque des fournisseurs apparemment indépendants s’appuient sur le même fournisseur en amont, de sorte que la diversification au niveau des fournisseurs directs est illusoire. La concentration sectorielle ou systémique survient lorsque de nombreuses organisations d’un secteur ou d’une économie dépendent des mêmes quelques fournisseurs, de sorte qu’une seule défaillance cause des préjudices corrélés chez les pairs, les clients et les contreparties au même moment.

La concentration systémique est la raison pour laquelle les organismes de réglementation sont intervenus. DORA a établi un cadre de surveillance à l’échelle de l’Union européenne pour les prestataires tiers critiques de services de TIC (CTPP). En novembre 2025, les autorités européennes de surveillance ont publié la première liste de CTPP désignés — dix-neuf fournisseurs, principalement de grandes entreprises infonuagiques, de plateformes et de technologies —, établie en partie à partir des registres d’information soumis par les entités financières. Chaque fournisseur désigné se voit attribuer un superviseur principal et devient assujetti à un examen de surveillance direct, les activités de surveillance commençant en 2026. La ligne directrice B-10 du BSIF demande de même aux institutions financières fédérales d’évaluer le risque de concentration selon plusieurs dimensions, notamment la géographie, le fournisseur et le sous-traitant, et de tenir compte tant de leur propre dépendance excessive envers un fournisseur que du risque systémique à l’échelle des institutions.

La leçon de juillet 2024

La panne informatique mondiale du 19 juillet 2024 a illustré le risque de concentration sans l’intervention d’aucun acteur malveillant. Une mise à jour de contenu défectueuse du capteur Falcon de CrowdStrike a provoqué la défaillance des systèmes Windows qui l’exécutaient; Microsoft a estimé qu’environ 8,5 millions d’appareils Windows avaient été touchés. Des transporteurs aériens, des hôpitaux, des diffuseurs, des banques et des détaillants de nombreux pays ont été perturbés le même jour, et, pour de nombreuses organisations, le rétablissement a exigé une intervention manuelle sur chaque machine. Le fournisseur était un fournisseur de sécurité réputé, choisi précisément pour réduire le risque, et son produit exigeait une intégration profonde et privilégiée au système d’exploitation pour remplir sa fonction.

Les leçons de gouvernance ne concernent pas ce fournisseur en particulier. Elles portent sur des questions qui s’appliquent à tout fournisseur disposant de canaux de mise à jour automatiques et privilégiés vers des systèmes critiques. L’organisation sait-elle quels fournisseurs peuvent pousser des changements dans son environnement de production sans sa propre approbation? Comprend-elle les pratiques du fournisseur en matière de test des mises à jour et de déploiement progressif, et le contrat lui donne-t-il un quelconque contrôle sur le moment des mises à jour? Ses plans de continuité des activités comprennent-ils un scénario dans lequel une grande partie des terminaux tombent en panne simultanément, et la reprise dépend-elle d’outils ou de personnes qui seraient eux-mêmes touchés? Le chapitre 12 traite en profondeur de la planification de la résilience; ce qu’il faut retenir ici, c’est que la gouvernance des tiers doit alimenter le bilan d’impact sur les activités (BIA) avec une information réaliste sur les dépendances.

Mesurer et traiter la concentration

La concentration ne peut être gérée sans être rendue visible. Le registre des tiers, enrichi d’information sur les services critiques que chaque fournisseur soutient et sur les parties de quatrième rang importantes sur lesquelles chaque fournisseur s’appuie, permet à l’organisation de produire une carte des dépendances simple : pour chaque service critique, la chaîne de fournisseurs externes dont il dépend. Même une carte sommaire révèle généralement des surprises, comme plusieurs fournisseurs SaaS hébergés dans la même région infonuagique.

Les réponses de gouvernance varient selon la criticité et la faisabilité. Dans certains cas, une conception multirégion chez un seul fournisseur et une planification solide de la continuité suffisent. Dans d’autres, des stratégies multifournisseurs ou un découplage architectural se justifient, en particulier pour l’identité, les communications critiques et le stockage des sauvegardes, là où une seule compromission ou une seule panne paralyserait autrement la reprise elle-même. Conserver des sauvegardes immuables et une capacité minimale de communication hors bande en dehors de l’écosystème du fournisseur principal est une mesure courante et proportionnée. Dans d’autres cas encore, l’organisation peut décider d’accepter la concentration parce que les avantages d’une plateforme intégrée unique l’emportent sur le risque. C’est un choix légitime, mais il devrait être fait explicitement, documenté comme une dépendance stratégique portée à la connaissance du conseil d’administration et appuyé par des plans d’urgence, plutôt que découvert au cours d’une panne.

Le risque de concentration est souvent la raison pour laquelle les plans de reprise échouent : lorsque le goulot d’étranglement est une dépendance externe, l’organisation ne peut pas rétablir ce qu’elle ne contrôle pas.

## Risque lié aux parties de quatrième rang et chaîne d’approvisionnement logicielle : gérer l’exposition transitive

Le risque lié aux parties de quatrième rang et le risque lié à la chaîne d’approvisionnement logicielle sont les expressions les plus concrètes de la cybersécurité de la chaîne d’approvisionnement. Ils concernent les services et les composants externes que les fournisseurs utilisent pour livrer ce que l’organisation achète : sous-traitants, fournisseurs d’hébergement, bibliothèques logicielles, paquets à code source ouvert, systèmes de compilation et partenaires de services spécialisés. L’organisation ne peut pas auditer chaque partie de quatrième rang, et elle ne peut pas inspecter chaque ligne de code de chaque produit qu’elle utilise. La gouvernance doit donc s’appuyer sur des mécanismes extensibles qui délimitent, surveillent et gèrent contractuellement l’exposition transitive plutôt que de tenter de l’éliminer.

Gérer les parties de quatrième rang par le contrat, l’architecture et les éléments probants

Trois mécanismes rendent le risque lié aux parties de quatrième rang gérable. Le premier est contractuel : exiger des fournisseurs qu’ils imposent des obligations équivalentes à leurs sous-traitants, qu’ils tiennent à jour et communiquent une liste de leurs sous-traitants importants, qu’ils avisent l’organisation des changements et qu’ils demeurent responsables des services sous-traités. Le deuxième est architectural : limiter ce que tout fournisseur peut exposer, au moyen du chiffrement sous des clés que l’organisation contrôle, de la minimisation des données, de la segmentation et d’une intégration fondée sur le moindre privilège, de sorte que, même si une partie de quatrième rang est compromise, le rayon d’impact demeure limité. Le troisième est fondé sur les éléments probants : examiner la façon dont les fournisseurs gouvernent leurs propres fournisseurs, notamment la façon dont les rapports d’assurance traitent les sociétés sous-traitantes exclues et la question de savoir si le fournisseur dispose lui-même d’un programme de gestion du risque lié aux fournisseurs.

Pourquoi les chaînes d’approvisionnement logicielles sont devenues un enjeu pour les conseils d’administration

Les attaques de la chaîne d’approvisionnement logicielle ciblent le processus par lequel les logiciels sont compilés et distribués, de sorte qu’une seule compromission atteint tous les utilisateurs en aval. La compromission du processus de compilation d’Orion de SolarWinds, divulguée en décembre 2020, a inséré du code malveillant dans des mises à jour signées distribuées à des milliers de clients, dont des organismes gouvernementaux. L’incident Kaseya VSA de juillet 2021 a utilisé un produit de gestion à distance sur lequel s’appuyaient des fournisseurs de services gérés pour transmettre un rançongiciel aux propres clients de ces fournisseurs. En mars 2024, une porte dérobée introduite délibérément dans la bibliothèque de compression à code source ouvert XZ Utils, par un contributeur qui avait passé une longue période à gagner la confiance des responsables du projet, a été découverte peu avant qu’elle ne puisse atteindre des distributions Linux largement utilisées. Chaque cas a exploité la confiance : les clients ont accepté des mises à jour et des composants parce qu’ils provenaient de sources légitimes et dignes de confiance.

Pour les gestionnaires, la leçon est que la sécurité des logiciels achetés et à code source ouvert dépend autant des pratiques de développement et de compilation du fournisseur que des fonctionnalités du produit. Les applications modernes sont en grande partie assemblées à partir de composants de tiers et à code source ouvert, ce qui signifie que toute organisation qui développe ou achète des logiciels participe à une chaîne d’approvisionnement logicielle, qu’elle se perçoive ainsi ou non. La gouvernance ne peut pas évaluer le code directement, mais elle peut exiger des preuves de pratiques rigoureuses et la transparence quant aux composants (le chapitre 13 traite du volet ingénierie du développement sécurisé).

Ce qu’il faut exiger : SSDF, SBOM et SLSA

Trois référentiels donnent aux gestionnaires un vocabulaire pour formuler ces exigences. Le Secure Software Development Framework (SSDF), publication NIST SP 800-218 version 1.1 (février 2022), décrit des pratiques de développement sécurisé de haut niveau regroupées en quatre volets : préparer l’organisation, protéger le logiciel, produire un logiciel bien sécurisé et répondre aux vulnérabilités. Il sous-tend l’attestation fédérale américaine de développement logiciel sécurisé que les producteurs de logiciels qui vendent aux organismes fédéraux américains doivent fournir. Le NIST a publié en décembre 2025 une première ébauche publique de la publication SP 800-218 Rev. 1, SSDF version 1.2; au moment de la rédaction, elle n’avait pas été finalisée, de sorte que les organisations devraient faire référence à la version 1.1 dans leurs contrats tout en suivant la révision.

Une nomenclature logicielle (SBOM) est un inventaire formel et lisible par machine des composants d’un logiciel et de leurs relations. Sa valeur de gouvernance tient à la rapidité : lorsqu’une vulnérabilité est annoncée dans un composant largement utilisé, une organisation qui détient les SBOM de ses logiciels critiques peut déterminer son exposition en quelques heures plutôt qu’en quelques semaines. Le contenu minimal attendu d’une SBOM a d’abord été défini par la NTIA américaine en 2021. En 2026, la CISA, avec des organismes partenaires américains et internationaux, a publié une version à jour des Minimum Elements for a Software Bill of Materials, à la suite d’une ébauche soumise aux commentaires du public en août 2025. Entre autres changements, la mise à jour prévoit qu’une SBOM consigne les empreintes et les licences des composants et qu’elle indique à la fois l’outil qui l’a produite et les circonstances de sa production; certains noms de champs de 2021 ont aussi été modifiés. Les gestionnaires n’ont pas besoin de maîtriser les formats; ils devraient s’assurer que les contrats de logiciels critiques exigent des SBOM conformes aux éléments minimaux actuels, que l’organisation a la capacité de les intégrer et de les interroger, et que les SBOM sont jumelées à de l’information sur l’exploitabilité des vulnérabilités, afin que les équipes ne soient pas submergées par des composants présents, mais non exploitables.

Supply-chain Levels for Software Artifacts (SLSA), une spécification de l’OpenSSF, définit des niveaux progressifs d’assurance quant à la façon dont les artefacts logiciels sont compilés et dont leur provenance peut être vérifiée. La version 1.0 (2023) a établi le volet Build (compilation); la version 1.2, publiée en novembre 2025, a ajouté un volet Source portant sur la façon dont le code source est écrit, révisé et contrôlé avant d’être compilé. Pour un acheteur, SLSA offre un moyen de demander à un fournisseur dans quelle mesure il peut être certain que le logiciel qu’il livre a été compilé à partir de la source prévue, selon le processus prévu, sans altération.

La figure ci-dessous situe ces éléments le long de la chaîne d’approvisionnement logicielle et aux côtés des services de parties de quatrième rang dont dépendent les fournisseurs.

Figure 80 : gouverner la chaîne d’approvisionnement logicielle et les parties de quatrième rang

Le virage réglementaire : le règlement européen sur la cyberrésilience

La réglementation fait remonter la responsabilité vers les fabricants. Le règlement européen sur la cyberrésilience (CRA), règlement (UE) 2024/2847, est entré en vigueur le 10 décembre 2024. Il exige des fabricants de produits comportant des éléments numériques mis sur le marché de l’Union européenne qu’ils satisfassent à des exigences essentielles de cybersécurité tout au long du cycle de vie du produit, notamment le développement axé sur la sécurité dès la conception, le traitement des vulnérabilités, les mises à jour de sécurité pendant une période de soutien définie et une documentation technique comprenant une SBOM. Ses obligations de déclaration s’appliquent depuis le 11 septembre 2026 : les fabricants doivent signaler les vulnérabilités activement exploitées et les incidents graves au CSIRT national désigné et à l’ENISA, au moyen d’une alerte précoce dans les 24 heures et d’une notification plus complète dans les 72 heures. La plupart des autres obligations s’appliquent à compter du 11 décembre 2027.

Pour les organisations canadiennes, le CRA importe de deux façons. Celles qui fabriquent des logiciels ou des produits connectés vendus dans l’Union européenne y sont directement assujetties. Celles qui ne font qu’acheter en bénéficieront indirectement, car les fournisseurs qui desservent le marché européen seront de plus en plus en mesure de fournir d’emblée des SBOM, des engagements en matière de traitement des vulnérabilités et des énoncés de période de soutien. Les équipes d’approvisionnement devraient demander ces documents même aux fournisseurs qui ne sont pas légalement tenus de les fournir; le CRA est en train d’en faire rapidement des normes du marché. Les orientations du Centre canadien pour la cybersécurité sur l’évaluation des cyberrisques liés à la chaîne d’approvisionnement (ITSAP.10.070) offrent un point de départ complémentaire, propre au Canada, aux organisations qui mettent sur pied leur programme.

## Coordination des incidents : lorsque la violation survient ailleurs

Lorsqu’un incident prend naissance chez un fournisseur, l’organisation fait face à un problème de gouvernance particulier : elle est imputable des conséquences, mais ne contrôle ni l’enquête ni une grande partie de l’information. La préparation importe donc plus que d’habitude, car les leviers dont on dispose pendant l’événement sont surtout ceux qui ont été établis avant celui-ci. Le chapitre 12 traite de la gestion des incidents et de la continuité en général; la présente section porte sur ce qui distingue les événements provenant des fournisseurs.

Se préparer aux incidents provenant des fournisseurs

Plusieurs préparatifs distinguent les organisations qui gèrent bien les incidents des fournisseurs. Elles tiennent à jour les coordonnées des personnes-ressources en sécurité de chaque fournisseur de niveau 1 et de niveau 2, et les testent au moins une fois par année. Elles disposent de guides d’intervention (playbooks) pour les principaux scénarios liés aux fournisseurs — violation de données chez un fournisseur, rançongiciel chez un fournisseur causant une panne, compromission des identifiants ou du canal de mise à jour d’un fournisseur, et exploitation massive d’un produit d’un fournisseur —, assortis de décisions prédéfinies, par exemple le moment où il faut déconnecter une intégration. Elles savent, grâce au registre, quelles données chaque fournisseur détient, de sorte que les équipes juridiques et de protection des renseignements personnels peuvent évaluer rapidement les obligations d’avis. Et elles incluent les fournisseurs critiques dans les exercices sur table, comme le recommande le résultat GV.SC-08 du CSF 2.0, afin que les deux parties comprennent leurs rôles avant que ceux-ci ne soient mis à l’épreuve.

La décision de suspendre ou de déconnecter une intégration avec un fournisseur mérite une réflexion préalable. La déconnexion peut contenir la menace, mais aussi interrompre un processus d’affaires. Le pouvoir de prendre cette décision, les critères qui la justifient et les mesures de continuité des activités qui prennent le relais devraient être convenus à l’avance avec le responsable métier, et non débattus à deux heures du matin.

Mise en situation : une compromission d’une solution de transfert de fichiers chez un détaillant canadien

Prenons Nordet Outfitters, un détaillant canadien fictif de taille moyenne dont le siège social est à Montréal et qui exploite des magasins dans quatre provinces. Parmi ses nombreux fournisseurs figure une firme d’analytique marketing. La firme reçoit chaque semaine un extrait contenant le nom, l’adresse courriel, le code postal et l’historique d’achats des membres du programme de fidélisation, au moyen d’un produit de transfert de fichiers géré qu’elle héberge elle-même. Nordet a évalué la firme il y a trois ans et l’a classée au niveau 3 : un questionnaire a été rempli, aucun rapport indépendant n’a été demandé, et l’annexe de sécurité du contrat se limitait aux conditions standard du fournisseur. Personne n’a consigné quel produit de transfert de fichiers la firme utilisait.

Un vendredi de la fin du printemps, un groupe criminel entreprend l’exploitation massive d’une vulnérabilité jusque-là inconnue de ce produit de transfert de fichiers, volant des données dans toutes les installations exposées à Internet qu’il peut trouver avant qu’un correctif ne soit disponible — le scénario observé lors de la campagne visant MOVEit Transfer en 2023, que la CISA et le FBI ont attribuée au groupe de rançongiciel CL0P. La firme de marketing apprend l’existence de la vulnérabilité le mardi par l’avis de l’éditeur du logiciel, applique le correctif et entreprend une enquête. Elle avise Nordet douze jours plus tard, après avoir confirmé que des fichiers avaient été dérobés, car ses conditions standard n’exigent un avis que pour les violations confirmées, « sans retard indu ». Entre-temps, le groupe a publié le nom de Nordet sur son site de fuites, et un journaliste a appelé l’équipe des communications du détaillant.

La réponse de Nordet met au jour chacune des lacunes, l’une après l’autre. L’équipe d’intervention ne peut pas dire immédiatement combien de membres du programme de fidélisation figurent dans les extraits, car le registre ne consigne pas les volumes de données pour les fournisseurs de niveau 3. Les conseillers juridiques doivent déterminer si l’incident présente un risque qu’un préjudice sérieux soit causé au sens de la Loi 25 et un risque réel de préjudice grave au sens de la LPRPDE, et ils doivent aviser la Commission d’accès à l’information, le Commissariat à la protection de la vie privée du Canada et les personnes concernées, selon les exigences, mais le rapport d’enquête du fournisseur n’arrivera pas avant plusieurs semaines. Le contrat ne donne à Nordet aucun droit sur les constatations de l’enquête criminalistique et plafonne la responsabilité du fournisseur à une année de frais, soit une petite fraction du coût prévu des avis, du soutien par centre d’appels et de la surveillance du crédit. Pendant ce temps, le CSI de Nordet pose la question qui s’impose — quels autres fournisseurs utilisent le même produit? — et découvre que personne ne le sait. Des questionnaires sont envoyés à soixante fournisseurs; les réponses arrivent au compte-gouttes sur trois semaines.

Lorsque le conseil d’administration examine l’incident, la leçon qu’il en tire n’est pas que la firme de marketing a fait preuve de négligence; la vulnérabilité était inconnue et a été exploitée avant même qu’un correctif n’existe. La leçon est que la gouvernance de Nordet a considéré la relation comme à faible risque parce que la firme était petite et son service non critique, tout en ignorant complètement le facteur de sensibilité des données : la firme détenait des renseignements personnels sur plusieurs centaines de milliers de clients. Le conseil approuve quatre changements. Tout fournisseur qui détient des renseignements personnels de la clientèle au-delà d’un seuil de volume est reclassé au moins au niveau 2, avec des éléments probants indépendants, un avis contractuel des incidents soupçonnés dans un nombre d’heures défini, des droits sur les constatations d’enquête et des clauses de responsabilité examinées par le comité des risques. Le registre consignera les parties de quatrième rang importantes et les principaux produits logiciels des fournisseurs de niveaux 1 et 2, afin que la portée du prochain événement d’exploitation massive puisse être déterminée en quelques heures. La minimisation des données est appliquée à l’extrait hebdomadaire, qui est réduit à des identifiants pseudonymisés et à des catégories d’achats, ce qui restreint le rayon d’impact de toute compromission future. Enfin, un ICR qui suit le pourcentage de fournisseurs détenant des renseignements personnels et disposant d’éléments probants à jour est ajouté à la reddition de comptes trimestrielle, assorti d’un seuil de tolérance.

Leçons tirées des événements d’exploitation massive

Dans le cas de MOVEit Transfer, une seule vulnérabilité d’injection SQL (CVE-2023-34362) dans un produit largement utilisé a entraîné des vols de données touchant un très grand nombre d’organisations, dont beaucoup ont subi un préjudice non pas parce qu’elles exploitaient elles-mêmes le logiciel, mais parce qu’un fournisseur de services de paie, un administrateur de régimes de retraite ou un autre prestataire de services le faisait. Trois leçons de gouvernance peuvent être généralisées. Premièrement, la sensibilité des données peut rendre un fournisseur critique même lorsque son service ne l’est pas, et les modèles de classement qui ne pondèrent que la criticité opérationnelle classeront mal ces fournisseurs. Deuxièmement, les clauses d’avis liées aux violations confirmées sont trop lentes pour les événements d’exploitation massive; la compromission soupçonnée est le bon déclencheur. Troisièmement, savoir quels produits et quelles parties de quatrième rang se trouvent derrière la relation avec un fournisseur est ce qui permet à une organisation de déterminer rapidement son exposition lorsque le prochain produit largement utilisé sera exploité.

## Planification de la sortie et de la transition : préserver la capacité de partir

La planification de la sortie est un contrôle de cybersécurité. Si l’organisation ne peut pas se détacher d’un fournisseur sans perturbation grave, elle s’est enfermée dans une dépendance stratégique qui accroît le risque et réduit sa capacité à faire respecter toutes les autres exigences présentées dans ce chapitre. Du point de vue de la gouvernance, l’absence d’option de sortie constitue une perte d’autonomie, et elle doit être reconnue comme telle.

Pourquoi la sortie est une exigence de gouvernance

Pour les fournisseurs critiques, la gouvernance devrait exiger au minimum une stratégie de sortie documentée, même s’il est peu probable qu’elle soit mise à exécution prochainement. Il ne s’agit pas de pessimisme, mais d’une planification ordinaire de la résilience. Un fournisseur peut faire faillite, faire l’objet de sanctions, être acquis par un concurrent ou par un propriétaire établi dans un territoire que l’organisation ne peut accepter, modifier radicalement ses prix, retirer un produit, ou encore subir des pannes ou des compromissions prolongées. Si l’organisation n’a pas de plan de transition, elle est contrainte de prendre des décisions sous pression, avec un faible pouvoir de négociation et une information incomplète. Les organismes de réglementation ont fait le même constat : la ligne directrice B-10 du BSIF prévoit une planification de la sortie pour les ententes avec des tiers, et DORA exige des entités financières qu’elles disposent de stratégies de sortie pour les services de TIC qui soutiennent des fonctions critiques ou importantes. Le CSF 2.0 (GV.SC-10) présente les activités postérieures à la relation comme faisant partie des résultats de la C-SCRM. Pour les services infonuagiques en particulier, le chapitre 15 décrit la stratégie de sortie attendue en vertu de la mesure 5.23 de l’ISO/IEC 27002:2022 et les droits de changement de fournisseur créés par le règlement sur les données (Data Act) de l’Union européenne.

Le niveau de détail devrait correspondre au niveau de risque du fournisseur : un plan de niveau 1 précise les solutions de rechange, le délai et le coût de la migration ainsi que les arrangements provisoires, tandis que les niveaux inférieurs s’appuient habituellement sur des clauses contractuelles types de restitution et de suppression des données.

Éléments d’un plan de sortie crédible

Un plan de sortie crédible traite plusieurs éléments concrets :

- La portabilité des données précise quelles données seront restituées, dans quel format, à quelle fréquence les exportations peuvent être testées pendant la relation et si le format est utilisable sans le logiciel du fournisseur.
- L’aide à la transition définit l’aide que le fournisseur doit apporter pendant la migration, pendant combien de temps et à quel coût, ainsi que les obligations de continuité pendant la période de préavis.
- La révocation des accès énumère chaque compte, identifiant, clé d’API, certificat, chemin réseau et relation de confiance de fédération qui doit être supprimé, et attribue la responsabilité de confirmer cette suppression.
- Les dispositions de continuité décrivent la façon dont les services critiques seront maintenus pendant la transition et les processus provisoires, manuels ou de rechange, qui existent.
- Les données et documents résiduels couvrent les sauvegardes, les journaux et les copies archivées conservés par le fournisseur et ses sous-traitants, les exigences de conservation des documents relatifs aux incidents et aux audits, ainsi que les mesures de préservation de la preuve (legal hold).
C’est la mise à l’essai qui distingue un plan d’un simple espoir. Exporter périodiquement un échantillon de données et confirmer qu’il peut être restauré ou chargé ailleurs coûte peu et révèle souvent des problèmes — formats propriétaires, métadonnées manquantes ou volumes dont le transfert prendrait des semaines — qu’il vaut de loin mieux découvrir à l’avance.

Éléments probants à la fin de la relation

La planification de la sortie recoupe aussi les obligations en matière de protection des renseignements personnels et des données (voir le chapitre 16). La fin d’une relation est souvent le moment où la restitution et la destruction des données doivent pouvoir être démontrées, et celui où les accès résiduels risquent le plus d’être oubliés. Les listes de vérification de fin de relation devraient donc comprendre des exigences en matière d’éléments probants : certificats ou attestations de destruction, s’il y a lieu, confirmation de la suppression dans les sauvegardes au rythme des cycles de sauvegarde, confirmation écrite que les sous-traitants ont eux aussi supprimé les données, et documents montrant que tous les chemins d’accès ont été révoqués. Les comptes et les intégrations laissés en place après la fin d’une relation sont une source récurrente de violations, parce que personne ne surveille un accès censé ne plus exister. Le registre des tiers devrait garder les relations terminées visibles jusqu’à ce que les éléments probants de la sortie soient complets.

## Modèle opérationnel : à qui appartient la gouvernance de la cybersécurité des tiers

Parce que la cybersécurité des tiers touche plusieurs fonctions, les organisations échouent souvent en présumant qu’elle relève de quelqu’un d’autre. L’approvisionnement croit que la sécurité examine les fournisseurs; la sécurité croit que l’approvisionnement contrôle le processus; le service juridique croit que l’unité d’affaires a accepté les conditions; l’unité d’affaires croit que les trois autres s’en sont occupés. Une gouvernance mature définit un modèle opérationnel clair, assorti de droits décisionnels explicites, comme le recommande le CSF 2.0 (GV.SC-02) pour les rôles et responsabilités en matière de C-SCRM, et comme le fait COBIT 2019 au moyen de son objectif de gestion relatif aux fournisseurs gérés (APO10).

Rôles et droits décisionnels

Le modèle opérationnel répartit les responsabilités selon les axes ci-dessous. Les appellations varient d’une organisation à l’autre, mais chaque responsabilité doit être assumée par quelqu’un.

- Les responsables métier sont responsables de la relation et de l’acceptation du risque. Ils choisissent des fournisseurs qui répondent aux besoins d’affaires, fournissent des renseignements exacts lors de la collecte initiale servant au classement par niveau de risque et acceptent explicitement le risque résiduel lorsque les exigences ne peuvent être satisfaites. L’imputabilité à l’égard du risque lié aux tiers incombe au responsable métier, et non à l’équipe de sécurité.
- L’approvisionnement est responsable de la rigueur du processus. Il veille à ce que les exigences de sécurité apparaissent tôt, à ce que les points de contrôle d’examen soient respectés, à ce que des modèles adaptés au niveau de risque soient utilisés, et à ce que les achats effectués en dehors du processus soient détectés et ramenés dans celui-ci.
- Le service juridique est responsable du caractère exécutoire. Il traduit les exigences en libellés contractuels, gère les clauses de droit d’audit, de notification, de responsabilité et de résiliation, et tient à jour les annexes de sécurité types.
- La direction de la protection des renseignements personnels est responsable de la gouvernance des renseignements personnels. Elle veille au respect des exigences relatives au traitement, à la résidence, à la conservation et au transfert transfrontalier des données, et à la réalisation d’évaluations des facteurs relatifs à la vie privée lorsqu’elles sont requises, comme l’exige la Loi 25 pour les communications à l’extérieur du Québec.
- La fonction du CSI est responsable des exigences de sécurité et de l’assurance. Elle définit les bases de référence des contrôles par niveau de risque, évalue les éléments probants des fournisseurs, conçoit les contrôles d’intégration, surveille les fournisseurs critiques et conseille les responsables métier sur le risque résiduel.
- Les fonctions de continuité des activités et de résilience sont responsables de la planification des dépendances. Elles intègrent la criticité, la substituabilité et la concentration des fournisseurs dans les bilans d’impact sur les activités et les plans de reprise.
Trois lignes et remise en question indépendante

Le modèle des trois lignes précise le fonctionnement de la surveillance. Les responsables métier, l’approvisionnement et les équipes de sécurité opérationnelle forment la première ligne : ils exécutent les activités du cycle de vie et sont responsables des risques. Les fonctions de gestion des risques et de conformité de la deuxième ligne établissent le cadre, définissent le classement par niveau de risque et ses liens avec l’appétence, surveillent les indicateurs et remettent en question les exceptions. L’audit interne, en tant que troisième ligne, fournit une assurance indépendante que le programme fonctionne comme prévu — par exemple en sélectionnant un échantillon de fournisseurs pour vérifier que leur niveau de risque est correct, que les éléments probants requis ont été obtenus et examinés, que les exceptions ont été approuvées et ne sont pas échues, et que les éléments probants de sortie existent pour les relations terminées. Les comités des risques ou d’audit du conseil reçoivent des rapports sur le programme et sur les risques liés aux fournisseurs critiques, et ils devraient examiner périodiquement la cartographie des dépendances et la liste des dépendances stratégiques acceptées au nom de l’organisation. Le chapitre 21 revient sur la question plus large de la conception des mécanismes de reddition de comptes dans l’ensemble de l’organisation.

Questions que les gestionnaires et les conseils d’administration devraient poser

Les questions suivantes aident les dirigeants et les administrateurs à vérifier si la gouvernance de la cybersécurité des tiers est réelle ou simplement documentée :

- Inventaire : Disposons-nous d’un registre complet des tiers, et quel pourcentage des fournisseurs actifs se sont vu attribuer un niveau de risque, un responsable et un état d’évaluation?
- Dépendances critiques : Quels fournisseurs, s’ils faisaient défaut ou étaient compromis demain, interrompraient nos services critiques ou exposeraient nos données les plus sensibles, et figurent-ils tous dans notre niveau de risque le plus élevé?
- Logique de classement : Notre modèle de classement par niveau de risque accorde-t-il autant de poids à la sensibilité des données qu’à la criticité opérationnelle, de sorte que les petits fournisseurs qui détiennent de grands volumes de renseignements personnels ne soient pas sous-estimés?
- Qualité des éléments probants : Pour nos fournisseurs critiques, nous appuyons-nous sur des éléments probants indépendants dont la portée couvre les services que nous utilisons, et exécutons-nous les contrôles complémentaires que ces rapports présupposent?
- Solidité des contrats : Nos contrats critiques exigent-ils la notification des incidents soupçonnés dans des délais compatibles avec nos propres échéances réglementaires, et nous donnent-ils droit aux renseignements dont nous aurions besoin?
- Écarts acceptés : Quels écarts importants dans la sécurité des fournisseurs ou dans les modalités contractuelles avons-nous acceptés, qui les a acceptés, quels contrôles compensatoires s’appliquent, et quand ces acceptations prennent-elles fin?
- Canaux privilégiés : Quels fournisseurs peuvent accéder à notre environnement avec des privilèges d’administration ou déployer des mises à jour en production sans notre approbation, et comment cet accès est-il sécurisé et surveillé?
- Concentration : Où dépendons-nous d’un seul fournisseur, directement ou par l’intermédiaire des fournisseurs de nos fournisseurs, et cette dépendance a-t-elle été acceptée comme décision stratégique assortie de plans d’urgence?
- Chaîne d’approvisionnement logicielle : Pour les logiciels qui font fonctionner nos services critiques, pouvons-nous déterminer en moins d’une journée si nous sommes exposés à une vulnérabilité nouvellement annoncée dans un composant largement utilisé?
- Sortie : Pour chaque fournisseur critique, disposons-nous d’une stratégie de sortie documentée, et avons-nous vérifié que nos données peuvent être exportées et utilisées ailleurs?
- Préparation aux incidents : Nos fournisseurs critiques ont-ils participé avec nous à un exercice d’incident au cours de la dernière année, et savons-nous qui déciderait de déconnecter une intégration compromise?
- Assurance à l’égard du programme : Quand l’audit interne a-t-il testé le programme de gestion des tiers pour la dernière fois, et qu’a-t-il constaté?
L’imputabilité à l’égard du risque lié aux tiers appartient au responsable métier de la relation; la sécurité, l’approvisionnement et le service juridique éclairent la décision, mais ils ne peuvent pas accepter le risque au nom de l’unité d’affaires.

## Synthèse : rendre la gouvernance de la cybersécurité des tiers exécutoire et auditable

La gouvernance des tiers et de la chaîne d’approvisionnement convertit les intentions en matière de cybersécurité en obligations qui peuvent être imposées à quelqu’un d’autre. Au fil de ce chapitre, l’appétence pour le risque est devenue des exigences minimales par niveau de risque, les exigences sont devenues des critères des demandes de propositions et des clauses contractuelles, l’assurance est passée des questionnaires aux éléments probants indépendants, et la résilience en est venue à dépendre de la connaissance de la chaîne de dépendances et du maintien d’une porte de sortie crédible.

Le paysage des référentiels appuie ce modèle. La norme ISO/IEC 27036 et la publication NIST SP 800-161 Rev. 1 décrivent comment bâtir le programme; la catégorie GV.SC du NIST CSF 2.0 énonce les résultats que la gouvernance devrait atteindre; l’ISO/IEC 27001:2022 intègre les contrôles relatifs aux fournisseurs dans le SGSI; le SSDF, les éléments minimaux de la SBOM et SLSA fournissent un vocabulaire pour l’assurance logicielle; et la ligne directrice B-10 du BSIF, DORA et le règlement sur la cyberrésilience de l’Union européenne montrent la direction que prennent les autorités de surveillance et les législateurs. Aucun de ces référentiels ne remplace le jugement. Chacun aide à rendre le jugement structuré, cohérent et défendable.

L’objectif managérial n’est pas d’éliminer le risque lié aux tiers, ce qui est impossible dans les écosystèmes modernes. L’objectif est de le rendre gouvernable : savoir quelles relations comptent le plus, imposer des exigences proportionnées, obtenir une assurance crédible au-delà de l’autoattestation, surveiller en continu et agir en fonction de ce que révèle la surveillance, gérer consciemment la concentration et le risque lié aux parties de quatrième rang, se préparer aux incidents qui prennent naissance ailleurs, et conserver la capacité de partir lorsque la dépendance devient inacceptable. Lorsque ces pratiques sont en place, la posture de cybersécurité de l’organisation devient moins fragile à ses frontières et plus défendable auprès des organismes de réglementation, de la clientèle et des parties prenantes. Surtout, elle devient plus résiliente dans un monde où les systèmes critiques se trouvent de plus en plus hors du contrôle direct de l’organisation. Le chapitre suivant porte sur la cryptographie et la gestion des clés, l’un des rares leviers techniques qui permettent à une organisation de garder le contrôle de ses données même lorsque ces données se trouvent chez des tiers.

## Résumé du chapitre

La gouvernance de la cybersécurité réussit ou échoue de plus en plus aux frontières de l’organisation, car les plateformes infonuagiques, les fournisseurs de services gérés, les composants logiciels et les fournisseurs spécialisés peuvent toucher les services critiques et l’information sensible autant que les systèmes internes. Ce chapitre soutient que le risque lié aux tiers n’est pas une formalité d’approvisionnement, mais la discipline qui transforme les attentes en matière de cybersécurité en obligations exécutoires. Il présente un cycle de vie complet : planification et classement par niveau, vérification diligente, exigences d’approvisionnement, contractualisation, intégration et surveillance, risque de concentration et risque lié aux parties de quatrième rang, assurance de la chaîne d’approvisionnement logicielle, coordination des incidents et sortie. Le but n’est pas d’éliminer le risque lié aux tiers, ce qui est impossible, mais de le rendre gouvernable, étayé par des éléments probants et défendable, l’imputabilité reposant sur le responsable métier de chaque relation.

Points clés à retenir

- Un tiers est toute entité externe dont la défaillance ou la compromission pourrait toucher de façon importante l’information de l’organisation, ses obligations en matière de vie privée ou ses services critiques, quel que soit le type de contrat.
- Le risque lié aux parties de quatrième rang provient des propres fournisseurs des fournisseurs et peut masquer une concentration derrière une base de fournisseurs en apparence diversifiée.
- Le cycle de vie de la relation comporte sept étapes, et chacune exige des points de contrôle où une personne désignée prend une décision consignée sur la base d’éléments probants définis, ce qui évite l’écueil « accepter puis oublier ».
- Le classement par niveau selon la sensibilité des données, la criticité du service, l’accès et l’intégration, et la substituabilité rend l’effort proportionné; chaque niveau doit avoir ses propres contrôles, éléments probants, approbations et fréquence de surveillance.
- Les questionnaires sont des outils de filtrage qui mesurent des déclarations; les éléments probants indépendants, comme les rapports SOC 2 de type II, doivent être lus en fonction de la portée, de la période, des exceptions, des exclusions (carve-outs) et des contrôles complémentaires chez l’entité utilisatrice.
- Les exigences de sécurité et une courte liste de critères éliminatoires tirés de l’appétence pour le risque devraient être fixées dans la demande de propositions (DP), avant la sélection, quand l’organisation a encore un levier de négociation.
- Les contrats donnent une réalité juridique à la gouvernance grâce aux annexes de sécurité, aux droits d’audit, à l’avis d’incident soupçonné aligné sur les échéances réglementaires, aux contrôles des sous-traitants, aux modalités de traitement des données et à des recours significatifs.
- Les points de contrôle d’intégration, la surveillance de gouvernance et la surveillance technique, les déclencheurs de réévaluation et les ICR de portefeuille assortis de seuils de tolérance maintiennent l’assurance à jour à mesure que les fournisseurs évoluent.
- Le risque de concentration relève de la dépendance systémique plutôt que de l’insécurité d’un fournisseur, comme l’a montré la panne de juillet 2024, et toute concentration acceptée doit faire l’objet d’une décision stratégique explicite et documentée.
- L’assurance de la chaîne d’approvisionnement logicielle repose sur l’exigence des pratiques du SSDF, de SBOM conformes aux éléments minimaux actuels et de la provenance SLSA, tandis que le règlement européen sur la cyberrésilience déplace les obligations en amont, vers les fabricants.
- Les incidents et les sorties liés aux fournisseurs doivent être préparés d’avance : contacts, guides d’intervention, pouvoir de déconnexion convenu au préalable, exportations de données testées et preuve de la révocation des accès et de la destruction des données.
- Les responsables métier assument le risque lié aux tiers et l’acceptent; l’approvisionnement, les services juridiques, la protection des renseignements personnels, la fonction du CSI et la continuité éclairent la décision, tandis que la deuxième et la troisième ligne la remettent en question et en donnent l’assurance.
Termes clés

- Tiers — Toute entité externe dont les services, les produits ou les activités peuvent toucher de façon importante la confidentialité, l’intégrité ou la disponibilité de l’information de l’organisation, ses obligations en matière de vie privée ou la continuité de ses services critiques.
- Risque lié aux parties de quatrième rang — Risque provenant des fournisseurs dont dépendent les fournisseurs de l’organisation, habituellement sans contrat direct ni visibilité.
- Gestion des risques de cybersécurité liés à la chaîne d’approvisionnement (C-SCRM) — Terme du NIST désignant la gestion des dépendances en amont et de l’exposition transitive dans les produits et les services.
- Accepter puis oublier — Mode de défaillance dans lequel le risque d’un fournisseur est évalué à l’intégration, puis disparaît du champ de la gouvernance jusqu’à ce qu’un problème survienne.
- Point de contrôle du cycle de vie — Moment de la relation avec un fournisseur où une personne désignée doit prendre une décision consignée sur la base d’éléments probants définis.
- Classement des tiers par niveau de risque — Classement des relations avec les tiers selon leur risque inhérent, de sorte que la vérification diligente, les éléments probants, les approbations et la surveillance soient proportionnés.
- Registre des tiers — Inventaire évolutif qui consigne chaque relation avec un fournisseur, son responsable, son niveau, les données et les systèmes en cause, les principales modalités, les sous-traitants importants et l’état de l’évaluation.
- Rapport SOC 2 de type II — Rapport d’un auditeur indépendant, fondé sur les Trust Services Criteria, qui vérifie si les contrôles ont fonctionné efficacement pendant une période, généralement de six à douze mois.
- Contrôles complémentaires chez l’entité utilisatrice (CUEC) — Contrôles qu’un fournisseur présume être exercés par ses clients et sans lesquels l’assurance fournie par son rapport ne vaut pas pour le client.
- Lettre de transition (bridge letter) — Affirmation de la direction d’un fournisseur selon laquelle rien d’important n’a changé depuis la fin de la période couverte par un rapport d’assurance; utile, mais ce n’est pas un élément probant d’audit.
- Risque de concentration — Dépendance fragile envers un seul fournisseur pour des fonctions critiques, au niveau de l’organisation, des parties de quatrième rang ou du secteur, lorsque le changement de fournisseur est lent ou peu réaliste.
- Nomenclature logicielle (SBOM) — Inventaire formel et lisible par machine des composants d’un logiciel et de leurs relations, qui sert à déterminer rapidement l’exposition aux vulnérabilités des composants.
- SLSA — Supply-chain Levels for Software Artifacts, spécification de l’OpenSSF qui définit des niveaux d’assurance quant à la façon dont un logiciel est construit et dont sa provenance peut être vérifiée.
- Plan de sortie — Stratégie documentée et testée pour quitter un fournisseur, qui couvre la portabilité des données, l’aide à la transition, la révocation des accès, la continuité et les données résiduelles.

## Questions de révision

Questions à développement

1. Nordet Outfitters a classé son fournisseur d’analytique marketing au niveau 3. À l’aide des quatre facteurs de risque inhérent, analysez pourquoi ce classement a échoué, et évaluez si les quatre changements approuvés par le conseil d’administration auraient réduit de façon importante l’impact de la compromission de la solution de transfert de fichiers.

2. De nombreuses organisations s’appuient principalement sur des questionnaires de sécurité pour obtenir l’assurance à l’égard de leurs fournisseurs. Évaluez de façon critique cette pratique et proposez une démarche d’assurance proportionnée pour une organisation qui compte trois cents fournisseurs et deux analystes, en expliquant comment lire les rapports indépendants.

3. Choisissez une organisation que vous connaissez (ou une organisation fictive) et déterminez un de ses fournisseurs critiques. Concevez les principales dispositions contractuelles, les points de contrôle d’intégration, les déclencheurs de surveillance et les éléments du plan de sortie que vous exigeriez pour cette relation, en justifiant chacun par référence au chapitre.

4. Le risque de concentration est présenté comme une question de dépendance systémique plutôt que d’insécurité d’un fournisseur. À l’aide de la panne de juillet 2024 et du cadre de surveillance de DORA, analysez les trois niveaux de concentration et recommandez la façon dont un conseil d’administration devrait décider d’accepter ou de réduire une dépendance concentrée.

5. Évaluez l’affirmation selon laquelle l’imputabilité du risque lié aux tiers appartient au responsable métier plutôt qu’à l’équipe de sécurité. Dans votre réponse, expliquez les rôles de l’approvisionnement, des services juridiques, de la protection des renseignements personnels, de la fonction du CSI et des trois lignes, et indiquez ce qui tourne mal lorsque la responsabilité n’est pas claire.

Questions à choix multiples

Choisissez la meilleure réponse. Les réponses figurent à l’annexe « Réponses aux questions à choix multiples ».

1. Selon le chapitre, qu’est-ce qui détermine si une entité externe doit faire partie du programme de gouvernance de la cybersécurité des tiers?

A. Le fait que l’entité ait signé un contrat d’impartition avec l’organisation

B. Le fait que sa défaillance ou sa compromission puisse nuire de façon importante aux services critiques ou à l’information sensible

C. Le fait que l’entité dispose d’un accès permanent au réseau de l’entreprise

D. Le fait que la valeur annuelle du contrat dépasse un seuil d’approvisionnement défini

2. Un fournisseur SaaS utilisé par un détaillant fonctionne sur un nuage à très grande échelle et recourt à un centre de soutien imparti. Du point de vue du détaillant, que sont le nuage et le centre de soutien?

A. Des fonctions de surveillance de deuxième ligne

B. Des contrôles complémentaires chez l’entité utilisatrice

C. Des prestataires tiers critiques de services TIC

D. Des parties de quatrième rang

3. Quelle catégorie du NIST CSF 2.0 place la gestion des risques de cybersécurité liés à la chaîne d’approvisionnement dans la fonction Gouverner?

A. GV.SC, dont les résultats vont de l’établissement du programme aux activités postérieures à la relation

B. PR.AA, qui porte sur la gestion des identités et le contrôle d’accès

C. DE.CM, qui porte sur la surveillance continue des actifs

D. RS.MA, qui porte sur les activités de gestion des incidents

4. Les contrôles d’un fournisseur de niveau 1 ne peuvent satisfaire à la norme de l’organisation. Selon le chapitre, qui devrait accepter le risque résiduel qui en découle?

A. Le CSI, qui a évalué les éléments probants de sécurité du fournisseur

B. La personne responsable de l’approvisionnement qui a géré le processus de sélection

C. Le responsable métier de la relation, à titre de responsable du risque imputable

D. Le conseiller juridique, qui a négocié l’annexe de sécurité du contrat

5. Selon le chapitre, qu’est-ce qui transforme un diagramme du cycle de vie des tiers en véritable gouvernance?

A. Des points de contrôle où une personne désignée prend une décision consignée sur la base d’éléments probants définis

B. Un seul questionnaire de sécurité détaillé rempli pendant l’approvisionnement

C. Des clauses de renouvellement automatique qui assurent la stabilité des relations

D. Une compilation annuelle de tous les fournisseurs transmise au comité d’audit

6. Une petite firme de marketing sans accès aux systèmes reçoit chaque semaine des extraits contenant les renseignements personnels de plusieurs centaines de milliers de clients. Quel facteur de classement devrait le plus clairement relever son niveau?

A. La criticité du service, parce que le marketing soutient les revenus

B. L’accès et l’intégration, parce que des fichiers sont échangés

C. La sensibilité des données, en raison du volume de renseignements personnels

D. La substituabilité, parce que les firmes d’analytique sont rares

7. Un fournisseur d’identité infonuagique présente d’excellents éléments probants indépendants attestant de contrôles solides. Quel effet cela devrait-il avoir sur son classement?

A. Il devrait passer au niveau 2, parce que les contrôles réduisent le risque inhérent

B. Il reste au niveau 1; les éléments probants améliorent la cote de risque résiduel

C. Il devrait passer au niveau 3, avec une réévaluation au renouvellement seulement

D. Il devrait être retiré du registre à titre de fournisseur de confiance

8. Selon le chapitre, quel indicateur renseigne le mieux un conseil d’administration sur la couverture réelle d’un programme de gestion des tiers?

A. Le nombre total de questionnaires de sécurité remplis cette année

B. Le nombre de fournisseurs titulaires d’un certificat ISO/IEC 27001

C. La cote de sécurité moyenne de l’ensemble des fournisseurs actifs

D. Le pourcentage de fournisseurs actifs auxquels un niveau et un responsable ont été attribués

9. Pourquoi un rapport SOC 2 de type II est-il généralement plus informatif qu’un rapport de type I?

A. Il est délivré selon la norme ISAE 3402 plutôt que selon les normes d’attestation de l’AICPA

B. Il couvre les contrôles liés à l’information financière en plus des contrôles de sécurité

C. Il vérifie si les contrôles ont fonctionné efficacement pendant une période donnée

D. Il dispense d’examiner les sous-traitants de services exclus (carve-outs)

10. Le rapport SOC 2 d’un fournisseur présume que les clients examineront leurs propres journaux d’accès. L’organisation ne le fait pas. Qu’en découle-t-il?

A. L’assurance fournie par le rapport ne vaut pas entièrement pour cette organisation

B. L’auditeur du fournisseur doit publier de nouveau le rapport avec une réserve

C. La portée du rapport exclut automatiquement les utilisateurs de l’organisation

D. Le fournisseur devient responsable de l’examen des journaux du client

11. En vertu des obligations de déclaration du règlement européen sur la cyberrésilience applicables depuis le 11 septembre 2026, dans quel délai les fabricants doivent-ils transmettre une alerte précoce concernant une vulnérabilité activement exploitée?

A. Dans les 72 heures, suivie d’un rapport final dans les trente jours

B. Sans retard injustifié une fois la violation confirmée

C. Dans les sept jours suivant la disponibilité d’un correctif

D. Dans les 24 heures, suivie d’une notification plus complète dans les 72 heures

12. Selon le chapitre, quelle étape distingue un véritable plan de sortie d’un simple espoir?

A. Obtenir chaque année une lettre de transition du fournisseur

B. Vérifier périodiquement que les données exportées peuvent être chargées ailleurs

C. Inclure dans le contrat une clause de résiliation pour convenance

D. Inscrire des fournisseurs de rechange dans le registre des tiers

13. L’appétence d’une organisation ne permet pas de retenir des fournisseurs critiques dépourvus de tout rapport d’assurance indépendant. Comment le chapitre recommande-t-il d’exprimer cette exigence dans l’approvisionnement?

A. Comme critère éliminatoire énoncé dans la demande de propositions, avant la sélection

B. Comme élément de pointage pondéré valant cinq pour cent de l’évaluation

C. Comme point de négociation soulevé après le choix du fournisseur privilégié

D. Comme engagement de correction inscrit au premier renouvellement

14. Quelle est la principale valeur, en matière de gouvernance, de détenir des SBOM pour les logiciels critiques?

A. Elles prouvent que le logiciel a été construit à partir du code source sans altération

B. Elles dispensent de toute information sur l’exploitabilité des vulnérabilités

C. Elles certifient que le fournisseur applique les pratiques du SSDF

D. Elles permettent à l’organisation de déterminer en quelques heures son exposition aux vulnérabilités des composants

15. Le contrat d’un fournisseur d’une organisation canadienne prévoit un délai de trente jours pour déclarer les violations confirmées. Pourquoi le chapitre juge-t-il cette clause insuffisante?

A. Parce que les contrats ne devraient jamais préciser de délais d’avis

B. Parce que seuls les organismes de réglementation peuvent fixer les délais d’avis des fournisseurs

C. Parce que l’organisation ne peut respecter ses propres échéances réglementaires et que les compromissions soupçonnées ne sont pas signalées

D. Parce que les clauses d’avis sont inexécutables à l’égard des fournisseurs infonuagiques

16. Un fournisseur SaaS critique n’offre que des modalités standard non négociables qui ne satisfont pas aux exigences. Que recommande le chapitre?

A. Refuser le fournisseur, puisque les contrats non négociés ne sont jamais acceptables

B. Documenter l’écart, appliquer des contrôles compensatoires et obtenir l’acceptation du risque par la haute direction

C. Accepter les modalités sans le dire, parce que les grands fournisseurs sont généralement sûrs

D. Demander à l’équipe de sécurité de renoncer à l’exigence au nom des activités

17. Un fournisseur pourrait exposer des millions de dossiers de clients, mais son contrat plafonne sa responsabilité à douze mois de frais. Comment la direction devrait-elle considérer cette situation?

A. Comme une pratique courante qui n’exige aucune attention de la haute direction

B. Comme potentiellement insuffisante au regard du risque, ce qui exige l’attention de la haute direction

C. Comme acceptable, parce que les crédits de service couvriront les coûts d’une violation

D. Comme sans importance, parce que les plafonds de responsabilité n’ont aucun effet sur la sécurité

18. Selon le chapitre, quelle est la principale limite des cotes de sécurité pour la surveillance des fournisseurs?

A. Elles ne voient que la surface externe et ne disent rien des contrôles internes

B. Elles exigent des audits sur place que les fournisseurs permettent rarement

C. Elles ne sont offertes que pour les fournisseurs titulaires de rapports SOC 2

D. Elles sont mises à jour trop rarement pour détecter les services exposés

19. Quelle question de gouvernance le chapitre tire-t-il de la panne informatique mondiale de juillet 2024 causée par une mise à jour défectueuse d’un logiciel de sécurité?

A. Si l’organisation devrait éviter les fournisseurs de sécurité réputés

B. Si les produits de sécurité des terminaux sont nécessaires sur les systèmes Windows

C. Si les polices de cyberassurance couvrent les pannes causées par les fournisseurs

D. Quels fournisseurs peuvent pousser des changements en production sans l’approbation de l’organisation

20. Pourquoi le conseil d’administration de Nordet a-t-il conclu que le principal problème était sa propre gouvernance plutôt que la négligence de la firme de marketing?

A. Parce que la firme avait refusé d’appliquer le correctif du fournisseur

B. Parce que Nordet n’avait aucune équipe d’intervention en cas d’incident

C. Parce que le classement par niveau avait ignoré la sensibilité des données, d’où des éléments probants et des modalités contractuelles faibles

D. Parce que le produit de transfert de fichiers ne présentait aucune vulnérabilité connue
