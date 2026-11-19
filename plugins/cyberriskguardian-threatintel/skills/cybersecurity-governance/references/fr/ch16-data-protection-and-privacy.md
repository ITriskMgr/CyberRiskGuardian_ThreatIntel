<!-- Léger, M.-A. (2026). Introduction à la gouvernance de la cybersécurité pour la gestion des technologies d’affaires (3e éd., v2.51). Chapitre 16 : Protection des données et des renseignements personnels. CC BY-NC 4.0 -->

# Chapitre 16 : Protection des données et des renseignements personnels

## Résultats d’apprentissage

Au terme de ce chapitre, vous devriez être en mesure de :

1. Expliquer ce qui constitue un renseignement personnel et un renseignement sensible, et distinguer les rôles de responsable du traitement, de sous-traitant et de fournisseur de services.

2. Distinguer le risque d’atteinte à la vie privée du risque de cybersécurité et expliquer pourquoi un système sécurisé peut tout de même constituer un échec en matière de vie privée.

3. Comparer les principales obligations de la Loi 25 du Québec, de la LPRPDE et du RGPD, y compris les seuils, les délais de notification des violations et les mécanismes d’application.

4. Appliquer le cycle de vie en cinq phases des renseignements personnels pour cerner les contrôles de protection de la vie privée, les responsabilités et les priorités d’investissement.

5. Évaluer la minimisation, la conservation, la résidence des données, le chiffrement et la prévention des pertes de données en tant que contrôles d’ingénierie de la vie privée.

6. Concevoir un processus d’évaluation des facteurs relatifs à la vie privée qui couvre les déclencheurs, la proportionnalité, les transferts transfrontaliers et l’acceptation du risque résiduel.

7. Recommander une façon d’intégrer la vie privée dans un SGSI, une bibliothèque de contrôles et un modèle opérationnel, avec des rôles, des éléments probants et des indicateurs clés de risque clairs.

Dans les organisations contemporaines, le risque lié à la vie privée ne réside pas dans les textes juridiques. Il réside dans les flux de données, les configurations des systèmes, les journaux, les sauvegardes, les interfaces de programmation d’applications (API), les chaînes de traitement analytique, les plateformes des fournisseurs et les processus d’affaires quotidiens. Bon nombre des incidents qui font les manchettes, aboutissent sur le bureau de l’organisme de réglementation ou s’inscrivent à l’ordre du jour du conseil d’administration sont, au fond, des défaillances en matière de vie privée qui s’expriment par la technologie : des renseignements personnels recueillis sans finalité claire, copiés dans un environnement infonuagique que personne n’a inventorié, conservés longtemps après avoir cessé d’être nécessaires, exposés par des contrôles d’accès faibles ou communiqués à un partenaire selon des conditions que personne n’a examinées. Une gouvernance de la cybersécurité qui ignore la protection des données est donc incomplète, et une gouvernance de la vie privée qui ignore la cybersécurité n’est guère plus qu’un ensemble de politiques qui attendent d’être contredites par la réalité.

Le problème de gouvernance, c’est que les obligations en matière de vie privée s’expriment dans le langage du droit et des principes, alors que les contrôles qui permettent d’y satisfaire s’expriment dans le langage de l’architecture, de la configuration et des opérations. Une loi peut exiger que les renseignements personnels soient détruits une fois leur finalité accomplie; encore faut-il que quelqu’un décide quels systèmes contiennent ces renseignements, quelle durée de conservation s’applique, comment la suppression se propage aux répliques et aux sauvegardes, et quels éléments probants montreront qu’elle a réellement eu lieu. Un organisme de réglementation peut exiger une évaluation avant que des renseignements ne quittent la province; encore faut-il que quelqu’un décide qui la réalise, ce qu’elle examine, qui accepte le risque résiduel et ce qui se passe lorsqu’un fournisseur infonuagique change de sous-traitants. Les gestionnaires se trouvent précisément à cette jonction. Ils n’ont pas à devenir juristes en protection de la vie privée ni cryptographes, mais ils doivent veiller à ce que les obligations deviennent des décisions, à ce que ces décisions aient des responsables et à ce que ces responsables puissent produire des éléments probants.

Ce chapitre s’appuie sur plusieurs chapitres précédents. Le chapitre 3 a traité la conformité comme une discipline de la preuve plutôt que comme un exercice consistant à cocher des cases; les chapitres 4 à 6 ont développé l’évaluation des risques fondée sur des scénarios, qui s’applique directement au risque lié à la vie privée; le chapitre 10 a couvert les contrôles d’identité et d’accès dont dépendent la plupart des mesures de protection de la vie privée; le chapitre 12 a traité de l’intervention en cas d’incident, qui comporte désormais des délais légaux de notification; et le chapitre 15 a examiné les environnements infonuagiques dans lesquels réside aujourd’hui une grande partie des renseignements personnels. Les chapitres 19 et 20 étendront ensuite la discussion à la gouvernance des tiers et à la cryptographie.

Le chapitre traite la protection des données et des renseignements personnels comme un domaine de contrôle de gestion. Il commence par les concepts fondamentaux et les acteurs, puis passe en revue le paysage réglementaire dans une perspective québécoise et canadienne, le règlement général sur la protection des données (RGPD) de l’Union européenne et les normes internationales servant de points de référence essentiels. Il suit ensuite les renseignements personnels tout au long de leur cycle de vie en examinant la minimisation et la limitation des finalités, la conservation et la suppression, la résidence des données et les transferts transfrontaliers, le chiffrement en tant que contrôle de protection de la vie privée, ainsi que la surveillance et la journalisation qui rendent la protection des données observable. Il accorde une attention particulière aux évaluations des facteurs relatifs à la vie privée (EFVP), qui constituent une obligation légale au Québec et, partout, le pont le plus pratique entre le droit de la vie privée et la conception des systèmes, et il examine une mise en situation dans laquelle une organisation québécoise évalue une nouvelle plateforme infonuagique de gestion de la relation client hébergée à l’extérieur de la province. Il se termine en montrant comment les obligations en matière de vie privée peuvent être intégrées à un système de gestion de la sécurité de l’information (SGSI) et à un modèle opérationnel doté de rôles, de mesures et d’éléments probants clairs.

La thèse centrale est simple. Le risque lié à la vie privée devient gérable lorsque l’organisation gouverne explicitement le cycle de vie des renseignements personnels et les mesures de protection qui s’appliquent à chaque phase, et lorsqu’elle peut démontrer qu’elle le fait. L’ingénierie de la vie privée est la discipline qui relie les décisions relatives au cycle de vie à la conception, à la configuration, à la surveillance et aux éléments probants des systèmes; la gouvernance de la vie privée est ce qui garantit que ces décisions sont prises de façon délibérée, par les bonnes personnes, dans les limites d’une appétence pour le risque approuvée.

## Concepts fondamentaux : renseignements personnels, sensibilité et acteurs

Même si les différents instruments emploient des vocabulaires différents, leurs concepts sous-jacents convergent de façon remarquable. Un gestionnaire qui comprend une poignée d’idées fondamentales — ce qui constitue un renseignement personnel, ce qui rend certains renseignements sensibles, qui décide et qui exécute, et en quoi le risque lié à la vie privée diffère du risque de sécurité — peut s’orienter dans la plupart des régimes avec l’aide de spécialistes. Sans ces idées, chaque nouvelle loi ou norme ressemble à un univers distinct, et l’organisation finit par avoir des programmes qui se chevauchent, qui dédoublent les efforts et qui laissent pourtant des lacunes.

Ce qui constitue un renseignement personnel

En vertu de la Loi sur la protection des renseignements personnels et les documents électroniques (LPRPDE) fédérale du Canada, un renseignement personnel est un renseignement concernant un individu identifiable, quelle que soit sa forme. La Loi sur la protection des renseignements personnels dans le secteur privé du Québec, modernisée par la Loi 25, emploie une notion semblable : tout renseignement qui concerne une personne physique et permet, directement ou indirectement, de l’identifier. Le RGPD parle de données à caractère personnel et précise explicitement que les identifiants en ligne, les données de localisation et les éléments propres à l’identité physique, économique, culturelle ou sociale d’une personne en font partie. La norme ISO/IEC 29100:2024, le cadre international de protection de la vie privée, emploie l’expression neutre personally identifiable information (PII), rendue en français par « données à caractère personnel » (DCP).

La conséquence pratique est que cette catégorie est beaucoup plus large que ne le supposent la plupart des unités d’affaires. Elle comprend les noms et les adresses de courriel, mais aussi les identifiants d’appareils, les numéros de clients, les adresses IP dans bien des contextes, les enregistrements d’appels, les registres de lecture de badges, les données télématiques des véhicules, les photographies, les inférences produites par des modèles d’analytique et les notes en texte libre saisies par un représentant des ventes. Un renseignement ne cesse pas d’être personnel parce qu’il est stocké dans un fichier journal ou parce que l’organisation le considère comme une donnée opérationnelle plutôt que comme une donnée sur la clientèle. Un critère utile consiste à se demander si le renseignement, seul ou combiné à d’autres renseignements raisonnablement accessibles, pourrait être relié à une personne; si c’est le cas, il devrait être gouverné comme un renseignement personnel jusqu’à ce qu’une analyse défendable démontre le contraire.

Renseignements sensibles et attente raisonnable en matière de vie privée

La plupart des régimes reconnaissent que certains renseignements méritent une protection plus grande que d’autres. La loi québécoise, telle que modifiée, considère un renseignement comme sensible lorsque, selon les termes de l’article 12 de la loi sur le secteur privé, « de par sa nature notamment médicale, biométrique ou autrement intime, ou en raison du contexte de son utilisation ou de sa communication, il suscite un haut degré d’attente raisonnable en matière de vie privée ». Les renseignements sensibles exigent généralement un consentement exprès pour les utilisations secondaires et pèsent lourd dans les évaluations des facteurs relatifs à la vie privée et dans les analyses de la gravité des incidents. Le RGPD énumère des « catégories particulières » de données — notamment les données concernant la santé, les données biométriques utilisées aux fins d’identification, les données génétiques, l’origine raciale ou ethnique, les convictions religieuses, les opinions politiques, l’appartenance syndicale ainsi que la vie sexuelle ou l’orientation sexuelle — dont le traitement est interdit, sauf si une condition particulière s’applique. La LPRPDE ne définit pas de liste fermée, mais exige que les mesures de sécurité et le consentement soient proportionnés à la sensibilité, et le Commissariat à la protection de la vie privée du Canada (CPVP) considère depuis longtemps les renseignements sur la santé, les renseignements financiers et les renseignements biométriques comme généralement sensibles.

Sur le plan de la gouvernance, la sensibilité fait le pont entre la vie privée et la dimension impact du triangle du risque présenté au chapitre 1 et approfondi au chapitre 4. La sensibilité d’un jeu de données influe sur le préjudice que les personnes pourraient subir, sur les conséquences juridiques pour l’organisation et sur les contrôles que l’appétence pour le risque de l’organisation devrait exiger. La sensibilité devrait donc être un attribut obligatoire du schéma de classification des données, et non un jugement porté de façon informelle par chaque équipe de projet. Lorsque le schéma de classification distingue déjà « confidentiel » de « restreint », les gestionnaires devraient s’assurer que ces étiquettes correspondent explicitement à la sensibilité au regard de la vie privée, plutôt qu’à la seule confidentialité commerciale.

Responsables du traitement, sous-traitants et fournisseurs de services

La norme ISO/IEC 29100 distingue trois acteurs : les personnes concernées (les individus que concernent les renseignements), les responsables du traitement de DCP (ceux qui déterminent les finalités et les moyens du traitement) et les sous-traitants de DCP (ceux qui traitent des renseignements pour le compte d’un responsable du traitement). Le modèle responsable du traitement–sous-traitant du RGPD repose essentiellement sur la même logique, en y ajoutant la notion de responsables conjoints du traitement lorsque deux organisations déterminent conjointement les finalités et les moyens. La loi québécoise parle de l’entreprise qui détient les renseignements et des personnes ou organismes à qui elle confie des renseignements en vertu d’un mandat ou d’un contrat de service écrit; la LPRPDE exprime la même idée par le principe selon lequel une organisation demeure responsable des renseignements transférés à un tiers aux fins de traitement.

Il en découle trois conséquences pour la gestion. Premièrement, l’organisation doit savoir quand elle agit comme responsable du traitement (ou l’équivalent) et quand elle agit comme sous-traitant, car les obligations diffèrent : un responsable du traitement doit justifier les finalités, obtenir le consentement lorsqu’il est requis et répondre aux personnes, tandis qu’un sous-traitant doit suivre les instructions et protéger ce qu’il reçoit. Deuxièmement, un même système peut comporter les deux rôles, selon les données de qui sont traitées et en vertu de quel contrat; un fournisseur de logiciel-service est un sous-traitant pour les données de ses clients, mais un responsable du traitement pour ses propres données de facturation et de marketing. Troisièmement, impartir le traitement ne permet pas d’impartir l’imputabilité. Les ententes infonuagiques et de services ajoutent un acteur dont les contrôles doivent être gouvernés, encadrés par contrat et démontrés par des éléments probants, mais les obligations qui incombent au responsable du traitement demeurent. La norme ISO/IEC 27018:2025, le code de bonnes pratiques pour la protection des DCP dans les nuages publics agissant comme sous-traitants de DCP, est précisément construite autour de cette relation, et le chapitre 19 approfondit les mécanismes d’assurance à l’égard des fournisseurs qui la rendent opérante.

Risque lié à la vie privée et risque de sécurité : des risques qui se chevauchent, mais distincts

Le risque lié à la vie privée et le risque de cybersécurité se chevauchent largement, mais ils ne sont pas identiques. Le NIST Privacy Framework exprime bien cette relation : le risque de cybersécurité découle d’une perte de confidentialité, d’intégrité ou de disponibilité, tandis que le risque lié à la vie privée découle d’un traitement de données qui peut causer des problèmes aux personnes. Les deux se recoupent dans ce que le NIST appelle les événements de vie privée liés à la cybersécurité, comme une violation de données qui expose des dossiers de clients. Mais des problèmes de vie privée peuvent aussi découler d’un traitement parfaitement sécurisé : un projet d’analytique qui infère des problèmes de santé à partir des habitudes d’achat, un outil de surveillance qui suit le personnel au-delà de ce qui est raisonnable, une pratique de conservation qui garde des renseignements pendant des décennies, ou un transfert techniquement chiffré, mais juridiquement injustifié.

Cette distinction importe pour la gouvernance, car une équipe de sécurité peut être pleinement efficace sans que l’organisation soit pour autant conforme. Un pare-feu ne rend pas licite une collecte injustifiée, et un programme de gestion des vulnérabilités bien mené ne permet pas de répondre à une demande d’accès dans le délai prévu par la loi. À l’inverse, un programme de protection de la vie privée qui repose sur des politiques sans mesures de protection techniques échouera la première fois qu’un attaquant atteindra une base de données. La réponse de gestion est l’intégration assortie de frontières claires : des scénarios de risque communs, des inventaires communs et des processus de gestion des incidents communs, mais une imputabilité distincte pour les questions auxquelles chaque discipline est la mieux placée pour répondre.

Un système peut être parfaitement sécurisé et constituer néanmoins un échec sur le plan de la vie privée; la gouvernance de la vie privée demande non seulement si les données sont protégées, mais aussi si elles devraient être traitées tout court, à cette fin, à cet endroit et pendant cette durée.

## Le paysage réglementaire : le Québec, le Canada, l’UE et au-delà

Du point de vue canadien et québécois, les gestionnaires évoluent dans un régime à plusieurs niveaux. Les lois provinciales, les lois fédérales, les règles sectorielles, les lois étrangères à portée extraterritoriale, les obligations contractuelles et les normes volontaires s’appliquent toutes en même temps, souvent au même jeu de données. Cette section ne vise pas à énumérer chaque obligation — c’est le travail des conseillers juridiques et du bureau de la protection des renseignements personnels —, mais à donner aux gestionnaires une carte exacte, à jour en octobre 2026, des principaux instruments et de la façon dont ils convergent. Comme le droit de la protection des renseignements personnels change fréquemment, tout programme construit à partir de cette carte devrait comprendre un mécanisme de veille législative et de mise à jour des registres des obligations, comme le traite le chapitre 3.

Québec : la Loi 25 et sa modernisation par étapes

La Loi modernisant des dispositions législatives en matière de protection des renseignements personnels, sanctionnée en septembre 2021 et largement connue sous le nom de Loi 25 (anciennement le projet de loi no 64), a modifié en profondeur la loi québécoise sur la protection des renseignements personnels dans le secteur privé ainsi que la loi applicable aux organismes publics. Ses obligations visant le secteur privé sont entrées en vigueur en trois étapes, ce qui importe, car cela explique pourquoi de nombreuses organisations québécoises font encore mûrir des programmes qui étaient légalement exigés depuis des années.

- 22 septembre 2022. La première étape a fait de la personne ayant la plus haute autorité au sein de l’entreprise — habituellement le chef de la direction — la personne responsable de la protection des renseignements personnels par défaut, avec la possibilité de déléguer cette fonction par écrit, et a exigé que le titre et les coordonnées de cette personne soient publiés sur le site Web de l’entreprise. Elle a aussi instauré l’obligation d’aviser la Commission d’accès à l’information du Québec (CAI) et les personnes concernées de tout incident de confidentialité présentant un risque qu’un préjudice sérieux soit causé, ainsi que l’obligation de tenir un registre de tous les incidents de confidentialité.
- 22 septembre 2023. La deuxième étape, la plus importante, a introduit des politiques et des pratiques de gouvernance qui doivent être publiées en termes clairs sur le site Web; des évaluations des facteurs relatifs à la vie privée obligatoires pour les projets d’acquisition, de développement ou de refonte de systèmes d’information ou de prestation électronique de services impliquant des renseignements personnels, ainsi qu’avant toute communication de renseignements personnels à l’extérieur du Québec; la confidentialité par défaut pour les produits et services technologiques offerts au public; des obligations de transparence à l’égard des technologies permettant d’identifier, de localiser ou de profiler une personne et des décisions fondées exclusivement sur un traitement automatisé; des règles de consentement renforcées, y compris le consentement exprès pour les renseignements sensibles; des règles sur la destruction et l’anonymisation; un droit à la désindexation; et un nouveau régime d’application comportant des sanctions administratives pécuniaires et des amendes pénales plus élevées.
- 22 septembre 2024. La troisième étape a accordé aux personnes un droit à la portabilité des données : sur demande, un renseignement personnel informatisé recueilli auprès d’elles doit leur être communiqué, ou être communiqué à toute personne ou à tout organisme qu’elles désignent, dans un format technologique structuré et couramment utilisé.
Deux règlements complètent le tableau. Le Règlement sur les incidents de confidentialité précise le contenu des avis et du registre des incidents, qui doit être conservé pendant cinq ans après que l’entreprise a pris connaissance d’un incident. Le Règlement concernant l’anonymisation des renseignements personnels, en vigueur depuis le 30 mai 2024, établit le processus qu’une entreprise doit suivre avant de pouvoir considérer des renseignements comme anonymisés, notamment une analyse des risques de réidentification, la supervision par une personne compétente, une réévaluation périodique et un registre des renseignements anonymisés.

Le régime d’application mérite l’attention des conseils d’administration. Depuis septembre 2023, la CAI peut imposer aux entreprises des sanctions administratives pécuniaires pouvant atteindre 10 millions de dollars ou 2 % du chiffre d’affaires mondial de l’exercice précédent, selon le montant le plus élevé; les amendes pénales prononcées à la suite d’une poursuite peuvent atteindre 25 millions de dollars ou 4 % du chiffre d’affaires mondial, et les administrateurs et dirigeants qui ordonnent ou autorisent une infraction, ou qui y consentent, peuvent être tenus responsables à titre de participants. La CAI a publié en 2023 un cadre général d’application des sanctions administratives pécuniaires, qui énumère des facteurs comme la gravité et la durée du manquement, la sensibilité des renseignements, le nombre de personnes touchées, les mesures correctives prises et la collaboration de l’entreprise. Les personnes disposent aussi d’un droit d’action privé : lorsqu’une atteinte illicite cause un préjudice et résulte d’une faute intentionnelle ou d’une faute lourde, le tribunal doit accorder des dommages-intérêts punitifs d’au moins 1 000 $. Pour les gestionnaires, la portée de ce régime tient moins aux montants maximaux qu’au fait que le cadre de la CAI récompense une diligence démontrable — des évaluations documentées, des mesures correctives rapides et la collaboration —, ce qu’un programme bien gouverné produit justement comme sous-produit.

Droit fédéral : la LPRPDE et le long chemin vers la réforme

La LPRPDE continue de régir la collecte, l’utilisation et la communication de renseignements personnels dans le cadre d’activités commerciales dans les provinces qui n’ont pas de loi essentiellement similaire, ainsi que dans les entreprises fédérales, comme les banques, les télécommunications et le transport interprovincial, partout au Canada. Ses obligations sont exprimées en dix principes relatifs à l’équité dans le traitement de l’information : la responsabilité; la détermination des fins de la collecte; le consentement; la limitation de la collecte; la limitation de l’utilisation, de la communication et de la conservation; l’exactitude; les mesures de sécurité; la transparence; l’accès aux renseignements personnels; et la possibilité de porter plainte à l’égard du non-respect des principes. Depuis novembre 2018, les organisations doivent déclarer au CPVP les atteintes aux mesures de sécurité qui créent un risque réel de préjudice grave et aviser les personnes concernées dès que possible, et elles doivent tenir un registre de toutes les atteintes pendant au moins 24 mois. Le Québec, la Colombie-Britannique et l’Alberta ont des lois sur le secteur privé reconnues comme essentiellement similaires; la LPRPDE ne s’applique donc généralement pas aux activités commerciales purement intraprovinciales dans ces provinces, bien qu’elle s’applique toujours aux flux interprovinciaux et internationaux.

L’effort de réforme fédéral a été long et inégal. Le projet de loi C-11 est mort au Feuilleton en 2021. Son successeur, le projet de loi C-27, aurait remplacé les règles de la LPRPDE visant le secteur privé par une Loi sur la protection de la vie privée des consommateurs, créé un tribunal de la protection des renseignements personnels et édicté une Loi sur l’intelligence artificielle et les données; il est mort au Feuilleton lors de la prorogation du Parlement en janvier 2025. Le 15 juin 2026, le gouvernement a déposé le projet de loi C-36, qui édicterait la Loi visant à protéger la vie privée et les données des consommateurs afin de remplacer la partie 1 de la LPRPDE. Selon des analyses juridiques publiées (par exemple, celle de Borden Ladner Gervais en juin 2026), il reprend une grande partie de la substance de la proposition antérieure sur la protection de la vie privée des consommateurs, abandonne le tribunal distinct au profit d’une structure de commission, ne comporte aucune loi autonome sur l’IA et propose des sanctions administratives pouvant atteindre 10 millions de dollars ou 3 % des recettes mondiales, selon le montant le plus élevé. Au moment de la rédaction, le projet de loi n’avait pas été adopté; la LPRPDE demeure donc la loi fédérale en vigueur. Les gestionnaires devraient considérer le projet de loi comme un signal de l’orientation à venir — une application plus rigoureuse, des règles plus explicites sur la dépersonnalisation et la transparence des systèmes décisionnels automatisés — plutôt que comme une obligation actuelle, et devraient demander à leurs conseillers juridiques d’en suivre la progression.

Les autres provinces en bref

À l’extérieur du Québec, le portrait provincial est inégal, et les gestionnaires d’organisations pancanadiennes devraient éviter de supposer que les règles d’une province s’appliquent partout. La Personal Information Protection Act (PIPA) de la Colombie-Britannique et la Personal Information Protection Act de l’Alberta (lois sur la protection des renseignements personnels) régissent les organisations du secteur privé de ces provinces; depuis 2010, la PIPA de l’Alberta exige que soient déclarés à son commissaire à l’information et à la protection de la vie privée les incidents présentant un risque réel de préjudice grave. L’Alberta a aussi remplacé en juin 2025 sa Freedom of Information and Protection of Privacy Act (loi sur l’accès à l’information et la protection de la vie privée) visant le secteur public par deux lois, l’Access to Information Act (loi sur l’accès à l’information) et la Protection of Privacy Act (loi sur la protection de la vie privée). L’Ontario n’a pas de loi générale sur la protection des renseignements personnels dans le secteur privé, si bien que la LPRPDE s’applique à la plupart des activités commerciales qui s’y déroulent, mais sa Loi de 2004 sur la protection des renseignements personnels sur la santé (LPRPS) régit les dépositaires de renseignements sur la santé, et les modifications introduites par le projet de loi 194 ont fait entrer en vigueur le 1er juillet 2025 de nouvelles obligations pour les institutions publiques provinciales en vertu de la Loi sur l’accès à l’information et la protection de la vie privée (LAIPVP) — notamment des évaluations des facteurs relatifs à la vie privée et la déclaration obligatoire des atteintes au commissaire à l’information et à la protection de la vie privée. Plusieurs provinces, dont le Québec, ont aussi des lois sur les renseignements de santé qui s’appliquent indépendamment du régime visant le secteur privé.

Pour les institutions financières fédérales, les obligations en matière de protection des renseignements personnels recoupent les attentes prudentielles. La ligne directrice B-10 du BSIF, Gestion du risque lié aux tiers, et la ligne directrice B-13, Gestion du risque lié aux technologies et du cyberrisque, ne créent pas de règles de protection des renseignements personnels en tant que telles, mais elles exigent une gouvernance des données détenues par des tiers et du risque technologique, ce qui, en pratique, couvre une grande partie du même terrain. Le bureau de la protection des renseignements personnels d’une banque et sa fonction de gestion du risque technologique devraient donc travailler à partir d’inventaires communs et d’évaluations communes des tiers.

L’Union européenne : le RGPD et sa portée mondiale

Le RGPD s’applique non seulement aux organisations établies dans l’UE, mais aussi aux organisations situées hors de l’UE qui offrent des biens ou des services à des personnes se trouvant dans l’UE ou qui y suivent leur comportement. De nombreuses organisations canadiennes — des universités qui recrutent des étudiantes et des étudiants étrangers, des éditeurs de logiciels ayant des clients européens, des fabricants ayant des distributeurs dans l’UE, des exploitants touristiques — entrent dans son champ d’application pour au moins une partie de leurs traitements. Le RGPD combine un ensemble de principes (licéité, loyauté et transparence; limitation des finalités; minimisation des données; exactitude; limitation de la conservation; intégrité et confidentialité; et responsabilité) avec des obligations fondées sur le risque, comme le registre des activités de traitement (article 30), l’analyse d’impact relative à la protection des données pour les traitements à risque élevé (article 35), la protection des données dès la conception et par défaut (article 25) et la notification des violations à l’autorité de contrôle dans un délai de 72 heures, si possible (article 33). Les amendes administratives peuvent atteindre 20 millions d’euros ou 4 % du chiffre d’affaires annuel mondial pour les violations les plus graves.

Le Canada bénéficie d’une décision d’adéquation de l’UE pour les organisations assujetties à la LPRPDE, que la Commission européenne a reconfirmée lors de son examen, en janvier 2024, des décisions d’adéquation existantes; cela simplifie les transferts de l’UE vers les organisations commerciales canadiennes, sans toutefois libérer ces organisations des obligations du RGPD lorsque celui-ci s’applique directement à elles. L’UE continue d’ajuster son cadre : en novembre 2025, la Commission européenne a proposé un ensemble « omnibus numérique » qui modifierait certaines dispositions du RGPD et, au moment de la rédaction, ces propositions faisaient toujours l’objet de négociations. Les gestionnaires devraient considérer les principes fondamentaux du RGPD comme stables et ses modalités comme susceptibles de changer.

Les normes et les cadres comme échafaudage de la gouvernance

Les lois énoncent des obligations; les normes et les cadres aident les organisations à s’organiser pour y satisfaire. Plusieurs références sont particulièrement utiles, et la figure ci-dessous les situe par rapport aux principales lois.

- ISO/IEC 29100:2024 fournit un cadre de protection de la vie privée : une terminologie, des acteurs et onze principes de protection de la vie privée (consentement et choix; légitimité et spécification des finalités; limitation de la collecte; minimisation des données; limitation de l’utilisation, de la conservation et de la communication; exactitude et qualité; ouverture, transparence et avis; participation et accès individuels; responsabilité; sécurité de l’information; et conformité en matière de protection de la vie privée).
- ISO/IEC 29134:2023 donne des lignes directrices pour l’évaluation des facteurs relatifs à la vie privée, notamment sur le moment où il convient d’en réaliser une, la façon de la planifier et le contenu que le rapport devrait comporter; elle s’harmonise bien avec l’exigence d’évaluation du Québec et avec l’AIPD du RGPD.
- ISO/IEC 27701:2025 précise les exigences relatives à un système de gestion de la protection de la vie privée (PIMS). Son édition de 2025 est une norme de système de gestion autonome, et non plus une extension qui présuppose une certification ISO/IEC 27001, bien qu’elle demeure conçue pour s’intégrer à un SGSI.
- ISO/IEC 27018:2025 fournit un code de bonnes pratiques pour les fournisseurs de nuage public agissant comme sous-traitants de DCP, en complétant les mesures de l’ISO/IEC 27002 par des recommandations sur la protection de la vie privée propres à l’infonuagique.
- Le NIST Privacy Framework organise la gestion du risque lié à la vie privée en fonctions — Identify-P (identifier), Govern-P (gouverner), Control-P (contrôler), Communicate-P (communiquer) et Protect-P (protéger) — qui sont parallèles à celles du Cadre de cybersécurité du NIST. La version 1.0 date de 2020; le NIST a publié en avril 2025 une première ébauche publique de la version 1.1 (NIST CSWP 40) afin de l’harmoniser avec le CSF 2.0 et d’y ajouter une analyse du risque lié à la vie privée associé à l’IA et, au moment de la rédaction, le NIST avait indiqué que la version définitive était imminente.
Figure 69 : le paysage réglementaire à plusieurs niveaux de la protection des renseignements personnels pour les organisations québécoises

Les gestionnaires n’ont pas à maîtriser chaque instrument; ce qui compte, c’est que ces instruments convergent vers une réalité opérationnelle commune : des cycles de vie des données gouvernés, des évaluations des risques documentées et des contrôles démontrables. Une organisation qui bâtit son programme autour de cette réalité, plutôt qu’autour d’une loi en particulier, constatera que la plupart des nouvelles obligations exigent un ajustement plutôt qu’une réinvention.

## Le cycle de vie des données, colonne vertébrale de la gouvernance de la vie privée

Pour rendre la protection de la vie privée concrète, il est utile de considérer que les renseignements personnels traversent un cycle de vie. La norme ISO/IEC 29100 préconise explicitement une approche fondée sur le cycle de vie, en incitant les organisations à établir des contrôles de protection de la vie privée tout au long de la vie de l’information, et chaque régime important rattache des obligations à des phases précises : le consentement et l’avis à la collecte, la limitation des finalités à l’utilisation, les mesures de sécurité pendant le stockage, les conditions de communication et de transfert, et la limitation de la conservation à la fin. Le cycle de vie correspond aussi naturellement à la façon dont les systèmes sont construits et exploités, ce qui en fait le langage commun le plus pratique entre les équipes juridiques, de protection de la vie privée, de sécurité et d’ingénierie.

Cinq phases, cinq ensembles de décisions

Un modèle simple distingue cinq phases, chacune comportant des obligations et des besoins de contrôle distincts.

1. Collecte et création. L’information entre dans l’organisation par des formulaires, des applications, des capteurs ou des partenaires, ou est créée à l’interne par le personnel et les systèmes. Les décisions portent ici sur la finalité, la nécessité, l’avis, le consentement et les sources auprès desquelles l’information est obtenue.

2. Utilisation et partage interne. L’information est traitée aux fins déterminées et partagée entre les équipes et les systèmes. Les décisions portent sur les droits d’accès, les utilisations secondaires, l’analytique, le profilage et la prise de décisions automatisée.

3. Stockage et réplication. L’information est stockée dans des bases de données, des partages de fichiers, des plateformes de collaboration, des journaux, des caches, des lacs de données et des sauvegardes, souvent en plusieurs copies. Les décisions portent sur la classification, le chiffrement, l’emplacement ainsi que le nombre et l’emplacement des copies.

4. Communication et transfert. L’information est communiquée à des fournisseurs de services, à des partenaires, à des organismes de réglementation ou à des sociétés affiliées, parfois au-delà des frontières. Les décisions portent sur les contrats, les évaluations des transferts, les sous-traitants ultérieurs et la surveillance.

5. Conservation, archivage et élimination. L’information est conservée pendant des périodes définies, archivée, puis finalement détruite ou anonymisée. Les décisions portent sur les calendriers de conservation, les mécanismes de suppression, les mesures de préservation de la preuve (legal hold) et la preuve de l’élimination.

La figure ci-dessous résume le cycle de vie et les principaux contrôles de protection de la vie privée qui s’appliquent à chaque phase. Le cycle n’est pas qu’un outil pédagogique : les décisions de conservation façonnent la collecte, et les incidents survenant à la phase de stockage révèlent souvent des défaillances à la phase de collecte.

Figure 70 : le cycle de vie des renseignements personnels et ses contrôles de protection de la vie privée

Pour les personnes qui gouvernent et qui gèrent, l’approche fondée sur le cycle de vie soutient plusieurs tâches. Elle fournit une liste de vérification indiquant où le risque peut apparaître, par exemple un régime de sauvegarde qui compromet silencieusement la suppression ou un extrait analytique qui échappe aux contrôles de son système source. Elle précise qui est imputable à chaque étape : les responsables de projet à la collecte, les responsables des données et des systèmes pendant l’utilisation et le stockage, l’approvisionnement et le bureau de la protection des renseignements personnels à la communication, et la gestion des documents à l’élimination. Elle permet aussi des décisions d’investissement plus précises, par exemple déterminer s’il faut prioriser la prévention des pertes de données à l’étape de la communication ou la suppression automatisée en fin de vie, car chaque investissement peut être rattaché à une phase précise et à un scénario de risque précis.

Protection de la vie privée dès la conception et par défaut

La Loi 25 du Québec et le RGPD exigent tous deux que la protection de la vie privée soit prise en compte dès le début des projets et se reflète dans les paramètres par défaut. L’article 25 du RGPD exige la protection des données dès la conception et par défaut; la loi québécoise exige que les produits et services technologiques offerts au public soient paramétrés de façon à assurer, par défaut, le plus haut niveau de confidentialité, sans aucune intervention de la personne concernée (les témoins de navigation constituant une exception reconnue), et exige que les fonctions permettant d’identifier, de localiser ou de profiler une personne soient divulguées et, en pratique, activées seulement au choix de la personne.

La protection de la vie privée dès la conception est souvent présentée comme une philosophie, mais il vaut mieux, pour les gestionnaires, la comprendre comme une série de points de contrôle dans le cycle de vie des projets et des changements. La charte de projet devrait indiquer si des renseignements personnels sont en jeu; la revue d’architecture devrait examiner les flux de données, la minimisation et la résidence; une évaluation des facteurs relatifs à la vie privée devrait être terminée avant que des engagements importants soient pris; et la liste de vérification de mise en production devrait confirmer que les paramètres par défaut, les paramètres de conservation, la journalisation et les avis sont en place. La protection de la vie privée par défaut est une décision de configuration : le paramètre de partage par défaut, la durée de conservation par défaut, la visibilité par défaut d’un profil et l’état par défaut des fonctions de suivi. Les bases de référence de configuration (chapitre 14) sont le moyen naturel d’appliquer ces paramètres par défaut de façon uniforme dans l’ensemble des systèmes.

Inventaires, cartographies et registres des activités de traitement

Rien de tout cela ne fonctionne si l’on ne sait pas où se trouvent les renseignements personnels. Le registre des activités de traitement prévu à l’article 30 du RGPD, les inventaires implicites dans l’exigence québécoise relative aux politiques de gouvernance et la recommandation de la CAI selon laquelle les organisations devraient cartographier leurs renseignements dans le cadre des évaluations des facteurs relatifs à la vie privée pointent tous vers le même fondement : un inventaire tenu à jour des renseignements personnels, des systèmes qui les détiennent, des fins qu’ils servent, des parties avec lesquelles ils sont partagés, de leur emplacement et de leur durée de conservation.

De nombreuses organisations bâtissent un tel inventaire une seule fois, sous la forme d’un grand tableur, puis le laissent se dégrader. Une approche plus durable relie l’inventaire de la protection des renseignements personnels aux artefacts de gouvernance existants : la base de données de gestion des configurations et l’inventaire des actifs (chapitre 7), l’inventaire des ressources infonuagiques (chapitre 15), le registre des fournisseurs (chapitre 19) et le portefeuille d’applications. Le critère de gouvernance est simple : pour tout système qui détient des renseignements personnels, l’organisation peut-elle en nommer le responsable, les finalités, les emplacements et la règle de conservation en moins d’une journée? Sinon, l’inventaire n’est pas encore un instrument de gouvernance.

## Minimisation des données et limitation des finalités en pratique

La plupart des régimes modernes de protection des renseignements personnels convergent vers deux principes fondamentaux. Les organisations devraient recueillir et traiter uniquement ce qui est nécessaire, et elles ne devraient utiliser les renseignements qu’à des fins explicites et légitimes auxquelles les personnes peuvent raisonnablement s’attendre. La norme ISO/IEC 29100 les exprime sous la forme de la légitimité et de la spécification des finalités, de la limitation de la collecte et de la minimisation des données. La loi québécoise exige qu’une entreprise ne recueille que les renseignements nécessaires aux fins déterminées avant la collecte et qu’elle informe les personnes de ces fins; le RGPD exige que les données à caractère personnel soient adéquates, pertinentes et limitées à ce qui est nécessaire; le principe de limitation de la collecte de la LPRPDE dit à peu près la même chose. Ces principes semblent modestes, mais ils figurent parmi les leviers de réduction des risques les plus puissants dont disposent les gestionnaires, car un renseignement qui n’a jamais été recueilli ne peut être ni compromis, ni utilisé à mauvais escient, ni visé par une assignation.

Du principe à la contrainte de conception

Du point de vue de l’ingénierie de la protection de la vie privée, la minimisation et la limitation des finalités se traduisent par des choix concrets de conception et de configuration. Les choix suivants sont parmi les plus courants, et chacun peut être inscrit dans les normes d’architecture et les critères d’approvisionnement.

- Interfaces de collecte épurées. Les formulaires, les interfaces de programmation d’applications et les schémas d’événements devraient être conçus de façon à ce que les champs inutiles ne soient jamais recueillis, et les champs facultatifs devraient être clairement indiqués comme tels plutôt que d’être exigés en silence.
- Jeux de données liés à une finalité. L’analytique et la production de rapports devraient utiliser des vues agrégées, pseudonymisées ou échantillonnées plutôt que des copies « au cas où » de bases de données de production entières, et les extraits devraient comporter des métadonnées sur leur finalité et leur date d’expiration.
- Séparation des attributs sensibles. Les modèles de données devraient stocker les attributs particulièrement sensibles, comme les renseignements de santé, les identifiants gouvernementaux ou les renseignements financiers, séparément des données de profil générales, avec des contrôles d’accès et une journalisation plus stricts.
- Journalisation minimale du contenu. Les journaux d’application et de sécurité devraient consigner ce qui est nécessaire au dépannage et aux enquêtes sans enregistrer les contenus complets, les mots de passe ou des détails personnels inutiles — une source d’exposition fréquente et évitable.
- Discipline du texte libre. Les champs de texte libre des outils de service à la clientèle et de gestion des dossiers attirent des renseignements sensibles que personne n’avait l’intention de recueillir; des consignes, des avertissements au niveau des champs et des revues périodiques atténuent le problème.
Pour la gouvernance, le message clé est que la minimisation n’est pas un slogan, mais une contrainte de conception qui devrait figurer dans les revues d’architecture des solutions, les critères d’approvisionnement, les décisions de modélisation des données et les critères d’acceptation des équipes de développement. Chaque nouvelle collecte devrait pouvoir être rattachée à une finalité documentée dans l’inventaire de la protection des renseignements personnels, afin que la question « pourquoi recueillons-nous ceci? » ait toujours un responsable et une réponse.

Consentement, finalités et utilisation secondaire

La limitation des finalités devient la plus difficile lorsqu’une organisation veut réutiliser des renseignements existants à une nouvelle fin : entraîner un modèle d’apprentissage automatique sur les interactions avec la clientèle, combiner les données d’un programme de fidélisation avec l’analytique Web ou partager des renseignements avec un partenaire pour du marketing conjoint. La loi québécoise ne permet l’utilisation à une nouvelle fin sans consentement que dans des circonstances limitées, par exemple lorsque la nouvelle fin est compatible avec la fin initiale, lorsque l’utilisation est manifestement au bénéfice de la personne ou lorsqu’elle est nécessaire à des fins d’étude, de recherche ou de production de statistiques et que les renseignements sont dépersonnalisés; autrement, le consentement est requis, et il doit être exprès pour les renseignements sensibles. Le RGPD exige une base juridique pour chaque finalité et une évaluation de la compatibilité pour tout traitement ultérieur. La LPRPDE exige un consentement valable, adapté à la sensibilité des renseignements et aux attentes raisonnables de la personne, comme le précisent les lignes directrices du CPVP sur l’obtention d’un consentement valable.

La conséquence pour la gestion est que les nouvelles utilisations de données existantes devraient franchir le même point de contrôle de gouvernance que les nouvelles collectes. Les initiatives de science des données et d’IA sont la source la plus fréquente d’utilisations secondaires non examinées, et le chapitre 18 traite de la gouvernance propre aux systèmes d’IA. Ici, le point essentiel est que l’accès à des données à des fins d’expérimentation ne doit pas être confondu avec l’autorisation de les utiliser à une nouvelle fin. Un bac à sable contenant de vraies données de clients est une activité de traitement comme une autre.

Pseudonymisation, dépersonnalisation et anonymisation

Trois techniques apparentées sont souvent confondues, et cette confusion a des conséquences juridiques. La pseudonymisation remplace les identifiants directs par des jetons ou des codes tout en préservant la possibilité de relier de nouveau les enregistrements au moyen d’informations supplémentaires conservées séparément. C’est une mesure de protection précieuse, mais en vertu du RGPD, les données pseudonymisées demeurent des données à caractère personnel, et la loi québécoise considère un renseignement dépersonnalisé — un renseignement qui ne permet plus d’identifier directement la personne — comme un renseignement personnel toujours assujetti à la loi. L’anonymisation, en revanche, signifie que le renseignement ne permet plus, de façon irréversible, d’identifier directement ou indirectement la personne; au Québec, elle doit être effectuée selon les meilleures pratiques généralement reconnues et selon les critères fixés par le règlement de 2024 sur l’anonymisation, et c’est seulement alors que le renseignement sort du champ d’application de la plupart des obligations.

Le règlement sur l’anonymisation illustre bien la façon dont le droit de la protection des renseignements personnels prescrit désormais un processus, et non plus seulement un résultat. Avant d’anonymiser, l’entreprise doit établir des fins sérieuses et légitimes pour l’utilisation des renseignements anonymisés; le processus doit être supervisé par une personne compétente; l’entreprise doit évaluer le risque de réidentification au regard des critères d’individualisation, de corrélation et d’inférence; elle doit choisir des techniques et des mesures de protection, vérifier que le risque résiduel est très faible, réévaluer périodiquement la situation et tenir un registre. « Nous l’avons anonymisé » est donc une affirmation qui doit s’appuyer sur une analyse documentée. Des normes comme ISO/IEC 27559:2022, qui porte sur les cadres de dépersonnalisation des données renforçant la protection de la vie privée, peuvent aider à structurer cette analyse.

## Conservation, archivage et suppression : en finir avec la culture du « tout garder pour toujours »

De nombreuses organisations éprouvent des difficultés avec la conservation. Les exigences juridiques et d’affaires imposent parfois une longue conservation — dossiers fiscaux, états financiers, dossiers d’emploi, dossiers cliniques, éléments de preuve requis pour un litige —, tandis que d’autres exigences, comme la limitation de la conservation en vertu de la LPRPDE, de la loi québécoise et du RGPD, exigent que les renseignements soient détruits ou anonymisés une fois leurs fins accomplies. Dans la plupart des organisations, la situation par défaut ne correspond ni à l’un ni à l’autre : les renseignements s’accumulent simplement parce que le stockage coûte peu, parce que la suppression est techniquement malcommode et parce que personne n’est imputable de leur élimination. Cette situation par défaut coûte cher : les renseignements accumulés accroissent l’impact de chaque violation, ralentissent le traitement des demandes d’accès, élargissent la communication de la preuve en cas de litige et minent la crédibilité des déclarations relatives à la protection de la vie privée.

La loi québécoise (article 23) exige que, lorsque les fins auxquelles un renseignement personnel a été recueilli ou utilisé sont accomplies, l’entreprise le détruise ou l’anonymise « pour l’utiliser à des fins sérieuses et légitimes, sous réserve d’un délai de conservation prévu par une loi »; et les politiques de gouvernance doivent encadrer la conservation et la destruction. Pour de nombreuses organisations, la réduction du risque lié à la vie privée la plus importante qui soit accessible à court terme n’est pas un nouvel outil de sécurité, mais la suppression rigoureuse des renseignements dont elles n’ont plus besoin.

Les calendriers de conservation comme instruments de gouvernance

Une gouvernance pratique de la conservation exige quatre éléments.

1. Calendriers de conservation. Une correspondance documentée entre les catégories de documents — y compris ceux qui sont détenus dans les systèmes numériques, et pas seulement les dossiers papier — et des durées de conservation fondées sur les exigences juridiques, réglementaires, contractuelles et d’affaires. Les calendriers devraient relever de la gestion des documents ou du service juridique, être approuvés au niveau approprié et être revus périodiquement.

2. Mise en œuvre au niveau des systèmes. Les applications, les bases de données, les plateformes de collaboration et les systèmes de journalisation devraient être configurés pour appliquer la conservation lorsque c’est techniquement possible, au moyen de tâches de suppression fondées sur le temps, de politiques de cycle de vie sur les compartiments de stockage, de la rotation automatique des journaux et de mécanismes d’archivage qui sortent l’information de la production tout en préservant les contrôles d’accès.

3. Conception de l’élimination et de la dépersonnalisation. Des critères clairs devraient indiquer quand l’information doit être détruite définitivement et quand une anonymisation robuste est acceptable, en reconnaissant que les renseignements pseudonymisés ou simplement dépersonnalisés demeurent des renseignements personnels.

4. Éléments probants et auditabilité. L’organisation devrait être en mesure de démontrer, pour les catégories critiques de renseignements personnels, que les règles de conservation sont appliquées en pratique, y compris au moyen de rapports sur les tâches de suppression, sur les exceptions et sur leur approbation.

La norme ISO/IEC 29134 souligne que les évaluations des facteurs relatifs à la vie privée devraient considérer la conservation et la faisabilité de la suppression ou de l’anonymisation comme des mesures d’atténuation. En pratique, cela signifie qu’un projet ne devrait pas être approuvé avec une durée de conservation non définie; la mention « à déterminer » est fréquente dans la documentation de projet et constitue un indicateur fiable d’une conservation indéfinie.

Sauvegardes, répliques et problème de la suppression

La suppression est plus difficile qu’il n’y paraît, car les systèmes modernes copient l’information à grande échelle. Un dossier client peut exister dans la base de données de production, dans une réplique en lecture, dans un entrepôt de données, dans un extrait analytique, dans un index de recherche, dans un cache, dans un outil de service à la clientèle, dans un fil de courriels, dans un fichier exporté sur un ordinateur portable et dans plusieurs générations de sauvegardes. Supprimer l’enregistrement principal ne supprime pas les copies, et les sauvegardes sont habituellement conçues précisément pour résister à la suppression.

L’approche pragmatique consiste à définir, pour chaque catégorie de systèmes, ce que signifie la suppression et à quelle vitesse elle se propage. Pour les sauvegardes, de nombreuses organisations adoptent la position selon laquelle les renseignements supprimés disparaîtront des sauvegardes au terme d’une période définie, les sauvegardes restaurées seront purgées de nouveau avant d’être utilisées, et les sauvegardes sont protégées entre-temps par des contrôles d’accès rigoureux; cette position devrait être documentée et reflétée dans les avis. Pour les jeux de données dérivés, les métadonnées de traçabilité et les dates d’expiration sont utiles. Pour les dépôts non structurés, des campagnes de revue périodiques appuyées par des outils de découverte constituent souvent la seule option réaliste. L’objectif n’est pas la perfection, mais une approche défendable, documentée et appliquée de façon uniforme.

Préservation de la preuve, exceptions et responsabilité partagée

Les calendriers de conservation doivent prévoir des exceptions. Les litiges, les enquêtes réglementaires et les audits peuvent exiger que la suppression soit suspendue pour des renseignements précis, et l’organisation doit pouvoir appliquer et lever ces mesures de préservation de la preuve sans suspendre la suppression partout. Les mesures de préservation de la preuve devraient être documentées, délimitées, approuvées par le service juridique et revues — la même discipline que ce manuel recommande pour les exceptions aux risques assorties de dates d’échéance.

Sur le plan de la gouvernance, la conservation est une responsabilité partagée entre le service juridique, la gestion des documents, les TI, les responsables des données et des systèmes, la personne responsable de la protection des renseignements personnels et le CSI. Elle exige souvent des investissements dans la découverte et la classification des données et dans l’automatisation du cycle de vie, qui entrent en concurrence avec d’autres priorités. Présenter ces investissements sous l’angle des scénarios de risque est utile : un scénario dans lequel un attaquant exfiltre une décennie de dossiers de clients inactifs a un impact sensiblement plus élevé qu’un scénario portant sur deux ans de dossiers actifs, et cette différence constitue un argument quantifiable en faveur de la suppression, que les méthodes d’investissement du chapitre 17 peuvent étayer.

## Résidence des données et transferts transfrontaliers

Les renseignements personnels restent rarement dans un seul territoire. Les services infonuagiques répliquent les données dans plusieurs régions, les équipes de soutien travaillent depuis plusieurs pays, les fournisseurs de logiciels font appel à des sous-traitants ultérieurs partout dans le monde, et même une organisation modeste peut utiliser des dizaines d’applications SaaS hébergées hors de sa province. Or, le Québec et l’UE accordent tous deux une importance particulière aux communications à l’extérieur de leur territoire, et le droit fédéral s’attend à ce que les organisations demeurent imputables où que les renseignements circulent. La résidence est donc l’un des domaines où la gouvernance de la vie privée et l’architecture infonuagique (chapitre 15) sont le plus étroitement liées.

Québec : une évaluation avant que les renseignements quittent la province

En vertu de la loi québécoise, avant de communiquer des renseignements personnels à l’extérieur du Québec, une entreprise doit procéder à une évaluation des facteurs relatifs à la vie privée. L’évaluation doit tenir compte notamment de la sensibilité des renseignements, des fins auxquelles ils seront utilisés, des mesures de protection — y compris contractuelles — dont ils bénéficieraient et du régime juridique applicable dans l’État où ils seraient communiqués, notamment des principes de protection des renseignements personnels qui y sont applicables. En vertu de l’article 17, les renseignements ne peuvent être communiqués que si l’évaluation démontre qu’ils « bénéficieraient d’une protection adéquate, notamment au regard des principes de protection des renseignements personnels généralement reconnus », et la communication doit faire l’objet d’une entente écrite qui tient compte des résultats de l’évaluation et, le cas échéant, des modalités convenues pour atténuer les risques déterminés. La même logique s’applique lorsque l’entreprise confie à un fournisseur de services situé à l’extérieur du Québec la tâche de recueillir, d’utiliser, de communiquer ou de conserver des renseignements pour son compte.

Deux caractéristiques de cette règle importent pour les gestionnaires. Premièrement, « à l’extérieur du Québec » inclut le reste du Canada : un transfert vers un centre de données en Ontario déclenche l’évaluation aussi sûrement qu’un transfert vers la Virginie ou Dublin, même si l’analyse du régime juridique de destination sera différente. Deuxièmement, le guide de la CAI rattache l’obligation aux communications effectuées après le 22 septembre 2023 et recommande une évaluation comme bonne pratique même pour les projets finalisés avant cette date; les transferts qui se poursuivent en vertu d’ententes antérieures sont donc largement considérés comme visés. Par conséquent, de nombreuses organisations québécoises ont un arriéré de relations SaaS existantes qui auraient dû être évaluées. Le principe de proportionnalité s’applique — la portée de l’évaluation devrait être proportionnée à la sensibilité, à la finalité, à la quantité, à la répartition et au support des renseignements —, de sorte qu’un transfert à faible risque de coordonnées d’affaires peut être évalué brièvement, alors qu’un transfert de renseignements de santé ou de renseignements financiers justifie une analyse approfondie.

L’UE : adéquation, garanties et Data Privacy Framework

Le RGPD permet les transferts de données à caractère personnel vers les pays qui bénéficient d’une décision d’adéquation, comme le Canada pour les organisations visées par la LPRPDE. Ailleurs, les transferts exigent des garanties appropriées, comme les clauses contractuelles types de la Commission européenne ou les règles d’entreprise contraignantes, complétées, depuis l’arrêt Schrems II rendu par la Cour de justice de l’Union européenne en 2020, par une évaluation au cas par cas visant à déterminer si les lois du pays de destination, notamment en matière d’accès par les autorités publiques, compromettent ces garanties.

Pour les transferts vers les États-Unis, le cadre de protection des données UE–États-Unis (EU–U.S. Data Privacy Framework) fournit une base d’adéquation depuis la décision de la Commission européenne du 10 juillet 2023, pour les organisations américaines qui y adhèrent par autocertification. Le 3 septembre 2025, le Tribunal de l’Union européenne a rejeté un recours contre cette décision dans l’affaire Latombe c. Commission (affaire T-553/23); le requérant a interjeté appel devant la Cour de justice en octobre 2025, et cet appel était toujours pendant au moment de la rédaction. Le cadre est donc en vigueur, mais il n’est pas à l’abri d’une contestation judiciaire, et ses deux prédécesseurs — la sphère de sécurité (Safe Harbour) et le bouclier de protection des données (Privacy Shield) — ont tous deux été invalidés. Les organisations prudentes qui s’appuient sur ce cadre conservent une solution de repli, habituellement des clauses contractuelles types et une évaluation des transferts, afin qu’un jugement futur ne laisse pas des transferts critiques sans fondement juridique.

Imputabilité fédérale et choix d’architecture

La LPRPDE n’interdit pas les transferts transfrontaliers. Elle exige que les organisations demeurent responsables des renseignements transférés à des tiers aux fins de traitement, qu’elles recourent à des moyens contractuels ou autres pour assurer un niveau de protection comparable, et qu’elles informent de façon transparente les personnes que leurs renseignements peuvent être traités dans un autre territoire et y être accessibles aux tribunaux et aux autorités.

Du point de vue de l’ingénierie de la protection de la vie privée, la gouvernance de la résidence et des transferts transfrontaliers se traduit par un ensemble de décisions d’architecture et de décisions contractuelles.

- Choix des régions. Les données principales et les données de sauvegarde devraient être hébergées de façon délibérée, dans des régions infonuagiques canadiennes ou dans d’autres régions appropriées lorsque les exigences ou l’appétence pour le risque le justifient, et la décision devrait être consignée.
- Métadonnées, télémétrie et accès pour le soutien. De nombreux services répliquent les journaux, la télémétrie ou les billets de soutien à l’échelle mondiale, ou permettent à du personnel de soutien à l’étranger d’accéder aux environnements des clients, à moins d’une configuration ou d’une clause contractuelle contraire; ces flux sont aussi des transferts.
- Gouvernance des sous-traitants ultérieurs. Les contrats devraient exiger un avis de tout changement de sous-traitant ultérieur et donner à l’organisation une possibilité réelle de s’y opposer, et le bureau de la protection des renseignements personnels devrait disposer d’un processus d’examen de ces avis.
- Séparation par population. Les systèmes devraient être conçus de façon que les jeux de données assujettis à des régimes différents — résidents du Québec, résidents de l’UE, renseignements de santé — puissent être repérés, restreints et faire l’objet de rapports séparément lorsque leurs conditions diffèrent.
- Le chiffrement comme moyen de réduire le risque, et non comme substitut juridique. Le chiffrement au moyen de clés contrôlées par l’organisation réduit l’exposition pratique, mais il n’établit pas à lui seul une protection adéquate lorsque le fournisseur peut accéder aux clés ou lorsque les renseignements sont traités en clair.
La norme ISO/IEC 27018 insiste sur la transparence quant aux lieux où les DCP sont stockées et traitées, et encourage les fournisseurs de services infonuagiques à prendre en charge les exigences des clients en matière de restrictions géographiques et de contrôle des transferts. Pour les gestionnaires, le défi de gouvernance consiste à faire en sorte que les décisions transfrontalières soient prises consciemment, lors de la conception et de l’approvisionnement, plutôt que découvertes après le déploiement, une fois le contrat signé et la migration terminée.

## Le chiffrement et la gestion des clés comme contrôles de protection de la vie privée

Le chiffrement est l’une des mesures de protection techniques les plus visibles en protection des données, et les organismes de réglementation y font fréquemment référence. Des renseignements correctement chiffrés dont les clés n’ont pas été compromises réduisent généralement le risque de préjudice dans les évaluations des violations, et le chiffrement est une attente récurrente des dispositions relatives aux mesures de sécurité. Pourtant, le chiffrement est aussi largement mal compris : il protège l’information dans certains états et contre certaines menaces, et sa valeur dépend presque entièrement de la façon dont les clés sont gérées. Le chapitre 20 traite de la cryptographie et de la gestion des clés à l’intention des gestionnaires; la présente section ne met en lumière que les points propres à la protection de la vie privée.

Ce que le chiffrement permet et ne permet pas d’accomplir pour la protection de la vie privée

Trois questions déterminent la valeur du chiffrement pour la protection de la vie privée. La première est de savoir où il est appliqué : au repos (bases de données, systèmes de fichiers, compartiments de stockage, sauvegardes, ordinateurs portables), en transit (TLS pour le trafic Web et applicatif, interconnexions sécurisées) et, pour certaines charges de travail spécialisées, en cours d’utilisation grâce à l’informatique confidentielle. La deuxième est de savoir qui contrôle les clés : le chiffrement par défaut d’un fournisseur de services infonuagiques protège contre le vol de supports physiques, mais non contre l’accès par le fournisseur ou par un attaquant qui compromet un compte d’administration, alors que des clés gérées par le client ou détenues à l’externe modifient le modèle de menace et les responsabilités propres de l’organisation. La troisième est de savoir quelles menaces subsistent : le chiffrement au repos ne fait rien contre un utilisateur autorisé qui exporte des dossiers ni contre une application compromise pendant que les données sont déchiffrées.

Le chiffrement est donc une couche nécessaire, mais jamais un substitut à la minimisation, au contrôle d’accès, à la surveillance ou à une finalité légitime. Un jeu de données qui ne devrait pas exister ne devient pas acceptable parce qu’on le chiffre.

Attentes en matière de gouvernance pour les gestionnaires

Du point de vue de la protection de la vie privée, un petit nombre d’attentes couvre la plupart des besoins; le chapitre 20 approfondit les pratiques de gestion des clés qui les sous-tendent. Les exigences de chiffrement devraient être liées à la classification des données, de sorte que les jeux de données les plus sensibles bénéficient d’une protection plus forte et plus granulaire, y compris le chiffrement au niveau des champs ou la tokenisation lorsque c’est approprié. La séparation des tâches devrait empêcher les administrateurs des systèmes de stockage d’accéder unilatéralement au matériel de clés. Pour les charges de travail transfrontalières et infonuagiques, la décision d’exiger des clés gérées par le client ou détenues à l’externe devrait être consignée dans l’évaluation des facteurs relatifs à la vie privée, car elle modifie le risque résiduel du transfert. Enfin, les décisions de conservation et de chiffrement interagissent : des renseignements recueillis aujourd’hui et conservés pendant des décennies pourraient survivre aux algorithmes qui les protègent, ce qui est l’une des raisons pour lesquelles la transition vers la cryptographie post-quantique, traitée au chapitre 20, est aussi un enjeu de protection de la vie privée.

## Prévention des pertes de données, surveillance et journalisation des renseignements personnels

La protection des données porte autant sur l’endroit où l’information circule que sur l’endroit où elle est stockée. De nombreux incidents de confidentialité ne comportent aucune attaque sophistiquée : un tableur envoyé par courriel au mauvais destinataire, un lien de partage de fichiers réglé à « toute personne disposant du lien », une liste de clients téléversée dans un compte infonuagique personnel ou un membre du personnel qui consulte des dossiers par curiosité. Les contrôles qui rendent observables la circulation et l’utilisation des renseignements personnels sont donc au cœur de la gouvernance de la vie privée. En même temps, ces contrôles traitent eux-mêmes des renseignements personnels — sur le personnel, la clientèle et les correspondants — et doivent être conçus dans un souci de proportionnalité.

La prévention des pertes de données comme capacité en couches

Les outils de prévention des pertes de données (DLP) tentent de détecter et d’empêcher la transmission ou la copie non autorisée de renseignements sensibles dans le courriel, le trafic Web, les terminaux, les plateformes de collaboration et les services infonuagiques. Les programmes de DLP complets peuvent être coûteux et générer beaucoup de bruit, et de nombreuses organisations ont acheté des outils dont les règles n’ont jamais été ajustées au-delà des réglages par défaut. Une approche en couches offre habituellement un meilleur rendement de l’investissement.

- La classification d’abord. Des politiques et des étiquettes claires qui déterminent ce qui constitue un renseignement personnel restreint ou hautement confidentiel donnent aux règles de DLP quelque chose de significatif à appliquer; sans elles, les règles se limitent par défaut à la détection de motifs de numéros de carte ou de numéros d’assurance sociale et ratent la plupart des renseignements qui comptent.
- Contrôles natifs des plateformes de base. Les suites de courriel et de collaboration peuvent avertir avant un partage externe, bloquer le partage de contenu étiqueté à l’extérieur de l’organisation, faire expirer les liens externes et détecter les motifs sensibles courants; ces contrôles font souvent déjà partie des licences acquises.
- Visibilité sur l’utilisation du nuage. Les courtiers de sécurité d’accès au nuage et les capacités de gestion de la posture traitées au chapitre 15 aident à détecter les applications non autorisées et les espaces de stockage mal configurés qui exposent des renseignements personnels.
- Accompagner avant de bloquer. Les messages présentés aux utilisateurs qui expliquent pourquoi une action est risquée modifient les comportements et réduisent les faux positifs; il vaut mieux réserver les blocages stricts aux règles à confiance élevée et à impact élevé.
- Ajustement mesuré. Les alertes de DLP devraient alimenter un processus de triage assorti de niveaux de service, et le taux de faux positifs devrait être suivi comme une mesure, car un outil qui génère des milliers d’alertes ignorées relève de la conformité de façade plutôt que de la réduction des risques.
Journalisation des accès aux renseignements personnels

Les accès aux jeux de données sensibles et aux fonctions d’administration doivent être journalisés d’une manière que les utilisateurs surveillés ne peuvent pas facilement modifier, et les journaux doivent être conservés assez longtemps pour soutenir les enquêtes sur les incidents, les enquêtes réglementaires et, le cas échéant, les demandes de personnes qui veulent savoir qui a accédé à leurs renseignements. Dans le secteur de la santé, par exemple, l’audit des accès aux dossiers de santé électroniques est un contrôle de premier plan contre la « fouine » par du personnel autorisé.

Les journaux sont aussi des renseignements personnels. Ils devraient être minimisés (consigner qui a accédé à quel dossier et à quel moment, sans copier le contenu du dossier), protégés par des contrôles d’accès et des mécanismes d’intégrité, et assujettis à des règles de conservation comme tout autre jeu de données. Les pratiques d’opérations de sécurité décrites aux chapitres 7 et 8 devraient donc comprendre des exigences de protection de la vie privée pour la chaîne de journalisation elle-même.

Surveillance proportionnée du personnel

La surveillance du personnel soulève des enjeux distincts. Une surveillance indiscriminée — enregistrer les frappes au clavier, capturer les écrans en continu, lire les communications personnelles ou suivre la localisation en dehors des heures de travail — peut elle-même créer des risques sur les plans de la vie privée, du droit du travail et de la confiance et, au Québec, elle met en jeu la Charte des droits et libertés de la personne ainsi que la loi sur la protection des renseignements personnels dans le secteur privé. Les programmes de surveillance devraient donc être justifiés par des finalités documentées, limités à ce qui est nécessaire, communiqués au personnel et soumis à une évaluation des facteurs relatifs à la vie privée lorsqu’ils font appel à une nouvelle technologie. L’Ontario, pour sa part, exige que les employeurs de 25 employés ou plus se dotent d’une politique écrite sur la surveillance électronique. Le principe de gouvernance est cohérent avec le reste du chapitre : la surveillance est une activité de traitement qui doit elle-même satisfaire aux critères de nécessité, de proportionnalité et de transparence.

Registres des incidents et avis de violation

L’exigence québécoise de tenir un registre de tous les incidents de confidentialité — et pas seulement de ceux qui font l’objet d’un avis — est un exemple concret de la rencontre entre les obligations de protection des renseignements personnels et l’intervention en cas d’incident. Le registre doit notamment consigner une description des renseignements visés, les circonstances, la date ou la période de l’incident et le moment où l’entreprise en a pris connaissance, le nombre de personnes concernées, l’évaluation du risque qu’un préjudice sérieux soit causé et les mesures prises; il doit être conservé pendant cinq ans et transmis à la CAI sur demande. Les incidents présentant un risque qu’un préjudice sérieux soit causé doivent être déclarés avec diligence à la CAI et aux personnes concernées. L’évaluation de ce risque tient compte de la sensibilité des renseignements, des conséquences appréhendées de leur utilisation et de la probabilité qu’ils soient utilisés à des fins préjudiciables, et la personne responsable de la protection des renseignements personnels doit être consultée.

Des obligations comparables s’appliquent en vertu d’autres régimes, avec des seuils et des délais différents, comme le résume le tableau ci-dessous. La conséquence pratique est que le plan d’intervention en cas d’incident décrit au chapitre 12 doit comprendre un volet d’évaluation de la protection de la vie privée mené en parallèle avec le confinement technique, assorti de critères, de modèles et de droits décisionnels convenus à l’avance, ainsi que d’un compte à rebours.

Régime

Seuil de déclaration

Délai

Tenue de registres

Loi québécoise sur le secteur privé

Risque qu’un préjudice sérieux soit causé

Avec diligence, à la CAI et aux personnes

Registre de tous les incidents, 5 ans

LPRPDE

Risque réel de préjudice grave

Dès que possible, au CPVP et aux personnes

Toutes les atteintes, 24 mois

RGPD

Risque pour les droits et libertés

Dans les 72 heures à l’autorité, si possible

Toutes les violations documentées

Il en découle deux constats de gouvernance. Premièrement, une organisation présente dans plusieurs territoires ne devrait pas gérer un processus d’incident distinct pour chacun; elle devrait gérer un seul processus comportant des points de décision propres à chaque territoire, afin qu’une seule enquête produise les faits que chaque organisme de réglementation exige. Deuxièmement, le registre des incidents n’est pas qu’un artefact de conformité. Analysé dans le temps, il est l’une des sources d’indicateurs clés de risque les plus riches dont dispose le programme de protection des renseignements personnels : des courriels mal acheminés à répétition, des violations d’accès récurrentes dans un service en particulier ou des incidents attribuables à un même fournisseur révèlent où les contrôles font défaut.

## Évaluations des facteurs relatifs à la vie privée : structurer l’analyse du risque lié à la vie privée

Les lois sur la protection des renseignements personnels fondées sur le risque ne se contentent pas de demander aux organisations d’être prudentes; elles exigent une analyse structurée avant que certaines décisions soient prises. Les évaluations des facteurs relatifs à la vie privée (EFVP) — appelées privacy impact assessments (PIA) en anglais et analyses d’impact relatives à la protection des données (AIPD) en vertu du RGPD — sont le mécanisme par lequel cette analyse est réalisée, documentée et suivie d’effets. Bien menée, une EFVP est le pont le plus efficace entre le droit de la protection des renseignements personnels et la conception des systèmes, car elle oblige l’équipe de projet, le bureau de la protection des renseignements personnels, l’équipe de sécurité et le responsable métier à examiner ensemble les mêmes flux de données, assez tôt pour pouvoir les modifier.

Déclencheurs : quand une évaluation est-elle requise?

Les déclencheurs diffèrent selon le régime, et une méthodologie interne devrait intégrer tous ceux qui s’appliquent à l’organisation.

- Projets au Québec. Une entreprise doit procéder à une évaluation pour tout projet d’acquisition, de développement ou de refonte d’un système d’information ou de prestation électronique de services impliquant la collecte, l’utilisation, la communication, la conservation ou la destruction de renseignements personnels. La personne responsable de la protection des renseignements personnels doit être consultée dès le début du projet, et le projet doit permettre qu’un renseignement personnel informatisé recueilli auprès des personnes leur soit communiqué dans un format structuré et couramment utilisé.
- Communications à l’extérieur du Québec. Comme nous l’avons vu plus haut, une évaluation est requise avant que des renseignements personnels soient communiqués à l’extérieur du Québec ou confiés à un fournisseur de services qui s’y trouve.
- Communications à des fins de recherche au Québec. Une évaluation est aussi requise avant de communiquer des renseignements personnels sans consentement à des fins d’étude, de recherche ou de production de statistiques.
- Traitements à risque élevé selon le RGPD. Une AIPD est requise lorsque le traitement est susceptible d’engendrer un risque élevé pour les droits et libertés des personnes, notamment en cas de profilage systématique et approfondi produisant des effets importants, de traitement à grande échelle de catégories particulières de données et de surveillance systématique à grande échelle de zones accessibles au public, les autorités de contrôle publiant des listes d’exemples supplémentaires.
- Contextes fédéral et autres. La LPRPDE n’impose pas d’EFVP aux organisations du secteur privé, mais le CPVP en recommande, et les organismes publics fédéraux et de nombreux organismes publics provinciaux sont tenus d’en réaliser en vertu de politiques gouvernementales ou de lois.
Le guide de la CAI sur les évaluations des facteurs relatifs à la vie privée, mis à jour pour la dernière fois en avril 2024 (version 3.1), va au-delà des déclencheurs prévus par la loi en recommandant une évaluation pour tout projet impliquant des renseignements personnels, modulée selon son risque. Pour la plupart des organisations, c’est un conseil judicieux. Un questionnaire de filtrage léger appliqué à chaque projet, suivi d’une évaluation complète seulement lorsque le filtrage révèle un risque important, maintient une charge proportionnée tout en garantissant que rien d’important n’échappe à l’examen.

Méthode : ISO/IEC 29134 et le guide de la CAI

La norme ISO/IEC 29134:2023 fournit des lignes directrices sur le processus d’EFVP : préparer l’évaluation, décrire le traitement et son contexte, consulter les parties prenantes, déterminer les risques liés à la vie privée, les analyser et les évaluer, les traiter, puis documenter les résultats et en assurer le suivi. Le guide de la CAI suit une structure compatible et fournit un modèle de rapport; il recommande d’évaluer les risques selon leur gravité pour les personnes et leur probabilité, d’attribuer chaque risque résiduel à un responsable et de revoir l’évaluation tout au long de la vie du projet plutôt que de la classer une fois pour toutes au moment de l’approbation. Comme les exigences québécoises et la norme ISO/IEC 29134 sont étroitement harmonisées, les organisations peuvent utiliser une seule méthodologie interne pour satisfaire à plusieurs régimes, à condition qu’elle comprenne les déclencheurs propres à chaque territoire, les facteurs relatifs aux transferts exigés par la loi québécoise et la documentation qu’attend le RGPD. La figure ci-dessous résume les étapes d’une telle méthodologie.

Figure 71 : les étapes d’une évaluation des facteurs relatifs à la vie privée, du filtrage au suivi

L’analyse de proportionnalité, au cœur de l’approche québécoise, mérite qu’on s’y attarde, car c’est là que les évaluations des facteurs relatifs à la vie privée diffèrent le plus des évaluations de sécurité. La question n’est pas seulement de savoir si les renseignements sont protégés, mais si le traitement est justifié : s’il existe un lien rationnel entre les renseignements et les objectifs du projet, si l’atteinte est minimale ou si aucune autre solution moins intrusive ne serait efficace, et si les avantages l’emportent sur les conséquences pour les personnes concernées. Un projet peut échouer à ce critère même s’il dispose d’excellentes mesures de protection.

Intégrer les EFVP à l’évaluation des risques de cybersécurité

Un processus d’EFVP efficace est intégré à l’évaluation des risques de cybersécurité plutôt que mené en vase clos. Les menaces, les vulnérabilités et les mesures d’atténuation sont souvent communes; ce qui diffère, c’est l’accent mis sur l’impact pour les personnes, en plus de l’impact pour l’organisation. La méthode fondée sur des scénarios élaborée aux chapitres 5 et 6 s’y prête bien : un scénario de risque lié à la vie privée nomme une source de menace (un attaquant externe, un membre du personnel disposant de privilèges excessifs, un fournisseur ou les propres traitements de l’organisation), un événement (accès non autorisé, collecte excessive, utilisation secondaire inattendue, transfert illicite), la population et les renseignements touchés, ainsi que les conséquences pour les personnes et pour l’organisation. Des outils comme CyberRiskGuardian peuvent gérer ces scénarios aux côtés des scénarios de sécurité, de sorte qu’un registre unique présente les deux.

Un processus efficace comporte aussi des rôles clairs. Le responsable métier est imputable du projet et de l’acceptation du risque résiduel dans les limites des pouvoirs qui lui sont délégués; la personne responsable de la protection des renseignements personnels, ou une personne déléguée du bureau de la protection des renseignements personnels, pilote la méthodologie; le CSI ou l’architecte de sécurité évalue les mesures de protection techniques; les conseillers juridiques interprètent les obligations; l’approvisionnement gère les modalités contractuelles; et, lorsque c’est approprié, des représentants des utilisateurs touchés y contribuent. L’évaluation produit un rapport écrit comportant une justification fondée sur le risque, y compris les conditions dans lesquelles un projet va de l’avant malgré un risque résiduel important et l’identité de la personne qui l’a approuvé. Une EFVP dont les conclusions ne se reflètent jamais dans la conception, dans le contrat ou dans le registre des risques relève de la documentation, et non de la gouvernance.

Mise en situation : une évaluation de transfert pour un CRM infonuagique

Chaudière Services Résidentiels est une entreprise québécoise fictive de 600 employés qui installe et entretient des systèmes de chauffage, de ventilation et de climatisation pour environ 90 000 clients résidentiels. Son système patrimonial de gestion de la relation client, hébergé sur place, arrive à la fin de sa période de soutien. Le directeur des ventes propose une plateforme CRM SaaS largement utilisée dont les principaux centres de données se trouvent aux États-Unis, dont les équipes de soutien sont établies aux États-Unis, en Irlande et en Inde, et qui offre un assistant d’IA qui résume les appels des clients. Le projet migrera les noms, les adresses, les numéros de téléphone, l’historique des interventions, l’état des paiements, les notes des techniciens, les enregistrements d’appels et, pour les clients d’un programme subventionné d’efficacité énergétique, les tranches de revenu du ménage utilisées pour établir l’admissibilité.

Comme le projet consiste à refondre un système d’information et entraînera la communication de renseignements personnels à l’extérieur du Québec, deux déclencheurs d’évaluation s’appliquent. La personne responsable de la protection des renseignements personnels — le chef de la direction, qui a délégué cette fonction par écrit à la directrice des affaires juridiques — confie à un analyste de la protection des renseignements personnels la direction de l’évaluation, avec l’architecte de sécurité, le responsable de produit du CRM et l’approvisionnement. Le filtrage classe le projet à risque élevé en raison du volume de dossiers, des renseignements sur le revenu des ménages, des enregistrements d’appels et du transfert à l’extérieur du Canada.

L’évaluation produit plusieurs constatations. L’inventaire des données révèle que les notes des techniciens contiennent à l’occasion des renseignements de santé (« le client utilise un appareil d’oxygénothérapie; prioriser le rétablissement du chauffage ») et des codes d’accès aux domiciles, que personne n’avait classifiés. Le fournisseur offre, moyennant un coût supplémentaire, une option de résidence des données au Canada pour le stockage principal, mais l’accès pour le soutien, la télémétrie et le traitement effectué par l’assistant d’IA auraient toujours lieu à l’extérieur du Canada. Le fournisseur est certifié en vertu du EU–U.S. Data Privacy Framework, ce qui n’est pas pertinent pour un transfert à partir du Québec; l’analyse doit plutôt tenir compte du droit américain en matière d’accès par les autorités publiques, des engagements contractuels du fournisseur, de ses certifications ISO/IEC 27001 et ISO/IEC 27018 et de son rapport SOC 2 de type II, ainsi que de sa liste de sous-traitants ultérieurs, qui comprend un fournisseur de transcription de la parole en texte. Le système patrimonial contient des dossiers remontant à dix-neuf ans, alors que le calendrier de conservation de l’entreprise en prévoit sept.

Le traitement proposé combine des mesures de conception, des mesures contractuelles et des mesures de gouvernance. L’entreprise achètera l’option de résidence au Canada; ne migrera que les dossiers compris dans la période de conservation de sept ans et détruira de façon sécurisée les autres après avoir confirmé qu’aucune mesure de préservation de la preuve ne s’applique; déplacera les tranches de revenu du ménage dans un objet distinct à accès restreint, visible uniquement par l’équipe responsable de l’admissibilité au programme; créera un champ structuré « indicateur de sécurité » pour remplacer les notes de santé en texte libre et formera les techniciens en conséquence; interdira le stockage des codes d’accès aux domiciles dans le CRM; désactivera la fonction de résumé des appels par IA jusqu’à ce qu’une évaluation distincte du sous-traitant ultérieur de transcription de la parole en texte soit terminée; configurera le chiffrement au niveau des champs, avec des clés gérées par le client, pour l’objet relatif au revenu; activera la journalisation des accès, exportée vers la plateforme de surveillance de la sécurité de l’entreprise; et négociera une entente écrite qui traite des finalités, de la confidentialité, de l’avis de changement de sous-traitant ultérieur assorti d’un droit d’opposition, de l’avis d’incident dans les 24 heures, de l’aide au traitement des demandes d’accès et de portabilité, de la restitution et de la suppression des données à la fin du contrat, ainsi que des droits d’audit.

Des risques résiduels subsistent. Le personnel de soutien à l’étranger peut accéder aux données des clients sous le régime des contrôles du fournisseur; des procédures judiciaires américaines pourraient contraindre à la communication; et l’entreprise dépend de l’avis d’incident du fournisseur. L’évaluation juge ces risques modérés compte tenu des mesures d’atténuation et recommande leur acceptation. Comme l’énoncé d’appétence pour le risque de l’entreprise exige l’approbation de la haute direction pour les risques modérés liés à la vie privée touchant plus de 50 000 personnes, la décision est soumise au comité de direction, qui accepte le risque résiduel pour trois ans avec une revue au renouvellement du contrat, approuve le coût supplémentaire de la résidence des données et demande un rapport trimestriel sur l’avancement des suppressions et sur les incidents chez le fournisseur. Le rapport, l’entente, l’approbation et les conditions sont classés comme dossier d’éléments probants du système.

L’évaluation a créé de la valeur bien au-delà de la conformité juridique : elle a permis d’éliminer douze années de dossiers inutiles, de supprimer deux catégories de renseignements qui n’auraient jamais dû être recueillies et d’empêcher la mise en service d’une fonction d’IA non examinée. Son analyse des transferts reposait sur des faits — lieux du soutien, sous-traitants ultérieurs, flux de télémétrie — que seuls l’approvisionnement et l’architecte de sécurité pouvaient obtenir. Enfin, la décision finale était une acceptation du risque défendable par l’autorité compétente, assortie d’une date d’échéance et de conditions, plutôt qu’une acceptation implicite par une équipe de projet pressée par l’échéancier.

## Traduire les obligations de protection de la vie privée dans la réalité du SGSI et de la sécurité infonuagique

Les gestionnaires de la cybersécurité travaillent souvent dans le cadre d’un SGSI aligné sur la norme ISO/IEC 27001 et, de plus en plus, dans des environnements de contrôle centrés sur le nuage et structurés par le Cadre de cybersécurité 2.0 du NIST, la Cloud Controls Matrix de la CSA, les CIS Benchmarks et les CIS Controls v8.1. Les programmes de protection de la vie privée, quant à eux, sont souvent gérés par des équipes juridiques ou de conformité qui ont leurs propres registres, politiques et outils. Dans de nombreuses organisations, il en résulte deux univers parallèles qui décrivent les mêmes systèmes avec des vocabulaires différents. L’occasion à saisir consiste à faire de la protection de la vie privée une dimension explicite des systèmes de gestion et des cadres de contrôles existants, comme le recommande le chapitre 9 pour les cadres en général.

ISO/IEC 27701:2025 et le système de gestion de la protection de la vie privée

La norme ISO/IEC 27701 précise les exigences et les lignes directrices relatives à un système de gestion de la protection de la vie privée (PIMS). L’édition de 2019 avait été rédigée comme une extension des normes ISO/IEC 27001 et ISO/IEC 27002, de sorte que la certification présupposait un SGSI. L’édition de 2025, publiée en octobre 2025, est une norme de système de gestion autonome qui suit la structure harmonisée des normes ISO de systèmes de management; les organisations peuvent désormais obtenir la certification ISO/IEC 27701 sans détenir la certification ISO/IEC 27001, bien que les deux demeurent conçues pour s’intégrer. Au moment de la rédaction, les organismes d’accréditation étaient encore en train d’établir les modalités de transition pour les certificats délivrés selon l’édition de 2019; les organisations certifiées devraient donc confirmer les échéanciers auprès de leur organisme de certification.

Pour les organisations dotées d’un SGSI, la voie pratique est l’intégration : étendre la portée et l’analyse du contexte du SGSI aux obligations de protection de la vie privée, ajouter des rôles et des objectifs propres à la protection de la vie privée, intégrer les EFVP à l’évaluation des risques, faire correspondre les contrôles applicables au responsable du traitement et au sous-traitant dans la déclaration d’applicabilité, et inclure des mesures de protection de la vie privée dans la revue de direction. Pour les organisations qui n’en ont pas, l’édition de 2025 offre désormais une voie de certification à part entière; et même sans certification, elle structure les rôles, les registres et l’imputabilité d’une manière que reconnaissent les auditeurs et les clients.

Intégrer la protection de la vie privée aux contrôles de sécurité et aux bases de référence infonuagiques

De nombreuses mesures de l’ISO/IEC 27002:2022 concernent directement la protection de la vie privée : la classification de l’information, le contrôle d’accès, la gestion des identités, l’utilisation de la cryptographie, la suppression des informations, le masquage des données, la prévention de la fuite de données, la journalisation, le développement sécurisé, les relations avec les fournisseurs et, explicitement, la protection de la vie privée et des DCP. La fonction Gouverner du NIST CSF 2.0 offre un point d’ancrage aux obligations de protection de la vie privée dans le contexte organisationnel, la stratégie de gestion des risques, les rôles, les politiques et la gestion des risques liés à la chaîne d’approvisionnement. Une bibliothèque de contrôles intégrée fait correspondre chaque exigence de protection de la vie privée — issue de la Loi 25, de la LPRPDE, du RGPD et des contrats — aux contrôles qui y satisfont, aux responsables de ces contrôles et aux éléments probants qu’ils produisent, de sorte qu’un seul test d’un contrôle appuie plusieurs obligations.

Pour les charges de travail en nuage public, les organisations peuvent intégrer les attentes de l’ISO/IEC 27018 aux exigences imposées aux fournisseurs, utiliser des référentiels de configuration propres au nuage pour définir les configurations de référence comme le décrivent les chapitres 14 et 15, et y superposer des contrôles propres à la protection de la vie privée : contraintes de résidence, politiques de cycle de vie et de suppression, journalisation des accès aux renseignements personnels, restrictions sur le partage public et chiffrement géré par le client pour les jeux de données sensibles. Les politiques de configuration appliquées au moyen de l’infrastructure en tant que code sont particulièrement précieuses, car elles transforment les exigences de protection de la vie privée par défaut en contrôles testés automatiquement à chaque déploiement.

Le NIST Privacy Framework aux côtés du CSF 2.0

Le NIST Privacy Framework fournit une structure aux organisations qui privilégient une approche axée sur les résultats. Ses cinq fonctions correspondent aux activités d’un programme de protection de la vie privée : Identify-P (inventaire et cartographie, environnement d’affaires, évaluation des risques), Govern-P (politiques, rôles, stratégie de gestion des risques, sensibilisation), Control-P (gestion des données, traitement dissocié, gestion des demandes des personnes), Communicate-P (transparence et sensibilisation au traitement des données) et Protect-P (mesures de sécurité pour le traitement des données). Comme la version 1.1, à l’état d’ébauche au moment de la rédaction, réaligne le cadre sur le CSF 2.0, les organisations peuvent utiliser des profils et des niveaux communs pour décrire les états actuels et cibles en matière de cybersécurité et de protection de la vie privée, et rendre compte des deux au conseil d’administration dans un format cohérent. Comme pour le CSF, la valeur réside dans la détermination des écarts et la priorisation des investissements, et non dans une prétention de conformité.

La protection de la vie privée ne devrait pas être un système de gestion parallèle. Les programmes les plus efficaces ajoutent les exigences de protection de la vie privée aux inventaires, aux registres des risques, aux bibliothèques de contrôles et aux cycles d’assurance que l’organisation exploite déjà.

## Modèle opérationnel : rôles, responsabilités et éléments probants

La protection de la vie privée n’est pas uniquement l’affaire des spécialistes. Un modèle opérationnel crédible répartit les responsabilités dans l’ensemble de l’organisation tout en maintenant une imputabilité claire, et il produit des éléments probants comme sous-produit du travail courant. Le chapitre 21 approfondit la conception organisationnelle et les mécanismes de reddition de comptes en général; la présente section les applique à la protection de la vie privée.

Rôles et droits décisionnels

Les rôles fondamentaux sont semblables dans la plupart des organisations, même si les titres diffèrent.

- La personne responsable de la protection des renseignements personnels. Au Québec, il s’agit par défaut de la personne ayant la plus haute autorité au sein de l’entreprise, qui peut déléguer cette fonction par écrit; ce rôle approuve les politiques de gouvernance, est consulté sur les évaluations et les incidents, et constitue le point de contact public. Lorsque la fonction est déléguée, la personne déléguée a besoin d’une autorité, d’une indépendance et de ressources suffisantes pour l’exercer, et le chef de la direction demeure imputable.
- Le délégué à la protection des données, lorsqu’il est requis. En vertu du RGPD, certains responsables du traitement et sous-traitants doivent désigner un DPD possédant des connaissances spécialisées et jouissant d’indépendance; les organisations canadiennes assujetties au RGPD devraient déterminer si cette obligation s’applique à elles.
- Le CSI et l’architecture de sécurité. Ils veillent à ce que les mesures de protection techniques — contrôle d’accès, chiffrement, journalisation, DLP, surveillance, développement sécurisé et configuration infonuagique — soient alignées sur le risque lié à la vie privée et sur les obligations, et ils fournissent l’analyse de sécurité dans les EFVP et les évaluations d’incidents.
- Les responsables des données et des systèmes. Ils sont imputables du cycle de vie de jeux de données et de systèmes précis, y compris la minimisation, la conservation, la classification, les revues des accès et le respect des conceptions approuvées; ils sont les responsables du risque tout désignés pour les scénarios liés à la vie privée qui touchent leurs systèmes.
- L’approvisionnement et la gestion des fournisseurs. Ils intègrent les exigences de protection de la vie privée et de sécurité à la vérification diligente, aux contrats et à l’assurance continue, y compris l’examen des rapports d’audit, des changements de sous-traitants ultérieurs et des clauses d’avis d’incident (chapitre 19).
- Les services juridiques, la gestion des documents et les ressources humaines. Ils interprètent les obligations, sont responsables des calendriers de conservation et encadrent l’information sur le personnel et sa surveillance.
Le modèle des trois lignes offre un cadre utile. En première ligne, la direction des affaires et des technologies est responsable des contrôles de protection de la vie privée et les exploite; en deuxième ligne, le bureau de la protection des renseignements personnels et les fonctions de gestion des risques et de conformité établissent la méthodologie, remettent en question les évaluations et exercent une surveillance; en troisième ligne, l’audit interne fournit une assurance indépendante. Une défaillance courante survient lorsque le bureau de la protection des renseignements personnels effectue le travail de la première ligne — en remplissant les évaluations à la place des équipes de projet ou en tenant des inventaires que les responsables ne consultent jamais — et n’a donc plus la capacité d’exercer sa fonction de remise en question. Le bureau de la protection des renseignements personnels devrait être responsable de la méthode et de la remise en question; les unités d’affaires devraient être responsables du risque.

Éléments probants et préparation à l’audit de la protection de la vie privée

Les obligations de protection des renseignements personnels sont fondamentalement probatoires. Les organismes de réglementation, les tribunaux, les auditeurs et les clients s’intéressent non seulement à ce que l’organisation affirme, mais aussi à ce qu’elle peut démontrer. Un programme bien gouverné peut produire, pour tout système important, un dossier d’éléments probants cohérent qui comprend les éléments suivants.

- Les registres des activités de traitement ou les entrées d’inventaire indiquant les finalités, les catégories de renseignements, les destinataires, les emplacements et les règles de conservation.
- Les évaluations des facteurs relatifs à la vie privée, les décisions qui en découlent, les approbations du risque résiduel et la preuve que les mesures d’atténuation ont été mises en œuvre.
- Les contrats et les évaluations des transferts visant les fournisseurs de services et les communications transfrontalières, avec les listes de sous-traitants ultérieurs et les registres d’examen.
- Le registre des incidents de confidentialité, les avis de violation et les améliorations apportées après les incidents.
- Les politiques de gouvernance et les avis publiés, ainsi que les registres indiquant comment les demandes d’accès, de rectification, de désindexation et de portabilité des personnes ont été traitées et dans quels délais.
- Les politiques, les normes, les registres de formation, les configurations de référence et les résultats des tests de contrôles démontrant que la protection de la vie privée dès la conception et par défaut fonctionne en pratique.
Les gestionnaires devraient considérer cela comme la préparation à l’audit de la protection de la vie privée : si on lui demande de démontrer comment un système donné se conforme à la Loi 25, à la LPRPDE ou au RGPD, le responsable peut produire le dossier en quelques jours plutôt que de le constituer sous pression après une plainte ou un incident.

Mesures et indicateurs clés de risque

Un programme de protection de la vie privée, comme tout autre domaine de gouvernance, a besoin d’indicateurs qui indiquent à la direction si le risque se situe dans les limites de l’appétence. Les mesures utiles combinent l’activité, la couverture et les résultats.

- Couverture des évaluations. Le pourcentage de projets visés et de relations de services transfrontalières existantes qui disposent d’une EFVP à jour, et l’ancienneté du plus ancien transfert non évalué.
- Actualité de l’inventaire. Le pourcentage de systèmes détenant des renseignements personnels dont le responsable est nommé et dont la finalité, l’emplacement et la règle de conservation documentés ont été revus au cours de la dernière année.
- Conformité de la conservation. Le volume de dossiers dont la date de conservation est dépassée, et la tendance des suppressions effectuées par rapport au plan.
- Performance du traitement des demandes. Le nombre de demandes d’accès, de rectification et de portabilité, le pourcentage de demandes traitées dans le délai prévu par la loi et le nombre de demandes ayant donné lieu à une plainte.
- Indicateurs d’incidents. Les incidents de confidentialité par catégorie et par cause profonde, le délai entre la détection et l’évaluation de la protection de la vie privée, et le pourcentage d’incidents déclarés dans le délai cible.
- Assurance à l’égard des fournisseurs. Le pourcentage de sous-traitants à risque élevé pour lesquels on dispose d’éléments probants d’assurance à jour et dont les changements de sous-traitants ultérieurs ont été examinés.
Comme le souligne le chapitre 17, les mesures devraient orienter les décisions : un indicateur qui n’a jamais amené qui que ce soit à modifier un plan ou un budget devrait être remplacé par un indicateur qui le fera.

## Synthèse : la protection de la vie privée comme dimension de la gouvernance de la cybersécurité

Ce chapitre a présenté la protection des données et des renseignements personnels comme un pont entre les obligations de haut niveau et la conception concrète des systèmes et des opérations. Plusieurs conclusions transversales en découlent, et elles rattachent solidement la protection de la vie privée aux thèmes de gouvernance développés tout au long du manuel.

La protection de la vie privée est fondée sur le risque et sur le cycle de vie, et elle repose sur la preuve

Premièrement, la protection de la vie privée est fondamentalement fondée sur le risque et sur le cycle de vie. Les lois et les normes s’attendent de plus en plus à ce que les organisations déterminent et gèrent les risques découlant de leurs activités de traitement, et non simplement à ce qu’elles publient des politiques. L’ingénierie de la protection de la vie privée fournit la boîte à outils pour y parvenir — minimisation, conception liée aux finalités, automatisation de la conservation, choix de résidence, chiffrement, journalisation, DLP et évaluation des facteurs relatifs à la vie privée —, et le cycle de vie fournit la structure qui indique aux gestionnaires où chaque outil s’applique. Deuxièmement, les obligations de protection des renseignements personnels au Québec, au Canada et dans l’UE convergent vers un vocabulaire commun : imputabilité, transparence, protection de la vie privée dès la conception et par défaut, évaluation des risques, proportionnalité et mesures de protection démontrables. La Loi 25 du Québec, désormais pleinement en vigueur, figure parmi les expressions les plus exigeantes de ce vocabulaire en Amérique du Nord; la réforme fédérale demeure en cours avec le projet de loi C-36; et le RGPD continue d’établir la référence internationale. Les normes ISO/IEC 29100, 29134, 27701 et 27018, avec le NIST Privacy Framework et le CSF 2.0, fournissent des structures reconnues pour exprimer ce vocabulaire au sein de l’organisation et en démontrer l’application.

Troisièmement, la protection de la vie privée repose sur la preuve. Les cadres d’application, qui sont désormais assortis de sanctions importantes, récompensent les organisations capables de démontrer ce qu’elles ont décidé, pourquoi et avec quel résultat. Le registre des incidents, l’évaluation des facteurs relatifs à la vie privée, l’entente de transfert, le rapport de conservation et l’acceptation du risque signée par l’autorité compétente ne sont pas des lourdeurs bureaucratiques; ce sont les moyens par lesquels une organisation démontre que ses décisions étaient défendables.

Questions que les gestionnaires et les conseils d’administration devraient poser

Les conseils d’administration et la haute direction n’ont pas besoin de maîtriser les détails de chaque loi, mais ils devraient être en mesure de poser des questions qui révèlent si le programme est réel. Les questions suivantes constituent un point de départ pratique.

- Imputabilité. Qui est notre personne responsable de la protection des renseignements personnels, à qui la fonction a-t-elle été déléguée, et cette personne dispose-t-elle de l’autorité et des ressources que le rôle exige?
- Inventaire. Pouvons-nous déterminer, pour chaque système détenant des renseignements personnels, son responsable, ses finalités, ses emplacements et sa règle de conservation, et dans quelle mesure cet inventaire est-il à jour?
- Renseignements sensibles. Où détenons-nous des renseignements sensibles — renseignements de santé, biométriques, financiers ou concernant des mineurs —, et les contrôles appliqués à ces jeux de données sont-ils plus rigoureux que ceux qui s’appliquent au reste?
- Évaluations. Quel pourcentage des nouveaux projets et des relations de services transfrontalières existantes dispose d’une évaluation des facteurs relatifs à la vie privée à jour, et quels transferts importants n’ont jamais été évalués?
- Risque résiduel. Quels risques importants liés à la vie privée ont été acceptés, par qui, à quelles conditions, et quand ces acceptations arrivent-elles à échéance?
- Conservation. Quelle quantité de renseignements personnels détenons-nous au-delà de leur période de conservation, et quels sont notre plan et notre budget pour la réduire?
- Transferts. Pour nos principaux fournisseurs de services infonuagiques et autres, où nos renseignements sont-ils stockés et consultés, quels sous-traitants ultérieurs interviennent, et quelle est notre solution de repli si un mécanisme de transfert est invalidé?
- Incidents. Combien d’incidents de confidentialité avons-nous consignés l’an dernier, quelles en étaient les causes profondes, combien ont été déclarés, et en combien de temps avons-nous terminé l’évaluation du risque qu’un préjudice sérieux soit causé?
- Droits des personnes. Les demandes d’accès, de rectification, de désindexation et de portabilité sont-elles traitées dans les délais prévus par la loi, et que nous apprennent les plaintes?
- Nouvelles technologies. Comment les fonctions d’IA, les projets d’analytique et les outils de surveillance sont-ils examinés avant que des renseignements personnels soient utilisés à une nouvelle fin?
- Éléments probants. Si la CAI, le CPVP ou un client important demandait demain comment un système donné se conforme aux exigences, son responsable pourrait-il produire le dossier d’éléments probants en moins d’une semaine?
- Intégration. Les risques liés à la vie privée sont-ils consignés dans le même registre des risques, communiqués par les mêmes canaux de gouvernance et testés dans le cadre du même cycle d’assurance que les risques de cybersécurité?
Le défi de gestion

Le défi de gestion ne consiste pas à devenir juriste spécialisé en protection des renseignements personnels ni expert en cryptographie, mais à faire en sorte que des mécanismes de gouvernance existent, de façon que les projets comportant un risque lié à la vie privée soient repérés et analysés tôt, que les cycles de vie des données soient compris et documentés, que les mesures de protection techniques soient alignées sur la classification et le risque, que les transferts transfrontaliers et les relations avec les fournisseurs soient gouvernés explicitement, et que les éléments probants de la conformité et de la bonne foi soient produits dans le cours normal des opérations plutôt que rassemblés à la hâte après une violation. Ce sont les mécanismes que le manuel préconise depuis le début : des responsables du risque clairement désignés, une appétence pour le risque définie, une évaluation fondée sur des scénarios, des exceptions assorties de dates d’échéance, des mesures qui orientent les décisions et une assurance indépendante.

Les organisations qui gèrent bien la protection de la vie privée sont rarement celles qui ont les politiques les plus longues; ce sont celles qui savent où se trouvent leurs renseignements personnels, pourquoi elles les détiennent, qui a pris les décisions et ce qu’elles peuvent prouver.

Dans la trame plus large de ce manuel, la protection des données et des renseignements personnels complète les chapitres précédents sur la gouvernance, le risque, l’architecture, l’identité et la sécurité infonuagique, et elle prépare le terrain pour les chapitres suivants sur l’investissement, l’IA, les tiers, la cryptographie et la reddition de comptes. Une gouvernance de la cybersécurité qui traite la protection de la vie privée comme une contrainte de conception à part entière — plutôt que comme une fonction distincte ou antagoniste — est mieux placée pour protéger les personnes, satisfaire les organismes de réglementation et maintenir la confiance dont dépend, en définitive, une organisation axée sur les données.

## Résumé du chapitre

Le chapitre 16 soutient que le risque d’atteinte à la vie privée se trouve dans les flux de données, les configurations, les fournisseurs et les processus quotidiens plutôt que dans les textes de loi; la gouvernance de la vie privée doit donc transformer les obligations juridiques en décisions assorties de responsables et d’éléments probants. Ce risque devient gérable lorsque l’organisation encadre explicitement le cycle de vie des renseignements personnels et les mesures de protection propres à chaque phase, et qu’elle peut démontrer qu’elle le fait. Le chapitre présente le régime à plusieurs niveaux auquel sont soumises les organisations québécoises — Loi 25, LPRPDE, autres provinces, RGPD, cadres ISO et NIST —, puis examine la minimisation, la conservation, la résidence des données, le chiffrement, la surveillance et les évaluations des facteurs relatifs à la vie privée; il se termine par l’intégration au SGSI et par un modèle opérationnel fondé sur des rôles, des mesures et des éléments probants.

Points clés à retenir

- Un renseignement personnel est tout renseignement qui concerne une personne identifiable, ce qui inclut des identifiants, des journaux, des enregistrements, des inférences et des notes en texte libre, bien au-delà de ce que supposent la plupart des unités d’affaires.
- La sensibilité relie la vie privée à la dimension impact du triangle du risque et devrait être un attribut obligatoire du schéma de classification des données.
- Imparter le traitement ne permet pas d’imparter l’imputabilité : les responsables du traitement conservent leurs obligations lorsque des sous-traitants et des fournisseurs infonuagiques traitent l’information pour leur compte.
- Le risque d’atteinte à la vie privée et le risque de sécurité se recoupent, mais diffèrent; un système peut être parfaitement sécurisé et traiter tout de même des données de façon illicite, excessive ou trop longtemps.
- La Loi 25 est entrée en vigueur en trois phases (2022, 2023, 2024) et a instauré les EFVP obligatoires, les registres d’incidents, la portabilité et des sanctions pouvant atteindre 10 millions de dollars ou 2 % du chiffre d’affaires mondial.
- La LPRPDE demeure la loi fédérale applicable tant que le projet de loi C-36 est à l’étude, et le RGPD s’applique aux organisations canadiennes qui offrent des biens ou des services à des personnes dans l’UE ou qui suivent leur comportement.
- Le cycle de vie en cinq phases — collecte, utilisation, stockage, communication, conservation et destruction — est le langage commun le plus pratique entre les équipes juridiques, de protection de la vie privée, de sécurité et d’ingénierie.
- La minimisation et la limitation des finalités sont des contraintes de conception; un renseignement qui n’a jamais été recueilli ne peut être ni divulgué à la suite d’une violation, ni détourné, ni visé par une assignation.
- Une suppression rigoureuse — calendriers de conservation, application au niveau des systèmes, éléments probants et gestion des mesures de préservation de la preuve (legal hold) — est souvent la plus forte réduction du risque d’atteinte à la vie privée possible à court terme.
- En vertu de la loi québécoise, communiquer des renseignements personnels à l’extérieur du Québec, y compris dans le reste du Canada, exige une évaluation des facteurs relatifs à la vie privée préalable et une entente écrite.
- Le chiffrement, la DLP et la journalisation sont des couches nécessaires, mais ne remplacent jamais la minimisation, le contrôle d’accès ou une finalité légitime; ils traitent eux-mêmes des renseignements personnels.
- La vie privée devrait être intégrée aux inventaires, aux registres des risques, aux bibliothèques de contrôles et aux cycles d’assurance existants; le bureau de la protection de la vie privée est responsable de la méthode, et les unités d’affaires, du risque.
Termes clés

- Renseignement personnel — Renseignement qui concerne une personne identifiable, quelle que soit sa forme, et qui, seul ou combiné à d’autres renseignements raisonnablement accessibles, pourrait être rattaché à une personne.
- Renseignement sensible — En vertu de la loi québécoise, renseignement qui, par sa nature ou en raison du contexte de son utilisation, suscite un haut degré d’attente raisonnable en matière de vie privée.
- Responsable du traitement de DCP — Partie qui détermine les finalités et les moyens du traitement des renseignements personnels et qui doit justifier les finalités, obtenir le consentement et rendre des comptes aux personnes.
- Sous-traitant de DCP — Partie qui traite des renseignements personnels pour le compte d’un responsable du traitement et qui doit suivre ses instructions et protéger ce qu’elle reçoit.
- Personne responsable de la protection des renseignements personnels — En vertu de la Loi 25, par défaut, la personne ayant la plus haute autorité au sein de l’entreprise, qui peut déléguer cette fonction par écrit.
- Registre des incidents de confidentialité — Registre québécois de tous les incidents de confidentialité, déclarés ou non, conservé pendant cinq ans et transmis à la CAI sur demande.
- Protection de la vie privée par défaut — Décision de configuration qui garantit que les produits et services offerts au public assurent le plus haut niveau de confidentialité sans aucune intervention de la personne.
- Minimisation des données — Principe qui consiste à ne recueillir et à ne traiter que les renseignements personnels nécessaires aux fins déterminées avant la collecte.
- Pseudonymisation — Remplacement des identifiants directs par des jetons, tout en conservant la possibilité de rattacher les enregistrements au moyen de renseignements conservés séparément; les données demeurent des renseignements personnels.
- Anonymisation — Traitement à la suite duquel un renseignement ne permet plus, de façon irréversible, d’identifier directement ou indirectement une personne, conformément au règlement québécois de 2024.
- Calendrier de conservation — Correspondance documentée et approuvée entre les catégories de documents et les durées de conservation, fondée sur les exigences juridiques, réglementaires, contractuelles et d’affaires.
- Résidence des données — Choix délibéré de l’endroit où les renseignements personnels sont stockés, répliqués et consultés, y compris la télémétrie, l’accès du soutien technique et les sous-traitants ultérieurs.
- Prévention des pertes de données (DLP) — Outils et pratiques qui détectent et empêchent la transmission ou la copie non autorisée de renseignements sensibles par courriel, sur le Web, sur les terminaux et dans les services infonuagiques.
- Évaluation des facteurs relatifs à la vie privée (EFVP) — Analyse structurée et documentée des risques d’atteinte à la vie privée et de leur traitement, menée avant une décision; appelée EFVP au Québec et AIPD sous le RGPD.
- Système de gestion de la protection de la vie privée (PIMS) — Système de gestion de la protection de la vie privée spécifié par la norme ISO/IEC 27701, qui peut, depuis 2025, être certifié sans l’ISO/IEC 27001.

## Questions de révision

Questions à développement

1. À partir de la mise en situation de Chaudière Services Résidentiels, évaluez comment l’évaluation des facteurs relatifs à la vie privée a modifié le projet de CRM. Quelles constatations dépendaient de renseignements fournis par l’approvisionnement et par l’architecte de sécurité, et pourquoi l’acceptation finale du risque était-elle défendable?

2. Le chapitre affirme qu’un système peut être parfaitement sécurisé et constituer tout de même un échec en matière de vie privée. Analysez cette affirmation à l’aide d’exemples tirés du chapitre et expliquez comment une organisation devrait intégrer la vie privée et la sécurité tout en gardant leurs responsabilités distinctes.

3. Choisissez une organisation que vous connaissez. Appliquez le cycle de vie en cinq phases des renseignements personnels à l’un de ses systèmes en précisant, pour chaque phase, les décisions clés, le rôle imputable et un contrôle que vous jugeriez prioritaire.

4. Évaluez pourquoi tant d’organisations conservent indéfiniment des renseignements personnels et proposez un programme de gouvernance de la conservation qui traite des calendriers, des sauvegardes et des répliques, des mesures de préservation de la preuve et des preuves de suppression.

5. Un détaillant québécois prévoit de transférer les données de sa clientèle vers un service infonuagique hébergé aux États-Unis, avec des équipes de soutien mondiales. Analysez les obligations transfrontalières en vertu de la loi québécoise, de la LPRPDE et, s’il y a lieu, du RGPD, et recommandez les décisions d’architecture et de contrat que la direction devrait prendre.

Questions à choix multiples

Choisissez la meilleure réponse. Les réponses figurent à l’annexe « Réponses aux questions à choix multiples ».

1. En vertu de la Loi 25 du Québec, qui est, par défaut, la personne responsable de la protection des renseignements personnels?

A. Le chef de la sécurité de l’information

B. La personne ayant la plus haute autorité au sein de l’entreprise

C. Un délégué à la protection des données inscrit auprès de la CAI

D. Le responsable des affaires juridiques ou de la conformité

2. Une équipe d’analytique remplace les noms des clients par des jetons, mais conserve une clé distincte qui permet de rattacher les enregistrements. Comment ce jeu de données doit-il être traité?

A. Comme des renseignements anonymisés, hors du champ d’application des lois sur la vie privée

B. Comme des renseignements publics une fois la clé chiffrée

C. Comme des données commerciales régies uniquement par des règles de confidentialité

D. Comme des renseignements personnels toujours soumis aux obligations en matière de vie privée

3. Selon le NIST Privacy Framework, en quoi le risque d’atteinte à la vie privée diffère-t-il du risque de cybersécurité?

A. Il découle d’un traitement de données susceptible de causer des problèmes aux personnes

B. Il découle uniquement d’une perte de confidentialité des dossiers personnels

C. Il se limite aux violations qui exigent un avis à un organisme de réglementation

D. Il concerne les sanctions juridiques, alors que le risque de sécurité concerne les attaquants

4. Un fournisseur de logiciel-service héberge les dossiers des clients de ses clients et gère aussi sa propre facturation et son propre marketing. Quels rôles assume-t-il?

A. Responsable du traitement pour toutes les données, puisqu’il exploite la plateforme

B. Sous-traitant pour toutes les données, puisqu’il fournit un service

C. Sous-traitant pour les données de ses clients et responsable du traitement pour ses propres données de facturation et de marketing

D. Responsable conjoint du traitement avec chaque client pour chaque jeu de données

5. Quelle phase de la Loi 25 a accordé aux personnes un droit à la portabilité des données dans un format technologique structuré et couramment utilisé?

A. 22 septembre 2021

B. 22 septembre 2022

C. 22 septembre 2024

D. 22 septembre 2023

6. Une entreprise assujettie à la loi québécoise sur le secteur privé a réalisé un chiffre d’affaires mondial de 800 millions de dollars au cours de l’exercice précédent. Quelle est la sanction administrative pécuniaire maximale que la CAI pourrait imposer?

A. 16 millions de dollars

B. 10 millions de dollars

C. 25 millions de dollars

D. 32 millions de dollars

7. En vertu de la LPRPDE, pendant combien de temps les organisations doivent-elles tenir un registre de toutes les atteintes aux mesures de sécurité?

A. Cinq ans après en avoir pris connaissance

B. Jusqu’à ce que le CPVP ferme son examen

C. Douze mois après la notification

D. Au moins 24 mois

8. Selon le chapitre, quel est l’état du projet de loi C-36 en octobre 2026?

A. Il est en vigueur et a remplacé les règles de la LPRPDE pour le secteur privé

B. Il a été déposé en juin 2026 mais n’est pas adopté; la LPRPDE s’applique donc toujours

C. Il est mort au Feuilleton lors de la prorogation du Parlement en 2025

D. Il ne s’applique qu’aux banques et aux entreprises de télécommunications sous réglementation fédérale

9. Une entreprise montréalaise prévoit d’héberger les données de sa clientèle dans un centre de données en Ontario. Qu’exige la loi québécoise avant que les renseignements soient communiqués?

A. Une évaluation des facteurs relatifs à la vie privée, puisque l’extérieur du Québec inclut le reste du Canada

B. Aucune évaluation, puisque l’Ontario est couvert par la loi fédérale sur la vie privée

C. Seulement un avis aux clients indiquant que les données seront stockées au Canada

D. L’approbation de la CAI avant tout transfert interprovincial

10. En vertu du RGPD, dans quel délai une violation doit-elle généralement être notifiée à l’autorité de contrôle?

A. Avec diligence, sans délai fixe

B. Dès que possible après la confirmation d’un préjudice

C. Dans les 72 heures, si possible

D. Dans les 30 jours suivant la découverte

11. La charte d’un projet indique que la durée de conservation d’une nouvelle base de données clients est « à déterminer ». Quelle est la position du chapitre?

A. C’est acceptable jusqu’à la première revue annuelle des documents

B. C’est un indicateur fiable d’une conservation indéfinie et le projet ne devrait pas être approuvé

C. C’est acceptable si la base de données est chiffrée au repos

D. C’est une question de gestion documentaire qui dépasse la portée du projet

12. Des développeurs constatent que les journaux d’application consignent le contenu complet des requêtes, y compris les renseignements des clients. Quelle pratique de minimisation répond à ce problème?

A. La séparation des attributs sensibles

B. Des jeux de données liés à une finalité

C. Des interfaces de collecte épurées

D. Une journalisation minimale du contenu

13. En vertu du règlement québécois de 2024 sur l’anonymisation, quelle étape une entreprise doit-elle franchir avant de traiter un renseignement comme anonymisé?

A. Chiffrer le jeu de données avec des clés gérées par le client

B. Obtenir le consentement exprès de chaque personne concernée

C. Aviser la CAI et publier le jeu de données anonymisé

D. Analyser le risque de réidentification sous la supervision d’une personne compétente et tenir un registre

14. Un fournisseur infonuagique chiffre par défaut toutes les données de ses clients au repos avec des clés qu’il gère. Contre quelle menace cette mesure protège-t-elle principalement?

A. L’accès par les propres administrateurs du fournisseur

B. Le vol de supports de stockage physiques

C. L’exportation d’enregistrements par un utilisateur autorisé

D. Une application compromise pendant que les données sont déchiffrées

15. Dans l’approche par couches de la prévention des pertes de données présentée au chapitre, que faut-il mettre en place en premier?

A. Des blocages stricts de tout partage externe

B. Le déploiement d’un courtier de sécurité d’accès au nuage

C. Des politiques de classification et des étiquettes pour les renseignements personnels

D. La reconnaissance de motifs pour les numéros de carte et d’assurance sociale

16. Dans une évaluation des facteurs relatifs à la vie privée au Québec, qu’examine l’analyse de proportionnalité qu’une évaluation de sécurité n’examine habituellement pas?

A. Si le traitement est justifié, le moins intrusif possible et bénéfique dans l’ensemble

B. Si le chiffrement et les contrôles d’accès respectent le schéma de classification

C. Si le fournisseur détient une certification ISO/IEC 27001 et des rapports SOC 2 de type II

D. Si la notification d’incident peut être faite dans les 72 heures

17. Dans la mise en situation de Chaudière, pourquoi la certification du fournisseur au Data Privacy Framework UE–États-Unis n’était-elle pas pertinente pour l’évaluation?

A. Parce que le transfert partait du Québec, de sorte que c’est l’analyse québécoise des transferts qui s’appliquait

B. Parce que le Data Privacy Framework avait été invalidé par les tribunaux

C. Parce que le fournisseur stockait toutes les données principales au Canada

D. Parce que la certification ISO/IEC 27018 remplace tout mécanisme de transfert

18. Dans la mise en situation de Chaudière, pourquoi la décision sur le risque résiduel a-t-elle été soumise au comité de direction plutôt qu’à l’équipe de projet?

A. Parce que la CAI doit approuver tout transfert à l’extérieur du Canada

B. Parce que la fonction de résumé d’appels par IA était classée comme interdite

C. Parce que le fournisseur refusait de négocier une entente écrite

D. Parce que l’énoncé d’appétence exige l’approbation de la direction pour les risques modérés touchant plus de 50 000 personnes

19. Qu’est-ce qui a changé avec l’édition 2025 de la norme ISO/IEC 27701?

A. Elle a fusionné avec l’ISO/IEC 27018 en une seule norme de protection de la vie privée infonuagique

B. Elle est devenue obligatoire pour les organisations assujetties à la Loi 25

C. Elle est devenue une norme autonome, certifiable sans l’ISO/IEC 27001

D. Elle a remplacé l’ISO/IEC 29134 comme guide des évaluations d’impact

20. Un bureau de la protection de la vie privée consacre l’essentiel de son temps à remplir des EFVP pour les équipes de projet et à tenir des inventaires que les responsables ne consultent jamais. Quel est le principal problème de gouvernance?

A. Le bureau devrait plutôt relever de l’audit interne

B. Le bureau accomplit un travail de première ligne et n’a plus la capacité d’exercer une remise en question

C. Les équipes de projet ne devraient pas participer aux évaluations des facteurs relatifs à la vie privée

D. Les inventaires devraient être tenus par le CSI plutôt que par les responsables
