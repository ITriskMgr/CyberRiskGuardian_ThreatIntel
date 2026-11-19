<!-- Léger, M.-A. (2026). Introduction à la gouvernance de la cybersécurité pour la gestion des technologies d’affaires (3e éd., v2.51). Chapitre 10 : Gestion des identités et des accès. CC BY-NC 4.0 -->

# Chapitre 10 : Gestion des identités et des accès

## Résultats d’apprentissage

Au terme de ce chapitre, vous devriez être en mesure de :

1. Distinguer la gestion des identités et des accès (GIA) de la gestion des accès privilégiés (GAP) et expliquer pourquoi l’accès privilégié est une autorité organisationnelle déléguée.

2. Expliquer les raisons structurelles pour lesquelles les faiblesses liées à l’identité déclenchent, rendent possibles ou amplifient autant d’incidents de cybersécurité.

3. Concevoir un modèle opérationnel de GIA qui répartit les droits décisionnels entre la fonction centrale d’identité, les responsables métier et les fonctions de risque et d’assurance, y compris des exceptions encadrées.

4. Appliquer la rigueur du cycle de vie des arrivées, mutations et départs aux identités humaines et non humaines, et déterminer les contrôles qui préviennent l’accumulation de privilèges et les accès orphelins.

5. Recommander une stratégie d’authentification qui proportionne l’assurance à la conséquence, en recourant à des méthodes résistantes à l’hameçonnage, aux niveaux d’assurance de la publication NIST SP 800-63-4, à l’accès conditionnel et à une récupération sécurisée.

6. Comparer les modèles d’autorisation RBAC et ABAC et évaluer si les revues des accès et les contrôles de séparation des tâches procurent une assurance réelle plutôt qu’une simple paperasse remplie.

7. Évaluer les contrôles de GAP, d’accès d’urgence, d’accès des tiers et des identités non humaines au regard du principe selon lequel l’autorité doit être minimisée, attribuable, surveillée et révocable.

8. Justifier une feuille de route de GIA et de GAP fondée sur les risques, appuyée par des éléments probants fiables et par des mesures dignes d’une gouvernance qui mesurent l’exposition plutôt que l’activité administrative.

Dans les entreprises modernes et les environnements infonuagiques, l’identité est devenue l’un des plans de contrôle les plus importants en cybersécurité. Les réseaux demeurent essentiels, mais ils ne constituent plus la seule — ni nécessairement la principale — frontière du contrôle d’accès. Les utilisateurs, les applications, les appareils, les charges de travail, les données, les comptes de service, les interfaces de programmation d’applications (API) et les intégrations de tiers fonctionnent désormais à travers des plateformes de logiciel-service (SaaS), des services infonuagiques, des environnements de télétravail, des écosystèmes de partenaires et des infrastructures hybrides. La question centrale en cybersécurité n’est donc plus simplement de savoir comment le réseau est segmenté, mais qui ou quoi peut accéder à quelles ressources, dans quelles conditions, avec quel niveau de privilège, et comment cet accès est surveillé, revu et étayé par des éléments probants au fil du temps.

Pour les gestionnaires, la gestion des identités et des accès (GIA) et la gestion des accès privilégiés (GAP) ne sont pas de simples fonctions techniques ou administratives. Ce sont des domaines de contrôle fondamentaux de la gouvernance. Elles déterminent qui peut agir dans les systèmes de l’organisation, approuver des transactions, consulter ou modifier des renseignements sensibles, administrer l’infrastructure, changer des configurations et contourner les mesures de protection habituelles. En ce sens, la GIA et la GAP façonnent directement l’exposition de l’organisation à la fraude, au sabotage, aux rançongiciels, à l’espionnage, aux abus commis par des initiés, aux manquements en matière de protection des renseignements personnels et de réglementation, et aux perturbations opérationnelles.

Lorsque la GIA échoue, l’organisation perd le contrôle des accès courants. Lorsque la GAP échoue, elle perd le contrôle de ses capacités les plus puissantes. De nombreux cyberincidents importants sont amorcés, facilités ou amplifiés par des faiblesses de la gouvernance des identités : identifiants volés, authentification faible, déploiement incomplet de l’authentification multifacteur (AMF), privilèges excessifs, séparation insuffisante entre les comptes ordinaires et les comptes d’administration, comptes de service non gérés, clés d’API et secrets exposés, processus d’arrivées, de mutations et de départs inefficaces, et surveillance insuffisante des activités privilégiées. Des attaques qui paraissent très techniques en surface sont souvent, au fond, des défaillances de l’authentification, de l’autorisation ou de la gouvernance des privilèges. Un attaquant peut d’abord obtenir l’identité légitime d’un utilisateur, puis acquérir des privilèges supplémentaires, ensuite obtenir des pouvoirs d’administration et, finalement, agir au moyen d’autorisations que l’organisation elle-même a accordées. À ce stade, la distinction entre un attaquant externe et un utilisateur autorisé devient floue sur le plan opérationnel.

Les environnements infonuagiques et SaaS accentuent cette réalité, car l’identité y sert souvent de principal plan de contrôle. Les identités d’administration peuvent contrôler les consoles de gestion, les bases de données, le stockage, les réseaux virtuels, les clés de chiffrement, les systèmes de journalisation, les contrôles de sécurité et les charges de travail. Un compte d’administrateur infonuagique compromis peut donc permettre à un attaquant de modifier des configurations, d’exposer ou de supprimer des données, de désactiver la surveillance, de manipuler des clés de chiffrement, d’établir une persistance, de créer de nouvelles identités ou de se déplacer entre des environnements interconnectés — souvent sur une grande partie du parc technologique à la fois.

Le même défi de gouvernance s’applique aux identités non humaines : comptes de service, charges de travail, scripts d’automatisation, identifiants d’API, jetons, secrets, certificats et identités de machine à machine. Ces identités sont de plus en plus nombreuses et détiennent souvent des privilèges importants parce qu’elles rendent possibles des processus d’affaires et techniques automatisés; pourtant, elles reçoivent parfois moins d’attention en matière de gouvernance que les comptes humains. Les identifiants peuvent avoir une longue durée de vie, la responsabilité peut être floue, les autorisations peuvent s’accumuler et l’accès peut persister longtemps après la disparition du besoin initial. À mesure que les organisations s’appuient davantage sur les services infonuagiques, les API, l’automatisation et l’intelligence artificielle, la gouvernance de ces identités devient une composante de plus en plus importante de la gouvernance de la cybersécurité.

La GIA et la GAP méritent une attention particulière parce qu’elles font le pont entre l’intention de gouvernance et l’exécution technique. L’appétence pour le risque, les obligations de conformité, la séparation des tâches, les exigences en matière de protection des renseignements personnels, le principe du moindre privilège, la résilience opérationnelle et l’imputabilité dépendent tous de la capacité de l’organisation à gouverner l’identité. Les politiques peuvent énoncer que l’accès doit être restreint, les privilèges réduits au minimum et les actions sensibles surveillées, mais ces objectifs ne prennent leur sens que lorsque les contrôles d’identité les traduisent en comportements des systèmes qu’il est possible d’imposer. L’authentification, l’autorisation, l’attribution des accès, les revues des accès, la gestion des sessions privilégiées, la gestion des secrets, la journalisation et la collecte d’éléments probants ne sont donc pas des tâches techniques isolées. Ensemble, elles déterminent qui ou quoi peut agir, quelles actions peuvent être effectuées, dans quelles conditions, avec quel degré d’autorité, et comment la direction sait si cet accès demeure approprié.

Ce chapitre s’appuie sur les fondements de gouvernance des chapitres 2 et 4, sur l’évaluation des risques fondée sur des scénarios des chapitres 5 et 6 et sur les cadres de contrôles du chapitre 9. Il définit la GIA et la GAP ainsi que la frontière entre les deux, explique pourquoi les défaillances liées à l’identité dominent le paysage des incidents, puis expose les objectifs de gouvernance, les droits décisionnels et le cycle de vie des identités. Il examine ensuite l’authentification, l’autorisation, la séparation des tâches, l’accès des tiers, l’accès privilégié, l’accès d’urgence et les identités non humaines, avant d’aborder les éléments probants, les mesures et une feuille de route pratique de mise en œuvre. Une gouvernance efficace des identités ne consiste pas simplement à contrôler l’accès à la technologie. Elle consiste à contrôler l’exercice de l’autorité organisationnelle dans les systèmes numériques.

## GIA et GAP : définitions et frontière managériale

La gestion des identités et des accès (GIA) englobe les politiques, les processus, les technologies, les rôles et les mécanismes de reddition de comptes qu’une organisation utilise pour gouverner les identités numériques et leur accès à l’information, aux systèmes, aux applications et aux autres ressources. La GIA couvre les identités humaines et non humaines, notamment les employés, les contractuels, les partenaires, les clients, les appareils, les applications, les comptes de service et les charges de travail. Elle encadre la façon dont ces identités sont établies, authentifiées, autorisées, surveillées, revues, modifiées et, finalement, supprimées.

Concrètement, la GIA comprend la gestion du cycle de vie des identités, l’authentification, l’autorisation, l’attribution et le retrait des accès, la fédération d’identités, l’authentification unique (SSO), les revues des accès et les éléments probants nécessaires pour démontrer que les accès demeurent appropriés. Son objectif n’est pas simplement d’accorder des accès, mais de veiller à ce que les accès correspondent à un besoin d’affaires légitime, reflètent le rôle actuel de la personne ou du système et évoluent à mesure que changent les responsabilités, le statut d’emploi, les relations contractuelles ou les exigences opérationnelles.

La gestion des accès privilégiés (GAP) est un domaine spécialisé de la gouvernance des identités qui porte sur les identités, les autorisations, les identifiants et les activités qui confèrent des pouvoirs élevés ou exceptionnels. L’accès privilégié est un accès qui peut avoir une incidence importante sur les systèmes, les configurations de sécurité, la protection des données, les processus d’affaires, les résultats financiers ou les droits d’accès d’autres utilisateurs. Il comprend l’administration de l’infrastructure, la modification des configurations, la création ou la suppression d’identités, la modification des autorisations, la désactivation des contrôles de sécurité, l’accès à grande échelle à de l’information sensible, l’exécution d’opérations à fort impact ou l’intervention dans les systèmes en situation d’urgence. Les mécanismes de GAP typiques comprennent la mise en coffre-fort des identifiants, la séparation des comptes d’administration, les privilèges juste-à-temps (JIT) et juste suffisants, les flux d’approbation, la surveillance et l’enregistrement des sessions privilégiées, les revues périodiques des accès privilégiés, les procédures d’accès d’urgence (« bris de glace ») et les contrôles visant les identités non humaines privilégiées. Ces contrôles sont importants parce que l’accès privilégié peut contourner, modifier ou désactiver les mesures de protection qui encadrent les utilisateurs ordinaires.

Une distinction managériale utile est donc la suivante.

La GIA encadre les accès à l’échelle de l’organisation, tandis que la GAP encadre les privilèges exceptionnels en son sein.

La GIA vérifie si une personne, un appareil, une application ou un service dispose des accès appropriés pour accomplir un travail légitime. La GAP vérifie si les accès susceptibles d’entraîner des conséquences disproportionnées sont réduits au minimum, justifiés, étroitement contrôlés, surveillés et documentés. La distinction n’est pas absolue — la GAP est étroitement intégrée à la GIA —, mais elle est utile parce que les conséquences des défaillances liées aux accès privilégiés sont généralement beaucoup plus graves. La figure ci-dessous résume cette relation.

Figure 50 : GIA et GAP

Les deux domaines sont essentiels, mais la GAP mérite un examen plus attentif, car les identités privilégiées peuvent modifier l’environnement dans lequel les autres contrôles fonctionnent. Des accès ordinaires mal gérés peuvent exposer de l’information sensible, faciliter la fraude ou contrevenir aux exigences de séparation des tâches. Des accès privilégiés mal gérés peuvent permettre à un attaquant ou à un initié malveillant de modifier la posture de sécurité même de l’organisation. La compromission d’un administrateur de domaine, d’un compte de gestion infonuagique, d’un administrateur de base de données, d’un compte de service hautement privilégié ou d’identifiants d’automatisation peut permettre à un adversaire de créer des identités, d’élever des privilèges, de désactiver la surveillance, de modifier ou de supprimer des journaux, d’exfiltrer de grands volumes d’information, de déployer des logiciels malveillants, de détruire des sauvegardes ou d’établir un accès persistant. Puisque les identités privilégiées peuvent modifier les mesures de protection destinées à encadrer l’activité, leur compromission peut affaiblir simultanément plusieurs couches de protection.

C’est pourquoi l’accès privilégié est plus qu’une forme renforcée d’accès ordinaire. Il s’agit d’une autorité organisationnelle déléguée au sein des systèmes numériques. Une identité privilégiée peut être en mesure d’accomplir des actions qui exigeraient autrement une autorité organisationnelle formelle : approuver des changements, modifier des registres financiers ou opérationnels, changer des politiques de sécurité, accorder des accès à d’autres ou interrompre des services critiques. La GAP encadre donc non seulement les identifiants, mais aussi l’exercice contrôlé de cette autorité déléguée.

Pour les professionnels de la gestion des technologies d’affaires, les deux domaines soulèvent des questions de gouvernance distinctes. La gouvernance de la GIA vérifie si les accès reposent sur des exigences d’affaires légitimes, s’alignent sur les rôles et les responsabilités, sont revus périodiquement, sont ajustés à mesure que la situation évolue et sont retirés rapidement lorsqu’ils ne sont plus nécessaires. La gouvernance de la GAP vérifie si les pouvoirs exceptionnels ont été réduits au minimum, attribués séparément, approuvés expressément, limités dans leur durée et leur portée lorsque c’est possible, isolés des activités courantes, étroitement surveillés et soumis à un examen indépendant.

Ensemble, la GIA et la GAP concrétisent plusieurs principes fondamentaux de gouvernance. Le principe du moindre privilège exige que les identités ne reçoivent pas plus d’autorité que nécessaire. La séparation des tâches empêche une seule identité d’exercer des pouvoirs incompatibles sans surveillance. L’imputabilité exige que les actions importantes puissent être attribuées à des acteurs identifiables ou à des services contrôlés. La gouvernance du cycle de vie garantit que les accès évoluent en fonction des changements organisationnels. La surveillance et les éléments probants permettent à la direction de déterminer si les contrôles d’accès fonctionnent comme prévu, plutôt que de simplement le supposer. L’objectif managérial est de veiller à ce que l’autorité numérique soit accordée délibérément, proportionnée au besoin légitime, encadrée par des contrôles appropriés, observable, réévaluée périodiquement et retirée lorsqu’elle n’est plus justifiée.

## Pourquoi les défaillances liées à l’identité dominent le paysage des incidents

Les gestionnaires devraient comprendre pourquoi les faiblesses liées à l’identité apparaissent si souvent dans les incidents de cybersécurité. La compromission d’une identité légitime permet aux attaquants d’entrer dans l’organisation et d’y agir par les mêmes voies qu’empruntent les employés, les administrateurs, les applications, les appareils et les fournisseurs. Dès qu’un attaquant obtient des identifiants valides, une session utilisable ou une autre identité de confiance, son activité malveillante peut ne plus ressembler à une intrusion classique. Pour les systèmes concernés, elle peut d’abord avoir l’apparence d’un travail légitime effectué par un utilisateur ou un service autorisé. Cinq raisons structurelles l’expliquent.

- Les identifiants sont des cibles d’attaque exploitables à grande échelle. Les attaquants peuvent voler, hameçonner, acheter, réutiliser, deviner ou extraire des mots de passe, des jetons, des témoins de session et des clés d’API auprès des utilisateurs et des systèmes compromis. Le bourrage d’identifiants exploite la réutilisation des mots de passe d’un service à l’autre, l’hameçonnage exploite la confiance et l’urgence, et l’information volée sur des appareils ou des navigateurs compromis peut servir à détourner des sessions authentifiées. Cette combinaison de disponibilité, de réutilisation et d’automatisation fait de la compromission d’identité un vecteur d’accès initial efficace.
- Les relations d’identité s’étendent au-delà des frontières de l’organisation. Les contractuels, les fournisseurs, les consultants, les fournisseurs de services gérés, les plateformes infonuagiques, les intégrations logicielles et les API reposent tous sur une forme de relation de confiance numérique. Chacun crée de la valeur d’affaires, mais chacun constitue aussi une voie d’accès potentielle aux ressources de l’organisation. Le problème de gouvernance n’est plus de savoir quels employés devraient avoir accès, mais à quelles personnes et à quels systèmes d’un écosystème interconnecté il convient de faire confiance, dans quelle mesure et à quelles conditions.
- Les autorisations s’accumulent au fil du temps. Les accès sont accordés rapidement parce que les activités d’affaires en dépendent, tandis que leur retrait reçoit moins d’attention parce qu’il procure rarement un avantage immédiat. Les personnes changent de rôle, se joignent à des projets et partent; les consultants terminent leurs mandats; les exceptions temporaires persistent; les comptes de service sont réutilisés à de nouvelles fins. Cette accumulation de privilèges agrandit la surface d’attaque, affaiblit le principe du moindre privilège et peut créer des conflits de séparation des tâches.
- Les voies d’accès privilégiées peuvent échapper aux contrôles habituels. Les comptes d’administrateur partagés, les mots de passe de comptes de service à longue durée de vie, les clés d’API non gérées, les droits d’administrateur local permanents, les identifiants intégrés dans des scripts et les rôles d’administrateur infonuagique attribués de façon étendue peuvent échapper à la surveillance, à la rotation, aux revues ou à l’attribution d’un responsable. Puisque les identités privilégiées peuvent modifier l’environnement lui-même, leur compromission peut transformer une intrusion limitée en incident touchant toute l’entreprise.
- Les attaques fondées sur l’identité ressemblent à une activité légitime. Un pare-feu peut autoriser la connexion, une application peut accepter les identifiants, une plateforme infonuagique peut valider le jeton et une base de données peut autoriser la requête. Du point de vue de chaque contrôle, l’activité est permise parce que l’identité détient des droits valides. L’autorisation technique ne signifie pas que la personne ou le processus qui l’exerce est légitime.
Ce dernier point met en évidence une limite importante de la sécurité axée sur le périmètre. Savoir qu’une identité authentifiée est autorisée à effectuer une action n’établit pas que cette activité est appropriée dans les circonstances. Les organisations ont de plus en plus besoin de contexte supplémentaire : l’appareil utilisé, l’emplacement, la force de l’authentification, la sensibilité de la ressource, le moment de l’accès, le comportement historique et la cohérence de l’action avec le rôle légitime de l’identité. C’est pourquoi l’authentification résistante à l’hameçonnage, l’accès conditionnel, l’analyse comportementale et la surveillance des sessions privilégiées ont pris une importance croissante.

Du point de vue de la gouvernance, la GIA et la GAP sont des domaines de contrôle à fort effet de levier, car ils influent à la fois sur la vraisemblance et sur les conséquences des incidents; dans les termes du triangle du risque, ils réduisent la vulnérabilité exploitable et limitent l’impact. Ils réduisent la vraisemblance d’une compromission réussie en renforçant l’authentification, en contrôlant la création des identités, en limitant les accès superflus et en gérant les identifiants et leur cycle de vie. Ils réduisent l’impact d’une compromission en appliquant le principe du moindre privilège, la séparation des tâches, la séparation des comptes d’administration, l’accès conditionnel et les privilèges juste-à-temps. Ils renforcent aussi l’imputabilité en montrant qui ou quoi avait accès, qui a approuvé cet accès, quand il a été exercé et s’il demeurait justifié. C’est pourquoi les faiblesses liées à l’identité occupent une place si importante dans les scénarios de risque élaborés aux chapitres 5 et 6 : des identifiants d’administrateur volés ou un compte de fournisseur orphelin constituent souvent le pivot qui fait basculer un scénario de mineur à grave.

L’analyse de rentabilisation est donc beaucoup plus large que la protection des processus de connexion. Une GIA et une GAP solides peuvent réduire l’exposition à la fraude, limiter le rayon d’impact d’un rançongiciel, freiner les abus de la part d’initiés, réduire le risque pour la vie privée, renforcer le contrôle sur les accès des fournisseurs et améliorer l’auditabilité. Chaque identité numérique représente un certain degré d’autorité organisationnelle déléguée : la GIA détermine l’ampleur de la distribution de cette autorité, et la GAP détermine la façon dont l’organisation contrôle ses pouvoirs numériques les plus lourds de conséquences. Lorsque la gouvernance des identités échoue, les attaquants n’ont pas nécessairement besoin de déjouer les contrôles de l’organisation — ils peuvent plutôt hériter du pouvoir de les utiliser, de les modifier ou de les désactiver.

## Objectifs de gouvernance de la GIA et de la GAP : à quoi ressemble une bonne pratique

Un programme mature de GIA et de GAP devrait produire des résultats clairs, observables et défendables. Sa finalité n’est pas simplement d’administrer des comptes ou d’automatiser des demandes d’accès, mais de veiller à ce que l’accès numérique soit approprié, justifié, proportionné, surveillé et constamment aligné sur des besoins d’affaires légitimes. Une gouvernance efficace devrait permettre à la direction de démontrer non seulement que des contrôles d’accès existent, mais aussi qu’ils fonctionnent de façon constante et que les écarts sont relevés et corrigés. Cinq objectifs sont particulièrement importants.

Identité vérifiée

Avant d’accorder un accès, l’organisation doit établir, avec un niveau de confiance approprié, que la personne, l’appareil, l’application, la charge de travail ou le service qui demande l’accès est bien l’identité qu’il prétend être. Pour les utilisateurs humains, cela comprend une vérification d’identité appropriée, une authentification forte et des exigences d’assurance plus élevées pour les rôles sensibles ou privilégiés. Le niveau d’assurance exigé devrait être proportionné aux conséquences d’un accès non autorisé plutôt qu’appliqué uniformément. Pour les identités non humaines, la vérification signifie avoir l’assurance que la charge de travail, le client d’API, le processus d’automatisation ou l’appareil qui présente des identifiants est bien le système prévu et qu’il n’a pas été remplacé, usurpé ou compromis. L’authentification ne porte donc pas simplement sur les mots de passe ou les utilisateurs; elle vise à établir une confiance suffisante envers tout acteur autorisé à exercer une autorité numérique.

Moindre privilège et besoin d’en connaître par défaut

Les accès ne devraient être accordés que dans la mesure nécessaire à l’exercice d’un rôle, d’une tâche, d’un processus ou d’une fonction système légitime — et non parce qu’ils pourraient servir plus tard, parce que des utilisateurs semblables les possèdent déjà ou parce que des autorisations étendues sont plus faciles à administrer. Les accès privilégiés exigent une discipline encore plus grande : les autorisations élevées devraient être réduites au minimum, séparées des accès ordinaires, limitées dans leur portée et leur durée lorsque c’est possible, approuvées explicitement et retirées lorsque le besoin prend fin. Le principe du moindre privilège réduit à la fois la vraisemblance d’un accès inapproprié et le rayon d’impact si une identité est compromise.

Séparation des tâches et droits décisionnels contrôlés

Les activités à risque élevé ne devraient pas reposer sur l’autorité non contrôlée d’une seule personne ou d’une seule identité. Lorsque les conséquences le justifient, les étapes d’un processus sensible devraient être réparties entre des rôles distincts, de sorte qu’aucun acteur ne puisse à lui seul lancer, approuver, exécuter et dissimuler la même action à fort impact. Le principe s’applique aux paiements, à l’approvisionnement, à la paie, à l’administration des identités, à l’approbation des accès privilégiés, à la configuration de la sécurité, à la gestion du changement et au rétablissement après incident. Il est examiné en détail plus loin dans ce chapitre.

Discipline du cycle de vie des identités

L’accès devrait suivre le cycle de vie légitime de la relation d’affaires qu’il représente. Il doit être créé, modifié, suspendu, revu et retiré à mesure que des personnes arrivent, changent de responsabilités, prennent un congé prolongé ou partent — et à mesure que des contractuels terminent leurs mandats, que des applications sont mises hors service, que des intégrations sont abandonnées et que des identifiants expirent. Sans une gouvernance rigoureuse du cycle de vie, les accès persistent après la disparition de leur justification, ce qui fait des défaillances du cycle de vie l’une des sources les plus prévisibles d’accès excessifs.

Auditabilité et éléments probants

L’organisation doit pouvoir reconstituer et démontrer la façon dont les accès ont été gouvernés : qui ou quoi avait accès, quelles autorisations ont été attribuées, pourquoi, qui les a approuvées, quand elles ont été utilisées, quelles actions importantes ont été effectuées et quand l’accès a été revu ou retiré. L’exigence est la plus forte pour les accès privilégiés, car les acteurs privilégiés peuvent potentiellement altérer les éléments probants qui servent à enquêter sur leurs propres actions. L’auditabilité ne devrait toutefois pas être confondue avec la production de grands volumes de journaux. Les éléments probants n’ont de valeur pour la gouvernance que s’ils sont complets, fiables, protégés, conservés et suffisamment examinables pour appuyer les décisions, les enquêtes et l’assurance.

L’état souhaité

Ensemble, ces objectifs définissent l’état souhaité de la gouvernance de la GIA et de la GAP :

- L’identité ne bénéficie pas simplement de la confiance; elle est vérifiée.
- L’accès n’est pas simplement accordé; il est justifié et réévalué périodiquement.
- Le privilège n’est pas simplement attribué; il est réduit au minimum et contrôlé.
- L’autorité n’est pas concentrée inutilement; elle est séparée lorsque le risque l’exige.
- L’activité n’est pas seulement journalisée; elle est rendue observable et étayée par des éléments probants crédibles.
Les politiques, l’appétence pour le risque et les obligations de conformité demeurent en grande partie des vœux pieux tant qu’elles ne sont pas appliquées au moyen de contrôles d’identité. La GIA et la GAP sont les mécanismes qui traduisent l’intention de gouvernance en une autorité numérique contrôlée et auditable.

## La gouvernance de la GIA dans la pratique : droits décisionnels, modèle opérationnel et imputabilité

La GIA est par nature un système de gouvernance transversal. Les TI ne peuvent pas la gouverner seules, et la cybersécurité ne peut pas la mettre en œuvre efficacement à elle seule. Les décisions relatives aux identités et aux accès touchent les opérations d’affaires, l’exposition à la fraude, la vie privée, la conformité réglementaire, la résilience opérationnelle, le risque lié aux tiers et l’intervention en cas d’incident. La question centrale de gouvernance n’est donc pas simplement de savoir comment les accès sont attribués, mais qui a le pouvoir de déterminer quels accès sont appropriés, dans quelles conditions et avec quelle imputabilité.

Une gouvernance efficace de la GIA repose sur des droits décisionnels clairement définis. L’organisation doit établir qui est responsable du modèle de contrôle d’accès, définit les rôles d’affaires, approuve les accès, fixe les exigences d’authentification, revoit les autorisations, tient à jour les politiques et les normes de GIA, exploite les plateformes d’identité, autorise les exceptions et est imputable lorsque des décisions d’accès créent un risque inacceptable. Sans ces éléments, la GIA se dégrade facilement en une fonction de traitement de billets dans laquelle l’accès est accordé parce que quelqu’un l’a demandé plutôt que parce qu’une autorité imputable a déterminé qu’il était nécessaire.

Trois niveaux de responsabilité

Un modèle opérationnel pratique de GIA comprend généralement trois niveaux interdépendants, qui correspondent naturellement au modèle des trois lignes présenté au chapitre 1.

- Une fonction centrale de gestion des identités et des accès, habituellement rattachée à la cybersécurité, à la sécurité des TI ou aux technologies de l’entreprise, fournit l’assise technique et procédurale. Elle conçoit l’architecture de GIA, exploite les plateformes d’identité, établit les normes techniques, met en œuvre l’authentification et la fédération, soutient les flux d’attribution des accès, gère l’accès conditionnel, intègre les applications et veille à ce que les contrôles produisent des éléments probants suffisants. Son rôle est de rendre les exigences de gouvernance applicables sur le plan technique et reproductibles sur le plan opérationnel.
- Les responsables métier déterminent quels rôles existent, quels accès ces rôles exigent légitimement, quels renseignements et quels processus sont sensibles, et qui peut approuver les accès dans chaque secteur. Les équipes technologiques peuvent administrer les autorisations, mais elles ne peuvent généralement pas juger si un employé, un contractuel ou un service en particulier a réellement besoin d’accéder à une ressource d’affaires précise. L’accès est une décision de risque d’affaires mise en œuvre au moyen de la technologie, et non une demande technique exécutée par les TI.
- La surveillance exercée par les fonctions de risque, de conformité, de protection de la vie privée et d’assurance apporte remise en question et vérification. Ces fonctions évaluent si les politiques sont appropriées, si les approbations sont justifiées, si les conflits de séparation des tâches sont traités, si les revues sont menées à terme, si les accès privilégiés sont contrôlés et si les exceptions sont documentées, le tout au regard des obligations réglementaires, des engagements contractuels et de l’appétence pour le risque de l’organisation. L’audit interne fournit ensuite une assurance indépendante que le modèle fonctionne comme prévu.
Un modèle dans lequel « les TI accordent l’accès sur demande » constitue une gouvernance insuffisante : il reflète une exécution opérationnelle dépourvue de pouvoir décisionnel, de responsabilité du risque et de surveillance indépendante. Un modèle mature sépare délibérément ces responsabilités et empêche une même fonction de demander, d’approuver, de mettre en œuvre et de valider des accès sans remise en question. Le degré de séparation devrait correspondre au risque. Les accès courants à faible risque peuvent être largement automatisés selon des politiques prédéfinies, tandis que les accès sensibles, conflictuels ou privilégiés peuvent exiger une approbation explicite, une authentification plus forte, des limites de durée, une surveillance supplémentaire ou un examen indépendant.

Points d’ancrage des politiques et exceptions

Les principaux cadres de contrôles abordés au chapitre 9 fournissent à ce modèle opérationnel ses points de référence. L’ISO/IEC 27002:2022 traite du contrôle d’accès, de la gestion des identités, des informations d’authentification et des droits d’accès (mesures 5.15 à 5.18), ainsi que des droits d’accès privilégiés (8.2) et de l’authentification sécurisée (8.5). Les CIS Controls v8.1 consacrent le Control 5 à la gestion des comptes et le Control 6 à la gestion du contrôle d’accès, et la fonction Protéger du NIST CSF 2.0 comprend la gestion des identités, l’authentification et le contrôle d’accès en tant que catégorie distincte (PR.AA). Ces références aident les gestionnaires à structurer les politiques et à en vérifier l’exhaustivité; elles ne remplacent pas les décisions sur la question de savoir qui est responsable de quels accès.

Les exceptions exigent une gouvernance tout aussi claire. Les accès temporaires, les autorisations d’urgence, les exigences d’affaires inhabituelles et les limites des systèmes patrimoniaux peuvent parfois rendre les contrôles standard difficilement applicables. De telles situations ne devraient pas être traitées de manière informelle. Chaque exception devrait avoir un responsable désigné, une justification documentée, une portée définie, des contrôles compensatoires au besoin, une date d’échéance ou de revue et une approbation à la mesure du risque. Autrement, les exceptions temporaires deviennent discrètement des sources permanentes d’accès excessifs.

L’objectif pratique est de rendre les décisions d’accès traçables, explicables et défendables. Pour chaque rôle important, système sensible, ensemble de données important ou capacité privilégiée, l’organisation devrait pouvoir dire qui est responsable de l’accès, qui peut l’approuver, pourquoi il est nécessaire, quelles conditions en encadrent l’utilisation, quelles autorisations incompatibles doivent être évitées, à quelle fréquence il est revu, comment il est révoqué et quels éléments probants démontrent que ces contrôles fonctionnent. Lorsque ces réponses sont systématiquement disponibles, la GIA dépasse l’administration des comptes et devient un système qui permet d’attribuer l’autorité numérique, de l’encadrer, de la surveiller et d’en rendre les personnes imputables.

## Cycle de vie des identités : le contrôle le plus sous-estimé

Le processus d’arrivées, de mutations et de départs (JML) sous-tend une discipline efficace en matière d’accès. Bon nombre de défaillances liées à l’identité ne découlent pas d’un manque de technologie sophistiquée. Elles découlent de quelque chose de plus fondamental : les identités et les autorisations sont créées, modifiées et supprimées de façon incohérente à mesure que les personnes et les systèmes évoluent. Un programme mature de GIA considère la gestion du cycle de vie comme un contrôle de gouvernance fondamental plutôt que comme un processus administratif des ressources humaines ou des TI. Le principe sous-jacent est simple : l’accès numérique devrait toujours refléter la réalité organisationnelle.

Arrivées

Pour les arrivées, l’objectif est d’établir l’identité de manière appropriée et d’accorder des accès alignés sur un rôle d’affaires approuvé. L’accueil des nouveaux employés ne devrait pas reposer sur des demandes informelles, sur des autorisations copiées d’un autre employé ni sur des accès par défaut étendus accordés par commodité; ces raccourcis sont pratiques, mais ils rendent impossible la démonstration que les accès sont justifiés. Un processus mature s’appuie sur des rôles définis, des profils d’accès normalisés lorsque c’est approprié, des approbations documentées et une responsabilité métier claire. L’information sur l’identité devrait provenir de sources faisant autorité, comme le système des ressources humaines ou le registre des contractuels, et les accès à risque plus élevé devraient faire l’objet d’un examen plus attentif. Le but n’est pas de réduire les accès au point d’empêcher les gens de travailler, mais de veiller à ce que chaque personne reçoive les accès nécessaires à ses responsabilités légitimes — et rien de plus.

Mutations

Pour les mutations, le principal risque est l’accumulation de privilèges. Les employés changent d’emploi, se joignent à des projets, assument des fonctions temporaires et passent d’un service à l’autre. De nouveaux accès sont accordés parce que le nouveau travail doit commencer immédiatement, tandis que les autorisations liées aux responsabilités antérieures demeurent. Au fil du temps, le compte accumule des combinaisons de pouvoirs que la direction n’a jamais approuvées explicitement, et le risque reste en grande partie invisible parce que chaque autorisation, prise individuellement, a déjà été légitime. Un changement de rôle devrait donc déclencher à la fois l’attribution et le retrait d’accès. La question de gouvernance n’est pas seulement « De quels nouveaux accès cette personne a-t-elle besoin? », mais aussi « Quels accès existants ne sont plus justifiés? » Les autorisations temporaires devraient comporter des dates d’expiration ou des points de revue, et les changements de rôle importants devraient déclencher une réévaluation des accès sensibles et privilégiés.

Départs

Pour les départs, la rapidité et l’exhaustivité sont essentielles. Dès qu’une relation d’emploi, contractuelle ou avec un fournisseur prend fin, le maintien de l’accès n’est plus justifié, et un retrait tardif des accès crée des occasions d’abus, de fraude ou de vol de données. Le degré d’urgence devrait refléter les circonstances du départ, mais les organisations devraient établir des procédures et des niveaux de service clairs plutôt que de compter sur une coordination informelle. Un processus de départ complet peut comprendre la désactivation des comptes, la révocation des sessions et des jetons actifs, le retrait des accès à distance et des accès privilégiés, la récupération des appareils et des authentificateurs, le retrait des autorisations déléguées, la suppression des accès au moyen de systèmes fédérés ou de tiers, et la rotation des secrets partagés que la personne connaissait. Les utilisateurs d’aujourd’hui disposent d’accès par de nombreuses voies — applications SaaS, plateformes infonuagiques, services d’accès à distance, comptes d’administration, environnements de développement, portails de fournisseurs et identifiants d’API —, de sorte que le retrait des accès doit viser l’ensemble des accès réels de la personne, et non seulement son compte le plus visible.

Les identités non humaines dans le cycle de vie

La discipline du cycle de vie doit aussi s’appliquer aux identités non humaines. Contrairement aux employés, les comptes de service, les identifiants d’API, les certificats et les identités de charge de travail ne démissionnent pas, ne sont pas mutés et n’apparaissent pas dans les rapports de cessation d’emploi; sans gouvernance explicite, ils persistent indéfiniment. Chaque identité non humaine importante devrait avoir un responsable et une finalité légitime, et être assortie d’exigences de rotation, d’expiration, de revue périodique et de mise hors service. Lorsqu’une application est mise hors service, qu’une relation avec un fournisseur prend fin ou qu’une intégration est remplacée, les identités et les identifiants associés devraient être revus et supprimés. Ce sujet est approfondi plus loin dans le chapitre.

Le cycle de vie comme mécanisme d’assurance

Les contrôles du cycle de vie constituent aussi un mécanisme important de conformité et d’assurance, et ils sont relativement faciles à tester. Les auditeurs peuvent examiner les approbations d’accueil, les correspondances entre rôles et accès, l’historique des modifications d’accès, les avis de cessation d’emploi, les horodatages de désactivation, les autorisations temporaires expirées et les approbations d’exceptions afin de déterminer si les politiques documentées fonctionnent dans la pratique. Les gestionnaires devraient surveiller la performance du cycle de vie plutôt que de supposer qu’elle est fiable, à l’aide d’indicateurs comme le pourcentage de départs désactivés dans le délai requis, les comptes orphelins, les accès qui persistent après un changement de rôle, les comptes de contractuels expirés encore actifs et les identités non humaines sans responsable.

La leçon managériale est simple, mais lourde de conséquences : l’accès devrait suivre l’autorité légitime tout au long de son cycle de vie. Il devrait être établi lorsqu’une relation valide commence, ajusté lorsque les responsabilités changent, revu tant qu’il est actif et retiré lorsque la relation qui le justifiait prend fin. Un processus JML bien gouverné maintient l’autorité numérique alignée sur la réalité organisationnelle, réduit les privilèges excessifs, renforce la séparation des tâches et limite les conséquences des identités compromises.

## Stratégie d’authentification : AMF, résistance à l’hameçonnage et accès conditionnel

Les gestionnaires devraient considérer l’authentification multifacteur (AMF) comme un contrôle de base pour tout accès organisationnel important, et non comme une amélioration facultative. L’authentification par mot de passe seulement procure une assurance insuffisante dans la plupart des environnements modernes, en particulier pour les services infonuagiques, le télétravail, l’information sensible, les processus financiers et les fonctions d’administration. Toutefois, l’objectif managérial n’est pas simplement d’« activer l’AMF ». Une stratégie d’authentification mature détermine le degré de confiance dont l’organisation a besoin à l’égard d’une identité selon les circonstances et choisit des contrôles proportionnés à ce risque.

Toutes les formes d’AMF ne se valent pas

L’utilisation de deux facteurs ne rend pas nécessairement l’authentification résistante à l’hameçonnage, à l’interception ou à la compromission de session. Les codes transmis par texto peuvent être exposés au moyen d’attaques visant le compte mobile de l’abonné ou le canal de communication. Les approbations par notification peuvent être détournées lorsque des attaquants génèrent des demandes répétées jusqu’à ce qu’un utilisateur en accepte une, un phénomène appelé fatigue AMF. Les mots de passe à usage unique peuvent être captés et relayés en temps réel par des sites d’hameçonnage fondés sur l’attaque de l’intercepteur. L’AMF ne devrait donc pas être traitée comme un contrôle unique et homogène. La direction devrait savoir quels mécanismes sont déployés, quelles menaces ils atténuent et où des méthodes plus fortes sont nécessaires.

Pour les accès à risque élevé, les organisations devraient privilégier l’authentification résistante à l’hameçonnage, dans laquelle c’est le protocole lui-même, plutôt que la vigilance de l’utilisateur, qui empêche un attaquant de capter et de rejouer la sortie d’un authentificateur. Les mécanismes résistants à l’hameçonnage reposent sur une cryptographie qui lie l’authentificateur au service ou à la session légitime. Mentionnons notamment les clés de sécurité et les authentificateurs de plateforme FIDO2/WebAuthn, les clés d’accès correctement mises en œuvre et les cartes à puce fondées sur une infrastructure à clés publiques (ICP). Dans sa fiche d’information de 2022 intitulée Implementing Phishing-Resistant MFA, la Cybersecurity and Infrastructure Security Agency (CISA) des États-Unis désigne les méthodes FIDO/WebAuthn et celles fondées sur une ICP comme les formes qui résistent à l’hameçonnage. Au Canada, la Ligne directrice du gouvernement du Canada (GC) sur l’authentification multifactorielle (AMF) (2025) du Secrétariat du Conseil du Trésor du Canada considère elle aussi les mots de passe, les codes à usage unique et les approbations par notification comme non résistants à l’hameçonnage, et exige que les utilisateurs fédéraux hautement privilégiés emploient au moins un authentificateur résistant à l’hameçonnage. Ces méthodes importent surtout pour les identités dont les conséquences sont considérables : les administrateurs privilégiés et les administrateurs des identités, les comptes de gestion infonuagique, le personnel de sécurité, les approbateurs financiers, les utilisateurs disposant d’un accès à la production et ceux qui accèdent à de l’information hautement sensible. La force de l’authentification devrait augmenter à mesure que s’accroissent les conséquences potentielles d’une compromission d’identité.

Niveaux d’assurance et NIST SP 800-63-4

Les gestionnaires peuvent utiliser les Digital Identity Guidelines du NIST, SP 800-63-4, finalisées en juillet 2025 avec leurs volumes complémentaires SP 800-63A-4, 63B-4 et 63C-4, comme référence pour structurer ces décisions. Le modèle du NIST distingue trois problèmes d’assurance connexes.

- La vérification d’identité concerne le degré de confiance avec lequel une organisation établit, au moment de l’inscription, qu’une personne est bien l’individu réel qu’elle prétend être.
- L’authentification concerne le degré de confiance quant au fait que la personne qui utilise une identité numérique contrôle les authentificateurs qui y sont liés.
- La fédération concerne les mécanismes qui permettent de faire confiance à l’information sur l’identité et aux résultats d’authentification d’un système, d’une partie utilisatrice et d’un fournisseur d’identité à l’autre.
Ces distinctions sont importantes, car une authentification forte ne peut compenser une vérification d’identité faible, et une vérification d’identité forte ne peut compenser une authentification faible par la suite. Fédérer une identité étend la confiance à d’autres systèmes et exige donc une gouvernance du fournisseur d’identité, des assertions et des relations qui transmettent cette confiance.

Lorsque la vérification d’identité ou l’authentification repose sur la biométrie, le droit relatif à la protection des renseignements personnels ajoute ses propres conditions. Au Québec, les renseignements biométriques sont des renseignements personnels sensibles; leur utilisation pour vérifier ou confirmer l’identité exige le consentement exprès de la personne en vertu de la Loi concernant le cadre juridique des technologies de l’information, et toute banque de caractéristiques biométriques doit être divulguée à la Commission d’accès à l’information du Québec au moins 60 jours avant sa mise en service. La commodité justifie rarement à elle seule le recours à la biométrie; les gestionnaires devraient donc s’attendre à une évaluation des facteurs relatifs à la vie privée (EFVP) et à une démonstration documentée de la nécessité avant d’approuver une telle conception (voir le chapitre 16).

Le NIST exprime les exigences d’authentification sous forme de niveaux d’assurance de l’authentification (AAL). La valeur managériale tient moins à la terminologie qu’au principe selon lequel des situations différentes justifient des niveaux d’assurance différents. La révision 4 rend les attentes concrètes : au niveau AAL2, les vérificateurs doivent offrir au moins une option résistante à l’hameçonnage, et au niveau AAL3, un authentificateur résistant à l’hameçonnage et non exportable est exigé. La révision reconnaît aussi les authentificateurs synchronisables, comme les clés d’accès synchronisées, comme acceptables au niveau AAL2, mais non au niveau AAL3, une distinction utile pour les organisations qui doivent décider où les clés d’accès de type grand public suffisent et où des clés liées au matériel sont nécessaires. Les exigences d’authentification devraient donc être choisies en fonction du rôle, de la sensibilité de la ressource, de l’exposition aux menaces et des conséquences d’affaires potentielles, plutôt qu’au moyen d’une politique unique appliquée partout.

Accès conditionnel et adaptatif

La stratégie d’authentification devrait aller au-delà de la connexion initiale. Un utilisateur qui s’est authentifié au début d’une session n’est pas digne de confiance indéfiniment : des appareils peuvent être compromis, des jetons volés, des sessions détournées, et les conditions de risque peuvent changer. Les organisations matures complètent donc l’authentification par l’accès conditionnel, qui applique des politiques prédéfinies pour décider si l’accès devrait être accordé et à quelles conditions. Les décisions peuvent tenir compte du rôle de l’identité, de la force de l’authentification, de la posture de l’appareil, du contexte réseau et géographique, du risque lié à la session, des comportements inhabituels, des indicateurs de menace et de la sensibilité de la ressource.

L’accès courant à une application peu sensible à partir d’un appareil géré peut n’exiger que peu de friction. Le même utilisateur qui accède à de l’information sensible à partir d’un appareil non géré peut être tenu d’utiliser une authentification plus forte ou être empêché de télécharger des données. Un administrateur qui accède à un environnement de gestion infonuagique dans des conditions inhabituelles peut être tenu de s’authentifier de nouveau à l’aide d’une méthode résistante à l’hameçonnage à partir d’un appareil conforme. Selon les circonstances, une politique peut restreindre la session, en réduire la durée, forcer une nouvelle authentification, bloquer complètement l’accès ou générer un événement aux fins d’enquête.

Cette approche reflète les principes de vérification systématique décrits dans la publication NIST SP 800-207, Zero Trust Architecture (2020), et pertinents pour l’architecture de sécurité abordée au chapitre 13. La confiance n’est pas héritée de l’emplacement réseau ni d’une seule connexion réussie; elle est conditionnelle et réévaluée en continu au regard de l’identité, de l’appareil, du contexte et de la ressource demandée. L’accès conditionnel relie aussi l’appétence pour le risque à l’application opérationnelle. La gouvernance peut décider, par exemple, que l’administration privilégiée ne doit jamais s’effectuer à partir d’appareils non gérés ou que certaines informations ne peuvent pas être consultées dans des contextes précis; les règles d’accès conditionnel transforment ces décisions en comportements techniques reproductibles.

Proportionnalité, niveaux et récupération

La proportionnalité demeure essentielle. Une authentification plus forte procure une plus grande assurance, mais elle impose des coûts et de la friction; une friction excessive incite à des contournements risqués et submerge les équipes de soutien, tandis que des contrôles conçus pour la commodité laissent exposés les accès aux conséquences graves. La gouvernance devrait donc établir des niveaux d’authentification explicites : des exigences minimales définies pour les accès courants, une assurance plus forte pour les accès sensibles et la protection la plus élevée pour les accès privilégiés, administratifs et essentiels à la mission. Ces niveaux devraient être documentés et appliqués de façon cohérente plutôt que laissés à la discrétion de chaque responsable de système.

La stratégie doit aussi traiter la récupération de l’authentification, car les processus de récupération peuvent devenir des voies de contournement des contrôles forts. Une organisation peut déployer une authentification résistante à l’hameçonnage et demeurer vulnérable si un attaquant peut persuader le centre d’assistance de réinitialiser un compte au moyen d’une vérification d’identité faible. Les processus relatifs aux authentificateurs perdus, à la récupération de compte et à la réinitialisation des identifiants devraient procurer une assurance proportionnée aux accès qu’ils rétablissent. La récupération ne devrait jamais devenir la voie la plus faible vers une identité fortement protégée.

La gouvernance de l’authentification devrait donc couvrir les exigences minimales, les niveaux d’assurance plus élevés, les types d’authentificateurs approuvés, les politiques d’accès conditionnel, les procédures de récupération, les exceptions, la surveillance, la formation des utilisateurs et la réévaluation périodique à mesure que les menaces, les technologies et la réglementation évoluent. L’authentification ne prouve pas qu’un acteur se comportera de manière appropriée et ne garantit pas qu’une identité n’a pas été compromise. Son rôle est de fournir un niveau de confiance défendable quant au fait que l’acteur qui utilise une identité a le droit de le faire — d’aligner la confiance sur les conséquences.

## Modèles d’autorisation : ingénierie des rôles, RBAC/ABAC et revues des accès

L’autorisation est la logique décisionnelle qui détermine ce qu’une identité authentifiée peut faire. L’authentification répond à la question : « Cet acteur est-il bien la personne ou la chose qu’il prétend être? » L’autorisation répond à la question suivante : « Compte tenu de cette identité, à quels ressources, fonctions, opérations et données peut-elle accéder? » Une authentification forte ne détermine pas si une identité devrait pouvoir consulter un ensemble de données, approuver un paiement, administrer un serveur ou modifier les autorisations d’un autre utilisateur. Une organisation peut disposer d’une AMF robuste et avoir néanmoins un contrôle d’accès faible si les utilisateurs authentifiés détiennent des autorisations excessives.

Bien des organisations confondent la présence de rôles et d’autorisations avec une gouvernance efficace de l’autorisation. Une application peut comporter des rôles, des groupes, des profils et des droits d’accès, mais leur seule présence ne prouve pas que le modèle d’accès est cohérent, à jour, fondé sur les risques ou aligné sur les responsabilités réelles. L’autorisation ne devient gouvernable que lorsque l’organisation peut expliquer pourquoi des autorisations précises existent, qui devrait les recevoir, qui est responsable de la décision, quels risques elles créent et comment on vérifie qu’elles demeurent appropriées.

Ingénierie des rôles : traduire les responsabilités d’affaires en accès

L’ingénierie des rôles est la discipline qui consiste à concevoir et à tenir à jour des rôles qui reflètent des responsabilités organisationnelles légitimes, et à associer à ces rôles les droits d’accès nécessaires. Sans elle, le principe du moindre privilège devient très difficile à maintenir à grande échelle : les accès sont accordés utilisateur par utilisateur en réponse à des demandes individuelles, les exceptions s’accumulent, les autorisations héritées deviennent opaques, les accès temporaires deviennent permanents et les gestionnaires perdent la capacité d’expliquer pourquoi des identités détiennent des privilèges particuliers.

Un modèle mature part des responsabilités d’affaires plutôt que des autorisations des systèmes. L’organisation détermine d’abord ce qu’une personne ou un système doit accomplir, puis elle définit les droits d’accès minimaux requis. Les gestionnaires d’affaires savent quelles responsabilités relèvent de quels postes et quelles combinaisons de pouvoirs seraient inappropriées; la cybersécurité et les TI comprennent les dépendances techniques, les relations entre privilèges et l’exposition aux menaces. Une conception efficace des rôles intègre ces deux perspectives. Les rôles doivent aussi être traités comme des objets de gouvernance vivants, et non comme des configurations statiques. Les processus changent, les applications sont remplacées, les organisations se restructurent et l’automatisation modifie les fonctions des postes; les rôles importants ont donc besoin de responsables, de revues périodiques des droits d’accès et de procédures de modification et de mise hors service. La figure ci-dessous compare les principaux modèles d’autorisation.

Figure 51 : modèles d’autorisation

Contrôle d’accès fondé sur les rôles

Le contrôle d’accès fondé sur les rôles (RBAC) attribue des autorisations à des rôles définis, puis associe des identités à ces rôles. Plutôt que de décider individuellement si chaque employé devrait détenir des dizaines d’autorisations, l’organisation définit des rôles comme commis aux comptes fournisseurs, conseiller en ressources humaines, administrateur de bases de données ou analyste en sécurité, chacun assorti d’un ensemble d’autorisations approuvé. Le RBAC peut normaliser l’attribution des accès, simplifier l’accueil des nouveaux employés et les changements de rôle, réduire les attributions arbitraires, soutenir la séparation des tâches et rendre les revues des accès plus faciles à comprendre. Il fonctionne le mieux lorsque des groupes de personnes exercent des fonctions stables et clairement définies.

Le RBAC n’est efficace que dans la mesure où les rôles sur lesquels il repose le sont. Des rôles mal conçus deviennent de vastes ensembles qui institutionnalisent des accès excessifs. À l’inverse, la création de rôles toujours plus spécialisés pour tenir compte des exceptions mène à l’explosion des rôles, situation dans laquelle des centaines, voire des milliers de rôles faiblement différenciés deviennent presque aussi difficiles à gouverner que des autorisations individuelles. Les rôles devraient demeurer significatifs, compréhensibles, assortis d’un responsable et liés à des responsabilités d’affaires identifiables.

Contrôle d’accès fondé sur les attributs

Des environnements plus dynamiques peuvent exiger un contrôle d’accès fondé sur les attributs (ABAC), qui utilise des attributs de l’identité, de la ressource, de l’action et du contexte pour décider si l’accès est permis. Les attributs pertinents peuvent comprendre le service, le statut d’emploi, l’emplacement, l’état de l’appareil, la classification des données, l’appartenance à un projet, la valeur de l’opération, le moment, la force de l’authentification ou les indicateurs de risque actuels. Une organisation pourrait permettre à un service de consulter une catégorie d’information uniquement à partir d’appareils gérés et seulement tant que le statut d’emploi est actif, ou exiger une fonction précise, une authentification plus forte et une approbation supplémentaire pour les opérations dépassant un seuil. L’ABAC permet des décisions précises et sensibles au contexte, particulièrement dans les architectures infonuagiques, centrées sur les données et à vérification systématique.

Une plus grande souplesse accroît toutefois la complexité de la gouvernance. Les attributs qui se chevauchent et les politiques conditionnelles peuvent être difficiles à prévoir, à tester et à auditer, et de petits changements peuvent avoir des effets inattendus sur les accès. L’objectif managérial n’est pas de choisir le modèle le plus sophistiqué, mais un modèle qui demeure approprié, explicable, applicable, testable et auditable. Une complexité que les personnes imputables du risque qui en découle ne peuvent pas comprendre constitue en soi un problème de gouvernance. Dans la pratique, de nombreuses organisations combinent les deux : les rôles établissent une base, et les attributs restreignent la manière, le moment et l’endroit où ces autorisations peuvent être exercées.

L’autorisation est aussi le principal mécanisme d’application de la séparation des tâches. La gouvernance doit examiner non seulement si chaque autorisation est légitime, mais aussi si la combinaison des autorisations détenues par une même identité produit une autorité inappropriée. C’est l’objet de la section suivante.

Revues des accès : vérifier que l’autorisation demeure appropriée

Les revues des accès permettent à l’organisation de réévaluer périodiquement si les autorisations approuvées antérieurement demeurent justifiées, puisque des décisions légitimes deviennent inappropriées à mesure que les rôles, les systèmes et les risques changent. Dans la pratique, les revues sont souvent faibles. Les gestionnaires reçoivent de longues listes d’utilisateurs et de noms techniques de droits d’accès et on leur demande de les approuver. Ils peuvent ne pas comprendre ce que l’accès permet, pourquoi il a été accordé ni s’il a été utilisé. Devant l’incertitude et le volume, beaucoup se contentent d’approuver. L’organisation peut alors démontrer qu’une revue a eu lieu, mais cette revue procure peu d’assurance. Cela illustre un écart dangereux entre l’exécution d’un contrôle et son efficacité : une recertification menée à terme prouve qu’un processus a été exécuté, et non que le risque lié aux accès a été évalué avec compétence.

Une revue digne d’une saine gouvernance fournit aux réviseurs une information utile à la décision : ce que l’accès permet, pourquoi il a été accordé, quel rôle le justifie, quand il a été utilisé pour la dernière fois, si l’utilisateur exerce toujours la fonction, s’il s’agit d’un accès privilégié ou sensible et s’il entre en conflit avec d’autres autorisations. Les revues devraient aussi être fondées sur les risques. Les accès privilégiés et administratifs, les approbations financières, les données réglementées ou sensibles, les systèmes de production, la gestion infonuagique, les identités externes, les comptes inactifs, les identités non humaines et les autorisations incompatibles justifient des revues plus fréquentes, des éléments probants plus solides ou une validation indépendante, comparativement aux accès courants.

La valeur d’une revue dépend en fin de compte de ce qui suit. Le retrait des autorisations excessives, la résolution des conflits, la désactivation des comptes inactifs, la correction de l’attribution des responsables, la mise à jour des définitions de rôles et la documentation des exceptions justifiées font partie intégrante du contrôle. Une revue qui relève des accès inappropriés sans mener à leur retrait, à des mesures correctives ou à une acceptation du risque formellement autorisée offre peu de protection. La gouvernance devrait donc suivre la résolution des constatations dans les délais, et non seulement l’achèvement des revues; des organisations peuvent atteindre des taux d’achèvement élevés tout en conservant d’importants accès excessifs.

L’autorisation comme gouvernance continue

L’autorisation n’est pas un exercice de configuration ponctuel. Les rôles évoluent, les utilisateurs changent de poste, les systèmes se transforment et les conditions de risque se modifient; une décision appropriée au moment de l’approbation ne le demeure donc pas indéfiniment. Les rôles doivent être délibérément conçus et tenus à jour, les droits d’accès doivent avoir une finalité et un responsable clairs, les autorisations incompatibles doivent être contrôlées, les exceptions doivent être limitées et les revues doivent fournir aux décideurs imputables une information significative qui mène à l’action. C’est par l’autorisation que le principe du moindre privilège, la séparation des tâches, la protection de la vie privée et la prévention de la fraude deviennent applicables sur le plan technique. L’authentification établit la confiance envers l’acteur; l’autorisation détermine l’étendue de l’autorité organisationnelle que cette identité peut exercer.

## Séparation des tâches : la GIA au service de la prévention de la fraude et de l’assurance des contrôles

La séparation des tâches est l’un des points où la gouvernance de la cybersécurité recoupe le plus clairement le contrôle financier, l’audit interne, la conformité et la prévention de la fraude. Dans de nombreux processus à fort impact, le risque n’est pas seulement qu’un attaquant externe compromette un système, mais qu’une seule personne — ou une seule identité compromise — puisse lancer, approuver, exécuter, dissimuler ou annuler une action lourde de conséquences sans surveillance indépendante. Cela importe pour les paiements, l’approvisionnement, la paie, la gestion des fournisseurs, l’information financière, l’administration des identités, la configuration de la sécurité, l’administration infonuagique et le contrôle des changements en production. La séparation des tâches n’est donc pas seulement un principe comptable; c’est un contrôle de cybersécurité, car elle limite la concentration de l’autorité numérique.

Combinaisons de droits incompatibles

Le principe sous-jacent est qu’aucune identité individuelle ne devrait détenir des autorisations lui permettant de mener un processus à risque élevé du début à la fin sans remise en question significative. Des autorisations individuelles peuvent chacune être légitimes, mais devenir dangereuses lorsqu’elles sont réunies; on parle souvent dans ce cas de combinaisons de droits incompatibles. Une personne qui crée un nouveau fournisseur ne devrait pas, en temps normal, aussi approuver ce fournisseur, lancer des paiements à son intention et rapprocher ces paiements. Un développeur ne devrait pas pouvoir approuver et déployer son propre changement en production. Un administrateur des identités peut créer des comptes, mais ne devrait pas approuver ses propres accès privilégiés. La même logique s’applique à l’administration de la sécurité : un administrateur qui peut créer des identités privilégiées, attribuer des autorisations élevées, désactiver la surveillance, modifier les journaux d’audit et examiner les éléments probants qui en résultent détient une autorité excessive. Si cette identité fait l’objet d’un usage abusif ou est compromise, l’accès qui permet l’action préjudiciable peut aussi permettre de la dissimuler.

Application préventive et par détection

La GIA doit rendre les exigences de séparation des tâches applicables dans la pratique. Il faut pour cela relever les rôles et les autorisations incompatibles, définir des règles de conflit, empêcher les combinaisons inappropriées lorsque c’est possible, détecter les violations et établir des processus d’exception contrôlés. Dans les organisations matures, les demandes d’accès sont évaluées au regard des règles de conflit avant l’octroi des autorisations, et les conflits potentiels font l’objet d’une remontée plutôt que d’être découverts des mois plus tard lors d’un audit. Ces contrôles devraient être à la fois préventifs et de détection. Les contrôles préventifs empêchent l’attribution d’accès incompatibles; les contrôles de détection repèrent les conflits qui apparaissent par la suite parce que des rôles ont changé, que des autorisations se sont accumulées, que des applications ont été modifiées ou qu’un accès d’urgence a été accordé. Les revues des accès devraient donc examiner les combinaisons d’autorisations, en particulier pour les utilisateurs privilégiés, les processus financiers, les systèmes de production et les identités qui s’étendent à plusieurs applications.

Double contrôle et contrôles compensatoires

Lorsqu’une séparation complète n’est pas réalisable — dans les petites organisations, au sein d’équipes techniques spécialisées, en situation d’urgence ou pour l’administration privilégiée —, le double contrôle, une approbation supplémentaire, une surveillance accrue ou d’autres contrôles compensatoires peuvent être nécessaires. Le double contrôle exige la participation de plus d’une personne autorisée à une action à fort impact : un administrateur prépare un changement critique tandis qu’un autre l’approuve ou l’exécute, ou encore les opérations dépassant un seuil exigent deux approbateurs. Les contrôles compensatoires n’éliminent pas le conflit; ils en réduisent ou en surveillent le risque. Ils devraient donc être gouvernés comme toute autre exception, en documentant la raison d’être du conflit, la personne responsable du risque qui en découle, les mesures de protection qui s’appliquent et le moment où l’arrangement sera réévalué.

Fraude, rayon d’impact et assurance

La séparation des tâches se rattache aussi au triangle de la fraude présenté au chapitre 1. Des trois conditions associées à la fraude, l’occasion est celle que les contrôles peuvent réduire le plus directement, et ce sont les accès excessifs, une surveillance faible et la concentration de l’autorité qui la créent. La séparation des tâches réduit cette occasion en exigeant une collaboration, une approbation indépendante ou une exécution distincte des activités sensibles. Le même mécanisme freine les attaquants externes. Un compte qui peut lancer une opération sans pouvoir l’approuver, ou administrer un système sans pouvoir en désactiver la surveillance, offre beaucoup moins à un adversaire qu’un compte doté d’une autorité de bout en bout. La séparation des tâches limite ainsi le rayon d’impact d’une compromission d’identité.

Pour les gestionnaires, la séparation des tâches procure également de l’assurance. Un environnement de contrôle est plus crédible lorsque les actions à risque élevé exigent des points de décision identifiables, une participation indépendante et des éléments probants d’approbation. Les organisations devraient pouvoir relever les conflits importants de séparation des tâches, expliquer quels rôles les créent, démontrer comment ils sont prévenus ou détectés et montrer comment les exceptions approuvées sont surveillées et réévaluées. La leçon managériale est que les droits d’accès doivent être évalués collectivement, et non un droit à la fois, et que les programmes de GIA et de GAP doivent rendre la séparation des tâches visible, applicable, examinable et vérifiable.

## Gouvernance des accès des tiers et des partenaires : le problème de l’identité étendue

Les organisations dépendent de plus en plus de contractuels, de fournisseurs de services gérés, de consultants en infonuagique, d’éditeurs de logiciels, de partenaires d’impartition, d’auditeurs, de partenaires de mise en œuvre et d’intégrations interentreprises. Ces relations créent des dépendances en matière d’identité qui sont essentielles aux opérations modernes, mais elles sont souvent plus difficiles à gouverner que les accès des employés. Le compte d’un fournisseur doté d’accès privilégiés de longue date peut constituer une voie d’accès involontaire aux systèmes critiques. Un contractuel dont l’accès demeure actif après la fin d’un mandat représente une défaillance prévisible du cycle de vie. Une intégration de partenaire dotée d’autorisations plus étendues que nécessaire peut exposer des données ou une infrastructure au-delà de la finalité prévue. Les identités externes peuvent atteindre des consoles infonuagiques, des dépôts de code source, des renseignements sur les clients, des plateformes financières, des outils d’accès à distance et des interfaces d’administration, parfois alors qu’elles font l’objet d’un accueil moins rigoureux, de revues moins fréquentes et d’une responsabilité interne floue. L’identité des tiers est donc un enjeu de risque d’entreprise et de gouvernance, et non une tâche secondaire de gestion des accès. La gouvernance plus large des fournisseurs fait l’objet du chapitre 19; la présente section porte sur la dimension identitaire.

Les accès externes doivent avoir un responsable interne

Le principe fondamental est que les accès externes doivent relever d’un responsable interne. Chaque compte de tiers, identité fédérée ou intégration importante devrait avoir un parrain interne identifiable, imputable de la justification d’affaires, de la portée de l’accès, de la sensibilité des ressources concernées, de la durée de la relation et de la confirmation périodique que l’accès demeure nécessaire. Sans responsabilité explicite, les accès persistent après la fin des projets, les changements de personnel ou l’expiration des contrats, simplement parce que personne n’est chargé de les retirer.

Les accès des tiers devraient donc être propres à une finalité et limités dans le temps chaque fois que c’est possible. L’accès devrait être accordé pour une finalité et une période définies, et son renouvellement devrait exiger la confirmation que le besoin persiste. Les dates des contrats, les périodes visées par les énoncés des travaux, les changements dans le personnel des fournisseurs et la fin des relations avec les fournisseurs devraient être liés aux contrôles du cycle de vie des identités, et des dates d’expiration devraient être intégrées à l’attribution des accès lorsque c’est techniquement possible. Des accès externes de longue durée peuvent parfois être justifiés, mais ils devraient être gouvernés délibérément plutôt que tenus pour acquis.

Moindre privilège et GAP pour les fournisseurs

Le principe du moindre privilège s’applique aux tiers avec la même rigueur qu’aux employés. Des autorisations étendues d’administrateur ne devraient pas être accordées simplement parce qu’elles facilitent le soutien. Lorsqu’un fournisseur a besoin d’accès privilégiés, l’organisation devrait appliquer des contrôles de GAP identiques ou plus stricts que ceux qu’elle utilise pour ses administrateurs internes : identités d’administration distinctes, élévation juste-à-temps, flux d’approbation, authentification résistante à l’hameçonnage, mise en coffre-fort des identifiants, voies d’administration restreintes, durée de session limitée et surveillance ou enregistrement des sessions. C’est particulièrement important dans le cas des fournisseurs de services gérés dont le personnel peut administrer l’infrastructure de nombreux clients. L’organisation devrait savoir si les accès sont attribués à des personnes nommément désignées, comment le fournisseur gère ses propres identités privilégiées, s’il existe des comptes partagés et à quelle vitesse les accès peuvent être révoqués lorsque le personnel du fournisseur change.

La surveillance devrait être proportionnée au risque que présente la relation. Les accès externes aux environnements de production, à l’administration infonuagique, aux plateformes d’identité, aux outils de sécurité, aux sauvegardes, aux applications financières ou aux systèmes opérationnels critiques ne devraient jamais échapper aux processus de surveillance et d’assurance de l’organisation. La direction devrait pouvoir déterminer non seulement qu’un fournisseur avait accès, mais aussi quand cet accès a été utilisé et quelles actions importantes ont été effectuées.

Fédération, intégrations et contrats

La gouvernance des tiers doit également couvrir les accès fédérés et les accès de machine à machine. Les partenaires peuvent s’authentifier au moyen de leurs propres fournisseurs d’identité, et les applications peuvent échanger des données à l’aide d’identifiants d’API, de jetons, de certificats ou de principaux de service. Ces arrangements réduisent l’effort administratif, mais ils créent des dépendances envers des contrôles externes. La fédération n’élimine pas la gouvernance : l’organisation doit comprendre à quels attributs et à quelles assertions elle se fie, ce qui se passe lorsqu’un employé du partenaire part, comment l’accès est révoqué et quelle assurance elle a que les processus d’identité du partenaire demeurent fiables.

La gouvernance des identités doit donc être intégrée à l’approvisionnement, à la passation des contrats, à la gestion du risque lié aux tiers et à la fin des relations avec les fournisseurs, et les conditions d’accès devraient être évaluées avant qu’un fournisseur obtienne une connectivité. Les contrats devraient, le cas échéant, fixer des attentes concernant l’authentification, les accès privilégiés, la journalisation, l’avis en temps opportun des changements de personnel, l’avis d’incident, la cessation des accès, les sous-traitants et la collaboration aux audits. Les contrôles d’identité ne peuvent pas compenser indéfiniment des arrangements commerciaux faibles : si un fournisseur n’est pas tenu de signaler les changements dans son personnel privilégié, l’organisation peut ignorer à quel moment l’accès devrait être révoqué. La fin d’une relation devrait déclencher une revue coordonnée de l’ensemble des comptes, des identités fédérées, des rôles d’administration, des autorisations d’accès à distance, des identifiants d’API, des certificats, des jetons et des secrets partagés qui y sont associés; la désactivation d’un seul compte suffit rarement.

Le principe de gouvernance essentiel est le suivant.

Déléguer un accès ne transfère pas l’imputabilité. L’identité peut appartenir à une personne extérieure à l’organisation, mais les droits d’accès s’inscrivent dans le périmètre de risque de l’organisation.

L’impartition d’une activité peut transférer la responsabilité opérationnelle, mais elle n’élimine pas le besoin de gouvernance, de surveillance, d’éléments probants et de responsabilité du risque. Les identités des tiers, les accès privilégiés des fournisseurs, la confiance fédérée et les intégrations de machine à machine devraient donc être intégrés aux processus de GIA, de GAP, de surveillance et de gestion des risques de l’organisation plutôt que gérés comme des exceptions en marge de ceux-ci.

## GAP : des contrôles « joyaux de la couronne » que les gestionnaires doivent exiger

L’accès privilégié diffère qualitativement de l’accès ordinaire. L’accès ordinaire permet aux utilisateurs et aux systèmes d’effectuer un travail approuvé à l’intérieur de limites établies. L’accès privilégié permet aux utilisateurs, aux administrateurs, aux services et aux outils d’automatisation de modifier ces limites : créer ou désactiver des comptes, attribuer des autorisations, modifier des paramètres de sécurité, accéder à des données à grande échelle, altérer ou supprimer des journaux, gérer des clés de chiffrement, déployer des logiciels et interrompre des opérations. Les gestionnaires devraient tenir pour acquis que les identités privilégiées et les voies d’administration seront ciblées. L’objectif de gouvernance n’est pas de supposer qu’une compromission privilégiée peut toujours être évitée, mais de faire en sorte que le privilège soit difficile à obtenir, étroitement encadré lorsqu’il est accordé, observable pendant son utilisation et rapidement révocable.

La GAP est donc un domaine de contrôle qui fait partie des joyaux de la couronne (actifs critiques), et non une amélioration facultative destinée aux équipes techniques. Un pare-feu, une plateforme de protection des terminaux, un système de sauvegarde, une plateforme de journalisation, un fournisseur d’identité ou une infrastructure de chiffrement n’est digne de confiance que dans la mesure où l’est le modèle d’accès privilégié qui sécurise son administration. Un attaquant qui obtient une autorité administrative suffisante peut être en mesure de désactiver les contrôles mêmes qui sont destinés à le détecter ou à le contenir.

Séparer les identités privilégiées des identités ordinaires

Une conception de base de la GAP commence par une séparation nette entre l’activité ordinaire et l’administration privilégiée. Les administrateurs ne devraient pas naviguer sur le Web, lire leurs courriels ni ouvrir des messages de collaboration au moyen d’identités qui détiennent aussi une autorité administrative. Une identité privilégiée distincte, utilisée uniquement lorsque l’autorité administrative est requise, fait en sorte que la compromission de l’activité courante ne procure pas immédiatement un accès privilégié. Cette séparation est plus qu’une convention d’appellation : elle crée des frontières de confiance distinctes et permet d’imposer aux identités d’administration une authentification, une surveillance et des restrictions plus fortes que ce qui serait réaliste pour l’usage quotidien.

Réduire les privilèges permanents

Une GAP mature cherche à réduire au minimum les privilèges permanents. Les utilisateurs ne devraient pas détenir une autorité administrative permanente simplement parce qu’ils en ont besoin à l’occasion; plus le privilège demeure disponible longtemps, plus la fenêtre d’abus est grande. L’accès juste-à-temps (JIT) est le modèle clé : un utilisateur travaille avec des autorisations ordinaires, demande une élévation au besoin, la reçoit pour une finalité approuvée et la perd automatiquement à la fin de la tâche ou de la plage de temps. Le principe connexe du privilège juste suffisant n’accorde que les capacités nécessaires à la tâche précise. Ensemble, ces pratiques réduisent le nombre d’identités privilégiées en permanence, raccourcissent la période pendant laquelle l’autorité peut être exploitée et diminuent la valeur des identifiants volés.

Protéger les identifiants et les secrets privilégiés

La mise en coffre-fort des identifiants et la gestion des secrets sont des capacités centrales de la GAP. Les mots de passe privilégiés, les identifiants d’administrateur local, les mots de passe des comptes de service, les clés d’API, les certificats et les jetons ne devraient pas être conservés dans des tableurs, des scripts, des dossiers partagés, des dépôts de code source, des notes personnelles ou des fichiers de configuration non sécurisés. Ils devraient être conservés dans des systèmes contrôlés qui appliquent des restrictions d’accès et, le cas échéant, la rotation, l’expiration, l’approbation et la journalisation. Dans une conception mature, les utilisateurs peuvent accéder à une fonction privilégiée sans jamais voir le secret sous-jacent : la plateforme de GAP sert d’intermédiaire pour la session, injecte les identifiants, en effectue la rotation après usage ou émet des secrets temporaires qui expirent. Le principe est que l’autorité privilégiée devrait être gouvernée indépendamment de la possession d’un identifiant réutilisable. Le volet cryptographique de ce problème — les clés, les certificats et leur garde — est traité au chapitre 20.

Surveiller les sessions et les actions privilégiées

La gestion des sessions privilégiées renforce l’imputabilité. Les sessions d’administration à risque élevé peuvent passer par un intermédiaire, être surveillées ou être enregistrées lorsque le risque le justifie, non pas pour le plaisir de surveiller, mais pour créer des éléments probants fiables, dissuader les abus et appuyer les enquêtes. La surveillance devrait permettre d’établir quelle personne ou quel processus a lancé l’activité, pourquoi elle a été approuvée, à quelles ressources on a accédé, quelles actions importantes ont été effectuées et quand le privilège a pris fin. Les comptes d’administration partagés posent un problème particulier, car les journaux montrent ce que le compte a fait, mais non qui l’a fait. Lorsqu’on ne peut pas les éliminer, la GAP devrait associer chaque utilisation à une personne nommément désignée, à un dossier d’approbation, à une session et à une finalité d’affaires. L’activité privilégiée devrait toujours pouvoir être attribuée à une personne imputable ou à un processus non humain clairement gouverné.

Contrôler les voies d’administration

La GAP doit aussi encadrer l’origine possible des actions privilégiées et la façon dont les sessions atteignent les systèmes sensibles. Des contrôles rigoureux des identifiants peuvent être minés si l’administration est permise à partir de postes de travail ordinaires, d’appareils non gérés ou de services d’accès à distance non sécurisés. Les conceptions matures restreignent les voies d’administration au moyen de postes de travail d’accès privilégié durcis, d’environnements de gestion dédiés, de réseaux d’administration segmentés, d’exigences de conformité des appareils, de l’accès conditionnel, de l’authentification résistante à l’hameçonnage et de l’intermédiation des sessions. L’accès privilégié devrait exiger non seulement une identité privilégiée, mais aussi une voie d’administration de confiance, afin qu’un logiciel malveillant sur un terminal courant ou une session de navigateur volée ne devienne pas une route vers les systèmes d’administration.

Privilèges non humains et accès d’urgence

La GAP doit aussi englober les identités non humaines. Les comptes de service, les chaînes de déploiement, les rôles infonuagiques et les identités de charge de travail peuvent détenir des autorisations d’administration même si aucune personne ne s’y connecte, et ils sont souvent de longue durée, difficiles à soumettre à la rotation et dotés d’autorisations excessives parce que les équipes craignent de perturber des processus automatisés. L’objectif est d’éviter que des administrateurs humains étroitement gouvernés côtoient de puissantes identités machines qui demeurent pratiquement invisibles; ce sujet est développé dans sa propre section ci-dessous. La GAP doit de même prévoir un accès d’urgence (« bris de glace ») lorsque les systèmes d’identité normaux tombent en panne, sans créer de contournement permanent caché — l’objet de la section suivante.

La GAP comme mécanisme de gouvernance et d’assurance

Les gestionnaires devraient pouvoir obtenir des réponses crédibles à un petit nombre de questions : Qui détient une autorité privilégiée, et sur quels systèmes et quelles données? Pourquoi est-elle nécessaire, et est-elle permanente ou temporaire? Qui l’a approuvée, et par quelles voies peut-elle être exercée? Comment les secrets privilégiés sont-ils protégés et les activités importantes surveillées? Quand l’accès privilégié a-t-il été revu pour la dernière fois, et à quelle vitesse peut-il être révoqué? Ces questions font passer la GAP au-delà du déploiement d’un produit. Une organisation peut posséder une plateforme de GAP et avoir néanmoins une gouvernance de la GAP faible si des comptes d’administrateur la contournent, si des comptes de service demeurent non gérés, si des mots de passe sont partagés de façon informelle, si des rôles infonuagiques permanents prolifèrent ou si les enregistrements de session ne sont jamais examinés.

La leçon managériale est que l’autorité privilégiée doit être réduite au minimum, justifiée, séparée, limitée dans le temps lorsque c’est possible, fortement authentifiée, exercée par des voies contrôlées, surveillée, attribuable et étayée par des éléments probants. La GAP n’est pas seulement un mécanisme de protection des mots de passe d’administrateur; c’est une mesure de protection de gouvernance conçue pour empêcher une compromission ordinaire de devenir catastrophique.

## Comptes « bris de glace » : un accès d’urgence sans faiblesse permanente

L’accès d’urgence, communément appelé accès « bris de glace », est nécessaire parce que les voies normales d’identité et d’administration peuvent tomber en panne. Les fournisseurs d’identité peuvent devenir indisponibles, la fédération peut être perturbée, les administrateurs peuvent se retrouver bloqués ou un rétablissement urgent peut s’imposer pendant un incident. Une organisation bien gouvernée doit préserver la capacité de reprendre le contrôle des systèmes critiques lorsque les mécanismes ordinaires ne sont pas disponibles — une exigence de résilience directement liée à la planification des incidents et de la continuité abordée au chapitre 12.

Le défi de gouvernance tient au fait que l’indépendance qui rend l’accès d’urgence utile peut aussi le rendre dangereux. Les identités « bris de glace » qui contournent les flux normaux peuvent devenir des portes dérobées persistantes si elles sont partagées, faiblement protégées, mal documentées, rarement testées ou exclues de la surveillance. L’objectif est d’atteindre deux résultats simultanément : l’accès d’urgence doit demeurer disponible lorsque les contrôles normaux font défaut, et il doit demeurer étroitement contrôlé lorsqu’il n’y a pas d’urgence. Les mécanismes « bris de glace » devraient être peu nombreux, explicitement justifiés, affectés à des systèmes ou à des fins de rétablissement définis, et jamais utilisés par commodité, pour un dépannage courant ou pour éviter les flux normaux d’accès privilégié.

Préserver l’indépendance sans créer de porte dérobée

L’accès d’urgence devrait être indépendant des contrôles dont il doit pallier la défaillance. Un mécanisme de rétablissement qui dépend du même fournisseur d’identité, du même service d’authentification, du même chemin réseau ou de la même plateforme de GAP que ceux qui sont en panne offre peu de résilience. Pourtant, indépendance ne doit pas signifier absence de contrôle. La gouvernance devrait définir quelles dépendances normales peuvent être contournées en situation d’urgence et quelles mesures de protection doivent demeurer en vigueur.

L’accès « bris de glace » devrait contourner les dépendances défaillantes, et non la gouvernance elle-même.

Protéger les identifiants et définir les conditions d’activation

Les identifiants et les authentificateurs « bris de glace » devraient bénéficier d’une protection proportionnée à l’autorité qu’ils confèrent : authentification forte, stockage sécurisé, garde contrôlée, connaissance restreinte et protection physique des authentificateurs matériels. Il faut éviter les arrangements dans lesquels plusieurs administrateurs connaissent sans formalité un mot de passe d’urgence partagé, ou dans lesquels les identifiants se trouvent dans des documents accessibles ou dans des gestionnaires de mots de passe personnels. Lorsque c’est possible, leur récupération peut exiger plus d’une personne autorisée. Le but est que l’accès d’urgence puisse être récupéré sans devenir couramment accessible.

La direction devrait aussi définir les situations dans lesquelles l’accès « bris de glace » peut légitimement être utilisé — défaillance de l’infrastructure d’identité normale, perte de l’accès privilégié ordinaire ou incident critique dans lequel un délai causerait un préjudice important —, ainsi que les personnes qui peuvent le déclencher, celles qui doivent en être avisées, l’approbation requise lorsque les circonstances le permettent et la documentation qui doit suivre. Le processus doit demeurer réaliste en situation de crise réelle. Un mécanisme qui dépend de personnes indisponibles, de systèmes inaccessibles ou d’une chaîne d’approbation complexe peut échouer précisément au moment où on en a besoin.

Surveiller, tester et examiner chaque utilisation

Les comptes « bris de glace » devraient être exclus de l’usage courant, mais inclus dans la surveillance et les alertes. Leur activation devrait être traitée comme un événement de sécurité de grande importance qui déclenche des alertes immédiates à l’intention des opérations de sécurité, des administrateurs des identités, des responsables des systèmes et de la direction concernée. L’organisation devrait pouvoir déterminer qui a invoqué le mécanisme, quand, sur quel système, pourquoi l’accès normal n’était pas disponible, ce qui a été fait et quand l’accès d’urgence a pris fin. Puisque certaines urgences comportent une défaillance de la surveillance normale, les éléments probants critiques peuvent nécessiter des mécanismes de collecte qui ne dépendent pas du système touché. L’autorité d’urgence ne devrait jamais devenir une autorité invisible.

L’accès d’urgence devrait être testé périodiquement au moyen d’exercices contrôlés. Les tests permettent de vérifier que les identifiants et les authentificateurs fonctionnent, que le personnel désigné comprend la procédure, que la surveillance détecte l’événement et que le rétablissement peut être effectué sans improvisation risquée. Ils devraient aussi confirmer que le mécanisme n’a pas discrètement perdu son indépendance à la suite de changements apportés à l’infrastructure d’identité, à la configuration infonuagique ou aux réseaux, et qu’il n’a pas accumulé d’autorisations ou de gardiens superflus. Les tests « bris de glace » sont donc à la fois un test de résilience et un test d’assurance des contrôles.

Chaque activation devrait déclencher une revue formelle après utilisation. Cela ne signifie pas que l’utilisation d’urgence est suspecte, mais qu’elle représente une dérogation volontaire aux contrôles normaux et qu’elle justifie une imputabilité accrue. La revue devrait confirmer pourquoi l’accès était nécessaire, si son utilisation était autorisée et proportionnée, quels changements ont été apportés et si les mécanismes normaux ont été rétablis. Les identifiants devraient faire l’objet d’une rotation ou être sécurisés de nouveau, les changements temporaires devraient être revus et les autorisations superflues retirées. Si les administrateurs ont dû improviser parce que les procédures de rétablissement étaient inadéquates, l’organisation devrait y voir une leçon de gouvernance plutôt que de simplement clore le dossier.

Responsabilité et test managérial

Chaque identité d’urgence ou voie de rétablissement importante devrait avoir un responsable clairement désigné et un dossier précisant le système qu’elle protège, qui peut l’invoquer, comment ses identifiants sont protégés, quelles autorisations elle détient, comment son activation est détectée et quand elle a été testée pour la dernière fois. Une revue périodique devrait confirmer qu’elle est toujours nécessaire et que ses autorisations, ses gardiens, sa surveillance et sa documentation demeurent à jour. Les identités « bris de glace » obsolètes sont particulièrement dangereuses : les administrateurs supposent que personne ne les utilise, tandis que les attaquants recherchent précisément les voies d’administration négligées.

La question managériale est simple : l’organisation peut-elle reprendre le contrôle administratif pendant une crise sans créer de faiblesse permanente en temps normal? Un programme mature peut répondre par l’affirmative parce que son accès d’urgence est disponible lorsque les mécanismes normaux font défaut, indépendant des dépendances qu’il doit permettre de rétablir, fortement protégé lorsqu’il est inactif, limité à des fins définies, attribuable, assorti d’une alerte à chaque utilisation, testé périodiquement, revu après chaque activation et sécurisé de nouveau une fois l’urgence terminée. L’accès « bris de glace » n’est pas un moyen de contourner la gouvernance; c’est un mécanisme de résilience gouverné.

## Identités non humaines : comptes de service, clés d’API, jetons et confiance de machine à machine

La gouvernance des identités non humaines constitue un angle mort majeur de nombreux programmes de GIA et de GAP. Les compromissions importantes ne commencent pas toujours par le compte d’un employé. Elles peuvent commencer par une clé d’API divulguée, un jeton à longue durée de vie, un compte de service doté de privilèges excessifs, un certificat mal géré, un secret intégré au code source ou des identifiants exposés dans une chaîne CI/CD. Ces identités peuvent détenir une autorité considérable sur les systèmes, les ressources infonuagiques, les données, les processus de déploiement et les contrôles de sécurité — une autorité parfois plus étendue, plus persistante et moins visible que celle de n’importe quel utilisateur humain.

Les gestionnaires doivent donc reconnaître un principe fondamental : les charges de travail sont des identités, et la confiance de machine à machine est une relation de contrôle d’accès. Les applications s’authentifient auprès des bases de données, les microservices s’appellent les uns les autres, les plateformes d’infrastructure en tant que code créent des ressources infonuagiques, les plateformes de sauvegarde lisent de grands volumes de données, les chaînes de déploiement construisent et déploient des logiciels, et les outils de sécurité mettent des terminaux en quarantaine ou bloquent des comptes. Chacune de ces activités exige un mécanisme par lequel un système est autorisé à agir sur un autre, qu’il s’agisse d’un compte de service, d’une clé d’API, d’un jeton, d’un certificat, d’une identité de charge de travail ou d’un rôle infonuagique. Si ces relations ne sont pas gouvernées, de puissantes voies d’accès s’accumulent en dehors des processus de GIA centrés sur le personnel et demeurent invisibles pour les gestionnaires et les réviseurs.

Inventaire, responsabilité et moindre privilège

La gouvernance commence par la visibilité : une organisation ne peut pas gouverner des identités machines dont elle ignore l’existence. Les identités non humaines importantes devraient être inventoriées et rattachées à l’application, à la charge de travail, à l’intégration ou au processus d’affaires qui en dépend, ainsi qu’à un responsable imputable. La responsabilité importe parce que les identités machines ne s’inscrivent pas naturellement dans les processus de cycle de vie conçus pour les humains. Un compte de service créé pour un projet peut continuer de fonctionner longtemps après la fin du projet; une clé d’API peut demeurer active après le remplacement de son application; un certificat peut continuer d’autoriser un système dont personne ne se souvient d’être responsable. Chaque identité non humaine importante devrait avoir un responsable défini, une finalité légitime, une portée autorisée, un niveau de privilège approprié, des exigences de gestion des identifiants, des attentes en matière de surveillance et des critères de retrait.

Le principe du moindre privilège s’applique tout autant aux machines. Un service de production de rapports qui lit un ensemble de données limité ne devrait pas détenir de droits d’administration de base de données; une chaîne de déploiement qui publie une seule application ne devrait pas contrôler des environnements de production sans rapport avec elle. Cela importe davantage pour les machines que pour les personnes, car un processus automatisé doté de privilèges excessifs peut s’exécuter des milliers de fois par jour et bénéficier de la confiance implicite de nombreux systèmes. Les identités machines devraient donc être évaluées non seulement en fonction de ce qu’elles font, mais aussi de ce que leurs autorisations permettraient si elles étaient compromises. Les identités capables de déployer des logiciels en production, de modifier l’infrastructure infonuagique, d’administrer des bases de données, de gérer les sauvegardes, de changer des configurations d’identité ou d’émettre des identifiants pour d’autres systèmes devraient être classées comme privilégiées et gouvernées dans le cadre du modèle de GAP.

Réduire la dépendance aux secrets à longue durée de vie

Les identifiants statiques attirent les attaquants parce qu’ils peuvent être copiés et réutilisés sans déclencher les indicateurs comportementaux associés aux comptes humains compromis. Les mots de passe, les clés d’API, les clés privées et les jetons ne devraient pas être intégrés au code source, aux scripts, aux images de conteneurs, aux fichiers de configuration ni aux journaux de compilation. Les plateformes de gestion des secrets offrent une meilleure protection grâce au contrôle d’accès, à la journalisation, à la rotation, à la gestion des versions et à l’expiration. Mieux encore, lorsque c’est techniquement faisable, les organisations devraient réduire globalement leur dépendance aux secrets réutilisables à longue durée de vie au moyen d’identifiants à courte durée de vie, d’identités gérées, de la fédération d’identités de charge de travail, de l’authentification par certificat et de jetons émis dynamiquement. Il est intrinsèquement difficile de protéger un secret indéfiniment; réduire la durée de vie des identifiants limite la période pendant laquelle un secret volé demeure utile. Lorsque des identifiants à longue durée de vie restent nécessaires en raison de contraintes liées aux systèmes patrimoniaux, ils devraient être traités comme des exceptions contrôlées, assorties d’une justification, de mesures de protection compensatoires et d’une revue périodique.

Gouverner le cycle de vie des identités machines

Les identités non humaines ont besoin d’un cycle de vie tout comme les identités humaines : création délibérée, attribution à un responsable, autorisations appropriées, revue périodique, modification lorsque les besoins changent et retrait lorsque la finalité prend fin. Les événements déclencheurs comprennent le retrait d’une application, la fin d’un projet, la fin d’une relation avec un fournisseur, le remplacement d’une infrastructure, la migration d’une plateforme, l’expiration d’un certificat et la refonte de processus automatisés. La question de gouvernance est la même que celle qui s’applique ailleurs en GIA : cette identité a-t-elle encore une raison légitime d’exister, et a-t-elle encore besoin de l’autorité qu’elle détient? Les identités dormantes, orphelines ou inexpliquées devraient faire l’objet d’une enquête, puis être désactivées ou supprimées.

Identités de la chaîne d’approvisionnement, des chaînes CI/CD et de l’infonuagique

La gouvernance des identités non humaines recoupe directement la sécurité de la chaîne d’approvisionnement logicielle. Les dépôts de code source, les serveurs de compilation, les référentiels d’artefacts, les gestionnaires de paquets, les services de signature et les chaînes de déploiement se font confiance mutuellement au moyen d’identités machines. Une identité CI/CD compromise peut permettre à un attaquant de modifier le code source, d’introduire des dépendances malveillantes, d’altérer des compilations, d’obtenir d’autres identifiants ou de pousser des logiciels non autorisés en production, et son activité peut être présumée légitime parce qu’elle semble provenir des processus de développement habituels. Les identités des chaînes de déploiement devraient donc être gouvernées en fonction de l’autorité qu’elles peuvent exercer, et non classées comme de simples comptes techniques.

Les environnements infonuagiques amplifient le problème, car les charges de travail y obtiennent couramment des autorisations pour créer des ressources, modifier les autorisations de stockage, changer des configurations réseau, gérer des services de chiffrement et créer d’autres identités. Les rôles infonuagiques et les identités de charge de travail devraient avoir des relations de confiance clairement définies : la direction devrait comprendre non seulement quelles autorisations une identité détient, mais aussi quels systèmes sont autorisés à l’assumer ou à l’invoquer, en particulier lorsque des politiques de confiance permettent à une autre charge de travail, à un autre compte, à un autre locataire, à une chaîne de déploiement ou à un service externe d’obtenir ses privilèges. L’architecture d’identité propre à l’infonuagique est abordée plus en détail au chapitre 15.

Surveiller le comportement et éviter l’autorité anonyme

À certains égards, les identités machines peuvent être plus faciles à surveiller que les personnes, car les systèmes automatisés se comportent de manière prévisible. Un compte de service qui lit normalement une seule base de données devrait attirer l’attention s’il commence à interroger des systèmes sans rapport; une identité de déploiement qui se met à créer des utilisateurs administratifs, ou un compte de sauvegarde qui commence à supprimer des données, justifie une enquête. La surveillance devrait viser à repérer les ressources inattendues, les opérations d’API inhabituelles, les nouveaux emplacements d’exécution, l’élévation de privilèges, l’utilisation d’identités dormantes et les activités qui sortent de la finalité prévue. L’objectif est de déterminer si l’identité machine se comporte de façon cohérente avec la finalité pour laquelle son autorité a été accordée.

L’imputabilité souffre également lorsqu’un même compte de service générique est partagé entre des applications sans rapport les unes avec les autres. Les identités machines partagées simplifient l’administration, mais affaiblissent l’attribution des actions et amplifient l’impact d’une compromission des identifiants. Dans la mesure du possible, des charges de travail distinctes devraient utiliser des identités distinctes, afin que les autorisations puissent être adaptées, que les identifiants puissent faire l’objet d’une rotation ou d’une révocation indépendante et que l’activité puisse être attribuée au système responsable. Le but est d’éviter l’autorité machine anonyme, dans laquelle de puissants identifiants sont largement partagés sans que personne puisse dire quelle application les a utilisés ni pourquoi.

L’identité machine comme autorité numérique déléguée

Les organisations modernes délèguent de plus en plus d’autorité opérationnelle aux logiciels. Les applications exécutent des transactions, l’automatisation modifie l’infrastructure, les chaînes de déploiement mettent en production des systèmes, les outils de sécurité prennent des mesures de confinement et les API transfèrent des données organisationnelles. Il s’agit d’exercices d’autorité numérique, même lorsqu’aucune personne n’intervient directement au moment de l’action. Les identités non humaines doivent donc être inventoriées, attribuées à un responsable, classées, réduites au minimum, protégées, surveillées, révisées et, à terme, retirées. Les gestionnaires devraient pouvoir poser au sujet d’une identité machine les mêmes questions qu’au sujet d’une identité humaine : ce qu’elle est, qui en est responsable, pourquoi elle existe, ce à quoi elle peut accéder, comment elle s’authentifie, où ses identifiants sont protégés, comment une compromission serait détectée et ce qui entraînera son retrait. Les agents d’IA qui agissent au moyen d’outils constituent la forme la plus récente et celle qui croît le plus rapidement de cette autorité déléguée; le chapitre 18 explique pourquoi ils devraient être gouvernés comme des identités non humaines, selon le principe du moindre privilège, avec des responsables imputables et des points d’approbation pour les actions lourdes de conséquences. La gouvernance des identités non humaines ne se résume pas à la gestion des secrets; c’est la gouvernance de l’autorité organisationnelle exercée par les logiciels.

## Auditabilité et éléments probants : faire du contrôle d’accès une assurance crédible

L’une des leçons les plus importantes pour les gestionnaires est qu’un contrôle d’accès sans éléments probants se distingue difficilement d’une hypothèse. Une organisation peut croire que l’AMF est imposée, que les accès des personnes qui partent sont retirés rapidement, que les accès privilégiés sont surveillés et que les revues sont effectuées. À moins qu’elle puisse produire des éléments probants fiables, ces affirmations sont difficiles à vérifier et à défendre. Les éléments probants font la différence entre « nous croyons que le contrôle fonctionne » et « nous pouvons démontrer qu’il fonctionne ». Le chapitre 3 traite de la façon dont ces éléments probants soutiennent la conformité; nous nous concentrons ici sur ce que doivent contenir les éléments probants en matière de GIA et de GAP.

L’auditabilité exige à la fois la traçabilité des décisions et la traçabilité des activités : l’organisation devrait pouvoir reconstituer la manière dont un accès a été accordé, modifié, exercé, révisé et retiré. Cela ne signifie pas une documentation élaborée pour chaque action courante. Cela signifie que les décisions d’accès et les activités à fort impact laissent suffisamment d’éléments probants pour assurer l’imputabilité, l’assurance et les enquêtes. Au minimum, l’organisation devrait pouvoir produire des éléments probants concernant les exigences d’authentification et l’application de l’AMF, les rôles et autorisations attribués, les demandes et les approbations, les modifications d’accès, les connexions privilégiées et les actions privilégiées importantes, les résultats des revues, les événements du cycle de vie, les approbations d’exceptions et l’acceptation formelle du risque résiduel lié aux accès. L’étendue des éléments probants devrait être proportionnelle à l’autorité en cause.

Éléments probants relatifs au cycle de vie et aux accès privilégiés

Pour les identités humaines, l’organisation devrait pouvoir montrer à quel moment une personne s’est jointe à l’organisation, quels accès lui ont été accordés, quel rôle les justifiait et qui les a approuvés; quelles autorisations ont été ajoutées et retirées lorsque ses responsabilités ont changé; et à quel moment ses accès ont été désactivés après son départ, y compris les sessions, l’accès à distance, les comptes privilégiés et les autorisations déléguées dans le cas des identités à risque plus élevé. Cela répond à une question d’assurance centrale : l’autorité numérique a-t-elle changé lorsque l’autorité organisationnelle a changé? Pour les identités non humaines, des éléments probants comparables montrent qui est responsable de l’identité, pourquoi elle existe, ce qu’elle peut faire, ce qui en dépend, à quel moment ses identifiants ont été émis ou ont fait l’objet d’une rotation, à quand remonte la dernière revue de ses accès et comment elle sera mise hors service. Sans de tels éléments probants, des identités machines peuvent demeurer actives pendant des années sans que personne puisse expliquer pourquoi.

La GAP exige les éléments probants les plus solides, car l’accès privilégié représente une autorité exceptionnelle. Les enregistrements pertinents comprennent les demandes d’accès privilégié et leurs justifications, les approbations, les fenêtres d’élévation JIT, l’extraction d’identifiants, le début et la fin des sessions, les activités administratives, les enregistrements de session lorsqu’ils sont justifiés, ainsi que les activations et les revues des accès d’urgence (« bris de glace »). Le but n’est pas de documenter pour le plaisir de documenter, mais de rendre les actions lourdes de conséquences reconstituables et attribuables : la direction devrait savoir quelle personne ou quel processus gouverné a exercé l’autorité, pourquoi, en vertu de quelle approbation et si l’activité est restée dans les limites de la finalité autorisée — même lorsque le système sous-jacent enregistre seulement qu’un compte administratif générique a agi.

Les éléments probants doivent être fiables

Un enregistrement ne constitue pas automatiquement un élément probant fiable. Les journaux et les registres d’approbation qui peuvent être modifiés ou supprimés par les identités privilégiées mêmes dont ils documentent les actions n’offrent qu’une assurance limitée. Les éléments probants de grande valeur devraient être protégés contre la modification et la suppression non autorisées, l’accès aux registres d’audit devrait être restreint, et les environnements sensibles peuvent exiger une séparation entre les personnes qui administrent les systèmes et celles qui contrôlent les éléments probants d’audit. La durée de conservation devrait tenir compte des besoins opérationnels, d’enquête, juridiques, contractuels, réglementaires et de protection de la vie privée; il n’est pas approprié de conserver indéfiniment les données d’identité, mais les conserver trop peu longtemps peut rendre impossibles les enquêtes et les démonstrations de conformité. La gouvernance des éléments probants devrait répondre non seulement à la question de savoir ce qui est journalisé, mais aussi à celles de savoir qui peut le modifier, où il est stocké, combien de temps il est conservé et s’il sera disponible lorsque les auditeurs, les enquêteurs ou les organismes de réglementation en auront besoin.

GIA, GAP et opérations de sécurité

Les éléments probants liés aux identités ne devraient pas rester isolés dans les plateformes de gestion des accès. Les journaux d’authentification, les élévations de privilèges, les modifications de comptes, l’utilisation de jetons et les comportements anormaux des identités machines devraient être corrélés avec les éléments probants provenant des terminaux, des plateformes infonuagiques, des applications, du système de gestion des billets et de la gestion du changement, comme l’expliquent les chapitres 7 et 8. Le contexte permet de distinguer l’activité légitime de l’utilisation abusive : une connexion privilégiée en dehors des heures normales peut être sans conséquence si elle correspond à un changement d’urgence approuvé, et très significative s’il n’existe aucun enregistrement de changement, que l’appareil est inconnu et que l’identité modifie ensuite la journalisation. La détection liée aux identités, que les fournisseurs regroupent maintenant souvent sous l’appellation détection et intervention liées aux menaces d’identité (ITDR), peut couvrir les échecs d’authentification répétés, les demandes d’AMF inattendues, les récupérations de compte suspectes, les élévations de privilèges inhabituelles, l’utilisation de comptes dormants, l’accès à partir d’appareils non gérés, les modifications d’autorisations à risque élevé, l’activité d’API anormale et l’activation de comptes d’urgence. Toute anomalie n’est pas un incident, mais les alertes importantes exigent une responsabilité définie, des critères de triage et des mécanismes de remontée. Des éléments probants recueillis, mais jamais examinés n’ont guère de valeur de contrôle.

De la journalisation à l’assurance

Les gestionnaires n’ont pas besoin de comprendre les formats de journaux ni les protocoles d’authentification. Ils doivent toutefois exiger que, pour les accès importants, l’organisation puisse établir qui ou quoi avait accès, pourquoi, qui l’a approuvé, ce que l’accès permettait, à quel moment et à partir d’où il a été utilisé, quelles actions importantes ont été effectuées, si l’activité correspondait au rôle ou à la finalité de l’identité, si l’accès a été révisé, si les autorisations inappropriées ont été retirées et si l’organisation pourrait reconstituer les événements dans l’éventualité où l’identité serait plus tard soupçonnée d’avoir été compromise. Ce sont des questions de gouvernance, et non des questions de journalisation. Une organisation peut recueillir des milliards d’événements liés aux identités et n’avoir pourtant qu’une faible assurance si ces enregistrements ne permettent pas d’y répondre.

Des éléments probants fiables soutiennent aussi le modèle des trois lignes. Les équipes opérationnelles s’en servent pour administrer les accès et démontrer que les procédures ont été suivies; les fonctions de gestion des risques, de conformité et de protection de la vie privée utilisent les mêmes éléments probants pour vérifier si les accès demeurent conformes à la politique et à l’appétence pour le risque; et l’audit interne s’en sert pour tester de façon indépendante la conception et l’efficacité opérationnelle. La fonction qui exécute un contrôle ne devrait pas être la seule source d’assurance que ce contrôle fonctionne. Sans éléments probants fiables, les audits se réduisent à des entrevues, les enquêtes deviennent des reconstitutions à partir de fragments et les affirmations de conformité reposent en grande partie sur la confiance. Avec eux, la direction peut repérer les accès excessifs, remettre en question les exceptions, vérifier le retrait des accès, enquêter sur les activités suspectes et démontrer que les contrôles des identités fonctionnent comme prévu. L’objectif n’est pas de « tout journaliser », mais de produire des éléments probants utiles à la décision, fiables, protégés et vérifiables sur la façon dont l’autorité numérique est accordée, exercée, modifiée et retirée.

## Mesure : les mesures de GIA et de GAP qui comptent pour la gouvernance

La GIA et la GAP sont des domaines de gouvernance, en partie parce que leur efficacité peut être observée et mesurée. Les indicateurs les plus utiles ne sont pas ceux qui comptabilisent l’activité — comptes créés, mots de passe réinitialisés, billets traités. Ces chiffres aident la gestion opérationnelle, mais en disent peu sur la maîtrise du risque lié aux identités. Les mesures dignes de la gouvernance devraient montrer si l’exposition liée aux accès augmente ou diminue, si les identités et les privilèges à risque élevé sont contrôlés, si les processus du cycle de vie sont fiables, si les exceptions diminuent et s’il existe des éléments probants démontrant que les accès demeurent appropriés. Comme l’explique le chapitre 4, les plus importantes de ces mesures devraient prendre la forme d’indicateurs clés de risque assortis de seuils liés à l’appétence pour le risque.

Une bonne mesure combine plusieurs types d’indicateurs. Les mesures de couverture montrent si les contrôles sont déployés dans l’ensemble de la population visée. Les mesures de performance montrent s’ils fonctionnent selon les normes attendues. Les indicateurs de risque mettent en évidence les conditions qui accroissent l’exposition, comme les comptes orphelins ou les privilèges permanents. Les mesures de correction montrent si les faiblesses relevées sont corrigées. Le tableau ci-dessous présente des exemples représentatifs.

Domaine de gouvernance

Exemple de mesure

Pourquoi c’est important

Couverture de l’AMF

% des identités actives du personnel protégées par l’AMF

Montre si la protection de base est appliquée de façon générale

Authentification résistante à l’hameçonnage

% des identités privilégiées et à risque élevé qui utilisent des méthodes résistantes à l’hameçonnage

Concentre une assurance forte là où l’impact est le plus grand

Accès conditionnel

% des applications sensibles et des voies d’accès privilégié soumises à des politiques approuvées

Montre si les décisions d’accès tiennent compte du contexte

Retrait des accès lors des départs

% des personnes parties dont les accès ont été désactivés dans le délai de service exigé

Teste un contrôle essentiel du cycle de vie

Correction lors des mutations

% des changements de rôle pour lesquels les accès désuets ont été retirés à temps

Mesure la maîtrise de l’accumulation de privilèges

Privilèges permanents

Nombre d’identités disposant de privilèges permanents, avec la tendance

Montre si l’autorité persistante diminue

Privilèges juste-à-temps

% des accès privilégiés admissibles accordés au moyen d’une élévation limitée dans le temps

Montre si les privilèges sont temporaires et justifiés

Imputabilité des sessions privilégiées

% des sessions à risque élevé attribuables à une personne nommément désignée ou à un processus gouverné

Montre si les activités d’administration peuvent être reconstituées

Correction à la suite des revues des accès

% des accès inappropriés retirés dans le délai exigé

Mesure l’efficacité des revues, et non leur simple réalisation

Conflits de séparation des tâches

Conflits à risque élevé non résolus, et % des exceptions assorties d’un responsable et d’une échéance

Montre si les concentrations d’autorité sont gouvernées

Préparation des accès d’urgence

% des mécanismes d’urgence testés; % des activations révisées

Confirme que les accès d’urgence fonctionnent et demeurent soumis à l’imputabilité

Comptes dormants et orphelins

Comptes qui dépassent le seuil d’inactivité ou qui n’ont pas de responsable valide

Repère les identités qui ont échappé à la gouvernance du cycle de vie

Accès des tiers

% des identités externes assorties d’un parrain, d’une finalité et d’une échéance

Rattache l’accès externe à une relation en vigueur

Identités non humaines

% des identités machines importantes assorties d’un responsable et d’une classification des privilèges

Montre si l’autorité des machines est visible

Hygiène des secrets

% des identifiants machines qui respectent les exigences de rotation ou de courte durée de vie

Suit la réduction des secrets à longue durée de vie

Exceptions liées aux identités

Exceptions actives et % de celles qui ont dépassé leur date de revue ou d’échéance

Montre si les exceptions demeurent temporaires

Exhaustivité des éléments probants

% des décisions d’accès à risque élevé échantillonnées qui sont appuyées par des éléments probants complets

Vérifie si les contrôles sont démontrables

Interpréter les mesures et les tendances

Les mesures ne devraient pas être lues de façon mécanique. Une hausse des constatations issues des revues des accès peut signaler une gouvernance déficiente, ou montrer qu’un processus de revue amélioré met enfin au jour des excès auparavant cachés. Une baisse du nombre de comptes d’utilisateurs privilégiés peut refléter une meilleure application du moindre privilège, ou un transfert des privilèges vers des comptes de service et des rôles infonuagiques non gérés. Un taux de couverture de l’AMF élevé peut créer un faux sentiment de sécurité si la part non couverte comprend des administrateurs; un résultat de 99 % compte moins que de savoir quel 1 % demeure hors de portée du contrôle. La reddition de comptes devrait donc être segmentée — utilisateurs ordinaires par rapport aux utilisateurs privilégiés, personnel par rapport aux tiers, identités humaines par rapport aux identités non humaines, systèmes courants par rapport aux systèmes critiques —, car les moyennes à l’échelle de l’entreprise masquent les concentrations d’exposition.

La plupart des mesures relatives aux identités sont plus significatives sous forme de tendances que de valeurs isolées. La direction en apprend davantage en sachant si les privilèges permanents diminuent et sont remplacés par une élévation contrôlée qu’en consultant un décompte ponctuel. Chaque indicateur important devrait donc comporter une valeur actuelle, une cible, une tendance, un seuil de remontée et un responsable imputable; une mesure sans plage attendue informe, mais ne déclenche pas d’action de gouvernance. Un cadre équilibré combine aussi des indicateurs avancés, comme la couverture des méthodes résistantes à l’hameçonnage, les privilèges permanents, les revues en retard et les identités sans responsable, qui révèlent la détérioration des conditions avant qu’un incident survienne, et des indicateurs retardés, comme les compromissions d’identité confirmées, l’utilisation abusive de comptes privilégiés et les constatations d’audit liées aux accès, qui montrent si les contrôles préviennent les résultats qu’ils étaient censés empêcher.

Mesurer l’efficacité, et non l’activité administrative

Les gestionnaires devraient faire soigneusement la distinction entre les mesures d’activité et les mesures d’efficacité. « Dix mille revues des accès effectuées » mesure une activité. « Quatre-vingt-dix-huit pour cent des accès à risque élevé révisés à temps » mesure la performance d’un processus. « Vingt-trois pour cent des autorisations révisées ont été retirées » dit quelque chose de la qualité du modèle d’accès existant, et « 95 % des autorisations inappropriées corrigées en 30 jours » mesure l’efficacité des mesures correctives. De même, « 500 demandes d’accès privilégié traitées » est une information opérationnelle, tandis que « les accès administratifs permanents ont diminué de 30 % sans augmentation des identités privilégiées non gérées » constitue une preuve de réduction du risque. La mesure devrait chercher à savoir si l’exposition change, et non si les équipes de GIA sont occupées.

Les dirigeants n’ont pas besoin de chaque indicateur technique. Le tableau de bord devrait leur permettre de répondre à un nombre plus restreint de questions lourdes de conséquences : si moins d’identités détiennent des accès inutiles, si les privilèges sont de plus en plus temporaires, si les personnes et les fournisseurs perdent rapidement leurs accès lorsque les relations changent, si les conflits de séparation des tâches diminuent, si les identités machines et celles des tiers sont visibles et ont un responsable, si les exceptions sont réellement temporaires et si les actions privilégiées peuvent être reconstituées. L’objectif n’est pas de maximiser chaque mesure, mais de comprendre si l’autorité numérique devient plus contrôlée ou moins contrôlée au fil du temps.

## Feuille de route de mise en œuvre : une séquence pratique pour les gestionnaires

Les organisations abordent souvent la GIA et la GAP comme de vastes programmes de transformation technologique, puis se heurtent aux applications patrimoniales, à des données d’identité incohérentes, à une responsabilité fragmentée, à des droits décisionnels flous et à la résistance au changement. Une approche plus gouvernable développe les capacités progressivement, chaque étape réduisant une exposition significative, améliorant la visibilité, renforçant les éléments probants et jetant les bases de la suivante. La feuille de route n’est pas une séquence technique rigide; les activités se chevauchent, et certains contrôles doivent être accélérés là où le risque est élevé. Le principe est que la maturité de la GIA et de la GAP devrait progresser en fonction du risque et des dépendances, et non selon les calendriers de déploiement des logiciels.

Étape 1 : établir une base fiable d’identité et d’authentification

La première étape consiste à définir les sources d’identité faisant autorité, à améliorer la qualité des dossiers d’identité, à réduire le nombre de référentiels d’identités en double et à regrouper les fournisseurs d’identité lorsque c’est faisable. Les contrôles ultérieurs — attribution automatisée des accès, revues des accès, attribution des rôles, accès conditionnel et GAP — deviennent peu fiables si les données d’identité sont incomplètes ou déconnectées de l’information d’affaires faisant autorité. L’authentification est renforcée en parallèle : l’AMF est imposée de façon générale pour les accès importants, les méthodes résistantes à l’hameçonnage sont privilégiées pour les administrateurs privilégiés, les administrateurs des identités, la gestion infonuagique, l’administration à distance et les approbations financières, et les politiques d’accès conditionnel intègrent progressivement l’état de sécurité des appareils, le risque lié à l’identité et la sensibilité des ressources. L’objectif est d’accroître la confiance que les identités qui exercent l’autorité numérique sont légitimes et adéquatement authentifiées.

Étape 2 : renforcer la rigueur du cycle de vie des identités

La deuxième étape normalise les processus d’arrivées, de mutations et de départs et les intègre aux processus relatifs aux ressources humaines, aux contractuels et aux fournisseurs, afin que les changements d’identité découlent d’événements faisant autorité plutôt que de demandes manuelles. Le retrait des accès procure souvent une réduction immédiate du risque : les comptes des personnes parties, les comptes de contractuels expirés, les identités externes désuètes et les comptes dormants devraient être désactivés rapidement. Les processus de mutation devraient retirer les accès liés aux anciennes responsabilités, et non simplement en ajouter de nouveaux. Des attentes mesurables — niveaux de service pour le retrait des accès, proportion des événements du cycle de vie traités au moyen de flux de travail approuvés et nombre d’identités orphelines — devraient être instaurées à cette étape. L’objectif est de maintenir l’autorité numérique synchronisée avec la réalité organisationnelle.

Étape 3 : placer l’autorité privilégiée sous contrôle

La troisième étape consiste à déterminer où se trouve l’autorité privilégiée, en commençant par les systèmes et les identités susceptibles d’entraîner les conséquences les plus importantes. Les identités ordinaires et administratives sont séparées, les privilèges permanents sont réduits, les identifiants privilégiés sont placés dans un coffre-fort, et les privilèges juste-à-temps ou juste suffisants sont instaurés lorsque c’est faisable. Les sessions à risque élevé sont rendues attribuables et surveillées, les voies d’administration sont restreintes, et les mécanismes d’accès d’urgence sont conçus, protégés, testés et révisés. L’objectif n’est pas de placer immédiatement chaque compte administratif dans une plateforme de GAP, mais de faire en sorte que les formes les plus lourdes de conséquences de l’autorité numérique soient progressivement soumises à un contrôle plus rigoureux.

Étape 4 : renforcer la gouvernance des autorisations et des rôles

La quatrième étape améliore la qualité des décisions d’autorisation, en commençant par les systèmes à risque élevé, l’information sensible, les processus financiers, les environnements de production, les plateformes infonuagiques et les fonctions où des conflits de séparation des tâches pourraient avoir des conséquences importantes. Des rôles dont les unités d’affaires sont responsables sont définis, les droits d’accès sont rationalisés, les accès inutiles sont retirés et des modèles RBAC, ABAC ou hybrides sont appliqués lorsqu’ils améliorent la cohérence. Les revues des accès évoluent de simples certifications administratives vers des processus utiles à la décision, et les constatations mènent à des mesures correctives. L’objectif est de démontrer que les autorisations demeurent justifiées et que l’autorité excessive est réellement réduite.

Étape 5 : étendre la gouvernance aux tiers et aux identités non humaines

À mesure que la gouvernance des identités humaines et des accès privilégiés gagne en maturité, une rigueur comparable est étendue aux identités externes et aux identités machines. L’accès des tiers se voit attribuer des parrains internes, une justification documentée, une portée définie, une authentification appropriée et des mécanismes d’expiration ou de renouvellement, l’accès privilégié des fournisseurs étant gouverné comme l’administration interne. Les comptes de service, les identités de charge de travail, les identifiants d’API, les certificats, les rôles infonuagiques et les identités des chaînes de déploiement sont inventoriés et attribués à des responsables; leurs privilèges sont évalués en fonction du risque; les secrets statiques sont remplacés, lorsque c’est faisable, par des identités gérées, la fédération des charges de travail ou des identifiants à courte durée de vie; et les identités machines à risque élevé sont intégrées à la GAP. L’objectif est d’éviter que la gouvernance des identités s’arrête au personnel humain alors qu’une autorité externe et automatisée importante demeure non gérée. La figure ci-dessous résume la séquence.

Figure 52 : feuille de route de mise en œuvre de la GIA

Intégrer la surveillance, les éléments probants et la mesure à chaque étape

La surveillance et les éléments probants devraient être intégrés dès la conception de chaque étape plutôt que reportés à la fin. Les événements liés aux identités et aux privilèges devraient être journalisés, protégés, conservés et intégrés aux opérations de sécurité, afin que la direction puisse voir si les contrôles fonctionnent réellement plutôt que de se fier à des rapports d’avancement de la mise en œuvre. Les mesures devraient évoluer avec le programme : couverture de l’AMF, comptes dormants et rapidité du retrait des accès au début; puis réduction des privilèges permanents, correction à la suite des revues, conflits de séparation des tâches, attribution d’un responsable aux identités non humaines et vieillissement des exceptions par la suite. Cela importe parce que le risque se déplace : réduire le nombre de comptes d’administrateurs humains donne peu de résultats si des privilèges équivalents migrent vers des rôles infonuagiques non gérés, et améliorer le retrait des accès des employés tout en négligeant les identités externes laisse une exposition comparable ailleurs. La mesure devrait montrer que l’exposition liée aux identités est réellement réduite plutôt que simplement déplacée.

Définir les jalons comme des résultats de réduction du risque et établir les priorités en fonction du risque

Les gestionnaires devraient exiger que chaque étape produise des résultats de gouvernance observables plutôt que des jalons technologiques. « Nous avons acheté une plateforme de GIA » et « le système de GAP est en service » sont des énoncés de mise en œuvre; ils ne montrent pas que le risque lié aux identités a diminué. Des jalons plus significatifs pourraient comprendre les suivants, avec des seuils fixés en fonction de l’appétence pour le risque de l’organisation.

- AMF imposée pour la quasi-totalité des utilisateurs visés, et chaque utilisateur privilégié recourant à une authentification approuvée résistante à l’hameçonnage.
- Accès des personnes parties désactivés dans le respect du niveau de service approuvé dans au moins 99 % des cas.
- Comptes à privilèges permanents considérablement réduits, la plupart des accès administratifs admissibles ayant été convertis en élévation limitée dans le temps.
- Tous les comptes d’accès d’urgence testés avec succès au cours de la période de revue.
- Toutes les identités de tiers et tous les comptes de service à risque élevé attribués à des responsables imputables et assortis d’exigences d’échéance, de revue ou de gestion des identifiants.
- Toute activité privilégiée sur les systèmes critiques attribuable à une personne nommément désignée ou à un processus gouverné.
Les organisations devraient également éviter de mettre en œuvre les contrôles de façon uniforme dans tous les systèmes dès le départ. Une feuille de route fondée sur les risques donne la priorité aux identités et aux voies d’accès susceptibles d’entraîner les conséquences d’affaires les plus graves. Un compte d’administrateur infonuagique à risque élevé peut justifier la mise en place immédiate d’une authentification résistante à l’hameçonnage et de contrôles de GAP alors même que l’ingénierie des rôles plus large n’est pas terminée; une application patrimoniale contenant des données très sensibles peut justifier l’accélération des contrôles de cycle de vie et de revue, même si des processus manuels provisoires sont nécessaires. Les méthodes fondées sur des scénarios des chapitres 5 et 6 se prêtent bien à rendre ces priorités explicites et défendables.

Mise en situation : prioriser les accès privilégiés chez un fabricant québécois

Prenons l’exemple d’un fabricant québécois de taille moyenne qui compte 1 200 employés, un progiciel de gestion intégré (PGI) infonuagique, un portefeuille croissant d’applications SaaS et un fournisseur de TI en impartition qui administre ses serveurs. Le conseil d’administration a approuvé un programme de GIA de deux ans, et le fournisseur propose de commencer par un exercice complet d’ingénierie des rôles couvrant toutes les applications. Le chef de la sécurité de l’information (CSI) choisit plutôt d’analyser deux scénarios avec les responsables des risques : un rançongiciel qui pénètre par le compte compromis d’un administrateur du fournisseur, et des paiements frauduleux à des fournisseurs effectués par un utilisateur du PGI qui peut à la fois créer des fournisseurs et autoriser des paiements. Les deux scénarios présentent un risque résiduel élevé, bien au-delà de l’appétence que le conseil a fixée pour les perturbations opérationnelles et les pertes financières.

La feuille de route qui en découle réorganise le travail. Au premier trimestre, le personnel du fournisseur en impartition passe à des identités administratives nominatives et résistantes à l’hameçonnage, gérées au moyen d’une élévation juste-à-temps, et le mot de passe partagé d’administrateur de domaine est retiré. Deux comptes d’accès d’urgence sont créés, conservés sous double garde, assortis d’une alerte en cas d’utilisation et testés. Le responsable du PGI commande une analyse ciblée de la séparation des tâches dans le processus d’approvisionnement à paiement, qui révèle que quatorze utilisateurs détiennent la combinaison de création de fournisseurs et d’autorisation de paiements; onze cas sont corrigés et trois sont approuvés comme exceptions limitées dans le temps, assorties d’un contrôle par un second approbateur et d’un responsable du risque nommément désigné. L’ingénierie des rôles plus large est prévue pour la deuxième année.

La reddition de comptes trimestrielle au comité d’audit présente le nombre de comptes à privilèges permanents, la proportion des sessions du fournisseur attribuables à des personnes nommément désignées et les exceptions de séparation des tâches en suspens au regard de leur date d’échéance. En quelques mois, le programme peut montrer au conseil que les deux scénarios les plus lourds de conséquences sont revenus à l’intérieur de l’appétence, ce qui constitue un fondement plus solide pour la poursuite des investissements qu’un rapport indiquant que la plateforme a été déployée.

Gérer la GIA et la GAP comme une transformation de la gouvernance

La mise en œuvre de la GIA et de la GAP devrait être traitée comme un programme de réduction du risque et de transformation de la gouvernance, et non comme un projet de déploiement logiciel. La technologie est nécessaire, mais la réussite dépend aussi de données faisant autorité, de la responsabilité des unités d’affaires, de droits décisionnels clairs, de processus efficaces, de l’intégration avec la gestion des ressources humaines et des fournisseurs, de modèles d’accès significatifs, de la surveillance et d’une assurance crédible. Chaque étape devrait éliminer des faiblesses connues, réduire l’autorité numérique inutile, améliorer la visibilité de la direction et jeter les bases de la suivante. Une feuille de route réussie se définit non pas par le nombre de technologies d’identité déployées, mais par le fait que, au fil du temps, les accès deviennent plus exacts, les privilèges plus restreints, les éléments probants plus crédibles, les exceptions mieux contrôlées et l’imputabilité plus explicite.

## Synthèse finale : la gouvernance des identités au cœur de la cybersécurité moderne

Dans les entreprises centrées sur l’identité, la gouvernance de la cybersécurité dépend largement de la capacité à gouverner les identités numériques et l’autorité qui leur est rattachée. La GIA et la GAP déterminent si les accès sont accordés de façon appropriée, si les privilèges excessifs sont restreints, si le risque lié aux initiés et aux tiers est réduit, si les attaquants peuvent élever leurs privilèges après une compromission initiale et si la direction peut produire des éléments probants crédibles pour les enquêtes, les audits et les missions d’assurance.

La conclusion centrale de ce chapitre est simple.

Lorsque la gouvernance des identités est faible, de nombreux autres contrôles de cybersécurité deviennent fragiles.

Les organisations investissent dans la segmentation, la protection des terminaux, la sécurité infonuagique, la surveillance, la protection des données, les sauvegardes et l’intervention en cas d’incident. Pourtant, un pare-feu robuste offre une protection limitée si un administrateur compromis peut en modifier les règles; la journalisation n’offre qu’une assurance limitée si une identité privilégiée peut la désactiver; un stockage infonuagique sécurisé peut tout de même laisser fuir des données si un compte doté de privilèges excessifs peut en modifier la politique d’accès; et les sauvegardes procurent peu de résilience si des identifiants administratifs permettent à un attaquant de les supprimer. La gouvernance des identités détermine non seulement qui entre dans l’environnement, mais aussi qui ou quoi a le pouvoir de modifier l’environnement une fois à l’intérieur.

À l’inverse, une gouvernance des identités rigoureuse renforce de nombreux autres investissements. Une authentification forte accroît la confiance que l’acteur qui utilise une identité est légitime. Le principe du moindre privilège réduit l’autorité susceptible d’être utilisée de façon abusive. La séparation des tâches empêche les concentrations d’autorité qui rendent possibles la fraude et la dissimulation. La gouvernance du cycle de vie maintient les accès alignés sur l’emploi, les contrats et les besoins d’affaires. La GAP restreint l’autorité exceptionnelle afin qu’une compromission ordinaire ne devienne pas catastrophique. La gouvernance des tiers rattache les identités externes à des relations légitimes et à une imputabilité interne, et la gouvernance des identités non humaines étend les mêmes principes aux charges de travail, à l’automatisation et aux API. La surveillance et les éléments probants rendent l’ensemble observable et défendable.

En ce sens, la GIA et la GAP rendent opérationnels des principes développés tout au long de ce manuel. Les politiques deviennent applicables grâce aux règles d’authentification et d’autorisation. L’appétence pour le risque se concrétise au moyen des politiques d’accès conditionnel et des niveaux d’authentification. L’imputabilité devient démontrable grâce à l’attribution des actions et aux éléments probants. Le traitement des risques devient concret lorsque les accès excessifs sont retirés, que les voies d’accès privilégié sont restreintes et que les exceptions sont délibérément gouvernées, avec des responsables et des dates d’échéance. L’identité couvre également l’ensemble du cycle de vie de la cybersécurité. Avant un incident, elle réduit les accès inutiles et renforce l’authentification; pendant une intrusion, elle limite le déplacement latéral et l’élévation de privilèges; en détection, elle met au jour les authentifications et les utilisations de privilèges anormales; en intervention, elle permet de mettre fin aux sessions, d’effectuer la rotation des identifiants et de révoquer les jetons; et lors du rétablissement, des accès d’urgence gouvernés permettent au personnel autorisé de reprendre le contrôle sans renoncer à la gouvernance.

Pour les spécialistes de la gestion des technologies d’affaires, la conséquence pratique est que la GIA et la GAP doivent être gouvernées comme des disciplines continues de gestion des risques, et non mises en œuvre une seule fois comme des projets d’administration des comptes.

Questions que les gestionnaires et les conseils d’administration devraient poser

Les questions suivantes révèlent si la gouvernance des identités existe dans les faits ou seulement dans les politiques.

- Responsabilité : Qui est responsable des décisions relatives aux identités et aux accès pour chaque système important, et qui est autorisé à approuver les accès sensibles et privilégiés?
- Légitimité : Qu’est-ce qui constitue un accès légitime, et pouvons-nous expliquer pourquoi chaque droit d’accès à risque élevé existe?
- Authentification : Comment la robustesse de l’authentification est-elle adaptée au risque, et quelles identités privilégiées ou à risque élevé ne disposent toujours pas de méthodes résistantes à l’hameçonnage?
- Récupération : Un attaquant pourrait-il contourner l’authentification forte en passant par le centre d’assistance ou par le processus de récupération de compte?
- Moindre privilège : Combien de privilèges permanents subsistent, et diminuent-ils au profit d’une élévation limitée dans le temps?
- Séparation des tâches : Quelles combinaisons de droits incompatibles existent dans nos processus critiques, et comment les exceptions approuvées sont-elles surveillées et retirées?
- Cycle de vie : À quelle vitesse les accès changent-ils lorsque les rôles et les relations changent, y compris pour les contractuels et les fournisseurs?
- Tiers : Quelles parties externes détiennent des accès privilégiés, qui les parraine à l’interne et quand ces accès expirent-ils?
- Identités machines : Savons-nous combien d’identités non humaines nous avons, qui en est responsable et lesquelles sont privilégiées?
- Accès d’urgence : Quand nos comptes d’accès d’urgence ont-ils été testés pour la dernière fois, et saurions-nous immédiatement si l’un d’eux était utilisé?
- Éléments probants : Pourrions-nous reconstituer, à partir d’éléments probants protégés, chaque action privilégiée importante effectuée sur un système critique au cours du dernier trimestre?
- Assurance : Comment la direction sait-elle, indépendamment des équipes qui exploitent les contrôles, que l’environnement de GIA et de GAP fonctionne comme prévu?
L’objectif ultime n’est pas d’éliminer tous les risques liés aux identités. Pour fonctionner, les organisations doivent déléguer de l’autorité aux employés, aux administrateurs, aux fournisseurs, aux applications et aux processus automatisés. Le défi de gouvernance consiste à faire en sorte que cette autorité soit délibérée, proportionnée, restreinte, observable, vérifiable et révocable. La GIA détermine la façon dont l’autorité numérique est répartie dans l’ensemble de l’organisation; la GAP applique une gouvernance plus rigoureuse à ses formes les plus lourdes de conséquences. Ensemble, elles constituent l’un des fondements essentiels grâce auxquels la gouvernance de la cybersécurité devient opérationnelle, mesurable et défendable.

## Résumé du chapitre

L’identité est devenue l’un des plans de contrôle les plus importants de la cybersécurité, car les utilisateurs, les charges de travail, les fournisseurs et les API agissent désormais dans des environnements infonuagiques, SaaS et hybrides où le réseau n’est plus la principale frontière. Le chapitre soutient que la GIA et la GAP sont des domaines de gouvernance, et non des fonctions administratives : chaque identité numérique porte une autorité organisationnelle déléguée, la GIA détermine l’étendue de la distribution de cette autorité et la GAP en contrôle les formes les plus lourdes de conséquences. Lorsque la gouvernance des identités échoue, les attaquants n’ont pas besoin de déjouer les contrôles; ils héritent de l’autorité de les utiliser, de les modifier ou de les désactiver. Les gestionnaires doivent donc s’assurer que l’autorité numérique est délibérée, proportionnée, encadrée, observable, vérifiable et révocable.

Points clés à retenir

- La GIA encadre l’accès dans toute l’organisation, tandis que la GAP encadre les privilèges exceptionnels en son sein; l’accès privilégié peut modifier les mesures de protection qui s’imposent à tous les autres.
- Les défaillances liées à l’identité dominent les incidents parce que les identifiants sont des cibles exploitables à grande échelle, que la confiance s’étend au-delà de l’organisation, que les permissions s’accumulent, que les voies privilégiées échappent aux contrôles et que l’utilisation abusive ressemble à une activité légitime.
- Un programme mature procure une identité vérifiée, le moindre privilège, la séparation des tâches, la rigueur du cycle de vie et des éléments probants vérifiables; les politiques restent des vœux pieux tant que les contrôles d’identité ne les font pas respecter.
- L’accès est une décision de risque d’affaires mise en œuvre par la technologie; les droits décisionnels doivent donc être partagés entre une fonction centrale d’identité, les responsables métier et la surveillance exercée par les fonctions de risque, de conformité et d’audit.
- Le processus d’arrivées, de mutations et de départs devrait maintenir l’accès numérique en phase avec la réalité organisationnelle, en retirant les accès désuets à chaque changement de rôle et à chaque départ, y compris pour les identités non humaines.
- Toutes les formes d’AMF ne se valent pas : les identités à forte conséquence exigent une authentification résistante à l’hameçonnage, l’accès conditionnel, des niveaux d’authentification explicites et des processus de récupération qui ne sont jamais la voie la plus faible.
- L’autorisation détermine ce qu’une identité authentifiée peut faire; les modèles RBAC et ABAC doivent demeurer explicables, et les revues des accès n’ont de valeur que si leurs constatations mènent à un retrait ou à une acceptation formelle du risque.
- La séparation des tâches prévient les combinaisons de droits incompatibles, s’appuie sur des mécanismes préventifs et de détection et repose sur des contrôles compensatoires encadrés, comme le double contrôle, lorsque la séparation est irréalisable.
- L’accès des tiers doit relever d’un responsable interne, être propre à une fin précise, limité dans le temps et encadré par la GAP; déléguer l’accès ne transfère pas l’imputabilité.
- La GAP réduit au minimum les privilèges permanents, sépare les identités administratives, place les secrets en coffre-fort, surveille les sessions et restreint les voies administratives; l’accès d’urgence doit contourner les dépendances défaillantes, et non la gouvernance.
- Les charges de travail sont des identités : comptes de service, clés d’API, jetons, chaînes de déploiement et agents d’IA exigent des inventaires, des responsables, le moindre privilège, des identifiants de courte durée, une surveillance et un retrait.
- Des éléments probants fiables et protégés ainsi que des mesures de tendance liées à l’appétence pour le risque montrent si l’exposition diminue, et une feuille de route fondée sur les risques devrait définir ses jalons comme des résultats de réduction du risque.
Termes clés

- Gestion des identités et des accès (GIA) — Ensemble des politiques, processus, technologies, rôles et mécanismes de reddition de comptes servant à encadrer les identités numériques humaines et non humaines et leur accès aux ressources tout au long de leur cycle de vie.
- Gestion des accès privilégiés (GAP) — Domaine spécialisé de la gouvernance des identités qui contrôle les identités, les identifiants et les activités conférant une autorité élevée capable d’influer de façon importante sur les systèmes, les données, les paramètres de sécurité ou les résultats d’affaires.
- Principe du moindre privilège — Principe selon lequel une identité ne reçoit que l’accès nécessaire à un rôle, à une tâche ou à une fonction légitime, et rien de plus.
- Accumulation de privilèges — Accroissement graduel des permissions à mesure que des personnes et des systèmes changent de rôle ou de finalité sans que les accès désuets soient retirés.
- Arrivées, mutations et départs (JML) — Processus de cycle de vie qui crée, ajuste et retire les accès à mesure que des personnes arrivent dans l’organisation, changent de responsabilités et la quittent.
- Authentification résistante à l’hameçonnage — Authentification dans laquelle la cryptographie lie l’authentifiant au service légitime, de sorte que c’est le protocole, et non la vigilance de l’utilisateur, qui empêche la capture et la réutilisation, comme avec les clés FIDO2/WebAuthn ou les cartes à puce ICP.
- Niveau d’assurance de l’authentification (AAL) — Niveau de confiance, défini par la publication NIST SP 800-63-4, que la personne qui utilise une identité contrôle ses authentifiants; le niveau AAL3 exige un authentifiant résistant à l’hameçonnage et non exportable.
- Accès conditionnel — Politiques prédéfinies qui décident si l’accès est accordé et à quelles conditions, en fonction du rôle, de la robustesse de l’authentification, de l’état de l’appareil, du contexte, du risque et de la sensibilité de la ressource.
- Contrôle d’accès fondé sur les rôles (RBAC) — Modèle d’autorisation qui attribue des ensembles de permissions approuvés à des rôles définis, puis associe les identités à ces rôles.
- Contrôle d’accès fondé sur les attributs (ABAC) — Modèle d’autorisation qui décide de l’accès en fonction d’attributs de l’identité, de la ressource, de l’action et du contexte, comme l’état de l’appareil ou la classification des données.
- Combinaison de droits incompatibles — Ensemble de permissions légitimes prises isolément qui, combinées, permettent à une seule identité de mener à terme et de dissimuler un processus à risque élevé sans remise en question indépendante.
- Accès juste-à-temps (JIT) — Modèle de GAP dans lequel le privilège est accordé sur demande pour une fin approuvée et retiré automatiquement à la fin de la tâche ou de la plage horaire.
- Accès d’urgence (« bris de glace ») — Accès d’urgence encadré qui permet au personnel autorisé de reprendre le contrôle lorsque les voies normales d’identité ou d’administration font défaut, sans devenir un contournement permanent.
- Identité non humaine — Compte de service, identité de charge de travail, clé d’API, jeton, certificat, chaîne de déploiement ou autre identifiant machine semblable par lequel un logiciel exerce une autorité déléguée.
- Détection et intervention liées aux menaces d’identité (ITDR) — Terme de fournisseur désignant la détection liée à l’identité, comme une élévation de privilèges inhabituelle, une récupération suspecte, l’utilisation d’un compte inactif ou l’activation d’un compte d’urgence, corrélée avec d’autres éléments probants de sécurité.

## Questions de révision

Questions à développement

1. Le chapitre soutient que l’accès privilégié est une « autorité organisationnelle déléguée au sein des systèmes numériques » plutôt qu’une forme plus puissante d’accès ordinaire. Analysez cette affirmation et expliquez comment elle modifie la façon dont les gestionnaires devraient encadrer les administrateurs, les fournisseurs et les identités machines.

2. Évaluez l’énoncé selon lequel « une certification terminée prouve qu’un processus a été exécuté, et non que le risque lié à l’accès a été évalué avec compétence ». Concevez un processus de revue des accès et de séparation des tâches qui procurerait une assurance réelle dans un processus de paiements ou d’approvisionnement à paiement.

3. Une organisation déclare une couverture de l’AMF de 99 % et conclut que son risque lié à l’authentification est faible. À l’aide du chapitre, faites la critique de cette conclusion et recommandez une stratégie d’authentification, y compris des niveaux, la résistance à l’hameçonnage, l’accès conditionnel et la récupération.

4. Appliquez le chapitre à une organisation de votre choix (ou au fabricant québécois de la mise en situation). Déterminez ses risques liés à l’identité les plus lourds de conséquences, proposez une feuille de route priorisée de GIA et de GAP, et définissez trois jalons exprimés sous forme de résultats de réduction du risque.

5. Les identités non humaines et les agents d’IA exercent de plus en plus une autorité organisationnelle sans qu’aucune personne n’intervienne au moment de l’action. Évaluez pourquoi ils constituent souvent un angle mort de la gouvernance et proposez les contrôles, les éléments probants et les mesures que la direction devrait exiger.

Questions à choix multiples

Choisissez la meilleure réponse. Les réponses figurent à l’annexe « Réponses aux questions à choix multiples ».

1. Selon le chapitre, quelle est la distinction managériale la plus utile entre la GIA et la GAP?

A. La GIA encadre l’accès dans toute l’organisation, tandis que la GAP encadre les privilèges exceptionnels en son sein

B. La GIA encadre les comptes des employés, tandis que la GAP encadre tous les comptes des fournisseurs et des contractuels

C. La GIA est un processus d’affaires, tandis que la GAP est une fonction purement technique relevant des TI

D. La GIA couvre les services infonuagiques, tandis que la GAP couvre les serveurs et les appareils réseau sur place

2. Pourquoi le chapitre décrit-il l’accès privilégié comme davantage qu’une forme plus puissante d’accès ordinaire?

A. Il exige toujours des jetons matériels qui ne sont jamais remis aux utilisateurs ordinaires

B. Il constitue une autorité organisationnelle déléguée qui peut modifier les mesures de protection imposées aux autres utilisateurs

C. Il appartient légalement au service des TI plutôt qu’aux unités d’affaires

D. Il n’est utilisé qu’en situation d’urgence et est autrement désactivé par défaut

3. Laquelle des propositions suivantes fait partie des cinq raisons structurelles que donne le chapitre pour expliquer que les défaillances liées à l’identité dominent le paysage des incidents?

A. Les algorithmes de chiffrement qui protègent les mots de passe stockés sont couramment cassés par les attaquants

B. Les pare-feu ne peuvent pas inspecter le trafic une fois que les utilisateurs se connectent à distance

C. Les permissions s’accumulent avec le temps, car leur retrait reçoit moins d’attention que leur attribution

D. Les plateformes d’identité sont rarement incluses dans les contrats de soutien des fournisseurs

4. Dans le modèle opérationnel de GIA à trois niveaux du chapitre, quel niveau devrait juger si un employé a réellement besoin d’accéder à une ressource d’affaires?

A. La fonction centrale d’identité, parce qu’elle exploite les plateformes et les flux de travail d’identité

B. L’audit interne, parce qu’il fournit une assurance indépendante sur les décisions d’accès

C. Le centre d’assistance, parce qu’il reçoit et traite la plupart des demandes d’accès

D. Les responsables métier, parce que l’accès est une décision de risque d’affaires mise en œuvre par la technologie

5. Une analyste passe des comptes fournisseurs à la trésorerie. Selon la rigueur du processus d’arrivées, de mutations et de départs, que devrait déclencher ce changement de rôle?

A. L’attribution des accès à la trésorerie, en conservant les accès antérieurs au cas où ils seraient nécessaires

B. La suppression complète du compte et une nouvelle identité, sans revue des approbations antérieures

C. Aucun changement avant la fin de la prochaine campagne annuelle de certification des accès

D. L’attribution des accès à la trésorerie et le retrait des accès aux comptes fournisseurs qui ne sont plus justifiés

6. Pourquoi le chapitre prévient-il que les approbations d’AMF par notification ne résistent pas à l’hameçonnage?

A. Les notifications ne peuvent pas être livrées aux appareils mobiles hors du réseau de l’entreprise

B. Les approbations par notification stockent le mot de passe de l’utilisateur en clair sur l’appareil mobile

C. Les attaquants peuvent envoyer des demandes répétées jusqu’à ce que l’utilisateur en accepte une, un schéma appelé fatigue AMF

D. Les méthodes par notification ne sont reconnues à aucun niveau d’assurance par la publication NIST SP 800-63-4

7. Selon la publication NIST SP 800-63-4 telle que décrite dans le chapitre, comment les clés d’accès synchronisées sont-elles traitées?

A. Acceptables au niveau AAL3, parce qu’elles résistent à l’hameçonnage et sont pratiques pour les utilisateurs

B. Acceptables au niveau AAL2, mais pas au niveau AAL3, qui exige un authentifiant résistant à l’hameçonnage et non exportable

C. Inacceptables à tout niveau, parce qu’elles peuvent être copiées d’un appareil à l’autre

D. Acceptables uniquement pour la vérification d’identité, et non pour l’authentification ou la fédération

8. Une organisation déploie des clés résistantes à l’hameçonnage pour ses administrateurs, mais le centre d’assistance réinitialise les comptes dès qu’un appelant répond à quelques questions personnelles simples. Quelle faiblesse cela illustre-t-il?

A. La récupération est devenue une voie de contournement des contrôles d’authentification robustes

B. Les politiques d’accès conditionnel ont été configurées de façon trop stricte pour les administrateurs

C. L’explosion des rôles a rendu les rôles d’administrateur trop difficiles à réviser

D. La fédération a étendu la confiance à un fournisseur d’identité externe non géré

9. Quel énoncé décrit le mieux le risque de gouvernance que pose l’explosion des rôles dans le RBAC?

A. Les rôles deviennent si larges que chaque utilisateur finit par recevoir des permissions d’administrateur par défaut

B. Il existe tant de rôles étroits qu’ils sont presque aussi difficiles à encadrer que les permissions elles-mêmes

C. Les rôles sont entièrement remplacés par des attributs, ce qui rend les décisions d’accès imprévisibles et difficiles à auditer

D. Les rôles sont supprimés automatiquement chaque fois que les processus d’affaires changent ou que l’organisation se restructure

10. Selon le chapitre, quelle est la principale préoccupation de gouvernance liée à l’ABAC?

A. Les attributs qui se chevauchent et les politiques conditionnelles peuvent être difficiles à prévoir, à tester et à auditer

B. Il ne peut pas utiliser le contexte, comme l’état de l’appareil, l’emplacement ou la robustesse de l’authentification

C. Il exige que chaque utilisateur soit affecté en tout temps à un seul et unique rôle

D. Il est interdit par l’ISO/IEC 27002:2022 pour les systèmes contenant de l’information sensible

11. Une unité d’affaires déclare un taux d’achèvement de 100 % de ses certifications trimestrielles des accès, mais presque aucun accès n’a été retiré. Que devrait conclure la direction, selon le chapitre?

A. Le modèle d’accès est propre; les revues peuvent donc passer sans risque d’une fréquence trimestrielle à annuelle

B. Les réviseurs font du bon travail; le suivi des mesures correctives n’est donc plus nécessaire

C. La fréquence des revues est trop élevée et crée un travail administratif inutile

D. L’achèvement montre que le processus a été exécuté, mais non que le risque lié à l’accès a été évalué avec compétence

12. Quelle combinaison constitue l’exemple le plus clair de combinaison de droits incompatibles dans un processus d’approvisionnement à paiement?

A. Un utilisateur peut consulter les fiches des fournisseurs et aussi imprimer des rapports de bons de commande

B. Un utilisateur peut soumettre des demandes de remboursement de dépenses et aussi consulter son propre historique de paiements

C. Un utilisateur peut créer un nouveau fournisseur et aussi libérer des paiements à ce fournisseur

D. Un utilisateur peut mettre à jour ses propres coordonnées et aussi réinitialiser son mot de passe

13. Comment le chapitre relie-t-il la séparation des tâches au triangle de la fraude présenté au chapitre 1?

A. La séparation des tâches réduit la rationalisation en obligeant les employés à signer une déclaration éthique annuelle

B. La séparation des tâches réduit la pression en répartissant plus également la charge de travail entre les équipes des finances

C. La séparation des tâches réduit l’occasion, la condition de fraude sur laquelle les contrôles peuvent le plus directement agir

D. La séparation des tâches élimine les trois conditions de la fraude dès que des règles préventives de conflit sont en place

14. Quel principe le chapitre énonce-t-il au sujet de la gouvernance de l’accès des tiers?

A. Les fournisseurs deviennent entièrement imputables de tout accès accordé en vertu d’un contrat signé

B. Les identités fédérées des partenaires n’exigent aucune gouvernance interne une fois la confiance configurée

C. L’accès externe devrait être permanent pour éviter de perturber le soutien essentiel des fournisseurs

D. Déléguer l’accès ne transfère pas l’imputabilité; l’accès externe demeure à l’intérieur de notre périmètre de risque

15. Quelle pratique reflète le mieux l’objectif de la GAP de réduire les privilèges permanents?

A. Accorder une élévation limitée dans le temps pour une tâche approuvée et la retirer automatiquement par la suite

B. Donner des droits permanents à tous les administrateurs, mais enregistrer leurs sessions en vidéo

C. Partager un seul mot de passe d’administrateur au sein de l’équipe et le changer chaque année

D. Attribuer des droits d’administration aux identités ordinaires de courriel et de navigation des utilisateurs

16. Quel énoncé traduit le principe du chapitre au sujet de l’accès d’urgence (« bris de glace »)?

A. Il devrait reposer sur le fournisseur d’identité principal afin de demeurer entièrement cohérent

B. Il devrait contourner les dépendances défaillantes, et non la gouvernance elle-même

C. Il devrait être connu de tous les administrateurs afin d’être toujours disponible en situation de crise

D. Il devrait être exclu de la surveillance afin que les attaquants ne puissent pas détecter son existence

17. Pourquoi le chapitre soutient-il que le moindre privilège importe encore plus pour les identités machines que pour les personnes?

A. Un processus automatisé doté de privilèges excessifs peut s’exécuter des milliers de fois par jour et bénéficier d’une confiance implicite

B. Les identités machines sont toujours exemptées de journalisation; leur activité ne peut donc pas être observée

C. Les identités machines ne peuvent jamais être classées comme privilégiées dans le modèle de GAP

D. Les identités machines utilisent toujours une authentification résistante à l’hameçonnage et sont donc rarement compromises

18. Les journaux de l’activité privilégiée sont stockés sur une plateforme que les mêmes administrateurs de domaine peuvent modifier et supprimer. Quel est le principal problème d’assurance?

A. Les journaux sont probablement trop petits pour soutenir une enquête criminalistique complète

B. Les journaux seront conservés trop longtemps et contreviendront à toutes les exigences en matière de vie privée

C. Les éléments probants peuvent être altérés par les identités dont ils consignent les actions

D. Les journaux consignent l’activité dans un format que les gestionnaires ne peuvent pas lire directement

19. Au sens du chapitre, laquelle des mesures suivantes est une mesure d’efficacité plutôt qu’une mesure d’activité?

A. Dix mille revues des accès effectuées au cours de l’année

B. 95 % des permissions inappropriées corrigées dans un délai de 30 jours

C. Cinq cents demandes d’accès privilégié traitées au cours du trimestre

D. Deux mille réinitialisations de mots de passe traitées par le centre de services

20. Dans la mise en situation du fabricant québécois, pourquoi le CSI a-t-il réordonné la feuille de route de GIA proposée par le fournisseur?

A. Le conseil d’administration a refusé de financer tout travail d’ingénierie des rôles dans ses applications

B. Les organismes de réglementation exigeaient le déploiement de la GAP avant tout autre contrôle d’identité

C. Le fournisseur en impartition ne pouvait pas prendre en charge le modèle d’accès fondé sur les rôles du PGI

D. Deux scénarios dépassaient l’appétence pour le risque; les voies d’accès les plus lourdes de conséquences ont donc été traitées en premier
