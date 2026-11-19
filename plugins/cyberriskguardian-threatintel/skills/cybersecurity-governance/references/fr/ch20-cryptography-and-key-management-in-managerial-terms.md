<!-- Léger, M.-A. (2026). Introduction à la gouvernance de la cybersécurité pour la gestion des technologies d’affaires (3e éd., v2.51). Chapitre 20 : La cryptographie et la gestion des clés expliquées aux gestionnaires. CC BY-NC 4.0 -->

# Chapitre 20 : La cryptographie et la gestion des clés expliquées aux gestionnaires

## Résultats d’apprentissage

Au terme de ce chapitre, vous devriez être en mesure de :

1. Distinguer les objectifs de confidentialité, d’intégrité et d’authenticité de la cryptographie et expliquer ce contre quoi le chiffrement protège et ne protège pas.

2. Appliquer un schéma de classification de l’information pour définir les attentes cryptographiques à l’égard des données en transit, au repos, en cours d’utilisation, ainsi que dans les journaux et les copies.

3. Expliquer le cycle de vie des clés, les hiérarchies de clés, les HSM et les services de gestion des clés, ainsi que le rôle de la séparation des tâches et du double contrôle.

4. Comparer les clés gérées par le fournisseur, les clés gérées par le client, le BYOK, les HSM dédiés et le HYOK sur le plan du contrôle, de la responsabilité et des nouveaux modes de défaillance.

5. Évaluer les dispositions de séquestre de clés, de récupération et d’accès légal comme des compromis documentés entre la continuité, le risque interne et la conformité juridique.

6. Analyser la gouvernance des certificats et de l’ICP à la lumière du raccourcissement de la durée de vie des certificats, et recommander des mesures de responsabilité, d’inventaire et d’automatisation.

7. Concevoir un programme de migration post-quantique comportant un inventaire cryptographique, une priorisation, l’agilité cryptographique, des exigences envers les fournisseurs et une reddition de comptes au conseil d’administration au regard des jalons publics.

8. Recommander des éléments probants, des indicateurs clés de risque et des mesures d’intégration à la protection des renseignements personnels qui rendent les affirmations cryptographiques défendables devant les auditeurs et les organismes de réglementation.

Dans la plupart des organisations, le chiffrement apparaît dans les politiques sous la forme d’une exigence d’une ligne : les données sensibles doivent être chiffrées. La phrase semble rassurante, et les auditeurs l’acceptent souvent telle quelle. Pourtant, elle masque les décisions qui déterminent réellement si l’organisation est protégée : quelles données, à quels endroits et dans quels états, avec la technologie de qui, sous le contrôle de qui, avec quelles modalités de récupération, et à quelles conditions l’organisation déchiffrera de l’information pour un tribunal, un organisme de réglementation ou une enquête interne. Une politique qui ne répond à aucune de ces questions n’est pas un contrôle. C’est une aspiration.

La cryptographie n’est pas seulement une mesure de protection technique; c’est un instrument de gouvernance. Elle détermine qui peut voir quoi, dans quelles circonstances et avec quelle piste de preuve. Elle sous-tend aussi la confiance entre les machines, les logiciels et les personnes. La gestion des clés est le mécanisme pratique par lequel ce pouvoir s’exerce. Les clés déterminent si l’information est accessible, récupérable ou irrémédiablement perdue. Elles déterminent aussi si l’organisation peut donner suite aux demandes légales, préserver la preuve, démontrer ses mesures de protection à un organisme de réglementation en matière de vie privée ou réagir à la fraude et aux abus commis par des initiés.

Pour les gestionnaires des technologies d’affaires, le message central de ce chapitre est que la cryptographie et la gestion des clés exigent des choix de gouvernance explicites. Ces choix ont une incidence sur la protection des renseignements personnels, la conformité réglementaire, la résilience opérationnelle, le risque lié aux initiés, la dépendance à l’infonuagique et la relation de l’organisation avec les organismes de réglementation et les forces de l’ordre. Lorsque ces choix sont entièrement laissés aux équipes techniques ou aux paramètres par défaut des fournisseurs, l’organisation peut se retrouver conforme sur papier, mais fragile ou surexposée dans la pratique. Certaines des défaillances cryptographiques les plus perturbatrices que vivent les organisations ne sont pas du tout causées par des algorithmes compromis; elles sont causées par un certificat expiré dont personne n’était responsable, une clé qui n’a pas pu être récupérée ou un secret oublié dans un dépôt de code source.

Le chapitre s’appuie sur plusieurs discussions antérieures. Les chapitres 1 et 4 ont présenté le risque comme l’interaction de la menace, de la vulnérabilité et de l’exposition — le triangle du risque —, et les chapitres 5 et 6 ont montré comment exprimer cette interaction sous forme de scénarios que les gestionnaires peuvent évaluer et prioriser. Le chapitre 10 a traité de la gestion des identités et des accès, étroitement liée à la cryptographie puisque les clés et les certificats sont, en fait, les identités des machines. Le chapitre 15 a examiné le modèle de responsabilité partagée dans le nuage, et le chapitre 16 a abordé les obligations relatives à la protection des données et des renseignements personnels. Le présent chapitre ne reprend pas ces discussions; il montre où s’y situent les décisions cryptographiques et ce que les gestionnaires doivent décider, prendre en charge et étayer par des éléments probants.

Le chapitre suit une séquence qui reflète les questions qu’un gestionnaire devrait poser. Il commence par ce que le chiffrement permet et ne permet pas d’accomplir, puis aborde ce qui devrait être chiffré et dans quels états des données. Il explique la gestion des clés dans le langage de la gestion, précise la responsabilité et l’imputabilité, et examine les clés gérées par le client dans les environnements infonuagiques. Il traite ensuite du séquestre, de la récupération et de l’accès légal; des certificats et de la confiance entre machines, y compris l’évolution de l’industrie vers des durées de vie des certificats beaucoup plus courtes; et de la transition vers la cryptographie post-quantique, qui constitue désormais un programme de gouvernance pluriannuel assorti de jalons publics. Il se termine par la mesure et l’assurance, les liens avec les obligations relatives à la vie privée et aux transferts transfrontaliers, ainsi qu’une synthèse accompagnée de questions que les gestionnaires et les conseils d’administration devraient poser.

## Ce que fait le chiffrement, et ce qu’il ne fait pas

Pour gouverner la cryptographie, les gestionnaires n’ont pas besoin de comprendre les mathématiques des algorithmes. Ils doivent toutefois saisir de façon claire et réaliste ce que permettent les contrôles cryptographiques, parce que l’excès de confiance comme la sous-utilisation coûtent cher. L’excès de confiance entretient la croyance rassurante selon laquelle des données chiffrées sont des données en sécurité, ce qui amène les organisations à négliger le contrôle d’accès et la surveillance. La sous-utilisation produit une exposition évitable lorsque des ordinateurs portables perdus, des sauvegardes volées ou du trafic intercepté révèlent de l’information qui aurait facilement pu être protégée.

Trois fonctions de la cryptographie

La cryptographie soutient trois objectifs de sécurité distincts, et il est utile pour les gestionnaires de les garder séparés. Le premier est la confidentialité : le chiffrement transforme des données lisibles en une forme que seuls les détenteurs de la bonne clé peuvent inverser. Le deuxième est l’intégrité : les empreintes cryptographiques et les codes d’authentification de message permettent à un destinataire de détecter si des données ont été modifiées pendant leur stockage ou leur transmission. Le troisième est l’authenticité et la non-répudiation : les signatures numériques permettent à une partie de prouver qu’un message, un document, une transaction ou un paquet logiciel provient d’un détenteur de clé précis et n’a pas été modifié depuis sa signature.

Ces objectifs correspondent à des besoins d’affaires différents. La confidentialité protège les dossiers clients, les secrets commerciaux et les renseignements personnels. L’intégrité protège les transactions financières, les fichiers de configuration et les éléments de preuve qui pourraient plus tard être présentés à un tribunal ou à un organisme de réglementation. L’authenticité protège les chaînes d’approvisionnement logicielles, les approbations électroniques et les connexions entre les systèmes. Une politique qui ne parle que de « chiffrement » ne traite donc qu’une seule de ces trois fonctions. Lorsqu’ils examinent les normes cryptographiques, les gestionnaires devraient se demander si les exigences d’intégrité et d’authenticité ont été définies avec le même soin que les exigences de confidentialité, en particulier pour les flux de paiement, les publications de logiciels et les journaux d’audit.

Ce contre quoi le chiffrement protège

Lorsqu’il est appliqué correctement, le chiffrement empêche les personnes qui ne possèdent pas la clé de lire les données, même si elles obtiennent le support de stockage physique, interceptent le trafic réseau ou accèdent à l’infrastructure sous-jacente. Il est particulièrement efficace contre certaines catégories d’incidents : vol ou perte d’appareils, compromission ou élimination inadéquate de supports de stockage, interception sur des réseaux non fiables comme le Wi-Fi public, et certaines formes de compromission de la couche d’hébergement ou de l’infrastructure infonuagique. Dans ces scénarios, le chiffrement modifie de façon spectaculaire le volet impact du triangle du risque. Un attaquant qui vole un disque chiffré sans la clé n’obtient, en pratique, rien de valeur.

C’est pourquoi les autorités de protection de la vie privée et les régimes d’avis de violation de données traitent souvent différemment les données correctement chiffrées. Si les clés n’ont pas été compromises, la probabilité qu’une perte cause un préjudice est considérablement réduite. Comme nous le verrons plus loin dans ce chapitre, ce traitement dépend entièrement de la qualité de la gestion des clés. Un chiffrement dont la clé se trouve sur le même ordinateur portable volé, dans un fichier de configuration à côté de la base de données ou dans les notes non protégées d’un administrateur offre beaucoup moins qu’il n’y paraît.

Les limites du chiffrement

Le chiffrement ne protège pas les données contre tout. Il ne protège pas contre l’utilisation abusive par des utilisateurs autorisés, y compris des initiés qui agissent par malveillance ou par négligence, parce que les utilisateurs autorisés voient, par conception, les données déchiffrées. Il ne protège pas contre les attaques qui exploitent la logique applicative pendant que l’application déchiffre légitimement les données; une faille d’injection dans une application Web renverra des enregistrements en clair, peu importe la façon dont la base de données est chiffrée en dessous. Il ne compense pas une gestion des identités et des accès déficiente, des terminaux mal sécurisés ou des processus d’affaires mal conçus. Et il ne garantit pas, à lui seul, la disponibilité : les criminels qui utilisent des rançongiciels emploient eux aussi un chiffrement robuste, et une organisation qui perd ses propres clés s’est, en pratique, attaquée elle-même.

Il existe aussi une limite temporelle, devenue un enjeu de gouvernance à part entière. Le chiffrement protège les données aussi longtemps que l’algorithme et la longueur de clé demeurent suffisamment robustes. L’information qui doit rester confidentielle pendant des décennies, comme les dossiers de santé, les identifiants gouvernementaux, la propriété intellectuelle ou l’information liée à la défense, peut être captée aujourd’hui et déchiffrée plus tard si les algorithmes s’affaiblissent. C’est la logique qui sous-tend la transition post-quantique abordée plus loin dans ce chapitre.

Le chiffrement déplace le risque plutôt que de l’éliminer : il concentre la protection des données dans la protection des clés, de sorte que quiconque contrôle les clés contrôle les données.

Deux questions d’ancrage

Une discipline utile consiste à poser deux questions pour chaque système ou ensemble de données important. Premièrement : contre quelles menaces attendons-nous de la cryptographie qu’elle nous protège? Deuxièmement : à quels endroits les données doivent-elles se trouver sous une forme utilisable, déchiffrée, et quelles protections existent à ces endroits? La première question rattache la cryptographie à l’évaluation des risques fondée sur des scénarios, de sorte que le chiffrement soit justifié par des menaces précises plutôt que par habitude. La deuxième question met au jour les endroits où le chiffrement s’arrête et où d’autres contrôles doivent prendre le relais, comme le contrôle d’accès, la surveillance, la prévention des pertes de données et la sécurité des applications.

Appliquées de façon cohérente, ces questions maintiennent la cryptographie ancrée dans un raisonnement fondé sur le risque plutôt que dans des présomptions. Elles rendent aussi les échanges avec les fournisseurs plus précis : un fournisseur qui affirme que « toutes les données sont chiffrées » devrait pouvoir expliquer contre quelles menaces cela protège, où les données sont déchiffrées et qui détient les clés. Si l’explication est vague, l’assurance est faible.

## Que faut-il chiffrer? Une approche fondée sur la classification

En principe, toute l’information sensible devrait être chiffrée en transit et au repos. En pratique, les organisations doivent tout de même établir des priorités, parce que certains dépôts de données, processus et intégrations ont plus de conséquences que d’autres, et parce que les contrôles cryptographiques entraînent des coûts opérationnels : effort de gestion des clés, considérations de performance, contraintes de compatibilité et risque de pannes auto-infligées. L’approche la plus facile à gérer consiste à dériver les attentes cryptographiques du schéma de classification de l’information de l’organisation, que le chapitre 16 a présenté comme un fondement de la protection des données.

Arrimer les attentes cryptographiques à la classification

Les organisations distinguent habituellement plusieurs niveaux d’information : public, interne, confidentiel et restreint ou hautement confidentiel. Les exigences cryptographiques devraient être exprimées pour chaque niveau, afin que les responsables des systèmes, les architectes et les fournisseurs puissent déterminer ce qui est attendu sans négocier chaque cas. Le tableau ci-dessous illustre une façon d’exprimer ces attentes; les exigences réelles devraient refléter l’appétence pour le risque, le contexte réglementaire et l’environnement technique de l’organisation.

Classification

Exemples types

Attente cryptographique

Restreint

Données de cartes de paiement, dossiers de santé, identifiants gouvernementaux, clés et secrets

Chiffrement robuste partout; clés dans un HSM ou un KMS géré; séparation stricte des tâches

Confidentiel

Données clients, dossiers des ressources humaines, contrats, données financières internes

Chiffrement en transit et au repos; clés gérées; journalisation de l’utilisation des clés

Interne

Documents opérationnels, communications internes

Chiffrement de plateforme par défaut; chiffrement standard du transport

Public

Rapports publiés, contenu marketing

Protection de l’intégrité et de l’authenticité du contenu publié

L’information restreinte devrait faire l’objet d’un chiffrement robuste par défaut, où qu’elle se trouve ou circule. Cela comprend habituellement les données de cartes de paiement, les coordonnées bancaires, les identifiants gouvernementaux, les renseignements sur la santé, les renseignements personnels sensibles au sens de la Loi 25 du Québec et d’autres lois sur la protection des renseignements personnels, les secrets commerciaux et les algorithmes exclusifs, les données de configuration des systèmes critiques, les clés de chiffrement et les secrets d’authentification eux-mêmes, ainsi que certaines catégories de journaux, comme ceux qui contiennent des identifiants personnels ou des jetons de session. L’information confidentielle devrait aussi être chiffrée, surtout au repos dans les environnements multilocataires ou infonuagiques, parce que l’organisation ne contrôle pas qui d’autre partage l’infrastructure sous-jacente.

L’information interne peut justifier un chiffrement selon le contexte. Dans les environnements modernes, le coût marginal du chiffrement des volumes de stockage et du trafic réseau est faible, de sorte que les organisations considèrent de plus en plus le chiffrement au repos et en transit comme la norme, même pour les catégories moins sensibles. L’information publique rappelle utilement que la cryptographie ne sert pas seulement au secret : un rapport annuel publié, un logiciel téléchargeable ou un flux de données public bénéficie d’une protection de l’intégrité et de l’authenticité, afin que les destinataires puissent avoir confiance qu’il n’a pas été modifié.

Sauvegardes, archives et secrets

Deux domaines exigent une attention particulière parce qu’ils sont souvent négligés. Le premier est celui des sauvegardes et des archives. Elles contiennent souvent le portrait historique le plus complet des données sensibles et constituent des cibles de choix dans les scénarios de rançongiciel et d’extorsion de données, comme l’a montré le chapitre 12. Si les sauvegardes ne sont pas chiffrées, correctement isolées et protégées par des clés elles-mêmes récupérables, la dernière ligne de défense de l’organisation est plus faible que ses systèmes de production. Un piège particulier est la sauvegarde dont la clé n’est stockée que dans l’environnement même qui est sauvegardé.

Le deuxième domaine est celui des secrets de machine à machine : clés d’interface de programmation d’applications (API), mots de passe de comptes de service, jetons d’accès, chaînes de connexion aux bases de données et fichiers de configuration qui intègrent des identifiants. Ces secrets sont du matériel cryptographique en tout point sauf le nom. Ils devraient être stockés dans des systèmes dédiés de gestion des secrets, chiffrés au repos, renouvelés périodiquement et traités avec le même sérieux que les identifiants des utilisateurs privilégiés. Les secrets exposés dans les dépôts de code, les images de conteneurs et les outils de collaboration demeurent un point d’entrée courant pour les attaquants, et ils sont faciles à mesurer, ce qui en fait un bon candidat pour un indicateur clé de risque (ICR).

Chiffrement par défaut et exceptions encadrées

Le principe managérial est simple : si l’exfiltration d’une catégorie de données causait un préjudice grave ou une exposition réglementaire, cette catégorie devrait être chiffrée dès la conception, où qu’elle se trouve ou circule, et non à titre d’option discrétionnaire. En pratique, cela se traduit par un petit nombre de mécanismes de gouvernance. Les exigences de chiffrement devraient être intégrées aux bases de référence de sécurité et aux normes de configuration (chapitre 14) afin de s’appliquer automatiquement aux nouveaux systèmes. Les revues d’architecture devraient vérifier que les conceptions satisfont à l’exigence avant le déploiement. Et les exceptions devraient être traitées selon le même processus que les autres exceptions aux contrôles : documentées, soumises à une évaluation des risques, approuvées par le responsable du risque imputable, assorties de contrôles compensatoires et dotées d’une date d’échéance.

Les exceptions ne sont pas rares en pratique. Les systèmes patrimoniaux peuvent ne pas prendre en charge le chiffrement moderne; les appareils industriels et médicaux peuvent avoir une capacité de traitement limitée (voir le chapitre 11); certaines charges de travail analytiques peuvent avoir été conçues pour des données en clair. L’échec de gouvernance ne tient pas à l’existence de telles exceptions, mais à leur invisibilité. Une organisation qui sait où se trouvent ses données restreintes non chiffrées, pourquoi et jusqu’à quand, est dans une position beaucoup plus défendable qu’une organisation qui présume simplement que sa politique est respectée.

## Là où le chiffrement compte : en transit, au repos, en cours d’utilisation et dans les journaux

La cryptographie intervient dans plusieurs états des données, chacun ayant ses propres menaces, technologies et questions de gouvernance. Les gestionnaires n’ont pas besoin de configurer ces technologies, mais ils devraient comprendre suffisamment les distinctions pour reconnaître quand une affirmation selon laquelle les données sont « chiffrées » ne couvre qu’un seul état et en laisse d’autres exposés. La figure ci-dessous résume les quatre domaines abordés dans cette section.

Figure 81 : les états des données et les questions de gouvernance que soulève le chiffrement

En transit

Le chiffrement en transit protège les données pendant qu’elles circulent sur les réseaux entre les utilisateurs, les systèmes et les services. La décision managériale ne consiste plus à savoir s’il faut l’utiliser; selon la pratique moderne, tout le trafic externe et la plus grande partie du trafic interne devraient être protégés. Les vraies questions portent sur la cohérence et l’assurance. Les gestionnaires devraient s’attendre à ce que le trafic Web et d’API utilise des versions actuelles du protocole TLS (Transport Layer Security), les anciennes versions du protocole étant désactivées; à ce que les sessions d’administration et d’accès à distance soient protégées; à ce que les courriels échangés entre organisations soient chiffrés lorsque c’est possible; et à ce que les communications entre services dans les environnements infonuagiques et de conteneurs soient soit chiffrées, soit adéquatement restreintes et surveillées.

Deux faiblesses reviennent en pratique. La première est le réseau interne considéré comme fiable, où le trafic entre les systèmes du centre de données ou entre les microservices circule en clair parce qu’il ne quitte jamais le périmètre de l’entreprise. Les architectures à vérification systématique, abordées au chapitre 13, rejettent cette hypothèse. La deuxième est l’inspection : de nombreuses organisations déchiffrent le trafic au niveau de serveurs mandataires ou de passerelles de sécurité pour y rechercher des menaces, puis le chiffrent de nouveau. Cette pratique est légitime, mais elle crée des points où les données sont en clair et où des clés puissantes sont concentrées. Ces points doivent être repérés, justifiés et encadrés, y compris du point de vue de la protection de la vie privée lorsque le trafic du personnel est inspecté.

Au repos

Le chiffrement au repos protège les données stockées sur des disques, dans des bases de données, dans des systèmes de fichiers et dans des magasins d’objets. De nombreuses plateformes offrent un chiffrement transparent, où les données sont chiffrées sur le disque, mais déchiffrées automatiquement pour toute application ou tout utilisateur qui y a accès. Cette protection est précieuse dans certains scénarios, comme la perte de disques, le vol de sauvegardes, l’élimination inadéquate de supports et certaines compromissions d’infrastructure. Elle ne protège pas contre l’utilisation abusive par des applications ou des utilisateurs authentifiés, parce que la plateforme déchiffre les données pour eux.

Pour cette raison, les gestionnaires devraient considérer le chiffrement du stockage comme une base de référence nécessaire, et non comme l’aboutissement. Pour les données restreintes, des couches supplémentaires peuvent être appropriées : un chiffrement au niveau de la base de données ou des champs, qui garde les attributs les plus sensibles chiffrés même pour les administrateurs de bases de données; un chiffrement au niveau de l’application, où seule l’application détient les clés; ou la tokenisation, qui remplace les valeurs sensibles par des substituts. Chaque couche supplémentaire accroît la protection contre certaines menaces internes et applicatives, mais elle accroît aussi la complexité, le coût et les conséquences d’une perte de clé. Le bon choix dépend du scénario à atténuer, et c’est précisément pourquoi l’évaluation des risques devrait orienter la décision.

En cours d’utilisation : l’informatique confidentielle

Les données doivent normalement être déchiffrées en mémoire pour être traitées, ce qui signifie que quiconque contrôle le matériel, l’hyperviseur ou le système d’exploitation sous-jacent pourrait, en principe, les observer. L’informatique confidentielle comble cette lacune. Le Confidential Computing Consortium, un projet de la Linux Foundation, la définit comme la protection des « données en cours d’utilisation par l’exécution des calculs dans un environnement d’exécution de confiance (Trusted Execution Environment) matériel et attesté ». Concrètement, des fonctions spécialisées du processeur isolent une charge de travail de sorte que même les administrateurs du fournisseur infonuagique ou un hôte compromis ne puissent en lire la mémoire, et l’attestation à distance permet au client de vérifier cryptographiquement que la charge de travail s’exécute dans un véritable environnement protégé avant de lui communiquer des clés.

L’informatique confidentielle est maintenant offerte par les principaux fournisseurs infonuagiques et sert à des charges de travail comme l’analytique multipartite sur des données sensibles, le traitement de renseignements financiers ou de santé réglementés et la protection des modèles d’IA ainsi que des données utilisées pour les entraîner ou les interroger (voir le chapitre 18). Elle n’est toutefois pas une solution universelle. La veille technologique du Contrôleur européen de la protection des données souligne que la protection contre les attaques par canal auxiliaire, les attaques physiques sophistiquées et la compromission de la chaîne d’approvisionnement varie selon la technologie, et que la confiance repose en définitive sur le fabricant du matériel. Pour les gestionnaires, l’enjeu de gouvernance est que l’informatique confidentielle constitue une option crédible pour les charges de travail hautement sensibles pour lesquelles l’accès au niveau de l’infrastructure représente une menace importante, et que son adoption devrait être une décision fondée sur les risques, assortie d’exigences claires en matière d’éléments probants, notamment les registres d’attestation.

Journaux, télémétrie et copies

Les journaux et la télémétrie présentent une réelle tension. Ils sont essentiels à la surveillance de la sécurité, à l’audit, aux enquêtes et aux opérations, mais ils peuvent laisser fuir des données sensibles s’ils ne sont pas traités avec soin. Les applications consignent fréquemment des renseignements personnels, des jetons de session, voire des mots de passe, dans les journaux de débogage; les outils de sécurité recueillent de grands volumes de données sur l’activité des utilisateurs; et les journaux sont souvent transmis à des plateformes de tiers. Une approche soucieuse de la gouvernance exige que les journaux contenant des renseignements personnels ou des secrets soient protégés dans leur stockage, que l’accès à ceux-ci soit restreint et surveillé, que leur conservation respecte les exigences juridiques et de protection de la vie privée, et que les normes de journalisation interdisent d’emblée la consignation de secrets.

Les journaux ont aussi une dimension d’intégrité. Si un attaquant ou un initié malhonnête peut modifier les journaux, l’organisation perd sa capacité à reconstituer les événements et à présenter des éléments de preuve crédibles. La protection cryptographique de l’intégrité, le stockage non réinscriptible et la transmission vers une plateforme administrée séparément rendent les journaux plus fiables. Le même raisonnement s’applique aux nombreuses copies de données que les organisations créent pour les essais, l’analytique et la production de rapports. Une base de données de production soigneusement chiffrée, mais copiée en clair dans un environnement de développement, n’est pas, en pratique, protégée.

Dans chacun de ces domaines, les questions managériales essentielles sont les mêmes : qu’est-ce qui est protégé, qui peut déchiffrer, où les clés sont-elles stockées, et comment l’accès aux clés est-il encadré et attesté par des éléments probants?

## Les fondements de la gestion des clés en langage managérial

Le chiffrement sans gestion des clés est une illusion. Les clés sont l’expression concrète du pouvoir cryptographique : quiconque détient une clé peut lire ce qu’elle protège, signer au nom de son propriétaire ou, en la perdant, rendre l’information définitivement inaccessible. Si les clés sont mal générées, mal stockées ou mal gérées, la robustesse des algorithmes et des protocoles ne se traduit pas en protection réelle. Les attaquants cassent rarement les algorithmes modernes; ils volent, détournent ou exploitent des clés mal gérées.

La référence qui fait autorité en matière de gestion des clés est la publication NIST SP 800-57 Part 1, Recommendation for Key Management: General. La révision 5, publiée en 2020, demeure la version définitive en vigueur au moment de la rédaction; le NIST a publié en décembre 2025 une première ébauche publique de la révision 6, qui ajoute les algorithmes post-quantiques, traite séparément les clés destinées au stockage et celles destinées à l’établissement de clés, et ajoute des indications sur le stockage du matériel de chiffrement. L’ISO/IEC 27002:2022 couvre le même terrain dans sa mesure 8.24, Utilisation de la cryptographie, qui attend des organisations qu’elles définissent et mettent en œuvre des règles d’utilisation efficace de la cryptographie, y compris la gestion des clés. Les gestionnaires n’ont pas besoin de lire ces documents en détail, mais ils devraient savoir qu’ils existent et s’attendre à ce que les normes internes puissent y être rattachées.

Les clés sont des actifs

Les clés méritent une classification, une attribution de responsabilité et une protection comparables, voire supérieures, à celles des données qu’elles protègent. C’est particulièrement vrai pour les clés racines ou maîtresses, qui peuvent déchiffrer de grands volumes de données ou dériver d’autres clés, pour les clés de signature des autorités de certification, sur lesquelles repose la confiance dans tout un environnement, et pour les clés de signature de code, qui permettent à la clientèle de faire confiance aux logiciels. La plupart des organisations utilisent des hiérarchies de clés : un petit nombre de clés maîtresses hautement protégées chiffrent de nombreuses clés de chiffrement des données, qui chiffrent à leur tour les données elles-mêmes. Cette conception, souvent appelée chiffrement par enveloppe, rend la rotation et la révocation gérables, mais elle signifie aussi que la compromission ou la perte d’une clé maîtresse a un rayon d’impact très étendu.

Traiter les clés comme des actifs a des conséquences concrètes. Les clés devraient figurer dans un inventaire indiquant un responsable, une finalité, une classification, un emplacement, une cryptopériode (la période pendant laquelle l’utilisation d’une clé est autorisée) et les dépendances à l’égard des systèmes et des données. Sans un tel inventaire, l’organisation ne peut répondre à des questions élémentaires après un incident, par exemple quelles données une clé compromise protégeait, ou avant une migration, par exemple quels systèmes dépendent d’un algorithme qui doit être retiré. Comme le montre la section de ce chapitre consacrée au post-quantique, l’inventaire est devenu une nécessité stratégique plutôt qu’un raffinement technique.

Le cycle de vie des clés

La gestion des clés suit un cycle de vie, et chaque étape présente des risques distincts. La figure ci-dessous présente ce cycle de vie comme un cycle, parce que les clés qui atteignent la fin de leur cryptopériode sont remplacées par de nouvelles clés qui recommencent le cycle.

Figure 82 : le cycle de vie des clés cryptographiques en tant que cycle encadré

- La génération doit faire appel à des algorithmes approuvés et à un caractère aléatoire suffisant; des clés prévisibles sont aussi faibles que l’absence de clés, et les clés générées sur des serveurs ordinaires ou sur des postes de travail de développeurs sont plus difficiles à protéger que celles générées à l’intérieur d’un matériel dédié.
- La distribution et le stockage doivent empêcher l’interception ou le mauvais acheminement; les clés ne devraient être transmises que sous forme protégée et stockées dans des modules matériels de sécurité, des services de gestion des clés gérés ou des gestionnaires de secrets dédiés plutôt que dans des fichiers, des scripts ou du code source.
- L’utilisation devrait être limitée à la finalité prévue et aux systèmes autorisés, de sorte qu’une clé créée pour chiffrer des sauvegardes ne puisse pas aussi servir à signer des logiciels, et chaque utilisation d’une clé de grande valeur devrait laisser une trace dans un journal.
- La rotation limite la quantité de données exposées par une seule clé et la période pendant laquelle une clé volée demeure utile; les calendriers de rotation devraient suivre les cryptopériodes définies dans la norme de l’organisation et être automatisés autant que possible.
- La révocation et la suspension permettent de retirer rapidement une clé compromise ou mal utilisée; cette capacité doit être testée, parce qu’une révocation qui paralyse des systèmes critiques ne sera pas exécutée sous pression.
- La sauvegarde et la récupération garantissent que la perte d’une clé n’entraîne pas la perte des données, au moyen de contrôles assez robustes pour que la sauvegarde ne devienne pas la voie de compromission la plus facile.
- L’archivage et la destruction garantissent que les clés qui ne sont plus nécessaires ne sont conservées que tant que les données chiffrées avec elles doivent demeurer lisibles, puis détruites de façon vérifiable, y compris les copies présentes dans les sauvegardes et les fichiers de configuration.
HSM, services de gestion des clés et modules validés

Des systèmes spécialisés existent pour gérer les clés. Les modules matériels de sécurité (HSM) sont des dispositifs inviolables conçus pour générer et stocker des clés et pour effectuer des opérations cryptographiques sans exposer le matériel de chiffrement, de sorte qu’une application puisse demander « déchiffre ceci » ou « signe ceci » sans jamais voir la clé. Les services de gestion des clés (KMS) infonuagiques offrent des fonctions semblables sous forme de service géré, souvent appuyées par des HSM exploités par le fournisseur, avec des contrôles fondés sur des politiques et des journaux d’utilisation détaillés. Les gestionnaires de secrets prennent en charge les mots de passe, les jetons et les clés d’API destinés aux applications et à l’automatisation.

De nombreux organismes de réglementation, clients et acheteurs du secteur public s’attendent à ce que les modules cryptographiques soient validés de façon indépendante. Aux États-Unis et au Canada, la référence est le Cryptographic Module Validation Program (CMVP), programme de validation des modules cryptographiques mené conjointement par le NIST et le Centre canadien pour la cybersécurité, qui valide les modules au regard de la norme FIPS 140-3, Security Requirements for Cryptographic Modules. La transition depuis l’ancienne norme FIPS 140-2 est maintenant achevée : le calendrier de transition du NIST a versé tous les certificats FIPS 140-2 restants dans la liste historique en septembre 2026, ce qui signifie qu’on ne devrait plus s’y fier pour les nouveaux approvisionnements. L’avis de mise en œuvre de la Politique sur la sécurité (AMOPS) du gouvernement du Canada d’octobre 2025 sur la migration post-quantique va plus loin : il exige que les nouveaux contrats fédéraux comportant une composante numérique comprennent des clauses exigeant des modules validés par le CMVP et l’agilité cryptographique. Les gestionnaires devraient considérer l’état de validation comme un élément probant d’approvisionnement, tout en gardant à l’esprit qu’un module validé peut tout de même être mal configuré ou mal utilisé.

Séparation des tâches et double contrôle

La séparation des tâches, présentée dans les chapitres précédents comme un principe général de gouvernance, s’applique avec une force particulière aux clés. Les personnes qui administrent les systèmes de stockage ne devraient pas pouvoir exporter les clés maîtresses. Les personnes qui administrent les HSM ne devraient pas pouvoir les utiliser discrètement, sans journalisation. Les développeurs d’applications ne devraient pas coder les clés en dur dans le code source, et aucun administrateur ne devrait pouvoir à la fois modifier une politique de clés et approuver cette modification. Pour les opérations les plus sensibles, comme la création d’une autorité de certification racine, la restauration d’une clé maîtresse à partir d’une sauvegarde ou l’exportation de matériel de chiffrement, les organisations matures recourent au double contrôle et à la connaissance fractionnée, de sorte que deux personnes autorisées ou plus doivent agir ensemble et qu’aucune personne ne détienne jamais le secret complet.

Ces dispositions peuvent paraître bureaucratiques, mais elles répondent à un scénario réel : un seul compte privilégié compromis ou malveillant capable de tout déchiffrer. Lorsqu’ils examinent la conception de la gestion des clés, les gestionnaires devraient se demander ce qu’une personne peut faire en agissant seule. Si la réponse honnête est « déchiffrer toutes les données des clients sans que personne ne s’en aperçoive », la conception ne reflète aucune appétence pour le risque raisonnable.

La gestion des clés produit des éléments probants

La gestion des clés produit aussi des éléments probants. Les journaux de création, d’utilisation, de rotation et de modification administrative des clés deviennent essentiels lors de l’intervention en cas d’incident, des enquêtes réglementaires et des audits. Ils permettent aux enquêteurs de déterminer si un ensemble de données volé a pu être déchiffré, si un initié a accédé à des clés en dehors des habitudes normales et si les politiques de rotation ont réellement été suivies. Sans de tels éléments probants, les affirmations de chiffrement robuste sont difficiles à étayer, et l’organisation pourrait être incapable de soutenir qu’une violation touchant des données chiffrées ne présentait aucun risque réel.

La leçon managériale est que, lorsqu’ils évaluent des systèmes et des fournisseurs, les dirigeants devraient poser autant de questions sur la gestion des clés que sur les fonctions de chiffrement. Savoir où se trouvent les clés et qui les contrôle est souvent plus important que de savoir si les données sont chiffrées.

## Responsabilité et imputabilité : à qui appartiennent les clés?

La question de la responsabilité des clés n’est pas anodine. Dans de nombreuses organisations, les clés critiques appartiennent de fait à l’administrateur qui les a créées, à l’équipe qui exploite le HSM ou au fournisseur qui a configuré la plateforme. Cet arrangement fonctionne jusqu’à ce que quelque chose tourne mal : l’administrateur quitte l’organisation, l’équipe est réorganisée, la relation avec le fournisseur prend fin, ou un organisme de réglementation demande qui a approuvé un déchiffrement. La gouvernance exige que la responsabilité soit attribuée de façon délibérée.

Trois dimensions de la responsabilité

La responsabilité des clés comporte trois dimensions qu’il convient de distinguer. La propriété juridique renvoie à la partie qui a le droit de contrôler les clés et de décider de leur utilisation. Pour les données confiées à un fournisseur infonuagique ou à une plateforme de logiciel-service (SaaS), l’organisation demeure habituellement responsable des données même lorsque les clés sont techniquement gérées par le fournisseur, et les contrats devraient préciser que les clés associées aux données du client ne sont utilisées que conformément aux instructions du client et au droit applicable.

Le contrôle opérationnel renvoie à la partie qui peut agir sur les clés : les générer, les renouveler, les révoquer ou les utiliser pour déchiffrer et signer. Dans les environnements sur place, il peut s’agir de l’équipe interne de sécurité ou d’infrastructure qui exploite les HSM. Dans les environnements infonuagiques, le contrôle opérationnel est partagé entre le KMS du fournisseur et le client, dans des proportions qui dépendent du modèle choisi, comme l’explique la section suivante.

L’imputabilité en matière de gouvernance renvoie à la partie qui répond de l’alignement de la gestion des clés sur l’appétence pour le risque, les obligations réglementaires et la politique interne. Cette imputabilité est habituellement partagée entre la fonction du chef de la sécurité de l’information (CSI), imputable de la solidité technique; les responsables des données et des systèmes, imputables de la pertinence pour les affaires et de l’acceptation du risque résiduel; et les fonctions juridiques et de protection de la vie privée, qui définissent les conditions d’un accès et d’une communication licites. La fonction Gouverner du Cadre de cybersécurité 2.0 du NIST, qui met l’accent sur les rôles, les responsabilités et les pouvoirs, offre un cadre naturel pour documenter cette répartition.

Un modèle opérationnel pour la cryptographie

Un modèle opérationnel clair distingue les rôles afin que chaque décision ait un responsable. Dans un arrangement type :

- Le conseil d’administration et le comité des risques de la haute direction fixent l’appétence pour le risque à l’égard de l’exposition et de la disponibilité des données, approuvent le programme de transition cryptographique et reçoivent des rapports périodiques sur les principaux risques et exceptions.
- Le CSI ou la fonction d’architecture de sécurité définit les normes cryptographiques, y compris les algorithmes approuvés, les longueurs de clé, les cryptopériodes, les systèmes qui doivent utiliser des HSM et la façon dont la séparation des tâches est mise en œuvre.
- Les équipes d’infrastructure, de plateforme et infonuagiques exploitent les HSM, les KMS, les gestionnaires de secrets et les outils de gestion des certificats conformément à ces normes, et produisent les éléments probants démontrant qu’elles le font.
- Les responsables des données et des systèmes approuvent l’utilisation des clés en fonction des processus d’affaires, acceptent le risque résiduel lié aux exceptions et veillent à ce que les systèmes dont ils sont responsables figurent dans l’inventaire cryptographique.
- Les fonctions juridiques et de protection de la vie privée définissent les conditions dans lesquelles les clés peuvent être utilisées pour répondre à des demandes légales ou à des enquêtes internes, et veillent à ce que les choix cryptographiques soient pris en compte dans les évaluations des facteurs relatifs à la vie privée.
- L’audit interne, en tant que troisième ligne, vérifie périodiquement si les normes sont mises en œuvre et si les rapports présentés au conseil sont exacts.
Politique et normes cryptographiques

Le modèle opérationnel devrait s’appuyer sur une politique cryptographique courte et stable et sur une norme plus détaillée, mise à jour régulièrement. La politique énonce des principes : la cryptographie est exigée selon la classification, les clés sont des actifs qui ont des responsables, les algorithmes approuvés sont définis de façon centralisée, les exceptions sont limitées dans le temps, et l’organisation conserve la capacité de changer d’algorithme. La norme précise les détails techniques qui évoluent au fil du temps, comme les algorithmes et paramètres approuvés, les versions de protocoles, les cryptopériodes et les profils de certificats. La ligne directrice B-13 du BSIF, qui s’applique aux institutions financières fédérales (IFF), reflète cette double attente : elle demande aux institutions de mettre en œuvre et de maintenir des technologies cryptographiques robustes, de protéger les clés de chiffrement contre l’accès, l’utilisation et la communication non autorisés tout au long de leur cycle de vie, et d’évaluer régulièrement leurs normes et technologies cryptographiques.

Sans cette clarté, l’organisation peut découvrir que des clés critiques n’appartiennent de fait à personne en particulier, ou qu’elles relèvent d’un fournisseur dont les obligations contractuelles sont floues. Il s’agit d’un échec de gouvernance, et pas seulement d’un échec technique, et il a tendance à se manifester au pire moment.

## Clés gérées par le client dans le nuage : BYOK, HYOK et services HSM

L’expression « clés gérées par le client » est devenue courante dans le marketing infonuagique et SaaS. Elle suggère un contrôle accru du client et laisse parfois entendre une confidentialité plus forte. En réalité, elle recouvre plusieurs modèles différents, dont les conséquences opérationnelles varient considérablement. Le chapitre 15 a présenté le modèle de responsabilité partagée en termes généraux; cette section porte sur la façon dont les choix en matière de gestion des clés déplacent les responsabilités entre le fournisseur et le client.

Un éventail de contrôle

Il est utile de concevoir le contrôle des clés comme un éventail plutôt que comme un choix binaire.

- Les clés gérées par le fournisseur sont générées, stockées, renouvelées et utilisées par le fournisseur infonuagique; le chiffrement est activé par défaut et peu de décisions sont laissées au client. Ce modèle est simple, résilient et adéquat pour une grande partie des données, mais le fournisseur conserve une capacité technique importante de déchiffrement.
- Les clés gérées par le client (CMK) sont créées et gouvernées par le client au moyen du KMS du fournisseur. Le client fixe les politiques d’accès, les calendriers de rotation et les autorisations, et il peut désactiver ou révoquer les clés; les services du fournisseur utilisent les clés pour chiffrer les données pour le compte du client, et chaque utilisation est journalisée dans le compte du client.
- Le modèle « apportez votre propre clé » (BYOK) signifie que le client génère le matériel de chiffrement dans son propre environnement, habituellement un HSM sur place, puis l’importe dans le KMS du fournisseur. Le client obtient ainsi une assurance quant à la façon dont la clé a été générée et une copie hors des installations du fournisseur, mais une fois importée, la clé est utilisée à l’intérieur de l’infrastructure du fournisseur.
- Les HSM infonuagiques dédiés ou à locataire unique donnent au client le contrôle exclusif de partitions de HSM hébergées par le fournisseur, souvent sur du matériel validé selon la norme FIPS 140-3, pour les charges de travail pour lesquelles la réglementation ou l’appétence pour le risque exige que le matériel de chiffrement ne soit jamais partagé avec d’autres locataires.
- Le modèle « conservez votre propre clé » (HYOK), parfois mis en œuvre sous forme de gestion externe des clés, garde les clés maîtresses dans un HSM ou un service de clés situé hors du fournisseur principal, qui doit faire appel à l’environnement du client pour chaque déchiffrement. Le fournisseur principal ne détient jamais la clé maîtresse, et le client peut couper complètement l’accès.
Progresser le long de cet éventail accroît le contrôle du client et, à certains égards, la confidentialité à l’égard du fournisseur. Cela accroît aussi la responsabilité du client, la complexité et les conséquences d’une erreur.

Ce qui change sur le plan opérationnel

Les modèles de gestion par le client transfèrent au client une partie du risque lié à la disponibilité. Si le client gère mal ses clés, les renouvelle incorrectement, les supprime ou perd l’accès à un environnement de clés externe, il peut perdre l’accès à ses propres données alors même que l’infrastructure du fournisseur fonctionne normalement. Dans une conception HYOK, une panne du service de clés du client devient une panne de toutes les applications infonuagiques qui en dépendent.

Ces modèles exigent aussi une gestion rigoureuse du cycle de vie. Les configurations doivent être documentées, les changements contrôlés, et la rotation coordonnée avec les systèmes et les sauvegardes qui en dépendent. En contrepartie, ils améliorent la capacité du client à faire respecter les politiques d’accès, à révoquer rapidement les accès et à démontrer son contrôle aux organismes de réglementation et à sa clientèle. Toutefois, les clés gérées par le client ne bloquent pas automatiquement toutes les voies d’accès. Selon l’architecture et le territoire, les fournisseurs peuvent conserver des capacités nécessaires pour exploiter le service ou pour donner suite à des ordonnances judiciaires, et les applications SaaS doivent déchiffrer les données pour les traiter, de sorte que la couche applicative du fournisseur voit toujours les données en clair.

Les clés gérées par le client sont un transfert de contrôle et de responsabilité : l’organisation acquiert le pouvoir d’empêcher les autres d’accéder à ses données, et avec lui le pouvoir de s’en empêcher elle-même.

Mise en situation : une clé introuvable

Un fabricant québécois de composants industriels de taille moyenne a migré son système de gestion des documents d’ingénierie vers une plateforme SaaS. Pour satisfaire un client du secteur de la défense, l’équipe de projet a activé l’option BYOK du fournisseur et généré la clé maîtresse sur un petit appareil HSM installé dans le centre de données de l’entreprise. L’ingénieur qui a configuré le dispositif l’a documenté dans un carnet personnel et a quitté l’entreprise dix-huit mois plus tard. Lorsque l’entreprise a remplacé l’équipement de son centre de données, le HSM a été mis hors service avec le reste du matériel; personne n’a fait le lien avec la plateforme SaaS.

Le problème a fait surface lorsque le fournisseur a annoncé une rotation obligatoire des clés qui exigeait que le client génère un nouveau matériel de chiffrement sur son propre HSM et l’importe. L’entreprise n’avait plus le HSM, et la sauvegarde de son contenu était introuvable. Après plusieurs semaines d’inquiétude, l’équipe de soutien du fournisseur a confirmé que les données demeuraient accessibles au moyen de la clé importée existante, qui n’était pas encore expirée, et l’entreprise a pu exporter ses documents et rétablir une nouvelle hiérarchie de clés. Le coût s’est mesuré en honoraires de consultation, en retard d’un programme de produits et en une divulgation embarrassante au client du secteur de la défense, dont le contrat exigeait la notification des événements de sécurité importants.

La revue post-incident n’a relevé aucune faille technique. Les défaillances étaient d’ordre managérial : aucun responsable nommé pour la clé, aucune inscription dans un inventaire des actifs, aucun lien entre le HSM et le service d’affaires qu’il soutenait, aucune procédure de récupération testée, et un processus de mise hors service qui ne posait aucune question sur les dépendances cryptographiques. Les mesures correctives étaient tout aussi managériales. L’entreprise a ajouté les clés et les HSM à sa base de données de gestion des configurations (CMDB), confié la responsabilité de chaque hiérarchie de clés à un responsable du système nommément désigné, exigé le double contrôle et un séquestre documenté pour tout le matériel de chiffrement importé, et ajouté une vérification des dépendances cryptographiques à ses procédures de gestion du changement et de mise hors service.

Questions à poser aux fournisseurs

Pour les gestionnaires, les questions clés au sujet des clés gérées par le client sont concrètes. Qu’est-ce qui relève exactement de notre contrôle, et qu’est-ce qui demeure chez le fournisseur? Quels nouveaux modes de défaillance introduisons-nous en prenant ce contrôle, et comment les détecterons-nous et nous en remettrons-nous? Où les clés se trouvent-elles physiquement et juridiquement, et comment cela interagit-il avec les engagements de résidence des données et l’accès légal dans les territoires où le fournisseur exerce ses activités? Quels éléments probants pouvons-nous obtenir, comme des journaux d’utilisation des clés, des rapports d’attestation et des certificats de validation des HSM, pour démontrer notre contrôle aux organismes de réglementation et à notre clientèle? Et qu’advient-il de nos clés et de nos données à la fin du contrat? Ces questions ont leur place dans l’approvisionnement et l’évaluation des risques liés aux tiers (chapitre 19) tout autant que dans la revue d’architecture.

## Séquestre de clés, récupération et accès légal

Le séquestre de clés est la pratique qui consiste à confier des copies de clés cryptographiques à une partie de confiance, interne ou externe, afin que les clés puissent être récupérées ou utilisées dans des conditions définies. Il s’agit d’un sujet de gouvernance délicat parce qu’il se situe au croisement de trois préoccupations qui tirent dans des directions opposées : la continuité des activités, le risque lié aux initiés et l’accès légal.

La récupération comme exigence de continuité

Du point de vue de la continuité des activités, une forme de récupération des clés est habituellement nécessaire. Si toutes les copies d’une clé critique sont perdues, les données qu’elle protège peuvent devenir irrécupérables, ce qui peut être catastrophique, en particulier pour les documents réglementés qui doivent demeurer accessibles pendant des périodes de conservation légales qui se comptent en années. Le séquestre et les autres mécanismes de récupération, comme les clés maîtresses sauvegardées sous double contrôle ou réparties entre plusieurs dépositaires, atténuent ce risque. Les procédures de récupération devraient faire partie des plans de continuité des activités et de reprise après sinistre abordés au chapitre 12, et elles doivent être testées. Une procédure de récupération qui n’a jamais été mise à l’essai est une hypothèse, pas un contrôle.

Le chiffrement des terminaux en est l’exemple quotidien le plus courant. Lorsque les ordinateurs portables du personnel sont chiffrés, l’organisation place normalement les clés de récupération sous séquestre dans son service de gestion des appareils ou son service d’annuaire, afin que le personnel du centre d’assistance puisse déverrouiller un appareil après un oubli de mot de passe ou une défaillance matérielle. Ce séquestre est un actif puissant : quiconque peut l’interroger peut déverrouiller n’importe quel ordinateur portable de l’entreprise. L’accès à ce séquestre devrait donc être restreint, journalisé et revu comme toute autre capacité privilégiée.

Le séquestre comme risque concentré

Du point de vue du risque lié aux initiés, le séquestre crée un autre actif concentré. Si les dispositifs de séquestre sont mal encadrés, les personnes qui ont accès aux clés séquestrées peuvent potentiellement déchiffrer de grands volumes de données sans être détectées. Les conceptions matures de récupération recourent donc au contrôle par plusieurs personnes, à une journalisation qui révèle toute altération, à des mesures de protection procédurales strictes et à une revue indépendante de chaque opération de récupération. L’objectif est de rendre la récupération légitime possible, et la récupération illégitime à la fois difficile et visible.

Une position sur l’accès légal

Les organisations peuvent recevoir des ordonnances ayant force exécutoire les obligeant à produire des données, et elles peuvent devoir déchiffrer de l’information pour des enquêtes internes, des mesures de préservation de la preuve ou des inspections réglementaires. La possibilité de le faire, et la façon d’y parvenir, dépendent de l’architecture et du contrôle des clés. Dans certains modèles, l’organisation peut se conformer en utilisant ses propres clés pour déchiffrer les données. Dans d’autres, en particulier lorsque des fournisseurs externes exploitent l’environnement de chiffrement, l’accès légal peut faire intervenir ces fournisseurs, possiblement en vertu des lois d’un autre territoire. Dans les conceptions où l’organisation ne peut délibérément pas déchiffrer certaines données, comme la messagerie chiffrée de bout en bout dont les clés ne sont détenues que par les utilisateurs, les options de conformité sont plus limitées.

La gouvernance exige une position explicite sur l’accès légal, formulée avec les conseillers juridiques et la direction de la protection des renseignements personnels, et la conception technique doit permettre de mettre cette position en œuvre. La position devrait traiter au minimum les questions suivantes :

- Conditions juridiques : en vertu de quels pouvoirs et dans quelles conditions juridiques l’organisation fournira-t-elle des données déchiffrées, et comment vérifiera-t-elle la validité et la portée d’une demande?
- Pouvoir d’approbation : qui est autorisé à approuver un déchiffrement à des fins juridiques ou d’enquête, et quel rôle jouent les conseillers juridiques et la personne responsable de la protection des renseignements personnels?
- Documentation : quels documents et quelles pistes d’audit sont exigés pour chaque déchiffrement, et qui les examine?
- Architecture : quelles architectures de systèmes et quels arrangements avec les fournisseurs sont compatibles ou incompatibles avec cette position, y compris lorsque des fournisseurs pourraient être contraints d’agir à l’insu de l’organisation?
- Notification : quand, et à qui, les personnes concernées ou la clientèle seront-elles informées, sous réserve des contraintes juridiques?
Documenter le compromis

Les décisions relatives au séquestre de clés devraient être documentées et soumises à une évaluation des risques, comme tout autre choix de contrôle important. Pour certaines catégories de données, de fortes exigences de récupération et d’accès légal justifieront un séquestre soigneusement contrôlé. Pour d’autres, l’organisation peut accepter que la perte des clés rende les données irrécupérables, en tant que compromis délibéré en faveur d’une confidentialité plus forte. Ce qui importe, c’est que ces compromis soient conscients, approuvés par le responsable du risque approprié, alignés sur les obligations juridiques et l’appétence pour le risque, et réexaminés lorsque les circonstances changent. Une décision défendable est une décision que l’organisation peut expliquer après coup, et non une décision qu’elle découvre avoir prise par défaut.

## Certificats, ICP et confiance entre machines

Une grande partie de la cryptographie d’une organisation ne sert pas à chiffrer des données stockées; elle sert à établir la confiance entre des machines, des services et des personnes. C’est le domaine des certificats et de l’infrastructure à clés publiques (ICP). C’est aussi le domaine où les défaillances cryptographiques deviennent le plus souvent visibles pour la clientèle, parce qu’un problème de certificat se manifeste habituellement par un service qui cesse tout simplement de fonctionner.

Ce que font les certificats et l’ICP

Les certificats sont des identifiants numériques qui lient une identité, comme un nom de domaine, un service, un appareil ou une personne, à une clé publique. Ils sont utilisés dans le protocole TLS pour les connexions Web et d’API, dans les réseaux privés virtuels, dans l’authentification des appareils et des charges de travail, dans la signature des courriels, dans la signature de code et dans de nombreux systèmes internes. Une ICP est la combinaison des autorités de certification, des politiques, des procédures et des technologies qui délivrent, gèrent, renouvellent et révoquent ces certificats. Les certificats de confiance publique destinés aux services exposés à Internet proviennent d’autorités de certification commerciales ou sans but lucratif dont les pratiques sont régies par les Baseline Requirements du CA/Browser Forum et par les programmes de certificats racines des fabricants de navigateurs et de systèmes d’exploitation. Les certificats internes proviennent habituellement de l’ICP privée de l’organisation.

Une ICP mal gouvernée crée un risque opérationnel et de sécurité important. Les certificats expirés causent des pannes; les certificats délivrés par erreur permettent l’usurpation d’identité; les clés d’autorités de certification faiblement protégées menacent des environnements entiers; et les certificats qui ne peuvent être révoqués rapidement laissent des systèmes compromis bénéficier de la confiance. À l’inverse, une ICP bien gouvernée rend possibles, à grande échelle, une connectivité sécurisée et l’assurance de l’identité. Les gestionnaires devraient s’attendre à savoir clairement qui exploite chaque autorité de certification, à des processus définis de demande, d’approbation, de délivrance, de renouvellement et de révocation des certificats, à un inventaire complet des certificats indiquant leurs responsables et leurs dates d’expiration, et à des procédures de révocation des certificats lorsque des clés sont compromises ou que des systèmes sont mis hors service.

Le raccourcissement de la durée de vie des certificats

La gouvernance des certificats évolue rapidement parce que l’écosystème des certificats publics a décidé de raccourcir considérablement leur durée de vie. En avril 2025, le CA/Browser Forum a adopté le scrutin SC-081, qui établit un calendrier de réduction de la durée de validité maximale des certificats TLS de confiance publique. Les certificats délivrés à compter du 15 mars 2026 ne peuvent être valides plus de 200 jours; à compter du 15 mars 2027, plus de 100 jours; et à compter du 15 mars 2029, plus de 47 jours. Le scrutin raccourcit aussi progressivement la période pendant laquelle une autorité de certification peut réutiliser une validation de domaine antérieure, jusqu’à dix jours à la fin du calendrier.

La justification est solide : les certificats de courte durée limitent les dommages causés par des clés compromises et des délivrances erronées, réduisent la dépendance à l’égard de mécanismes de révocation qui n’ont jamais bien fonctionné et poussent l’écosystème vers l’automatisation, ce qui facilitera aussi les futurs changements d’algorithmes. La conséquence managériale est tout aussi claire. Une organisation qui renouvelle ses certificats manuellement, à l’aide de chiffriers et de rappels d’agenda, passera d’environ un renouvellement par certificat par année à environ huit. Le renouvellement des certificats ne peut plus être une tâche manuelle; il doit devenir un processus automatisé et surveillé, dont la responsabilité est clairement attribuée. L’automatisation au moyen de protocoles normalisés comme ACME, les outils de découverte qui trouvent les certificats dont l’organisation ignorait l’existence et une surveillance qui donne l’alerte bien avant l’expiration sont désormais des attentes de base plutôt que des raffinements.

Identités machine et prolifération des secrets

Les certificats sont l’une des formes d’une catégorie plus large que les praticiens appellent les identités machine : les certificats, les clés, les jetons et les identifiants de service qui permettent aux charges de travail, aux appareils, aux conteneurs et aux processus automatisés de s’authentifier les uns auprès des autres. Dans les environnements infonuagiques et DevOps modernes, les identités machine sont beaucoup plus nombreuses que les identités humaines, et elles sont créées et détruites en continu par l’automatisation. Le chapitre 10 a abordé la gouvernance des identités non humaines sous l’angle de la gestion des accès; la perspective cryptographique ajoute l’exigence que les clés qui sous-tendent ces identités soient générées, stockées, renouvelées et révoquées correctement.

La gouvernance de l’ICP crée aussi des dépendances qui franchissent les frontières organisationnelles. Un fournisseur SaaS qui épingle le certificat d’un client, un partenaire qui code en dur une autorité de certification intermédiaire ou un appareil industriel qui ne peut accepter une nouvelle racine peut chacun transformer un renouvellement de routine en incident. Ces dépendances devraient être consignées dans le même inventaire que les certificats eux-mêmes.

Mise en situation : le certificat dont personne n’était responsable

Une coopérative de crédit canadienne comptant environ 200 000 membres exploitait une plateforme bancaire en ligne, une application mobile et une intégration avec un réseau de paiement pour les virements en temps réel. Un lundi matin du début du printemps, des membres ont commencé à signaler que l’application mobile ne parvenait pas à se connecter. En moins d’une heure, le centre de contact était débordé, et les virements vers d’autres institutions échouaient. La cause était un seul certificat TLS expiré sur une passerelle d’API qui desservait à la fois l’application mobile et l’intégration de paiement.

Le certificat avait été acheté trois ans plus tôt par une équipe de projet dissoute depuis. Les avis de renouvellement étaient envoyés à une boîte aux lettres partagée que personne ne surveillait. Le certificat ne figurait pas dans l’inventaire de l’équipe d’infrastructure, parce qu’il avait été installé sur une passerelle gérée par un intégrateur externe. Le rétablissement du service exigeait d’obtenir un nouveau certificat, ce qui a été rapide, puis de l’installer sur la passerelle, ce qui ne l’a pas été : le processus de gestion du changement de l’intégrateur exigeait des approbations, et l’application mobile épinglait l’ancien certificat intermédiaire, de sorte qu’une nouvelle version de l’application a dû être diffusée par les boutiques d’applications. Le service mobile a été dégradé pendant la majeure partie de deux jours. La coopérative de crédit a signalé l’incident à son organisme de réglementation, a diffusé des communications aux membres et a absorbé des heures supplémentaires au centre de contact, une atteinte à sa réputation et des renonciations à des frais.

Vu sous l’angle du chapitre 5, il s’agissait d’un scénario réaliste et prévisible : un événement de menace (l’expiration d’un certificat) exploitant des vulnérabilités (aucun responsable, aucun inventaire, renouvellement manuel, épinglage de certificat, dépendance à l’égard d’un tiers) pour produire un impact important sur la disponibilité d’un service d’affaires critique. La revue post-incident a débouché sur des décisions managériales plutôt que techniques. Le comité des risques du conseil a demandé à la direction de traiter la gestion des certificats comme une composante de la résilience opérationnelle. Le dirigeant principal de l’information (DPI) a confié la responsabilité de l’inventaire des certificats à l’équipe d’infrastructure et celle de chaque certificat à un responsable du système nommément désigné. Les contrats avec les intégrateurs ont été modifiés pour exiger la production de rapports d’inventaire des certificats. Un outil de gestion du cycle de vie des certificats a été financé pour découvrir et renouveler automatiquement les certificats, avec un indicateur clé de risque indiquant le nombre de certificats qui expirent dans les 30 jours sans mécanisme de renouvellement automatisé. Ayant en vue le calendrier du scrutin SC-081, la coopérative de crédit s’est aussi fixé pour cible que tous les certificats publics soient renouvelés automatiquement avant que leur durée de validité ne descende à 100 jours en 2027.

La mise en situation illustre une leçon plus large. Le chiffrement de l’organisation était robuste; ses algorithmes étaient à jour; ses auditeurs n’avaient relevé aucune faiblesse dans sa norme cryptographique. Ce qui a fait défaut, ce sont la responsabilité, l’inventaire et le processus, soit précisément ce que la gouvernance est censée fournir.

## La cryptographie post-quantique et l’agilité cryptographique en tant que programme de gouvernance

Le changement cryptographique le plus important auquel les organisations feront face au cours de la prochaine décennie est la transition vers la cryptographie post-quantique. Il ne s’agit pas d’une mise à niveau de produit ni d’un cycle de correctifs. Il s’agit d’un programme pluriannuel qui touche presque tous les systèmes, de nombreux fournisseurs et les engagements à long terme de l’organisation en matière de protection des données, et qui comporte désormais des jalons publics fixés par les organismes de normalisation et les gouvernements. Pour les gestionnaires, il vaut mieux le concevoir comme un programme de gouvernance doté d’un responsable, d’un budget, d’une feuille de route et d’une reddition de comptes au conseil d’administration.

Pourquoi l’informatique quantique concerne les gestionnaires

La plupart des algorithmes de cryptographie à clé publique utilisés aujourd’hui, y compris les algorithmes RSA et à courbes elliptiques employés pour l’échange de clés, les signatures numériques et les certificats, reposent sur des problèmes mathématiques qu’un ordinateur quantique suffisamment puissant pourrait résoudre efficacement. Une telle machine, souvent appelée ordinateur quantique pertinent sur le plan cryptographique, n’existe pas publiquement au moment de la rédaction, et les experts ne s’entendent pas sur le moment où elle pourrait apparaître. Le chiffrement symétrique et le hachage sont beaucoup moins touchés; l’utilisation de clés suffisamment longues préserve en grande partie leur robustesse. La partie vulnérable est la couche à clé publique, qui protège la façon dont les clés sont échangées et dont les identités et les signatures sont vérifiées.

Deux caractéristiques de cette menace en font un enjeu de gouvernance actuel, malgré l’incertitude quant au moment où elle se concrétisera. La première est le principe « récolter maintenant, déchiffrer plus tard » : un adversaire peut enregistrer du trafic chiffré ou voler des données chiffrées aujourd’hui et les conserver jusqu’à ce qu’il puisse les déchiffrer. Pour l’information qui doit demeurer confidentielle pendant de nombreuses années, comme les dossiers de santé, les renseignements personnels, les secrets commerciaux, les dossiers juridiques et les données gouvernementales ou de défense, l’exposition commence au moment de l’interception, et non au moment où un ordinateur quantique apparaît. La seconde est le délai de migration. Le remplacement de la cryptographie dans l’ensemble des applications, des appareils, des protocoles, des partenaires et des fournisseurs a historiquement pris de nombreuses années; les transitions passées visant à abandonner des fonctions de hachage faibles et d’anciennes versions de protocoles ont pris une décennie ou plus dans de nombreuses organisations. Un test de raisonnement simple, généralement attribué au chercheur en sécurité quantique Michele Mosca, en résume la logique : si le nombre d’années pendant lesquelles les données doivent demeurer secrètes, additionné au nombre d’années que prendra la migration, dépasse le nombre d’années avant que la menace quantique ne se concrétise, l’organisation est déjà en retard.

Pour les données sensibles à longue durée de vie, la fenêtre de risque quantique s’ouvre au moment où les données sont interceptées, et non au moment où un ordinateur quantique est construit; c’est pourquoi la migration post-quantique est une décision de gouvernance qui se prend dès maintenant.

Les nouvelles normes

Le NIST a publié les trois premières normes de cryptographie post-quantique le 13 août 2024. La norme FIPS 203 spécifie ML-KEM, un mécanisme d’encapsulation de clés fondé sur les réseaux euclidiens modulaires, destiné à être l’algorithme principal d’établissement de clés partagées. La norme FIPS 204 spécifie ML-DSA, un algorithme de signature numérique fondé sur les réseaux euclidiens modulaires, destiné à être le principal mécanisme de signature à usage général. La norme FIPS 205 spécifie SLH-DSA, un algorithme de signature sans état fondé sur le hachage, qui repose sur des mathématiques différentes et sert de solution de rechange prudente. Une quatrième norme, FIPS 206, spécifiera FN-DSA, un algorithme de signature dérivé de la proposition Falcon qui produit des signatures compactes; au moment de la rédaction, la norme FIPS 206 a été rédigée et soumise pour approbation, mais n’a pas encore été publiée comme norme définitive, de sorte que les organisations devraient surveiller sa publication plutôt que de planifier en fonction d’une date précise.

En mars 2025, le NIST a retenu HQC, un mécanisme d’encapsulation de clés fondé sur les codes, comme solution de secours à ML-KEM, afin qu’un fondement mathématique différent soit disponible si une faiblesse était découverte dans les mécanismes fondés sur les réseaux euclidiens. Le NIST a indiqué qu’une ébauche de norme suivrait environ un an après la sélection et qu’une norme définitive était attendue en 2027. Le NIST a aussi publié en septembre 2025 la publication SP 800-227, Recommendations for Key-Encapsulation Mechanisms, qui guide l’utilisation sécurisée des mécanismes d’encapsulation de clés (KEM), y compris les combinaisons hybrides d’algorithmes classiques et post-quantiques. Pour les gestionnaires, il ne s’agit pas de mémoriser les noms des algorithmes, mais de comprendre que des normes existent désormais, que d’autres sont à venir, et que les normes cryptographiques internes et les exigences d’approvisionnement devraient y faire référence.

Calendriers de transition

Plusieurs autorités ont maintenant publié des calendriers qui donnent un échéancier à la transition. Le document NIST IR 8547, Transition to Post-Quantum Cryptography Standards, publié sous forme de première ébauche publique en novembre 2024, propose que les algorithmes à clé publique vulnérables à l’informatique quantique, comme RSA et la cryptographie à courbes elliptiques au niveau de sécurité de 112 bits, soient déconseillés après 2030 et que les algorithmes vulnérables à l’informatique quantique soient interdits dans les normes du NIST après 2035, les systèmes à risque élevé devant effectuer leur transition plus tôt. Au moment de la rédaction, l’IR 8547 demeure une ébauche, mais ses jalons de 2030 et de 2035 ont été largement adoptés comme points d’ancrage de planification par les fournisseurs et les organismes de réglementation.

Au Canada, le Centre canadien pour la cybersécurité a publié en juin 2025 le document ITSM.40.001, Feuille de route pour la migration vers la cryptographie post-quantique pour le gouvernement du Canada. Il décrit trois phases qui se chevauchent, soit la préparation, l’identification et la transition, et fixe deux cibles d’achèvement : la migration des systèmes hautement prioritaires d’ici la fin de 2031 et celle des autres systèmes d’ici la fin de 2035. Un avis de mise en œuvre de la Politique sur la sécurité (AMOPS) du Conseil du Trésor publié en octobre 2025 a traduit la feuille de route en obligations pour les ministères fédéraux : un plan ministériel initial de migration et des rapports d’étape annuels à compter d’avril 2026, des clauses d’approvisionnement exigeant des modules validés et l’agilité cryptographique dans les nouveaux contrats à compter de la même date, un plan mis à jour pour la phase d’identification d’ici avril 2027, ainsi que la détermination des systèmes hautement prioritaires, la mise à jour des dossiers de systèmes et le début de la transition d’ici avril 2028. À l’échelle internationale, la feuille de route coordonnée de mise en œuvre de l’Union européenne, publiée en juin 2025, demande aux États membres d’amorcer les activités de transition d’ici la fin de 2026, de migrer les cas d’utilisation à risque élevé d’ici la fin de 2030 et de terminer, dans la mesure du possible, le reste de la transition d’ici 2035.

Ces calendriers lient formellement les gouvernements et leurs organismes, mais leur influence est beaucoup plus large. Les fournisseurs du gouvernement fédéral feront face à des exigences d’approvisionnement; les organismes de réglementation financière et les autorités responsables des infrastructures essentielles ont tendance à s’aligner sur les orientations nationales; et les grands clients répercuteront leurs attentes sur leurs fournisseurs. Une organisation privée au Canada qui entend vendre à des gouvernements, à des banques ou à des exploitants d’infrastructures essentielles devrait donc considérer 2031 et 2035 comme des échéances externes réalistes.

L’inventaire cryptographique et la CBOM

Toutes les feuilles de route qui font autorité commencent par la même étape : savoir où la cryptographie est utilisée. Un inventaire cryptographique consigne, pour chaque système, les algorithmes, les longueurs de clé, les protocoles, les certificats, les bibliothèques et les modules matériels qu’il utilise, à quelle fin, quelles données il protège, pendant combien de temps ces données doivent demeurer confidentielles, qui est responsable du système et quels fournisseurs contrôlent les composants pertinents. Sans cet inventaire, l’organisation ne peut ni établir de priorités, ni estimer les coûts, ni démontrer ses progrès.

Constituer l’inventaire est plus difficile qu’il n’y paraît, parce que la cryptographie est intégrée aux systèmes d’exploitation, aux bibliothèques, aux micrologiciels, à l’équipement réseau, aux plateformes SaaS et aux connexions avec les partenaires, souvent de façon invisible. Les organisations combinent plusieurs sources : des outils de découverte automatisée qui analysent les réseaux, les terminaux et le code; les systèmes de gestion des certificats et des clés; les bases de données de gestion des configurations; et les attestations des fournisseurs. Un artefact émergent utile est la nomenclature cryptographique (CBOM), qui étend le concept de nomenclature logicielle abordé au chapitre 19 afin de décrire les actifs cryptographiques contenus dans un produit logiciel. La norme CycloneDX prend en charge la CBOM dans son format de nomenclature. Demander des CBOM, ou au minimum des déclarations cryptographiques structurées, aux principaux fournisseurs est une façon pratique d’intégrer la chaîne d’approvisionnement à l’inventaire.

L’inventaire soutient ensuite l’établissement des priorités. Les systèmes qui protègent des données sensibles à longue durée de vie et qui sont exposés à l’interception, comme les connexions externes, les réseaux privés virtuels et les échanges de données avec les partenaires, se classent en tête en raison du risque « récolter maintenant, déchiffrer plus tard ». Les racines de confiance à longue durée de vie, comme la signature des micrologiciels, la signature de code et les autorités de certification, se classent aussi en tête, parce que des signatures falsifiées compromettraient tout ce qui en découle. Les applications sur mesure se classent en tête parce qu’aucun fournisseur ne les migrera pour le compte de l’organisation.

Agilité cryptographique

L’agilité cryptographique est la capacité de changer les algorithmes, les paramètres et les mises en œuvre cryptographiques rapidement et en toute sécurité, sans revoir la conception des systèmes. Elle importe au-delà de la transition quantique : les algorithmes s’affaiblissent périodiquement, les mises en œuvre comportent des failles et les organismes de réglementation modifient leurs exigences. La migration post-quantique ne sera pas le dernier changement cryptographique auquel les organisations feront face, et les investissements consentis maintenant devraient permettre à l’organisation d’effectuer le prochain changement plus rapidement.

Sur le plan de la gouvernance, l’agilité cryptographique repose sur quelques pratiques concrètes. La cryptographie devrait être consommée au moyen de services, de bibliothèques et de configurations gérés de façon centralisée plutôt que d’être codée en dur dans les applications. Les algorithmes et les paramètres devraient être sélectionnés par politique et par configuration, de sorte qu’un changement n’exige pas de nouveau code. L’inventaire et l’automatisation, comme dans le cas des certificats, rendent le changement mesurable et reproductible. L’approvisionnement devrait exiger des fournisseurs qu’ils prennent en charge les normes actuelles, fournissent une feuille de route crédible pour les algorithmes post-quantiques et s’engagent à effectuer des mises à jour en temps opportun. De nombreuses organisations traverseront aussi une période de cryptographie hybride, dans laquelle des algorithmes classiques et post-quantiques sont combinés de sorte qu’une connexion demeure sûre tant que l’un ou l’autre n’est pas cassé; les principaux navigateurs et fournisseurs infonuagiques ont déjà déployé l’échange de clés hybride pour TLS. Les approches hybrides réduisent le risque pendant la transition, mais ajoutent de la complexité, et les décisions quant à leur utilisation relèvent de la norme cryptographique.

Une feuille de route de migration

La figure ci-dessous présente une feuille de route de migration en cinq étapes, qui s’aligne sur les phases de la feuille de route du Centre pour la cybersécurité et peut être adaptée à toute organisation.

Figure 83 : une feuille de route de migration post-quantique en tant que programme de gouvernance

1. Gouverner et planifier : nommer un dirigeant imputable et une personne responsable de la migration, mettre sur pied un comité directeur, intégrer le programme au registre des risques et au plan d’investissement, et établir la reddition de comptes au conseil d’administration.

2. Découvrir et inventorier : constituer l’inventaire cryptographique, demander des CBOM et des feuilles de route aux fournisseurs, et consigner la durée de confidentialité des données pour chaque système.

3. Évaluer et prioriser : classer les systèmes selon leur exposition au risque « récolter maintenant, déchiffrer plus tard », la criticité des signatures et des ancres de confiance et la difficulté de migration, en s’appuyant sur une évaluation des risques fondée sur des scénarios plutôt que sur les seules préférences techniques.

4. Migrer et tester : mettre à niveau, remplacer, encapsuler dans un tunnel ou isoler les systèmes selon leur priorité, en utilisant des modes hybrides lorsque c’est approprié, avec des évaluations d’impact, des essais et des plans de retour arrière dans le cadre de la gestion normale du changement.

5. Vérifier et maintenir : mesurer les progrès par rapport aux jalons, confirmer par des essais que les algorithmes déconseillés ne sont plus utilisés, retirer les exceptions selon l’échéancier, et intégrer l’agilité cryptographique aux normes d’architecture et d’approvisionnement.

Les avantages d’un tel programme sont en grande partie invisibles, ses coûts sont répartis entre de nombreux budgets, et une grande partie du travail dépend des échéanciers des fournisseurs. Le traitement de la gouvernance des investissements présenté au chapitre 17 s’applique directement : le programme devrait être justifié par des scénarios de risque qui quantifient l’exposition, en particulier pour les données à longue durée de vie, et financé comme un engagement pluriannuel assorti de jalons plutôt que comme un poste discrétionnaire annuel.

Fournisseurs et approvisionnement

Pour la plupart des organisations, la majorité de la cryptographie est fournie par d’autres : fournisseurs de systèmes d’exploitation, fournisseurs infonuagiques, plateformes SaaS, fabricants d’équipement réseau, entreprises de traitement des paiements et fournisseurs de services gérés. La migration post-quantique dépend donc fortement de l’état de préparation des fournisseurs. Les exigences d’approvisionnement devraient demander aux fournisseurs d’indiquer quels algorithmes post-quantiques ils prennent en charge ou prévoient prendre en charge, d’ici quand et dans quels produits; si leurs modules cryptographiques sont ou seront validés selon la norme FIPS 140-3; s’ils peuvent fournir une CBOM ou une déclaration équivalente; et comment ils aviseront leurs clients des changements cryptographiques. Les contrats visant des systèmes à longue durée de service, comme l’équipement industriel, les dispositifs médicaux et les plateformes bancaires centrales, méritent un examen particulier, parce qu’un appareil acheté en 2027 pourrait encore être en service bien après 2035.

## Mesurer les contrôles cryptographiques et en fournir l’assurance

Parce que les choix cryptographiques paraissent techniques, il est facile pour les conseils d’administration et la haute direction soit de les ignorer, soit d’accepter des assurances sans vérification. Un programme axé sur la gouvernance établit des façons de mesurer l’efficacité du chiffrement et de la gestion des clés et d’en fournir l’assurance, au moyen de l’approche fondée sur les éléments probants qui traverse ce manuel.

Formes d’éléments probants

Plusieurs formes d’éléments probants sont particulièrement utiles :

- Les éléments probants de configuration montrent où et comment le chiffrement est activé, y compris les paramètres de chiffrement du stockage pour les bases de données, les systèmes de fichiers et les magasins d’objets; les paramètres de chiffrement du transport pour les services externes et internes; et les configurations du KMS ou des HSM pour l’utilisation des clés.
- Les éléments probants de couverture démontrent que les systèmes et les ensembles de données critiques entrent dans la portée des normes de chiffrement, par exemple des rapports montrant que tous les systèmes qui contiennent des données de paiement utilisent un chiffrement robuste au repos, ou que tous les canaux d’accès à distance à des fins d’administration utilisent des protocoles approuvés.
- Les éléments probants de gestion des clés comprennent les journaux de création, de rotation et d’utilisation des clés; la preuve que les politiques de rotation sont appliquées; les registres des attributions de rôles et de la séparation des tâches; et les résultats documentés et datés des tests de récupération des clés.
- Les éléments probants d’inventaire couvrent les certificats, les clés, les secrets et les algorithmes, avec leurs responsables et leurs dates d’expiration, et constituent de plus en plus le fondement de la reddition de comptes tant en matière de résilience opérationnelle que de transition post-quantique.
- Les éléments probants issus des tests proviennent des tests d’intrusion, des audits de configuration et des revues post-incident, par exemple des évaluations qui confirment que des disques volés ne peuvent être déchiffrés sans les clés, que des attaquants ne peuvent pas extraire facilement des clés des serveurs d’applications, ou que les configurations TLS rejettent les versions de protocole obsolètes.
- Les éléments probants de certification et de validation, comme les certificats FIPS 140-3 des modules cryptographiques et les rapports SOC 2 ou ISO/IEC 27001 des fournisseurs, sont utiles, mais complémentaires : ils montrent que les fournisseurs ont des contrôles, et non que ces contrôles correspondent aux menaces et aux exigences propres à l’organisation.
Indicateurs clés de risque pour la cryptographie

La cryptographie se prête bien à des indicateurs mesurables, ce qui en fait un bon domaine pour la discipline des ICR abordée dans les chapitres précédents. Parmi les indicateurs utiles figurent le pourcentage de systèmes de données restreintes qui satisfont à la norme de chiffrement; le nombre de certificats qui expirent dans les 30 jours sans mécanisme de renouvellement automatisé; le pourcentage de certificats publics renouvelés automatiquement; le nombre de secrets exposés détectés dans les dépôts de code et le délai médian de leur révocation; le nombre de clés dont la cryptopériode est dépassée; le nombre d’exceptions cryptographiques actives et le nombre d’entre elles qui sont échues; la date du dernier test de récupération réussi pour chaque hiérarchie de clés critique; et, pour le programme post-quantique, le pourcentage de systèmes hautement prioritaires inventoriés, évalués et migrés par rapport à la feuille de route.

Chaque indicateur devrait avoir un responsable et un seuil liés à l’appétence pour le risque et à la tolérance. Une cible de zéro certificat expiré pour les services critiques, par exemple, est un énoncé de tolérance clair que le conseil peut comprendre et dont la direction peut être tenue responsable. Les indicateurs devraient être présentés en termes d’affaires : non pas « 1 200 certificats », mais « quatre services offerts aux membres risquent une panne d’ici 30 jours ».

L’assurance dans les trois lignes

Le modèle des trois lignes offre une structure naturelle pour l’assurance cryptographique. La première ligne, soit les équipes opérationnelles qui exploitent la gestion des clés, l’ICP et les plateformes, produit les éléments probants de configuration et de gestion des clés comme sous-produit d’opérations automatisées. La deuxième ligne, soit la gestion des risques de sécurité et la conformité, définit les normes, surveille les indicateurs, remet en question les exceptions et établit la correspondance entre les contrôles cryptographiques et des cadres comme l’ISO/IEC 27001:2022, le NIST CSF 2.0 et les mesures de protection des données des CIS Controls v8.1. La troisième ligne, l’audit interne, vérifie périodiquement si les contrôles fonctionnent comme ils sont décrits, par exemple en examinant un échantillon de tests de récupération des clés, en vérifiant que les administrateurs des HSM ne peuvent pas utiliser les clés sans journalisation, ou en confirmant que l’inventaire cryptographique est complet pour un échantillon de systèmes.

Pour les gestionnaires, l’approche pratique consiste à poser des questions régulières et structurées. Pour nos systèmes les plus critiques, pouvons-nous démontrer que le chiffrement est correctement activé? Savons-nous où se trouvent les clés et qui peut les manipuler? Avons-nous testé la récupération des clés dans des conditions de sinistre réalistes? Les incidents récents ont-ils révélé des écarts entre nos affirmations en matière de chiffrement et la réalité? Les réponses à ces questions sont bien plus significatives qu’une déclaration générique selon laquelle l’organisation utilise un chiffrement robuste, qui relève souvent de la conformité de façade.

## Intégration avec les obligations en matière de vie privée, de protection des données et de transferts transfrontaliers

La cryptographie et la gestion des clés sont étroitement liées à la protection de la vie privée et des données, en particulier dans les territoires qui mettent l’accent à la fois sur la protection et sur une imputabilité démontrable. Le chapitre 16 a traité en profondeur des obligations en matière de vie privée; la présente section fait ressortir les points où les décisions cryptographiques modifient l’analyse.

Chiffrement et avis de violation

Le chiffrement est souvent cité dans les lois et les lignes directrices sur la protection des renseignements personnels comme une mesure de sécurité appropriée, et il joue fréquemment un rôle lorsqu’il s’agit de déterminer si une violation doit faire l’objet d’un avis. En vertu de la Loi 25 du Québec, les organisations doivent évaluer si un incident de confidentialité présente un risque qu’un préjudice sérieux soit causé, en tenant compte de la sensibilité des renseignements, des conséquences appréhendées de leur utilisation et de la probabilité qu’ils soient utilisés à des fins préjudiciables. En vertu de la LPRPDE, le critère consiste à déterminer si l’atteinte crée un risque réel de préjudice grave, évalué au regard de la sensibilité des renseignements et de la probabilité de leur mauvaise utilisation. En vertu du RGPD de l’Union européenne, la communication aux personnes concernées n’est pas requise lorsque les données ont été rendues incompréhensibles pour toute personne non autorisée, par exemple au moyen du chiffrement. Dans les trois régimes, des données correctement chiffrées dont les clés n’ont pas été compromises font généralement pencher l’évaluation vers un risque plus faible.

Ce traitement dépend toutefois d’une gestion rigoureuse des clés et d’éléments probants. Si les clés étaient stockées avec les données, si les journaux montrent que des attaquants ont pu obtenir la capacité de déchiffrer ou si l’organisation ne peut démontrer qui avait accès aux clés, les organismes de réglementation ne considéreront pas le chiffrement comme un facteur atténuant. L’avis aux personnes n’est par ailleurs qu’une obligation parmi d’autres; l’inscription de l’incident au registre et le signalement à la Commission d’accès à l’information ou au Commissariat à la protection de la vie privée du Canada demeurent des obligations distinctes. C’est souvent la capacité de prouver que les clés n’ont pas été compromises qui permet au chiffrement de peser dans l’évaluation d’une violation.

Emplacement des clés et compétence territoriale

La résidence des données et les préoccupations liées aux transferts transfrontaliers recoupent aussi la cryptographie. Certaines organisations s’appuient sur le chiffrement et sur l’emplacement des clés, par exemple en conservant les clés maîtresses uniquement au Canada ou dans un HSM contrôlé par le client, dans le cadre de leur stratégie de gestion des risques transfrontaliers. La Loi 25 du Québec exige une évaluation des facteurs relatifs à la vie privée avant toute communication de renseignements personnels à l’extérieur du Québec, évaluation qui doit tenir compte de la protection dont bénéficieront les renseignements; le chiffrement au moyen de clés contrôlées par le client est un facteur pertinent dans cette évaluation. Pour que cette approche ait un sens, l’architecture doit garantir que les fournisseurs ne peuvent déchiffrer les données hors du territoire prévu sans la collaboration de l’organisation, et les ententes contractuelles et juridiques doivent soutenir cette position.

Les gestionnaires devraient demeurer réalistes quant à ce que permet l’emplacement des clés. Si une application SaaS doit déchiffrer les données pour les traiter, la couche applicative du fournisseur verra les données en clair, où qu’elle soit exploitée; l’emplacement des clés est donc le plus efficace pour le stockage et les sauvegardes, et le moins efficace pour les données qu’un fournisseur traite activement.

Pseudonymisation et tokenisation

La pseudonymisation et la tokenisation, abordées au chapitre 16, comportent d’importantes dimensions cryptographiques. Les mécanismes de tokenisation qui remplacent des identifiants par des jetons peuvent reposer sur des tables de correspondance protégées par des clés ou sur des fonctions cryptographiques à clé. Si les clés ou les tables de correspondance sont compromises, les données pseudonymisées redeviennent des renseignements personnels identifiables, tant sur le plan technique qu’aux yeux des organismes de réglementation. La gouvernance doit donc traiter ces systèmes comme faisant partie de la gestion des clés, avec les mêmes exigences d’inventaire, de responsabilité, de séparation des tâches et d’éléments probants, plutôt que comme de simples transformations de données effectuées par une équipe d’analytique.

Évaluations des facteurs relatifs à la vie privée

Les évaluations des facteurs relatifs à la vie privée des nouveaux systèmes devraient examiner explicitement les choix cryptographiques : ce qui est chiffré, dans quels états, selon quel modèle de gestion des clés, avec quelles modalités de reprise et d’accès légal, et avec quel risque résiduel. Pour les systèmes qui conserveront longtemps des renseignements personnels sensibles, l’évaluation devrait aussi tenir compte de l’horizon post-quantique, car les données recueillies aujourd’hui pourraient devoir être protégées bien au-delà de 2035. La cryptographie ne peut remplacer la conformité, mais lorsqu’elle est bien gouvernée, elle devient l’un des arguments techniques les plus solides pour démontrer la diligence et la proportionnalité.

## Synthèse : la cryptographie et la gestion des clés dans le récit de la gouvernance

Ce chapitre a traité la cryptographie et la gestion des clés comme des instruments de gouvernance. Les idées centrales sont simples, même si leur mise en œuvre est exigeante.

Premièrement, le chiffrement ne vaut que ce que vaut la gestion des clés. Les affirmations de chiffrement robuste sont vides de sens si les clés ne sont pas contrôlées, sont mal gérées ou sont concentrées d’une manière incompatible avec l’appétence pour le risque. Les clés sont des actifs qui exigent des responsables, des inventaires, des cycles de vie, une séparation des tâches et des éléments probants. Deuxièmement, les choix cryptographiques incarnent des décisions de gouvernance quant aux personnes qui peuvent accéder aux données, aux conditions de cet accès, à la piste d’audit qui l’accompagne et à la façon dont la reprise et l’accès légal sont gérés. Ces décisions doivent être prises consciemment par des responsables du risque imputables, et non laissées aux paramètres par défaut des fournisseurs ou aux habitudes de chaque administrateur.

Troisièmement, les clés gérées par le client et les modèles de gestion des clés infonuagiques donnent aux organisations davantage de contrôle, mais leur imposent aussi une responsabilité accrue en matière de disponibilité, de gestion du cycle de vie et d’accès légal. Ce sont des options de gouvernance, et non des améliorations automatiques. Quatrièmement, le séquestre et la reprise des clés se situent à la croisée de la continuité, du risque lié aux initiés et de la conformité juridique; ils exigent une politique claire, des contrôles à plusieurs intervenants, des procédures testées et un raisonnement transparent sur les compromis.

Cinquièmement, la cryptographie ne concerne pas seulement les données au repos; elle concerne aussi la confiance entre machines, l’ICP et l’identité des charges de travail et des appareils qui composent les environnements modernes. Le passage à des certificats publics de 47 jours d’ici 2029 transforme la gestion des certificats, d’une corvée administrative, en une discipline d’automatisation et de résilience. Les défaillances dans ce domaine entraînent des pannes et des usurpations d’identité, même lorsque le chiffrement des données semble solide.

Sixièmement, la transition post-quantique est passée de la recherche à la gouvernance. Les normes existent, des calendriers ont été publiés par le NIST, le Centre canadien pour la cybersécurité et l’Union européenne, et le risque « récolter maintenant, déchiffrer plus tard » signifie que les données sensibles à longue durée de vie sont déjà exposées. Les organisations qui respecteront les jalons de 2031 et de 2035 sont celles qui dressent dès maintenant un inventaire cryptographique, investissent dans l’agilité cryptographique, intègrent leurs fournisseurs au programme et rendent compte de leurs progrès au conseil d’administration comme pour toute autre initiative stratégique.

Questions que les gestionnaires et les conseils d’administration devraient poser

- Inventaire : disposons-nous d’un inventaire à jour de nos clés, certificats, secrets et algorithmes, avec un responsable, une finalité et une date d’expiration pour chacun, et dans quelle mesure est-il complet?
- Classification : nos exigences cryptographiques découlent-elles de notre schéma de classification de l’information, et pouvons-nous indiquer quels systèmes contenant des données à diffusion restreinte n’y satisfont pas encore?
- Contrôle : pour nos données les plus critiques, qui détient les clés, que peut faire un administrateur seul, et comment saurions-nous si les clés étaient utilisées à mauvais escient?
- Nuage et SaaS : quel modèle de gestion des clés avons-nous choisi pour chaque fournisseur important, quelles responsabilités et quels modes de défaillance ce choix a-t-il créés, et quels éléments probants recevons-nous?
- Reprise : quand avons-nous réussi pour la dernière fois un test de reprise de chaque hiérarchie de clés critique, y compris les clés de sauvegarde, dans des conditions de sinistre réalistes?
- Accès légitime : avons-nous une position approuvée sur le déchiffrement des données en réponse à des demandes juridiques et dans le cadre d’enquêtes, et nos architectures et nos contrats permettent-ils de mettre cette position en œuvre?
- Certificats : combien de nos certificats se renouvellent automatiquement, combien de services critiques pourraient tomber en panne en raison d’une expiration au cours des 30 prochains jours, et sommes-nous prêts pour les certificats de 100 jours en 2027?
- Post-quantique : qui est imputable de notre migration post-quantique, quels systèmes sont exposés au risque « récolter maintenant, déchiffrer plus tard », et où en sommes-nous par rapport aux jalons de 2031 et de 2035?
- Fournisseurs : nos principaux fournisseurs nous ont-ils remis des feuilles de route post-quantiques, des preuves de validation de leurs modules et des déclarations cryptographiques comme des CBOM, et ces exigences figurent-elles dans nos contrats?
- Exceptions : combien d’exceptions cryptographiques sont actives, qui les a approuvées, et combien ont dépassé leur date d’échéance?
- Préparation aux violations : si des données chiffrées étaient volées demain, pourrions-nous prouver à un organisme de réglementation que les clés n’ont pas été compromises?
Enfin, dans l’orientation générale de ce manuel, la cryptographie et la gestion des clés sont des contrôles habilitants transversaux. Elles soutiennent l’ingénierie de la protection de la vie privée, la gouvernance de l’infonuagique et des tiers, la gestion des identités et des accès, la gestion des incidents et la résilience, ainsi que la logique économique de la réduction des risques. Lorsque les gestionnaires peuvent poser les bonnes questions et y répondre — à savoir ce qui est chiffré, qui détient les clés, ce qui se passe si nous les perdons, ce qui se passe si nous sommes contraints de les utiliser, à quelle vitesse nous pouvons les changer et comment nous pouvons démontrer notre contrôle —, la cryptographie cesse d’être une exigence technique mystérieuse et devient une partie intégrante d’une gouvernance de la cybersécurité défendable.

## Résumé du chapitre

Une politique selon laquelle les données sensibles doivent être chiffrées masque les décisions qui déterminent réellement la protection : quelles données, dans quels états, sous le contrôle de qui, avec quelles dispositions de récupération, et dans quelles conditions l’organisation acceptera de déchiffrer. Ce chapitre traite la cryptographie comme un instrument de gouvernance et la gestion des clés comme le mécanisme par lequel s’exerce son pouvoir. Il explique ce que le chiffrement accomplit et où il s’arrête, déduit les exigences de la classification, et examine la responsabilité des clés, les modèles de clés infonuagiques, le séquestre et l’accès légal, les certificats et la confiance entre machines, ainsi que la transition post-quantique. Son message central est que le chiffrement ne vaut que ce que vaut la gestion des clés, et que les choix cryptographiques doivent être faits par des responsables imputables et étayés par des éléments probants.

Points clés à retenir

- La cryptographie sert trois objectifs distincts, la confidentialité, l’intégrité et l’authenticité, et elle déplace le risque plutôt que de l’éliminer, en concentrant la protection dans les clés.
- Le chiffrement protège contre la perte d’appareils, le vol de supports, l’interception et certaines compromissions de l’infrastructure, mais non contre l’usage abusif autorisé, les attaques visant la logique applicative ou la perte de ses propres clés.
- Les attentes cryptographiques devraient découler de la classification de l’information, être intégrées aux bases de référence et appliquées par défaut, les exceptions étant documentées, assumées, compensées et assorties d’une date d’échéance.
- Chaque état des données, en transit, au repos, en cours d’utilisation, ainsi que dans les journaux et les copies, soulève sa propre question : qui peut déchiffrer et où les clés sont-elles conservées?
- Les clés sont des actifs qui exigent un inventaire, des responsables, des cryptopériodes, un cycle de vie gouverné, une protection dans des HSM ou des services gérés, ainsi que la séparation des tâches et le double contrôle pour les opérations les plus sensibles.
- La responsabilité des clés comporte des dimensions juridique, opérationnelle et de gouvernance, qu’un modèle opérationnel et une politique courte, accompagnée d’une norme régulièrement mise à jour, doivent répartir explicitement.
- Les modèles de clés gérées par le client transfèrent à la fois le contrôle et la responsabilité : l’organisation acquiert le pouvoir d’exclure les autres, mais aussi celui de s’exclure elle-même.
- Le séquestre de clés et la récupération doivent concilier la continuité, le risque interne et l’accès légal, en s’appuyant sur une position explicite quant à l’accès légal, un contrôle à plusieurs personnes et des procédures testées.
- Les certificats sont des identités de machines, et le passage à des certificats publics de 47 jours d’ici 2029 fait de la gestion automatisée, assumée et surveillée du cycle de vie des certificats une exigence de résilience.
- La migration post-quantique est un programme de gouvernance actuel en raison du risque « récolter maintenant, déchiffrer plus tard » et de la durée des migrations, ancré dans les nouvelles normes du NIST et les jalons de 2031 et de 2035.
- L’assurance cryptographique repose sur des éléments probants de configuration, de couverture, de gestion des clés, d’inventaire, de tests et de validation, ainsi que sur des ICR assortis de responsables et de seuils, présentés en termes d’affaires.
- Le chiffrement ne fait pencher l’évaluation d’une violation vers un risque moindre, au sens de la Loi 25, de la LPRPDE et du RGPD, que si l’organisation peut prouver que les clés n’ont pas été compromises.
Termes clés

- Protection de l’intégrité — Utilisation d’empreintes cryptographiques et de codes d’authentification de message pour détecter si des données ont été modifiées pendant leur stockage ou leur transit.
- Signature numérique — Mécanisme cryptographique qui permet à une partie de prouver qu’un message, un document ou un progiciel provient d’un détenteur de clé précis et n’a pas changé depuis sa signature.
- Chiffrement par enveloppe — Hiérarchie de clés dans laquelle quelques clés maîtresses très protégées chiffrent de nombreuses clés de chiffrement de données, qui chiffrent à leur tour les données.
- Cryptopériode — Période pendant laquelle l’utilisation d’une clé précise est autorisée.
- Module matériel de sécurité (HSM) — Dispositif inviolable qui génère et stocke des clés et effectue des opérations cryptographiques sans exposer le matériel de clé.
- Double contrôle et connaissance fractionnée — Dispositions qui exigent que deux personnes autorisées ou plus agissent ensemble, de sorte qu’aucune personne ne détienne jamais un secret complet.
- Informatique confidentielle — Protection des données en cours d’utilisation par l’exécution des calculs dans un environnement d’exécution de confiance matériel et attesté.
- Apportez votre propre clé (BYOK) — Modèle dans lequel le client génère le matériel de clé dans son propre environnement et l’importe dans le service de gestion des clés du fournisseur.
- Conservez votre propre clé (HYOK) — Modèle qui garde les clés maîtresses à l’extérieur du fournisseur principal, lequel doit faire appel à l’environnement du client pour chaque déchiffrement.
- Séquestre de clés — Dépôt de copies de clés cryptographiques auprès d’une partie de confiance interne ou externe, afin qu’elles puissent être récupérées ou utilisées dans des conditions définies.
- Infrastructure à clés publiques (ICP) — Ensemble des autorités de certification, des politiques, des procédures et des technologies qui délivrent, gèrent, renouvellent et révoquent les certificats.
- « Récolter maintenant, déchiffrer plus tard » — Pratique d’un adversaire qui consiste à capter aujourd’hui des données chiffrées et à les conserver jusqu’à ce qu’elles puissent être déchiffrées, par exemple par un futur ordinateur quantique.
- Agilité cryptographique — Capacité de changer rapidement et de façon sûre les algorithmes, les paramètres et les mises en œuvre cryptographiques sans repenser les systèmes.
- Nomenclature cryptographique (CBOM) — Extension du concept de SBOM qui décrit les actifs cryptographiques d’un produit logiciel.
- Inventaire cryptographique — Registre des algorithmes, longueurs de clés, protocoles, certificats, bibliothèques et modules qu’utilise chaque système, avec leur finalité, les données protégées, la durée de confidentialité requise, le responsable et le fournisseur.

## Questions de révision

Questions à développement

1. Un fournisseur affirme à votre organisation que toutes les données des clients de sa plateforme SaaS sont chiffrées. À l’aide des deux questions d’ancrage du chapitre et des quatre états des données, analysez ce que cette affirmation peut signifier et ne pas signifier, et formulez les questions que vous poseriez au fournisseur avant de l’accepter.

2. Analysez l’incident BYOK du fabricant québécois. Relevez les défaillances de gestion qui ont permis la perte de la clé, évaluez les mesures correctives prises et recommandez toute mesure supplémentaire tirée de la façon dont le chapitre traite les clés comme des actifs et les modèles de clés gérées par le client.

3. Choisissez une organisation que vous connaissez (ou une organisation fictive) et évaluez où elle devrait se situer, pour un service infonuagique critique, dans l’éventail allant des clés gérées par le fournisseur au HYOK. Justifiez ce choix en fonction des menaces, du risque pour la disponibilité, de l’accès légal, de la résidence des données et de la capacité opérationnelle.

4. La panne de certificat de la coopérative de crédit est survenue malgré des algorithmes robustes et un audit sans réserve de sa norme cryptographique. À l’aide du triangle du risque et du calendrier de durée de vie des certificats du scrutin SC-081, évaluez pourquoi c’est la gouvernance plutôt que la technologie qui a échoué, et déterminez si la réponse du conseil d’administration est suffisante pour 2027 et 2029.

5. Concevez les deux premières années d’un programme de migration post-quantique pour une organisation canadienne qui vend au gouvernement fédéral. Expliquez comment vous bâtiriez l’inventaire cryptographique, prioriseriez les systèmes, intégreriez les fournisseurs au programme, financeriez les travaux et rendriez compte des progrès au conseil d’administration.

Questions à choix multiples

Choisissez la meilleure réponse. Les réponses figurent à l’annexe « Réponses aux questions à choix multiples ».

1. Un éditeur de logiciels signe chaque version afin que ses clients puissent en vérifier l’origine. Quel objectif cryptographique cela sert-il principalement?

A. La confidentialité, en empêchant d’autres personnes de lire le logiciel

B. La disponibilité, en garantissant que le logiciel peut toujours être téléchargé

C. L’authenticité, en prouvant que le progiciel provient d’un détenteur de clé précis

D. La vie privée, en limitant les données personnelles que recueille le logiciel

2. Une base de données de clients est entièrement chiffrée au repos. Contre quel incident ce chiffrement serait-il peu utile?

A. Une faille d’injection dans l’application Web qui renvoie des dossiers en clair

B. Le vol d’un disque mis hors service dont on s’est mal débarrassé

C. La perte d’une bande de sauvegarde pendant son transport vers une voûte hors site

D. Une compromission de la couche d’hébergement exposant des volumes de stockage bruts

3. Des dossiers de santé doivent rester confidentiels pendant 10 ans, la migration prendra 7 ans et une menace quantique est attendue dans 12 ans. Que conclut le raisonnement de Mosca?

A. L’organisation dispose d’une marge de cinq ans avant de devoir commencer

B. L’organisation peut attendre l’annonce d’un ordinateur quantique

C. Le test ne s’applique pas aux dossiers de santé, seulement aux données gouvernementales

D. L’organisation est déjà en retard, car 10 plus 7 dépasse 12

4. Dans le tableau de classification type du chapitre, quelle attente cryptographique s’applique à l’information restreinte, comme les données de cartes et les clés?

A. Chiffrement de la plateforme par défaut et chiffrement standard du transport

B. Chiffrement robuste partout, clés dans un HSM ou un KMS géré, et séparation stricte des tâches

C. Protection de l’intégrité et de l’authenticité pour le contenu publié seulement

D. Chiffrement en transit seulement, le stockage en clair étant permis à l’interne

5. Selon la feuille de route ITSM.40.001 du Centre canadien pour la cybersécurité, à quel moment les systèmes hautement prioritaires du gouvernement du Canada devraient-ils avoir terminé leur migration vers la cryptographie post-quantique?

A. D’ici la fin de 2026

B. D’ici la fin de 2031

C. D’ici la fin de 2030

D. D’ici la fin de 2035

6. Quelle disposition de sauvegarde le chapitre présente-t-il comme un piège particulier?

A. Des sauvegardes chiffrées avec des clés détenues sous double contrôle

B. Des sauvegardes isolées du réseau de production

C. Des sauvegardes dont les clés de récupération sont testées chaque année

D. Des sauvegardes dont la clé n’est conservée que dans l’environnement sauvegardé

7. Quelle dimension de la responsabilité des clés répond de l’alignement de la gestion des clés sur l’appétence pour le risque, les obligations réglementaires et la politique interne?

A. L’imputabilité en matière de gouvernance, partagée entre le CSI, les responsables des données, ainsi que les services juridiques et la protection des renseignements personnels

B. Le contrôle opérationnel, détenu par quiconque peut générer, renouveler ou révoquer les clés

C. La propriété juridique, détenue par la partie qui a le droit de contrôler l’utilisation des clés

D. La garde technique, détenue par le fournisseur qui a configuré la plateforme

8. Selon la définition du Confidential Computing Consortium citée dans le chapitre, quelle caractéristique définit l’informatique confidentielle?

A. Un chiffrement au niveau des champs qui cache les données aux administrateurs de bases de données

B. Une tokenisation qui substitue des jetons aux valeurs sensibles

C. L’exécution des calculs dans un environnement d’exécution de confiance matériel et attesté

D. Un chiffrement de bout en bout dont les clés ne sont détenues que par chaque utilisateur

9. Une organisation utilise le chiffrement par enveloppe, une seule clé maîtresse protégeant des milliers de clés de données. Quelle conséquence en découle sur le plan de la gouvernance?

A. Le renouvellement et la révocation deviennent impraticables dans toute la hiérarchie

B. Les clés de données n’ont plus besoin d’entrées d’inventaire ni de responsables

C. La séparation des tâches n’est plus nécessaire pour les administrateurs

D. La perte ou la compromission de la clé maîtresse a un rayon d’impact très étendu

10. Comment le chapitre recommande-t-il de présenter au conseil d’administration un ICR sur l’expiration des certificats?

A. Sous forme de nombre total de certificats détenus, par exemple 1 200 certificats

B. En termes d’affaires, par exemple quatre services destinés aux membres exposés à une panne d’ici 30 jours

C. Sous forme de pourcentage de certificats délivrés par des autorités privées plutôt que publiques

D. Dans une annexe technique énumérant la date d’expiration de chaque certificat

11. Pourquoi les organisations matures appliquent-elles le double contrôle et la connaissance fractionnée à des opérations comme la restauration d’une clé maîtresse à partir d’une sauvegarde?

A. Pour qu’aucune personne ne puisse effectuer seule l’opération ni détenir le secret complet

B. Pour que l’opération puisse être effectuée plus rapidement pendant un incident

C. Pour que le fournisseur du HSM puisse effectuer l’opération au nom du client

D. Pour que les journaux d’utilisation des clés ne soient plus nécessaires pour ces opérations

12. Le calendrier de transition du NIST a placé tous les certificats FIPS 140-2 restants sur la liste historique en septembre 2026. Que devraient en conclure les gestionnaires?

A. Les modules validés selon la norme FIPS 140-2 ne peuvent plus être exploités

B. Le statut de validation n’a plus d’importance pour l’approvisionnement cryptographique

C. Il ne faut plus se fier aux certificats FIPS 140-2 pour les nouveaux approvisionnements

D. Seuls les modules canadiens doivent désormais être validés selon la norme FIPS 140-3

13. Une organisation adopte le HYOK pour plusieurs applications SaaS et conserve ses clés maîtresses dans son propre service de clés externe. Quel nouveau mode de défaillance cela introduit-il?

A. Le fournisseur peut désormais déchiffrer les données à l’insu du client

B. Une panne du service de clés du client paralyse toutes les applications infonuagiques dépendantes

C. L’utilisation des clés ne peut plus être journalisée dans le propre compte du client

D. La couche applicative du fournisseur ne peut plus traiter aucune donnée

14. Les clés de récupération des ordinateurs portatifs sont placées sous séquestre dans le service de gestion des appareils de l’organisation. Comment l’accès à ce séquestre devrait-il être gouverné?

A. Restreint, journalisé et examiné comme toute autre capacité privilégiée

B. Ouvert à tout le personnel du centre d’assistance, sans journalisation, pour accélérer le soutien

C. Délégué au fabricant des appareils, qui détient la propriété juridique des clés

D. Entièrement désactivé, en acceptant qu’un mot de passe oublié signifie un appareil perdu

15. Dans la mise en situation du fabricant québécois, la clé maîtresse BYOK était introuvable. Quelle cause profonde la revue post-incident a-t-elle relevée?

A. Une faiblesse de l’algorithme de gestion des clés du fournisseur SaaS

B. Une attaque qui a délibérément détruit le HSM sur place

C. Les exigences de chiffrement irréalistes du client du secteur de la défense

D. Des défaillances de gestion : aucun responsable, aucune entrée d’inventaire et aucune vérification des dépendances cryptographiques à la mise hors service

16. En vertu du scrutin SC-081, la durée de validité des certificats TLS publics passera à 47 jours d’ici 2029. Combien de renouvellements par certificat par année cela implique-t-il environ, comparativement à un seul aujourd’hui?

A. Environ deux renouvellements par année

B. Environ quatre renouvellements par année

C. Environ huit renouvellements par année

D. Environ douze renouvellements par année

17. En vertu du scrutin SC-081 du CA/Browser Forum, quelle est la durée de validité maximale d’un certificat TLS de confiance publique délivré le 15 mars 2027 ou après?

A. 200 jours

B. 47 jours

C. 100 jours

D. 398 jours

18. Pourquoi le risque « récolter maintenant, déchiffrer plus tard » fait-il de la migration post-quantique une préoccupation actuelle?

A. Parce que le chiffrement symétrique actuel est déjà cassé par les ordinateurs quantiques

B. Parce que l’exposition des données à longue durée de vie commence au moment de leur interception, et non à l’apparition d’un ordinateur quantique

C. Parce que le NIST a déjà interdit les algorithmes RSA et à courbes elliptiques

D. Parce que les ordinateurs quantiques peuvent modifier rétroactivement les signatures numériques

19. Quelle norme du NIST précise l’algorithme destiné à être le principal mécanisme d’établissement de clés partagées dans la transition post-quantique?

A. FIPS 203, qui précise ML-KEM

B. FIPS 204, qui précise ML-DSA

C. FIPS 205, qui précise SLH-DSA

D. FIPS 206, qui précise FN-DSA

20. Après le vol de données de clients chiffrées, qu’est-ce qui détermine le plus si le chiffrement compte comme facteur atténuant dans l’évaluation d’une violation au sens de la Loi 25, de la LPRPDE ou du RGPD?

A. Le fait que l’algorithme de chiffrement ait été choisi par le fournisseur

B. Le fait que les données aient été stockées dans un centre de données canadien

C. Le fait que l’organisation soit titulaire d’un certificat ISO/IEC 27001

D. Le fait que l’organisation puisse prouver que les clés n’ont pas été compromises
