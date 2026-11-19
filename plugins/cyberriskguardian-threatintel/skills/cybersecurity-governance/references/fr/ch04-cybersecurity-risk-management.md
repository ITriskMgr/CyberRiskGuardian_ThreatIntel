<!-- Léger, M.-A. (2026). Introduction à la gouvernance de la cybersécurité pour la gestion des technologies d’affaires (3e éd., v2.51). Chapitre 4 : Gestion des risques de cybersécurité. CC BY-NC 4.0 -->

# Chapitre 4 : Gestion des risques de cybersécurité

## Résultats d’apprentissage

Au terme de ce chapitre, vous devriez être en mesure de :

1. Expliquer comment les menaces, les vulnérabilités et l’exposition interagissent dans le triangle du risque, et comment agir sur chaque composante réduit le risque.

2. Distinguer les nécessités opérationnelles, les risques gérables et l’incertitude profonde, et appliquer le cycle Identification, Priorisation, Mobilisation (IPM) à un programme de gestion des risques.

3. Comparer l’acceptation, l’évitement, le transfert et l’atténuation du risque, et justifier les conditions de gouvernance dans lesquelles chacun convient.

4. Traduire l’appétence pour le risque et la tolérance au risque en critères de décision, notamment l’échelle d’appétence de 0 à 1, les plages de tolérance et le repère de budget aligné sur l’appétence.

5. Repérer les biais individuels et collectifs qui faussent les décisions relatives aux risques, et recommander des mécanismes de gouvernance pour les contrer.

6. Concevoir des indicateurs clés de risque liés aux scénarios prioritaires, et les distinguer des indicateurs clés de performance et des résultats d’évaluations périodiques.

7. Classer les menaces et les vulnérabilités à l’aide de vocabulaires reconnus (catégories d’acteurs du Centre pour la cybersécurité, CVE, CWE, CVSS, OWASP), et expliquer pourquoi la gravité n’est pas le risque organisationnel.

8. Utiliser la chaîne de frappe (cyber kill chain), MITRE ATT&CK, CAPEC et le modèle du diamant pour analyser l’exploitation, et évaluer l’exposition en termes d’affaires et de conformité.

Ce chapitre présente la gestion des risques de cybersécurité, deuxième pilier du continuum GRC, qui regroupe la gouvernance, la gestion des risques et la conformité. La gouvernance fixe l’orientation et établit les objectifs et les obligations de cybersécurité; la conformité vérifie et démontre que les obligations sont respectées et que les contrôles fonctionnent comme prévu. La gestion des risques se situe entre ces deux activités : elle traduit les choix de gouvernance en décisions fondées sur des éléments probants et priorise les investissements, les contrôles et les changements opérationnels afin de maintenir le risque à l’intérieur de l’appétence pour le risque et de la tolérance au risque de l’organisation.

Bien que la gestion des risques et la conformité soient distinctes, elles sont étroitement liées. Un programme mature de gestion des risques de cybersécurité doit intégrer explicitement les obligations de conformité légales, réglementaires et contractuelles à l’identification des risques, aux critères d’évaluation des risques et aux plans de traitement. Ce lien est également cohérent avec la logique des systèmes de gestion ISO : les obligations de conformité doivent être systématiquement déterminées et tenues à jour sous forme d’informations documentées, et les risques de conformité doivent être identifiés, analysés, évalués et réévalués périodiquement, avec des éléments probants documentés de l’évaluation et des mesures prises.

Ces exigences, telles qu’elles sont exprimées dans les systèmes de gestion de la conformité, déterminent directement la façon dont la gestion des risques de cybersécurité est conçue, documentée, auditée et améliorée au fil du temps. Le chapitre poursuit donc deux objectifs :

- Premièrement, il fournit une assise pratique et conceptuelle à la gestion des risques de cybersécurité, conforme à l’approche décisionnelle fondée sur les risques présentée précédemment.
- Deuxièmement, il fait en sorte que le programme de gestion des risques qui en résulte soit, dès sa conception, intrinsèquement prêt pour l’audit et la conformité, c’est-à-dire qu’il produise la documentation, les indicateurs et les cycles de revue nécessaires pour soutenir une posture efficace de gouvernance et de conformité, y compris une approche par système de gestion et l’amélioration continue.

## Les fondements du risque

Le risque de cybersécurité est couramment représenté comme l’interaction de trois composantes : les menaces ou agents de menace, les vulnérabilités et l’exposition au risque. Lorsqu’une exploitation survient, l’exposition potentielle au risque se concrétise sous forme d’impact, de dommage, de perte ou d’autres conséquences défavorables.

Le risque existe lorsqu’un agent de menace peut, de façon réaliste, exploiter une vulnérabilité,

rendant possible une issue indésirable.

Figure 18 : la gestion des risques

Cette logique est souvent illustrée par le triangle du risque de la figure 18, où le risque est compris comme émergeant de l’intersection (1) des menaces, (2) des vulnérabilités et (3) de l’exposition, définie comme les conséquences négatives possibles. Le triangle est utile parce qu’il rend la gestion des risques opérationnelle : si le risque découle de cette interaction, il peut être réduit en agissant sur au moins une de ses composantes. Comme le montrent les flèches et le texte en rouge de la figure 18, les organisations peuvent réduire la vraisemblance d’une exploitation en réduisant les vulnérabilités ou en dissuadant les menaces, et elles peuvent réduire l’impact en améliorant leurs capacités de résilience, de segmentation, de reprise et d’intervention.

Ce chapitre reprend le triangle du risque du chapitre 1 comme modèle mental de référence, mais il amène la personne qui lit vers une interprétation managériale : la gestion des risques n’est pas seulement du durcissement technique; c’est la sélection, la justification, la mise en œuvre et la surveillance rigoureuses de décisions qui réduisent une exposition inacceptable, en tenant compte de contraintes réelles (temps, argent, talents et attention organisationnelle). Le résultat est un portefeuille de décisions : ce qu’il faut corriger en premier, ce qu’il faut surveiller en continu, ce qu’il faut accepter formellement, ce qu’il faut transférer par contrat et ce qu’il faut éviter sur le plan stratégique.

## Ce qu’est la gestion des risques (et ce qu’elle n’est pas)

La gestion des risques porte sur des issues incertaines. Il s’agit d’événements dont on peut raisonnablement s’attendre à ce qu’ils surviennent et qui pourraient avoir des conséquences négatives. Ils ne sont toutefois ni certains ni à ce point hypothétiques qu’on ne puisse les évaluer de façon sensée. En pratique, le risque cesse d’être un problème de gestion des risques à ces extrêmes.

Si une issue est pratiquement certaine, la situation relève d’abord des opérations plutôt que du risque. Elle doit être traitée comme un fait et gérée comme une activité d’affaires courante. Par exemple, si des terminaux non gérés seront inévitablement infectés, la protection des terminaux devient une exigence opérationnelle de base, et non un sujet de débat. De même, si une issue est à ce point hypothétique que sa probabilité ne peut être estimée ou justifiée de façon significative, la traiter comme un risque de cybersécurité prioritaire peut être moins rationnel que de renforcer la préparation aux crises et les capacités de continuité, comme la gestion des incidents, la continuité des activités et la reprise après sinistre. Dans ces cas, l’organisation devrait se concentrer sur la résilience et la préparation plutôt que sur une cotation fine des risques. L’essentiel n’est pas la valeur exacte des seuils numériques, qui dépend du contexte, mais la rigueur de distinguer :

- les nécessités opérationnelles;
- les risques gérables; et
- l’incertitude profonde, qui exige une planification de la résilience.
Une gouvernance efficace de la cybersécurité exige les trois, mais la gestion des risques de cybersécurité, en tant que fonction d’aide à la décision, se concentre principalement sur la catégorie du milieu.

## Un cycle pratique de gestion des risques : Identification, Priorisation, Mobilisation (IPM)

Pour rendre la gestion des risques utilisable sur le plan opérationnel par les responsables de la gestion des technologies d’affaires (BTM) et de la cybersécurité, ce manuel emploie un cycle simple : Identification, Priorisation, Mobilisation (IPM). L’intention est de fournir un flux de travail concret, compréhensible, reproductible et auditable.

Figure 19 : le processus IPM

- L’identification est l’étape au cours de laquelle l’organisation détermine les menaces, les vulnérabilités, les chemins d’exploitation plausibles (scénarios) et les impacts potentiels. Il ne s’agit pas d’artefacts purement techniques. Ils doivent intégrer le contexte d’affaires : quels actifs comptent, quels processus sont essentiels à la mission, quelles obligations sont contraignantes, quels tiers sont en cause et à quoi ressemblerait une défaillance.
- La priorisation est le processus qui consiste à comparer les scénarios et à décider lesquels importent le plus, en fonction de l’impact, de la vraisemblance, de la détectabilité et de l’alignement sur l’appétence pour le risque et la tolérance au risque. La priorisation existe parce que les ressources sont toujours limitées. Une liste de 200 risques n’est pas un programme de gestion des risques; c’est un carnet de travaux en attente. Un programme de gestion des risques, c’est un ordre de priorité défendable et un registre clair des décisions.
- La mobilisation est l’étape au cours de laquelle l’organisation affecte les ressources et met en œuvre les décisions de traitement. Cela comprend la sélection des contrôles, la modification des processus, le renforcement de la surveillance et des capacités d’intervention, la négociation des obligations des fournisseurs, la réaffectation des budgets et la formation du personnel. La mobilisation transforme l’analyse en action.
Une caractéristique essentielle du cycle IPM est sa nature itérative. Les changements de l’environnement (nouvelles menaces, technologies, fournisseurs, réglementations et initiatives d’affaires) exigent de revenir sur l’identification et la priorisation. C’est précisément là que la gouvernance et la conformité doivent interagir avec la gestion des risques : les obligations de conformité évoluent et, dans une approche fondée sur un système de gestion, l’organisation est censée repérer les obligations nouvelles ou modifiées, évaluer leurs incidences et ajuster ses processus en conséquence.

## La gestion des risques et les systèmes de gestion alignés sur les normes ISO

Une faiblesse récurrente dans les organisations réelles consiste à traiter l’évaluation des risques comme un rituel annuel plutôt que comme une capacité opérationnelle. À l’opposé, les normes de systèmes de gestion, comme les systèmes de gestion de la conformité présentés au chapitre précédent, reposent sur une logique d’amélioration continue : des politiques et des objectifs sont établis; des processus sont mis en œuvre; la performance est surveillée et mesurée; des audits internes et des revues de direction ont lieu; des actions correctives sont prises; et le système évolue.

Une exigence clé de conformité consiste à s’assurer que l’efficacité des programmes de gestion des risques de cybersécurité est vérifiable. Pour ce faire, l’organisation identifie, analyse et évalue les risques de conformité; évalue les processus impartis et confiés à des tiers; procède à des réévaluations périodiques ou lorsque la situation change; et tient des registres documentés des évaluations et des mesures prises. Ce processus n’est pas une simple formalité bureaucratique; il fournit une démarche structurée pour que les décisions liées aux risques demeurent à jour, justifiables et fondées sur des éléments probants.

Pour la gestion des risques de cybersécurité, adopter cet état d’esprit a une conséquence simple : les décisions relatives aux risques doivent être traçables. Elles doivent relier les objectifs de gouvernance aux scénarios déterminés, aux critères d’évaluation, aux mesures de traitement, aux mesures et indicateurs et aux cycles de revue. Autrement, l’organisation ne peut ni démontrer de façon fiable que le risque est géré à l’intérieur de la tolérance, ni tirer systématiquement des leçons des incidents et des quasi-incidents.

## Les décisions relatives au risque : les principales stratégies de traitement

Un programme de gestion des risques existe, en définitive, pour soutenir la prise de décision. Après l’identification et la priorisation, l’organisation doit décider de la façon de traiter chaque scénario important. Plusieurs stratégies sont couramment utilisées. Ces stratégies ne sont pas mutuellement exclusives; les programmes matures combinent des stratégies selon les risques. La norme ISO 31000:2018, sur laquelle s’appuie la norme ISO/IEC 27005:2022, décrit une liste plus longue d’options — éviter le risque, prendre ou augmenter un risque afin de saisir une occasion, éliminer la source de risque, modifier la vraisemblance ou les conséquences, partager le risque et le maintenir par une décision éclairée —, mais celles-ci correspondent aux quatre stratégies retenues ici.

L’acceptation du risque

L’acceptation du risque est une décision délibérée de tolérer un risque défini sans mettre en œuvre de contrôles supplémentaires au-delà de ceux déjà en place. Ce n’est pas de la négligence; c’est un choix de gestion documenté, fondé sur l’appétence pour le risque et la tolérance au risque. Une acceptation en bonne et due forme suppose que l’organisation comprend le scénario, l’impact potentiel et la justification de ne pas atténuer davantage le risque. Après la mise en œuvre de mesures d’atténuation et de contrôles, il y a une décision explicite ou implicite d’accepter le risque résiduel. Idéalement, l’acceptation devrait être explicite et formalisée dans un processus de gouvernance.

Lorsque l’acceptation est utilisée de façon responsable, elle s’appuie sur une documentation explicite et une surveillance continue. Il est d’usage de consigner les risques acceptés dans un registre des risques, avec le contexte, les hypothèses, la personne responsable de la décision, la date de revue et toute condition déclenchante qui entraînerait un réexamen. Le pouvoir d’acceptation devrait être proportionnel au niveau de risque résiduel — plus le risque est élevé, plus la personne qui signe doit occuper un poste élevé — et chaque acceptation devrait comporter une date d’échéance plutôt que de demeurer ouverte indéfiniment. Accepter ne devrait jamais signifier ignorer; cela signifie accepter tout en surveillant. Par mesure de protection, l’acceptation du risque doit être accompagnée de processus de gestion des incidents, de reprise après sinistre (PRS) et de continuité des activités (PCA).

L’évitement du risque

L’évitement du risque est la décision délibérée de cesser ou de ne pas entreprendre une activité qui créerait une exposition intolérable à des risques inacceptables. Ce n’est ni de l’ignorance ni de l’aveuglement volontaire. En cybersécurité, l’évitement peut être justifié lorsqu’une initiative d’affaires crée des risques qui ne peuvent être atténués efficacement à un coût raisonnable, ou lorsque les contraintes de conformité rendent l’activité peu intéressante sur le plan stratégique. L’évitement peut aussi être approprié lorsque des impacts sur la sécurité publique ou des impacts catastrophiques sont possibles, même si la vraisemblance de tels scénarios est faible, ou lorsque l’organisation ne peut atteindre ses objectifs de gouvernance avec la conception envisagée.

L’évitement entraîne des coûts de renonciation; il doit donc être utilisé avec prudence et transparence. Dans une gouvernance mature, les décisions d’évitement sont habituellement soumises à la haute direction, car elles touchent la stratégie et l’orientation des affaires.

Le transfert du risque

Le transfert du risque déplace une partie du fardeau financier ou de la responsabilité opérationnelle vers une autre partie, habituellement au moyen d’une assurance ou de clauses contractuelles conclues avec des fournisseurs et des partenaires. C’est un mécanisme d’externalisation du risque. Le transfert du risque peut être utile, mais il a ses limites : de nombreuses conséquences, comme les mesures d’application réglementaires, l’atteinte à la réputation ou la perte de confiance, ne peuvent être transférées proprement. De plus, ce transfert crée des dépendances. Si un tiers fait défaut, l’organisation en subit quand même les conséquences. Dans la méthode du chapitre 6, le transfert est donc consigné comme une ligne chiffrée et une décision de la direction, avec la part des pertes couverte et la personne qui l’a approuvé, plutôt que comme une mesure d’atténuation qui réduit le risque calculé.

C’est ici que l’angle de la conformité et des tiers devient déterminant. Certains cadres exigent explicitement d’évaluer les risques de conformité associés aux processus impartis et confiés à des tiers. En cybersécurité, cela se traduit par une attente concrète : le transfert du risque doit s’accompagner d’une vérification diligente, d’une surveillance et d’éléments probants démontrant que les contrôles et les obligations du tiers sont réels et exécutoires. Le chapitre 19 approfondit la gouvernance des tiers et de la chaîne d’approvisionnement.

L’atténuation du risque

L’atténuation du risque est une stratégie délibérée qui vise à réduire soit la vraisemblance d’une exploitation, soit l’impact d’une exploitation réussie. Dans le triangle du risque, les deux leviers principaux sont la réduction des vulnérabilités (et des chemins d’exposition) et la réduction de l’impact (par la résilience, la segmentation, la reprise et l’intervention). Ce sont les flèches rouges de la figure 18.

Les mesures d’atténuation comprennent des contrôles techniques (p. ex., contrôle d’accès, authentification multifacteur [AMF], segmentation, chiffrement, durcissement, détection et intervention sur les terminaux [EDR]), des contrôles administratifs (politiques, procédures, séparation des tâches, formation, gouvernance des fournisseurs) et des contrôles physiques (protection des installations, protection des appareils et de l’équipement). L’atténuation doit être justifiée par son coût au regard du scénario et doit tenir compte du risque résiduel. Le risque zéro n’existe pas; la question pertinente est donc de savoir si le risque résiduel se situe à l’intérieur de la tolérance. Dans la méthode quantitative du chapitre 6, un ensemble de mesures est décrit par la part de la probabilité et la part de l’impact qu’il élimine, et ces deux parts sont multipliées; un ensemble de mesures ne réduit donc le risque calculé que s’il agit sur les deux leviers, ce qui explique pourquoi les plans de traitement solides combinent la prévention avec la détection, le confinement et la reprise.

Figure 20 : les décisions relatives au risque

## L’appétence pour le risque et la tolérance au risque : transformer la gouvernance en critères de décision

L’appétence pour le risque est l’énoncé général de la quantité et des types de risques que l’organisation est prête à accepter pour atteindre ses objectifs. La tolérance au risque est plus précise et se concrétise souvent sous forme de seuils : au-delà de ces seuils, une action est requise. Ensemble, l’appétence et la tolérance traduisent les valeurs de gouvernance en logique de priorisation.

En cybersécurité, les dirigeants ont souvent du mal à formuler la tolérance au risque sans recourir à une précision artificielle. La part de subjectivité est souvent importante. Une approche pragmatique consiste à définir des plages de tolérance par catégorie d’impact et par criticité d’affaires, plutôt que de supposer que tous les risques peuvent être chiffrés avec précision. Par exemple, l’organisation pourrait avoir une tolérance quasi nulle pour les risques touchant des systèmes critiques pour la sécurité des personnes ou des renseignements personnels sur la santé réglementés, tout en acceptant une exposition plus grande pour des systèmes internes à faible impact. L’objectif n’est pas la perfection, mais la cohérence et la transparence.

Une étape opérationnelle utile consiste à formaliser les critères de risque :

- Qu’est-ce qui constitue un impact élevé pour cette organisation?
- Qu’est-ce qui constitue une vraisemblance élevée dans son environnement?
- Quels scénarios doivent déclencher une remontée?
- Quelles obligations sont des contraintes absolues, dont le non-respect est essentiellement inacceptable?
Dans la méthode fondée sur des scénarios des chapitres 5 et 6, l’appétence pour le risque est exprimée sur une échelle de 0 à 1 : environ 0,30 ou moins pour une organisation réfractaire au risque, 0,50 pour une organisation neutre face au risque et 0,70 ou plus pour une organisation qui recherche le risque. La tolérance est ensuite rendue opérationnelle scénario par scénario : le risque résiduel de chaque scénario est comparé à son risque toléré, et un ratio de tolérance inférieur à 0,90 est interprété comme sous la tolérance, de 0,90 à 1,10 comme approximativement à la tolérance, et supérieur à 1,10 comme au-dessus de la tolérance, ce qui exige un traitement supplémentaire, un transfert, un évitement ou une acceptation formelle par la direction. L’appétence pour le risque d’une organisation devrait aussi être alignée sur ses dépenses en cybersécurité. Selon une pratique exemplaire, les dépenses en cybersécurité, exprimées en pourcentage du budget total des TI, salaires compris, devraient être d’environ 12 % pour une organisation réfractaire au risque (appétence de 0,30 ou moins), d’environ 7,8 %, soit la médiane, pour une organisation neutre face au risque (appétence de 0,50) et d’environ 4 % pour une organisation qui recherche le risque (appétence de 0,70 ou plus), avec une interpolation linéaire pour les appétences intermédiaires; une appétence de 0,40, par exemple, correspond à environ 9,9 %. Cette ligne directrice budgétaire est reprise au chapitre 6 pour aider la population étudiante à vérifier si le portefeuille de traitement recommandé est réaliste. Il s’agit d’un test de vraisemblance, et non d’une formule budgétaire : le budget défendable demeure celui qui ramène les risques des scénarios à l’intérieur de l’appétence à un coût justifié.

Cela crée aussi un lien direct avec les systèmes de gestion de la conformité : les obligations de conformité sont des exigences que l’organisation doit respecter, et elle doit les déterminer et les documenter. Si les obligations ne font pas l’objet d’un suivi explicite, les critères de risque ne peuvent pas en tenir compte de façon fiable.

## Les biais et les facteurs humains qui faussent les décisions relatives au risque

Comme on l’a vu au chapitre 1, les biais influent sur la gestion des risques de cybersécurité. Ce processus est sensible aux biais cognitifs, car il comporte de l’incertitude, de l’information incomplète et des événements chargés d’émotion. Il est donc essentiel de reconnaître que les évaluations des risques ne sont pas des produits purement scientifiques; ce sont des décisions sociotechniques. Seuls quelques-uns des biais qui contribuent à fausser les décisions relatives au risque sont présentés ici, étant entendu que certains touchent les individus, tandis que d’autres sont davantage liés au fonctionnement des groupes.

Le biais d’excès de confiance amène les équipes à sous-estimer l’exposition parce qu’elles croient mieux comprendre leur environnement qu’elles ne le font réellement. Le biais d’ancrage fait en sorte que les hypothèses initiales dominent l’analyse ultérieure. Le biais de confirmation favorise une attention sélective aux éléments qui confirment les croyances existantes (nous ne sommes pas une cible). Le biais de disponibilité fait en sorte que les incidents récents — surtout spectaculaires — éclipsent des menaces plus probables, mais moins visibles. Le biais d’optimisme amène les personnes à croire que les issues négatives sont moins susceptibles de les toucher que leurs pairs. Le biais du statu quo favorise l’inertie, même lorsque l’environnement a changé.

Figure 21 : les biais et les facteurs humains qui faussent les décisions relatives au risque

La pensée de groupe est une distorsion collective particulièrement importante en gouvernance de la cybersécurité, car elle étouffe la dissidence lorsque les équipes privilégient l’harmonie, la rapidité ou le consensus au détriment d’une remise en question critique. En pratique, la pensée de groupe peut amener les comités de sécurité et les équipes de projet à converger prématurément vers une conclusion rassurante sur le risque, à minimiser des signaux dérangeants, comme des constatations d’audit non résolues, des exceptions récurrentes aux contrôles ou des quasi-incidents, et à traiter le désaccord comme de la déloyauté plutôt que comme de la diligence. Elle est renforcée par les écarts d’autorité, les pressions de performance partagées, les échéances de livraison et les discours organisationnels. Parmi les discours souvent entendus dans les discussions sur le risque, mentionnons :

- Nous sommes matures,
- Nous ne sommes pas une cible,
- Notre fournisseur s’en occupe.
La gouvernance, les processus d’atténuation et la recherche de consensus devraient donc comprendre des mécanismes délibérés pour préserver la pensée indépendante : exiger une opinion dissidente documentée pour les décisions importantes relatives au risque, faire tourner des réviseurs indépendants, recourir à des analyses prémortem pour explorer comment une décision pourrait échouer, mener des analyses post-mortem des incidents pour comprendre comment une décision a mené à un échec, et assurer une sécurité psychologique afin que le personnel technique et opérationnel et les autres parties prenantes puissent exprimer leurs préoccupations sans crainte de sanctions.

Dans l’évaluation des risques, ces biais peuvent être atténués au moyen de méthodes structurées comme l’analyse fondée sur des scénarios, des ateliers réunissant des parties prenantes diversifiées, des processus explicites de remise en question, des simulations contradictoires (remise en question des hypothèses par une équipe rouge), des exigences en matière d’éléments probants et des cycles de revue. En pratique, la gouvernance devrait exiger que les décisions importantes relatives au risque soient justifiées par un raisonnement documenté et revues périodiquement — surtout après des changements importants du contexte. Cette attente cadre avec l’exigence de réévaluer les risques de conformité périodiquement et lorsque la situation ou le contexte organisationnel change.

## Les mesures et les indicateurs clés de risque : rendre le risque observable

Les décisions relatives au risque doivent s’appuyer sur des indicateurs. Sans signaux mesurables ou du moins observables, la gestion des risques se limite au discours et ne peut pas orienter l’action de façon fiable. Les indicateurs clés de risque (ICR) sont des mesures prospectives qui donnent un avertissement précoce de l’augmentation de l’exposition. Les ICR aident à faire pencher la balance de la subjectivité vers l’objectivité. Contrairement aux indicateurs clés de performance, qui mesurent l’atteinte des objectifs d’affaires, les ICR mesurent des conditions corrélées à une hausse du risque. Cela cadre avec la gestion des risques de cybersécurité, puisque l’organisation doit être en mesure de démontrer qu’elle sait si les contrôles et les mesures de traitement des risques fonctionnent.

Les ICR peuvent être financiers, opérationnels, liés à la conformité, stratégiques ou propres à la cybersécurité. En cybersécurité, les ICR correspondent souvent naturellement aux composantes du triangle du risque : l’activité des menaces (p. ex., volume d’hameçonnage, taux de tentatives d’intrusion), l’état des vulnérabilités (p. ex., arriéré de correctifs, dérive de configuration critique), les signaux d’exploitabilité (p. ex., services exposés, couverture insuffisante de l’authentification forte) et les indicateurs indirects de l’exposition au risque, des dommages et de l’impact (p. ex., taux de réussite des tests de restauration des sauvegardes, temps d’intervention en cas d’incident, délai moyen de détection).

Figure 22 : les mesures et les indicateurs clés de risque

Dans une perspective de gouvernance alignée sur les normes ISO, et conformément à d’autres normes et lignes directrices de pratiques exemplaires, les indicateurs ne sont pas des ornements facultatifs. Par exemple, la norme ISO 37301 inclut explicitement la surveillance, la mesure et l’élaboration d’indicateurs dans l’évaluation de la performance. Plus précisément, dans la norme ISO 37301:2021, les exigences relatives à l’évaluation de la performance sont regroupées à l’article 9 (Évaluation des performances), qui comprend l’article 9.1 (Surveillance, mesure, analyse et évaluation) et, au sein de celui-ci, l’article 9.1.3 (Élaboration d’indicateurs).

Sur le plan pratique, les attentes relatives aux ICR devraient être mises en correspondance d’une couche de gouvernance à l’autre. Les cadres qui recommandent une telle correspondance peuvent inspirer les praticiens. À la couche de la surveillance d’entreprise, les lignes directrices de gestion des risques d’entreprise (GRE) comme celles du COSO considèrent la reddition de comptes sur les risques comme un domaine que les conseils d’administration et la haute direction doivent renforcer, et elles encouragent explicitement l’élaboration d’indicateurs clés de risque pour affiner l’alerte précoce et améliorer la qualité des rapports sur les risques. Dans les secteurs réglementés comme le secteur bancaire, les lignes directrices prudentielles du Comité de Bâle sur le contrôle bancaire (ses Revisions to the principles for the sound management of operational risk de 2021) sont encore plus directes : elles mentionnent explicitement les indicateurs clés de risque comme technique qualitative de gestion du risque opérationnel servant à surveiller les risques et les contrôles. À la couche d’intégration entre la cybersécurité et la GRE, la publication NIST IR 8286B (mise à jour en 2025) distingue la mesure de la performance (indicateurs clés de performance) du suivi des risques (ICR) et relie les deux à la surveillance et à l’ajustement à l’échelle de l’entreprise, ce qui fait des ICR un artefact de gouvernance de premier plan plutôt qu’une mesure purement opérationnelle.

À la couche du système de gestion de la sécurité de l’information, la norme ISO/IEC 27001:2022 (article 9.1) exige la surveillance et la mesure dans le cadre de l’évaluation de la performance (une discipline que les organisations mettent couramment en œuvre au moyen d’un ensemble d’ICR et d’indicateurs clés de performance), et la norme ISO/IEC 27004:2016 (dont une nouvelle édition est en préparation au moment d’écrire ces lignes) fournit des indications propres au SGSI sur la définition, l’analyse et l’évaluation de ces mesures.

Enfin, en matière de continuité et de résilience, la norme ISO 22301:2019 met elle aussi l’accent sur l’exploitation, la surveillance, la revue et l’amélioration continue du système de gestion de la continuité des activités. En pratique, cela se concrétise par des ICR axés sur la résilience portant sur la capacité de reprise, les résultats des exercices et les signaux de risque liés aux dépendances, les pratiques de sélection et de priorisation des mesures étant renforcées par la publication NIST SP 800-55, Measurement Guide for Information Security (volumes 1 et 2, décembre 2024). Tous ces documents peuvent constituer de bonnes sources d’inspiration pour aider les organisations à mettre en œuvre des ICR.

## L’identification des menaces : agents internes et externes

Les menaces constituent l’une des faces du triangle du risque. L’identification des menaces n’est pas un exercice d’énumération; c’est un effort structuré pour décrire les adversaires réalistes et les modes de défaillance pertinents au regard du contexte, des actifs et des obligations de l’organisation. En termes de risque, il est utile de distinguer la source de menace (l’agent, y compris son intention et sa méthode) de la vulnérabilité (la faiblesse qui peut être exploitée ou déclenchée par inadvertance par l’agent de menace), car tant les attaques délibérées que les conditions accidentelles peuvent nuire aux objectifs de confidentialité, d’intégrité ou de disponibilité d’une organisation.

Une première distinction pratique sépare les menaces internes des menaces externes. Les menaces internes proviennent de l’intérieur de l’organisation, notamment des membres du personnel, des contractuels et des partenaires de confiance. Elles peuvent être malveillantes (abus intentionnel des accès, sabotage, vol) ou accidentelles (erreur de configuration, clic imprudent, traitement inapproprié des données). Les menaces internes sont souvent sous-estimées en raison de la confiance sociale au sein des organisations et parce que celles-ci préfèrent des discours qui externalisent la menace plutôt que d’affronter des réalités internes inconfortables. Fait important, les initiés ne sont pas simplement des « personnes qui commettent des erreurs » : ils occupent aussi une position unique, car leurs accès légitimes peuvent contourner les hypothèses fondées sur le périmètre et permettre un impact à grande échelle. Selon le triangle de la fraude (pression, occasion et rationalisation), les initiés sont les mieux placés pour reconnaître et exploiter une occasion, ce qui explique pourquoi la fraude interne peut être à la fois plus difficile à détecter et plus grave.

Les menaces externes proviennent de l’extérieur de l’organisation et comprennent les cybercriminels, les acteurs étatiques, les activistes et d’autres groupes dont les objectifs vont du profit à la perturbation. Les acteurs externes peuvent exploiter de façon opportuniste des faiblesses exposées ou lancer des campagnes ciblées contre des organisations précises. Leurs méthodes comprennent souvent l’ingénierie sociale à grande échelle, la compromission d’identifiants, l’exploitation de services exposés et la compromission de la chaîne d’approvisionnement; ils peuvent aussi collaborer avec des initiés par la coercition, la corruption ou l’affinité idéologique.

Pour rendre l’identification des menaces opérationnelle et auditable, il convient d’y intégrer explicitement des catégories de menaces plutôt que de considérer « interne » et « externe » comme la seule taxonomie. Une catégorisation robuste se fait selon le type d’acteur de menace et sa motivation principale. Dans le cadre employé par le Centre canadien pour la cybersécurité (le Centre pour la cybersécurité) dans Introduction à l’environnement de cybermenace, les catégories courantes comprennent les États-nations, les cybercriminels, les hacktivistes, les groupes terroristes, les chercheurs de sensations fortes et les menaces internes. Ces catégories correspondent respectivement à des motivations comme les objectifs géopolitiques, le profit, l’idéologie, la violence idéologique, la satisfaction et le mécontentement, et elles sont aussi corrélées (imparfaitement) à des niveaux de sophistication différents.

Figure 23 : l’identification des menaces

Dans cette taxonomie, les acteurs parrainés par un État figurent généralement parmi les plus sophistiqués; ils mènent des cyberopérations pour faire progresser des objectifs géopolitiques par l’espionnage, la perturbation ou le prépositionnement dans des systèmes critiques, des opérations d’influence et, parfois, des activités à motivation financière. Les cybercriminels sont principalement motivés par l’appât du gain; ils vont des opportunistes peu qualifiés aux groupes organisés qui achètent des outils et des services sur des marchés en ligne, ce qui leur permet de mener des campagnes plus complexes. Les hacktivistes, les groupes terroristes et les chercheurs de sensations fortes s’appuient souvent sur des outils largement accessibles qui exigent peu de compétences techniques, mais qui peuvent tout de même entraîner des impacts réputationnels, financiers et parfois physiques importants. Les menaces internes comprennent des personnes mécontentes ou compromises qui disposent d’accès légitimes et qui peuvent être associées à d’autres catégories d’acteurs ou recrutées par celles-ci.

De plus, le concept de menaces persistantes avancées (MPA) sert d’indicateur de capacité : le Centre pour la cybersécurité décrit les MPA comme des acteurs de menace « au sommet de l’échelle en matière de sophistication et de compétences », capables de mener des campagnes complexes et prolongées et souvent associés à des États-nations ou à des groupes du crime organisé très compétents.

Une catégorisation complémentaire repose sur la motivation de l’attaquant et l’impact recherché, car des motivations différentes laissent prévoir des conditions de réussite, des temps de présence et des tactiques privilégiées distincts. Les motivations typiques comprennent l’exfiltration de données, l’espionnage, la perturbation de services, le chantage, le gain financier, les convictions philosophiques ou politiques, la vengeance, la perturbation ou le chaos, et des objectifs liés à la guerre. Ce cadre aide les équipes à éviter de calquer leurs défenses sur un seul discours (par exemple, le rançongiciel à des fins lucratives) et à reconnaître plutôt qu’un même point d’ancrage initial (p. ex., la compromission d’identifiants) peut servir plusieurs objectifs en aval, de la fraude aux opérations d’influence.

Une troisième catégorisation se fait selon le vecteur de menace et la famille de techniques (c.-à-d. ce que les défenseurs doivent détecter, prévenir et traiter en pratique). Une taxonomie pragmatique des techniques peut s’appuyer sur les « principales menaces » récurrentes, comme la prise de contrôle de comptes; les attaques visant les identifiants (extraction, réutilisation, bourrage d’identifiants, force brute); l’hameçonnage (y compris le harponnage et la chasse à la baleine); les rançongiciels; le déni de service (DoS/DDoS); les utilisations malveillantes du DNS; les attaques contre les applications Web (injection SQL, script intersites); les erreurs de configuration des systèmes et la « TI fantôme »; les défaillances de la gestion des accès infonuagiques; la commande et le contrôle; et l’exploitation de vulnérabilités du jour zéro. Même au sein d’une famille, l’étiquette de la catégorie importe : le « bourrage d’identifiants », par exemple, se distingue sur le plan opérationnel de la « pulvérisation de mots de passe » ou de l’attaque par force brute visant un seul compte, parce qu’il exploite l’automatisation et des identifiants déjà volés à grande échelle et qu’il peut même créer des impacts secondaires sur la disponibilité lorsque le trafic des robots monte en flèche.

Ces catégories d’acteurs et de techniques doivent être évaluées au regard de la surface de menace de l’organisation et de ses cibles probables. Le Centre pour la cybersécurité définit la surface de cybermenace comme l’ensemble des systèmes et des services d’information qu’un acteur de menace peut exploiter; en pratique, elle comprend les terminaux exposés à Internet ainsi que les processus et les services qui communiquent avec des systèmes connectés à Internet ou qui en dépendent. Elle s’élargit à mesure que les organisations adoptent des produits infonuagiques « en tant que service », des modèles de travail hybride et des ententes de services gérés, ce qui multiplie les accès de tiers.

Cette réalité fait de la compromission de la chaîne d’approvisionnement et des tiers une catégorie de menace de premier plan, et non une simple note de bas de page : comme le fait observer le Centre pour la cybersécurité, les liens de confiance et les flux d’information entre organisations offrent aux acteurs de menace une voie indirecte vers leur cible, en compromettant d’abord un tiers comme un fournisseur.

De même, l’identification des menaces doit tenir compte explicitement de ce qui est ciblé — selon les catégories du Centre pour la cybersécurité, les appareils (y compris la technologie opérationnelle), l’information (y compris la propriété intellectuelle et les renseignements personnels et financiers), les ressources financières, et même les opinions et la réputation au moyen d’activités d’influence en ligne —, car chaque catégorie de cible suppose des chemins d’attaque plausibles et des priorités de contrôle différents.

Comme les paysages de menaces évoluent continuellement, les organisations devraient traiter l’identification des menaces comme une capacité plutôt que comme un effort ponctuel. Cela mène naturellement à la nécessité d’un renseignement sur les menaces appliqué à plusieurs niveaux : le renseignement stratégique, pour suivre les grandes tendances et les facteurs géopolitiques; le renseignement tactique, pour comprendre les tactiques, techniques et procédures (TTP) des attaquants; le renseignement opérationnel et technique, pour détecter et perturber les campagnes actives (y compris les indicateurs); le renseignement contextuel, pour interpréter les motivations des acteurs et leurs cibles probables; et le renseignement situationnel, pour appuyer les décisions en temps réel pendant les incidents. L’identification des menaces peut constituer une précieuse source d’inspiration pour élaborer des scénarios de risque de cybersécurité.

## Le renseignement sur les menaces : transformer l’information en avantage d’anticipation

Le renseignement sur les menaces est la collecte, l’analyse et l’utilisation systématiques d’information sur les menaces, les tactiques des attaquants et les vulnérabilités émergentes afin de prévenir les attaques, de les détecter et d’y réagir. Il ne s’agit pas d’amasser de grands volumes de données, mais de convertir les données en constats exploitables et en scénarios de risque de cybersécurité.

Le renseignement sur les menaces améliore la gestion des risques d’au moins quatre façons :

- Il rend les scénarios plus réalistes en les ancrant dans le comportement observé des attaquants.
- Il soutient la priorisation en déterminant quelles menaces sont actives dans le secteur d’activité de l’organisation et quelles vulnérabilités sont exploitées en situation réelle.
- Il améliore la détection et l’intervention en éclairant les règles de surveillance, les cas d’utilisation du SIEM (gestion des informations et des événements de sécurité) et les guides d’intervention (playbooks) en cas d’incident.
- Il soutient la prise de décision de la haute direction en précisant où l’investissement réduit le plus efficacement l’exposition.
Le renseignement sur les menaces sert aussi de pont entre la conformité et le risque : si une obligation légale ou réglementaire exige la détection, la déclaration ou la protection en temps opportun de types de données précis, le renseignement aide l’organisation à démontrer sa diligence plutôt que son ignorance. C’est particulièrement pertinent lorsque les organismes de réglementation s’attendent à une posture de cybersécurité démontrable.

## L’identification des vulnérabilités

Les vulnérabilités constituent une autre face du triangle du risque. Du point de vue de la gouvernance, elles expriment la fragilité relative d’un élément de risque exposé à un danger, et elles représentent le « maillon faible » qui rend une issue défavorable possible. En termes de cybersécurité opérationnelle, une vulnérabilité se comprend le mieux comme un état d’un système d’information qui, s’il est exploité, peut causer un préjudice concret : divulgation de données (atteinte à la confidentialité), altération de données (atteinte à l’intégrité), perte de disponibilité, répudiation de transactions, falsification de l’authentification ou de l’origine, ou contournement du contrôle d’accès. Cela correspond à la définition employée dans les publications FIPS 200 et NIST SP 800-53 Rev. 5, et reprise dans le glossaire du NIST, selon laquelle une vulnérabilité est une « faiblesse d’un système d’information, des procédures de sécurité d’un système, des contrôles internes ou de la mise en œuvre, qui pourrait être exploitée ou déclenchée par une source de menace ».

D’un point de vue managérial, le travail sur les vulnérabilités ne devrait jamais être traité comme un exercice d’énumération. Une liste brute de constatations ne devient utile que lorsqu’elle est transformée en produit d’aide à la décision : ce qui importe, pourquoi cela importe, à quelle vitesse la vulnérabilité pourrait être exploitée, l’impact probable sur les affaires, qui est responsable de la correction et quels éléments probants démontreront qu’elle est réglée. C’est pourquoi il est préférable de décrire la gestion des vulnérabilités comme un processus d’affaires continu plutôt que comme une activité technique périodique. En pratique, les programmes matures suivent un cycle itératif : découverte des actifs et définition de la portée, identification des faiblesses, triage et priorisation, correction, vérification et mesure de la performance. L’intention n’est pas d’atteindre une posture irréaliste de « zéro vulnérabilité », mais de réduire continuellement l’exposition exploitable de l’organisation dans les domaines qui protègent le plus directement les résultats liés à la mission.

Pour structurer la communication et éviter toute ambiguïté, les programmes de gestion des vulnérabilités s’appuient sur des vocabulaires normalisés qui relient les détails techniques à la reddition de comptes en matière de gouvernance.

- CVE (Common Vulnerabilities and Exposures) est le dictionnaire public utilisé mondialement pour les vulnérabilités connues et divulguées publiquement; chaque entrée CVE comprend un identifiant unique, une description normalisée et des références.
- CWE (Common Weakness Enumeration) le complète en classant les types courants de faiblesses des logiciels et des systèmes et en fournissant un langage unifié pour décrire et gérer de façon systématique les schémas de vulnérabilités récurrents.
- Le CVSS (Common Vulnerability Scoring System), tenu à jour par FIRST et actuellement à la version 4.0 (publiée en 2023), offre, selon les termes de FIRST, « un moyen de saisir les principales caractéristiques d’une vulnérabilité et de produire un score numérique reflétant sa gravité », ce qui soutient la priorisation de l’intervention.
Une façon pratique de l’expliquer est la suivante : CVE aide à nommer et à suivre des problèmes précis, CWE aide à comprendre la catégorie de faiblesse sous-jacente, et le CVSS soutient un premier triage cohérent selon la gravité. Toutefois, la gravité n’est pas la même chose que le risque organisationnel. Une priorisation efficace exige une mise en contexte. Le CVSS fournit un score de gravité structuré, mais l’organisation doit encore l’interpréter en tenant compte de la criticité des actifs, de l’exposition, des contrôles compensatoires, des contraintes opérationnelles et d’une activité de menace crédible. Les signaux d’exploitation publics aident à fournir ce contexte de menace : la Cybersecurity and Infrastructure Security Agency (CISA) des États-Unis tient à jour le catalogue KEV (vulnérabilités exploitées connues), et l’Exploit Prediction Scoring System (EPSS) de FIRST estime la probabilité qu’une vulnérabilité soit exploitée à court terme. Les organisations ont besoin d’outils et de processus qui mettent en corrélation la gravité des vulnérabilités avec le contexte des actifs et des menaces et qui orientent la correction et les contrôles compensatoires. C’est à ce moment que la gestion des vulnérabilités devient une capacité de gestion des risques plutôt qu’une liste de vérification d’hygiène des TI. La même distinction régit la méthode d’évaluation des risques des chapitres 5 et 6 : le score de base CVSS v4.0 de la faiblesse qu’exploite un scénario est un multiplicateur obligatoire dans l’indice de risque calculé, aux côtés des probabilités, du dommage, de la criticité et de la résilience du scénario, mais il n’est jamais utilisé seul pour classer ou sélectionner les scénarios, car un score de gravité élevé ne signifie pas le risque d’affaires le plus élevé.

Figure 24 : l’identification des vulnérabilités

La classification des vulnérabilités importe aussi, car elle détermine la responsabilité et la stratégie de correction. Une distinction utile oppose les vulnérabilités technologiques, dont l’origine est directement liée à des éléments technologiques comme les systèmes d’exploitation, les logiciels, les processeurs, les périphériques ou les interfaces, aux vulnérabilités ancrées dans la configuration et les pratiques opérationnelles, comme les configurations faibles, les protocoles non sécurisés ou les déploiements risqués. Dans les environnements riches en applications, l’OWASP peut servir de grille de classification complémentaire, tandis que CWE fournit une vaste taxonomie des faiblesses. L’OWASP est largement utilisé pour cadrer les catégories courantes de risques liés à la sécurité des applications, comme l’injection, le contrôle d’accès défaillant et les erreurs de configuration de sécurité. Sur le plan de la gouvernance, l’OWASP est précieux parce qu’il relie les constatations sur les vulnérabilités à des modèles de correction destinés aux développeurs et à des pratiques d’ingénierie sécurisée, ce qui facilite la transformation des constatations en éléments de carnet de travaux qui préviennent leur récurrence.

Comme le paysage des vulnérabilités évolue rapidement, la gestion des vulnérabilités doit être justifiée comme une capacité continue. Un ensemble d’observations empiriques popularisées par les recherches de Qualys dans les années 2000 sous le nom de « lois des vulnérabilités » soutient que la demi-vie des vulnérabilités critiques est courte, que leur prévalence évolue à mesure que de nouvelles vulnérabilités remplacent les anciennes, que certaines vulnérabilités persistent indéfiniment et que la fenêtre d’exploitation après la divulgation s’est fortement réduite au fil du temps. Même traitées comme des heuristiques, ces lois éclairent les décisions de gouvernance sur les délais de correction, les ententes de niveau de service (SLA) relatives aux correctifs, la fréquence des analyses et la nécessité d’une surveillance continue de l’exposition plutôt que de s’en remettre à des évaluations annuelles. Cela mène directement à l’évaluation formelle des vulnérabilités.

## L’évaluation et la gestion des vulnérabilités

L’analyse des vulnérabilités, souvent rendue opérationnelle au moyen de programmes d’évaluation des vulnérabilités, est un processus formel qui observe les vulnérabilités technologiques d’un système d’information. Cette capacité d’évaluation ne vise pas seulement à trouver des problèmes, mais à produire au fil du temps des mesures reproductibles et comparables auxquelles la haute direction peut se fier :

- Qu’est-ce qui a été évalué?
- Qu’est-ce qui a été trouvé?
- Qu’est-ce qui a changé?
- Qu’est-ce qui a été corrigé?
- Qu’est-ce qui demeure ouvert?
- Quelle est l’exposition résiduelle de l’organisation?
Concrètement, il s’agit de définir la portée de l’évaluation (systèmes, applications, configurations infonuagiques, terminaux, appareils réseau), de déterminer la fréquence des analyses en fonction du rythme des changements et de l’appétence pour le risque, et de préciser les éléments probants exigés pour la fermeture (vérification et nouvelle analyse). Les outils comptent, mais le cadre de gouvernance de la cybersécurité de l’organisation devrait définir les attentes envers les outils en termes de capacités. Les exigences fondamentales devraient inclure des capacités d’analyse des vulnérabilités, comme la tenue d’une base de données des vulnérabilités complète et à jour, la réduction au minimum des faux positifs, la prise en charge d’analyses multiples et de l’analyse des tendances, et des indications claires pour éliminer les vulnérabilités ou réduire le risque.

À un niveau de maturité plus élevé, les capacités attendues des outils d’évaluation des vulnérabilités ressemblent à celles que Gartner énumère pour ce marché : trouver et signaler les faiblesses des appareils, des systèmes d’exploitation, des logiciels et des configurations; enregistrer une base de référence afin de suivre les changements d’état; produire des rapports pour différents publics, mis en correspondance avec les cadres de conformité et de contrôles; classer les corrections en combinant la gravité avec ce que l’on sait de l’actif et de la menace; recommander des correctifs ou des contrôles compensatoires; et se connecter, directement ou au moyen d’API, aux outils de gestion des actifs, des flux de travail et des correctifs. Ce point d’intégration est essentiel : la gestion des vulnérabilités échoue le plus souvent non pas parce que les organisations ne peuvent pas détecter les vulnérabilités, mais parce qu’elles ne parviennent pas à les acheminer de façon fiable vers des responsables imputables, à suivre leur correction jusqu’au bout et à prouver leur fermeture au moyen d’éléments probants.

Une saine gouvernance exige aussi de reconnaître les limites de l’évaluation et de les rendre visibles. Les résultats d’analyse dépendent de l’architecture et du point de vue de l’analyse. Des analyses réalisées à partir de différents emplacements du réseau donnent des vues distinctes des vulnérabilités; les paramètres des pare-feu, la segmentation et les contrôles IDS/IPS peuvent avoir une incidence importante sur les résultats. Ce n’est pas un détail purement technique : c’est une préoccupation de gouvernance, car cela détermine la fiabilité et l’exhaustivité de la reddition de comptes sur les risques. Les programmes matures utilisent donc plusieurs points de vue (interne et externe), des analyses authentifiées lorsque c’est approprié et une documentation explicite de la couverture et des contraintes, afin que les responsables des risques comprennent ce qui est connu et ce qui demeure incertain.

Enfin, la gestion des vulnérabilités se comprend le mieux comme un ensemble coordonné de pratiques, et non comme une technique unique. L’analyse automatisée procure étendue et cohérence; l’évaluation de la configuration détecte les écarts par rapport aux bases de référence sécurisées; la revue de code et les pratiques de développement sécurisé des systèmes préviennent des catégories entières de faiblesses; et les tests d’intrusion ajoutent profondeur et réalisme en validant l’exploitabilité et l’enchaînement des faiblesses. Comme les testeurs pensent comme des attaquants, les tests d’intrusion révèlent des faiblesses et des chemins d’attaque qui échappent aux outils automatisés, mettent en contexte les résultats des outils et fournissent aux équipes de correction une liste concrète et priorisée de correctifs, souvent centrée sur des cibles précises de grande valeur. Sur le plan de la gouvernance, ces méthodes doivent être considérées comme complémentaires : l’analyse et l’évaluation assurent une mesure et une couverture continues, tandis que les tests d’intrusion procurent une validation ponctuelle et une assurance plus approfondie pour les actifs critiques, les changements majeurs et les surfaces d’attaque à risque élevé.

L’identification et la gestion des vulnérabilités doivent être considérées comme une capacité opérationnelle qui convertit les données techniques sur les faiblesses en résultats de correction priorisés, assortis de responsables et vérifiés. Lorsque des référentiels comme CVE, CWE, le CVSS et l’OWASP sont utilisés comme vocabulaires communs et que l’évaluation des vulnérabilités est traitée comme un processus formel et reproductible, appuyé par des outils solides et des flux de travail assortis de responsables imputables, la gestion des vulnérabilités devient l’un des leviers les plus directs et les plus mesurables pour réduire le risque de cybersécurité. Les résultats peuvent être utilisés dans un processus d’évaluation des risques fondée sur des scénarios ou comme intrant d’autres processus d’évaluation des risques de cybersécurité. Le chapitre 8 revient sur la gestion des vulnérabilités en tant que discipline opérationnelle.

## Les codes d’exploitation en cybersécurité : comment les menaces tirent parti des vulnérabilités

La publication Introduction à l’environnement de cybermenace du Centre pour la cybersécurité résume clairement la séquence opérationnelle :

Les acteurs de menace poursuivent leurs objectifs en exploitant des vulnérabilités techniques et en recourant à l’ingénierie sociale. « Les auteurs de menace utilisent des codes d’exploitation pour tirer parti de vulnérabilités et déploient des charges utiles » qui permettent l’accès, le contrôle, la destruction ou d’autres activités malveillantes, notamment au moyen de vulnérabilités connues, mais aussi de vulnérabilités « du jour zéro ».

Un code d’exploitation ne doit donc pas être traité comme un artefact purement technique (« un bout de code »), mais comme un mécanisme opérationnel qui relie les capacités et l’intention d’un acteur de menace à une faiblesse précise d’un système cible. La publication Introduction à l’environnement de cybermenace du Centre pour la cybersécurité définit un code d’exploitation comme un code malveillant qui tire parti d’une vulnérabilité non corrigée, et une trousse d’exploitation comme un ensemble de plusieurs codes d’exploitation qui touchent des applications logicielles non sécurisées; en pratique, ces trousses sondent une cible à la recherche de logiciels vulnérables et déclenchent automatiquement le code d’exploitation correspondant.

La pertinence pour les gestionnaires est immédiate : les organisations ne subissent pas un « risque de vulnérabilité » abstrait; elles font face à des scénarios fondés sur des codes d’exploitation, dans lesquels une vulnérabilité est découverte, atteinte et exploitée de façon fiable sous des contraintes opérationnelles réelles (authentification, segmentation du réseau, surveillance, interaction de l’utilisateur et temps).

Une façon utile d’expliquer « comment se produit l’exploitation » consiste à décrire le schéma récurrent que suivent les attaquants pour transformer des faiblesses en résultats. De façon générale, les adversaires repèrent une surface cible, localisent une faille, mettent au point ou se procurent un code d’exploitation, obtiennent une capacité d’exécution ou un accès, puis livrent une charge utile qui fait progresser leurs objectifs.

Selon le contexte, cette chaîne peut être opportuniste et automatisée (par exemple, l’analyse de l’ensemble d’Internet à la recherche de services exposés et non corrigés) ou délibérée et ciblée (par exemple, la sélection minutieuse d’un système contenant des données de valeur ou d’une valeur stratégique).

Dans les deux cas, l’exploitation est rarement « seulement technique ». L’ingénierie sociale fournit couramment le point d’ancrage initial qui rend possible un code d’exploitation — des messages d’hameçonnage contenant des liens ou des pièces jointes malveillants peuvent déclencher l’exploitation lorsqu’une personne interagit avec eux —, ce qui illustre comment les facteurs humains et les faiblesses techniques se combinent fréquemment pour former un seul chemin d’attaque viable.

Il en découle deux implications pour l’analyse des risques axée sur la gouvernance :

- Premièrement, l’« exposition » est l’intersection de la vulnérabilité et de l’accessibilité : une faiblesse qui existe, mais qui ne peut être atteinte dans des conditions réalistes, présente habituellement un risque moindre qu’une faiblesse exposée à Internet, sollicitable par des entrées non fiables ou accessible par des flux de travail courants des utilisateurs.
- Deuxièmement, le temps compte : la pression d’exploitation augmente souvent rapidement après la divulgation, ce qui explique pourquoi le fait de traiter l’exploitation comme une capacité opérationnelle — plutôt que comme un événement isolé — devient central pour une gestion des risques défendable.
Pour aider les analystes et les décideurs à structurer les scénarios fondés sur des codes d’exploitation, plusieurs cadres complémentaires sont largement utilisés. Les sous-sections suivantes en présentent quatre : la chaîne de frappe (cyber kill chain), le cadre MITRE ATT&CK, le catalogue CAPEC de MITRE et le modèle du diamant pour l’analyse des intrusions (Diamond Model of Intrusion Analysis).

Chaque cadre répond à une question différente. Le récit de la chaîne de frappe précise où un code d’exploitation s’insère dans une attaque et où il peut être interrompu; ATT&CK précise ce que font les adversaires avant et après l’exploitation, de manière détectable; et le modèle du diamant précise qui et quoi sont en cause, ce qui permet aux organisations de réorienter stratégiquement leurs défenses.

La chaîne de frappe

La Cyber Kill Chain de Lockheed Martin décrit une séquence d’intrusion qui va de la reconnaissance à l’armement, à la livraison, à l’exploitation, à l’installation, à la commande et au contrôle, puis aux actions sur les objectifs.

Figure 25 : la chaîne de frappe

Dans ce modèle, l’« exploitation » ne constitue pas l’incident en entier; c’est une étape charnière au cours de laquelle un vecteur livré (pièce jointe d’un courriel, contenu Web, service exposé ou artefact de la chaîne d’approvisionnement) exploite une vulnérabilité pour permettre une première exécution ou un premier accès. La valeur managériale de la chaîne de frappe est qu’elle favorise une prévention et une détection en couches : si une organisation ne peut empêcher de façon fiable l’exploitation de chaque vulnérabilité, elle peut tout de même chercher à perturber les étapes antérieures et ultérieures, réduisant ainsi l’impact réel même lorsqu’une exploitation se produit.

Dans le tableau ci-dessous, des stratégies défensives sont associées directement à chaque phase de la Cyber Kill Chain afin d’arrêter un adversaire avant qu’il n’atteigne ses objectifs.

Phase

Objectif principal

Principales stratégies défensives

1. Reconnaissance

Empêcher la collecte d’information

- Mettre en œuvre des politiques strictes de divulgation de l’information.
- Surveiller le trafic réseau pour repérer toute activité d’analyse inhabituelle.
- Réaliser régulièrement des audits OSINT (renseignement de sources ouvertes).
2. Armement

Analyser et détecter les menaces

- Effectuer une analyse approfondie des logiciels malveillants dans les fichiers suspects.
- Mettre en place des jetons leurres (honeytokens) et des pots de miel internes.
- Analyser les flux de renseignement sur les menaces pour y repérer les indicateurs de campagnes connues.
3. Livraison

Bloquer la transmission

- Déployer le filtrage des courriels et l’authentification des expéditeurs (SPF, DKIM, DMARC).
- Mettre en œuvre des outils de protection des terminaux.
- Offrir régulièrement au personnel une formation de sensibilisation à la sécurité.
4. Exploitation

Corriger et protéger les systèmes

- Maintenir une routine de gestion des correctifs rigoureuse et automatisée.
- Activer les contrôles de sécurité au niveau des navigateurs et des applications.
- Mettre en œuvre des pratiques de codage sécurisé dans tous les déploiements.
5. Installation

Restreindre l’accès à l’environnement

- Appliquer le principe du moindre privilège aux comptes d’utilisateurs.
- Utiliser des agents de détection et d’intervention sur les terminaux (EDR).
- Mettre en œuvre une liste d’applications autorisées pour bloquer les logiciels non fiables.
6. Commande et contrôle (C2)

Bloquer les canaux de communication

- Utiliser la détection et l’intervention sur le réseau (NDR) pour repérer les anomalies de trafic.
- Mettre en œuvre un filtrage DNS pour bloquer les domaines malveillants.
- Configurer des règles strictes de pare-feu et de serveur mandataire pour le trafic sortant.
7. Actions sur les objectifs

Réduire au minimum les dommages causés par la charge utile

- Effectuer des sauvegardes de données fréquentes, isolées et chiffrées.
- Déployer des outils de prévention des pertes de données (DLP).
- Établir et tester un plan d’intervention en cas d’incident.
Le cadre MITRE ATT&CK

Le cadre MITRE ATT&CK offre une perspective distincte, mais très pratique : MITRE le décrit comme une base de connaissances accessible mondialement sur les tactiques et les techniques des adversaires, fondée sur des observations réelles et utilisée comme assise pour des modèles de menace et des méthodologies défensives.

ATT&CK sépare le « pourquoi » de l’attaquant (tactiques) du « comment » (techniques) et fournit un vocabulaire pour décrire les comportements qui entourent l’exploitation, notamment l’accès initial, l’exécution, la persistance, l’élévation de privilèges, l’accès aux identifiants, le déplacement latéral et l’exfiltration

Figure 26 : le cadre MITRE ATT&CK

Dans une gouvernance axée sur les codes d’exploitation, ATT&CK est particulièrement utile, car il traduit l’affirmation vague « ils ont exploité une vulnérabilité » en comportements observables et vérifiables : quelle technique a permis l’accès initial, ce qui a suivi pour l’élévation de privilèges et quelles techniques ont servi à atteindre les actifs critiques. Cela favorise une sélection plus claire des contrôles, une ingénierie de la détection plus défendable et des exercices sur table plus rigoureux qui reproduisent des chaînes d’exploitation réalistes plutôt que des vérifications de contrôles isolés.

Le catalogue CAPEC de MITRE

Le catalogue CAPEC (Common Attack Pattern Enumeration and Classification), également élaboré par MITRE, est une ressource exhaustive qui documente les schémas d’attaque courants qu’utilisent les adversaires pour exploiter les faiblesses des systèmes. Alors que les taxonomies de vulnérabilités comme CWE (Common Weakness Enumeration) se concentrent sur la détermination de failles ou de bogues sous-jacents précis dans un système, CAPEC se concentre sur la méthodologie de l’attaquant, en détaillant la façon dont ces failles sont habituellement exploitées en pratique.

Figure 27 : le catalogue CAPEC de MITRE

La principale valeur managériale et opérationnelle du catalogue CAPEC est qu’il comble l’écart entre le simple fait de savoir qu’une vulnérabilité existe et la conception active de systèmes capables de résister à son exploitation. En précisant comment des schémas d’attaque distincts se rattachent à des catégories récurrentes de faiblesses logicielles et architecturales, CAPEC permet aux organisations de relier directement les stratégies d’exploitation réelles aux pratiques de conception et de test sécurisées. Les équipes d’ingénierie et d’architecture peuvent ainsi intégrer de façon proactive des mesures préventives au cycle de vie du développement des systèmes, en s’attaquant aux mécanismes fondamentaux d’un schéma d’attaque avant même qu’un système soit déployé.

Le modèle du diamant pour l’analyse des intrusions

Pour aller au-delà des étapes du cycle de vie et des catalogues de comportements, le modèle du diamant pour l’analyse des intrusions (Diamond Model of Intrusion Analysis), publié par Sergio Caltagirone, Andrew Pendergast et Christopher Betz en 2013, décrit l’activité malveillante à l’aide de quatre caractéristiques fondamentales — l’adversaire, la victime, la capacité et l’infrastructure — afin que les analystes puissent raisonner sur les relations et les pivots (par exemple, la façon dont une capacité comme une trousse d’exploitation est livrée au moyen d’une infrastructure précise à un profil de victime particulier).

Figure 28 : le modèle du diamant pour l’analyse des intrusions

Ce modèle est utile dans un contexte de gouvernance parce qu’il décourage les explications unidimensionnelles et favorise le raisonnement sur la répétabilité, l’extensibilité et l’exposition systémique. Il aide les analystes à répondre à des questions comme les suivantes :

- Cet acteur réutilisera-t-il son infrastructure?
- La capacité est-elle banalisée?
- Combien de victimes semblables existe-t-il dans notre environnement?
L’utilisation de ces modèles

Utilisés ensemble, ces cadres font passer la discussion sur les codes d’exploitation du détail technique à un raisonnement rigoureux sur les risques. Le récit de la chaîne de frappe précise où l’exploitation s’insère dans une intrusion et où il est possible de l’interrompre; ATT&CK précise ce que font les adversaires avant et après l’exploitation, de manière mesurable et détectable; le modèle du diamant précise qui et quoi sont en cause et permet une réorientation stratégique; CAPEC précise comment les schémas d’attaque se rattachent à des catégories récurrentes de faiblesses et, par conséquent, à la prévention en ingénierie et en architecture. L’enseignement du triangle du risque devient alors explicite : les menaces ne font pas qu’exister, et les vulnérabilités ne font pas que s’accumuler. C’est l’exploitation des vulnérabilités par les menaces qui rend le risque réel; c’est donc ce mécanisme que la gouvernance doit apprendre à anticiper, à limiter, à détecter et à perturber. L’utilisation de ces modèles contribue à rendre cela possible.

## L’exposition au risque : des cyberévénements aux préjudices pour l’entreprise

Troisième face du triangle du risque, l’exposition au risque désigne les conséquences défavorables potentielles qui pourraient survenir si une menace exploitait avec succès une vulnérabilité. Il ne s’agit pas du dommage réel d’un incident, mais de l’espace des préjudices plausibles pour l’organisation, défini à l’avance, qui rend l’analyse des risques concrète et défendable. En ce sens, l’exposition peut aussi être décrite comme les dommages ou les impacts potentiels pour l’organisation si le scénario de risque se concrétisait. L’objectif managérial est de formuler, en termes d’affaires, ce que l’organisation risque de perdre ou de voir perturbé, et dans quelles conditions, afin que les choix de contrôles et l’affectation des ressources puissent être justifiés auprès de la direction.

Comme les préjudices liés à la cybersécurité restent rarement confinés à un seul domaine, l’exposition ne devrait pas être réduite à la perte financière directe. Une analyse défendable de l’exposition reconnaît que des scénarios cybernétiques peuvent plausiblement entraîner une perturbation des opérations et des pertes de productivité, une atteinte à la réputation et une érosion de la confiance de la clientèle, une exposition juridique et des frais de litige, des sanctions réglementaires et des mesures d’application, un désavantage concurrentiel découlant de la perte de propriété intellectuelle ou de plans stratégiques, des impacts sur la sécurité des personnes lorsque des cyberévénements touchent des processus physiques, et une érosion à long terme de la capacité stratégique en raison d’un détournement prolongé des ressources et d’une prise de décision dégradée. Il ne s’agit pas d’énumérer tout ce qui pourrait mal tourner, mais de déterminer quelles catégories de préjudices sont crédibles compte tenu des actifs, des obligations et du modèle opérationnel de l’organisation, et comment elles se manifesteraient en cas d’exploitation.

Figure 29 : l’exposition au risque

Une façon pratique de définir l’exposition consiste à réaliser un bilan d’impact sur les activités (BIA) qui traduit les perturbations techniques en conséquences pour l’entreprise. Un BIA sert souvent à estimer la criticité des processus et à comprendre les dépendances. En gouvernance de la cybersécurité, un raisonnement semblable est utilisé pour structurer l’exposition sous forme de scénarios. Par exemple, une organisation peut se demander ce qui changerait sur les plans opérationnel et financier si :

- les paiements étaient interrompus pendant 4 heures,
- des données de clients étaient exposées,
- la production était interrompue,
- un système central était corrompu, ou
- la défaillance d’un contrôle interne entraînait un manquement à la conformité.
L’intérêt de cette approche est qu’elle ancre l’exposition dans les dépendances réelles et les engagements de service de l’organisation plutôt que dans une gravité technique abstraite. Elle permet aussi d’établir des seuils de décision significatifs, comme la durée d’interruption tolérable, les fenêtres de perte de données acceptables, les priorités de reprise et les éléments déclencheurs de remontée.

L’évaluation de l’exposition d’une organisation doit tenir compte explicitement des effets en cascade et des effets qui débordent d’un domaine à l’autre, car, lors d’incidents réels, les frontières entre la confidentialité, l’intégrité et la disponibilité s’effondrent souvent. Par exemple, une attaque par rançongiciel peut d’abord se présenter comme une panne touchant la disponibilité, mais elle devient rapidement un problème de confidentialité si des données sont exfiltrées, puis un problème de gouvernance et de conformité si des obligations d’avis ou de déclaration sont déclenchées. De même, une exploitation qui commence par la compromission limitée d’un seul terminal peut se transformer en exposition à l’échelle de l’entreprise par le vol d’identifiants, le déplacement latéral ou l’altération de l’infrastructure partagée de gestion des identités et des accès. Le préjudice initial n’est souvent pas l’état final; les conséquences les plus importantes peuvent découler d’effets de deuxième et de troisième ordre, notamment une interruption prolongée en raison de la complexité de la reprise, une amplification de l’atteinte à la réputation par la couverture médiatique et un examen réglementaire attribuable à des lacunes dans les éléments probants ou à une intervention tardive.

## Intégrer la gestion de l’exposition à la gestion de la conformité

Une défaillance organisationnelle courante consiste à traiter la conformité comme un silo distinct qui vérifie les décisions après coup. Un modèle plus mature traite les obligations de conformité comme des intrants de la définition de l’exposition et de la priorisation des scénarios, avant que les décisions ne soient arrêtées. En pratique, cela signifie que les exigences de conformité ne sont pas des contraintes externes découvertes tardivement; elles aident à déterminer quelles issues sont inacceptables, quels scénarios exigent un traitement prioritaire, quels éléments probants doivent être en place et à quoi ressemble une « bonne » situation lors des audits et après les incidents. Selon ce modèle, l’exposition n’est pas seulement une question de préjudice opérationnel et réputationnel; elle comprend aussi les issues plausibles de non-conformité (par exemple, des manquements aux exigences de tenue de registres, de mesures de sécurité, de déclaration des incidents, de surveillance des tiers ou de conservation) qui peuvent accroître considérablement les pertes et les contraintes de l’organisation pendant et après un événement.

Il est utile de considérer la gestion de la conformité comme un système de gestion à intégrer aux processus d’affaires et appuyé par des informations documentées, une surveillance et une amélioration continue, en s’appuyant sur des pratiques exemplaires reconnues comme la norme ISO 37301. Transposer cette logique à la gouvernance de la cybersécurité est simple. Lorsque des défaillances de cybersécurité peuvent plausiblement toucher des obligations de conformité, l’organisation doit :

1. déterminer les obligations qui importent dans le scénario,

2. définir l’exposition en des termes qui incluent les conséquences sur la conformité,

3. démontrer que les dépendances envers des tiers et des fournisseurs ont été évaluées lorsqu’elles pourraient avoir une incidence sur les résultats en matière de conformité, et

4. conserver les éléments probants des évaluations, des décisions et des mesures correctives.

Autrement dit, l’exposition aux risques de cybersécurité liés aux tiers n’est pas facultative lorsque les obligations de conformité dépendent de la prestation de services par des tiers; elle doit être évaluée, gouvernée et documentée.

La même logique d’intégration s’applique à l’engagement de la direction et à l’affectation des ressources. Pour que la réduction de l’exposition soit défendable et efficace, elle ne peut être sous-financée ni traitée comme une question purement opérationnelle déléguée aux TI. Elle doit être gouvernée comme une capacité de gestion fondamentale, avec des responsabilités claires, des critères de risque explicites, des seuils de remontée et une revue périodique. Une exposition qui demeure non gérée constitue, dans les faits, une décision de gestion implicite. La gouvernance fait en sorte que de telles décisions soient explicites, justifiées et réexaminées.

Enfin, une approche axée sur l’exposition mène naturellement à une évaluation de la performance fondée sur des indicateurs plutôt que sur les seules statistiques d’incidents. La mesure est essentielle, car l’exposition est dynamique : elle change avec les nouvelles vulnérabilités, l’évolution de l’activité des menaces, les changements architecturaux, les dépendances envers les fournisseurs et les facteurs humains. Une approche rigoureuse rend cela opérationnel en définissant des indicateurs clés de risque (ICR) qui signalent une exposition croissante au risque, appuyés par des indicateurs clés de performance qui montrent si les mesures de traitement sont réalisées. Par exemple, la hausse du nombre de vulnérabilités critiques non corrigées sur les systèmes exposés à Internet, la prolifération croissante des comptes privilégiés, la baisse de la couverture de l’AMF pour les accès administratifs, la détérioration des résultats des tests d’intégrité des sauvegardes ou la persistance de lacunes d’assurance chez les tiers peuvent servir d’ICR signalant une hausse du risque. Relier ces indicateurs aux scénarios et aux obligations prioritaires et s’en servir pour déclencher la revue, la remontée et les actions correctives aidera l’organisation à améliorer sa posture de risque. L’objectif de gouvernance est de gérer l’exposition de façon proactive au moyen d’indicateurs avancés, plutôt que de façon rétrospective au moyen des leçons apprises après un incident.

## Évaluation des risques fondée sur des scénarios : le pont entre le technique et les affaires

Dans l’approche de ce manuel, les scénarios sont le principal instrument pour rendre le risque tangible. Un scénario de risque de cybersécurité est un récit structuré qui décrit comment un agent de menace pourrait exploiter une vulnérabilité ou une chaîne de vulnérabilités pour produire des impacts qui comptent au regard des objectifs et des obligations de l’organisation. Il est proposé comme un outil qui oblige à la clarté. L’élaboration d’un scénario exige que l’organisation précise quels actifs sont en cause, ce que fait l’attaquant, quelles défaillances défensives surviennent, à quoi ressemblerait la détection, quelles sont les conséquences et quels contrôles empêcheraient ou limiteraient les dommages. Les scénarios offrent aussi une interface naturelle entre les équipes techniques et la haute direction. Les dirigeants se servent des scénarios pour prendre de meilleures décisions; les équipes techniques mettent en œuvre les contrôles et surveillent les ICR qui s’alignent sur ces scénarios.

Cette approche fondée sur des scénarios, présentée au chapitre suivant, soutient aussi la conformité en établissant un lien traçable entre les obligations, les risques, les contrôles, la surveillance et les revues. Bien documentée, elle renforce directement l’auditabilité et l’imputabilité de la direction.

Mise en situation : le conseil d’administration d’un fabricant fixe ses critères de risque

Groupe Valmont Polymères est un fabricant fictif d’emballages, sous contrôle familial, établi dans la région du Centre-du-Québec. Il compte environ 900 employés, deux usines et des clients des secteurs alimentaire et pharmaceutique dont les contrats imposent des obligations de sécurité et de traçabilité. Pendant des années, son conseil d’administration a reçu une présentation annuelle sur la cybersécurité construite autour d’une carte de chaleur de 140 risques, la plupart colorés en orange. Lorsqu’un audit mené par un client a demandé comment Valmont décidait quels risques traiter, personne n’a pu répondre preuves à l’appui. Le comité d’audit et des risques du conseil a demandé à l’équipe de direction de rebâtir le programme autour du cycle IPM et de lui présenter des décisions plutôt que des inventaires.

Identification. Le directeur de la cybersécurité et le dirigeant principal de l’information (DPI) ont animé des ateliers avec les directions d’usine, les finances, les ventes, la qualité et le service juridique. Au lieu de partir d’une liste technique, ils sont partis de ce à quoi ressemblerait une défaillance : un arrêt de production à l’usine principale, des registres de lots altérés qui bloqueraient les expéditions aux clients pharmaceutiques, un paiement frauduleux à un fournisseur et l’exposition de renseignements personnels d’employés protégés par la Loi 25 du Québec. Douze scénarios ont été documentés, chacun précisant l’actif, l’agent de menace, la vulnérabilité, le chemin d’exploitation plausible et l’exposition en termes d’affaires. L’analyse a été réalisée avec CyberRiskGuardian, qui a produit un risque estimé pour chaque scénario et l’a comparé au risque toléré découlant de l’appétence du conseil.

Priorisation. Avant de classer quoi que ce soit, le comité avait besoin de critères. Le conseil a approuvé un énoncé d’appétence pour le risque déclarant Valmont réfractaire au risque pour les scénarios touchant l’intégrité des produits, la sécurité des personnes et les renseignements personnels réglementés, modéré pour les courtes perturbations des activités et plus tolérant pour les systèmes internes à faible impact. La tolérance a ensuite été exprimée sous forme de seuils : pas plus de 24 heures de production perdue à l’usine principale, aucune tolérance pour une altération non détectée des registres de lots et une remontée obligatoire au comité de direction pour tout scénario susceptible d’entraîner un avis relatif à la vie privée. Au regard de ces critères, cinq scénarios étaient au-dessus de la tolérance, quatre approximativement à la tolérance et trois sous la tolérance. Pendant la revue, une directrice d’usine a contesté le discours rassurant selon lequel le réseau de production était isolé; le comité a consigné son désaccord, a demandé une vérification et a appris qu’une connexion de télémaintenance destinée à un fournisseur contournait entièrement la séparation.

Mobilisation. Chaque scénario prioritaire a fait l’objet d’une décision de traitement explicite et s’est vu attribuer un responsable nommément désigné :

- Atténuer : Pour le rançongiciel touchant les usines, le vice-président des opérations est responsable d’un programme comprenant la segmentation du réseau entre les systèmes de bureau et ceux des usines, des sauvegardes immuables assorties de tests de restauration planifiés et un contrôle plus strict des accès privilégiés et des accès à distance des fournisseurs.
- Transférer : La police de cyberassurance a été renouvelée afin de couvrir les frais d’intervention et l’interruption des activités. Le comité a consigné au procès-verbal que l’assurance ne transférerait ni la perte de confiance des clients ni les conséquences réglementaires, et les exigences propres à l’assureur, comme l’authentification multifacteur pour l’accès à distance, ont été ajoutées au plan de contrôle.
- Éviter : Les ventes ont proposé de donner aux clients clés un accès direct à la planification de la production hébergée sur le réseau de l’usine. Comme cette conception créait une exposition qui ne pouvait pas être atténuée à un coût raisonnable, le chef de la direction l’a rejetée, et le portail a été repensé sous la forme d’un service infonuagique distinct alimenté par une exportation unidirectionnelle.
- Accepter : Un système patrimonial du laboratoire de qualité ne peut pas recevoir de correctifs avant son remplacement, prévu dans 18 mois. Le risque résiduel, après isolement et surveillance renforcée, se situe approximativement à la tolérance. La vice-présidente de la qualité a signé l’acceptation à titre de responsable du risque, le chef de la direction l’a contresignée, et elle expire au bout de 12 mois, ou plus tôt si un code d’exploitation fonctionnel est publié ou si le projet de remplacement prend du retard.
Le comité a aussi approuvé une matrice des pouvoirs d’acceptation : les directeurs peuvent accepter les risques sous la tolérance, les dirigeants peuvent accepter les risques approximativement à la tolérance, et aucun risque au-dessus de la tolérance ne peut être accepté à un niveau inférieur à celui du comité de direction, le conseil étant informé.

Cohérence budgétaire. Le portefeuille de traitement a imposé une discussion budgétaire. Les dépenses de cybersécurité représentaient environ 4,6 % du budget des TI, salaires compris, ce qui place Valmont près de la borne inférieure de la fourchette de 4 % à 12 % établie par la pratique exemplaire, celle qui correspond à une organisation qui recherche le risque. Cela était incompatible avec un énoncé d’appétence qui qualifiait l’entreprise de réfractaire au risque dans ses domaines les plus importants. Le plan biennal approuvé porte les dépenses à environ 9,5 %, au-dessus de la médiane neutre face au risque de 7,8 % et sous les 12 % associés à une posture fortement réfractaire au risque, ce que le conseil a jugé cohérent avec l’appétence déclarée.

Surveillance et gestion de l’exposition. Le comité a délibérément distingué les résultats des scénarios, mis à jour à chaque réévaluation, des ICR servant à surveiller l’exposition entre les évaluations. Six ICR ont été rattachés aux scénarios prioritaires : les vulnérabilités critiques sur les systèmes exposés à Internet dont la cible de correction est dépassée, la couverture de l’authentification multifacteur pour les comptes administratifs et les comptes des fournisseurs, le taux de réussite des tests de restauration des systèmes des usines, les risques acceptés dont la date d’expiration est dépassée, les lacunes d’assurance non résolues chez les fournisseurs critiques et les connexions non autorisées détectées entre les réseaux de bureau et ceux des usines. Chaque ICR a un responsable, un seuil et un circuit de remontée. Les ICR ne recalculent pas le risque; ils signalent que les hypothèses qui sous-tendent l’évaluation pourraient ne plus tenir. L’exposition a aussi été traduite en termes d’affaires au moyen d’un bref bilan d’impact sur les activités : une journée perdue à l’usine principale signifiait des expéditions manquées, des pénalités contractuelles et des heures supplémentaires, tandis que des registres de lots altérés signifiaient des produits mis en quarantaine et des avis aux clients.

Ce à quoi ressemble une bonne pratique est devenu visible six mois plus tard. Après une mise à niveau d’équipement, l’ICR des tests de restauration a franchi son seuil parce que les nouveaux systèmes de l’usine n’avaient pas été ajoutés au périmètre de sauvegarde. Le dépassement du seuil a déclenché une réévaluation ciblée et une correction en quelques semaines, plutôt qu’une découverte en plein incident de rançongiciel. Le rapport trimestriel au conseil présente désormais les scénarios au-dessus de la tolérance, les ICR par rapport à leurs seuils, les acceptations qui approchent de leur échéance et les décisions à prendre.

Questions que les gestionnaires et les conseils d’administration devraient poser

- Appétence : Le conseil a-t-il approuvé un énoncé d’appétence pour le risque qui distingue les types de risques que nous acceptons et ceux que nous refusons, et les gestionnaires peuvent-ils le traduire en seuils de tolérance concrets?
- Critères : Avons-nous défini ce que signifient un impact élevé et une vraisemblance élevée pour notre organisation, et quels scénarios doivent faire l’objet d’une remontée automatique?
- Priorisation : Notre registre des risques est-il un classement défendable de scénarios assorti de décisions consignées, ou un arriéré de risques indifférenciés?
- Choix de traitement : Pour chaque scénario prioritaire, pouvons-nous voir si nous avons choisi d’accepter, d’éviter, de transférer ou d’atténuer, pourquoi, et qui est responsable de la décision?
- Pouvoir d’acceptation : Le niveau hiérarchique de la personne qui accepte un risque résiduel est-il proportionné au niveau de ce risque, et un risque au-dessus de la tolérance est-il accepté à un niveau inférieur à celui du comité de direction?
- Échéance : Quels risques acceptés arrivent à échéance au prochain trimestre, lesquels sont déjà échus et quelles conditions déclencheraient une revue anticipée?
- Limites du transfert : Quelles conséquences nos contrats d’assurance et nos contrats avec les fournisseurs ne couvriraient-ils pas, et les avons-nous prévues?
- Surveillance : Nos ICR sont-ils rattachés aux scénarios prioritaires, chacun avec un responsable, un seuil et un circuit de remontée, et sont-ils distincts des résultats de l’évaluation périodique des risques?
- Exposition : Pouvons-nous décrire, en termes d’affaires, ce que nous coûterait une journée de perturbation de chaque processus critique, y compris les conséquences en matière de conformité?
- Cohérence budgétaire : Nos dépenses de cybersécurité, en proportion du budget des TI, sont-elles cohérentes avec l’appétence pour le risque que nous avons déclarée?
- Remise en question : À quand remonte la dernière décision majeure en matière de risque qui comprenait une opinion dissidente documentée, et qu’en avons-nous appris?

## Conclusion

La gestion des risques de cybersécurité est la pratique rigoureuse qui consiste à cerner des scénarios réalistes axés sur la menace, à les évaluer et à les prioriser au regard de critères définis par la gouvernance, et à mobiliser les ressources pour maintenir le risque dans les limites de la tolérance. Ce n’est pas une simple activité technique. C’est une prise de décision de gestion en situation d’incertitude, ancrée dans les objectifs organisationnels, les obligations légales et contractuelles et les contraintes réelles des budgets et des capacités.

Concrètement, un programme mature utilise un cycle reproductible (Identification, Priorisation, Mobilisation), repose sur une analyse fondée sur des scénarios, est surveillé au moyen d’indicateurs significatifs comme les ICR et fait l’objet d’une amélioration continue grâce aux boucles de revue, aux audits et aux actions correctives. Cette architecture fournit aussi les éléments probants dont une organisation moderne a besoin pour démontrer l’efficacité de ses contrôles et son état de préparation en matière de conformité, s’alignant naturellement sur les attentes relatives aux systèmes de gestion, comme celles qu’exprime la norme ISO 37301, notamment la réévaluation périodique des risques (en particulier ceux qui sont liés aux processus confiés à des tiers) et la conservation des informations documentées qui appuient à la fois les évaluations des risques et les mesures prises en réponse.

Le chapitre suivant s’appuie directement sur ces fondements en présentant une méthode d’évaluation des risques fondée sur des scénarios qui permet de rendre opérationnelles les phases d’identification et de priorisation, et de créer des récits de risque et des indicateurs utilisables en continu — non seulement pour l’analyse, mais aussi pour la reddition de comptes en matière de gouvernance, la mobilisation opérationnelle et l’amélioration durable.

## Résumé du chapitre

La gestion des risques de cybersécurité est le deuxième pilier du continuum gouvernance, risque et conformité. Elle traduit les choix de gouvernance en décisions fondées sur des éléments probants : quoi corriger d’abord, quoi surveiller, quoi accepter, quoi transférer et quoi éviter, afin que le risque demeure dans les limites de l’appétence et de la tolérance de l’organisation. Le chapitre ancre ce travail dans le triangle du risque formé par les menaces, les vulnérabilités et l’exposition, l’organise au moyen du cycle Identification, Priorisation, Mobilisation (IPM) et exige que le programme qui en découle soit traçable, mesuré par des indicateurs clés de risque, protégé contre les biais et prêt, dès sa conception, pour l’audit et la conformité. Les scénarios y sont présentés comme le pont entre l’analyse technique et les décisions d’affaires.

Points clés à retenir

- Le risque apparaît lorsqu’une menace peut, de façon réaliste, exploiter une vulnérabilité et produire une exposition; on peut donc le réduire en agissant sur n’importe quelle face du triangle du risque.
- La gestion des risques porte sur les risques gérables; les issues certaines sont des nécessités opérationnelles, et l’incertitude profonde appelle la résilience et la préparation plutôt qu’une cotation fine.
- Le cycle IPM (Identification, Priorisation, Mobilisation) est itératif, et un système de gestion aligné sur l’ISO exige que les décisions relatives aux risques soient traçables, des objectifs jusqu’aux traitements, aux indicateurs et aux revues.
- L’acceptation, l’évitement, le transfert et l’atténuation se combinent d’un risque à l’autre; l’acceptation exige une autorité proportionnée et une date d’échéance, et le transfert ne peut déplacer les conséquences réglementaires, réputationnelles ou de confiance.
- Dans la méthode du chapitre 6, l’atténuation multiplie les parts de probabilité et d’impact éliminées : un ensemble de mesures ne réduit le risque calculé que s’il agit sur les deux leviers, et le transfert est consigné comme une décision.
- L’appétence pour le risque se fixe sur une échelle de 0 à 1 (environ 0,30 réfractaire au risque, 0,50 neutre, 0,70 qui recherche le risque), et un ratio de tolérance inférieur à 0,90, de 0,90 à 1,10 ou supérieur à 1,10 se lit respectivement sous la tolérance, approximativement à la tolérance ou au-dessus de la tolérance.
- Comme vérification de vraisemblance fondée sur les pratiques exemplaires, les dépenses de cybersécurité devraient représenter environ 12 %, 7,8 % ou 4 % du budget total des TI, salaires compris, pour une appétence réfractaire au risque, neutre ou qui recherche le risque, avec interpolation linéaire.
- Les évaluations des risques sont des décisions sociotechniques faussées par des biais comme l’excès de confiance, l’ancrage, la disponibilité et la pensée de groupe, que la gouvernance contre par l’expression de la dissidence, la revue indépendante, les analyses prémortem et la sécurité psychologique.
- Les ICR sont des mesures prospectives de l’exposition croissante, distinctes des indicateurs clés de performance, et des normes comme l’ISO 37301, l’article 9.1 de l’ISO/IEC 27001, le NIST IR 8286B et la publication NIST SP 800-55 font des indicateurs une exigence de gouvernance.
- L’identification des menaces est une capacité continue, appuyée par le renseignement sur les menaces, qui utilise des catégories d’acteurs, de motivations, de techniques, de surfaces de menace et de cibles, la compromission de la chaîne d’approvisionnement étant traitée comme une menace de premier plan.
- La gestion des vulnérabilités est un processus d’affaires continu; CVE, CWE, CVSS et OWASP fournissent des vocabulaires communs, mais la gravité doit être mise en contexte selon la criticité des actifs, l’exposition et l’activité des menaces, comme le KEV et l’EPSS.
- La chaîne de frappe, ATT&CK, CAPEC et le modèle du diamant expliquent comment les menaces mettent en œuvre l’exploitation des vulnérabilités, tandis que l’exposition, évaluée au moyen du bilan d’impact sur les activités et des obligations de conformité, transforme les cyberévénements en préjudices d’affaires que les scénarios rendent propices à la décision.
Termes clés

- Triangle du risque — Modèle selon lequel le risque apparaît à l’intersection des menaces, des vulnérabilités et de l’exposition, et se réduit en agissant sur au moins l’une d’elles.
- Cycle IPM — Démarche itérative Identification, Priorisation, Mobilisation qu’utilise le manuel pour rendre la gestion des risques compréhensible, reproductible et auditable.
- Acceptation du risque — Décision documentée et délibérée de tolérer un risque résiduel défini sans contrôles supplémentaires, avec une autorité proportionnée, une surveillance et une date d’échéance.
- Évitement du risque — Décision délibérée de cesser ou de ne pas entreprendre une activité qui créerait une exposition intolérable, habituellement soumise à la haute direction parce qu’elle touche la stratégie.
- Transfert du risque — Déplacement d’une partie du fardeau financier ou de la responsabilité opérationnelle vers une autre partie, généralement par l’assurance ou des contrats, sans éliminer les conséquences non transférables.
- Atténuation du risque — Stratégie qui réduit la vraisemblance d’une exploitation ou l’impact d’une exploitation réussie au moyen de contrôles techniques, administratifs et physiques.
- Appétence pour le risque — Énoncé général de la quantité et des types de risques que l’organisation est disposée à accepter pour atteindre ses objectifs, exprimé sur une échelle de 0 à 1 dans la méthode du manuel.
- Tolérance au risque — Seuils opérationnels plus précis au-delà desquels une action est requise, appliqués scénario par scénario.
- Ratio de tolérance — Risque résiduel divisé par le risque toléré, qui se lit sous la tolérance en deçà de 0,90, approximativement à la tolérance de 0,90 à 1,10 et au-dessus de la tolérance au-delà de 1,10.
- Indicateur clé de risque (ICR) — Mesure prospective qui donne une alerte précoce d’une exposition croissante, par opposition à l’indicateur clé de performance, qui mesure l’atteinte des objectifs.
- Pensée de groupe — Distorsion collective par laquelle une équipe étouffe la dissidence et converge prématurément vers une conclusion rassurante sur le risque.
- Surface de cybermenace — Ensemble des systèmes et services d’information qu’un acteur de menace peut exploiter, y compris les terminaux exposés à Internet et les services qui en dépendent.
- Vulnérabilité — Faiblesse d’un système d’information, des procédures de sécurité d’un système, des contrôles internes ou de la mise en œuvre, qui pourrait être exploitée ou déclenchée par une source de menace.
- CVSS — Common Vulnerability Scoring System du FIRST, aujourd’hui en version 4.0, qui produit un score numérique de gravité utile au triage initial, mais qui ne mesure pas le risque organisationnel.
- Exposition au risque — Espace des préjudices plausibles pour l’organisation, défini à l’avance, si une menace exploitait avec succès une vulnérabilité.

## Questions de révision

Questions à développement

1. En prenant Groupe Valmont Polymères comme modèle, appliquez le cycle IPM à une organisation de votre choix. Déterminez trois scénarios, proposez des critères de risque et des seuils de tolérance, justifiez une décision de traitement pour chaque scénario et évaluez si les dépenses de cybersécurité de l’organisation sont cohérentes avec l’appétence qu’elle a déclarée.

2. Un membre du conseil d’administration soutient que le renouvellement de la police de cyberassurance « règle » le risque de rançongiciel de l’organisation. Évaluez cette affirmation à la lumière de ce que dit le chapitre sur le transfert du risque, les dépendances envers les tiers, le risque résiduel et la façon dont la méthode du chapitre 6 consigne le transfert.

3. Analysez comment des biais individuels et collectifs pourraient mener un comité de sécurité à une conclusion sur le risque rassurante mais erronée. Concevez un ensemble de mécanismes de gouvernance pour contrer ces biais, et justifiez en quoi chacun améliore le caractère défendable des décisions relatives aux risques.

4. Le chapitre affirme qu’« un score de gravité élevé ne signifie pas le risque d’affaires le plus élevé ». Examinez cet énoncé de façon critique en expliquant le rôle des CVE, des CWE, du CVSS, du KEV et de l’EPSS, et comment la criticité des actifs, l’accessibilité et le contexte de menace devraient modifier la priorisation des vulnérabilités.

5. Concevez un ensemble de cinq indicateurs clés de risque pour les scénarios prioritaires d’une organisation que vous connaissez, chacun avec un responsable, un seuil et une voie de remontée. Expliquez en quoi ces ICR diffèrent des indicateurs clés de performance et des résultats d’évaluations périodiques des risques, et comment ils soutiennent une gouvernance prête pour la conformité.

Questions à choix multiples

Choisissez la meilleure réponse. Les réponses figurent à l’annexe « Réponses aux questions à choix multiples ».

1. Dans le triangle du risque utilisé au chapitre 4, le risque apparaît à l’intersection de quelles trois composantes?

A. Les actifs, les contrôles et le risque résiduel

B. Les menaces, les vulnérabilités et l’exposition

C. La vraisemblance, la détectabilité et la vélocité

D. La gouvernance, la gestion des risques et la conformité

2. Les terminaux non gérés seront inévitablement infectés. Selon le chapitre, comment faut-il traiter la protection des terminaux dans cette situation?

A. Comme un risque gérable à coter et à prioriser chaque année

B. Comme une incertitude profonde qu’on gère mieux par la seule planification de la continuité

C. Comme un risque résiduel que la direction peut accepter formellement

D. Comme une exigence opérationnelle de base plutôt qu’un sujet de débat

3. Une équipe de sécurité présente au conseil d’administration un registre de 200 risques non différenciés. Quel élément du cycle IPM manque sur le fond?

A. La Priorisation, parce qu’il n’y a ni ordre défendable ni trace des décisions

B. L’Identification, parce qu’il faut énumérer davantage de menaces avant de classer

C. La Mobilisation, parce que les fonds n’ont pas encore été affectés aux contrôles

D. L’Identification, parce qu’un registre de 200 éléments couvre trop peu d’actifs

4. Pourquoi le chapitre exige-t-il que les décisions relatives aux risques soient traçables dans une approche de système de gestion alignée sur l’ISO?

A. Parce que les auditeurs exigent que chaque risque soit quantifié en dollars

B. Parce que les évaluations annuelles deviennent suffisantes une fois les décisions documentées

C. Pour que l’organisation puisse montrer que le risque est géré dans les limites de la tolérance et tirer des leçons des incidents

D. Parce que la traçabilité remplace les revues de direction et les actions correctives

5. Une gestionnaire propose d’accepter, de sa propre autorité et sans date de fin, un risque résiduel au-dessus de la tolérance. Quelle pratique du chapitre cette proposition enfreint-elle le plus directement?

A. Une autorité d’acceptation proportionnée au niveau de risque, avec une date d’échéance

B. Un transfert accompagné d’une vérification diligente des contrôles des tiers

C. La remontée des décisions d’évitement parce qu’elles touchent la stratégie

D. Des ensembles de mesures d’atténuation qui agissent à la fois sur la probabilité et sur l’impact

6. Chez Groupe Valmont Polymères, le chef de la direction a rejeté un portail client hébergé sur le réseau de l’usine et l’a fait reconcevoir comme un service infonuagique distinct. Quelle stratégie cela illustre-t-il?

A. L’acceptation du risque, avec surveillance et date d’échéance

B. Le transfert du risque au moyen de clauses contractuelles avec les clients

C. L’évitement du risque lié à une conception dont l’exposition ne pouvait être raisonnablement atténuée

D. L’atténuation du risque par la segmentation du réseau existant de l’usine

7. Selon le chapitre, comment le transfert du risque est-il consigné dans la méthode quantitative du chapitre 6?

A. Comme une mesure d’atténuation qui réduit le risque calculé de la part assurée

B. Comme une réduction de l’impact égale à la part des pertes couverte par la police

C. Comme une raison de retirer le scénario du registre des risques

D. Comme une décision de traitement qui consigne la part couverte et la personne qui l’a approuvée

8. Dans la méthode du chapitre 6, un ensemble de mesures est décrit par la part de probabilité et la part d’impact qu’il élimine, et les deux sont multipliées. Qu’est-ce qui découle de cette convention?

A. Un ensemble de mesures qui n’agit que sur l’impact réduit tout de même de moitié le risque calculé

B. Un ensemble de mesures ne réduit le risque calculé que s’il agit sur les deux leviers

C. L’ajout de contrôles pousse toujours les parts au-delà de un

D. La prévention seule suffit, car la probabilité domine le produit

9. Selon le repère de pratique exemplaire du chapitre, avec interpolation linéaire, quelle part du budget total des TI, salaires compris, la cybersécurité devrait-elle représenter pour une appétence pour le risque de 0,40?

A. Environ 4,0 %

B. Environ 7,8 %

C. Environ 9,9 %

D. Environ 12,0 %

10. Le risque résiduel d’un scénario divisé par son risque toléré donne un ratio de 1,05. Comment le chapitre interprète-t-il ce résultat?

A. Approximativement à la tolérance, dans la plage de 0,90 à 1,10

B. Sous la tolérance, parce que le ratio est proche de 1

C. Au-dessus de la tolérance, puisque tout ratio supérieur à 1,00 est inacceptable

D. Indéterminé tant que le ratio n’est pas recalculé avec plus de décimales

11. Après une attaque par rançongiciel très médiatisée contre un concurrent, un comité consacre tout son budget au rançongiciel en ignorant un arriéré croissant de correctifs. Quel biais est le plus manifeste?

A. Le biais d’ancrage, où les premières hypothèses dominent l’analyse ultérieure

B. Le biais du statu quo, où l’inertie persiste malgré un environnement changé

C. Le biais d’optimisme, où le préjudice semble moins susceptible de nous toucher que nos pairs

D. Le biais de disponibilité, où les incidents récents et spectaculaires éclipsent des menaces plus probables

12. Quel mécanisme le chapitre recommande-t-il pour contrer la pensée de groupe dans les décisions importantes relatives aux risques?

A. Exiger l’approbation unanime du comité avant l’acceptation de tout risque

B. Exiger une opinion dissidente documentée pour les décisions importantes relatives aux risques

C. Limiter les ateliers sur les risques à la haute direction pour accélérer le consensus

D. Remplacer la discussion qualitative par un score de risque numérique unique

13. Quel énoncé distingue le mieux un indicateur clé de risque (ICR) d’un indicateur clé de performance?

A. Les ICR mesurent l’atteinte des objectifs; les indicateurs clés de performance signalent une exposition croissante

B. Les ICR donnent une alerte précoce d’une exposition croissante; les indicateurs clés de performance mesurent l’atteinte des objectifs

C. Les ICR sont des indices de risque calculés; les indicateurs clés de performance sont des valeurs de surveillance mesurées

D. Les ICR sont des mesures purement financières; les indicateurs clés de performance couvrent les domaines opérationnels

14. Dans le cadre du Centre pour la cybersécurité présenté au chapitre, quelle motivation est associée aux hacktivistes?

A. L’idéologie

B. Le profit

C. Des objectifs géopolitiques

D. La satisfaction

15. Comment le chapitre, citant le Centre pour la cybersécurité, caractérise-t-il les menaces persistantes avancées (APT)?

A. Comme une catégorie de menace définie par l’utilisation d’un rançongiciel à des fins lucratives

B. Comme des opportunistes peu qualifiés qui achètent des outils dans des marchés en ligne

C. Comme un marqueur de capacité propre aux acteurs de premier rang qui mènent des campagnes prolongées

D. Comme des initiés qui abusent d’un accès légitime pour contourner le périmètre

16. Quel énoncé décrit correctement le rôle des CVE, des CWE et du CVSS?

A. Les CVE classent les types de faiblesses; les CWE désignent les vulnérabilités divulguées; le CVSS classe le risque d’affaires

B. Les CVE cotent la gravité; les CWE suivent les vulnérabilités exploitées; le CVSS désigne des problèmes précis

C. Les CVE classent les corrections; les CWE prédisent l’exploitation; le CVSS énumère des catégories de risques applicatifs

D. Les CVE désignent des problèmes précis; les CWE décrivent la classe de faiblesse; le CVSS soutient le triage initial de la gravité

17. Comment le score de base CVSS v4.0 de la faiblesse d’un scénario est-il utilisé dans la méthode d’évaluation des risques des chapitres 5 et 6?

A. Comme un multiplicateur obligatoire de l’indice de risque, jamais utilisé seul pour classer les scénarios

B. Comme le principal critère de sélection des scénarios à évaluer

C. Comme un substitut aux estimations de probabilité lorsque les éléments probants sont faibles

D. Comme une donnée facultative, utilisée seulement lorsque la faiblesse est technique

18. Le déploiement du filtrage des courriels et de l’authentification de l’expéditeur (SPF, DKIM, DMARC) protège principalement quelle phase de la chaîne de frappe?

A. La reconnaissance

B. L’armement

C. La livraison

D. La commande et le contrôle

19. Quels sont les quatre éléments fondamentaux qu’utilise le modèle du diamant d’analyse des intrusions pour décrire une activité malveillante?

A. La reconnaissance, la livraison, l’exploitation et les actions sur les objectifs

B. Les tactiques, les techniques, les procédures et les indicateurs

C. La menace, la vulnérabilité, l’exposition et l’impact

D. L’adversaire, la victime, la capacité et l’infrastructure

20. Une vulnérabilité critique se trouve sur un serveur interne qui ne peut être atteint dans des conditions réalistes, tandis qu’une vulnérabilité moyenne se trouve sur un service exposé à Internet. Que suggère le raisonnement du chapitre sur l’exposition?

A. La vulnérabilité critique présente toujours un risque plus élevé, car la gravité détermine le risque

B. La vulnérabilité accessible peut présenter un risque plus élevé, car l’exposition combine faiblesse et accessibilité

C. Les deux présentent un risque égal, car chacune a un identifiant CVE et un score

D. Aucune n’importe tant qu’un code d’exploitation fonctionnel n’est pas publié pour chacune
