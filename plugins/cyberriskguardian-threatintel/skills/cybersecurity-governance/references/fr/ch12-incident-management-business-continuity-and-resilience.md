<!-- Léger, M.-A. (2026). Introduction à la gouvernance de la cybersécurité pour la gestion des technologies d’affaires (3e éd., v2.51). Chapitre 12 : Gestion des incidents, continuité des activités et résilience. CC BY-NC 4.0 -->

# Chapitre 12 : Gestion des incidents, continuité des activités et résilience

## Résultats d’apprentissage

Au terme de ce chapitre, vous devriez être en mesure de :

1. Expliquer pourquoi les incidents de cybersécurité majeurs deviennent des crises pour la haute direction et déterminer les droits décisionnels et les seuils de remontée qui doivent exister avant qu’un incident commence.

2. Distinguer les rôles de l’équipe d’intervention en cas d’incident et de la cellule de crise, et concevoir l’interface qui les fait s’imbriquer.

3. Appliquer les cinq phases du cycle de vie des incidents vues par la haute direction, y compris une revue post-incident qui cerne les causes managériales autant que techniques.

4. Comparer les obligations de notification de la Loi 25 du Québec, de la LPRPDE, du BSIF, de la SEC, de la directive NIS2 et du règlement DORA, et recommander une façon de gérer plusieurs délais à la fois.

5. Évaluer la préparation aux rançongiciels comme une préparation à la capacité de reprise et justifier une approche de la décision d’extorsion approuvée par le conseil d’administration.

6. Distinguer la MTPD, le RTO, le RPO et le MBCO, et expliquer comment les objectifs de reprise devraient découler en cascade des tolérances d’affaires jusqu’aux capacités de reprise après sinistre.

7. Évaluer les plans de reprise après sinistre et de résilience opérationnelle quant au réalisme de la restauration, à la reprise saine, à la reconstitution des identités et à la dépendance systémique, en prenant pour référence la ligne directrice E-21 du BSIF.

8. Recommander des mesures de résilience, des exercices et une séquence de mise en œuvre axée d’abord sur la gouvernance, qui fournissent aux conseils d’administration des éléments probants que la capacité de reprise est réelle.

Toute organisation qui dépend de services numériques subira, tôt ou tard, un incident de cybersécurité assez grave pour perturber ses activités. Les chapitres précédents ont traité cette question sous l’angle du risque résiduel : aucune combinaison de contrôles, si judicieuse soit-elle, ne ramène à zéro la vraisemblance d’une compromission. Le chapitre 4 a expliqué que les responsables du risque doivent accepter un certain risque résiduel, les chapitres 5 et 6 ont montré comment l’évaluation fondée sur des scénarios rend ce risque résiduel visible, et le chapitre 8 a décrit la discipline opérationnelle de l’intervention en cas d’incident — préparation, identification et analyse, confinement, éradication, reprise et amélioration post-incident. Le présent chapitre reprend là où ces discussions s’arrêtent. Il se demande ce qui se passe lorsque le risque résiduel se matérialise à une échelle que le centre des opérations de sécurité (COS) ne peut absorber à lui seul.

À cette échelle, un incident n’est plus un événement technique. Il devient une crise d’affaires susceptible de toucher les clients, les patients, le personnel, les organismes de réglementation, les fournisseurs, les assureurs, les investisseurs, les forces de l’ordre, les médias et le public. Une attaque par rançongiciel peut se transformer en problème de liquidités, en problème de sécurité des patients, en arrêt de production, en rupture de contrat, en avis relatif à la protection des renseignements personnels, en communication d’information exigée par la réglementation des valeurs mobilières et en crise de réputation, le tout dans la même semaine. Une panne chez un fournisseur infonuagique peut révéler qu’une organisation prétendument diversifiée était concentrée sur une seule plateforme. La compromission d’un fournisseur peut exposer des dépendances que personne n’avait cartographiées. Dans chaque cas, les questions décisives sont managériales : qui décide, sur la base de quels éléments probants, dans les limites de quels pouvoirs et avec quelle imputabilité.

Le problème de gouvernance tient au fait que la plupart des organisations se préparent aux incidents de façon fragmentée. L’équipe de sécurité est responsable d’un plan d’intervention en cas d’incident, les technologies de l’information (TI), d’un plan de reprise après sinistre; une personne coordonnatrice de la continuité des activités tient à jour un plan que peu de gens ont lu, les services juridiques disposent d’une procédure en cas d’incident de confidentialité, et les communications ont un gabarit de crise. Chaque document peut être valable en soi. Pourtant, lorsqu’un incident majeur survient, ces plans doivent fonctionner comme un seul système sous une pression de temps extrême, et c’est à leurs jointures que les organisations échouent. La gestion des incidents, la continuité des activités et la résilience doivent donc être gouvernées comme une seule capacité d’entreprise, assortie de droits décisionnels prédéfinis, de seuils de remontée, d’objectifs de reprise, de processus de notification, d’une rigueur de la preuve et d’une reddition de comptes post-incident.

Les orientations actuelles renforcent ce point de vue. La publication NIST SP 800-61 Rev. 3 (avril 2025) présente l’intervention en cas d’incident comme une composante de la gestion des risques de cybersécurité et organise ses recommandations autour des six fonctions du Cadre de cybersécurité (CSF) 2.0 du NIST, y compris la fonction Gouverner, comme nous le verrons plus loin dans ce chapitre. La norme ISO 22301:2019 (modifiée en 2024) définit les exigences d’un système de gestion de la continuité des activités, et la série ISO/IEC 27035 offre une vision par système de gestion de la gestion des incidents de sécurité de l’information. Pour les institutions financières fédérales (IFF) au Canada, la ligne directrice E-21 du Bureau du surintendant des institutions financières (BSIF) sur la gestion du risque opérationnel et la résilience opérationnelle a atteint sa date d’application intégrale le 1er septembre 2026, ce qui fait des opérations critiques et de la tolérance aux perturbations une attente en matière de surveillance plutôt qu’une bonne pratique volontaire.

Ce chapitre adopte le point de vue de la haute direction, de la crise et de la continuité. Il ne reprend pas les mécanismes opérationnels traités au chapitre 8. Il examine plutôt pourquoi les incidents majeurs doivent être gérés comme des crises au niveau de la haute direction, comment l’équipe opérationnelle d’intervention en cas d’incident et la cellule de crise de la haute direction devraient s’imbriquer, comment gouverner le cycle de vie des incidents, comment gérer les obligations légales et réglementaires dont les délais se chevauchent, pourquoi le rançongiciel est devenu le test de résistance déterminant de la capacité de reprise, et comment la continuité des activités, la reprise après sinistre et la résilience opérationnelle s’articulent. Un scénario résolu suit un distributeur québécois aux prises avec une crise de rançongiciel, et le chapitre se termine par des mesures, une séquence de mise en œuvre et des questions que les conseils d’administration devraient poser.

## Pourquoi les incidents majeurs sont des crises pour la haute direction

Les organisations décrivent souvent l’intervention en cas d’incident comme une fonction technique : détecter, confiner, éradiquer et rétablir. Cette description est juste, mais incomplète. Les incidents qui comptent le plus pour la gouvernance se déroulent sous la pression du temps, avec de l’information incomplète, une incertitude juridique, des perturbations opérationnelles et un examen public. Dans ces moments, l’organisation doit répondre à des questions qui relèvent fondamentalement de la gestion. Trois de ces questions définissent le point de vue de la haute direction, et chacune correspond à une capacité de gouvernance qui doit exister avant le début de l’incident.

Quel préjudice l’organisation subit-elle ou est-elle sur le point de subir?

La première question relie l’incident à la raison d’être de l’organisation. Il est rarement utile aux dirigeants de savoir quels serveurs sont chiffrés ou quels comptes sont compromis; ils ont besoin de savoir quels services sont interrompus, quels clients ou patients pourraient subir un préjudice, quels engagements contractuels pourraient ne pas être respectés, quelles obligations réglementaires pourraient être déclenchées et à quelle vitesse le préjudice s’aggravera si les décisions tardent. C’est le langage de l’impact sur les activités, le même que celui du triangle du risque présenté plus tôt dans le manuel : la menace s’est concrétisée et a exploité une vulnérabilité, si bien que l’attention de la gouvernance se déplace résolument vers l’impact.

Traduire des faits techniques en préjudice pour l’organisation ne va pas de soi. Cela exige une cartographie à jour des services critiques et de leurs dépendances, un bilan d’impact sur les activités (BIA) qui décrit comment le préjudice s’accroît avec le temps, et des personnes capables de faire le pont entre le vocabulaire technique et celui des affaires. Les organisations qui ne disposent pas de ces atouts passent les premières heures d’une crise à les reconstituer sous pression. Celles qui en disposent peuvent passer presque immédiatement de « qu’est-ce qui est en panne? » à « qu’est-ce que cela signifie pour nos clients, nos obligations et notre viabilité? ».

La question du préjudice est aussi tournée vers l’avenir. Lors d’un incident de rançongiciel, les systèmes chiffrés ne sont que le préjudice visible; l’attaquant peut aussi avoir exfiltré des données, détenir encore des identifiants privilégiés et préparer une deuxième étape. Les dirigeants doivent gouverner le préjudice qui pourrait encore survenir, et pas seulement celui qui est déjà survenu.

Qui a le pouvoir de prendre des décisions qui engagent l’organisation?

Les incidents majeurs exigent des décisions qui touchent l’ensemble de l’entreprise. Arrêter un réseau de production, suspendre les services bancaires en ligne, déconnecter un fournisseur clé, invoquer une déclaration de sinistre, aviser un organisme de réglementation, retenir les services d’avocats externes, faire jouer la cyberassurance, communiquer avec les forces de l’ordre ou répondre à une demande d’extorsion ne sont pas des décisions techniques. Elles engagent l’organisation sur les plans juridique, financier et réputationnel, et elles doivent être prises par des personnes qui ont le pouvoir de les prendre.

L’échec de gouvernance ne tient généralement pas au fait que la mauvaise personne décide; il tient au fait que personne ne sait avec certitude qui devrait décider. Lorsque les pouvoirs sont flous, les décisions tardent pendant que les gens cherchent une autorisation, ou elles sont prises par quiconque se trouve disponible et sont ensuite contestées. Les droits décisionnels relatifs aux mesures de crise doivent être définis, documentés et répétés avant que l’incident ne survienne, avec des suppléants désignés pour les cas où le décideur principal est indisponible, en déplacement ou personnellement touché. Il s’agit d’une application directe des principes d’imputabilité abordés au chapitre 2 et de la fonction Gouverner du NIST CSF 2.0, qui exige que les rôles, les responsabilités et les pouvoirs liés à la gestion des risques de cybersécurité soient établis et communiqués. Au minimum, cinq types de pouvoirs devraient être attribués :

- Pouvoir de confinement : qui peut isoler des réseaux, désactiver l’accès à distance ou mettre hors ligne des systèmes offerts à la clientèle lorsque les éléments probants le justifient, même à un coût important à court terme.
- Pouvoir de divulgation : qui approuve les avis destinés aux organismes de réglementation, aux personnes concernées, aux clients, aux investisseurs et au public, et qui les signe.
- Pouvoir financier : qui peut engager des dépenses d’urgence pour des firmes de criminalistique, des conseillers juridiques, une infrastructure temporaire ou des mesures de réparation auprès des clients, en dehors du cycle d’approvisionnement habituel.
- Pouvoir en matière d’extorsion : qui, le cas échéant, peut entrer en contact avec un acteur de menace, et quelle instance doit approuver toute décision relative à un paiement.
- Pouvoir de reprise des activités : qui détermine que les systèmes sont suffisamment fiables pour revenir en production et que l’organisation peut sortir du mode de crise.
Comment l’organisation démontrera-t-elle sa diligence par la suite?

La troisième question porte sur le caractère défendable des décisions. Une organisation peut se rétablir sur le plan opérationnel et pourtant échouer sur le plan de la gouvernance si elle ne peut pas démontrer que ses décisions étaient raisonnables, fondées sur des éléments probants, proportionnées, prises en temps opportun et dûment autorisées. Les organismes de réglementation, les assureurs, les tribunaux, les auditeurs, les clients et les conseils d’administration demanderont plus tard ce que l’organisation savait, à quel moment elle l’a su, quelles options elle a envisagées, qui a approuvé les décisions clés, quels éléments probants elle a conservés et si sa conduite était conforme à ses propres politiques et à la posture de risque qu’elle avait déclarée.

C’est pourquoi le manuel insiste à maintes reprises sur les décisions défendables. En situation de crise, on n’obtient pas le caractère défendable en ayant raison après coup; on l’obtient en décidant au moyen d’un processus rigoureux et en consignant ce processus. Une décision de retarder un avis pendant la vérification des faits, par exemple, peut être tout à fait raisonnable, mais seulement si l’organisation peut démontrer qu’elle vérifiait activement les faits, que des conseillers juridiques ont été consultés et que le délai était limité. La même décision, prise en silence et consignée nulle part, ressemble à de la dissimulation.

En situation de crise, une organisation agit au niveau de sa préparation en matière de gouvernance, et non au niveau de ses outils techniques.

Structures de crise permanentes et seuils de remontée

Ces trois questions mènent à une conclusion pratique : la gestion de crise exige des structures permanentes, et non des rassemblements improvisés. L’organisation devrait savoir à l’avance qui dirige la crise, qui fournit les faits techniques, qui représente les intérêts juridiques et réglementaires, qui communique à l’externe, qui assure la coordination avec les fournisseurs, qui informe le conseil d’administration, qui gère la continuité et qui consigne les décisions. Elle devrait aussi définir des seuils de remontée, soit les critères qui font passer un incident d’un traitement technique à une gestion de crise par la haute direction.

Les seuils de remontée sont plus efficaces lorsqu’ils sont exprimés en termes d’affaires plutôt qu’en termes techniques. Mentionnons, par exemple, l’interruption d’un service critique au-delà d’une période définie, des éléments probants crédibles indiquant que les renseignements personnels de plus d’un nombre défini de personnes ont fait l’objet d’un accès, tout incident ayant des conséquences possibles sur la sécurité des personnes dans les environnements de technologie opérationnelle (TO) (voir le chapitre 11), tout incident susceptible de déclencher une obligation de déclaration réglementaire, toute demande d’extorsion et tout incident susceptible d’attirer l’attention des médias. Ces seuils devraient être rattachés aux énoncés d’appétence pour le risque et de tolérance au risque de l’organisation, de sorte que le dépassement d’une tolérance pendant un incident en cours mobilise automatiquement les personnes responsables de cette tolérance.

## Deux systèmes qui doivent s’imbriquer : l’équipe d’intervention en cas d’incident et la cellule de crise

Un échec fréquent lors de cyberincidents majeurs consiste à attendre d’un seul groupe, souvent une équipe opérationnelle dirigée par le chef de la sécurité de l’information (CSI), qu’il mène l’intervention technique et gère en même temps les conséquences pour l’entreprise. En pratique, il s’agit de deux systèmes distincts, dont les objectifs, les horizons de décision, les besoins d’information et les critères de réussite diffèrent. Une gouvernance mature des incidents ne les fusionne pas en une seule structure surchargée, pas plus qu’elle ne les sépare au point qu’ils perdent contact. Elle les fait s’imbriquer.

L’équipe opérationnelle d’intervention en cas d’incident

L’équipe d’intervention en cas d’incident a pour raison d’être de réduire l’avantage de l’attaquant et de stabiliser l’environnement technique. Elle effectue le triage, l’enquête, le confinement, l’éradication, la restauration et la collecte des éléments probants. Elle coordonne le centre des opérations de sécurité (COS), les opérations des TI, les équipes responsables du nuage, du réseau, des terminaux et des identités, les ingénieurs en technologie opérationnelle lorsque c’est pertinent, les fournisseurs de services gérés et les spécialistes externes en criminalistique. Ses méthodes de travail — guides d’intervention (playbooks), niveaux de gravité, salles de crise et cycle de vie de l’intervention — sont décrites au chapitre 8 et ne sont pas reprises ici.

Du point de vue de la gouvernance, ce qui compte, c’est ce que l’équipe d’intervention produit pour le reste de l’organisation : des faits fiables et obtenus en temps opportun. L’équipe d’intervention devrait pouvoir indiquer ce qui s’est passé, ce qui est touché, ce qui demeure à risque, quelles options de confinement existent et ce que chacune coûterait sur le plan opérationnel, quelles dépendances de reprise doivent être résolues et quel est son degré de confiance dans chacune de ces conclusions. Elle est évaluée selon sa rapidité, son exactitude, l’efficacité du confinement, la qualité des éléments probants et sa rigueur sous pression.

La cellule de crise de la haute direction

La cellule de crise a pour raison d’être de gouverner l’incident en tant qu’événement de risque d’entreprise. Elle établit les priorités d’affaires, répartit les ressources, dirige l’intervention juridique et réglementaire, supervise les communications, gère les relations avec les parties prenantes et détermine comment l’organisation traitera les conséquences au-delà de l’environnement technique. Ses décisions peuvent notamment consister à activer les plans de continuité des activités, à suspendre ou à maintenir des services, à aviser les clients et les organismes de réglementation, à faire appel aux assureurs et aux forces de l’ordre, à gérer les fournisseurs, à informer le conseil d’administration et à prendre ou à refuser de prendre des décisions liées à l’extorsion.

La cellule de crise est généralement présidée par le chef de la direction, le chef de l’exploitation ou un autre dirigeant disposant d’un pouvoir à l’échelle de l’entreprise. Elle comprend normalement le CSI et le dirigeant principal de l’information (DPI), le chef du contentieux, la personne responsable de la protection des renseignements personnels, le chef de la gestion des risques, les communications, les finances, les ressources humaines lorsque des employés sont touchés, ainsi que les responsables métier des services critiques les plus touchés. Elle est évaluée selon sa capacité de décision, le caractère défendable de ses décisions, la gestion des parties prenantes, la rigueur juridique, la qualité des communications, la protection de la continuité et la gestion des conséquences à long terme. Ses membres n’ont pas besoin de comprendre chaque détail technique, mais ils doivent en comprendre assez pour remettre en question les faits qu’ils reçoivent et pour reconnaître le moment où une recommandation technique comporte des conséquences pour les affaires.

La figure ci-dessous compare les deux équipes. L’équipe d’intervention se demande comment reprendre le contrôle de l’environnement; la cellule de crise se demande comment protéger l’entreprise pendant ce temps. Aucune de ces questions ne peut trouver de bonne réponse sans l’autre, et la liaison entre les deux est aussi importante que chacune des équipes.

Figure 56 : deux équipes imbriquées : l’intervention en cas d’incident et la gestion de crise

Deux modes de défaillance : la fusion et la fragmentation

Lorsque les deux systèmes sont fusionnés en un seul, l’organisation tend à se concentrer à l’excès sur les détails techniques et à mal s’acquitter de tout le reste. Les responsables techniques principaux sont détournés du confinement pour informer la haute direction, rédiger des déclarations et gérer les fournisseurs, tandis que les dirigeants reçoivent un flot de détails techniques et peu d’analyses utiles à la décision. La préparation juridique, les avis et la gestion des parties prenantes sont traités tardivement et de façon incohérente.

Lorsque les deux systèmes sont séparés sans être intégrés, le problème inverse apparaît. Les équipes techniques agissent sans alignement sur les affaires, rétablissant les systèmes qu’elles jugent importants plutôt que ceux dont l’organisation a besoin en premier. Les dirigeants communiquent sans faits fiables et doivent ensuite se rétracter. L’examen juridique ralentit un confinement urgent, ou le confinement détruit des éléments probants dont les conseillers juridiques avaient besoin. Les unités d’affaires exigent des mesures de reprise qui entrent en conflit avec la préservation des éléments probants à des fins de criminalistique. Les fournisseurs reçoivent des instructions incohérentes, et les clients, les organismes de réglementation et les employés entendent des messages contradictoires.

La maturité de la gouvernance est la capacité de faire fonctionner les deux systèmes en parallèle, avec des transferts clairs, des points de décision synchronisés et une circulation rigoureuse de l’information. L’équipe d’intervention fournit des faits, des évaluations d’impact, des niveaux de confiance, des options et des mises à jour sur les éléments probants. La cellule de crise traduit ces faits en décisions d’entreprise : quoi prioriser, quoi divulguer, quels services suspendre ou rétablir, quelles obligations sont déclenchées et quels risques résiduels la direction est disposée à accepter.

Concevoir l’interface avant l’incident

L’interface entre les deux équipes constitue en soi un document de gouvernance et devrait être conçue, documentée et mise à l’épreuve à l’avance. Plusieurs éléments méritent une attention explicite :

- Un rôle de liaison : une personne désignée, souvent un CSI adjoint ou un gestionnaire principal des incidents, qui siège aux deux équipes, fait la traduction entre elles et protège l’équipe d’intervention contre les interruptions.
- Un rythme de gestion de crise : un calendrier fixe de rapports de situation (par exemple, toutes les quatre heures pendant les deux premiers jours, puis deux fois par jour), selon un format type qui distingue les faits confirmés, les hypothèses de travail, les inconnues et les décisions requises.
- Des critères de remontée immédiate : des événements qui court-circuitent le calendrier, comme des éléments probants d’exfiltration de données, une demande de rançon, une préoccupation relative à la sécurité des personnes, une demande des médias ou une prise de contact par un organisme de réglementation.
- Des décisions réservées : une courte liste de décisions que seule la cellule de crise peut prendre, comme mettre hors ligne un service offert à la clientèle, publier une déclaration externe ou entrer en contact avec un acteur de menace.
- Une source unique de vérité : un dossier d’incident et un journal des décisions uniques, tenus par une personne désignée et chargée de la consignation, et utilisés par les deux équipes.
- Des communications hors bande : des canaux prévus à l’avance qui ne dépendent pas du courriel, de la messagerie ni de la plateforme d’identité de l’organisation, qui pourraient être compromis.
Un test de maturité simple consiste à vérifier si, dans les premières heures d’un incident majeur, l’organisation peut répondre sans hésiter aux questions suivantes : Qui dirige l’intervention technique? Qui dirige l’intervention à l’échelle de l’entreprise? Qui peut arrêter des systèmes ou suspendre des services? Qui s’adresse aux organismes de réglementation, aux clients, aux employés et aux médias? Qui tient le journal des décisions? Qui établit les priorités de reprise? Qui décide du moment où l’organisation peut revenir à ses activités normales? Si l’une de ces questions suscite un débat, l’interface n’a pas été conçue.

## Une vision du cycle de vie des incidents axée sur la gouvernance

Le chapitre 8 a présenté le cycle de vie opérationnel de l’intervention en cas d’incident. Aux fins de la gouvernance, ce même cycle peut être recadré en cinq phases de direction qui s’harmonisent mieux avec la prise de décision du conseil d’administration, de la haute direction, des affaires juridiques et de la gestion des risques. Ces phases ne remplacent pas les activités techniques. Elles fournissent une structure de leadership pour gouverner les conséquences d’affaires d’un incident majeur, et elles aident les dirigeants à reconnaître quel type de décision on attend d’eux à chaque étape.

Cinq phases de direction

- Stabilisation. L’objectif immédiat est d’empêcher l’expansion incontrôlée du préjudice. C’est à ce moment qu’un confinement résolu peut être nécessaire : isoler des réseaux, désactiver des voies d’accès, suspendre l’accès à distance, interrompre des flux de travail sensibles, bloquer les connexions des fournisseurs ou mettre des systèmes hors ligne. Ces mesures perturbent les opérations, parfois gravement. La gouvernance exige que la direction appuie le confinement lorsque les éléments probants le justifient, même lorsqu’il est incommode, coûteux ou visible pour la clientèle, car un incident non confiné devient presque toujours plus coûteux.
- Clarté de la situation. Les dirigeants reçoivent rarement une information parfaite au début d’une crise. La gouvernance exige une compréhension rigoureuse et progressive : ce qui est confirmé, ce qui est soupçonné, ce qui demeure inconnu, quels éléments probants appuient chaque conclusion et quelles hypothèses sont mises à l’épreuve. Cette phase établit une source unique de vérité, avec des mises à jour versionnées, des hypothèses documentées et des niveaux de confiance explicites. L’objectif n’est pas la certitude; c’est une prise de décision cohérente dans l’incertitude.
- Prise de décision à l’échelle de l’entreprise. C’est à cette étape que l’intervention en cas d’incident devient un leadership de crise. Les décisions peuvent notamment consister à activer les plans de continuité, à déclarer un sinistre aux fins de la reprise, à suspendre ou à maintenir des services, à aviser les clients, les partenaires et les organismes de réglementation, à assurer la coordination avec les assureurs et les conseillers juridiques, à gérer les communications avec le personnel et à traiter les demandes d’extorsion. Ces décisions doivent être autorisées, documentées et justifiées, car elles seront ensuite examinées par les conseils d’administration, les organismes de réglementation, les assureurs, les auditeurs, les clients et, peut-être, les tribunaux.
- Reprise et reconstitution. Rétablir le service n’équivaut pas à rétablir la confiance. Les dirigeants doivent gouverner l’ordre de la restauration : ce qui revient en premier et pourquoi, quelles dépendances doivent être validées et quels risques sont acceptés pendant les solutions de contournement temporaires. Les choix de reprise portent notamment sur la reconstruction saine par rapport à la restauration rapide, la réinitialisation des identifiants, la restauration à partir des sauvegardes, la reconnexion des tiers, l’exploitation manuelle et le retour progressif à la normale. La reprise doit être guidée par les éléments probants et par des priorités d’affaires convenues à l’avance, et non par quiconque exerce la plus forte pression.
- Imputabilité et amélioration. La période qui suit l’incident détermine si l’organisation en sort plus forte ou retrouve simplement sa vulnérabilité antérieure. La gouvernance exige une revue post-incident, une analyse des causes profondes qui inclut les causes managériales, l’attribution des responsabilités relatives aux mesures correctives et un suivi des actions correctives par la haute direction. Le résultat devrait être une feuille de route de mesures correctives financée et rattachée à l’appétence pour le risque et aux objectifs de résilience.
La figure ci-dessous résume ces phases, leurs principales actions et leurs principaux extrants de gouvernance, ainsi que les principes qui les traversent toutes : pouvoir et imputabilité, éléments probants et documentation, alignement des parties prenantes, proportionnalité et amélioration continue.

Figure 57 : une vision du cycle de vie des incidents axée sur la gouvernance

Considérées ensemble, les phases forment une grille de lecture pour la direction. La stabilisation empêche l’expansion du préjudice; la clarté de la situation donne aux dirigeants une base fiable pour décider; la prise de décision à l’échelle de l’entreprise aligne l’action technique sur les conséquences juridiques, opérationnelles, financières et réputationnelles; la reprise rétablit des opérations fiables selon un ordre contrôlé; et l’imputabilité transforme l’incident en apprentissage organisationnel. Une organisation mature n’attend pas la certitude pour agir, mais elle n’agit pas non plus à l’aveugle.

La cause profonde inclut les causes managériales

La cinquième phase mérite une insistance particulière, car c’est là que de nombreuses organisations échouent sans bruit. Les revues post-incident s’arrêtent souvent à la cause technique immédiate : un serveur sans correctif, des identifiants obtenus par hameçonnage, un compartiment de stockage mal configuré. Ces constatations sont réelles, mais rarement suffisantes. Une revue digne d’une bonne gouvernance se demande aussi pourquoi la situation existait et a persisté. La responsabilité de l’actif était-elle floue? Le contrôle était-il sous-financé? Une exception de risque était-elle échue sans avoir été réexaminée? La gouvernance des fournisseurs a-t-elle omis d’exiger un engagement en matière de sécurité? La remontée a-t-elle tardé parce que les seuils étaient ambigus? Les plans de continuité n’avaient-ils jamais été testés? La journalisation était-elle insuffisante pour soutenir l’enquête?

Ces causes managériales sont inconfortables parce qu’elles mettent en cause des décisions prises par des personnes qui se trouvent peut-être dans la salle. C’est pourquoi la revue devrait être animée par une personne indépendante de l’intervention et présentée à une instance de gouvernance qui a le pouvoir d’agir. Une revue qui ne relève que des causes techniques produit un correctif; une revue qui relève des causes managériales produit un changement. L’audit interne, en tant que troisième ligne, peut vérifier que les actions correctives sont terminées et réellement efficaces.

Alignement sur la publication NIST SP 800-61 Rev. 3 et sur le CSF 2.0

La publication NIST SP 800-61 Rev. 3, Incident Response Recommendations and Considerations for Cybersecurity Risk Management: A CSF 2.0 Community Profile, a remplacé la Rev. 2 de 2012 en avril 2025. Son changement le plus important pour les gestionnaires est d’ordre conceptuel. La version précédente présentait un cycle de vie autonome en quatre phases; la Rev. 3 fait plutôt correspondre les recommandations sur l’intervention en cas d’incident aux six fonctions du CSF 2.0. Les activités de préparation relèvent en grande partie des fonctions Gouverner, Identifier et Protéger; l’intervention en cas d’incident proprement dite relève des fonctions Détecter, Répondre et Rétablir; et les leçons apprises alimentent les activités d’amélioration dans toutes les fonctions.

Le message pour la gouvernance est que l’intervention en cas d’incident n’est pas un programme distinct qui démarre au déclenchement d’une alerte. Elle dépend de décisions prises bien avant : stratégie de risque, rôles et pouvoirs, exigences imposées aux fournisseurs, inventaires des actifs, politique de journalisation et planification de la reprise. Pour les dirigeants, cet alignement présente un avantage pratique. Une organisation qui rend déjà compte de sa posture de cybersécurité au moyen du CSF 2.0 (voir le chapitre 9) peut rendre compte de sa préparation aux incidents dans le même langage, de sorte que le conseil d’administration perçoit la capacité d’intervention comme un élément du portrait global des risques plutôt que comme un sujet technique distinct. La fonction Rétablir du CSF, en particulier, couvre l’exécution du plan de rétablissement après incident et les communications liées au rétablissement, soit les domaines où la cellule de crise et les fonctions de continuité prennent les devants.

La série ISO/IEC 27035

Les organisations qui exploitent un système de gestion de la sécurité de l’information (SGSI) selon la norme ISO/IEC 27001 se tournent souvent vers la série ISO/IEC 27035 pour obtenir des lignes directrices sur la gestion des incidents. Au moment de la rédaction, la série comprend les normes ISO/IEC 27035-1:2023 (principes et processus), ISO/IEC 27035-2:2023 (lignes directrices pour planifier et préparer l’intervention en cas d’incident), ISO/IEC 27035-3:2020 (lignes directrices pour les opérations d’intervention en cas d’incident lié aux TIC) et ISO/IEC 27035-4:2024, qui porte sur la coordination entre plusieurs organisations intervenant à l’égard d’un même incident. La partie 4 est particulièrement pertinente pour les questions de dépendance systémique abordées plus loin dans ce chapitre, car de nombreux incidents graves mettent désormais en cause, simultanément, un fournisseur de services infonuagiques, un fournisseur de services gérés, un fournisseur de logiciels et plusieurs clients.

Pour les gestionnaires, la valeur de l’approche ISO réside moins dans son contenu technique que dans sa logique de système de gestion : planifier et préparer, détecter et signaler, évaluer et décider, intervenir et tirer des leçons. Cette logique s’harmonise naturellement avec les mesures de gestion des incidents de la norme ISO/IEC 27002:2022 et avec le cycle d’audit interne et de revue de direction d’un SGSI, ce qui signifie que la capacité de gestion des incidents peut être auditée, mesurée et améliorée comme tout autre processus de gestion.

## Rigueur de l’intervention juridique et réglementaire

Ce chapitre ne remplace pas un avis juridique. Les organisations doivent s’appuyer sur des conseillers juridiques qualifiés qui connaissent leur territoire de compétence, leur secteur, leurs contrats et les faits de l’incident. Néanmoins, les dirigeants doivent comprendre les dimensions de gouvernance de l’intervention juridique, car la rigueur juridique détermine ce qui peut être dit, ce qui doit être fait, quels éléments probants doivent être conservés et comment la conduite de l’organisation sera jugée par la suite. L’intervention juridique et réglementaire n’est pas une phase qui commence après le confinement technique; elle fait partie de la gouvernance de l’incident dès la première heure.

Rigueur et préservation de la preuve

Le premier principe est la rigueur de la preuve. Lors d’un incident important, l’organisation devrait présumer que ses actions, ses communications et ses décisions seront scrutées par des organismes de réglementation, des assureurs, des auditeurs, des clients, des parties à un litige ou les forces de l’ordre. Les journaux, les images criminalistiques, les registres d’accès, les billets, les communications et les registres de décisions doivent être conservés selon des procédures contrôlées, de sorte que les éléments probants soient fiables et explicables plutôt que contaminés par une enquête bien intentionnée, mais non contrôlée. Par exemple, réinstaller l’image d’un serveur infecté pour rétablir rapidement le service peut détruire la seule preuve de la façon dont l’attaquant est entré et des données qu’il a emportées.

La rigueur de la preuve suppose aussi le réflexe de la préservation de la preuve (legal hold). Un incident majeur est un événement générateur de documents : courriels, messages de clavardage, notes de réunion, ébauches de déclarations, analyses de l’impact sur les clients et communications avec les fournisseurs font tous partie du dossier. Des documents mal contrôlés, des chronologies contradictoires et des conjectures formulées à la légère par écrit peuvent créer une exposition juridique évitable. La réponse de gouvernance n’est pas de cesser de consigner les choses par écrit, mais de les consigner au bon endroit, en termes factuels, par des canaux désignés. Les règles de conservation des documents relatifs aux incidents devraient être définies à l’avance et tenir compte des exigences réglementaires, comme la période de conservation de cinq ans du registre des incidents de confidentialité au Québec, dont il est question plus loin.

Secret professionnel et conception d’une enquête contrôlée

Le deuxième principe concerne la structure de l’enquête. Dans de nombreux territoires, les organisations retiennent les services de firmes de criminalistique par l’intermédiaire d’avocats externes afin que certaines communications et certains produits du travail puissent être protégés par le secret professionnel. Les règles varient considérablement d’un territoire à l’autre, notamment entre les provinces de common law et la tradition civiliste du Québec, et les tribunaux n’ont pas toujours reconnu le secret professionnel invoqué à l’égard de rapports de criminalistique qui servaient des fins d’affaires autant que des fins juridiques. C’est précisément pourquoi les conseillers juridiques doivent intervenir tôt, avant la commande des rapports et avant la diffusion des constatations.

Quelles que soient les particularités juridiques, l’enjeu de gouvernance est opérationnel. Les enquêtes doivent être dirigées par une personne désignée, qui dispose d’un pouvoir clair pour retenir les services de spécialistes externes, faire valider les constatations et contrôler leur diffusion. L’objectif n’est pas de cacher des faits. Il est d’établir les faits au moyen d’un processus fiable avant que l’organisation ne prenne des engagements juridiques, réglementaires, contractuels ou publics qu’elle pourrait devoir retirer plus tard.

Gouvernance des communications

Le troisième principe est la gouvernance des communications. Bien des organisations subissent moins de dommages à cause de l’incident lui-même qu’à cause de la façon dont elles en parlent. Parmi les échecs courants, mentionnons les assurances prématurées selon lesquelles « aucune donnée personnelle n’a été touchée », les déclarations incohérentes selon les publics, la minimisation qui finit par s’effondrer, le jargon technique qui sème la confusion chez les parties prenantes et le silence qui laisse à d’autres le soin de définir le récit. La communication de crise doit donc être gouvernée comme un processus contrôlé, avec des déclarations d’attente préapprouvées, un circuit d’approbation clair et des porte-parole désignés.

Un modèle de communication rigoureux communique ce qui est connu et vérifié, distingue les faits de l’évaluation en cours, reconnaît l’incertitude, explique ce que l’organisation fait pour les personnes touchées, évite les conjectures quant à l’attribution et s’engage à fournir d’autres mises à jour. Les messages destinés au personnel, aux clients, aux organismes de réglementation, aux fournisseurs, aux médias et au conseil d’administration devraient être cohérents, mais non identiques, car chaque public a besoin d’un niveau de détail différent. Le personnel mérite une attention particulière : il est souvent le premier à recevoir des questions de clients et de proches, et il peut être ciblé par des attaquants qui usurpent l’identité de l’équipe d’intervention en cas d’incident. La crédibilité tout au long d’un incident vaut davantage que les propos rassurants des premières heures.

Tiers, assureurs et forces de l’ordre

Les incidents importants exigent une coordination avec des avocats externes, des firmes de criminalistique, des cyberassureurs, des conseillers en communication de crise, des fournisseurs de services infonuagiques et de services gérés, des fournisseurs critiques, des organismes de réglementation et les forces de l’ordre. Les polices de cyberassurance exigent souvent un avis rapide et peuvent désigner des fournisseurs agréés pour les services juridiques, de criminalistique et de négociation; retenir les services d’une firme non agréée dans les premières heures peut compromettre la couverture. Ces relations devraient être établies avant une crise, et les mandats, les coordonnées et les procédures de recours devraient être documentés et testés. L’organisation devrait aussi décider à l’avance qui peut communiquer avec des parties externes, dans quelles circonstances et par quels canaux.

Le recours aux forces de l’ordre mérite une politique délibérée plutôt qu’un débat au cas par cas. Au Canada, le Centre canadien pour la cybersécurité encourage le signalement des incidents, et ses conseils sur les rançongiciels recommandent de communiquer avec la police et de signaler l’incident au Centre pour la cybersécurité et au Centre antifraude du Canada. Les forces de l’ordre peuvent détenir des clés de déchiffrement ou du renseignement sur l’acteur de menace, et signaler un incident ne signifie pas renoncer au contrôle de l’intervention.

Consignation des décisions

Le dernier principe est le plus simple et le plus souvent négligé. Pendant un incident majeur, l’organisation devrait tenir un journal des décisions consignant chaque décision importante : ce qui a été décidé, quand, par qui, sur la base de quels faits, quelles solutions de rechange ont été envisagées, quels risques ont été acceptés et quelles mesures de suivi ont été attribuées. Les journaux des décisions ne sont pas une lourdeur administrative. Ils démontrent la diligence, soutiennent la revue post-incident, préservent la mémoire institutionnelle lorsque des personnes quittent l’intervention et fournissent la preuve que la direction a agi raisonnablement dans l’incertitude. Une personne chargée de la consignation, désignée avant la première réunion de la cellule de crise, constitue l’un des contrôles les moins coûteux et les plus précieux de la gouvernance de crise.

Une décision qui ne peut pas être reconstituée après coup ne peut pas être défendue après coup. Le journal des décisions est le livrable le plus important de la cellule de crise, après les décisions elles-mêmes.

## Obligations d’avis : gouverner plusieurs échéanciers à la fois

Les cyberincidents modernes créent simultanément plusieurs obligations d’avis. Les organismes de protection de la vie privée doivent être pris en compte chaque fois que des renseignements personnels sont en cause. Les organismes de réglementation sectoriels peuvent imposer des attentes de déclaration des incidents opérationnels. Les autorités en valeurs mobilières peuvent exiger la divulgation des incidents importants. Les contrats conclus avec des entreprises clientes, des clients du secteur public, des entreprises de traitement des paiements et des fournisseurs comportent souvent leurs propres délais d’avis, parfois plus courts que toute échéance légale. Les assureurs exigent un avis en temps opportun comme condition de la couverture. Chacune de ces obligations a son propre élément déclencheur, son seuil, son destinataire, son contenu et son échéancier, et elles commencent rarement au même moment.

Loi 25 du Québec : incidents de confidentialité

Pour les organisations assujetties à la Loi sur la protection des renseignements personnels dans le secteur privé du Québec, telle que modifiée par la Loi 25, un incident de confidentialité comprend l’accès non autorisé à un renseignement personnel, son utilisation ou sa communication non autorisées, ou sa perte. L’entreprise doit prendre des mesures raisonnables pour diminuer les risques qu’un préjudice soit causé et éviter que de nouveaux incidents de même nature se produisent. Lorsqu’un incident présente un risque qu’un préjudice sérieux soit causé, l’entreprise doit aviser avec diligence la Commission d’accès à l’information du Québec (CAI) et les personnes concernées. L’évaluation du préjudice sérieux tient compte de la sensibilité du renseignement, des conséquences appréhendées de son utilisation et de la probabilité qu’il soit utilisé à des fins préjudiciables.

Le Règlement sur les incidents de confidentialité, en vigueur depuis décembre 2022, précise le contenu des avis à la CAI et aux personnes ainsi que le contenu du registre des incidents de confidentialité. Chaque incident doit être inscrit au registre, et pas seulement ceux qui présentent un risque de préjudice sérieux, et le registre doit être conservé pendant au moins cinq ans après que l’entreprise a pris connaissance de l’incident; la CAI peut en demander une copie. Depuis septembre 2023, l’omission de déclarer un incident peut exposer une entreprise à des sanctions administratives pécuniaires pouvant atteindre 10 millions de dollars ou 2 % du chiffre d’affaires mondial, et à des amendes pénales pouvant atteindre 25 millions de dollars ou 4 %. Le chapitre 16 traite plus en profondeur de la Loi 25; l’enjeu de gouvernance à retenir ici est que le registre et l’évaluation du préjudice sérieux sont des tâches opérationnelles récurrentes, et non des tâches ponctuelles liées à une crise.

LPRPDE : atteintes aux mesures de sécurité

Pour les organisations du secteur privé assujetties à la Loi sur la protection des renseignements personnels et les documents électroniques (LPRPDE) fédérale, les dispositions relatives aux atteintes et le Règlement sur les atteintes aux mesures de sécurité (DORS/2018-64), en vigueur depuis le 1er novembre 2018, obligent les organisations à déclarer au Commissariat à la protection de la vie privée du Canada (CPVP) toute atteinte qui présente un risque réel de préjudice grave pour des personnes, le plus tôt possible après avoir conclu que l’atteinte a eu lieu. Les personnes concernées doivent aussi être avisées, directement lorsque c’est possible, et il peut être nécessaire d’informer d’autres organisations ou institutions gouvernementales en mesure de réduire le risque de préjudice. Les organisations doivent tenir un registre de toutes les atteintes aux mesures de sécurité, qu’elles soient à déclarer ou non, pendant 24 mois.

De nombreuses organisations canadiennes sont assujetties aux deux régimes, par exemple une entreprise dont le siège social est au Québec et qui exerce des activités commerciales dans d’autres provinces. Leur processus d’avis doit appliquer les deux critères et produire des avis cohérents et coordonnés, ce qui est plus facile lorsqu’une seule personne responsable de la protection des renseignements personnels est chargée de l’analyse et qu’un seul registre satisfait aux deux exigences de tenue de registre.

Attentes du BSIF envers les institutions financières fédérales

Les institutions financières fédérales (IFF) font face à des attentes supplémentaires. Le préavis du Bureau du surintendant des institutions financières (BSIF) intitulé Signalement des incidents liés à la technologie et à la cybersécurité, en vigueur depuis août 2021, oblige les IFF à signaler les incidents admissibles au BSIF dans un délai de 24 heures, ou plus tôt si possible, et à fournir des mises à jour régulières (par exemple, quotidiennes) jusqu’à la résolution de l’incident, puis une revue post-incident et les leçons apprises. Les incidents à signaler comprennent notamment ceux qui pourraient avoir des conséquences pour d’autres institutions ou pour le système financier, ceux qui touchent des renseignements sur la clientèle, ceux qui entraînent l’activation des plans de reprise après sinistre, ceux qui sont signalés au commissaire à la protection de la vie privée ou aux forces de l’ordre, ceux qui donnent lieu à une réclamation de cyberassurance et ceux auxquels on attribue une gravité interne élevée ou critique. Le BSIF encourage le signalement par précaution lorsqu’une institution a des doutes.

Ces attentes en matière de signalement s’inscrivent dans la ligne directrice B-13 du BSIF sur la gestion du risque lié aux technologies et du cyberrisque, qui exige des IFF qu’elles maintiennent des capacités de gestion des incidents, de reprise et de résilience, ainsi que dans la ligne directrice E-21, abordée plus loin dans ce chapitre, qui élargit la perspective des incidents individuels à la résilience des opérations critiques.

Divulgation exigée par la SEC pour les sociétés inscrites à une bourse américaine

Les organisations canadiennes inscrites à une bourse aux États-Unis, ainsi que les filiales canadiennes d’émetteurs inscrits aux États-Unis, doivent tenir compte des règles de communication d’information en matière de cybersécurité adoptées en 2023 par la Securities and Exchange Commission (SEC) des États-Unis. En vertu de l’Item 1.05 du formulaire 8-K, un émetteur national qui juge qu’un incident de cybersécurité est important doit en divulguer la nature, la portée, le moment et l’impact important, ou raisonnablement susceptible d’être important, dans les quatre jours ouvrables suivant cette détermination, et la détermination de l’importance doit elle-même être faite sans retard déraisonnable après la découverte. Un report n’est possible que si l’Attorney General des États-Unis détermine que la divulgation poserait un risque important pour la sécurité nationale ou la sécurité publique. Des divulgations annuelles sur la gestion des risques de cybersécurité, la stratégie et la gouvernance sont exigées en vertu de l’Item 106 du Regulation S-K. Au moment de la rédaction, ces exigences demeurent en vigueur, bien que la SEC ait lancé, au début de 2026, un appel aux commentaires du public sur la réforme des exigences de divulgation du Regulation S-K et que des associations sectorielles aient demandé l’abrogation de l’Item 1.05; les gestionnaires devraient en vérifier l’état actuel.

La leçon de gouvernance tirée du régime de la SEC s’applique bien au-delà des États-Unis. L’importance relative est un jugement d’affaires, et non un jugement technique, et les organisations ont besoin d’un processus défini à l’avance, faisant généralement intervenir un comité de divulgation, les conseillers juridiques, les finances et le CSI, pour évaluer rapidement l’importance d’un incident et documenter le raisonnement.

NIS2 et DORA dans l’Union européenne

Les organisations qui exercent leurs activités dans l’Union européenne font face à deux régimes importants. La directive NIS2 (directive (UE) 2022/2555) oblige les entités essentielles et importantes à transmettre une alerte précoce concernant un incident important dans les 24 heures suivant le moment où elles en ont connaissance, une notification d’incident dans les 72 heures et un rapport final au plus tard un mois après la notification. Le règlement sur la résilience opérationnelle numérique du secteur financier (DORA, règlement (UE) 2022/2554), qui s’applique aux entités financières de l’UE depuis janvier 2025, exige une notification initiale d’un incident majeur lié aux TIC dans les quatre heures suivant sa classification comme incident majeur et au plus tard 24 heures après en avoir pris connaissance, un rapport intermédiaire dans les 72 heures et un rapport final dans un délai d’un mois, le contenu et les délais étant fixés par le règlement délégué (UE) 2025/301 de la Commission. Un groupe canadien qui compte des filiales ou des clients financiers dans l’UE peut donc se trouver soumis à ces échéanciers en raison de ses activités ou de ses contrats.

Régime

Élément déclencheur

Destinataire

Échéancier

Loi 25 du Québec

Incident de confidentialité présentant un risque qu’un préjudice sérieux soit causé

CAI et personnes concernées

Avec diligence; inscrire chaque incident au registre, conserver 5 ans

LPRPDE

Atteinte présentant un risque réel de préjudice grave

Commissaire à la protection de la vie privée et personnes concernées

Le plus tôt possible; conserver les registres 24 mois

Préavis du BSIF

Incident lié à la technologie ou à la cybersécurité à signaler (IFF)

BSIF

Dans les 24 heures; mises à jour régulières

SEC, formulaire 8-K, Item 1.05

Incident de cybersécurité important

Investisseurs (dépôt public)

4 jours ouvrables après la détermination de l’importance

NIS2

Incident important

CSIRT ou autorité compétente

Alerte précoce en 24 h; notification en 72 h; rapport final en 1 mois

DORA

Incident majeur lié aux TIC

Autorité de surveillance financière

4 h après la classification (max. 24 h); 72 h; rapport final en 1 mois

Gouverner les chevauchements

Ces obligations se chevauchent, interagissent et entrent parfois en conflit. Un organisme de réglementation attend un avis dans les 24 heures alors que l’enquête cherche encore à établir si des données ont quitté le réseau. Un contrat exige d’aviser un client avant que l’organisation ait terminé d’évaluer l’importance de l’incident aux fins des valeurs mobilières. Un dépôt réglementaire en valeurs mobilières devient public et avise de fait, au même moment, l’attaquant, les autres clients et les journalistes. Les forces de l’ordre peuvent demander de la discrétion alors que la législation sur la protection des renseignements personnels exige d’aviser les personnes.

La maturité de la gouvernance est la capacité de concilier rapidement ces pressions, avec les conseillers juridiques, au moyen d’une justification documentée. Les dirigeants ne devraient pas découvrir les obligations d’avis pour la première fois en pleine crise. L’organisation devrait tenir une matrice de notification qui énumère chaque régime applicable et chaque contrat important, avec son élément déclencheur, son seuil, son destinataire, son échéance et son responsable; des modèles rédigés à l’avance; un processus d’évaluation des seuils; et un journal de ce qui a été communiqué, quand, à qui, par qui et sur quelle base factuelle. La Loi sur la protection des cybersystèmes essentiels (LPCE) du Canada, édictée par le projet de loi C-8, qui a reçu la sanction royale en juin 2026, ajoutera des obligations de déclaration pour les exploitants désignés des secteurs critiques sous réglementation fédérale lorsque ses dispositions et ses règlements entreront en vigueur; les organisations de ces secteurs devraient dès maintenant élargir leurs matrices en conséquence.

## Le rançongiciel, un test de résistance pour la gouvernance

Le rançongiciel a transformé le problème de la résilience. Il ne s’agit pas simplement d’un incident de disponibilité; c’est une perturbation hostile conçue pour maximiser l’emprise sur la victime tout en détruisant la confiance dans l’intégrité de ses systèmes. La plupart des opérations modernes de rançongiciel combinent le chiffrement avec le vol de données et la menace de leur publication, de sorte que l’atteinte à la disponibilité et l’atteinte à la confidentialité surviennent ensemble. Bon nombre d’entre elles ciblent aussi les systèmes d’identité, les comptes privilégiés et les outils d’administration, ce qui signifie que la reprise peut être bloquée si l’infrastructure d’identité demeure compromise. Certains groupes se passent entièrement du chiffrement et misent uniquement sur l’extorsion fondée sur le vol de données. Pour ces raisons, le rançongiciel met à l’épreuve, simultanément, presque tous les éléments de gouvernance abordés dans ce manuel.

La capacité de reprise est la capacité essentielle

Pour les dirigeants, le virage essentiel consiste à traiter la préparation aux rançongiciels comme une préparation à la reprise. La question centrale devient : pouvons-nous rétablir nos services et nos données critiques à un état d’exploitation acceptable, dans les limites de nos tolérances déclarées, sans dépendre de l’attaquant? Si la réponse honnête est incertaine, l’organisation n’a pas bâti de résilience; elle a bâti de l’espoir.

La capacité de reprise ne se résume pas à posséder des sauvegardes. C’est la capacité démontrée de rétablir les activités dans le respect d’objectifs définis, à l’échelle de l’entreprise, avec une intégrité validée et dans des conditions défavorables. Trois décisions de gouvernance sont couramment négligées. Premièrement, l’organisation doit définir quels services sont critiques et fixer, pour chacun, des tolérances explicites à l’égard des temps d’arrêt et des pertes de données; il s’agit d’une décision de continuité des activités, et non d’une décision technique. Deuxièmement, elle doit investir dans le réalisme de la restauration : des sauvegardes protégées contre l’attaquant, testées à l’échelle requise et restaurables assez rapidement pour être utiles. Troisièmement, elle doit traiter la reprise des identités comme un domaine de reprise à part entière, car l’avantage de l’attaquant repose souvent sur les identifiants, les jetons et les accès privilégiés (voir le chapitre 10). Un plan de reprise qui ne traite pas de la réinitialisation des identifiants, du rétablissement des comptes privilégiés, des voies d’administration sécurisées et de la reconnexion sûre des tiers est incomplet.

La décision relative à l’extorsion

Décider de payer ou non une rançon est l’une des décisions les plus difficiles qu’une équipe de direction puisse avoir à prendre, et elle ne devrait jamais être prise pour la première fois sous la pression. Les orientations du gouvernement canadien et des gouvernements alliés insistent systématiquement sur les risques du paiement. Le guide d’intervention du Centre canadien pour la cybersécurité sur les rançongiciels (ITSM.00.099, en vigueur depuis le 11 décembre 2025, version actuelle publiée le 28 janvier 2026) indique que la décision revient à l’organisation, mais souligne que le paiement ne garantit pas la récupération des données ou des systèmes, que les attaquants peuvent tout de même divulguer ou vendre les données volées, que le paiement peut inciter à cibler de nouveau la victime et à formuler d’autres demandes, et que le paiement peut être illégal au regard des lois sur le terrorisme, le blanchiment d’argent, les organisations criminelles ou les sanctions. En 2023, les membres de l’Initiative internationale de lutte contre les rançongiciels, dont le Canada, ont appuyé une déclaration commune selon laquelle leurs gouvernements nationaux ne devraient pas payer de rançons. Aux États-Unis, l’Office of Foreign Assets Control (OFAC) du département du Trésor indique depuis 2020 (mise à jour en 2021) que faciliter des paiements à des personnes visées par des sanctions peut contrevenir à ces sanctions, que le payeur ait connu ou non le statut du destinataire, tout en considérant un signalement rapide et la collaboration avec les forces de l’ordre comme des facteurs atténuants.

Aux fins de la gouvernance, la question du paiement devrait être décomposée en éléments qui peuvent être préparés à l’avance :

- Position de principe : le conseil d’administration devrait approuver une position documentée sur les paiements d’extorsion, en reconnaissant que la décision finale peut dépendre du contexte, mais en établissant une position par défaut ferme et les conditions dans lesquelles elle peut être reconsidérée.
- Pouvoir décisionnel : l’instance qui peut autoriser tout contact avec un acteur de menace ou tout paiement, généralement la cellule de crise, le conseil d’administration en étant avisé, et jamais une équipe technique ni un négociateur agissant seul.
- Examen juridique : un processus, dirigé par les conseillers juridiques, pour évaluer l’exposition aux sanctions au Canada et dans tout autre territoire pertinent, ainsi que les risques liés au droit criminel et à la lutte contre le blanchiment d’argent.
- Conditions d’assurance : une compréhension claire de ce que couvre la police de cyberassurance, des fournisseurs qu’elle impose et du consentement que l’assureur doit donner.
- Critères de décision : les facteurs que la direction pèsera, notamment la sécurité des personnes et le préjudice causé aux patients ou aux clients, la solution de reprise de rechange réaliste et sa durée, la probabilité qu’un outil de déchiffrement fonctionne, la nature des données volées, les conséquences éthiques et réputationnelles, ainsi que les effets incitatifs du paiement.
- Documentation : un registre complet du raisonnement, des solutions de rechange et des approbations, quelle que soit l’issue.
Une idée centrale se dégage une fois ces éléments exposés. La pression pour payer est la plus forte lorsque l’organisation ne peut se rétablir d’aucune autre façon dans un délai tolérable. La façon la plus efficace d’éviter une décision d’extorsion impossible est donc d’investir, bien avant l’incident, dans la capacité de reprise qui rend le paiement inutile. Un paiement visant à empêcher la publication de données volées est encore plus difficile à justifier, car l’organisation ne peut pas vérifier que les données ont été supprimées, et les obligations d’avis décrites précédemment demeurent généralement, que le paiement soit effectué ou non.

## Gestion de la continuité des activités : la colonne vertébrale managériale de la résilience

La reprise technologique ne suffit pas à elle seule à assurer la continuité. Même avec un plan de reprise après sinistre impeccable, il reste des lacunes que la technologie ne peut pas combler : processus manuels, flux de travail de rechange, contraintes de personnel, communications avec la clientèle, dépendances à l’égard de la chaîne d’approvisionnement et décisions sur ce qu’il faut prioriser lorsque tout ne peut pas être livré. La gestion de la continuité des activités (GCA) comble ces lacunes. C’est la colonne vertébrale managériale qui relie un cyberévénement à la survie de l’organisation, et c’est la discipline par laquelle la direction décide, à l’avance, de ce que l’organisation doit continuer à faire quoi qu’il arrive.

La norme ISO 22301 et le système de gestion de la continuité des activités

La norme ISO 22301:2019 précise les exigences d’un système de gestion de la continuité des activités (SGCA). Comme la norme ISO/IEC 27001, elle suit la structure harmonisée des systèmes de gestion : contexte, leadership, planification, soutien, fonctionnement, évaluation de la performance et amélioration. Son amendement de 2024 (ISO 22301:2019/Amd 1:2024) a ajouté des considérations liées aux changements climatiques à l’analyse du contexte de l’organisation et des parties intéressées, en cohérence avec les autres normes ISO de systèmes de gestion; au moment de la rédaction, l’ISO prépare une révision de la norme ISO 22301.

La structure de système de gestion est importante, car elle rend la continuité auditable : la direction doit faire preuve de leadership, fixer des objectifs, fournir les ressources, examiner la performance et favoriser l’amélioration. Les organisations qui exploitent déjà un SGSI peuvent intégrer les deux systèmes plutôt que de les dédoubler. La norme ISO/IEC 27002:2022 établit explicitement ce lien au moyen de ses mesures portant sur la sécurité de l’information durant une perturbation et sur la préparation des TIC à la continuité des activités.

Un bilan d’impact sur les activités qui reflète les dépendances réelles

Un programme de continuité crédible commence par un bilan d’impact sur les activités (BIA), mais le BIA doit refléter la dépendance systémique moderne. Il ne peut pas être une feuille de calcul statique énumérant les applications et leurs responsables. Il doit cartographier les processus d’affaires critiques, les services et les données qui les rendent possibles, les tiers essentiels, les périodes de pointe et les conséquences d’une interruption au fil du temps — par exemple à deux heures, un jour, trois jours et deux semaines. Cette vue échelonnée dans le temps est importante parce que le préjudice n’est pas linéaire. Bien des organisations peuvent tolérer une courte panne, mais la même panne devient une menace existentielle si elle chevauche le traitement de la paie, une échéance de déclaration réglementaire, une clôture de fin de mois ou une pointe saisonnière de revenus.

C’est aussi dans le BIA que les responsables métier, et non les TI, déclarent ce qu’ils peuvent tolérer. C’est là que l’appétence pour le risque devient concrète. Un conseil d’administration qui a déclaré une faible appétence pour les interruptions de service doit, à terme, traduire cet énoncé en tolérances précises pour des services précis, et le BIA est l’instrument qui permet de le faire. Lorsqu’on demande aux responsables métier d’approuver ces tolérances, ils découvrent souvent que les tolérances qu’ils souhaitent sont beaucoup plus strictes que les capacités de reprise qu’ils ont financées. Cette découverte est précieuse : elle transforme une lacune cachée en une question d’investissement visible, sur laquelle il est possible de trancher.

Objectifs de reprise : MTPD, RTO, RPO et MBCO

Le chapitre 8 a présenté le délai de reprise visé et le point de reprise visé d’un point de vue opérationnel. Sur le plan de la gouvernance, quatre notions connexes, définies dans le vocabulaire de la norme ISO 22301 et de la norme terminologique qui l’accompagne, ISO 22300, devraient être comprises comme un ensemble :

- Durée maximale d’interruption tolérable (MTPD) : le délai au-delà duquel l’impact de la non-reprise d’un produit, d’un service ou d’une activité devient inacceptable pour l’organisation. Il s’agit d’un jugement d’affaires, tiré du BIA et ancré dans l’appétence pour le risque; le chapitre 8 emploie le terme très voisin de temps d’arrêt maximal tolérable.
- Délai de reprise visé (RTO) : la période au cours de laquelle l’activité ou ses ressources de soutien doivent reprendre. Le RTO doit être plus court que la MTPD, de manière à laisser une marge pour les imprévus.
- Point de reprise visé (RPO) : le moment auquel les données doivent être restaurées, ce qui détermine la quantité de pertes de données acceptable et, par conséquent, la fréquence à laquelle les données doivent être protégées.
- Niveau minimal de continuité des activités (MBCO) : le niveau de service minimal acceptable pendant la perturbation, ce qui reconnaît qu’un service dégradé peut être acceptable pendant un certain temps alors qu’une absence de service ne l’est pas.
La figure ci-dessous situe ces objectifs dans la relation plus large entre l’intervention en cas d’incident, la reprise après sinistre, la continuité des activités et la résilience opérationnelle. Les objectifs descendent en cascade à partir des activités de l’organisation : la MTPD est fixée par la direction, les stratégies de continuité des activités sont conçues pour la respecter, et les capacités de reprise après sinistre sont conçues pour atteindre le RTO et le RPO que la stratégie de continuité exige. Lorsque la cascade est inversée — lorsque les TI annoncent ce qu’elles peuvent rétablir et que l’on attend des secteurs d’affaires qu’ils l’acceptent —, la continuité devient un résultat technique plutôt qu’une décision de gouvernance.

Figure 58 : comment la continuité des activités, la reprise après sinistre et la résilience s’articulent

Stratégies de continuité au-delà de la technologie

Les dirigeants doivent aussi gouverner les options de continuité qui dépassent les TI. Un plan de continuité qui suppose simplement que les systèmes seront bientôt rétablis offre peu de protection. Les véritables stratégies de continuité comprennent des solutions de contournement manuelles, des services dégradés, des fonctions offertes à la clientèle restreintes, des canaux de communication de rechange, des fournisseurs de rechange, des ajustements temporaires des politiques, comme la suspension de certains types d’opérations, et des ententes d’entraide conclues à l’avance avec des pairs. Ces options comportent leurs propres risques : les processus manuels sont plus lents et plus sujets aux erreurs, les politiques temporaires peuvent créer des occasions de fraude, et les fournisseurs de rechange peuvent ne pas respecter les mêmes normes de sécurité.

C’est pourquoi les options de continuité doivent être définies à l’avance, avec des limites de risque acceptables et des droits décisionnels préapprouvés. Un hôpital qui prévoit revenir aux dossiers sur papier doit disposer de formulaires imprimés, d’un personnel formé et d’un plan pour rapprocher les dossiers papier une fois les systèmes rétablis. Un distributeur qui prévoit prendre les commandes par téléphone doit savoir à quels clients accorder la priorité et quelles limites de crédit appliquer sans ses systèmes habituels. Faire ces choix pendant une crise entraîne des retards et une prise de risque incohérente; les faire à l’avance les transforme en exceptions gouvernées, assorties de responsables connus et d’échéances connues.

## Reprise après sinistre : de la restauration des serveurs au rétablissement de la confiance

La planification de la reprise après sinistre est souvent présentée à tort comme un plan d’infrastructure. Dans une approche moderne de la cyberrésilience, elle doit être traitée comme la reconstitution maîtrisée de services fiables, et non comme la simple restauration d’une capacité de traitement. Les incidents causés par un rançongiciel font naître une illusion dangereuse : les systèmes peuvent être restaurés rapidement, mais ils peuvent encore être compromis, ou l’attaquant peut encore détenir des identifiants valides. La vitesse sans l’intégrité ouvre la voie à des compromissions répétées. Une reprise après sinistre mature comporte donc quatre dimensions que la haute direction devrait s’attendre à voir formulées comme des engagements explicites.

Orientations : NIST SP 800-34 et ISO/IEC 27031

Deux références sont particulièrement utiles. La publication NIST SP 800-34 Rev. 1, Contingency Planning Guide for Federal Information Systems (mai 2010, avec des errata publiés en novembre 2010), demeure le principal guide du NIST en matière de planification d’urgence au moment de la rédaction. Elle décrit un processus de planification d’urgence en sept étapes, la relation entre le BIA et les stratégies de reprise, ainsi qu’une famille de plans connexes, de la continuité des opérations jusqu’aux plans d’urgence des systèmes d’information. Même si elle est antérieure à l’ère des rançongiciels et qu’elle a été rédigée pour les systèmes fédéraux américains, sa structure demeure largement utilisée. La norme ISO/IEC 27031:2025, publiée en deuxième édition en mai 2025, fournit des lignes directrices sur la préparation des TIC à la continuité des activités : la capacité des technologies de l’information et des communications à soutenir les objectifs de continuité, y compris les dépendances envers les services infonuagiques et les autres services de tiers.

Reprise par niveaux et réalisme de la restauration

Tous les services ne se valent pas. La reprise après sinistre doit classer les services selon leur criticité et définir des priorités de reprise liées aux résultats du BIA, afin que l’ordre de reprise ne devienne pas l’objet d’une négociation politique en pleine crise. Une approche courante définit trois ou quatre niveaux, chacun assorti de son propre RTO, de son propre RPO et de sa propre architecture de reprise, et attribue chaque service critique à un niveau avec l’approbation explicite de son responsable métier. Les dépendances doivent être respectées : un portail client de niveau un est peu utile si le service d’identité, la base de données et le réseau dont il dépend se trouvent au niveau trois.

La deuxième dimension est le réalisme de la restauration. Les stratégies de sauvegarde et de redondance comptent, mais l’exigence de gouvernance est une restauration testée à l’échelle requise. La haute direction devrait exiger des preuves de tests de restauration, et non de simples assurances déclaratives. Restaurer une seule machine virtuelle dans un environnement de test prouve très peu de choses quant à la restauration simultanée de plusieurs centaines de systèmes, avec un personnel limité, pendant que le réseau est partiellement isolé. Dans les scénarios de rançongiciel, des sauvegardes immuables, hors ligne ou autrement isolées du domaine d’identité de production deviennent essentielles, parce que les attaquants cherchent précisément à repérer et à détruire les sauvegardes pour priver la victime de solutions de rechange.

Reprise saine et reconstitution des identités

La troisième dimension est la conception d’une reprise saine. Les organisations maintiennent de plus en plus des environnements de reprise séparés — parfois appelés salles blanches ou environnements de reprise isolés — dans lesquels les systèmes peuvent être reconstruits à partir d’images de confiance, validés, puis seulement reconnectés. Que cette architecture précise soit adoptée ou non, le principe de gouvernance demeure : la reprise doit comprendre une validation de l’intégrité et un plan pour prévenir une réinfection. La direction doit accepter qu’une reprise saine soit plus lente que la simple restauration de la dernière sauvegarde, et que ce compromis soit délibéré.

La quatrième dimension est la reprise des identités et des clés. La reprise après sinistre a traditionnellement porté sur l’infrastructure et les données. Lors d’un cyberincident, la capacité de restaurer les services d’identité, de réinitialiser les accès privilégiés, de renouveler les clés cryptographiques et les certificats (voir le chapitre 20), de rétablir les relations de confiance et de réintégrer les tiers devient centrale. Si le service d’annuaire est compromis, tous les systèmes qui lui font confiance le sont aussi. La haute direction devrait considérer la reprise des identités comme faisant partie de la portée de la reprise après sinistre et demander qu’elle soit testée, et non seulement documentée.

Rétablir le service, ce n’est pas rétablir la confiance. La reprise n’est terminée que lorsque l’organisation peut démontrer que les systèmes qu’elle a remis en service sont exempts de l’attaquant.

## Résilience opérationnelle et dépendance systémique

La cyberrésilience est souvent décrite comme la capacité de résister aux attaques et de s’en remettre. La gouvernance exige une définition plus opérationnelle : il s’agit de la capacité de l’organisation à maintenir des niveaux acceptables de services critiques en situation de perturbation causée par un adversaire et à rétablir ces services dans des limites de tolérance définies à l’avance, tout en maîtrisant les préjudices juridiques, réglementaires et réputationnels. Cette définition suppose que la résilience n’est pas un plan, mais une posture continue qui englobe la gouvernance, l’architecture, les opérations, les fournisseurs et les personnes. L’intervention en cas d’incident, la continuité des activités et la reprise après sinistre en sont les instruments; la résilience est le résultat qu’ils doivent produire.

Trois réalités qui façonnent la résilience

La première réalité est que la compromission est plausible. Une résilience mature repose sur la présomption de compromission. Ce n’est pas du pessimisme; c’est du réalisme face au risque. Une organisation qui présume qu’elle détectera tôt chaque attaquant construira des systèmes fragiles. Une organisation qui présume que certains attaquants réussiront à entrer investira dans la segmentation, la réduction du rayon d’impact, le confinement rapide et la rigueur de la reprise.

La deuxième réalité est que la dépendance est systémique. Les organisations dépendent désormais d’écosystèmes autant que des systèmes qu’elles exploitent elles-mêmes. Les plateformes infonuagiques, les fournisseurs d’identité, les fournisseurs de logiciels, les entreprises de traitement des paiements, les fournisseurs de services gérés et les entreprises de télécommunications créent des risques de concentration qu’aucune organisation ne maîtrise à elle seule. Des événements largement médiatisés au cours des dernières années, de la compromission de plateformes de services gérés et de transfert de fichiers jusqu’à une mise à jour défectueuse d’un logiciel de sécurité qui a mis hors service des millions d’ordinateurs dans le monde en juillet 2024, ont montré comment la défaillance d’un seul fournisseur peut perturber des milliers d’organisations à la fois.

La troisième réalité est que les rançongiciels et les attaques semblables sont conçus pour détruire la confiance. La reprise consiste donc à rétablir la confiance — dans l’intégrité des données, dans les systèmes d’identité, dans le contrôle administratif et dans les déclarations de l’organisation elle-même — autant qu’à assurer la disponibilité. Sur le plan de la gouvernance, la résilience peut se résumer à la réduction de trois intervalles : le délai de détection, le délai de confinement et le délai de reprise jusqu’à un état de confiance.

Ligne directrice E-21 du BSIF : opérations critiques et tolérance aux perturbations

Les organismes de réglementation ont commencé à codifier cette vision de la résilience. La ligne directrice E-21 du BSIF, Gestion du risque opérationnel et résilience opérationnelle, dont la version définitive a été publiée en août 2024, attend des IFF qu’elles déterminent leurs opérations critiques, qu’elles cartographient les personnes, les processus, la technologie, l’information, les installations et les tiers qui les soutiennent, et qu’elles fixent pour chacune un seuil de tolérance aux perturbations. Le respect intégral de la ligne directrice, y compris la cartographie, l’établissement des seuils de tolérance et l’élaboration d’une méthode d’essais de scénarios, était attendu au plus tard le 1er septembre 2026, et les essais de scénarios de toutes les opérations critiques doivent être terminés au plus tard le 1er septembre 2027. En ce sens, les essais de scénarios examinent si les opérations critiques peuvent demeurer dans leurs limites de tolérance dans des circonstances graves mais plausibles, de bout en bout et dans l’ensemble des secteurs d’activité.

Le changement est subtil, mais important. La planification traditionnelle de la continuité demande si chaque système peut être rétabli dans son RTO. La résilience opérationnelle demande si le service dont dépendent la clientèle et le système financier peut demeurer dans sa limite de tolérance, quel que soit le composant qui fait défaut. Cette question oblige les organisations à examiner simultanément la technologie, les personnes, les installations et les fournisseurs, et elle donne aux conseils d’administration une base plus claire pour exercer leur surveillance. Le DORA adopte une approche comparable pour les entités financières de l’Union européenne. Même les organisations situées hors du secteur financier peuvent s’inspirer de cette logique : déterminer la poignée de services dont la perturbation causerait un préjudice intolérable, fixer des seuils de tolérance explicites et effectuer des essais en fonction de scénarios graves.

Cartographier et gouverner le risque de concentration

La haute direction devrait gouverner la résilience sous l’angle explicite des dépendances et de la concentration. Cela suppose de tenir à jour une carte vivante des dépendances pour chaque service critique, de repérer les points de défaillance uniques situés à l’extérieur de l’organisation et de fixer une tolérance explicite pour ces dépendances. Pour certaines dépendances, l’organisation peut juger que la tolérance est élevée et accepter le risque. Pour d’autres, elle peut exiger des engagements contractuels, une redondance architecturale, des fournisseurs de rechange ou un plan de sortie documenté. Le chapitre 15 traite en profondeur de la concentration infonuagique, et le chapitre 19 aborde plus largement la gouvernance des tiers et de la chaîne d’approvisionnement.

La gouvernance devrait aussi exiger l’intégration des tiers à la gestion des incidents. Bien des incidents sont amplifiés parce que les organisations n’ont pas d’attentes claires quant à la notification par les fournisseurs, au partage des éléments probants, aux enquêtes conjointes, à la coordination de la reprise et à l’ordre de restauration. Les contrats devraient donc couvrir non seulement les niveaux de service liés à la disponibilité, mais aussi les délais de notification des incidents, la collaboration aux enquêtes de criminalistique, l’harmonisation des communications de crise, la participation à des exercices conjoints et le soutien pendant la reprise. Un test utile consiste à demander à chaque fournisseur critique comment il aviserait l’organisation d’un incident, à qui et dans quel délai — puis à vérifier si la matrice de notification de l’organisation pourrait, sur cette base, respecter ses propres échéances réglementaires.

Les exercices : de l’exercice sur table à la reprise complète

Un plan qui n’a pas été mis à l’épreuve dans des conditions de stress est un plan qui n’a pas été vérifié. Les exercices sont le principal moyen par lequel la gouvernance obtient la preuve que les capacités de gestion des incidents, de continuité et de reprise fonctionnent ensemble. Ils vont des exercices sur table, fondés sur la discussion, au cours desquels la cellule de crise examine un scénario autour d’une table, aux exercices fonctionnels qui testent des capacités précises comme la notification ou le basculement, jusqu’aux exercices grandeur nature qui restaurent de véritables systèmes dans des conditions réalistes.

Les exercices les plus utiles sont délibérément inconfortables. Ils introduisent des renseignements contradictoires, retirent des personnes clés, désactivent le principal canal de communication, imposent un compromis entre la préservation des éléments probants et une reprise rapide, et ajoutent une échéance de rançon ou l’appel d’un journaliste. Ils s’appuient sur les scénarios de risque élaborés selon les méthodes des chapitres 5 et 6, de sorte que l’organisation répète les événements qu’elle a jugés les plus importants plutôt que des sinistres génériques. Les membres du conseil d’administration ont avantage à y participer à l’occasion, car cela leur donne une idée réaliste des décisions qu’on pourrait leur demander d’appuyer.

Les constatations issues des exercices doivent être traitées comme des mesures de traitement des risques : consignées, assignées à un responsable, financées, suivies et fermées. Un programme d’exercices qui produit les mêmes constatations année après année est le signe d’une défaillance de la gouvernance, et non d’une faiblesse opérationnelle, parce qu’il montre que la direction reçoit des preuves et n’y donne pas suite.

## Une crise résolue : un rançongiciel chez un distributeur québécois

Le scénario qui suit est fictif, mais ses décisions reflètent des situations que de véritables organisations ont vécues. Il est présenté du point de vue de la gestion; l’intervention technique menée en parallèle n’apparaît que là où elle influe sur une décision de la direction.

Mise en situation : l’organisation et sa préparation

Saint-Laurent Medical Supply est une entreprise québécoise à capital fermé d’environ 1 100 employés qui distribue des fournitures pharmaceutiques et médicales aux hôpitaux, aux cliniques et aux pharmacies du Québec et de l’Est ontarien. Elle exploite également un petit service de livraison à domicile pour les patients de pharmacies partenaires. Ses services critiques, déterminés dans un bilan d’impact sur les activités réalisé deux ans plus tôt, sont l’exécution des commandes des hôpitaux, l’exécution des commandes des pharmacies et la paie. Pour l’exécution des commandes des hôpitaux, le BIA avait fixé une MTPD de 72 heures, parce que plusieurs hôpitaux clients ne disposent que de trois jours de stock pour certains articles critiques, et un MBCO consistant à exécuter au moins les commandes d’articles critiques désignés par les hôpitaux dans un délai de 24 heures. Le RTO documenté du système de gestion d’entrepôt était de 48 heures, avec un RPO de 24 heures.

Sur papier, Saint-Laurent était raisonnablement préparée. Elle disposait d’un plan d’intervention en cas d’incident, d’un plan de reprise après sinistre, d’une cellule de crise présidée par le chef de l’exploitation, d’une police de cyberassurance et de copies de sauvegarde immuables conservées chez un fournisseur infonuagique. Le conseil d’administration avait approuvé deux ans plus tôt une politique en matière d’extorsion qui établissait une position par défaut ferme contre le paiement. Certaines faiblesses étaient connues, mais peu visibles : la procédure de restauration avait été testée sur une vingtaine de serveurs, mais jamais à grande échelle; le service de livraison à domicile avait été lancé après le dernier BIA; et une exception au risque qui permettait à un appareil d’accès à distance de fonctionner avec une version désuète de micrologiciel était échue depuis quatre mois sans que personne l’ait renouvelée, corrigée ou fait remonter.

Heures 0–6 : stabilisation et remontée

Un vendredi à 2 h 40, les alertes de détection sur les terminaux ont signalé un chiffrement massif sur les serveurs de fichiers et le système de gestion d’entrepôt du principal centre de distribution. À 4 h, des demandes de rançon étaient apparues sur des dizaines de machines, et le site de fuite de l’attaquant affirmait détenir 400 Go de données de Saint-Laurent. Deux seuils de remontée avaient été franchis en même temps : une demande d’extorsion et l’interruption d’un service critique. Le gestionnaire des incidents a donc appelé le CSI, qui a activé la cellule de crise. Le chef de l’exploitation l’a réunie par téléphone à 6 h au moyen du pont de conférence hors bande et de la liste de contacts prévus dans le plan de crise, parce que le courriel et le clavardage de l’entreprise reposaient sur la plateforme d’identité que l’attaquant était soupçonné de contrôler.

La première recommandation du CSI a été d’isoler le réseau du centre de distribution et de désactiver tous les accès à distance. Cette mesure allait interrompre la préparation automatisée des commandes et empêcher tous les employés à distance de travailler. Le chef de l’exploitation, avec le chef de la direction financière et le vice-président des opérations, a approuvé le confinement en moins de quinze minutes, parce que le plan de crise conférait au président de la cellule de crise le pouvoir d’ordonner le confinement et que les critères de décision avaient été répétés lors d’un exercice l’année précédente. Une personne chargée de la consignation a ouvert le journal des décisions et y a consigné la décision, les solutions de rechange envisagées et la conséquence acceptée : l’arrêt complet de l’exécution automatisée des commandes.

Jour 1 : continuité, conseillers juridiques et premiers avis

Les systèmes automatisés étant hors ligne, les opérations ont déclenché le plan de continuité pour l’exécution des commandes des hôpitaux. Les superviseurs ont imprimé des listes de préparation à partir d’une copie autonome des données, destinée à la production de rapports et actualisée chaque nuit, et le personnel a exécuté manuellement les commandes d’articles critiques désignés par les hôpitaux. En soirée, environ 70 % des commandes d’articles critiques avaient été expédiées, au-delà du MBCO. L’exécution des commandes des pharmacies a été délibérément suspendue, et les pharmacies ont été avisées de s’attendre à des retards. Ce compromis avait été décidé en principe lors du BIA; la cellule de crise n’avait qu’à le confirmer.

Le chef du contentieux a avisé l’assureur à 7 h 30, ce qui a permis de retenir les services du cabinet d’avocats désigné par l’assureur et d’une firme de criminalistique selon les modalités de la police. Les avocats externes ont mandaté la firme de criminalistique et dirigé l’enquête. Plusieurs contrats conclus avec des hôpitaux exigeaient un avis dans les 24 heures suivant tout incident touchant le service; l’équipe des communications a donc transmis aux hôpitaux clients, avant midi, une déclaration d’attente approuvée à l’avance, qui précisait ce que l’on savait, ce que Saint-Laurent faisait pour protéger l’approvisionnement et le moment de la prochaine mise à jour. Le personnel a reçu des consignes par texto au moyen d’un service de notification d’urgence, y compris une mise en garde indiquant que des attaquants se font parfois passer pour le personnel des TI pendant les incidents. Le CSI a signalé l’incident à la Sûreté du Québec et au Centre canadien pour la cybersécurité, après avoir confirmé la démarche avec les conseillers juridiques.

Jours 2–4 : les faits, la décision relative à l’extorsion et les avis

Dès le deuxième jour, la firme de criminalistique avait établi que l’attaquant était entré par l’appareil d’accès à distance désuet, avait obtenu des identifiants d’administrateur de domaine et avait passé neuf jours dans l’environnement avant de lancer le chiffrement. Des données avaient été exfiltrées du partage de fichiers des ressources humaines, notamment les numéros d’assurance sociale et les coordonnées bancaires des employés, ainsi que du système de livraison à domicile, notamment le nom, l’adresse et le type de médicaments des patients. Le principal serveur de sauvegarde sur site avait été chiffré, mais les copies immuables dans le nuage étaient intactes.

L’équipe d’intervention en cas d’incident a alors annoncé une mauvaise nouvelle : le RTO de 48 heures du système de gestion d’entrepôt ne pouvait pas être respecté. Comme les identifiants d’administrateur de domaine étaient compromis, le service d’identité devait être reconstruit dans un environnement sain avant que quoi que ce soit d’autre puisse être considéré comme fiable, et la restauration à grande échelle n’avait jamais été testée. L’estimation réaliste était de six jours pour le système d’entrepôt et de douze jours pour un retour généralisé aux activités normales. Comme l’exécution manuelle couvrait les articles critiques des hôpitaux, l’estimation de six jours dépassait le RTO, mais, point crucial, ne dépassait pas la MTPD de l’approvisionnement critique des hôpitaux, parce que la stratégie de continuité tenait bon.

L’attaquant a exigé l’équivalent de 2,4 millions de dollars en échange d’un outil de déchiffrement et de la suppression des données volées. La cellule de crise a examiné les critères de décision énoncés dans la politique approuvée par le conseil d’administration. Une voie de reprise viable existait sans paiement. La fiabilité de l’outil de déchiffrement était inconnue. Le paiement n’annulerait pas le vol de données, et les obligations de notification subsisteraient quelle que soit l’issue. La vérification des sanctions visant le groupe de menace, effectuée par les conseillers juridiques, n’était pas concluante. La cellule de crise a décidé de ne pas payer; le président du conseil d’administration en a été informé le jour même, et l’ensemble du conseil a reçu un compte rendu lors d’une réunion extraordinaire le jour 3. Le raisonnement, les solutions de rechange et les approbations ont été consignés dans le journal des décisions.

En parallèle, la personne responsable de la protection des renseignements personnels a évalué le vol de données. Les données des employés et les renseignements de santé des patients présentaient tous deux un risque qu’un préjudice sérieux soit causé au sens de la loi québécoise sur la protection des renseignements personnels dans le secteur privé; Saint-Laurent a donc avisé la Commission d’accès à l’information et les personnes concernées, et a inscrit l’incident dans son registre des incidents de confidentialité. Comme le service de livraison à domicile traitait aussi des renseignements personnels de patients ontariens dans le cadre d’activités commerciales, les conseillers juridiques ont conclu que le critère du risque réel de préjudice grave de la LPRPDE était aussi satisfait, et l’incident a été déclaré au Commissariat à la protection de la vie privée du Canada. Les avis ont été rédigés ensemble afin que leur contenu soit cohérent, et chacun faisait état de ce que l’on savait à ce moment et s’engageait à fournir des mises à jour.

Jours 5–12 : la reprise et la pression pour prendre des raccourcis

La reprise a suivi l’ordre des niveaux approuvé avant l’incident : d’abord les services d’identité, reconstruits dans un environnement de reprise isolé; ensuite les systèmes de gestion d’entrepôt et de commandes; puis les finances et la paie; et enfin le courriel, les outils de collaboration et le système de gestion de la relation client (CRM) des ventes. Le jour 5, le vice-président des ventes a demandé que le CRM soit restauré avant les finances afin que les gestionnaires de comptes puissent rassurer la clientèle. La cellule de crise a refusé, en invoquant l’ordre des niveaux approuvé et le fait que la paie devait être versée le jour 8. La décision et sa justification ont été consignées.

Le système de gestion d’entrepôt a été remis en production le jour 7, après sa validation dans l’environnement de reprise et la réinitialisation de tous les identifiants privilégiés. La paie a été versée à temps. La plupart des services étaient revenus à la normale le jour 12, et la cellule de crise a officiellement mis fin à ses activités le jour 14, l’équipe d’intervention en cas d’incident continuant de surveiller tout signe d’une nouvelle intrusion.

Revue post-incident : les causes managériales

La revue post-incident, animée par un conseiller externe et présentée au comité d’audit et des risques du conseil d’administration, a conclu que la cause technique était l’appareil désuet. Elle a aussi relevé les causes managériales qui avaient permis à cette condition de persister et à l’incident de prendre de l’ampleur :

- Une exception au risque échue, sans remontée : le registre des exceptions consignait les dates d’échéance, mais ne déclenchait aucune revue, de sorte qu’un risque temporaire accepté était discrètement devenu permanent.
- Un objectif de reprise jamais testé : le RTO de 48 heures avait été documenté, mais jamais validé à grande échelle, si bien que la direction se fiait à une hypothèse qu’elle n’avait pas vérifiée.
- Un BIA périmé : le service de livraison à domicile, qui traitait les données les plus sensibles, n’avait jamais été inclus dans l’analyse d’impact ni dans la matrice de notification.
- Des lacunes de journalisation : la conservation limitée des journaux d’accès à distance a prolongé l’enquête de criminalistique et retardé l’évaluation de l’obligation de notification.
Le conseil d’administration a approuvé une feuille de route de mesures correctives financée, avec des responsables désignés et une reddition de comptes trimestrielle. Elle comprenait la remontée automatique des exceptions arrivant à échéance, des tests de restauration trimestriels à une échelle croissante, une mise à jour annuelle du BIA déclenchée par tout nouveau service, des exercices de la cellule de crise deux fois par année et une conservation prolongée des journaux. La leçon de gestion n’était pas que Saint-Laurent n’était pas préparée; sa stratégie de continuité et sa structure de crise avaient tenu. C’était que les lacunes qu’elle avait tolérées en période calme étaient devenues le chemin critique de la crise.

## Mesures, éléments probants et séquence de mise en œuvre axée d’abord sur la gouvernance

La résilience doit être suffisamment mesurable pour être gouvernée. L’objectif n’est pas de produire des tableaux de bord de façade qui indiquent le nombre de plans rédigés ou de séances de formation données, mais de créer des indicateurs crédibles qui sont corrélés avec la capacité réelle de reprise. Pour reprendre le vocabulaire des chapitres précédents, la direction a besoin d’indicateurs clés de risque qui l’avertissent lorsque la résilience s’érode et d’éléments probants qui permettent d’affirmer avec assurance qu’elle est réelle. Trois catégories d’éléments probants comptent.

Éléments probants de préparation, de reprise et de gouvernance

- Les éléments probants de préparation comprennent la fréquence, le réalisme et le taux de participation des exercices sur table, des simulations de crise et des exercices de reprise, la proportion des services critiques ayant fait l’objet d’un exercice au cours de la dernière année et la proportion des constatations d’exercice fermées dans les délais.
- Les éléments probants de reprise opérationnelle comprennent les taux de réussite et les durées des tests de restauration mesurés par rapport au RTO et au RPO, la plus grande échelle à laquelle la restauration a réellement été démontrée, le délai de reconstruction des systèmes critiques à partir d’images saines connues, les résultats des tests de reprise des identités et la couverture des données critiques par des sauvegardes immuables ou isolées.
- Les éléments probants de gouvernance comprennent des droits décisionnels documentés et à jour, des critères de remontée, des listes de contacts vérifiées dans un délai défini, des spécialistes externes dont les services ont été retenus, des procédures de mobilisation de l’assureur, une matrice de notification tenue à jour, un registre des incidents de confidentialité et des circuits d’approbation des communications définis. En situation de crise, les éléments probants de gouvernance déterminent souvent si l’organisation peut agir rapidement sans perdre la maîtrise de son discours ni manquer à ses obligations.
Indicateurs clés de risque pour la résilience

Plusieurs indicateurs sont particulièrement utiles comme ICR, parce qu’ils révèlent une dérive avant qu’un incident ne l’expose. Ils comprennent l’écart entre le RTO documenté et le RTO démontré pour chaque service critique; le nombre de services critiques dont le BIA est plus ancien que le cycle de mise à jour convenu; le nombre d’exceptions au risque échues ou en retard touchant des services critiques; la proportion des fournisseurs critiques dont les engagements de notification des incidents ont été testés; et l’ancienneté de la dernière restauration complète réussie. Chaque ICR devrait avoir un seuil lié à la tolérance de l’organisation et un responsable tenu d’agir lorsque ce seuil est franchi. Présenter ces indicateurs avec le profil du CSF 2.0 donne au conseil d’administration une vue unique et cohérente de la capacité de l’organisation à résister aux scénarios qu’elle a jugés les plus importants.

La mesure de résilience la plus honnête est l’écart entre le délai de reprise que l’organisation a promis et celui qu’elle a démontré.

Une séquence de mise en œuvre axée d’abord sur la gouvernance

Les organisations tentent souvent de bâtir leur résilience en achetant d’abord de la technologie : une nouvelle plateforme de sauvegarde, un environnement de reprise isolé, une application de gestion de crise. Ces investissements peuvent en valoir la peine, mais sans décisions de gouvernance pour les ancrer, ils ont tendance à être dimensionnés pour les mauvais services, testés par rapport aux mauvais objectifs et pris en charge par personne du côté des affaires. Une séquence axée d’abord sur la gouvernance est plus durable. La figure ci-dessous la présente en six étapes, chacune produisant des éléments probants sur lesquels repose l’étape suivante.

Figure 59 : une séquence axée d’abord sur la gouvernance pour bâtir la résilience

1. Définir les services critiques et les seuils de tolérance. La direction détermine les services dont la perturbation causerait un préjudice intolérable et fixe pour chacun la MTPD, le MBCO, le RTO et le RPO, en rendant les compromis visibles et en les liant à l’appétence pour le risque.

2. Cartographier les dépendances. Pour chaque service critique, l’organisation cartographie les personnes, les processus, la technologie, les données, les installations et les tiers dont il dépend, parce que les dépendances cachées déterminent la capacité de reprise réelle.

3. Établir la gouvernance de crise. Les droits décisionnels, les seuils de remontée, l’interface entre la cellule de crise et l’équipe d’intervention en cas d’incident, la matrice de notification, la politique en matière d’extorsion et le journal des décisions sont définis et approuvés avant d’être nécessaires.

4. Concevoir les stratégies de reprise et de continuité. L’architecture de sauvegarde, la reprise saine, la reprise des identités, l’ordre de reprise par niveaux, les solutions de contournement manuelles et les engagements des fournisseurs sont conçus pour atteindre les objectifs fixés à la première étape.

5. Faire des exercices et valider. Des exercices sur table, fonctionnels et grandeur nature, fondés sur les propres scénarios de risque de l’organisation, vérifient si les stratégies fonctionnent ensemble; les constatations deviennent des mesures de traitement des risques suivies.

6. Institutionnaliser et rendre compte. La résilience est intégrée à la revue de direction, à la portée de l’audit interne, à la reddition de comptes sur les ICR, à la planification des investissements (voir le chapitre 17) et à la surveillance exercée par le conseil d’administration, de sorte qu’elle fasse partie du système de gestion courant plutôt que d’un programme d’urgence.

Questions que les conseils d’administration et la haute direction devraient poser

Les administrateurs n’ont pas besoin de maîtriser les architectures de reprise, mais ils devraient être en mesure de poser des questions qui révèlent si la résilience est réelle ou seulement souhaitée. Les questions suivantes constituent un point de départ pratique :

- Services critiques : Lesquels de nos services causeraient un préjudice intolérable s’ils étaient perturbés, et qui a formellement approuvé les seuils de tolérance de chacun?
- Reprise démontrée : Pour chaque service critique, quel délai de reprise avons-nous réellement démontré, à quelle échelle, et comment se compare-t-il à ce que nous avons promis?
- Reprise sans l’attaquant : Si un rançongiciel chiffrait nos systèmes essentiels demain, pourrions-nous nous rétablir sans payer, et combien de temps cela prendrait-il?
- Reprise des identités : Avons-nous testé la reconstruction de notre plateforme d’identité à partir d’un état de confiance, et combien de temps cela a-t-il pris?
- Droits décisionnels : Qui a le pouvoir de mettre hors ligne des systèmes critiques, d’aviser les organismes de réglementation et d’entrer en contact avec un acteur de menace, et qui sont leurs suppléants?
- Politique en matière d’extorsion : Le conseil d’administration a-t-il approuvé une position sur le paiement des rançons, y compris la vérification juridique et les critères de décision qui s’appliqueraient?
- Préparation à la notification : Tenons-nous à jour une matrice de nos obligations de notification réglementaires et contractuelles, et quand a-t-elle été testée pour la dernière fois?
- Dépendance envers les fournisseurs : Quels tiers pourraient perturber nos services critiques, à quoi se sont-ils engagés en cas d’incident, et quel est notre plan si l’un d’eux fait défaut?
- Exercices : Quand l’équipe de direction a-t-elle fait pour la dernière fois un exercice portant sur un cyberscénario grave, qu’a-t-il révélé, et quelles constatations demeurent ouvertes?
- Communication : Comment communiquerions-nous avec le personnel, la clientèle et le conseil d’administration si nos plateformes de courriel et de collaboration étaient indisponibles?
- Apprentissage : Après notre dernier incident ou exercice important, quelles causes managériales ont été relevées, et qu’est-ce qui a changé en conséquence?
- Assurance : Quels éléments probants indépendants — audit interne, évaluation externe ou examen réglementaire — étayent les affirmations de la direction au sujet de notre résilience?

## Synthèse : la résilience, résultat de gouvernance qui survit à une sécurité imparfaite

La thèse centrale de la gouvernance de la cybersécurité est que les organisations ne peuvent pas éliminer l’incertitude, mais qu’elles peuvent la gérer avec diligence et de manière défendable. La gestion des incidents, la continuité des activités, la reprise après sinistre et la résilience opérationnelle ne sont donc pas des sujets opérationnels accessoires. Ce sont les mécanismes de gouvernance qui empêchent le risque résiduel de se transformer en défaillance existentielle. Les contrôles préventifs réduisent la vraisemblance qu’un préjudice survienne; la résilience détermine l’ampleur du préjudice qu’un incident peut causer et la rapidité avec laquelle l’organisation retrouve sa capacité de servir.

Ce chapitre a fait valoir que ces capacités doivent être gouvernées comme un seul système. Un incident majeur exige deux équipes imbriquées, l’une qui reprend le contrôle de l’environnement et l’autre qui protège l’entreprise. Il exige un cycle de vie dans lequel la direction peut s’orienter — stabiliser, clarifier, décider, rétablir et apprendre —, avec des droits décisionnels et une rigueur de la preuve établis à l’avance. Il exige un processus de notification capable de faire courir plusieurs délais réglementaires et contractuels à la fois. Et il exige des objectifs de reprise qui découlent des seuils de tolérance d’affaires fixés par la direction, et non de capacités techniques que l’on demande à la direction d’accepter. Pour les gestionnaires des technologies d’affaires, cela signifie traduire les seuils de tolérance en exigences de reprise, remettre en question les objectifs qui n’ont jamais été démontrés et exiger que les constatations d’exercice et les exceptions échues soient fermées plutôt que tolérées.

Les rançongiciels ont rendu ces exigences concrètes. Ils ont montré que les sauvegardes ne sont pas la capacité de reprise, que rétablir le service n’est pas rétablir la confiance, que les systèmes d’identité font partie du chemin critique de la reprise et que la plupart des décisions relatives à l’extorsion sont imposées par des lacunes de reprise créées bien avant l’attaque. Ils ont aussi montré que la dépendance est systémique : la résilience d’une organisation est limitée par celle des fournisseurs, des plateformes et des prestataires dont elle dépend. Les organismes de réglementation ont réagi en déplaçant leur attention des plans vers les résultats, comme l’illustre la ligne directrice E-21 du BSIF, axée sur les opérations critiques, la tolérance aux perturbations et les essais de scénarios graves mais plausibles.

Dans un environnement marqué par la persistance des rançongiciels et la dépendance systémique, la crédibilité d’une organisation se mesure de plus en plus non pas au fait qu’elle subisse des incidents — souvent indépendants de sa volonté —, mais à la façon dont elle se prépare, décide, communique, rétablit ses services et apprend. Lorsque la résilience est traitée comme une discipline continue de la haute direction plutôt que comme un cartable de plans, la cybersécurité devient gouvernable en situation de crise, et l’organisation acquiert la capacité d’absorber les chocs sans perdre sa mission, la confiance qu’on lui accorde ni sa viabilité stratégique.

## Résumé du chapitre

Toute organisation qui dépend de services numériques fera tôt ou tard face à un incident trop important pour que le centre des opérations de sécurité puisse l’absorber seul. À cette échelle, un incident devient une crise d’affaires dont les questions décisives sont managériales : qui décide, sur la foi de quels éléments probants, en vertu de quelle autorité et avec quelle imputabilité. Le chapitre soutient que la gestion des incidents, la continuité des activités, la reprise après sinistre et la résilience doivent être encadrées comme une seule capacité d’entreprise, avec deux équipes imbriquées, des droits décisionnels définis à l’avance, des processus de notification capables de gérer plusieurs délais à la fois et des objectifs de reprise qui découlent en cascade des tolérances d’affaires. Le rançongiciel a rendu cela concret : les sauvegardes ne sont pas la capacité de reprise, et rétablir le service n’est pas rétablir la confiance.

Points clés à retenir

- Les incidents majeurs sont des crises pour la haute direction qui reposent sur trois questions : quel préjudice d’affaires se produit, qui a l’autorité d’engager l’organisation et comment la diligence sera démontrée par la suite.
- Les pouvoirs de confinement, de communication publique, financiers, relatifs à l’extorsion et de reprise des activités devraient être attribués avec des suppléants nommés, et les seuils de remontée devraient être exprimés en termes d’affaires liés à l’appétence pour le risque.
- L’équipe d’intervention en cas d’incident reprend le contrôle de l’environnement pendant que la cellule de crise protège l’entreprise; une interface conçue à cette fin évite à la fois la fusion et la fragmentation.
- Le cycle de vie vu par la haute direction comprend la stabilisation, la clarté de la situation, la prise de décision à l’échelle de l’entreprise, la reprise et la reconstitution, ainsi que l’imputabilité et l’amélioration, en cohérence avec la publication NIST SP 800-61 Rev. 3 et le CSF 2.0.
- Les revues post-incident doivent cerner les causes managériales, comme une responsabilité floue ou des exceptions échues, et faire l’objet d’un rapport à une instance ayant l’autorité d’agir.
- La rigueur juridique commence dès la première heure : préservation des éléments probants, conception de l’enquête tenant compte du secret professionnel, communications encadrées, tiers retenus à l’avance et journal des décisions tenu par une personne désignée chargée de la consignation.
- Les régimes de notification comme la Loi 25, la LPRPDE, le BSIF, l’Item 1.05 de la SEC, la directive NIS2 et le règlement DORA ont des déclencheurs et des délais différents; les organisations ont donc besoin d’une matrice de notification tenue à jour et d’une justification documentée.
- La préparation aux rançongiciels est une préparation à la capacité de reprise; le moyen le plus efficace d’éviter une décision d’extorsion impossible est d’investir tôt dans une capacité de reprise qui rend le paiement inutile.
- La continuité des activités est la colonne vertébrale managériale de la résilience : le BIA énonce les tolérances, et la MTPD, le RTO, le RPO et le MBCO découlent en cascade des affaires jusqu’à la technologie.
- La reprise après sinistre doit reconstituer la confiance au moyen d’une reprise par niveaux, d’une restauration testée à grande échelle, d’une reprise saine et de la reprise des identités et des clés.
- La résilience opérationnelle présume la compromission, encadre la dépendance systémique et la concentration et, comme dans la ligne directrice E-21 du BSIF, maintient les opérations critiques dans les limites de tolérance dans des scénarios graves mais plausibles.
- La résilience doit être mesurée et exercée : la mesure la plus honnête est l’écart entre le délai de reprise promis et le délai démontré, et les constatations des exercices doivent être financées et fermées.
Termes clés

- Équipe d’intervention en cas d’incident — Équipe opérationnelle qui trie, enquête, confine, éradique, restaure et recueille les éléments probants, fournissant au reste de l’organisation des faits fiables.
- Cellule de crise — Équipe de direction qui encadre un incident majeur comme un événement de risque d’entreprise, fixe les priorités, dirige la réponse juridique et les communications et prend les décisions qui lui sont réservées.
- Seuil de remontée — Critère d’affaires défini à l’avance, comme la panne d’un service critique ou une demande d’extorsion, qui fait passer un incident du traitement technique à la gestion de crise par la haute direction.
- Journal des décisions — Registre de chaque décision importante prise en situation de crise : ce qui a été décidé, quand, par qui, sur la foi de quels faits, quelles options et quels risques ont été examinés et quelles mesures ont suivi.
- Incident de confidentialité — En vertu de la Loi 25 du Québec, accès, utilisation ou communication non autorisés d’un renseignement personnel, ou perte de celui-ci; chaque incident doit être inscrit au registre.
- Risque réel de préjudice grave (RRPG) — Seuil de la LPRPDE à partir duquel une atteinte aux mesures de sécurité doit être déclarée au Commissariat à la protection de la vie privée du Canada et aux personnes concernées.
- Matrice de notification — Liste tenue à jour de chaque régime applicable et de chaque contrat important, avec son déclencheur, son seuil, son destinataire, son délai et son responsable.
- Capacité de reprise — Capacité démontrée de restaurer les services et les données critiques dans les limites d’objectifs définis, à grande échelle, avec une intégrité validée, en conditions défavorables et sans dépendre de l’attaquant.
- Bilan d’impact sur les activités (BIA) — Analyse qui cartographie les processus critiques, les dépendances et le préjudice d’une interruption en fonction du temps, et dans laquelle les responsables métier énoncent leurs tolérances.
- Durée maximale d’interruption tolérable (MTPD) — Durée au-delà de laquelle la non-reprise d’un produit, d’un service ou d’une activité devient inacceptable; un jugement d’affaires ancré dans l’appétence pour le risque.
- Délai de reprise visé (RTO) — Période pendant laquelle une activité ou ses ressources de soutien doivent être reprises, fixée plus courte que la MTPD pour laisser une marge.
- Point de reprise visé (RPO) — Moment auquel les données doivent être restaurées, qui définit la perte de données acceptable et la fréquence à laquelle les données doivent être protégées.
- Niveau minimal de continuité des activités (MBCO) — Niveau de service minimal acceptable pendant une perturbation, sachant qu’un service dégradé peut être tolérable lorsque l’absence de service ne l’est pas.
- Reprise saine — Reconstruction des systèmes à partir d’images fiables dans un environnement isolé et validation de ceux-ci avant leur reconnexion, afin de prévenir une réinfection.
- Tolérance aux perturbations — En vertu de la ligne directrice E-21 du BSIF, niveau de perturbation qu’une opération critique peut supporter, au regard duquel des scénarios graves mais plausibles sont mis à l’épreuve.

## Questions de révision

Questions à développement

1. Le chapitre soutient qu’« en situation de crise, une organisation performe au niveau de sa préparation en matière de gouvernance, et non au niveau de ses outils techniques ». Évaluez cette affirmation à l’aide des trois questions de la haute direction, des cinq types d’autorité en situation de crise et de la mise en situation de Saint-Laurent Medical Supply.

2. Analysez les deux modes de défaillance que relève le chapitre, soit la fusion et la fragmentation de l’équipe d’intervention et de la cellule de crise. Concevez une interface entre les deux équipes pour une organisation de taille moyenne et expliquez comment vous la mettriez à l’épreuve.

3. Une entreprise dont le siège social est au Québec, qui a des clients en Ontario et qui est inscrite à une bourse américaine subit un vol de données. À l’aide du chapitre, expliquez quels régimes de notification peuvent s’appliquer, en quoi leurs déclencheurs et leurs délais diffèrent, et comment l’organisation devrait gérer leur chevauchement.

4. Appliquez le chapitre à une organisation de votre choix. Déterminez deux services critiques, fixez une MTPD, un RTO, un RPO et un MBCO pour chacun, et évaluez si ses capacités de reprise actuelles permettraient de les respecter dans un scénario de rançongiciel.

5. Évaluez l’affirmation du chapitre selon laquelle « la plupart des décisions d’extorsion sont imposées par des lacunes de reprise créées bien avant l’attaque ». Proposez la politique du conseil d’administration, le processus décisionnel et les investissements dans la capacité de reprise qui réduiraient la pression de payer.

Questions à choix multiples

Choisissez la meilleure réponse. Les réponses figurent à l’annexe « Réponses aux questions à choix multiples ».

1. Selon le chapitre, à quel moment un incident de cybersécurité devient-il une crise pour la haute direction plutôt qu’un événement technique?

A. Lorsque le risque résiduel se matérialise à une échelle que le centre des opérations de sécurité ne peut pas absorber seul

B. Lorsque l’équipe d’intervention y travaille depuis plus d’un quart de travail

C. Lorsqu’il est confirmé que l’attaquant est un acteur de menace parrainé par un État

D. Lorsque l’incident a reçu un score CVSS v4.0 supérieur à neuf

2. Quelle défaillance de gouvernance le chapitre relève-t-il habituellement dans la prise de décision en situation de crise?

A. Le mauvais dirigeant prend systématiquement des décisions qui devraient revenir au CSI

B. Personne ne sait avec certitude qui devrait décider; les décisions sont donc retardées ou contestées par la suite

C. Les conseils d’administration insistent pour prendre chaque décision opérationnelle pendant l’incident

D. Les décideurs se fient trop à une autorité documentée et à des critères répétés

3. Lequel des énoncés suivants est un seuil de remontée exprimé en termes d’affaires, comme le recommande le chapitre?

A. Plus de cinquante alertes de détection sur les terminaux en une heure

B. La détection d’un logiciel malveillant dont la signature est connue sur un ordinateur portable

C. L’interruption d’un service critique au-delà d’une période définie

D. Une modification de règle de pare-feu effectuée hors de la fenêtre de changement

4. Quel énoncé décrit le mieux les finalités différentes de l’équipe d’intervention en cas d’incident et de la cellule de crise?

A. L’équipe d’intervention gère les communications externes; la cellule de crise mène l’enquête criminalistique

B. L’équipe d’intervention fixe les priorités d’affaires; la cellule de crise effectue le confinement et l’éradication

C. L’équipe d’intervention rend compte au conseil; la cellule de crise rend compte au centre des opérations de sécurité

D. L’équipe d’intervention reprend le contrôle de l’environnement; la cellule de crise protège l’entreprise pendant ce temps

5. Une équipe technique restaure les systèmes qu’elle juge importants alors que l’entreprise avait d’abord besoin d’autres systèmes, et des dirigeants publient des déclarations qu’ils doivent ensuite retirer. Quel mode de défaillance cela illustre-t-il?

A. La fusion des deux équipes en une seule structure surchargée

B. Une dépendance excessive envers une source unique de vérité

C. Un recours excessif aux canaux de communication hors bande

D. La séparation des deux équipes sans intégration

6. Quel élément de l’interface entre l’équipe d’intervention et la cellule de crise garantit que certaines décisions, comme la publication d’une déclaration externe, ne peuvent être prises que par l’équipe de direction?

A. Le rythme opérationnel

B. Le rôle d’agent de liaison

C. Les décisions réservées

D. Les communications hors bande

7. Dans les cinq phases vues par la haute direction, quel est le principal objectif de la clarté de la situation?

A. Une certitude complète sur l’identité de l’attaquant avant toute décision

B. Une prise de décision cohérente dans l’incertitude, à l’aide de faits confirmés, d’hypothèses et de niveaux de confiance

C. La restauration de tous les systèmes touchés avant d’informer la haute direction de l’incident

D. La production de la feuille de route corrective financée et approuvée par le conseil

8. Pourquoi le chapitre insiste-t-il pour que les revues post-incident cernent les causes managériales et soient animées par une personne indépendante de l’intervention?

A. Les causes managériales mettent en cause des personnes présentes, et une revue qui ne trouve que des causes techniques ne produit qu’un correctif

B. Les organismes de réglementation exigent que toutes les revues post-incident soient effectuées et signées par des auditeurs externes

C. Les causes techniques sont rarement réelles et devraient donc être exclues du rapport de revue

D. Seules des personnes indépendantes peuvent imposer des sanctions disciplinaires au personnel

9. Quel est le changement conceptuel le plus important de la publication NIST SP 800-61 Rev. 3 pour les gestionnaires?

A. Elle ajoute une septième phase d’incident consacrée à la négociation de la rançon

B. Elle associe ses recommandations d’intervention aux six fonctions du CSF 2.0, y compris Gouverner

C. Elle remplace le CSF par l’ISO/IEC 27035 comme fondement de l’intervention en cas d’incident

D. Elle limite sa portée aux organismes fédéraux américains et à leurs contractuels

10. Pourquoi la réinstallation immédiate d’un serveur infecté pour rétablir le service peut-elle entrer en conflit avec la rigueur juridique de l’intervention?

A. Elle peut détruire les seuls éléments probants montrant comment l’attaquant est entré et ce qui a été pris

B. Elle déclenche automatiquement une divulgation publique en vertu de l’Item 1.05 du formulaire 8-K de la SEC

C. Elle annule toute couverture de cyberassurance, quelles que soient les modalités de la police

D. Elle est interdite par la Loi 25 du Québec pour tout système contenant des renseignements personnels

11. Selon la Loi 25 du Québec telle que décrite dans le chapitre, quels incidents de confidentialité doivent être inscrits au registre?

A. Seulement les incidents qui présentent un risque qu’un préjudice sérieux soit causé aux personnes concernées

B. Seulement les incidents touchant plus qu’un nombre défini de personnes

C. Seulement les incidents que la Commission d’accès à l’information a demandés

D. Chaque incident de confidentialité, qu’il présente ou non un risque qu’un préjudice sérieux soit causé

12. Une entreprise canadienne inscrite à une bourse américaine détermine un lundi qu’un incident est important. En l’absence de jours fériés, à quelle date doit-elle déposer la divulgation prévue à l’Item 1.05 du formulaire 8-K?

A. Le lundi, le jour même de la décision sur l’importance relative

B. Le jeudi, 72 heures après la découverte initiale de l’incident

C. Le vendredi, quatre jours ouvrables après la décision sur l’importance relative

D. Le lundi suivant, sept jours civils après la découverte

13. Une entité financière de l’UE classe un incident comme majeur six heures après en avoir pris connaissance. En vertu du règlement DORA, quand la notification initiale est-elle due?

A. Dans les 24 heures suivant le classement, sans limite liée à la prise de connaissance

B. Dans les 72 heures suivant la prise de connaissance, comme pour les notifications d’incident de la directive NIS2

C. Dans les quatre heures suivant le classement, et au plus tard 24 heures après la prise de connaissance

D. Dans les quatre jours ouvrables suivant la décision établissant que l’incident est important

14. Selon le chapitre, quel est le moyen le plus efficace d’éviter une décision d’extorsion impossible?

A. Négocier à l’avance un plafond de paiement avec des intermédiaires de rançongiciels

B. Souscrire une cyberassurance qui rembourse toute rançon payée par l’organisation

C. Confier la décision de paiement à un négociateur externe expérimenté

D. Investir, bien avant l’incident, dans une capacité de reprise qui rend le paiement inutile

15. Quel énoncé sur la relation entre la MTPD et le RTO est conforme au chapitre?

A. Le RTO doit être plus court que la MTPD, afin de laisser une marge pour l’imprévu

B. Le RTO doit être plus long que la MTPD pour permettre une enquête criminalistique complète

C. Le RTO et la MTPD devraient être égaux afin de ne pas gaspiller de ressources

D. La MTPD est fixée par les TI une fois le RTO validé techniquement

16. Un hôpital accepte de fonctionner pendant un certain temps avec des dossiers papier et des services réduits plutôt qu’avec des dossiers électroniques complets. Quel objectif de reprise exprime ce niveau dégradé acceptable?

A. Le point de reprise visé (RPO)

B. Le niveau minimal de continuité des activités (MBCO)

C. La durée maximale d’interruption tolérable (MTPD)

D. Le délai de reprise visé (RTO)

17. Pourquoi le chapitre inclut-il la reprise des identités et des clés dans la portée de la reprise après sinistre?

A. Si le service d’annuaire est compromis, tous les systèmes qui lui font confiance le sont aussi

B. Les systèmes d’identité sont le composant le moins coûteux à restaurer après un incident

C. Les organismes de réglementation interdisent de restaurer des données avant le remplacement des services d’identité

D. Les plateformes d’identité ne contiennent jamais de sauvegardes et doivent toujours être rachetées

18. En quoi la question de résilience opérationnelle de la ligne directrice E-21 du BSIF diffère-t-elle de la planification traditionnelle de la continuité?

A. Elle demande si chaque système peut être repris dans les limites de son RTO documenté

B. Elle demande si les copies de sauvegarde sont conservées dans au moins deux centres de données distincts

C. Elle demande si une opération critique peut demeurer dans les limites de tolérance, quel que soit le composant défaillant

D. Elle demande si l’institution a souscrit une couverture de cyberassurance suffisante

19. Dans la mise en situation de Saint-Laurent, le BIA fixait une MTPD de 72 heures pour l’exécution des commandes des hôpitaux et un RTO de 48 heures pour le système d’entrepôt, mais la reprise a pris six jours. Pourquoi la MTPD de l’approvisionnement critique des hôpitaux n’a-t-elle pas été dépassée?

A. L’attaquant a fourni un outil de déchiffrement fonctionnel qui a permis de rétablir tôt le système d’entrepôt

B. L’exécution manuelle des commandes d’articles critiques a maintenu le service au-dessus du MBCO pendant la reconstruction des systèmes

C. Les hôpitaux ont accepté de porter la MTPD à six jours lors de la première réunion de la cellule de crise

D. Les commandes de la pharmacie ont été réacheminées par les propres systèmes d’entrepôt des hôpitaux

20. Quel énoncé le chapitre présente-t-il comme la mesure de résilience la plus honnête?

A. Le nombre de plans de continuité rédigés et approuvés au cours de l’année

B. Le pourcentage d’employés ayant suivi la formation de sensibilisation aux incidents

C. Le budget total consacré à la technologie de sauvegarde et de reprise cette année

D. L’écart entre le délai de reprise promis et le délai de reprise démontré
