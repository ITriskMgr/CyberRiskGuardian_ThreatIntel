<!-- Léger, M.-A. (2026). Introduction à la gouvernance de la cybersécurité pour la gestion des technologies d’affaires (3e éd., v2.51). Chapitre 11 : Sécurité des TO, de l’IdO et des systèmes cyberphysiques. CC BY-NC 4.0 -->

# Chapitre 11 : Sécurité des TO, de l’IdO et des systèmes cyberphysiques

## Résultats d’apprentissage

Au terme de ce chapitre, vous devriez être en mesure de :

1. Définir la technologie opérationnelle, l’Internet des objets et les systèmes cyberphysiques, et appliquer un test de portée fondé sur la conséquence pour décider quels systèmes un programme de gouvernance doit inclure.

2. Expliquer en quoi le risque lié à la TO et à l’IdO diffère du risque lié aux TI d’entreprise sur le plan des priorités, des cycles de vie, de la responsabilité, des menaces et des conséquences physiques.

3. Comparer les principales normes et les principaux régimes réglementaires, notamment la série ISA/IEC 62443, la publication NIST SP 800-82, le règlement européen sur la cyberrésilience, la directive NIS2, la LPCE du Canada et les règles sur les dispositifs médicaux, et expliquer ce que chacun exige des gestionnaires.

4. Concevoir un modèle opérationnel qui attribue la responsabilité et les droits décisionnels entre l’exploitation, l’ingénierie, la cybersécurité, l’approvisionnement et les fournisseurs avant qu’un incident survienne.

5. Recommander des contrôles d’approvisionnement, d’architecture, de correctifs et de changement, y compris les zones et conduits, le moindre privilège, les contrôles compensatoires et les exceptions à échéance.

6. Évaluer comment la cybersécurité doit protéger le dossier de sécurité fonctionnelle et comment la détection, l’intervention et la reprise doivent être adaptées à des opérations physiques dégradées.

7. Évaluer les limites de gouvernance à établir avant de permettre à des systèmes dotés d’IA d’influer sur les opérations physiques.

8. Appliquer des indicateurs clés de risque et la méthode des scénarios à un environnement de TO ou d’IdO, et justifier les décisions de risque au regard d’une appétence pour le risque énoncée.

La technologie opérationnelle (TO), l’Internet des objets (IdO) et les systèmes cyberphysiques étendent la cybersécurité au-delà de la protection de l’information. Ils y ajoutent la protection des opérations physiques, l’intégrité des actifs, la sécurité des personnes, la continuité des services et la confiance du public. Dans ces environnements, un incident de cybersécurité peut faire plus qu’exposer des données ou interrompre un service numérique. Il peut arrêter une chaîne de production, endommager un équipement dont l’acquisition a pris des mois, dégrader la distribution d’eau ou d’électricité, perturber un hôpital, libérer un polluant ou mettre en danger les personnes qui travaillent à proximité du procédé. La question de gouvernance change en conséquence : il ne s’agit plus seulement de savoir « quelle information pourrions-nous perdre? », mais aussi « que pourrait-il se produire physiquement, à qui et à quelle vitesse? ».

Dans la plupart des organisations, les environnements de TO et d’IdO coexistent avec les technologies de l’information (TI) de l’entreprise, mais ils sont achetés, entretenus, dotés en personnel et mesurés différemment. Cette divergence est l’une des principales raisons pour lesquelles ces environnements demeurent chroniquement vulnérables. Ils ont tendance à tomber entre les frontières de responsabilité. Les équipes des TI et de la cybersécurité comprennent les menaces et les contrôles, mais n’ont souvent aucune autorité sur les systèmes industriels, les installations, les laboratoires ou les systèmes embarqués. Les équipes d’ingénierie, d’exploitation et des installations connaissent intimement l’équipement, mais peuvent manquer de formation en cybersécurité, d’outils de surveillance ou d’incitatifs. Les fournisseurs et les intégrateurs contrôlent fréquemment l’accès pour la maintenance. Des appareils sont déployés à grande échelle par des unités d’affaires sans inventaire fiable, sans plan d’application des correctifs et sans la moindre réflexion sur leur fin de vie. Chaque groupe agit raisonnablement dans les limites de son propre mandat, et l’organisation dans son ensemble se retrouve avec des risques dont personne n’est responsable.

Pour les gestionnaires, le défi n’est pas de devenir des spécialistes des protocoles industriels, de la logique à relais, des micrologiciels embarqués ou de l’ingénierie des capteurs. Il consiste à diriger et à surveiller une catégorie de systèmes dans lesquels les cyberévénements ont des conséquences physiques. Un compte de courriel compromis est grave; la compromission d’un automate de dosage chimique, d’une flotte de pompes à perfusion ou d’une station de pompage à distance change la façon dont l’organisation fonctionne dans le monde physique. Le risque s’étend de la confidentialité, de l’intégrité et de la disponibilité de l’information à la sécurité des personnes, à la fiabilité, à la contrôlabilité et à la résilience des opérations. C’est pourquoi ce chapitre traite la sécurité des TO, de l’IdO et des systèmes cyberphysiques comme un domaine de gouvernance plutôt que comme une spécialité technique.

Ces environnements imposent aussi des contraintes que les TI conventionnelles affrontent rarement. Les actifs ont des cycles de vie de quinze à trente ans, une capacité de calcul limitée, des architectures propriétaires, des modèles de maintenance contrôlés par les fournisseurs, une journalisation sommaire et une faible prise en charge des contrôles de sécurité modernes. Certains ne peuvent recevoir de correctifs sans l’arrêt d’un procédé qui fonctionne jour et nuit. D’autres ont été conçus pour la fiabilité dans des contextes isolés, puis raccordés plus tard aux réseaux d’entreprise, aux plateformes infonuagiques et aux outils de soutien à distance sans avoir été repensés pour un contexte hostile. Améliorer la sécurité exige donc des décisions de gestion concernant les arrêts planifiés, le remplacement d’immobilisations, la renégociation avec les fournisseurs, les projets de segmentation, les investissements en surveillance, les fenêtres de maintenance et les contrôles compensatoires. Ces décisions comportent des compromis explicites entre le temps de disponibilité, la sécurité des personnes, le coût, la conformité et l’appétence pour le risque.

Ce chapitre s’appuie sur la matière vue précédemment. Le vocabulaire du risque du chapitre 4, la méthode des scénarios des chapitres 5 et 6, les pratiques d’opérations et de gestion des vulnérabilités des chapitres 7 et 8, les cadres de contrôles du chapitre 9 et les disciplines de l’identité du chapitre 10 s’appliquent tous ici, mais chacun doit être adapté à un environnement où la sécurité des personnes et la disponibilité l’emportent habituellement sur la confidentialité. La gestion des incidents et la continuité sont traitées en profondeur au chapitre 12, l’architecture de sécurité au chapitre 13, les bases de référence et la gouvernance de la configuration au chapitre 14, la gouvernance des fournisseurs au chapitre 19 et la cybersécurité de l’intelligence artificielle (IA) au chapitre 18; le présent chapitre y renvoie plutôt que de les répéter.

Le chapitre se déroule comme suit. Il définit d’abord ce que les gestionnaires devraient inclure dans la portée et explique en quoi le risque lié aux TO et à l’IdO diffère du risque lié aux TI. Il passe ensuite en revue le paysage normatif et réglementaire qui façonne désormais le domaine, de la série ISA/IEC 62443 et de la publication NIST SP 800-82 Rev. 3 jusqu’au règlement européen sur la cyberrésilience (CRA), à la directive NIS2, à la nouvelle législation canadienne sur les infrastructures essentielles et aux exigences relatives aux dispositifs médicaux. Le cœur du chapitre aborde les éléments constitutifs de la gouvernance : l’inventaire et la criticité, le modèle opérationnel, l’approvisionnement, l’architecture, la gouvernance des correctifs et des changements, ainsi que l’interaction entre la cybersécurité et l’ingénierie de la sécurité fonctionnelle. Il se termine par la détection, l’intervention et la résilience, les systèmes cyberphysiques dotés d’IA, les mesures et une mise en situation se déroulant dans un service municipal d’eau québécois, ainsi que par une synthèse des leçons du chapitre.

## Définitions et portée : ce que les gestionnaires devraient inclure dans les TO, l’IdO et les systèmes cyberphysiques

La terminologie varie selon les secteurs, les fournisseurs et les organismes de réglementation, mais un programme de gouvernance a besoin de limites claires. Les gestionnaires n’ont pas à maîtriser toutes les distinctions techniques. Ils doivent toutefois comprendre quels systèmes entrent dans la portée, pourquoi ces systèmes comportent des risques différents de ceux des TI d’entreprise ordinaires et qui devrait en être imputable. Une portée trop étroite laisse des angles morts dangereux; une portée trop large traite un écran de salle de conférence avec le même sérieux qu’un système de dosage du chlore et gaspille une attention qui est rare.

Technologie opérationnelle

La technologie opérationnelle (TO) désigne le matériel et les logiciels qui surveillent, commandent ou automatisent des processus physiques, des appareils et des infrastructures. La publication NIST SP 800-82 Rev. 3, Guide to Operational Technology (OT) Security (septembre 2023), a délibérément élargi l’ancien terme « systèmes de contrôle industriels » en celui de TO, afin de refléter l’omniprésence actuelle de ces systèmes. La catégorie comprend les systèmes SCADA (système de contrôle et d’acquisition de données), qui gèrent des actifs géographiquement dispersés comme les pipelines et les réseaux d’aqueduc; les systèmes de contrôle distribués (DCS) utilisés dans les usines de procédés continus; les automates programmables et les unités terminales distantes; les interfaces homme-machine (IHM) et les postes de travail d’ingénierie; les systèmes instrumentés de sécurité (SIS), qui ramènent un procédé à un état sûr lorsque des limites sont dépassées; les systèmes d’automatisation des bâtiments et de gestion de l’énergie; l’équipement de laboratoire et d’essai; et les systèmes de contrôle de l’accès physique.

La TO est courante dans la fabrication, l’énergie, l’eau potable et les eaux usées, le transport, la transformation alimentaire, l’industrie pharmaceutique, les mines, les établissements de santé, les universités et les entrepôts. Son objectif premier est l’exploitation fiable et sûre d’un processus physique, et non le traitement efficace de l’information. Cette seule différence explique une bonne partie de ce qui suit : un ingénieur en TO qui résiste à un correctif « urgent » ne fait généralement pas d’obstruction; il protège un processus dont la défaillance peut blesser des personnes ou endommager de l’équipement.

L’Internet des objets et l’Internet industriel des objets

L’Internet des objets (IdO) désigne des appareils connectés au réseau qui combinent au moins un capteur ou un actionneur avec une connectivité réseau, qui sont souvent embarqués et qui sont généralement déployés en grand nombre. Parmi les exemples, on compte les caméras IP, les lecteurs de cartes d’accès, les thermostats et l’éclairage intelligents, les capteurs environnementaux et de présence, les dispositifs médicaux connectés, les périphériques de point de vente, la télématique des parcs de véhicules, les traceurs d’actifs, les compteurs intelligents et les appareils grand public que le personnel apporte au travail. L’Internet industriel des objets (IIoT) applique le même modèle aux opérations : capteurs de vibration sans fil sur des pompes, compresseurs connectés au nuage et passerelles en périphérie qui transmettent en continu les données de l’usine à des plateformes d’analyse.

Certains appareils de l’IdO sont essentiels aux opérations; d’autres relèvent surtout de la commodité. Les deux catégories créent des risques, car les appareils non gérés deviennent des points d’entrée, des points de surveillance, des points d’exposition des données ou des passerelles vers des réseaux plus sensibles. Les appareils de l’IdO recueillent aussi fréquemment des renseignements personnels — vidéo, localisation, présence, données biométriques ou de santé —, ce qui fait entrer en jeu le droit relatif à la protection des renseignements personnels. Au Québec, la Loi 25 exige une évaluation des facteurs relatifs à la vie privée (EFVP) pour tout projet d’acquisition, de développement ou de refonte d’un système d’information ou d’un système de prestation électronique de services impliquant des renseignements personnels, ce qui inclut clairement le déploiement de caméras ou de capteurs de présence dans l’ensemble d’un bâtiment (voir le chapitre 16).

Systèmes cyberphysiques

Les systèmes cyberphysiques sont des systèmes intégrés dans lesquels des logiciels, des capteurs, des réseaux et des composants informatiques régissent un comportement physique, habituellement au moyen de boucles de rétroaction : détecter, calculer, agir, puis détecter de nouveau. Dans la plupart des cas, les environnements de TO constituent un sous-ensemble des systèmes cyberphysiques. La catégorie plus large comprend aussi les robots mobiles autonomes, les entrepôts automatisés, les véhicules connectés et la signalisation ferroviaire, les réseaux électriques intelligents, les robots chirurgicaux, les drones et les systèmes physiques dotés d’IA. Leur caractéristique déterminante est qu’une compromission ou une défaillance numérique peut modifier une action physique, des conditions physiques ou des résultats physiques.

Du point de vue de la gouvernance, l’étiquette importe moins que le profil de risque. Un gestionnaire pragmatique ne débat pas de la question de savoir si un refroidisseur en réseau relève de la « TO » ou de l’« IdO »; il se demande ce qui arrive si l’appareil s’arrête, fournit de fausses données ou reçoit des commandes de quelqu’un d’autre.

Tracer la limite de la portée

Les gestionnaires devraient inclure dans la portée tout appareil, système, plateforme ou intégration dont la compromission pourrait perturber les opérations, compromettre la sécurité des personnes, endommager l’équipement, nuire à l’environnement, exposer des renseignements sensibles, affaiblir la sécurité physique ou créer une voie d’accès non gérée vers l’entreprise — y compris l’équipement géré par des fournisseurs, les connexions de maintenance à distance et les technologies déployées directement par les services des installations ou par les unités d’affaires.

Un test pratique de portée pose une courte série de questions :

- Influence physique. Le système surveille-t-il ou commande-t-il un processus physique, un environnement ou un équipement?
- Conséquence. Une compromission ou une défaillance pourrait-elle toucher la sécurité des personnes, la continuité des services, la production, les installations, l’environnement, la situation réglementaire ou la confiance du public?
- Connectivité. L’appareil est-il connecté au réseau de l’entreprise, à Internet, à un modem cellulaire, au nuage d’un fournisseur ou à un outil d’accès à distance?
- Responsabilité. Est-il géré par les TI, l’ingénierie, le service des installations, un fournisseur, ou par aucun responsable clairement imputable?
- Gérabilité. Présente-t-il des faiblesses connues sur le plan du soutien au cycle de vie, de l’application des correctifs, de la journalisation, de l’authentification ou du contrôle d’accès?
- Données. Recueille-t-il ou transmet-il des renseignements personnels, des renseignements de santé ou des renseignements commercialement sensibles?
Une réponse affirmative aux deux premières questions place généralement un système dans le niveau à conséquences élevées. Une réponse affirmative aux questions sur la connectivité et la responsabilité, sans réponses claires, signale généralement la lacune de gouvernance la plus urgente. La figure ci-dessous résume les catégories que les gestionnaires devraient inclure.

Figure 53 : ce que les gestionnaires devraient inclure dans la portée des TO, de l’IdO et des systèmes cyberphysiques

La leçon pour les gestionnaires est que la gouvernance des TO, de l’IdO et des systèmes cyberphysiques commence par la visibilité. Les organisations ne peuvent pas gouverner ce qu’elles n’ont pas répertorié, classé, attribué à un responsable et relié à des conséquences d’affaires. Un programme mature définit une portée assez large pour saisir les conséquences opérationnelles et physiques, mais assez précise pour attribuer les responsabilités, établir la priorité des contrôles et éviter de traiter chaque appareil connecté comme s’il avait la même importance.

## En quoi le risque lié aux TO et à l’IdO diffère : priorités, contraintes et types de risques

La sécurité traditionnelle des TI d’entreprise met l’accent sur la confidentialité de l’information, l’intégrité des enregistrements et la disponibilité des applications d’affaires. Les interruptions sont coûteuses, mais dans la plupart des contextes de TI, la reprise se mesure en heures et les principales conséquences sont des pertes financières, des perturbations de la productivité, des atteintes à la vie privée, des préjudices à la réputation ou une exposition réglementaire. Les environnements de TO et d’IdO modifient ce profil d’une manière qui a des conséquences directes sur la gouvernance.

Des priorités différentes : la sécurité des personnes et la disponibilité d’abord

Dans les environnements opérationnels, la sécurité des personnes, la disponibilité du processus et l’intégrité de la commande ont généralement préséance sur la confidentialité. Le temps d’arrêt tolérable peut se mesurer en secondes ou en minutes, et les conséquences peuvent comprendre des dommages à l’équipement, la détérioration de produits, des rejets dans l’environnement, des incidents touchant la sécurité des personnes ou l’interruption de services publics essentiels. La publication NIST SP 800-82 Rev. 3 souligne que les systèmes de TO ont des exigences de performance, de fiabilité et de sécurité fonctionnelle fondamentalement différentes de celles des TI, et le guide international conjoint Principles of Operational Technology Cyber Security (2024), appuyé par le Centre canadien pour la cybersécurité, l’énonce sans détour dans son premier principe : la sécurité des personnes est primordiale.

Ces différences ne signifient pas que la confidentialité est sans importance. Les recettes de procédé, les schémas de réseau, les dessins techniques et les configurations des systèmes de sécurité ont de la valeur pour les attaquants précisément parce qu’ils révèlent comment causer des dommages; le même guide conjoint indique que les données de TO « doivent être protégées ». Mais l’ordre des priorités façonne presque chaque décision de contrôle, de l’intensité avec laquelle un réseau peut être balayé jusqu’à la personne qui peut autoriser l’isolement d’un système pendant un incident. La figure ci-dessous met en contraste les deux points de vue.

Figure 54 : en quoi les priorités des TI et des TO diffèrent

Cycles de vie, systèmes patrimoniaux et limites de l’application des correctifs

Les actifs de TO sont achetés comme des biens d’équipement, amortis sur des décennies et souvent certifiés ou validés pour une configuration précise. Un automate installé en 2008 peut encore faire fonctionner un processus critique en 2026, sur un système d’exploitation que son fournisseur a cessé de soutenir il y a des années. L’application d’un correctif peut exiger un arrêt planifié, la supervision du fournisseur, une nouvelle validation ou un avis aux autorités de réglementation. De nombreux appareils ne peuvent pas exécuter d’agents sur les terminaux, ne tolèrent pas le balayage actif et produisent peu de journaux utiles.

L’IdO ajoute l’échelle et l’hétérogénéité. Une même organisation peut exploiter des milliers d’appareils de dizaines de fabricants, avec de nombreuses versions de micrologiciel, des configurations par défaut faibles et des mécanismes de mise à jour incohérents. Certains appareils sont peu coûteux et faciles à déployer, mais difficiles à gérer dans le temps; d’autres deviennent discrètement importants pour les opérations, même s’ils ont été achetés par commodité. Il en résulte une vaste surface d’attaque que la gestion ordinaire des actifs de TI ne voit souvent pas. « Nous ne pouvons pas appliquer de correctif » décrit une contrainte; ce n’est pas une réponse de gouvernance. Cette constatation doit mener à une décision explicite à l’égard du risque, à des contrôles compensatoires et à un plan.

Une responsabilité fragmentée et un paysage des menaces différent

Les TO et l’IdO peuvent relever de l’ingénierie, de la fabrication, du service des installations, du génie biomédical, de la sécurité physique, des laboratoires ou des fournisseurs plutôt que des TI centrales. Cette fragmentation signifie que les personnes qui comprennent la menace et celles qui contrôlent l’équipement sont rarement les mêmes, et la gouvernance doit délibérément établir un pont entre elles (voir la section sur le modèle opérationnel ci-dessous).

Le paysage des menaces diffère aussi. Les environnements de TO font face à des rançongiciels opportunistes qui se propagent à partir des TI et forcent des arrêts préventifs, à des actes de sabotage ciblés commis par des acteurs compétents liés à des États, à l’utilisation abusive par des initiés, à la compromission de fournisseurs et d’intégrateurs, ainsi qu’à des erreurs de configuration accidentelles. Les environnements d’IdO font face à l’exploitation massive des identifiants par défaut, à des mécanismes de mise à jour faibles, à des infrastructures dorsales infonuagiques non sécurisées chez les fournisseurs et à des interfaces de gestion exposées. Les organisations canadiennes ne sont pas épargnées : dans l’alerte AL25-016 (octobre 2025), le Centre canadien pour la cybersécurité a signalé que des hacktivistes avaient altéré des systèmes de contrôle industriels accessibles par Internet, notamment en manipulant les valeurs de pression d’eau dans une installation de traitement de l’eau, une jauge de réservoir automatisée dans une entreprise pétrolière et gazière, ainsi que les niveaux de température et d’humidité d’un silo de séchage de grains dans une exploitation agricole. La base de connaissances ATT&CK for ICS de MITRE, mise à jour dans ATT&CK v20 (octobre 2026), répertorie les tactiques et techniques des adversaires propres aux environnements industriels et comprend maintenant des entrées de campagnes tirées d’attaques contre des services d’eau.

Dans les TO et l’IdO, le cyberrisque se mesure en conséquences physiques — préjudices aux personnes, à l’équipement, à l’environnement et aux services essentiels — et pas seulement en données perdues ou exposées.

Une taxonomie du risque cyberphysique à l’intention des gestionnaires

Bien que les détails techniques varient selon le secteur, un ensemble récurrent de types de risques se retrouve dans les environnements de TO, d’IdO et de systèmes cyberphysiques. Les nommer aide les gestionnaires à relier une compromission technique à ses conséquences opérationnelles, financières, réglementaires, réputationnelles et sur la sécurité des personnes, et cela donne aux scénarios de risque (chapitre 5) un vocabulaire cohérent.

- Perturbation opérationnelle et extorsion. Un rançongiciel, un logiciel malveillant destructeur ou la perte des systèmes de commande peut arrêter la production, mettre hors service les systèmes du bâtiment, perturber la logistique ou interrompre les services publics. La reprise ne consiste pas seulement à restaurer des serveurs; elle signifie rétablir une commande fiable d’un processus physique, ce qui peut exiger de valider l’état de l’équipement, de vérifier la logique de commande et de vérifier les fonctions de sécurité avant le redémarrage.
- Manipulation de l’intégrité. Les attaquants peuvent modifier les points de consigne, les lectures des capteurs, la logique de commande, les recettes, les données d’étalonnage ou les alarmes. Le système peut continuer de fonctionner tout en produisant des résultats dangereux, non conformes aux spécifications ou trompeurs; les attaques contre l’intégrité peuvent donc demeurer cachées jusqu’à ce que des dommages physiques, des défauts de qualité ou des conditions dangereuses apparaissent.
- Automatisation dangereuse. Une commande malveillante ou erronée peut désactiver des fonctions de protection, provoquer des collisions mécaniques, créer une surpression ou une surchauffe, ou déclencher un mouvement dangereux. C’est là que la cybersécurité doit rejoindre l’ingénierie de la sécurité fonctionnelle et l’analyse des dangers.
- Parcs d’appareils non gérés. Les grands déploiements de l’IdO comportant des mots de passe par défaut, des micrologiciels désuets et une dépendance envers le nuage des fournisseurs peuvent sembler individuellement à faible risque, mais ils créent collectivement une vaste surface d’attaque, une exposition à la surveillance et des voies latérales vers des zones sensibles.
- Risque lié aux fournisseurs et à l’accès à distance. Les fournisseurs, les intégrateurs et les partenaires de maintenance ont souvent besoin d’un accès à distance. Les voies d’accès permanentes, partagées, faiblement authentifiées ou non surveillées figurent parmi les points d’entrée les plus fréquents et ceux dont l’impact est le plus élevé.
- Abus des données, de l’analytique et des modèles. À mesure que la maintenance prédictive, l’optimisation, les jumeaux numériques et l’aide à la décision fondée sur l’IA font leur entrée dans les opérations, des données empoisonnées ou des modèles manipulés peuvent produire des recommandations dangereuses ou masquer de véritables problèmes.
- Perte de visibilité et d’imputabilité. Lorsque les inventaires, les journaux, l’attribution des responsabilités, la documentation et les configurations de référence sont incomplets, la direction ne peut pas établir la priorité de ce qu’elle ne voit pas ni donner l’assurance de ce qu’elle ne peut pas démontrer.
Un programme axé sur les gestionnaires n’a pas à traiter ces risques sur un pied d’égalité. Un fabricant alimentaire peut donner la priorité à la continuité de la production, à l’intégrité des recettes et à l’accès des fournisseurs. Un hôpital peut donner la priorité à la sécurité des dispositifs médicaux, aux contrôles environnementaux et à la continuité des soins aux patients. Un exploitant immobilier peut donner la priorité au contrôle d’accès, à la protection de la vie privée en matière de vidéosurveillance et aux plateformes gérées par des fournisseurs. Dans chaque cas, le risque doit être formulé en termes opérationnels : non pas « cet appareil peut-il être piraté? », mais « qu’arrive-t-il à notre personnel, à nos services, à nos actifs et à nos obligations si cet appareil, cette connexion, ce flux de données ou ce processus automatisé ne peut plus être considéré comme fiable? ». Exprimé au moyen du triangle du risque présenté au chapitre 4, le côté impact du triangle comprend désormais les préjudices physiques, et le côté vulnérabilité est souvent dominé par des faiblesses liées au cycle de vie et à l’attribution des responsabilités plutôt que par l’absence de contrôles techniques.

## Le paysage des normes et de la réglementation

Jusqu’à récemment, la sécurité des TO et de l’IdO était en grande partie volontaire, à l’exception de quelques secteurs réglementés comme l’électricité. Cela a changé. Un ensemble de normes internationales, d’orientations gouvernementales et de lois sur les produits et les infrastructures façonne maintenant les attentes des clients, des organismes de réglementation, des assureurs et des auditeurs. Les gestionnaires n’ont pas besoin de lire ces documents d’un bout à l’autre, mais ils doivent savoir lesquels s’appliquent, quel type d’obligation chacun crée et comment ils s’arriment au SGSI et aux cadres décrits au chapitre 9.

ISA/IEC 62443 : la série de référence pour l’automatisation industrielle

La série ISA/IEC 62443, Security for industrial automation and control systems, est la référence internationale la plus utilisée en matière de sécurité des TO. Sa contribution distinctive est d’attribuer des responsabilités aux trois principales parties de l’écosystème des TO — les propriétaires d’actifs, les fournisseurs de services et intégrateurs, et les fournisseurs de produits — et de définir des exigences pour chacune. La série est organisée en quatre groupes :

- Généralités (62443-1-x). Concepts et modèles, y compris les notions de zones, de conduits et de niveaux de sécurité (la spécification IEC TS 62443-1-1, publiée pour la première fois en 2009, est en cours de révision).
- Politiques et procédures (62443-2-x). La norme IEC 62443-2-1:2024 (édition 2.0) établit les exigences relatives au programme de sécurité des propriétaires d’actifs — en somme, l’équivalent en TO d’un SGSI. La norme IEC 62443-2-4 (édition 2.0, 2023) établit les exigences applicables aux fournisseurs de services comme les intégrateurs et les entreprises de maintenance, et le rapport technique IEC TR 62443-2-3:2015 traite de la gestion des correctifs dans l’environnement de TO.
- Système (62443-3-x). La norme IEC 62443-3-2:2020 décrit l’évaluation des risques de sécurité et la conception des systèmes, y compris la façon de diviser un système en zones et en conduits et d’attribuer des niveaux de sécurité cibles. La norme IEC 62443-3-3:2013 précise les exigences de sécurité des systèmes au regard de sept exigences fondamentales, du contrôle de l’identification et de l’authentification jusqu’à la disponibilité des ressources.
- Composant (62443-4-x). La norme IEC 62443-4-1:2018 établit les exigences relatives au cycle de vie de développement sécurisé des produits pour les fournisseurs, et la norme IEC 62443-4-2:2019 établit les exigences techniques de sécurité applicables aux composants comme les automates, les équipements réseau et les logiciels hôtes.
La notion de niveaux de sécurité (SL 1 à SL 4) est particulièrement utile aux gestionnaires. Elle exprime la protection en fonction de l’attaquant auquel le système doit résister, de la violation occasionnelle ou accidentelle jusqu’aux attaquants sophistiqués disposant de ressources importantes. Fixer un niveau de sécurité cible pour chaque zone constitue donc une décision relevant de l’appétence pour le risque, et non une préférence technique. Des programmes d’évaluation de la conformité, dont ISASecure et le programme de l’IECEE, permettent de certifier des produits, des processus de développement et des fournisseurs de services au regard de certaines parties de la série, ce qui offre aux équipes d’approvisionnement une source d’éléments probants. Plusieurs parties étaient en cours de révision au moment de la rédaction; les gestionnaires devraient donc confirmer les éditions en vigueur lorsqu’ils rédigent des clauses contractuelles.

La publication NIST SP 800-82 et les orientations du NIST sur l’IdO

La publication NIST SP 800-82 Rev. 3 (septembre 2023) est le principal guide du gouvernement des États-Unis sur la sécurité des TO. Elle explique les architectures et les menaces propres aux TO, décrit la façon d’établir un programme de sécurité des TO et fournit une superposition (overlay) des contrôles de la publication NIST SP 800-53 Rev. 5 adaptée aux TO. En septembre 2026, le NIST a publié une première ébauche publique de la révision 4 aux fins de commentaires. L’ébauche réorganise les orientations autour du NIST CSF 2.0 et de sa fonction Gouverner, rattache plus étroitement la gestion des risques liés aux TO à la gestion des risques d’entreprise, intègre des principes de vérification systématique adaptés aux TO et élargit les secteurs couverts pour inclure l’automatisation des bâtiments, l’eau potable et les eaux usées, l’alimentation et l’agriculture, ainsi que l’Internet industriel des objets. Tant que la révision 4 n’est pas définitive, la Rev. 3 demeure la référence en vigueur.

Pour l’IdO, le NIST a élaboré deux points de vue complémentaires. La série NIST IR 8259 s’adresse aux fabricants : la publication NIST IR 8259 Rev. 1, Foundational Cybersecurity Activities for IoT Product Manufacturers (avril 2026), décrit ce que les fabricants devraient faire avant et après la vente, tandis que les publications NIST IR 8259A et 8259B définissent des bases de référence essentielles relatives aux capacités techniques des appareils (comme l’identité de l’appareil, la mise à jour sécurisée et la protection des données) et aux capacités de soutien non techniques (comme la documentation et l’information sur les vulnérabilités). Les publications SP 800-213 s’adressent aux organisations qui achètent et déploient des appareils de l’IdO : la SP 800-213 (2021) et son catalogue d’exigences, la SP 800-213A, guident les organismes fédéraux américains dans l’établissement des exigences relatives aux appareils, et les deux sont en cours de révision — une ébauche de la SP 800-213 Rev. 1, dont le titre est désormais axé sur les produits de l’IdO, a été publiée en juin 2026. Même en dehors du secteur public, ces documents offrent aux gestionnaires un vocabulaire tout prêt pour formuler des exigences d’approvisionnement.

Le droit de la sécurité des produits : le règlement européen sur la cyberrésilience et l’IdO grand public

L’évolution réglementaire la plus importante pour les produits connectés est le règlement sur la cyberrésilience (CRA) de l’Union européenne, le règlement (UE) 2024/2847. Il s’applique aux « produits comportant des éléments numériques » mis sur le marché de l’Union européenne, ce qui couvre la plupart du matériel et des logiciels connectés, y compris de nombreux produits industriels et de l’IdO. Il est entré en vigueur le 10 décembre 2024 et s’applique par étapes : les dispositions relatives aux organismes d’évaluation de la conformité à compter du 11 juin 2026; les obligations des fabricants de signaler les vulnérabilités activement exploitées et les incidents graves à compter du 11 septembre 2026; et les principales obligations — exigences essentielles de cybersécurité, traitement des vulnérabilités, période de soutien définie, documentation technique et marquage CE — à compter du 11 décembre 2027. Les signalements passent par la plateforme unique de signalement de l’ENISA, selon un calendrier comprenant une alerte précoce dans les 24 heures, une notification dans les 72 heures et un rapport final. Les produits classés comme « importants » ou « critiques » sont soumis à une évaluation de la conformité plus stricte.

Les fabricants canadiens qui vendent en Europe doivent s’y conformer directement, tandis que les acheteurs en profitent indirectement à mesure que les fournisseurs font des nomenclatures logicielles, des périodes de soutien déclarées et du traitement des vulnérabilités une pratique courante; le chapitre 19 traite de ces effets sur la chaîne d’approvisionnement. Parallèlement au CRA, l’acte délégué de l’Union européenne sur la cybersécurité pris en vertu de la directive sur les équipements radioélectriques (règlement délégué (UE) 2022/30) s’applique depuis le 1er août 2025 aux équipements radioélectriques connectés à Internet, avec l’appui des normes harmonisées EN 18031. Pour l’IdO grand public, la norme ETSI EN 303 645 (version actuelle V3.1.3, 2024) établit des dispositions de base comme l’absence de mots de passe par défaut universels, une politique de divulgation des vulnérabilités et la mise à jour des logiciels; elle sous-tend le régime de sécurité des produits du Royaume-Uni et de nombreuses étiquettes de certification. Les gestionnaires qui achètent des appareils pour les milieux de travail peuvent s’en servir comme exigence minimale, même lorsque ces appareils sont commercialisés pour les consommateurs.

La réglementation des infrastructures essentielles : NIS2, la LPCE du Canada et les règles sectorielles

La directive NIS2 de l’Union européenne, la directive (UE) 2022/2555, étend les obligations de gestion des risques de cybersécurité et de signalement des incidents aux entités essentielles et importantes de secteurs qui comprennent l’énergie, les transports, la santé, l’eau potable, les eaux usées, la fabrication de dispositifs médicaux et d’autres produits, ainsi que l’alimentation. Les États membres devaient la transposer au plus tard le 17 octobre 2024, mais beaucoup l’ont fait en retard; en mai 2025, la Commission européenne a adressé des avis motivés à 19 États membres pour transposition incomplète. La directive NIS2 se distingue en rendant les organes de direction responsables de l’approbation et de la surveillance des mesures de cybersécurité, ce qui renforce le thème de la gouvernance de ce manuel.

Au Canada, le projet de loi C-8 a reçu la sanction royale en juin 2026, édictant la Loi sur la protection des cybersystèmes essentiels (LPCE) et modifiant la Loi sur les télécommunications. La LPCE exigera des exploitants désignés des secteurs sous réglementation fédérale — finances, télécommunications, énergie et transports — qu’ils établissent des programmes de cybersécurité, gèrent les risques liés à la chaîne d’approvisionnement et aux tiers et signalent les incidents importants. Ses dispositions entrent en vigueur par étapes; les organisations devraient donc suivre les règlements à mesure qu’ils sont publiés. Une grande partie des TO échappe toutefois à la compétence fédérale. Les réseaux municipaux d’eau, les entreprises de transformation alimentaire et la plupart des fabricants ne sont pas visés par la LPCE, et l’alerte AL25-016 du Centre pour la cybersécurité a explicitement encouragé les provinces et les territoires à se coordonner avec les municipalités et les organisations de secteurs comme l’eau, l’alimentation et la fabrication, où la cybersécurité n’est pas encadrée par la réglementation. Des règles sectorielles s’appliquent aussi; par exemple, les exploitants de réseaux de transport d’électricité sont généralement assujettis aux normes de fiabilité CIP (Critical Infrastructure Protection) de la NERC adoptées par les organismes de réglementation provinciaux.

Dispositifs médicaux : la FDA et Santé Canada

Les dispositifs médicaux connectés sont des systèmes cyberphysiques dans lesquels une compromission peut toucher directement la sécurité des patients. Aux États-Unis, l’article 524B de la Federal Food, Drug, and Cosmetic Act, en vigueur depuis mars 2023, oblige les fabricants de « cyberdispositifs » à inclure de l’information sur la cybersécurité dans leurs demandes préalables à la mise en marché, y compris un plan de surveillance et de traitement des vulnérabilités après la mise en marché et une nomenclature logicielle (SBOM). Le guide de la FDA Cybersecurity in Medical Devices: Quality Management System Considerations and Content of Premarket Submissions a été publié de nouveau, dans sa plus récente version, le 3 février 2026, afin de l’aligner sur le nouveau règlement de l’organisme relatif au système de gestion de la qualité (Quality Management System Regulation). Au Canada, la ligne directrice de Santé Canada Exigences préalables à la mise en marché relatives à la cybersécurité des instruments médicaux (en vigueur depuis juin 2019) attend des fabricants d’instruments comportant des logiciels qu’ils traitent de la conception sécurisée, de la gestion des risques, des essais et d’un plan couvrant la durée de vie utile de l’instrument, et demande une nomenclature de cybersécurité dans l’étiquetage.

Pour les gestionnaires d’hôpitaux, la conséquence pratique est que l’approvisionnement peut et doit exiger ces éléments probants. Un hôpital ne conçoit pas les dispositifs, mais il décide quels dispositifs il achète, comment ils sont mis en réseau et qui en est imputable une fois qu’ils sont installés.

Orientations gouvernementales et connaissance des menaces

Les organismes gouvernementaux ont produit un ensemble considérable d’orientations gratuites et pratiques sur les TO, souvent de façon conjointe. Le Centre canadien pour la cybersécurité publie Protéger votre technologie opérationnelle (ITSAP.00.051) et a cosigné des orientations internationales, dont Principles of Operational Technology Cyber Security (2024), Foundations for OT Cybersecurity: Asset Inventory Guidance for Owners and Operators (août 2025) et Secure Connectivity Principles for Operational Technology (janvier 2026). La CISA et ses partenaires ont publié Secure by Demand: Priority Considerations for Operational Technology Owners and Operators when Selecting Digital Products (janvier 2025), qui énumère les fonctions de sécurité auxquelles les acheteurs de TO devraient accorder la priorité lors du choix des produits. MITRE ATT&CK for ICS soutient une défense éclairée par la connaissance des menaces en faisant correspondre les techniques des adversaires aux moyens de détection et d’atténuation.

Le tableau ci-dessous résume la façon dont les gestionnaires peuvent utiliser les principales références.

Référence

Type

Public principal

Utilisation par la direction

Série ISA/IEC 62443

Norme consensuelle

Propriétaires d’actifs, intégrateurs, fournisseurs

Exigences relatives au programme, aux zones et à l’approvisionnement

NIST SP 800-82 Rev. 3

Guide gouvernemental

Propriétaires d’actifs de TO

Conception du programme et superposition de contrôles

NIST IR 8259 / SP 800-213

Guide gouvernemental

Fabricants et acheteurs d’appareils de l’IdO

Exigences relatives aux capacités des appareils

CRA de l’UE et ETSI EN 303 645

Loi et norme

Fabricants de produits

Éléments probants des fournisseurs et périodes de soutien

NIS2 et LPCE du Canada

Législation

Exploitants d’infrastructures essentielles

Imputabilité du conseil et signalement

Orientations de la FDA et de Santé Canada

Orientations réglementaires

Fabricants de dispositifs médicaux

Éléments probants pour l’approvisionnement hospitalier

Orientations conjointes du Centre pour la cybersécurité et de la CISA

Orientations gouvernementales

Propriétaires et exploitants

Priorités pratiques et bases de référence

La leçon pour les gestionnaires est que les normes et les lois ne remplacent pas le jugement sur les risques, mais qu’elles définissent ce qui est désormais considéré comme « raisonnable ». Une organisation qui ne peut pas montrer comment son programme de TO se rattache à la série ISA/IEC 62443 ou à la publication NIST SP 800-82, ou qui achète des appareils connectés sans demander les éléments probants que le CRA et la FDA exigent maintenant des fabricants, aura plus de mal à défendre ses décisions.

## Fondements de la gouvernance : inventaire, criticité et ce qui ne doit pas tomber en panne

Le principe de visibilité est facile à énoncer, mais difficile à concrétiser. De nombreuses organisations ne disposent pas d’un inventaire fiable de leurs systèmes opérationnels et de leurs appareils connectés, en particulier lorsque des équipes locales achètent de l’équipement de façon indépendante, que les équipes des installations gèrent les technologies du bâtiment, que des fournisseurs installent des appareils dans le cadre de contrats de service ou que les équipes d’ingénierie entretiennent des actifs en dehors des processus des TI. Cette invisibilité est un échec de gouvernance, et non un simple inconvénient technique, car un risque ne peut pas avoir de responsable, être priorisé, surveillé ou accepté si les actifs en cause sont inconnus.

Établir un inventaire des actifs et des dépendances

Un programme efficace tient un inventaire des actifs et des dépendances adapté aux TO, à l’IdO et aux systèmes cyberphysiques. Le guide conjoint Foundations for OT Cybersecurity: Asset Inventory Guidance (2025) recommande d’aller au-delà d’une liste d’appareils pour établir une taxonomie structurée et priorisée des actifs, assortie des attributs qui comptent pour les décisions relatives aux risques. Pour les gestionnaires, l’inventaire devrait permettre de répondre aux questions suivantes :

- Ce qui existe et où. Types d’appareils, modèles, emplacements, et le processus ou service que chacun soutient.
- Qui est imputable. Un responsable métier qui accepte le risque et un dépositaire technique qui entretient l’actif.
- Comment il est soutenu. Fournisseur, contrat de soutien, version du micrologiciel ou du logiciel lorsque c’est faisable, et dates annoncées de fin de soutien.
- Comment il est connecté. Zone réseau, voies de communication, voies d’accès à distance, liaisons sans fil et cellulaires, et dépendances envers des services infonuagiques ou des services de fournisseurs.
- Ce dont il dépend. Systèmes en amont et en aval, services publics, pièces de rechange et compétences spécialisées.
L’établissement d’un tel inventaire en TO exige de la prudence. Un balayage actif agressif peut perturber des appareils fragiles; les organisations combinent donc généralement la surveillance passive du réseau, l’examen des fichiers de configuration, les inspections physiques sur le terrain, les dossiers d’approvisionnement et de maintenance et la documentation des fournisseurs. L’inventaire n’est jamais terminé; il doit être tenu à jour au moyen de la gestion du changement et de l’approvisionnement, afin que les nouveaux appareils y soient inscrits par défaut plutôt qu’à la faveur d’un audit. Le chapitre 14 traite de la gouvernance de la configuration, qui repose sur ce fondement.

Cartographie de la criticité et conséquences

L’étape suivante est la cartographie de la criticité. En TI, la criticité est souvent définie par la sensibilité des données ou l’importance de l’application. En TO et dans les systèmes cyberphysiques, la criticité est définie principalement par la conséquence : quels systèmes, s’ils étaient perturbés, manipulés ou rendus non fiables, pourraient causer des incidents touchant la sécurité des personnes, des dommages à l’environnement, des arrêts de production, l’interruption de services essentiels, des pertes financières importantes, des mesures d’application de la réglementation ou une perte de confiance du public. Cette approche axée sur les conséquences part des pires résultats crédibles et remonte jusqu’aux systèmes qui pourraient les produire.

La cartographie de la criticité éclaire directement la gouvernance. Les systèmes qui soutiennent des fonctions de sécurité, des opérations essentielles, des processus réglementés ou des revenus importants devraient faire l’objet de contrôles minimaux plus robustes, d’une gestion du changement plus stricte, d’une gouvernance plus serrée de l’accès des fournisseurs, d’une surveillance accrue et d’une planification de la reprise plus rigoureuse. Les appareils de moindre criticité peuvent être gouvernés au moyen de contrôles proportionnés, à condition qu’ils ne puissent pas devenir des voies d’accès vers des zones de criticité plus élevée. Les niveaux de criticité servent aussi de fondement aux exigences d’approvisionnement, aux délais d’application des correctifs et aux niveaux de sécurité cibles abordés plus loin.

Définir ce qui ne doit pas tomber en panne

Les gestionnaires devraient aussi définir « ce qui ne doit pas tomber en panne » en termes opérationnels. Cette définition sert de point d’ancrage de la continuité pour l’ensemble du programme. L’organisation devrait déterminer les processus, les fonctions de sécurité, les capacités de commande, les procédures manuelles et les points de décision qui doivent demeurer fiables même en situation de cyberstress. Un fabricant peut avoir besoin avant tout d’une capacité d’arrêt sécuritaire; un hôpital peut avoir besoin des contrôles environnementaux, des gaz médicaux et de l’accès à l’équipement clinique critique; une entreprise de logistique peut avoir besoin de l’automatisation de ses entrepôts, de la visibilité sur son parc de véhicules et du contrôle d’accès; un service municipal d’eau doit maintenir le traitement dans les limites réglementaires et maintenir la pression dans le réseau de distribution.

Cette définition façonne l’architecture et les investissements. Elle éclaire les priorités de segmentation, les stratégies de sauvegarde et de reprise, les procédures manuelles de repli, les exigences de surveillance, les attentes en matière de soutien des fournisseurs, la planification des pièces de rechange, la communication de crise et les seuils de remontée. Elle aide aussi les dirigeants à comprendre que certains systèmes doivent être protégés non pas parce qu’ils contiennent des données sensibles, mais parce que l’organisation ne peut pas fonctionner de façon sûre ou légale sans eux. La sécurité des TO ne peut pas commencer par les outils; elle commence par la connaissance de ce qui existe, de qui en est responsable, de la façon dont c’est connecté, de son degré de criticité et de ce qui doit continuer de fonctionner dans des conditions défavorables.

## Modèle opérationnel et imputabilité : rapprocher les TI, l’ingénierie, les installations et les fournisseurs

Les programmes de sécurité des TO, de l’IdO et des systèmes cyberphysiques échouent souvent parce que l’imputabilité n’est pas claire. Les ingénieurs en TO sont responsables de la disponibilité, de la fiabilité et de la sécurité des personnes, mais peuvent ne pas considérer la cybersécurité comme faisant partie de leur mandat. Le CSI est responsable de la politique de cybersécurité, mais peut ne pas avoir le pouvoir de modifier l’équipement d’usine, les systèmes du bâtiment, les appareils de laboratoire ou les automates. Les équipes des installations se procurent des systèmes connectés sans examen de cybersécurité. Les fournisseurs conservent des accès privilégiés de maintenance sans surveillance ni contrôle contractuel. Dans un tel environnement, la politique ne peut pas être appliquée à moins que l’organisation ne définisse un modèle opérationnel explicite.

Quatre niveaux de responsabilité

Un modèle opérationnel mature précise qui est responsable du risque, qui établit les exigences, qui exploite les contrôles, qui approuve les exceptions et qui fournit l’assurance. La norme IEC 62443-2-1:2024 présente ces éléments comme faisant partie du programme de sécurité d’un propriétaire d’actifs; le point essentiel pour les gestionnaires est qu’aucune équipe ne peut les assumer seule. Au minimum, le modèle devrait définir quatre niveaux de responsabilité :

- Les responsables métier et opérationnels sont imputables du risque opérationnel dans leurs domaines. Ils comprennent quels processus sont critiques, ce que signifie une interruption, quelles conséquences sur la sécurité des personnes ou les services sont inacceptables et quels compromis sont réalisables. Ils doivent participer à l’acceptation du risque, en particulier lorsque des contrôles de cybersécurité pourraient toucher la disponibilité, la sécurité des personnes, la production, les soins aux patients ou la continuité des services.
- La direction des TO, de l’ingénierie et des installations est imputable de l’intégrité opérationnelle et de conditions d’exploitation sûres. Cela comprend les aspects pertinents sur le plan cyber de la logique de commande, de la configuration, des pratiques de maintenance, des fenêtres de changement, du déploiement des appareils, de l’accès physique à l’équipement et des activités des fournisseurs. Ces équipes comprennent mieux que les TI centrales les conséquences des changements techniques; leur participation est donc essentielle.
- La direction de la cybersécurité et des TI définit les exigences minimales et fournit l’expertise. Elle établit les architectures de référence, les principes de segmentation, les règles relatives aux identités et aux accès, les attentes en matière de surveillance, les interfaces d’intervention en cas d’incident et les activités d’assurance adaptées aux contraintes des TO. La fonction de sécurité doit agir comme partenaire de conception plutôt que comme critique externe qui n’arrive que pour relever des lacunes.
- L’approvisionnement et la gestion des fournisseurs sont imputables du contrôle contractuel. Ils veillent à ce que les contrats et les processus d’achat intègrent les conditions d’accès à distance, l’authentification, les attentes relatives aux correctifs et aux mises à niveau, la journalisation, l’avis de vulnérabilités et d’incidents, les engagements de fin de vie et les droits d’audit ou d’assurance.
De nombreuses organisations officialisent cette structure au moyen d’un rôle de responsable de la sécurité des TO, ou de « CSI des TO », situé entre l’ingénierie et la cybersécurité, avec un lien hiérarchique fonctionnel vers les deux. Le titre importe moins que le mandat : quelqu’un doit pouvoir parler à la fois le langage de la sécurité des procédés et celui du renseignement sur les menaces, et avoir le pouvoir de réunir les deux.

Des droits décisionnels établis avant la crise

Le modèle opérationnel doit se traduire par des droits décisionnels explicites convenus avant un incident. L’organisation devrait pouvoir répondre par écrit à des questions comme les suivantes :

- Qui approuve l’accès à distance d’un fournisseur de TO, et pour combien de temps?
- Qui peut autoriser l’isolement d’urgence d’un réseau de TO ou d’une cellule d’usine pendant une attaque, et qui doit être consulté au préalable?
- Qui décide de reporter l’application d’un correctif en raison de contraintes de disponibilité ou de sécurité des personnes, et qui accepte le risque résiduel qui en découle?
- Qui accepte le risque lié à un automate qui n’est plus soutenu et qui ne peut pas être remplacé au cours du présent exercice budgétaire?
- Qui est imputable lorsqu’une unité d’affaires déploie des appareils de l’IdO qui créent une voie d’intrusion?
- Qui détermine le moment où les opérations peuvent reprendre en toute sécurité après un incident?
Sans réponses explicites, les organisations se rabattent par défaut sur les retards, la négociation informelle et la dilution de la responsabilité. En temps normal, cela crée des exceptions non gérées et des contrôles incohérents. Pendant un incident, cela crée de la confusion quant à l’autorité et à l’impact opérationnel acceptable : l’équipe de sécurité veut isoler un système, les opérations craignent une perte de production, un fournisseur exige un accès à distance que personne ne peut vérifier, et la haute direction réclame une reprise rapide alors que les ingénieurs insistent sur une validation minutieuse. Une matrice RACI couvrant ces décisions, approuvée par le comité des risques de la haute direction, est l’un des livrables les plus utiles et les moins coûteux qu’un programme de TO puisse produire.

Routines de gouvernance et trois lignes

Un modèle opérationnel mature a également besoin de routines : un comité ou un groupe de travail sur les risques liés aux TO et à l’IdO, des procédures conjointes d’examen des changements, des revues périodiques des accès des fournisseurs, des revues des exceptions touchant les actifs critiques, des exercices interfonctionnels et une reddition de comptes régulière au comité des risques de la haute direction et au conseil d’administration. Dans le modèle des trois lignes, les équipes opérationnelles et d’ingénierie forment, avec la cybersécurité, la première ligne, qui est responsable des contrôles et les exploite; la gestion des risques d’entreprise, la sécurité des personnes et la conformité assurent la surveillance et la remise en question de deuxième ligne; et l’audit interne fournit une assurance indépendante, idéalement avec l’accès à une expertise en TO. Le but n’est pas la bureaucratie. Il s’agit de faire en sorte que les décisions de cybersécurité qui touchent les opérations physiques soient prises par des personnes qui ont l’autorité et l’information nécessaires pour les prendre, et que ces décisions laissent des éléments probants.

Une bonne gouvernance des TO rend la responsabilité visible, les droits décisionnels explicites, les exceptions vérifiables et l’imputabilité exécutoire — avant que le premier incident les mette à l’épreuve.

## Politique et approvisionnement : maîtriser le risque avant le déploiement des appareils

Dans les environnements de TO et d’IdO, le levier de gouvernance est le plus fort avant que les appareils soient achetés, connectés et intégrés aux opérations. Après le déploiement, les options sont limitées par la conception du fournisseur, les architectures propriétaires, les réalités de l’installation, les calendriers de production, la validation de la sécurité fonctionnelle et le coût des perturbations. Un appareil qui ne peut pas être corrigé, surveillé, authentifié, segmenté ou retiré de façon sûre peut créer un risque pendant vingt ans. L’approvisionnement n’est donc pas qu’une fonction d’achat; c’est un contrôle de cybersécurité de premier plan. Le guide Secure by Demand destiné aux propriétaires de TO, mené par la CISA, avance le même argument : les acheteurs qui demandent systématiquement des fonctions de sécurité changent ce que les fournisseurs conçoivent.

Exigences minimales par niveau

Les gestionnaires devraient définir des exigences minimales de cybersécurité pour les achats de TO et d’IdO, modulées selon des niveaux de criticité. Un automate lié à la sécurité des personnes, un dispositif médical, un système de contrôle d’accès ou un robot de chaîne de production ne devrait pas être soumis aux mêmes exigences qu’un appareil de commodité à faible risque. La criticité devrait déterminer la robustesse attendue de l’authentification, de la journalisation, de la capacité de mise à jour, du soutien du fournisseur, de la compatibilité avec la segmentation et des éléments probants d’assurance. Les références existantes facilitent la tâche : les exigences relatives aux composants de la norme IEC 62443-4-2 et les niveaux de sécurité cibles pour les produits industriels, les capacités de la publication NIST IR 8259A et la publication SP 800-213A pour les appareils de l’IdO, la norme ETSI EN 303 645 pour les appareils grand public, et les demandes présentées à la FDA ou à Santé Canada pour les dispositifs médicaux.

Les exigences minimales types comprennent les suivantes :

- Aucun identifiant par défaut ou partagé. Des identifiants uniques pour chaque appareil, la possibilité de les modifier et l’intégration au système central de gestion des identités lorsque c’est faisable.
- Des mises à jour sécurisées et soutenues. Des mécanismes de mise à jour authentifiés, une période de soutien déclarée et des engagements du fournisseur quant à la correction des vulnérabilités et au préavis avant la fin du soutien.
- Durcissement et compatibilité avec la segmentation. La possibilité de désactiver les services inutiles, d’utiliser des protocoles sécurisés et de fonctionner derrière des pare-feu ou dans des zones définies sans perte de fonctionnalité.
- Journalisation et visibilité. L’exportation des événements ou, à tout le moins, un comportement réseau observable par les outils de surveillance.
- Transparence. Une SBOM, une politique de divulgation des vulnérabilités et, pour les produits industriels, des éléments probants d’un cycle de vie de développement sécurisé, comme une certification au regard de la norme IEC 62443-4-1.
Gérabilité tout au long du cycle de vie et coût total

L’approvisionnement devrait aussi évaluer la gérabilité tout au long du cycle de vie. L’organisation devrait se demander si l’appareil peut être inventorié, configuré de façon sécurisée, mis à jour, surveillé, sauvegardé, rétabli et mis hors service sans laisser de données derrière lui. Un appareil qui semble peu coûteux à l’achat peut devenir onéreux s’il exige une administration manuelle, une maintenance que seul le fournisseur peut effectuer, un accès à distance non sécurisé ou un remplacement avant la fin de sa vie opérationnelle parce que le fournisseur cesse de le soutenir. Le coût total de possession devrait donc comprendre la maintenance de la sécurité, la surveillance, l’application des correctifs, le soutien et, à terme, l’élimination sécurisée. Le chapitre 17 explique comment présenter ces coûts dans les décisions d’investissement.

L’examen de l’architecture devrait être intégré au processus d’achat. Avant la signature d’un contrat, la cybersécurité et l’ingénierie des TO devraient confirmer l’emplacement du nouveau système dans le modèle de zones, les éléments avec lesquels il doit communiquer et la façon dont les fournisseurs le soutiendront. Les décisions prises à cette étape coûtent peu; après l’installation, elles sont coûteuses et perturbatrices.

Contrats et obligations des fournisseurs

Les contrats sont tout aussi importants. Les ententes avec les fournisseurs et les intégrateurs devraient définir les obligations de divulgation et d’avis des vulnérabilités, les délais de correction, l’avis d’incident, les délais de préavis de fin de vie et de fin de soutien, les attentes en matière de journalisation et d’éléments probants, le traitement des données (y compris l’endroit où le nuage des fournisseurs stocke les données opérationnelles ou personnelles), les conditions d’accès à distance, les responsabilités des sous-traitants et les droits d’audit ou d’assurance. La norme IEC 62443-2-4 fournit un catalogue structuré des capacités de sécurité que les propriétaires d’actifs peuvent exiger des intégrateurs et des fournisseurs de services de maintenance, et une certification au regard de cette norme constitue un élément probant. La gouvernance de la chaîne d’approvisionnement dans son ensemble fait l’objet du chapitre 19.

Pour les fournisseurs de TO, l’accès à distance est souvent le principal facteur de risque. L’accès aux fins de maintenance peut être nécessaire, mais il ne doit pas devenir une voie d’accès permanente et invisible vers les systèmes critiques. Les contrats et les processus de gestion des fournisseurs devraient exiger que l’accès à distance soit approuvé pour chaque session ou pour une fenêtre définie, fortement authentifié au moyen de l’authentification multifacteur, acheminé par un point d’accès contrôlé plutôt que par un modem installé par le fournisseur, limité à des actifs et à des fins définis, journalisé et, pour les systèmes à conséquences élevées, surveillé ou enregistré en temps réel.

Les appareils que nous ne pouvons pas gérer : des exceptions à échéance

La politique doit également définir la façon de traiter les appareils qui ne peuvent pas satisfaire aux exigences minimales — systèmes patrimoniaux, instruments spécialisés ou produits pour lesquels il n’existe aucune solution de rechange conforme. La position pratique devrait être la suivante : les appareils que nous ne pouvons pas gérer exigent une approbation explicite. Chaque exception devrait préciser la justification d’affaires, le responsable imputable du risque, les contrôles compensatoires (isolement, accès restreint des fournisseurs, surveillance supplémentaire, protection physique, repli manuel), la date d’échéance et l’événement déclencheur de la revue. Les exceptions à échéance obligent l’organisation à revoir ses décisions à mesure que les conditions changent, conformément à la rigueur en matière d’exceptions décrite au chapitre 14.

Un parc d’appareils non gérés est un choix de gouvernance. Le pire scénario consiste à découvrir, après une compromission, des appareils dont personne n’est responsable, que personne ne surveille, que personne ne peut corriger ou que personne ne sait comment retirer de façon sûre.

## Architecture : zones, conduits, moindre privilège et présomption de compromission

Les gestionnaires n’ont pas à concevoir des réseaux de TO ni à configurer des pare-feu industriels. Ils devraient toutefois comprendre les principes architecturaux qui déterminent l’ampleur des dommages qu’une compromission peut causer, car ces principes orientent des décisions d’investissement majeures. Trois thèmes sont centraux : la segmentation au moyen de zones et de conduits, le moindre privilège et la présomption de compromission. Ensemble, ils détournent la gouvernance de l’idéal irréaliste d’une prévention parfaite pour l’orienter vers un impact circonscrit et une exploitation sûre en situation de stress. Le chapitre 13 traite de l’architecture de sécurité de façon plus générale.

La segmentation au moyen de zones et de conduits

La segmentation est fondamentale. Les réseaux de TO, les systèmes du bâtiment, l’équipement de laboratoire, les systèmes de sécurité physique et les parcs d’appareils de l’IdO ne devraient pas se trouver sur des réseaux plats librement connectés aux TI de l’entreprise, au Wi-Fi des invités, au nuage des fournisseurs ou à Internet. La segmentation limite le rayon d’impact d’une compromission; c’est elle qui empêche un courriel d’hameçonnage reçu au service des finances de se transformer en arrêt de l’usine. Le guide conjoint Principles of OT Cyber Security fait de la segmentation et de la séparation des TO de tous les autres réseaux un principe fondamental, et l’alerte AL25-016 du Centre pour la cybersécurité commence ses conseils en demandant aux exploitants d’éliminer l’exposition inutile des systèmes de commande à Internet.

La norme ISA/IEC 62443-3-2 fait de la segmentation une méthode de gouvernance grâce aux concepts de zones et de conduits. Une zone est un regroupement d’actifs qui partagent des exigences de sécurité et des conséquences communes — par exemple, un système instrumenté de sécurité, une cellule de production ou un réseau d’automatisation du bâtiment. Un conduit est une voie de communication contrôlée entre des zones, assortie d’un trafic autorisé et de mesures de protection définis. Chaque zone se voit attribuer un niveau de sécurité cible fondé sur l’évaluation des risques, et l’écart entre le niveau cible et le niveau atteint devient un élément visible et gouvernable. La figure ci-dessous résume la séquence du point de vue de la direction.

Figure 55 : gouverner la segmentation au moyen de zones et de conduits

La valeur de cette approche pour la gouvernance tient à ce qu’elle convertit une consigne abstraite (« segmentez le réseau ») en décisions explicites que les gestionnaires peuvent approuver et auditer : quels actifs vont ensemble, quelles communications sont autorisées et pourquoi, à quel niveau d’attaquant chaque zone doit résister et qui accepte le risque résiduel lorsque la cible ne peut pas encore être atteinte. Elle permet aussi une protection différenciée. Des contrôles qui seraient inacceptables dans une zone de sécurité fonctionnelle, comme l’application automatique des correctifs ou le balayage actif, peuvent être tout à fait appropriés dans une zone de supervision ou orientée vers les affaires.

Le moindre privilège pour les personnes, les fournisseurs et les machines

Le principe du moindre privilège s’applique aux personnes, aux fournisseurs, aux comptes de service, aux machines et aux intégrations. Les comptes d’accès à distance, les identifiants des fournisseurs, les postes de travail d’ingénierie, les consoles de gestion, les API et les connecteurs infonuagiques devraient être limités à ce qu’exige une finalité approuvée. L’accès privilégié aux automates, aux systèmes de sécurité, à l’automatisation des bâtiments, aux dispositifs médicaux ou aux systèmes de production devrait être très restreint, fortement authentifié, limité dans le temps lorsque c’est faisable et surveillé. Les disciplines relatives aux identités présentées au chapitre 10 — gestion des accès privilégiés, processus d’arrivées, de mutations et de départs, et revue périodique des accès — s’appliquent ici, bien que souvent au moyen d’outils propres aux TO.

En TO, le moindre privilège protège plus que des données. Il empêche les modifications non autorisées des processus physiques, des points de consigne, de la logique de commande, des paramètres de sécurité et des micrologiciels. Un fournisseur qui doit diagnostiquer un seul variateur n’a pas besoin d’un accès permanent à l’ensemble du réseau de l’usine. Un serveur d’historisation qui recueille des lectures n’a pas besoin d’un accès en écriture aux automates. Une plateforme d’analyse qui transmet en continu des données de capteurs vers le nuage devrait être conçue de façon que rien dans le nuage ne puisse renvoyer de commandes vers la zone de commande, à moins que cette capacité ait été explicitement conçue, approuvée et protégée.

La présomption de compromission et les limites de la vérification systématique à la manière des TI

La présomption de compromission est le principe de réalisme. Les architectures devraient être conçues en partant du principe qu’un appareil, un compte, une voie d’accès de fournisseur, un poste de travail ou une intégration finira par être compromis — au moyen d’identifiants par défaut, d’hameçonnage, d’un micrologiciel vulnérable, d’un fournisseur compromis ou d’un déplacement latéral à partir des TI. La gouvernance devrait donc exiger des conceptions qui limitent la portée d’une compromission, détectent les comportements anormaux et préservent la capacité de fonctionner de façon sûre en mode dégradé. Dans les environnements de TO patrimoniaux, il peut s’agir de la position la plus réaliste, car il n’est pas faisable de remplacer à court terme chaque actif vulnérable.

Les principes de vérification systématique, que l’ébauche de la publication NIST SP 800-82 Rev. 4 intègre maintenant aux orientations sur les TO, soutiennent cette position, mais doivent être adaptés. La vérification continue et l’application fine des politiques sont précieuses aux frontières des TO ainsi que pour l’accès à distance et l’accès administratif; à l’intérieur d’une boucle de commande où le temps est critique, l’ajout d’étapes d’authentification ou de dépendances envers des services d’identité externes peut lui-même créer un risque pour la sécurité des personnes et la disponibilité. Le guide conjoint Secure Connectivity Principles for OT (2026) présente les choix de connectivité comme des états finaux souhaitables plutôt que comme des exigences minimales, ce qui constitue une position de gestion sensée : fixer une orientation, établir les priorités en fonction des conséquences et consigner les raisons lorsque l’état final ne peut pas encore être atteint.

Les gestionnaires devraient poser régulièrement quelques questions d’architecture :

- Les réseaux opérationnels sont-ils segmentés en zones fondées sur les conséquences, avec des conduits et des responsables documentés?
- Un actif de TO ou de l’IdO peut-il être joint directement à partir d’Internet et, le cas échéant, qui l’a approuvé et pourquoi?
- Tous les accès des fournisseurs et tous les accès administratifs passent-ils obligatoirement par un point d’accès contrôlé et journalisé?
- Une zone touchée peut-elle être isolée rapidement sans créer de condition dangereuse, et cela a-t-il été testé?
- Les opérations essentielles pourraient-elles se poursuivre si certaines parties de l’environnement n’étaient plus dignes de confiance?
La segmentation limite la propagation, le moindre privilège limite l’utilisation abusive, et la présomption de compromission prépare l’organisation à détecter, à contenir et à fonctionner de façon sûre dans des conditions défavorables.

## Gouvernance des correctifs et du changement sous contraintes opérationnelles

Une tension centrale de la gouvernance en TO tient au fait que l’application des correctifs et les mises à niveau entrent en concurrence avec la disponibilité, la sécurité des personnes, la validation et la continuité. En TI, l’application des correctifs perturbe les activités, mais reste généralement gérable. En TO, un correctif peut exiger un arrêt de production, la supervision du fournisseur, des essais de sécurité fonctionnelle, une recertification ou la validation que la modification ne changera pas un procédé physique. Certains systèmes n’ont qu’une seule fenêtre de maintenance par année. Cela ne signifie pas que l’on peut ignorer les correctifs. Cela signifie que l’application des correctifs doit être gouvernée plutôt qu’imposée mécaniquement ou reportée indéfiniment.

Priorisation des vulnérabilités fondée sur les risques

Une organisation mature dispose d’un processus structuré pour repérer les vulnérabilités qui touchent ses actifs de TO et d’IdO, évaluer leur pertinence opérationnelle, prioriser les corrections, choisir entre l’application d’un correctif et des contrôles compensatoires, documenter la décision et réexaminer le risque résiduel au fil du temps. La question n’est pas simplement « pouvons-nous appliquer le correctif? », mais « quel est le risque de l’appliquer, quel est le risque de le reporter, et qu’est-ce qui réduit l’exposition pendant que nous décidons? ». Le rapport technique IEC TR 62443-2-3 décrit comment les propriétaires d’actifs et les fournisseurs peuvent collaborer à la gestion des correctifs, y compris la qualification des correctifs par le fournisseur avant leur application.

La priorisation devrait combiner plusieurs facteurs plutôt que de reposer sur un score unique :

- Exposition. L’actif est-il accessible depuis Internet, depuis les TI ou par des connexions de fournisseurs, ou seulement depuis une zone bien contrôlée?
- Exploitation. Existe-t-il des preuves d’exploitation active, comme une inscription au catalogue KEV (vulnérabilités exploitées connues) de la CISA ou un avis du Centre pour la cybersécurité?
- Conséquence. Que pourrait faire un attaquant avec l’actif, compte tenu de sa zone et du procédé qu’il contrôle?
- Gravité. Qu’indique l’évaluation de la gravité technique, par exemple selon le CVSS v4.0 (voir le chapitre 8)?
- Faisabilité. Un correctif testé et approuvé par le fournisseur est-il disponible, et quand aura lieu la prochaine fenêtre sûre?
Selon cette approche, une vulnérabilité touchant une passerelle d’accès à distance ou un poste de travail d’ingénierie exposé à Internet peut justifier une intervention d’urgence, alors qu’une faille théoriquement grave dans un capteur isolé, situé au cœur d’une zone bien protégée, peut raisonnablement attendre le prochain arrêt planifié.

Contrôles compensatoires et exceptions documentées

Lorsque des correctifs sont reportés, des contrôles compensatoires doivent être définis et mis en œuvre, et non simplement présumés. Il peut s’agir de resserrer les règles des conduits, de bloquer des protocoles ou des ports précis, de désactiver les services inutilisés, de restreindre ou de suspendre l’accès des fournisseurs, d’accroître la surveillance de l’actif touché, d’appliquer des correctifs virtuels au moyen de la prévention des intrusions lorsque cela peut se faire sans danger, ou d’accélérer le remplacement. Le report d’un correctif ne doit pas devenir une acceptation informelle du risque. Il devrait donner lieu à une décision documentée qui précise le responsable du risque, la justification, les contrôles compensatoires, la date de réexamen et les conditions qui déclencheraient une remontée, comme une exploitation publique ou un changement de l’exposition. Ces registres constituent une part essentielle des éléments probants que les auditeurs et les organismes de réglementation s’attendront à obtenir.

Intégrité de la configuration et changement contrôlé

La gestion du changement est aussi importante que l’application des correctifs, car les changements eux-mêmes créent des risques. Les modifications apportées à la logique de commande, aux points de consigne, au micrologiciel, aux paramètres de sécurité fonctionnelle, aux règles réseau et aux configurations des postes de travail d’ingénierie peuvent influer sur les opérations physiques; un changement mal testé peut arrêter la production ou créer des conditions dangereuses, et un changement malveillant peut le faire délibérément. De nombreuses industries de procédés appliquent déjà une procédure de gestion du changement (MOC) pour les modifications physiques; l’étendre aux changements ayant une incidence sur la cybersécurité est généralement plus efficace que de créer un comité de changement parallèle, calqué sur le modèle des TI.

La gouvernance devrait exiger que les changements en TO soient autorisés, évalués sous l’angle du risque, documentés, testés lorsque c’est faisable, communiqués aux équipes concernées et réversibles. La logique de commande, les fichiers de configuration, les versions de micrologiciel et les paramètres réseau devraient faire l’objet d’une configuration de référence et d’une gestion des versions, de sorte que les changements non autorisés ou inattendus puissent être détectés. Les changements d’urgence devraient être permis au besoin, mais examinés après coup et consignés au dossier. L’intégrité de la configuration est l’objectif ultime : l’organisation devrait pouvoir déterminer en tout temps si la configuration en exécution d’un système critique correspond à la configuration approuvée, et rétablir avec confiance un état réputé sain. Sans cette capacité, elle peut ignorer si un système se comporte comme prévu, si un incident a modifié la logique de commande ou si la reprise a rétabli un état sûr.

Une organisation mature ne choisit pas aveuglément entre la sécurité et la disponibilité; elle gouverne le compromis et le réexamine à mesure que les conditions évoluent.

## Sécurité des personnes et cybersécurité : une seule conversation sur le risque

Dans de nombreux environnements cyberphysiques, une discipline bien établie de sécurité fonctionnelle existe déjà, avec ses propres normes, spécialistes et organismes de réglementation. L’ingénierie de la sécurité fonctionnelle, encadrée par la norme IEC 61508 (Functional safety of electrical/electronic/programmable electronic safety-related systems, édition 2.0 de 2010, une troisième édition étant en préparation au moment de la rédaction) et par des normes sectorielles dérivées comme la norme IEC 61511 pour les industries de procédés, conçoit des systèmes de protection de façon à réduire la probabilité de défaillance dangereuse à un niveau tolérable. Les ingénieurs en sécurité fonctionnelle raisonnent en matière de dangers, de niveaux d’intégrité de sécurité et de couches de protection indépendantes. Les spécialistes de la cybersécurité raisonnent en matière de menaces, de vulnérabilités et de contrôles. Les deux disciplines ont historiquement travaillé séparément, et cette séparation constitue elle-même un risque.

Pourquoi la sécurité fonctionnelle et la cybersécurité doivent se rejoindre

L’analyse de sécurité traditionnelle suppose que les défaillances sont aléatoires ou découlent d’erreurs humaines prévisibles. Elle suppose rarement un adversaire intelligent qui neutralise délibérément plusieurs couches de protection à la fois, par exemple en désactivant un système instrumenté de sécurité tout en poussant le procédé au-delà de ses limites et en supprimant les alarmes. Des attaques contre des systèmes de sécurité ont montré que ce n’est pas une hypothèse théorique. À l’inverse, des contrôles de sécurité conçus sans l’apport de la sécurité fonctionnelle peuvent créer des dangers : un verrouillage automatique qui empêche un opérateur d’accéder à une interface homme-machine (IHM) pendant une urgence, ou un agent installé sur un terminal qui retarde le temps de réponse d’un automate.

Le rapport technique IEC TR 63069:2019 propose un cadre d’intégration de la sécurité fonctionnelle et de la cybersécurité dans l’automatisation industrielle. Son idée centrale est que la cybersécurité protège la fonction de sécurité : un environnement de sécurité entourant les systèmes liés à la sécurité doit être établi et maintenu afin que les hypothèses de sécurité restent valables. La norme IEC 61511 exige elle aussi une évaluation des risques de cybersécurité du système instrumenté de sécurité. Pour les gestionnaires, il en découle que l’évaluation des risques cyberphysiques devrait être un exercice conjoint, où les spécialistes de la sécurité fonctionnelle et de la cybersécurité examinent les mêmes scénarios de danger, et que les cybermenaces devraient être prises en compte explicitement dans les analyses des dangers liés aux procédés et dans les dossiers de sécurité.

Interfaces pratiques entre les disciplines

L’intégration n’exige pas une nouvelle bureaucratie. Elle exige quelques interfaces délibérées :

- Analyse conjointe des dangers et des menaces. Les analyses des dangers liés aux procédés et les évaluations des cyberrisques examinent les mêmes scénarios à conséquences graves, chaque discipline remettant en question les hypothèses de l’autre.
- Fonctions de sécurité protégées. Les systèmes instrumentés de sécurité se trouvent dans leur propre zone, avec le niveau de sécurité cible le plus élevé, une connectivité minimale et, si possible, des couches de protection non programmables ou câblées comme ultime rempart.
- Contrôle partagé des changements. Les changements ayant une incidence sur la cybersécurité des systèmes liés à la sécurité passent par le même processus de gestion du changement que les changements physiques.
- Critères d’incident combinés. Les échelles de gravité des incidents intègrent les conséquences sur la sécurité des personnes et sur l’environnement, et les responsables de la sécurité fonctionnelle font partie de la structure d’intervention en cas de cyberincident.
- Rapports communs. Les dirigeants voient le risque lié à la sécurité des personnes et le cyberrisque des procédés critiques dans une seule vue plutôt que dans des rapports concurrents.
Les dispositifs médicaux illustrent le même principe. Les fabricants de dispositifs appliquent la norme ISO 14971 de gestion des risques pour la sécurité, et la FDA ainsi que Santé Canada s’attendent désormais à ce que la gestion des risques de cybersécurité l’alimente. Les hôpitaux qui réunissent le génie biomédical, la direction clinique et la cybersécurité pour gouverner les appareils connectés appliquent la même idée du côté des utilisateurs.

La cybersécurité protège le dossier de sécurité. Si un adversaire peut invalider les hypothèses sur lesquelles repose l’ingénierie de la sécurité fonctionnelle, la performance de l’organisation en matière de sécurité ne vaut pas plus que sa cybersécurité.

## Détection, intervention et résilience lorsque les systèmes sont dégradés

La surveillance, la détection, l’intervention en cas d’incident et la continuité en TO et dans les systèmes cyberphysiques ne peuvent pas simplement être calquées sur les TI. Les pratiques d’entreprise reposent souvent sur des agents installés sur les terminaux, le balayage actif, le confinement rapide et des changements fréquents. Bien des environnements de TO ne peuvent pas tolérer ces pratiques. Isoler un système peut interrompre la production, des fonctions de sécurité ou des services essentiels, et la reprise doit établir que l’on peut de nouveau se fier au procédé physique. Le chapitre 12 traite de la gestion des incidents et de la continuité en général; la présente section porte sur ce qui diffère dans les contextes cyberphysiques.

Surveillance passive et éléments à surveiller

La surveillance en TO repose généralement sur la surveillance passive du réseau au moyen d’outils qui comprennent les protocoles industriels, sur les journaux des systèmes de commande et des serveurs d’historisation lorsqu’ils existent, sur une surveillance étroite des postes de travail d’ingénierie et sur un contrôle ciblé des voies d’accès à distance. L’objectif est de détecter les comportements pouvant indiquer une compromission, une manipulation dangereuse ou un changement non autorisé : communications inattendues entre appareils, commandes inhabituelles comme le téléchargement de programmes dans un automate, modifications anormales des points de consigne, sessions à distance non autorisées, nouveaux appareils, trafic traversant des zones qui devraient être séparées ou modifications de la logique de commande. MITRE ATT&CK for ICS aide à déterminer en priorité les comportements à détecter, en faisant correspondre les techniques connues des adversaires à des activités observables.

La surveillance de l’IdO se heurte à des difficultés semblables, à plus grande échelle. Bien des appareils ont une journalisation limitée et dépendent de nuages de fournisseurs; la surveillance porte donc souvent sur le comportement réseau, l’identité des appareils, les schémas de communication, les événements d’authentification, l’état du micrologiciel et les connexions à des services externes. Le but n’est pas de recueillir tous les signaux, mais d’obtenir une visibilité suffisante pour repérer les appareils non gérés, les activités anormales, l’usage abusif des accès de fournisseurs et les voies menant vers des zones sensibles. Le centre des opérations de sécurité (COS) (chapitre 7) a besoin du contexte de la TO pour interpréter ces signaux : une alerte concernant un téléchargement dans un automate signifie peu de chose si l’on ignore si un changement planifié était en cours.

Décisions d’intervention et points de contrôle de sécurité fonctionnelle

En TO et dans les systèmes cyberphysiques, l’intervention en cas d’incident doit associer dès le départ la sécurité fonctionnelle, l’ingénierie, la gestion des installations et la direction des opérations, car les mesures techniques de confinement ont des conséquences physiques. Déconnecter un segment de réseau, révoquer l’accès d’un fournisseur, arrêter un automate, bloquer un protocole ou isoler un poste de travail d’ingénierie peut être nécessaire, mais chacune de ces mesures peut toucher la production, l’équipement, les soins aux patients ou les services publics. La gouvernance doit donc définir à l’avance les droits décisionnels en situation de crise, les voies de remontée et les points de contrôle de sécurité fonctionnelle, c’est-à-dire les moments où une personne qualifiée, responsable des opérations ou de la sécurité fonctionnelle, doit confirmer qu’une mesure de confinement ou de reprise ne créera pas de danger.

Un modèle d’intervention mature précise qui peut autoriser le confinement, qui détermine si les opérations peuvent se poursuivre en toute sécurité en mode dégradé, qui communique avec les fournisseurs, les organismes de réglementation et le public, et qui décide d’activer les procédures de continuité. Dans les environnements à risque élevé, les incidents sont gérés par une structure de crise conjointe cyber-opérations qui réunit la cybersécurité, l’ingénierie de la TO, les opérations, la sécurité fonctionnelle, les affaires juridiques, les communications et les décideurs de la haute direction. De nombreuses organisations fixent aussi à l’avance des critères d’arrêt préventif : les conditions dans lesquelles elles arrêteront un procédé parce qu’elles ne peuvent plus se fier à sa surveillance ou à sa commande, même s’il n’est pas prouvé que la TO elle-même est compromise. Prendre cette décision à l’avance, au bon niveau, évite à la fois la poursuite téméraire des activités et l’arrêt précipité sous l’effet de la panique.

Reprise sûre et opérations minimales viables

Un point essentiel pour les gestionnaires est que les incidents de TO exigent une reprise sûre, et non une simple restauration des systèmes. En TI, la reprise consiste à réinstaller les images des systèmes, à restaurer les données, à réinitialiser les identifiants et à confirmer l’éradication. En TO, la reprise consiste aussi à valider que les lectures des capteurs sont fiables, que la logique de commande n’a pas été modifiée, que les systèmes de sécurité fonctionnent, que les configurations correspondent aux configurations de référence réputées saines, que l’équipement est dans un état sûr et que les opérateurs peuvent confirmer que le redémarrage ne créera pas de nouveau risque. Cela prend du temps et doit être planifié avant la crise.

La résilience commence par la définition des opérations minimales viables : les procédés, fonctions de sécurité, installations et services qui doivent se poursuivre en situation de stress cybernétique, et à quel niveau réduit. Les procédures de repli manuel en font partie. Lorsque c’est faisable, un personnel formé devrait pouvoir exploiter les installations en toute sécurité sans automatisation complète, au moyen de modes de commande locale, d’échantillonnages et d’inspections manuels, de moyens de communication de rechange, de procédures sur papier et d’étapes d’arrêt préapprouvées. Ces procédures doivent être réalistes. Un procédé manuel qui n’existe que sur papier, qui n’a jamais été doté en personnel ni exercé et qui dépend d’employés retraités ne constitue pas une capacité de résilience.

Sauvegardes, pièces de rechange, fournisseurs et exercices

Les stratégies de sauvegarde doivent couvrir bien plus que les données d’affaires. Les organisations devraient protéger la logique des automates, les fichiers de configuration, les images de micrologiciel, les configurations des postes de travail d’ingénierie, les configurations des appareils réseau, les paramètres de sécurité fonctionnelle, les recettes et les données d’étalonnage, les stocker hors ligne ou de façon immuable, tester périodiquement leur restauration et les rattacher à des procédures de rétablissement d’un état réputé sain. Pour les parcs d’appareils de l’IdO, la résilience consiste à pouvoir isoler rapidement des catégories d’appareils, renouveler les identifiants à l’échelle des parcs, révoquer les certificats compromis et remplacer des appareils à grande échelle, ce qui favorise les modèles normalisés et la gestion centralisée. Les pièces de rechange critiques, notamment des automates de rechange préchargés avec une logique réputée saine, peuvent raccourcir considérablement la reprise.

Les dépendances envers les fournisseurs doivent être traitées avant un incident. Bien des systèmes de TO ne peuvent pas être restaurés sans le soutien du fournisseur; les contrats et les plans devraient donc préciser comment joindre les fournisseurs, quels accès leur seront accordés et par quels canaux, quels éléments probants ils doivent fournir et ce qui se passe si le fournisseur lui-même est indisponible ou compromis. Enfin, la résilience doit être mise à l’épreuve : exercices sur table avec les opérations et la haute direction, tests techniques de reprise, exercices d’arrêt en toute sécurité, répétitions d’exploitation manuelle et exercices conjoints avec les principaux fournisseurs. Une organisation résiliente sait ce qui doit se poursuivre, ce qui peut être dégradé, qui a le pouvoir de décider, à quelles configurations elle peut se fier et à quel moment il est sûr de revenir à la normale.

## Environnements cyberphysiques intégrant l’IA : usage abusif des modèles, empoisonnement des données et automatisation dangereuse

À mesure que les organisations intègrent l’analytique et l’intelligence artificielle (IA) dans leurs opérations, la surface de risque cyberphysique s’étend. L’IA soutient la maintenance prédictive, la détection d’anomalies, l’optimisation des procédés, l’ordonnancement, la gestion de l’énergie, la coordination de robots, l’automatisation des entrepôts, les jumeaux numériques, l’inspection de la qualité et l’aide à la décision en matière de sécurité fonctionnelle. Dans ces contextes, la préoccupation de gouvernance ne porte pas seulement sur l’exactitude d’un modèle. Elle porte sur la possibilité qu’un attaquant, un initié, un fournisseur ou une défaillance de système manipule le modèle, ses données ou son environnement d’exploitation de manière à produire des effets physiques préjudiciables. Le chapitre 18 traite de la sécurité de l’IA de façon complète; la présente section porte sur ce qui change lorsque l’IA touche le monde physique.

Empoisonnement des données, usage abusif des modèles et automatisation dangereuse

Trois risques méritent une attention particulière :

- L’empoisonnement des données est un risque de crédibilité. Si un attaquant peut influencer les flux de capteurs, les journaux, les registres de maintenance, les données d’entraînement ou les boucles de rétroaction, le modèle peut apprendre le mauvais schéma. La maintenance prédictive peut alors manquer un roulement défaillant; la détection d’anomalies peut apprendre à considérer une attaque comme normale. Dans les systèmes cyberphysiques, des données corrompues deviennent un problème de sécurité des personnes, de fiabilité et de continuité, autant qu’un problème de qualité des données.
- L’usage abusif des modèles est un risque d’intégrité. Si un attaquant peut manipuler les entrées, les paramètres, les seuils, les requêtes, les fichiers ou les API d’un modèle, ou encore ses chaînes de déploiement, le système peut produire des recommandations dangereuses ou supprimer des avertissements légitimes tout en paraissant fonctionner normalement.
- L’automatisation dangereuse est un risque pour la sécurité des personnes. Lorsque les résultats de l’IA sont exécutés automatiquement, ou que l’approbation humaine devient une formalité, le système d’IA devient un point de contrôle à fort effet de levier. Le risque n’est pas que l’IA soit intrinsèquement dangereuse; c’est que l’automatisation peut amplifier les erreurs ou la manipulation plus vite que les humains ne peuvent réagir.
Un autre risque, plus discret, est la complaisance envers l’automatisation : les opérateurs qui en viennent à se fier aux recommandations de l’IA sans vérification indépendante perdent peu à peu les compétences et la conscience de la situation dont ils auraient besoin lorsque le modèle se trompe. Ce risque est directement lié à la discussion sur le repli manuel présentée plus haut.

Délimiter ce que l’IA est autorisée à faire

La gouvernance devrait commencer par fixer des limites explicites au pouvoir de l’IA. Les gestionnaires devraient distinguer quatre niveaux : les systèmes qui se contentent d’éclairer les décisions, les systèmes qui recommandent des actions, les systèmes qui amorcent des actions sous réserve d’une approbation humaine et les systèmes qui exécutent des actions automatiquement. Plus la conséquence physique potentielle est grave, plus les exigences doivent être strictes en matière d’approbation humaine, de verrouillages de sécurité indépendants, de validation, de journalisation, de tests dans des conditions défavorables et de capacité de neutralisation manuelle. Fait essentiel, l’IA ne devrait jamais être placée en position de pouvoir neutraliser ou contourner une fonction instrumentée de sécurité; les couches de protection conçues selon les normes IEC 61508 et IEC 61511 doivent demeurer indépendantes de la couche d’optimisation.

Les systèmes opérationnels intégrant l’IA exigent aussi des contrôles d’intégrité des données : valider les entrées critiques des capteurs au regard de la plausibilité physique et de sources redondantes, surveiller les schémas de données anormaux, protéger les jeux de données d’entraînement et d’exploitation, contrôler l’accès aux chaînes de traitement des données et veiller à ce que les résultats des modèles puissent être rattachés à des sources fiables. Lorsque des modèles dépendent de plateformes de fournisseurs, d’analytique infonuagique ou de données externes, ces dépendances doivent figurer dans l’évaluation des risques et dans la gouvernance des tiers. La règle architecturale énoncée plus haut s’applique avec une force particulière : un service d’analytique infonuagique ne devrait pas pouvoir envoyer de commandes dans une zone de commande, à moins que cette voie n’ait été explicitement conçue, approuvée et protégée.

Gérer les modèles comme des actifs opérationnels

Les modèles, les requêtes, les seuils, les ensembles de caractéristiques, les jeux de données d’entraînement, les API et les chaînes de déploiement devraient être traités comme des actifs opérationnels, avec des responsables, une gestion des versions, un contrôle d’accès, une approbation des changements, des tests, une surveillance, des procédures de retour arrière et un réexamen périodique. Un modèle qui influe sur les opérations physiques ne devrait pas être réentraîné, réajusté ou redéployé de manière informelle. Dans les contextes à conséquences graves, la gouvernance de l’IA commence à ressembler à l’ingénierie de la sécurité fonctionnelle : l’organisation définit un comportement prévisible, des limites d’exploitation sûres, des modes de défaillance, des procédures de neutralisation par une personne et l’imputabilité. Il devrait être clair qui a approuvé le modèle, qui est responsable du risque opérationnel, qui surveille la performance, qui enquête sur les résultats anormaux, qui peut suspendre l’action automatisée et quels éléments probants sont conservés lorsque des décisions influencées par l’IA touchent les opérations. L’automatisation fondée sur l’IA doit être digne de confiance, délimitée, surveillée et soumise à l’imputabilité avant d’être autorisée à influer sur les opérations physiques.

## Gouverner le risque lié à la TO et à l’IdO dans la pratique : mesures, scénario détaillé et questions

Les sections précédentes ont décrit les éléments constitutifs de la gouvernance de la TO, de l’IdO et des systèmes cyberphysiques. La présente section montre comment ils s’articulent dans la mesure, dans un processus décisionnel réaliste et dans les questions que les gestionnaires et les conseils d’administration devraient poser.

Indicateurs clés de risque et éléments probants

Les programmes de TO et d’IdO ont besoin d’un petit ensemble d’indicateurs qui indiquent aux dirigeants si l’exposition diminue et si l’organisation pourrait faire face à un incident. Les indicateurs devraient être rattachés aux énoncés d’appétence pour le risque et de tolérance au risque (chapitre 4) et présentés par niveau de criticité plutôt qu’en chiffres bruts. Voici quelques exemples utiles :

- Couverture de l’inventaire. La proportion de sites ou de zones à conséquences graves disposant d’un inventaire des actifs validé et à jour, avec des responsables désignés.
- Exposition à Internet. Le nombre d’actifs de TO ou d’IdO directement accessibles depuis Internet, avec une cible de zéro pour les systèmes de commande.
- Contrôle de l’accès à distance. La proportion des accès à distance des fournisseurs et des administrateurs qui passent par le point d’accès contrôlé, avec authentification multifacteur (AMF) et journalisation des sessions.
- Santé des exceptions. Le nombre d’exceptions ouvertes visant des actifs à conséquences graves, la proportion de celles dont la date d’échéance est dépassée et l’âge moyen des exceptions.
- Exposition aux vulnérabilités exploitées. Les vulnérabilités exploitées connues touchant des actifs à conséquences graves qui ne font l’objet ni d’un correctif ni de contrôles compensatoires documentés.
- Capacité de reprise. La proportion d’automates et de postes de travail critiques disposant de sauvegardes hors ligne réputées saines et testées, ainsi que la date du dernier test de restauration réussi.
- Actifs non pris en charge. Le nombre d’actifs critiques dont le soutien du fournisseur a pris fin, avec des plans de remplacement financés.
- Préparation éprouvée par des exercices. La tenue ou non d’un exercice conjoint cyber-opérations au cours de la dernière année, et la fermeture ou non des constatations qui en ont découlé.
Ces indicateurs produisent des éléments probants autant que de l’information utile. Les registres d’inventaire, les schémas des zones et des conduits, les registres des exceptions, les journaux d’accès, les résultats des tests de sauvegarde et les rapports d’exercice sont les documents que l’audit interne, les organismes de réglementation, les assureurs et les organismes de certification demanderont. Concevoir le programme de façon qu’il les produise systématiquement permet d’éviter la conformité de façade, c’est-à-dire une documentation impressionnante, assemblée juste avant un audit, qui n’a guère de lien avec le contrôle exercé au quotidien.

Mise en situation : un service municipal d’eau québécois

La Régie intermunicipale de l’eau des Deux-Rives est une régie intermunicipale fictive de l’eau qui dessert environ 90 000 résidents dans trois municipalités du Québec. Elle exploite une usine de traitement de l’eau potable, une station d’épuration des eaux usées, onze postes de pompage et réservoirs éloignés, ainsi qu’un système SCADA (système de contrôle et d’acquisition de données) installé par étapes depuis 2006. L’environnement de TO est entretenu par une petite équipe interne d’opérateurs et par un intégrateur régional, tandis que le service des TI partagé des municipalités gère les systèmes de bureau. Après l’alerte AL25-016 du Centre pour la cybersécurité, qui décrivait la manipulation de valeurs de pression d’eau dans une installation canadienne, le conseil d’administration de la Régie a posé au directeur général une question simple : « Cela pourrait-il se produire ici, et comment le saurions-nous? »

Le directeur général a désigné le surintendant de l’usine comme responsable imputable du risque pour la TO du traitement et de la distribution, le conseiller en sécurité du directeur des TI municipal étant chargé de la cybersécurité et l’intégrateur participant à titre contractuel. Une démarche de découverte de six semaines a combiné un capteur réseau passif, un examen de la documentation de l’intégrateur et des inspections physiques de chaque poste. Les constatations étaient préoccupantes, mais typiques. Deux postes de pompage éloignés avaient des IHM accessibles depuis Internet par des modems cellulaires installés par un ancien entrepreneur; l’une d’elles utilisait encore le mot de passe par défaut du fabricant. L’intégrateur maintenait un compte de réseau privé virtuel (RPV) toujours actif, partagé par plusieurs techniciens. Les serveurs SCADA fonctionnaient avec un système d’exploitation qui n’était plus pris en charge, et les sauvegardes de la logique des automates n’existaient que sur un ordinateur portable au bureau de l’intégrateur. Le dosage du chlore à l’usine de traitement pouvait être réglé depuis l’IHM du SCADA dans des limites étendues, bien qu’une alarme de niveau haut indépendante et câblée demeurât en place.

L’équipe a ensuite mené une évaluation des risques fondée sur des scénarios selon la méthode des chapitres 5 et 6. Le scénario le mieux coté combinait une menace plausible (des acteurs opportunistes balayant Internet à la recherche d’IHM exposées), une vulnérabilité confirmée (une IHM accessible depuis Internet avec des identifiants par défaut) et un impact grave (perte de pression de distribution dans un secteur, accompagnée d’un avis d’ébullition de l’eau, d’un risque possible de contamination par refoulement et de conséquences réglementaires et réputationnelles). Un deuxième scénario envisageait un rançongiciel se propageant du réseau des TI municipal vers des serveurs SCADA partageant un même segment de réseau non segmenté, ce qui forcerait un passage préventif à l’exploitation manuelle. Un troisième examinait la manipulation des points de consigne de dosage. Chaque scénario était exprimé en termes opérationnels — heures sans visibilité à distance, résidents touchés, avis réglementaires déclenchés — plutôt que seulement en scores de gravité technique.

L’énoncé d’appétence pour le risque du conseil, adopté l’année précédente, indiquait que la Régie n’avait « aucune appétence pour les cyberrisques susceptibles de compromettre la salubrité de l’eau potable et une très faible appétence pour les risques susceptibles d’interrompre le service plus de quatre heures ». Au regard de cet énoncé, le premier scénario était manifestement intolérable. Le directeur général a autorisé des mesures immédiates dans les limites du budget existant : les modems cellulaires ont été retirés et remplacés par une seule passerelle d’accès à distance contrôlée, dotée de l’AMF; les identifiants par défaut ont été changés partout; le compte partagé de l’intégrateur a été remplacé par des comptes nominatifs à durée limitée, approuvés pour chaque session; et la logique des automates ainsi que les configurations SCADA ont été sauvegardées sur des supports hors ligne conservés à l’usine, un premier test de restauration ayant lieu en présence du surintendant.

Les décisions plus importantes ont été soumises au conseil, avec des options. L’équipe a proposé une conception en zones et conduits conforme à la norme IEC 62443-3-2, séparant la zone de commande de l’usine de traitement, la zone SCADA de distribution, les commandes de dosage liées à la sécurité et le réseau des TI municipal, avec une zone démilitarisée surveillée entre elles; une mise à niveau de la plateforme SCADA répartie sur deux exercices budgétaires; et une surveillance passive de la TO intégrée au dispositif municipal d’opérations de sécurité. Comme la mise à niveau du SCADA ne pouvait pas être terminée avant dix-huit mois, le surintendant a formellement accepté le risque résiduel lié aux serveurs non pris en charge, assorti de contrôles compensatoires — isolement strict, liste d’applications autorisées et surveillance renforcée —, ce qui a été consigné comme une exception à échéance de douze mois, réexaminée chaque trimestre. Le renouvellement du contrat de l’intégrateur a ajouté des exigences tirées de la norme IEC 62443-2-4, notamment des conditions d’accès à distance, l’avis de vulnérabilités et des obligations de sauvegarde.

Enfin, la Régie s’est exercée. Un exercice sur table réunissant des opérateurs, le directeur général, la personne responsable des communications, l’intégrateur et une personne représentant la direction régionale de santé publique a permis de parcourir le scénario de rançongiciel et a révélé que personne n’avait le pouvoir d’ordonner, la nuit, un passage préventif à l’exploitation manuelle. La matrice des droits décisionnels a été mise à jour afin que le chef de quart de garde puisse prendre cette décision et en informer le surintendant par la suite. Le conseil reçoit désormais un rapport trimestriel d’une page qui présente l’exposition à Internet (maintenant nulle), la part des sessions à distance passant par la passerelle contrôlée (maintenant la totalité), les exceptions ouvertes et leurs dates d’échéance, l’état des tests de sauvegarde et l’avancement du projet de segmentation. Le service d’eau n’est pas invulnérable, mais ses risques sont maintenant visibles, assumés par des responsables, priorisés et défendables.

Questions que les gestionnaires et les conseils d’administration devraient poser

Les questions suivantes aident les dirigeants et les administrateurs à vérifier si les risques liés à la TO, à l’IdO et aux systèmes cyberphysiques sont réellement gouvernés :

- Disposons-nous d’un inventaire à jour de nos actifs de TO et d’IdO, et chaque actif à conséquences graves a-t-il un responsable métier et un dépositaire technique désignés?
- Avons-nous défini, en termes opérationnels, ce qui ne doit pas tomber en panne, et nos priorités d’investissement et d’architecture en tiennent-elles compte?
- Certains de nos systèmes de commande ou de nos appareils connectés sont-ils accessibles depuis Internet, et qui a approuvé chaque exception?
- Comment l’accès à distance des fournisseurs et des intégrateurs est-il approuvé, authentifié, limité, journalisé et réexaminé?
- Quelles références reconnues — ISA/IEC 62443, NIST SP 800-82, NIST IR 8259, règles sectorielles — sous-tendent notre programme, et quels régimes juridiques (NIS2, le CRA, la LPCE du Canada, les règles sur les dispositifs médicaux) s’appliquent à nous ou à nos fournisseurs?
- Nos normes et nos contrats d’approvisionnement exigent-ils, pour les produits connectés, des fonctions de sécurité dès la conception, des nomenclatures logicielles (SBOM), des périodes de soutien déclarées et l’avis de vulnérabilités?
- Combien d’exceptions sont ouvertes pour des actifs à conséquences graves, combien sont échues, et qui a accepté le risque résiduel?
- La sécurité fonctionnelle et la cybersécurité évaluent-elles conjointement les scénarios à conséquences graves, et les systèmes instrumentés de sécurité sont-ils protégés en tant que zone de plus haute priorité?
- Qui a le pouvoir d’isoler ou d’arrêter un système opérationnel pendant un cyberincident, y compris la nuit et la fin de semaine?
- Pourrions-nous fonctionner en toute sécurité en mode dégradé ou manuel, et quand l’avons-nous exercé pour la dernière fois?
- Disposons-nous de sauvegardes hors ligne, testées et réputées saines, de la logique des automates et des configurations?
- Qu’est-ce que les systèmes d’IA et d’analytique sont autorisés à faire dans nos opérations, et l’un d’eux peut-il agir sur des procédés physiques sans approbation humaine?

## Synthèse : rendre le risque cyberphysique gouvernable

La sécurité de la TO, de l’IdO et des systèmes cyberphysiques constitue un domaine de gouvernance, parce qu’elle oblige les organisations à affronter des risques qui ne sont pas purement numériques. Dans ces environnements, un cyberévénement peut perturber les opérations, endommager l’équipement, compromettre la sécurité des personnes, interrompre des services publics, nuire à l’environnement ou mettre au jour la dépendance de l’organisation envers les fournisseurs, l’accès à distance, les appareils non gérés et des systèmes patrimoniaux fragiles. La question n’est pas seulement de savoir si les systèmes sont techniquement vulnérables, mais si l’organisation peut repérer les risques qui touchent son fonctionnement dans le monde physique, en confier la responsabilité, les maîtriser, les surveiller et s’en remettre.

Les leçons du chapitre forment une suite cohérente. La visibilité et la criticité viennent en premier : une organisation ne peut pas gouverner des actifs qu’elle n’a pas repérés, classés selon leurs conséquences, rattachés à des procédés et confiés à des responsables imputables, et elle ne peut pas établir de priorités sans définir ce qui ne doit pas tomber en panne. L’imputabilité doit traverser les fonctions : le risque lié à la TO persiste lorsqu’aucun groupe n’a la responsabilité de l’ensemble du tableau; le modèle opérationnel doit donc définir les droits décisionnels concernant l’accès des fournisseurs, l’acceptation du risque, l’isolement d’urgence, le report des correctifs, le déploiement des appareils et le retour à l’exploitation, et doit les mettre à l’épreuve avant une crise.

La prévention commence à l’approvisionnement et à l’architecture. Une fois les appareils intégrés aux chaînes de production, aux bâtiments, aux hôpitaux ou aux réseaux de services publics, les options de sécurité deviennent limitées et coûteuses. Les exigences d’achat par niveau, les clauses contractuelles et la planification du cycle de vie déterminent si les équipes futures hériteront de systèmes gouvernables ou d’exceptions permanentes. Les zones et les conduits, le moindre privilège et une conception fondée sur la présomption de compromission déterminent si une compromission isolée reste confinée ou se propage aux systèmes les plus importants. La gouvernance des correctifs et du changement transforme ensuite des contraintes inévitables en décisions documentées et limitées dans le temps, appuyées par des contrôles compensatoires et par l’intégrité de la configuration.

La sécurité des personnes et la cybersécurité relèvent d’une même conversation. Là où l’ingénierie de la sécurité fonctionnelle existe, la cybersécurité doit protéger les hypothèses sur lesquelles elle repose, et les spécialistes de la sécurité fonctionnelle doivent contribuer à façonner les contrôles de sécurité afin que ceux-ci ne créent pas de nouveaux dangers. La détection et l’intervention doivent être adaptées aux réalités opérationnelles, avec des points de contrôle de sécurité fonctionnelle et des critères d’arrêt convenus à l’avance, et la reprise doit être sûre plutôt que simplement rapide. La résilience — opérations minimales viables, repli manuel, sauvegardes hors ligne réputées saines, pièces de rechange, ententes avec les fournisseurs et exercices — détermine si un incident devient une crise. À mesure que l’IA et l’automatisation avancée entrent dans les opérations, la même rigueur doit s’étendre aux données, aux modèles et aux pouvoirs accordés aux systèmes automatisés.

L’environnement externe renforce ces leçons : des normes comme ISA/IEC 62443 et NIST SP 800-82, des règles sur les produits comme le règlement sur la cyberrésilience (CRA) et des lois sur les infrastructures comme la directive NIS2 et la LPCE définissent de plus en plus ce à quoi ressemble une décision raisonnable et défendable.

Pour les gestionnaires des technologies d’affaires, la sécurité de la TO, de l’IdO et des systèmes cyberphysiques est peut-être le domaine où la cybersécurité a le plus de conséquences et la plus grande visibilité. C’est là qu’un approvisionnement déficient crée des décennies d’exposition, qu’une imputabilité floue retarde l’intervention, que des accès non gérés créent un risque opérationnel et qu’une planification déficiente de la résilience transforme un incident technique en crise publique. Les gestionnaires n’ont pas besoin de configurer chaque automate, capteur, robot ou appareil intelligent. Ils doivent veiller à ce que l’organisation sache de quoi elle dépend, ce qui ne doit pas tomber en panne, qui a le pouvoir d’agir, comment le risque résiduel est accepté et réexaminé, et comment les opérations demeureront sûres et fiables en situation de stress cybernétique. C’est ce que signifie rendre le risque cyberphysique gouvernable.

## Résumé du chapitre

La technologie opérationnelle, l’IdO et les systèmes cyberphysiques font passer la cybersécurité de l’information aux opérations physiques, à la sécurité des personnes, à l’équipement, à l’environnement et aux services essentiels. La question de gouvernance passe de « quelle information pourrait être perdue? » à « que pourrait-il se produire physiquement, à qui et à quelle vitesse? ». Ces environnements sont chroniquement vulnérables parce qu’ils se situent entre les frontières de responsabilité, fonctionnent pendant des décennies, se prêtent mal aux correctifs et dépendent des fournisseurs. Le chapitre soutient que les gestionnaires n’ont pas à maîtriser les protocoles industriels, mais qu’ils doivent rendre le risque cyberphysique encadrable : savoir ce qui existe et ce qui ne doit pas tomber en panne, désigner des responsables imputables et des droits décisionnels, contrôler le risque dès l’approvisionnement et dans l’architecture, protéger le dossier de sécurité fonctionnelle et se préparer à une reprise sécuritaire.

Points clés à retenir

- La portée devrait inclure tout système dont la compromission pourrait perturber les opérations, compromettre la sécurité des personnes, endommager l’équipement, nuire à l’environnement, exposer des données ou créer une voie non gérée vers l’entreprise.
- En TO, la sécurité des personnes, la disponibilité et l’intégrité de la commande l’emportent habituellement sur la confidentialité, et le cyberrisque se mesure en conséquences physiques, pas seulement en données perdues.
- Les longs cycles de vie, la capacité limitée d’appliquer des correctifs, la responsabilité fragmentée et l’accès contrôlé par les fournisseurs font de « nous ne pouvons pas appliquer de correctif » une contrainte qui exige une décision de risque explicite, et non une réponse de gouvernance.
- La série ISA/IEC 62443, la publication NIST SP 800-82, le CRA, la directive NIS2, la LPCE du Canada et les règles sur les dispositifs médicaux ne remplacent pas le jugement sur le risque, mais ils définissent ce qui est désormais raisonnable et défendable.
- La gouvernance commence par un inventaire tenu à jour des actifs et des dépendances, des niveaux de criticité fondés sur la conséquence et une définition opérationnelle de ce qui ne doit pas tomber en panne.
- Quatre niveaux de responsabilité et des droits décisionnels écrits, convenus avant une crise, évitent les retards et la dilution de la responsabilité quant à l’accès des fournisseurs, à l’isolement, au report des correctifs et au redémarrage.
- L’approvisionnement est un contrôle de cybersécurité de premier plan : des exigences minimales par niveau, le coût sur le cycle de vie, la revue d’architecture et les clauses contractuelles déterminent des décennies d’exposition.
- Les zones et conduits transforment « segmenter le réseau » en décisions approuvables, avec des niveaux de sécurité cibles fixés comme des choix d’appétence pour le risque et le moindre privilège appliqué aux personnes, aux fournisseurs et aux machines.
- L’application des correctifs doit être encadrée selon l’exposition, l’exploitation, la conséquence, la gravité et la faisabilité, avec des contrôles compensatoires documentés et l’intégrité de la configuration assurée par la gestion du changement.
- La sécurité protège le dossier de sécurité fonctionnelle : les spécialistes de la sécurité fonctionnelle et de la cybersécurité devraient analyser les mêmes scénarios de danger, et les systèmes instrumentés de sécurité se situent dans la zone la mieux protégée.
- L’intervention en TO exige des points de contrôle de sécurité fonctionnelle, des critères d’arrêt préventif convenus à l’avance, des opérations minimales viables, un mode manuel de repli exercé et des sauvegardes hors ligne, réputées saines, de la logique des automates.
- L’IA en exploitation doit être limitée par des niveaux d’autorité explicites, ne doit jamais contourner les fonctions de sécurité et devrait être gérée comme un actif opérationnel; les ICR et les exercices montrent si l’exposition diminue.
Termes clés

- Technologie opérationnelle (TO) — Matériel et logiciels qui surveillent, commandent ou automatisent des processus, des appareils et des infrastructures physiques, comme les systèmes SCADA, les DCS, les automates programmables, les IHM et les systèmes instrumentés de sécurité.
- Internet des objets (IdO) — Appareils connectés à un réseau qui combinent au moins un capteur ou un actionneur avec une connectivité, sont souvent embarqués et sont habituellement déployés en grand nombre.
- Internet industriel des objets (IIoT) — Application du modèle de l’IdO aux opérations, comme des capteurs de pompe sans fil, des compresseurs connectés au nuage et des passerelles en périphérie qui transmettent en continu les données de l’usine.
- Système cyberphysique — Système intégré dans lequel les logiciels, les capteurs, les réseaux et l’informatique régissent un comportement physique au moyen de boucles de rétroaction, de sorte qu’une compromission numérique peut modifier des résultats physiques.
- Système instrumenté de sécurité (SIS) — Système de protection qui amène un processus à un état sûr lorsque des limites sont dépassées, conçu selon des normes de sécurité fonctionnelle comme l’IEC 61511.
- Zone — Dans la série ISA/IEC 62443, regroupement d’actifs qui partagent des exigences de sécurité et des conséquences communes, auquel est attribué un niveau de sécurité cible.
- Conduit — Dans la série ISA/IEC 62443, voie de communication contrôlée entre des zones, assortie d’un trafic autorisé et de mesures de protection définis.
- Niveau de sécurité (SL 1 à SL 4) — Expression, dans la série ISA/IEC 62443, de la protection en fonction de l’attaquant auquel une zone doit résister, de la violation occasionnelle aux attaquants sophistiqués disposant de ressources importantes.
- Cartographie de la criticité — Classement des systèmes selon les conséquences de leur perturbation ou de leur manipulation, en partant des pires résultats crédibles pour remonter jusqu’aux systèmes qui pourraient les produire.
- Contrôles compensatoires — Mesures comme des règles de conduit plus strictes, un accès restreint des fournisseurs, une surveillance accrue ou des correctifs virtuels, qui réduisent l’exposition lorsqu’un correctif doit être reporté.
- Gestion du changement (MOC) — Procédure des industries de procédés qui sert à autoriser et à évaluer les modifications physiques, et qui devrait être étendue aux changements de la logique de commande et des configurations ayant une incidence sur la cybersécurité.
- Intégrité de la configuration — Capacité de confirmer que la configuration en service d’un système critique correspond à la configuration de référence approuvée et de restaurer avec confiance un état réputé sain.
- Point de contrôle de sécurité fonctionnelle — Moment de l’intervention en cas d’incident où un responsable qualifié de l’exploitation ou de la sécurité fonctionnelle confirme qu’une mesure de confinement ou de reprise ne créera pas de danger.
- Opérations minimales viables — Processus, fonctions de sécurité et services qui doivent se poursuivre sous une cybermenace, et niveau réduit auquel ils doivent fonctionner.
- Nomenclature logicielle (SBOM) — Liste des composants logiciels d’un produit, que l’approvisionnement peut exiger des fournisseurs et que les organismes de réglementation exigent de plus en plus des fabricants.

## Questions de révision

Questions à développement

1. Le chapitre affirme que les environnements de TO et d’IdO sont chroniquement vulnérables en partie parce que « chaque groupe agit raisonnablement dans les limites de son propre mandat, et l’organisation dans son ensemble se retrouve avec des risques dont personne n’est responsable ». Analysez ce problème et concevez un modèle opérationnel, y compris des droits décisionnels, qui le résoudrait.

2. Évaluez l’affirmation selon laquelle l’approvisionnement est « un contrôle de cybersécurité de premier plan » en TO et en IdO. À l’aide du chapitre, proposez des exigences minimales par niveau et des clauses contractuelles pour deux achats très différents, comme un robot de ligne de production et un réseau de capteurs d’occupation couvrant tout un bâtiment.

3. Un directeur d’usine soutient qu’un automate qui n’est plus pris en charge ne peut pas recevoir de correctif et que le dossier devrait donc être fermé. Faites la critique de cette position et expliquez comment la gouvernance des correctifs et du changement, les contrôles compensatoires et la rigueur des exceptions présentés dans le chapitre devraient s’appliquer.

4. Appliquez le chapitre à une organisation de votre choix qui exploite de la TO ou de l’IdO (ou à la Régie intermunicipale de l’eau des Deux-Rives). Définissez ce qui ne doit pas tomber en panne, déterminez les deux scénarios aux conséquences les plus lourdes, et recommandez des mesures immédiates et des décisions relevant du conseil d’administration qui soient cohérentes avec une appétence pour le risque énoncée.

5. Évaluez l’énoncé selon lequel « la sécurité protège le dossier de sécurité fonctionnelle ». Expliquez comment l’ingénierie de la sécurité fonctionnelle et la cybersécurité devraient collaborer, et comment le même principe s’applique lorsque des systèmes d’IA sont autorisés à recommander ou à exécuter des actions sur des processus physiques.

Questions à choix multiples

Choisissez la meilleure réponse. Les réponses figurent à l’annexe « Réponses aux questions à choix multiples ».

1. Comment la publication NIST SP 800-82 Rev. 3 a-t-elle modifié la terminologie employée pour les systèmes de contrôle industriels?

A. Elle a élargi « systèmes de contrôle industriels » à « technologie opérationnelle » pour refléter un usage plus large

B. Elle a remplacé « technologie opérationnelle » par « systèmes cyberphysiques » pour tous les secteurs

C. Elle a limité sa portée à l’électricité et aux pipelines réglementés par des organismes fédéraux

D. Elle a fusionné l’IdO et la TO en une seule catégorie appelée Internet industriel des objets

2. Selon le test de portée du chapitre, quelle paire de réponses « oui » place habituellement un système dans le niveau à forte conséquence?

A. Connectivité et responsabilité

B. Influence physique et conséquence

C. Gérabilité et données

D. Données et connectivité

3. Quel énoncé reflète le mieux le point de vue du chapitre sur les priorités dans les environnements opérationnels?

A. La confidentialité est sans importance, car les données de TO n’ont aucune valeur pour les attaquants

B. La confidentialité l’emporte toujours sur la disponibilité, car les recettes sont des secrets commerciaux

C. La sécurité des personnes, la disponibilité des processus et l’intégrité de la commande l’emportent habituellement sur la confidentialité

D. La disponibilité ne compte que pour les appareils IdO, et non pour les automates liés à la sécurité

4. Un ingénieur d’usine affirme qu’un automate « ne peut pas recevoir de correctif ». Selon le chapitre, comment cet énoncé devrait-il être traité?

A. Comme une réponse définitive qui ferme le dossier de vulnérabilité de cet actif

B. Comme la preuve que l’automate est sûr parce qu’il est isolé par conception

C. Comme une raison de transférer la responsabilité de l’actif au service central des TI

D. Comme une contrainte qui exige une décision de risque explicite, des contrôles compensatoires et un plan

5. Quel type de risque de la taxonomie du chapitre peut permettre à un système de continuer à fonctionner tout en produisant des résultats dangereux ou trompeurs?

A. La perturbation opérationnelle causée par le chiffrement d’un rançongiciel

B. La perte de visibilité causée par des inventaires incomplets

C. Le risque lié à l’accès à distance des fournisseurs au moyen de comptes partagés

D. La manipulation de l’intégrité des points de consigne, des lectures, de la logique ou des alarmes

6. Selon le chapitre, quel est l’apport distinctif de la série ISA/IEC 62443?

A. Elle fixe des délais obligatoires de déclaration des incidents pour les exploitants d’infrastructures essentielles

B. Elle remplace les normes de sécurité fonctionnelle comme l’IEC 61508 pour les procédés industriels

C. Elle attribue des exigences aux propriétaires d’actifs, aux fournisseurs de services et intégrateurs, et aux fournisseurs de produits

D. Elle ne s’applique qu’aux appareils IdO grand public vendus sur le marché européen

7. Pourquoi le chapitre présente-t-il le choix d’un niveau de sécurité cible (SL 1 à SL 4) pour une zone comme une question managériale?

A. Il détermine la période de garantie que les fournisseurs doivent offrir en vertu de la loi

B. Il définit l’attaquant auquel la zone doit résister, ce qui est une décision d’appétence pour le risque

C. Il fixe le nombre maximal d’appareils pouvant être placés dans chaque zone

D. Il est attribué automatiquement par des organismes de certification comme ISASecure

8. Selon le règlement européen sur la cyberrésilience tel que décrit dans le chapitre, à partir de quand s’appliquent les principales obligations, comme les exigences essentielles, les périodes de soutien et le marquage CE?

A. À partir du 11 décembre 2027

B. À partir du 10 décembre 2024

C. À partir du 11 septembre 2026

D. À partir du 17 octobre 2024

9. Un service municipal d’eau québécois demande si la Loi sur la protection des cybersystèmes essentiels (LPCE) du Canada s’applique à lui. D’après le chapitre, quelle est la réponse la plus juste?

A. Oui, car la LPCE vise tous les exploitants de systèmes d’eau potable au Canada

B. Probablement pas, car la LPCE vise les exploitants désignés des secteurs sous réglementation fédérale

C. Oui, car la LPCE s’applique à toutes les organisations qui utilisent des systèmes SCADA

D. Non, car la LPCE n’a pas encore reçu la sanction royale au Parlement

10. Pourquoi le chapitre recommande-t-il de combiner la surveillance passive, l’examen des configurations, les inspections sur le terrain et les dossiers pour constituer un inventaire de la TO?

A. Une analyse active agressive peut perturber des appareils de TO fragiles

B. La directive NIS2 exige des méthodes passives pour toutes les entités essentielles

C. Les inspections sur le terrain rendent inutile la mise à jour continue de l’inventaire

D. La documentation des fournisseurs est toujours complète et à jour pour l’équipement patrimonial

11. En TO et dans les systèmes cyberphysiques, comment le chapitre indique-t-il que la criticité devrait principalement être définie?

A. Selon la sensibilité des données que le système stocke et traite

B. Selon le prix d’achat et le coût de remplacement de l’équipement

C. Selon le nombre d’utilisateurs qui se connectent au système chaque jour

D. Selon les conséquences d’une perturbation ou d’une manipulation, en remontant à partir des pires résultats crédibles

12. Pendant un incident de TO, l’équipe de sécurité veut isoler un réseau, l’exploitation craint une perte de production et un fournisseur exige un accès à distance non vérifié. Quelle lacune de gouvernance le chapitre relève-t-il?

A. L’organisation n’avait pas assez d’agents de terminal sur ses automates

B. Le contrat du fournisseur ne comportait pas de clause pénale assez élevée

C. Les droits décisionnels n’avaient pas été explicitement convenus et documentés avant l’incident

D. Le COS n’avait pas reçu de droits d’administration sur le réseau de TO

13. Pourquoi le chapitre qualifie-t-il l’approvisionnement de contrôle de cybersécurité de premier plan en TO et en IdO?

A. Les équipes d’approvisionnement sont la seule fonction autorisée à appliquer des correctifs aux appareils

B. Les fournisseurs sont légalement responsables de tous les incidents une fois le contrat signé

C. Le levier de gouvernance est le plus fort avant l’achat, car les appareils peuvent créer un risque pendant vingt ans

D. Les règles d’achat satisfont automatiquement aux exigences de la série ISA/IEC 62443

14. Quel arrangement d’accès à distance correspond le mieux aux attentes du chapitre à l’égard des fournisseurs de TO?

A. Un compte RPV toujours actif, partagé par les techniciens du fournisseur pour accélérer le soutien

B. Un modem cellulaire installé par le fournisseur pour que l’accès ne dépende pas des réseaux de l’entreprise

C. Un accès permanent à tout le réseau de l’usine pour éviter les retards en cas de panne

D. Approuvé par session, protégé par AMF, acheminé par un point d’accès contrôlé, restreint et journalisé

15. Au sens de l’ISA/IEC 62443-3-2, qu’est-ce qu’un conduit?

A. Une voie de communication contrôlée entre des zones, assortie d’un trafic autorisé et de mesures de protection définis

B. Un regroupement d’actifs qui partagent des exigences de sécurité et des conséquences communes

C. Une couche de sécurité câblée qui amène un processus à un état sûr en cas de défaillance

D. Un programme de certification des cycles de développement sécurisé des fournisseurs

16. Deux vulnérabilités ont le même score CVSS élevé : l’une touche une passerelle d’accès à distance exposée à Internet, l’autre un capteur isolé au cœur d’une zone bien protégée. En appliquant le chapitre, quelle priorisation est la plus défendable?

A. Appliquer immédiatement les deux correctifs, car des scores CVSS égaux exigent un traitement égal

B. Agir d’urgence sur la passerelle; le capteur peut attendre le prochain arrêt planifié

C. Corriger d’abord le capteur, car il est plus près du processus physique

D. Reporter les deux jusqu’à l’arrêt annuel pour éviter toute perturbation de la production

17. Quelle est l’idée centrale de l’IEC TR 63069:2019 telle que présentée dans le chapitre?

A. La sécurité protège la fonction de sécurité fonctionnelle, de sorte que les hypothèses de sécurité demeurent valides

B. Les systèmes de sécurité fonctionnelle devraient être connectés à Internet pour une surveillance en temps réel

C. Les contrôles de sécurité devraient remplacer avec le temps les couches de protection indépendantes

D. La sécurité fonctionnelle et la cybersécurité devraient être gérées par des équipes distinctes, avec des rapports distincts

18. Quel est l’objectif de critères d’arrêt préventif convenus à l’avance dans l’intervention en cas d’incident de TO?

A. Garantir que la production ne s’arrête jamais pendant un cyberincident ou une panne

B. Laisser le fournisseur décider seul si l’usine devrait continuer à fonctionner normalement

C. Décider à l’avance quand arrêter un processus auquel on ne peut plus se fier

D. Rendre inutiles les procédures et exercices de repli en mode manuel

19. Un système d’optimisation fondé sur l’IA pourrait ajuster automatiquement un processus d’une façon qui entre en conflit avec une fonction instrumentée de sécurité. Qu’exige le chapitre?

A. L’IA peut outrepasser la fonction de sécurité si sa précision dépasse celle des opérateurs

B. L’IA ne doit jamais outrepasser ni contourner la fonction de sécurité, et les couches de protection doivent demeurer indépendantes

C. La fonction de sécurité devrait être réglée de nouveau pour suivre les points de consigne optimisés par l’IA

D. L’approbation humaine peut être retirée une fois que le modèle a fonctionné de façon sûre pendant un an

20. Dans la mise en situation du service d’eau, l’énoncé d’appétence du conseil exprimait une « très faible appétence » pour les interruptions de plus de quatre heures. Pourquoi le scénario de l’IHM exposée à Internet a-t-il été jugé clairement intolérable?

A. Il présentait le score CVSS le plus élevé de toutes les vulnérabilités découvertes

B. Sa correction aurait coûté davantage que le budget annuel du service

C. L’intégrateur a refusé de soutenir les IHM après le renouvellement du contrat

D. Il menaçait la sécurité de l’eau potable, pour laquelle le conseil avait déclaré n’avoir aucune appétence
